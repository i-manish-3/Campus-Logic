'use client';

import React from 'react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  type: 'danger' | 'warning' | 'info';
  loading: boolean;
}

export default function ActionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  type,
  loading 
}: ActionModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <i className="ti ti-alert-triangle" style={{ fontSize: '2rem', color: '#be123c' }}></i>;
      case 'warning': return <i className="ti ti-alert-circle" style={{ fontSize: '2rem', color: '#f59e0b' }}></i>;
      case 'info': return <i className="ti ti-info-circle" style={{ fontSize: '2rem', color: '#0d9488' }}></i>;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger': return '#be123c';
      case 'warning': return '#f59e0b';
      case 'info': return '#0d9488';
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: `${getButtonColor()}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          {getIcon()}
        </div>
        
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{title}</h3>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={onClose}
            disabled={loading}
            style={{ 
              flex: 1, 
              backgroundColor: '#f1f5f9', 
              color: '#475569', 
              padding: '0.85rem', 
              border: 'none', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontWeight: '700',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            style={{ 
              flex: 1, 
              background: type === 'danger' ? 'linear-gradient(135deg, #be123c, #9d174d)' : 
                         type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                         'linear-gradient(135deg, #0d9488, #0891b2)', 
              color: 'white', 
              padding: '0.85rem', 
              border: 'none', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontWeight: '700',
              fontSize: '0.9rem',
              boxShadow: `0 4px 12px ${getButtonColor()}40`,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
