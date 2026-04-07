import React, { useState } from "react";
import "./Event_Management.css";

export default function Event_Management() {
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Dummy events
  const events = [
    {
      id: 1,
      title: "Cardiology Conference",
      department: "Cardiology",
      type: "Conference",
      date: "2026-04-02",
      time: "10:00 AM",
      status: "Upcoming",
      doctors: ["Dr. Ramesh", "Dr. Priya"],
      participants: ["Patient Group A", "Staff Team 1"],
      notes: "Annual cardiology update with guest speakers.",
      attachments: ["Agenda.pdf"],
    },
    {
      id: 2,
      title: "Orthopedic Workshop",
      department: "Orthopedics",
      type: "Workshop",
      date: "2026-04-05",
      time: "2:00 PM",
      status: "Upcoming",
      doctors: ["Dr. Arjun"],
      participants: ["Resident Doctors"],
      notes: "Hands-on training for new procedures.",
      attachments: ["WorkshopOutline.pdf"],
    },
  ];

  return (
    <div className="event-management-container">
      <h2>Event Management</h2>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-box">Total Events: 33</div>
        <div className="stat-box">Upcoming Today: 5</div>
        <div className="stat-box">Completed This Week: 12</div>
        <div className="stat-box">Cancelled: 2</div>
        <div className="stat-box">Most Active Dept: Cardiology</div>
        <div className="stat-box">Avg Attendance: 85%</div>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <div className="event-form-container">
          <h3>Add New Event</h3>
          <form onSubmit={(e) => { e.preventDefault(); setShowForm(false); }}>
            <input type="text" placeholder="Event Title" required />
            <input type="date" required />
            <input type="time" required />
            <select>
              <option>Cardiology</option>
              <option>Orthopedics</option>
              <option>General</option>
              <option>Pediatrics</option>
            </select>
            <select>
              <option>Conference</option>
              <option>Workshop</option>
              <option>Appointment</option>
              <option>Meeting</option>
            </select>
            {/* Recurrence */}
            <select>
              <option>No Recurrence</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            {/* Doctor assignment */}
            <select>
              <option>Assign Single Doctor</option>
              <option>Assign Group</option>
            </select>
            <input type="text" placeholder="Filter doctors by name/group" />
            {/* Participants */}
            <input type="text" placeholder="Add participants (patients/staff)" />
            {/* Location/Mode */}
            <input type="text" placeholder="Location / Meeting Link" />
            {/* Reminder */}
            <select>
              <option>No Reminder</option>
              <option>15 min before</option>
              <option>30 min before</option>
              <option>1 hour before</option>
            </select>
            <textarea placeholder="Notes"></textarea>
            <input type="file" />
            <button type="submit">Save Event</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* Action Toolbar */}
      {!selectedEvent && (
        <div className="event-toolbar">
          <button onClick={() => setShowForm(true)}>+ Add Event</button>
          <button>Export CSV</button>
          <button>Export PDF</button>
          <button>Compare Time Ranges</button>
        </div>
      )}

      {/* Events Table */}
      {!selectedEvent && (
        <table className="event-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Department</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.title}</td>
                <td>{ev.department}</td>
                <td>{ev.date}</td>
                <td>{ev.time}</td>
                <td>{ev.status}</td>
                <td>
                  <button onClick={() => setSelectedEvent(ev)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Event Detail View */}
      {selectedEvent && (
        <div className="event-detail-container">
          <div className="event-detail-header">
            <h3>{selectedEvent.title}</h3>
            <div className="event-actions">
              <button>Reschedule</button>
              <button>Cancel</button>
              <button>Duplicate</button>
              <button onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
          <div className="event-detail-body">
            <div className="event-detail-left">
              <p><strong>Department:</strong> {selectedEvent.department}</p>
              <p><strong>Type:</strong> {selectedEvent.type}</p>
              <p><strong>Date:</strong> {selectedEvent.date}</p>
              <p><strong>Time:</strong> {selectedEvent.time}</p>
              <p><strong>Status:</strong> {selectedEvent.status}</p>
            </div>
            <div className="event-detail-right">
              <p><strong>Doctors:</strong> {selectedEvent.doctors.join(", ")}</p>
              <p><strong>Participants:</strong> {selectedEvent.participants.join(", ")}</p>
              <p><strong>Notes:</strong> {selectedEvent.notes}</p>
              <div className="attachments-section">
                <h4>Attachments</h4>
                <ul>
                  {selectedEvent.attachments.map((file, index) => (
                    <li key={index}><a href="#">{file}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View Placeholder */}
      <div className="calendar-view">
        <h4>Monthly Calendar</h4>
        <p>[Calendar component integration here]</p>
      </div>

      {/* Highlights */}
      <div className="highlights-section">
        <h4>Highlights</h4>
        <ul>
          <li>Cardiology has the most events scheduled.</li>
          <li>Week 4 is the busiest week.</li>
          <li>Appointments make up 36% of events.</li>
        </ul>
      </div>

      {/* Forecast */}
      <div className="forecast-section">
        <h4>Forecast</h4>
        <p>
          Based on current scheduling, next month is projected to have 40+ events,
          with Cardiology and Orthopedics leading in activity.
        </p>
      </div>

      {/* Analytics Snapshot */}
      <div className="analytics-section">
        <h4>Analytics Snapshot</h4>
        <p>Cardiology hosted 40% of events this month.</p>
        <p>Workshops had the highest attendance rate (92%).</p>
      </div>
    </div>
  );
}
