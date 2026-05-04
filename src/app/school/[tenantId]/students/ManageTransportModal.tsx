'use client';

import { useState } from 'react';
import { updateStudentTransport } from './actions';

export default function ManageTransportModal({ 
  tenantId, 
  studentId, 
  currentRouteId, 
  routes 
}: { 
  tenantId: string, 
  studentId: string, 
  currentRouteId: string | null, 
  routes: { id: string, name: string, feeAmount: number }[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(routeId: string | null) {
    setLoading(true);
    const res = await updateStudentTransport(tenantId, studentId, routeId);
    setLoading(false);
    if (res.error) alert(res.error);
    else setIsOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        title="Manage Transport"
        style={{ 
          color: '#f97316', 
          backgroundColor: '#fff7ed',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>directions_bus</span>
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>close</span>
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Transport Allocation</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Select a route to assign or change transport for this student.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => handleUpdate(null)}
                disabled={loading}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: currentRouteId === null ? '2px solid #f97316' : '1px solid #e2e8f0',
                  backgroundColor: currentRouteId === null ? '#fff7ed' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: currentRouteId === null ? '700' : '500'
                }}
              >
                No Transport / Remove
              </button>
              {routes.map(route => (
                <button 
                  key={route.id}
                  onClick={() => handleUpdate(route.id)}
                  disabled={loading}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    border: currentRouteId === route.id ? '2px solid #f97316' : '1px solid #e2e8f0',
                    backgroundColor: currentRouteId === route.id ? '#fff7ed' : 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: currentRouteId === route.id ? '700' : '500' }}>{route.name}</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>₹{route.feeAmount}/mo</span>
                </button>
              ))}
            </div>
            
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Note: Changing the route will automatically adjust future fee generations.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
