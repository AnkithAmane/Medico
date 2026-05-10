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
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axios";
import "./Doctor_Dashboard.css";

ChartJS.register(
  LineElement, BarElement, ArcElement, CategoryScale, 
  LinearScale, PointElement, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth()

  // Data states
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Stats
  const [counts, setCounts] = useState({ total: 0, completed: 0, upcoming: 0 });

  // Fetch doctor profile and appointments
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        setLoading(true)

        // Get doctor profile by userId
        const docRes = await axiosInstance.get(`/doctors/user/${user._id}`)
        const doctor = docRes.data.data
        setDoctorProfile(doctor)

        // Get doctor appointments
        const apptRes = await axiosInstance.get(`/appointments/doctor/${doctor._id}`)
        const appts = apptRes.data.data || []
        setAppointments(appts)

        // Calculate counts
        setCounts({
          total: appts.length,
          completed: appts.filter(a => a.status === 'completed').length,
          upcoming: appts.filter(a => a.status === 'upcoming').length
        })

      } catch (err) {
        console.error('Failed to load doctor dashboard:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  // Next appointment today
  const today = new Date().toISOString().split('T')[0]
  const nextPat = useMemo(() => 
    appointments.find(a => a.date === today && a.status === 'upcoming'),
  [appointments, today])

  // Upcoming appointments
  const upcomingAppts = useMemo(() =>
    appointments.filter(a => a.status === 'upcoming').slice(0, 3),
  [appointments])

  // Completed appointments
  const completedAppts = useMemo(() =>
    appointments.filter(a => a.status === 'completed').slice(0, 3),
  [appointments])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading dashboard...</p>
    </div>
  )

  return (
    <div className="doc_dashboard_container doc_dashboard_view_fade_in">
      
      {/* Top Section Grid */}
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
            {/* Patient Traffic Trends */}
            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>Patient Traffic <span className="doc_dashboard_tag">Quarterly</span></h3>
                <button className="view-btn" onClick={() => navigate("/doctor/doctor_performance_dashboard")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="doc_dashboard_chart_box">
                <Line 
                  data={{
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    datasets: [{ 
                      label: "Performance", 
                      data: [
                        appointments.filter(a => {
                          const m = new Date(a.date).getMonth()
                          return m >= 0 && m <= 2
                        }).length,
                        appointments.filter(a => {
                          const m = new Date(a.date).getMonth()
                          return m >= 3 && m <= 5
                        }).length,
                        appointments.filter(a => {
                          const m = new Date(a.date).getMonth()
                          return m >= 6 && m <= 8
                        }).length,
                        appointments.filter(a => {
                          const m = new Date(a.date).getMonth()
                          return m >= 9 && m <= 11
                        }).length,
                      ],
                      borderColor: "#007acc", 
                      backgroundColor: "rgba(0,122,204,0.08)", 
                      tension: 0.4, fill: true, pointRadius: 4, borderWidth: 3 
                    }]
                  }} 
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                />
              </div>
            </div>

            {/* Consultation Mix */}
            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>Consultation Mix</h3>
              </div>
              <div className="doc_dashboard_chart_box_pie">
                <div className="doc_dashboard_pie_wrap">
                  <Doughnut 
                    data={{ 
                      labels: ["Online", "Routine", "Emergency"], 
                      datasets: [{ 
                        data: [
                          appointments.filter(a => a.type === 'online').length || 0,
                          appointments.filter(a => a.type === 'routine').length || 0,
                          appointments.filter(a => a.type === 'emergency').length || 0,
                        ], 
                        backgroundColor: ["#007acc", "#00d2ff", "#ef4444"], 
                        borderWidth: 0, cutout: '70%' 
                      }] 
                    }} 
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                  />
                </div>
                <div className="doc_dashboard_pie_legend">
                  <div className="doc_dashboard_leg_item"><span className="doc_dashboard_dot doc_dashboard_bg_blue"></span><span>Online</span></div>
                  <div className="doc_dashboard_leg_item"><span className="doc_dashboard_dot doc_dashboard_bg_cyan"></span><span>Routine</span></div>
                </div>
              </div>
            </div>

            {/* Appointments Overview */}
            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>Appointments Overview</h3>
                <button className="view-btn" onClick={() => navigate("/doctor/doctor_appointments_management")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="doc_dashboard_chart_box">
                <Bar 
                  data={{
                    labels: ["Upcoming", "Completed", "Cancelled"],
                    datasets: [{ 
                      label: "Volume", 
                      data: [counts.upcoming, counts.completed,
                        appointments.filter(a => a.status === 'cancelled').length
                      ], 
                      backgroundColor: ["#007acc", "#10b981", "#ef4444"], 
                      borderRadius: 6 
                    }]
                  }} 
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                />
              </div>
            </div>

            {/* Patient Satisfaction */}
            <div className="doc_dashboard_chart_card">
              <div className="doc_dashboard_chart_head">
                <h3>Patient Satisfaction</h3>
                <button className="view-btn" onClick={() => navigate("/doctor/doctor_review_management")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="doc_dashboard_ratings_stack">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="doc_dashboard_rating_line">
                    <div className="doc_dashboard_star_val">{star} <Star size={10} fill="#ffcd56" color="#ffcd56" /></div>
                    <div className="doc_dashboard_bar_bg">
                      <div className="doc_dashboard_bar_fill" style={{ width: `${star === 5 ? 80 : star * 10}%` }}></div>
                    </div>
                    <div className="doc_dashboard_rating_total">0</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="doc_dashboard_right_priority_stack">
          {/* Next Appointment Widget */}
          <div className="doc_dashboard_next_pat_card_elite">
            <div className="doc_dashboard_card_title_row">
              <div className="doc_dashboard_flex_center" style={{padding: '0'}}>
                <Zap size={16} color="#007acc" fill="#007acc" />
                <h3>Next Appointment</h3>
              </div>
              <span className="doc_dashboard_priority_tag">On Deck</span>
            </div>
            {nextPat ? (
              <div className="doc_dashboard_pat_profile_ui">
                <div className="doc_dashboard_pat_hero">
                  <div className="doc_dashboard_pat_avatar">
                    {nextPat.patientId?.userId?.firstName?.charAt(0) || 'P'}
                  </div>
                  <div className="doc_dashboard_pat_meta">
                    <strong>
                      {nextPat.patientId?.userId?.firstName} {nextPat.patientId?.userId?.lastName}
                    </strong>
                    <span>Record: #{nextPat.recordId}</span>
                  </div>
                </div>
                <div className="doc_dashboard_pat_bento_meta">
                  <div className="doc_dashboard_meta_tile"><span>Time</span><strong>{nextPat.time}</strong></div>
                  <div className="doc_dashboard_meta_tile"><span>Type</span><strong>{nextPat.type}</strong></div>
                </div>
                <button className="doc_dashboard_btn_initiate_consult" onClick={() => navigate("/doctor/doctor_appointments_management")}>
                  Initiate <ArrowRight size={14}/>
                </button>
              </div>
            ) : (
              <div className="doc_dashboard_empty_msg">No appointments for today.</div>
            )}
          </div>

          {/* Clinical Events Feed */}
          <div className="doc_dashboard_events_panel_elite">
            <div className="doc_dashboard_card_title_row">
              <div className="doc_dashboard_flex_center" style={{padding: '0'}}>
                <Calendar size={16} color="#007acc" />
                <h3>Clinical Events</h3>
              </div>
            </div>
            <div className="doc_dashboard_event_list_scroll">
              {upcomingAppts.slice(0, 3).map((appt, idx) => (
                <div key={idx} className="doc_dashboard_event_card doc_dashboard_blue">
                  <div className="doc_dashboard_date_badge">
                    <span>{appt.date?.split('-')[2]}</span>
                    <span>{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="doc_dashboard_event_info">
                    <strong>
                      {appt.patientId?.userId?.firstName || 'Patient'}
                    </strong>
                    <span>{appt.time} • {appt.type}</span>
                  </div>
                </div>
              ))}
              {upcomingAppts.length === 0 && (
                <div className="doc_dashboard_event_card doc_dashboard_blue">
                  <div className="doc_dashboard_event_info">
                    <strong>No upcoming events</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Feeds */}
      <div className="doc_dashboard_bottom_section">
        {/* Completed Cases */}
        <div className="doc_dashboard_info_card_modern">
          <div className="doc_dashboard_modern_header">
            <div className="doc_dashboard_header_info">
              <CheckCircle size={16} color="#10b981" />
              <h3>Recently Completed</h3>
            </div>
          </div>
          <div className="doc_dashboard_modern_grid">
            {completedAppts.map((app, i) => (
              <div className="doc_dashboard_modern_item_card" key={i}>
                <div className="doc_dashboard_item_main">
                  <div className="doc_dashboard_item_avatar"><User size={14} /></div>
                  <div className="doc_dashboard_item_details">
                    <strong>{app.patientId?.userId?.firstName || 'Patient'}</strong>
                    <span>{app.type}</span>
                  </div>
                </div>
                <div className="doc_dashboard_modern_badge doc_dashboard_bg_green">Finalized</div>
              </div>
            ))}
            {completedAppts.length === 0 && (
              <div className="doc_dashboard_modern_item_card">
                <span style={{color: '#94a3b8'}}>No completed appointments</span>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Queue */}
        <div className="doc_dashboard_info_card_modern">
          <div className="doc_dashboard_modern_header">
            <div className="doc_dashboard_header_info">
              <Clock4 size={16} color="#007acc" />
              <h3>Upcoming Queue</h3>
            </div>
          </div>
          <div className="doc_dashboard_modern_grid">
            {upcomingAppts.map((app, i) => (
              <div className="doc_dashboard_modern_item_card" key={i}>
                <div className="doc_dashboard_item_main">
                  <div className="doc_dashboard_item_avatar doc_dashboard_blue"><User size={14} /></div>
                  <div className="doc_dashboard_item_details">
                    <strong>{app.patientId?.userId?.firstName || 'Patient'}</strong>
                    <span>{app.time}</span>
                  </div>
                </div>
                <div className="doc_dashboard_modern_time_tag">{app.type}</div>
              </div>
            ))}
            {upcomingAppts.length === 0 && (
              <div className="doc_dashboard_modern_item_card">
                <span style={{color: '#94a3b8'}}>No upcoming appointments</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}