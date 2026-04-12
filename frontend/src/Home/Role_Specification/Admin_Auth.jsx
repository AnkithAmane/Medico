import React from 'react';
import Auth_Main from '../Authentication/Auth_Main';

// Styling
import './Admin_Auth.css';

// Admin Authentication Portal
export default function Admin_Auth() {
  return (
    <Auth_Main 
      role="Admin" 
      themeClass="admin-auth-theme" 
      logo="🔑" 
      portalName="Admin Dashboard" 
      description="Access the secure dashboard to manage hospital records and staff." 
    />
  );
}