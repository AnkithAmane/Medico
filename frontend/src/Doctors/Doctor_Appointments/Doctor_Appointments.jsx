import React, { useMemo, useState } from "react";
import data from "../../Assets/Data/appointment.json";
import patientDetails from "../../Assets/Data/patient.json"; 
import { 
    FiClock, FiCalendar, FiZap, FiArrowLeft, FiPhone, FiMail, 
    FiCheckCircle, FiActivity, FiHash, FiUser, FiThermometer, FiFileText,
    FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import "./Doctor_Appointments.css";

/* Helper to convert 12h format to 24h for sorting */
function parseTimeSlot(timeSlot) {
    if (!timeSlot) return "00:00";
    const [time, modifier] = timeSlot.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

export default function DoctorAppointments() {
    /* --- State Management --- */
    const [filterMode, setFilterMode] = useState("ongoing");
    const [isDetailView, setIsDetailView] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [patientProfile, setPatientProfile] = useState(null);

    /* Pagination States */
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5; 

    const loggedInDoctor = "Dr. Meera Nair";

    /* Local Data State (to persist prescription updates) */
    const [listData, setListData] = useState(() => {
        return (data || []).map(p => ({
            ...p,
            notes: p.notes || "", 
            prescription: p.notes || ""
        }));
    });

    /* --- Filtering & Pagination Logic --- */
    const filteredList = useMemo(() => {
        const today = new Date().toDateString();
        return listData
            .filter(item => {
                if (item.doctor !== loggedInDoctor) return false;
                const itemDate = new Date(item.date).toDateString();
                
                if (filterMode === "ongoing") return itemDate === today && item.status !== "Completed";
                if (filterMode === "previous") return item.status === "Completed";
                
                const s = new Date(item.date);
                return s > new Date() && itemDate !== today && item.status !== "Completed";
            })
            .sort((a, b) => {
                if (filterMode === "previous") return new Date(b.date) - new Date(a.date);
                return new Date(`${a.date}T${parseTimeSlot(a.time)}`) - new Date(`${b.date}T${parseTimeSlot(b.time)}`);
            });
    }, [listData, filterMode, loggedInDoctor]);

    // Pagination Constants
    const totalPages = Math.ceil(filteredList.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredList.slice(indexOfFirstRow, indexOfLastRow);

    /* --- Handlers --- */
    const handlePageChange = (num) => {
        if (num >= 1 && num <= totalPages) setCurrentPage(num);
    };

    const handleFilterChange = (mode) => {
        setFilterMode(mode);
        setCurrentPage(1);
    };

    const handleOpenWorkspace = (appt) => {
        const profile = patientDetails.find(p => p.id === appt.id || p.name === appt.patient);
        setPatientProfile(profile || null);
        setSelectedAppt({ ...appt, prescription: appt.notes }); 
        setIsDetailView(true);
    };

    const handleEndAppointment = () => {
        if (!selectedAppt.prescription?.trim()) {
            alert("Please enter clinical observations before finalizing.");
            return;
        }

        setListData(prev => prev.map(ap => 
            ap.id === selectedAppt.id 
            ? { ...ap, status: "Completed", notes: selectedAppt.prescription } 
            : ap
        ));

        setIsDetailView(false);
        setFilterMode("previous");
        setCurrentPage(1);
    };

    /* --- Advanced Pagination Render (1 .. 4 5 6 .. 10) --- */
    const renderPagination = () => {
        const pages = [];
        const delta = 1; 

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                pages.push(
                    <button 
                        key={i} 
                        className={currentPage === i ? 'doc_apt_m_pag_active' : ''} 
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </button>
                );
            } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
                pages.push(<span key={i} className="doc_apt_m_pag_dots">...</span>);
            }
        }
        return pages;
    };

    return (
        <div className="doc_apt_m_med-doc-appt doc_apt_m_med_page_fade_in">
            {!isDetailView ? (
                /* --- MAIN LIST VIEW --- */
                <div className="doc_apt_m_med_main_list_view">
                    <div className="doc_apt_m_med_section_header">
                        <div className="doc_apt_m_med_branding">
                            <h1>Clinical <span className="doc_apt_m_highlight">Console</span></h1>
                            <p>{loggedInDoctor}'s Schedule Overview</p>
                        </div>
                        <div className="doc_apt_m_dr_segmented_control">
                            {["previous", "ongoing", "upcoming"].map(m => (
                                <button 
                                    key={m} 
                                    className={filterMode === m ? "doc_apt_m_active" : ""} 
                                    onClick={() => handleFilterChange(m)}
                                >
                                    {m === "previous" ? "Completed" : m.charAt(0).toUpperCase() + m.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="doc_apt_m_dr_content_engine">
                        {filterMode === "ongoing" ? (
                            /* CARD GRID FOR TODAY */
                            <div className="doc_apt_m_dr_card_grid_pro">
                                {currentRows.length > 0 ? currentRows.map(a => (
                                    <div key={a.id} className="doc_apt_m_dr_session_card_elite">
                                        <div className="doc_apt_m_card_header_main">
                                            <img src={a.patientPhoto || "https://i.pravatar.cc/150"} alt="" />
                                            <div className="doc_apt_m_pat_id_stack">
                                                <strong>{a.patient}</strong>
                                                <span>UID: #PT-{a.id + 1000}</span>
                                            </div>
                                        </div>
                                        <div className="doc_apt_m_card_body_info">
                                            <div className="doc_apt_m_meta_row"><FiClock /> {a.time}</div>
                                            <div className="doc_apt_m_meta_row"><FiZap /> {a.type}</div>
                                        </div>
                                        <button className="doc_apt_m_med_btn_manage_full" onClick={() => handleOpenWorkspace(a)}>
                                            Write Prescription
                                        </button>
                                    </div>
                                )) : <div className="doc_apt_m_empty_state">No active sessions for today.</div>}
                            </div>
                        ) : (
                            /* TABLE FOR HISTORY/UPCOMING */
                            <div className="doc_apt_m_med_table_container">
                                <table className="doc_apt_m_med_table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Schedule</th>
                                            <th>Visit Type</th>
                                            <th>Observation/Rx</th>
                                            <th>Status</th>
                                            <th className="doc_apt_m_text_right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRows.length > 0 ? currentRows.map(appt => (
                                            <tr key={appt.id}>
                                                <td>
                                                    <div className="doc_apt_m_med_cell_user">
                                                        <img src={appt.patientPhoto || "https://i.pravatar.cc/150"} alt="" />
                                                        <b>{appt.patient}</b>
                                                    </div>
                                                </td>
                                                <td>{appt.date} | {appt.time}</td>
                                                <td><span className="doc_apt_m_type_tag">{appt.type}</span></td>
                                                <td className="doc_apt_m_table_notes">
                                                    <span className="doc_apt_m_truncate">{appt.notes || "--"}</span>
                                                </td>
                                                <td>
                                                    <span className={`doc_apt_m_med_status_pill ${appt.status.toLowerCase()}`}>
                                                        {appt.status}
                                                    </span>
                                                </td>
                                                <td className="doc_apt_m_text_right">
                                                    <button className="doc_apt_m_med_btn_manage" onClick={() => handleOpenWorkspace(appt)}>
                                                        {appt.status === "Completed" ? "View Records" : "Manage"}
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="6" className="doc_apt_m_empty_table">No records found.</td></tr>}
                                    </tbody>
                                </table>

                                {/* PAGINATION CONTROLS */}
                                {totalPages > 1 && (
                                    <div className="doc_apt_m_pagination">
                                        <p>Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredList.length)}</b> of <b>{filteredList.length}</b></p>
                                        <div className="doc_apt_m_pag_controls">
                                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                                <FiChevronLeft />
                                            </button>
                                            {renderPagination()}
                                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                                <FiChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* --- DETAIL WORKSPACE --- */
                <div className="doc_apt_m_detail_view">
                    <div className="doc_apt_m_detail_header">
                        <button className="doc_apt_m_back_btn" onClick={() => setIsDetailView(false)}>
                            <FiArrowLeft size={18}/> Back to Overview
                        </button>
                        <div className="doc_apt_m_status_indicator">
                            <span className={`doc_apt_m_pulse ${selectedAppt.status?.toLowerCase()}`}></span>
                            Reference-ID: #MS-{selectedAppt.id + 4000}
                        </div>
                    </div>

                    <div className="doc_apt_m_grid_layout">
                        <div className="doc_apt_m_card doc_apt_m_profile_card">
                            <label className="doc_apt_m_label_alt"><FiUser size={14}/> Patient Demographics</label>
                            <div className="doc_apt_m_profile_flex">
                                <img src={selectedAppt.patientPhoto} alt="" className="doc_apt_m_profile_img" />
                                <div className="doc_apt_m_profile_info">
                                    <h2>{selectedAppt.patient}</h2>
                                    <div className="doc_apt_m_demographic_grid">
                                        <div className="doc_apt_m_demo_item">Age: <b>{patientProfile?.age || "32"}Y</b></div>
                                        <div className="doc_apt_m_demo_item">Sex: <b>{patientProfile?.gender || "Male"}</b></div>
                                        <div className="doc_apt_m_demo_item">Blood: <b>{patientProfile?.bloodGroup || "O+"}</b></div>
                                    </div>
                                    <div className="doc_apt_m_contact_info">
                                        <span><FiMail size={12}/> {selectedAppt.patient?.split(" ")[0].toLowerCase()}@medico.com</span>
                                        <span><FiPhone size={12}/> +91 99000 11222</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="doc_apt_m_card doc_apt_m_profile_card">
                            <label className="doc_apt_m_label_alt"><FiThermometer size={14}/> Clinical Snapshot</label>
                            <div className="doc_apt_m_vitals_strip">
                                <div className="doc_apt_m_vital_item"><span>Weight</span><b>72kg</b></div>
                                <div className="doc_apt_m_vital_item"><span>Height</span><b>175cm</b></div>
                                <div className="doc_apt_m_vital_item"><span>BMI</span><b>23.5</b></div>
                            </div>
                        </div>

                        <div className="doc_apt_m_card doc_apt_m_session_details_full">
                            <label className="doc_apt_m_label_alt"><FiFileText size={14}/> Session Overview</label>
                            <div className="doc_apt_m_session_row">
                                <div className="doc_apt_m_session_cell"><FiCalendar /><div><small>Date</small><p>{selectedAppt.date}</p></div></div>
                                <div className="doc_apt_m_session_cell"><FiClock /><div><small>Slot</small><p>{selectedAppt.time}</p></div></div>
                                <div className="doc_apt_m_session_cell"><FiZap /><div><small>Type</small><p>{selectedAppt.type}</p></div></div>
                                <div className="doc_apt_m_session_cell"><FiCheckCircle /><div><small>Status</small><p className="doc_apt_m_status_text">{selectedAppt.status}</p></div></div>
                            </div>
                        </div>

                        <div className="doc_apt_m_card doc_apt_m_history_full">
                            <label className="doc_apt_m_label_alt"><FiActivity size={14}/> Clinical Observation & Rx Pad</label>
                            <div className="doc_apt_m_active_editor_wrap">
                                {selectedAppt.status === "Completed" ? (
                                    <div className="doc_apt_m_verified_block">
                                        <div className="doc_apt_m_verified_pill"><FiCheckCircle /> Record Authorized</div>
                                        <div className="doc_apt_m_display_rx_text">{selectedAppt.prescription}</div>
                                    </div>
                                ) : (
                                    <>
                                        <textarea 
                                            placeholder="Symptoms, Observations, and Medications..."
                                            value={selectedAppt.prescription}
                                            onChange={(e) => setSelectedAppt({...selectedAppt, prescription: e.target.value})}
                                            className="doc_apt_m_rx_textarea"
                                        />
                                        <div className="doc_apt_m_editor_footer">
                                            <button className="doc_apt_m_save_btn" onClick={handleEndAppointment}>Save & Finalize</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}