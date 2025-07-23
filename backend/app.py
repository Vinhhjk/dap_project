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
# Add this near the top of the file with other imports and configurations
# Define class-specific thresholds
THRESHOLDS = [0.5, 0.4, 0.5, 0.3, 0.5, 0.4]
CLASS_NAMES = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']

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
        
        # Print raw predictions before converting to binary
        for text, raw_pred in zip(request.texts, predictions):
            print(f"Comment: {text}")
            print(f"Prediction : {[float(f'{x:.2f}') for x in raw_pred]}")
            print("-" * 50)
        
        # Apply class-specific thresholds instead of fixed 0.5
        binary_predictions = []
        for pred in predictions:
            # Apply each threshold to the corresponding class prediction
            binary_pred = [(float(pred[i]) > THRESHOLDS[i]) for i in range(len(THRESHOLDS))]
            binary_predictions.append([int(x) for x in binary_pred])
        
        # Return predictions with original texts
        return {
            "predictions": [
                {
                    "text": text,
                    "prediction": pred,
                    "raw_scores": [float(f'{x:.4f}') for x in raw_pred],
                    "class_names": CLASS_NAMES
                }
                for text, pred, raw_pred in zip(request.texts, binary_predictions, predictions)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class YouTubeRequest(BaseModel):
    links: List[str]

@app.post("/analyze-youtube/")
async def analyze_youtube_comments(request: YouTubeRequest):
    try:
        all_results = []
        
        for video_url in request.links:
            comments_data = get_comments(video_url)
            regular_comments = comments_data["regular_comments"]
            
            # Process in smaller batches
            batch_size = 32
            all_predictions = []
            all_raw_scores = []
            
            for i in range(0, len(regular_comments), batch_size):
                batch = regular_comments[i:i + batch_size]
                vectorized = vectorizer(batch).numpy()
                batch_predictions = model.predict(vectorized, batch_size=batch_size, verbose=0)
                
                # Store raw scores
                all_raw_scores.extend(batch_predictions.tolist())
                
                # Apply class-specific thresholds
                binary_batch = []
                for pred in batch_predictions:
                    binary_pred = [(float(pred[i]) > THRESHOLDS[i]) for i in range(len(THRESHOLDS))]
                    binary_batch.append([int(x) for x in binary_pred])
                
                all_predictions.extend(binary_batch)
            
            result = {
                "video_url": video_url,
                "stats": {
                    "total_reported": comments_data["total_reported"],
                    "total_fetched": comments_data["total_fetched"],
                    "regular_count": len(regular_comments),
                    "unavailable_count": comments_data["unavailable_count"]
                },
                "comments": [
                    {
                        "text": comment,
                        "prediction": pred,
                        "raw_scores": [float(f'{x:.4f}') for x in raw],
                        "class_names": CLASS_NAMES
                    }
                    for comment, pred, raw in zip(regular_comments, all_predictions, all_raw_scores)
                ]
            }
            all_results.append(result)
            
        return {"results": all_results}
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
