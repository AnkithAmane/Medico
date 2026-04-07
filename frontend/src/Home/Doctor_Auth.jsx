import React from 'react';
import Unified_Auth from './Auth_Main';

/* STYLE IMPORTS */
import '../Styles/Home/Doctor_Auth.css';

/**
 * DOCTOR AUTHENTICATION PORTAL
 * Uses the Auth_Main wrapper with a specific Doctor theme.
 */
export default function Doctor_Auth() {
    return (
        <Unified_Auth 
            role="Doctor" 
            themeClass="doctor-theme" 
            logo="🩺" 
            portalName="Doctor Portal" 
            description="Access patient records and manage your appointments efficiently." 
        />
    );
}