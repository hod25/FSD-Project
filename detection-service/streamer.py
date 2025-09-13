# ==== FILE: streamer.py ====
import cv2
import torch
import time
import os
import requests
import numpy as np
from ultralytics import YOLO
from pynvml import *
from threading import Thread, Event, Lock
from queue import Queue, Full, Empty
import uuid
from collections import defaultdict

# ================= GPU / Model =================
nvmlInit()
handle = nvmlDeviceGetHandleByIndex(0)

NODE_ALERT_URL = "http://pro-safe.cs.colman.ac.il:5000/api/alert"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"✅ Using device: {device}")

model = YOLO("best.pt").to(device)
model.fuse()

FRAME_WIDTH, FRAME_HEIGHT = 1280, 720
ALERT_DELAY_SECONDS = 3

# ================= Live settings =================
MAX_QUEUE_SIZE = 10
LIVE_FRAME_SKIP = 2
LIVE_QUALITY = 50
LIVE_FRAME_WIDTH, LIVE_FRAME_HEIGHT = FRAME_WIDTH, FRAME_HEIGHT

# ================= Playback control (/video) =================
DEFAULT_SOURCE_FPS = 25.0
# 1.0 = realtime; >1.0 = slow-mo קל
SLOWDOWN_FACTOR = 0.5

# ================= Connection management =================
CONNECTION_TIMEOUT = 30  # seconds
CLEANUP_INTERVAL = 10    # seconds
MAX_CONNECTIONS_PER_URL = 2  # סוגרים את כולם אם עברנו

# RTMP processors global registry
stream_processors = {}

# prevent double-cleanup on shutdown
_cleaned_up = False
_cleaned_up_lock = Lock()


def get_gpu_usage():
    try:
        util = nvmlDeviceGetUtilizationRates(handle)
        return util.gpu
    except Exception:
        return 0


# ---------- Connection Manager ----------
class ConnectionManager:
    """
    ניהול חיבורים לפי URL-KEY. מדיניות:
    אם יש כבר >= MAX_CONNECTIONS_PER_URL חיבורים פעילים לאותו KEY → סוגרים את כולם ומרוקנים, ואז רושמים את החדש.
    תומך ב-url_suffix (סיומת) לצורך בידול "כמעט אותו URL".
    """
    def __init__(self):
        # מבנה: {url_key: {connection_id: connection_info}}
        self.url_connections: dict[str, dict] = defaultdict(dict)
        self.connections_lock = Lock()
        self.cleanup_thread = None
        self.stop_event = Event()

    def start_cleanup_thread(self):
        if self.cleanup_thread is None or not self.cleanup_thread.is_alive():
            self.stop_event.clear()
            self.cleanup_thread = Thread(target=self._cleanup_loop, daemon=True)
            self.cleanup_thread.start()
            print("🧹 Connection cleanup thread started")

    def stop_cleanup_thread(self):
        self.stop_event.set()
        if self.cleanup_thread and self.cleanup_thread.is_alive():
            try:
                self.cleanup_thread.join(timeout=2)
            except Exception:
                pass

    @staticmethod
    def _create_url_key(connection_type, site_id, area_id, suffix: str | None = None):
        # suffix יכול להיות path, stream key, שם קובץ, פרמטרים וכד'
        suffix_part = f"_{suffix}" if suffix else ""
        return f"{connection_type}_{site_id}_{area_id}{suffix_part}"

    def register_connection(self, connection_id, connection_type, site_id, area_id, *, url_suffix: str | None = None):
        url_key = self._create_url_key(connection_type, site_id, area_id, url_suffix)
        now = time.time()
        with self.connections_lock:
            bucket = self.url_connections[url_key]

            # ניקוי "זבל" לא פעיל
            for cid in list(bucket.keys()):
                if not bucket[cid]['active']:
                    bucket.pop(cid, None)

            # כמה פעילים כרגע?
            active_count = sum(1 for info in bucket.values() if info['active'])

            if active_count >= MAX_CONNECTIONS_PER_URL:
                # כמו אצלך – סוגרים את כולם
                print(f"🔄 URL '{url_key}' has {active_count} active connections. Closing all existing connections...")
                for existing_cid, existing_info in list(bucket.items()):
                    existing_info['active'] = False
                    print(f"🔌 Marking connection as inactive: {existing_cid[:8]}")
                # ריקון מלא
                self.url_connections[url_key] = {}
                bucket = self.url_connections[url_key]
                print(f"🧹 All connections for URL '{url_key}' have been cleared")

            # רישום החיבור החדש
            bucket[connection_id] = {
                'type': connection_type,
                'site_id': site_id,
                'area_id': area_id,
                'last_access': now,
                'active': True,
                'url_key': url_key
            }

            active_after = sum(1 for info in bucket.values() if info['active'])
            print(f"📱 New {connection_type} connection registered: {connection_id[:8]}")
            print(f"📊 Active connections for URL '{url_key}': {active_after}")

    def update_access_time(self, connection_id):
        with self.connections_lock:
            for url_key, bucket in self.url_connections.items():
                if connection_id in bucket:
                    bucket[connection_id]['last_access'] = time.time()
                    break

    def is_connection_active(self, connection_id):
        with self.connections_lock:
            for bucket in self.url_connections.values():
                info = bucket.get(connection_id)
                if info:
                    return info['active']
        return False

    def remove_connection(self, connection_id, reason="unknown"):
        with self.connections_lock:
            for url_key, bucket in list(self.url_connections.items()):
                if connection_id in bucket:
                    info = bucket.pop(connection_id)
                    print(f"🔌 Connection removed: {connection_id[:8]} ({info.get('type', 'unknown')}) reason={reason}")
                    if not bucket:
                        self.url_connections.pop(url_key, None)
                        print(f"🗑️ URL '{url_key}' removed (no active connections)")
                    else:
                        active_left = sum(1 for i in bucket.values() if i['active'])
                        print(f"📊 Remaining active connections for URL '{url_key}': {active_left}")
                    break

    def get_all_connections(self):
        with self.connections_lock:
            allc = {}
            for bucket in self.url_connections.values():
                allc.update(bucket)
            return allc

    def _cleanup_loop(self):
        while not self.stop_event.is_set():
            try:
                self._cleanup_timeouts()
                self._cleanup_unused_processors()
            except Exception as e:
                print(f"❌ Cleanup thread error: {e}")
            self.stop_event.wait(CLEANUP_INTERVAL)

    def _cleanup_timeouts(self):
        now = time.time()
        to_expire = []
        with self.connections_lock:
            for url_key, bucket in self.url_connections.items():
                for cid, info in list(bucket.items()):
                    if now - info['last_access'] > CONNECTION_TIMEOUT:
                        to_expire.append(cid)
        for cid in to_expire:
            print(f"⏰ Connection timeout: {cid[:8]}")
            self.remove_connection(cid, reason="timeout")

    def _cleanup_unused_processors(self):
        # נשאיר processors רק אם יש חיבורי live פעילים ל-url הזה
        live_active_keys = set()
        with self.connections_lock:
            for url_key, bucket in self.url_connections.items():
                if url_key.startswith('live_'):
                    if any(info['active'] for info in bucket.values()):
                        # url_key = "live_site_area_suffix?" → נחלץ את החלק אחרי 'live_'
                        parts = url_key.split('_', 1)
                        if len(parts) == 2:
                            # המפתח של processor הוא site_area (בלי הסיומת), נשמר גם עם suffix אם תרצה
                            # כאן נשמור רק site_area (כמו שהיה), כדי לא לפתוח כמה processors לאותו מקור
                            # אם תרצה processor נפרד לכל suffix – החלף ל: live_active_keys.add(parts[1])
                            site_area_suffix = parts[1]
                            site_area = '_'.join(site_area_suffix.split('_')[:2])  # siteid_areaid
                            live_active_keys.add(site_area)

        to_stop = []
        for key in list(stream_processors.keys()):
            if key not in live_active_keys:
                to_stop.append(key)

        for key in to_stop:
            proc = stream_processors.pop(key, None)
            if proc:
                proc.stop()
            print(f"🛑 RTMP processor stopped: {key}")


# Global connection manager
connection_manager = ConnectionManager()
connection_manager.start_cleanup_thread()


# ---------- Frame processing ----------
def process_frame(frame, site_id, area_id, tracking):
    start_time = time.time()
    with torch.no_grad():
        results = model.predict(frame, imgsz=480, device=device, conf=0.4, verbose=False)

    annotated_frame = frame.copy()
    no_hardhat_count = 0

    for r in results:
        boxes_raw = r.boxes
        if boxes_raw is None or boxes_raw.cls is None:
            continue
        boxes = boxes_raw.xyxy.cpu().numpy()
        classes = boxes_raw.cls.cpu().numpy().astype(int)

        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box)
            label = model.names[classes[i]]
            if label == "Hardhat":
                color = (0, 255, 0)
            elif label == "NO-Hardhat":
                color = (0, 0, 255)
                no_hardhat_count += 1
            else:
                color = (255, 255, 255)

            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(annotated_frame, label, (x1, max(y1 - 10, 0)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # alert logic
    if no_hardhat_count > 0:
        now = time.time()
        if tracking['start_time'] is None:
            tracking['start_time'] = now
            tracking['max_count'] = no_hardhat_count
        else:
            tracking['max_count'] = max(tracking['max_count'], no_hardhat_count)

        if now - tracking['start_time'] >= ALERT_DELAY_SECONDS:
            try:
                os.makedirs("temp_images", exist_ok=True)
                filepath = os.path.join("temp_images", f"frame_{int(now)}.jpg")
                cv2.imwrite(filepath, annotated_frame)
                with open(filepath, 'rb') as f:
                    files = {'image': (os.path.basename(filepath), f, 'image/jpeg')}
                    data = {
                        "message": f"{tracking['max_count']} workers without hardhats detected",
                        "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
                        "site_location": site_id,
                        "area_location": area_id,
                        "details": "Multiple workers without safety helmets",
                        "no_hardhat_count": tracking['max_count']
                    }
                    requests.post(NODE_ALERT_URL, data=data, files=files, timeout=5)
            except Exception as e:
                print("❌ Alert send failed:", e)
            finally:
                tracking['start_time'] = None
                tracking['max_count'] = 0
    else:
        tracking['start_time'] = None
        tracking['max_count'] = 0

    return annotated_frame, no_hardhat_count, (time.time() - start_time)


# ---------- /video generator ----------
def generate_frames(site_id: str, area_id: str, connection_id: str = None, url_suffix: str | None = None):
    """
    File-based endpoint: reads video15.mp4 and sends MJPEG.
    Playback throttled to source FPS * SLOWDOWN_FACTOR (slight slow-mo).
    url_suffix מאפשר בידול בין וריאנטים (למשל path/פרמטרים שונים).
    """
    if connection_id is None:
        connection_id = str(uuid.uuid4())

    # ברירת מחדל: שם הקובץ – כדי להבדיל בין /video קבצים שונים אם יש
    if url_suffix is None:
        url_suffix = "video15.mp4"

    connection_manager.register_connection(connection_id, 'video', site_id, area_id, url_suffix=url_suffix)

    cap = None
    try:
        cap = cv2.VideoCapture("video15.mp4")
        if not cap.isOpened():
            print("❌ Failed to open video file")
            return

        tracking = {'start_time': None, 'max_count': 0}
        frame_count, prev_time, fps = 0, time.time(), 0

        src_fps = cap.get(cv2.CAP_PROP_FPS)
        if not src_fps or src_fps <= 0 or np.isnan(src_fps):
            src_fps = DEFAULT_SOURCE_FPS

        target_interval = (1.0 / float(src_fps)) * float(SLOWDOWN_FACTOR)

        while connection_manager.is_connection_active(connection_id):
            loop_start = time.time()

            success, frame = cap.read()
            if not success:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue

            frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
            gpu_usage = get_gpu_usage()

            processed_frame, no_hardhat_count, infer_time = process_frame(frame, site_id, area_id, tracking)

            frame_count += 1
            if frame_count >= 10:
                now = time.time()
                fps = frame_count / (now - prev_time)
                prev_time = now
                frame_count = 0

            cv2.putText(processed_frame, f'FPS: {fps:.1f}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
            cv2.putText(processed_frame, f'No Hardhats: {no_hardhat_count}', (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            cv2.putText(processed_frame, f'GPU Usage: {gpu_usage}%', (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            cv2.putText(processed_frame, f'Infer Time: {infer_time*1000:.1f} ms', (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)

            _, buffer = cv2.imencode('.jpg', processed_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 75])

            connection_manager.update_access_time(connection_id)

            try:
                yield (b"--frame\r\n"
                       b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n")
            except (BrokenPipeError, ConnectionResetError, GeneratorExit):
                break

            # throttle
            elapsed = time.time() - loop_start
            sleep_time = target_interval - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)

    except Exception as e:
        print(f"❌ Video stream error: {e}")
    finally:
        try:
            if cap:
                cap.release()
        except Exception:
            pass
        connection_manager.remove_connection(connection_id, reason="video-end")
        print(f"📹 Video stream ended: {connection_id[:8]}")


# ---------- RTMP Processor ----------
class RTMPStreamProcessor:
    def __init__(self, rtmp_url, site_id, area_id):
        self.rtmp_url = rtmp_url
        self.site_id = site_id
        self.area_id = area_id
        self.frame_queue = Queue(maxsize=MAX_QUEUE_SIZE)
        self.output_queue = Queue(maxsize=MAX_QUEUE_SIZE)
        self.tracking = {'start_time': None, 'max_count': 0}
        self.running = False
        self.frame_count = 0
        self.fps = 0
        self.prev_time = time.time()
        self.capture_thread = None
        self.process_thread = None
        self.last_access = time.time()

    def start(self):
        if self.running:
            return
        self.running = True
        self.capture_thread = Thread(target=self._capture_frames, daemon=True)
        self.process_thread = Thread(target=self._process_frames, daemon=True)
        self.capture_thread.start()
        self.process_thread.start()

    def stop(self):
        self.running = False
        try:
            if self.capture_thread and self.capture_thread.is_alive():
                self.capture_thread.join(timeout=2)
        except Exception:
            pass
        try:
            if self.process_thread and self.process_thread.is_alive():
                self.process_thread.join(timeout=2)
        except Exception:
            pass

    def update_access_time(self):
        self.last_access = time.time()

    def _capture_frames(self):
        cap = cv2.VideoCapture(self.rtmp_url)
        if not cap.isOpened():
            print(f"❌ Failed to open RTMP stream: {self.rtmp_url}")
            self.running = False
            return

        print(f"✅ RTMP stream opened: {self.rtmp_url}")
        frame_skip_counter = 0

        while self.running:
            ret, frame = cap.read()
            if not ret:
                print("⚠️ Failed to read frame from RTMP stream, retrying...")
                time.sleep(0.5)
                cap.release()
                cap = cv2.VideoCapture(self.rtmp_url)
                continue

            frame_skip_counter += 1
            if frame_skip_counter % LIVE_FRAME_SKIP != 0:
                continue

            try:
                frame = cv2.resize(frame, (LIVE_FRAME_WIDTH, LIVE_FRAME_HEIGHT))
                self.frame_queue.put(frame, block=False)
            except Full:
                pass

        try:
            cap.release()
        except Exception:
            pass
        print("📊 RTMP capture thread stopped")

    def _process_frames(self):
        while self.running:
            try:
                frame = self.frame_queue.get(timeout=1.0)
            except Empty:
                continue

            gpu_usage = get_gpu_usage()
            processed_frame, no_hardhat_count, infer_time = process_frame(frame, self.site_id, self.area_id, self.tracking)

            self.frame_count += 1
            if self.frame_count >= 10:
                now = time.time()
                self.fps = self.frame_count / (now - self.prev_time)
                self.prev_time = now
                self.frame_count = 0

            cv2.putText(processed_frame, f'FPS: {self.fps:.1f}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
            cv2.putText(processed_frame, f'No Hardhats: {no_hardhat_count}', (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            cv2.putText(processed_frame, f'GPU: {gpu_usage}%', (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            cv2.putText(processed_frame, f'Infer: {infer_time*1000:.1f}ms', (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)

            try:
                _, buffer = cv2.imencode('.jpg', processed_frame, [int(cv2.IMWRITE_JPEG_QUALITY), LIVE_QUALITY])
                frame_data = buffer.tobytes()
            except Exception:
                blank = np.zeros((LIVE_FRAME_HEIGHT, LIVE_FRAME_WIDTH, 3), np.uint8)
                _, buffer = cv2.imencode('.jpg', blank)
                frame_data = buffer.tobytes()

            try:
                self.output_queue.put(frame_data, block=False)
            except Full:
                try:
                    _ = self.output_queue.get_nowait()
                    self.output_queue.put(frame_data, block=False)
                except Exception:
                    pass

    def get_frame(self):
        self.update_access_time()
        try:
            return self.output_queue.get(timeout=2.0)
        except Empty:
            blank = np.zeros((LIVE_FRAME_HEIGHT, LIVE_FRAME_WIDTH, 3), np.uint8)
            _, buffer = cv2.imencode('.jpg', blank)
            return buffer.tobytes()


# ---------- /live generator ----------
def _extract_stream_suffix(rtmp_url: str) -> str:
    # נסה להוציא את הסיומת מתוך ה-URL (למשל 'stream' מ- .../live/stream)
    try:
        tail = rtmp_url.rstrip('/').split('/')[-1]
        return tail or "stream"
    except Exception:
        return "stream"

def generate_live_stream(site_id: str = "live", area_id: str = "camera",
                         connection_id: str = None, url_suffix: str | None = None):
    """
    Live RTMP endpoint. url_suffix מאפשר בידול לפי stream key/path.
    """
    global stream_processors

    if connection_id is None:
        connection_id = str(uuid.uuid4())

    rtmp_url = "rtmp://127.0.0.1:1935/live/stream"
    # ברירת מחדל לסיומת: ה-stream key מה-URL
    if url_suffix is None:
        url_suffix = _extract_stream_suffix(rtmp_url)

    processor_key = f"{site_id}_{area_id}"  # processor נשאר לפי site/area (כמו שהיה)
    connection_manager.register_connection(connection_id, 'live', site_id, area_id, url_suffix=url_suffix)

    try:
        if processor_key not in stream_processors:
            stream_processors[processor_key] = RTMPStreamProcessor(rtmp_url, site_id, area_id)
            stream_processors[processor_key].start()
            print(f"🚀 New RTMP processor started: {processor_key}")

        processor = stream_processors[processor_key]

        while connection_manager.is_connection_active(connection_id):
            frame_data = processor.get_frame()
            connection_manager.update_access_time(connection_id)

            try:
                yield (b"--frame\r\n"
                       b"Content-Type: image/jpeg\r\n\r\n" + frame_data + b"\r\n")
            except (BrokenPipeError, ConnectionResetError, GeneratorExit):
                break

    except Exception as e:
        print(f"❌ Live stream error: {e}")
    finally:
        connection_manager.remove_connection(connection_id, reason="live-end")
        print(f"📡 Live stream ended: {connection_id[:8]}")


# ---------- Utilities for main.py ----------
def test_rtmp_connection():
    cap = cv2.VideoCapture("rtmp://127.0.0.1:1935/live/stream")
    ok = cap.isOpened()
    if ok:
        _ = cap.read()
    try:
        cap.release()
    except Exception:
        pass
    return ok


def get_connection_stats():
    all_connections = connection_manager.get_all_connections()

    from collections import defaultdict as _dd
    stats_by_type = _dd(int)
    stats_by_url = _dd(int)

    for conn_info in all_connections.values():
        if conn_info['active']:
            stats_by_type[conn_info['type']] += 1
            stats_by_url[conn_info['url_key']] += 1

    return {
        'total_connections': sum(1 for c in all_connections.values() if c['active']),
        'by_type': dict(stats_by_type),
        'by_url': dict(stats_by_url),
        'active_processors': len(stream_processors),
        'max_per_url': MAX_CONNECTIONS_PER_URL,
        'connections': {
            cid[:8]: {
                'type': info['type'],
                'url_key': info['url_key'],
                'site_id': info['site_id'],
                'area_id': info['area_id'],
                'last_access': time.strftime('%H:%M:%S', time.localtime(info['last_access'])),
                'active': info['active']
            }
            for cid, info in all_connections.items()
        }
    }


def cleanup_resources():
    """
    Idempotent cleanup – אפשר לקרוא כמה פעמים בלי להפיל חריגות.
    """
    global _cleaned_up
    with _cleaned_up_lock:
        if _cleaned_up:
            print("🧹 All resources already cleaned up (skip).")
            return
        _cleaned_up = True

    try:
        connection_manager.stop_cleanup_thread()
    except Exception:
        pass

    try:
        for key, processor in list(stream_processors.items()):
            try:
                processor.stop()
            except Exception:
                pass
            print(f"🛑 RTMP processor stopped: {key}")
        stream_processors.clear()
    except Exception:
        pass

    print("🧹 All resources cleaned up")
