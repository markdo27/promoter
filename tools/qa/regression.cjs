const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = process.env.PROMOTER_QA_OUTPUT || path.join(__dirname, '../../.qa/booking-results.json');
const baseURL = process.env.PROMOTER_BASE_URL || 'http://127.0.0.1:8791/';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname)) throw new Error('Use a local demo server only');
fs.mkdirSync(path.dirname(out), { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  async function scenario(name, run, options = {}) {
    const context = await browser.newContext({ viewport: { width: options.width || 390, height: 900 }, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    try {
      await page.clock.install({ time: new Date(options.time || '2026-11-11T09:22:00Z') });
      if (options.blockFont) await page.route('**/fonts/BT-Brik-3XL-Oblique-VI.woff2', route => route.abort());
      await page.goto(new URL('?demo=1', baseURL).href, { waitUntil: 'networkidle' });
      await page.locator('.pc[data-id]').first().waitFor();
      await run(page);
      assert.deepEqual(errors, [], 'no uncaught JS errors');
      results.push({ name, passed: true });
    } catch (error) {
      results.push({ name, passed: false, error: error.message });
      console.error(name, error.message);
    } finally { await context.close(); }
  }
  const goHome = async page => { await page.evaluate(() => { location.hash = 'lineup'; }); await page.locator('.pc[data-id]').first().waitFor(); };
  const openProfile = async (page, id) => { await page.locator(`.pc[data-id="${id}"]`).click(); await page.locator('#sdlg[open]').waitFor(); };
  const openBooking = async (page, id) => { await openProfile(page, id); await page.locator('#sdlg .sheet-cta').click(); await page.locator('#bookForm').waitFor(); };
  const chooseNight = async (page, date) => {
    const item = page.locator(`[data-night="${date}"]`);
    if (!await item.count()) await page.locator('[data-week="2026-11-16"]').click();
    await page.locator(`[data-night="${date}"]`).click();
  };
  const input = async (page, selector, value) => { await page.locator(selector).fill(value); await page.locator(selector).blur(); };

  await scenario('Header booking follows next open night on Wednesday', async page => {
    await page.locator('.hbook').click();
    await page.locator('#bookForm').waitFor();
    assert.equal(await page.locator('#b_date').inputValue(), '12/11');
  });
  await scenario('Selected night reaches header and promoter booking', async page => {
    await chooseNight(page, '2026-11-20');
    assert.match(await page.locator('.ros-head h2').innerText(), /20\.11/);
    await openBooking(page, 'demo1');
    assert.equal(await page.locator('#b_date').inputValue(), '20/11');
    await goHome(page);
    await page.locator('.hbook').click();
    await page.locator('#bookForm').waitFor();
    assert.equal(await page.locator('#b_date').inputValue(), '20/11');
  });
  await scenario('Changing promoter preserves guest information and typed date', async page => {
    await openBooking(page, 'demo1');
    await page.locator('.bsal[data-v="Mr"]').click();
    await input(page, '#b_name', 'UX Test');
    await input(page, '#b_phone', '0900000000');
    await input(page, '#b_date', '21/11');
    await input(page, '#b_time', '22:30');
    await input(page, '#b_guests', '4');
    await input(page, '#b_note', 'Demo only');
    await goHome(page);
    await openBooking(page, 'demo2');
    for (const [selector, value] of [['#b_name', 'UX Test'], ['#b_phone', '0900000000'], ['#b_date', '21/11'], ['#b_time', '22:30'], ['#b_guests', '4'], ['#b_note', 'Demo only']]) assert.equal(await page.locator(selector).inputValue(), value, selector);
    assert.equal(await page.locator('.bsal[data-v="Mr"]').getAttribute('aria-checked'), 'true');
  });
  await scenario('Full-date spelling preserves the same table through promoter swap', async page => {
    await openBooking(page, 'demo1');
    await input(page, '#b_date', '20/11/2026');
    await page.locator('.tpick-f summary').click();
    await page.locator('.tspot[data-t="V1"]').click();
    await goHome(page);
    await openBooking(page, 'demo2');
    assert.match(await page.locator('.tpick-f summary').innerText(), /V1/);
    assert.equal(await page.locator('.tspot[data-t="V1"]').getAttribute('aria-pressed'), 'true');
  });
  await scenario('Radio group supports focus, Arrow and Home/End', async page => {
    await openBooking(page, 'demo1');
    const mr = page.locator('.bsal[data-v="Mr"]');
    await mr.focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.bsal[data-v="Miss"]').getAttribute('aria-checked'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.v), 'Miss');
    await page.keyboard.press('Home');
    assert.equal(await mr.getAttribute('aria-checked'), 'true');
    await page.keyboard.press('End');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.v), 'Miss');
    assert.equal(await page.locator('.bsal[tabindex="0"]').count(), 1);
  });
  await scenario('Period filter keeps keyboard focus', async page => {
    await page.locator('#pAll').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'pAll');
    await page.locator('#pMonth').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'pMonth');
  });
  await scenario('Optional map summary follows selection and clearing', async page => {
    await page.locator('.hbook').click();
    await page.locator('#bookForm').waitFor();
    assert.equal(await page.locator('.tpick-f').getAttribute('open'), null);
    await page.locator('.tpick-f summary').click();
    await page.locator('.tspot[data-t="V1"]').click();
    assert.match(await page.locator('.tpick-f summary').innerText(), /V1/);
    await page.locator('.tspot[data-t="V1"]').click();
    assert.doesNotMatch(await page.locator('.tpick-f summary').innerText(), /V1/);
  });
  await scenario('Full promoter remains browsable and only full-date submit is blocked', async page => {
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('blk46demo:v1'));
      data.idolLoad = { '2026-11-20': { date: '2026-11-20', counts: { demo1: 2 } } };
      localStorage.setItem('blk46demo:v1', JSON.stringify(data));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await chooseNight(page, '2026-11-20');
    assert.equal(await page.locator('.pc[data-id="demo1"]').isDisabled(), false);
    assert.match(await page.locator('.pc[data-id="demo1"]').getAttribute('class'), /full/);
    await openBooking(page, 'demo1');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'b_date');
    await page.locator('.bsal[data-v="Mr"]').click();
    await input(page, '#b_name', 'UX Test');
    await input(page, '#b_phone', '0900000000');
    await input(page, '#b_time', '22:30');
    await page.locator('#bookForm button[type="submit"]').click();
    assert.match(await page.locator('#bErr').innerText(), /đã đủ/);
    assert.equal(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('blk46demo:v1')).bookings).length), 0);
    await input(page, '#b_date', '21/11');
    await page.locator('#bookForm button[type="submit"]').click();
    await page.locator('.done').waitFor();
    const bookings = await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('blk46demo:v1')).bookings));
    assert.equal(bookings.length, 1);
    assert.equal(bookings[0].date, '2026-11-21');
    assert.deepEqual(bookings[0].idolIds, ['demo1']);
  });
  await scenario('Vietnamese event title uses the VinaDau extended Brik face', async page => {
    await chooseNight(page, '2026-11-15');
    assert.equal(await page.locator('#flyDj').evaluate(el => el.classList.contains('vn')), true);
    await page.evaluate(() => document.fonts.ready);
    assert.match(await page.locator('#flyDj').evaluate(el => getComputedStyle(el).fontFamily), /BT Brik VN/);
    assert.equal(await page.evaluate(() => [...document.fonts].some(font => font.family === 'BT Brik VN' && font.status === 'loaded')), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  });
  await scenario('Blocked display font has a usable fallback without overflow', async page => {
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.locator('.hbook').click();
    await page.locator('#bookForm').waitFor();
  }, { width: 320, blockFont: true });
  await scenario('After-midnight booking uses a valid civil date', async page => {
    await page.locator('.hbook').click();
    await page.locator('#bookForm').waitFor();
    assert.equal(await page.locator('#b_date').inputValue(), '14/11');
  }, { time: '2026-11-13T18:00:00Z' });
  await scenario('After-midnight availability includes the active previous night', async page => {
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('blk46demo:v1'));
      data.idolLoad = { '2026-11-12': { date: '2026-11-12', counts: { demo1: 2 } } };
      localStorage.setItem('blk46demo:v1', JSON.stringify(data));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.pc[data-id="demo1"]').waitFor();
    assert.match(await page.locator('.pc[data-id="demo1"]').getAttribute('class'), /full/);
    await openProfile(page, 'demo1');
    assert.match(await page.locator('#sdlg .sheet-cta').innerText(), /NGÀY KHÁC/);
  }, { time: '2026-11-12T18:00:00Z' });
  await scenario('Very long DJ name remains inside a narrow viewport', async page => {
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('blk46demo:v1'));
      data.tonight = { '2026-11-12': { dj: 'SUPERCALIFRAGILISTIC NIGHT WITH MIX MASTERS 2026' } };
      localStorage.setItem('blk46demo:v1', JSON.stringify(data));
    });
    await page.reload({ waitUntil: 'networkidle' });
    assert.match(await page.locator('#flyDj').innerText(), /SUPERCALIFRAGILISTIC/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }, { width: 320 });
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: results.filter(r => r.passed).length, total: results.length, results }, null, 2));
  if (results.some(r => !r.passed)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
