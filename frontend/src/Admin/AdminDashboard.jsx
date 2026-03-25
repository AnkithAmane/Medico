import React, { useState, useEffect } from 'react';
import Layout from '../../components/Common/Layout';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
} from 'react-bootstrap';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  PhoneCall,
} from 'lucide-react';
import dashboardData from '../../data/dashboardData.json';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState('2026-03-17');
  const [data, setData] = useState(dashboardData);

  useEffect(() => {
    // Load data from JSON
    setData(dashboardData);
  }, []);

  // Icon mapping
  const iconMap = {
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    PhoneCall,
    Clock,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  return (
    <Layout>
      <Container fluid className="py-4 px-4">
        {/* Appointment Stats */}
        <Row className="g-4 mb-4">
          {data.appointmentStats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon];
            return (
              <Col lg={6} md={6} key={index}>
                <Card className="h-100 border-start border-5 shadow-sm hover-shadow" style={{ borderColor: stat.color }}>
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <p className="text-secondary mb-1">{stat.label}</p>
                        <h3 className="mb-0 fw-bold" style={{ color: stat.color }}>
                          {stat.count}
                        </h3>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: `${stat.color}20`,
                          width: '60px',
                          height: '60px',
                        }}
                      >
                        <IconComponent size={28} style={{ color: stat.color }} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Main Content - Row 2: Status & Doctor Activity */}
        <Row className="g-4 mb-4">
          {/* Middle Column - Status Chart */}
          <Col lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Header className="bg-light border-bottom">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <PieChart size={20} className="text-primary" />
                  Status Distribution
                </h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} Appointments`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Doctor Activity */}
          <Col lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Header className="bg-light border-bottom">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <Users size={20} className="text-primary" />
                  Doctor Activity
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-3">
                  {data.doctorActivity.map((activity, index) => {
                    const IconComponent = iconMap[activity.icon];
                    return (
                      <div key={index} className="d-flex align-items-center justify-content-between p-2 rounded bg-light">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: activity.color,
                              width: '40px',
                              height: '40px',
                            }}
                          >
                            <IconComponent size={20} color="white" />
                          </div>
                          <div>
                            <p className="mb-0 small text-secondary">{activity.status}</p>
                            <p className="mb-0 fw-bold">{activity.count} Doctors</p>
                          </div>
                        </div>
                        <Badge bg="light" text="dark" className="fw-bold">
                          {activity.count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Row 3: Appointment Trend - Full Width Horizontal */}
        <Row className="g-4">
          <Col lg={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-light border-bottom">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  Appointment Trend by Time (9 AM - 7 PM)
                </h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={data.trendData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                    <Bar dataKey="appointments" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Dashboard;
