import React, { useState, useMemo } from 'react';
import { 
  Search, MapPin, CalendarCheck, Award, 
  Clock, ChevronLeft, User, DollarSign 
} from 'lucide-react';
import './Doctor_Details.css';

// Component Import
import AppointmentForm from '../Appointment_Form/Appointment_Form'; 

// Data Imports
import doctorsData from '../../Assets/Data/Doctors_Data.json';

export default function Doctor_Details() {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedLoc, setSelectedLoc] = useState("All");
  
  // UI States
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [targetDoctor, setTargetDoctor] = useState(null);

  const departments = ["All", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology", "General"];
  const locations = ["All", "Hyderabad", "Mumbai", "Bangalore", "Delhi"];

  // Multi-factor Search Logic
  const filteredDoctors = useMemo(() => {
    return doctorsData.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === "All" || doc.department === selectedDept;
      const matchesLoc = selectedLoc === "All" || doc.branch === selectedLoc;
      return matchesSearch && matchesDept && matchesLoc;
    });
  }, [searchTerm, selectedDept, selectedLoc]);

  // Open Booking Modal
  const handleOpenBooking = (doc) => {
    setTargetDoctor(doc);
    setIsFormOpen(true);
  };

  return (
    <div className="pat_spec_container_full">
      
      {/* Profile Sidebar */}
      <aside className={`pat_spec_side_panel ${viewingDoctor ? 'open' : ''}`}>
        {viewingDoctor && (
          <div className="side_panel_content">
            <button className="panel_close_btn" onClick={() => setViewingDoctor(null)}>
              <ChevronLeft size={20} /> Back to List
            </button>
            
            <div className="panel_header">
              <img src={viewingDoctor.photo} alt={viewingDoctor.name} className="panel_img" />
              <div className="panel_title_group">
                <h2 className="pat_spec_h2">{viewingDoctor.name}</h2>
                <span className="panel_dept_tag">{viewingDoctor.department} Specialist</span>
              </div>
            </div>

            <div className="panel_scroll_area">
              <div className="panel_stats_grid">
                <div className="p_stat"><strong>Exp.</strong><span>{viewingDoctor.experience}</span></div>
                <div className="p_stat"><strong>Fee</strong><span>₹{viewingDoctor.fee}</span></div>
                <div className="p_stat"><strong>Age</strong><span>{viewingDoctor.age}</span></div>
              </div>

              <div className="panel_section">
                <h3 className="pat_spec_h3">Education & Degrees</h3>
                <p className="pat_spec_p">{viewingDoctor.degrees}</p>
              </div>

              <div className="panel_section">
                <h3 className="pat_spec_h3">About Specialist</h3>
                <p className="pat_spec_p">{viewingDoctor.description}</p>
              </div>

              <div className="panel_section">
                <h3 className="pat_spec_h3">Branch Location</h3>
                <div className="panel_loc_pill">
                  <MapPin size={14}/> {viewingDoctor.branch}
                </div>
              </div>
            </div>

            <button className="panel_book_btn" onClick={() => handleOpenBooking(viewingDoctor)}>
              Book Appointment Now
            </button>
          </div>
        )}
      </aside>

      {/* Main Specialist List */}
      <main className="pat_spec_main_full">
        <div className="pat_spec_search_strip">
          <div className="pat_spec_filter_row_top">
            <div className="pat_spec_input_wrap">
              <Search size={18} className="search_icon" />
              <input 
                type="text" 
                placeholder="Search specialists by name or expertise..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="pat_spec_loc_select">
              <MapPin size={16} />
              <select value={selectedLoc} onChange={(e) => setSelectedLoc(e.target.value)}>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>

          <div className="pat_spec_dept_filter">
            {departments.map(dept => (
              <button 
                key={dept}
                className={selectedDept === dept ? 'active' : ''}
                onClick={() => setSelectedDept(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="pat_spec_grid_full">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc) => (
              <div 
                className={`pat_spec_card ${viewingDoctor?.id === doc.id ? 'selected' : ''}`} 
                key={doc.id}
              >
                <div className="pat_spec_card_top">
                  <div className="pat_spec_avatar_frame">
                     <img src={doc.photo} alt={doc.name} />
                     <span className={`status_dot ${doc.availability === 'Available' ? 'online' : 'offline'}`}></span>
                  </div>
                  <div className="pat_spec_core_info">
                    <h3 className="pat_spec_h3">{doc.name}</h3>
                    <span className="pat_spec_dept_tag_small">{doc.department}</span>
                    <div className="pat_spec_branch_tag"><MapPin size={10}/> {doc.branch}</div>
                  </div>
                </div>
                
                <div className="pat_spec_card_meta">
                  <div className="meta_item"><Award size={14}/> <span>{doc.experience} Experience</span></div>
                  <div className="meta_item"><Clock size={14}/> <span>{doc.availability}</span></div>
                </div>

                <div className="pat_spec_card_actions">
                  <button className="btn_view_profile" onClick={() => setViewingDoctor(doc)}>View Profile</button>
                  <button className="btn_book_now" onClick={() => handleOpenBooking(doc)}>
                    Book <CalendarCheck size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="pat_spec_empty_text">No specialists found matching your criteria.</div>
          )}
        </div>
      </main>

      {/* Modal Injection */}
      <AppointmentForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialDoctor={targetDoctor} 
      />

    </div>
  );
}