'use client';

import { useState } from 'react';
import { updateFeeHead } from './actions';

export default function EditFeeHeadModal({
  tenantId,
  head,
}: {
  tenantId: string;
  head: { id: string; name: string; description: string | null; isRefundable: boolean };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const res = await updateFeeHead(tenantId, head.id, formData);
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
        style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
      >
        Edit
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '400px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '800' }}>Edit Fee Category</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Update the name and properties of this category.</p>
            
            {error && <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Category Name</label>
                <input name="name" required defaultValue={head.name} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Description</label>
                <input name="description" defaultValue={head.description || ''} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" name="isRefundable" id={`edit-refundable-${head.id}`} defaultChecked={head.isRefundable} />
                <label htmlFor={`edit-refundable-${head.id}`} style={{ fontSize: '0.9rem' }}>Is Refundable?</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsOpen(false)} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
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
