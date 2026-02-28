const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// In-memory storage — files stored as buffers and returned as base64 data URLs
// For production, swap this out for Cloudinary or AWS S3
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas (JPG, PNG, WEBP).'));
  }
});

// POST /api/upload
// Receives multiple image files and returns their base64 data URLs
router.post('/', upload.array('images', 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    const urls = req.files.map(file => {
      const base64 = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64}`;
    });

    res.json({ urls, count: urls.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar imagens: ' + err.message });
  }
});

module.exports = router;
