import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search, Plus, X, Scale, Ruler, User, Phone,
  Clock, Activity, Download, ShieldCheck, CheckCircle2,
  ChevronLeft, ChevronRight, Mail, ArrowLeft, MapPin, ClipboardList
} from "lucide-react";
import axiosInstance from "../../utils/axios";
import "./Patient_Management.css";

export default function Patient_Management() {
  const { searchTerm: globalSearch } = useOutletContext();

  // Data states
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // UI states
  const [localSearch, setLocalSearch] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllAppts, setShowAllAppts] = useState(false);
  const rowsPerPage = 15;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [patRes, apptRes] = await Promise.all([
          axiosInstance.get('/patients'),
          axiosInstance.get('/appointments')
        ])
        setPatients(patRes.data.data || [])
        setAppointments(apptRes.data.data || [])
      } catch (err) {
        console.error('Failed to load patients')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helpers
  const getPatientName = (p) => {
    const u = p.userId
    return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Unknown'
  }

  const getAge = (p) => {
    if (p.age) return p.age
    if (p.userId?.dateOfBirth) {
      return new Date().getFullYear() - new Date(p.userId.dateOfBirth).getFullYear()
    }
    return null
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
    if (!w || !h || h === 0) return { bmi: "N/A", category: "Unknown", color: "#94a3b8" }
    const bmi = (w / (h * h)).toFixed(1)
    let category = "Normal", color = "#22c55e"
    if (bmi < 18.5) { category = "Underweight"; color = "#f59e0b" }
    else if (bmi > 25 && bmi < 30) { category = "Overweight"; color = "#f59e0b" }
    else if (bmi >= 30) { category = "Obese"; color = "#ef4444" }
    return { bmi, category, color }
  }

  // Get patient appointments
  const getPatientAppointments = (patient) => {
    return appointments.filter(a =>
      a.patientId?._id === patient._id ||
      a.patientId?._id?.toString() === patient._id?.toString()
    )
  }

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const name = getPatientName(p).toLowerCase()
      const contact = p.userId?.contact || ''
      const disease = (p.primaryDisease || '').toLowerCase()

      const matchesGlobal = name.includes(globalSearch.toLowerCase()) ||
        disease.includes(globalSearch.toLowerCase())
      const matchesLocal = name.includes(localSearch.toLowerCase()) ||
        contact.includes(localSearch)

      const matchesGender = filterGender ? p.userId?.gender === filterGender : true

      const age = getAge(p)
      let matchesAge = true
      if (filterAgeRange === "0-18") matchesAge = age <= 18
      else if (filterAgeRange === "19-40") matchesAge = age >= 19 && age <= 40
      else if (filterAgeRange === "41-60") matchesAge = age >= 41 && age <= 60
      else if (filterAgeRange === "60+") matchesAge = age > 60

      return matchesGlobal && matchesLocal && matchesGender && matchesAge
    });
  }, [globalSearch, localSearch, filterGender, filterAgeRange, patients])

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p>Loading patients...</p>
    </div>
  )

  return (
    <div className="admin_patnt_m_page_fade_in">
      {!selectedPatient ? (
        <div className="admin_patnt_m_main_list_view">
          {/* Header */}
          <div className="admin_patnt_m_section_header">
            <div className="admin_patnt_m_branding">
              <h1 className="admin_patnt_m_title_elite">
                Patient <span className="admin_patnt_m_highlight">Directory</span>
              </h1>
              <p className="admin_patnt_m_subtitle">
                {globalSearch && `Searching: "${globalSearch}" | `}
                {filteredPatients.length} matching records
              </p>
            </div>
            <div className="admin_patnt_m_action_group">
              <button className="admin_patnt_m_btn_outline">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="admin_patnt_m_filter_bar">
            <div className="admin_patnt_m_search_box">
              <Search size={18} color="#007acc" />
              <input
                type="text"
                placeholder="Filter by Name, Phone or Disease..."
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="admin_patnt_m_dropdown_group">
              <select className="admin_patnt_m_select_filter" value={filterGender}
                onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}>
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select className="admin_patnt_m_select_filter" value={filterAgeRange}
                onChange={(e) => { setFilterAgeRange(e.target.value); setCurrentPage(1); }}>
                <option value="">All Ages</option>
                <option value="0-18">Under 18</option>
                <option value="19-40">19 - 40 Yrs</option>
                <option value="41-60">41 - 60 Yrs</option>
                <option value="60+">60+ Yrs</option>
              </select>
              {(localSearch || filterGender || filterAgeRange) && (
                <button className="admin_patnt_m_clear_btn" onClick={() => {
                  setLocalSearch(""); setFilterGender(""); setFilterAgeRange(""); setCurrentPage(1);
                }}>
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="admin_patnt_m_table_container">
            <table className="admin_patnt_m_table">
              <thead>
                <tr>
                  <th>Patient Info</th>
                  <th>Age / Classification</th>
                  <th>Gender</th>
                  <th>Blood Group</th>
                  <th>Condition</th>
                  <th className="admin_patnt_m_text_right">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.length > 0 ? currentPatients.map((p) => {
                  const age = getAge(p)
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="admin_patnt_m_cell_user">
                          <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: '#e0f2fe', color: '#007acc',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 800
                          }}>
                            {getPatientName(p).charAt(0) || 'P'}
                          </div>
                          <div>
                            <b>{getPatientName(p)}</b>
                            <span>#{p._id?.toString().slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {age ? `${age} Yrs` : 'N/A'}
                        <small className="admin_patnt_m_age_pill">{getAgeClass(age)}</small>
                      </td>
                      <td>{p.userId?.gender || 'N/A'}</td>
                      <td>{p.bloodGroup || 'N/A'}</td>
                      <td>
                        <span className="admin_patnt_m_disease_tag">
                          {p.primaryDisease || p.medicalHistory?.[0] || 'General'}
                        </span>
                      </td>
                      <td className="admin_patnt_m_text_right">
                        <button className="admin_patnt_m_btn_manage"
                          onClick={() => { setSelectedPatient(p); setShowAllAppts(false); }}>
                          View Case
                        </button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="6" className="admin_patnt_m_no_results">
                      <Activity size={32} />
                      <p>No clinical records found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin_patnt_m_pagination_bar">
              <div className="admin_patnt_m_pag_info">
                Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredPatients.length)}</b> of <b>{filteredPatients.length}</b>
              </div>
              <div className="admin_patnt_m_pag_buttons">
                <button className="admin_patnt_m_pag_nav_btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft size={16}/>
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button key={i} className={`admin_patnt_m_pag_num_btn ${currentPage === page ? 'admin_patnt_m_active' : ''}`}
                        onClick={() => handlePageChange(page)}>{page}</button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={i}>...</span>
                  }
                  return null
                })}
                <button className="admin_patnt_m_pag_nav_btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Patient Detail View */
        <div className="admin_patnt_m_detail_workspace">
          <div className="admin_patnt_m_workspace_header">
            <button className="admin_patnt_m_btn_close_workspace" onClick={() => setSelectedPatient(null)}>
              <X size={18} /> Close Case
            </button>
            <div className="admin_patnt_m_status_indicator">
              <span className="admin_patnt_m_pulse"></span>
              Clinical Workspace: <b>#{selectedPatient._id?.toString().slice(-6)}</b>
            </div>
          </div>

          {/* Profile Hero */}
          <div className="admin_patnt_m_profile_hero_card">
            <div className="admin_patnt_m_hero_left">
              <div style={{
                width: 180, height: 180, borderRadius: 30,
                background: 'linear-gradient(135deg, #007acc, #00d2ff)',
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 800, fontSize: '3rem',
                boxShadow: '0 15px 45px rgba(0,122,204,0.2)'
              }}>
                {getPatientName(selectedPatient).charAt(0)}
              </div>
              <div className="admin_patnt_m_hero_info">
                <h2>{getPatientName(selectedPatient)}</h2>
                <div className="admin_patnt_m_hero_badges">
                  <span className="admin_patnt_m_badge_outline">
                    <User size={14}/> {getAge(selectedPatient)}Y • {selectedPatient.userId?.gender || 'N/A'}
                  </span>
                  <span className="admin_patnt_m_badge_outline">
                    <ShieldCheck size={14}/> {selectedPatient.primaryDisease || 'General'}
                  </span>
                </div>
                <div className="admin_patnt_m_hero_contact">
                  <span><Mail size={14}/> {selectedPatient.userId?.email || 'N/A'}</span>
                  <span><Phone size={14}/> {selectedPatient.userId?.contact || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="admin_patnt_m_hero_stats">
              <div className="admin_patnt_m_hero_stat_item">
                <Scale size={18} color="#007acc"/>
                <div>
                  <p>{selectedPatient.weight ? `${selectedPatient.weight}kg` : 'N/A'}</p>
                  <small>Weight</small>
                </div>
              </div>
              <div className="admin_patnt_m_hero_stat_item">
                <Ruler size={18} color="#007acc"/>
                <div>
                  <p>{selectedPatient.height ? `${selectedPatient.height}cm` : 'N/A'}</p>
                  <small>Height</small>
                </div>
              </div>
              <div className="admin_patnt_m_hero_stat_item blue_bg">
                <Activity size={18} color="#007acc"/>
                <div>
                  <p>{calculateBMI(selectedPatient.weight, selectedPatient.height).bmi}</p>
                  <small>BMI Index</small>
                </div>
              </div>
              <div className="admin_patnt_m_hero_stat_item_appt">
                <ClipboardList size={18} color="#007acc"/>
                <div>
                  <small>Total Appointments</small>
                  <p>{getPatientAppointments(selectedPatient).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="admin_patnt_m_split_history_row">
            <div className="admin_patnt_m_history_column">
              <div className="admin_patnt_m_col_header">
                <h3><Clock size={18} color="#facc15"/> Upcoming Schedules</h3>
              </div>
              <div className="admin_patnt_m_col_list">
                {getPatientAppointments(selectedPatient)
                  .filter(a => a.status === 'upcoming')
                  .slice(0, showAllAppts ? 10 : 3)
                  .map((appt, i) => (
                    <div key={i} className="admin_patnt_m_history_mini_card yellow_border">
                      <div className="mini_card_date">
                        <b>{appt.date}</b>
                        <span>{appt.time}</span>
                      </div>
                      <div className="mini_card_main">
                        <b>{appt.doctorId?.name || 'Doctor'}</b>
                        <p>{appt.reason || 'Consultation'}</p>
                      </div>
                    </div>
                  ))}
                {getPatientAppointments(selectedPatient).filter(a => a.status === 'upcoming').length === 0 && (
                  <div className="admin_patnt_m_empty_col">No upcoming visits.</div>
                )}
              </div>
            </div>

            <div className="admin_patnt_m_history_column">
              <div className="admin_patnt_m_col_header">
                <h3><CheckCircle2 size={18} color="#22c55e"/> Completed Registry</h3>
              </div>
              <div className="admin_patnt_m_col_list">
                {getPatientAppointments(selectedPatient)
                  .filter(a => a.status === 'completed')
                  .slice(0, showAllAppts ? 10 : 3)
                  .map((appt, i) => (
                    <div key={i} className="admin_patnt_m_history_mini_card green_border">
                      <div className="mini_card_date">
                        <b>{appt.date}</b>
                        <span>{appt.time}</span>
                      </div>
                      <div className="mini_card_main">
                        <b>{appt.doctorId?.name || 'Doctor'}</b>
                        <p>{appt.consultationNotes || appt.reason || 'Completed'}</p>
                      </div>
                    </div>
                  ))}
                {getPatientAppointments(selectedPatient).filter(a => a.status === 'completed').length === 0 && (
                  <div className="admin_patnt_m_empty_col">No prior records.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}