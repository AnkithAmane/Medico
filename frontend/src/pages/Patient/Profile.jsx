import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import patienceData from '../../data/PatienceData';
import './Profile.css';

export default function Profile({ userId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch patient data based on userId
  useEffect(() => {
    const fetchPatientData = () => {
      try {
        // Find patient by ID from mock data
        const patient = patienceData.patients.find(p => p.patientId === userId || p.name === userId);
        
        if (patient) {
          setProfileData(patient);
          setFormData({
            name: patient.name,
            age: patient.age,
            email: patient.email,
            phoneNumber: patient.phoneNumber,
            emergencyNumber: patient.emergencyNumber,
            gender: patient.gender,
            address: patient.address,
            reasonForVisit: patient.reasonForVisit,
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

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to save the data
      // For now, we'll update the local state
      setProfileData(prev => ({
        ...prev,
        ...formData
      }));
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // TODO: Uncomment when backend API is ready
      // const response = await fetch(`/api/users/${userId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
    } catch (err) {
      setError('Error saving patient data');
      console.error(err);
    }
  };

  const handleCancel = () => {
    // Revert form data to original
    if (profileData) {
      setFormData({
        name: profileData.name,
        age: profileData.age,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        emergencyNumber: profileData.emergencyNumber,
        gender: profileData.gender,
        address: profileData.address,
        reasonForVisit: profileData.reasonForVisit,
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return <div className="profile-container"><p className="loading-text">Loading profile...</p></div>;
  }

  if (error && !profileData) {
    return <div className="profile-container"><p className="error-text">❌ {error}</p></div>;
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-title-section">
            <h2 className="profile-title">👤 Patient Profile</h2>
            {profileData && <p className="patient-id">ID: {profileData.patientId}</p>}
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                type="button" 
                className="btn btn-edit"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  type="button" 
                  className="btn btn-save"
                  onClick={handleSave}
                >
                  💾 Save Changes
                </button>
                <button 
                  type="button" 
                  className="btn btn-cancel"
                  onClick={handleCancel}
                >
                  ✕ Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {saveSuccess && (
          <div className="success-alert">
            ✅ Profile updated successfully!
          </div>
        )}

        {error && profileData && (
          <div className="error-alert">
            ⚠️ {error}
          </div>
        )}

        <div className="profile-content">
          {/* Personal Information Section */}
          <div className="profile-section">
            <h3 className="section-title">📋 Personal Information</h3>
            <div className="profile-grid">
              <div className="profile-item">
                <label htmlFor="name">Full Name</label>
                <input 
                  id="name"
                  type="text" 
                  name="name"
                  value={formData.name || ''} 
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={isEditing ? 'input-editable' : 'input-readonly'}
                />
              </div>

              <div className="profile-item">
                <label htmlFor="age">Age</label>
                <input 
                  id="age"
                  type="number" 
                  name="age"
                  value={formData.age || ''} 
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={isEditing ? 'input-editable' : 'input-readonly'}
                />
              </div>

              <div className="profile-item">
                <label htmlFor="gender">Gender</label>
                {isEditing ? (
                  <select 
                    id="gender"
                    name="gender"
                    value={formData.gender || ''} 
                    onChange={handleInputChange}
                    className="input-editable"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <input 
                    id="gender"
                    type="text" 
                    name="gender"
                    value={formData.gender || ''} 
                    readOnly
                    className="input-readonly"
                  />
                )}
              </div>

              <div className="profile-item">
                <label htmlFor="email">Email Address</label>
                <input 
                  id="email"
                  type="email" 
                  name="email"
                  value={formData.email || ''} 
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={isEditing ? 'input-editable' : 'input-readonly'}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="profile-section">
            <h3 className="section-title">📞 Contact Information</h3>
            <div className="profile-grid">
              <div className="profile-item">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input 
                  id="phoneNumber"
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber || ''} 
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={isEditing ? 'input-editable' : 'input-readonly'}
                />
              </div>

              <div className="profile-item">
                <label htmlFor="emergencyNumber">Emergency Contact</label>
                <input 
                  id="emergencyNumber"
                  type="tel" 
                  name="emergencyNumber"
                  value={formData.emergencyNumber || ''} 
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={isEditing ? 'input-editable' : 'input-readonly'}
                />
              </div>

              <div className="profile-item full-width">
                <label htmlFor="address">Address</label>
                <textarea 
                  id="address"
                  name="address"
                  value={formData.address || ''} 
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={isEditing ? 'input-editable' : 'input-readonly'}
                  rows="3"
                />
              </div>
            </div>
          </div>

        

        
        </div>
      </div>
    </div>
  );
}