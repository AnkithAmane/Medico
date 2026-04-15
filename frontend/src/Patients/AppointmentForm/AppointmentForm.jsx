import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, User, MessageSquare, ChevronDown } from 'lucide-react';
import './AppointmentForm.css';

export default function AppointmentForm({ isOpen, onClose, initialDoctor }) {
  const navigate = useNavigate();

  // Local State to capture user input
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    reason: '',
    department: 'General'
  });

  // Effect to pre-populate doctor info when opened via Specialists "Book Now"
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Create the new booking entry
    const newBooking = {
      id: `BK-${Date.now()}`, // Unique ID using timestamp
      patient: "Arjun Mehta", // Global user context
      doctor: formData.doctor || "Specialist",
      department: formData.department,
      date: formData.date,
      time: formData.time,
      reason: formData.reason,
      status: "Upcoming",
      type: "Online", 
      branch: initialDoctor?.branch || "Main Branch"
    };

    // 2. Persistent Storage: Add to LocalStorage array
    const existing = JSON.parse(localStorage.getItem('my_appointments')) || [];
    const updated = [newBooking, ...existing];
    localStorage.setItem('my_appointments', JSON.stringify(updated));

    // 3. System Notification: Let other pages know data changed
    window.dispatchEvent(new Event("storage_update"));

    // 4. Modal cleanup
    onClose();

    // 5. Navigation: Absolute path based on your Patient Route structure
    navigate('/patient/bookings');
  };

  return (
    <div className="pat_form_overlay">
      <div className="pat_form_modal">
        {/* Header Section */}
        <div className="pat_form_header">
          <div className="pat_form_title">
            <h2>Book New Appointment</h2>
            <p>Fill in the details to schedule your session.</p>
          </div>
          <button className="pat_form_close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Form Section */}
        <form className="pat_form_body" onSubmit={handleSubmit}>
          <div className="pat_form_grid">
            
            {/* Specialist Name Input */}
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

            {/* Date Input */}
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

            {/* Time Input */}
            <div className="pat_form_group">
              <label><Clock size={16} /> Preferred Time</label>
              <input 
                type="time" 
                required
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>

            {/* Reason Textarea */}
            <div className="pat_form_group full">
              <label><MessageSquare size={16} /> Reason for Visit</label>
              <textarea 
                placeholder="Briefly describe your symptoms or concern..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              ></textarea>
            </div>
          </div>

          {/* Footer Actions */}
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