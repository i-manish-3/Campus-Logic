'use client';

import { deleteFeeHead } from './actions';
import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

export default function DeleteFeeHeadButton({
  tenantId,
  headId,
}: {
  tenantId: string;
  headId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteFeeHead(tenantId, headId);
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
        title="Delete Category"
      >
        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
          {loading ? 'sync' : 'delete'}
        </span>
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Fee Head"
        message="Are you sure you want to delete this fee head? This will fail if it is linked to any structures."
        confirmLabel="Delete Head"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={loading}
      />
    </>
  );
}
