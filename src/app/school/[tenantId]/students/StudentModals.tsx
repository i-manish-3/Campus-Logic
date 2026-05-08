'use client';

import { useState, useEffect } from 'react';
import { admitStudent, getNextAdmissionNumber } from './actions';

type Session = { id: string; name: string; isCurrent: boolean };
type ClassObj = { id: string; name: string };
type Section = { id: string; name: string; classId: string };
type TransportRoute = { id: string; name: string; feeAmount: number };

export default function StudentModals({
  tenantId,
  sessions,
  classes,
  sections,
  transportRoutes = [],
}: {
  tenantId: string;
  sessions: Session[];
  classes: ClassObj[];
  sections: Section[];
  transportRoutes?: TransportRoute[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [successStudentId, setSuccessStudentId] = useState<string | null>(null);
  const [nextAdm, setNextAdm] = useState('');

  useEffect(() => {
    if (isOpen && !successStudentId) {
      getNextAdmissionNumber(tenantId).then(setNextAdm);
    }
  }, [isOpen, tenantId, successStudentId]);

  const filteredSections = sections.filter(s => s.classId === selectedClassId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await admitStudent(tenantId, formData);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessStudentId(res.studentId || null);
      (e.target as HTMLFormElement).reset();
    }
  }

  const closeAndReset = () => {
    setIsOpen(false);
    setSuccessStudentId(null);
    setError('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          backgroundColor: '#0d9488',
          color: 'white',
          border: 'none',
          padding: '0.65rem 1.25rem',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
          transition: 'transform 0.1s'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <i className="ti ti-user-plus" style={{ fontSize: '1.1rem' }}></i>
        Admit Student
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button
              onClick={closeAndReset}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <i className="ti ti-x" style={{ fontSize: '1.25rem' }}></i>
            </button>

            {successStudentId ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #ccfbf1' }}>
                  <i className="ti ti-circle-check" style={{ fontSize: '3rem' }}></i>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Admission Successful!</h2>
                <p style={{ color: '#64748b', marginBottom: '2.5rem', fontWeight: '500' }}>The student profile has been created and all fees have been assigned.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <a
                    href={`/school/${tenantId}/students/${successStudentId}/fees`}
                    style={{ backgroundColor: '#0d9488', color: 'white', padding: '1rem', borderRadius: '14px', textDecoration: 'none', fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.3)' }}
                  >
                    💰 Collect Admission Fee Now
                  </a>
                  <button
                    onClick={closeAndReset}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Done, I'll collect later
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>Student Admission Form</h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: '500' }}>Enter the details of the new student to create their academic profile.</p>
                {error && <div style={{ color: '#be123c', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fff1f2', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid #fecdd3', fontWeight: '700' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>First Name *</label>
                    <input name="firstName" required style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', fontWeight: '500' }} />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Last Name</label>
                    <input name="lastName" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', fontWeight: '500' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Email Address *</label>
                    <input type="email" name="email" required style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', fontWeight: '500' }} />
                  </div>

                  <div style={{ gridColumn: 'span 2', borderTop: '2px solid #f8fafc', marginTop: '0.5rem', paddingTop: '1.25rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.01em' }}>Academic & Operations</h3>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Admission Number *</label>
                    <input name="admissionNumber" required defaultValue={nextAdm} key={nextAdm} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', fontWeight: '700', color: '#0d9488', backgroundColor: '#f0fdfa' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Academic Session *</label>
                    <select name="sessionId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: 'white', fontWeight: '600' }}>
                      <option value="">Select Session</option>
                      {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Class *</label>
                    <select
                      name="classId"
                      required
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: 'white', fontWeight: '600' }}
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Section</label>
                    <select name="sectionId" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: 'white', fontWeight: '600' }}>
                      <option value="">Select Section</option>
                      {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Transport Route (Optional)</label>
                    <select name="transportRouteId" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: 'white', fontWeight: '600' }}>
                      <option value="">No Transport</option>
                      {transportRoutes.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} (₹{r.feeAmount}/mo)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ flex: 1, backgroundColor: '#0d9488', color: 'white', padding: '1rem', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', fontSize: '1rem', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)' }}
                    >
                      {loading ? 'Processing...' : 'Complete Admission'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
