import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  ExternalLink,
  User,
  CheckCircle,
  Clock4,
  Star,
  ArrowRight,
  Calendar,
  Zap,
  Loader2,
  X,
  MapPin,
  Layers,
  ChevronRight
} from "lucide-react";
import "./Doctor_Dashboard.css";

// ChartJS setup
ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

export default function Dashboard() {
  const navigate = useNavigate();

  // 1. Backend Context: Get logged-in doctor info
  const doctorUser = JSON.parse(localStorage.getItem("userData")) || {};
  const loggedInDoctorName = doctorUser.name;
  const doctorId = doctorUser.doctorId;

  // 2. States for Live Data
  const [docAppts, setDocAppts] = useState([]);
  const [performanceStats, setPerformanceStats] = useState([0, 0, 0, 0]);
  const [globalEvents, setGlobalEvents] = useState([]); // 🟢 ADDED: State matrix caching container for calendar logs
  const [selectedEventDetail, setSelectedEventDetail] = useState(null); // 🟢 ADDED: Focused modal detail view frame state
  const [counts, setCounts] = useState({ total: 0, completed: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];

  // 3. Logic: Fetch data concurrently from MongoDB
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Concurrent fetch request blocks mapping parallel threads over the network
      const [apptRes, profRes, eventRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/appointments/doctor/${loggedInDoctorName}`, { headers }),
        axios.get(`http://localhost:5000/api/doctors/profile/${doctorId}`, { headers }),
        axios.get("http://localhost:5000/api/events/all", { headers }) // 🟢 FETCHES ACTIVE SESSIONS LOGS
      ]);

      setDocAppts(apptRes.data || []);
      setPerformanceStats(profRes.data?.performanceStats || [10, 25, 45, 30]);
      setGlobalEvents(eventRes.data || []);
    } catch (err) {
      console.error("Dashboard Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedInDoctorName) fetchDashboardData();
  }, [loggedInDoctorName]);

  // 4. Statistics counter logic (Preserved original animation vectors)
  useEffect(() => {
    if (docAppts.length === 0) return;

    let t = 0, c = 0, u = 0;
    const targetT = docAppts.length;
    const targetC = docAppts.filter((a) => a.status === "Completed").length;
    const targetU = docAppts.filter((a) => a.status === "Upcoming").length;

    const interval = setInterval(() => {
      let updated = false;
      if (t < targetT) { t++; updated = true; }
      if (c < targetC) { c++; updated = true; }
      if (u < targetU) { u++; updated = true; }

      setCounts({ total: t, completed: c, upcoming: u });
      if (!updated) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [docAppts]);

  // Derived Values for Sidebar
  const nextPat = useMemo(
    () => docAppts.find((a) => a.date === todayStr && a.status === "Upcoming"),
    [docAppts, todayStr],
  );

  /* --- 🟢 NEW: ANALYTICS FILTER ENGINE CAPTURING THE NEXT 5 UPCOMING CONFERENCES --- */
  const upcomingDoctorEvents = useMemo(() => {
    return globalEvents
      .filter((event) => {
        const speakers = Array.isArray(event.doctors) ? event.doctors : [];
        const isPanelist = speakers.some(
          (name) => (name || "").toLowerCase().trim() === (loggedInDoctorName || "").toLowerCase().trim()
        );
        
        // Isolate sessions that are chronological future tracks or active on-deck segments
        const isUpcoming = event.status !== "Completed" && event.status !== "Cancelled";
        return isPanelist && isUpcoming;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date)) // Order by closest schedule index targets
      .slice(0, 5); // Limit matrix pipeline strictly to next 5 upcoming entries
  }, [globalEvents, loggedInDoctorName]);

  // Dynamically reduce star distribution graphs using completed interaction metrics mapping
  const ratingData = useMemo(() => {
    const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    docAppts.forEach(appt => {
      if (appt.hasFeedback && appt.feedbackRef?.rating) {
        const score = Number(appt.feedbackRef.rating);
        if (stars[score] !== undefined) stars[score]++;
      }
    });
    return stars;
  }, [docAppts]);

  if (loading)
    return (
      <div className="doc_dashboard_loading">
        <Loader2 className="spin" /> Synchronizing Medical Intel...
      </div>
    );

  return (
    <div className="doc_dashboard_container doc_dashboard_view_fade_in">
      <div className="doc_dashboard_top_grid_layout">
        {/* Analytics Column */}
        <div className="doc_dashboard_left_analytics_stack">
          {/* Main Stats Summary */}
          <div className="doc_dashboard_stats_cards_row">
            <div className="doc_dashboard_stat_tile">
              <h3>Total Appointments</h3>
              <p>{counts.total}</p>
            </div>
            <div className="doc_dashboard_stat_tile">
              <h3>Completed</h3>
              <p>{counts.completed}</p>
            </div>
            <div className="doc_dashboard_stat_tile">
              <h3>Upcoming</h3>
              <p>{counts.upcoming}</p>
            </div>
          </div>

          {/* Charts Bento Grid */}
          <div className="doc_dashboard_charts_bento">
            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>
                  Patient Traffic <span className="doc_dashboard_tag">Live</span>
                </h3>
                <button className="view-btn" onClick={() => navigate("/doctor/analytics")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="doc_dashboard_chart_box">
                <img src="" alt="Patient Traffic" style={{ display: "none" }} />
                <Line
                  data={{
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    datasets: [
                      {
                        label: "Performance",
                        data: performanceStats,
                        borderColor: "#007acc",
                        backgroundColor: "rgba(0,122,204,0.08)",
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        borderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>Consultation Mix</h3>
              </div>
              <div className="doc_dashboard_chart_box_pie">
                <div className="doc_dashboard_pie_wrap">
                  <Doughnut
                    data={{
                      labels: ["New", "Follow-ups"],
                      datasets: [
                        {
                          data: [65, 35],
                          backgroundColor: ["#007acc", "#00d2ff"],
                          borderWidth: 0,
                          cutout: "70%",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
                <div className="doc_dashboard_pie_legend">
                  <div className="doc_dashboard_leg_item">
                    <span className="doc_dashboard_dot doc_dashboard_bg_blue"></span>
                    <span>New</span>
                  </div>
                  <div className="doc_dashboard_leg_item">
                    <span className="doc_dashboard_dot doc_dashboard_bg_cyan"></span>
                    <span>Follow-up</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>Appointments Overview</h3>
                <button className="view-btn" onClick={() => navigate("/doctor/appointments")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="doc_dashboard_chart_box">
                <Bar
                  data={{
                    labels: ["Pending", "Completed"],
                    datasets: [
                      {
                        label: "Volume",
                        data: [counts.upcoming, counts.completed],
                        backgroundColor: ["#007acc", "#10b981"],
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>Patient Satisfaction</h3>
                <button className="view-btn" onClick={() => navigate("/doctor/reviews")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="doc_dashboard_ratings_stack">
                {[5, 4, 3, 2, 1].map((star) => {
                  const totalForStar = ratingData[star] || 0;
                  const totalReviews = Object.values(ratingData).reduce((s, c) => s + c, 0);
                  const barPct = totalReviews > 0 ? ((totalForStar / totalReviews) * 100).toFixed(0) : "0";
                  return (
                    <div key={star} className="doc_dashboard_rating_line">
                      <div className="doc_dashboard_star_val">
                        {star} <Star size={10} fill="#ffcd56" color="#ffcd56" />
                      </div>
                      <div className="doc_dashboard_bar_bg">
                        <div
                          className="doc_dashboard_bar_fill"
                          style={{ width: totalReviews > 0 ? `${barPct}%` : star === 5 ? "100%" : "0%" }}
                        ></div>
                      </div>
                      <div className="doc_dashboard_rating_total">{totalForStar}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="doc_dashboard_right_priority_stack">
          <div className="doc_dashboard_next_pat_card_elite">
            <div className="doc_dashboard_card_title_row">
              <div className="doc_dashboard_flex_center" style={{ padding: "0" }}>
                <Zap size={16} color="#007acc" fill="#007acc" />
                <h3>Next Appointment</h3>
              </div>
              <span className="doc_dashboard_priority_tag">On Deck</span>
            </div>
            {nextPat ? (
              <div className="doc_dashboard_pat_profile_ui">
                <div className="doc_dashboard_pat_hero">
                  <div className="doc_dashboard_pat_avatar">
                    {nextPat.patientName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="doc_dashboard_pat_meta">
                    <strong>{nextPat.patientName}</strong>
                    <span>REF: {nextPat.appointmentID || nextPat._id?.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
                <button
                  className="doc_dashboard_btn_initiate_consult"
                  onClick={() =>
                    navigate("/doctor/doctor_appointments_management", {
                      state: { autoSelectId: nextPat._id },
                    })
                  }
                >
                  Initiate <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="doc_dashboard_empty_msg"> No appointments scheduled on deck for today. </div>
            )}
          </div>

          {/* 🟢 UPGRADED CLINICAL EVENTS SIDEBAR CONTAINER RETRIEVING THE NEXT 5 EVENTS */}
          <div className="doc_dashboard_events_panel_elite">
            <div className="doc_dashboard_card_title_row">
              <div className="doc_dashboard_flex_center" style={{ padding: "0" }}>
                <Calendar size={16} color="#007acc" />
                <h3>Clinical Conferences ({upcomingDoctorEvents.length})</h3>
              </div>
            </div>
            <div className="doc_dashboard_event_list_scroll" style={{ maxHeight: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {upcomingDoctorEvents.length > 0 ? (
                upcomingDoctorEvents.map((evt) => {
                  // Safely split format maps from YYYY-MM-DD input layouts strings
                  const dateParts = evt.date ? evt.date.split("-") : [];
                  const dayNum = dateParts[2] || "15";
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const monthName = dateParts[1] ? months[parseInt(dateParts[1]) - 1] : "May";

                  return (
                    <div 
                      className="doc_dashboard_event_card doc_dashboard_blue" 
                      key={evt._id}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s ease" }}
                    >
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div className="doc_dashboard_date_badge">
                          <span>{dayNum}</span>
                          <span>{monthName}</span>
                        </div>
                        <div className="doc_dashboard_event_info">
                          <strong style={{ display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "140px" }}>{evt.title}</strong>
                          <span>{evt.startTime || "09:00 AM"} • {evt.location}</span>
                        </div>
                      </div>
                      
                      {/* 🟢 ACTION CONTROL: TRIGGER DYNAMIC VIEW PANEL DRAWER */}
                      <button 
                        onClick={() => setSelectedEventDetail(evt)}
                        style={{ border: "none", background: "rgba(0,122,204,0.08)", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#007acc" }}
                        title="View Detailed Logs Context"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="doc_dashboard_empty_msg" style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No upcoming assigned panels recorded in calendar registry.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Feeds */}
      <div className="doc_dashboard_bottom_section">
        {/* RECENTLY COMPLETED PANEL */}
        <div className="doc_dashboard_info_card_modern">
          <div className="doc_dashboard_modern_header">
            <div className="doc_dashboard_header_info">
              <CheckCircle size={16} color="#10b981" />
              <h3>Recently Completed</h3>
            </div>
          </div>
          <div className="doc_dashboard_modern_grid">
            {docAppts
              .filter((a) => a.status === "Completed")
              .slice(0, 3)
              .map((app) => (
                <div className="doc_dashboard_modern_item_card" key={app._id}>
                  <div className="doc_dashboard_item_main">
                    <div className="doc_dashboard_item_avatar">
                      <User size={14} />
                    </div>
                    <div className="doc_dashboard_item_details">
                      <strong>{app.patientName}</strong>
                      <span>{app.type || "General Checkup"}</span>
                    </div>
                  </div>
                  <button
                    className="doc_dashboard_view_more_link_btn"
                    onClick={() =>
                      navigate("/doctor/doctor_appointments_management", {
                        state: { autoSelectId: app._id },
                      })
                    }
                  >
                    View Case
                  </button>
                </div>
              ))}
            {docAppts.filter((a) => a.status === "Completed").length === 0 && (
              <div className="doc_dashboard_empty_msg" style={{ padding: "10px 0" }}>No completed files indexed yet.</div>
            )}
          </div>
        </div>

        {/* UPCOMING QUEUE PANEL */}
        <div className="doc_dashboard_info_card_modern">
          <div className="doc_dashboard_modern_header">
            <div className="doc_dashboard_header_info">
              <Clock4 size={16} color="#007acc" />
              <h3>Upcoming Queue</h3>
            </div>
          </div>
          <div className="doc_dashboard_modern_grid">
            {docAppts
              .filter((a) => a.status === "Upcoming")
              .slice(0, 3)
              .map((app) => (
                <div className="doc_dashboard_modern_item_card" key={app._id}>
                  <div className="doc_dashboard_item_main">
                    <div className="doc_dashboard_item_avatar doc_dashboard_blue">
                      <User size={14} />
                    </div>
                    <div className="doc_dashboard_item_details">
                      <strong>{app.patientName}</strong>
                      <span>{app.time || "Scheduled"}</span>
                    </div>
                  </div>
                  <button
                    className="doc_dashboard_view_more_link_btn"
                    onClick={() =>
                      navigate("/doctor/doctor_appointments_management", {
                        state: { autoSelectId: app._id },
                      })
                    }
                  >
                    Open Slot
                  </button>
                </div>
              ))}
            {docAppts.filter((a) => a.status === "Upcoming").length === 0 && (
              <div className="doc_dashboard_empty_msg" style={{ padding: "10px 0" }}>No matching records scheduled inside the upcoming parameters queue.</div>
            )}
          </div>
        </div>
      </div>

      {/* --- 🟢 ADDED TIER: DYNAMIC DRILL-DOWN OVERLAY DETAILED VIEW PANEL MODAL --- */}
      {selectedEventDetail && (
        <div 
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}
          onClick={() => setSelectedEventDetail(null)}
        >
          <div 
            style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "90%", maxWidth: "500px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedEventDetail(null)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
            
            <div style={{ borderLeft: "4px solid #007acc", paddingLeft: "12px", marginBottom: "20px" }}>
              <span style={{ fontSize: "0.75rem", background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "12px", fontWeight: "700" }}>
                {selectedEventDetail.type || "Symposium Workshop"}
              </span>
              <h2 style={{ fontSize: "1.3rem", margin: "8px 0 0 0", color: "#0f172a" }}>{selectedEventDetail.title}</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}><Calendar size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }}/> Schedule Target</label>
                <strong style={{ fontSize: "0.85rem", color: "#334155" }}>{selectedEventDetail.date} • {selectedEventDetail.startTime || "09:00 AM"}</strong>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}><MapPin size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }}/> Location Facility</label>
                <strong style={{ fontSize: "0.85rem", color: "#334155" }}>{selectedEventDetail.location || "Auditorium"}</strong>
              </div>
            </div>

            <div style={{ marginBottom: "20px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#007acc", fontWeight: "700", marginBottom: "4px" }}><Layers size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }}/> Medical Tracks Covered</label>
              <strong style={{ fontSize: "0.85rem", color: "#1e293b" }}>
                {Array.isArray(selectedEventDetail.department) ? selectedEventDetail.department.join(", ") : selectedEventDetail.department}
              </strong>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px" }}>Administrative Abstract Abstract Notes</label>
              <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.6", background: "#f1f5f9", padding: "12px", borderRadius: "6px", margin: 0, fontStyle: "italic" }}>
                "{selectedEventDetail.notes || "No extra session outlines provided by clinical administration arrays for this calendar track index slot."}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}