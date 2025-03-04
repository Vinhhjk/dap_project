from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import TextVectorization
import pickle
import numpy as np
from typing import List
from comments_scrapper import get_comments


# Load vectorizer config and vocab instead of the entire object
with open('vectorizer.pkl', 'rb') as f:
    config, vocab = pickle.load(f)

# Rebuild the vectorizer
vectorizer = TextVectorization.from_config(config)
vectorizer.set_vocabulary(vocab)

# Load trained model
model = load_model('toxicity.h5')

# Set up FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    texts: List[str] 

@app.post("/predict/")
async def predict(request: TextRequest):
    try:
        # Handle empty input
        if not request.texts:
            raise HTTPException(status_code=400, detail="No text provided")

        # Vectorize all inputs
        vectorized_texts = vectorizer(request.texts)

        # Make predictions for all texts
        predictions = model.predict(vectorized_texts)

        # Convert predictions to binary and return
        binary_predictions = (predictions > 0.5).astype(int).tolist()
        
        # Return predictions with original texts
        return {
            "predictions": [
                {
                    "text": text,
                    "prediction": pred
                }
                for text, pred in zip(request.texts, binary_predictions)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

class YouTubeRequest(BaseModel):
    links: List[str]

@app.post("/analyze-youtube/")
async def analyze_youtube_comments(request: YouTubeRequest):
    try:
        all_comments = []
        
        # Process each YouTube link
        for video_url in request.links:
            comments = get_comments(video_url)
            if comments:
                all_comments.extend(comments)
        
        if not all_comments:
            raise HTTPException(status_code=400, detail="Could not retrieve comments from any video")

        # Vectorize all comments
        vectorized_comments = vectorizer(all_comments)
        
        # Get predictions
        predictions = model.predict(vectorized_comments)
        binary_predictions = (predictions > 0.5).astype(int).tolist()
        
        # Return results
        return {
            "predictions": [
                {
                    "text": comment,
                    "prediction": pred
                }
                for comment, pred in zip(all_comments, binary_predictions)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
