// backend/app.js
const express = require('express');
const dotenv = require('dotenv');
const fileRoutes = require('./routes/fileRoutes');
const {getTables,exportFromClickHouse} = require('./controllers/clickhouseController')
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/file', fileRoutes);
app.use('/api/clickhouse/tables',getTables);
app.use('/api/clickhouse/export',exportFromClickHouse);

app.get('/', (req, res) => {
  res.send('Welcome to the ClickHouse Data Ingestion API');
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
