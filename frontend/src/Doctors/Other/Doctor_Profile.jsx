import React, { useState, useMemo } from "react";
import doctorsList from "../../Assets/Data/doctor.json";
import { 
  FaUser, FaEnvelope, FaIdCard, FaStethoscope, 
  FaGraduationCap, FaEdit, FaSave, FaTimes, FaChartLine, FaHistory 
} from "react-icons/fa";
import "./Doctor_Profile.css";

export default function Profile() {
  // --- DATA INITIALIZATION ---
  const initialDoctorData = useMemo(() => {
    const doc = doctorsList.find(d => d.id === "DOC-001") || doctorsList[0];
    return {
      ...doc,
      firstName: doc.name.split(" ")[1] || doc.name,
      lastName: doc.name.split(" ")[2] || "",
    };
  }, []);

  // --- STATE MANAGEMENT ---
  const [formState, setFormState] = useState(initialDoctorData);
  const [isEditing, setIsEditing] = useState(false);

  // --- HANDLERS ---
  const handleChange = (key, value) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Clinical Registry Updated:", formState);
  };

  return (
    <div className="med_profile_root med_page_fade_in">
      <div className="med_profile_grid">
        
        {/* LEFT: IDENTITY & QUICK STATS */}
        <div className="med_identity_sidebar">
          <div className="med_card_refined med_id_card">
            <div className="med_avatar_wrapper">
              <img src={formState.photo} alt={formState.name} className="med_profile_image" />
              <div className={`med_status_indicator ${formState.availability.toLowerCase()}`}></div>
            </div>
            
            <div className="med_id_text">
              <h2>{formState.name}</h2>
              <span className="med_qual_badge">{formState.degrees}</span>
              <p className="med_spec_label">{formState.department} Specialist</p>
            </div>

            <div className="med_id_stats_row">
               <div className="id_stat_node">
                  <label>Appointments</label>
                  <strong>{formState.totalAppointments}</strong>
               </div>
               <div className="id_stat_node">
                  <label>Patients</label>
                  <strong>{formState.totalPatients}</strong>
               </div>
            </div>

            <div className="med_id_actions">
              {isEditing ? (
                <div className="med_action_group_flex">
                  <button className="med_btn_primary" onClick={handleSave}><FaSave /> Save Changes</button>
                  <button className="med_btn_outline" onClick={() => setIsEditing(false)}><FaTimes /> Cancel</button>
                </div>
              ) : (
                <button className="med_btn_primary full_width" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Modify Practitioner Info
                </button>
              )}
            </div>
          </div>

          {/* PERFORMANCE SNAPSHOT */}
          <div className="med_card_refined med_mini_chart_card">
             <div className="card_head_elite">
                <FaChartLine className="icon_blue" />
                <h4>Performance Indices</h4>
             </div>
             <div className="mini_perf_grid">
                {formState.performanceStats.map((stat, i) => (
                  <div key={i} className="perf_bar_container">
                     <div className="perf_bar_fill" style={{ height: `${stat}%` }}></div>
                     <span>Q{i+1}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT: COMPREHENSIVE REGISTRY */}
        <div className="med_data_registry">
          <div className="med_details_grid">
            
            {/* CORE IDENTITY */}
            <div className="med_card_refined">
              <div className="card_head_elite">
                <FaIdCard className="icon_blue" />
                <h4>Registry Identification</h4>
              </div>
              <div className="med_form_compact">
                <div className="med_field">
                  <label>Practitioner ID</label>
                  <p className="med_readonly_val">{formState.id}</p>
                </div>
                <div className="med_field">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input type="text" value={formState.name} onChange={e => handleChange("name", e.target.value)} />
                  ) : (
                    <p>{formState.name}</p>
                  )}
                </div>
                <div className="med_field">
                  <label>Academic Degrees</label>
                  {isEditing ? (
                    <input type="text" value={formState.degrees} onChange={e => handleChange("degrees", e.target.value)} />
                  ) : (
                    <p>{formState.degrees}</p>
                  )}
                </div>
              </div>
            </div>

            {/* CLINICAL ASSIGNMENT */}
            <div className="med_card_refined">
              <div className="card_head_elite">
                <FaStethoscope className="icon_blue" />
                <h4>Clinical Assignment</h4>
              </div>
              <div className="med_form_compact">
                <div className="med_field">
                  <label>Primary Department</label>
                  {isEditing ? (
                    <input type="text" value={formState.department} onChange={e => handleChange("department", e.target.value)} />
                  ) : (
                    <p>{formState.department}</p>
                  )}
                </div>
                <div className="med_field">
                  <label>System Availability</label>
                  <p className={`status_text ${formState.availability.toLowerCase()}`}>
                    {formState.availability}
                  </p>
                </div>
              </div>
            </div>

            {/* CASE HISTORY LOG */}
            <div className="med_card_refined span_full">
              <div className="card_head_elite">
                <FaHistory className="icon_blue" />
                <h4>Recent Case History</h4>
              </div>
              <div className="med_history_scroll_area">
                <table className="med_history_table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Consultation Date</th>
                      <th className="text_right">Reference ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formState.appointmentHistory.map((caseItem, idx) => (
                      <tr key={idx}>
                        <td><strong>{caseItem.patient}</strong></td>
                        <td>{caseItem.date}</td>
                        <td className="text_right">#CS-{1000 + idx}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}