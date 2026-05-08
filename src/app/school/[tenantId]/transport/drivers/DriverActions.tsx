'use client';

import { useState } from 'react';
import { toggleDriverStatus, deleteTransportDriver } from '../actions';
import ActionModal from '@/components/ActionModal';

export function ToggleDriverStatusButton({ 
  tenantId, 
  driverId, 
  isActive 
}: { 
  tenantId: string; 
  driverId: string; 
  isActive: boolean 
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const res = await toggleDriverStatus(tenantId, driverId, !isActive);
    setLoading(false);
    setShowModal(false);
    if (res.error) alert(res.error);
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className={`btn-icon ${isActive ? 'btn-icon-danger' : 'btn-icon-teal'}`}
        title={isActive ? 'Disable Driver' : 'Enable Driver'}
      >
        <i className={`ti ti-user-${isActive ? 'minus' : 'plus'}`} style={{ fontSize: '1.1rem' }}></i>
      </button>

      <ActionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        loading={loading}
        type={isActive ? 'warning' : 'info'}
        title={isActive ? 'Disable Driver Account?' : 'Enable Driver Account?'}
        message={isActive 
          ? 'The driver will no longer be able to log in to the mobile app or access route data until re-enabled.' 
          : 'The driver will regain access to the mobile app and all assigned transport routes.'}
        confirmText={isActive ? 'Disable Driver' : 'Enable Driver'}
      />
    </>
  );
}

export function DeleteDriverButton({ 
  tenantId, 
  driverId 
}: { 
  tenantId: string; 
  driverId: string; 
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const res = await deleteTransportDriver(tenantId, driverId);
    setLoading(false);
    setShowModal(false);
    if (res.error) alert(res.error);
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="btn-icon btn-icon-danger"
        title="Permanently Delete"
      >
        <i className="ti ti-trash" style={{ fontSize: '1.1rem' }}></i>
      </button>

      <ActionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        loading={loading}
        type="danger"
        title="Permanently Delete Driver?"
        message="This is a permanent action. All driver records and system login credentials will be deleted forever. This cannot be undone."
        confirmText="Confirm Delete"
      />
    </>
  );
}
