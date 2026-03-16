const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to upload straight to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gstyle_carros', // Folder name in Cloudinary
    resource_type: 'auto',   // VITAL para permitir vídeos (decide sozinho se é img ou vid)
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'],
    // Retirado o transformation crop pq ele quebra a conversão de vídeos. O frontend pode limitar por CSS.
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB per file: Vídeos precisam de um limite maior
});

// POST /api/upload
// Receives multiple image files, uploads to Cloudinary, and returns public URLs
router.post('/', upload.array('images', 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    // req.files is populated by multer-storage-cloudinary, and contains the remote path
    const urls = req.files.map(file => file.path); // 'file.path' holds the full Cloudinary HTTP URL

    res.json({ urls, count: urls.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar imagens no Cloudinary: ' + err.message });
  }
});

module.exports = router;
