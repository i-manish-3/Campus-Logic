import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function FormsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  return (
    <main style={{ flex: 1, padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#111827' }}>Form Builder (EAV)</h1>
        <button style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Create Custom Form
        </button>
      </header>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No hardcoded forms here! Admins can create dynamic Admission, Inquiry, and Leave Request forms with custom fields (JSONB/EAV schema).</p>
        <div style={{ border: '2px dashed #d1d5db', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }}>
          <p style={{ fontWeight: 'bold', color: '#111827' }}>Schema Preview</p>
          <pre style={{ textAlign: 'left', background: '#f9fafb', padding: '1rem', overflowX: 'auto', fontSize: '0.85rem' }}>
{`{
  "formName": "Inquiry Form 2025",
  "fields": [
    { "type": "text", "label": "Parent Name", "required": true },
    { "type": "select", "label": "Interested Class", "options": ["Class 1", "Class 2"] }
  ]
}`}
          </pre>
        </div>
      </div>
    </main>
  );
}
