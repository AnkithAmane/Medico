import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for contacting Medico. We will get back to you shortly.');
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="fw-bold display-5 text-dark">Get in Touch</h1>
          <p className="mt-3 fs-5 text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            Have questions about our services or need to schedule a consultation? 
            Our team at Medico is here to provide the support you need.
          </p>
        </div>

        <div className="row g-4">
          {/* Contact Information Cards */}
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-3">
              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-start">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <Phone className="text-primary" size={24} />
                  </div>
                  <div>
                    <h5 className="fw-semibold">Emergency & Appointments</h5>
                    <p className="mb-1 text-muted">+91 1234567890</p>
                    <small className="text-danger fst-italic">Available 24/7 for emergencies</small>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-start">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <Mail className="text-primary" size={24} />
                  </div>
                  <div>
                    <h5 className="fw-semibold">Email Support</h5>
                    <p className="mb-0 text-muted">care@medico-hospital.com</p>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-start">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <Clock className="text-primary" size={24} />
                  </div>
                  <div>
                    <h5 className="fw-semibold">OPD Hours</h5>
                    <p className="mb-1 text-muted">Mon - Sat: 8:00 AM - 8:00 PM</p>
                    <p className="mb-0 text-muted">Sunday: 9:00 AM - 1:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-start">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <div>
                    <h5 className="fw-semibold">Location</h5>
                    <p className="mb-0 text-muted">
                      Siruseri, Chengalpattu District<br />India, 603103
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-8">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <h2 className="fw-semibold mb-4">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="form-control"
                      placeholder="Enter Your Name"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="form-control"
                      placeholder="Enter Your Email"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Subject</label>
                    <select 
                      className="form-select"
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    >
                      <option>General Inquiry</option>
                      <option>Appointment Request</option>
                      <option>Billing Question</option>
                      <option>Feedback/Complaints</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Your Message</label>
                    <textarea 
                      rows="4"
                      required
                      className="form-control"
                      placeholder="How can we help you?"
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <button 
                      type="submit"
                      className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <span>Send Message</span>
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
