import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this
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

// --- DATA IMPORTS ---
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
  const navigate = useNavigate(); // Initialize navigation

  const currentYear = "2026";
  const currentMonth = "April";

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let d = 0,
      p = 0,
      a = 0;
    const targetD = doctorsData.length;
    const targetP = patientsData.length;
    const targetA = appointmentsData.length;

    const interval = setInterval(() => {
      if (d < targetD) setDoctors(++d);
      if (p < targetP) setPatients((p += Math.ceil(targetP / 50)));
      if (a < targetA) setAppointments(++a);
      if (d >= targetD && p >= targetP && a >= targetA) {
        setPatients(targetP);
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, []);

  const pieCounts = [
    patientsData.filter((p) => p.age > 60).length,
    patientsData.filter((p) => p.gender === "Female" && p.age <= 60).length,
    patientsData.filter((p) => p.gender === "Male" && p.age <= 60).length,
    patientsData.filter((p) => p.age < 18).length,
  ];

  return (
    <div className="dashboard-container">
      <div className="top-section">
        <div className="left-column">
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Doctors</h3>
              <p>{doctors}</p>
            </div>
            <div className="stat-card">
              <h3>Total Patients</h3>
              <p>{patients}</p>
            </div>
            <div className="stat-card">
              <h3>Total Appointments</h3>
              <p>{appointments}</p>
            </div>
          </div>

          <div className="charts-grid">
            {/* 1. REGISTERED STATS */}
            <div className="chart-card">
              <div className="chart-header-ui">
                <div className="header-main-group">
                  <h3>
                    Registered Statistics <span className="inline-tag">{currentYear}</span>
                  </h3>
                </div>
                <button className="view-btn" onClick={() => navigate("/admin/s")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="chart-wrap">
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

            {/* 2. REVENUE DETAILS */}
            <div className="chart-card">
              <div className="chart-header-ui">
                <div className="header-main-group">
                  <h3>
                    Revenue Details <span className="inline-tag">{currentMonth}</span>
                  </h3>
                </div>
                <button className="view-btn" onClick={() => navigate("/admin/r")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="chart-wrap">
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

            {/* 3. PATIENTS BY TYPE (With Navigation) */}
            <div className="chart-card">
              <div className="chart-header-ui">
                <h3>Patients by Type</h3>
                <button className="view-btn" onClick={() => navigate("/admin/p_m")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="chart-wrap-pie">
                <div className="pie-container">
                  <Pie
                    data={{
                      labels: ["Elders", "Women", "Men", "Children"],
                      datasets: [
                        {
                          data: pieCounts,
                          backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"],
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
                <div className="pie-legend-slim">
                  {["Elders", "Women", "Men", "Children"].map((label, i) => (
                    <div key={label} className="legend-item-compact">
                      <span
                        className="dot-mini"
                        style={{
                          backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"][i],
                        }}
                      ></span>
                      <span className="txt-mini">
                        {label} <strong>{pieCounts[i]}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. DEPARTMENT STATS (With Navigation) */}
            <div className="chart-card">
              <div className="chart-header-ui">
                <div className="header-main-group">
                  <h3>
                    Dept Statistics <span className="inline-tag">Global</span>
                  </h3>
                </div>
                <button className="view-btn" onClick={() => navigate("/admin/d")}>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="chart-wrap">
                <Bar
                  data={{
                    labels: ["Cardio", "Ortho", "Gen", "Peds"],
                    datasets: [
                      {
                        label: "Patients",
                        data: [120, 90, 150, 80],
                        backgroundColor: ["#007acc", "#00c6ff", "#36a2eb", "#ff6384"],
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

        <div className="right-column">
          <div className="calendar-card">
            <div className="widget-header">
              <Clock size={20} color="#007acc" />
              <div className="live-time-group">
                <span className="live-time">
                  {dateTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <div className="live-date-single-line">
                  <span className="full-date-text">
                    {dateTime.toLocaleDateString(undefined, { weekday: "long" })},{" "}
                    {dateTime.toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="calendar-widget-ui">
              <div className="cal-grid">
                {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                  <span key={d} className="cal-day-label">
                    {d}
                  </span>
                ))}
                {[...Array(31)].map((_, i) => (
                  <span
                    key={i}
                    className={`cal-date ${i + 1 === dateTime.getDate() ? "current" : ""}`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="events-section">
            <div className="modern-header">
              <div className="header-info">
                <Activity size={16} color="#007acc" />
                <h3>Upcoming Events</h3>
              </div>
              <button className="text-btn" onClick={() => navigate("/admin/e")}>
                View All
              </button>
            </div>

            <div className="events-list">
              {/* Event 1 */}
              <div className="event-card pink" onClick={() => navigate("/admin/e")}>
                <div className="event-date-badge">
                  <span>12</span>
                  <span>Apr</span>
                </div>
                <div className="event-info">
                  <strong className="event-name">Health Camp</strong>
                  <span className="event-time">10:00 AM — Main Hall</span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="event-card blue" onClick={() => navigate("/admin/e")}>
                <div className="event-date-badge">
                  <span>15</span>
                  <span>Apr</span>
                </div>
                <div className="event-info">
                  <strong className="event-name">Blood Donation</strong>
                  <span className="event-time">09:00 AM — Wing B</span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="event-card" onClick={() => navigate("/admin/e")}>
                <div className="event-date-badge">
                  <span>20</span>
                  <span>Apr</span>
                </div>
                <div className="event-info">
                  <strong className="event-name">Doctor Conference</strong>
                  <span className="event-time">02:00 PM — Zoom</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-section">
        {/* DOCTORS STATUS */}
        <div className="info-card-modern">
          <div className="modern-header">
            <div className="header-info">
              <Activity size={16} color="#007acc" />
              <h3>Doctors Status</h3>
            </div>
            <button className="text-btn" onClick={() => navigate("/admin/d_m")}>
              View All
            </button>
          </div>
          <div className="modern-grid">
            {doctorsData.slice(0, 3).map((doc) => (
              <div
                className="modern-item-card"
                key={doc.id}
                onClick={() => navigate("/admin/d_m")}
              >
                <div className="item-main">
                  <div className="item-avatar">
                    <User size={14} />
                  </div>
                  <div className="item-details">
                    <strong>{doc.name}</strong>
                    <span>{doc.department}</span>
                  </div>
                </div>
                <div
                  className={`modern-badge ${
                    doc.availability === "Available" ? "bg-green" : "bg-red"
                  }`}
                >
                  {doc.availability === "Available" ? (
                    <CheckCircle size={10} />
                  ) : (
                    <Clock4 size={10} />
                  )}
                  {doc.availability}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING QUEUE */}
        <div className="info-card-modern">
          <div className="modern-header">
            <div className="header-info">
              <Clock4 size={16} color="#007acc" />
              <h3>Upcoming Queue</h3>
            </div>
            <button className="text-btn" onClick={() => navigate("/admin/a_m")}>
              Schedule
            </button>
          </div>
          <div className="modern-grid">
            {appointmentsData.slice(0, 3).map((app) => (
              <div
                className="modern-item-card"
                key={app.id}
                onClick={() => navigate("/admin/a_m")}
              >
                <div className="item-main">
                  <div className="item-avatar blue">
                    <User size={14} />
                  </div>
                  <div className="item-details">
                    <strong>{app.patient}</strong>
                    <span>{app.type}</span>
                  </div>
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