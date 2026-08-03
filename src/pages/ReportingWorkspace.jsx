// src/pages/ReportingWorkspace.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import USGImageViewer from '../components/USGImageViewer';
import ReportPreviewModal from './ReportPreviewModal';
import { generateReportPDF } from '../utils/ReportPDFGenerator';
import { useSocket } from '../context/SocketContext';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Save,
  ShieldCheck,
  History,
  Download,
  Eye,
  Check,
  X,
  Edit3,
  Sparkles,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CLINICAL_TEMPLATES = {
  'Abdomen': {
    findings: 'LIVER: Normal size (14.8 cm) and homogeneous echotexture. No focal hepatic lesion or biliary dilation.\nGALLBLADDER: Well distended with normal wall thickness (2.2 mm). Clear lumen without calculus or sludge.\nCOMMON BILE DUCT: 3.6 mm, normal caliber.\nPANCREAS: Head, body and tail visualised normal.\nSPLEEN: Normal in size (9.5 cm) and echotexture.\nKIDNEYS: Both kidneys are normal in size, position, and shape with preserved corticomedullary differentiation.',
    impression: '1. Unremarkable Upper Abdomen Ultrasound Examination.\n2. Normal Liver, Gallbladder, Pancreas, Spleen and Kidneys.'
  },
  'Cholelithiasis': {
    findings: 'LIVER: Mildly increased parenchymal echogenicity consistent with Grade I Fatty Liver.\nGALLBLADDER: Single 4.5 mm hyperechoic mobile calculus in lumen casting clear posterior acoustic shadowing. Wall thickness is normal (2.1 mm). No pericholecystic fluid.\nCBD: 3.8 mm, normal.\nSPLEEN & KIDNEYS: Normal.',
    impression: '1. Mild Hepatic Steatosis (Grade I Fatty Liver).\n2. Single Gallbladder Calculus (Cholelithiasis) without signs of acute cholecystitis.'
  },
  'Renal Calculus': {
    findings: 'RIGHT KIDNEY: Normal size (10.2 cm). Hyperechoic focus measuring 5.8 mm with distal acoustic shadowing noted in the lower pole calyx. Mild calyceal prominence.\nLEFT KIDNEY: Normal size (10.6 cm) and echotexture without calculus or hydronephrosis.\nBLADDER: Well distended with clean lumen.',
    impression: '1. Right Lower Pole Renal Calculus (5.8 mm).\n2. Unremarkable Left Kidney & Urinary Bladder.'
  },
  'Obstetric 22W': {
    findings: 'SINGLE LIVE INTRAUTERINE FETUS in cephalic presentation.\nFETAL BIOMETRY:\n- Biparietal Diameter (BPD): 54 mm (~22w 3d)\n- Femur Length (FL): 38 mm (~22w 2d)\n- Heart Rate: 144 bpm, regular rhythm.\nPLACENTA: Anterior Grade I placenta, well clear of internal os.\nLIQUOR: Adequate (AFI = 14.5 cm).',
    impression: 'Single live intrauterine fetus corresponding to 22 weeks 3 days gestational age with normal fetal biometry and AFI.'
  }
};

export default function ReportingWorkspace() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lastEvent } = useSocket();

  const [studyData, setStudyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activeTab, setActiveTab] = useState('findings');

  // Report Form State
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [technique, setTechnique] = useState('');
  const [findingsText, setFindingsText] = useState('');
  const [impression, setImpression] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [aiFindings, setAiFindings] = useState([]);
  const [reportStatus, setReportStatus] = useState('DRAFT');

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    fetchWorkspaceData();
  }, [studyId]);

  // Real-time listener for study or image updates
  useEffect(() => {
    if (lastEvent && (
      lastEvent.type === 'STUDY_MUTATED' ||
      lastEvent.type === 'REPORT_MUTATED' ||
      lastEvent.type === 'IMAGES_UPLOADED'
    )) {
      fetchWorkspaceData();
    }
  }, [lastEvent]);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/studies/${studyId}`);
      if (res.data.success) {
        const d = res.data.data;
        setStudyData(d);
        setAiFindings(d.ai_findings || []);

        if (d.report) {
          setClinicalIndication(d.report.clinical_indication || d.study?.clinical_indication || d.clinical_indication || '');
          setTechnique(d.report.technique || '');
          setFindingsText(d.report.findings_text || '');
          setImpression(d.report.impression || '');
          setRecommendations(d.report.recommendations || '');
          setReportStatus(d.report.status);
        } else {
          setClinicalIndication(d.study?.clinical_indication || d.clinical_indication || '');
          setTechnique(`Real-time grey scale B-mode ultrasound examination of the ${d.study?.body_region || d.body_region || 'body'} was performed using a high-resolution 3.5 - 5.0 MHz transducer.`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFindingStatus = async (findingId, newStatus) => {
    try {
      const res = await api.patch(`/ai/findings/${findingId}/status`, { status: newStatus });
      if (res.data.success) {
        setAiFindings(prev => prev.map(f => f.finding_id === findingId ? { ...f, status: newStatus } : f));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyTemplate = (templateKey) => {
    const tmpl = CLINICAL_TEMPLATES[templateKey];
    if (tmpl) {
      setFindingsText(tmpl.findings);
      setImpression(tmpl.impression);
      toast.info(`Applied "${templateKey}" clinical template`);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setSaveSuccessMsg('');
    try {
      const res = await api.post('/reports/draft', {
        study_id: Number(studyId),
        clinical_indication: clinicalIndication,
        technique,
        findings_text: findingsText,
        impression,
        recommendations
      });
      if (res.data.success) {
        setSaveSuccessMsg('Report draft saved successfully!');
        setReportStatus(res.data.data.status);
        toast.success('Report draft saved successfully!');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save report draft');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveReport = async () => {
    if (!impression.trim()) {
      toast.warning('Please enter an Impression before approving the report.');
      return;
    }

    setApproving(true);
    try {
      // First save draft
      await api.post('/reports/draft', {
        study_id: Number(studyId),
        clinical_indication: clinicalIndication,
        technique,
        findings_text: findingsText,
        impression,
        recommendations
      });

      const reportId = studyData.report?.report_id || 1;
      const res = await api.post(`/reports/${reportId}/approve`);
      if (res.data.success) {
        setReportStatus('APPROVED');
        toast.success('Report approved & digitally signed!');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        fetchWorkspaceData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Approval failed';
      toast.error(msg);
    } finally {
      setApproving(false);
    }
  };

  const handleDownloadPDF = () => {
    generateReportPDF({
      report: {
        findings_text: findingsText,
        impression,
        recommendations,
        technique,
        approved_at: new Date().toISOString(),
        verification_code: studyData?.report?.verification_code || 'APX-USG-VERIFIED'
      },
      patient: studyData?.patient,
      study: studyData?.study,
      radiologist: {
        name: `${user?.first_name} ${user?.last_name}`,
        qualification: user?.qualification || 'MD Radiodiagnosis',
        registration_number: user?.registration_number || 'RAD-2024-8890'
      },
      center: {
        name: 'Apex Advanced Diagnostic & Imaging Center',
        address: '452 Healthcare Boulevard, Medical District',
        phone: '+1-800-555-USG1'
      }
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading Radiologist Diagnostic Reporting Studio...
      </div>
    );
  }

  const { study, patient, images } = studyData || {};

  return (
    <div className="h-[calc(100vh-61px)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Workspace Top Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/worklist')}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">{patient?.first_name} {patient?.last_name}</span>
              <span className="font-mono text-blue-400 text-xs">[{patient?.uhid}]</span>
              <span className="text-slate-400">({patient?.age}y / {patient?.gender})</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Study Code: <span className="font-mono text-slate-200">{study?.study_code}</span> | Type: <span className="text-blue-300 font-semibold">{study?.study_type}</span> ({study?.body_region})
            </p>
          </div>
        </div>

        {/* Status Badge & Primary Action Bar */}
        <div className="flex items-center space-x-3">
          {reportStatus === 'APPROVED' ? (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-bold text-xs flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Digitally Approved & Signed</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full font-bold text-xs flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Report Draft Mode</span>
            </span>
          )}

          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Report</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving || reportStatus === 'APPROVED'}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleApproveReport}
            disabled={approving || reportStatus === 'APPROVED'}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{approving ? 'Signing...' : 'Approve & Sign Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Workstation Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* LEFT COLUMN: Interactive USG DICOM Canvas Image Viewer (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 p-2 border-r border-slate-800 flex flex-col h-full overflow-hidden">
          <USGImageViewer images={images || []} />
        </div>

        {/* RIGHT COLUMN: Radiologist Findings & Report Structured Editor (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 flex flex-col h-full overflow-y-auto p-4 space-y-4">
          
          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Prominent AI Disclaimer Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Human-in-the-Loop AI Medical Assistance</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                AI-generated draft — not a final diagnosis. Radiologist review required.
              </p>
            </div>
          </div>

          {/* AI Findings Interactive Cards */}
          {aiFindings.length > 0 && (
            <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>AI Computer Vision Analysis (Review & Confirm)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Model v1.4.2</span>
              </div>

              <div className="space-y-2">
                {aiFindings.map((f, idx) => (
                  <div key={f.finding_id ? `finding-${f.finding_id}-${idx}` : `finding-${idx}`} className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400">{f.organ}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-slate-400 font-mono mr-2">
                          Confidence: {Math.round((f.confidence || 0.88) * 100)}%
                        </span>

                        <button
                          onClick={() => handleUpdateFindingStatus(f.finding_id, 'ACCEPTED')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            f.status === 'ACCEPTED' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Check className="w-3 h-3 inline mr-0.5" /> Accept
                        </button>

                        <button
                          onClick={() => handleUpdateFindingStatus(f.finding_id, 'REJECTED')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            f.status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <X className="w-3 h-3 inline mr-0.5" /> Reject
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed">{f.observation}</p>
                    {f.measurement && f.measurement !== 'N/A' && (
                      <p className="text-[10px] font-mono text-amber-400">Measurement: {f.measurement}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto-Template Shortcuts */}
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="font-bold text-slate-400">Quick Clinical Templates:</span>
            <button onClick={() => handleApplyTemplate('Abdomen')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-medium">
              Normal Abdomen
            </button>
            <button onClick={() => handleApplyTemplate('Cholelithiasis')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-medium">
              Cholelithiasis
            </button>
            <button onClick={() => handleApplyTemplate('Renal Calculus')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-medium">
              Renal Calculus
            </button>
            <button onClick={() => handleApplyTemplate('Obstetric 22W')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-medium">
              Obstetric 22W
            </button>
          </div>

          {/* Systematic Findings Editor */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">Detailed Ultrasound Findings *</label>
            <textarea
              rows={8}
              value={findingsText}
              onChange={e => setFindingsText(e.target.value)}
              placeholder="Enter organ-by-organ ultrasound observations..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Impression Editor */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-blue-400">Diagnostic Impression *</label>
            <textarea
              rows={3}
              value={impression}
              onChange={e => setImpression(e.target.value)}
              placeholder="1. Summary of primary ultrasound diagnosis..."
              className="w-full p-3 bg-slate-950 border border-blue-900/60 rounded-xl text-xs text-blue-200 font-mono font-bold leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recommendations */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">Recommendations / Clinical Correlation</label>
            <input
              type="text"
              value={recommendations}
              onChange={e => setRecommendations(e.target.value)}
              placeholder="Clinical correlation and routine follow-up recommended."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Radiologist Verification Signature Block */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200">Digital Signature Verification</p>
              <p className="text-[11px] text-slate-400">{user?.first_name} {user?.last_name} ({user?.qualification || 'MD Radiodiagnosis'})</p>
              <p className="text-[10px] text-blue-400 font-mono mt-0.5">Medical Reg No: {user?.registration_number || 'RAD-2024-8890'}</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>

        </div>

      </div>

      {/* Report Preview Modal */}
      <ReportPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        reportData={{
          report: {
            findings_text: findingsText,
            impression,
            recommendations,
            technique,
            approved_at: new Date().toISOString(),
            verification_code: studyData?.report?.verification_code || 'APX-USG-VERIFIED'
          },
          patient: studyData?.patient,
          study: studyData?.study,
          radiologist: {
            name: `${user?.first_name} ${user?.last_name}`,
            qualification: user?.qualification || 'MD Radiodiagnosis',
            registration_number: user?.registration_number || 'RAD-2024-8890'
          },
          center: {
            name: 'Apex Advanced Diagnostic & Imaging Center',
            address: '452 Healthcare Boulevard, Medical District',
            phone: '+1-800-555-USG1'
          }
        }}
        onDownloadPDF={handleDownloadPDF}
      />

    </div>
  );
}
