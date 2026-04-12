import React, { useState, useMemo } from "react";
import doctorsList from "../../Assets/Data/doctor.json";
import { 
  FaIdCard, FaStethoscope, FaEdit, FaSave, 
  FaTimes, FaUserMd, FaPhoneAlt, FaEnvelope, 
  FaAward, FaHospitalUser 
} from "react-icons/fa";
import "./Doctor_Profile.css";

export default function Profile() {
  const initialDoctorData = useMemo(() => {
    const doc = doctorsList.find(d => d.id === "DOC-006") || doctorsList[0] || {};
    return {
      ...doc,
      bio: "Dedicated medical professional with extensive experience in clinical diagnosis and patient-centered care. Committed to staying updated with the latest medical advancements.",
      languages: ["English", "Hindi", "Marathi"],
      experience: "12+ Years"
    };
  }, []);

  const [formState, setFormState] = useState(initialDoctorData);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (key, value) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="doc_prof_m_root doc_prof_m_fade_in">
      <div className="doc_prof_m_grid">
        
        {/* LEFT: IDENTITY COLUMN */}
        <aside className="doc_prof_m_sidebar">
          <div className="doc_prof_m_card doc_prof_m_identity">
            <div className="doc_prof_m_avatar_wrapper">
              <img src={formState.photo} alt={formState.name} className="doc_prof_m_img" />
              <div className={`doc_prof_m_status ${formState.availability?.toLowerCase() || 'busy'}`}></div>
            </div>
            
            <div className="doc_prof_m_id_text">
              <h2>{formState.name}</h2>
              <span className="doc_prof_m_qual">{formState.degrees}</span>
              <p className="doc_prof_m_dept_tag">{formState.department} Specialist</p>
            </div>

            <div className="doc_prof_m_stats_row">
               <div className="doc_prof_m_stat_node">
                  <label>Experience</label>
                  <strong>{formState.experience}</strong>
               </div>
               <div className="doc_prof_m_stat_node">
                  <label>Case Load</label>
                  <strong>{formState.totalPatients || 0}+</strong>
               </div>
            </div>

            <div className="doc_prof_m_actions">
              {isEditing ? (
                <div className="doc_prof_m_btn_group">
                  <button className="doc_prof_m_btn_primary" onClick={handleSave}><FaSave /> Save</button>
                  <button className="doc_prof_m_btn_outline" onClick={() => setIsEditing(false)}><FaTimes /> Cancel</button>
                </div>
              ) : (
                <button className="doc_prof_m_btn_primary full_width" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT: INFORMATION REGISTRY */}
        <main className="doc_prof_m_main">
          
          {/* PROFESSIONAL BIO */}
          <section className="doc_prof_m_card">
            <div className="doc_prof_m_card_header">
              <FaUserMd className="doc_prof_m_icon" />
              <h4>Professional Summary</h4>
            </div>
            <div className="doc_prof_m_content">
              {isEditing ? (
                <textarea 
                  className="doc_prof_m_textarea"
                  value={formState.bio} 
                  onChange={e => handleChange("bio", e.target.value)}
                  rows="4"
                />
              ) : (
                <p className="doc_prof_m_bio_text">{formState.bio}</p>
              )}
            </div>
          </section>

          <div className="doc_prof_m_details_grid">
            {/* CLINICAL COMPETENCIES */}
            <section className="doc_prof_m_card">
              <div className="doc_prof_m_card_header">
                <FaStethoscope className="doc_prof_m_icon" />
                <h4>Clinical Domain</h4>
              </div>
              <div className="doc_prof_m_form">
                <div className="doc_prof_m_field">
                  <label>Primary Specialty</label>
                  <p>{formState.department}</p>
                </div>
                <div className="doc_prof_m_field">
                  <label>Clinical Status</label>
                  <p className={`doc_prof_m_status_text ${formState.availability?.toLowerCase()}`}>
                    {formState.availability}
                  </p>
                </div>
              </div>
            </section>

            {/* CONTACT CREDENTIALS */}
            <section className="doc_prof_m_card">
              <div className="doc_prof_m_card_header">
                <FaHospitalUser className="doc_prof_m_icon" />
                <h4>Contact Registry</h4>
              </div>
              <div className="doc_prof_m_form">
                <div className="doc_prof_m_field">
                  <label><FaEnvelope /> Official Email</label>
                  <p>{formState.email || "practitioner@medico.com"}</p>
                </div>
                <div className="doc_prof_m_field">
                  <label><FaPhoneAlt /> Clinical Extension</label>
                  <p>{formState.phone || "+91 98220 11223"}</p>
                </div>
              </div>
            </section>

            {/* ACADEMIC & CERTIFICATION */}
            <section className="doc_prof_m_card span_full">
              <div className="doc_prof_m_card_header">
                <FaAward className="doc_prof_m_icon" />
                <h4>Academic & Legal Credentials</h4>
              </div>
              <div className="doc_prof_m_info_grid">
                <div className="doc_prof_m_field">
                  <label>Medical License No.</label>
                  <p className="doc_prof_m_readonly">{formState.id}</p>
                </div>
                <div className="doc_prof_m_field">
                  <label>Board Certification</label>
                  <p>{formState.degrees}</p>
                </div>
                <div className="doc_prof_m_field">
                  <label>Languages Spoken</label>
                  <p>{formState.languages.join(", ")}</p>
                </div>
              </div>
            </section>
          </div>
        </main>

      </div>
    </div>
  );
}