'use client';

import { useState } from 'react';
import { createAcademicSession, createClass, createSection } from './actions';

type ClassObj = { id: string; name: string };

export default function AcademicModals({
  tenantId,
  classes,
}: {
  tenantId: string;
  classes: ClassObj[];
}) {
  const [activeModal, setActiveModal] = useState<'NONE' | 'SESSION' | 'CLASS' | 'SECTION'>('NONE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreateSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await createAcademicSession(tenantId, formData);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setActiveModal('NONE');
    }
  }

  async function handleCreateClass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await createClass(tenantId, formData);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setActiveModal('NONE');
    }
  }

  async function handleCreateSection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await createSection(tenantId, formData);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setActiveModal('NONE');
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={() => setActiveModal('SESSION')} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
          + Add Session
        </button>
        <button onClick={() => setActiveModal('CLASS')} style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
          + Add Class
        </button>
        <button onClick={() => setActiveModal('SECTION')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
          + Add Section
        </button>
      </div>

      {activeModal === 'SESSION' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Create Academic Session</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Name (e.g. 2024-2025)</label>
                <input name="name" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Start Date</label>
                  <input type="date" name="startDate" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>End Date</label>
                  <input type="date" name="endDate" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" name="isCurrent" id="isCurrent" />
                <label htmlFor="isCurrent" style={{ fontSize: '0.9rem' }}>Set as Current Session</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveModal('NONE')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Session'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'CLASS' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Create Class</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            
            <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Class Name (e.g. Class 1)</label>
                <input name="name" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Sort Order (Number)</label>
                <input type="number" name="order" defaultValue="0" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveModal('NONE')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ backgroundColor: '#4f46e5', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Class'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'SECTION' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Create Section</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            
            <form onSubmit={handleCreateSection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Select Class</label>
                <select name="classId" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                  <option value="">Select a Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {classes.length === 0 && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem' }}>You must create a Class first.</p>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Section Name (e.g. A, B)</label>
                <input name="name" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveModal('NONE')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading || classes.length === 0} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Section'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
