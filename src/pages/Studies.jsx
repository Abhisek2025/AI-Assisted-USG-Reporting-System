// src/pages/Studies.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CreateStudyModal from '../components/CreateStudyModal';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Upload,
  Cpu,
  FileEdit,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Studies() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { lastEvent } = useSocket();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const patientParam = params.get('patient_id');
    const priorityParam = params.get('priority');

    if (searchParam) setSearch(searchParam);
    if (priorityParam) setPriorityFilter(priorityParam);

    fetchStudies(patientParam);
  }, [location.search, statusFilter, priorityFilter]);

  // Real-time auto-refresh on socket events
  useEffect(() => {
    if (lastEvent && (
      lastEvent.type === 'STUDY_MUTATED' ||
      lastEvent.type === 'STUDY_CREATED' ||
      lastEvent.type === 'REPORT_MUTATED' ||
      lastEvent.type === 'IMAGES_UPLOADED'
    )) {
      const params = new URLSearchParams(location.search);
      fetchStudies(params.get('patient_id') || '');
    }
  }, [lastEvent]);

  const fetchStudies = async (patientId = '') => {
    try {
      setLoading(true);
      let url = `/studies?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;
      if (patientId) url += `&patient_id=${patientId}`;

      const res = await api.get(url);
      if (res.data.success) {
        setStudies(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityTag = (p) => {
    switch (p) {
      case 'EMERGENCY':
        return <span className="px-2 py-0.5 text-[10px] font-black bg-red-100 text-red-800 rounded-full animate-pulse">EMERGENCY</span>;
      case 'URGENT':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">URGENT</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-full">NORMAL</span>;
    }
  };

  const getStatusTag = (s) => {
    switch (s) {
      case 'REGISTERED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700 rounded">Registered</span>;
      case 'IMAGE_UPLOADED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded">Images Uploaded</span>;
      case 'AI_PROCESSING':
        return <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-800 rounded animate-pulse">AI Processing</span>;
      case 'AI_COMPLETED':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">AI Draft Ready</span>;
      case 'REPORT_DRAFTED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-800 rounded">Report Drafted</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded">Approved</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded">{s}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ultrasound (USG) Study Directory</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage study registrations, image uploads, AI analysis & radiologist assignments</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New USG Study</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Study Code, Patient name or UHID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="NORMAL">NORMAL</option>
            <option value="URGENT">URGENT</option>
            <option value="EMERGENCY">EMERGENCY</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="REGISTERED">REGISTERED</option>
            <option value="IMAGE_UPLOADED">IMAGE_UPLOADED</option>
            <option value="AI_COMPLETED">AI_COMPLETED</option>
            <option value="REPORT_DRAFTED">REPORT_DRAFTED</option>
            <option value="APPROVED">APPROVED</option>
          </select>

          <button onClick={() => fetchStudies()} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Studies Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-500">Loading USG studies queue...</p>
        ) : studies.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500">No studies found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Study Code</th>
                  <th className="px-6 py-3.5">Patient Details</th>
                  <th className="px-6 py-3.5">Type & Region</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Assigned Radiologist</th>
                  <th className="px-6 py-3.5">Images & Status</th>
                  <th className="px-6 py-3.5 text-right">Workspace Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studies.map((s) => (
                  <tr key={s.study_id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {s.study_code}
                      <p className="text-[10px] text-gray-400 font-normal">
                        {new Date(s.study_date).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{s.patient_name}</p>
                      <p className="text-[10px] text-blue-600 font-mono">{s.patient_uhid} ({s.patient_age}y/{s.patient_gender})</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{s.study_type}</p>
                      <p className="text-[10px] text-gray-500">{s.body_region}</p>
                    </td>

                    <td className="px-6 py-4">
                      {getPriorityTag(s.priority)}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-800">
                      Dr. {s.radiologist_name}
                    </td>

                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-gray-500">[{s.images_count} Frames]</span>
                        {getStatusTag(s.status)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      {s.images_count === 0 ? (
                        <button
                          onClick={() => navigate(`/upload?study_id=${s.study_id}`)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center space-x-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Frames</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/workspace/${s.study_id}`)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-1"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Reporting Studio</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Study Modal */}
      <CreateStudyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStudyCreated={(newStudy) => {
          fetchStudies();
        }}
      />

    </div>
  );
}
