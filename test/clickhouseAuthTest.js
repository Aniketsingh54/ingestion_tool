import { ClickHouse } from 'clickhouse';
import assert from 'assert';

const clickHouseConfig = {
  url: 'http://localhost:8123',
  user: 'root',
  password: 'root_password',  // Ensure this password matches what's in the ClickHouse container
  database: 'default',
};

describe('ClickHouse Authentication and Operations', function () {

  // Test to check if we can connect and get the version
  it('should connect to ClickHouse and get the version', async function () {
    const clickHouse = new ClickHouse(clickHouseConfig);

    try {
      const result = await clickHouse.query('SELECT version()').toPromise();
      assert.ok(result);
      console.log('Version:', result);
    } catch (error) {
      assert.fail('Connection failed: ' + error.message);
    }
  });

  // Test to create a table
  it('should create a table', async function () {
    const clickHouse = new ClickHouse(clickHouseConfig);

    try {
      await clickHouse.query(`
        CREATE TABLE IF NOT EXISTS test_table (
          id UInt32,
          name String
        ) ENGINE = MergeTree()
        ORDER BY id;
      `).toPromise();
      console.log('Table created successfully.');
    } catch (error) {
      assert.fail('Error creating table: ' + error.message);
    }
  });

 // Test to insert rows into the table
 it('should insert rows into the table', async function () {
    const clickHouse = new ClickHouse(clickHouseConfig);

    try {
      await clickHouse.query(`
        INSERT INTO test_table (id, name) VALUES 
        (1, 'Alice'),
        (2, 'Bob'),
        (3, 'Charlie');
      `).toPromise();
      console.log('Rows inserted successfully.');
    } catch (error) {
      assert.fail('Error inserting rows: ' + error.message);
    }
  });

  // Test to select rows from the table
  it('should select rows from the table', async function () {
    const clickHouse = new ClickHouse(clickHouseConfig);

    try {
      const result = await clickHouse.query('SELECT * FROM test_table').toPromise();
      console.log('Selected rows:', result);
    //   assert.strictEqual(result.length, 3);  // Check if 3 rows are inserted
      assert.strictEqual(result[0].name, 'Alice');
    } catch (error) {
      assert.fail('Error selecting rows: ' + error.message);
    }
  });
});
