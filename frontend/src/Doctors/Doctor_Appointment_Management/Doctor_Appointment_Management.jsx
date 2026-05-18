import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  FiClock,
  FiCalendar,
  FiZap,
  FiArrowLeft,
  FiCheckCircle,
  FiActivity,
  FiUser,
  FiLoader,
  FiSearch,
  FiLock,
  FiXCircle,
  FiSettings,
  FiPlus,
  FiTrash2,
  FiAlertCircle,
  FiUserCheck,
  FiLayers,
  FiChevronRight,
  FiChevronLeft,
  FiFilter,
  FiX,
  FiCalendar as FiCalIcon,
} from "react-icons/fi";
import { Pill, FlaskConical } from "lucide-react";
import "./Doctor_Appointment_Management.css";
import { useLocation } from "react-router-dom";

function parseTimeSlot(timeSlot) {
  if (!timeSlot) return "00:00";
  const [time, modifier] = timeSlot.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

export default function Doctor_Appointment_Management() {
  const location = useLocation();
  const doctorUser = JSON.parse(localStorage.getItem("userData"));
  const loggedInDoctor = doctorUser?.name || "Dr. Guest";

  // --- CORE STATE ---
  const [filterMode, setFilterMode] = useState("ongoing");
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SUB-FILTER STATES (TEXT, TYPE, DATE) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [subFilterType, setSubFilterType] = useState("All");
  const [subFilterUrgency, setSubFilterUrgency] = useState("All");
  const [subFilterOthers, setSubFilterOthers] = useState("All");

  // --- EXPANDED PATIENT CONTEXT STATES ---
  const [patientProfileData, setPatientProfileData] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [fetchingPatientMeta, setFetchingPatientMeta] = useState(false);

  // --- RX BUILDER STATE ---
  const [prescribedItems, setPrescribedItems] = useState([]);
  const [orderQuery, setOrderQuery] = useState("");
  const [inventory, setInventory] = useState({ medicines: [], tests: [] });

  // --- ADMIN & ASYNC STATE ---
  const [replacementDoctors, setReplacementDoctors] = useState([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // --- FOLLOW-UP SYSTEM STATE MECHANICAL NODES ---
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("10:00 AM");
  const [isSchedulingFollowUp, setIsSchedulingFollowUp] = useState(false);

  // --- MENU UI TOGGLES ---
  const [activeAdminSubPanel, setActiveAdminSubPanel] = useState(null);
  const [isTransferSubmitted, setIsTransferSubmitted] = useState(false);

  const todayDate = new Date().toISOString().split("T")[0];

  // --- DYNAMIC TIME-GATE COMPLIANCE ENGINE ---
  const isTimeWindowOpenForRx = useMemo(() => {
    if (!selectedAppt || selectedAppt.status !== "Upcoming") return false;
    if (selectedAppt.date !== todayDate) return false;

    try {
      const now = new Date();
      const slotTimeStr = parseTimeSlot(selectedAppt.time);
      const [slotHours, slotMinutes] = slotTimeStr.split(":").map(Number);

      const slotTimeToday = new Date();
      slotTimeToday.setHours(slotHours, slotMinutes, 0, 0);

      const msDifference = slotTimeToday.getTime() - now.getTime();
      return msDifference <= 15 * 60 * 1000;
    } catch (e) {
      return false;
    }
  }, [selectedAppt, todayDate]);

  const isCushionValidForAdminChange = useMemo(() => {
    if (!selectedAppt) return false;
    try {
      const now = new Date();
      const slotTimeStr = parseTimeSlot(selectedAppt.time);
      const [hours, minutes] = slotTimeStr.split(":").map(Number);
      const appointmentDateTime = new Date(
        `${selectedAppt.date}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`,
      );

      const diffInHours = (appointmentDateTime - now) / (1000 * 60 * 60);
      return diffInHours >= 24;
    } catch (e) {
      return false;
    }
  }, [selectedAppt]);

  const suggestedResources = useMemo(() => {
    if (orderQuery.length < 2) return [];
    const pool = [
      ...inventory.medicines.map((m) => ({ ...m, type: "Medicine" })),
      ...inventory.tests.map((t) => ({ ...t, type: "Test" })),
    ];
    return pool
      .filter((r) => r.name.toLowerCase().includes(orderQuery.toLowerCase()))
      .slice(0, 5);
  }, [orderQuery, inventory]);

  useEffect(() => {
    if (!loading && listData.length > 0 && location.state?.autoSelectId) {
      const targetSession = listData.find(
        (appt) => appt._id === location.state.autoSelectId,
      );
      if (targetSession) {
        handleOpenAppointmentWorkspace(targetSession);
        window.history.replaceState({}, document.title);
      }
    }
  }, [loading, listData, location.state]);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [apptRes, medRes, testRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/appointments/doctor/${encodeURIComponent(loggedInDoctor)}`,
          { headers },
        ),
        axios
          .get("http://localhost:5000/api/medicines/all", { headers })
          .catch(() => ({ data: [] })),
        axios
          .get("http://localhost:5000/api/tests/all", { headers })
          .catch(() => ({ data: [] })),
      ]);
      setListData(apptRes.data || []);
      setInventory({ medicines: medRes.data || [], tests: testRes.data || [] });
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [loggedInDoctor]);

  // --- PATIENT DOSSIER ENGINE ---
  const handleOpenAppointmentWorkspace = async (appt) => {
    setSelectedAppt(appt);
    setIsDetailView(true);
    setFetchingPatientMeta(true);
    setPatientProfileData(null);
    setPatientHistory([]);
    setFollowUpDate("");
    setActiveAdminSubPanel(null);

    if (
      appt.adminRequest &&
      appt.adminRequest.requestType === "Shift" &&
      appt.adminRequest.status === "Pending"
    ) {
      setIsTransferSubmitted(true);
    } else {
      setIsTransferSubmitted(false);
    }

    if (appt.status === "Upcoming") {
      fetchAvailableReplacements(appt);
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (appt.patientId) {
        const profileRes = await axios.get(
          `http://localhost:5000/api/patients/profile/${appt.patientId}`,
          { headers },
        );
        setPatientProfileData(profileRes.data);

        // 🟢 FIXED: Changed port value from 4000 to 5000 to eliminate the Connection Refused crash
        const historyRes = await axios.get(
          `http://localhost:5000/api/appointments/list/${appt.patientId}`,
          { headers },
        );
        const filteredHistory = (historyRes.data || [])
          .filter((h) => h._id !== appt._id)
          .slice(0, 3);
        setPatientHistory(filteredHistory);
      }
    } catch (err) {
      console.error("Dossier synchronization failure:", err);
    } finally {
      setFetchingPatientMeta(false);
    }
  };

  useEffect(() => {
    if (selectedAppt && selectedAppt.status === "Completed") {
      setPrescribedItems(selectedAppt.prescribedItems || []);
    } else {
      setPrescribedItems([]);
    }
  }, [selectedAppt]);

  const fetchAvailableReplacements = async (appt) => {
    try {
      const token = localStorage.getItem("token");
      const departmentKey = appt.department || appt.departmentName || "";

      const res = await axios.get(
        `http://localhost:5000/api/doctors/replacements?date=${appt.date}&time=${appt.time}&department=${encodeURIComponent(departmentKey)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReplacementDoctors(res.data || []);
    } catch (err) {
      console.error(
        "Registry lookup failed to fetch replacement doctors:",
        err,
      );
      setReplacementDoctors([]);
    }
  };

  // --- ACTION HANDLERS ---
  const addResourceToRx = (resource) => {
    if (!isTimeWindowOpenForRx) return;
    const newItem = {
      itemId: resource._id,
      name: resource.name,
      type: resource.type,
      price: resource.price,
      quantity: 1,
      timing: { morning: false, afternoon: false, night: false },
      intake: "After Food",
      instruction: "With Water",
    };
    setPrescribedItems([...prescribedItems, newItem]);
    setOrderQuery("");
  };

  const updateRxItem = (index, field, value) => {
    if (!isTimeWindowOpenForRx) return;

    const updated = prescribedItems.map((item, idx) => {
      if (idx !== index) return item;

      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...item,
          [parent]: {
            ...item[parent],
            [child]: value,
          },
        };
      }
      return { ...item, [field]: value };
    });

    setPrescribedItems(updated);
  };

  const removeRxItem = (index) => {
    if (!isTimeWindowOpenForRx) return;
    setPrescribedItems(prescribedItems.filter((_, i) => i !== index));
  };

  const handleAdminRequest = async (type, targetDoc = null) => {
    if (isTransferSubmitted) return;
    if (!isCushionValidForAdminChange) {
      alert(
        "Action Denied: Schedule adjustments can only be initialized at least 24 hours prior to slot launch parameters.",
      );
      return;
    }

    const reason = prompt(
      `Provide administrative justification for requesting [${type}]:`,
    );
    if (!reason || !reason.trim()) {
      alert(
        "A text-based explanation is mandatory to transmit this structural shift request.",
      );
      return;
    }

    setIsRequesting(true);
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/appointments/admin-request/${selectedAppt._id}`,
        { requestType: type, reason, targetDoctorName: targetDoc },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert(
        "Your shift request has been successfully dispatched to the hospital administration system.",
      );

      setIsTransferSubmitted(true);
      setOriginalDoctor(selectedAppt.doctorName); // Setup audit tracking layer
      setActiveAdminSubPanel(null);

      setListData((prevList) =>
        prevList.map((item) =>
          item._id === selectedAppt._id
            ? {
                ...item,
                adminRequest: {
                  requestType: type,
                  status: "Pending",
                  reason: reason,
                  targetDoctorName: targetDoc,
                },
              }
            : item,
        ),
      );
    } catch (err) {
      alert("Error processing your administrative dispatch.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!followUpDate)
      return alert(
        "Please map a valid calendar index date parameters for the return session layout.",
      );

    setIsSchedulingFollowUp(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const followUpPayload = {
        patientId: selectedAppt.patientId,
        patientName: selectedAppt.patientName,
        doctorName: selectedAppt.doctorName,
        department: selectedAppt.department,
        date: followUpDate,
        time: followUpTime,
        type: "Follow-up",
        notes: `Automated recall session authorized by Dr. ${loggedInDoctor}.`,
      };

      await axios.post(
        "http://localhost:5000/api/appointments/book",
        followUpPayload,
        { headers },
      );

      alert(
        `Follow-up consultation logged successfully for ${followUpDate} at ${followUpTime}!`,
      );
      setFollowUpDate("");
      setActiveAdminSubPanel(null);
      fetchData();
    } catch (err) {
      console.error("Follow up allocation block malfunction:", err);
      alert("Failed to allocate return slot index.");
    } finally {
      setIsSchedulingFollowUp(false);
    }
  };

  const handleEndAppointment = async () => {
    if (prescribedItems.length === 0)
      return alert(
        "Please specify clinical remedies before ending the session.",
      );
    setIsFinalizing(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/appointments/complete/${selectedAppt._id}`,
        { prescribedItems: prescribedItems },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Session Finalized. Electronic prescription dispatch initialized.");
      setIsDetailView(false);
      fetchData();
    } catch (err) {
      alert("Finalization sequence failed.");
    } finally {
      setIsFinalizing(false);
    }
  };

  // --- 🟢 EXTENDED SEARCH, DATE, & CATEGORY ROUTING ENGINE ---
  const filteredList = useMemo(() => {
    return listData
      .filter((item) => {
        // Text Match Sub-Filter Engine
        const matchesSearch =
          item.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.appointmentID?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        // Custom Date Picker Filter
        if (dateFilter && item.date !== dateFilter) return false;

        // Route evaluation block rules
        const isApprovedShiftReassignment =
          item.adminRequest?.requestType === "Shift" &&
          item.adminRequest?.status === "Approved";
        const isOthers =
          item.status === "Cancelled" ||
          item.status === "Transferred" ||
          isApprovedShiftReassignment;

        if (filterMode === "others") {
          if (!isOthers) return false;
          if (subFilterOthers === "Cancelled")
            return item.status === "Cancelled";
          if (subFilterOthers === "Transferred")
            return item.status === "Transferred" || isApprovedShiftReassignment;
          return true;
        }

        if (isApprovedShiftReassignment) return false;

        if (filterMode === "ongoing") {
          const isOngoingBase =
            item.date === todayDate && item.status === "Upcoming";
          if (!isOngoingBase) return false;

          if (subFilterUrgency === "Imminent") {
            try {
              const now = new Date();
              const slotTimeStr = parseTimeSlot(item.time);
              const [h, m] = slotTimeStr.split(":").map(Number);
              const targetTime = new Date();
              targetTime.setHours(h, m, 0, 0);
              return targetTime.getTime() - now.getTime() <= 30 * 60 * 1000;
            } catch (e) {
              return true;
            }
          }
          if (subFilterUrgency === "Scheduled") {
            try {
              const now = new Date();
              const slotTimeStr = parseTimeSlot(item.time);
              const [h, m] = slotTimeStr.split(":").map(Number);
              const targetTime = new Date();
              targetTime.setHours(h, m, 0, 0);
              return targetTime.getTime() - now.getTime() > 30 * 60 * 1000;
            } catch (e) {
              return true;
            }
          }
          return true;
        }

        if (filterMode === "previous") {
          if (item.status !== "Completed") return false;
          if (subFilterType !== "All") return item.type === subFilterType;
          return true;
        }

        if (filterMode === "upcoming") {
          if (item.date <= todayDate || item.status !== "Upcoming")
            return false;
          if (subFilterType !== "All") return item.type === subFilterType;
          return true;
        }

        return false;
      })
      .sort((a, b) => {
        if (filterMode === "previous" || filterMode === "others")
          return new Date(b.date) - new Date(a.date);
        return (
          new Date(`${a.date}T${parseTimeSlot(a.time)}`) -
          new Date(`${b.date}T${parseTimeSlot(b.time)}`)
        );
      });
  }, [
    listData,
    filterMode,
    todayDate,
    searchQuery,
    dateFilter,
    subFilterType,
    subFilterUrgency,
    subFilterOthers,
  ]);

  const totalPages = Math.ceil(filteredList.length / rowsPerPage);
  const currentRows = filteredList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  if (loading)
    return (
      <div className="doc_apt_loading">
        <FiLoader className="spin" /> Syncing clinical records...
      </div>
    );

  return (
    <div className="doc_apt_m_root_view doc_apt_m_med-doc-appt">
      {!isDetailView ? (
        <div className="doc_apt_m_med_main_list_view">
          <div className="doc_apt_m_med_section_header">
            <div className="doc_apt_m_branding">
              <h1>Clinical Operations Console</h1>
              <p>Specialist Registry Panel: {loggedInDoctor}</p>
            </div>
            <div className="doc_apt_m_dr_segmented_control">
              {["previous", "ongoing", "upcoming", "others"].map((m) => (
                <button
                  key={m}
                  className={filterMode === m ? "doc_apt_m_active" : ""}
                  onClick={() => {
                    setFilterMode(m);
                    setCurrentPage(1);
                    setSubFilterType("All");
                    setSubFilterUrgency("All");
                    setSubFilterOthers("All");
                  }}
                >
                  {m === "previous"
                    ? "History"
                    : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 🟢 ADVANCED FILTER & SEARCH PANEL BAR CONTROL */}
          <div className="doc_apt_m_sub_filter_strip">
            <div className="filter_left_search_group">
              <div className="filter_search_input_box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search patient name or REF..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="filter_date_input_box">
                <FiCalendar />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              {(searchQuery || dateFilter) && (
                <button
                  className="clear_filters_inline_btn"
                  onClick={() => {
                    setSearchQuery("");
                    setDateFilter("");
                    setCurrentPage(1);
                  }}
                >
                  <FiX /> Clear
                </button>
              )}
            </div>

            <div className="filter_strip_actions">
              <div className="filter_category_dropdown">
                <FiFilter />
                {filterMode === "previous" || filterMode === "upcoming" ? (
                  <select
                    value={subFilterType}
                    onChange={(e) => {
                      setSubFilterType(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="All">All Classifications</option>
                    <option value="Consultation">Standard Consultations</option>
                    <option value="Follow-up">Recall Follow-ups</option>
                  </select>
                ) : filterMode === "ongoing" ? (
                  <select
                    value={subFilterUrgency}
                    onChange={(e) => {
                      setSubFilterUrgency(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="All">All Timelines</option>
                    <option value="Imminent">Imminent (&lt; 30 Mins)</option>
                    <option value="Scheduled">Deferred Slots</option>
                  </select>
                ) : (
                  <select
                    value={subFilterOthers}
                    onChange={(e) => {
                      setSubFilterOthers(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="All">All Terminations</option>
                    <option value="Cancelled">Cancellations</option>
                    <option value="Transferred">Approved Transfers</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="doc_apt_m_dr_content_engine">
            {currentRows.length > 0 ? (
              <div className="doc_apt_m_dr_card_grid_pro">
                {currentRows.map((a) => {
                  const isPending = a.adminRequest?.status === "Pending";
                  const isApprovedShift =
                    a.adminRequest?.requestType === "Shift" &&
                    a.adminRequest?.status === "Approved";

                  const reqClass = isApprovedShift
                    ? "card_finalized_transferred"
                    : isPending
                      ? a.adminRequest.requestType === "Shift"
                        ? "card_pending_shift"
                        : "card_pending_cancel"
                      : "";

                  return (
                    <div
                      key={a._id}
                      className={`doc_apt_m_dr_session_card_elite ${reqClass}`}
                    >
                      <div className="doc_apt_m_card_header_main">
                        <div className="doc_apt_m_avatar_init">
                          {(a.patientName || "P").charAt(0).toUpperCase()}
                        </div>
                        <div className="doc_apt_m_pat_id_stack">
                          <strong>{a.patientName}</strong>
                          <span>REF: {a.appointmentID || "N/A"}</span>
                          <span className="doc_apt_m_inline_type_tag">
                            {a.type}
                          </span>
                          {isPending && (
                            <span className="pending_alert_badge">
                              <FiAlertCircle /> Admin Approval Pending
                            </span>
                          )}
                          {isApprovedShift && (
                            <span className="finalized_transfer_badge">
                              <FiCheckCircle /> Transferred Out
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="doc_apt_m_card_body_info">
                        <div>
                          <FiClock /> {a.time}
                        </div>
                        <div>
                          <FiCalendar /> {a.date}
                        </div>
                      </div>
                      <button
                        className="doc_apt_m_med_btn_manage_full"
                        onClick={() => handleOpenAppointmentWorkspace(a)}
                      >
                        <FiSettings /> Open Patient File
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="doc_apt_m_empty_placeholder">
                <FiActivity size={32} />
                <p>
                  No operational consultation files match your active query
                  filters.
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="doc_apt_m_pagination_bar">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  <FiChevronLeft />
                </button>
                <span>
                  Page <b>{currentPage}</b> of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="doc_apt_m_detail_view">
          <div className="doc_apt_m_detail_header">
            <button
              className="doc_apt_m_back_btn"
              onClick={() => setIsDetailView(false)}
            >
              <FiArrowLeft /> Back to List
            </button>
            <div
              className={`doc_apt_m_status_indicator status_pill_${selectedAppt.status.toLowerCase()}`}
            >
              <FiLayers /> {selectedAppt.status} Module Dashboard
            </div>
          </div>

          <div className="doc_apt_m_grid_layout_structured">
            {/* WORKSPACE MIDDLE COLUMN */}
            <div className="doc_apt_m_card doc_rx_builder_card">
              {selectedAppt.status === "Upcoming" &&
                selectedAppt.date === todayDate &&
                !(
                  selectedAppt.adminRequest?.requestType === "Shift" &&
                  selectedAppt.adminRequest?.status === "Approved"
                ) && (
                  <>
                    <label className="doc_apt_m_label_alt">
                      <FiActivity /> Active Workspace Consultation Pad
                    </label>
                    {!isTimeWindowOpenForRx ? (
                      <div className="clinical_hold_msg error_lock_window">
                        <FiLock size={36} color="#ef4444" />
                        <h4>Prescription Engine Locked</h4>
                        <p>
                          This slot activates exactly 15 minutes prior to the
                          patient's booked time (
                          <strong>{selectedAppt.time}</strong>).
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="doc_rx_search_container">
                          <div className="doc_search_input_wrap">
                            <FiSearch />
                            <input
                              placeholder="Search clinical nomenclature database..."
                              value={orderQuery}
                              onChange={(e) => setOrderQuery(e.target.value)}
                            />
                          </div>
                          {suggestedResources.length > 0 && (
                            <div className="doc_rx_dropdown">
                              {suggestedResources.map((res) => (
                                <div
                                  key={res._id}
                                  className="rx_suggestion_item"
                                  onClick={() => addResourceToRx(res)}
                                >
                                  {res.type === "Medicine" ? (
                                    <Pill size={14} />
                                  ) : (
                                    <FlaskConical size={14} />
                                  )}
                                  <span>{res.name}</span>
                                  <FiPlus />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="doc_prescribed_list">
                          {prescribedItems.map((item, idx) => (
                            <div key={idx} className="doc_rx_item_row_premium">
                              <div className="rx_row_top">
                                <div className="rx_item_title">
                                  <strong>{item.name}</strong>
                                  <small>{item.type}</small>
                                </div>
                                <div className="rx_qty_stepper">
                                  <button
                                    onClick={() =>
                                      updateRxItem(
                                        idx,
                                        "quantity",
                                        Math.max(1, item.quantity - 1),
                                      )
                                    }
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    readOnly
                                  />
                                  <button
                                    onClick={() =>
                                      updateRxItem(
                                        idx,
                                        "quantity",
                                        item.quantity + 1,
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  className="rx_remove_btn"
                                  onClick={() => removeRxItem(idx)}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>

                              {item.type === "Medicine" && (
                                <div className="rx_clinical_options">
                                  <div className="rx_timing_group">
                                    {["morning", "afternoon", "night"].map(
                                      (time) => (
                                        <label
                                          key={time}
                                          className={`timing_chip ${item.timing[time] ? "active" : ""}`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={item.timing[time]}
                                            onChange={(e) =>
                                              updateRxItem(
                                                idx,
                                                `timing.${time}`,
                                                e.target.checked,
                                              )
                                            }
                                          />
                                          {time.toUpperCase().slice(0, 3)}
                                        </label>
                                      ),
                                    )}
                                  </div>
                                  <div className="rx_instruction_group">
                                    <select
                                      value={item.intake}
                                      onChange={(e) =>
                                        updateRxItem(
                                          idx,
                                          "intake",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="Before Food">
                                        Before Food
                                      </option>
                                      <option value="After Food">
                                        After Food
                                      </option>
                                      <option value="Empty Stomach">
                                        Empty Stomach
                                      </option>
                                    </select>
                                    <select
                                      value={item.instruction}
                                      onChange={(e) =>
                                        updateRxItem(
                                          idx,
                                          "instruction",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="With Water">
                                        With Water
                                      </option>
                                      <option value="With Milk">
                                        With Milk
                                      </option>
                                      <option value="Chewable">Chewable</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          className="doc_apt_m_save_btn_full"
                          onClick={handleEndAppointment}
                          disabled={isFinalizing}
                        >
                          {isFinalizing ? (
                            <FiLoader className="spin" />
                          ) : (
                            <FiCheckCircle />
                          )}{" "}
                          Finalize Treatment & Dispatch E-Rx
                        </button>
                      </>
                    )}
                  </>
                )}

              {selectedAppt.status === "Upcoming" &&
                selectedAppt.date > todayDate &&
                !(
                  selectedAppt.adminRequest?.requestType === "Shift" &&
                  selectedAppt.adminRequest?.status === "Approved"
                ) && (
                  <div className="clinical_hold_msg future_hold">
                    <FiCalIcon size={42} color="#2563eb" />
                    <h4>Advanced Session Queue Slot</h4>
                    <p>
                      This session is registered for a future calendar
                      parameters trace (<strong>{selectedAppt.date}</strong>).
                    </p>
                  </div>
                )}

              {selectedAppt.status === "Completed" && (
                <div className="completed_records_static_board">
                  <label className="doc_apt_m_label_alt static_rx_badge">
                    <FiCheckCircle color="#10b981" /> Dispatched Treatment
                    Specifications
                  </label>
                  <div className="static_rx_container_grid">
                    {prescribedItems.map((item, idx) => (
                      <div key={idx} className="static_rx_row_card">
                        <div className="static_rx_main_info">
                          <h4>{item.name}</h4>
                          <span className="type_badge_flat">{item.type}</span>
                        </div>
                        <div className="static_rx_details_metrics">
                          <span>
                            Quantity: <strong>{item.quantity} units</strong>
                          </span>
                          {item.type === "Medicine" && (
                            <>
                              <span className="dot_spacer">•</span>
                              <span>
                                Schedule:{" "}
                                <strong>
                                  {Object.keys(item.timing || {})
                                    .filter((k) => item.timing[k])
                                    .join("-")
                                    .toUpperCase() || "N/A"}
                                </strong>
                              </span>
                              <span className="dot_spacer">•</span>
                              <span>
                                Administration:{" "}
                                <strong>
                                  {item.intake} ({item.instruction})
                                </strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAppt.status === "Cancelled" ||
                selectedAppt.status === "Transferred" ||
                (selectedAppt.adminRequest?.requestType === "Shift" &&
                  selectedAppt.adminRequest?.status === "Approved" && (
                    <div className="clinical_hold_msg inactive_hold_splash">
                      <FiXCircle size={40} color="#94a3b8" />
                      <h4>Archived Deactivated Record</h4>
                      <p>
                        This consultation pathway has been finalized as{" "}
                        <strong>
                          {selectedAppt.adminRequest?.status === "Approved"
                            ? "Transferred (Shifted)"
                            : selectedAppt.status}
                        </strong>
                        .
                        {selectedAppt.adminRequest?.status === "Approved" &&
                          ` Assignment rerouted to Dr. ${selectedAppt.adminRequest?.targetDoctorName}.`}
                      </p>
                    </div>
                  ))}
            </div>

            {/* RIGHT SIDEBAR COLUMN */}
            <div className="doc_apt_m_sidebar">
              <div className="doc_apt_m_card profile_dossier_expanded_card">
                <label className="doc_apt_m_label_alt">
                  <FiUserCheck /> Comprehensive Patient Dossier
                </label>
                {fetchingPatientMeta ? (
                  <div className="mini_dossier_loader">
                    <FiLoader className="spin" /> Fetching secure metrics...
                  </div>
                ) : (
                  <div className="dossier_profile_inner_blueprint">
                    <div className="dossier_header_avatar_flex">
                      <img
                        src={
                          patientProfileData?.photo
                            ? `http://localhost:5000/uploads/${patientProfileData.photo}`
                            : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">${(selectedAppt.patientName || "P").charAt(0).toUpperCase()}</text></svg>`
                        }
                        className="dossier_img_avatar"
                        alt="Patient Registry Profile Avatar"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">P</text></svg>`;
                        }}
                      />
                      <div className="dossier_name_meta">
                        <h3>{selectedAppt.patientName}</h3>
                        <span className="ref_id_sub_badge">
                          REF ID: {selectedAppt.appointmentID}
                        </span>
                      </div>
                    </div>

                    <div className="dossier_vitals_grid_flat">
                      <div className="dossier_v_node">
                        <span>Age</span>
                        <strong>{patientProfileData?.age || "N/A"} Yrs</strong>
                      </div>
                      <div className="dossier_v_node">
                        <span>Blood Group</span>
                        <strong>
                          {patientProfileData?.bloodGroup || "N/A"}
                        </strong>
                      </div>
                      <div className="dossier_v_node">
                        <span>Weight</span>
                        <strong>
                          {patientProfileData?.weight
                            ? `${patientProfileData.weight} kg`
                            : "N/A"}
                        </strong>
                      </div>
                      <div className="dossier_v_node">
                        <span>Height</span>
                        <strong>
                          {patientProfileData?.height
                            ? `${patientProfileData.height} cm`
                            : "N/A"}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
                {selectedAppt.notes && (
                  <div className="dossier_symptoms_box">
                    <h5>Patient Symptoms:</h5>
                    <p>"{selectedAppt.notes}"</p>
                  </div>
                )}
              </div>

              <div className="doc_apt_m_card patient_history_timeline_card">
                <label className="doc_apt_m_label_alt">
                  <FiLayers /> Historical Consultations (Last 3 Visits)
                </label>
                <div className="dossier_timeline_vertical_wrapper">
                  {patientHistory.length > 0 ? (
                    patientHistory.map((historyItem) => (
                      <div
                        key={historyItem._id}
                        className="timeline_history_node"
                      >
                        <div className="timeline_meta_top">
                          <span className="h_date">{historyItem.date}</span>
                          <span
                            className={`h_status status_tag_flat_${historyItem.status.toLowerCase()}`}
                          >
                            {historyItem.status}
                          </span>
                        </div>
                        <p className="h_doc">
                          Consultant Specialist:{" "}
                          <strong>Dr. {historyItem.doctorName}</strong>
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="no_history_prompt_box">
                      No previous historical consultation traces logged.
                    </div>
                  )}
                </div>
              </div>

              {selectedAppt.status === "Upcoming" &&
                !(
                  selectedAppt.adminRequest?.requestType === "Shift" &&
                  selectedAppt.adminRequest?.status === "Approved"
                ) && (
                  <div className="doc_apt_m_card admin_controls_guarded_card">
                    <label className="doc_apt_m_label_alt">
                      <FiSettings /> Guarded Clinical Allocations
                    </label>
                    {!isCushionValidForAdminChange ? (
                      <div className="admin_lock_badge_alert locked_cushion_notice">
                        <FiLock size={14} />{" "}
                        <span>
                          Schedule alterations are locked (Failsafe trigger:
                          Operations launch in less than 24 hours).
                        </span>
                      </div>
                    ) : (
                      <div className="doc_admin_panel_inner expanded_workspace_panel">
                        <div className="clinical_actions_nav_hub_buttons">
                          <button
                            className={`hub_nav_btn ${activeAdminSubPanel === "reassign" ? "active_nav" : ""}`}
                            disabled={isTransferSubmitted || isRequesting}
                            onClick={() =>
                              setActiveAdminSubPanel(
                                activeAdminSubPanel === "reassign"
                                  ? null
                                  : "reassign",
                              )
                            }
                          >
                            <div className="btn_label_left_side">
                              <FiUser size={14} />{" "}
                              <span>
                                {isTransferSubmitted
                                  ? "Transfer Request Dispatched"
                                  : "Reassign Specialist"}
                              </span>
                            </div>
                            <FiChevronRight className="nav_chevron" />
                          </button>
                          <button
                            className={`hub_nav_btn color_teal_btn ${activeAdminSubPanel === "followup" ? "active_nav_teal" : ""}`}
                            onClick={() =>
                              setActiveAdminSubPanel(
                                activeAdminSubPanel === "followup"
                                  ? null
                                  : "followup",
                              )
                            }
                          >
                            <div className="btn_label_left_side">
                              <FiCalIcon size={14} />{" "}
                              <span>Schedule Follow-up</span>
                            </div>
                            <FiChevronRight className="nav_chevron" />
                          </button>
                        </div>

                        {activeAdminSubPanel === "reassign" &&
                          !isTransferSubmitted && (
                            <div className="admin_input_field_stack nested_action_drawer_box doc_dashboard_view_fade_in">
                              <p>Select Alternative Replacement Consultant:</p>
                              <select
                                className="doc_shift_select"
                                onChange={(e) => {
                                  if (e.target.value)
                                    handleAdminRequest("Shift", e.target.value);
                                }}
                              >
                                <option value="">Select Doctor...</option>
                                {replacementDoctors.map((d) => (
                                  <option key={d._id} value={d.name}>
                                    {d.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                        {activeAdminSubPanel === "followup" && (
                          <div className="admin_input_field_stack follow_up_scheduler_subbox nested_action_drawer_box doc_dashboard_view_fade_in">
                            <p style={{ color: "#0d9488", fontWeight: "700" }}>
                              Configure Recall Session Parameters:
                            </p>
                            <div className="follow_up_input_row">
                              <input
                                type="date"
                                className="doc_shift_select"
                                min={todayDate}
                                value={followUpDate}
                                onChange={(e) =>
                                  setFollowUpDate(e.target.value)
                                }
                              />
                              <select
                                className="doc_shift_select"
                                value={followUpTime}
                                onChange={(e) =>
                                  setFollowUpTime(e.target.value)
                                }
                              >
                                <option value="09:00 AM">09:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="12:00 PM">12:00 PM</option>
                                <option value="02:00 PM">02:00 PM</option>
                              </select>
                            </div>
                            <button
                              className="doc_apt_m_save_btn_full follow_up_submit_btn"
                              style={{
                                marginTop: "10px",
                                background: "#0d9488",
                              }}
                              onClick={handleScheduleFollowUp}
                              disabled={isSchedulingFollowUp}
                            >
                              {isSchedulingFollowUp ? (
                                <FiLoader className="spin" />
                              ) : (
                                <FiZap />
                              )}{" "}
                              Authorize Follow-up Booking
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
