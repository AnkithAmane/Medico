import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* STYLE IMPORTS */
import '../Styles/Home/Sign_In_Form.css';

/* ASSET IMPORTS */
import google from "../Assets/Images/Home/google_logo.png";

/**
 * SIGN IN FORM COMPONENT
 * Handles authentication and role-based redirection.
 */
const SignInForm = ({ logo, portalName, setShowForgotPassword, role }) => {
  const navigate = useNavigate();

  /* ROLE-BASED NAVIGATION LOGIC */
  const handleSignIn = (e) => {
    e.preventDefault();

    switch (role) {
      case "Patient":
        navigate("/patient_home");
        break;
      case "Doctor":
        navigate("/doctor_home");
        break;
      case "Admin":
        navigate("/admin");
        break;
      default:
        console.error("No role detected");
    }
  };

  return (
    <div className="auth-form-container sign-in-side">
      <form className="auth-form" onSubmit={handleSignIn}>
        
        {/* 1. HEADER & SOCIAL LOGIN */}
        <h1>Sign In</h1>
        <div className="social-container">
          <button type="button" className="google-btn">
            <img src={google} alt="Google logo" className="google-icon" />
            <span>Sign in with Google</span>
          </button>
        </div>

        {/* 2. DYNAMIC PORTAL BRANDING */}
        <div className="logo-container">
          <div className="shield">{logo}</div>
          <p className="portal-name">{portalName}</p>
        </div>

        {/* 3. INPUT FIELDS */}
        <div className="input-group">
          <input type="email" placeholder="Email" required />
          <span className="input-icon">✉️</span>
        </div>
        <div className="input-group">
          <input type="password" placeholder="Password" required />
          <span className="input-icon">🔒</span>
        </div>

        {/* 4. SUBMIT ACTION */}
        <button type="submit" className="submit-btn">Sign In</button>
        
        {/* 5. FOOTER NAVIGATION */}
        <div className="form-footer-links">
          <span 
            className="footer-link" 
            onClick={() => setShowForgotPassword(true)}
            style={{ cursor: 'pointer' }}
          >
            Forgot Password?
          </span>
          
          <Link to="/" className="link">
            <span className="footer-link">⬅ Back to Start</span>
          </Link>
        </div>

      </form>
    </div>
  );
};

export default SignInForm;