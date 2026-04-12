import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, User, Activity, ArrowLeft, Phone, Mail, MapPin, 
  Download, Scale, Ruler, Zap, ChevronRight, ChevronLeft, X
} from "lucide-react";

import patientsData from "../../Assets/Data/patient.json";
import appointmentsData from "../../Assets/Data/appointment.json";
import doctorsData from "../../Assets/Data/doctor.json";
import patientPhoto from "../../Assets/Images/Doctor/doctor_profile1.webp";
import "./Doctor_Patients.css";

export default function Patients() {
  const navigate = useNavigate();
  
  // --- STATE ENGINE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // Updated as requested

  const currentDoc = useMemo(() => doctorsData[0] || {}, []);

  // --- CLINICAL HELPERS ---
  const getAgeClass = (age) => {
    if (age < 13) return "Child";
    if (age < 20) return "Teen";
    if (age < 60) return "Adult";
    return "Senior";
  };

  const calculateBMI = (weightStr, heightStr) => {
    const w = parseFloat(weightStr);
    const h = parseFloat(heightStr) / 100;
    if (!w || !h || h === 0) return { bmi: "N/A", color: "#94a3b8" };
    const bmi = (w / (h * h)).toFixed(1);
    let color = "#22c55e"; 
    if (bmi < 18.5 || bmi >= 25) color = "#f59e0b";
    if (bmi >= 30) color = "#ef4444";
    return { bmi, color };
  };

  // --- REFINED FILTER LOGIC ---
  const filteredPatients = useMemo(() => {
    // Only get patients who have seen THIS doctor
    const seenPatientNames = [...new Set(
      appointmentsData
        .filter(appt => appt.doctor === currentDoc.name)
        .map(appt => appt.patient)
    )];

    return patientsData.filter(p => {
      const isEstablished = seenPatientNames.includes(p.name);
      if (!isEstablished) return false;

      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm) ||
        (p.disease && p.disease.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGender = filterGender ? p.gender === filterGender : true;
      
      let matchesAge = true;
      if (filterAgeRange === "0-18") matchesAge = p.age <= 18;
      else if (filterAgeRange === "19-40") matchesAge = p.age >= 19 && p.age <= 40;
      else if (filterAgeRange === "41-60") matchesAge = p.age >= 41 && p.age <= 60;
      else if (filterAgeRange === "60+") matchesAge = p.age > 60;

      return matchesSearch && matchesGender && matchesAge;
    });
  }, [currentDoc.name, searchTerm, filterGender, filterAgeRange]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstRow, indexOfLastRow);

  const patientHistory = useMemo(() => {
    if (!selectedPatient) return { local: [], global: [] };
    const allRecords = appointmentsData.filter(a => a.patient === selectedPatient.name);
    return {
      local: allRecords.filter(a => a.doctor === currentDoc.name),
      global: allRecords.filter(a => a.doctor !== currentDoc.name)
    };
  }, [selectedPatient, currentDoc.name]);

  const handlePageChange = (num) => {
    setCurrentPage(num);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFile = (p) => {
    setSelectedPatient(p);
    setIsDetailView(true);
  };

  const handleHistoryJump = (apptId) => {
    navigate("/doctor/appointments", { state: { targetApptId: apptId } });
  };

  return (
    <div className="doc_patn_m_root doc_patn_m_page_fade_in">
      {!isDetailView ? (
        <div className="doc_patn_m_list_view">
          {/* HEADER SECTION */}
          <div className="doc_patn_m_section_header">
            <div className="doc_patn_m_branding">
              <h1 className="doc_patn_m_title_elite">Clinical <span className="doc_patn_m_highlight">Registry</span></h1>
              <p className="doc_patn_m_subtitle">{filteredPatients.length} established patient files under your care</p>
            </div>
            <div className="doc_patn_m_action_group">
              <button className="doc_patn_m_btn_outline"><Download size={16}/> Export List</button>
            </div>
          </div>

          {/* FILTER BAR - Admin Style */}
          <div className="doc_patn_m_filter_bar">
            <div className="doc_patn_m_search_box doc_patn_m_smart_search">
              <Search size={18} color="#007acc" />
              <input 
                type="text" 
                placeholder="Search Name, ID, or Condition..." 
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              />
            </div>
            <div className="doc_patn_m_dropdown_group">
              <select className="doc_patn_m_select_filter" value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}>
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select className="doc_patn_m_select_filter" value={filterAgeRange} onChange={(e) => { setFilterAgeRange(e.target.value); setCurrentPage(1); }}>
                <option value="">All Ages</option>
                <option value="0-18">Under 18</option>
                <option value="19-40">19 - 40 Yrs</option>
                <option value="41-60">41 - 60 Yrs</option>
                <option value="60+">60+ Yrs</option>
              </select>
              {(searchTerm || filterGender || filterAgeRange) && (
                <button className="doc_patn_m_clear_btn" onClick={() => { setSearchTerm(""); setFilterGender(""); setFilterAgeRange(""); setCurrentPage(1); }}>
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="doc_patn_m_table_container">
            <table className="doc_patn_m_table">
              <thead>
                <tr>
                  <th>Patient Identity</th>
                  <th>Age / Classification</th>
                  <th>Gender</th>
                  <th>Primary Condition</th>
                  <th className="doc_patn_m_text_right">Management</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.length > 0 ? currentPatients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="doc_patn_m_cell_user">
                        <img src={p.photo || patientPhoto} alt="" />
                        <div><b>{p.name}</b><span>#PT-{p.id}</span></div>
                      </div>
                    </td>
                    <td className="doc_patn_m_text_bold">{p.age}Y <small className="doc_patn_m_age_pill">{getAgeClass(p.age)}</small></td>
                    <td>{p.gender}</td>
                    <td><span className="doc_patn_m_disease_tag">{p.disease}</span></td>
                    <td className="doc_patn_m_text_right">
                      <button className="doc_patn_m_btn_manage" onClick={() => handleOpenFile(p)}>Open File</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="doc_patn_m_no_results">
                      <Activity size={32} />
                      <p>No clinical records found matching your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION - Admin Style */}
          {totalPages > 1 && (
            <div className="doc_patn_m_pagination_bar">
              <div className="doc_patn_m_pag_info">
                Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredPatients.length)}</b> of <b>{filteredPatients.length}</b>
              </div>
              <div className="doc_patn_m_pag_buttons">
                <button 
                  className="doc_patn_m_pag_nav_btn" 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16}/>
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Showing only neighbors to keep it clean (Admin Style)
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button 
                        key={pageNum} 
                        className={`doc_patn_m_pag_num_btn ${currentPage === pageNum ? 'doc_patn_m_active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="doc_patn_m_pag_ellipsis">...</span>;
                  }
                  return null;
                })}

                <button 
                  className="doc_patn_m_pag_nav_btn" 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* --- WORKSPACE VIEW (BENTO) --- */
        <div className="doc_patn_m_patient_workspace doc_patn_m_page_fade_in">
          <div className="doc_patn_m_detail_nav">
            <button className="doc_patn_m_back_btn" onClick={() => setIsDetailView(false)}>
              <ArrowLeft size={18}/> Back to Registry
            </button>
            <div className="doc_patn_m_case_id_badge">EHR Active: <b>{selectedPatient.name}</b></div>
          </div>

          <div className="doc_patn_m_bento_workspace_grid">
            <div className="doc_patn_m_card_refined doc_patn_m_id_card">
              <span className="doc_patn_m_label_micro">Patient Demographics</span>
              <div className="doc_patn_m_pat_vertical_header">
                <img src={selectedPatient.photo || patientPhoto} alt="" className="doc_patn_m_avatar_large" />
                <div className="doc_patn_m_pat_name_stack">
                  <h2>{selectedPatient.name}</h2>
                  <span className="doc_patn_m_id_pill">UID: #PT-{selectedPatient.id}</span>
                </div>
              </div>
              <div className="doc_patn_m_pat_contact_vertical">
                <div className="doc_patn_m_contact_line"><div className="doc_patn_m_icon_circ"><Phone size={14}/></div> <span>{selectedPatient.contact}</span></div>
                <div className="doc_patn_m_contact_line"><div className="doc_patn_m_icon_circ"><Mail size={14}/></div> <span>{selectedPatient.name.split(' ')[0].toLowerCase()}@medico.com</span></div>
                <div className="doc_patn_m_contact_line"><div className="doc_patn_m_icon_circ"><MapPin size={14}/></div> <span>West Wing, Block 4</span></div>
              </div>
            </div>

            <div className="doc_patn_m_card_refined doc_patn_m_clinical_card">
              <span className="doc_patn_m_label_micro">Clinical Status & BMI</span>
              <div className="doc_patn_m_logistics_grid">
                  <div className="doc_patn_m_logistics_item">
                      <div className="doc_patn_m_log_icon"><Activity size={18}/></div>
                      <div className="doc_patn_m_log_text"><label>Diagnosis</label><strong>{selectedPatient.disease}</strong></div>
                  </div>
                  <div className="doc_patn_m_logistics_item">
                      <div className="doc_patn_m_log_icon"><Scale size={18}/></div>
                      <div className="doc_patn_m_log_text">
                        <label>BMI</label>
                        <strong>{calculateBMI(selectedPatient.weight, selectedPatient.height).bmi} <small style={{color: calculateBMI(selectedPatient.weight, selectedPatient.height).color}}>(Calculated)</small></strong>
                      </div>
                  </div>
                  <div className="doc_patn_m_logistics_item">
                      <div className="doc_patn_m_log_icon"><Ruler size={18}/></div>
                      <div className="doc_patn_m_log_text"><label>Height</label><strong>{selectedPatient.height} cm</strong></div>
                  </div>
                  <div className="doc_patn_m_logistics_item">
                      <div className="doc_patn_m_log_icon"><User size={18}/></div>
                      <div className="doc_patn_m_log_text"><label>Age</label><strong>{selectedPatient.age} Yrs</strong></div>
                  </div>
              </div>
              
              <div className="doc_patn_m_history_section doc_patn_m_local_history">
                <div className="doc_patn_m_history_header_flex">
                   <h4 className="doc_patn_m_history_title"><Zap size={16} /> Consultations with You</h4>
                   <span className="doc_patn_m_history_count">{patientHistory.local.length} Entries</span>
                </div>
                <div className="doc_patn_m_history_list_stack">
                  {patientHistory.local.map(appt => (
                    <div key={appt.id} className="doc_patn_m_history_card_item doc_patn_m_local" onClick={() => handleHistoryJump(appt.id)}>
                        <div className="doc_patn_m_h_date_badge">
                            <span>{appt.date.split('-')[2]}</span>
                            <small>APR</small>
                        </div>
                        <div className="doc_patn_m_h_info">
                            <strong>{appt.type} Session</strong>
                            <p>{appt.notes || "No prescription notes available."}</p>
                        </div>
                        <ChevronRight size={18} className="doc_patn_m_jump_icon" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="doc_patn_m_card_refined doc_patn_m_global_history_sidebar">
               <span className="doc_patn_m_label_micro">Clinical Timeline (Global)</span>
               <div className="doc_patn_m_global_timeline_stack">
                 {patientHistory.global.length > 0 ? patientHistory.global.map(appt => (
                   <div key={appt.id} className="doc_patn_m_timeline_node">
                       <div className="doc_patn_m_t_dot"></div>
                       <div className="doc_patn_m_t_content">
                          <span className="doc_patn_m_t_date">{appt.date}</span>
                          <strong className="doc_patn_m_t_dr">Dr. {appt.doctor}</strong>
                          <span className="doc_patn_m_t_tag">{appt.type}</span>
                          <p className="doc_patn_m_t_notes">{appt.notes || "External consultation."}</p>
                       </div>
                   </div>
                 )) : (
                   <div className="doc_patn_m_empty_timeline">No appointments with other specialists found.</div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}