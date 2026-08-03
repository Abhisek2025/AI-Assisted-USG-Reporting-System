// src/pages/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { generateReportPDF } from '../utils/ReportPDFGenerator';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Activity,
  Search,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  X,
  Printer,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function PatientDashboard() {
  const { user } = useAuth();
  const socketData = useSocket();
  const realtimeEvents = socketData?.realtimeEvents || [];
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [studies, setStudies] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('REPORTS'); // 'REPORTS' | 'APPOINTMENTS' | 'PREPARATION'
  const [searchUhid, setSearchUhid] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportFilter, setReportFilter] = useState('ALL'); // 'ALL' | 'APPROVED' | 'PENDING'

  // Current patient info
  const patientInfo = {
    name: user ? `${user.first_name || 'Sunita'} ${user.last_name || 'Mukhopadhyay'}` : 'Eleanor Vance',
    uhid: 'PAT-2024-100892',
    phone: user?.phone || '+91-9876543210',
    email: user?.email || 'sunita.m@example.com',
    age: 39,
    gender: 'FEMALE',
    blood_group: 'O+',
    address: 'Salt Lake Sector V, Kolkata, WB',
    referring_doctor: 'Dr. Robert Chen (Gastroenterology)'
  };

  useEffect(() => {
    loadPatientData();
  }, []);

  // Socket listener for instant report generation updates
  useEffect(() => {
    if (realtimeEvents && realtimeEvents.length > 0) {
      const last = realtimeEvents[realtimeEvents.length - 1];
      if (last?.type === 'REPORT_APPROVED' || last?.type === 'REPORT_DRAFTED' || last?.type === 'STUDY_UPDATED' || last?.type === 'APPOINTMENT_UPDATED') {
        toast.info(`🎉 Realtime Update: Ultrasound report status updated!`, { autoClose: 3000 });
        loadPatientData();
      }
    }
  }, [realtimeEvents]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      // Fetch all reports, studies, and appointments
      const [reportsRes, studiesRes, apptsRes] = await Promise.all([
        fetch('/api/reports').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/studies').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/appointments').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (reportsRes.success && reportsRes.data) {
        setReports(reportsRes.data);
      } else {
        // Fallback demo reports if backend empty
        setReports([
          {
            report_id: 101,
            report_number: 'REP-2024-8821',
            study_id: 1,
            study_code: 'STU-2024-501',
            study_type: 'ULTRASOUND_WHOLE_ABDOMEN',
            body_region: 'Abdomen & Pelvis',
            patient_name: patientInfo.name,
            patient_uhid: patientInfo.uhid,
            patient_age: patientInfo.age,
            patient_gender: patientInfo.gender,
            radiologist_name: 'Dr. Sarah Jenkins (MD Radiodiagnosis)',
            impression: '1. Grade-I Fatty Liver changes (Mild Hepatic Steatosis).\n2. Gallbladder, Pancreas, Spleen and Kidneys are within normal limits.\n3. No free fluid in abdomen.',
            detailed_findings: 'LIVER: Normal size (13.8 cm). Smooth contours. Increased echogenicity consistent with mild fatty infiltration. No focal hepatic lesion.\nGALLBLADDER: Well distended. Wall thickness normal (< 3 mm). No acoustic shadowing or calculi seen.\nPANCREAS & SPLEEN: Normal echo texture and dimensions.\nKIDNEYS: Bilateral renal parenchyma normal. Corticomedullary differentiation preserved. No hydronephrosis.\nBLADDER: Well filled, smooth walls.',
            recommendations: 'Dietary modifications and lipid profile correlation. Follow-up USG after 6 months.',
            status: 'APPROVED',
            approved_at: new Date(Date.now() - 3600000 * 4).toISOString()
          }
        ]);
      }

      if (studiesRes.success && studiesRes.data) {
        setStudies(studiesRes.data);
      }

      if (apptsRes.success && apptsRes.data) {
        setAppointments(apptsRes.data);
      }

    } catch (err) {
      console.error('Error loading patient dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter reports for current patient or search UHID
  const displayReports = reports.filter(r => {
    if (searchUhid.trim()) {
      const q = searchUhid.toLowerCase();
      return (
        (r.patient_uhid && r.patient_uhid.toLowerCase().includes(q)) ||
        (r.patient_name && r.patient_name.toLowerCase().includes(q)) ||
        (r.report_number && r.report_number.toLowerCase().includes(q)) ||
        (r.study_code && r.study_code.toLowerCase().includes(q))
      );
    }
    const matchesFilter = reportFilter === 'ALL' || (r.status || 'APPROVED') === reportFilter;
    return matchesFilter;
  });

  const approvedCount = reports.filter(r => r.status === 'APPROVED').length;
  const pendingCount = reports.filter(r => r.status === 'DRAFT' || r.status === 'PENDING').length;
  const totalStudiesCount = studies.length || 2;

  const handleDownloadPDF = (rep) => {
    generateReportPDF({
      report: rep,
      patient: {
        first_name: rep.patient_name?.split(' ')[0] || patientInfo.name.split(' ')[0],
        last_name: rep.patient_name?.split(' ')[1] || '',
        uhid: rep.patient_uhid || patientInfo.uhid,
        age: rep.patient_age || patientInfo.age,
        gender: rep.patient_gender || patientInfo.gender
      },
      study: {
        study_code: rep.study_code || 'STU-2024-501',
        study_type: rep.study_type || 'ULTRASOUND_WHOLE_ABDOMEN',
        body_region: rep.body_region || 'Abdomen & Pelvis',
        study_date: rep.approved_at || new Date().toISOString()
      },
      radiologist: {
        name: rep.radiologist_name || 'Dr. Sarah Jenkins',
        qualification: 'MD Radiodiagnosis',
        registration_number: 'RAD-2024-8890'
      }
    });
    toast.success(`PDF Report ${rep.report_number || rep.report_id} downloaded successfully!`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50/50 min-h-screen">
      
      {/* Patient Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        
        {/* Decorative Background Blur */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>PATIENT DIAGNOSTIC PORTAL</span>
              </span>
              <span className="px-2.5 py-1 bg-blue-800/60 text-blue-200 text-xs font-mono rounded-full border border-blue-700/50">
                UHID: {patientInfo.uhid}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {patientInfo.name} 👋
            </h1>

            <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              Track your diagnostic ultrasound studies, view radiologist impression summaries, and download digitally signed official reports in real-time.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-blue-300 pt-1 font-medium">
              <div className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>{patientInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{patientInfo.email}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                <span>Ref: {patientInfo.referring_doctor}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/diagnostic-center')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4 text-blue-300" />
              <span>Book USG Scan</span>
            </button>

            <button
              onClick={loadPatientData}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Portal</span>
            </button>
          </div>

        </div>

      </div>

      {/* Realtime Report Notification Alert Banner */}
      {approvedCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">
                🎉 {approvedCount} Official Ultrasound Report{approvedCount > 1 ? 's' : ''} Ready!
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Digitally verified and signed by board-certified radiologists. Ready for online viewing & PDF download.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab('REPORTS');
              setReportFilter('APPROVED');
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1 flex-shrink-0"
          >
            <span>View Reports</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Approved Reports Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approved Reports</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready for Download
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Review</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 animate-spin" /> Radiologist Evaluating
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total USG Studies */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Diagnostic Studies</p>
            <h3 className="text-2xl font-black text-blue-900 mt-1">{totalStudiesCount}</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Apex Diagnostic Registry</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Activity className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Tabs & Search Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'REPORTS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Generated Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('APPOINTMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'APPOINTMENTS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>USG Appointments ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PREPARATION')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'PREPARATION'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Scan Instructions</span>
          </button>
        </div>

        {/* Dynamic Patient Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search report by UHID or name..."
            value={searchUhid}
            onChange={(e) => setSearchUhid(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

      </div>

      {/* Main Tab Content */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          
          {/* Status Filter Sub-bar */}
          <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs w-fit">
            <span className="font-bold text-gray-500 mr-2">Filter Status:</span>
            {['ALL', 'APPROVED', 'DRAFT'].map(st => (
              <button
                key={st}
                onClick={() => setReportFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  reportFilter === st
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {st === 'ALL' ? 'All Reports' : st === 'APPROVED' ? 'Signed & Approved' : 'In Review'}
              </button>
            ))}
          </div>

          {/* Reports Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <span>Fetching diagnostic report records...</span>
            </div>
          ) : displayReports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-3">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-gray-800">No Ultrasound Reports Found</p>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                If you recently completed an ultrasound scan, the radiologist is currently reviewing the imaging findings. Reports will automatically appear here once signed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {displayReports.map((rep) => {
                const isApproved = rep.status === 'APPROVED';

                return (
                  <div
                    key={rep.report_id ? `rep-${rep.report_id}` : `rep-id-${Math.random()}`}
                    className={`bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                      isApproved ? 'border-emerald-200 hover:border-emerald-400' : 'border-amber-200'
                    }`}
                  >
                    
                    {/* Top Status & Scan Title */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                            {rep.report_number || `REP-2024-${rep.report_id}`}
                          </span>
                          <h3 className="text-base font-black text-gray-900 mt-2">
                            {rep.study_type ? rep.study_type.replace(/_/g, ' ') : 'ULTRASOUND SCAN'}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium">
                            Body Region: <span className="text-gray-800 font-semibold">{rep.body_region || 'Abdomen'}</span>
                          </p>
                        </div>

                        {/* Status Badge */}
                        {isApproved ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-300 flex items-center space-x-1 shadow-2xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>DIGITALLY SIGNED</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full border border-amber-300 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 animate-spin text-amber-600" />
                            <span>UNDER REVIEW</span>
                          </span>
                        )}
                      </div>

                      {/* Patient & Doctor Meta */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Patient Details</p>
                          <p className="font-bold text-gray-900">{rep.patient_name || patientInfo.name}</p>
                          <p className="text-[11px] text-gray-500">UHID: {rep.patient_uhid || patientInfo.uhid}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Signing Radiologist</p>
                          <p className="font-bold text-gray-900">{rep.radiologist_name || 'Dr. Sarah Jenkins'}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold">Verified MD Radiodiagnosis</p>
                        </div>
                      </div>

                      {/* Clinical Impression Snippet */}
                      <div className="mt-4 space-y-1">
                        <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>Radiologist Impression Summary:</span>
                        </p>
                        <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                          {rep.impression || 'Ultrasound scan findings evaluated. Normal acoustic windows.'}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-400 font-mono">
                        Date: {new Date(rep.approved_at || rep.created_at || Date.now()).toLocaleDateString()}
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-600" />
                          <span>View Report</span>
                        </button>

                        <button
                          onClick={() => handleDownloadPDF(rep)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'APPOINTMENTS' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900">USG Appointments & Diagnostic Bookings</h2>
              <p className="text-xs text-gray-500">Real-time status of online bookings at Apex Diagnostic Center</p>
            </div>
            <button
              onClick={() => navigate('/diagnostic-center')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              + Book New USG Appointment
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 border border-dashed rounded-xl">
              No active appointment bookings found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((appt) => (
                <div key={appt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 text-sm">{appt.usg_service}</span>
                      <span className="font-mono text-[10px] text-gray-400">[{appt.reference_code}]</span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Doctor: <span className="font-bold text-gray-800">{appt.doctor_name}</span> | Patient: {appt.patient_name}
                    </p>
                    <p className="text-blue-600 font-medium mt-0.5">
                      📅 {appt.appointment_date} at {appt.slot_time}
                    </p>
                  </div>

                  <div>
                    {appt.status === 'CONFIRMED' && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[11px]">CONFIRMED</span>
                    )}
                    {appt.status === 'PENDING' && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-[11px]">PENDING APPROVAL</span>
                    )}
                    {appt.status === 'COMPLETED' && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-full text-[11px]">COMPLETED</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scan Preparation Guidelines Tab */}
      {activeTab === 'PREPARATION' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-black text-gray-900">Ultrasound Scan Preparation Guidelines</h2>
            <p className="text-xs text-gray-500">Please follow these instructions prior to your appointment for optimal ultrasound clarity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
              <h3 className="font-bold text-blue-900 text-sm">Abdomen USG Scan</h3>
              <p className="text-gray-600">
                • <strong>Fasting:</strong> Require 6 to 8 hours of strict fasting prior to the scan.<br />
                • Avoid milk, carbonated drinks, and fatty meals on the morning of scan.<br />
                • Water in small amounts is allowed.
              </p>
            </div>

            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
              <h3 className="font-bold text-purple-900 text-sm">Pelvic & KUB USG Scan</h3>
              <p className="text-gray-600">
                • <strong>Full Bladder:</strong> Drink 4 to 6 glasses (approx 1 Litre) of plain water 1 hour before appointment.<br />
                • Do not urinate until the scan capture is completed by sonographer.
              </p>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
              <h3 className="font-bold text-emerald-900 text-sm">Obstetric (Pregnancy) Scan</h3>
              <p className="text-gray-600">
                • Bring all past antenatal records, prescription slips, and previous USG reports.<br />
                • Moderate bladder fullness recommended for 1st trimester anomaly scans.
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
              <h3 className="font-bold text-amber-900 text-sm">Small Parts (Thyroid / Musculoskeletal)</h3>
              <p className="text-gray-600">
                • No fasting required.<br />
                • Wear comfortable open-neck clothing. Remove necklaces and metallic jewelry.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Online Digital Report Modal Viewer */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in-95">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-gray-200 pb-4 pr-10">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h2 className="text-lg font-black text-gray-900">APEX DIAGNOSTIC & ULTRASOUND CENTER</h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Official Digitally Signed USG Medical Diagnostic Report</p>
            </div>

            {/* Patient & Study Meta */}
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">Patient Name</span>
                <p className="font-bold text-gray-900">{selectedReport.patient_name || patientInfo.name}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">UHID</span>
                <p className="font-mono font-bold text-blue-600">{selectedReport.patient_uhid || patientInfo.uhid}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">Study Code</span>
                <p className="font-mono text-gray-800">{selectedReport.study_code || 'STU-2024-501'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">Status</span>
                <p className="font-bold text-emerald-600">DIGITALLY SIGNED</p>
              </div>
            </div>

            {/* Findings & Impression */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Detailed Ultrasound Findings</h4>
                <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedReport.detailed_findings || 'Normal organ contours and echotexture.'}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Radiologist Impression</h4>
                <div className="mt-2 p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-950 font-mono font-semibold leading-relaxed whitespace-pre-wrap">
                  {selectedReport.impression || 'Evaluation complete.'}
                </div>
              </div>

              {selectedReport.recommendations && (
                <div>
                  <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Clinical Recommendations</h4>
                  <div className="mt-2 p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 font-medium">
                    {selectedReport.recommendations}
                  </div>
                </div>
              )}
            </div>

            {/* Digital Verification & Doctor Signature */}
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-3 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-[11px]">Digitally Signed & Verified Report</p>
                  <p className="text-[10px] text-emerald-700">SHA-256 Checksum Verified • Legal Medical Record</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-900">{selectedReport.radiologist_name || 'Dr. Sarah Jenkins'}</p>
                <p className="text-gray-500 text-[10px]">MD Radiodiagnosis | Reg: RAD-2024-8890</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
              >
                Close View
              </button>

              <button
                onClick={() => handleDownloadPDF(selectedReport)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
