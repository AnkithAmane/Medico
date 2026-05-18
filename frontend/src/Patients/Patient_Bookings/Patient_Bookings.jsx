import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Add this import
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Calendar,
  Clock,
  FileText,
  Plus,
  Search,
  ChevronRight,
  X,
  Loader2,
  ShoppingCart,
  Pill,
  FlaskConical,
  CheckCircle,
  Info,
  ShieldCheck,
  CreditCard,
  PackageCheck,
  AlertCircle,
  CalendarClock,
  Trash2,
  Download,
  MessageSquareShare,
} from "lucide-react";
import AppointmentForm from "../Appointment_Form/Appointment_Form";
import "./Patient_Bookings.css";

export default function Patient_Bookings() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const location = useLocation(); // Hook to access navigation state
  // Direct Order States (Confirmation Overlay)
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderType, setOrderType] = useState(""); // "Medicines" or "Tests"

  // --- STATE FOR CARE EXPERIENCE REVIEW PORTAL ---
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Clear input buffers cleanly when switching between different appointments
  useEffect(() => {
    setRating(0);
    setHover(0);
    setComments("");
  }, [selectedAppt]);

  // --- HANDLER: TRANSMIT EXPERIENTIAL DATA TO BACKEND ---
  const handleDispatchFeedback = async () => {
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const token = localStorage.getItem("token");

      // We store the input box text state value in a local variable to be 100% sure it's accurate
      const textPayload = comments;

      const response = await axios.post(
        "http://localhost:5000/api/appointments/feedback/submit",
        {
          appointmentId: selectedAppt._id,
          patientId: user._id,
          doctorName: selectedAppt.doctorName,
          rating: rating,
          comments: textPayload,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Backend response payload debug check:", response.data);
      alert("Success! Your feedback has been securely logged.");

      // Force BOTH state paths to capture the typed text content strings explicitly
      setSelectedAppt((prev) => ({
        ...prev,
        hasFeedback: true,
        feedbackRef: {
          rating: rating,
          comments: textPayload, // Directly forces the text string into the layout panel view state
        },
      }));

      // Clear tracking values buffer
      setRating(0);
      setComments("");

      // Refresh the list array grid tracking module parameters background framework
      fetchBookings();
    } catch (err) {
      console.error("Feedback Submission Error Log Trace:", err);
      alert("Failed to process feedback submission.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("userData"));
  useEffect(() => {
    // Logic: If we arrived here via a "View History" click in Doctor Details
    if (!loading && appointments.length > 0 && location.state?.autoSelectId) {
      const targetAppt = appointments.find(
        (a) => a._id === location.state.autoSelectId,
      );
      if (targetAppt) {
        setSelectedAppt(targetAppt);
        // Clear state so it doesn't keep auto-selecting if the user refreshes
        window.history.replaceState({}, document.title);
      }
    }
  }, [loading, appointments, location.state]);
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/appointments/list/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAppointments(res.data);
    } catch (err) {
      console.error("Clinical sync failure:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: GENERATE PDF & SYNC TO VAULT ---
  // --- LOGIC: GENERATE DYNAMIC E-RX PDF & ASYNC VAULT ARCCIVAL ---
  const handleDownloadPrescription = async (appt) => {
    try {
      // Initialize jsPDF document instance
      const doc = new jsPDF();

      // Clinical Aesthetics Brand Color Space (Dark Slate & Deep Hospital Blue)
      const primaryColor = [15, 23, 42];
      const secondaryColor = [37, 99, 235];

      // 1. Hospital Branding Header Canvas Block
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("MEDICO+ HEALTHCARE CENTRE", 20, 24);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Digital Outpatient Clinical Case Summary & E-Rx", 20, 32);

      // 2. Metadata Case File Blueprint Layout
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("PATIENT CLINICAL SUMMARY & PRESCRIPTION", 20, 52);

      // Decorative Partition Rule Line
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 55, 190, 55);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Left Column Metadata
      doc.text(
        `Patient Name:  ${user?.name || "Verified Account Account"}`,
        20,
        65,
      );
      doc.text(`Consultant:     Dr. ${appt.doctorName}`, 20, 72);
      doc.text(
        `Department:     ${appt.department || "General Medicine"} Unit`,
        20,
        79,
      );

      // Right Column Metadata
      doc.text(`Case Ref ID:    ${appt.appointmentID || "N/A"}`, 120, 65);
      doc.text(
        `Session Date:   ${new Date(appt.date).toLocaleDateString("en-GB", { dateStyle: "long" })}`,
        120,
        72,
      );
      doc.text(`Session Time:   ${appt.time}`, 120, 79);

      // 3. Clinical Observation / Notes Field
      doc.setFont("helvetica", "bold");
      doc.text("Specialist Observations & Diagnosis:", 20, 93);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);

      // Split observation block string cleanly to handle dynamic page wrap bounds
      const splitNotes = doc.splitTextToSize(
        appt.notes || "Routine health maintenance tracking session.",
        170,
      );
      doc.text(splitNotes, 20, 100);

      // 4. Transform Structured Rx Treatment Array Matrix for AutoTable Engine
      const tableRows = (appt.prescribedItems || []).map((item) => {
        let executionDetails = "N/A";

        if (item.type === "Medicine") {
          const matrix = item.timing || {};
          // Translates explicit booleans to actionable 1-0-1 dosing standards
          const doseFormat = `${matrix.morning ? "1" : "0"}-${matrix.afternoon ? "1" : "0"}-${matrix.night ? "1" : "0"}`;
          const condition = item.intake ? ` [${item.intake}]` : "";
          const direction = item.instruction
            ? ` - Instruction: ${item.instruction}`
            : "";
          executionDetails = `${doseFormat}${condition}${direction}`;
        } else if (item.type === "Test") {
          executionDetails = `Diagnostic Laboratory Requisition (Instruction: ${item.instruction || "Standard Testing Protocol"})`;
        }

        return [
          item.name,
          item.type,
          `x${item.quantity || 1}`,
          executionDetails,
        ];
      });

      // Render Clinical Data Ledger via autoTable
      autoTable(doc, {
        startY: 115,
        head: [
          [
            "Item Description / Nomenclature",
            "Classification",
            "Qty",
            "Administration Schedule / Instructions",
          ],
        ],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor: primaryColor,
          fontStyle: "bold",
          fontSize: 9.5,
        },
        columnStyles: {
          0: { cellWidth: 50 }, // Item Name
          1: { cellWidth: 25 }, // Classification Type
          2: { cellWidth: 15 }, // Quantity Vector
          3: { cellWidth: 80 }, // Instructions Matrix
        },
        styles: { fontSize: 9, cellPadding: 5, verticalAlign: "middle" },
      });

      // 5. Compute Signoff Footer Position below generated ledger dynamically
      const finalY = doc.lastAutoTable.finalY + 25;
      doc.line(130, finalY, 185, finalY);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text("Authorized Digital Signature", 140, finalY + 5);
      doc.text(
        "System Document ID generated via Medico+ Core Engine",
        20,
        finalY + 5,
      );

      // 6. INSTANT DEVICE DOWNLOAD PIPELINE (Bypasses network block entirely)
      const fileName = `Prescription_${appt.appointmentID || Date.now()}.pdf`;
      doc.save(fileName);

      // 7. BACKGROUND ASYNC CLOUD ARCHIVAL FOR PATIENT VAULT MODULE
      const pdfBlob = doc.output("blob");
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("document", pdfBlob, fileName);
      formData.append("patientId", user._id);
      formData.append("type", "Prescriptions");

      // Run background network synchronization completely detached from local UI thread loop
      axios
        .post("http://localhost:5000/api/patient/vault/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          console.log(
            "Prescription asset safely backed up to decentralized medical record vault storage.",
          );
        })
        .catch((vaultErr) => {
          console.error(
            "Vault automated synchronization error log statement:",
            vaultErr,
          );
        });

      // UI Completion Alert confirmation prompt
      alert(
        "Success! Prescription downloaded directly into your device storage directory.",
      );
    } catch (err) {
      console.error("Prescription Export Failure Execution Handler:", err);
      alert(
        "Clinical Document Export Error: Unable to build local file mapping structure.",
      );
    }
  };
  useEffect(() => {
    // Check if router state contains selection coordinates forwarded from the Dashboard
    if (location.state?.autoSelectId && appointments.length > 0) {
      const targetAppt = appointments.find(
        (a) => a._id === location.state.autoSelectId,
      );
      if (targetAppt) {
        // Set the active appointment detail visibility
        setSelectedAppt({
          ...targetAppt,
          // Force-open the feedback panel toggle seamlessly if explicitly requested
          isReviewPanelOpen: location.state?.openReviewPanel || false,
        });
      }
    }
  }, [location.state, appointments]);

  useEffect(() => {
    if (user?._id) fetchBookings();

    const handleRefresh = () => fetchBookings();
    window.addEventListener("appointment_booked", handleRefresh);
    return () =>
      window.removeEventListener("appointment_booked", handleRefresh);
  }, [user?._id]);

  // --- LOGIC: 24-HOUR RESCHEDULE VALIDATION ---
  const canReschedule = (apptDate, apptTime) => {
    try {
      // Logic to parse time (e.g., "10:30 AM") into 24h format
      const [time, modifier] = apptTime.split(" ");
      let [hours, minutes] = time.split(":");
      if (modifier === "PM" && hours !== "12") hours = parseInt(hours, 10) + 12;
      if (modifier === "AM" && hours === "12") hours = "00";

      const appointmentDateTime = new Date(
        `${apptDate}T${hours}:${minutes}:00`,
      );
      const now = new Date();

      // Calculate difference in milliseconds
      const diffInMs = appointmentDateTime - now;
      const diffInHours = diffInMs / (1000 * 60 * 60);

      return diffInHours >= 24;
    } catch (e) {
      return false; // Fail-safe if date/time format is invalid
    }
  };

  // --- LOGIC: CANCELLATION ---
  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;
    try {
      const token = localStorage.getItem("token");
      // Ensure this URL is exactly /api/appointments/cancel/
      await axios.put(
        `http://localhost:5000/api/appointments/cancel/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Appointment has been cancelled.");
      setSelectedAppt(null); // Close the detail panel
      fetchBookings(); // Refresh the list
    } catch (err) {
      console.error("Cancel Error:", err);
      alert("System could not process cancellation.");
    }
  };

  // Grouping Logic: Categorize items for bulk ordering
  const prescriptionGroups = useMemo(() => {
    if (!selectedAppt?.prescribedItems) return { meds: [], tests: [] };
    return {
      meds: selectedAppt.prescribedItems.filter((i) => i.type === "Medicine"),
      tests: selectedAppt.prescribedItems.filter((i) => i.type === "Test"),
    };
  }, [selectedAppt]);

  // Logic: Initiate Direct Order (Bypass Cart)
  const openConfirmation = (items, type) => {
    setCheckoutItems(items);
    setOrderType(type);
    setShowCheckout(true);
  };

  // Logic: Finalize Direct Purchase
  const handleDirectPurchase = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`Success! Your ${orderType} order has been placed directly.`);
      setShowCheckout(false);
      setCheckoutItems([]);
    } catch (err) {
      alert("Transaction failed. Please contact clinical support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return appointments.filter((app) => {
      const matchesSearch =
        app.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.appointmentID?.includes(searchTerm);
      const matchesStatus = filter === "All" || app.status === filter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, filter]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate().toString().padStart(2, "0"),
      month: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
    };
  };

  if (loading)
    return (
      <div className="pat_book_loading">
        <Loader2 className="spinner" />
        <span>Accessing Clinical Records...</span>
      </div>
    );

  return (
    <div className="pat_book_container_full">
      <main className="pat_book_main_hub">
        <div className="pat_book_header_strip">
          <div className="pat_book_title">
            <h1>
              My <span>Bookings</span>
            </h1>
            <button
              className="pat_book_new_inline"
              onClick={() => {
                setSelectedAppt(null);
                setIsFormOpen(true);
              }}
            >
              <Plus size={18} /> New Appointment
            </button>
          </div>

          <div className="pat_book_controls">
            <div className="pat_book_search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search doctor or ID..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="pat_book_filter_pills">
              {["All", "Upcoming", "Completed", "Cancelled"].map((f) => (
                <button
                  key={f}
                  className={filter === f ? "active" : ""}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pat_book_list">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((app) => (
              <div
                className={`pat_book_item_card ${selectedAppt?._id === app._id ? "active" : ""}`}
                key={app._id}
                onClick={() => setSelectedAppt(app)}
              >
                <div className="pat_book_date_box">
                  <span className="day">{formatDate(app.date).day}</span>
                  <span className="month">{formatDate(app.date).month}</span>
                </div>
                <div className="pat_book_info_main">
                  <div className="doc_meta">
                    <div className="doc_avatar">{app.doctorName.charAt(0)}</div>
                    <div className="doc_text">
                      <h3>{app.doctorName}</h3>
                      <span>
                        {app.department} Unit • {app.appointmentID}
                      </span>
                    </div>
                  </div>
                  <div className="status_meta">
                    <span
                      className={`status_badge status_${app.status.toLowerCase()}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <ChevronRight size={20} className="list_arrow" />
                </div>
              </div>
            ))
          ) : (
            <div className="no_bookings_state">
              <Calendar size={48} />
              <p>No medical records found.</p>
            </div>
          )}
        </div>
      </main>

      <aside className={`pat_book_detail_panel ${selectedAppt ? "open" : ""}`}>
        {selectedAppt ? (
          <div className="detail_panel_content">
            <button
              className="panel_close_x"
              onClick={() => setSelectedAppt(null)}
            >
              <X />
            </button>

            <div className="detail_header">
              <div className="detail_avatar_large">
                {selectedAppt.doctorName.charAt(0)}
              </div>
              <h2>{selectedAppt.doctorName}</h2>
              <p>
                {selectedAppt.department} • {selectedAppt.type}
              </p>
            </div>

            <div className="detail_scroll_body">
              {selectedAppt.status === "Upcoming" && (
                <div className="detail_section action_box_upcoming">
                  <button
                    className="reschedule_btn"
                    disabled={
                      !canReschedule(selectedAppt.date, selectedAppt.time)
                    }
                    onClick={() => setIsFormOpen(true)} // Turns on form toggle
                  >
                    <CalendarClock size={16} />
                    {canReschedule(selectedAppt.date, selectedAppt.time)
                      ? "Reschedule Appointment"
                      : "Reschedule (Locked < 24h)"}
                  </button>
                  <button
                    className="cancel_btn_booking"
                    onClick={() => handleCancelAppointment(selectedAppt._id)}
                  >
                    <Trash2 size={16} /> Cancel Appointment
                  </button>
                </div>
              )}
              {selectedAppt.status === "Completed" && (
                <div className="detail_section feedback_card_console">
                  <label className="feedback_console_label">
                    <CheckCircle size={13} /> Care Experience Review
                  </label>

                  {/* DISPLAY MODULE: Triggers if hasFeedback parameter is set to true */}
                  {selectedAppt.hasFeedback ? (
                    <div className="feedback_submitted_display_view animate_slide_down">
                      <div className="feedback_success_banner_flat">
                        <ShieldCheck size={16} color="#166534" />
                        <span>
                          Your review is safely logged in our quality index.
                        </span>
                      </div>

                      <div className="feedback_review_summary_box">
                        {/* Render Saved Star Ratings */}
                        <div className="summary_stars_row">
                          {[1, 2, 3, 4, 5].map((starIdx) => (
                            <span
                              key={starIdx}
                              className={`static_star_node ${starIdx <= (selectedAppt.feedbackRef?.rating || rating) ? "glow" : ""}`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="summary_rating_number">
                            ({selectedAppt.feedbackRef?.rating || rating}/5)
                          </span>
                        </div>

                        {/* DISPLAY THE REVIEWS TEXT CONTENT HERE */}
                        {(selectedAppt.feedbackRef?.comments || comments) && (
                          <div className="summary_comment_quote">
                            <p className="summary_feedback_text_paragraph">
                              "{selectedAppt.feedbackRef?.comments || comments}"
                            </p>
                          </div>
                        )}

                        <span className="review_timestamp_badge">
                          Verified Document Identity Trace
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* INPUT CONTAINER PORTAL MODULE (SHOWN IF PENDING) */
                    <div className="feedback_collapsible_wrapper">
                      {!selectedAppt.isReviewPanelOpen && (
                        <button
                          className="feedback_initiate_btn"
                          onClick={() =>
                            setSelectedAppt((prev) => ({
                              ...prev,
                              isReviewPanelOpen: true,
                            }))
                          }
                        >
                          <MessageSquareShare size={15} /> Rate This
                          Consultation Session
                        </button>
                      )}

                      {selectedAppt.isReviewPanelOpen && (
                        <div className="feedback_active_workspace animate_slide_down">
                          <div className="workspace_header_flex">
                            <p className="feedback_prompt_heading">
                              How would you rate your clinical consultation with{" "}
                              <strong>Dr. {selectedAppt.doctorName}</strong>?
                            </p>
                            <button
                              className="feedback_close_mini"
                              onClick={() =>
                                setSelectedAppt((prev) => ({
                                  ...prev,
                                  isReviewPanelOpen: false,
                                }))
                              }
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div className="star_rating_flex_row">
                            {[1, 2, 3, 4, 5].map((starIdx) => (
                              <button
                                type="button"
                                key={starIdx}
                                className={`star_interactive_node ${starIdx <= (hover || rating) ? "glow" : ""}`}
                                onClick={() => setRating(starIdx)}
                                onMouseEnter={() => setHover(starIdx)}
                                onMouseLeave={() => setHover(0)}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <textarea
                            className="feedback_clinical_textarea"
                            placeholder="Provide details regarding diagnostic clarity, communication empathy, or checkup waiting times..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            maxLength={500}
                          />

                          <div className="feedback_action_row_footer">
                            <button
                              className="feedback_cancel_flat_btn"
                              onClick={() =>
                                setSelectedAppt((prev) => ({
                                  ...prev,
                                  isReviewPanelOpen: false,
                                }))
                              }
                            >
                              Cancel
                            </button>
                            <button
                              className="feedback_dispatch_action_btn"
                              onClick={handleDispatchFeedback}
                              disabled={submittingFeedback || rating === 0}
                            >
                              {submittingFeedback ? (
                                <Loader2 className="spinner" size={14} />
                              ) : (
                                "Submit Review"
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="detail_section">
                <label>
                  <FileText size={14} /> Observations
                </label>
                <div className="clinical_notes_box">
                  {selectedAppt.notes || "Awaiting observation summary."}
                </div>
              </div>

              {/* Add this section right above your Timeline section */}
              {selectedAppt.status === "Completed" && (
                <div className="detail_section download_action_box">
                  <button
                    className="download_rx_btn"
                    onClick={() => handleDownloadPrescription(selectedAppt)}
                  >
                    <Download size={16} /> Download Digital Prescription (E-Rx)
                  </button>
                </div>
              )}
              {/* INTERACTIVE CLINICAL REVIEWS ENGINE (COMPLETED SESSIONS ONLY) */}
              {/* INTERACTIVE CLINICAL REVIEWS ENGINE (COMPLETED SESSIONS ONLY) */}
              {selectedAppt.status === "Completed" && (
                <div className="detail_section feedback_card_console">
                  <label className="feedback_console_label">
                    <CheckCircle size={13} /> Care Experience Review
                  </label>

                  {/* DISPLAY MODULE: Shown when feedback has already been submitted or exists */}
                  {selectedAppt.hasFeedback ? (
                    <div className="feedback_submitted_display_view animate_slide_down">
                      <div className="feedback_success_banner_flat">
                        <ShieldCheck size={16} color="#166534" />
                        <span>
                          Your review is safely logged in our quality index.
                        </span>
                      </div>

                      <div className="feedback_review_summary_box">
                        <div className="summary_stars_row">
                          {[1, 2, 3, 4, 5].map((starIdx) => (
                            <span
                              key={starIdx}
                              className={`static_star_node ${starIdx <= (selectedAppt.feedbackDetails?.rating || rating) ? "glow" : ""}`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="summary_rating_number">
                            ({selectedAppt.feedbackDetails?.rating || rating}/5)
                          </span>
                        </div>

                        {(selectedAppt.feedbackDetails?.comments ||
                          comments) && (
                          <div className="summary_comment_quote">
                            <p>
                              "
                              {selectedAppt.feedbackDetails?.comments ||
                                comments}
                              "
                            </p>
                          </div>
                        )}

                        <span className="review_timestamp_badge">
                          Submitted on {new Date().toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* INPUT MODULE: Shown when feedback is still pending */
                    <div className="feedback_collapsible_wrapper">
                      {!selectedAppt.isReviewPanelOpen && (
                        <button
                          className="feedback_initiate_btn"
                          onClick={() =>
                            setSelectedAppt((prev) => ({
                              ...prev,
                              isReviewPanelOpen: true,
                            }))
                          }
                        >
                          <MessageSquareShare size={15} /> Rate This
                          Consultation Session
                        </button>
                      )}

                      {selectedAppt.isReviewPanelOpen && (
                        <div className="feedback_active_workspace animate_slide_down">
                          <div className="workspace_header_flex">
                            <p className="feedback_prompt_heading">
                              How would you rate your clinical consultation with{" "}
                              <strong>Dr. {selectedAppt.doctorName}</strong>?
                            </p>
                            <button
                              className="feedback_close_mini"
                              onClick={() =>
                                setSelectedAppt((prev) => ({
                                  ...prev,
                                  isReviewPanelOpen: false,
                                }))
                              }
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div className="star_rating_flex_row">
                            {[1, 2, 3, 4, 5].map((starIdx) => (
                              <button
                                type="button"
                                key={starIdx}
                                className={`star_interactive_node ${starIdx <= (hover || rating) ? "glow" : ""}`}
                                onClick={() => setRating(starIdx)}
                                onMouseEnter={() => setHover(starIdx)}
                                onMouseLeave={() => setHover(0)}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <textarea
                            className="feedback_clinical_textarea"
                            placeholder="Provide details regarding diagnostic clarity, communication empathy, or checkup waiting times..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            maxLength={500}
                          />

                          <div className="feedback_action_row_footer">
                            <button
                              className="feedback_cancel_flat_btn"
                              onClick={() =>
                                setSelectedAppt((prev) => ({
                                  ...prev,
                                  isReviewPanelOpen: false,
                                }))
                              }
                            >
                              Cancel
                            </button>
                            <button
                              className="feedback_dispatch_action_btn"
                              onClick={handleDispatchFeedback}
                              disabled={submittingFeedback || rating === 0}
                            >
                              {submittingFeedback ? (
                                <Loader2 className="spinner" size={14} />
                              ) : (
                                "Submit Review"
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="detail_section">
                <label>
                  <Clock size={14} /> Timeline
                </label>
                <p>
                  {new Date(selectedAppt.date).toLocaleDateString("en-GB", {
                    dateStyle: "long",
                  })}{" "}
                  at {selectedAppt.time}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="detail_empty_state">
            <Calendar size={40} />
            <h3>Select a Session</h3>
          </div>
        )}
      </aside>

      {/* DIRECT ORDER CONFIRMATION OVERLAY */}
      {showCheckout && (
        <div className="checkout_overlay">
          <div className="checkout_modal">
            <div className="checkout_header">
              <div className="header_icon_circle">
                <ShoppingCart size={24} />
              </div>
              <div className="header_text">
                <h3>Confirm Direct Order</h3>
                <p>
                  Purchasing {orderType} from {selectedAppt.doctorName}
                </p>
              </div>
              <button
                className="close_checkout"
                onClick={() => setShowCheckout(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="checkout_summary_list">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="checkout_item_row">
                  <div className="item_name">{item.name}</div>
                  <div className="item_price">₹{item.price}</div>
                </div>
              ))}
              <div className="checkout_total_row">
                <span>Total Amount</span>
                <span>
                  ₹
                  {checkoutItems.reduce(
                    (acc, curr) => acc + (curr.price || 0),
                    0,
                  )}
                </span>
              </div>
            </div>

            <div className="checkout_actions">
              <button
                className="btn_back_confirm"
                onClick={() => setShowCheckout(false)}
              >
                Cancel
              </button>
              <button
                className="btn_pay_confirm"
                onClick={handleDirectPurchase}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="spin" size={18} />
                ) : (
                  <>
                    <CreditCard size={18} /> Pay & Order Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENT FORM - Passes existingData for rescheduling */}
      <AppointmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        existingData={selectedAppt}
        isRescheduleMode={!!selectedAppt} // Converts object existence to an explicit boolean flag
      />
    </div>
  );
}
