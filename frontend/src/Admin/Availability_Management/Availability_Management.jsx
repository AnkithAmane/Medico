import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  ShieldCheck,
  ArrowLeftRight,
  Search,
  AlertTriangle,
  Clock,
  ChevronLeft,
  Calendar as CalIcon,
  X,
  Zap,
  Plus,
  ArrowRight,
  Users,
  Loader2,
} from "lucide-react";

import "./Availability_Management.css";

export default function Availability_Management() {
  /* --- MERN LIVE DATA STATES --- */
  const [requests, setRequests] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbDepartments, setDbDepartments] = useState([]); // 🟢 FIXED: Declared missing state parameter to prevent crash threads

  /* --- UI STATE MANAGEMENT --- */
  const [showManualForm, setShowManualForm] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  /* 1. DATA SYNC LOGIC */
  // Inside Availability_Management.jsx or registration components

  useEffect(() => {
    const loadHospitalDepartments = async () => {
      try {
        // 🟢 Swapped away from the doctor domain lane to hit the correct department router track!
        const res = await axios.get(
          "http://localhost:5000/api/departments/dropdown/list",
        );
        setDbDepartments(res.data || []);
      } catch (err) {
        console.error(
          "Failed to query hospital units registries via department lane",
          err,
        );
      }
    };
    loadHospitalDepartments();
  }, []);
  const syncHospitalData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [leaveRes, docRes] = await Promise.all([
        axios.get("http://localhost:5000/api/leaves/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/doctors/list", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setRequests(leaveRes.data || []);
      setDoctorsList(docRes.data || []);
    } catch (err) {
      console.error("Clinical Load Sync Failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncHospitalData();
  }, []);

  /* 2. REPLACEMENT ENGINE (Logic to find best colleague for coverage) */
  const findReplacement = (dept, currentDocId) => {
    if (!dept) return null;
    const candidates = doctorsList.filter(
      (d) =>
        d.department === dept &&
        d.doctorId !== currentDocId &&
        d._id !== currentDocId &&
        d.availability === "Available",
    );

    if (candidates.length === 0) return null;

    // Prioritize by experience if multiple candidates exist
    return candidates.sort((a, b) => {
      const expA = parseInt(a.experience) || 0;
      const expB = parseInt(b.experience) || 0;
      return expB - expA;
    })[0];
  };

  /* 3. DECISION LOGIC: Approves leave and triggers the Bulk Redistribution */
  const handleDecision = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const req = requests.find((r) => r._id === id);

      // Determine proxy doctor
      const replacement = findReplacement(req.department, req.doctorId);
      const targetDoctor = replacement ? replacement.name : "System Unassigned";

      // Trigger the specialized Backend Redistribution Route
      await axios.put(
        `http://localhost:5000/api/leaves/update/${id}`,
        {
          targetDoctor: targetDoctor,
          status:
            newStatus === "Approved" && replacement ? "Reassigned" : newStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert(
        newStatus === "Rejected"
          ? "Absence request declined safely."
          : `Success: Clinical load shifted to ${targetDoctor}`,
      );
      syncHospitalData();
      setSelectedReq(null);
    } catch (err) {
      alert(
        "Redistribution Sync Failed: " +
          (err.response?.data?.message || "Server Error"),
      );
    }
  };

  /* 4. MANUAL SUBMISSION: Logs a leave and auto-calculates patient impact */
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const docId = formData.get("docId");
    const selectedDoc = doctorsList.find(
      (d) => d.doctorId === docId || d._id === docId,
    );

    if (!selectedDoc) return alert("Please select a valid specialist.");

    try {
      const token = localStorage.getItem("token");

      // Check real-time conflict count from DB
      const conflictRes = await axios.get(
        `http://localhost:5000/api/leaves/check-conflicts?doctorName=${encodeURIComponent(selectedDoc.name)}&startDate=${formData.get("startDate")}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const payload = {
        doctorId: selectedDoc.doctorId || selectedDoc._id,
        doctorName: selectedDoc.name,
        department: selectedDoc.department,
        leaveType: "Full_Day",
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate") || formData.get("startDate"),
        priority: formData.get("priority"),
        reason: formData.get("reason"),
        appointments: conflictRes.data.count,
        status: "Pending",
      };

      await axios.post("http://localhost:5000/api/leaves/apply", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowManualForm(false);
      syncHospitalData();
    } catch (err) {
      alert("Manual log failed.");
    }
  };

  /* 5. SEARCH & FILTER LOGIC */
  const filtered = useMemo(() => {
    return requests.filter(
      (r) =>
        ((r.doctorName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          (r.department || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (activeTab === "All" || r.status === activeTab),
    );
  }, [requests, searchTerm, activeTab]);

  if (loading)
    return (
      <div className="admin_dash_load">
        <Loader2 className="spin" /> Syncing Clinical Load...
      </div>
    );

  return (
    <div className="admin_avail_m_wrapper">
      <header className="admin_avail_m_header">
        <div className="admin_avail_m_branding">
          <h1 className="admin_avail_m_title_elite">
            Leave <span>Redistribution</span>
          </h1>
          <p className="admin_avail_m_subtitle">
            {selectedReq
              ? `Analytics for ${selectedReq.doctorName}`
              : "Clinical Load Balancing & Specialist Coverage"}
          </p>
        </div>

        {!selectedReq && (
          <div className="admin_avail_m_action_group">
            <div className="admin_avail_m_search_box">
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search specialists..."
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
          {/* STATS OVERVIEW */}
          <section className="admin_avail_m_stat_grid">
            <div className="admin_avail_m_stat_tile">
              <div className="admin_avail_m_tile_icon">
                <Users size={20} />
              </div>
              <div className="admin_avail_m_tile_txt">
                <h3>{doctorsList.length}</h3>
                <p>Active Staff</p>
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
                <p>Awaiting Review</p>
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
                  {
                    requests.filter(
                      (r) =>
                        r.status === "Reassigned" || r.status === "Approved",
                    ).length
                  }
                </h3>
                <p>Redistributed</p>
              </div>
            </div>
          </section>

          {/* CONTROL TABS */}
          <div className="admin_avail_m_control_bar">
            <div className="admin_avail_m_tabs">
              {["All", "Pending", "Approved", "Reassigned", "Rejected"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={`admin_avail_m_tab_btn ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* DATA GRID */}
          <div className="admin_avail_m_specialist_grid">
            {filtered.map((req) => (
              <div
                key={req._id}
                className="admin_avail_m_glass_card"
                onClick={() => setSelectedReq(req)}
              >
                <div className="admin_avail_m_card_header">
                  <span className="admin_avail_m_id_badge">
                    LOG-{req._id.slice(-4).toUpperCase()}
                  </span>
                  <div
                    className={`admin_avail_m_priority_dot ${req.priority?.toLowerCase()}`}
                  ></div>
                </div>
                <div className="admin_avail_m_spec_identity">
                  <strong>{req.doctorName}</strong>
                  <span>{req.department} Unit</span>
                  {req.leaveType === "Slot_Block" && (
                    <small
                      style={{
                        color: "#d97706",
                        fontWeight: "700",
                        marginTop: "4px",
                      }}
                    >
                      Hourly Blockout Selection
                    </small>
                  )}
                </div>
                <div className="admin_avail_m_spec_meta">
                  <div className="admin_avail_m_meta_pill">
                    <CalIcon size={12} /> {req.startDate}
                  </div>
                  <div
                    className={`admin_avail_m_pill_status ${req.status.toLowerCase()}`}
                  >
                    {req.status}
                  </div>
                </div>
                <div className="admin_avail_m_conflict_box">
                  {req.appointments > 0 ? (
                    <p className="admin_avail_m_txt_conflict">
                      <AlertTriangle size={14} /> {req.appointments} Patients at
                      Risk
                    </p>
                  ) : (
                    <p className="admin_avail_m_txt_safe">
                      <ShieldCheck size={14} /> Schedule Safe
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* WORKSPACE VIEW: THE REASSIGNMENT INTERFACE */
        <div className="admin_avail_m_detail_container admin_avail_m_fade_in">
          <div className="admin_avail_m_panel_top">
            <button
              className="admin_avail_m_btn_outline"
              onClick={() => setSelectedReq(null)}
            >
              <ChevronLeft size={20} /> Return to Dashboard
            </button>
            <div className="admin_avail_m_ref_id">Ref: {selectedReq._id}</div>
          </div>

          <div className="admin_avail_m_workspace_grid">
            <div className="admin_avail_m_workspace_left">
              <div className="admin_avail_m_profile_hero">
                <h2>{selectedReq.doctorName}</h2>
                <p>{selectedReq.department} Consultant</p>
              </div>
              <div className="admin_avail_m_details_bento">
                <div className="admin_avail_m_bento_item">
                  <label>Strategy Type</label>
                  <strong>
                    {selectedReq.leaveType === "Slot_Block"
                      ? "Hourly Slot Blockout"
                      : "Full Vacation Range"}
                  </strong>
                </div>
                <div className="admin_avail_m_bento_item">
                  <label>Target Date Window</label>
                  <strong>
                    {selectedReq.startDate}{" "}
                    {selectedReq.endDate !== selectedReq.startDate
                      ? ` to ${selectedReq.endDate}`
                      : ""}
                  </strong>
                </div>

                {/* 🟢 NEW SUBSECTION: Renders the individual hour items from array if Slot_Block requested */}
                {selectedReq.leaveType === "Slot_Block" && (
                  <div
                    className="admin_avail_m_bento_item full"
                    style={{
                      background: "#fffdfa",
                      border: "1px solid #fef3c7",
                    }}
                  >
                    <label style={{ color: "#b45309" }}>
                      Requested Blockout Hours
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginTop: "6px",
                      }}
                    >
                      {selectedReq.blockedSlots?.map((slot, i) => (
                        <span
                          key={i}
                          style={{
                            background: "#fff",
                            border: "1px solid #cbd5e1",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            color: "#334155",
                          }}
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="admin_avail_m_bento_item full">
                  <label>Reasoning</label>
                  <p>{selectedReq.reason}</p>
                </div>
              </div>
            </div>

            <div className="admin_avail_m_workspace_right">
              <div className="admin_avail_m_logic_card">
                <h3>
                  <Zap size={18} color="#f59e0b" fill="#f59e0b" /> Shift
                  Intelligence
                </h3>
                {selectedReq.status === "Pending" ? (
                  <div className="admin_avail_m_logic_body">
                    <div className="admin_avail_m_visual_bridge">
                      <strong>
                        {selectedReq.doctorName.split(" ")[1] ||
                          selectedReq.doctorName}
                      </strong>
                      <ArrowRight size={24} color="#007acc" />
                      <strong className="active">
                        {findReplacement(
                          selectedReq.department,
                          selectedReq.doctorId,
                        )?.name?.split(" ")[1] || "None"}
                      </strong>
                    </div>
                    <p className="proxy_name_display">
                      Suggested Proxy:{" "}
                      {findReplacement(
                        selectedReq.department,
                        selectedReq.doctorId,
                      )?.name || "No colleague available"}
                    </p>
                    <div className="admin_avail_m_action_btns">
                      <button
                        className="admin_avail_m_btn_submit"
                        onClick={() =>
                          handleDecision(selectedReq._id, "Approved")
                        }
                      >
                        Shift Load & Approve
                      </button>
                      <button
                        className="admin_avail_m_btn_reject"
                        onClick={() =>
                          handleDecision(selectedReq._id, "Rejected")
                        }
                      >
                        Decline Leave
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="admin_avail_m_logic_safe"
                    style={{ padding: "20px", textAlign: "center" }}
                  >
                    <ShieldCheck size={32} color="#10b981" />
                    <p style={{ marginTop: "10px", fontWeight: "600" }}>
                      This application file has already been audited as{" "}
                      <span style={{ color: "#007acc" }}>
                        {selectedReq.status}
                      </span>
                      .
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      /* MANUAL ABSENCE FORM MODAL */
      {showManualForm && (
        <div className="admin_avail_m_modal_overlay">
          <div className="admin_avail_m_form_card">
            <div className="admin_avail_m_modal_header">
              <h2>
                Register <span>Staff Absence</span>
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
                <label>Specialist</label>
                <select name="docId" required className="admin_avail_m_select">
                  <option value="">Choose Specialist...</option>
                  {doctorsList.map((doc) => (
                    <option
                      key={doc._id || doc.doctorId}
                      value={doc.doctorId || doc._id}
                    >
                      {doc.name} ({doc.department})
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin_avail_m_input_box">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  className="admin_avail_m_input"
                />
              </div>
              <div className="admin_avail_m_input_box">
                <label>Priority</label>
                <select name="priority" className="admin_avail_m_select">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="admin_avail_m_input_box full">
                <label>Reason for Absence</label>
                <textarea
                  name="reason"
                  rows="2"
                  className="admin_avail_m_textarea"
                  required
                ></textarea>
              </div>
              <button type="submit" className="admin_avail_m_btn_submit full">
                Sync Schedule & Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
