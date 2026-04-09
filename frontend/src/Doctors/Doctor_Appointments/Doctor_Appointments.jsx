import React, { useMemo, useState } from "react";
import data from "../../Assets/Data/doctorsData.json";
import patientPhoto from "../../Assets/Images/Doctor/doctor_profile1.webp";
import { 
  FiClock, FiDownload, FiCalendar, FiZap, FiArrowLeft, 
  FiPhone, FiMail, FiMapPin, FiActivity, FiPlus, FiHash, FiExternalLink, FiCheckCircle
} from "react-icons/fi";
import "./Doctor_Appointments.css";

// --- CLINICAL LOGIC HELPERS ---
function parseTimeSlot(timeSlot) {
  const [time, modifier] = timeSlot.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

function classify(appt, now) {
  const s = new Date(appt.start);
  const n = new Date(now);
  if (s.toDateString() === n.toDateString()) return "ongoing";
  if (s > n) return "upcoming";
  return "previous";
}

export default function DoctorAppointments() {
  // --- STATE MANAGEMENT ---
  const [filterMode, setFilterMode] = useState("ongoing");
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // --- DATA ENGINE ---
  const initialAppointments = useMemo(() => {
    return (data.patientDetails || []).map(p => {
      const time24 = parseTimeSlot(p.timeSlot);
      const startISO = `${p.appointmentDate}T${time24}:00+05:30`;
      const start = new Date(startISO);
      return {
        id: p.patientId,
        patient: p.name,
        start: start.toISOString(),
        date: p.appointmentDate,
        time: p.timeSlot,
        type: p.type || "Routine",
        pastData: p.Past_Data || null,
        prescription: p.Past_Data?.prescription?.join(", ") || "", 
      };
    });
  }, []);

  const [listData, setListData] = useState(initialAppointments);

  const items = useMemo(() => {
    const now = new Date();
    return listData.map(a => ({ ...a, status: classify(a, now) }));
  }, [listData]);

  const list = items.filter(a => a.status === filterMode);

  // --- HANDLERS ---
  const handleOpenWorkspace = (appt) => {
    setSelectedAppt(appt);
    setIsDetailView(true);
    window.scrollTo(0, 0);
  };

  const handleSaveSession = (id, text) => {
      setListData(prev => prev.map(ap => ap.id === id ? { ...ap, prescription: text } : ap));
      alert("Clinical Record Finalized and Synced.");
      setIsDetailView(false);
  };

  return (
    <div className="da_med-doc-appt da_med_page_fade_in">
      
      {!isDetailView ? (
        <div className="da_med_main_list_view">
          
          {/* DASHBOARD HEADER */}
          <div className="da_med_section_header">
            <div className="da_med_branding">
              <h1 className="da_med_title_elite">Clinical <span className="da_highlight">Console</span></h1>
              <p className="da_med_subtitle">Medical Informatics Workspace</p>
            </div>

            <div className="da_dr_segmented_control">
               {["previous", "ongoing", "upcoming"].map(mode => (
                 <button 
                    key={mode}
                    className={filterMode === mode ? "da_active" : ""} 
                    onClick={() => setFilterMode(mode)}
                 >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                 </button>
               ))}
            </div>

            <div className="da_med_action_group">
              <button className="da_med_btn_outline"><FiDownload /> Export Reports</button>
            </div>
          </div>

          {/* DYNAMIC CASE LOAD VIEW */}
          <div className="da_dr_content_engine">
            {filterMode === "ongoing" ? (
              <div className="da_dr_card_grid_pro">
                {list.length > 0 ? list.map(a => (
                  <div key={a.id} className="da_dr_session_card_elite">
                    <div className="da_card_accent_bar"></div>
                    <div className="da_card_header_main">
                      <div className="da_pat_avatar_ring"><img src={patientPhoto} alt="Patient" /></div>
                      <div className="da_pat_id_stack">
                        <strong>{a.patient}</strong>
                        <span>UID: #PT-{a.id}</span>
                      </div>
                      <div className="da_live_ping_badge"><span className="da_ping_dot"></span> Active</div>
                    </div>
                    <div className="da_card_body_info">
                      <div className="da_meta_row"><FiClock /> Scheduled: {a.time}</div>
                      <div className="da_meta_row"><FiZap /> {a.type} Consultation</div>
                    </div>
                    <div className="da_card_action_footer">
                      <button className="da_med_btn_manage_full" onClick={() => handleOpenWorkspace(a)}>
                         Open Workspace <FiExternalLink size={14} style={{marginLeft: '8px'}}/>
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="da_dr_empty_slate">No patient sessions found for today.</div>
                )}
              </div>
            ) : (
              <div className="da_med_table_container">
                <table className="da_med_table">
                  <thead>
                    <tr>
                      <th>Patient Identity</th>
                      <th>Scheduled Slot</th>
                      <th>Consult Category</th>
                      <th>EHR Status</th>
                      <th className="da_text_right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((appt) => (
                      <tr key={appt.id}>
                        <td>
                          <div className="da_med_cell_user">
                            <img src={patientPhoto} alt="" />
                            <div><b>{appt.patient}</b><span>ID: {appt.id}</span></div>
                          </div>
                        </td>
                        <td>
                          <div className="da_med_cell_time">
                            <span className="da_date">{appt.date}</span>
                            <span className="da_time">{appt.time}</span>
                          </div>
                        </td>
                        <td><span className={`da_med_tag ${appt.type.toLowerCase()}`}>{appt.type}</span></td>
                        <td>
                            <span className={`da_med_status_pill ${filterMode}`}>
                                {filterMode === 'upcoming' ? 'Confirmed' : 'Archived'}
                            </span>
                        </td>
                        <td className="da_text_right">
                          <button className="da_med_btn_manage" onClick={() => handleOpenWorkspace(appt)}>Review Case</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- FULL CLINICAL WORKSPACE --- */
        <div className="da_med_detail_workspace da_med_page_fade_in">
          
          <div className="da_med_detail_nav">
            <button className="da_med_back_btn" onClick={() => setIsDetailView(false)}>
              <FiArrowLeft size={18}/> Return to Console
            </button>
            <div className="da_med_case_id_badge">EHR Reference: <b>#MED-2026-X-{selectedAppt.id}</b></div>
          </div>

          <div className={`da_med_bento_grid_refined ${filterMode === 'upcoming' ? 'da_upcoming_layout' : ''}`}>
            
            {/* IDENTITY MODULE */}
            <div className="da_med_card_refined da_med_pat_identity_card">
              <span className="da_med_label_micro">Patient Demographics</span>
              <div className="da_med_pat_main_stack">
                <div className="da_med_pat_vertical_header">
                  <img src={patientPhoto} alt="Patient" className="da_med_avatar_compact" />
                  <div className="da_med_pat_name_stack">
                    <h2>{selectedAppt.patient}</h2>
                    <span className="da_id_pill">UID: #PT-{selectedAppt.id}</span>
                  </div>
                </div>
                <div className="da_med_pat_contact_vertical">
                  <div className="da_contact_line">
                    <div className="da_icon_circ"><FiPhone /></div> 
                    <span>+91 90000 88888</span>
                  </div>
                  <div className="da_contact_line">
                    <div className="da_icon_circ"><FiMail /></div> 
                    <span>{selectedAppt.patient.split(' ')[0].toLowerCase()}@medico.com</span>
                  </div>
                  <div className="da_contact_line">
                    <div className="da_icon_circ"><FiMapPin /></div> 
                    <span>Medical Wing B, Floor 2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CLINICAL HISTORY SIDEBAR */}
            <div className="da_med_card_refined da_med_past_history_sidebar">
               <span className="da_med_label_micro">Clinical History (Global)</span>
               <div className="da_history_timeline_stack">
                  {selectedAppt.pastData ? (
                    <div className="da_timeline_item">
                        <div className="da_timeline_date_badge">
                            <span className="da_day">{selectedAppt.pastData.dateOfVisit.split('-')[2]}</span>
                            <span className="da_month">Apr' 26</span>
                        </div>
                        <div className="da_t_content">
                            <strong>Global Medical Observation</strong>
                            <p><i>Notes:</i> {selectedAppt.pastData.remarks}</p>
                            <div className="da_past_dr_tag">Consultant: Dr. {selectedAppt.pastData.doctor || "Staff"}</div>
                        </div>
                    </div>
                  ) : (
                    <div className="da_no_data_placeholder">
                        <FiActivity size={24}/>
                        <p>No historical records found.</p>
                    </div>
                  )}
               </div>
            </div>

            {/* SESSION LOGISTICS */}
            {filterMode !== "upcoming" && (
                <div className="da_med_card_refined da_med_appt_hero_card">
                    <span className="da_med_label_micro">Session Information</span>
                    <div className="da_med_logistics_grid">
                        <div className="da_logistics_item">
                            <div className="da_log_icon"><FiCalendar /></div>
                            <div className="da_log_text">
                                <label>Date</label>
                                <strong>{selectedAppt.date}</strong>
                            </div>
                        </div>
                        <div className="da_logistics_item">
                            <div className="da_log_icon"><FiClock /></div>
                            <div className="da_log_text">
                                <label>Slot</label>
                                <strong>{selectedAppt.time}</strong>
                            </div>
                        </div>
                        <div className="da_logistics_item">
                            <div className="da_log_icon"><FiZap /></div>
                            <div className="da_log_text">
                                <label>Category</label>
                                <span className={`da_c_tag ${selectedAppt.type.toLowerCase()}`}>{selectedAppt.type}</span>
                            </div>
                        </div>
                        <div className="da_logistics_item">
                            <div className="da_log_icon"><FiHash /></div>
                            <div className="da_log_text">
                                <label>Visit ID</label>
                                <strong>#VST-0{selectedAppt.id}</strong>
                            </div>
                        </div>
                    </div>
                    <div className="da_med_compact_notes_inline">
                        <label>Chief Complaints</label>
                        <p>{selectedAppt.pastData?.remarks || "Patient arrived for standard review. No acute stressors identified."}</p>
                    </div>
                </div>
            )}

            {/* PRESCRIPTION WORKSPACE */}
            {filterMode !== "upcoming" && (
                <div className="da_med_card_refined da_med_prescription_workspace">
                  <span className="da_med_label_micro">
                    {filterMode === "ongoing" ? "Digital Prescription Pad" : "Historical Prescription Archive"}
                  </span>
                  <div className="da_prescription_engine_layout">
                    <textarea 
                       readOnly={filterMode === "previous"}
                       className={filterMode === "previous" ? "da_readonly_area" : ""}
                       placeholder={filterMode === "ongoing" ? "Input clinical diagnosis, drug names, frequency, and instructions..." : "No prescription data available."}
                       value={selectedAppt.prescription}
                       onChange={(e) => filterMode === "ongoing" && setSelectedAppt({...selectedAppt, prescription: e.target.value})}
                    />
                    <div className="da_presc_footer">
                       {filterMode === "ongoing" ? (
                         <>
                             <button className="da_med_btn_outline_small" onClick={() => alert("Follow-up Scheduler Ready")}><FiPlus /> Add Follow-up Slot</button>
                             <button className="da_med_btn_submit_final" onClick={() => handleSaveSession(selectedAppt.id, selectedAppt.prescription)}>Authorize & Save Session</button>
                         </>
                       ) : <div className="da_presc_status_verified"><FiCheckCircle /> Verified Clinical Record</div>}
                    </div>
                  </div>
                </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}