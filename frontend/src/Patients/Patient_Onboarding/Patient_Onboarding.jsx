import React, { useState } from "react";
import axios from "axios";
import "./Patient_Onboarding.css";

/* Profile Completion Module */
const Patient_Onboarding = ({ user, setOnboardingComplete }) => {
  /* State for text fields including new fields */
  const [formData, setFormData] = useState({
    contact: user.contact || "",
    age: user.age || "",
    gender: user.gender || "",
    bloodGroup: user.bloodGroup || "",
    dob: user.dob || "",
    height: user.height || "",
    weight: user.weight || "",
    disease: user.disease || "",
    emergencyContact: user.emergencyContact || "", // New field
    address: user.address || "", // New field
  });

  /* State for file handling */
  const [selectedFile, setSelectedFile] = useState(null); // The actual file object for Multer
  const [preview, setPreview] = useState(user.photo || null); // The preview URL for the UI

  /* Logic Section: Image Selection & Preview */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a temporary local URL for the preview window
      setPreview(URL.createObjectURL(file));
    }
  };

  /* Logic Section: Submit using FormData (Required for Multer) */
  const handleSubmit = async (e) => {
    e.preventDefault();

    /* Mandatory Field Validation */
    if (
      !formData.contact ||
      !formData.age ||
      !formData.gender ||
      !formData.bloodGroup ||
      !formData.dob
    ) {
      alert(
        "Please fill in all mandatory details (Contact, DOB, Age, Gender, Blood Group).",
      );
      return;
    }

    /* Create FormData object to package text + file */
    const data = new FormData();

    // Append all text fields dynamically
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Append the physical photo file if selected
    if (selectedFile) {
      data.append("photo", selectedFile);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/auth/update-profile/${user._id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      /* Sync Local Storage with the fresh User object from DB */
      localStorage.setItem("userData", JSON.stringify(res.data.user));

      alert("Health profile successfully updated!");
      setOnboardingComplete(true);
    } catch (err) {
      alert(
        err.response?.data?.message || "Upload failed. Try a smaller image.",
      );
    }
  };

  return (
    <div className="pat_onboard_overlay">
      <div className="pat_onboard_card">
        <div className="pat_onboard_header">
          <h2>Complete Your Profile 🏥</h2>
          <p>Provide your medical metrics and profile picture to continue.</p>
        </div>

        <form className="pat_onboard_form" onSubmit={handleSubmit}>
          <div className="pat_onboard_image_section">
            <div className="pat_onboard_avatar_preview">
              {preview ? (
                /* Logic: If it's a new selection, use blob preview. If from DB, use server path */
                <img
                  src={
                    preview.startsWith("blob")
                      ? preview
                      : `http://localhost:5000/uploads/${preview}`
                  }
                  alt="Profile Preview"
                />
              ) : (
                <div className="pat_onboard_placeholder">Upload Photo</div>
              )}
            </div>
            <input
              type="file"
              id="pat-photo-upload"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <label htmlFor="pat-photo-upload" className="pat_onboard_file_btn">
              Choose from System
            </label>
          </div>

          <div className="pat_onboard_grid">
            <div className="pat_onboard_group">
              <label>Contact Number *</label>
              <input
                type="text"
                placeholder="+91..."
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                required
              />
            </div>

            <div className="pat_onboard_group">
              <label>Date of Birth *</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                required
              />
            </div>

            <div className="pat_onboard_group">
              <label>Age *</label>
              <input
                type="number"
                placeholder="Years"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                required
              />
            </div>

            <div className="pat_onboard_group">
              <label>Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) =>
                  setFormData({ ...formData, bloodGroup: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="pat_onboard_group">
              <label>Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pat_onboard_group">
              <label>Height (cm)</label>
              <input
                type="text"
                placeholder="180"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
              />
            </div>

            <div className="pat_onboard_group">
              <label>Weight (kg)</label>
              <input
                type="text"
                placeholder="75"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
              />
            </div>

            {/* Emergency Contact input block */}
            <div className="pat_onboard_group">
              <label>Emergency Contact</label>
              <input
                type="text"
                placeholder="Name / Number"
                value={formData.emergencyContact}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
              />
            </div>
          </div>

          {/* Full Residential Address input block */}
          <div className="pat_onboard_group full_width">
            <label>Residential Address</label>
            <input
              type="text"
              placeholder="Door No, Street, City, State"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="pat_onboard_group full_width">
            <label>Medical History / Known Diseases</label>
            <textarea
              placeholder="e.g., Asthma, Diabetes, or 'None'"
              value={formData.disease}
              onChange={(e) =>
                setFormData({ ...formData, disease: e.target.value })
              }
            ></textarea>
          </div>

          <div className="pat_onboard_actions">
            <button type="submit" className="pat_onboard_submit_btn">
              Save & Continue
            </button>
            <button
              type="button"
              className="pat_onboard_skip_btn"
              onClick={() => setOnboardingComplete(true)}
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Patient_Onboarding;
