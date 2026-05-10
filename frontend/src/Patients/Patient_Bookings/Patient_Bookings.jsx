import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, FileText, Video, MapPin, 
  Plus, Search, ChevronRight, X, Star 
} from 'lucide-react';
import AppointmentForm from '../Appointment_Form/Appointment_Form';
import './Patient_Bookings.css';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axios';

export default function Patient_Bookings() {
  const { user } = useAuth()
  
  // Data States
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // UI States
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  // Fetch appointments from backend
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return
      try {
        setLoading(true)
        const res = await axiosInstance.get(`/appointments/patient/${user._id}`)
        setAppointments(res.data.data || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [user])

  // Filter appointments
  const myBookings = useMemo(() => {
    return appointments.filter(app => {
      const doctorName = app.doctorId?.name || ''
      const matchesSearch = doctorName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filter === "All" || 
        app.status?.toLowerCase() === filter.toLowerCase()
      return matchesSearch && matchesStatus
    });
  }, [searchTerm, filter, appointments]);

  // CSS class helpers
  const getStatusClass = (status) => {
    if (status === "upcoming") return "status_upcoming";
    if (status === "completed") return "status_done";
    return "status_cancelled";
  };

  // Date formatting
  const formatDateParts = (dateStr) => {
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj)) return { day: "??", month: "???" };
    return {
      day: dateObj.getDate().toString().padStart(2, '0'),
      month: dateObj.toLocaleString('default', { month: 'short' })
    };
  };

  // Reschedule appointment
  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/appointments/${selectedAppt._id}/reschedule`, {
        date: rescheduleData.date,
        time: rescheduleData.time
      })
      // Refresh appointments
      const res = await axiosInstance.get(`/appointments/patient/${user._id}`)
      setAppointments(res.data.data || [])
      setIsRescheduling(false)
      setSelectedAppt(null)
      alert('Appointment rescheduled successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule')
    }
  };

  // Cancel appointment
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    try {
      await axiosInstance.delete(`/appointments/${selectedAppt._id}`)
      const res = await axiosInstance.get(`/appointments/patient/${user._id}`)
      setAppointments(res.data.data || [])
      setSelectedAppt(null)
      alert('Appointment cancelled successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel')
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading appointments...</p>
    </div>
  )

  return (
    <div className="pat_book_container_full">
      
      {/* Booking Dashboard Hub */}
      <main className="pat_book_main_hub">
        <div className="pat_book_header_strip">
          <div className="pat_book_title">
            <h1>My <span>Bookings</span></h1>
            <button className="pat_book_new_inline" onClick={() => setIsFormOpen(true)}>
              <Plus size={18} /> New Appointment
            </button>
          </div>
          
          <div className="pat_book_controls">
            <div className="pat_book_search">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by doctor name..." 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="pat_book_filter_pills">
              {["All", "Upcoming", "Completed", "Cancelled"].map(f => (
                <button 
                  key={f} 
                  className={filter === f ? 'active' : ''} 
                  onClick={() => setFilter(f)}
                >{f}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Feed */}
        <div className="pat_book_list">
          {myBookings.length > 0 ? myBookings.map((app) => {
            const { day, month } = formatDateParts(app.date);
            const doctorName = app.doctorId?.name || 'Doctor'
            const specialization = app.doctorId?.specialization || ''
            return (
              <div 
                className={`pat_book_item_card ${selectedAppt?._id === app._id ? 'active' : ''}`} 
                key={app._id}
                onClick={() => { setSelectedAppt(app); setIsRescheduling(false); }}
              >
                <div className="pat_book_date_box">
                  <span className="day">{day}</span>
                  <span className="month">{month}</span>
                </div>
                
                <div className="pat_book_info_main">
                  <div className="doc_meta">
                    <div className="doc_avatar">
                      {doctorName.split(' ').pop().charAt(0)}
                    </div>
                    <div className="doc_text">
                      <h3>{doctorName}</h3>
                      <span>{specialization} • {app.type}</span>
                    </div>
                  </div>
                  
                  <div className="time_meta">
                    <div className="meta_pill"><Clock size={14}/> {app.time}</div>
                    <div className="meta_pill"><MapPin size={14}/> {app.branch || "Main Branch"}</div>
                  </div>

                  <div className="status_meta">
                    <span className={`status_badge ${getStatusClass(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <ChevronRight size={20} className="list_arrow" />
                </div>
              </div>
            );
          }) : (
            <div className="pat_book_empty">
              No appointments found. Book your first appointment!
            </div>
          )}
        </div>
      </main>

      {/* Detail Slide Panel */}
      <aside className={`pat_book_detail_panel ${selectedAppt ? 'open' : ''}`}>
        {selectedAppt ? (
          <div className="detail_panel_content">
            <button className="panel_close_x" onClick={() => setSelectedAppt(null)}><X /></button>
            
            <div className="detail_header">
              <div className="detail_avatar_large">
                {(selectedAppt.doctorId?.name || 'D').split(' ').pop().charAt(0)}
              </div>
              <h2>{selectedAppt.doctorId?.name || 'Doctor'}</h2>
              <p className="detail_subtext">
                {selectedAppt.doctorId?.specialization || ''} Specialist
              </p>
              <span className={`status_badge_large ${getStatusClass(selectedAppt.status)}`}>
                {selectedAppt.status}
              </span>
            </div>

            <div className="detail_scroll_body">
              {isRescheduling ? (
                <form className="reschedule_form" onSubmit={handleReschedule}>
                  <h3>Reschedule Appointment</h3>
                  <div className="form_group">
                    <label>New Date</label>
                    <input 
                      type="date" 
                      required 
                      onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})} 
                    />
                  </div>
                  <div className="form_group">
                    <label>New Time</label>
                    <input 
                      type="time" 
                      required 
                      onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})} 
                    />
                  </div>
                  <div className="form_actions">
                    <button type="submit" className="confirm_res_btn">Update Schedule</button>
                    <button type="button" className="cancel_res_btn" onClick={() => setIsRescheduling(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="detail_section">
                    <label><Calendar size={14}/> Appointment Date</label>
                    <p>{new Date(selectedAppt.date).toLocaleDateString('en-GB', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}</p>
                  </div>

                  <div className="detail_section">
                    <label><Clock size={14}/> Scheduled Time</label>
                    <p>{selectedAppt.time} ({selectedAppt.type})</p>
                  </div>

                  {selectedAppt.status === "completed" ? (
                    <div className="past_actions_box">
                      <div className="prescription_preview">
                        <FileText size={20} />
                        <div>
                          <strong>Prescription.pdf</strong>
                          <span>Generated on {selectedAppt.date}</span>
                        </div>
                        <button className="view_file_btn">View</button>
                      </div>
                      <div className="review_section">
                        <h4>Your Review</h4>
                        <div className="stars">
                          <Star size={14} fill="#ffcd56" color="#ffcd56" /> 5.0
                        </div>
                        <p>"Great consultation, very thorough."</p>
                      </div>
                    </div>
                  ) : selectedAppt.status === "upcoming" ? (
                    <div className="upcoming_actions">
                      <button 
                        className="reschedule_trigger_btn" 
                        onClick={() => setIsRescheduling(true)}
                      >
                        Reschedule Appointment
                      </button>
                      <button 
                        className="cancel_booking_btn"
                        onClick={handleCancel}
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="detail_empty_state">
            <div className="empty_icon_circle"><Calendar size={40} /></div>
            <h3>Select an appointment</h3>
            <p>Click on any booking to view full details or manage your schedule.</p>
          </div>
        )}
      </aside>

      <AppointmentForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false)
          // Refresh after booking
          axiosInstance.get(`/appointments/patient/${user._id}`)
            .then(res => setAppointments(res.data.data || []))
        }} 
      />
    </div>
  );
}