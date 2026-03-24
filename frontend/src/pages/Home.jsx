// Home Page - Landing page for the application
import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Users, BarChart3 } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <Container>
          <span className="navbar-brand fw-bold">
            <Stethoscope className="me-2" size={28} />
            MEDICO
          </span>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="py-5">
        <Container>
          <Row className="align-items-center py-5">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">Healthcare Management System</h1>
              <p className="lead text-secondary mb-4">
                Streamline your healthcare operations with our comprehensive management platform designed for hospitals, clinics, and medical centers.
              </p>
              <div className="gap-3 d-flex flex-wrap">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/admin')}
                >
                  Admin Dashboard
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div 
                style={{
                  width: '100%',
                  height: '400px',
                  backgroundColor: '#e0f2fe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Stethoscope size={120} color="#3b82f6" opacity={0.2} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="mb-5 text-center">
            <Col>
              <h2 className="display-6 fw-bold mb-4">Key Features</h2>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100 text-center p-4">
                <BarChart3 size={48} className="text-primary mb-3 mx-auto" />
                <h5 className="fw-bold mb-2">Analytics Dashboard</h5>
                <p className="text-secondary">
                  Real-time insights into appointments, doctor activity, and patient statistics
                </p>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100 text-center p-4">
                <Users size={48} className="text-success mb-3 mx-auto" />
                <h5 className="fw-bold mb-2">User Management</h5>
                <p className="text-secondary">
                  Manage doctors, patients, and staff with role-based access control
                </p>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100 text-center p-4">
                <Stethoscope size={48} className="text-danger mb-3 mx-auto" />
                <h5 className="fw-bold mb-2">Appointment Management</h5>
                <p className="text-secondary">
                  Schedule, track, and manage patient appointments seamlessly
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <Container className="text-center">
          <p className="mb-0">&copy; 2026 Medico Healthcare. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
};

export default Home;
