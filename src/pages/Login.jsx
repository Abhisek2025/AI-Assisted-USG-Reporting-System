// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { 
  Stethoscope, 
  ShieldCheck, 
  User, 
  Lock, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  Shield, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  HelpCircle,
  Mail
} from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('ADMIN');
  const [regPhone, setRegPhone] = useState('');
  const [regQualification, setRegQualification] = useState('System Administrator');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: reset password with OTP
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async (overrideRole = null) => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const googleUser = result.user;
      const idToken = await googleUser.getIdToken();

      const chosenRole = typeof overrideRole === 'string' ? overrideRole : null;
      const roleToSend = chosenRole || (mode === 'register' ? regRole : 'ADMIN');

      const res = await api.post('/auth/google', {
        idToken,
        email: googleUser.email,
        displayName: googleUser.displayName,
        photoURL: googleUser.photoURL,
        uid: googleUser.uid,
        roleName: roleToSend,
        qualification: mode === 'register' ? regQualification : undefined,
        mode: mode
      });

      if (res.data.success) {
        const { token: jwtToken, user: userData } = res.data.data;
        localStorage.setItem('usg_token', jwtToken);
        localStorage.setItem('usg_user', JSON.stringify(userData));
        toast.success(`Logged in via Google OAuth as ${userData.first_name || 'User'} (${userData.role_name || roleToSend})!`);
        navigate('/dashboard');
        window.location.reload();
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.info('Google Sign-In popup closed by user.');
        toast.info('Google Sign-In popup closed.');
        setError('Sign-In popup was closed before completion.');
      } else {
        console.error('Google Sign In Error:', err);
        const msg = err.response?.data?.message || err.message || 'Google OAuth Sign-In failed.';
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const u = await login(email, password);
      toast.success(`Welcome back! Logged in as ${u?.first_name || 'User'} (${u?.role_name || 'User'})`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      const msg = 'Passwords do not match. Please re-type password to confirm.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (regPassword.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const u = await register({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: regPassword,
        roleName: regRole,
        phone: regPhone,
        qualification: regQualification
      });
      toast.success(`Registered successfully! Logged in as ${u?.first_name} ${u?.last_name} (${u?.role_name})`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!forgotEmail || !forgotEmail.trim()) {
      const msg = 'Please enter your registered email address.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);

    try {
      // 1. Dispatch real-time password reset email via Firebase Auth
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      toast.success(`Real-time password reset email dispatched by Firebase to ${forgotEmail}! Please check your inbox.`);
      
      // Also request backend confirmation
      await api.post('/auth/forgot-password', { email: forgotEmail.trim() }).catch(() => {});
      setForgotStep(2);
    } catch (err) {
      console.error('Firebase Password Reset error:', err);
      
      // Attempt backend fallback if Firebase user isn't in client Auth store
      try {
        const res = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
        if (res.data.success) {
          toast.success(res.data.message);
          setForgotOtp(res.data.otpDemoCode || '123456');
          setForgotStep(2);
          setLoading(false);
          return;
        }
      } catch (backendErr) {
        // Fallthrough
      }

      let msg = 'Failed to send password reset email via Firebase.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No user account found with this email in Firebase Auth.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address syntax.';
      } else if (err.message) {
        msg = err.message;
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (forgotNewPassword !== forgotConfirmPassword) {
      const msg = 'New password and confirm password do not match.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (forgotNewPassword.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        newPassword: forgotNewPassword,
        confirmPassword: forgotConfirmPassword,
        otp: forgotOtp
      });

      if (res.data.success) {
        toast.success('Password updated successfully! Please log in.');
        setEmail(forgotEmail);
        setPassword(forgotNewPassword);
        setMode('login');
        setForgotStep(1);
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Password reset failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-3">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Apex USG Reporting</h2>
          <p className="text-xs text-slate-400 mt-1">AI-Assisted Diagnostic Ultrasound System</p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Admin</span>
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setForgotStep(1); }}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>
            <span className="text-xs font-bold text-blue-400 flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password Recovery</span>
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start space-x-2">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email Address</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@apexdiagnostics.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setForgotEmail(email); setError(''); }}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Forgot password?</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Workstation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Google OAuth Login Button */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-slate-900 px-2 text-slate-500 font-semibold">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGoogleSignIn()}
              disabled={loading}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google OAuth Login via Email</span>
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  placeholder="Alexander"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  placeholder="Knight"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-300">Work Email</label>
                <span className="text-[10px] text-slate-400 font-medium">1 Email = 1 Role Account</span>
              </div>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="admin.knight@apexdiagnostics.com"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-8 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-300">Re-type Password to Confirm</label>
                {regConfirmPassword && (
                  regPassword === regConfirmPassword ? (
                    <span className="text-[10px] text-emerald-400 flex items-center space-x-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Passwords match</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-400 flex items-center space-x-1 font-semibold">
                      <XCircle className="w-3 h-3" />
                      <span>Passwords do not match</span>
                    </span>
                  )
                )}
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter same password"
                  className={`w-full pl-8 pr-9 py-2 bg-slate-950 border rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 ${
                    regConfirmPassword
                      ? regPassword === regConfirmPassword
                        ? 'border-emerald-500/50 focus:ring-emerald-500'
                        : 'border-rose-500/50 focus:ring-rose-500'
                      : 'border-slate-800 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-300">Account Role</label>
                <span className="text-[10px] text-amber-400 font-medium">
                  Admin role restricted to owner (abhisekkoyal334@gmail.com)
                </span>
              </div>
              <div className="relative">
                <Shield className="w-3.5 h-3.5 absolute left-3 top-2.5 text-purple-400" />
                <select
                  value={regRole}
                  onChange={(e) => {
                    const r = e.target.value;
                    if (r === 'ADMIN' && regEmail.trim().toLowerCase() !== 'abhisekkoyal334@gmail.com') {
                      toast.warning('ADMIN role is restricted exclusively to super admin (abhisekkoyal334@gmail.com).');
                      setRegRole('RADIOLOGIST');
                      setRegQualification('MD Radiodiagnosis');
                      return;
                    }
                    setRegRole(r);
                    if (r === 'ADMIN') setRegQualification('System Administrator');
                    else if (r === 'RADIOLOGIST') setRegQualification('MD Radiodiagnosis');
                    else if (r === 'DOCTOR') setRegQualification('MBBS, MD Physician');
                    else if (r === 'TECHNICIAN') setRegQualification('Certified Sonographer');
                    else if (r === 'RECEPTIONIST') setRegQualification('Front Desk Officer');
                    else if (r === 'PATIENT') setRegQualification('Self Registered Patient');
                  }}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RADIOLOGIST">RADIOLOGIST — USG Specialist</option>
                  <option value="DOCTOR">DOCTOR — Referring Physician</option>
                  <option value="TECHNICIAN">TECHNICIAN — Sonographer</option>
                  <option value="RECEPTIONIST">RECEPTIONIST — Front Desk</option>
                  <option value="PATIENT">PATIENT — Public Patient Account</option>
                  {regEmail.trim().toLowerCase() === 'abhisekkoyal334@gmail.com' && (
                    <option value="ADMIN">ADMIN — Super Administrator (abhisekkoyal334@gmail.com)</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone (Optional)</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+1-555-0199"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Qualification</label>
                <input
                  type="text"
                  value={regQualification}
                  onChange={(e) => setRegQualification(e.target.value)}
                  placeholder="Qualification"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account as {regRole}</span>
                </>
              )}
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-slate-900 px-2 text-slate-500 font-semibold">Or register via OAuth</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGoogleSignIn(regRole)}
              disabled={loading}
              className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-500/30 font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Register with Google OAuth as {regRole}</span>
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <div>
            {forgotStep === 1 && (
              <form onSubmit={handleForgotRequestOtp} className="space-y-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start space-x-2">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Enter your registered work email. Firebase Auth will dispatch a real-time password reset email directly to your inbox.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Work Email</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@apexdiagnostics.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Dispatching Firebase Email...</span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Real-Time Password Reset Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleForgotResetSubmit} className="space-y-3.5">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center justify-between">
                  <span>OTP Code generated for {forgotEmail}</span>
                  <span className="font-mono bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 font-bold border border-emerald-800">
                    {forgotOtp || '123456'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Verification OTP Code</label>
                  <input
                    type="text"
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-center tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                      title={showForgotNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Re-type New Password to Confirm</label>
                    {forgotConfirmPassword && (
                      forgotNewPassword === forgotConfirmPassword ? (
                        <span className="text-[10px] text-emerald-400 flex items-center space-x-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Match</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-400 flex items-center space-x-1 font-semibold">
                          <XCircle className="w-3 h-3" />
                          <span>Mismatch</span>
                        </span>
                      )
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type={showForgotConfirmPassword ? 'text' : 'password'}
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className={`w-full pl-9 pr-9 py-2 bg-slate-950 border rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 ${
                        forgotConfirmPassword
                          ? forgotNewPassword === forgotConfirmPassword
                            ? 'border-emerald-500/50 focus:ring-emerald-500'
                            : 'border-rose-500/50 focus:ring-rose-500'
                          : 'border-slate-800 focus:ring-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                      title={showForgotConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Confirm & Reset Password</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Security & Author Footer */}
        <div className="mt-6 flex flex-col items-center justify-center space-y-1 text-center text-[10px] text-slate-500">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit Encrypted Healthcare Session — HIPAA / DICOM Compliant</span>
          </div>
          <p className="text-slate-400 font-medium">Developed by <span className="text-blue-400 font-semibold">Abhisek</span></p>
        </div>

      </div>
    </div>
  );
}


