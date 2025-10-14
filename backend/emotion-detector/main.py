from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import cv2
import numpy as np
from PIL import Image
import io
import torch

# Emotion Recognition
from hsemotion.facial_emotions import HSEmotionRecognizer

# Face Detection
from facenet_pytorch import MTCNN

app = FastAPI(
    title="Emotion Detector API",
    description="An API to detect emotions from facial expressions in real-time via WebSockets.",
    version="0.3.0",
)

# Initialize models
print("Initializing models...")
device = 'cuda' if torch.cuda.is_available() else 'cpu'

# Face detector
mtcnn = MTCNN(keep_all=True, device=device)

# Emotion recognizer
model_name = 'enet_b0_8_best_afew'
fer = HSEmotionRecognizer(model_name=model_name, device=device)

print("Models initialized!")

@app.get("/")
def read_root():
    """
    Root endpoint to check if the API is running.
    """
    return {"message": "Welcome to the Real-time Emotion Detector API!"}

@app.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected to WebSocket.")
    try:
        while True:
            # Receive image data from the client
            data = await websocket.receive_bytes()
            
            # Convert to PIL Image
            img = Image.open(io.BytesIO(data))
            
            # --- 1. Face Detection ---
            boxes, _ = mtcnn.detect(img)
            
            if boxes is not None:
                results = []
                for i, box in enumerate(boxes):
                    face_img = img.crop(box)
                    face_np = np.array(face_img)
                    
                    # --- 2. Emotion Recognition ---
                    emotion, scores = fer.predict_emotions(face_np, logits=False)
                    
                    results.append({
                        "face_id": i,
                        "box": [int(coord) for coord in box],
                        "emotion": emotion,
                        "scores": scores.tolist()
                    })
                
                # Send results back to the client
                await websocket.send_json({"detections": results})
            else:
                # If no face is detected, send an empty list
                await websocket.send_json({"detections": []})

    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        print(f"An error occurred: {e}")
        await websocket.close(code=1011)

# To run this application:
# 1. Make sure you have a virtual environment with the dependencies from requirements.txt installed.
# 2. Run the command: uvicorn main:app --reload
