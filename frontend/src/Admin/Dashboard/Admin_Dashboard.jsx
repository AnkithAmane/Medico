import React, { useEffect, useState } from "react";
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
import { Clock, Calendar as CalIcon } from "lucide-react";
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

  // LIVE CLOCK LOGIC
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // YOUR ORIGINAL ANIMATION LOGIC (Fully Restored)
  useEffect(() => {
    let d = 0, p = 0, a = 0;
    const interval = setInterval(() => {
      if (d < 120) setDoctors(++d);
      if (p < 5000) setPatients(p += 50);
      if (a < 300) setAppointments(++a);
      if (d >= 120 && p >= 5000 && a >= 300) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  // YOUR ORIGINAL CHART DATA (Fully Restored)
  const patientsData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Patients Registered",
        data: [50, 75, 60, 90, 120, 80, 100],
        borderColor: "#007acc",
        backgroundColor: "rgba(0,122,204,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Revenue",
        data: [1200, 1500, 1000, 1800, 1400],
        backgroundColor: "rgba(0,198,255,0.7)",
        borderRadius: 6,
      },
    ],
  };

  const patientsTypeData = {
    labels: ["Elders", "Women", "Men", "Children"],
    datasets: [
      {
        data: [120, 200, 300, 150],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"],
        borderWidth: 2,
      },
    ],
  };

  const departmentData = {
    labels: ["Cardiology", "Orthopedics", "General Medicine", "Pediatrics"],
    datasets: [
      {
        label: "Patients",
        data: [120, 90, 150, 80],
        backgroundColor: ["#007acc", "#00c6ff", "#36a2eb", "#ff6384"],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      {/* TOP SECTION */}
      <div className="top-section">
        <div className="left-column">
          <div className="stats-cards">
            <div className="stat-card"><h3>Total Doctors</h3><p>{doctors}</p></div>
            <div className="stat-card"><h3>Total Patients</h3><p>{patients}</p></div>
            <div className="stat-card"><h3>Total Appointments</h3><p>{appointments}</p></div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Patients Registered Statistics</h3>
              <div className="chart-wrap"><Line data={patientsData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>
            <div className="chart-card">
              <h3>Revenue Details</h3>
              <div className="chart-wrap"><Bar data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>
            <div className="chart-card">
              <h3>Patients by Type</h3>
              <div className="chart-wrap"><Pie data={patientsTypeData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>
            <div className="chart-card">
              <h3>Department Statistics</h3>
              <div className="chart-wrap"><Bar data={departmentData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>
          </div>
        </div>

        {/* CALENDAR WIDGET SECTION */}
        <div className="right-column">
          <div className="calendar-card">
            <div className="widget-header">
                <Clock size={18} />
                <div className="live-time-group">
                    <span className="live-time">{dateTime.toLocaleTimeString()}</span>
                    <span className="live-date">{dateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>
            <div className="calendar-widget-ui">
                <div className="cal-month-header">{dateTime.toLocaleString('default', { month: 'long' })} {dateTime.getFullYear()}</div>
                <div className="cal-grid">
                    {['M','T','W','T','F','S','S'].map(d => <span key={d} className="cal-day-label">{d}</span>)}
                    {[...Array(31)].map((_, i) => (
                        <span key={i} className={`cal-date ${i + 1 === dateTime.getDate() ? 'current' : ''}`}>{i + 1}</span>
                    ))}
                </div>
            </div>
          </div>
          
          <div className="events-section">
            <h3>Upcoming Events</h3>
            <div className="events-list">
              <div className="event-card">Health Camp - 2nd April</div>
              <div className="event-card">Blood Donation Drive - 5th April</div>
              <div className="event-card">Doctor Conference - 10th April</div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="bottom-section">
        <div className="info-card">
          <h3>Doctors Availability</h3>
          <table className="availability-table">
            <thead><tr><th>Name</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Dr. Ramesh</td><td className="status available">Available</td></tr>
              <tr><td>Dr. Priya</td><td className="status not-available">Not Available</td></tr>
            </tbody>
          </table>
        </div>
        <div className="info-card">
          <h3>Upcoming Patients</h3>
          <ul className="patients-list">
            <li>Patient A - 11:00 AM</li>
            <li>Patient B - 11:30 AM</li>
            <li>Patient C - 12:00 PM</li>
          </ul>
        </div>
      </div>
    </div>
  );
}