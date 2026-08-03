// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Upload,
  ClipboardCheck,
  FileText,
  ShieldAlert,
  Bell,
  Settings,
  UserCheck,
  Database,
  CalendarCheck,
  Globe
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role_name || '';

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN', 'DOCTOR', 'PATIENT']
    },
    {
      label: 'Patient Portal & Reports',
      icon: UserCheck,
      path: '/patient-dashboard',
      roles: ['ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN', 'DOCTOR', 'PATIENT'],
      badge: 'LIVE'
    },
    {
      label: 'USG Appointments',
      icon: CalendarCheck,
      path: '/appointments',
      roles: ['ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN', 'DOCTOR'],
      badge: 'NEW'
    },
    {
      label: 'Radiologist Worklist',
      icon: ClipboardCheck,
      path: '/worklist',
      roles: ['ADMIN', 'RADIOLOGIST'],
      badge: 'PRO'
    },
    {
      label: 'Patients Registry',
      icon: Users,
      path: '/patients',
      roles: ['ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN', 'DOCTOR']
    },
    {
      label: 'USG Studies',
      icon: FileSpreadsheet,
      path: '/studies',
      roles: ['ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN', 'DOCTOR']
    },
    {
      label: 'Upload Imagery',
      icon: Upload,
      path: '/upload',
      roles: ['ADMIN', 'RECEPTIONIST', 'TECHNICIAN']
    },
    {
      label: 'Reports Archive',
      icon: FileText,
      path: '/reports',
      roles: ['ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN', 'DOCTOR']
    },
    {
      label: 'Public Center Website',
      icon: Globe,
      path: '/diagnostic-center',
      roles: ['ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN', 'DOCTOR', 'PATIENT']
    },
    {
      label: 'User Management',
      icon: UserCheck,
      path: '/users',
      roles: ['ADMIN']
    },
    {
      label: 'Audit Security Logs',
      icon: ShieldAlert,
      path: '/audit-logs',
      roles: ['ADMIN']
    },
    {
      label: 'Database Explorer',
      icon: Database,
      path: '/database',
      roles: ['ADMIN']
    },
    {
      label: 'Notifications',
      icon: Bell,
      path: '/notifications',
      roles: ['ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN', 'DOCTOR']
    },
    {
      label: 'Center Settings',
      icon: Settings,
      path: '/settings',
      roles: ['ADMIN', 'RADIOLOGIST']
    }
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-[61px] left-0 z-40 w-64 bg-slate-900 text-slate-300 h-[calc(100vh-61px)] flex flex-col justify-between p-4 border-r border-slate-800 transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Main Navigation
            </p>
            <nav className="space-y-1">
              {allowedItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Diagnostic Info */}
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-xs mt-4">
          <p className="font-bold text-slate-200">Apex Diagnostic Center</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Station: USG-A1-MAIN</p>
          <div className="mt-2 pt-2 border-t border-slate-700/50 flex flex-col gap-1 text-[10px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Engine Version</span>
              <span className="font-mono text-emerald-400">v1.4.2</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium text-center pt-1 border-t border-slate-800">
              Developed by <span className="text-blue-400 font-semibold">Abhisek</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
