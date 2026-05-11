import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Search, Plus, Download, Activity, ChevronRight, X,
  Briefcase, ChevronLeft, GraduationCap, Mail, Clock,
  MapPin, CheckCircle2, AlertCircle, PlaneTakeoff, History
} from "lucide-react";
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from "chart.js";
import axiosInstance from "../../utils/axios";
import "./Doctor_Management.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Doctor_Management() {
  const { searchTerm: globalSearch } = useOutletContext();

  // Data states
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // UI states
  const [localSearch, setLocalSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterAvail, setFilterAvail] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [historyTab, setHistoryTab] = useState("Recent");
  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false)
  const rowsPerPage = 10;

  // Fetch doctors and appointments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [docRes, apptRes] = await Promise.all([
          axiosInstance.get('/doctors'),
          axiosInstance.get('/appointments')
        ])
        setDoctors(docRes.data.data || [])
        setAppointments(apptRes.data.data || [])
      } catch (err) {
        console.error('Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const name = (doc.name || "").toLowerCase()
      const spec = (doc.specialization || "").toLowerCase()
      const matchesGlobal = name.includes(globalSearch.toLowerCase()) || spec.includes(globalSearch.toLowerCase())
      const matchesLocal = name.includes(localSearch.toLowerCase())
      const matchesDept = filterDept ? doc.specialization === filterDept : true
      const matchesAvail = filterAvail === 'Available' ? doc.isAvailable : 
                           filterAvail === 'Not Available' ? !doc.isAvailable : true
      return matchesGlobal && matchesLocal && matchesDept && matchesAvail
    });
  }, [doctors, globalSearch, localSearch, filterDept, filterAvail]);

  // Doctor stats
  const getDocStats = (doctor) => {
    const docAppts = appointments.filter(a => a.doctorId?._id === doctor._id || a.doctorId === doctor._id)
    const uniquePatients = new Set(docAppts.map(a => a.patientId?._id?.toString()).filter(Boolean))
    return {
      totalAppts: docAppts.length,
      totalPatients: uniquePatients.size
    }
  }

  // Doctor appointments history
  const getDocAppointments = (doctor) => {
    const docAppts = appointments.filter(a => 
      a.doctorId?._id === doctor._id || a.doctorId === doctor._id
    )
    const targetStatus = historyTab === 'Recent' ? 'completed' : 'upcoming'
    return docAppts.filter(a => a.status === targetStatus)
      .sort((a, b) => historyTab === 'Recent' 
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
      ).slice(0, 3)
  }

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (num) => {
    if (num >= 1 && num <= totalPages) setCurrentPage(num)
  }

  // Save doctor
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    try {
      setSaving(true)
      const data = {
        name: formData.get('name'),
        specialization: formData.get('department'),
        experience: formData.get('experience'),
        isAvailable: formData.get('availability') === 'Available',
        bio: formData.get('degrees')
      }
      if (editDoctor) {
        await axiosInstance.put(`/doctors/${editDoctor._id}`, data)
        setDoctors(prev => prev.map(d => d._id === editDoctor._id ? { ...d, ...data } : d))
      } else {
        const res = await axiosInstance.post('/doctors', data)
        setDoctors(prev => [...prev, res.data.data])
      }
      setShowForm(false)
      setEditDoctor(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save doctor')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p>Loading doctors...</p>
    </div>
  )

  const docStats = selectedDoctor ? getDocStats(selectedDoctor) : null

  return (
    <div className="admin_doc_m_wrapper">
      {!selectedDoctor ? (
        <div className="admin_doc_m_list_view">
          {/* Header */}
          <div className="admin_doc_m_header_row">
            <div className="admin_doc_m_branding">
              <h2 className="admin_doc_m_title_elite">Medical <span>Specialists</span></h2>
              <p className="admin_doc_m_subtitle">{filteredDoctors.length} clinical personnel records</p>
            </div>
            <div className="admin_doc_m_action_group">
              <button className="admin_doc_m_btn_outline_action"><Download size={16} /> Export Registry</button>
              <button className="admin_doc_m_btn_primary_action" onClick={() => { setEditDoctor(null); setShowForm(true); }}>
                <Plus size={18} /> Add New Specialist
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="admin_doc_m_actions_bar">
            <div className="admin_doc_m_search_box">
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by name..."
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="admin_doc_m_dropdown_group">
              <select className="admin_doc_m_select_filter" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="">Departments: All</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General">General Medicine</option>
              </select>
              <select className="admin_doc_m_select_filter" value={filterAvail} onChange={(e) => setFilterAvail(e.target.value)}>
                <option value="">Status: All</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
              {(localSearch || filterDept || filterAvail) && (
                <button className="admin_doc_m_clear_btn" onClick={() => { setLocalSearch(""); setFilterDept(""); setFilterAvail(""); }}>
                  <X size={14} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="admin_doc_m_table_container">
            <div className="admin_doc_m_table_scroll">
              <table className="admin_doc_m_table">
                <thead>
                  <tr>
                    <th>Specialist Profile</th>
                    <th>Specialization</th>
                    <th>Status</th>
                    <th>Experience</th>
                    <th>Fees</th>
                    <th>Location</th>
                    <th className="admin_doc_m_text_right">Management</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDoctors.length > 0 ? currentDoctors.map((doc) => (
                    <tr key={doc._id}>
                      <td>
                        <div className="admin_doc_m_cell_user">
                          <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: '#e0f2fe', color: '#007acc',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem'
                          }}>
                            {doc.name?.charAt(0)}
                          </div>
                          <div>
                            <b>{doc.name}</b>
                            <span>{doc.specialization}</span>
                          </div>
                        </div>
                      </td>
                      <td>{doc.specialization}</td>
                      <td>
                        <span className={`admin_doc_m_status ${doc.isAvailable ? 'upcoming' : 'cancelled'}`}>
                          {doc.isAvailable ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                          {doc.isAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </td>
                      <td>{doc.experience} yrs</td>
                      <td>₹{doc.fees}</td>
                      <td>{doc.location || 'N/A'}</td>
                      <td className="admin_doc_m_text_right">
                        <button className="admin_doc_m_btn_manage" onClick={() => setSelectedDoctor(doc)}>
                          View Profile
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="admin_doc_m_empty">
                        <Activity size={32}/>
                        <p>No doctors found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin_patnt_m_pagination_bar">
              <div className="admin_patnt_m_pag_info">
                Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredDoctors.length)}</b> of <b>{filteredDoctors.length}</b>
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
        /* Doctor Detail View */
        <div className="admin_doc_m_detail_container">
          <div className="admin_doc_m_detail_header">
            <button className="admin_doc_m_btn_edit" onClick={() => { setEditDoctor(selectedDoctor); setShowForm(true); }}>
              Edit Specialist
            </button>
            <button className="admin_doc_m_btn_close" onClick={() => setSelectedDoctor(null)}>
              Close Workspace
            </button>
          </div>

          {/* Profile */}
          <div className="admin_doc_m_profile_section">
            <div style={{
              width: 160, height: 160, borderRadius: 24,
              background: 'linear-gradient(135deg, #007acc, #00d2ff)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 800, fontSize: '3rem',
              boxShadow: '0 15px 35px rgba(0,122,204,0.2)'
            }}>
              {selectedDoctor.name?.charAt(0)}
            </div>
            <div className="admin_doc_m_profile_info">
              <h2>{selectedDoctor.name}</h2>
              <p><GraduationCap size={16}/> {selectedDoctor.specialization}</p>
              <p><Briefcase size={16}/> Experience: {selectedDoctor.experience} years</p>
              <p><Mail size={16}/> Fees: ₹{selectedDoctor.fees}</p>
              <p><MapPin size={16}/> {selectedDoctor.location || 'N/A'} • Branch: {selectedDoctor.branch || 'Main'}</p>
            </div>
            <div className="admin_doc_m_profile_stats">
              <div className="admin_doc_m_stat_box">
                <p>Total Appointments</p>
                <h3>{docStats?.totalAppts}</h3>
              </div>
              <div className="admin_doc_m_stat_box">
                <p>Total Patients</p>
                <h3>{docStats?.totalPatients}</h3>
              </div>
            </div>
          </div>

          {/* Clinical Activity */}
          <div className="admin_doc_m_middle_section">
            <div className="admin_doc_m_appointments_list">
              <div className="admin_doc_m_list_header_flex">
                <h3>Consultation Log</h3>
                <div className="admin_doc_m_sub_filter_toggle">
                  <button className={`admin_doc_m_sub_tab ${historyTab === "Recent" ? "admin_doc_m_active" : ""}`} onClick={() => setHistoryTab("Recent")}>Recent</button>
                  <button className={`admin_doc_m_sub_tab ${historyTab === "Upcoming" ? "admin_doc_m_active" : ""}`} onClick={() => setHistoryTab("Upcoming")}>Upcoming</button>
                </div>
              </div>
              <ul className="admin_doc_m_elite_list">
                {getDocAppointments(selectedDoctor).length > 0 ? (
                  getDocAppointments(selectedDoctor).map((appt, idx) => (
                    <li key={idx} className="admin_doc_m_list_item_refined">
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: 38, height: 38, background: '#f0f9ff', color: '#007acc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontWeight: 800 }}>
                          {appt.patientId?.userId?.firstName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <b style={{ display: 'block' }}>
                            {appt.patientId?.userId?.firstName} {appt.patientId?.userId?.lastName}
                          </b>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{appt.date}</span>
                        </div>
                      </div>
                      <span className={`admin_doc_m_status ${appt.status === 'completed' ? 'upcoming' : 'cancelled'}`} style={{ fontSize: '10px' }}>
                        {appt.status}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="admin_doc_m_empty_small">No appointments found.</p>
                )}
              </ul>
            </div>

            {/* Performance Chart */}
            <div className="admin_doc_m_charts_section">
              <h3>Performance Overview</h3>
              <div style={{ height: '240px', marginTop: '15px' }}>
                <Bar
                  data={{
                    labels: ["Total", "Completed", "Upcoming", "Cancelled"],
                    datasets: [{
                      label: "Appointments",
                      data: [
                        docStats?.totalAppts || 0,
                        appointments.filter(a => (a.doctorId?._id === selectedDoctor._id) && a.status === 'completed').length,
                        appointments.filter(a => (a.doctorId?._id === selectedDoctor._id) && a.status === 'upcoming').length,
                        appointments.filter(a => (a.doctorId?._id === selectedDoctor._id) && a.status === 'cancelled').length,
                      ],
                      backgroundColor: ["#007acc", "#10b981", "#f59e0b", "#ef4444"],
                      borderRadius: 8,
                      barThickness: 20
                    }]
                  }}
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          {selectedDoctor.bio && (
            <div className="admin_doc_m_leaves_section" style={{ marginBottom: 20 }}>
              <h3>Professional Summary</h3>
              <p style={{ color: '#475569', marginTop: 10, lineHeight: 1.6 }}>{selectedDoctor.bio}</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="admin_doc_m_modal_overlay">
          <div className="admin_doc_m_centered_form_card">
            <div className="admin_doc_m_header_row">
              <h2 style={{ margin: 0 }}>{editDoctor ? "Update Specialist" : "Onboard Specialist"}</h2>
              <button className="admin_doc_m_clear_btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="admin_doc_m_form_grid">
              <div className="admin_doc_m_input_box">
                <label>Full Name</label>
                <input name="name" defaultValue={editDoctor?.name} placeholder="Dr. Smith" required />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Specialization</label>
                <select name="department" defaultValue={editDoctor?.specialization || "Cardiology"}>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="admin_doc_m_input_box">
                <label>Experience (Years)</label>
                <input name="experience" defaultValue={editDoctor?.experience} placeholder="15" />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Availability</label>
                <select name="availability" defaultValue={editDoctor?.isAvailable ? 'Available' : 'Not Available'}>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>
              <div className="admin_doc_m_input_box" style={{ gridColumn: 'span 2' }}>
                <label>Bio / Credentials</label>
                <input name="degrees" defaultValue={editDoctor?.bio} placeholder="MBBS, MD..." />
              </div>
              <button type="submit" className="admin_doc_m_btn_submit_pro" disabled={saving}>
                {saving ? 'Saving...' : 'Commit to System'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}