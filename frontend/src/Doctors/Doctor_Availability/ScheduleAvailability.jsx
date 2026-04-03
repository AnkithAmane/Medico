import React, { useEffect, useState } from "react";
import "./ScheduleAvailability.css";
import data from "../../Assets/Data/doctorsData.json";

const DEFAULT_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:30 - 13:30",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

const AVAILABILITY_TYPES = {
  available: "Available",
  unavailable: "Unavailable",
  emergency: "Emergency Leave",
};

const STATUS_FLOW = Object.keys(AVAILABILITY_TYPES);
const todayDate = new Date().toISOString().split("T")[0];

const getNextStatus = (current) =>
  STATUS_FLOW[(STATUS_FLOW.indexOf(current) + 1) % STATUS_FLOW.length];

const getMonthDays = (year, month) =>
  Array.from(
    { length: new Date(year, month + 1, 0).getDate() },
    (_, i) => i + 1
  );

export default function ScheduleAvailability() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState("");
  const [doctorStatus, setDoctorStatus] = useState("available");
  const [schedule, setSchedule] = useState({});

  /* ✅ DOCTOR EMERGENCY LEAVES */
  const [doctorEmergencyLeaves, setDoctorEmergencyLeaves] = useState([]);

  const days = getMonthDays(currentYear, currentMonth);

  /* SLOT STATE — UNCHANGED */
  useEffect(() => {
    if (!selectedDate) return;

    const saved = localStorage.getItem(`schedule_${selectedDate}`);
    if (saved) {
      setSchedule(JSON.parse(saved));
    } else {
      const initial = {};
      DEFAULT_SLOTS.forEach((t) => (initial[t] = "available"));
      setSchedule(initial);
    }
  }, [selectedDate]);

  function toggleSlot(time) {
    setSchedule((prev) => ({
      ...prev,
      [time]: getNextStatus(prev[time]),
    }));
  }

  function changeMonth(step) {
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
    setSelectedDate("");
  }

  function handleDoctorStatusChange(status) {
    setDoctorStatus(status);

    if (
      selectedDate &&
      (status === "emergency" || status === "unavailable")
    ) {
      setDoctorEmergencyLeaves((prev) =>
        prev.includes(selectedDate) ? prev : [...prev, selectedDate]
      );
    }
  }

  return (
    <div className="sched">
      {/* ================= TOP SECTION ================= */}
      <div className="grid-top">
        {/* CALENDAR — 40% */}
        <div className="card">
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)}>◀</button>
            <h4>
              {new Date(currentYear, currentMonth).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <button onClick={() => changeMonth(1)}>▶</button>
          </div>

          <div className="calendar-grid">
            {days.map((day) => {
              const fullDate = `${currentYear}-${String(
                currentMonth + 1
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isPast = fullDate < todayDate;

              return (
                <div
                  key={day}
                  className={`calendar-day ${
                    selectedDate === fullDate ? "active" : ""
                  } ${isPast ? "disabled" : ""}`}
                  onClick={() => !isPast && setSelectedDate(fullDate)}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* TIME SLOTS — 60% */}
        <div className="card slots-panel">
          <h4>Doctor Availability</h4>

          <select
            className="status-select"
            value={doctorStatus}
            onChange={(e) => handleDoctorStatusChange(e.target.value)}
          >
            {Object.entries(AVAILABILITY_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {!selectedDate ? (
            <p className="hint-text">Select a date to view time slots</p>
          ) : doctorStatus !== "available" ? (
            <p className="doctor-status-text">
              Doctor is {AVAILABILITY_TYPES[doctorStatus]}
            </p>
          ) : (
            <div className="slots-grid">
              {DEFAULT_SLOTS.map((time) => (
                <div
                  key={time}
                  className={`slot ${schedule[time]}`}
                  onClick={() => toggleSlot(time)}
                >
                  <div className="slot-time">{time}</div>
                  <span>{AVAILABILITY_TYPES[schedule[time]]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= BOTTOM SECTION ================= */}
      <div className="grid-bottom">
        {/* ✅ DOCTOR EMERGENCY LEAVES */}
        <div className="card">
          <h4>Emergency Leaves</h4>

          {doctorEmergencyLeaves.length === 0 ? (
            <p>No emergency leaves for doctor</p>
          ) : (
            <ul className="info-list">
              {doctorEmergencyLeaves.map((date) => (
                <li key={date}>
                  <strong>{date}</strong>
                  <br />
                  <span>
                    Dr. {data.doctorDetails.firstName}{" "}
                    {data.doctorDetails.lastName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* UPCOMING EVENTS (UNCHANGED PLACEHOLDER LOGIC) */}
        <div className="card">
          <h4>Upcoming Events</h4>
          <p>No upcoming events</p>
        </div>
      </div>
    </div>
  );
}
