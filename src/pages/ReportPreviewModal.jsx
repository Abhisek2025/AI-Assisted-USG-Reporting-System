// src/pages/ReportPreviewModal.jsx
import React from 'react';
import { X, Download, ShieldCheck, Printer } from 'lucide-react';

export default function ReportPreviewModal({ isOpen, onClose, reportData, onDownloadPDF }) {
  if (!isOpen || !reportData) return null;

  const { report, patient, study, radiologist, center } = reportData;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 overflow-hidden my-8">
        
        {/* Top Control Bar */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">Diagnostic Ultrasound Medical Report Preview</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onDownloadPDF}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formal Printable Document Canvas */}
        <div className="p-8 text-gray-900 space-y-6 text-xs bg-white font-sans border border-gray-100">
          
          {/* Header Banner */}
          <div className="border-b-2 border-blue-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-lg font-black text-blue-950 uppercase tracking-tight">
                {center?.name || 'APEX ADVANCED DIAGNOSTIC & IMAGING CENTER'}
              </h1>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {center?.address || '452 Healthcare Boulevard, Medical District'} | Phone: {center?.phone || '+1-800-555-USG1'}
              </p>
              <p className="text-[10px] text-blue-700 font-semibold mt-1">Accredited Ultrasound & Imaging Laboratory</p>
            </div>
            <div className="text-right">
              <span className="bg-blue-900 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                USG EXAMINATION
              </span>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-3 gap-4 text-[11px]">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Patient Name</p>
              <p className="font-bold text-gray-900 text-xs">{patient?.first_name} {patient?.last_name}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">UHID</p>
              <p className="font-mono font-bold text-blue-700 text-xs">{patient?.uhid}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Age / Gender</p>
              <p className="font-bold text-gray-900">{patient?.age} Yrs / {patient?.gender}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Study Code</p>
              <p className="font-mono text-gray-800">{study?.study_code}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">USG Study Type</p>
              <p className="font-semibold text-gray-900">{study?.study_type} ({study?.body_region})</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Referring Doctor</p>
              <p className="text-gray-800">{study?.referring_doctor || 'Self / OPD'}</p>
            </div>
          </div>

          {/* Technique */}
          <div>
            <h3 className="font-bold text-blue-900 text-xs uppercase mb-1">Clinical Indication & Technique</h3>
            <p className="text-gray-700 text-xs leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              {report?.technique || 'Real-time grey scale B-mode ultrasound examination was performed using a high-resolution 3.5 - 5.0 MHz transducer.'}
            </p>
          </div>

          {/* Detailed Findings */}
          <div>
            <h3 className="font-bold text-blue-900 text-xs uppercase mb-2">Ultrasound Findings</h3>
            <div className="whitespace-pre-line text-gray-800 text-xs leading-relaxed font-mono bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              {report?.findings_text || 'No findings recorded.'}
            </div>
          </div>

          {/* Impression Box */}
          <div className="bg-blue-50/80 border-2 border-blue-900/30 rounded-xl p-4 space-y-1">
            <h3 className="font-bold text-blue-900 text-xs uppercase">IMPRESSION</h3>
            <p className="whitespace-pre-line text-gray-900 font-bold text-xs leading-relaxed font-mono">
              {report?.impression || 'Normal Ultrasound Examination.'}
            </p>
          </div>

          {/* Verification Signature Footer */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-between text-[11px]">
            <div>
              <p className="text-[10px] text-gray-400 font-mono">Digital Code: {report?.verification_code || 'APX-USG-VERIFIED'}</p>
              <p className="text-[10px] text-gray-400">Generated by Apex USG Reporting System</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-blue-950 text-xs">Digitally Signed By:</p>
              <p className="font-bold text-gray-900">{radiologist?.name || 'Dr. Sarah Jenkins'}</p>
              <p className="text-gray-600">{radiologist?.qualification || 'MD Radiodiagnosis'}</p>
              <p className="text-gray-500 font-mono text-[10px]">Reg: {radiologist?.registration_number || 'RAD-2024-8890'}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
