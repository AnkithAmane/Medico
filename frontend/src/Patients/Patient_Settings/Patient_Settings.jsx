import React, { useState, useEffect } from 'react';
import { 
  KeyRound, Mail, Bell, LogOut, ShieldCheck, 
  Save, Smartphone, Edit3, X 
} from 'lucide-react';
import './Patient_Settings.css';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axios';

export default function Patient_Settings() {
  const { user, logout } = useAuth()

  const [editPass, setEditPass] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [saving, setSaving] = useState(false)

  // Password form
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: ''
  })

  // Email form
  const [email, setEmail] = useState('')

  // Notification settings
  const [notifications, setNotifications] = useState({
    documentDownloads: true,
    nextAppointment: true,
    appointmentCompleted: true
  })

  // Load user data
  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
    }
  }, [user])

  // Load notification settings from patient profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      try {
        const res = await axiosInstance.get(`/patients/${user._id}`)
        const profile = res.data.data
        if (profile?.notifications) {
          setNotifications(profile.notifications)
        }
      } catch (err) {
        console.error('Failed to load settings')
      }
    }
    fetchProfile()
  }, [user])

  // Save password
  const handleSavePassword = async () => {
    if (!passData.currentPassword || !passData.newPassword) {
      alert('Please fill in both password fields')
      return
    }
    if (passData.newPassword.length < 6) {
      alert('New password must be at least 6 characters')
      return
    }
    try {
      setSaving(true)
      await axiosInstance.put(`/auth/update-password`, {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      })
      setEditPass(false)
      setPassData({ currentPassword: '', newPassword: '' })
      alert('Password updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  // Save email
  const handleSaveEmail = async () => {
    if (!email) {
      alert('Please enter an email')
      return
    }
    try {
      setSaving(true)
      await axiosInstance.put(`/auth/update-email`, { email })
      setEditEmail(false)
      alert('Email updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update email')
    } finally {
      setSaving(false)
    }
  }

  // Save notification settings
  const handleNotificationChange = async (key, value) => {
    const updated = { ...notifications, [key]: value }
    setNotifications(updated)
    try {
      await axiosInstance.put(`/patients/${user._id}`, {
        notifications: updated
      })
    } catch (err) {
      console.error('Failed to save notification settings')
    }
  }

  // Logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <div className="pat_set_container">
      <div className="pat_set_grid">
        
        {/* Main Settings Panel */}
        <div className="pat_set_main">
          <div className="pat_set_title_area">
            <h1>Portal <span>Settings</span></h1>
            <p>Manage your clinical security and notification preferences.</p>
          </div>

          <div className="pat_set_bento">
            
            {/* Password Configuration */}
            <div className={`pat_set_card pat_set_span_2 ${editPass ? 'editing' : ''}`}>
              <div className="pat_set_card_header">
                <div className="pat_set_h_left">
                  <KeyRound size={18} />
                  <h3>Password Update</h3>
                </div>
                <button 
                  className={`pat_set_edit_toggle ${editPass ? 'cancel' : ''}`} 
                  onClick={() => setEditPass(!editPass)}
                >
                  {editPass ? <X size={14} /> : <Edit3 size={14} />}
                  {editPass ? 'Cancel' : 'Update'}
                </button>
              </div>
              <div className="pat_set_form_grid">
                <div className="pat_set_field">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    disabled={!editPass}
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                  />
                </div>
                <div className="pat_set_field">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password" 
                    disabled={!editPass}
                    value={passData.newPassword}
                    onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  />
                </div>
              </div>
              {editPass && (
                <button 
                  className="pat_set_inner_save"
                  onClick={handleSavePassword}
                  disabled={saving}
                >
                  <Save size={14}/> {saving ? 'Saving...' : 'Save Password'}
                </button>
              )}
            </div>

            {/* Email Synchronization */}
            <div className={`pat_set_card ${editEmail ? 'editing' : ''}`}>
              <div className="pat_set_card_header">
                <div className="pat_set_h_left">
                  <Mail size={18} />
                  <h3>Email Sync</h3>
                </div>
                <button 
                  className={`pat_set_edit_toggle ${editEmail ? 'cancel' : ''}`} 
                  onClick={() => setEditEmail(!editEmail)}
                >
                  {editEmail ? <X size={14} /> : <Edit3 size={14} />}
                </button>
              </div>
              <div className="pat_set_field">
                <label>Primary Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editEmail} 
                />
              </div>
              {editEmail && (
                <button 
                  className="pat_set_inner_save"
                  onClick={handleSaveEmail}
                  disabled={saving}
                >
                  <Save size={14}/> {saving ? 'Saving...' : 'Verify & Save'}
                </button>
              )}
            </div>

            {/* Notification Preferences */}
            <div className="pat_set_card pat_set_span_3">
              <div className="pat_set_card_header">
                <div className="pat_set_h_left">
                  <Bell size={18} />
                  <h3>Alert Channels</h3>
                </div>
                <span className="pat_set_live_tag">Live Sync</span>
              </div>
              <div className="pat_set_matrix">
                {[
                  { 
                    key: 'documentDownloads',
                    title: "Document Downloads", 
                    desc: "Notification when lab reports/prescriptions are ready." 
                  },
                  { 
                    key: 'nextAppointment',
                    title: "Next Appointment", 
                    desc: "Reminders for your scheduled consultations." 
                  },
                  { 
                    key: 'appointmentCompleted',
                    title: "Appointment Completed", 
                    desc: "Summaries and digital billing alerts." 
                  }
                ].map((item) => (
                  <div key={item.key} className="pat_set_notif_row">
                    <div className="notif_text">
                      <strong>{item.title}</strong>
                      <span>{item.desc}</span>
                    </div>
                    <label className="pat_set_switch">
                      <input 
                        type="checkbox" 
                        checked={notifications[item.key]}
                        onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                      />
                      <span className="pat_set_slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Session Sidebar */}
        <aside className="pat_set_sidebar">
          <div className="pat_set_card pat_set_status_widget">
            <div className="pat_set_icon_circle"><ShieldCheck size={28} /></div>
            <h3>Verified Identity</h3>
            <p>Your portal access is secured with 256-bit encryption.</p>
          </div>

          <div className="pat_set_card pat_set_logout_widget">
            <div className="pat_set_card_header">
              <div className="pat_set_h_left">
                <Smartphone size={16}/> 
                <h3>Session</h3>
              </div>
            </div>
            <p>Disconnect from this device.</p>
            <button className="pat_set_logout_btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout Option
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}