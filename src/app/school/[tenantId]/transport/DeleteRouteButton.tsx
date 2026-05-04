'use client';

import { deleteTransportRoute } from './actions';

export default function DeleteRouteButton({ tenantId, routeId }: { tenantId: string, routeId: string }) {
  async function handleDelete() {
    if (confirm('Are you sure you want to delete this route? This will fail if students are currently assigned to it.')) {
      const res = await deleteTransportRoute(tenantId, routeId);
      if (res.error) alert(res.error);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      style={{ 
        color: '#ef4444', 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>delete</span>
    </button>
  );
}
