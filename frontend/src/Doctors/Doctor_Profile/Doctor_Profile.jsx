import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  FaSave,
  FaTimes,
  FaUserMd,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaEdit,
} from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import "./Doctor_Profile.css";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  // 1. IDENTITY SYNC
  const doctorUser = useMemo(
    () => JSON.parse(localStorage.getItem("userData")) || {},
    [],
  );

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Focus strictly on the doctor's profile document registry
      const profileRes = await axios.get(
        `http://localhost:5000/api/doctors/profile/${doctorUser.doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setFormState({
        ...profileRes.data,
        bio:
          profileRes.data.bio ||
          "Dedicated medical professional committed to patient-centered care.",
        languages: profileRes.data.languages || ["English", "Hindi"],
        experience: profileRes.data.experience || "10+ Years",
        availability: profileRes.data.availability || "Available",
        shiftStart: profileRes.data.shiftStart || "09:00",
        shiftEnd: profileRes.data.shiftEnd || "17:00",
      });
    } catch (err) {
      console.error("Clinical Profile sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorUser.doctorId) fetchProfile();
  }, [doctorUser.doctorId]);

  // Handle Photo input choice loop
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFormState((prev) => ({
        ...prev,
        localPreviewUrl: URL.createObjectURL(e.target.files[0]),
      }));
    }
  };

  // 2. SAVE LOGIC WITH MULTIPART FILE SERIALIZATION
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Serialize standard payload fields into a Form data block
      const formData = new FormData();
      formData.append("name", formState.name);
      formData.append("bio", formState.bio);
      formData.append("experience", formState.experience);
      formData.append("fee", formState.fee);
      formData.append("availability", formState.availability);
      formData.append("shiftStart", formState.shiftStart);
      formData.append("shiftEnd", formState.shiftEnd);
      formData.append("phone", formState.phone || "");

      // Append binary file if selected
      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      const res = await axios.put(
        `http://localhost:5000/api/doctors/update/${doctorUser.doctorId}`,
        formData,
        { headers: { ...headers, "Content-Type": "multipart/form-data" } },
      );

      if (res.status === 200) {
        setIsEditing(false);
        setSelectedFile(null);
        fetchProfile();
        alert("Professional Registry & Availability Updated!");
      }
    } catch (err) {
      alert("Failed to update registry. Check network connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  if (loading && !isEditing)
    return (
      <div className="doc_prof_loading">
        <FiLoader className="spin" /> Syncing Clinical Profile...
      </div>
    );

  return (
    <div className="doc_prof_m_root doc_prof_m_fade_in">
      <div className="doc_prof_m_grid">
        {/* Sidebar: Identity & Active Status */}
        <aside className="doc_prof_m_sidebar">
          <div className="doc_prof_m_card doc_prof_m_identity">
            <div className="doc_prof_m_avatar_wrapper">
              <img
                src={
                  formState.localPreviewUrl
                    ? formState.localPreviewUrl
                    : formState.photo
                      ? `http://localhost:5000/uploads/${formState.photo}`
                      : "https://via.placeholder.com/150"
                }
                alt={formState.name}
                className="doc_prof_m_img"
              />
              {isEditing && (
                <label className="photo_upload_overlay_label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <span>Upload</span>
                </label>
              )}
              <div
                className={`doc_prof_m_status ${formState.availability?.toLowerCase().replace(/\s+/g, "")}`}
              ></div>
            </div>

            <div className="doc_prof_m_id_text">
              <h2>{formState.name}</h2>
              <span className="doc_prof_m_qual">{formState.degrees}</span>

              <div className="doc_prof_availability_selector">
                {isEditing ? (
                  <select
                    value={formState.availability}
                    onChange={(e) =>
                      handleChange("availability", e.target.value)
                    }
                    className="doc_prof_status_dropdown"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy (Emergency)</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                ) : (
                  <div
                    className={`doc_prof_status_badge ${formState.availability?.toLowerCase().replace(/\s+/g, "")}`}
                  >
                    <FaCheckCircle size={10} /> {formState.availability}
                  </div>
                )}
              </div>
            </div>

            <div className="doc_prof_m_stats_row">
              <div className="doc_prof_m_stat_node">
                <label>Experience</label>
                <strong>{formState.experience}</strong>
              </div>
              <div className="doc_prof_m_stat_node">
                <label>Consultation</label>
                <strong>₹{formState.fee}</strong>
              </div>
            </div>

            <div className="doc_prof_m_actions">
              {isEditing ? (
                <div className="doc_prof_m_btn_group">
                  <button
                    className="doc_prof_m_btn_primary"
                    onClick={handleSave}
                  >
                    <FaSave /> Save Registry
                  </button>
                  <button
                    className="doc_prof_m_btn_outline"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFile(null);
                    }}
                  >
                    <FaTimes /> Discard
                  </button>
                </div>
              ) : (
                <button
                  className="doc_prof_m_btn_primary full_width"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Update Availability
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="doc_prof_m_main">
          <section className="doc_prof_m_card">
            <div className="doc_prof_m_card_header">
              <FaUserMd className="doc_prof_m_icon" />
              <h4>Clinical Professional Summary</h4>
            </div>
            <div className="doc_prof_m_content">
              {isEditing ? (
                <textarea
                  className="doc_prof_m_textarea"
                  value={formState.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  rows="4"
                />
              ) : (
                <p className="doc_prof_m_bio_text">{formState.bio}</p>
              )}
            </div>
          </section>

          <div className="doc_prof_m_details_grid">
            {/* Shift Logistics */}
            <section className="doc_prof_m_card">
              <div className="doc_prof_m_card_header">
                <FaClock className="doc_prof_m_icon" />
                <h4>Shift & Scheduling</h4>
              </div>
              <div className="doc_prof_m_form">
                <div className="doc_prof_m_field">
                  <label>Department</label>
                  <p className="doc_prof_m_readonly">
                    {formState.department} Specialist
                  </p>
                </div>
                <div className="doc_prof_m_field">
                  <label>Working Hours (OPD)</label>
                  {isEditing ? (
                    <div className="doc_prof_shift_inputs">
                      <input
                        type="time"
                        value={formState.shiftStart}
                        onChange={(e) =>
                          handleChange("shiftStart", e.target.value)
                        }
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={formState.shiftEnd}
                        onChange={(e) =>
                          handleChange("shiftEnd", e.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <p>
                      <strong>{formState.shiftStart}</strong> to{" "}
                      <strong>{formState.shiftEnd}</strong>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Sync */}
            <section className="doc_prof_m_card">
              <div className="doc_prof_m_card_header">
                <FaUserMd className="doc_prof_m_icon" />
                <h4>Clinic Contact Details</h4>
              </div>
              <div className="doc_prof_m_form">
                <div className="doc_prof_m_field">
                  <label>
                    <FaEnvelope /> Registry Email
                  </label>
                  <p>{formState.email}</p>
                </div>
                <div className="doc_prof_m_field">
                  <label>
                    <FaPhoneAlt /> Phone / Pager
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formState.phone || ""}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="doc_prof_m_input_small"
                    />
                  ) : (
                    <p>{formState.phone || "Emergency Contact Not Set"}</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
