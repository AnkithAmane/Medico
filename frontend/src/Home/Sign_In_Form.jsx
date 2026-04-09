import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Home/Sign_In_Form.css';
import google from "../Assets/Images/Home/google_logo.png";

const SignInForm = ({ logo, portalName, setShowForgotPassword, role, setIsRightPanelActive }) => {
  const navigate = useNavigate();
  
  // States for Sign In
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // States for Sign Up
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /* SIGN IN LOGIC */
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
        if (newEmail !== "" && email === newEmail && password === newPassword) {
          navigate("/patient_home");
        } 
        else {
          alert("Invalid Patient Credentials");
        }
        break;
      default:
        console.error("No role detected");
    }
  };

  /* SIGN UP LOGIC */
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
      {/* SIGN IN SIDE */}
      <div className="auth-form-container sign-in-side">
        <form className="auth-form" onSubmit={handleSignIn}>
          <h1>Sign In</h1>
          <div className="social-container">
            <button type="button" className="google-btn">
              <img src={google} alt="Google logo" className="google-icon" />
              <span>Sign in with Google</span>
            </button>
          </div>
          <div className="logo-container">
            <div className="shield">{logo}</div>
            <p className="portal-name">{portalName}</p>
          </div>
          <div className="input-group">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <span className="input-icon">✉️</span>
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <span className="input-icon">🔒</span>
          </div>
          <button type="submit" className="submit-btn">Sign In</button>
          <div className="form-footer-links">
            <span className="footer-link" onClick={() => setShowForgotPassword(true)} style={{ cursor: 'pointer' }}>Forgot Password?</span>
            <Link to="/" className="link"><span className="footer-link">⬅ Back to Start</span></Link>
          </div>
        </form>
      </div>

      {/* SIGN UP SIDE */}
      <div className="auth-form-container sign-up-side">
        <form className="auth-form" onSubmit={handleSignUp}>
          <h1>Create Account</h1>
          <div className="social-container">
            <button type="button" className="google-btn">
              <img src={google} alt="Google logo" className="google-icon" />
              <span>Sign up with Google</span>
            </button>
          </div>
          <span className="divider-text">or use your email for registration</span>
          <div className="input-group">
            <input type="text" placeholder="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            <span className="input-icon">👤</span>
          </div>
          <div className="input-group">
            <input type="email" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
            <span className="input-icon">✉️</span>
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <span className="input-icon">🔒</span>
          </div>
          <div className="terms-check">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">I agree to the <span>Terms & Privacy</span></label>
          </div>
          <button type="submit" className="submit-btn">Sign Up</button>
        </form>
      </div>
    </>
  );
};

export default SignInForm;