'use client';

import React from 'react';

interface Step5Props {
  formData: any;
  setFormData: (data: any) => void;
}

const DOCUMENTS = [
  { id: 'docBirthCertificate', name: 'Birth Certificate', icon: 'ti-certificate' },
  { id: 'docTransferCertificate', name: 'Transfer Certificate', icon: 'ti-file-text' },
  { id: 'docStudentPhoto', name: 'Student Photo', icon: 'ti-user' },
  { id: 'docFatherPhoto', name: 'Father Photo', icon: 'ti-man' },
  { id: 'docMotherPhoto', name: 'Mother Photo', icon: 'ti-woman' },
  { id: 'docIncomeCert', name: 'Income Certificate', icon: 'ti-coins' },
  { id: 'docEwsCert', name: 'EWS Certificate', icon: 'ti-rosette' },
  { id: 'docCasteCert', name: 'Caste Certificate', icon: 'ti-id' },
];

export default function Step5Documents({ formData, setFormData }: Step5Props) {
  const handleUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Only JPG/JPEG/PNG allowed');
      return;
    }

    if (file.size > 100 * 1024) {
      alert('Max size is 100 KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({
        ...formData,
        [docId]: event.target?.result,
        [`${docId}Name`]: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const toggleHardCopy = (docId: string) => {
    const key = `${docId}HardCopy`;
    setFormData({ ...formData, [key]: !formData[key] });
  };

  return (
    <div className="step-content">
      <div className="section-header">
        <i className="ti ti-file-upload" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
        <span className="section-title">Document Upload</span>
        <span className="section-badge">Step 5 of 5</span>
      </div>
      <div className="info-banner">
        <i className="ti ti-info-circle"></i> 
        Accepted formats: JPG, JPEG, PNG only. Maximum file size: 100 KB per document.
      </div>

      <div className="doc-grid">
        {DOCUMENTS.map((doc) => (
          <div key={doc.id} className="doc-card">
            <div className="doc-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className={`ti ${doc.icon}`} style={{ fontSize: '16px', color: 'var(--teal)' }}></i>
                <span className="doc-name">{doc.name}</span>
              </div>
              <span className="doc-badge">Required</span>
            </div>
            
            <div 
              className="doc-upload-zone" 
              onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
            >
              {formData[doc.id] ? (
                <div className="doc-uploaded" style={{ color: '#10b981', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                  <i className="ti ti-circle-check"></i> {formData[`${doc.id}Name`] || 'Uploaded'}
                </div>
              ) : (
                <>
                  <i className="ti ti-cloud-upload" style={{ fontSize: '20px', color: 'var(--gray-300)' }}></i>
                  <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>Click to upload or drag & drop</p>
                </>
              )}
            </div>

            <div className="doc-btns">
              <label className="doc-btn cam"><i className="ti ti-camera" style={{ fontSize: '10px' }}></i> Camera</label>
              <label 
                className="doc-btn" 
                onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
              >
                <i className="ti ti-photo" style={{ fontSize: '10px' }}></i> Gallery
              </label>
            </div>
            
            <input 
              type="file" 
              id={`file-${doc.id}`} 
              accept="image/jpeg,image/jpg,image/png" 
              style={{ display: 'none' }} 
              onChange={(e) => handleUpload(doc.id, e)} 
            />

            <div className="checkbox-row">
              <input 
                type="checkbox" 
                id={`hc-${doc.id}`} 
                checked={formData[`${doc.id}HardCopy`] || false} 
                onChange={() => toggleHardCopy(doc.id)} 
              />
              <label htmlFor={`hc-${doc.id}`} style={{ fontSize: '11px', color: 'var(--gray-600)' }}>Hard Copy Submitted</label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
