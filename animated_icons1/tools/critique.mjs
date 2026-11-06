#!/usr/bin/env node
/**
 * Icon motion critique tool.
 *
 *   node tools/critique.mjs                 # every icon, 10 per sheet
 *   node tools/critique.mjs panel-left pin  # specific icons
 *   node tools/critique.mjs --frames 16 --size 64 --mode dark --no-build
 *
 * Builds the site (single-file dist), opens it headless, and screenshots the
 * `?critique=` contact sheet: each icon as a row of stills evenly spaced over
 * its timeline. Outputs critique/sheet-N.png (or critique/<ids>.png).
 */
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); if (i === -1) return def; const v = args[i + 1]; args.splice(i, 2); return v ?? true; };
const noBuild = args.includes("--no-build"); if (noBuild) args.splice(args.indexOf("--no-build"), 1);
const frames = opt("frames", "12"), size = opt("size", "56"), mode = opt("mode", "light"), per = Number(opt("per", "10"));
const ids = args;

if (!noBuild || !existsSync("dist/index.html")) execSync("npm run build", { stdio: "inherit" });
mkdirSync("critique", { recursive: true });
const html = path.resolve("dist/index.html");
// Count icons from the bundle so we can page through `all`.
const total = ids.length ? ids.length : (readFileSync(html, "utf8").match(/data-icon|uses:\[/g) || []).length;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
const shoot = async (query, out) => {
  await page.goto(`file://${html}?critique=${query}&frames=${frames}&size=${size}&mode=${mode}`);
  await page.waitForSelector("body[data-ready=true]", { timeout: 10000 });
  const el = await page.$("#critique");
  await el.screenshot({ path: out });
  console.log("wrote", out);
};

if (ids.length) {
  await shoot(ids.join(","), `critique/${ids.join("+").slice(0, 60)}.png`);
} else {
  const count = await (async () => { await page.goto(`file://${html}?critique=all&count=1000&frames=1&size=8`); await page.waitForSelector("body[data-ready=true]"); return page.$$eval("[data-filmstrip]", (n) => n.length); })();
  for (let from = 0, n = 0; from < count; from += per, n++) await shoot(`all&from=${from}&count=${per}`, `critique/sheet-${n}.png`);
  console.log(`${count} icons`);
}
await browser.close();
