import Database from 'better-sqlite3';

const db = new Database('pixel_dashboard.db');

try {
  console.log('Attempting to query websites by user_id...');
  const stmt = db.prepare('SELECT * FROM websites WHERE user_id = ?');
  const result = stmt.all('legacy');
  console.log('Query successful. Found', result.length, 'websites for user_id "legacy".');
  
  // Also try inserting a new record to ensure the column is writable
  console.log('Attempting to insert a new website with user_id...');
  const insert = db.prepare('INSERT INTO websites (id, user_id, name, destination_url, pixel_id) VALUES (?, ?, ?, ?, ?)');
  insert.run('test-id-' + Date.now(), 'test-user', 'Test Site', 'http://example.com', '123');
  console.log('Insert successful.');

} catch (error) {
  console.error('Verification failed:', error);
}
