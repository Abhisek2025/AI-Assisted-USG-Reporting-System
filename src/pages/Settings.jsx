// src/pages/Settings.jsx
import React, { useState } from 'react';
import { Settings as SettingsIcon, Stethoscope, Cpu, ShieldCheck, Save } from 'lucide-react';

export default function Settings() {
  const [centerName, setCenterName] = useState('Apex Advanced Diagnostic & Imaging Center');
  const [address, setAddress] = useState('452 Healthcare Boulevard, Medical District');
  const [phone, setPhone] = useState('+1-800-555-USG1');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
      <div>
        <h1 className="text-xl font-bold text-gray-900">Diagnostic Center & AI Configuration</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage letterhead headers, DICOM PACS integration, and FastAPI AI engine parameters</p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
          Settings updated successfully!
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-6">
        
        <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
          <Stethoscope className="w-4 h-4 text-blue-600" />
          <span>Diagnostic Center Profile & Report Letterhead Header</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Center Name</label>
            <input
              type="text"
              value={centerName}
              onChange={e => setCenterName(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Center Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>

      </div>

      <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-xs space-y-4 border border-slate-800 text-xs">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Python FastAPI Computer Vision Engine Status</span>
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase">AI Service Bridge</p>
            <p className="font-mono text-emerald-400 font-bold mt-1">CONNECTED (http://localhost:8000)</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Vision Model Alias</p>
            <p className="font-mono text-blue-400 font-bold mt-1">USG-Segmenter-ResNet50 v1.4.2</p>
          </div>
        </div>
      </div>

    </div>
  );
}
