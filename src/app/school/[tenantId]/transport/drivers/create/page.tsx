'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createTransportDriver } from '../../actions';
import Link from 'next/link';
import '@/app/school/[tenantId]/students/admission/admission.css';

export default function CreateDriverPage() {
  const router = useRouter();
  const { tenantId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    if (photoPreview) {
      formData.set('photo', photoPreview);
    }
    const res = await createTransportDriver(tenantId as string, formData);
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
        {/* Header Section */}
      <div className="page-header">
        <div className="page-title">
          <i className="ti ti-user-plus"></i>
          Driver Onboarding Form
          <span className="auto-badge"><i className="ti ti-bolt" style={{ fontSize: '11px' }}></i> Auto-Generated UID</span>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-outline" onClick={() => router.push(`/school/${tenantId}/transport/drivers`)}><i className="ti ti-eye"></i> View Drivers</button>
          <button type="button" className="btn btn-outline" onClick={() => router.push(`/school/${tenantId}/transport`)}><i className="ti ti-bus"></i> Transport</button>
          <button type="submit" className="btn btn-save" disabled={loading}><i className="ti ti-device-floppy"></i> {loading ? 'Registering...' : 'Register Driver'}</button>
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
              Fill in the driver details below. Credentials will be used for the driver mobile app.
            </div>

            <div className="section-header">
              <i className="ti ti-user" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
              <span className="section-title">Personal Information</span>
            </div>
            
            <div className="form-grid">
              <div className="field col-span-2">
                <label>Full Name <span className="req">*</span></label>
                <input name="name" required placeholder="e.g. John Doe" />
              </div>
              <div className="field">
                <label>Date of Birth</label>
                <input name="dob" type="date" />
              </div>
              <div className="field">
                <label>Phone Number <span className="req">*</span></label>
                <input name="phone" required placeholder="10-digit mobile" />
              </div>
              <div className="field">
                <label>License Number</label>
                <input name="licenseNumber" placeholder="DL-XXXX-XXXX" />
              </div>
              <div className="field">
                 {/* Empty spacer for grid alignment if needed */}
              </div>
            </div>

            <div className="section-header" style={{ marginTop: '24px' }}>
              <i className="ti ti-lock" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
              <span className="section-title">Account Credentials</span>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Email Address <span className="req">*</span></label>
                <input name="email" type="email" required placeholder="driver@school.com" />
              </div>
              <div className="field">
                <label>Portal Password <span className="req">*</span></label>
                <input name="password" type="password" required placeholder="••••••••" />
              </div>
              <div className="field">
                {/* Photo Preview Area aligned with the grid */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                   <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--gray-600)', alignSelf: 'flex-start' }}>Driver Photo</label>
                   <div className="photo-area" style={{ flexDirection: 'row', gap: '14px', alignItems: 'flex-start', width: '100%' }}>
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
                            <i className="ti ti-camera" style={{ fontSize: '13px' }}></i> Upload
                          </label>
                        </div>
                        <input 
                          type="file" 
                          id="photo-input" 
                          name="photo"
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert('Photo size is too large. Please select an image under 2MB.');
                                e.target.value = ''; // Reset input
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <span className="hint" style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: '8px', display: 'block' }}>JPG/PNG, max 2MB</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="subsection" style={{ marginTop: '24px' }}>
              <div className="subsection-title">
                <i className="ti ti-shield-check"></i> Compliance & Safety
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--gray-500)' }}>
                  <i className="ti ti-check" style={{ color: 'var(--teal)' }}></i>
                  <span>Ensure mobile number is active for real-time tracking notifications.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--gray-500)' }}>
                  <i className="ti ti-check" style={{ color: 'var(--teal)' }}></i>
                  <span>Driving license must be valid for the current academic session.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="form-footer">
            <div className="footer-left">
               <span className="draft-note"><i className="ti ti-info-circle"></i> Onboarding a driver creates a system user account automatically.</span>
            </div>
            <div className="footer-right">
              <button 
                type="submit" 
                className="btn btn-teal"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Register & Save Driver'} <i className="ti ti-check"></i>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
