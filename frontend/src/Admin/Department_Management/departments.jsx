import React, { useState } from "react";
import "./departments.css";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([
    { id: 1, name: "Cardiology", head: "Dr. Ramesh", doctors: ["Dr. Ramesh", "Dr. Meera"], patients: 120, revenue: 500000, growth: "+12%" },
    { id: 2, name: "Orthopedics", head: "Dr. Priya", doctors: ["Dr. Priya"], patients: 80, revenue: 300000, growth: "+8%" },
    { id: 3, name: "General", head: "Dr. Arjun", doctors: ["Dr. Arjun"], patients: 150, revenue: 400000, growth: "+15%" }
  ]);

  const [newDept, setNewDept] = useState({ name: "", head: "" });
  const [filters, setFilters] = useState({ dept: "All", doctor: "All" });

  const addDepartment = () => {
    const id = departments.length + 1;
    setDepartments([...departments, { id, name: newDept.name, head: newDept.head, doctors: [], patients: 0, revenue: 0, growth: "0%" }]);
    setNewDept({ name: "", head: "" });
  };

  const deleteDepartment = (id) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const assignDoctor = (deptId, doctorName) => {
    setDepartments(prev =>
      prev.map(d => d.id === deptId ? { ...d, doctors: [...d.doctors, doctorName] } : d)
    );
  };

  const filteredDepartments = departments.filter(d =>
    (filters.dept === "All" || d.name === filters.dept) &&
    (filters.doctor === "All" || d.doctors.includes(filters.doctor))
  );

  return (
    <div className="department-container">
      <h2>Department Management</h2>

      {/* Filters */}
      <div className="filters-bar">
        <select onChange={(e) => setFilters({ ...filters, dept: e.target.value })}>
          <option>All</option>
          {departments.map(d => <option key={d.id}>{d.name}</option>)}
        </select>
        <select onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}>
          <option>All</option>
          {departments.flatMap(d => d.doctors).map(doc => <option key={doc}>{doc}</option>)}
        </select>
      </div>

      {/* Add Department */}
      <div className="add-department">
        <input
          type="text"
          placeholder="Department Name"
          value={newDept.name}
          onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Head of Department"
          value={newDept.head}
          onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
        />
        <button onClick={addDepartment}>Add Department</button>
      </div>

      {/* Department List */}
      <div className="department-list">
        {filteredDepartments.map(dept => (
          <div key={dept.id} className="department-card">
            <h4>{dept.name}</h4>
            <p>Head: {dept.head}</p>
            <p>Doctors: {dept.doctors.join(", ") || "None Assigned"}</p>
            <p>Patients: {dept.patients}</p>
            <p>Revenue: ₹{dept.revenue}</p>
            <p>Growth: {dept.growth}</p>

            {/* Assign Doctor */}
            <div className="assign-doctor">
              <input
                type="text"
                placeholder="Doctor Name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") assignDoctor(dept.id, e.target.value);
                }}
              />
              <button onClick={() => assignDoctor(dept.id, "Dr. New")}>Assign Doctor</button>
            </div>

            {/* Delete Department */}
            <button className="delete-btn" onClick={() => deleteDepartment(dept.id)}>Delete Department</button>
          </div>
        ))}
      </div>

      {/* Analytics */}
      <div className="analytics-section">
        <h3>Department Analytics</h3>
        <p>Total Departments: {departments.length}</p>
        <p>Total Doctors: {departments.reduce((sum, d) => sum + d.doctors.length, 0)}</p>
        <p>Total Patients: {departments.reduce((sum, d) => sum + d.patients, 0)}</p>
        <p>Total Revenue: ₹{departments.reduce((sum, d) => sum + d.revenue, 0)}</p>
      </div>

      {/* Extra Options */}
      <div className="extra-options">
        <button>Export CSV</button>
        <button>Export PDF</button>
        <button>Compare Departments</button>
        <button>Add Custom Rule</button>
      </div>
    </div>
  );
}
