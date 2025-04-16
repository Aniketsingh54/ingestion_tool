const { ClickHouse } = require('clickhouse');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const clickhouseClient = new ClickHouse({
  url: process.env.CLICKHOUSE_HOST || 'http://localhost',
  port: process.env.CLICKHOUSE_PORT || 8123,
  basicAuth: {
    username: process.env.CLICKHOUSE_USER || 'root',
    password: process.env.CLICKHOUSE_PASSWORD || 'root_password',
  },
  isUseGzip: false,
  format: 'json',
  config: {
    database: process.env.CLICKHOUSE_DATABASE || 'default',
  },
});

const sanitize = (val) => {
  if (val === undefined || val === null) return `'NULL'`;
  return `'${val.toString().replace(/'/g, "\\'")}'`;
};

const insertCSVToClickHouse = async (filePath, tableName = 'uploaded_table', batchSize = 100) => {
  const records = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => records.push(row))
      .on('end', async () => {
        if (!records.length) return reject('CSV is empty');

        const columns = Object.keys(records[0]);
        records.shift();
        console.log(`Columns: ${columns}`);

        // Step 1: Create table with all columns as String
        const columnDefs = columns.map(col => `\`${col}\` String`).join(', ');
        const createQuery = `
          CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})
          ENGINE = MergeTree() ORDER BY tuple()
        `;

        try {
          await clickhouseClient.query(createQuery).toPromise();
          console.log(`✅ Table '${tableName}' created`);

          // Step 2: Insert data in batches
          const values = records.map(row => columns.map(col => sanitize(row[col])));
          const batchCount = Math.ceil(values.length / batchSize);

          for (let i = 0; i < batchCount; i++) {
            const batch = values.slice(i * batchSize, (i + 1) * batchSize);
            const insertQuery = `
            INSERT INTO ${tableName} (${columns.map(col => `\`${col}\``).join(', ')})
            VALUES ${batch.map(row => `(${row.join(',')})`).join(',')}
            `;
            await clickhouseClient.query(insertQuery).toPromise();
            console.log(`✅ Inserted batch ${i + 1} of ${batchCount}`);
          }

          resolve();
        } catch (err) {
          console.error('❌ Error:', err.message);
          reject(err.message);
        }
      })
      .on('error', (err) => {
        console.error('❌ CSV Read Error:', err);
        reject(err.message);
      });
  });
};
// insertCSVToClickHouse('../uploads/sample','network_data',100);
module.exports = {
  clickhouseClient,
  insertCSVToClickHouse,
};
