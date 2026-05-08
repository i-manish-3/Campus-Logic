'use client';

import { useState } from 'react';
import { updateSchoolSettings } from './actions';
import { useRouter } from 'next/navigation';

export default function SchoolSettingsClient({
  tenantId,
  tenant
}: {
  tenantId: string;
  tenant: any;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState(tenant.logoUrl || '');
  const [sigPreview, setSigPreview] = useState(tenant.signatureUrl || '');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'sig') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'logo') setLogoPreview(base64String);
        else setSigPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    // Add the base64 strings
    formData.set('logoUrl', logoPreview);
    formData.set('signatureUrl', sigPreview);

    const res = await updateSchoolSettings(tenantId, formData);
    
    setLoading(false);
    if (res.error) setMessage('❌ ' + res.error);
    else {
      setMessage('✅ Settings updated successfully!');
      router.refresh();
    }
  }

  return (
    <div className="settings-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="ti ti-settings" style={{ color: 'var(--teal)', fontSize: '24px' }}></i>
          School Branding Control
        </h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>Configure your school's visual identity, logo, and official signature.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
            <i className="ti ti-camera" style={{ color: '#0d9488' }}></i>
            Logos & Signatures
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Logo Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>School Logo</label>
              <div style={{ 
                height: '180px', 
                border: '2px dashed #cbd5e1', 
                borderRadius: '12px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                overflow: 'hidden',
                position: 'relative',
                transition: 'border-color 0.2s'
              }}>
                {logoPreview ? (
                  <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" />
                ) : (
                  <i className="ti ti-photo" style={{ fontSize: '32px', color: '#94a3b8' }}></i>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'logo')}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>Click to upload official school logo (PNG/JPG).</p>
            </div>

            {/* Signature Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Authority Signature</label>
              <div style={{ 
                height: '180px', 
                border: '2px dashed #cbd5e1', 
                borderRadius: '12px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {sigPreview ? (
                  <img src={sigPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Signature" />
                ) : (
                  <i className="ti ti-writing" style={{ fontSize: '32px', color: '#94a3b8' }}></i>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'sig')}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>Principal or Director's digital signature.</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
            <i className="ti ti-id" style={{ color: '#0d9488' }}></i>
            Official School Details
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>School Full Name</label>
              <input name="name" defaultValue={tenant.name} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: '500' }} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Registered Address</label>
              <textarea name="address" defaultValue={tenant.address || ''} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: '500', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Receipt/Invoice Prefix</label>
              <input name="receiptPrefix" defaultValue={tenant.receiptPrefix || 'RCPT'} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: '500' }} />
            </div>
          </div>
        </div>

        {message && (
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: message.includes('✅') ? '#f0fdf4' : '#fff1f2', color: message.includes('✅') ? '#166534' : '#be123c', fontWeight: '600', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            backgroundColor: '#0d9488', 
            backgroundImage: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
            color: 'white', 
            padding: '18px', 
            borderRadius: '12px', 
            border: 'none', 
            fontSize: '1rem', 
            fontWeight: '700', 
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? 'Updating Branding...' : 'Save & Update Official Branding'}
        </button>
      </form>
    </div>
  );

}
