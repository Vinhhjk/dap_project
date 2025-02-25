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
    trainer.train(epochs=1)
    trainer.save_model()

    # Evaluate model
    evaluator = Evaluator(model, vectorizer)
    precision, recall, accuracy = evaluator.evaluate(test)
    print(f"Precision: {precision}, Recall: {recall}, Accuracy: {accuracy}")

    


if __name__ == "__main__":
    main()
