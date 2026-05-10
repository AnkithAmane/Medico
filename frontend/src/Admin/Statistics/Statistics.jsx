import React, { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import axiosInstance from "../../utils/axios";
import "./Statistics.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function Normal_Stats() {
  const [activeCategory, setActiveCategory] = useState("Patients");
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  // Data states
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [patAcqYear, setPatAcqYear] = useState(2026);
  const [patDemoFilter, setPatDemoFilter] = useState("Gender");
  const [appVolWeek, setAppVolWeek] = useState("2026-W14");
  const [appPeakMonth, setAppPeakMonth] = useState("2026-05");
  const [appPeakType, setAppPeakType] = useState("Day");
  const [docWorkYear, setDocWorkYear] = useState(2026);
  const [docAppMonth, setDocAppMonth] = useState("2026-05");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [apptRes, docRes, patRes] = await Promise.all([
          axiosInstance.get('/appointments'),
          axiosInstance.get('/doctors'),
          axiosInstance.get('/patients')
        ])
        setAppointments(apptRes.data.data || [])
        setDoctors(docRes.data.data || [])
        setPatients(patRes.data.data || [])
      } catch (err) {
        console.error('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    const interval = setInterval(() => setLastSynced(new Date().toLocaleTimeString()), 30000)
    return () => clearInterval(interval)
  }, [])

  const palette = ["#007acc", "#00d2ff", "#1e293b", "#94a3b8", "#10b981", "#ef4444"];

  // Week check helper
  const isDateInSelectedWeek = (dateStr, weekStr) => {
    if (!dateStr || !weekStr) return false
    try {
      const d = new Date(dateStr)
      const [year, week] = weekStr.split("-W")
      const firstDayOfYear = new Date(year, 0, 1)
      const days = Math.floor((d - firstDayOfYear) / (24 * 60 * 60 * 1000))
      const weekNum = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7)
      return d.getFullYear().toString() === year && weekNum.toString().padStart(2, '0') === week
    } catch (e) { return false }
  }

  // Patient charts
  const patientCharts = useMemo(() => {
    const demoData = patDemoFilter === "Age"
      ? [
          patients.filter(p => (p.age || 0) <= 18).length,
          patients.filter(p => (p.age || 0) > 18 && (p.age || 0) <= 60).length,
          patients.filter(p => (p.age || 0) > 60).length,
        ]
      : [
          patients.filter(p => p.userId?.gender === 'Male').length,
          patients.filter(p => p.userId?.gender === 'Female').length,
          patients.filter(p => p.userId?.gender !== 'Male' && p.userId?.gender !== 'Female').length
        ]

    const total = demoData.reduce((a, b) => a + b, 0)
    const percentages = demoData.map(v => total > 0 ? ((v / total) * 100).toFixed(1) + "%" : "0%")

    // Monthly acquisition based on createdAt
    const monthlyCounts = Array(12).fill(0)
    patients.forEach(p => {
      const date = p.createdAt || p.accountCreatedAt
      if (date && date.startsWith(patAcqYear.toString())) {
        const mIdx = parseInt(date.split('-')[1]) - 1
        if (mIdx >= 0 && mIdx < 12) monthlyCounts[mIdx]++
      }
    })

    return {
      acquisition: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        datasets: [{
          label: `New Patients (${patAcqYear})`,
          data: monthlyCounts,
          borderColor: "#007acc",
          backgroundColor: "rgba(0,122,204,0.1)",
          fill: true, tension: 0.4, pointRadius: 4, borderWidth: 3
        }]
      },
      demographics: {
        labels: patDemoFilter === "Age" ? ["Child", "Adult", "Senior"] : ["Men", "Women", "Other"],
        datasets: [{ data: demoData, backgroundColor: palette, hoverOffset: 20, borderWidth: 0 }],
        percentages
      },
      ratingDistribution: [
        { star: 5, count: 0, pct: 0 },
        { star: 4, count: 0, pct: 0 },
        { star: 3, count: 0, pct: 0 },
        { star: 2, count: 0, pct: 0 },
        { star: 1, count: 0, pct: 0 },
      ]
    }
  }, [patAcqYear, patDemoFilter, patients])

  // Doctor charts
  const doctorCharts = useMemo(() => {
    const specs = [...new Set(doctors.map(d => d.specialization).filter(Boolean))]
    const specData = specs.map(s => doctors.filter(d => d.specialization === s).length)
    const totalSpec = specData.reduce((a, b) => a + b, 0)
    const specPercentages = specData.map(v => totalSpec > 0 ? ((v / totalSpec) * 100).toFixed(1) + "%" : "0%")

    const yearlyWorkload = Array(12).fill(0)
    appointments.forEach(appt => {
      if (appt.date?.startsWith(docWorkYear.toString())) {
        const mIdx = parseInt(appt.date.split('-')[1]) - 1
        if (mIdx >= 0 && mIdx < 12) yearlyWorkload[mIdx]++
      }
    })

    const filteredAppts = appointments.filter(a => a.date?.startsWith(docAppMonth))
    const docCounts = filteredAppts.reduce((acc, curr) => {
      const name = curr.doctorId?.name
      if (name) acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})

    const sortedDocs = Object.entries(docCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const topDocName = sortedDocs[0]?.[0] || 'N/A'
    const topDocObj = doctors.find(d => d.name === topDocName)

    return {
      workload: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        datasets: [{
          label: `Total Appointments (${docWorkYear})`,
          data: yearlyWorkload,
          borderColor: "#007acc",
          backgroundColor: "rgba(0,122,204,0.08)",
          fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2
        }]
      },
      specialty: {
        labels: specs,
        datasets: [{ data: specData, backgroundColor: palette, cutout: "75%" }],
        percentages: specPercentages
      },
      bestPerformer: {
        name: topDocName,
        dept: topDocObj?.specialization || 'General',
        appointments: docCounts[topDocName] || 0
      },
      appointmentsTrend: {
        labels: sortedDocs.map(d => d[0].split(' ').pop()),
        datasets: [{
          label: 'Appointments',
          data: sortedDocs.map(d => d[1]),
          backgroundColor: ["#007acc","#00d2ff","#1e293b","#94a3b8","#10b981"],
          borderRadius: 6
        }]
      }
    }
  }, [docWorkYear, docAppMonth, appointments, doctors])

  // Appointment charts
  const appointmentCharts = useMemo(() => {
    const weeklyDayCounts = Array(7).fill(0)
    appointments.forEach(a => {
      if (isDateInSelectedWeek(a.date, appVolWeek)) {
        const dayIdx = (new Date(a.date).getDay() + 6) % 7
        weeklyDayCounts[dayIdx]++
      }
    })

    const monthlyAppts = appointments.filter(a => a.date?.startsWith(appPeakMonth))
    const intensityDayCounts = Array(7).fill(0)
    const intensityTimeCounts = Array(7).fill(0)

    monthlyAppts.forEach(a => {
      const d = new Date(a.date).getDay()
      intensityDayCounts[d === 0 ? 6 : d - 1]++
      if (a.time) {
        const hour = parseInt(a.time.split(':')[0])
        if (hour >= 8 && hour < 10) intensityTimeCounts[0]++
        else if (hour >= 10 && hour < 12) intensityTimeCounts[1]++
        else if (hour >= 12 && hour < 14) intensityTimeCounts[2]++
        else if (hour >= 14 && hour < 16) intensityTimeCounts[3]++
        else if (hour >= 16 && hour < 18) intensityTimeCounts[4]++
        else if (hour >= 18 && hour < 20) intensityTimeCounts[5]++
        else intensityTimeCounts[6]++
      }
    })

    return {
      volume: {
        labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        datasets: [{ label: 'Bookings', data: weeklyDayCounts, backgroundColor: "#007acc", borderRadius: 8 }]
      },
      peak: {
        labels: appPeakType === "Day" ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] : ["8AM","10AM","12PM","2PM","4PM","6PM","8PM"],
        datasets: [{
          label: `${appPeakType} Intensity`,
          data: appPeakType === "Day" ? intensityDayCounts : intensityTimeCounts,
          borderColor: "#007acc",
          backgroundColor: "rgba(0,122,204,0.08)",
          fill: true, tension: 0.4, pointRadius: 4, borderWidth: 3
        }]
      },
      statusMix: {
        labels: ["Completed","Cancelled","Upcoming"],
        datasets: [{
          data: [
            appointments.filter(a => a.status === 'completed').length,
            appointments.filter(a => a.status === 'cancelled').length,
            appointments.filter(a => a.status === 'upcoming').length,
          ],
          backgroundColor: ["#10b981","#ef4444","#007acc"],
          borderWidth: 0
        }]
      },
      totalWeekly: weeklyDayCounts.reduce((a, b) => a + b, 0)
    }
  }, [appPeakType, appPeakMonth, appVolWeek, appointments])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p>Loading statistics...</p>
    </div>
  )

  return (
    <div className="admin_stat_m_revenue_wrapper">
      <header className="admin_stat_m_revenue_header">
        <div className="admin_stat_m_header_text">
          <h1>Medico+ <span>Analytics</span></h1>
          <p>Live Analysis • {lastSynced}</p>
        </div>
        <div className="admin_stat_m_category_nav_main">
          {["Patients", "Appointments", "Doctors"].map((cat) => (
            <button key={cat} className={`admin_stat_m_nav_tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
        <div className="admin_stat_m_export_suite">
          <button className="admin_stat_m_export_btn">📄</button>
          <button className="admin_stat_m_export_btn">📊</button>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="admin_stat_m_stats_bento">
        {activeCategory === "Patients" && (
          <>
            <div className="admin_stat_m_stat_card primary"><span className="admin_stat_m_label">Total Patients</span><h2 className="admin_stat_m_value">{patients.length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Male</span><h2 className="admin_stat_m_value">{patients.filter(p => p.userId?.gender === 'Male').length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Female</span><h2 className="admin_stat_m_value">{patients.filter(p => p.userId?.gender === 'Female').length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">With Appointments</span><h2 className="admin_stat_m_value">{patients.filter(p => p.appointments?.length > 0).length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Avg Age</span><h2 className="admin_stat_m_value">{patients.length > 0 ? Math.round(patients.reduce((s, p) => s + (p.age || 0), 0) / patients.length) : 0}</h2></div>
          </>
        )}
        {activeCategory === "Appointments" && (
          <>
            <div className="admin_stat_m_stat_card primary"><span className="admin_stat_m_label">Total</span><h2 className="admin_stat_m_value">{appointments.length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Completed</span><h2 className="admin_stat_m_value">{appointments.filter(a => a.status === 'completed').length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Upcoming</span><h2 className="admin_stat_m_value">{appointments.filter(a => a.status === 'upcoming').length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Cancelled</span><h2 className="admin_stat_m_value">{appointments.filter(a => a.status === 'cancelled').length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Online</span><h2 className="admin_stat_m_value">{appointments.filter(a => a.type === 'online').length}</h2></div>
          </>
        )}
        {activeCategory === "Doctors" && (
          <>
            <div className="admin_stat_m_stat_card primary"><div className="admin_stat_m_pulse_ring"></div><span className="admin_stat_m_label">Total Doctors</span><h2 className="admin_stat_m_value">{doctors.length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Available</span><h2 className="admin_stat_m_value">{doctors.filter(d => d.isAvailable).length}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Specializations</span><h2 className="admin_stat_m_value">{new Set(doctors.map(d => d.specialization)).size}</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Avg Experience</span><h2 className="admin_stat_m_value">{doctors.length > 0 ? Math.round(doctors.reduce((s, d) => s + (d.experience || 0), 0) / doctors.length) : 0}y</h2></div>
            <div className="admin_stat_m_stat_card"><span className="admin_stat_m_label">Avg Fee</span><h2 className="admin_stat_m_value">₹{doctors.length > 0 ? Math.round(doctors.reduce((s, d) => s + (d.fees || 0), 0) / doctors.length) : 0}</h2></div>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="admin_stat_m_category_container">
        {activeCategory === "Patients" && (
          <>
            <div className="admin_stat_m_bento_row_sync">
              <div className="admin_stat_m_bento_item span_2">
                <div className="admin_stat_m_card_head">
                  <h3>Patient Acquisition Trend</h3>
                  <input type="number" value={patAcqYear} onChange={(e) => setPatAcqYear(e.target.value)}
                    className="admin_stat_m_calendar_input_v2" style={{ width: '90px' }} />
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
                <div className="admin_stat_m_chart_focus_mini">
                  <Doughnut data={patientCharts.demographics}
                    options={{ cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
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
          </>
        )}

        {activeCategory === "Doctors" && (
          <>
            <div className="admin_stat_m_bento_row_sync">
              <div className="admin_stat_m_bento_item span_2">
                <div className="admin_stat_m_card_head">
                  <h3>Doctor Workload Trend</h3>
                  <input type="number" value={docWorkYear} onChange={(e) => setDocWorkYear(e.target.value)}
                    className="admin_stat_m_calendar_input_v2" style={{ width: '90px' }} />
                </div>
                <div className="admin_stat_m_canvas_holder_reduced">
                  <Line data={doctorCharts.workload} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="admin_stat_m_bento_item">
                <div className="admin_stat_m_card_head"><h3>Specialty Matrix</h3></div>
                <div className="admin_stat_m_chart_focus_mini">
                  <Doughnut data={doctorCharts.specialty}
                    options={{ cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
                <div className="admin_stat_m_custom_legend_grid">
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
                  <input type="month" value={docAppMonth} onChange={(e) => setDocAppMonth(e.target.value)}
                    className="admin_stat_m_calendar_input_v2" id="stat_filter" />
                </div>
                <div className="admin_stat_m_canvas_holder_compact">
                  <Bar data={doctorCharts.appointmentsTrend}
                    options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
                </div>
              </div>
              <div className="admin_stat_m_bento_item">
                <div className="admin_stat_m_card_head"><h3>Lead Doctor</h3></div>
                <div className="admin_stat_m_best_doctor_profile">
                  <div className="admin_stat_m_doc_identity">
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #007acc, #00d2ff)',
                      color: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 800, fontSize: '1.8rem'
                    }}>
                      {doctorCharts.bestPerformer.name?.charAt(0) || 'D'}
                    </div>
                    <div className="admin_stat_m_doc_name_group">
                      <h4>{doctorCharts.bestPerformer.name}</h4>
                      <span>{doctorCharts.bestPerformer.dept}</span>
                    </div>
                  </div>
                  <div className="admin_stat_m_doc_info_row">
                    <div className="admin_stat_m_info_box">
                      <span>Specialty</span>
                      <strong>{doctorCharts.bestPerformer.dept}</strong>
                    </div>
                    <div className="admin_stat_m_info_box">
                      <span>Cases</span>
                      <strong>{doctorCharts.bestPerformer.appointments}</strong>
                    </div>
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
                  <input type="week" value={appVolWeek} onChange={(e) => setAppVolWeek(e.target.value)}
                    className="admin_stat_m_calendar_input_v2" style={{ minWidth: '150px' }} />
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
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="month" value={appPeakMonth} onChange={(e) => setAppPeakMonth(e.target.value)}
                      className="admin_stat_m_calendar_input_v2" style={{ width: '125px' }} />
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
                <div className="admin_stat_m_card_head"><h3>Department Traffic</h3></div>
                <div className="admin_stat_m_canvas_holder_compact">
                  <Bar
                    data={{
                      labels: [...new Set(doctors.map(d => d.specialization).filter(Boolean))].map(s => s.slice(0, 8)),
                      datasets: [{
                        label: 'Appointments',
                        data: [...new Set(doctors.map(d => d.specialization).filter(Boolean))].map(s =>
                          appointments.filter(a => a.doctorId?.specialization === s).length
                        ),
                        backgroundColor: "#00d2ff", borderRadius: 6
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                  />
                </div>
              </div>
              <div className="admin_stat_m_bento_item">
                <div className="admin_stat_m_card_head"><h3>Status Mix</h3></div>
                <div className="admin_stat_m_canvas_holder_compact">
                  <Doughnut data={appointmentCharts.statusMix}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}