import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate
import './Patient.css';
import Profile from '../Profile/Profile'
import ContactPage from './Contact';
import AppointmentData from '../AppointmentData/AppointmentData';
import MedicationTests from '../TestsAndMedicines/MedicationTests';
import Settings from '../Profile/Settings';
import Search from '../AppointmentBooking/AppointmentBooking'; // Check this path
import Navbar from '../Navbar/Navbar';

// import 'bootstrap/dist/css/bootstrap.min.css';
export default function Patient() {
  return (
    <>
    {localStorage.setItem("patientId", "PAT000000001")}
      <Navbar />
      <div className="patience-content-wrapper"> 
        <Routes>
          
          <Route path="/" element={<Navigate to="dashboard" replace />} />

          
          <Route path="dashboard" element={<Search />} />
          <Route path="profile" element={<Profile userId="PAT000000001" />} />
          <Route path="appointments" element={<AppointmentData />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="medication-tests" element={<MedicationTests />} />
          <Route path="settings" element={<Settings />} />
         
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
}