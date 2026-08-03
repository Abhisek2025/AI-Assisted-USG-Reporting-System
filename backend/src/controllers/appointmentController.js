// backend/src/controllers/appointmentController.js
import {
  dbGetAllDoctors,
  dbGetAllAppointments,
  dbCreateAppointment,
  dbUpdateAppointmentStatus
} from '../services/firestoreService.js';
import { broadcastRealtimeEvent } from '../realtime.js';

export async function getDoctors(req, res) {
  try {
    const doctors = await dbGetAllDoctors();
    return res.json({
      success: true,
      data: doctors
    });
  } catch (err) {
    console.error('getDoctors error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch doctors list.' });
  }
}

export async function getAppointments(req, res) {
  try {
    const appointments = await dbGetAllAppointments();
    return res.json({
      success: true,
      data: appointments
    });
  } catch (err) {
    console.error('getAppointments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
  }
}

export async function createAppointment(req, res) {
  try {
    const {
      patient_name,
      age,
      gender,
      phone,
      email,
      doctor_id,
      doctor_name,
      usg_service,
      appointment_date,
      slot_time,
      symptoms,
      notes
    } = req.body;

    if (!patient_name || !phone || !doctor_name || !usg_service || !appointment_date || !slot_time) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, contact phone, doctor, USG service, appointment date, and time slot are required.'
      });
    }

    const appointment = await dbCreateAppointment({
      patient_name,
      age,
      gender,
      phone,
      email,
      doctor_id,
      doctor_name,
      usg_service,
      appointment_date,
      slot_time,
      symptoms: symptoms || notes || 'USG Diagnostic Appointment'
    });

    broadcastRealtimeEvent('APPOINTMENT_CREATED', appointment);

    return res.json({
      success: true,
      message: 'USG Appointment booked successfully!',
      data: appointment
    });
  } catch (err) {
    console.error('createAppointment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create appointment.' });
  }
}

export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const updated = await dbUpdateAppointmentStatus(id, status);
    broadcastRealtimeEvent('APPOINTMENT_UPDATED', updated);

    return res.json({
      success: true,
      message: `Appointment ${id} status updated to ${status}.`,
      data: updated
    });
  } catch (err) {
    console.error('updateAppointmentStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update appointment status.' });
  }
}
