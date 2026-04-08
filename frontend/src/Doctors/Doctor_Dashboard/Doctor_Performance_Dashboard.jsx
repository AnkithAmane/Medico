import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { 
  FiTrendingUp, FiZap, FiUser, FiCalendar, FiActivity, FiAward, FiCheckCircle 
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
    return doctorsList.find(doc => doc.id === "DOC-001") || doctorsList[0];
  }, [doctorsList]);

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

  const deptComparisonData = {
    labels: ["Wait Time", "Resolution", "Patient Sat", "Adherence"],
    datasets: [
      { label: "Your Score", data: [92, 88, 95, 98], backgroundColor: "#007acc", borderRadius: 5 },
      { label: "Dept. Avg", data: [75, 82, 88, 90], backgroundColor: "#e2e8f0", borderRadius: 5 }
    ]
  };

  return (
    <div className="da_revenue_wrapper med_page_fade_in">
      
      {/* HEADER SECTION */}
      <header className="da_revenue_header">
        <div className="da_header_text">
          <h1>Clinical <span>Intelligence</span></h1>
          <p>{currentDoc.name} • {lastSynced}</p>
        </div>
        <button className="med_btn_primary" onClick={() => window.location.reload()}><FiZap /> Sync Data</button>
      </header>

      {/* KPI BENTO STRIP */}
      <div className="da_stats_bento">
        <div className="da_stat_card primary">
           <span className="da_label">System Rank</span>
           <div className="da_rank_value"><h2>#{rankAnalysis.currentRank}</h2><span>/ {rankAnalysis.totalDocs}</span></div>
        </div>
        <div className="da_stat_card">
           <span className="da_label">Total Bookings</span>
           <h2 className="da_value">{currentDoc.totalAppointments}</h2>
        </div>
        <div className="da_stat_card highlight">
           <span className="da_label">Unique Patients</span>
           <h2 className="da_value">{currentDoc.totalPatients}</h2>
        </div>
        <div className="da_stat_card">
           <span className="da_label">Clinical Status</span>
           <h2 className={`sa_value ${currentDoc.availability.toLowerCase()}`}>{currentDoc.availability}</h2>
        </div>
      </div>

      <div className="da_category_container">
        {/* ROW 1: TRENDS & COMPOSITION */}
        <div className="da_bento_row_sync">
          <div className="da_bento_item span_2">
            <div className="da_card_head">
              <h3>Professional Dynamics</h3>
              <div className="da_header_actions">
                <div className="da_mini_tabs">
                  <button className={bookingView === "Month" ? "active" : ""} onClick={() => setBookingView("Month")}>Monthly</button>
                  <button className={bookingView === "Week" ? "active" : ""} onClick={() => setBookingView("Week")}>Weekly</button>
                </div>
                <input 
                  type={bookingView === "Month" ? "number" : "week"} 
                  className="da_select_filter_mini" 
                  value={bookingView === "Month" ? selectedYear : selectedWeek} 
                  onChange={(e) => bookingView === "Month" ? setSelectedYear(e.target.value) : setSelectedWeek(e.target.value)} 
                />
              </div>
            </div>
            <div className="da_canvas_holder_reduced">
              <Line key={selectedYear + selectedWeek + bookingView} data={bookingData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="da_bento_item">
            <div className="da_card_head"><h3>Composition</h3></div>
            <div className="da_chart_focus_mini">
               <Doughnut data={compositionData} options={{ responsive: true, maintainAspectRatio: false, plugins:{legend:{display:false}} }} />
               <div className="da_donut_center">
                 <strong>{Math.round((compositionData.datasets[0].data[0] / (compositionData.datasets[0].data[0] + compositionData.datasets[0].data[1])) * 100) || 0}%</strong>
                 <span>Recurring</span>
               </div>
            </div>
            <div className="da_custom_legend_grid">
               <div className="da_legend_pill"><span className="da_dot blue"></span> Returning</div>
               <div className="da_legend_pill"><span className="da_dot lightblue"></span> New Admissions</div>
            </div>
          </div>
        </div>

        {/* ROW 2: RANK RIBBON */}
        <div className="da_bento_row_sync">
          <div className="da_bento_item span_full">
             <div className="da_card_head">
                <h3>Rank Authority Hub</h3>
                <input type="month" className="da_select_filter_mini" value={rankMonth} onChange={(e) => setRankMonth(e.target.value)} />
             </div>
             <div className="da_rank_ribbon">
                <div className="rank_focus_box">
                   <div className="rank_num_hero">{rankAnalysis.currentRank}</div>
                   <div className="rank_meta_label">Global Position</div>
                </div>
                <div className="rank_stats_grid">
                   <div className="rank_stat_node">
                      <FiAward className="node_icon" />
                      <div><label>Percentile</label><strong>{rankAnalysis.percentile}%</strong></div>
                   </div>
                   <div className="rank_stat_node">
                      <FiCheckCircle className="node_icon" />
                      <div><label>Month Sessions</label><strong>{rankAnalysis.totalSessions}</strong></div>
                   </div>
                   <div className="rank_stat_node">
                      <FiActivity className="node_icon" />
                      <div><label>System Avg</label><strong>88.4%</strong></div>
                   </div>
                </div>
                <div className="rank_action_box">
                   <button className="med_btn_primary full_height">Generate Performance Report</button>
                </div>
             </div>
          </div>
        </div>

        {/* ROW 3: BENCHMARK & REGISTRY */}
        <div className="da_bento_row_sync">
          <div className="da_bento_item span_2">
            <div className="da_card_head"><h3>Departmental Benchmark Comparison</h3></div>
            <div className="da_canvas_holder_compact">
              <Bar data={deptComparisonData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="da_bento_item">
            <div className="da_card_head">
              <h3>Clinical Activity Registry</h3>
              <FiCalendar className="icon_blue" />
            </div>
            <div className="med_registry_list">
               <div className="registry_node">
                  <label>Recorded Leaves</label>
                  <div className="leave_tags">
                     {currentDoc.leaves.map((date, i) => <span key={i} className="med_tag_leave">{date}</span>)}
                  </div>
               </div>
               <div className="registry_node">
                  <label>Active Case Reach</label>
                  <div className="registry_stat_flex">
                     <strong>{currentDoc.appointmentHistory.length}</strong>
                     <span className="trend_up">+12% this month</span>
                  </div>
               </div>
               <div className="registry_node">
                  <label>Last Verified Entry</label>
                  <p className="registry_text_small">
                    {currentDoc.appointmentHistory[0]?.patient} 
                    <small>({currentDoc.appointmentHistory[0]?.date})</small>
                  </p>
               </div>
               <button className="da_view_more_full">Download Clinical Log</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}