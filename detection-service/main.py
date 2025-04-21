from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from streamer import generate_frames

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Camera streaming service is running"}

@app.get("/video")
def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")