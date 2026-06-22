const DEFAULT_SETTINGS = {
  percentA: 5,
  percentB: 10
};

const QUALIFICATION_YEAR = new Date().getFullYear();

const AGE_RULES = {
  "em-ungdom-u15": { min: 13, max: 15, label: "U15" },
  "em-ungdom-u17": { min: 13, max: 17, label: "U17" },
  "vm-ungdom": { min: 13, max: 17, label: "Ung" },
  "nordisk-ungdom": { min: 13, max: 17, label: "Ung" },
  "vm-junior": { min: 15, max: 20, label: "Junior" },
  "em-junior": { min: 15, max: 20, label: "Junior" },
  "nordisk-junior": { min: 15, max: 20, label: "Junior" },
  "em-u23": { min: 15, max: 23, label: "U23" },
  "vm-senior": { min: 15, max: null, label: "Senior" },
  "em-senior": { min: 15, max: null, label: "Senior" },
  "nm-senior": { min: 15, max: null, label: "Senior" }
};

let settings = loadSettings();
let activeCompetitionSlug = QUALIFICATION_DATA[0]?.slug || "";
let activeRequirementFilters = {};

const elements = {
  tabs: document.getElementById("competitionTabs"),
  panel: document.getElementById("competitionPanel"),
  activeSettings: document.getElementById("activeSettings"),
  gender: document.getElementById("athleteGender"),
  birthYear: document.getElementById("athleteBirthYear"),
  weightClass: document.getElementById("athleteWeightClass"),
  total: document.getElementById("athleteTotal"),
  checkerResults: document.getElementById("checkerResults"),
  checkerSummary: document.getElementById("checkerSummary"),
  settingsDialog: document.getElementById("settingsDialog"),
  openSettings: document.getElementById("openSettings"),
  settingsForm: document.getElementById("settingsForm"),
  percentA: document.getElementById("percentA"),
  percentB: document.getElementById("percentB"),
  resetSettings: document.getElementById("resetSettings")
};

init();

function init() {
  renderTabs();
  populateWeightClasses();
  renderActiveSettings();
  renderCompetition();
  renderChecker();
  bindEvents();
}

function bindEvents() {
  elements.gender.addEventListener("change", () => {
    populateWeightClasses();
    renderChecker();
  });
  elements.birthYear.addEventListener("input", renderChecker);
  elements.weightClass.addEventListener("change", renderChecker);
  elements.total.addEventListener("input", renderChecker);

  elements.openSettings.addEventListener("click", () => {
    elements.percentA.value = settings.percentA;
    elements.percentB.value = settings.percentB;
    elements.settingsDialog.showModal();
  });

  elements.settingsForm.addEventListener("submit", () => {
    const percentA = cleanPercentage(elements.percentA.value, DEFAULT_SETTINGS.percentA);
    const percentB = cleanPercentage(elements.percentB.value, DEFAULT_SETTINGS.percentB);
    settings = { percentA, percentB };
    saveSettings(settings);
    renderActiveSettings();
    renderCompetition();
    renderChecker();
  });

  elements.resetSettings.addEventListener("click", () => {
    settings = { ...DEFAULT_SETTINGS };
    saveSettings(settings);
    elements.percentA.value = settings.percentA;
    elements.percentB.value = settings.percentB;
    renderActiveSettings();
    renderCompetition();
    renderChecker();
  });
}

function loadSettings() {
  const stored = localStorage.getItem("qualificationPercentageSettings");
  if (!stored) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(stored);
    return {
      percentA: cleanPercentage(parsed.percentA, DEFAULT_SETTINGS.percentA),
      percentB: cleanPercentage(parsed.percentB, DEFAULT_SETTINGS.percentB)
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(value) {
  localStorage.setItem("qualificationPercentageSettings", JSON.stringify(value));
}

function cleanPercentage(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, number));
}

function renderTabs() {
  elements.tabs.innerHTML = "";
  QUALIFICATION_DATA.forEach((competition) => {
    const button = document.createElement("button");
    button.className = `tab-button${competition.slug === activeCompetitionSlug ? " active" : ""}`;
    button.type = "button";
    button.textContent = competition.name;
    button.addEventListener("click", () => {
      activeCompetitionSlug = competition.slug;
      renderTabs();
      renderCompetition();
    });
    elements.tabs.appendChild(button);
  });
}

function renderActiveSettings() {
  elements.activeSettings.innerHTML = `
    <span class="badge neutral">Uppruna krøv</span>
    <span class="badge warning">-${formatPercent(settings.percentA)}</span>
    <span class="badge warning">-${formatPercent(settings.percentB)}</span>
  `;
}

function renderCompetition() {
  const competition = QUALIFICATION_DATA.find((item) => item.slug === activeCompetitionSlug) || QUALIFICATION_DATA[0];
  if (!competition) return;

  const requirementTitles = getRequirementTitles(competition);
  const activeFilter = getActiveRequirementFilter(competition);
  const menRows = filterRowsByRequirement(competition.men, activeFilter);
  const womenRows = filterRowsByRequirement(competition.women, activeFilter);
  const rule = AGE_RULES[competition.slug];

  elements.panel.innerHTML = `
    <div class="competition-info">
      <div>
        <p class="eyebrow">${escapeHtml(competition.category || "Úttøkukrøv")}${rule?.label ? ` · ${escapeHtml(rule.label)}` : ""}</p>
        <h2>${escapeHtml(competition.name)}</h2>
      </div>
    </div>
    ${requirementTitles.length > 1 ? renderRequirementTabs(competition, requirementTitles, activeFilter) : ""}
    <div class="tables-grid">
      ${renderTable("Menn", menRows)}
      ${renderTable("Kvinnur", womenRows)}
    </div>
  `;

  const requirementButtons = elements.panel.querySelectorAll("[data-requirement-filter]");
  requirementButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeRequirementFilters[competition.slug] = button.dataset.requirementFilter;
      renderCompetition();
    });
  });
}

function renderRequirementTabs(competition, titles, activeFilter) {
  const buttons = ["Øll", ...titles].map((title) => {
    const value = title === "Øll" ? "all" : title;
    return `<button class="subtab-button${value === activeFilter ? " active" : ""}" type="button" data-requirement-filter="${escapeAttribute(value)}">${escapeHtml(title)}</button>`;
  }).join("");

  return `<nav class="subtabs" aria-label="Kravstig">${buttons}</nav>`;
}

function renderTable(label, rows) {
  return `
    <article class="table-card">
      <h3>${label}</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Vektflokkur</th>
              <th>Heiti</th>
              <th>Upprunaligt</th>
              <th>-${formatPercent(settings.percentA)}</th>
              <th>-${formatPercent(settings.percentB)}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${escapeHtml(row.weightClass)} kg</td>
                <td>${escapeHtml(row.title)}</td>
                <td>${formatTotal(row.original)}</td>
                <td>${formatTotal(adjustedTotal(row.original, settings.percentA))}</td>
                <td>${formatTotal(adjustedTotal(row.original, settings.percentB))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function getRequirementTitles(competition) {
  const titles = [...new Set([...competition.men, ...competition.women].map((row) => row.title))];
  return titles.sort(requirementTitleSort);
}

function requirementTitleSort(a, b) {
  const order = ["A-krav", "B-krav", "C-krav", "Úttøkukrav"];
  const indexA = order.indexOf(a);
  const indexB = order.indexOf(b);
  if (indexA !== -1 || indexB !== -1) return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  return a.localeCompare(b, "fo");
}

function getActiveRequirementFilter(competition) {
  const titles = getRequirementTitles(competition);
  const stored = activeRequirementFilters[competition.slug] || "all";
  if (stored === "all" || titles.includes(stored)) return stored;
  return "all";
}

function filterRowsByRequirement(rows, activeFilter) {
  if (activeFilter === "all") return rows;
  return rows.filter((row) => row.title === activeFilter);
}

function populateWeightClasses() {
  const gender = elements.gender.value;
  const key = gender === "women" ? "women" : "men";
  const currentValue = elements.weightClass.value;
  const classes = [...new Set(QUALIFICATION_DATA.flatMap((competition) => competition[key].map((row) => row.weightClass)))];
  classes.sort(weightClassSort);

  elements.weightClass.innerHTML = classes.map((weightClass) => `
    <option value="${escapeAttribute(weightClass)}">${escapeHtml(weightClass)} kg</option>
  `).join("");

  if (classes.includes(currentValue)) {
    elements.weightClass.value = currentValue;
  }
}

function renderChecker() {
  const gender = elements.gender.value;
  const key = gender === "women" ? "women" : "men";
  const birthYear = Number(elements.birthYear.value);
  const hasBirthYear = Number.isInteger(birthYear) && birthYear > 1900 && birthYear <= QUALIFICATION_YEAR;
  const age = hasBirthYear ? QUALIFICATION_YEAR - birthYear : null;
  const weightClass = elements.weightClass.value;
  const total = Number(elements.total.value);
  const hasTotal = Number.isFinite(total) && elements.total.value !== "";

  if (!hasTotal || !hasBirthYear) {
    elements.checkerSummary.innerHTML = `
      ${summaryTile("—", "Uppruna krøv")}
      ${summaryTile("—", `${formatPercent(settings.percentA)} lækkað krøv`)}
      ${summaryTile("—", `${formatPercent(settings.percentB)} lækkað krøv`)}
    `;
    elements.checkerResults.innerHTML = `<div class="empty-state">Skriva føðiár og samlað úrslit fyri at síggja, hvørji úttøkukrøv eru klárað í ${escapeHtml(weightClass)} kg.</div>`;
    return;
  }

  const matchingRows = QUALIFICATION_DATA
    .filter((competition) => isCompetitionAgeEligible(competition.slug, age))
    .flatMap((competition) => {
      return competition[key]
        .filter((entry) => entry.weightClass === weightClass)
        .map((row) => {
          const firstAdjusted = adjustedTotal(row.original, settings.percentA);
          const secondAdjusted = adjustedTotal(row.original, settings.percentB);
          return {
            competition: competition.name,
            category: competition.category,
            ageLabel: AGE_RULES[competition.slug]?.label || "",
            row,
            firstAdjusted,
            secondAdjusted,
            madeOriginal: total >= row.original,
            madeFirstAdjusted: total >= firstAdjusted,
            madeSecondAdjusted: total >= secondAdjusted
          };
        });
    });

  const originalCount = matchingRows.filter((item) => item.madeOriginal).length;
  const firstCount = matchingRows.filter((item) => item.madeFirstAdjusted).length;
  const secondCount = matchingRows.filter((item) => item.madeSecondAdjusted).length;

  elements.checkerSummary.innerHTML = `
    ${summaryTile(originalCount, "Uppruna krøv")}
    ${summaryTile(firstCount, `${formatPercent(settings.percentA)} lækkað krøv`)}
    ${summaryTile(secondCount, `${formatPercent(settings.percentB)} lækkað krøv`)}
  `;

  if (!matchingRows.length) {
    elements.checkerResults.innerHTML = `<div class="empty-state">Ongar kappingar passa til aldur og vektflokk hjá hesum lyftara.</div>`;
    return;
  }

  const sortedRows = matchingRows.sort((a, b) => a.row.original - b.row.original || a.competition.localeCompare(b.competition, "fo"));
  elements.checkerResults.innerHTML = sortedRows.map((item) => {
    const bestStatus = getBestStatus(item);
    return `
      <article class="result-item">
        <div class="result-main">
          <strong>${escapeHtml(item.competition)} · ${escapeHtml(item.row.title)}</strong>
          <span>${escapeHtml(item.row.weightClass)} kg · ${escapeHtml(item.ageLabel)} · upprunaligt ${formatTotal(item.row.original)} kg · lækkað ${formatTotal(item.firstAdjusted)} / ${formatTotal(item.secondAdjusted)} kg</span>
        </div>
        <div class="badges">
          ${badge(item.madeOriginal, "Upprunaligt", `Manglar ${formatTotal(item.row.original - total)} kg`)}
          ${badge(item.madeFirstAdjusted, `-${formatPercent(settings.percentA)}`, `Manglar ${formatTotal(item.firstAdjusted - total)} kg`)}
          ${badge(item.madeSecondAdjusted, `-${formatPercent(settings.percentB)}`, `Manglar ${formatTotal(item.secondAdjusted - total)} kg`)}
          <span class="badge ${bestStatus.className}">${bestStatus.text}</span>
        </div>
      </article>
    `;
  }).join("");
}

function isCompetitionAgeEligible(slug, age) {
  const rule = AGE_RULES[slug];
  if (!rule) return true;
  if (rule.min != null && age < rule.min) return false;
  if (rule.max != null && age > rule.max) return false;
  return true;
}

function summaryTile(value, label) {
  return `
    <div class="summary-tile">
      <strong>${value}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function badge(passed, passText, failText) {
  if (passed) return `<span class="badge success">Kláraði ${escapeHtml(passText)}</span>`;
  return `<span class="badge neutral">${escapeHtml(failText)}</span>`;
}

function getBestStatus(item) {
  if (item.madeOriginal) return { text: "Klárað", className: "success" };
  if (item.madeFirstAdjusted || item.madeSecondAdjusted) return { text: "Lækkað krav", className: "warning" };
  return { text: "Ikki enn", className: "neutral" };
}

function adjustedTotal(original, percentage) {
  return Math.round(original * (1 - percentage / 100));
}

function formatTotal(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return String(Math.round(number));
}

function formatPercent(value) {
  const number = Number(value);
  if (Number.isInteger(number)) return `${number}%`;
  return `${number.toFixed(1)}%`;
}

function weightClassSort(a, b) {
  const numberA = Number(String(a).replace("+", ""));
  const numberB = Number(String(b).replace("+", ""));
  if (numberA !== numberB) return numberA - numberB;
  return String(a).includes("+") ? 1 : -1;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
