const { Pool } = require('pg')
require('dotenv').config()

const connectionString =
  process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/omapi_portal'

const pool = new Pool({
  connectionString,
})

// SQLite compatibility wrapper for PostgreSQL
const db = {
  prepare: (sql) => {
    let pgSql = sql
    let index = 1
    // Replace SQLite "?" placeholders with PostgreSQL "$1", "$2", etc.
    pgSql = pgSql.replace(/\?/g, () => `$${index++}`)

    // Convert "INSERT OR REPLACE" for trademark_cache
    if (pgSql.toUpperCase().includes('INSERT OR REPLACE')) {
      if (pgSql.includes('trademark_cache')) {
        pgSql = `
          INSERT INTO trademark_cache (query_name, result_json)
          VALUES ($1, $2)
          ON CONFLICT (query_name)
          DO UPDATE SET result_json = EXCLUDED.result_json
          RETURNING id
        `
      }
    }

    // Automatically append RETURNING id to INSERT statements to get lastInsertRowid
    if (
      pgSql.trim().toUpperCase().startsWith('INSERT INTO') &&
      !pgSql.toUpperCase().includes('RETURNING')
    ) {
      pgSql += ' RETURNING id'
    }

    return {
      get: async (...params) => {
        const actualParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params
        const res = await pool.query(pgSql, actualParams)
        return res.rows[0]
      },
      all: async (...params) => {
        const actualParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params
        const res = await pool.query(pgSql, actualParams)
        return res.rows
      },
      run: async (...params) => {
        const actualParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params
        const res = await pool.query(pgSql, actualParams)
        return {
          lastInsertRowid: res.rows[0] ? res.rows[0].id : null,
          changes: res.rowCount,
        }
      },
    }
  },
  exec: async (sql) => {
    return await pool.query(sql)
  },
}

async function initDb() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS dossiers (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'En attente d''examen',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lat REAL,
        lng REAL,
        logo_embedding DOUBLE PRECISION[],
        batch_id TEXT
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS marque_details (
        id SERIAL PRIMARY KEY,
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
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS dossier_classes (
        dossier_id TEXT REFERENCES dossiers(id) ON DELETE CASCADE,
        class_id INTEGER NOT NULL,
        PRIMARY KEY (dossier_id, class_id)
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS message_threads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'omapi',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER REFERENCES message_threads(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        sender_name TEXT NOT NULL,
        content TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS trademark_cache (
        id SERIAL PRIMARY KEY,
        query_name TEXT UNIQUE NOT NULL,
        result_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await client.query(`
      CREATE OR REPLACE FUNCTION cosine_similarity(a double precision[], b double precision[])
      RETURNS double precision AS $$
      DECLARE
          dot_product double precision := 0;
          norm_a double precision := 0;
          norm_b double precision := 0;
          i integer;
      BEGIN
          IF a IS NULL OR b IS NULL THEN
              RETURN 0;
          END IF;
          IF array_length(a, 1) IS NULL OR array_length(b, 1) IS NULL THEN
              RETURN 0;
          END IF;
          IF array_length(a, 1) != array_length(b, 1) THEN
              RETURN 0;
          END IF;
          FOR i IN 1..array_length(a, 1) LOOP
              dot_product := dot_product + (a[i] * b[i]);
              norm_a := norm_a + (a[i] * a[i]);
              norm_b := norm_b + (b[i] * b[i]);
          END LOOP;
          IF norm_a = 0 OR norm_b = 0 THEN
              RETURN 0;
          END IF;
          RETURN dot_product / (sqrt(norm_a) * sqrt(norm_b));
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `)

    await client.query('COMMIT')
    console.log('✅ PostgreSQL tables and custom functions initialized successfully.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Error initializing PostgreSQL database:', err.message)
    throw err
  } finally {
    client.release()
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDb,
  db,
}
