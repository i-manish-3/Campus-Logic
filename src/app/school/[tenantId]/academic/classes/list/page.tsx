import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ClassListClient from './ClassListClient';

export default async function ClassListPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) ||
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();

  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  // Fetch all classes with sections, subjects, and teacher
  const rawClasses = tenant ? await prisma.class.findMany({
    where: { tenantId: actualTenantId },
    include: {
      sections: true,
      classSubjects: {
        include: { subject: true }
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: { order: 'asc' }
  }) : [];

  // Map to include teacherId
  const classes = rawClasses.map((c: any) => ({
    id: c.id,
    name: c.name,
    order: c.order,
    teacherId: c.teacherId,
    teacher: c.teacher,
    sections: c.sections,
    classSubjects: c.classSubjects
  }));

  // Fetch all teachers
  const teachers = tenant ? await prisma.user.findMany({
    where: {
      tenantId: actualTenantId,
      role: {
        name: {
          in: ['Teacher', 'School Admin', 'Admin']
        }
      }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    }
  }) : [];

  return <ClassListClient classes={classes} teachers={teachers} tenantId={actualTenantId} />;
}