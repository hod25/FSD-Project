import cv2
import yolov5
import numpy as np

# The AI model 
model = yolov5.load('keremberke/yolov5n-construction-safety')

#Open the camera 
cap = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = cap.read()
        if not success:
            break

        # Runing YOLO on the frame 
        results = model(frame)
        annotated_frame = results.render()[0] 

        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
