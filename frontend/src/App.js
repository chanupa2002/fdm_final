import React, { useState } from "react";
import emailjs from "emailjs-com"; // npm install emailjs-com
import "./App.css";

// ⭐ Reusable rating bar with selectable balls
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
  // Terms agreement
  const [agreed, setAgreed] = useState(false);

  // Main survey form data
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

  // Popup help form
  const [showPopup, setShowPopup] = useState(false);
  const [helpForm, setHelpForm] = useState({
    name: "",
    email: "",
    contact: "",
  });

  // Handle survey changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle popup help form changes
  const handleHelpChange = (e) => {
    setHelpForm({ ...helpForm, [e.target.name]: e.target.value });
  };

  // Submit survey for prediction
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

    console.log("Sending to API /predict:", payload);

    try {
      setLoading(true);
      setPrediction(null);

      const res = await fetch("https://fdm-final.onrender.com/predict", {
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

  // Send EmailJS request
  const sendHelpEmail = (e) => {
    e.preventDefault();

    const depressionDetails = `
Gender: ${formData.gender}
Age: ${formData.age}
Job Status: ${formData.jobStatus}
Academic Pressure: ${formData.academicPressure}
Work Pressure: ${formData.workPressure}
CGPA: ${formData.cgpa} / ${formData.outOf}
Study Satisfaction: ${formData.studySatisfaction}
Job Satisfaction: ${formData.jobSatisfaction}
Sleep Duration: ${formData.sleepDuration}
Dietary Habits: ${formData.dietaryHabits}
Degree: ${formData.degree}
Suicidal Thoughts: ${formData.suicidalThoughts}
Work/Study Hours: ${formData.workHours}
Financial Stress: ${formData.financialStress}
Family History of Mental Illness: ${formData.familyHistory}
`;

    const emailPayload = {
      user_name: helpForm.name,
      user_email: helpForm.email,
      user_contact: helpForm.contact,
      depression_details: depressionDetails,
    };

    emailjs
      .send(
        "service_3c9oowh",
        "template_0n5lcfh",
        emailPayload,
        "pN1gwGsoP8_4vLJxD"
      )
      .then(
        () => {
          alert("Helpline request sent successfully!");
          setShowPopup(false);
          setHelpForm({ name: "", email: "", contact: "" });
        },
        (error) => {
          console.error(error.text);
          alert("Failed to send helpline request.");
        }
      );
  };

  return (
    <div className="page">
      {/* Terms & Agreement popup */}
      {!agreed && (
        <div className="popup">
          <div className="popup-content agreement">
            <h2>Terms & Agreement</h2>
            <div className="agreement-text">
              <p>
                Welcome to the Student Depression Prediction System. Please read
                this agreement carefully before using the application.
              </p>
              <p>
                <strong>1. Purpose:</strong> This tool is designed to provide
                general insights and does not replace professional medical
                advice.
              </p>
              <p>
                <strong>2. Data Usage:</strong> The information you provide is
                processed only for prediction purposes and is not shared with
                third parties.
              </p>
              <p>
                <strong>3. Limitations:</strong> Results are not a confirmed
                medical diagnosis. Always consult a healthcare professional for
                medical advice.
              </p>
              <p>
                <strong>4. Consent:</strong> By clicking "Agree", you consent to
                the terms of use and acknowledge that you are using this system
                voluntarily.
              </p>
              <p>
                Dummy text filler: Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Praesent sit amet augue nec lacus pulvinar
                dictum. Curabitur vitae nulla nec justo fermentum ultrices.
              </p>
            </div>
            <button className="btn" onClick={() => setAgreed(true)}>
              Agree & Continue
            </button>
          </div>
        </div>
      )}

      {/* Main content (only visible if agreed) */}
      {agreed && (
        <div className="container">
          <h1 className="title">Student Depression Prediction</h1>
          <p className="subtitle">Please answer the questions honestly.</p>

          {/* Survey Form */}
          <form onSubmit={handleSubmit} className="card">
            {/* Gender */}
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

            {/* Age */}
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

            {/* Job Status */}
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

            {/* Academic Pressure */}
            <label>
              Academic Pressure:
              <RatingBar
                name="academicPressure"
                value={formData.academicPressure}
                onChange={handleChange}
              />
            </label>

            {/* Work Pressure */}
            <label>
              Work Pressure:
              <RatingBar
                name="workPressure"
                value={formData.jobStatus === "Yes" ? formData.workPressure : 0}
                onChange={handleChange}
                disabled={formData.jobStatus !== "Yes"}
              />
            </label>

            {/* CGPA + OutOf */}
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

            {/* Study Satisfaction */}
            <label>
              Study Satisfaction:
              <RatingBar
                name="studySatisfaction"
                value={formData.studySatisfaction}
                onChange={handleChange}
              />
            </label>

            {/* Job Satisfaction */}
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

            {/* Sleep Duration */}
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

            {/* Dietary Habits */}
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

            {/* Degree */}
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

            {/* Suicidal Thoughts */}
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

            {/* Work/Study Hours */}
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

            {/* Financial Stress */}
            <label>
              Financial Stress:
              <RatingBar
                name="financialStress"
                value={formData.financialStress}
                onChange={handleChange}
              />
            </label>

            {/* Family History */}
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

          {/* Prediction Result */}
          {prediction !== null && (
            <div className="result">
              <p>
                {prediction === 1
                  ? "⚠️ The student may have depression."
                  : "✅ The student does not show signs of depression."}
              </p>

              {/* Show Get Help if risk detected */}
              {prediction === 1 && (
                <button
                  className="btn help-btn"
                  onClick={() => setShowPopup(true)}
                >
                  Get Help
                </button>
              )}
            </div>
          )}

          {/* Popup Help Form */}
          {showPopup && (
            <div className="popup">
              <div className="popup-content">
                <h2>Helpline Contact Form</h2>
                <form onSubmit={sendHelpEmail}>
                  <label>
                    Name:
                    <input
                      type="text"
                      name="name"
                      value={helpForm.name}
                      onChange={handleHelpChange}
                      required
                    />
                  </label>
                  <label>
                    Email:
                    <input
                      type="email"
                      name="email"
                      value={helpForm.email}
                      onChange={handleHelpChange}
                      required
                    />
                  </label>
                  <label>
                    Contact Number:
                    <input
                      type="text"
                      name="contact"
                      value={helpForm.contact}
                      onChange={handleHelpChange}
                      required
                    />
                  </label>
                  <button type="submit" className="btn">
                    Send Request
                  </button>
                  <button
                    type="button"
                    className="btn cancel"
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
