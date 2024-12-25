import cv2
import yolov5
import os
from datetime import datetime, timedelta

# Load YOLOv5 model
model = yolov5.load('keremberke/yolov5n-construction-safety')

# Use the default webcam (index 0)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Unable to access the webcam")
    exit()

# Directory to save images of people without hardhats
save_dir = "data/images/no_hardhat"
os.makedirs(save_dir, exist_ok=True)

# Dictionary to track detections over time
no_hardhat_tracker = {}

# Threshold time for saving images (10 seconds)
time_threshold = timedelta(seconds=10)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to read frame from webcam")
        break

    # Run YOLOv5 inference
    results = model(frame)

    # Get detections
    detections = results.pandas().xyxy[0]

    current_time = datetime.now()

    # Process each detection
    for _, detection in detections.iterrows():
        label = detection['name']  # Object label
        confidence = detection['confidence']  # Confidence level

        # Check for 'NO-Hardhat' detection
        if label == 'NO-Hardhat' and confidence > 0.5:  # Adjust confidence threshold as needed
            # Use a unique ID for the detected person (e.g., bounding box center coordinates)
            center_x = int((detection['xmin'] + detection['xmax']) / 2)
            center_y = int((detection['ymin'] + detection['ymax']) / 2)
            person_id = f"{center_x}_{center_y}"

            # Check if the person is already being tracked
            if person_id not in no_hardhat_tracker:
                no_hardhat_tracker[person_id] = current_time
            else:
                # Check if 10 seconds have passed
                if current_time - no_hardhat_tracker[person_id] >= time_threshold:
                    timestamp = current_time.strftime("%Y%m%d_%H%M%S%f")
                    save_path = os.path.join(save_dir, f"no_hardhat_{timestamp}.jpg")
                    cv2.imwrite(save_path, frame)
                    # Reset the timer for this person
                    no_hardhat_tracker[person_id] = current_time

    # Remove stale entries from the tracker
    no_hardhat_tracker = {k: v for k, v in no_hardhat_tracker.items() if current_time - v < time_threshold}

    # Render results on the frame
    annotated_frame = results.render()[0]

    # Display the frame
    cv2.imshow('YOLOv5 Webcam Stream', annotated_frame)

    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
