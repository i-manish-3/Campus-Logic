'use client';

import { useState } from 'react';
import { deleteTransportRoute } from './actions';
import ActionModal from '@/components/ActionModal';

export function DeleteRouteButton({ 
  tenantId, 
  routeId 
}: { 
  tenantId: string; 
  routeId: string; 
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const res = await deleteTransportRoute(tenantId, routeId);
    setLoading(false);
    setShowModal(false);
    if (res.error) alert(res.error);
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="btn-icon btn-icon-danger"
        title="Delete Route"
      >
        <i className="ti ti-trash" style={{ fontSize: '1.1rem' }}></i>
      </button>

      <ActionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        loading={loading}
        type="danger"
        title="Permanently Delete Route?"
        message="This will delete the transport route and its associated fee structure. If students are currently assigned to this route, deletion may fail."
        confirmText="Confirm Delete"
      />
    </>
  );
}
