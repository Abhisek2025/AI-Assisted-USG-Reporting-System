// src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { generateReportPDF } from '../utils/ReportPDFGenerator';
import {
  FileText,
  Search,
  Download,
  ShieldCheck,
  Eye,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, [search]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (r) => {
    generateReportPDF({
      report: r,
      patient: {
        first_name: r.patient_name?.split(' ')[0] || 'Patient',
        last_name: r.patient_name?.split(' ')[1] || '',
        uhid: r.patient_uhid,
        age: r.patient_age,
        gender: r.patient_gender
      },
      study: {
        study_code: r.study_code,
        study_type: r.study_type,
        body_region: r.body_region,
        study_date: r.study_date
      },
      radiologist: {
        name: r.radiologist_name,
        qualification: 'MD Radiodiagnosis',
        registration_number: 'RAD-2024-8890'
      }
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-xl font-bold text-gray-900">Ultrasound Report Archive</h1>
        <p className="text-xs text-gray-500 mt-0.5">Search and download digitally signed ultrasound diagnostic reports</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center space-x-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Patient name, UHID, or Study code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
        />
        <button onClick={fetchReports} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Reports Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-500">Loading reports directory...</p>
        ) : reports.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500">No reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Study & Patient</th>
                  <th className="px-6 py-3.5">USG Type</th>
                  <th className="px-6 py-3.5">Signing Radiologist</th>
                  <th className="px-6 py-3.5">Impression Preview</th>
                  <th className="px-6 py-3.5">Approval Date</th>
                  <th className="px-6 py-3.5 text-right">PDF Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((r, idx) => (
                  <tr key={r.report_id ? `rep-${r.report_id}-${idx}` : `rep-${idx}`} className="hover:bg-blue-50/40 transition-colors">
                    
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{r.patient_name}</p>
                      <p className="text-[10px] text-blue-600 font-mono">{r.patient_uhid} | [{r.study_code}]</p>
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {r.study_type}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-800">
                      Dr. {r.radiologist_name}
                    </td>

                    <td className="px-6 py-4 max-w-xs truncate text-gray-700 font-mono text-[11px]">
                      {r.impression}
                    </td>

                    <td className="px-6 py-4 text-gray-500 font-mono">
                      {new Date(r.approved_at || Date.now()).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/workspace/${r.study_id}`)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleDownload(r)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
