import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\c1dc0289-69ff-4f32-84d8-89b4608c4c3a';

const PAGES = [
  { file: 'p19_dashboard_new.png',    url: 'http://localhost:5173/portal/dashboard',    label: 'Dashboard' },
  { file: 'p20_dossiers_new.png',     url: 'http://localhost:5173/portal/dossiers',     label: 'Mes Dossiers' },
  { file: 'p21_depot_new.png',        url: 'http://localhost:5173/portal/depot',        label: 'Dépôt Marque' },
  { file: 'p22_statistiques_new.png', url: 'http://localhost:5173/portal/statistiques', label: 'Statistiques' },
  { file: 'p23_factures_new.png',     url: 'http://localhost:5173/portal/factures',     label: 'Factures' },
  { file: 'p24_messages_new.png',     url: 'http://localhost:5173/portal/messages',     label: 'Messages' },
  { file: 'p25_parametres_new.png',   url: 'http://localhost:5173/portal/parametres',   label: 'Paramètres' },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  // LOGIN
  console.log('Logging in...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Fill form
  await page.type('input[type="email"]', 'admin@omapi.mg');
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3000));
  console.log('After login:', page.url());

  // SCREENSHOTS
  for (const pg of PAGES) {
    console.log('Capturing:', pg.label, '->', pg.url);
    await page.goto(pg.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));
    await page.evaluate(() => window.scrollTo(0, 0));
    const outPath = path.join(OUT, pg.file);
    await page.screenshot({ path: outPath });
    console.log('  Saved:', outPath);
  }

  await browser.close();
  console.log('\nDone! All 7 screenshots captured.');
})().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
