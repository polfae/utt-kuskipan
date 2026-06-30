// Lightweight point-calculation smoke tests for the qualification website.
// Run with: node tests/point-calculations.test.js
//
// These tests cover Sinclair, Q-points and Q-Masters.
// GAMX workbook-reference tests live in gamx-calculations.test.js.

const assert = require("node:assert/strict");


const QMASTERS_AGE_FACTORS = {
  men: {
    35: 1.052, 45: 1.194, 55: 1.494, 65: 1.942, 75: 2.528, 85: 3.403, 90: 3.935,
  },
  women: {
    35: 1.052, 45: 1.173, 55: 1.351, 65: 1.620, 75: 2.083, 85: 3.008, 95: 4.863,
  },
};

const SINCLAIR_COEFFICIENTS = {
  men: { A: 0.70064, B: 201.175 },
  women: { A: 0.67398, B: 163.929 },
};

function closeTo(actual, expected, tolerance = 0.1) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

function sinclair(gender, bodyweight, total) {
  const coefficients = SINCLAIR_COEFFICIENTS[gender];
  const coefficient = bodyweight >= coefficients.B
    ? 1
    : 10 ** (coefficients.A * (Math.log10(bodyweight / coefficients.B) ** 2));
  return total * coefficient;
}

function qpoints(gender, bodyweight, total) {
  const bw = gender === "women" ? Math.max(bodyweight, 41) : Math.max(bodyweight, 50);
  const scaled = bw / 100;
  const denominator = gender === "women"
    ? 266.5 - 19.44 * (scaled ** -2) + 18.61 * (scaled ** 2)
    : 416.7 - 47.87 * (scaled ** -2) + 18.93 * (scaled ** 2);
  const numerator = gender === "women" ? 306.54 : 463.26;
  return (total * numerator) / denominator;
}


function qmasters(gender, bodyweight, total, age) {
  const factor = QMASTERS_AGE_FACTORS[gender]?.[Math.floor(age)];
  assert.ok(Number.isFinite(factor), `Missing Q-Masters factor for ${gender} age ${age}`);
  return qpoints(gender, bodyweight, total) * factor;
}

function adjustedPointRequirement(originalRequirement, adjustmentPercent) {
  return originalRequirement * (1 + adjustmentPercent / 100);
}

function isEffectivelyWholeNumber(value) {
  return Number.isFinite(value) && Math.abs(value - Math.round(value)) < 0.0000001;
}

function formatPointRequirementValue(value) {
  if (!Number.isFinite(value)) return "—";
  if (isEffectivelyWholeNumber(value)) return String(Math.round(value));
  return value.toLocaleString("fo-FO", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

// Official Sinclair expected coefficients are taken from 2025-2028 coefficient tables.
closeTo(sinclair("men", 81.4, 260), 260 * 1.282880, 0.1);
closeTo(sinclair("women", 63.5, 145), 145 * 1.301200, 0.1);

// Q-points reference values from the implemented official formula.
closeTo(qpoints("men", 81.4, 260), 337.4, 0.1);
closeTo(qpoints("women", 63.2, 145), 197.3, 0.1);

// Q-Masters = Q-points × official IMWA age factor.
closeTo(qmasters("men", 81.4, 260, 45), qpoints("men", 81.4, 260) * 1.194, 0.1);
closeTo(qmasters("women", 63.2, 145, 45), qpoints("women", 63.2, 145) * 1.173, 0.1);

// Point requirement adjustment uses the same sign logic as total requirements:
// negative values reduce the requirement; positive values increase it.
closeTo(adjustedPointRequirement(200, -5), 190, 0.000001);
closeTo(adjustedPointRequirement(200, 5), 210, 0.000001);

assert.equal(formatPointRequirementValue(190), "190");
assert.equal(formatPointRequirementValue(270.75), "270,750");

console.log("Point calculation smoke tests passed.");
