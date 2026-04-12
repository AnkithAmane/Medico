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

import appointmentsData from "../../Assets/Data/appointment.json";
import doctorsData from "../../Assets/Data/doctor.json";
import patientsData from "../../Assets/Data/patient.json";
import "./stats.css";

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

export default function Normal_Stats() {
  const [activeCategory, setActiveCategory] = useState("Patients");
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  const [patAcqYear, setPatAcqYear] = useState(2026);
  const [patDemoFilter, setPatDemoFilter] = useState("Gender");
  const [appVolWeek, setAppVolWeek] = useState("2026-W14");
  const [appPeakMonth, setAppPeakMonth] = useState("2026-03");
  const [appPeakType, setAppPeakType] = useState("Day");
  const [docWorkYear, setDocWorkYear] = useState(2026);
  const [docAppMonth, setDocAppMonth] = useState("2026-03");

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSynced(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const palette = ["#007acc", "#00d2ff", "#1e293b", "#94a3b8", "#10b981", "#ef4444"];

  const isDateInSelectedWeek = (dateStr, weekStr) => {
    if (!dateStr || !weekStr) return false;
    try {
      const d = new Date(dateStr);
      const [year, week] = weekStr.split("-W");
      const firstDayOfYear = new Date(year, 0, 1);
      const days = Math.floor((d - firstDayOfYear) / (24 * 60 * 60 * 1000));
      const weekNum = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
      return d.getFullYear().toString() === year && weekNum.toString().padStart(2, '0') === week;
    } catch (e) {
      return false;
    }
  };

  const patientCharts = useMemo(() => {
    const demoData = patDemoFilter === "Age"
      ? [
        patientsData.filter(p => p.age <= 18).length,
        patientsData.filter(p => p.age > 18 && p.age <= 60).length,
        patientsData.filter(p => p.age > 60).length,
      ]
      : [
        patientsData.filter(p => p.gender === "Male").length,
        patientsData.filter(p => p.gender === "Female").length,
        patientsData.filter(p => (p.gender !== "Male" && p.gender !== "Female")).length
      ];

    const total = demoData.reduce((a, b) => a + b, 0);
    const percentages = demoData.map(v => total > 0 ? ((v / total) * 100).toFixed(1) + "%" : "0%");

    const monthlyCounts = Array(12).fill(0);
    patientsData.forEach((patient) => {
      const dates = [];
      if (patient.date) dates.push(patient.date);
      if (patient.appointments && Array.isArray(patient.appointments)) {
        patient.appointments.forEach(app => { if (app.date) dates.push(app.date); });
      }
      if (dates.length > 0) {
        const earliestDate = dates.sort()[0];
        const parts = earliestDate.split('-');
        if (parts.length >= 2) {
          if (parseInt(parts[0], 10) === parseInt(patAcqYear, 10)) {
            const mIdx = parseInt(parts[1], 10) - 1;
            if (mIdx >= 0 && mIdx < 12) monthlyCounts[mIdx]++;
          }
        }
      }
    });

    return {
      acquisition: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
          label: `New Patients (${patAcqYear})`,
          data: monthlyCounts,
          borderColor: "#007acc",
          backgroundColor: "rgba(0, 122, 204, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          borderWidth: 3
        }]
      },
      demographics: {
        labels: patDemoFilter === "Age" ? ["Child", "Adult", "Old"] : ["Men", "Women", "Other"],
        datasets: [{ data: demoData, backgroundColor: palette, hoverOffset: 20, borderWidth: 0 }],
        percentages: percentages
      },
      frequency: {
        labels: ["1 Visit", "2-4 Visits", "5-10 Visits", "10+ Visits"],
        datasets: [{ label: "Patient Count", data: [450, 210, 85, 30], backgroundColor: palette[1], borderRadius: 8, barThickness: 45 }]
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

  const doctorCharts = useMemo(() => {
    const depts = ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "Gastroenterology"];
    const specData = depts.map(d => doctorsData.filter(doc => (doc.department || "").includes(d)).length);
    const totalSpec = specData.reduce((a, b) => a + b, 0);
    const specPercentages = specData.map(v => totalSpec > 0 ? ((v / totalSpec) * 100).toFixed(1) + "%" : "0%");

    const yearlyWorkload = Array(12).fill(0);
    appointmentsData.forEach(appt => {
      if (appt.date) {
        const parts = appt.date.split('-');
        if (parts.length >= 2 && parseInt(parts[0], 10) === parseInt(docWorkYear, 10)) {
          const mIdx = parseInt(parts[1], 10) - 1;
          if (mIdx >= 0 && mIdx < 12) yearlyWorkload[mIdx]++;
        }
      }
    });

    const filteredAppts = appointmentsData.filter(a => a.date && a.date.startsWith(docAppMonth));
    const docCounts = filteredAppts.reduce((acc, curr) => {
      if (curr.doctor) acc[curr.doctor] = (acc[curr.doctor] || 0) + 1;
      return acc;
    }, {});

    const sortedDocs = Object.entries(docCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topDocName = sortedDocs.length > 0 ? sortedDocs[0][0] : "No Data";
    const topDocObj = doctorsData.find(d => d.name === topDocName);

    return {
      workload: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
          label: `Total Appointments (${docWorkYear})`,
          data: yearlyWorkload,
          borderColor: "#007acc",
          backgroundColor: "rgba(0, 122, 204, 0.08)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          borderWidth: 2
        }]
      },
      specialty: {
        labels: depts,
        datasets: [{ data: specData, backgroundColor: palette, cutout: "75%" }],
        percentages: specPercentages
      },
      bestPerformer: {
        name: topDocName,
        img: topDocObj?.photo || "https://i.pravatar.cc/150",
        degree: topDocObj?.degrees || "MD",
        dept: topDocObj?.department || "General",
        appointments: docCounts[topDocName] || 0
      },
      appointmentsTrend: {
        labels: sortedDocs.length > 0 ? sortedDocs.map(d => (d && d[0] ? d[0].toString().split(' ').pop() : "User")) : ["None"],
        datasets: [{
          label: `Appointments`,
          data: sortedDocs.length > 0 ? sortedDocs.map(d => d?.[1] || 0) : [0],
          backgroundColor: ["#007acc", "#00d2ff", "#1e293b", "#94a3b8", "#10b981"],
          borderRadius: 6
        }]
      }
    };
  }, [docWorkYear, docAppMonth]);

  const appointmentCharts = useMemo(() => {
    const weeklyDayCounts = [0, 0, 0, 0, 0, 0, 0];
    appointmentsData.forEach(a => {
      if (isDateInSelectedWeek(a.date, appVolWeek)) {
        const dayIdx = (new Date(a.date).getDay() + 6) % 7;
        weeklyDayCounts[dayIdx]++;
      }
    });

    const monthlyAppts = appointmentsData.filter(a => a.date && a.date.startsWith(appPeakMonth));
    const intensityDayCounts = [0, 0, 0, 0, 0, 0, 0];
    const intensityTimeCounts = Array(7).fill(0);

    monthlyAppts.forEach(a => {
      const d = new Date(a.date).getDay();
      intensityDayCounts[d === 0 ? 6 : d - 1]++;
      const hourStr = a.time?.split(":")[0];
      if (hourStr) {
        const hour = parseInt(hourStr, 10);
        const hour24 = a.time?.includes("PM") && hour !== 12 ? hour + 12 : (a.time?.includes("AM") && hour === 12 ? 0 : hour);
        if (hour24 >= 8 && hour24 < 10) intensityTimeCounts[0]++;
        else if (hour24 >= 10 && hour24 < 12) intensityTimeCounts[1]++;
        else if (hour24 >= 12 && hour24 < 14) intensityTimeCounts[2]++;
        else if (hour24 >= 14 && hour24 < 16) intensityTimeCounts[3]++;
        else if (hour24 >= 16 && hour24 < 18) intensityTimeCounts[4]++;
        else if (hour24 >= 18 && hour24 < 20) intensityTimeCounts[5]++;
        else if (hour24 >= 20) intensityTimeCounts[6]++;
      }
    });

    return {
      volume: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ label: `Bookings`, data: weeklyDayCounts, backgroundColor: "#007acc", borderRadius: 8 }]
      },
      peak: {
        labels: appPeakType === "Day" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"],
        datasets: [{
          label: `${appPeakType} Intensity`,
          data: appPeakType === "Day" ? intensityDayCounts : intensityTimeCounts,
          borderColor: "#007acc",
          backgroundColor: "rgba(0, 122, 204, 0.08)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          borderWidth: 3
        }]
      },
      statusMix: {
        labels: ["Completed", "Cancelled", "Upcoming", "No-Show"],
        datasets: [{
          data: [
            appointmentsData.filter(a => a.status === "Completed").length,
            appointmentsData.filter(a => a.status === "Cancelled").length,
            appointmentsData.filter(a => a.status === "Upcoming").length,
            40
          ],
          backgroundColor: ["#10b981", "#ef4444", "#007acc", "#94a3b8"],
          borderWidth: 0
        }]
      },
      totalWeekly: weeklyDayCounts.reduce((a, b) => a + b, 0)
    };
  }, [appPeakType, appPeakMonth, appVolWeek]);

  return (
    <div className="admin_stat_m_revenue_wrapper">
      <header className="admin_stat_m_revenue_header">
        <div className="admin_stat_m_header_text">
          <h1>Medico+ <span>Analytics</span></h1>
          <p>Live Analysis • {lastSynced}</p>
        </div>

        <div className="admin_stat_m_category_nav_main">
          {["Patients", "Appointments", "Doctors"].map((cat) => (
            <button key={cat} className={`admin_stat_m_nav_tab ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="admin_stat_m_export_suite">
          <button className="admin_stat_m_export_btn">📄</button>
          <button className="admin_stat_m_export_btn">📊</button>
        </div>
      </header>

      <div className="admin_stat_m_stats_bento">
        {activeCategory === "Patients" && (
          <>
            <div className="admin_stat_m_stat_card primary"><span className="admin_stat_m_label">Tot Patients</span><h2 className="admin_stat_m_value">{patientsData.length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Active Patients</span><h2 className="admin_stat_m_value">542</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Success Rate</span><h2 className="admin_stat_m_value">98%</h2></div>
            <div className="admin_stat_m_stat_card highlight"><span className="admin_stat_m_label">Growth</span><h2 className="admin_stat_m_value">+12%</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Avg Age</span><h2 className="admin_stat_m_value">32</h2></div>
          </>
        )}
        {activeCategory === "Appointments" && (
          <>
            <div className="admin_stat_m_stat_card primary"><span className="admin_stat_m_label">Total Appointments</span><h2 className="admin_stat_m_value">{appointmentsData.length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Completed</span><h2 className="admin_stat_m_value">{appointmentsData.filter(a => a.status === "Completed").length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Waiting Time</span><h2 className="admin_stat_m_value">8m</h2></div>
            <div className="admin_stat_m_stat_card highlight"><span className="admin_stat_m_label">Conversion</span><h2 className="admin_stat_m_value">84%</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Emergency</span><h2 className="admin_stat_m_value">{appointmentsData.filter(a => a.type === "Emergency").length}</h2></div>
          </>
        )}
        {activeCategory === "Doctors" && (
          <>
            <div className="admin_stat_m_stat_card primary"><div className="admin_stat_m_pulse_ring"></div><span className="admin_stat_m_label">Total Doctors</span><h2 className="admin_stat_m_value">{doctorsData.length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Available</span><h2 className="admin_stat_m_value">{doctorsData.filter(d => d.availability === "Available").length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Avg Rating</span><h2 className="admin_stat_m_value">4.9/5</h2></div>
            <div className="admin_stat_m_stat_card highlight"><span className="admin_stat_m_label">Departments</span><h2 className="admin_stat_m_value">12</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Avg Load</span><h2 className="admin_stat_m_value">10/Day</h2></div>
          </>
        )}
      </div>

      <div className="admin_stat_m_category_container">
        {activeCategory === "Patients" && (
          <>
            <div className="admin_stat_m_bento_row_sync">
              <div className="admin_stat_m_bento_item span_2">
                <div className="admin_stat_m_card_head">
                  <h3>Patient Acquisition Trend</h3>
                  <input type="number" value={patAcqYear} onChange={(e) => setPatAcqYear(e.target.value)} className="admin_stat_m_calendar_input_v2" style={{ width: '90px' }} />
                </div>
                <div className="admin_stat_m_canvas_holder_reduced">
                  <Line data={patientCharts.acquisition} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="admin_stat_m_bento_item">
                <div className="admin_stat_m_card_head">
                  <h3>Demographics</h3>
                  <div className="admin_stat_m_mini_tabs">
                    <button className={patDemoFilter === "Age" ? "active" : ""} onClick={() => setPatDemoFilter("Age")}>Age</button>
                    <button className={patDemoFilter === "Gender" ? "active" : ""} onClick={() => setPatDemoFilter("Gender")}>Gen</button>
                  </div>
                </div>
                <div className="admin_stat_m_patient_center_content">
                  <div className="admin_stat_m_chart_focus_mini">
                    <Doughnut data={patientCharts.demographics} options={{ cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                </div>
                <div className="admin_stat_m_custom_legend_grid">
                  {patientCharts.demographics.labels.map((label, i) => (
                    <div key={i} className="admin_stat_m_legend_pill">
                      <span className="admin_stat_m_dot" style={{ backgroundColor: palette[i] }}></span>
                      <span className="admin_stat_m_pill_text">{label} <strong>({patientCharts.demographics.percentages[i]})</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin_stat_m_bento_row_sync">
              <div className="admin_stat_m_bento_item span_2">
                <div className="admin_stat_m_card_head"><h3>Visit Frequency Analysis</h3></div>
                <div className="admin_stat_m_canvas_holder_compact">
                  <Bar data={patientCharts.frequency} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="admin_stat_m_bento_item">
                <div className="admin_stat_m_card_head"><h3>Experience Rating</h3></div>
                <div className="admin_stat_m_ratings_distribution">
                  {patientCharts.ratingDistribution.map((row, i) => (
                    <div key={i} className="admin_stat_m_dist_row">
                      <span className="admin_stat_m_dist_label">{row.star} ★</span>
                      <div className="admin_stat_m_dist_bar_bg"><div className="admin_stat_m_dist_bar_fill" style={{ width: `${row.pct}%` }}></div></div>
                      <span className="admin_stat_m_dist_count">{row.count}</span>
                    </div>
                  ))}
                </div>
                <button className="admin_stat_m_view_more_full">Extract Review Logs</button>
              </div>
            </div>
          </>
        )}

        {activeCategory === "Doctors" && (
          <>
            <div className="admin_stat_m_bento_row_sync">
              <div className="admin_stat_m_bento_item span_2">
                <div className="admin_stat_m_card_head">
                  <h3>Doctor Workload Trend</h3>
                  <input type="number" value={docWorkYear} onChange={(e) => setDocWorkYear(e.target.value)} className="admin_stat_m_calendar_input_v2" style={{ width: '90px' }} />
                </div>
                <div className="admin_stat_m_canvas_holder_reduced">
                  <Line data={doctorCharts.workload} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="admin_stat_m_bento_item">
                <div className="admin_stat_m_card_head"><h3>Clinical Specialty Matrix</h3></div>
                <div className="admin_stat_m_patient_center_content">
                  <div className="admin_stat_m_chart_focus_mini">
                    <Doughnut data={doctorCharts.specialty} options={{ cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                </div>
                <div className="admin_stat_m_custom_legend_grid wrap">
                  {doctorCharts.specialty.labels.map((label, i) => (
                    <div key={i} className="admin_stat_m_legend_pill">
                      <span className="admin_stat_m_dot" style={{ backgroundColor: palette[i] }}></span>
                      <span className="admin_stat_m_pill_text">{label} <strong>({doctorCharts.specialty.percentages[i]})</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin_stat_m_bento_row_sync">
              <div className="admin_stat_m_bento_item span_3">
                <div className="admin_stat_m_card_head">
                  <h3>Performance Distribution</h3>
                  <input type="month" value={docAppMonth} onChange={(e) => setDocAppMonth(e.target.value)} className="admin_stat_m_calendar_input_v2" id="stat_filter" />
                </div>
                <div className="admin_stat_m_canvas_holder_compact">
                  <Bar data={doctorCharts.appointmentsTrend} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
                </div>
              </div>
              <div className="admin_stat_m_bento_item">
                <div className="admin_stat_m_card_head"><h3>Lead Doctor</h3></div>
                <div className="admin_stat_m_best_doctor_profile">
                  <div className="admin_stat_m_doc_identity">
                    <img src={doctorCharts.bestPerformer.img} alt="Doc" />
                    <div className="admin_stat_m_doc_name_group">
                      <h4>{doctorCharts.bestPerformer.name}</h4>
                      <span>{doctorCharts.bestPerformer.degree}</span>
                    </div>
                  </div>
                  <div className="admin_stat_m_doc_info_row">
                    <div className="admin_stat_m_info_box"><span>Specialty</span><strong>{doctorCharts.bestPerformer.dept}</strong></div>
                    <div className="admin_stat_m_info_box"><span>Cases</span><strong>{doctorCharts.bestPerformer.appointments}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeCategory === "Appointments" && (
          <>
            <div className="admin_stat_m_bento_row_equal">
              <div className="admin_stat_m_bento_item">
                <div className="admin_stat_m_card_head">
                  <h3>Weekly Volume</h3>
                  <input type="week" value={appVolWeek} onChange={(e) => setAppVolWeek(e.target.value)} className="admin_stat_m_calendar_input_v2" style={{ minWidth: '150px' }} />
                </div>
                <div className="admin_stat_m_vol_summary_compact">
                  <span className="admin_stat_m_vol_label">Week Total: </span>
                  <span className="admin_stat_m_vol_value_mini">{appointmentCharts.totalWeekly}</span>
                </div>
                <div className="admin_stat_m_canvas_holder_reduced">
                  <Bar data={appointmentCharts.volume} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="admin_stat_m_bento_item">
                <div className="admin_stat_m_card_head">
                  <h3>Flow Intensity</h3>
                  <div className="admin_stat_m_mini_tabs" style={{ display: 'flex', gap: '8px' }}>
                    <input type="month" value={appPeakMonth} onChange={(e) => setAppPeakMonth(e.target.value)} id="stat_filter" className="admin_stat_m_calendar_input_v2" style={{ width: '125px' }} />
                    <div className="admin_stat_m_mini_tabs">
                      <button className={appPeakType === "Day" ? "active" : ""} onClick={() => setAppPeakType("Day")}>Day</button>
                      <button className={appPeakType === "Time" ? "active" : ""} onClick={() => setAppPeakType("Time")}>Time</button>
                    </div>
                  </div>
                </div>
                <div className="admin_stat_m_canvas_holder_reduced">
                  <Line data={appointmentCharts.peak} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            <div className="admin_stat_m_bento_row_sync">
              <div className="admin_stat_m_bento_item span_2">
                <div className="admin_stat_m_card_head"><h3>Department Traffic Load</h3></div>
                <div className="admin_stat_m_canvas_holder_compact">
                  <Bar
                    data={{
                      labels: ["Cardiology", "Pediatrics", "Orthopedics", "Neurology", "Gastro", "Dermatology", "General"],
                      datasets: [{
                        label: 'Visits', data: [120, 145, 98, 160, 130, 85, 220],
                        backgroundColor: "#00d2ff", borderRadius: 6
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                  />
                </div>
              </div>
              <div className="admin_stat_m_bento_item">
                <div className="admin_stat_m_card_head"><h3>Registry Status Mix</h3></div>
                <div className="admin_stat_m_canvas_holder_compact">
                  <Doughnut data={appointmentCharts.statusMix} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}