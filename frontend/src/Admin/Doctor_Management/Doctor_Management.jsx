import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Search,
  Plus,
  Download,
  Calendar,
  Activity,
  ChevronRight,
  X,
  User,
  Briefcase,
  ChevronLeft,
  GraduationCap,
  Mail,
  Clock,
  ShieldCheck,
  ClipboardList,
  Star,
  Milestone,
  Award,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PlaneTakeoff,
  History,
  Loader2,
} from "lucide-react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import "./Doctor_Management.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Doctor_Management() {
  /* --- 1. GLOBAL & PERSISTENT STATES --- */
  const { globalSearch = "" } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [globalEvents, setGlobalEvents] = useState([]); // 🟢 FIXED: Persistent State for live event logs tracking

  /* --- 2. ORIGINAL UI STATES (Full Preservation) --- */
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
  const rowsPerPage = 10;

  /* --- 3. MERN DATA SYNC --- */
  const syncData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // 🟢 FIXED: Concurrent tracking fetch vector pulls from your live events calendar tables parallelly
      const [docRes, apptRes, eventRes] = await Promise.all([
        axios.get("http://localhost:5000/api/doctors/list", { headers }),
        axios.get("http://localhost:5000/api/appointments/all", { headers }),
        axios.get("http://localhost:5000/api/events/all", { headers }),
      ]);

      setDoctors(docRes.data || []);
      setAppointments(apptRes.data || []);
      setGlobalEvents(eventRes.data || []);
    } catch (err) {
      console.error("Registry Sync Failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  // Sync selectedDoctor if the global list updates
  useEffect(() => {
    if (selectedDoctor) {
      const updated = doctors.find(
        (d) =>
          d._id === selectedDoctor._id ||
          d.doctorId === selectedDoctor.doctorId,
      );
      if (updated) setSelectedDoctor(updated);
    }
  }, [doctors]);

  /* --- 4. ADVANCED RELATIONAL METRICS ENGINE --- */
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const doctorName = (doc.name || "").toLowerCase();
      const doctorDept = (doc.department || "").toLowerCase();
      const matchesGlobal =
        doctorName.includes(globalSearch.toLowerCase()) ||
        doctorDept.includes(globalSearch.toLowerCase());
      const matchesLocal = doctorName.includes(localSearch.toLowerCase());
      const matchesDept = filterDept ? doc.department === filterDept : true;
      const matchesAvail = filterAvail
        ? doc.availability === filterAvail
        : true;
      return matchesGlobal && matchesLocal && matchesDept && matchesAvail;
    });
  }, [doctors, globalSearch, localSearch, filterDept, filterAvail]);

  const docStats = useMemo(() => {
    if (!selectedDoctor)
      return {
        totalAppts: 0,
        totalPatients: 0,
        averageRating: 0,
        activeReviews: [],
        attendedEvents: [],
      };

    // 1. Isolate all historical records explicitly belonging to this specialist practitioner
    const doctorAppts = appointments.filter(
      (appt) =>
        (appt.doctorName || appt.doctor || "").toLowerCase().trim() ===
        (selectedDoctor.name || "").toLowerCase().trim(),
    );

    // 2. Compute unique patient chart sets securely
    const uniquePatientList = new Set(
      doctorAppts.map(
        (appt) => appt.patientId || appt.patientName || appt.patient,
      ),
    );

    // 3. Extract populated feedback rows matching completed interaction indices
    const feedbackRecords = doctorAppts
      .filter((appt) => appt.hasFeedback && appt.feedbackRef)
      .map((appt) => ({
        patientName: appt.patientName,
        rating: appt.feedbackRef.rating || 5,
        comment:
          appt.feedbackRef.comments || "Completed consultation track logged.",
      }));

    // 4. Calculate the real-time true baseline mathematical average
    const totalRatingSum = feedbackRecords.reduce(
      (sum, item) => sum + item.rating,
      0,
    );
    const calculatedAvg =
      feedbackRecords.length > 0
        ? (totalRatingSum / feedbackRecords.length).toFixed(1)
        : "5.0";

    // 5. 🟢 FIXED: Live scan and tracking extraction logic checks if practitioner is a panelist on calendar events
    const matchingAttendedEvents = globalEvents
      .filter((event) => {
        const panelSpeakers = Array.isArray(event.doctors) ? event.doctors : [];
        return panelSpeakers.some(
          (docName) =>
            (docName || "").toLowerCase().trim() ===
            (selectedDoctor.name || "").toLowerCase().trim(),
        );
      })
      .map((event) => ({
        title: event.title,
        date: event.date,
        status: event.status || "Upcoming",
        location: event.location || "Clinical Facility",
      }));

    return {
      totalAppts: doctorAppts.length,
      totalPatients: uniquePatientList.size,
      averageRating: calculatedAvg,
      activeReviews: feedbackRecords,
      attendedEvents: matchingAttendedEvents,
    };
  }, [selectedDoctor, appointments, globalEvents]);

  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);
  const currentDoctors = filteredDoctors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const getFilteredDoctorAppointments = (doctorName) => {
    if (!doctorName) return [];
    const targetStatus = historyTab === "Recent" ? "Completed" : "Upcoming";
    return appointments
      .filter(
        (appt) =>
          (appt.doctorName || appt.doctor || "") === doctorName &&
          appt.status === targetStatus,
      )
      .sort((a, b) =>
        historyTab === "Recent"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date),
      )
      .slice(0, 3);
  };

  const getPerformanceData = (stats) => ({
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Consultations",
        data: stats || [20, 30, 25, 40],
        backgroundColor: "#007acc",
        borderRadius: 8,
        hoverBackgroundColor: "#00d2ff",
        barThickness: 20,
      },
    ],
  });

  const handlePageChange = (num) => {
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
      document.querySelector(".admin_doc_m_table_scroll")?.scrollTo(0, 0);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (editDoctor) {
        await axios.put(
          `http://localhost:5000/api/doctors/update/${editDoctor._id || editDoctor.doctorId}`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
      } else {
        await axios.post("http://localhost:5000/api/doctors/register", fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setShowForm(false);
      setEditDoctor(null);
      syncData();
      alert("Specialist Registry Updated Successfully!");
    } catch (err) {
      alert("Registry update failed. Ensure all clinical fields are valid.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="admin_dash_load">
        <Loader2 className="spin" /> Opening Global Specialist Registry...
      </div>
    );

  return (
    <div className="admin_doc_m_wrapper">
      {!selectedDoctor && (
        <div className="admin_doc_m_list_view">
          <div className="admin_doc_m_header_row">
            <div className="admin_doc_m_branding">
              <h2 className="admin_doc_m_title_elite">
                Medical <span>Specialists</span>
              </h2>
              <p className="admin_doc_m_subtitle">
                {filteredDoctors.length} clinical personnel records
              </p>
            </div>
            <div className="admin_doc_m_action_group">
              <button
                className="admin_doc_m_btn_outline_action"
                onClick={() => window.print()}
              >
                <Download size={16} /> Export Registry
              </button>
              <button
                className="admin_doc_m_btn_primary_action"
                onClick={() => {
                  setEditDoctor(null);
                  setShowForm(true);
                }}
              >
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
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="admin_doc_m_dropdown_group">
              <select
                className="admin_doc_m_select_filter"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="">All Departments</option>
                {Array.from(new Set(doctors.map((d) => d.department))).map(
                  (dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ),
                )}
              </select>
              <select
                className="admin_doc_m_select_filter"
                value={filterAvail}
                onChange={(e) => setFilterAvail(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Available">Available</option>
                <option value="On Leave">On Leave</option>
              </select>
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
                    <th className="admin_doc_m_text_right">Management</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDoctors.map((doc) => (
                    <tr key={doc._id}>
                      <td>
                        <div className="admin_doc_m_cell_user">
                          <img
                            src={
                              doc.photo
                                ? `http://localhost:5000/uploads/${doc.photo}`
                                : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">${(doc.name || "D").charAt(0).toUpperCase()}</text></svg>`
                            }
                            alt={doc.name}
                            onError={(e) => {
                              e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">DR</text></svg>`;
                            }}
                          />
                          <div>
                            <b>{doc.name}</b>
                            <span>{doc.degrees}</span>
                          </div>
                        </div>
                      </td>
                      <td className="admin_doc_m_text_bold">
                        {doc.department}
                      </td>
                      <td>
                        <span
                          className={`admin_doc_m_status ${doc.availability === "Available" ? "upcoming" : "cancelled"}`}
                        >
                          {doc.availability === "Available" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <AlertCircle size={12} />
                          )}
                          {doc.availability}
                        </span>
                      </td>
                      <td>{doc.experience}</td>
                      <td className="admin_doc_m_text_right">
                        <button
                          className="admin_doc_m_btn_manage"
                          onClick={() => setSelectedDoctor(doc)}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="admin_patnt_m_pagination_bar">
              <div className="admin_patnt_m_pag_info">
                Showing{" "}
                <b>
                  {(currentPage - 1) * rowsPerPage + 1}-
                  {Math.min(currentPage * rowsPerPage, filteredDoctors.length)}
                </b>{" "}
                of <b>{filteredDoctors.length}</b>
              </div>
              <div className="admin_patnt_m_pag_buttons">
                <button
                  className="admin_patnt_m_pag_nav_btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <button className="admin_patnt_m_pag_num_btn admin_patnt_m_active">
                  {currentPage}
                </button>
                <button
                  className="admin_patnt_m_pag_nav_btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SELECTED MASTER SPECIALIST INDEPENDENT WORKSPACE VIEW --- */}
      {selectedDoctor && (
        <div className="admin_doc_m_detail_container">
          <div className="admin_doc_m_detail_header">
            <button
              className="admin_doc_m_btn_edit"
              onClick={() => {
                setEditDoctor(selectedDoctor);
                setShowForm(true);
              }}
            >
              Edit Specialist
            </button>
            <button
              className="admin_doc_m_btn_close"
              onClick={() => setSelectedDoctor(null)}
            >
              Close Workspace
            </button>
          </div>

          <div className="admin_doc_m_profile_section">
            <img
              src={
                selectedDoctor.photo
                  ? `http://localhost:5000/uploads/${selectedDoctor.photo}`
                  : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">${(selectedDoctor.name || "D").charAt(0).toUpperCase()}</text></svg>`
              }
              alt={selectedDoctor.name}
              className="admin_doc_m_profile_photo_large"
              onError={(e) => {
                e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">DR</text></svg>`;
              }}
            />
            <div className="admin_doc_m_profile_info">
              <h2>{selectedDoctor.name}</h2>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#eab308",
                  fontWeight: "700",
                  margin: "4px 0 12px 0",
                }}
              >
                <Star size={16} fill="#eab308" color="#eab308" /> True Rating
                Index: {docStats.averageRating} / 5.0
              </p>
              <p>
                <Mail size={16} /> Email: {selectedDoctor.email}
              </p>
              <p>
                <GraduationCap size={16} /> Qualification:{" "}
                {selectedDoctor.degrees}
              </p>
              <p>
                <Briefcase size={16} /> Clinical Dept:{" "}
                {selectedDoctor.department}
              </p>
              <p>
                <Activity size={16} /> Experience: {selectedDoctor.experience}
              </p>
              <p>
                <FileText size={16} /> ID:{" "}
                {selectedDoctor.doctorId || selectedDoctor._id?.slice(-6)}
              </p>
            </div>
            <div className="admin_doc_m_profile_stats">
              <div className="admin_doc_m_stat_box">
                <p>Appointments</p>
                <h3>{docStats.totalAppts}</h3>
              </div>
              <div className="admin_doc_m_stat_box">
                <p>Total Patients</p>
                <h3>{docStats.totalPatients}</h3>
              </div>
            </div>
          </div>

          <div className="admin_doc_m_middle_section">
            <div className="admin_doc_m_appointments_list">
              <div className="admin_doc_m_list_header_flex">
                <h3>Clinical Consultation Log</h3>
                <div className="admin_doc_m_sub_filter_toggle">
                  <button
                    className={`admin_doc_m_sub_tab ${historyTab === "Recent" ? "admin_doc_m_active" : ""}`}
                    onClick={() => setHistoryTab("Recent")}
                  >
                    Recent
                  </button>
                  <button
                    className={`admin_doc_m_sub_tab ${historyTab === "Upcoming" ? "admin_doc_m_active" : ""}`}
                    onClick={() => setHistoryTab("Upcoming")}
                  >
                    Upcoming
                  </button>
                </div>
              </div>
              <ul className="admin_doc_m_elite_list">
                {getFilteredDoctorAppointments(selectedDoctor.name).map(
                  (appt, idx) => (
                    <li key={idx} className="admin_doc_m_list_item_refined">
                      <div style={{ display: "flex", gap: "12px" }}>
                        <b>{appt.patientName || appt.patient}</b>
                        <span style={{ color: "#64748b" }}>{appt.date}</span>
                      </div>
                      <span className="admin_doc_m_status upcoming">
                        {appt.status}
                      </span>
                    </li>
                  ),
                )}
                {getFilteredDoctorAppointments(selectedDoctor.name).length ===
                  0 && (
                  <li
                    className="admin_doc_m_list_item_refined"
                    style={{ color: "#94a3b8" }}
                  >
                    No recorded logs inside this track filter scope.
                  </li>
                )}
              </ul>
            </div>

            <div className="admin_doc_m_charts_section">
              <h3>Technical Consultation Activity</h3>
              <div style={{ height: "240px" }}>
                <Bar
                  data={getPerformanceData(selectedDoctor.performanceStats)}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>

          {/* ABSENCE REGISTRY */}
          <div
            className="admin_doc_m_leaves_section"
            style={{ marginBottom: "20px" }}
          >
            <div className="admin_doc_m_list_header_flex">
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <h3>Absence Registry</h3>
                <div className="admin_doc_m_sub_filter_toggle">
                  <button
                    className={`admin_doc_m_sub_tab ${leaveTab === "upcoming" ? "admin_doc_m_active" : ""}`}
                    onClick={() => setLeaveTab("upcoming")}
                  >
                    Upcoming
                  </button>
                  <button
                    className={`admin_doc_m_sub_tab ${leaveTab === "completed" ? "admin_doc_m_active" : ""}`}
                    onClick={() => setLeaveTab("completed")}
                  >
                    History
                  </button>
                </div>
              </div>
            </div>
            <div className="admin_doc_m_leaves_grid">
              {(selectedDoctor.leaves?.[leaveTab] || []).map((leave, idx) => (
                <div key={idx} className="admin_doc_m_leave_box_elite">
                  {leaveTab === "upcoming" ? (
                    <PlaneTakeoff size={14} color="#e11d48" />
                  ) : (
                    <History size={14} color="#64748b" />
                  )}
                  <div>
                    <b>{leave.reason}</b>
                    <br />
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {leave.startDate} to {leave.endDate}
                    </span>
                  </div>
                </div>
              ))}
              {(selectedDoctor.leaves?.[leaveTab] || []).length === 0 && (
                <div
                  className="admin_doc_m_leave_box_elite"
                  style={{ color: "#94a3b8" }}
                >
                  Zero leaves registered in this timeline parameter.
                </div>
              )}
            </div>
          </div>

          <div className="admin_doc_m_middle_section">
            {/* TESTIMONIALS LOG PANEL */}
            <div className="admin_doc_m_appointments_list">
              <h3>
                <Star size={18} color="#facc15" fill="#facc15" /> Patient
                Testimonials
              </h3>
              <div className="admin_doc_m_elite_list">
                {(showAllReviews
                  ? docStats.activeReviews
                  : docStats.activeReviews.slice(0, 3)
                ).map((rev, i) => (
                  <div
                    key={i}
                    className="admin_doc_m_list_item_refined"
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <b>{rev.patientName}</b>
                      <div style={{ display: "flex" }}>
                        {[...Array(Number(rev.rating))].map((_, s) => (
                          <Star
                            key={s}
                            size={10}
                            fill="#facc15"
                            color="#facc15"
                          />
                        ))}
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#475569",
                        fontStyle: "italic",
                        margin: "4px 0 0 0",
                      }}
                    >
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
                {docStats.activeReviews.length === 0 && (
                  <div
                    className="admin_doc_m_list_item_refined"
                    style={{ color: "#94a3b8" }}
                  >
                    No quality assurance feedback surveys submitted for this
                    clinician chart.
                  </div>
                )}
              </div>
              {docStats.activeReviews.length > 3 && (
                <button
                  className="admin_doc_m_sub_tab"
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowAllReviews(!showAllReviews)}
                >
                  {showAllReviews
                    ? "Collapse Testimonials View"
                    : `View All Testimonials (${docStats.activeReviews.length})`}
                </button>
              )}
            </div>

            {/* 🟢 FIXED: PROFESSIONAL LOGS SECTION GRAPH MAPS DIRECTLY FROM LIVE EVENTS HOSTED ATTENDED DATA ROW SLOTS */}
            <div className="admin_doc_m_charts_section">
              <h3>
                <Activity size={18} color="#007acc" /> Professional Logs &
                Symposia
              </h3>
              <div
                className="admin_doc_m_elite_list"
                style={{ maxHeight: "250px", overflowY: "auto" }}
              >
                {docStats.attendedEvents.length > 0 ? (
                  docStats.attendedEvents.map((evt, i) => (
                    <div
                      key={i}
                      className="admin_doc_m_list_item_refined"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            background:
                              evt.status === "Cancelled"
                                ? "#ffe4e6"
                                : "#e0f2fe",
                            padding: "8px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <ShieldCheck
                            size={16}
                            color={
                              evt.status === "Cancelled" ? "#e11d48" : "#007acc"
                            }
                          />
                        </div>
                        <div>
                          <b style={{ color: "#1e293b", fontSize: "0.9rem" }}>
                            {evt.title}
                          </b>
                          <br />
                          <small
                            style={{ color: "#64748b", fontSize: "0.75rem" }}
                          >
                            <MapPin
                              size={10}
                              style={{
                                display: "inline",
                                verticalAlign: "middle",
                                marginRight: "2px",
                              }}
                            />
                            {evt.location} • {evt.date}
                          </small>
                        </div>
                      </div>
                      <span
                        className={`admin_appt_m_status ${(evt.status || "Upcoming").toLowerCase()}`}
                        style={{
                          fontSize: "0.7rem",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontWeight: "700",
                          background:
                            evt.status === "Completed"
                              ? "#d1fae5"
                              : evt.status === "Cancelled"
                                ? "#ffe4e6"
                                : "#e0f2fe",
                          color:
                            evt.status === "Completed"
                              ? "#065f46"
                              : evt.status === "Cancelled"
                                ? "#991b1b"
                                : "#0369a1",
                        }}
                      >
                        {evt.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div
                    className="admin_doc_m_list_item_refined"
                    style={{
                      color: "#94a3b8",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No clinical conferences or calendar events tracked on roster
                    logs for this specialist profile.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETUP FORM MODAL */}
      {showForm && (
        <div className="admin_doc_m_modal_overlay">
          <div className="admin_doc_m_centered_form_card">
            <div className="admin_doc_m_header_row">
              <h2 style={{ margin: 0 }}>
                {editDoctor ? "Update Specialist" : "Onboard Personnel"}
              </h2>
              <button
                className="admin_doc_m_clear_btn"
                onClick={() => setShowForm(false)}
              >
                <X />
              </button>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="admin_doc_m_form_grid"
              encType="multipart/form-data"
            >
              <div
                className="admin_doc_m_input_box"
                style={{ gridColumn: "span 2" }}
              >
                <label>Profile Image (JPG/PNG)</label>
                <input type="file" name="photo" accept="image/*" />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Full Name</label>
                <input
                  name="name"
                  defaultValue={editDoctor?.name}
                  required
                  placeholder="Dr. Name"
                />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Medical Department</label>
                <input
                  name="department"
                  defaultValue={editDoctor?.department}
                  required
                  placeholder="e.g. Cardiology"
                />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editDoctor?.email}
                  required
                  placeholder="doctor@medico.com"
                />
              </div>
              <div className="admin_doc_m_input_box">
                <label>
                  {editDoctor
                    ? "New Password (Leave blank to keep current)"
                    : "Password"}
                </label>
                <input
                  type="password"
                  name="password"
                  required={!editDoctor}
                  placeholder="••••••••"
                />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Credentials / Degrees</label>
                <input
                  name="degrees"
                  defaultValue={editDoctor?.degrees}
                  required
                  placeholder="MBBS, MD"
                />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Experience</label>
                <input
                  name="experience"
                  defaultValue={editDoctor?.experience}
                  placeholder="e.g. 12 Years"
                />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Consultation Fee (₹)</label>
                <input
                  type="number"
                  name="fee"
                  defaultValue={editDoctor?.fee || 500}
                  required
                />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Clinical Status</label>
                <select
                  name="availability"
                  defaultValue={editDoctor?.availability || "Available"}
                >
                  <option value="Available">Available</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Busy">Busy (Emergency)</option>
                </select>
              </div>
              <div className="admin_doc_m_input_box">
                <label>Shift Start (OPD)</label>
                <input
                  type="time"
                  name="shiftStart"
                  defaultValue={editDoctor?.shiftStart || "09:00"}
                />
              </div>
              <div className="admin_doc_m_input_box">
                <label>Shift End (OPD)</label>
                <input
                  type="time"
                  name="shiftEnd"
                  defaultValue={editDoctor?.shiftEnd || "17:00"}
                />
              </div>
              <div
                className="admin_doc_m_input_box"
                style={{ gridColumn: "span 2" }}
              >
                <label>Professional Bio / Summary</label>
                <textarea
                  name="bio"
                  rows="2"
                  defaultValue={editDoctor?.bio}
                  placeholder="Describe clinical expertise..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="admin_doc_m_btn_submit_pro"
                disabled={loading}
              >
                {loading
                  ? "Synchronizing Registry..."
                  : "Save Specialist Profile"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
