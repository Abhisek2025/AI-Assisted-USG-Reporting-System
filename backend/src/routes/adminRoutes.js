// backend/src/routes/adminRoutes.js
import express from 'express';
import {
  getUsers,
  createUser,
  toggleUserStatus,
  getAuditLogs,
  getAdminDashboardStats,
  getDatabaseExplorer,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// User Management (User listing accessible to authenticated staff for assignments)
router.get('/users', authorizeRoles('ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN'), getUsers);
router.post('/users', authorizeRoles('ADMIN'), createUser);
router.patch('/users/:id/status', authorizeRoles('ADMIN'), toggleUserStatus);

// Audit Logs (Admin only)
router.get('/audit-logs', authorizeRoles('ADMIN'), getAuditLogs);
router.get('/database-explorer', authorizeRoles('ADMIN'), getDatabaseExplorer);

// Dashboard Statistics
router.get('/dashboard-stats', getAdminDashboardStats);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.patch('/notifications/read-all', markAllNotificationsRead);

export default router;
