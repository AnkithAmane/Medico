import React, { useMemo, useState } from "react";
import "./Appointments.css";
import data from "../../Assets/Data/doctorsData.json";
import patientPhoto from "../../Assets/Images/Doctor/doctor_profile1.webp";
import { FiEye } from "react-icons/fi";

/* ---------- Helpers ---------- */
function parseTimeSlot(timeSlot) {
  const [time, modifier] = timeSlot.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

function classify(appt, now) {
  const s = new Date(appt.start);
  const n = new Date(now);
  if (s.toDateString() === n.toDateString()) return "ongoing";
  if (s > n) return "upcoming";
  return "previous";
}

function fmtRangeIST(appt) {
  const opts = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  };
  const start = new Date(appt.start).toLocaleString(undefined, opts);
  const end = new Date(appt.end).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  });
  return `${start} - ${end} IST`;
}

/* ================= Component ================= */
export default function DoctorAppointments() {
  const initialAppointments = useMemo(() => {
    return (data.patientDetails || []).map(p => {
      const time24 = parseTimeSlot(p.timeSlot);
      const startISO = `${p.appointmentDate}T${time24}:00+05:30`;
      const start = new Date(startISO);
      const end = new Date(start.getTime() + 30 * 60000);
      return {
        id: p.patientId,
        patient: p.name,
        start: start.toISOString(),
        end: end.toISOString(),
        pastData: p.Past_Data || null,
        prescription: ""
      };
    });
  }, []);

  const [listData, setListData] = useState(initialAppointments);
  const [active, setActive] = useState("ongoing");
  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  const items = useMemo(() => {
    const now = new Date();
    return listData.map(a => ({ ...a, status: classify(a, now) }));
  }, [listData]);

  const list = items.filter(a => a.status === active);

  return (
    <div className="doctor-appt">
      {/* Tabs */}
      <div className="doctor-appt__tabs">
        {["ongoing", "upcoming", "previous"].map(t => (
          <button
            key={t}
            className={`doctor-appt__tab ${active === t ? "is-active" : ""}`}
            onClick={() => setActive(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Appointment List */}
      <div className="doctor-appt__list">
        {list.length === 0 ? (
          <div className="doctor-appt__empty">
            No {active} appointments
          </div>
        ) : (
          list.map(a => (
            <div key={a.id} className="doctor-appt__card">
              <div className="doctor-appt__photo">
                <img src={patientPhoto} alt="Patient" />
              </div>

              <div className="doctor-appt__info">
                <div>
                  <div className="doctor-appt__name">{a.patient}</div>
                  <div className="doctor-appt__id">ID: {a.id}</div>
                  <div className="doctor-appt__time">{fmtRangeIST(a)}</div>
                </div>

                <div
                  className="doctor-appt__eye"
                  onClick={() => setDetailModal({ open: true, data: a })}
                  title="View Details"
                >
                  <FiEye size={22} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {detailModal.open && (
        <div className="doctor-appt__modalOverlay">
          <div className="doctor-appt__sheet">
            <h3>Patient Details</h3>
            <p><strong>Name:</strong> {detailModal.data.patient}</p>
            <p><strong>Time:</strong> {fmtRangeIST(detailModal.data)}</p>

            {detailModal.data.pastData && (
              <>
                <h4>Past Visit</h4>
                <p><strong>Date:</strong> {detailModal.data.pastData.dateOfVisit}</p>
                <p><strong>Remarks:</strong> {detailModal.data.pastData.remarks}</p>
                <strong>Prescription:</strong>
                <ul>
                  {detailModal.data.pastData.prescription.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </>
            )}

            <h4>Add / Edit Prescription</h4>
            <textarea
              rows="4"
              value={detailModal.data.prescription}
              onChange={(e) =>
                setDetailModal(s => ({
                  ...s,
                  data: { ...s.data, prescription: e.target.value }
                }))
              }
            />

            <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setDetailModal({ open: false, data: null })}>
                Close
              </button>
              <button
                onClick={() => {
                  setListData(prev =>
                    prev.map(ap =>
                      ap.id === detailModal.data.id
                        ? { ...ap, prescription: detailModal.data.prescription }
                        : ap
                    )
                  );
                  setDetailModal({ open: false, data: null });
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}