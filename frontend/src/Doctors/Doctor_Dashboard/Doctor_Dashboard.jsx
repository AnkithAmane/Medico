import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, BarElement, ArcElement, CategoryScale,
  LinearScale, PointElement, Tooltip, Legend, Filler,
} from "chart.js";
import { 
  ExternalLink, User, Activity, CheckCircle, Clock4, 
  Star, TrendingUp, ArrowRight, Calendar, Zap 
} from "lucide-react";

// --- DATA IMPORTS ---
import appointmentsData from "../../Assets/Data/appointment.json";
import doctorsData from "../../Assets/Data/doctor.json";
import "./Doctor_Dashboard.css";

ChartJS.register(
  LineElement, BarElement, ArcElement, CategoryScale, 
  LinearScale, PointElement, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ total: 0, completed: 0, pending: 0 });

  // --- LOGIC: CONTEXT & FILTERING ---
  const currentDoc = useMemo(() => doctorsData[0] || {}, []);
  const todayStr = "2026-04-06"; 

  const docAppts = useMemo(() => 
    appointmentsData.filter(a => a.doctor === currentDoc.name), 
    [currentDoc.name]
  );

  const nextPat = useMemo(() => 
    docAppts.find(a => a.date === todayStr && a.status === "Upcoming"), 
    [docAppts]
  );

  // --- COUNTER ANIMATION ---
  useEffect(() => {
    let t = 0, c = 0, p = 0;
    const targetT = docAppts.length;
    const targetC = docAppts.filter(a => a.status === "Completed").length;
    const targetP = docAppts.filter(a => a.status === "Upcoming").length;

    const interval = setInterval(() => {
      let updated = false;
      if (t < targetT) { t++; updated = true; }
      if (c < targetC) { c++; updated = true; }
      if (p < targetP) { p++; updated = true; }
      
      setCounts({ total: t, completed: c, pending: p });
      if (!updated) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [docAppts]);

  return (
    <div className="dr_dashboard_container view_fade_in">
      
      <div className="dr_top_grid_layout">
        
        {/* LEFT COLUMN: PRIMARY ANALYTICS */}
        <div className="dr_left_analytics_stack">
          
          <div className="dr_stats_cards_row">
            <div className="dr_stat_tile">
              <h3>Total Consultations</h3>
              <p>{counts.total}</p>
            </div>
            <div className="dr_stat_tile">
              <h3>Successful Cases</h3>
              <p>{counts.completed}</p>
            </div>
            <div className="dr_stat_tile">
              <h3>Upcoming Slots</h3>
              <p>{counts.pending}</p>
            </div>
          </div>

          <div className="dr_charts_bento">
            {/* 1. PATIENT TRAFFIC */}
            <div className="dr_chart_card">
              <div className="dr_chart_head">
                <h3>Patient Traffic <span className="dr_tag">Current Week</span></h3>
                <button className="dr_icon_btn" onClick={() => navigate("/doctor/performance")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="dr_chart_box">
                <Line 
                  data={{
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    datasets: [{ 
                      label: "Patients", 
                      data: [12, 19, 15, 25, 22, 30, 10], 
                      borderColor: "#007acc", 
                      backgroundColor: "rgba(0,122,204,0.08)", 
                      tension: 0.4, fill: true, pointRadius: 4, borderWidth: 3 
                    }]
                  }} 
                  options={{ 
                    responsive: true, maintainAspectRatio: false, 
                    plugins: { legend: { display: false } }, 
                    scales: { 
                      x: { grid: { display: false }, ticks: { font: { size: 10 } } }, 
                      y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { stepSize: 5, font: { size: 10 } } } 
                    } 
                  }} 
                />
              </div>
            </div>

            {/* 2. CONSULTATION DISTRIBUTION */}
            <div className="dr_chart_card">
              <div className="dr_chart_head"><h3>Consultation Mix</h3></div>
              <div className="dr_chart_box_pie">
                <div className="dr_pie_wrap">
                  <Doughnut 
                    data={{ 
                      labels: ["New Patients", "Follow-ups"], 
                      datasets: [{ 
                        data: [65, 35], 
                        backgroundColor: ["#007acc", "#00d2ff"], 
                        borderWidth: 0, cutout: '70%' 
                      }] 
                    }} 
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                  />
                </div>
                <div className="dr_pie_legend">
                  <div className="dr_leg_item"><span className="dr_dot bg_blue"></span><span>New <strong>65%</strong></span></div>
                  <div className="dr_leg_item"><span className="dr_dot bg_cyan"></span><span>Follow-up <strong>35%</strong></span></div>
                </div>
              </div>
            </div>

            {/* 3. APPOINTMENTS OVERVIEW */}
            <div className="dr_chart_card">
              <div className="dr_chart_head"><h3>Appointments Overview</h3></div>
              <div className="dr_chart_box">
                <Bar 
                  data={{
                    labels: ["Pending", "Completed", "Cancelled"],
                    datasets: [{ 
                      label: "Volume", 
                      data: [counts.pending, counts.completed, 4], 
                      backgroundColor: ["#007acc", "#10b981", "#ef4444"], 
                      borderRadius: 6 
                    }]
                  }} 
                  options={{ 
                    responsive: true, maintainAspectRatio: false, 
                    plugins: { legend: { display: false } },
                    scales: { 
                      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                      y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 10 } } }
                    }
                  }} 
                />
              </div>
            </div>

            {/* 4. PATIENT SATISFACTION */}
            <div className="dr_chart_card">
              <div className="dr_chart_head"><h3>Patient Satisfaction</h3></div>
              <div className="dr_ratings_stack">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="dr_rating_line">
                    <div className="dr_star_val">{star} <Star size={10} fill="#ffcd56" color="#ffcd56" /></div>
                    <div className="dr_bar_bg">
                      <div className="dr_bar_fill" style={{ width: `${star === 5 ? 90 : star === 4 ? 70 : star === 3 ? 45 : 20}%` }}></div>
                    </div>
                    <div className="dr_rating_total">{star * 14}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: PRIORITY HUD & EVENTS */}
        <div className="dr_right_priority_stack">
          
          {/* NEXT APPOINTMENT HUD */}
          <div className="dr_next_pat_card_elite">
             <div className="dr_card_title_row">
                <div className="dr_flex_center"><Zap size={16} color="#007acc" fill="#007acc" /><h3>Next Appointment</h3></div>
                <span className="dr_priority_tag">On Deck</span>
             </div>
             {nextPat ? (
                <div className="dr_pat_profile_ui">
                   <div className="dr_pat_hero">
                      <div className="dr_pat_avatar">{nextPat.patient?.charAt(0)}</div>
                      <div className="dr_pat_meta">
                         <strong>{nextPat.patient}</strong>
                         <span>Record: #MS-2026-0{nextPat.id}</span>
                      </div>
                   </div>
                   <div className="dr_pat_bento_meta">
                      <div className="dr_meta_tile"><span>Time Slot</span><strong>{nextPat.time}</strong></div>
                      <div className="dr_meta_tile"><span>Visit Type</span><strong>{nextPat.type}</strong></div>
                      <div className="dr_meta_tile"><span>Age</span><strong>28</strong></div>
                      <div className="dr_meta_tile"><span>Gender</span><strong>M</strong></div>
                   </div>
                   <button className="dr_btn_initiate_consult" onClick={() => navigate("/doctor/patients")}>
                      Start Consultation <ArrowRight size={14}/>
                   </button>
                </div>
             ) : (
                <div className="dr_empty_msg">No appointments scheduled for this slot.</div>
             )}
          </div>

          {/* CLINICAL EVENTS PANEL */}
          <div className="dr_events_panel_elite">
            <div className="dr_card_title_row">
              <div className="dr_flex_center"><Calendar size={16} color="#007acc" /><h3>Clinical Events</h3></div>
              <button className="dr_text_btn">View All</button>
            </div>
            <div className="dr_event_list_scroll">
              <div className="dr_event_card pink">
                <div className="dr_date_badge"><span>12</span><span>Apr</span></div>
                <div className="dr_event_info"><strong>General Seminar</strong><span>10:00 AM — Main Hall</span></div>
              </div>
              <div className="dr_event_card blue">
                <div className="dr_date_badge"><span>15</span><span>Apr</span></div>
                <div className="dr_event_info"><strong>Clinical Audit</strong><span>09:00 AM — Wing C</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: RECENT & QUEUE */}
      <div className="bottom-section">
        <div className="info-card-modern">
          <div className="modern-header">
            <div className="header-info"><CheckCircle size={16} color="#10b981" /><h3>Recently Completed</h3></div>
            <button className="text-btn" onClick={() => navigate("/doctor/appointments")}>View History</button>
          </div>
          <div className="modern-grid">
            {docAppts.filter(a => a.status === "Completed").slice(0, 3).map(app => (
              <div className="modern-item-card" key={app.id}>
                <div className="item-main">
                  <div className="item-avatar"><User size={14} /></div>
                  <div className="item-details"><strong>{app.patient}</strong><span>{app.type} Consultation</span></div>
                </div>
                <div className="modern-badge bg_green">Finalized</div>
              </div>
            ))}
          </div>
        </div>

        <div className="info-card-modern">
          <div className="modern-header">
            <div className="header-info"><Clock4 size={16} color="#007acc" /><h3>Upcoming Queue</h3></div>
            <button className="text-btn" onClick={() => navigate("/doctor/appointments")}>Schedule</button>
          </div>
          <div className="modern-grid">
            {docAppts.filter(a => a.status === "Upcoming").slice(0, 3).map(app => (
              <div className="modern-item-card" key={app.id}>
                <div className="item-main">
                  <div className="item-avatar blue"><User size={14} /></div>
                  <div className="item-details"><strong>{app.patient}</strong><span>{app.type}</span></div>
                </div>
                <div className="modern-time-tag">{app.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}