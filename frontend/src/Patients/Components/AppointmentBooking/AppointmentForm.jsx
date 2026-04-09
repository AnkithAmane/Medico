import { useState, useEffect } from "react";
import hospitalData from "../../../Assets/Data/PatientData/DoctorData";
import PaymentConfirmation from "./PaymentConfirmation";
import "./AppointmentForm.css";
 
const updatePatientAppointmentData = (patientId, newAppointment) => {
  const patientAppointmentsKey = `patientAppointments_${patientId}`;
  const existingAppointments = JSON.parse(localStorage.getItem(patientAppointmentsKey) || '[]');
 
  const appointmentToAdd = {
    date: newAppointment.date,
    time: newAppointment.time,
    doctorName: newAppointment.doctorName,
    reasonForVisit: newAppointment.healthIssues || "General Checkup",
    status: "Upcoming",
    bookedAt: newAppointment.bookedAt,
    consultationFee: newAppointment.consultationFee
  };
 
  existingAppointments.push(appointmentToAdd);
  localStorage.setItem(patientAppointmentsKey, JSON.stringify(existingAppointments));
  window.dispatchEvent(new CustomEvent('appointmentBooked', { detail: appointmentToAdd }));
};
 
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState(null);
 
  useEffect(() => {
    const doctor = hospitalData.hospital_staff.find((doc) => doc.name === doctorName);
    if (doctor) setConsultationFee(doctor.consultation_fee);
  }, [doctorName]);
 
  const timeSlots = [
    "10:00-10:30", "10:30-11:00", "11:00-11:30",
    "14:00-14:30", "14:30-15:00", "15:00-15:30",
    "15:30-16:00", "16:00-16:30", "16:30-17:00",
  ];
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };
 
  const validateForm = () => {
    if (!formData.name.trim()) { setError("Please enter your name"); return false; }
    if (!formData.age || formData.age < 1 || formData.age > 120) { setError("Please enter a valid age"); return false; }
    if (!formData.gender.trim()) { setError("Please select your gender"); return false; }
    if (!formData.date) { setError("Please select a date"); return false; }
    if (!formData.time) { setError("Please select a time slot"); return false; }
 
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { setError("Please select a future date"); return false; }
 
    return true;
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
 
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    const slotKey = `${doctorName}-${formData.date}-${formData.time}`;
    if (appointments.filter((apt) => apt.slotKey === slotKey).length >= 1) {
      setError("This time slot is fully booked.");
      return;
    }
 
    const newAppointment = {
      id: Date.now(),
      doctorName,
      ...formData,
      consultationFee,
      slotKey,
      bookedAt: new Date().toISOString(),
    };
 
    setPendingAppointment(newAppointment);
    setShowPaymentModal(true);
  };
 
  const handlePaymentConfirm = () => {
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    appointments.push(pendingAppointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));
 
    const patientId = localStorage.getItem("patientId") || "guest";
    updatePatientAppointmentData(patientId, pendingAppointment);
 
    setShowPaymentModal(false);
    setSuccess(`✅ Appointment booked successfully with ${doctorName}!`);
 
    setTimeout(() => {
      if (onBookingComplete) onBookingComplete(pendingAppointment);
    }, 2000);
  };
 
  return (
    <div className="p-appointment-container">
      <div className="p-form-wrapper">
        <button className="p-back-btn" onClick={onBack}>← Back</button>
        <h2 className="p-form-title">Book Appointment with <br /> {doctorName}</h2>
 
        {error && <div className="p-alert p-alert-danger">{error}</div>}
        {success && <div className="p-alert p-alert-success">{success}</div>}
 
        <form onSubmit={handleSubmit}>
          <div className="p-form-group">
            <label htmlFor="name">Full Name <span className="p-required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="p-form-control"
            />
          </div>
 
          <div className="p-form-row">
            <div className="p-form-group">
              <label htmlFor="age">Age <span className="p-required">*</span></label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
                className="p-form-control"
              />
            </div>
 
            <div className="p-form-group">
              <label htmlFor="gender">Gender <span className="p-required">*</span></label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="p-form-control"
              >
                <option value="">--Select--</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
 
          <div className="p-form-row">
            <div className="p-form-group">
              <label htmlFor="date">Date <span className="p-required">*</span></label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="p-form-control"
              />
            </div>
 
            <div className="p-form-group">
              <label htmlFor="time">Time Slot <span className="p-required">*</span></label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="p-form-control"
              >
                <option value="">--Select Time--</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
         
          {consultationFee > 0 && (
            <div className="p-fee-info">
              Consultation Fee: <span className="p-fee-value">₹{consultationFee}</span>
            </div>
          )}
 
          <button type="submit" className="p-submit-btn">
            📅 Confirm Appointment
          </button>
        </form>
      </div>
 
      {showPaymentModal && pendingAppointment && (
        <PaymentConfirmation
          doctorName={doctorName}
          consultationFee={consultationFee}
          appointmentDate={formData.date}
          appointmentTime={formData.time}
          patientName={formData.name}
          onConfirm={handlePaymentConfirm}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
 