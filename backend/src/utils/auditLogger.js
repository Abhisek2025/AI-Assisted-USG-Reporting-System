// backend/src/utils/auditLogger.js
import { db } from '../config/db.js';

export function logAuditEvent(req, { userId, action, entityType, entityId, details = {} }) {
  try {
    const logEntry = {
      log_id: db.getNextId('audit_logs'),
      user_id: userId || (req?.user?.user_id || null),
      action: action,
      entity_type: entityType,
      entity_id: entityId || null,
      ip_address: req?.ip || req?.connection?.remoteAddress || '127.0.0.1',
      user_agent: req?.headers?.['user-agent'] || 'USG-Reporting-System/1.0',
      details_json: details,
      timestamp: new Date().toISOString()
    };
    db.audit_logs.unshift(logEntry);
    console.log(`[AUDIT LOG] ${action} | User: ${logEntry.user_id} | Entity: ${entityType}:${entityId}`);
    return logEntry;
  } catch (err) {
    console.error('Audit Logging Error:', err);
  }
}
