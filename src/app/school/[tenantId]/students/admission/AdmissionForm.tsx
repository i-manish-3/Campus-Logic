'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Step1Personal from './steps/Step1Personal';
import Step2Contact from './steps/Step2Contact';
import Step3General from './steps/Step3General';
import Step4Accounts from './steps/Step4Accounts';
import Step5Documents from './steps/Step5Documents';
import { admitStudent } from '../actions';
import './admission.css';

interface AdmissionFormProps {
  tenantId: string;
  classes: any[];
  routes: any[];
  allSessions: any[];
  currentSessionName: string;
  nextAdmissionNumber: string;
}

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'];
const MEDIUMS = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];
const FEE_GROUPS = ['General Group', 'Group A', 'Group B', 'Group C', 'RTE', 'Staff Ward'];

export default function AdmissionForm({ 
  tenantId, classes, routes, allSessions, currentSessionName, nextAdmissionNumber 
}: AdmissionFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });
  
  const [formData, setFormData] = useState({
    // Step 1
    academicYear: currentSessionName,
    registrationNumber: `REG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    admissionNumber: nextAdmissionNumber,
    admissionDate: new Date().toISOString().split('T')[0],
    fullName: '',
    username: '',
    password: '',
    dob: '',
    gender: '',
    rollNumber: '',
    bloodGroup: '',
    nationalId: '',
    penNumber: '',
    samagraId: '',
    apaarId: '',
    udiseId: '',
    height: '',
    weight: '',
    studentPhoto: null,

    // Step 2
    motherName: '',
    motherOccupation: '',
    motherQualification: '',
    motherEmail: '',
    motherAadhaar: '',
    motherIncome: '',
    motherContact: '',
    fatherName: '',
    fatherOccupation: '',
    fatherQualification: '',
    fatherEmail: '',
    fatherAadhaar: '',
    fatherIncome: '',
    fatherContact: '',
    motherTongue: '',
    ewsStatus: 'no',
    singleGirlChild: 'no',
    divyangStatus: 'no',
    permStreet: '',
    permLandmark: '',
    permArea: '',
    permCity: '',
    permState: '',
    permCountry: 'India',
    permPincode: '',
    sameAsPermanent: false,
    localStreet: '',
    localLandmark: '',
    localArea: '',
    localCity: '',
    localState: '',
    localCountry: 'India',
    localPincode: '',
    village: '',
    post: '',
    policeStation: '',
    wardNumber: '',

    // Step 3
    classId: '',
    admissionSession: '2025-26',
    medium: 'English',
    religion: 'Hindu',
    category: 'General',
    caste: '',
    areaType: 'urban',
    medicalHistory: '',
    prevSchoolName: '',
    affiliatedTo: '',
    prevSchoolAddress: '',
    lastClassAttended: '',
    prevResult: '',
    tcNumber: '',
    tcDate: '',
    transportRouteId: '',
    transportStop: '',
    hostelName: '',
    roomNumber: '',
    bedNumber: '',

    // Step 4
    bankAccountNumber: '',
    ifscCode: '',
    feeGroup: 'General Group',
    feeIdConcession: '',
    monthlyFeeDiscount: '',
    transportDiscount: '',

    // Step 5
    docBirthCertificate: null,
    docTransferCertificate: null,
    docStudentPhoto: null,
    docFatherPhoto: null,
    docMotherPhoto: null,
    docIncomeCert: null,
    docEwsCert: null,
    docCasteCert: null,
  });

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem(`admission_draft_${tenantId}`);
    if (draft) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(draft) }));
        showToast('Draft loaded successfully');
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, [tenantId]);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`admission_draft_${tenantId}`, JSON.stringify(formData));
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, tenantId]);

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      showToast(`Step ${currentStep} saved as draft`);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveAll = () => {
    localStorage.setItem(`admission_draft_${tenantId}`, JSON.stringify(formData));
    showToast('All progress saved to local draft');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await admitStudent(tenantId, formData);
      if (result.success) {
        localStorage.removeItem(`admission_draft_${tenantId}`);
        showToast('Student admitted successfully!');
        setTimeout(() => router.push(`/school/${tenantId}/students`), 2000);
      } else {
        showToast(result.error || 'Failed to admit student');
      }
    } catch (error) {
      console.error(error);
      showToast('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Personal formData={formData} setFormData={setFormData} allSessions={allSessions} bloodGroups={BLOOD_GROUPS} />;
      case 2: return <Step2Contact formData={formData} setFormData={setFormData} states={STATES} />;
      case 3: return <Step3General formData={formData} setFormData={setFormData} classes={classes} allSessions={allSessions} routes={routes} religions={RELIGIONS} categories={CATEGORIES} mediums={MEDIUMS} />;
      case 4: return <Step4Accounts formData={formData} setFormData={setFormData} feeGroups={FEE_GROUPS} />;
      case 5: return <Step5Documents formData={formData} setFormData={setFormData} />;
      default: return null;
    }
  };

  return (
    <div className="admission-wizard">
      <div className="page-header">
        <div className="page-title">
          <i className="ti ti-user-plus"></i>
          Student Admission Form
          <span className="auto-badge"><i className="ti ti-calendar" style={{ fontSize: '11px' }}></i> {formData.academicYear}</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => router.push(`/school/${tenantId}/students`)}><i className="ti ti-eye"></i> View Students</button>
          <button className="btn btn-outline" onClick={() => window.print()}><i className="ti ti-printer"></i> Print Form</button>
          <button className="btn btn-save" onClick={handleSaveAll} disabled={isSubmitting}><i className="ti ti-device-floppy"></i> Save All</button>
        </div>
      </div>

      <div className="form-card">
        <div className="stepper">
          {[
            { n: 1, icon: 'ti-user', label: 'Personal Details' },
            { n: 2, icon: 'ti-address-book', label: 'Contact Info' },
            { n: 3, icon: 'ti-clipboard-list', label: 'General Details' },
            { n: 4, icon: 'ti-credit-card', label: 'Accounts Info' },
            { n: 5, icon: 'ti-file-upload', label: 'Document Upload' },
          ].map(step => (
            <div 
              key={step.n} 
              className={`step-item ${currentStep === step.n ? 'active' : ''} ${currentStep > step.n ? 'completed' : ''}`}
              onClick={() => setCurrentStep(step.n)}
            >
              <div className="step-num"><i className={`ti ${step.icon}`} style={{ fontSize: '14px' }}></i></div>
              <div className="step-label" dangerouslySetInnerHTML={{ __html: step.label.replace(' ', '<br>') }}></div>
            </div>
          ))}
        </div>

        <div className="form-body">
          {renderStep()}
        </div>

        <div className="form-footer">
          <div className="footer-left">
            {currentStep > 1 && (
              <button className="btn btn-outline" onClick={handlePrev}><i className="ti ti-arrow-left"></i> Previous</button>
            )}
          </div>
          <div className="draft-note">
            <i className="ti ti-clock" style={{ fontSize: '13px' }}></i> 
            Auto saved as draft
          </div>
          <div className="footer-right">
            <button className="btn btn-outline" onClick={handleSaveAll}><i className="ti ti-device-floppy"></i> Save All</button>
            <button 
              className={`btn ${currentStep === 5 ? 'btn-orange' : 'btn-teal'}`} 
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {currentStep === 5 ? (isSubmitting ? 'Submitting...' : 'Submit Admission') : 'Next'} 
              {currentStep < 5 && <i className="ti ti-arrow-right"></i>}
              {currentStep === 5 && !isSubmitting && <i className="ti ti-check"></i>}
            </button>
          </div>
        </div>
      </div>

      {toast.show && (
        <div className="toast show" style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--gray-800)', color: '#fff', padding: '10px 16px', borderRadius: 'var(--radius)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-md)', zIndex: 1000, opacity: 1, transform: 'translateY(0)', transition: 'all 0.3s' }}>
          <i className="ti ti-circle-check" style={{ color: '#10b981' }}></i> 
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
