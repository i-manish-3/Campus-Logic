import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProfileSidebar from './ProfileSidebar';

export default async function StudentProfilePage({
  params,
  searchParams
}: {
  params: Promise<{ tenantId: string; studentId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tenantId, studentId } = await params;
  const { tab: activeTab = 'Profile' } = await searchParams;

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      parentProfile: {
        include: {
          user: true,
          students: {
            where: { id: { not: studentId } },
            include: {
              user: true,
              enrollments: { include: { class: true } }
            }
          }
        }
      },
      enrollments: {
        include: { class: true, section: true, session: true },
        orderBy: { session: { startDate: 'desc' } }
      },
      fees: {
        include: {
          installment: {
            include: {
              feeStructure: {
                include: {
                  feeHead: true
                }
              }
            }
          }
        },
        orderBy: {
          installment: { dueDate: 'asc' }
        }
      }
    }
  });

  if (!student) {
    notFound();
  }

  const enrollment = student.enrollments[0];
  const parent = student.parentProfile;
  const siblings = parent?.students || [];
  const fees = student.fees;

  const tabs = ['Profile', 'Siblings', 'Fees', 'Documents'];

  const sidebarItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.9rem'
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '0.75rem 1.25rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: isActive ? '#f97316' : '#64748b',
    borderBottom: isActive ? '3px solid #f97316' : '3px solid transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    backgroundColor: isActive ? '#fff' : 'transparent',
    borderRadius: isActive ? '8px 8px 0 0' : '0'
  });

  const detailRowStyle = {
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f8fafc',
    fontSize: '0.95rem'
  };

  const detailLabelStyle = {
    fontWeight: '700',
    color: '#1e293b'
  };

  const detailValueStyle = {
    color: '#475569'
  };

  const badgeStyle = (color: string) => ({
    backgroundColor: color,
    color: 'white',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700'
  });

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* LEFT SIDEBAR (Now a Client Component) */}
        <ProfileSidebar 
          tenantId={tenantId}
          parent={parent}
          student={student}
          enrollment={enrollment}
          sidebarItemStyle={sidebarItemStyle}
        />

        {/* RIGHT CONTENT AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ height: '5px', backgroundColor: '#f97316' }}></div>
            
            {/* TABS NAVIGATION */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1rem', borderBottom: '1px solid #f1f5f9', overflowX: 'auto', backgroundColor: '#fff' }}>
              {tabs.map(tab => (
                <Link 
                  key={tab} 
                  href={`/school/${tenantId}/students/${studentId}?tab=${tab}`}
                  style={{ ...tabStyle(tab === activeTab), textDecoration: 'none' }}
                >
                  {tab}
                </Link>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
               {/* TAB CONTENT */}
               {activeTab === 'Profile' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Student Basic Info */}
                    <div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Admission No</div>
                        <div><span style={badgeStyle('#0ea5e9')}>{student.admissionNumber}</span></div>
                      </div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Admission Date</div>
                        <div style={detailValueStyle}>{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>
                      </div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Date of Birth</div>
                        <div style={detailValueStyle}>{student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>
                      </div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Category</div>
                        <div style={detailValueStyle}>{student.category || 'GENERAL'}</div>
                      </div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Religion</div>
                        <div style={detailValueStyle}>{student.religion || 'Hindu'}</div>
                      </div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Caste</div>
                        <div style={detailValueStyle}>{student.caste || 'General'}</div>
                      </div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Mother Tongue</div>
                        <div style={detailValueStyle}>{student.motherTongue || 'HINDI'}</div>
                      </div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Blood Group</div>
                        <div style={detailValueStyle}>{student.bloodGroup || 'B-'}</div>
                      </div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>National ID</div>
                        <div style={detailValueStyle}>{student.nationalId || '100000000006'}</div>
                      </div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Student Email</div>
                        <div style={detailValueStyle}>{student.user.email}</div>
                      </div>
                      <div style={{ ...detailRowStyle, borderBottom: 'none' }}>
                        <div style={detailLabelStyle}>Student Phone</div>
                        <div style={detailValueStyle}>{student.studentPhone || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Parent Info Section */}
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: '0 0 1rem 0' }}>Parent & Guardian Details</h3>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Father Name</div>
                        <div style={detailValueStyle}>{student.fatherName || 'N/A'}</div>
                      </div>
                      <div style={detailRowStyle}>
                        <div style={detailLabelStyle}>Father Phone</div>
                        <div style={detailValueStyle}>{parent?.user.contactNumber || 'N/A'}</div>
                      </div>
                      <div style={{ ...detailRowStyle, borderBottom: 'none' }}>
                        <div style={detailLabelStyle}>Mother Name</div>
                        <div style={detailValueStyle}>{student.motherName || 'N/A'}</div>
                      </div>
                    </div>
                 </div>
               )}

               {activeTab === 'Siblings' && (
                 <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem' }}>Student Siblings</h3>
                    {siblings.length === 0 ? (
                      <p style={{ color: '#64748b' }}>No siblings found registered in the school.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {siblings.map((sib) => (
                          <Link key={sib.id} href={`/school/${tenantId}/students/${sib.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}>
                               <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span className="material-symbols-rounded" style={{ color: '#64748b' }}>person</span>
                               </div>
                               <div>
                                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{sib.user.firstName} {sib.user.lastName}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{sib.enrollments[0]?.class.name}</div>
                               </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                 </div>
               )}

               {activeTab === 'Fees' && (
                 <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Student Fee Records</h3>
                      <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        Total Balance: <span style={{ color: '#dc2626', fontWeight: '800' }}>₹{fees.reduce((acc, f) => acc + (f.amountDue - f.amountPaid), 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                          <th style={{ padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem' }}>Fee Head</th>
                          <th style={{ padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem' }}>Due Date</th>
                          <th style={{ padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem' }}>Amount</th>
                          <th style={{ padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem' }}>Paid</th>
                          <th style={{ padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem', textAlign: 'right' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map((fee) => (
                          <tr key={fee.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '1rem 0.5rem' }}>
                               <div style={{ fontWeight: '700', color: '#1e293b' }}>{fee.installment.feeStructure.feeHead.name}</div>
                               <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{fee.installment.name}</div>
                            </td>
                            <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{new Date(fee.installment.dueDate).toLocaleDateString('en-GB')}</td>
                            <td style={{ padding: '1rem 0.5rem', fontWeight: '700' }}>₹{fee.amountDue.toLocaleString()}</td>
                            <td style={{ padding: '1rem 0.5rem', color: '#16a34a' }}>₹{fee.amountPaid.toLocaleString()}</td>
                            <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                               <span style={{ 
                                 fontSize: '0.7rem', 
                                 fontWeight: '800', 
                                 padding: '0.2rem 0.6rem', 
                                 borderRadius: '4px',
                                 backgroundColor: fee.status === 'PAID' ? '#f0fdf4' : fee.status === 'PARTIAL' ? '#fefce8' : '#fef2f2',
                                 color: fee.status === 'PAID' ? '#16a34a' : fee.status === 'PARTIAL' ? '#a16207' : '#dc2626'
                               }}>
                                 {fee.status}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               )}

               {activeTab === 'Documents' && (
                 <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '4rem', color: '#94a3b8', marginBottom: '1rem' }}>folder_open</span>
                    <h3 style={{ color: '#1e293b', fontWeight: '800' }}>No Documents Uploaded</h3>
                    <p style={{ color: '#64748b', maxWidth: '300px', margin: '0.5rem auto 1.5rem' }}>Store admission forms, certificates, and ID proofs for the student.</p>
                    <button style={{ backgroundColor: '#f97316', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Upload Document</button>
                 </div>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
