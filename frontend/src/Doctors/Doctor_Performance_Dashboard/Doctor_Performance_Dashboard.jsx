import React, { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { 
  FiZap, FiAward, FiCheckCircle, FiActivity, FiStar
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axios";
import "./Doctor_Performance_Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function PerformanceDashboard() {
  const { user } = useAuth()
  const [lastSynced] = useState(new Date().toLocaleTimeString())

  // Data states
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [bookingView, setBookingView] = useState("Month")
  const [selectedYear, setSelectedYear] = useState("2026")
  const [selectedWeek, setSelectedWeek] = useState("2026-W14")
  const [rankMonth, setRankMonth] = useState("2026-05")

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        setLoading(true)
        const docRes = await axiosInstance.get(`/doctors/user/${user._id}`)
        const doctor = docRes.data.data
        setDoctorProfile(doctor)

        const [apptRes, revRes] = await Promise.all([
          axiosInstance.get(`/appointments/doctor/${doctor._id}`),
          axiosInstance.get(`/reviews/doctor/${doctor._id}`)
        ])
        setAppointments(apptRes.data.data || [])
        setReviews(revRes.data.data || [])
      } catch (err) {
        console.error('Failed to load performance data:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  // KPIs
  const kpis = useMemo(() => {
    const completed = appointments.filter(a => a.status === 'completed').length
    const ratings = reviews.map(r => r.rating).filter(Boolean)
    const avgRating = ratings.length 
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) 
      : 'N/A'
    return {
      total: appointments.length,
      completed,
      rating: avgRating,
      reviews: reviews.length
    }
  }, [appointments, reviews])

  // Booking trend data
  const bookingData = useMemo(() => {
    if (bookingView === "Month") {
      const monthlyCounts = Array(12).fill(0)
      appointments.forEach(appt => {
        const [y, m] = appt.date.split("-")
        if (parseInt(y) === parseInt(selectedYear)) {
          monthlyCounts[parseInt(m) - 1]++
        }
      })
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
          label: `Appointments (${selectedYear})`,
          data: monthlyCounts,
          borderColor: "#007acc",
          backgroundColor: "rgba(0, 122, 204, 0.08)",
          fill: true, tension: 0.4, borderWidth: 3, pointRadius: 5
        }]
      }
    } else {
      const dayCounts = Array(7).fill(0)
      const [filterYear, filterWeek] = selectedWeek.split("-W")
      appointments.forEach(appt => {
        const d = new Date(appt.date)
        const [y] = appt.date.split("-")
        const tempDate = new Date(d.getTime())
        tempDate.setHours(0, 0, 0, 0)
        tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7)
        const week1 = new Date(tempDate.getFullYear(), 0, 4)
        const apptWeek = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
        if (apptWeek === parseInt(filterWeek) && y === filterYear) {
          const dayIdx = (d.getDay() + 6) % 7
          dayCounts[dayIdx]++
        }
      })
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: `Daily Flow (Week ${filterWeek})`,
          data: dayCounts,
          backgroundColor: "#007acc",
          borderRadius: 8,
          barThickness: 32
        }]
      }
    }
  }, [bookingView, selectedYear, selectedWeek, appointments])

  // Patient composition
  const compositionData = useMemo(() => {
    const pCounts = {}
    appointments.forEach(a => {
      const pid = a.patientId?._id?.toString()
      if (pid) pCounts[pid] = (pCounts[pid] || 0) + 1
    })
    const returning = Object.values(pCounts).filter(c => c > 1).length
    const firstTime = Object.keys(pCounts).length - returning
    return {
      labels: ["Returning", "First Visit"],
      datasets: [{
        data: [returning || 0, firstTime || 0],
        backgroundColor: ["#007acc", "#00d2ff"],
        borderWidth: 0, cutout: "75%"
      }]
    }
  }, [appointments])

  // Rating distribution
  const ratingData = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      const star = Math.round(r.rating)
      if (counts[star] !== undefined) counts[star]++
    })
    return counts
  }, [reviews])

  // Quarterly data
  const quarterlyData = useMemo(() => {
    const quarters = [0, 0, 0, 0]
    appointments.forEach(a => {
      const m = new Date(a.date).getMonth()
      if (m <= 2) quarters[0]++
      else if (m <= 5) quarters[1]++
      else if (m <= 8) quarters[2]++
      else quarters[3]++
    })
    return quarters
  }, [appointments])

  const totalComposition = compositionData.datasets[0].data[0] + compositionData.datasets[0].data[1]
  const returningPercent = totalComposition > 0 
    ? Math.round((compositionData.datasets[0].data[0] / totalComposition) * 100) 
    : 0

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading performance data...</p>
    </div>
  )

  return (
    <div className="doc_perf_dash_wrapper doc_perf_dash_fade_in">
      
      {/* Header */}
      <header className="doc_perf_dash_header">
        <div className="doc_perf_dash_header_text">
          <h1>Clinical <span>Intelligence</span></h1>
          <p>{doctorProfile?.name} • {lastSynced}</p>
        </div>
        <button className="doc_perf_dash_btn_primary" onClick={() => window.location.reload()}>
          <FiZap /> Sync Data
        </button>
      </header>

      {/* KPI Stats */}
      <div className="doc_perf_dash_stats_row">
        <div className="doc_perf_dash_stat_card doc_perf_dash_primary">
          <span className="doc_perf_dash_label">Total Appointments</span>
          <h2 className="doc_perf_dash_value_small">{kpis.total}</h2>
        </div>
        <div className="doc_perf_dash_stat_card">
          <span className="doc_perf_dash_label">Completed Sessions</span>
          <h2 className="doc_perf_dash_value_small" style={{color: 'var(--sa-success)'}}>{kpis.completed}</h2>
        </div>
        <div className="doc_perf_dash_stat_card">
          <span className="doc_perf_dash_label">Patient Rating</span>
          <h2 className="doc_perf_dash_value_small">
            <FiStar style={{color: 'var(--sa-warning)', marginRight: '6px'}}/> {kpis.rating}
          </h2>
        </div>
        <div className="doc_perf_dash_stat_card">
          <span className="doc_perf_dash_label">Total Reviews</span>
          <h2 className="doc_perf_dash_value_small">{kpis.reviews}</h2>
        </div>
        <div className="doc_perf_dash_stat_card">
          <span className="doc_perf_dash_label">Upcoming</span>
          <h2 className="doc_perf_dash_value_small" style={{color: 'var(--sa-primary)'}}>
            {appointments.filter(a => a.status === 'upcoming').length}
          </h2>
        </div>
      </div>

      {/* Volume & Composition */}
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
            {bookingView === "Month" 
              ? <Line data={bookingData} options={{ responsive: true, maintainAspectRatio: false }} />
              : <Bar data={bookingData} options={{ responsive: true, maintainAspectRatio: false }} />
            }
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
              <strong>{returningPercent}%</strong>
              <span>Recurring</span>
            </div>
          </div>
          <div className="doc_perf_dash_comp_legend">
            <div className="doc_perf_dash_comp_pill">
              <div className="doc_perf_dash_comp_info">
                <span className="doc_perf_dash_dot dot_returning"></span>
                <span>Returning</span>
              </div>
              <span>{returningPercent}%</span>
            </div>
            <div className="doc_perf_dash_comp_pill">
              <div className="doc_perf_dash_comp_info">
                <span className="doc_perf_dash_dot dot_first"></span>
                <span>First Visit</span>
              </div>
              <span>{100 - returningPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Hub */}
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
              {appointments.filter(a => {
                const [y, m] = rankMonth.split('-')
                return a.date.startsWith(`${y}-${m}`)
              }).length}
            </div>
            <div className="doc_perf_dash_rank_meta_label">Sessions This Month</div>
          </div>
          <div className="doc_perf_dash_rank_stats_grid">
            <div className="doc_perf_dash_rank_stat_node">
              <FiAward className="doc_perf_dash_node_icon" />
              <div>
                <label>Avg Rating</label>
                <strong>{kpis.rating}</strong>
              </div>
            </div>
            <div className="doc_perf_dash_rank_stat_node">
              <FiCheckCircle className="doc_perf_dash_node_icon" />
              <div>
                <label>Completed</label>
                <strong>{kpis.completed}</strong>
              </div>
            </div>
            <div className="doc_perf_dash_rank_stat_node">
              <FiActivity className="doc_perf_dash_node_icon" />
              <div>
                <label>Total Reviews</label>
                <strong>{kpis.reviews}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demographics & Quarterly */}
      <div className="doc_perf_dash_dual_row doc_perf_dash_margin_top">
        <div className="doc_perf_dash_bento_item doc_perf_dash_flex_half">
          <div className="doc_perf_dash_card_head"><h3>Quarterly Overview</h3></div>
          <div className="doc_perf_dash_canvas_holder">
            <Bar 
              data={{
                labels: ["Q1", "Q2", "Q3", "Q4"],
                datasets: [{
                  label: "Appointments",
                  data: quarterlyData,
                  backgroundColor: ["#007acc", "#00d2ff", "#10b981", "#f59e0b"],
                  borderRadius: 8
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="doc_perf_dash_bento_item doc_perf_dash_flex_half">
          <div className="doc_perf_dash_card_head"><h3>Rating Distribution</h3></div>
          <div className="doc_perf_dash_chart_focus_mini">
            <Doughnut 
              data={{
                labels: ["5★", "4★", "3★", "2★", "1★"],
                datasets: [{
                  data: [ratingData[5], ratingData[4], ratingData[3], ratingData[2], ratingData[1]],
                  backgroundColor: ["#007acc", "#00d2ff", "#10b981", "#f59e0b", "#ef4444"],
                  borderWidth: 0, cutout: "75%"
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
            <div className="doc_perf_dash_donut_center">
              <strong>{kpis.rating}</strong>
              <span>Avg</span>
            </div>
          </div>
          <div className="doc_perf_dash_custom_legend_v2">
            {[5, 4, 3, 2, 1].map((star, idx) => (
              <div key={star} className="doc_perf_dash_legend_row">
                <div className="doc_perf_dash_legend_left">
                  <span className="doc_perf_dash_legend_dot" style={{ 
                    backgroundColor: ["#007acc", "#00d2ff", "#10b981", "#f59e0b", "#ef4444"][idx] 
                  }}></span>
                  <span>{star} Stars</span>
                </div>
                <span>{ratingData[star]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}