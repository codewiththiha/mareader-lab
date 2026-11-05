import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const theme = process.env.SHOT_THEME || 'sepia';
const section = process.env.SHOT_SECTION || 'dock';
const out = '/tmp/lab-shots';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  for (let attempt = 0; ; attempt++) {
    try { await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' }); break; }
    catch (error) { if (attempt === 20) throw error; await new Promise(r => setTimeout(r, 500)); }
  }
  await page.getByRole('button', { name: theme, exact: true }).first().click();
  const target = page.locator(`#${section}`);
  if (section === 'dock') {
    await target.getByRole('button', { name: 'Proposed (edge tabs)' }).click();
    const stage = target.locator('[data-mode="proposed"]');
    await stage.scrollIntoViewIfNeeded();
    await stage.screenshot({ path: `${out}/dock-proposed.png` });
    const box = await stage.boundingBox();
    if (!box) throw new Error('Dock stage is not visible');
    await page.mouse.move(box.x + 120, box.y + 78);
    await page.mouse.down();
    await page.mouse.move(box.x - 90, box.y + 78, { steps: 30 });
    await page.mouse.up();
    await page.waitForTimeout(450);
    await stage.screenshot({ path: `${out}/dock-tucked.png` });
    await target.getByRole('button', { name: 'Put dictionary over player' }).click();
    await page.waitForTimeout(450);
    await stage.screenshot({ path: `${out}/dock-covered-player.png` });
  } else {
    await target.screenshot({ path: `${out}/${section}.png` });
  }
} finally {
  await browser.close();
}
