import React, { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Users,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import "./departments.css";

// ==================== Constants ====================
const INITIAL_FORM_DATA = {
  name: "",
  head: "",
  doctorCount: 0,
  budget: 0,
  patientCount: 0,
  email: "",
  phone: "",
  location: "",
  status: "Active",
  color: "#007acc",
  rating: 4.5,
  casesHandled: 0,
  operatingHours: "24/7"
};

const DEFAULT_DEPARTMENTS = [
  {
    id: 1,
    name: "Cardiology",
    head: "Dr. Ramesh",
    doctorCount: 8,
    budget: 50000,
    patientCount: 245,
    email: "cardio@medico.com",
    phone: "+91-9876543210",
    location: "Floor 2",
    status: "Active",
    color: "#2E5090",
    rating: 4.8,
    casesHandled: 152,
    operatingHours: "24/7"
  },
  {
    id: 2,
    name: "Orthopedics",
    head: "Dr. Priya",
    doctorCount: 6,
    budget: 35000,
    patientCount: 180,
    email: "ortho@medico.com",
    phone: "+91-9876543211",
    location: "Floor 3",
    status: "Active",
    color: "#4A5568",
    rating: 4.6,
    casesHandled: 98,
    operatingHours: "9AM-6PM"
  },
  {
    id: 3,
    name: "Neurology",
    head: "Dr. Arjun",
    doctorCount: 5,
    budget: 40000,
    patientCount: 120,
    email: "neuro@medico.com",
    phone: "+91-9876543212",
    location: "Floor 4",
    status: "Active",
    color: "#5A6C7D",
    rating: 4.9,
    casesHandled: 87,
    operatingHours: "24/7"
  },
  {
    id: 4,
    name: "Pediatrics",
    head: "Dr. Sneha",
    doctorCount: 7,
    budget: 30000,
    patientCount: 310,
    email: "peds@medico.com",
    phone: "+91-9876543213",
    location: "Floor 1",
    status: "Active",
    color: "#3D4A5C",
    rating: 4.7,
    casesHandled: 215,
    operatingHours: "8AM-8PM"
  }
];

const COLOR_OPTIONS = ["#2E5090", "#4A5568", "#5A6C7D", "#3D4A5C", "#516B82", "#445A70"];
const SORT_OPTIONS = { name: "Name", patientCount: "Patients", rating: "Rating" };

// ==================== Subcomponents ====================

/**
 * StatsCard - Display a single statistic
 * Shows an icon, label, and value with custom styling
 */
const StatsCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="stats-card" style={{ backgroundColor: bgColor, borderLeft: `4px solid ${color}` }}>
    <div style={{ color }}>
      <Icon size={20} />
    </div>
    <div>
      <p className="stats-value">{value}</p>
      <p className="stats-label">{label}</p>
    </div>
  </div>
);

/**
 * FormInput - Reusable form input component
 * Handles text, number, and other input types
 */
const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false
}) => (
  <div className="form-group">
    <label>
      {label} {required && "*"}
    </label>
    <input
      className="form-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

/**
 * ColorPicker - Select from predefined color options
 */
const ColorPicker = ({ selectedColor, onColorChange }) => (
  <div className="form-group form-group-full">
    <label>Color Tag</label>
    <div className="color-picker">
      {COLOR_OPTIONS.map((color) => (
        <button
          key={color}
          className={`color-option ${selectedColor === color ? "selected" : ""}`}
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
        />
      ))}
    </div>
  </div>
);

/**
 * DepartmentCard - Display department in card view
 * Shows key information with action buttons
 */
const DepartmentCard = ({ dept, onView, onEdit, onDelete }) => (
  <div className="department-card" style={{ borderLeftColor: dept.color }}>
    <div className="card-header">
      <h3 style={{ color: dept.color }}>{dept.name}</h3>
    </div>
    <p className="department-head">👨‍⚕️ {dept.head}</p>
    <div className="department-details">
      <div>👥 {dept.doctorCount} Doctors</div>
      <div>⭐ {dept.rating}/5</div>
    </div>
    <div className="department-details">
      <div>📍 {dept.location}</div>
      <div>⏰ {dept.operatingHours}</div>
    </div>
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{
          width: `${(dept.casesHandled / 220) * 100}%`,
          backgroundColor: dept.color
        }}
      />
    </div>
    <div className="department-contact">
      <p>📧 {dept.email}</p>
      <p>📱 {dept.phone}</p>
    </div>
    <div className="card-actions">
      <button className="action-btn view" onClick={() => onView(dept)} title="View">
        <Eye size={16} />
      </button>
      <button className="action-btn edit" onClick={() => onEdit(dept)} title="Edit">
        <Edit2 size={16} />
      </button>
      <button className="action-btn delete" onClick={() => onDelete(dept.id)} title="Delete">
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

/**
 * TableView - Display departments in table format
 */
const TableView = ({ departments, onEdit, onDelete }) => (
  <div className="table-container">
    <table className="departments-table">
      <thead>
        <tr>
          <th>Department</th>
          <th>Head</th>
          <th>Doctors</th>
          <th>Patients</th>
          <th>Rating</th>
          <th>Location</th>
          <th>Hours</th>
          <th>Budget</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {departments.map((dept) => (
          <tr key={dept.id}>
            <td>
              <span
                style={{
                  borderLeft: `4px solid ${dept.color}`,
                  paddingLeft: "10px",
                  fontWeight: "700"
                }}
              >
                {dept.name}
              </span>
            </td>
            <td>{dept.head}</td>
            <td>
              <span className="badge-pill">{dept.doctorCount}</span>
            </td>
            <td>
              <span className="badge-pill">{dept.patientCount}</span>
            </td>
            <td>⭐ {dept.rating}</td>
            <td>{dept.location}</td>
            <td>
              <span className="hours-badge">{dept.operatingHours}</span>
            </td>
            <td>
              <span className="budget-badge">${(dept.budget / 1000).toFixed(0)}K</span>
            </td>
            <td>
              <span className={`status-badge status-${dept.status.toLowerCase()}`}>
                {dept.status}
              </span>
            </td>
            <td>
              <div className="action-group">
                <button className="action-btn-small edit" onClick={() => onEdit(dept)} title="Edit">
                  <Edit2 size={14} />
                </button>
                <button className="action-btn-small delete" onClick={() => onDelete(dept.id)} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * ViewModal - Display detailed department information
 */
const ViewModal = ({ dept, onClose, onEdit }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-view" onClick={(e) => e.stopPropagation()}>
      <div
        className="modal-header"
        style={{
          backgroundColor: `${dept.color}20`,
          borderLeft: `5px solid ${dept.color}`
        }}
      >
        <h2>{dept.name}</h2>
        <button className="close-modal" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="modal-content">
        <div className="info-row">
          <div className="info-section">
            <h4>Head</h4>
            <p>{dept.head}</p>
          </div>
          <div className="info-section">
            <h4>Rating</h4>
            <p>{dept.rating}/5.0</p>
          </div>
        </div>

        <div className="info-row">
          <div className="info-section">
            <h4>Doctors</h4>
            <p>{dept.doctorCount}</p>
          </div>
          <div className="info-section">
            <h4>Patients</h4>
            <p>{dept.patientCount}</p>
          </div>
          <div className="info-section">
            <h4>Cases</h4>
            <p>{dept.casesHandled}</p>
          </div>
        </div>

        <div className="info-row">
          <div className="info-section">
            <h4>Budget</h4>
            <p className="budget-large">${(dept.budget / 1000).toFixed(0)}K</p>
          </div>
          <div className="info-section">
            <h4>Hours</h4>
            <p>{dept.operatingHours}</p>
          </div>
        </div>

        <div className="info-section">
          <h4>Location</h4>
          <p>{dept.location}</p>
        </div>

        <div className="info-section">
          <h4>Contact</h4>
          <p>📧 {dept.email}</p>
          <p>📱 {dept.phone}</p>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-secondary" onClick={onClose}>
          Close
        </button>
        <button className="btn-primary" onClick={() => { onEdit(dept); onClose(); }}>
          Edit
        </button>
      </div>
    </div>
  </div>
);

/**
 * FormModal - Add or edit department
 */
const FormModal = ({ isOpen, isEditing, formData, onFormChange, onSubmit, onClose }) => {
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.name || !formData.head) {
      alert("Department name and head are required!");
      return;
    }
    onSubmit();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "✏️ Edit Department" : "➕ Add New Department"}</h2>
          <button className="close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="form-groups-container">
          <FormInput
            label="Department Name"
            value={formData.name}
            onChange={(e) => onFormChange("name", e.target.value)}
            placeholder="Cardiology"
            required
          />
          <FormInput
            label="Department Head"
            value={formData.head}
            onChange={(e) => onFormChange("head", e.target.value)}
            placeholder="Dr. Name"
            required
          />
          <FormInput
            label="Number of Doctors"
            type="number"
            value={formData.doctorCount}
            onChange={(e) => onFormChange("doctorCount", parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <FormInput
            label="Patient Count"
            type="number"
            value={formData.patientCount}
            onChange={(e) => onFormChange("patientCount", parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <FormInput
            label="Cases Handled"
            type="number"
            value={formData.casesHandled}
            onChange={(e) => onFormChange("casesHandled", parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <FormInput
            label="Annual Budget"
            type="number"
            value={formData.budget}
            onChange={(e) => onFormChange("budget", parseInt(e.target.value) || 0)}
            placeholder="50000"
          />
          <FormInput
            label="Department Rating"
            type="number"
            value={formData.rating}
            onChange={(e) => onFormChange("rating", parseFloat(e.target.value) || 4.5)}
            placeholder="4.5"
          />
          <FormInput
            label="Location"
            value={formData.location}
            onChange={(e) => onFormChange("location", e.target.value)}
            placeholder="Floor 2"
          />
          <FormInput
            label="Operating Hours"
            value={formData.operatingHours}
            onChange={(e) => onFormChange("operatingHours", e.target.value)}
            placeholder="24/7"
          />
          <FormInput
            label="Email"
            value={formData.email}
            onChange={(e) => onFormChange("email", e.target.value)}
            placeholder="dept@medico.com"
          />
          <FormInput
            label="Phone"
            value={formData.phone}
            onChange={(e) => onFormChange("phone", e.target.value)}
            placeholder="+91-9876543210"
          />

          <div className="form-group">
            <label>Status</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => onFormChange("status", e.target.value)}
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>Maintenance</option>
            </select>
          </div>

          <ColorPicker
            selectedColor={formData.color}
            onColorChange={(color) => onFormChange("color", color)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            {isEditing ? "💾 Update" : "➕ Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== Main Component ====================
export default function DepartmentManagement() {
  // State Management - Clear and Descriptive Names
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [viewMode, setViewMode] = useState("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // ==================== Callbacks ====================
  const handleFormChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleOpenForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setIsEditMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEditDepartment = useCallback((dept) => {
    setFormData(dept);
    setIsEditMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteDepartment = useCallback((id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    }
  }, []);

  const handleFormSubmit = useCallback(() => {
    if (isEditMode) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === formData.id ? formData : d))
      );
    } else {
      setDepartments((prev) => [...prev, { ...formData, id: Date.now() }]);
    }
    setIsFormOpen(false);
    setFormData(INITIAL_FORM_DATA);
  }, [isEditMode, formData]);

  // ==================== Memoized Calculations ====================
  const filteredAndSortedDepartments = useMemo(() => {
    let result = departments.filter((d) =>
      (d.name + d.head).toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "patientCount") return b.patientCount - a.patientCount;
      return b.rating - a.rating;
    });

    return result;
  }, [departments, searchQuery, sortBy]);

  const departmentStatistics = useMemo(
    () => [
      {
        label: "Total Departments",
        value: departments.length,
        color: "#2E5090",
        bgColor: "#F5F7FA",
        icon: BarChart3
      },
      {
        label: "Active",
        value: departments.filter((d) => d.status === "Active").length,
        color: "#4A5568",
        bgColor: "#F8F9FB",
        icon: CheckCircle
      },
      {
        label: "Total Doctors",
        value: departments.reduce((sum, d) => sum + d.doctorCount, 0),
        color: "#5A6C7D",
        bgColor: "#F6F8FB",
        icon: Users
      },
      {
        label: "Total Budget",
        value: `$${(departments.reduce((sum, d) => sum + d.budget, 0) / 1000).toFixed(0)}K`,
        color: "#3D4A5C",
        bgColor: "#F7F9FC",
        icon: DollarSign
      }
    ],
    [departments]
  );

  // ==================== Main Render ====================
  return (
    <div className="departments-container">
      {/* Header Section */}
      <div className="dept-header">
        <div>
          <h1>
            🏥 Department <span>Management</span>
          </h1>
          <p className="subtitle">Manage all departments efficiently</p>
        </div>
        <button className="btn-add-large" onClick={handleOpenForm}>
          <Plus size={20} /> New Department
        </button>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <div className="stats-grid">
          {departmentStatistics.map((stat) => (
            <StatsCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              bgColor={stat.bgColor}
            />
          ))}
        </div>
      </div>

      {/* Filter & Sort Section */}
      <div className="filter-sort-section">
        <div className="search-bar">
          <Search size={16} />
          <input
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="controls-group">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            {Object.entries(SORT_OPTIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "card" ? "active" : ""}`}
              onClick={() => setViewMode("card")}
            >
              📇 Cards
            </button>
            <button
              className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              📋 List
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedDepartments.length === 0 && (
        <div className="empty-state">
          <AlertCircle size={48} />
          <p>No departments found</p>
          <button className="btn-primary" onClick={handleOpenForm}>
            Add First Department
          </button>
        </div>
      )}

      {/* Content Views */}
      {filteredAndSortedDepartments.length > 0 &&
        (viewMode === "card" ? (
          <div className="departments-grid">
            {filteredAndSortedDepartments.map((dept) => (
              <DepartmentCard
                key={dept.id}
                dept={dept}
                onView={() => setViewingDepartment(dept)}
                onEdit={handleEditDepartment}
                onDelete={handleDeleteDepartment}
              />
            ))}
          </div>
        ) : (
          <TableView
            departments={filteredAndSortedDepartments}
            onEdit={handleEditDepartment}
            onDelete={handleDeleteDepartment}
          />
        ))}

      {/* Modals */}
      {viewingDepartment && (
        <ViewModal
          dept={viewingDepartment}
          onClose={() => setViewingDepartment(null)}
          onEdit={handleEditDepartment}
        />
      )}
      <FormModal
        isOpen={isFormOpen}
        isEditing={isEditMode}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleFormSubmit}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
