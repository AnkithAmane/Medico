import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Star,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Award,
  AlertCircle,
  CheckCircle2,
  Activity,
  Quote,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Flag,
  Calendar,
  MessageSquare,
  UserCheck,
  ShieldAlert,
  SlidersHorizontal,
  BarChart3,
  HeartCrack,
  Lightbulb,
} from "lucide-react";
import "./Review_Management.css";

export default function ReviewManagement() {
  /* --- 1. CORE SYSTEM STATES --- */
  const [reviews, setReviews] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceFilter, setWorkspaceFilter] = useState("all"); // all, 5star, critical
  const [globalStarFilter, setGlobalStarFilter] = useState(null); // 🟢 ADDED: Global Interactive Cross-Filtering State
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  /* --- 2. DATA SYNCHRONIZATION (WITH SECURE HEADERS) --- */
  const syncIntelligence = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session Expired: Please log out and log back in.");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      };

      const [revRes, docRes] = await Promise.all([
        axios.get("http://localhost:5000/api/feedback/all", { headers }),
        axios.get("http://localhost:5000/api/doctors/list", { headers }),
      ]);

      setReviews(revRes.data || []);
      setDoctors(docRes.data || []);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Administrative Intelligence Pipeline Failure:", err);
      alert(`Sync Interrupted: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncIntelligence();
  }, []);

  /* --- 3. ADVANCED ANALYTICS ENGINE --- */
  const analytics = useMemo(() => {
    // Star Rating Distribution
    const distribution = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => Number(r.rating) === star).length;
      return {
        star,
        count,
        pct: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
      };
    });

    // Cross-Referenced Doctor Telemetry Calculations
    const docStats = doctors.map((doc) => {
      const docReviews = reviews.filter(
        (r) =>
          (r.doctorName || r.doctor || "").toLowerCase().trim() ===
          (doc.name || "").toLowerCase().trim(),
      );
      const total = docReviews.length;

      const totalScoreSum = docReviews.reduce(
        (sum, current) => sum + Number(current.rating || 0),
        0,
      );
      const avg = total > 0 ? (totalScoreSum / total).toFixed(1) : "5.0";

      const recentReviews = docReviews.slice(-3);
      const recentScoreSum = recentReviews.reduce(
        (sum, current) => sum + Number(current.rating || 0),
        0,
      );
      const recentAvg =
        recentReviews.length > 0 ? recentScoreSum / recentReviews.length : 5.0;

      const trend = recentAvg >= parseFloat(avg) ? "up" : "down";

      return { ...doc, avgRating: parseFloat(avg), totalReviews: total, trend };
    });

    const highPerformers = docStats
      .filter((d) => d.avgRating >= 4.5 && d.totalReviews > 0)
      .sort((a, b) => b.avgRating - a.avgRating);
    const lowPerformers = docStats
      .filter((d) => d.avgRating < 3.5 && d.totalReviews > 0)
      .sort((a, b) => a.avgRating - b.avgRating);
    const mostImproved = docStats
      .filter((d) => d.trend === "up" && d.totalReviews > 0)
      .slice(0, 3);

    /* --- 🟢 ADDED: AUTOMATED SEMANTIC TEXT MINING & INSIGHT ENGINE --- */
    const totalPromoters = reviews.filter((r) => Number(r.rating) >= 4).length;
    const totalDetractors = reviews.filter((r) => Number(r.rating) <= 2).length;
    const npsScore =
      reviews.length > 0
        ? (((totalPromoters - totalDetractors) / reviews.length) * 100).toFixed(
            0,
          )
        : "0";

    // Track Low Rated Department Anomalies
    const deptDeficits = {};
    docStats.forEach((d) => {
      if (d.avgRating < 4.0 && d.department) {
        deptDeficits[d.department] =
          (deptDeficits[d.department] || 0) + d.totalReviews;
      }
    });
    const leakDepartment =
      Object.keys(deptDeficits).sort(
        (a, b) => deptDeficits[b] - deptDeficits[a],
      )[0] || "None Flagged";

    // Dynamic Extraction of High Frequency Comment Keywords
    const stopWords = [
      "the",
      "and",
      "a",
      "to",
      "in",
      "is",
      "was",
      "for",
      "of",
      "with",
      "dr",
      "doctor",
      "very",
      "good",
      "great",
    ];
    const tokenCounts = {};
    reviews.forEach((r) => {
      const words = (r.comment || r.comments || r.feedback || "")
        .toLowerCase()
        .replace(/[^a-zA-Z ]/g, "")
        .split(" ");
      words.forEach((w) => {
        if (w.length > 3 && !stopWords.includes(w)) {
          tokenCounts[w] = (tokenCounts[w] || 0) + 1;
        }
      });
    });
    const topKeywords = Object.keys(tokenCounts)
      .sort((a, b) => tokenCounts[b] - tokenCounts[a])
      .slice(0, 4);

    return {
      distribution,
      highPerformers,
      lowPerformers,
      mostImproved,
      insights: { npsScore, leakDepartment, topKeywords },
    };
  }, [reviews, doctors]);

  /* --- 4. INDEPENDENT SPECIALIST WORKSPACE LOGIC --- */
  const workspaceData = useMemo(() => {
    if (!selectedDoctorId) return null;
    const doc = doctors.find((d) => d._id === selectedDoctorId);
    if (!doc) return null;

    let filtered = reviews.filter(
      (r) =>
        (r.doctorName || r.doctor || "").toLowerCase().trim() ===
        (doc.name || "").toLowerCase().trim(),
    );

    if (workspaceFilter === "5star")
      filtered = filtered.filter((r) => Number(r.rating) === 5);
    if (workspaceFilter === "critical")
      filtered = filtered.filter((r) => Number(r.rating) <= 2);

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          (r.patientName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (r.comment || r.comments || r.feedback || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    const totalScoreSum = filtered.reduce(
      (sum, current) => sum + Number(current.rating || 0),
      0,
    );
    const dynamicAvg =
      filtered.length > 0
        ? (totalScoreSum / filtered.length).toFixed(1)
        : "5.0";

    return {
      doc: { ...doc, avgRating: dynamicAvg },
      docReviews: filtered,
    };
  }, [selectedDoctorId, doctors, reviews, workspaceFilter, searchQuery]);

  /* --- 🟢 ADDED: CORE INTERACTIVE MASTER VIEW RENDERING MATRIX FILTER --- */
  const macroFilteredReviews = useMemo(() => {
    if (!globalStarFilter) return reviews;
    return reviews.filter((r) => Number(r.rating) === globalStarFilter);
  }, [reviews, globalStarFilter]);

  /* --- 5. ACTIONS --- */
  const handleFlag = (id) =>
    alert(`Review ${id} flagged for Administrative Quality Audit Review.`);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Archive this patient feedback permanently from active reporting tables?",
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
        };

        await axios.delete(`http://localhost:5000/api/feedback/delete/${id}`, {
          headers,
        });
        syncIntelligence();
      } catch (err) {
        alert("Archive operational failure sequence tracking lost.");
      }
    }
  };

  if (loading && reviews.length === 0 && doctors.length === 0) {
    return (
      <div className="admin_rev_intel_loader_frame">
        <Loader2 className="admin_rev_intel_spin" size={40} />
        <p>Deciphering Patient Sentiments...</p>
      </div>
    );
  }

  /* ==================== RENDER PANEL: DEEP SENTIMENT ISOLATED WORKSPACE ==================== */
  if (selectedDoctorId && workspaceData?.doc) {
    const { doc, docReviews } = workspaceData;
    return (
      <div className="admin_rev_intel_root doc_home_view_fade_in">
        <div className="admin_rev_intel_workspace_nav">
          <button
            className="admin_rev_intel_back_btn"
            onClick={() => {
              setSelectedDoctorId(null);
              setWorkspaceFilter("all");
              setSearchQuery("");
            }}
          >
            <ArrowLeft size={18} /> Exit Workspace
          </button>
          <div className="admin_rev_intel_ws_controls">
            <div className="admin_rev_intel_search_mini">
              <Search size={14} />
              <input
                placeholder="Search within text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={workspaceFilter}
              onChange={(e) => setWorkspaceFilter(e.target.value)}
            >
              <option value="all">All Feedback</option>
              <option value="5star">5 Star Only</option>
              <option value="critical">Critical Only</option>
            </select>
          </div>
        </div>

        <div className="admin_rev_intel_workspace_hero">
          <div className="admin_rev_intel_hero_identity">
            <img
              src={
                doc.photo
                  ? `http://localhost:5000/uploads/${doc.photo}`
                  : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">DR</text></svg>`
              }
              alt={doc.name}
              onError={(e) => {
                e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">DR</text></svg>`;
              }}
            />
            <div>
              <div className="admin_rev_intel_status_tag">Active Analysis</div>
              <h2>{doc.name}</h2>
              <p>{doc.department} • Clinical Specialist</p>
            </div>
          </div>
          <div className="admin_rev_intel_hero_stats">
            <div className="admin_rev_intel_h_stat">
              <span>Clinical Rating</span>
              <strong>
                {doc.avgRating} <Star size={20} fill="#fff" />
              </strong>
            </div>
            <div className="admin_rev_intel_h_stat">
              <span>Volume</span>
              <strong>{docReviews.length}</strong>
            </div>
            <div className="admin_rev_intel_h_stat">
              <span>Trend</span>
              <strong>
                {doc.trend === "up" ? (
                  <TrendingUp color="#4ade80" />
                ) : (
                  <TrendingDown color="#fb7185" />
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="admin_rev_intel_masonry">
          {docReviews.length > 0 ? (
            docReviews.map((rev) => (
              <div
                className={`admin_rev_intel_card ${Number(rev.rating) <= 2 ? "critical_border" : ""}`}
                key={rev._id}
              >
                <div className="admin_rev_intel_card_header">
                  <div className="admin_rev_intel_patient_info">
                    <div className="admin_rev_intel_p_avatar">
                      {(rev.patientName || "P").charAt(0).toUpperCase()}
                    </div>
                    <b>{rev.patientName}</b>
                  </div>
                  <div className="admin_rev_intel_stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < Number(rev.rating) ? "#facc15" : "none"}
                        color="#facc15"
                      />
                    ))}
                  </div>
                </div>
                <div className="admin_rev_intel_card_content">
                  <Quote size={18} className="admin_rev_intel_quote_icon" />
                  <p className="admin_rev_intel_text">
                    {rev.comment || rev.comments || rev.feedback}
                  </p>
                </div>
                <div className="admin_rev_intel_card_footer">
                  <div className="admin_rev_intel_meta_group">
                    <Calendar size={12} />
                    <span className="admin_rev_intel_date">
                      {rev.date ||
                        (rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString()
                          : "May 2026")}
                    </span>
                  </div>
                  <div className="admin_rev_intel_card_actions">
                    <button
                      className="admin_rev_intel_action_icon"
                      onClick={() => handleFlag(rev._id)}
                      title="Flag Review"
                    >
                      <Flag size={14} />
                    </button>
                    <button
                      className="admin_rev_intel_delete"
                      onClick={() => handleDelete(rev._id)}
                      title="Archive Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className="admin_rev_intel_empty_state_full"
              style={{ gridColumn: "span 3" }}
            >
              <Activity size={48} />
              <h3>No Feedback Matches</h3>
              <p>
                Try adjusting your search query inputs or category filters for
                this specialist entry.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ==================== RENDER MODULE PANEL: SYSTEM CONSOLE MASTER OVERVIEW ==================== */
  return (
    <div className="admin_rev_intel_root doc_home_view_fade_in">
      <header className="admin_rev_intel_header">
        <div className="admin_rev_intel_branding">
          <h1>
            Sentiment <span className="admin_rev_intel_cyan">Intelligence</span>
          </h1>
          <p>
            Hospital Reputation & Specialist Performance Hub • Verified System:{" "}
            {lastSynced}
          </p>
        </div>
        <div className="admin_rev_intel_header_btns">
          <button
            className="admin_rev_intel_sync_btn"
            onClick={syncIntelligence}
            title="Refresh Core Matrix Streams"
          >
            {loading ? (
              <RefreshCw size={16} className="admin_rev_intel_spin" />
            ) : (
              <RefreshCw size={16} />
            )}
          </button>
          <button
            className="admin_rev_intel_primary_btn"
            onClick={() => window.print()}
          >
            <MessageSquare size={16} /> Export Summary
          </button>
        </div>
      </header>

      {/* --- TIER 1: KEY PERFORMANCE INDICATORS --- */}
      <div className="admin_rev_intel_kpi_grid">
        <div className="admin_rev_intel_kpi_card">
          <div className="admin_rev_intel_kpi_icon blue">
            <UserCheck size={20} />
          </div>
          <div className="admin_rev_intel_kpi_info">
            <span>Top Specialist</span>
            <strong>{analytics.highPerformers[0]?.name || "N/A"}</strong>
          </div>
        </div>
        <div className="admin_rev_intel_kpi_card">
          <div className="admin_rev_intel_kpi_icon green">
            <BarChart3 size={20} />
          </div>
          <div className="admin_rev_intel_kpi_info">
            <span>Net Patient Promoter Score</span>
            <strong>{analytics.insights.npsScore}% Score</strong>
          </div>
        </div>
        <div className="admin_rev_intel_kpi_card">
          <div className="admin_rev_intel_kpi_icon red">
            <ShieldAlert size={20} />
          </div>
          <div className="admin_rev_intel_kpi_info">
            <span>Critical Alerts</span>
            <strong>{analytics.lowPerformers.length} Cases</strong>
          </div>
        </div>
      </div>

      {/* --- 🟢 ADDED: NEW TIER - COGNITIVE INSIGHTS METRICS BAR --- */}
      <div
        className="admin_rev_intel_insights_ticker"
        style={{
          display: "flex",
          gap: "20px",
          background: "#f1f5f9",
          padding: "15px 20px",
          borderRadius: "8px",
          margin: "20px 0",
          borderLeft: "4px solid #0284c7",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#0369a1",
            fontWeight: "600",
            fontSize: "0.9rem",
          }}
        >
          <Lightbulb size={16} /> REPUTATION SIGNALS:
        </div>
        <div style={{ fontSize: "0.9rem", color: "#334155" }}>
          Deficit Sector Focus:{" "}
          <span style={{ fontWeight: "700", color: "#e11d48" }}>
            {analytics.insights.leakDepartment}
          </span>
        </div>
        <div
          style={{ height: "14px", width: "1px", background: "#cbd5e1" }}
        ></div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.9rem",
            color: "#334155",
          }}
        >
          High Frequency Keywords:
          {analytics.insights.topKeywords.map((tag, i) => (
            <span
              key={i}
              style={{
                background: "#e2e8f0",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#475569",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* --- TIER 2: GLOBAL DISTRIBUTION WITH INTERACTIVE STAR FILTERING --- */}
      <section className="admin_rev_intel_dist_banner">
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            padding: "0 5px",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: "700",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <SlidersHorizontal size={14} /> INTERACTIVE STAR CROSS-FILTERING
            TRACKS:
          </span>
          {globalStarFilter && (
            <button
              onClick={() => setGlobalStarFilter(null)}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Reset Filter
            </button>
          )}
        </div>
        {analytics.distribution.map((item) => (
          <div
            className={`admin_rev_intel_dist_item ${globalStarFilter === item.star ? "active_star_track_row" : ""}`}
            key={item.star}
            onClick={() =>
              setGlobalStarFilter(
                globalStarFilter === item.star ? null : item.star,
              )
            }
            style={{
              cursor: "pointer",
              transition: "all 0.2s ease",
              padding: "8px",
              borderRadius: "6px",
            }}
          >
            <div
              className="admin_rev_intel_dist_label"
              style={{
                fontWeight: globalStarFilter === item.star ? "800" : "500",
              }}
            >
              {item.star} ★
            </div>
            <div className="admin_rev_intel_dist_bar_bg">
              <div
                className="admin_rev_intel_dist_bar_fill"
                style={{
                  width: `${item.pct}%`,
                  backgroundColor:
                    item.star >= 4
                      ? "#10b981"
                      : item.star === 3
                        ? "#facc15"
                        : "#ef4444",
                  outline:
                    globalStarFilter === item.star
                      ? "2px solid #0f172a"
                      : "none",
                }}
              ></div>
            </div>
            <div
              className="admin_rev_intel_dist_count"
              style={{
                fontWeight: globalStarFilter === item.star ? "700" : "400",
              }}
            >
              {item.count} Reports
            </div>
          </div>
        ))}
      </section>

      {/* --- TIER 3: LEADERBOARD & COMPARISON --- */}
      <div className="admin_rev_intel_leaderboard_grid">
        {/* High Performance Column */}
        <div className="admin_rev_intel_leaderboard_col">
          <div className="admin_rev_intel_col_header_group">
            <h3 className="admin_rev_intel_col_title">
              <Award size={18} color="#10b981" /> High-Performance Registry
            </h3>
            <span className="admin_rev_intel_count_pill">
              {analytics.highPerformers.length}
            </span>
          </div>
          <div className="admin_rev_intel_list">
            {analytics.highPerformers.slice(0, 6).map((doc) => (
              <div
                className="admin_rev_intel_row"
                key={doc._id}
                onClick={() => setSelectedDoctorId(doc._id)}
              >
                <div className="admin_rev_intel_row_main">
                  <img
                    src={
                      doc.photo
                        ? `http://localhost:5000/uploads/${doc.photo}`
                        : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">DR</text></svg>`
                    }
                    alt={doc.name}
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">DR</text></svg>`;
                    }}
                  />
                  <div className="admin_rev_intel_row_info">
                    <strong>{doc.name}</strong>
                    <span>{doc.department}</span>
                  </div>
                </div>
                <div className="admin_rev_intel_score positive">
                  {Number(doc.avgRating).toFixed(1)} ★
                </div>
              </div>
            ))}
            {analytics.highPerformers.length === 0 && (
              <div
                className="admin_rev_intel_perfect_state"
                style={{ padding: "20px" }}
              >
                <p style={{ color: "#94a3b8" }}>
                  No specialists currently logged within high performance
                  thresholds.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Needs Oversight Column */}
        <div className="admin_rev_intel_leaderboard_col">
          <div className="admin_rev_intel_col_header_group">
            <h3 className="admin_rev_intel_col_title">
              <AlertCircle size={18} color="#ef4444" /> Needs Immediate
              Oversight
            </h3>
            <span className="admin_rev_intel_count_pill red">
              {analytics.lowPerformers.length}
            </span>
          </div>
          <div className="admin_rev_intel_list">
            {analytics.lowPerformers.length > 0 ? (
              analytics.lowPerformers.slice(0, 6).map((doc) => (
                <div
                  className="admin_rev_intel_row"
                  key={doc._id}
                  onClick={() => setSelectedDoctorId(doc._id)}
                >
                  <div className="admin_rev_intel_row_main">
                    <img
                      src={
                        doc.photo
                          ? `http://localhost:5000/uploads/${doc.photo}`
                          : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">DR</text></svg>`
                      }
                      alt={doc.name}
                      onError={(e) => {
                        e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">DR</text></svg>`;
                      }}
                    />
                    <div className="admin_rev_intel_row_info">
                      <strong>{doc.name}</strong>
                      <span>{doc.department}</span>
                    </div>
                  </div>
                  <div className="admin_rev_intel_score negative">
                    {Number(doc.avgRating).toFixed(1)} ★
                  </div>
                </div>
              ))
            ) : (
              <div className="admin_rev_intel_perfect_state">
                <CheckCircle2 size={32} color="#10b981" />
                <p>
                  All specialists are currently maintaining high satisfaction
                  standards.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- 🟢 ADDED: TIER 4 - DRILL DOWN CONSOLE ON STAR SELECTION FILTER --- */}
      {globalStarFilter && (
        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "1.1rem",
            }}
          >
            <Filter size={18} color="#0284c7" /> Isolated Focus Segment Logs (
            {globalStarFilter} Star Feedback Nodes)
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "15px",
            }}
          >
            {macroFilteredReviews.length > 0 ? (
              macroFilteredReviews.map((rev) => (
                <div
                  key={rev._id}
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "15px",
                    borderRadius: "6px",
                    background: "#f8fafc",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <strong style={{ color: "#0f172a", fontSize: "0.9rem" }}>
                      {rev.patientName || "Verified Patient"}
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      To: {rev.doctorName || rev.doctor}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "0.85rem",
                      color: "#334155",
                      fontStyle: "italic",
                    }}
                  >
                    "
                    {rev.comment ||
                      rev.comments ||
                      rev.feedback ||
                      "No written assessment provided."}
                    "
                  </p>
                </div>
              ))
            ) : (
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.85rem",
                  gridColumn: "span 3",
                }}
              >
                No specific standalone records found logging this rating
                criteria threshold.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
