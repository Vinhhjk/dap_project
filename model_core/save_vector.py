import pickle
import pandas as pd
from tensorflow.keras.layers import TextVectorization

# Rebuild the vectorizer
MAX_FEATURES = 200000
vectorizer = TextVectorization(max_tokens=MAX_FEATURES, output_sequence_length=1800, output_mode='int')
df = pd.read_csv('./jigsaw-toxic-comment-classification-challenge/train.csv/train.csv', encoding='utf-8')
X = df['comment_text']
vectorizer.adapt(X.values)

# Extract config and vocabulary
config = vectorizer.get_config()
vocab = vectorizer.get_vocabulary()

with open('vectorizer.pkl', 'wb') as f:
    pickle.dump((config, vocab), f)
