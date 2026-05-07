'use client';

import { resetParentPassword } from '../actions';
import { useRouter } from 'next/navigation';

interface ProfileSidebarProps {
  tenantId: string;
  parent: any;
  student: any;
  enrollment: any;
  sidebarItemStyle: any;
}

export default function ProfileSidebar({
  tenantId,
  parent,
  student,
  enrollment,
  sidebarItemStyle
}: ProfileSidebarProps) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ height: '5px', backgroundColor: '#f97316' }}></div>
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #f1f5f9', margin: '0 auto 1rem', overflow: 'hidden' }}>
            <img 
              src={student.photo || `https://ui-avatars.com/api/?name=${student.user.firstName}+${student.user.lastName}&background=f1f5f9&color=64748b&size=200`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              alt="Profile" 
            />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>{student.user.firstName} {student.user.lastName}</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 1.5rem' }}>{enrollment?.class.name} ({enrollment?.section?.name || 'A'})</p>
          
          <div style={{ textAlign: 'left' }}>
            <div style={sidebarItemStyle}>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>Admission No</span>
              <span style={{ color: '#f97316', fontWeight: '700' }}>{student.admissionNumber}</span>
            </div>
            <div style={sidebarItemStyle}>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>Roll Number</span>
              <span style={{ color: '#f97316', fontWeight: '700' }}>{student.rollNumber || '6'}</span>
            </div>
            <div style={sidebarItemStyle}>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>Gender</span>
              <span style={{ color: '#f97316', fontWeight: '700' }}>{student.gender === 'M' ? 'Male' : 'Female'}</span>
            </div>
            <div style={sidebarItemStyle}>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>House</span>
              <span style={{ color: '#f97316', fontWeight: '700' }}>{student.house || 'N/A'}</span>
            </div>
            <div style={{ ...sidebarItemStyle, borderBottom: 'none' }}>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>Status</span>
              <span style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>Active</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
            <button style={{ backgroundColor: '#f97316', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
              Edit Profile
            </button>
            
            <button 
              onClick={() => window.print()}
              style={{ backgroundColor: 'white', color: '#1e293b', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>print</span> Print Profile
            </button>

            {parent && (
              <button 
                onClick={async () => {
                  if (confirm('Reset parent password to "parent123"?')) {
                    const res = await resetParentPassword(tenantId, parent.id);
                    if (res.success) alert('Password Reset Successfully');
                  }
                }}
                style={{ width: '100%', backgroundColor: 'white', color: '#db2777', border: '1px solid #db2777', padding: '0.75rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>history</span> Reset Parent Password
              </button>
            )}

            <button 
              onClick={() => alert('Feature coming soon!')}
              style={{ backgroundColor: '#06b6d4', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
               <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>mail</span> Send Parent Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
