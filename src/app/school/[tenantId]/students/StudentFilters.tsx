'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

interface StudentFiltersProps {
  classes: { id: string; name: string }[];
  sections: { id: string; name: string; classId: string }[];
  sessions: { id: string; name: string }[];
}

export default function StudentFilters({ classes, sections, sessions }: StudentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [classId, setClassId] = useState(searchParams.get('classId') || '');
  const [sectionId, setSectionId] = useState(searchParams.get('sectionId') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sessionId, setSessionId] = useState(searchParams.get('sessionId') || '');

  // Sync state with URL when searchParams change (e.g. from back/forward or clear)
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setClassId(searchParams.get('classId') || '');
    setSectionId(searchParams.get('sectionId') || '');
    setStatus(searchParams.get('status') || '');
    setSessionId(searchParams.get('sessionId') || '');
  }, [searchParams]);

  // Filter sections based on selected class
  const filteredSections = sections.filter(s => !classId || s.classId === classId);

  const updateURL = useCallback((newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value); else params.delete(key);
    });

    // Only push if params actually changed
    if (params.toString() !== searchParams.toString()) {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [router, pathname, searchParams]);

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (q !== (searchParams.get('q') || '')) {
        updateURL({ q });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [q, updateURL, searchParams]);

  const handleSelectChange = (key: string, value: string) => {
    const updates: Record<string, string> = { [key]: value };
    if (key === 'classId') {
      updates.sectionId = ''; // Reset section when class changes
      setSectionId('');
    }
    updateURL(updates);
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1.5rem',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: '1.25rem',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
      {/* Search Input */}
      <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
        <i className="ti ti-search" style={{
          position: 'absolute',
          left: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
          fontSize: '1rem'
        }}></i>
        <input
          type="text"
          placeholder="Search by name or admission no..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 1rem 0.6rem 2.5rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            color: '#1e293b'
          }}
        />
      </div>

      {/* Session Filter */}
      <div style={{ minWidth: '140px' }}>
        <select
          value={sessionId}
          onChange={(e) => {
            setSessionId(e.target.value);
            handleSelectChange('sessionId', e.target.value);
          }}
          style={{
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            backgroundColor: 'white',
            color: '#1e293b',
            outline: 'none'
          }}
        >
          <option value="">All Sessions</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Class Filter */}
      <div style={{ minWidth: '140px' }}>
        <select
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            handleSelectChange('classId', e.target.value);
          }}
          style={{
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            backgroundColor: 'white',
            color: '#1e293b',
            outline: 'none'
          }}
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Section Filter */}
      <div style={{ minWidth: '140px' }}>
        <select
          value={sectionId}
          disabled={!classId}
          onChange={(e) => {
            setSectionId(e.target.value);
            handleSelectChange('sectionId', e.target.value);
          }}
          style={{
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            backgroundColor: !classId ? '#f1f5f9' : 'white',
            color: !classId ? '#94a3b8' : '#1e293b',
            cursor: !classId ? 'not-allowed' : 'pointer',
            outline: 'none'
          }}
        >
          <option value="">{classId ? 'All Sections' : 'Select Class First'}</option>
          {filteredSections.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div style={{ minWidth: '140px' }}>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            handleSelectChange('status', e.target.value);
          }}
          style={{
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            backgroundColor: 'white',
            color: '#1e293b',
            outline: 'none'
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Reset Button */}
      {(q || classId || sectionId || status || sessionId) && (
        <button
          onClick={() => {
            setQ('');
            setClassId('');
            setSectionId('');
            setStatus('');
            setSessionId('');
            router.push(pathname);
          }}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            color: '#64748b',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <i className="ti ti-rotate" style={{ fontSize: '1rem' }}></i>
          Clear
        </button>
      )}
    </div>
  );
}
