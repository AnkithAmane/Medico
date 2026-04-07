import React, { useState } from "react";
import patientData from "../../Assets/Data/PatientData/PatienceData"; 
import ManageModal from "./ManageModal"; 
import "./AppointmentData.css";

function AppointmentData() {
  const [view, setView] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null); 

  // Extract all appointments from patients and flatten them
  const allAppointments = patientData.patients.flatMap((patient) =>
    (patient.appointmentData || []).map((apt) => ({
      ...apt,
      patientId: patient.patientId,
      patientName: patient.name,
      appointmentDate: apt.date,
      timeSlot: apt.time,
      reasonForVisit: apt.reasonForVisit || apt.specialization || "General Checkup",
    }))
  );

  // Filter appointments based on view and search term
  const filteredAppointments = allAppointments.filter((item) => {
    const isStatusMatch = view === "upcoming" 
      ? item.status === "Upcoming" 
      : item.status === "Past";
    
    const doctorName = item.doctorName || "";
    const nameWithoutPrefix = doctorName.replace(/^(dr\.?\s*)/i, "");
    
    const isNameMatch = nameWithoutPrefix
      .toLowerCase()
      .trim()
      .includes(searchTerm.toLowerCase().trim());

    return isStatusMatch && isNameMatch;
  });

  return (
    <div className="appointments-page-wrapper">
      <section className="search-container-section">
        <div className="search-card-flat shadow-sm">
          <h2 className="search-card-title">🔍 Find Your Doctor</h2>
          <div className="search-flex-row">
            <input 
              type="text" 
              className="search-input-box" 
              placeholder="Search by doctor name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="theme-toggle-container">
              <button className={view === "upcoming" ? "btn-nav-theme active" : "btn-nav-theme"} onClick={() => setView("upcoming")}>Upcoming</button>
              <button className={view === "past" ? "btn-nav-theme active" : "btn-nav-theme"} onClick={() => setView("past")}>Past</button>
            </div>
            <button className="btn-search-action" onClick={() => setSearchTerm("")}>Clear</button>
          </div>
        </div>
      </section>

      <div className="container mt-4">
        <div className="appointment-results-grid">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((item) => (
              <div className="appointment-themed-card mb-3 shadow-sm" key={`${item.patientId}-${item.date}-${item.time}`}>
                <div className="card-gradient-header"></div>
                <div className="card-body d-flex align-items-center p-4">
                  <div className="icon-box-themed me-4">{item.reasonForVisit.charAt(0)}</div>
                  <div className="flex-grow-1">
                    <h5 className="fw-bold mb-1">{item.reasonForVisit}</h5>
                    <p className="theme-text-accent fw-bold mb-2">
                      {item.doctorName || "To Be Assigned"}
                    </p>
                    <div className="d-flex gap-4 text-muted small">
                      <span><strong>Date:</strong> {item.appointmentDate}</span>
                      <span><strong>Time:</strong> {item.timeSlot}</span>
                    </div>
                  </div>

                  <div className="border-start ps-4">
                    <button 
                      className="btn-theme-gradient px-4"
                      onClick={() => setSelectedApp(item)}
                    >
                      {view === "upcoming" ? "Manage" : "Records"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-card text-center py-5">
              <p className="text-muted">No appointments found.</p>
            </div>
          )}
        </div>
      </div>

      {/* FIXED: Conditional rendering ensures modal state is unique to each click */}
      {selectedApp && (
        <ManageModal 
          appointment={selectedApp} 
          onClose={() => setSelectedApp(null)} 
        />
      )}
    </div>
  );
}

export default AppointmentData;