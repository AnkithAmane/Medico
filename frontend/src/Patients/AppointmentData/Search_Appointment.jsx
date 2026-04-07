import { useState } from "react";

//import SearchResult from "./SearchResult.jsx";
import './Search_Appointment.css';


export default function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('upcoming'); 

    return (
        <div className="search-page-bg">
            <section className="search-hero-section">
                <div className="search-card-container shadow">
                    <h2 className="search-header-text">
                        <span className="search-icon">🔍</span> Find Your Doctor
                    </h2>
                    
                    <div className="search-controls-row">
                        {/* Doctor Name Search Field */}
                        <input 
                            type="text" 
                            className="search-input-box" 
                            placeholder="Enter doctor name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Toggle between Upcoming and Past */}
                        <div className="toggle-container">
                            <button 
                                className={`view-btn ${view === 'upcoming' ? 'active' : ''}`}
                                onClick={() => setView('upcoming')}
                            >
                                Upcoming
                            </button>
                            <button 
                                className={`view-btn ${view === 'past' ? 'active' : ''}`}
                                onClick={() => setView('past')}
                            >
                                Past
                            </button>
                        </div>

                        <button className="search-action-btn">
                            Search
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}