'use client';

import { useState, useMemo } from 'react';
import { createSection, deleteSection } from '../actions';

type ClassData = {
  id: string;
  name: string;
};

type SectionData = {
  id: string;
  name: string;
  classId: string;
  className: string;
};

interface SectionFormProps {
  classes: ClassData[];
  sections: SectionData[];
  tenantId: string;
}

export default function SectionForm({ classes, sections, tenantId }: SectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Group sections by class
  const sectionsByClass = useMemo(() => {
    const groups: Record<string, SectionData[]> = {};
    sections.forEach(section => {
      if (!groups[section.classId]) {
        groups[section.classId] = [];
      }
      groups[section.classId].push(section);
    });
    return groups;
  }, [sections]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const result = await createSection(tenantId, formData);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      form.reset();
      setSelectedClassId('');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      alert(result.error || 'Failed to create section');
    }
  }

  async function handleDelete(sectionId: string) {
    if (!confirm('Are you sure you want to delete this section?')) return;
    setLoading(true);
    await deleteSection(tenantId, sectionId);
    setLoading(false);
    window.location.reload();
  }

  return (
    <main style={{ flex: 1, padding: '1.5rem' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Section Management</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Create and manage class sections</p>
        </div>
      </header>

      {/* Add Section Form */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Add New Section</h2>

        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span className="material-symbols-rounded">check_circle</span>
            Section created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                Select Class <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="classId"
                required
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                Section Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Section A, Section B"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !selectedClassId}
              style={{
                backgroundColor: success ? '#22c55e' : '#0f172a',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !selectedClassId ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>add</span>
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      {/* Sections by Class */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>All Sections</h2>
        </div>

        {sections.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '3rem', marginBottom: '0.5rem', display: 'block' }}>folder_off</span>
            No sections created yet
          </div>
        ) : (
          <div style={{ padding: '0.5rem' }}>
            {classes.map(cls => {
              const classSections = sectionsByClass[cls.id] || [];
              if (classSections.length === 0) return null;

              return (
                <div key={cls.id} style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '1.2rem', color: '#3b82f6' }}>class</span>
                    <span style={{ fontWeight: '700', color: '#1e293b' }}>{cls.name}</span>
                    <span style={{
                      backgroundColor: '#e2e8f0',
                      color: '#64748b',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      {classSections.length} {classSections.length === 1 ? 'section' : 'sections'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                    {classSections.map(section => (
                      <div
                        key={section.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 0.75rem',
                          backgroundColor: 'white',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '1rem', color: '#2563eb' }}>group</span>
                        </div>
                        <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>
                          {section.name}
                        </span>
                        <button
                          onClick={() => handleDelete(section.id)}
                          disabled={loading}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}