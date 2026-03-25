````markdown
# AdminSettings Complete Implementation Guide

## 📚 Table of Contents

1. [Overview](#overview)
2. [Component Details](#component-details)
3. [Styling System](#styling-system)
4. [Integration Guide](#integration-guide)
5. [Customization](#customization)
6. [Troubleshooting](#troubleshooting)
7. [API Reference](#api-reference)

---

## Overview

The AdminSettings module is a comprehensive system settings and RBAC management interface for healthcare clinic administrators. It provides four main sections:

- **Profile**: Admin account management and security settings
- **Clinic Info**: Healthcare facility information and licensing
- **Notifications**: Centralized notification preference management
- **RBAC**: Role-based access control for staff management

### Key Specifications

- **React Version**: 18.2.0
- **UI Library**: React-Bootstrap 2.10.10
- **Styling**: CSS3 with Bootstrap 5.3.8
- **Icons**: Lucide React (v0.294.0)
- **State Management**: React Hooks (useState)
- **Responsive**: Mobile-first design with 3 breakpoints

---

## Component Details

### AdminSettings.jsx Structure

#### Imports Section
```jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, ... } from 'react-bootstrap';
import { User, Building2, Bell, Shield, Upload, ... } from 'lucide-react';
import '../styles/AdminSettings.css';
```

#### State Variables
```javascript
const [activeSection, setActiveSection] = useState('profile');
const [saving, setSaving] = useState(false);

// Profile State
const [profileData, setProfileData] = useState({
  adminName: 'Dr. Admin',
  email: 'admin@medico.com',
  phone: '+91 98765 43200',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Clinic Info State
const [clinicData, setClinicData] = useState({
  clinicName: 'Medico Healthcare Clinic',
  address: '123 Medical Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  zipCode: '400001',
  phone: '+91 98765 43201',
  email: 'clinic@medico.com',
  licenseNumber: 'MED-2024-001',
  registrationDate: '2024-01-15'
});

// Notifications State
const [notifications, setNotifications] = useState([
  { id: 'appointments', title: 'Appointment Reminders', description: 'Send reminders to patients', enabled: true },
  { id: 'cancellations', title: 'Cancellation Alerts', description: 'Notify on appointment cancellations', enabled: true },
  { id: 'reports', title: 'Report Updates', description: 'Send new medical report notifications', enabled: true },
  { id: 'revenue', title: 'Revenue Reports', description: 'Daily revenue and financial updates', enabled: true },
  { id: 'staff', title: 'Staff Updates', description: 'Notify about staff activities', enabled: false }
]);

// RBAC State
const [permissions, setPermissions] = useState({
  Admin: [true, true, true, true, true, true, true, true],
  Doctor: [false, true, false, true, false, false, false, false],
  Receptionist: [false, true, false, true, false, false, false, false]
});

// Logo Preview State
const [logoPreview, setLogoPreview] = useState(null);
const [showPassword, setShowPassword] = useState(false);
const [expandSecurity, setExpandSecurity] = useState(false);
```

#### Event Handlers

##### Profile Handlers
```javascript
const handleProfileChange = (e) => {
  const { name, value } = e.target;
  setProfileData({...profileData, [name]: value});
};

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
```

##### Clinic Handlers
```javascript
const handleClinicChange = (e) => {
  const { name, value } = e.target;
  setClinicData({...clinicData, [name]: value});
};
```

##### Notification Handlers
```javascript
const handleNotificationToggle = (id) => {
  setNotifications(
    notifications.map(n =>
      n.id === id ? {...n, enabled: !n.enabled} : n
    )
  );
};
```

##### RBAC Handlers
```javascript
const handlePermissionToggle = (role, index) => {
  const newPerms = [...permissions[role]];
  newPerms[index] = !newPerms[index];
  setPermissions({...permissions, [role]: newPerms});
};

const handleMasterToggle = (role) => {
  const allEnabled = permissions[role].every(p => p);
  const newPerms = new Array(8).fill(!allEnabled);
  setPermissions({...permissions, [role]: newPerms});
};
```

##### Save Handler
```javascript
const handleSave = () => {
  setSaving(true);
  
  // Simulate API call
  setTimeout(() => {
    setSaving(false);
    alert('Settings saved successfully!');
    
    // In production, replace with actual API call:
    // const response = await fetch('/api/admin/save-settings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(getCurrentSectionData())
    // });
  }, 1500);
};
```

#### Render Functions

##### renderSidebar()
```jsx
return (
  <ListGroup variant="flush">
    {['profile', 'clinic', 'notifications', 'rbac'].map(section => (
      <ListGroup.Item
        key={section}
        onClick={() => setActiveSection(section)}
        className={`sidebar-item ${activeSection === section ? 'active' : ''}`}
      >
        <Icon className="me-2" size={20} />
        {sectionLabel}
      </ListGroup.Item>
    ))}
  </ListGroup>
);
```

##### renderProfileSection()
```jsx
return (
  <Card className="settings-card">
    <Card.Header>Profile Settings</Card.Header>
    <Card.Body>
      {/* Logo Upload */}
      <div className="logo-upload-zone">
        <input type="file" accept="image/*" onChange={handleLogoUpload} />
        {logoPreview && <img src={logoPreview} className="profile-image" />}
      </div>
      
      {/* Personal Info Form */}
      <Form>
        <FloatingLabel label="Admin Name">
          <Form.Control
            name="adminName"
            value={profileData.adminName}
            onChange={handleProfileChange}
          />
        </FloatingLabel>
        {/* More fields... */}
      </Form>
      
      {/* Collapsible Security */}
      <Collapse in={expandSecurity}>
        <div className="security-section">
          {/* Password fields */}
        </div>
      </Collapse>
      
      <Button onClick={handleSave} disabled={saving}>
        {saving && <Spinner animation="border" size="sm" />}
        Save Profile
      </Button>
    </Card.Body>
  </Card>
);
```

##### renderClinicSection()
```jsx
return (
  <Card className="settings-card">
    <Card.Header>Clinic Information</Card.Header>
    <Card.Body>
      <Form>
        {/* Clinic name field */}
        {/* Address fields */}
        {/* License fields (read-only) */}
      </Form>
      <Button onClick={handleSave} disabled={saving}>
        Save Clinic Info
      </Button>
    </Card.Body>
  </Card>
);
```

##### renderNotificationsSection()
```jsx
return (
  <Card className="settings-card">
    <Card.Header>Notification Preferences</Card.Header>
    <Card.Body>
      <ListGroup flush>
        {notifications.map(notif => (
          <ListGroup.Item key={notif.id} className="notification-item">
            <div>
              <strong>{notif.title}</strong>
              <small className="text-muted d-block">{notif.description}</small>
            </div>
            <Form.Check
              type="switch"
              checked={notif.enabled}
              onChange={() => handleNotificationToggle(notif.id)}
              className="ms-auto"
            />
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Button onClick={handleSave} disabled={saving}>
        Save Preferences
      </Button>
    </Card.Body>
  </Card>
);
```

##### renderRBACSection()
```jsx
return (
  <Card className="settings-card">
    <Card.Header>Staff Roles & Permissions</Card.Header>
    <Card.Body>
      <Alert variant="info">
        <AlertIcon size={20} />
        Permission changes take effect immediately
      </Alert>
      
      <Table bordered hover className="permission-table">
        <thead>
          <tr>
            <th>Permission</th>
            {['Admin', 'Doctor', 'Receptionist'].map(role => (
              <th key={role} className="text-center">
                <Form.Check
                  type="checkbox"
                  label={role}
                  checked={permissions[role].every(p => p)}
                  onChange={() => handleMasterToggle(role)}
                  className="master-toggle"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Permission rows */}
        </tbody>
      </Table>
      
      <Button onClick={handleSave} disabled={saving}>
        Save Permissions
      </Button>
    </Card.Body>
  </Card>
);
```

#### Main Render
```jsx
return (
  <Container fluid className="admin-settings">
    <Row className="settings-container">
      <Col md={3} className="sticky-sidebar-wrapper">
        {renderSidebar()}
      </Col>
      <Col md={9} className="settings-content">
        <slideInRight animation>
          {activeSection === 'profile' && renderProfileSection()}
          {activeSection === 'clinic' && renderClinicSection()}
          {activeSection === 'notifications' && renderNotificationsSection()}
          {activeSection === 'rbac' && renderRBACSection()}
        </slideInRight>
      </Col>
    </Row>
  </Container>
);
```

---

## Styling System

### AdminSettings.css Architecture

#### Layout Classes
```css
.admin-settings {
  padding: 2rem;
  background-color: #f9fafb;
  min-height: 100vh;
}

.settings-container {
  gap: 2rem;
}

.sticky-sidebar-wrapper {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.settings-content {
  animation: slideInRight 0.3s ease-out;
}
```

#### Sidebar Styling
```css
.list-group {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.sidebar-item {
  cursor: pointer;
  border-left: 4px solid transparent;
  padding: 12px 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.sidebar-item:hover {
  background-color: #f3f4f6;
  transform: translateX(4px);
}

.sidebar-item.active {
  background-color: #eff6ff;
  border-left-color: #2563eb;
  color: #2563eb;
}
```

#### Card Styling
```css
.settings-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  margin-bottom: 2rem;
}

.settings-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.settings-card .card-header {
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  padding: 16px;
}

.settings-card .card-body {
  padding: 24px;
}
```

#### Form Controls
```css
.form-floating > label {
  color: #6b7280;
}

.form-control {
  border-color: #e5e7eb;
  border-radius: 6px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-control:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}
```

#### Logo Upload Zone
```css
.logo-upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  background-color: #fafbfc;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logo-upload-zone:hover {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.logo-upload-zone input[type="file"] {
  display: none;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #dbeafe;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}
```

#### Notification Items
```css
.notification-item {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-item strong {
  display: block;
  margin-bottom: 4px;
  color: #1f2937;
}

.notification-item small {
  color: #6b7280;
}
```

#### RBAC Table
```css
.permission-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.permission-table thead {
  background-color: #f3f4f6;
}

.permission-table thead th {
  border-color: #d1d5db;
  font-weight: 600;
  color: #374151;
  padding: 12px;
  text-align: center;
}

.permission-table tbody td {
  border-color: #e5e7eb;
  padding: 12px;
}

.permission-table tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

.permission-table tbody tr:hover {
  background-color: #f0f9ff;
  box-shadow: inset 0 0 12px rgba(37, 99, 235, 0.05);
}

.permission-cell {
  text-align: center;
}

.permission-checkbox {
  cursor: pointer;
  width: 20px;
  height: 20px;
  accent-color: #10b981;
}

.master-toggle {
  font-weight: 600;
  accent-color: #2563eb;
}
```

#### Button Styling
```css
.btn-primary {
  background-color: #2563eb;
  border-color: #2563eb;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background-color: #9ca3af;
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary .spinner-border {
  margin-right: 8px;
}
```

#### Animations
```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.settings-content {
  animation: slideInRight 0.3s ease-out;
}

.settings-card {
  animation: fadeIn 0.2s ease-out;
}
```

#### Responsive Design
```css
/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
  .sticky-sidebar-wrapper {
    position: relative;
    top: 0;
    margin-bottom: 2rem;
  }
  
  .settings-container {
    gap: 1rem;
  }
  
  .settings-card .card-body {
    padding: 16px;
  }
}

/* Mobile (<768px) */
@media (max-width: 768px) {
  .admin-settings {
    padding: 1rem;
  }
  
  .list-group {
    display: flex;
    flex-direction: row;
    margin-bottom: 1rem;
    overflow-x: auto;
  }
  
  .sidebar-item {
    flex: 0 0 auto;
    border-left: none;
    border-bottom: 4px solid transparent;
  }
  
  .sidebar-item.active {
    border-left: none;
    border-bottom-color: #2563eb;
  }
  
  .logo-upload-zone {
    padding: 16px;
  }
  
  .profile-image {
    width: 100px;
    height: 100px;
  }
  
  .settings-card .card-body {
    padding: 12px;
  }
}
```

---

## Integration Guide

### Step 1: Route Configuration
Update `src/App.jsx`:
```jsx
import AdminSettings from './pages/Admin/AdminSettings';

<Route path="/admin/settings" element={<AdminSettings />} />
```

### Step 2: Sidebar Navigation
The sidebar already has a "Settings" item linking to `/admin/settings`.

### Step 3: Backend Integration

Replace the mock `handleSave()` function with actual API calls:

```javascript
const handleSave = async () => {
  setSaving(true);
  try {
    const endpoint = activeSection === 'profile' ? '/api/admin/profile'
                   : activeSection === 'clinic' ? '/api/clinic/info'
                   : activeSection === 'notifications' ? '/api/notifications'
                   : '/api/rbac/permissions';
    
    const data = activeSection === 'profile' ? profileData
               : activeSection === 'clinic' ? clinicData
               : activeSection === 'notifications' ? notifications
               : permissions;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      alert('Settings saved successfully!');
    } else {
      alert('Error saving settings. Please try again.');
    }
  } catch (error) {
    console.error('Save error:', error);
    alert('Error saving settings. Please try again.');
  } finally {
    setSaving(false);
  }
};
```

### Step 4: Load Initial Data
Add useEffect to fetch data on mount:

```javascript
useEffect(() => {
  const fetchSettings = async () => {
    try {
      const [profileRes, clinicRes, notifRes, rbacRes] = await Promise.all([
        fetch('/api/admin/profile'),
        fetch('/api/clinic/info'),
        fetch('/api/notifications'),
        fetch('/api/rbac/permissions')
      ]);
      
      if (profileRes.ok) setProfileData(await profileRes.json());
      if (clinicRes.ok) setClinicData(await clinicRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (rbacRes.ok) setPermissions(await rbacRes.json());
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  fetchSettings();
}, []);
```

---

## Customization

### Add New Notification Type
```javascript
// In AdminSettings.jsx, update notification state initialization:
const [notifications, setNotifications] = useState([
  // ... existing notifications
  {
    id: 'newNotification',
    title: 'New Notification Title',
    description: 'Description of when this triggers',
    enabled: false
  }
]);
```

### Add New Permission
```javascript
// Update PERMISSIONS list and DEFAULT_PERMISSIONS arrays
const PERMISSIONS = [
  'View Financials',
  'Edit Patient Records',
  // ... existing permissions
  'New Permission'
];

const DEFAULT_PERMISSIONS = {
  Admin: [true, true, true, true, true, true, true, true, true],
  Doctor: [false, true, false, true, false, false, false, false, false],
  Receptionist: [false, true, false, true, false, false, false, false, false]
};
```

### Change Color Theme
```css
/* In AdminSettings.css, update color variables */
:root {
  --primary-color: #2563eb;      /* Change to desired color */
  --success-color: #10b981;
  --danger-color: #ef4444;
  --gray-light: #f9fafb;
  --gray-medium: #e5e7eb;
  --gray-dark: #1f2937;
}
```

### Modify Logo Size
```css
.profile-image {
  width: 200px;    /* Change from 150px */
  height: 200px;
  border-radius: 50%;
}
```

### Add New Form Fields
```jsx
<FloatingLabel label="New Field Label">
  <Form.Control
    name="newFieldName"
    value={profileData.newFieldName}
    onChange={handleProfileChange}
    placeholder="Enter value"
  />
</FloatingLabel>
```

---

## Troubleshooting

### Logo Preview Not Showing
**Problem**: Logo upload zone doesn't display uploaded image.

**Solutions**:
1. Check FileReader implementation
2. Verify image file type (PNG, JPG, GIF supported)
3. Check browser console for errors
4. Verify CSS `.profile-image` styling

### Sidebar Not Sticky
**Problem**: Sidebar scrolls with content.

**Solutions**:
1. Check CSS `position: sticky; top: 2rem;` on `.sticky-sidebar-wrapper`
2. Verify parent container doesn't have `overflow: hidden`
3. Check z-index value if overlapping issues occur

### Responsive Not Working
**Problem**: Mobile layout not displaying correctly.

**Solutions**:
1. Verify viewport meta tag in `index.html`
2. Clear browser cache and reload
3. Check responsive breakpoints in CSS media queries
4. Test in actual mobile device or browser mobile mode

### Save Not Working
**Problem**: Save button doesn't trigger API call.

**Solutions**:
1. Check console for JavaScript errors
2. Verify API endpoint URL is correct
3. Check network tab in browser DevTools
4. Verify authentication token is being sent
5. Check CORS headers from backend

### Form Values Not Updating
**Problem**: Form input fields show old values.

**Solutions**:
1. Verify onChange handlers are attached to inputs
2. Check state variable names match in onChange
3. Verify default state values are set correctly
4. Clear browser cache and hard refresh

---

## API Reference

### Endpoint: POST /api/admin/profile
**Request**:
```json
{
  "adminName": "Dr. Admin",
  "email": "admin@medico.com",
  "phone": "+91 98765 43200",
  "newPassword": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "adminId": "ADM001",
    "adminName": "Dr. Admin",
    "updatedAt": "2024-03-25T10:30:00Z"
  }
}
```

### Endpoint: POST /api/clinic/info
**Request**:
```json
{
  "clinicName": "Medico Healthcare",
  "address": "123 Medical Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "phone": "+91 98765 43201",
  "email": "clinic@medico.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Clinic information updated",
  "data": {
    "clinicId": "CLI001",
    "clinicName": "Medico Healthcare"
  }
}
```

### Endpoint: POST /api/notifications
**Request**:
```json
{
  "appointments": true,
  "cancellations": true,
  "reports": true,
  "revenue": true,
  "staff": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Notification preferences updated"
}
```

### Endpoint: POST /api/rbac/permissions
**Request**:
```json
{
  "Admin": [true, true, true, true, true, true, true, true],
  "Doctor": [false, true, false, true, false, false, false, false],
  "Receptionist": [false, true, false, true, false, false, false, false]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Permissions updated successfully",
  "changedRoles": ["Admin", "Doctor"]
}
```

---

**Version**: 1.0.0
**Last Updated**: March 25, 2026
**Status**: Production Ready

````
