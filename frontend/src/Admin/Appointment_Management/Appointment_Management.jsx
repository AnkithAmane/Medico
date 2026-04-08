import React, { useState, useMemo } from "react";
import { 
  Search, Calendar, ChevronRight, Download, 
  X, Clock, Plus, Phone, Mail, ArrowLeft, Activity, MapPin, FileText, CheckCircle,
  ChevronLeft
} from "lucide-react";

// --- DATA IMPORTS ---
import appointmentsData from "../../Assets/Data/appointment.json"; 
import "./Appointment_Management.css";

export default function Appointment_Management() {
  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // --- DATA INITIALIZATION ---
  const [appointments] = useState(appointmentsData);

  // --- LOGIC: FILTERING ---
  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const patientName = (a.patient || "").toLowerCase();
      const matchesSearch = patientName.includes(searchTerm.toLowerCase());
      const matchesDept = filterDept ? a.department === filterDept : true;
      const matchesType = filterType ? a.type === filterType : true;
      const matchesStatus = filterStatus ? a.status === filterStatus : true;
      const matchesDate = dateFilter ? a.date === dateFilter : true;
      
      return matchesSearch && matchesDept && matchesType && matchesStatus && matchesDate;
    });
  }, [searchTerm, filterDept, filterType, filterStatus, dateFilter, appointments]);

  // --- LOGIC: PAGINATION CALCULATIONS ---
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentAppointments = filtered.slice(indexOfFirstRow, indexOfLastRow);

  // --- LOGIC: DYNAMIC HISTORY ---
  const getConsultationHistory = (currentAppt) => {
    if (!currentAppt) return [];
    return appointments
      .filter(a => 
        (a.patient || "") === (currentAppt.patient || "") && 
        (a.doctor || "") === (currentAppt.doctor || "") && 
        a.id !== currentAppt.id &&
        new Date(a.date) < new Date(currentAppt.date)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // --- HANDLERS ---
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      const container = document.querySelector(".med_table_container");
      if (container) container.scrollTop = 0;
    }
  };

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
        /* --- DIRECTORY VIEW --- */
        <div className="med_main_list_view">
          
          {/* HEADER SECTION */}
          <div className="med_section_header">
            <div className="med_branding">
              <h1 className="med_title_elite">Clinical <span className="highlight">Appointments</span></h1>
              <p className="med_subtitle">{filtered.length} total records found</p>
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

          {/* FILTER TOOLBAR */}
          <div className="med_filter_bar">
            <div className="med_search_box">
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search patient name..." 
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
              />
            </div>
            
            <div className="med_dropdown_group">
              <select className="med_select_filter" value={filterDept} onChange={(e) => {setFilterDept(e.target.value); setCurrentPage(1);}}>
                <option value="">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Gastroenterology">Gastroenterology</option>
              </select>

              <select className="med_select_filter" value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}>
                <option value="">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <input type="date" className="med_date_filter" value={dateFilter} onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}} />
              
              {(searchTerm || filterDept || filterStatus || dateFilter) && (
                <button className="med_clear_btn" onClick={() => {
                  setSearchTerm(""); setFilterDept(""); setFilterStatus(""); setDateFilter(""); setCurrentPage(1);
                }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* DATA REGISTRY TABLE */}
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
                {currentAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div className="med_cell_user">
                        <img src={appt.patientPhoto || "https://i.pravatar.cc/150"} alt="" />
                        <div><b>{appt.patient || "Unknown"}</b><span>ID: #{appt.id + 1000}</span></div>
                      </div>
                    </td>
                    <td className="med_text_bold">{appt.doctor || "Unassigned"}</td>
                    <td>
                      <div className="med_cell_time">
                        <span className="date">{appt.date}</span>
                        <span className="time">{appt.time}</span>
                      </div>
                    </td>
                    <td><span className={`med_tag ${(appt.type || "routine").toLowerCase()}`}>{appt.type}</span></td>
                    <td><span className={`med_status ${(appt.status || "upcoming").toLowerCase()}`}>{appt.status}</span></td>
                    <td className="text_right">
                      <button className="med_btn_manage" onClick={() => handleViewDetails(appt)}>View File</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION NAVIGATION */}
          <div className="med_pagination_bar">
            <div className="pag_info">
              Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filtered.length)}</b> of <b>{filtered.length}</b> records
            </div>
            <div className="pag_buttons">
              <button className="pag_nav_btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft size={16}/>
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button key={i} className={`pag_num_btn ${currentPage === page ? 'active' : ''}`} onClick={() => handlePageChange(page)}>
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={i} className="pag_ellipsis">...</span>;
                }
                return null;
              })}

              <button className="pag_nav_btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* --- CLINICAL DETAIL WORKSPACE --- */
        <div className="med_detail_view">
          <div className="med_detail_nav">
            <button className="med_back_btn" onClick={closeDetails}>
              <ArrowLeft size={18}/> Back to Appointments
            </button>
            <div className="med_case_id_badge">Reference ID: <b>#MS-2026-00{selectedAppointment.id}</b></div>
          </div>

          <div className="med_bento_grid_refined">
            {/* SPECIALIST MODULE */}
            <div className="med_card_refined med_doc_profile_vertical">
              <span className="med_label_micro">Attending Specialist</span>
              <div className="med_doc_main_stack">
                <div className="med_doc_identity_row">
                  <img src={selectedAppointment.doctorPhoto || "https://i.pravatar.cc/150"} alt="Doctor" className="med_avatar_executive" />
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

            {/* CASE LOGISTICS MODULE */}
            <div className="med_card_refined med_appt_compact_hero">
              <span className="med_label_micro">Schedule details</span>
              <div className="med_compact_time_grid">
                <div className="c_time_block"><label>Date</label><div className="c_value">{selectedAppointment.date}</div></div>
                <div className="c_time_block"><label>Time</label><div className="c_value">{selectedAppointment.time}</div></div>
                <div className="c_time_block"><label>Type</label><div className={`c_tag ${(selectedAppointment.type || "").toLowerCase()}`}>{selectedAppointment.type}</div></div>
              </div>
              <div className="med_compact_notes"><label>Clinical Notes</label><p>{selectedAppointment.notes || "No notes."}</p></div>
            </div>

            {/* PATIENT PROFILE MODULE */}
            <div className="med_card_refined med_patient_info_compact">
              <span className="med_label_micro">Patient Record Profile</span>
              <div className="med_patient_mini_layout">
                <div className="p_identity_mini">
                  <img src={selectedAppointment.patientPhoto || "https://i.pravatar.cc/150"} alt="Patient" className="med_avatar_small_circle" />
                  <div className="p_text_mini"><h4>{selectedAppointment.patient}</h4><span>ID: #PT-{selectedAppointment.id}</span></div>
                </div>
                <div className="p_meta_grid_mini">
                  <div className="p_meta_item"><Phone size={12}/> +91 90000 88888</div>
                  <div className="p_meta_item"><Mail size={12}/> {selectedAppointment.patient?.toLowerCase().split(' ')[0]}@medico.com</div>
                  <div className="p_meta_item"><Activity size={12}/> History Synced</div>
                </div>
              </div>
            </div>

            {/* HISTORICAL ENGAGEMENT MODULE */}
            <div className="med_card_refined med_history_extended">
              <span className="med_label_micro">Consultation History</span>
              <div className="med_history_list_pro">
                <div className="h_pro_header">
                  <span>Schedule</span>
                  <span>Category</span>
                  <span>Observations</span>
                  <span className="text_right">Records</span>
                </div>
                {getConsultationHistory(selectedAppointment).length > 0 ? (
                  getConsultationHistory(selectedAppointment).map((past) => (
                    <div key={past.id} className="h_pro_row">
                      <div className="h_time_col"><div className="h_date_flex"><b>{past.date}</b><span className="h_time_pill">{past.time}</span></div></div>
                      <div className="h_diag_col">{past.type}</div>
                      <div className="h_remarks_col">{past.notes}</div>
                      <div className="h_action_col text_right"><button className="med_btn_view_small"><FileText size={14} /> <span>View</span></button></div>
                    </div>
                  ))
                ) : (
                  <div className="med_no_history_msg">No previous sessions found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW BOOKING MODAL */}
      {showForm && (
        <div className="med_modal_overlay">
          <div className="med_modal_content">
            <div className="med_modal_header">
              <h3>Create <span>Appointment</span></h3>
              <button onClick={() => setShowForm(false)} className="med_modal_close"><X size={20}/></button>
            </div>
            <form className="med_form_body">
              <div className="med_input_group"><label>Patient Name</label><input type="text" placeholder="Full name" /></div>
              <div className="med_form_row">
                <div className="med_input_group"><label>Date</label><input type="date" /></div>
                <div className="med_input_group"><label>Time</label><input type="time" /></div>
              </div>
              <button type="submit" className="med_btn_submit_final">Confirm Booking</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}