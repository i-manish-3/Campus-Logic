'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTransportRoute } from '../actions';
import Link from 'next/link';
import '@/app/school/[tenantId]/students/admission/admission.css';

type Session = { id: string; name: string; isCurrent: boolean };

const MONTHS = [
  { id: 'APR', name: 'April' },
  { id: 'MAY', name: 'May' },
  { id: 'JUN', name: 'June' },
  { id: 'JUL', name: 'July' },
  { id: 'AUG', name: 'August' },
  { id: 'SEP', name: 'September' },
  { id: 'OCT', name: 'October' },
  { id: 'NOV', name: 'November' },
  { id: 'DEC', name: 'December' },
  { id: 'JAN', name: 'January' },
  { id: 'FEB', name: 'February' },
  { id: 'MAR', name: 'March' },
];

export default function TransportForm({ 
  tenantId, 
  sessions,
  drivers = []
}: { 
  tenantId: string; 
  sessions: Session[];
  drivers?: { id: string; name: string; photoUrl?: string | null }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States for dynamic fields
  const [stops, setStops] = useState([{ name: '', fare: '' }]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(MONTHS.map(m => m.id));

  const addStop = () => setStops([...stops, { name: '', fare: '' }]);
  const removeStop = (index: number) => {
    if (stops.length > 1) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };

  const updateStop = (index: number, field: 'name' | 'fare', value: string) => {
    const newStops = [...stops];
    newStops[index][field] = value;
    setStops(newStops);
  };

  const toggleMonth = (monthId: string) => {
    setSelectedMonths(prev => 
      prev.includes(monthId) 
        ? prev.filter(m => m !== monthId) 
        : [...prev, monthId]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('stopsJson', JSON.stringify(stops.filter(s => s.name && s.fare)));
    formData.append('activeMonths', selectedMonths.join(','));

    const res = await createTransportRoute(tenantId, formData);
    setLoading(false);
    
    if (res.error) {
      setError(res.error);
      window.scrollTo(0, 0);
    } else {
      router.push(`/school/${tenantId}/transport`);
    }
  }

  return (
    <div className="admission-wizard" style={{ padding: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header Section */}
        <div className="page-header">
          <div className="page-title">
            <i className="ti ti-map-pin"></i>
            Configure Transport Route
            <span className="auto-badge"><i className="ti ti-route" style={{ fontSize: '11px' }}></i> Route Setup</span>
          </div>
          <div className="header-actions">
            <button type="button" className="btn btn-outline" onClick={() => router.push(`/school/${tenantId}/transport`)}><i className="ti ti-eye"></i> View Routes</button>
            <button type="submit" className="btn btn-save" disabled={loading}><i className="ti ti-device-floppy"></i> {loading ? 'Saving...' : 'Save Route'}</button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fff1f2', color: '#be123c', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #fecdd3', fontWeight: '700', fontSize: '13px' }}>
            <i className="ti ti-alert-circle"></i> {error}
          </div>
        )}

        <div className="form-card">
          <div className="form-body">
            <div className="info-banner">
              <i className="ti ti-info-circle"></i> 
              Define the route path, stops, and their respective monthly fares. Students will be assigned to these stops.
            </div>

            {/* Basic Info Section */}
            <div className="section-header">
              <i className="ti ti-info-circle" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
              <span className="section-title">Basic Route Information</span>
            </div>
            
            <div className="form-grid">
              <div className="field col-span-2">
                <label>Route Name <span className="req">*</span></label>
                <input name="name" required placeholder="e.g. Route 01 - Downtown" />
              </div>
              <div className="field">
                <label>Academic Session <span className="req">*</span></label>
                <select name="sessionId" required>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Base Route Fare (₹) <span className="req">*</span></label>
                <input name="baseFee" type="number" required defaultValue="0" style={{ fontWeight: '700', color: 'var(--teal)' }} />
              </div>
              <div className="field">
                <label>Vehicle Number</label>
                <input name="vehicleNumber" placeholder="DL-01-AB-1234" />
              </div>
              <div className="field">
                <label>Assign Driver</label>
                <select name="driverId">
                  <option value="">No Driver Assigned</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stops & Fares Section */}
            <div className="section-header" style={{ marginTop: '32px' }}>
              <i className="ti ti-map-pins" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
              <span className="section-title">Stops & Fares</span>
              <button type="button" onClick={addStop} className="btn btn-save" style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '12px' }}>
                <i className="ti ti-plus"></i> Add Stop
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {stops.map((stop, index) => (
                <div key={index} className="form-grid" style={{ marginBottom: 0, alignItems: 'end' }}>
                  <div className="field col-span-2">
                    {index === 0 && <label>Stop Name</label>}
                    <input 
                      value={stop.name} 
                      onChange={(e) => updateStop(index, 'name', e.target.value)}
                      placeholder="e.g. Central Library" 
                    />
                  </div>
                  <div className="field">
                    {index === 0 && <label>Monthly Fare (₹)</label>}
                    <input 
                      type="number"
                      value={stop.fare} 
                      onChange={(e) => updateStop(index, 'fare', e.target.value)}
                      placeholder="0.00" 
                      style={{ fontWeight: '700', color: 'var(--teal)' }}
                    />
                  </div>
                  <div style={{ paddingBottom: '2px' }}>
                    <button 
                      type="button" 
                      onClick={() => removeStop(index)}
                      className="btn-icon btn-icon-danger"
                      style={{ width: '38px', height: '38px' }}
                    >
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Fee Schedule Section */}
            <div className="section-header" style={{ marginTop: '32px' }}>
              <i className="ti ti-calendar-check" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
              <span className="section-title">Fee Collection Schedule</span>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '16px' }}>Select the months in which transport fees should be generated for students on this route.</p>
            
            <div className="form-grid-4">
              {MONTHS.map(month => (
                <label 
                  key={month.id} 
                  className="checkbox-row"
                  style={{ 
                    backgroundColor: selectedMonths.includes(month.id) ? 'var(--teal-bg)' : 'var(--gray-50)',
                    border: `1px solid ${selectedMonths.includes(month.id) ? 'var(--teal)' : 'var(--gray-200)'}`,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedMonths.includes(month.id)}
                    onChange={() => toggleMonth(month.id)}
                  />
                  <span style={{ fontSize: '12px', fontWeight: selectedMonths.includes(month.id) ? '700' : '500', color: selectedMonths.includes(month.id) ? 'var(--teal-dark)' : 'var(--gray-600)' }}>{month.name}</span>
                </label>
              ))}
            </div>

            <div className="subsection" style={{ marginTop: '32px' }}>
              <div className="subsection-title">
                <i className="ti ti-info-circle"></i> Important Note
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-500)', lineHeight: '1.6' }}>
                Fees are automatically assigned based on the student's selected stop. If no specific stop fare is defined, the <strong>Base Route Fare</strong> will be applied.
              </p>
            </div>
          </div>

          <div className="form-footer">
            <div className="footer-left">
               <span className="draft-note"><i className="ti ti-clock"></i> Changes are saved only upon submission.</span>
            </div>
            <div className="footer-right">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => router.push(`/school/${tenantId}/transport`)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-teal"
                disabled={loading}
              >
                {loading ? 'Saving Route...' : 'Create Transport Route'} <i className="ti ti-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
