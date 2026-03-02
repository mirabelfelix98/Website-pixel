import Database from 'better-sqlite3';

const db = new Database('pixel_dashboard.db');

try {
  console.log('--- Checking websites table schema ---');
  const websitesInfo = db.pragma('table_info(websites)');
  console.log(JSON.stringify(websitesInfo, null, 2));

  console.log('--- Checking users table schema ---');
  const usersInfo = db.pragma('table_info(users)');
  console.log(JSON.stringify(usersInfo, null, 2));

} catch (error) {
  console.error('Schema check failed:', error);
}
