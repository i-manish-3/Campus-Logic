import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StudentFeeClient from './StudentFeeClient';

export default async function StudentFeesPage({ 
  params 
}: { 
  params: Promise<{ tenantId: string, studentId: string }> 
}) {
  const { tenantId, studentId } = await params;
  
  let tenant = await prisma.tenant.findUnique({ where: { domain: tenantId } }) || 
               await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant) notFound();
  
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId, tenantId: tenant.id },
    include: { user: true, enrollments: { include: { class: true } } }
  });

  if (!student) notFound();

  const fees = await prisma.studentFee.findMany({
    where: { studentId, tenantId: tenant.id },
    include: { 
      installment: { 
        include: { 
          feeStructure: { 
            include: { feeHead: true } 
          } 
        } 
      } 
    },
    orderBy: { installment: { dueDate: 'asc' } }
  });

  const payments = await prisma.feePayment.findMany({
    where: { studentFee: { studentId }, tenantId: tenant.id },
    include: {
      studentFee: {
        include: {
          installment: {
            include: { feeStructure: { include: { feeHead: true } } }
          }
        }
      }
    },
    orderBy: { paymentDate: 'desc' }
  });

  const totalDue = fees.reduce((sum, f) => sum + f.amountDue, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.amountPaid, 0);
  const balance = totalDue - totalPaid;

  return (
    <main style={{ flex: 1, padding: '1.5rem' }}>
      <header style={{ 
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: '600' }}>
          <Link href={`/school/${tenantId}/students`} style={{ color: '#3b82f6', textDecoration: 'none' }}>Students</Link>
          <span className="material-symbols-rounded" style={{ fontSize: '0.9rem' }}>chevron_right</span>
          <span>Fee Ledger</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link 
              href={`/school/${tenantId}/fees/collect`}
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#64748b',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="material-symbols-rounded">arrow_back</span>
            </Link>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
                {student.user.firstName} {student.user.lastName} 
              </h1>
              <p style={{ margin: '0.35rem 0 0 0', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: '500' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>badge</span>
                  Adm: {student.admissionNumber}
                </span>
                <span style={{ color: '#e2e8f0' }}>|</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>school</span>
                  Class: {student.enrollments[0]?.class.name || 'N/A'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Financial Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Total Fee Amount</div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>₹{totalDue.toLocaleString()}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#059669', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Total Amount Paid</div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#059669' }}>₹{totalPaid.toLocaleString()}</p>
        </div>
        <div style={{ 
          backgroundColor: balance > 0 ? '#fff1f2' : '#f0fdf4', 
          padding: '1.25rem', 
          borderRadius: '16px', 
          border: `1px solid ${balance > 0 ? '#fecaca' : '#bbf7d0'}` 
        }}>
          <div style={{ color: balance > 0 ? '#be123c' : '#15803d', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Remaining Balance</div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: balance > 0 ? '#be123c' : '#15803d' }}>₹{balance.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9', padding: '1rem' }}>
        <StudentFeeClient tenantId={tenant.id} studentId={studentId} student={student} tenant={tenant} fees={fees} payments={payments} />
      </div>
    </main>
  );
}
