import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AdmissionForm from './AdmissionForm';

export default async function AdmissionPage({
  params
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { domain: tenantId },
    include: {
      classes: {
        include: {
          sections: true
        }
      },
      academicSessions: {
        where: { isCurrent: true }
      }
    }
  }) || await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      classes: {
        include: {
          sections: true
        }
      },
      academicSessions: {
        where: { isCurrent: true }
      }
    }
  });

  if (!tenant) {
    notFound();
  }

  const classes = tenant.classes || [];
  const currentSession = tenant.academicSessions[0];

  if (!currentSession && tenantId !== 'demo-school') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '4rem auto', fontFamily: "'Inter', sans-serif" }}>
        <span className="material-symbols-rounded" style={{ fontSize: '4rem', color: '#f97316', marginBottom: '1.5rem' }}>event_busy</span>
        <h2 style={{ color: '#1e293b', fontWeight: '800', marginBottom: '1rem' }}>No Active Session</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>You cannot admit students until an academic session is created and set to <b>Current</b>.</p>
        <a href={`/school/${tenantId}/academic`} style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.75rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', display: 'inline-block' }}>
          Go to Academic Setup
        </a>
      </div>
    );
  }

  // Fetch latest admission number for the tenant
  const latestStudent = await prisma.studentProfile.findFirst({
    where: { tenantId: tenant.id },
    orderBy: { admissionNumber: 'desc' },
    select: { admissionNumber: true }
  });

  let nextAdmissionNumber = "100";
  if (latestStudent?.admissionNumber) {
    const lastNum = parseInt(latestStudent.admissionNumber);
    if (!isNaN(lastNum)) {
      nextAdmissionNumber = (lastNum + 1).toString();
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Student Admission</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Create a new student profile for the current academic session.</p>
      </div>

      <AdmissionForm
        tenantId={tenant.id}
        classes={classes}
        currentSessionId={currentSession?.id}
        nextAdmissionNumber={nextAdmissionNumber}
      />
    </div>
  );
}
