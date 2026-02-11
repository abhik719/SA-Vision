import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') console.error('[PAGE ERROR]', text);
    else if (type === 'warn') console.warn('[PAGE WARN]', text);
  });
  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'load', timeout: 15000 });
    // Wait for React to render - root should have children
    await page.waitForSelector('#root > div', { timeout: 10000 });
    await page.waitForTimeout(500);
    const html = await page.content();
    const hasSalesNav = html.includes('Sales Navigator');
    console.log('Has Sales Navigator:', hasSalesNav);
    console.log('HTML length:', html.length);
    console.log('Body text sample:', (await page.locator('body').textContent())?.slice(0, 500));
    await page.screenshot({ path: 'e2e-screenshots/debug.png' });
    console.log('Screenshot saved to e2e-screenshots/debug.png');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
}

main();
