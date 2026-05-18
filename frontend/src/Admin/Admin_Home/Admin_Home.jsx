import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, UserRound, Users,
  Wallet, BarChart3, PartyPopper, Clock, Settings,
  LogOut, Bell, Search, ChevronLeft, ChevronRight, Menu,
  MessageSquareQuote, Microscope, RefreshCw
} from "lucide-react";
import "./Admin_Home.css";
import adminPic from "../../Assets/Images/Admin/default_admin_pic.jpg";

export default function Admin_Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const navigate = useNavigate();

  // 1. Logic: Security & Session Verification
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const token = localStorage.getItem("token");
    
    if (!token || userData?.role !== "admin") {
      // navigate("/"); // Uncomment for production security
    }

    // Header Clock Sync
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  // 2. Updated Navigation (Including New Modules)
  const navOptions = [
    { id: 1, label: "Dashboard", path: "/admin/admin_dashboard", icon: <LayoutDashboard size={19} /> },
    { id: 2, label: "Appointments", path: "/admin/appointments_management", icon: <CalendarDays size={19} /> },
    { id: 3, label: "Doctors", path: "/admin/doctors_management", icon: <UserRound size={19} /> },
    { id: 4, label: "Patients", path: "/admin/patients_management", icon: <Users size={19} /> },
    { id: 5, label: "Pharmacy", path: "/admin/pharmacy_management", icon: <Microscope size={19} /> }, // New
    { id: 6, label: "Reviews", path: "/admin/review_management", icon: <MessageSquareQuote size={19} /> }, // New
    { id: 7, label: "Revenue", path: "/admin/revenue_details", icon: <Wallet size={19} /> },
    { id: 8, label: "Statistics", path: "/admin/statistics", icon: <BarChart3 size={19} /> },
    { id: 9, label: "Events", path: "/admin/events_management", icon: <PartyPopper size={19} /> },
    { id: 10, label: "Schedules", path: "/admin/availability_management", icon: <Clock size={19} /> },
    { id: 11, label: "Global Settings", path: "/admin/departments_management", icon: <Settings size={19} /> },
  ];

  const handleLogout = () => {
    if (window.confirm("End session and secure Medico+ terminal?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="admin_home_layout">
      {isMobileMenuOpen && (
        <div className="admin_home_mobile_overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className={`admin_home_sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileMenuOpen ? "mobile_open" : ""}`}>
        <div className="admin_home_toggle_zone">
          <button className="admin_home_toggle_btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="admin_home_nav">
          {navOptions.map((opt) => (
            <NavLink
              key={opt.id}
              to={opt.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => isActive ? "admin_home_nav_item active" : "admin_home_nav_item"}
            >
              <span className="admin_home_nav_icon">{opt.icon}</span>
              {!isCollapsed && <span className="admin_home_nav_label">{opt.label}</span>}
              {isCollapsed && <div className="admin_home_nav_tooltip">{opt.label}</div>}
            </NavLink>
          ))}
        </nav>

        <div className="admin_home_sidebar_bottom">
          <button className="admin_home_logout_action" onClick={handleLogout}>
            <LogOut size={18} color="#ef4444" />
            {!isCollapsed && <span className="admin_home_logout_text" style={{color: '#ef4444'}}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN VIEWPORT --- */}
      <main className="admin_home_main_viewport">
        <header className="admin_home_top_header">
          <div className="admin_home_header_left">
            <button className="admin_home_hamburger" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="admin_home_brand_header">
              <span className="admin_home_plus_icon">✚</span>
              <span className="admin_home_brand_name">MEDICO<span className="highlight">PLUS</span></span>
            </div>
          </div>

          <div className="admin_home_header_center">
            <div className="admin_home_global_search">
              <Search size={18} className="admin_home_search_icon" />
              <input
                type="text"
                placeholder="Secure global registry search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="admin_home_header_right">
            <div className="admin_home_live_clock">
              <span className="clock_pulse"></span>
              {currentTime}
            </div>
            <button className="admin_home_notif_btn">
              <Bell size={20} />
              <span className="admin_home_notif_ping"></span>
            </button>
            <div className="admin_home_profile_hub">
              <div className="admin_home_profile_meta">
                <span className="admin_home_admin_name">Master Terminal</span>
              </div>
              <div className="admin_home_avatar_container">
                <img src={adminPic} alt="Admin" />
              </div>
            </div>
          </div>
        </header>

        {/* --- DYNAMIC CONTENT CONTAINER --- */}
        <section className="admin_home_page_container">
          <Outlet context={{ globalSearch: searchTerm }} />
        </section>
      </main>
    </div>
  );
}