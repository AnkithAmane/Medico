import './Navbar.css';
import { useState } from 'react';

import Image from '../../assets/Doctors/ArjunReddy.jpg';
  
export default function Navbar({ onSectionChange }) {

  const [profileClicked, setProfileClicked] = useState(false);


  


  function handleprofile(){
    setProfileClicked(()=>!profileClicked);
  }

  function handleprofileSection(section){
    if (onSectionChange) {
      onSectionChange(section);
    }
    handleprofile(); // Close the dropdown after selecting an option
  }
  

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="/">
          🏥 Medico
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link btn  text-white ms-2" aria-current="page" href="/">
                Home
              </a>
            </li>
            
            <li className="nav-item">
              <a className="nav-link btn  text-white ms-2" href="#appointments">
                Book Appointment
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link btn  text-white ms-2" href="#AppointmentsHistory">
                Appointments history
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link btn  text-white ms-2" href="#contact">
                Contact
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link btn btn-primary text-white ms-2" href="#Profile">
                <img className="pProfile" src={Image} alt="Profile" onClick={handleprofile}/>
              </a>
            </li>


          </ul>
          {profileClicked && (
            <div className="pprofileDropdown">
              <p className="dropdown-item" onClick={() => handleprofileSection("Profile")}>
                View Profile
              </p>
              <hr />
              <p className="dropdown-item" onClick={() => handleprofileSection("settings")}>
                Settings
              </p>
              <hr />
              <p className="dropdown-item" onClick={() => handleprofileSection("logout")}>
                Logout
              </p>
            </div>
          )}




        </div>
      </div>
    </nav>
  );
}
