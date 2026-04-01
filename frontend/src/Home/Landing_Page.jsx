import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../Styles/Home/Landing_Page.css";

/* ASSET IMPORTS */
import delhi from "../Assets/Images/Home/Delhi.png";
import mumbai from "../Assets/Images/Home/Mumbai.png";
import hyderabad from "../Assets/Images/Home/Hyderabad.png";
import bangalore from "../Assets/Images/Home/Banglore.png";
import chennai from "../Assets/Images/Home/Chennai.png";
import kolkata from "../Assets/Images/Home/Kolkata.png";
import hosp1 from "../Assets/Images/Home/Hospital_1.png";
import hosp2 from "../Assets/Images/Home/Hospital_2.png";
import hosp3 from "../Assets/Images/Home/Hospital_3.png";
import hosp4 from "../Assets/Images/Home/Hospital_4.png";

function Landing_Page() {
    /* SLIDER LOGIC */
    const slides = [hosp1, hosp2, hosp3, hosp4];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [slides.length]);

    /* DATA: LOCATIONS */
    const locations = [
        {
            name: "Hyderabad",
            area: "Banjarahills",
            addr: "Road No. 12",
            img: hyderabad,
            phone: "+91 98765 12345",
            specs: "Cardiology, Oncology, Pediatrics"
        },
        {
            name: "Bangalore",
            area: "MG Road",
            addr: "MG Road, Bengaluru",
            img: bangalore,
            phone: "+91 91234 56789",
            specs: "Neurology, Orthopedics, Dermatology"
        },
        {
            name: "Chennai",
            area: "Anna Nagar",
            addr: "Anna Nagar",
            img: chennai,
            phone: "+91 99887 66554",
            specs: "Maternity Care, Pharmacy, ENT"
        },
        {
            name: "Mumbai",
            area: "Marine Drive",
            addr: "Marine Drive",
            img: mumbai,
            phone: "+91 97654 32109",
            specs: "Dialysis, Emergency, Surgery"
        },
        {
            name: "Delhi",
            area: "Connaught Place",
            addr: "CP, New Delhi",
            img: delhi,
            phone: "+91 93456 78901",
            specs: "Telemedicine, Robotic Surgery"
        },
        {
            name: "Kolkata",
            area: "Salt Lake",
            addr: "Sector V",
            img: kolkata,
            phone: "+91 92345 67890",
            specs: "Gastro, Pediatrics, General"
        }
    ];

    return (
        <div className="sa_wrapper">
            
            {/* NAVIGATION */}
            <nav className="sa_navbar">
                <div className="sa_nav_inner">
                    <div className="sa_brand">
                        <span className="sa_logo_icon">✚</span> MEDICO
                        <span className="sa_plus">PLUS</span>
                    </div>
                    <div className="sa_nav_actions">
                        <Link to="/doctor_auth" className="sa_btn_secondary">
                            Doctor Portal
                        </Link>
                        <Link to="/admin_auth" className="sa_btn_admin">
                            Admin Access
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <main className="sa_hero">
                <div className="sa_hero_glass_card">
                    <div className="sa_badge">REDEFINING MEDICAL EXCELLENCE</div>
                    <h1 className="sa_main_title">
                        <span className="sa_letter m">M</span>
                        <span className="sa_letter e">E</span>
                        <span className="sa_letter d">D</span>
                        <span className="sa_letter i">I</span>
                        <span className="sa_letter c">C</span>
                        <span className="sa_letter o">O</span>
                    </h1>
                    <p className="sa_hero_desc">
                        The world's most advanced digital healthcare ecosystem.
                        Seamlessly bridging the gap between quality care and technological innovation.
                    </p>
                    <Link to="/patient_auth">
                        <button className="sa_btn_primary">Book Appointment</button>
                    </Link>
                </div>
            </main>

            {/* EMERGENCY TICKER */}
            <div className="sa_ticker">
                <div className="sa_ticker_track">
                    <span>⚠️ EMERGENCY: 24/7 Trauma Centers Active</span>
                    <span>🧪 NEW: AI-Pathology Reports ready in 15 mins</span>
                    <span>💉 COVID-26 Vaccination drive starts Monday</span>
                    <span>🌐 Serving 15 countries!</span>
                    <span>⚠️ EMERGENCY: 24/7 Trauma Centers Active</span>
                    <span>🧪 NEW: AI-Pathology Reports ready in 15 mins</span>
                </div>
            </div>

            {/* IMAGE SLIDER */}
            <section className="sa_slider_section">
                <div className="sa_slider_frame">
                    {slides.map((img, index) => (
                        <div
                            key={index}
                            className={`sa_slide_item ${index === currentIndex ? "active" : ""}`}
                            style={{ backgroundImage: `url(${img})` }}
                        />
                    ))}
                    <div className="sa_slider_content">
                        <div className="sa_glass_tag">
                            <h2>Modern Facilities</h2>
                            <p>State-of-the-art infrastructure for precision healing.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* LOCATIONS BENTO GRID */}
            <section className="sa_section" id="locations-link">
                <div className="sa_container">
                    <h2 className="sa_section_heading">
                        Global Network <span>Branches</span>
                    </h2>
                    <div className="sa_bento_grid">
                        {locations.map((loc, i) => (
                            <div key={i} className="sa_location_card">
                                <div className="sa_card_inner">
                                    <div
                                        className="sa_card_front"
                                        style={{ backgroundImage: `url(${loc.img})` }}
                                    >
                                        <div className="sa_city_label">{loc.name}</div>
                                    </div>
                                    <div className="sa_card_back">
                                        <h3>{loc.area}</h3>
                                        <div className="sa_loc_info">
                                            <p>📍 {loc.addr}</p>
                                            <p>☎️ {loc.phone}</p>
                                            <p className="sa_specialties">{loc.specs}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MEDICAL SERVICES */}
            <section className="sa_section sa_bg_light" id="services-link">
                <div className="sa_container">
                    <h2 className="sa_section_heading">
                        Medical <span>Specializations</span>
                    </h2>
                    <div className="sa_services_grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
                            <div key={i} className="sa_service_item">
                                <div className="sa_service_icon">♥</div>
                                <h4>Cardiology</h4>
                                <p>Heart mapping specialist</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STATS BAR */}
            <section className="sa_stats_bar">
                <div className="sa_stat_box">
                    <span className="sa_num">500k+</span>
                    <span className="sa_label">Active Patients</span>
                </div>
                <div className="sa_stat_box">
                    <span className="sa_num">1.2k+</span>
                    <span className="sa_label">Specialists</span>
                </div>
                <div className="sa_stat_box">
                    <span className="sa_num">99.9%</span>
                    <span className="sa_label">Success Rate</span>
                </div>
            </section>

            {/* PATIENT FEEDBACK */}
            <section className="sa_section">
                <div className="sa_container">
                    <h2 className="sa_section_heading">
                        Patient <span>Voices</span>
                    </h2>
                    <div className="sa_feedback_list">
                        {[
                            "The AI diagnostics saved my life. Identified a blockage others missed.",
                            "Simple booking. Loved seeing my reports before reaching home.",
                            "World-class facility. Staff made me feel at home during recovery."
                        ].map((text, i) => (
                            <div key={i} className="sa_feedback_card">
                                <div className="sa_quote_icon">“</div>
                                <p>"{text}"</p>
                                <footer>- Mahanth Reddy</footer>
                                <div className="sa_rating">★★★★★</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="sa_footer">
                <div className="sa_container sa_footer_grid">
                    <div className="sa_footer_main">
                        <h3>Medico<span>+</span></h3>
                        <p>
                            Leading the digital healthcare revolution with compassion and precision.
                        </p>
                    </div>
                    <div className="sa_footer_links">
                        <h4>Explore</h4>
                        <a href="#services-link">Services</a>
                        <a href="#locations-link">Branches</a>
                    </div>
                    <div className="sa_footer_subscribe">
                        <h4>Stay Updated</h4>
                        <div className="sa_input_group">
                            <input type="email" placeholder="Email Address" />
                            <button>Join</button>
                        </div>
                    </div>
                </div>
                <div className="sa_footer_bottom">
                    &copy; 2026 Medico Health Systems. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}

export default Landing_Page;