'use client';

import { useState } from 'react';
import { createFeeHead, createFeeStructure } from './actions';

type FeeHead = { id: string; name: string };
type AcademicSession = { id: string; name: string; isCurrent: boolean };
type ClassObj = { id: string; name: string };

export default function FeeModals({
  tenantId,
  feeHeads,
  sessions,
  classes,
}: {
  tenantId: string;
  feeHeads: FeeHead[];
  sessions: AcademicSession[];
  classes: ClassObj[];
}) {
  const [activeModal, setActiveModal] = useState<'NONE' | 'FEE_HEAD' | 'FEE_STRUCTURE'>('NONE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreateFeeHead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await createFeeHead(tenantId, formData);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setActiveModal('NONE');
    }
  }

  async function handleCreateFeeStructure(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await createFeeStructure(tenantId, formData);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setActiveModal('NONE');
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => setActiveModal('FEE_HEAD')} style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Create Fee Head
        </button>
        <button onClick={() => setActiveModal('FEE_STRUCTURE')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Create Fee Structure
        </button>
      </div>

      {activeModal === 'FEE_HEAD' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button 
              onClick={() => setActiveModal('NONE')}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>close</span>
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Create Fee Head</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Define a new category for fee collection.</p>
            
            <form onSubmit={handleCreateFeeHead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Name (e.g. Tuition Fee)</label>
                <input name="name" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Description (Optional)</label>
                <input name="description" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" name="isRefundable" id="isRefundable" />
                <label htmlFor="isRefundable" style={{ fontSize: '0.9rem' }}>Is Refundable?</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveModal('NONE')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ backgroundColor: '#4f46e5', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Fee Head'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'FEE_STRUCTURE' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button 
              onClick={() => setActiveModal('NONE')}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>close</span>
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Create Fee Structure</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Assign fees to specific classes and set payment frequency.</p>
            
            <form onSubmit={handleCreateFeeStructure} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Fee Head</label>
                <select name="feeHeadId" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                  <option value="">Select Fee Head</option>
                  {feeHeads.map(fh => <option key={fh.id} value={fh.id}>{fh.name}</option>)}
                </select>
                {feeHeads.length === 0 && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem' }}>You must create a Fee Head first.</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Academic Session</label>
                <select name="sessionId" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                  <option value="">Select Session</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>)}
                </select>
                {sessions.length === 0 && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem' }}>You must create an Academic Session first (in Academic Setup).</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Class</label>
                <select name="classId" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                  <option value="all">All Classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Amount (₹)</label>
                  <input type="number" name="amount" required min="1" step="0.01" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Frequency</label>
                  <select name="frequency" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="HALF_YEARLY">Half Yearly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="ONE_TIME">One Time</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff7ed', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                <input type="checkbox" name="isAdmissionFee" id="isAdmissionFee" />
                <label htmlFor="isAdmissionFee" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#9a3412' }}>
                  Is Admission Fee? (Added to New Students Only)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveModal('NONE')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading || feeHeads.length === 0 || sessions.length === 0} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Structure'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
