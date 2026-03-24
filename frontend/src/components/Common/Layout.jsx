import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { Calendar } from 'lucide-react';
import '../../styles/Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-GB', options);
  };

  // Only show dashboard header on the dashboard route
  const showDashboardHeader = location.pathname === '/admin';

  return (
    <div className="layout-container d-flex">
      <Sidebar isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
      <div className={`main-content flex-grow-1 d-flex flex-column ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <TopNavbar onToggleSidebar={toggleSidebar} />
        
        {/* Dashboard Header Bar - Only on Dashboard */}
        {showDashboardHeader && (
          <div className="dashboard-header-bar">
            <div className="dashboard-header-container">
              <h1 className="dashboard-title">Dashboard</h1>
              <div className="date-selector-wrapper">
                <Calendar size={20} className="calendar-icon" />
                <div className="date-selector">
                  <label htmlFor="date-input">Date:</label>
                  <input
                    id="date-input"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="date-input"
                  />
                </div>
                <span className="selected-date">{formatDate(selectedDate)}</span>
              </div>
            </div>
          </div>
        )}

        <main className="page-content flex-grow-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
