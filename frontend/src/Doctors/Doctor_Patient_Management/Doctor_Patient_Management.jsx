import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, User, Activity, ArrowLeft, Phone, Mail, MapPin, 
  Download, Scale, Ruler, Zap, ChevronRight, ChevronLeft, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axios";
import "./Doctor_Patient_Management.css";

export default function Patients() {
  const navigate = useNavigate();
  const { user } = useAuth()

  // Data states
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Fetch doctor and appointments
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        setLoading(true)
        const docRes = await axiosInstance.get(`/doctors/user/${user._id}`)
        const doctor = docRes.data.data
        setDoctorProfile(doctor)

        const apptRes = await axiosInstance.get(`/appointments/doctor/${doctor._id}`)
        setAppointments(apptRes.data.data || [])
      } catch (err) {
        console.error('Failed to load patients:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  // Get unique patients from appointments
  const allPatients = useMemo(() => {
    const seen = new Set()
    const patients = []
    appointments.forEach(appt => {
      const patientId = appt.patientId?._id
      if (patientId && !seen.has(patientId.toString())) {
        seen.add(patientId.toString())
        patients.push(appt.patientId)
      }
    })
    return patients
  }, [appointments])

  // Age calculation
  const calculateAge = (dob) => {
    if (!dob) return null
    const today = new Date()
    const birthDate = new Date(dob)
    return today.getFullYear() - birthDate.getFullYear()
  }

  const getAgeClass = (age) => {
    if (!age) return 'Unknown'
    if (age < 13) return "Child"
    if (age < 20) return "Teen"
    if (age < 60) return "Adult"
    return "Senior"
  }

  const calculateBMI = (weight, height) => {
    const w = parseFloat(weight)
    const h = parseFloat(height) / 100
    if (!w || !h || h === 0) return { bmi: "N/A", color: "#94a3b8" }
    const bmi = (w / (h * h)).toFixed(1)
    let color = "#22c55e"
    if (bmi < 18.5 || bmi >= 25) color = "#f59e0b"
    if (bmi >= 30) color = "#ef4444"
    return { bmi, color }
  }

  // Filter patients
  const filteredPatients = useMemo(() => {
    return allPatients.filter(p => {
      const firstName = p?.userId?.firstName || ''
      const lastName = p?.userId?.lastName || ''
      const fullName = `${firstName} ${lastName}`
      const age = calculateAge(p?.userId?.dateOfBirth)
      const gender = p?.userId?.gender

      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGender = filterGender ? gender === filterGender : true

      let matchesAge = true
      if (filterAgeRange === "0-18") matchesAge = age <= 18
      else if (filterAgeRange === "19-40") matchesAge = age >= 19 && age <= 40
      else if (filterAgeRange === "41-60") matchesAge = age >= 41 && age <= 60
      else if (filterAgeRange === "60+") matchesAge = age > 60

      return matchesSearch && matchesGender && matchesAge
    })
  }, [allPatients, searchTerm, filterGender, filterAgeRange])

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage)
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentPatients = filteredPatients.slice(indexOfFirstRow, indexOfLastRow)

  // Patient appointment history
  const patientHistory = useMemo(() => {
    if (!selectedPatient) return { local: [], global: [] }
    const allRecords = appointments.filter(a => 
      a.patientId?._id?.toString() === selectedPatient._id?.toString()
    )
    return { local: allRecords, global: [] }
  }, [selectedPatient, appointments])

  const handlePageChange = (num) => {
    setCurrentPage(num)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenFile = (p) => {
    setSelectedPatient(p)
    setIsDetailView(true)
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading patients...</p>
    </div>
  )

  return (
    <div className="doc_patn_m_root doc_patn_m_page_fade_in">
      {!isDetailView ? (
        <div className="doc_patn_m_list_view">
          {/* Header */}
          <div className="doc_patn_m_section_header">
            <div className="doc_patn_m_branding">
              <h1 className="doc_patn_m_title_elite">Clinical <span className="doc_patn_m_highlight">Registry</span></h1>
              <p className="doc_patn_m_subtitle">{filteredPatients.length} established patient files under your care</p>
            </div>
            <div className="doc_patn_m_action_group">
              <button className="doc_patn_m_btn_outline"><Download size={16}/> Export List</button>
            </div>
          </div>

          {/* Filters */}
          <div className="doc_patn_m_filter_bar">
            <div className="doc_patn_m_search_box">
              <Search size={18} color="#007acc" />
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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

          {/* Patient Table */}
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
                {currentPatients.length > 0 ? currentPatients.map((p, i) => {
                  const firstName = p?.userId?.firstName || 'Unknown'
                  const lastName = p?.userId?.lastName || ''
                  const age = calculateAge(p?.userId?.dateOfBirth)
                  const gender = p?.userId?.gender || 'N/A'
                  const condition = p?.primaryDisease || p?.medicalHistory?.[0] || 'General'
                  return (
                    <tr key={p._id || i}>
                      <td>
                        <div className="doc_patn_m_cell_user">
                          <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: '#e0f2fe', color: '#007acc',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 800
                          }}>
                            {firstName.charAt(0)}
                          </div>
                          <div>
                            <b>{firstName} {lastName}</b>
                            <span>#{p._id?.toString().slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {age ? `${age}Y` : 'N/A'}
                        <small className="doc_patn_m_age_pill">{getAgeClass(age)}</small>
                      </td>
                      <td>{gender}</td>
                      <td><span className="doc_patn_m_disease_tag">{condition}</span></td>
                      <td className="doc_patn_m_text_right">
                        <button className="doc_patn_m_btn_manage" onClick={() => handleOpenFile(p)}>
                          Open File
                        </button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="5" className="doc_patn_m_no_results">
                      <Activity size={32} />
                      <p>No patients found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="doc_patn_m_pagination_bar">
              <div className="doc_patn_m_pag_info">
                Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredPatients.length)}</b> of <b>{filteredPatients.length}</b>
              </div>
              <div className="doc_patn_m_pag_buttons">
                <button className="doc_patn_m_pag_nav_btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft size={16}/>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    className={`doc_patn_m_pag_num_btn ${currentPage === i + 1 ? 'doc_patn_m_active' : ''}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="doc_patn_m_pag_nav_btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Patient Detail View
        <div className="doc_patn_m_patient_workspace doc_patn_m_page_fade_in">
          <div className="doc_patn_m_detail_nav">
            <button className="doc_patn_m_back_btn" onClick={() => setIsDetailView(false)}>
              <ArrowLeft size={18}/> Back to Registry
            </button>
            <div className="doc_patn_m_case_id_badge">
              EHR Active: <b>{selectedPatient?.userId?.firstName} {selectedPatient?.userId?.lastName}</b>
            </div>
          </div>

          <div className="doc_patn_m_bento_workspace_grid">
            {/* Demographics */}
            <div className="doc_patn_m_card_refined doc_patn_m_id_card">
              <span className="doc_patn_m_label_micro">Patient Demographics</span>
              <div className="doc_patn_m_pat_vertical_header">
                <div style={{
                  width: 90, height: 90, borderRadius: 24,
                  background: 'linear-gradient(135deg, #007acc, #00d2ff)',
                  color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: '2rem'
                }}>
                  {selectedPatient?.userId?.firstName?.charAt(0)}
                </div>
                <div className="doc_patn_m_pat_name_stack">
                  <h2>{selectedPatient?.userId?.firstName} {selectedPatient?.userId?.lastName}</h2>
                  <span className="doc_patn_m_id_pill">UID: #{selectedPatient?._id?.toString().slice(-6)}</span>
                </div>
              </div>
              <div className="doc_patn_m_pat_contact_vertical">
                <div className="doc_patn_m_contact_line">
                  <div className="doc_patn_m_icon_circ"><Phone size={14}/></div>
                  <span>{selectedPatient?.userId?.contact || 'N/A'}</span>
                </div>
                <div className="doc_patn_m_contact_line">
                  <div className="doc_patn_m_icon_circ"><Mail size={14}/></div>
                  <span>{selectedPatient?.userId?.email || 'N/A'}</span>
                </div>
                <div className="doc_patn_m_contact_line">
                  <div className="doc_patn_m_icon_circ"><MapPin size={14}/></div>
                  <span>{selectedPatient?.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Clinical Data */}
            <div className="doc_patn_m_card_refined doc_patn_m_clinical_card">
              <span className="doc_patn_m_label_micro">Clinical Status & BMI</span>
              <div className="doc_patn_m_logistics_grid">
                <div className="doc_patn_m_logistics_item">
                  <div className="doc_patn_m_log_icon"><Activity size={18}/></div>
                  <div className="doc_patn_m_log_text">
                    <label>Diagnosis</label>
                    <strong>{selectedPatient?.primaryDisease || selectedPatient?.medicalHistory?.[0] || 'N/A'}</strong>
                  </div>
                </div>
                <div className="doc_patn_m_logistics_item">
                  <div className="doc_patn_m_log_icon"><Scale size={18}/></div>
                  <div className="doc_patn_m_log_text">
                    <label>BMI</label>
                    <strong>
                      {calculateBMI(selectedPatient?.weight, selectedPatient?.height).bmi}
                    </strong>
                  </div>
                </div>
                <div className="doc_patn_m_logistics_item">
                  <div className="doc_patn_m_log_icon"><Ruler size={18}/></div>
                  <div className="doc_patn_m_log_text">
                    <label>Height</label>
                    <strong>{selectedPatient?.height ? `${selectedPatient.height} cm` : 'N/A'}</strong>
                  </div>
                </div>
                <div className="doc_patn_m_logistics_item">
                  <div className="doc_patn_m_log_icon"><User size={18}/></div>
                  <div className="doc_patn_m_log_text">
                    <label>Blood Group</label>
                    <strong>{selectedPatient?.bloodGroup || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Appointment History */}
              <div className="doc_patn_m_history_section">
                <div className="doc_patn_m_history_header_flex">
                  <h4><Zap size={16} /> Consultations with You</h4>
                  <span>{patientHistory.local.length} Entries</span>
                </div>
                <div className="doc_patn_m_history_list_stack">
                  {patientHistory.local.map(appt => (
                    <div key={appt._id} className="doc_patn_m_history_card_item doc_patn_m_local">
                      <div className="doc_patn_m_h_date_badge">
                        <span>{appt.date?.split('-')[2]}</span>
                        <small>{new Date(appt.date).toLocaleString('default', { month: 'short' })}</small>
                      </div>
                      <div className="doc_patn_m_h_info">
                        <strong>{appt.type} Session</strong>
                        <p>{appt.consultationNotes || appt.reason || "No notes available."}</p>
                      </div>
                      <ChevronRight size={18} className="doc_patn_m_jump_icon" />
                    </div>
                  ))}
                  {patientHistory.local.length === 0 && (
                    <p style={{ color: '#94a3b8' }}>No consultation history.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Global Timeline */}
            <div className="doc_patn_m_card_refined doc_patn_m_global_history_sidebar">
              <span className="doc_patn_m_label_micro">Clinical Timeline (Global)</span>
              <div className="doc_patn_m_global_timeline_stack">
                <div className="doc_patn_m_empty_timeline">
                  Global timeline from other doctors will appear here.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}