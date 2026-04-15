import React, { useState, useEffect, useMemo } from 'react';
import AppointmentForm from '../AppointmentForm/AppointmentForm';
import { 
  Activity, Scale, Ruler, HeartPulse, Wind, 
  Clock, Search, Bell, Zap, ArrowRight, ChevronRight,
  Calendar as CalIcon
} from 'lucide-react';
import './Dashboard.css';

// Data Imports
import patientData from '../../Assets/Data/patient.json';
import appointmentsData from '../../Assets/Data/appointment.json';
import doctor from '../doctor2.png';

export default function PatientDashboard() {
  const [dateTime, setDateTime] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Logic: Current User Context (Arjun Mehta)
  const user = useMemo(() => patientData.find(p => p.id === 24) || patientData[90], []);
  
  // Logic: Find Next Appointment for the "On Deck" widget
  const nextAppt = useMemo(() => 
    appointmentsData.find(a => a.patient === user.name && a.status === "Upcoming"), 
  [user.name]);

  // Logic: Filter Lists for the bottom section
  const upcomingList = useMemo(() => 
    appointmentsData.filter(a => a.patient === user.name && a.status === "Upcoming").slice(0, 3),
  [user.name]);

  const pastList = useMemo(() => 
    appointmentsData.filter(a => a.patient === user.name && a.status === "Completed").slice(0, 3),
  [user.name]);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = dateTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="pat_dash_container">
      
      {/* --- LEFT CONTENT AREA --- */}
      <div className="pat_dash_main_content">
        
        {/* ROW 1: GREETING SECTION */}
        <div className="pat_dash_row_1">
          <div className="pat_dash_welcome">
            <h1 className="pat_dash_h1">{getGreeting()}, <span className="pat_dash_span">{user.name.split(' ')[0]}!</span></h1>
            <p className="pat_dash_p">How are You Feeling Today?</p>
          </div>
          
        </div>

        {/* ROW 2: HERO BANNER */}
        <div className="pat_dash_row_2">
          <div className="pat_dash_hero_banner">
            <div className="pat_dash_hero_text_content">
              <h2 className="pat_dash_h2">Welcome to <span className="pat_dash_span">Medico+</span></h2>
              <p className="pat_dash_p">Find the best doctors with Healthcare and get finest medical services.</p>
            </div>
            <img src={doctor} alt="Doctor" className="pat_dash_hero_floating_img" />
          </div>
        </div>

        {/* ROW 2.5: QUICK BOOKING SECTION (New Stripped Section) */}
        <div className="pat_dash_row_booking_strip">
          <div className="pat_dash_booking_card">
            <div className="pat_dash_booking_left">
              <div className="pat_dash_booking_icon_box">
                <CalIcon size={24} color="#007acc" />
              </div>
              <div className="pat_dash_booking_text">
                <h4 className="pat_dash_h4">Need a Consultation?</h4>
                <p className="pat_dash_p">Schedule a session with our specialized doctors in just a few clicks.</p>
              </div>
            </div>
            <button 
      className="pat_dash_book_btn_animated" 
      onClick={() => setIsFormOpen(true)}
    >
      <span>Book Appointment Now</span>
      <ArrowRight size={18} />
    </button>
          </div>
        </div>

        {/* ROW 3: VITALS SECTION */}
        <div className="pat_dash_row_3_vitals">
          <div className="pat_dash_vitals_section_header">
            <h3 className="pat_dash_h3">Live Vitals</h3>
          </div>
          <div className="pat_dash_vitals_cards_grid">
            <div className="pat_dash_vital_card">
              <Scale size={20} color="#007acc" />
              <div className="pat_dash_vital_info"><span className="pat_dash_span">Weight</span><strong className="pat_dash_strong">{user.weight}</strong></div>
            </div>
            <div className="pat_dash_vital_card">
              <Ruler size={20} color="#007acc" />
              <div className="pat_dash_vital_info"><span className="pat_dash_span">Height</span><strong className="pat_dash_strong">{user.height}</strong></div>
            </div>
            <div className="pat_dash_vital_card">
              <Activity size={20} color="#ef4444" />
              <div className="pat_dash_vital_info"><span className="pat_dash_span">BP Level</span><strong className="pat_dash_strong">120/80</strong></div>
            </div>
            <div className="pat_dash_vital_card">
              <Wind size={20} color="#10b981" />
              <div className="pat_dash_vital_info"><span className="pat_dash_span">Breathing</span><strong className="pat_dash_strong">15 <small className="pat_dash_small">bpm</small></strong></div>
            </div>
            <div className="pat_dash_vital_card">
              <HeartPulse size={20} color="#f43f5e" />
              <div className="pat_dash_vital_info"><span className="pat_dash_span">Pulse Rate</span><strong className="pat_dash_strong">72 <small className="pat_dash_small">bpm</small></strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDEBAR --- */}
      <aside className="pat_dash_sidebar_widgets">
        
        {/* WIDGET 1: CALENDAR */}
        <div className="pat_dash_sidebar_widget pat_dash_widget_calendar">
          <div className="pat_dash_widget_calendar_header">
            <Clock size={20} color="#007acc" />
            <div className="pat_dash_calendar_time_group">
              <span className="pat_dash_calendar_live_clock">
                {dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span className="pat_dash_calendar_full_date">
                {dateTime.toLocaleDateString(undefined, { weekday: "long" })}, {dateTime.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
          <div className="pat_dash_calendar_grid_ui">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
              <span key={idx} className="pat_dash_calendar_day_label">{day}</span>
            ))}
            {[...Array(31)].map((_, i) => (
              <span key={i} className={`pat_dash_calendar_date_cell ${i + 1 === dateTime.getDate() ? "pat_dash_calendar_today_active" : ""}`}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>

        {/* WIDGET 2: NEXT APPOINTMENT (ON DECK) */}
        <div className="pat_dash_sidebar_widget pat_dash_widget_on_deck">
          <div className="pat_dash_on_deck_header">
              <div className="pat_dash_on_deck_flex">
                <Zap size={16} color="#007acc" fill="#007acc" />
                <h3 className="pat_dash_h3">Next Appointment</h3>
              </div>
              <span className="pat_dash_on_deck_tag">On Deck</span>
          </div>
          
          {nextAppt ? (
            <div className="pat_dash_on_deck_content_wrapper">
                <div className="pat_dash_on_deck_hero">
                  <div className="pat_dash_on_deck_avatar">{nextAppt.doctor?.charAt(3)}</div>
                  <div className="pat_dash_on_deck_meta">
                    <strong className="pat_dash_strong">{nextAppt.doctor}</strong>
                    <span className="pat_dash_span">Record: #MS-PT{nextAppt.id}</span>
                  </div>
                </div>
                <div className="pat_dash_on_deck_bento_stats">
                  <div className="pat_dash_bento_tile">
                    <span className="pat_dash_span">Time</span>
                    <strong className="pat_dash_strong">{nextAppt.time}</strong>
                  </div>
                  <div className="pat_dash_bento_tile">
                    <span className="pat_dash_span">Type</span>
                    <strong className="pat_dash_strong">{nextAppt.type}</strong>
                  </div>
                </div>
                <button className="pat_dash_on_deck_action_btn">
                  Join Tele-Lobby <ArrowRight size={14}/>
                </button>
            </div>
          ) : (
            <div className="pat_dash_on_deck_empty_container">
              <div className="pat_dash_on_deck_empty_state">
                <p className="pat_dash_p">No sessions scheduled for today.</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* --- ROW 4: TRUE FULL WIDTH APPOINTMENTS (Spans entire dashboard width) --- */}
      <div className="pat_dash_row_4_full_width">
        
        {/* Left: Upcoming */}
        <div className="pat_dash_list_card_half">
          <div className="pat_dash_list_header">
            <h3 className="pat_dash_h3">Upcoming Schedule</h3>
            <button className="pat_dash_view_all">View All</button>
          </div>
          <div className="pat_dash_list_body">
            {upcomingList.length > 0 ? upcomingList.map((appt, i) => (
              <div key={i} className="pat_dash_list_item">
                <div className="pat_dash_item_date">
                  <span className="pat_dash_date_num">{appt.date.split(' ')[0]}</span>
                  <span className="pat_dash_date_month">{appt.date.split(' ')[1]}</span>
                </div>
                <div className="pat_dash_item_info">
                  <strong className="pat_dash_strong">{appt.doctor}</strong>
                  <span className="pat_dash_span">{appt.type} • {appt.time}</span>
                </div>
                <ChevronRight size={18} className="pat_dash_list_chevron" />
              </div>
            )) : <p className="pat_dash_empty_text">No upcoming appointments</p>}
          </div>
        </div>

        {/* Right: Previous */}
        <div className="pat_dash_list_card_half">
          <div className="pat_dash_list_header">
            <h3 className="pat_dash_h3">Recent Consultations</h3>
            <button className="pat_dash_view_all">History</button>
          </div>
          <div className="pat_dash_list_body">
            {pastList.length > 0 ? pastList.map((appt, i) => (
              <div key={i} className="pat_dash_list_item">
                <div className="pat_dash_item_icon_past">
                  <HeartPulse size={18} color="#10b981" />
                </div>
                <div className="pat_dash_item_info">
                  <strong className="pat_dash_strong">{appt.doctor}</strong>
                  <span className="pat_dash_span">Completed on {appt.date}</span>
                </div>
                <div className="pat_dash_status_badge_done">Completed</div>
              </div>
            )) : <p className="pat_dash_empty_text">No history found</p>}
          </div>
        </div>
      </div>
            <AppointmentForm 
      isOpen={isFormOpen} 
      onClose={() => setIsFormOpen(false)} 
    />
    </div>
  );
}