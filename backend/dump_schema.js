const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'omapi.db'));

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

for (const t of tables) {
  console.log('\n=== TABLE: ' + t.name + ' ===');
  const cols = db.prepare('PRAGMA table_info(' + t.name + ')').all();
  console.log(JSON.stringify(cols, null, 2));
  const fks = db.prepare('PRAGMA foreign_key_list(' + t.name + ')').all();
  if (fks.length > 0) {
    console.log('--- FOREIGN KEYS ---');
    console.log(JSON.stringify(fks, null, 2));
  }
  const indexes = db.prepare('PRAGMA index_list(' + t.name + ')').all();
  if (indexes.length > 0) {
    console.log('--- INDEXES ---');
    console.log(JSON.stringify(indexes, null, 2));
  }
}
db.close();
