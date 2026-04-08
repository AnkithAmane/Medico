import { BrowserRouter, Route, Routes } from 'react-router-dom';

/* COMPONENT IMPORTS */
import Landing_Page from "./Home/Landing_Page";
import Patient_Auth from './Home/Patient_Auth';
import Doctor_Auth from './Home/Doctor_Auth';
import Admin_Auth from './Home/Admin_Auth';
import Admin_Home from './Admin/Admin_Home/Admin_Home';
import Admin_Dashboard from './Admin/Dashboard/Admin_Dashboard';
import Doctor_Management from './Admin/Doctor_Management/Doctor_Management';
import Appointment_Management from './Admin/Appointment_Management/Appointment_Management';
import Patient_Management from './Admin/Patient_Management/Patient_Management';
import Revenue from './Admin/Revenue/Revenue_Management';
import Event_Management from './Admin/Events_Management/Event_Management';
import Statistics from './Admin/stats/Stats';
import AvailabilityManagement from './Admin/Availability_Management/Availability';
import DepartmentManagement from './Admin/Department_Management/departments';
import DoctorHome from './Doctors/Doctor_Home/Doctor_Home';
import Patient from './Patients/Pages/Patient'
/**
 * MAIN APPLICATION COMPONENT
 * Handles global routing for the Medico+ Ecosystem.
 */
function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        /* --- PUBLIC ROUTES --- */
        <Route path="/" element={<Landing_Page />} />
        <Route path="/landing_page" element={<Landing_Page />} />

        /* --- AUTHENTICATION ROUTES --- */
        <Route path="/patient_auth" element={<Patient_Auth />} />
        <Route path="/doctor_auth" element={<Doctor_Auth />} />
        <Route path="/admin_auth" element={<Admin_Auth />} />

        /* --- DASHBOARD / HOME ROUTES --- */
        {/* These connect to the navigate() calls in your SignInForm */}
        <Route path="/patient_home/*" element={<Patient />} /> 
       
        <Route path="/doctor_home" element={<DoctorHome />} />  {/* Doctor Home */}
        <Route path="/admin" element={<Admin_Home />}>
    {/* This is the key: it makes Admin_Dashboard the default view */}
    <Route index element={<Admin_Dashboard />} /> 
    
    <Route path="dashboard" element={<Admin_Dashboard />} />
    <Route path="d_m" element={<Doctor_Management />} />
    <Route path="a_m" element={<Appointment_Management />} />
    <Route path="p_m" element={<Patient_Management />} />
    <Route path="r" element={<Revenue />} />
    <Route path="e" element={<Event_Management />} />
    <Route path="s" element={<Statistics />} />
    <Route path="a" element={<AvailabilityManagement />} />
    <Route path="d" element={<DepartmentManagement />} />
</Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;