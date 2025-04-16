// backend/controllers/clickhouseController.js
const { clickhouseClient } = require('../services/clickhouseService');

const getTables = async (req, res) => {
  try {
    const result = await clickhouseClient.query({
      query: `SHOW TABLES`,
      format: 'JSON',
    }).toPromise();

    const tables = result.data.map(row => row.name || Object.values(row)[0]);
    console.log(tables);
    res.status(200).json({ tables });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
};

const exportFromClickHouse = async (req, res) => {
  const { tableName } = req.body;

  try {
    const result = await clickhouseClient.query({
      query: `SELECT * FROM ${tableName} LIMIT 100`,
      format: 'JSON',
    }).toPromise();

    res.status(200).json({ data: result.data });
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
};

module.exports = {
  getTables,
  exportFromClickHouse,
};
