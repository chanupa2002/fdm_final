import React, { useState } from "react";
import "./App.css";

// Reusable rating bar with selectable balls
const RatingBar = ({ name, value, onChange, max = 5, disabled = false }) => {
  return (
    <div className={`rating-bar ${disabled ? "disabled" : ""}`}>
      {[...Array(max + 1).keys()].map((i) => {
        if (i === 0) return null; // skip 0 circle
        return (
          <span
            key={i}
            className={`circle ${i <= value ? "active" : ""} ${
              disabled ? "muted" : ""
            }`}
            onClick={() =>
              !disabled && onChange({ target: { name, value: i } })
            }
          >
            ●
          </span>
        );
      })}
    </div>
  );
};

function App() {
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    jobStatus: "",
    academicPressure: 0,
    workPressure: 0,
    cgpa: "",
    outOf: "",
    studySatisfaction: 0,
    jobSatisfaction: 0,
    sleepDuration: "",
    dietaryHabits: "",
    degree: "",
    suicidalThoughts: "",
    workHours: "",
    financialStress: 0,
    familyHistory: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const age = parseInt(formData.age, 10);
    if (isNaN(age) || age < 10 || age > 120) {
      alert("Please enter an age between 10 and 120");
      return;
    }

    let normalizedCGPA = null;
    if (formData.cgpa && formData.outOf) {
      normalizedCGPA = parseFloat(formData.cgpa) / parseFloat(formData.outOf);
    }

    // Reset job-related fields if no job
    const jobSatisfaction =
      formData.jobStatus === "Yes" ? formData.jobSatisfaction : 0;
    const workPressure =
      formData.jobStatus === "Yes" ? formData.workPressure : 0;

    let workHoursValue = formData.workHours === "12+" ? 12 : formData.workHours;

    const payload = {
      gender: formData.gender,
      age,
      jobStatus: formData.jobStatus === "Yes" ? 1 : 0,
      academicPressure: parseInt(formData.academicPressure, 10),
      workPressure: parseInt(workPressure, 10),
      cgpa: normalizedCGPA,
      studySatisfaction: parseInt(formData.studySatisfaction, 10),
      jobSatisfaction: parseInt(jobSatisfaction, 10),
      sleepDuration: formData.sleepDuration,
      dietaryHabits: formData.dietaryHabits,
      degree: formData.degree,
      suicidalThoughts: formData.suicidalThoughts === "Yes" ? 1 : 0,
      workHours: parseInt(workHoursValue, 10),
      financialStress: parseInt(formData.financialStress, 10),
      familyHistory: formData.familyHistory === "Yes" ? 1 : 0,
    };

    console.log("Sending to API /api/predict (POST):", payload);

    try {
      setLoading(true);
      setPrediction(null);

      const res = await fetch("https://bookish-space-adventure-v6v5w7qp56r62xq7x-8000.app.github.dev/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();
      setPrediction(data.prediction ?? "No result received");
    } catch (err) {
      console.error(err);
      setPrediction("Error: Could not get prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Student Depression Prediction</h1>
        <p className="subtitle">Please answer the questions honestly.</p>

        <form onSubmit={handleSubmit} className="card">
          <label>
            Gender:
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </label>

          <label>
            Age:
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="10"
              max="120"
              required
            />
          </label>

          <label>
            Doing a Job?
            <select
              name="jobStatus"
              value={formData.jobStatus}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>

          <label>
            Academic Pressure:
            <RatingBar
              name="academicPressure"
              value={formData.academicPressure}
              onChange={handleChange}
            />
          </label>

          <label>
            Work Pressure:
            <RatingBar
              name="workPressure"
              value={formData.jobStatus === "Yes" ? formData.workPressure : 0}
              onChange={handleChange}
              disabled={formData.jobStatus !== "Yes"}
            />
          </label>

          {/* CGPA + OutOf same row */}
          <div className="row">
            <label className="half">
              CGPA:
              <input
                type="number"
                step="0.01"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                required
              />
            </label>
            <label className="half">
              Out of:
              <input
                type="number"
                step="0.01"
                name="outOf"
                value={formData.outOf}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label>
            Study Satisfaction:
            <RatingBar
              name="studySatisfaction"
              value={formData.studySatisfaction}
              onChange={handleChange}
            />
          </label>

          <label>
            Job Satisfaction:
            <RatingBar
              name="jobSatisfaction"
              value={
                formData.jobStatus === "Yes" ? formData.jobSatisfaction : 0
              }
              onChange={handleChange}
              disabled={formData.jobStatus !== "Yes"}
            />
          </label>

          <label>
            Sleep Duration:
            <select
              name="sleepDuration"
              value={formData.sleepDuration}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>Less than 5 hours</option>
              <option>5-6 hours</option>
              <option>7-8 hours</option>
              <option>More than 8 hours</option>
            </select>
          </label>

          <label>
            Dietary Habits:
            <select
              name="dietaryHabits"
              value={formData.dietaryHabits}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>Healthy</option>
              <option>Moderate</option>
              <option>Unhealthy</option>
            </select>
          </label>

          <label>
            Degree:
            <select
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>B.Pharm</option>
              <option>BSc</option>
              <option>BA</option>
              <option>BCA</option>
              <option>M.Tech</option>
              <option>PhD</option>
              <option>Class 12</option>
              <option>B.Ed</option>
              <option>LLB</option>
              <option>BE</option>
              <option>M.Ed</option>
              <option>MSc</option>
              <option>BHM</option>
              <option>M.Pharm</option>
              <option>MCA</option>
              <option>MA</option>
              <option>B.Com</option>
              <option>MD</option>
              <option>MBA</option>
              <option>MBBS</option>
              <option>M.Com</option>
              <option>B.Arch</option>
              <option>LLM</option>
              <option>B.Tech</option>
              <option>BBA</option>
              <option>ME</option>
              <option>MHM</option>
              <option>Others</option>
            </select>
          </label>

          <label>
            Suicidal Thoughts:
            <select
              name="suicidalThoughts"
              value={formData.suicidalThoughts}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>

          <label>
            Work/Study Hours:
            <select
              name="workHours"
              value={formData.workHours}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {[...Array(12).keys()].map((h) => (
                <option key={h + 1}>{h + 1}</option>
              ))}
              <option>12+</option>
            </select>
          </label>

          <label>
            Financial Stress:
            <RatingBar
              name="financialStress"
              value={formData.financialStress}
              onChange={handleChange}
            />
          </label>

          <label>
            Family History of Mental Illness:
            <select
              name="familyHistory"
              value={formData.familyHistory}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Predicting..." : "Predict"}
          </button>
        </form>

        {prediction !== null && (
          <div className="result">
            <h3>Prediction Result:</h3>
            <p>{prediction}</p>
            <p>
              {prediction === 1
                ? "The student may have depression."
                : "The student does not show signs of depression."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
