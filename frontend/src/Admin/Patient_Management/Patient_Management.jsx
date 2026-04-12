import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search, Plus, X, Scale, Ruler, User, Phone,
  Clock, Activity, Download, ShieldCheck, CheckCircle2,
  ChevronLeft, ChevronRight, Mail, ArrowLeft, MapPin, ClipboardList
} from "lucide-react";

import patientsData from "../../Assets/Data/patient.json";
import appointmentsData from "../../Assets/Data/appointment.json";
import "./Patient_Management.css";

export default function Patient_Management() {
  const { searchTerm: globalSearch } = useOutletContext();
  const [localSearch, setLocalSearch] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const [showAllAppts, setShowAllAppts] = useState(false);
  const [apptSearch, setApptSearch] = useState("");
  const [apptMonthFilter, setApptMonthFilter] = useState("");

  const [patients] = useState(patientsData);

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

  const getPatientAppointments = (patientName) => {
    return appointmentsData.filter(a => (a.patient || "") === patientName);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const patientName = (p.name || "").toLowerCase();
      const patientContact = (p.contact || "");
      const patientDisease = (p.disease || "").toLowerCase();
      const patientId = `#pt-${p.id}`.toLowerCase();

      const matchesGlobal =
        patientName.includes(globalSearch.toLowerCase()) ||
        patientId.includes(globalSearch.toLowerCase()) ||
        patientDisease.includes(globalSearch.toLowerCase());

      const matchesLocal =
        patientName.includes(localSearch.toLowerCase()) ||
        patientContact.includes(localSearch.toLowerCase());

      const matchesGender = filterGender ? p.gender === filterGender : true;
      let matchesAge = true;
      if (filterAgeRange === "0-18") matchesAge = p.age <= 18;
      else if (filterAgeRange === "19-40") matchesAge = p.age >= 19 && p.age <= 40;
      else if (filterAgeRange === "41-60") matchesAge = p.age >= 41 && p.age <= 60;
      else if (filterAgeRange === "60+") matchesAge = p.age > 60;

      return matchesGlobal && matchesLocal && matchesGender && matchesAge;
    });
  }, [globalSearch, localSearch, filterGender, filterAgeRange, patients]);

  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin_patnt_m_page_fade_in">
      {!selectedPatient || editMode ? (
        <div className="admin_patnt_m_main_list_view">
          <div className="admin_patnt_m_section_header">
            <div className="admin_patnt_m_branding">
              <h1 className="admin_patnt_m_title_elite">Patient <span className="admin_patnt_m_highlight">Directory</span></h1>
              <p className="admin_patnt_m_subtitle">
                {globalSearch && `Searching: "${globalSearch}" | `}
                {filteredPatients.length} matching records
              </p>
            </div>
            <div className="admin_patnt_m_action_group">
              <button className="admin_patnt_m_btn_outline">
                <Download size={16} /> Export CSV
              </button>
              <button className="admin_patnt_m_btn_primary" onClick={() => { setEditMode(false); setShowForm(true); }}>
                <Plus size={18} /> Add Patient
              </button>
            </div>
          </div>

          <div className="admin_patnt_m_filter_bar">
            <div className="admin_patnt_m_search_box admin_patnt_m_smart_search">
              <Search size={18} color="#007acc" />
              <input
                type="text"
                placeholder="Filter by Name, Phone or Disease..."
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="admin_patnt_m_dropdown_group">
              <select className="admin_patnt_m_select_filter" value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}>
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select className="admin_patnt_m_select_filter" value={filterAgeRange} onChange={(e) => { setFilterAgeRange(e.target.value); setCurrentPage(1); }}>
                <option value="">All Ages</option>
                <option value="0-18">Under 18</option>
                <option value="19-40">19 - 40 Yrs</option>
                <option value="41-60">41 - 60 Yrs</option>
                <option value="60+">60+ Yrs</option>
              </select>
              {(globalSearch || localSearch) && (
                <button className="admin_patnt_m_clear_btn" onClick={() => { setLocalSearch(""); setCurrentPage(1); }}>
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="admin_patnt_m_table_container">
            <table className="admin_patnt_m_table">
              <thead>
                <tr>
                  <th>Patient Info</th>
                  <th>Age / Classification</th>
                  <th>Gender</th>
                  <th>Condition</th>
                  <th className="admin_patnt_m_text_right">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.length > 0 ? (
                  currentPatients.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin_patnt_m_cell_user">
                          <img src={p.photo || "https://i.pravatar.cc/150"} alt="" />
                          <div><b>{p.name}</b><span>#PT-{p.id.toString().padStart(3, '0')}</span></div>
                        </div>
                      </td>
                      <td className="admin_patnt_m_text_bold">{p.age} Yrs <small className="admin_patnt_m_age_pill">{getAgeClass(p.age)}</small></td>
                      <td>{p.gender}</td>
                      <td><span className="admin_patnt_m_disease_tag">{p.disease}</span></td>
                      <td className="admin_patnt_m_text_right">
                        <button className="admin_patnt_m_btn_manage" onClick={() => { setSelectedPatient(p); setApptSearch(""); setApptMonthFilter(""); setShowAllAppts(false); }}>View Case</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="admin_patnt_m_no_results">
                      <Activity size={32} />
                      <p>No clinical records found matching your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin_patnt_m_pagination_bar">
              <div className="admin_patnt_m_pag_info">
                Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredPatients.length)}</b> of <b>{filteredPatients.length}</b>
              </div>
              <div className="admin_patnt_m_pag_buttons">
                <button className="admin_patnt_m_pag_nav_btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={16} /></button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button key={i} className={`admin_patnt_m_pag_num_btn ${currentPage === page ? 'admin_patnt_m_active' : ''}`} onClick={() => handlePageChange(page)}>{page}</button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={i} className="admin_patnt_m_pag_ellipsis">...</span>;
                  }
                  return null;
                })}
                <button className="admin_patnt_m_pag_nav_btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="admin_patnt_m_detail_workspace">
          <div className="admin_patnt_m_workspace_header">
            <div className="admin_patnt_m_header_btns">
              <button className="admin_patnt_m_btn_close_workspace" onClick={() => setSelectedPatient(null)}>
                <X size={18} /> Close Case
              </button>
            </div>
            <div className="admin_patnt_m_status_indicator">
              <span className="admin_patnt_m_pulse"></span>
              Clinical Workspace: <b>#PT-{selectedPatient.id + 4000}</b>
            </div>
          </div>

          <div className="admin_patnt_m_profile_hero_card">
            <div className="admin_patnt_m_hero_left">
              <img src={selectedPatient.photo || "https://i.pravatar.cc/150"} alt="" className="admin_patnt_m_avatar_hero" />
              <div className="admin_patnt_m_hero_info">
                <h2>{selectedPatient.name}</h2>
                <div className="admin_patnt_m_hero_badges">
                  <span className="admin_patnt_m_badge_outline"><User size={14} /> {selectedPatient.age}Y • {selectedPatient.gender}</span>
                  <span className="admin_patnt_m_badge_outline"><ShieldCheck size={14} /> {selectedPatient.disease}</span>
                </div>
                <div className="admin_patnt_m_hero_contact">
                  <span><Mail size={14} /> {selectedPatient.name?.split(" ")[0].toLowerCase()}@medico.com</span>
                  <span><Phone size={14} /> {selectedPatient.contact}</span>
                  <span><MapPin size={14} /> Chennai, India</span>
                </div>
              </div>
            </div>

            <div className="admin_patnt_m_hero_stats">
              <div className="admin_patnt_m_hero_stat_item">
                <Scale size={18} color="#007acc" />
                <div><p>{selectedPatient.weight}</p><small>Weight</small></div>
              </div>
              <div className="admin_patnt_m_hero_stat_item">
                <Ruler size={18} color="#007acc" />
                <div><p>{selectedPatient.height}</p><small>Height</small></div>
              </div>
              <div className="admin_patnt_m_hero_stat_item blue_bg">
                <Activity size={18} color="#007acc" />
                <div><p>{calculateBMI(selectedPatient.weight, selectedPatient.height)?.bmi}</p><small>BMI Index</small></div>
              </div>
              <div className="admin_patnt_m_hero_stat_item_appt">
                <ClipboardList size={18} color="#007acc" />
                <div><small>Total Appointments</small><p>{getPatientAppointments(selectedPatient.name).length}</p></div>
              </div>
            </div>
          </div>

          <div className="admin_patnt_m_split_history_row">
            <div className="admin_patnt_m_history_column">
              <div className="admin_patnt_m_col_header">
                <h3><Clock size={18} color="#facc15" /> Upcoming Schedules</h3>
              </div>
              <div className="admin_patnt_m_col_list">
                {getPatientAppointments(selectedPatient.name).filter(a => a.status === "Upcoming").length > 0 ? (
                  getPatientAppointments(selectedPatient.name)
                    .filter(a => a.status === "Upcoming")
                    .slice(0, showAllAppts ? 10 : 3)
                    .map((appt, i) => (
                      <div key={i} className="admin_patnt_m_history_mini_card yellow_border">
                        <div className="mini_card_date"><b>{appt.date}</b><span>{appt.time}</span></div>
                        <div className="mini_card_main"><b>{appt.doctor}</b><p>{appt.notes || "Initial Consultation"}</p></div>
                      </div>
                    ))
                ) : (
                  <div className="admin_patnt_m_empty_col">No upcoming visits.</div>
                )}
              </div>
              {getPatientAppointments(selectedPatient.name).filter(a => a.status === "Upcoming").length > 3 && (
                <button className="admin_patnt_m_col_view_more" onClick={() => setShowAllAppts(!showAllAppts)}>
                  {showAllAppts ? "Show Less" : "View All Upcoming"}
                </button>
              )}
            </div>

            <div className="admin_patnt_m_history_column">
              <div className="admin_patnt_m_col_header">
                <h3><CheckCircle2 size={18} color="#22c55e" /> Completed Registry</h3>
              </div>
              <div className="admin_patnt_m_col_list">
                {getPatientAppointments(selectedPatient.name).filter(a => a.status === "Completed").length > 0 ? (
                  getPatientAppointments(selectedPatient.name)
                    .filter(a => a.status === "Completed")
                    .slice(0, showAllAppts ? 10 : 3)
                    .map((appt, i) => (
                      <div key={i} className="admin_patnt_m_history_mini_card green_border">
                        <div className="mini_card_date"><b>{appt.date}</b><span>{appt.time}</span></div>
                        <div className="mini_card_main"><b>{appt.doctor}</b><p>{appt.notes || "Standard clinical review."}</p></div>
                      </div>
                    ))
                ) : (
                  <div className="admin_patnt_m_empty_col">No prior records.</div>
                )}
              </div>
              {getPatientAppointments(selectedPatient.name).filter(a => a.status === "Completed").length > 3 && (
                <button className="admin_patnt_m_col_view_more" onClick={() => setShowAllAppts(!showAllAppts)}>
                  {showAllAppts ? "Show Less" : "View All Records"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="admin_patnt_m_modal_overlay">
          <div className="admin_patnt_m_centered_form_card">
            <div className="admin_patnt_m_modal_header">
              <h2>{editMode ? "Update Clinical Record" : "New Patient Registration"}</h2>
              <button className="admin_patnt_m_close_modal" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowForm(false); setEditMode(false); }} className="admin_patnt_m_form_grid">
              <div className="admin_patnt_m_input_box"><label>Full Name</label><input defaultValue={editMode ? selectedPatient.name : ""} required /></div>
              <div className="admin_patnt_m_input_box"><label>Age</label><input type="number" defaultValue={editMode ? selectedPatient.age : ""} required /></div>
              <div className="admin_patnt_m_input_box"><label>Weight (kg)</label><input defaultValue={editMode ? selectedPatient.weight : ""} /></div>
              <div className="admin_patnt_m_input_box"><label>Height (cm)</label><input defaultValue={editMode ? selectedPatient.height : ""} /></div>
              <div className="admin_patnt_m_input_box" style={{ gridColumn: "span 2" }}><label>Primary Diagnosis</label><input defaultValue={editMode ? selectedPatient.disease : ""} /></div>
              <button type="submit" className="admin_patnt_m_btn_submit_pro" style={{ gridColumn: "span 2", border: 'none' }}>Finalize and Save Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}