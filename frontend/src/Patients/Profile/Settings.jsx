import React, { useState } from "react";
import { FaBell, FaMoon, FaSun, FaLanguage, FaShieldAlt, FaPalette } from "react-icons/fa";
import "./Settings.css";
 
export default function Settings() {
  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });
 
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
 
  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
 
  return (
    <div className="settings_container">
      <div className="settings_header">
        <h3>Settings</h3>
        <p>Manage your account preferences and application settings</p>
      </div>
 
      <div className="settings_content">
        
        <div className="settings_section">
          <div className="section_header">
            <FaBell className="section_icon" />
            <h4>Notifications</h4>
          </div>
          <div className="settings_group">
            <div className="setting_item">
              <div className="setting_info">
                <label>Appointment Reminders</label>
                <span>Get notified about upcoming appointments</span>
              </div>
              <label className="toggle_switch">
                <input
                  type="checkbox"
                  checked={notifications.appointmentReminders}
                  onChange={() => handleNotificationChange('appointmentReminders')}
                />
                <span className="slider"></span>
              </label>
            </div>
 
            <div className="setting_item">
              <div className="setting_info">
                <label>Email Notifications</label>
                <span>Receive notifications via email</span>
              </div>
              <label className="toggle_switch">
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={() => handleNotificationChange('emailNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>
 
            <div className="setting_item">
              <div className="setting_info">
                <label>SMS Notifications</label>
                <span>Receive notifications via SMS</span>
              </div>
              <label className="toggle_switch">
                <input
                  type="checkbox"
                  checked={notifications.smsNotifications}
                  onChange={() => handleNotificationChange('smsNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>
 
            <div className="setting_item">
              <div className="setting_info">
                <label>Push Notifications</label>
                <span>Receive push notifications on your device</span>
              </div>
              <label className="toggle_switch">
                <input
                  type="checkbox"
                  checked={notifications.pushNotifications}
                  onChange={() => handleNotificationChange('pushNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
 
        
        <div className="settings_section">
          <div className="section_header">
            <FaPalette className="section_icon" />
            <h4>Appearance</h4>
          </div>
          <div className="settings_group">
            <div className="setting_item">
              <div className="setting_info">
                <label>Theme</label>
                <span>Choose your preferred theme</span>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="setting_select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>
 
      
        <div className="settings_section">
          <div className="section_header">
            <FaLanguage className="section_icon" />
            <h4>Language & Region</h4>
          </div>
          <div className="settings_group">
            <div className="setting_item">
              <div className="setting_info">
                <label>Language</label>
                <span>Select your preferred language</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="setting_select"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
        </div>
 
        
        <div className="settings_section">
          <div className="section_header">
            <FaShieldAlt className="section_icon" />
            <h4>Security & Privacy</h4>
          </div>
          <div className="settings_group">
            <button className="setting_button">Change Password</button>
            <button className="setting_button">Two-Factor Authentication</button>
            <button className="setting_button">Privacy Settings</button>
          </div>
        </div>
 
        
        <div className="settings_actions">
          <button className="save_btn">Save Changes</button>
          <button className="reset_btn">Reset to Default</button>
        </div>
      </div>
    </div>
  );
}