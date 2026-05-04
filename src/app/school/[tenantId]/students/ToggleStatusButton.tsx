'use client';

import { useState } from 'react';
import { toggleStudentStatus } from './actions';

export default function ToggleStatusButton({
  tenantId,
  studentId,
  isActive
}: {
  tenantId: string;
  studentId: string;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const action = isActive ? 'disable' : 'activate';
    if (confirm(`Are you sure you want to ${action} this student?`)) {
      setLoading(true);
      const res = await toggleStudentStatus(tenantId, studentId);
      setLoading(false);
      if (res.error) alert(res.error);
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      title={isActive ? "Disable Student" : "Activate Student"}
      style={{ 
        color: isActive ? '#64748b' : '#059669', 
        backgroundColor: isActive ? '#f1f5f9' : '#f0fdf4',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>
        {isActive ? 'person_off' : 'person_check'}
      </span>
    </button>
  );
}
