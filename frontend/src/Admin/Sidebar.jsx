import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { Nav, Button, Offcanvas } from 'react-bootstrap';
import '../../styles/Sidebar.css';

const Sidebar = ({ isOpen, onToggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
    { icon: Users, label: 'Patients', path: '/admin/patients' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header border-bottom pb-3 mb-3">
        <div className="sidebar-logo-wrapper">
          <img src="/logoo.jpg" alt="Medico Logo" className="sidebar-logo rounded" />
          <div className={`sidebar-brand ${isOpen ? 'show' : 'hide'}`}>
            <h2 className="sidebar-brand-text">Medico</h2>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => window.innerWidth < 768 && onToggleSidebar && onToggleSidebar()}
            >
              <Icon size={24} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer border-top pt-3 mt-auto">
        <Button
          variant="outline-danger"
          size="sm"
          className="w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
