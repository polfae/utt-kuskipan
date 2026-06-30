// Production hardening smoke tests for no-stale-data behavior.
// Run with: node tests/no-stale-data.test.js

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');

assert.equal(
  /<script[^>]+src=[\"']data\.js(?:[?\"'])/i.test(indexHtml),
  false,
  'index.html must not load data.js as a hardcoded public-data fallback',
);

assert.equal(
  script.includes('QUALIFICATION_DATA'),
  false,
  'script.js must not read bundled QUALIFICATION_DATA as public fallback data',
);

assert.equal(
  script.includes('DEFAULT_QUALIFICATION_DATA'),
  false,
  'script.js must not build default qualification data from bundled requirements',
);

assert.ok(
  script.includes('Úttøkukrøvini eru ikki tøk í løtuni'),
  'script.js should show a clear unavailable-data message when Firestore fails',
);

assert.ok(
  script.includes('Eingi úttøkukrøv eru skrásett enn'),
  'script.js should show a clear empty-state message when no Firestore document/data exists',
);

console.log('No-stale-data smoke tests passed.');
