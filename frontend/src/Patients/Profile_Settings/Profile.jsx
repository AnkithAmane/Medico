import React, { useState, useMemo } from 'react';
import { 
  User, Mail, Phone, MapPin, ShieldCheck, 
  Scale, Ruler, HeartPulse, Activity, 
  FileText, Edit3, Save, Download, 
  Dna, Syringe, ClipboardList, Info
} from 'lucide-react';
import './Profile.css';

// Data Import
import patientData from '../../Assets/Data/patient.json';

export default function Patient_Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const user = useMemo(() => patientData.find(p => p.id === 201) || patientData[0], []);

  return (
    <div className="pat_prof_wrapper">
      
      {/* 3:1 MAIN GRID */}
      <div className="pat_prof_grid_container">
        
        {/* LEFT COLUMN (3fr) */}
        <div className="pat_prof_left_main">
          
          {/* ELITE IDENTITY HEADER */}
          <div className="pat_prof_hero_card">
            <div className="pat_prof_hero_content">
              <div className="pat_prof_avatar_wrap">
                <img src={user.photo} alt="Patient" />
                <button className="avatar_edit_overlay"><Edit3 size={14} /></button>
              </div>
              <div className="pat_prof_hero_text">
                <div className="pat_prof_badge">Patient Passport</div>
                <h1>{user.name} <ShieldCheck size={24} className="pat_verify_icon" /></h1>
                <p>Member ID: <strong>#MED-{user.id}</strong> • Bangalore, KA</p>
              </div>
            </div>
            <div className="pat_prof_hero_actions">
              <button className={`pat_prof_action_btn ${isEditing ? 'save_active' : ''}`} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <><Save size={18}/> Save Profile</> : <><Edit3 size={18}/> Update Data</>}
              </button>
            </div>
          </div>

          {/* DATA BENTO GRID */}
          <div className="pat_prof_bento">
            
            {/* 1. BASIC INFO */}
            <div className="pat_prof_card pat_span_2">
              <div className="pat_card_title"><User size={18}/> Contact Information</div>
              <div className="pat_form_grid">
                <div className="pat_field">
                  <label>Full Legal Name</label>
                  <input type="text" defaultValue={user.name} disabled={!isEditing} />
                </div>
                <div className="pat_field">
                  <label>Email Address</label>
                  <input type="email" defaultValue="arjun.mehta@health.com" disabled={!isEditing} />
                </div>
                <div className="pat_field">
                  <label>Mobile Number</label>
                  <input type="text" defaultValue={user.contact} disabled={!isEditing} />
                </div>
                <div className="pat_field">
                  <label>Emergency Contact</label>
                  <input type="text" defaultValue="+91 98877 66554" disabled={!isEditing} />
                </div>
                <div className="pat_field pat_full_row">
                  <label>Residential Address</label>
                  <input type="text" defaultValue="Suite 402, Green Glen Layout, Bellandur, Bangalore" disabled={!isEditing} />
                </div>
              </div>
            </div>

            {/* 2. CLINICAL VITALS */}
            <div className="pat_prof_card">
              <div className="pat_card_title"><Activity size={18}/> Medical Vitals</div>
              <div className="pat_vital_stack">
                <div className="pat_v_item"><span>Blood Type</span> <strong className="blood_highlight">{user.bloodGroup}</strong></div>
                <div className="pat_v_item"><span>Current Weight</span> <strong>{user.weight}</strong></div>
                <div className="pat_v_item"><span>Height</span> <strong>{user.height}</strong></div>
                <div className="pat_v_item"><span>Date of Birth</span> <strong>12 Oct 1998</strong></div>
              </div>
            </div>

            {/* 3. CHRONIC CONDITIONS (New) */}
            <div className="pat_prof_card pat_span_2">
              <div className="pat_card_title"><Dna size={18}/> Health Conditions</div>
              <div className="pat_condition_grid">
                <div className="condition_tag"><span>Type 2 Diabetes</span></div>
                <div className="condition_tag"><span>Hypertension</span></div>
                <div className="condition_tag disabled"><span>None Reported</span></div>
              </div>
              <p className="pat_card_note"><Info size={12}/> Based on clinical history from Medico+ verified doctors.</p>
            </div>

            {/* 4. VACCINATION STATUS (New) */}
            <div className="pat_prof_card">
              <div className="pat_card_title"><Syringe size={18}/> Immunization</div>
              <div className="pat_vaccine_list">
                <div className="vaccine_item"><span>Covid-19 (Booster)</span> <CheckCircle size={14} className="v_done"/></div>
                <div className="vaccine_item"><span>Hepatitis B</span> <CheckCircle size={14} className="v_done"/></div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDEBAR (1fr) */}
        <aside className="pat_prof_sidebar">
          <div className="pat_prof_card pat_summary_card">
            <div className="pat_card_title"><ClipboardList size={18}/> Activity Log</div>
            <div className="pat_activity_stat">
               <div className="stat_box"><b>14</b><span>Visits</span></div>
               <div className="stat_box"><b>03</b><span>Depts</span></div>
            </div>
            <div className="pat_timeline_mini">
              <div className="t_item"><span>Last Visit</span> <b>02 Apr 2026</b></div>
              <div className="t_item"><span>Next Sync</span> <b>15 Apr 2026</b></div>
            </div>
            <button className="pat_download_id_btn"><Download size={16}/> Download Med-ID</button>
          </div>

          <div className="pat_prof_card">
            <div className="pat_card_title"><FileText size={18}/> Digital Vault</div>
            <div className="pat_file_row"><span>Prescription_Cardio.pdf</span></div>
            <div className="pat_file_row"><span>Blood_Report_Jan.pdf</span></div>
            <div className="pat_file_row"><span>X-Ray_Lumbar.jpg</span></div>
          </div>
        </aside>

      </div>
    </div>
  );
}

// Simple internal check for the icon
const CheckCircle = ({size, className}) => <ShieldCheck size={size} className={className} />;