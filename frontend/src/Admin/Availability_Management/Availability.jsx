import React, { useState } from "react";
import Calendar from "react-calendar"; // Example calendar library
import "./Availability.css";

export default function AvailabilityManagement() {
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, doctor: "Dr. Ramesh", dept: "Cardiology", type: "Session Leave", date: "2026-03-31", appointments: 2, status: "Pending" },
    { id: 2, doctor: "Dr. Priya", dept: "Orthopedics", type: "Full Day", date: "2026-04-01", appointments: 0, status: "Pending" },
    { id: 3, doctor: "Dr. Arjun", dept: "General", type: "Recurring Leave", date: "Every Friday", appointments: 0, status: "Pending" }
  ]);

  const [filters, setFilters] = useState({ dept: "All", doctor: "All", type: "All" });
  const [analytics, setAnalytics] = useState({
    totalLeaves: 42,
    reassignedAppointments: 18,
    busiestDept: "Cardiology",
    mostLeavesDoctor: "Dr. Priya"
  });

  const doctors = [
    { name: "Dr. Ramesh", dept: "Cardiology", workload: 5 },
    { name: "Dr. Priya", dept: "Orthopedics", workload: 3 },
    { name: "Dr. Arjun", dept: "General", workload: 2 },
    { name: "Dr. Meera", dept: "Cardiology", workload: 1 }
  ];

  const handleApprove = (request) => {
    if (request.appointments === 0) {
      updateStatus(request.id, "Approved");
      notifyDoctor(request.doctor, "Leave Approved");
    } else {
      const replacement = findReplacementDoctor(request.dept);
      reassignAppointments(request.doctor, replacement);
      updateStatus(request.id, "Reassigned");
      notifyDoctor(request.doctor, `Appointments reassigned to ${replacement.name}`);
      notifyDoctor(replacement.name, `New appointments assigned from ${request.doctor}`);
      notifyPatients(request.doctor, replacement.name);
    }
  };

  const updateStatus = (id, status) => {
    setLeaveRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status } : req)
    );
  };

  const findReplacementDoctor = (dept) => {
    const deptDoctors = doctors.filter(d => d.dept === dept);
    return deptDoctors.reduce((min, d) => d.workload < min.workload ? d : min, deptDoctors[0]);
  };

  const reassignAppointments = (fromDoctor, toDoctor) => {
    console.log(`Appointments moved from ${fromDoctor} to ${toDoctor.name}`);
  };

  const notifyDoctor = (doctor, message) => {
    console.log(`Notification to ${doctor}: ${message}`);
  };

  const notifyPatients = (fromDoctor, toDoctor) => {
    console.log(`Patients notified: Your appointment with ${fromDoctor} has been reassigned to ${toDoctor}`);
  };

  const filteredRequests = leaveRequests.filter(req =>
    (filters.dept === "All" || req.dept === filters.dept) &&
    (filters.doctor === "All" || req.doctor === filters.doctor) &&
    (filters.type === "All" || req.type === filters.type)
  );

  return (
    <div className="availability-container">
      <h2>Doctor Availability & Leave Management</h2>

      {/* Filters */}
      <div className="filters-bar">
        <select onChange={(e) => setFilters({ ...filters, dept: e.target.value })}>
          <option>All</option>
          <option>Cardiology</option>
          <option>Orthopedics</option>
          <option>General</option>
        </select>
        <select onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}>
          <option>All</option>
          {doctors.map(d => <option key={d.name}>{d.name}</option>)}
        </select>
        <select onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option>All</option>
          <option>Full Day</option>
          <option>Session Leave</option>
          <option>Recurring Leave</option>
          <option>Emergency Leave</option>
        </select>
      </div>

      {/* Leave Requests */}
      <div className="leave-requests">
        {filteredRequests.map(req => (
          <div key={req.id} className={`leave-card ${req.status.toLowerCase()}`}>
            <h4>{req.doctor} ({req.dept})</h4>
            <p>Leave Type: {req.type}</p>
            <p>Date: {req.date}</p>
            <p>Appointments: {req.appointments}</p>
            <p>Status: {req.status}</p>
            <button onClick={() => handleApprove(req)}>
              {req.appointments === 0 ? "Approve Leave" : "Reassign & Approve"}
            </button>
          </div>
        ))}
      </div>

      {/* Calendar View */}
      <div className="availability-calendar">
        <h3>Doctor Availability Calendar</h3>
        <Calendar />
        <p className="calendar-note">Color-coded slots: Available (green), Leave Pending (yellow), Leave Approved (blue), Appointments Scheduled (red)</p>
      </div>

      {/* Analytics */}
      <div className="analytics-section">
        <h3>Leave Analytics</h3>
        <p>Total Leaves Approved: {analytics.totalLeaves}</p>
        <p>Appointments Reassigned: {analytics.reassignedAppointments}</p>
        <p>Busiest Department: {analytics.busiestDept}</p>
        <p>Most Leaves Taken: {analytics.mostLeavesDoctor}</p>
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
