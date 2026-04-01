import { BrowserRouter, Route, Routes } from 'react-router-dom';

/* COMPONENT IMPORTS */
import Landing_Page from "./Home/Landing_Page";
import Patient_Auth from './Home/Patient_Auth';
import Doctor_Auth from './Home/Doctor_Auth';
import Admin_Auth from './Home/Admin_Auth';
import Admin_Home from './Admin/AdminDashboard.jsx'
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
        <Route path="/patient_home" element={<Landing_Page />} /> {/* Patient Home */}
        <Route path="/doctor_home" element={<Doctor_Auth />} />  {/* Doctor Home */}
        <Route path="/admin_home" element={<Admin_Home />} />   {/* Admin Home */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;