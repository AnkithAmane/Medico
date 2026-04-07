import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate
import './Patient.css';
import Profile from '../Patients/Profile/Profile';
import ContactPage from '../Pages/Contact';
import AppointmentData from '../Patients/AppointmentData/AppointmentData';
import MedicationTests from '../Patients/TestsAndMedicines/MedicationTests';
import Settings from '../Patients/Profile/Settings';
import Search from '../Patients/AppointmentBooking/AppointmentBooking'; // Check this path
import Navbar from '../Patients/Navbar/Navbar';

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