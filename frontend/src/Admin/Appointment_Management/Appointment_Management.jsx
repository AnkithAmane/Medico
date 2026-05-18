import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  X,
  Clock,
  Plus,
  Phone,
  Mail,
  ArrowLeft,
  Activity,
  MapPin,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  User,
  ClipboardList,
  ShieldCheck,
  GraduationCap,
  Hash,
  Thermometer,
  Loader2,
  Bell,
  Check,
  ArrowUpRight,
  Scroll,
  AlertCircle,
} from "lucide-react";

import "./Appointment_Management.css";

export default function Appointment_Management() {
  /* --- MERN CONNECTIVITY LOGIC --- */
  const [appointments, setAppointments] = useState([]);
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbDepartments, setDbDepartments] = useState([]); // 🟢 Track dynamic database departments

  // UI Overlay & Inline Scroll State Controls
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRequestsOverlay, setShowRequestsOverlay] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Track locally disabled elements instantly before backend re-sync complete
  const [processedRequestIds, setProcessedRequestIds] = useState(new Set());
  const appointmentRowRefs = useRef({});

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [apptRes, requestRes, deptRes] = await Promise.all([
        axios.get("http://localhost:5000/api/appointments/all", { headers }),
        axios
          .get(
            "http://localhost:5000/api/appointments/admin/pending-requests",
            { headers },
          )
          .catch(() => ({ data: [] })),
        axios
          .get("http://localhost:5000/api/departments/dropdown/list", {
            headers,
          })
          .catch(() => ({ data: [] })), // 🟢 Dynamic department fallback pipeline
      ]);

      setAppointments(apptRes.data || []);
      setRescheduleRequests(requestRes.data || []);
      setDbDepartments(deptRes.data || []); // 🟢 Synchronize backend department entries array
    } catch (err) {
      console.error("Registry Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    setIsHistoryExpanded(false);
  }, [selectedAppointment]);

  const pendingRequestsCount = useMemo(() => {
    return rescheduleRequests.filter(
      (req) =>
        !processedRequestIds.has(req._id) &&
        req.adminRequest?.status === "Pending",
    ).length;
  }, [rescheduleRequests, processedRequestIds]);

  /* --- ORIGINAL STATE INITIALIZATION --- */
  const [localSearch, setLocalSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isDetailView, setIsDetailView] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  /* --- ORIGINAL SEARCH AND FILTER LOGIC --- */
  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const patientNameStr = (a.patientName || a.patient || "").toLowerCase();
      const matchesLocal = patientNameStr.includes(localSearch.toLowerCase());
      const matchesDept = filterDept ? a.department === filterDept : true;
      const matchesStatus = filterStatus ? a.status === filterStatus : true;
      const matchesDate = dateFilter ? a.date === dateFilter : true;

      return matchesLocal && matchesDept && matchesStatus && matchesDate;
    });
  }, [localSearch, filterDept, filterStatus, dateFilter, appointments]);

  /* --- ORIGINAL PAGINATION CALCULATIONS --- */
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentAppointments = filtered.slice(indexOfFirstRow, indexOfLastRow);

  /* --- ORIGINAL DATA MEMOIZATION FOR DETAILED VIEW --- */
  const consultationHistory = useMemo(() => {
    if (!selectedAppointment) return [];
    return appointments
      .filter(
        (a) =>
          (a.patientId === selectedAppointment.patientId ||
            a.patientName === selectedAppointment.patientName ||
            a.patient === selectedAppointment.patient) &&
          a.status === "Completed" &&
          a._id !== selectedAppointment._id,
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedAppointment, appointments]);

  const activeHistoryRenderList = useMemo(() => {
    if (isHistoryExpanded) return consultationHistory;
    return consultationHistory.slice(0, 5);
  }, [consultationHistory, isHistoryExpanded]);

  const hasMoreRecordsThanPreview = consultationHistory.length > 5;

  /* ============================================================
        RESCHEDULING RESOLUTION INTERCEPTORS
        ============================================================ */
  const handleRequestAction = async (
    requestId,
    apptId,
    uiAction,
    newDate,
    newTime,
  ) => {
    try {
      const token = localStorage.getItem("token");
      const backendActionStr = uiAction === "Accept" ? "Approved" : "Rejected";

      await axios.put(
        `http://localhost:5000/api/appointments/admin/resolve-request/${apptId}`,
        {
          action: backendActionStr,
          appointmentId: apptId,
          newDate,
          newTime,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setProcessedRequestIds((prev) => {
        const next = new Set(prev);
        next.add(requestId);
        return next;
      });

      await fetchAppointments();

      if (selectedAppointment && selectedAppointment._id === apptId) {
        const freshAppt = appointments.find((a) => a._id === apptId);
        if (freshAppt) setSelectedAppointment(freshAppt);
      }
    } catch (err) {
      alert(`Action resolution failure: ${err.message}`);
    }
  };

  const navigateToAppointmentFileView = (apptId) => {
    setShowRequestsOverlay(false);
    const targetAppointment = appointments.find((a) => a._id === apptId);
    if (targetAppointment) {
      setSelectedAppointment(targetAppointment);
      setIsDetailView(true);
    } else {
      alert(
        "Target appointment metrics not loaded within current operational scope.",
      );
    }
  };

  const handlePageChange = (num) => {
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
      const container = document.querySelector(".admin_appt_m_table_scroll");
      if (container) container.scrollTop = 0;
    }
  };

  const handleViewDetails = (appt) => {
    setSelectedAppointment(appt);
    setIsDetailView(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    alert("Booking Logic Integrated");
    setShowForm(false);
  };

  if (loading)
    return (
      <div className="admin_appt_m_loader">
        <Loader2 className="spin" size={40} />
        <p>Accessing Clinical Records...</p>
      </div>
    );

  return (
    <div className="admin_appt_m_wrapper">
      {!isDetailView ? (
        <div className="admin_appt_m_list_view">
          <div className="admin_appt_m_header">
            <div className="admin_appt_m_branding">
              <h1 className="admin_appt_m_title">
                Clinical <span>Appointments</span>
              </h1>
              <p className="admin_appt_m_meta">
                {filtered.length} total records
              </p>
            </div>
            <div className="admin_appt_m_actions">
              <button
                className={`admin_appt_m_btn_req ${pendingRequestsCount > 0 ? "admin_appt_m_pulse_alert" : ""}`}
                onClick={() => setShowRequestsOverlay(true)}
              >
                <Bell size={16} /> <span>Reschedule Invoices</span>
                {pendingRequestsCount > 0 && (
                  <span className="admin_appt_m_badge_count">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              <button
                className="admin_appt_m_btn_export"
                onClick={() => window.print()}
              >
                <Download size={16} /> Export
              </button>
              <button
                className="admin_appt_m_btn_primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={18} /> New Booking
              </button>
            </div>
          </div>

          <div className="admin_appt_m_toolbar">
            <div className="admin_appt_m_search_container">
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="admin_appt_m_filter_group">
              <select
                className="admin_appt_m_select"
                value={filterDept}
                onChange={(e) => {
                  setFilterDept(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Departments</option>
                {/* 🟢 FIXED: Replaced static department options array wrapper with database projections render loop map */}
                {dbDepartments.map((dept) => (
                  <option key={dept._id || dept.name} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <select
                className="admin_appt_m_select"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>

              <input
                type="date"
                className="admin_appt_m_date_input"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />

              {(localSearch || filterDept || filterStatus || dateFilter) && (
                <button
                  className="admin_appt_m_clear"
                  onClick={() => {
                    setLocalSearch("");
                    setFilterDept("");
                    setFilterStatus("");
                    setDateFilter("");
                    setCurrentPage(1);
                  }}
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>

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
                  currentAppointments.map((appt) => {
                    const isRescheduled =
                      appt.adminRequest?.requestType === "Shift" &&
                      appt.adminRequest?.status === "Approved";
                    return (
                      <tr
                        key={appt._id || appt.id}
                        ref={(el) =>
                          (appointmentRowRefs.current[appt._id] = el)
                        }
                        className="admin_appt_m_tr_element"
                      >
                        <td>
                          <div className="admin_appt_m_user_cell">
                            <img
                              src={
                                appt.patientPhoto ||
                                `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">${(appt.patientName || appt.patient || "P").charAt(0).toUpperCase()}</text></svg>`
                              }
                              alt=""
                            />
                            <div>
                              {" "}
                              <b>{appt.patientName || appt.patient}</b>
                              <span>#{appt.appointmentID || "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="admin_appt_m_doc_name">
                          {appt.doctorName || appt.doctor}
                        </td>
                        <td>
                          <div className="admin_appt_m_time_cell">
                            <span className="admin_appt_m_date_text">
                              {appt.date}
                            </span>
                            <span className="admin_appt_m_time_text">
                              {appt.time}
                              {isRescheduled && (
                                <span className="admin_appt_m_resched_dot">
                                  (Rescheduled)
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`admin_appt_m_tag ${appt.type?.toLowerCase()}`}
                          >
                            {appt.type}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin_appt_m_status ${appt.status?.toLowerCase()}`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        <td className="admin_appt_m_text_right">
                          <button
                            className="admin_appt_m_btn_view"
                            onClick={() => handleViewDetails(appt)}
                          >
                            View File
                          </button>
                        </td>
                      </tr>
                    );
                  })
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

          {totalPages > 1 && (
            <div className="admin_appt_m_pagination">
              <p>
                Showing{" "}
                <b>
                  {indexOfFirstRow + 1}-
                  {Math.min(indexOfLastRow, filtered.length)}
                </b>{" "}
                of <b>{filtered.length}</b>
              </p>
              <div className="admin_appt_m_pag_controls">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={i}
                        className={
                          currentPage === page ? "admin_appt_m_pag_active" : ""
                        }
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={i}>...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="admin_appt_m_detail_view">
          <div className="admin_appt_m_detail_header">
            <button
              className="admin_appt_m_back_btn"
              onClick={() => setIsDetailView(false)}
            >
              <ArrowLeft size={18} /> Back to Overview
            </button>
            <div className="admin_appt_m_status_indicator">
              <span
                className={`admin_appt_m_pulse ${selectedAppointment.status?.toLowerCase()}`}
              ></span>
              Reference ID: {selectedAppointment.appointmentID || "#N/A"}
            </div>
          </div>

          <div className="admin_appt_m_grid_layout">
            <div className="admin_appt_m_card admin_appt_m_profile_card">
              {selectedAppointment.status === "Transferred" ||
              (selectedAppointment.adminRequest?.status === "Approved" &&
                selectedAppointment.adminRequest?.requestType === "Shift") ? (
                <div className="admin_appt_m_transfer_disclosure_banner">
                  <ShieldCheck size={28} className="success_tick_icon" />
                  <div className="disclosure_message_stack">
                    <h3>Administrative Reassignment Finalized</h3>
                    <p>
                      This consult vector has been safely reassigned. Operations
                      are transferred to:{" "}
                      <strong>Dr. {selectedAppointment.doctorName}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <label className="admin_appt_m_label_alt">
                    <ShieldCheck size={14} /> Specialist Profile
                  </label>
                  <div className="admin_appt_m_profile_flex">
                    <img
                      src={
                        selectedAppointment.doctorPhoto ||
                        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">DR</text></svg>`
                      }
                      alt=""
                      className="admin_appt_m_profile_img"
                    />
                    <div className="admin_appt_m_profile_info">
                      <h2>
                        {selectedAppointment.doctorName ||
                          selectedAppointment.doctor}
                      </h2>
                      <div className="admin_appt_m_degree_tag">
                        <GraduationCap size={14} /> MBBS, MD |{" "}
                        {selectedAppointment.department}
                      </div>
                      <div className="admin_appt_m_quick_meta">
                        <span>
                          <MapPin size={12} /> Tower A, Room 402
                        </span>
                        <span>
                          <Clock size={12} /> Shift: 09:00 - 17:00
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="admin_appt_m_card admin_appt_m_profile_card">
              <label className="admin_appt_m_label_alt">
                <User size={14} /> Patient Demographics
              </label>
              <div className="admin_appt_m_profile_flex">
                <img
                  src={
                    selectedAppointment.patientPhoto ||
                    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">PT</text></svg>`
                  }
                  alt=""
                  className="admin_appt_m_profile_img"
                />
                <div className="admin_appt_m_profile_info">
                  <h2>
                    {selectedAppointment.patientName ||
                      selectedAppointment.patient}
                  </h2>
                  <div className="admin_appt_m_demographic_grid">
                    <div className="admin_appt_m_demo_item">
                      Age:{" "}
                      <b>
                        {selectedAppointment.patientAge ||
                          selectedAppointment.age ||
                          "32Y"}
                      </b>
                    </div>
                    <div className="admin_appt_m_demo_item">
                      Sex:{" "}
                      <b>
                        {selectedAppointment.patientGender ||
                          selectedAppointment.gender ||
                          "Male"}
                      </b>
                    </div>
                    <div className="admin_appt_m_demo_item">
                      Blood: <b>O+</b>
                    </div>
                  </div>
                  <div className="admin_appt_m_contact_info">
                    <span>
                      <Mail size={12} />{" "}
                      {(selectedAppointment.patientName || "patient")
                        ?.split(" ")[0]
                        .toLowerCase()}
                      @medico.com
                    </span>
                    <span>
                      <Phone size={12} /> +91 99000 11222
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin_appt_m_card admin_appt_m_session_details_full">
              <label className="admin_appt_m_label_alt">
                <Activity size={14} /> Session Overview
              </label>
              <div className="admin_appt_m_session_row">
                <div className="admin_appt_m_session_cell">
                  <Calendar size={18} />
                  <div>
                    <small>Schedule Date</small>
                    <p>{selectedAppointment.date}</p>
                  </div>
                </div>
                <div className="admin_appt_m_session_cell">
                  <Clock size={18} />
                  <div>
                    <small>Time Slot</small>
                    <p>{selectedAppointment.time}</p>
                  </div>
                </div>
                <div className="admin_appt_m_session_cell">
                  <Hash size={18} />
                  <div>
                    <small>Visit Type</small>
                    <p className="admin_appt_m_type_text">
                      {selectedAppointment.type}
                    </p>
                  </div>
                </div>
                <div className="admin_appt_m_session_cell">
                  <Thermometer size={18} />
                  <div>
                    <small>Status</small>
                    <p
                      className={`admin_appt_m_status_pill ${selectedAppointment.status?.toLowerCase()}`}
                    >
                      {selectedAppointment.status}
                    </p>
                  </div>
                </div>
              </div>

              {selectedAppointment.adminRequest?.requestType === "Shift" &&
                selectedAppointment.adminRequest?.status === "Approved" && (
                  <div className="admin_appt_m_resched_history_banner">
                    <div className="banner_history_header">
                      <Clock size={16} />
                      <span>Administrative Reassignment Ledger Log Trace</span>
                    </div>

                    <div className="banner_history_body_details">
                      <p>
                        • Rerouted From:{" "}
                        <strong>
                          Dr.{" "}
                          {selectedAppointment.originalDoctor ||
                            "Previous Specialist"}
                        </strong>
                      </p>
                      <p>
                        • Transferred To:{" "}
                        <strong>Dr. {selectedAppointment.doctorName}</strong>
                      </p>
                      <p>
                        • Clinical Justification:{" "}
                        <em>
                          "
                          {selectedAppointment.adminRequest?.reason ||
                            "Operational necessity requested by medical unit."}
                          "
                        </em>
                      </p>
                    </div>

                    <div className="resched_time_delta_flow">
                      <span className="time_stamp historical">
                        {selectedAppointment.date}
                      </span>
                      <ChevronRight size={14} />
                      <span className="time_stamp operational">
                        {selectedAppointment.time}
                      </span>
                    </div>
                  </div>
                )}

              {selectedAppointment.status === "Completed" && (
                <div className="admin_appt_m_prescription_board">
                  <div className="prescription_board_title_row">
                    <FileText size={16} color="#0284c7" />
                    <h4>Authorized Clinical Rx Builder Specifications</h4>
                  </div>

                  {selectedAppointment.prescribedItems &&
                  selectedAppointment.prescribedItems.length > 0 ? (
                    <div className="admin_appt_m_rx_grid_container">
                      {selectedAppointment.prescribedItems.map((item, idx) => (
                        <div
                          key={item._id || idx}
                          className="admin_appt_m_rx_row_card"
                        >
                          <div className="rx_card_main_info_row">
                            <span
                              className={`rx_type_chip ${item.type?.toLowerCase()}`}
                            >
                              {item.type}
                            </span>
                            <h5>{item.name}</h5>
                            <span className="rx_quantity_metric">
                              Qty: <b>{item.quantity}</b>
                            </span>
                          </div>

                          {item.type === "Medicine" && item.timing && (
                            <div className="rx_card_secondary_clinical_details">
                              <div className="rx_timing_chips_flex_group">
                                {Object.keys(item.timing).map((timeKey) => (
                                  <span
                                    key={timeKey}
                                    className={`rx_timing_tag ${item.timing[timeKey] ? "active" : "inactive"}`}
                                  >
                                    {timeKey.toUpperCase().slice(0, 3)}
                                  </span>
                                ))}
                              </div>
                              <div className="rx_intake_instructions_text">
                                <span>{item.intake}</span>
                                {item.instruction && (
                                  <small>({item.instruction})</small>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="prescription_empty_records_warning">
                      <AlertCircle size={14} />
                      <span>
                        Session finalized with zero therapeutic items
                        prescribed.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="admin_appt_m_card admin_appt_m_history_full">
              <label className="admin_appt_m_label_alt">
                <ClipboardList size={14} /> Previous Encounters
              </label>
              <div
                className={`admin_appt_m_history_list_v3 ${isHistoryExpanded ? "admin_appt_m_inline_scroll_active" : ""}`}
              >
                {activeHistoryRenderList.length > 0 ? (
                  <>
                    <table className="admin_appt_m_modern_table">
                      <thead>
                        <tr>
                          <th>Clinical Date</th>
                          <th>Category</th>
                          <th>Observations</th>
                          <th className="admin_appt_m_text_right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeHistoryRenderList.map((past) => (
                          <tr key={past._id || past.id}>
                            <td className="admin_appt_m_date_col">
                              <b>{past.date}</b>
                              <br />
                              <span>{past.time}</span>
                            </td>
                            <td className="admin_appt_m_doc_name_sub">
                              <b>{past.doctorName || past.doctor}</b>
                              <br />
                              <span className="admin_appt_m_cat_tag">
                                {past.type}
                              </span>
                            </td>
                            <td>
                              <p className="admin_appt_m_history_notes_text">
                                {past.notes || "Completed Consultation"}
                              </p>
                            </td>
                            <td className="admin_appt_m_text_right">
                              <button className="admin_appt_m_btn_file_view">
                                <FileText size={14} /> Report
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {hasMoreRecordsThanPreview && (
                      <button
                        className="admin_appt_m_view_more_trigger"
                        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                      >
                        <Scroll size={14} />
                        {isHistoryExpanded
                          ? "Collapse History Logs View"
                          : `View All Encounters (${consultationHistory.length})`}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="admin_appt_m_empty_clinical">
                    <Activity size={24} />
                    <p>
                      No prior clinical history found for this patient
                      interaction.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY 1: RESCHEDULING REQUEST SLIDEOUT DRAWER */}
      {showRequestsOverlay && (
        <div
          className="admin_appt_m_overlay_backdrop"
          onClick={() => setShowRequestsOverlay(false)}
        >
          <div
            className="admin_appt_m_overlay_panel admin_appt_m_slide_left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin_appt_m_overlay_header">
              <div className="admin_appt_m_overlay_title_group">
                <AlertCircle size={20} color="#0d9488" />
                <h3>Pending Reschedules</h3>
              </div>
              <button
                className="admin_appt_m_close_panel"
                onClick={() => setShowRequestsOverlay(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin_appt_m_overlay_scroll_body">
              {rescheduleRequests.length > 0 ? (
                rescheduleRequests.map((req) => {
                  const isRowActionLocked =
                    processedRequestIds.has(req._id) ||
                    req.adminRequest?.status !== "Pending";
                  return (
                    <div
                      key={req._id}
                      className={`admin_appt_m_req_card ${req.adminRequest?.status?.toLowerCase() || "pending"}`}
                    >
                      <div className="admin_appt_m_req_card_meta">
                        <strong>{req.patientName}</strong>
                        <button
                          className="admin_appt_m_jump_btn"
                          title="View File Details"
                          onClick={() => navigateToAppointmentFileView(req._id)}
                        >
                          <span>View File</span> <ArrowUpRight size={12} />
                        </button>
                      </div>

                      <div className="admin_appt_m_req_routing">
                        <div className="admin_appt_m_route_node current_slot">
                          <span>Current node:</span>
                          <strong>
                            {req.oldDate || req.date} •{" "}
                            {req.oldTime || req.time}
                          </strong>
                        </div>
                        <div className="admin_appt_m_route_node proposed_slot">
                          <span>Proposed:</span>
                          <strong>
                            {req.newDate || req.adminRequest?.targetDoctorName}{" "}
                            • {req.newTime || "Shift"}
                          </strong>
                        </div>
                      </div>

                      <div className="admin_appt_m_req_actions">
                        <button
                          className="admin_appt_m_btn_accept_req"
                          disabled={isRowActionLocked}
                          onClick={() =>
                            handleRequestAction(
                              req._id,
                              req._id,
                              "Accept",
                              req.date,
                              req.time,
                            )
                          }
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button
                          className="admin_appt_m_btn_decline_req"
                          disabled={isRowActionLocked}
                          onClick={() =>
                            handleRequestAction(req._id, req._id, "Decline")
                          }
                        >
                          <X size={14} /> Decline
                        </button>
                      </div>

                      {isRowActionLocked && (
                        <div className="admin_appt_m_resolved_badge">
                          Status: {req.adminRequest?.status || "Resolved"}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="admin_appt_m_panel_empty_state">
                  <ShieldCheck size={32} color="#cbd5e1" />
                  <p>Zero outstanding reschedule request indicators flagged.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="admin_appt_m_modal">
          <div className="admin_appt_m_modal_box">
            <div className="admin_appt_m_modal_head">
              <h3>
                New <span>Booking</span>
              </h3>
              <button onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>
            <form className="admin_appt_m_form" onSubmit={handleFormSubmit}>
              <div className="admin_appt_m_field">
                <label>Patient Name</label>
                <input type="text" />
              </div>
              <div className="admin_appt_m_row">
                <div className="admin_appt_m_field">
                  <label>Date</label>
                  <input type="date" />
                </div>
                <div className="admin_appt_m_field">
                  <label>Time</label>
                  <input type="time" />
                </div>
              </div>
              <button type="submit" className="admin_appt_m_submit">
                Confirm Appointment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
