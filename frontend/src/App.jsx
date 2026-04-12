import { BrowserRouter, Route, Routes } from 'react-router-dom';

/* --- COMPONENT IMPORTS --- */
import Landing_Page from "./Home/Landing_Page/Landing_Page";
import Patient_Auth from './Home/Role_Specification/Patient_Auth';
import Doctor_Auth from './Home/Role_Specification/Doctor_Auth';
import Admin_Auth from './Home/Role_Specification/Admin_Auth';

// Admin Components
import Admin_Home from './Admin/Admin_Home/Admin_Home';
import Admin_Dashboard from './Admin/Dashboard/Admin_Dashboard';
import Doctor_Management from './Admin/Doctor_Management/Doctor_Management';
import Appointment_Management from './Admin/Appointment_Management/Appointment_Management';
import Patient_Management from './Admin/Patient_Management/Patient_Management';
import Revenue from './Admin/Revenue/Revenue_Management';
import Event_Management from './Admin/Events_Management/Event_Management';
import Statistics from './Admin/Stats/Stats';
import AvailabilityManagement from './Admin/Availability_Management/Availability';
import DepartmentManagement from './Admin/Department_Management/departments';

// Doctor Components
import DoctorHome from './Doctors/Doctor_Home/Doctor_Home';
import DoctorAppointments from './Doctors/Doctor_Appointments/Doctor_Appointments';
import PerformanceDashboard from './Doctors/Doctor_Dashboard/Doctor_Performance_Dashboard';
import ScheduleAvailability from './Doctors/Doctor_Availability/Doctor_Availability';
import Dashboard from './Doctors/Doctor_Dashboard/Doctor_Dashboard';
import Patients from './Doctors/Doctor_Patients/Doctor_Patients';
import Reviews from './Doctors/Doctor_Reviews/Doctor_Reviews';

// Common/Other
import Patient from './Patients/Pages/Patient';
import Profile from './Doctors/Other/Doctor_Profile';
import Settings from './Doctors/Other/Doctor_Settings';

/**
 * MAIN APPLICATION COMPONENT
 * Handles global routing for the Medico+ Ecosystem.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Landing_Page />} />
        <Route path="/landing_page" element={<Landing_Page />} />

        {/* --- AUTHENTICATION ROUTES --- */}
        <Route path="/patient_auth" element={<Patient_Auth />} />
        <Route path="/doctor_auth" element={<Doctor_Auth />} />
        <Route path="/admin_auth" element={<Admin_Auth />} />

        {/* --- PATIENT ROUTES --- */}
        <Route path="/patient_home/*" element={<Patient />} /> 

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin" element={<Admin_Home />}>
          <Route index element={<Admin_Dashboard />} /> 
          <Route path="dashboard" element={<Admin_Dashboard />} />
          <Route path="doctor_management" element={<Doctor_Management />} />
          <Route path="appointment_management" element={<Appointment_Management />} />
          <Route path="patient_management" element={<Patient_Management />} />
          <Route path="revenue_details" element={<Revenue />} />
          <Route path="event_management" element={<Event_Management />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="schedule_management" element={<AvailabilityManagement />} />
          <Route path="department_management" element={<DepartmentManagement />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* --- DOCTOR ROUTES --- */}
        <Route path="/doctor" element={<DoctorHome />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<Patients />} />
          <Route path="schedule" element={<ScheduleAvailability />} />
          <Route path="performance" element={<PerformanceDashboard />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;