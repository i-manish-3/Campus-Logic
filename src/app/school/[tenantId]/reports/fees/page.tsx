import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import FeesReportClient from './FeesReportClient';

export default async function FeesReportPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ tenantId: string }>,
  searchParams: Promise<{ 
    classId?: string; 
    sessionId?: string; 
    from?: string; 
    to?: string;
    search?: string;
    feeHeadId?: string;
    method?: string;
  }>
}) {
  const { tenantId } = await params;
  const filters = await searchParams;

  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant && tenantId !== 'demo-school') notFound();
  const actualTenantId = tenant ? tenant.id : 'mock-tenant-id';

  // Fetch Filters Data
  const sessions = await prisma.academicSession.findMany({ where: { tenantId: actualTenantId } });
  const classes = await prisma.class.findMany({ where: { tenantId: actualTenantId }, orderBy: { order: 'asc' } });
  const heads = await prisma.feeHead.findMany({ where: { tenantId: actualTenantId } });

  // Common Search Logic
  const searchFilter = filters.search ? {
    OR: [
      { user: { firstName: { contains: filters.search } } },
      { user: { lastName: { contains: filters.search } } },
      { admissionNumber: { contains: filters.search } }
    ]
  } : {};

  // Fetch Collection Data (Payments)
  const payments = await prisma.feePayment.findMany({
    where: { 
      tenantId: actualTenantId,
      ...(filters.from && filters.to ? {
        paymentDate: { gte: new Date(filters.from), lte: new Date(filters.to) }
      } : {}),
      ...(filters.method ? { paymentMethod: filters.method } : {}),
      studentFee: {
        ...(filters.feeHeadId ? { installment: { feeStructure: { feeHeadId: filters.feeHeadId } } } : {}),
        student: {
          ...searchFilter,
          ...(filters.classId ? { enrollments: { some: { classId: filters.classId } } } : {}),
        }
      }
    },
    include: {
      studentFee: {
        include: {
          student: { 
            include: { 
              user: true,
              enrollments: { include: { class: true, section: true } }
            } 
          },
          installment: { include: { feeStructure: { include: { feeHead: true } } } }
        }
      }
    },
    orderBy: { paymentDate: 'desc' }
  });

  // Fetch Arrears Data (Pending Fees)
  const pendingFees = await prisma.studentFee.findMany({
    where: {
      tenantId: actualTenantId,
      status: { in: ['PENDING', 'PARTIAL'] },
      ...(filters.feeHeadId ? { installment: { feeStructure: { feeHeadId: filters.feeHeadId } } } : {}),
      student: {
        ...searchFilter,
        ...(filters.classId ? { enrollments: { some: { classId: filters.classId } } } : {}),
      },
      ...(filters.sessionId ? {
        installment: { feeStructure: { sessionId: filters.sessionId } }
      } : {})
    },
    include: {
      student: { include: { user: true, enrollments: { include: { class: true, section: true } } } },
      installment: { include: { feeStructure: { include: { feeHead: true } } } }
    }
  });

  // Fetch Exempted Data (Summary only)
  const exemptedFeesCount = await prisma.studentFee.count({
    where: {
      tenantId: actualTenantId,
      status: 'EXEMPTED',
      ...(filters.classId ? { student: { enrollments: { some: { classId: filters.classId } } } } : {})
    }
  });

  return (
    <main style={{ flex: 1, padding: '2.5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Financial Intelligence</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>Comprehensive revenue analysis and collection audits.</p>
      </header>

      <FeesReportClient 
        tenantId={actualTenantId}
        sessions={sessions}
        classes={classes}
        feeHeads={heads}
        payments={payments}
        pendingFees={pendingFees}
        exemptedTotal={exemptedFeesCount}
        filters={filters}
      />
    </main>
  );
}
