// backend/src/routes/patientRoutes.js
import express from 'express';
import { getAllPatients, getPatientById, createPatient, updatePatient } from '../controllers/patientController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.post('/', authorizeRoles('ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN'), createPatient);
router.put('/:id', authorizeRoles('ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN'), updatePatient);

export default router;
