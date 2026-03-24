import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Form,
  Button,
  Collapse,
  Table,
  Badge,
  Spinner,
  OverlayTrigger,
  Tooltip,
  FloatingLabel,
} from 'react-bootstrap';
import {
  User,
  Building2,
  Bell,
  Lock,
  Shield,
  Upload,
  Save,
  Check,
  X,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import Layout from '../../components/Common/Layout';
import '../../styles/AdminSettings.css';

// Settings Sidebar Sections
const SIDEBAR_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'clinic', label: 'Clinic Info', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'rbac', label: 'Staff Roles', icon: Shield },
];

// Notification Settings Data
const NOTIFICATION_SETTINGS = [
  {
    id: 'appointments',
    title: 'Appointment Reminders',
    description: 'Send reminders to patients before scheduled appointments',
    enabled: true,
  },
  {
    id: 'cancellations',
    title: 'Cancellation Alerts',
    description: 'Notify staff when appointments are cancelled',
    enabled: true,
  },
  {
    id: 'reports',
    title: 'Daily Reports',
    description: 'Receive daily clinic performance reports',
    enabled: false,
  },
  {
    id: 'revenue',
    title: 'Revenue Updates',
    description: 'Get notified about payment received',
    enabled: true,
  },
  {
    id: 'staff',
    title: 'Staff Updates',
    description: 'Notifications about staff availability and updates',
    enabled: false,
  },
];

// RBAC Permissions Matrix
const RBAC_PERMISSIONS = [
  'View Financials',
  'Edit Patient Records',
  'Manage Staff',
  'View Reports',
  'Delete Appointments',
  'Manage Clinic Info',
  'Change System Settings',
  'View Audit Logs',
];

const RBAC_ROLES = ['Admin', 'Doctor', 'Receptionist'];

const DEFAULT_PERMISSIONS = {
  Admin: [true, true, true, true, true, true, true, true],
  Doctor: [false, true, false, true, false, false, false, false],
  Receptionist: [false, true, false, true, false, false, false, false],
};

// Profile Component
const ProfileSection = ({ saving, onSave }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [expandSecurity, setExpandSecurity] = useState(false);
  const [profileData, setProfileData] = useState({
    adminName: 'Dr. Admin',
    email: 'admin@medico.com',
    phone: '+91 98765 43200',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings-section">
      {/* Logo Upload Zone */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-light">
          <h5 className="fw-bold mb-0">Profile Picture</h5>
        </Card.Header>
        <Card.Body>
          <div className="logo-upload-zone">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
              id="logoInput"
            />
            {logoPreview ? (
              <div className="logo-preview">
                <img src={logoPreview} alt="Profile" className="profile-image" />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="change-btn"
                  onClick={() => document.getElementById('logoInput').click()}
                >
                  Change
                </Button>
              </div>
            ) : (
              <label htmlFor="logoInput" className="upload-label">
                <Upload size={32} className="text-primary mb-2" />
                <div className="fw-bold">Click to Upload</div>
                <small className="text-muted">PNG, JPG up to 5MB</small>
              </label>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Personal Information */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-light">
          <h5 className="fw-bold mb-0">Personal Information</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <FloatingLabel controlId="adminName" label="Admin Name" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Admin Name"
                value={profileData.adminName}
                onChange={(e) =>
                  setProfileData({ ...profileData, adminName: e.target.value })
                }
              />
            </FloatingLabel>

            <FloatingLabel controlId="email" label="Email Address" className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email Address"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </FloatingLabel>

            <FloatingLabel controlId="phone" label="Phone Number" className="mb-3">
              <Form.Control
                type="tel"
                placeholder="Phone Number"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </FloatingLabel>
          </Form>
        </Card.Body>
      </Card>

      {/* Security Section */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-light">
          <div
            className="d-flex align-items-center gap-2 cursor-pointer"
            onClick={() => setExpandSecurity(!expandSecurity)}
          >
            <Lock size={18} />
            <h5 className="fw-bold mb-0">Security</h5>
            <small className="ms-auto text-muted">{expandSecurity ? '▼' : '▶'}</small>
          </div>
        </Card.Header>
        <Collapse in={expandSecurity}>
          <Card.Body>
            <Form>
              <FloatingLabel
                controlId="currentPassword"
                label="Current Password"
                className="mb-3"
              >
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Current Password"
                  value={profileData.currentPassword}
                  onChange={(e) =>
                    setProfileData({ ...profileData, currentPassword: e.target.value })
                  }
                />
              </FloatingLabel>

              <FloatingLabel controlId="newPassword" label="New Password" className="mb-3">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={profileData.newPassword}
                  onChange={(e) =>
                    setProfileData({ ...profileData, newPassword: e.target.value })
                  }
                />
              </FloatingLabel>

              <FloatingLabel
                controlId="confirmPassword"
                label="Confirm Password"
                className="mb-3"
              >
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={profileData.confirmPassword}
                  onChange={(e) =>
                    setProfileData({ ...profileData, confirmPassword: e.target.value })
                  }
                />
              </FloatingLabel>

              <Form.Group>
                <Form.Check
                  type="checkbox"
                  label="Show passwords"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
              </Form.Group>
            </Form>
          </Card.Body>
        </Collapse>
      </Card>

      {/* Save Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Spinner animation="border" size="sm" />
            Saving...
          </>
        ) : (
          <>
            <Save size={18} />
            Save Profile Changes
          </>
        )}
      </Button>
    </div>
  );
};

// Clinic Info Component
const ClinicInfoSection = ({ saving, onSave }) => {
  const [clinicData, setClinicData] = useState({
    clinicName: 'Medico Healthcare Clinic',
    address: '123 Medical Street, Healthcare City',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    phone: '+91 98765 43200',
    email: 'clinic@medico.com',
    licenseNumber: 'MED-2024-001',
    registrationDate: '2024-01-15',
  });

  return (
    <div className="settings-section">
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-light">
          <h5 className="fw-bold mb-0">Clinic Information</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <FloatingLabel controlId="clinicName" label="Clinic Name" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Clinic Name"
                value={clinicData.clinicName}
                onChange={(e) => setClinicData({ ...clinicData, clinicName: e.target.value })}
              />
            </FloatingLabel>

            <FloatingLabel controlId="address" label="Street Address" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Street Address"
                value={clinicData.address}
                onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
              />
            </FloatingLabel>

            <Row className="mb-3">
              <Col md={6}>
                <FloatingLabel controlId="city" label="City">
                  <Form.Control
                    type="text"
                    placeholder="City"
                    value={clinicData.city}
                    onChange={(e) => setClinicData({ ...clinicData, city: e.target.value })}
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="state" label="State">
                  <Form.Control
                    type="text"
                    placeholder="State"
                    value={clinicData.state}
                    onChange={(e) => setClinicData({ ...clinicData, state: e.target.value })}
                  />
                </FloatingLabel>
              </Col>
            </Row>

            <FloatingLabel controlId="zipCode" label="Zip Code" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Zip Code"
                value={clinicData.zipCode}
                onChange={(e) => setClinicData({ ...clinicData, zipCode: e.target.value })}
              />
            </FloatingLabel>

            <FloatingLabel controlId="phone" label="Phone Number" className="mb-3">
              <Form.Control
                type="tel"
                placeholder="Phone Number"
                value={clinicData.phone}
                onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
              />
            </FloatingLabel>

            <FloatingLabel controlId="email" label="Email Address" className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email Address"
                value={clinicData.email}
                onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
              />
            </FloatingLabel>

            <FloatingLabel controlId="licenseNumber" label="License Number" className="mb-3">
              <Form.Control
                type="text"
                placeholder="License Number"
                value={clinicData.licenseNumber}
                onChange={(e) =>
                  setClinicData({ ...clinicData, licenseNumber: e.target.value })
                }
                disabled
              />
            </FloatingLabel>

            <FloatingLabel controlId="registrationDate" label="Registration Date" className="mb-3">
              <Form.Control
                type="date"
                value={clinicData.registrationDate}
                onChange={(e) =>
                  setClinicData({ ...clinicData, registrationDate: e.target.value })
                }
                disabled
              />
            </FloatingLabel>
          </Form>
        </Card.Body>
      </Card>

      <Button
        variant="primary"
        size="lg"
        className="w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Spinner animation="border" size="sm" />
            Saving...
          </>
        ) : (
          <>
            <Save size={18} />
            Save Clinic Changes
          </>
        )}
      </Button>
    </div>
  );
};

// Notifications Component
const NotificationsSection = ({ saving, onSave }) => {
  const [notifications, setNotifications] = useState(NOTIFICATION_SETTINGS);

  const toggleNotification = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, enabled: !notif.enabled } : notif))
    );
  };

  return (
    <div className="settings-section">
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-light">
          <h5 className="fw-bold mb-0">Notification Center</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <ListGroup flush>
            {notifications.map((notif) => (
              <ListGroup.Item key={notif.id} className="notification-item">
                <div className="d-flex align-items-start gap-3 w-100">
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">{notif.title}</h6>
                    <p className="text-muted small mb-0">{notif.description}</p>
                  </div>
                  <Form.Check
                    type="switch"
                    checked={notif.enabled}
                    onChange={() => toggleNotification(notif.id)}
                    className="ms-auto"
                  />
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      <Button
        variant="primary"
        size="lg"
        className="w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Spinner animation="border" size="sm" />
            Saving...
          </>
        ) : (
          <>
            <Save size={18} />
            Save Notification Settings
          </>
        )}
      </Button>
    </div>
  );
};

// RBAC Component
const RBACSection = ({ saving, onSave }) => {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  const togglePermission = (role, index) => {
    setPermissions((prev) => {
      const newPermissions = { ...prev };
      newPermissions[role][index] = !newPermissions[role][index];
      return newPermissions;
    });
  };

  const toggleAllPermissions = (role) => {
    setPermissions((prev) => {
      const newPermissions = { ...prev };
      const allEnabled = newPermissions[role].every((p) => p);
      newPermissions[role] = newPermissions[role].map(() => !allEnabled);
      return newPermissions;
    });
  };

  return (
    <div className="settings-section">
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-light">
          <h5 className="fw-bold mb-0">Role-Based Access Control (RBAC)</h5>
          <small className="text-muted">Define permissions for each staff role</small>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table bordered hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40%' }}>Permission</th>
                  {RBAC_ROLES.map((role) => (
                    <th key={role} className="text-center permission-header">
                      <div className="fw-bold">{role}</div>
                      <Form.Check
                        type="checkbox"
                        checked={permissions[role].every((p) => p)}
                        onChange={() => toggleAllPermissions(role)}
                        className="mt-2"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RBAC_PERMISSIONS.map((permission, index) => (
                  <tr key={index}>
                    <td className="fw-bold">
                      <OverlayTrigger
                        placement="right"
                        overlay={
                          <Tooltip id={`tooltip-${index}`}>
                            {permission} permission
                          </Tooltip>
                        }
                      >
                        <span className="d-flex align-items-center gap-2 cursor-pointer">
                          <Info size={14} className="text-info" />
                          {permission}
                        </span>
                      </OverlayTrigger>
                    </td>
                    {RBAC_ROLES.map((role) => (
                      <td key={role} className="text-center permission-cell">
                        <Form.Check
                          type="checkbox"
                          checked={permissions[role][index]}
                          onChange={() => togglePermission(role, index)}
                          className="d-flex justify-content-center"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <div className="info-box mb-4">
        <Info size={16} className="text-info me-2" />
        <span className="text-muted small">
          Changes to permissions will affect all users in these roles immediately upon save.
        </span>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Spinner animation="border" size="sm" />
            Saving...
          </>
        ) : (
          <>
            <Save size={18} />
            Save RBAC Changes
          </>
        )}
      </Button>
    </div>
  );
};

// Sidebar Component
const SettingsSidebar = ({ activeSection, setActiveSection }) => {
  return (
    <ListGroup className="sticky-sidebar">
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <ListGroup.Item
            key={item.id}
            className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
            role="button"
          >
            <Icon size={18} className="me-2" />
            <span>{item.label}</span>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

// Main Component
const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1500);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection saving={saving} onSave={handleSave} />;
      case 'clinic':
        return <ClinicInfoSection saving={saving} onSave={handleSave} />;
      case 'notifications':
        return <NotificationsSection saving={saving} onSave={handleSave} />;
      case 'rbac':
        return <RBACSection saving={saving} onSave={handleSave} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="admin-settings-bg">
        <Container fluid className="py-4">
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <h2 className="fw-bold mb-1">System Settings</h2>
            </Col>
          </Row>

          {/* Settings Layout */}
          <Row className="g-4">
            {/* Sidebar */}
            <Col md={3}>
              <SettingsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            </Col>

            {/* Content Area */}
            <Col md={9}>
              <div className="settings-content">{renderContent()}</div>
            </Col>
          </Row>
        </Container>
      </div>
    </Layout>
  );
};

export default AdminSettings;
