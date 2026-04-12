import React, { useState } from "react";
import { 
  FiUser, FiDownload, FiFileText, 
  FiUploadCloud, FiActivity, FiTerminal, FiClock 
} from "react-icons/fi";
import "./Doctor_Settings.css";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="doc_set_wrapper doc_set_page_fade_in">
      
      {/* 1. SECTION HEADER */}
      <header className="doc_set_header">
        <div className="doc_set_header_text">
          <h1>System <span>Governance</span></h1>
          <p>Clinical Environment Configuration • Version 2.0.4</p>
        </div>
        <div className="doc_set_header_badges">
            <span className="doc_set_status_pill_active">System Online</span>
        </div>
      </header>

      <div className="doc_set_grid">
        
        {/* 2. TABBED NAVIGATION SIDEBAR */}
        <aside className="doc_set_sidebar">
          <nav>
            <button className={activeTab === "profile" ? "doc_set_active" : ""} onClick={() => setActiveTab("profile")}>
              <FiUser className="doc_set_nav_icon" />
              <span>Identity & Bio</span>
            </button>
            <button className={activeTab === "analytics" ? "doc_set_active" : ""} onClick={() => setActiveTab("analytics")}>
              <FiActivity className="doc_set_nav_icon" />
              <span>Performance Alerts</span>
            </button>
            <button className={activeTab === "data" ? "doc_set_active" : ""} onClick={() => setActiveTab("data")}>
              <FiDownload className="doc_set_nav_icon" />
              <span>Export Registry</span>
            </button>
          </nav>
        </aside>

        {/* 3. DYNAMIC CONTENT WORKSPACE */}
        <main className="doc_set_content">
          
          {/* PROFILE CONFIGURATION */}
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
                    <textarea placeholder="Briefly describe your clinical background..." rows="4"></textarea>
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
                 <button className="doc_set_btn_primary">Save Profile Changes</button>
              </div>
            </div>
          )}

          {/* ANALYTICS & ALERTS */}
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
                        <input type="checkbox" defaultChecked />
                        <span className="doc_set_slider doc_set_round"></span>
                    </label>
                  </div>
                  <div className="doc_set_toggle_item">
                    <div className="doc_set_toggle_text">
                        <strong>Daily Digest Delivery</strong>
                        <span>Send automated summary at start of shift</span>
                    </div>
                    <label className="doc_set_switch">
                        <input type="checkbox" />
                        <span className="doc_set_slider doc_set_round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DATA EXPORT CENTER */}
          {activeTab === "data" && (
            <div className="doc_set_tab_view doc_set_fade_in">
              <div className="doc_set_card doc_set_span_full">
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
                    <button className="doc_set_btn_minimal">Generate</button>
                  </div>
                  <div className="doc_set_export_node">
                    <div className="doc_set_node_info">
                        <FiActivity className="doc_set_node_icon" />
                        <div>
                            <strong>Performance Matrix</strong>
                            <p>Annual data • PDF format</p>
                        </div>
                    </div>
                    <button className="doc_set_btn_minimal">Generate</button>
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