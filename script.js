const DEFAULT_SETTINGS = {
  percentA: 5,
  percentB: 10,
  threePercentValue: 3,
};

const QUALIFICATION_YEAR = new Date().getFullYear();

const DEFAULT_GROUPS = [
  { key: "hm", shortLabel: "HM", label: "Heimsmeistarakappingar", order: 1 },
  { key: "em", shortLabel: "EM", label: "Evropameistarakappingar", order: 2 },
  {
    key: "nm",
    shortLabel: "NM",
    label: "Norðurlendskar meistarakappingar",
    order: 3,
  },
];

const AGE_PRESETS = {
  senior: { min: 15, max: null, label: "Senior" },
  u23: { min: 15, max: 23, label: "U23" },
  junior: { min: 15, max: 20, label: "Junior" },
  ung: { min: 13, max: 17, label: "Ung" },
  u17: { min: 13, max: 17, label: "U17" },
  u15: { min: 13, max: 15, label: "U15" },
  masters: { min: 35, max: null, label: "Masters" },
  open: { min: null, max: null, label: "Open" },
};

const ADD_COMPETITION_TYPES = {
  ung: { label: "Ung", type: "standard", ageCategory: "ung" },
  u15: { label: "U15", type: "standard", ageCategory: "u15" },
  junior: { label: "Junior", type: "standard", ageCategory: "junior" },
  u23: { label: "U23", type: "standard", ageCategory: "u23" },
  senior: { label: "Senior", type: "standard", ageCategory: "senior" },
  masters: { label: "Masters", type: "masters", ageCategory: "masters" },
  open: { label: "Open", type: "standard", ageCategory: "open" },
};

const ADD_REQUIREMENT_LEVELS = ["Úttøkukrav", "A-krav", "B-krav", "C-krav"];

const DEFAULT_MASTERS_AGE_OPTIONS = [
  { label: "M35", min: 35, max: 39 },
  { label: "M40", min: 40, max: 44 },
  { label: "M45", min: 45, max: 49 },
  { label: "M50", min: 50, max: 54 },
  { label: "M55", min: 55, max: 59 },
  { label: "M60", min: 60, max: 64 },
  { label: "M65", min: 65, max: 69 },
  { label: "M70", min: 70, max: 74 },
  { label: "M75", min: 75, max: 79 },
  { label: "M80", min: 80, max: 84 },
  { label: "M85", min: 85, max: 89 },
  { label: "M90+", min: 90, max: null },
];

let addCompetitionState = {
  mode: "new-group",
  groupKey: "",
  competitionSlug: "",
};
let editGroupState = { groupKey: "" };

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
  "nm-senior": { min: 15, max: null, label: "Senior" },
};

const DEFAULT_QUALIFICATION_DATA = normalizeQualificationData(
  deepClone(QUALIFICATION_DATA),
);
let qualificationData = loadQualificationData();
let settings = loadSettings();
let activeCompetitionSlug = qualificationData[0]?.slug || "";
let activeSettingsTab = "totals";
let activeRequirementFilters = {};
let activeResultsGroup = "all";
let activeTotalsCompetitionSlug = qualificationData[0]?.slug || "";
let activeTotalsRequirementTitle = "";
let activeTotalsMastersAgeGroupKey = {};

const elements = {
  tabs: document.getElementById("competitionTabs"),
  panel: document.getElementById("competitionPanel"),
  activeSettings: document.getElementById("activeSettings"),
  gender: document.getElementById("athleteGender"),
  birthYear: document.getElementById("athleteBirthYear"),
  total: document.getElementById("athleteTotal"),
  bodyweight: document.getElementById("athleteBodyweight"),
  threePercentRule: document.getElementById("threePercentRule"),
  checkerResults: document.getElementById("checkerResults"),
  checkerSummary: document.getElementById("checkerSummary"),
  settingsDialog: document.getElementById("settingsDialog"),
  openSettings: document.getElementById("openSettings"),
  settingsForm: document.getElementById("settingsForm"),
  percentA: document.getElementById("percentA"),
  percentB: document.getElementById("percentB"),
  threePercentValue: document.getElementById("threePercentValue"),
  resetThreePercent: document.getElementById("resetThreePercent"),
  resetSettings: document.getElementById("resetSettings"),
  settingsTabs: document.querySelectorAll("[data-settings-tab]"),
  percentageSettingsPanel: document.getElementById("percentageSettingsPanel"),
  threePercentSettingsPanel: document.getElementById(
    "threePercentSettingsPanel",
  ),
  totalsSettingsPanel: document.getElementById("totalsSettingsPanel"),
  totalsSearch: document.getElementById("totalsSearch"),
  totalsEditor: document.getElementById("totalsEditor"),
  resetTotals: document.getElementById("resetTotals"),
  addCompetitionGroup: document.getElementById("addCompetitionGroup"),
  addCompetitionDialog: document.getElementById("addCompetitionDialog"),
  addCompetitionForm: document.getElementById("addCompetitionForm"),
  addCompetitionTitle: document.getElementById("addCompetitionTitle"),
  addCompetitionNote: document.getElementById("addCompetitionNote"),
  newGroupFields: document.getElementById("newGroupFields"),
  newGroupName: document.getElementById("newGroupName"),
  newGroupShortLabel: document.getElementById("newGroupShortLabel"),
  newCompetitionName: document.getElementById("newCompetitionName"),
  newCompetitionYear: document.getElementById("newCompetitionYear"),
  competitionTypeChoices: document.getElementById("competitionTypeChoices"),
  mastersAgeChoicesPanel: document.getElementById("mastersAgeChoicesPanel"),
  mastersAgeChoices: document.getElementById("mastersAgeChoices"),
  requirementLevelChoices: document.getElementById("requirementLevelChoices"),
  createCompetitionButton: document.getElementById("createCompetitionButton"),
  deleteCompetitionInModal: document.getElementById("deleteCompetitionInModal"),
  editCompetitionTotalsPanel: document.getElementById(
    "editCompetitionTotalsPanel",
  ),
  editCompetitionTotalsEditor: document.getElementById(
    "editCompetitionTotalsEditor",
  ),
  editGroupDialog: document.getElementById("editGroupDialog"),
  editGroupForm: document.getElementById("editGroupForm"),
  editGroupName: document.getElementById("editGroupName"),
  editGroupShortLabel: document.getElementById("editGroupShortLabel"),
  saveGroupButton: document.getElementById("saveGroupButton"),
};

init();

function init() {
  renderTabs();
  renderActiveSettings();
  renderCompetition();
  renderChecker();
  bindEvents();
}

function bindEvents() {
  elements.gender.addEventListener("change", renderChecker);
  elements.birthYear.addEventListener("input", renderChecker);
  elements.total.addEventListener("input", renderChecker);
  elements.bodyweight.addEventListener("input", renderChecker);
  elements.threePercentRule.addEventListener("change", () => {
    updateThreePercentRuleButton();
    renderChecker();
  });
  updateThreePercentRuleButton();

  elements.openSettings.addEventListener("click", () => {
    elements.percentA.value = settings.percentA;
    elements.percentB.value = settings.percentB;
    elements.threePercentValue.value = settings.threePercentValue;
    setSettingsTab(activeSettingsTab);
    renderTotalsEditor();
    elements.settingsDialog.showModal();
  });

  elements.settingsForm.addEventListener("submit", () => {
    const percentA = cleanPercentage(
      elements.percentA.value,
      DEFAULT_SETTINGS.percentA,
    );
    const percentB = cleanPercentage(
      elements.percentB.value,
      DEFAULT_SETTINGS.percentB,
    );
    const threePercentValue = cleanPercentage(
      elements.threePercentValue.value,
      DEFAULT_SETTINGS.threePercentValue,
    );
    settings = {
      percentA,
      percentB,
      threePercentValue,
    };
    saveSettings(settings);
    renderActiveSettings();
    renderCompetition();
    renderChecker();
  });

  elements.settingsTabs.forEach((button) => {
    button.addEventListener("click", () =>
      setSettingsTab(button.dataset.settingsTab),
    );
  });

  elements.totalsSearch?.addEventListener("input", renderTotalsEditor);

  elements.totalsEditor.addEventListener("input", (event) => {
    const totalInput = event.target.closest("[data-total-input]");
    if (totalInput) {
      updateOriginalTotal(totalInput);
      return;
    }

    const ageGroupInput = event.target.closest("[data-agegroup-input]");
    if (ageGroupInput) {
      updateAgeGroupField(ageGroupInput);
    }
  });
  elements.totalsEditor.addEventListener("change", (event) => {
    const weightClassInput = event.target.closest("[data-weightclass-input]");
    if (weightClassInput) {
      updateWeightClass(weightClassInput);
    }
  });

  elements.totalsEditor.addEventListener("keydown", (event) => {
    const weightClassInput = event.target.closest("[data-weightclass-input]");
    if (weightClassInput && event.key === "Enter") {
      event.preventDefault();
      weightClassInput.blur();
    }
  });

  elements.totalsEditor.addEventListener("click", (event) => {
    const displayButton = event.target.closest(
      "[data-competition-display-option]",
    );
    if (displayButton) {
      updateCompetitionDisplayOption(displayButton);
      return;
    }

    const addWeightclassButton = event.target.closest("[data-add-weightclass]");
    if (addWeightclassButton) {
      addWeightClassRow(addWeightclassButton);
      return;
    }

    const deleteWeightclassButton = event.target.closest(
      "[data-delete-weightclass]",
    );
    if (deleteWeightclassButton) {
      deleteWeightClassRow(deleteWeightclassButton);
    }
  });

  elements.resetTotals?.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Vilt tú endurstilla øll úttøkukrøv til standardvirði?",
    );
    if (!confirmed) return;
    qualificationData = normalizeQualificationData(
      deepClone(DEFAULT_QUALIFICATION_DATA),
    );
    saveQualificationData(qualificationData);
    renderTotalsEditor();
    renderCompetition();
    renderChecker();
  });

  elements.addCompetitionGroup.addEventListener("click", () =>
    openAddCompetitionDialog("new-group"),
  );

  elements.addCompetitionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") {
      elements.addCompetitionDialog.close();
      return;
    }
    createCompetitionFromDialog();
  });

  elements.newGroupName.addEventListener("input", () => {
    if (!elements.newGroupShortLabel.value.trim()) {
      elements.newGroupShortLabel.placeholder =
        suggestShortLabel(elements.newGroupName.value) || "t.d. DM";
    }
  });

  elements.competitionTypeChoices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice='competitionType']");
    if (!button) return;
    setSingleChoice(elements.competitionTypeChoices, button.dataset.value);
    renderMastersAgeChoices();
    updateMastersAgeVisibility();
  });

  elements.requirementLevelChoices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice='requirementLevel']");
    if (!button || button.disabled) return;
    toggleRequirementLevel(button.dataset.value);
    syncEditModalRequirementLevels();
  });

  elements.createCompetitionButton.addEventListener(
    "click",
    createCompetitionFromDialog,
  );
  elements.deleteCompetitionInModal?.addEventListener(
    "click",
    deleteActiveCompetitionFromModal,
  );

  elements.addCompetitionDialog.addEventListener("input", (event) => {
    const totalInput = event.target.closest("[data-total-input]");
    if (totalInput) {
      updateOriginalTotal(totalInput);
      return;
    }

    const ageGroupInput = event.target.closest("[data-agegroup-input]");
    if (ageGroupInput) {
      updateAgeGroupField(ageGroupInput);
    }
  });

  elements.addCompetitionDialog.addEventListener("change", (event) => {
    const weightClassInput = event.target.closest("[data-weightclass-input]");
    if (weightClassInput) {
      updateWeightClass(weightClassInput);
      return;
    }

    const masterAgeInput = event.target.closest("[data-master-age-input]");
    if (masterAgeInput) {
      updateMastersAgeGroupField(masterAgeInput);
    }
  });

  elements.addCompetitionDialog.addEventListener("keydown", (event) => {
    const weightClassInput = event.target.closest("[data-weightclass-input]");
    if (weightClassInput && event.key === "Enter") {
      event.preventDefault();
      weightClassInput.blur();
    }
  });

  elements.addCompetitionDialog.addEventListener("click", (event) => {
    const displayButton = event.target.closest(
      "[data-competition-display-option]",
    );
    if (displayButton) {
      updateCompetitionDisplayOption(displayButton);
      return;
    }

    const addWeightclassButton = event.target.closest("[data-add-weightclass]");
    if (addWeightclassButton) {
      addWeightClassRow(addWeightclassButton);
      return;
    }

    const deleteWeightclassButton = event.target.closest(
      "[data-delete-weightclass]",
    );
    if (deleteWeightclassButton) {
      deleteWeightClassRow(deleteWeightclassButton);
      return;
    }
  });

  elements.saveGroupButton?.addEventListener("click", saveGroupFromDialog);
  elements.editGroupForm?.addEventListener("submit", (event) => {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    saveGroupFromDialog();
  });

  elements.mastersAgeChoices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice='mastersAge']");
    if (!button) return;
    button.classList.toggle("active");
  });

  elements.totalsEditor.addEventListener("change", (event) => {
    const masterAgeInput = event.target.closest("[data-master-age-input]");
    if (masterAgeInput) {
      updateMastersAgeGroupField(masterAgeInput);
    }
  });

  elements.totalsEditor.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-competition-group]");
    if (addButton) {
      openAddCompetitionDialog(
        "existing-group",
        addButton.dataset.addCompetitionGroup,
      );
      return;
    }

    const editGroupButton = event.target.closest(
      "[data-edit-competition-group]",
    );
    if (editGroupButton) {
      openEditGroupDialog(editGroupButton.dataset.editCompetitionGroup);
      return;
    }

    const deleteGroupButton = event.target.closest(
      "[data-delete-competition-group]",
    );
    if (deleteGroupButton) {
      deleteCompetitionGroup(deleteGroupButton.dataset.deleteCompetitionGroup);
    }
  });

  elements.resetSettings?.addEventListener("click", () => {
    settings = { ...DEFAULT_SETTINGS };
    saveSettings(settings);
    elements.percentA.value = settings.percentA;
    elements.percentB.value = settings.percentB;
    elements.threePercentValue.value = settings.threePercentValue;
    renderActiveSettings();
    renderCompetition();
    renderChecker();
  });

  elements.resetThreePercent?.addEventListener("click", () => {
    settings.threePercentValue = DEFAULT_SETTINGS.threePercentValue;
    saveSettings(settings);
    elements.threePercentValue.value = settings.threePercentValue;
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
    const base = {
      percentA: cleanPercentage(parsed.percentA, DEFAULT_SETTINGS.percentA),
      percentB: cleanPercentage(parsed.percentB, DEFAULT_SETTINGS.percentB),
      threePercentValue: cleanPercentage(
        parsed.threePercentValue,
        DEFAULT_SETTINGS.threePercentValue,
      ),
    };
    return base;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(value) {
  localStorage.setItem(
    "qualificationPercentageSettings",
    JSON.stringify(value),
  );
}

function loadQualificationData() {
  const stored = localStorage.getItem("qualificationOriginalTotals");
  if (!stored)
    return normalizeQualificationData(deepClone(DEFAULT_QUALIFICATION_DATA));
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) return normalizeQualificationData(parsed);
    return normalizeQualificationData(deepClone(DEFAULT_QUALIFICATION_DATA));
  } catch {
    return normalizeQualificationData(deepClone(DEFAULT_QUALIFICATION_DATA));
  }
}

function saveQualificationData(value) {
  localStorage.setItem("qualificationOriginalTotals", JSON.stringify(value));
}

function normalizeQualificationData(data) {
  const fallback = Array.isArray(data) ? data : [];
  return fallback
    .map((competition, index) => {
      const group = inferCompetitionGroup(competition, index);
      const normalized = {
        ...competition,
        groupKey: competition.groupKey || group.key,
        groupShortLabel: competition.groupShortLabel || group.shortLabel,
        groupLabel: competition.groupLabel || group.label,
        groupOrder: Number.isFinite(Number(competition.groupOrder))
          ? Number(competition.groupOrder)
          : group.order,
        order: Number.isFinite(Number(competition.order))
          ? Number(competition.order)
          : index + 1,
        competitionYear: Number.isFinite(Number(competition.competitionYear))
          ? Number(competition.competitionYear)
          : QUALIFICATION_YEAR,
        ageRule:
          competition.ageRule ||
          AGE_RULES[competition.slug] ||
          inferAgeRuleFromName(competition.name),
        type: competition.type === "masters" ? "masters" : "standard",
        displayOptions: getValidatedCompetitionDisplayOptions(
          competition.displayOptions ||
            legacyDisplayOptionsFromReductionFlag(competition),
        ),
      };
      normalized.men = normalizePlusWeightClasses(
        normalizeRows(
          Array.isArray(normalized.men) ? normalized.men : [],
          normalized.type,
        ),
      );
      normalized.women = normalizePlusWeightClasses(
        normalizeRows(
          Array.isArray(normalized.women) ? normalized.women : [],
          normalized.type,
        ),
      );
      return normalized;
    })
    .sort((a, b) => {
      const groupDiff = Number(a.groupOrder || 0) - Number(b.groupOrder || 0);
      if (groupDiff) return groupDiff;
      const orderDiff = Number(a.order || 0) - Number(b.order || 0);
      if (orderDiff) return orderDiff;
      return String(a.name || "").localeCompare(String(b.name || ""), "fo");
    });
}

function inferCompetitionGroup(competition, index = 0) {
  if (competition.groupKey && competition.groupLabel) {
    return {
      key: competition.groupKey,
      shortLabel:
        competition.groupShortLabel || competition.groupKey.toUpperCase(),
      label: competition.groupLabel,
      order: Number.isFinite(Number(competition.groupOrder))
        ? Number(competition.groupOrder)
        : index + 1,
    };
  }
  const slug = competition.slug || "";
  if (slug.startsWith("vm-") || slug.startsWith("hm-"))
    return { ...DEFAULT_GROUPS[0] };
  if (slug.startsWith("em-")) return { ...DEFAULT_GROUPS[1] };
  if (slug.startsWith("nm-") || slug.startsWith("nordisk-"))
    return { ...DEFAULT_GROUPS[2] };
  return {
    key: "onnur",
    shortLabel: "ON",
    label: "Aðrar kappingar",
    order: 99,
  };
}

function inferAgeRuleFromName(name = "") {
  const lower = String(name).toLowerCase();
  if (lower.includes("u15")) return { ...AGE_PRESETS.u15 };
  if (lower.includes("u17")) return { ...AGE_PRESETS.u17 };
  if (lower.includes("u23")) return { ...AGE_PRESETS.u23 };
  if (lower.includes("junior")) return { ...AGE_PRESETS.junior };
  if (lower.includes("ung")) return { ...AGE_PRESETS.ung };
  if (lower.includes("masters")) return { ...AGE_PRESETS.masters };
  return { ...AGE_PRESETS.senior };
}

function normalizeRows(rows, competitionType) {
  return rows.map((row) => {
    const isPlus =
      Boolean(row.isPlus) ||
      String(row.weightClass || "")
        .trim()
        .includes("+");
    const normalized = {
      weightClass: cleanWeightClass(
        row.weightClass,
        row.weightClass || "",
        isPlus,
      ),
      isPlus,
      title: row.title || "Úttøkukrav",
      original: Number.isFinite(Number(row.original))
        ? Math.round(Number(row.original))
        : 0,
    };

    if (competitionType === "masters") {
      normalized.ageGroup = row.ageGroup || row.ageGroupLabel || "M35";
      normalized.ageMin = Number.isFinite(Number(row.ageMin))
        ? Number(row.ageMin)
        : parseAgeGroupMin(normalized.ageGroup, 35);
      normalized.ageMax =
        row.ageMax === null || row.ageMax === "" || row.ageMax == null
          ? parseAgeGroupMax(normalized.ageGroup, normalized.ageMin)
          : Number(row.ageMax);
      if (!Number.isFinite(normalized.ageMax)) normalized.ageMax = null;
    }

    return normalized;
  });
}

function normalizePlusWeightClasses(rows) {
  const normalizedRows = rows.map((row) => ({
    ...row,
    weightClass: cleanWeightClass(
      row.weightClass,
      row.weightClass || "",
      false,
    ),
    isPlus: false,
  }));

  const buckets = new Map();

  normalizedRows.forEach((row, index) => {
    const bucketKey = [
      row.title || "Úttøkukrav",
      row.ageGroup || "",
      row.ageMin ?? "",
      row.ageMax ?? "",
    ].join("|");

    if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
    buckets.get(bucketKey).push({ row, index });
  });

  buckets.forEach((items) => {
    const byLimit = new Map();
    items.forEach((item) => {
      const limit = parseWeightClassLimit(item.row.weightClass);
      if (!Number.isFinite(limit)) return;
      if (!byLimit.has(limit)) byLimit.set(limit, []);
      byLimit.get(limit).push(item);
    });

    const sortedLimits = [...byLimit.keys()].sort((a, b) => a - b);
    if (!sortedLimits.length) return;

    const highestLimit = sortedLimits[sortedLimits.length - 1];
    const heaviestRows = byLimit
      .get(highestLimit)
      .sort((a, b) => a.index - b.index);

    if (heaviestRows.length < 2) return;

    const plusCandidate = heaviestRows[heaviestRows.length - 1];
    plusCandidate.row.isPlus = true;
    plusCandidate.row.weightClass = cleanWeightClass(
      highestLimit,
      `${highestLimit}`,
      true,
    );
  });

  return normalizedRows;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function setSettingsTab(tab) {
  activeSettingsTab = ["totals", "percentages", "threePercent"].includes(tab)
    ? tab
    : "totals";
  elements.settingsTabs.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.settingsTab === activeSettingsTab,
    );
  });
  elements.percentageSettingsPanel.classList.toggle(
    "is-hidden",
    activeSettingsTab !== "percentages",
  );
  elements.threePercentSettingsPanel.classList.toggle(
    "is-hidden",
    activeSettingsTab !== "threePercent",
  );
  elements.totalsSettingsPanel.classList.toggle(
    "is-hidden",
    activeSettingsTab !== "totals",
  );
  if (activeSettingsTab === "totals") renderTotalsEditor();
}

function renderTotalsEditor() {
  if (
    !qualificationData.some(
      (competition) => competition.slug === activeTotalsCompetitionSlug,
    )
  ) {
    activeTotalsCompetitionSlug = qualificationData[0]?.slug || "";
  }

  const competitionTabs = renderTotalsCompetitionTabs();
  elements.totalsEditor.innerHTML = competitionTabs;

  elements.totalsEditor
    .querySelectorAll("[data-totals-competition-slug]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        activeTotalsCompetitionSlug = button.dataset.totalsCompetitionSlug;
        openAddCompetitionDialog(
          "edit-competition",
          "",
          button.dataset.totalsCompetitionSlug,
        );
      });
    });
}

function renderEditCompetitionTotalsEditor() {
  if (
    !elements.editCompetitionTotalsPanel ||
    !elements.editCompetitionTotalsEditor
  )
    return;
  const isEditMode = addCompetitionState.mode === "edit-competition";
  const competition = isEditMode
    ? qualificationData.find(
        (item) => item.slug === addCompetitionState.competitionSlug,
      )
    : null;

  elements.editCompetitionTotalsPanel.classList.toggle(
    "is-hidden",
    !competition,
  );
  if (!competition) {
    elements.editCompetitionTotalsEditor.innerHTML = "";
    return;
  }

  activeTotalsCompetitionSlug = competition.slug;
  elements.editCompetitionTotalsEditor.innerHTML =
    renderCompetitionTotalsEditorContent(competition);
  bindTotalsEditorTabs(elements.editCompetitionTotalsEditor);
}

function renderCompetitionTotalsEditorContent(activeCompetition) {
  const search = "";
  const requirementTitles = getRequirementTitles(activeCompetition);
  if (
    requirementTitles.length > 1 &&
    !requirementTitles.includes(activeTotalsRequirementTitle)
  ) {
    activeTotalsRequirementTitle = requirementTitles[0];
  }
  if (requirementTitles.length <= 1) {
    activeTotalsRequirementTitle = "";
  }

  const requirementTabs = renderTotalsRequirementTabs(
    activeCompetition,
    requirementTitles,
  );
  const activeTitleFilter =
    requirementTitles.length > 1 ? activeTotalsRequirementTitle : "";
  const mastersAgeGroups = isMastersCompetition(activeCompetition)
    ? getMastersAgeGroups(activeCompetition)
    : [];
  let activeAgeGroupKey = "";
  if (mastersAgeGroups.length) {
    if (
      !mastersAgeGroups.some(
        (group) =>
          group.key === activeTotalsMastersAgeGroupKey[activeCompetition.slug],
      )
    ) {
      activeTotalsMastersAgeGroupKey[activeCompetition.slug] =
        mastersAgeGroups[0].key;
    }
    activeAgeGroupKey =
      activeTotalsMastersAgeGroupKey[activeCompetition.slug] ||
      mastersAgeGroups[0].key;
  }

  const ageTabs = mastersAgeGroups.length
    ? renderTotalsMastersAgeTabs(mastersAgeGroups, activeAgeGroupKey)
    : "";
  const ageEditor = mastersAgeGroups.length
    ? renderMastersAgeGroupEditor(
        activeCompetition,
        mastersAgeGroups.find((group) => group.key === activeAgeGroupKey) ||
          mastersAgeGroups[0],
      )
    : "";
  const menRows = getEditableRows(
    activeCompetition,
    "men",
    search,
    activeTitleFilter,
    activeAgeGroupKey,
  );
  const womenRows = getEditableRows(
    activeCompetition,
    "women",
    search,
    activeTitleFilter,
    activeAgeGroupKey,
  );

  if (!menRows.length && !womenRows.length) {
    return `<div class="empty-state">Eingin úttøkukrøv funnin í hesari kappingini.</div>`;
  }

  return `
    <section class="edit-competition active-edit-competition modal-edit-competition">
      <header class="edit-competition-header compact-edit-header">
        <div>
          <span>${escapeHtml(activeCompetition.name)}</span>
          <small>${escapeHtml(getCompetitionGroup(activeCompetition).label)}</small>
        </div>
        ${renderCompetitionDisplayControls(activeCompetition)}
      </header>
      ${ageTabs}
      ${ageEditor}
      ${requirementTabs}
      <div class="edit-gender-grid">
        ${renderEditableGenderTable(activeCompetition, "men", "Menn", menRows, Boolean(activeAgeGroupKey))}
        ${renderEditableGenderTable(activeCompetition, "women", "Kvinnur", womenRows, Boolean(activeAgeGroupKey))}
      </div>
    </section>
  `;
}

function bindTotalsEditorTabs(container) {
  container
    .querySelectorAll("[data-totals-requirement-title]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        activeTotalsRequirementTitle = button.dataset.totalsRequirementTitle;
        renderEditCompetitionTotalsEditor();
      });
    });

  container.querySelectorAll("[data-totals-age-group]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTotalsMastersAgeGroupKey[activeTotalsCompetitionSlug] =
        button.dataset.totalsAgeGroup;
      renderEditCompetitionTotalsEditor();
    });
  });
}

function renderTotalsMastersAgeTabs(ageGroups, activeKey) {
  if (ageGroups.length <= 1) return "";
  return `
    <nav class="totals-requirement-tabs masters-age-tabs" aria-label="Vel aldursbólk at broyta">
      ${ageGroups
        .map(
          (group) => `
        <button
          class="totals-requirement-tab${group.key === activeKey ? " active" : ""}"
          type="button"
          data-totals-age-group="${escapeAttribute(group.key)}"
        >
          ${escapeHtml(group.label)}
        </button>
      `,
        )
        .join("")}
    </nav>
  `;
}

function renderMastersAgeGroupEditor(competition, group) {
  if (!group) return "";
  return `
    <div class="masters-age-editor">
      <label>
        Aldursbólkur
        <input
          data-master-age-input
          data-age-field="ageGroup"
          data-competition-slug="${escapeAttribute(competition.slug)}"
          data-age-group-key="${escapeAttribute(group.key)}"
          type="text"
          value="${escapeAttribute(group.label)}"
        />
      </label>
      <label>
        Min aldur
        <input
          data-master-age-input
          data-age-field="ageMin"
          data-competition-slug="${escapeAttribute(competition.slug)}"
          data-age-group-key="${escapeAttribute(group.key)}"
          type="number"
          min="0"
          step="1"
          value="${escapeAttribute(group.min ?? "")}"
        />
      </label>
      <label>
        Maks aldur
        <input
          data-master-age-input
          data-age-field="ageMax"
          data-competition-slug="${escapeAttribute(competition.slug)}"
          data-age-group-key="${escapeAttribute(group.key)}"
          type="number"
          min="0"
          step="1"
          placeholder="opið"
          value="${escapeAttribute(group.max ?? "")}"
        />
      </label>
    </div>
  `;
}

function renderTotalsRequirementTabs(competition, requirementTitles) {
  if (requirementTitles.length <= 1) return "";
  return `
    <nav class="totals-requirement-tabs" aria-label="Vel kravstig at broyta">
      ${requirementTitles
        .map(
          (title) => `
        <button
          class="totals-requirement-tab${title === activeTotalsRequirementTitle ? " active" : ""}"
          type="button"
          data-totals-requirement-title="${escapeAttribute(title)}"
        >
          ${escapeHtml(title)}
        </button>
      `,
        )
        .join("")}
    </nav>
  `;
}

function renderTotalsCompetitionTabs() {
  const groups = getCompetitionGroups();

  return `
    <div class="totals-competition-tabs" aria-label="Vel kapping at broyta úttøkukrøv fyri">
      ${groups
        .map((group) => {
          const buttons = qualificationData
            .filter((competition) => competition.groupKey === group.key)
            .sort((a, b) => competitionOrder(a.slug) - competitionOrder(b.slug))
            .map(
              (competition) => `
            <div class="totals-competition-tab-item">
              <button
                class="totals-competition-tab"
                type="button"
                data-totals-competition-slug="${escapeAttribute(competition.slug)}"
                aria-label="Broyt ${escapeAttribute(competition.name)}"
                title="Broyt kapping"
              >
                ${escapeHtml(competition.name)}
              </button>
            </div>
          `,
            )
            .join("");

          return `
          <div class="totals-competition-tab-group">
            <div class="totals-competition-tab-title-row">
              <div class="totals-competition-tab-title">${escapeHtml(group.label)}</div>
              <div class="group-action-buttons">
                <button class="mini-action-button" type="button" data-add-competition-group="${escapeAttribute(group.key)}">+ Kapping</button>
                <button
                  class="mini-action-button compact-icon-button"
                  type="button"
                  data-edit-competition-group="${escapeAttribute(group.key)}"
                  aria-label="Broyt ${escapeAttribute(group.label)}"
                  title="Broyt bólk"
                >
                  ✎
                </button>
                <button class="mini-delete-button" type="button" data-delete-competition-group="${escapeAttribute(group.key)}" aria-label="Strika bólk" title="Strika bólk">×</button>
              </div>
            </div>
            <div class="totals-competition-tab-buttons">${buttons}</div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

function getCompetitionGroups() {
  const map = new Map();
  qualificationData.forEach((competition) => {
    const group = getCompetitionGroup(competition);
    if (!map.has(group.key)) map.set(group.key, group);
  });
  return [...map.values()].sort(
    (a, b) => a.order - b.order || a.label.localeCompare(b.label, "fo"),
  );
}

function getAgeGroupKey(row) {
  return [row.ageGroup || "Masters", row.ageMin ?? "", row.ageMax ?? ""].join(
    "|",
  );
}

function getMastersAgeGroups(competition) {
  const map = new Map();
  [...(competition.men || []), ...(competition.women || [])].forEach((row) => {
    if (!row.ageGroup && row.ageMin == null && row.ageMax == null) return;
    const key = getAgeGroupKey(row);
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: row.ageGroup || "Masters",
        min: row.ageMin ?? "",
        max: row.ageMax ?? null,
      });
    }
  });
  return [...map.values()].sort((a, b) => {
    const minA = Number.isFinite(Number(a.min)) ? Number(a.min) : 999;
    const minB = Number.isFinite(Number(b.min)) ? Number(b.min) : 999;
    return minA - minB || String(a.label).localeCompare(String(b.label), "fo");
  });
}

function getEditableRows(
  competition,
  genderKey,
  search,
  titleFilter = "",
  ageGroupKey = "",
) {
  return competition[genderKey]
    .map((row, index) => ({ row, index }))
    .filter((item) => {
      if (titleFilter && item.row.title !== titleFilter) return false;
      if (ageGroupKey && getAgeGroupKey(item.row) !== ageGroupKey) return false;
      if (!search) return true;
      const haystack = [
        competition.name,
        getCompetitionGroup(competition).label,
        genderKey === "men" ? "menn" : "kvinnur",
        item.row.ageGroup,
        item.row.ageMin,
        item.row.ageMax,
        getWeightClassKey(item.row),
        item.row.title,
        item.row.original,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
}

function renderEditableGenderTable(
  competition,
  genderKey,
  label,
  items,
  mastersAgeGroupTabbed = false,
) {
  const showTitleColumn = getRequirementTitles(competition).length > 1;
  const showAgeColumns =
    isMastersCompetition(competition) && !mastersAgeGroupTabbed;
  const activeTitle = showTitleColumn
    ? activeTotalsRequirementTitle || getRequirementTitles(competition)[0]
    : "";
  const activeAgeGroupKey = mastersAgeGroupTabbed
    ? activeTotalsMastersAgeGroupKey[competition.slug] || ""
    : "";

  return `
    <article class="edit-gender-card">
      <div class="edit-gender-card-header">
        <h3>${escapeHtml(label)}</h3>
        <button
          class="add-weightclass-button"
          type="button"
          data-add-weightclass
          data-competition-slug="${escapeAttribute(competition.slug)}"
          data-gender-key="${escapeAttribute(genderKey)}"
          data-title-filter="${escapeAttribute(activeTitle)}"
          data-age-group-key="${escapeAttribute(activeAgeGroupKey)}"
        >+ Vektflokkur</button>
      </div>
      <div class="edit-table-wrap">
        ${
          items.length
            ? `
          <table class="edit-table">
            <thead>
              <tr>
                ${showAgeColumns ? "<th>Aldursbólkur</th><th>Min</th><th>Maks</th>" : ""}
                <th>Vektflokkur</th>
                ${showTitleColumn ? "<th>Heiti</th>" : ""}
                <th>Krav</th>
                <th class="row-action-heading" aria-label="Atgerðir"></th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  ({ row, index }) => `
                <tr>
                  ${
                    showAgeColumns
                      ? `
                    <td>
                      <input
                        class="agegroup-edit-input"
                        data-agegroup-input
                        data-age-field="ageGroup"
                        data-competition-slug="${escapeAttribute(competition.slug)}"
                        data-gender-key="${escapeAttribute(genderKey)}"
                        data-row-index="${index}"
                        type="text"
                        value="${escapeAttribute(row.ageGroup || "")}" 
                        aria-label="${escapeAttribute(`${competition.name} ${label} aldursbólkur`)}"
                      />
                    </td>
                    <td>
                      <input
                        class="agegroup-number-input"
                        data-agegroup-input
                        data-age-field="ageMin"
                        data-competition-slug="${escapeAttribute(competition.slug)}"
                        data-gender-key="${escapeAttribute(genderKey)}"
                        data-row-index="${index}"
                        type="number"
                        min="0"
                        step="1"
                        value="${escapeAttribute(row.ageMin ?? "")}" 
                        aria-label="${escapeAttribute(`${competition.name} ${label} min aldur`)}"
                      />
                    </td>
                    <td>
                      <input
                        class="agegroup-number-input"
                        data-agegroup-input
                        data-age-field="ageMax"
                        data-competition-slug="${escapeAttribute(competition.slug)}"
                        data-gender-key="${escapeAttribute(genderKey)}"
                        data-row-index="${index}"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="opið"
                        value="${escapeAttribute(row.ageMax ?? "")}" 
                        aria-label="${escapeAttribute(`${competition.name} ${label} maks aldur`)}"
                      />
                    </td>
                  `
                      : ""
                  }
                  <td>
                    <div class="weightclass-edit-cell">
                      <input
                        class="weightclass-edit-input"
                        data-weightclass-input
                        data-competition-slug="${escapeAttribute(competition.slug)}"
                        data-gender-key="${escapeAttribute(genderKey)}"
                        data-row-index="${index}"
                        type="text"
                        inputmode="decimal"
                        value="${escapeAttribute(formatWeightClassInputValue(row))}"
                        aria-label="${escapeAttribute(`${competition.name} ${label} vektflokkur ${row.title}`)}"
                      />
                      <span>kg</span>
                    </div>
                  </td>
                  ${showTitleColumn ? `<td>${escapeHtml(row.title)}</td>` : ""}
                  <td>
                    <input
                      class="total-edit-input"
                      data-total-input
                      data-competition-slug="${escapeAttribute(competition.slug)}"
                      data-gender-key="${escapeAttribute(genderKey)}"
                      data-row-index="${index}"
                      type="number"
                      min="0"
                      step="1"
                      value="${escapeAttribute(row.original)}"
                      aria-label="${escapeAttribute(`${competition.name} ${label} ${formatWeightClassLabel(row)} ${row.title}`)}"
                    />
                  </td>
                  <td class="row-action-cell">
                    <button
                      class="row-delete-button"
                      type="button"
                      data-delete-weightclass
                      data-competition-slug="${escapeAttribute(competition.slug)}"
                      data-gender-key="${escapeAttribute(genderKey)}"
                      data-row-index="${index}"
                      aria-label="Strika vektflokk ${escapeAttribute(formatWeightClassLabel(row))}"
                      title="Strika vektflokk"
                    >×</button>
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        `
            : `<div class="empty-state compact-empty-state">Eingin vektflokkur í hesum vísingini. Legg ein vektflokk afturat.</div>`
        }
      </div>
    </article>
  `;
}

function getAddRowContext(control, competition) {
  const title =
    control.dataset.titleFilter ||
    getRequirementTitles(competition)[0] ||
    "Úttøkukrav";
  const ageGroupKey = control.dataset.ageGroupKey || "";
  let ageGroupData = null;

  if (isMastersCompetition(competition)) {
    ageGroupData =
      getMastersAgeGroups(competition).find(
        (group) => group.key === ageGroupKey,
      ) || getMastersAgeGroups(competition)[0];
  }

  return { title, ageGroupData };
}

function suggestNewWeightClass(rows) {
  const used = uniqueWeightClasses(
    (rows || []).map((row) => row.weightClass),
    [],
  );
  const defaultPool = [
    "48",
    "53",
    "58",
    "60",
    "63",
    "65",
    "69",
    "71",
    "77",
    "79",
    "86",
    "88",
    "94",
    "110",
    "86+",
    "110+",
  ];
  const nextDefault = defaultPool.find(
    (weightClass) => !used.includes(weightClass),
  );
  if (nextDefault) return nextDefault;

  const numericClasses = used
    .map((weightClass) => Number(String(weightClass).replace("+", "")))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!numericClasses.length) return "60";
  return String(Math.max(...numericClasses) + 1);
}

function addWeightClassRow(control) {
  const competition = qualificationData.find(
    (item) => item.slug === control.dataset.competitionSlug,
  );
  if (!competition) return;
  const genderKey = control.dataset.genderKey;
  const rows = competition[genderKey];
  if (!Array.isArray(rows)) return;

  const { title, ageGroupData } = getAddRowContext(control, competition);
  const comparableRows = rows.filter((row) => {
    if ((row.title || "Úttøkukrav") !== title) return false;
    if (ageGroupData && getAgeGroupKey(row) !== ageGroupData.key) return false;
    return true;
  });

  const suggestedWeightClass = suggestNewWeightClass(comparableRows);
  const newRow = {
    weightClass: cleanWeightClass(
      suggestedWeightClass,
      suggestedWeightClass,
      false,
    ),
    isPlus: false,
    title,
    original: 0,
  };

  if (ageGroupData) {
    newRow.ageGroup = ageGroupData.label || "Masters";
    newRow.ageMin = Number.isFinite(Number(ageGroupData.min))
      ? Number(ageGroupData.min)
      : 35;
    newRow.ageMax =
      ageGroupData.max === null || ageGroupData.max === ""
        ? null
        : Number(ageGroupData.max);
  }

  rows.push(newRow);
  competition[genderKey] = normalizePlusWeightClasses(
    normalizeRows(rows, competition.type),
  ).sort((a, b) => {
    const titleDiff = String(a.title || "").localeCompare(
      String(b.title || ""),
      "fo",
    );
    const ageDiff = String(getAgeGroupKey(a)).localeCompare(
      String(getAgeGroupKey(b)),
      "fo",
    );
    return (
      ageDiff || titleDiff || weightClassSort(a.weightClass, b.weightClass)
    );
  });

  saveQualificationData(qualificationData);
  renderTotalsEditor();
  renderEditCompetitionTotalsEditor();
  renderCompetition();
  renderChecker();
}

function deleteWeightClassRow(control) {
  const competition = qualificationData.find(
    (item) => item.slug === control.dataset.competitionSlug,
  );
  if (!competition) return;
  const genderKey = control.dataset.genderKey;
  const rows = competition[genderKey];
  const rowIndex = Number(control.dataset.rowIndex);
  if (!Array.isArray(rows) || !rows[rowIndex]) return;

  const row = rows[rowIndex];
  const sameContextCount = rows.filter((candidate) => {
    const sameTitle =
      (candidate.title || "Úttøkukrav") === (row.title || "Úttøkukrav");
    const sameAgeGroup = getAgeGroupKey(candidate) === getAgeGroupKey(row);
    return sameTitle && sameAgeGroup;
  }).length;

  if (sameContextCount <= 1) {
    window.alert(
      "Tað skal í minsta lagi vera ein vektflokkur eftir í hesum partinum.",
    );
    return;
  }

  const confirmed = window.confirm(
    `Vilt tú strika vektflokkin ${formatWeightClassLabel(row)}?`,
  );
  if (!confirmed) return;

  rows.splice(rowIndex, 1);
  competition[genderKey] = normalizePlusWeightClasses(
    normalizeRows(rows, competition.type),
  ).sort((a, b) => {
    const titleDiff = String(a.title || "").localeCompare(
      String(b.title || ""),
      "fo",
    );
    const ageDiff = String(getAgeGroupKey(a)).localeCompare(
      String(getAgeGroupKey(b)),
      "fo",
    );
    return ageDiff || titleDiff || weightClassSort(a, b);
  });
  saveQualificationData(qualificationData);
  renderTotalsEditor();
  renderEditCompetitionTotalsEditor();
  renderCompetition();
  renderChecker();
}

function updateOriginalTotal(input) {
  const competition = qualificationData.find(
    (item) => item.slug === input.dataset.competitionSlug,
  );
  if (!competition) return;
  const rows = competition[input.dataset.genderKey];
  const row = rows?.[Number(input.dataset.rowIndex)];
  if (!row) return;

  const value = Number(input.value);
  if (!Number.isFinite(value) || value < 0 || input.value === "") return;
  row.original = Math.round(value);
  saveQualificationData(qualificationData);
  renderCompetition();
  renderChecker();
}

function updateWeightClass(input) {
  const competition = qualificationData.find(
    (item) => item.slug === input.dataset.competitionSlug,
  );
  if (!competition) return;
  const rows = competition[input.dataset.genderKey];
  const row = rows?.[Number(input.dataset.rowIndex)];
  if (!row) return;

  const value = cleanWeightClass(input.value, row.weightClass, false);
  if (!value) return;

  row.isPlus = false;
  row.weightClass = cleanWeightClass(value, value, false);
  competition[input.dataset.genderKey] = normalizePlusWeightClasses(
    normalizeRows(rows, competition.type),
  ).sort((a, b) => {
    const titleDiff = String(a.title || "").localeCompare(
      String(b.title || ""),
      "fo",
    );
    const ageDiff = String(getAgeGroupKey(a)).localeCompare(
      String(getAgeGroupKey(b)),
      "fo",
    );
    return ageDiff || titleDiff || weightClassSort(a, b);
  });
  saveQualificationData(qualificationData);
  renderTotalsEditor();
  renderEditCompetitionTotalsEditor();
  renderCompetition();
  renderChecker();
}

function updateMastersAgeGroupField(input) {
  const competition = qualificationData.find(
    (item) => item.slug === input.dataset.competitionSlug,
  );
  if (!competition) return;
  const oldKey = input.dataset.ageGroupKey;
  const field = input.dataset.ageField;
  const matchingRows = [
    ...(competition.men || []),
    ...(competition.women || []),
  ].filter((row) => getAgeGroupKey(row) === oldKey);
  if (!matchingRows.length) return;

  if (field === "ageGroup") {
    const value = String(input.value || "").trim();
    if (value)
      matchingRows.forEach((row) => {
        row.ageGroup = value;
      });
  }

  if (field === "ageMin") {
    const value = Number(input.value);
    if (Number.isFinite(value) && value >= 0)
      matchingRows.forEach((row) => {
        row.ageMin = Math.round(value);
      });
  }

  if (field === "ageMax") {
    if (input.value === "") {
      matchingRows.forEach((row) => {
        row.ageMax = null;
      });
    } else {
      const value = Number(input.value);
      if (Number.isFinite(value) && value >= 0)
        matchingRows.forEach((row) => {
          row.ageMax = Math.round(value);
        });
    }
  }

  competition.men = normalizePlusWeightClasses(
    normalizeRows(competition.men || [], competition.type),
  ).sort((a, b) => {
    const titleDiff = String(a.title || "").localeCompare(
      String(b.title || ""),
      "fo",
    );
    const ageDiff = String(getAgeGroupKey(a)).localeCompare(
      String(getAgeGroupKey(b)),
      "fo",
    );
    return ageDiff || titleDiff || weightClassSort(a, b);
  });
  competition.women = normalizePlusWeightClasses(
    normalizeRows(competition.women || [], competition.type),
  ).sort((a, b) => {
    const titleDiff = String(a.title || "").localeCompare(
      String(b.title || ""),
      "fo",
    );
    const ageDiff = String(getAgeGroupKey(a)).localeCompare(
      String(getAgeGroupKey(b)),
      "fo",
    );
    return ageDiff || titleDiff || weightClassSort(a, b);
  });
  const newKey = getAgeGroupKey(matchingRows[0]);
  activeTotalsMastersAgeGroupKey[competition.slug] = newKey;
  saveQualificationData(qualificationData);
  renderTotalsEditor();
  renderEditCompetitionTotalsEditor();
  renderCompetition();
  renderChecker();
}

function updateAgeGroupField(input) {
  const competition = qualificationData.find(
    (item) => item.slug === input.dataset.competitionSlug,
  );
  if (!competition) return;
  const rows = competition[input.dataset.genderKey];
  const row = rows?.[Number(input.dataset.rowIndex)];
  if (!row) return;

  const field = input.dataset.ageField;
  if (field === "ageGroup") {
    row.ageGroup =
      String(input.value || "").trim() || row.ageGroup || "Masters";
  }
  if (field === "ageMin") {
    const value = Number(input.value);
    if (Number.isFinite(value) && value >= 0) row.ageMin = Math.round(value);
  }
  if (field === "ageMax") {
    if (input.value === "") {
      row.ageMax = null;
    } else {
      const value = Number(input.value);
      if (Number.isFinite(value) && value >= 0) row.ageMax = Math.round(value);
    }
  }

  saveQualificationData(qualificationData);
  renderCompetition();
  renderChecker();
}

function cleanPercentage(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, number));
}

function legacyDisplayOptionsFromReductionFlag(competition) {
  if (competition && competition.useReductions === false) {
    return { original: true, percentA: false, percentB: false };
  }
  return { original: true, percentA: true, percentB: true };
}

function getValidatedCompetitionDisplayOptions(value) {
  const allowed = ["original", "percentA", "percentB"];

  if (typeof value === "string" && allowed.includes(value)) {
    return { active: value };
  }

  if (value && typeof value === "object") {
    if (allowed.includes(value.active)) return { active: value.active };

    // Migration from earlier versions where several options could be checked.
    if (value.original) return { active: "original" };
    if (value.percentA) return { active: "percentA" };
    if (value.percentB) return { active: "percentB" };
  }

  return { active: "original" };
}

function getCompetitionDisplayOptions(competitionOrItem) {
  const source =
    competitionOrItem?.displayOptions ||
    competitionOrItem?.competitionDisplayOptions ||
    legacyDisplayOptionsFromReductionFlag(competitionOrItem || {});
  return getValidatedCompetitionDisplayOptions(source);
}

function renderCompetitionDisplayControls(competition) {
  const options = getCompetitionDisplayOptions(competition);
  const choices = [
    { key: "original", label: "Krav" },
    { key: "percentA", label: "Fyrsta lækking" },
    { key: "percentB", label: "Onnur lækking" },
  ];

  return `
    <fieldset class="competition-display-options" aria-label="Vel krav fyri hesa kapping">
      <legend>Krav í hesi kapping</legend>
      ${choices
        .map(
          (choice) => `
        <button
          class="choice-button competition-standard-button${options.active === choice.key ? " active" : ""}"
          type="button"
          data-competition-display-option
          data-display-key="${escapeAttribute(choice.key)}"
          data-competition-slug="${escapeAttribute(competition.slug)}"
          aria-pressed="${options.active === choice.key ? "true" : "false"}"
        >
          ${escapeHtml(choice.label)}
        </button>
      `,
        )
        .join("")}
    </fieldset>
  `;
}

function getVisibleRequirementVariantsForCompetition(competitionOrItem) {
  const options = getCompetitionDisplayOptions(competitionOrItem);
  const variants = {
    original: {
      key: "original",
      label: "Krav",
      className: "success",
      total: (row) => row.original,
    },
    percentA: {
      key: "percentA",
      label: `-${formatPercent(settings.percentA)}`,
      className: "warning",
      total: (row) => adjustedTotal(row.original, settings.percentA),
    },
    percentB: {
      key: "percentB",
      label: `-${formatPercent(settings.percentB)}`,
      className: "warning",
      total: (row) => adjustedTotal(row.original, settings.percentB),
    },
  };

  return [variants[options.active] || variants.original];
}

function updateCompetitionDisplayOption(control) {
  const competition = qualificationData.find(
    (item) => item.slug === control.dataset.competitionSlug,
  );
  if (!competition) return;

  competition.displayOptions = getValidatedCompetitionDisplayOptions(
    control.dataset.displayKey,
  );
  saveQualificationData(qualificationData);
  renderTotalsEditor();
  renderEditCompetitionTotalsEditor();
  renderActiveSettings();
  renderCompetition();
  renderChecker();
}

function getRequirementColumnLabel() {
  return "Krav";
}

function renderTabs() {
  const groups = getCompetitionGroups();

  elements.tabs.innerHTML = groups
    .map((group) => {
      const buttons = qualificationData
        .filter((competition) => competition.groupKey === group.key)
        .sort((a, b) => competitionOrder(a.slug) - competitionOrder(b.slug))
        .map(
          (competition) => `
        <button class="tab-button${competition.slug === activeCompetitionSlug ? " active" : ""}" type="button" data-competition-slug="${escapeAttribute(competition.slug)}">
          ${escapeHtml(competition.name)}
        </button>
      `,
        )
        .join("");

      return `
      <div class="tab-group">
        <div class="tab-group-title">${escapeHtml(group.label)}</div>
        <div class="tab-group-buttons">${buttons}</div>
      </div>
    `;
    })
    .join("");

  elements.tabs
    .querySelectorAll("[data-competition-slug]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        activeCompetitionSlug = button.dataset.competitionSlug;
        renderTabs();
        renderCompetition();
      });
    });
}

function renderActiveSettings() {
  elements.activeSettings.innerHTML = "";
}

function renderCompetition() {
  const competition =
    qualificationData.find((item) => item.slug === activeCompetitionSlug) ||
    qualificationData[0];
  if (!competition) return;

  const requirementTitles = getRequirementTitles(competition);
  const activeFilter = getActiveRequirementFilter(competition);
  const menRows = filterRowsByRequirement(competition.men, activeFilter);
  const womenRows = filterRowsByRequirement(competition.women, activeFilter);
  const rule = getAgeRule(competition);

  elements.panel.innerHTML = `
    <div class="competition-info">
      <div>
        <p class="eyebrow">${escapeHtml(competition.category || "Úttøkukrøv")}${isMastersCompetition(competition) ? " · Masters" : rule?.label ? ` · ${escapeHtml(rule.label)}` : ""}</p>
        <h2>${escapeHtml(competition.name)}</h2>
      </div>
    </div>
    ${requirementTitles.length > 1 ? renderRequirementTabs(competition, requirementTitles, activeFilter) : ""}
    <div class="tables-grid">
      ${renderTable("Menn", menRows, requirementTitles.length > 1, competition)}
      ${renderTable("Kvinnur", womenRows, requirementTitles.length > 1, competition)}
    </div>
  `;

  const requirementButtons = elements.panel.querySelectorAll(
    "[data-requirement-filter]",
  );
  requirementButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeRequirementFilters[competition.slug] =
        button.dataset.requirementFilter;
      renderCompetition();
    });
  });
}

function renderRequirementTabs(competition, titles, activeFilter) {
  const buttons = ["Øll", ...titles]
    .map((title) => {
      const value = title === "Øll" ? "all" : title;
      return `<button class="subtab-button${value === activeFilter ? " active" : ""}" type="button" data-requirement-filter="${escapeAttribute(value)}">${escapeHtml(title)}</button>`;
    })
    .join("");

  return `<nav class="subtabs" aria-label="Kravstig">${buttons}</nav>`;
}

function renderTable(label, rows, showTitleColumn = false, competition = null) {
  const showAgeColumn = rows.some((row) => row.ageGroup);
  const visibleRequirements =
    getVisibleRequirementVariantsForCompetition(competition);
  return `
    <article class="table-card">
      <h3>${label}</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              ${showAgeColumn ? "<th>Aldursbólkur</th>" : ""}
              <th>Vektflokkur</th>
              ${showTitleColumn ? "<th>Heiti</th>" : ""}
              ${visibleRequirements.map((variant) => `<th>${escapeHtml(getRequirementColumnLabel(variant, visibleRequirements.length))}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                ${showAgeColumn ? `<td>${escapeHtml(formatAgeGroupLabel(row))}</td>` : ""}
                <td>${formatDisplayWeightClassLabel(row)}</td>
                ${showTitleColumn ? `<td>${escapeHtml(row.title)}</td>` : ""}
                ${visibleRequirements.map((variant) => `<td>${formatTotal(variant.total(row))} kg</td>`).join("")}
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function getRequirementTitles(competition) {
  const titles = [
    ...new Set(
      [...competition.men, ...competition.women].map((row) => row.title),
    ),
  ];
  return titles.sort(requirementTitleSort);
}

function requirementTitleSort(a, b) {
  const order = ["A-krav", "B-krav", "C-krav", "Úttøkukrav"];
  const indexA = order.indexOf(a);
  const indexB = order.indexOf(b);
  if (indexA !== -1 || indexB !== -1)
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
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

function updateThreePercentRuleButton() {
  const control = elements.threePercentRule?.closest(".rule-toggle");
  if (!control) return;
  const isActive = Boolean(elements.threePercentRule.checked);
  control.classList.toggle("is-active", isActive);
  control.setAttribute("aria-pressed", isActive ? "true" : "false");
}

function renderChecker() {
  const gender = elements.gender.value;
  const key = gender === "women" ? "women" : "men";
  const birthYear = Number(elements.birthYear.value);
  const hasBirthYear =
    Number.isInteger(birthYear) &&
    birthYear > 1900 &&
    birthYear <= QUALIFICATION_YEAR;
  const total = parseLocaleNumber(elements.total.value);
  const hasTotal = Number.isFinite(total) && elements.total.value !== "";
  const useThreePercentRule = elements.threePercentRule.checked;
  const bodyweight = parseLocaleNumber(elements.bodyweight.value);
  const hasBodyweight =
    Number.isFinite(bodyweight) && elements.bodyweight.value !== "";

  if (!hasTotal || !hasBirthYear || !hasBodyweight) {
    elements.checkerSummary.innerHTML = "";
    elements.checkerResults.innerHTML = "";
    return;
  }

  const checkedRows = qualificationData.flatMap((competition) => {
    const competitionAge = getAthleteAgeForCompetition(competition, birthYear);
    if (!isCompetitionAgeEligible(competition, competitionAge)) return [];

    const competitionClasses = uniqueWeightClasses(
      (competition[key] || []).map((row) => getWeightClassKey(row)),
      [],
    );
    const eligibleWeightClasses = getEligibleWeightClasses(
      competitionClasses,
      bodyweight,
      useThreePercentRule,
      settings.threePercentValue,
    );
    const eligibleClassSet = new Set(eligibleWeightClasses);
    if (!eligibleClassSet.size) return [];

    return competition[key]
      .filter((entry) => eligibleClassSet.has(getWeightClassKey(entry)))
      .filter(
        (entry) =>
          !isMastersCompetition(competition) ||
          rowAgeGroupMatches(entry, competitionAge),
      )
      .map((row) => {
        const activeVariant =
          getVisibleRequirementVariantsForCompetition(competition)[0];
        const activeTotal = activeVariant.total(row);
        return {
          competition: competition.name,
          slug: competition.slug,
          group: getCompetitionGroup(competition),
          category: competition.category,
          competitionYear: getCompetitionYear(competition),
          competitionAge,
          ageLabel: isMastersCompetition(competition)
            ? formatAgeGroupLabel(row)
            : getAgeRule(competition)?.label || "",
          row,
          isMasters: isMastersCompetition(competition),
          total,
          activeRequirement: {
            key: activeVariant.key,
            label: activeVariant.label,
            className: activeVariant.className,
            total: activeTotal,
          },
          qualified: Number.isFinite(activeTotal) && total >= activeTotal,
        };
      });
  });

  const qualifiedRows = selectBestQualifiedRows(
    checkedRows.filter((item) => item.qualified),
  ).sort((a, b) => {
    const groupDiff = a.group.order - b.group.order;
    if (groupDiff !== 0) return groupDiff;
    const competitionDiff = competitionOrder(a.slug) - competitionOrder(b.slug);
    if (competitionDiff !== 0) return competitionDiff;
    const ageDiff = (a.row.ageMin ?? 0) - (b.row.ageMin ?? 0);
    if (ageDiff !== 0) return ageDiff;
    const classDiff = weightClassSort(
      getWeightClassKey(a.row),
      getWeightClassKey(b.row),
    );
    if (classDiff !== 0) return classDiff;
    return requirementTitleSort(a.row.title, b.row.title);
  });

  elements.checkerSummary.innerHTML = "";

  if (!checkedRows.length) {
    elements.checkerResults.innerHTML = `<div class="empty-state">Ongar kappingar passa til aldurin hjá hesum lyftara.</div>`;
    return;
  }

  if (!qualifiedRows.length) {
    elements.checkerResults.innerHTML = `<div class="empty-state">Lyftarin hevur ikki klárað nakað úttøkukrav við hesum upplýsingunum.</div>`;
    return;
  }

  const groupedResults = groupQualifiedRows(qualifiedRows);
  if (
    activeResultsGroup !== "all" &&
    !groupedResults.some((group) => group.key === activeResultsGroup)
  ) {
    activeResultsGroup = "all";
  }

  const visibleGroups =
    activeResultsGroup === "all"
      ? groupedResults
      : groupedResults.filter((group) => group.key === activeResultsGroup);

  elements.checkerResults.innerHTML = `
    ${renderResultsTabs(groupedResults, activeResultsGroup)}
    <div class="qualified-groups">
      ${visibleGroups.map((group) => renderQualifiedGroup(group, total)).join("")}
    </div>
  `;

  elements.checkerResults
    .querySelectorAll("[data-results-group]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        activeResultsGroup = button.dataset.resultsGroup;
        renderChecker();
      });
    });
}

function selectBestQualifiedRows(rows) {
  const bestByContext = new Map();

  rows.forEach((item) => {
    const key = [
      item.slug,
      getWeightClassKey(item.row),
      item.row.ageGroup || "",
      item.row.ageMin ?? "",
      item.row.ageMax ?? "",
    ].join("|");

    const currentBest = bestByContext.get(key);
    if (
      !currentBest ||
      requirementTitleSort(item.row.title, currentBest.row.title) < 0
    ) {
      bestByContext.set(key, item);
    }
  });

  return [...bestByContext.values()];
}

function renderResultsTabs(groups, activeKey) {
  const buttons = [
    {
      key: "all",
      label: "Øll",
      count: groups.reduce((sum, group) => {
        return (
          sum +
          group.competitions.reduce(
            (competitionSum, competition) =>
              competitionSum + competition.rows.length,
            0,
          )
        );
      }, 0),
    },
    ...groups.map((group) => ({
      key: group.key,
      label: group.shortLabel,
      fullLabel: group.label,
      count: group.competitions.reduce(
        (sum, competition) => sum + competition.rows.length,
        0,
      ),
    })),
  ];

  return `
    <nav class="results-tabs" aria-label="Úttøkuúrslit eftir kappingarbólki">
      ${buttons
        .map(
          (button) => `
        <button class="results-tab-button${button.key === activeKey ? " active" : ""}" type="button" data-results-group="${escapeAttribute(button.key)}" title="${escapeAttribute(button.fullLabel || button.label)}">
          <span>${escapeHtml(button.label)}</span>
          <strong>${button.count}</strong>
        </button>
      `,
        )
        .join("")}
    </nav>
  `;
}

function getResultsTabTitle(groups, activeKey) {
  if (activeKey === "all") return "Øll klárað úttøkukrøv";
  const group = groups.find((item) => item.key === activeKey);
  return group ? group.label : "Øll klárað úttøkukrøv";
}

function groupQualifiedRows(rows) {
  const groups = [];
  rows.forEach((item) => {
    let group = groups.find((entry) => entry.key === item.group.key);
    if (!group) {
      group = { ...item.group, competitions: [] };
      groups.push(group);
    }

    let competition = group.competitions.find(
      (entry) => entry.slug === item.slug,
    );
    if (!competition) {
      competition = { slug: item.slug, name: item.competition, rows: [] };
      group.competitions.push(competition);
    }

    competition.rows.push(item);
  });

  return groups
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      ...group,
      competitions: group.competitions.sort(
        (a, b) => competitionOrder(a.slug) - competitionOrder(b.slug),
      ),
    }));
}

function renderQualifiedGroup(group, total) {
  return `
    <section class="qualified-group">
      <div class="qualified-group-heading">
        <span>${escapeHtml(group.shortLabel)}</span>
        <h3>${escapeHtml(group.label)}</h3>
      </div>
      <div class="qualified-competition-list">
        ${group.competitions.map((competition) => renderQualifiedCompetition(competition, total)).join("")}
      </div>
    </section>
  `;
}

function renderQualifiedCompetition(competition, total) {
  const showAgeColumn = competition.rows.some((item) => item.row.ageGroup);

  return `
    <article class="qualified-card">
      <div class="qualified-card-header">
        <h4>${escapeHtml(competition.name)}</h4>
        <span>${competition.rows.length} krøv</span>
      </div>
      <div class="qualified-table-wrap">
        <table class="qualified-table">
          <thead>
            <tr>
              ${showAgeColumn ? "<th>Aldursbólkur</th>" : ""}
              <th>Vektflokkur</th>
              <th>Kravstig</th>
              <th>Krav</th>
              <th>Munur</th>
            </tr>
          </thead>
          <tbody>
            ${competition.rows
              .map((item) => {
                const achieved = getAchievedRequirement(item);
                const margin = total - achieved.total;
                return `
                <tr>
                  ${showAgeColumn ? `<td>${escapeHtml(formatAgeGroupLabel(item.row))}</td>` : ""}
                  <td>${formatDisplayWeightClassLabel(item.row)}</td>
                  <td>${escapeHtml(getResultRequirementLevelLabel(item.row))}</td>
                  <td>${formatTotal(achieved.total)} kg</td>
                  <td class="margin-positive">+${formatTotal(margin)} kg</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function getAchievedRequirement(item) {
  if (item.activeRequirement) return item.activeRequirement;
  return getVisibleRequirementVariantsForCompetition(item)[0];
}

function getResultRequirementLevelLabel(row) {
  return row.title && row.title !== "Úttøkukrav" ? row.title : "Minimum krav";
}

function getCompetitionGroup(competitionOrSlug) {
  const competition =
    typeof competitionOrSlug === "string"
      ? qualificationData.find((item) => item.slug === competitionOrSlug) ||
        DEFAULT_QUALIFICATION_DATA.find(
          (item) => item.slug === competitionOrSlug,
        )
      : competitionOrSlug;

  if (competition) {
    return {
      key: competition.groupKey || inferCompetitionGroup(competition).key,
      shortLabel:
        competition.groupShortLabel ||
        inferCompetitionGroup(competition).shortLabel,
      label: competition.groupLabel || inferCompetitionGroup(competition).label,
      order: Number.isFinite(Number(competition.groupOrder))
        ? Number(competition.groupOrder)
        : inferCompetitionGroup(competition).order,
    };
  }

  return inferCompetitionGroup({ slug: String(competitionOrSlug || "") });
}

function competitionOrder(slug) {
  const sources = [];
  if (
    typeof qualificationData !== "undefined" &&
    Array.isArray(qualificationData)
  )
    sources.push(...qualificationData);
  if (Array.isArray(DEFAULT_QUALIFICATION_DATA))
    sources.push(...DEFAULT_QUALIFICATION_DATA);
  const competition = sources.find((item) => item.slug === slug);
  if (competition && Number.isFinite(Number(competition.order)))
    return Number(competition.order);

  const order = [
    "vm-senior",
    "vm-junior",
    "vm-ungdom",
    "em-senior",
    "em-u23",
    "em-junior",
    "em-ungdom-u17",
    "em-ungdom-u15",
    "nm-senior",
    "nordisk-junior",
    "nordisk-ungdom",
  ];
  const index = order.indexOf(slug);
  return index === -1 ? 999 : index + 1;
}

function getAgeRule(competitionOrSlug) {
  const competition =
    typeof competitionOrSlug === "string"
      ? qualificationData.find((item) => item.slug === competitionOrSlug)
      : competitionOrSlug;
  return (
    competition?.ageRule ||
    AGE_RULES[competition?.slug || competitionOrSlug] ||
    null
  );
}

function getCompetitionYear(competition) {
  const year = Number(competition?.competitionYear);
  return Number.isInteger(year) && year >= 1900 ? year : QUALIFICATION_YEAR;
}

function getAthleteAgeForCompetition(competition, birthYear) {
  if (!Number.isInteger(Number(birthYear))) return null;
  return getCompetitionYear(competition) - Number(birthYear);
}

function isCompetitionAgeEligible(competitionOrSlug, age) {
  const competition =
    typeof competitionOrSlug === "string"
      ? qualificationData.find((item) => item.slug === competitionOrSlug)
      : competitionOrSlug;

  if (isMastersCompetition(competition)) {
    return Array.isArray(competition?.men) || Array.isArray(competition?.women)
      ? [...(competition.men || []), ...(competition.women || [])].some((row) =>
          rowAgeGroupMatches(row, age),
        )
      : age >= 35;
  }

  const rule = getAgeRule(competitionOrSlug);
  if (!rule) return true;
  if (rule.min != null && age < rule.min) return false;
  if (rule.max != null && age > rule.max) return false;
  return true;
}

function isMastersCompetition(competition) {
  if (!competition) return false;
  return (
    competition.type === "masters" ||
    getAgeRule(competition)?.label === "Masters"
  );
}

function rowAgeGroupMatches(row, age) {
  if (!Number.isFinite(age)) return false;
  const min = Number.isFinite(Number(row.ageMin))
    ? Number(row.ageMin)
    : parseAgeGroupMin(row.ageGroup, 35);
  const max =
    row.ageMax === null || row.ageMax === undefined || row.ageMax === ""
      ? null
      : Number(row.ageMax);
  if (Number.isFinite(min) && age < min) return false;
  if (Number.isFinite(max) && age > max) return false;
  return true;
}

function formatAgeGroupLabel(row) {
  const label = row.ageGroup || "Masters";
  const min = Number.isFinite(Number(row.ageMin)) ? Number(row.ageMin) : null;
  const max =
    row.ageMax === null || row.ageMax === undefined || row.ageMax === ""
      ? null
      : Number(row.ageMax);
  if (min == null && !Number.isFinite(max)) return label;
  if (Number.isFinite(max)) return `${label} (${min}-${max})`;
  return `${label} (${min}+)`;
}

function parseAgeGroupMin(label, fallback = 35) {
  const match = String(label || "").match(/(\d+)/);
  return match ? Number(match[1]) : fallback;
}

function parseAgeGroupMax(label, min) {
  const lower = String(label || "").toLowerCase();
  if (lower.includes("+")) return null;
  const safeMin = Number.isFinite(Number(min))
    ? Number(min)
    : parseAgeGroupMin(label, 35);
  return safeMin + 4;
}

function slugify(value) {
  return (
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ð/g, "d")
      .replace(/ø/g, "o")
      .replace(/æ/g, "ae")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "nyggj"
  );
}

function uniqueSlug(base) {
  const cleanBase = slugify(base);
  let slug = cleanBase;
  let counter = 2;
  while (qualificationData.some((competition) => competition.slug === slug)) {
    slug = `${cleanBase}-${counter}`;
    counter += 1;
  }
  return slug;
}

function uniqueGroupKey(base) {
  const cleanBase = slugify(base || "bolkur");
  let key = cleanBase;
  let counter = 2;
  const existingKeys = new Set(
    getCompetitionGroups().map((group) => group.key),
  );
  while (existingKeys.has(key)) {
    key = `${cleanBase}-${counter}`;
    counter += 1;
  }
  return key;
}

function openAddCompetitionDialog(
  mode = "new-group",
  groupKey = "",
  competitionSlug = "",
) {
  addCompetitionState = { mode, groupKey, competitionSlug };
  const competitionToEdit =
    mode === "edit-competition"
      ? qualificationData.find(
          (competition) => competition.slug === competitionSlug,
        )
      : null;
  const existingGroup =
    mode === "existing-group"
      ? getCompetitionGroups().find((group) => group.key === groupKey)
      : competitionToEdit
        ? getCompetitionGroup(competitionToEdit)
        : null;
  const isEditMode = Boolean(competitionToEdit);

  elements.addCompetitionTitle.textContent = isEditMode
    ? "Broyt kapping"
    : existingGroup
      ? `Stovna kapping í ${existingGroup.label}`
      : "Stovna nýggjan bólk og kapping";
  if (elements.addCompetitionNote) {
    elements.addCompetitionNote.textContent = isEditMode
      ? "Broytingarnar verða goymdar í hesi kappingini."
      : existingGroup
        ? `Kappingin verður løgd afturat ${existingGroup.label}.`
        : "Bólkurin og kappingin verða goymd í hesum kagaranum.";
  }
  elements.createCompetitionButton.textContent = isEditMode
    ? "Goym broytingar"
    : "Stovna kapping";
  elements.deleteCompetitionInModal?.classList.toggle("is-hidden", !isEditMode);
  elements.addCompetitionDialog.classList.toggle("wide", isEditMode);
  elements.addCompetitionForm.classList.toggle("has-totals-editor", isEditMode);
  elements.newGroupFields.classList.toggle("is-hidden", Boolean(existingGroup));

  elements.newGroupName.value = "";
  elements.newGroupShortLabel.value = "";
  elements.newCompetitionName.value = competitionToEdit?.name || "";
  if (elements.newCompetitionYear) {
    elements.newCompetitionYear.value =
      competitionToEdit?.competitionYear || QUALIFICATION_YEAR;
  }

  const typeChoice = competitionToEdit
    ? getCompetitionTypeChoice(competitionToEdit)
    : "senior";
  setSingleChoice(elements.competitionTypeChoices, typeChoice);
  setRequirementLevels(
    competitionToEdit
      ? getRequirementTitles(competitionToEdit)
      : ["Úttøkukrav"],
  );
  renderMastersAgeChoices(
    competitionToEdit ? getMastersAgeGroups(competitionToEdit) : null,
  );
  updateMastersAgeVisibility();
  renderEditCompetitionTotalsEditor();
  elements.addCompetitionDialog.showModal();
}

function renderMastersAgeChoices(selectedGroups = null) {
  const selectedKeys =
    selectedGroups && selectedGroups.length
      ? new Set(
          selectedGroups
            .map((group) => String(group.label || group.ageGroup || "").trim())
            .filter(Boolean),
        )
      : null;
  elements.mastersAgeChoices.innerHTML = DEFAULT_MASTERS_AGE_OPTIONS.map(
    (group, index) => {
      const active = selectedKeys ? selectedKeys.has(group.label) : true;
      return `
      <button
        type="button"
        class="choice-button${active ? " active" : ""}"
        data-choice="mastersAge"
        data-label="${escapeAttribute(group.label)}"
        data-min="${escapeAttribute(group.min)}"
        data-max="${escapeAttribute(group.max ?? "")}"
      >
        ${escapeHtml(group.label)}
      </button>
    `;
    },
  ).join("");
}

function updateMastersAgeVisibility() {
  const type = getActiveChoice(elements.competitionTypeChoices) || "senior";
  elements.mastersAgeChoicesPanel.classList.toggle(
    "is-hidden",
    type !== "masters",
  );
}

function setSingleChoice(container, value) {
  container.querySelectorAll(".choice-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.value === value);
  });
}

function getActiveChoice(container) {
  return container.querySelector(".choice-button.active")?.dataset.value || "";
}

function setRequirementLevels(levels) {
  const selected = new Set(levels && levels.length ? levels : ["Úttøkukrav"]);
  elements.requirementLevelChoices
    .querySelectorAll(".choice-button")
    .forEach((button) => {
      button.classList.toggle("active", selected.has(button.dataset.value));
    });
  updateRequirementLevelAvailability();
}

function toggleRequirementLevel(value) {
  const buttons = [
    ...elements.requirementLevelChoices.querySelectorAll(".choice-button"),
  ];
  const isActive = (level) =>
    buttons.some(
      (button) =>
        button.dataset.value === level && button.classList.contains("active"),
    );

  if (value === "Úttøkukrav") {
    setRequirementLevels(["Úttøkukrav"]);
    return;
  }

  let selected = buttons
    .filter(
      (button) =>
        button.dataset.value !== "Úttøkukrav" &&
        button.classList.contains("active"),
    )
    .map((button) => button.dataset.value);

  if (value === "A-krav") {
    selected = isActive("A-krav") ? [] : ["A-krav"];
  }

  if (value === "B-krav") {
    if (!isActive("A-krav")) return;
    selected = isActive("B-krav") ? ["A-krav"] : ["A-krav", "B-krav"];
  }

  if (value === "C-krav") {
    if (!isActive("A-krav") || !isActive("B-krav")) return;
    selected = isActive("C-krav")
      ? ["A-krav", "B-krav"]
      : ["A-krav", "B-krav", "C-krav"];
  }

  setRequirementLevels(selected.length ? selected : ["Úttøkukrav"]);
}

function updateRequirementLevelAvailability() {
  const buttons = [
    ...elements.requirementLevelChoices.querySelectorAll(".choice-button"),
  ];
  const selected = new Set(
    buttons
      .filter((button) => button.classList.contains("active"))
      .map((button) => button.dataset.value),
  );
  buttons.forEach((button) => {
    const value = button.dataset.value;
    let disabled = false;
    if (value === "B-krav") disabled = !selected.has("A-krav");
    if (value === "C-krav")
      disabled = !selected.has("A-krav") || !selected.has("B-krav");
    button.disabled = disabled;
    button.classList.toggle("is-disabled", disabled);
  });
}

function getSelectedRequirementLevels() {
  const selected = [
    ...elements.requirementLevelChoices.querySelectorAll(
      ".choice-button.active",
    ),
  ]
    .map((button) => button.dataset.value)
    .filter(Boolean);
  if (!selected.length) return ["Úttøkukrav"];
  if (selected.includes("Úttøkukrav")) return ["Úttøkukrav"];
  return ADD_REQUIREMENT_LEVELS.filter((level) => selected.includes(level));
}

function syncEditModalRequirementLevels() {
  if (
    addCompetitionState.mode !== "edit-competition" ||
    !addCompetitionState.competitionSlug
  )
    return;

  const competition = qualificationData.find(
    (item) => item.slug === addCompetitionState.competitionSlug,
  );
  if (!competition) return;

  const levels = getSelectedRequirementLevels();
  const competitionType = isMastersCompetition(competition)
    ? "masters"
    : competition.type || "standard";
  const mastersAgeGroups =
    competitionType === "masters" ? getMastersAgeGroups(competition) : [];
  const menClasses = uniqueWeightClasses(
    (competition.men || []).map((row) => row.weightClass),
    ["60", "65", "71", "79", "88", "94", "110", "110+"],
  );
  const womenClasses = uniqueWeightClasses(
    (competition.women || []).map((row) => row.weightClass),
    ["48", "53", "58", "63", "69", "77", "86", "86+"],
  );

  competition.men = rebuildRowsForCompetition(
    competition,
    "men",
    competitionType,
    menClasses,
    levels,
    mastersAgeGroups,
  );
  competition.women = rebuildRowsForCompetition(
    competition,
    "women",
    competitionType,
    womenClasses,
    levels,
    mastersAgeGroups,
  );

  activeTotalsRequirementTitle = levels.length > 1 ? levels[0] : "";
  saveQualificationData(qualificationData);
  renderEditCompetitionTotalsEditor();
  renderCompetition();
  renderChecker();
}

function getSelectedMastersAgeGroups() {
  const selected = [
    ...elements.mastersAgeChoices.querySelectorAll(".choice-button.active"),
  ]
    .map((button) => ({
      label: button.dataset.label,
      min: Number(button.dataset.min),
      max: button.dataset.max === "" ? null : Number(button.dataset.max),
    }))
    .filter((group) => group.label && Number.isFinite(group.min));
  return selected.length ? selected : [DEFAULT_MASTERS_AGE_OPTIONS[0]];
}

function getCompetitionTypeChoice(competition) {
  if (!competition) return "senior";
  if (competition.type === "masters" || isMastersCompetition(competition))
    return "masters";
  const rule = getAgeRule(competition) || competition.ageRule || {};
  const label = String(rule.label || "").toLowerCase();
  if (label === "u15" || Number(rule.max) === 15) return "u15";
  if (
    label === "u17" ||
    (Number(rule.max) === 17 && Number(rule.min) === 13) ||
    label === "ung"
  )
    return "ung";
  if (label === "junior" || Number(rule.max) === 20) return "junior";
  if (label === "u23" || Number(rule.max) === 23) return "u23";
  if (label === "open" || (rule.min == null && rule.max == null)) return "open";
  return "senior";
}

function getTotalsMap(rows) {
  const map = new Map();
  (rows || []).forEach((row) => {
    const ageKey = [
      row.ageGroup || "",
      row.ageMin ?? "",
      row.ageMax ?? "",
    ].join("|");
    const key = [
      ageKey,
      getWeightClassKey(row),
      row.title || "Úttøkukrav",
    ].join("||");
    map.set(
      key,
      Number.isFinite(Number(row.original))
        ? Math.round(Number(row.original))
        : 0,
    );
  });
  return map;
}

function getMatchingOriginal(map, row) {
  const ageKey = [row.ageGroup || "", row.ageMin ?? "", row.ageMax ?? ""].join(
    "|",
  );
  const weightKey = getWeightClassKey(row);
  const title = row.title || "Úttøkukrav";
  const exactKey = [ageKey, weightKey, title].join("||");
  if (map.has(exactKey)) return map.get(exactKey);

  const emptyAgeExactKey = ["", weightKey, title].join("||");
  if (map.has(emptyAgeExactKey)) return map.get(emptyAgeExactKey);

  // When changing from one common requirement to A/B/C, the existing values become A-krav.
  if (title === "A-krav") {
    const oldSingleKey = [ageKey, weightKey, "Úttøkukrav"].join("||");
    if (map.has(oldSingleKey)) return map.get(oldSingleKey);
    const oldSingleEmptyAgeKey = ["", weightKey, "Úttøkukrav"].join("||");
    if (map.has(oldSingleEmptyAgeKey)) return map.get(oldSingleEmptyAgeKey);
  }

  // When changing from A/B/C back to one common requirement, keep the A-krav values.
  if (title === "Úttøkukrav") {
    const oldAKey = [ageKey, weightKey, "A-krav"].join("||");
    if (map.has(oldAKey)) return map.get(oldAKey);
    const oldAEmptyAgeKey = ["", weightKey, "A-krav"].join("||");
    if (map.has(oldAEmptyAgeKey)) return map.get(oldAEmptyAgeKey);
  }

  return 0;
}
function rebuildRowsForCompetition(
  existingCompetition,
  genderKey,
  competitionType,
  classes,
  levels,
  mastersAgeGroups,
) {
  const oldTotals = getTotalsMap(existingCompetition?.[genderKey] || []);
  const rows =
    competitionType === "masters"
      ? buildMastersRows(classes, levels, mastersAgeGroups)
      : buildRows(classes, levels);
  return rows.map((row) => ({
    ...row,
    original: getMatchingOriginal(oldTotals, row),
  }));
}

function createCompetitionFromDialog() {
  const isNewGroup = addCompetitionState.mode === "new-group";
  const isEditMode = addCompetitionState.mode === "edit-competition";
  const existingCompetition = isEditMode
    ? qualificationData.find(
        (competition) =>
          competition.slug === addCompetitionState.competitionSlug,
      )
    : null;
  let group = null;

  if (isNewGroup) {
    const groupName = elements.newGroupName.value.trim();
    if (!groupName) {
      elements.newGroupName.focus();
      return;
    }
    const shortLabel = (
      elements.newGroupShortLabel.value.trim() ||
      suggestShortLabel(groupName) ||
      groupName.slice(0, 3).toUpperCase()
    ).trim();
    const existingGroups = getCompetitionGroups();
    group = {
      key: uniqueGroupKey(shortLabel || groupName),
      shortLabel,
      label: groupName,
      order: existingGroups.length
        ? Math.max(...existingGroups.map((item) => item.order)) + 1
        : 1,
    };
  } else if (isEditMode && existingCompetition) {
    group = getCompetitionGroup(existingCompetition);
  } else {
    group = getCompetitionGroups().find(
      (item) => item.key === addCompetitionState.groupKey,
    );
  }

  if (!group) return;

  const competitionName = elements.newCompetitionName.value.trim();
  if (!competitionName) {
    elements.newCompetitionName.focus();
    return;
  }

  const competitionYear =
    elements.newCompetitionYear &&
    Number.isFinite(Number(elements.newCompetitionYear.value))
      ? Math.round(Number(elements.newCompetitionYear.value))
      : QUALIFICATION_YEAR;
  const typeChoice =
    getActiveChoice(elements.competitionTypeChoices) || "senior";
  const typePreset =
    ADD_COMPETITION_TYPES[typeChoice] || ADD_COMPETITION_TYPES.senior;
  const competitionType = typePreset.type;
  const ageCategoryChoice = typePreset.ageCategory || "senior";
  const levels = getSelectedRequirementLevels();
  const mastersAgeGroups =
    competitionType === "masters" ? getSelectedMastersAgeGroups() : [];

  const reference =
    existingCompetition ||
    qualificationData.find(
      (competition) =>
        competition.groupKey === group.key &&
        competition.type === competitionType,
    ) ||
    qualificationData.find(
      (competition) => competition.groupKey === group.key,
    ) ||
    qualificationData[0];
  const menClasses = uniqueWeightClasses(
    reference?.men?.map((row) => row.weightClass),
    ["60", "65", "71", "79", "88", "94", "110", "110+"],
  );
  const womenClasses = uniqueWeightClasses(
    reference?.women?.map((row) => row.weightClass),
    ["48", "53", "58", "63", "69", "77", "86", "86+"],
  );
  const orderBase = qualificationData.length
    ? Math.max(...qualificationData.map((item) => Number(item.order) || 0)) + 1
    : 1;
  const ageRule =
    competitionType === "masters"
      ? { ...AGE_PRESETS.masters }
      : { ...(AGE_PRESETS[ageCategoryChoice] || AGE_PRESETS.senior) };

  if (isEditMode && existingCompetition) {
    const updatedCompetition = {
      ...existingCompetition,
      name: competitionName,
      category:
        competitionType === "masters"
          ? `${group.label} · Masters`
          : group.label,
      groupKey: group.key,
      groupShortLabel: group.shortLabel,
      groupLabel: group.label,
      groupOrder: group.order,
      competitionYear,
      type: competitionType,
      ageRule,
      men: rebuildRowsForCompetition(
        existingCompetition,
        "men",
        competitionType,
        menClasses,
        levels,
        mastersAgeGroups,
      ),
      women: rebuildRowsForCompetition(
        existingCompetition,
        "women",
        competitionType,
        womenClasses,
        levels,
        mastersAgeGroups,
      ),
    };

    qualificationData = normalizeQualificationData(
      qualificationData.map((competition) =>
        competition.slug === existingCompetition.slug
          ? updatedCompetition
          : competition,
      ),
    );
    activeCompetitionSlug = existingCompetition.slug;
    activeTotalsCompetitionSlug = existingCompetition.slug;
    activeTotalsRequirementTitle = levels.length > 1 ? levels[0] : "";
    activeTotalsMastersAgeGroupKey[existingCompetition.slug] = "";
  } else {
    const newCompetition = {
      name: competitionName,
      slug: uniqueSlug(`${group.shortLabel}-${competitionName}`),
      category:
        competitionType === "masters"
          ? `${group.label} · Masters`
          : group.label,
      groupKey: group.key,
      groupShortLabel: group.shortLabel,
      groupLabel: group.label,
      groupOrder: group.order,
      competitionYear,
      order: orderBase,
      type: competitionType,
      ageRule,
      displayOptions: { active: "original" },
      men:
        competitionType === "masters"
          ? buildMastersRows(menClasses, levels, mastersAgeGroups)
          : buildRows(menClasses, levels),
      women:
        competitionType === "masters"
          ? buildMastersRows(womenClasses, levels, mastersAgeGroups)
          : buildRows(womenClasses, levels),
    };

    qualificationData.push(newCompetition);
    qualificationData = normalizeQualificationData(qualificationData);
    activeCompetitionSlug = newCompetition.slug;
    activeTotalsCompetitionSlug = newCompetition.slug;
    activeTotalsRequirementTitle = levels.length > 1 ? levels[0] : "";
  }

  saveQualificationData(qualificationData);
  renderTabs();
  renderTotalsEditor();
  renderEditCompetitionTotalsEditor();
  renderCompetition();
  renderChecker();
  elements.addCompetitionDialog.close();
}

function deleteActiveCompetitionFromModal() {
  if (
    addCompetitionState.mode !== "edit-competition" ||
    !addCompetitionState.competitionSlug
  )
    return;
  const slug = addCompetitionState.competitionSlug;
  const competition = qualificationData.find((item) => item.slug === slug);
  if (!competition) return;

  const wasDeleted = deleteCompetition(slug);
  if (wasDeleted) {
    elements.addCompetitionDialog.close();
  }
}

function deleteCompetition(slug) {
  const competition = qualificationData.find((item) => item.slug === slug);
  if (!competition) return false;

  if (qualificationData.length <= 1) {
    window.alert("Tað ber ikki til at strika seinastu kappingina.");
    return false;
  }

  const confirmed = window.confirm(
    `Vilt tú strika kappingina "${competition.name}"? Hetta kann ikki angrast.`,
  );
  if (!confirmed) return false;

  qualificationData = normalizeQualificationData(
    qualificationData.filter((item) => item.slug !== slug),
  );
  if (activeCompetitionSlug === slug)
    activeCompetitionSlug = qualificationData[0]?.slug || "";
  if (activeTotalsCompetitionSlug === slug)
    activeTotalsCompetitionSlug = qualificationData[0]?.slug || "";
  delete activeRequirementFilters[slug];
  delete activeTotalsMastersAgeGroupKey[slug];

  saveQualificationData(qualificationData);
  renderTabs();
  renderTotalsEditor();
  renderEditCompetitionTotalsEditor();
  renderCompetition();
  renderChecker();
  return true;
}

function openEditGroupDialog(groupKey) {
  const group = getCompetitionGroups().find((item) => item.key === groupKey);
  if (!group || !elements.editGroupDialog) return;

  editGroupState = { groupKey };
  elements.editGroupName.value = group.label || "";
  elements.editGroupShortLabel.value = group.shortLabel || "";
  elements.editGroupDialog.showModal();
}

function saveGroupFromDialog() {
  const groupKey = editGroupState.groupKey;
  const group = getCompetitionGroups().find((item) => item.key === groupKey);
  if (!group) return;

  const label = elements.editGroupName.value.trim();
  if (!label) {
    elements.editGroupName.focus();
    return;
  }

  const shortLabel = (
    elements.editGroupShortLabel.value.trim() ||
    suggestShortLabel(label) ||
    group.shortLabel ||
    label.slice(0, 3).toUpperCase()
  ).trim();

  qualificationData = normalizeQualificationData(
    qualificationData.map((competition) => {
      if (competition.groupKey !== groupKey) return competition;
      return {
        ...competition,
        groupLabel: label,
        groupShortLabel: shortLabel,
        category: competition.type === "masters" ? `${label} · Masters` : label,
      };
    }),
  );

  saveQualificationData(qualificationData);
  renderTabs();
  renderTotalsEditor();
  renderEditCompetitionTotalsEditor();
  renderCompetition();
  renderChecker();
  elements.editGroupDialog.close();
}

function deleteCompetitionGroup(groupKey) {
  const group = getCompetitionGroups().find((item) => item.key === groupKey);
  if (!group) return;

  const competitionsInGroup = qualificationData.filter(
    (competition) => competition.groupKey === groupKey,
  );
  if (!competitionsInGroup.length) return;

  if (competitionsInGroup.length >= qualificationData.length) {
    window.alert("Tað ber ikki til at strika seinasta kappingarbólkin.");
    return;
  }

  const confirmed = window.confirm(
    `Vilt tú strika bólkin "${group.label}" og allar ${competitionsInGroup.length} kappingarnar í bólkinum? Hetta kann ikki angrast.`,
  );
  if (!confirmed) return;

  const removedSlugs = new Set(
    competitionsInGroup.map((competition) => competition.slug),
  );
  qualificationData = normalizeQualificationData(
    qualificationData.filter(
      (competition) => competition.groupKey !== groupKey,
    ),
  );

  if (removedSlugs.has(activeCompetitionSlug))
    activeCompetitionSlug = qualificationData[0]?.slug || "";
  if (removedSlugs.has(activeTotalsCompetitionSlug))
    activeTotalsCompetitionSlug = qualificationData[0]?.slug || "";
  removedSlugs.forEach((slug) => {
    delete activeRequirementFilters[slug];
    delete activeTotalsMastersAgeGroupKey[slug];
  });
  if (activeResultsGroup === groupKey) activeResultsGroup = "all";

  saveQualificationData(qualificationData);
  renderTabs();
  renderTotalsEditor();
  renderEditCompetitionTotalsEditor();
  renderCompetition();
  renderChecker();
}

function suggestShortLabel(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
}

function chooseAgeRule() {
  return { ...AGE_PRESETS.senior };
}

function promptMastersAgeGroups() {
  return DEFAULT_MASTERS_AGE_OPTIONS.map((group) => ({ ...group }));
}

function parseMastersAgeGroup(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const [labelPart, rangePart] = raw.includes(":")
    ? raw.split(":")
    : [raw, raw];
  const label = labelPart.trim() || "Masters";
  const range = String(rangePart || "").trim();
  const plusMatch = range.match(/(\d+)\s*\+/);
  if (plusMatch) return { label, min: Number(plusMatch[1]), max: null };
  const rangeMatch = range.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch)
    return { label, min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  const min = parseAgeGroupMin(label, 35);
  return { label, min, max: parseAgeGroupMax(label, min) };
}

function uniqueWeightClasses(classes, fallback) {
  const source = Array.isArray(classes) && classes.length ? classes : fallback;
  return [
    ...new Set(source.map((item) => getWeightClassKey(item)).filter(Boolean)),
  ].sort(weightClassSort);
}

function buildRows(classes, levels) {
  return classes.flatMap((weightClass) =>
    levels.map((title) => ({
      weightClass: cleanWeightClass(
        weightClass,
        weightClass,
        isPlusWeightClass(weightClass),
      ),
      isPlus: isPlusWeightClass(weightClass),
      title,
      original: 0,
    })),
  );
}

function buildMastersRows(classes, levels, ageGroups) {
  return ageGroups.flatMap((ageGroup) => {
    return classes.flatMap((weightClass) =>
      levels.map((title) => ({
        ageGroup: ageGroup.label,
        ageMin: ageGroup.min,
        ageMax: ageGroup.max,
        weightClass: cleanWeightClass(
          weightClass,
          weightClass,
          isPlusWeightClass(weightClass),
        ),
        isPlus: isPlusWeightClass(weightClass),
        title,
        original: 0,
      })),
    );
  });
}

function parseWeightClassLimit(value) {
  const rawValue =
    typeof value === "object" && value !== null ? value.weightClass : value;
  const weightClass = cleanWeightClass(
    rawValue,
    rawValue || "",
    isPlusWeightClass(value),
  );
  const number = Number(String(weightClass).replace("+", ""));
  return Number.isFinite(number) ? number : NaN;
}

function cleanWeightClass(value, fallback = "", forcePlus = false) {
  const raw = String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");
  if (!raw) return String(fallback || "");

  const typedPlus = raw.endsWith("+");
  const numericPart = typedPlus ? raw.slice(0, -1) : raw;
  const number = Number(numericPart);

  if (!Number.isFinite(number) || number <= 0) {
    return String(fallback || "");
  }

  const normalizedNumber = Number.isInteger(number)
    ? String(number)
    : String(number).replace(/\.0+$/, "");
  return forcePlus || typedPlus ? `${normalizedNumber}+` : normalizedNumber;
}

function formatWeightClassInputValue(rowOrValue) {
  const value =
    typeof rowOrValue === "object" && rowOrValue !== null
      ? rowOrValue.weightClass
      : rowOrValue;
  const number = parseWeightClassLimit(rowOrValue);
  if (Number.isFinite(number)) return String(number).replace(/\.0+$/, "");
  return cleanWeightClass(value, value || "", false).replace("+", "");
}

function formatWeightClassLabel(value) {
  const isPlus = isPlusWeightClass(value);
  const weightClass = cleanWeightClass(
    typeof value === "object" && value !== null ? value.weightClass : value,
    value,
    isPlus,
  );
  if (!weightClass) return "—";
  return `${escapeHtml(weightClass)} kg`;
}

function formatDisplayWeightClassLabel(value) {
  const isPlus = isPlusWeightClass(value);
  const weightClass = cleanWeightClass(
    typeof value === "object" && value !== null ? value.weightClass : value,
    value,
    isPlus,
  );
  if (!weightClass) return "—";
  const number = String(weightClass).replace("+", "");
  const prefix = isPlus ? "" : "-";
  const suffix = isPlus ? "+" : "";
  return `${prefix}${escapeHtml(number)}${suffix} kg`;
}

function parseLocaleNumber(value) {
  if (value == null) return NaN;
  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) return NaN;
  return Number(normalized);
}

function getAvailableWeightClasses(key) {
  const classes = [
    ...new Set(
      qualificationData.flatMap((competition) =>
        competition[key].map((row) => getWeightClassKey(row)),
      ),
    ),
  ];
  return classes.sort(weightClassSort);
}

function getEligibleWeightClasses(
  classes,
  bodyweight,
  useThreePercentRule,
  rulePercentage = DEFAULT_SETTINGS.threePercentValue,
) {
  if (!Number.isFinite(bodyweight) || bodyweight <= 0) return [];

  const sortedClasses = uniqueWeightClasses(classes, []).sort(weightClassSort);
  const regularClasses = sortedClasses
    .filter((weightClass) => !isPlusWeightClass(weightClass))
    .map((weightClass) => ({
      weightClass,
      limit: parseWeightClassLimit(weightClass),
    }))
    .filter((item) => Number.isFinite(item.limit))
    .sort((a, b) => a.limit - b.limit);

  const multiplier = useThreePercentRule
    ? 1 +
      cleanPercentage(rulePercentage, DEFAULT_SETTINGS.threePercentValue) / 100
    : 1;
  const lowestMatch = regularClasses.find(
    (item) => bodyweight <= item.limit * multiplier,
  );

  if (lowestMatch) {
    const startIndex = sortedClasses.indexOf(lowestMatch.weightClass);
    return sortedClasses.slice(startIndex);
  }

  const plusClass = sortedClasses.find((weightClass) =>
    isPlusWeightClass(weightClass),
  );
  return plusClass ? [plusClass] : [];
}

function isPlusWeightClass(value) {
  if (typeof value === "object" && value !== null)
    return (
      Boolean(value.isPlus) ||
      String(value.weightClass || "")
        .trim()
        .includes("+")
    );
  return String(value || "")
    .trim()
    .includes("+");
}

function getWeightClassKey(rowOrValue) {
  if (typeof rowOrValue === "object" && rowOrValue !== null) {
    return cleanWeightClass(
      rowOrValue.weightClass,
      rowOrValue.weightClass || "",
      isPlusWeightClass(rowOrValue),
    );
  }
  return cleanWeightClass(
    rowOrValue,
    rowOrValue || "",
    isPlusWeightClass(rowOrValue),
  );
}

function formatBodyweight(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return number.toFixed(1).replace(".", ",");
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
  if (passed)
    return `<span class="badge success">Kláraði ${escapeHtml(passText)}</span>`;
  return `<span class="badge neutral">${escapeHtml(failText)}</span>`;
}

function getBestStatus(item) {
  if (item.madeOriginal) return { text: "Klárað", className: "success" };
  if (item.madeFirstAdjusted || item.madeSecondAdjusted)
    return { text: "Lækkað krav", className: "warning" };
  return { text: "Ikki enn", className: "neutral" };
}

function adjustedTotal(original, percentage) {
  return Math.floor(original * (1 - percentage / 100));
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
  const keyA = getWeightClassKey(a);
  const keyB = getWeightClassKey(b);
  const numberA = Number(String(keyA).replace("+", ""));
  const numberB = Number(String(keyB).replace("+", ""));
  if (numberA !== numberB) return numberA - numberB;
  if (isPlusWeightClass(keyA) === isPlusWeightClass(keyB)) return 0;
  return isPlusWeightClass(keyA) ? 1 : -1;
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
