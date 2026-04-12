import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Clock, ExternalLink, User, Activity, CheckCircle, Clock4 } from "lucide-react";

import appointmentsData from "../../Assets/Data/appointment.json";
import doctorsData from "../../Assets/Data/doctor.json";
import patientsData from "../../Assets/Data/patient.json";
import "./Admin_Dashboard.css";

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function Admin_Dashboard() {
  const [doctors, setDoctors] = useState(0);
  const [patients, setPatients] = useState(0);
  const [appointments, setAppointments] = useState(0);
  const [dateTime, setDateTime] = useState(new Date());
  const navigate = useNavigate();

  const currentYear = "2026";
  const currentMonth = "April";

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let d = 0, p = 0, a = 0;
    const targetD = doctorsData.length;
    const targetP = patientsData.length;
    const targetA = appointmentsData.length;

    const interval = setInterval(() => {
      if (d < targetD) setDoctors(++d);

      if (p < targetP) {
        p += Math.ceil(targetP / 50);
        setPatients(p > targetP ? targetP : p);
      }

      if (a < targetA) {
        a += Math.ceil(targetA / 50);
        setAppointments(a > targetA ? targetA : a);
      }

      if (d >= targetD && p >= targetP && a >= targetA) {
        setDoctors(targetD);
        setPatients(targetP);
        setAppointments(targetA);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  const pieCounts = [
    patientsData.filter((p) => p.age > 60).length,
    patientsData.filter((p) => p.gender === "Female" && p.age <= 60).length,
    patientsData.filter((p) => p.gender === "Male" && p.age <= 60).length,
    patientsData.filter((p) => p.age < 18).length,
  ];

  return (
    <div className="admin_dashboard_dashboard-container">
      <div className="admin_dashboard_top-section">
        <div className="admin_dashboard_left-column">
          <div className="admin_dashboard_stats-cards">
            <div className="admin_dashboard_stat-card">
              <h3>Total Doctors</h3>
              <p>{doctors}</p>
            </div>
            <div className="admin_dashboard_stat-card">
              <h3>Total Patients</h3>
              <p>{patients}</p>
            </div>
            <div className="admin_dashboard_stat-card">
              <h3>Total Appointments</h3>
              <p>{appointments}</p>
            </div>
          </div>

          <div className="admin_dashboard_charts-grid">
            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <div className="admin_dashboard_header-main-group">
                  <h3>Registered Statistics <span className="admin_dashboard_inline-tag">{currentYear}</span></h3>
                </div>
                <button className="admin_dashboard_view-btn" onClick={() => navigate("/admin/s")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap">
                <Line
                  data={{
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    datasets: [{
                      label: "Patients",
                      data: [50, 75, 60, 90, 120, 80, 100],
                      borderColor: "#007acc",
                      backgroundColor: "rgba(0,122,204,0.15)",
                      tension: 0.4,
                      fill: true,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <div className="admin_dashboard_header-main-group">
                  <h3>Revenue Details <span className="admin_dashboard_inline-tag">{currentMonth}</span></h3>
                </div>
                <button className="admin_dashboard_view-btn" onClick={() => navigate("/admin/r")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap">
                <Bar
                  data={{
                    labels: ["W1", "W2", "W3", "W4"],
                    datasets: [{
                      label: "Revenue",
                      data: [1200, 1500, 1000, 1800],
                      backgroundColor: "rgba(0,198,255,0.7)",
                      borderRadius: 6,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <h3>Patients by Type</h3>
                <button className="admin_dashboard_view-btn" onClick={() => navigate("/admin/p_m")}>
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
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
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

            <div className="admin_dashboard_chart-card">
              <div className="admin_dashboard_chart-header-ui">
                <div className="admin_dashboard_header-main-group">
                  <h3>Dept Statistics <span className="admin_dashboard_inline-tag">Global</span></h3>
                </div>
                <button className="admin_dashboard_view-btn" onClick={() => navigate("/admin/department")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="admin_dashboard_chart-wrap">
                <Bar
                  data={{
                    labels: ["Cardio", "Ortho", "Gen", "Peds"],
                    datasets: [{
                      label: "Patients",
                      data: [120, 90, 150, 80],
                      backgroundColor: ["#007acc", "#00c6ff", "#36a2eb", "#ff6384"],
                      borderRadius: 6,
                    }],
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

        <div className="admin_dashboard_right-column">
          <div className="admin_dashboard_calendar-card">
            <div className="admin_dashboard_widget-header">
              <Clock size={20} color="#007acc" />
              <div className="admin_dashboard_live-time-group">
                <span className="admin_dashboard_live-time">
                  {dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <div className="admin_dashboard_live-date-single-line">
                  <span className="admin_dashboard_full-date-text">
                    {dateTime.toLocaleDateString(undefined, { weekday: "long" })}, {dateTime.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
            <div className="admin_dashboard_calendar-widget-ui">
              <div className="admin_dashboard_cal-grid">
                {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                  <span key={d} className="admin_dashboard_cal-day-label">{d}</span>
                ))}
                {[...Array(31)].map((_, i) => (
                  <span key={i} className={`admin_dashboard_cal-date ${i + 1 === dateTime.getDate() ? "admin_dashboard_current" : ""}`}>
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="admin_dashboard_events-section">
            <div className="admin_dashboard_modern-header">
              <div className="admin_dashboard_header-info">
                <Activity size={16} color="#007acc" />
                <h3>Upcoming Events</h3>
              </div>
              <button className="admin_dashboard_text-btn" onClick={() => navigate("/admin/e")}>View All</button>
            </div>
            <div className="admin_dashboard_events-list">
              <div className="admin_dashboard_event-card admin_dashboard_pink" onClick={() => navigate("/admin/e")}>
                <div className="admin_dashboard_event-date-badge"><span>12</span><span>Apr</span></div>
                <div className="admin_dashboard_event-info"><strong className="admin_dashboard_event-name">Health Camp</strong><span className="admin_dashboard_event-time">10:00 AM — Main Hall</span></div>
              </div>
              <div className="admin_dashboard_event-card admin_dashboard_blue" onClick={() => navigate("/admin/e")}>
                <div className="admin_dashboard_event-date-badge"><span>15</span><span>Apr</span></div>
                <div className="admin_dashboard_event-info"><strong className="admin_dashboard_event-name">Blood Donation</strong><span className="admin_dashboard_event-time">09:00 AM — Wing B</span></div>
              </div>
              <div className="admin_dashboard_event-card" onClick={() => navigate("/admin/e")}>
                <div className="admin_dashboard_event-date-badge"><span>20</span><span>Apr</span></div>
                <div className="admin_dashboard_event-info"><strong className="admin_dashboard_event-name">Doctor Conference</strong><span className="admin_dashboard_event-time">02:00 PM — Zoom</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin_dashboard_bottom-section">
        <div className="admin_dashboard_info-card-modern">
          <div className="admin_dashboard_modern-header">
            <div className="admin_dashboard_header-info">
              <Activity size={16} color="#007acc" />
              <h3>Doctors Status</h3>
            </div>
            <button className="admin_dashboard_text-btn" onClick={() => navigate("/admin/d_m")}>View All</button>
          </div>
          <div className="admin_dashboard_modern-grid">
            {doctorsData.slice(0, 3).map((doc) => (
              <div className="admin_dashboard_modern-item-card" key={doc.id} onClick={() => navigate("/admin/d_m")}>
                <div className="admin_dashboard_item-main">
                  <div className="admin_dashboard_item-avatar"><User size={14} /></div>
                  <div className="admin_dashboard_item-details"><strong>{doc.name}</strong><span>{doc.department}</span></div>
                </div>
                <div className={`admin_dashboard_modern-badge ${doc.availability === "Available" ? "admin_dashboard_bg-green" : "admin_dashboard_bg-red"}`}>
                  {doc.availability === "Available" ? <CheckCircle size={10} /> : <Clock4 size={10} />}
                  {doc.availability}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin_dashboard_info-card-modern">
          <div className="admin_dashboard_modern-header">
            <div className="admin_dashboard_header-info">
              <Clock4 size={16} color="#007acc" />
              <h3>Upcoming Queue</h3>
            </div>
            <button className="admin_dashboard_text-btn" onClick={() => navigate("/admin/a_m")}>Schedule</button>
          </div>
          <div className="admin_dashboard_modern-grid">
            {appointmentsData.slice(0, 3).map((app) => (
              <div className="admin_dashboard_modern-item-card" key={app.id} onClick={() => navigate("/admin/a_m")}>
                <div className="admin_dashboard_item-main">
                  <div className="admin_dashboard_item-avatar admin_dashboard_blue"><User size={14} /></div>
                  <div className="admin_dashboard_item-details"><strong>{app.patient}</strong><span>{app.type}</span></div>
                </div>
                <div className="admin_dashboard_modern-time-tag">{app.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}