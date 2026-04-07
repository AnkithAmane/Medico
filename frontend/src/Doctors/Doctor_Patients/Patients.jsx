import React, { useEffect, useMemo, useState } from "react";
import "./Patients.css";
import data from "../../Assets/Data/doctorsData.json";
import patientPhoto from "../../Assets/Images/Doctor/doctor_profile1.webp";

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function Patients() {
  const [all, setAll] = useState(() => {
    try {
      const saved = localStorage.getItem("patientsData");
      if (saved) return JSON.parse(saved);
    } catch {}
    return data.patientDetails || [];
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const today = useMemo(
    () => new Date().toLocaleDateString("en-CA"),
    []
  );

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return all
      .filter((p) => {
        if (status === "today") return p.appointmentDate === today;
        if (status === "completed") return p.isCompleted;
        if (status === "pending") return !p.isCompleted;
        return true;
      })
      .filter((p) =>
        [p.name, p.patientId, p.email, p.reasonForVisit]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
  }, [all, q, status, today]);

  const selectedPatient = all.find(
    (p) => p.patientId === selectedId
  );

  function toggleCompleted(id) {
    setAll((prev) =>
      prev.map((p) =>
        p.patientId === id
          ? { ...p, isCompleted: !p.isCompleted }
          : p
      )
    );
  }

  useEffect(() => {
    localStorage.setItem("patientsData", JSON.stringify(all));
  }, [all]);

  return (
    <div className="doctor-pt">
      {/* FILTERS */}
      <div className="doctor-pt__filters">
        <input
          className="doctor-pt__search"
          placeholder="Search patients..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="doctor-pt__tabs">
          {["all", "today", "completed", "pending"].map((t) => (
            <button
              key={t}
              className={`doctor-pt__tab ${
                status === t ? "doctor-pt__tab--active" : ""
              }`}
              onClick={() => setStatus(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div className="doctor-pt__body">
        {/* LEFT LIST */}
        <div className="doctor-pt__list">
          {filtered.map((p) => (
            <div
              key={p.patientId}
              className={`doctor-pt__card ${
                selectedId === p.patientId ? "is-selected" : ""
              }`}
              onClick={() => setSelectedId(p.patientId)}
            >
              <div className="doctor-pt__card-row">
                <img
                  src={patientPhoto}
                  alt="Patient"
                  className="doctor-pt__avatar"
                />
                <div>
                  <strong>{p.name}</strong>
                  <div className="doctor-pt__muted">{p.patientId}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT DETAILS */}
        <div className="doctor-pt__detail">
          {selectedPatient ? (
            <>
              <div className="doctor-pt__detail-header">
                <img
                  src={patientPhoto}
                  alt="Patient"
                  className="doctor-pt__detail-avatar"
                />
                <div>
                  <h3>
                    {selectedPatient.name} (
                    {selectedPatient.patientId})
                  </h3>
                  <div className="doctor-pt__age">
                    Age: {selectedPatient.age}
                  </div>
                </div>
              </div>

              <div className="doctor-pt__info">
                <div>Gender: {selectedPatient.gender}</div>
                <div>Email: {selectedPatient.email}</div>
                <div>Phone: {selectedPatient.phoneNumber}</div>
                <div>Address: {selectedPatient.address}</div>
                <div>
                  Appointment:{" "}
                  {formatDate(selectedPatient.appointmentDate)} /{" "}
                  {selectedPatient.timeSlot}
                </div>
                <div>
                  Reason: {selectedPatient.reasonForVisit}
                </div>
              </div>

              {selectedPatient.Past_Data && (
                <div className="doctor-pt__past">
                  <strong>Past Visit</strong>
                  <div>
                    Date: {selectedPatient.Past_Data.dateOfVisit}
                  </div>
                  <div>
                    Remarks: {selectedPatient.Past_Data.remarks}
                  </div>
                </div>
              )}

              <button
                className="doctor-pt__btn doctor-pt__btn--primary"
                onClick={() =>
                  toggleCompleted(selectedPatient.patientId)
                }
              >
                Mark as{" "}
                {selectedPatient.isCompleted
                  ? "Pending"
                  : "Completed"}
              </button>
            </>
          ) : (
            <div className="doctor-pt__empty">
              Select a patient to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}