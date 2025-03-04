from tensorflow.keras.metrics import Precision, Recall, CategoricalAccuracy

class Evaluator:
    def __init__(self, model, vectorizer):
        self.model = model
        self.vectorizer = vectorizer

    def evaluate(self, test_data):
        pre, re, acc = Precision(), Recall(), CategoricalAccuracy()
        for X_true, y_true in test_data.as_numpy_iterator():
            yhat = self.model.predict(X_true)
            pre.update_state(y_true.flatten(), yhat.flatten())
            re.update_state(y_true.flatten(), yhat.flatten())
            acc.update_state(y_true.flatten(), yhat.flatten())
        return pre.result().numpy(), re.result().numpy(), acc.result().numpy()

    def predict(self, texts):
        input_text = self.vectorizer(texts)
        predictions = (self.model.predict(input_text) > 0.5).astype(int)
        return predictions