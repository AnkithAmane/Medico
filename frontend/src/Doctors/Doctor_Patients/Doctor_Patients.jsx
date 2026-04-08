import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, User, Activity, Calendar, Clock, 
  ArrowLeft, Phone, Mail, MapPin, Download,
  Filter, Scale, Ruler, CheckCircle, Zap, 
  ChevronRight, ExternalLink, ChevronLeft
} from "lucide-react";

// --- DATA IMPORTS ---
import patientsData from "../../Assets/Data/patient.json";
import appointmentsData from "../../Assets/Data/appointment.json";
import doctorsData from "../../Assets/Data/doctor.json";
import patientPhoto from "../../Assets/Images/Doctor/doctor_profile1.webp";
import "./Doctor_Patients.css";

export default function Patients() {
  const navigate = useNavigate();
  
  // --- STATE ENGINE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // --- CONTEXT: LOGGED-IN DOCTOR ---
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

  // --- LOGIC: FILTER DOCTOR'S PATIENTS ---
  const filteredPatients = useMemo(() => {
    const seenPatientNames = [...new Set(
      appointmentsData
        .filter(appt => appt.doctor === currentDoc.name)
        .map(appt => appt.patient)
    )];

    const docList = patientsData.filter(p => seenPatientNames.includes(p.name));

    return docList.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toString().includes(searchTerm) ||
      (p.disease && p.disease.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [currentDoc.name, searchTerm]);

  // --- PAGINATION CALCULATION ---
  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstRow, indexOfLastRow);

  // --- LOGIC: SEGMENT HISTORY ---
  const patientHistory = useMemo(() => {
    if (!selectedPatient) return { local: [], global: [] };
    const allRecords = appointmentsData.filter(a => a.patient === selectedPatient.name);
    return {
      local: allRecords.filter(a => a.doctor === currentDoc.name),
      global: allRecords.filter(a => a.doctor !== currentDoc.name)
    };
  }, [selectedPatient, currentDoc.name]);

  // --- HANDLERS ---
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
    <div className="dr_pat_mgmt_root med_page_fade_in">
      
      {!isDetailView ? (
        /* --- VIEW 1: PATIENT DIRECTORY & PAGINATION --- */
        <div className="dr_list_view">
          <div className="med_section_header">
            <div className="med_branding">
              <h1 className="med_title_elite">Clinical <span className="highlight">Registry</span></h1>
              <p className="med_subtitle">{filteredPatients.length} established patient files</p>
            </div>
            <div className="med_action_group">
              <button className="med_btn_outline"><Download size={16}/> Export List</button>
            </div>
          </div>

          <div className="med_filter_bar">
            <div className="med_search_box smart_search">
              <Search size={18} color="#007acc" />
              <input 
                type="text" 
                placeholder="Search Name, ID, or Condition..." 
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              />
            </div>
          </div>

          <div className="med_table_container">
            <table className="med_table">
              <thead>
                <tr>
                  <th>Patient Identity</th>
                  <th>Classification</th>
                  <th>Gender</th>
                  <th>Primary Condition</th>
                  <th className="text_right">Management</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.length > 0 ? currentPatients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="med_cell_user">
                        <img src={p.photo || patientPhoto} alt="" />
                        <div><b>{p.name}</b><span>#PT-{p.id}</span></div>
                      </div>
                    </td>
                    <td className="med_text_bold">{p.age}Y <small className="age_pill">{getAgeClass(p.age)}</small></td>
                    <td>{p.gender}</td>
                    <td><span className="med_disease_tag">{p.disease}</span></td>
                    <td className="text_right">
                      <button className="med_btn_manage" onClick={() => handleOpenFile(p)}>Open File</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="table_no_data">No clinical records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION BAR */}
          <div className="med_pagination_bar">
            <div className="pag_info">
              Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredPatients.length)}</b> of <b>{filteredPatients.length}</b>
            </div>
            <div className="pag_buttons">
              <button 
                className="pag_nav_btn" 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16}/>
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button 
                    key={pageNum} 
                    className={`pag_num_btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                className="pag_nav_btn" 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* --- VIEW 2: FULL WORKSPACE --- */
        <div className="dr_patient_workspace med_page_fade_in">
          <div className="med_detail_nav">
            <button className="med_back_btn" onClick={() => setIsDetailView(false)}>
              <ArrowLeft size={18}/> Back to Registry
            </button>
            <div className="med_case_id_badge">EHR Active: <b>{selectedPatient.name}</b></div>
          </div>

          <div className="dr_bento_workspace_grid">
            <div className="med_card_refined dr_id_card">
              <span className="med_label_micro">Patient Demographics</span>
              <div className="dr_pat_vertical_header">
                <img src={selectedPatient.photo || patientPhoto} alt="" className="dr_avatar_large" />
                <div className="dr_pat_name_stack">
                  <h2>{selectedPatient.name}</h2>
                  <span className="dr_id_pill">UID: #PT-{selectedPatient.id}</span>
                </div>
              </div>
              <div className="med_pat_contact_vertical">
                <div className="contact_line"><div className="icon_circ"><Phone size={14}/></div> <span>{selectedPatient.contact}</span></div>
                <div className="contact_line"><div className="icon_circ"><Mail size={14}/></div> <span>{selectedPatient.name.split(' ')[0].toLowerCase()}@medico.com</span></div>
                <div className="contact_line"><div className="icon_circ"><MapPin size={14}/></div> <span>West Wing, Block 4</span></div>
              </div>
            </div>

            <div className="med_card_refined dr_clinical_card">
              <span className="med_label_micro">Clinical Status & BMI</span>
              <div className="med_logistics_grid">
                  <div className="logistics_item">
                      <div className="log_icon"><Activity size={18}/></div>
                      <div className="log_text"><label>Diagnosis</label><strong>{selectedPatient.disease}</strong></div>
                  </div>
                  <div className="logistics_item">
                      <div className="log_icon"><Scale size={18}/></div>
                      <div className="log_text">
                        <label>BMI</label>
                        <strong>{calculateBMI(selectedPatient.weight, selectedPatient.height).bmi} <small style={{color: calculateBMI(selectedPatient.weight, selectedPatient.height).color}}>(Calculated)</small></strong>
                      </div>
                  </div>
                  <div className="logistics_item">
                      <div className="log_icon"><Ruler size={18}/></div>
                      <div className="log_text"><label>Height</label><strong>{selectedPatient.height} cm</strong></div>
                  </div>
                  <div className="logistics_item">
                      <div className="log_icon"><User size={18}/></div>
                      <div className="log_text"><label>Age</label><strong>{selectedPatient.age} Yrs</strong></div>
                  </div>
              </div>
              
              <div className="dr_history_section local_history">
                <div className="history_header_flex">
                   <h4 className="history_title"><Zap size={16} /> Consultations with You</h4>
                   <span className="history_count">{patientHistory.local.length} Entries</span>
                </div>
                <div className="history_list_stack">
                  {patientHistory.local.map(appt => (
                    <div key={appt.id} className="history_card_item local" onClick={() => handleHistoryJump(appt.id)}>
                        <div className="h_date_badge">
                            <span>{appt.date.split('-')[2]}</span>
                            <small>APR</small>
                        </div>
                        <div className="h_info">
                            <strong>{appt.type} Session</strong>
                            <p>{appt.notes || "No prescription notes available."}</p>
                        </div>
                        <ChevronRight size={18} className="jump_icon" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="med_card_refined dr_global_history_sidebar">
               <span className="med_label_micro">Clinical Timeline (Global)</span>
               <div className="global_timeline_stack">
                  {patientHistory.global.length > 0 ? patientHistory.global.map(appt => (
                    <div key={appt.id} className="timeline_node">
                       <div className="t_dot"></div>
                       <div className="t_content">
                          <span className="t_date">{appt.date}</span>
                          <strong className="t_dr">Dr. {appt.doctor}</strong>
                          <span className="t_tag">{appt.type}</span>
                          <p className="t_notes">{appt.notes || "External consultation."}</p>
                       </div>
                    </div>
                  )) : (
                    <div className="empty_timeline">No appointments with other specialists found.</div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}