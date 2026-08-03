// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Studies from './pages/Studies';
import UploadImages from './pages/UploadImages';
import RadiologistWorklist from './pages/RadiologistWorklist';
import ReportingWorkspace from './pages/ReportingWorkspace';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';
import Database from './pages/Database';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import DiagnosticCenterSPA from './pages/DiagnosticCenterSPA';
import AppointmentsManagement from './pages/AppointmentsManagement';
import PatientDashboard from './pages/PatientDashboard';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-xs">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_name)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function MainLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <div className="flex flex-1 relative">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 min-w-0 overflow-x-hidden p-3 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/diagnostic-center" element={<DiagnosticCenterSPA />} />

            <Route path="/" element={<DiagnosticCenterSPA />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/patient-dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <PatientDashboard />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/appointments" element={
              <ProtectedRoute>
                <MainLayout>
                  <AppointmentsManagement />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/worklist" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RADIOLOGIST']}>
                <MainLayout>
                  <RadiologistWorklist />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/patients" element={
              <ProtectedRoute>
                <MainLayout>
                  <Patients />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/studies" element={
              <ProtectedRoute>
                <MainLayout>
                  <Studies />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/upload" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'TECHNICIAN']}>
                <MainLayout>
                  <UploadImages />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/workspace/:studyId" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RADIOLOGIST']}>
                <ReportingWorkspace />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout>
                  <UserManagement />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/audit-logs" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout>
                  <AuditLogs />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/database" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout>
                  <Database />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <MainLayout>
                  <Notifications />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RADIOLOGIST']}>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={
              <MainLayout>
                <NotFound />
              </MainLayout>
            } />

          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
