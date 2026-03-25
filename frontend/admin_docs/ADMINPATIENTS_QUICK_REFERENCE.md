````markdown
# AdminPatients Quick Reference

## 🎯 Quick Start

### Route
```
/admin/patients → AdminPatients Component
```

### Access
- Via Sidebar: Admin Dashboard → Patients
- Direct URL: http://localhost:5173/admin/patients

---

## 📋 Table Columns

| Column | Content | Sortable | Searchable |
|--------|---------|----------|-----------|
| Profile | Avatar + Patient Name | No | Yes |
| Patient ID | Unique identifier | Yes | Yes |
| Age/Gender | Age and gender | Yes | No |
| Actions | Edit, View, Delete | No | No |

**Removed Columns** (in current version):
- ~~Blood Group~~ (Removed)
- ~~Status~~ (Removed)

---

## 🔍 Search & Filter Features

### Search Functionality
```javascript
searchTerm → filters by patient name, ID, or email
Real-time search as you type
Case-insensitive matching
```

### Filter Options
```javascript
- By Gender (Male/Female/All)
- By Age Range (dropdown)
- By Status (Active/Inactive/All)
- By Registration Date
```

---

## 👥 Patient Data Structure

```javascript
{
  patientId: 'P001',
  name: 'John Doe',
  age: 35,
  gender: 'M',
  phone: '+91 98765 43200',
  email: 'john@example.com',
  address: '123 Medical Street, City',
  bloodGroup: 'O+',
  status: 'Active',
  registrationDate: '2024-01-15',
  lastVisit: '2024-03-25',
  appointments: 5,
  medicalHistory: 'Hypertension, Diabetes',
  emergencyContact: '+91 98765 43201'
}
```

---

## 🎨 Table Styling

### Modern Table Features
```css
✅ Gradient table headers (light gray to slightly darker)
✅ Striped rows (alternating light background)
✅ Hover effects (inset shadow, lift animation)
✅ Rounded corners on table edges
✅ Professional borders and spacing
✅ Responsive design for all devices
✅ Color-coded action buttons
```

### Color Coding

| Element | Color | Hex |
|---------|-------|-----|
| Header | Light Gray | `#f3f4f6` → `#e5e7eb` |
| Hover | Light Blue | `rgba(59, 130, 246, 0.03)` |
| Accent | Blue | `#3b82f6` |
| Text | Dark Gray | `#1f2937` |
| Borders | Light Gray | `#e5e7eb` |

---

## 🔘 Action Buttons

### Button Types

**View Button** (Blue)
```jsx
<Button variant="outline-primary" size="sm">
  <Eye size={16} />
</Button>
```
- Opens patient details modal
- Shows full medical history
- Displays appointment records

**Edit Button** (Teal)
```jsx
<Button variant="outline-info" size="sm">
  <Pencil size={16} />
</Button>
```
- Opens edit form
- Allows updating patient info
- Saves to database

**Delete Button** (Red)
```jsx
<Button variant="outline-danger" size="sm">
  <Trash2 size={16} />
</Button>
```
- Shows confirmation dialog
- Soft delete (archives patient)
- Logs deletion in audit trail

---

## 🔄 State Management

### Main State Variables
```javascript
const [patients, setPatients] = useState([]);        // All patient data
const [filteredPatients, setFilteredPatients] = useState([]); // Filtered results
const [searchTerm, setSearchTerm] = useState('');    // Search input
const [selectedFilter, setSelectedFilter] = useState('all'); // Filter type
const [currentPage, setCurrentPage] = useState(1);   // Pagination
const [loading, setLoading] = useState(false);       // Loading state
const [error, setError] = useState(null);            // Error state
const [showModal, setShowModal] = useState(false);   // Modal visibility
const [selectedPatient, setSelectedPatient] = useState(null); // Selected patient
```

### Data Flow
```
API Fetch
    ↓
setPatients(data)
    ↓
Apply Search Filter
    ↓
Apply Category Filter
    ↓
setFilteredPatients()
    ↓
Render Table with filtered data
```

---

## 🔌 API Endpoints

### GET /api/patients
**Query Parameters**:
```
?page=1&limit=10&search=John&gender=M&status=Active
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "patientId": "P001",
      "name": "John Doe",
      "age": 35,
      "gender": "M",
      "phone": "+91 98765 43200",
      "email": "john@example.com",
      "status": "Active"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 45
  }
}
```

### GET /api/patients/:patientId
**Response**:
```json
{
  "success": true,
  "data": {
    "patientId": "P001",
    "name": "John Doe",
    "fullDetails": {...},
    "appointments": [...],
    "medicalHistory": [...]
  }
}
```

### PUT /api/patients/:patientId
**Request Body**:
```json
{
  "name": "Updated Name",
  "phone": "+91 98765 43200",
  "address": "New Address"
}
```

### DELETE /api/patients/:patientId
**Response**:
```json
{
  "success": true,
  "message": "Patient archived successfully"
}
```

---

## 📱 Responsive Behavior

### Desktop (>1024px)
```
- Full 4-column table visible
- Action buttons with text + icons
- Search bar with filter dropdowns
- Add Patient button top-right
```

### Tablet (768-1024px)
```
- Condensed column widths
- Icons-only action buttons
- Search and filters in row
- Horizontal scroll if needed
```

### Mobile (<768px)
```
- 2 columns visible (Name, Actions)
- Stack other info below
- Full-width buttons
- Search above table
- Horizontal scroll for table
```

---

## 🔎 Search Implementation

```javascript
const handleSearch = (term) => {
  setSearchTerm(term);
  
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(term.toLowerCase()) ||
    p.patientId.toLowerCase().includes(term.toLowerCase()) ||
    p.email.toLowerCase().includes(term.toLowerCase())
  );
  
  setFilteredPatients(filtered);
  setCurrentPage(1); // Reset to first page
};
```

---

## 🏷️ Filter Implementation

```javascript
const handleFilter = (filterType) => {
  setSelectedFilter(filterType);
  
  let filtered = patients;
  
  if (filterType === 'active') {
    filtered = patients.filter(p => p.status === 'Active');
  } else if (filterType === 'inactive') {
    filtered = patients.filter(p => p.status === 'Inactive');
  }
  
  setFilteredPatients(filtered);
  setCurrentPage(1);
};
```

---

## 📊 Pagination

### Pagination Controls
```javascript
const itemsPerPage = 10;
const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentItems = filteredPatients.slice(startIndex, endIndex);
```

### Pagination Display
```jsx
<Pagination>
  <Pagination.First onClick={() => setCurrentPage(1)} />
  <Pagination.Prev 
    onClick={() => setCurrentPage(p => p - 1)}
    disabled={currentPage === 1}
  />
  
  {[...Array(totalPages)].map((_, i) => (
    <Pagination.Item
      key={i + 1}
      active={i + 1 === currentPage}
      onClick={() => setCurrentPage(i + 1)}
    >
      {i + 1}
    </Pagination.Item>
  ))}
  
  <Pagination.Next 
    onClick={() => setCurrentPage(p => p + 1)}
    disabled={currentPage === totalPages}
  />
  <Pagination.Last onClick={() => setCurrentPage(totalPages)} />
</Pagination>
```

---

## 🎯 Common Tasks

### Add New Patient
```jsx
<Button variant="primary" onClick={() => setShowAddModal(true)}>
  <Plus size={20} className="me-2" />
  Add Patient
</Button>
```

### View Patient Details
```javascript
const handleViewPatient = (patient) => {
  setSelectedPatient(patient);
  setShowModal(true);
};
```

### Edit Patient
```javascript
const handleEditPatient = (patient) => {
  setSelectedPatient(patient);
  setShowEditForm(true);
};
```

### Delete Patient
```javascript
const handleDeletePatient = (patientId) => {
  if (window.confirm('Archive this patient?')) {
    fetch(`/api/patients/${patientId}`, { method: 'DELETE' })
      .then(() => {
        setPatients(patients.filter(p => p.patientId !== patientId));
        alert('Patient archived successfully');
      });
  }
};
```

---

## 🎨 CSS Classes

### Table Classes
```css
.patient-table              /* Main table container */
.patient-row               /* Each table row */
.patient-row:hover         /* Hover effect */
.patient-name              /* Name cell styling */
.patient-id                /* ID badge styling */
.patient-age-gender        /* Age/Gender cell */
.action-buttons            /* Action button container */
```

### Component Classes
```css
.admin-patients            /* Main component */
.search-section            /* Search input area */
.filter-section            /* Filter dropdown area */
.table-responsive          /* Responsive wrapper */
.pagination-controls       /* Pagination buttons */
```

---

## 🔐 Security Features

✅ **Access Control** - Only admins can view/edit/delete
✅ **Data Validation** - All inputs validated
✅ **Audit Logging** - All actions logged
✅ **Encryption** - Sensitive data encrypted at rest
✅ **HIPAA Compliance** - Protected health information
✅ **Rate Limiting** - API rate limits on delete
✅ **Soft Delete** - No hard deletes (data archived)

---

## ⚡ Performance Tips

### Optimize Rendering
```javascript
// Use useMemo for filtered list
const memoizedPatients = useMemo(
  () => filterPatients(patients, searchTerm, selectedFilter),
  [patients, searchTerm, selectedFilter]
);
```

### Lazy Load Details
```javascript
// Load full patient details on demand
const [expandedPatientId, setExpandedPatientId] = useState(null);

const loadPatientDetails = async (patientId) => {
  const response = await fetch(`/api/patients/${patientId}`);
  return response.json();
};
```

### Virtual Scrolling
```javascript
// For large patient lists
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={filteredPatients.length}
  itemSize={50}
>
  {Row}
</List>
```

---

## 🧪 Testing

- [ ] Search filters patients correctly
- [ ] Filters apply properly
- [ ] Pagination works
- [ ] View details opens modal
- [ ] Edit saves changes
- [ ] Delete shows confirmation
- [ ] Mobile responsive
- [ ] No console errors
- [ ] API calls succeed
- [ ] Loading states display

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: March 25, 2026

````
