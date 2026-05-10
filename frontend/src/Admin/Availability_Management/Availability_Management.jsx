import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck, ArrowLeftRight, Search, Download,
  AlertTriangle, Clock, CheckCircle2, ChevronLeft,
  ChevronRight, Calendar as CalIcon, X, User,
  Briefcase, Zap, FileText, Plus, ArrowRight,
  Users, Activity
} from "lucide-react";
import axiosInstance from "../../utils/axios";
import "./Availability_Management.css";

export default function Availability_Management() {
  // Data states
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  // UI states
  const [showManualForm, setShowManualForm] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [requests, setRequests] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const res = await axiosInstance.get('/doctors')
        setDoctors(res.data.data || [])

        // Load leave requests from localStorage
        const saved = localStorage.getItem('admin_leave_requests')
        if (saved) setRequests(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  // Save requests to localStorage
  const saveRequests = (updated) => {
    setRequests(updated)
    localStorage.setItem('admin_leave_requests', JSON.stringify(updated))
  }

  // Find replacement doctor
  const findReplacement = (specialization, currentDocId) => {
    if (!specialization) return null
    return doctors.find(d =>
      d.specialization === specialization &&
      d._id !== currentDocId &&
      d.isAvailable
    ) || null
  }

  // Handle decision
  const handleDecision = async (id, newStatus) => {
    const req = requests.find(r => r.id === id)
    let proxyName = null

    if (newStatus === "Approved" && req.appointments > 0) {
      const replacement = findReplacement(req.dept, req.docId)
      proxyName = replacement ? replacement.name : "System Unassigned"
      newStatus = "Reassigned"
    }

    const updated = requests.map(r =>
      r.id === id ? { ...r, status: newStatus, assignedTo: proxyName } : r
    )
    saveRequests(updated)
    setSelectedReq(null)
  }

  // Manual leave submission
  const handleManualSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const docId = formData.get('docId')
    const selectedDoc = doctors.find(d => d._id === docId)

    if (!selectedDoc) {
      alert('Please select a valid doctor')
      return
    }

    try {
      setSubmitting(true)

      // Update doctor availability
      await axiosInstance.put(`/doctors/${docId}`, { isAvailable: false })

      const newRequest = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        docId,
        doctor: selectedDoc.name,
        dept: selectedDoc.specialization,
        type: formData.get('type'),
        date: formData.get('date'),
        appointments: 0,
        status: 'Pending',
        priority: formData.get('priority'),
        reason: formData.get('reason') || 'Clinical Sabbatical',
        patients: [],
        assignedTo: null
      }

      const updated = [newRequest, ...requests]
      saveRequests(updated)
      setShowManualForm(false)
    } catch (err) {
      alert('Failed to submit leave request')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter requests
  const filtered = useMemo(() => {
    return requests.filter(r =>
      (r.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.dept?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === "All" || r.status === activeTab)
    )
  }, [requests, searchTerm, activeTab])

  // Stats
  const stats = {
    total: doctors.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    reassigned: requests.filter(r => r.status === 'Reassigned').length,
    available: doctors.filter(d => d.isAvailable).length
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p>Loading...</p>
    </div>
  )

  return (
    <div className="admin_avail_m_wrapper">
      {/* Header */}
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
            <button className="admin_avail_m_btn_primary" onClick={() => setShowManualForm(true)}>
              <Plus size={18} /> Log Manual Leave
            </button>
          </div>
        )}
      </header>

      {!selectedReq ? (
        <div>
          {/* Stats Grid */}
          <section className="admin_avail_m_stat_grid">
            <div className="admin_avail_m_stat_tile">
              <div className="admin_avail_m_tile_icon"><Users size={20} /></div>
              <div className="admin_avail_m_tile_txt">
                <h3>{stats.total}</h3><p>Clinical Registry</p>
              </div>
            </div>
            <div className="admin_avail_m_stat_tile">
              <div className="admin_avail_m_tile_icon" style={{ color: "#f59e0b" }}><Clock size={20} /></div>
              <div className="admin_avail_m_tile_txt">
                <h3>{stats.pending}</h3><p>Pending Review</p>
              </div>
            </div>
            <div className="admin_avail_m_stat_tile">
              <div className="admin_avail_m_tile_icon" style={{ color: "#22c55e" }}><ArrowLeftRight size={20} /></div>
              <div className="admin_avail_m_tile_txt">
                <h3>{stats.reassigned}</h3><p>Active Proxy Shifts</p>
              </div>
            </div>
            <div className="admin_avail_m_stat_tile">
              <div className="admin_avail_m_tile_icon" style={{ color: "#007acc" }}><ShieldCheck size={20} /></div>
              <div className="admin_avail_m_tile_txt">
                <h3>{stats.available}</h3><p>Available Doctors</p>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <div className="admin_avail_m_control_bar">
            <div className="admin_avail_m_tabs">
              {["All", "Pending", "Approved", "Reassigned"].map(tab => (
                <button key={tab} className={`admin_avail_m_tab_btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>
            <button className="admin_avail_m_btn_outline">
              <Download size={14} /> Export Logs
            </button>
          </div>

          {/* Requests Grid */}
          <div className="admin_avail_m_specialist_grid">
            {filtered.length > 0 ? filtered.map(req => (
              <div key={req.id} className="admin_avail_m_glass_card" onClick={() => setSelectedReq(req)}>
                <div className="admin_avail_m_card_header">
                  <span className="admin_avail_m_id_badge">{req.id}</span>
                  <div className={`admin_avail_m_priority_dot ${req.priority?.toLowerCase()}`}></div>
                </div>
                <div className="admin_avail_m_spec_identity">
                  <div className="admin_avail_m_avatar_circle">
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 800,
                      fontSize: '1.2rem', color: '#007acc'
                    }}>
                      {req.doctor?.charAt(0)}
                    </div>
                  </div>
                  <div className="admin_avail_m_name_stack">
                    <strong>{req.doctor}</strong>
                    <span>{req.dept} Wing</span>
                  </div>
                </div>
                <div className="admin_avail_m_spec_meta">
                  <div className="admin_avail_m_meta_pill"><CalIcon size={12}/> {req.date}</div>
                  <div className="admin_avail_m_meta_pill"><Clock size={12}/> {req.type}</div>
                </div>
                <div className="admin_avail_m_conflict_box">
                  {req.appointments > 0 ? (
                    <p className="admin_avail_m_txt_conflict">
                      <AlertTriangle size={14}/> {req.appointments} Slots Impacted
                    </p>
                  ) : (
                    <p className="admin_avail_m_txt_safe">
                      <ShieldCheck size={14}/> Schedule Is Verified Safe
                    </p>
                  )}
                </div>
                <div className="admin_avail_m_card_footer">
                  <span className={`admin_avail_m_pill_status ${req.status?.toLowerCase()}`}>
                    {req.status} {req.assignedTo ? `→ ${req.assignedTo.split(' ').pop()}` : ''}
                  </span>
                  <button className="admin_avail_m_btn_manage">Analyze Impact</button>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
                <Activity size={48} color="#cbd5e1" />
                <p style={{ marginTop: '20px', color: '#94a3b8', fontWeight: '600' }}>
                  {requests.length === 0
                    ? 'No leave requests yet. Use "Log Manual Leave" to add one.'
                    : 'No requests matching current criteria.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Detail Workspace */
        <div className="admin_avail_m_detail_container">
          <div className="admin_avail_m_panel_top">
            <button className="admin_avail_m_btn_outline" onClick={() => setSelectedReq(null)}>
              <ChevronLeft size={20}/> Exit Workspace
            </button>
            <div className="admin_avail_m_ref_id">Reference: <b>{selectedReq.id}</b></div>
          </div>

          <div className="admin_avail_m_workspace_grid">
            <div className="admin_avail_m_workspace_left">
              {/* Profile */}
              <div className="admin_avail_m_profile_hero">
                <div style={{
                  width: 100, height: 100, borderRadius: 20,
                  background: 'linear-gradient(135deg, #007acc, #00d2ff)',
                  color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: '2rem'
                }}>
                  {selectedReq.doctor?.charAt(0)}
                </div>
                <div className="admin_avail_m_hero_info">
                  <h2>{selectedReq.doctor}</h2>
                  <p><Briefcase size={14}/> {selectedReq.dept} Consultant</p>
                  <div className="admin_avail_m_hero_badges">
                    <span className={`admin_avail_m_prio_tag ${selectedReq.priority?.toLowerCase()}`}>
                      {selectedReq.priority} Priority
                    </span>
                    <span className="admin_avail_m_type_tag">{selectedReq.type}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="admin_avail_m_details_bento">
                <div className="admin_avail_m_bento_item">
                  <label><CalIcon size={14}/> Effective Date</label>
                  <strong>{selectedReq.date}</strong>
                </div>
                <div className="admin_avail_m_bento_item">
                  <label><Clock size={14}/> Coverage Shift</label>
                  <strong>All Sessions (09:00 - 18:00)</strong>
                </div>
                <div className="admin_avail_m_bento_item full">
                  <label><FileText size={14}/> Rationale</label>
                  <p>{selectedReq.reason}</p>
                </div>
              </div>
            </div>

            <div className="admin_avail_m_workspace_right">
              {/* Intelligence Card */}
              <div className="admin_avail_m_logic_card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Zap size={18} color="#f59e0b" fill="#f59e0b"/> Reassignment Intelligence
                </h3>

                {selectedReq.appointments > 0 ? (
                  <div>
                    <div className="admin_avail_m_visual_bridge">
                      <div className="admin_avail_m_bridge_node">
                        <span>From (Origin)</span>
                        <strong>{selectedReq.doctor?.split(' ').pop()}</strong>
                      </div>
                      <ArrowRight size={24} color="#007acc"/>
                      <div className="admin_avail_m_bridge_node active">
                        <span>To (Recommended)</span>
                        <strong>
                          {findReplacement(selectedReq.dept, selectedReq.docId)?.name?.split(' ').pop() || 'Unassigned'}
                        </strong>
                      </div>
                    </div>
                    <div className="admin_avail_m_proxy_stats">
                      <div className="admin_avail_m_s_row">
                        <label>Assigned Specialist</label>
                        <span>{findReplacement(selectedReq.dept, selectedReq.docId)?.name || 'NO PROXY AVAILABLE'}</span>
                      </div>
                      <div className="admin_avail_m_s_row">
                        <label>Experience</label>
                        <span>{findReplacement(selectedReq.dept, selectedReq.docId)?.experience || 'N/A'} years</span>
                      </div>
                      <div className="admin_avail_m_s_row">
                        <label>Status</label>
                        <span style={{ color: '#22c55e' }}>Available for Load Shift</span>
                      </div>
                    </div>
                    <button className="admin_avail_m_btn_submit" onClick={() => handleDecision(selectedReq.id, 'Approved')}>
                      Commit Shift & Authorize Leave
                    </button>
                  </div>
                ) : (
                  <div className="admin_avail_m_logic_safe">
                    <ShieldCheck size={50} color="#10b981"/>
                    <h4>No Overlapping Bookings</h4>
                    <p>No patient records detected. You may approve this leave directly.</p>
                    <button className="admin_avail_m_btn_submit" onClick={() => handleDecision(selectedReq.id, 'Approved')}>
                      Authorize Leave
                    </button>
                  </div>
                )}
              </div>

              {/* Impacted Patients */}
              <div className="admin_avail_m_impact_card">
                <div className="admin_avail_m_p_head">
                  <h3><User size={18}/> Impacted Bookings</h3>
                  <span className="admin_avail_m_p_count">{selectedReq.appointments} Records</span>
                </div>
                <div className="admin_avail_m_impact_list">
                  {selectedReq.patients?.length > 0 ? selectedReq.patients.map((p, i) => (
                    <div key={i} className="admin_avail_m_impact_item">
                      <div className="admin_avail_m_p_avatar" style={{ background: '#f0f9ff', color: '#007acc' }}>
                        {p.charAt(0)}
                      </div>
                      <div className="admin_avail_m_p_details">
                        <strong>{p}</strong>
                        <span>Pending Redistribution</span>
                      </div>
                      <div className="admin_avail_m_p_status"><Clock size={12}/> Rescheduling...</div>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <CheckCircle2 size={32} color="#22c55e"/>
                      <p style={{ color: '#94a3b8' }}>No patient rescheduling required.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Leave Modal */}
      {showManualForm && (
        <div className="admin_avail_m_modal_overlay">
          <div className="admin_avail_m_form_card">
            <div className="admin_avail_m_modal_header">
              <h2>Log <span>Manual Absence</span></h2>
              <button onClick={() => setShowManualForm(false)} className="admin_avail_m_close_btn">
                <X size={24}/>
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="admin_avail_m_form_grid">
              <div className="admin_avail_m_input_box full">
                <label>Select Specialist</label>
                <select name="docId" required className="admin_avail_m_select">
                  <option value="">Choose Specialist...</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} ({doc.specialization})
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
                <label>Priority</label>
                <select name="priority" className="admin_avail_m_select">
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="admin_avail_m_input_box">
                <label>Effective Date</label>
                <input type="date" name="date" required className="admin_avail_m_input"/>
              </div>
              <div className="admin_avail_m_input_box">
                <label>Return Date (Optional)</label>
                <input type="date" name="endDate" className="admin_avail_m_input"/>
              </div>
              <div className="admin_avail_m_input_box full">
                <label>Rationale</label>
                <textarea name="reason" placeholder="Provide justification..." rows="3"
                  className="admin_avail_m_textarea"></textarea>
              </div>
              <button type="submit" className="admin_avail_m_btn_submit full" style={{ border: 'none' }} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit & Analyze Coverage Impact'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}