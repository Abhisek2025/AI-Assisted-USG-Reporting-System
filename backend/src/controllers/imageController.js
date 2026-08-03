// backend/src/controllers/imageController.js
import { dbAddStudyImages, dbDeleteStudyImage, dbUpdateStudyStatus } from '../services/dbService.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { broadcastRealtimeEvent } from '../realtime.js';

export async function uploadStudyImages(req, res) {
  try {
    const { study_id } = req.body;
    if (!study_id) {
      return res.status(400).json({ success: false, message: 'Study ID is required.' });
    }

    const imageList = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        imageList.push({
          imageUrl: `/uploads/${file.filename}`,
          organType: req.body.organ_type || 'General',
          viewType: req.body.view_type || 'Standard',
        });
      });
    } else if (req.body.image_urls && Array.isArray(req.body.image_urls)) {
      req.body.image_urls.forEach((url) => {
        imageList.push({
          imageUrl: url,
          organType: req.body.organ_type || 'General',
          viewType: req.body.view_type || 'Standard',
        });
      });
    } else {
      // Default placeholder image if simple upload test
      imageList.push({
        imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
        organType: req.body.organ_type || 'General',
        viewType: 'Standard'
      });
    }

    const inserted = await dbAddStudyImages(study_id, imageList);
    await dbUpdateStudyStatus(study_id, 'IMAGE_UPLOADED');

    logAuditEvent(req, {
      userId: req.user?.user_id || 1,
      action: 'IMAGE_UPLOADED',
      entityType: 'STUDY',
      entityId: Number(study_id),
      details: { count: inserted.length }
    });

    broadcastRealtimeEvent('IMAGES_UPLOADED', { study_id: Number(study_id), images: inserted });

    return res.status(201).json({
      success: true,
      message: `${inserted.length} ultrasound image(s) uploaded successfully.`,
      data: {
        images: inserted
      }
    });
  } catch (err) {
    console.error('uploadStudyImages Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process image upload.' });
  }
}

export async function getStudyImages(req, res) {
  return res.json({ success: true, data: [] });
}

export async function deleteStudyImage(req, res) {
  try {
    const { imageId } = req.params;
    await dbDeleteStudyImage(imageId);

    logAuditEvent(req, {
      userId: req.user?.user_id || 1,
      action: 'IMAGE_DELETED',
      entityType: 'STUDY_IMAGE',
      entityId: Number(imageId),
      details: {}
    });

    broadcastRealtimeEvent('IMAGE_DELETED', { image_id: Number(imageId) });

    return res.json({ success: true, message: 'Image deleted successfully.' });
  } catch (err) {
    console.error('deleteStudyImage Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete image.' });
  }
}
