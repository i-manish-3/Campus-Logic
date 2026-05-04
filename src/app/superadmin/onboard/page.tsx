'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTenant } from '../actions';

const PLANS = [
  {
    id: 'BASIC',
    name: 'Basic',
    price: 'Free',
    features: ['Up to 200 Students', 'Fee Management', 'Student Directory', 'Basic Reports'],
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '₹2,999/mo',
    features: ['Up to 2,000 Students', 'All Basic Features', 'Transport Management', 'Exam & Timetable', 'Advanced Analytics'],
    color: '#6366f1',
    bg: '#ede9fe',
    border: '#a5b4fc',
    popular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited Students', 'All Pro Features', 'Custom Domain', 'Priority Support', 'API Access', 'Custom Integrations'],
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fcd34d',
  },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  fontSize: '0.95rem',
  backgroundColor: 'white',
  outline: 'none',
  color: '#0f172a',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#334155',
};

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ domain: string; tenantId: string; adminEmail?: string; adminPassword?: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('PRO');

  const [form, setForm] = useState({
    name: '',
    domain: '',
    email: '',
    phone: '',
    logoUrl: '',
    address: '',
    receiptPrefix: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const autoSlug = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNext = () => {
    if (step === 1) {
      if (!form.name.trim()) { setError('School name is required.'); return; }
      if (!form.domain.trim()) { setError('Domain slug is required.'); return; }
      if (!form.adminEmail.trim()) { setError('Admin login email is required.'); return; }
      if (!form.adminPassword.trim() || form.adminPassword.length < 6) { setError('Admin password must be at least 6 characters.'); return; }
    }
    setError('');
    setStep(s => s + 1);
  };

  async function handleSubmit() {
    setLoading(true);
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const res = await createTenant(fd);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setSuccess({ 
      domain: (res as any).domain, 
      tenantId: (res as any).tenantId,
      adminEmail: (res as any).adminEmail,
      adminPassword: (res as any).adminPassword
    });
  }

  const TOTAL_STEPS = 3;

  if (success) {
    return (
      <main style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 20px 40px rgba(16,185,129,0.25)',
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '3rem', color: 'white' }}>check_circle</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.75rem' }}>School Onboarded!</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
            <strong>{form.name}</strong> has been successfully registered on Campus-Logic.<br />
            Portal URL: <code style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>campus-logic.in/school/{success.domain}</code>
          </p>
          
          {success.adminEmail && success.adminPassword && (
            <div style={{
              backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
              padding: '1.5rem', marginBottom: '2rem', textAlign: 'left'
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#0f172a' }}>Admin Credentials</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Email:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{success.adminEmail}</span>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Password:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{success.adminPassword}</span>
              </div>
              <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: '#ef4444', fontWeight: '600' }}>
                Please save these credentials securely. They will not be shown again.
              </p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a
              href={`/school/${success.tenantId}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', padding: '0.85rem 1.75rem', borderRadius: '12px',
                textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>open_in_new</span>
              Open School Portal
            </a>
            <button
              onClick={() => router.push('/superadmin/schools')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                color: '#334155', padding: '0.85rem 1.75rem', borderRadius: '12px',
                fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>list</span>
              View All Schools
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2.5rem', maxWidth: '780px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Onboard New School</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>Register a new school tenant on the Campus-Logic platform.</p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2.5rem' }}>
        {['School Details', 'Select Plan', 'Branding & Finish'].map((label, i) => {
          const stepNum = i + 1;
          const done = step > stepNum;
          const active = step === stepNum;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '0.85rem',
                  background: done ? '#10b981' : active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9',
                  color: done || active ? 'white' : '#94a3b8',
                  boxShadow: active ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
                  flexShrink: 0,
                }}>
                  {done ? <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>check</span> : stepNum}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '600', color: active ? '#6366f1' : done ? '#10b981' : '#94a3b8', marginTop: '0.4rem', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div style={{ flex: 1, height: '2px', backgroundColor: done ? '#10b981' : '#e2e8f0', margin: '0 0.5rem', marginBottom: '1.2rem' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        padding: '2.5rem',
      }}>
        {error && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fee2e2',
            borderRadius: '12px', padding: '1rem 1.25rem',
            color: '#dc2626', fontSize: '0.9rem', fontWeight: '600',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>error</span>
            {error}
          </div>
        )}

        {/* Step 1: School Details */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem' }}>School Information</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 2rem' }}>Enter the school's basic details.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>School Name *</label>
                <input
                  style={inputStyle} value={form.name} placeholder="e.g., St. Mary's Public School"
                  onChange={e => {
                    setForm(prev => ({
                      ...prev, name: e.target.value,
                      domain: prev.domain || autoSlug(e.target.value),
                    }));
                  }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Domain Slug * <span style={{ color: '#94a3b8', fontWeight: '400' }}>(used in the URL)</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <span style={{
                    padding: '0.75rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRight: 'none', borderRadius: '10px 0 0 10px', fontSize: '0.875rem', color: '#64748b', fontWeight: '600',
                    whiteSpace: 'nowrap',
                  }}>campus-logic.in/school/</span>
                  <input
                    style={{ ...inputStyle, borderRadius: '0 10px 10px 0', flex: 1 }}
                    value={form.domain}
                    placeholder="st-marys-school"
                    onChange={e => setForm(prev => ({ ...prev, domain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Contact Email</label>
                <input type="email" style={inputStyle} value={form.email} placeholder="principal@school.edu.in" onChange={update('email')} />
              </div>
              <div>
                <label style={labelStyle}>Contact Phone</label>
                <input type="tel" style={inputStyle} value={form.phone} placeholder="+91 98765 43210" onChange={update('phone')} />
              </div>
              <div>
                <label style={labelStyle}>Receipt Prefix</label>
                <input style={inputStyle} value={form.receiptPrefix} placeholder="RCPT (auto-generated if blank)" onChange={update('receiptPrefix')} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Full Address</label>
                <input style={inputStyle} value={form.address} placeholder="123, School Lane, Andheri West" onChange={update('address')} />
              </div>
              
              <div style={{ gridColumn: 'span 2', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem' }}>Admin Account</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Admin Name</label>
                    <input style={inputStyle} value={form.adminName} placeholder="John Doe" onChange={update('adminName')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Admin Login Email *</label>
                    <input type="email" style={inputStyle} value={form.adminEmail} placeholder="admin@school.com" onChange={update('adminEmail')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Admin Password *</label>
                    <input type="text" style={inputStyle} value={form.adminPassword} placeholder="Secure password" onChange={update('adminPassword')} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Plan */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem' }}>Select Plan</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 2rem' }}>Choose the subscription tier for this school.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{
                    flex: 1, borderRadius: '16px', padding: '1.5rem',
                    border: `2px solid ${selectedPlan === plan.id ? plan.border : '#e2e8f0'}`,
                    backgroundColor: selectedPlan === plan.id ? plan.bg : 'white',
                    cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                    boxShadow: selectedPlan === plan.id ? `0 4px 16px ${plan.color}20` : 'none',
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white', fontSize: '0.65rem', fontWeight: '800',
                      padding: '0.25rem 0.75rem', borderRadius: '99px', whiteSpace: 'nowrap',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>Most Popular</div>
                  )}
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: plan.color, marginBottom: '0.25rem' }}>{plan.name}</div>
                  <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem' }}>{plan.price}</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '1rem', color: plan.color }}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {selectedPlan === plan.id && (
                    <div style={{
                      position: 'absolute', top: '1rem', right: '1rem',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${plan.color}, ${plan.border})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '0.85rem', color: 'white' }}>check</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Branding */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem' }}>Branding & Confirmation</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 2rem' }}>Optional branding, then review and submit.</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>School Logo URL <span style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</span></label>
              <input type="url" style={inputStyle} value={form.logoUrl} placeholder="https://example.com/logo.png" onChange={update('logoUrl')} />
            </div>

            {/* Summary Card */}
            <div style={{
              backgroundColor: '#f8fafc', borderRadius: '16px', padding: '1.5rem',
              border: '1px solid #e2e8f0', marginTop: '1rem',
            }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'School Name', value: form.name },
                  { label: 'Domain', value: `campus-logic.in/school/${form.domain}` },
                  { label: 'Contact Email', value: form.email || '—' },
                  { label: 'Contact Phone', value: form.phone || '—' },
                  { label: 'Address', value: form.address || '—' },
                  { label: 'Receipt Prefix', value: form.receiptPrefix || 'RCPT' },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{row.label}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', wordBreak: 'break-all' }}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
          {step > 1 ? (
            <button
              onClick={() => { setError(''); setStep(s => s - 1); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem', borderRadius: '12px',
                border: '1px solid #e2e8f0', backgroundColor: 'white',
                color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>arrow_back</span>
              Back
            </button>
          ) : <div />}

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.75rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontWeight: '700', cursor: 'pointer', border: 'none',
                fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}
            >
              Continue
              <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.75rem', borderRadius: '12px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', fontWeight: '700', cursor: loading ? 'wait' : 'pointer',
                border: 'none', fontSize: '0.9rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(16,185,129,0.3)',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>
                {loading ? 'hourglass_empty' : 'check'}
              </span>
              {loading ? 'Creating School…' : 'Create School'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
