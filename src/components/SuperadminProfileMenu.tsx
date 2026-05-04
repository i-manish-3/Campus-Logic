'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { logoutAction } from '@/app/login/actions';
import { updateSuperAdminProfile } from '@/app/superadmin/actions';

export default function SuperadminProfileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [formData, setFormData] = useState({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@gmail.com',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData();
    form.append('firstName', formData.firstName);
    form.append('lastName', formData.lastName);
    form.append('email', formData.email);
    if (formData.password) {
      form.append('password', formData.password);
    }

    const res = await updateSuperAdminProfile(form);
    if (res.error) {
      setError(res.error);
    } else {
      setModalOpen(false);
      setMenuOpen(false);
      setFormData(prev => ({ ...prev, password: '' })); // clear password
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Avatar Button */}
      <div 
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: '700', color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          transition: 'transform 0.2s',
          transform: menuOpen ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        SA
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          <div 
            onClick={() => setMenuOpen(false)} 
            style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            width: '200px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            zIndex: 100,
            animation: 'slideDown 0.2s ease-out'
          }}>
            <button 
              onClick={() => { setModalOpen(true); setMenuOpen(false); }}
              style={{
                width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'none', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                fontSize: '0.9rem', color: '#334155', fontWeight: '500', textAlign: 'left'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.2rem', color: '#64748b' }}>manage_accounts</span>
              Edit Profile
            </button>
            <form action={logoutAction}>
              <button 
                type="submit"
                style={{
                  width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.9rem', color: '#ef4444', fontWeight: '600', textAlign: 'left'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>logout</span>
                Sign Out
              </button>
            </form>
          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      {modalOpen && mounted && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '450px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'modalIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: '800' }}>Edit Profile</h2>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            
            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>First Name</label>
                  <input 
                    required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Last Name</label>
                  <input 
                    value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Email</label>
                <input 
                  type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>New Password</label>
                <input 
                  type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Leave blank to keep current"
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{
                  padding: '0.75rem 1.5rem', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#475569',
                  border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem'
                }}>Cancel</button>
                <button type="submit" disabled={loading} style={{
                  padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                  border: 'none', fontWeight: '600', cursor: 'pointer', opacity: loading ? 0.7 : 1, fontSize: '0.95rem',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                }}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
