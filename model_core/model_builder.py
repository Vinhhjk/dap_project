from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dropout, Bidirectional, Dense, Embedding
import tensorflow as tf
class ToxicityModel:
    def __init__(self, max_features=200000):
        self.max_features = max_features

    def build_model(self):
        model = Sequential([
            Embedding(self.max_features + 1, 32),
            Bidirectional(LSTM(64, activation='tanh')),
            Dropout(0.3),
            Dense(128, activation='relu'),
            Dropout(0.3),
            Dense(256, activation='relu'),
            Dropout(0.3),
            Dense(128, activation='relu'),
            Dense(6, activation='sigmoid')
        ])
        
        model.compile(
            loss=tf.keras.losses.BinaryCrossentropy(from_logits=False),
            optimizer='Adam'
        )
        return model  
