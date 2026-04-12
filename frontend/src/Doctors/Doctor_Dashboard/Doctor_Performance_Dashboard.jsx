import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { 
  FiZap, FiCalendar, FiActivity, FiAward, FiCheckCircle, FiBriefcase, FiMapPin, FiStar
} from "react-icons/fi";

// --- DATA IMPORTS ---
import doctorsList from "../../Assets/Data/doctor.json"; 
import appointmentsData from "../../Assets/Data/appointment.json"; 
import "./Doctor_Performance_Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function PerformanceDashboard() {
  const [lastSynced] = useState(new Date().toLocaleTimeString());
  
  // --- STATE MANAGEMENT ---
  const [bookingView, setBookingView] = useState("Month"); 
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedWeek, setSelectedWeek] = useState("2026-W14");
  const [rankMonth, setRankMonth] = useState("2026-03"); 

  // --- IDENTITY DEFINITION ---
  const currentDoc = useMemo(() => {
    return doctorsList.find(doc => doc.id === "DOC-006") || doctorsList[0];
  }, [doctorsList]);

  // --- KPI CALCULATION ENGINE ---
  const kpis = useMemo(() => {
    // Filter appointments for the current doctor
    const myAppts = appointmentsData.filter(a => a.doctor === currentDoc.name);
    
    // Total & Completed
    const completedCount = myAppts.filter(a => a.status === "Completed").length;
    
    // Average Rating Calculation from Doctor Profile
    const ratings = currentDoc.reviews?.map(r => r.rating) || [];
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "N/A";

    // Events & Leaves Count
    const totalEvents = (currentDoc.events?.completed?.length || 0) + (currentDoc.events?.upcoming?.length || 0);
    const totalLeaves = (currentDoc.leaves?.completed?.length || 0) + (currentDoc.leaves?.upcoming?.length || 0);

    return {
      total: myAppts.length,
      completed: completedCount,
      rating: avgRating,
      events: totalEvents,
      leaves: totalLeaves
    };
  }, [currentDoc, appointmentsData]);
// --- DYNAMIC PATIENT INSIGHTS ENGINE ---
  const demographics = useMemo(() => {
    // 1. Specialty Mapper for Case Mix
    const specialtyMap = {
      "Cardiology": [ { label: "Hypertension", value: "42%" }, { label: "Arrhythmia", value: "28%" }, { label: "Heart Failure", value: "18%" } ],
      "Neurology": [ { label: "Migraine", value: "35%" }, { label: "Epilepsy", value: "30%" }, { label: "Stroke Rehab", value: "20%" } ],
      "Pediatrics": [ { label: "Vaccination", value: "45%" }, { label: "Common Cold", value: "25%" }, { label: "Asthma", value: "15%" } ],
      "Default": [ { label: "General Care", value: "40%" }, { label: "Routine Check", value: "35%" }, { label: "Acute Care", value: "15%" } ]
    };

    const caseMix = specialtyMap[currentDoc.department] || specialtyMap["Default"];
    
    // 2. Data for Age Bar Chart
    const ageData = {
      labels: ["0-18", "19-40", "41-60", "60+"],
      datasets: [{
        label: "Patient Volume",
        data: [150, 420, 310, 180], // Simulated distribution
        backgroundColor: "#007acc",
        borderRadius: 8,
      }]
    };

    // 3. Data for Case Mix Doughnut
    const caseMixChart = {
      labels: caseMix.map(c => c.label).concat("Others"),
      datasets: [{
        data: caseMix.map(c => parseInt(c.value)).concat(10),
        backgroundColor: ["#007acc", "#00d2ff", "#10b981", "#f59e0b"],
        borderWidth: 0, cutout: "75%"
      }]
    };

    return { ageData, caseMixChart, topConditions: caseMix };
  }, [currentDoc]);
  // --- DYNAMIC RANK ENGINE ---
  const rankAnalysis = useMemo(() => {
    const [year, month] = rankMonth.split("-");
    const leaderboard = doctorsList.map(doc => ({
      id: doc.id,
      name: doc.name,
      count: appointmentsData.filter(a => 
        a.doctor === doc.name && a.date.startsWith(`${year}-${month}`)
      ).length
    })).sort((a, b) => b.count - a.count);

    const myRank = leaderboard.findIndex(d => d.id === currentDoc.id) + 1;
    const totalSessions = leaderboard.find(d => d.id === currentDoc.id)?.count || 0;
    const percentile = Math.round(((doctorsList.length - myRank) / doctorsList.length) * 100);

    return { 
      currentRank: myRank || "N/A", 
      percentile: percentile || 0, 
      totalSessions, 
      totalDocs: doctorsList.length 
    };
  }, [rankMonth, currentDoc, doctorsList, appointmentsData]);

  // --- REACTIVE BOOKING ENGINE ---
  const bookingData = useMemo(() => {
    const myAppts = appointmentsData.filter(appt => appt.doctor === currentDoc.name);

    if (bookingView === "Month") {
      const monthlyCounts = Array(12).fill(0);
      myAppts.forEach(appt => {
        const [y, m] = appt.date.split("-");
        if (parseInt(y) === parseInt(selectedYear)) {
          monthlyCounts[parseInt(m) - 1]++;
        }
      });

      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
          label: `Appointments (${selectedYear})`,
          data: monthlyCounts,
          borderColor: "#007acc",
          backgroundColor: "rgba(0, 122, 204, 0.08)",
          fill: true, tension: 0.4, borderWidth: 3, pointRadius: 5
        }]
      };
    } else {
      const dayCounts = Array(7).fill(0);
      const [filterYear, filterWeek] = selectedWeek.split("-W");
      
      myAppts.forEach(appt => {
        const d = new Date(appt.date);
        const [y] = appt.date.split("-");
        
        // Week calculation logic
        const tempDate = new Date(d.getTime());
        tempDate.setHours(0, 0, 0, 0);
        tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
        const week1 = new Date(tempDate.getFullYear(), 0, 4);
        const apptWeek = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);

        if (apptWeek === parseInt(filterWeek) && y === filterYear) {
          const dayIdx = (d.getDay() + 6) % 7; 
          dayCounts[dayIdx]++;
        }
      });

      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: `Daily Flow (Week ${filterWeek})`,
          data: dayCounts,
          backgroundColor: "#007acc",
          borderRadius: 8,
          barThickness: 32
        }]
      };
    }
  }, [bookingView, selectedYear, selectedWeek, currentDoc, appointmentsData]);
  
  // --- COMPOSITION ENGINE ---
  const compositionData = useMemo(() => {
    const myAppts = appointmentsData.filter(appt => appt.doctor === currentDoc.name);
    const pCounts = {};
    myAppts.forEach(a => pCounts[a.patient] = (pCounts[a.patient] || 0) + 1);
    const returning = Object.values(pCounts).filter(c => c > 1).length;
    const firstTime = Object.keys(pCounts).length - returning;
    return {
      labels: ["Returning", "First Visit"],
      datasets: [{
        data: [returning, firstTime],
        backgroundColor: ["#007acc", "#00d2ff"],
        borderWidth: 0, cutout: "75%"
      }]
    };
  }, [currentDoc, appointmentsData]);

  // --- BENCHMARK DATA (Dynamic wait times/resolution could be added here if available) ---
  const deptComparisonData = {
    labels: ["Wait Time", "Resolution", "Patient Sat", "Adherence"],
    datasets: [
      { label: "Your Score", data: [92, 88, 95, 98], backgroundColor: "#007acc", borderRadius: 5 },
      { label: "Dept. Avg", data: [75, 82, 88, 90], backgroundColor: "#e2e8f0", borderRadius: 5 }
    ]
  };

  return (
    <div className="doc_perf_dash_wrapper doc_perf_dash_fade_in">
      
      {/* 1. HEADER SECTION */}
      <header className="doc_perf_dash_header">
        <div className="doc_perf_dash_header_text">
          <h1>Clinical <span>Intelligence</span></h1>
          <p>{currentDoc.name} • {currentDoc.degrees} • {lastSynced}</p>
        </div>
        <button className="doc_perf_dash_btn_primary" onClick={() => window.location.reload()}><FiZap /> Sync Data</button>
      </header>

      {/* KPI STATS ROW */}
      <div className="doc_perf_dash_stats_row">
        <div className="doc_perf_dash_stat_card doc_perf_dash_primary">
           <span className="doc_perf_dash_label">Total Appointments</span>
           <h2 className="doc_perf_dash_value_small">{kpis.total}</h2>
        </div>

        <div className="doc_perf_dash_stat_card">
           <span className="doc_perf_dash_label">Completed Sessions</span>
           <h2 className="doc_perf_dash_value_small" style={{color: 'var(--sa-success)'}}>
             {kpis.completed}
           </h2>
        </div>

        <div className="doc_perf_dash_stat_card">
           <span className="doc_perf_dash_label">Patient Rating</span>
           <h2 className="doc_perf_dash_value_small">
             <FiStar style={{color: 'var(--sa-warning)', marginRight: '6px'}}/> {kpis.rating}
           </h2>
        </div>

        <div className="doc_perf_dash_stat_card">
           <span className="doc_perf_dash_label">Events Attended</span>
           <h2 className="doc_perf_dash_value_small">{kpis.events}</h2>
        </div>

        <div className="doc_perf_dash_stat_card">
           <span className="doc_perf_dash_label">Leaves Taken</span>
           <h2 className="doc_perf_dash_value_small" style={{color: 'var(--sa-danger)'}}>
             {kpis.leaves}
           </h2>
        </div>
      </div>

      {/* 3. PROFESSIONAL DYNAMICS & COMPOSITION ROW */}
      <div className="doc_perf_dash_dual_row">
        <div className="doc_perf_dash_bento_item flex_2">
          <div className="doc_perf_dash_card_head">
            <h3>Professional Dynamics</h3>
            <div className="doc_perf_dash_header_actions">
              <div className="doc_perf_dash_mini_tabs">
                <button className={bookingView === "Month" ? "doc_perf_dash_active" : ""} onClick={() => setBookingView("Month")}>Monthly</button>
                <button className={bookingView === "Week" ? "doc_perf_dash_active" : ""} onClick={() => setBookingView("Week")}>Weekly</button>
              </div>
              <input 
                type={bookingView === "Month" ? "number" : "week"} 
                className="doc_perf_dash_select_filter_mini" 
                value={bookingView === "Month" ? selectedYear : selectedWeek} 
                onChange={(e) => bookingView === "Month" ? setSelectedYear(e.target.value) : setSelectedWeek(e.target.value)} 
              />
            </div>
          </div>
          <div className="doc_perf_dash_canvas_holder">
            <Line data={bookingData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="doc_perf_dash_bento_item flex_1">
          <div className="doc_perf_dash_card_head"><h3>Patient Composition</h3></div>
          <div className="doc_perf_dash_chart_focus_mini">
  <Doughnut 
    data={compositionData} 
    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
  />
  <div className="doc_perf_dash_donut_center">
    <strong>{Math.round((compositionData.datasets[0].data[0] / (compositionData.datasets[0].data[0] + compositionData.datasets[0].data[1])) * 100) || 0}%</strong>
    <span>Recurring</span>
  </div>
</div>
         <div className="doc_perf_dash_comp_legend">
  <div className="doc_perf_dash_comp_pill">
    <div className="doc_perf_dash_comp_info">
      <span className="doc_perf_dash_dot dot_returning"></span>
      <span className="doc_perf_dash_comp_name">Returning</span>
    </div>
    <span className="doc_perf_dash_comp_perc">{Math.round((compositionData.datasets[0].data[0] / (compositionData.datasets[0].data[0] + compositionData.datasets[0].data[1])) * 100)}%</span>
  </div>

  <div className="doc_perf_dash_comp_pill">
    <div className="doc_perf_dash_comp_info">
      <span className="doc_perf_dash_dot dot_first"></span>
      <span className="doc_perf_dash_comp_name">First Visit</span>
    </div>
    <span className="doc_perf_dash_comp_perc">{Math.round((compositionData.datasets[0].data[1] / (compositionData.datasets[0].data[0] + compositionData.datasets[0].data[1])) * 100)}%</span>
  </div>
</div>
        </div>
      </div>

      {/* 4. RANK AUTHORITY RIBBON */}
      <div className="doc_perf_dash_bento_item doc_perf_dash_margin_top">
          <div className="doc_perf_dash_card_head">
            <h3>Rank Authority Hub</h3>
            <input type="month" className="doc_perf_dash_select_filter_mini" value={rankMonth} onChange={(e) => setRankMonth(e.target.value)} />
          </div>
          <div className="doc_perf_dash_rank_ribbon">
            <div className="doc_perf_dash_rank_focus_box">
                <div className="doc_perf_dash_rank_num_hero">{rankAnalysis.currentRank}</div>
                <div className="doc_perf_dash_rank_meta_label">Global Position</div>
            </div>
            <div className="doc_perf_dash_rank_stats_grid">
                <div className="doc_perf_dash_rank_stat_node">
                  <FiAward className="doc_perf_dash_node_icon" />
                  <div><label>Percentile</label><strong>{rankAnalysis.percentile}%</strong></div>
                </div>
                <div className="doc_perf_dash_rank_stat_node">
                  <FiCheckCircle className="doc_perf_dash_node_icon" />
                  <div><label>Month Sessions</label><strong>{rankAnalysis.totalSessions}</strong></div>
                </div>
                <div className="doc_perf_dash_rank_stat_node">
                  <FiActivity className="doc_perf_dash_node_icon" />
                  <div><label>System Avg Rate</label><strong>88.4%</strong></div>
                </div>
            </div>
          </div>
      </div>

      {/* 5. BENCHMARK & REGISTRY ROW */}
      {/* 5. PATIENT DEMOGRAPHICS & CASE MIX ROW (Set to 50/50) */}
      <div className="doc_perf_dash_dual_row doc_perf_dash_margin_top">
        
        {/* Patient Age Chart - 50% */}
        <div className="doc_perf_dash_bento_item doc_perf_dash_flex_half">
          <div className="doc_perf_dash_card_head"><h3>Patient Age Demographics</h3></div>
          <div className="doc_perf_dash_canvas_holder">
            <Bar data={demographics.ageData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Top Diagnoses - 50% */}
        <div className="doc_perf_dash_bento_item doc_perf_dash_flex_half">
          <div className="doc_perf_dash_card_head"><h3>Top Diagnoses (Case Mix)</h3></div>
          <div className="doc_perf_dash_chart_focus_mini">
  <Doughnut 
    key={currentDoc.id}
    data={demographics.caseMixChart} 
    options={{ 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: { legend: { display: false } } 
    }} 
  />
  <div className="doc_perf_dash_donut_center">
    <strong>{demographics.topConditions.length}</strong>
    <span>Clusters</span>
  </div>
</div>

{/* --- CUSTOM COLOR/LABEL/PERCENTAGE LEGEND --- */}
<div className="doc_perf_dash_custom_legend_v2">
  {demographics.topConditions.map((item, idx) => (
    <div key={idx} className="doc_perf_dash_legend_row">
      <div className="doc_perf_dash_legend_left">
        {/* Uses the same background colors from your chart logic */}
        <span 
          className="doc_perf_dash_legend_dot" 
          style={{ backgroundColor: demographics.caseMixChart.datasets[0].backgroundColor[idx] }}
        ></span>
        <span className="doc_perf_dash_legend_label">{item.label}</span>
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