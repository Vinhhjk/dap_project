import os
from data_loader import DataLoader
from model_builder import ToxicityModel
from trainer import Trainer
from evaluator import Evaluator
from sklearn.utils.class_weight import compute_class_weight
import numpy as np

def main():

    # Load and preprocess data
    data_loader = DataLoader(data_path=os.path.join('jigsaw-toxic-comment-classification-challenge','train.csv', 'train.csv'))
    X, y = data_loader.load_data()
    train, val, test, vectorizer = data_loader.preprocess(X, y)

    # Build and train model
    model_builder = ToxicityModel()
    model = model_builder.build_model()
    epochs = 15
    embedding_layer = model.layers[0]

    print(f"\nConfiguration:")
    print(f"Number of epochs: {epochs}")
    print(f"Batch Size: {data_loader.batch_size}")
    print(f"Sequence Length: {data_loader.sequence_length}")
    print(f"Max features: {data_loader.max_features}")
    print(f"Output dim (embedding dimension): {embedding_layer.output_dim}")
    print(f"Optimizer: {model.optimizer.get_config()['name']}")
    print(f"Loss FUnction: {model.loss}")
# Replace the current class weights computation with:
# For multi-label classification, we need a simpler approach
# Just use a sample_weight instead of class_weight

# Create a balanced class weight dictionary for each class
    class_weights_dict = {}
    for i in range(6):
        # Compute weights for each class (0 and 1)
        weights = compute_class_weight('balanced', 
                                    classes=np.array([0, 1]), 
                                    y=y[:, i])
        # Clip weights to reasonable values
        weights = np.clip(weights, a_min=0.5, a_max=30)
        class_weights_dict[i] = {0: weights[0], 1: weights[1]}

    # Print the class weights for debugging
    print("Class weights:", class_weights_dict)

    trainer = Trainer(model, train, val, class_weights_dict)
    trainer.train(epochs=15)
    trainer.save_model()
    # Evaluate model
    evaluator = Evaluator(model, vectorizer)
    results = evaluator.evaluate(test)

    # Print overall metrics
    print("\nOverall Metrics:")
    print(f"Precision: {results['overall_metrics']['precision']:.4f}")
    print(f"Recall: {results['overall_metrics']['recall']:.4f}")
    print(f"AUC: {results['overall_metrics']['AUC']:.4f}")
    print(f"Accuracy: {results['overall_metrics']['accuracy']:.4f}")

    # Print per-class metrics
    print("\nPer-class Metrics:")
    for class_name, metrics in results['per_class_metrics'].items():
        print(f"\nClass: {class_name}")
        print(f"AUC: {metrics['AUC']:.4f}")
        print(f"F1-score: {metrics['F1-score']:.4f}")
        print(f"Specificity: {metrics['Specificity']:.4f}")
        print(f"MCC: {metrics['MCC']:.4f}")
        print(f"False Positives (FP): {metrics['FP']}")
        print(f"False Negatives (FN): {metrics['FN']}")

if __name__ == "__main__":
    main()