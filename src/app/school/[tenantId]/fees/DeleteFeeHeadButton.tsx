'use client';

import { deleteFeeHead } from './actions';

export default function DeleteFeeHeadButton({
  tenantId,
  headId,
}: {
  tenantId: string;
  headId: string;
}) {
  async function handleDelete() {
    if (confirm('Are you sure you want to delete this fee category? This will fail if it is linked to any structures.')) {
      const res = await deleteFeeHead(tenantId, headId);
      if (res.error) alert(res.error);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
    >
      Delete
    </button>
  );
}
