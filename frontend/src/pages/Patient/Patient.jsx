import React, { useState } from 'react';

import Navbar from '../../components/Patient/Navbar.jsx';

import Search from '../../components/Patient/Search.jsx';

import Profile from './Profile.jsx'

export default function Patience() {
  const [selectedSection, setSelectedSection] = useState('');

  const renderContent = () => {
    switch (selectedSection) {
      case 'Profile':
        return <Profile />;
      case 'settings':
        return <div className="settings-container"><h2>Settings</h2><p>Settings content here.</p></div>;
      case 'logout':
        // Handle logout
        localStorage.clear();
        window.location.href = '/';
        return null;
      default:
        return <Search />;
    }
  };
    
  return (
    <div>
      <Navbar onSectionChange={setSelectedSection} />
      {renderContent()}
    </div>
  );
}
