import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SectionForm from './SectionForm';

export default async function SectionsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) ||
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  // Fetch all classes
  const classes = tenant ? await prisma.class.findMany({
    where: { tenantId: actualTenantId },
    orderBy: { order: 'asc' }
  }) : [];

  // Fetch all sections with class info
  const sections = tenant ? await prisma.section.findMany({
    where: { tenantId: actualTenantId },
    include: { class: true },
    orderBy: { name: 'asc' }
  }) : [];

  // Serialize for client
  const serializedClasses = classes.map(c => ({
    id: c.id,
    name: c.name,
  }));

  const serializedSections = sections.map(s => ({
    id: s.id,
    name: s.name,
    classId: s.classId,
    className: s.class.name,
  }));

  return <SectionForm classes={serializedClasses} sections={serializedSections} tenantId={actualTenantId} />;
}