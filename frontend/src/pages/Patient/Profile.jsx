import React from 'react';
import './Profile.css'; // Assuming you have a CSS file for styling

export default function Profile() {
  // Example profile data, you can replace with actual user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    age: 30,
    address: '123 Main St, City, Country',
    medicalHistory: 'No significant medical history.',
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-details">
        <div className="profile-item">
          <label>Name:</label>
          <span>{user.name}</span>
        </div>
        <div className="profile-item">
          <label>Email:</label>
          <span>{user.email}</span>
        </div>
        <div className="profile-item">
          <label>Phone:</label>
          <span>{user.phone}</span>
        </div>
        <div className="profile-item">
          <label>Age:</label>
          <span>{user.age}</span>
        </div>
        <div className="profile-item">
          <label>Address:</label>
          <span>{user.address}</span>
        </div>
        <div className="profile-item">
          <label>Medical History:</label>
          <span>{user.medicalHistory}</span>
        </div>
      </div>
      {/* <button className="back-btn" onClick={() => window.location.reload()}>Back to Home</button> */}
    </div>
  );
}