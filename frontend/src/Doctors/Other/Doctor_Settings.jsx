import React, { useState } from "react";
import { 
  FiUser, FiShield, FiBell, FiDownload, FiFileText, 
  FiUploadCloud, FiActivity, FiLock, FiTerminal, FiCheckCircle, FiClock 
} from "react-icons/fi";
import "./Doctor_Settings.css";

export default function Settings() {
  // --- STATE ENGINE ---
  const [activeTab, setActiveTab] = useState("profile");

  // --- MOCK REGISTRY DATA ---
  const auditLogs = [
    { id: 1, action: "Secure Login", time: "2026-04-07 09:12 AM", status: "Verified" },
    { id: 2, action: "Registry Export", time: "2026-04-06 04:30 PM", status: "Success" },
    { id: 3, action: "API Key Rotated", time: "2026-04-05 11:20 AM", status: "Internal" },
  ];

  return (
    <div className="sa_settings_wrapper med_page_fade_in">
      
      {/* 1. SECTION HEADER */}
      <header className="sa_settings_header">
        <div className="sa_header_text">
          <h1>System <span>Governance</span></h1>
          <p>Clinical Environment Configuration • Version 2.0.4</p>
        </div>
        <div className="sa_header_badges">
            <span className="status_pill_active">System Online</span>
        </div>
      </header>

      <div className="sa_settings_grid">
        
        {/* 2. TABBED NAVIGATION SIDEBAR */}
        <aside className="sa_settings_sidebar">
          <nav>
            <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
              <FiUser className="nav_icon" />
              <span>Identity & Bio</span>
            </button>
            <button className={activeTab === "analytics" ? "active" : ""} onClick={() => setActiveTab("analytics")}>
              <FiActivity className="nav_icon" />
              <span>Performance Alerts</span>
            </button>
            <button className={activeTab === "data" ? "active" : ""} onClick={() => setActiveTab("data")}>
              <FiDownload className="nav_icon" />
              <span>Export Registry</span>
            </button>
            <button className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}>
              <FiShield className="nav_icon" />
              <span>Governance Logs</span>
            </button>
          </nav>
        </aside>

        {/* 3. DYNAMIC CONTENT WORKSPACE */}
        <main className="sa_settings_content">
          
          {/* PROFILE CONFIGURATION */}
          {activeTab === "profile" && (
            <div className="sa_tab_view fade_in">
              <div className="sa_settings_card">
                <div className="card_title_node">
                    <h3>Bio & Specialty Tags</h3>
                    <p>Configure how your profile appears in the global directory.</p>
                </div>
                <div className="sa_form_stack">
                  <div className="sa_input_node">
                    <label>Professional Summary</label>
                    <textarea placeholder="Briefly describe your clinical background..." rows="4"></textarea>
                  </div>
                  <div className="sa_input_node">
                    <label>Departmental Expertise</label>
                    <input type="text" placeholder="e.g. Neurology, Pediatric Surgery" />
                  </div>
                </div>
              </div>

              <div className="sa_settings_card">
                <div className="card_title_node">
                    <h3>Digital Signature</h3>
                    <p>This signature will be appended to all electronic prescriptions.</p>
                </div>
                <div className="sa_upload_container">
                  <div className="sa_upload_inner">
                    <FiUploadCloud className="upload_icon" />
                    <strong>Upload Signature Path</strong>
                    <span>SVG, PNG or JPG (Max 500kb)</span>
                    <button className="sa_btn_ghost">Browse Files</button>
                  </div>
                </div>
              </div>
              <div className="sa_action_footer">
                 <button className="med_btn_primary">Save Profile Changes</button>
              </div>
            </div>
          )}

          {/* ANALYTICS & ALERTS */}
          {activeTab === "analytics" && (
            <div className="sa_tab_view fade_in">
              <div className="sa_settings_card">
                <div className="card_title_node">
                    <h3>Threshold Alerts</h3>
                    <p>System notifications triggered by clinical performance drops.</p>
                </div>
                <div className="sa_toggle_list">
                  <div className="sa_toggle_item">
                    <div className="toggle_text">
                        <strong>Patient Satisfaction Floor</strong>
                        <span>Notify if average rating falls below 4.8</span>
                    </div>
                    <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="sa_toggle_item">
                    <div className="toggle_text">
                        <strong>Daily Digest Delivery</strong>
                        <span>Send automated summary at start of shift</span>
                    </div>
                    <label className="switch">
                        <input type="checkbox" />
                        <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="sa_settings_card">
                <div className="card_title_node">
                    <h3>Delivery Schedule</h3>
                </div>
                <div className="sa_time_selector">
                    <FiClock />
                    <select className="sa_select_native">
                        <option>06:00 AM</option>
                        <option>08:00 AM</option>
                        <option>10:00 AM</option>
                    </select>
                    <span>Central Standard Time</span>
                </div>
              </div>
            </div>
          )}

          {/* DATA EXPORT CENTER */}
          {activeTab === "data" && (
            <div className="sa_tab_view fade_in">
              <div className="sa_settings_card span_full">
                <div className="card_title_node">
                    <h3>Secure Export Center</h3>
                    <p>Generate and download encrypted clinical data reports.</p>
                </div>
                <div className="sa_export_grid">
                  <div className="sa_export_node">
                    <div className="node_info">
                        <FiFileText className="node_icon" />
                        <div>
                            <strong>Patient Registry</strong>
                            <p>Full history • CSV format</p>
                        </div>
                    </div>
                    <button className="sa_btn_minimal">Generate</button>
                  </div>
                  <div className="sa_export_node">
                    <div className="node_info">
                        <FiActivity className="node_icon" />
                        <div>
                            <strong>Performance Matrix</strong>
                            <p>Annual data • PDF format</p>
                        </div>
                    </div>
                    <button className="sa_btn_minimal">Generate</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY & GOVERNANCE */}
          {activeTab === "security" && (
            <div className="sa_tab_view fade_in">
              <div className="sa_settings_card">
                <div className="card_title_node">
                    <h3>Audit Registry</h3>
                    <p>Immutable log of clinical data access and system modifications.</p>
                </div>
                <div className="sa_audit_container">
                  <table className="sa_clean_table">
                    <thead>
                      <tr><th>Event Action</th><th>Logged Time</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id}>
                          <td className="bold_cell"><FiTerminal className="tbl_icon" /> {log.action}</td>
                          <td className="time_cell">{log.time}</td>
                          <td><span className="success_pill">{log.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}