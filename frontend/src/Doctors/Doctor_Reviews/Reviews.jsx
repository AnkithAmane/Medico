// src/components/Reviews.jsx
import React, { useMemo, useState } from "react";
import "./Reviews.css";
import data from "../../Assets/Data/doctorsData.json";

/* ---------- Settings ---------- */
const DEFAULT_TZ = "Asia/Kolkata";
const USE_12H = false;

/* ---------- Helpers ---------- */
function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function fmtDate(dISO, tz = DEFAULT_TZ) {
  if (!dISO) return "";
  const d = new Date(dISO);
  const opts = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: USE_12H,
    timeZone: tz
  };
  return d.toLocaleString(undefined, opts);
}

function Stars({ value, size = 16 }) {
  const v = clamp(value || 0, 0, 5);
  const full = Math.floor(v);
  const half = v - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="rev__stars" role="img" aria-label={`${v} stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} style={{ fontSize: size }}>★</span>
      ))}
      {Array.from({ length: half }).map((_, i) => (
        <span key={`h${i}`} style={{ fontSize: size }}>☆</span>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} style={{ fontSize: size, opacity: 0.35 }}>★</span>
      ))}
    </span>
  );
}

/* ---------- Distribution helper ---------- */
function getStarCounts(list) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of list) {
    const k = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));
    if (k >= 1 && k <= 5) counts[k] += 1;
  }
  return counts;
}

/* ================= Component ================= */

export default function Reviews() {
  const [listData, setListData] = useState(data.reviews || []);

  /* Filters */
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [from] = useState("");
  const [to] = useState("");
  const [sort, setSort] = useState("newest");

  /* Reply modal */
  const [modal, setModal] = useState({ open: false, id: null, text: "" });

  /* KPIs */
  const stats = useMemo(() => {
    const valid = listData.filter(r => Number.isFinite(r.rating) && r.rating > 0);
    if (valid.length === 0) return { avg: 0, counts: [0, 0, 0, 0, 0] };

    const counts = [0, 0, 0, 0, 0];
    let sum = 0;

    valid.forEach(r => {
      const k = clamp(Math.round(r.rating), 1, 5);
      counts[k - 1]++;
      sum += r.rating;
    });

    return {
      avg: Math.round((sum / valid.length) * 10) / 10,
      counts
    };
  }, [listData]);

  /* Filter + sort */
  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const f = from ? new Date(from).setHours(0, 0, 0, 0) : null;
    const t = to ? new Date(to).setHours(23, 59, 59, 999) : null;

    let arr = listData.filter(r => {
      if (status !== "all" && r.status !== status) return false;
      if (minRating > 0 && r.rating < minRating) return false;

      const time = new Date(r.date).getTime();
      if (f && time < f) return false;
      if (t && time > t) return false;

      if (!ql) return true;
      return (
        r.patient.toLowerCase().includes(ql) ||
        r.title.toLowerCase().includes(ql) ||
        r.comment.toLowerCase().includes(ql) ||
        r.id.toLowerCase().includes(ql) ||
        r.visitId.toLowerCase().includes(ql)
      );
    });

    arr.sort((a, b) => {
      if (sort === "newest") return new Date(b.date) - new Date(a.date);
      if (sort === "oldest") return new Date(a.date) - new Date(b.date);
      if (sort === "ratingHigh") return b.rating - a.rating;
      if (sort === "ratingLow") return a.rating - b.rating;
      return 0;
    });

    return arr;
  }, [listData, q, status, minRating, from, to, sort]);

  /* Distribution */
  const dist = useMemo(() => getStarCounts(list), [list]);
  const total = list.length || 1;

  /* Actions */
  function openReply(r) {
    setModal({ open: true, id: r.id, text: r.reply?.text || "" });
  }

  function sendReply() {
    if (!modal.text.trim()) return alert("Please type a reply");
    setListData(prev =>
      prev.map(r =>
        r.id === modal.id
          ? { ...r, reply: { text: modal.text, date: new Date().toISOString() }, status: "replied" }
          : r
      )
    );
    setModal({ open: false, id: null, text: "" });
  }

  function markResolved(id) {
    setListData(prev =>
      prev.map(r => (r.id === id ? { ...r, status: "resolved" } : r))
    );
  }

  function toggleFlag(id) {
    setListData(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: r.status === "flagged" ? "new" : "flagged" } : r
      )
    );
  }

  return (
    <div className="rev">
      {/* KPIs + Distribution */}
      <div className="doctor-rev__header">
        <div className="doctor-rev__kpis">
          <div className="doctor-rev__kpi">
            <div className="doctor-rev__kpiNum">{stats.avg.toFixed(1)}</div>
            <div className="doctor-rev__kpiLabel">Average</div>
            <Stars value={stats.avg} />
          </div>

          <div className="doctor-rev__kpiDist">
            {[5, 4, 3, 2, 1].map(star => {
              const count = dist[star] || 0;
              const widthPct = Math.round((count / total) * 100);
              return (
                <div className="doctor-rev__barRow" key={star}>
                  <span className="doctor-rev__barLbl">{star}★</span>
                  <div className="doctor-rev__bar">
                    <div
                      className={`doctor-rev__barFill doctor-rev__barFill--s${star}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="doctor-rev__barPct">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="doctor-rev__controls">
        <input
          className="doctor-rev__input"
          placeholder="Search by patient, title, comment…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />

        <select className="doctor-rev__input" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="replied">Replied</option>
          <option value="resolved">Resolved</option>
          <option value="flagged">Flagged</option>
        </select>

        <select className="doctor-rev__input" value={minRating} onChange={e => setMinRating(Number(e.target.value))}>
          <option value={0}>Any rating</option>
          <option value={5}>5★</option>
          <option value={4}>4★ & up</option>
          <option value={3}>3★ & up</option>
        </select>

        <select className="doctor-rev__input" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="ratingHigh">Rating ↑</option>
          <option value="ratingLow">Rating ↓</option>
        </select>
      </div>

      {/* List */}
      <div className="doctor-rev__list">
        {list.length === 0 ? (
          <div className="doctor-rev__empty">No reviews {q ? <>matching “{q}”</> : ""}.</div>
        ) : (
          list.map(r => (
            <div className={`doctor-rev__card ${r.status === "flagged" ? "doctor-rev__card--flagged" : ""}`} key={r.id}>
              <div className="doctor-rev__rowTop">
                <div className="doctor-rev__patient">
                  <div className="doctor-rev__who">
                    <div className="doctor-rev__name">{r.patient}</div>
                    <div className="doctor-rev__meta">
                      {fmtDate(r.date)} · <span className="doctor-rev__muted">Visit: {r.visitId}</span>
                    </div>
                  </div>
                </div>
                <div className="doctor-rev__rating">
                  <Stars value={r.rating} />
                </div>
              </div>

              <div className="doctor-rev__title">{r.title}</div>
              <div className="doctor-rev__comment">{r.comment}</div>

              {r.reply && (
                <div className="doctor-rev__reply">
                  <div className="doctor-rev__replyHead">
                    Your reply · <span className="doctor-rev__muted">{fmtDate(r.reply.date)}</span>
                  </div>
                  <div>{r.reply.text}</div>
                </div>
              )}

              <div className="doctor-rev__actions">
                <div className="doctor-rev__badges">
                  <span className={`doctor-rev__badge doctor-rev__badge--${r.status}`}>{r.status}</span>
                  {r.public ? <span className="doctor-rev__badge">public</span> : <span className="doctor-rev__badge">private</span>}
                </div>
                <div className="doctor-rev__buttons">
                  <button className="doctor-rev__btn" onClick={() => openReply(r)}>Reply</button>
                  <button className="doctor-rev__btn" onClick={() => markResolved(r.id)} disabled={r.status === "resolved"}>Resolve</button>
                  <button className="doctor-rev__btn" onClick={() => toggleFlag(r.id)}>{r.status === "flagged" ? "Unflag" : "Flag"}</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {modal.open && (
        <div className="doctor-rev__overlay" role="dialog" aria-modal="true">
          <div className="doctor-rev__sheet">
            <div className="doctor-rev__sheetHead">
              <h3>Reply to review</h3>
              <button className="doctor-rev__sheetClose" onClick={() => setModal({ open: false, id: null, text: "" })}>✕</button>
            </div>
            <div className="doctor-rev__form">
              <label className="doctor-rev__field doctor-rev__field--full">
                <span className="doctor-rev__label">Your message</span>
                <textarea
                  rows="6"
                  className="doctor-rev__input"
                  value={modal.text}
                  onChange={e => setModal(s => ({ ...s, text: e.target.value }))}
                />
              </label>
            </div>
            <div className="doctor-rev__sheetActions">
              <button className="doctor-rev__btn" onClick={() => setModal({ open: false, id: null, text: "" })}>Cancel</button>
              <button className="doctor-rev__btn doctor-rev__btn--primary" onClick={sendReply}>Send reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
