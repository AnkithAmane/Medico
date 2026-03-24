import React from 'react';
import { Menu, LogOut, Settings, Bell, Heart } from 'lucide-react';
import '../../styles/TopNavbar.css';

const TopNavbar = ({ onToggleSidebar }) => {
  return (
    <div className="top-navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Left Section */}
          <div className="navbar-left">
            <button
              className="toggle-btn"
              onClick={onToggleSidebar}
            >
              <Menu size={28} />
            </button>
          </div>

          {/* Center Section - Branding */}
          <div className="navbar-center">
            <div className="navbar-brand">
              <Heart size={20} className="brand-icon" />
              <span className="brand-text">Medico Healthcare Management</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="navbar-right">
            <button
              className="navbar-icon-btn navbar-notification"
            >
              <Bell size={24} />
              <span className="notification-badge">3</span>
            </button>

            <button
              className="navbar-icon-btn"
            >
              <Settings size={24} />
            </button>

            <div className="navbar-divider"></div>

            <div className="user-profile">
              <div className="profile-avatar">A</div>
              <div className="profile-info">
                <p className="profile-name">Admin</p>
                <p className="profile-role">Administrator</p>
              </div>
            </div>

            <button className="logout-btn">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
