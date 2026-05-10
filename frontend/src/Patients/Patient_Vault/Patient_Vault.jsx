import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, Search, Download, Share2, Eye, 
  ShieldCheck, HardDrive, Clock, Plus, 
  ChevronRight, FileDigit, Trash2
} from 'lucide-react';
import './Patient_Vault.css';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axios';

export default function Patient_Vault() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  // Data States
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // UI States
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Prescriptions", "Lab Reports", "Radiology", "Invoices"];

  // Fetch vault records
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return
      try {
        setLoading(true)
        const res = await axiosInstance.get(`/medical-vault/${user._id}`)
        setFiles(res.data.data || [])
      } catch (err) {
        console.error('Failed to load vault records')
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [user])

  // Filtering Logic
  const filteredFiles = useMemo(() => {
    return files.filter(f => 
      (activeCategory === "All" || f.category === activeCategory) &&
      f.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery, files]);

  // Upload handler
  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)

      // For now store file info without actual cloud upload
      // In production you'd upload to Cloudinary/S3 first
      await axiosInstance.post(`/medical-vault/${user._id}/upload`, {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // temporary local URL
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        category: 'Lab Reports' // default category
      })

      // Refresh records
      const res = await axiosInstance.get(`/medical-vault/${user._id}`)
      setFiles(res.data.data || [])
      alert('Record uploaded successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Delete handler
  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    try {
      await axiosInstance.delete(`/medical-vault/record/${recordId}`)
      setFiles(prev => prev.filter(f => f._id !== recordId))
    } catch (err) {
      alert('Failed to delete record')
    }
  }

  // Storage calculation
  const storageUsed = files.reduce((sum, f) => {
    const size = parseFloat(f.fileSize) || 0
    return sum + size
  }, 0)
  const storagePercent = Math.min(Math.round((storageUsed / 5) * 100), 100)

  // Access history from files
  const accessHistory = files
    .flatMap(f => f.accessHistory || [])
    .slice(0, 2)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading vault...</p>
    </div>
  )

  return (
    <div className="pat_vau_container">
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleUpload}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {/* File Explorer Main View */}
      <div className="pat_vau_main">
        
        {/* Header Section */}
        <div className="pat_vau_header">
          <div className="pat_vau_title">
            <h1>Medical <span>Vault</span></h1>
            <p>Secure, encrypted storage for your lifetime health records.</p>
          </div>
          <button 
            className="pat_vau_upload_btn"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            <Plus size={18}/> 
            {uploading ? 'Uploading...' : 'Upload Record'}
          </button>
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
          {filteredFiles.length > 0 ? filteredFiles.map(file => (
            <div className="pat_vau_file_item" key={file._id}>
              <div className="file_name">
                <div className={`file_icon ${file.category?.replace(' ', '_').toLowerCase()}`}>
                  {file.fileName?.endsWith('.pdf') ? 
                    <FileText size={18}/> : <FileDigit size={18}/>
                  }
                </div>
                <div>
                  <strong>{file.fileName}</strong>
                  <small>{file.fileSize}</small>
                </div>
              </div>
              <div className="file_type">
                <span className="type_tag">{file.category}</span>
              </div>
              <div className="file_date">
                {new Date(file.createdAt).toISOString().split('T')[0]}
              </div>
              <div className="file_actions">
                <button title="View" onClick={() => window.open(file.fileUrl, '_blank')}>
                  <Eye size={16}/>
                </button>
                <button title="Download" onClick={() => window.open(file.fileUrl, '_blank')}>
                  <Download size={16}/>
                </button>
                <button title="Share"><Share2 size={16}/></button>
                <button 
                  title="Delete" 
                  onClick={() => handleDelete(file._id)}
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          )) : (
            <div style={{ 
              textAlign: 'center', padding: '40px', 
              color: '#94a3b8', fontWeight: '600' 
            }}>
              No records found. Upload your first record!
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="pat_vau_sidebar">
        
        <div className="pat_vau_card pat_vau_storage">
          <div className="card_head">
            <HardDrive size={20} color="#007acc" />
            <h3>Vault Storage</h3>
          </div>
          <div className="storage_visual">
            <svg viewBox="0 0 36 36" className="circular_chart">
              <path className="circle_bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path 
                className="circle" 
                strokeDasharray={`${storagePercent}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
              <text x="18" y="20.35" className="percentage">{storagePercent}%</text>
            </svg>
          </div>
          <p>Using {storageUsed.toFixed(1)} GB of 5 GB</p>
          <button className="upgrade_btn">Upgrade Storage</button>
        </div>

        <div className="pat_vau_card pat_vau_security">
          <ShieldCheck size={32} color="#10b981" />
          <h3>HIPAA Secured</h3>
          <p>Your records are end-to-end encrypted and visible only to you.</p>
        </div>

        <div className="pat_vau_card pat_vau_history">
          <h3><Clock size={16}/> Access History</h3>
          {accessHistory.length > 0 ? accessHistory.map((log, i) => (
            <div className="history_item" key={i}>
              <div className="h_dot"></div>
              <div>
                <strong>{log.accessedBy}</strong>
                <span>{log.action}</span>
              </div>
            </div>
          )) : (
            <>
              <div className="history_item">
                <div className="h_dot"></div>
                <div><strong>System</strong><span>No access history yet</span></div>
              </div>
            </>
          )}
          <button className="text_link">See All Logs <ChevronRight size={14}/></button>
        </div>
      </aside>
    </div>
  );
}