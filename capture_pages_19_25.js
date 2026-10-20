const { chromium } = require('playwright');
const path = require('path');

const OUT = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\c1dc0289-69ff-4f32-84d8-89b4608c4c3a';

const pages = [
  { file: 'p19_dashboard_new.png',    url: 'http://localhost:5173/portal/dashboard',    label: 'Dashboard' },
  { file: 'p20_dossiers_new.png',     url: 'http://localhost:5173/portal/dossiers',     label: 'Mes Dossiers' },
  { file: 'p21_depot_new.png',        url: 'http://localhost:5173/portal/depot',        label: 'Dépôt Marque' },
  { file: 'p22_statistiques_new.png', url: 'http://localhost:5173/portal/statistiques', label: 'Statistiques' },
  { file: 'p23_factures_new.png',     url: 'http://localhost:5173/portal/factures',     label: 'Factures' },
  { file: 'p24_messages_new.png',     url: 'http://localhost:5173/portal/messages',     label: 'Messages' },
  { file: 'p25_parametres_new.png',   url: 'http://localhost:5173/portal/parametres',  label: 'Paramètres' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Step 1: Login
  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Fill login form
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Email"]').first();
  const passInput  = page.locator('input[type="password"]').first();

  await emailInput.fill('admin@omapi.mg');
  await passInput.fill('admin123');
  await page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Login"), button:has-text("Se connecter")').first().click();

  await page.waitForTimeout(3000);
  console.log('After login, current URL:', page.url());

  // Step 2: Take screenshots
  for (const pg of pages) {
    console.log(`\nCapturing: ${pg.label} → ${pg.url}`);
    await page.goto(pg.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, 0));
    const outPath = path.join(OUT, pg.file);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`  ✓ Saved: ${outPath}`);
  }

  await browser.close();
  console.log('\nAll screenshots done!');
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
