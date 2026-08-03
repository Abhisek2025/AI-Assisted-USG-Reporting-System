// src/pages/AppointmentsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Stethoscope,
  Phone,
  Filter,
  RefreshCw,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AppointmentsManagement() {
  const { user } = useAuth();
  const socketData = useSocket();
  const realtimeEvents = socketData?.realtimeEvents || [];
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (realtimeEvents && realtimeEvents.length > 0) {
      const last = realtimeEvents[realtimeEvents.length - 1];
      if (last?.type === 'APPOINTMENT_CREATED' || last?.type === 'APPOINTMENT_UPDATED') {
        fetchAppointments();
      }
    }
  }, [realtimeEvents]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.success && data.data) {
        setAppointments(data.data);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Appointment ${id} marked as ${newStatus}`);
        fetchAppointments();
      } else {
        toast.error(data.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error('Update appointment status error:', err);
      toast.error('Server error updating appointment status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch =
      (a.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.reference_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.usg_service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.doctor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.phone || '').includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || (a.status || 'PENDING') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-black text-gray-900">USG Appointments & Doctor Bookings</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time diagnostic portal appointment queue. Managed by Admin & Front Desk Reception.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all flex items-center space-x-2 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient name, phone, ref code, or USG service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500">Loading appointments queue...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-2">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm font-bold text-gray-700">No appointments found</p>
          <p className="text-xs text-gray-500">Try adjusting your search query or filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Ref & Status</th>
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">USG Scan Service</th>
                  <th className="py-3 px-4">Doctor & Slot</th>
                  <th className="py-3 px-4">Clinical Symptoms</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50/80 transition-colors">
                    
                    {/* Ref & Status */}
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-gray-900">{appt.reference_code || appt.id}</p>
                      <div className="mt-1">
                        {appt.status === 'CONFIRMED' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">CONFIRMED</span>
                        )}
                        {appt.status === 'PENDING' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">PENDING</span>
                        )}
                        {appt.status === 'COMPLETED' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full border border-blue-200">COMPLETED</span>
                        )}
                        {appt.status === 'CANCELLED' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full border border-rose-200">CANCELLED</span>
                        )}
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{appt.patient_name}</p>
                      <p className="text-[11px] text-gray-500">{appt.age}y / {appt.gender} • {appt.phone}</p>
                      {appt.email && <p className="text-[10px] text-gray-400">{appt.email}</p>}
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-4 font-semibold text-purple-900">
                      {appt.usg_service}
                    </td>

                    {/* Doctor & Slot */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-800">{appt.doctor_name}</p>
                      <p className="text-[11px] text-blue-600 font-medium">📅 {appt.appointment_date} at {appt.slot_time}</p>
                    </td>

                    {/* Symptoms */}
                    <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate text-[11px]">
                      {appt.symptoms || 'None'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {appt.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                          disabled={updatingId === appt.id}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-md transition-all shadow-xs"
                        >
                          Confirm
                        </button>
                      )}

                      {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                          disabled={updatingId === appt.id}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-md transition-all shadow-xs"
                        >
                          Complete
                        </button>
                      )}

                      {appt.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                          disabled={updatingId === appt.id}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] rounded-md transition-all border border-gray-200"
                        >
                          Cancel
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
