import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Stethoscope, CalendarDays, 
  Pill, UserCircle, Settings, LogOut, Menu, X, Bell, Search, User 
} from 'lucide-react';
import './Patient_Navbar.css';

/* Default Fallback Image */
import defaultPatientImg from '../../Assets/Images/Patient/default_patient_pic.jpg';

export default function Patient_Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /* Logic: Fetch Latest User Data for Dynamic Display */
  const user = JSON.parse(localStorage.getItem('userData'));
  
  // Determine if we show the Multer-uploaded photo or the local default
  const profilePic = user?.photo 
    ? `http://localhost:5000/uploads/${user.photo}` 
    : defaultPatientImg;

  // Navigation Registry
  const navOptions = [
    { id: 1, label: "Dashboard", path: "/patient/patient_dashboard", icon: <LayoutDashboard size={18} /> },
    { id: 2, label: "Specialists", path: "/patient/doctor_details", icon: <Stethoscope size={18} /> },
    { id: 3, label: "Bookings", path: "/patient/patient_bookings", icon: <CalendarDays size={18} /> },
    { id: 4, label: "Pharmacy", path: "/patient/pharmacy_details", icon: <Pill size={18} /> },
    { id: 5, label: "Vault", path: "/patient/patient_vault", icon: <UserCircle size={18} /> },
  ];

  // Auto-close overlays on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  /* Logic Section: Secure Logout */
  const handleLogout = () => {
    localStorage.clear(); // Clears token, role, and userData
    navigate('/');
  };

  return (
    <nav className="pat_nav_wrapper">
      <div className="pat_nav_container">
        
        {/* Branding Hub */}
        <div className="pat_nav_brand" onClick={() => navigate('/patient/patient_dashboard')}>
          <span className="pat_nav_plus_icon">✚</span>
          <span className="pat_nav_brand_name">MEDICO<span className="pat_nav_highlight">PLUS</span></span>
        </div>

        {/* Global Search Bar */}
        <div className="pat_nav_search_wrapper">
          <div className="pat_nav_search_inner">
            <Search size={16} className="pat_nav_search_icon" />
            <input 
              type="text" 
              placeholder="Search specialists, labs, records..." 
              className="pat_nav_search_input"
            />
          </div>
        </div>

        {/* Main Navigation links */}
        <ul className={`pat_nav_links_group ${menuOpen ? "pat_nav_mobile_active" : ""}`}>
          {navOptions.map((opt) => (
            <li key={opt.id} className="pat_nav_li">
              <NavLink 
                to={opt.path} 
                className={({ isActive }) => isActive ? "pat_nav_item pat_nav_active" : "pat_nav_item"}
              >
                <span className="pat_nav_label">{opt.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right Action Stack */}
        <div className="pat_nav_right_actions">
          <button className="pat_nav_notif_hub">
            <Bell size={20} />
            <span className="pat_nav_notif_dot"></span>
          </button>

          <div className="pat_nav_profile_container">
            <img 
              src={profilePic} 
              alt="Patient Profile" 
              className="pat_nav_user_img" 
              onClick={() => setProfileOpen(!profileOpen)}
              /* Error handling if server image fails to load */
              onError={(e) => { e.target.src = defaultPatientImg; }}
            />
            
            {/* Account Dropdown */}
            {profileOpen && (
              <div className="pat_nav_dropdown_card">
                <div className="pat_nav_dropdown_header">
                  <strong>{user?.name || "Patient Portal"}</strong>
                  <span>{user?.email || "Verified Identity"}</span>
                </div>
                <div className="pat_nav_divider"></div>
                
                <NavLink to="/patient/patient_profile" className="pat_nav_dropdown_link">
                  <User size={16} /> <span>My Profile</span>
                </NavLink>

                <NavLink to="/patient/patient_settings" className="pat_nav_dropdown_link">
                  <Settings size={16} /> <span>Settings</span>
                </NavLink>
                
                <div className="pat_nav_divider"></div>
                
                <button className="pat_nav_dropdown_link pat_nav_danger" onClick={handleLogout}>
                  <LogOut size={16} /> <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button className="pat_nav_hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>
    </nav>
  );
}