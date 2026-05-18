import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  User,
  ArrowLeft,
  Phone,
  Mail,
  Scale,
  Ruler,
  Zap,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  Pill,
  FlaskConical,
  ShoppingCart,
  Send,
  Calendar,
  Clock,
  Activity,
} from "lucide-react";
import "./Doctor_Patient_Management.css";

export default function Patients() {
  const navigate = useNavigate();
  const rowsPerPage = 5;

  /* --- 1. CORE STATE MANAGEMENT --- */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Requisition Terminal States
  const [inventory, setInventory] = useState({ medicines: [], tests: [] });
  const [orderQuery, setOrderQuery] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [prescriptionCount, setPrescriptionCount] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);

  // Dialogue Workspace Detail Overlays
  const [activeInspectionAppt, setActiveInspectionAppt] = useState(null);

  const doctorUser = JSON.parse(localStorage.getItem("userData")) || {};
  const currentDocName = doctorUser.name || "Dr. Guest";

  /* --- 2. REGISTRY PIPELINE (DATA FETCHING) --- */
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [patRes, apptRes, medRes, testRes] = await Promise.all([
        axios
          .get("http://localhost:5000/api/patients/all", { headers })
          .catch(() => ({ data: [] })),
        axios
          .get("http://localhost:5000/api/appointments/all", { headers })
          .catch(() => ({ data: [] })),
        axios
          .get("http://localhost:5000/api/medicines/all", { headers })
          .catch(() => ({ data: [] })),
        axios
          .get("http://localhost:5000/api/tests/all", { headers })
          .catch(() => ({ data: [] })),
      ]);

      setPatients(patRes.data);
      setAppointments(apptRes.data);
      setInventory({ medicines: medRes.data, tests: testRes.data });
    } catch (err) {
      console.error("Clinical Registry critical failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* --- 3. COMPUTED MEMO INFRASTRUCTURE --- */
  const filteredPatients = useMemo(() => {
    const seenPatientNames = [
      ...new Set(
        appointments
          .filter((appt) => appt.doctorName === currentDocName)
          .map((appt) => appt.patientName),
      ),
    ];

    return patients.filter((p) => {
      const isEstablished = seenPatientNames.includes(p.name);
      if (!isEstablished) return false;

      return p.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [patients, appointments, currentDocName, searchTerm]);

  const currentPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredPatients.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPatients, currentPage]);

  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

  const sortedPatientHistory = useMemo(() => {
    if (!selectedPatient) return [];
    // Gathers and sorts all historical interactions chronologically for the active patient
    return appointments
      .filter((a) => a.patientName === selectedPatient.name)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedPatient, appointments]);

  const suggestedResources = useMemo(() => {
    if (orderQuery.length < 2) return [];
    const pool = [
      ...inventory.medicines.map((m) => ({ ...m, type: "Medicine" })),
      ...inventory.tests.map((t) => ({ ...t, type: "Test" })),
    ];
    return pool
      .filter((r) => r.name.toLowerCase().includes(orderQuery.toLowerCase()))
      .slice(0, 5);
  }, [orderQuery, inventory]);

  /* --- 4. ACTION HANDLERS --- */
  const commitPrescriptionToVault = async () => {
    if (!selectedResource || !selectedPatient) return;
    setIsOrdering(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        patientId: selectedPatient._id,
        type:
          selectedResource.type === "Test" ? "Lab Reports" : "Prescriptions",
        name: `Prescription: ${selectedResource.name}`,
        lename: `ORDER_PENDING_${Date.now()}.pdf`,
        resourceId: selectedResource._id,
        onModel: selectedResource.type === "Test" ? "Tests" : "Medicines",
        prescribedCount: parseInt(prescriptionCount, 10),
        unitPrice: selectedResource.price,
        size: 1024,
        mimeType: "application/pdf",
      };

      await axios.post(
        "http://localhost:5000/api/patient/vault/upload-structured",
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Clinical requisition committed to vault.");
      setSelectedResource(null);
      setOrderQuery("");
      setPrescriptionCount(1);
    } catch (err) {
      alert("Vault sync failed. Ensure structured data endpoints exist.");
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading)
    return (
      <div className="doc_patn_loading">
        <Loader2 className="spin" size={14} /> Opening Clinical Vault...
      </div>
    );

  return (
    <div className="doc_patn_m_root doc_patn_m_page_fade_in">
      {!isDetailView ? (
        <div className="doc_patn_m_list_view">
          <header className="doc_patn_m_section_header">
            <div className="doc_patn_m_branding">
              <h1 className="doc_patn_m_title_elite">
                Clinical <span className="doc_patn_m_highlight">Registry</span>
              </h1>
              <p>
                {filteredPatients.length} active case proles assigned to your
                desk
              </p>
            </div>
          </header>

          <div className="doc_patn_m_filter_bar">
            <div className="doc_patn_m_search_box">
              <Search size={18} />
              <input
                placeholder="Search Patient Name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="doc_patn_m_table_container">
            <table className="doc_patn_m_table">
              <thead>
                <tr>
                  <th>Patient Identity</th>
                  <th>Primary Classication</th>
                  <th className="doc_patn_m_text_right">Management</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="doc_patn_m_cell_user">
                        <div className="doc_patn_m_avatar_placeholder">
                          <User size={14} />
                        </div>
                        <div>
                          <b>{p.name}</b>
                          <span>REF ID: {p._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="doc_patn_m_disease_tag">
                        {p.disease || "General Checkup"}
                      </span>
                    </td>
                    <td className="doc_patn_m_text_right">
                      <button
                        className="doc_patn_m_btn_manage"
                        onClick={() => {
                          setSelectedPatient(p);
                          setIsDetailView(true);
                        }}
                      >
                        Open EHR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="doc_patn_m_pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <ChevronLeft />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="doc_patn_m_patient_workspace doc_patn_m_page_fade_in">
          <div className="doc_patn_m_detail_nav">
            <button
              className="doc_patn_m_back_btn"
              onClick={() => setIsDetailView(false)}
            >
              <ArrowLeft size={18} /> Back to Registry
            </button>
          </div>

          <div className="doc_patn_m_bento_workspace_grid">
            {/* COMPREHENSIVE MEDICAL PATIENT PROLE DOSSIER */}
            <div className="doc_patn_m_card_rened doc_patn_m_id_card">
              <div className="ehr_prole_flex_header">
                <img
                  src={
                    selectedPatient?.photo
                      ? `http://localhost:5000/uploads/${selectedPatient.photo}`
                      : "https://via.placeholder.com/150"
                  }
                  className="ehr_dossier_avatar_asset"
                  alt="Patient Identity Snapshot"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
                <div className="ehr_header_meta_block">
                  <h2>{selectedPatient.name}</h2>
                  <span className="doc_patn_m_id_pill">
                    {selectedPatient.gender} • {selectedPatient.age || "24"}{" "}
                    Years
                  </span>
                </div>
              </div>

              <div className="dossier_vitals_strip_metrics">
                <div className="strip_metric_box">
                  <Ruler size={14} />
                  <span>
                    Height:{" "}
                    <strong>{selectedPatient.height || "172"} cm</strong>
                  </span>
                </div>
                <div className="strip_metric_box">
                  <Scale size={14} />
                  <span>
                    Weight: <strong>{selectedPatient.weight || "68"} kg</strong>
                  </span>
                </div>
                <div className="strip_metric_box">
                  <Activity size={14} />
                  <span>
                    Blood: <strong>{selectedPatient.bloodGroup || "B+"}</strong>
                  </span>
                </div>
              </div>

              <div className="doc_patn_m_contact_vertical">
                <div className="doc_patn_m_contact_line">
                  <Phone size={14} />{" "}
                  <span>{selectedPatient.contact || "N/A"}</span>
                </div>
                <div className="doc_patn_m_contact_line">
                  <Mail size={14} />{" "}
                  <span>{selectedPatient.email || "N/A"}</span>
                </div>
                {selectedPatient.emergencyContact && (
                  <div className="doc_patn_m_contact_line backup_emergency_line">
                    <span className="emergency_alert_tag">ICE Line:</span>
                    <strong>{selectedPatient.emergencyContact}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* AUTOMATED REQUISITION TERMINAL */}
            <div className="doc_patn_m_card_rened doc_patn_m_order_terminal">
              <div className="doc_patn_m_order_head">
                <ShoppingCart size={20} color="#0d9488" />
                <h3>Clinical Requisition</h3>
              </div>

              <div className="doc_patn_m_order_input_zone">
                <div className="doc_patn_m_smart_search">
                  <Search size={14} />
                  <input
                    placeholder="Search Pharmacy / Lab Database..."
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                  />
                </div>

                {suggestedResources.length > 0 && (
                  <div className="doc_patn_m_suggestions_dropdown">
                    {suggestedResources.map((res) => (
                      <div
                        key={res._id}
                        className="suggestion_item"
                        onClick={() => {
                          setSelectedResource(res);
                          setOrderQuery(res.name);
                        }}
                      >
                        {res.type === "Medicine" ? (
                          <Pill size={12} />
                        ) : (
                          <FlaskConical size={12} />
                        )}
                        <span>{res.name}</span>
                        <small>₹{res.price}</small>
                      </div>
                    ))}
                  </div>
                )}

                {selectedResource && (
                  <div className="doc_patn_m_order_cong doc_patn_m_page_fade_in">
                    <div className="cong_row">
                      <label>Prescribe Dispense Count:</label>
                      <input
                        type="number"
                        min="1"
                        value={prescriptionCount}
                        onChange={(e) => setPrescriptionCount(e.target.value)}
                      />
                    </div>
                    <button
                      className="doc_patn_m_btn_commit"
                      onClick={commitPrescriptionToVault}
                      disabled={isOrdering}
                    >
                      {isOrdering ? (
                        <Loader2 className="spin" size={14} />
                      ) : (
                        <Send size={14} />
                      )}
                      Commit to Vault
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SCROLL-LOCKED HISTORICAL LOG INFRASTRUCTURE */}
            <div className="doc_patn_m_card_rened doc_patn_m_history_card">
              <h4 className="doc_patn_m_history_title">
                <Zap size={16} /> Complete Consultation Case Logs
              </h4>

              {/* Box container enforces internal scrolling above 5 records natively */}
              <div className="doc_patn_m_history_list_stack vertical_scroll_lock_container">
                {sortedPatientHistory.length > 0 ? (
                  sortedPatientHistory.map((appt) => (
                    <div
                      key={appt._id}
                      className={`doc_patn_m_history_card_item clickable_case_row ${appt.doctorName === currentDocName ? "own_encounter_node" : "external_encounter_node"}`}
                      onClick={() => setActiveInspectionAppt(appt)}
                    >
                      <div className="case_row_left_stack">
                        <div className="case_badge_date_info">
                          <strong>{appt.date}</strong>
                          <span className="case_consultant_label">
                            Dr. {appt.doctorName}
                          </span>
                        </div>
                        <p className="case_notes_truncate_preview">
                          {appt.notes ||
                            "No clinical diagnostic summary logged."}
                        </p>
                      </div>
                      <div className="case_row_right_flex">
                        <span
                          className={`case_status_pill status_${appt.status.toLowerCase()}`}
                        >
                          {appt.status}
                        </span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty_text">
                    No prior recorded cases linked to this le.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY ACTION DIALOGUE: APPOINTMENT SPECICATION DRAWER */}
      {activeInspectionAppt && (
        <div className="clinical_inspection_modal_overlay">
          <div className="inspection_modal_card_blueprint doc_patn_m_page_fade_in">
            <div className="inspection_modal_header">
              <div>
                <h3>Case Log Details</h3>
                <span className="modal_ref_id">
                  Reference Ticket:{" "}
                  {activeInspectionAppt.appointmentID ||
                    activeInspectionAppt._id}
                </span>
              </div>
              <button
                className="close_modal_action"
                onClick={() => setActiveInspectionAppt(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="inspection_modal_body_content">
              <div className="modal_meta_grid_layout">
                <div className="modal_meta_cell">
                  <Calendar size={14} />{" "}
                  <span>
                    Date: <strong>{activeInspectionAppt.date}</strong>
                  </span>
                </div>
                <div className="modal_meta_cell">
                  <Clock size={14} />{" "}
                  <span>
                    Time Slot: <strong>{activeInspectionAppt.time}</strong>
                  </span>
                </div>
                <div className="modal_meta_cell">
                  <User size={14} />{" "}
                  <span>
                    Consultant:{" "}
                    <strong>Dr. {activeInspectionAppt.doctorName}</strong>
                  </span>
                </div>
                <div className="modal_meta_cell">
                  <Activity size={14} />{" "}
                  <span>
                    Department:{" "}
                    <strong>
                      {activeInspectionAppt.department || "General"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="modal_clinical_ndings_box">
                <h4>Clinical ndings & Diagnostics Notes:</h4>
                <p>
                  "
                  {activeInspectionAppt.notes ||
                    "No general clinical ndings documented for this case channel."}
                  "
                </p>
              </div>

              <div className="modal_rx_dispatched_block">
                <h4>Prescribed Items Matrix:</h4>
                {activeInspectionAppt.prescribedItems &&
                activeInspectionAppt.prescribedItems.length > 0 ? (
                  <div className="modal_rx_table_wrapper">
                    {activeInspectionAppt.prescribedItems.map((item, idx) => (
                      <div key={idx} className="modal_rx_item_row">
                        <div className="rx_item_main_identity">
                          <strong>{item.name}</strong>
                          <span className="rx_item_type_tag">{item.type}</span>
                        </div>
                        <div className="rx_item_clinical_dosage_meta">
                          <span>
                            Quantity: <strong>{item.quantity} units</strong>
                          </span>
                          {item.type === "Medicine" && (
                            <>
                              <span className="divider_dot">•</span>
                              <span>
                                Intake: <strong>{item.intake}</strong>
                              </span>
                              <span className="divider_dot">•</span>
                              <span>
                                Instruction: <strong>{item.instruction}</strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no_rx_logged_warning">
                    No pharmacotherapy orders or diagnostics items linked to
                    this encounter.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
