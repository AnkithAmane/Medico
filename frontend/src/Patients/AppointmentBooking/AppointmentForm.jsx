import { useState, useEffect } from "react";
import patienceData from "../../Assets/Data/PatientData/PatienceData";
import hospitalData from "../../Assets/Data/PatientData/DoctorData";
import PaymentConfirmation from "./PaymentConfirmation";
import "./AppointmentForm.css";

const updatePatientAppointmentData = (patientId, newAppointment) => {
  // Storing patient appointments in localStorage
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
  
  
  const patient = patienceData.patients.find(p => p.patientId === patientId);
  if (patient) {
    if (!patient.appointmentData) {
      patient.appointmentData = [];
    }
    patient.appointmentData.push(appointmentToAdd);
  }
  
  
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
  const [patientData, setPatientData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState(null);

  useEffect(() => {
    
    const patientId = localStorage.getItem("patientId");
    
    if (patientId) {
     
      const patient = patienceData.patients.find(
        (p) => p.patientId === patientId
      );
      
      if (patient) {
        setPatientData(patient);
        
        setFormData((prev) => ({
          ...prev,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
        }));
      }
    }

   
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


    const appointments = JSON.parse(
      localStorage.getItem("appointments") || "[]"
    );

   
    const slotKey = `${doctorName}-${formData.date}-${formData.time}`;

    // Count appointments for this slot
    const slotBookings = appointments.filter(
      (apt) => apt.slotKey === slotKey
    ).length;

    
    if (slotBookings >= 1) {
      setError("This time slot is fully booked. Please select another time.");
      return;
    }

    
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

    
    const appointments = JSON.parse(
      localStorage.getItem("appointments") || "[]"
    );

    
    appointments.push(pendingAppointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    
    const patientId = localStorage.getItem("patientId");
    if (patientId) {
      updatePatientAppointmentData(patientId, pendingAppointment);
    }

    setShowPaymentModal(false);
    setSuccess(
      `✅ Appointment booked successfully with ${doctorName} on ${formData.date} at ${formData.time}`
    );

    
    setFormData({
      name: patientData?.name || "",
      age: patientData?.age || "",
      gender: patientData?.gender || "",
      healthIssues: "",
      date: "",
      time: "",
    });

    
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
          
          {consultationFee > 0 && (
            <div className="fee-info">
              Consultation Fee: <span className="fee-value">₹{consultationFee}</span>
            </div>
          )}

          <button type="submit" className="p_submit-btn">
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
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
}