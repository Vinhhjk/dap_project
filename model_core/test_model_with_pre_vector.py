import pickle
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import TextVectorization

# Load vectorizer config and vocab
with open('vectorizer.pkl', 'rb') as f:
    config, vocab = pickle.load(f)

vectorizer = TextVectorization.from_config(config)
vectorizer.set_vocabulary(vocab)  # ✅ Key step to avoid "Table not initialized" error

# Load trained model
model = load_model('toxicity.h5')

# Predict sample input
input_text = ["You freaking suck! I am going to hit you."]
vectorized_input = vectorizer(input_text)
predictions = model.predict(vectorized_input)

# Output results
print(f"Prediction: {(predictions > 0.5).astype(int)}")

raw_predictions = model.predict(vectorized_input)
print(f"Raw predictions: {raw_predictions}")