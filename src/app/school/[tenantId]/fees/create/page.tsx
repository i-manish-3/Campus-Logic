import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import FeeStructureForm from './FeeStructureForm';

export default async function CreateFeeStructurePage({
  params
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      classes: true,
      academicSessions: {
        where: { isCurrent: true }
      },
      feeHeads: true,
      transportRoutes: true,
    }
  }) || await prisma.tenant.findUnique({
    where: { domain: tenantId },
    include: {
      classes: true,
      academicSessions: {
        where: { isCurrent: true }
      },
      feeHeads: true,
      transportRoutes: true,
    }
  });

  if (!tenant) notFound();

  const currentSession = tenant.academicSessions[0];
  if (!currentSession) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No Active Session</h2>
        <p>Please create an academic session first.</p>
      </div>
    );
  }

  return (
    <div className="admission-wizard">
      <FeeStructureForm 
        tenantId={tenant.id}
        feeHeads={tenant.feeHeads}
        classes={tenant.classes}
        currentSession={currentSession}
      />
    </div>
  );
}
