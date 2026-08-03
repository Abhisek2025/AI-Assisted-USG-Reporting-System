// backend/src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { dbGetAllUsers } from '../services/firestoreService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'usg_reporting_system_secure_jwt_secret_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required. Please login.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
    }

    try {
      let users = await dbGetAllUsers();
      if (!users || users.length === 0) {
        users = db.users;
      }

      const decodedId = String(decoded.user_id || decoded.id || '');
      const decodedEmail = decoded.email ? decoded.email.toLowerCase() : null;

      const user = users.find(u => {
        const uId = String(u.id || u.user_id || '');
        const uEmail = u.email ? u.email.toLowerCase() : '';
        return (uId && uId === decodedId) || (decodedEmail && uEmail === decodedEmail);
      });

      if (!user) {
        // Fallback construct user object if token is valid
        req.user = {
          user_id: decoded.user_id,
          email: decoded.email,
          role_name: decoded.role_name || 'RADIOLOGIST'
        };
        return next();
      }

      const statusStr = user.status || 'ACTIVE';
      if (statusStr !== 'ACTIVE' && user.is_active === false) {
        return res.status(401).json({ success: false, message: 'User account is inactive or suspended.' });
      }

      req.user = {
        ...user,
        user_id: user.id || user.user_id || decoded.user_id,
        role_name: user.role_name || user.roleName || decoded.role_name || 'RADIOLOGIST'
      };
      next();
    } catch (dbErr) {
      console.error('Auth middleware error:', dbErr);
      req.user = {
        user_id: decoded.user_id,
        email: decoded.email,
        role_name: decoded.role_name || 'RADIOLOGIST'
      };
      next();
    }
  });
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const userRole = req.user.role_name;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Role '${userRole}' does not have permissions for this action.`
      });
    }

    next();
  };
}

export { JWT_SECRET };
