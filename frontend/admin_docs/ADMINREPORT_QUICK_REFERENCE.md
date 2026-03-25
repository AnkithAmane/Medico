````markdown
# AdminReport Quick Reference

## 🎯 Quick Start

### Route
```
/admin/reports → AdminReport Component
```

### Access
- Via Sidebar: Admin Dashboard → Reports
- Direct URL: http://localhost:5173/admin/reports

---

## 📊 Report Types

| Report | Purpose | Data Source |
|--------|---------|-------------|
| Revenue Report | Financial performance | Appointments + Payments |
| Patient Report | Patient demographics | Patient database |
| Appointment Report | Appointment statistics | Appointments database |
| Doctor Performance | Doctor metrics | Doctor + Appointment data |
| Staff Report | Staff activity tracking | Staff database |

---

## 🎨 Component Structure

### Main Container
```jsx
<Container fluid className="admin-report">
  <Row>
    <Col md={12}>
      {/* Header with filters */}
      {/* Report options */}
      {/* Chart/Table display */}
    </Col>
  </Row>
</Container>
```

### Key Sections

1. **Report Selector**
   - Buttons to choose report type
   - Active state styling
   - Icons for quick identification

2. **Date Filters**
   - Start date input
   - End date input
   - Preset date ranges (Today, This Week, This Month, This Year)

3. **Display Options**
   - Chart view
   - Table view
   - Toggle between views

4. **Chart Display**
   - Uses Chart.js or similar
   - Responsive and interactive
   - Tooltip on hover

5. **Export Options**
   - Export as PDF
   - Export as CSV
   - Print functionality

---

## 💾 Data Structures

### Revenue Report Data
```javascript
{
  reportType: 'revenue',
  dateRange: { start: '2024-03-01', end: '2024-03-31' },
  data: [
    { date: '2024-03-01', revenue: 15000, appointments: 12 },
    { date: '2024-03-02', revenue: 18000, appointments: 15 },
    // ... more data points
  ],
  summary: {
    totalRevenue: 450000,
    totalAppointments: 360,
    averagePerAppointment: 1250
  }
}
```

### Patient Report Data
```javascript
{
  reportType: 'patient',
  dateRange: { start: '2024-03-01', end: '2024-03-31' },
  data: [
    { name: 'John Doe', age: 35, gender: 'M', appointmentCount: 2 },
    { name: 'Jane Smith', age: 28, gender: 'F', appointmentCount: 1 },
    // ... more patient data
  ],
  summary: {
    totalPatients: 145,
    newPatients: 23,
    appointmentCount: 360,
    avgAge: 42.5
  }
}
```

---

## 🔄 State Management

### Main State Variables
```javascript
const [selectedReport, setSelectedReport] = useState('revenue');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'
const [reportData, setReportData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### State Flow
```
User selects report type
    ↓
Set date range filters
    ↓
Click "Generate Report" button
    ↓
setLoading(true) → API call → Parse data → setReportData()
    ↓
setLoading(false) → Display chart/table
```

---

## 📈 Chart Configuration

### Chart.js Setup
```javascript
const chartConfig = {
  type: 'line',
  data: {
    labels: reportData.data.map(d => d.date),
    datasets: [{
      label: 'Revenue',
      data: reportData.data.map(d => d.revenue),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
};
```

---

## 📋 Table Display

### Columns Configuration

**Revenue Report Table**:
```
Date | Appointments | Total Revenue | Avg Per Apt | Cancellations
```

**Patient Report Table**:
```
Patient ID | Name | Age | Gender | Phone | Appointments | Last Visit
```

**Doctor Performance Table**:
```
Doctor ID | Name | Appointments | Avg Rating | Revenue | Patients
```

---

## 🎯 Key Functions

### fetchReportData()
```javascript
const fetchReportData = async () => {
  setLoading(true);
  try {
    const response = await fetch(
      `/api/reports/${selectedReport}?start=${startDate}&end=${endDate}`
    );
    const data = await response.json();
    setReportData(data);
    setError(null);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### applyDateRange(rangeType)
```javascript
const applyDateRange = (rangeType) => {
  const today = new Date();
  let start, end = today;
  
  switch(rangeType) {
    case 'today':
      start = today;
      break;
    case 'week':
      start = new Date(today.setDate(today.getDate() - 7));
      break;
    case 'month':
      start = new Date(today.setMonth(today.getMonth() - 1));
      break;
    case 'year':
      start = new Date(today.setFullYear(today.getFullYear() - 1));
      break;
  }
  
  setStartDate(start.toISOString().split('T')[0]);
  setEndDate(end.toISOString().split('T')[0]);
};
```

### exportReport(format)
```javascript
const exportReport = (format) => {
  if (format === 'pdf') {
    // Use jsPDF library
    const doc = new jsPDF();
    doc.text(`${selectedReport} Report`, 10, 10);
    doc.autoTable({ html: '#report-table' });
    doc.save(`report-${selectedReport}.pdf`);
  } else if (format === 'csv') {
    // Convert to CSV
    const csv = convertToCSV(reportData);
    downloadCSV(csv, `report-${selectedReport}.csv`);
  }
};
```

---

## 🎨 CSS Classes

### Report Container
```css
.admin-report {
  padding: 2rem;
  background-color: #f9fafb;
}

.report-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

### Report Buttons
```css
.report-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-right: 10px;
  border: 2px solid #e5e7eb;
  background-color: white;
  color: #374151;
}

.report-btn.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.report-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Chart Container
```css
.chart-container {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  min-height: 400px;
}

.chart-container canvas {
  max-height: 400px;
}
```

### Table Container
```css
.table-container {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}
```

---

## 🔌 API Endpoints

### GET /api/reports/revenue
**Query Params**:
```
?start=YYYY-MM-DD&end=YYYY-MM-DD&groupBy=daily|weekly|monthly
```

**Response**:
```json
{
  "reportType": "revenue",
  "data": [
    {"date": "2024-03-01", "revenue": 15000, "appointments": 12},
    ...
  ],
  "summary": {
    "totalRevenue": 450000,
    "totalAppointments": 360
  }
}
```

### GET /api/reports/patients
**Query Params**:
```
?start=YYYY-MM-DD&end=YYYY-MM-DD&sortBy=name|age|appointments
```

### GET /api/reports/appointments
**Query Params**:
```
?start=YYYY-MM-DD&end=YYYY-MM-DD&status=completed|cancelled|pending
```

### GET /api/reports/doctor-performance
**Query Params**:
```
?start=YYYY-MM-DD&end=YYYY-MM-DD&doctorId=optional
```

---

## 📱 Responsive Design

### Desktop (>1024px)
- Side-by-side report selector and filters
- Full-width charts
- Multi-column tables

### Tablet (768-1024px)
- Stacked report selector
- Adjusted chart height
- Horizontal scroll on tables

### Mobile (<768px)
- Single column layout
- Report selector as horizontal scroll
- Chart height reduced
- Table: horizontal scroll required

---

## ⚡ Performance Optimization

### Lazy Load Charts
```javascript
const ChartComponent = React.lazy(() => import('react-chartjs-2'));

<Suspense fallback={<Spinner />}>
  <ChartComponent config={chartConfig} />
</Suspense>
```

### Memoize Chart Configuration
```javascript
const memoizedChartConfig = useMemo(
  () => generateChartConfig(reportData),
  [reportData]
);
```

### Virtualize Large Tables
```javascript
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={reportData.length}
  itemSize={50}
  width="100%"
>
  {Row}
</List>
```

---

## 🧪 Testing Checklist

- [ ] Report selector buttons work
- [ ] Date filters apply correctly
- [ ] Chart displays with correct data
- [ ] Table switches view mode
- [ ] Export functions download files
- [ ] Responsive design on mobile
- [ ] Error handling for failed API calls
- [ ] Loading spinner shows/hides
- [ ] Print functionality works

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: March 25, 2026

````
