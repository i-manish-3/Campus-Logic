import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RollAssigner from './RollAssigner';

export default async function AssignRollPage({
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
      }
    }
  }) || await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      classes: {
        include: {
          sections: true
        }
      }
    }
  });

  if (!tenant && tenantId !== 'demo-school') {
    notFound();
  }

  const classes = tenant?.classes || [];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Assign Roll Numbers</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Bulk assign roll numbers alphabetically to students in a specific class and section.</p>
      </div>

      <RollAssigner tenantId={tenant?.id || 'demo-school'} classes={classes} />
    </div>
  );
}
