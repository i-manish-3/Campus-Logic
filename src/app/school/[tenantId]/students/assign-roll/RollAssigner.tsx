'use client';

import { useState } from 'react';
import { getStudentsBySection, updateRollNumbers } from '../actions';

interface Student {
  id: string;
  firstName: string;
  lastName: string | null;
  admissionNumber: string;
  rollNumber: string | null;
}

export default function RollAssigner({ 
  tenantId, 
  classes 
}: { 
  tenantId: string;
  classes: any[];
}) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sections = classes.find(c => c.id === selectedClassId)?.sections || [];

  const fetchStudents = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    const data = await getStudentsBySection(tenantId, selectedClassId, selectedSectionId);
    setStudents(data);
    setLoading(false);
  };

  const autoAssign = () => {
    const updated = [...students].map((s, index) => ({
      ...s,
      rollNumber: (index + 1).toString()
    }));
    setStudents(updated);
  };

  const handleRollChange = (id: string, val: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, rollNumber: val } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateRollNumbers(tenantId, students.map(s => ({ id: s.id, rollNumber: s.rollNumber || '' })));
    if (result.success) {
      alert('Roll numbers updated successfully!');
    } else {
      alert('Error: ' + result.error);
    }
    setSaving(false);
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  };

  const inputStyle = {
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none'
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Filters */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Select Class</label>
            <select 
              style={{ ...inputStyle, width: '100%' }} 
              value={selectedClassId} 
              onChange={(e) => { setSelectedClassId(e.target.value); setSelectedSectionId(''); }}
            >
              <option value="">Choose Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Select Section</label>
            <select 
              style={{ ...inputStyle, width: '100%' }} 
              value={selectedSectionId} 
              onChange={(e) => setSelectedSectionId(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">All Sections</option>
              {sections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button 
            onClick={fetchStudents}
            disabled={!selectedClassId || loading}
            style={{ 
              backgroundColor: '#0ea5e9', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '0.75rem 1.5rem', 
              fontWeight: '700', 
              cursor: 'pointer',
              opacity: (!selectedClassId || loading) ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Find Students'}
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
              Student List ({students.length})
            </h3>
            <button 
              onClick={autoAssign}
              style={{ 
                backgroundColor: '#1e293b', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '0.6rem 1.25rem', 
                fontWeight: '700', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>sort_by_alpha</span>
              Auto-Assign Alphabetically
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>Admission No</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>Student Name</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>Current Roll</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', width: '150px' }}>New Roll No</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>{student.admissionNumber}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#475569' }}>
                    {student.firstName} {student.lastName}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>{student.rollNumber || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <input 
                      type="text" 
                      style={{ ...inputStyle, width: '100%', textAlign: 'center' }} 
                      value={student.rollNumber || ''} 
                      onChange={(e) => handleRollChange(student.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSave}
              disabled={saving}
              style={{ 
                backgroundColor: '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                padding: '0.75rem 2.5rem', 
                fontWeight: '700', 
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Roll Numbers'}
            </button>
          </div>
        </div>
      )}

      {students.length === 0 && !loading && selectedClassId && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}>group_off</span>
          <p style={{ color: '#64748b' }}>No students found in the selected class/section.</p>
        </div>
      )}
    </div>
  );
}
