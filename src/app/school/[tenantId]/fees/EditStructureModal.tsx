'use client';

import { useState } from 'react';
import { updateFeeStructure } from './actions';

export default function EditStructureModal({
  tenantId,
  structure,
  feeHeads,
  classes,
}: {
  tenantId: string;
  structure: { id: string; amount: number; feeHeadId: string; classId: string | null; feeHead: { name: string } };
  feeHeads: any[];
  classes: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await updateFeeStructure(tenantId, structure.id, formData);
    setLoading(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-icon btn-icon-teal"
        title="Edit Structure"
      >
        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span>
      </button>

      {isOpen && (
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
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--gray-800)' }}>Edit Fee Structure</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Modify billing configuration</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="btn-icon">
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)' }}>Fee Head</label>
                  <select name="feeHeadId" defaultValue={structure.feeHeadId} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--gray-200)', fontSize: '14px' }}>
                    {feeHeads.map(fh => <option key={fh.id} value={fh.id}>{fh.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)' }}>Apply to Class</label>
                  <select name="classId" defaultValue={structure.classId || 'all'} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--gray-200)', fontSize: '14px' }}>
                    <option value="all">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)' }}>Amount (₹)</label>
                  <input 
                    type="number" 
                    name="amount" 
                    required 
                    defaultValue={structure.amount}
                    min="1"
                    step="0.01"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--gray-200)', fontSize: '14px', fontWeight: '700', color: 'var(--teal)' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '2rem', borderTop: '1px solid var(--gray-100)', paddingTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline" style={{ minWidth: '100px' }}>Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-teal" style={{ minWidth: '140px' }}>
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
