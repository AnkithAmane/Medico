import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar'; // Import the new Top Navbar we built
import './Patient_Home.css';

export default function Patient_Home() {
  return (
    <div className="pat_home_layout">
      {/* The Top Navbar will always be visible */}
      <Navbar />

      {/* This main area changes based on the route (Dashboard, Specialists, etc.) */}
      <main className="pat_home_content_area">
        <Outlet />
      </main>
      
      {/* Optional: You can add a consistent Footer here if needed */}
    </div>
  );
}