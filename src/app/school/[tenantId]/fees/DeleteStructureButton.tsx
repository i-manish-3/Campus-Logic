'use client';

import { deleteFeeStructure } from './actions';
import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

export default function DeleteStructureButton({ 
  tenantId, 
  structureId 
}: { 
  tenantId: string; 
  structureId: string 
}) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteFeeStructure(tenantId, structureId);
    setLoading(false);
    setShowConfirm(false);
    
    if (res.error) alert(res.error);
  }

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="btn-icon btn-icon-danger"
        title="Delete Structure"
      >
        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
          {loading ? 'sync' : 'delete'}
        </span>
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Fee Structure"
        message="Are you sure you want to delete this fee structure? This will also remove all associated billing records."
        confirmLabel="Delete Structure"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={loading}
      />
    </>
  );
}
