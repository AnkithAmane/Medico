import React, { useState, useEffect, useMemo } from "react";
import {
  Plus, Search, Users, ChevronRight,
  ArrowLeft, UserPlus, X, CheckCircle2,
  AlertCircle, Stethoscope
} from "lucide-react";
import axiosInstance from "../../utils/axios";
import "./departments.css";

export default function DepartmentManagement() {
  // Data states
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  // UI states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDept, setSelectedDept] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const res = await axiosInstance.get('/doctors')
        setDoctors(res.data.data || [])
      } catch (err) {
        console.error('Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  // Get unique departments from real DB doctors
  const departments = useMemo(() => {
    const specs = [...new Set(doctors.map(d => d.specialization).filter(Boolean))]
    return specs.map(spec => ({
      name: spec,
      color: '#2E5090',
    }))
  }, [doctors])

  // Get doctors for a department
  const getDeptDoctors = (deptName) => {
    return doctors.filter(d => d.specialization === deptName)
  }

  // Filtered departments
  const filteredDepts = useMemo(() => {
    return departments.filter(d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, departments])

  // Doctors not in selected dept (for assign)
  const unassignedDoctors = useMemo(() => {
    if (!selectedDept) return []
    return doctors.filter(d => d.specialization !== selectedDept.name)
  }, [doctors, selectedDept])

  // Add new doctor to dept
  const handleAddDoctor = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    try {
      setSaving(true)
      const res = await axiosInstance.post('/doctors', {
        name: formData.get('name'),
        specialization: selectedDept.name,
        experience: parseInt(formData.get('experience')) || 0,
        fees: parseInt(formData.get('fees')) || 500,
        location: formData.get('location') || '',
        bio: formData.get('bio') || '',
        isAvailable: true
      })
      setDoctors(prev => [...prev, res.data.data])
      setShowAddForm(false)
      e.target.reset()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add doctor')
    } finally {
      setSaving(false)
    }
  }

  // Assign existing doctor to dept
  const handleAssignDoctor = async (doctorId) => {
    try {
      await axiosInstance.put(`/doctors/${doctorId}`, {
        specialization: selectedDept.name
      })
      setDoctors(prev => prev.map(d =>
        d._id === doctorId ? { ...d, specialization: selectedDept.name } : d
      ))
      setShowAssignForm(false)
    } catch (err) {
      alert('Failed to assign doctor')
    }
  }

  // Remove doctor from dept
  const handleRemoveFromDept = async (doctorId, doctorName) => {
    if (!window.confirm(`Move ${doctorName} to General?`)) return
    try {
      await axiosInstance.put(`/doctors/${doctorId}`, { specialization: 'General' })
      setDoctors(prev => prev.map(d =>
        d._id === doctorId ? { ...d, specialization: 'General' } : d
      ))
    } catch (err) {
      alert('Failed to remove doctor')
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p>Loading departments...</p>
    </div>
  )

  return (
    <div className="departments-container">

      {!selectedDept ? (
        <>
          {/* Header */}
          <div className="dept-header">
            <div>
              <h1>🏥 Department <span>Management</span></h1>
              <p className="subtitle">
                {departments.length} departments • {doctors.length} total doctors
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stats-card" style={{ borderLeft: '4px solid #2E5090', backgroundColor: '#f8fafc' }}>
                <div style={{ color: '#2E5090' }}><Users size={20}/></div>
                <div>
                  <p className="stats-value">{departments.length}</p>
                  <p className="stats-label">Departments</p>
                </div>
              </div>
              <div className="stats-card" style={{ borderLeft: '4px solid #4A5568', backgroundColor: '#f8fafc' }}>
                <div style={{ color: '#4A5568' }}><Stethoscope size={20}/></div>
                <div>
                  <p className="stats-value">{doctors.length}</p>
                  <p className="stats-label">Total Doctors</p>
                </div>
              </div>
              <div className="stats-card" style={{ borderLeft: '4px solid #10b981', backgroundColor: '#f8fafc' }}>
                <div style={{ color: '#10b981' }}><CheckCircle2 size={20}/></div>
                <div>
                  <p className="stats-value">{doctors.filter(d => d.isAvailable).length}</p>
                  <p className="stats-label">Available</p>
                </div>
              </div>
              <div className="stats-card" style={{ borderLeft: '4px solid #94a3b8', backgroundColor: '#f8fafc' }}>
                <div style={{ color: '#94a3b8' }}><AlertCircle size={20}/></div>
                <div>
                  <p className="stats-value">{doctors.filter(d => !d.isAvailable).length}</p>
                  <p className="stats-label">Unavailable</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="filter-sort-section">
            <div className="search-bar">
              <Search size={16}/>
              <input
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Department Cards */}
          {filteredDepts.length > 0 ? (
            <div className="departments-grid">
              {filteredDepts.map(dept => {
                const deptDoctors = getDeptDoctors(dept.name)
                const availableCount = deptDoctors.filter(d => d.isAvailable).length
                return (
                  <div
                    key={dept.name}
                    className="department-card"
                    style={{ borderLeftColor: '#2E5090', cursor: 'pointer' }}
                    onClick={() => setSelectedDept(dept)}
                  >
                    <div className="card-header">
                      <h3 style={{ color: '#2E5090' }}>{dept.name}</h3>
                      <ChevronRight size={16} color="#94a3b8"/>
                    </div>

                    <div className="department-details">
                      <div style={{ color: '#475569' }}>
                        👨‍⚕️ {deptDoctors.length} Doctors
                      </div>
                      <div style={{ color: '#10b981' }}>
                        ✅ {availableCount} Available
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${deptDoctors.length > 0 ? (availableCount / deptDoctors.length) * 100 : 0}%`,
                          backgroundColor: '#2E5090'
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginTop: 10
                    }}>
                      <span style={{
                        background: deptDoctors.length > 0 ? '#f0fdf4' : '#fef2f2',
                        color: deptDoctors.length > 0 ? '#10b981' : '#ef4444',
                        padding: '3px 10px', borderRadius: 6,
                        fontSize: '0.72rem', fontWeight: 700
                      }}>
                        {deptDoctors.length > 0 ? 'Active' : 'No Doctors'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        View →
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>No departments found.</p>
            </div>
          )}
        </>
      ) : (
        /* Department Detail View */
        <>
          {/* Header */}
          <div className="dept-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <button
                onClick={() => {
                  setSelectedDept(null)
                  setShowAddForm(false)
                  setShowAssignForm(false)
                }}
                style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontWeight: 600, color: '#475569', fontSize: '0.9rem'
                }}
              >
                <ArrowLeft size={16}/> Back
              </button>
              <div>
                <h1>{selectedDept.name} <span>Department</span></h1>
                <p className="subtitle">
                  {getDeptDoctors(selectedDept.name).length} doctors assigned
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => { setShowAssignForm(!showAssignForm); setShowAddForm(false); }}
              >
                <UserPlus size={16}/> Assign Existing
              </button>
              <button
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => { setShowAddForm(!showAddForm); setShowAssignForm(false); }}
              >
                <Plus size={16}/> Add New Doctor
              </button>
            </div>
          </div>

          {/* Add New Doctor Form */}
          {showAddForm && (
            <div style={{
              background: 'white', borderRadius: 16, padding: 25,
              border: '1px solid #e2e8f0', marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>
                  Add New Doctor to {selectedDept.name}
                </h3>
                <button onClick={() => setShowAddForm(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} color="#64748b"/>
                </button>
              </div>
              <form onSubmit={handleAddDoctor}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input name="name" className="form-input" placeholder="Dr. Smith" required/>
                  </div>
                  <div className="form-group">
                    <label>Experience (Years)</label>
                    <input name="experience" type="number" className="form-input" placeholder="5"/>
                  </div>
                  <div className="form-group">
                    <label>Consultation Fees (₹)</label>
                    <input name="fees" type="number" className="form-input" placeholder="500"/>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input name="location" className="form-input" placeholder="Chennai"/>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Bio</label>
                    <input name="bio" className="form-input" placeholder="Brief professional summary..."/>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Adding...' : 'Add Doctor'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Assign Existing Doctor */}
          {showAssignForm && (
            <div style={{
              background: 'white', borderRadius: 16, padding: 25,
              border: '1px solid #e2e8f0', marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>
                  Assign Existing Doctor to {selectedDept.name}
                </h3>
                <button onClick={() => setShowAssignForm(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} color="#64748b"/>
                </button>
              </div>
              {unassignedDoctors.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 10
                }}>
                  {unassignedDoctors.map(doc => (
                    <div key={doc._id} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '10px 14px',
                      background: '#f8fafc', borderRadius: 10,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.85rem' }}>
                          {doc.name}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {doc.specialization}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAssignDoctor(doc._id)}
                        style={{
                          background: '#2E5090', color: 'white', border: 'none',
                          padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                          fontSize: '0.78rem', fontWeight: 700
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>
                  All doctors are already in this department.
                </p>
              )}
            </div>
          )}

          {/* Doctors Table */}
          <div className="table-container">
            <table className="departments-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Experience</th>
                  <th>Fees</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {getDeptDoctors(selectedDept.name).length > 0 ? (
                  getDeptDoctors(selectedDept.name).map(doc => (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: '#f1f5f9', color: '#2E5090',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 800
                          }}>
                            {doc.name?.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.9rem' }}>
                              {doc.name}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              #{doc._id?.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#475569' }}>{doc.experience} yrs</td>
                      <td style={{ color: '#475569' }}>₹{doc.fees}</td>
                      <td style={{ color: '#475569' }}>{doc.location || 'N/A'}</td>
                      <td>
                        <span className={`status-badge status-${doc.isAvailable ? 'active' : 'inactive'}`}>
                          {doc.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn-small delete"
                          onClick={() => handleRemoveFromDept(doc._id, doc.name)}
                          title="Move to General"
                          style={{ padding: '5px 8px' }}
                        >
                          <X size={13}/>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{
                      textAlign: 'center', padding: 40,
                      color: '#94a3b8', fontStyle: 'italic'
                    }}>
                      No doctors in this department yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}