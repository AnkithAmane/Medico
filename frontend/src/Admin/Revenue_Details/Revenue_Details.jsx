import React, { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import axiosInstance from "../../utils/axios";
import "./Revenue_Details.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function Revenue_Details() {
  const [trendView, setTrendView] = useState("Month");
  const [trendWeek, setTrendWeek] = useState("2026-W14");
  const [trendYear, setTrendYear] = useState(2026);
  const [deptMonth, setDeptMonth] = useState("2026-05");
  const [contributorMonth, setContributorMonth] = useState("2026-05");
  const [patientView, setPatientView] = useState("Age");
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  // Data states
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

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
        console.error('Failed to load revenue data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    const interval = setInterval(() => setLastSynced(new Date().toLocaleTimeString()), 30000)
    return () => clearInterval(interval)
  }, [])

  // Revenue helper
  const getApptRevenue = (appt) => appt.fees || appt.doctorId?.fees || 500

  // Global stats
  const globalStats = useMemo(() => {
    let lifetimeRevenue = 0
    const deptTotals = {}

    appointments.forEach(appt => {
      const fee = getApptRevenue(appt)
      lifetimeRevenue += fee
      const dept = appt.doctorId?.specialization || 'General'
      deptTotals[dept] = (deptTotals[dept] || 0) + fee
    })

    const highestDept = Object.entries(deptTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    return {
      lifetime: (lifetimeRevenue / 100000).toFixed(1),
      avgAppt: appointments.length > 0 ? (lifetimeRevenue / appointments.length).toFixed(0) : 0,
      highestDept,
      totalRegistry: patients.length,
      staffCount: doctors.length
    }
  }, [appointments, doctors, patients])

  // Revenue trend
  const trendData = useMemo(() => {
    if (trendView === "Week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const weekData = Array(7).fill(0)
      const [year, week] = trendWeek.split("-W")
      appointments.forEach(appt => {
        const d = new Date(appt.date)
        const firstDayOfYear = new Date(year, 0, 1)
        const days2 = Math.floor((d - firstDayOfYear) / (24 * 60 * 60 * 1000))
        const weekNum = Math.ceil((days2 + firstDayOfYear.getDay() + 1) / 7)
        if (d.getFullYear().toString() === year && weekNum.toString().padStart(2, '0') === week) {
          const dayIdx = (d.getDay() + 6) % 7
          weekData[dayIdx] += getApptRevenue(appt)
        }
      })
      return {
        labels: days,
        datasets: [{ label: 'Weekly Revenue', data: weekData, borderColor: "#007acc", backgroundColor: "rgba(0,122,204,0.08)", fill: true, tension: 0.4 }]
      }
    } else {
      const monthly = Array(12).fill(0)
      appointments.forEach(appt => {
        if (appt.date?.startsWith(trendYear.toString())) {
          const mIdx = parseInt(appt.date.split('-')[1]) - 1
          monthly[mIdx] += getApptRevenue(appt)
        }
      })
      return {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        datasets: [{ label: 'Monthly Revenue', data: monthly, borderColor: "#007acc", backgroundColor: "rgba(0,122,204,0.08)", fill: true, tension: 0.4 }]
      }
    }
  }, [trendView, trendWeek, trendYear, appointments])

  // Top contributors
  const topDoctors = useMemo(() => {
    const docMap = {}
    appointments.filter(a => a.date?.startsWith(contributorMonth)).forEach(a => {
      const name = a.doctorId?.name || 'Unknown'
      docMap[name] = (docMap[name] || 0) + getApptRevenue(a)
    })
    return Object.entries(docMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, rev]) => ({
        name,
        rev: `₹${(rev / 1000).toFixed(1)}K`,
        dept: doctors.find(d => d.name === name)?.specialization || 'Specialist'
      }))
  }, [contributorMonth, appointments, doctors])

  // Dept performance
  const deptData = useMemo(() => {
    const specs = [...new Set(doctors.map(d => d.specialization).filter(Boolean))]
    const filtered = appointments.filter(a => a.date?.startsWith(deptMonth))
    const totals = specs.map(s =>
      filtered.filter(a => a.doctorId?.specialization === s)
        .reduce((sum, a) => sum + getApptRevenue(a), 0)
    )
    return {
      labels: specs.map(s => s.slice(0, 6)),
      datasets: [
        { label: 'Actual', data: totals, backgroundColor: "#007acc", borderRadius: 5 },
        { label: 'Target', data: totals.map(v => v === 0 ? 5000 : v * 1.2), backgroundColor: "rgba(0,122,204,0.1)", borderRadius: 5 }
      ]
    }
  }, [deptMonth, appointments, doctors])

  // Patient demographics
  const patientData = useMemo(() => {
    const isAge = patientView === "Age"
    const values = isAge
      ? [
          patients.filter(p => { const age = p.age || 0; return age >= 19 && age < 60 }).length,
          patients.filter(p => (p.age || 0) < 19).length,
          patients.filter(p => (p.age || 0) >= 60).length
        ]
      : [
          patients.filter(p => p.userId?.gender === 'Male').length,
          patients.filter(p => p.userId?.gender === 'Female').length,
          patients.filter(p => p.userId?.gender !== 'Male' && p.userId?.gender !== 'Female').length
        ]
    return {
      labels: isAge ? ["Adults", "Children", "Seniors"] : ["Male", "Female", "Other"],
      datasets: [{ data: values, backgroundColor: ["#007acc", "#00d2ff", "#1e293b"], borderWidth: 0, cutout: "75%" }]
    }
  }, [patientView, patients])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p>Loading revenue data...</p>
    </div>
  )

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

      {/* KPI Stats */}
      <div className="admin_rev_m_stats_bento">
        <div className="admin_rev_m_stat_card admin_rev_m_primary">
          <div className="admin_rev_m_pulse_ring"></div>
          <span className="admin_rev_m_label">Lifetime Revenue</span>
          <h2 className="admin_rev_m_value">₹{globalStats.lifetime}L</h2>
        </div>
        <div className="admin_rev_m_stat_card">
          <span className="admin_rev_m_label">Patient Registry</span>
          <h2 className="admin_rev_m_value">{globalStats.totalRegistry}</h2>
        </div>
        <div className="admin_rev_m_stat_card">
          <span className="admin_rev_m_label">Avg Consulting</span>
          <h2 className="admin_rev_m_value">₹{globalStats.avgAppt}</h2>
        </div>
        <div className="admin_rev_m_stat_card">
          <span className="admin_rev_m_label">Lead Dept</span>
          <h2 className="admin_rev_m_value" style={{ fontSize: "0.9rem" }}>{globalStats.highestDept}</h2>
        </div>
        <div className="admin_rev_m_stat_card">
          <span className="admin_rev_m_label">Clinical Staff</span>
          <h2 className="admin_rev_m_value">{globalStats.staffCount}</h2>
        </div>
      </div>

      {/* Revenue Trend + Contributors */}
      <div className="admin_rev_m_bento_row">
        <div className="admin_rev_m_bento_item admin_rev_m_span_2">
          <div className="admin_rev_m_card_head">
            <div className="admin_rev_m_title_with_toggle">
              <h3>Revenue Trend</h3>
              <div className="admin_rev_m_filter_cluster">
                <div className="admin_rev_m_mini_tabs">
                  <button className={trendView === "Month" ? "admin_rev_m_active" : ""} onClick={() => setTrendView("Month")}>Yearly</button>
                  <button className={trendView === "Week" ? "admin_rev_m_active" : ""} onClick={() => setTrendView("Week")}>Weekly</button>
                </div>
                {trendView === "Week" ? (
                  <input type="week" className="admin_rev_m_year_select" value={trendWeek} onChange={(e) => setTrendWeek(e.target.value)} />
                ) : (
                  <input type="number" className="admin_rev_m_year_select" value={trendYear} onChange={(e) => setTrendYear(e.target.value)} style={{ width: '85px' }} />
                )}
              </div>
            </div>
          </div>
          <div className="admin_rev_m_canvas_holder">
            <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="admin_rev_m_bento_item">
          <div className="admin_rev_m_card_head">
            <div className="admin_rev_m_title_with_toggle">
              <h3>Contributors</h3>
              <input type="month" className="admin_rev_m_year_select" value={contributorMonth}
                onChange={(e) => setContributorMonth(e.target.value)} />
            </div>
          </div>
          <div className="admin_rev_m_doc_leaderboard">
            {topDoctors.length > 0 ? topDoctors.map((doc, i) => (
              <div key={i} className="admin_rev_m_list_row">
                <div className="admin_rev_m_list_info">
                  <strong>{doc.name}</strong>
                  <span>{doc.dept}</span>
                </div>
                <div className="admin_rev_m_list_val">{doc.rev}</div>
              </div>
            )) : (
              <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "40px" }}>No records for this month</p>
            )}
          </div>
        </div>
      </div>

      {/* Demographics + Dept Performance */}
      <div className="admin_rev_m_bento_row">
        <div className="admin_rev_m_bento_item admin_rev_m_patient_card">
          <div className="admin_rev_m_card_head">
            <div className="admin_rev_m_title_with_toggle">
              <h3>Demographics</h3>
              <div className="admin_rev_m_mini_tabs">
                <button className={patientView === "Age" ? "admin_rev_m_active" : ""} onClick={() => setPatientView("Age")}>Age</button>
                <button className={patientView === "Gender" ? "admin_rev_m_active" : ""} onClick={() => setPatientView("Gender")}>Gen</button>
              </div>
            </div>
          </div>
          <div className="admin_rev_m_patient_content">
            <div className="admin_rev_m_doughnut_box">
              <Doughnut data={patientData} options={{ cutout: "80%", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              <div className="admin_rev_m_center_insight">
                <span className="admin_rev_m_insight_label">Registry</span>
                <strong className="admin_rev_m_insight_val">{patients.length}</strong>
              </div>
            </div>
          </div>
          <div className="admin_rev_m_legend">
            {patientData.labels.map((label, idx) => (
              <div key={idx} className="admin_rev_m_legend_pill">
                <span className="admin_rev_m_dot" style={{ backgroundColor: ["#007acc", "#00d2ff", "#1e293b"][idx] }}></span>
                <span className="admin_rev_m_pill_text">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin_rev_m_bento_item admin_rev_m_span_2">
          <div className="admin_rev_m_card_head">
            <div className="admin_rev_m_title_with_toggle">
              <h3>Dept. Performance</h3>
              <input type="month" className="admin_rev_m_year_select" value={deptMonth} onChange={(e) => setDeptMonth(e.target.value)} />
            </div>
          </div>
          <div className="admin_rev_m_canvas_holder_compact">
            <Bar data={deptData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}