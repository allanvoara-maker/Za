const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'omapi.db');
const db = new Database(dbPath);

// SQLite compatibility layer (same interface as PostgreSQL wrapper)
const sqliteDb = {
  prepare: (sql) => {
    return {
      get: (...params) => {
        const stmt = db.prepare(sql);
        return stmt.get(...params);
      },
      all: (...params) => {
        const stmt = db.prepare(sql);
        return stmt.all(...params);
      },
      run: (...params) => {
        const stmt = db.prepare(sql);
        const result = stmt.run(...params);
        return {
          lastInsertRowid: result.lastInsertRowid,
          changes: result.changes
        };
      }
    };
  },
  exec: (sql) => {
    db.exec(sql);
  }
};

async function initDb() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS dossiers (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'En attente d''examen',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lat REAL,
        lng REAL,
        logo_embedding BLOB,
        batch_id TEXT
      );
    `);


    db.exec(`
      CREATE TABLE IF NOT EXISTS marque_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dossier_id TEXT REFERENCES dossiers(id) ON DELETE CASCADE,
        applicant_type TEXT,
        applicant_address TEXT,
        applicant_phone TEXT,
        applicant_nationality TEXT,
        brand_type TEXT,
        brand_colors TEXT,
        logo_url TEXT,
        brand_description TEXT,
        originality_report TEXT,
        logo_description TEXT
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS dossier_classes (
        dossier_id TEXT REFERENCES dossiers(id) ON DELETE CASCADE,
        class_id INTEGER NOT NULL,
        PRIMARY KEY (dossier_id, class_id)
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS message_threads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'omapi',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id INTEGER REFERENCES message_threads(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        sender_name TEXT NOT NULL,
        content TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS trademark_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query_name TEXT UNIQUE NOT NULL,
        result_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ SQLite database initialized successfully.');
  } catch (err) {
    console.error('❌ Error initializing SQLite database:', err.message);
    throw err;
  }
}

// Seed admin if not exists
;(async () => {
  try {
    const adminExists = sqliteDb
      .prepare('SELECT id FROM users WHERE email = ?')
      .get('admin@omapi.mg')
    if (!adminExists) {
      const hash = bcrypt.hashSync('admin123', 10)
      sqliteDb
        .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
        .run('Admin OMAPI', 'admin@omapi.mg', hash, 'admin')
      console.log('✅ Default admin created: admin@omapi.mg / admin123')
    }
  } catch (err) {
    console.error('Error seeding admin:', err.message)
  }
})()

module.exports = {
  db: sqliteDb,
  initDb,
};
