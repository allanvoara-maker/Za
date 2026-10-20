const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')
const { getSimilarityStats, checkAppropriateness, generateAlternativeNames } = require('./similarity')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'omapi_super_secret_key_2024'

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── SQLite Database Setup ─────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'omapi.db'))
db.pragma('journal_mode = WAL') // Better performance

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'client',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS dossiers (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'En attente d''examen',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS marque_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dossier_id TEXT REFERENCES dossiers(id) ON DELETE CASCADE,
    applicant_type TEXT,
    applicant_address TEXT,
    applicant_phone TEXT,
    applicant_nationality TEXT,
    brand_type TEXT,
    brand_colors TEXT,
    logo_url TEXT
  );

  CREATE TABLE IF NOT EXISTS dossier_classes (
    dossier_id TEXT REFERENCES dossiers(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL,
    PRIMARY KEY (dossier_id, class_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS message_threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'omapi',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trademark_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_name TEXT UNIQUE NOT NULL,
    result_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Add lat/lng columns to existing databases (safe migration)
try { db.exec('ALTER TABLE dossiers ADD COLUMN lat REAL;') } catch {}
try { db.exec('ALTER TABLE dossiers ADD COLUMN lng REAL;') } catch {}
// Add brand_description and originality_report columns (safe migration)
try { db.exec('ALTER TABLE marque_details ADD COLUMN brand_description TEXT;') } catch {}
try { db.exec('ALTER TABLE marque_details ADD COLUMN originality_report TEXT;') } catch {}
// Add logo_description column for AI-generated visual logo descriptions (safe migration)
try { db.exec('ALTER TABLE marque_details ADD COLUMN logo_description TEXT;') } catch {}


// Seed a default admin account if none exists
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@omapi.mg')
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10)
  db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
    'Admin OMAPI',
    'admin@omapi.mg',
    hash,
    'admin',
  )
  console.log('✅ Default admin created: admin@omapi.mg / admin123')
}

// ── File Upload Setup (Multer) ────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }) // 5MB limit

// ── JWT Middleware ────────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Access denied' })
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' })
    req.user = user
    next()
  })
}

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' })
  next()
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', db: 'SQLite', time: new Date().toISOString() })
})

// ════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' })

  try {
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const result = db
      .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(name, email, hash)
    res.status(201).json({ id: result.lastInsertRowid, name, email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '12h',
    })

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.name.substring(0, 2).toUpperCase(),
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ════════════════════════════════════════════════════════════════════════════
// DOSSIER ROUTES (Client)
// ════════════════════════════════════════════════════════════════════════════

// Get my dossiers
app.get('/api/dossiers', authenticateToken, (req, res) => {
  try {
    const rows = db
      .prepare('SELECT * FROM dossiers WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.user.id)
    const formatted = rows.map((r) => ({
      id: r.id,
      type: r.type,
      name: r.name,
      status: r.status,
      created_at: r.created_at,
      date: new Date(r.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    }))
    res.json(formatted)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Submit new dossier
app.post('/api/dossiers', authenticateToken, (req, res) => {
  const { type, name, applicant, brand, classification, location } = req.body
  const randomNum = Math.floor(100 + Math.random() * 900)
  const newId = `REQ-${new Date().getFullYear()}-${randomNum}`

  try {
    // Handle logo: if it's a base64 string, save it to disk and use the file URL
    let logoUrl = brand?.logo || ''
    if (logoUrl && logoUrl.startsWith('data:')) {
      try {
        const matches = logoUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
        if (matches) {
          const ext = matches[1].includes('png') ? 'png' : 'jpg'
          const filename = `logo-${Date.now()}.${ext}`
          const filepath = path.join(__dirname, 'uploads', filename)
          fs.writeFileSync(filepath, Buffer.from(matches[2], 'base64'))
          logoUrl = `http://localhost:${port}/uploads/${filename}`
        }
      } catch (logoErr) {
        console.warn('Could not save base64 logo:', logoErr.message)
        logoUrl = '' // Don't let this break the whole submission
      }
    }

    db.prepare('INSERT INTO dossiers (id, user_id, type, name, lat, lng) VALUES (?, ?, ?, ?, ?, ?)').run(
      newId,
      req.user.id,
      type,
      name,
      location?.lat || null,
      location?.lng || null
    )

    if (type === 'Marque' && applicant) {
      const originalityReport = brand?.originalityReport ? JSON.stringify(brand.originalityReport) : null
      // Extract the AI-generated visual description of the logo for future comparisons
      const logoDescription = brand?.originalityReport?.logoAnalysis?.logoDescription || ''
      db.prepare(
        `INSERT INTO marque_details
        (dossier_id, applicant_type, applicant_address, applicant_phone, applicant_nationality, brand_type, brand_colors, logo_url, brand_description, originality_report, logo_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        newId,
        applicant.type || '',
        applicant.address || '',
        applicant.phone || '',
        applicant.nationality || '',
        brand?.type || '',
        brand?.colors || '',
        logoUrl,
        brand?.description || '',
        originalityReport,
        logoDescription,
      )

      if (classification?.selectedClasses?.length) {
        const insertClass = db.prepare(
          'INSERT OR IGNORE INTO dossier_classes (dossier_id, class_id) VALUES (?, ?)',
        )
        classification.selectedClasses.forEach((id) => insertClass.run(newId, id))
      }
    }

    // Add notification
    db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(
      req.user.id,
      `Votre dossier "${name}" (${newId}) a été soumis avec succès.`,
    )

    res.status(201).json({
      id: newId,
      type,
      name,
      status: "En attente d'examen",
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create dossier' })
  }
})

// Get single dossier with full details
app.get('/api/dossiers/:id', authenticateToken, (req, res) => {
  try {
    let dossier
    if (req.user.role === 'admin') {
      dossier = db.prepare('SELECT * FROM dossiers WHERE id = ?').get(req.params.id)
    } else {
      dossier = db
        .prepare('SELECT * FROM dossiers WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id)
    }
    if (!dossier) return res.status(404).json({ message: 'Dossier not found' })

    // Get marque details if it's a trademark
    const details = db
      .prepare('SELECT * FROM marque_details WHERE dossier_id = ?')
      .get(req.params.id)

    // Get Nice classes
    const classes = db
      .prepare('SELECT class_id FROM dossier_classes WHERE dossier_id = ?')
      .all(req.params.id)

    res.json({
      id: dossier.id,
      type: dossier.type,
      name: dossier.name,
      status: dossier.status,
      lat: dossier.lat || null,
      lng: dossier.lng || null,
      date: new Date(dossier.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      details: details || null,
      classes: classes.map((c) => c.class_id),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete a dossier
app.delete('/api/dossiers/:id', authenticateToken, (req, res) => {
  try {
    const dossier = db
      .prepare('SELECT * FROM dossiers WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id)
    if (!dossier) return res.status(404).json({ message: 'Dossier not found' })
    db.prepare('DELETE FROM dossiers WHERE id = ?').run(req.params.id)
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ════════════════════════════════════════════════════════════════════════════
// TRADEMARK ORIGINALITY ENGINE
// ════════════════════════════════════════════════════════════════════════════

const FAMOUS_BRANDS = [
  { name: 'Nike', owner: 'Nike, Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Google', owner: 'Google LLC', country: 'US', status: 'Enregistré' },
  { name: 'Apple', owner: 'Apple Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Microsoft', owner: 'Microsoft Corporation', country: 'US', status: 'Enregistré' },
  { name: 'Adidas', owner: 'Adidas AG', country: 'DE', status: 'Enregistré' },
  { name: 'Puma', owner: 'Puma SE', country: 'DE', status: 'Enregistré' },
  { name: 'Samsung', owner: 'Samsung Electronics Co.', country: 'KR', status: 'Enregistré' },
  { name: 'Pepsi', owner: 'PepsiCo, Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Sony', owner: 'Sony Group Corporation', country: 'JP', status: 'Enregistré' },
  { name: 'Starbucks', owner: 'Starbucks Corporation', country: 'US', status: 'Enregistré' },
  { name: 'McDonald\'s', owner: 'McDonald\'s Corporation', country: 'US', status: 'Enregistré' },
  { name: 'Toyota', owner: 'Toyota Motor Corporation', country: 'JP', status: 'Enregistré' },
  { name: 'Tesla', owner: 'Tesla, Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Amazon', owner: 'Amazon.com, Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Netflix', owner: 'Netflix, Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Disney', owner: 'The Walt Disney Company', country: 'US', status: 'Enregistré' },
  { name: 'Chanel', owner: 'Chanel S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Gucci', owner: 'Gucci America, Inc.', country: 'IT', status: 'Enregistré' },
  { name: 'Rolex', owner: 'Rolex SA', country: 'CH', status: 'Enregistré' },
  { name: 'Intel', owner: 'Intel Corporation', country: 'US', status: 'Enregistré' },
  { name: 'IBM', owner: 'International Business Machines', country: 'US', status: 'Enregistré' },
  { name: 'Visa', owner: 'Visa Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Mastercard', owner: 'Mastercard Incorporated', country: 'US', status: 'Enregistré' },
  { name: 'Coca-Cola', owner: 'The Coca-Cola Company', country: 'US', status: 'Enregistré' },
  { name: 'Mercedes-Benz', owner: 'Mercedes-Benz Group AG', country: 'DE', status: 'Enregistré' },
  { name: 'BMW', owner: 'Bayerische Motoren Werke AG', country: 'DE', status: 'Enregistré' },
  { name: 'L\'Oréal', owner: 'L\'Oréal S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Nestlé', owner: 'Nestlé S.A.', country: 'CH', status: 'Enregistré' },
  { name: 'Unilever', owner: 'Unilever PLC', country: 'UK', status: 'Enregistré' },
  { name: 'Zara', owner: 'Inditex', country: 'ES', status: 'Enregistré' },

  // ── Madagascar / Africa brands ──────────────────────────────────────────────
  { name: 'Telma', owner: 'Telma Mobile SA', country: 'MG', status: 'Enregistré' },
  { name: 'Orange Madagascar', owner: 'Orange SA', country: 'MG', status: 'Enregistré' },
  { name: 'Airtel Madagascar', owner: 'Airtel Africa PLC', country: 'MG', status: 'Enregistré' },
  { name: 'JIRAMA', owner: 'JIRAMA', country: 'MG', status: 'Enregistré' },
  { name: 'BOA Madagascar', owner: 'Bank of Africa', country: 'MG', status: 'Enregistré' },
  { name: 'BFV-SG', owner: 'Société Générale Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'BNI Madagascar', owner: 'BNI Madagascar SA', country: 'MG', status: 'Enregistré' },
  { name: 'MCB Madagascar', owner: 'Mauritius Commercial Bank', country: 'MG', status: 'Enregistré' },
  { name: 'AccèsBanque', owner: 'AccèsBanque Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'BMOI', owner: 'Banque Malgache de l\'Océan Indien', country: 'MG', status: 'Enregistré' },
  { name: 'Star Brasseries', owner: 'Star Brasseries Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'THB', owner: 'Three Horses Beer - Star', country: 'MG', status: 'Enregistré' },
  { name: 'Skol', owner: 'Star Brasseries Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Glacier', owner: 'Star Brasseries Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Oméa', owner: 'Brasseries de Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'SBM', owner: 'Société Brasseries de Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Canal+ Madagascar', owner: 'Canal+ International', country: 'MG', status: 'Enregistré' },
  { name: 'RTA', owner: 'Radio Télévision Analamanga', country: 'MG', status: 'Enregistré' },
  { name: 'Viva', owner: 'Viva Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'MBS', owner: 'Madagascar Broadcasting System', country: 'MG', status: 'Enregistré' },
  { name: 'TVM', owner: 'Télévision Malagasy', country: 'MG', status: 'Enregistré' },
  { name: 'RNM', owner: 'Radio Nationale Malagasy', country: 'MG', status: 'Enregistré' },
  { name: 'Shoprite Madagascar', owner: 'Shoprite Holdings Ltd', country: 'MG', status: 'Enregistré' },
  { name: 'Score Supermarché', owner: 'Score Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Leader Price Madagascar', owner: 'Leader Price MG', country: 'MG', status: 'Enregistré' },
  { name: 'Jumbo Score', owner: 'Jumbo Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Tiko', owner: 'Tiko Group Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Ody', owner: 'Ody Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Codal', owner: 'Codal Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'SMTP', owner: 'SMTP Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Air Madagascar', owner: 'Air Madagascar SA', country: 'MG', status: 'Enregistré' },
  { name: 'Tsaradia', owner: 'Tsaradia SA', country: 'MG', status: 'Enregistré' },
  { name: 'Loterie Nationale Malagasy', owner: 'LONAMA', country: 'MG', status: 'Enregistré' },
  { name: 'LONAMA', owner: 'Loterie Nationale Malagasy', country: 'MG', status: 'Enregistré' },
  { name: 'Jovenna', owner: 'Jovenna Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Total Madagascar', owner: 'TotalEnergies', country: 'MG', status: 'Enregistré' },
  { name: 'Galana', owner: 'Galana Petroleum Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'KRAOMA', owner: 'Kraomita Malagasy', country: 'MG', status: 'Enregistré' },
  { name: 'QMM', owner: 'QIT Madagascar Minerals', country: 'MG', status: 'Enregistré' },
  { name: 'Ambatovy', owner: 'Ambatovy Minerals SA', country: 'MG', status: 'Enregistré' },
  { name: 'Rova Madagascar', owner: 'Rova SA', country: 'MG', status: 'Enregistré' },
  { name: 'Hotelma', owner: 'Hotelma Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Mercure Madagascar', owner: 'AccorHotels', country: 'MG', status: 'Enregistré' },
  { name: 'Carlton Madagascar', owner: 'Carlton Anosy Hotel', country: 'MG', status: 'Enregistré' },
  { name: 'Coliseum', owner: 'Coliseum Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Express de Madagascar', owner: 'Express MG', country: 'MG', status: 'Enregistré' },
  { name: 'GasyNet', owner: 'GasyNet SA', country: 'MG', status: 'Enregistré' },
  { name: 'Datacom', owner: 'Datacom Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Blueline', owner: 'Blueline Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'MVOLA', owner: 'Telma Mobile', country: 'MG', status: 'Enregistré' },
  { name: 'Airtel Money', owner: 'Airtel Africa', country: 'MG', status: 'Enregistré' },
  { name: 'Orange Money', owner: 'Orange SA', country: 'MG', status: 'Enregistré' },
  { name: 'EkoPay', owner: 'EkoPay Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Kintana', owner: 'Kintana SA Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Soa', owner: 'Soa Malagasy SARL', country: 'MG', status: 'Enregistré' },
  { name: 'Harena', owner: 'Harena Resources Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Tsara', owner: 'Tsara Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Vatosoa', owner: 'Vatosoa Sakana', country: 'MG', status: 'Enregistré' },
  { name: 'Mada Express', owner: 'Mada Express Transport', country: 'MG', status: 'Enregistré' },
  { name: 'Gasy Bois', owner: 'Gasy Bois SARL', country: 'MG', status: 'Enregistré' },
  { name: 'ProFarma', owner: 'ProFarma Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'SantéBio', owner: 'SantéBio Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'MedLine Madagascar', owner: 'MedLine MG SA', country: 'MG', status: 'Enregistré' },
  { name: 'Pharmalagasy', owner: 'Pharmalagasy SA', country: 'MG', status: 'Enregistré' },
  { name: 'BioMada', owner: 'BioMada Research', country: 'MG', status: 'Enregistré' },
  { name: 'EcoMada', owner: 'EcoMada Solutions', country: 'MG', status: 'Enregistré' },
  { name: 'AgriMada', owner: 'AgriMada SARL', country: 'MG', status: 'Enregistré' },
  { name: 'Hasy Mada', owner: 'Hasy Mada Agriculture', country: 'MG', status: 'Enregistré' },
  { name: 'ImmoPro Madagascar', owner: 'ImmoPro MG', country: 'MG', status: 'Enregistré' },
  { name: 'DigiMada', owner: 'DigiMada Technologies', country: 'MG', status: 'Enregistré' },
  { name: 'TechMada', owner: 'TechMada SARL', country: 'MG', status: 'Enregistré' },
  { name: 'WebMada', owner: 'WebMada SA', country: 'MG', status: 'Enregistré' },
  { name: 'MadaPay', owner: 'MadaPay FinTech', country: 'MG', status: 'Enregistré' },
  { name: 'Codos', owner: 'Codos Madagascar', country: 'MG', status: 'Enregistré' },
  { name: 'Havana Madagascar', owner: 'Havana Club MG', country: 'MG', status: 'Enregistré' },
  { name: 'Ranja', owner: 'Ranja Drinks Madagascar', country: 'MG', status: 'Enregistré' },

  // ── Africa (broader) ────────────────────────────────────────────────────────
  { name: 'MTN', owner: 'MTN Group', country: 'ZA', status: 'Enregistré' },
  { name: 'Safaricom', owner: 'Safaricom PLC', country: 'KE', status: 'Enregistré' },
  { name: 'M-Pesa', owner: 'Safaricom PLC', country: 'KE', status: 'Enregistré' },
  { name: 'Dangote', owner: 'Dangote Group', country: 'NG', status: 'Enregistré' },
  { name: 'Ethiopian Airlines', owner: 'Ethiopian Airlines', country: 'ET', status: 'Enregistré' },
  { name: 'Kenya Airways', owner: 'Kenya Airways PLC', country: 'KE', status: 'Enregistré' },
  { name: 'Standard Bank', owner: 'Standard Bank Group', country: 'ZA', status: 'Enregistré' },
  { name: 'Nedbank', owner: 'Nedbank Group', country: 'ZA', status: 'Enregistré' },
  { name: 'Equity Bank', owner: 'Equity Group Holdings', country: 'KE', status: 'Enregistré' },
  { name: 'Shoprite', owner: 'Shoprite Holdings', country: 'ZA', status: 'Enregistré' },
  { name: 'Pick n Pay', owner: 'Pick n Pay Stores', country: 'ZA', status: 'Enregistré' },
  { name: 'Woolworths SA', owner: 'Woolworths Holdings', country: 'ZA', status: 'Enregistré' },
  { name: 'Massmart', owner: 'Massmart Holdings', country: 'ZA', status: 'Enregistré' },
  { name: 'Jumia', owner: 'Jumia Technologies AG', country: 'NG', status: 'Enregistré' },
  { name: 'Flutterwave', owner: 'Flutterwave Inc.', country: 'NG', status: 'Enregistré' },
  { name: 'Interswitch', owner: 'Interswitch Group', country: 'NG', status: 'Enregistré' },

  // ── Tech / Global ────────────────────────────────────────────────────────────
  { name: 'Meta', owner: 'Meta Platforms Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Facebook', owner: 'Meta Platforms Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Instagram', owner: 'Meta Platforms Inc.', country: 'US', status: 'Enregistré' },
  { name: 'WhatsApp', owner: 'Meta Platforms Inc.', country: 'US', status: 'Enregistré' },
  { name: 'TikTok', owner: 'ByteDance Ltd.', country: 'CN', status: 'Enregistré' },
  { name: 'Snapchat', owner: 'Snap Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Twitter', owner: 'X Corp.', country: 'US', status: 'Enregistré' },
  { name: 'LinkedIn', owner: 'Microsoft Corporation', country: 'US', status: 'Enregistré' },
  { name: 'YouTube', owner: 'Google LLC', country: 'US', status: 'Enregistré' },
  { name: 'Spotify', owner: 'Spotify AB', country: 'SE', status: 'Enregistré' },
  { name: 'Uber', owner: 'Uber Technologies Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Airbnb', owner: 'Airbnb Inc.', country: 'US', status: 'Enregistré' },
  { name: 'PayPal', owner: 'PayPal Holdings Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Stripe', owner: 'Stripe Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Zoom', owner: 'Zoom Video Communications', country: 'US', status: 'Enregistré' },
  { name: 'Slack', owner: 'Salesforce Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Salesforce', owner: 'Salesforce Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Oracle', owner: 'Oracle Corporation', country: 'US', status: 'Enregistré' },
  { name: 'Cisco', owner: 'Cisco Systems Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Adobe', owner: 'Adobe Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Nvidia', owner: 'NVIDIA Corporation', country: 'US', status: 'Enregistré' },
  { name: 'AMD', owner: 'Advanced Micro Devices Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Qualcomm', owner: 'Qualcomm Incorporated', country: 'US', status: 'Enregistré' },
  { name: 'Alibaba', owner: 'Alibaba Group Holding', country: 'CN', status: 'Enregistré' },
  { name: 'Huawei', owner: 'Huawei Technologies Co.', country: 'CN', status: 'Enregistré' },
  { name: 'Xiaomi', owner: 'Xiaomi Corporation', country: 'CN', status: 'Enregistré' },
  { name: 'OPPO', owner: 'Guangdong OPPO Mobile', country: 'CN', status: 'Enregistré' },
  { name: 'OnePlus', owner: 'OnePlus Technology', country: 'CN', status: 'Enregistré' },
  { name: 'LG', owner: 'LG Electronics Inc.', country: 'KR', status: 'Enregistré' },
  { name: 'Panasonic', owner: 'Panasonic Holdings Corp.', country: 'JP', status: 'Enregistré' },
  { name: 'Sharp', owner: 'Sharp Corporation', country: 'JP', status: 'Enregistré' },
  { name: 'Toshiba', owner: 'Toshiba Corporation', country: 'JP', status: 'Enregistré' },
  { name: 'Canon', owner: 'Canon Inc.', country: 'JP', status: 'Enregistré' },
  { name: 'Nikon', owner: 'Nikon Corporation', country: 'JP', status: 'Enregistré' },
  { name: 'Dell', owner: 'Dell Technologies Inc.', country: 'US', status: 'Enregistré' },
  { name: 'HP', owner: 'HP Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Lenovo', owner: 'Lenovo Group Limited', country: 'CN', status: 'Enregistré' },
  { name: 'Asus', owner: 'ASUSTeK Computer Inc.', country: 'TW', status: 'Enregistré' },
  { name: 'Acer', owner: 'Acer Inc.', country: 'TW', status: 'Enregistré' },
  { name: 'Dropbox', owner: 'Dropbox Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Pinterest', owner: 'Pinterest Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Reddit', owner: 'Reddit Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Discord', owner: 'Discord Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Shopify', owner: 'Shopify Inc.', country: 'CA', status: 'Enregistré' },
  { name: 'eBay', owner: 'eBay Inc.', country: 'US', status: 'Enregistré' },

  // ── Automotive ──────────────────────────────────────────────────────────────
  { name: 'Volkswagen', owner: 'Volkswagen AG', country: 'DE', status: 'Enregistré' },
  { name: 'Audi', owner: 'Audi AG', country: 'DE', status: 'Enregistré' },
  { name: 'Porsche', owner: 'Porsche AG', country: 'DE', status: 'Enregistré' },
  { name: 'Ferrari', owner: 'Ferrari N.V.', country: 'IT', status: 'Enregistré' },
  { name: 'Lamborghini', owner: 'Automobili Lamborghini S.p.A.', country: 'IT', status: 'Enregistré' },
  { name: 'Ford', owner: 'Ford Motor Company', country: 'US', status: 'Enregistré' },
  { name: 'Chevrolet', owner: 'General Motors', country: 'US', status: 'Enregistré' },
  { name: 'Jeep', owner: 'Stellantis N.V.', country: 'US', status: 'Enregistré' },
  { name: 'Honda', owner: 'Honda Motor Co. Ltd.', country: 'JP', status: 'Enregistré' },
  { name: 'Nissan', owner: 'Nissan Motor Co.', country: 'JP', status: 'Enregistré' },
  { name: 'Mazda', owner: 'Mazda Motor Corporation', country: 'JP', status: 'Enregistré' },
  { name: 'Subaru', owner: 'Subaru Corporation', country: 'JP', status: 'Enregistré' },
  { name: 'Mitsubishi', owner: 'Mitsubishi Motors', country: 'JP', status: 'Enregistré' },
  { name: 'Kia', owner: 'Kia Corporation', country: 'KR', status: 'Enregistré' },
  { name: 'Hyundai', owner: 'Hyundai Motor Company', country: 'KR', status: 'Enregistré' },
  { name: 'Volvo', owner: 'Volvo Group', country: 'SE', status: 'Enregistré' },
  { name: 'Renault', owner: 'Renault S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Peugeot', owner: 'Stellantis N.V.', country: 'FR', status: 'Enregistré' },
  { name: 'Citroën', owner: 'Stellantis N.V.', country: 'FR', status: 'Enregistré' },
  { name: 'Land Rover', owner: 'Jaguar Land Rover', country: 'UK', status: 'Enregistré' },
  { name: 'Jaguar', owner: 'Jaguar Land Rover Ltd.', country: 'UK', status: 'Enregistré' },
  { name: 'Rolls-Royce', owner: 'Rolls-Royce Holdings PLC', country: 'UK', status: 'Enregistré' },

  // ── Fashion & Luxury ────────────────────────────────────────────────────────
  { name: 'Louis Vuitton', owner: 'LVMH Moët Hennessy', country: 'FR', status: 'Enregistré' },
  { name: 'Dior', owner: 'Christian Dior SE', country: 'FR', status: 'Enregistré' },
  { name: 'Hermès', owner: 'Hermès International', country: 'FR', status: 'Enregistré' },
  { name: 'Prada', owner: 'Prada S.p.A.', country: 'IT', status: 'Enregistré' },
  { name: 'Versace', owner: 'Gianni Versace S.r.l.', country: 'IT', status: 'Enregistré' },
  { name: 'Armani', owner: 'Giorgio Armani S.p.A.', country: 'IT', status: 'Enregistré' },
  { name: 'Burberry', owner: 'Burberry Group PLC', country: 'UK', status: 'Enregistré' },
  { name: 'H&M', owner: 'H & M Hennes & Mauritz AB', country: 'SE', status: 'Enregistré' },
  { name: 'IKEA', owner: 'INGKA Group', country: 'SE', status: 'Enregistré' },
  { name: 'Balenciaga', owner: 'Balenciaga S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Valentino', owner: 'Valentino S.p.A.', country: 'IT', status: 'Enregistré' },
  { name: 'Fendi', owner: 'LVMH Group', country: 'IT', status: 'Enregistré' },
  { name: 'Céline', owner: 'LVMH Group', country: 'FR', status: 'Enregistré' },
  { name: 'Givenchy', owner: 'LVMH Group', country: 'FR', status: 'Enregistré' },
  { name: 'Cartier', owner: 'Richemont SA', country: 'CH', status: 'Enregistré' },
  { name: 'Omega', owner: 'The Swatch Group', country: 'CH', status: 'Enregistré' },
  { name: 'Tissot', owner: 'The Swatch Group', country: 'CH', status: 'Enregistré' },
  { name: 'Tag Heuer', owner: 'LVMH Group', country: 'CH', status: 'Enregistré' },
  { name: 'Swatch', owner: 'The Swatch Group Ltd.', country: 'CH', status: 'Enregistré' },

  // ── Food & Beverage ────────────────────────────────────────────────────────
  { name: 'Heineken', owner: 'Heineken N.V.', country: 'NL', status: 'Enregistré' },
  { name: 'Carlsberg', owner: 'Carlsberg A/S', country: 'DK', status: 'Enregistré' },
  { name: 'Red Bull', owner: 'Red Bull GmbH', country: 'AT', status: 'Enregistré' },
  { name: 'Monster', owner: 'Monster Beverage Corporation', country: 'US', status: 'Enregistré' },
  { name: 'Fanta', owner: 'The Coca-Cola Company', country: 'US', status: 'Enregistré' },
  { name: 'Sprite', owner: 'The Coca-Cola Company', country: 'US', status: 'Enregistré' },
  { name: 'Minute Maid', owner: 'The Coca-Cola Company', country: 'US', status: 'Enregistré' },
  { name: '7UP', owner: 'Keurig Dr Pepper', country: 'US', status: 'Enregistré' },
  { name: 'Tropicana', owner: 'PepsiCo Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Lipton', owner: 'Ekaterra B.V.', country: 'NL', status: 'Enregistré' },
  { name: 'Nescafé', owner: 'Nestlé S.A.', country: 'CH', status: 'Enregistré' },
  { name: 'Maggi', owner: 'Nestlé S.A.', country: 'CH', status: 'Enregistré' },
  { name: 'Milo', owner: 'Nestlé S.A.', country: 'CH', status: 'Enregistré' },
  { name: 'KitKat', owner: 'Nestlé S.A.', country: 'CH', status: 'Enregistré' },
  { name: 'Kellogg\'s', owner: 'Kellanova', country: 'US', status: 'Enregistré' },
  { name: 'Danone', owner: 'Danone S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Activia', owner: 'Danone S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Evian', owner: 'Danone S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Ferrero Rocher', owner: 'Ferrero SpA', country: 'IT', status: 'Enregistré' },
  { name: 'Nutella', owner: 'Ferrero SpA', country: 'IT', status: 'Enregistré' },
  { name: 'KFC', owner: 'Yum! Brands Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Pizza Hut', owner: 'Yum! Brands Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Domino\'s', owner: 'Domino\'s Pizza LLC', country: 'US', status: 'Enregistré' },
  { name: 'Subway', owner: 'Subway IP LLC', country: 'US', status: 'Enregistré' },
  { name: 'Burger King', owner: 'Restaurant Brands International', country: 'US', status: 'Enregistré' },
  { name: 'Lay\'s', owner: 'PepsiCo Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Pringles', owner: 'Kellanova', country: 'US', status: 'Enregistré' },

  // ── Pharma / Health ─────────────────────────────────────────────────────────
  { name: 'Pfizer', owner: 'Pfizer Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Johnson & Johnson', owner: 'Johnson & Johnson', country: 'US', status: 'Enregistré' },
  { name: 'Bayer', owner: 'Bayer AG', country: 'DE', status: 'Enregistré' },
  { name: 'Roche', owner: 'F. Hoffmann-La Roche AG', country: 'CH', status: 'Enregistré' },
  { name: 'Novartis', owner: 'Novartis AG', country: 'CH', status: 'Enregistré' },
  { name: 'AstraZeneca', owner: 'AstraZeneca PLC', country: 'UK', status: 'Enregistré' },
  { name: 'Sanofi', owner: 'Sanofi S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Merck', owner: 'Merck KGaA', country: 'DE', status: 'Enregistré' },
  { name: 'Colgate', owner: 'Colgate-Palmolive Company', country: 'US', status: 'Enregistré' },
  { name: 'Oral-B', owner: 'Procter & Gamble', country: 'US', status: 'Enregistré' },
  { name: 'Gillette', owner: 'Procter & Gamble', country: 'US', status: 'Enregistré' },
  { name: 'Dove', owner: 'Unilever PLC', country: 'UK', status: 'Enregistré' },
  { name: 'Pantene', owner: 'Procter & Gamble', country: 'US', status: 'Enregistré' },
  { name: 'Head & Shoulders', owner: 'Procter & Gamble', country: 'US', status: 'Enregistré' },

  // ── Finance & Banking ────────────────────────────────────────────────────────
  { name: 'HSBC', owner: 'HSBC Holdings PLC', country: 'UK', status: 'Enregistré' },
  { name: 'Barclays', owner: 'Barclays PLC', country: 'UK', status: 'Enregistré' },
  { name: 'BNP Paribas', owner: 'BNP Paribas SA', country: 'FR', status: 'Enregistré' },
  { name: 'Société Générale', owner: 'Société Générale S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Crédit Agricole', owner: 'Crédit Agricole S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'AXA', owner: 'AXA S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Allianz', owner: 'Allianz SE', country: 'DE', status: 'Enregistré' },
  { name: 'Goldman Sachs', owner: 'The Goldman Sachs Group', country: 'US', status: 'Enregistré' },
  { name: 'JPMorgan', owner: 'JPMorgan Chase & Co.', country: 'US', status: 'Enregistré' },
  { name: 'Citibank', owner: 'Citigroup Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Wells Fargo', owner: 'Wells Fargo & Company', country: 'US', status: 'Enregistré' },
  { name: 'American Express', owner: 'American Express Company', country: 'US', status: 'Enregistré' },

  // ── Media & Entertainment ───────────────────────────────────────────────────
  { name: 'HBO', owner: 'Warner Bros. Discovery', country: 'US', status: 'Enregistré' },
  { name: 'Hulu', owner: 'Hulu LLC', country: 'US', status: 'Enregistré' },
  { name: 'Apple TV', owner: 'Apple Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Disney+', owner: 'The Walt Disney Company', country: 'US', status: 'Enregistré' },
  { name: 'Paramount', owner: 'Paramount Global', country: 'US', status: 'Enregistré' },
  { name: 'Universal', owner: 'Universal Studios LLC', country: 'US', status: 'Enregistré' },
  { name: 'Warner Bros', owner: 'Warner Bros. Discovery', country: 'US', status: 'Enregistré' },
  { name: 'BBC', owner: 'BBC', country: 'UK', status: 'Enregistré' },
  { name: 'CNN', owner: 'Warner Bros. Discovery', country: 'US', status: 'Enregistré' },
  { name: 'ESPN', owner: 'The Walt Disney Company', country: 'US', status: 'Enregistré' },
  { name: 'Al Jazeera', owner: 'Al Jazeera Media Network', country: 'QA', status: 'Enregistré' },
  { name: 'France 24', owner: 'France Médias Monde', country: 'FR', status: 'Enregistré' },
  { name: 'RFI', owner: 'Radio France Internationale', country: 'FR', status: 'Enregistré' },
  { name: 'TV5 Monde', owner: 'TV5 Monde', country: 'FR', status: 'Enregistré' },
  { name: 'Canal+', owner: 'Vivendi SE', country: 'FR', status: 'Enregistré' },

  // ── Logistics / Delivery ────────────────────────────────────────────────────
  { name: 'DHL', owner: 'Deutsche Post DHL Group', country: 'DE', status: 'Enregistré' },
  { name: 'FedEx', owner: 'FedEx Corporation', country: 'US', status: 'Enregistré' },
  { name: 'UPS', owner: 'United Parcel Service Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Chronopost', owner: 'La Poste Group', country: 'FR', status: 'Enregistré' },
  { name: 'Glovo', owner: 'Glovoapp23 S.L.', country: 'ES', status: 'Enregistré' },

  // ── Energy / Petroleum ────────────────────────────────────────────────────────
  { name: 'Shell', owner: 'Shell PLC', country: 'NL', status: 'Enregistré' },
  { name: 'BP', owner: 'BP PLC', country: 'UK', status: 'Enregistré' },
  { name: 'ExxonMobil', owner: 'ExxonMobil Corporation', country: 'US', status: 'Enregistré' },
  { name: 'TotalEnergies', owner: 'TotalEnergies SE', country: 'FR', status: 'Enregistré' },
  { name: 'Chevron', owner: 'Chevron Corporation', country: 'US', status: 'Enregistré' },

  // ── Retail / Distribution ────────────────────────────────────────────────────
  { name: 'Carrefour', owner: 'Carrefour S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Aldi', owner: 'Aldi Group', country: 'DE', status: 'Enregistré' },
  { name: 'Lidl', owner: 'Lidl Stiftung & Co. KG', country: 'DE', status: 'Enregistré' },
  { name: 'Walmart', owner: 'Walmart Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Target', owner: 'Target Corporation', country: 'US', status: 'Enregistré' },
  { name: 'FNAC', owner: 'Fnac Darty S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Decathlon', owner: 'Decathlon S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Leroy Merlin', owner: 'ADEO SA', country: 'FR', status: 'Enregistré' },
  { name: 'Sephora', owner: 'LVMH Group', country: 'FR', status: 'Enregistré' },

  // ── Hospitality / Tourism ──────────────────────────────────────────────────
  { name: 'Marriott', owner: 'Marriott International Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Hilton', owner: 'Hilton Worldwide Holdings', country: 'US', status: 'Enregistré' },
  { name: 'Hyatt', owner: 'Hyatt Hotels Corporation', country: 'US', status: 'Enregistré' },
  { name: 'Novotel', owner: 'AccorHotels', country: 'FR', status: 'Enregistré' },
  { name: 'Ibis', owner: 'AccorHotels', country: 'FR', status: 'Enregistré' },
  { name: 'Club Med', owner: 'Club Méditerranée S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Booking.com', owner: 'Booking Holdings Inc.', country: 'NL', status: 'Enregistré' },
  { name: 'Expedia', owner: 'Expedia Group Inc.', country: 'US', status: 'Enregistré' },
  { name: 'TripAdvisor', owner: 'Tripadvisor Inc.', country: 'US', status: 'Enregistré' },

  // ── Sports / Lifestyle ────────────────────────────────────────────────────────
  { name: 'Reebok', owner: 'Authentic Brands Group', country: 'US', status: 'Enregistré' },
  { name: 'New Balance', owner: 'New Balance Athletics Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Under Armour', owner: 'Under Armour Inc.', country: 'US', status: 'Enregistré' },
  { name: 'North Face', owner: 'VF Corporation', country: 'US', status: 'Enregistré' },
  { name: 'Lacoste', owner: 'Lacoste S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Champion', owner: 'HanesBrands Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Speedo', owner: 'Warnaco Group', country: 'UK', status: 'Enregistré' },
  { name: 'Wilson', owner: 'Wilson Sporting Goods', country: 'US', status: 'Enregistré' },
  { name: 'Babolat', owner: 'Babolat VS S.A.', country: 'FR', status: 'Enregistré' },
  { name: 'Callaway', owner: 'Callaway Golf Company', country: 'US', status: 'Enregistré' },
  { name: 'Red Bull Racing', owner: 'Red Bull GmbH', country: 'AT', status: 'Enregistré' },
  { name: 'iPhone', owner: 'Apple Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Android', owner: 'Google LLC', country: 'US', status: 'Enregistré' },
  { name: 'iPad', owner: 'Apple Inc.', country: 'US', status: 'Enregistré' },
  { name: 'MacBook', owner: 'Apple Inc.', country: 'US', status: 'Enregistré' },
  { name: 'Samsung Galaxy', owner: 'Samsung Electronics Co.', country: 'KR', status: 'Enregistré' },
  { name: 'Windows', owner: 'Microsoft Corporation', country: 'US', status: 'Enregistré' },
  { name: 'Xbox', owner: 'Microsoft Corporation', country: 'US', status: 'Enregistré' },
  { name: 'PlayStation', owner: 'Sony Interactive Entertainment', country: 'JP', status: 'Enregistré' },
  { name: 'Nintendo', owner: 'Nintendo Co., Ltd.', country: 'JP', status: 'Enregistré' },
  { name: 'Google Pixel', owner: 'Google LLC', country: 'US', status: 'Enregistré' },
  { name: 'Mvola', owner: 'Telma Mobile', country: 'MG', status: 'Enregistré' },
];

const FAMOUS_BRANDS_DESCRIPTIONS = {
  'nike': 'Athletic footwear, sports apparel, shoes, sportswear, and athletic equipment.',
  'google': 'Internet search engine, online advertising, cloud computing, computer software, and digital services.',
  'apple': 'Consumer electronics, smartphones, mobile devices, computer software, personal computers, and digital tablets.',
  'microsoft': 'Computer operating systems, personal computers, office software, cloud services, and computer tech.',
  'adidas': 'Sports shoes, athletic footwear, sportswear, apparel, and athletic accessories.',
  'puma': 'Athletic footwear, apparel, sports clothing, accessories, and shoes.',
  'samsung': 'Consumer electronics, smartphones, mobile devices, television screens, and semiconductors.',
  'pepsi': 'Carbonated soft drinks, sweet beverages, sodas, and carbonated water.',
  'sony': 'Consumer electronics, gaming systems, televisions, audio equipment, movies, and music entertainment.',
  'starbucks': 'Coffee shop, hot and cold coffee drinks, espresso, tea, snacks, and coffee beans.',
  'mcdonald\'s': 'Fast food restaurant chain, burgers, french fries, chicken nuggets, and fast meals.',
  'toyota': 'Automobiles, motor vehicles, cars, trucks, and hybrid vehicles.',
  'tesla': 'Electric vehicles, electric cars, autonomous driving, solar panels, and battery energy storage.',
  'amazon': 'E-commerce website, online retail store, cloud computing services, and digital streaming.',
  'netflix': 'Subscription video streaming platform, movies, television shows, and digital entertainment series.',
  'disney': 'Entertainment, media production, theme parks, movies, cartoons, and family characters.',
  'chanel': 'Luxury fashion, high-end clothing, perfumes, fragrances, bags, and luxury accessories.',
  'gucci': 'Luxury fashion, leather goods, clothing, shoes, and designer apparel accessories.',
  'rolex': 'Luxury watches, wristwatches, luxury timepieces, and watchmaking.',
  'intel': 'Computer microprocessors, semiconductor chips, computing processors, and hardware technology.',
  'ibm': 'Computer hardware, software development, cloud hosting, consulting, and enterprise computing.',
  'visa': 'Financial transaction processing network, credit cards, debit cards, and payment services.',
  'mastercard': 'Financial payment systems, credit cards, debit cards, and transaction processing services.',
  'coca-cola': 'Carbonated soft drinks, cola beverage, sweet soda, and refreshing drinks.',
  'mercedes-benz': 'Luxury automobiles, passenger cars, trucks, and motor vehicles.',
  'bmw': 'Luxury cars, automobiles, motorcycles, and motor vehicles.',
  'l\'oréal': 'Cosmetics, beauty products, hair care, skin care, makeup, and perfumes.',
  'nestlé': 'Food and beverage company, baby food, bottled water, breakfast cereals, chocolate, and milk products.',
  'unilever': 'Consumer goods, soap, hygiene products, food products, and personal care items.',
  'zara': 'Fast fashion clothing store, apparel, garments, and fashion accessories.',
  'iphone': 'Smartphones, mobile phones, cellular devices, touchscreen devices developed by Apple.',
  'android': 'Mobile operating system, software platforms for smartphones and tablets developed by Google.',
  'samsung galaxy': 'Smartphones, mobile phones, tablets, and consumer electronics designed by Samsung.',
  'playstation': 'Video game consoles, home gaming systems, digital video games, and gaming entertainment developed by Sony.',
  'nintendo': 'Video game systems, gaming consoles, gaming hardware, and video games developed by Nintendo.',
  'macbook': 'Laptop computers, personal laptops, macOS computers designed by Apple.',
  'ipad': 'Tablet computers, touchscreen tablets, digital tablets developed by Apple.',
  'windows': 'Operating systems, personal computer software, office suites, and digital platforms developed by Microsoft.',
  'xbox': 'Video game consoles, home gaming hardware, online gaming networks developed by Microsoft.',
  'google pixel': 'Smartphones, mobile devices, consumer electronics, and Android devices developed by Google.',
  'telma': 'Télécommunications, réseau mobile 3G/4G/5G, internet fibre optique, et services de paiement mobile Mvola à Madagascar.',
  'orange madagascar': 'Télécommunications, réseau de téléphonie mobile, fournisseur d\'accès internet, et services financiers Orange Money à Madagascar.',
  'airtel madagascar': 'Réseau mobile, téléphonie cellulaire, transfert d\'argent Airtel Money, et services internet à Madagascar.',
  'jirama': 'Production et distribution d\'électricité et d\'eau courante, service public à Madagascar.',
  'thb': 'Bière Three Horses Beer, boisson alcoolisée blonde rafraîchissante, brasserie à Madagascar.',
  'mvola': 'Mobile money, service de transfert d\'argent mobile, paiement électronique et micro-crédits à Madagascar par Telma.',
  'star brasseries': 'Production de bières, boissons gazeuses sucrées, eau de source et boissons à Madagascar.',
  'air madagascar': 'Compagnie aérienne nationale, transport de passagers et de fret aérien à Madagascar.',
  'tsaradia': 'Transport aérien intérieur, vols domestiques réguliers de passagers à Madagascar.',
  'tiko': 'Production de produits laitiers, yaourts, beurre, fromage, huiles et produits alimentaires de consommation à Madagascar.',
  'jovenna': 'Distribution de carburants, stations-services, produits pétroliers et lubrifiants à Madagascar.'
};

// Map descriptions onto FAMOUS_BRANDS
FAMOUS_BRANDS.forEach(brand => {
  const key = brand.name.toLowerCase();
  brand.description = FAMOUS_BRANDS_DESCRIPTIONS[key] || `Produits et services de la marque ${brand.name} enregistrée en ${brand.country}.`;
});

// ── Famous Brand Logo Visual Descriptions (for AI logo comparison teaching) ──
const FAMOUS_BRANDS_LOGOS = {
  'Apple': 'Une pomme croquée sur le côté droit, silhouette minimaliste en argent/blanc. Icône universellement reconnaissable. Le croquage est à droite.',
  'Nike': 'Un simple swoosh/virgule incurvee en gras, partant de gauche vers la droite en s\'elargissant. Extremement minimaliste, noir ou blanc. Aucune complexite.',
  'Google': 'Un "G" multicolore (bleu, rouge, jaune, vert) dans un cercle ou carré arrondi. Les 4 couleurs représentent le G de Google.',
  'Adidas': 'Trois bandes diagonales parallèles, ou un trèfle/feuille faite de bandes, ou une montagne/triangle composé de trois lignes. Géométrique et simple.',
  'Amazon': 'Le texte "amazon" en minuscules avec une flèche souriante en dessous allant de "a" à "z" (symbolisant tout vendre). La flèche forme un sourire.',
  'Tesla': 'La lettre "T" stylisée rappelant la section transversale d\'un moteur électrique. Élancé, minimal, argenté.',
  'Samsung': 'Un ovale bleu avec le texte "SAMSUNG" en blanc sans empattement à l\'intérieur.',
  'Microsoft': 'Quatre carrés colorés (bleu, rouge, jaune, vert) en grille 2x2, formant une fenêtre. Le logo drapeau/fenêtre de Windows.',
  'Windows': 'Quatre carrés colorés (bleu, rouge, jaune, vert) en perspective de fenêtre ondulante. Identique au logo Microsoft.',
  'Intel': 'Texte "intel" en minuscules avec un petit tourbillon circulaire au-dessus de la lettre "i".',
  'IBM': 'Les lettres "IBM" formées de bandes horizontales bleues parallèles superposées. Très géométrique.',
  'Visa': 'Texte "VISA" en blanc sur fond bleu, avec parfois une bande dorée.',
  'Mastercard': 'Deux cercles qui se chevauchent — un rouge et un orange/jaune — créant une zone d\'intersection.',
  'Mercedes-Benz': 'Une étoile à trois branches inscrite dans un cercle. Minimaliste, argenté/chromé.',
  'BMW': 'Des quadrants bleu et blanc en damier dans un cercle (représente une hélice avec ciel bleu). Encadré d\'un anneau noir avec "BMW".',
  'Pepsi': 'Un cercle divisé en zones vague de rouge, blanc et bleu.',
  'Sony': 'Le texte "SONY" en police sans empattement claire.',
  'Starbucks': 'Un cercle vert avec une sirène/femme-poisson à deux queues en blanc au centre.',
  'Twitter': 'Un oiseau bleu en vol, incliné vers le haut à droite. Silhouette d\'oiseau simple et minimaliste.',
  'Facebook': 'Un "f" minuscule en blanc sur fond bleu carré.',
  'Instagram': 'Le contour carré d\'un appareil photo aux coins arrondis, avec un cercle-objectif au centre et un petit point en haut à droite. Dégradé du violet vers le rose et l\'orange/jaune.',
  'WhatsApp': 'Une bulle de dialogue en vert avec un combiné téléphonique blanc à l\'intérieur.',
  'TikTok': 'Une note de musique (ressemblant à la lettre "d" avec un style de quaver) en blanc, avec des effets d\'ombre cyan et rouge sur fond noir.',
  'Snapchat': 'Le contour d\'un fantôme blanc sur fond jaune.',
  'LinkedIn': '"in" en texte blanc sur fond bleu carré.',
  'YouTube': 'Un rectangle arrondi rouge (conteneur style bouton play) avec un triangle blanc pointant vers la droite à l\'intérieur.',
  'Spotify': 'Un cercle vert avec trois lignes horizontales courbes blanches à l\'intérieur (comme des ondes sonores).',
  'Netflix': 'Un "N" rouge ou le texte "NETFLIX" en rouge sur fond noir.',
  'Disney': 'La signature stylisée de "Walt Disney" en script bleu.',
  'Chanel': 'Deux lettres "C" imbriquées et dos-à-dos formant un cercle. Extrêmement élégant.',
  'Gucci': 'Deux lettres "G" imbriquées et entrelacées.',
  'Louis Vuitton': 'Un monogramme "LV" répété en motif avec des fleurs et losanges.',
  'Rolex': 'Une couronne à cinq pointes en or/vert.',
  'Ferrari': 'Un cheval noir cabré (rampant) sur fond de bouclier jaune.',
  'Lamborghini': 'Un taureau doré chargeant sur fond noir avec un bouclier.',
  'Porsche': 'Un bouclier avec un cheval noir (symbole de Stuttgart) et des rayures noires/rouges.',
  'Audi': 'Quatre anneaux argentés entrelacés horizontalement.',
  'Volkswagen': 'Un cercle avec "VW" à l\'intérieur, le V chevauchant le dessus du W.',
  'Shell': 'Une coquille pétoncle/pecten jaune et rouge.',
  'Puma': 'La silhouette d\'un puma bondissant/sautant.',
  'Reebok': 'Un vecteur de bouclier rouge et bleu, parfois simple texte.',
  'Under Armour': 'Deux lettres "U" entrelacées formant un bouclier/coeur.',
  'Nintendo': 'Texte "Nintendo" en blanc sur fond rouge, ou le logo "N".',
  'PlayStation': 'Un "P" stylisé dont l\'ombre forme un "S".',
  'Xbox': 'Un "X" stylisé sur fond vert.',
  'Android': 'Un robot/alien vert avec des antennes — la mascotte Android.',
  'iPhone': 'La pomme croquée (même logo qu\'Apple).',
  'Google Pixel': 'Un "G" arrondi multicolore (bleu, rouge, jaune, vert).',
  'Samsung Galaxy': 'Le logo ovale Samsung en bleu.',
  'Huawei': 'Un logo rouge/orange en forme de fleur stylisée avec des pétales qui se chevauchent.',
  'Xiaomi': 'Un "MI" aux coins arrondis dans un carré arrondi. Orange.',
  'OPPO': 'Texte "OPPO" en bleu sans empattement avec un ovale stylisé.',
  'Adobe': 'Un "A" rouge sous forme d\'un triangle/montagne stylisé.',
  'Nvidia': 'Un œil/iris vert formant un "N" stylisé.',
  'HP': 'Deux cercles bleus qui se chevauchent légèrement, avec "hp" en blanc.',
  'Dell': 'Un carré bleu avec le texte "DELL" blanc, ou le "E" incliné en bleu.',
  'Lenovo': 'Texte "LENOVO" en rouge ou noir.',
  'Asus': 'Une vague/forme métallique stylisée formant un "A".',
  'Shopify': 'Un sac de shopping vert avec une poignée et une forme en "S".',
  'Telma': 'Logo bleu et blanc avec globe et stylisation télécom. Spécifique au marché malgache.',
  'Orange': 'Un carré orange uni avec le texte "orange" en blanc.',
  'Airtel': 'Un logo rouge avec une forme fluide de lettre "a".',
  'MTN': 'Logo jaune avec le texte "MTN".',
  'Safaricom': 'Logo vert avec le texte "Safaricom" et un élément circulaire.',
  'DHL': 'Texte "DHL" en rouge sur fond jaune.',
  'FedEx': 'Texte "FedEx" où l\'espace entre "E" et "x" forme une flèche. En violet et orange.',
  'UPS': 'Un bouclier marron avec un nœud/paquet doré.',
  'KFC': 'Le portrait du Colonel Sanders en rouge, blanc et noir.',
  'Burger King': 'Un logo style pain burger avec le texte "BURGER KING" entre les couches de pain en rouge/bleu/jaune.',
  'McDonald\'s': 'Les arches dorées en forme de "M" jaune sur rouge.',
  'Red Bull': 'Deux taureaux rouges se chargeant face à face avec un soleil/cercle doré entre eux.',
  'Heineken': 'Une étoile rouge et une étiquette verte avec le texte "HEINEKEN".',
  'IKEA': 'Texte "IKEA" en bleu sur fond jaune — couleurs nationales suédoises.',
  'Zara': '"ZARA" en fines lettres majuscules.',
  'H&M': '"H&M" en texte rouge.',
  'Dior': '"CHRISTIAN DIOR" en texte serif élégant.',
  "L'Oréal": '"L\'ORÉAL PARIS" en texte or et noir.',
  'Dove': 'La silhouette d\'une colombe blanche en vol.',
  'Colgate': 'Rouge et blanc avec le texte script "Colgate".',
  'Gillette': 'Un dégradé bleu à blanc avec une découpe en "V" dans les lettres.',
  'HSBC': 'Un motif hexagonal rouge (six triangles formant un hexagone).',
  'BNP Paribas': 'Quatre étoiles vertes arrangées en motif avec le texte "BNP Paribas".',
  'Canal+': 'Texte "Canal+" avec le symbole "+" en rouge.',
  'BBC': 'Trois carrés noirs contenant chacun "BBC" en texte blanc gras.',
  'CNN': '"CNN" en texte blanc sur fond rouge.',
  'Airbnb': 'Le symbole "Bélo" — une forme arrondie combinant un cœur, une personne et une épingle de localisation. En corail/rouge.',
  'PayPal': 'Deux lettres "P" qui se chevauchent en bleu, l\'une plus claire et l\'autre plus foncée.',
  'Uber': 'Un mot simple "Uber" en sans-serif gras noir, ou un motif carré "U".',
  'Zoom': 'Un "Z" bleu stylisé dans un carré bleu arrondi.',
  'Discord': 'Un masque/manette de jeu stylisée blanche sur fond violet/indigo. Ressemble à un visage simple.',
  'Spotify': 'Cercle vert avec trois lignes ondulées blanches horizontales — ondes sonores.',
  'Slack': 'Un dièse/hashtag composé de 4 cercles colorés de différentes couleurs, formant un "#".',
  'Pinterest': 'Un "P" rouge stylisé avec une épingle intégrée en bas.',
  'Reddit': 'Un alien/robot souriant orange avec des antennes — Snoo le mascotte Reddit.',
  'eBay': 'Texte "eBay" avec chaque lettre en couleur différente (rouge, bleu, jaune, vert).',
  'Walmart': 'Une fleur/étoile à six branches jaune-orangée sur fond bleu.',
  'Target': 'Un cercle rouge avec un autre cercle blanc concentrique et un point rouge au centre — une cible.',
  'Carrefour': 'Deux flèches en sens inverse formant un "C" dans les espaces négatifs, en bleu et rouge.',
  'Lidl': 'Un cercle rouge, jaune et bleu avec le texte "Lidl" en bleu sur fond jaune.',
  'Danone': 'Un enfant qui regarde une étoile, stylisé en bleu.',
  'Nutella': 'Texte "Nutella" en rouge avec une virgule jaune.',
  'Pfizer': 'Un double ovale bleu stylisé.',
  'Johnson & Johnson': 'Le script/signature "Johnson & Johnson" en rouge.',
  'Decathlon': 'Un "d" bleu avec une flèche, ou le texte "DECATHLON" en bleu.',
  'MVOLA': 'Logo mobile money malgache bleu et vert, avec le texte "mvola".',
  'Orange Money': 'Un cercle orange avec des lignes représentant le transfert d\'argent.',
  'Airtel Money': 'Logo Airtel rouge avec une icône de pièce ou billet.',
  'Tiko': 'Logo malgache rouge et blanc pour produits laitiers.',
  'THB': 'Logo de bière Three Horses Beer, chevaux au galop.',
  'Star Brasseries': 'Logo brasserie avec étoile et couleurs vives.',
};

console.log(`📚 Logo knowledge base loaded: ${Object.keys(FAMOUS_BRANDS_LOGOS).length} brand logos referenced.`);


// Helper to locally verify the description for coherence, gibberish, cuss words, etc.
function localVerifyDescription(description) {
  const desc = description.trim();
  if (desc.length < 15) {
    return { valid: false, reason: "La description est trop courte. Veuillez donner une description de plus de 15 caractères." };
  }
  const words = desc.split(/\s+/).filter(Boolean);
  if (words.length < 3) {
    return { valid: false, reason: "La description doit contenir au moins 3 mots." };
  }

  // Check appropriateness of the description
  const appropriateness = checkAppropriateness(desc);
  if (!appropriateness.appropriate) {
    return { valid: false, reason: "La description contient des termes inappropriés : " + appropriateness.reason };
  }

  // Gibberish detection: check for words with no vowels or excessively long words
  for (const word of words) {
    if (word.length > 25) {
      return { valid: false, reason: `Le mot "${word.substring(0, 10)}..." est trop long et semble invalide.` };
    }
    // If a word is longer than 4 characters and has no vowels/numbers
    if (word.length > 4 && !/[aeiouyàâäéèêëîïôöùûüÿçñ0-9]/i.test(word)) {
      return { valid: false, reason: `Le mot "${word}" ne contient aucune voyelle et semble incohérent.` };
    }
  }

  // Repetitive text check: if the description repeats the same word too many times
  const wordCounts = {};
  for (const w of words) {
    const lw = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lw.length > 2) {
      wordCounts[lw] = (wordCounts[lw] || 0) + 1;
      if (wordCounts[lw] > 4 && wordCounts[lw] > words.length * 0.4) {
        return { valid: false, reason: "La description contient des répétitions excessives de mots." };
      }
    }
  }

  return { valid: true };
}

// Helper to check if a description resembles another one in the database or famous brands
function checkDescriptionSimilarity(description) {
  // Get all existing brand descriptions from marque_details
  const existingMarques = db.prepare(`
    SELECT d.name, md.brand_description, u.name as owner_name
    FROM dossiers d
    JOIN marque_details md ON d.id = md.dossier_id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.type = 'Marque' AND md.brand_description IS NOT NULL AND md.brand_description != ''
  `).all();

  const userWords = new Set(description.toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüÿçñ]/g, ' ').split(/\s+/).filter(Boolean));
  if (userWords.size === 0) return null;

  for (const em of existingMarques) {
    const existingWords = new Set(em.brand_description.toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüÿçñ]/g, ' ').split(/\s+/).filter(Boolean));
    if (existingWords.size === 0) continue;

    // Calculate Jaccard similarity of word sets
    const intersect = new Set([...userWords].filter(x => existingWords.has(x)));
    const union = new Set([...userWords, ...existingWords]);
    const sim = intersect.size / union.size;

    // If similarity is very high (e.g. > 55%) or exact substring matching of a long text
    const descTrim = description.toLowerCase().trim();
    const emTrim = em.brand_description.toLowerCase().trim();
    if (sim > 0.55 || (description.length > 30 && emTrim.includes(descTrim)) || (em.brand_description.length > 30 && descTrim.includes(emTrim))) {
      return {
        similarMark: em.name,
        owner: em.owner_name || 'Mandant local',
        similarity: Math.round(sim * 100),
        description: em.brand_description
      };
    }
  }

  // Check against FAMOUS_BRANDS descriptions
  for (const fb of FAMOUS_BRANDS) {
    if (!fb.description) continue;
    const fbWords = new Set(fb.description.toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüÿçñ]/g, ' ').split(/\s+/).filter(Boolean));
    if (fbWords.size === 0) continue;

    const intersect = new Set([...userWords].filter(x => fbWords.has(x)));
    const union = new Set([...userWords, ...fbWords]);
    const sim = intersect.size / union.size;

    const descTrim = description.toLowerCase().trim();
    const fbTrim = fb.description.toLowerCase().trim();
    if (sim > 0.45 || (description.length > 35 && fbTrim.includes(descTrim)) || (fb.description.length > 35 && descTrim.includes(fbTrim))) {
      return {
        similarMark: fb.name,
        owner: fb.owner,
        similarity: Math.round(sim * 100),
        description: fb.description
      };
    }
  }

  return null;
}

const STOP_WORDS = new Set([
  'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'pour', 'est', 'sont', 'ses', 'nos', 'votre', 'notre', 'qui', 'que', 'dans', 'avec', 'par', 'sur', 'en', 'et', 'ou',
  'the', 'a', 'an', 'of', 'for', 'and', 'to', 'in', 'is', 'are', 'its', 'our', 'your', 'with', 'by', 'on', 'at', 'this', 'that', 'from', 'as', 'about',
  'une', 'd', 'l', 's', 't', 'm', 'n', 'c', 'qu', 'ce', 'ces', 'cette', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'leur', 'leurs',
  'nous', 'vous', 'ils', 'elles', 'je', 'tu', 'il', 'elle', 'on', 'mais', 'donc', 'car', 'ni', 'si', 'comme', 'plus', 'moins', 'très'
]);

function generateDescriptionBasedAlternatives(name, description) {
  const cleanName = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const cleanDesc = description.trim().toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüÿçñ\s]/g, ' ');
  const descWords = cleanDesc.split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));

  const base = cleanName.split(/\s+/)[0] || 'Marque';
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const results = [];
  const prefixes = ['Soa', 'Tsara', 'Mada', 'Rova', 'Kintana', 'Vato', 'Harena', 'Neo', 'Inno', 'Apex', 'Nova', 'Eco', 'Bio', 'Elite', 'Aura'];
  const suffixes = ['Gasy', 'Soa', 'Tsara', 'Harena', 'Rina', 'Zara', 'Tech', 'Soft', 'Hub', 'Labs', 'Flow', 'Nova', 'Apex', 'Next', 'Sphere', 'Zone', 'Link'];

  if (descWords.length > 0) {
    const keywords = [...new Set(descWords)].slice(0, 3);
    keywords.forEach(kw => {
      const capKw = cap(kw);
      results.push(capKw + suffixes[Math.floor(Math.random() * suffixes.length)]);
      results.push(prefixes[Math.floor(Math.random() * prefixes.length)] + capKw);
      results.push(cap(base) + capKw);
      results.push(capKw + cap(base));
    });
  }

  results.push('Neo' + cap(base));
  results.push(cap(base) + 'Tech');
  results.push(cap(base) + 'Nova');

  const finalSet = [...new Set(results)].filter(s => s.length > 3 && s.length < 20);
  
  if (finalSet.length < 5) {
    while (finalSet.length < 5) {
      finalSet.push(cap(base) + Math.floor(10 + Math.random() * 89));
    }
  }

  return finalSet.slice(0, 5);
}

// Helper to determine if a name is a geographic location (particularly in Madagascar)
async function checkIfGeographicLocation(name, geminiKey) {
  const normalized = name.toLowerCase().trim();
  
  // Local check for Madagascar and major global locations
  const GEOGRAPHIC_LOCATIONS = [
    'antananarivo', 'tananarive', 'tana',
    'toamasina', 'tamatave',
    'antsirabe', 'fianarantsoa', 'mahajanga', 'majunga',
    'toliara', 'tulear', 'antsiranana', 'diego suarez', 'diego',
    'nosy be', 'sainte marie', 'sambava', 'antalaha',
    'taolagnaro', 'fort dauphin', 'morondava', 'ambatondrazaka',
    'manakara', 'farafangana', 'madagascar', 'mada',
    'mananjary', 'maroantsetra', 'tolanaro', 'ambositra', 'tsiroanomandidy', 'ankazobe',
    'usa', 'united states', 'etats unis', 'tokyo', 'china', 'chine', 'paris',
    'london', 'londres', 'japan', 'japon', 'france', 'canada', 'germany', 'allemagne',
    'italy', 'italie', 'spain', 'espagne', 'russia', 'russie', 'india', 'inde',
    'egypt', 'egypte', 'brazil', 'bresil', 'australia', 'australie', 'africa', 'afrique',
    'asia', 'asie', 'europe', 'america', 'amerique'
  ];

  if (GEOGRAPHIC_LOCATIONS.includes(normalized)) {
    return { isLocation: true, details: `Le nom "${name}" correspond à une localisation géographique, un pays ou une ville célèbre dans le monde.` };
  }

  // If Gemini key is available, check globally or regionally
  if (geminiKey) {
    try {
      const prompt = `Tu es un expert en propriété intellectuelle à l'OMAPI. Détermine si le nom "${name}" correspond principalement à un lieu géographique existant, une ville, une province, une région, un État, un continent ou un pays connu dans le monde (par exemple USA, Tokyo, Chine, Paris, Tamatave, Madagascar, etc.). Réponds STRICTEMENT sous format JSON comme suit : {"isLocation": true/false, "details": "explication succincte en français"}`;
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const result = JSON.parse(text.trim());
        if (result.isLocation) {
          return { isLocation: true, details: result.details || `Le nom "${name}" est identifié comme une localisation géographique.` };
        }
      }
    } catch (e) {
      console.warn('Gemini location check failed:', e.message);
    }
  }

  return { isLocation: false };
}

// Helper to check if a name matches a famous movie or film franchise
async function checkIfFamousMovie(name, geminiKey) {
  const normalized = name.toLowerCase().trim();

  // Local list of famous movie/franchise titles
  const FAMOUS_MOVIES = [
    'harry potter', 'star wars', 'titanic', 'avatar', 'jurassic park',
    'the matrix', 'matrix', 'lord of the rings', 'seigneur des anneaux',
    'avengers', 'gladiator', 'inception', 'spider-man', 'spiderman',
    'batman', 'superman', 'iron man', 'toy story', 'finding nemo',
    'the godfather', 'parrain', 'pulp fiction', 'star trek',
    'lion king', 'roi lion', 'frozen', 'reine des neiges', 'shrek',
    'pirates of the caribbean', 'pirates des caraibes'
  ];

  if (FAMOUS_MOVIES.includes(normalized)) {
    return { isMovie: true, details: `Le nom "${name}" correspond au titre d'une franchise cinématographique ou d'un film célèbre.` };
  }

  if (geminiKey) {
    try {
      const prompt = `Tu es un expert à l'OMAPI. Détermine si le nom de marque "${name}" correspond exactement ou très fortement au titre d'un film célèbre, d'une série télévisée ou d'une franchise cinématographique majeure mondiale (par exemple Harry Potter, Star Wars, Titanic, Avatar, etc.). Réponds STRICTEMENT sous format JSON comme suit : {"isMovie": true/false, "movieName": "Nom de l'oeuvre"}`;
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const result = JSON.parse(text.trim());
        if (result.isMovie) {
          return { isMovie: true, details: `Le nom correspond au film/oeuvre : "${result.movieName}".` };
        }
      }
    } catch (e) {
      console.warn('Gemini movie check failed:', e.message);
    }
  }

  return { isMovie: false };
}

// ── Logo analysis helpers (shared by name+logo and logo-only endpoints) ───────

function resolveLogoBase64(brandLogo) {
  if (!brandLogo) return { logoBase64: null, logoMimeType: null }

  if (brandLogo.startsWith('data:image/')) {
    const match = brandLogo.match(/^data:(image\/\w+);base64,(.+)$/)
    if (match) return { logoMimeType: match[1], logoBase64: match[2] }
  }

  if (brandLogo.startsWith('http://localhost') || brandLogo.startsWith('http://127.0.0.1')) {
    try {
      const urlParts = brandLogo.split('/uploads/')
      if (urlParts.length === 2) {
        const filename = urlParts[1]
        const filePath = path.join(__dirname, 'uploads', filename)
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath)
          const ext = path.extname(filename).toLowerCase()
          return {
            logoBase64: fileBuffer.toString('base64'),
            logoMimeType: ext === '.png' ? 'image/png' : 'image/jpeg',
          }
        }
      }
    } catch (err) {
      console.warn('Failed to read local uploaded logo:', err.message)
    }
  }

  return { logoBase64: null, logoMimeType: null }
}

function getLocalLogoKnowledgeRows() {
  return db.prepare(`
    SELECT d.name, md.logo_description, md.logo_url
    FROM dossiers d
    JOIN marque_details md ON d.id = md.dossier_id
    WHERE d.type = 'Marque'
      AND md.logo_description IS NOT NULL
      AND md.logo_description != ''
  `).all()
}

function buildLogoKnowledgePromptSection() {
  const famousLogoKnowledge = Object.entries(FAMOUS_BRANDS_LOGOS)
    .map(([brand, desc]) => `- ${brand}: ${desc}`)
    .join('\n')

  const localLogoRows = getLocalLogoKnowledgeRows()
  const localLogosKnowledge = localLogoRows.length > 0
    ? '\n\nLogos de marques locales déjà déposées à l\'OMAPI (Madagascar) :\n' +
      localLogoRows.map(r => `- ${r.name}: ${r.logo_description}`).join('\n')
    : ''

  return { famousLogoKnowledge, localLogosKnowledge, localLogoRows }
}

function checkLocalLogoDescriptionSimilarity(logoDescription) {
  if (!logoDescription || logoDescription.trim().length < 10) return null

  const descWords = new Set(
    logoDescription.toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüÿçñ]/g, ' ').split(/\s+/).filter(w => w.length > 3)
  )
  if (descWords.size === 0) return null

  for (const row of getLocalLogoKnowledgeRows()) {
    const existingWords = new Set(
      row.logo_description.toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüÿçñ]/g, ' ').split(/\s+/).filter(w => w.length > 3)
    )
    if (existingWords.size === 0) continue

    const intersect = new Set([...descWords].filter(x => existingWords.has(x)))
    const union = new Set([...descWords, ...existingWords])
    const sim = intersect.size / union.size

    if (sim > 0.45) {
      return {
        similarMark: row.name,
        similarity: Math.round(sim * 100),
        description: row.logo_description,
      }
    }
  }
  return null
}

async function analyzeLogoVisual({ name, description, brandLogo, geminiKey, nameCandidates = [] }) {
  const { logoBase64, logoMimeType } = resolveLogoBase64(brandLogo)

  const logoAnalysis = {
    hasVisualConflict: false,
    conflictDetails: 'Aucun conflit visuel majeur détecté.',
    visualScorePenalty: 0,
    logoDescription: '',
    conflictingBrand: '',
    conflictSource: '',
  }

  if (!logoBase64) return null

  if (geminiKey) {
    try {
      const { famousLogoKnowledge, localLogosKnowledge } = buildLogoKnowledgePromptSection()

      const logoPrompt = `Tu es un expert mondial en propriété industrielle et en design visuel de logo à l'OMAPI (Office de propriété industrielle de Madagascar). L'utilisateur souhaite déposer une marque nommée "${name}"${description ? ` dont le concept est : "${description}"` : ''}.

Voici le logo qu'il propose. Analyse ce logo attentivement et compare-le aux descriptions visuelles des logos des grandes marques mondiales que tu connais déjà, ainsi qu'à la bibliothèque ci-dessous :

=== BIBLIOTHÈQUE DE LOGOS CÉLÈBRES (référence) ===
${famousLogoKnowledge}${localLogosKnowledge}

En utilisant cette bibliothèque complète, détermine si le logo soumis :
1. Ressemble visuellement (formes, couleurs, concept, style) à l'un des logos de cette liste ou à d'autres logos de grandes marques que tu connais (ex: Nike swoosh, Apple pomme, McDonald's arches, etc.).
2. Présente un risque de confusion, de plagiat, d'imitation ou de parasitisme commercial avec une marque célèbre OU une marque locale déjà déposée à l'OMAPI.
3. Formule une description visuelle synthétique de ce logo soumis (formes, couleurs, style) — cette description sera stockée pour les futures comparaisons.

Réponds STRICTEMENT au format JSON suivant sans aucun autre texte :
{"hasVisualConflict": true/false, "conflictDetails": "explication détaillée et constructive en français", "visualScorePenalty": 0, "logoDescription": "description visuelle en une phrase", "conflictingBrand": "nom de la marque en conflit ou chaîne vide", "conflictSource": "célèbre|local|aucun"}

où visualScorePenalty est un entier entre 0 et 50 (0 = aucun conflit, 50 = copie flagrante).`

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: logoPrompt },
              { inlineData: { mimeType: logoMimeType || 'image/jpeg', data: logoBase64 } },
            ],
          }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      })

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json()
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        const parsed = JSON.parse(text.trim())
        logoAnalysis.hasVisualConflict = !!parsed.hasVisualConflict
        logoAnalysis.conflictDetails = parsed.conflictDetails || 'Analyse terminée.'
        logoAnalysis.visualScorePenalty = Math.min(50, Math.max(0, parseInt(parsed.visualScorePenalty) || 0))
        logoAnalysis.logoDescription = parsed.logoDescription || ''
        logoAnalysis.conflictingBrand = parsed.conflictingBrand || ''
        logoAnalysis.conflictSource = parsed.conflictSource || (parsed.hasVisualConflict ? 'célèbre' : 'aucun')
      }
    } catch (geminiError) {
      console.warn('Gemini logo visual check failed:', geminiError.message)
    }
  }

  // Local fallback: name similarity heuristic
  if (logoAnalysis.visualScorePenalty === 0 && nameCandidates.length > 0) {
    const famousConflict = nameCandidates.find(c => {
      const stats = getSimilarityStats(name, c.name)
      return stats.similarity > 0.6
    })
    if (famousConflict) {
      logoAnalysis.hasVisualConflict = true
      logoAnalysis.conflictingBrand = famousConflict.name
      logoAnalysis.conflictSource = famousConflict.country === 'MG' ? 'local' : 'célèbre'
      logoAnalysis.conflictDetails = `Analyse locale : Le nom "${name}" ressemble fortement à "${famousConflict.name}". Risque d'association visuelle avec cette marque.`
      logoAnalysis.visualScorePenalty = 25
    }
  }

  // Local fallback: compare AI description against stored local logo descriptions
  if (logoAnalysis.logoDescription) {
    const localConflict = checkLocalLogoDescriptionSimilarity(logoAnalysis.logoDescription)
    if (localConflict && localConflict.similarity > (logoAnalysis.visualScorePenalty > 0 ? 70 : 45)) {
      logoAnalysis.hasVisualConflict = true
      logoAnalysis.conflictingBrand = localConflict.similarMark
      logoAnalysis.conflictSource = 'local'
      logoAnalysis.conflictDetails = `Ressemblance visuelle détectée avec la marque locale "${localConflict.similarMark}" déjà déposée à l'OMAPI (${localConflict.similarity}% de similarité descriptive). ${logoAnalysis.conflictDetails}`
      logoAnalysis.visualScorePenalty = Math.max(logoAnalysis.visualScorePenalty, Math.min(50, Math.round(localConflict.similarity * 0.6)))
    }
  }

  return logoAnalysis
}

// Dedicated logo-only originality check (for the upload box AI button)
app.post('/api/trademarks/check-logo-originality', authenticateToken, async (req, res) => {
  const { brandName, brandDescription, brandLogo } = req.body

  if (!brandLogo) {
    return res.status(400).json({ message: 'Veuillez joindre un logo avant de lancer l\'analyse visuelle.' })
  }

  const name = brandName?.trim() || 'Marque sans nom'
  const description = brandDescription?.trim() || ''
  const geminiKey = process.env.GEMINI_API_KEY

  const { logoBase64 } = resolveLogoBase64(brandLogo)
  if (!logoBase64) {
    return res.status(400).json({ message: 'Impossible de lire l\'image du logo. Réessayez avec un JPG ou PNG.' })
  }

  try {
    const candidates = [...FAMOUS_BRANDS]
    db.prepare(`
      SELECT d.name, u.name as owner_name, 'MG' as country, d.status
      FROM dossiers d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.type = 'Marque'
    `).all().forEach(ld => {
      candidates.push({
        name: ld.name,
        owner: ld.owner_name || 'Mandant local',
        country: 'MG',
        status: ld.status,
      })
    })

    const localLogoRows = getLocalLogoKnowledgeRows()
    const logoAnalysis = await analyzeLogoVisual({
      name,
      description,
      brandLogo,
      geminiKey,
      nameCandidates: candidates,
    })

    const visualOriginalityScore = Math.max(0, 100 - (logoAnalysis?.visualScorePenalty || 0))

    let explanation = ''
    if (geminiKey && logoAnalysis) {
      try {
        const prompt = `Tu es un expert OMAPI en propriété industrielle. L'utilisateur a soumis un logo pour la marque "${name}". Score d'originalité visuelle : ${visualOriginalityScore}/100. Conflit détecté : ${logoAnalysis.hasVisualConflict ? 'oui' : 'non'}. Détails : "${logoAnalysis.conflictDetails}". Rédige une analyse concise en français (2-3 phrases) avec recommandations pratiques.`
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        })
        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json()
          explanation = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
        }
      } catch (e) {
        console.warn('Gemini logo explanation failed:', e.message)
      }
    }

    if (!explanation && logoAnalysis) {
      if (visualOriginalityScore >= 80) {
        explanation = `Votre logo présente un bon niveau d'originalité visuelle. Aucune ressemblance majeure avec les ${Object.keys(FAMOUS_BRANDS_LOGOS).length} marques célèbres référencées ni avec les ${localLogoRows.length} marque(s) locale(s) connues.`
      } else if (visualOriginalityScore >= 50) {
        explanation = `Votre logo présente des similitudes partielles avec des marques existantes. ${logoAnalysis.conflictDetails} Envisagez des modifications avant le dépôt officiel.`
      } else {
        explanation = `Attention : votre logo présente un risque élevé de confusion visuelle. ${logoAnalysis.conflictDetails} Une refonte est fortement recommandée.`
      }
    }

    res.json({
      visualOriginalityScore,
      logoAnalysis,
      explanation: explanation.trim(),
      totalKnownLogos: Object.keys(FAMOUS_BRANDS_LOGOS).length + localLogoRows.length,
      localLogosInDatabase: localLogoRows.length,
    })
  } catch (error) {
    console.error('Check logo originality route error:', error)
    res.status(500).json({ message: 'Erreur lors de l\'analyse visuelle du logo.' })
  }
})

app.post('/api/trademarks/check-originality', authenticateToken, async (req, res) => {
  const { brandName, brandDescription, brandLogo } = req.body;
  if (!brandName || !brandName.trim()) {
    return res.status(400).json({ message: 'Le nom de la marque est requis.' });
  }

  const name = brandName.trim();
  const description = brandDescription ? brandDescription.trim() : '';
  const geminiKey = process.env.GEMINI_API_KEY;
  
  // 1. Guideline Validation
  const appropriateness = checkAppropriateness(name);
  if (!appropriateness.appropriate) {
    return res.json({
      appropriate: false,
      descriptionValid: true,
      originalityScore: 0,
      topMatches: [],
      explanation: appropriateness.reason,
      totalChecked: 0,
      suggestions: []
    });
  }

  // 1B. Geographic Location Validation
  const locationCheck = await checkIfGeographicLocation(name, geminiKey);
  if (locationCheck.isLocation) {
    return res.json({
      appropriate: false,
      descriptionValid: true,
      originalityScore: 0,
      topMatches: [],
      explanation: `Le nom de marque saisi "${name}" est déjà une localisation géographique ou une ville. ${locationCheck.details} L'enregistrement de noms géographiques purs comme marques est restreint ou interdit.`,
      totalChecked: 0,
      suggestions: []
    });
  }

  // 1C. Famous Movie/Franchise Validation
  const movieCheck = await checkIfFamousMovie(name, geminiKey);
  if (movieCheck.isMovie) {
    return res.json({
      appropriate: false,
      descriptionValid: true,
      originalityScore: 0,
      topMatches: [],
      explanation: `Le nom de marque saisi "${name}" fait référence au titre d'une franchise ou d'un film célèbre existant. ${movieCheck.details} Déposer le titre exact d'une oeuvre célèbre est interdit afin d'éviter le parasitisme commercial.`,
      totalChecked: 0,
      suggestions: []
    });
  }

  // Description validation checks if present
  if (description) {
    const descAppropriateness = checkAppropriateness(description);
    if (!descAppropriateness.appropriate) {
      return res.json({
        appropriate: true,
        descriptionValid: false,
        descriptionExplanation: `La description contient des termes inappropriés non autorisés : ${descAppropriateness.reason}`,
        originalityScore: 0,
        topMatches: [],
        totalChecked: 0,
        suggestions: []
      });
    }

    let descCoherent = true;
    let coherenceReason = '';

    if (geminiKey) {
      try {
        const coherencePrompt = `Tu es un expert à l'OMAPI (Office de propriété industrielle). Évalue si la description suivante d'une marque est valide, sémantiquement et logiquement cohérente (elle doit décrire une activité, un produit, un concept, une marque, etc. et ne doit PAS être une suite de lettres ou de mots sans suite logique comme "asdfg", "bonjour salut test test", etc.). Réponds STRICTEMENT au format JSON suivant : {"valid": true, "reason": ""} ou {"valid": false, "reason": "La description semble incohérente ou sans rapport avec un projet sérieux (explication concise en français)"}. Description : "${description}"`;
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: coherencePrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const result = JSON.parse(resultText.trim());
          if (result.valid === false) {
            descCoherent = false;
            coherenceReason = result.reason || "La description semble incohérente sémantiquement.";
          }
        }
      } catch (geminiError) {
        console.warn('Gemini coherence check failed:', geminiError.message);
      }
    }

    if (descCoherent) {
      const localCheck = localVerifyDescription(description);
      if (!localCheck.valid) {
        descCoherent = false;
        coherenceReason = localCheck.reason;
      }
    }

    if (!descCoherent) {
      return res.json({
        appropriate: true,
        descriptionValid: false,
        descriptionExplanation: "Veuillez rédiger une description qui a du sens. / Please write a description that makes sense.",
        originalityScore: 0,
        topMatches: [],
        totalChecked: 0,
        suggestions: []
      });
    }

    const similarityConflict = checkDescriptionSimilarity(description);
    if (similarityConflict) {
      return res.json({
        appropriate: true,
        descriptionValid: false,
        descriptionExplanation: `La description de votre marque ressemble fortement (${similarityConflict.similarity}% de similarité) à celle de la marque existante "${similarityConflict.similarMark}" déposée par "${similarityConflict.owner}". Une description originale est requise.`,
        originalityScore: 0,
        topMatches: [],
        totalChecked: 0,
        suggestions: []
      });
    }
  }

  try {
    // 2. Gather all comparison candidates:
    const candidates = [...FAMOUS_BRANDS];

    // Get marks from our local SQLite db
    const localDossiers = db.prepare(`
      SELECT d.name, u.name as owner_name, 'MG' as country, d.status
      FROM dossiers d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.type = 'Marque'
    `).all();

    localDossiers.forEach(ld => {
      candidates.push({
        name: ld.name,
        owner: ld.owner_name || 'Mandant local',
        country: 'MG',
        status: ld.status
      });
    });

    // 3. Fetch from public USPTO Open Data API if possible, or fallback gracefully
    try {
      const cached = db.prepare('SELECT result_json FROM trademark_cache WHERE query_name = ?').get(name.toLowerCase());
      let apiResults = [];
      if (cached) {
        apiResults = JSON.parse(cached.result_json);
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

        const response = await fetch(`https://developer.uspto.gov/ibd-api/v1/trademark/search?searchText=${encodeURIComponent(name)}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.results) {
            apiResults = data.results.slice(0, 25).map(item => ({
              name: item.trademarkName || item.wordMark || 'Inconnu',
              owner: item.ownerName || 'Déposant USPTO',
              country: 'US',
              status: item.status || 'Enregistré'
            }));
            db.prepare('INSERT OR REPLACE INTO trademark_cache (query_name, result_json) VALUES (?, ?)').run(name.toLowerCase(), JSON.stringify(apiResults));
          }
        }
      }

      if (apiResults && apiResults.length > 0) {
        candidates.push(...apiResults);
      }
    } catch (e) {
      console.warn('USPTO API check failed/timed out, continuing locally. Details:', e.message);
    }

    // 4. Compute similarity and scores
    const results = [];
    let maxSimilarity = 0;
    const seenNames = new Set();

    for (const c of candidates) {
      if (!c.name) continue;
      const canon = c.name.trim().toLowerCase();
      if (seenNames.has(canon)) continue;
      seenNames.add(canon);

      const stats = getSimilarityStats(name, c.name);
      if (stats.similarity > 0.15) {
        results.push({
          name: c.name,
          owner: c.owner,
          country: c.country,
          status: c.status,
          similarity: Math.round(stats.similarity * 100),
          details: stats.details
        });
        if (stats.similarity > maxSimilarity) {
          maxSimilarity = stats.similarity;
        }
      }
    }

    results.sort((a, b) => b.similarity - a.similarity);

    let originalityScore = Math.max(0, Math.round(100 - (maxSimilarity * 100)));
    const topMatches = results.slice(0, 5);

    // ── Logo / Visual Analysis (Gemini Multimodal with Logo Knowledge Base) ──
    let logoAnalysis = null
    if (brandLogo) {
      logoAnalysis = await analyzeLogoVisual({
        name,
        description,
        brandLogo,
        geminiKey,
        nameCandidates: candidates,
      })
    }

    // ── Semantic Description/Concept Analysis (Gemini or Local Fallback) ──
    let conceptAnalysis = { conceptConflict: false, conflictingBrand: "", descriptionSimilarityScore: 0, conceptMatchExplanation: "Aucun conflit conceptuel majeur détecté.", conceptScorePenalty: 0 };
    if (description) {
      if (geminiKey) {
        try {
          const conceptPrompt = `Tu es un expert mondial en propriété intellectuelle à l'OMAPI. L'utilisateur souhaite déposer la marque "${name}" avec la description de projet suivante : "${description}". Compare conceptuellement cette description avec toutes les marques célèbres existantes dans le monde (comme Coca-Cola pour les boissons gazeuses sucrées, Nike/Adidas pour le sport/chaussures, Apple/Android/iPhone/Google Pixel pour la tech/smartphones/tablettes, McDonald's/Burger King pour la restauration rapide, Telma/Orange/Airtel/Mvola pour les télécoms et le mobile money au Madagascar, etc.). Détermine s'il y a un conflit conceptuel direct (par exemple, si l'utilisateur décrit un projet de smartphone nommé 'Banana' ressemblant trop au concept de l'iPhone, ou une boisson gazeuse sucrée noire gazeuse ressemblant à Coca-Cola). Évalue le niveau de ressemblance conceptuelle de 0 à 100 et le score de pénalité de 0 à 40. Réponds STRICTEMENT sous format JSON comme suit : {"conceptConflict": true/false, "conflictingBrand": "nom de la marque en conflit ou vide", "descriptionSimilarityScore": 0, "conceptMatchExplanation": "Explication détaillée en français sur la similarité conceptuelle ou l'originalité", "conceptScorePenalty": 0}. Ne mets aucun autre texte avant ou après le JSON.`;

          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: conceptPrompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          });

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const parsed = JSON.parse(text.trim());
            conceptAnalysis.conceptConflict = !!parsed.conceptConflict;
            conceptAnalysis.conflictingBrand = parsed.conflictingBrand || "";
            conceptAnalysis.descriptionSimilarityScore = Math.min(100, Math.max(0, parseInt(parsed.descriptionSimilarityScore) || 0));
            conceptAnalysis.conceptMatchExplanation = parsed.conceptMatchExplanation || "";
            conceptAnalysis.conceptScorePenalty = Math.min(40, Math.max(0, parseInt(parsed.conceptScorePenalty) || 0));
          }
        } catch (geminiError) {
          console.warn('Gemini concept check failed:', geminiError.message);
        }
      }

      // Local fallback for concept checking
      if (conceptAnalysis.conceptScorePenalty === 0) {
        const localDescConflict = checkDescriptionSimilarity(description);
        if (localDescConflict) {
          conceptAnalysis = {
            conceptConflict: true,
            conflictingBrand: localDescConflict.similarMark,
            descriptionSimilarityScore: localDescConflict.similarity,
            conceptMatchExplanation: `Analyse locale : La description saisie ressemble fortement (${localDescConflict.similarity}% de similarité) au concept de la marque "${localDescConflict.similarMark}" détenue par "${localDescConflict.owner}".`,
            conceptScorePenalty: Math.min(40, Math.round(localDescConflict.similarity * 0.5))
          };
        }
      }
    }

    // Apply Penalties to Originality Score
    if (logoAnalysis && logoAnalysis.visualScorePenalty > 0) {
      originalityScore = Math.max(0, originalityScore - logoAnalysis.visualScorePenalty);
    }
    if (conceptAnalysis && conceptAnalysis.conceptScorePenalty > 0) {
      originalityScore = Math.max(0, originalityScore - conceptAnalysis.conceptScorePenalty);
    }

    // AI Narrative Explanation Generation
    let explanation = '';
    if (geminiKey) {
      try {
        const matchesStr = topMatches.length > 0
          ? topMatches.map(m => `"${m.name}" (${m.similarity}% de similarité)`).join(', ')
          : 'aucune marque similaire détectée';
        const descContext = description ? ` La description du concept de la marque est : "${description}".` : '';
        const logoContext = logoAnalysis && logoAnalysis.hasVisualConflict ? ` L'analyse visuelle indique un risque de ressemblance du logo : "${logoAnalysis.conflictDetails}" (-${logoAnalysis.visualScorePenalty}% pénalité).` : '';
        const conceptContext = conceptAnalysis && conceptAnalysis.conceptConflict ? ` L'analyse conceptuelle indique un conflit de concept : "${conceptAnalysis.conceptMatchExplanation}" (-${conceptAnalysis.conceptScorePenalty}% pénalité).` : '';
        
        const prompt = `Tu es un expert juridique en propriété intellectuelle à l'OMAPI (Madagascar). L'utilisateur souhaite déposer la marque "${name}".${descContext}${logoContext}${conceptContext} Le score d'originalité final calculé (prenant en compte le nom, le concept et le logo) est de ${originalityScore}/100. Les marques de nom similaire sont : ${matchesStr}. Rédige une analyse synthétique et professionnelle en français (max 3 phrases) expliquant comment ce score est calculé et formulant des recommandations directes.`;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          explanation = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (geminiError) {
        console.warn('Gemini explanation generation failed:', geminiError.message);
      }
    }

    if (!explanation) {
      if (originalityScore >= 80) {
        explanation = `La marque "${name}" présente un excellent niveau d'originalité. Aucune similarité majeure de nom, de concept ou de logo n'a été détectée. Le risque de confusion est minime.`;
      } else if (originalityScore >= 50) {
        explanation = `La marque "${name}" est modérément originale. Des similarités partielles, conceptuelles ou de logo ont été identifiées (pénalités appliquées). Restez vigilant sur les classes de Nice revendiquées.`;
      } else {
        explanation = `Attention, la marque "${name}" ressemble fortement à des marques enregistrées ou présente un conflit de concept/logo important. Risque de rejet ou de litige élevé. Une révision est fortement recommandée.`;
      }
    }

    // 5. Generate and Verify Suggestions (Ensuring >= 50% Originality and Deep Concept Match)
    let rawSuggestions = [];
    if (geminiKey) {
      try {
        let suggestionsPrompt;
        if (description) {
          suggestionsPrompt = `Tu es un expert mondial en branding et propriété industrielle à l'OMAPI (Madagascar). L'utilisateur souhaite déposer la marque "${name}".
Son concept et projet de marque est décrit ainsi : "${description}".
Génère 8 noms de marque alternatifs originaux, élégants et accrocheurs qui :
(1) Capturent profondément l'essence, le concept, et la sémantique de la description (par exemple, si la description évoque le café, propose des concepts liés à l'arôme, l'éveil, la graine, au lieu de juste faire un jeu de mot basique avec "${name}").
(2) Sont adaptés à un dépôt de marque officiel et respectent le marché malgache et international.
(3) Évitent tout conflit phonétique ou orthographique avec les marques connues.
(4) Sont en français, en anglais ou en malgache poétique.
Renvoie UNIQUEMENT les noms générés sous forme de liste séparée par des virgules (ex: NomUn, NomDeux, NomTrois), sans aucune introduction, numérotation, ni explication.`;
        } else {
          suggestionsPrompt = `Tu es un expert en branding. L'utilisateur souhaite déposer la marque "${name}" au Madagascar. Elle ressemble aux marques : ${topMatches.slice(0, 3).map(m => m.name).join(', ')}. Génère 8 noms de marque alternatifs originaux, modernes et distinctifs en français, malgache ou anglais, adaptés au marché malgache. Renvoie UNIQUEMENT les noms séparés par des virgules, sans numérotation ni explication.`;
        }

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: suggestionsPrompt }] }]
          })
        });
        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          rawSuggestions = text.split(',').map(s => s.trim().replace(/^[\d.\-\*\s]+/, '').replace(/[^a-zA-Z0-9\sÀ-ÿ\-']/g, '').trim()).filter(s => s.length > 2 && s.length < 30);
        }
      } catch (geminiError) {
        console.warn('Gemini suggestions generation failed:', geminiError.message);
      }
    }

    if (!rawSuggestions || rawSuggestions.length === 0) {
      if (description) {
        rawSuggestions = generateDescriptionBasedAlternatives(name, description);
      } else {
        rawSuggestions = generateAlternativeNames(name);
      }
    }

    // Helper to calculate originality score for suggestions locally
    function calculateNameOriginalityScore(candidateName) {
      let maxSim = 0;
      const seen = new Set();
      for (const c of candidates) {
        if (!c.name) continue;
        const canon = c.name.trim().toLowerCase();
        if (seen.has(canon)) continue;
        seen.add(canon);

        const stats = getSimilarityStats(candidateName, c.name);
        if (stats.similarity > maxSim) {
          maxSim = stats.similarity;
        }
      }
      return Math.max(0, Math.round(100 - (maxSim * 100)));
    }

    // Loop & verify originality scores
    let verifiedSuggestions = [];
    for (const sug of rawSuggestions) {
      const sugScore = calculateNameOriginalityScore(sug);
      if (sugScore >= 50) {
        verifiedSuggestions.push({ name: sug, score: sugScore });
      }
    }

    // If less than 5 suggestions have >= 50% originality, generate fallback & verify
    if (verifiedSuggestions.length < 5) {
      const fallbackSuggestions = description 
        ? generateDescriptionBasedAlternatives(name, description)
        : generateAlternativeNames(name);

      for (const fsug of fallbackSuggestions) {
        if (verifiedSuggestions.length >= 5) break;
        if (verifiedSuggestions.some(v => v.name.toLowerCase() === fsug.toLowerCase())) continue;

        const sugScore = calculateNameOriginalityScore(fsug);
        if (sugScore >= 50) {
          verifiedSuggestions.push({ name: fsug, score: sugScore });
        } else {
          const uniqueSug = fsug + " " + Math.floor(10 + Math.random() * 90);
          const uniqueScore = calculateNameOriginalityScore(uniqueSug);
          verifiedSuggestions.push({ name: uniqueSug, score: uniqueScore });
        }
      }
    }

    // Sort by score desc and slice to exactly 5
    verifiedSuggestions.sort((a, b) => b.score - a.score);
    verifiedSuggestions = verifiedSuggestions.slice(0, 5);

    res.json({
      appropriate: true,
      descriptionValid: true,
      originalityScore,
      topMatches,
      explanation: explanation.trim(),
      totalChecked: candidates.length,
      suggestions: verifiedSuggestions,
      logoAnalysis
    });

  } catch (error) {
    console.error('Check originality route error:', error);
    res.status(500).json({ message: 'Erreur lors du calcul d\'originalité.' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Get ALL dossiers (admin only)
app.get('/api/admin/dossiers', authenticateToken, requireAdmin, (req, res) => {
  try {
    const rows = db
      .prepare(
        `
      SELECT d.*, u.name as user_name, u.email as user_email
      FROM dossiers d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `,
      )
      .all()
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update dossier status (admin only)
app.put('/api/admin/dossiers/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body
  const validStatuses = [
    "En attente d'examen",
    "En cours d'examen",
    'Publié',
    'Enregistré',
    'Rejeté',
  ]
  if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' })

  try {
    const dossier = db.prepare('SELECT * FROM dossiers WHERE id = ?').get(req.params.id)
    if (!dossier) return res.status(404).json({ message: 'Dossier not found' })

    db.prepare('UPDATE dossiers SET status = ? WHERE id = ?').run(status, req.params.id)

    // Notify the user
    db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(
      dossier.user_id,
      `Le statut de votre dossier "${dossier.name}" (${dossier.id}) a été mis à jour : ${status}.`,
    )

    res.json({ message: 'Status updated', id: req.params.id, status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users').all()
  res.json(users)
})

// ════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════════════════════════════

app.get('/api/notifications', authenticateToken, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id)
  res.json(rows)
})

app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id)
  res.json({ message: 'All marked as read' })
})

// ════════════════════════════════════════════════════════════════════════════
// MESSAGING & SUPPORT (THREADS AND MESSAGES)
// ════════════════════════════════════════════════════════════════════════════

// Get all threads
app.get('/api/messages', authenticateToken, (req, res) => {
  try {
    let threads = []
    if (req.user.role === 'admin') {
      threads = db.prepare(`
        SELECT mt.*, u.name as client_name, u.email as client_email,
               (SELECT content FROM messages WHERE thread_id = mt.id ORDER BY created_at DESC LIMIT 1) as last_message,
               (SELECT created_at FROM messages WHERE thread_id = mt.id ORDER BY created_at DESC LIMIT 1) as last_message_date,
               (SELECT COUNT(*) FROM messages WHERE thread_id = mt.id AND is_read = 0 AND (sender_id IS NULL OR sender_id != ?)) as unread_count
        FROM message_threads mt
        JOIN users u ON mt.user_id = u.id
        ORDER BY last_message_date DESC
      `).all(req.user.id)
    } else {
      threads = db.prepare(`
        SELECT mt.*,
               (SELECT content FROM messages WHERE thread_id = mt.id ORDER BY created_at DESC LIMIT 1) as last_message,
               (SELECT created_at FROM messages WHERE thread_id = mt.id ORDER BY created_at DESC LIMIT 1) as last_message_date,
               (SELECT COUNT(*) FROM messages WHERE thread_id = mt.id AND is_read = 0 AND (sender_id IS NULL OR sender_id != ?)) as unread_count
        FROM message_threads mt
        WHERE mt.user_id = ?
        ORDER BY last_message_date DESC
      `).all(req.user.id, req.user.id)

      if (threads.length === 0) {
        const insertThread = db.prepare('INSERT INTO message_threads (user_id, subject, category) VALUES (?, ?, ?)')
        const insertMessage = db.prepare('INSERT INTO messages (thread_id, sender_id, sender_name, content, is_read) VALUES (?, ?, ?, ?, ?)')
        
        db.transaction(() => {
          // Thread 1
          let r = insertThread.run(req.user.id, 'Examen de conformité - Dossier MQR-2026-908', 'omapi')
          let tId = r.lastInsertRowid
          insertMessage.run(
            tId, 
            null, 
            'OMAPI - Division des Marques', 
            'Bonjour,\n\nNous vous informons que les pièces complémentaires envoyées le 28 Mai concernant le dépôt de marque "MQR-2026-908" ont été validées par notre examinateur. Votre dossier est désormais en phase de publication au GOPI.\n\nCordialement,\nL\'équipe OMAPI',
            0
          )

          // Thread 2
          r = insertThread.run(req.user.id, 'Honoraires et représentation pour dépôt de brevet', 'mandataire')
          tId = r.lastInsertRowid
          insertMessage.run(
            tId, 
            null, 
            'Me. Rasoamanana (Mandataire agréé)', 
            'Cher client,\n\nJ\'ai finalisé l\'analyse d\'antériorité de votre invention de système d\'irrigation. Nous pouvons procéder à la rédaction finale du mémoire technique de brevet dès réception de votre accord sur le devis ci-joint.\n\nRestant à votre entière disposition.\n\nMe. Rasoamanana',
            1
          )

          // Thread 3
          r = insertThread.run(req.user.id, 'Alerte de renouvellement : Brevet BR-2016-042', 'system')
          tId = r.lastInsertRowid
          insertMessage.run(
            tId, 
            null, 
            'Système OMAPI', 
            'Alerte Automatique :\n\nL\'annuité pour le brevet référencé BR-2016-042 arrive à échéance le 30 Juin 2026. Afin de maintenir vos droits en vigueur, nous vous invitons à effectuer le règlement des taxes correspondantes sur votre espace de paiement.\n\nLe Secrétariat OMAPI',
            0
          )
        })()

        threads = db.prepare(`
          SELECT mt.*,
                 (SELECT content FROM messages WHERE thread_id = mt.id ORDER BY created_at DESC LIMIT 1) as last_message,
                 (SELECT created_at FROM messages WHERE thread_id = mt.id ORDER BY created_at DESC LIMIT 1) as last_message_date,
                 (SELECT COUNT(*) FROM messages WHERE thread_id = mt.id AND is_read = 0 AND (sender_id IS NULL OR sender_id != ?)) as unread_count
          FROM message_threads mt
          WHERE mt.user_id = ?
          ORDER BY last_message_date DESC
        `).all(req.user.id, req.user.id)
      }
    }
    res.json(threads)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single thread messages
app.get('/api/messages/threads/:threadId/messages', authenticateToken, (req, res) => {
  try {
    const thread = db.prepare('SELECT * FROM message_threads WHERE id = ?').get(req.params.threadId)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })

    if (req.user.role !== 'admin' && thread.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    // Mark as read
    db.prepare('UPDATE messages SET is_read = 1 WHERE thread_id = ? AND (sender_id IS NULL OR sender_id != ?)')
      .run(req.params.threadId, req.user.id)

    const messages = db.prepare('SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC').all(req.params.threadId)
    res.json(messages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new thread
app.post('/api/messages/threads', authenticateToken, (req, res) => {
  try {
    const { subject, category, content } = req.body
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' })
    }

    // Resolve sender name (fallback to DB if name not in JWT)
    const senderUser = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id)
    const clientSenderName = req.user.name || (senderUser ? senderUser.name : 'Client')

    let threadId
    db.transaction(() => {
      const r = db.prepare('INSERT INTO message_threads (user_id, subject, category) VALUES (?, ?, ?)')
        .run(req.user.id, subject, category || 'omapi')
      threadId = r.lastInsertRowid
      db.prepare('INSERT INTO messages (thread_id, sender_id, sender_name, content, is_read) VALUES (?, ?, ?, ?, 0)')
        .run(threadId, req.user.id, clientSenderName, content)
    })()

    res.status(201).json({ threadId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Send reply in thread
app.post('/api/messages/threads/:threadId/messages', authenticateToken, (req, res) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ message: 'Content is required' })

    const thread = db.prepare('SELECT * FROM message_threads WHERE id = ?').get(req.params.threadId)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })

    if (req.user.role !== 'admin' && thread.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    // Resolve sender name (fallback to DB if name not in JWT)
    const senderUserRow = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id)
    let senderName = req.user.name || (senderUserRow ? senderUserRow.name : 'Utilisateur')
    if (req.user.role === 'admin') {
      senderName = thread.category === 'omapi' ? 'OMAPI - Division des Marques' : thread.category === 'mandataire' ? 'Me. Rasoamanana (Mandataire agréé)' : 'Système OMAPI'
    }

    db.prepare('INSERT INTO messages (thread_id, sender_id, sender_name, content, is_read) VALUES (?, ?, ?, ?, 0)')
      .run(req.params.threadId, req.user.id, senderName, content)

    res.status(201).json({ message: 'Message sent' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD
// ════════════════════════════════════════════════════════════════════════════

app.post('/api/upload/logo', authenticateToken, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  const url = `http://localhost:${port}/uploads/${req.file.filename}`
  res.json({ url })
})

// ════════════════════════════════════════════════════════════════════════════
// USER PROFILE
// ════════════════════════════════════════════════════════════════════════════

// Get my profile
app.get('/api/users/me', authenticateToken, (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?')
    .get(req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

// Update my profile
app.put('/api/users/me', authenticateToken, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Check if email is taken by another user
    if (email && email !== user.email) {
      const emailTaken = db
        .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
        .get(email, req.user.id)
      if (emailTaken) return res.status(400).json({ message: 'Email already in use' })
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' })
      const valid = await bcrypt.compare(currentPassword, user.password_hash)
      if (!valid) return res.status(401).json({ message: 'Current password is incorrect' })
      const newHash = await bcrypt.hash(newPassword, 10)
      db.prepare('UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?').run(
        name || user.name,
        email || user.email,
        newHash,
        req.user.id,
      )
    } else {
      db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(
        name || user.name,
        email || user.email,
        req.user.id,
      )
    }

    const updated = db
      .prepare('SELECT id, name, email, role FROM users WHERE id = ?')
      .get(req.user.id)
    res.json({ message: 'Profile updated', user: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 OMAPI Backend running on http://localhost:${port}`)
  console.log(`🗄️  Database: SQLite (omapi.db)`)
  console.log(`👤 Admin account: admin@omapi.mg / admin123`)
})
