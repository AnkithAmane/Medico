import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  ButtonGroup,
  Table,
  Form,
  ProgressBar,
  Spinner,
  FloatingLabel,
} from 'react-bootstrap';
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Download,
  FileText,
  Printer,
  BarChart3,
  Calendar,
} from 'lucide-react';
import Layout from '../../components/Common/Layout';
import '../../styles/AdminReport.css';

// Mock Data
const reportData = {
  kpiCards: [
    {
      id: 1,
      title: 'Total Revenue',
      value: '$45,200',
      trend: '+12% from last month',
      trendType: 'positive',
      icon: DollarSign,
      bgColor: 'primary',
    },
    {
      id: 2,
      title: 'Total Appointments',
      value: '312',
      trend: '+8% from last month',
      trendType: 'positive',
      icon: Users,
      bgColor: 'success',
    },
    {
      id: 3,
      title: 'Patient Satisfaction',
      value: '94.2%',
      trend: '+2.1% from last month',
      trendType: 'positive',
      icon: TrendingUp,
      bgColor: 'info',
    },
    {
      id: 4,
      title: 'Cancellation Rate',
      value: '8.5%',
      trend: '-3.2% from last month',
      trendType: 'positive',
      icon: AlertCircle,
      bgColor: 'danger',
    },
  ],

  paymentBreakdown: {
    cash: { value: 18800, percentage: 41.6 },
    card: { value: 18050, percentage: 39.9 },
    insurance: { value: 8350, percentage: 18.5 },
  },

  departmentEarnings: [
    { dept: 'Cardiology', revenue: 12500, appointments: 45 },
    { dept: 'Pediatrics', revenue: 10200, appointments: 62 },
    { dept: 'Neurology', revenue: 9800, appointments: 38 },
    { dept: 'Orthopedics', revenue: 8500, appointments: 41 },
    { dept: 'Dermatology', revenue: 4200, appointments: 25 },
  ],

  patientAgeGroups: [
    { ageGroup: '0-18', count: 45, percentage: 14.4 },
    { ageGroup: '19-35', count: 98, percentage: 31.4 },
    { ageGroup: '36-50', count: 102, percentage: 32.7 },
    { ageGroup: '51-65', count: 54, percentage: 17.3 },
    { ageGroup: '65+', count: 13, percentage: 4.2 },
  ],

  cancellationData: [
    {
      id: 1,
      doctor: 'Dr. DeepaVignesh',
      department: 'Cardiology',
      scheduled: 24,
      completed: 22,
      noShow: 1,
      cancelled: 1,
      noShowRate: 4.2,
      reasons: ['Emergency', 'Forgot'],
    },
    {
      id: 2,
      doctor: 'Dr. Ritvik Reddy',
      department: 'Pediatrics',
      scheduled: 28,
      completed: 25,
      noShow: 2,
      cancelled: 1,
      noShowRate: 7.1,
      reasons: ['Traffic', 'Sick Leave'],
    },
    {
      id: 3,
      doctor: 'Dr. Harish Kumar',
      department: 'Neurology',
      scheduled: 18,
      completed: 15,
      noShow: 3,
      cancelled: 0,
      noShowRate: 16.7,
      reasons: ['Emergency', 'Forgot', 'Rescheduled'],
    },
    {
      id: 4,
      doctor: 'Dr. Nifal Sheikh',
      department: 'Orthopedics',
      scheduled: 22,
      completed: 21,
      noShow: 1,
      cancelled: 0,
      noShowRate: 4.5,
      reasons: ['Weather'],
    },
    {
      id: 5,
      doctor: 'Dr. Durga Bhavani',
      department: 'Dermatology',
      scheduled: 15,
      completed: 14,
      noShow: 0,
      cancelled: 1,
      noShowRate: 0,
      reasons: ['Personal'],
    },
  ],
};

// KPI Card Component
const KPICard = ({ card }) => {
  const Icon = card.icon;
  const isTrendPositive = card.trendType === 'positive';

  return (
    <Card className="kpi-card shadow-sm border-0 h-100">
      <Card.Body>
        <Row className="align-items-start">
          <Col xs={8}>
            <p className="kpi-title text-muted mb-2">{card.title}</p>
            <h2 className="kpi-value fw-bold mb-3">{card.value}</h2>
            <p className={`kpi-trend mb-0 ${isTrendPositive ? 'text-success' : 'text-danger'}`}>
              {isTrendPositive ? '📈' : '📉'} {card.trend}
            </p>
          </Col>
          <Col xs={4} className="text-end">
            <div className={`kpi-icon bg-${card.bgColor} bg-opacity-15`}>
              <Icon size={32} className={`text-${card.bgColor}`} />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Payment Breakdown Component
const PaymentBreakdown = ({ data }) => {
  const total = data.cash.value + data.card.value + data.insurance.value;

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-light border-bottom">
        <h5 className="fw-bold mb-0">Revenue by Payment Method</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">Payment Breakdown</span>
            <span className="text-muted">₹{total.toLocaleString()}</span>
          </div>
          <div className="progress-container">
            <ProgressBar>
              <ProgressBar
                variant="primary"
                now={data.cash.percentage}
                label={`Cash ${data.cash.percentage}%`}
                key={1}
                className="progress-segment"
              />
              <ProgressBar
                variant="info"
                now={data.card.percentage}
                label={`Card ${data.card.percentage}%`}
                key={2}
                className="progress-segment"
              />
              <ProgressBar
                variant="success"
                now={data.insurance.percentage}
                label={`Insurance ${data.insurance.percentage}%`}
                key={3}
                className="progress-segment"
              />
            </ProgressBar>
          </div>
        </div>

        {/* Breakdown Details */}
        <Row className="mt-4">
          <Col md={4}>
            <div className="breakdown-item">
              <div className="breakdown-indicator bg-primary"></div>
              <div>
                <small className="text-muted d-block">Cash</small>
                <strong>₹{data.cash.value.toLocaleString()}</strong>
                <small className="text-muted d-block">{data.cash.percentage}%</small>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="breakdown-item">
              <div className="breakdown-indicator bg-info"></div>
              <div>
                <small className="text-muted d-block">Card</small>
                <strong>₹{data.card.value.toLocaleString()}</strong>
                <small className="text-muted d-block">{data.card.percentage}%</small>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="breakdown-item">
              <div className="breakdown-indicator bg-success"></div>
              <div>
                <small className="text-muted d-block">Insurance</small>
                <strong>₹{data.insurance.value.toLocaleString()}</strong>
                <small className="text-muted d-block">{data.insurance.percentage}%</small>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Department Earnings Chart Component
const DepartmentEarnings = ({ data }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="bg-light border-bottom">
        <h5 className="fw-bold mb-0">Department-wise Earnings</h5>
      </Card.Header>
      <Card.Body>
        <div className="chart-placeholder">
          {data.map((item, index) => (
            <div key={index} className="chart-bar-item mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold">{item.dept}</span>
                <span className="text-success fw-bold">₹{item.revenue.toLocaleString()}</span>
              </div>
              <div className="progress" style={{ height: '24px' }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                  aria-valuenow={(item.revenue / maxRevenue) * 100}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <small className="text-white fw-bold" style={{ fontSize: '10px' }}>
                    {item.appointments} apt
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

// Patient Age Groups Component
const PatientAgeGroups = ({ data }) => {
  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="bg-light border-bottom">
        <h5 className="fw-bold mb-0">Patient Age Groups</h5>
      </Card.Header>
      <Card.Body>
        <div className="age-groups-container">
          {data.map((item, index) => (
            <div key={index} className="age-group-item mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">{item.ageGroup} years</span>
                <Badge bg="info" className="rounded-pill">{item.count}</Badge>
              </div>
              <div className="progress" style={{ height: '20px' }}>
                <div
                  className="progress-bar bg-info"
                  role="progressbar"
                  style={{ width: `${item.percentage * 3}%` }}
                  aria-valuenow={item.percentage * 3}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <small className="text-white fw-bold" style={{ fontSize: '11px' }}>
                    {item.percentage}%
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

// Cancellations Report Component
const CancellationsReport = ({ data }) => {
  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-light border-bottom">
        <h5 className="fw-bold mb-0">Cancellations & Efficiency Report</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0" size="sm" striped>
            <thead className="table-light">
              <tr>
                <th>Doctor Name</th>
                <th>Department</th>
                <th>Scheduled</th>
                <th>Completed</th>
                <th>No-Show</th>
                <th>Cancelled</th>
                <th>No-Show Rate</th>
                <th>Reasons</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold">{item.doctor}</td>
                  <td>{item.department}</td>
                  <td>{item.scheduled}</td>
                  <td className="text-success fw-bold">{item.completed}</td>
                  <td>{item.noShow}</td>
                  <td>{item.cancelled}</td>
                  <td>
                    <span
                      className={`fw-bold ${
                        item.noShowRate > 15 ? 'bg-danger-subtle text-danger px-2 py-1 rounded' : ''
                      }`}
                    >
                      {item.noShowRate}%
                    </span>
                  </td>
                  <td>
                    <div className="badge-group">
                      {item.reasons.map((reason, idx) => (
                        <Badge key={idx} bg="light" text="dark" className="me-1 mb-1 border border-secondary">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

// Export Action Component
const ExportActionHub = () => {
  const [loadingStates, setLoadingStates] = useState({
    pdf: false,
    excel: false,
    print: false,
  });

  const handleExport = (type) => {
    setLoadingStates((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
      alert(`${type.toUpperCase()} export completed!`);
    }, 2000);
  };

  return (
    <div className="export-hub">
      <ButtonGroup>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => handleExport('pdf')}
          disabled={loadingStates.pdf}
          className="d-flex align-items-center gap-2"
        >
          {loadingStates.pdf ? (
            <>
              <Spinner animation="grow" size="sm" />
              Processing...
            </>
          ) : (
            <>
              <Download size={16} />
              Download PDF
            </>
          )}
        </Button>
        <Button
          variant="outline-success"
          size="sm"
          onClick={() => handleExport('excel')}
          disabled={loadingStates.excel}
          className="d-flex align-items-center gap-2"
        >
          {loadingStates.excel ? (
            <>
              <Spinner animation="grow" size="sm" />
              Processing...
            </>
          ) : (
            <>
              <FileText size={16} />
              Export Excel
            </>
          )}
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => handleExport('print')}
          disabled={loadingStates.print}
          className="d-flex align-items-center gap-2"
        >
          {loadingStates.print ? (
            <>
              <Spinner animation="grow" size="sm" />
              Processing...
            </>
          ) : (
            <>
              <Printer size={16} />
              Print
            </>
          )}
        </Button>
      </ButtonGroup>
    </div>
  );
};

// Main Component
const AdminReport = () => {
  const [dateRange, setDateRange] = useState('last-month');
  const [department, setDepartment] = useState('all');

  return (
    <Layout>
      <div className="admin-report-bg">
        <Container fluid className="py-4">
          {/* Global Filters */}
          <Card className="mb-4 shadow-sm border-0 filter-card">
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <FloatingLabel controlId="dateRangeFilter" label="📅 Select Date Range">
                    <Form.Select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="border-0 shadow-sm"
                    >
                      <option value="today">Today</option>
                      <option value="this-week">This Week</option>
                      <option value="this-month">This Month</option>
                      <option value="last-month">Last Month</option>
                      <option value="last-quarter">Last Quarter</option>
                      <option value="this-year">This Year</option>
                    </Form.Select>
                  </FloatingLabel>
                </Col>

                <Col md={4}>
                  <FloatingLabel controlId="departmentFilter" label="🏥 Select Department">
                    <Form.Select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="border-0 shadow-sm"
                    >
                      <option value="all">All Departments</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="neurology">Neurology</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="dermatology">Dermatology</option>
                    </Form.Select>
                  </FloatingLabel>
                </Col>

                <Col md={4} className="text-end">
                  <ExportActionHub />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* KPI Cards Row */}
          <Row className="mb-4 g-4">
            {reportData.kpiCards.map((card) => (
              <Col lg={3} md={6} key={card.id}>
                <KPICard card={card} />
              </Col>
            ))}
          </Row>

          {/* Payment Breakdown */}
          <PaymentBreakdown data={reportData.paymentBreakdown} />

          {/* Department Earnings & Age Groups */}
          <Row className="mb-4 g-4">
            <Col lg={6}>
              <DepartmentEarnings data={reportData.departmentEarnings} />
            </Col>
            <Col lg={6}>
              <PatientAgeGroups data={reportData.patientAgeGroups} />
            </Col>
          </Row>

          {/* Cancellations Report */}
          <CancellationsReport data={reportData.cancellationData} />
        </Container>
      </div>
    </Layout>
  );
};

export default AdminReport;
