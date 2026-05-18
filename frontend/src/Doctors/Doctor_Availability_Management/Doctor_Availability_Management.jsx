import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FiCalendar,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiX, // 🟢 Valid close/remove icon
  FiCheck, // 🟢 Valid success check icon
  FiLoader,
  FiAlertCircle, // 🟢 Valid info/pending icon
  FiSave,
  FiEye,
  FiFilter,
} from "react-icons/fi";
import "./Doctor_Availability_Management.css";
const DEFAULT_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

const LEAVE_TYPES = [
  { id: "sick", label: "Medical/Sick" },
  { id: "emergency", label: "Emergency" },
  { id: "casual", label: "Personal" },
  { id: "conference", label: "Conference" },
];

const todayDate = new Date().toISOString().split("T")[0];

export default function ScheduleAvailability() {
  const doctorUser = JSON.parse(localStorage.getItem("userData")) || {};
  const targetId = doctorUser?._id || doctorUser?.doctorId || "";

  /* --- 1. CORE STATES --- */
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [leaveFilter, setLeaveFilter] = useState("all"); // 'all', 'upcoming', 'completed'
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [conflictsCount, setConflictsCount] = useState(0);

  const [pendingBlockoutSlots, setPendingBlockoutSlots] = useState([]);
  const [savingBlockouts, setSavingBlockouts] = useState(false);

  /* --- 🟢 NEW: HISTORICAL EXPANSION OVERLAY STATES --- */
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [modalFilterStatus, setModalFilterStatus] = useState("all"); // 'all', 'pending', 'approved', 'rejected'
  const [modalFilterStartDate, setModalFilterStartDate] = useState("");
  const [modalFilterEndDate, setModalFilterEndDate] = useState("");

  const [newLeave, setNewLeave] = useState({
    startDate: todayDate,
    endDate: todayDate,
    type: "casual",
    reason: "",
    priority: "Medium",
  });

  // 2. DATA SYNCHRONIZATION FROM SERVER
  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/leaves/history/${targetId}?doctorName=${encodeURIComponent(doctorUser.name || "")}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setLeaveHistory(res.data || []);
    } catch (err) {
      console.error("Leave history sync failed", err);
    }
  };

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/doctors/availability/${targetId}/${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const mappedSchedule = {};
      const serverConfirmedBlocked = res.data.blockedSlots || [];
      const serverPendingAdminSlots = res.data.pendingAdminSlots || [];

      DEFAULT_SLOTS.forEach((slot) => {
        if (serverConfirmedBlocked.includes(slot)) {
          mappedSchedule[slot] = "unavailable";
        } else if (serverPendingAdminSlots.includes(slot)) {
          mappedSchedule[slot] = "pending_admin";
        } else {
          mappedSchedule[slot] = "available";
        }
      });

      setSchedule(mappedSchedule);
      const consolidatedBlocks = [
        ...new Set([...serverConfirmedBlocked, ...serverPendingAdminSlots]),
      ];
      setPendingBlockoutSlots(consolidatedBlocks);
    } catch (err) {
      const initial = {};
      DEFAULT_SLOTS.forEach((t) => (initial[t] = "available"));
      setSchedule(initial);
      setPendingBlockoutSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkImpact = async () => {
      if (showLeaveForm) {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `http://localhost:5000/api/leaves/check-conflicts?doctorName=${encodeURIComponent(doctorUser.name)}&startDate=${newLeave.startDate}&endDate=${newLeave.endDate}&leaveType=Full_Day&slots=`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setConflictsCount(res.data.count || 0);
        } catch (err) {
          console.error("Conflict checker failed.");
        }
      }
    };
    checkImpact();
  }, [newLeave.startDate, newLeave.endDate, showLeaveForm, doctorUser.name]);

  useEffect(() => {
    fetchLeaves();
    fetchAvailability();
  }, [selectedDate, targetId]);

  /* --- 3. TWO-WAY CHECKLIST SLOT TOGGLER --- */
  const handleToggleChecklistSlot = (time) => {
    const currentStatus = schedule[time] || "available";

    if (currentStatus === "unavailable" || currentStatus === "pending_admin") {
      setPendingBlockoutSlots((prev) => prev.filter((s) => s !== time));
      setSchedule((prev) => ({ ...prev, [time]: "available" }));
    } else {
      setPendingBlockoutSlots((prev) => [...prev, time]);
      setSchedule((prev) => ({ ...prev, [time]: "pending_admin" }));
    }
  };

  const handleSaveChecklistBlockouts = async () => {
    if (
      window.confirm(
        `Commit these hourly slot blockout transformations for date: ${selectedDate}?`,
      )
    ) {
      setSavingBlockouts(true);
      try {
        const token = localStorage.getItem("token");
        const payload = {
          doctorId: targetId,
          doctorName: doctorUser.name || "Practitioner",
          leaveType: "Slot_Block",
          startDate: selectedDate,
          endDate: selectedDate,
          blockedSlots: pendingBlockoutSlots,
          reason:
            "Manually requested schedule console hour slot blockout modification.",
          type: "Personal",
          priority: "Medium",
        };

        await axios.post("http://localhost:5000/api/leaves/apply", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert("Hourly configuration block saved for administration review!");
        fetchAvailability();
        fetchLeaves();
      } catch (err) {
        alert(
          "Failed to synchronize adjustments: " +
            (err.response?.data?.message || err.message),
        );
        fetchAvailability();
      } finally {
        setSavingBlockouts(false);
      }
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        doctorId: targetId,
        doctorName: doctorUser.name || "",
        leaveType: "Full_Day",
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        blockedSlots: [],
        reason: newLeave.reason,
        type:
          LEAVE_TYPES.find((t) => t.id === newLeave.type)?.label || "Personal",
        priority: newLeave.priority,
      };

      await axios.post("http://localhost:5000/api/leaves/apply", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(
        conflictsCount > 0
          ? `Absence registered. ${conflictsCount} bookings flagged for auto-redistribution.`
          : "Absence configuration applied successfully.",
      );
      setShowLeaveForm(false);
      setNewLeave({
        startDate: todayDate,
        endDate: todayDate,
        type: "casual",
        reason: "",
        priority: "Medium",
      });
      fetchLeaves();
    } catch (err) {
      alert("Pipeline error: " + (err.response?.data?.message || err.message));
    }
  };

  /* --- 🟢 4. MEMOIZATION FOR IN-LINE MAIN VIEW DASHBOARD (LIMIT TO 5 RECENT/UPCOMING) --- */
  const dashboardLeaveHistory = useMemo(() => {
    const now = new Date(todayDate);
    // Filters to only show active upcoming entries or items recently logged
    return [...leaveHistory]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate) -
          new Date(a.createdAt || a.startDate),
      )
      .slice(0, 5); // 🟢 STRICT LIMIT: Displays top 5 files down the dashboard viewport
  }, [leaveHistory]);

  /* --- 🟢 5. MEMOIZATION FOR DYNAMIC ADVANCED HISTORY OVERLAY MODAL FILTERS --- */
  const filteredModalLeaveHistory = useMemo(() => {
    return leaveHistory
      .filter((l) => {
        const apptDate = new Date(l.startDate);

        // Filter Criterion A: Roster Workflow Status Check
        const matchesStatus =
          modalFilterStatus === "all" ||
          String(l.status).toLowerCase() === modalFilterStatus.toLowerCase();

        // Filter Criterion B: Start Range Boundary
        const matchesStart =
          !modalFilterStartDate || apptDate >= new Date(modalFilterStartDate);

        // Filter Criterion C: End Range Boundary
        const matchesEnd =
          !modalFilterEndDate || apptDate <= new Date(modalFilterEndDate);

        return matchesStatus && matchesStart && matchesEnd;
      })
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }, [
    leaveHistory,
    modalFilterStatus,
    modalFilterStartDate,
    modalFilterEndDate,
  ]);

  const changeMonth = (step) => {
    let m = currentMonth + step;
    let y = currentYear;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long" },
  );
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <div className="doc_avail_m_root doc_avail_m_page_fade_in">
      <div className="doc_avail_m_section_header">
        <div className="doc_avail_m_branding">
          <h1 className="doc_avail_m_title_elite">
            Schedule <span className="doc_avail_m_highlight">Console</span>
          </h1>
          <p className="doc_avail_m_subtitle">
            Clinical redistribution engine for{" "}
            <b>{doctorUser?.name || "Practitioner"}</b>
          </p>
        </div>
        <button
          className="doc_avail_m_btn_primary"
          onClick={() => setShowLeaveForm(true)}
        >
          <FiPlus /> Record Absence
        </button>
      </div>

      <div className="doc_avail_m_row_top">
        {/* CALENDAR MODULE */}
        <div className="doc_avail_m_card_refined doc_avail_m_cal_module">
          <div className="doc_avail_m_cal_nav_header">
            <button
              className="doc_avail_m_nav_btn_lite"
              onClick={() => changeMonth(-1)}
            >
              <FiChevronLeft />
            </button>
            <h3 className="doc_avail_m_cal_title">
              {monthName} <span>{currentYear}</span>
            </h3>
            <button
              className="doc_avail_m_nav_btn_lite"
              onClick={() => changeMonth(1)}
            >
              <FiChevronRight />
            </button>
          </div>
          <div className="doc_avail_m_cal_days_header">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="doc_avail_m_cal_date_grid">
            {Array(firstDayOfMonth)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="doc_avail_m_day_blank"></div>
              ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const fDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              return (
                <div
                  key={d}
                  className={`doc_avail_m_day_node ${selectedDate === fDate ? "doc_avail_m_active" : ""} ${fDate < todayDate ? "doc_avail_m_past" : ""}`}
                  onClick={() => fDate >= todayDate && setSelectedDate(fDate)}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>

        {/* TIME-SLOT CHECKLIST REGISTRY MONITOR */}
        <div
          className="doc_avail_m_card_refined doc_avail_m_slots_module"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {loading ? (
            <div className="loader_center">
              <FiLoader className="spin" />
            </div>
          ) : (
            <>
              <div>
                <span className="doc_avail_m_label_micro">
                  Session Logistics Checklist: {selectedDate}
                </span>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    margin: "2px 0 12px 0",
                  }}
                >
                  Toggle hours inside the matrix layout below. Press save to
                  sync your changes to the admin review database.
                </p>
                <div className="doc_avail_m_slot_grid_layout">
                  {DEFAULT_SLOTS.map((t) => {
                    const currentSlotState = schedule[t] || "available";
                    return (
                      <div
                        key={t}
                        className={`doc_avail_m_slot_card_elite doc_avail_m_${currentSlotState}`}
                        onClick={() => handleToggleChecklistSlot(t)}
                        style={{
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          userSelect: "none",
                        }}
                      >
                        <div className="doc_avail_m_slot_meta">
                          <span className="doc_avail_m_s_time">{t}</span>
                          <span className="doc_avail_m_s_label">
                            {currentSlotState.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <div className="doc_avail_m_slot_check_indicator">
                          {currentSlotState === "unavailable" ? (
                            <FiX size={14} color="#ef4444" /> // 🟢 Fixed reference tag
                          ) : currentSlotState === "pending_admin" ? (
                            <FiAlertCircle size={14} color="#d97706" />
                          ) : (
                            <FiCheck size={14} color="#10b981" /> // 🟢 Fixed reference tag
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "15px",
                  textAlign: "right",
                }}
              >
                <button
                  type="button"
                  onClick={handleSaveChecklistBlockouts}
                  disabled={savingBlockouts}
                  className="doc_avail_m_btn_primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#10b981",
                  }}
                >
                  {savingBlockouts ? (
                    <>
                      <FiLoader className="spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <FiSave /> Save Blocked Slots
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DASHBOARD SUMMARY MINI HISTORICAL GRAPH VIEW (LIMITED TO TOP 5 RECENT FILES) */}
      <div className="doc_avail_m_row_bottom">
        <div className="doc_avail_m_card_refined doc_avail_m_history_card">
          <div
            className="doc_avail_m_history_header_flex"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>
              Recent Roster Configurations{" "}
              <small style={{ fontWeight: "400", color: "#64748b" }}>
                (Top 5 logs)
              </small>
            </h3>
            <button
              type="button"
              className="doc_avail_m_swap_filter active"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f1f5f9",
                padding: "6px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                fontSize: "0.8rem",
                color: "#1e293b",
                fontWeight: "600",
                cursor: "pointer",
              }}
              onClick={() => setShowHistoryModal(true)}
            >
              <FiEye /> View All History
            </button>
          </div>
          <table className="doc_avail_m_table">
            <thead>
              <tr>
                <th>Timeline Window</th>
                <th>Configuration Type</th>
                <th>Justification Context</th>
                <th className="doc_avail_m_text_right">Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardLeaveHistory.length > 0 ? (
                dashboardLeaveHistory.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <b>
                        {l.startDate}{" "}
                        {l.endDate !== l.startDate ? `to ${l.endDate}` : ""}
                      </b>
                    </td>
                    <td>
                      <span
                        className="doc_avail_m_type_pill"
                        style={{ textTransform: "capitalize" }}
                      >
                        {l.leaveType === "Slot_Block"
                          ? `Block: ${l.blockedSlots?.join(", ")}`
                          : l.type || "Full Day"}
                      </span>
                    </td>
                    <td>{l.reason}</td>
                    <td className="doc_avail_m_text_right">
                      <span
                        className={`doc_avail_m_status_pill doc_avail_m_${(l.status || "Pending").toLowerCase()}`}
                      >
                        {l.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="doc_avail_m_empty_msg">
                    No tracked logs recorded in registry indexes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FORM MODAL DRAWER --- */}
      {showLeaveForm && (
        <div className="doc_avail_m_modal_overlay">
          <div
            className="doc_avail_m_modal_card_compact"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <div
              className="doc_avail_m_modal_header"
              style={{
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "12px",
                marginBottom: "15px",
              }}
            >
              <h3 className="doc_avail_m_title_small" style={{ margin: 0 }}>
                Record Clinical Absence
              </h3>
              {conflictsCount > 0 && (
                <div
                  className="doc_avail_m_conflict_banner"
                  style={{
                    background: "#ffe4e6",
                    color: "#991b1b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    marginTop: "10px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                  }}
                >
                  <FiAlertCircle color="#ef4444" />{" "}
                  <span>
                    {conflictsCount} Bookings Affected (Auto-Redistribution
                    Cascades Triggered)
                  </span>
                </div>
              )}
            </div>
            <form onSubmit={handleApplyLeave}>
              <div className="doc_avail_m_modal_form_row">
                <div className="doc_avail_m_input_stack">
                  <label>Start Window Date</label>
                  <input
                    type="date"
                    min={todayDate}
                    value={newLeave.startDate}
                    onChange={(e) =>
                      setNewLeave({
                        ...newLeave,
                        startDate: e.target.value,
                        endDate:
                          e.target.value < newLeave.endDate
                            ? newLeave.endDate
                            : e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="doc_avail_m_input_stack">
                  <label>End Window Date</label>
                  <input
                    type="date"
                    min={newLeave.startDate}
                    value={newLeave.endDate}
                    onChange={(e) =>
                      setNewLeave({ ...newLeave, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div
                className="doc_avail_m_modal_form_row"
                style={{ marginTop: "15px" }}
              >
                <div className="doc_avail_m_input_stack">
                  <label>Leave Category</label>
                  <select
                    value={newLeave.type}
                    onChange={(e) =>
                      setNewLeave({ ...newLeave, type: e.target.value })
                    }
                  >
                    {LEAVE_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="doc_avail_m_input_stack">
                  <label>Priority Tier</label>
                  <select
                    value={newLeave.priority}
                    onChange={(e) =>
                      setNewLeave({ ...newLeave, priority: e.target.value })
                    }
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div
                className="doc_avail_m_input_stack"
                style={{ marginTop: "15px" }}
              >
                <label>Justification Rationale Abstract</label>
                <textarea
                  placeholder="Provide clinical notes..."
                  value={newLeave.reason}
                  onChange={(e) =>
                    setNewLeave({ ...newLeave, reason: e.target.value })
                  }
                  required
                  style={{ minHeight: "80px", padding: "10px" }}
                />
              </div>
              <div
                className="doc_avail_m_modal_footer_actions"
                style={{
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "15px",
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  className="doc_avail_m_btn_cancel"
                  onClick={() => setShowLeaveForm(false)}
                >
                  Discard
                </button>
                <button type="submit" className="doc_avail_m_btn_primary">
                  Confirm & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 🟢 NEW: ADVANCED HISTORY OVERLAY MODAL (TRIGGERED ONLY VIA VIEW ALL CLICK EVENTS) --- */}
      {showHistoryModal && (
        <div
          className="doc_avail_m_modal_overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            className="doc_avail_m_modal_card_compact"
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "850px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "15px",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  margin: 0,
                  color: "#0f172a",
                }}
              >
                Advanced Clinical{" "}
                <span style={{ color: "#007acc" }}>Absence Registries</span>
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <FiX size={24} /> {/* 🟢 Fixed modal close reference tag */}
              </button>
            </div>

            {/* DYNAMIC FILTER METRICS PANEL CONTROL BAR */}
            <div
              style={{
                background: "#f8fafc",
                padding: "15px 20px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div className="doc_avail_m_input_stack" style={{ margin: 0 }}>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "#475569",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Roster Workflow Filter
                </label>
                <select
                  value={modalFilterStatus}
                  onChange={(e) => setModalFilterStatus(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    fontSize: "0.85rem",
                    width: "100%",
                    borderRadius: "4px",
                  }}
                >
                  <option value="all">All Logs Slate</option>
                  <option value="Pending">Pending Audit</option>
                  <option value="Approved">Approved Blocks</option>
                  <option value="Rejected">Rejected Closures</option>
                </select>
              </div>

              <div className="doc_avail_m_input_stack" style={{ margin: 0 }}>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "#475569",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  From Range Date
                </label>
                <input
                  type="date"
                  value={modalFilterStartDate}
                  onChange={(e) => setModalFilterStartDate(e.target.value)}
                  style={{
                    padding: "5px 8px",
                    fontSize: "0.85rem",
                    width: "100%",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div className="doc_avail_m_input_stack" style={{ margin: 0 }}>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "#475569",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  To Range Date
                </label>
                <input
                  type="date"
                  value={modalFilterEndDate}
                  onChange={(e) => setModalFilterEndDate(e.target.value)}
                  style={{
                    padding: "5px 8px",
                    fontSize: "0.85rem",
                    width: "100%",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setModalFilterStatus("all");
                    setModalFilterStartDate("");
                    setModalFilterEndDate("");
                  }}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    width: "100%",
                    padding: "7px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    color: "#475569",
                  }}
                >
                  Reset Filter Inputs
                </button>
              </div>
            </div>

            {/* FULL LEDGER EXTENDED RESULT TABLE FRAME */}
            <div style={{ overflowX: "auto" }}>
              <table className="doc_avail_m_table" style={{ width: "100%" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={{ padding: "10px" }}>Timeline Window</th>
                    <th style={{ padding: "10px" }}>Configuration Type</th>
                    <th style={{ padding: "10px" }}>Justification Context</th>
                    <th
                      style={{ padding: "10px" }}
                      className="doc_avail_m_text_right"
                    >
                      Audit Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModalLeaveHistory.length > 0 ? (
                    filteredModalLeaveHistory.map((l) => (
                      <tr
                        key={l._id}
                        style={{ borderBottom: "1px solid #cbd5e1" }}
                      >
                        <td style={{ padding: "12px 10px" }}>
                          <b>
                            {l.startDate}{" "}
                            {l.endDate !== l.startDate ? `to ${l.endDate}` : ""}
                          </b>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span
                            className="doc_avail_m_type_pill"
                            style={{
                              textTransform: "capitalize",
                              fontSize: "0.75rem",
                            }}
                          >
                            {l.leaveType === "Slot_Block"
                              ? `Block: ${l.blockedSlots?.join(", ")}`
                              : l.type || "Full Day"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 10px",
                            fontSize: "0.85rem",
                            color: "#334155",
                            maxWidth: "250px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={l.reason}
                        >
                          {l.reason}
                        </td>
                        <td
                          style={{ padding: "12px 10px" }}
                          className="doc_avail_m_text_right"
                        >
                          <span
                            className={`doc_avail_m_status_pill doc_avail_m_${(l.status || "Pending").toLowerCase()}`}
                          >
                            {l.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="doc_avail_m_empty_msg"
                        style={{
                          padding: "30px",
                          textAlign: "center",
                          color: "#64748b",
                        }}
                      >
                        <FiFilter size={24} style={{ marginBottom: "6px" }} />
                        <p style={{ margin: 0 }}>
                          No historical rows match your active date/status
                          search keys.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer Controls */}
            <div
              style={{
                textAlign: "right",
                marginTop: "25px",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "15px",
              }}
            >
              <button
                type="button"
                className="doc_avail_m_btn_cancel"
                onClick={() => setShowHistoryModal(false)}
                style={{ padding: "8px 20px" }}
              >
                Close Registry Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
