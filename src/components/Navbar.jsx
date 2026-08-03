// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bell, Search, User, LogOut, ShieldCheck, Activity, Stethoscope, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleSidebar, isMobileMenuOpen }) {
  const { user, logout } = useAuth();
  const socketData = useSocket();
  const notifications = socketData?.notifications || [];
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = (notifications || []).filter(n => !n?.is_read).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/studies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900/40 dark:text-purple-300">ADMIN</span>;
      case 'RADIOLOGIST':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/40 dark:text-blue-300">RADIOLOGIST</span>;
      case 'RECEPTIONIST':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full dark:bg-emerald-900/40 dark:text-emerald-300">RECEPTIONIST</span>;
      case 'TECHNICIAN':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full dark:bg-amber-900/40 dark:text-amber-300">SONOGRAPHER</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Brand & Search */}
        <div className="flex items-center space-x-3">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-none flex items-center gap-1.5">
                Apex USG <span className="hidden sm:inline-block text-xs font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">AI Assisted</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Diagnostic Ultrasound Reporting</p>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative ml-6">
            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search UHID, Patient name, or Study code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-xs w-72 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/diagnostic-center')}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition-all"
          >
            <span>Diagnostic Portal</span>
          </button>

          {/* AI Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AI Fast-Inference Active</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900">Notifications</h3>
                  <span className="text-[10px] text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/notifications')}>View All</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500 p-4 text-center">No new notifications</p>
                  ) : (
                    notifications.slice(0, 5).map((n, idx) => (
                      <div key={n.notification_id ? `nav-notif-${n.notification_id}-${idx}` : `nav-notif-${idx}`} className="p-3 hover:bg-gray-50 cursor-pointer text-xs" onClick={() => navigate('/notifications')}>
                        <p className="font-semibold text-gray-800">{n.title}</p>
                        <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">{user?.first_name} {user?.last_name}</p>
                <div className="mt-0.5">{getRoleBadge(user?.role_name)}</div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-[11px] text-gray-500">{user?.email}</p>
                  {user?.registration_number && (
                    <p className="text-[10px] text-blue-600 mt-1 font-mono">Reg: {user.registration_number}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
