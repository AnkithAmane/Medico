import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  X,
  Calendar,
  Clock,
  Search,
  ChevronRight,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Filter,
  ShieldCheck,
  UserPlus,
  Info,
} from "lucide-react";
import "./Appointment_Form.css";

export default function AppointmentForm({
  isOpen,
  onClose,
  existingData,
  isRescheduleMode,
}) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData")) || {};
  // Stepper: 1 Discovery/Slots, 2 Review
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");

  const [formData, setFormData] = useState({
    doctor: null,
    date: new Date().toLocaleDateString("en-CA"),
    time: "",
    notes: "",
  });

  // 1. Fetch Registry & Recent Doctors
  // 1. Fetch Registry or Pre-load Reschedule Context
  useEffect(() => {
    if (isOpen) {
      const init = async () => {
        try {
          const token = localStorage.getItem("token");

          // FETCH ALL AVAILABLE DOCTORS
          const docRes = await axios.get(
            "http://localhost:5000/api/doctors/list",
          );
          const availableDocs = docRes.data.filter(
            (d) => d.availability === "Available",
          );
          setDoctors(availableDocs);

          if (isRescheduleMode && existingData) {
            // Find the specific doctor object matching the appointment name
            const targetDoc = availableDocs.find(
              (d) => d.name === existingData.doctorName,
            );
            if (targetDoc) {
              setFormData({
                doctor: targetDoc,
                date: new Date(existingData.date).toLocaleDateString("en-CA"),
                time: "", // Force user to pick a new time slot
                notes: existingData.notes || "",
              });
            }
          } else {
            // Standard Flow: Get unique last 3 doctors from user's history
            const historyRes = await axios.get(
              `http://localhost:5000/api/appointments/list/${user._id}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            const lastUsedNames = [
              ...new Set(historyRes.data.map((a) => a.doctorName)),
            ].slice(0, 3);
            const historyDocs = lastUsedNames
              .map((name) => availableDocs.find((d) => d.name === name))
              .filter(Boolean);
            setRecentDoctors(historyDocs);
          }
        } catch (err) {
          console.error("Clinical Registry Sync Error:", err);
        }
      };
      init();
    }
  }, [isOpen, isRescheduleMode, existingData, user._id]);

  // 2. Fetch Booked Slots for the selected doctor/date
  useEffect(() => {
    if (formData.doctor && formData.date) {
      axios
        .get(
          `http://localhost:5000/api/appointments/check?doctor=${encodeURIComponent(formData.doctor.name)}&date=${formData.date}`,
        )
        .then((res) => setBookedSlots(res.data))
        .catch((err) => console.error("Slot Sync Error:", err));
    }
  }, [formData.doctor, formData.date]);

  // 3. Rectified Time Logic (Today vs Future)
  // 3. Rectified Time Logic (Today vs Future - Standardized Matcher)
  const slots = useMemo(() => {
    if (!formData.doctor) return [];
    const all = [];
    const start = formData.doctor.shiftStart || "10:00";
    const end = formData.doctor.shiftEnd || "20:30";

    // 1. Parse operational boundaries safely
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    let curr = new Date();
    curr.setHours(startH, startM, 0, 0);

    const stop = new Date();
    stop.setHours(endH, endM, 0, 0);

    // 2. Capture accurate current timestamp parameters right now
    const now = new Date();
    const localToday = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const isToday = formData.date === localToday;

    while (curr < stop) {
      // Generate clean target standard string structure
      let tStr = curr.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Crucial: Strip out any unwanted leading zeros or weird OS-specific spaces
      // Converts "05:30 PM" -> "5:30 PM" to precisely match your DB formatting requirements
      tStr = tStr.replace(/^0/, "").replace(/\s+/g, " ");

      let isPast = false;
      if (isToday) {
        // Direct object mathematical comparison is safe since dates match perfectly
        isPast = curr.getTime() < now.getTime();
      }

      // Check against normalized string lookups
      const isBooked = bookedSlots.some((slot) => {
        const cleanSlot = slot.replace(/^0/, "").replace(/\s+/g, " ").trim();
        return cleanSlot === tStr;
      });

      all.push({
        time: tStr,
        isBooked: isBooked,
        isPast: isPast,
      });

      // Advance by 30-minute blocks
      curr.setMinutes(curr.getMinutes() + 30);
    }
    return all;
  }, [formData.doctor, formData.date, bookedSlots]);

  const departments = useMemo(
    () => ["All Departments", ...new Set(doctors.map((d) => d.department))],
    [doctors],
  );

  // 4. Booking Submission
  // 4. Booking / Rescheduling Submission
  const handleBooking = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (isRescheduleMode && existingData) {
        // RESCHEDULE PUT TRANSACTION PIPELINE
        await axios.put(
          `http://localhost:5000/api/appointments/reschedule/${existingData._id}`,
          {
            doctorName: formData.doctor.name,
            date: formData.date,
            time: formData.time,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        alert("Appointment rescheduled successfully!");
      } else {
        // STANDARD FRESH BOOKING POST PIPELINE
        await axios.post(
          "http://localhost:5000/api/appointments/book",
          {
            patientId: user._id,
            patientName: user.name,
            doctorName: formData.doctor.name,
            department: formData.doctor.department,
            date: formData.date,
            time: formData.time,
            notes: formData.notes,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      window.dispatchEvent(new Event("appointment_booked"));
      onClose();
      setStep(1); // Reset step tracking
      navigate("/patient/patient_bookings");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Slot was just taken or operation failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="med_apt_overlay">
      <div
        className={`med_apt_container ${step === 2 ? "confirm_mode" : ""} ${formData.doctor ? "pane_open" : ""} ${isRescheduleMode ? "reschedule_locked_layout" : ""}`}
      >
        {step === 1 && (
          <div className="med_apt_step_discovery">
            {/* TOP HEADER CONTROLS BAR */}
            <div className="recent_header_bar">
              <div className="recent_group">
                <label>
                  {isRescheduleMode
                    ? "Reschedule Lock Active"
                    : "Recent Specialists"}
                </label>
                {!isRescheduleMode && (
                  <div className="recent_docs_list">
                    {recentDoctors.map((d) => (
                      <div
                        key={d._id}
                        className={`recent_doc_pill ${formData.doctor?._id === d._id ? "active" : ""}`}
                        onClick={() =>
                          setFormData({ ...formData, doctor: d, time: "" })
                        }
                      >
                        <div className="pill_avatar">{d.name.charAt(4)}</div>
                        <span>{d.name.split(" ").pop()}</span>
                      </div>
                    ))}
                  </div>
                )}
                {isRescheduleMode && (
                  <span className="reschedule_notice_badge">
                    <Info size={14} /> Modifying session coordinates for Dr.{" "}
                    {existingData?.doctorName} only.
                  </span>
                )}
              </div>
              <button onClick={onClose} className="med_close_btn">
                <X size={20} />
              </button>
            </div>

            <div className="med_apt_workspace">
              {/* SLOT MANAGEMENT PANE (Left Sidebar) */}
              <div className={`slot_pane ${formData.doctor ? "active" : ""}`}>
                {formData.doctor && (
                  <div className="slot_pane_inner">
                    <div className="slot_pane_header">
                      <h3>Select New Date & Time</h3>
                      <p>Consultant: Dr. {formData.doctor.name}</p>
                    </div>

                    <div className="date_picker_alt">
                      <Calendar size={14} />
                      <input
                        type="date"
                        min={new Date().toLocaleDateString("en-CA")}
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            date: e.target.value,
                            time: "",
                          })
                        }
                      />
                    </div>

                    <div className="time_slot_list">
                      {slots.map((s) => (
                        <button
                          key={s.time}
                          disabled={s.isBooked || s.isPast}
                          className={`${formData.time === s.time ? "active" : ""} ${s.isBooked ? "booked" : ""} ${s.isPast ? "past" : ""}`}
                          onClick={() =>
                            setFormData({ ...formData, time: s.time })
                          }
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>

                    <button
                      className="proceed_prime_btn"
                      disabled={!formData.time}
                      onClick={() => setStep(2)}
                    >
                      Proceed to Review <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* DOCTOR DISCOVERY MATRIX (Main Grid - HIDE OR DISABLE IF RESCHEDULING) */}
              <div className="discovery_pane">
                {isRescheduleMode ? (
                  <div className="reschedule_locked_splash">
                    <ShieldCheck size={48} color="#2563eb" />
                    <h3>Consultant Selection Locked</h3>
                    <p>
                      To schedule with a different specialist, please close this
                      panel window and initialize a "New Appointment" booking
                      trace form configuration sheet.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="filter_header">
                      <div className="search_wrap">
                        <Search size={16} />
                        <input
                          placeholder="Search specialist name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="select_wrap">
                        <Filter size={16} />
                        <select
                          value={deptFilter}
                          onChange={(e) => setDeptFilter(e.target.value)}
                        >
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="doctor_bento_grid">
                      {doctors
                        .filter(
                          (d) =>
                            (deptFilter === "All Departments" ||
                              d.department === deptFilter) &&
                            d.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                        )
                        .map((d) => (
                          <div
                            key={d._id}
                            className={`bento_doc_card ${formData.doctor?._id === d._id ? "selected" : ""}`}
                            onClick={() =>
                              setFormData({ ...formData, doctor: d, time: "" })
                            }
                          >
                            <div className="bento_avatar">
                              {d.name.charAt(4)}
                            </div>
                            <div className="bento_info">
                              | <strong>{d.name}</strong>
                              <span>{d.department}</span>
                            </div>
                            {formData.doctor?._id === d._id && (
                              <div className="active_tick">
                                <CheckCircle size={14} />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SUMMARY & CONFIRMATION VIEW */}
        {step === 2 && (
          <div className="med_confirmation_view">
            <header className="confirm_header">
              <button className="back_to_edit" onClick={() => setStep(1)}>
                <ArrowLeft size={18} /> Edit Selection
              </button>
              <h2>
                {isRescheduleMode ? "Confirm Reschedule" : "Clinical Summary"}
              </h2>
            </header>

            <div className="confirm_card">
              <div className="confirm_avatar">
                {formData.doctor.name.charAt(4)}
              </div>
              <h3>Review Details</h3>
              <p className="conf_doc_title">
                Dr. {formData.doctor.name} • {formData.doctor.department}
              </p>

              <div className="summary_pill_container">
                <div className="s_pill">
                  <Calendar size={14} />{" "}
                  {new Date(formData.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="s_pill">
                  <Clock size={14} /> {formData.time}
                </div>
              </div>

              <div className="notes_field">
                <label>Consultation Notes</label>
                <textarea
                  disabled={isRescheduleMode} // Notes cannot be modified while rescheduling
                  placeholder="Describe your symptoms..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <button
                className="final_book_btn"
                onClick={handleBooking}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="spin" size={20} />
                ) : isRescheduleMode ? (
                  "Confirm & Reschedule Appointment"
                ) : (
                  "Confirm & Book Appointment"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
