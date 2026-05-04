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
        <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>person_add</span>
        Admit Student
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button
              onClick={closeAndReset}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>close</span>
            </button>

            {successStudentId ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '3rem' }}>check_circle</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Admission Successful!</h2>
                <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>The student profile has been created and all fees have been assigned.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <a
                    href={`/school/${tenantId}/students/${successStudentId}/fees`}
                    style={{ backgroundColor: '#059669', color: 'white', padding: '1rem', borderRadius: '14px', textDecoration: 'none', fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)' }}
                  >
                    💰 Collect Admission Fee Now
                  </a>
                  <button
                    onClick={closeAndReset}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Done, I'll collect later
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Student Admission Form</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Enter the details of the new student to create their academic profile.</p>
                {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid #fee2e2', fontWeight: '600' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>First Name *</label>
                    <input name="firstName" required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Last Name</label>
                    <input name="lastName" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Email Address *</label>
                    <input type="email" name="email" required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                  </div>

                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid #f1f5f9', marginTop: '0.5rem', paddingTop: '1rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Academic & Operations</h3>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Admission Number *</label>
                    <input name="admissionNumber" required defaultValue={nextAdm} key={nextAdm} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Academic Session *</label>
                    <select name="sessionId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: 'white' }}>
                      <option value="">Select Session</option>
                      {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Class *</label>
                    <select
                      name="classId"
                      required
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: 'white' }}
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Section</label>
                    <select name="sectionId" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: 'white' }}>
                      <option value="">Select Section</option>
                      {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Transport Route (Optional)</label>
                    <select name="transportRouteId" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: 'white' }}>
                      <option value="">No Transport</option>
                      {transportRoutes.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} (₹{r.feeAmount}/mo)
                        </option>
                      ))}
                    </select>
                    <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>If selected, transport fees will be automatically added to the student's ledger.</p>
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ flex: 1, backgroundColor: '#059669', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}
                    >
                      {loading ? 'Admitting...' : 'Complete Admission'}
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
