'use client';

import { useState } from 'react';
import { createSection, deleteSection, updateClassTeacher } from '../actions';

type TeacherData = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
};

type SectionData = {
  id: string;
  name: string;
  classId: string;
};

type ClassSubjectData = {
  id: string;
  subjectId: string;
  subject: {
    name: string;
  };
};

type ClassData = {
  id: string;
  name: string;
  order: number;
  teacherId: string | null;
  teacher: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  } | null;
  sections: {
    id: string;
    name: string;
    classId: string;
  }[];
  classSubjects: {
    id: string;
    subject: {
      name: string;
    };
  }[];
};

interface ClassListClientProps {
  classes: ClassData[];
  teachers: TeacherData[];
  tenantId: string;
}

export default function ClassListClient({ classes, teachers, tenantId }: ClassListClientProps) {
  const [loading, setLoading] = useState(false);
  const [addingSectionFor, setAddingSectionFor] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [assigningTeacherFor, setAssigningTeacherFor] = useState<string | null>(null);

  async function handleAddSection(classId: string) {
    if (!newSectionName.trim()) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('name', newSectionName);
    await createSection(tenantId, formData);
    setLoading(false);
    setNewSectionName('');
    setAddingSectionFor(null);
    window.location.reload();
  }

  async function handleDeleteSection(sectionId: string) {
    if (!confirm('Are you sure you want to delete this section?')) return;
    setLoading(true);
    await deleteSection(tenantId, sectionId);
    setLoading(false);
    window.location.reload();
  }

  async function handleAssignTeacher(classId: string, teacherId: string) {
    setLoading(true);
    await updateClassTeacher(tenantId, classId, teacherId);
    setLoading(false);
    setAssigningTeacherFor(null);
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Class List</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>View all classes with their sections and subjects</p>
        </div>
      </header>

      {/* Class List Table */}
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
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>All Classes</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>S.No</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Class</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Class Teacher</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Sections</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Subjects</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    No classes yet
                  </td>
                </tr>
              ) : (
                classes.map((cls, index) => (
                  <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{index + 1}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#f0f9ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0ea5e9'
                        }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>layers</span>
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{cls.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Order: {cls.order}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {assigningTeacherFor === cls.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select
                            defaultValue={cls.teacherId || ''}
                            onChange={(e) => handleAssignTeacher(cls.id, e.target.value)}
                            style={{
                              padding: '0.4rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              fontSize: '0.85rem',
                              backgroundColor: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Select Teacher</option>
                            {teachers.map(t => (
                              <option key={t.id} value={t.id}>{t.firstName} {t.lastName || ''}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => setAssigningTeacherFor(null)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              backgroundColor: '#f1f5f9',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningTeacherFor(cls.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4rem 0.75rem',
                            backgroundColor: cls.teacher ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${cls.teacher ? '#bbf7d0' : '#fecaca'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: '1rem', color: cls.teacher ? '#15803d' : '#dc2626' }}>
                            {cls.teacher ? 'check_circle' : 'person_add'}
                          </span>
                          <span style={{ color: cls.teacher ? '#15803d' : '#dc2626', fontWeight: '500' }}>
                            {cls.teacher ? `${cls.teacher.firstName} ${cls.teacher.lastName || ''}` : 'Assign Teacher'}
                          </span>
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                        {cls.sections.length > 0 ? cls.sections.map(sec => (
                          <span key={sec.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.8rem',
                            color: '#475569',
                            backgroundColor: '#f8fafc',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}>
                            {sec.name}
                            <button
                              onClick={() => handleDeleteSection(sec.id)}
                              disabled={loading}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '0.9rem' }}>close</span>
                            </button>
                          </span>
                        )) : <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No sections</span>}
                        {addingSectionFor === cls.id ? (
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={newSectionName}
                              onChange={(e) => setNewSectionName(e.target.value)}
                              placeholder="Section name"
                              autoFocus
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.8rem',
                                width: '70px'
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSection(cls.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleAddSection(cls.id)}
                              disabled={loading}
                              style={{
                                padding: '0.25rem 0.4rem',
                                backgroundColor: '#0f172a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Add
                            </button>
                            <button
                              onClick={() => { setAddingSectionFor(null); setNewSectionName(''); }}
                              style={{
                                padding: '0.25rem 0.4rem',
                                backgroundColor: '#f1f5f9',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingSectionFor(cls.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#f8fafc',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              color: '#64748b'
                            }}
                          >
                            <span className="material-symbols-rounded" style={{ fontSize: '0.9rem' }}>add</span>
                            Add
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        backgroundColor: '#f1f5f9',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px'
                      }}>
                        {cls.classSubjects.length} subjects
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '1.1rem', color: '#64748b' }}>more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}