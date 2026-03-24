import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Badge,
  Button,
  ListGroup,
  Alert,
  Form,
  InputGroup,
  FormControl,
  OverlayTrigger,
  Tooltip,
  Card,
  Collapse,
} from 'react-bootstrap';
import { Search, Eye, Plus, Phone, Mail, AlertCircle, ArrowLeft, Edit2, Save } from 'lucide-react';
import Layout from '../../components/Common/Layout';
import '../../styles/AdminPatients.css';

// Patient Data
const patientsData = [
  {
    id: 1,
    name: 'Aakhyan Jeyush',
    patientId: 'MED-2024-001',
    age: 45,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    email: 'aakhyan.jeyush@email.com',
    allergies: ['Penicillin', 'Shellfish'],
    medicalHistory: [
      {
        date: '2026-03-15',
        doctor: 'Dr. DeepaVignesh',
        diagnosis: 'Hypertension',
        reason: 'Regular checkup and blood pressure monitoring',
      },
      {
        date: '2026-02-10',
        doctor: 'Dr. Ritvik Reddy',
        diagnosis: 'Common Cold',
        reason: 'Respiratory symptoms and fever',
      },
      {
        date: '2025-12-20',
        doctor: 'Dr. Harish Kumar',
        diagnosis: 'Migraine',
        reason: 'Severe headache and neurological symptoms',
      },
    ],
    automatedReminders: true,
    avatar: 'AJ',
  },
  {
    id: 2,
    name: 'Bhavesh Patil',
    patientId: 'MED-2024-002',
    age: 32,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98765 43211',
    email: 'bhavesh.patil@email.com',
    allergies: ['Aspirin'],
    medicalHistory: [
      {
        date: '2026-03-10',
        doctor: 'Dr. Nifal Sheikh',
        diagnosis: 'Knee Pain',
        reason: 'Orthopedic consultation for left knee pain',
      },
      {
        date: '2026-01-15',
        doctor: 'Dr. DeepaVignesh',
        diagnosis: 'Diabetes Type 2',
        reason: 'Routine glucose level check',
      },
    ],
    automatedReminders: false,
    avatar: 'BP',
  },
  {
    id: 3,
    name: 'DSP',
    patientId: 'MED-2024-003',
    age: 28,
    gender: 'Female',
    bloodGroup: 'AB-',
    phone: '+91 98765 43212',
    email: 'dsp.patient@email.com',
    allergies: ['Latex', 'Iodine'],
    medicalHistory: [
      {
        date: '2026-03-05',
        doctor: 'Dr. Durga Bhavani',
        diagnosis: 'Dermatitis',
        reason: 'Skin allergic reaction treatment',
      },
    ],
    automatedReminders: true,
    avatar: 'DS',
  },
  {
    id: 4,
    name: 'Uday Gandhi',
    patientId: 'MED-2024-004',
    age: 55,
    gender: 'Male',
    bloodGroup: 'A-',
    phone: '+91 98765 43213',
    email: 'uday.gandhi@email.com',
    allergies: [],
    medicalHistory: [
      {
        date: '2026-02-28',
        doctor: 'Dr. Harish Kumar',
        diagnosis: 'High Cholesterol',
        reason: 'Lipid profile check and cardiac assessment',
      },
      {
        date: '2025-11-10',
        doctor: 'Dr. DeepaVignesh',
        diagnosis: 'Blood Pressure Check',
        reason: 'Annual health checkup',
      },
    ],
    automatedReminders: true,
    avatar: 'UG',
  },
  {
    id: 5,
    name: 'Sushant Ambekar',
    patientId: 'MED-2024-005',
    age: 38,
    gender: 'Male',
    bloodGroup: 'O-',
    phone: '+91 98765 43214',
    email: 'sushant.ambekar@email.com',
    allergies: ['Sulfa', 'Codeine'],
    medicalHistory: [
      {
        date: '2026-03-08',
        doctor: 'Dr. Ritvik Reddy',
        diagnosis: 'Asthma Management',
        reason: 'Respiratory assessment and inhaler review',
      },
    ],
    automatedReminders: false,
    avatar: 'SA',
  },
];

// Blood Group Color Mapping
const bloodGroupColors = {
  'O+': 'danger',
  'O-': 'dark',
  'A+': 'warning',
  'A-': 'secondary',
  'B+': 'primary',
  'B-': 'info',
  'AB+': 'success',
  'AB-': 'purple-custom',
};

// Search & Filter Bar Component
const SearchFilterBar = ({ searchTerm, setSearchTerm, filterBloodGroup, setFilterBloodGroup, filterGender, setFilterGender }) => {
  const bloodGroups = ['All', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const genders = ['All', 'Male', 'Female', 'Other'];

  return (
    <Card className="mb-4 shadow-sm sticky-top" style={{ zIndex: 10, top: '90px' }}>
      <Card.Body>
        <Row className="g-3 align-items-center">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="bg-light border-0">
                <Search size={18} className="text-secondary" />
              </InputGroup.Text>
              <FormControl
                placeholder="Search patient by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          </Col>

          <Col md={3}>
            <Form.Select
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
              className="border-0 shadow-sm"
            >
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  Blood Group: {bg}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="border-0 shadow-sm"
            >
              {genders.map((gender) => (
                <option key={gender} value={gender}>
                  Gender: {gender}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Patient Detail View Component - Full Page for Viewing & Editing
const PatientDetailView = ({ patient, onBack, patients, setPatients }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    phone: patient.phone,
    email: patient.email,
    allergies: patient.allergies.join(', '),
    automatedReminders: patient.automatedReminders,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedPatients = patients.map((p) =>
      p.id === patient.id
        ? {
            ...p,
            name: editData.name,
            age: editData.age,
            gender: editData.gender,
            bloodGroup: editData.bloodGroup,
            phone: editData.phone,
            email: editData.email,
            allergies: editData.allergies
              .split(',')
              .map((a) => a.trim())
              .filter((a) => a),
            automatedReminders: editData.automatedReminders,
          }
        : p
    );
    setPatients(updatedPatients);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Container fluid className="py-4">
      {/* Back Button & Header */}
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onBack}
          className="mb-3 d-flex align-items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Patients
        </Button>

        <Row className="align-items-center mb-3">
          <Col>
            <div className="d-flex align-items-center gap-3">
              <div className="avatar-circle-lg bg-primary text-white">
                {patient.avatar}
              </div>
              <div>
                <h2 className="fw-bold mb-0">{editData.name}</h2>
                <p className="text-muted mb-0">
                  <code>{patient.patientId}</code>
                </p>
              </div>
            </div>
          </Col>
          <Col className="text-end">
            {!isEditing ? (
              <Button
                variant="primary"
                onClick={handleEdit}
                className="d-flex align-items-center gap-2 ms-auto"
              >
                <Edit2 size={16} />
                Edit Information
              </Button>
            ) : (
              <div className="d-flex gap-2 ms-auto justify-content-end">
                <Button
                  variant="outline-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  onClick={handleSave}
                  className="d-flex align-items-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* Critical Allergy Alert */}
      {editData.allergies && (
        <Alert variant="danger" className="mb-4 d-flex align-items-center">
          <AlertCircle size={24} className="me-3 flex-shrink-0" />
          <div>
            <strong className="d-block">⚠ ALLERGIES</strong>
            <span>{editData.allergies || 'No known allergies'}</span>
          </div>
        </Alert>
      )}

      <Row className="g-4">
        {/* Left Column - Patient Information */}
        <Col lg={7}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="fw-bold mb-0">Personal Information</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Full Name</Form.Label>
                  {isEditing ? (
                    <Form.Control
                      value={editData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                  ) : (
                    <div className="form-control-plaintext fw-bold">{editData.name}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Patient ID</Form.Label>
                  <div className="form-control-plaintext">
                    <code>{patient.patientId}</code>
                  </div>
                </Form.Group>

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Age</Form.Label>
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          value={editData.age}
                          onChange={(e) => handleChange('age', parseInt(e.target.value))}
                        />
                      ) : (
                        <div className="form-control-plaintext">{editData.age} years</div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Gender</Form.Label>
                      {isEditing ? (
                        <Form.Select
                          value={editData.gender}
                          onChange={(e) => handleChange('gender', e.target.value)}
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </Form.Select>
                      ) : (
                        <div className="form-control-plaintext">{editData.gender}</div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Blood Group</Form.Label>
                      {isEditing ? (
                        <Form.Select
                          value={editData.bloodGroup}
                          onChange={(e) => handleChange('bloodGroup', e.target.value)}
                        >
                          {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                            <option key={bg}>{bg}</option>
                          ))}
                        </Form.Select>
                      ) : (
                        <div className="form-control-plaintext">
                          <Badge bg={bloodGroupColors[editData.bloodGroup]}>
                            {editData.bloodGroup}
                          </Badge>
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="fw-bold mb-0">Contact Information</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold d-flex align-items-center gap-2">
                    <Phone size={16} className="text-primary" />
                    Phone Number
                  </Form.Label>
                  {isEditing ? (
                    <Form.Control
                      value={editData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  ) : (
                    <div className="form-control-plaintext">{editData.phone}</div>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.Label className="fw-bold d-flex align-items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    Email Address
                  </Form.Label>
                  {isEditing ? (
                    <Form.Control
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  ) : (
                    <div className="form-control-plaintext">{editData.email}</div>
                  )}
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          {/* Medical Information */}
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="fw-bold mb-0">Medical Information</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Label className="fw-bold d-flex align-items-center gap-2">
                  <AlertCircle size={16} className="text-danger" />
                  Known Allergies
                </Form.Label>
                {isEditing ? (
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter allergies separated by commas"
                    value={editData.allergies}
                    onChange={(e) => handleChange('allergies', e.target.value)}
                  />
                ) : (
                  <div className="form-control-plaintext">
                    {editData.allergies || 'No known allergies'}
                  </div>
                )}
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Medical History & Settings */}
        <Col lg={5}>
          {/* Automated Reminders */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="fw-bold mb-0">Notification Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Check
                  type="switch"
                  id="reminders-switch-detail"
                  label={
                    <span>
                      <strong>Automated Reminders</strong>
                      <br />
                      <small className="text-muted">SMS/Email notifications</small>
                    </span>
                  }
                  checked={editData.automatedReminders}
                  onChange={(e) => handleChange('automatedReminders', e.target.checked)}
                  disabled={!isEditing}
                />
              </Form.Group>
              <div className="mt-3 p-3 bg-light rounded">
                <small className="text-muted">
                  {editData.automatedReminders
                    ? '✓ Patient will receive appointment reminders'
                    : '✗ Reminders are disabled'}
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Medical History Timeline */}
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="fw-bold mb-0">Medical History</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup className="timeline-group">
                {patient.medicalHistory.map((visit, index) => (
                  <ListGroup.Item key={index} className="border-0 ps-0 mb-3">
                    <div className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="fw-bold d-block">{visit.diagnosis}</span>
                            <small className="text-muted">{visit.date}</small>
                          </div>
                        </div>
                        <small className="d-block mb-2">
                          <strong>👨‍⚕️ Dr.:</strong> {visit.doctor}
                        </small>
                        <OverlayTrigger
                          placement="left"
                          overlay={<Tooltip id={`tooltip-${index}`}>{visit.reason}</Tooltip>}
                        >
                          <small className="text-primary cursor-pointer">
                            📋 Click for details
                          </small>
                        </OverlayTrigger>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              {patient.medicalHistory.length === 0 && (
                <p className="text-muted text-center py-4">No medical history records</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Main Component
const AdminPatients = () => {
  const [patients, setPatients] = useState(patientsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  // Filter patients
  let filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodGroup = filterBloodGroup === 'All' || patient.bloodGroup === filterBloodGroup;
    const matchesGender = filterGender === 'All' || patient.gender === filterGender;
    return matchesSearch && matchesBloodGroup && matchesGender;
  });

  const handleViewHistory = (patient) => {
    setSelectedPatient(patient);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  const toggleRowExpand = (patientId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [patientId]: !prev[patientId],
    }));
  };

  // Show detail view if patient selected
  if (selectedPatient) {
    return (
      <Layout>
        <PatientDetailView
          patient={selectedPatient}
          onBack={handleBackToList}
          patients={patients}
          setPatients={setPatients}
        />
      </Layout>
    );
  }

  // Show patient list
  return (
    <Layout>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold mb-1">Patient Management</h2>
          </Col>
          <Col className="text-end">
            <Button variant="primary" className="gap-2 d-flex align-items-center justify-content-center ms-auto">
              <Plus size={20} />
              Add Patient
            </Button>
          </Col>
        </Row>

        {/* Search & Filter Bar */}
        <SearchFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterBloodGroup={filterBloodGroup}
          setFilterBloodGroup={setFilterBloodGroup}
          filterGender={filterGender}
          setFilterGender={setFilterGender}
        />

        {/* Patients Table */}
        <Card className="shadow-sm mb-4">
          <div className="table-responsive">
            <Table hover className="mb-0" align="middle">
              <thead className="table-light">
                <tr>
                  <th>Profile</th>
                  <th>Patient ID</th>
                  <th>Age/Gender</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <React.Fragment key={patient.id}>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle-small bg-primary text-white">
                            {patient.avatar}
                          </div>
                          <div>
                            <div className="fw-bold">{patient.name}</div>
                            <small className="text-muted">{patient.gender}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="text-muted">{patient.patientId}</code>
                      </td>
                      <td>
                        <span>{patient.age} yrs / {patient.gender}</span>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewHistory(patient)}
                          className="me-2"
                        >
                          <Eye size={16} className="me-1" />
                          View & Edit
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => toggleRowExpand(patient.id)}
                        >
                          {expandedRows[patient.id] ? '▼' : '▶'}
                        </Button>
                      </td>
                    </tr>
                    {/* Expanded Row - Quick Preview */}
                    <tr>
                      <td colSpan="6" className="p-0">
                        <Collapse in={expandedRows[patient.id]}>
                          <Card className="border-0 bg-light m-2">
                            <Card.Body>
                              <Row>
                                <Col md={6}>
                                  <strong>Contact:</strong>
                                  <div>{patient.phone}</div>
                                  <div>{patient.email}</div>
                                </Col>
                                <Col md={6}>
                                  {patient.allergies.length > 0 && (
                                    <div>
                                      <strong className="text-danger">⚠ Allergies:</strong>
                                      <div>{patient.allergies.join(', ')}</div>
                                    </div>
                                  )}
                                  {patient.allergies.length === 0 && (
                                    <div className="text-muted">No known allergies</div>
                                  )}
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Collapse>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        {filteredPatients.length === 0 && (
          <div className="text-center py-5">
            <Search size={48} className="text-muted mb-3" />
            <h5 className="text-muted">No patients found</h5>
            <p className="text-muted small">Try adjusting your search or filters</p>
          </div>
        )}
      </Container>
    </Layout>
  );
};

export default AdminPatients;
