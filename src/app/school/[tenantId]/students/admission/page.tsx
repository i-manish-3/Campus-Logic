import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AdmissionForm from './AdmissionForm';
import { getSession } from '@/lib/session';
import { hasPermission } from '@/lib/permissions';

export default async function AdmissionPage({
  params
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const session = await getSession();

  if (!session || !(await hasPermission(session.userId, 'manage_admission'))) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', maxWidth: '600px', margin: '4rem auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '3rem', color: '#ef4444' }}>lock</span>
        </div>
        <h2 style={{ color: '#1e293b', fontWeight: '800', marginBottom: '1rem', fontSize: '1.5rem' }}>Access Denied</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
          You do not have the <b>manage_admission</b> permission required to access the student registration wizard.
          Please contact your administrator for access.
        </p>
        <a href={`/school/${tenantId}`} style={{ backgroundColor: '#1e293b', color: 'white', padding: '0.8rem 2rem', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', display: 'inline-block' }}>
          Back to Dashboard
        </a>
      </div>
    );
  }

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

  const allSessions = await prisma.academicSession.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'desc' }
  });

  const routes = await prisma.transportRoute.findMany({
    where: { tenantId: tenant.id }
  });

  return (
    <div style={{ padding: '1rem', width: '100%', margin: '0 auto' }}>
      <AdmissionForm
        tenantId={tenant.id}
        classes={classes}
        routes={routes}
        allSessions={allSessions}
        currentSessionName={currentSession?.name || '2025-26'}
        nextAdmissionNumber={nextAdmissionNumber}
      />
    </div>
  );
}

