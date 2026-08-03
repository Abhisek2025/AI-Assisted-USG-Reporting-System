// backend/src/routes/reportRoutes.js
import express from 'express';
import { getAllReports, getReportByStudy, saveReportDraft, approveReport, amendReport, getReportVersions } from '../controllers/reportController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllReports);
router.get('/study/:studyId', getReportByStudy);
router.post('/draft', authorizeRoles('ADMIN', 'RADIOLOGIST'), saveReportDraft);
router.post('/:reportId/approve', authorizeRoles('ADMIN', 'RADIOLOGIST'), approveReport);
router.post('/:reportId/amend', authorizeRoles('ADMIN', 'RADIOLOGIST'), amendReport);
router.get('/:reportId/versions', getReportVersions);

export default router;
