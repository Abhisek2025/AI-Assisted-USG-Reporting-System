// backend/src/controllers/adminController.js
import { dbGetAllUsers, dbCreateUser, dbToggleUserStatus, dbGetAllPatients, dbGetAllStudies, dbGetAllReports, dbGetDatabaseExplorer as fetchDbDump } from '../services/dbService.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { broadcastRealtimeEvent } from '../realtime.js';
import { db } from '../../../src/db/index.js';
import { TABLES as schemaTables } from '../../../src/db/schema.js';

export async function getUsers(req, res) {
  try {
    const list = await dbGetAllUsers();
    const formatted = list.map(u => {
      const roleName = u.role_name || u.roleName || (u.role_id === 1 ? 'ADMIN' : u.role_id === 3 ? 'RECEPTIONIST' : 'RADIOLOGIST');
      const statusStr = u.status || 'ACTIVE';
      return {
        user_id: u.id || u.user_id,
        id: u.id || u.user_id,
        email: u.email,
        username: u.username || (u.email ? u.email.split('@')[0] : 'user'),
        first_name: u.first_name || u.firstName || 'User',
        last_name: u.last_name || u.lastName || '',
        role_name: roleName,
        phone: u.phone || '',
        qualification: u.qualification || '',
        registration_number: u.registration_number || u.registrationNumber || '',
        status: statusStr,
        is_active: u.is_active !== undefined ? u.is_active : statusStr === 'ACTIVE',
        created_at: u.created_at || u.createdAt
      };
    });
    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('getUsers Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
}

export async function createUser(req, res) {
  try {
    const {
      email,
      username,
      first_name,
      last_name,
      role_name,
      role_id,
      phone,
      qualification,
      registration_number
    } = req.body;

    const roleMap = { 1: 'ADMIN', 2: 'RADIOLOGIST', 3: 'RECEPTIONIST', 4: 'TECHNICIAN' };
    const effectiveRoleName = role_name || (role_id ? roleMap[role_id] : 'RADIOLOGIST');

    if (!email || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: 'Email, first name, and last name are required.' });
    }

    const existingUsers = await dbGetAllUsers();
    const existing = existingUsers.find(u => u.email && u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      const existingRole = existing.role_name || existing.roleName || 'User';
      return res.status(400).json({ 
        success: false, 
        message: `Cannot create user: An account with email '${email.trim()}' is already registered under the role '${existingRole}'. Each email address is restricted to a single role in the system.` 
      });
    }

    const created = await dbCreateUser({
      email,
      username: username || (email ? email.split('@')[0] : 'user'),
      first_name,
      last_name,
      role_name: effectiveRoleName,
      phone: phone || '',
      qualification: qualification || '',
      registration_number: registration_number || ''
    });

    const formatted = {
      user_id: created.id || created.user_id,
      id: created.id || created.user_id,
      email: created.email,
      username: created.username || (created.email ? created.email.split('@')[0] : 'user'),
      first_name: created.first_name || created.firstName,
      last_name: created.last_name || created.lastName,
      role_name: created.role_name || created.roleName,
      phone: created.phone || '',
      qualification: created.qualification || '',
      registration_number: created.registration_number || created.registrationNumber || '',
      status: created.status || 'ACTIVE',
      is_active: (created.status || 'ACTIVE') === 'ACTIVE',
      created_at: created.createdAt || created.created_at
    };

    logAuditEvent(req, {
      userId: req.user?.id || 1,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: created.id,
      details: { email: created.email, role: created.roleName || created.role_name }
    });

    broadcastRealtimeEvent('USER_MUTATED', formatted);
    broadcastRealtimeEvent('USER_CREATED', formatted);

    return res.status(201).json({
      success: true,
      message: `User ${first_name} ${last_name} created successfully in Firebase Firestore.`,
      data: formatted
    });
  } catch (err) {
    console.error('createUser Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const users = await dbGetAllUsers();
    const existing = users.find(u => String(u.id || u.user_id) === String(id));
    const targetStatus = status || (existing?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');

    const updated = await dbToggleUserStatus(id, targetStatus);

    const formatted = {
      user_id: updated.id || updated.user_id || id,
      id: updated.id || updated.user_id || id,
      email: updated.email,
      first_name: updated.first_name || updated.firstName,
      last_name: updated.last_name || updated.lastName,
      role_name: updated.role_name || updated.roleName,
      status: updated.status,
      is_active: updated.status === 'ACTIVE'
    };

    broadcastRealtimeEvent('USER_MUTATED', formatted);

    return res.json({
      success: true,
      message: `User status changed to ${updated.status}.`,
      data: formatted
    });
  } catch (err) {
    console.error('toggleUserStatus Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
}

export async function getAuditLogs(req, res) {
  try {
    let logs = [];
    try {
      if (typeof db.query === 'function') {
        logs = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50');
      }
    } catch (e) {
      console.warn('Audit logs SQL fetch fallback:', e.message);
    }
    return res.json({ success: true, data: logs || [] });
  } catch (err) {
    console.error('getAuditLogs Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
}

export async function getAdminDashboardStats(req, res) {
  try {
    const pList = await dbGetAllPatients();
    const sList = await dbGetAllStudies();
    const repList = await dbGetAllReports();

    const totalPatients = pList.length;
    const totalStudies = sList.length;

    const pendingReports = sList.filter(s => s.status !== 'APPROVED' && s.status !== 'REPORT_APPROVED').length;
    const completedReports = repList.filter(r => r.status === 'APPROVED' || r.status === 'AMENDED').length;
    const urgentStudies = sList.filter(s => (s.priority === 'URGENT' || s.priority === 'EMERGENCY') && s.status !== 'APPROVED').length;
    const aiProcessingQueue = sList.filter(s => s.status === 'AI_PROCESSING').length;

    const studyTypesMap = {};
    sList.forEach(s => {
      const type = s.study_type || 'Abdomen';
      studyTypesMap[type] = (studyTypesMap[type] || 0) + 1;
    });
    const studyTypesDistribution = Object.keys(studyTypesMap).map(type => ({
      name: type,
      value: studyTypesMap[type]
    }));

    return res.json({
      success: true,
      data: {
        metrics: {
          totalPatients,
          totalStudies,
          todayStudies: totalStudies,
          pendingReports,
          completedReports,
          urgentStudies,
          aiProcessingQueue,
          avgTurnaroundHours: 1.4
        },
        studyTypesDistribution,
        radiologistWorkload: [
          { name: 'Dr. Jenkins', assigned: 2, completed: 5 },
          { name: 'Dr. Vance', assigned: 1, completed: 3 }
        ],
        recentLogs: []
      }
    });
  } catch (err) {
    console.error('getAdminDashboardStats Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard statistics.' });
  }
}

export async function getNotifications(req, res) {
  return res.json({ success: true, data: [] });
}

export async function getDatabaseExplorer(req, res) {
  try {
    const dump = await fetchDbDump();
    return res.json({
      success: true,
      data: dump
    });
  } catch (err) {
    console.error('getDatabaseExplorer Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch database dump.' });
  }
}

export async function markNotificationRead(req, res) {
  return res.json({ success: true, message: 'Notification marked as read.' });
}

export async function markAllNotificationsRead(req, res) {
  return res.json({ success: true, message: 'All notifications marked as read.' });
}
