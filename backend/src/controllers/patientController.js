// backend/src/controllers/patientController.js
import { dbGetAllPatients, dbGetPatientById, dbCreatePatient, dbUpdatePatient } from '../services/dbService.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { broadcastRealtimeEvent } from '../realtime.js';

export async function getAllPatients(req, res) {
  try {
    const { search, gender, blood_group, page = 1, limit = 10 } = req.query;
    let list = await dbGetAllPatients();

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.firstName && p.firstName.toLowerCase().includes(q)) ||
        (p.lastName && p.lastName.toLowerCase().includes(q)) ||
        (p.uhid && p.uhid.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q))
      );
    }

    if (gender) {
      list = list.filter(p => p.gender === gender.toUpperCase());
    }

    if (blood_group) {
      list = list.filter(p => p.bloodGroup === blood_group);
    }

    const formatted = list.map(p => ({
      patient_id: p.id,
      uhid: p.uhid,
      first_name: p.firstName,
      last_name: p.lastName,
      gender: p.gender,
      date_of_birth: p.dateOfBirth,
      age: p.age,
      phone: p.phone,
      email: p.email,
      address: p.address,
      blood_group: p.bloodGroup,
      referring_doctor: p.referringDoctor,
      medical_history: p.medicalHistory,
      allergies: p.allergies,
      created_at: p.createdAt,
    }));

    const total = formatted.length;
    const startIndex = (page - 1) * limit;
    const paginated = formatted.slice(startIndex, startIndex + Number(limit));

    return res.json({
      success: true,
      data: {
        patients: paginated,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('getAllPatients Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch patients.' });
  }
}

export async function getPatientById(req, res) {
  try {
    const { id } = req.params;
    const patient = await dbGetPatientById(id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const formattedPatient = {
      patient_id: patient.id,
      uhid: patient.uhid,
      first_name: patient.firstName,
      last_name: patient.lastName,
      gender: patient.gender,
      date_of_birth: patient.dateOfBirth,
      age: patient.age,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      blood_group: patient.bloodGroup,
      referring_doctor: patient.referringDoctor,
      medical_history: patient.medicalHistory,
      allergies: patient.allergies,
      created_at: patient.createdAt,
    };

    return res.json({
      success: true,
      data: {
        patient: formattedPatient,
        studies: [],
        reports: []
      }
    });
  } catch (err) {
    console.error('getPatientById Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch patient details.' });
  }
}

export async function createPatient(req, res) {
  try {
    const {
      first_name,
      last_name,
      gender,
      date_of_birth,
      age,
      phone,
      email,
      address,
      blood_group,
      referring_doctor,
      medical_history,
      allergies
    } = req.body;

    if (!first_name || !last_name || !gender || !phone) {
      return res.status(400).json({ success: false, message: 'First name, last name, gender, and phone number are required.' });
    }

    const created = await dbCreatePatient({
      first_name,
      last_name,
      gender: gender.toUpperCase(),
      date_of_birth,
      age,
      phone,
      email,
      address,
      blood_group,
      referring_doctor,
      medical_history,
      allergies,
      created_by: req.user?.id || 1
    });

    const formatted = {
      patient_id: created.id,
      uhid: created.uhid,
      first_name: created.firstName,
      last_name: created.lastName,
      gender: created.gender,
      date_of_birth: created.dateOfBirth,
      age: created.age,
      phone: created.phone,
      email: created.email,
      address: created.address,
      blood_group: created.bloodGroup,
      referring_doctor: created.referringDoctor,
      medical_history: created.medicalHistory,
      allergies: created.allergies,
      created_at: created.createdAt
    };

    logAuditEvent(req, {
      userId: req.user?.user_id || 1,
      action: 'PATIENT_CREATED',
      entityType: 'PATIENT',
      entityId: created.id,
      details: { uhid: created.uhid, name: `${first_name} ${last_name}` }
    });

    broadcastRealtimeEvent('PATIENT_CREATED', formatted);

    return res.status(201).json({
      success: true,
      message: `Patient registered successfully with UHID ${created.uhid}.`,
      data: formatted
    });
  } catch (err) {
    console.error('createPatient Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create patient.' });
  }
}

export async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const updated = await dbUpdatePatient(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const formatted = {
      patient_id: updated.id,
      uhid: updated.uhid,
      first_name: updated.firstName,
      last_name: updated.lastName,
      gender: updated.gender,
      date_of_birth: updated.dateOfBirth,
      age: updated.age,
      phone: updated.phone,
      email: updated.email,
      address: updated.address,
      blood_group: updated.bloodGroup,
      referring_doctor: updated.referringDoctor,
      medical_history: updated.medicalHistory,
      allergies: updated.allergies,
      updated_at: updated.updatedAt
    };

    logAuditEvent(req, {
      userId: req.user?.user_id || 1,
      action: 'PATIENT_UPDATED',
      entityType: 'PATIENT',
      entityId: updated.id,
      details: { uhid: updated.uhid }
    });

    broadcastRealtimeEvent('PATIENT_UPDATED', formatted);

    return res.json({
      success: true,
      message: 'Patient record updated successfully.',
      data: formatted
    });
  } catch (err) {
    console.error('updatePatient Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update patient.' });
  }
}
