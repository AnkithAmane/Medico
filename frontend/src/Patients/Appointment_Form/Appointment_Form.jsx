import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, User, MessageSquare, ChevronDown } from 'lucide-react';
import './Appointment_Form.css';

export default function Appointment_Form({ isOpen, onClose, initialDoctor }) {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    reason: '',
    department: 'General'
  });

  // Handle Initial Doctor Injection
  useEffect(() => {
    if (initialDoctor) {
      setFormData((prev) => ({
        ...prev,
        doctor: initialDoctor.name,
        department: initialDoctor.department || 'General'
      }));
    }
  }, [initialDoctor]);

  if (!isOpen) return null;

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const newBooking = {
      id: `BK-${Date.now()}`,
      patient: "Arjun Mehta",
      doctor: formData.doctor || "Specialist",
      department: formData.department,
      date: formData.date,
      time: formData.time,
      reason: formData.reason,
      status: "Upcoming",
      type: "Online", 
      branch: initialDoctor?.branch || "Main Branch"
    };

    // Persistence Logic
    const existing = JSON.parse(localStorage.getItem('my_appointments')) || [];
    const updated = [newBooking, ...existing];
    localStorage.setItem('my_appointments', JSON.stringify(updated));

    // Update system and navigate
    window.dispatchEvent(new Event("storage_update"));
    onClose();
    navigate('/patient/bookings');
  };

  return (
    <div className="pat_form_overlay">
      <div className="pat_form_modal">
        
        {/* Header */}
        <div className="pat_form_header">
          <div className="pat_form_title">
            <h2>Book New Appointment</h2>
            <p>Fill in the details to schedule your session.</p>
          </div>
          <button className="pat_form_close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Booking Form */}
        <form className="pat_form_body" onSubmit={handleSubmit}>
          <div className="pat_form_grid">
            
            {/* Specialist Selection */}
            <div className="pat_form_group full">
              <label><User size={16} /> Specialist</label>
              <div className="pat_select_wrapper">
                {initialDoctor ? (
                  <input 
                    type="text" 
                    value={formData.doctor} 
                    readOnly 
                    className="pat_form_input_readonly"
                  />
                ) : (
                  <>
                    <select 
                      required
                      value={formData.doctor}
                      onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                    >
                      <option value="">Choose a doctor...</option>
                      <option value="Dr. Katherine Cole">Dr. Katherine Cole (Cardiology)</option>
                      <option value="Dr. Arjun Mehta">Dr. Arjun Mehta (General Physician)</option>
                      <option value="Dr. Vijay K">Dr. Vijay K (General)</option>
                    </select>
                    <ChevronDown className="pat_select_icon" size={18} />
                  </>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="pat_form_group">
              <label><Calendar size={16} /> Preferred Date</label>
              <input 
                type="date" 
                required
                min={new Date().toISOString().split("T")[0]} 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="pat_form_group">
              <label><Clock size={16} /> Preferred Time</label>
              <input 
                type="time" 
                required
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>

            {/* Visit Details */}
            <div className="pat_form_group full">
              <label><MessageSquare size={16} /> Reason for Visit</label>
              <textarea 
                placeholder="Briefly describe your symptoms or concern..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              ></textarea>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pat_form_footer">
            <button type="button" className="pat_form_cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pat_form_submit">
              Confirm & Book
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}