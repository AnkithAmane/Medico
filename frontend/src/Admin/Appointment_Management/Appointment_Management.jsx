import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, X, Clock, Plus, Phone, Mail, ArrowLeft, Activity, MapPin, FileText,
  ChevronLeft, ChevronRight, Download, Calendar, User, ClipboardList, ShieldCheck, 
  GraduationCap, Hash, Thermometer
} from "lucide-react";
import axiosInstance from "../../utils/axios";
import "./Appointment_Management.css";

export default function Appointment_Management() {
  // Data states
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // UI states
  const [localSearch, setLocalSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch all appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const res = await axiosInstance.get('/appointments')
        setAppointments(res.data.data || [])
      } catch (err) {
        console.error('Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  // Helper to get patient name
  const getPatientName = (appt) => {
    const u = appt.patientId?.userId
    return u ? `${u.firstName} ${u.lastName}` : 'Patient'
  }

  // Helper to get doctor name
  const getDoctorName = (appt) => appt.doctorId?.name || 'Doctor'

  // Filter logic
  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const patientName = getPatientName(a).toLowerCase()
      const matchesLocal = patientName.includes(localSearch.toLowerCase())
      const matchesStatus = filterStatus ? a.status === filterStatus : true
      const matchesDate = dateFilter ? a.date === dateFilter : true
      return matchesLocal && matchesStatus && matchesDate
    });
  }, [localSearch, filterStatus, dateFilter, appointments]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentAppointments = filtered.slice(indexOfFirstRow, indexOfLastRow);

  // Consultation history for selected appointment
  const consultationHistory = useMemo(() => {
    if (!selectedAppointment) return [];
    return appointments.filter(a =>
      a.patientId?._id === selectedAppointment.patientId?._id &&
      a.doctorId?._id === selectedAppointment.doctorId?._id &&
      a._id !== selectedAppointment._id
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedAppointment, appointments]);

  const handlePageChange = (num) => {
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
    }
  };

  const handleViewDetails = (appt) => {
    setSelectedAppointment(appt);
    setIsDetailView(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p>Loading appointments...</p>
    </div>
  )

  return (
    <div className="admin_appt_m_wrapper">
      {!isDetailView ? (
        <div className="admin_appt_m_list_view">
          {/* Header */}
          <div className="admin_appt_m_header">
            <div className="admin_appt_m_branding">
              <h1 className="admin_appt_m_title">Clinical <span>Appointments</span></h1>
              <p className="admin_appt_m_meta">{filtered.length} total records</p>
            </div>
            <div className="admin_appt_m_actions">
              <button className="admin_appt_m_btn_export">
                <Download size={16}/> Export
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="admin_appt_m_toolbar">
            <div className="admin_appt_m_search_container">
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search by patient name..." 
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }} 
              />
            </div>
            <div className="admin_appt_m_filter_group">
              <select 
                className="admin_appt_m_select" 
                value={filterStatus} 
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input 
                type="date" 
                className="admin_appt_m_date_input" 
                value={dateFilter} 
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }} 
              />
              {(localSearch || filterStatus || dateFilter) && (
                <button className="admin_appt_m_clear" onClick={() => {
                  setLocalSearch(""); setFilterStatus(""); setDateFilter(""); setCurrentPage(1);
                }}>
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="admin_appt_m_table_scroll">
            <table className="admin_appt_m_table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Schedule</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="admin_appt_m_text_right">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.length > 0 ? (
                  currentAppointments.map((appt) => (
                    <tr key={appt._id}>
                      <td>
                        <div className="admin_appt_m_user_cell">
                          <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: '#e0f2fe', color: '#007acc',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 800
                          }}>
                            {getPatientName(appt).charAt(0)}
                          </div>
                          <div>
                            <b>{getPatientName(appt)}</b>
                            <span>#{appt.recordId || appt._id?.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="admin_appt_m_doc_name">{getDoctorName(appt)}</td>
                      <td>
                        <div>
                          <span style={{ display: 'block', fontWeight: 600 }}>{appt.date}</span>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{appt.time}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`admin_appt_m_tag ${appt.type?.toLowerCase()}`}>
                          {appt.type}
                        </span>
                      </td>
                      <td>
                        <span className={`admin_appt_m_status ${appt.status?.toLowerCase()}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="admin_appt_m_text_right">
                        <button className="admin_appt_m_btn_view" onClick={() => handleViewDetails(appt)}>
                          View File
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="admin_appt_m_empty">
                      <Activity size={32} />
                      <p>No matching records found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin_appt_m_pagination">
              <p>Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filtered.length)}</b> of <b>{filtered.length}</b></p>
              <div className="admin_appt_m_pag_controls">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft size={16}/>
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button key={i} className={currentPage === page ? 'admin_appt_m_pag_active' : ''} 
                        onClick={() => handlePageChange(page)}>{page}</button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={i}>...</span>;
                  }
                  return null;
                })}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Detail View */
        <div className="admin_appt_m_detail_view">
          <div className="admin_appt_m_detail_header">
            <button className="admin_appt_m_back_btn" onClick={() => setIsDetailView(false)}>
              <ArrowLeft size={18}/> Back to Overview
            </button>
            <div className="admin_appt_m_status_indicator">
              <span className={`admin_appt_m_pulse`}></span>
              Reference ID: #{selectedAppointment.recordId || selectedAppointment._id?.slice(-6)}
            </div>
          </div>

          <div className="admin_appt_m_grid_layout">
            {/* Doctor Card */}
            <div className="admin_appt_m_card admin_appt_m_profile_card">
              <label className="admin_appt_m_label_alt">
                <ShieldCheck size={14}/> Specialist Profile
              </label>
              <div className="admin_appt_m_profile_flex">
                <div style={{
                  width: 100, height: 100, borderRadius: 20,
                  background: '#e0f2fe', color: '#007acc',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: '2rem'
                }}>
                  {getDoctorName(selectedAppointment).charAt(0)}
                </div>
                <div className="admin_appt_m_profile_info">
                  <h2>{getDoctorName(selectedAppointment)}</h2>
                  <div className="admin_appt_m_degree_tag">
                    <GraduationCap size={14}/> {selectedAppointment.doctorId?.specialization}
                  </div>
                  <div className="admin_appt_m_quick_meta">
                    <span><MapPin size={12}/> {selectedAppointment.doctorId?.location || 'N/A'}</span>
                    <span><Clock size={12}/> Fee: ₹{selectedAppointment.fees || selectedAppointment.doctorId?.fees}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Card */}
            <div className="admin_appt_m_card admin_appt_m_profile_card">
              <label className="admin_appt_m_label_alt">
                <User size={14}/> Patient Demographics
              </label>
              <div className="admin_appt_m_profile_flex">
                <div style={{
                  width: 100, height: 100, borderRadius: 20,
                  background: '#f0fdf4', color: '#10b981',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: '2rem'
                }}>
                  {getPatientName(selectedAppointment).charAt(0)}
                </div>
                <div className="admin_appt_m_profile_info">
                  <h2>{getPatientName(selectedAppointment)}</h2>
                  <div className="admin_appt_m_demographic_grid">
                    <div className="admin_appt_m_demo_item">
                      Blood: <b>{selectedAppointment.patientId?.bloodGroup || 'N/A'}</b>
                    </div>
                    <div className="admin_appt_m_demo_item">
                      Weight: <b>{selectedAppointment.patientId?.weight || 'N/A'}</b>
                    </div>
                  </div>
                  <div className="admin_appt_m_contact_info">
                    <span><Mail size={12}/> {selectedAppointment.patientId?.userId?.email || 'N/A'}</span>
                    <span><Phone size={12}/> {selectedAppointment.patientId?.userId?.contact || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Overview */}
            <div className="admin_appt_m_card admin_appt_m_session_details_full">
              <label className="admin_appt_m_label_alt">
                <Activity size={14}/> Session Overview
              </label>
              <div className="admin_appt_m_session_row">
                <div className="admin_appt_m_session_cell">
                  <Calendar size={18} />
                  <div><small>Date</small><p>{selectedAppointment.date}</p></div>
                </div>
                <div className="admin_appt_m_session_cell">
                  <Clock size={18} />
                  <div><small>Time</small><p>{selectedAppointment.time}</p></div>
                </div>
                <div className="admin_appt_m_session_cell">
                  <Hash size={18} />
                  <div><small>Type</small><p className="admin_appt_m_type_text">{selectedAppointment.type}</p></div>
                </div>
                <div className="admin_appt_m_session_cell">
                  <Thermometer size={18} />
                  <div>
                    <small>Status</small>
                    <p className={`admin_appt_m_status_pill ${selectedAppointment.status?.toLowerCase()}`}>
                      {selectedAppointment.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="admin_appt_m_card admin_appt_m_history_full">
              <label className="admin_appt_m_label_alt">
                <ClipboardList size={14}/> Previous Encounters
              </label>
              <div className="admin_appt_m_history_list_v3">
                {consultationHistory.length > 0 ? (
                  <table className="admin_appt_m_modern_table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Notes</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultationHistory.map((past) => (
                        <tr key={past._id}>
                          <td><b>{past.date}</b><br/><span style={{fontSize:'0.75rem',color:'#94a3b8'}}>{past.time}</span></td>
                          <td><span className="admin_appt_m_cat_tag">{past.type}</span></td>
                          <td><p className="admin_appt_m_history_notes_text">{past.consultationNotes || past.reason || '--'}</p></td>
                          <td><span className={`admin_appt_m_status ${past.status?.toLowerCase()}`}>{past.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin_appt_m_empty_clinical">
                    <Activity size={24}/>
                    <p>No prior clinical history found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}