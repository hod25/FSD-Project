import cv2
from ultralytics import YOLO
import numpy as np
import torch
import os
import time

# טעינת המודל
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f'Using device: {device}')

model = YOLO('best.pt')
model.to(device)

video_path = 'video5.mp4'
if not os.path.exists(video_path):
    raise FileNotFoundError(f"Video file '{video_path}' not found!")

cap = cv2.VideoCapture(video_path)

# רזולוציית עיבוד ותצוגה - 480p
PROCESS_WIDTH = 640
PROCESS_HEIGHT = 480

DISPLAY_WIDTH = 640
DISPLAY_HEIGHT = 480

def generate_frames():
    prev_time = time.time()
    frame_count = 0
    fps = 0

    while True:
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        # הקטנת פריים
        frame_small = cv2.resize(frame, (PROCESS_WIDTH, PROCESS_HEIGHT))

        # ריצה על התמונה עם YOLO
        results = model.predict(frame_small, imgsz=640, device=device, verbose=False)

        annotated_frame = frame_small.copy()

        hardhat_count = 0
        no_hardhat_count = 0

        for r in results:
            if r.boxes is not None:
                boxes = r.boxes.xyxy.cpu().numpy()
                classes = r.boxes.cls.cpu().numpy()
                confidences = r.boxes.conf.cpu().numpy()

                for box, cls_id, conf in zip(boxes, classes, confidences):
                    x1, y1, x2, y2 = map(int, box)
                    class_name = model.names[int(cls_id)]

                    if class_name == 'Hardhat':
                        color = (0, 255, 0)
                        label = f'Hardhat ({conf:.2f})'
                        hardhat_count += 1
                    elif class_name == 'NO-Hardhat':
                        color = (0, 0, 255)
                        label = f'NO-Hardhat ({conf:.2f})'
                        no_hardhat_count += 1
                    else:
                        color = (255, 255, 255)
                        label = f'{class_name} ({conf:.2f})'

                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(annotated_frame, label, (x1, max(y1 - 10, 0)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # חישוב FPS
        frame_count += 1
        if frame_count >= 10:
            current_time = time.time()
            elapsed_time = current_time - prev_time
            fps = frame_count / elapsed_time
            frame_count = 0
            prev_time = current_time

        # ציור תיבה עליונה להצגת מידע
        cv2.rectangle(annotated_frame, (10, 10), (300, 100), (50, 50, 50), -1)  # רקע אפור
        cv2.putText(annotated_frame, f'Hardhats: {hardhat_count}', (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f'No Hardhats: {no_hardhat_count}', (20, 70),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        cv2.putText(annotated_frame, f'FPS: {fps:.1f}', (20, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

        # קידוד
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

if __name__ == "__main__":
    cv2.namedWindow('Hardhat Detection (480p View)', cv2.WINDOW_NORMAL)
    cv2.resizeWindow('Hardhat Detection (480p View)', DISPLAY_WIDTH, DISPLAY_HEIGHT)

    for frame in generate_frames():
        nparr = np.frombuffer(frame.split(b'\r\n\r\n')[1], np.uint8)
        img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        cv2.imshow('Hardhat Detection (480p View)', img_np)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
