class Trainer:
    def __init__(self, model, train_data, val_data):
        self.model = model
        self.train_data = train_data
        self.val_data = val_data

    def train(self, epochs=1):
        history = self.model.fit(self.train_data, epochs=epochs, validation_data=self.val_data)
        return history

    def save_model(self, path='toxicity.h5'):
        self.model.save(path)
