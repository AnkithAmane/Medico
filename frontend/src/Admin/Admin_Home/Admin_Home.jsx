import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, CalendarDays, UserRound, Users, 
  Wallet, BarChart3, PartyPopper, Clock, Settings, 
  LogOut, Bell, Search, ChevronLeft, ChevronRight 
} from "lucide-react"; 
import "./Admin_Home.css";
import adminPic from "../../Assets/Images/Admin/default_admin.jpg"

export default function Admin_Home() {
  // --- 1. STATE & ROUTING ---
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for global search
  const navigate = useNavigate();

  // --- 2. NAVIGATION CONFIGURATION ---
  const navOptions = [
    { id: 1, label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { id: 2, label: "Appointments", path: "/admin/a_m", icon: <CalendarDays size={20} /> },
    { id: 3, label: "Doctors", path: "/admin/d_m", icon: <UserRound size={20} /> },
    { id: 4, label: "Patients", path: "/admin/p_m", icon: <Users size={20} /> },
    { id: 5, label: "Revenue", path: "/admin/r", icon: <Wallet size={20} /> },
    { id: 6, label: "Statistics", path: "/admin/s", icon: <BarChart3 size={20} /> },
    { id: 7, label: "Events", path: "/admin/e", icon: <PartyPopper size={20} /> },
    { id: 8, label: "Schedules", path: "/admin/a", icon: <Clock size={20} /> },
    { id: 9, label: "Departments", path: "/admin/d", icon: <Settings size={20} /> },
  ];

  // --- 3. HANDLERS ---
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to end your session at Medico+?")) {
      navigate("/");
    }
  };

  return (
    <div className="med_light_layout">
      
      {/* --- SIDEBAR MODULE --- */}
      <aside className={`med_sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="med_sidebar_toggle_zone">
          <button className="med_toggle_btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="med_sidebar_nav">
          {navOptions.map((opt) => (
            <NavLink 
              key={opt.id} 
              to={opt.path} 
              className={({ isActive }) => isActive ? "med_nav_item active" : "med_nav_item"}
            >
              <span className="med_nav_icon">{opt.icon}</span>
              
              {!isCollapsed && <span className="med_nav_label">{opt.label}</span>}
              
              {isCollapsed && <div className="med_nav_tooltip">{opt.label}</div>}
            </NavLink>
          ))}
        </nav>

        <div className="med_sidebar_bottom">
          <button className="med_logout_action" onClick={handleLogout}>
            <LogOut size={20} />
            {!isCollapsed && <span className="med_logout_text">Logout</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT MODULE --- */}
      <main className="med_main_viewport">
        
        {/* TOPBAR HEADER */}
        <header className="med_top_header">
          <div className="med_header_left">
            <div className="med_brand_header">
              <span className="med_plus_icon">✚</span>
              <span className="med_brand_name">MEDICO<span className="highlight">PLUS</span></span>
            </div>
          </div>

          <div className="med_header_center">
            <div className="med_global_search_clean">
              <Search size={18} className="med_search_icon" />
              <input 
                type="text" 
                placeholder="Search for patients, doctors, or records..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Capture search input
              />
            </div>
          </div>

          <div className="med_header_right">
            <button className="med_notif_btn">
              <Bell size={22} />
              <span className="med_notif_ping"></span>
            </button>
            
            <div className="med_admin_profile_hub">
              <div className="med_profile_meta">
                <span className="med_admin_name">Admin</span>
              </div>
              <div className="med_avatar_container">
                <img src={adminPic} alt="Admin" />
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC PAGE OUTLET */}
        <section className="med_page_container">
          {/* Passing the search term to child routes (Dashboard, Doctors, etc.) */}
          <Outlet context={{ searchTerm }} />
        </section>

      </main>
    </div>
  );
}