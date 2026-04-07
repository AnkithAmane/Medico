import React, { useState } from "react";
import { 
  Search, Calendar, ChevronRight, Download, 
  X, Clock, Plus, Phone, Mail, ArrowLeft, Activity, MapPin, FileText, CheckCircle 
} from "lucide-react";
import "./Appointment_Management.css";

export default function Appointment_Management() {
  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // NEW: Status filter state
  const [dateFilter, setDateFilter] = useState("");
  
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);

  // 1. FULL DATA ARRAY (JSON-READY)
  const [appointments] = useState([
    {
      id: 1,
      patient: "John Doe",
      doctor: "Dr. Ramesh Babu",
      department: "Cardiology",
      date: "2026-03-30",
      time: "10:00 AM",
      type: "Emergency",
      status: "Upcoming",
      notes: "High blood pressure history. Patient requires immediate ECG monitoring.",
      patientPhoto: "https://i.pravatar.cc/150?u=john",
      doctorPhoto: "https://i.pravatar.cc/150?u=ramesh",
      history: ["2026-03-15 - Routine", "2026-02-10 - Follow-up"],
    },
    {
      id: 2,
      patient: "Priya Sharma",
      doctor: "Dr. Priya V",
      department: "Orthopedics",
      date: "2026-03-29",
      time: "02:30 PM",
      type: "Routine",
      status: "Completed",
      notes: "Post-surgery checkup. Recovery is progressing well.",
      patientPhoto: "https://i.pravatar.cc/150?u=priya",
      doctorPhoto: "https://i.pravatar.cc/150?u=drpriya",
      history: ["2026-02-20 - Surgery", "2026-01-15 - Consultation"],
    }
  ]);

  // --- LOGIC: FILTERING (ENHANCED) ---
  const filtered = appointments.filter(a => {
    const matchesSearch = a.patient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept ? a.department === filterDept : true;
    const matchesType = filterType ? a.type === filterType : true;
    const matchesStatus = filterStatus ? a.status === filterStatus : true; // Matches Status Filter
    const matchesDate = dateFilter ? a.date === dateFilter : true;
    
    return matchesSearch && matchesDept && matchesType && matchesStatus && matchesDate;
  });

  // --- HANDLERS ---
  const handleViewDetails = (appt) => {
    setSelectedAppointment(appt);
    setIsDetailView(true);
  };

  const closeDetails = () => {
    setIsDetailView(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="med_page_fade_in">
      {!isDetailView ? (
        <div className="med_main_list_view">
          {/* HEADER */}
          <div className="med_section_header">
            <div className="med_branding">
              <h1 className="med_title_elite">Clinical <span className="highlight">Appointments</span></h1>
              <p className="med_subtitle">{filtered.length} active sessions found</p>
            </div>
            <div className="med_action_group">
              <button className="med_btn_outline" onClick={() => alert("CSV Exported")}>
                <Download size={16}/> Export
              </button>
              <button className="med_btn_primary" onClick={() => setShowForm(true)}>
                <Plus size={18}/> New Booking
              </button>
            </div>
          </div>

          {/* FILTER SUITE (Updated with Status) */}
          <div className="med_filter_bar">
            <div className="med_search_box">
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search by patient name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            
            <div className="med_dropdown_group">
              <select className="med_select_filter" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General Medicine">General Medicine</option>
              </select>

              {/* NEW STATUS FILTER */}
              <select className="med_select_filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="Upcoming">Upcoming / Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select className="med_select_filter" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Type</option>
                <option value="Emergency">Emergency</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Routine">Routine</option>
              </select>

              <input type="date" className="med_date_filter" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
              
              {(searchTerm || filterDept || filterType || filterStatus || dateFilter) && (
                <button className="med_clear_btn" onClick={() => {
                  setSearchTerm("");
                  setFilterDept("");
                  setFilterType("");
                  setFilterStatus("");
                  setDateFilter("");
                }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* TABLE VIEW */}
          <div className="med_table_container">
            <table className="med_table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Specialist</th>
                  <th>Schedule</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th className="text_right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div className="med_cell_user">
                        <img src={appt.patientPhoto} alt="" />
                        <div><b>{appt.patient}</b><span>#PT-{appt.id}</span></div>
                      </div>
                    </td>
                    <td className="med_text_bold">{appt.doctor}</td>
                    <td>
                      <div className="med_cell_time">
                        <span className="date">{appt.date}</span>
                        <span className="time">{appt.time}</span>
                      </div>
                    </td>
                    <td><span className={`med_tag ${appt.type.toLowerCase()}`}>{appt.type}</span></td>
                    <td><span className={`med_status ${appt.status.toLowerCase()}`}>{appt.status}</span></td>
                    <td className="text_right">
                      <button className="med_btn_manage" onClick={() => handleViewDetails(appt)}>View File</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DETAIL PANEL VIEW */
        <div className="med_detail_view">
          <div className="med_detail_nav">
            <button className="med_back_btn" onClick={closeDetails}>
              <ArrowLeft size={18}/> Back to Appointments
            </button>
            <div className="med_case_id_badge">
              Reference ID: <b>#MS-2026-00{selectedAppointment.id}</b>
            </div>
          </div>

          <div className="med_bento_grid_refined">
            {/* DOCTOR SECTION */}
            <div className="med_card_refined med_doc_profile_vertical">
              <span className="med_label_micro">Attending Specialist</span>
              <div className="med_doc_main_stack">
                <div className="med_doc_identity_row">
                  <img src={selectedAppointment.doctorPhoto} alt="Doctor" className="med_avatar_executive" />
                  <div className="med_doc_name_group">
                    <h2>{selectedAppointment.doctor}</h2>
                    <p className="med_specialty_tag">{selectedAppointment.department} Specialist</p>
                  </div>
                </div>
                <div className="med_doc_meta_grid">
                  <div className="meta_item"><Clock size={14}/> <b>Shift:</b> 09:00 AM - 05:00 PM</div>
                  <div className="meta_item"><MapPin size={14}/> <b>Location:</b> Tower A, Room 402</div>
                </div>
              </div>
            </div>

            {/* APPOINTMENT SECTION */}
            <div className="med_card_refined med_appt_compact_hero">
              <span className="med_label_micro">Schedule details</span>
              <div className="med_compact_time_grid">
                <div className="c_time_block">
                  <label>Date</label>
                  <div className="c_value">{selectedAppointment.date}</div>
                </div>
                <div className="c_time_block">
                  <label>Time</label>
                  <div className="c_value">{selectedAppointment.time}</div>
                </div>
                <div className="c_time_block">
                  <label>Type</label>
                  <div className={`c_tag ${selectedAppointment.type.toLowerCase()}`}>{selectedAppointment.type}</div>
                </div>
              </div>
              <div className="med_compact_notes">
                <label>Clinical Notes</label>
                <p>{selectedAppointment.notes}</p>
              </div>
            </div>

            {/* PATIENT SECTION */}
            <div className="med_card_refined med_patient_info_compact">
              <span className="med_label_micro">Patient Record Profile</span>
              <div className="med_patient_mini_layout">
                <div className="p_identity_mini">
                  <img src={selectedAppointment.patientPhoto} alt="Patient" className="med_avatar_small_circle" />
                  <div className="p_text_mini">
                    <h4>{selectedAppointment.patient}</h4>
                    <span>ID: P-990822</span>
                  </div>
                </div>
                <div className="p_meta_grid_mini">
                  <div className="p_meta_item"><Phone size={12}/> +91 90000 88888</div>
                  <div className="p_meta_item"><Mail size={12}/> {selectedAppointment.patient.toLowerCase().split(' ')[0]}@med.com</div>
                  <div className="p_meta_item"><Activity size={12}/> Blood: O+ve</div>
                  <div className="p_meta_item"><Calendar size={12}/> Age: 28</div>
                </div>
              </div>
            </div>

            {/* HISTORY SECTION */}
            <div className="med_card_refined med_history_extended">
              <span className="med_label_micro">Linked Consultation History</span>
              <div className="med_history_list_pro">
                <div className="h_pro_header">
                  <span>Schedule</span>
                  <span>Diagnosis</span>
                  <span>Observations & Remarks</span>
                  <span className="text_right">Records</span>
                </div>
                {selectedAppointment.history.map((h, i) => (
                  <div key={i} className="h_pro_row">
                    <div className="h_time_col">
                      <div className="h_date_flex">
                        <b>{h.split(' - ')[0]}</b>
                        <span className="h_time_pill">02:30 PM</span>
                      </div>
                    </div>
                    <div className="h_diag_col">{h.split(' - ')[1]}</div>
                    <div className="h_remarks_col">Patient showing stable recovery.</div>
                    <div className="h_action_col text_right">
                      <button className="med_btn_view_small"><FileText size={14} /> <span>View File</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div className="med_modal_overlay">
          <div className="med_modal_content">
            <div className="med_modal_header">
              <h3>Create <span>Appointment</span></h3>
              <button onClick={() => setShowForm(false)} className="med_modal_close"><X size={20}/></button>
            </div>
            <form className="med_form_body">
              <div className="med_input_group">
                <label>Patient Name</label>
                <input type="text" placeholder="Full legal name" />
              </div>
              <div className="med_form_row">
                <div className="med_input_group">
                  <label>Date</label>
                  <input type="date" />
                </div>
                <div className="med_input_group">
                  <label>Time Slot</label>
                  <input type="time" />
                </div>
              </div>
              <div className="med_input_group">
                <label>Consulting Doctor</label>
                <select><option>Select Doctor</option></select>
              </div>
              <button type="submit" className="med_btn_submit_final">Confirm Booking</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}