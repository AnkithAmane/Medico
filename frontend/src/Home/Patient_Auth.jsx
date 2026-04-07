import React from 'react';
import Unified_Auth from './Auth_Main';
import '../Styles/Home/Patient_Auth.css';

/* ASSET IMPORTS */
import google from "../Assets/Images/Home/google_logo.png";

/* PATIENT SIGN UP FORM COMPONENT */
const PatientSignUp = (
    <div className="auth-form-container sign-up-side">
        <form className="auth-form">
            <h1>Create Account</h1>
            
            {/* Social Login */}
            <div className="social-container">
                <button type="button" className="google-btn">
                    <img 
                        src={google} 
                        alt="Google logo" 
                        className="google-icon"
                    />
                    <span>Sign up with Google</span>
                </button>
            </div>

            <span className="divider-text">or use your email for registration</span>
            
            {/* Input Fields */}
            <div className="input-group">
                <input type="text" placeholder="Full Name" required />
                <span className="input-icon">👤</span>
            </div>
            <div className="input-group">
                <input type="email" placeholder="Email" required />
                <span className="input-icon">✉️</span>
            </div>
            <div className="input-group">
                <input type="password" placeholder="Password" required />
                <span className="input-icon">🔒</span>
            </div>
            
            {/* Consent & Submit */}
            <div className="terms-check">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                    I agree to the <span>Terms & Privacy</span>
                </label>
            </div>

            <button type="submit" className="submit-btn">Sign Up</button>
        </form>
    </div>
);

/* MAIN PATIENT AUTH COMPONENT */
export default function Patient_Auth() {
    return (
        <Unified_Auth 
            role="Patient" 
            themeClass="patient-theme" 
            isPatient={true} 
            logo="❤️" 
            portalName="Patient Portal" 
            description="Create your account to start your journey with Medico+." 
            signUpForm={PatientSignUp} 
        />
    );
}