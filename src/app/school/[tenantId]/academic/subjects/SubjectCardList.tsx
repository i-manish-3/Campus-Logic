'use client';

import { useState, useMemo } from 'react';
import SubjectModal from './SubjectModal';
import SubjectCard from './SubjectCard';

type ClassSubjectData = {
  id: string;
  class: {
    id: string;
    name: string;
  };
};

type SubjectData = {
  id: string;
  name: string;
  code: string | null;
  type: string;
  sequence: number | null;
  classSubjects: ClassSubjectData[];
};

interface SubjectsClientProps {
  subjects: SubjectData[];
  tenantId: string;
}

const TYPE_ORDER = ['PRIMARY', 'OPTIONAL', 'EXTRA', 'SPECIAL'];

const TYPE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  PRIMARY: { bg: '#dbeafe', color: '#1d4ed8', label: 'Primary' },
  OPTIONAL: { bg: '#fef3c7', color: '#b45309', label: 'Optional' },
  EXTRA: { bg: '#dcfce7', color: '#15803d', label: 'Extra' },
  SPECIAL: { bg: '#f3e8ff', color: '#7e22ce', label: 'Special' },
};

export default function SubjectCardList({ subjects, tenantId }: SubjectsClientProps) {
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);

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

  return (
    <main style={{ flex: 1, padding: '1.5rem' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Subject Management</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Manage academic subjects</p>
        </div>
              </header>

      {subjects.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          color: '#94a3b8',
          border: '1px solid #e2e8f0'
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>book_off</span>
          <p>No subjects yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sortedTypes.map(type => (
            <div key={type}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <h2 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: 0
                }}>
                  {TYPE_COLORS[type]?.label || type}
                </h2>
                <span style={{
                  backgroundColor: TYPE_COLORS[type]?.bg || '#f1f5f9',
                  color: TYPE_COLORS[type]?.color || '#64748b',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {groupedSubjects[type].length} {groupedSubjects[type].length === 1 ? 'subject' : 'subjects'}
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1rem',
                width: '100%'
              }}>
                {groupedSubjects[type].map((subject, index) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    index={index}
                    onEdit={() => setEditingSubject(subject)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingSubject && (
        <SubjectModal
          tenantId={tenantId}
          subject={editingSubject}
          onClose={() => setEditingSubject(null)}
        />
      )}
    </main>
  );
}