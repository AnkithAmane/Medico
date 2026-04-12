import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  Users,
  Wallet,
  BarChart3,
  PartyPopper,
  Clock,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import "./Admin_Home.css";
import adminPic from "../../Assets/Images/Admin/default_admin.jpg";

export default function Admin_Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const navOptions = [
    { id: 1, label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { id: 2, label: "Appointments", path: "/admin/appointment_management", icon: <CalendarDays size={20} /> },
    { id: 3, label: "Doctors", path: "/admin/doctor_management", icon: <UserRound size={20} /> },
    { id: 4, label: "Patients", path: "/admin/patient_management", icon: <Users size={20} /> },
    { id: 5, label: "Revenue", path: "/admin/revenue_details", icon: <Wallet size={20} /> },
    { id: 6, label: "Statistics", path: "/admin/statistics", icon: <BarChart3 size={20} /> },
    { id: 7, label: "Events", path: "/admin/event_management", icon: <PartyPopper size={20} /> },
    { id: 8, label: "Schedules", path: "/admin/schedule_management", icon: <Clock size={20} /> },
    { id: 9, label: "Departments", path: "/admin/department_management", icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to end your session at Medico+?")) {
      navigate("/");
    }
  };

  return (
    <div className="admin_home_layout">
      {isMobileMenuOpen && (
        <div 
          className="admin_home_mobile_overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <aside className={`admin_home_sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileMenuOpen ? "mobile_open" : ""}`}>
        <div className="admin_home_toggle_zone">
          <button 
            className="admin_home_toggle_btn" 
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="admin_home_nav">
          {navOptions.map((opt) => (
            <NavLink
              key={opt.id}
              to={opt.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => 
                isActive ? "admin_home_nav_item active" : "admin_home_nav_item"
              }
            >
              <span className="admin_home_nav_icon">{opt.icon}</span>
              {!isCollapsed && <span className="admin_home_nav_label">{opt.label}</span>}
              {isCollapsed && <div className="admin_home_nav_tooltip">{opt.label}</div>}
            </NavLink>
          ))}
        </nav>

        <div className="admin_home_sidebar_bottom">
          <button className="admin_home_logout_action" onClick={handleLogout}>
            <LogOut size={20} />
            {!isCollapsed && <span className="admin_home_logout_text">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="admin_home_main_viewport">
        <header className="admin_home_top_header">
          <div className="admin_home_header_left">
            <button 
              className="admin_home_hamburger" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="admin_home_brand_header">
              <span className="admin_home_plus_icon">✚</span>
              <span className="admin_home_brand_name">
                MEDICO<span className="highlight">PLUS</span>
              </span>
            </div>
          </div>

          <div className="admin_home_header_center">
            <div className="admin_home_global_search">
              <Search size={18} className="admin_home_search_icon" />
              <input
                type="text"
                placeholder="Search for patients, doctors, or records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="admin_home_header_right">
            <button className="admin_home_notif_btn">
              <Bell size={22} />
              <span className="admin_home_notif_ping"></span>
            </button>

            <div className="admin_home_profile_hub">
              <div className="admin_home_profile_meta">
                <span className="admin_home_admin_name">Admin</span>
              </div>
              <div className="admin_home_avatar_container">
                <img src={adminPic} alt="Admin" />
              </div>
            </div>
          </div>
        </header>

        <section className="admin_home_page_container">
          <Outlet context={{ searchTerm }} />
        </section>
      </main>
    </div>
  );
}