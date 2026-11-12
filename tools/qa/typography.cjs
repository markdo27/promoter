const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const baseURL = process.env.PROMOTER_BASE_URL || 'http://127.0.0.1:8791/';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname)) throw new Error('Use a local demo server only');
const out = path.join(__dirname, '../../docs/audit-2026-11-11/vietnamese');
fs.mkdirSync(out, { recursive: true });
const allAccents = 'ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ';

async function actualFonts(page, selector) {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
    assert(fonts.length > 0, 'rendered glyphs were measured');
    assert(fonts.every(font => font.isCustomFont && /BT Brik.*Viet/.test(font.familyName)), `Unexpected fallback: ${JSON.stringify(fonts)}`);
    return fonts;
  } finally { await session.detach(); }
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  try {
    for (const width of [320, 390, 768, 1280, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 960 }, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.clock.install({ time: new Date('2026-11-11T09:42:00Z') });
        await page.goto(new URL('?demo=1', baseURL).href, { waitUntil: 'networkidle' });
        await page.locator('.pc[data-id]').first().waitFor();
        await page.locator('[data-night="2026-11-15"]').click();
        await page.evaluate(() => document.fonts.ready);
        const eventFonts = await actualFonts(page, '#flyDj');
        await page.screenshot({ path: path.join(out, `lineup-vi-${width}.png`), fullPage: true });
        // Load decomposed customer input through the real demo backend, then verify NFC.
        await page.evaluate(() => {
          const data = JSON.parse(localStorage.getItem('blk46demo:v1'));
          data.tonight = { '2026-11-12': { dj: 'ĐÊM HỘI ÂM NHẠC'.normalize('NFD') } };
          localStorage.setItem('blk46demo:v1', JSON.stringify(data));
        });
        await page.reload({ waitUntil: 'networkidle' });
        await page.locator('.pc[data-id]').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('#flyDj').textContent(), 'ĐÊM HỘI ÂM NHẠC');
        const fonts = await actualFonts(page, '#flyDj');
        const layout = await page.locator('#flyDj').evaluate(el => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
          // Leading is measured per title (titleLead), so the line box must hold this title's own ink.
          const ink = ctx.measureText(el.textContent);
          return { scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth, left: rect.left, right: rect.right, lineHeight: parseFloat(style.lineHeight), inkHeight: ink.actualBoundingBoxAscent + ink.actualBoundingBoxDescent };
        });
        assert(layout.scrollWidth <= width && layout.left >= 0 && layout.right <= width, JSON.stringify(layout));
        assert(layout.inkHeight <= layout.lineHeight, `title ink fits its line box ${JSON.stringify(layout)}`);
        assert.deepEqual(errors, []);
        await page.screenshot({ path: path.join(out, `dj-vi-${width}.png`), fullPage: true });
        results.push({ width, eventFonts, fonts, layout, errors });
        if (width === 390) {
          // Worst case: stacked marks above and dots below on wrapped lines must still clear each other.
          await page.evaluate(() => {
            const data = JSON.parse(localStorage.getItem('blk46demo:v1'));
            data.tonight = { '2026-11-12': { dj: 'ẦẪẶ ỆỖỰ ỠỸẤ' } };
            localStorage.setItem('blk46demo:v1', JSON.stringify(data));
          });
          await page.reload({ waitUntil: 'networkidle' });
          await page.locator('.pc[data-id]').first().waitFor();
          await page.evaluate(() => document.fonts.ready);
          const stacked = await page.locator('#flyDj').evaluate(el => {
            const style = getComputedStyle(el);
            const ctx = document.createElement('canvas').getContext('2d');
            ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            const ink = ctx.measureText(el.textContent);
            return { text: el.textContent, lines: Math.round(el.getBoundingClientRect().height / parseFloat(style.lineHeight)), lineHeight: parseFloat(style.lineHeight), inkHeight: ink.actualBoundingBoxAscent + ink.actualBoundingBoxDescent };
          });
          assert(stacked.lines > 1, `stacked title wraps ${JSON.stringify(stacked)}`);
          assert(stacked.inkHeight <= stacked.lineHeight, `stacked Vietnamese ink fits the line box ${JSON.stringify(stacked)}`);
          await page.screenshot({ path: path.join(out, 'dj-stacked-390.png'), fullPage: true });
          results.push({ width, stacked });
        }
        if (width === 1280) {
          await page.evaluate(chars => {
            const proof = document.createElement('section');
            proof.id = 'font-proof';
            proof.style.cssText = 'background:#f0ece1;color:#000;padding:36px;font-family:"BT Brik VN";font-style:oblique;font-weight:700;line-height:1.4;font-size:48px;word-break:break-all';
            for (const text of ['ĐÊM HỘI ÂM NHẠC', 'ẤM ÁP · BÙNG NỔ · RỰC RỠ', chars, chars.toLowerCase()]) {
              const line = document.createElement('p');
              line.textContent = text;
              proof.appendChild(line);
            }
            document.body.appendChild(proof);
          }, allAccents);
          await page.evaluate(() => document.fonts.ready);
          results.push({ proofFonts: await actualFonts(page, '#font-proof') });
          await page.locator('#font-proof').screenshot({ path: path.join(out, 'font-proof.png') });
        }
      } finally { await context.close(); }
    }
    fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(results, null, 2) + '\n');
    console.log(JSON.stringify({ passed: 5, viewports: [320, 390, 768, 1280, 1440], glyphFallback: false, nfc: true }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
