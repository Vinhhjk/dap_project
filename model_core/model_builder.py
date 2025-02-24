from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dropout, Bidirectional, Dense, Embedding

class ToxicityModel:
    def __init__(self, max_features=200000):
        self.max_features = max_features

    def build_model(self):
        model = Sequential([
            Embedding(self.max_features + 1, 32),
            Bidirectional(LSTM(32, activation='tanh')),
            Dense(128, activation='relu'),
            Dense(256, activation='relu'),
            Dense(128, activation='relu'),
            Dense(6, activation='sigmoid')
        ])
        model.compile(loss='BinaryCrossentropy', optimizer='Adam')
        return model
    
    