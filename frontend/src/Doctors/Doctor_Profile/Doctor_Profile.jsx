import React, { useState, useEffect } from "react";
import { 
  FaIdCard, FaStethoscope, FaEdit, FaSave, 
  FaTimes, FaUserMd, FaPhoneAlt, FaEnvelope, 
  FaAward, FaHospitalUser 
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axios";
import "./Doctor_Profile.css";

export default function Profile() {
  const { user } = useAuth()

  // Data states
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form state
  const [formState, setFormState] = useState({
    name: '',
    specialization: '',
    experience: '',
    fees: '',
    location: '',
    bio: '',
    isAvailable: true
  })

  // Fetch doctor profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      try {
        setLoading(true)
        const res = await axiosInstance.get(`/doctors/user/${user._id}`)
        const doctor = res.data.data
        setDoctorProfile(doctor)
        setFormState({
          name: doctor.name || '',
          specialization: doctor.specialization || '',
          experience: doctor.experience || '',
          fees: doctor.fees || '',
          location: doctor.location || '',
          bio: doctor.bio || '',
          isAvailable: doctor.isAvailable
        })
      } catch (err) {
        console.error('Failed to load profile:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  // Save profile
  const handleSave = async () => {
    try {
      setSaving(true)
      await axiosInstance.put(`/doctors/${doctorProfile._id}`, formState)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setFormState(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading profile...</p>
    </div>
  )

  return (
    <div className="doc_prof_m_root doc_prof_m_fade_in">
      <div className="doc_prof_m_grid">
        
        {/* Sidebar */}
        <aside className="doc_prof_m_sidebar">
          <div className="doc_prof_m_card doc_prof_m_identity">
            <div className="doc_prof_m_avatar_wrapper">
              <img 
                src={doctorProfile?.profilePic || `https://ui-avatars.com/api/?name=${formState.name}&background=007acc&color=fff&size=155`}
                alt={formState.name} 
                className="doc_prof_m_img" 
              />
              <div className={`doc_prof_m_status ${formState.isAvailable ? 'available' : 'busy'}`}></div>
            </div>
            
            <div className="doc_prof_m_id_text">
              <h2>{formState.name}</h2>
              <span className="doc_prof_m_qual">{formState.specialization}</span>
              <p className="doc_prof_m_dept_tag">{formState.specialization} Specialist</p>
            </div>

            <div className="doc_prof_m_stats_row">
              <div className="doc_prof_m_stat_node">
                <label>Experience</label>
                <strong>{formState.experience} yrs</strong>
              </div>
              <div className="doc_prof_m_stat_node">
                <label>Fees</label>
                <strong>₹{formState.fees}</strong>
              </div>
            </div>

            <div className="doc_prof_m_actions">
              {isEditing ? (
                <div className="doc_prof_m_btn_group">
                  <button className="doc_prof_m_btn_primary" onClick={handleSave} disabled={saving}>
                    <FaSave /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="doc_prof_m_btn_outline" onClick={() => setIsEditing(false)}>
                    <FaTimes /> Cancel
                  </button>
                </div>
              ) : (
                <button className="doc_prof_m_btn_primary full_width" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="doc_prof_m_main">
          
          {/* Biography */}
          <section className="doc_prof_m_card">
            <div className="doc_prof_m_card_header">
              <FaUserMd className="doc_prof_m_icon" />
              <h4>Professional Summary</h4>
            </div>
            <div className="doc_prof_m_content">
              {isEditing ? (
                <textarea 
                  className="doc_prof_m_textarea"
                  value={formState.bio} 
                  onChange={e => handleChange("bio", e.target.value)}
                  rows="4"
                  placeholder="Describe your clinical background..."
                />
              ) : (
                <p className="doc_prof_m_bio_text">
                  {formState.bio || 'No bio added yet. Click Edit Profile to add one.'}
                </p>
              )}
            </div>
          </section>

          <div className="doc_prof_m_details_grid">
            {/* Clinical Domain */}
            <section className="doc_prof_m_card">
              <div className="doc_prof_m_card_header">
                <FaStethoscope className="doc_prof_m_icon" />
                <h4>Clinical Domain</h4>
              </div>
              <div className="doc_prof_m_form">
                <div className="doc_prof_m_field">
                  <label>Primary Specialty</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={formState.specialization}
                      onChange={e => handleChange('specialization', e.target.value)}
                      style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', width: '100%' }}
                    />
                  ) : (
                    <p>{formState.specialization}</p>
                  )}
                </div>
                <div className="doc_prof_m_field">
                  <label>Availability</label>
                  {isEditing ? (
                    <select
                      value={formState.isAvailable}
                      onChange={e => handleChange('isAvailable', e.target.value === 'true')}
                      style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', width: '100%' }}
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  ) : (
                    <p className={`doc_prof_m_status_text ${formState.isAvailable ? 'available' : 'busy'}`}>
                      {formState.isAvailable ? 'Available' : 'Not Available'}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Registry */}
            <section className="doc_prof_m_card">
              <div className="doc_prof_m_card_header">
                <FaHospitalUser className="doc_prof_m_icon" />
                <h4>Contact Registry</h4>
              </div>
              <div className="doc_prof_m_form">
                <div className="doc_prof_m_field">
                  <label><FaEnvelope /> Official Email</label>
                  <p>{user?.email || 'N/A'}</p>
                </div>
                <div className="doc_prof_m_field">
                  <label><FaPhoneAlt /> Contact</label>
                  <p>{user?.contact || 'N/A'}</p>
                </div>
              </div>
            </section>

            {/* Credentials */}
            <section className="doc_prof_m_card span_full">
              <div className="doc_prof_m_card_header">
                <FaAward className="doc_prof_m_icon" />
                <h4>Professional Details</h4>
              </div>
              <div className="doc_prof_m_info_grid">
                <div className="doc_prof_m_field">
                  <label>Experience</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={formState.experience}
                      onChange={e => handleChange('experience', e.target.value)}
                      style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', width: '100%' }}
                    />
                  ) : (
                    <p>{formState.experience} years</p>
                  )}
                </div>
                <div className="doc_prof_m_field">
                  <label>Consultation Fees</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={formState.fees}
                      onChange={e => handleChange('fees', e.target.value)}
                      style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', width: '100%' }}
                    />
                  ) : (
                    <p>₹{formState.fees}</p>
                  )}
                </div>
                <div className="doc_prof_m_field">
                  <label>Location</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={formState.location}
                      onChange={e => handleChange('location', e.target.value)}
                      style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', width: '100%' }}
                    />
                  ) : (
                    <p>{formState.location || 'Not set'}</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}