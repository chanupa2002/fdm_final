import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# -----------------------------
# Load model, scaler, encoders
# -----------------------------
with open("./files/model.pkl", "rb") as f:
    model = pickle.load(f)

with open("./files/scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

with open("./files/label_encoders.pkl", "rb") as f:
    label_encoders = pickle.load(f)

# -----------------------------
# FastAPI app setup
# -----------------------------
app = FastAPI(title="Depression Prediction API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] to restrict
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# -----------------------------
# Input schema for prediction
# -----------------------------
class UserInput(BaseModel):
    gender: str
    # if profession not available, set default or remove from pipeline
    sleepDuration: str
    dietaryHabits: str
    degree: str
    suicidalThoughts: int   # keep as int (0/1)
    familyHistory: int      # keep as int (0/1)
    age: float
    academicPressure: int
    workPressure: int
    cgpa: float
    studySatisfaction: int
    jobSatisfaction: int
    workHours: int
    financialStress: int
    jobStatus: int | None = None


# -----------------------------
# Preprocessing function
# -----------------------------
def preprocess_input(data: UserInput):
    # Convert input to DataFrame
    df = pd.DataFrame([data.dict()])

# 2. Rename underscored keys → training keys
    rename_map = {
    "sleepDuration": "Sleep Duration",
    "dietaryHabits": "Dietary Habits",
    "suicidalThoughts": "Have you ever had suicidal thoughts ?",
    "familyHistory": "Family History of Mental Illness",
    "workHours": "Work/Study Hours",
    "academicPressure": "Academic Pressure",
    "workPressure": "Work Pressure",
    "studySatisfaction": "Study Satisfaction",
    "jobSatisfaction": "Job Satisfaction",
    "financialStress": "Financial Stress",
    "cgpa": "CGPA",
    "age": "Age",
    "gender": "Gender",
    "degree": "Degree",
    "jobStatus": "Profession"
    }

    df.rename(columns=rename_map, inplace=True)

# 3. Encode all categorical columns
    categorical_cols = [
    'Gender', 'Sleep Duration', 'Dietary Habits',
    'Degree' 
    
]
    for col in categorical_cols:
        df[col] = label_encoders[col].transform(df[col])

# 4. Reorder columns exactly as in training
    all_cols_order = [
    'Gender','Age', 'Profession','Academic Pressure', 'Work Pressure', 'CGPA',
    'Study Satisfaction', 'Job Satisfaction', 'Sleep Duration',
    'Dietary Habits', 'Degree','Have you ever had suicidal thoughts ?', 'Work/Study Hours', 'Financial Stress',
     
    'Family History of Mental Illness'
]
    df = df[all_cols_order]


# 5. Scale columns (all 11 numeric ones exactly as in training)
    numeric_cols_scaler = [
    'Age', 'Academic Pressure', 'Work Pressure', 'CGPA',
    'Study Satisfaction', 'Job Satisfaction', 'Sleep Duration',
    'Dietary Habits', 'Degree', 'Work/Study Hours', 'Financial Stress'
]
    df[numeric_cols_scaler] = scaler.transform(df[numeric_cols_scaler])
    df["Profession"] = df["Profession"].map({0: 1, 1: 0})
    return df

# -----------------------------
# Prediction route
# -----------------------------
@app.post("/predict")
def predict(user_input: UserInput):
    try:
        processed = preprocess_input(user_input)
        pred = model.predict(processed)[0]
        proba = model.predict_proba(processed)[0][1]

        return {
            "prediction": int(pred),
            "probability_of_depression": round(float(proba), 3)
        }
    except Exception as e:
        return {"error": str(e)}




