import React, { useMemo, useState } from "react";
import { 
  FiSearch, FiStar, FiMessageSquare, FiCheckCircle, FiFlag, FiX, FiActivity, FiUsers 
} from "react-icons/fi";

// --- DATA IMPORTS ---
import data from "../../Assets/Data/doctorsData.json";
import "./Doctor_Reviews.css";

/* ---------- GLOBAL CLINICAL UTILS ---------- */
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const fmtDate = (dISO) => {
  if (!dISO) return "";
  return new Date(dISO).toLocaleDateString(undefined, {
    month: "short", day: "2-digit", year: "numeric"
  });
};

const Stars = ({ value }) => {
  const v = clamp(value || 0, 0, 5);
  return (
    <div className="med_stars_flex">
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
  // --- STATE ENGINE ---
  const [listData, setListData] = useState(data.reviews || []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [modal, setModal] = useState({ open: false, id: null, text: "" });

  /* --- ANALYTICS ENGINE --- */
  const stats = useMemo(() => {
    const valid = listData.filter(r => r.rating > 0);
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    valid.forEach(r => {
      counts[clamp(Math.round(r.rating), 1, 5)]++;
      sum += r.rating;
    });
    return { 
      avg: valid.length ? (sum / valid.length) : 0, 
      counts, 
      total: valid.length 
    };
  }, [listData]);

  /* --- REGISTRY PROCESSING --- */
  const filteredList = useMemo(() => {
    let arr = listData.filter(r => {
      if (status !== "all" && r.status !== status) return false;
      const ql = q.toLowerCase();
      return r.patient.toLowerCase().includes(ql) || r.comment.toLowerCase().includes(ql);
    });
    return arr.sort((a, b) => sort === "newest" ? new Date(b.date) - new Date(a.date) : b.rating - a.rating);
  }, [listData, q, status, sort]);

  /* --- CLINICAL ACTIONS --- */
  const sendReply = () => {
    setListData(prev => prev.map(r => r.id === modal.id ? { ...r, reply: { text: modal.text, date: new Date().toISOString() }, status: "replied" } : r));
    setModal({ open: false, id: null, text: "" });
  };

  const markResolved = (id) => setListData(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r));
  const toggleFlag = (id) => setListData(prev => prev.map(r => r.id === id ? { ...r, status: r.status === "flagged" ? "new" : "flagged" } : r));

  return (
    <div className="med_reviews_elite med_page_fade_in">
      
      {/* 1. SECTION HEADER */}
      <div className="med_section_header">
        <div className="med_branding">
          <h1 className="med_title_elite">Patient <span className="highlight">Governance</span></h1>
          <p className="med_subtitle">Feedback registry and practitioner response management</p>
        </div>
        <div className="med_action_group">
            <button className="med_btn_outline"><FiActivity /> Experience Analytics</button>
        </div>
      </div>

      {/* 2. ANALYTICS BENTO BOX */}
      <div className="med_bento_analytics_bar">
          <div className="bento_stat_node main">
             <span className="bento_label">Global Rating</span>
             <div className="bento_val_flex">
                <h2>{stats.avg.toFixed(1)}</h2>
                <Stars value={stats.avg} />
             </div>
          </div>
          
          <div className="bento_stat_node charts">
            {[5, 4, 3, 2, 1].map(star => (
              <div className="bento_progress_row" key={star}>
                <span className="bento_star_idx">{star}★</span>
                <div className="bento_bar_track">
                  <div className="bento_bar_fill" style={{ width: `${(stats.counts[star]/stats.total * 100) || 0}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bento_stat_node total">
             <span className="bento_label">Total Registry</span>
             <h2>{stats.total}</h2>
             <FiUsers className="bento_bg_icon" />
          </div>
      </div>

      {/* 3. COMMAND CENTER */}
      <div className="med_registry_controls">
        <div className="med_search_elite">
          <FiSearch />
          <input 
            placeholder="Search by patient or clinical keyword..." 
            value={q} 
            onChange={e => setQ(e.target.value)} 
          />
        </div>
        <div className="med_filter_actions">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">View All Status</option>
            <option value="new">New Feedback</option>
            <option value="replied">Practitioner Replied</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}>
             <option value="newest">Sort by Recency</option>
             <option value="ratingHigh">Sort by Rating</option>
          </select>
        </div>
      </div>

      {/* 4. FEEDBACK STACK */}
      <div className="med_elite_feedback_stack">
        {filteredList.map(r => (
          <div key={r.id} className="med_elite_review_card">
            <div className="elite_card_head">
              <div className="identity_group">
                <div className="elite_avatar">{r.patient[0]}</div>
                <div className="elite_meta">
                  <strong>{r.patient}</strong>
                  <span>{fmtDate(r.date)} • Case ID: #{r.visitId}</span>
                </div>
              </div>
              <div className="elite_stars_box">
                  <Stars value={r.rating} />
              </div>
            </div>

            <div className="elite_card_body">
              <h4>{r.title}</h4>
              <p>{r.comment}</p>
            </div>

            {r.reply && (
              <div className="elite_reply_context">
                <div className="context_header">Practitioner Response • {fmtDate(r.reply.date)}</div>
                <p>{r.reply.text}</p>
              </div>
            )}

            <div className="elite_card_footer">
              <div className="pill_group">
                <span className={`elite_status_pill ${r.status}`}>{r.status}</span>
                <span className="elite_meta_pill">{r.public ? "EHR Public" : "Confidential"}</span>
              </div>
              <div className="action_group">
                <button className="elite_action_link" onClick={() => markResolved(r.id)} disabled={r.status === 'resolved'}>
                  <FiCheckCircle /> Resolve
                </button>
                <button className="elite_action_link reply" onClick={() => setModal({ open: true, id: r.id, text: r.reply?.text || "" })}>
                  <FiMessageSquare /> Reply
                </button>
                <button className={`elite_action_link flag ${r.status === 'flagged' ? 'active' : ''}`} onClick={() => toggleFlag(r.id)}>
                  <FiFlag />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. RESPONSE MODAL */}
      {modal.open && (
        <div className="med_modal_overlay">
          <div className="med_elite_reply_modal med_page_fade_in">
            <div className="modal_header_elite">
              <h3>Practitioner Consultation Response</h3>
              <button className="close_btn" onClick={() => setModal({ open: false, id: null, text: "" })}><FiX /></button>
            </div>
            <div className="modal_body_elite">
              <label>Clinical Guidance / Response</label>
              <textarea 
                rows="6" 
                placeholder="Draft a professional response to the patient's experience..." 
                value={modal.text}
                onChange={e => setModal(prev => ({...prev, text: e.target.value}))}
              />
            </div>
            <div className="modal_footer_elite">
              <button className="med_btn_lite" onClick={() => setModal({ open: false, id: null, text: "" })}>Discard</button>
              <button className="med_btn_primary" onClick={sendReply}>Finalize Response</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}