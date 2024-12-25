import cv2
import yolov5

# Load the YOLOv5 model
model = yolov5.load('keremberke/yolov5n-construction-safety')

# Path to the video file
video_path = 'data/video/test.mp4'

# Open the video file
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Unable to open video file")
    exit()

# Loop through frames
while True:
    ret, frame = cap.read()
    if not ret:
        print("End of video or error reading the video file")
        break

    # Run YOLOv5 inference
    results = model(frame)

    # Render results on the frame
    annotated_frame = results.render()[0]

    # Display the frame
    cv2.imshow('YOLOv5 Video Stream', annotated_frame)

    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
