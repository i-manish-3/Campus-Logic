'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { admitStudent, searchParents } from '../actions';

interface Section {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  sections: Section[];
}

export default function AdmissionForm({
  tenantId,
  classes,
  currentSessionId,
  nextAdmissionNumber
}: {
  tenantId: string;
  classes: Class[];
  currentSessionId?: string;
  nextAdmissionNumber: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Multi-step State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form States
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentOption, setParentOption] = useState<'new' | 'existing'>('new');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ parentId: string; parentPass: string; studentName: string } | null>(null);

  // Existing Parent Search State
  const [parentQuery, setParentQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (parentQuery.length > 0 && parentOption === 'existing') {
        setIsSearching(true);
        const results = await searchParents(tenantId, parentQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [parentQuery, parentOption, tenantId]);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const selectedClass = classes.find(c => c.id === classId);
    setSections(selectedClass?.sections || []);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoInput = () => {
    document.getElementById('photoInput')?.click();
  };

  const validateStep = (step: number) => {
    if (!formRef.current) return true;
    const inputs = formRef.current.querySelectorAll(`[data-step="${step}"] input[required], [data-step="${step}"] select[required]`);
    let isValid = true;
    inputs.forEach((input: any) => {
      if (!input.value) {
        isValid = false;
        input.style.borderColor = '#ef4444';
      } else {
        input.style.borderColor = '#cbd5e1';
      }
    });
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    } else {
      setError('Please fill in all required fields marked with *');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (!formData.has('sessionId')) {
      formData.append('sessionId', currentSessionId || '');
    }

    const result = await admitStudent(tenantId, formData);

    if (result.success) {
      const isNew = formData.get('parentOption') === 'new';
      setSuccessData({
        parentId: isNew ? (formData.get('fatherEmail') as string) : (parentQuery || 'Existing Account'),
        parentPass: isNew ? 'parent123' : '(Already Set)',
        studentName: `${formData.get('firstName')} ${formData.get('lastName') || ''}`
      });
    } else {
      setError(result.error || 'Something went wrong');
      window.scrollTo(0, 0);
    }
    setIsSubmitting(false);
  };

  if (successData) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '32px',
        padding: '4rem 3rem',
        textAlign: 'center',
        border: '1px solid #f1f5f9',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
        maxWidth: '650px',
        margin: '4rem auto',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#f0fdf4',
          color: '#22c55e',
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          transform: 'rotate(-5deg)',
          boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.2)'
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '4rem' }}>verified</span>
        </div>
        <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Admission Confirmed!</h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem' }}>Student <b>{successData.studentName}</b> is now part of the academy.</p>

        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          textAlign: 'left',
          marginBottom: '2.5rem',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '-12px', left: '2rem', backgroundColor: '#0f172a', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Parent Credentials</div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Login ID / Email</label>
            <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.25rem' }}>{successData.parentId}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Temporary Password</label>
            <div style={{ fontWeight: '800', color: '#6366f1', fontSize: '1.25rem', letterSpacing: '0.05em' }}>{successData.parentPass}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <button
            onClick={() => window.location.reload()}
            style={{ flex: 1, padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#1e293b', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Admit Another
          </button>
          <button
            onClick={() => router.push(`/school/${tenantId}/students`)}
            style={{ flex: 1, padding: '1.25rem', borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)' }}
          >
            Student Directory
          </button>
        </div>
      </div>
    );
  }

  const stepStyles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '3rem',
      position: 'relative' as const,
      padding: '0 1rem'
    },
    line: {
      position: 'absolute' as const,
      top: '20px',
      left: '0',
      right: '0',
      height: '2px',
      backgroundColor: '#e2e8f0',
      zIndex: 0
    },
    progressLine: {
      position: 'absolute' as const,
      top: '20px',
      left: '0',
      width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
      height: '2px',
      backgroundColor: '#6366f1',
      transition: 'width 0.4s ease',
      zIndex: 0
    },
    step: (active: boolean, completed: boolean) => ({
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      backgroundColor: active ? '#6366f1' : (completed ? '#6366f1' : 'white'),
      border: `2px solid ${active || completed ? '#6366f1' : '#e2e8f0'}`,
      color: active || completed ? 'white' : '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '800',
      zIndex: 1,
      transition: 'all 0.3s ease',
      boxShadow: active ? '0 0 0 4px rgba(99, 102, 241, 0.15)' : 'none'
    })
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '1.5rem'
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  };

  const inputStyle = {
    padding: '0.875rem 1rem',
    borderRadius: '14px',
    border: '1.5px solid #e2e8f0',
    fontSize: '0.95rem',
    color: '#0f172a',
    backgroundColor: '#fff',
    transition: 'all 0.2s',
    outline: 'none',
    width: '100%'
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Stepper Header */}
      <div style={stepStyles.container}>
        <div style={stepStyles.line}></div>
        <div style={stepStyles.progressLine}></div>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <div style={stepStyles.step(currentStep === s, currentStep > s)}>
              {currentStep > s ? <span className="material-symbols-rounded" style={{ fontSize: '1.25rem' }}>check</span> : s}
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              color: currentStep === s ? '#0f172a' : '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {s === 1 ? 'Academic' : s === 2 ? 'Personal' : 'Parent'}
            </span>
          </div>
        ))}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        {error && (
          <div style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #ffe4e6',
            color: '#e11d48',
            padding: '1.25rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontWeight: '600',
            fontSize: '0.9rem',
            animation: 'shake 0.5s ease-in-out'
          }}>
            <span className="material-symbols-rounded">error_outline</span>
            {error}
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '3rem',
          border: '1px solid #f1f5f9',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>

          {/* STEP 1: ACADEMIC DETAILS */}
          {currentStep === 1 && (
            <div data-step="1" style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-rounded">school</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Academic Configuration</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Primary enrollment details for the current session.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Admission Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="admissionNumber"
                      style={{ ...inputStyle, backgroundColor: '#f8fafc', color: '#94a3b8', fontWeight: '700', cursor: 'not-allowed' }}
                      value={nextAdmissionNumber}
                      readOnly
                      required
                    />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', color: '#475569', fontWeight: '800' }}>AUTO</span>
                  </div>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Admission Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="date" name="admissionDate" style={inputStyle} defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Class <span style={{ color: '#ef4444' }}>*</span></label>
                  <select name="classId" style={inputStyle} value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)} required>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Section <span style={{ color: '#ef4444' }}>*</span></label>
                  <select name="sectionId" style={inputStyle} disabled={!selectedClassId} required>
                    <option value="">{selectedClassId ? 'Select Section' : 'Select Class First'}</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STUDENT DETAILS */}
          {currentStep === 2 && (
            <div data-step="2" style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-rounded">person</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Student Profile</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Personal and contact information of the student.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div style={{ ...inputGroupStyle, gridColumn: 'span 1' }}>
                  <label style={labelStyle}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="firstName" style={inputStyle} placeholder="e.g. John" required />
                </div>
                <div style={{ ...inputGroupStyle, gridColumn: 'span 1' }}>
                  <label style={labelStyle}>Last Name</label>
                  <input type="text" name="lastName" style={inputStyle} placeholder="e.g. Doe" />
                </div>
                <div style={{ ...inputGroupStyle, gridColumn: 'span 1' }}>
                  <label style={labelStyle}>Gender <span style={{ color: '#ef4444' }}>*</span></label>
                  <select name="gender" style={inputStyle} required>
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Date of Birth <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="date" name="dob" style={inputStyle} required />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Blood Group</label>
                  <input type="text" name="bloodGroup" style={inputStyle} placeholder="O+" />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>National ID</label>
                  <input type="text" name="nationalId" style={inputStyle} placeholder="ID Number" />
                </div>

                {/* Additional Info Row */}
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Category</label>
                  <select name="category" style={inputStyle}>
                    <option value="">Select Category</option>
                    <option value="GEN">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Religion</label>
                  <input type="text" name="religion" style={inputStyle} placeholder="e.g. Hindu" />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Mother Tongue</label>
                  <input type="text" name="motherTongue" style={inputStyle} placeholder="e.g. English" />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Caste</label>
                  <input type="text" name="caste" style={inputStyle} placeholder="Caste" />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>House</label>
                  <select name="house" style={inputStyle}>
                    <option value="">Select House</option>
                    <option value="RED">Red House</option>
                    <option value="BLUE">Blue House</option>
                    <option value="GREEN">Green House</option>
                    <option value="YELLOW">Yellow House</option>
                  </select>
                </div>
                <div></div> {/* Spacer */}

                <div style={{ ...inputGroupStyle, gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="email" name="email" style={inputStyle} placeholder="student@example.com" required />
                </div>
                <div style={{ ...inputGroupStyle, gridColumn: 'span 1' }}>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" name="studentPhone" style={inputStyle} placeholder="Contact No" />
                </div>

                <div style={{ ...inputGroupStyle, gridColumn: 'span 3', border: '2px dashed #f1f5f9', padding: '1.5rem', borderRadius: '20px', backgroundColor: '#fcfdfe' }}>
                  <label style={labelStyle}>Student Photo</label>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div
                      onClick={triggerPhotoInput}
                      style={{
                        width: '80px', height: '80px', borderRadius: '20px', border: '2px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        backgroundColor: '#fff', color: '#94a3b8'
                      }}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} alt="Preview" />
                      ) : (
                        <span className="material-symbols-rounded">add_a_photo</span>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '700', color: '#334155' }}>Upload Identity Image</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Max size 2MB. Format: JPG, PNG</p>
                      <input id="photoInput" type="file" name="photo" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PARENT DETAILS */}
          {currentStep === 3 && (
            <div data-step="3" style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-rounded">family_restroom</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Guardian Information</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Connect student with a new or existing parent account.</p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                padding: '0.5rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '16px',
                marginBottom: '2.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setParentOption('new')}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none',
                    backgroundColor: parentOption === 'new' ? 'white' : 'transparent',
                    color: parentOption === 'new' ? '#0f172a' : '#64748b',
                    fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: parentOption === 'new' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  New Account
                </button>
                <button
                  type="button"
                  onClick={() => setParentOption('existing')}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none',
                    backgroundColor: parentOption === 'existing' ? 'white' : 'transparent',
                    color: parentOption === 'existing' ? '#0f172a' : '#64748b',
                    fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: parentOption === 'existing' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  Existing Parent
                </button>
              </div>

              {parentOption === 'new' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Father's Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" name="fatherName" style={inputStyle} placeholder="Full Name" required />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Father's Email <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="email" name="fatherEmail" style={inputStyle} placeholder="parent@example.com" required />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Father's Phone <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="tel" name="fatherPhone" style={inputStyle} placeholder="10 Digit Number" required />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Mother's Name</label>
                    <input type="text" name="motherName" style={inputStyle} placeholder="Full Name" />
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Search Parent Account <span style={{ color: '#ef4444' }}>*</span></label>

                  {selectedParentId ? (
                    <div style={{
                      padding: '1.5rem', borderRadius: '20px', border: '2px solid #6366f1',
                      backgroundColor: '#f5f7ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: '1rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: '900', color: '#1e293b', fontSize: '1.1rem' }}>{searchResults.find(p => p.id === selectedParentId)?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: '600' }}>{searchResults.find(p => p.id === selectedParentId)?.email} | {searchResults.find(p => p.id === selectedParentId)?.phone}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedParentId(null); setParentQuery(''); }}
                        style={{ backgroundColor: '#fff', color: '#ef4444', border: '1px solid #fee2e2', padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                      <input type="hidden" name="existingParentId" value={selectedParentId} required />
                    </div>
                  ) : (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ position: 'relative' }}>
                        <span className="material-symbols-rounded" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>search</span>
                        <input
                          type="text"
                          value={parentQuery}
                          onChange={(e) => setParentQuery(e.target.value)}
                          style={{ ...inputStyle, paddingLeft: '3rem' }}
                          placeholder="Search by Name, Email or Phone..."
                        />
                      </div>

                      {searchResults.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', marginTop: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                          {searchResults.map((parent) => (
                            <div
                              key={parent.id}
                              onClick={() => setSelectedParentId(parent.id)}
                              style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                            >
                              <div style={{ fontWeight: '800', color: '#1e293b' }}>{parent.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{parent.email} • {parent.phone}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }}></div>

          {/* Actions */}
          <div style={{
            marginTop: '3rem',
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '2rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            <button
              type="button"
              onClick={currentStep === 1 ? () => router.back() : prevStep}
              style={{
                padding: '1rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0',
                backgroundColor: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <span className="material-symbols-rounded">arrow_back</span>
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                style={{
                  padding: '1rem 3rem', borderRadius: '16px', border: 'none',
                  backgroundColor: '#0f172a', color: 'white', fontWeight: '700', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                Next Step
                <span className="material-symbols-rounded">arrow_forward</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '1rem 4rem', borderRadius: '16px', border: 'none',
                  backgroundColor: '#6366f1', color: 'white', fontWeight: '800', cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)', opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}
              >
                {isSubmitting ? 'Finalizing...' : 'Complete Admission'}
                {!isSubmitting && <span className="material-symbols-rounded">rocket_launch</span>}
              </button>
            )}
          </div>
        </div>
      </form>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.25rem;
        }
        input:focus, select:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
}
