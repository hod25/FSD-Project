import cv2
from ultralytics import YOLO
import numpy as np
import torch

# לוודא ש-PyTorch עובד עם GPU
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f'Using device: {device}')

# טוען את המודל עם GPU אם זמין
model = YOLO('best.pt')  # Path to your downloaded model
model.to(device)  # העברת המודל ל-GPU אם זמין

# פותח את המצלמה
cap = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = cap.read()
        if not success:
            break

        # שולח את התמונה ל-GPU
        frame_tensor = torch.from_numpy(frame).to(device)

        # מבצע חיזוי עם המודל ב-GPU
        results = model(frame_tensor)

        # השתמש ב-plot() כדי לצייר את הריבועים על התמונה
        annotated_frame = results[0].plot()  # Plotting annotations on the frame

        # מקודד את התמונה כ-JPEG
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()

        # מחזיר את התמונה בפורמט Multipart לשידור
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
