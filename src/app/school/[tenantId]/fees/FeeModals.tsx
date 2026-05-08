'use client';

import { useState } from 'react';
import { createFeeHead, createFeeStructure } from './actions';
import Link from 'next/link';

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
  const [frequency, setFrequency] = useState('MONTHLY');
  const [baseAmount, setBaseAmount] = useState('0');

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
      <div className="header-actions">
        <button onClick={() => setActiveModal('FEE_HEAD')} className="btn btn-outline">
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>add_circle</span>
          Fee Head
        </button>
        <Link href={`/school/${tenantId}/fees/create`} className="btn btn-teal">
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>payments</span>
          Create Fee Structure
        </Link>
      </div>

      {activeModal === 'FEE_HEAD' && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.4)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 1000, 
          padding: '1rem' 
        }}>
          <div className="form-card" style={{ 
            width: '100%', 
            maxWidth: '450px', 
            position: 'relative',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            <style jsx>{`
              @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--gray-800)' }}>Create Fee Head</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Define a new head for financial collection</p>
              </div>
              <button onClick={() => setActiveModal('NONE')} className="btn-icon">
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleCreateFeeHead} style={{ padding: '1.5rem' }}>
              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)' }}>Fee Head Name</label>
                  <input name="name" required placeholder="e.g. Tuition Fee" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--gray-200)', fontSize: '14px' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)' }}>Description</label>
                  <input name="description" placeholder="Optional description" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--gray-200)', fontSize: '14px' }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                  <input type="checkbox" name="isRefundable" style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Is Refundable?</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '2rem', borderTop: '1px solid var(--gray-100)', paddingTop: '1.5rem' }}>
                <button type="button" onClick={() => setActiveModal('NONE')} className="btn btn-outline" style={{ minWidth: '100px' }}>Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-teal" style={{ minWidth: '140px' }}>
                  {loading ? (
                    <><span className="material-symbols-rounded" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>sync</span> Saving...</>
                  ) : 'Create Head'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
