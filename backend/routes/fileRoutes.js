// backend/routes/fileRoutes.js
const express = require('express');
const multer = require('multer');
const { uploadFile, ingestToClickHouse } = require('../controllers/fileController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadFile);
router.post('/ingest-to-clickhouse', ingestToClickHouse);

module.exports = router;
