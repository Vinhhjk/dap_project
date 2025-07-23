from tensorflow.keras.metrics import Precision, Recall, AUC
import numpy as np

class Evaluator:
    def __init__(self, model, vectorizer, thresholds=None):
        self.model = model
        self.vectorizer = vectorizer
        self.thresholds = thresholds if thresholds else [0.5] * 6  # Default threshold 0.5 for all classes

    def evaluate(self, test_data):
        # Overall metrics
        pre, re, auc = Precision(), Recall(), AUC()

        # Per-class metrics storage
        class_metrics = {
            "precision": [Precision() for _ in range(6)],
            "recall": [Recall() for _ in range(6)],
            "auc": [AUC() for _ in range(6)],
            "false_positives": [0] * 6,
            "false_negatives": [0] * 6,
            "true_positives": [0] * 6,
            "true_negatives": [0] * 6
        }

        for X_true, y_true in test_data.as_numpy_iterator():
            yhat = self.model.predict(X_true)
            
            # Apply per-class threshold
            yhat_binary = (yhat >= np.array(self.thresholds)).astype(int)

            # Update overall metrics
            pre.update_state(y_true.flatten(), yhat_binary.flatten())
            re.update_state(y_true.flatten(), yhat_binary.flatten())
            auc.update_state(y_true.flatten(), yhat.flatten())  # Raw probabilities

            # Update per-class metrics
            for class_idx in range(6):
                class_metrics["precision"][class_idx].update_state(y_true[:, class_idx], yhat_binary[:, class_idx])
                class_metrics["recall"][class_idx].update_state(y_true[:, class_idx], yhat_binary[:, class_idx])
                class_metrics["auc"][class_idx].update_state(y_true[:, class_idx], yhat[:, class_idx])

                # Compute TP, FP, TN, FN
                class_metrics["true_positives"][class_idx] += np.sum((yhat_binary[:, class_idx] == 1) & (y_true[:, class_idx] == 1))
                class_metrics["false_positives"][class_idx] += np.sum((yhat_binary[:, class_idx] == 1) & (y_true[:, class_idx] == 0))
                class_metrics["true_negatives"][class_idx] += np.sum((yhat_binary[:, class_idx] == 0) & (y_true[:, class_idx] == 0))
                class_metrics["false_negatives"][class_idx] += np.sum((yhat_binary[:, class_idx] == 0) & (y_true[:, class_idx] == 1))

        # Compute per-class F1-score
        per_class_f1 = [
            (2 * class_metrics["precision"][i].result().numpy() * class_metrics["recall"][i].result().numpy()) /
            (class_metrics["precision"][i].result().numpy() + class_metrics["recall"][i].result().numpy() + 1e-7)
            for i in range(6)
        ]

        # Compute per-class Specificity (TNR = TN / (TN + FP))
        per_class_specificity = [
            class_metrics["true_negatives"][i] / (class_metrics["true_negatives"][i] + class_metrics["false_positives"][i] + 1e-7)
            for i in range(6)
        ]

        # Compute per-class MCC (Matthews Correlation Coefficient)
        per_class_mcc = [
            (class_metrics["true_positives"][i] * class_metrics["true_negatives"][i] - class_metrics["false_positives"][i] * class_metrics["false_negatives"][i]) /
            (np.sqrt(
                (class_metrics["true_positives"][i] + class_metrics["false_positives"][i]) *
                (class_metrics["true_positives"][i] + class_metrics["false_negatives"][i]) *
                (class_metrics["true_negatives"][i] + class_metrics["false_positives"][i]) *
                (class_metrics["true_negatives"][i] + class_metrics["false_negatives"][i]) + 1e-7
            ))
            for i in range(6)
        ]

        # Compute overall accuracy (TP + TN) / (TP + TN + FP + FN)
        overall_accuracy = np.sum(class_metrics["true_positives"]) + np.sum(class_metrics["true_negatives"])
        overall_accuracy /= (
            np.sum(class_metrics["true_positives"]) + 
            np.sum(class_metrics["true_negatives"]) + 
            np.sum(class_metrics["false_positives"]) + 
            np.sum(class_metrics["false_negatives"]) + 1e-7
        )

        return {
            'overall_metrics': {
                'precision': pre.result().numpy(),
                'recall': re.result().numpy(),
                'AUC': auc.result().numpy(),
                'accuracy': overall_accuracy
            },
            'per_class_metrics': {
                'toxic': {
                    'AUC': class_metrics["auc"][0].result().numpy(),
                    'F1-score': per_class_f1[0],
                    'Specificity': per_class_specificity[0],
                    'MCC': per_class_mcc[0],
                    'FP': class_metrics["false_positives"][0],
                    'FN': class_metrics["false_negatives"][0]
                },
                'severe_toxic': {
                    'AUC': class_metrics["auc"][1].result().numpy(),
                    'F1-score': per_class_f1[1],
                    'Specificity': per_class_specificity[1],
                    'MCC': per_class_mcc[1],
                    'FP': class_metrics["false_positives"][1],
                    'FN': class_metrics["false_negatives"][1]
                },
                'obscene': {
                    'AUC': class_metrics["auc"][2].result().numpy(),
                    'F1-score': per_class_f1[2],
                    'Specificity': per_class_specificity[2],
                    'MCC': per_class_mcc[2],
                    'FP': class_metrics["false_positives"][2],
                    'FN': class_metrics["false_negatives"][2]
                },
                'threat': {
                    'AUC': class_metrics["auc"][3].result().numpy(),
                    'F1-score': per_class_f1[3],
                    'Specificity': per_class_specificity[3],
                    'MCC': per_class_mcc[3],
                    'FP': class_metrics["false_positives"][3],
                    'FN': class_metrics["false_negatives"][3]
                },
                'insult': {
                    'AUC': class_metrics["auc"][4].result().numpy(),
                    'F1-score': per_class_f1[4],
                    'Specificity': per_class_specificity[4],
                    'MCC': per_class_mcc[4],
                    'FP': class_metrics["false_positives"][4],
                    'FN': class_metrics["false_negatives"][4]
                },
                'identity_hate': {
                    'AUC': class_metrics["auc"][5].result().numpy(),
                    'F1-score': per_class_f1[5],
                    'Specificity': per_class_specificity[5],
                    'MCC': per_class_mcc[5],
                    'FP': class_metrics["false_positives"][5],
                    'FN': class_metrics["false_negatives"][5]
                }
            }
        }

    def predict(self, texts):
        input_text = self.vectorizer(texts)
        yhat = self.model.predict(input_text)
        yhat_thresholded = np.array([yhat[:, i] > self.thresholds[i] for i in range(6)]).T.astype(int)
        return yhat_thresholded
