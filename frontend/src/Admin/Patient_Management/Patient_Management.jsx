import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  X,
  Scale,
  Ruler,
  User,
  Phone,
  Scroll,
  Clock,
  Activity,
  Download,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Mail,
  ArrowLeft,
  MapPin,
  ClipboardList,
  Loader2,
  AlertCircle,
} from "lucide-react";

import "./Patient_Management.css";

export default function Patient_Management() {
  // Global context (from your Layout Search Bar)
  const { searchTerm: globalSearch = "" } = useOutletContext() || {};

  // Component States
  const [localSearch, setLocalSearch] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // MERN Data States
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Workspace sub-filters
  const [showAllAppts, setShowAllAppts] = useState(false);

  /* --- 1. BACKEND SYNC LOGIC --- */
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [patientRes, apptRes] = await Promise.all([
        axios.get("http://localhost:5000/api/patients/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/appointments/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPatients(patientRes.data || []);
      setAppointments(apptRes.data || []);
    } catch (err) {
      console.error("Clinical Registry Sync Failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync selected patient metrics inline if data updates in background trace frames
  useEffect(() => {
    if (selectedPatient) {
      const updated = patients.find((p) => p._id === selectedPatient._id);
      if (updated) setSelectedPatient(updated);
    }
  }, [patients]);

  /* --- 2. PERSISTENCE LOGIC (CREATE/UPDATE) --- */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const patientObject = {
      name: formData.get("name"),
      age: parseInt(formData.get("age"), 10),
      gender: formData.get("gender"),
      weight: formData.get("weight"),
      height: formData.get("height"),
      disease: formData.get("disease"),
      contact: formData.get("contact"),
    };

    try {
      const token = localStorage.getItem("token");
      if (editMode && selectedPatient) {
        await axios.put(
          `http://localhost:5000/api/patients/update/${selectedPatient._id}`,
          patientObject,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/patients/register",
          patientObject,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }

      setShowForm(false);
      setEditMode(false);
      fetchData();
    } catch (err) {
      alert("Error saving record. Please try again.");
    }
  };

  /* --- 3. HELPERS & CALCULATIONS --- */
  const getAgeClass = (age) => {
    if (age < 13) return "Child";
    if (age < 20) return "Teen";
    if (age < 60) return "Adult";
    return "Senior";
  };

  const calculateBMI = (weightStr, heightStr) => {
    const w = parseFloat(weightStr);
    const h = parseFloat(heightStr) / 100;
    if (!w || !h || h === 0)
      return { bmi: "N/A", category: "Unknown", color: "#64748b" };
    const bmi = (w / (h * h)).toFixed(1);
    let category = "Normal",
      color = "#22c55e";
    if (bmi < 18.5) {
      category = "Underweight";
      color = "#f59e0b";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
      color = "#f59e0b";
    } else if (bmi >= 30) {
      category = "Obese";
      color = "#ef4444";
    }
    return { bmi, category, color };
  };

  // 🟢 FIXED: Case-Insensitive evaluation prevents text strings from matching blank layout metrics rows
  const getPatientAppointments = useMemo(() => {
    if (!selectedPatient) return [];
    return appointments
      .filter(
        (a) =>
          (a.patientName || a.patient || "").toLowerCase().trim() ===
          (selectedPatient.name || "").toLowerCase().trim(),
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedPatient, appointments]); // 🟢 FIXED: Now tracks selectedPatient cleanly

  // 🟢 NEW SLICE MATRIX: Implements a clean 5-row constraint preview toggle route
  const activeApptsRenderList = useMemo(() => {
    if (showAllAppts) return getPatientAppointments;
    return getPatientAppointments.slice(0, 5);
  }, [getPatientAppointments, showAllAppts]);

  const hasMoreThanFiveAppts = getPatientAppointments.length > 5;

  /* --- 4. FILTERING & SEARCH LOGIC --- */
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const disease = (p.disease || "").toLowerCase();
      const contact = p.contact || "";

      const matchesGlobal =
        name.includes(globalSearch.toLowerCase()) ||
        disease.includes(globalSearch.toLowerCase());
      const matchesLocal =
        name.includes(localSearch.toLowerCase()) ||
        contact.includes(localSearch);
      const matchesGender = filterGender ? p.gender === filterGender : true;

      let matchesAge = true;
      if (filterAgeRange === "0-18") matchesAge = p.age <= 18;
      else if (filterAgeRange === "19-40")
        matchesAge = p.age >= 19 && p.age <= 40;
      else if (filterAgeRange === "41-60")
        matchesAge = p.age >= 41 && p.age <= 60;
      else if (filterAgeRange === "60+") matchesAge = p.age > 60;

      return matchesGlobal && matchesLocal && matchesGender && matchesAge;
    });
  }, [globalSearch, localSearch, filterGender, filterAgeRange, patients]);

  // Pagination Math
  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handlePageChange = (num) => {
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="admin_patnt_m_loading_screen">
        <Loader2 className="admin_patnt_m_spinner" size={48} />
        <p>Synchronizing Clinical Registry...</p>
      </div>
    );
  }

  return (
    <div className="admin_patnt_m_page_fade_in">
      {!selectedPatient ? (
        <div className="admin_patnt_m_main_list_view">
          <div className="admin_patnt_m_section_header">
            <div className="admin_patnt_m_branding">
              <h1 className="admin_patnt_m_title_elite">
                Patient{" "}
                <span className="admin_patnt_m_highlight">Directory</span>
              </h1>
              <p className="admin_patnt_m_subtitle">
                {filteredPatients.length} active records
              </p>
            </div>
            <div className="admin_patnt_m_action_group">
              <button
                className="admin_patnt_m_btn_outline"
                onClick={() => window.print()}
              >
                <Download size={16} /> Export CSV
              </button>
              <button
                className="admin_patnt_m_btn_primary"
                onClick={() => {
                  setEditMode(false);
                  setShowForm(true);
                }}
              >
                <Plus size={18} /> Add Patient
              </button>
            </div>
          </div>

          <div className="admin_patnt_m_filter_bar">
            <div className="admin_patnt_m_search_box admin_patnt_m_smart_search">
              <Search size={18} color="#007acc" />
              <input
                placeholder="Name, Phone or Disease..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="admin_patnt_m_dropdown_group">
              <select
                className="admin_patnt_m_select_filter"
                value={filterGender}
                onChange={(e) => {
                  setFilterGender(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select
                className="admin_patnt_m_select_filter"
                value={filterAgeRange}
                onChange={(e) => {
                  setFilterAgeRange(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Ages</option>
                <option value="0-18">Under 18</option>
                <option value="19-40">19 - 40</option>
                <option value="41-60">41 - 60</option>
                <option value="60+">60+</option>
              </select>
            </div>
          </div>

          <div className="admin_patnt_m_table_container">
            <table className="admin_patnt_m_table">
              <thead>
                <tr>
                  <th>Patient Info</th>
                  <th>Age Class</th>
                  <th>Gender</th>
                  <th>Condition</th>
                  <th className="admin_patnt_m_text_right">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="admin_patnt_m_cell_user">
                        <img
                          src={
                            p.photo
                              ? `http://localhost:5000/uploads/${p.photo}`
                              : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">${(p.name || "P").charAt(0).toUpperCase()}</text></svg>`
                          }
                          alt=""
                          onError={(e) => {
                            e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">P</text></svg>`;
                          }}
                        />
                        <div>
                          <b>{p.name}</b>
                          <span>#PT-{p._id.slice(-5).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {p.age} Yrs{" "}
                      <small className="admin_patnt_m_age_pill">
                        {getAgeClass(p.age)}
                      </small>
                    </td>
                    <td>{p.gender}</td>
                    <td>
                      <span className="admin_patnt_m_disease_tag">
                        {p.disease}
                      </span>
                    </td>
                    <td className="admin_patnt_m_text_right">
                      <button
                        className="admin_patnt_m_btn_manage"
                        onClick={() => {
                          setSelectedPatient(p);
                          setShowAllAppts(false);
                        }}
                      >
                        View Case
                      </button>
                    </td>
                  </tr>
                ))}
                {currentPatients.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="admin_patnt_m_empty_row"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#94a3b8",
                      }}
                    >
                      <AlertCircle style={{ margin: "0 auto 8px auto" }} />
                      No unique diagnostic chart arrays matched parameter
                      lookups.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin_patnt_m_pagination_bar">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Workspace Detail View */
        <div className="admin_patnt_m_detail_workspace">
          <div className="admin_patnt_m_workspace_header">
            <button
              className="admin_patnt_m_btn_close_workspace"
              onClick={() => setSelectedPatient(null)}
            >
              <ArrowLeft size={18} /> Back to Directory
            </button>
            <button
              className="admin_patnt_m_btn_primary"
              onClick={() => {
                setEditMode(true);
                setShowForm(true);
              }}
            >
              Edit Record
            </button>
          </div>

          <div className="admin_patnt_m_profile_hero_card">
            <div className="admin_patnt_m_hero_left">
              <img
                src={
                  selectedPatient.photo
                    ? `http://localhost:5000/uploads/${selectedPatient.photo}`
                    : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">${(selectedPatient.name || "P").charAt(0).toUpperCase()}</text></svg>`
                }
                alt=""
                className="admin_patnt_m_avatar_hero"
                onError={(e) => {
                  e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="55%" font-family="Arial" font-size="32" font-weight="bold" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">P</text></svg>`;
                }}
              />
              <div className="admin_patnt_m_hero_info">
                <h2>{selectedPatient.name}</h2>
                <div className="admin_patnt_m_hero_badges">
                  <span className="admin_patnt_m_badge_outline">
                    <User size={14} /> {selectedPatient.age}Y •{" "}
                    {selectedPatient.gender}
                  </span>
                  <span className="admin_patnt_m_badge_outline">
                    <ShieldCheck size={14} /> {selectedPatient.disease}
                  </span>
                </div>
                <div className="admin_patnt_m_hero_contact">
                  <span>
                    <Phone size={14} /> {selectedPatient.contact}
                  </span>
                  <span>
                    <MapPin size={14} /> Chennai, India
                  </span>
                </div>
              </div>
            </div>

            <div className="admin_patnt_m_hero_stats">
              <div className="admin_patnt_m_hero_stat_item">
                <Scale size={18} color="#007acc" />
                <div>
                  <p>{selectedPatient.weight || "N/A"}kg</p>
                  <small>Weight</small>
                </div>
              </div>
              <div className="admin_patnt_m_hero_stat_item">
                <Ruler size={18} color="#007acc" />
                <div>
                  <p>{selectedPatient.height || "N/A"}cm</p>
                  <small>Height</small>
                </div>
              </div>
              <div className="admin_patnt_m_hero_stat_item blue_bg">
                <Activity size={18} color="#007acc" />
                <div>
                  <p
                    style={{
                      color: calculateBMI(
                        selectedPatient.weight,
                        selectedPatient.height,
                      ).color,
                    }}
                  >
                    {
                      calculateBMI(
                        selectedPatient.weight,
                        selectedPatient.height,
                      ).bmi
                    }
                  </p>
                  <small>
                    BMI (
                    {
                      calculateBMI(
                        selectedPatient.weight,
                        selectedPatient.height,
                      ).category
                    }
                    )
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="admin_patnt_m_split_history_row">
            <div
              className="admin_patnt_m_history_column"
              style={{ width: "100%" }}
            >
              <h3>
                <Clock size={18} color="#facc15" /> Clinical History Logs
              </h3>
              <div
                className="admin_patnt_m_col_list"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {activeApptsRenderList.length > 0 ? (
                  <>
                    {activeApptsRenderList.map((appt, i) => (
                      <div
                        key={appt._id || i}
                        className={`admin_patnt_m_history_mini_card ${appt.status === "Completed" ? "green_border" : "yellow_border"}`}
                      >
                        <div className="mini_card_date">
                          <b>{appt.date}</b>
                          <span>{appt.time}</span>
                        </div>
                        <div className="mini_card_main">
                          <b>{appt.doctorName || appt.doctor}</b>
                          <p>
                            {appt.status} — {appt.department}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* 🟢 NEW WORKSPACE TOGGLE: Toggles history slice bounds on demand */}
                    {hasMoreThanFiveAppts && (
                      <button
                        className="admin_patnt_m_view_more_trigger"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          background: "#f8fafc",
                          padding: "10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          border: "1px solid #e2e8f0",
                          color: "#475569",
                          fontWeight: "600",
                        }}
                        onClick={() => setShowAllAppts(!showAllAppts)}
                      >
                        <Scroll size={14} />
                        {showAllAppts
                          ? "Collapse History Tracking Log"
                          : `View Full Medical History Encounters (${getPatientAppointments.length})`}
                      </button>
                    )}
                  </>
                ) : (
                  <div
                    className="admin_patnt_m_empty_col"
                    style={{
                      padding: "20px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      color: "#94a3b8",
                      textAlign: "center",
                    }}
                  >
                    No prior medical visits.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Register/Edit */}
      {showForm && (
        <div className="admin_patnt_m_modal_overlay">
          <div className="admin_patnt_m_centered_form_card">
            <div className="admin_patnt_m_modal_header">
              <h2>
                {editMode ? "Modify Case File" : "New Patient Registration"}
              </h2>
              <button
                className="admin_patnt_m_clear_btn"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowForm(false)}
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={handleFormSubmit}
              className="admin_patnt_m_form_grid"
            >
              <div className="admin_patnt_m_input_box">
                <label>Full Name</label>
                <input
                  name="name"
                  defaultValue={editMode ? selectedPatient.name : ""}
                  required
                />
              </div>
              <div className="admin_patnt_m_input_box">
                <label>Age</label>
                <input
                  name="age"
                  type="number"
                  defaultValue={editMode ? selectedPatient.age : ""}
                  required
                />
              </div>
              <div className="admin_patnt_m_input_box">
                <label>Gender</label>
                <select
                  name="gender"
                  defaultValue={editMode ? selectedPatient.gender : "Male"}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="admin_patnt_m_input_box">
                <label>Contact Info</label>
                <input
                  name="contact"
                  defaultValue={editMode ? selectedPatient.contact : ""}
                  required
                />
              </div>
              <div className="admin_patnt_m_input_box">
                <label>Weight (kg)</label>
                <input
                  name="weight"
                  defaultValue={editMode ? selectedPatient.weight : ""}
                />
              </div>
              <div className="admin_patnt_m_input_box">
                <label>Height (cm)</label>
                <input
                  name="height"
                  defaultValue={editMode ? selectedPatient.height : ""}
                />
              </div>
              <div
                className="admin_patnt_m_input_box"
                style={{ gridColumn: "span 2" }}
              >
                <label>Primary Diagnosis</label>
                <input
                  name="disease"
                  defaultValue={editMode ? selectedPatient.disease : ""}
                />
              </div>
              <button
                type="submit"
                className="admin_patnt_m_btn_submit_pro"
                style={{
                  gridColumn: "span 2",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {editMode
                  ? "Commit Clinical Updates"
                  : "Finalize and Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
