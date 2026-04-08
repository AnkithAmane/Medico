import hospitalData from "../../Assets/Data/PatientData/DoctorData.jsx";
import AppointmentForm from "./AppointmentForm.jsx";
import { useState } from "react";
import './SearchResult.css';
import doctorImage from "../../Assets/Images/Doctor/PDoctor.png";

export default function SearchResult({location,department}){
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showForm, setShowForm] = useState(false);

    
    let filterData=hospitalData.hospital_staff.filter((ele)=>{
                return ele.location===location && ele.department===department;
 
            });





    return(
        <>
        <div className="search-results-wrapper">
          {filterData.length > 0 ? (
                filterData.map((doctor, index) => (
                    <div key={index} className="doctor-card"> 
                        <img src={doctorImage} alt={`${doctor.name}_img`} className="doctor-image" />
                        <h3 className="doctor-name">{doctor.name}</h3>
                        
                        <div className="doctor-info">
                          <div className="info-item">
                            <div className="info-label">Qualification</div>
                            <div className="info-value">{doctor.qualification}</div>
                          </div>
                          <div className="info-item">
                            <div className="info-label">Department</div>
                            <div className="info-value">{doctor.department}</div>
                          </div>
                          <div className="info-item">
                            <div className="info-label">Age</div>
                            <div className="info-value">{doctor.age} years</div>
                          </div>
                          <div className="info-item">
                            <div className="info-label">Location</div>
                            <div className="info-value">{doctor.location}</div>
                          </div>
                          <div className="info-item">
                            <div className="info-label">Experience</div>
                            <div className="info-value">{doctor.experience} years</div>
                          </div>

                          <div className="info-item">
                            <div className="info-label">Consultation Fee</div>
                            <div className="info-value">₹{doctor.consultation_fee}</div>
                          </div>
                        </div>

                        <div className="doctor-description">
                          <strong>About:</strong> {doctor.description}
                        </div>

                        <button className="book-btn" onClick={() => {
                          setSelectedDoctor(doctor.name);
                          setShowForm(true);
                        }}>
                          📅 Book Appointment
                        </button>

                    </div>
                ))
            ) : (
                <div className="no-doctors-message">
                  <h4>No Doctors Found</h4>
                  <p>Please try different search criteria</p>
                </div>
            )}
        </div>

        {showForm && (
            <AppointmentForm 
              doctorName={selectedDoctor} 
              onBookingComplete={() => {
                setShowForm(false);
                setSelectedDoctor(null);
              }}
              onBack={() => {
                setShowForm(false);
                setSelectedDoctor(null);
              }}
            />
        )}
        </>
        
    )
}