'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateTransportDriver } from '../../../actions';
import '@/app/school/[tenantId]/students/admission/admission.css';

export default function EditDriverForm({ 
  tenantId, 
  driver 
}: { 
  tenantId: string; 
  driver: any 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(driver.photoUrl);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    if (photoPreview && photoPreview !== driver.photoUrl) {
      formData.set('photo', photoPreview);
    }
    
    const res = await updateTransportDriver(tenantId, driver.id, formData);
    setLoading(false);
    
    if (res.error) {
      setError(res.error);
      window.scrollTo(0, 0);
    } else {
      router.push(`/school/${tenantId}/transport/drivers`);
    }
  }

  return (
    <div className="admission-wizard" style={{ padding: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="page-header">
          <div className="page-title">
            <i className="ti ti-edit"></i>
            Edit Driver: {driver.name}
            <span className="auto-badge"><i className="ti ti-id"></i> ID: {driver.id.slice(-6).toUpperCase()}</span>
          </div>
          <div className="header-actions">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => router.push(`/school/${tenantId}/transport/drivers`)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-teal"
              disabled={loading}
              style={{ padding: '10px 24px', fontWeight: '700' }}
            >
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fff1f2', color: '#be123c', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #fecdd3', fontWeight: '700', fontSize: '13px' }}>
            <i className="ti ti-alert-circle"></i> {error}
          </div>
        )}

        <div className="form-card">
          <div className="form-body">
            <div className="info-banner">
              <i className="ti ti-info-circle"></i> 
              Update driver information. Email address and security credentials can only be changed by system administrators for safety.
            </div>

            <div className="section-header">
              <i className="ti ti-user" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
              <span className="section-title">Personal Information</span>
            </div>
            
            <div className="form-grid">
              <div className="field col-span-2">
                <label>Full Name <span className="req">*</span></label>
                <input name="name" required defaultValue={driver.name} />
              </div>
              <div className="field">
                <label>Date of Birth</label>
                <input name="dob" type="date" defaultValue={driver.dob ? new Date(driver.dob).toISOString().split('T')[0] : ''} />
              </div>
              <div className="field">
                <label>Phone Number <span className="req">*</span></label>
                <input name="phone" required defaultValue={driver.phone} />
              </div>
              <div className="field">
                <label>License Number</label>
                <input name="licenseNumber" defaultValue={driver.licenseNumber || ''} />
              </div>
              <div className="field">
                <label>Account Email</label>
                <input value={driver.user?.email || ''} readOnly className="auto" />
                <span className="hint">Email cannot be changed</span>
              </div>
            </div>

            <div className="section-header" style={{ marginTop: '24px' }}>
              <i className="ti ti-camera" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
              <span className="section-title">Driver Photo</span>
            </div>

            <div className="field" style={{ maxWidth: '400px' }}>
               <div className="photo-area" style={{ flexDirection: 'row', gap: '20px', alignItems: 'center' }}>
                  <div id="photo-preview-area">
                    {photoPreview ? (
                      <img src={photoPreview} className="photo-preview" alt="Driver" />
                    ) : (
                      <div className="photo-upload-box" style={{ width: '80px', height: '90px' }} onClick={() => document.getElementById('photo-input')?.click()}>
                        <i className="ti ti-camera" style={{ fontSize: '24px', color: 'var(--gray-300)' }}></i>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="photo-upload-btns">
                      <label className="photo-btn cam" style={{ cursor: 'pointer' }} onClick={() => document.getElementById('photo-input')?.click()}>
                        <i className="ti ti-camera" style={{ fontSize: '13px' }}></i> Change Photo
                      </label>
                    </div>
                    <input 
                      type="file" 
                      id="photo-input" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Photo size is too large. Max 2MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span className="hint" style={{ fontSize: '10px', display: 'block', marginTop: '8px' }}>JPG/PNG, max 2MB</span>
                  </div>
               </div>
            </div>

          </div>

          <div className="form-footer">
            <div className="footer-left">
               <span className="draft-note"><i className="ti ti-history"></i> Last updated: {new Date(driver.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="footer-right">
              <button 
                type="submit" 
                className="btn btn-teal"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'} <i className="ti ti-check"></i>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
