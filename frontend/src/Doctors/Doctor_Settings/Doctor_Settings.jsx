import React, { useState, useEffect } from "react";
import { 
  FiUser, FiDownload, FiFileText, 
  FiUploadCloud, FiActivity 
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axios";
import "./Doctor_Settings.css";

export default function Settings() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("profile");
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [saving, setSaving] = useState(false)

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: ''
  })

  // Bio state
  const [bio, setBio] = useState('')

  // Notification toggles
  const [alerts, setAlerts] = useState({
    satisfactionFloor: true,
    dailyDigest: false
  })

  // Fetch doctor profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      try {
        const res = await axiosInstance.get(`/doctors/user/${user._id}`)
        const doctor = res.data.data
        setDoctorProfile(doctor)
        setBio(doctor.bio || '')
      } catch (err) {
        console.error('Failed to load settings')
      }
    }
    fetchProfile()
  }, [user])

  // Save bio
  const handleSaveBio = async () => {
    try {
      setSaving(true)
      await axiosInstance.put(`/doctors/${doctorProfile._id}`, { bio })
      alert('Profile updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

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
      await axiosInstance.put('/auth/update-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      })
      setPassData({ currentPassword: '', newPassword: '' })
      alert('Password updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  // Export data
  const handleExport = (type) => {
    alert(`${type} export will be available soon!`)
  }

  return (
    <div className="doc_set_wrapper doc_set_page_fade_in">
      
      {/* Header */}
      <header className="doc_set_header">
        <div className="doc_set_header_text">
          <h1>System <span>Governance</span></h1>
          <p>Clinical Environment Configuration • {doctorProfile?.name}</p>
        </div>
        <div className="doc_set_header_badges">
          <span className="doc_set_status_pill_active">System Online</span>
        </div>
      </header>

      {/* Grid */}
      <div className="doc_set_grid">
        
        {/* Sidebar Tabs */}
        <aside className="doc_set_sidebar">
          <nav>
            <button 
              className={activeTab === "profile" ? "doc_set_active" : ""} 
              onClick={() => setActiveTab("profile")}
            >
              <FiUser className="doc_set_nav_icon" />
              <span>Identity & Bio</span>
            </button>
            <button 
              className={activeTab === "security" ? "doc_set_active" : ""} 
              onClick={() => setActiveTab("security")}
            >
              <FiActivity className="doc_set_nav_icon" />
              <span>Security</span>
            </button>
            <button 
              className={activeTab === "analytics" ? "doc_set_active" : ""} 
              onClick={() => setActiveTab("analytics")}
            >
              <FiActivity className="doc_set_nav_icon" />
              <span>Performance Alerts</span>
            </button>
            <button 
              className={activeTab === "data" ? "doc_set_active" : ""} 
              onClick={() => setActiveTab("data")}
            >
              <FiDownload className="doc_set_nav_icon" />
              <span>Export Registry</span>
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="doc_set_content">

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="doc_set_tab_view doc_set_fade_in">
              <div className="doc_set_card">
                <div className="doc_set_card_title_node">
                  <h3>Bio & Specialty Tags</h3>
                  <p>Configure how your profile appears in the global directory.</p>
                </div>
                <div className="doc_set_form_stack">
                  <div className="doc_set_input_node">
                    <label>Professional Summary</label>
                    <textarea 
                      placeholder="Briefly describe your clinical background..." 
                      rows="4"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="doc_set_card">
                <div className="doc_set_card_title_node">
                  <h3>Digital Signature</h3>
                  <p>This signature will be appended to all electronic prescriptions.</p>
                </div>
                <div className="doc_set_upload_container">
                  <div className="doc_set_upload_inner">
                    <FiUploadCloud className="doc_set_upload_icon" />
                    <strong>Upload Signature Path</strong>
                    <span>SVG, PNG or JPG (Max 500kb)</span>
                    <button className="doc_set_btn_ghost">Browse Files</button>
                  </div>
                </div>
              </div>
              
              <div className="doc_set_action_footer">
                <button 
                  className="doc_set_btn_primary"
                  onClick={handleSaveBio}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="doc_set_tab_view doc_set_fade_in">
              <div className="doc_set_card">
                <div className="doc_set_card_title_node">
                  <h3>Change Password</h3>
                  <p>Update your clinical portal access credentials.</p>
                </div>
                <div className="doc_set_form_stack">
                  <div className="doc_set_input_node">
                    <label>Current Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={passData.currentPassword}
                      onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                      style={{
                        width: '100%', padding: '14px 18px',
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '12px', fontFamily: 'inherit',
                        fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                  </div>
                  <div className="doc_set_input_node">
                    <label>New Password</label>
                    <input 
                      type="password"
                      placeholder="Enter new password"
                      value={passData.newPassword}
                      onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                      style={{
                        width: '100%', padding: '14px 18px',
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '12px', fontFamily: 'inherit',
                        fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="doc_set_action_footer">
                <button 
                  className="doc_set_btn_primary"
                  onClick={handleSavePassword}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="doc_set_tab_view doc_set_fade_in">
              <div className="doc_set_card">
                <div className="doc_set_card_title_node">
                  <h3>Threshold Alerts</h3>
                  <p>System notifications triggered by clinical performance drops.</p>
                </div>
                <div className="doc_set_toggle_list">
                  <div className="doc_set_toggle_item">
                    <div className="doc_set_toggle_text">
                      <strong>Patient Satisfaction Floor</strong>
                      <span>Notify if average rating falls below 4.8</span>
                    </div>
                    <label className="doc_set_switch">
                      <input 
                        type="checkbox" 
                        checked={alerts.satisfactionFloor}
                        onChange={(e) => setAlerts({...alerts, satisfactionFloor: e.target.checked})}
                      />
                      <span className="doc_set_slider doc_set_round"></span>
                    </label>
                  </div>
                  <div className="doc_set_toggle_item">
                    <div className="doc_set_toggle_text">
                      <strong>Daily Digest Delivery</strong>
                      <span>Send automated summary at start of shift</span>
                    </div>
                    <label className="doc_set_switch">
                      <input 
                        type="checkbox"
                        checked={alerts.dailyDigest}
                        onChange={(e) => setAlerts({...alerts, dailyDigest: e.target.checked})}
                      />
                      <span className="doc_set_slider doc_set_round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === "data" && (
            <div className="doc_set_tab_view doc_set_fade_in">
              <div className="doc_set_card">
                <div className="doc_set_card_title_node">
                  <h3>Secure Export Center</h3>
                  <p>Generate and download encrypted clinical data reports.</p>
                </div>
                <div className="doc_set_export_grid">
                  <div className="doc_set_export_node">
                    <div className="doc_set_node_info">
                      <FiFileText className="doc_set_node_icon" />
                      <div>
                        <strong>Patient Registry</strong>
                        <p>Full history • CSV format</p>
                      </div>
                    </div>
                    <button 
                      className="doc_set_btn_minimal"
                      onClick={() => handleExport('Patient Registry')}
                    >
                      Generate
                    </button>
                  </div>
                  <div className="doc_set_export_node">
                    <div className="doc_set_node_info">
                      <FiActivity className="doc_set_node_icon" />
                      <div>
                        <strong>Performance Matrix</strong>
                        <p>Annual data • PDF format</p>
                      </div>
                    </div>
                    <button 
                      className="doc_set_btn_minimal"
                      onClick={() => handleExport('Performance Matrix')}
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}