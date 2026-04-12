import React, { useMemo, useState } from "react";
import { 
  FiSearch, FiStar, FiMessageSquare, FiCheckCircle, FiFlag, FiX, FiActivity, FiUsers,
  FiChevronLeft, FiChevronRight 
} from "react-icons/fi";

import patientsData from "../../Assets/Data/patient.json"; 
import "./Doctor_Reviews.css";

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const fmtDate = (dISO) => {
  if (!dISO) return "N/A";
  return new Date(dISO).toLocaleDateString(undefined, {
    month: "short", day: "2-digit", year: "numeric"
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
  const currentDoctorName = "Dr. Meera Nair";
  
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [modal, setModal] = useState({ open: false, id: null, text: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const allReviews = useMemo(() => {
    const filtered = [];
    patientsData.forEach(patient => {
      if (patient.reviewHistory) {
        patient.reviewHistory.forEach(rev => {
          if (rev.doctorName === currentDoctorName) {
            filtered.push({
              ...rev,
              id: `${patient.id}-${rev.date}-${rev.rating}`,
              patientName: patient.name,
              patientPhoto: patient.photo,
              patientDisease: patient.disease,
              status: rev.status || "new",
            });
          }
        });
      }
    });
    return filtered;
  }, [currentDoctorName]);

  const [listData, setListData] = useState(allReviews);

  const stats = useMemo(() => {
    const valid = allReviews.filter(r => r.rating > 0);
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    valid.forEach(r => {
      counts[clamp(Math.round(r.rating), 1, 5)]++;
      sum += r.rating;
    });
    return { avg: valid.length ? (sum / valid.length) : 0, counts, total: valid.length };
  }, [allReviews]);

  const processedList = useMemo(() => {
    let arr = listData.filter(r => {
      if (status !== "all" && r.status !== status) return false;
      const ql = q.toLowerCase();
      return r.patientName.toLowerCase().includes(ql) || r.feedback.toLowerCase().includes(ql);
    });
    return arr.sort((a, b) => sort === "newest" ? new Date(b.date) - new Date(a.date) : b.rating - a.rating);
  }, [listData, q, status, sort]);

  const totalPages = Math.ceil(processedList.length / recordsPerPage);
  const currentRecords = processedList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sendReply = () => {
    setListData(prev => prev.map(r => r.id === modal.id ? { 
      ...r, reply: { text: modal.text, date: new Date().toISOString() }, status: "replied" 
    } : r));
    setModal({ open: false, id: null, text: "" });
  };

  const markResolved = (id) => setListData(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r));
  const toggleFlag = (id) => setListData(prev => prev.map(r => r.id === id ? { ...r, status: r.status === "flagged" ? "new" : "flagged" } : r));

  return (
    <div className="doc_rev_m_container doc_rev_m_fade_in">
      <div className="doc_rev_m_header">
        <div className="doc_rev_m_branding">
          <h1 className="doc_rev_m_title">Patient <span className="doc_rev_m_highlight">Governance</span></h1>
          <p className="doc_rev_m_subtitle">Managing feedback for <b>{currentDoctorName}</b></p>
        </div>
        <div className="doc_rev_m_action_group">
          <button className="doc_rev_m_btn_outline"><FiActivity /> Experience Analytics</button>
        </div>
      </div>

      <div className="doc_rev_m_bento_grid">
        <div className="doc_rev_m_stat_card main">
          <span className="doc_rev_m_label">Global Rating</span>
          <div className="doc_rev_m_val_flex">
            <h2>{stats.avg.toFixed(1)}</h2>
            <Stars value={stats.avg} />
          </div>
        </div>
        
        <div className="doc_rev_m_stat_card charts">
          {[5, 4, 3, 2, 1].map(star => (
            <div className="doc_rev_m_progress_row" key={star}>
              <span className="doc_rev_m_star_idx">{star}★</span>
              <div className="doc_rev_m_bar_track">
                <div className="doc_rev_m_bar_fill" style={{ width: `${(stats.counts[star]/stats.total * 100) || 0}%` }} />
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

      <div className="doc_rev_m_controls">
        <div className="doc_rev_m_search_box">
          <FiSearch />
          <input 
            placeholder="Search by patient or clinical keyword..." 
            value={q} 
            onChange={e => { setQ(e.target.value); setCurrentPage(1); }} 
          />
        </div>
        <div className="doc_rev_m_filter_group">
          <select value={status} onChange={e => { setStatus(e.target.value); setCurrentPage(1); }}>
            <option value="all">View All Status</option>
            <option value="new">New Feedback</option>
            <option value="replied">Practitioner Replied</option>
            <option value="resolved">Resolved Cases</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}>
             <option value="newest">Sort by Recency</option>
             <option value="ratingHigh">Sort by Rating</option>
          </select>
        </div>
      </div>

      <div className="doc_rev_m_feed_stack">
        {currentRecords.length > 0 ? currentRecords.map(r => (
          <div key={r.id} className="doc_rev_m_review_card">
            <div className="doc_rev_m_card_head">
              <div className="doc_rev_m_identity">
                <img src={r.patientPhoto} alt="" className="doc_rev_m_avatar_img" />
                <div className="doc_rev_m_meta">
                  <strong>{r.patientName}</strong>
                  <span>{fmtDate(r.date)} • {r.patientDisease}</span>
                </div>
              </div>
              <div className="doc_rev_m_stars_box">
                  <Stars value={r.rating} />
              </div>
            </div>

            <div className="doc_rev_m_card_body">
              <p>{r.feedback}</p>
            </div>

            {r.reply && (
              <div className="doc_rev_m_reply_box">
                <div className="doc_rev_m_reply_header">Your Response • {fmtDate(r.reply.date)}</div>
                <p>{r.reply.text}</p>
              </div>
            )}

            <div className="doc_rev_m_card_footer">
              <div className="doc_rev_m_pill_group">
                <span className={`doc_rev_m_status_pill ${r.status}`}>{r.status}</span>
              </div>
              <div className="doc_rev_m_actions">
                <button className="doc_rev_m_action_btn" onClick={() => markResolved(r.id)} disabled={r.status === 'resolved'}>
                  <FiCheckCircle /> Resolve
                </button>
                <button className="doc_rev_m_action_btn reply" onClick={() => setModal({ open: true, id: r.id, text: r.reply?.text || "" })}>
                  <FiMessageSquare /> Reply
                </button>
                <button className={`doc_rev_m_action_btn flag ${r.status === 'flagged' ? 'active' : ''}`} onClick={() => toggleFlag(r.id)}>
                  <FiFlag />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="doc_rev_m_empty">No clinical records found matching your search.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="doc_rev_m_pagination">
          <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
            <FiChevronLeft />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i} 
              className={currentPage === i + 1 ? "active" : ""} 
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
            <FiChevronRight />
          </button>
        </div>
      )}

      {modal.open && (
        <div className="doc_rev_m_modal_overlay">
          <div className="doc_rev_m_modal doc_rev_m_fade_in">
            <div className="doc_rev_m_modal_header">
              <h3>Practitioner Consultation Response</h3>
              <button className="doc_rev_m_close_modal" onClick={() => setModal({ open: false, id: null, text: "" })}><FiX /></button>
            </div>
            <div className="doc_rev_m_modal_body">
              <label>Clinical Guidance / Response</label>
              <textarea 
                rows="6" 
                placeholder="Draft a professional response to the patient's experience..." 
                value={modal.text}
                onChange={e => setModal(prev => ({...prev, text: e.target.value}))}
              />
            </div>
            <div className="doc_rev_m_modal_footer">
              <button className="doc_rev_m_btn_discard" onClick={() => setModal({ open: false, id: null, text: "" })}>Discard</button>
              <button className="doc_rev_m_btn_finalize" onClick={sendReply}>Finalize Response</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}