import { Link } from 'react-router-dom';

/* STYLE IMPORTS */
import '../Styles/Home/Forgot_Password_Form.css';

/**
 * FORGOT PASSWORD FORM
 * Handles the password recovery state within the Auth_Main wrapper.
 */
const ForgotPasswordForm = ({ setShowForgotPassword }) => {
  return (
    <div className="forgot-wrapper">
      
      {/* 1. HEADER SECTION */}
      <div className="forgot-header">
        <h1>Reset Password</h1>
        <p>A recovery link will be sent to your verified email address.</p>
      </div>

      {/* 2. FORM BODY */}
      <form className="forgot-form-body" onSubmit={(e) => e.preventDefault()}>
        
        {/* Input Fields */}
        <div className="input-field-group">
          <div className="input-container">
            <input type="email" placeholder="Email Address" required />
            <span className="input-icon">✉️</span>
          </div>
          
          <div className="input-container">
            <input type="password" placeholder="New Password" required />
            <span className="input-icon">🔒</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-stack">
          <button type="submit" className="main-submit-btn">
            Send Recovery Link
          </button>
          
          <button 
            type="button" 
            className="secondary-outline-btn" 
            onClick={() => setShowForgotPassword(false)}
          >
            Back to Login
          </button>
        </div>
      </form>

      {/* 3. FOOTER NAVIGATION */}
      <div className="forgot-footer">
        <Link to="/" className="home-navigation">
          <span className="arrow">⬅</span> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;