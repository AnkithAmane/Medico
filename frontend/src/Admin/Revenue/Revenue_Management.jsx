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

import appointmentsData from "../../Assets/Data/appointment.json";
import patientsData from "../../Assets/Data/patient.json";
import doctorsData from "../../Assets/Data/doctor.json";
import "./Revenue_Management.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function Revenue_Management() {
  const [trendView, setTrendView] = useState("Month");
  const [trendWeek, setTrendWeek] = useState("2026-W14");
  const [trendYear, setTrendYear] = useState(2026);
  const [deptMonth, setDeptMonth] = useState("2026-04");
  const [contributorMonth, setContributorMonth] = useState("2026-04");
  const [patientView, setPatientView] = useState("Age");
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSynced(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getApptRevenue = (doctorName) => {
    const doctor = doctorsData.find((d) => d.name === doctorName);
    return doctor ? doctor.fee : 500;
  };

  const isDateInWeek = (dateStr, weekStr) => {
    const d = new Date(dateStr);
    const [year, week] = weekStr.split("-W");
    const firstDayOfYear = new Date(year, 0, 1);
    const days = Math.floor((d - firstDayOfYear) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    return (
      d.getFullYear().toString() === year &&
      weekNum.toString().padStart(2, "0") === week
    );
  };

  const globalStats = useMemo(() => {
    let lifetimeRevenue = 0;
    const deptTotals = {};

    appointmentsData.forEach((appt) => {
      const fee = getApptRevenue(appt.doctor);
      lifetimeRevenue += fee;
      const dName = appt.department || "General";
      deptTotals[dName] = (deptTotals[dName] || 0) + fee;
    });

    const highestDept =
      Object.entries(deptTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
      lifetime: (lifetimeRevenue / 100000).toFixed(1),
      avgAppt: (lifetimeRevenue / appointmentsData.length).toFixed(0),
      highestDept: highestDept,
      totalRegistry: patientsData.length,
      staffCount: doctorsData.length
    };
  }, []);

  const trendData = useMemo(() => {
    if (trendView === "Week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const currentWeek = [0, 0, 0, 0, 0, 0, 0];
      appointmentsData.forEach((appt) => {
        if (isDateInWeek(appt.date, trendWeek)) {
          const dayIdx = (new Date(appt.date).getDay() + 6) % 7;
          currentWeek[dayIdx] += getApptRevenue(appt.doctor);
        }
      });
      return {
        labels: days,
        datasets: [
          {
            label: `Weekly Revenue`,
            data: currentWeek,
            borderColor: "#007acc",
            backgroundColor: "rgba(0, 122, 204, 0.08)",
            fill: true,
            tension: 0.4
          }
        ]
      };
    } else {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      const yearlyMonthlyData = Array(12).fill(0);
      appointmentsData.forEach((appt) => {
        if (appt.date.startsWith(trendYear.toString())) {
          const monthIdx = parseInt(appt.date.split("-")[1]) - 1;
          yearlyMonthlyData[monthIdx] += getApptRevenue(appt.doctor);
        }
      });
      return {
        labels: months,
        datasets: [
          {
            label: `Monthly Revenue`,
            data: yearlyMonthlyData,
            borderColor: "#007acc",
            backgroundColor: "rgba(0, 122, 204, 0.08)",
            fill: true,
            tension: 0.4
          }
        ]
      };
    }
  }, [trendView, trendWeek, trendYear]);

  const topDoctors = useMemo(() => {
    const docMap = {};
    const filteredByMonth = appointmentsData.filter((a) =>
      a.date.startsWith(contributorMonth)
    );
    filteredByMonth.forEach((a) => {
      docMap[a.doctor] = (docMap[a.doctor] || 0) + getApptRevenue(a.doctor);
    });
    return Object.entries(docMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, rev]) => ({
        name,
        rev: `₹${(rev / 1000).toFixed(1)}K`,
        dept: doctorsData.find((d) => d.name === name)?.department || "Specialist"
      }));
  }, [contributorMonth]);

  const deptData = useMemo(() => {
    const depts = [
      "Cardiology",
      "Orthopedics",
      "Neurology",
      "Pediatrics",
      "Gastroenterology"
    ];
    const filtered = appointmentsData.filter((a) => a.date.startsWith(deptMonth));
    const totals = depts.map((d) =>
      filtered
        .filter((a) => a.department === d)
        .reduce((s, c) => s + getApptRevenue(c.doctor), 0)
    );
    return {
      labels: ["Cardio", "Ortho", "Neuro", "Peds", "Gastro"],
      datasets: [
        {
          label: "Actual",
          data: totals,
          backgroundColor: "#007acc",
          borderRadius: 5
        },
        {
          label: "Target",
          data: totals.map((v) => (v === 0 ? 5000 : v * 1.2)),
          backgroundColor: "rgba(0, 122, 204, 0.1)",
          borderRadius: 5
        }
      ]
    };
  }, [deptMonth]);

  const patientData = useMemo(() => {
    const isAge = patientView === "Age";
    const values = isAge
      ? [
          patientsData.filter((p) => p.age >= 19 && p.age < 60).length,
          patientsData.filter((p) => p.age < 19).length,
          patientsData.filter((p) => p.age >= 60).length
        ]
      : [
          patientsData.filter((p) => p.gender === "Male").length,
          patientsData.filter((p) => p.gender === "Female").length,
          patientsData.filter((p) => p.gender !== "Male" && p.gender !== "Female").length
        ];
    return {
      labels: isAge ? ["Adults", "Children", "Seniors"] : ["Male", "Female", "Other"],
      datasets: [
        {
          data: values,
          backgroundColor: ["#007acc", "#00d2ff", "#1e293b"],
          borderWidth: 0
        }
      ]
    };
  }, [patientView]);

  return (
    <div className="admin_rev_m_wrapper">
      <header className="admin_rev_m_header">
        <div className="admin_rev_m_header_text">
          <h1>Revenue <span>Hub</span></h1>
          <p>Live Pulse • {lastSynced}</p>
        </div>
        <div className="admin_rev_m_export_suite">
          <button className="admin_rev_m_export_btn">📄</button>
          <button className="admin_rev_m_export_btn">📊</button>
          <button className="admin_rev_m_export_btn">🖨️</button>
        </div>
      </header>

      <div className="admin_rev_m_stats_bento">
        <div className="admin_rev_m_stat_card admin_rev_m_primary">
          <div className="admin_rev_m_pulse_ring"></div>
          <span className="admin_rev_m_label">Lifetime Revenue</span>
          <h2 className="admin_rev_m_value">₹{globalStats.lifetime}L</h2>
        </div>
        <div className="admin_rev_m_stat_card">
          <span className="admin_rev_m_label">Patient Registry</span>
          <h2 className="admin_rev_m_value">{globalStats.totalRegistry}</h2>
          <div className="admin_rev_m_pill_up">+12% ↑</div>
        </div>
        <div className="admin_rev_m_stat_card">
          <span className="admin_rev_m_label">Avg Consulting</span>
          <h2 className="admin_rev_m_value">₹{globalStats.avgAppt}</h2>
        </div>
        <div className="admin_rev_m_stat_card admin_rev_m_highlight">
          <span className="admin_rev_m_label">Lead Dept</span>
          <h2 className="admin_rev_m_value" style={{ fontSize: "0.9rem" }}>
            {globalStats.highestDept}
          </h2>
        </div>
        <div className="admin_rev_m_stat_card">
          <span className="admin_rev_m_label">Clinical Staff</span>
          <h2 className="admin_rev_m_value">{globalStats.staffCount}</h2>
        </div>
      </div>

      <div className="admin_rev_m_bento_row">
        <div className="admin_rev_m_bento_item admin_rev_m_span_2">
          <div className="admin_rev_m_card_head">
            <div className="admin_rev_m_title_with_toggle">
              <h3>Revenue Trend</h3>
              <div className="admin_rev_m_filter_cluster">
                <div className="admin_rev_m_mini_tabs">
                  <button
                    className={trendView === "Month" ? "admin_rev_m_active" : ""}
                    onClick={() => setTrendView("Month")}
                  >
                    Yearly
                  </button>
                  <button
                    className={trendView === "Week" ? "admin_rev_m_active" : ""}
                    onClick={() => setTrendView("Week")}
                  >
                    Weekly
                  </button>
                </div>
                <div className="admin_rev_m_calendar_input">
                  {trendView === "Week" ? (
                    <input
                      type="week"
                      className="admin_rev_m_year_select"
                      value={trendWeek}
                      onChange={(e) => setTrendWeek(e.target.value)}
                    />
                  ) : (
                    <input
                      type="number"
                      className="admin_rev_m_year_select"
                      value={trendYear}
                      onChange={(e) => setTrendYear(e.target.value)}
                      style={{ width: "85px" }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="admin_rev_m_canvas_holder">
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { grid: { display: false } } }
              }}
            />
          </div>
        </div>

        <div className="admin_rev_m_bento_item">
          <div className="admin_rev_m_card_head">
            <div className="admin_rev_m_title_with_toggle">
              <h3>Contributors</h3>
              <input
                type="month"
                className="admin_rev_m_year_select"
                value={contributorMonth}
                onChange={(e) => setContributorMonth(e.target.value)}
                style={{ fontSize: "0.7rem", padding: "4px 8px" }}
              />
            </div>
          </div>
          <div className="admin_rev_m_doc_leaderboard">
            {topDoctors.length > 0 ? (
              topDoctors.map((doc, i) => (
                <div key={i} className="admin_rev_m_list_row">
                  <div className="admin_rev_m_list_info">
                    <strong>{doc.name}</strong>
                    <span>{doc.dept}</span>
                  </div>
                  <div className="admin_rev_m_list_val">{doc.rev}</div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "40px" }}>
                No records found
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="admin_rev_m_bento_row">
        <div className="admin_rev_m_bento_item admin_rev_m_patient_card">
          <div className="admin_rev_m_card_head">
            <div className="admin_rev_m_title_with_toggle">
              <h3>Demographics</h3>
              <div className="admin_rev_m_mini_tabs">
                <button
                  className={patientView === "Age" ? "admin_rev_m_active" : ""}
                  onClick={() => setPatientView("Age")}
                >
                  Age
                </button>
                <button
                  className={patientView === "Gender" ? "admin_rev_m_active" : ""}
                  onClick={() => setPatientView("Gender")}
                >
                  Gen
                </button>
              </div>
            </div>
          </div>
          <div className="admin_rev_m_patient_content">
            <div className="admin_rev_m_doughnut_box">
              <Doughnut
                data={patientData}
                options={{
                  cutout: "80%",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }}
              />
              <div className="admin_rev_m_center_insight">
                <span className="admin_rev_m_insight_label">Registry</span>
                <strong className="admin_rev_m_insight_val">
                  {patientsData.length}
                </strong>
              </div>
            </div>
          </div>
          <div className="admin_rev_m_legend">
            {patientData.labels.map((label, idx) => (
              <div key={idx} className="admin_rev_m_legend_pill">
                <span
                  className="admin_rev_m_dot"
                  style={{
                    backgroundColor: ["#007acc", "#00d2ff", "#1e293b"][idx]
                  }}
                ></span>
                <span className="admin_rev_m_pill_text">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin_rev_m_bento_item admin_rev_m_span_2">
          <div className="admin_rev_m_card_head">
            <div className="admin_rev_m_title_with_toggle">
              <h3>Dept. Performance</h3>
              <input
                type="month"
                className="admin_rev_m_year_select"
                value={deptMonth}
                onChange={(e) => setDeptMonth(e.target.value)}
              />
            </div>
          </div>
          <div className="admin_rev_m_canvas_holder_compact">
            <Bar
              data={deptData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}