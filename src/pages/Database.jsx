// src/pages/Database.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Database as DatabaseIcon, Table, RefreshCw, Layers, HardDrive, Shield, CheckCircle2 } from 'lucide-react';

export default function Database() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTable, setActiveTable] = useState('patients');

  const fetchDatabaseDump = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/database-explorer');
      if (res.data.success) {
        setData(res.data.data.tables);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to database explorer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseDump();
  }, []);

  const tableList = [
    { key: 'patients', name: 'Patients Registry', count: data?.patients?.length || 0 },
    { key: 'studies', name: 'Ultrasound Studies', count: data?.studies?.length || 0 },
    { key: 'reports', name: 'Clinical Reports', count: data?.reports?.length || 0 },
    { key: 'users', name: 'System Users', count: data?.users?.length || 0 },
    { key: 'audit_logs', name: 'Audit Trail Logs', count: data?.audit_logs?.length || 0 },
  ];

  const currentRecords = data ? (data[activeTable] || []) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <DatabaseIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Firestore Database Explorer</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>ONLINE (Firebase Firestore)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live collection inspector for Google Cloud Firestore NoSQL collections & documents.
            </p>
          </div>
        </div>
        <button
          onClick={fetchDatabaseDump}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start space-x-3">
          <HardDrive className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-200">Database Engine</p>
            <p className="text-slate-400 text-[11px]">Google Cloud Firestore Database (`ai-studio-aiassistedusgrep-c0b8...`).</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Layers className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-200">Document Collections</p>
            <p className="text-slate-400 text-[11px]">Collections: `patients`, `studies`, `reports`, `users`, `audit_logs`.</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-200">Authentication & Security</p>
            <p className="text-slate-400 text-[11px]">Firebase Authentication + Deployed Firestore Security Rules.</p>
          </div>
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {tableList.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTable(tab.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center space-x-2 border ${
              activeTable === tab.key
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{tab.name}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              activeTable === tab.key ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
          <p className="text-xs">Querying database engine...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 text-center">
          {error}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Table className="w-4 h-4 text-blue-400" />
              <span>Table: {activeTable} ({currentRecords.length} records)</span>
            </h3>
          </div>

          {currentRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No records found in this database table.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3"># Row</th>
                    {Object.keys(currentRecords[0] || {}).map(col => (
                      <th key={col} className="px-4 py-3 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {currentRecords.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5 text-slate-500">{idx + 1}</td>
                      {Object.keys(currentRecords[0] || {}).map(col => {
                        const val = row[col];
                        let renderedVal = String(val);
                        if (typeof val === 'object' && val !== null) {
                          renderedVal = JSON.stringify(val);
                        }
                        return (
                          <td key={col} className="px-4 py-2.5 max-w-xs truncate text-slate-300" title={renderedVal}>
                            {renderedVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
