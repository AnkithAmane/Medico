import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import google from "../../Assets/Images/Home/google_logo.png";
import { useAuth } from '../../context/AuthContext';
import './Sign_In_Form.css';

/**
 * Sign_In_Form Component
 * Manages dual panels for Sign In and Sign Up with role-based navigation logic.
 */
const Sign_In_Form = ({ logo, portalName, setShowForgotPassword, role, setIsRightPanelActive }) => {
  const navigate = useNavigate();
  const { login, register, loading, error } = useAuth();

  // --- State Management ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newGender, setNewGender] = useState("Male");
  const [newDOB, setNewDOB] = useState("1995-01-01");
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");

  // --- Authentication Handlers ---
  
  /**
   * Processes the Sign In request via backend API.
   */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    try {
      console.log('🔄 Attempting login with email:', email);
      
      const result = await login(email, password);
      
      console.log('📤 Login result:', result);
      
      if (!result.success) {
        setLoginError(result.error || "Login failed");
        console.error('❌ Login failed:', result.error);
      }
      // On success, AuthContext redirects automatically by role
    } catch (err) {
      console.error('❌ Login error:', err);
      setLoginError("An error occurred during login");
    }
  };

  /**
   * Processes the Sign Up request via backend API.
   */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignupError("");
    
    try {
      console.log('🔄 Attempting registration with:', {
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        role: role?.toLowerCase() || 'patient',
        contact: newContact
      });
      
      const result = await register(
        newFirstName,
        newLastName,
        newEmail,
        newPassword,
        newContact,
        role?.toLowerCase() || 'patient',
        newGender,
        newDOB
      );
      
      console.log('📤 Registration result:', result);
      
      if (!result.success) {
        setSignupError(result.error || "Registration failed");
      }
      // On success, AuthContext redirects automatically by role
    } catch (err) {
      console.error('❌ Registration error:', err);
      setSignupError("An error occurred during registration");
    }
  };

  return (
    <>
      {/* 1. SIGN IN PANEL (Visible by default) */}
      <div className="sign_in_form_wrapper sign_in_panel">
        <form className="sign_in_form_main" onSubmit={handleSignIn}>
          <h1 className="sign_in_title">Sign In</h1>

          {/* Error Message */}
          {loginError && (
            <div style={{ 
              color: '#d32f2f', 
              textAlign: 'center', 
              marginBottom: '10px',
              padding: '8px',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {loginError}
            </div>
          )}

          {/* Social Auth Option */}
          <div className="sign_in_social_container">
            <button type="button" className="sign_in_google_btn" disabled={loading}>
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
              disabled={loading}
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
              disabled={loading}
            />
            <span className="sign_in_input_icon">🔒</span>
          </div>

          <button 
            type="submit" 
            className="sign_in_submit_btn"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Sub-navigation Links */}
          <div className="sign_in_footer_links">
            <span 
              className="sign_in_footer_link" 
              onClick={() => setShowForgotPassword(true)} 
              style={{ pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.6 : 1 }}
            >
              Forgot Password?
            </span>
            <Link to="/" className="sign_in_link_wrapper" style={{ pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.6 : 1 }}>
              <span className="sign_in_footer_link">⬅ Back to Start</span>
            </Link>
          </div>
        </form>
      </div>

      {/* 2. SIGN UP PANEL (Hidden behind slide animation) */}
      <div className="sign_in_form_wrapper sign_in_signup_panel">
        <form className="sign_in_form_main" onSubmit={handleSignUp}>
          <h1 className="sign_in_title">Create Account</h1>

          {/* Error Message */}
          {signupError && (
            <div style={{ 
              color: '#d32f2f', 
              textAlign: 'center', 
              marginBottom: '10px',
              padding: '8px',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {signupError}
            </div>
          )}

          <div className="sign_in_social_container">
            <button type="button" className="sign_in_google_btn" disabled={loading}>
              <img src={google} alt="Google logo" className="sign_in_google_icon" />
              <span>Sign up with Google</span>
            </button>
          </div>

          <span className="sign_in_divider_text">or use email for registration</span>

          <div className="sign_in_input_group">
            <input 
              type="text" 
              placeholder="First Name" 
              value={newFirstName} 
              onChange={(e) => setNewFirstName(e.target.value)} 
              required
              disabled={loading}
            />
            <span className="sign_in_input_icon">👤</span>
          </div>

          <div className="sign_in_input_group">
            <input 
              type="text" 
              placeholder="Last Name" 
              value={newLastName} 
              onChange={(e) => setNewLastName(e.target.value)} 
              required
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
            <span className="sign_in_input_icon">🔒</span>
          </div>

          <div className="sign_in_input_group">
            <input 
              type="tel" 
              placeholder="Contact Number" 
              value={newContact} 
              onChange={(e) => setNewContact(e.target.value)} 
              required
              disabled={loading}
            />
            <span className="sign_in_input_icon">📱</span>
          </div>

          <div className="sign_in_terms_check">
            <input type="checkbox" id="terms" required disabled={loading} />
            <label htmlFor="terms" style={{ opacity: loading ? 0.6 : 1 }}>I agree to the <span>Terms & Privacy</span></label>
          </div>

          <button 
            type="submit" 
            className="sign_in_submit_btn"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </>
  );
};

export default Sign_In_Form;