import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import axios from "axios";
import {
  Search,
  MapPin,
  CalendarCheck,
  Award,
  Clock,
  ChevronLeft,
  Loader2,
  History,
  ExternalLink,
} from "lucide-react";
import "./Doctor_Details.css";

// Component Import
import AppointmentForm from "../Appointment_Form/Appointment_Form";

export default function Doctor_Details() {
  // Filter States
  const navigate = useNavigate(); // Initialize the hook
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedLoc, setSelectedLoc] = useState("All");

  // Backend Data States
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [targetDoctor, setTargetDoctor] = useState(null);

  // --- Consultation History States ---
  const [pastConsultations, setPastConsultations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("userData"));

  // 🟢 FIXED: Swapped static hardcoded option filters array to derive structural metrics dynamically from cluster records rows on demand
  const departments = useMemo(() => {
    const uniqueDepts = new Set(
      doctors.map((d) => d.department).filter(Boolean),
    );
    return ["All", ...Array.from(uniqueDepts)];
  }, [doctors]);

  const locations = useMemo(() => {
    const uniqueBranches = new Set(
      doctors.map((d) => d.branch).filter(Boolean),
    );
    return ["All", ...Array.from(uniqueBranches)];
  }, [doctors]);

  const handleNavigateToBooking = (appt) => {
    // Navigate to the Bookings page and pass the appointment ID via state
    navigate("/patient/patient_bookings", {
      state: { autoSelectId: appt._id },
    });
  };

  /* --- 1. Logic: Fetch All Available Doctors --- */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/doctors/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data);
      } catch (err) {
        console.error("Specialist sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  /* --- 2. Logic: Fetch Consultation History for Selected Doctor --- */
  useEffect(() => {
    const fetchDoctorSpecificHistory = async () => {
      if (!viewingDoctor || !user?._id) return;

      setHistoryLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Fetch all appointments for the patient
        const res = await axios.get(
          `http://localhost:5000/api/appointments/list/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        // Filter for: This Doctor AND Status is Completed
        const filteredHistory = res.data.filter(
          (appt) =>
            appt.doctorName === viewingDoctor.name &&
            appt.status === "Completed",
        );
        setPastConsultations(filteredHistory);
      } catch (err) {
        console.error("History sync failure:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchDoctorSpecificHistory();
  }, [viewingDoctor, user?._id]);

  /* --- 3. Filter Engine --- */
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch = doc.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDept =
        selectedDept === "All" || doc.department === selectedDept;
      const matchesLoc = selectedLoc === "All" || doc.branch === selectedLoc;
      return matchesSearch && matchesDept && matchesLoc;
    });
  }, [doctors, searchTerm, selectedDept, selectedLoc]);

  const handleOpenBooking = (doc) => {
    setTargetDoctor(doc);
    setIsFormOpen(true);
  };

  if (loading)
    return (
      <div className="pat_spec_loading">
        <Loader2 className="spinner" />
        <span>Synchronizing Hospital Registry...</span>
      </div>
    );

  return (
    <div className="pat_spec_container_full">
      {/* Profile Sidebar (Dr. Details & History) */}
      <aside className={`pat_spec_side_panel ${viewingDoctor ? "open" : ""}`}>
        {viewingDoctor && (
          <div className="side_panel_content">
            <button
              className="panel_close_btn"
              onClick={() => setViewingDoctor(null)}
            >
              <ChevronLeft size={20} /> Specialists List
            </button>

            <div className="panel_header">
              <img
                src={`http://localhost:5000/uploads/${viewingDoctor.doctorId}.jpg`}
                alt={viewingDoctor.name}
                className="panel_img"
                onError={(e) => {
                  // Generates a professional blue avatar with the doctor's initials
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingDoctor.name)}&background=0D8ABC&color=fff&size=150`;
                }}
              />
              <div className="panel_title_group">
                <h2 className="pat_spec_h2">{viewingDoctor.name}</h2>
                <span className="panel_dept_tag">
                  {viewingDoctor.department} Specialist
                </span>
              </div>
            </div>

            <div className="panel_scroll_area">
              <div className="panel_stats_grid">
                <div className="p_stat">
                  <strong>EXP</strong>
                  <span>{viewingDoctor.experience}</span>
                </div>
                <div className="p_stat">
                  <strong>FEE</strong>
                  <span>₹{viewingDoctor.fee}</span>
                </div>
                <div className="p_stat">
                  <strong>LOC</strong>
                  <span>{viewingDoctor.branch}</span>
                </div>
              </div>

              <div className="panel_section">
                <h3 className="pat_spec_h3">Clinical Qualifications</h3>
                <p className="pat_spec_p">{viewingDoctor.degrees}</p>
              </div>

              {/* --- HISTORICAL DATA SECTION --- */}
              <div className="panel_section history_wrapper">
                <h3 className="pat_spec_h3 history_header_flex">
                  <History size={16} /> Previous Encounters
                </h3>

                {historyLoading ? (
                  <div className="history_status_msg">
                    <Loader2 size={14} className="spinner" /> Fetching
                    records...
                  </div>
                ) : pastConsultations.length > 0 ? (
                  <div className="mini_history_list">
                    {pastConsultations.map((appt) => (
                      <div
                        key={appt._id}
                        className="mini_history_card clickable"
                        onClick={() => handleNavigateToBooking(appt)}
                      >
                        <div className="history_date">
                          {new Date(appt.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          <ExternalLink
                            size={12}
                            style={{ marginLeft: "8px" }}
                          />
                        </div>
                        <div className="history_notes">
                          {appt.notes
                            ? appt.notes.substring(0, 45) + "..."
                            : "No clinical notes provided."}
                        </div>
                        <span className="history_ref">
                          REF: {appt.appointmentID}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="history_empty_msg">
                    You haven't consulted with {viewingDoctor.name} previously.
                  </div>
                )}
              </div>
            </div>

            <button
              className="panel_book_btn"
              onClick={() => handleOpenBooking(viewingDoctor)}
            >
              Secure Appointment Slot
            </button>
          </div>
        )}
      </aside>

      {/* Main Specialist Explorer */}
      <main className="pat_spec_main_full">
        <div className="pat_spec_search_strip">
          <div className="pat_spec_filter_row_top">
            <div className="pat_spec_input_wrap">
              <Search size={18} className="search_icon" />
              <input
                type="text"
                placeholder="Search by name, expertise or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="pat_spec_loc_select">
              <MapPin size={16} />
              <select
                value={selectedLoc}
                onChange={(e) => setSelectedLoc(e.target.value)}
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === "All" ? "All Branches" : `${loc} Branch`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pat_spec_dept_filter">
            {departments.map((dept) => (
              <button
                key={dept}
                className={selectedDept === dept ? "active" : ""}
                onClick={() => setSelectedDept(dept)}
              >
                {dept === "All" ? "All Departments" : dept}
              </button>
            ))}
          </div>
        </div>

        <div className="pat_spec_grid_full">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc) => {
              // 1. SAFETY CHECK: Skip rendering if 'doc' is null/undefined
              if (!doc) return null;

              return (
                <div
                  className={`pat_spec_card ${viewingDoctor?.doctorId === doc.doctorId ? "selected" : ""}`}
                  key={doc.doctorId || Math.random()} // Fallback key to prevent crash
                >
                  <div className="pat_spec_card_top">
                    <div className="pat_spec_avatar_frame">
                      <img
                        src={
                          doc.doctorId
                            ? `http://localhost:5000/uploads/${doc.doctorId}.jpg`
                            : ""
                        }
                        alt={doc.name || "Specialist"}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || "Doctor")}&background=random&size=80`;
                        }}
                      />
                      <span
                        className={`status_dot ${doc.availability === "Available" ? "online" : "offline"}`}
                      ></span>
                    </div>
                    <div className="pat_spec_core_info">
                      <h3 className="pat_spec_h3">
                        {doc.name || "Unknown Doctor"}
                      </h3>
                      <span className="pat_spec_dept_tag_small">
                        {doc.department || "General"}
                      </span>
                      <div className="pat_spec_branch_tag">
                        <MapPin size={10} /> {doc.branch || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="pat_spec_card_meta">
                    <div className="meta_item">
                      <Award size={14} />{" "}
                      <span>{doc.experience || "0"} Experience</span>
                    </div>
                    <div className="meta_item">
                      <Clock size={14} />{" "}
                      <span>{doc.availability || "Offline"}</span>
                    </div>
                  </div>

                  <div className="pat_spec_card_actions">
                    <button
                      className="btn_view_profile"
                      onClick={() => setViewingDoctor(doc)}
                    >
                      Medical Profile
                    </button>
                    <button
                      className="btn_book_now"
                      onClick={() => handleOpenBooking(doc)}
                    >
                      Quick Book <CalendarCheck size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="pat_spec_empty_text">
              No clinical specialists found matching your current filters.
            </div>
          )}
        </div>
      </main>

      <AppointmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialDoctor={targetDoctor}
      />
    </div>
  );
}
