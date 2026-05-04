'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QuickCollectClient({
  tenantId,
  classes
}: {
  tenantId: string;
  classes: any[];
}) {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedClass]);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await fetch(`/api/school/${tenantId}/students/search?q=${search}&classId=${selectedClass}`);
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>Fee Collection Portal</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: '500' }}>Search and select a student to process payments.</p>
      </header>

      {/* Search Filters */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
        border: '1px solid #f1f5f9',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '800', color: '#1e293b', fontSize: '0.9rem' }}>Search Student</label>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-rounded" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}>search</span>
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, Admission No, or Father's Name..." 
              style={{ 
                width: '100%', 
                padding: '0.85rem 1rem 0.85rem 2.75rem', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                fontSize: '0.95rem',
                fontWeight: '600',
                outline: 'none',
                backgroundColor: '#f8fafc'
              }} 
            />
          </div>
        </div>

        <div style={{ width: '250px' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '800', color: '#1e293b', fontSize: '0.9rem' }}>Filter by Class</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.85rem 1rem', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              fontSize: '0.95rem',
              fontWeight: '600',
              backgroundColor: '#f8fafc',
              cursor: 'pointer'
            }}
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Results Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '3rem', animation: 'spin 2s linear infinite' }}>sync</span>
            <p style={{ marginTop: '1rem', fontWeight: '600' }}>Finding students...</p>
          </div>
        ) : students.length > 0 ? (
          students.map(s => (
            <Link 
              key={s.id} 
              href={`/school/${tenantId}/students/${s.id}/fees`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{ 
                backgroundColor: 'white', 
                padding: '0.85rem 1.25rem', 
                borderRadius: '12px', 
                border: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#f1f5f9';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    backgroundColor: '#eff6ff', 
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.9rem'
                  }}>
                    {s.user.firstName[0]}{s.user.lastName[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{s.user.firstName} {s.user.lastName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500', display: 'flex', gap: '0.75rem', marginTop: '0.1rem' }}>
                      <span>#{s.admissionNumber}</span>
                      <span>•</span>
                      <span>{s.enrollments[0]?.class.name}</span>
                      <span>•</span>
                      <span>Father: {s.fatherName || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ color: '#3b82f6', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Collect
                  <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>chevron_right</span>
                </div>
              </div>
            </Link>
          ))
        ) : search.length >= 2 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f8fafc', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '3rem', color: '#cbd5e1' }}>person_search</span>
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: '600' }}>No students found matching your search.</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <p style={{ fontWeight: '600' }}>Start typing to find a student...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
