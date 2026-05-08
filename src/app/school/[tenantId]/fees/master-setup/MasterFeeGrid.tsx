'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { saveMasterSetup } from './actions';

interface FeeHead {
  id: string;
  name: string;
  frequency: string;
}

interface FeeGroup {
  id: string;
  name: string;
  structures: any[];
}

const MONTHS = [
  'April', 'May', 'June', 'July', 'August', 'September', 
  'October', 'November', 'December', 'January', 'February', 'March'
];

export default function MasterFeeGrid({ 
  tenantId, heads, groups, classes, currentSessionId 
}: { 
  tenantId: string; heads: FeeHead[]; groups: FeeGroup[]; classes: any[]; currentSessionId: string | undefined;
}) {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [gridData, setGridData] = useState<Record<string, Record<number, string>>>({});
  const [nonMonthlyData, setNonMonthlyData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Determine which heads are in the selected group
  const groupHeads = useMemo(() => {
    if (!selectedGroupId) return [];
    const group = groups.find(g => g.id === selectedGroupId);
    if (!group) return [];
    
    // Get unique heads from structures in this group
    const headIds = [...new Set(group.structures.map(s => s.feeHeadId))];
    return heads.filter(h => headIds.includes(h.id));
  }, [selectedGroupId, groups, heads]);

  // Load existing data
  useEffect(() => {
    if (selectedGroupId && selectedClassId) {
      const group = groups.find(g => g.id === selectedGroupId);
      if (group) {
        const classStructures = group.structures.filter(s => s.classId === selectedClassId);
        
        const newGrid: Record<string, Record<number, string>> = {};
        const newNonMonthly: Record<string, string> = {};

        classStructures.forEach(s => {
          if (s.frequency === 'MONTHLY') {
            newGrid[s.feeHeadId] = {};
            s.installments.forEach((inst: any) => {
              const month = new Date(inst.dueDate).getMonth();
              const academicIndex = (month - 3 + 12) % 12;
              newGrid[s.feeHeadId][academicIndex] = inst.amount.toString();
            });
          } else {
            newNonMonthly[s.feeHeadId] = s.amount.toString();
          }
        });
        setGridData(newGrid);
        setNonMonthlyData(newNonMonthly);
      }
    }
  }, [selectedGroupId, selectedClassId, groups]);

  const handleMonthlyChange = (headId: string, monthIdx: number, val: string) => {
    setGridData(prev => ({
      ...prev,
      [headId]: { ...(prev[headId] || {}), [monthIdx]: val }
    }));
  };

  const totals = useMemo(() => {
    let grandTotal = 0;
    groupHeads.forEach(h => {
      if (h.frequency === 'MONTHLY') {
        for (let i = 0; i < 12; i++) grandTotal += parseFloat(gridData[h.id]?.[i] || '0');
      } else {
        grandTotal += parseFloat(nonMonthlyData[h.id] || '0');
      }
    });
    return grandTotal;
  }, [gridData, nonMonthlyData, groupHeads]);

  const handleSave = async () => {
    if (!selectedGroupId || !selectedClassId) return alert('Please select Group and Class');
    setIsSaving(true);
    try {
      const res = await saveMasterSetup(tenantId, {
        groupId: selectedGroupId,
        classId: selectedClassId,
        sessionId: currentSessionId,
        monthlyData: gridData,
        nonMonthlyData: nonMonthlyData,
        headFrequencies: Object.fromEntries(groupHeads.map(h => [h.id, h.frequency]))
      });
      if (res.success) alert('Saved Successfully!');
      else alert(res.error);
    } catch (e) {
      alert('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Selector Bar */}
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="input-group">
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>SELECT GROUP</label>
          <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', fontWeight: '600' }}>
            <option value="">Choose a Group (e.g. New Admission)</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>SELECT CLASS</label>
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', fontWeight: '600' }}>
            <option value="">Choose a Target Class</option>
            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {selectedGroupId && selectedClassId ? (
        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#475569' }}>FEE HEAD</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#475569' }}>FREQUENCY</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '12px', fontWeight: '800', color: '#475569' }}>AMOUNT CONFIGURATION</th>
              </tr>
            </thead>
            <tbody>
              {groupHeads.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e293b' }}>{h.name}</div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ padding: '4px 10px', background: 'var(--teal-bg)', color: 'var(--teal)', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{h.frequency}</span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    {(h.frequency?.toUpperCase() === 'MONTHLY' || !h.frequency) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', flex: 1 }}>
                          {MONTHS.map((m, idx) => (
                            <div key={m} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>{m.slice(0,3)}</span>
                              <input 
                                type="number" 
                                value={gridData[h.id]?.[idx] || ''} 
                                onChange={(e) => handleMonthlyChange(h.id, idx, e.target.value)} 
                                style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '100%', textAlign: 'center', fontWeight: '700' }} 
                              />
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => {
                            const firstMonthVal = gridData[h.id]?.[0] || '0';
                            const updated: Record<number, string> = {};
                            for(let i=0; i<12; i++) updated[i] = firstMonthVal;
                            setGridData(prev => ({ ...prev, [h.id]: updated }));
                          }}
                          style={{
                            padding: '8px 12px',
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '800',
                            color: '#64748b',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Apply to All
                        </button>
                      </div>
                    ) : (
                      <div style={{ maxWidth: '200px', margin: '0 auto' }}>
                        <input type="number" placeholder="Enter Total Annual Amount" value={nonMonthlyData[h.id] || ''} onChange={(e) => setNonMonthlyData(prev => ({...prev, [h.id]: e.target.value}))} style={{ padding: '12px', border: '1px solid var(--teal-light)', background: 'var(--teal-bg)', borderRadius: '12px', width: '100%', textAlign: 'center', fontWeight: '800', fontSize: '16px', color: 'var(--teal-dark)' }} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: '2rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Annual Fee for this Combo</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>₹{totals.toLocaleString()}</div>
            </div>
            <button onClick={handleSave} disabled={isSaving} style={{ padding: '16px 32px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(20, 184, 166, 0.4)' }}>
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '5rem', textAlign: 'center', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '32px' }}>
          <h3 style={{ color: '#64748b' }}>Select a Group and Class to fill amounts</h3>
        </div>
      )}
    </div>
  );
}
