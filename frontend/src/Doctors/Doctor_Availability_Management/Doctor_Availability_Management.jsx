import React, { useEffect, useState, useMemo } from "react";
import { 
  FiCalendar, FiClock, FiChevronLeft, FiChevronRight, 
  FiPlus, FiXCircle, FiCheckCircle
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axios";
import "./Doctor_Availability_Management.css";

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
  const { user } = useAuth()
  const today = new Date();

  // Data states
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Calendar states
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(todayDate);

  // Leave states
  const [filterDate, setFilterDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  const [leaveFilter, setLeaveFilter] = useState("upcoming");
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [newLeave, setNewLeave] = useState({ 
    startDate: todayDate, 
    endDate: todayDate, 
    type: "casual", 
    reason: "" 
  });
  const [submittingLeave, setSubmittingLeave] = useState(false)

  // Availability states
  const [doctorStatus, setDoctorStatus] = useState("available");
  const [schedule, setSchedule] = useState({});
  const [savingSlots, setSavingSlots] = useState(false)

  // Fetch doctor profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      try {
        setLoading(true)
        const res = await axiosInstance.get(`/doctors/user/${user._id}`)
        const doctor = res.data.data
        setDoctorProfile(doctor)
        setDoctorStatus(doctor.isAvailable ? 'available' : 'on-call')
      } catch (err) {
        console.error('Failed to load doctor profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  // Load slots for selected date
  useEffect(() => {
    if (!doctorProfile) return
    const storageKey = `sched_${doctorProfile._id}_${selectedDate}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setSchedule(JSON.parse(saved))
    } else {
      const initial = {}
      DEFAULT_SLOTS.forEach((t) => (initial[t] = "available"))
      setSchedule(initial)
    }
  }, [selectedDate, doctorProfile])

  // Load leave history
  useEffect(() => {
    const fetchLeaves = async () => {
      if (!doctorProfile) return
      try {
        // For now use localStorage for leaves since we don't have a leave model
        const storageKey = `leaves_${doctorProfile._id}`
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const allLeaves = JSON.parse(saved)
          const [fYear, fMonth] = filterDate.split('-')
          const filtered = allLeaves.filter(l => {
            const matches = l.startDate.startsWith(`${fYear}-${fMonth}`)
            if (leaveFilter === 'upcoming') return matches && l.status === 'Pending'
            return matches && l.status === 'Approved'
          })
          setLeaveHistory(filtered)
        } else {
          setLeaveHistory([])
        }
      } catch (err) {
        console.error('Failed to load leave history')
      }
    }
    fetchLeaves()
  }, [doctorProfile, leaveFilter, filterDate])

  // Toggle slot status
  const toggleSlotStatus = (time) => {
    const nextStatus = schedule[time] === "available" ? "unavailable" : "available"
    const updatedSchedule = { ...schedule, [time]: nextStatus }
    setSchedule(updatedSchedule)
    if (doctorProfile) {
      localStorage.setItem(
        `sched_${doctorProfile._id}_${selectedDate}`, 
        JSON.stringify(updatedSchedule)
      )
    }
  }

  // Save doctor status
  const handleStatusChange = async (status) => {
    setDoctorStatus(status)
    try {
      await axiosInstance.put(`/doctors/${doctorProfile._id}`, {
        isAvailable: status === 'available'
      })
    } catch (err) {
      console.error('Failed to update availability')
    }
  }

  // Calendar navigation
  const changeMonth = (step) => {
    let m = currentMonth + step
    let y = currentYear
    if (m < 0) { m = 11; y-- } else if (m > 11) { m = 0; y++ }
    setCurrentMonth(m)
    setCurrentYear(y)
  }

  // Apply leave
  const handleApplyLeave = async (e) => {
    e.preventDefault()
    try {
      setSubmittingLeave(true)
      const durationText = newLeave.startDate === newLeave.endDate 
        ? newLeave.startDate 
        : `${newLeave.startDate} to ${newLeave.endDate}`

      const entry = {
        id: Date.now(),
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        duration: durationText,
        type: LEAVE_TYPES.find(t => t.id === newLeave.type)?.label || newLeave.type,
        status: "Pending",
        reason: newLeave.reason
      }

      // Save to localStorage
      const storageKey = `leaves_${doctorProfile._id}`
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const updated = [entry, ...existing]
      localStorage.setItem(storageKey, JSON.stringify(updated))

      setLeaveHistory(prev => [entry, ...prev])
      setShowLeaveForm(false)
      setNewLeave({ startDate: todayDate, endDate: todayDate, type: "casual", reason: "" })
      alert('Leave request submitted!')
    } catch (err) {
      alert('Failed to submit leave request')
    } finally {
      setSubmittingLeave(false)
    }
  }

  // Calendar calculations
  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading schedule...</p>
    </div>
  )

  return (
    <div className="doc_avail_m_root doc_avail_m_page_fade_in">
      
      {/* Header */}
      <div className="doc_avail_m_section_header">
        <div className="doc_avail_m_branding">
          <h1 className="doc_avail_m_title_elite">
            Schedule <span className="doc_avail_m_highlight">Console</span>
          </h1>
          <p className="doc_avail_m_subtitle">
            Managing clinical availability for <b>{doctorProfile?.name}</b>
          </p>
        </div>
        <button className="doc_avail_m_btn_primary" onClick={() => setShowLeaveForm(true)}>
          <FiPlus /> Apply for Leave
        </button>
      </div>

      <div className="doc_avail_m_row_top">
        {/* Calendar */}
        <div className="doc_avail_m_card_refined doc_avail_m_cal_module">
          <span className="doc_avail_m_label_micro">Clinical Calendar</span>
          <div className="doc_avail_m_cal_nav_header">
            <button className="doc_avail_m_nav_btn_lite" onClick={() => changeMonth(-1)}>
              <FiChevronLeft />
            </button>
            <h3 className="doc_avail_m_cal_title">
              {monthName} <span>{currentYear}</span>
            </h3>
            <button className="doc_avail_m_nav_btn_lite" onClick={() => changeMonth(1)}>
              <FiChevronRight />
            </button>
          </div>
          <div className="doc_avail_m_cal_days_header">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="doc_avail_m_cal_date_grid">
            {Array(firstDayOfMonth).fill(null).map((_, i) => (
              <div key={i} className="doc_avail_m_day_blank"></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1
              const fDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
              return (
                <div 
                  key={d} 
                  className={`doc_avail_m_day_node 
                    ${selectedDate === fDate ? "doc_avail_m_active" : ""} 
                    ${fDate < todayDate ? "doc_avail_m_past" : ""}`}
                  onClick={() => fDate >= todayDate && setSelectedDate(fDate)}
                >
                  {d}
                </div>
              )
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="doc_avail_m_card_refined doc_avail_m_slots_module">
          <div className="doc_avail_m_slots_header_flex">
            <span className="doc_avail_m_label_micro">
              Session Logistics: {selectedDate}
            </span>
          </div>
          
          <div className="doc_avail_m_slot_action_bar">
            <label className="doc_avail_m_label_small">Day Status:</label>
            <div className="doc_avail_m_segmented_control">
              {["available", "on-call", "emergency"].map(s => (
                <button 
                  key={s} 
                  className={doctorStatus === s ? "doc_avail_m_active" : ""} 
                  onClick={() => handleStatusChange(s)}
                >
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
                  <div className="doc_avail_m_slot_icon_ring">
                    <FiClock size={14}/>
                  </div>
                  <div className="doc_avail_m_slot_meta">
                    <span className="doc_avail_m_s_time">{t}</span>
                    <span className="doc_avail_m_s_label">
                      {(schedule[t] || "available").toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="doc_avail_m_slot_check_indicator">
                  {schedule[t] === "unavailable" 
                    ? <FiXCircle size={14} color="#ef4444" /> 
                    : <FiCheckCircle size={14} />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Registry */}
      <div className="doc_avail_m_row_bottom">
        <div className="doc_avail_m_card_refined doc_avail_m_history_card">
          <div className="doc_avail_m_history_header_flex">
            <div className="doc_avail_m_branding_sm">
              <span className="doc_avail_m_label_micro">Professional Leave Registry</span>
            </div>
            <div className="doc_avail_m_registry_controls">
              <div className="doc_avail_m_swap_filter">
                <button 
                  className={leaveFilter === "upcoming" ? "active" : ""} 
                  onClick={() => setLeaveFilter("upcoming")}
                >
                  Upcoming
                </button>
                <button 
                  className={leaveFilter === "completed" ? "active" : ""} 
                  onClick={() => setLeaveFilter("completed")}
                >
                  Completed
                </button>
              </div>
              <input 
                type="month" 
                className="doc_avail_m_month_picker"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
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
                        <div className="doc_avail_m_cal_icon_avatar">
                          <FiCalendar size={18}/>
                        </div>
                        <div className="doc_avail_m_duration_stack">
                          <b className="doc_avail_m_duration_text">{l.duration}</b>
                          <span className="doc_avail_m_id_span">REF: #LR-{l.id}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="doc_avail_m_type_pill">{l.type}</span></td>
                    <td>
                      <div className="doc_avail_m_reason_container">
                        <p className="doc_avail_m_reason_text">{l.reason}</p>
                      </div>
                    </td>
                    <td className="doc_avail_m_text_right">
                      <span className={`doc_avail_m_status_pill doc_avail_m_${l.status.toLowerCase()}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="doc_avail_m_empty_table">
                      No {leaveFilter} records found for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Leave Modal */}
      {showLeaveForm && (
        <div className="doc_avail_m_modal_overlay">
          <div className="doc_avail_m_modal_card_compact">
            <div className="doc_avail_m_modal_header_elite">
              <div>
                <h3 className="doc_avail_m_title_small">
                  Request <span className="doc_avail_m_highlight">Absence</span>
                </h3>
                <p className="doc_avail_m_subtitle_micro">Specify duration and clinical reason</p>
              </div>
              <button className="doc_avail_m_close_modal_btn" onClick={() => setShowLeaveForm(false)}>
                <FiXCircle />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="doc_avail_m_leave_form_body">
              <div className="doc_avail_m_modal_form_row">
                <div className="doc_avail_m_modal_field">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={newLeave.startDate} 
                    min={todayDate}
                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className="doc_avail_m_modal_field">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={newLeave.endDate} 
                    min={newLeave.startDate} 
                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="doc_avail_m_modal_field">
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
              <div className="doc_avail_m_modal_field">
                <label>Clinical Justification</label>
                <textarea 
                  placeholder="Reason for absence..." 
                  value={newLeave.reason} 
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})} 
                  required 
                />
              </div>
              <div className="doc_avail_m_modal_footer_actions">
                <button 
                  type="button" 
                  className="doc_avail_m_btn_secondary" 
                  onClick={() => setShowLeaveForm(false)}
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="doc_avail_m_btn_primary"
                  disabled={submittingLeave}
                >
                  {submittingLeave ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}