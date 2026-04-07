import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profileImg from "../../Assets/Images/Doctor/doctor_profile1.webp";
import data from "../../Assets/Data/doctorsData.json";
import Link from "@mui/material/Link";
import {
  FaThLarge,
  FaCalendarAlt,
  FaUserFriends,
  FaClock,
  FaChartLine,
  FaStar,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaBars,
  FaUser,
  FaCog
} from "react-icons/fa";
import Dashboard from "../Doctor_Dashboard/Dashboard.jsx";
import Appointments from "../Doctor_Appointments/Appointments.jsx";
import Reviews from "../Doctor_Reviews/Reviews.jsx";
import PerformanceDashboard from "../Doctor_Dashboard/PerformanceDashboard.jsx";
import ScheduleAvailability from "../Doctor_Availability/ScheduleAvailability.jsx";
import Patients from "../Doctor_Patients/Patients.jsx";
import Profile from "../Other/Profile.jsx";
import Settings from "../Other/Settings.jsx";
 
 
import "./DoctorHome.css";
 
function DoctorHome() {
    const navigate = useNavigate();
  
  // current module shown on the right side
  const [currModule, setCurrModule] = useState("Dashboard");
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
 
  // Close menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu_container')) {
        setShowMenuDropdown(false);
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
 
  const modules = [
    { icon: <FaThLarge size={15} />, name: "Dashboard" },
    { icon: <FaCalendarAlt size={15} />, name: "Appointments" },
    { icon: <FaUserFriends size={15} />, name: "Patients" },
    { icon: <FaClock size={15} />, name: "Schedule / Availability" },
    { icon: <FaChartLine size={15} />, name: "Performance Overview" },
    { icon: <FaStar size={15} />, name: "Reviews" },
    { icon: <FaSignOutAlt size={15} />, name: "Logout" }
  ];
 
  function search() {
    console.log("searching");
  }
 
  // simple renderer for the right side based on currModule
  function renderSection() {
    switch (currModule) {
      case "Dashboard":
        return <Dashboard />;
      case "Appointments":
        return <Appointments />;
      case "Reviews":
        return <Reviews />;
      case "Patients":
        return <Patients />;
      case "Schedule / Availability":
        return <ScheduleAvailability/>;
        
      case "Performance Overview":
        return <PerformanceDashboard/>;
      case "Profile":
        return <Profile />;
      case "Settings":
        return <Settings />;
      case "Logout":
        // placeholder action; you can plug in real logic later
        navigate("/doctor_auth");
        break;
      default:
        return null;
    }
  }
 
  return (
    <>
      <div className="d_body">
        <div className="d_container">
          <div className="doc_info">
            <img
              className="profilePic doc_profile"
              src={profileImg}
              height="150px"
              width="120"
              alt="Doctor profile"
            />
            <p className="doc_name">
              Dr. {data.doctorDetails.firstName} {data.doctorDetails.lastName}
            </p>
            <p className="doc_qualification">{data.doctorDetails.qualification}</p>
            <hr />
          </div>
 
          <div className="d_menu">
            {modules.map((mod, idx) => (
              <button
                key={idx}
                className={`d_button${
                  currModule === mod.name ? " d_button_active" : ""
                }`}
                onClick={() => setCurrModule(mod.name)}
              >
                {mod.icon} <span>{mod.name}</span>
              </button>
            ))}
          </div>
        </div>
 
        <div className="d_container_right">
          <div className="d_naviBar">
            <h5 className="nav_heading">{currModule}</h5>
            <div className="searchBell">
              <button className="bell">
                <FaBell className="bell_icon" size={20} style={{ color: "#077bf8" }} />
              </button>
              <div className="search">
                <input type="text" placeholder="Search..." />
                <button onClick={search}>
                  <FaSearch size={15} />
                </button>
              </div>
              <div className="menu_container">
                <button
                  className="d_bars"
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                >
                  <FaBars />
                </button>
                {showMenuDropdown && (
                  <div className="menu_dropdown">
                    <button
                      className="dropdown_item"
                      onClick={() => {
                        setCurrModule("Profile");
                        setShowMenuDropdown(false);
                      }}
                    >
                      <FaUser size={14} /> View Profile
                    </button>
                    <button
                      className="dropdown_item"
                      onClick={() => {
                        setCurrModule("Settings");
                        setShowMenuDropdown(false);
                      }}
                    >
                      <FaCog size={14} /> Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
 
          <div className="section">{renderSection()}</div>
        </div>
      </div>
    </>
  );
}
 
export default DoctorHome;
 
 