// src/pages/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, Search, RefreshCw, Key, User, Calendar } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Security Audit Trail & Compliance Log</h1>
          <p className="text-xs text-gray-500 mt-0.5">Immutable activity stream tracking authentication, report sign-offs, and patient data access</p>
        </div>

        <button onClick={fetchLogs} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-500">Loading security logs...</p>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500">No audit logs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-slate-900 text-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Log ID</th>
                  <th className="px-6 py-3.5">Action Executed</th>
                  <th className="px-6 py-3.5">User ID</th>
                  <th className="px-6 py-3.5">IP Address</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {logs.map((l, idx) => (
                  <tr key={l.log_id ? `log-${l.log_id}-${idx}` : `log-${idx}`} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-blue-600">#{l.log_id}</td>
                    <td className="px-6 py-3.5 font-sans font-bold text-gray-900">{l.action}</td>
                    <td className="px-6 py-3.5 text-gray-700">User #{l.user_id || 'System'}</td>
                    <td className="px-6 py-3.5 text-gray-500">{l.ip_address || '127.0.0.1'}</td>
                    <td className="px-6 py-3.5 text-gray-500">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-[10px] text-gray-400 max-w-xs truncate">
                      {JSON.stringify(l.details)}
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
