import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, User, MessageSquare, ChevronDown } from 'lucide-react';
import './Appointment_Form.css';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axios';

export default function Appointment_Form({ isOpen, onClose, initialDoctor }) {
  const navigate = useNavigate();
  const { user } = useAuth()

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    doctorId: '',
    doctorName: '',
    date: '',
    time: '',
    reason: '',
    type: 'online'
  });

  // Fetch doctors when form opens
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const res = await axiosInstance.get('/doctors')
        setDoctors(res.data.data || [])
      } catch (err) {
        console.error('Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }
    if (isOpen) fetchDoctors()
  }, [isOpen])

  // Handle Initial Doctor
  useEffect(() => {
    if (initialDoctor) {
      setFormData((prev) => ({
        ...prev,
        doctorId: initialDoctor._id,
        doctorName: initialDoctor.name,
      }));
    }
  }, [initialDoctor]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        doctorId: '',
        doctorName: '',
        date: '',
        time: '',
        reason: '',
        type: 'online'
      })
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId) {
      setError('Please select a doctor')
      return
    }
    try {
      setSubmitting(true)
      setError(null)
      await axiosInstance.post('/appointments', {
        patientId: user._id,
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        type: formData.type
      })
      onClose()
      navigate('/patient/patient_bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  };

  return (
    <div className="pat_form_overlay">
      <div className="pat_form_modal">
        
        <div className="pat_form_header">
          <div className="pat_form_title">
            <h2>Book New Appointment</h2>
            <p>Fill in the details to schedule your session.</p>
          </div>
          <button className="pat_form_close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', color: '#ef4444', 
            padding: '12px 16px', borderRadius: '12px', 
            marginBottom: '20px', fontWeight: '600',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form className="pat_form_body" onSubmit={handleSubmit}>
          <div className="pat_form_grid">
            
            <div className="pat_form_group full">
              <label><User size={16} /> Specialist</label>
              <div className="pat_select_wrapper">
                {initialDoctor ? (
                  <input 
                    type="text" 
                    value={formData.doctorName} 
                    readOnly 
                    className="pat_form_input_readonly"
                  />
                ) : (
                  <>
                    <select 
                      required
                      value={formData.doctorId}
                      onChange={(e) => {
                        const selected = doctors.find(d => d._id === e.target.value)
                        setFormData({
                          ...formData, 
                          doctorId: e.target.value,
                          doctorName: selected?.name || ''
                        })
                      }}
                    >
                      <option value="">
                        {loading ? 'Loading doctors...' : 'Choose a doctor...'}
                      </option>
                      {doctors.map(doc => (
                        <option key={doc._id} value={doc._id}>
                          {doc.name} ({doc.specialization})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pat_select_icon" size={18} />
                  </>
                )}
              </div>
            </div>

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

            <div className="pat_form_group full">
              <label><MessageSquare size={16} /> Reason for Visit</label>
              <textarea 
                placeholder="Briefly describe your symptoms or concern..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="pat_form_footer">
            <button type="button" className="pat_form_cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="pat_form_submit"
              disabled={submitting}
            >
              {submitting ? 'Booking...' : 'Confirm & Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}