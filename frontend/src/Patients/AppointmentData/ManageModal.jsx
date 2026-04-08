import React, { useState } from "react";
import RescheduleForm from "./RescheduleForm";
import "./ManageModal.css";

function ManageModal({ appointment, onClose }) {
  const isPastAppointment = appointment.status === "Past";
  const [step, setStep] = useState(isPastAppointment ? "records" : "options"); // 'options', 'reschedule', 'cancel', 'success', 'records'
  const [successMsg, setSuccessMsg] = useState("");

  if (!appointment) return null;

  function handleConfirm(type) {
    setSuccessMsg(`${type} requested successfully.`);
    setStep("success");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="fw-bold mb-0">
            {step === "success" ? "Confirmation" : 
             step === "records" ? "Medical Records" : 
             "Manage Appointment"}
          </h4>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {step === "options" && (
            <div className="d-grid gap-2 text-center">
              <p className="text-muted mb-4">
                What would you like to do for your visit with <strong>{appointment.doctorName || "Doctor"}</strong>?
              </p>
              {isPastAppointment ? (
                <button className="modal-action-btn reschedule" onClick={() => setStep("records")}>
                  View Medical Records
                </button>
              ) : (
                <>
                  <button className="modal-action-btn reschedule" onClick={() => setStep("reschedule")}>
                    Reschedule Request
                  </button>
                  <button className="modal-action-btn cancel-outline" onClick={() => setStep("cancel")}>
                    Cancel Appointment
                  </button>
                </>
              )}
            </div>
          )}

          {step === "records" && isPastAppointment && (
            <div className="records-container">
              {/* Diagnosis/Remarks Section */}
              <div className="records-section mb-4">
                <h5 className="fw-bold text-primary mb-3">📋 Diagnosis</h5>
                <div className="records-content">
                  <p className="mb-2">
                    <strong>Specialization:</strong> {appointment.specialization || "N/A"}
                  </p>
                  <p>
                    <strong>Remarks:</strong> {appointment.remarks || "No remarks"}
                  </p>
                </div>
              </div>

              {/* Prescription Section */}
              {appointment.prescription && appointment.prescription.length > 0 && (
                <div className="records-section mb-4">
                  <h5 className="fw-bold text-success mb-3">💊 Prescription</h5>
                  <div className="records-content">
                    {appointment.prescription.map((med, idx) => (
                      <div key={med.id || idx} className="prescription-item mb-2 p-2 bg-light rounded">
                        <p className="mb-1">
                          <strong>{med.name}</strong> - {med.dosage}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tests Section */}
              {appointment.tests && appointment.tests.length > 0 && (
                <div className="records-section mb-4">
                  <h5 className="fw-bold text-info mb-3">🔬 Tests</h5>
                  <div className="records-content">
                    {appointment.tests.map((test, idx) => (
                      <div key={test.id || idx} className="test-item mb-2 p-2 bg-light rounded">
                        <p className="mb-1">
                          <strong>{test.name}</strong>
                        </p>
                        <p className="mb-0 small text-muted">
                          Result: {test.result}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn-back w-100" onClick={onClose}>
                Back
              </button>
            </div>
          )}

          {step === "reschedule" && (
            <RescheduleForm 
              onBack={() => setStep("options")} 
              onConfirm={() => handleConfirm("Reschedule")} 
            />
          )}

          {step === "cancel" && (
            <div className="modal-form">
              <p className="text-danger small mb-3">Please provide a reason for cancellation.</p>
              <textarea className="form-control mb-3" rows="3" placeholder="Reason..."></textarea>
              <div className="d-flex gap-2">
                <button className="btn-back" style = {{height: "42px", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "16px"}} onClick={() => setStep("options")}>Back</button>
                <button className="modal-action-btn cancel mb-0" style = {{height: "42px", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "16px"}} onClick={() => handleConfirm("Cancellation")}>
                  Confirm Cancel
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-4">
              <div className="success-icon-circle mb-3">✓</div>
              <h5 className="fw-bold text-success">{successMsg}</h5>
              <button className="btn-search-action w-100 mt-3" onClick={onClose}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageModal;