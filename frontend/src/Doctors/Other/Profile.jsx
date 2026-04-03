import React, { useState } from "react";
import data from "../../Assets/Data/doctorsData.json";
import profileImg from "../../Assets/Images/Doctor/doctor_profile1.webp";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaStethoscope, FaGraduationCap } from "react-icons/fa";
import "./Profile.css";
 
export default function Profile() {
  const doctorData = {
    firstName: data.doctorDetails.firstName,
    lastName: data.doctorDetails.lastName,
    qualification: data.doctorDetails.qualification,
    email: data.doctorDetails.email,
    phone: data.doctorDetails.phone,
    address: data.doctorDetails.address,
    specialization: data.doctorDetails.specialization,
    experience: data.doctorDetails.experience,
    licenseNumber: data.doctorDetails.licenseNumber,
    workingHours: data.doctorDetails.workingHours
  };
 
  const [formState, setFormState] = useState(doctorData);
  const [isEditing, setIsEditing] = useState(false);
 
  const resetForm = () => setFormState(doctorData);
 
  const handleChange = (key, value) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };
 
  const handleSave = () => {
    setIsEditing(false);
    // In a real app this would post to an API.
    console.log("Profile saved", formState);
  };
 
  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };
 
  return (
    <div className="doctor-profile_container">
      <div className="doctor-profile_content">
        <div className="doctor-profile_image_section">
          <div className="doctor-image_container">
            <img
              src={profileImg}
              alt="Doctor Profile"
              className="doctor-profile_main_image"
            />
          </div>
          <div className="doctor_basic_info">
            <h2>Dr. {formState.firstName} {formState.lastName}</h2>
            <p className="qualification">{formState.qualification}</p>
            <p className="specialization">{formState.specialization}</p>
            <div className="profile_actions">
              {isEditing ? (
                <>
                  <button className="btn btn-primary" onClick={handleSave}>Save</button>
                  <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
              )}
            </div>
          </div>
        </div>
 
        <div className="doctor-profile_details_section">
          <div className="doctor-details_grid">
            {/* Personal Information */}
            <div className="doctor-detail_card">
              <div className="doctor-card_header">
                <FaUser className="doctor-card_icon" />
                <h4>Personal Information</h4>
              </div>
              <div className="doctor-card_content">
                <div className="doctor-form_group">
                  <label>First Name</label>
                  {isEditing ? (
                    <input type="text" value={formState.firstName} onChange={e => handleChange("firstName", e.target.value)} />
                  ) : (
                    <p className="doctor-form_value">{formState.firstName}</p>
                  )}
                </div>
                <div className="doctor-form_group">
                  <label>Last Name</label>
                  {isEditing ? (
                    <input type="text" value={formState.lastName} onChange={e => handleChange("lastName", e.target.value)} />
                  ) : (
                    <p className="doctor-form_value">{formState.lastName}</p>
                  )}
                </div>
                <div className="doctor-form_group">
                  <label>Qualification</label>
                  {isEditing ? (
                    <input type="text" value={formState.qualification} onChange={e => handleChange("qualification", e.target.value)} />
                  ) : (
                    <p className="doctor-form_value">{formState.qualification}</p>
                  )}
                </div>
              </div>
            </div>
 
            {/* Professional Details */}
            <div className="doctor-detail_card">
              <div className="doctor-card_header">
                <FaStethoscope className="doctor-card_icon" />
                <h4>Professional Details</h4>
              </div>
              <div className="doctor-card_content">
                <div className="doctor-form_group">
                  <label>Specialization</label>
                  {isEditing ? (
                    <input type="text" value={formState.specialization} onChange={e => handleChange("specialization", e.target.value)} />
                  ) : (
                    <p className="doctor-form_value">{formState.specialization}</p>
                  )}
                </div>
                <div className="doctor-form_group">
                  <label>Experience</label>
                  {isEditing ? (
                    <input type="text" value={formState.experience} onChange={e => handleChange("experience", e.target.value)} />
                  ) : (
                    <p className="doctor-form_value">{formState.experience}</p>
                  )}
                </div>
                <div className="doctor-form_group">
                  <label>License Number</label>
                  {isEditing ? (
                    <input type="text" value={formState.licenseNumber} onChange={e => handleChange("licenseNumber", e.target.value)} />
                  ) : (
                    <p className="doctor-form_value">{formState.licenseNumber}</p>
                  )}
                </div>
              </div>
            </div>
 
            {/* Contact Information */}
            <div className="doctor-detail_card">
              <div className="doctor-card_header">
                <FaEnvelope className="doctor-card_icon" />
                <h4>Contact Information</h4>
              </div>
              <div className="doctor-card_content">
                <div className="doctor-form_group">
                  <label><FaEnvelope /> Email</label>
                  {isEditing ? (
                    <input type="email" value={formState.email} onChange={e => handleChange("email", e.target.value)} />
                  ) : (
                    <p className="doctor-form_value">{formState.email}</p>
                  )}
                </div>
                <div className="doctor-form_group">
                  <label><FaPhone /> Phone</label>
                  {isEditing ? (
                    <input type="tel" value={formState.phone} onChange={e => handleChange("phone", e.target.value)} />
                  ) : (
                    <p className="doctor-form_value">{formState.phone}</p>
                  )}
                </div>
                <div className="doctor-form_group">
                  <label><FaMapMarkerAlt /> Address</label>
                  {isEditing ? (
                    <input type="text" value={formState.address} onChange={e => handleChange("address", e.target.value)} />
                  ) : (
                    <p className="doctor-form_value">{formState.address}</p>
                  )}
                </div>
              </div>
            </div>
 
            {/* Working Hours */}
            <div className="doctor-detail_card">
              <div className="doctor-card_header">
                <FaClock className="doctor-card_icon" />
                <h4>Working Hours</h4>
              </div>
              <div className="doctor-card_content">
                <div className="doctor-working_hours">
                  <div className="hour_item">
                    <span className="day">Monday - Friday</span>
                    <span className="time">{doctorData.workingHours.mondayFriday}</span>
                  </div>
                  <div className="hour_item">
                    <span className="day">Saturday</span>
                    <span className="time">{doctorData.workingHours.saturday}</span>
                  </div>
                  <div className="hour_item">
                    <span className="day">Sunday</span>
                    <span className="time emergency">{doctorData.workingHours.sunday}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}