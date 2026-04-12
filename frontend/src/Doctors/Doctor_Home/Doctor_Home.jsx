import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom"; // Added Outlet and useLocation
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
  Settings as SettingsIcon,
  User as UserIcon
} from "lucide-react";

import doctorsData from "../../Assets/Data/doctor.json";
import "./Doctor_Home.css";

export default function DoctorHome() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const currentDoc = useMemo(() => doctorsData[5] || {}, []);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const mainNavOptions = useMemo(() => [
    { id: 1, label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/doctor/dashboard" },
    { id: 2, label: "Appointments", icon: <CalendarCheck size={20} />, path: "/doctor/appointments" },
    { id: 3, label: "Patients", icon: <Users size={20} />, path: "/doctor/patients" },
    { id: 4, label: "Schedule", icon: <Clock size={20} />, path: "/doctor/schedule" },
    { id: 5, label: "Performance", icon: <BarChart4 size={20} />, path: "/doctor/performance" },
    { id: 6, label: "Reviews", icon: <Star size={20} />, path: "/doctor/reviews" },
  ], []);

  const handleLogout = () => {
    if (window.confirm("Terminate clinical session at Medico+?")) {
      navigate("/");
    }
  };

  return (
    <div className="doc_home_med_doctor_root">
      <aside className={`doc_home_med_sidebar_elite ${isCollapsed ? "doc_home_is_collapsed" : ""}`}>
        {/* Profile Section */}
        <div className="doc_home_doc_identity_panel" onClick={() => navigate("/doctor/profile")}>
          <div className="doc_home_avatar_wrapper">
            <img
              src={currentDoc.photo || "/assets/doc_default.png"}
              alt="Doctor"
              className={`doc_home_identity_avatar ${isCollapsed ? "doc_home_avatar_mini" : ""}`}
            />
            <div className="doc_home_active_indicator_sidebar"></div>
          </div>

          {!isCollapsed && (
            <div className="doc_home_identity_meta doc_home_view_fade_in">
              <h3 className="doc_home_doc_full_name">{currentDoc.name}</h3>
              <p className="doc_home_doc_degree_tag">{currentDoc.degrees || currentDoc.qualification}</p>
              <p className="doc_home_doc_dept_tag">{currentDoc.department}</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="doc_home_sidebar_navigation_menu">
          <div className="doc_home_nav_spacer_top"></div>
          {mainNavOptions.map((opt) => (
            <button
              key={opt.id}
              className={`doc_home_nav_menu_item ${location.pathname === opt.path ? "doc_home_is_active" : ""}`}
              onClick={() => navigate(opt.path)}
            >
              <span className="doc_home_nav_icon_box">{opt.icon}</span>
              {!isCollapsed && <span className="doc_home_nav_label_text">{opt.label}</span>}
              {isCollapsed && <div className="doc_home_collapsed_tooltip">{opt.label}</div>}
            </button>
          ))}
        </nav>

        <div className="doc_home_sidebar_footer_actions">
          <button className="doc_home_logout_btn_elite" onClick={handleLogout}>
            <LogOut size={20} />
            {!isCollapsed && <span className="doc_home_logout_text">Logout</span>}
          </button>
        </div>

        <button className="doc_home_sidebar_toggle_trigger" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      <main className="doc_home_med_workspace_viewport">
        <header className="doc_home_med_workspace_header">
          <div className="doc_home_header_left_brand">
            <div className="doc_home_medico_plus_logo_area">
              <span className="doc_home_logo_symbol">✚</span>
              <h2 className="doc_home_logo_text">MEDICO<span className="doc_home_text_cyan">PLUS</span></h2>
            </div>
          </div>

          <div className="doc_home_header_center_search">
            <div className={`doc_home_global_search_container ${isSearchFocused ? "doc_home_is_focused" : ""}`}>
              <Search size={18} className="doc_home_search_icon_main" />
              <input
                type="text"
                placeholder="Search patient UID, schedules or records..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          <div className="doc_home_header_right_controls">
            <div className="doc_home_widget_header_sync">
              <div className="doc_home_live_time_group">
                <span className="doc_home_live_time">
                  {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <div className="doc_home_live_date_single_line">
                  <span className="doc_home_full_date_text">
                    {dateTime.toLocaleDateString(undefined, { weekday: 'long' })}, {dateTime.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="doc_home_header_icon_group">
              <button className="doc_home_control_icon_btn doc_home_has_notif">
                <Bell size={22} />
                <span className="doc_home_notif_ping_dot"></span>
              </button>
              <button className="doc_home_control_icon_btn" onClick={() => navigate("/doctor/settings")}>
                <SettingsIcon size={22} />
              </button>
            </div>
          </div>
        </header>

        <section className="doc_home_med_workspace_content">
          <div className="doc_home_content_inner_wrapper doc_home_view_fade_in">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}