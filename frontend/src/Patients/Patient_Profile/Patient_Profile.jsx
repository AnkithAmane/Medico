import React, { useState } from "react";
import axios from "axios";
import {
  User,
  ShieldCheck,
  Activity,
  Edit3,
  Save,
  Camera,
  CalendarCheck2,
  ShoppingBag,
  FolderHeart,
  TrendingUp,
} from "lucide-react";
import "./Patient_Profile.css";

export default function Patient_Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 1. Initialize state from LocalStorage
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("userData")) || {};
  });

  // 2. Handle Text Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Handle Image Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Local browser URL object allocation for seamless UI rendering
    }
  };

  // 4. Sync with Backend via Multi-Stream FormData
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("contact", user.contact);
      formData.append("bloodGroup", user.bloodGroup);
      formData.append("weight", user.weight);
      formData.append("height", user.height);
      formData.append("age", user.age);
      formData.append("emergencyContact", user.emergencyContact || ""); // Syncing Emergency details

      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      const res = await axios.put(
        `http://localhost:5000/api/patients/update/${user._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.status === 200) {
        localStorage.setItem("userData", JSON.stringify(res.data.user));
        setUser(res.data.user);
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
        alert("Medical profile data arrays synced successfully!");
      }
    } catch (err) {
      console.error("Clinical Profile Update Failure Stack Trace:", err);
      alert(
        "Failed to synchronize profile metrics with backend registry modules.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pat_prof_wrapper">
      <div className="pat_prof_grid_container">
        {/* ========================================== */}
        {/* LEFT PRIMARY PANEL LAYER                   */}
        {/* ========================================== */}
        <div className="pat_prof_left_main">
          {/* Identity Header Hero Card */}
          <div className="pat_prof_hero_card">
            <div className="pat_prof_hero_content">
              <div className="pat_prof_avatar_wrap">
                <img
                  src={
                    previewUrl ||
                    (user.photo
                      ? `http://localhost:5000/uploads/${user.photo}`
                      : "https://via.placeholder.com/150")
                  }
                  alt="Patient Case Identity"
                />
                {isEditing && (
                  <label className="avatar_edit_overlay">
                    <Camera size={18} />
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>

              <div className="pat_prof_hero_text">
                <div className="pat_prof_badge">Patient Passport</div>
                <h1>
                  {user.name || "Verified Patient"}{" "}
                  <ShieldCheck size={24} className="pat_verify_icon" />
                </h1>
                <p>
                  Member ID:{" "}
                  <strong>
                    #MED-{user._id?.slice(-6).toUpperCase() || "NEW"}
                  </strong>
                </p>
              </div>
            </div>

            <div className="pat_prof_hero_actions">
              <button
                className={`pat_prof_action_btn ${isEditing ? "save_active" : ""}`}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={loading}
              >
                {loading ? (
                  "Syncing..."
                ) : isEditing ? (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                ) : (
                  <>
                    <Edit3 size={18} /> Update Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Demographics Form Array Infrastructure */}
          <div className="pat_prof_bento">
            <div className="pat_prof_card pat_span_2">
              <div className="pat_card_title">
                <User size={18} /> Clinical Demographic Matrix
              </div>
              <div className="pat_form_grid">
                <div className="pat_field">
                  <label>Full Legal Name</label>
                  <input
                    type="text"
                    name="name"
                    value={user.name || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="pat_field">
                  <label>Email Address Reference</label>
                  <input
                    type="email"
                    name="email"
                    value={user.email || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="pat_field">
                  <label>Primary Contact Number</label>
                  <input
                    type="text"
                    name="contact"
                    value={user.contact || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="pat_field">
                  <label>Emergency Contact Line *</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    placeholder="e.g., +91 XXXXX XXXXX"
                    value={user.emergencyContact || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="pat_field">
                  <label>Blood Group Node</label>
                  <input
                    type="text"
                    name="bloodGroup"
                    value={user.bloodGroup || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="pat_field pat_full_row">
                  <label>Residential Mailing Address</label>
                  <input
                    type="text"
                    defaultValue="Madanapalle, Chittoor District, Andhra Pradesh"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Inline Physical Vitals Telemetry Block */}
            <div className="pat_prof_card pat_span_2">
              <div className="pat_card_title">
                <Activity size={18} /> Operational Physical Vitals
              </div>
              <div className="pat_vital_stack horizontal_stretch_layout">
                <div className="pat_v_item">
                  <span>Current Weight</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="weight"
                      value={user.weight || ""}
                      onChange={handleChange}
                      className="pat_inline_input"
                    />
                  ) : (
                    <strong>{user.weight || "0"} kg</strong>
                  )}
                </div>
                <div className="pat_v_item">
                  <span>Accurate Height</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="height"
                      value={user.height || ""}
                      onChange={handleChange}
                      className="pat_inline_input"
                    />
                  ) : (
                    <strong>{user.height || "0"} cm</strong>
                  )}
                </div>
                <div className="pat_v_item">
                  <span>Chronological Age</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="age"
                      value={user.age || ""}
                      onChange={handleChange}
                      className="pat_inline_input"
                    />
                  ) : (
                    <strong>{user.age || "22"} Yrs</strong>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* VERTICAL HEALTH METRICS TERMINAL SIDEBAR   */}
        {/* ========================================== */}
        <aside className="pat_prof_sidebar full_height_stats_column">
          <div className="pat_prof_card vertical_stats_master_container">
            <div className="pat_card_title master_stats_header">
              <TrendingUp size={18} /> Analytical Case Summary
            </div>

            <div className="stats_vertical_scaffold">
              {/* STAT ELEMENT 1: Appointments Tracking Metrics */}
              <div className="scaffold_stat_card blue_variant">
                <div className="scaffold_icon_wrapper">
                  <CalendarCheck2 size={20} />
                </div>
                <div className="scaffold_text_block">
                  <span className="scaffold_label">Consultation Index</span>
                  <div className="scaffold_data_numbers">
                    <strong>12</strong> <small>Completed</small>
                    <span className="divider_dot">•</span>
                    <strong>02</strong> <small>Upcoming</small>
                  </div>
                </div>
              </div>

              {/* STAT ELEMENT 2: Pharmacy Fulfilled Procurement Orders */}
              <div className="scaffold_stat_card green_variant">
                <div className="scaffold_icon_wrapper">
                  <ShoppingBag size={20} />
                </div>
                <div className="scaffold_text_block">
                  <span className="scaffold_label">Pharmacy Allocations</span>
                  <div className="scaffold_data_numbers">
                    <strong>08</strong> <small>Fulfilled Invoices</small>
                  </div>
                </div>
              </div>

              {/* STAT ELEMENT 3: Digital Vault Records Count */}
              <div className="scaffold_stat_card amber_variant">
                <div className="scaffold_icon_wrapper">
                  <FolderHeart size={20} />
                </div>
                <div className="scaffold_text_block">
                  <span className="scaffold_label">
                    Encrypted Document Vault
                  </span>
                  <div className="scaffold_data_numbers">
                    <strong>15</strong> <small>Total Assets Cached</small>
                  </div>
                </div>
              </div>

              {/* STAT ELEMENT 4: Account Authenticity Integrity Indicator */}
              <div className="scaffold_stat_card slate_variant profile_completion_metric_row">
                <span className="scaffold_label inline_flex_label">
                  Profile Synchronization Completeness <strong>85%</strong>
                </span>
                <div className="sidebar_progress_track_bar">
                  <div
                    className="sidebar_progress_fill_bar"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
