'use client';

import { useState } from 'react';
import { updateStudentProfile } from './actions';

type TransportRoute = { id: string; name: string; feeAmount: number };

export default function EditStudentModal({ 
  tenantId, 
  student, 
  routes 
}: { 
  tenantId: string, 
  student: any, 
  routes: TransportRoute[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await updateStudentProfile(tenantId, student.id, formData);
    setLoading(false);
    if (res.error) setError(res.error);
    else setIsOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        title="Edit Profile"
        style={{ 
          color: '#64748b', 
          backgroundColor: '#f1f5f9',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>edit</span>
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
            
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Edit Student Profile</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Update personal information and manage transport allocation.</p>
            
            {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid #fee2e2', fontWeight: '600' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>First Name</label>
                  <input name="firstName" defaultValue={student.user.firstName} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Last Name</label>
                  <input name="lastName" defaultValue={student.user.lastName} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Email Address</label>
                <input name="email" defaultValue={student.user.email} required type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '1.2rem', color: '#f97316' }}>directions_bus</span>
                  Transport Allocation
                </label>
                <select 
                  name="transportRouteId" 
                  defaultValue={student.transportRouteId || ''} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}
                >
                  <option value="">No Transport / Unassigned</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.name} (₹{r.feeAmount}/mo)</option>
                  ))}
                </select>
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>Changing the route will automatically update future fee generations for this student.</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ flex: 1, backgroundColor: '#0f172a', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
