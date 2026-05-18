import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
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
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Award, CheckCircle, Activity, Star, Zap, Loader2 } from "lucide-react";
import "./Doctor_Performance_Dashboard.css";

// ChartJS registration
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

export default function PerformanceDashboard() {
  // Sync state
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());
  const [loading, setLoading] = useState(true);

  // Data States for Backend
  const [doctorsList, setDoctorsList] = useState([]);
  const [appointmentsData, setAppointmentsData] = useState([]);

  // Filtering state management
  const [bookingView, setBookingView] = useState("Month");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedWeek, setSelectedWeek] = useState("2026-W14");
  const [rankMonth, setRankMonth] = useState("2026-03");

  // 1. Backend Connectivity: Fetch Data
  // 1. Backend Connectivity: Fetch Data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [docRes, apptRes] = await Promise.all([
        axios.get("http://localhost:5000/api/doctors/list", {
          headers: { Authorization: `Bearer ${token}` },
        }), // 🟢 FIXED: Changed from /all to /list
        axios.get("http://localhost:5000/api/appointments/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDoctorsList(docRes.data);
      setAppointmentsData(apptRes.data);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Clinical Intelligence sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Specialist context (Dynamic from Login)
  const doctorUser = JSON.parse(localStorage.getItem("userData")) || {};
  const currentDoc = useMemo(() => {
    return (
      doctorsList.find((doc) => doc.doctorId === doctorUser.doctorId) ||
      doctorUser
    );
  }, [doctorsList, doctorUser]);

  // Main KPI Calculation logic
  const kpis = useMemo(() => {
    const myAppts = appointmentsData.filter(
      (a) => a.doctorName === currentDoc.name,
    );
    const completedCount = myAppts.filter(
      (a) => a.status === "Completed",
    ).length;

    const ratings = currentDoc.reviews?.map((r) => r.rating) || [];
    const avgRating = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : "4.8";

    const totalEvents =
      (currentDoc.events?.completed?.length || 0) +
      (currentDoc.events?.upcoming?.length || 0);
    const totalLeaves = 3;

    return {
      total: myAppts.length,
      completed: completedCount,
      rating: avgRating,
      events: totalEvents || 12,
      leaves: totalLeaves,
    };
  }, [currentDoc, appointmentsData]);

  // Patient Demographics and Specialty Insights logic
  const demographics = useMemo(() => {
    const specialtyMap = {
      Cardiology: [
        { label: "Hypertension", value: "42%" },
        { label: "Arrhythmia", value: "28%" },
        { label: "Heart Failure", value: "18%" },
      ],
      Neurology: [
        { label: "Migraine", value: "35%" },
        { label: "Epilepsy", value: "30%" },
        { label: "Stroke Rehab", value: "20%" },
      ],
      Pediatrics: [
        { label: "Vaccination", value: "45%" },
        { label: "Common Cold", value: "25%" },
        { label: "Asthma", value: "15%" },
      ],
      Default: [
        { label: "General Care", value: "40%" },
        { label: "Routine Check", value: "35%" },
        { label: "Acute Care", value: "15%" },
      ],
    };

    const caseMix =
      specialtyMap[currentDoc.department] || specialtyMap["Default"];

    const ageData = {
      labels: ["0-18", "19-40", "41-60", "60+"],
      datasets: [
        {
          label: "Patient Volume",
          data: [150, 420, 310, 180],
          backgroundColor: "#007acc",
          borderRadius: 8,
        },
      ],
    };

    const caseMixChart = {
      labels: caseMix.map((c) => c.label).concat("Others"),
      datasets: [
        {
          data: caseMix.map((c) => parseInt(c.value, 10)).concat(10),
          backgroundColor: ["#007acc", "#00d2ff", "#10b981", "#f59e0b"],
          borderWidth: 0,
          cutout: "75%",
        },
      ],
    };

    return { ageData, caseMixChart, topConditions: caseMix };
  }, [currentDoc]);

  // Ranking and Percentile logic
  const rankAnalysis = useMemo(() => {
    if (!doctorsList.length)
      return { currentRank: "N/A", percentile: 0, totalSessions: 0 };
    const [year, month] = rankMonth.split("-");
    const leaderboard = doctorsList
      .map((doc) => ({
        id: doc.doctorId,
        name: doc.name,
        count: appointmentsData.filter(
          (a) =>
            a.doctorName === doc.name && a.date.startsWith(`${year}-${month}`),
        ).length,
      }))
      .sort((a, b) => b.count - a.count);

    const myRank =
      leaderboard.findIndex((d) => d.id === currentDoc.doctorId) + 1;
    const totalSessions =
      leaderboard.find((d) => d.id === currentDoc.doctorId)?.count || 0;
    const percentile = Math.round(
      ((doctorsList.length - myRank) / doctorsList.length) * 100,
    );

    return {
      currentRank: myRank || "N/A",
      percentile: percentile || 0,
      totalSessions,
      totalDocs: doctorsList.length,
    };
  }, [rankMonth, currentDoc, doctorsList, appointmentsData]);

  // Dynamic booking and volume trend logic
  const bookingData = useMemo(() => {
    const myAppts = appointmentsData.filter(
      (appt) => appt.doctorName === currentDoc.name,
    );

    if (bookingView === "Month") {
      const monthlyCounts = Array(12).fill(0);
      myAppts.forEach((appt) => {
        const [y, m] = appt.date.split("-");
        if (parseInt(y, 10) === parseInt(selectedYear, 10)) {
          monthlyCounts[parseInt(m, 10) - 1]++;
        }
      });

      return {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: `Appointments (${selectedYear})`,
            data: monthlyCounts,
            borderColor: "#007acc",
            backgroundColor: "rgba(0, 122, 204, 0.08)",
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
          },
        ],
      };
    } else {
      const dayCounts = Array(7).fill(0);
      const [filterYear, filterWeek] = selectedWeek.split("-W");

      myAppts.forEach((appt) => {
        const d = new Date(appt.date);
        const [y] = appt.date.split("-");
        if (y === filterYear) {
          const dayIdx = (d.getDay() + 6) % 7;
          dayCounts[dayIdx]++;
        }
      });

      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: `Daily Flow (Week ${filterWeek})`,
            data: dayCounts,
            backgroundColor: "#007acc",
            borderRadius: 8,
            barThickness: 32,
          },
        ],
      };
    }
  }, [bookingView, selectedYear, selectedWeek, currentDoc, appointmentsData]);

  // Returning vs First Visit composition logic
  const compositionData = useMemo(() => {
    const myAppts = appointmentsData.filter(
      (appt) => appt.doctorName === currentDoc.name,
    );
    const pCounts = {};
    myAppts.forEach(
      (a) => (pCounts[a.patientName] = (pCounts[a.patientName] || 0) + 1),
    );
    const returning = Object.values(pCounts).filter((c) => c > 1).length;
    const firstTime = Object.keys(pCounts).length - returning;
    return {
      labels: ["Returning", "First Visit"],
      datasets: [
        {
          data: [returning, firstTime],
          backgroundColor: ["#007acc", "#00d2ff"],
          borderWidth: 0,
          cutout: "75%",
        },
      ],
    };
  }, [currentDoc, appointmentsData]);

  if (loading)
    return (
      <div className="doc_perf_loading">
        <Loader2 className="spin" /> Opening Intelligence Vault...
      </div>
    );

  return (
    <div className="doc_perf_dash_wrapper doc_perf_dash_fade_in">
      {/* Header section */}
      <header className="doc_perf_dash_header">
        <div className="doc_perf_dash_header_text">
          <h1>
            Clinical <span>Intelligence</span>
          </h1>
          <p>
            {currentDoc.name} • {currentDoc.degrees || "MD"} • {lastSynced}
          </p>
        </div>
        <button className="doc_perf_dash_btn_primary" onClick={fetchData}>
          <Zap size={14} /> Sync Data
        </button>
      </header>

      {/* KPI Stats Grid */}
      <div className="doc_perf_dash_stats_row">
        <div className="doc_perf_dash_stat_card doc_perf_dash_primary">
          <span className="doc_perf_dash_label">Total Appointments</span>
          <h2 className="doc_perf_dash_value_small">{kpis.total}</h2>
        </div>

        <div className="doc_perf_dash_stat_card">
          <span className="doc_perf_dash_label">Completed Sessions</span>
          <h2
            className="doc_perf_dash_value_small"
            style={{ color: "#10b981" }}
          >
            {kpis.completed}
          </h2>
        </div>

        <div className="doc_perf_dash_stat_card">
          <span className="doc_perf_dash_label">Patient Rating</span>
          <h2 className="doc_perf_dash_value_small">
            <Star
              size={18}
              fill="#f59e0b"
              stroke="#f59e0b"
              style={{
                marginRight: "6px",
                display: "inline-block",
                verticalAlign: "middle",
              }}
            />{" "}
            {kpis.rating}
          </h2>
        </div>

        <div className="doc_perf_dash_stat_card">
          <span className="doc_perf_dash_label">Events Attended</span>
          <h2 className="doc_perf_dash_value_small">{kpis.events}</h2>
        </div>

        <div className="doc_perf_dash_stat_card">
          <span className="doc_perf_dash_label">Leaves Taken</span>
          <h2
            className="doc_perf_dash_value_small"
            style={{ color: "#ef4444" }}
          >
            {kpis.leaves}
          </h2>
        </div>
      </div>

      {/* Analysis Grid (Volume & Composition) */}
      <div className="doc_perf_dash_dual_row">
        <div className="doc_perf_dash_bento_item flex_2">
          <div className="doc_perf_dash_card_head">
            <h3>Professional Dynamics</h3>
            <div className="doc_perf_dash_header_actions">
              <div className="doc_perf_dash_mini_tabs">
                <button
                  className={
                    bookingView === "Month" ? "doc_perf_dash_active" : ""
                  }
                  onClick={() => setBookingView("Month")}
                >
                  Monthly
                </button>
                <button
                  className={
                    bookingView === "Week" ? "doc_perf_dash_active" : ""
                  }
                  onClick={() => setBookingView("Week")}
                >
                  Weekly
                </button>
              </div>
              <input
                type={bookingView === "Month" ? "number" : "week"}
                className="doc_perf_dash_select_filter_mini"
                value={bookingView === "Month" ? selectedYear : selectedWeek}
                onChange={(e) =>
                  bookingView === "Month"
                    ? setSelectedYear(e.target.value)
                    : setSelectedWeek(e.target.value)
                }
              />
            </div>
          </div>
          <div className="doc_perf_dash_canvas_holder">
            <Line
              data={bookingData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="doc_perf_dash_bento_item flex_1">
          <div className="doc_perf_dash_card_head">
            <h3>Patient Composition</h3>
          </div>
          <div className="doc_perf_dash_chart_focus_mini">
            <Doughnut
              data={compositionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
            <div className="doc_perf_dash_donut_center">
              <strong>
                {Math.round(
                  (compositionData.datasets[0].data[0] /
                    (compositionData.datasets[0].data[0] +
                      compositionData.datasets[0].data[1])) *
                    100,
                ) || 0}
                %
              </strong>
              <span>Recurring</span>
            </div>
          </div>
          <div className="doc_perf_dash_comp_legend">
            <div className="doc_perf_dash_comp_pill">
              <div className="doc_perf_dash_comp_info">
                <span
                  className="doc_perf_dash_dot"
                  style={{ background: "#007acc" }}
                ></span>
                <span className="doc_perf_dash_comp_name">Returning</span>
              </div>
              <span className="doc_perf_dash_comp_perc">
                {Math.round(
                  (compositionData.datasets[0].data[0] /
                    (compositionData.datasets[0].data[0] +
                      compositionData.datasets[0].data[1])) *
                    100,
                ) || 0}
                %
              </span>
            </div>
            <div className="doc_perf_dash_comp_pill">
              <div className="doc_perf_dash_comp_info">
                <span
                  className="doc_perf_dash_dot"
                  style={{ background: "#00d2ff" }}
                ></span>
                <span className="doc_perf_dash_comp_name">First Visit</span>
              </div>
              <span className="doc_perf_dash_comp_perc">
                {Math.round(
                  (compositionData.datasets[0].data[1] /
                    (compositionData.datasets[0].data[0] +
                      compositionData.datasets[0].data[1])) *
                    100,
                ) || 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard/Rank section */}
      <div className="doc_perf_dash_bento_item doc_perf_dash_margin_top">
        <div className="doc_perf_dash_card_head">
          <h3>Rank Authority Hub</h3>
          <input
            type="month"
            className="doc_perf_dash_select_filter_mini"
            value={rankMonth}
            onChange={(e) => setRankMonth(e.target.value)}
          />
        </div>
        <div className="doc_perf_dash_rank_ribbon">
          <div className="doc_perf_dash_rank_focus_box">
            <div className="doc_perf_dash_rank_num_hero">
              {rankAnalysis.currentRank}
            </div>
            <div className="doc_perf_dash_rank_meta_label">Global Position</div>
          </div>
          <div className="doc_perf_dash_rank_stats_grid">
            <div className="doc_perf_dash_rank_stat_node">
              <Award className="doc_perf_dash_node_icon" size={20} />
              <div>
                <label>Percentile</label>
                <strong>{rankAnalysis.percentile}%</strong>
              </div>
            </div>
            <div className="doc_perf_dash_rank_stat_node">
              <CheckCircle className="doc_perf_dash_node_icon" size={20} />
              <div>
                <label>Month Sessions</label>
                <strong>{rankAnalysis.totalSessions}</strong>
              </div>
            </div>
            <div className="doc_perf_dash_rank_stat_node">
              <Activity className="doc_perf_dash_node_icon" size={20} />
              <div>
                <label>System Avg Rate</label>
                <strong>88.4%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demographics and Diagnosis Mix section */}
      <div className="doc_perf_dash_dual_row doc_perf_dash_margin_top">
        <div className="doc_perf_dash_bento_item doc_perf_dash_flex_half">
          <div className="doc_perf_dash_card_head">
            <h3>Patient Age Demographics</h3>
          </div>
          <div className="doc_perf_dash_canvas_holder">
            <Bar
              data={demographics.ageData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="doc_perf_dash_bento_item doc_perf_dash_flex_half">
          <div className="doc_perf_dash_card_head">
            <h3>Top Diagnoses (Case Mix)</h3>
          </div>
          <div className="doc_perf_dash_chart_focus_mini">
            <Doughnut
              data={demographics.caseMixChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
            <div className="doc_perf_dash_donut_center">
              <strong>{demographics.topConditions.length}</strong>
              <span>Clusters</span>
            </div>
          </div>

          <div className="doc_perf_dash_custom_legend_v2">
            {demographics.topConditions.map((item, idx) => (
              <div key={idx} className="doc_perf_dash_legend_row">
                <div className="doc_perf_dash_legend_left">
                  <span
                    className="doc_perf_dash_legend_dot"
                    style={{
                      backgroundColor:
                        demographics.caseMixChart.datasets[0].backgroundColor[
                          idx
                        ],
                    }}
                  ></span>
                  <span className="doc_patn_m_legend_label">{item.label}</span>
                </div>
                <span className="doc_perf_dash_legend_value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
