import './Navbar.css';
import { useState } from 'react';
import { NavLink,useNavigate } from 'react-router-dom';
import Image from '../../Assets/Images/Doctor/ArjunReddy.jpg';

export default function Navbar() {
  const [profileClicked, setProfileClicked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  function handleprofile() {
    setProfileClicked(!profileClicked);
  }

  function handleMenuClose() {
    setMenuOpen(false);
    setProfileClicked(false);
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/';
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-bold" to="/" onClick={handleMenuClose}>
          🏥 Medico
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`navbar-collapse ${menuOpen ? 'show-mobile' : 'hide-mobile'}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Mobile profile options */}
            <li className="nav-item mobile-only">
              <NavLink className="nav-link" to="profile" onClick={handleMenuClose}>
                View Profile
              </NavLink>
            </li>
            <li className="nav-item mobile-only">
              <NavLink className="nav-link" to="settings" onClick={handleMenuClose}>
                Settings
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="dashboard" onClick={handleMenuClose}>
                Book Appointment
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="medication-tests" onClick={handleMenuClose}>
                Medication & Tests
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="appointments" onClick={handleMenuClose}>
                Appointments
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="contact" onClick={() => { navigate('contact'); handleMenuClose(); }}>
                Contact
              </NavLink>
            </li>

            {/* Logout at bottom for mobile */}
            <li className="nav-item mobile-only logout-bottom">
              <a className="nav-link" onClick={handleLogout}>
                Logout
              </a>
            </li>

            {/* Desktop profile button */}
            <li className="nav-item desktop-profile">
              <a className="nav-link btn btn-primary text-white ms-2" onClick={handleprofile}>
                <img className="pProfile" src={Image} alt="Profile" />
              </a>
            </li>
          </ul>
          {profileClicked && (
            <div className="pprofileDropdown">
              <NavLink className="dropdown-item" to="profile" onClick={handleMenuClose}>
                View Profile
              </NavLink>
              <hr />
              <NavLink className="dropdown-item" to="settings" onClick={handleMenuClose}>
                Settings
              </NavLink>
              <hr />
              <a className="dropdown-item" onClick={handleLogout}>
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
