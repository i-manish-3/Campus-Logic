'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function FeesReportClient({
  tenantId,
  sessions,
  classes,
  feeHeads,
  payments,
  pendingFees,
  exemptedTotal,
  filters
}: {
  tenantId: string;
  sessions: any[];
  classes: any[];
  feeHeads: any[];
  payments: any[];
  pendingFees: any[];
  exemptedTotal: number;
  filters: any;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'COLLECTION' | 'ARREARS'>('COLLECTION');
  const [viewMode, setViewMode] = useState<'DETAILED' | 'SUMMARY'>('SUMMARY'); // Default to Summary for ease

  // Stats Calculations
  const totalCollected = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const totalPending = useMemo(() => pendingFees.reduce((sum, f) => sum + (f.amountDue - f.amountPaid), 0), [pendingFees]);
  
  const methodStats = useMemo(() => {
    const stats: Record<string, number> = { CASH: 0, ONLINE: 0, CHEQUE: 0 };
    payments.forEach(p => {
      if (stats[p.paymentMethod] !== undefined) stats[p.paymentMethod] += p.amount;
    });
    return stats;
  }, [payments]);

  // Head-wise and Class-wise Summary Logic
  const summaries = useMemo(() => {
    const byHead: Record<string, number> = {};
    const byClass: Record<string, number> = {};

    payments.forEach(p => {
      const headName = p.studentFee?.installment?.feeStructure?.feeHead?.name || 'Unknown Head';
      const className = p.studentFee?.student?.enrollments?.[0]?.class?.name || 'Unassigned';
      
      byHead[headName] = (byHead[headName] || 0) + p.amount;
      byClass[className] = (byClass[className] || 0) + p.amount;
    });

    return { byHead, byClass };
  }, [payments]);

  // Group Payments by Receipt for a cleaner ledger
  const groupedPayments = useMemo(() => {
    const groups: Record<string, any> = {};
    payments.forEach(p => {
      const rid = p.receiptId || `TRANS-${p.id}`;
      if (!groups[rid]) {
        groups[rid] = {
          ...p,
          totalAmount: 0,
          heads: new Set<string>()
        };
      }
      groups[rid].totalAmount += p.amount;
      groups[rid].heads.add(p.studentFee?.installment?.feeStructure?.feeHead?.name || 'Misc');
    });
    return Object.values(groups).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments]);

  // Filter Handling
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* 1. Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '2rem', borderRadius: '24px', color: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.05em' }}>Revenue Collected</span>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', marginTop: '0.5rem', color: '#38bdf8' }}>₹{totalCollected.toLocaleString()}</div>
          <div style={{ fontSize: '0.85rem', marginTop: '1rem', opacity: 0.8 }}>From {payments.length} receipts</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Outstanding Arrears</span>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', marginTop: '0.5rem', color: '#ef4444' }}>₹{totalPending.toLocaleString()}</div>
          <div style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#94a3b8' }}>Across {new Set(pendingFees.map(f => f.studentId)).size} students</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Exempted Counts</span>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', marginTop: '0.5rem', color: '#4f46e5' }}>{exemptedTotal}</div>
          <div style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#94a3b8' }}>Late admissions / Waivers</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: '700', color: '#64748b' }}>CASH</span>
            <span style={{ fontWeight: '900' }}>₹{methodStats.CASH.toLocaleString()}</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(methodStats.CASH / totalCollected) * 100}%`, height: '100%', backgroundColor: '#22c55e' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            <span style={{ fontWeight: '700', color: '#64748b' }}>ONLINE</span>
            <span style={{ fontWeight: '900' }}>₹{methodStats.ONLINE.toLocaleString()}</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(methodStats.ONLINE / totalCollected) * 100}%`, height: '100%', backgroundColor: '#3b82f6' }} />
          </div>
        </div>
      </div>

      {/* 2. Advanced Filters */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <span className="material-symbols-rounded" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}>search</span>
          <input 
            type="text" 
            placeholder="Search student name or admission no..." 
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', fontWeight: '500' }}
          />
        </div>

        <select 
          value={filters.sessionId || ''} 
          onChange={(e) => updateFilter('sessionId', e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: '600', minWidth: '150px' }}
        >
          <option value="">All Sessions</option>
          {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select 
          value={filters.classId || ''} 
          onChange={(e) => updateFilter('classId', e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: '600', minWidth: '150px' }}
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select 
          value={filters.feeHeadId || ''} 
          onChange={(e) => updateFilter('feeHeadId', e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: '600', minWidth: '150px' }}
        >
          <option value="">All Fee Heads</option>
          {feeHeads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>

        <select 
          value={filters.method || ''} 
          onChange={(e) => updateFilter('method', e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: '600', minWidth: '150px' }}
        >
          <option value="">All Methods</option>
          <option value="CASH">Cash</option>
          <option value="ONLINE">Online</option>
          <option value="CHEQUE">Cheque</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="date" 
            value={filters.from || ''} 
            onChange={(e) => updateFilter('from', e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} 
          />
          <span style={{ fontWeight: '700', color: '#94a3b8' }}>to</span>
          <input 
            type="date" 
            value={filters.to || ''} 
            onChange={(e) => updateFilter('to', e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} 
          />
        </div>

        <button 
          onClick={() => router.push(pathname)}
          style={{ background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '800', cursor: 'pointer', padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>restart_alt</span>
          Clear
        </button>
      </div>

      {/* 3. Main Data Table with Tabs and View Toggle */}
      <div style={{ backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', flex: 1 }}>
            <button 
              onClick={() => setActiveTab('COLLECTION')}
              style={{ 
                flex: 1, padding: '1.5rem', border: 'none', 
                backgroundColor: activeTab === 'COLLECTION' ? 'white' : 'transparent',
                borderBottom: activeTab === 'COLLECTION' ? '4px solid #3b82f6' : 'none',
                fontWeight: '800', fontSize: '1rem', cursor: 'pointer',
                color: activeTab === 'COLLECTION' ? '#0f172a' : '#94a3b8'
              }}
            >
              Collection Analysis
            </button>
            <button 
              onClick={() => setActiveTab('ARREARS')}
              style={{ 
                flex: 1, padding: '1.5rem', border: 'none', 
                backgroundColor: activeTab === 'ARREARS' ? 'white' : 'transparent',
                borderBottom: activeTab === 'ARREARS' ? '4px solid #ef4444' : 'none',
                fontWeight: '800', fontSize: '1rem', cursor: 'pointer',
                color: activeTab === 'ARREARS' ? '#0f172a' : '#94a3b8'
              }}
            >
              Arrears Intelligence
            </button>
          </div>
          
          <div style={{ padding: '0 2rem', display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setViewMode('SUMMARY')}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                backgroundColor: viewMode === 'SUMMARY' ? '#0f172a' : 'white',
                color: viewMode === 'SUMMARY' ? 'white' : '#64748b',
                fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer'
              }}
            >
              Summary View
            </button>
            <button 
              onClick={() => setViewMode('DETAILED')}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                backgroundColor: viewMode === 'DETAILED' ? '#0f172a' : 'white',
                color: viewMode === 'DETAILED' ? 'white' : '#64748b',
                fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer'
              }}
            >
              Detailed List
            </button>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {activeTab === 'COLLECTION' ? (
            payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>payments</span>
                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#64748b' }}>No Collection Records Yet</p>
              </div>
            ) : viewMode === 'SUMMARY' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                {/* Head-wise Summary */}
                <div>
                  <h4 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontWeight: '900', fontSize: '1.1rem' }}>Collection by Fee Head</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {Object.entries(summaries.byHead).map(([name, total]) => (
                        <tr key={name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem 0', fontWeight: '700', color: '#475569' }}>{name}</td>
                          <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: '900', color: '#0f172a', fontSize: '1.1rem' }}>₹{total.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid #0f172a' }}>
                        <td style={{ padding: '1.5rem 0', fontWeight: '900', color: '#0f172a' }}>TOTAL COLLECTION</td>
                        <td style={{ padding: '1.5rem 0', textAlign: 'right', fontWeight: '900', color: '#3b82f6', fontSize: '1.5rem' }}>₹{totalCollected.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Class-wise Summary */}
                <div>
                  <h4 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontWeight: '900', fontSize: '1.1rem' }}>Collection by Class</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {Object.entries(summaries.byClass).map(([name, total]) => (
                        <tr key={name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem 0', fontWeight: '700', color: '#475569' }}>Class {name}</td>
                          <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: '900', color: '#0f172a' }}>₹{total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>
                  <th style={{ padding: '1rem' }}>Receipt Info</th>
                  <th style={{ padding: '1rem' }}>Student</th>
                  <th style={{ padding: '1rem' }}>Fee Head</th>
                  <th style={{ padding: '1rem' }}>Method</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {groupedPayments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: '800', color: '#1e293b' }}>{p.receiptId || 'TRANS-ID'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#334155' }}>{p.studentFee?.student?.user?.firstName || 'Unknown'} {p.studentFee?.student?.user?.lastName || ''}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Adm: #{p.studentFee?.student?.admissionNumber || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {Array.from(p.heads as Set<string>).map(h => (
                          <span key={h} style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', color: '#475569' }}>
                            {h}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ 
                        display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '900',
                        backgroundColor: p.paymentMethod === 'CASH' ? '#f0fdf4' : '#eff6ff',
                        color: p.paymentMethod === 'CASH' ? '#16a34a' : '#3b82f6'
                      }}>
                        {p.paymentMethod}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '900', fontSize: '1.1rem', color: '#0f172a' }}>
                      ₹{p.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )
          ) : (
            pendingFees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>verified_user</span>
                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#16a34a' }}>All Clear! No Arrears</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Congratulations! All students have cleared their dues for this selection.</p>
              </div>
            ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>
                  <th style={{ padding: '1rem' }}>Student</th>
                  <th style={{ padding: '1rem' }}>Class</th>
                  <th style={{ padding: '1rem' }}>Installment</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Balance Due</th>
                </tr>
              </thead>
              <tbody>
                {pendingFees.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: '800', color: '#1e293b' }}>{f.student.user.firstName} {f.student.user.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Adm: #{f.student.admissionNumber}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#64748b' }}>{f.student.enrollments[0]?.class?.name || 'No Class'} - {f.student.enrollments[0]?.section?.name || 'A'}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: '600', color: '#334155' }}>{f.installment.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>Due: {new Date(f.installment.dueDate).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ 
                        display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '900',
                        backgroundColor: '#fef2f2', color: '#ef4444'
                      }}>
                        {f.status}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '900', fontSize: '1.1rem', color: '#ef4444' }}>
                      ₹{(f.amountDue - f.amountPaid).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
