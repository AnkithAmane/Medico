import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Line, Bar, Pie } from "react-chartjs-2";
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
} from "chart.js";
import {
  Clock,
  ExternalLink,
  User,
  Activity,
  CheckCircle,
  Clock4,
  Loader2,
} from "lucide-react";
import "./Admin_Dashboard.css";

// ChartJS configuration
ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
);

export default function Admin_Dashboard() {
  /* --- 1. MERN LIVE DATA STATES --- */
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState({
    doctors: [],
    patients: [],
    appointments: [],
  });

  // Running animated tracker values
  const [counts, setCounts] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
  });

  const [dateTime, setDateTime] = useState(new Date());
  const navigate = useNavigate();

  // Dynamic Date Parameters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  /* --- 2. MULTI-COLLECTION SYNCHRONIZATION --- */
  const fetchGlobalStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel fetch loops to bypass staging waterfalls
      const [docRes, patRes, apptRes] = await Promise.all([
        axios.get("http://localhost:5000/api/doctors/list", { headers }),
        axios.get("http://localhost:5000/api/patients/all", { headers }),
        axios.get("http://localhost:5000/api/appointments/all", { headers }),
      ]);

      setLiveData({
        doctors: docRes.data || [],
        patients: patRes.data || [],
        appointments: apptRes.data || [],
      });
    } catch (err) {
      console.error("MERN Global Synchronization Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* --- 3. COUNTER ANIMATION ENGINE --- */
  useEffect(() => {
    if (loading) return;

    let d = 0,
      p = 0,
      a = 0;
    const targetD = liveData.doctors.length;
    const targetP = liveData.patients.length;
    const targetA = liveData.appointments.length;

    const interval = setInterval(() => {
      let updated = false;

      if (d < targetD) {
        d++;
        updated = true;
      }
      if (p < targetP) {
        p += Math.ceil(targetP / 30) || 1;
        updated = true;
      }
      if (a < targetA) {
        a += Math.ceil(targetA / 30) || 1;
        updated = true;
      }

      setCounts({
        doctors: d > targetD ? targetD : d,
        patients: p > targetP ? targetP : p,
        appointments: a > targetA ? targetA : a,
      });

      if (!updated || (d >= targetD && p >= targetP && a >= targetA)) {
        setCounts({
          doctors: targetD,
          patients: targetP,
          appointments: targetA,
        });
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [loading, liveData]);

  /* --- 4. MEMOIZED ANALYTICS SUMMARY --- */
  const pieCounts = useMemo(() => {
    const data = liveData.patients || [];
    return [
      data.filter((p) => p.age > 60).length,
      data.filter(
        (p) =>
          (p.gender || "").toLowerCase() === "female" &&
          p.age <= 60 &&
          p.age >= 18,
      ).length,
      data.filter(
        (p) =>
          (p.gender || "").toLowerCase() === "male" &&
          p.age <= 60 &&
          p.age >= 18,
      ).length,
      data.filter((p) => p.age < 18).length,
    ];
  }, [liveData.patients]);

  if (loading) {
    return (
      <div className="admin_dash_load">
        <Loader2 className="spin" /> Synchronizing Global Registry...
      </div>
    );
  }

  return (
    <div className="admin_dashboard_dashboard-container">
      {/* Top Section: Metrics and Charts */}
      <div className="admin_dashboard_top-section">
        {/* Main Statistics and Charts */}
        <div className="admin_dashboard_left-column">
          {/* Metric Summary Cards */}
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

          {/* Analytics Visualizations */}
          <div className="admin_dashboard_charts-grid">
            {/* Registration Line Chart */}
            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <div className="admin_dashboard_header-main-group">
                  <h3>
                    Registered Statistics{" "}
                    <span className="admin_dashboard_inline-tag">
                      {currentYear}
                    </span>
                  </h3>
                </div>
                <button
                  className="admin_dashboard_view-btn"
                  onClick={() => navigate("/admin/statistics")}
                >
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap">
                <Line
                  data={{
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    datasets: [
                      {
                        label: "Patients",
                        data: [50, 75, 60, 90, 120, 80, 100],
                        borderColor: "#007acc",
                        backgroundColor: "rgba(0,122,204,0.15)",
                        tension: 0.4,
                        fill: true,
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

            {/* Revenue Bar Chart */}
            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <div className="admin_dashboard_header-main-group">
                  <h3>
                    Revenue Details{" "}
                    <span className="admin_dashboard_inline-tag">
                      {currentMonth}
                    </span>
                  </h3>
                </div>
                <button
                  className="admin_dashboard_view-btn"
                  onClick={() => navigate("/admin/revenue_details")}
                >
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap">
                <Bar
                  data={{
                    labels: ["W1", "W2", "W3", "W4"],
                    datasets: [
                      {
                        label: "Revenue",
                        data: [1200, 1500, 1000, 1800],
                        backgroundColor: "rgba(0,198,255,0.7)",
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

            {/* Patient Distribution Pie Chart */}
            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <h3>Patients by Type</h3>
                <button
                  className="admin_dashboard_view-btn"
                  onClick={() => navigate("/admin/patients_management")}
                >
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap-pie">
                <div className="admin_dashboard_pie-container">
                  <Pie
                    data={{
                      labels: ["Elders", "Women", "Men", "Children"],
                      datasets: [
                        {
                          data: pieCounts,
                          backgroundColor: [
                            "#ff6384",
                            "#36a2eb",
                            "#ffcd56",
                            "#4bc0c0",
                          ],
                          borderWidth: 1,
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
                <div className="admin_dashboard_pie-legend-slim">
                  {["Elders", "Women", "Men", "Children"].map((label, i) => (
                    <div
                      key={label}
                      className="admin_dashboard_legend-item-compact"
                    >
                      <span
                        className="admin_dashboard_dot-mini"
                        style={{
                          backgroundColor: [
                            "#ff6384",
                            "#36a2eb",
                            "#ffcd56",
                            "#4bc0c0",
                          ][i],
                        }}
                      ></span>
                      <span className="admin_dashboard_txt-mini">
                        {label} <strong>{pieCounts[i] || 0}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Load Bar Chart */}
            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <div className="admin_dashboard_header-main-group">
                  <h3>
                    Dept Statistics{" "}
                    <span className="admin_dashboard_inline-tag">Global</span>
                  </h3>
                </div>
                <button
                  className="admin_dashboard_view-btn"
                  onClick={() => navigate("/admin/departments_management")}
                >
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap">
                <Bar
                  data={{
                    labels: ["Cardio", "Ortho", "Gen", "Peds"],
                    datasets: [
                      {
                        label: "Patients",
                        data: [120, 90, 150, 80],
                        backgroundColor: [
                          "#007acc",
                          "#00c6ff",
                          "#36a2eb",
                          "#ff6384",
                        ],
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
          </div>
        </div>

        {/* Sidebar: Calendar and Events */}
        <div className="admin_dashboard_right-column">
          {/* DateTime Widget */}
          <div className="admin_dashboard_calendar-card">
            <div className="admin_dashboard_widget-header">
              <Clock size={20} color="#007acc" />
              <div className="admin_dashboard_live-time-group">
                <span className="admin_dashboard_live-time">
                  {dateTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <div className="admin_dashboard_live-date-single-line">
                  <span className="admin_dashboard_full-date-text">
                    {dateTime.toLocaleDateString(undefined, {
                      weekday: "long",
                    })}
                    ,{" "}
                    {dateTime.toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="admin_dashboard_calendar-widget-ui">
              <div className="admin_dashboard_cal-grid">
                {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                  <span key={d} className="admin_dashboard_cal-day-label">
                    {d}
                  </span>
                ))}
                {[...Array(31)].map((_, i) => (
                  <span
                    key={i}
                    className={`admin_dashboard_cal-date ${i + 1 === dateTime.getDate() ? "admin_dashboard_current" : ""}`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="admin_dashboard_events-section">
            <div className="admin_dashboard_modern-header">
              <div className="admin_dashboard_header-info">
                <Activity size={16} color="#007acc" />
                <h3>Upcoming Events</h3>
              </div>
              <button
                className="admin_dashboard_text-btn"
                onClick={() => navigate("/admin/events_management")}
              >
                View All
              </button>
            </div>
            <div className="admin_dashboard_events-list">
              <div
                className="admin_dashboard_event-card admin_dashboard_pink"
                onClick={() => navigate("/admin/events_management")}
              >
                <div className="admin_dashboard_event-date-badge">
                  <span>12</span>
                  <span>Apr</span>
                </div>
                <div className="admin_dashboard_event-info">
                  <strong className="admin_dashboard_event-name">
                    Health Camp
                  </strong>
                  <span className="admin_dashboard_event-time">
                    10:00 AM — Main Hall
                  </span>
                </div>
              </div>
              <div
                className="admin_dashboard_event-card admin_dashboard_blue"
                onClick={() => navigate("/admin/events_management")}
              >
                <div className="admin_dashboard_event-date-badge">
                  <span>15</span>
                  <span>Apr</span>
                </div>
                <div className="admin_dashboard_event-info">
                  <strong className="admin_dashboard_event-name">
                    Blood Donation
                  </strong>
                  <span className="admin_dashboard_event-time">
                    09:00 AM — Wing B
                  </span>
                </div>
              </div>
              <div
                className="admin_dashboard_event-card"
                onClick={() => navigate("/admin/events_management")}
              >
                <div className="admin_dashboard_event-date-badge">
                  <span>20</span>
                  <span>Apr</span>
                </div>
                <div className="admin_dashboard_event-info">
                  <strong className="admin_dashboard_event-name">
                    Doctor Conference
                  </strong>
                  <span className="admin_dashboard_event-time">
                    02:00 PM — Zoom
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Lists and Status */}
      <div className="admin_dashboard_bottom-section">
        {/* Doctor Status List */}
        <div className="admin_dashboard_info-card-modern">
          <div className="admin_dashboard_modern-header">
            <div className="admin_dashboard_header-info">
              <Activity size={16} color="#007acc" />
              <h3>Doctors Status</h3>
            </div>
            <button
              className="admin_dashboard_text-btn"
              onClick={() => navigate("/admin/doctors_management")}
            >
              View All
            </button>
          </div>
          <div className="admin_dashboard_modern-grid">
            {liveData.doctors.slice(0, 3).map((doc) => (
              <div
                className="admin_dashboard_modern-item-card"
                key={doc._id || doc.id}
                onClick={() => navigate("/admin/doctors_management")}
              >
                <div className="admin_dashboard_item-main">
                  <div className="admin_dashboard_item-avatar">
                    <User size={14} />
                  </div>
                  <div className="admin_dashboard_item-details">
                    <strong>{doc.name}</strong>
                    <span>{doc.department}</span>
                  </div>
                </div>
                <div
                  className={`admin_dashboard_modern-badge ${(doc.availability || "").toLowerCase() === "available" ? "admin_dashboard_bg-green" : "admin_dashboard_bg-red"}`}
                >
                  {doc.availability === "Available" ? (
                    <CheckCircle size={10} />
                  ) : (
                    <Clock4 size={10} />
                  )}
                  {doc.availability || "Offline"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Queue List */}
        <div className="admin_dashboard_info-card-modern">
          <div className="admin_dashboard_modern-header">
            <div className="admin_dashboard_header-info">
              <Clock4 size={16} color="#007acc" />
              <h3>Upcoming Queue</h3>
            </div>
            <button
              className="admin_dashboard_text-btn"
              onClick={() => navigate("/admin/appointments_management")}
            >
              Schedule
            </button>
          </div>
          <div className="admin_dashboard_modern-grid">
            {liveData.appointments.slice(0, 3).map((app) => (
              <div
                className="admin_dashboard_modern-item-card"
                key={app._id}
                onClick={() => navigate("/admin/appointments_management")}
              >
                <div className="admin_dashboard_item-main">
                  <div className="admin_dashboard_item-avatar admin_dashboard_blue">
                    <User size={14} />
                  </div>
                  <div className="admin_dashboard_item-details">
                    <strong>{app.patientName || app.patient}</strong>
                    <span>{app.type || "General Consultation"}</span>
                  </div>
                </div>
                <div className="admin_dashboard_modern-time-tag">
                  {app.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
