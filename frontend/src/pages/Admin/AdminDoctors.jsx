import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  ButtonGroup,
  InputGroup,
  FormControl,
  Form,
  Offcanvas,
  ProgressBar,
  Dropdown,
} from 'react-bootstrap';
import { Search, Star, Users, Clock, Edit2, Save, X, Stethoscope, Plus } from 'lucide-react';
import Layout from '../../components/Common/Layout';
import '../../styles/AdminDoctors.css';

// Doctor Data
const doctorsData = [
  {
    id: 1,
    name: 'Dr. DeepaVignesh',
    specialization: 'Cardiology',
    yearsOfExperience: 12,
    patientsTreated: 2450,
    averageRating: 4.8,
    consultationFee: 500,
    availability: true,
    startTime: '09:00',
    endTime: '18:00',
    weeklyOff: ['Sunday'],
    patientSatisfaction: 92,
    appointmentTarget: 85,
    avatar: 'DV',
    color: 'primary',
  },
  {
    id: 2,
    name: 'Dr. Ritvik Reddy',
    specialization: 'Pediatrics',
    yearsOfExperience: 8,
    patientsTreated: 1890,
    averageRating: 4.6,
    consultationFee: 400,
    availability: true,
    startTime: '10:00',
    endTime: '19:00',
    weeklyOff: ['Sunday'],
    patientSatisfaction: 88,
    appointmentTarget: 78,
    avatar: 'RR',
    color: 'success',
  },
  {
    id: 3,
    name: 'Dr. Harish Kumar',
    specialization: 'Neurology',
    yearsOfExperience: 15,
    patientsTreated: 3120,
    averageRating: 4.9,
    consultationFee: 600,
    availability: false,
    startTime: '08:00',
    endTime: '17:00',
    weeklyOff: ['Saturday', 'Sunday'],
    patientSatisfaction: 95,
    appointmentTarget: 92,
    avatar: 'HK',
    color: 'warning',
  },
  {
    id: 4,
    name: 'Dr. Nifal Sheikh',
    specialization: 'Orthopedics',
    yearsOfExperience: 10,
    patientsTreated: 2100,
    averageRating: 4.7,
    consultationFee: 550,
    availability: true,
    startTime: '09:00',
    endTime: '18:00',
    weeklyOff: ['Sunday'],
    patientSatisfaction: 90,
    appointmentTarget: 88,
    avatar: 'NS',
    color: 'info',
  },
  {
    id: 5,
    name: 'Dr. Durga Bhavani',
    specialization: 'Dermatology',
    yearsOfExperience: 9,
    patientsTreated: 1650,
    averageRating: 4.5,
    consultationFee: 450,
    availability: true,
    startTime: '10:00',
    endTime: '19:00',
    weeklyOff: ['Sunday'],
    patientSatisfaction: 87,
    appointmentTarget: 80,
    avatar: 'DB',
    color: 'danger',
  },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Search & Filter Bar Component
const SearchFilterBar = ({ searchTerm, setSearchTerm, selectedSpecialization, setSelectedSpecialization, sortBy, setSortBy }) => {
  const specializations = ['All', 'Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics', 'Dermatology'];

  return (
    <Card className="mb-4 shadow-sm sticky-top" style={{ zIndex: 10 }}>
      <Card.Body>
        <Row className="g-3 align-items-center">
          <Col md={5}>
            <InputGroup>
              <InputGroup.Text className="bg-light border-0">
                <Search size={18} className="text-secondary" />
              </InputGroup.Text>
              <FormControl
                placeholder="Search doctor by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          </Col>

          <Col md={3}>
            <Form.Select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="border-0 shadow-sm"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={4} className="text-end">
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="sortDropdown">
                Sort By: {sortBy}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSortBy('Rating')}>
                  <Star size={16} className="me-2" />
                  Rating
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy('Experience')}>
                  <Clock size={16} className="me-2" />
                  Experience
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy('Fee')}>
                  <span className="me-2">₹</span>
                  Consultation Fee
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor, onViewProfile }) => {
  return (
    <Card className="doctor-card h-100 shadow-sm cursor-pointer" onClick={() => onViewProfile(doctor)}>
      <Card.Body>
        {/* Avatar */}
        <div className={`avatar-circle bg-${doctor.color} text-white mb-3`}>
          {doctor.avatar}
        </div>

        {/* Doctor Info */}
        <h5 className="fw-bold mb-2">{doctor.name}</h5>
        <Badge bg={doctor.color} className="mb-3 rounded-pill">
          {doctor.specialization}
        </Badge>

        <p className="text-muted mb-1 small">
          <strong>{doctor.yearsOfExperience}</strong> years experience
        </p>

        {/* Quick Stats */}
        <div className="quick-stats d-flex justify-content-between mt-3 pt-3 border-top">
          <div className="text-center flex-grow-1">
            <Users size={18} className="text-secondary mb-1" />
            <div className="fw-bold small">{doctor.patientsTreated}</div>
            <small className="text-muted">Patients</small>
          </div>
          <div className="text-center flex-grow-1">
            <Star size={18} className="text-warning mb-1" />
            <div className="fw-bold small">{doctor.averageRating}</div>
            <small className="text-muted">Rating</small>
          </div>
          <div className="text-center flex-grow-1">
            <span className="fw-bold small text-success">₹{doctor.consultationFee}</span>
            <div className="text-muted" style={{ fontSize: '10px' }}>Fee</div>
          </div>
        </div>

        {/* Availability Badge */}
        <div className="mt-3">
          <Badge bg={doctor.availability ? 'success' : 'secondary'} className="w-100 py-2">
            {doctor.availability ? '✓ Available' : '✗ Off Duty'}
          </Badge>
        </div>
      </Card.Body>
    </Card>
  );
};

// Doctor Profile Offcanvas Component
const DoctorProfileOffcanvas = ({ show, handleClose, doctor, onUpdateDoctor }) => {
  const [editingFee, setEditingFee] = useState(false);
  const [tempFee, setTempFee] = useState(doctor?.consultationFee || 0);
  const [availability, setAvailability] = useState(doctor?.availability || false);
  const [startTime, setStartTime] = useState(doctor?.startTime || '09:00');
  const [endTime, setEndTime] = useState(doctor?.endTime || '18:00');
  const [weeklyOff, setWeeklyOff] = useState(doctor?.weeklyOff || []);

  if (!doctor) return null;

  const toggleWeeklyOff = (day) => {
    setWeeklyOff((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveFee = () => {
    onUpdateDoctor(doctor.id, { consultationFee: tempFee });
    setEditingFee(false);
  };

  const handleSaveShift = () => {
    onUpdateDoctor(doctor.id, {
      availability,
      startTime,
      endTime,
      weeklyOff,
    });
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" className="doctor-offcanvas">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="fw-bold">Doctor Profile</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {/* Profile Header */}
        <div className="text-center mb-4">
          <div className={`avatar-circle-lg bg-${doctor.color} text-white mx-auto mb-3`}>
            {doctor.avatar}
          </div>
          <h4 className="fw-bold">{doctor.name}</h4>
          <Badge bg={doctor.color} className="rounded-pill mb-3">
            {doctor.specialization}
          </Badge>
          <p className="text-muted">{doctor.yearsOfExperience} years of experience</p>
        </div>

        {/* Performance Metrics */}
        <Card className="mb-4 border-0 bg-light">
          <Card.Body>
            <h6 className="fw-bold mb-3">Performance Metrics</h6>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small>Patient Satisfaction</small>
                <small className="fw-bold">{doctor.patientSatisfaction}%</small>
              </div>
              <ProgressBar
                now={doctor.patientSatisfaction}
                variant="success"
                className="progress-bar-animated"
              />
            </div>

            <div>
              <div className="d-flex justify-content-between mb-1">
                <small>Appointment Target</small>
                <small className="fw-bold">{doctor.appointmentTarget}%</small>
              </div>
              <ProgressBar
                now={doctor.appointmentTarget}
                variant="info"
                className="progress-bar-animated"
              />
            </div>
          </Card.Body>
        </Card>

        {/* Consultation Fee */}
        <Card className="mb-4 border-0">
          <Card.Body>
            <h6 className="fw-bold mb-3">Consultation Fee</h6>
            {editingFee ? (
              <InputGroup className="mb-2">
                <InputGroup.Text>₹</InputGroup.Text>
                <FormControl
                  type="number"
                  value={tempFee}
                  onChange={(e) => setTempFee(parseInt(e.target.value))}
                  placeholder="Fee"
                />
                <Button variant="success" size="sm" onClick={handleSaveFee}>
                  <Save size={16} />
                </Button>
                <Button variant="danger" size="sm" onClick={() => setEditingFee(false)}>
                  <X size={16} />
                </Button>
              </InputGroup>
            ) : (
              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-5 fw-bold text-success">₹{doctor.consultationFee}</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setEditingFee(true)}
                >
                  <Edit2 size={16} />
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Shift Management */}
        <Card className="mb-4 border-0">
          <Card.Body>
            <h6 className="fw-bold mb-3">Shift Management</h6>

            {/* Availability Toggle */}
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="availability-switch"
                label={availability ? 'Available' : 'Off Duty'}
                checked={availability}
                onChange={(e) => setAvailability(e.target.checked)}
              />
            </Form.Group>

            {/* Shift Times */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Start Time</Form.Label>
              <FormControl
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">End Time</Form.Label>
              <FormControl
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </Form.Group>

            {/* Weekly Off */}
            <Form.Label className="small fw-bold mb-2">Weekly Off</Form.Label>
            <ButtonGroup className="d-flex flex-wrap gap-2 mb-3">
              {daysOfWeek.map((day) => (
                <Button
                  key={day}
                  variant={weeklyOff.includes(day) ? 'danger' : 'outline-secondary'}
                  size="sm"
                  onClick={() => toggleWeeklyOff(day)}
                  className="flex-grow-1"
                >
                  {day.slice(0, 3)}
                </Button>
              ))}
            </ButtonGroup>

            {/* Save Button */}
            <Button variant="primary" className="w-100" onClick={handleSaveShift}>
              Save Shift
            </Button>
          </Card.Body>
        </Card>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

// Main Component
const AdminDoctors = () => {
  const [doctors, setDoctors] = useState(doctorsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [sortBy, setSortBy] = useState('Rating');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  // Filter doctors
  let filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = selectedSpecialization === 'All' || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpec;
  });

  // Sort doctors
  if (sortBy === 'Rating') {
    filteredDoctors.sort((a, b) => b.averageRating - a.averageRating);
  } else if (sortBy === 'Experience') {
    filteredDoctors.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
  } else if (sortBy === 'Fee') {
    filteredDoctors.sort((a, b) => a.consultationFee - b.consultationFee);
  }

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setShowOffcanvas(true);
  };

  const handleUpdateDoctor = (id, updates) => {
    setDoctors((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    );
    setSelectedDoctor((prev) => (prev?.id === id ? { ...prev, ...updates } : prev));
  };

  return (
    <Layout>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold mb-1">Doctor Management</h2>
          </Col>
          <Col className="text-end">
            <Button variant="primary" className="gap-2 d-flex align-items-center justify-content-center ms-auto">
              <Plus size={20} />
              Add Doctor
            </Button>
          </Col>
        </Row>

        {/* Search & Filter Bar */}
        <SearchFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSpecialization={selectedSpecialization}
          setSelectedSpecialization={setSelectedSpecialization}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Doctors Grid */}
        <Row className="g-4">
          {filteredDoctors.map((doctor) => (
            <Col key={doctor.id} lg={4} md={6} xs={12}>
              <DoctorCard doctor={doctor} onViewProfile={handleViewProfile} />
            </Col>
          ))}
        </Row>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-5">
            <Stethoscope size={48} className="text-muted mb-3" />
            <h5 className="text-muted">No doctors found</h5>
            <p className="text-muted small">Try adjusting your search filters</p>
          </div>
        )}

        {/* Doctor Profile Offcanvas */}
        <DoctorProfileOffcanvas
          show={showOffcanvas}
          handleClose={() => setShowOffcanvas(false)}
          doctor={selectedDoctor}
          onUpdateDoctor={handleUpdateDoctor}
        />
      </Container>
    </Layout>
  );
};

export default AdminDoctors;
