import cv2
import yolov5

# Load the YOLOv5 model
model = yolov5.load('keremberke/yolov5n-construction-safety')

# Path to the input video file
video_path = 'data/video/test.mp4'

# Path to the output video file
output_path = 'data/video/output_test.mp4'

# Open the video file
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Unable to open video file")
    exit()

# Get video properties
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = int(cap.get(cv2.CAP_PROP_FPS))

# Define the codec and create a VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # 'mp4v' for MP4, 'XVID' for AVI
out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

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

    # Write the frame to the output video
    out.write(annotated_frame)

    # Display the frame (optional)
    cv2.imshow('YOLOv5 Video Stream', annotated_frame)

    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
out.release()
cv2.destroyAllWindows()

print(f"Processed video saved to: {output_path}")
