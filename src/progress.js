// ═══════════════════════════════════════════════════════════════
// progress.js — Academy Progress System (Faz 1)
// localStorage-backed progress tracking for modules & quizzes
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "otomata_progress";
const TRACE_KEY = "otomata_trace_progress";

// Module prerequisites map
const PREREQS = {
  m0: [],
  m1: ["m0"],
  m2: ["m1"],
  m3: ["m1","m2"],
  m4: ["m1","m2","m3"],
  m5: ["m1","m2","m3","m4"],
};

// Quiz counts per module
const QUIZ_TOTALS = { m0:4, m1:5, m2:4, m3:8, m4:4, m5:4 };
const PASS_THRESHOLD = 0.6; // 60% to unlock next module

// ── Load / Save ──────────────────────────────────────────────
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

function save(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch(e) {}
}

// ── Initialize default progress ──────────────────────────────
export function initProgress() {
  const existing = load();
  if(existing && existing.modules) return existing;

  const modules = {};
  Object.keys(PREREQS).forEach(id => {
    modules[id] = {
      unlocked: id === "m0", // only m0 starts unlocked
      quizAnswers: {},       // { questionIndex: chosenOption }
      quizCorrect: 0,
      quizTotal: QUIZ_TOTALS[id] || 0,
      completed: false,
      sectionsRead: {},      // { sectionIndex: true }
      tracesDone: {},        // { traceId: {correct, total} }
    };
  });

  const progress = { modules, totalQuizCorrect: 0, totalQuizCount: 0, version: 1 };
  save(progress);
  return progress;
}

// ── Get progress ─────────────────────────────────────────────
export function getProgress() {
  return load() || initProgress();
}

// ── Record quiz answer ───────────────────────────────────────
export function recordQuizAnswer(moduleId, questionIndex, chosenOption, correctOption) {
  const p = getProgress();
  const mod = p.modules[moduleId];
  if(!mod) return p;

  // Don't re-record if already answered correctly
  if(mod.quizAnswers[questionIndex] === correctOption) return p;

  const wasCorrect = mod.quizAnswers[questionIndex] === correctOption;
  mod.quizAnswers[questionIndex] = chosenOption;

  // Recount correct answers
  mod.quizCorrect = Object.entries(mod.quizAnswers)
    .filter(([_,v]) => v === parseInt(Object.keys(mod.quizAnswers).find(k => mod.quizAnswers[k] === v) !== undefined ? v : -1))
    .length;

  // Actually, just count how many match correct
  // We need the quiz data to know correct answers - handle this in the component
  save(p);
  return p;
}

// ── Update quiz score directly (called from component) ───────
export function updateQuizScore(moduleId, correctCount, totalCount) {
  const p = getProgress();
  const mod = p.modules[moduleId];
  if(!mod) return p;

  mod.quizCorrect = correctCount;
  mod.quizTotal = totalCount;
  mod.completed = correctCount >= totalCount;

  // Recalculate unlocks
  recalcUnlocks(p);

  // Recalculate totals
  p.totalQuizCorrect = Object.values(p.modules).reduce((s,m) => s + m.quizCorrect, 0);
  p.totalQuizCount = Object.values(p.modules).reduce((s,m) => s + m.quizTotal, 0);

  save(p);
  return p;
}

// ── Record section read ──────────────────────────────────────
export function recordSectionRead(moduleId, sectionIndex) {
  const p = getProgress();
  const mod = p.modules[moduleId];
  if(!mod) return p;
  mod.sectionsRead[sectionIndex] = true;
  save(p);
  return p;
}

// ── Record trace exercise ────────────────────────────────────
export function recordTrace(moduleId, traceId, correct, total) {
  const p = getProgress();
  const mod = p.modules[moduleId];
  if(!mod) return p;
  mod.tracesDone[traceId] = { correct, total };
  save(p);
  return p;
}

// ── Recalculate which modules are unlocked ───────────────────
function recalcUnlocks(p) {
  Object.keys(PREREQS).forEach(id => {
    if(id === "m0") { p.modules[id].unlocked = true; return; }
    const prereqs = PREREQS[id];
    const allPrereqsMet = prereqs.every(pid => {
      const pm = p.modules[pid];
      return pm && pm.quizTotal > 0 && (pm.quizCorrect / pm.quizTotal) >= PASS_THRESHOLD;
    });
    p.modules[id].unlocked = allPrereqsMet;
  });
}

// ── Check if module is unlocked ──────────────────────────────
export function isUnlocked(moduleId) {
  const p = getProgress();
  return p.modules[moduleId]?.unlocked ?? false;
}

// ── Get module status: locked | started | completed ──────────
export function getModuleStatus(moduleId) {
  const p = getProgress();
  const mod = p.modules[moduleId];
  if(!mod) return "locked";
  if(!mod.unlocked) return "locked";
  if(mod.completed) return "completed";
  if(Object.keys(mod.quizAnswers).length > 0 || Object.keys(mod.sectionsRead).length > 0) return "started";
  return "unlocked";
}

// ── Reset all progress ───────────────────────────────────────
export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TRACE_KEY);
  return initProgress();
}

export { PREREQS, QUIZ_TOTALS, PASS_THRESHOLD };
