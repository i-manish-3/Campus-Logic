'use client';

import { deleteFeeStructure } from './actions';
import { useState } from 'react';

export default function DeleteStructureButton({ 
  tenantId, 
  structureId 
}: { 
  tenantId: string; 
  structureId: string 
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this fee structure? This will also remove all its installments.')) return;
    
    setLoading(true);
    const res = await deleteFeeStructure(tenantId, structureId);
    setLoading(false);
    
    if (res.error) alert(res.error);
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
    >
      {loading ? '...' : 'Delete'}
    </button>
  );
}
