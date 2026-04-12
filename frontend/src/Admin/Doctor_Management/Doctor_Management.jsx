import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Search, Plus, Download, Calendar, Activity, ChevronRight, X, User,
  Briefcase, ChevronLeft, GraduationCap, Mail, Clock, ShieldCheck,
  ClipboardList, Star, Milestone, Award, Quote, FileText, TrendingUp,
  MapPin, Phone, CheckCircle2, AlertCircle, PlaneTakeoff, History
} from "lucide-react";
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from "chart.js";

import doctorsData from "../../Assets/Data/doctor.json";
import appointmentsData from "../../Assets/Data/appointment.json";
import "./Doctor_Management.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Doctor_Management() {
  const { searchTerm: globalSearch } = useOutletContext();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [apptMonthFilter, setApptMonthFilter] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterAvail, setFilterAvail] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [leaveTab, setLeaveTab] = useState("upcoming");
  const [historyTab, setHistoryTab] = useState("Recent");
  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [doctors, setDoctors] = useState(doctorsData);

  const rowsPerPage = 10;

  useEffect(() => {
    if (selectedDoctor) {
      const updated = doctors.find(d => d.id === selectedDoctor.id);
      if (updated) setSelectedDoctor(updated);
    }
  }, [doctors, selectedDoctor]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const doctorName = (doc.name || "").toLowerCase();
      const doctorDept = (doc.department || "").toLowerCase();
      const matchesGlobal = doctorName.includes(globalSearch.toLowerCase()) ||
        doctorDept.includes(globalSearch.toLowerCase());
      const matchesLocal = doctorName.includes(localSearch.toLowerCase());
      const matchesDept = filterDept ? doc.department === filterDept : true;
      const matchesAvail = filterAvail ? doc.availability === filterAvail : true;

      return matchesGlobal && matchesLocal && matchesDept && matchesAvail;
    });
  }, [doctors, globalSearch, localSearch, filterDept, filterAvail]);

  const docStats = useMemo(() => {
    if (!selectedDoctor) return { totalAppts: 0, totalPatients: 0 };

    const doctorAppts = appointmentsData.filter(appt =>
      (appt.doctor || "").toLowerCase().trim() === (selectedDoctor.name || "").toLowerCase().trim()
    );

    const uniquePatientList = new Set(doctorAppts.map(appt => appt.patientId || appt.patient));

    return {
      totalAppts: doctorAppts.length,
      totalPatients: uniquePatientList.size
    };
  }, [selectedDoctor]);

  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstRow, indexOfLastRow);

  const getFilteredDoctorAppointments = (doctorName) => {
    if (!doctorName) return [];
    const targetStatus = historyTab === "Recent" ? "Completed" : "Upcoming";
    return appointmentsData
      .filter(appt => (appt.doctor || "") === doctorName && appt.status === targetStatus)
      .sort((a, b) => historyTab === "Recent"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
      ).slice(0, 3);
  };

  const getPerformanceData = (stats) => ({
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{
      label: "Consultations",
      data: stats || [0, 0, 0, 0],
      backgroundColor: "#007acc",
      borderRadius: 8,
      hoverBackgroundColor: "#00d2ff",
      barThickness: 20
    }],
  });

  const handlePageChange = (num) => {
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
      const container = document.querySelector(".admin_doc_m_table_scroll");
      if (container) container.scrollTop = 0;
    }
  };

  const handleEditClick = (doc) => {
    setEditDoctor(doc);
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const doctorData = {
      ...editDoctor,
      id: editDoctor ? editDoctor.id : `DOC-${String(doctors.length + 1).padStart(3, '0')}`,
      name: formData.get("name"),
      department: formData.get("department"),
      degrees: formData.get("degrees"),
      availability: formData.get("availability") || editDoctor?.availability || "Available",
      photo: editDoctor?.photo || "https://i.pravatar.cc/150",
      experience: formData.get("experience") || editDoctor?.experience,
      performanceStats: editDoctor?.performanceStats || [20, 30, 25, 40],
      leaves: editDoctor?.leaves || { completed: [], upcoming: [] },
      events: editDoctor?.events || { completed: [], upcoming: [] },
      reviews: editDoctor?.reviews || []
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
    <div className="admin_doc_m_wrapper">
      {!selectedDoctor && (
        <div className="admin_doc_m_list_view">
          <div className="admin_doc_m_header_row">
            <div className="admin_doc_m_branding">
              <h2 className="admin_doc_m_title_elite">Medical <span>Specialists</span></h2>
              <p className="admin_doc_m_subtitle">
                {globalSearch && `Context: "${globalSearch}" | `}
                {filteredDoctors.length} clinical personnel records
              </p>
            </div>
            <div className="admin_doc_m_action_group">
              <button className="admin_doc_m_btn_outline_action"><Download size={16} /> Export Registry</button>
              <button className="admin_doc_m_btn_primary_action" onClick={() => { setEditDoctor(null); setShowForm(true); }}>
                <Plus size={18} /> Add New Specialist
              </button>
            </div>
          </div>

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
                <option value="Gastroenterology">Gastroenterology</option>
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

          <div className="admin_doc_m_table_container">
            <div className="admin_doc_m_table_scroll">
              <table className="admin_doc_m_table">
                <thead>
                  <tr>
                    <th>Specialist Profile</th>
                    <th>Medical Department</th>
                    <th>Clinical Status</th>
                    <th>Experience</th>
                    <th>Consultation Fee</th>
                    <th className="admin_doc_m_text_right">Management</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDoctors.length > 0 ? (
                    currentDoctors.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="admin_doc_m_cell_user">
                            <img src={doc.photo} alt="" />
                            <div><b>{doc.name}</b><span>{doc.degrees}</span></div>
                          </div>
                        </td>
                        <td className="admin_doc_m_text_bold">{doc.department}</td>
                        <td>
                          <span className={`admin_doc_m_status ${doc.availability === "Available" ? "upcoming" : "cancelled"}`}>
                            {doc.availability === "Available" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {doc.availability}
                          </span>
                        </td>
                        <td>{doc.experience}</td>
                        <td className="admin_doc_m_text_bold">₹{doc.fee}</td>
                        <td className="admin_doc_m_text_right">
                          <button className="admin_doc_m_btn_manage" onClick={() => setSelectedDoctor(doc)}>View Profile</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="admin_doc_m_empty">
                        <Activity size={32} />
                        <p>No medical specialists found matching parameters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="admin_patnt_m_pagination_bar">
              <div className="admin_patnt_m_pag_info">
                Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredDoctors.length)}</b> of <b>{filteredDoctors.length}</b>
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
      )}

      {selectedDoctor && (
        <div className="admin_doc_m_detail_container">
          <div className="admin_doc_m_detail_header">
            <button className="admin_doc_m_btn_edit" onClick={() => handleEditClick(selectedDoctor)}>Edit Specialist</button>
            <button className="admin_doc_m_btn_close" onClick={() => setSelectedDoctor(null)}>Close Workspace</button>
          </div>

          <div className="admin_doc_m_profile_section">
            <img src={selectedDoctor.photo} alt="" className="admin_doc_m_profile_photo_large" />
            <div className="admin_doc_m_profile_info">
              <h2>{selectedDoctor.name}</h2>
              <p><GraduationCap size={16} /> Qualification: {selectedDoctor.degrees}</p>
              <p><Briefcase size={16} /> Clinical Dept: {selectedDoctor.department}</p>
              <p><Activity size={16} /> Experience: {selectedDoctor.experience}</p>
              <p><Mail size={16} /> System ID: {selectedDoctor.id} | <MapPin size={16} /> Branch: {selectedDoctor.branch}</p>
            </div>
            <div className="admin_doc_m_profile_stats">
              <div className="admin_doc_m_stat_box"><p>Total Appointments</p><h3>{docStats.totalAppts}</h3></div>
              <div className="admin_doc_m_stat_box"><p>Total Patients</p><h3>{docStats.totalPatients}</h3></div>
            </div>
          </div>

          <div className="admin_doc_m_middle_section">
            <div className="admin_doc_m_appointments_list">
              <div className="admin_doc_m_list_header_flex">
                <h3>Clinical Consultation Log</h3>
                <div className="admin_doc_m_sub_filter_toggle">
                  <button className={`admin_doc_m_sub_tab ${historyTab === "Recent" ? "admin_doc_m_active" : ""}`} onClick={() => setHistoryTab("Recent")}>Recent</button>
                  <button className={`admin_doc_m_sub_tab ${historyTab === "Upcoming" ? "admin_doc_m_active" : ""}`} onClick={() => setHistoryTab("Upcoming")}>Upcoming</button>
                </div>
              </div>
              <ul className="admin_doc_m_elite_list">
                {getFilteredDoctorAppointments(selectedDoctor.name).length > 0 ? (
                  getFilteredDoctorAppointments(selectedDoctor.name).map((appt, idx) => (
                    <li key={idx} className="admin_doc_m_list_item_refined">
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '38px', height: '38px', background: '#f0f9ff', color: '#007acc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontWeight: '800' }}>{(appt.patient || "P").charAt(0)}</div>
                        <div>
                          <b style={{ display: 'block' }}>{appt.patient}</b>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{appt.date}</span>
                        </div>
                      </div>
                      <span className={`admin_doc_m_status ${appt.status === 'Completed' ? 'upcoming' : 'cancelled'}`} style={{ fontSize: '10px' }}>{appt.status}</span>
                    </li>
                  ))
                ) : (
                  <p className="admin_doc_m_empty_small">No appointments found.</p>
                )}
              </ul>
            </div>

            <div className="admin_doc_m_charts_section">
              <h3>Specialist Performance</h3>
              <div style={{ height: '240px', marginTop: '15px' }}>
                <Bar data={getPerformanceData(selectedDoctor.performanceStats)} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>

          <div className="admin_doc_m_leaves_section" style={{ marginTop: '0px', marginBottom: '20px' }}>
            <div className="admin_doc_m_list_header_flex">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3>Absence Registry</h3>
                <div className="admin_doc_m_sub_filter_toggle">
                  <button className={`admin_doc_m_sub_tab ${leaveTab === "upcoming" ? "admin_doc_m_active" : ""}`} onClick={() => setLeaveTab("upcoming")}>Upcoming</button>
                  <button className={`admin_doc_m_sub_tab ${leaveTab === "completed" ? "admin_doc_m_active" : ""}`} onClick={() => setLeaveTab("completed")}>History</button>
                </div>
              </div>
              <input
                type="month"
                className="admin_doc_m_select_filter"
                onChange={(e) => setApptMonthFilter(e.target.value)}
              />
            </div>
            <div className="admin_doc_m_leaves_grid">
              {(selectedDoctor.leaves?.[leaveTab] || [])
                .filter(l => apptMonthFilter ? l.startDate.startsWith(apptMonthFilter) : true)
                .map((leave, idx) => (
                  <div key={idx} className="admin_doc_m_leave_box_elite">
                    {leaveTab === "upcoming" ? <PlaneTakeoff size={14} color="#e11d48" /> : <History size={14} color="#64748b" />}
                    <div>
                      <b>{leave.reason}</b><br />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{leave.startDate} to {leave.endDate}</span>
                    </div>
                  </div>
                ))}
              {(selectedDoctor.leaves?.[leaveTab]?.length === 0) && <p style={{ gridColumn: 'span 3', color: '#94a3b8', fontSize: '14px' }}>No records found for this category.</p>}
            </div>
          </div>

          <div className="admin_doc_m_middle_section">
            <div className="admin_doc_m_appointments_list">
              <div className="admin_doc_m_list_header_flex">
                <h3><Star size={18} color="#facc15" fill="#facc15" /> Patient Testimonials</h3>
              </div>
              <div className="admin_doc_m_elite_list">
                {(showAllReviews ? (selectedDoctor.reviews || []) : (selectedDoctor.reviews || []).slice(0, 3)).map((rev, i) => (
                  <div key={i} className="admin_doc_m_list_item_refined" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <b style={{ fontSize: '0.9rem' }}>{rev.patientName}</b>
                      <div style={{ display: 'flex', gap: '2px' }}>{[...Array(rev.rating)].map((_, s) => <Star key={s} size={12} fill="#facc15" color="#facc15" />)}</div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', margin: 0 }}><Quote size={12} />{rev.feedback}</p>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{rev.date}</span>
                  </div>
                ))}
              </div>
              {selectedDoctor.reviews?.length > 3 && (
                <button className="admin_doc_m_view_more_btnl" onClick={() => setShowAllReviews(!showAllReviews)}>
                  {showAllReviews ? "Show Less" : "View All Reviews"}
                </button>
              )}
            </div>

            <div className="admin_doc_m_charts_section">
              <div className="admin_doc_m_list_header_flex">
                <h3><Milestone size={18} color="#007acc" /> Professional Log</h3>
              </div>
              <div className="admin_doc_m_elite_list">
                {(showAllEvents ? (selectedDoctor.events?.completed || []) : (selectedDoctor.events?.completed || []).slice(0, 3)).map((evt, i) => (
                  <div key={i} className="admin_doc_m_list_item_refined" style={{ gap: '15px' }}>
                    <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '10px' }}><Award size={18} color="#007acc" /></div>
                    <div>
                      <b style={{ display: 'block', fontSize: '0.9rem' }}>{evt.title}</b>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{evt.date} | Certified</span>
                    </div>
                  </div>
                ))}
                {(selectedDoctor.events?.upcoming?.length > 0) && (
                  <div style={{ marginTop: '10px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#007acc' }}>Upcoming:</span>
                    {selectedDoctor.events.upcoming.map((u, idx) => (
                      <div key={idx} style={{ fontSize: '13px', color: '#475569', marginTop: '5px' }}>• {u.title} ({u.date})</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="admin_doc_m_modal_overlay">
          <div className="admin_doc_m_centered_form_card">
            <div className="admin_doc_m_header_row">
              <h2 style={{ margin: 0 }}>{editDoctor ? "Update Specialist" : "Onboard Personnel"}</h2>
              <button className="admin_doc_m_clear_btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="admin_doc_m_form_grid">
              <div className="admin_doc_m_input_box">
                <label>Full Name</label>
                <input name="name" defaultValue={editDoctor?.name} placeholder="Dr. Smith" required />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Department</label>
                <select name="department" defaultValue={editDoctor?.department || "Cardiology"}>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="admin_doc_m_input_box">
                <label>Experience (Years)</label>
                <input name="experience" defaultValue={editDoctor?.experience} placeholder="15 years" />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Availability</label>
                <select name="availability" defaultValue={editDoctor?.availability || "Available"}>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>
              <div className="admin_doc_m_input_box" style={{ gridColumn: 'span 2' }}>
                <label>Credentials</label>
                <input name="degrees" defaultValue={editDoctor?.degrees} placeholder="MBBS, MD" />
              </div>
              <button type="submit" className="admin_doc_m_btn_submit_pro">Commit to System</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}