'use client';

import { useState, useEffect } from 'react';
import { createAcademicSession, setCurrentSession, updateAcademicSession, deleteAcademicSession } from '../actions';

type SessionData = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

interface SessionFormProps {
  sessions: SessionData[];
  tenantId: string;
}

export default function SessionForm({ sessions, tenantId }: SessionFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionData | null>(null);

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const defaultName = `${currentYear}-${nextYear}`;

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const result = await createAcademicSession(tenantId, formData);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      form.reset();
    } else {
      alert(result.error || 'Failed to create session');
    }
  }

  async function handleSetCurrent(sessionId: string) {
    setLoading(true);
    await setCurrentSession(tenantId, sessionId);
    setLoading(false);
    window.location.reload();
  }

  async function handleEditSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingSession) return;
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await updateAcademicSession(tenantId, editingSession.id, formData);
    setLoading(false);
    if (result.success) {
      setEditingSession(null);
      window.location.reload();
    } else {
      alert(result.error || 'Failed to update session');
    }
  }

  async function handleDeleteSession(sessionId: string) {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) return;
    setLoading(true);
    await deleteAcademicSession(tenantId, sessionId);
    setLoading(false);
    window.location.reload();
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isSessionActive = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const isSessionUpcoming = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    return start > now;
  };

  const isSessionPast = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    return end < now;
  };

  return (
    <main style={{ flex: 1, padding: '1.5rem' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Academic Sessions</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Manage academic sessions</p>
        </div>
      </header>

      {/* Add Session Form */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Create New Session</h2>

        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span className="material-symbols-rounded">check_circle</span>
            Session created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', marginBottom: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                Session Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                name="name"
                required
                defaultValue={defaultName}
                placeholder="e.g. 2024-2025"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                Start Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={`${currentYear}-04-01`}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                End Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                name="endDate"
                required
                defaultValue={`${nextYear}-03-31`}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: success ? '#22c55e' : '#0f172a',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>add</span>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="isCurrent"
              id="isCurrent"
              defaultChecked
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isCurrent" style={{ fontSize: '0.9rem', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>
              Set as current session
            </label>
          </div>
        </form>
      </div>

      {/* Sessions List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>All Sessions</h2>
        </div>

        {sessions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '3rem', marginBottom: '0.5rem', display: 'block' }}>date_range</span>
            No sessions created yet
          </div>
        ) : (
          <div style={{ padding: '0.5rem' }}>
            {sessions.map((session, index) => {
              const isActive = isSessionActive(session.startDate, session.endDate);
              const isUpcoming = isSessionUpcoming(session.startDate);
              const isPast = isSessionPast(session.endDate);

              let statusColor = '#94a3b8';
              let statusBg = '#f1f5f9';
              let statusText = 'Inactive';

              if (session.isCurrent || isActive) {
                statusColor = '#15803d';
                statusBg = '#dcfce7';
                statusText = 'Current';
              } else if (isUpcoming) {
                statusColor = '#2563eb';
                statusBg = '#dbeafe';
                statusText = 'Upcoming';
              } else if (isPast) {
                statusColor = '#64748b';
                statusBg = '#f1f5f9';
                statusText = 'Ended';
              }

              return (
                <div
                  key={session.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    borderBottom: index < sessions.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {/* Session Number */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: session.isCurrent || isActive
                      ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                      : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem'
                  }}>
                    <span className="material-symbols-rounded" style={{
                      fontSize: '1.2rem',
                      color: session.isCurrent || isActive ? '#fff' : '#64748b'
                    }}>
                      {session.isCurrent || isActive ? 'check_circle' : 'event'}
                    </span>
                  </div>

                  {/* Session Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>
                        {session.name}
                      </span>
                      <span style={{
                        backgroundColor: statusBg,
                        color: statusColor,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {statusText}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '0.9rem' }}>calendar_today</span>
                      {formatDate(session.startDate)} - {formatDate(session.endDate)}
                    </div>
                  </div>

                  {/* Action Button */}
                  {!session.isCurrent && !isActive && (
                    <button
                      onClick={() => handleSetCurrent(session.id)}
                      disabled={loading}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>radio_button_checked</span>
                      Set Current
                    </button>
                  )}
                  <button
                    onClick={() => setEditingSession(session)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginLeft: '0.5rem'
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={loading}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginLeft: '0.5rem'
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>delete</span>
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Edit Session</h2>
            <form onSubmit={handleEditSession}>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                    Session Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    name="name"
                    required
                    defaultValue={editingSession.name}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                    Start Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={editingSession.startDate}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                    End Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    defaultValue={editingSession.endDate}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  name="isCurrent"
                  id="editIsCurrent"
                  defaultChecked={editingSession.isCurrent}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="editIsCurrent" style={{ fontSize: '0.9rem', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>
                  Set as current session
                </label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: '#374151'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    color: 'white'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}