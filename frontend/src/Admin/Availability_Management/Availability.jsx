import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  ArrowLeftRight,
  Search,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
  X,
  User,
  Briefcase,
  Zap,
  FileText,
  Plus,
  ArrowRight,
  Users,
  Activity
} from "lucide-react";

import doctorsData from "../../Assets/Data/doctor.json";
import "./Availability.css";

export default function AvailabilityManagement() {
  const [showManualForm, setShowManualForm] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [requests, setRequests] = useState([
    {
      id: "REQ-9921",
      docId: "DOC-001",
      doctor: "Dr. Ramesh Babu",
      dept: "Cardiology",
      type: "Session Leave",
      date: "2026-04-10",
      appointments: 4,
      status: "Pending",
      priority: "High",
      reason: "Medical Summit Presentation",
      patients: ["Amit Sharma", "Sana Sheikh", "Rajesh V.", "Kunal K."],
      assignedTo: null
    },
    {
      id: "REQ-9923",
      docId: "DOC-004",
      doctor: "Dr. Sneha Reddy",
      dept: "Neurology",
      type: "Emergency",
      date: "2026-04-12",
      appointments: 3,
      status: "Pending",
      priority: "Critical",
      reason: "Urgent Family Matter",
      patients: ["Vikram Singh", "Ananya Iyer", "Rahul D."],
      assignedTo: null
    },
    {
      id: "REQ-1054",
      docId: "DOC-007",
      doctor: "Dr. Rajesh Khanna",
      dept: "Gastroenterology",
      type: "Full Day",
      date: "2026-04-15",
      appointments: 0,
      status: "Approved",
      priority: "Normal",
      reason: "Personal Maintenance",
      patients: [],
      assignedTo: null
    }
  ]);

  const findReplacement = (dept, currentDocId) => {
    if (!dept) return null;
    const candidates = doctorsData.filter(
      (d) =>
        d.department === dept &&
        d.id !== currentDocId &&
        d.availability === "Available"
    );

    if (candidates.length === 0) return null;

    return candidates.sort((a, b) => {
      const expA = parseInt(a.experience) || 0;
      const expB = parseInt(b.experience) || 0;
      return expB - expA;
    })[0];
  };

  const handleDecision = (id, newStatus) => {
    const req = requests.find((r) => r.id === id);
    let proxyName = null;

    if (newStatus === "Approved" && req.appointments > 0) {
      const replacement = findReplacement(req.dept, req.docId);
      proxyName = replacement ? replacement.name : "System Unassigned";
      newStatus = "Reassigned";
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: newStatus, assignedTo: proxyName } : r
      )
    );
    setSelectedReq(null);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const docId = formData.get("docId");
    const selectedDoc = doctorsData.find((d) => d.id === docId);

    if (!selectedDoc) {
      alert("Please select a valid medical specialist from the registry.");
      return;
    }

    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      docId: docId,
      doctor: selectedDoc.name,
      dept: selectedDoc.department,
      type: formData.get("type"),
      date: formData.get("date"),
      appointments: Math.floor(Math.random() * 8),
      status: "Pending",
      priority: formData.get("priority"),
      reason: formData.get("reason") || "Clinical Sabbatical",
      patients: [
        "Patient ID: #MS-882",
        "Patient ID: #MS-119",
        "Patient ID: #MS-043"
      ],
      assignedTo: null
    };

    setRequests([newRequest, ...requests]);
    setShowManualForm(false);
  };

  const filtered = useMemo(() => {
    return requests.filter(
      (r) =>
        (r.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.dept.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeTab === "All" || r.status === activeTab)
    );
  }, [requests, searchTerm, activeTab]);

  return (
    <div className="admin_avail_m_wrapper">
      <header className="admin_avail_m_header">
        <div className="admin_avail_m_branding">
          <h1 className="admin_avail_m_title_elite">
            Leave <span>Redistribution</span>
          </h1>
          <p className="admin_avail_m_subtitle">
            {selectedReq
              ? `Analytics for ${selectedReq.doctor} [ID: ${selectedReq.id}]`
              : "Specialist Availability Impact & Clinical Load Balancing"}
          </p>
        </div>

        {!selectedReq && (
          <div className="admin_avail_m_action_group">
            <div className="admin_avail_m_search_box">
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search requests or specialists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="admin_avail_m_btn_primary"
              onClick={() => setShowManualForm(true)}
            >
              <Plus size={18} /> Log Manual Leave
            </button>
          </div>
        )}
      </header>

      {!selectedReq ? (
        <div className="admin_avail_m_fade_in">
          <section className="admin_avail_m_stat_grid">
            <div className="admin_avail_m_stat_tile">
              <div className="admin_avail_m_tile_icon">
                <Users size={20} />
              </div>
              <div className="admin_avail_m_tile_txt">
                <h3>{doctorsData.length}</h3>
                <p>Clinical Registry</p>
              </div>
            </div>
            <div className="admin_avail_m_stat_tile">
              <div
                className="admin_avail_m_tile_icon"
                style={{ color: "#f59e0b" }}
              >
                <Clock size={20} />
              </div>
              <div className="admin_avail_m_tile_txt">
                <h3>{requests.filter((r) => r.status === "Pending").length}</h3>
                <p>Pending Review</p>
              </div>
            </div>
            <div className="admin_avail_m_stat_tile">
              <div
                className="admin_avail_m_tile_icon"
                style={{ color: "#22c55e" }}
              >
                <ArrowLeftRight size={20} />
              </div>
              <div className="admin_avail_m_tile_txt">
                <h3>
                  {requests.filter((r) => r.status === "Reassigned").length}
                </h3>
                <p>Active Proxy Shifts</p>
              </div>
            </div>
            <div className="admin_avail_m_stat_tile">
              <div
                className="admin_avail_m_tile_icon"
                style={{ color: "#007acc" }}
              >
                <ShieldCheck size={20} />
              </div>
              <div className="admin_avail_m_tile_txt">
                <h3>100%</h3>
                <p>Staffing Safety</p>
              </div>
            </div>
          </section>

          <div className="admin_avail_m_control_bar">
            <div className="admin_avail_m_tabs">
              {["All", "Pending", "Approved", "Reassigned"].map((tab) => (
                <button
                  key={tab}
                  className={`admin_avail_m_tab_btn ${
                    activeTab === tab ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="admin_avail_m_btn_outline">
              <Download size={14} /> Export Logs
            </button>
          </div>

          <div className="admin_avail_m_specialist_grid">
            {filtered.length > 0 ? (
              filtered.map((req) => {
                const docProfile = doctorsData.find((d) => d.id === req.docId);
                return (
                  <div
                    key={req.id}
                    className="admin_avail_m_glass_card"
                    onClick={() => setSelectedReq(req)}
                  >
                    <div className="admin_avail_m_card_header">
                      <span className="admin_avail_m_id_badge">{req.id}</span>
                      <div
                        className={`admin_avail_m_priority_dot ${req.priority.toLowerCase()}`}
                      ></div>
                    </div>
                    <div className="admin_avail_m_spec_identity">
                      <div className="admin_avail_m_avatar_circle">
                        <img
                          src={
                            docProfile?.photo || "https://i.pravatar.cc/150"
                          }
                          alt=""
                        />
                      </div>
                      <div className="admin_avail_m_name_stack">
                        <strong>{req.doctor}</strong>
                        <span>{req.dept} Wing</span>
                      </div>
                    </div>
                    <div className="admin_avail_m_spec_meta">
                      <div className="admin_avail_m_meta_pill">
                        <CalIcon size={12} /> {req.date}
                      </div>
                      <div className="admin_avail_m_meta_pill">
                        <Clock size={12} /> {req.type}
                      </div>
                    </div>
                    <div className="admin_avail_m_conflict_box">
                      {req.appointments > 0 ? (
                        <p className="admin_avail_m_txt_conflict">
                          <AlertTriangle size={14} /> {req.appointments} Slots
                          Impacted
                        </p>
                      ) : (
                        <p className="admin_avail_m_txt_safe">
                          <ShieldCheck size={14} /> Schedule Is Verified Safe
                        </p>
                      )}
                    </div>
                    <div className="admin_avail_m_card_footer">
                      <span
                        className={`admin_avail_m_pill_status ${req.status.toLowerCase()}`}
                      >
                        {req.status}{" "}
                        {req.assignedTo ? `→ ${req.assignedTo.split(" ")[2]}` : ""}
                      </span>
                      <button className="admin_avail_m_btn_manage">
                        Analyze Impact
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="admin_avail_m_empty_state"
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "100px"
                }}
              >
                <Activity size={48} color="#cbd5e1" />
                <p
                  style={{
                    marginTop: "20px",
                    color: "#94a3b8",
                    fontWeight: "600"
                  }}
                >
                  No leave requests found matching the current criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="admin_avail_m_detail_container admin_avail_m_fade_in">
          <div className="admin_avail_m_panel_top">
            <button
              className="admin_avail_m_btn_outline"
              onClick={() => setSelectedReq(null)}
            >
              <ChevronLeft size={20} /> Exit Workspace
            </button>
            <div className="admin_avail_m_ref_id">
              Reference Ref: <b>{selectedReq.id}</b>
            </div>
          </div>

          <div className="admin_avail_m_workspace_grid">
            <div className="admin_avail_m_workspace_left">
              <div className="admin_avail_m_profile_hero">
                <img
                  src={doctorsData.find((d) => d.id === selectedReq.docId)?.photo}
                  className="admin_avail_m_hero_img"
                  alt=""
                />
                <div className="admin_avail_m_hero_info">
                  <h2>{selectedReq.doctor}</h2>
                  <p>
                    <Briefcase size={14} /> {selectedReq.dept} Consultant
                  </p>
                  <div className="admin_avail_m_hero_badges">
                    <span
                      className={`admin_avail_m_prio_tag ${selectedReq.priority.toLowerCase()}`}
                    >
                      {selectedReq.priority} Priority
                    </span>
                    <span className="admin_avail_m_type_tag">
                      {selectedReq.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin_avail_m_details_bento">
                <div className="admin_avail_m_bento_item">
                  <label>
                    <CalIcon size={14} /> Effective Date
                  </label>
                  <strong>{selectedReq.date}</strong>
                </div>
                <div className="admin_avail_m_bento_item">
                  <label>
                    <Clock size={14} /> Coverage Shift
                  </label>
                  <strong>All Sessions (09:00 - 18:00)</strong>
                </div>
                <div className="admin_avail_m_bento_item full">
                  <label>
                    <FileText size={14} /> Administrative Rationale
                  </label>
                  <p>{selectedReq.reason}</p>
                </div>
              </div>
            </div>

            <div className="admin_avail_m_workspace_right">
              <div className="admin_avail_m_logic_card">
                <div className="admin_avail_m_logic_head">
                  <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Zap size={18} color="#f59e0b" fill="#f59e0b" /> Reassignment
                    Intelligence
                  </h3>
                </div>

                {selectedReq.appointments > 0 ? (
                  <div className="admin_avail_m_logic_body">
                    <div className="admin_avail_m_visual_bridge">
                      <div className="admin_avail_m_bridge_node">
                        <span>From (Origin)</span>
                        <strong>{selectedReq.doctor.split(" ")[1]}</strong>
                      </div>
                      <ArrowRight size={24} color="#007acc" />
                      <div className="admin_avail_m_bridge_node active">
                        <span>To (Recommended Proxy)</span>
                        <strong>
                          {findReplacement(selectedReq.dept, selectedReq.docId)
                            ?.name?.split(" ")[1] || "Unassigned"}
                        </strong>
                      </div>
                    </div>

                    <div className="admin_avail_m_proxy_stats">
                      <div className="admin_avail_m_s_row">
                        <label>Assigned Specialist</label>
                        <span>
                          {findReplacement(selectedReq.dept, selectedReq.docId)
                            ?.name || "NO PROXY AVAILABLE"}
                        </span>
                      </div>
                      <div className="admin_avail_m_s_row">
                        <label>Seniority Level</label>
                        <span>
                          {findReplacement(selectedReq.dept, selectedReq.docId)
                            ?.experience || "N/A"}
                        </span>
                      </div>
                      <div className="admin_avail_m_s_row">
                        <label>Registry Status</label>
                        <span style={{ color: "#22c55e" }}>
                          Available for Load Shift
                        </span>
                      </div>
                    </div>

                    <button
                      className="admin_avail_m_btn_submit"
                      onClick={() => handleDecision(selectedReq.id, "Approved")}
                    >
                      Commit Shift & Authorize Leave
                    </button>
                    <button
                      className="admin_avail_m_btn_outline"
                      style={{ marginTop: "10px", width: "100%" }}
                    >
                      Manual Override Reassignment
                    </button>
                  </div>
                ) : (
                  <div className="admin_avail_m_logic_safe">
                    <ShieldCheck size={50} color="#10b981" />
                    <h4>No Overlapping Bookings</h4>
                    <p>
                      This specialist has no patient records detected for the
                      requested date. You may approve this leave request directly.
                    </p>
                    <button
                      className="admin_avail_m_btn_submit"
                      onClick={() => handleDecision(selectedReq.id, "Approved")}
                    >
                      Authorize Leave
                    </button>
                  </div>
                )}
              </div>

              <div className="admin_avail_m_impact_card">
                <div className="admin_avail_m_p_head">
                  <h3>
                    <User size={18} /> Impacted Bookings
                  </h3>
                  <span className="admin_avail_m_p_count">
                    {selectedReq.appointments} Records
                  </span>
                </div>
                <div className="admin_avail_m_impact_list">
                  {selectedReq.patients.length > 0 ? (
                    selectedReq.patients.map((p, i) => (
                      <div key={i} className="admin_avail_m_impact_item">
                        <div
                          className="admin_avail_m_p_avatar"
                          style={{ background: "#f0f9ff", color: "#007acc" }}
                        >
                          {p.charAt(0)}
                        </div>
                        <div className="admin_avail_m_p_details">
                          <strong>{p}</strong>
                          <span>Pending Redistribution</span>
                        </div>
                        <div className="admin_avail_m_p_status">
                          <Clock size={12} /> Rescheduling...
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="admin_avail_m_empty_impact">
                      <CheckCircle2 size={32} color="#22c55e" />
                      <p>Schedule clear. No patient rescheduling required.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showManualForm && (
        <div className="admin_avail_m_modal_overlay">
          <div className="admin_avail_m_form_card">
            <div className="admin_avail_m_modal_header">
              <h2>
                Log <span>Manual Absence</span>
              </h2>
              <button
                onClick={() => setShowManualForm(false)}
                className="admin_avail_m_close_btn"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleManualSubmit}
              className="admin_avail_m_form_grid"
            >
              <div className="admin_avail_m_input_box full">
                <label>Select Specialist from Registry</label>
                <select name="docId" required className="admin_avail_m_select">
                  <option value="">Choose Specialist...</option>
                  {doctorsData.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.department} - {doc.experience})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin_avail_m_input_box">
                <label>Type of Leave</label>
                <select name="type" className="admin_avail_m_select">
                  <option>Full Day Absence</option>
                  <option>Session Leave (AM/PM)</option>
                  <option>Emergency Clinical Leave</option>
                  <option>Scientific Sabbatical</option>
                </select>
              </div>

              <div className="admin_avail_m_input_box">
                <label>Administrative Urgency</label>
                <select name="priority" className="admin_avail_m_select">
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="admin_avail_m_input_box">
                <label>Effective Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  className="admin_avail_m_input"
                />
              </div>

              <div className="admin_avail_m_input_box">
                <label>Return Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  className="admin_avail_m_input"
                />
              </div>

              <div className="admin_avail_m_input_box full">
                <label>Administrative Rationale</label>
                <textarea
                  name="reason"
                  placeholder="Provide detailed justification for the redistribution request..."
                  rows="3"
                  className="admin_avail_m_textarea"
                ></textarea>
              </div>

              <button
                type="submit"
                className="admin_avail_m_btn_submit full"
                style={{ border: "none" }}
              >
                Submit & Analyze Coverage Impact
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}