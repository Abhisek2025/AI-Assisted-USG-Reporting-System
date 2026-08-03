// backend/src/routes/appointmentRoutes.js
import express from 'express';
import {
  getDoctors,
  getAppointments,
  createAppointment,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/doctors', getDoctors);
router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id/status', updateAppointmentStatus);

export default router;
