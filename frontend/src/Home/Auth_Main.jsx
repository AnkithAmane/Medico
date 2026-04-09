import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* ASSET IMPORTS */
import ambulance from "../Assets/Images/Home/ambulancia.gif";
import heart from "../Assets/Images/Home/heart.gif";
import lungs from "../Assets/Images/Home/lungs.gif";
import syringe from "../Assets/Images/Home/syringe.gif";
import prescription from "../Assets/Images/Home/prescription.gif";

/* COMPONENT IMPORTS */
import SignInForm from './Sign_In_Form';
import ForgotPasswordForm from './Forgot_Password_Form';

/* STYLE IMPORTS */
import '../Styles/Home/Auth_Main.css';

function Auth_Main({ 
    role, 
    themeClass, 
    logo, 
    portalName, 
    description, 
    isPatient = false, 
    signUpForm 
}) {
    /* STATE MANAGEMENT */
    const [showAuth, setShowAuth] = useState(false);
    const [authActive, setAuthActive] = useState(false);
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

   /* ENTRANCE ANIMATION LOGIC */
    useEffect(() => {
        const ambulanceEl = document.getElementById('ambulance-intro');
    
        if (ambulanceEl) {
            setTimeout(() => {
                ambulanceEl.style.left = '26%';
            }, 50);

            setTimeout(() => {
                if (ambulanceEl) ambulanceEl.style.opacity = '0';
                setShowAuth(true);
                setTimeout(() => setAuthActive(true), 100);
            }, 1500); // Increased slightly to let the slide finish
        }
    }, []);

    /* HELPER FUNCTIONS */
    const resetToStart = () => {
        setAuthActive(false);
        setShowAuth(false);
        setShowForgotPassword(false);
    };

    return (
        <div className={`hospital-intro ${themeClass}`}>
            
            {/* 1. BACKGROUND DECORATIVE LAYER */}
            <div className="background-layer">
                <img src={heart} className="bg-image resize" style={{ top: '3%', left: '3%' }} alt="Heart" />
                <img src={lungs} className="bg-image resize" style={{ top: '3%', right: '3%' }} alt="Lungs" />
                <img src={syringe} className="bg-image resize" style={{ bottom: '7%', left: '3%'}} alt="Syringe" />
                <img src={prescription} className="bg-image resize" style={{ bottom: '3%', right: '3%', width: '170px' }} alt="Prescription" />
            </div>

            {/* 2. AMBULANCE INTRO ANIMATION */}
            {!showAuth && (
                <img 
                    src={ambulance} 
                    className="ambulance-intro" 
                    id="ambulance-intro" 
                    alt="Ambulance" 
                />
            )}

            {/* 3. MAIN AUTHENTICATION WRAPPER */}
            {showAuth && (
                <div className={`auth-wrapper ${authActive ? 'active' : ''}`}>
                    <div className="auth-page-flex">
                        
                        {/* CRITICAL: The auth-container handles the dimensions. 
                            'forgot-active' triggers the resize in ForgotPasswordForm.css 
                        */}
                        <div className={`auth-container 
                            ${isRightPanelActive ? 'right-panel-active' : ''} 
                            ${showForgotPassword ? 'forgot-active' : ''}`}>
                            
                            {showForgotPassword ? (
                                /* FORGOT PASSWORD STATE */
                                <ForgotPasswordForm 
                                    setShowForgotPassword={setShowForgotPassword} 
                                    resetToStart={resetToStart} 
                                />
                            ) : (
                                /* NORMAL AUTH STATE (SIGN IN / SIGN UP) */
                                <>
                                    {/* Sliding Sign Up form (Patient specific) */}
                                    {isPatient && signUpForm}
                                    
                                    {/* Standard Sign In Form */}
                                    <SignInForm 
                                        logo={logo} 
                                        portalName={portalName} 
                                        setShowForgotPassword={setShowForgotPassword} 
                                        role={role} /* <--- CRITICAL: Connects the role to the button */
                                        setIsRightPanelActive={setIsRightPanelActive}
                                    />

                                    {/* SLIDING OVERLAYS */}
                                    <div className="overlay-container">
                                        <div className="overlay">
                                            
                                            {/* LEFT OVERLAY: Visible when Sign Up is active */}
                                            <div className="overlay-panel overlay-left">
                                                <h1>Welcome Back!</h1>
                                                <p>To keep connected with us please login with your personal info</p>
                                                <button 
                                                    type="button" 
                                                    className="ghost-btn" 
                                                    onClick={() => setIsRightPanelActive(false)}
                                                >
                                                    Sign In
                                                </button>
                                            </div>

                                            {/* RIGHT OVERLAY: Visible when Sign In is active */}
                                            <div className="overlay-panel overlay-right">
                                                <h1>Hello, {role}!</h1>
                                                <p>{description}</p>
                                                {isPatient && (
                                                    <button 
                                                        type="button" 
                                                        className="ghost-btn" 
                                                        onClick={() => setIsRightPanelActive(true)}
                                                    >
                                                        Sign Up
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Auth_Main;