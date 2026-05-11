import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SubjectCardList from './SubjectCardList';

export default async function SubjectsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) ||
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  const subjects = tenant ? await prisma.subject.findMany({
    where: { tenantId: actualTenantId },
    include: { classSubjects: { include: { class: true } } },
    orderBy: { sequence: 'asc' }
  }) : [];

  return <SubjectCardList subjects={subjects} tenantId={actualTenantId} />;
}