import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  Clock, 
  BarChart4, 
  Star, 
  LogOut, 
  Bell, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Settings as SettingsIcon
} from "lucide-react"; 

// --- DATA IMPORTS ---
import doctorsData from "../../Assets/Data/doctor.json";

// --- MODULE COMPONENTS ---
import Dashboard from "../Doctor_Dashboard/Doctor_Dashboard.jsx";
import Appointments from "../Doctor_Appointments/Doctor_Appointments.jsx";
import Reviews from "../Doctor_Reviews/Doctor_Reviews.jsx";
import PerformanceDashboard from "../Doctor_Dashboard/Doctor_Performance_Dashboard.jsx";
import ScheduleAvailability from "../Doctor_Availability/Doctor_Availability.jsx";
import Patients from "../Doctor_Patients/Doctor_Patients.jsx";
import Profile from "../Other/Doctor_Profile.jsx";
import Settings from "../Other/Doctor_Settings.jsx";
import "./Doctor_Home.css";

export default function DoctorHome() {
  // --- STATE ENGINE ---
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currModule, setCurrModule] = useState("Dashboard");
  const [dateTime, setDateTime] = useState(new Date());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const navigate = useNavigate();

  // --- DATA SELECTION LOGIC ---
  const currentDoc = useMemo(() => doctorsData[0] || {}, []);

  // --- ADMIN-STYLE TEMPORAL SYNC ---
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- NAVIGATION CONFIGURATION ---
  const mainNavOptions = useMemo(() => [
    { id: "dash", name: "Dashboard", icon: <LayoutDashboard size={20} />, component: <Dashboard /> },
    { id: "appt", name: "Appointments", icon: <CalendarCheck size={20} />, component: <Appointments /> },
    { id: "pats", name: "Patients", icon: <Users size={20} />, component: <Patients /> },
    { id: "sched", name: "Schedule", icon: <Clock size={20} />, component: <ScheduleAvailability /> },
    { id: "perf", name: "Performance", icon: <BarChart4 size={20} />, component: <PerformanceDashboard /> },
    { id: "rev", name: "Reviews", icon: <Star size={20} />, component: <Reviews /> },
  ], []);

  // --- HANDLERS ---
  const handleLogout = () => {
    if (window.confirm("Terminate clinical session at Medico+?")) {
      navigate("/doctor_auth");
    }
  };

  return (
    <div className="med_doctor_root">
      
      {/* 1. ELITE SIDEBAR */}
      <aside className={`med_sidebar_elite ${isCollapsed ? "is_collapsed" : ""}`}>
        
        <div className="doc_identity_panel" onClick={() => setCurrModule("Profile")}>
          <div className="avatar_wrapper">
            <img 
              src={currentDoc.photo || "/assets/doc_default.png"} 
              alt="Doctor" 
              className={`identity_avatar ${isCollapsed ? "avatar_mini" : ""}`}
            />
            <div className="active_indicator_sidebar"></div>
          </div>
          
          {!isCollapsed && (
            <div className="identity_meta view_fade_in">
              <h3 className="doc_full_name">{currentDoc.name}</h3>
              <p className="doc_degree_tag">{currentDoc.degrees || currentDoc.qualification}</p>
              <p className="doc_dept_tag">{currentDoc.department}</p>
            </div>
          )}
        </div>

        <nav className="sidebar_navigation_menu">
          <div className="nav_spacer_top"></div>
          {mainNavOptions.map((opt) => (
            <button 
              key={opt.id}
              className={`nav_menu_item ${currModule === opt.name ? "is_active" : ""}`}
              onClick={() => setCurrModule(opt.name)}
            >
              <span className="nav_icon_box">{opt.icon}</span>
              {!isCollapsed && <span className="nav_label_text">{opt.name}</span>}
              {isCollapsed && <div className="collapsed_tooltip">{opt.name}</div>}
            </button>
          ))}
        </nav>

        <div className="sidebar_footer_actions">
          <button className="logout_btn_elite" onClick={handleLogout}>
            <LogOut size={20} />
            {!isCollapsed && <span className="logout_text">Exit Portal</span>}
          </button>
        </div>

        <button className="sidebar_toggle_trigger" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <main className="med_workspace_viewport">
        
        <header className="med_workspace_header">
          <div className="header_left_brand">
            <div className="medico_plus_logo_area">
               <span className="logo_symbol">✚</span>
               <h2 className="logo_text">MEDICO<span className="text_cyan">PLUS</span></h2>
            </div>
          </div>

          <div className="header_center_search">
            <div className={`global_search_container ${isSearchFocused ? "is_focused" : ""}`}>
              <Search size={18} className="search_icon_main" />
              <input 
                type="text" 
                placeholder="Search patient UID, schedules or records..." 
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          <div className="header_right_controls">
            <div className="widget-header-sync">
              <div className="live-time-group">
                <span className="live-time">
                  {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <div className="live-date-single-line">
                  <span className="full-date-text">
                    {dateTime.toLocaleDateString(undefined, { weekday: 'long' })}, {dateTime.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="header_icon_group">
              <button className="control_icon_btn has_notif">
                <Bell size={22} />
                <span className="notif_ping_dot"></span>
              </button>
              <button className="control_icon_btn" onClick={() => setCurrModule("Settings")}>
                <SettingsIcon size={22} />
              </button>
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC CONTENT AREA */}
        <section className="med_workspace_content">
          <div className="content_inner_wrapper view_fade_in">
            {mainNavOptions.find(o => o.name === currModule)?.component || 
             (currModule === "Profile" ? <Profile /> : <Settings />)}
          </div>
        </section>

      </main>
    </div>
  );
}