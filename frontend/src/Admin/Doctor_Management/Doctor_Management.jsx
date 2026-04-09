import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom"; // Hook to receive search from Admin_Home
import { Bar } from "react-chartjs-2";
import { 
  Search, Plus, Download, Calendar, Activity, 
  ChevronRight, X, User, BookOpen, Briefcase, ChevronLeft
} from "lucide-react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

// --- DATA IMPORTS ---
import doctorsData from "../../Assets/Data/doctor.json";
import appointmentsData from "../../Assets/Data/appointment.json";
import "./Doctor_Management.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Doctor_Management() {
  // --- 1. RECEIVE GLOBAL SEARCH FROM ADMIN_HOME ---
  const { searchTerm: globalSearch } = useOutletContext();

  // --- 2. STATE MANAGEMENT ---
  const [localSearch, setLocalSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterAvail, setFilterAvail] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllLeaves, setShowAllLeaves] = useState(false); 
  const [historyTab, setHistoryTab] = useState("Recent");
  const [doctors, setDoctors] = useState(doctorsData);

  const rowsPerPage = 10;

  // --- 3. LOGIC: UNIFIED FILTERING & PAGINATION ---
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const doctorName = (doc.name || "").toLowerCase();
      const doctorDept = (doc.department || "").toLowerCase();

      // Check against Global Top-Bar Search
      const matchesGlobal = doctorName.includes(globalSearch.toLowerCase()) || 
                            doctorDept.includes(globalSearch.toLowerCase());

      // Check against Local Filter Box
      const matchesLocal = doctorName.includes(localSearch.toLowerCase());

      const matchesDept = filterDept ? doc.department === filterDept : true;
      const matchesAvail = filterAvail ? doc.availability === filterAvail : true;

      return matchesGlobal && matchesLocal && matchesDept && matchesAvail;
    });
  }, [doctors, globalSearch, localSearch, filterDept, filterAvail]);

  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstRow, indexOfLastRow);

  // --- 4. LOGIC: CLINICAL ANALYTICS ---
  const getFilteredDoctorAppointments = (doctorName) => {
    if (!doctorName) return [];
    const targetStatus = historyTab === "Recent" ? "Completed" : "Upcoming";
    return appointmentsData
      .filter(appt => (appt.doctor || "") === doctorName && appt.status === targetStatus)
      .sort((a, b) => historyTab === "Recent" 
          ? new Date(b.date) - new Date(a.date) 
          : new Date(a.date) - new Date(b.date)
      ).slice(0, 5);
  };

  const getPerformanceData = (stats) => ({
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{
        label: "Patients Treated",
        data: stats || [0, 0, 0, 0],
        backgroundColor: "#007acc",
        borderRadius: 5,
        hoverBackgroundColor: "#00d2ff",
    }],
  });

  // --- 5. ACTION HANDLERS ---
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditClick = (doc) => {
    setEditDoctor(doc);
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const doctorData = {
      id: editDoctor ? editDoctor.id : `DOC-${doctors.length + 1}`,
      name: formData.get("name"),
      department: formData.get("department"),
      degrees: editDoctor?.degrees || "MD",
      availability: editDoctor?.availability || "Available",
      photo: editDoctor ? editDoctor.photo : "https://i.pravatar.cc/150",
      leaves: editDoctor ? editDoctor.leaves : [],
      totalAppointments: Number(formData.get("totalAppointments") || 0),
      totalPatients: Number(formData.get("totalPatients") || 0),
      performanceStats: editDoctor ? editDoctor.performanceStats : [10, 20, 30, 40],
    };
    
    if (editDoctor) {
      setDoctors(doctors.map(d => d.id === editDoctor.id ? doctorData : d));
    } else {
      setDoctors([...doctors, doctorData]);
    }
    setShowForm(false);
    setEditDoctor(null);
  };

  return (
    <div className="med_page_fade_in">
      
      {/* MODULE A: SPECIALIST DIRECTORY (LIST VIEW) */}
      {!selectedDoctor && (
        <div className="med_main_list_view">
          <div className="med_section_header">
            <div className="med_branding">
              <h1 className="med_title_elite">Medical <span className="highlight">Specialists</span></h1>
              <p className="med_subtitle">
                {globalSearch && `Results for "${globalSearch}" | `}
                {filteredDoctors.length} staff records found
              </p>
            </div>
            <div className="med_action_group">
              <button className="med_btn_outline"><Download size={16}/> Export CSV</button>
              <button className="med_btn_primary" onClick={() => { setEditDoctor(null); setShowForm(true); }}>
                <Plus size={18}/> Add Doctor
              </button>
            </div>
          </div>

          <div className="med_filter_bar">
            <div className="med_search_box">
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Filter within results..." 
                value={localSearch} 
                onChange={(e) => {setLocalSearch(e.target.value); setCurrentPage(1);}} 
              />
            </div>
            <div className="med_dropdown_group">
              <select className="med_select_filter" value={filterDept} onChange={(e) => {setFilterDept(e.target.value); setCurrentPage(1);}}>
                <option value="">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="General Medicine">General Medicine</option>
              </select>
              <select className="med_select_filter" value={filterAvail} onChange={(e) => {setFilterAvail(e.target.value); setCurrentPage(1);}}>
                <option value="">All Status</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
              {(globalSearch || localSearch) && (
                 <button className="med_clear_btn" onClick={() => {setLocalSearch(""); setCurrentPage(1);}}>
                    <X size={14} /> Clear
                 </button>
              )}
            </div>
          </div>

          <div className="med_table_container">
            <table className="med_table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Appts</th>
                  <th>Patients</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentDoctors.length > 0 ? (
                  currentDoctors.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="med_cell_user">
                          <img src={doc.photo || "https://i.pravatar.cc/150"} alt="" />
                          <div><b>{doc.name}</b><span>{doc.degrees || "MD"}</span></div>
                        </div>
                      </td>
                      <td className="med_text_bold">{doc.department}</td>
                      <td>
                        <span className={`med_status ${doc.availability === "Available" ? "upcoming" : "cancelled"}`}>
                          {doc.availability}
                        </span>
                      </td>
                      <td>{doc.totalAppointments || 0}</td>
                      <td className="med_text_bold">{doc.totalPatients || 0}</td>
                      <td>
                        <button className="med_btn_manage" onClick={() => setSelectedDoctor(doc)}>View</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>
                        <Activity size={32} style={{marginBottom: '10px', opacity: 0.5}}/>
                        <p>No specialists found matching your criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="med_pagination_bar">
            <div className="pag_info">
              Showing <b>{indexOfFirstRow + 1}</b> to <b>{Math.min(indexOfLastRow, filteredDoctors.length)}</b> of <b>{filteredDoctors.length}</b> specialists
            </div>
            <div className="pag_buttons">
              <button className="pag_nav_btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft size={16}/>
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  className={`pag_num_btn ${currentPage === i + 1 ? "active" : ""}`} 
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="pag_nav_btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE B: DOCTOR WORKSPACE (PROFILE VIEW) */}
      {selectedDoctor && (
        <div className="doctor-detail-container">
          <div className="detail-header">
            <button className="edit-btn" onClick={() => handleEditClick(selectedDoctor)}>Edit Details</button>
            <button className="close-btn" onClick={() => { setSelectedDoctor(null); setShowAllLeaves(false); }}>Close</button>
          </div>

          <div className="profile-section">
            <img src={selectedDoctor.photo || "https://i.pravatar.cc/150"} alt={selectedDoctor.name} className="profile-photo-large" />
            <div className="profile-info">
              <h2>{selectedDoctor.name}</h2>
              <p>Degrees: {selectedDoctor.degrees || "N/A"}</p>
              <p>Department: {selectedDoctor.department}</p>
              <p>Availability: {selectedDoctor.availability}</p>
            </div>
            <div className="profile-stats">
              <div className="stat-box"><h3>{selectedDoctor.totalAppointments || 0}</h3><p>Total Appointments</p></div>
              <div className="stat-box"><h3>{selectedDoctor.totalPatients || 0}</h3><p>Total Patients</p></div>
            </div>
          </div>

          <div className="middle-section">
            <div className="appointments-list">
              <div className="list-header-flex">
                <h3>Consultation Registry</h3>
                <div className="med_sub_filter_toggle">
                  <button className={`sub_tab ${historyTab === "Recent" ? "active" : ""}`} onClick={() => setHistoryTab("Recent")}>Recent</button>
                  <button className={`sub_tab ${historyTab === "Upcoming" ? "active" : ""}`} onClick={() => setHistoryTab("Upcoming")}>Upcoming</button>
                </div>
              </div>
              <ul className="sa_elite_list">
                {getFilteredDoctorAppointments(selectedDoctor.name).map((appt, idx) => (
                  <li key={idx} className="sa_list_item_refined">
                    <div className="sa_item_left">
                      <div className="sa_patient_avatar_mini">{(appt.patient || "P").charAt(0)}</div>
                      <div className="sa_patient_info">
                        <span className="p_name">{appt.patient}</span>
                        <span className="p_date">{appt.date}</span>
                      </div>
                    </div>
                    <div className="sa_item_right">
                      <span className={`sa_status_pill_mini ${appt.status.toLowerCase()}`}>{appt.status}</span>
                      <ChevronRight size={14} color="#cbd5e1" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="charts-section sa_chart_viz_pro">
              <div className="chart-header"><h3>Performance Analytics</h3></div>
              <div className="sa_chart_wrapper_glass">
                <Bar data={getPerformanceData(selectedDoctor.performanceStats)} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }}} />
              </div>
            </div>
          </div>

          <div className="leaves-section">
            <div className="sa_leaves_header_flex">
              <h3>Leaves Taken</h3>
            </div>
            <div className="leaves-grid">
              {(showAllLeaves ? selectedDoctor.leaves : (selectedDoctor.leaves || []).slice(0, 5)).map((date, idx) => (
                <div key={idx} className="leave-box-elite">
                   <div className="leave_icon_bg"><Calendar size={14} color="#007acc" /></div>
                   <div className="leave_text_group"><b>Leave {idx + 1}</b><span>{date}</span></div>
                </div>
              ))}
              
            </div>
            <button className="view_more_btnl" onClick={() => setShowAllLeaves(!showAllLeaves)}>
                {showAllLeaves ? "Show Less" : "View More"}
              </button>
          </div>
        </div>
      )}

      {/* MODULE C: ADMINISTRATION MODAL (ADD/EDIT) */}
      {showForm && (
        <div className="sa_modal_overlay">
          <div className="sa_centered_form_card">
            <div className="sa_modal_header">
              <h2>{editDoctor ? "Refine Doctor Details" : "Onboard New Specialist"}</h2>
              <button className="sa_close_modal" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="sa_form_grid">
              <div className="sa_input_box">
                <label><User size={14}/> Full Name</label>
                <input name="name" defaultValue={editDoctor?.name} required />
              </div>
              <div className="sa_input_box">
                <label><Briefcase size={14}/> Department</label>
                <select name="department" defaultValue={editDoctor?.department || "Cardiology"}>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
              <button type="submit" className="sa_btn_submit_pro">Save Specialist</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}