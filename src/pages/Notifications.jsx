// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, CheckCircle, Check, Trash2 } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/admin/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications Center</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time alerts for study uploads, AI findings generation & report sign-offs</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
        >
          <Check className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-500">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500">No notifications available.</p>
        ) : (
          notifications.map((n, idx) => (
            <div
              key={n.notification_id ? `notif-${n.notification_id}-${idx}` : `notif-${idx}`}
              onClick={() => handleMarkRead(n.notification_id)}
              className={`p-4 flex items-start justify-between cursor-pointer transition-colors ${
                n.is_read ? 'bg-white opacity-60' : 'bg-blue-50/30'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">{n.title}</h3>
                  <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2"></span>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
