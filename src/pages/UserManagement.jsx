// src/pages/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, UserPlus, Shield, Check, X, RefreshCw } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { lastEvent } = useSocket();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: 'Password123!',
    first_name: '',
    last_name: '',
    role_id: 2, // Default RADIOLOGIST
    qualification: 'MD Radiodiagnosis',
    registration_number: 'RAD-2026-9001'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Real-time auto update when users collection changes in Firebase
  useEffect(() => {
    if (lastEvent && (lastEvent.type === 'USER_MUTATED' || lastEvent.type === 'USER_CREATED')) {
      fetchUsers();
    }
  }, [lastEvent]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      if (res.data.success) {
        toast.success(`User status updated in Firebase!`);
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_active: !u.is_active } : u));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/users', formData);
      if (res.data.success) {
        toast.success(`User created and saved to Firebase Firestore!`);
        setShowAddModal(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">System User & Staff Directory</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage administrators, radiologists, receptionists, and sonographer accounts</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-500">Loading user accounts...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Email / Username</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Medical Reg Number</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {u.first_name} {u.last_name}
                      <p className="text-[10px] font-normal text-gray-500">{u.qualification || 'Staff Member'}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-gray-900">{u.email}</p>
                      <p className="text-[10px] text-gray-400 font-mono">@{u.username}</p>
                    </td>

                    <td className="px-6 py-4 font-bold">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-slate-100 text-slate-800">
                        {u.role_name}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-gray-700">
                      {u.registration_number || 'N/A'}
                    </td>

                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">ACTIVE</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-[10px] rounded-full">SUSPENDED</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.user_id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900">Add Staff User</h2>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Role</label>
                <select
                  value={formData.role_id}
                  onChange={e => setFormData({ ...formData, role_id: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  <option value={1}>ADMIN</option>
                  <option value={2}>RADIOLOGIST</option>
                  <option value={3}>RECEPTIONIST</option>
                  <option value={4}>TECHNICIAN</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg">Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
