import React, { useEffect, useState, useMemo } from "react";
import { 
  FiCalendar, FiClock, FiChevronLeft, FiChevronRight, 
  FiPlus, FiXCircle, FiCheckCircle
} from "react-icons/fi";

import doctorsData from "../../Assets/Data/doctor.json";
import "./Doctor_Availability.css";

const DEFAULT_SLOTS = [
  "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:30 - 13:30", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"
];

const LEAVE_TYPES = [
  { id: "sick", label: "Medical/Sick" },
  { id: "emergency", label: "Emergency" },
  { id: "casual", label: "Personal" },
  { id: "conference", label: "Conference" }
];

const todayDate = new Date().toISOString().split("T")[0];

export default function ScheduleAvailability() {
  const today = new Date();
  
  // 1. TARGET ID
  const targetId = "DOC-010"; 

  const currentDoc = useMemo(() => {
    return doctorsData.find(d => d.id === targetId) || doctorsData[0];
  }, [targetId]);

  // --- STATE MANAGEMENT ---
  // Calendar States
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(todayDate);
  
  // Registry States (Separate from Calendar)
  const [filterDate, setFilterDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  const [leaveFilter, setLeaveFilter] = useState("upcoming"); 
  const [leaveHistory, setLeaveHistory] = useState([]);

  // Availability States
  const [doctorStatus, setDoctorStatus] = useState("available");
  const [schedule, setSchedule] = useState({});
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [newLeave, setNewLeave] = useState({ startDate: todayDate, endDate: todayDate, type: "casual", reason: "" });

  // 2. LOAD LEAVE HISTORY (Filtered by Month Picker & Type)
  useEffect(() => {
    if (currentDoc && currentDoc.leaves) {
      const sourceData = currentDoc.leaves[leaveFilter] || [];
      const [fYear, fMonth] = filterDate.split('-');

      const mappedLeaves = sourceData
        .filter(l => {
          // Only show leaves that fall within the selected filter month/year
          return l.startDate.startsWith(`${fYear}-${fMonth}`);
        })
        .map((l, i) => ({
          id: `${currentDoc.id}-${leaveFilter}-${i}`,
          duration: l.startDate === l.endDate ? l.startDate : `${l.startDate} to ${l.endDate}`,
          type: l.reason.toLowerCase().includes("work") || l.reason.toLowerCase().includes("personal") ? "Personal" : "Medical",
          status: leaveFilter === "completed" ? "Approved" : "Pending",
          reason: l.reason
        }));
      
      setLeaveHistory(mappedLeaves);
    }
  }, [currentDoc, leaveFilter, filterDate]); // Only re-runs when Filter changes

  // 3. LOAD SLOTS PERSISTENCE
  useEffect(() => {
    const storageKey = `sched_${currentDoc.id}_${selectedDate}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setSchedule(JSON.parse(saved));
    } else {
      const initial = {};
      DEFAULT_SLOTS.forEach((t) => (initial[t] = "available"));
      setSchedule(initial);
    }
  }, [selectedDate, currentDoc.id]);

  // --- HANDLERS ---
  const toggleSlotStatus = (time) => {
    const nextStatus = schedule[time] === "available" ? "unavailable" : "available";
    const updatedSchedule = { ...schedule, [time]: nextStatus };
    setSchedule(updatedSchedule);
    localStorage.setItem(`sched_${currentDoc.id}_${selectedDate}`, JSON.stringify(updatedSchedule));
  };

  const changeMonth = (step) => {
    let m = currentMonth + step;
    let y = currentYear;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    const durationText = newLeave.startDate === newLeave.endDate 
      ? newLeave.startDate 
      : `${newLeave.startDate} to ${newLeave.endDate}`;

    const entry = {
      id: Date.now(),
      duration: durationText,
      type: LEAVE_TYPES.find(t => t.id === newLeave.type).label,
      status: "Pending",
      reason: newLeave.reason
    };
    setLeaveHistory([entry, ...leaveHistory]);
    setShowLeaveForm(false);
  };

  // Calendar Engine
  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <div className="doc_avail_m_root doc_avail_m_page_fade_in">
      
      {/* 1. HEADER */}
      <div className="doc_avail_m_section_header">
        <div className="doc_avail_m_branding">
          <h1 className="doc_avail_m_title_elite">Schedule <span className="doc_avail_m_highlight">Console</span></h1>
          <p className="doc_avail_m_subtitle">Managing clinical availability for <b>{currentDoc.name}</b></p>
        </div>
        <button className="doc_avail_m_btn_primary" onClick={() => setShowLeaveForm(true)}>
          <FiPlus /> Apply for Leave
        </button>
      </div>

      <div className="doc_avail_m_row_top">
        {/* CALENDAR MODULE */}
        <div className="doc_avail_m_card_refined doc_avail_m_cal_module">
          <span className="doc_avail_m_label_micro">Clinical Calendar</span>
          <div className="doc_avail_m_cal_nav_header">
            <button className="doc_avail_m_nav_btn_lite" onClick={() => changeMonth(-1)}><FiChevronLeft /></button>
            <h3 className="doc_avail_m_cal_title">{monthName} <span>{currentYear}</span></h3>
            <button className="doc_avail_m_nav_btn_lite" onClick={() => changeMonth(1)}><FiChevronRight /></button>
          </div>
          <div className="doc_avail_m_cal_days_header">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="doc_avail_m_cal_date_grid">
            {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={i} className="doc_avail_m_day_blank"></div>)}
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

        {/* TIME SLOTS MODULE */}
        <div className="doc_avail_m_card_refined doc_avail_m_slots_module">
          <div className="doc_avail_m_slots_header_flex">
             <span className="doc_avail_m_label_micro">Session Logistics: {selectedDate}</span>
          </div>
          
          <div className="doc_avail_m_slot_action_bar">
             <label className="doc_avail_m_label_small">Day Status:</label>
             <div className="doc_avail_m_segmented_control">
                {["available", "on-call", "emergency"].map(s => (
                  <button key={s} className={doctorStatus === s ? "doc_avail_m_active" : ""} onClick={() => setDoctorStatus(s)}>
                    {s}
                  </button>
                ))}
             </div>
          </div>

          <div className="doc_avail_m_slot_grid_layout">
             {DEFAULT_SLOTS.map(t => (
               <div 
                key={t} 
                className={`doc_avail_m_slot_card_elite doc_avail_m_${schedule[t] || "available"}`} 
                onClick={() => toggleSlotStatus(t)}
               >
                  <div className="doc_avail_m_slot_info_group">
                     <div className="doc_avail_m_slot_icon_ring"><FiClock size={14}/></div>
                     <div className="doc_avail_m_slot_meta">
                        <span className="doc_avail_m_s_time">{t}</span>
                        <span className="doc_avail_m_s_label">{(schedule[t] || "available").toUpperCase()}</span>
                     </div>
                  </div>
                  <div className="doc_avail_m_slot_check_indicator">
                    {schedule[t] === "unavailable" ? <FiXCircle size={14} color="#ef4444" /> : <FiCheckCircle size={14} />}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* LEAVE REGISTRY */}
      <div className="doc_avail_m_row_bottom">
        <div className="doc_avail_m_card_refined doc_avail_m_history_card">
          <div className="doc_avail_m_history_header_flex">
            <div className="doc_avail_m_branding_sm">
                <span className="doc_avail_m_label_micro">Professional Leave Registry</span>
            </div>

            <div className="doc_avail_m_registry_controls">
              <div className="doc_avail_m_swap_filter">
                <button className={leaveFilter === "upcoming" ? "active" : ""} onClick={() => setLeaveFilter("upcoming")}>Upcoming</button>
                <button className={leaveFilter === "completed" ? "active" : ""} onClick={() => setLeaveFilter("completed")}>Completed</button>
              </div>

              <div className="doc_avail_m_date_input_wrapper">
                <input 
                  type="month" 
                  className="doc_avail_m_month_picker"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="doc_avail_m_table_container">
            <table className="doc_avail_m_table">
              <thead>
                <tr>
                  <th>Timeframe / Duration</th>
                  <th>Classification</th>
                  <th>Clinical Justification</th>
                  <th className="doc_avail_m_text_right">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveHistory.length > 0 ? leaveHistory.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div className="doc_avail_m_cell_user">
                        <div className="doc_avail_m_cal_icon_avatar"><FiCalendar size={18}/></div>
                        <div className="doc_avail_m_duration_stack">
                          <b className="doc_avail_m_duration_text">{l.duration}</b>
                          <span className="doc_avail_m_id_span">REF: #LR-{l.id}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="doc_avail_m_type_pill">{l.type}</span></td>
                    <td><div className="doc_avail_m_reason_container"><p className="doc_avail_m_reason_text">{l.reason}</p></div></td>
                    <td className="doc_avail_m_text_right">
                      <span className={`doc_avail_m_status_pill doc_avail_m_${l.status.toLowerCase()}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="doc_avail_m_empty_table">No {leaveFilter} records found for this month.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL (Existing logic remains same) */}
      {showLeaveForm && (
        <div className="doc_avail_m_modal_overlay">
          <div className="doc_avail_m_modal_card_compact">
            <div className="doc_avail_m_modal_header_elite">
              <div>
                <h3 className="doc_avail_m_title_small">Request <span className="doc_avail_m_highlight">Absence</span></h3>
                <p className="doc_avail_m_subtitle_micro">Specify duration and clinical reason</p>
              </div>
              <button className="doc_avail_m_close_modal_btn" onClick={() => setShowLeaveForm(false)}><FiXCircle /></button>
            </div>
            <form onSubmit={handleApplyLeave} className="doc_avail_m_leave_form_body">
              <div className="doc_avail_m_modal_form_row">
                <div className="doc_avail_m_modal_field">
                  <label>Start Date</label>
                  <input type="date" value={newLeave.startDate} onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})} required />
                </div>
                <div className="doc_avail_m_modal_field">
                  <label>End Date</label>
                  <input type="date" value={newLeave.endDate} min={newLeave.startDate} onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})} required />
                </div>
              </div>
              <div className="doc_avail_m_modal_field">
                <label>Leave Classification</label>
                <select value={newLeave.type} onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}>
                  {LEAVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div className="doc_avail_m_modal_field">
                <label>Clinical Justification</label>
                <textarea placeholder="Reason for absence..." value={newLeave.reason} onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})} required />
              </div>
              <div className="doc_avail_m_modal_footer_actions">
                <button type="button" className="doc_avail_m_btn_secondary" onClick={() => setShowLeaveForm(false)}>Discard</button>
                <button type="submit" className="doc_avail_m_btn_primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}