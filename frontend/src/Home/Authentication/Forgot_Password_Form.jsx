import { Link } from 'react-router-dom';
import './Forgot_Password_Form.css';

const ForgotPasswordForm = ({ setShowForgotPassword }) => {
  return (
    <div className="forgot_form_wrapper">
      
      {/* Header Section */}
      <div className="forgot_form_header">
        <h1>Reset Password</h1>
        <p>A recovery link will be sent to your verified email address.</p>
      </div>

      {/* Form Content */}
      <form className="forgot_form_body_content" onSubmit={(e) => e.preventDefault()}>
        
        {/* Input Fields */}
        <div className="forgot_form_field_group">
          <div className="forgot_form_input_item">
            <input type="email" placeholder="Email Address" required />
            <span className="forgot_form_glyph">✉️</span>
          </div>
          
          <div className="forgot_form_input_item">
            <input type="password" placeholder="New Password" required />
            <span className="forgot_form_glyph">🔒</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="forgot_form_btn_stack">
          <button type="submit" className="forgot_form_btn_submit">
            Send Recovery Link
          </button>
          
          <button 
            type="button" 
            className="forgot_form_btn_cancel" 
            onClick={() => setShowForgotPassword(false)}
          >
            Back to Login
          </button>
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="forgot_form_nav_footer">
        <Link to="/" className="forgot_form_home_anchor">
          <span className="arrow">⬅</span> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;