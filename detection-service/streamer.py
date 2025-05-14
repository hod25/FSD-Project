import cv2
from ultralytics import YOLO
import numpy as np
import torch
import os
import time
import requests

# טעינת המודל
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f'✅ Using device: {device}')

model = YOLO('best.pt').to(device)

video_path = 'video15.mp4'
if not os.path.exists(video_path):
    raise FileNotFoundError(f"❌ Video file '{video_path}' not found!")

cap = cv2.VideoCapture(video_path)

# רזולוציה
PROCESS_WIDTH = 960
PROCESS_HEIGHT = 540

# תזמון התראות
last_alert_time = 0
ALERT_INTERVAL = 5  # שניות

def generate_frames():
    global last_alert_time

    prev_time = time.time()
    frame_count = 0
    fps = 0

    while True:
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame_resized = cv2.resize(frame, (PROCESS_WIDTH, PROCESS_HEIGHT))
        results = model.predict(frame_resized, imgsz=640, device=device, verbose=False)
        annotated_frame = frame_resized.copy()

        no_hardhat_count = 0
        current_time = time.time()

        for r in results:
            if r.boxes is not None:
                boxes = r.boxes.xyxy.cpu().numpy()
                classes = r.boxes.cls.cpu().numpy()

                for box, cls_id in zip(boxes, classes):
                    x1, y1, x2, y2 = map(int, box)
                    class_name = model.names[int(cls_id)]

                    if class_name == 'Hardhat':
                        color = (0, 200, 0)
                        label = 'Hardhat'
                    elif class_name == 'NO-Hardhat':
                        color = (0, 0, 255)
                        label = 'NO-Hardhat'
                        no_hardhat_count += 1
                    else:
                        color = (200, 200, 200)
                        label = class_name

                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
                    text = label
                    font_scale = 0.5
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    text_size = cv2.getTextSize(text, font, font_scale, 1)[0]
                    text_x = x1
                    text_y = max(y1 - 8, 0)

                    overlay = annotated_frame.copy()
                    cv2.rectangle(overlay, (text_x, text_y - text_size[1] - 6), (text_x + text_size[0] + 6, text_y + 4), color, cv2.FILLED)
                    alpha = 0.4
                    cv2.addWeighted(overlay, alpha, annotated_frame, 1 - alpha, 0, annotated_frame)

                    cv2.putText(annotated_frame, text, (text_x + 3, text_y),
                                font, font_scale, (255, 255, 255), 1, cv2.LINE_AA)

        # שליחת התראה כל 5 שניות בזמן שיש הפרות
        if no_hardhat_count > 0 and (current_time - last_alert_time) > ALERT_INTERVAL:
            print(f"🚨 ALERT: {no_hardhat_count} NO-Hardhat detected")
            try:
                requests.post("http://localhost:5000/api/alert", json={
                    "message": f"{no_hardhat_count} NO-Hardhat(s) detected!",
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                })
            except Exception as e:
                print(f"❌ Failed to send alert: {e}")
            last_alert_time = current_time

        # FPS
        frame_count += 1
        if frame_count >= 10:
            now = time.time()
            elapsed = now - prev_time
            fps = frame_count / elapsed
            frame_count = 0
            prev_time = now

        # מידע חצי שקוף
        info_overlay = annotated_frame.copy()
        cv2.rectangle(info_overlay, (10, 10), (260, 70), (0, 0, 0), cv2.FILLED)
        cv2.addWeighted(info_overlay, 0.4, annotated_frame, 0.6, 0, annotated_frame)

        cv2.putText(annotated_frame, f'No Hardhats: {no_hardhat_count}', (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        cv2.putText(annotated_frame, f'FPS: {fps:.1f}', (20, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

        # קידוד למסירה
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
