import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, BarElement, ArcElement, CategoryScale,
  LinearScale, PointElement, Tooltip, Legend, Filler,
} from "chart.js";
import { 
  ExternalLink, User, CheckCircle, Clock4, 
  Star, ArrowRight, Calendar, Zap 
} from "lucide-react";

import appointmentsData from "../../Assets/Data/appointment.json";
import doctorsData from "../../Assets/Data/doctor.json";
import "./Doctor_Dashboard.css";

ChartJS.register(
  LineElement, BarElement, ArcElement, CategoryScale, 
  LinearScale, PointElement, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const navigate = useNavigate();
// Change this line:
const [counts, setCounts] = useState({ total: 0, completed: 0, upcoming: 0 });
  // 1. Access the specific doctor data (Dr. Vijay K is index 5 in your context)
  const currentDoc = useMemo(() => doctorsData[5] || {}, []);
  const todayStr = "2026-04-06"; 

  // 2. Filter global appointments to only this doctor
  const docAppts = useMemo(() => 
    appointmentsData.filter(a => a.doctor === currentDoc.name), 
    [currentDoc.name]
  );

  const nextPat = useMemo(() => 
    docAppts.find(a => a.date === todayStr && a.status === "Upcoming"), 
    [docAppts]
  );

  // Calculate review average for the "Satisfaction" section
  const ratingData = useMemo(() => {
    const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    currentDoc.reviews?.forEach(rev => {
      if (stars[rev.rating] !== undefined) stars[rev.rating]++;
    });
    return stars;
  }, [currentDoc.reviews]);

 useEffect(() => {
  let t = 0, c = 0, u = 0; // Initialize local 'u' for upcoming
  const targetT = docAppts.length;
  const targetC = docAppts.filter(a => a.status === "Completed").length;
  const targetU = docAppts.filter(a => a.status === "Upcoming").length; // Target for upcoming

  const interval = setInterval(() => {
    let updated = false;
    if (t < targetT) { t++; updated = true; }
    if (c < targetC) { c++; updated = true; }
    if (u < targetU) { u++; updated = true; } // Increment upcoming
    
    setCounts({ total: t, completed: c, upcoming: u }); // Update state with upcoming
    if (!updated) clearInterval(interval);
  }, 20);
  return () => clearInterval(interval);
}, [docAppts]);

  return (
    <div className="doc_dashboard_container doc_dashboard_view_fade_in">
      
      <div className="doc_dashboard_top_grid_layout">
        
        <div className="doc_dashboard_left_analytics_stack">
          
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

          <div className="doc_dashboard_charts_bento">
            {/* 1. PATIENT TRAFFIC (Using performanceStats from JSON) */}
            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>Patient Traffic <span className="doc_dashboard_tag">Quarterly</span></h3>
                <button className="view-btn" onClick={() => navigate("/doctor/analytics")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="doc_dashboard_chart_box">
                <Line 
                  data={{
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    datasets: [{ 
                      label: "Performance", 
                      data: currentDoc.performanceStats || [0,0,0,0], 
                      borderColor: "#007acc", 
                      backgroundColor: "rgba(0,122,204,0.08)", 
                      tension: 0.4, fill: true, pointRadius: 4, borderWidth: 3 
                    }]
                  }} 
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                />
              </div>
            </div>

            {/* 2. CONSULTATION MIX */}
            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>Consultation Mix</h3>
              </div>
              <div className="doc_dashboard_chart_box_pie">
                <div className="doc_dashboard_pie_wrap">
                  <Doughnut 
                    data={{ 
                      labels: ["New", "Follow-ups"], 
                      datasets: [{ 
                        data: [counts.total > 0 ? 65 : 0, counts.total > 0 ? 35 : 0], 
                        backgroundColor: ["#007acc", "#00d2ff"], 
                        borderWidth: 0, cutout: '70%' 
                      }] 
                    }} 
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                  />
                </div>
                <div className="doc_dashboard_pie_legend">
                  <div className="doc_dashboard_leg_item"><span className="doc_dashboard_dot doc_dashboard_bg_blue"></span><span>New</span></div>
                  <div className="doc_dashboard_leg_item"><span className="doc_dashboard_dot doc_dashboard_bg_cyan"></span><span>Follow-up</span></div>
                </div>
              </div>
            </div>

            {/* 3. APPOINTMENTS OVERVIEW */}
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
                    datasets: [{ 
                      label: "Volume", 
                      data: [counts.pending, counts.completed], 
                      backgroundColor: ["#007acc", "#10b981"], 
                      borderRadius: 6 
                    }]
                  }} 
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                />
              </div>
            </div>

            {/* 4. PATIENT SATISFACTION (Accessing reviews data) */}
            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>Patient Satisfaction</h3>
                <button className="view-btn" onClick={() => navigate("/doctor/reviews")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="doc_dashboard_ratings_stack">
                {[5, 4, 3, 2, 1].map((star) => {
                    const totalReviews = currentDoc.reviews?.length || 1;
                    const percentage = ((ratingData[star] || 0) / totalReviews) * 100;
                    return (
                        <div key={star} className="doc_dashboard_rating_line">
                            <div className="doc_dashboard_star_val">{star} <Star size={10} fill="#ffcd56" color="#ffcd56" /></div>
                            <div className="doc_dashboard_bar_bg">
                                <div className="doc_dashboard_bar_fill" style={{ width: `${percentage || (star === 5 ? 80 : 10)}%` }}></div>
                            </div>
                            <div className="doc_dashboard_rating_total">{ratingData[star] || 0}</div>
                        </div>
                    );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="doc_dashboard_right_priority_stack">
          <div className="doc_dashboard_next_pat_card_elite">
             <div className="doc_dashboard_card_title_row">
                <div className="doc_dashboard_flex_center" style={{padding: '0'}}><Zap size={16} color="#007acc" fill="#007acc" /><h3>Next Appointment</h3></div>
                <span className="doc_dashboard_priority_tag">On Deck</span>
             </div>
             {nextPat ? (
                <div className="doc_dashboard_pat_profile_ui">
                   <div className="doc_dashboard_pat_hero">
                      <div className="doc_dashboard_pat_avatar">{nextPat.patient?.charAt(0)}</div>
                      <div className="doc_dashboard_pat_meta">
                         <strong>{nextPat.patient}</strong>
                         <span>Record: #MS-2026-0{nextPat.id}</span>
                      </div>
                   </div>
                   <div className="doc_dashboard_pat_bento_meta">
                      <div className="doc_dashboard_meta_tile"><span>Time</span><strong>{nextPat.time}</strong></div>
                      <div className="doc_dashboard_meta_tile"><span>Type</span><strong>{nextPat.type}</strong></div>
                   </div>
                   <button className="doc_dashboard_btn_initiate_consult" onClick={() => navigate("/doctor/patients")}>
                      Initiate <ArrowRight size={14}/>
                   </button>
                </div>
             ) : (
                <div className="doc_dashboard_empty_msg">No appointments for today.</div>
             )}
          </div>

          <div className="doc_dashboard_events_panel_elite">
            <div className="doc_dashboard_card_title_row">
              <div className="doc_dashboard_flex_center" style={{padding: '0'}}><Calendar size={16} color="#007acc" /><h3>Clinical Events</h3></div>
            </div>
            <div className="doc_dashboard_event_list_scroll">
              {/* Mapping Upcoming Leaves as Events */}
              {currentDoc.leaves?.upcoming.map((leave, idx) => (
                <div key={idx} className="doc_dashboard_event_card doc_dashboard_pink">
                   <div className="doc_dashboard_date_badge">
                     <span>{leave.startDate.split('-')[2]}</span>
                     <span>{new Date(leave.startDate).toLocaleString('default', { month: 'short' })}</span>
                   </div>
                   <div className="doc_dashboard_event_info">
                     <strong>{leave.reason}</strong>
                     <span>Leave ends: {leave.endDate}</span>
                   </div>
                </div>
              ))}
              <div className="doc_dashboard_event_card doc_dashboard_blue">
                <div className="doc_dashboard_date_badge"><span>15</span><span>Apr</span></div>
                <div className="doc_dashboard_event_info"><strong>Clinical Audit</strong><span>09:00 AM</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="doc_dashboard_bottom_section">
        <div className="doc_dashboard_info_card_modern">
          <div className="doc_dashboard_modern_header">
            <div className="doc_dashboard_header_info"><CheckCircle size={16} color="#10b981" /><h3>Recently Completed</h3></div>
          </div>
          <div className="doc_dashboard_modern_grid">
            {docAppts.filter(a => a.status === "Completed").slice(0, 3).map(app => (
              <div className="doc_dashboard_modern_item_card" key={app.id}>
                <div className="doc_dashboard_item_main">
                  <div className="doc_dashboard_item_avatar"><User size={14} /></div>
                  <div className="doc_dashboard_item_details"><strong>{app.patient}</strong><span>{app.type}</span></div>
                </div>
                <div className="doc_dashboard_modern_badge doc_dashboard_bg_green">Finalized</div>
              </div>
            ))}
          </div>
        </div>

        <div className="doc_dashboard_info_card_modern">
          <div className="doc_dashboard_modern_header">
            <div className="doc_dashboard_header_info"><Clock4 size={16} color="#007acc" /><h3>Upcoming Queue</h3></div>
          </div>
          <div className="doc_dashboard_modern_grid">
            {docAppts.filter(a => a.status === "Upcoming").slice(0, 3).map(app => (
              <div className="doc_dashboard_modern_item_card" key={app.id}>
                <div className="doc_dashboard_item_main">
                  <div className="doc_dashboard_item_avatar doc_dashboard_blue"><User size={14} /></div>
                  <div className="doc_dashboard_item_details"><strong>{app.patient}</strong><span>{app.time}</span></div>
                </div>
                <div className="doc_dashboard_modern_time_tag">{app.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}