import React, { useEffect, useState } from "react";
import { 
  FiCalendar, FiClock, FiChevronLeft, FiChevronRight, 
  FiPlus, FiXCircle, FiUser, FiCheckCircle
} from "react-icons/fi";
import "./Doctor_Availability.css";

// --- CONFIGURATION CONSTANTS ---
const DEFAULT_SLOTS = [
  "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:30 - 13:30", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"
];

const LEAVE_TYPES = [
  { id: "sick", label: "Medical/Sick", color: "#ef4444" },
  { id: "emergency", label: "Emergency", color: "#f59e0b" },
  { id: "casual", label: "Personal", color: "#007acc" },
  { id: "conference", label: "Conference", color: "#10b981" }
];

const todayDate = new Date().toISOString().split("T")[0];

export default function ScheduleAvailability() {
  const today = new Date();
  
  // --- STATE MANAGEMENT ---
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [doctorStatus, setDoctorStatus] = useState("available");
  const [schedule, setSchedule] = useState({});
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [newLeave, setNewLeave] = useState({ date: todayDate, type: "sick", reason: "" });
  const [leaveHistory, setLeaveHistory] = useState([
    { id: 101, date: "2026-03-20", type: "Emergency", status: "Approved", reason: "Family Emergency", approvedBy: "Admin HQ" },
    { id: 102, date: "2026-03-28", type: "Medical", status: "Approved", reason: "Viral Fever", approvedBy: "Medical Supt." },
    { id: 103, date: "2026-04-10", type: "Conference", status: "Pending", reason: "Global Health Summit", approvedBy: "System Pending" }
  ]);

  // --- CALENDAR ENGINE ---
  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // --- EFFECTS ---
  useEffect(() => {
    const saved = localStorage.getItem(`schedule_${selectedDate}`);
    if (saved) {
      setSchedule(JSON.parse(saved));
    } else {
      const initial = {};
      DEFAULT_SLOTS.forEach((t) => (initial[t] = "available"));
      setSchedule(initial);
    }
  }, [selectedDate]);

  // --- HANDLERS ---
  const toggleSlotStatus = (time) => {
    const nextStatus = { available: "unavailable", unavailable: "booked", booked: "available" };
    setSchedule(prev => ({ ...prev, [time]: nextStatus[prev[time]] }));
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
    const entry = {
      id: Date.now(),
      date: newLeave.date,
      type: LEAVE_TYPES.find(t => t.id === newLeave.type).label,
      status: "Pending",
      reason: newLeave.reason,
      approvedBy: "System Pending"
    };
    setLeaveHistory([entry, ...leaveHistory]);
    setShowLeaveForm(false);
  };

  return (
    <div className="med_schedule_root med_page_fade_in">
      
      {/* 1. SECTION HEADER */}
      <div className="med_section_header">
        <div className="med_branding">
          <h1 className="med_title_elite">Schedule <span className="highlight">Console</span></h1>
          <p className="med_subtitle">Clinical availability and administrative leave tracking</p>
        </div>
        <div className="med_action_group">
          <button className="med_btn_primary" onClick={() => setShowLeaveForm(true)}>
            <FiPlus /> Apply for Leave
          </button>
        </div>
      </div>

      {/* 2. CALENDAR & SLOTS GRID */}
      <div className="med_schedule_row_top">
        
        {/* CALENDAR MODULE */}
        <div className="med_card_refined med_cal_module">
          <span className="med_label_micro">Clinical Calendar</span>
          <div className="cal_nav_header">
            <button className="nav_btn_lite" onClick={() => changeMonth(-1)}><FiChevronLeft /></button>
            <h3 className="cal_title">{monthName} <span>{currentYear}</span></h3>
            <button className="nav_btn_lite" onClick={() => changeMonth(1)}><FiChevronRight /></button>
          </div>
          <div className="cal_days_header">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="cal_date_grid">
            {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={i} className="day_blank"></div>)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const fDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              return (
                <div 
                  key={d} 
                  className={`day_node ${selectedDate === fDate ? "active" : ""} ${fDate < todayDate ? "past" : ""}`}
                  onClick={() => fDate >= todayDate && setSelectedDate(fDate)}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>

        {/* TIME SLOTS MODULE */}
        <div className="med_card_refined med_slots_module">
          <div className="slots_header_flex">
             <span className="med_label_micro">Session Logistics: {selectedDate}</span>
             <div className="status_pill_active"><span className="ping_dot"></span> Cloud Sync</div>
          </div>
          
          <div className="slot_action_bar">
             <label className="med_label_small">Mark Day As:</label>
             <div className="med_segmented_control">
                {["available", "on-call", "emergency"].map(s => (
                  <button key={s} className={doctorStatus === s ? "active" : ""} onClick={() => setDoctorStatus(s)}>
                    {s}
                  </button>
                ))}
             </div>
          </div>

          <div className="slot_grid_layout">
             {DEFAULT_SLOTS.map(t => (
               <div key={t} className={`med_slot_card_elite ${schedule[t] || "available"}`} onClick={() => toggleSlotStatus(t)}>
                  <div className="slot_info_group">
                     <div className="slot_icon_ring"><FiClock size={14}/></div>
                     <div className="slot_meta">
                        <span className="s_time">{t}</span>
                        <span className="s_label">{(schedule[t] || "available").toUpperCase()}</span>
                     </div>
                  </div>
                  <div className="slot_check_indicator"><FiCheckCircle size={14} /></div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* 3. LEAVE REGISTRY TABLE */}
      <div className="med_schedule_row_bottom">
        <div className="med_card_refined">
          <div className="history_header_flex">
            <span className="med_label_micro">Professional Leave Registry</span>
            <div className="med_stats_pills">
               <div className="stat_pill">Used: <b>04</b></div>
               <div className="stat_pill">Pending: <b>{leaveHistory.filter(l => l.status === "Pending").length}</b></div>
               <div className="stat_pill balance">Available: <b>08</b></div>
            </div>
          </div>

          <div className="med_table_container">
            <table className="med_table">
              <thead>
                <tr>
                  <th>Request Date</th>
                  <th>Leave Classification</th>
                  <th>Clinical Justification</th>
                  <th>Approved By</th>
                  <th className="text_right">Filing Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveHistory.map(l => (
                  <tr key={l.id}>
                    <td>
                       <div className="med_cell_user">
                          <div className="cal_icon_avatar"><FiCalendar size={18}/></div>
                          <div><b>{l.date}</b><span>ID: #LR-{l.id}</span></div>
                       </div>
                    </td>
                    <td><span className="med_type_pill">{l.type}</span></td>
                    <td className="med_text_bold_muted">{l.reason}</td>
                    <td>
                       <div className="med_cell_auth">
                          <FiUser size={14} style={{marginRight: '8px'}} />
                          <span>{l.approvedBy}</span>
                       </div>
                    </td>
                    <td className="text_right">
                       <span className={`med_status_pill ${l.status.toLowerCase()}`}>
                          {l.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. LEAVE REQUEST MODAL */}
      {showLeaveForm && (
        <div className="med_modal_overlay">
          <div className="med_modal_card_compact">
            <div className="modal_header_elite">
              <div>
                <h3 className="med_title_small">Request <span className="highlight">Absence</span></h3>
                <p className="med_subtitle_micro">Submit clinical leave for administrative review</p>
              </div>
              <button className="close_modal_btn" onClick={() => setShowLeaveForm(false)}><FiXCircle /></button>
            </div>

            <form onSubmit={handleApplyLeave} className="leave_form_body">
              <div className="modal_form_row">
                <div className="modal_field">
                  <label>Effective Date</label>
                  <input 
                    type="date" 
                    value={newLeave.date} 
                    onChange={(e) => setNewLeave({...newLeave, date: e.target.value})} 
                    required 
                  />
                </div>
                <div className="modal_field">
                  <label>Leave Classification</label>
                  <select 
                    value={newLeave.type} 
                    onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}
                  >
                    {LEAVE_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal_field">
                <label>Clinical Justification / Reason</label>
                <textarea 
                  placeholder="e.g. Attending Surgical Oncology Seminar..." 
                  value={newLeave.reason} 
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})} 
                  required 
                />
              </div>

              <div className="modal_footer_actions">
                <button type="button" className="med_btn_secondary" onClick={() => setShowLeaveForm(false)}>Discard</button>
                <button type="submit" className="med_btn_primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}