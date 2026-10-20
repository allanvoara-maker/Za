const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: 'postgres://postgres@localhost:5432/omapi_portal' });

async function main() {
  const res = await pool.query("SELECT id, email, password_hash FROM users WHERE email = 'admin@omapi.mg'");
  console.log('Current admin user:', res.rows[0]);

  if (res.rows[0]) {
    const valid = await bcrypt.compare('admin123', res.rows[0].password_hash);
    console.log('Password "admin123" matches:', valid);

    if (!valid) {
      const newHash = await bcrypt.hash('admin123', 10);
      await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'admin@omapi.mg'", [newHash]);
      console.log('Admin password reset to admin123 successfully!');
    }
  }
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
