'use client';

import React from 'react';

interface Step4Props {
  formData: any;
  setFormData: (data: any) => void;
  feeGroups: any[];
}

export default function Step4Accounts({ formData, setFormData, feeGroups }: Step4Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'feeGroupId') {
      const group = feeGroups.find(g => g.id === value);
      setFormData({ 
        ...formData, 
        feeGroupId: value,
        feeGroup: group ? group.name : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Auto-suggest Sibling group if detected
  React.useEffect(() => {
    if (formData.isSibling && !formData.feeGroupId) {
      const siblingGroup = feeGroups.find(g => 
        g.name.toLowerCase().includes('sibling') || 
        g.name.toLowerCase().includes('brother') || 
        g.name.toLowerCase().includes('sister')
      );
      if (siblingGroup) {
        setFormData({ 
          ...formData, 
          feeGroupId: siblingGroup.id,
          feeGroup: siblingGroup.name
        });
      }
    }
  }, [formData.isSibling, feeGroups]);

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
            <select name="feeGroupId" value={formData.feeGroupId} onChange={handleChange}>
              <option value="">Select Group</option>
              {feeGroups.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
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
        <div className="subsection-title" style={{ color: 'var(--teal-dark)' }}><i className="ti ti-calculator"></i> Applied Concessions Preview</div>
        <div style={{ marginBottom: '1rem', fontSize: '12px', color: 'var(--teal-dark)', fontWeight: '600', opacity: 0.8 }}>
          Note: This preview shows how entered discounts will affect the base fees defined in the Fees module.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[
            ['Monthly Fee Discount', `₹ ${formData.monthlyFeeDiscount || 0}`, 'deductible'],
            ['Transport Discount', `₹ ${formData.transportDiscount || 0}`, 'deductible'],
          ].map((r, i) => (
            <div key={i} style={{ 
              background: '#fff', 
              border: '1px solid var(--teal-light)', 
              borderRadius: 'var(--radius)', 
              padding: '10px 12px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '4px' }}>{r[0]}</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'var(--orange-dark)' 
              }}>- {r[1]}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '11px', color: 'var(--teal-dark)', fontStyle: 'italic' }}>
          Final amounts will be calculated based on the Fee Structures assigned to the student's class and route.
        </p>
      </div>
    </div>
  );
}
