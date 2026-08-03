// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PatientDashboard from './PatientDashboard';
import {
  Users,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Activity,
  ArrowUpRight,
  Plus,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('AUTO'); // 'AUTO' | 'STAFF' | 'PATIENT'

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPatientRole = user?.role_name === 'PATIENT';
  const showPatientView = viewMode === 'PATIENT' || (isPatientRole && viewMode !== 'STAFF');

  if (showPatientView) {
    return (
      <div className="space-y-4">
        {/* Toggle header for staff testing */}
        {!isPatientRole && (
          <div className="bg-amber-50 border border-amber-200 px-6 py-2.5 rounded-xl max-w-7xl mx-auto flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Viewing Patient Dashboard Mode (Staff Preview)</span>
            </span>
            <button
              onClick={() => setViewMode('STAFF')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all"
            >
              Return to Staff Workstation
            </button>
          </div>
        )}
        <PatientDashboard />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-slate-500">
          <Activity className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-sm font-semibold">Loading Diagnostic Dashboard...</span>
        </div>
      </div>
    );
  }

  const m = stats?.metrics || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-blue-800/40">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-800/50 px-2.5 py-1 rounded-full border border-blue-700/50">
            {user?.role_name || 'STAFF'} WORKSTATION
          </span>
          <h1 className="text-2xl font-bold mt-2">Welcome, {user?.first_name} {user?.last_name}</h1>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            Real-time USG study queue & AI draft finding engine. Apex Diagnostic Center station is fully operational.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('PATIENT')}
            className="px-3.5 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md border border-emerald-400/30 transition-all flex items-center space-x-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Patient Portal View</span>
          </button>

          {user?.role_name === 'RADIOLOGIST' && (
            <button
              onClick={() => navigate('/worklist')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center space-x-2"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Open Radiologist Worklist</span>
            </button>
          )}

          {(user?.role_name === 'RECEPTIONIST' || user?.role_name === 'ADMIN') && (
            <button
              onClick={() => navigate('/patients')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Registered Patients</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{m.totalPatients || 0}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12% this month
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Today's USG Studies</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{m.todayStudies || 0}</h3>
            <p className="text-[11px] text-gray-500 mt-1">Total Studies: {m.totalStudies || 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Pending Review</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{m.pendingReports || 0}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Awaiting radiologist signoff</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Approved Reports</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{m.completedReports || 0}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Digitally signed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-red-50/70 border border-red-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-900">Urgent Cases Queue</p>
              <p className="text-lg font-extrabold text-red-700">{m.urgentStudies || 0} Urgent / Emergency</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/worklist?priority=URGENT')}
            className="text-xs font-bold text-red-700 hover:underline"
          >
            View →
          </button>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cpu className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-900">AI Microservice Queue</p>
              <p className="text-lg font-extrabold text-blue-700">{m.aiProcessingQueue || 0} Active Inferences</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold">FastAPI</span>
        </div>

        <div className="bg-purple-50/70 border border-purple-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-purple-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-purple-900">Avg Report Turnaround</p>
              <p className="text-lg font-extrabold text-purple-700">{m.avgTurnaroundHours || 1.4} Hours</p>
            </div>
          </div>
          <span className="text-[10px] text-purple-600 font-medium">98.2% SLA Target</span>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radiologist Workload Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Radiologist Workload Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.radiologistWorkload || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="assigned" name="Assigned Queue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed Reports" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Types Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Ultrasound Study Types Breakdown</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.studyTypesDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats?.studyTypesDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Audit Activity Stream */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Recent Diagnostic Audit Activity</h2>
          <button
            onClick={() => navigate('/audit-logs')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            View Full Security Audit Log →
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {(stats?.recentLogs || []).map((log, idx) => (
            <div key={log.log_id ? `dash-log-${log.log_id}-${idx}` : `dash-log-${idx}`} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <div>
                  <span className="font-bold text-gray-900">{log.action}</span>
                  <span className="text-gray-500 ml-2">by User ID #{log.user_id || 'System'}</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-gray-400">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
