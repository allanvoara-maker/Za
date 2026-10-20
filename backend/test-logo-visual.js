/**
 * Logo VISUAL Analysis Test — sends an actual base64 image to verify Gemini analyzes it
 */
require('dotenv').config();
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'omapi_super_secret_key_2024';
const PORT = process.env.PORT || 3000;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// Minimal valid PNG: a small 10x10 white square with a black diagonal (unique enough)
// Generated from a real 10x10 PNG with a simple shape
const MINIMAL_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz0AEYBxVSF+FAP//ARMAAA==';

async function testLogoVisual() {
  console.log('\n🖼️  Logo Visual Analysis Test\n' + '='.repeat(45));
  console.log('GEMINI_API_KEY loaded:', GEMINI_KEY ? `Yes (${GEMINI_KEY.length} chars)` : '❌ MISSING — local fallback will be used');

  const db = new Database(path.join(__dirname, 'omapi.db'));
  const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@omapi.mg');
  const token = jwt.sign({ id: admin.id, name: admin.name, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });
  db.close();

  // Test 1: Logo that mimics Apple (apple shape test)
  console.log('\n📸 Test A: Brand "Aple" with a generic image (tests logo route)');
  try {
    const res = await fetch(`http://localhost:${PORT}/api/trademarks/check-originality`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        brandName: 'Aple',
        brandDescription: 'Smartphones haut de gamme et ordinateurs portables innovants',
        brandLogo: `data:image/png;base64,${MINIMAL_PNG_B64}`
      })
    });
    const data = await res.json();
    console.log('\n  ✅ Response received!');
    console.log('  Score:', data.originalityScore + '%');
    console.log('  Appropriate:', data.appropriate);
    console.log('  Top matches:', data.topMatches?.slice(0, 2).map(m => `${m.name}(${m.similarity}%)`).join(', '));
    if (data.logoAnalysis) {
      console.log('\n  🖼️  LOGO ANALYSIS:');
      console.log('  hasVisualConflict:', data.logoAnalysis.hasVisualConflict);
      console.log('  conflictDetails:', data.logoAnalysis.conflictDetails?.substring(0, 150) + '...');
      console.log('  visualScorePenalty:', data.logoAnalysis.visualScorePenalty + '%');
      console.log('  logoDescription:', data.logoAnalysis.logoDescription);
    } else {
      console.log('  ⚠️  logoAnalysis is null — check if brandLogo was passed correctly');
    }
    console.log('\n  Suggestions:', data.suggestions?.map(s => `${s.name}(${s.score}%)`).join(', '));
    const allGood = data.suggestions?.every(s => s.score >= 50);
    console.log('  All suggestions >= 50%:', allGood ? '✅ YES' : '❌ NO');
  } catch(e) {
    console.log('  ❌ Request failed:', e.message);
    console.error(e);
  }

  // Test 2: Completely unique brand with unique logo
  console.log('\n📸 Test B: Brand "VatosoaTech" — expected high originality');
  try {
    const res2 = await fetch(`http://localhost:${PORT}/api/trademarks/check-originality`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        brandName: 'VatosoaTech',
        brandDescription: 'Plateforme numérique malgache spécialisée dans le développement de logiciels agricoles pour les paysans de Madagascar.',
        brandLogo: `data:image/png;base64,${MINIMAL_PNG_B64}`
      })
    });
    const data2 = await res2.json();
    console.log('\n  Score:', data2.originalityScore + '%');
    if (data2.logoAnalysis) {
      console.log('  logoAnalysis present:', '✅ YES');
      console.log('  logoDescription:', data2.logoAnalysis.logoDescription || '(empty — Gemini key may be missing)');
      console.log('  visualScorePenalty:', data2.logoAnalysis.visualScorePenalty + '%');
    }
  } catch(e) {
    console.log('  ❌ Request failed:', e.message);
  }

  console.log('\n' + '='.repeat(45));
  console.log('✅ Visual logo analysis test complete!');
  console.log('='.repeat(45) + '\n');
}

testLogoVisual().catch(console.error);
