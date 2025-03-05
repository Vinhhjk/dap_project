import os
from data_loader import DataLoader
from model_builder import ToxicityModel
from trainer import Trainer
from evaluator import Evaluator


def main():

    # Load and preprocess data
    data_loader = DataLoader(data_path=os.path.join('jigsaw-toxic-comment-classification-challenge','train.csv', 'train.csv'))
    X, y = data_loader.load_data()
    train, val, test, vectorizer = data_loader.preprocess(X, y)

    # Build and train model
    model_builder = ToxicityModel()
    model = model_builder.build_model()
    trainer = Trainer(model, train, val)
    trainer.train(epochs=7)
    trainer.save_model()

    # Evaluate model
    evaluator = Evaluator(model, vectorizer)
    results = evaluator.evaluate(test)

    # Print overall metrics
    print("\nOverall Metrics:")
    print(f"Precision: {results['overall_metrics']['precision']}")
    print(f"Recall: {results['overall_metrics']['recall']}")
    print(f"Accuracy: {results['overall_metrics']['accuracy']}")

    # Print per-class accuracy
    print("\nPer-class Accuracy:")
    for class_name, accuracy in results['per_class_accuracy'].items():
        print(f"{class_name}: {accuracy}")

if __name__ == "__main__":
    main()