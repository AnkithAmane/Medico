import { useState, useEffect } from "react";
import "./AppointmentForm.css";
import patienceData from "../../Assets/Data/PatientData/PatienceData";
import hospitalData from "../../Assets/Data/PatientData/DoctorData";
import PaymentConfirmation from "./PaymentConfirmation";

export default function AppointmentForm({ doctorName, onBookingComplete, onBack }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    healthIssues: "",
    date: "",
    time: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [consultationFee, setConsultationFee] = useState(0);
  const [patientData, setPatientData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState(null);

  useEffect(() => {
    // Get patient ID from localStorage
    const patientId = localStorage.getItem("patientId");
    
    if (patientId) {
      // Find patient data from PatienceData
      const patient = patienceData.patients.find(
        (p) => p.patientId === patientId
      );
      
      if (patient) {
        setPatientData(patient);
        // Pre-fill form with patient data
        setFormData((prev) => ({
          ...prev,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
        }));
      }
    }

    // Get doctor consultation fee
    const doctor = hospitalData.hospital_staff.find(
      (doc) => doc.name === doctorName
    );
    if (doctor) {
      setConsultationFee(doctor.consultation_fee);
    }
  }, [doctorName]);

  const timeSlots = [
    "10:00-10:30",
    "10:30-11:00",
    "11:00-11:30",
    "14:00-14:30",
    "14:30-15:00",
    "15:00-15:30",
    "15:30-16:00",
    "16:00-16:30",
    "16:30-17:00",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!formData.age || formData.age < 1 || formData.age > 120) {
      setError("Please enter a valid age");
      return false;
    }
    if (!formData.gender.trim()) {
      setError("Please select your gender");
      return false;
    }
    if (!formData.date) {
      setError("Please select a date");
      return false;
    }
    if (!formData.time) {
      setError("Please select a time slot");
      return false;
    }

    // Check if date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError("Please select a future date");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    // Get existing appointments from localStorage
    const appointments = JSON.parse(
      localStorage.getItem("appointments") || "[]"
    );

    // Create unique key for doctor + date + time
    const slotKey = `${doctorName}-${formData.date}-${formData.time}`;

    // Count appointments for this slot
    const slotBookings = appointments.filter(
      (apt) => apt.slotKey === slotKey
    ).length;

    // Check if slot is full (max 1 booking)
    if (slotBookings >= 1) {
      setError("This time slot is fully booked. Please select another time.");
      return;
    }

    // Create appointment object but don't save yet
    const newAppointment = {
      id: Date.now(),
      doctorName,
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      healthIssues: formData.healthIssues || "None",
      date: formData.date,
      time: formData.time,
      consultationFee: consultationFee,
      slotKey,
      bookedAt: new Date().toISOString(),
    };

    // Store pending appointment and show payment modal
    setPendingAppointment(newAppointment);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = () => {
    if (!pendingAppointment) return;

    // Get existing appointments from localStorage
    const appointments = JSON.parse(
      localStorage.getItem("appointments") || "[]"
    );

    // Save to localStorage
    appointments.push(pendingAppointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    setShowPaymentModal(false);
    setSuccess(
      `✅ Appointment booked successfully with Dr. ${doctorName} on ${formData.date} at ${formData.time}`
    );

    // Reset form
    setFormData({
      name: patientData?.name || "",
      age: patientData?.age || "",
      gender: patientData?.gender || "",
      healthIssues: "",
      date: "",
      time: "",
    });

    // Call callback after 2 seconds
    setTimeout(() => {
      if (onBookingComplete) {
        onBookingComplete(pendingAppointment);
      }
    }, 2000);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setPendingAppointment(null);
  };

  return (
    <div className="appointment-form-container">
      <div className="form-wrapper">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>

        <h2>Book Appointment with <br /> {doctorName}</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

      

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="form-control"
              readOnly={patientData !== null}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">
                Age <span className="required">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
                min="1"
                max="120"
                className="form-control"
                readOnly={patientData !== null}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">
                Gender <span className="required">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-control"
                disabled={patientData !== null}
              >
                <option value="">--Select Gender--</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <br />

          {/* <div className="form-group">
            <label htmlFor="healthIssues">Previous Health Issues (Optional)</label>
            <textarea
              id="healthIssues"
              name="healthIssues"
              value={formData.healthIssues}
              onChange={handleChange}
              placeholder="Describe any previous health issues or concerns (optional)"
              rows="3"
              className="form-control"
            />
          </div> */}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
              Select Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">
                Time Slot <span className="required">*</span>
              </label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">--Select Time--</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <br />
          {/* Display Consultation Fee - Simplified */}
          {consultationFee > 0 && (
            <div className="fee-info">
              Consultation Fee: <span className="fee-value">₹{consultationFee}</span>
            </div>
          )}

          <button type="submit" className="submit-btn">
            📅 Confirm Appointment
          </button>
        </form>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && pendingAppointment && (
        <PaymentConfirmation
          doctorName={doctorName}
          consultationFee={consultationFee}
          appointmentDate={formData.date}
          appointmentTime={formData.time}
          patientName={formData.name}
          onConfirm={handlePaymentConfirm}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
}