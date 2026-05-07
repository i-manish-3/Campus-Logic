'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#030712',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Background Gradients */}
      <div className="bg-glow" style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(3,7,18,0) 70%)',
        filter: 'blur(60px)', zIndex: 0, animationDelay: '0s'
      }} />
      <div className="bg-glow" style={{
        position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(3,7,18,0) 70%)',
        filter: 'blur(80px)', zIndex: 0, animationDelay: '2s'
      }} />
      
      {/* Grid Pattern Overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px', maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
      }} />

      {/* Navbar (Minimal) */}
      <nav style={{ width: '100%', maxWidth: '1200px', padding: '2rem', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.05em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '1.3rem', color: 'white' }}>school</span>
          </div>
          My Digital Academy
        </div>
        <Link href="/login" className="nav-btn" style={{
          padding: '0.6rem 1.5rem', borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', fontWeight: '600',
          backdropFilter: 'blur(10px)', transition: 'all 0.2s', fontSize: '0.9rem'
        }}>
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: '100%', maxWidth: '1200px', padding: '4rem 2rem 6rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '5rem', animation: 'float 6s ease-in-out infinite' }}>
          <div style={{ 
            display: 'inline-block', padding: '0.5rem 1.25rem', borderRadius: '99px', backgroundColor: 'rgba(99,102,241,0.1)', 
            border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem',
            letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 0 20px rgba(99,102,241,0.2)'
          }}>
            Multi-Tenant Educational ERP
          </div>
          <h1 style={{ 
            fontSize: 'clamp(3.5rem, 7vw, 5.5rem)', fontWeight: '900', lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem',
            background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            The Operating System <br/>for Modern Schools
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto' }}>
            A fully dynamic, scalable, and beautifully designed platform. Manage academics, collect fees instantly, and onboard students with unprecedented ease.
          </p>
        </div>

        {/* Portals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', width: '100%', maxWidth: '900px', marginBottom: '6rem' }}>
          
          {/* School Portal Card */}
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <div className="portal-card" style={{
              background: 'linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8))',
              borderRadius: '24px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer', height: '100%',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '2rem' }}>admin_panel_settings</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>School Admin Portal</h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '1rem', margin: 0 }}>
                Manage your specific institution. Handle academics, automate fee collection, schedule exams, and manage student profiles dynamically.
              </p>
              <div style={{ marginTop: '2rem', color: '#818cf8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                Access Portal <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Super Admin Card */}
          <Link href="/superadmin" style={{ textDecoration: 'none' }}>
            <div className="portal-card" style={{
              background: 'linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8))',
              borderRadius: '24px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer', height: '100%',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(168,85,247,0.1)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '2rem' }}>corporate_fare</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Super Admin Portal</h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '1rem', margin: 0 }}>
                Global platform control. Onboard new schools, monitor multi-tenant revenue, and manage system-wide settings and subscriptions.
              </p>
              <div style={{ marginTop: '2rem', color: '#c084fc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                Platform Control <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>arrow_forward</span>
              </div>
            </div>
          </Link>
          
        </div>

        {/* Features Section */}
        <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { title: 'Automated Billing', desc: 'Custom fee structures, due dates, and instant digital receipts.', icon: 'receipt_long' },
            { title: 'Multi-Tenant Auth', desc: 'Secure, isolated environments for every school with custom domains.', icon: 'shield_lock' },
            { title: 'Smart Academics', desc: 'Class sections, subjects mapping, and student enrollments.', icon: 'auto_stories' }
          ].map(feature => (
            <div key={feature.title} style={{
              background: 'rgba(15,23,42,0.4)', borderRadius: '16px', padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', alignItems: 'flex-start'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px', color: '#94a3b8' }}>
                <span className="material-symbols-rounded">{feature.icon}</span>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: '700' }}>{feature.title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ padding: '2rem', textAlign: 'center', color: '#475569', fontSize: '0.85rem', zIndex: 10 }}>
        © {new Date().getFullYear()} My Digital Academy Platform. Built for excellence.
      </footer>

      <style jsx global>{`
        .bg-glow {
          animation: pulseGlow 8s infinite alternate;
        }
        @keyframes pulseGlow {
          0% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .nav-btn:hover {
          background-color: rgba(255,255,255,0.1) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
        .portal-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255,255,255,0.15) !important;
          background: linear-gradient(145deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9)) !important;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5), 0 0 30px 0 rgba(99,102,241,0.15);
        }
        .portal-card:hover span.material-symbols-rounded:last-child {
          transform: translateX(5px);
        }
        .portal-card span.material-symbols-rounded:last-child {
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
}
