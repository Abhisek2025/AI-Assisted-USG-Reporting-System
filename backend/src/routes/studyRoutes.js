// backend/src/routes/studyRoutes.js
import express from 'express';
import { getAllStudies, getStudyById, createStudy, assignRadiologist, updateStudyStatus } from '../controllers/studyController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllStudies);
router.get('/:id', getStudyById);
router.post('/', authorizeRoles('ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN'), createStudy);
router.patch('/:id/assign', authorizeRoles('ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN'), assignRadiologist);
router.patch('/:id/status', updateStudyStatus);

export default router;
