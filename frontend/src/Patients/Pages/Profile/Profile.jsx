import React from 'react';
import { useState, useEffect } from 'react';
import patienceData from '../../../Assets/Data/PatientData/PatienceData';
import './Profile.css';

export default function Profile({ userId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchPatientData = () => {
      try {
        const patient = patienceData.patients.find(p => p.patientId === userId || p.name === userId);
        
        if (patient) {
          setProfileData(patient);
          setFormData({
            name: patient.name || "",
            age: patient.age || "",
            email: patient.email || "",
            phoneNumber: patient.phoneNumber || "",
            emergencyNumber: patient.emergencyNumber || "",
            gender: patient.gender || "",
            address: patient.address || "",
          });
          setError(null);
        } else {
          setError('Patient not found');
        }
      } catch (err) {
        setError('Error loading patient data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setProfileData(prev => ({
      ...prev,
      ...formData
    }));
    
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.name,
        age: profileData.age,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        emergencyNumber: profileData.emergencyNumber,
        gender: profileData.gender,
        address: profileData.address,
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return <div className="profile-container"><p>Loading profile...</p></div>;
  }

  if (error && !profileData) {
    return <div className="profile-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Patient Profile</h2>
        {profileData && <p className="patient-id">ID: {profileData.patientId}</p>}
        <div className="profile-buttons">
          {!isEditing ? (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <>
              <button className="btn-save" onClick={handleSave}>Save</button>
              <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
            </>
          )}
        </div>
      </div>

      {saveSuccess && <div className="alert success">✓ Profile updated successfully</div>}
      {error && profileData && <div className="alert error">⚠ {error}</div>}

      <div className="profile-content">
        <div className="section">
          <h3>Personal Information</h3>
          <div className="form-flex">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name || ''} 
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={isEditing ? 'editable' : 'readonly'}
              />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input 
                type="number" 
                name="age"
                value={formData.age || ''} 
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={isEditing ? 'editable' : 'readonly'}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              {isEditing ? (
                <select 
                  name="gender"
                  value={formData.gender || ''} 
                  onChange={handleInputChange}
                  className="editable"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input 
                  type="text" 
                  name="gender"
                  value={formData.gender || ''} 
                  readOnly
                  className="readonly"
                />
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email || ''} 
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={isEditing ? 'editable' : 'readonly' } required 
              />
            </div>
            

          </div>
        </div>
        <div className="section">
          <h3>Contact Information</h3>
          <div className="form-flex">
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber || ''} 
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={isEditing ? 'editable' : 'readonly'}
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact</label>
              <input 
                type="tel" 
                name="emergencyNumber"
                value={formData.emergencyNumber || ''} 
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={isEditing ? 'editable' : 'readonly'}
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea 
                name="address"
                value={formData.address || ''} 
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={isEditing ? 'editable' : 'readonly'}
                rows="3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}