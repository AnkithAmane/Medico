import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  KeyRound, Mail, Bell, LogOut, ShieldCheck, 
  Save, Smartphone, Edit3, X, Loader2, Lock 
} from 'lucide-react';
import './Patient_Settings.css';

export default function Patient_Settings() {
  const navigate = useNavigate();
  const [editPass, setEditPass] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  // User Context
  const user = JSON.parse(localStorage.getItem('userData')) || {};

  // Form States
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [emailSync, setEmailSync] = useState({ existingMail: user.email, newMail: '', password: '' });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/');
  };

  // Logic: Handle Email Change with Verification
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/auth/update-email/${user._id}`, 
        { 
          newEmail: emailSync.newMail, 
          password: emailSync.password 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        // Update local data
        const updatedUser = { ...user, email: emailSync.newMail };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        alert("Email synchronized successfully!");
        setEditEmail(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed. Check your password.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/auth/update-password/${user._id}`, 
        passwords,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        alert("Password updated!");
        setEditPass(false);
        setPasswords({ currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pat_set_container">
      <div className="pat_set_grid">
        
        <div className="pat_set_main">
          <div className="pat_set_title_area">
            <h1>Portal <span>Settings</span></h1>
            <p>Manage your clinical security and notification preferences.</p>
          </div>

          <div className="pat_set_bento">
            
            {/* Password Update Card */}
            <form className={`pat_set_card pat_set_span_2 ${editPass ? 'editing' : ''}`} onSubmit={handlePasswordUpdate}>
              <div className="pat_set_card_header">
                <div className="pat_set_h_left"><KeyRound size={18} /> <h3>Password Update</h3></div>
                <button type="button" className={`pat_set_edit_toggle ${editPass ? 'cancel' : ''}`} onClick={() => setEditPass(!editPass)}>
                  {editPass ? <X size={14} /> : <Edit3 size={14} />} {editPass ? 'Cancel' : 'Update'}
                </button>
              </div>
              <div className="pat_set_form_grid">
                <div className="pat_set_field">
                  <label>Current Password</label>
                  <input type="password" required={editPass} disabled={!editPass} value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} />
                </div>
                <div className="pat_set_field">
                  <label>New Password</label>
                  <input type="password" required={editPass} disabled={!editPass} value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} />
                </div>
              </div>
              {editPass && <button type="submit" className="pat_set_inner_save" disabled={loading}>{loading ? <Loader2 className="spinner" size={14}/> : <Save size={14}/>} Save Password</button>}
            </form>

            {/* Email Synchronization Card - UPDATED WITH PASSWORD VERIFICATION */}
            <form className={`pat_set_card ${editEmail ? 'editing_wide' : ''}`} onSubmit={handleEmailUpdate}>
              <div className="pat_set_card_header">
                <div className="pat_set_h_left"><Mail size={18} /> <h3>Email Sync</h3></div>
                <button type="button" className={`pat_set_edit_toggle ${editEmail ? 'cancel' : ''}`} onClick={() => setEditEmail(!editEmail)}>
                  {editEmail ? <X size={14} /> : <Edit3 size={14} />} {editEmail ? 'Cancel' : 'Change Mail'}
                </button>
              </div>

              <div className="pat_set_field">
                <label>Existing Email</label>
                <input type="email" value={emailSync.existingMail} disabled className="pat_set_input_readonly" />
              </div>

              {editEmail && (
                <div className="pat_set_verify_area">
                  <div className="pat_set_field">
                    <label>New Email Address</label>
                    <input type="email" required placeholder="Enter new email" value={emailSync.newMail} onChange={(e) => setEmailSync({...emailSync, newMail: e.target.value})} />
                  </div>
                  <div className="pat_set_field">
                    <label><Lock size={12}/> Confirm with Password</label>
                    <input type="password" required placeholder="Verify identity" value={emailSync.password} onChange={(e) => setEmailSync({...emailSync, password: e.target.value})} />
                  </div>
                  <button type="submit" className="pat_set_inner_save" disabled={loading}>
                    {loading ? <Loader2 className="spinner" size={14}/> : <Save size={14}/>} Verify & Update
                  </button>
                </div>
              )}
            </form>

            {/* Notification Matrix */}
            <div className="pat_set_card pat_set_span_3">
              <div className="pat_set_card_header">
                <div className="pat_set_h_left"><Bell size={18} /> <h3>Alert Channels</h3></div>
              </div>
              <div className="pat_set_matrix">
                {[
                  { title: "Document Downloads", desc: "Notification when lab reports are ready." },
                  { title: "Next Appointment", desc: "Reminders for your consultations." }
                ].map((item, i) => (
                  <div key={i} className="pat_set_notif_row">
                    <div className="notif_text"><strong>{item.title}</strong><span>{item.desc}</span></div>
                    <label className="pat_set_switch"><input type="checkbox" defaultChecked /><span className="pat_set_slider"></span></label>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <aside className="pat_set_sidebar">
          <div className="pat_set_card pat_set_status_widget">
            <div className="pat_set_icon_circle"><ShieldCheck size={28} /></div>
            <h3>Verified Identity</h3>
            <p>Access secured with 256-bit encryption.</p>
          </div>

          <div className="pat_set_card pat_set_logout_widget">
            <div className="pat_set_card_header">
              <div className="pat_set_h_left"><Smartphone size={16}/> <h3>Session</h3></div>
            </div>
            <button className="pat_set_logout_btn" onClick={handleLogout}>
              <LogOut size={16} /> Secure Logout
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}