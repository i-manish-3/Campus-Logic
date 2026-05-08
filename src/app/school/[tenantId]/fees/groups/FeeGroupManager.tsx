'use client';

import React, { useState } from 'react';
import { createFeeGroup, deleteFeeGroup, addConcession, removeConcession } from './actions';

export default function FeeGroupManager({ tenantId, groups, feeHeads }: { tenantId: string; groups: any[]; feeHeads: any[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeGroup = groups.find(g => g.id === selectedGroup?.id);

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createFeeGroup(tenantId, formData);
    if (res.success) {
      setShowAddModal(false);
      (e.target as HTMLFormElement).reset();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteGroup = async (id: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      const res = await deleteFeeGroup(tenantId, id);
      if (res.success) {
        if (selectedGroup?.id === id) setSelectedGroup(null);
      } else {
        alert(res.error);
      }
    }
  };

  const handleAddConcession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeGroup) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await addConcession(tenantId, activeGroup.id, formData);
    if (!res.success) alert(res.error);
    setIsSubmitting(false);
  };

  const handleRemoveConcession = async (id: string) => {
    const res = await removeConcession(tenantId, id);
    if (!res.success) alert(res.error);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Groups List */}
      <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Categories / Groups</h3>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="ti ti-plus"></i> New Group
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groups.map(g => (
            <div 
              key={g.id} 
              onClick={() => setSelectedGroup(g)}
              style={{ 
                padding: '1rem', 
                borderRadius: '12px', 
                border: '1px solid',
                borderColor: selectedGroup?.id === g.id ? 'var(--teal)' : '#f1f5f9',
                background: selectedGroup?.id === g.id ? 'var(--teal-bg)' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>{g.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{g.description || 'No description'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', background: '#fff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: '600' }}>
                    {g._count.students} Students
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}
                    style={{ color: '#ef4444', border: 'none', background: 'none', padding: '4px', cursor: 'pointer', marginTop: '8px' }}
                  >
                    <i className="ti ti-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {groups.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No groups defined yet.</div>}
        </div>
      </div>

      {/* Concessions Panel */}
      <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {activeGroup ? (
          <>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
              Concession Rules for "{activeGroup.name}"
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>
              Define automatic discounts for students in this group.
            </p>

            <form onSubmit={handleAddConcession} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
              <div className="field">
                <select name="feeHeadId" required style={{ width: '100%' }}>
                  <option value="">Select Fee Head</option>
                  {feeHeads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="field">
                <select name="discountType" required style={{ width: '100%' }}>
                  <option value="PERCENTAGE">% Off</option>
                  <option value="FIXED">Flat ₹</option>
                </select>
              </div>
              <div className="field">
                <input type="number" name="discountValue" placeholder="Value" required style={{ width: '100%' }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ height: '42px' }}>
                <i className="ti ti-plus"></i>
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeGroup.concessions.map((c: any) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
                  <div style={{ fontWeight: '600', color: '#334155' }}>{c.feeHead.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: 'var(--orange-dark)', fontWeight: '700' }}>
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Off` : `₹ ${c.discountValue} Off`}
                    </div>
                    <button 
                      onClick={() => handleRemoveConcession(c.id)}
                      style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <i className="ti ti-x"></i>
                    </button>
                  </div>
                </div>
              ))}
              {selectedGroup.concessions.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', border: '2px dashed #f1f5f9', borderRadius: '12px' }}>No concession rules defined. All fees will be charged at 100%.</div>}
            </div>
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '48px', marginBottom: '1rem', opacity: 0.5 }}>touch_app</span>
            <p>Select a group from the left to manage its<br/>concessions and scholarship rules.</p>
          </div>
        )}
      </div>

      {/* New Group Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem' }}>Create New Fee Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="field" style={{ marginBottom: '1.5rem' }}>
                <label>Group Name</label>
                <input type="text" name="name" placeholder="e.g. Staff Ward, Scholarship-50" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="field" style={{ marginBottom: '2rem' }}>
                <label>Description (Optional)</label>
                <textarea name="description" placeholder="Short note about this category" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={isSubmitting}>Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn { padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; display: flex; alignItems: center; gap: 8px; transition: all 0.2s; }
        .btn-primary { background: var(--teal); color: #fff; }
        .btn-primary:hover { background: var(--teal-dark); transform: translateY(-1px); }
        .btn-outline { background: #fff; border: 1px solid #e2e8f0; color: #64748b; }
        .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: #475569; marginBottom: 6px; }
        select, input { padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; }
        select:focus, input:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-light); }
      `}</style>
    </div>
  );
}
