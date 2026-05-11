'use client';

import { useState, useMemo } from 'react';
import { createClass } from './actions';

type ClassSubjectData = {
  id: string;
  classId: string;
  subjectId: string;
  tenantId: string;
  teacherId: string | null;
  subject?: {
    id: string;
    name: string;
    code: string | null;
    sequence: number;
    type: string;
  };
};

type SubjectData = {
  id: string;
  name: string;
  code: string | null;
  type: string;
  sequence: number | null;
  classSubjects: { classId: string }[];
};

type ClassData = {
  id: string;
  name: string;
  order: number;
  sections: { id: string; name: string }[];
  classSubjects: ClassSubjectData[];
};

interface ClassFormProps {
  subjects: SubjectData[];
  classes: ClassData[];
  tenantId: string;
}

const TYPE_ORDER = ['PRIMARY', 'OPTIONAL', 'EXTRA', 'SPECIAL'];

const TYPE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  PRIMARY: { bg: '#dbeafe', color: '#1d4ed8', label: 'Primary' },
  OPTIONAL: { bg: '#fef3c7', color: '#b45309', label: 'Optional' },
  EXTRA: { bg: '#dcfce7', color: '#15803d', label: 'Extra' },
  SPECIAL: { bg: '#f3e8ff', color: '#7e22ce', label: 'Special' },
};

export default function ClassForm({ subjects, classes, tenantId }: ClassFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const groupedSubjects = useMemo(() => {
    const groups: Record<string, SubjectData[]> = {};
    subjects.forEach(subject => {
      if (!groups[subject.type]) {
        groups[subject.type] = [];
      }
      groups[subject.type].push(subject);
    });
    return groups;
  }, [subjects]);

  const sortedTypes = useMemo(() => {
    return TYPE_ORDER.filter(type => groupedSubjects[type]?.length > 0);
  }, [groupedSubjects]);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    selectedSubjects.forEach(id => formData.append('subjects', id));
    await createClass(tenantId, formData);
    setLoading(false);
    form.reset();
    setSelectedSubjects([]);
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Class Management</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Manage classes and sections</p>
        </div>
      </header>

      {/* Add Class Form - Always Visible */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Add New Class</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '1.5rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                Class Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Class 1, Nursery, UKG"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                Sort Order
              </label>
              <input
                type="number"
                name="order"
                defaultValue="0"
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#0f172a',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                height: '46px'
              }}
            >
              {loading ? 'Adding...' : 'Add Class'}
            </button>
          </div>

          {/* Subject Selection grouped by Type */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
              Select Subjects
            </label>
            {sortedTypes.map(type => (
              <div key={type} style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    backgroundColor: TYPE_COLORS[type]?.bg,
                    color: TYPE_COLORS[type]?.color,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    {TYPE_COLORS[type]?.label || type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    ({groupedSubjects[type].length} subjects)
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                  {groupedSubjects[type].map(subject => (
                    <label
                      key={subject.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '8px',
                        border: selectedSubjects.includes(subject.id) ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        backgroundColor: selectedSubjects.includes(subject.id) ? '#eff6ff' : '#f8fafc',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject.id)}
                        onChange={() => toggleSubject(subject.id)}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        border: selectedSubjects.includes(subject.id) ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                        backgroundColor: selectedSubjects.includes(subject.id) ? '#3b82f6' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {selectedSubjects.includes(subject.id) && (
                          <span className="material-symbols-rounded" style={{ fontSize: '12px', color: 'white' }}>check</span>
                        )}
                      </span>
                      <span style={{ color: '#1e293b', fontWeight: '500' }}>{subject.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>
    </main>
  );
}