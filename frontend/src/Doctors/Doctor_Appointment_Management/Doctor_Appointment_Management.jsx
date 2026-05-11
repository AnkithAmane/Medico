import React, { useMemo, useState, useEffect } from "react";
import {
    FiClock, FiCalendar, FiZap, FiArrowLeft, FiPhone, FiMail,
    FiCheckCircle, FiActivity, FiHash, FiUser, FiThermometer, FiFileText,
    FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axios";
import "./Doctor_Appointment_Management.css";

function parseTimeSlot(timeSlot) {
    if (!timeSlot) return "00:00";
    return timeSlot;
}

export default function Doctor_Appointment_Management() {
    const { user } = useAuth()

    // Data states
    const [doctorProfile, setDoctorProfile] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    // UI States
    const [filterMode, setFilterMode] = useState("ongoing");
    const [isDetailView, setIsDetailView] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [patientProfile, setPatientProfile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    // Fetch doctor and appointments
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return
            try {
                setLoading(true)
                const docRes = await axiosInstance.get(`/doctors/user/${user._id}`)
                const doctor = docRes.data.data
                setDoctorProfile(doctor)

                const apptRes = await axiosInstance.get(`/appointments/doctor/${doctor._id}`)
                setAppointments(apptRes.data.data || [])
            } catch (err) {
                console.error('Failed to load appointments:', err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user])

    // Filter appointments
    const filteredList = useMemo(() => {
        const today = new Date().toDateString()
        return appointments
            .filter(item => {
                const itemDate = new Date(item.date).toDateString()
                if (filterMode === "ongoing") return itemDate === today && item.status === 'upcoming'
                if (filterMode === "previous") return item.status === 'completed'
                return new Date(item.date) > new Date() && itemDate !== today && item.status === 'upcoming'
            })
            .sort((a, b) => {
                if (filterMode === "previous") return new Date(b.date) - new Date(a.date)
                return new Date(a.date) - new Date(b.date)
            })
    }, [appointments, filterMode])

    // Pagination
    const totalPages = Math.ceil(filteredList.length / rowsPerPage)
    const indexOfLastRow = currentPage * rowsPerPage
    const indexOfFirstRow = indexOfLastRow - rowsPerPage
    const currentRows = filteredList.slice(indexOfFirstRow, indexOfLastRow)

    const handlePageChange = (num) => {
        if (num >= 1 && num <= totalPages) setCurrentPage(num)
    }

    const handleFilterChange = (mode) => {
        setFilterMode(mode)
        setCurrentPage(1)
    }

    // Open workspace
    const handleOpenWorkspace = (appt) => {
        setSelectedAppt({ ...appt, prescription: appt.consultationNotes || '' })
        setPatientProfile(appt.patientId || null)
        setIsDetailView(true)
    }

    // Save prescription and complete appointment
    const handleEndAppointment = async () => {
        if (!selectedAppt.prescription?.trim()) {
            alert("Please enter clinical observations before finalizing.")
            return
        }
        try {
            await axiosInstance.put(`/appointments/${selectedAppt._id}`, {
                status: 'completed',
                consultationNotes: selectedAppt.prescription
            })

            // Refresh appointments
            const apptRes = await axiosInstance.get(`/appointments/doctor/${doctorProfile._id}`)
            setAppointments(apptRes.data.data || [])

            setIsDetailView(false)
            setFilterMode("previous")
            setCurrentPage(1)
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to finalize appointment')
        }
    }

    // Pagination rendering
    const renderPagination = () => {
        const pages = []
        const delta = 1
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
                )
            } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
                pages.push(<span key={i} className="doc_apt_m_pag_dots">...</span>)
            }
        }
        return pages
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Loading appointments...</p>
        </div>
    )

    // Get patient name helper
    const getPatientName = (appt) => {
        const p = appt.patientId?.userId
        return p ? `${p.firstName} ${p.lastName}` : 'Patient'
    }

    return (
        <div className="doc_apt_m_med-doc-appt doc_apt_m_med_page_fade_in">
            {!isDetailView ? (
                <div className="doc_apt_m_med_main_list_view">
                    <div className="doc_apt_m_med_section_header">
                        <div className="doc_apt_m_med_branding">
                            <h1>Clinical <span className="doc_apt_m_highlight">Console</span></h1>
                            <p>{doctorProfile?.name}'s Schedule Overview</p>
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
                            <div className="doc_apt_m_dr_card_grid_pro">
                                {currentRows.length > 0 ? currentRows.map(a => (
                                    <div key={a._id} className="doc_apt_m_dr_session_card_elite">
                                        <div className="doc_apt_m_card_header_main">
                                            <div style={{
                                                width: 50, height: 50, borderRadius: '50%',
                                                background: '#e0f2fe', color: '#007acc',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem'
                                            }}>
                                                {getPatientName(a).charAt(0)}
                                            </div>
                                            <div className="doc_apt_m_pat_id_stack">
                                                <strong>{getPatientName(a)}</strong>
                                                <span>UID: #{a.recordId || a._id?.slice(-6)}</span>
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
                            <div className="doc_apt_m_med_table_container">
                                <table className="doc_apt_m_med_table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Schedule</th>
                                            <th>Visit Type</th>
                                            <th>Notes</th>
                                            <th>Status</th>
                                            <th className="doc_apt_m_text_right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRows.length > 0 ? currentRows.map(appt => (
                                            <tr key={appt._id}>
                                                <td>
                                                    <div className="doc_apt_m_med_cell_user">
                                                        <div style={{
                                                            width: 40, height: 40, borderRadius: '50%',
                                                            background: '#e0f2fe', color: '#007acc',
                                                            display: 'flex', alignItems: 'center',
                                                            justifyContent: 'center', fontWeight: 800
                                                        }}>
                                                            {getPatientName(appt).charAt(0)}
                                                        </div>
                                                        <b>{getPatientName(appt)}</b>
                                                    </div>
                                                </td>
                                                <td>{appt.date} | {appt.time}</td>
                                                <td><span className="doc_apt_m_type_tag">{appt.type}</span></td>
                                                <td className="doc_apt_m_table_notes">
                                                    <span className="doc_apt_m_truncate">
                                                        {appt.consultationNotes || appt.reason || "--"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`doc_apt_m_med_status_pill ${appt.status}`}>
                                                        {appt.status}
                                                    </span>
                                                </td>
                                                <td className="doc_apt_m_text_right">
                                                    <button className="doc_apt_m_med_btn_manage" onClick={() => handleOpenWorkspace(appt)}>
                                                        {appt.status === "completed" ? "View Records" : "Manage"}
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="6" className="doc_apt_m_empty_table">No records found.</td></tr>}
                                    </tbody>
                                </table>

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
                <div className="doc_apt_m_detail_view">
                    <div className="doc_apt_m_detail_header">
                        <button className="doc_apt_m_back_btn" onClick={() => setIsDetailView(false)}>
                            <FiArrowLeft size={18} /> Back to Overview
                        </button>
                        <div className="doc_apt_m_status_indicator">
                            <span className={`doc_apt_m_pulse ${selectedAppt.status}`}></span>
                            Reference-ID: #{selectedAppt.recordId || selectedAppt._id?.slice(-6)}
                        </div>
                    </div>

                    <div className="doc_apt_m_grid_layout">
                        {/* Patient Demographics */}
                        <div className="doc_apt_m_card doc_apt_m_profile_card">
                            <label className="doc_apt_m_label_alt"><FiUser size={14} /> Patient Demographics</label>
                            <div className="doc_apt_m_profile_flex">
                                <div style={{
                                    width: 100, height: 100, borderRadius: 20,
                                    background: '#e0f2fe', color: '#007acc',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontWeight: 800, fontSize: '2rem'
                                }}>
                                    {getPatientName(selectedAppt).charAt(0)}
                                </div>
                                <div className="doc_apt_m_profile_info">
                                    <h2>{getPatientName(selectedAppt)}</h2>
                                    <div className="doc_apt_m_demographic_grid">
                                        <div className="doc_apt_m_demo_item">
                                            Blood: <b>{patientProfile?.bloodGroup || 'N/A'}</b>
                                        </div>
                                        <div className="doc_apt_m_demo_item">
                                            Age: <b>{patientProfile?.age || 'N/A'}</b>
                                        </div>
                                    </div>
                                    <div className="doc_apt_m_contact_info">
                                        <span><FiMail size={12} /> {selectedAppt.patientId?.userId?.email || 'N/A'}</span>
                                        <span><FiPhone size={12} /> {selectedAppt.patientId?.userId?.contact || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vital Statistics */}
                        <div className="doc_apt_m_card doc_apt_m_profile_card">
                            <label className="doc_apt_m_label_alt"><FiThermometer size={14} /> Clinical Snapshot</label>
                            <div className="doc_apt_m_vitals_strip">
                                <div className="doc_apt_m_vital_item">
                                    <span>Weight</span>
                                    <b>{patientProfile?.weight ? `${patientProfile.weight}kg` : 'N/A'}</b>
                                </div>
                                <div className="doc_apt_m_vital_item">
                                    <span>Height</span>
                                    <b>{patientProfile?.height ? `${patientProfile.height}cm` : 'N/A'}</b>
                                </div>
                                <div className="doc_apt_m_vital_item">
                                    <span>Blood Group</span>
                                    <b>{patientProfile?.bloodGroup || 'N/A'}</b>
                                </div>
                            </div>
                        </div>

                        {/* Session Overview */}
                        <div className="doc_apt_m_card doc_apt_m_session_details_full">
                            <label className="doc_apt_m_label_alt"><FiFileText size={14} /> Session Overview</label>
                            <div className="doc_apt_m_session_row">
                                <div className="doc_apt_m_session_cell">
                                    <FiCalendar />
                                    <div><small>Date</small><p>{selectedAppt.date}</p></div>
                                </div>
                                <div className="doc_apt_m_session_cell">
                                    <FiClock />
                                    <div><small>Slot</small><p>{selectedAppt.time}</p></div>
                                </div>
                                <div className="doc_apt_m_session_cell">
                                    <FiZap />
                                    <div><small>Type</small><p>{selectedAppt.type}</p></div>
                                </div>
                                <div className="doc_apt_m_session_cell">
                                    <FiCheckCircle />
                                    <div><small>Status</small><p>{selectedAppt.status}</p></div>
                                </div>
                            </div>
                        </div>

                        {/* Prescription Workspace */}
                        <div className="doc_apt_m_card doc_apt_m_history_full">
                            <label className="doc_apt_m_label_alt">
                                <FiActivity size={14} /> Clinical Observation & Rx Pad
                            </label>
                            <div className="doc_apt_m_active_editor_wrap">
                                {selectedAppt.status === "completed" ? (
                                    <div className="doc_apt_m_verified_block">
                                        <div className="doc_apt_m_verified_pill">
                                            <FiCheckCircle /> Record Authorized
                                        </div>
                                        <div className="doc_apt_m_display_rx_text">
                                            {selectedAppt.prescription || selectedAppt.consultationNotes || 'No notes'}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <textarea
                                            placeholder="Symptoms, Observations, and Medications..."
                                            value={selectedAppt.prescription}
                                            onChange={(e) => setSelectedAppt({ 
                                                ...selectedAppt, prescription: e.target.value 
                                            })}
                                            className="doc_apt_m_rx_textarea"
                                        />
                                        <div className="doc_apt_m_editor_footer">
                                            <button 
                                                className="doc_apt_m_save_btn" 
                                                onClick={handleEndAppointment}
                                            >
                                                Save & Finalize
                                            </button>
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