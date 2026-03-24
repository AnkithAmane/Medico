// App Component - The Router (connects all pages)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminAppointments from './pages/Admin/AdminAppointments';
import AdminDoctors from './pages/Admin/AdminDoctors';
import AdminPatients from './pages/Admin/AdminPatients';
import AdminReport from './pages/Admin/AdminReport';
import AdminSettings from './pages/Admin/AdminSettings';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import PatientDashboard from './pages/Patient/PatientDashboard';

import Patience from './pages/Patient/Patient'

function App() {
  
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/patients" element={<AdminPatients />} />
        <Route path="/admin/reports" element={<AdminReport />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/patient" element={<PatientDashboard />} />
      </Routes>
    </Router>
  );
}

export default App
