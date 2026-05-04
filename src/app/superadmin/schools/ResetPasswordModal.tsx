'use client';

import { useState } from 'react';
import { resetSchoolAdminPassword } from '../actions';

export default function ResetPasswordModal({ tenantId, tenantName }: { tenantId: string, tenantName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ email: string; password: string } | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await resetSchoolAdminPassword(tenantId, password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess({ email: res.email!, password });
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.45rem 0.9rem', borderRadius: '8px',
          backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7',
          cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700',
        }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>key</span>
        Reset Key
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '2rem',
            width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            {!success ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Reset Password</h3>
                  <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Set a new admin password for <strong>{tenantName}</strong>.
                </p>

                {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fef2f2', borderRadius: '6px' }}>{error}</div>}

                <form onSubmit={handleReset}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>New Password</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                      marginBottom: '1.5rem', fontSize: '0.95rem', boxSizing: 'border-box'
                    }}
                    placeholder="Minimum 6 characters"
                  />
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setIsOpen(false)} style={{
                      padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                      backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', color: '#475569'
                    }}>Cancel</button>
                    <button type="submit" disabled={loading} style={{
                      padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                      backgroundColor: loading ? '#94a3b8' : '#6366f1', color: 'white', cursor: loading ? 'wait' : 'pointer', fontWeight: '600'
                    }}>
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '1.5rem' }}>check</span>
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#0f172a' }}>Password Reset Successful</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Provide these new credentials to the school admin.</p>
                
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', textAlign: 'left', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Email:</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.75rem' }}>{success.email}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>New Password:</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0f172a' }}>{success.password}</div>
                </div>

                <button onClick={() => { setIsOpen(false); setSuccess(null); setPassword(''); }} style={{
                  width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none',
                  backgroundColor: '#f1f5f9', color: '#334155', cursor: 'pointer', fontWeight: '600'
                }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
