import React, { useState, useEffect } from 'react';
import {
  User, ShieldCheck, Scale, Ruler, Activity,
  FileText, Edit3, Save, Download,
  Dna, Syringe, ClipboardList, Info,
  FileDigit, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Patient_Profile.css';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axios';

export default function Patient_Profile() {
  const { user } = useAuth()
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [patientProfile, setPatientProfile] = useState(null)
  const [vaultFiles, setVaultFiles] = useState([])
  const [appointments, setAppointments] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    address: '',
    bloodType: '',
    weight: '',
    height: '',
    dateOfBirth: '',
    healthConditions: [],
    immunizations: []
  })

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        setLoading(true)
        const [profileRes, vaultRes, apptRes] = await Promise.all([
          axiosInstance.get(`/patients/${user._id}`),
          axiosInstance.get(`/medical-vault/${user._id}`),
          axiosInstance.get(`/appointments/patient/${user._id}`)
        ])

        const profile = profileRes.data.data
        setPatientProfile(profile)
        setVaultFiles(vaultRes.data.data || [])
        setAppointments(apptRes.data.data || [])

        // Populate form
        setFormData({
          fullName: `${user.firstName} ${user.lastName}` || '',
          email: user.email || '',
          phone: user.contact || '',
          emergencyContact: profile?.emergencyContact || '',
          address: profile?.address || '',
          bloodType: profile?.bloodGroup || '',
          weight: profile?.weight || '',
          height: profile?.height || '',
          dateOfBirth: profile?.dateOfBirth || '',
          healthConditions: profile?.medicalHistory || [],
          immunizations: []
        })
      } catch (err) {
        console.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  // Save profile
  const handleSave = async () => {
    try {
      setSaving(true)
      await axiosInstance.put(`/patients/${user._id}`, {
        height: formData.height,
        weight: formData.weight,
        bloodGroup: formData.bloodType,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
      })
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // Stats
  const totalVisits = appointments.length
  const departments = [...new Set(appointments.map(a => a.doctorId?.specialization).filter(Boolean))].length
  const lastVisit = appointments.length > 0 
    ? new Date(appointments[0].date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'No visits yet'

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading profile...</p>
    </div>
  )

  return (
    <div className="pat_prof_wrapper">
      <div className="pat_prof_grid_container">
        
        {/* Main Content Column */}
        <div className="pat_prof_left_main">
          
          {/* Identity Banner */}
          <div className="pat_prof_hero_card">
            <div className="pat_prof_hero_content">
              <div className="pat_prof_avatar_wrap">
                <img 
                  src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=007acc&color=fff&size=110`}
                  alt="Patient" 
                />
                <button className="avatar_edit_overlay"><Edit3 size={14} /></button>
              </div>
              <div className="pat_prof_hero_text">
                <div className="pat_prof_badge">Patient Passport</div>
                <h1>
                  {user.firstName} {user.lastName}
                  <ShieldCheck size={24} className="pat_verify_icon" />
                </h1>
                <p>Member ID: <strong>#{patientProfile?._id?.slice(-6)?.toUpperCase() || 'MED-001'}</strong> • {formData.address || 'Location not set'}</p>
              </div>
            </div>
            <div className="pat_prof_hero_actions">
              <button 
                className={`pat_prof_action_btn ${isEditing ? 'save_active' : ''}`} 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={saving}
              >
                {isEditing 
                  ? <><Save size={18}/> {saving ? 'Saving...' : 'Save Profile'}</> 
                  : <><Edit3 size={18}/> Update Data</>
                }
              </button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="pat_prof_bento">
            
            {/* Contact Details */}
            <div className="pat_prof_card pat_span_2">
              <div className="pat_card_title"><User size={18}/> Contact Information</div>
              <div className="pat_form_grid">
                <div className="pat_field">
                  <label>Full Legal Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    disabled={!isEditing} 
                  />
                </div>
                <div className="pat_field">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled={true} // email can't be changed
                  />
                </div>
                <div className="pat_field">
                  <label>Mobile Number</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing} 
                  />
                </div>
                <div className="pat_field">
                  <label>Emergency Contact</label>
                  <input 
                    type="text" 
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    disabled={!isEditing} 
                  />
                </div>
                <div className="pat_field pat_full_row">
                  <label>Residential Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!isEditing} 
                  />
                </div>
              </div>
            </div>

            {/* Vital Metrics */}
            <div className="pat_prof_card">
              <div className="pat_card_title"><Activity size={18}/> Medical Vitals</div>
              <div className="pat_vital_stack">
                <div className="pat_v_item">
                  <span>Blood Type</span>
                  {isEditing ? (
                    <select 
                      value={formData.bloodType}
                      onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                      style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px' }}
                    >
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  ) : (
                    <strong className="blood_highlight">{formData.bloodType || 'Not set'}</strong>
                  )}
                </div>
                <div className="pat_v_item">
                  <span>Current Weight</span>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      style={{ width: '80px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px' }}
                    />
                  ) : (
                    <strong>{formData.weight ? `${formData.weight} kg` : 'Not set'}</strong>
                  )}
                </div>
                <div className="pat_v_item">
                  <span>Height</span>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      style={{ width: '80px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px' }}
                    />
                  ) : (
                    <strong>{formData.height ? `${formData.height} cm` : 'Not set'}</strong>
                  )}
                </div>
                <div className="pat_v_item">
                  <span>Date of Birth</span>
                  <strong>
                    {formData.dateOfBirth 
                      ? new Date(formData.dateOfBirth).toLocaleDateString('en-GB') 
                      : 'Not set'
                    }
                  </strong>
                </div>
              </div>
            </div>

            {/* Health Conditions */}
            <div className="pat_prof_card pat_span_2">
              <div className="pat_card_title"><Dna size={18}/> Health Conditions</div>
              <div className="pat_condition_grid">
                {formData.healthConditions.length > 0 
                  ? formData.healthConditions.map((condition, i) => (
                    <div className="condition_tag" key={i}>
                      <span>{condition}</span>
                    </div>
                  ))
                  : <div className="condition_tag disabled"><span>None Reported</span></div>
                }
              </div>
              <p className="pat_card_note"><Info size={12}/> Verified clinical history.</p>
            </div>

            {/* Immunization */}
            <div className="pat_prof_card">
              <div className="pat_card_title"><Syringe size={18}/> Immunization</div>
              <div className="pat_vaccine_list">
                {formData.immunizations.length > 0 
                  ? formData.immunizations.map((vaccine, i) => (
                    <div className="vaccine_item" key={i}>
                      <span>{vaccine}</span>
                      <ShieldCheck size={14} className="v_done"/>
                    </div>
                  ))
                  : (
                    <div className="vaccine_item">
                      <span>No immunization records</span>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="pat_prof_sidebar">
          
          {/* Activity Stats */}
          <div className="pat_prof_card pat_summary_card">
            <div className="pat_card_title"><ClipboardList size={18}/> Activity Log</div>
            <div className="pat_activity_stat">
              <div className="stat_box">
                <b>{totalVisits}</b>
                <span>Visits</span>
              </div>
              <div className="stat_box">
                <b>{departments}</b>
                <span>Depts</span>
              </div>
            </div>
            <div className="pat_timeline_mini">
              <div className="t_item">
                <span>Last Visit</span> 
                <b>{lastVisit}</b>
              </div>
              <div className="t_item">
                <span>Member Since</span> 
                <b>{new Date(user.createdAt || Date.now()).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</b>
              </div>
            </div>
            <button className="pat_download_id_btn">
              <Download size={16}/> Download Med-ID
            </button>
          </div>

          {/* Digital Vault Quick Access */}
          <div className="pat_prof_card pat_vault_card">
            <div className="pat_vault_card_head">
              <div className="pat_card_title" style={{ marginBottom: 0 }}>
                <FileText size={18}/> Digital Vault
              </div>
              <span className="pat_vault_count">{vaultFiles.length}</span>
            </div>

            <div className="pat_vault_scroll">
              {vaultFiles.length > 0 ? vaultFiles.map(file => {
                const isPdf = file.fileName?.toLowerCase().endsWith('.pdf')
                return (
                  <div
                    className="pat_vault_item"
                    key={file._id}
                    onClick={() => window.open(file.fileUrl, '_blank')}
                    title={file.fileName}
                  >
                    <div className={`pat_vault_icon ${isPdf ? 'pdf' : 'img'}`}>
                      {isPdf ? <FileText size={16}/> : <FileDigit size={16}/>}
                    </div>
                    <div className="pat_vault_meta">
                      <strong>{file.fileName}</strong>
                      <span>
                        {file.category || 'Uncategorized'}
                        {file.fileSize ? ` • ${file.fileSize}` : ''}
                      </span>
                    </div>
                    <ChevronRight size={14} className="pat_vault_chev"/>
                  </div>
                )
              }) : (
                <div className="pat_vault_empty">
                  <FileText size={22}/>
                  <span>No records uploaded yet</span>
                </div>
              )}
            </div>

            <button
              className="pat_vault_viewall"
              onClick={() => navigate('/patient/patient_vault')}
            >
              Open Vault <ChevronRight size={14}/>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}