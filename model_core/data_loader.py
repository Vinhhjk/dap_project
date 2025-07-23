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
        # Add print statements to debug the data shape
        print(f"X shape before vectorization: {X.shape}")
        print(f"y shape: {y.shape}")
        
        self.vectorizer.adapt(X.values)
        vectorized_text = self.vectorizer(X.values)
        
        # Check the vectorized data
        print(f"Vectorized text shape: {vectorized_text.shape}")
        print(f"Max index in vectorized text: {tf.reduce_max(vectorized_text)}")
        
        dataset = tf.data.Dataset.from_tensor_slices((vectorized_text, y))
        dataset = dataset.cache().shuffle(160000, reshuffle_each_iteration=True).batch(self.batch_size).prefetch(8)
        
        # Get the total size of the dataset
        dataset_size = tf.data.experimental.cardinality(dataset).numpy()
        print(f"Dataset size (number of batches): {dataset_size}")
        
        train = dataset.take(int(len(dataset) * .7))
        val = dataset.skip(int(len(dataset) * .7)).take(int(len(dataset) * .2))
        test = dataset.skip(int(len(dataset) * .9)).take(int(len(dataset) * .1))
        return train, val, test, self.vectorizer
