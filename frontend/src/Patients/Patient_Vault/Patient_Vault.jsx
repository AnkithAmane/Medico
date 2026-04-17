import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Download, Share2, Eye, 
  ShieldCheck, HardDrive, Clock, Plus, 
  ChevronRight, FileDigit
} from 'lucide-react';
import './Patient_Vault.css';

export default function Patient_Vault() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Prescriptions", "Lab Reports", "Radiology", "Invoices"];

  // Mock file data
  const files = [
    { id: 1, name: "Blood_Work_Complete.pdf", type: "Lab Reports", date: "2026-04-02", size: "1.2 MB" },
    { id: 2, name: "Cardiology_Consultation.pdf", type: "Prescriptions", date: "2026-03-15", size: "850 KB" },
    { id: 3, name: "Chest_XRay_Digital.jpg", type: "Radiology", date: "2026-02-10", size: "4.5 MB" },
    { id: 4, name: "Pharmacy_Bill_#992.pdf", type: "Invoices", date: "2026-04-05", size: "320 KB" },
    { id: 5, name: "Annual_Checkup_Summary.pdf", type: "Lab Reports", date: "2026-01-20", size: "2.1 MB" },
  ];

  // Filtering Logic
  const filteredFiles = useMemo(() => {
    return files.filter(f => 
      (activeCategory === "All" || f.type === activeCategory) &&
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery]);

  return (
    <div className="pat_vau_container">
      
      {/* File Explorer Main View */}
      <div className="pat_vau_main">
        
        {/* Header Section */}
        <div className="pat_vau_header">
          <div className="pat_vau_title">
            <h1>Medical <span>Vault</span></h1>
            <p>Secure, encrypted storage for your lifetime health records.</p>
          </div>
          <button className="pat_vau_upload_btn"><Plus size={18}/> Upload Record</button>
        </div>

        {/* Filters and Search */}
        <div className="pat_vau_controls">
          <div className="pat_vau_search_bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by file name or date..." 
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="pat_vau_tabs">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={activeCategory === cat ? 'active' : ''}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* File Directory List */}
        <div className="pat_vau_file_list">
          <div className="pat_vau_list_header">
            <span>File Name</span>
            <span>Category</span>
            <span>Date Added</span>
            <span>Actions</span>
          </div>
          {filteredFiles.map(file => (
            <div className="pat_vau_file_item" key={file.id}>
              <div className="file_name">
                <div className={`file_icon ${file.type.replace(' ', '_').toLowerCase()}`}>
                  {file.name.endsWith('.pdf') ? <FileText size={18}/> : <FileDigit size={18}/>}
                </div>
                <div>
                  <strong>{file.name}</strong>
                  <small>{file.size}</small>
                </div>
              </div>
              <div className="file_type"><span className="type_tag">{file.type}</span></div>
              <div className="file_date">{file.date}</div>
              <div className="file_actions">
                <button title="View"><Eye size={16}/></button>
                <button title="Download"><Download size={16}/></button>
                <button title="Share"><Share2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar: Status & Security */}
      <aside className="pat_vau_sidebar">
        
        <div className="pat_vau_card pat_vau_storage">
           <div className="card_head">
              <HardDrive size={20} color="#007acc" />
              <h3>Vault Storage</h3>
           </div>
           <div className="storage_visual">
              <svg viewBox="0 0 36 36" className="circular_chart">
                <path className="circle_bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray="45, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" className="percentage">45%</text>
              </svg>
           </div>
           <p>Using 2.4 GB of 5 GB</p>
           <button className="upgrade_btn">Upgrade Storage</button>
        </div>

        <div className="pat_vau_card pat_vau_security">
           <ShieldCheck size={32} color="#10b981" />
           <h3>HIPAA Secured</h3>
           <p>Your records are end-to-end encrypted and visible only to you.</p>
        </div>

        <div className="pat_vau_card pat_vau_history">
           <h3><Clock size={16}/> Access History</h3>
           <div className="history_item">
              <div className="h_dot"></div>
              <div><strong>Dr. Vijay K.</strong><span>Viewed Lab Report</span></div>
           </div>
           <div className="history_item">
              <div className="h_dot"></div>
              <div><strong>System</strong><span>Self Download</span></div>
           </div>
           <button className="text_link">See All Logs <ChevronRight size={14}/></button>
        </div>

      </aside>

    </div>
  );
}