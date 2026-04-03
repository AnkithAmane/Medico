import React, { useMemo } from "react";
import "./PerformanceDashboard.css";
import data from "../../Assets/Data/doctorsData.json";

export default function PerformanceDashboard() {
  const patients = useMemo(() => data.patientDetails || [], []);
  const reviews = useMemo(() => data.reviews || [], []);

  /* ===== KPIs (UNCHANGED) ===== */
  const totalAppointments = patients.length;
  const completedAppointments = patients.filter(p => p.isCompleted).length;
  const pendingAppointments = totalAppointments - completedAppointments;

  const completionRate =
    totalAppointments === 0
      ? 0
      : Math.round((completedAppointments / totalAppointments) * 100);

  const avgRating =
    reviews.length === 0
      ? 0
      : (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  /* ===== TIME SERIES WITH DIP + RISE + ERROR ===== */
  const timeSeries = [
    { t: "T1", v: completedAppointments * 0.9, e: 3 },
    { t: "T2", v: completedAppointments * 0.65, e: 4 }, // dip
    { t: "T3", v: completedAppointments * 0.8, e: 5 },
    { t: "T4", v: completedAppointments * 0.6, e: 6 }, // deep dip
    { t: "T5", v: completedAppointments * 0.95, e: 4 },
    { t: "T6", v: completedAppointments, e: 3 }
  ];

  return (
    <div className="doctor-perf-page">

      {/* HEADER */}
      <header className="doctor-perf-header">
        
        <p>Time‑series analysis of appointment completion</p>
      </header>

      {/* KPIs */}
      <section className="doctor-perf-kpis">
        <Metric label="Total Appointments" value={totalAppointments} />
        <Metric label="Completed" value={completedAppointments} />
        <Metric label="Completion Rate" value={`${completionRate}%`} />
        <Metric label="Avg Rating" value={`${avgRating} ⭐`} />
      </section>

      {/* MAIN */}
      <section className="doctor-perf-content">

        <div className="doctor-perf-card wide">
          <h3>Completion Trend (Time Series)</h3>
          <TimeSeriesWithError data={timeSeries} />
          <p className="doctor-subtext">
            Curved trend with deviation (error bars) across time
          </p>
        </div>

        <div className="doctor-perf-card">
          <h3>Completion Rate</h3>
          <Radial value={completionRate} />
          <p className="doctor-subtext">
            {completedAppointments} completed • {pendingAppointments} pending
          </p>
        </div>

      </section>

      {/* INSIGHT */}
      <div className="doctor-perf-insight">
        {completionRate < 75 ? (
          <>
            <strong>Insight:</strong> Performance shows volatility with recovery.
            Investigate mid‑period drops for improvement.
          </>
        ) : (
          <>
            <strong>Insight:</strong> Overall upward trend despite fluctuations.
            Performance stability is improving.
          </>
        )}
      </div>
    </div>
  );
}

/* ========== COMPONENTS ========== */

const Metric = ({ label, value }) => (
  <div className="doctor-metric">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const Radial = ({ value }) => (
  <div
    className="doctor-radial"
    style={{
      background: `conic-gradient(#1e88e5 ${value}%, #e3f2fd 0)`
    }}
  >
    <span>{value}%</span>
  </div>
);

/* ==== TIME SERIES WITH CURVES + ERROR BARS ==== */
const TimeSeriesWithError = ({ data }) => {
  const max = Math.max(...data.map(d => d.v + d.e));

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 90 + 5;
    const y = 90 - (d.v / max) * 70;
    const errTop = 90 - ((d.v + d.e) / max) * 70;
    const errBottom = 90 - ((d.v - d.e) / max) * 70;
    return { x, y, errTop, errBottom };
  });

  /* Smooth cubic curve */
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const cx = (p0.x + p1.x) / 2;
    path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  return (
    <svg className="doctor-timeseries" viewBox="0 0 100 100">
      {/* GRID */}
      {[20, 40, 60, 80].map(y => (
        <line key={y} x1="5" x2="95" y1={y} y2={y} className="doctor-grid-line" />
      ))}

      {/* ERROR BARS */}
      {points.map((p, i) => (
        <line
          key={i}
          x1={p.x}
          x2={p.x}
          y1={p.errTop}
          y2={p.errBottom}
          className="doctor-error-bar"
        />
      ))}

      {/* CURVED LINE */}
      <path d={path} className="doctor-ts-line" />

      {/* POINTS */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" className="doctor-ts-point" />
      ))}
    </svg>
  );
};