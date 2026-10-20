const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'omapi.db'));
const cols = db.prepare("PRAGMA table_info(marque_details)").all();
console.log('marque_details columns:', cols.map(c => c.name).join(', '));
db.close();
console.log('Schema check OK!');
