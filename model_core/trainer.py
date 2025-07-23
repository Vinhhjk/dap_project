from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

class Trainer:
    def __init__(self, model, train_data, val_data):
        self.model = model
        self.train_data = train_data
        self.val_data = val_data

    def train(self, epochs=15):
        callbacks = [
            EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True),
            ModelCheckpoint(filepath='best_model.h5', save_best_only=True, monitor='val_loss')
        ]
        history = self.model.fit(
            self.train_data,
            epochs=epochs,
            validation_data=self.val_data,
            callbacks=callbacks,
            shuffle=False,
        )        
        return history
    def save_model(self, path='toxicity.h5'):
        self.model.save(path)
