import { useState } from "react";
import hospitalData from "../../../Assets/Data/PatientData/DoctorData.jsx";
import SearchResult from "./SearchResult.jsx";
import './AppointmentBooking.css';



export default function AppointmentBooking(){

    const [selectedDept, setSelectedDept] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');   
    const [res,setRes]=useState("");
    

const departments = [...new Set(hospitalData.hospital_staff.map(doc => doc.department))];
const location = [...new Set(hospitalData.hospital_staff.map(doc => doc.location))];

function selecthandler(){
   setRes(<SearchResult location={selectedLocation} department={selectedDept}/>);
        // console.log(res);
    
}
return(
<>

<section className="search-container">
  <div className="search-filters">
    <h2>🔍 Find Your Doctor</h2>
    <div className="search-filters-row">
      <select 
        id="location-select" 
        className="form-select"
        value={selectedLocation} 
        onChange={(e) => setSelectedLocation(e.target.value)}
      >
        <option value="">--Select Location--</option>
        {location.map((loc, index) => (
          <option key={index} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      <select 
        id="dept-select" 
        className="form-select"
        value={selectedDept} 
        onChange={(e) => setSelectedDept(e.target.value)}
      >
        <option value="">--Select Department--</option>
        {departments.map((dept, index) => (
          <option key={index} value={dept}>
            {dept}
          </option>
        ))}
      </select>

      <button className="search-btn" type="submit" onClick={selecthandler}>
        Search
      </button>
    </div>
  </div>
</section>

<div className="search-results-container">
  {res}
  
</div>
</>
)

}
