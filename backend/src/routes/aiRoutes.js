// backend/src/routes/aiRoutes.js
import express from 'express';
import { triggerAIAnalysis, getAIAnalysisByStudy, updateFindingStatus } from '../controllers/aiController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/analyze-study', triggerAIAnalysis);
router.get('/study/:studyId', getAIAnalysisByStudy);
router.patch('/findings/:findingId/status', authorizeRoles('ADMIN', 'RADIOLOGIST'), updateFindingStatus);

export default router;
