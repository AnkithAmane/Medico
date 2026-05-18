import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUser,
  FiDownload,
  FiFileText,
  FiUploadCloud,
  FiActivity,
  FiLoader,
  FiCheck,
} from "react-icons/fi";
import "./Doctor_Settings.css";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);

  // 1. Logic: Identify context and manage form state
  const doctorUser = JSON.parse(localStorage.getItem("userData")) || {};
  const [profileData, setProfileData] = useState({
    bio: "",
    signaturePath: "",
    localPreviewUrl: "",
  });

  // 2. Logic: Fetch current settings from MongoDB
  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/doctors/profile/${doctorUser.doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProfileData({
        bio: res.data.bio || "",
        signaturePath: res.data.signaturePath || "",
        localPreviewUrl: "",
      });
    } catch (err) {
      console.error("Failed to load governance settings");
    }
  };

  useEffect(() => {
    if (doctorUser.doctorId) fetchSettings();
  }, [doctorUser.doctorId]);

  // Handle signature input selection
  const handleSignatureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSignatureFile(file);
      setProfileData((prev) => ({
        ...prev,
        localPreviewUrl: URL.createObjectURL(file),
      }));
    }
  };

  // 3. Logic: Persist changes to Backend via Multipart Form Streams
  const handleSaveProfile = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("bio", profileData.bio);

      if (signatureFile) {
        formData.append("signature", signatureFile); // Appends binary file stream
      }

      await axios.put(
        `http://localhost:5000/api/doctors/update/${doctorUser.doctorId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSaveSuccess(true);
      setSignatureFile(null);
      fetchSettings(); // Refresh backend state alignment
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Governance update failed. Please verify system connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doc_set_wrapper doc_set_page_fade_in">
      <header className="doc_set_header">
        <div className="doc_set_header_text">
          <h1>
            System <span>Governance</span>
          </h1>
          <p>Clinical Environment Configuration • Version 2.0.4</p>
        </div>
        <div className="doc_set_header_badges">
          <span className="doc_set_status_pill_active">System Online</span>
        </div>
      </header>

      <div className="doc_set_grid">
        <aside className="doc_set_sidebar">
          <nav>
            <button
              className={activeTab === "profile" ? "doc_set_active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              <FiUser className="doc_set_nav_icon" />
              <span>Identity & Bio</span>
            </button>
            <button
              className={activeTab === "analytics" ? "doc_set_active" : ""}
              onClick={() => setActiveTab("analytics")}
            >
              <FiActivity className="doc_set_nav_icon" />
              <span>Performance Alerts</span>
            </button>
            <button
              className={activeTab === "data" ? "doc_set_active" : ""}
              onClick={() => setActiveTab("data")}
            >
              <FiDownload className="doc_set_nav_icon" />
              <span>Export Registry</span>
            </button>
          </nav>
        </aside>

        <main className="doc_set_content">
          {activeTab === "profile" && (
            <div className="doc_set_tab_view doc_set_fade_in">
              <div className="doc_set_card">
                <div className="doc_set_card_title_node">
                  <h3>Bio & Specialty Tags</h3>
                  <p>
                    Configure how your profile appears in the global directory.
                  </p>
                </div>
                <div className="doc_set_form_stack">
                  <div className="doc_set_input_node">
                    <label>Professional Summary</label>
                    <textarea
                      placeholder="Briefly describe your clinical background..."
                      rows="4"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="doc_set_card">
                <div className="doc_set_card_title_node">
                  <h3>Digital Signature</h3>
                  <p>
                    This signature will be appended to all electronic
                    prescriptions.
                  </p>
                </div>

                {/* Display existing signature or active staging file if preset */}
                {(profileData.localPreviewUrl || profileData.signaturePath) && (
                  <div className="signature_preview_display_subbox">
                    <img
                      src={
                        profileData.localPreviewUrl
                          ? profileData.localPreviewUrl
                          : `http://localhost:5000/uploads/${profileData.signaturePath}`
                      }
                      alt="Clinical Authenticator Stamp Preview"
                      className="settings_signature_preview_asset"
                    />
                  </div>
                )}

                <div className="doc_set_upload_container">
                  <label
                    className="doc_set_upload_inner"
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureChange}
                      style={{ display: "none" }}
                    />
                    <FiUploadCloud className="doc_set_upload_icon" />
                    <strong>Upload Signature Path</strong>
                    <span>SVG, PNG or JPG (Max 500kb)</span>
                    <span
                      className="doc_set_btn_ghost"
                      style={{ marginTop: "10px", display: "inline-block" }}
                    >
                      Browse Files
                    </span>
                  </label>
                </div>
              </div>

              <div className="doc_set_action_footer">
                <button
                  className="doc_set_btn_primary"
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <FiLoader className="spin" />
                  ) : saveSuccess ? (
                    <FiCheck />
                  ) : null}
                  {loading
                    ? " Synchronizing..."
                    : saveSuccess
                      ? " Changes Applied"
                      : " Save Profile Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="doc_set_tab_view doc_set_fade_in">
              <div className="doc_set_card">
                <div className="doc_set_card_title_node">
                  <h3>Threshold Alerts</h3>
                  <p>
                    System notifications triggered by clinical performance
                    drops.
                  </p>
                </div>
                <div className="doc_set_toggle_list">
                  <div className="doc_set_toggle_item">
                    <div className="doc_set_toggle_text">
                      <strong>Patient Satisfaction Floor</strong>
                      <span>Notify if average rating falls below 4.8</span>
                    </div>
                    <label className="doc_set_switch">
                      <input type="checkbox" defaultChecked />
                      <span className="doc_set_slider doc_set_round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="doc_set_tab_view doc_set_fade_in">
              <div className="doc_set_card doc_set_span_full">
                <div className="doc_set_card_title_node">
                  <h3>Secure Export Center</h3>
                  <p>Generate and download encrypted clinical data reports.</p>
                </div>
                <div className="doc_set_export_grid">
                  <div className="doc_set_export_node">
                    <div className="doc_set_node_info">
                      <FiFileText className="doc_set_node_icon" />
                      <div>
                        <strong>Patient Registry</strong>
                        <p>Full history • CSV format</p>
                      </div>
                    </div>
                    <button className="doc_set_btn_minimal">Generate</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
