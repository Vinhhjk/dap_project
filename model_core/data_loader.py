import pandas as pd
import tensorflow as tf
from tensorflow.keras.layers import TextVectorization

class DataLoader:
    def __init__(self, data_path, max_features=200000, sequence_length=1800, batch_size=16):
        self.data_path = data_path
        self.max_features = max_features
        self.sequence_length = sequence_length
        self.batch_size = batch_size
        self.vectorizer = TextVectorization(
            max_tokens=self.max_features,
            output_sequence_length=self.sequence_length,
            output_mode='int'
        )

    def load_data(self):
        df = pd.read_csv(self.data_path)
        X = df['comment_text']
        y = df[df.columns[2:]].values
        return X, y

    def preprocess(self, X, y):
        self.vectorizer.adapt(X.values)
        vectorized_text = self.vectorizer(X.values)
        dataset = tf.data.Dataset.from_tensor_slices((vectorized_text, y))
        dataset = dataset.cache().shuffle(160000).batch(self.batch_size).prefetch(8)
        train = dataset.take(int(len(dataset) * .7))
        val = dataset.skip(int(len(dataset) * .7)).take(int(len(dataset) * .2))
        test = dataset.skip(int(len(dataset) * .9)).take(int(len(dataset) * .1))
        return train, val, test, self.vectorizer