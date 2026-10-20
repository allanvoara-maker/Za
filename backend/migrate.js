const Database = require('better-sqlite3');
const path = require('path');
const { pool, initDb } = require('./db');

async function migrate() {
  console.log('🔄 Starting SQLite to PostgreSQL migration...');
  
  // 1. Drop existing tables to avoid schema mismatches
  const preClient = await pool.connect();
  try {
    console.log('🗑️ Dropping existing tables to align schema...');
    await preClient.query('DROP TABLE IF EXISTS messages CASCADE');
    await preClient.query('DROP TABLE IF EXISTS message_threads CASCADE');
    await preClient.query('DROP TABLE IF EXISTS notifications CASCADE');
    await preClient.query('DROP TABLE IF EXISTS dossier_classes CASCADE');
    await preClient.query('DROP TABLE IF EXISTS marque_details CASCADE');
    await preClient.query('DROP TABLE IF EXISTS dossiers CASCADE');
    await preClient.query('DROP TABLE IF EXISTS users CASCADE');
    await preClient.query('DROP TABLE IF EXISTS trademark_cache CASCADE');
  } finally {
    preClient.release();
  }

  // 2. Init PostgreSQL Schema
  await initDb();

  // 2. Open SQLite database
  const sqliteDb = new Database(path.join(__dirname, 'omapi.db'));
  console.log('📖 Opened SQLite database successfully.');

  const pgClient = await pool.connect();

  try {
    // 3. Clear PostgreSQL tables to start fresh (in order of foreign keys)
    console.log('🧹 Clearing existing PostgreSQL tables...');
    await pgClient.query('TRUNCATE TABLE messages CASCADE');
    await pgClient.query('TRUNCATE TABLE message_threads CASCADE');
    await pgClient.query('TRUNCATE TABLE notifications CASCADE');
    await pgClient.query('TRUNCATE TABLE dossier_classes CASCADE');
    await pgClient.query('TRUNCATE TABLE marque_details CASCADE');
    await pgClient.query('TRUNCATE TABLE dossiers CASCADE');
    await pgClient.query('TRUNCATE TABLE users CASCADE');
    await pgClient.query('TRUNCATE TABLE trademark_cache CASCADE');

    // 4. Migrate 'users'
    console.log('👥 Migrating users...');
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const u of users) {
      await pgClient.query(
        'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [u.id, u.name, u.email, u.password_hash, u.role, u.created_at]
      );
    }
    await pgClient.query("SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false)");

    // 5. Migrate 'dossiers'
    console.log('📂 Migrating dossiers...');
    const dossiers = sqliteDb.prepare('SELECT * FROM dossiers').all();
    for (const d of dossiers) {
      await pgClient.query(
        'INSERT INTO dossiers (id, user_id, type, name, status, created_at, lat, lng) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [d.id, d.user_id, d.type, d.name, d.status, d.created_at, d.lat, d.lng]
      );
    }

    // 6. Migrate 'marque_details'
    console.log('🎨 Migrating marque_details...');
    const details = sqliteDb.prepare('SELECT * FROM marque_details').all();
    for (const md of details) {
      await pgClient.query(
        'INSERT INTO marque_details (id, dossier_id, applicant_type, applicant_address, applicant_phone, applicant_nationality, brand_type, brand_colors, logo_url, brand_description, originality_report, logo_description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [
          md.id,
          md.dossier_id,
          md.applicant_type,
          md.applicant_address,
          md.applicant_phone,
          md.applicant_nationality,
          md.brand_type,
          md.brand_colors,
          md.logo_url,
          md.brand_description,
          md.originality_report,
          md.logo_description,
        ]
      );
    }
    await pgClient.query("SELECT setval('marque_details_id_seq', COALESCE((SELECT MAX(id)+1 FROM marque_details), 1), false)");

    // 7. Migrate 'dossier_classes'
    console.log('🏷️ Migrating dossier_classes...');
    const classes = sqliteDb.prepare('SELECT * FROM dossier_classes').all();
    for (const dc of classes) {
      await pgClient.query(
        'INSERT INTO dossier_classes (dossier_id, class_id) VALUES ($1, $2)',
        [dc.dossier_id, dc.class_id]
      );
    }

    // 8. Migrate 'notifications'
    console.log('🔔 Migrating notifications...');
    const notifications = sqliteDb.prepare('SELECT * FROM notifications').all();
    for (const n of notifications) {
      await pgClient.query(
        'INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES ($1, $2, $3, $4, $5)',
        [n.id, n.user_id, n.message, n.is_read, n.created_at]
      );
    }
    await pgClient.query("SELECT setval('notifications_id_seq', COALESCE((SELECT MAX(id)+1 FROM notifications), 1), false)");

    // 9. Migrate 'message_threads'
    console.log('💬 Migrating message_threads...');
    const threads = sqliteDb.prepare('SELECT * FROM message_threads').all();
    for (const mt of threads) {
      await pgClient.query(
        'INSERT INTO message_threads (id, user_id, subject, category, created_at) VALUES ($1, $2, $3, $4, $5)',
        [mt.id, mt.user_id, mt.subject, mt.category, mt.created_at]
      );
    }
    await pgClient.query("SELECT setval('message_threads_id_seq', COALESCE((SELECT MAX(id)+1 FROM message_threads), 1), false)");

    // 10. Migrate 'messages'
    console.log('✉️ Migrating messages...');
    const messages = sqliteDb.prepare('SELECT * FROM messages').all();
    for (const m of messages) {
      await pgClient.query(
        'INSERT INTO messages (id, thread_id, sender_id, sender_name, content, is_read, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [m.id, m.thread_id, m.sender_id, m.sender_name, m.content, m.is_read, m.created_at]
      );
    }
    await pgClient.query("SELECT setval('messages_id_seq', COALESCE((SELECT MAX(id)+1 FROM messages), 1), false)");

    // 11. Migrate 'trademark_cache'
    console.log('⚡ Migrating trademark_cache...');
    const cache = sqliteDb.prepare('SELECT * FROM trademark_cache').all();
    for (const tc of cache) {
      await pgClient.query(
        'INSERT INTO trademark_cache (id, query_name, result_json, created_at) VALUES ($1, $2, $3, $4)',
        [tc.id, tc.query_name, tc.result_json, tc.created_at]
      );
    }
    await pgClient.query("SELECT setval('trademark_cache_id_seq', COALESCE((SELECT MAX(id)+1 FROM trademark_cache), 1), false)");

    console.log('🎉 SQLite to PostgreSQL migration finished successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    pgClient.release();
    sqliteDb.close();
    await pool.end();
  }
}

migrate();
