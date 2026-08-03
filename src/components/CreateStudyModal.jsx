// src/components/CreateStudyModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, FileSpreadsheet, AlertCircle } from 'lucide-react';

export default function CreateStudyModal({ isOpen, onClose, onStudyCreated }) {
  const [patients, setPatients] = useState([]);
  const [radiologists, setRadiologists] = useState([]);

  const [formData, setFormData] = useState({
    patient_id: '',
    study_type: 'Abdomen',
    body_region: 'Whole Abdomen',
    referring_doctor: '',
    clinical_indication: 'Abdominal discomfort & nausea',
    assigned_radiologist_id: '',
    priority: 'NORMAL'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPatientsAndRadiologists();
    }
  }, [isOpen]);

  const fetchPatientsAndRadiologists = async () => {
    try {
      const pRes = await api.get('/patients');
      if (pRes.data.success) {
        setPatients(pRes.data.data.patients);
        if (pRes.data.data.patients.length > 0) {
          setFormData(prev => ({ ...prev, patient_id: pRes.data.data.patients[0].patient_id }));
        }
      }

      const uRes = await api.get('/admin/users');
      let rads = [];
      if (uRes.data.success && Array.isArray(uRes.data.data)) {
        rads = uRes.data.data.filter(u => u.role_name === 'RADIOLOGIST');
      }
      
      // Default fallback radiologists if none registered yet
      if (rads.length === 0) {
        rads = [
          { user_id: 2, first_name: 'Sarah', last_name: 'Jenkins', qualification: 'MD Radiodiagnosis, FACR' },
          { user_id: 3, first_name: 'Marcus', last_name: 'Vance', qualification: 'DNB Radiology, USG Specialist' }
        ];
      }

      setRadiologists(rads);
      if (rads.length > 0) {
        setFormData(prev => ({ ...prev, assigned_radiologist_id: rads[0].user_id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/studies', formData);
      if (res.data.success) {
        onStudyCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register study');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">New USG Ultrasound Study</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Patient *</label>
            <select
              required
              value={formData.patient_id}
              onChange={e => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {patients.length === 0 ? (
                <option value="" disabled>-- No Patients Found (Please register a patient first) --</option>
              ) : (
                patients.map(p => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.first_name} {p.last_name} ({p.uhid}) - {p.age}y/{p.gender}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">USG Study Type *</label>
              <select
                value={formData.study_type}
                onChange={e => setFormData({ ...formData, study_type: e.target.value, body_region: `${e.target.value} Region` })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Abdomen">Abdomen</option>
                <option value="Pelvis">Pelvis</option>
                <option value="Obstetric">Obstetric</option>
                <option value="Renal">Renal (KUB)</option>
                <option value="Thyroid">Thyroid</option>
                <option value="Breast">Breast</option>
                <option value="Scrotal">Scrotal</option>
                <option value="Doppler">Vascular Doppler</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priority Level *</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="URGENT">URGENT</option>
                <option value="EMERGENCY">EMERGENCY</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Body Region</label>
            <input
              type="text"
              value={formData.body_region}
              onChange={e => setFormData({ ...formData, body_region: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Radiologist</label>
            <select
              value={formData.assigned_radiologist_id}
              onChange={e => setFormData({ ...formData, assigned_radiologist_id: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Unassigned / On-Call Radiologist --</option>
              {radiologists.map(r => (
                <option key={r.user_id} value={r.user_id}>
                  Dr. {r.first_name} {r.last_name} ({r.qualification || 'Radiologist'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Clinical Indication *</label>
            <textarea
              required
              rows={2}
              value={formData.clinical_indication}
              onChange={e => setFormData({ ...formData, clinical_indication: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              {loading ? 'Registering...' : 'Create USG Study'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
