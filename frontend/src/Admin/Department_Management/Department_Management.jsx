import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Users,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Clock,
  X,
  Loader2,
  Activity,
  MapPin,
  Star,
  AlertCircle,
  Check,
  UserPlus,
} from "lucide-react";
import "./Department_Management.css";

const DEFAULT_FORM_STATE = {
  name: "",
  head: "",
  doctors: [],
  budget: 0,
  patientCount: 0,
  location: "Main Block",
  status: "Active",
  color: "#007acc",
  rating: 4.5,
  operatingHours: "24/7",
};

export default function DepartmentManagement() {
  /* --- MERN LIVE DATA STATES --- */
  const [departments, setDepartments] = useState([]);
  const [allDoctorsRegistry, setAllDoctorsRegistry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewingDept, setViewingDept] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  /* --- MODAL INLINE LOCATIONAL FILTERS SEARCH STATES --- */
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [hodSearchQuery, setHodSearchQuery] = useState("");
  const [showHodDropdown, setShowHodDropdown] = useState(false);

  const hodRef = useRef(null); // Ref to manage clicking outside HOD menu

  /* 1. DATA SYNC LOGIC */
  const initializeWorkspace = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [deptRes, docRes] = await Promise.all([
        axios.get("http://localhost:5000/api/departments/all", { headers }),
        axios.get("http://localhost:5000/api/doctors/list", { headers }),
      ]);

      setDepartments(deptRes.data || []);
      setAllDoctorsRegistry(docRes.data || []);
    } catch (err) {
      console.error(
        "Clinical Infrastructure Workspace Initialization Failed",
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeWorkspace();

    // Handle clicking outside the HOD searchable menu
    const handleClickOutside = (event) => {
      if (hodRef.current && !hodRef.current.contains(event.target)) {
        setShowHodDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* DOCTOR REFERENCE CHECKBOX ATOMIC MAPPING HANDLER */
  const handleToggleDoctorSelection = (docId) => {
    setFormData((prev) => {
      const alreadySelected = prev.doctors.includes(docId);
      const updatedDoctorsArray = alreadySelected
        ? prev.doctors.filter((id) => id !== docId)
        : [...prev.doctors, docId];
      return { ...prev, doctors: updatedDoctorsArray };
    });
  };

  /* 2. CRUD OPERATIONS */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/departments/update/${formData._id}`,
          formData,
          { headers },
        );
        alert("Infrastructure Unit Updated Cleanly!");
      } else {
        await axios.post(
          "http://localhost:5000/api/departments/add",
          formData,
          { headers },
        );
        alert("New Wing Registered Successfully!");
      }
      setIsFormOpen(false);
      setFormData(DEFAULT_FORM_STATE);
      setDoctorSearchQuery("");
      setHodSearchQuery("");
      initializeWorkspace();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Infrastructure update failed. Ensure wing name is unique.",
      );
    }
  };

  const handleOpenEdit = (dept) => {
    const doctorIds = Array.isArray(dept.doctors)
      ? dept.doctors.map((d) => (typeof d === "object" ? d._id : d))
      : [];

    setFormData({
      ...dept,
      doctors: doctorIds,
      doctorCount: dept.doctorCount || 0,
      budget: dept.budget || 0,
      patientCount: dept.patientCount || 0,
    });
    setHodSearchQuery(dept.head || "");
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Decommission this clinical wing? This action is permanent.",
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5000/api/departments/delete/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        initializeWorkspace();
      } catch (err) {
        alert("Deletion failed.");
      }
    }
  };

  /* 3. SEARCH & ANALYTICS MEMOIZATION LOOPS */
  const filteredDepts = useMemo(() => {
    return departments.filter(
      (d) =>
        (d.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.head || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [departments, searchQuery]);

  /* 🟢 FILTERS MEDICAL TEAM MEMBERS IN REAL-TIME MATCHING SEARCH TYPED INPUT */
  const filteredDoctorsChecklist = useMemo(() => {
    return allDoctorsRegistry.filter((doc) => {
      const name = (doc.name || doc.doctorName || "").toLowerCase();
      const dept = (doc.department || "").toLowerCase();
      return (
        name.includes(doctorSearchQuery.toLowerCase()) ||
        dept.includes(doctorSearchQuery.toLowerCase())
      );
    });
  }, [allDoctorsRegistry, doctorSearchQuery]);

  /* 🟢 INTERACTIVE RETRIEVAL FILTERS HOD SUGGESTIONS ACCORDING TO USER CHARACTERS MATCHES */
  const filteredHodSuggestions = useMemo(() => {
    return allDoctorsRegistry.filter((doc) => {
      const name = (doc.name || doc.doctorName || "").toLowerCase();
      const dept = (doc.department || "").toLowerCase();
      return (
        name.includes(hodSearchQuery.toLowerCase()) ||
        dept.includes(hodSearchQuery.toLowerCase())
      );
    });
  }, [allDoctorsRegistry, hodSearchQuery]);

  const stats = useMemo(
    () => [
      {
        label: "Total Wings",
        val: departments.length,
        icon: <BarChart3 size={20} />,
        color: "#007acc",
      },
      {
        label: "Active Staff",
        val: departments.reduce((a, b) => a + Number(b.doctorCount || 0), 0),
        icon: <Users size={20} />,
        color: "#10b981",
      },
      {
        label: "Global Budget",
        val: `$${(departments.reduce((a, b) => a + Number(b.budget || 0), 0) / 1000).toFixed(0)}K`,
        icon: <DollarSign size={20} />,
        color: "#00d2ff",
      },
    ],
    [departments],
  );

  if (loading)
    return (
      <div className="admin_dash_load">
        <Loader2 className="spin" /> Synchronizing Medical Wings & Staff
        Reference Nodes...
      </div>
    );

  return (
    <div className="dept_mgmt_root doc_home_view_fade_in">
      {/* ELITE HEADER */}
      <header className="dept_mgmt_header_elite">
        <div className="dept_mgmt_branding">
          <h1>
            Clinical <span className="text_cyan">Infrastructure</span>
          </h1>
          <p>Governance & Resource Allocation Center</p>
        </div>
        <button
          className="dept_mgmt_btn_primary"
          onClick={() => {
            setFormData(DEFAULT_FORM_STATE);
            setHodSearchQuery("");
            setIsEditMode(false);
            setIsFormOpen(true);
          }}
        >
          <Plus size={18} /> Add New Wing
        </button>
      </header>

      {/* STATS BENTO GRID */}
      <div className="dept_mgmt_stats_grid">
        {stats.map((s, i) => (
          <div className="dept_mgmt_stat_tile" key={i}>
            <div
              className="dept_mgmt_tile_icon"
              style={{ color: s.color, backgroundColor: `${s.color}15` }}
            >
              {s.icon}
            </div>
            <div className="dept_mgmt_tile_meta">
              <h3>{s.val}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CONTROL BAR */}
      <div className="dept_mgmt_control_bar">
        <div className="dept_mgmt_search_wrapper">
          <Search size={18} className="search_icon" />
          <input
            placeholder="Search clinical registries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="dept_mgmt_view_toggles">
          <button
            className={viewMode === "card" ? "active" : ""}
            onClick={() => setViewMode("card")}
          >
            Grid View
          </button>
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
          >
            Table View
          </button>
        </div>
      </div>

      {/* VIEWPORT BOX */}
      {filteredDepts.length > 0 ? (
        <div
          className={
            viewMode === "card"
              ? "dept_mgmt_grid_viewport"
              : "dept_mgmt_list_viewport"
          }
        >
          {viewMode === "card" ? (
            filteredDepts.map((dept) => (
              <div className="dept_mgmt_glass_card" key={dept._id}>
                <div
                  className="dept_card_accent"
                  style={{ backgroundColor: dept.color || "#007acc" }}
                ></div>
                <div className="dept_card_main">
                  <div className="dept_card_head">
                    <h3>{dept.name}</h3>
                    <span
                      className={`dept_status_tag ${(dept.status || "Active").toLowerCase()}`}
                    >
                      {dept.status}
                    </span>
                  </div>
                  <div className="dept_card_body">
                    <div className="dept_info_node">
                      <Users size={14} />{" "}
                      <span>{dept.doctorCount} Specialists Assigned</span>
                    </div>
                    <div className="dept_info_node">
                      <ShieldCheck size={14} /> <span>Head: {dept.head}</span>
                    </div>
                    <div className="dept_info_node">
                      <Clock size={14} />{" "}
                      <span>{dept.operatingHours || "24/7"}</span>
                    </div>
                  </div>
                  <div className="dept_card_footer">
                    <button
                      className="dept_icon_btn view"
                      onClick={() => setViewingDept(dept)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="dept_icon_btn edit"
                      onClick={() => handleOpenEdit(dept)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="dept_icon_btn delete"
                      onClick={() => handleDelete(dept._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="admin_appt_m_table_scroll">
              <table className="admin_appt_m_table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Clinical Head</th>
                    <th>Staff Count</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th className="admin_appt_m_text_right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepts.map((dept) => (
                    <tr key={dept._id}>
                      <td>
                        <b style={{ color: dept.color }}>{dept.name}</b>
                      </td>
                      <td>{dept.head}</td>
                      <td>
                        <span className="badge_pill">{dept.doctorCount}</span>
                      </td>
                      <td>
                        <b>${(Number(dept.budget || 0) / 1000).toFixed(0)}K</b>
                      </td>
                      <td>
                        <span
                          className={`status_pill ${(dept.status || "Active").toLowerCase()}`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="admin_appt_m_text_right">
                        <div
                          className="admin_dept_action_group"
                          style={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            className="dept_icon_btn view"
                            onClick={() => setViewingDept(dept)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="dept_icon_btn edit"
                            onClick={() => handleOpenEdit(dept)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="dept_icon_btn delete"
                            onClick={() => handleDelete(dept._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="dept_empty_state">
          <AlertCircle size={40} />
          <p>No clinical infrastructure records found.</p>
        </div>
      )}

      {/* CONFIGURATION MODAL SCREEN FRAME */}
      {isFormOpen && (
        <div className="admin_appt_m_modal">
          <div
            className="admin_appt_m_modal_box dept_modal_width"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="admin_appt_m_modal_head">
              <h3>
                Wing <span>Configuration</span>
              </h3>
              <button onClick={() => setIsFormOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form className="admin_appt_m_form" onSubmit={handleFormSubmit}>
              <div className="admin_appt_m_field">
                <label>Department Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Neurology Unit"
                />
              </div>

              {/* 🟢 UPGRADED: SEARCHABLE HOD ALIGNMENT DROPDOWN SYSTEM */}
              <div
                className="admin_appt_m_field"
                style={{ position: "relative" }}
                ref={hodRef}
              >
                <label>Clinical Head (HOD)</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <Search
                    size={14}
                    style={{
                      position: "absolute",
                      left: "10px",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="text"
                    required
                    style={{ paddingLeft: "30px" }}
                    value={hodSearchQuery}
                    placeholder="Type name or specialty to search HOD..."
                    onFocus={() => setShowHodDropdown(true)}
                    onChange={(e) => {
                      setHodSearchQuery(e.target.value);
                      setFormData({ ...formData, head: e.target.value });
                    }}
                  />
                </div>
                {showHodDropdown && filteredHodSuggestions.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      maxHeight: "150px",
                      overflowY: "auto",
                      zIndex: 1100,
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  >
                    {filteredHodSuggestions.map((doc) => {
                      const nameStr = doc.name || doc.doctorName;
                      return (
                        <div
                          key={doc._id}
                          onClick={() => {
                            setHodSearchQuery(nameStr);
                            setFormData({ ...formData, head: nameStr });
                            setShowHodDropdown(false);
                          }}
                          style={{
                            padding: "8px 12px",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            borderBottom: "1px solid #f1f5f9",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.background = "#f1f5f9")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.background = "#fff")
                          }
                        >
                          <strong>{nameStr}</strong>{" "}
                          <span
                            style={{
                              color: "#007acc",
                              marginLeft: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            ({doc.department})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 🟢 UPGRADED: SEARCHABLE PANEL CHECKBOX MATRIX TRACKS */}
              <div className="admin_appt_m_field" style={{ margin: "15px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <label style={{ fontWeight: "700", margin: 0 }}>
                    <UserPlus
                      size={14}
                      style={{ marginRight: "4px", verticalAlign: "middle" }}
                    />{" "}
                    Assign Clinical Specialists Panel
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                      width: "190px",
                    }}
                  >
                    <Search
                      size={12}
                      style={{
                        position: "absolute",
                        left: "8px",
                        color: "#94a3b8",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search specialist name..."
                      value={doctorSearchQuery}
                      onChange={(e) => setDoctorSearchQuery(e.target.value)}
                      style={{
                        padding: "4px 8px 4px 24px",
                        fontSize: "0.75rem",
                        height: "26px",
                        borderRadius: "4px",
                        width: "100%",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "8px",
                    maxHeight: "140px",
                    overflowY: "auto",
                    background: "#f8fafc",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  {filteredDoctorsChecklist.length > 0 ? (
                    filteredDoctorsChecklist.map((doc) => {
                      const docId = doc._id;
                      const isChecked = formData.doctors.includes(docId);
                      return (
                        <label
                          key={docId}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            userSelect: "none",
                            textAlign: "left",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleDoctorSelection(docId)}
                            style={{ cursor: "pointer" }}
                          />
                          <span>
                            {doc.name || doc.doctorName}{" "}
                            <small style={{ color: "#64748b" }}>
                              ({doc.department})
                            </small>
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        gridColumn: "span 2",
                        padding: "10px 0",
                        textAlign: "center",
                      }}
                    >
                      No matching specialists found.
                    </div>
                  )}
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "0.75rem",
                    color: "#0284c7",
                    fontWeight: "600",
                    textAlign: "left",
                  }}
                >
                  Total Specialists Checked: {formData.doctors.length} Personnel
                </div>
              </div>

              <div className="admin_appt_m_row">
                <div className="admin_appt_m_field">
                  <label>Patient Load Capacity</label>
                  <input
                    type="number"
                    name="patientCount"
                    value={formData.patientCount}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="admin_appt_m_field">
                  <label>Budget ($)</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="admin_appt_m_row">
                <div className="admin_appt_m_field">
                  <label>Location Wing Pointer</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="admin_appt_m_field">
                  <label>Operating Availability Hours</label>
                  <input
                    type="text"
                    name="operatingHours"
                    value={formData.operatingHours}
                    onChange={handleInputChange}
                    placeholder="e.g. 24/7"
                  />
                </div>
              </div>
              <div className="admin_appt_m_row">
                <div className="admin_appt_m_field">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="admin_appt_m_select"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
                <div className="admin_appt_m_field">
                  <label>Card Hex Accent Color</label>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    style={{
                      height: "40px",
                      padding: "2px",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
              <button type="submit" className="admin_appt_m_submit">
                {isEditMode ? "Update Infrastructure" : "Deploy New Wing"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL ANALYSIS VIEW PANEL OVERLAY */}
      {viewingDept && (
        <div
          className="admin_appt_m_modal"
          onClick={() => setViewingDept(null)}
        >
          <div
            className="admin_appt_m_modal_box viewing_modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal_header_accent"
              style={{ backgroundColor: viewingDept.color }}
            ></div>
            <div className="admin_appt_m_modal_head">
              <h2 style={{ color: viewingDept.color }}>
                {viewingDept.name} Analysis
              </h2>
              <button onClick={() => setViewingDept(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="dept_detail_body">
              <div className="dept_detail_grid">
                <div className="detail_node">
                  <label>Clinical Unit Chief</label>
                  <strong>{viewingDept.head}</strong>
                </div>
                <div className="detail_node">
                  <label>Historical Patient Load</label>
                  <strong>{viewingDept.patientCount} Records</strong>
                </div>
                <div className="detail_node">
                  <label>Satisfaction Index</label>
                  <strong>⭐ {viewingDept.rating} / 5.0</strong>
                </div>
                <div className="detail_node">
                  <label>Structural Location</label>
                  <strong>{viewingDept.location || "Main Block"}</strong>
                </div>
              </div>

              <div
                className="detail_node"
                style={{
                  gridColumn: "span 2",
                  marginTop: "20px",
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <label
                  style={{
                    color: viewingDept.color,
                    fontWeight: "700",
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.85rem",
                  }}
                >
                  Assigned Active Medical Team (
                  {viewingDept.doctors?.length || 0})
                </label>
                <p
                  style={{
                    margin: "0",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    color: "#334155",
                  }}
                >
                  {viewingDept.doctors && viewingDept.doctors.length > 0
                    ? viewingDept.doctors
                        .map((d) =>
                          typeof d === "object" ? d.name || d.doctorName : d,
                        )
                        .join(", ")
                    : "No specific clinician files linked onto this facility index track."}
                </p>
              </div>
            </div>
            <div className="dept_card_footer" style={{ marginTop: "25px" }}>
              <button
                className="dept_mgmt_btn_primary"
                style={{ width: "100%", backgroundColor: viewingDept.color }}
                onClick={() => setViewingDept(null)}
              >
                Close Analysis View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
