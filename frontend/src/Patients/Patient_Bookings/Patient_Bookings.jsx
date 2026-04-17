import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, FileText, Video, MapPin, 
  Plus, Search, ChevronRight, X, Star 
} from 'lucide-react';
import AppointmentForm from '../Appointment_Form/Appointment_Form';
import './Patient_Bookings.css';

// Local data imports
import appointmentsData from '../../Assets/Data/Appointments_Data.json';

export default function Patient_Bookings() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [storageTrigger, setStorageTrigger] = useState(0);
  
  // Management states
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  // Sync with local storage changes
  useEffect(() => {
    const handleUpdate = () => setStorageTrigger(prev => prev + 1);
    window.addEventListener("storage_update", handleUpdate);
    return () => window.removeEventListener("storage_update", handleUpdate);
  }, []);

  // Filter and merge booking data
  const myBookings = useMemo(() => {
    const localAppts = JSON.parse(localStorage.getItem('my_appointments')) || [];
    const combined = [...localAppts, ...appointmentsData];

    return combined.filter(app => {
      const isMine = app.patient === "Arjun Mehta";
      const matchesSearch = app.doctor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filter === "All" || app.status === filter;
      return isMine && matchesSearch && matchesStatus;
    });
  }, [searchTerm, filter, storageTrigger]);

  // CSS class helpers
  const getStatusClass = (status) => {
    if (status === "Upcoming") return "status_upcoming";
    if (status === "Completed") return "status_done";
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

  // Logic: Reschedule action
  const handleReschedule = (e) => {
    e.preventDefault();
    alert(`Appointment with ${selectedAppt.doctor} rescheduled to ${rescheduleData.date} at ${rescheduleData.time}`);
    setIsRescheduling(false);
    setSelectedAppt(null);
  };

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
          
          {/* Dashboard Controls */}
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
          {myBookings.map((app) => {
            const { day, month } = formatDateParts(app.date);
            return (
              <div 
                className={`pat_book_item_card ${selectedAppt?.id === app.id ? 'active' : ''}`} 
                key={app.id}
                onClick={() => { setSelectedAppt(app); setIsRescheduling(false); }}
              >
                <div className="pat_book_date_box">
                  <span className="day">{day}</span>
                  <span className="month">{month}</span>
                </div>
                
                <div className="pat_book_info_main">
                  <div className="doc_meta">
                    <div className="doc_avatar">{app.doctor.split(' ').pop().charAt(0)}</div>
                    <div className="doc_text">
                      <h3>{app.doctor}</h3>
                      <span>{app.department} • {app.type}</span>
                    </div>
                  </div>
                  
                  <div className="time_meta">
                    <div className="meta_pill"><Clock size={14}/> {app.time}</div>
                    <div className="meta_pill"><MapPin size={14}/> {app.branch || "Main Wing"}</div>
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
          })}
        </div>
      </main>

      {/* Profile/Detail Slide Panel */}
      <aside className={`pat_book_detail_panel ${selectedAppt ? 'open' : ''}`}>
        {selectedAppt ? (
          <div className="detail_panel_content">
            <button className="panel_close_x" onClick={() => setSelectedAppt(null)}><X /></button>
            
            <div className="detail_header">
              <div className="detail_avatar_large">{selectedAppt.doctor.split(' ').pop().charAt(0)}</div>
              <h2>{selectedAppt.doctor}</h2>
              <p className="detail_subtext">{selectedAppt.department} Specialist</p>
              <span className={`status_badge_large ${getStatusClass(selectedAppt.status)}`}>
                {selectedAppt.status}
              </span>
            </div>

            <div className="detail_scroll_body">
              {isRescheduling ? (
                /* Edit Schedule View */
                <form className="reschedule_form" onSubmit={handleReschedule}>
                  <h3>Reschedule Appointment</h3>
                  <div className="form_group">
                    <label>New Date</label>
                    <input type="date" required onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})} />
                  </div>
                  <div className="form_group">
                    <label>New Time</label>
                    <input type="time" required onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})} />
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
                    <p>{new Date(selectedAppt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>

                  <div className="detail_section">
                    <label><Clock size={14}/> Scheduled Time</label>
                    <p>{selectedAppt.time} ({selectedAppt.type})</p>
                  </div>

                  {/* Contextual Actions */}
                  {selectedAppt.status === "Completed" ? (
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
                        <div className="stars"><Star size={14} fill="#ffcd56" color="#ffcd56" /> 5.0</div>
                        <p>"Great consultation, very thorough."</p>
                      </div>
                    </div>
                  ) : selectedAppt.status === "Upcoming" ? (
                    <div className="upcoming_actions">
                      <button className="reschedule_trigger_btn" onClick={() => setIsRescheduling(true)}>
                        Reschedule Appointment
                      </button>
                      <button className="cancel_booking_btn">Cancel Appointment</button>
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

      {/* Overlay Modal */}
      <AppointmentForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}