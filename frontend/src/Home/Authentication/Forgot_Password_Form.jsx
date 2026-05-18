import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Forgot_Password_Form.css";

const Forgot_Password_Form = ({ setShowForgotPassword }) => {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false); // Controls which fields show
  const [loading, setLoading] = useState(false);

  /* Phase 1: Verify Current Credentials */
  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Make sure to include 'role' if your signin controller requires it
      await axios.post("http://localhost:5000/api/auth/signin", {
        email,
        password: oldPassword,
        role: "Patient", // or "Doctor", depending on who is using this form
      });

      setIsVerified(true);
      setLoading(false);
    } catch (err) {
      // If it's a 401, this alert will catch it
      alert(err.response?.data?.message || "Invalid current credentials.");
      setLoading(false);
    }
  };
  /* Phase 2: Update to New Password */
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      // NOTE: You should create a specific 'update-password' route in your backend
      await axios.put("http://localhost:5000/api/auth/update-password", {
        email,
        newPassword,
      });

      alert("Security Registry Updated! Please login with your new password.");
      setShowForgotPassword(false);
    } catch (err) {
      alert("Update failed. Please try again.");
    }
  };

  return (
    <div className="forgot_form_wrapper">
      <div className="forgot_form_header">
        <h1>{isVerified ? "Create New Password" : "Verify Identity"}</h1>
        <p>
          {isVerified
            ? "Almost there. Set your new secure access."
            : "Enter current credentials to proceed."}
        </p>
      </div>

      <form
        className="forgot_form_body_content"
        onSubmit={isVerified ? handleUpdatePassword : handleVerifyIdentity}
      >
        <div className="forgot_form_field_group">
          {/* EMAIL - Always visible but disabled after verification */}
          <div className="forgot_form_input_item">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isVerified}
              required
            />
            <span className="forgot_form_glyph">✉️</span>
          </div>

          {!isVerified ? (
            /* PHASE 1 FIELD */
            <div className="forgot_form_input_item">
              <input
                type="password"
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <span className="forgot_form_glyph">🔑</span>
            </div>
          ) : (
            /* PHASE 2 FIELD */
            <div className="forgot_form_input_item">
              <input
                type="password"
                placeholder="New Secure Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span className="forgot_form_glyph">🔒</span>
            </div>
          )}
        </div>

        <div className="forgot_form_btn_stack">
          <button
            type="submit"
            className="forgot_form_btn_submit"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : isVerified
                ? "Update Password"
                : "Next Step"}
          </button>

          <button
            type="button"
            className="forgot_form_btn_cancel"
            onClick={() => setShowForgotPassword(false)}
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="forgot_form_nav_footer">
        <Link to="/" className="forgot_form_home_anchor">
          <span className="arrow">⬅</span> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Forgot_Password_Form;
