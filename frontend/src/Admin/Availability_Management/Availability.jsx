import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, ArrowLeftRight, Search, Download, 
  AlertTriangle, Clock, Stethoscope, CheckCircle2, 
  ChevronLeft, ChevronRight, Calendar as CalIcon, X,
  User, Briefcase, Zap, FileText, Plus, Bell, Check, 
  TrendingUp, Users, ArrowRight
} from "lucide-react";
import "./Availability.css";

// --- 1. MOCK DATA CONFIGURATION ---
const doctorPool = [
  { id: "D001", name: "Dr. Ramesh Babu", dept: "Cardiology", load: 8, photo: "https://i.pravatar.cc/150?u=d1" },
  { id: "D002", name: "Dr. Sneha Reddy", dept: "Neurology", load: 4, photo: "https://i.pravatar.cc/150?u=d4" },
  { id: "D003", name: "Dr. Priya V", dept: "Orthopedics", load: 2, photo: "https://i.pravatar.cc/150?u=d2" },
  { id: "D004", name: "Dr. Arjun Singh", dept: "General", load: 12, photo: "https://i.pravatar.cc/150?u=d3" },
  { id: "D005", name: "Dr. Meera Nair", dept: "Cardiology", load: 1, photo: "https://i.pravatar.cc/150?u=d6" },
];

export default function AvailabilityManagement() {
  // --- 2. STATE ENGINE ---
  const [selectedReq, setSelectedReq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [requests, setRequests] = useState([
    { id: "REQ-9921", docId: "D001", doctor: "Dr. Ramesh Babu", dept: "Cardiology", type: "Session Leave", date: "2026-04-10", appointments: 4, status: "Pending", priority: "High", reason: "Medical Summit Presentation", patients: ["Amit Sharma", "Sana Sheikh", "Rajesh V.", "Kunal K."] },
    { id: "REQ-9922", docId: "D003", doctor: "Dr. Priya V", dept: "Orthopedics", type: "Full Day", date: "2026-04-11", appointments: 0, status: "Pending", priority: "Normal", reason: "Personal Maintenance", patients: [] },
    { id: "REQ-9923", docId: "D004", doctor: "Dr. Arjun Singh", dept: "General", type: "Emergency", date: "2026-04-05", appointments: 3, status: "Pending", priority: "Critical", reason: "Urgent Family Matter", patients: ["Vikram Singh", "Ananya Iyer", "Rahul D."] },
  ]);

  // --- 3. REASSIGNMENT INTELLIGENCE ---
  const findReplacement = (dept, currentId) => {
    return doctorPool
      .filter(d => d.dept === dept && d.id !== currentId)
      .sort((a, b) => a.load - b.load)[0] || null;
  };

  const handleDecision = (id, newStatus) => {
    const req = requests.find(r => r.id === id);
    let proxy = null;
    
    if (newStatus === "Approved" && req.appointments > 0) {
        proxy = findReplacement(req.dept, req.docId)?.name;
        newStatus = "Reassigned";
    }
    
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, assignedTo: proxy } : r));
    setSelectedReq(null);
  };

  // --- 4. FILTERING LOGIC ---
  const filtered = useMemo(() => {
    return requests.filter(r => 
      r.doctor.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (activeTab === "All" || r.status === activeTab)
    );
  }, [requests, searchTerm, activeTab]);

  return (
    <div className="medico_av_container">
      
      {/* GLOBAL HEADER */}
      <header className="medico_av_header">
        <div className="branding">
          <div className="icon_blob"><ShieldCheck size={26} color="#fff" fill="rgba(255,255,255,0.2)" /></div>
          <div>
            <h1>Leave <span>Management</span></h1>
            <p>{selectedReq ? `Analytics for ${selectedReq.id}` : "Specialist Availability & Load Redistribution"}</p>
          </div>
        </div>
        
        {!selectedReq && (
          <div className="header_tools">
            <div className="med_search_wrapper">
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Search Specialists..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button className="btn_notif"><Bell size={20} /></button>
            <button className="btn_add_elite"><Plus size={18} /> New Request</button>
          </div>
        )}
      </header>

      {!selectedReq ? (
        /* --- VIEW 1: DASHBOARD --- */
        <div className="view_fade_in">
          <section className="av_stat_grid">
            <div className="stat_tile glass ">
                <div className="tile_icon"><Users size={20}/></div>
                <div className="tile_txt"><h3>{doctorPool.length}</h3><p>Active Staff</p></div>
            </div>
            <div className="stat_tile glass ">
                <div className="tile_icon"><Clock size={20}/></div>
                <div className="tile_txt"><h3>{requests.filter(r=>r.status==="Pending").length}</h3><p>Pending Review</p></div>
            </div>
            <div className="stat_tile glass ">
                <div className="tile_icon"><ArrowLeftRight size={20}/></div>
                <div className="tile_txt"><h3>{requests.filter(r=>r.status==="Reassigned").length}</h3><p>Shifted Slots</p></div>
            </div>
            <div className="stat_tile glass ">
                <div className="tile_icon"><TrendingUp size={20}/></div>
                <div className="tile_txt"><h3>98%</h3><p>Load Balance</p></div>
            </div>
          </section>

          <div className="grid_control_bar">
            <div className="tab_group_elite">
              {["All", "Pending", "Approved", "Reassigned"].map(tab => (
                <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
              ))}
            </div>
            <button className="btn_export_csv"><Download size={14}/> Export Logs</button>
          </div>

          <div className="av_specialist_grid_elite">
            {filtered.map(req => (
              <div key={req.id} className={`av_glass_card ${req.status.toLowerCase()}`} onClick={() => setSelectedReq(req)}>
                <div className="card_header_flex">
                  <span className="id_badge">{req.id}</span>
                  <div className={`status_indicator ${req.priority.toLowerCase()}`}></div>
                </div>
                <div className="spec_identity">
                  <div className="avatar_circle">{req.doctor[4]}</div>
                  <div className="name_stack">
                    <strong>{req.doctor}</strong>
                    <span>{req.dept} Wing</span>
                  </div>
                </div>
                <div className="spec_meta_grid">
                  <div className="meta_pill"><CalIcon size={12}/> {req.date}</div>
                  <div className="meta_pill"><Clock size={12}/> {req.type}</div>
                </div>
                <div className="conflict_box">
                   {req.appointments > 0 ? (
                       <p className="txt_conflict"><AlertTriangle size={14}/> {req.appointments} Bookings Impacted</p>
                   ) : <p className="txt_safe"><ShieldCheck size={14}/> Safe Schedule</p>}
                </div>
                <div className="card_footer_elite">
                   <span className={`pill_status_elite ${req.status.toLowerCase()}`}>{req.status}</span>
                   <button className="btn_circle_view"><ChevronRight size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* --- VIEW 2: ANALYTICS & REASSIGNMENT WORKSPACE --- */
        <div className="av_analytics_panel view_fade_in">
          <div className="panel_top_nav">
            <button className="btn_back_elite" onClick={() => setSelectedReq(null)}>
              <ChevronLeft size={20}/> Exit Analytics
            </button>
            <div className="panel_meta_id">Reference ID: <b>{selectedReq.id}</b></div>
          </div>

          <div className="analytics_workspace">
            {/* SPECIALIST PROFILE BENTO */}
            <div className="workspace_left">
              <div className="hero_profile_glass">
                <div className="avatar_large_elite">{selectedReq.doctor[4]}</div>
                <div className="hero_info_stack">
                  <h2>{selectedReq.doctor}</h2>
                  <span className="dept_pills">{selectedReq.dept} Consultant</span>
                  <div className="hero_badge_row">
                    <span className={`badge_prio ${selectedReq.priority.toLowerCase()}`}>{selectedReq.priority} Priority</span>
                    <span className="badge_type">{selectedReq.type}</span>
                  </div>
                </div>
              </div>

              <div className="details_bento">
                <div className="bento_item">
                  <label><CalIcon size={14}/> Effective Date</label>
                  <strong>{selectedReq.date}</strong>
                </div>
                <div className="bento_item">
                  <label><Clock size={14}/> Shift Period</label>
                  <strong>Morning Session</strong>
                </div>
                <div className="bento_item full">
                  <label><FileText size={14}/> Admin Rationale</label>
                  <p>{selectedReq.reason}</p>
                </div>
              </div>
            </div>

            {/* REASSIGNMENT ENGINE & IMPACT */}
            <div className="workspace_right">
              <div className="logic_card_glass">
                <div className="logic_head">
                    <h3><Zap size={18} color="#f59e0b" fill="#f59e0b" /> Reassignment Intelligence</h3>
                </div>
                
                {selectedReq.appointments > 0 ? (
                  <div className="logic_body">
                    <div className="visual_bridge">
                        <div className="bridge_node"><span>From</span><strong>{selectedReq.doctor.split(' ')[1]}</strong></div>
                        <div className="bridge_arrow"><ArrowRight size={24} color="#007acc" /></div>
                        <div className="bridge_node active"><span>To (Proxy)</span><strong>{findReplacement(selectedReq.dept, selectedReq.docId)?.name.split(' ')[1]}</strong></div>
                    </div>
                    <div className="proxy_stats_card">
                        <div className="s_row"><label>Assigned Proxy</label><span>{findReplacement(selectedReq.dept, selectedReq.docId)?.name}</span></div>
                        <div className="s_row"><label>Current Proxy Load</label><span>{findReplacement(selectedReq.dept, selectedReq.docId)?.load} Appointments</span></div>
                    </div>
                    <button className="btn_execute_shift" onClick={() => handleDecision(selectedReq.id, "Approved")}>
                      Commit Shift & Authorize
                    </button>
                  </div>
                ) : (
                  <div className="logic_safe_state">
                    <div className="safe_blob"><ShieldCheck size={50} color="#10b981"/></div>
                    <h4>Schedule Verified Safe</h4>
                    <p>No active bookings detected for {selectedReq.doctor} on this date. Approve leave directly.</p>
                    <button className="btn_execute_shift approve_direct" onClick={() => handleDecision(selectedReq.id, "Approved")}>
                        Authorize Leave
                    </button>
                  </div>
                )}
              </div>

              <div className="patient_impact_card_glass">
                <div className="p_head_flex">
                    <h3><User size={18}/> Impacted Bookings</h3>
                    <span className="p_count">{selectedReq.appointments} Patients</span>
                </div>
                <div className="impact_list_scroller">
                    {selectedReq.patients.length > 0 ? selectedReq.patients.map((p, i) => (
                        <div key={i} className="patient_impact_item">
                            <div className="p_avatar_init">{p.charAt(0)}</div>
                            <div className="p_details"><strong>{p}</strong><span>OPD Consultation</span></div>
                            <div className="p_status_tag">Reassigning...</div>
                        </div>
                    )) : <p className="p_empty_msg">No patients currently scheduled for this slot.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}