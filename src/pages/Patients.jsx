// src/pages/Patients.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AddPatientModal from '../components/AddPatientModal';
import { Search, UserPlus, Phone, Calendar, Stethoscope, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { lastEvent } = useSocket();

  useEffect(() => {
    fetchPatients();
  }, [search]);

  // Real-time listener for patient registration or modification
  useEffect(() => {
    if (lastEvent && (lastEvent.type === 'PATIENT_MUTATED' || lastEvent.type === 'PATIENT_CREATED')) {
      fetchPatients();
    }
  }, [lastEvent]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setPatients(res.data.data.patients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Patient Management Registry</h1>
          <p className="text-xs text-gray-500 mt-0.5">Search, register and manage diagnostic ultrasound patient profiles</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center space-x-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by UHID (e.g. PAT-2026-000001), First/Last name, or Phone number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
        />
        <button onClick={fetchPatients} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Patient List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-500">Loading patients registry...</p>
        ) : patients.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500">No patients found matching criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">UHID</th>
                  <th className="px-6 py-3.5">Patient Name</th>
                  <th className="px-6 py-3.5">Age / Gender</th>
                  <th className="px-6 py-3.5">Phone & Contact</th>
                  <th className="px-6 py-3.5">Blood Group</th>
                  <th className="px-6 py-3.5">Referring Doctor</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((p) => (
                  <tr key={p.patient_id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {p.uhid}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {p.first_name} {p.last_name}
                    </td>
                    <td className="px-6 py-4">
                      {p.age} Yrs / <span className="font-semibold">{p.gender}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{p.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{p.blood_group || 'O+'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {p.referring_doctor || 'Self'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/studies?patient_id=${p.patient_id}`)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        <span>View Studies</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPatientAdded={(newPatient) => {
          setPatients([newPatient, ...patients]);
        }}
      />

    </div>
  );
}
