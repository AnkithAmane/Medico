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
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import "./stats.css";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
);

export default function Normal_Stats() {
  const [activeCategory, setActiveCategory] = useState("Patients");
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  // --- FILTERS ---
  const [patAcqYear, setPatAcqYear] = useState("2026");
  const [patDemoFilter, setPatDemoFilter] = useState("Gender");
  const [appVolWeek, setAppVolWeek] = useState("2026-W14");
  const [appPeakMonth, setAppPeakMonth] = useState("2026-03");
  const [appPeakType, setAppPeakType] = useState("Day"); 
  const [docWorkYear, setDocWorkYear] = useState("2026");
  const [docAppMonth, setDocAppMonth] = useState("2026-03");

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSynced(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const palette = ["#007acc", "#00d2ff", "#1e293b", "#94a3b8", "#10b981", "#ef4444"];

  // --- 1. PATIENT DATA ---
  const patientCharts = useMemo(() => {
    const demoData = patDemoFilter === "Age" ? [15, 35, 30, 20] : [48, 51, 1];
    const total = demoData.reduce((a, b) => a + b, 0);
    const percentages = demoData.map(v => ((v / total) * 100).toFixed(1) + "%");

    return {
      acquisition: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
          label: `Registrations (${patAcqYear})`,
          data: [450, 520, 480, 610, 590, 800, 850, 740, 900, 950, 1100, 1200],
          borderColor: "#007acc", backgroundColor: "rgba(0, 122, 204, 0.05)", fill: true, tension: 0.4
        }]
      },
      demographics: {
        labels: patDemoFilter === "Age" ? ["0-18", "19-35", "36-50", "50+"] : ["Men", "Women", "Other"],
        datasets: [{
          data: demoData,
          backgroundColor: palette, hoverOffset: 20, borderWidth: 0
        }],
        percentages: percentages
      },
      frequency: {
        labels: ["1 Visit", "2-4 Visits", "5-10 Visits", "10+ Visits"],
        datasets: [{
          label: "Patient Count",
          data: [1200, 850, 400, 150],
          backgroundColor: palette[1],
          borderRadius: 8,
          barThickness: 45
        }]
      },
      ratingDistribution: [
        { star: 5, count: 840, pct: 75 },
        { star: 4, count: 120, pct: 15 },
        { star: 3, count: 50, pct: 6 },
        { star: 2, count: 10, pct: 3 },
        { star: 1, count: 4, pct: 1 },
      ]
    };
  }, [patAcqYear, patDemoFilter]);

  // --- 2. DOCTOR DATA ---
  const doctorCharts = useMemo(() => {
    const specData = [12, 15, 8, 10, 20];
    const totalSpec = specData.reduce((a, b) => a + b, 0);
    const specPercentages = specData.map(v => ((v / totalSpec) * 100).toFixed(1) + "%");

    return {
      workload: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
          label: `Total Consultations (${docWorkYear})`,
          data: [2100, 2400, 1950, 2800, 3100, 2900, 3200, 3500, 3000, 2800, 2700, 3100],
          borderColor: "#007acc", backgroundColor: "rgba(0, 122, 204, 0.08)", fill: true, tension: 0.4
        }]
      },
      specialty: {
        labels: ["Cardio", "Ortho", "Neuro", "Peds", "General"],
        datasets: [{
          data: specData,
          backgroundColor: palette, cutout: "75%"
        }],
        percentages: specPercentages
      },
      bestPerformer: {
        name: "Dr. Aditya Vardhan",
        img: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
        degree: "MBBS, MD (Cardio)",
        dept: "Cardiology",
        appointments: 142
      },
      appointmentsTrend: {
        labels: ["Dr. Aditya", "Dr. Sarah", "Dr. Rajesh", "Dr. Elena", "Dr. Vijay"],
        datasets: [{
          label: `Appts in ${docAppMonth}`,
          data: [142, 128, 115, 102, 98],
          backgroundColor: ["#007acc", "#00d2ff", "#1e293b", "#94a3b8", "#10b981"],
          borderRadius: 6
        }]
      }
    };
  }, [docWorkYear, docAppMonth]);

  // --- 3. APPOINTMENT DATA ---
  const appointmentCharts = useMemo(() => ({
    volume: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Appointments",
        data: [65, 80, 42, 91, 64, 102, 83],
        backgroundColor: "#007acc", borderRadius: 8
      }]
    },
    peak: {
      labels: appPeakType === "Day" 
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] 
        : ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"],
      datasets: [{
        label: `Intensity (${appPeakType})`,
        data: appPeakType === "Day" ? [45, 88, 55, 92, 70, 30, 20] : [20, 95, 110, 45, 80, 120, 35],
        borderColor: palette[4], backgroundColor: "rgba(16, 185, 129, 0.05)", fill: true, tension: 0.4
      }]
    },
    statusMix: {
      labels: ["Completed", "Cancelled", "No-show", "Rescheduled"],
      datasets: [{
        data: [75, 10, 5, 10],
        backgroundColor: ["#10b981", "#ef4444", "#94a3b8", "#007acc"],
        borderWidth: 0
      }]
    },
    sourceChannel: {
      labels: ["Mobile App", "Website", "Walk-in", "Call Center"],
      datasets: [{
        label: "Bookings",
        data: [450, 320, 150, 80],
        backgroundColor: "#007acc",
        borderRadius: 5
      }]
    }
  }), [appPeakType, appPeakMonth, appVolWeek]);

  return (
    <div className="sa_revenue_wrapper">
      <header className="sa_revenue_header">
        <div className="sa_header_text">
          <h1>Medico+ <span>Analytics</span></h1>
          <p>Location Hub • {lastSynced}</p>
        </div>

        <div className="sa_category_nav_main">
          {["Patients", "Appointments", "Doctors"].map((cat) => (
            <button
              key={cat}
              className={`sa_nav_tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="sa_export_suite">
          <button className="sa_export_btn">📄</button>
          <button className="sa_export_btn">📊</button>
        </div>
      </header>

      <div className="sa_stats_bento">
        {activeCategory === "Patients" && (
          <>
            <div className="sa_stat_card primary"><span className="sa_label">Lifetime Patients</span><h2 className="sa_value">24,502</h2></div>
            <div className="sa_stat_card"><span className="sa_label">Active Patients</span><h2 className="sa_value">18,240</h2></div>
            <div className="sa_stat_card"><span className="sa_label">Retention Rate</span><h2 className="sa_value">78%</h2></div>
            <div className="sa_stat_card highlight"><span className="sa_label">New Registrations</span><h2 className="sa_value">+1,102</h2></div>
            <div className="sa_stat_card"><span className="sa_label">Avg Visit/Year</span><h2 className="sa_value">4.2</h2></div>
          </>
        )}
        {activeCategory === "Appointments" && (
          <>
            <div className="sa_stat_card primary"><span className="sa_label">Total Bookings</span><h2 className="sa_value">86.2k</h2></div>
            <div className="sa_stat_card"><span className="sa_label">Success Rate</span><h2 className="sa_value">92%</h2></div>
            <div className="sa_stat_card"><span className="sa_label">Pending</span><h2 className="sa_value">420</h2></div>
            <div className="sa_stat_card highlight"><span className="sa_label">Avg Lead Time</span><h2 className="sa_value">2.4 Days</h2></div>
            <div className="sa_stat_card"><span className="sa_label">Cancelled</span><h2 className="sa_value">1,024</h2></div>
          </>
        )}
        {activeCategory === "Doctors" && (
          <>
            <div className="sa_stat_card primary"><div className="sa_pulse_ring"></div><span className="sa_label">Verified Doctors</span><h2 className="sa_value">142</h2></div>
            <div className="sa_stat_card"><span className="sa_label">On-Duty Today</span><h2 className="sa_value">32</h2></div>
            <div className="sa_stat_card"><span className="sa_label">Avg Rating</span><h2 className="sa_value">4.8 / 5</h2></div>
            <div className="sa_stat_card highlight"><span className="sa_label">Total Depts</span><h2 className="sa_value">12</h2></div>
            <div className="sa_stat_card"><span className="sa_label">Monthly Cons.</span><h2 className="sa_value">2.8k</h2></div>
          </>
        )}
      </div>

      {/* --- PATIENTS SECTION --- */}
      {activeCategory === "Patients" && (
        <div className="sa_category_container">
          <div className="sa_bento_row_sync">
            <div className="sa_bento_item span_2">
              <div className="sa_card_head">
                <h3>Patient Acquisition Trend</h3>
                <input type="number" value={patAcqYear} onChange={(e) => setPatAcqYear(e.target.value)} className="sa_calendar_input_v2" />
              </div>
              <div className="sa_canvas_holder_reduced">
                <Line data={patientCharts.acquisition} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="sa_bento_item">
              <div className="sa_card_head">
                <h3>Demographics</h3>
                <div className="sa_mini_tabs">
                  <button className={patDemoFilter === "Age" ? "active" : ""} onClick={() => setPatDemoFilter("Age")}>Age</button>
                  <button className={patDemoFilter === "Gender" ? "active" : ""} onClick={() => setPatDemoFilter("Gender")}>Gen</button>
                </div>
              </div>
              <div className="sa_patient_center_content">
                <div className="sa_chart_focus_mini">
                  <Doughnut data={patientCharts.demographics} options={{ cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              </div>
              <div className="sa_custom_legend_grid">
                {patientCharts.demographics.labels.map((label, i) => (
                  <div key={i} className="sa_legend_pill">
                    <span className="sa_dot" style={{ backgroundColor: palette[i] }}></span>
                    <span className="sa_pill_text">{label} <strong>({patientCharts.demographics.percentages[i]})</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sa_bento_row_sync">
            <div className="sa_bento_item span_2">
              <div className="sa_card_head"><h3>Visit Frequency</h3></div>
              <div className="sa_canvas_holder_compact">
                <Bar data={patientCharts.frequency} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="sa_bento_item">
              <div className="sa_card_head"><h3>Patient Satisfaction</h3></div>
              <div className="sa_ratings_distribution">
                {patientCharts.ratingDistribution.map((row, i) => (
                  <div key={i} className="sa_dist_row">
                    <span className="sa_dist_label">{row.star} ★</span>
                    <div className="sa_dist_bar_bg"><div className="sa_dist_bar_fill" style={{ width: `${row.pct}%` }}></div></div>
                    <span className="sa_dist_count">{row.count}</span>
                  </div>
                ))}
              </div>
              <button className="sa_view_more_full">View Detailed Reviews</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DOCTORS SECTION --- */}
      {activeCategory === "Doctors" && (
        <div className="sa_category_container">
          <div className="sa_bento_row_sync">
            <div className="sa_bento_item span_2">
              <div className="sa_card_head">
                <h3>Doctor Workload Trend</h3>
                <input type="number" value={docWorkYear} onChange={(e) => setDocWorkYear(e.target.value)} className="sa_calendar_input_v2" />
              </div>
              <div className="sa_canvas_holder_reduced">
                <Line data={doctorCharts.workload} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="sa_bento_item">
              <div className="sa_card_head"><h3>Specialty Mix</h3></div>
              <div className="sa_patient_center_content">
                <div className="sa_chart_focus_mini">
                  <Doughnut data={doctorCharts.specialty} options={{ cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              </div>
              <div className="sa_custom_legend_grid wrap">
                {doctorCharts.specialty.labels.map((label, i) => (
                  <div key={i} className="sa_legend_pill">
                    <span className="sa_dot" style={{ backgroundColor: palette[i] }}></span>
                    <span className="sa_pill_text">{label} <strong>({doctorCharts.specialty.percentages[i]})</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sa_bento_row_sync">
            <div className="sa_bento_item">
              <div className="sa_card_head"><h3>Top Performer</h3></div>
              <div className="sa_best_doctor_profile">
                 <div className="sa_doc_identity">
                    <img src={doctorCharts.bestPerformer.img} alt="Doc" />
                    <div className="sa_doc_name_group">
                       <h4>{doctorCharts.bestPerformer.name}</h4>
                       <span>{doctorCharts.bestPerformer.degree}</span>
                    </div>
                 </div>
                 <div className="sa_doc_info_row">
                    <div className="sa_info_box"><span>Department</span><strong>{doctorCharts.bestPerformer.dept}</strong></div>
                    <div className="sa_info_box"><span>Consultations</span><strong>{doctorCharts.bestPerformer.appointments}</strong></div>
                 </div>
                 <div className="sa_sync_indicator">Updated based on current workload</div>
              </div>
            </div>

            <div className="sa_bento_item span_2">
               <div className="sa_card_head">
                  <h3>Top Appointments by Doctor</h3>
                  <input type="month" value={docAppMonth} onChange={(e) => setDocAppMonth(e.target.value)} className="sa_calendar_input_v2" />
               </div>
               <div className="sa_canvas_holder_compact">
                  <Bar data={doctorCharts.appointmentsTrend} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- APPOINTMENTS SECTION --- */}
{activeCategory === "Appointments" && (
  <div className="sa_category_container">
    {/* Top Row: Equal 50/50 Widths */}
    <div className="sa_bento_row_equal"> 
      <div className="sa_bento_item">
        <div className="sa_card_head">
          <h3>Appointment Volume</h3>
          <input type="week" value={appVolWeek} onChange={(e) => setAppVolWeek(e.target.value)} className="sa_calendar_input_v2" />
        </div>
        <div className="sa_vol_summary_compact">
           <span className="sa_vol_label">Weekly Total: </span>
           <span className="sa_vol_value_mini">582</span>
        </div>
        <div className="sa_canvas_holder_reduced">
          <Bar data={appointmentCharts.volume} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="sa_bento_item">
        <div className="sa_card_head">
          <h3>Peak Traffic</h3>
          <div className="sa_mini_tabs">
             <button className={appPeakType === "Day" ? "active" : ""} onClick={() => setAppPeakType("Day")}>Day</button>
             <button className={appPeakType === "Time" ? "active" : ""} onClick={() => setAppPeakType("Time")}>Time</button>
          </div>
        </div>
        <div className="sa_canvas_holder_reduced">
          <Line data={appointmentCharts.peak} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>

    {/* Bottom Row: Status Mix (Restored) & Dept Breakdown */}
    <div className="sa_bento_row_sync">
      {/* Metric 1: Appointment Status Mix (Restored) */}
      <div className="sa_bento_item">
         <div className="sa_card_head"><h3>Appointment Status Mix</h3></div>
         <div className="sa_canvas_holder_compact">
            <Doughnut 
              data={appointmentCharts.statusMix} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { 
                        position: 'bottom',
                        labels: { boxWidth: 12, font: { size: 11, weight: '600' } }
                    } 
                } 
              }} 
            />
         </div>
      </div>

      {/* Metric 2: Appointments by Department */}
      <div className="sa_bento_item span_2">
         <div className="sa_card_head">
            <h3>Appointments by Department</h3>
            <span className="sa_sync_indicator">Dept. Workload</span>
         </div>
         <div className="sa_canvas_holder_compact">
            <Bar 
              data={{
                labels: ["Cardio", "Peds", "Ortho", "Neuro", "Gastro", "Derm", "General"],
                datasets: [{
                  label: 'Bookings',
                  data: [120, 95, 88, 65, 45, 30, 140],
                  backgroundColor: "#00d2ff",
                  borderRadius: 6,
                  hoverBackgroundColor: "#007acc"
                }]
              }} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                  x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
              }} 
            />
         </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}