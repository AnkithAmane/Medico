import "./PaymentConfirmation.css";

export default function PaymentConfirmation({
  doctorName,
  consultationFee,
  appointmentDate,
  appointmentTime,
  patientName,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <h2>Confirm Payment & Appointment</h2>
          <button className="close-btn" onClick={onCancel}>
            ✕ 
          </button>
        </div>

        <div className="payment-content">
          <div className="appointment-summary">
            <h3>Appointment Summary</h3>
            <div className="summary-item">
              <span className="label">Doctor:</span>
              <span className="value">{doctorName}</span>
            </div>
            <div className="summary-item">
              <span className="label">Patient:</span>
              <span className="value">{patientName}</span>
            </div>
            <div className="summary-item">
              <span className="label">Date:</span>
              <span className="value">{appointmentDate}</span>
            </div>
            <div className="summary-item">
              <span className="label">Time:</span>
              <span className="value">{appointmentTime}</span>
            </div>
          </div>

          <div className="payment-section">
            <h3>Payment Details</h3>
            <div className="payment-item">
              <span className="fee-label">Consultation Fee:</span>
              <span className="fee-amount">₹{consultationFee}</span>
            </div>
          </div>

          <div className="payment-actions">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button className="pay-btn" onClick={onConfirm}>
              💳 Pay & Confirm Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
