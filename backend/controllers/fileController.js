// backend/controllers/fileController.js
const csv = require('csv-parser');
const fs = require('fs');
const { insertCSVToClickHouse } = require('../services/clickhouseService');

const uploadFile = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.status(200).json({ message: 'File uploaded', path: req.file.path });
};

const ingestToClickHouse = async (req, res) => {
  const filePath = req.body.filePath;
  const tableName = req.body.tableName;

  try {
    await insertCSVToClickHouse(filePath, tableName);
    res.status(200).json({ message: 'Data ingested successfully' });
  } catch (err) {
    console.error('Ingestion error:', err);
    res.status(500).json({ error: 'Ingestion failed' });
  }
};

module.exports = {
  uploadFile,
  ingestToClickHouse,
};
