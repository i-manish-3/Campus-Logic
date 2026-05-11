'use client';

import { useState } from 'react';
import { createClass, createSection } from './actions';

type SubjectObj = { id: string; name: string; code: string | null };

export default function ClassModals({
  tenantId,
  subjects,
}: {
  tenantId: string;
  subjects: SubjectObj[];
}) {
  const [activeModal, setActiveModal] = useState<'NONE' | 'CLASS' | 'SECTION'>('NONE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

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
      window.location.reload();
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
      window.location.reload();
    }
  }

  // Fetch existing classes for section dropdown
  async function fetchClasses() {
    const res = await fetch(`/api/school/${tenantId}/classes`);
    if (res.ok) {
      const data = await res.json();
      setClasses(data);
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveModal('CLASS')}
          style={{
            backgroundColor: '#0f172a',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>add</span>
          Add Class
        </button>
        <button
          onClick={() => { fetchClasses(); setActiveModal('SECTION'); }}
          style={{
            backgroundColor: 'white',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}
        >
          Add Section
        </button>
      </div>

      {/* Add Class Modal */}
      {activeModal === 'CLASS' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', width: '450px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Create New Class</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

            <form onSubmit={handleCreateClass}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Class Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input name="name" required placeholder="e.g. Class 1, Nursery, UKG" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Sort Order</label>
                <input type="number" name="order" defaultValue="0" placeholder="0" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
              </div>

              {/* Subject Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Assign Subjects (Optional)</label>
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem' }}>
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <label key={subject.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                        <input type="checkbox" name="subjects" value={subject.id} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{subject.name}</span>
                        {subject.code && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({subject.code})</span>}
                      </label>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No subjects available</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setActiveModal('NONE')} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ backgroundColor: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {loading ? 'Saving...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {activeModal === 'SECTION' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', width: '400px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Add Section</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

            <form onSubmit={handleCreateSection}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Select Class <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="classId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', backgroundColor: 'white' }}>
                  <option value="">Select a Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Section Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input name="name" required placeholder="e.g. A, B, C" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setActiveModal('NONE')} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {loading ? 'Saving...' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}