// backend/src/routes/authRoutes.js
import express from 'express';
import { login, googleLogin, register, getCurrentUser, forgotPassword, resetPassword, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleLogin);
router.get('/me', authenticateToken, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', authenticateToken, logout);

export default router;

