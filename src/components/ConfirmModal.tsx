'use client';

import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return 'report';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'danger': return '#dc2626';
      case 'warning': return '#f59e0b';
      default: return '#0d9488';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'danger': return '#fef2f2';
      case 'warning': return '#fffbeb';
      default: return '#f0fdfa';
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'rgba(15, 23, 42, 0.4)', 
      backdropFilter: 'blur(4px)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 10000, 
      padding: '1rem' 
    }}>
      <div className="form-card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        position: 'relative',
        animation: 'modalSlideIn 0.2s ease-out',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <style jsx>{`
          @keyframes modalSlideIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          backgroundColor: getBgColor(), 
          color: getColor(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>{getIcon()}</span>
        </div>

        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '800', color: 'var(--gray-800)' }}>{title}</h3>
        <p style={{ margin: '0 0 2rem', fontSize: '0.9rem', color: 'var(--gray-500)', lineHeight: '1.5' }}>{message}</p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onCancel} 
            className="btn btn-outline" 
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm} 
            className="btn" 
            style={{ 
              flex: 1, 
              justifyContent: 'center',
              backgroundColor: getColor(),
              color: 'white'
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="material-symbols-rounded" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>sync</span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
