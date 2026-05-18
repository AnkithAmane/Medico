import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  FiSearch,
  FiStar,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
} from "react-icons/fi";
import "./Doctor_Review_Management.css";

// Helper Functions
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const fmtDate = (dISO) => {
  if (!dISO) return "N/A";
  return new Date(dISO).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const Stars = ({ value }) => {
  const v = clamp(value || 0, 0, 5);
  return (
    <div className="doc_rev_m_stars_flex">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          size={14}
          fill={i < Math.floor(v) ? "#007acc" : "none"}
          color={i < Math.floor(v) ? "#007acc" : "#e2e8f0"}
        />
      ))}
    </div>
  );
};

export default function Reviews() {
  // 1. Live Context from Storage
  const doctorUser = JSON.parse(localStorage.getItem("userData")) || {};
  const currentDoctorName = doctorUser.name;

  // UI and Interaction State
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(true);
  const recordsPerPage = 5;

  // 2. Logic: Fetch data from Standalone Feedback Collection
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Hits your root feedback collection endpoint filtering directly by doctorName
      const res = await axios.get(
        `http://localhost:5000/api/appointments/feedback/doctor?doctorName=${encodeURIComponent(currentDoctorName)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setListData(res.data || []);
    } catch (err) {
      console.error("Failed to sync clinical feedback registry:", err);
      setListData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentDoctorName) fetchReviews();
  }, [currentDoctorName]);

  // Statistics Calculation Engine
  const stats = useMemo(() => {
    const valid = listData.filter((r) => r.rating > 0);
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    valid.forEach((r) => {
      counts[clamp(Math.round(r.rating), 1, 5)]++;
      sum += r.rating;
    });
    return {
      avg: valid.length ? sum / valid.length : 0,
      counts,
      total: valid.length,
    };
  }, [listData]);

  // Filtering and Sorting Engine
  const processedList = useMemo(() => {
    let arr = listData.filter((r) => {
      const ql = q.toLowerCase();
      // Maps fields directly to your schema changes: r.comments (plural) instead of r.comment
      return (r.comments || "").toLowerCase().includes(ql);
    });
    return arr.sort((a, b) =>
      sort === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : b.rating - a.rating,
    );
  }, [listData, q, sort]);

  // Pagination Calculations
  const totalPages = Math.ceil(processedList.length / recordsPerPage);
  const currentRecords = processedList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Pagination safety fallback loop
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [processedList, totalPages, currentPage]);

  if (loading)
    return (
      <div className="doc_rev_loading">
        <FiLoader className="spin" /> Opening Feedback Registry...
      </div>
    );

  return (
    <div className="doc_rev_m_container doc_rev_m_fade_in">
      <div className="doc_rev_m_header">
        <div className="doc_rev_m_branding">
          <h1 className="doc_rev_m_title">
            Patient <span className="doc_rev_m_highlight">Governance</span>
          </h1>
          <p className="doc_rev_m_subtitle">
            Managing verified feedback for <b>{currentDoctorName}</b>
          </p>
        </div>
      </div>

      {/* KPI Stats Bento Grid */}
      <div className="doc_rev_m_bento_grid">
        <div className="doc_rev_m_stat_card main">
          <span className="doc_rev_m_label">Global Rating</span>
          <div className="doc_rev_m_val_flex">
            <h2>{stats.avg.toFixed(1)}</h2>
            <Stars value={stats.avg} />
          </div>
        </div>

        <div className="doc_rev_m_stat_card charts">
          {[5, 4, 3, 2, 1].map((star) => (
            <div className="doc_rev_m_progress_row" key={star}>
              <span className="doc_rev_m_star_idx">{star}★</span>
              <div className="doc_rev_m_bar_track">
                <div
                  className="doc_rev_m_bar_fill"
                  style={{
                    width: `${(stats.counts[star] / stats.total) * 100 || 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="doc_rev_m_stat_card total">
          <span className="doc_rev_m_label">Total Registry</span>
          <h2>{stats.total}</h2>
          <FiUsers className="doc_rev_m_bg_icon" />
        </div>
      </div>

      {/* Filtering and Search Controls */}
      <div className="doc_rev_m_controls">
        <div className="doc_rev_m_search_box">
          <FiSearch />
          <input
            placeholder="Filter text logs..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="doc_rev_m_filter_group">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="newest">Sort: Newest</option>
            <option value="highest">Sort: Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Review Feed Stack */}
      <div className="doc_rev_m_feed_stack">
        {currentRecords.map((r) => (
          <div key={r._id} className="doc_rev_m_review_card">
            <div className="doc_rev_m_card_head">
              <div className="doc_rev_m_identity">
                <div className="doc_rev_m_avatar_placeholder">P</div>
                <div className="doc_rev_m_meta">
                  <strong>Verified Patient Account</strong>
                  <span>{fmtDate(r.createdAt)}</span>{" "}
                  {/* Maps directly to createdAt schema field */}
                </div>
              </div>
              <Stars value={r.rating} />
            </div>

            <div className="doc_rev_m_card_body">
              <p>{r.comments || "No textual comment submitted with rating."}</p>{" "}
              {/* Maps directly to schema 'comments' */}
            </div>
          </div>
        ))}
        {currentRecords.length === 0 && (
          <div className="empty_feedback_prompt">
            No matching feedback entries logged in this channel slot.
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {totalPages > 1 && (
        <div className="doc_rev_m_pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <FiChevronLeft /> Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
