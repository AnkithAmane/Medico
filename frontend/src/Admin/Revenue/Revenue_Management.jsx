import React, { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// --- DATA IMPORTS ---
import appointmentsData from "../../Assets/Data/appointment.json";
import patientsData from "../../Assets/Data/patient.json";
import "./Revenue_Management.css";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, 
  LineElement, ArcElement, Tooltip, Legend, Filler
);

export default function Revenue_Management() {
  // --- 1. FILTERS & TIMING STATE ---
  const [trendView, setTrendView] = useState("Month"); 
  const [trendWeek, setTrendWeek] = useState("2026-W14");
  const [trendYear, setTrendYear] = useState("2026"); 
  const [deptMonth, setDeptMonth] = useState("2026-04");
  const [patientView, setPatientView] = useState("Age");
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSynced(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. REVENUE CALCULATION HELPERS ---
  const FEE_MAP = { "Emergency": 1500, "Follow-up": 300, "Routine": 500 };
  const getFee = (type) => FEE_MAP[type] || 500;

  const isDateInWeek = (dateStr, weekStr) => {
    const d = new Date(dateStr);
    const [year, week] = weekStr.split("-W");
    const firstDayOfYear = new Date(year, 0, 1);
    const days = Math.floor((d - firstDayOfYear) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    return d.getFullYear().toString() === year && weekNum.toString().padStart(2, '0') === week;
  };

  // --- 3. REVENUE HUB ANALYTICS LOGIC ---
  const stats = useMemo(() => {
    let lifetime = 0, yearTotal = 0, monthTotal = 0;
    const deptMap = {};

    appointmentsData.forEach(appt => {
      const fee = getFee(appt.type);
      lifetime += fee;
      if (appt.date.startsWith(trendYear)) {
        yearTotal += fee;
        if (appt.date.startsWith(deptMonth)) monthTotal += fee;
      }
      const dName = appt.department || "General";
      deptMap[dName] = (deptMap[dName] || 0) + fee;
    });

    return {
      lifetime: (lifetime / 100000).toFixed(1),
      year: (yearTotal / 100000).toFixed(1),
      month: (monthTotal / 1000).toFixed(1),
      highestDept: Object.entries(deptMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      avg: ((yearTotal / 4) / 100000).toFixed(1)
    };
  }, [deptMonth, trendYear]);

  // --- 4. DYNAMIC TREND ENGINE ---
  const trendData = useMemo(() => {
    if (trendView === "Week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const currentWeek = [0, 0, 0, 0, 0, 0, 0];
      
      appointmentsData.forEach(appt => {
        if (isDateInWeek(appt.date, trendWeek)) {
          const dayIdx = (new Date(appt.date).getDay() + 6) % 7;
          currentWeek[dayIdx] += getFee(appt.type);
        }
      });

      return {
        labels: days,
        datasets: [{
          label: `Weekly Revenue (${trendWeek})`,
          data: currentWeek,
          borderColor: "#007acc",
          backgroundColor: "rgba(0, 122, 204, 0.08)",
          fill: true,
          tension: 0.4,
        }]
      };
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const yearlyMonthlyData = Array(12).fill(0);

      appointmentsData.forEach(appt => {
        if (appt.date.startsWith(trendYear)) {
          const monthIdx = parseInt(appt.date.split("-")[1]) - 1;
          yearlyMonthlyData[monthIdx] += getFee(appt.type);
        }
      });

      return {
        labels: months,
        datasets: [{
          label: `Monthly Revenue (${trendYear})`,
          data: yearlyMonthlyData,
          borderColor: "#007acc",
          backgroundColor: "rgba(0, 122, 204, 0.08)",
          fill: true,
          tension: 0.4,
        }]
      };
    }
  }, [trendView, trendWeek, trendYear]);

  const topDoctors = useMemo(() => {
    const docMap = {};
    appointmentsData.forEach(a => {
      docMap[a.doctor] = (docMap[a.doctor] || 0) + getFee(a.type);
    });
    return Object.entries(docMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, rev]) => ({
        name,
        rev: `₹${(rev / 1000).toFixed(1)}K`,
        dept: appointmentsData.find(a => a.doctor === name)?.department || "Specialist"
      }));
  }, []);

  const deptData = useMemo(() => {
    const depts = ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "Gastroenterology"];
    const filtered = appointmentsData.filter(a => a.date.startsWith(deptMonth));
    const totals = depts.map(d => filtered.filter(a => a.department === d).reduce((s, c) => s + getFee(c.type), 0));

    return {
      labels: ["Cardio", "Ortho", "Neuro", "Peds", "Gastro"],
      datasets: [
        { label: "Actual", data: totals, backgroundColor: "#007acc", borderRadius: 5 },
        { label: "Target", data: totals.map(v => v === 0 ? 5000 : v * 1.2), backgroundColor: "rgba(0, 122, 204, 0.1)", borderRadius: 5 }
      ]
    };
  }, [deptMonth]);

  const patientData = useMemo(() => {
    const isAge = patientView === "Age";
    const values = isAge ? [
      patientsData.filter(p => p.age >= 19 && p.age < 60).length,
      patientsData.filter(p => p.age < 19).length,
      patientsData.filter(p => p.age >= 60).length
    ] : [
      patientsData.filter(p => p.gender === "Male").length,
      patientsData.filter(p => p.gender === "Female").length,
      0
    ];
    return {
      labels: isAge ? ["Adults", "Children", "Seniors"] : ["Male", "Female", "Other"],
      datasets: [{ data: values, backgroundColor: ["#007acc", "#00d2ff", "#1e293b"], borderWidth: 0 }]
    };
  }, [patientView]);

  return (
    <div className="sa_revenue_wrapper">
      <header className="sa_revenue_header">
        <div className="sa_header_text">
          <h1>Revenue <span>Hub</span></h1>
          <p>Live Pulse • {lastSynced}</p>
        </div>
        <div className="sa_export_suite">
          <button className="sa_export_btn">📄</button>
          <button className="sa_export_btn">📊</button>
          <button className="sa_export_btn">🖨️</button>
        </div>
      </header>

      {/* REVENUE STATS OVERVIEW */}
      <div className="sa_stats_bento">
        <div className="sa_stat_card primary">
          <div className="sa_pulse_ring"></div>
          <span className="sa_label">Lifetime Total</span>
          <h2 className="sa_value">₹{stats.lifetime}L</h2>
        </div>
        <div className="sa_stat_card">
          <span className="sa_label">Yearly {trendYear}</span>
          <h2 className="sa_value">₹{stats.year}L</h2>
          <div className="sa_pill_up">+18% ↑</div>
        </div>
        <div className="sa_stat_card">
          <span className="sa_label">Selected Month</span>
          <h2 className="sa_value">₹{stats.month}K</h2>
        </div>
        <div className="sa_stat_card highlight">
          <span className="sa_label">Highest Dept</span>
          <h2 className="sa_value" style={{fontSize: '1rem'}}>{stats.highestDept}</h2>
        </div>
        <div className="sa_stat_card">
          <span className="sa_label">Avg Monthly</span>
          <h2 className="sa_value">₹{stats.avg}L</h2>
        </div>
      </div>

      {/* TREND & LEADERBOARD MODULE */}
      <div className="sa_bento_row_sync">
        <div className="sa_bento_item span_2">
          <div className="sa_card_head">
            <div className="sa_title_with_toggle">
              <h3>Revenue Trend</h3>
              <div className="sa_mini_tabs">
                <button className={trendView === "Month" ? "active" : ""} onClick={() => setTrendView("Month")}>Year-Wise</button>
                <button className={trendView === "Week" ? "active" : ""} onClick={() => setTrendView("Week")}>Week-Wise</button>
              </div>
            </div>
            <div className="sa_calendar_input">
              {trendView === "Week" ? (
                <input type="week" value={trendWeek} onChange={(e) => setTrendWeek(e.target.value)} />
              ) : (
                <select 
                  className="sa_year_select" 
                  value={trendYear} 
                  onChange={(e) => setTrendYear(e.target.value)}
                  style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '10px', 
                    padding: '4px 10px', 
                    fontSize: '0.75rem', 
                    color: '#007acc', 
                    fontWeight: '600' 
                  }}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              )}
            </div>
          </div>
          <div className="sa_canvas_holder">
            <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } } } }} />
          </div>
        </div>

        <div className="sa_bento_item">
          <div className="sa_card_head"><h3>Top Contributors</h3></div>
          <div className="sa_doc_leaderboard">
            {topDoctors.map((doc, i) => (
              <div key={i} className="sa_list_row sa_drill_down">
                <div className="sa_list_info"><strong>{doc.name}</strong><span>{doc.dept}</span></div>
                <div className="sa_list_val">{doc.rev}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DEMOGRAPHICS & DEPT PERFORMANCE MODULE */}
      <div className="sa_bento_row_sync">
        <div className="sa_bento_item sa_patient_compact_card">
          <div className="sa_card_head">
            <h3>Demographics</h3>
            <div className="sa_mini_tabs">
              <button className={patientView === "Age" ? "active" : ""} onClick={() => setPatientView("Age")}>Age</button>
              <button className={patientView === "Gender" ? "active" : ""} onClick={() => setPatientView("Gender")}>Gen</button>
            </div>
          </div>
          <div className="sa_patient_center_content">
            <div className="sa_chart_focus_container_reduced">
              <Doughnut data={patientData} options={{ cutout: '80%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              <div className="sa_center_insight">
                <span className="sa_insight_label">Registry</span>
                <strong className="sa_insight_val">{patientsData.length}</strong>
              </div>
            </div>
          </div>
          <div className="sa_single_line_legend">
            {patientData.labels.map((label, idx) => (
              <div key={idx} className="sa_legend_pill">
                <span className="sa_dot" style={{ backgroundColor: ["#007acc", "#00d2ff", "#1e293b"][idx] }}></span>
                <span className="sa_pill_text">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sa_bento_item span_2 sa_dept_compact_card">
          <div className="sa_card_head">
            <h3>Dept. Performance</h3>
            <div className="sa_calendar_input">
              <input type="month" value={deptMonth} onChange={(e) => setDeptMonth(e.target.value)} />
            </div>
          </div>
          <div className="sa_canvas_holder_compact">
            <Bar data={deptData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}