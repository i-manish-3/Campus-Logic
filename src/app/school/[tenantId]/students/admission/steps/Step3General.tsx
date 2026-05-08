'use client';

import React from 'react';

interface Step3Props {
  formData: any;
  setFormData: (data: any) => void;
  classes: any[];
  allSessions: any[];
  routes: any[];
  religions: string[];
  categories: string[];
  mediums: string[];
}

export default function Step3General({ 
  formData, setFormData, classes, allSessions, routes, religions, categories, mediums 
}: Step3Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="step-content">
      <div className="section-header">
        <i className="ti ti-clipboard-list" style={{ color: 'var(--teal)', fontSize: '18px' }}></i>
        <span className="section-title">General Details</span>
        <span className="section-badge">Step 3 of 5</span>
      </div>

      <div className="subsection">
        <div className="subsection-title"><i className="ti ti-school"></i> Academic Information</div>
        <div className="form-grid">
          <div className="field">
            <label>Class Admitted <span className="req">*</span></label>
            <select name="classId" value={formData.classId} onChange={(e) => {
              setFormData({ ...formData, classId: e.target.value, sectionId: '' });
            }} required>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Section <span className="req">*</span></label>
            <select name="sectionId" value={formData.sectionId} onChange={handleChange} required>
              <option value="">Select Section</option>
              {(() => {
                const selectedClass = classes.find(c => c.id === formData.classId);
                return selectedClass?.sections?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                )) || [];
              })()}
            </select>
          </div>
          <div className="field">
            <label>Medium of Instruction</label>
            <select name="medium" value={formData.medium} onChange={handleChange}>
              <option value="">Select</option>
              {mediums.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Religion</label>
            <select name="religion" value={formData.religion} onChange={handleChange}>
              <option value="">Select</option>
              {religions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="">Select</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Caste</label>
            <input type="text" name="caste" value={formData.caste} onChange={handleChange} placeholder="Enter caste" />
          </div>
          <div className="field">
            <label>Area Type</label>
            <div className="radio-group" style={{ paddingTop: '6px' }}>
              <label className="radio-opt"><input type="radio" name="areaType" value="urban" checked={formData.areaType === 'urban'} onChange={handleChange} /><span>Urban</span></label>
              <label className="radio-opt"><input type="radio" name="areaType" value="rural" checked={formData.areaType === 'rural'} onChange={handleChange} /><span>Rural</span></label>
            </div>
          </div>
          <div className="field col-span-2">
            <label>Medical History</label>
            <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} placeholder="Any known medical conditions, allergies..." rows={2} style={{ resize: 'vertical' }}></textarea>
          </div>
        </div>
      </div>

      <div className="subsection">
        <div className="subsection-title"><i className="ti ti-building-school"></i> Previous School Details</div>
        <div className="form-grid">
          <div className="field col-span-2"><label>Institution Name</label><input type="text" name="prevSchoolName" value={formData.prevSchoolName} onChange={handleChange} placeholder="Previous school name" /></div>
          <div className="field"><label>Affiliated To</label><input type="text" name="affiliatedTo" value={formData.affiliatedTo} onChange={handleChange} placeholder="e.g. CBSE, State Board" /></div>
          <div className="field col-span-3"><label>Institution Address</label><input type="text" name="prevSchoolAddress" value={formData.prevSchoolAddress} onChange={handleChange} placeholder="Address of previous school" /></div>
          <div className="field">
            <label>Last Class Attended</label>
            <select name="lastClassAttended" value={formData.lastClassAttended} onChange={handleChange}>
              <option value="">Select</option>
              {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Result</label>
            <select name="prevResult" value={formData.prevResult} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Compartment">Compartment</option>
            </select>
          </div>
          <div className="field"><label>TC Number</label><input type="text" name="tcNumber" value={formData.tcNumber} onChange={handleChange} placeholder="Transfer Certificate No." /></div>
          <div className="field"><label>TC Date</label><input type="date" name="tcDate" value={formData.tcDate} onChange={handleChange} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="subsection">
          <div className="subsection-title"><i className="ti ti-bus"></i> Transport Details</div>
          <div className="field" style={{ marginBottom: '10px' }}>
            <label>Route</label>
            <select 
              name="transportRouteId" 
              value={formData.transportRouteId} 
              onChange={(e) => {
                setFormData({ ...formData, transportRouteId: e.target.value, transportStop: '' });
              }}
            >
              <option value="">Select Route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Stop & Monthly Fare</label>
            {formData.transportRouteId ? (
              <select name="transportStop" value={formData.transportStop} onChange={handleChange}>
                <option value="">Select Stop</option>
                {(() => {
                  const selectedRoute = routes.find(r => r.id === formData.transportRouteId);
                  if (!selectedRoute) return null;
                  try {
                    const stops = JSON.parse(selectedRoute.stopsJson || '[]');
                    return stops.map((s: any, idx: number) => (
                      <option key={idx} value={s.name}>{s.name} (₹{s.fare})</option>
                    ));
                  } catch (e) {
                    return null;
                  }
                })()}
              </select>
            ) : (
              <input type="text" disabled placeholder="Select route first" />
            )}
          </div>
        </div>
        <div className="subsection">
          <div className="subsection-title"><i className="ti ti-building"></i> Hostel Details</div>
          <div className="field" style={{ marginBottom: '10px' }}>
            <label>Hostel Name</label>
            <select name="hostelName" value={formData.hostelName} onChange={handleChange}>
              <option value="">Select Hostel</option>
              <option value="Boys Hostel A">Boys Hostel A</option>
              <option value="Boys Hostel B">Boys Hostel B</option>
              <option value="Girls Hostel">Girls Hostel</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
          <div className="form-grid-2">
            <div className="field"><label>Room Number</label><input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} placeholder="Room no." /></div>
            <div className="field"><label>Bed Number</label><input type="text" name="bedNumber" value={formData.bedNumber} onChange={handleChange} placeholder="Bed no." /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
