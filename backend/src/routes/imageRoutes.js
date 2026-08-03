// backend/src/routes/imageRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadStudyImages, getStudyImages, deleteStudyImage } from '../controllers/imageController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `usg-${uniqueSuffix}${path.extname(file.originalname || '.jpg')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max file size
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

router.use(authenticateToken);

router.post('/upload', upload.array('images', 10), uploadStudyImages);
router.get('/study/:studyId', getStudyImages);
router.delete('/:imageId', authorizeRoles('ADMIN', 'RADIOLOGIST', 'TECHNICIAN', 'RECEPTIONIST'), deleteStudyImage);

export default router;
