// GAMX calculation smoke tests against cached examples from
// GAMX_calculator_allages_current.xlsx.
// Run with: node tests/gamx-calculations.test.js

const assert = require("node:assert/strict");

global.window = {};
require("../gamx-data.js");
const GAMX_DATA = global.window.GAMX_DATA;

function closeTo(actual, expected, tolerance = 0.001) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function erf(value) {
  const coefficients = [
    -1.3026537197817094,
    0.6419697923564902,
    0.019476473204185836,
    -0.009561514786808631,
    -0.000946595344482036,
    0.000366839497852761,
    0.000042523324806907,
    -0.000020278578112534,
    -0.000001624290004647,
    0.00000130365583558,
    0.000000015626441722,
    -0.000000085238095915,
    0.000000006529054439,
    0.000000005059343495,
    -0.000000000991364156,
    -0.000000000227365122,
    0.000000000096467911,
    0.000000000002394038,
    -0.000000000006886027,
    0.000000000000894487,
    0.000000000000313092,
    -0.000000000000112708,
    0.000000000000000381,
    0.000000000000007106,
    -0.000000000000001523,
    -0.000000000000000094,
    0.000000000000000121,
    -0.000000000000000028,
  ];
  const isNegative = value < 0;
  const x = Math.abs(value);
  const t = 2 / (2 + x);
  const ty = 4 * t - 2;
  let d = 0;
  let dd = 0;
  for (let index = coefficients.length - 1; index > 0; index -= 1) {
    const previousD = d;
    d = ty * d - dd + coefficients[index];
    dd = previousD;
  }
  const erfc = t * Math.exp(-x * x + 0.5 * (coefficients[0] + ty * d) - dd);
  return isNegative ? erfc - 1 : 1 - erfc;
}

function normalCdf(value) {
  return 0.5 * (1 + erf(value / Math.SQRT2));
}

function inverseNormalCdf(probability) {
  const p = clamp(probability, 1e-15, 1 - 1e-15);
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= pHigh) {
    q = p - 0.5;
    const r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

function getParameters(type, gender, bodyweight, age) {
  const data = GAMX_DATA[type];
  const genderData = data.genders[gender];
  const bw = Math.round(bodyweight / genderData.step) * genderData.step;
  const bwIndex = Math.round((bw - genderData.minBw) / genderData.step);
  const rowIndex = data.requiresAge
    ? ((Math.floor(age) - genderData.minAge) * genderData.bwCount + bwIndex) * 3
    : bwIndex * 3;
  return {
    mu: genderData.data[rowIndex],
    sigma: genderData.data[rowIndex + 1],
    nu: genderData.data[rowIndex + 2],
  };
}

function calculateGAMX(type, gender, bodyweight, total, age) {
  const { mu, sigma, nu } = getParameters(type, gender, bodyweight, age);
  const ratio = total / mu;
  const z = nu !== 0
    ? ((ratio ** nu) - 1) / (nu * sigma)
    : Math.log(ratio) / sigma;
  const lowerAdjustment = nu > 0 ? normalCdf(-1 / (sigma * Math.abs(nu))) : 0;
  const denominator = normalCdf(1 / (sigma * Math.abs(nu)));
  const probability = (normalCdf(z) - lowerAdjustment) / denominator;
  return 1000 + 100 * inverseNormalCdf(clamp(probability, 1e-15, 1 - 1e-15));
}

const officialExamples = [
  ["gamx", "men", 75, 350, null, 1130.7698471489548],
  ["gamx", "women", 77.3, 200, null, 893.4573803637248],
  ["gamxA", "men", 65, 100, 15, 741.7197321814172],
  ["gamxA", "women", 45, 100, 15, 830.9731473196987],
  ["gamxM", "men", 75, 150, 40, 636.3658014190305],
  ["gamxM", "women", 59.2, 150, 40, 1081.493984347099],
  ["gamxU", "men", 40, 35, 10, 754.5051192833739],
  ["gamxU", "women", 40, 35, 10, 767.8243734434266],
];

for (const [type, gender, bodyweight, total, age, expected] of officialExamples) {
  closeTo(calculateGAMX(type, gender, bodyweight, total, age), expected, 0.001);
}

console.log("GAMX calculation smoke tests passed.");
