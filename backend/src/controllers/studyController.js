// backend/src/controllers/studyController.js
import { dbGetAllStudies, dbGetStudyById, dbCreateStudy, dbAssignRadiologist, dbUpdateStudyStatus } from '../services/dbService.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { broadcastRealtimeEvent } from '../realtime.js';

export async function getAllStudies(req, res) {
  try {
    const { status, priority, study_type, radiologist_id, patient_id, search, priority_only } = req.query;

    let formatted = await dbGetAllStudies();

    if (status) {
      formatted = formatted.filter(s => s.status === status);
    }

    if (priority) {
      formatted = formatted.filter(s => s.priority === priority);
    }

    if (priority_only === 'true') {
      formatted = formatted.filter(s => s.priority === 'URGENT' || s.priority === 'EMERGENCY');
    }

    if (study_type) {
      formatted = formatted.filter(s => s.study_type === study_type);
    }

    if (radiologist_id) {
      formatted = formatted.filter(s => s.assigned_radiologist_id === Number(radiologist_id));
    }

    if (patient_id) {
      formatted = formatted.filter(s => s.patient_id === Number(patient_id));
    }

    if (search) {
      const q = search.toLowerCase();
      formatted = formatted.filter(s =>
        (s.study_code && s.study_code.toLowerCase().includes(q)) ||
        (s.patient_name && s.patient_name.toLowerCase().includes(q)) ||
        (s.patient_uhid && s.patient_uhid.toLowerCase().includes(q)) ||
        (s.study_type && s.study_type.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    console.error('getAllStudies Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve studies.' });
  }
}

export async function getStudyById(req, res) {
  try {
    const { id } = req.params;
    const data = await dbGetStudyById(id);

    if (!data) {
      return res.status(404).json({ success: false, message: 'USG Study record not found.' });
    }

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('getStudyById Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve study details.' });
  }
}

export async function createStudy(req, res) {
  try {
    const {
      patient_id,
      study_type,
      body_region,
      referring_doctor,
      clinical_indication,
      assigned_radiologist_id,
      priority = 'ROUTINE'
    } = req.body;

    if (!patient_id || !study_type || !clinical_indication) {
      return res.status(400).json({ success: false, message: 'Patient ID, study type, and clinical indication are required.' });
    }

    const created = await dbCreateStudy({
      patient_id,
      study_type,
      body_region,
      referring_doctor,
      clinical_indication,
      assigned_radiologist_id,
      priority,
      technician_id: req.user?.id || 1
    });

    logAuditEvent(req, {
      userId: req.user?.user_id || 1,
      action: 'STUDY_CREATED',
      entityType: 'STUDY',
      entityId: created.id,
      details: { study_code: created.studyCode, study_type, priority }
    });

    broadcastRealtimeEvent('STUDY_CREATED', created);

    return res.status(201).json({
      success: true,
      message: `USG study ${created.studyCode} registered successfully.`,
      data: created
    });
  } catch (err) {
    console.error('createStudy Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create USG study.' });
  }
}

export async function assignRadiologist(req, res) {
  try {
    const { id } = req.params;
    const { radiologist_id } = req.body;

    const updated = await dbAssignRadiologist(id, radiologist_id);

    broadcastRealtimeEvent('STUDY_UPDATED', updated);

    return res.json({
      success: true,
      message: `Study successfully assigned to radiologist.`,
      data: updated
    });
  } catch (err) {
    console.error('assignRadiologist Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to assign radiologist.' });
  }
}

export async function updateStudyStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await dbUpdateStudyStatus(id, status);

    broadcastRealtimeEvent('STUDY_UPDATED', updated);

    return res.json({
      success: true,
      message: `Study status updated to ${status}.`,
      data: updated
    });
  } catch (err) {
    console.error('updateStudyStatus Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update study status.' });
  }
}
