# DAP391m PROJECT

## Project Overview
This project involves a toxicity detection model with a Flask backend API and a React frontend. The backend uses a trained model (`.pkl` and `.h5` files) to classify toxic comments, and the frontend provides a user-friendly interface for interaction.

### This is the project for DAP391m assignment - FPT University SP25
#### Team members:
- Bùi Tấn Phát - SE194343 
- Nguyễn Quang Vinh - SE194197
- Nguyễn Trần Minh Quân - SE194342
- Nguyễn Quách Lam Giang - SE194447

---


## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Vinhhjk/dap_project
cd dap_project
```

### 2. Model Core Setup

#### a. Navigate to `model_core`
```bash
cd model_core
```

#### b. Create a Virtual Environment (Python 3.11.9)
```bash
python3.11 -m venv venv
```

#### c. Activate the Virtual Environment
- **Windows:**
  ```bash
  venv\Scripts\activate
  ```
- **macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

#### d. Install Required Packages
```bash
pip install -r requirements.txt
```

#### e. Run the Model Builder
```bash
python main.py
```

This will generate the `vectorizer.pkl` and `toxicity.h5` files.

#### f. Move the Generated Files
Move the generated `.pkl` and `.h5` files from `model_core` to the `backend` folder:

- **Windows:**
  ```bash
  Move-Item -Path toxicity.h5, vectorizer.pkl -Destination ../backend/
  ```
- **macOS/Linux:**
  ```bash
  mv toxicity.h5 vectorizer.pkl ../backend/
  ```

#### g. Deactivate the Virtual Environment
- **Windows:**
  ```bash
  deactivate
  ```
- **macOS/Linux:**
  ```bash
  deactivate
  ```
---

### 3. Backend Setup

#### a. Navigate to `backend`
```bash
cd ../backend
```

#### b. Install Backend Requirements
```bash
pip install -r requirements.txt
```

#### e. Run the Flask API
```bash
uvicorn app:app --reload
```
The Flask API should now be running locally.

---

### 4. Frontend Setup

#### a. Split your Terminal (or create a new one) and Navigate to `frontend`
```bash
cd ../frontend
```

#### b. Install Frontend Dependencies
```bash
npm install
```

#### c. Run the Frontend Application
```bash
npm start
```

The frontend should now be running on [http://localhost:3000](http://localhost:3000).

---

## Running the Complete Application
Ensure both the backend Flask API and the frontend React application are running simultaneously. The frontend will communicate with the backend for toxicity classification.

---

## Notes
- Ensure Python 3.11.9 is installed.
- The `.pkl` and `.h5` files must be in the `backend` folder before running the Flask API.
- Use separate terminal windows/tabs for running the backend and frontend concurrently.
- Type one or multiple comments
- Upload `.txt` or `.csv` file directly or through drag-n-drop
---

## Troubleshooting
- **CORS Issues:** If frontend requests are blocked, consider installing `flask-cors`:
  ```bash
  pip install flask-cors
  ```
- **Dependency Errors:** Verify correct package versions in virtual environments.
- **Port Conflicts:** Ensure ports `5000` (backend) and `3000` (frontend) are free or adjust accordingly.

---

## Contribution
Feel free to contribute by creating pull requests or raising issues for improvements.

---

## License
MIT License

---