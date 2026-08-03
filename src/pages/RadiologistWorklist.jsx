// src/pages/RadiologistWorklist.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardCheck,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileEdit,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function RadiologistWorklist() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lastEvent } = useSocket();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prioParam = params.get('priority');
    if (prioParam) setPriorityFilter(prioParam);

    fetchWorklist();
  }, [location.search, priorityFilter, statusFilter]);

  // Real-time listener for assigned studies & new uploads
  useEffect(() => {
    if (lastEvent && (
      lastEvent.type === 'STUDY_MUTATED' ||
      lastEvent.type === 'STUDY_CREATED' ||
      lastEvent.type === 'REPORT_MUTATED' ||
      lastEvent.type === 'IMAGES_UPLOADED'
    )) {
      fetchWorklist();
    }
  }, [lastEvent]);

  const fetchWorklist = async () => {
    try {
      setLoading(true);
      let url = `/studies?search=${encodeURIComponent(search)}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (user?.role_name === 'RADIOLOGIST') {
        url += `&radiologist_id=${user.user_id}`;
      }

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

  const urgentCount = studies.filter(s => (s.priority === 'URGENT' || s.priority === 'EMERGENCY') && s.status !== 'APPROVED').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            CLINICAL WORKLIST
          </span>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Radiologist Diagnostic Queue</h1>
          <p className="text-xs text-gray-500 mt-0.5">Assigned ultrasound studies awaiting review, finding modification, and approval signature</p>
        </div>

        {urgentCount > 0 && (
          <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-xl flex items-center space-x-2 text-red-800 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
            <span>{urgentCount} Urgent / Emergency Case(s) Action Needed</span>
          </div>
        )}
      </div>

      {/* Worklist Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assigned patient, UHID or study code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg font-semibold"
          >
            <option value="">All Priorities</option>
            <option value="NORMAL">NORMAL</option>
            <option value="URGENT">URGENT</option>
            <option value="EMERGENCY">EMERGENCY</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg"
          >
            <option value="">All Review Statuses</option>
            <option value="AI_COMPLETED">AI Draft Ready</option>
            <option value="IMAGE_UPLOADED">Images Uploaded</option>
            <option value="REPORT_DRAFTED">Report Drafted</option>
            <option value="APPROVED">Approved & Signed</option>
          </select>

          <button onClick={fetchWorklist} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Worklist Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-500">Loading radiologist queue...</p>
        ) : studies.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500">No studies currently assigned to your worklist.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-slate-900 text-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Patient Details</th>
                  <th className="px-6 py-3.5">Study Code & Type</th>
                  <th className="px-6 py-3.5">Clinical Indication</th>
                  <th className="px-6 py-3.5">AI Status</th>
                  <th className="px-6 py-3.5 text-right">Reporting Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studies.map((s) => (
                  <tr key={s.study_id} className={`hover:bg-blue-50/40 transition-colors ${s.priority === 'EMERGENCY' ? 'bg-red-50/20' : ''}`}>
                    
                    <td className="px-6 py-4">
                      {s.priority === 'EMERGENCY' ? (
                        <span className="px-2.5 py-1 text-[10px] font-black bg-red-600 text-white rounded-full">EMERGENCY</span>
                      ) : s.priority === 'URGENT' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">URGENT</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-full">NORMAL</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{s.patient_name}</p>
                      <p className="text-[10px] text-blue-600 font-mono">{s.patient_uhid} ({s.patient_age}y/{s.patient_gender})</p>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      <p className="font-bold text-slate-900">{s.study_code}</p>
                      <p className="text-[10px] text-gray-500 font-sans">{s.study_type} — {s.body_region}</p>
                    </td>

                    <td className="px-6 py-4 max-w-xs text-gray-700 truncate">
                      {s.clinical_indication}
                    </td>

                    <td className="px-6 py-4">
                      {s.status === 'AI_COMPLETED' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          <Cpu className="w-3 h-3 text-emerald-600" />
                          <span>AI Draft Ready</span>
                        </span>
                      ) : s.status === 'APPROVED' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded">
                          {s.status}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/workspace/${s.study_id}`)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-1.5"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Open Workspace</span>
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
