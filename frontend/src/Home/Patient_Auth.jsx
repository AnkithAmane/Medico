import React, { useState } from 'react';
import Unified_Auth from './Auth_Main';
import '../Styles/Home/Patient_Auth.css';

export default function Patient_Auth() {
       return (
        <Unified_Auth 
            role="Patient" 
            themeClass="patient-theme" 
            isPatient={true} 
            logo="❤️" 
            portalName="Patient Portal" 
            description="Create your account to start your journey with Medico+."        
        />
    );
}