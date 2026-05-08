'use client';

import React, { useState } from 'react';
import { searchParents } from '../../actions';
import { useParams } from 'next/navigation';

interface Step2Props {
  formData: any;
  setFormData: (data: any) => void;
  states: string[];
}

export default function Step2Contact({ formData, setFormData, states }: Step2Props) {
  const { tenantId } = useParams();
  const isSibling = formData.isSibling || false;
  const setIsSibling = (val: boolean) => setFormData({ ...formData, isSibling: val });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [duplicateSibling, setDuplicateSibling] = useState<any>(null);

  const checkDuplicatePhone = async (value: string) => {
    // Strip non-numeric for length check
    const cleanPhone = value.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 10 && !formData.existingParentId) {
      const results = await searchParents(tenantId as string, value);
      console.log("SIBLING_CHECK_RESULTS:", results);
      if (results.length > 0) {
        setDuplicateSibling(results[0]);
      } else {
        setDuplicateSibling(null);
      }
    } else {
      setDuplicateSibling(null);
    }
  };

  const handleSiblingSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await searchParents(tenantId as string, query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const selectParent = (parent: any) => {
    setFormData({
      ...formData,
      existingParentId: parent.id,
      fatherName: parent.fatherName || formData.fatherName,
      fatherEmail: parent.fatherEmail || formData.fatherEmail,
      fatherContact: parent.fatherContact || formData.fatherContact,
      fatherOccupation: parent.fatherOccupation || formData.fatherOccupation,
      fatherQualification: parent.fatherQualification || formData.fatherQualification,
      fatherAadhaar: parent.fatherAadhaar || formData.fatherAadhaar,
      fatherIncome: parent.fatherIncome || formData.fatherIncome,
      motherName: parent.motherName || formData.motherName,
      motherEmail: parent.motherEmail || formData.motherEmail,
      motherContact: parent.motherContact || formData.motherContact,
      motherOccupation: parent.motherOccupation || formData.motherOccupation,
      motherQualification: parent.motherQualification || formData.motherQualification,
      motherAadhaar: parent.motherAadhaar || formData.motherAadhaar,
      motherIncome: parent.motherIncome || formData.motherIncome,
      permStreet: parent.permStreet || formData.permStreet,
      permLandmark: parent.permLandmark || formData.permLandmark,
      permArea: parent.permArea || formData.permArea,
      permCity: parent.permCity || formData.permCity,
      permState: parent.permState || formData.permState,
      permCountry: parent.permCountry || formData.permCountry,
      permPincode: parent.permPincode || formData.permPincode,
      localStreet: parent.localStreet || formData.localStreet,
      localLandmark: parent.localLandmark || formData.localLandmark,
      localArea: parent.localArea || formData.localArea,
      localCity: parent.localCity || formData.localCity,
      localState: parent.localState || formData.localState,
      localCountry: parent.localCountry || formData.localCountry,
      localPincode: parent.localPincode || formData.localPincode,
      village: parent.village || formData.village,
      post: parent.post || formData.post,
      policeStation: parent.policeStation || formData.policeStation,
      wardNumber: parent.wardNumber || formData.wardNumber,
      sameAsPermanent: parent.permStreet === parent.localStreet && parent.permPincode === parent.localPincode,
      isSibling: true
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'fatherContact' || name === 'motherContact') {
      checkDuplicatePhone(value);
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <i className="ti ti-address-book" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
          <span className="section-title">Contact Information</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
            <input 
              type="checkbox" 
              id="isSibling" 
              checked={isSibling} 
              onChange={(e) => {
                setIsSibling(e.target.checked);
              }}
            />
            <label htmlFor="isSibling" style={{ fontSize: '0.8rem', fontWeight: '700', color: '#166534', cursor: 'pointer' }}>Sibling already in school?</label>
          </div>
          <span className="section-badge">Step 2 of 5</span>
        </div>
      </div>

      {isSibling && (
        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
           <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0369a1', marginBottom: '8px', display: 'block' }}>
            <i className="ti ti-search" style={{ marginRight: '5px' }}></i> Search Existing Parent / Sibling
           </label>
           <div style={{ position: 'relative' }}>
             <input 
               type="text" 
               placeholder="Enter Parent Mobile, Name or Email..." 
               value={searchQuery}
               onChange={(e) => handleSiblingSearch(e.target.value)}
               style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #7dd3fc' }}
             />
             {isSearching && (
               <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                 <div className="spinner-small"></div>
               </div>
             )}
             
             {searchResults.length > 0 && (
               <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 50, marginTop: '5px' }}>
                 {searchResults.map(result => (
                   <div 
                    key={result.id} 
                    onClick={() => selectParent(result)}
                    style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                   >
                     <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>{result.name}</div>
                     <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Phone: {result.phone} | Wards: {result.wards}</div>
                   </div>
                 ))}
               </div>
             )}
           </div>
           {formData.existingParentId && (
             <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.85rem', fontWeight: '600' }}>
                 <i className="ti ti-check-circle"></i> Linked to existing parent profile: {formData.fatherName || 'Selected Parent'}
               </div>
               <button 
                 onClick={(e) => {
                   e.preventDefault();
                   setFormData({ 
                     ...formData, 
                     existingParentId: null,
                     isSibling: false 
                   });
                 }}
                 style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
               >
                 <i className="ti ti-x"></i> Remove Link
               </button>
             </div>
           )}
        </div>
      )}

      {duplicateSibling && !formData.existingParentId && (
        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#ffedd5', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-alert-triangle" style={{ color: '#ea580c', fontSize: '20px' }}></i>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#9a3412' }}>Parent Record Already Exists!</div>
            <div style={{ fontSize: '0.8rem', color: '#c2410c' }}>
              The phone number matches <strong>{duplicateSibling.name}</strong>, who already has wards (<strong>{duplicateSibling.wards}</strong>) in this school.
            </div>
          </div>
          <button 
            onClick={() => {
              selectParent(duplicateSibling);
              setDuplicateSibling(null);
            }}
            style={{ backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Link Sibling Profile
          </button>
        </div>
      )}

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
