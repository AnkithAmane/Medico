import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import google from "../../Assets/Images/Home/google_logo.png";
import './Sign_In_Form.css';

/**
 * Sign_In_Form Component
 * Manages dual panels for Sign In and Sign Up with role-based navigation logic.
 */
const Sign_In_Form = ({ logo, portalName, setShowForgotPassword, role, setIsRightPanelActive }) => {
  const navigate = useNavigate();

  // --- State Management ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // --- Authentication Handlers ---
  
  /**
   * Processes the Sign In request based on the selected user role.
   */
  const handleSignIn = (e) => {
    e.preventDefault();
    switch (role) {
      case "Admin":
        if (email === "admin@gmail.com" && password === "admin") navigate("/admin");
        else alert("Invalid Admin Credentials");
        break;
      case "Doctor":
        if (email === "doctor@gmail.com" && password === "doctor") navigate("/doctor_home");
        else alert("Invalid Doctor Credentials");
        break;
      case "Patient":
        // Logic for local simulation of a created account
        if (newEmail !== "" && email === newEmail && password === newPassword) {
          navigate("/patient_home");
        } else {
          alert("Invalid Patient Credentials");
        }
        break;
      default:
        console.error("No role detected");
    }
  };

  /**
   * Processes the Sign Up request and switches panel back to Sign In.
   */
  const handleSignUp = (e) => {
    e.preventDefault();
    alert(`Account created for ${newName}! Redirecting to Sign In...`);
    setNewName("");
    setIsRightPanelActive(false);
    setEmail(newEmail);
    setPassword(newPassword);
  };

  return (
    <>
      {/* 1. SIGN IN PANEL (Visible by default) */}
      <div className="sign_in_form_wrapper sign_in_panel">
        <form className="sign_in_form_main" onSubmit={handleSignIn}>
          <h1 className="sign_in_title">Sign In</h1>

          {/* Social Auth Option */}
          <div className="sign_in_social_container">
            <button type="button" className="sign_in_google_btn">
              <img src={google} alt="Google logo" className="sign_in_google_icon" />
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* Dynamic Branding Injection */}
          <div className="sign_in_brand_box">
            <div className="sign_in_logo_icon">{logo}</div>
            <p className="sign_in_portal_name">{portalName}</p>
          </div>

          {/* Credential Inputs */}
          <div className="sign_in_input_group">
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <span className="sign_in_input_icon">✉️</span>
          </div>

          <div className="sign_in_input_group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <span className="sign_in_input_icon">🔒</span>
          </div>

          <button type="submit" className="sign_in_submit_btn">Sign In</button>

          {/* Sub-navigation Links */}
          <div className="sign_in_footer_links">
            <span 
              className="sign_in_footer_link" 
              onClick={() => setShowForgotPassword(true)} 
            >
              Forgot Password?
            </span>
            <Link to="/" className="sign_in_link_wrapper">
              <span className="sign_in_footer_link">⬅ Back to Start</span>
            </Link>
          </div>
        </form>
      </div>

      {/* 2. SIGN UP PANEL (Hidden behind slide animation) */}
      <div className="sign_in_form_wrapper sign_in_signup_panel">
        <form className="sign_in_form_main" onSubmit={handleSignUp}>
          <h1 className="sign_in_title">Create Account</h1>

          <div className="sign_in_social_container">
            <button type="button" className="sign_in_google_btn">
              <img src={google} alt="Google logo" className="sign_in_google_icon" />
              <span>Sign up with Google</span>
            </button>
          </div>

          <span className="sign_in_divider_text">or use email for registration</span>

          <div className="sign_in_input_group">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              required 
            />
            <span className="sign_in_input_icon">👤</span>
          </div>

          <div className="sign_in_input_group">
            <input 
              type="email" 
              placeholder="Email" 
              value={newEmail} 
              onChange={(e) => setNewEmail(e.target.value)} 
              required 
            />
            <span className="sign_in_input_icon">✉️</span>
          </div>

          <div className="sign_in_input_group">
            <input 
              type="password" 
              placeholder="Password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
            />
            <span className="sign_in_input_icon">🔒</span>
          </div>

          <div className="sign_in_terms_check">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">I agree to the <span>Terms & Privacy</span></label>
          </div>

          <button type="submit" className="sign_in_submit_btn">Sign Up</button>
        </form>
      </div>
    </>
  );
};

export default Sign_In_Form;