'use client';

import { useRouter, useParams } from 'next/navigation';

export default function PlaceholderPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.tenantId as string;

  return (
    <main style={{ flex: 1, padding: '1.5rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Staff Attendance</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Mark and manage staff attendance</p>
        </header>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#64748b',
            border: '2px dashed #e2e8f0',
            borderRadius: '12px'
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>construction</span>
            <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Under Development</p>
            <p style={{ fontSize: '0.9rem' }}>This page will be updated soon.</p>
          </div>
        </div>
      </div>
    </main>
  );
}