import cv2
from ultralytics import YOLO
import numpy as np
import torch
import os
import time
import requests

# טעינת המודל
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f'Using device: {device}')

model = YOLO('best.pt')
model.to(device)

video_path = 'video15.mp4'
if not os.path.exists(video_path):
    raise FileNotFoundError(f"Video file '{video_path}' not found!")

cap = cv2.VideoCapture(video_path)

# רזולוציית עיבוד ותצוגה
PROCESS_WIDTH = 640
PROCESS_HEIGHT = 480

DISPLAY_WIDTH = 640
DISPLAY_HEIGHT = 480

# משתנים
no_hardhat_start_time = None
alert_sent = False

def generate_frames():
    global no_hardhat_start_time, alert_sent

    prev_time = time.time()
    frame_count = 0
    fps = 0

    while True:
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame_small = cv2.resize(frame, (PROCESS_WIDTH, PROCESS_HEIGHT))
        results = model.predict(frame_small, imgsz=640, device=device, verbose=False)
        annotated_frame = frame_small.copy()

        no_hardhat_count = 0  # רק לספור בלי קסדה

        for r in results:
            if r.boxes is not None:
                boxes = r.boxes.xyxy.cpu().numpy()
                classes = r.boxes.cls.cpu().numpy()

                for box, cls_id in zip(boxes, classes):
                    x1, y1, x2, y2 = map(int, box)
                    class_name = model.names[int(cls_id)]

                    if class_name == 'Hardhat':
                        color = (0, 200, 0)  # ירוק (רק למסגרת אם רוצים)
                        label = 'Hardhat'
                        # לא נספור Hardhats
                    elif class_name == 'NO-Hardhat':
                        color = (0, 0, 255)  # אדום אמיתי (BGR)
                        label = 'NO-Hardhat'
                        no_hardhat_count += 1
                    else:
                        color = (200, 200, 200)  # אפור לפריטים אחרים

                    # ציור מסגרת דקה
                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, thickness=1)

                    # טקסט קטן עם רקע חצי שקוף
                    text = label
                    font_scale = 0.5
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    text_size = cv2.getTextSize(text, font, font_scale, 1)[0]
                    text_x = x1
                    text_y = max(y1 - 8, 0)

                    overlay = annotated_frame.copy()
                    cv2.rectangle(overlay, (text_x, text_y - text_size[1] - 6), (text_x + text_size[0] + 6, text_y + 4), color, thickness=cv2.FILLED)
                    alpha = 0.4
                    cv2.addWeighted(overlay, alpha, annotated_frame, 1 - alpha, 0, annotated_frame)

                    cv2.putText(annotated_frame, text, (text_x + 3, text_y),
                                font, font_scale, (255, 255, 255), thickness=1, lineType=cv2.LINE_AA)

        # לוגיקת התראות
        if no_hardhat_count > 0:
            if no_hardhat_start_time is None:
                no_hardhat_start_time = time.time()
            else:
                elapsed = time.time() - no_hardhat_start_time
                if elapsed > 5 and not alert_sent:
                    print(f"🚨 Alert! NO-Hardhat detected for more than 5 seconds.")

                    try:
                        requests.post("http://localhost:5000/api/alert", json={
                            "message": "NO-Hardhat detected for over 5 seconds!",
                            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                        })
                        alert_sent = True
                    except Exception as e:
                        print(f"Failed to send alert: {e}")
        else:
            no_hardhat_start_time = None
            alert_sent = False

        # חישוב FPS
        frame_count += 1
        if frame_count >= 10:
            current_time = time.time()
            elapsed_time = current_time - prev_time
            fps = frame_count / elapsed_time
            frame_count = 0
            prev_time = current_time

        # ציור תיבת מידע חצי שקופה
        info_overlay = annotated_frame.copy()
        cv2.rectangle(info_overlay, (10, 10), (220, 70), (0, 0, 0), thickness=cv2.FILLED)
        alpha_info = 0.4
        cv2.addWeighted(info_overlay, alpha_info, annotated_frame, 1 - alpha_info, 0, annotated_frame)

        # כתיבת מידע
        cv2.putText(annotated_frame, f'No Hardhats: {no_hardhat_count}', (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        cv2.putText(annotated_frame, f'FPS: {fps:.1f}', (20, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

        # קידוד למסירה
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
