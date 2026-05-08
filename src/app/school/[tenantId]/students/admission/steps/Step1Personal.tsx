'use client';

import React from 'react';

interface Step1Props {
  formData: any;
  setFormData: (data: any) => void;
  allSessions: any[];
  bloodGroups: string[];
}

export default function Step1Personal({ formData, setFormData, allSessions, bloodGroups }: Step1Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const selectGender = (g: string) => {
    setFormData({ ...formData, gender: g });
  };

  return (
    <div className="step-content">
      <div className="info-banner">
        <i className="ti ti-info-circle"></i> 
        Fields marked with <span style={{ color: '#ef4444', margin: '0 2px' }}>*</span> are mandatory. Registration number is auto-generated.
      </div>
      
      <div className="section-header">
        <i className="ti ti-user" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
        <span className="section-title">Personal Information</span>
        <span className="section-badge">Step 1 of 5</span>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Academic Year <span className="req">*</span></label>
          <select name="academicYear" value={formData.academicYear} onChange={handleChange} required>
            <option value="">Select Year</option>
            {allSessions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Registration Number <span className="auto-badge"><i className="ti ti-bolt" style={{ fontSize: '10px' }}></i>Auto</span></label>
          <input type="text" name="registrationNumber" value={formData.registrationNumber || 'REG-AUTO-GEN'} className="auto" readOnly />
        </div>
        <div className="field">
          <label>Admission Number</label>
          <input type="text" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} placeholder="e.g. ADM-2025-001" />
        </div>
        <div className="field">
          <label>Date of Admission <span className="req">*</span></label>
          <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required />
        </div>
        <div className="field col-span-2">
          <label>Student Full Name <span className="req">*</span></label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name as per birth certificate" required />
        </div>
        <div className="field">
          <label>Username <span className="auto-badge"><i className="ti ti-bolt" style={{ fontSize: '10px' }}></i>Auto</span></label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Auto-generated" className="auto" />
          <span className="hint">Leave blank to auto-generate</span>
        </div>
        <div className="field">
          <label>Password <span className="req">*</span></label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Set login password" required />
        </div>
        <div className="field">
          <label>Date of Birth <span className="req">*</span></label>
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Gender <span className="req">*</span></label>
          <div className="gender-row">
            <button 
              type="button"
              className={`gender-btn ${formData.gender === 'boy' ? 'active boy' : ''}`} 
              onClick={() => selectGender('boy')}
            >
              <i className="ti ti-mars" style={{ fontSize: '16px' }}></i> Boy
            </button>
            <button 
              type="button"
              className={`gender-btn ${formData.gender === 'girl' ? 'active girl' : ''}`} 
              onClick={() => selectGender('girl')}
            >
              <i className="ti ti-venus" style={{ fontSize: '16px' }}></i> Girl
            </button>
          </div>
        </div>
        <div className="field">
          <label>Roll Number</label>
          <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} placeholder="Class roll number" />
        </div>
        <div className="field">
          <label>Blood Group</label>
          <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
            <option value="">Select</option>
            {bloodGroups.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: '8px' }}>
        <i className="ti ti-id" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
        <span className="section-title">Government IDs</span>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>Student Aadhaar Number</label>
          <input type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} placeholder="12-digit Aadhaar" maxLength={14} />
        </div>
        <div className="field">
          <label>Student PEN / Govt. ID</label>
          <input type="text" name="penNumber" value={formData.penNumber} onChange={handleChange} placeholder="Permanent Education Number" />
        </div>
        <div className="field">
          <label>Samagra ID</label>
          <input type="text" name="samagraId" value={formData.samagraId} onChange={handleChange} placeholder="8-digit Samagra ID" />
        </div>
        <div className="field">
          <label>APAAR ID</label>
          <input type="text" name="apaarId" value={formData.apaarId} onChange={handleChange} placeholder="Academic Bank of Credits ID" />
        </div>
        <div className="field">
          <label>UDISE ID</label>
          <input type="text" name="udiseId" value={formData.udiseId} onChange={handleChange} placeholder="School UDISE Code" />
        </div>
      </div>

      <div className="section-header" style={{ marginTop: '8px' }}>
        <i className="ti ti-ruler-measure" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
        <span className="section-title">Physical Attributes & Photo</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '14px', alignItems: 'start' }}>
        <div className="field">
          <label>Height (CM)</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 125" />
        </div>
        <div className="field">
          <label>Weight (KG)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 32" />
        </div>
        <div></div>
        <div className="photo-area">
          <div id="photo-preview-area">
            {formData.studentPhoto ? (
              <img src={formData.studentPhoto} className="photo-preview" alt="Student" />
            ) : (
              <div className="photo-upload-box" style={{ width: '100px' }} onClick={() => document.getElementById('photo-input')?.click()}>
                <i className="ti ti-user-circle" style={{ fontSize: '28px', color: 'var(--gray-300)' }}></i>
                <p style={{ fontSize: '12px', color: 'var(--gray-400)', textAlign: 'center' }}>Student<br />Photo</p>
              </div>
            )}
          </div>
          <div className="photo-upload-btns" style={{ width: '200px' }}>
            <label className="photo-btn cam" style={{ cursor: 'pointer' }}>
              <i className="ti ti-camera" style={{ fontSize: '13px' }}></i> Camera
            </label>
            <label className="photo-btn" style={{ cursor: 'pointer' }} onClick={() => document.getElementById('photo-input')?.click()}>
              <i className="ti ti-photo" style={{ fontSize: '13px' }}></i> Gallery
            </label>
          </div>
          <input 
            type="file" 
            id="photo-input" 
            accept="image/jpeg,image/png" 
            style={{ display: 'none' }} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => setFormData({ ...formData, studentPhoto: event.target?.result });
                reader.readAsDataURL(file);
              }
            }} 
          />
          <span className="hint" style={{ fontSize: '10px' }}>JPG/PNG, max 100KB</span>
        </div>
      </div>
    </div>
  );
}
