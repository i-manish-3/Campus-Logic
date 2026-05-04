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
        style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', marginRight: '1rem', fontWeight: 500 }}
      >
        Edit
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '450px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Edit Fee Structure</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Modify the configuration for this fee category.
            </p>
            
            {error && <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Fee Category (Head)</label>
                <select name="feeHeadId" defaultValue={structure.feeHeadId} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                  {feeHeads.map(fh => <option key={fh.id} value={fh.id}>{fh.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Apply to Class</label>
                <select name="classId" defaultValue={structure.classId || 'all'} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                  <option value="all">All Classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Amount (₹)</label>
                <input 
                  type="number" 
                  name="amount" 
                  required 
                  defaultValue={structure.amount}
                  min="1"
                  step="0.01"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsOpen(false)} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                >
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
