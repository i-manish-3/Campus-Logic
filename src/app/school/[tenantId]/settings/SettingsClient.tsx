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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>School Branding Control</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontWeight: '500' }}>Manage your school's visual identity and official information.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e293b' }}>
            <span className="material-symbols-rounded" style={{ color: '#3b82f6', fontSize: '2rem' }}>camera</span>
            Logos & Signatures
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
            {/* Logo Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontWeight: '800', color: '#334155', fontSize: '0.9rem' }}>School Logo</label>
              <div style={{ 
                height: '160px', 
                border: '2px dashed #e2e8f0', 
                borderRadius: '24px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {logoPreview ? (
                  <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" />
                ) : (
                  <span className="material-symbols-rounded" style={{ fontSize: '3rem', color: '#cbd5e1' }}>image</span>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'logo')}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>Click to upload official school logo.</p>
            </div>

            {/* Signature Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontWeight: '800', color: '#334155', fontSize: '0.9rem' }}>Authority Signature</label>
              <div style={{ 
                height: '160px', 
                border: '2px dashed #e2e8f0', 
                borderRadius: '24px', 
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
                  <span className="material-symbols-rounded" style={{ fontSize: '3rem', color: '#cbd5e1' }}>history_edu</span>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'sig')}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>Upload digital signature of the principal/admin.</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e293b' }}>
            <span className="material-symbols-rounded" style={{ color: '#10b981', fontSize: '2rem' }}>description</span>
            Official Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '800', color: '#334155', fontSize: '0.9rem' }}>School Name</label>
              <input name="name" defaultValue={tenant.name} required style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', fontWeight: '600' }} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '800', color: '#334155', fontSize: '0.9rem' }}>Official Address</label>
              <textarea name="address" defaultValue={tenant.address || ''} rows={3} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', fontWeight: '600', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '800', color: '#334155', fontSize: '0.9rem' }}>Receipt Prefix</label>
              <input name="receiptPrefix" defaultValue={tenant.receiptPrefix || 'RCPT'} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', fontWeight: '600' }} />
            </div>
          </div>
        </div>

        {message && (
          <div style={{ padding: '1.25rem', borderRadius: '20px', backgroundColor: message.includes('✅') ? '#f0fdf4' : '#fff1f2', color: message.includes('✅') ? '#166534' : '#be123c', fontWeight: '800', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            backgroundColor: '#0f172a', 
            color: 'white', 
            padding: '1.5rem', 
            borderRadius: '24px', 
            border: 'none', 
            fontSize: '1.1rem', 
            fontWeight: '900', 
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transition: 'transform 0.2s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {loading ? 'Propagating Changes...' : 'Save & Update Official Branding'}
        </button>
      </form>
    </div>
  );
}
