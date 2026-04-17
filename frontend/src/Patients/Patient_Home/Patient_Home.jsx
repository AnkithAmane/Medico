import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Patient_Navbar/Patient_Navbar'; 
import './Patient_Home.css';

export default function Patient_Home() {
  return (
    <div className="pat_home_layout">
      
      {/* Persistent Navigation */}
      <Navbar />

      {/* Dynamic Viewport */}
      <main className="pat_home_content_area">
        <Outlet />
      </main>
      
    </div>
  );
}