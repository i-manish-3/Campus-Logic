'use client';

import { useState } from 'react';

interface ClassSubject {
  id: string;
  class: {
    id: string;
    name: string;
  };
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  type: string;
  sequence: number | null;
  classSubjects: ClassSubject[];
}

interface SubjectCardProps {
  subject: Subject;
  index: number;
  onEdit?: () => void;
}

export default function SubjectCard({ subject, index, onEdit }: SubjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sequence = subject.sequence || index + 1;
  const isTheory = subject.type === 'THEORY';
  const isPractical = subject.type === 'PRACTICAL';

  const badgeBg = isTheory ? '#fef3c7' : isPractical ? '#dbeafe' : '#f3e8ff';
  const badgeColor = isTheory ? '#d97706' : isPractical ? '#2563eb' : '#9333ea';
  const iconGradient = isTheory
    ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
    : isPractical
      ? 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)'
      : 'linear-gradient(135deg, #f3e8ff 0%, #d8b4fe 100%)';

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: isHovered
          ? '0 4px 12px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)'
          : '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ overflow: 'hidden', borderRadius: '16px' }}>
        {/* Sequence Number Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          backgroundColor: badgeBg,
          color: badgeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '0.75rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          zIndex: 1
        }}>
          {sequence}
        </div>

        {/* Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: iconGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: badgeColor,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '1.4rem' }}>menu_book</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingLeft: '0.5rem' }}>
              <div style={{
                fontWeight: '700',
                color: '#1e293b',
                fontSize: '1rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.3
              }}>
                {subject.name}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginTop: '0.2rem'
              }}>
                <span style={{
                  backgroundColor: badgeBg,
                  color: badgeColor,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: '600'
                }}>
                  {subject.type}
                </span>
                {subject.code && <span>· {subject.code}</span>}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              style={{
                color: '#64748b',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>more_vert</span>
            </button>
          </div>
        </div>

        {/* Action Buttons - 2x2 Grid */}
        <div style={{ padding: '0.6rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
            {['Syllabus', 'Materials', 'Lessons', 'Q. Bank'].map((label) => {
              const icons: Record<string, string> = {
                Syllabus: 'article',
                Materials: 'library_books',
                Lessons: 'auto_stories',
                'Q. Bank': 'quiz'
              };
              return (
                <button
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    padding: '0.55rem 0.4rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>{icons[label]}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Classes */}
        <div style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            fontSize: '0.65rem',
            fontWeight: '600',
            color: '#94a3b8',
            textTransform: 'uppercase',
            marginBottom: '0.4rem',
            letterSpacing: '0.5px'
          }}>
            Assigned Classes
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem'
          }}>
            {subject.classSubjects.length > 0 ? subject.classSubjects.map(cs => (
              <span key={cs.id} style={{
                fontSize: '0.72rem',
                color: '#475569',
                backgroundColor: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>school</span>
                {cs.class.name}
              </span>
            )) : (
              <span style={{
                fontSize: '0.7rem',
                color: '#94a3b8',
                fontStyle: 'italic'
              }}>
                No classes assigned
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}