import React, { useState } from 'react';
import { 
  KeyRound, Mail, Bell, LogOut, ShieldCheck, 
  Save, Smartphone, Edit3, X 
} from 'lucide-react';
import './Patient_Settings.css';

export default function Patient_Settings() {
  const [editPass, setEditPass] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

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
                  <input type="password" placeholder="••••••••" disabled={!editPass} />
                </div>
                <div className="pat_set_field">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" disabled={!editPass} />
                </div>
              </div>
              {editPass && <button className="pat_set_inner_save"><Save size={14}/> Save Password</button>}
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
                <input type="email" defaultValue="arjun.mehta@health.com" disabled={!editEmail} />
              </div>
              {editEmail && <button className="pat_set_inner_save"><Save size={14}/> Verify & Save</button>}
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
                  { title: "Document Downloads", desc: "Notification when lab reports/prescriptions are ready." },
                  { title: "Next Appointment", desc: "Reminders for your scheduled consultations." },
                  { title: "Appointment Completed", desc: "Summaries and digital billing alerts." }
                ].map((item, i) => (
                  <div key={i} className="pat_set_notif_row">
                    <div className="notif_text">
                      <strong>{item.title}</strong>
                      <span>{item.desc}</span>
                    </div>
                    <label className="pat_set_switch">
                      <input type="checkbox" defaultChecked />
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
              <div className="pat_set_h_left"><Smartphone size={16}/> <h3>Session</h3></div>
            </div>
            <p>Disconnect from this device.</p>
            <button className="pat_set_logout_btn" onClick={() => window.location.href = '/'}>
              <LogOut size={16} /> Logout Option
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}