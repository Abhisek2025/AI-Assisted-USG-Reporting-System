// backend/src/controllers/reportController.js
import { dbSaveReportDraft, dbApproveReport, dbAmendReport, dbGetStudyById, dbGetAllReports } from '../services/dbService.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { broadcastRealtimeEvent } from '../realtime.js';

export async function getAllReports(req, res) {
  try {
    const all = await dbGetAllReports();
    return res.json({ success: true, data: all });
  } catch (err) {
    console.error('getAllReports Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reports.' });
  }
}

export async function getReportByStudy(req, res) {
  try {
    const { studyId } = req.params;
    const studyData = await dbGetStudyById(studyId);

    if (!studyData || !studyData.report) {
      return res.status(404).json({ success: false, message: 'No report draft exists for this study.' });
    }

    return res.json({
      success: true,
      data: {
        report: studyData.report,
        patient: studyData.patient,
        study: studyData
      }
    });
  } catch (err) {
    console.error('getReportByStudy Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve report.' });
  }
}

export async function saveReportDraft(req, res) {
  try {
    const {
      study_id,
      findings_text,
      impression,
      recommendations
    } = req.body;

    if (!study_id) {
      return res.status(400).json({ success: false, message: 'Study ID is required.' });
    }

    const radId = req.user?.id || 1;
    const saved = await dbSaveReportDraft(
      study_id,
      radId,
      impression || 'Ultrasound scan findings evaluated.',
      findings_text || '',
      recommendations || ''
    );

    logAuditEvent(req, {
      userId: radId,
      action: 'REPORT_EDITED',
      entityType: 'REPORT',
      entityId: saved.id,
      details: {}
    });

    broadcastRealtimeEvent('REPORT_DRAFTED', { study_id: Number(study_id), report: saved });

    return res.json({
      success: true,
      message: 'Report draft saved successfully.',
      data: saved
    });
  } catch (err) {
    console.error('saveReportDraft Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save report draft.' });
  }
}

export async function approveReport(req, res) {
  try {
    const { reportId } = req.params;
    const approved = await dbApproveReport(reportId);

    if (!approved) {
      return res.status(404).json({ success: false, message: 'Report record not found.' });
    }

    logAuditEvent(req, {
      userId: req.user?.id || 1,
      action: 'REPORT_APPROVED',
      entityType: 'REPORT',
      entityId: approved.id,
      details: {}
    });

    broadcastRealtimeEvent('REPORT_APPROVED', { report_id: approved.id, study_id: approved.studyId, report: approved });

    return res.json({
      success: true,
      message: 'Report approved and digitally signed successfully.',
      data: approved
    });
  } catch (err) {
    console.error('approveReport Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve report.' });
  }
}

export async function amendReport(req, res) {
  try {
    const { reportId } = req.params;
    const { change_reason, findings_text, impression, recommendations } = req.body;

    if (!change_reason) {
      return res.status(400).json({ success: false, message: 'A valid reason for amending the report is required.' });
    }

    const amended = await dbAmendReport(reportId, impression, findings_text, recommendations);

    logAuditEvent(req, {
      userId: req.user?.id || 1,
      action: 'REPORT_AMENDED',
      entityType: 'REPORT',
      entityId: amended.id,
      details: { reason: change_reason }
    });

    broadcastRealtimeEvent('REPORT_AMENDED', { report_id: amended.id, report: amended });

    return res.json({
      success: true,
      message: 'Report amended successfully. Version history updated.',
      data: amended
    });
  } catch (err) {
    console.error('amendReport Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to amend report.' });
  }
}

export async function getReportVersions(req, res) {
  return res.json({ success: true, data: [] });
}
