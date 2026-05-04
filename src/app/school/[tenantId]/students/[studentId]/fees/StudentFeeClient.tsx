'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { collectBulkPayment } from '../../actions';

type FeeItem = {
  id: string;
  installment: {
    name: string;
    dueDate: Date;
    feeStructure: { 
      feeHead: { name: string },
      transportRouteId?: string | null,
      isAdmissionFee?: boolean 
    };
  };
  amountDue: number;
  amountPaid: number;
  status: string;
};

type PaymentRecord = {
  id: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  receiptId: string | null;
  remarks: string | null;
  studentFee: {
    installment: {
      name: string;
      feeStructure: {
        transportRouteId: string | null;
        isAdmissionFee: boolean;
      };
    };
  };
};

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

export default function StudentFeeClient({
  tenantId,
  studentId,
  student,
  tenant,
  fees,
  payments,
}: {
  tenantId: string;
  studentId: string;
  student: any;
  tenant: any;
  fees: FeeItem[];
  payments: PaymentRecord[];
}) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());
  const [selectedTransportMonths, setSelectedTransportMonths] = useState<Set<string>>(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [method, setMethod] = useState('CASH');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<{
    schoolAmount: number;
    transportAmount: number;
    admissionAmount: number;
    schoolMonths: string[];
    transportMonths: string[];
    total: number;
    receiptId: string;
    date: string;
    method: string;
    remarks?: string;
  } | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial Pre-selection Logic
  useState(() => {
    const today = new Date();
    const currentMonthIdx = today.getMonth();
    const academicOrder = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2];
    const currentAcademicIdx = academicOrder.indexOf(currentMonthIdx);

    const initialS = new Set<string>();
    const initialT = new Set<string>();

    MONTHS.forEach((m, idx) => {
      if (idx <= currentAcademicIdx) {
        const sList = fees.filter(f => {
          const date = new Date(f.installment.dueDate);
          return date.toLocaleString('default', { month: 'short' }) === m && 
                 !f.installment.feeStructure.transportRouteId && 
                 !f.installment.feeStructure.isAdmissionFee;
        });
        // ONLY select if there are pending fees AND total due is > 0
        const sDue = sList.reduce((sum, f) => sum + (f.amountDue - f.amountPaid), 0);
        if (sList.length > 0 && sDue > 0) initialS.add(m);

        const tList = fees.filter(f => {
          const date = new Date(f.installment.dueDate);
          return date.toLocaleString('default', { month: 'short' }) === m && 
                 !!f.installment.feeStructure.transportRouteId;
        });
        const tDue = tList.reduce((sum, f) => sum + (f.amountDue - f.amountPaid), 0);
        if (tList.length > 0 && tDue > 0) initialT.add(m);

        // Admission Fee is ALWAYS pre-selected if pending
        const hasPendingAdmission = fees.some(f => f.installment.feeStructure.isAdmissionFee && f.status !== 'PAID');
        if (hasPendingAdmission) {
          // This ensures the Admission Fee ID is included in the selection memo
          // We don't need to add to MONTHS set since Admission is handled separately in selectedFeeIds
        }
      }
    });

    setSelectedMonths(initialS);
    setSelectedTransportMonths(initialT);
  });

  const groupedFees = useMemo(() => {
    const groups: Record<string, { standard: FeeItem[], transport: FeeItem[] }> = {};
    MONTHS.forEach(m => groups[m] = { standard: [], transport: [] });
    fees.forEach(fee => {
      const monthName = new Date(fee.installment.dueDate).toLocaleString('default', { month: 'short' });
      if (groups[monthName]) {
        if (fee.installment.feeStructure.transportRouteId) groups[monthName].transport.push(fee);
        else groups[monthName].standard.push(fee);
      }
    });
    return groups;
  }, [fees]);

  const groupedPayments = useMemo(() => {
    const groups: Record<string, any> = {};
    payments.forEach(p => {
      const rid = p.receiptId || 'OLD-RECORDS';
      if (!groups[rid]) {
        groups[rid] = {
          receiptId: rid,
          date: new Date(p.paymentDate).toLocaleDateString(),
          method: p.paymentMethod,
          total: 0,
          remarks: p.remarks,
          schoolMonths: new Set<string>(),
          transportMonths: new Set<string>(),
          schoolAmount: 0,
          transportAmount: 0,
          admissionAmount: 0,
        };
      }
      groups[rid].total += p.amount;
      const month = p.studentFee.installment.name.split(' ')[0].substring(0, 3);
      if (p.studentFee.installment.feeStructure.isAdmissionFee) {
        groups[rid].admissionAmount += p.amount;
      } else if (p.studentFee.installment.feeStructure.transportRouteId) {
        groups[rid].transportMonths.add(month);
        groups[rid].transportAmount += p.amount;
      } else {
        groups[rid].schoolMonths.add(month);
        groups[rid].schoolAmount += p.amount;
      }
    });
    return Object.values(groups);
  }, [payments]);

  const monthStatus = (month: string, isTransport: boolean) => {
    const list = isTransport ? groupedFees[month].transport : groupedFees[month].standard;
    if (list.length === 0) return 'NONE';
    if (list.every(f => f.status === 'EXEMPTED')) return 'EXEMPTED';
    if (list.every(f => f.status === 'PAID')) return 'PAID';
    return 'PENDING';
  };

  const handleToggleStandardMonth = (month: string) => {
    const newS = new Set(selectedMonths);
    if (newS.has(month)) newS.delete(month);
    else if (monthStatus(month, false) === 'PENDING') newS.add(month);
    setSelectedMonths(newS);
  };

  const handleToggleTransportMonth = (month: string) => {
    const newT = new Set(selectedTransportMonths);
    if (newT.has(month)) newT.delete(month);
    else if (monthStatus(month, true) === 'PENDING') newT.add(month);
    setSelectedTransportMonths(newT);
  };

  const handleSelectAllStandard = (checked: boolean) => {
    if (checked) {
      const allS = new Set<string>();
      MONTHS.forEach(m => { if (monthStatus(m, false) === 'PENDING') allS.add(m); });
      setSelectedMonths(allS);
    } else {
      setSelectedMonths(new Set());
    }
  };

  const handleSelectAllTransport = (checked: boolean) => {
    if (checked) {
      const allT = new Set<string>();
      MONTHS.forEach(m => { if (monthStatus(m, true) === 'PENDING') allT.add(m); });
      setSelectedTransportMonths(allT);
    } else {
      setSelectedTransportMonths(new Set());
    }
  };

  const handleSelectAllGlobal = (checked: boolean) => {
    handleSelectAllStandard(checked);
    handleSelectAllTransport(checked);
  };

  const selectedFeeIds = useMemo(() => {
    const ids: string[] = [];
    // 1. Add Selected Monthly Fees
    selectedMonths.forEach(m => groupedFees[m].standard.forEach(f => { if (f.status !== 'PAID') ids.push(f.id); }));
    
    // 2. Add Selected Transport Fees
    selectedTransportMonths.forEach(m => groupedFees[m].transport.forEach(f => { if (f.status !== 'PAID') ids.push(f.id); }));
    
    // 3. ALWAYS include pending Admission Fees by default if anything is being paid
    // Or if the user wants them separate, we can add a toggle, but for now we auto-include
    fees.forEach(f => {
      if (f.installment.feeStructure.isAdmissionFee && f.status !== 'PAID') {
        ids.push(f.id);
      }
    });

    return Array.from(new Set(ids)); // Ensure unique IDs
  }, [selectedMonths, selectedTransportMonths, groupedFees, fees]);

  const totalAmount = useMemo(() => selectedFeeIds.reduce((sum, id) => {
    const fee = fees.find(f => f.id === id);
    return sum + (fee ? fee.amountDue - fee.amountPaid : 0);
  }, 0), [selectedFeeIds, fees]);

  async function handleBulkPay() {
    if (selectedFeeIds.length === 0) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('feeIds', JSON.stringify(selectedFeeIds));
    formData.append('method', method);
    formData.append('remarks', remarks);
    const res = await collectBulkPayment(tenantId, studentId, formData);
    setLoading(false);
    if (res.error) setError(res.error);
    else {
      setLastPaymentId(res.receiptId);
      setReceiptData({
        schoolAmount: selectedFeeIds.reduce((sum, id) => {
          const fee = fees.find(f => f.id === id);
          return (!fee?.installment.feeStructure.transportRouteId && !fee?.installment.feeStructure.isAdmissionFee) ? sum + (fee ? fee.amountDue - fee.amountPaid : 0) : sum;
        }, 0),
        transportAmount: selectedFeeIds.reduce((sum, id) => {
          const fee = fees.find(f => f.id === id);
          return (fee?.installment.feeStructure.transportRouteId && !fee?.installment.feeStructure.isAdmissionFee) ? sum + (fee ? fee.amountDue - fee.amountPaid : 0) : sum;
        }, 0),
        admissionAmount: selectedFeeIds.reduce((sum, id) => {
          const fee = fees.find(f => f.id === id);
          return fee?.installment.feeStructure.isAdmissionFee ? sum + (fee ? fee.amountDue - fee.amountPaid : 0) : sum;
        }, 0),
        schoolMonths: Array.from(selectedMonths),
        transportMonths: Array.from(selectedTransportMonths),
        total: totalAmount,
        receiptId: res.receiptId,
        date: new Date().toLocaleDateString(),
        method: method,
        remarks: remarks
      });
      setShowSuccess(true);
    }
  }

  const handlePrint = (customData?: any) => {
    const data = customData || receiptData;
    if (!data) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Fee Receipt - ${student.user.firstName}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
              body { font-family: 'Inter', -apple-system, sans-serif; padding: 15px; color: #1e293b; background: #f8fafc; }
              .dual-container { display: flex; flex-direction: column; gap: 30px; max-width: 600px; margin: 0 auto; }
              .receipt-container { background: white; padding: 25px; border-radius: 4px; position: relative; box-shadow: 0 0 0 1px #e2e8f0; }
              .copy-label { position: absolute; top: 0; right: 25px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; border: 1px solid #e2e8f0; border-top: 0; padding: 4px 10px; border-radius: 0 0 6px 6px; }
              .school-header { text-align: left; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
              .logo { height: 50px; width: 50px; object-fit: contain; border-radius: 8px; }
              .school-info { flex: 1; }
              .school-name { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
              .school-address { font-size: 10px; color: #64748b; margin: 2px 0; max-width: 300px; }
              .details-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 8px; }
              .label { color: #94a3b8; font-size: 8px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 2px; }
              .value { font-weight: 700; font-size: 11px; color: #334155; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
              th { text-align: left; padding: 8px 0; color: #94a3b8; font-size: 9px; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
              td { padding: 10px 0; font-size: 11px; border-bottom: 1px solid #f8fafc; font-weight: 600; }
              .total-section { display: flex; justify-content: flex-end; padding-top: 10px; }
              .total-box { text-align: right; border-top: 2px solid #0f172a; padding-top: 10px; width: 150px; }
              .total-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
              .total-value { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
              .footer { margin-top: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
              .mode-badge { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #3b82f6; background: #eff6ff; padding: 4px 8px; border-radius: 4px; }
              .signature-area { text-align: center; }
              .sig-line { border-top: 1px solid #e2e8f0; width: 120px; margin-bottom: 4px; }
              .sig-text { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
              .cut-line { border-top: 1px dashed #cbd5e1; margin: 15px 0; position: relative; }
              .cut-line::after { content: '✂️'; position: absolute; top: -12px; left: 20px; font-size: 14px; color: #cbd5e1; }
              @media print { body { background: white; padding: 0; } .receipt-container { box-shadow: none; border: 1px solid #f1f5f9; } }
            </style>
          </head>
          <body>
            <div class="dual-container">
              <!-- PARENT COPY -->
              <div class="receipt-container">
                <div class="copy-label">Parent Copy</div>
                <div class="school-header">
                  ${tenant.logoUrl ? `<img src="${tenant.logoUrl}" class="logo" />` : '<div style="width:50px;height:50px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#cbd5e1">SC</div>'}
                  <div class="school-info">
                    <h1 class="school-name">${tenant.name}</h1>
                    <p class="school-address">${tenant.address || 'Contact Office for Address'}</p>
                  </div>
                </div>
                
                <div class="details-bar">
                  <div><div class="label">Receipt No</div><div class="value">${data.receiptId}</div></div>
                  <div><div class="label">Date</div><div class="value">${data.date}</div></div>
                  <div><div class="label">Student Name</div><div class="value">${student.user.firstName} ${student.user.lastName}</div></div>
                  <div><div class="label">Admission</div><div class="value">#${student.admissionNumber || 'N/A'}</div></div>
                </div>

                <table>
                  <thead><tr><th>Fee Description</th><th style="text-align: right;">Amount Paid</th></tr></thead>
                  <tbody>
                    ${data.admissionAmount > 0 ? `<tr><td>Admission Fee (One-time)</td><td style="text-align: right; font-weight: 800; color: #0f172a;">₹${data.admissionAmount.toLocaleString()}</td></tr>` : ''}
                    ${data.schoolMonths.length ? `<tr><td>Academic Monthly Fees (${data.schoolMonths.join(', ')})</td><td style="text-align: right;">₹${data.schoolAmount.toLocaleString()}</td></tr>` : ''}
                    ${data.transportMonths.length ? `<tr><td>Transport Services (${data.transportMonths.join(', ')})</td><td style="text-align: right;">₹${data.transportAmount.toLocaleString()}</td></tr>` : ''}
                  </tbody>
                </table>

                <div class="total-section">
                  <div class="total-box">
                    <div class="total-label">Amount Received</div>
                    <div class="total-value">₹${data.total.toLocaleString()}</div>
                  </div>
                </div>

                <div class="footer">
                  <div><span class="mode-badge">${data.method}</span></div>
                  <div class="signature-area">
                    ${tenant.signatureUrl ? `<img src="${tenant.signatureUrl}" style="height: 40px; margin-bottom: 5px; display: block; margin-left: auto; margin-right: auto;" />` : '<div class="sig-line"></div>'}
                    <div class="sig-text">Authorized Signatory</div>
                  </div>
                </div>
              </div>

              <div class="cut-line"></div>

              <!-- OFFICE COPY -->
              <div class="receipt-container">
                <div class="copy-label">Office Copy</div>
                <div class="school-header">
                  ${tenant.logoUrl ? `<img src="${tenant.logoUrl}" class="logo" />` : '<div style="width:50px;height:50px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#cbd5e1">SC</div>'}
                  <div class="school-info">
                    <h1 class="school-name">${tenant.name}</h1>
                    <p class="school-address">${tenant.address || 'Contact Office for Address'}</p>
                  </div>
                </div>
                
                <div class="details-bar">
                  <div><div class="label">Receipt No</div><div class="value">${data.receiptId}</div></div>
                  <div><div class="label">Date</div><div class="value">${data.date}</div></div>
                  <div><div class="label">Student Name</div><div class="value">${student.user.firstName} ${student.user.lastName}</div></div>
                  <div><div class="label">Admission</div><div class="value">#${student.admissionNumber || 'N/A'}</div></div>
                </div>

                <table>
                  <thead><tr><th>Fee Description</th><th style="text-align: right;">Amount Paid</th></tr></thead>
                  <tbody>
                    ${data.admissionAmount > 0 ? `<tr><td>Admission Fee (One-time)</td><td style="text-align: right; font-weight: 800; color: #0f172a;">₹${data.admissionAmount.toLocaleString()}</td></tr>` : ''}
                    ${data.schoolMonths.length ? `<tr><td>Academic Monthly Fees (${data.schoolMonths.join(', ')})</td><td style="text-align: right;">₹${data.schoolAmount.toLocaleString()}</td></tr>` : ''}
                    ${data.transportMonths.length ? `<tr><td>Transport Services (${data.transportMonths.join(', ')})</td><td style="text-align: right;">₹${data.transportAmount.toLocaleString()}</td></tr>` : ''}
                  </tbody>
                </table>

                <div class="total-section">
                  <div class="total-box">
                    <div class="total-label">Amount Received</div>
                    <div class="total-value">₹${data.total.toLocaleString()}</div>
                  </div>
                </div>

                <div class="footer">
                  <div><span class="mode-badge">${data.method}</span></div>
                  <div class="signature-area">
                    ${tenant.signatureUrl ? `<img src="${tenant.signatureUrl}" style="height: 40px; margin-bottom: 5px; display: block; margin-left: auto; margin-right: auto;" />` : '<div class="sig-line"></div>'}
                    <div class="sig-text">Authorized Signatory</div>
                  </div>
                </div>
              </div>
            </div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Month Selection Grid */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#0f172a' }}>Quick Collect Portal</h3>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', color: '#3b82f6' }}>
              <input type="checkbox" checked={selectedMonths.size > 0 && selectedMonths.size === MONTHS.filter(m => monthStatus(m, false) === 'PENDING').length} onChange={(e) => handleSelectAllStandard(e.target.checked)} />
              Select All Academic
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', color: '#16a34a' }}>
              <input type="checkbox" checked={selectedTransportMonths.size > 0 && selectedTransportMonths.size === MONTHS.filter(m => monthStatus(m, true) === 'PENDING').length} onChange={(e) => handleSelectAllTransport(e.target.checked)} />
              Select All Transport
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>
              <input type="checkbox" checked={selectedFeeIds.length > 0 && selectedFeeIds.length === fees.filter(f => f.status !== 'PAID').length} onChange={(e) => handleSelectAllGlobal(e.target.checked)} />
              All Pending
            </label>
          </div>
        </div>

        {/* Standard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {MONTHS.map(m => {
              const status = monthStatus(m, false);
              const isSelected = selectedMonths.has(m);
              const isPaid = status === 'PAID';
              const isExempted = status === 'EXEMPTED';
              const isNone = status === 'NONE';
              return (
                <div key={m} onClick={() => !isNone && !isPaid && !isExempted && handleToggleStandardMonth(m)} style={{ 
                  padding: '0.75rem', 
                  borderRadius: '12px', 
                  border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', 
                  backgroundColor: isSelected ? '#eff6ff' : isPaid ? '#f0fdf4' : isExempted ? '#f8fafc' : isNone ? '#f8fafc' : 'white', 
                  cursor: isNone || isPaid || isExempted ? 'default' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  opacity: (isNone || isExempted) ? 0.6 : 1 
                }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '4px', 
                    border: '2px solid #cbd5e1', 
                    backgroundColor: (isSelected || isPaid) ? (isPaid ? '#16a34a' : '#3b82f6') : isExempted ? '#e2e8f0' : 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {(isSelected || isPaid) && <span className="material-symbols-rounded" style={{ color: 'white', fontSize: '0.8rem' }}>check</span>}
                    {isExempted && <span className="material-symbols-rounded" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>block</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.85rem', color: isPaid ? '#166534' : isExempted ? '#64748b' : '#1e293b' }}>{m}</div>
                    <div style={{ fontSize: '0.7rem', color: isPaid ? '#16a34a' : isExempted ? '#94a3b8' : '#64748b' }}>
                      {isNone ? '-' : isPaid ? 'Paid' : isExempted ? 'Exempted' : `₹${groupedFees[m].standard.reduce((s,f)=>s+f.amountDue-f.amountPaid,0)}`}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Transport Grid */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '900', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>directions_bus</span>
            Transport Service Ledger
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
            {MONTHS.map(m => {
              const status = monthStatus(m, true);
              const isSelected = selectedTransportMonths.has(m);
              const isPaid = status === 'PAID';
              const isExempted = status === 'EXEMPTED';
              const isNone = status === 'NONE';
              return (
                <div key={m+'-t'} onClick={() => !isNone && !isPaid && !isExempted && handleToggleTransportMonth(m)} style={{ 
                  padding: '0.75rem', 
                  borderRadius: '12px', 
                  border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0', 
                  backgroundColor: isSelected ? '#f0fdf4' : isPaid ? '#f0fdf4' : isExempted ? '#f8fafc' : isNone ? '#f8fafc' : 'white', 
                  cursor: isNone || isPaid || isExempted ? 'default' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  opacity: (isNone || isExempted) ? 0.6 : 1 
                }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '4px', 
                    border: '2px solid #cbd5e1', 
                    backgroundColor: (isSelected || isPaid) ? '#16a34a' : isExempted ? '#e2e8f0' : 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {(isSelected || isPaid) && <span className="material-symbols-rounded" style={{ color: 'white', fontSize: '0.8rem' }}>check</span>}
                    {isExempted && <span className="material-symbols-rounded" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>block</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.85rem', color: isPaid ? '#166534' : isExempted ? '#64748b' : '#1e293b' }}>{m}</div>
                    <div style={{ fontSize: '0.7rem', color: isPaid ? '#16a34a' : isExempted ? '#94a3b8' : '#64748b' }}>
                      {isNone ? 'No Route' : isPaid ? 'Paid' : isExempted ? 'Exempted' : `₹${groupedFees[m].transport.reduce((s,f)=>s+f.amountDue-f.amountPaid,0)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedFeeIds.length > 0 && !showSuccess && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#0f172a', color: 'white', padding: '1rem 2.5rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', zIndex: 50 }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800' }}>Payable</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#38bdf8' }}>₹{totalAmount.toLocaleString()}</div>
          </div>
          <button onClick={() => setIsConfirmModalOpen(true)} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.85rem 2.5rem', borderRadius: '99px', fontWeight: '900', cursor: 'pointer', fontSize: '1rem' }}>Collect Fees</button>
        </div>
      )}

      {/* Recent Payments - THE REPRINT LEDGER */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="material-symbols-rounded" style={{ color: '#64748b' }}>history</span>
          Recent Payments
        </h3>
        {!mounted ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>Loading payment history...</div>
        ) : groupedPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>No payment records found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {groupedPayments.map((p: any) => (
              <div key={p.receiptId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #eef2f6' }}>
                <div>
                  <div style={{ fontWeight: '800', color: '#1e293b' }}>{p.receiptId}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.date} • {p.method} • {Array.from(p.schoolMonths).join(', ')} {p.transportMonths.size > 0 ? `+ Transport` : ''}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#0f172a' }}>₹{p.total.toLocaleString()}</div>
                  <button onClick={() => handlePrint({
                    ...p,
                    schoolMonths: Array.from(p.schoolMonths),
                    transportMonths: Array.from(p.transportMonths)
                  })} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>print</span> Reprint
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation & Success Modal */}
      {isConfirmModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '32px', width: '100%', maxWidth: '500px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            {!showSuccess ? (
              <>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: '900' }}>Confirm Collection</h2>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '20px', margin: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', color: '#64748b' }}>Total Payable</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#3b82f6' }}>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['CASH', 'ONLINE', 'CHEQUE'].map(m => (
                      <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: method === m ? '2px solid #3b82f6' : '1px solid #e2e8f0', backgroundColor: method === m ? '#eff6ff' : 'white', fontWeight: '800', fontSize: '0.85rem' }}>{m}</button>
                    ))}
                  </div>
                  <input placeholder="Ref No / Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                  <button onClick={handleBulkPay} disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '1.25rem', borderRadius: '16px', backgroundColor: '#0f172a', color: 'white', fontWeight: '900', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>{loading ? 'Processing...' : 'Complete Payment'}</button>
                  <button onClick={() => setIsConfirmModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '3rem' }}>verified</span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900' }}>Payment Successful!</h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>Receipt {lastPaymentId} generated.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => handlePrint()} style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', padding: '1rem', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <span className="material-symbols-rounded">print</span> Print
                  </button>
                  <button onClick={() => { setShowSuccess(false); setIsConfirmModalOpen(false); setSelectedMonths(new Set()); setSelectedTransportMonths(new Set()); }} style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', padding: '1rem', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
