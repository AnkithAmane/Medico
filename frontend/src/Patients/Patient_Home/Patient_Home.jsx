import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Patient_Navbar/Patient_Navbar'; 
import './Patient_Home.css';
import Patient_Onboarding from '../Patient_Onboarding/Patient_Onboarding';
import { useState } from 'react';

export default function Patient_Home() {
  const user = JSON.parse(localStorage.getItem('userData'));
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const isProfileIncomplete = user && (!user.contact || !user.age || !user.bloodGroup);
  return (
    <div className="pat_home_layout">
      
      {/* Persistent Navigation */}
      {isProfileIncomplete && !onboardingComplete && (
        <Patient_Onboarding user={user} setOnboardingComplete={setOnboardingComplete} />
      )}
      <Navbar />

      {/* Dynamic Viewport */}
      <main className="pat_home_content_area">
        <Outlet />
      </main>
      
    </div>
  );
}