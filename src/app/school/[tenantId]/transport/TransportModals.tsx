'use client';

import { useState } from 'react';
import { createTransportRoute } from './actions';

export default function TransportModals({ tenantId }: { tenantId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await createTransportRoute(tenantId, formData);
    setLoading(false);
    if (res.error) setError(res.error);
    else setIsOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          backgroundColor: '#0f172a', 
          color: 'white', 
          border: 'none', 
          padding: '0.75rem 1.5rem', 
          borderRadius: '12px', 
          cursor: 'pointer', 
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>add</span>
        Create Route
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>close</span>
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Create Transport Route</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Define a new bus route and set the monthly transport fee.</p>
            
            {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid #fee2e2', fontWeight: '600' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Route Name *</label>
                <input name="name" required placeholder="e.g. Route A - North City" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Vehicle Number</label>
                  <input name="vehicleNumber" placeholder="DL-01-AB-1234" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Monthly Fee *</label>
                  <input name="feeAmount" type="number" required placeholder="1500" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Driver Name</label>
                <input name="driverName" placeholder="Full Name" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Driver Phone</label>
                <input name="driverPhone" placeholder="10-digit number" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ flex: 1, backgroundColor: '#0f172a', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}
                >
                  {loading ? 'Processing...' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
