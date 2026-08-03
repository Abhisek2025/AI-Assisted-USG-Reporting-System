// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { JWT_SECRET } from '../middlewares/authMiddleware.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { adminAuth } from '../../../src/lib/firebase-admin.js';
import { getOrCreateUser } from '../../../src/db/users.js';
import { dbGetAllUsers, dbCreateUser, dbResetUserPassword } from '../services/firestoreService.js';
import { broadcastRealtimeEvent } from '../realtime.js';

const SUPER_ADMIN_EMAIL = 'abhisekkoyal334@gmail.com';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Retrieve users from Firestore first, fallback to memory db
    let users = await dbGetAllUsers();
    if (!users || users.length === 0) {
      users = db.users;
    }

    const user = users.find(u => u.email && u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const statusStr = user.status || 'ACTIVE';
    if (statusStr !== 'ACTIVE' && user.is_active === false) {
      return res.status(403).json({ success: false, message: 'Account is deactivated or suspended. Contact Admin.' });
    }

    let roleName = user.role_name || user.roleName || 'RADIOLOGIST';
    const userId = user.user_id || user.id;

    // Strict Admin check: Only abhisekkoyal334@gmail.com is allowed ADMIN role
    if (roleName === 'ADMIN' && user.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Only super administrator (${SUPER_ADMIN_EMAIL}) is permitted to access the ADMIN role.` 
      });
    }

    // Force SUPER_ADMIN_EMAIL to have ADMIN role
    if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      roleName = 'ADMIN';
      user.role_name = 'ADMIN';
    }

    const token = jwt.sign(
      {
        user_id: userId,
        email: user.email,
        role_name: roleName
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      ...user,
      user_id: userId,
      id: userId,
      role_name: roleName,
      first_name: user.first_name || user.firstName || 'User',
      last_name: user.last_name || user.lastName || ''
    };
    delete userResponse.password_hash;

    logAuditEvent(req, {
      userId: userId,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: userId,
      details: { email: user.email, role: roleName }
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
}

export async function register(req, res) {
  try {
    const { email, password, firstName, lastName, roleName, phone, qualification } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Email, password, first name, and last name are required.' });
    }

    const users = await dbGetAllUsers();
    const existing = users.find(u => u.email && u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      const existingRole = existing.role_name || existing.roleName || 'User';
      return res.status(400).json({ 
        success: false, 
        message: `Registration failed: An account with email '${email.trim()}' is already registered under the role '${existingRole}'. Each email address can only log in to one role. Please sign in with your existing account.` 
      });
    }

    let assignedRole = (roleName || 'RADIOLOGIST').toUpperCase();

    // Restrict ADMIN role to super admin email
    if (assignedRole === 'ADMIN' && email.trim().toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Only the super administrator (${SUPER_ADMIN_EMAIL}) is permitted to register with the ADMIN role. Please select RADIOLOGIST, TECHNICIAN, RECEPTIONIST, DOCTOR, or PATIENT.`
      });
    }

    if (email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      assignedRole = 'ADMIN';
    }
    
    // Save new user directly into Firebase Firestore
    const createdUser = await dbCreateUser({
      email: email.trim(),
      username: email.trim().split('@')[0],
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role_name: assignedRole,
      phone: phone ? phone.trim() : '+1-555-0199',
      qualification: qualification ? qualification.trim() : (assignedRole === 'RADIOLOGIST' ? 'MD Radiodiagnosis' : assignedRole === 'TECHNICIAN' ? 'Certified Sonographer' : 'Medical Specialist'),
      registration_number: `${assignedRole}-${Date.now().toString().slice(-4)}`
    });

    const newUserId = createdUser.id || createdUser.user_id;

    const token = jwt.sign(
      {
        user_id: newUserId,
        email: createdUser.email,
        role_name: assignedRole
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      user_id: newUserId,
      id: newUserId,
      email: createdUser.email,
      first_name: createdUser.first_name || firstName,
      last_name: createdUser.last_name || lastName,
      role_name: assignedRole,
      phone: createdUser.phone,
      qualification: createdUser.qualification,
      status: 'ACTIVE',
      is_active: true
    };

    // Broadcast real-time user event to all connected portals
    broadcastRealtimeEvent('USER_MUTATED', userResponse);
    broadcastRealtimeEvent('USER_CREATED', userResponse);

    logAuditEvent(req, {
      userId: newUserId,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: newUserId,
      details: { email: createdUser.email, role: assignedRole }
    });

    return res.json({
      success: true,
      message: 'Registration successful! Saved to Firebase Firestore.',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
}

export async function googleLogin(req, res) {
  try {
    const { idToken, email: bodyEmail, displayName, uid: bodyUid, photoURL, roleName: bodyRoleName, qualification: bodyQual, mode } = req.body;
    let email = bodyEmail;
    let uid = bodyUid;
    let name = displayName || '';

    if (idToken && adminAuth) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        uid = decodedToken.uid || uid;
        email = decodedToken.email || email;
        name = decodedToken.name || displayName || name;
      } catch (authErr) {
        console.warn('Firebase Admin verifyIdToken warning:', authErr.message);
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google authentication failed. No valid email received.' });
    }

    const names = (name || '').trim().split(' ');
    const firstName = names[0] || 'User';
    const lastName = names.slice(1).join(' ') || '';

    let users = await dbGetAllUsers();
    if (!users || users.length === 0) {
      users = db.users;
    }

    let user = users.find(u => u.email && u.email.toLowerCase() === email.trim().toLowerCase());

    let chosenRole = (bodyRoleName || 'RADIOLOGIST').toUpperCase();
    if (email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      chosenRole = 'ADMIN';
    } else if (chosenRole === 'ADMIN') {
      chosenRole = 'RADIOLOGIST';
    }

    if (!user) {
      // Auto-register user from Google OAuth in Firestore with chosen role
      user = await dbCreateUser({
        email: email.trim(),
        username: email.trim().split('@')[0],
        first_name: firstName,
        last_name: lastName,
        role_name: chosenRole,
        status: 'ACTIVE',
        is_active: true,
        phone: '',
        qualification: bodyQual || `${chosenRole} (Google Verified)`,
        google_uid: uid || '',
        photo_url: photoURL || ''
      });

      broadcastRealtimeEvent('USER_MUTATED', user);
      broadcastRealtimeEvent('USER_CREATED', user);
    } else {
      // If user exists and user clicked Google OAuth in registration mode
      if (mode === 'register') {
        const existingRole = user.role_name || user.roleName || 'User';
        return res.status(400).json({
          success: false,
          message: `Registration failed: An account with email '${email.trim()}' is already registered under the role '${existingRole}'. Each email address can only log in to one role. Please sign in with your existing account.`
        });
      }

      // If user exists, update google_uid if missing
      if (uid && !user.google_uid) {
        user.google_uid = uid;
      }
      // If this is super admin email, enforce ADMIN role in record
      if (email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        user.role_name = 'ADMIN';
      } else if (user.role_name === 'ADMIN') {
        user.role_name = 'RADIOLOGIST';
      }
    }

    let roleName = user.role_name || user.roleName || chosenRole;
    if (roleName === 'ADMIN' && email.trim().toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      roleName = 'RADIOLOGIST';
      user.role_name = 'RADIOLOGIST';
    }
    const userId = user.user_id || user.id;

    const token = jwt.sign(
      {
        user_id: userId,
        email: user.email,
        role_name: roleName
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      ...user,
      user_id: userId,
      id: userId,
      role_name: roleName,
      first_name: user.first_name || user.firstName || firstName,
      last_name: user.last_name || user.lastName || lastName,
      status: 'ACTIVE'
    };
    delete userResponse.password_hash;

    logAuditEvent(req, {
      userId: userId,
      action: 'GOOGLE_OAUTH_LOGIN',
      entityType: 'USER',
      entityId: userId,
      details: { email: user.email, role: roleName }
    });

    return res.json({
      success: true,
      message: 'Google OAuth Sign-In successful.',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (err) {
    console.error('googleLogin Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process Google OAuth login.' });
  }
}

export function getCurrentUser(req, res) {
  const userResponse = { ...req.user };
  delete userResponse.password_hash;
  return res.json({
    success: true,
    data: userResponse
  });
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your registered email address.' });
    }

    let users = await dbGetAllUsers();
    if (!users || users.length === 0) users = db.users;

    const user = users.find(u => u.email && u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
    }

    return res.json({
      success: true,
      message: `Account verified for ${user.email}. Use OTP code '123456' to reset your password.`,
      email: user.email,
      otpDemoCode: '123456'
    });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process forgot password request.' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, newPassword, confirmPassword, otp } = req.body;
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Email, new password, and confirmation password are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation password do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    await dbResetUserPassword(email, newPassword);

    const memUser = db.users.find(u => u.email && u.email.toLowerCase() === email.trim().toLowerCase());
    if (memUser) {
      memUser.password = newPassword;
      memUser.password_hash = bcrypt.hashSync(newPassword, 10);
    }

    logAuditEvent(req, {
      userId: memUser ? memUser.user_id : email,
      action: 'PASSWORD_RESET',
      entityType: 'USER',
      entityId: email,
      details: { email }
    });

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
}

export function logout(req, res) {
  return res.json({ success: true, message: 'Logged out successfully.' });
}
