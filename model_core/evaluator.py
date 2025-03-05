from tensorflow.keras.metrics import Precision, Recall, CategoricalAccuracy

class Evaluator:
    def __init__(self, model, vectorizer):
        self.model = model
        self.vectorizer = vectorizer

    def evaluate(self, test_data):
        # Overall metrics across all classes
        pre, re, acc = Precision(), Recall(), CategoricalAccuracy()
        # Per-class metrics
        class_accuracies = [CategoricalAccuracy() for _ in range(6)]  # 6 toxicity classes
        
        for X_true, y_true in test_data.as_numpy_iterator():
            yhat = self.model.predict(X_true)
            
            # Update overall metrics
            pre.update_state(y_true.flatten(), yhat.flatten())
            re.update_state(y_true.flatten(), yhat.flatten())
            acc.update_state(y_true.flatten(), yhat.flatten())
            
            # Update per-class metrics
            for class_idx in range(6):
                class_accuracies[class_idx].update_state(
                    y_true[:, class_idx],
                    yhat[:, class_idx]
                )

        class_results = [acc.result().numpy() for acc in class_accuracies]
        
        return {
            'overall_metrics': {
                'precision': pre.result().numpy(),
                'recall': re.result().numpy(),
                'accuracy': acc.result().numpy()
            },
            'per_class_accuracy': {
                'toxic': class_results[0],
                'severe_toxic': class_results[1],
                'obscene': class_results[2],
                'threat': class_results[3],
                'insult': class_results[4],
                'identity_hate': class_results[5]
            }
        }

    def predict(self, texts):
        input_text = self.vectorizer(texts)
        predictions = (self.model.predict(input_text) > 0.5).astype(int)
        return predictions