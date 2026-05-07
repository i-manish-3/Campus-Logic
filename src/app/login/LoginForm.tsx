'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loginAction } from './actions';

const ERROR_MESSAGES: Record<string, string> = {
  wrong_school: 'You are not authorized to access that school. Please log in with the correct account.',
};

export default function LoginForm({ 
  tenantName, 
  tenantLogo 
}: { 
  tenantName?: string | null, 
  tenantLogo?: string | null 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(urlError ? ERROR_MESSAGES[urlError] || urlError : '');

  useEffect(() => {
    if (urlError) setError(ERROR_MESSAGES[urlError] || urlError);
  }, [urlError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData();
    fd.append('email', email);
    fd.append('password', password);

    const res = await loginAction(fd);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.success && res.redirectUrl) {
      const nextUrl = searchParams.get('next');
      router.push(nextUrl || res.redirectUrl);
      router.refresh();
    }
  }

  const displayBranding = tenantName || 'My Digital Academy';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#050a15',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Left decorative panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow orbs */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          top: '20%', left: '10%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          bottom: '20%', right: '10%', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: '420px' }}>
          {/* Logo */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 20px 40px rgba(99,102,241,0.35)',
          }}>
            {tenantLogo ? (
              <img src={tenantLogo} style={{ width: '48px', height: '48px', objectFit: 'contain' }} alt="Logo" />
            ) : (
              <span className="material-symbols-rounded" style={{ fontSize: '2.5rem', color: 'white' }}>rocket_launch</span>
            )}
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', margin: '0 0 1rem', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {displayBranding}
          </h1>
          <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
            {tenantName 
              ? `Official management portal for ${tenantName}. Access your academic and administrative dashboard.`
              : 'The complete school management platform. Manage students, fees, exams, transport, and more — all in one place.'
            }
          </p>

          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: 'group', text: 'Student & Fee Management' },
              { icon: 'payments', text: 'Billing & Receipt Generation' },
              { icon: 'assessment', text: 'Analytics & Reports' },
            ].map(item => (
              <div key={item.icon} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '0.85rem 1.25rem',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '1.3rem', color: '#818cf8' }}>{item.icon}</span>
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div style={{
        width: '480px',
        minWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        backgroundColor: '#f8fafc',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Sign in to your {tenantName || 'school admin'} account.
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              backgroundColor: '#fef2f2', border: '1px solid #fee2e2',
              borderRadius: '12px', padding: '0.9rem 1rem',
              marginBottom: '1.5rem',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '1.1rem', color: '#dc2626', flexShrink: 0, marginTop: '1px' }}>error</span>
              <p style={{ margin: 0, color: '#dc2626', fontSize: '0.875rem', fontWeight: '500', lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-rounded" style={{
                  position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '1.1rem', color: '#94a3b8', pointerEvents: 'none',
                }}>mail</span>
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@school.edu.in"
                  style={{
                    width: '100%', padding: '0.8rem 1rem 0.8rem 2.75rem',
                    borderRadius: '12px', border: '1.5px solid #e2e8f0',
                    fontSize: '0.95rem', color: '#0f172a', backgroundColor: 'white',
                    outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-rounded" style={{
                  position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '1.1rem', color: '#94a3b8', pointerEvents: 'none',
                }}>lock</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '0.8rem 3rem 0.8rem 2.75rem',
                    borderRadius: '12px', border: '1.5px solid #e2e8f0',
                    fontSize: '0.95rem', color: '#0f172a', backgroundColor: 'white',
                    outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: '#94a3b8', display: 'flex', alignItems: 'center',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.9rem',
                borderRadius: '12px', border: 'none',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontWeight: '700', fontSize: '1rem',
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '0.5rem',
              }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-rounded" style={{ fontSize: '1.1rem', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                  Signing in…
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Don't have credentials? Contact your{' '}
              <span style={{ color: '#6366f1', fontWeight: '600' }}>{tenantName || 'My Digital Academy'} administrator</span>.
            </p>
          </div>

          <div style={{
            marginTop: '2.5rem', padding: '1rem', borderRadius: '12px',
            backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
          }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>shield</span>
              Your session is secured with HMAC-SHA256 encryption.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
      `}</style>
    </div>
  );
}
