import React, { useState } from "react";
import "./Doctor_Management.css";
import { Bar } from "react-chartjs-2";
import { 
  Search, Plus, Download, Calendar, Activity, 
  ChevronDown, ChevronUp, ChevronRight, X, User, BookOpen, Briefcase
} from "lucide-react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Doctor_Management() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterAvail, setFilterAvail] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllLeaves, setShowAllLeaves] = useState(false); 
  const rowsPerPage = 5;

  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. Ramesh",
      degrees: "MBBS, MD",
      department: "Cardiology",
      availability: "Available",
      leaves: ["2026-01-10", "2026-01-15", "2026-02-20", "2026-03-01", "2026-03-12", "2026-03-25"],
      totalAppointments: 120,
      totalPatients: 500,
      photo: "https://i.pravatar.cc/150?u=ramesh",
      performanceStats: [40, 55, 30, 65],
      appointmentHistory: [
        { patient: "Aditya Verma", date: "2026-03-25" },
        { patient: "Sita Iyer", date: "2026-03-24" },
        { patient: "Rahul G", date: "2026-03-23" },
      ],
    },
    {
      id: 2,
      name: "Dr. Priya",
      degrees: "MBBS, MS",
      department: "Orthopedics",
      availability: "Not Available",
      leaves: ["2026-03-10", "2026-03-11"],
      totalAppointments: 80,
      totalPatients: 300,
      photo: "https://i.pravatar.cc/150?u=priya",
      performanceStats: [20, 35, 25, 40],
      appointmentHistory: [
        { patient: "Kiran Dev", date: "2026-03-25" },
      ],
    },
  ]);

  const filteredDoctors = doctors.filter((doc) => {
    return (
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDept ? doc.department === filterDept : true) &&
      (filterAvail ? doc.availability === filterAvail : true)
    );
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);

  const getPerformanceData = (stats) => ({
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Patients Treated",
        data: stats,
        backgroundColor: "#007acc",
        borderRadius: 5,
        hoverBackgroundColor: "#00d2ff",
      },
    ],
  });

  /* --- FORM LOGIC --- */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const doctorData = {
      id: editDoctor ? editDoctor.id : Date.now(),
      name: formData.get("name"),
      degrees: formData.get("degrees"),
      department: formData.get("department"),
      availability: formData.get("availability"),
      photo: editDoctor ? editDoctor.photo : "https://via.placeholder.com/150",
      leaves: editDoctor ? editDoctor.leaves : [],
      totalAppointments: Number(formData.get("totalAppointments")),
      totalPatients: Number(formData.get("totalPatients")),
      performanceStats: editDoctor ? editDoctor.performanceStats : [10, 20, 30, 40],
      appointmentHistory: editDoctor ? editDoctor.appointmentHistory : []
    };

    if (editDoctor) {
      setDoctors(doctors.map(d => d.id === editDoctor.id ? doctorData : d));
    } else {
      setDoctors([...doctors, doctorData]);
    }
    setShowForm(false);
    setEditDoctor(null);
  };

  const handleEditClick = (doc) => {
    setEditDoctor(doc);
    setShowForm(true);
  };

  return (
    <div className="med_page_fade_in">
      {!selectedDoctor && (
        <div className="med_main_list_view">
          <div className="med_section_header">
            <div className="med_branding">
              <h1 className="med_title_elite">Medical <span className="highlight">Specialists</span></h1>
              <p className="med_subtitle">{filteredDoctors.length} staff records found</p>
            </div>
            <div className="med_action_group">
              <button className="med_btn_outline"><Download size={16}/> Export CSV</button>
              <button className="med_btn_primary" onClick={() => { setEditDoctor(null); setShowForm(true); }}>
                <Plus size={18}/> Add Doctor
              </button>
            </div>
          </div>

          <div className="med_filter_bar">
            <div className="med_search_box">
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Search specialists..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="med_dropdown_group">
              <select className="med_select_filter" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
              <select className="med_select_filter" value={filterAvail} onChange={(e) => setFilterAvail(e.target.value)}>
                <option value="">All Status</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
          </div>

          <div className="med_table_container">
            <table className="med_table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Appts</th>
                  <th>Patients</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentDoctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="med_cell_user">
                        <img src={doc.photo} alt="" />
                        <div><b>{doc.name}</b><span>{doc.degrees}</span></div>
                      </div>
                    </td>
                    <td className="med_text_bold">{doc.department}</td>
                    <td>
                      <span className={`med_status ${doc.availability === "Available" ? "upcoming" : "cancelled"}`}>
                        {doc.availability}
                      </span>
                    </td>
                    <td>{doc.totalAppointments}</td>
                    <td className="med_text_bold">{doc.totalPatients}</td>
                    <td>
                      <button className="med_btn_manage" onClick={() => setSelectedDoctor(doc)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedDoctor && (
        <div className="doctor-detail-container">
          <div className="detail-header">
            <button className="edit-btn" onClick={() => handleEditClick(selectedDoctor)}>Edit Details</button>
            <button className="close-btn" onClick={() => { setSelectedDoctor(null); setShowAllLeaves(false); }}>Close</button>
          </div>

          <div className="profile-section">
            <img src={selectedDoctor.photo} alt={selectedDoctor.name} className="profile-photo-large" />
            <div className="profile-info">
              <h2>{selectedDoctor.name}</h2>
              <p>Degrees: {selectedDoctor.degrees}</p>
              <p>Department: {selectedDoctor.department}</p>
              <p>Availability: {selectedDoctor.availability}</p>
            </div>
            <div className="profile-stats">
              <div className="stat-box"><h3>{selectedDoctor.totalAppointments}</h3><p>Total Appointments</p></div>
              <div className="stat-box"><h3>{selectedDoctor.totalPatients}</h3><p>Total Patients</p></div>
            </div>
          </div>

          <div className="middle-section">
            <div className="appointments-list">
              <div className="list-header-flex">
                <h3>Recent Patient Consultations</h3>
                <span className="med_label_micro">Last 5 Sessions</span>
              </div>
              <ul className="sa_elite_list">
                {selectedDoctor.appointmentHistory.slice(0, 5).map((appt, idx) => (
                  <li key={idx} className="sa_list_item_refined">
                    <div className="sa_item_left">
                      <div className="sa_patient_avatar_mini">{appt.patient.charAt(0)}</div>
                      <div className="sa_patient_info">
                        <span className="p_name">{appt.patient}</span>
                        <span className="p_date">{appt.date}</span>
                      </div>
                    </div>
                    <div className="sa_item_right">
                      <span className="sa_status_pill_mini">Completed</span>
                      <ChevronRight size={14} color="#cbd5e1" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="charts-section sa_chart_viz_pro">
                <div className="chart-header">
                    <h3>Performance Analytics</h3>
                    <div className="chart_legend_custom">
                        <div className="legend_item"><span className="dot blue"></span> Load</div>
                    </div>
                </div>
                <div className="sa_chart_wrapper_glass">
                    <Bar 
                        data={getPerformanceData(selectedDoctor.performanceStats)} 
                        options={{ 
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
                        }
                        }} 
                    />
                </div>
            </div>
          </div>

          <div className="leaves-section">
            <div className="sa_leaves_header_flex">
              <h3>Leaves Taken</h3>
              <button className="view_more_btn" onClick={() => setShowAllLeaves(!showAllLeaves)}>
                {showAllLeaves ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                {showAllLeaves ? " Show Less" : " View More"}
              </button>
            </div>
            <div className="leaves-grid">
              {(showAllLeaves ? selectedDoctor.leaves : selectedDoctor.leaves.slice(0, 5)).map((date, idx) => (
                <div key={idx} className="leave-box-elite">
                   <div className="leave_icon_bg"><Calendar size={14} color="#007acc" /></div>
                   <div className="leave_text_group">
                      <b>Leave {idx + 1}</b>
                      <span>{date}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- CENTERED MODAL FORMS --- */}
      {showForm && (
        <div className="sa_modal_overlay">
          <div className="sa_centered_form_card">
            <div className="sa_modal_header">
              <h2>{editDoctor ? "Refine Doctor Details" : "Onboard New Specialist"}</h2>
              <button className="sa_close_modal" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="sa_form_grid">
              <div className="sa_input_box">
                <label><User size={14}/> Full Name</label>
                <input name="name" defaultValue={editDoctor?.name} placeholder="e.g. Dr. Ramesh Babu" required />
              </div>
              <div className="sa_input_box">
                <label><BookOpen size={14}/> Degrees</label>
                <input name="degrees" defaultValue={editDoctor?.degrees} placeholder="e.g. MBBS, MD" required />
              </div>
              <div className="sa_input_box">
                <label><Briefcase size={14}/> Department</label>
                <select name="department" defaultValue={editDoctor?.department || "Cardiology"}>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
              <div className="sa_input_box">
                <label><Activity size={14}/> Availability</label>
                <select name="availability" defaultValue={editDoctor?.availability || "Available"}>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>
              <div className="sa_input_box">
                <label>Total Appointments</label>
                <input name="totalAppointments" type="number" defaultValue={editDoctor?.totalAppointments || 0} />
              </div>
              <div className="sa_input_box">
                <label>Total Patients</label>
                <input name="totalPatients" type="number" defaultValue={editDoctor?.totalPatients || 0} />
              </div>
              <div className="sa_form_actions_centered">
                <button type="submit" className="sa_btn_submit_pro">{editDoctor ? "Update Profile" : "Onboard Specialist"}</button>
                <button type="button" className="sa_btn_cancel_pro" onClick={() => setShowForm(false)}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}