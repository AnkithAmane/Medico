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
import "./Revenue_Management.css";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, 
  LineElement, ArcElement, Tooltip, Legend, Filler
);

export default function Revenue_Management() {
  const [trendWeek, setTrendWeek] = useState("2026-W14");
  const [deptMonth, setDeptMonth] = useState("2026-04");
  const [patientView, setPatientView] = useState("Age");
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSynced(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const trendData = useMemo(() => ({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Current",
        data: [6500, 7800, 4200, 9100, 6400, 10200, 8300],
        borderColor: "#007acc",
        backgroundColor: "rgba(0, 122, 204, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "Prev",
        data: [5800, 7000, 4500, 8200, 6000, 9500, 7800],
        borderColor: "rgba(0, 122, 204, 0.2)",
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      }
    ]
  }), [trendWeek]);

  const deptData = useMemo(() => ({
    labels: ["Cardio", "Ortho", "Neuro", "Peds", "Gen"],
    datasets: [
      {
        label: "Actual",
        data: [52000, 38000, 31000, 22000, 15000],
        backgroundColor: "#007acc",
        borderRadius: 5,
      },
      {
        label: "Target",
        data: [55000, 35000, 35000, 20000, 18000],
        backgroundColor: "rgba(0, 122, 204, 0.1)",
        borderRadius: 5,
      }
    ]
  }), [deptMonth]);

  const patientData = useMemo(() => {
    const isAge = patientView === "Age";
    const labels = isAge ? ["Adults", "Children", "Seniors"] : ["Male", "Female", "Other"];
    const colors = ["#007acc", "#00d2ff", "#1e293b"];
    const values = isAge ? [420000, 180000, 150000] : [380000, 360000, 10000];
    
    return {
      labels,
      colors,
      datasets: [{
        data: values,
        backgroundColor: colors,
        hoverOffset: 15,
        borderWidth: 0,
      }]
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

      {/* STATS */}
      <div className="sa_stats_bento">
        <div className="sa_stat_card primary">
          <div className="sa_pulse_ring"></div>
          <span className="sa_label">Lifetime Total</span>
          <h2 className="sa_value">₹84.2L</h2>
        </div>
        <div className="sa_stat_card">
          <span className="sa_label">This Year</span>
          <h2 className="sa_value">₹12.4L</h2>
          <div className="sa_pill_up">+18% ↑</div>
        </div>
        <div className="sa_stat_card">
          <span className="sa_label">This Month</span>
          <h2 className="sa_value">₹2.1L</h2>
        </div>
        <div className="sa_stat_card highlight">
          <span className="sa_label">Highest Dept</span>
          <h2 className="sa_value">Cardiology</h2>
        </div>
        <div className="sa_stat_card">
          <span className="sa_label">Avg Monthly</span>
          <h2 className="sa_value">₹1.8L</h2>
        </div>
      </div>

      {/* ROW 1 */}
      <div className="sa_bento_row_sync">
        <div className="sa_bento_item span_2">
          <div className="sa_card_head">
            <h3>Revenue Trend</h3>
            <div className="sa_calendar_input">
              <input type="week" value={trendWeek} onChange={(e) => setTrendWeek(e.target.value)} />
            </div>
          </div>
          <div className="sa_canvas_holder">
            <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="sa_bento_item">
          <div className="sa_card_head"><h3>Top Contributors</h3></div>
          <div className="sa_doc_leaderboard">
            {[
              { name: "Dr. Aditya", dept: "Cardio", rev: "₹2.4L" },
              { name: "Dr. Vikram", dept: "Ortho", rev: "₹1.8L" },
              { name: "Dr. Sneha", dept: "Neuro", rev: "₹1.2L" }
            ].map((doc, i) => (
              <div key={i} className="sa_list_row sa_drill_down">
                <div className="sa_list_info"><strong>{doc.name}</strong><span>{doc.dept}</span></div>
                <div className="sa_list_val">{doc.rev}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 2: REDUCED HEIGHT SYNC */}
      <div className="sa_bento_row_sync">
        {/* PATIENT ANALYTICS (1/3) */}
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
                <span className="sa_insight_label">Total</span>
                <strong className="sa_insight_val">₹7.5L</strong>
              </div>
            </div>
          </div>

          <div className="sa_single_line_legend">
            {patientData.labels.map((label, idx) => (
              <div key={idx} className="sa_legend_pill">
                <span className="sa_dot" style={{ backgroundColor: patientData.colors[idx] }}></span>
                <span className="sa_pill_text">{label}</span>
                <span className="sa_pill_perc">{((patientData.datasets[0].data[idx] / 750000) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* DEPT PERFORMANCE (2/3) */}
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