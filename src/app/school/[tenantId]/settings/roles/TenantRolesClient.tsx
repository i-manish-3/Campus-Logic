'use client';

import { useState } from 'react';
import { createTenantRole, updateTenantRole, deleteTenantRole } from './actions';

interface Permission {
  id: string;
  action: string;
  description: string | null;
}

interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  tenantId: string | null;
  permissions: {
    permission: Permission;
  }[];
}

export default function TenantRolesClient({ 
  roles, 
  permissions, 
  tenantId 
}: { 
  roles: Role[], 
  permissions: Permission[],
  tenantId: string
}) {
  const [isEditing, setIsEditing] = useState<Role | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const selectedPerms = permissions.filter(p => formData.get(`perm_${p.id}`) === 'on').map(p => p.id);

    if (isEditing) {
      await updateTenantRole(tenantId, isEditing.id, name, selectedPerms);
      setIsEditing(null);
    } else {
      await createTenantRole(tenantId, name, selectedPerms);
      setIsAdding(false);
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>Staff Roles & Permissions</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Define what your teachers and staff can access.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          style={{ backgroundColor: '#0d9488', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>add</span> New Staff Role
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {roles.map(role => (
          <div key={role.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{role.name}</h3>
                <span style={{ fontSize: '0.65rem', color: role.isSystem ? '#0d9488' : '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
                  {role.isSystem ? 'Default Role' : 'Custom Role'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setIsEditing(role)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer' }}><span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>edit</span></button>
                {!role.isSystem && (
                  <button onClick={() => deleteTenantRole(tenantId, role.id)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', color: '#ef4444' }}><span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>delete</span></button>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {role.permissions.map(p => (
                <span key={p.permission.id} style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '600' }}>
                  {p.permission.action.replace('_', ' ')}
                </span>
              ))}
              {role.permissions.length === 0 && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No permissions assigned</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit */}
      {(isAdding || isEditing) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '600px', borderRadius: '20px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '800' }}>{isEditing ? 'Edit Role' : 'Create Staff Role'}</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem', color: '#475569' }}>Role Name</label>
                <input name="name" defaultValue={isEditing?.name} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} placeholder="e.g., Accountant" />
              </div>
              
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', fontSize: '0.85rem', color: '#475569' }}>Select Permissions</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '300px', overflowY: 'auto', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '12px', marginBottom: '1.5rem' }}>
                {permissions.map(p => {
                  const hasPerm = isEditing?.permissions.some(rp => rp.permission.id === p.id);
                  return (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid #f8fafc' }}>
                      <input type="checkbox" name={`perm_${p.id}`} defaultChecked={hasPerm} style={{ width: '16px', height: '16px', accentColor: '#0d9488' }} />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>{p.action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{p.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => { setIsAdding(false); setIsEditing(null); }} style={{ padding: '0.7rem 1.25rem', border: '1px solid #e2e8f0', background: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ backgroundColor: '#0d9488', color: 'white', border: 'none', padding: '0.7rem 1.25rem', borderRadius: '10px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}>
                  {loading ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
