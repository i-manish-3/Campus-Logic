'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFeeStructure } from '../actions';

interface FeeStructureFormProps {
  tenantId: string;
  feeHeads: any[];
  classes: any[];
  currentSession: any;
}

export default function FeeStructureForm({
  tenantId,
  feeHeads,
  classes,
  currentSession
}: FeeStructureFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [baseAmount, setBaseAmount] = useState('0');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await createFeeStructure(tenantId, formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push(`/school/${tenantId}/fees`);
      router.refresh();
    }
  }

  const months = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

  return (
    <div className="admission-wizard" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title">
          <div style={{ background: 'var(--teal-bg)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '4px' }}>
            <span className="material-symbols-rounded" style={{ color: 'var(--teal-dark)' }}>account_balance_wallet</span>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--gray-900)' }}>Create Fee Structure</div>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ti ti-calendar" style={{ fontSize: '14px' }}></i> Session: {currentSession.name}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" onClick={() => router.back()} className="btn btn-outline" style={{ borderRadius: '12px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_back</span>
            Back
          </button>
        </div>
      </div>

      <div className="form-card" style={{ borderRadius: '24px', border: '1px solid var(--gray-200)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-body" style={{ padding: '2.5rem' }}>
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-rounded">error</span>
                {error}
              </div>
            )}

            <input type="hidden" name="sessionId" value={currentSession.id} />

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '3rem' }}>
              {/* Left Column: Basic Settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--gray-800)' }}>General Settings</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--gray-500)' }}>Define which head and class this fee applies to.</p>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)' }}>Fee Head</label>
                  <select name="feeHeadId" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--gray-200)', fontSize: '14px', background: 'var(--gray-50)' }}>
                    <option value="">Select Fee Head</option>
                    {feeHeads.map(fh => <option key={fh.id} value={fh.id}>{fh.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)' }}>Applicable Classes</label>
                  <select name="classId" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--gray-200)', fontSize: '14px', background: 'var(--gray-50)' }}>
                    <option value="all">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)' }}>Base Amount (₹)</label>
                    <input 
                      type="number" 
                      name="amount" 
                      required 
                      min="0" 
                      step="0.01" 
                      value={baseAmount}
                      onChange={(e) => setBaseAmount(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--teal-light)', fontSize: '16px', fontWeight: '800', color: 'var(--teal-dark)', background: 'var(--teal-bg)' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--gray-700)' }}>Frequency</label>
                    <select 
                      name="frequency" 
                      required 
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--gray-200)', fontSize: '14px' }}
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="HALF_YEARLY">Half Yearly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="ONE_TIME">One Time</option>
                    </select>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '1.25rem', background: '#fff', borderRadius: '16px', border: '2px solid var(--gray-100)', transition: 'all 0.2s' }}>
                  <input type="checkbox" name="isAdmissionFee" style={{ width: '20px', height: '20px', accentColor: 'var(--teal)' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--gray-800)' }}>Mark as Admission Fee</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Only charged to students at the time of admission.</div>
                  </div>
                </label>
              </div>

              {/* Right Column: Month Selection or Info */}
              <div style={{ borderLeft: '1px solid var(--gray-100)', paddingLeft: '3rem' }}>
                {frequency === 'MONTHLY' ? (
                  <div style={{ background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--gray-800)' }}>Installment Plan</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--gray-500)' }}>Set 0 for holiday months or use sync to fill all.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const inputs = document.querySelectorAll('input[name^="month_"]');
                          inputs.forEach((input: any) => input.value = baseAmount);
                        }}
                        className="btn btn-teal"
                        style={{ padding: '8px 16px', fontSize: '11px', borderRadius: '10px' }}
                      >
                        <i className="ti ti-refresh" style={{ fontSize: '14px' }}></i> Sync All
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      {months.map((month) => (
                        <div key={month} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--gray-50)', padding: '12px', borderRadius: '12px', border: '1px solid var(--gray-100)' }}>
                          <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{month}</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '700' }}>₹</span>
                            <input 
                              type="number" 
                              name={`month_${month.toLowerCase()}`} 
                              defaultValue="0"
                              min="0" 
                              step="0.01" 
                              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '15px', fontWeight: '800', color: 'var(--gray-800)', outline: 'none' }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--gray-50)', borderRadius: '24px', border: '1px dashed var(--gray-300)', padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '32px', color: 'var(--gray-400)' }}>event_repeat</span>
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem', color: 'var(--gray-800)', fontWeight: '800' }}>Frequency: {frequency}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-500)', lineHeight: '1.6' }}>
                      Billing records will be automatically generated based on the base amount for this frequency. Individual month breakdown is only available for Monthly frequency.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-footer" style={{ borderTop: '1px solid var(--gray-100)', padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--gray-50)', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
            <button type="button" onClick={() => router.back()} className="btn btn-outline" style={{ minWidth: '120px', borderRadius: '12px' }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-teal" style={{ minWidth: '220px', borderRadius: '12px', height: '48px', fontSize: '15px', fontWeight: '700' }}>
              {loading ? (
                <><span className="material-symbols-rounded" style={{ animation: 'spin 1s linear infinite' }}>sync</span> Saving...</>
              ) : (
                <><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>check_circle</span> Create Structure</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
