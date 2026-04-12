import React, { useState, useMemo, useCallback } from "react";
import { Search, Download, Plus, Trash2, X, Eye, Copy, MapPin } from "lucide-react";
import "./Event_Management.css";

// ==================== Constants ====================
const INITIAL_EVENTS_DATA = [
  {
    id: 1,
    title: "Cardiology Conference",
    department: "Cardiology",
    type: "Conference",
    date: "2026-04-02",
    startTime: "10:00 AM",
    endTime: "12:30 PM",
    location: "Main Hall A",
    capacity: 150,
    registered: 120,
    checkedIn: 95,
    status: "Upcoming",
    doctors: ["Dr. Ramesh"],
    notes: "Annual update",
    priority: "High"
  },
  {
    id: 2,
    title: "Orthopedic Workshop",
    department: "Orthopedics",
    type: "Workshop",
    date: "2026-04-05",
    startTime: "2:00 PM",
    endTime: "4:00 PM",
    location: "Training Room 2",
    capacity: 50,
    registered: 48,
    checkedIn: 0,
    status: "Upcoming",
    doctors: ["Dr. Arjun"],
    notes: "Hands-on training",
    priority: "Medium"
  },
  {
    id: 3,
    title: "General Medicine Seminar",
    department: "General Medicine",
    type: "Seminar",
    date: "2026-03-25",
    startTime: "3:00 PM",
    endTime: "5:00 PM",
    location: "Meeting Room 1",
    capacity: 100,
    registered: 80,
    checkedIn: 76,
    status: "Completed",
    doctors: ["Dr. Meera"],
    notes: "Treatment protocols",
    priority: "Medium"
  },
  {
    id: 4,
    title: "Pediatrics Training",
    department: "Pediatrics",
    type: "Training",
    date: "2026-04-10",
    startTime: "9:00 AM",
    endTime: "11:00 AM",
    location: "Lab A",
    capacity: 40,
    registered: 35,
    checkedIn: 0,
    status: "Upcoming",
    doctors: ["Dr. Sharma"],
    notes: "Immunization techniques",
    priority: "Low"
  }
];

const DEPARTMENTS = ["Cardiology", "Orthopedics", "General Medicine", "Pediatrics"];
const EVENT_TYPES = ["Conference", "Workshop", "Seminar", "Training"];
const EVENT_STATUSES = ["Upcoming", "Completed", "Cancelled"];

// ==================== Main Component ====================
export default function Event_Management() {
  // State Management - Descriptive Names
  const [eventState, setEventState] = useState({
    events: INITIAL_EVENTS_DATA,
    viewMode: "table",
    searchQuery: "",
    filterDepartment: "",
    filterType: "",
    filterStatus: "",
    sortBy: "date",
    showEventForm: false,
    selectedEventDetail: null,
    selectedEventIds: []
  });

  // State update helper
  const setState = useCallback((updates) => {
    setEventState((prev) => ({ ...prev, ...updates }));
  }, []);

  // ==================== Memoized Calculations ====================
  const filteredAndSortedEvents = useMemo(() => {
    let result = eventState.events.filter((event) =>
      event.title.toLowerCase().includes(eventState.searchQuery.toLowerCase()) &&
      (!eventState.filterDepartment || event.department === eventState.filterDepartment) &&
      (!eventState.filterType || event.type === eventState.filterType) &&
      (!eventState.filterStatus || event.status === eventState.filterStatus)
    );

    result.sort((eventA, eventB) => {
      if (eventState.sortBy === "date") {
        return new Date(eventA.date) - new Date(eventB.date);
      } else if (eventState.sortBy === "title") {
        return eventA.title.localeCompare(eventB.title);
      } else if (eventState.sortBy === "attendance") {
        const attendanceA = eventA.checkedIn / eventA.registered;
        const attendanceB = eventB.checkedIn / eventB.registered;
        return attendanceB - attendanceA;
      }
      return 0;
    });

    return result;
  }, [eventState.events, eventState.searchQuery, eventState.filterDepartment, eventState.filterType, eventState.filterStatus, eventState.sortBy]);

  const eventStats = useMemo(
    () => ({
      total: eventState.events.length,
      upcoming: eventState.events.filter((e) => e.status === "Upcoming").length,
      completed: eventState.events.filter((e) => e.status === "Completed").length,
      avgAttendance:
        eventState.events.length > 0
          ? ((eventState.events.reduce((sum, e) => sum + e.checkedIn, 0) /
              eventState.events.reduce((sum, e) => sum + e.registered, 0)) *
              100).toFixed(0)
          : 0
    }),
    [eventState.events]
  );

  // ==================== Event Handlers ====================
  const handleSelectAllEvents = useCallback(
    (isChecked) => {
      setState({
        selectedEventIds: isChecked ? eventState.events.map((e) => e.id) : []
      });
    },
    [eventState.events, setState]
  );

  const handleToggleEventSelection = useCallback(
    (eventId, isChecked) => {
      setState({
        selectedEventIds: isChecked
          ? [...eventState.selectedEventIds, eventId]
          : eventState.selectedEventIds.filter((id) => id !== eventId)
      });
    },
    [eventState.selectedEventIds, setState]
  );

  const handleDeleteSelectedEvents = useCallback(() => {
    const remainingEvents = eventState.events.filter(
      (event) => !eventState.selectedEventIds.includes(event.id)
    );
    setState({
      events: remainingEvents,
      selectedEventIds: []
    });
  }, [eventState.events, eventState.selectedEventIds, setState]);

  const handleDuplicateEvent = useCallback(
    (eventToDuplicate) => {
      const maxId = Math.max(...eventState.events.map((e) => e.id), 0);
      const newEvent = {
        ...eventToDuplicate,
        id: maxId + 1,
        title: `${eventToDuplicate.title} (Copy)`
      };
      setState({
        events: [...eventState.events, newEvent]
      });
    },
    [eventState.events, setState]
  );

  const handleDeleteEvent = useCallback(
    (eventId) => {
      setState({
        events: eventState.events.filter((e) => e.id !== eventId),
        selectedEventDetail: null
      });
    },
    [eventState.events, setState]
  );

  const handleClearFilters = useCallback(() => {
    setState({
      searchQuery: "",
      filterDepartment: "",
      filterType: "",
      filterStatus: ""
    });
  }, [setState]);

  // ==================== Render Methods ====================
  const renderHeader = () => (
    <div className="event-header-section">
      <div className="event-header-left">
        <h1 className="event-title-elite">
          Event <span className="highlight">Management</span>
        </h1>
        <p className="event-subtitle">{filteredAndSortedEvents.length} events found</p>
      </div>
      <div className="event-view-toggle">
        <button
          className={`toggle-btn ${eventState.viewMode === "table" ? "active" : ""}`}
          onClick={() => setState({ viewMode: "table" })}
        >
          📋 Table
        </button>
        <button
          className={`toggle-btn ${eventState.viewMode === "calendar" ? "active" : ""}`}
          onClick={() => setState({ viewMode: "calendar" })}
        >
          📅 Calendar
        </button>
        <button
          className={`toggle-btn ${eventState.viewMode === "analytics" ? "active" : ""}`}
          onClick={() => setState({ viewMode: "analytics" })}
        >
          📊 Analytics
        </button>
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div className="stats-row">
      <div className="stat-box">
        <div className="stat-number">{eventStats.total}</div>
        <div className="stat-label">Total Events</div>
      </div>
      <div className="stat-box">
        <div className="stat-number">{eventStats.upcoming}</div>
        <div className="stat-label">Upcoming</div>
      </div>
      <div className="stat-box">
        <div className="stat-number">{eventStats.completed}</div>
        <div className="stat-label">Completed</div>
      </div>
      <div className="stat-box">
        <div className="stat-number">{eventStats.avgAttendance}%</div>
        <div className="stat-label">Avg Attendance</div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="event-filter-section">
      <div className="filter-row">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search events..."
            value={eventState.searchQuery}
            onChange={(e) => setState({ searchQuery: e.target.value })}
          />
        </div>

        <select
          value={eventState.filterDepartment}
          onChange={(e) => setState({ filterDepartment: e.target.value })}
          className="filter-select"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={eventState.filterType}
          onChange={(e) => setState({ filterType: e.target.value })}
          className="filter-select"
        >
          <option value="">All Types</option>
          {EVENT_TYPES.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <select
          value={eventState.filterStatus}
          onChange={(e) => setState({ filterStatus: e.target.value })}
          className="filter-select"
        >
          <option value="">All Status</option>
          {EVENT_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <select
          value={eventState.sortBy}
          onChange={(e) => setState({ sortBy: e.target.value })}
          className="filter-select"
        >
          <option value="date">Sort: Date</option>
          <option value="title">Sort: Title</option>
          <option value="attendance">Sort: Attendance</option>
        </select>

        <button className="filter-reset-btn" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>
    </div>
  );

  const renderToolbar = () => (
    <div className="event-toolbar">
      <button
        className="btn-primary"
        onClick={() => setState({ showEventForm: true })}
      >
        <Plus size={18} /> Add Event
      </button>
      <button className="btn-secondary">
        <Download size={18} /> Export CSV
      </button>
      {eventState.selectedEventIds.length > 0 && (
        <button className="btn-danger" onClick={handleDeleteSelectedEvents}>
          <Trash2 size={18} /> Delete ({eventState.selectedEventIds.length})
        </button>
      )}
    </div>
  );

  const renderTableView = () => (
    <div className="events-table-wrapper">
      <table className="event-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) => handleSelectAllEvents(e.target.checked)}
                checked={
                  eventState.selectedEventIds.length ===
                  eventState.events.length
                }
              />
            </th>
            <th>Title</th>
            <th>Department</th>
            <th>Date</th>
            <th>Type</th>
            <th>Location</th>
            <th>Capacity</th>
            <th>Attendance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedEvents.map((event) => (
            <tr key={event.id}>
              <td>
                <input
                  type="checkbox"
                  checked={eventState.selectedEventIds.includes(event.id)}
                  onChange={(e) =>
                    handleToggleEventSelection(event.id, e.target.checked)
                  }
                />
              </td>
              <td className="event-title-cell">{event.title}</td>
              <td>{event.department}</td>
              <td>{event.date}</td>
              <td>
                <span className="type-badge">{event.type}</span>
              </td>
              <td>
                <MapPin size={12} /> {event.location}
              </td>
              <td>
                {event.registered}/{event.capacity}
              </td>
              <td>
                <div className="attendance-bar">
                  <div
                    className="attendance-fill"
                    style={{
                      width: `${(event.checkedIn / event.capacity) * 100}%`
                    }}
                  />
                </div>
              </td>
              <td>
                <span className={`status-badge status-${event.status.toLowerCase()}`}>
                  {event.status}
                </span>
              </td>
              <td className="action-cell">
                <button
                  onClick={() => setState({ selectedEventDetail: event })}
                  title="View Details"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => handleDuplicateEvent(event)}
                  title="Duplicate Event"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  title="Delete Event"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEventDetail = () => {
    if (!eventState.selectedEventDetail) return null;

    const event = eventState.selectedEventDetail;
    const attendancePercentage = ((event.checkedIn / event.registered) * 100).toFixed(0);

    return (
      <div className="modal-overlay" onClick={() => setState({ selectedEventDetail: null })}>
        <div
          className="event-detail-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="detail-header">
            <h2>{event.title}</h2>
            <button
              className="close-btn"
              onClick={() => setState({ selectedEventDetail: null })}
            >
              <X size={24} />
            </button>
          </div>

          <div className="detail-content">
            <div className="detail-row">
              <div className="detail-item">
                <label>📅 Date & Time</label>
                <p>{event.date} • {event.startTime} - {event.endTime}</p>
              </div>
              <div className="detail-item">
                <label>📍 Location</label>
                <p>{event.location}</p>
              </div>
              <div className="detail-item">
                <label>🏢 Department</label>
                <p>{event.department}</p>
              </div>
              <div className="detail-item">
                <label>📋 Type</label>
                <p>{event.type}</p>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item">
                <label>👥 Capacity</label>
                <p>{event.registered} / {event.capacity}</p>
              </div>
              <div className="detail-item">
                <label>✅ Checked In</label>
                <p>{event.checkedIn} ({attendancePercentage}%)</p>
              </div>
              <div className="detail-item">
                <label>⚡ Priority</label>
                <p>{event.priority}</p>
              </div>
              <div className="detail-item">
                <label>📊 Status</label>
                <p>
                  <span className={`status-badge status-${event.status.toLowerCase()}`}>
                    {event.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="detail-section">
              <h3>👨‍⚕️ Doctors</h3>
              <div className="chip-list">
                {event.doctors.map((doctor) => (
                  <span key={doctor} className="chip">
                    {doctor}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h3>📝 Notes</h3>
              <p className="notes-text">{event.notes}</p>
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn-primary">Reschedule</button>
            <button className="btn-secondary" onClick={() => handleDuplicateEvent(event)}>
              Duplicate
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                handleDeleteEvent(event.id);
                setState({ selectedEventDetail: null });
              }}
            >
              Cancel Event
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== Main Render ====================
  return (
    <div className="event-management-container">
      {renderHeader()}
      {renderStatistics()}
      {renderFilters()}
      {renderToolbar()}

      {eventState.viewMode === "table" &&
        eventState.selectedEventDetail === null &&
        renderTableView()}

      {renderEventDetail()}
    </div>
  );
}