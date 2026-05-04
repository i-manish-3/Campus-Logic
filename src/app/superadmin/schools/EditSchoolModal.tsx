'use client';

import { useState } from 'react';
import { updateTenant } from '../actions';

type TenantType = {
  id: string;
  name: string;
  domain: string | null;
  email: string | null;
  contactNumber: string | null;
  address: string | null;
  receiptPrefix: string;
};

export default function EditSchoolModal({ tenant }: { tenant: TenantType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: tenant.name,
    email: tenant.email || '',
    phone: tenant.contactNumber || '',
    address: tenant.address || '',
    receiptPrefix: tenant.receiptPrefix,
  });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    
    const res = await updateTenant(tenant.id, fd);
    setLoading(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', 
    border: '1px solid #e2e8f0', fontSize: '0.9rem', marginBottom: '1rem',
    boxSizing: 'border-box'
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', 
    fontWeight: '600', color: '#334155'
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.45rem 0.9rem', borderRadius: '8px',
          backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0',
          cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700',
        }}
        title="Edit School Settings"
      >
        <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>edit</span>
        Edit
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '2rem',
            width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-rounded" style={{ color: '#6366f1' }}>edit_square</span>
                Edit School
              </h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fef2f2', borderRadius: '6px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>School Name *</label>
                  <input style={inputStyle} value={form.name} onChange={update('name')} required />
                </div>
                <div>
                  <label style={labelStyle}>Contact Email</label>
                  <input type="email" style={inputStyle} value={form.email} onChange={update('email')} />
                </div>
                <div>
                  <label style={labelStyle}>Contact Phone</label>
                  <input type="tel" style={inputStyle} value={form.phone} onChange={update('phone')} />
                </div>
                <div>
                  <label style={labelStyle}>Receipt Prefix</label>
                  <input style={inputStyle} value={form.receiptPrefix} onChange={update('receiptPrefix')} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Address</label>
                  <input style={inputStyle} value={form.address} onChange={update('address')} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ ...labelStyle, color: '#94a3b8' }}>Domain (Read-Only)</label>
                  <input style={{ ...inputStyle, backgroundColor: '#f8fafc', color: '#64748b' }} value={tenant.domain || ''} disabled />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsOpen(false)} style={{
                  padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                  backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', color: '#475569'
                }}>Cancel</button>
                <button type="submit" disabled={loading} style={{
                  padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
                  backgroundColor: '#6366f1', color: 'white', cursor: loading ? 'wait' : 'pointer', fontWeight: '600'
                }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
