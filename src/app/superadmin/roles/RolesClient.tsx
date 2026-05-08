'use client';

import { useState } from 'react';
import { createRole, updateRole, deleteRole } from './actions';

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

export default function RolesClient({ roles, permissions }: { roles: Role[], permissions: Permission[] }) {
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
      await updateRole(isEditing.id, name, selectedPerms);
      setIsEditing(null);
    } else {
      await createRole(null, name, selectedPerms);
      setIsAdding(false);
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>Roles & Permissions</h1>
          <p style={{ color: '#64748b' }}>Manage platform-wide roles and their access levels.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span className="material-symbols-rounded">add</span> Create New Role
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {roles.map(role => (
          <div key={role.id} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{role.name}</h3>
                <span style={{ fontSize: '0.7rem', color: role.isSystem ? '#6366f1' : '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
                  {role.isSystem ? 'System Role' : 'Custom Role'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setIsEditing(role)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer' }}><span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>edit</span></button>
                {!role.isSystem && (
                  <button onClick={() => deleteRole(role.id)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', color: '#ef4444' }}><span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>delete</span></button>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {role.permissions.map(p => (
                <span key={p.permission.id} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '600' }}>
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', width: '600px', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0' }}>{isEditing ? 'Edit Role' : 'Create New Role'}</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Role Name</label>
                <input name="name" defaultValue={isEditing?.name} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="e.g., Accountant" />
              </div>
              
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>Assign Permissions</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '300px', overflowY: 'auto', padding: '10px', border: '1px solid #f1f5f9', borderRadius: '12px', marginBottom: '2rem' }}>
                {permissions.map(p => {
                  const hasPerm = isEditing?.permissions.some(rp => rp.permission.id === p.id);
                  return (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}>
                      <input type="checkbox" name={`perm_${p.id}`} defaultChecked={hasPerm} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{p.action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{p.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => { setIsAdding(false); setIsEditing(null); }} style={{ padding: '0.75rem 1.5rem', border: '1px solid #e2e8f0', background: 'none', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
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
