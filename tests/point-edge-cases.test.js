// Edge-case tests that load the real website script and exercise the same
// point qualification functions used by the public result page.
// Run with: node tests/point-edge-cases.test.js

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

function createElement(id = '') {
  return {
    id,
    value: '',
    checked: false,
    innerHTML: '',
    textContent: '',
    dataset: {},
    attributes: {},
    style: { setProperty() {}, removeProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {},
    removeEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    closest() { return null; },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name] ?? this[name] ?? null; },
    removeAttribute(name) { delete this.attributes[name]; },
    focus() {},
    close() {},
    showModal() {},
    appendChild() {},
    reset() {},
  };
}

function loadWebsiteContext(competitions = []) {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, createElement(id));
      return elements.get(id);
    },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    createElement() { return createElement(); },
    addEventListener() {},
    documentElement: { style: { setProperty() {} } },
    body: createElement('body'),
  };
  const localStorage = {
    store: competitions.length ? { qualificationOriginalTotals: JSON.stringify(competitions) } : {},
    getItem(key) { return this.store[key] ?? null; },
    setItem(key, value) { this.store[key] = String(value); },
    removeItem(key) { delete this.store[key]; },
  };
  const context = {
    console,
    document,
    localStorage,
    window: {
      addEventListener() {},
      clearTimeout,
      setTimeout,
      confirm() { return true; },
      dispatchEvent() {},
    },
    Event: function Event() {},
    Date,
    JSON,
    Math,
    Number,
    String,
    Array,
    Object,
    Boolean,
    Set,
    Map,
    parseInt,
    parseFloat,
    isNaN,
    NaN,
    Intl,
  };
  context.window.window = context.window;
  context.window.document = document;
  context.window.localStorage = localStorage;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8'), context);
  if (competitions.length) {
    vm.runInContext(`qualificationData = normalizeQualificationData(${JSON.stringify(competitions)}); activeCompetitionSlug = qualificationData[0]?.slug || ''; activeTotalsCompetitionSlug = activeCompetitionSlug;`, context);
  }
  return { context, elements };
}

function checkPoint(context, athlete, competition) {
  return vm.runInContext(
    `checkPointQualification(${JSON.stringify(athlete)}, ${JSON.stringify(competition)})`,
    context,
  );
}

function renderCheckerText(context, elements, { birthYear, bodyweight, total, gender = 'men' }) {
  elements.get('athleteGender').value = gender;
  elements.get('athleteBirthYear').value = String(birthYear);
  elements.get('athleteBodyweight').value = String(bodyweight);
  elements.get('athleteTotal').value = String(total);
  vm.runInContext('renderChecker()', context);
  return elements.get('checkerResults').innerHTML.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function pointCompetition(overrides) {
  return {
    name: overrides.name || 'Point test',
    slug: overrides.slug || 'point-test',
    category: 'Test',
    groupKey: 'test',
    groupShortLabel: 'T',
    groupLabel: 'Test',
    groupOrder: 1,
    order: 1,
    qualificationType: 'points',
    pointSystem: overrides.pointSystem,
    pointRequirements: overrides.pointRequirements,
    adjustmentPercent: overrides.adjustmentPercent ?? 0,
    competitionYear: 2026,
  };
}

{
  const { context } = loadWebsiteContext();
  const competition = pointCompetition({ pointSystem: 'sinclair', pointRequirements: { men: 280, women: 200 } });
  const exactTotal = 280 / checkPoint(context, { gender: 'men', bodyweight: 81.4, total: 1, age: 45 }, competition).points;
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: exactTotal - 0.001, age: 45 }, competition).qualified, false);
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: exactTotal, age: 45 }, competition).qualified, true);
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: exactTotal + 0.001, age: 45 }, competition).qualified, true);
}

{
  const { context } = loadWebsiteContext();
  const competition = pointCompetition({ pointSystem: 'qpoints', pointRequirements: { men: 330, women: 190 } });
  const pointsPerKg = checkPoint(context, { gender: 'men', bodyweight: 81.4, total: 1, age: 45 }, competition).points;
  const exactTotal = 330 / pointsPerKg;
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: exactTotal - 0.001, age: 45 }, competition).qualified, false);
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: exactTotal, age: 45 }, competition).qualified, true);
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: exactTotal + 0.001, age: 45 }, competition).qualified, true);
}

{
  const { context } = loadWebsiteContext();
  const competition = pointCompetition({ pointSystem: 'qmasters', pointRequirements: { men: 400, women: 230 } });
  const belowAge = checkPoint(context, { gender: 'men', bodyweight: 81.4, total: 400, age: 34 }, competition);
  assert.equal(belowAge.valid, false);
  assert.equal(belowAge.qualified, false);

  const pointsPerKg = checkPoint(context, { gender: 'men', bodyweight: 81.4, total: 1, age: 45 }, competition).points;
  const exactTotal = 400 / pointsPerKg;
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: exactTotal - 0.001, age: 45 }, competition).qualified, false);
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: exactTotal, age: 45 }, competition).qualified, true);
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: exactTotal + 0.001, age: 45 }, competition).qualified, true);

  const thirteenAbove = checkPoint(context, { gender: 'men', bodyweight: 81.4, total: (413 / pointsPerKg), age: 45 }, competition);
  assert.ok(thirteenAbove.difference > 12.9 && thirteenAbove.difference < 13.1);
  assert.equal(thirteenAbove.qualified, true);
}

{
  const { context } = loadWebsiteContext();
  const negativeAdjustment = pointCompetition({ pointSystem: 'qmasters', pointRequirements: { men: 400 }, adjustmentPercent: -5 });
  const positiveAdjustment = pointCompetition({ pointSystem: 'qmasters', pointRequirements: { men: 400 }, adjustmentPercent: 5 });
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: 246, age: 45 }, negativeAdjustment).requiredPoints, 380);
  assert.equal(checkPoint(context, { gender: 'men', bodyweight: 81.4, total: 246, age: 45 }, positiveAdjustment).requiredPoints, 420);
}

{
  const competition = pointCompetition({ name: 'Q-Masters public', slug: 'qmasters-public', pointSystem: 'qmasters', pointRequirements: { men: 400 } });
  const { context, elements } = loadWebsiteContext([competition]);
  const underAgeText = renderCheckerText(context, elements, { birthYear: 1993, bodyweight: 81.4, total: 400 });
  assert.ok(!underAgeText.includes('Q-Masters public'));
  const qualifiedText = renderCheckerText(context, elements, { birthYear: 1981, bodyweight: 81.4, total: 267 });
  assert.ok(qualifiedText.includes('Q-Masters public'));
  assert.ok(qualifiedText.includes('Q-Masters'));
}


{
  const juniorCompetition = pointCompetition({
    name: 'Junior Sinclair public',
    slug: 'junior-sinclair-public',
    pointSystem: 'sinclair',
    pointRequirements: { men: 200 },
  });
  juniorCompetition.ageRule = { min: 15, max: 20, label: 'Junior' };
  const { context, elements } = loadWebsiteContext([juniorCompetition]);
  const eligibleText = renderCheckerText(context, elements, { birthYear: 2006, bodyweight: 70, total: 250 });
  assert.ok(eligibleText.includes('Junior Sinclair public'));
  const tooOldText = renderCheckerText(context, elements, { birthYear: 1994, bodyweight: 70, total: 250 });
  assert.ok(!tooOldText.includes('Junior Sinclair public'));
}

console.log('Point edge-case tests passed.');

{
  const qMastersCompetition = pointCompetition({
    name: 'Q-Masters ignores external age group',
    slug: 'qmasters-age-specific-public',
    pointSystem: 'qmasters',
    pointRequirements: { men: 400 },
  });
  qMastersCompetition.ageRule = { min: 15, max: 23, label: 'U23' };
  const { context, elements } = loadWebsiteContext([qMastersCompetition]);
  const mastersText = renderCheckerText(context, elements, { birthYear: 1981, bodyweight: 81.4, total: 267 });
  assert.ok(mastersText.includes('Q-Masters ignores external age group'));
  const tooYoungText = renderCheckerText(context, elements, { birthYear: 2006, bodyweight: 81.4, total: 267 });
  assert.ok(!tooYoungText.includes('Q-Masters ignores external age group'));
}

console.log('Age-specific point-system conflict tests passed.');
