````markdown
# AdminSettings Comprehensive Guide

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Component Overview](#component-overview)
3. [Features Breakdown](#features-breakdown)
4. [Code Structure](#code-structure)
5. [Customization](#customization)
6. [API Integration](#api-integration)
7. [Security Considerations](#security-considerations)
8. [Performance Tips](#performance-tips)

---

## Quick Start

### Access the Page
Navigate to: `http://localhost:5173/admin/settings`

### Or Use Sidebar
1. Go to Admin Dashboard
2. Click **Settings** in the left sidebar
3. AdminSettings page loads automatically

### File Locations
- **Component**: `src/pages/Admin/AdminSettings.jsx`
- **Styles**: `src/styles/AdminSettings.css`
- **Route**: Configured in `src/App.jsx`

---

## Component Overview

### What This Component Does

AdminSettings provides a centralized hub for system administration with four major functional areas:

```
AdminSettings Component
├── Profile Section (Personal account management)
├── Clinic Info Section (Healthcare facility details)
├── Notifications Section (Communication preferences)
└── RBAC Section (Staff role permissions)
```

### Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | Component framework |
| React-Bootstrap | 2.10.10 | UI components |
| Bootstrap | 5.3.8 | CSS framework |
| Lucide React | 0.294.0 | Icons |
| CSS3 | Native | Styling and animations |

### Component Size

```
AdminSettings.jsx: ~600 lines
AdminSettings.css: ~600 lines
Total: ~1200 lines
```

---

## Features Breakdown

### 1. Profile Section 🧑‍💼

**Purpose**: Manage admin account and security

**Components Used**:
- Card (container)
- Form.Floating (input fields)
- Button (action trigger)
- Collapse (security fields)
- Icon inputs (logo, password)

**Key Features**:

#### Logo Upload Zone
```jsx
<div className="logo-upload-zone">
  <label htmlFor="logoUpload">
    Click to upload clinic logo
  </label>
  <input
    id="logoUpload"
    type="file"
    accept="image/*"
    onChange={handleLogoUpload}
  />
  {logoPreview && (
    <img src={logoPreview} className="profile-image" />
  )}
</div>
```

**Styling Highlights**:
- Dashed border to indicate clickable area
- Light blue background on hover
- Circular image preview with gradient border
- Responsive sizing (150px on desktop, 100px on mobile)

#### Personal Information Form
```jsx
<Form>
  <FloatingLabel label="Admin Name">
    <Form.Control
      name="adminName"
      value={profileData.adminName}
      onChange={handleProfileChange}
    />
  </FloatingLabel>
  
  <FloatingLabel label="Email">
    <Form.Control
      name="email"
      type="email"
      value={profileData.email}
      onChange={handleProfileChange}
    />
  </FloatingLabel>
  
  <FloatingLabel label="Phone">
    <Form.Control
      name="phone"
      value={profileData.phone}
      onChange={handleProfileChange}
    />
  </FloatingLabel>
</Form>
```

**Features**:
- Floating labels for modern look
- Automatic focus styling
- Phone format guidance
- Email validation ready

#### Collapsible Security Section
```jsx
<Button
  onClick={() => setExpandSecurity(!expandSecurity)}
  variant="outline-secondary"
  size="sm"
>
  {expandSecurity ? '▼ Hide' : '▶ Change Password'}
</Button>

<Collapse in={expandSecurity}>
  <div className="security-section">
    <Form.FloatingLabel label="Current Password">
      {/* Current password field */}
    </Form.FloatingLabel>
    
    <Form.FloatingLabel label="New Password">
      {/* New password field */}
    </Form.FloatingLabel>
    
    <Form.FloatingLabel label="Confirm Password">
      {/* Confirm password field */}
    </Form.FloatingLabel>
    
    <Form.Check
      type="checkbox"
      label="Show Password"
      onChange={() => setShowPassword(!showPassword)}
    />
  </div>
</Collapse>
```

**Security Benefits**:
- Passwords hidden by default (sensitive information)
- Show/hide toggle for user convenience
- Separate confirmation field (prevents typos)
- Collapse keeps UI clean

---

### 2. Clinic Info Section 🏥

**Purpose**: Store and manage healthcare facility information

**Form Fields**:
```jsx
Clinic Name
Address
City
State
Zip Code
Phone Number
Email
License Number (read-only)
Registration Date (read-only)
```

**Read-Only Fields**:
```jsx
<Form.Control
  name="licenseNumber"
  value={clinicData.licenseNumber}
  disabled
/>
```

**Styling for Disabled**:
```css
.form-control:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}
```

**Why Read-Only**?
- License number should only change through official channels
- Registration date is historical data
- Prevents accidental modifications
- Shows immutable data clearly

**Validation Ready**:
```javascript
// Add validation in handleSave()
if (!clinicData.clinicName) {
  alert('Clinic name is required');
  return;
}
if (!clinicData.phone.match(/^\+?[\d\s-]{10,}$/)) {
  alert('Invalid phone number');
  return;
}
```

---

### 3. Notifications Section 🔔

**Purpose**: Centralize notification preferences

**Default Settings**:
```javascript
[
  {
    id: 'appointments',
    title: 'Appointment Reminders',
    description: 'Send reminders to patients before scheduled appointments',
    enabled: true
  },
  {
    id: 'cancellations',
    title: 'Cancellation Alerts',
    description: 'Notify on appointment cancellations',
    enabled: true
  },
  {
    id: 'reports',
    title: 'Report Updates',
    description: 'Send new medical report notifications',
    enabled: true
  },
  {
    id: 'revenue',
    title: 'Revenue Reports',
    description: 'Daily revenue and financial updates',
    enabled: true
  },
  {
    id: 'staff',
    title: 'Staff Updates',
    description: 'Notify about staff activities',
    enabled: false
  }
]
```

**Render Pattern**:
```jsx
<ListGroup flush>
  {notifications.map(notif => (
    <ListGroup.Item key={notif.id} className="notification-item">
      <div>
        <strong>{notif.title}</strong>
        <small className="text-muted d-block">
          {notif.description}
        </small>
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
```

**Styling for Switches**:
```css
.form-switch .form-check-input {
  cursor: pointer;
  width: 3em;
  height: 1.5em;
  accent-color: #10b981;     /* Green when checked */
}

.form-switch .form-check-input:checked {
  background-color: #10b981;
  border-color: #10b981;
}
```

**User Experience**:
- Clear description explains when each notification triggers
- Organized in list format for easy scanning
- Switches on right for quick toggling
- Muted text prevents visual clutter

---

### 4. RBAC Section 🔐

**Purpose**: Manage staff permissions by role

**Permission Matrix**:
```
         | Admin | Doctor | Receptionist |
---------|-------|--------|--------------|
View Financials | ✓ | ✗ | ✗ |
Edit Patient Records | ✓ | ✓ | ✓ |
Manage Staff | ✓ | ✗ | ✗ |
View Reports | ✓ | ✓ | ✗ |
Delete Appointments | ✓ | ✗ | ✗ |
Manage Clinic | ✓ | ✗ | ✗ |
Change Settings | ✓ | ✗ | ✗ |
View Audit Logs | ✓ | ✗ | ✗ |
```

**Master Toggle Implementation**:
```javascript
const handleMasterToggle = (role) => {
  // If all permissions enabled, disable all
  // Otherwise, enable all
  const allEnabled = permissions[role].every(p => p);
  const newPerms = new Array(8).fill(!allEnabled);
  setPermissions({...permissions, [role]: newPerms});
};
```

**Individual Permission Toggle**:
```javascript
const handlePermissionToggle = (role, index) => {
  const newPerms = [...permissions[role]];
  newPerms[index] = !newPerms[index];
  setPermissions({...permissions, [role]: newPerms});
};
```

**Visual Feedback with Checkmarks**:
```jsx
{permissions[role][index] && (
  <Check size={20} color="#10b981" />
)}
```

**Permission Tooltips**:
```jsx
<Tooltip
  title={`${permission} - ${permissionDescriptions[permission]}`}
>
  {permission}
</Tooltip>
```

**Warning Alert**:
```jsx
<Alert variant="info" className="permission-warning">
  <AlertCircle size={20} className="me-2" />
  <strong>Note:</strong> Permission changes take effect immediately
  for all users with this role.
</Alert>
```

---

## Code Structure

### File Organization

```
AdminSettings Component
├── Imports
│   ├── React hooks
│   ├── Bootstrap components
│   ├── Lucide icons
│   └── Styles
├── State Variables (8 total)
│   ├── activeSection
│   ├── saving
│   ├── profileData
│   ├── clinicData
│   ├── notifications
│   ├── permissions
│   ├── logoPreview
│   └── expandSecurity
├── Event Handlers (12 total)
├── Render Functions (5 total)
└── Main JSX Return
```

### Event Handler Organization

**Profile Handlers**:
- `handleProfileChange()` - Update form fields
- `handleLogoUpload()` - Process image upload

**Clinic Handlers**:
- `handleClinicChange()` - Update clinic fields

**Notification Handlers**:
- `handleNotificationToggle()` - Switch notification on/off

**RBAC Handlers**:
- `handlePermissionToggle()` - Modify individual permission
- `handleMasterToggle()` - Toggle all permissions for role

**Universal Handlers**:
- `handleSave()` - Save current section data

### State Update Patterns

**Immutable Array Update**:
```javascript
// Toggle one item in array
setNotifications(
  notifications.map(n =>
    n.id === targetId ? {...n, enabled: !n.enabled} : n
  )
);
```

**Object Property Update**:
```javascript
// Update nested object
setProfileData({
  ...profileData,
  [propertyName]: newValue
});
```

**Nested Array Update**:
```javascript
// Update array within object
const newPerms = [...permissions[role]];
newPerms[index] = !newPerms[index];
setPermissions({...permissions, [role]: newPerms});
```

---

## Customization

### Add New Clinic Information Field

1. **Update State**:
```javascript
const [clinicData, setClinicData] = useState({
  // ... existing fields
  taxId: '12ABCDE1234F1Z0',  // New field
});
```

2. **Add Form Input**:
```jsx
<FloatingLabel label="Tax ID">
  <Form.Control
    name="taxId"
    value={clinicData.taxId}
    onChange={handleClinicChange}
    placeholder="Enter tax ID"
  />
</FloatingLabel>
```

3. **Update API Call**:
```javascript
// In handleSave() for clinic section
const response = await fetch('/api/clinic/info', {
  method: 'POST',
  body: JSON.stringify(clinicData)
});
```

### Add New User Role

1. **Update Permissions State**:
```javascript
const [permissions, setPermissions] = useState({
  Admin: [true, true, true, true, true, true, true, true],
  Doctor: [false, true, false, true, false, false, false, false],
  Receptionist: [false, true, false, true, false, false, false, false],
  Manager: [false, true, true, true, false, false, false, false],  // New
});
```

2. **Update Table Header**:
```jsx
{['Admin', 'Doctor', 'Receptionist', 'Manager'].map(role => (
  <th key={role} className="text-center">
    <Form.Check
      type="checkbox"
      label={role}
      checked={permissions[role].every(p => p)}
      onChange={() => handleMasterToggle(role)}
    />
  </th>
))}
```

3. **Update RBAC Rows**:
```jsx
{PERMISSIONS.map((permission, index) => (
  <tr key={index}>
    <td>{permission}</td>
    {['Admin', 'Doctor', 'Receptionist', 'Manager'].map(role => (
      <td key={role} className="text-center">
        <Form.Check
          type="checkbox"
          checked={permissions[role][index]}
          onChange={() => handlePermissionToggle(role, index)}
        />
      </td>
    ))}
  </tr>
))}
```

### Change Color Theme

**Option 1: Update CSS Variables**:
```css
:root {
  --primary-color: #3b82f6;      /* Light blue */
  --success-color: #10b981;       /* Green */
  --danger-color: #ef4444;        /* Red */
}

/* Replace hardcoded colors */
.btn-primary {
  background-color: var(--primary-color);
}
```

**Option 2: Update Specific Colors**:
```css
/* Change sidebar active state */
.sidebar-item.active {
  border-left-color: #7c3aed;     /* Purple instead of blue */
  background-color: #f5f3ff;
  color: #7c3aed;
}

/* Change button color */
.btn-primary {
  background-color: #7c3aed;      /* Purple */
  border-color: #7c3aed;
}
```

### Modify Button Text and Icons

```jsx
// Change save button text
<Button onClick={handleSave} disabled={saving}>
  {saving ? (
    <>
      <Spinner animation="border" size="sm" className="me-2" />
      Saving Changes...
    </>
  ) : (
    <>
      <Save size={20} className="me-2" />
      Save Settings
    </>
  )}
</Button>
```

---

## API Integration

### Backend Requirements

Your backend should provide these endpoints:

#### 1. GET /api/admin/profile
**Returns**: Current admin profile

```json
{
  "adminId": "ADM001",
  "adminName": "Dr. Admin",
  "email": "admin@medico.com",
  "phone": "+91 98765 43200",
  "logoUrl": "/images/admin-logo.png"
}
```

#### 2. POST /api/admin/profile
**Accepts**: Updated profile data

```json
{
  "adminName": "Dr. Admin Updated",
  "email": "newemail@medico.com",
  "phone": "+91 98765 43200",
  "newPassword": "newSecurePassword"
}
```

#### 3. GET/POST /api/clinic/info
**Returns/Accepts**: Clinic information

```json
{
  "clinicName": "Medico Healthcare",
  "address": "123 Medical Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "phone": "+91 98765 43201",
  "email": "clinic@medico.com",
  "licenseNumber": "MED-2024-001",
  "registrationDate": "2024-01-15"
}
```

#### 4. POST /api/clinic/logo
**Accepts**: Image file (multipart/form-data)

```
FormData {
  file: File,
  clinicId: "CLI001"
}
```

#### 5. GET/POST /api/notifications/preferences
**Returns/Accepts**: Notification settings

```json
{
  "appointments": true,
  "cancellations": true,
  "reports": true,
  "revenue": true,
  "staff": false
}
```

#### 6. GET/POST /api/rbac/permissions
**Returns/Accepts**: Role permissions

```json
{
  "Admin": [true, true, true, true, true, true, true, true],
  "Doctor": [false, true, false, true, false, false, false, false],
  "Receptionist": [false, true, false, true, false, false, false, false]
}
```

### Error Handling Example

```javascript
const handleSave = async () => {
  setSaving(true);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      alert('Settings saved successfully!');
      // Update local state if needed
    } else {
      alert(result.message || 'Error saving settings');
    }
  } catch (error) {
    console.error('Save error:', error);
    alert(`Error: ${error.message}`);
  } finally {
    setSaving(false);
  }
};
```

---

## Security Considerations

### 1. Password Handling

**Do**:
- ✅ Never display password in text (use `type="password"`)
- ✅ Require current password to set new password
- ✅ Enforce password minimum requirements (8+ chars, mix of case/numbers)
- ✅ Use HTTPS only
- ✅ Hash passwords on backend

**Don't**:
- ❌ Display password in console logs
- ❌ Store password in localStorage
- ❌ Allow changing password without verification
- ❌ Send password in query parameters

### 2. Permission Updates

**Do**:
- ✅ Verify admin identity before permission changes
- ✅ Log all permission modifications
- ✅ Require confirmation for sensitive permission changes
- ✅ Notify affected users of permission changes

**Don't**:
- ❌ Allow permission changes without authentication
- ❌ Change permissions for admin's own role (prevent lockout)
- ❌ Immediately apply permissions (use transaction)
- ❌ Skip validation on permission array

### 3. File Upload (Logo)

**Do**:
- ✅ Validate file type on frontend (PNG, JPG, GIF)
- ✅ Validate file size (max 5MB)
- ✅ Scan file on backend
- ✅ Store in secure location
- ✅ Serve from CDN with caching headers

**Don't**:
- ❌ Accept all file types
- ❌ Store in public directory
- ❌ Skip backend validation
- ❌ Allow files larger than 10MB

### 4. API Security

**Do**:
- ✅ Use HTTPS/TLS
- ✅ Implement rate limiting
- ✅ Use CORS headers correctly
- ✅ Validate all input on backend
- ✅ Use JWT or session tokens

**Don't**:
- ❌ Send sensitive data in URLs
- ❌ Trust frontend validation only
- ❌ Allow CORS from any origin
- ❌ Store auth tokens in localStorage (use secure cookies)

---

## Performance Tips

### 1. Optimize Renders

**Problem**: Component re-renders on every state change

**Solution**: Use `useCallback` for event handlers
```javascript
import { useCallback } from 'react';

const handleProfileChange = useCallback((e) => {
  const { name, value } = e.target;
  setProfileData(prev => ({...prev, [name]: value}));
}, []);

const handleSave = useCallback(async () => {
  // Save logic
}, [activeSection, profileData, clinicData]);
```

### 2. Lazy Load Sections

**Problem**: All section components render at once

**Solution**: Render only active section
```jsx
{activeSection === 'profile' && <ProfileSection />}
{activeSection === 'clinic' && <ClinicSection />}
{activeSection === 'notifications' && <NotificationsSection />}
{activeSection === 'rbac' && <RBACSection />}
```

### 3. Debounce API Calls

**Problem**: Multiple save clicks trigger multiple requests

**Solution**: Debounce save function
```javascript
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

const debouncedSave = debounce(handleSave, 300);
```

### 4. Memoize Large Lists

**Problem**: Notification list re-renders on every change

**Solution**: Use `useMemo`
```javascript
import { useMemo } from 'react';

const memoizedNotifications = useMemo(
  () => notifications,
  [notifications]
);
```

### 5. Optimize Images

**Problem**: Large logo image slow to load

**Solution**: Use next-gen formats
```javascript
// Use WebP with PNG fallback
<picture>
  <source srcSet={logoPreview} type="image/webp" />
  <img src={logoPreview} className="profile-image" />
</picture>
```

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: March 25, 2026

````
