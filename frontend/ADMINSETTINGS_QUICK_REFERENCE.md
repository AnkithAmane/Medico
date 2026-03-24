# AdminSettings Quick Reference

## 🚀 Quick Start

### Route
```
/admin/settings → AdminSettings Component
```

### Import
```jsx
import AdminSettings from './pages/Admin/AdminSettings';
```

---

## 📋 Component Props & Structure

### AdminSettings (Main)
**Props:** None (handles all state internally)

**State:**
```javascript
activeSection: 'profile' | 'clinic' | 'notifications' | 'rbac'
saving: boolean
```

---

## 🎨 UI Components Used

| Component | Purpose | Count |
|-----------|---------|-------|
| Row/Col | Layout grid | 1 main + multiple per section |
| Card | Content containers | 4+ per section |
| ListGroup | Sidebar navigation | 1 |
| Form | Input fields | Multiple |
| Button | Primary actions | 4 (one per section) |
| Collapse | Password fields | 1 |
| Table | RBAC matrix | 1 |
| Spinner | Loading state | Integrated in buttons |
| Tooltip | Permission help | 8 (one per permission) |

---

## 🔄 Section Overview

### 1. Profile Section
**Key Features:**
- Logo upload with preview
- Personal info form
- Collapsible password change
- Show/hide password toggle

**Key States:**
```javascript
logoPreview: null | string (DataURL)
showPassword: boolean
expandSecurity: boolean
profileData: { adminName, email, phone, currentPassword, newPassword, confirmPassword }
```

### 2. Clinic Info Section
**Key Features:**
- Clinic name and address
- City, state, zip fields
- License & registration (read-only)
- Contact information

**Key States:**
```javascript
clinicData: {
  clinicName, address, city, state, zipCode,
  phone, email, licenseNumber, registrationDate
}
```

### 3. Notifications Section
**Key Features:**
- 5 notification types
- Toggle switches
- Real-time state updates
- Descriptions for each notification

**Key States:**
```javascript
notifications: Array<{
  id, title, description, enabled
}>
```

### 4. RBAC Section
**Key Features:**
- 8 permissions × 3 roles
- Master toggle per role
- Checkboxes for each cell
- Tooltips on permissions

**Key States:**
```javascript
permissions: {
  Admin: boolean[],
  Doctor: boolean[],
  Receptionist: boolean[]
}
```

---

## 🎯 Key Functions

### handleSave()
```javascript
setSaving(true) → Wait 1.5s → Alert "Saved successfully" → setSaving(false)
```

### toggleNotification(id)
```javascript
Flips enabled boolean for specific notification
```

### togglePermission(role, index)
```javascript
Flips boolean for role at permission index
```

### toggleAllPermissions(role)
```javascript
If all enabled → disable all
Else → enable all
```

### handleLogoUpload(e)
```javascript
Reads file as DataURL → setLogoPreview()
```

---

## 📱 Responsive Breakpoints

| Device | Sidebar | Layout | Changes |
|--------|---------|--------|---------|
| Desktop >1024px | Sticky left | 2-col | Normal |
| Tablet 768-1024px | Relative | 2-col | Reduced padding |
| Mobile <768px | Horizontal tabs | 1-col | Bottom border active state |

---

## 🎨 Key CSS Classes

### Sidebar
- `.sticky-sidebar` - Sticky positioning
- `.sidebar-item` - Navigation item
- `.sidebar-item.active` - Active state (left border + blue)

### Cards
- `.card` - Container
- `.card-header` - Light gray header
- `.card-body` - Content area

### Forms
- `.form-control` - Input fields
- `.form-floating` - Floating labels
- `.form-switch` - Toggle switches

### Tables
- `.table-bordered` - Borders
- `.table-hover` - Hover effect
- `.permission-cell` - Light gray bg

### Animations
- `slideInRight` - Section entrance (0.3s)
- Hover transforms - Button/card hover effects

---

## 🔌 Data Structures

### Logo Upload
```javascript
File → FileReader → DataURL → preview state
```

### Notification Item
```javascript
{
  id: string,           // unique identifier
  title: string,        // display name
  description: string,  // explanation
  enabled: boolean      // current state
}
```

### Permission Matrix
```javascript
{
  [RoleName]: [
    permission1: boolean,
    permission2: boolean,
    ...
  ]
}
```

---

## 💾 Save Operations

Each section has independent save:

```javascript
// Profile
POST /api/admin/profile
{adminName, email, phone, newPassword?}

// Clinic
POST /api/clinic/info
{clinicName, address, city, state, zipCode, phone, email}

// Notifications
POST /api/notifications/preferences
{appointments, cancellations, reports, revenue, staff}

// RBAC
POST /api/rbac/permissions
{Admin[], Doctor[], Receptionist[]}
```

---

## 🧠 State Management Pattern

1. **Initialize** - Component mounts with default state
2. **Update** - User interacts, state updates in real-time
3. **Save** - Save button clicked, spinner shows
4. **API Call** - Backend processes (simulated 1.5s)
5. **Feedback** - Alert confirmation

---

## 🎯 Common Modifications

### Add New Permission
```javascript
// 1. Add to RBAC_PERMISSIONS array
const RBAC_PERMISSIONS = [
  'View Financials',
  'Edit Patient Records',
  // ... existing
  'New Permission', // Add here
];

// 2. Update DEFAULT_PERMISSIONS arrays
const DEFAULT_PERMISSIONS = {
  Admin: [true, true, true, true, true, true, true, true, true], // Add true/false
  Doctor: [false, true, false, true, false, false, false, false, false],
  Receptionist: [false, true, false, true, false, false, false, false, false],
};
```

### Add New Notification
```javascript
// 1. Add to NOTIFICATION_SETTINGS
const NOTIFICATION_SETTINGS = [
  // ... existing
  {
    id: 'newNotification',
    title: 'New Notification Title',
    description: 'Description of when this triggers',
    enabled: true,
  },
];

// 2. State will auto-update
```

### Change Colors
```css
/* In AdminSettings.css */
.settings-section .btn-primary {
  background-color: #YourColorHex;
}

.sidebar-item.active {
  color: #YourColorHex;
  border-left-color: #YourColorHex;
}
```

---

## 🧪 Testing Examples

### Test Sidebar Navigation
```javascript
// Verify each sidebar item switches section
expect(activeSection).toBe('profile');
userEvent.click(clinicItem);
expect(activeSection).toBe('clinic');
```

### Test Permission Toggle
```javascript
// Master toggle should select/deselect all
const allBefore = permissions.Admin.every(p => p);
toggleAllPermissions('Admin');
const allAfter = permissions.Admin.every(p => p);
expect(allBefore).toBe(!allAfter);
```

### Test Form Validation
```javascript
// Passwords should match before save
expect(profileData.newPassword).toBe(profileData.confirmPassword);
```

---

## 📊 Default Mock Data

**Profile:**
- Admin: Dr. Admin
- Email: admin@medico.com
- Phone: +91 98765 43200

**Clinic:**
- Name: Medico Healthcare Clinic
- Address: 123 Medical Street, Healthcare City
- License: MED-2024-001

**Notifications:**
- 5 types (appointments, cancellations, reports, revenue, staff)
- Appointments, revenue, cancellations enabled by default

**RBAC:**
- Admin: All permissions (8/8)
- Doctor: View Financials ✗, Edit Records ✓, Manage Staff ✗, View Reports ✓, Delete Apt ✗, Manage Clinic ✗, Change Settings ✗, Audit Logs ✗
- Receptionist: Same as Doctor

---

## 🔐 Security Features

1. **Password Collapse** - Hidden until user needs it
2. **Disabled Fields** - License & registration can't be changed
3. **Show/Hide Toggle** - See password before saving
4. **Disable Button While Saving** - Prevents double-click submit
5. **RBAC Warning** - Info box alerts admin about immediate effect

---

## 🚨 Common Issues

### Logo Preview Not Showing
- Check FileReader implementation
- Verify image file type (PNG, JPG)
- Check DataURL generation

### Table Not Responsive
- Use `.table-responsive` wrapper
- Reduce font on mobile
- Adjust column widths

### Sidebar Sticky Not Working
- Check CSS position property
- Verify top: 2rem value
- May need z-index adjustment

---

## 📞 Support & Debugging

**Enable Logging:**
```javascript
console.log('Active Section:', activeSection);
console.log('Saving State:', saving);
console.log('Permissions:', permissions);
```

**Test Save Flow:**
```javascript
handleSave(); // Should show spinner for 1.5s then alert
```

**Verify Routes:**
Visit `http://localhost:5173/admin/settings` in browser

---

**Version:** 1.0.0  
**Last Updated:** March 24, 2026  
**Status:** Production Ready
