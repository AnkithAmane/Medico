import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  ButtonGroup,
  Button,
  InputGroup,
  FormControl,
  Badge,
  Table,
  Dropdown,
  Modal,
  Form,
  Card,
  ListGroup,
  Collapse,
} from 'react-bootstrap';
import { Search, Plus, Calendar, List, Trash2, Edit2, Filter, X } from 'lucide-react';
import Layout from '../../components/Common/Layout';
import '../../styles/AdminAppointments.css';

// Appointment Data
const appointmentsData = [
  {
    id: 1,
    patientName: 'Aakhyan Jeyush',
    department: 'Cardiology',
    doctorName: 'Dr. DeepaVignesh',
    dateTime: '2026-03-25 10:30 AM',
    status: 'Confirmed',
  },
  {
    id: 2,
    patientName: 'Bhavesh Patil',
    department: 'Dermatology',
    doctorName: 'Dr. Ritvik Reddy',
    dateTime: '2026-03-25 02:00 PM',
    status: 'Pending',
  },
  {
    id: 3,
    patientName: 'DSP',
    department: 'Neurology',
    doctorName: 'Dr. Harish Kumar',
    dateTime: '2026-03-26 11:00 AM',
    status: 'Confirmed',
  },
  {
    id: 4,
    patientName: 'Uday Gandhi',
    department: 'Orthopedics',
    doctorName: 'Dr. Nifal Sheikh',
    dateTime: '2026-03-26 03:30 PM',
    status: 'Cancelled',
  },
  {
    id: 5,
    patientName: 'Sushant Ambekar',
    department: 'Ophthalmology',
    doctorName: 'Dr. Durga Bhavani',
    dateTime: '2026-03-27 09:00 AM',
    status: 'Pending',
  },
];

// Filter Bar Component
const FilterBar = ({ showFilters, setShowFilters, selectedDoctor, setSelectedDoctor, selectedStatus, setSelectedStatus }) => {
  const doctors = ['All Doctors', 'Dr. DeepaVignesh', 'Dr. Ritvik Reddy', 'Dr. Harish Kumar', 'Dr. Nifal Sheikh', 'Dr. Durga Bhavani'];
  const statuses = ['All Status', 'Confirmed', 'Pending', 'Cancelled'];

  return (
    <Collapse in={showFilters} className="mb-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-light d-flex align-items-center justify-content-between">
          <h6 className="fw-bold mb-0">
            <Filter size={18} className="me-2" style={{ display: 'inline' }} />
            Filters
          </h6>
          <Button
            variant="light"
            size="sm"
            onClick={() => setShowFilters(false)}
            className="p-0"
          >
            <X size={18} />
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold mb-2">Doctor</Form.Label>
                <Form.Select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                  {doctors.map((doctor) => (
                    <option key={doctor} value={doctor}>
                      {doctor}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold mb-2">Status</Form.Label>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedDoctor('All Doctors');
                  setSelectedStatus('All Status');
                }}
                className="w-100"
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Collapse>
  );
};

// List View Component
const AppointmentsList = ({ appointments, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="table-responsive">
      <Table hover className="appointments-table">
        <thead className="table-light">
          <tr>
            <th>Patient Name</th>
            <th>Doctor</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>
                <div>
                  <div className="fw-bold">{appointment.patientName}</div>
                  <small className="text-muted">{appointment.department}</small>
                </div>
              </td>
              <td>{appointment.doctorName}</td>
              <td>{appointment.dateTime}</td>
              <td>
                <Badge bg={getStatusBadge(appointment.status)} className="rounded-pill">
                  {appointment.status}
                </Badge>
              </td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" size="sm" id={`dropdown-${appointment.id}`}>
                    Actions
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => onEdit(appointment)}>
                      <Edit2 size={16} className="me-2" />
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => onDelete(appointment.id)} className="text-danger">
                      <Trash2 size={16} className="me-2" />
                      Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

// Calendar View Component
const CalendarView = () => {
  const daysInMonth = 31;
  const firstDay = 3; // March 1, 2026 starts on Friday

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendar = [];

  for (let i = 0; i < firstDay; i++) {
    calendar.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendar.push(i);
  }

  return (
    <div className="calendar-container">
      <div className="row g-2">
        {days.map((day) => (
          <div key={day} className="col-md-1-7 text-center fw-bold text-secondary mb-3">
            {day}
          </div>
        ))}
        {calendar.map((day, index) => (
          <div key={index} className="col-md-1-7">
            {day ? (
              <Card className="calendar-day h-100 shadow-sm">
                <Card.Body className="p-2">
                  <div className="fw-bold text-dark">{day}</div>
                  <small className="text-muted">{Math.floor(Math.random() * 3)} appointments</small>
                </Card.Body>
              </Card>
            ) : (
              <div className="calendar-day-empty"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ show, handleClose, onSave, editingAppointment }) => {
  const [formData, setFormData] = useState(
    editingAppointment || {
      patientName: '',
      department: '',
      doctorName: '',
      date: '',
      time: '',
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ patientName: '', department: '', doctorName: '', date: '', time: '' });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Floating className="mb-3">
            <Form.Control
              id="floatingPatientName"
              type="text"
              placeholder="Patient Name"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
            />
            <Form.Label htmlFor="floatingPatientName">Patient Name</Form.Label>
          </Form.Floating>

          <Form.Floating className="mb-3">
            <Form.Control
              id="floatingDepartment"
              type="text"
              placeholder="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
            <Form.Label htmlFor="floatingDepartment">Department</Form.Label>
          </Form.Floating>

          <Form.Floating className="mb-3">
            <Form.Control
              id="floatingDoctor"
              type="text"
              placeholder="Doctor Name"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              required
            />
            <Form.Label htmlFor="floatingDoctor">Doctor Name</Form.Label>
          </Form.Floating>

          <Form.Floating className="mb-3">
            <Form.Control
              id="floatingDate"
              type="date"
              placeholder="Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <Form.Label htmlFor="floatingDate">Date</Form.Label>
          </Form.Floating>

          <Form.Floating className="mb-3">
            <Form.Control
              id="floatingTime"
              type="time"
              placeholder="Time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
            <Form.Label htmlFor="floatingTime">Time</Form.Label>
          </Form.Floating>

          <div className="d-flex gap-2">
            <Button variant="primary" type="submit" className="flex-grow-1">
              {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// Main Component
const AdminAppointments = () => {
  const [viewMode, setViewMode] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointments, setAppointments] = useState(appointmentsData);
  const [selectedDate, setSelectedDate] = useState('');

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDoctor = selectedDoctor === 'All Doctors' || apt.doctorName === selectedDoctor;
    const matchesStatus = selectedStatus === 'All Status' || apt.status === selectedStatus;

    return matchesSearch && matchesDoctor && matchesStatus;
  });

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setAppointments(appointments.filter((apt) => apt.id !== id));
  };

  const handleSaveAppointment = (formData) => {
    if (editingAppointment) {
      setAppointments(
        appointments.map((apt) =>
          apt.id === editingAppointment.id
            ? {
                ...apt,
                patientName: formData.patientName,
                department: formData.department,
                doctorName: formData.doctorName,
                dateTime: `${formData.date} ${formData.time}`,
              }
            : apt
        )
      );
    } else {
      const newAppointment = {
        id: Math.max(...appointments.map((a) => a.id), 0) + 1,
        patientName: formData.patientName,
        department: formData.department,
        doctorName: formData.doctorName,
        dateTime: `${formData.date} ${formData.time}`,
        status: 'Pending',
      };
      setAppointments([...appointments, newAppointment]);
    }
    setShowModal(false);
    setEditingAppointment(null);
  };

  return (
    <Layout>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col md={4}>
            <h2 className="mb-0 fw-bold">Appointments</h2>
          </Col>
          <Col md={4} className="text-center">
            <InputGroup className="date-selector-group mx-auto">
              <InputGroup.Text className="bg-white border-2 border-primary">
                <Calendar size={18} className="text-primary" />
              </InputGroup.Text>
              <FormControl
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input-selector border-2 border-primary"
              />
            </InputGroup>
          </Col>
          <Col md={4} className="text-end">
            <Button
              variant="primary"
              onClick={() => {
                setEditingAppointment(null);
                setShowModal(true);
              }}
              className="gap-2 d-flex align-items-center justify-content-center ms-auto"
            >
              <Plus size={20} />
              Add Appointment
            </Button>
          </Col>
        </Row>

        {/* Controls Bar */}
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <Row className="g-3 align-items-center mb-3">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <Search size={18} className="text-secondary" />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search patient or doctor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
              </Col>

              <Col md={6} className="d-flex justify-content-end gap-2">
                <ButtonGroup>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode('list')}
                    className="gap-2 d-flex align-items-center"
                  >
                    <List size={18} />
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode('calendar')}
                    className="gap-2 d-flex align-items-center"
                  >
                    <Calendar size={18} />
                    Calendar
                  </Button>
                </ButtonGroup>

                <Button
                  variant={showFilters ? 'primary' : 'outline-secondary'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2 d-flex align-items-center"
                >
                  <Filter size={18} />
                  Filters
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Filter Bar */}
        <FilterBar
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          selectedDoctor={selectedDoctor}
          setSelectedDoctor={setSelectedDoctor}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        {/* Content */}
        <Card className="shadow-sm">
          <Card.Body>
            {viewMode === 'list' ? (
              <AppointmentsList
                appointments={filteredAppointments}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <CalendarView />
            )}
          </Card.Body>
        </Card>

        {/* Booking Modal */}
        <BookingModal
          show={showModal}
          handleClose={() => {
            setShowModal(false);
            setEditingAppointment(null);
          }}
          onSave={handleSaveAppointment}
          editingAppointment={editingAppointment}
        />
      </Container>
    </Layout>
  );
};

export default AdminAppointments;
