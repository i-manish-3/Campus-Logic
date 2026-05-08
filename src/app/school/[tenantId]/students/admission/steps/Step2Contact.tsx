'use client';

import React from 'react';

interface Step2Props {
  formData: any;
  setFormData: (data: any) => void;
  states: string[];
}

export default function Step2Contact({ formData, setFormData, states }: Step2Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSameAddress = (checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        sameAsPermanent: true,
        localStreet: formData.permStreet,
        localLandmark: formData.permLandmark,
        localArea: formData.permArea,
        localCity: formData.permCity,
        localState: formData.permState,
        localCountry: formData.permCountry,
        localPincode: formData.permPincode,
      });
    } else {
      setFormData({ ...formData, sameAsPermanent: false });
    }
  };

  return (
    <div className="step-content">
      <div className="section-header">
        <i className="ti ti-address-book" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
        <span className="section-title">Contact Information</span>
        <span className="section-badge">Step 2 of 5</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Mother Details */}
        <div className="subsection">
          <div className="subsection-title"><i className="ti ti-woman"></i> Mother's Details</div>
          <div className="form-grid-2" style={{ marginBottom: '10px' }}>
            <div className="field col-span-2">
              <label>Mother Name <span className="req">*</span></label>
              <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Full name" required />
            </div>
            <div className="field">
              <label>Occupation</label>
              <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} placeholder="e.g. Teacher" />
            </div>
            <div className="field">
              <label>Qualification</label>
              <input type="text" name="motherQualification" value={formData.motherQualification} onChange={handleChange} placeholder="e.g. B.Ed." />
            </div>
            <div className="field col-span-2">
              <label>Email</label>
              <input type="email" name="motherEmail" value={formData.motherEmail} onChange={handleChange} placeholder="mother@email.com" />
            </div>
            <div className="field">
              <label>Aadhaar Number</label>
              <input type="text" name="motherAadhaar" value={formData.motherAadhaar} onChange={handleChange} placeholder="12-digit" />
            </div>
            <div className="field">
              <label>Annual Income (₹)</label>
              <input type="number" name="motherIncome" value={formData.motherIncome} onChange={handleChange} placeholder="e.g. 360000" />
            </div>
            <div className="field col-span-2">
              <label>Contact Number <span className="req">*</span></label>
              <input type="tel" name="motherContact" value={formData.motherContact} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
            </div>
          </div>
        </div>

        {/* Father Details */}
        <div className="subsection">
          <div className="subsection-title"><i className="ti ti-man"></i> Father's Details</div>
          <div className="form-grid-2" style={{ marginBottom: '10px' }}>
            <div className="field col-span-2">
              <label>Father Name <span className="req">*</span></label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Full name" required />
            </div>
            <div className="field">
              <label>Occupation</label>
              <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} placeholder="e.g. Engineer" />
            </div>
            <div className="field">
              <label>Qualification</label>
              <input type="text" name="fatherQualification" value={formData.fatherQualification} onChange={handleChange} placeholder="e.g. B.Tech" />
            </div>
            <div className="field col-span-2">
              <label>Email</label>
              <input type="email" name="fatherEmail" value={formData.fatherEmail} onChange={handleChange} placeholder="father@email.com" />
            </div>
            <div className="field">
              <label>Aadhaar Number</label>
              <input type="text" name="fatherAadhaar" value={formData.fatherAadhaar} onChange={handleChange} placeholder="12-digit" />
            </div>
            <div className="field">
              <label>Annual Income (₹)</label>
              <input type="number" name="fatherIncome" value={formData.fatherIncome} onChange={handleChange} placeholder="e.g. 720000" />
            </div>
            <div className="field col-span-2">
              <label>Contact Number <span className="req">*</span></label>
              <input type="tel" name="fatherContact" value={formData.fatherContact} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
            </div>
          </div>
        </div>
      </div>

      <div className="subsection">
        <div className="subsection-title"><i className="ti ti-info-circle"></i> Other Details</div>
        <div className="form-grid">
          <div className="field">
            <label>Mother Tongue</label>
            <select name="motherTongue" value={formData.motherTongue} onChange={handleChange}>
              <option value="">Select</option>
              {['Hindi','English','Marathi','Bengali','Tamil','Telugu','Gujarati','Punjabi','Urdu','Other'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="field">
            <label>EWS Status</label>
            <div className="radio-group" style={{ paddingTop: '6px' }}>
              <label className="radio-opt"><input type="radio" name="ewsStatus" value="yes" checked={formData.ewsStatus === 'yes'} onChange={handleChange} /><span>Yes</span></label>
              <label className="radio-opt"><input type="radio" name="ewsStatus" value="no" checked={formData.ewsStatus === 'no'} onChange={handleChange} /><span>No</span></label>
            </div>
          </div>
          <div className="field">
            <label>Single Girl Child</label>
            <div className="radio-group" style={{ paddingTop: '6px' }}>
              <label className="radio-opt"><input type="radio" name="singleGirlChild" value="yes" checked={formData.singleGirlChild === 'yes'} onChange={handleChange} /><span>Yes</span></label>
              <label className="radio-opt"><input type="radio" name="singleGirlChild" value="no" checked={formData.singleGirlChild === 'no'} onChange={handleChange} /><span>No</span></label>
            </div>
          </div>
          <div className="field">
            <label>Divyang Status</label>
            <div className="radio-group" style={{ paddingTop: '6px' }}>
              <label className="radio-opt"><input type="radio" name="divyangStatus" value="yes" checked={formData.divyangStatus === 'yes'} onChange={handleChange} /><span>Yes</span></label>
              <label className="radio-opt"><input type="radio" name="divyangStatus" value="no" checked={formData.divyangStatus === 'no'} onChange={handleChange} /><span>No</span></label>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Permanent Address */}
        <div className="subsection">
          <div className="subsection-title"><i className="ti ti-home-2"></i> Permanent Address</div>
          <div className="field" style={{ marginBottom: '10px' }}>
            <label>Street Address</label>
            <input type="text" name="permStreet" value={formData.permStreet} onChange={handleChange} placeholder="House no., Street" />
          </div>
          <div className="form-grid-2">
            <div className="field"><label>Landmark</label><input type="text" name="permLandmark" value={formData.permLandmark} onChange={handleChange} placeholder="Near..." /></div>
            <div className="field"><label>Area</label><input type="text" name="permArea" value={formData.permArea} onChange={handleChange} placeholder="Colony/Area" /></div>
            <div className="field"><label>City</label><input type="text" name="permCity" value={formData.permCity} onChange={handleChange} placeholder="City" /></div>
            <div className="field">
              <label>State</label>
              <select name="permState" value={formData.permState} onChange={handleChange}>
                <option value="">Select</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field"><label>Country</label><input type="text" name="permCountry" value={formData.permCountry} onChange={handleChange} placeholder="Country" /></div>
            <div className="field"><label>Pincode</label><input type="text" name="permPincode" value={formData.permPincode} onChange={handleChange} placeholder="6-digit PIN" maxLength={6} /></div>
          </div>
        </div>

        {/* Local Address */}
        <div className="subsection">
          <div className="subsection-title"><i className="ti ti-map-pin"></i> Local / Current Address</div>
          <div className="checkbox-row" style={{ marginBottom: '10px' }}>
            <input 
              type="checkbox" 
              id="same-addr" 
              checked={formData.sameAsPermanent} 
              onChange={(e) => handleSameAddress(e.target.checked)} 
            />
            <label htmlFor="same-addr">Same as Permanent Address</label>
          </div>
          <div className="field" style={{ marginBottom: '10px' }}>
            <label>Street Address</label>
            <input type="text" name="localStreet" value={formData.localStreet} onChange={handleChange} placeholder="House no., Street" disabled={formData.sameAsPermanent} />
          </div>
          <div className="form-grid-2">
            <div className="field"><label>Landmark</label><input type="text" name="localLandmark" value={formData.localLandmark} onChange={handleChange} placeholder="Near..." disabled={formData.sameAsPermanent} /></div>
            <div className="field"><label>Area</label><input type="text" name="localArea" value={formData.localArea} onChange={handleChange} placeholder="Colony/Area" disabled={formData.sameAsPermanent} /></div>
            <div className="field"><label>City</label><input type="text" name="localCity" value={formData.localCity} onChange={handleChange} placeholder="City" disabled={formData.sameAsPermanent} /></div>
            <div className="field">
              <label>State</label>
              <select name="localState" value={formData.localState} onChange={handleChange} disabled={formData.sameAsPermanent}>
                <option value="">Select</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field"><label>Country</label><input type="text" name="localCountry" value={formData.localCountry} onChange={handleChange} placeholder="Country" disabled={formData.sameAsPermanent} /></div>
            <div className="field"><label>Pincode</label><input type="text" name="localPincode" value={formData.localPincode} onChange={handleChange} placeholder="6-digit PIN" maxLength={6} disabled={formData.sameAsPermanent} /></div>
          </div>
        </div>
      </div>

      <div className="subsection" style={{ marginTop: '16px' }}>
        <div className="subsection-title"><i className="ti ti-map-2"></i> Additional Address Details</div>
        <div className="form-grid-4">
          <div className="field"><label>Village</label><input type="text" name="village" value={formData.village} onChange={handleChange} placeholder="Village name" /></div>
          <div className="field"><label>Post</label><input type="text" name="post" value={formData.post} onChange={handleChange} placeholder="Post office" /></div>
          <div className="field"><label>Police Station</label><input type="text" name="policeStation" value={formData.policeStation} onChange={handleChange} placeholder="PS name" /></div>
          <div className="field"><label>Ward Number</label><input type="text" name="wardNumber" value={formData.wardNumber} onChange={handleChange} placeholder="Ward no." /></div>
        </div>
      </div>
    </div>
  );
}
