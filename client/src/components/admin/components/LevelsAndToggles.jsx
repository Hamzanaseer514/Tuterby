// src/pages/LevelsAndToggles.jsx
import React, { useState } from "react";
import { BASE_URL } from "@/config";

const LevelsAndToggles = () => {
  const [otpActive, setOtpActive] = useState(false);
  const [level, setLevel] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingLevel, setLoadingLevel] = useState(false);

  const toggleOtp = async () => {
    try {
      setLoadingOtp(true);
      const res = await fetch(`${BASE_URL}/api/admin/rules/toggle-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      setOtpActive(data.data?.otp_rule_active);
      alert(`OTP Rule is now ${data.data?.otp_rule_active ? "ON" : "OFF"}`);
    } catch (error) {
      console.error(error);
      alert("Error toggling OTP rule");
    } finally {
      setLoadingOtp(false);
    }
  };

  const addEducationLevel = async () => {
    if (!level.trim()) {
      alert("Please enter an education level");
      return;
    }
    try {
      setLoadingLevel(true);
      const res = await fetch(`${BASE_URL}/api/admin/education-levels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level })
      });
      const data = await res.json();
      alert(data.message || "Education level added");
      setLevel("");
    } catch (error) {
      console.error(error);
      alert("Error adding education level");
    } finally {
      setLoadingLevel(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem" }}>
      <h1>Levels & Toggles</h1>

      <div style={{ marginBottom: "2rem" }}>
        <h2>OTP Rule</h2>
        <button onClick={toggleOtp} disabled={loadingOtp}>
          {loadingOtp ? "Toggling..." : otpActive ? "Turn Off OTP" : "Turn On OTP"}
        </button>
      </div>

      <div>
        <h2>Add Education Level</h2>
        <input
          type="text"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="Enter education level"
        />
        <button onClick={addEducationLevel} disabled={loadingLevel}>
          {loadingLevel ? "Adding..." : "Add Level"}
        </button>
      </div>
    </div>
  );
};

export default LevelsAndToggles;
