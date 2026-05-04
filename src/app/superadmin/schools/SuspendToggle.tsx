'use client';

import { useState, useTransition } from 'react';
import { toggleTenantStatus } from '../actions';

export default function SuspendToggle({
  tenantId,
  isActive,
}: {
  tenantId: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(isActive);

  function handleToggle() {
    const confirmed = confirm(
      optimistic
        ? 'Suspend this school? Students and staff will lose access.'
        : 'Re-activate this school?'
    );
    if (!confirmed) return;

    setOptimistic(!optimistic);
    startTransition(async () => {
      const res = await toggleTenantStatus(tenantId);
      if (res.error) {
        setOptimistic(optimistic); // revert
        alert(res.error);
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      title={optimistic ? 'Suspend School' : 'Activate School'}
      style={{
        padding: '0.45rem 0.9rem',
        borderRadius: '8px',
        border: 'none',
        cursor: pending ? 'wait' : 'pointer',
        fontSize: '0.78rem',
        fontWeight: '700',
        backgroundColor: optimistic ? '#fef2f2' : '#f0fdf4',
        color: optimistic ? '#dc2626' : '#16a34a',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        opacity: pending ? 0.6 : 1,
      }}
    >
      <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>
        {optimistic ? 'block' : 'check_circle'}
      </span>
      {pending ? '...' : optimistic ? 'Suspend' : 'Activate'}
    </button>
  );
}
