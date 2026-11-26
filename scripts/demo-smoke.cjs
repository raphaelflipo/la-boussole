'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const site = path.resolve(__dirname, '..');
const base = 'http://boussole.test/la-boussole/';
const labels = {
  fr: {
    household: 'Réserver les places du foyer',
    cancel: 'Annuler les places du foyer',
    queue: 'Rejoindre la liste d’attente',
    release: 'Simuler un désistement',
    book: 'Réserver une place',
    localTrip: 'Retour',
    departure: 'Parking du stade',
    message: 'retard de 10 minutes',
    subgroup: 'Équipe fictive',
    organiserLink: 'Essayer le rôle organisateur'
  },
  en: {
    household: 'Book household seats',
    cancel: 'Cancel household seats',
    queue: 'Join the waitlist',
    release: 'Simulate a cancellation',
    book: 'Book a seat',
    localTrip: 'Return',
    departure: 'Stadium car park',
    message: '10 minutes late',
    subgroup: 'Fictional team',
    organiserLink: 'Try the organiser role'
  }
};

async function exercise(page, copy) {
  const role = page.locator('#persona');
  const org = page.locator('#organization');
  const bookingCount = page.locator('#booking-count');
  const roleValues = await role.locator('option').evaluateAll(options => options.map(option => option.value));
  assert.deepEqual(roleValues, ['member', 'parent', 'driver', 'passenger', 'leader', 'owner', 'admin']);

  await role.selectOption('parent');
  assert(await page.locator('#family-controls').isVisible());
  const ride = page.locator('[data-ride-id="a1"]');
  const initialPlaces = Number(await page.locator('#available-count').textContent());
  await ride.getByRole('button', { name: copy.household }).press('Enter');
  assert.equal(await bookingCount.textContent(), '1');
  assert.equal(Number(await page.locator('#available-count').textContent()), initialPlaces - 2);
  assert.equal(await page.evaluate(() => document.activeElement.textContent), copy.cancel);
  await role.selectOption('driver');
  assert.equal(await bookingCount.textContent(), '0');
  await role.selectOption('parent');
  assert.equal(await bookingCount.textContent(), '1');
  await ride.getByRole('button', { name: copy.cancel }).click();
  assert.equal(Number(await page.locator('#available-count').textContent()), initialPlaces);

  await org.selectOption('beta');
  const fullRide = page.locator('[data-ride-id="b2"]');
  await fullRide.getByRole('button', { name: copy.queue }).click();
  await fullRide.getByRole('button', { name: copy.release }).click();
  assert.equal(await bookingCount.textContent(), '0');
  await fullRide.getByRole('button', { name: copy.release }).click();
  assert.equal(await bookingCount.textContent(), '1');

  await role.selectOption('leader');
  const priorActivity = await page.locator('#event-select').inputValue();
  await page.locator('#add-event').click();
  assert.notEqual(await page.locator('#event-select').inputValue(), priorActivity);
  await page.locator('#departure-point').selectOption('stadium');
  await page.locator('#set-departure').click();
  assert((await page.locator('#event-departure').textContent()).includes(copy.departure));
  await page.locator('#add-group').click();
  assert((await page.locator('#demo-subgroups').textContent()).includes(copy.subgroup));
  assert(await page.locator('#invite').isDisabled());

  await role.selectOption('driver');
  await page.locator('#direction').selectOption('return');
  await page.locator('#add-ride').click();
  const localTrip = page.locator('[data-ride-id^="local-"]');
  assert((await localTrip.textContent()).includes(copy.localTrip));
  assert.equal(await localTrip.getByRole('button', { name: copy.book }).count(), 0);
  await role.selectOption('passenger');
  await localTrip.getByRole('button', { name: copy.book }).click();
  assert.equal(await bookingCount.textContent(), '1');
  await page.locator('#message-preset').selectOption('delay');
  await page.locator('#send-preset').click();
  assert((await page.locator('#demo-messages').textContent()).includes(copy.message));
  await role.selectOption('driver');
  assert((await page.locator('#demo-messages').textContent()).includes(copy.message));
  await org.selectOption('gamma');
  assert(!(await page.locator('#demo-messages').textContent()).includes(copy.message));

  await role.selectOption('admin');
  const memberCount = Number(await page.locator('#members-count').textContent());
  await page.locator('#invite').click();
  await page.locator('#approve').click();
  assert.equal(Number(await page.locator('#members-count').textContent()), memberCount + 1);
  await page.locator('#reset').click();
  assert.equal(Number(await page.locator('#members-count').textContent()), memberCount);
}

async function run() {
  const install = process.env.BOUSSOLE_CHROMIUM;
  const browser = await chromium.launch(install ? {
    executablePath: install,
    args: ['--no-zygote', '--single-process', '--disable-gpu']
  } : {});
  try {
    const page = await browser.newPage();
    const requests = [];
    const errors = [];
    page.on('request', request => requests.push(request.url()));
    page.on('pageerror', error => errors.push(error.message));
    await page.route(base + '**', route => {
      const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
      const file = path.resolve(site, pathname.slice('/la-boussole/'.length));
      if (!file.startsWith(site + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({ path: file });
    });

    for (const lang of ['fr', 'en']) {
      const prefix = lang === 'en' ? 'en/' : '';
      const copy = labels[lang];
      for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        for (const route of ['demo.html', 'pilote.html']) {
          assert.equal((await page.goto(base + prefix + route)).status(), 200);
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          assert(scrollWidth <= width, lang + ' · ' + route + ' · ' + width + ' px');
        }
      }
      assert.equal(await page.locator('form').count(), 0);
      await page.getByRole('link', { name: copy.organiserLink }).click();
      await page.waitForURL(url => url.pathname.endsWith('demo.html') && url.searchParams.get('role') === 'owner');
      await page.waitForFunction(() => document.getElementById('persona')?.value === 'owner');
      assert.equal(await page.locator('#persona').inputValue(), 'owner');
      await page.goto(base + prefix + 'demo.html');
      const storage = await page.evaluate(() => [Object.entries(localStorage), Object.entries(sessionStorage)]);
      const before = requests.length;
      await exercise(page, copy);
      assert.deepEqual(requests.slice(before), [], lang + ' · no requests during the fictional scenario');
      assert.deepEqual(await page.evaluate(() => [Object.entries(localStorage), Object.entries(sessionStorage)]), storage);
      assert.deepEqual(errors, []);
    }
    console.log('32 affichages FR/EN, 7 rôles, foyer, liste d’attente, départ, groupes, messages et réinitialisation validés. Aucun réseau ni stockage ajouté pendant la simulation.');
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
