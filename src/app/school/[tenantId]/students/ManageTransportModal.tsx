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
  routes: { id: string, name: string, feeAmount: number, stopsJson?: string }[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0: Route selection, 1: Stop selection

  async function handleUpdate(routeId: string | null, stopName: string | null = null) {
    setLoading(true);
    const res = await updateStudentTransport(tenantId, studentId, routeId, stopName);
    setLoading(false);
    if (res.error) alert(res.error);
    else {
      setIsOpen(false);
      setStep(0);
      setSelectedRouteId(null);
    }
  }

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const stops = selectedRoute?.stopsJson ? JSON.parse(selectedRoute.stopsJson) : [];

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
              onClick={() => { setIsOpen(false); setStep(0); setSelectedRouteId(null); }}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>close</span>
            </button>

            {step === 0 ? (
              <>
                <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Transport Route</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Select a route to assign to this student.</p>
                
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
                      onClick={() => {
                        setSelectedRouteId(route.id);
                        setStep(1);
                      }}
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
                      <span className="material-symbols-rounded" style={{ fontSize: '1.2rem', color: '#94a3b8' }}>chevron_right</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setStep(0)}
                  style={{ background: 'none', border: 'none', color: '#f97316', padding: 0, fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>arrow_back</span> Back to Routes
                </button>
                <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Select Stop</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Choose the specific stop for <strong>{selectedRoute?.name}</strong>.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                  {stops.length > 0 ? (
                    stops.map((stop: any, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => handleUpdate(selectedRouteId, stop.name)}
                        disabled={loading}
                        style={{ 
                          padding: '1rem', 
                          borderRadius: '12px', 
                          border: '1px solid #e2e8f0',
                          backgroundColor: 'white',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>{stop.name}</span>
                        <span style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: '700' }}>₹{stop.fare}</span>
                      </button>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      <p>No stops defined for this route.</p>
                      <button 
                        onClick={() => handleUpdate(selectedRouteId, null)}
                        style={{ marginTop: '1rem', backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        Proceed with Base Fare
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Note: Stop-specific fares will be applied to all future fee installments.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
