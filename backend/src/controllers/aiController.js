// backend/src/controllers/aiController.js
import { dbUpdateFindingStatus, dbUpdateStudyStatus, dbGetStudyById } from '../services/dbService.js';
import { analyzeStudyAI } from '../services/aiService.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { broadcastRealtimeEvent } from '../realtime.js';

export async function triggerAIAnalysis(req, res) {
  try {
    const { study_id } = req.body;
    if (!study_id) {
      return res.status(400).json({ success: false, message: 'Study ID is required.' });
    }

    await dbUpdateStudyStatus(study_id, 'AI_PROCESSING');

    logAuditEvent(req, {
      userId: req.user?.user_id || 1,
      action: 'AI_ANALYSIS_REQUESTED',
      entityType: 'STUDY',
      entityId: Number(study_id),
      details: {}
    });

    const result = await analyzeStudyAI(study_id);
    await dbUpdateStudyStatus(study_id, 'AI_COMPLETED');

    const updatedStudy = await dbGetStudyById(study_id);

    broadcastRealtimeEvent('AI_ANALYSIS_COMPLETED', { study_id: Number(study_id), study: updatedStudy });

    return res.json({
      success: true,
      message: 'AI draft analysis generated successfully.',
      disclaimer: 'AI-generated draft — not a final diagnosis. Radiologist review required.',
      data: result
    });
  } catch (err) {
    console.error('triggerAIAnalysis Error:', err);
    return res.status(500).json({ success: false, message: `AI Analysis failed: ${err.message}` });
  }
}

export async function getAIAnalysisByStudy(req, res) {
  const { studyId } = req.params;
  const studyData = await dbGetStudyById(studyId);

  if (!studyData) {
    return res.status(404).json({ success: false, message: 'No AI analysis found for this study.' });
  }

  return res.json({
    success: true,
    data: {
      analysis: { status: 'COMPLETED' },
      findings: studyData.ai_findings || []
    }
  });
}

export async function updateFindingStatus(req, res) {
  try {
    const { findingId } = req.params;
    const { status } = req.body;

    const isAccepted = status === 'ACCEPTED' ? 'ACCEPTED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING';
    const updated = await dbUpdateFindingStatus(findingId, isAccepted);

    broadcastRealtimeEvent('FINDING_UPDATED', updated);

    return res.json({
      success: true,
      message: `Finding status updated successfully.`,
      data: updated
    });
  } catch (err) {
    console.error('updateFindingStatus Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update finding status.' });
  }
}
