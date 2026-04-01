import React from 'react';
import Auth_Main from './Auth_Main';

/* STYLE IMPORTS */
import '../Styles/Home/Admin_Auth.css';

/**
 * ADMIN AUTHENTICATION PORTAL
 * Secure access point for system administrators.
 */
export default function Admin_Auth() {
    return (
        <Auth_Main 
            role="Admin" 
            themeClass="admin-theme" 
            logo="🔑" 
            portalName="Admin Dashboard" 
            description="Access the secure dashboard to manage hospital records and staff." 
        />
    );
}