const Database = require('better-sqlite3');
const path = require('path');

try {
  const db = new Database(path.join(__dirname, 'omapi.db'));
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables found:', tables.map(t => t.name).join(', '));
  const users = db.prepare('SELECT id, name, email, role FROM users').all();
  console.log('Users:', JSON.stringify(users, null, 2));
  db.close();
  console.log('Database OK!');
} catch (err) {
  console.error('DB Error:', err.message);
}
