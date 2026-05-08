'use client';

import React from 'react';

interface Step4Props {
  formData: any;
  setFormData: (data: any) => void;
  feeGroups: string[];
}

export default function Step4Accounts({ formData, setFormData, feeGroups }: Step4Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="step-content">
      <div className="section-header">
        <i className="ti ti-credit-card" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
        <span className="section-title">Accounts Information</span>
        <span className="section-badge">Step 4 of 5</span>
      </div>
      <div className="info-banner">
        <i className="ti ti-shield-lock"></i> 
        Bank account details are stored securely and used only for scholarship/fee transactions.
      </div>

      <div className="subsection">
        <div className="subsection-title"><i className="ti ti-building-bank"></i> Bank Account Details</div>
        <div className="form-grid">
          <div className="field col-span-2">
            <label>Student Bank Account Number</label>
            <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} placeholder="Account number" maxLength={18} />
          </div>
          <div className="field">
            <label>IFSC Code</label>
            <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="e.g. SBIN0001234" maxLength={11} style={{ textTransform: 'uppercase' }} />
          </div>
        </div>
      </div>

      <div className="subsection">
        <div className="subsection-title"><i className="ti ti-receipt-tax"></i> Fee & Concession Details</div>
        <div className="form-grid">
          <div className="field">
            <label>Fee Group</label>
            <select name="feeGroup" value={formData.feeGroup} onChange={handleChange}>
              <option value="">Select Group</option>
              {feeGroups.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Fee ID / Concession Number</label>
            <input type="text" name="feeIdConcession" value={formData.feeIdConcession} onChange={handleChange} placeholder="Concession ref. no." />
          </div>
          <div className="field">
            <label>Monthly Fee Discount (₹)</label>
            <input type="number" name="monthlyFeeDiscount" value={formData.monthlyFeeDiscount} onChange={handleChange} placeholder="e.g. 500" min={0} />
          </div>
          <div className="field">
            <label>Transport Discount Amount (₹)</label>
            <input type="number" name="transportDiscount" value={formData.transportDiscount} onChange={handleChange} placeholder="e.g. 200" min={0} />
          </div>
        </div>
      </div>

      <div className="subsection" style={{ background: 'var(--teal-bg)', borderColor: 'var(--teal-light)' }}>
        <div className="subsection-title" style={{ color: 'var(--teal-dark)' }}><i className="ti ti-calculator"></i> Fee Summary Preview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            ['Monthly Tuition', '₹ 2,500'],
            ['Transport Fee', '₹ 800'],
            ['Misc. Charges', '₹ 200'],
            ['Fee Discount', `— ₹ ${formData.monthlyFeeDiscount || 0}`],
            ['Transport Discount', `— ₹ ${formData.transportDiscount || 0}`],
            ['Net Payable', `₹ ${3500 - (Number(formData.monthlyFeeDiscount) || 0) - (Number(formData.transportDiscount) || 0)}`]
          ].map((r, i) => (
            <div key={i} style={{ 
              background: '#fff', 
              border: '1px solid var(--teal-light)', 
              borderRadius: 'var(--radius)', 
              padding: '10px 12px',
              ...(i === 5 ? { borderColor: 'var(--orange)', borderWidth: '2px' } : {})
            }}>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '4px' }}>{r[0]}</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                color: i === 5 ? 'var(--orange-dark)' : 'var(--gray-800)' 
              }}>{r[1]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
