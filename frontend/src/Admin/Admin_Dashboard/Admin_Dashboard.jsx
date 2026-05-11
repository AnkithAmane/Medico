import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, BarElement, ArcElement,
  CategoryScale, LinearScale, PointElement, Tooltip, Legend,
} from "chart.js";
import { Clock, ExternalLink, User, Activity, CheckCircle, Clock4 } from "lucide-react";
import axiosInstance from "../../utils/axios";
import "./Admin_Dashboard.css";

ChartJS.register(LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Admin_Dashboard() {
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(new Date());

  // Real data states
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 })
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  // Animated counters
  const [counts, setCounts] = useState({ doctors: 0, patients: 0, appointments: 0 })

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [docRes, patRes, apptRes] = await Promise.all([
          axiosInstance.get('/doctors'),
          axiosInstance.get('/patients'),
          axiosInstance.get('/appointments')
        ])
        const docData = docRes.data.data || []
        const patData = patRes.data.data || []
        const apptData = apptRes.data.data || []

        setDoctors(docData)
        setPatients(patData)
        setAppointments(apptData)
        setStats({
          doctors: docData.length,
          patients: patData.length,
          appointments: apptData.length
        })

        // Animate counters
        let d = 0, p = 0, a = 0
        const interval = setInterval(() => {
          if (d < docData.length) d++
          if (p < patData.length) p += Math.ceil(patData.length / 50)
          if (a < apptData.length) a += Math.ceil(apptData.length / 50)
          setCounts({
            doctors: Math.min(d, docData.length),
            patients: Math.min(p, patData.length),
            appointments: Math.min(a, apptData.length)
          })
          if (d >= docData.length && p >= patData.length && a >= apptData.length) {
            clearInterval(interval)
          }
        }, 20)
      } catch (err) {
        console.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Patient demographics
  const pieCounts = [
    patients.filter(p => {
      const age = p.age || (p.userId?.dateOfBirth ? 
        new Date().getFullYear() - new Date(p.userId.dateOfBirth).getFullYear() : 0)
      return age > 60
    }).length,
    patients.filter(p => p.userId?.gender === 'Female').length,
    patients.filter(p => p.userId?.gender === 'Male').length,
    patients.filter(p => {
      const age = p.age || 0
      return age < 18
    }).length,
  ]

  // Monthly appointments chart
  const monthlyData = Array(7).fill(0)
  appointments.forEach(a => {
    const day = new Date(a.date).getDay()
    if (day >= 0 && day < 7) monthlyData[day]++
  })

  // Revenue by week (based on appointment fees)
  const weeklyRevenue = [0, 0, 0, 0]
  appointments.forEach(a => {
    const date = new Date(a.date)
    const day = date.getDate()
    const week = Math.floor((day - 1) / 7)
    if (week < 4) weeklyRevenue[week] += (a.fees || 500)
  })

  // Dept stats from doctors
  const deptCounts = {
    Cardio: doctors.filter(d => d.specialization === 'Cardiology').length,
    Ortho: doctors.filter(d => d.specialization === 'Orthopedics').length,
    Gen: doctors.filter(d => d.specialization === 'General').length,
    Peds: doctors.filter(d => d.specialization === 'Pediatrics').length,
  }

  // Recent appointments
  const recentAppts = appointments
    .filter(a => a.status === 'upcoming')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3)

  return (
    <div className="admin_dashboard_dashboard-container">
      <div className="admin_dashboard_top-section">
        <div className="admin_dashboard_left-column">

          {/* Stats Cards */}
          <div className="admin_dashboard_stats-cards">
            <div className="admin_dashboard_stat-card">
              <h3>Total Doctors</h3>
              <p>{counts.doctors}</p>
            </div>
            <div className="admin_dashboard_stat-card">
              <h3>Total Patients</h3>
              <p>{counts.patients}</p>
            </div>
            <div className="admin_dashboard_stat-card">
              <h3>Total Appointments</h3>
              <p>{counts.appointments}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="admin_dashboard_charts-grid">

            {/* Appointments Trend */}
            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <h3>Appointment Trends <span className="admin_dashboard_inline-tag">Weekly</span></h3>
                <button className="admin_dashboard_view-btn" onClick={() => navigate("/admin/statistics")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap">
                <Line
                  data={{
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    datasets: [{
                      label: "Appointments",
                      data: monthlyData,
                      borderColor: "#007acc",
                      backgroundColor: "rgba(0,122,204,0.15)",
                      tension: 0.4,
                      fill: true,
                    }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                />
              </div>
            </div>

            {/* Revenue */}
            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <h3>Revenue Details <span className="admin_dashboard_inline-tag">Monthly</span></h3>
                <button className="admin_dashboard_view-btn" onClick={() => navigate("/admin/revenue_details")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap">
                <Bar
                  data={{
                    labels: ["W1", "W2", "W3", "W4"],
                    datasets: [{
                      label: "Revenue",
                      data: weeklyRevenue,
                      backgroundColor: "rgba(0,198,255,0.7)",
                      borderRadius: 6,
                    }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                />
              </div>
            </div>

            {/* Patient Distribution */}
            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <h3>Patients by Type</h3>
                <button className="admin_dashboard_view-btn" onClick={() => navigate("/admin/patients_management")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap-pie">
                <div className="admin_dashboard_pie-container">
                  <Pie
                    data={{
                      labels: ["Elders", "Women", "Men", "Children"],
                      datasets: [{
                        data: pieCounts,
                        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"],
                        borderWidth: 1,
                      }],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                  />
                </div>
                <div className="admin_dashboard_pie-legend-slim">
                  {["Elders", "Women", "Men", "Children"].map((label, i) => (
                    <div key={label} className="admin_dashboard_legend-item-compact">
                      <span className="admin_dashboard_dot-mini" style={{ backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"][i] }}></span>
                      <span className="admin_dashboard_txt-mini">{label} <strong>{pieCounts[i]}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dept Stats */}
            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <h3>Dept Statistics <span className="admin_dashboard_inline-tag">Global</span></h3>
                <button className="admin_dashboard_view-btn" onClick={() => navigate("/admin/departments_management")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap">
                <Bar
                  data={{
                    labels: Object.keys(deptCounts),
                    datasets: [{
                      label: "Doctors",
                      data: Object.values(deptCounts),
                      backgroundColor: ["#007acc", "#00c6ff", "#36a2eb", "#ff6384"],
                      borderRadius: 6,
                    }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="admin_dashboard_right-column">

          {/* Clock */}
          <div className="admin_dashboard_calendar-card">
            <div className="admin_dashboard_widget-header">
              <Clock size={20} color="#007acc" />
              <div className="admin_dashboard_live-time-group">
                <span className="admin_dashboard_live-time">
                  {dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <div className="admin_dashboard_live-date-single-line">
                  <span className="admin_dashboard_full-date-text">
                    {dateTime.toLocaleDateString(undefined, { weekday: "long" })},{" "}
                    {dateTime.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
            <div className="admin_dashboard_calendar-widget-ui">
              <div className="admin_dashboard_cal-grid">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="admin_dashboard_cal-day-label">{d}</span>
                ))}
                {[...Array(31)].map((_, i) => (
                  <span key={i} className={`admin_dashboard_cal-date ${i + 1 === dateTime.getDate() ? "admin_dashboard_current" : ""}`}>
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Events */}
          <div className="admin_dashboard_events-section">
            <div className="admin_dashboard_modern-header">
              <div className="admin_dashboard_header-info">
                <Activity size={16} color="#007acc" />
                <h3>Upcoming Appointments</h3>
              </div>
            </div>
            <div className="admin_dashboard_events-list">
              {recentAppts.length > 0 ? recentAppts.map((appt, i) => (
                <div key={i} className={`admin_dashboard_event-card ${i === 0 ? 'admin_dashboard_pink' : 'admin_dashboard_blue'}`}
                  onClick={() => navigate("/admin/appointments_management")}>
                  <div className="admin_dashboard_event-date-badge">
                    <span>{appt.date?.split('-')[2]}</span>
                    <span>{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="admin_dashboard_event-info">
                    <strong className="admin_dashboard_event-name">
                      {appt.patientId?.userId?.firstName || 'Patient'}
                    </strong>
                    <span className="admin_dashboard_event-time">
                      {appt.time} • {appt.type}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="admin_dashboard_event-card">
                  <div className="admin_dashboard_event-info">
                    <strong>No upcoming appointments</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="admin_dashboard_bottom-section">

        {/* Doctors Status */}
        <div className="admin_dashboard_info-card-modern">
          <div className="admin_dashboard_modern-header">
            <div className="admin_dashboard_header-info">
              <Activity size={16} color="#007acc" />
              <h3>Doctors Status</h3>
            </div>
            <button className="admin_dashboard_text-btn" onClick={() => navigate("/admin/doctors_management")}>
              View All
            </button>
          </div>
          <div className="admin_dashboard_modern-grid">
            {doctors.slice(0, 3).map((doc) => (
              <div className="admin_dashboard_modern-item-card" key={doc._id}
                onClick={() => navigate("/admin/doctors_management")}>
                <div className="admin_dashboard_item-main">
                  <div className="admin_dashboard_item-avatar"><User size={14} /></div>
                  <div className="admin_dashboard_item-details">
                    <strong>{doc.name}</strong>
                    <span>{doc.specialization}</span>
                  </div>
                </div>
                <div className={`admin_dashboard_modern-badge ${doc.isAvailable ? "admin_dashboard_bg-green" : "admin_dashboard_bg-red"}`}>
                  {doc.isAvailable ? <CheckCircle size={10} /> : <Clock4 size={10} />}
                  {doc.isAvailable ? 'Available' : 'Busy'}
                </div>
              </div>
            ))}
            {doctors.length === 0 && (
              <div className="admin_dashboard_modern-item-card">
                <span style={{ color: '#94a3b8' }}>No doctors found</span>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Queue */}
        <div className="admin_dashboard_info-card-modern">
          <div className="admin_dashboard_modern-header">
            <div className="admin_dashboard_header-info">
              <Clock4 size={16} color="#007acc" />
              <h3>Upcoming Queue</h3>
            </div>
            <button className="admin_dashboard_text-btn" onClick={() => navigate("/admin/appointments_management")}>
              Schedule
            </button>
          </div>
          <div className="admin_dashboard_modern-grid">
            {recentAppts.map((app, i) => (
              <div className="admin_dashboard_modern-item-card" key={i}
                onClick={() => navigate("/admin/appointments_management")}>
                <div className="admin_dashboard_item-main">
                  <div className="admin_dashboard_item-avatar admin_dashboard_blue"><User size={14} /></div>
                  <div className="admin_dashboard_item-details">
                    <strong>{app.patientId?.userId?.firstName || 'Patient'}</strong>
                    <span>{app.type}</span>
                  </div>
                </div>
                <div className="admin_dashboard_modern-time-tag">{app.time}</div>
              </div>
            ))}
            {recentAppts.length === 0 && (
              <div className="admin_dashboard_modern-item-card">
                <span style={{ color: '#94a3b8' }}>No upcoming appointments</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}