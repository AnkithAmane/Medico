import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText, Search, Download, Share2, Eye,
  ShieldCheck, HardDrive, Clock, Plus,
  ChevronRight, FileDigit, Trash2, X
} from 'lucide-react';
import './Patient_Vault.css';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axios';

export default function Patient_Vault() {
  const { user } = useAuth()

  // Data States
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // UI States
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("Lab Reports");
  const [uploadFile, setUploadFile] = useState(null);

  // Storage plan states
  const [storagePlan, setStoragePlan] = useState('regular');
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const categories = ["All", "Prescriptions", "Lab Reports", "Radiology", "Invoices"];
  const uploadCategories = ["Prescriptions", "Lab Reports", "Radiology", "Invoices"];

  const planCapacity = { regular: 5, '20GB': 20, '50GB': 50, '100GB': 100 };
  const planLabel = { regular: 'Regular', '20GB': '20 GB', '50GB': '50 GB', '100GB': '100 GB' };
  const storageQuota = planCapacity[storagePlan] || 5;

  const upgradePlans = [
    { key: '20GB', size: 20, price: '$2/mo', tag: 'Basic' },
    { key: '50GB', size: 50, price: '$5/mo', tag: 'Popular' },
    { key: '100GB', size: 100, price: '$9/mo', tag: 'Pro' },
  ];

  // Fetch vault records + current plan
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return
      try {
        setLoading(true)
        const [vaultRes, profileRes] = await Promise.all([
          axiosInstance.get(`/medical-vault/${user._id}`),
          axiosInstance.get(`/patients/${user._id}`)
        ])
        setFiles(vaultRes.data.data || [])
        setStoragePlan(profileRes.data.data?.storagePlan || 'regular')
      } catch (err) {
        console.error('Failed to load vault records')
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [user])

  const handleSelectPlan = async (planKey) => {
    try {
      setUpdatingPlan(true)
      const res = await axiosInstance.put(`/patients/${user._id}/storage-plan`, {
        storagePlan: planKey
      })
      setStoragePlan(res.data.data?.storagePlan || planKey)
      setIsPlanOpen(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update plan')
    } finally {
      setUpdatingPlan(false)
    }
  }

  // Filtering Logic
  const filteredFiles = useMemo(() => {
    return files.filter(f => 
      (activeCategory === "All" || f.category === activeCategory) &&
      f.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery, files]);

  // Open upload modal
  const openUploadModal = () => {
    setUploadCategory("Lab Reports")
    setUploadFile(null)
    setIsUploadOpen(true)
  }

  const closeUploadModal = () => {
    setIsUploadOpen(false)
    setUploadFile(null)
  }

  // Upload handler — submits category + file from modal
  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadFile) {
      alert('Please select a file to upload')
      return
    }

    try {
      setUploading(true)

      await axiosInstance.post(`/medical-vault/${user._id}/upload`, {
        fileName: uploadFile.name,
        fileUrl: URL.createObjectURL(uploadFile),
        fileSize: `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB`,
        category: uploadCategory
      })

      // Refresh records — list updates dynamically
      const res = await axiosInstance.get(`/medical-vault/${user._id}`)
      setFiles(res.data.data || [])
      closeUploadModal()
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
  const storagePercent = Math.min(Math.round((storageUsed / storageQuota) * 100), 100)

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
            onClick={openUploadModal}
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
          <p>Using {storageUsed.toFixed(1)} GB of {storageQuota} GB</p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 8px' }}>
            Current plan: <strong>{planLabel[storagePlan]}</strong>
          </p>
          <button className="upgrade_btn" onClick={() => setIsPlanOpen(true)}>Upgrade Storage</button>
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

      {isUploadOpen && (
        <div
          onClick={closeUploadModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleUploadSubmit}
            style={{
              background: '#fff', borderRadius: '12px', padding: '28px 28px 24px',
              width: '90%', maxWidth: '440px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              position: 'relative', display: 'flex', flexDirection: 'column', gap: '18px'
            }}
          >
            <button
              type="button"
              onClick={closeUploadModal}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b'
              }}
              aria-label="Close"
            >
              <X size={20}/>
            </button>

            <div>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>Upload Record</h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '13px' }}>
                Choose a category and the file you'd like to add to your vault.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Category
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                style={{
                  padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff'
                }}
              >
                {uploadCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                File
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                style={{ fontSize: '14px' }}
              />
              {uploadFile && (
                <small style={{ color: '#64748b' }}>
                  Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                </small>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={closeUploadModal}
                style={{
                  padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: '#fff', color: '#334155', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !uploadFile}
                style={{
                  padding: '9px 16px', borderRadius: '8px', border: 'none',
                  background: '#007acc', color: '#fff', fontWeight: 600,
                  cursor: uploading || !uploadFile ? 'not-allowed' : 'pointer',
                  opacity: uploading || !uploadFile ? 0.6 : 1
                }}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isPlanOpen && (
        <div
          onClick={() => !updatingPlan && setIsPlanOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '12px', padding: '28px',
              width: '90%', maxWidth: '720px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px'
            }}
          >
            <button
              type="button"
              onClick={() => !updatingPlan && setIsPlanOpen(false)}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b'
              }}
              aria-label="Close"
            >
              <X size={20}/>
            </button>

            <div>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>Upgrade Your Storage</h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '13px' }}>
                Pick a plan that fits your needs. Your current plan is <strong>{planLabel[storagePlan]}</strong>.
              </p>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px'
            }}>
              {upgradePlans.map(p => {
                const isCurrent = storagePlan === p.key
                return (
                  <div
                    key={p.key}
                    style={{
                      border: isCurrent ? '2px solid #007acc' : '1px solid #e2e8f0',
                      borderRadius: '12px', padding: '18px 16px',
                      display: 'flex', flexDirection: 'column', gap: '10px',
                      background: isCurrent ? '#f0f9ff' : '#fff',
                      position: 'relative'
                    }}
                  >
                    <span style={{
                      alignSelf: 'flex-start', fontSize: '11px', fontWeight: 700,
                      letterSpacing: '0.5px', color: '#007acc',
                      background: '#e0f2fe', padding: '3px 8px', borderRadius: '999px'
                    }}>{p.tag}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <strong style={{ fontSize: '24px', color: '#0f172a' }}>{p.size}</strong>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>GB</span>
                    </div>
                    <span style={{ color: '#475569', fontSize: '13px' }}>{p.price}</span>
                    <button
                      type="button"
                      disabled={updatingPlan || isCurrent}
                      onClick={() => handleSelectPlan(p.key)}
                      style={{
                        marginTop: 'auto', padding: '9px 12px', borderRadius: '8px',
                        border: 'none', background: isCurrent ? '#94a3b8' : '#007acc',
                        color: '#fff', fontWeight: 600,
                        cursor: updatingPlan || isCurrent ? 'not-allowed' : 'pointer',
                        opacity: updatingPlan ? 0.7 : 1
                      }}
                    >
                      {isCurrent ? 'Current Plan' : (updatingPlan ? 'Updating...' : 'Select Plan')}
                    </button>
                  </div>
                )
              })}
            </div>

            <div style={{
              borderTop: '1px solid #e2e8f0', paddingTop: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Not ready to upgrade? You'll stay on the Regular plan (5 GB).
              </span>
              <button
                type="button"
                onClick={() => handleSelectPlan('regular')}
                disabled={updatingPlan || storagePlan === 'regular'}
                style={{
                  padding: '8px 14px', borderRadius: '8px',
                  border: '1px solid #cbd5e1', background: '#fff',
                  color: '#334155', fontWeight: 600,
                  cursor: updatingPlan || storagePlan === 'regular' ? 'not-allowed' : 'pointer',
                  opacity: storagePlan === 'regular' ? 0.6 : 1
                }}
              >
                Stay on Regular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}