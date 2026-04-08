import React, { useState, useMemo } from "react";
import { 
  Search, Plus, X, Scale, Ruler, User, Phone, Tag, 
  Clock, Calendar, ChevronDown, ChevronUp, Activity, Download, Filter,
  ChevronLeft, ChevronRight, Mail
} from "lucide-react";

import patientsData from "../../Assets/Data/patient.json";
import appointmentsData from "../../Assets/Data/appointment.json";
import "./Patient_Management.css";

export default function Patient_Management() {
  // --- 1. GLOBAL STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // --- 2. PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // --- 3. APPOINTMENT SECTION STATE ---
  const [showAllAppts, setShowAllAppts] = useState(false);
  const [apptSearch, setApptSearch] = useState(""); 
  const [apptMonthFilter, setApptMonthFilter] = useState(""); 

  const [patients] = useState(patientsData);

  // --- 4. CLINICAL HELPERS & BMI ENGINE ---
  const getAgeClass = (age) => {
    if (age < 13) return "Child";
    if (age < 20) return "Teen";
    if (age < 60) return "Adult";
    return "Senior";
  };

  const calculateBMI = (weightStr, heightStr) => {
    const w = parseFloat(weightStr);
    const h = parseFloat(heightStr) / 100;
    if (!w || !h || h === 0) return { bmi: "N/A", category: "Unknown", color: "#94a3b8" };
    const bmi = (w / (h * h)).toFixed(1);
    let category = "Normal";
    let color = "#22c55e"; 
    if (bmi < 18.5) { category = "Underweight"; color = "#f59e0b"; }
    else if (bmi > 25 && bmi < 30) { category = "Overweight"; color = "#f59e0b"; }
    else if (bmi >= 30) { category = "Obese"; color = "#ef4444"; }
    return { bmi, category, color };
  };

  // --- 5. LOGIC: DATA RETRIEVAL ---
  const getPatientAppointments = (patientName) => {
    return appointmentsData.filter(a => (a.patient || "") === patientName);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const s = searchTerm.toLowerCase();
      const patientName = (p.name || "").toLowerCase();
      const patientContact = (p.contact || "");
      const patientDisease = (p.disease || "").toLowerCase();
      const patientId = `#pt-${p.id}`.toLowerCase();

      const matchesSearch = 
        patientName.includes(s) ||
        patientId.includes(s) ||
        patientContact.includes(s) ||
        patientDisease.includes(s);

      const matchesGender = filterGender ? p.gender === filterGender : true;
      let matchesAge = true;
      if (filterAgeRange === "0-18") matchesAge = p.age <= 18;
      else if (filterAgeRange === "19-40") matchesAge = p.age >= 19 && p.age <= 40;
      else if (filterAgeRange === "41-60") matchesAge = p.age >= 41 && p.age <= 60;
      else if (filterAgeRange === "60+") matchesAge = p.age > 60;

      return matchesSearch && matchesGender && matchesAge;
    });
  }, [searchTerm, filterGender, filterAgeRange, patients]);

  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFilteredAppts = () => {
    if (!selectedPatient) return [];
    const patientAppts = getPatientAppointments(selectedPatient.name);
    const filtered = patientAppts.filter(a => {
      const matchesSearch = (a.notes || "").toLowerCase().includes(apptSearch.toLowerCase()) || 
                           (a.doctor || "").toLowerCase().includes(apptSearch.toLowerCase()) || 
                           a.date.includes(apptSearch);
      const matchesMonth = apptMonthFilter ? a.date.startsWith(apptMonthFilter) : true;
      return matchesSearch && matchesMonth;
    });
    return showAllAppts ? filtered : filtered.slice(0, 3);
  };

  return (
    <div className="med_page_fade_in">
      {!selectedPatient || editMode ? (
        <div className="med_main_list_view">
          
          {/* TOP ANALYTICS STRIP */}
          <div className="med_quick_stats_row">
            <div className="med_mini_stat_card">
              <div className="stat_icon_circle blue"><User size={20}/></div>
              <div className="stat_info">
                <label>Total Patients</label>
                <h3>{patients.length}</h3>
              </div>
            </div>
            <div className="med_mini_stat_card">
              <div className="stat_icon_circle red"><Activity size={20}/></div>
              <div className="stat_info">
                <label>Senior Citizens</label>
                <h3 className="red_text">{patients.filter(p => p.age >= 60).length}</h3>
              </div>
            </div>
            <div className="med_mini_stat_card">
              <div className="stat_icon_circle green"><Calendar size={20}/></div>
              <div className="stat_info">
                <label>Pediatric Care</label>
                <h3 className="green_text">{patients.filter(p => p.age <= 12).length}</h3>
              </div>
            </div>
          </div>

          <div className="med_section_header">
            <div className="med_branding">
              <h1 className="med_title_elite">Patient <span className="highlight">Directory</span></h1>
              <p className="med_subtitle">{filteredPatients.length} matching records</p>
            </div>
            <div className="med_action_group">
              <button className="med_btn_outline"><Download size={16}/> Export CSV</button>
              <button className="med_btn_primary" onClick={() => { setEditMode(false); setShowForm(true); }}>
                <Plus size={18}/> Add Patient
              </button>
            </div>
          </div>

          {/* GLOBAL FILTERS */}
          <div className="med_filter_bar">
            <div className="med_search_box smart_search">
              <Search size={18} color="#007acc" />
              <input 
                type="text" 
                placeholder="Search Name, ID, Phone or Disease..." 
                value={searchTerm} 
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
              />
            </div>
            <div className="med_dropdown_group">
              <select className="med_select_filter" value={filterGender} onChange={(e) => {setFilterGender(e.target.value); setCurrentPage(1);}}>
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select className="med_select_filter" value={filterAgeRange} onChange={(e) => {setFilterAgeRange(e.target.value); setCurrentPage(1);}}>
                <option value="">All Ages</option>
                <option value="0-18">Under 18</option>
                <option value="19-40">19 - 40 Yrs</option>
                <option value="41-60">41 - 60 Yrs</option>
                <option value="60+">60+ Yrs</option>
              </select>
            </div>
          </div>

          {/* MAIN REGISTRY */}
          <div className="med_table_container">
            <table className="med_table">
              <thead>
                <tr>
                  <th>Patient Info</th>
                  <th>Age / Classification</th>
                  <th>Gender</th>
                  <th>Condition</th>
                  <th className="text_right">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="med_cell_user">
                        <img src={p.photo || "https://i.pravatar.cc/150"} alt="" />
                        <div><b>{p.name}</b><span>#PT-{p.id.toString().padStart(3, '0')}</span></div>
                      </div>
                    </td>
                    <td className="med_text_bold">{p.age} Yrs <small className="age_pill">{getAgeClass(p.age)}</small></td>
                    <td>{p.gender}</td>
                    <td><span className="med_disease_tag">{p.disease}</span></td>
                    <td className="text_right">
                      <button className="med_btn_manage" onClick={() => {setSelectedPatient(p); setApptSearch(""); setApptMonthFilter(""); setShowAllAppts(false);}}>View Case</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="med_pagination_bar">
            <div className="pag_info">
              Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredPatients.length)}</b> of <b>{filteredPatients.length}</b>
            </div>
            <div className="pag_buttons">
              <button className="pag_nav_btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={16}/></button>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button key={i} className={`pag_num_btn ${currentPage === page ? 'active' : ''}`} onClick={() => handlePageChange(page)}>{page}</button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={i} className="pag_ellipsis">...</span>;
                }
                return null;
              })}
              <button className="pag_nav_btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      ) : (
        /* --- WORKSPACE: PATIENT CLINICAL CASE --- */
        <div className="med_detail_view">
          <div className="med_detail_nav">
             <button className="med_btn_close" onClick={() => setSelectedPatient(null)}>Close Profile</button>
          </div>

          <div className="sa_patient_profile_container">
            <div className="med_card_refined info_panel_v3">
                <div className="profile_main_side">
                  <img src={selectedPatient.photo || "https://i.pravatar.cc/150"} alt="Profile" className="large_avatar" />
                  <div className="profile_titles">
                    <h2 className="patient_name_v3">{selectedPatient.name}</h2>
                    <div className="id_condition_row">
                      <span className="id_badge">ID: #PT-{selectedPatient.id}</span>
                      <span className="diagnosis_badge"><Activity size={12}/> {selectedPatient.disease}</span>
                    </div>
                  </div>
                </div>

                <div className="vitals_grid">
                    <div className="vital_item">
                      <label><User size={14}/> Demographics</label>
                      <p>{selectedPatient.age}y • {selectedPatient.gender}</p>
                    </div>
                    <div className="vital_item">
                      <label><Scale size={14}/> BMI Assessment</label>
                      <p>{selectedPatient.weight} <small style={{color: calculateBMI(selectedPatient.weight, selectedPatient.height)?.color}}>({calculateBMI(selectedPatient.weight, selectedPatient.height)?.bmi})</small></p>
                    </div>
                    <div className="vital_item">
                      <label><Ruler size={14}/> Height</label>
                      <p>{selectedPatient.height}</p>
                    </div>
                    <div className="vital_item">
                      <label><Phone size={14}/> Contact</label>
                      <p>{selectedPatient.contact}</p>
                    </div>
                </div>
            </div>

            <div className="med_card_refined appointment_history_card">
               <div className="appt_header_main">
                  <div className="title_with_icon">
                    <Clock size={20} className="blue_text" />
                    <h4>Clinical Visits Registry</h4>
                  </div>
                  
                  <div className="appt_controls">
                    <div className="appt_mini_filter calendar_style">
                      <Filter size={14} color="#007acc" />
                      <input type="month" value={apptMonthFilter} onChange={(e) => { setApptMonthFilter(e.target.value); setShowAllAppts(true); }} />
                      {apptMonthFilter && <button className="clear_month" onClick={() => setApptMonthFilter("")}><X size={12} /></button>}
                    </div>
                    <div className="appt_mini_search">
                      <Search size={14} color="#94a3b8" />
                      <input type="text" placeholder="Search visits..." value={apptSearch} onChange={(e) => {setApptSearch(e.target.value); setShowAllAppts(true);}} />
                    </div>
                  </div>
               </div>

               <div className="appt_list_minimal">
                  {getFilteredAppts().length > 0 ? (
                    getFilteredAppts().map((appt, idx) => (
                      <div key={idx} className="appt_row_item">
                         <div className="date_box"><Calendar size={14}/> {appt.date}</div>
                         <div className="reason_box">
                            <b>{appt.doctor}</b>
                            <p style={{margin:0, fontSize: '0.8rem', color:'#64748b'}}>{appt.notes || "Routine Visit"}</p>
                         </div>
                         <div className="status_box">
                           <span className={`status_badge ${appt.status.toLowerCase()}`}>
                              <span className="status_dot"></span> {appt.status}
                           </span>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="no_records_simple">No clinical history found matching filters.</div>
                  )}
               </div>

               {getPatientAppointments(selectedPatient.name).length > 3 && !apptSearch && !apptMonthFilter && (
                 <button className="view_more_btn" onClick={() => setShowAllAppts(!showAllAppts)}>
                   {showAllAppts ? <><ChevronUp size={16}/> Show Recent Only</> : <><ChevronDown size={16}/> Full History ({getPatientAppointments(selectedPatient.name).length})</>}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* ADMINISTRATION MODAL */}
      {showForm && (
        <div className="med_modal_overlay">
          <div className="sa_centered_form_card">
            <div className="sa_modal_header">
              <h2>{editMode ? "Update Clinical Record" : "New Patient Registration"}</h2>
              <button className="sa_close_modal" onClick={() => setShowForm(false)}><X size={24}/></button>
            </div>
            <form onSubmit={(e) => {e.preventDefault(); setShowForm(false); setEditMode(false);}} className="sa_form_grid">
              <div className="sa_input_box"><label>Full Name</label><input defaultValue={editMode ? selectedPatient.name : ""} required /></div>
              <div className="sa_input_box"><label>Age</label><input type="number" defaultValue={editMode ? selectedPatient.age : ""} required /></div>
              <div className="sa_input_box"><label>Weight (kg)</label><input defaultValue={editMode ? selectedPatient.weight : ""} /></div>
              <div className="sa_input_box"><label>Height (cm)</label><input defaultValue={editMode ? selectedPatient.height : ""} /></div>
              <div className="sa_input_box" style={{gridColumn: "span 2"}}><label>Primary Diagnosis</label><input defaultValue={editMode ? selectedPatient.disease : ""} /></div>
              <button type="submit" className="sa_btn_submit_pro" style={{gridColumn: "span 2", border: 'none'}}>Finalize and Save Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}