import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ClassForm from './ClassForm';

export default async function ClassesPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) ||
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  // Fetch Classes with sections and assigned subjects
  const classes = tenant ? await prisma.class.findMany({
    where: { tenantId: actualTenantId },
    include: {
      sections: true,
      classSubjects: {
        include: { subject: true }
      }
    },
    orderBy: { order: 'asc' }
  }) : [];

  const subjects = tenant ? await prisma.subject.findMany({
    where: { tenantId: actualTenantId },
    include: { classSubjects: true },
    orderBy: { sequence: 'asc' }
  }) : [];

  return <ClassForm subjects={subjects} classes={classes} tenantId={actualTenantId} />;
}