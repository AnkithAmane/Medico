import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { 
    Search, X, Clock, Plus, Phone, Mail, ArrowLeft, Activity, MapPin, FileText,
    ChevronLeft, ChevronRight, Download, Calendar, User, ClipboardList, ShieldCheck, 
    GraduationCap, Hash, Thermometer
} from "lucide-react";

import appointmentsData from "../../Assets/Data/appointment.json"; 
import "./Appointment_Management.css";

export default function Appointment_Management() {
    const { searchTerm: globalSearch } = useOutletContext();

    const [localSearch, setLocalSearch] = useState("");
    const [filterDept, setFilterDept] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    
    const [showForm, setShowForm] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailView, setIsDetailView] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [appointments] = useState(appointmentsData);

    const filtered = useMemo(() => {
        return appointments.filter(a => {
            const patientName = (a.patient || "").toLowerCase();
            const doctorName = (a.doctor || "").toLowerCase();
            const deptName = (a.department || "").toLowerCase();

            const matchesGlobal = patientName.includes(globalSearch.toLowerCase()) || 
                                  doctorName.includes(globalSearch.toLowerCase()) ||
                                  deptName.includes(globalSearch.toLowerCase());

            const matchesLocal = patientName.includes(localSearch.toLowerCase());
            const matchesDept = filterDept ? a.department === filterDept : true;
            const matchesStatus = filterStatus ? a.status === filterStatus : true;
            const matchesDate = dateFilter ? a.date === dateFilter : true;
            
            return matchesGlobal && matchesLocal && matchesDept && matchesStatus && matchesDate;
        });
    }, [globalSearch, localSearch, filterDept, filterStatus, dateFilter, appointments]);

    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentAppointments = filtered.slice(indexOfFirstRow, indexOfLastRow);

    const consultationHistory = useMemo(() => {
        if (!selectedAppointment) return [];
        return appointments
            .filter(a => 
                a.patient === selectedAppointment.patient && 
                a.doctor === selectedAppointment.doctor && 
                a.id !== selectedAppointment.id
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [selectedAppointment, appointments]);

    const handlePageChange = (num) => {
        if (num >= 1 && num <= totalPages) {
            setCurrentPage(num);
            const container = document.querySelector(".admin_appt_m_table_scroll");
            if (container) container.scrollTop = 0;
        }
    };

    const handleViewDetails = (appt) => {
        setSelectedAppointment(appt);
        setIsDetailView(true);
    };

    return (
        <div className="admin_appt_m_wrapper">
            {!isDetailView ? (
                <div className="admin_appt_m_list_view">
                    <div className="admin_appt_m_header">
                        <div className="admin_appt_m_branding">
                            <h1 className="admin_appt_m_title">Clinical <span>Appointments</span></h1>
                            <p className="admin_appt_m_meta">
                                {globalSearch && `Results for: "${globalSearch}" | `}
                                {filtered.length} total records
                            </p>
                        </div>
                        <div className="admin_appt_m_actions">
                            <button className="admin_appt_m_btn_export" onClick={() => alert("Exported")}>
                                <Download size={16}/> Export
                            </button>
                            <button className="admin_appt_m_btn_primary" onClick={() => setShowForm(true)}>
                                <Plus size={18}/> New Booking
                            </button>
                        </div>
                    </div>

                    <div className="admin_appt_m_toolbar">
                        <div className="admin_appt_m_search_container">
                            <Search size={18} color="#94a3b8" />
                            <input 
                                type="text" 
                                placeholder="Search within results..." 
                                value={localSearch}
                                onChange={(e) => {setLocalSearch(e.target.value); setCurrentPage(1);}} 
                            />
                        </div>
                        
                        <div className="admin_appt_m_filter_group">
                            <select className="admin_appt_m_select" value={filterDept} onChange={(e) => {setFilterDept(e.target.value); setCurrentPage(1);}}>
                                <option value="">Departments</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Neurology">Neurology</option>
                                <option value="Pediatrics">Pediatrics</option>
                            </select>

                            <select className="admin_appt_m_select" value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}>
                                <option value="">Status</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Completed">Completed</option>
                            </select>

                            <input type="date" className="admin_appt_m_date_input" value={dateFilter} onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}} />
                            
                            {(globalSearch || localSearch || filterDept || filterStatus || dateFilter) && (
                                <button className="admin_appt_m_clear" onClick={() => {
                                    setLocalSearch(""); setFilterDept(""); setFilterStatus(""); setDateFilter(""); setCurrentPage(1);
                                }}>
                                    <X size={14} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="admin_appt_m_table_scroll">
                        <table className="admin_appt_m_table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Schedule</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th className="admin_appt_m_text_right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAppointments.length > 0 ? (
                                    currentAppointments.map((appt) => (
                                        <tr key={appt.id}>
                                            <td>
                                                <div className="admin_appt_m_user_cell">
                                                    <img src={appt.patientPhoto || "https://i.pravatar.cc/150"} alt="" />
                                                    <div><b>{appt.patient}</b><span>#{appt.id + 1000}</span></div>
                                                </div>
                                            </td>
                                            <td className="admin_appt_m_doc_name">{appt.doctor}</td>
                                            <td>
                                                <div className="admin_appt_m_time_cell">
                                                    <span className="admin_appt_m_date_text">{appt.date}</span>
                                                    <span className="admin_appt_m_time_text">{appt.time}</span>
                                                </div>
                                            </td>
                                            <td><span className={`admin_appt_m_tag ${appt.type?.toLowerCase()}`}>{appt.type}</span></td>
                                            <td><span className={`admin_appt_m_status ${appt.status?.toLowerCase()}`}>{appt.status}</span></td>
                                            <td className="admin_appt_m_text_right">
                                                <button className="admin_appt_m_btn_view" onClick={() => handleViewDetails(appt)}>View File</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="admin_appt_m_empty">
                                            <Activity size={32} />
                                            <p>No matching records found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="admin_appt_m_pagination">
                            <p>Showing <b>{indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filtered.length)}</b> of <b>{filtered.length}</b></p>
                            <div className="admin_appt_m_pag_controls">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={16}/></button>
                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                        return (
                                            <button key={i} className={currentPage === page ? 'admin_appt_m_pag_active' : ''} onClick={() => handlePageChange(page)}>{page}</button>
                                        );
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={i}>...</span>;
                                    }
                                    return null;
                                })}
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={16}/></button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="admin_appt_m_detail_view">
                    <div className="admin_appt_m_detail_header">
                        <button className="admin_appt_m_back_btn" onClick={() => setIsDetailView(false)}>
                            <ArrowLeft size={18}/> Back to Overview
                        </button>
                        <div className="admin_appt_m_status_indicator">
                            <span className={`admin_appt_m_pulse ${selectedAppointment.status?.toLowerCase()}`}></span>
                            Reference ID: #MS-{selectedAppointment.id + 4000}
                        </div>
                    </div>

                    <div className="admin_appt_m_grid_layout">
                        <div className="admin_appt_m_card admin_appt_m_profile_card">
                            <label className="admin_appt_m_label_alt"><ShieldCheck size={14}/> Specialist Profile</label>
                            <div className="admin_appt_m_profile_flex">
                                <img src={selectedAppointment.doctorPhoto} alt="" className="admin_appt_m_profile_img" />
                                <div className="admin_appt_m_profile_info">
                                    <h2>{selectedAppointment.doctor}</h2>
                                    <div className="admin_appt_m_degree_tag"><GraduationCap size={14}/> MBBS, MD | {selectedAppointment.department}</div>
                                    <div className="admin_appt_m_quick_meta">
                                        <span><MapPin size={12}/> Tower A, Room 402</span>
                                        <span><Clock size={12}/> Shift: 09:00 - 17:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="admin_appt_m_card admin_appt_m_profile_card">
                            <label className="admin_appt_m_label_alt"><User size={14}/> Patient Demographics</label>
                            <div className="admin_appt_m_profile_flex">
                                <img src={selectedAppointment.patientPhoto} alt="" className="admin_appt_m_profile_img" />
                                <div className="admin_appt_m_profile_info">
                                    <h2>{selectedAppointment.patient}</h2>
                                    <div className="admin_appt_m_demographic_grid">
                                        <div className="admin_appt_m_demo_item">Age: <b>32Y</b></div>
                                        <div className="admin_appt_m_demo_item">Sex: <b>Male</b></div>
                                        <div className="admin_appt_m_demo_item">Blood: <b>O+</b></div>
                                    </div>
                                    <div className="admin_appt_m_contact_info">
                                        <span><Mail size={12}/> {selectedAppointment.patient?.split(" ")[0].toLowerCase()}@medico.com</span>
                                        <span><Phone size={12}/> +91 99000 11222</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="admin_appt_m_card admin_appt_m_session_details_full">
                            <label className="admin_appt_m_label_alt"><Activity size={14}/> Session Overview</label>
                            <div className="admin_appt_m_session_row">
                                <div className="admin_appt_m_session_cell">
                                    <Calendar size={18} />
                                    <div><small>Schedule Date</small><p>{selectedAppointment.date}</p></div>
                                </div>
                                <div className="admin_appt_m_session_cell">
                                    <Clock size={18} />
                                    <div><small>Time Slot</small><p>{selectedAppointment.time}</p></div>
                                </div>
                                <div className="admin_appt_m_session_cell">
                                    <Hash size={18} />
                                    <div><small>Visit Type</small><p className="admin_appt_m_type_text">{selectedAppointment.type}</p></div>
                                </div>
                                <div className="admin_appt_m_session_cell">
                                    <Thermometer size={18} />
                                    <div><small>Status</small><p className={`admin_appt_m_status_pill ${selectedAppointment.status?.toLowerCase()}`}>{selectedAppointment.status}</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="admin_appt_m_card admin_appt_m_history_full">
                            <label className="admin_appt_m_label_alt"><ClipboardList size={14}/> Previous Encounters</label>
                            <div className="admin_appt_m_history_list_v3">
                                {consultationHistory.length > 0 ? (
                                    <table className="admin_appt_m_modern_table">
                                        <thead>
                                            <tr>
                                                <th>Clinical Date</th>
                                                <th>Category</th>
                                                <th>Observations</th>
                                                <th className="admin_appt_m_text_right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consultationHistory.map((past) => (
                                                <tr key={past.id}>
                                                    <td className="admin_appt_m_date_col"><b>{past.date}</b><br/><span>{past.time}</span></td>
                                                    <td><span className="admin_appt_m_cat_tag">{past.type}</span></td>
                                                    <td><p className="admin_appt_m_history_notes_text">{past.notes}</p></td>
                                                    <td className="admin_appt_m_text_right">
                                                        <button className="admin_appt_m_btn_file_view"><FileText size={14}/> Report</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="admin_appt_m_empty_clinical">
                                        <Activity size={24}/>
                                        <p>No prior clinical history found for this specific Patient-Specialist interaction.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="admin_appt_m_modal">
                    <div className="admin_appt_m_modal_box">
                        <div className="admin_appt_m_modal_head">
                            <h3>New <span>Booking</span></h3>
                            <button onClick={() => setShowForm(false)}><X size={20}/></button>
                        </div>
                        <form className="admin_appt_m_form">
                            <div className="admin_appt_m_field"><label>Patient Name</label><input type="text" /></div>
                            <div className="admin_appt_m_row">
                                <div className="admin_appt_m_field"><label>Date</label><input type="date" /></div>
                                <div className="admin_appt_m_field"><label>Time</label><input type="time" /></div>
                            </div>
                            <button type="submit" className="admin_appt_m_submit">Confirm Appointment</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}