import React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ─── Core Framework ──────────────────────────────────────────────
import { LangContext, useLang, tx, UI, u } from './core/i18n';
import { initGA, trackNav, trackTab, trackLang, trackComplete, trackLab } from './core/analytics';

// ─── Utils ───────────────────────────────────────────────────────
import { gauss, softmax, softmaxArr, rmsnorm, matmul, relu2, smpl } from './utils/math';
import { NAMES, CHARS, VOCAB, stoi, itos, BOS, EOS, createModel, fwd } from './utils/model';

// ─── Shared Components ───────────────────────────────────────────
import { Spark, InfoCard, ProbDist, AttnMat, MLPViz, EmbedViz, Pipeline, CodeBlock, DimFlow, VB, VizBox, FlowArrow, FlowBox, StatBox } from './components/SharedComponents';

// ─── Lecture Data ────────────────────────────────────────────────
import { WEEKS } from './lectures/microgpt/data/weeks';
import { ARCH_STEPS } from './lectures/microgpt/data/archSteps';
import { SECTION_EXTRAS } from './lectures/microgpt/data/extras';
import { QUIZZES, COMMON_MISTAKES } from './lectures/microgpt/data/quizzes';
import { GLOSSARY } from './lectures/microgpt/data/glossary';
import { EN_CONTENT } from './lectures/microgpt/data/enContent';
import { getComparisons } from './lectures/microgpt/data/comparisons';
import { RESOURCES } from './lectures/microgpt/data/resources';
import { REAL_CODE, getCodeMapSections, RealCodeBlock, CodeMapPanel } from './lectures/microgpt/data/realCode';
import { EMBEDDED_SLIDES, SlideRefPanel } from './lectures/microgpt/data/slides';
import { INSTRUCTOR_NOTES, LESSON_PLANS, WEEK_CHEAT_SHEETS, InstructorPanel, LessonPlanPanel, CheatSheetPanel } from './lectures/microgpt/data/instructorNotes';

// ─── Visualizations ──────────────────────────────────────────────
import { VIZ_MAP, VizRenderer } from './lectures/microgpt/visualizations';
import { WhyBox, BridgeBox, AnalogyBox, ConcreteBox, TryItTokenizer, TryItSoftmax, TryItDotProduct, TryItGradient, TryItEmbedding, StepByStepCalc, TryItParams, ConceptMapViz } from './lectures/microgpt/visualizations/interactiveViz';

// ─── Learning Widgets ────────────────────────────────────────────
import { QuizWidget, MistakesList, ComparisonTableWidget, ResourceLinks, GlossaryPanel, ProgressSidebar } from './lectures/microgpt/components/LearningWidgets';

// ─── Admin Panel ─────────────────────────────────────────────────
import AdminPanel from './admin/AdminPanel';

// ─── Prereq Lessons (lazy-loaded) ────────────────────────────────
const BackpropLesson = React.lazy(() => import('./lectures/microgpt/components/BackpropLesson'));

// ─── COURSE REGISTRY ─────────────────────────────────────────────
// To add a new course: import its data and add to COURSES array
const COURSES = [
  {
    id: 'microgpt',
    title: 'microGPT Academy',
    icon: 'μ',
    color: '#0EA5E9',
    weeks: WEEKS,
    archSteps: ARCH_STEPS,
  }
];

export default function App() {
  const [lang, setLang] = useState('tr');
  const [tab, setTab] = useState("lecture");
  const [model] = useState(() => {
    const rng = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const orig = Math.random; Math.random = rng(42); const m = createModel(); Math.random = orig; return m;
  });

  // Generate state
  const [gToks, setGToks] = useState([]);
  const [gStep, setGStep] = useState(-1);
  const [gDbg, setGDbg] = useState(null);
  const [gHist, setGHist] = useState([]);
  const [autoG, setAutoG] = useState(false);
  const [head, setHead] = useState(0);
  const [temp, setTemp] = useState(0.8);
  const [pStage, setPStage] = useState(-1);
  const [detail, setDetail] = useState("probs");

  // Train state
  const [tStep, setTStep] = useState(0);
  const [tLoss, setTLoss] = useState([]);
  const [tSamp, setTSamp] = useState([]);
  const [training, setTraining] = useState(false);
  const tRef = useRef(false);
  const [tSpeed, setTSpeed] = useState(1);

  // Architecture state
  const [archIdx, setArchIdx] = useState(0);

  // Lecture state
  const [weekIdx, setWeekIdx] = useState(0);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [completedSections, setCompletedSections] = useState({});
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [codeMapOpen, setCodeMapOpen] = useState(false);
  const [instructorMode, setInstructorMode] = useState(false);
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Track section completion
  useEffect(() => {
    if (tab === "lecture") {
      setCompletedSections(prev => {
        const wk = prev[weekIdx] || [];
        if (!wk.includes(sectionIdx)) return { ...prev, [weekIdx]: [...wk, sectionIdx] };
        return prev;
      });
    }
  }, [weekIdx, sectionIdx, tab]);

  // Generation step
  const doStep = useCallback(() => {
    if (gStep >= model.bs - 2) return null;
    const step = gStep + 1;
    const toks = step === 0 ? [BOS] : [...gToks];
    const K = [], V = [];
    let dbg = null;
    [0, 1, 2, 3, 4, 5].forEach((s, i) => setTimeout(() => setPStage(s), i * 100));
    for (let p = 0; p < toks.length; p++) {
      const r = fwd(model, toks[p], p, K, V);
      dbg = r.D;
    }
    const sL = dbg.logits.map(l => l / temp);
    const pr = softmax(sL);
    dbg.probs = pr;
    const next = smpl(pr);
    const newT = [...toks, next];
    setGToks(newT); setGStep(step); setGDbg(dbg);
    setGHist(h => [...h, { step, tok: itos[next], prob: pr[next], probs: [...pr] }]);
    if (next === EOS) setAutoG(false);
    return next;
  }, [gStep, gToks, model, temp]);

  useEffect(() => {
    if (!autoG) return;
    const t = setTimeout(() => {
      const tok = doStep();
      if (tok === null || tok === EOS || gStep >= model.bs - 3) setAutoG(false);
    }, 900);
    return () => clearTimeout(t);
  }, [autoG, doStep, gStep, model.bs]);

  const resetGen = () => { setGToks([]); setGStep(-1); setGDbg(null); setGHist([]); setAutoG(false); setPStage(-1); };

  // Training
  const startTrain = () => {
    const m = createModel(); setTStep(0); setTLoss([]); setTSamp([]); setTraining(true); tRef.current = true;
    let step = 0; const losses = [], samps = []; const params = [], mo = [], ve = [];
    for (const k of Object.keys(m.sd)) for (let r = 0; r < m.sd[k].length; r++) for (let c = 0; c < m.sd[k][r].length; c++) { params.push({ k, r, c }); mo.push(0); ve.push(0); }
    const genS = (mod, st) => {
      for (let s = 0; s < 3; s++) {
        const K2 = [], V2 = []; let tid = BOS; const g = [];
        for (let p = 0; p < mod.bs; p++) { const r = fwd(mod, tid, p, K2, V2); tid = smpl(softmax(r.logits.map(l => l / 0.8))); if (tid === EOS) break; g.push(itos[tid]); }
        samps.push({ step: st, name: g.join("") });
      }
      setTSamp([...samps]);
    };
    const doS = () => {
      if (!tRef.current || step >= 300) { setTraining(false); tRef.current = false; genS(m, step); return; }
      const doc = NAMES[step % NAMES.length];
      const toks = [BOS, ...doc.split("").map(c => stoi[c] || 0), EOS].slice(0, m.bs);
      const K = [], V = []; let loss = 0;
      for (let p = 0; p < toks.length - 1; p++) { const r = fwd(m, toks[p], p, K, V); loss += -Math.log(Math.max(1e-10, r.probs[toks[p + 1]])) / (toks.length - 1); }
      const eps = 1e-4, n = Math.min(40, params.length), lr = 0.01 * (1 - step / 300);
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * params.length); const { k: pk, r: pr2, c: pc } = params[idx];
        const orig = m.sd[pk][pr2][pc]; m.sd[pk][pr2][pc] = orig + eps;
        const K2 = [], V2 = []; let l2 = 0;
        for (let p = 0; p < toks.length - 1; p++) { const r2 = fwd(m, toks[p], p, K2, V2); l2 += -Math.log(Math.max(1e-10, r2.probs[toks[p + 1]])) / (toks.length - 1); }
        const g = (l2 - loss) / eps; m.sd[pk][pr2][pc] = orig;
        mo[idx] = 0.9 * mo[idx] + 0.1 * g; ve[idx] = 0.95 * ve[idx] + 0.05 * g * g;
        const mh = mo[idx] / (1 - 0.9 ** (step + 1)), vh = ve[idx] / (1 - 0.95 ** (step + 1));
        m.sd[pk][pr2][pc] -= lr * mh / (Math.sqrt(vh) + 1e-8);
      }
      losses.push(loss); setTLoss([...losses]); setTStep(step + 1);
      if ((step + 1) % 40 === 0) genS(m, step + 1);
      step++; setTimeout(doS, tSpeed === 2 ? 2 : tSpeed === 0 ? 20 : 6);
    };
    doS();
  };

  const genWord = gHist.filter(h => h.tok !== "<BOS>" && h.tok !== "<EOS>").map(h => h.tok).join("");
  const currentWeek = WEEKS[weekIdx];
  const currentSection = currentWeek?.sections[sectionIdx];

  const TabBtn = ({ id, label, emoji }) => (
    <button onClick={() => setTab(id)} style={{
      padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontSize: 16, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif", transition: "all .35s",
      border: tab === id ? "none" : "1px solid rgba(255,255,255,0.08)",
      background: tab === id ? "linear-gradient(135deg,#0EA5E9,#6366F1)" : "rgba(255,255,255,0.03)",
      color: tab === id ? "#fff" : "#64748B",
      boxShadow: tab === id ? "0 4px 24px rgba(14,165,233,.3)" : "none",
      transform: tab === id ? "scale(1.04)" : "scale(1)"
    }}>
      {emoji} {label}
    </button>
  );

  return (
    <LangContext.Provider value={lang}>
    <div style={{ minHeight: "100vh", background: "#030712", color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Background effects */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", right: "-5%", width: "45%", height: "45%", background: "radial-gradient(circle,rgba(14,165,233,.06) 0%,transparent 70%)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: "40%", height: "40%", background: "radial-gradient(circle,rgba(99,102,241,.04) 0%,transparent 70%)", filter: "blur(120px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "20px 28px" }}>

        {/* ─── HEADER ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: 16, background: "linear-gradient(135deg,#0EA5E9,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 29, fontWeight: 800, boxShadow: "0 4px 28px rgba(14,165,233,.35)", color: "#fff" }}>μ</div>
            <div>
              <h1 style={{ fontSize: 27, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#F1F5F9,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{lang === 'tr' ? 'microGPT Akademi' : 'microGPT Academy'}</h1>
              <p style={{ margin: 0, fontSize: 15, color: "#64748B" }}>{lang === 'tr' ? 'Sıfırdan GPT — 243 satır saf Python • İnteraktif Ders Notu & Laboratuvar' : 'GPT from Scratch — 243 lines of pure Python • Interactive Lecture Notes & Lab'}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <TabBtn id="prereq" label={lang === 'tr' ? "Ön Bilgi" : "Prereqs"} emoji="🧩" />
            <TabBtn id="lecture" label={lang === 'tr' ? "Ders Notları" : "Lectures"} emoji="📖" />
            <TabBtn id="generate" label={lang === 'tr' ? "Üretim Lab" : "Generation Lab"} emoji="⚡" />
            <TabBtn id="train" label={lang === 'tr' ? "Eğitim Lab" : "Training Lab"} emoji="📈" />
            <TabBtn id="arch" label={lang === 'tr' ? "Mimari" : "Architecture"} emoji="🧠" />
            <button onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} style={{
              padding: "10px 16px", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", transition: "all .35s",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)",
              color: "#94A3B8",
            }}>
              {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
            </button>
            <button onClick={() => setGlossaryOpen(!glossaryOpen)} style={{
              padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontSize: 16, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", transition: "all .35s",
              border: glossaryOpen ? "none" : "1px solid rgba(255,255,255,0.08)",
              background: glossaryOpen ? "linear-gradient(135deg,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.03)",
              color: glossaryOpen ? "#fff" : "#64748B",
              boxShadow: glossaryOpen ? "0 4px 24px rgba(139,92,246,.3)" : "none",
              transform: glossaryOpen ? "scale(1.04)" : "scale(1)"
            }}>
              {lang === 'tr' ? '📖 Sözlük' : '📖 Glossary'}
            </button>
            <button onClick={() => setCodeMapOpen(true)} style={{
              padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontSize: 16, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", transition: "all .35s",
              border: "1px solid rgba(245,158,11,0.15)",
              background: "rgba(245,158,11,0.04)",
              color: "#F59E0B"
            }}>
              {lang === 'tr' ? '🗺️ Kod Haritası' : '🗺️ Code Map'}
            </button>
          </div>
        </div>

        {/* Glossary Panel Overlay */}
        {glossaryOpen && <GlossaryPanel searchTerm={glossarySearch} setSearchTerm={setGlossarySearch} onClose={() => setGlossaryOpen(false)} />}
        {/* Code Map Panel Overlay */}
        {codeMapOpen && <CodeMapPanel onClose={() => setCodeMapOpen(false)} />}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PREREQ TAB                                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {tab === "prereq" && (
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 10px" }}>
            <div style={{ marginBottom: 16, padding: "16px 20px", borderRadius: 14, background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#818CF8", marginBottom: 6 }}>{lang === "tr" ? "🧩 Ön Gereksinim Dersleri" : "🧩 Prerequisite Lessons"}</div>
              <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7 }}>
                {lang === "tr"
                  ? "Bu interaktif dersler, microGPT Academy'nin ana müfredatına başlamadan önce temel kavramları öğretir."
                  : "These interactive lessons teach fundamental concepts before starting the main microGPT Academy curriculum."}
              </div>
            </div>
            <React.Suspense fallback={<div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Loading...</div>}>
              <BackpropLesson />
            </React.Suspense>
          </div>
        )}

        {/* LECTURE TAB                                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {tab === "lecture" && (
          <div style={{ display: "flex", gap: 20 }}>
            {/* Week sidebar */}
            <div style={{ width: 220, flexShrink: 0 }}>
              {/* Overall progress */}
              {(() => {
                const totalSections = WEEKS.reduce((s, w) => s + w.sections.length, 0);
                const totalDone = Object.values(completedSections).reduce((s, arr) => s + arr.length, 0);
                const pct = totalSections > 0 ? Math.round((totalDone / totalSections) * 100) : 0;
                return (
                  <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#10B981", fontWeight: 600 }}>{lang === "tr" ? "📊 İlerleme" : "📊 Progress"}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#10B981", fontFamily: "'Fira Code', monospace" }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#10B981,#0EA5E9)", borderRadius: 3, transition: "width .6s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{totalDone}/{totalSections} {lang === "tr" ? "bölüm görüldü" : "sections viewed"}</div>
                  </div>
                );
              })()}
              <div style={{ fontSize: 13, color: "#475569", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10, fontWeight: 600 }}>{lang === "tr" ? "Haftalık Program" : "Weekly Program"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {WEEKS.map((w, i) => {
                  const wDone = (completedSections[i] || []).length;
                  const wTotal = w.sections.length;
                  const wPct = wTotal > 0 ? (wDone / wTotal) * 100 : 0;
                  return (
                  <div key={w.id}>
                  <button onClick={() => { setWeekIdx(i); setSectionIdx(0); setShowQuiz(false); }} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: weekIdx === i ? `${w.color}15` : "transparent",
                    transition: "all .25s", textAlign: "left", fontFamily: "inherit", width: "100%"
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
                      background: weekIdx === i ? w.color : "rgba(255,255,255,0.04)", color: weekIdx === i ? "#fff" : "#475569",
                      transition: "all .3s", flexShrink: 0, position: "relative"
                    }}>
                      {w.icon}
                      {wPct === 100 && <div style={{ position: "absolute", top: -3, right: -3, width: 12, height: 12, borderRadius: "50%", background: "#10B981", border: "2px solid #030712", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>✓</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: ".1em" }}>Hafta {w.week}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: weekIdx === i ? w.color : "#94A3B8" }}>{tx(w.title, lang)}</div>
                    </div>
                  </button>
                  {/* Per-week progress bar */}
                  <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, margin: "2px 12px 0", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${wPct}%`, background: w.color, borderRadius: 2, transition: "width .5s" }} />
                  </div>
                  </div>
                  );
                })}
              </div>

              {/* Model summary card */}
              <div style={{ marginTop: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8, fontWeight: 600 }}>{lang === "tr" ? "Model Özeti" : "Model Summary"}</div>
                {[
                  { l: "Parametreler", v: "3,648", c: "#0EA5E9" },
                  { l: "Embedding", v: "16 boyut", c: "#8B5CF6" },
                  { l: "Attention", v: "4 head", c: "#10B981" },
                  { l: "Layer", v: "1 katman", c: "#F59E0B" },
                  { l: "Context", v: "8 token", c: "#EC4899" },
                  { l: "Vocabulary", v: "28 token", c: "#EF4444" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                    <span style={{ fontSize: 13, color: "#64748B" }}>{item.l}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: item.c, fontFamily: "'Fira Code', monospace" }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main lecture content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Week header */}
              <div style={{ background: `${currentWeek.color}08`, border: `1px solid ${currentWeek.color}20`, borderRadius: 18, padding: "20px 28px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: currentWeek.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 29, boxShadow: `0 4px 20px ${currentWeek.color}40`, flexShrink: 0 }}>
                    {currentWeek.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "#64748B", textTransform: "uppercase", letterSpacing: ".1em" }}>{lang === "tr" ? "Hafta" : "Week"} {currentWeek.week}</div>
                    <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, color: currentWeek.color }}>{tx(currentWeek.title, lang)}</h2>
                    <p style={{ margin: "2px 0 0", fontSize: 15, color: "#94A3B8" }}>{tx(currentWeek.subtitle, lang)}</p>
                  </div>
                </div>

                {/* Section tabs */}
                <div style={{ display: "flex", gap: 6, marginTop: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "thin" }}>
                  {currentWeek.sections.map((s, i) => {
                    const ek = `week${currentWeek.week}_s${i}`;
                    const hasExtras = SECTION_EXTRAS[ek];
                    const hasTryIt = hasExtras?.tryIt;
                    const hasSteps = hasExtras?.stepByStep;
                    const hasRealCode = !!REAL_CODE[ek];
                    return (
                    <button key={i} onClick={() => setSectionIdx(i)} style={{
                      padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                      background: sectionIdx === i ? currentWeek.color : "rgba(255,255,255,0.05)",
                      color: sectionIdx === i ? "#fff" : "#94A3B8", fontFamily: "inherit", transition: "all .25s",
                      whiteSpace: "nowrap", flexShrink: 0, position: "relative"
                    }}>
                      {i + 1}
                      {(hasTryIt || hasSteps) && <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", border: "2px solid #030712" }} title={lang === "tr" ? "İnteraktif içerik" : "Interactive content"} />}
                      {hasRealCode && !hasTryIt && !hasSteps && <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#10B981", border: "2px solid #030712" }} title={lang === "tr" ? "Gerçek microgpt.py kodu" : "Actual microgpt.py code"} />}
                      {hasExtras && !hasTryIt && !hasSteps && !hasRealCode && <span style={{ position: "absolute", top: -1, right: -1, width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", border: "1.5px solid #030712" }} title={lang === "tr" ? "Pedagojik içerik" : "Pedagogical content"} />}
                    </button>
                    );
                  })}
                </div>
                {/* Section title indicator */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, padding: "0 2px" }}>
                  <span style={{ fontSize: 14, color: currentWeek.color, fontWeight: 600 }}>{sectionIdx + 1}. {tx(currentSection?.title, lang)}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#F59E0B" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} /> kendin dene</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#10B981" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} /> {lang === "tr" ? "gerçek kod" : "real code"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#8B5CF6" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", display: "inline-block" }} /> {lang === "tr" ? "köprü/analoji" : "bridge/analogy"}</span>
                    <span style={{ fontSize: 12, color: "#475569" }}>{sectionIdx + 1}/{currentWeek.sections.length}</span>
                    <button onClick={() => setInstructorMode(!instructorMode)} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, border: `1px solid ${instructorMode ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`, background: instructorMode ? "rgba(251,191,36,0.1)" : "transparent", color: instructorMode ? "#FBBF24" : "#475569", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, marginLeft: 4 }}>
                      🎓 {instructorMode ? (lang === "tr" ? "Hoca Modu ✓" : "Instructor ✓") : (lang === "tr" ? "Hoca Modu" : "Instructor")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section content */}
              {currentSection && (() => {
                const extraKey = `week${currentWeek.week}_s${sectionIdx}`;
                const extras = SECTION_EXTRAS[extraKey] || {};
                return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28 }}>
                    <h3 style={{ margin: "0 0 12px", fontSize: 23, fontWeight: 700, color: "#E2E8F0" }}>{tx(currentSection.title, lang)}</h3>

                    <SlideRefPanel weekIdx={currentWeek.week} sectionIdx={sectionIdx} />

                    {/* Instructor Mode Panels */}
                    {instructorMode && (
                      <div style={{ marginBottom: 16 }}>
                        <InstructorPanel weekIdx={currentWeek.week} sectionIdx={sectionIdx} weekColor={currentWeek.color} />
                        {sectionIdx === 0 && (
                          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                            <button onClick={() => setShowLessonPlan(!showLessonPlan)} style={{ flex: 1, fontSize: 13, padding: "6px 10px", borderRadius: 8, border: `1px solid ${showLessonPlan ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"}`, background: showLessonPlan ? "rgba(99,102,241,0.06)" : "transparent", color: showLessonPlan ? "#818CF8" : "#64748B", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                              📋 {showLessonPlan ? lang === "tr" ? "Ders Planını Gizle" : "Hide Lesson Plan" : lang === "tr" ? "Ders Planını Göster" : "Show Lesson Plan"}
                            </button>
                            <button onClick={() => setShowCheatSheet(!showCheatSheet)} style={{ flex: 1, fontSize: 13, padding: "6px 10px", borderRadius: 8, border: `1px solid ${showCheatSheet ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)"}`, background: showCheatSheet ? "rgba(16,185,129,0.06)" : "transparent", color: showCheatSheet ? "#10B981" : "#64748B", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                              📝 {showCheatSheet ? lang === "tr" ? "Kopya Kağıdını Gizle" : "Hide Cheat Sheet" : lang === "tr" ? "Kopya Kağıdını Göster" : "Show Cheat Sheet"}
                            </button>
                          </div>
                        )}
                        {showLessonPlan && sectionIdx === 0 && <LessonPlanPanel weekIdx={currentWeek.week} />}
                        {showCheatSheet && sectionIdx === 0 && <CheatSheetPanel weekIdx={currentWeek.week} />}
                      </div>
                    )}

                    {/* Bridge Box — connection to previous content */}
                    {extras.bridge && <BridgeBox from={tx(extras.bridge.from, lang)} to={tx(extras.bridge.to, lang)} color={currentWeek.color} />}

                    {/* Why Box — motivation */}
                    {extras.why && <WhyBox color={currentWeek.color}>{tx(extras.why, lang)}</WhyBox>}

                    {/* Analogy Box — real-world metaphor */}
                    {extras.analogy && <AnalogyBox title={tx(extras.analogy.title, lang)} emoji={extras.analogy.emoji} color={currentWeek.color}>{tx(extras.analogy.text, lang)}</AnalogyBox>}

                    {/* Concrete Box — abstract→concrete */}
                    {extras.concrete && <ConcreteBox title={tx(extras.concrete.title, lang)} color={currentWeek.color}><pre style={{ margin: 0, fontFamily: "'Fira Code', monospace", fontSize: 14, lineHeight: 1.6, color: "#E2E8F0", whiteSpace: "pre-wrap" }}>{tx(extras.concrete.content, lang)}</pre></ConcreteBox>}

                    {currentSection.viz && <VizRenderer vizKey={currentSection.viz} />}

                    <p style={{ fontSize: 17, lineHeight: 1.8, color: "#CBD5E1", margin: 0 }}>{lang === 'en' && EN_CONTENT[currentWeek.id]?.[sectionIdx]?.content ? EN_CONTENT[currentWeek.id][sectionIdx].content : currentSection.content}</p>

                    {currentSection.highlight && (
                      <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 12, background: `${currentWeek.color}08`, borderLeft: `3px solid ${currentWeek.color}` }}>
                        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: currentWeek.color, fontStyle: "italic" }}>{lang === 'en' && EN_CONTENT[currentWeek.id]?.[sectionIdx]?.highlight ? EN_CONTENT[currentWeek.id][sectionIdx].highlight : currentSection.highlight}</p>
                      </div>
                    )}

                    {currentSection.code && (
                      <div style={{ marginTop: 16 }}>
                        <CodeBlock code={currentSection.code} />
                      </div>
                    )}

                    {/* Real microgpt.py Code Block */}
                    {REAL_CODE[extraKey] && <RealCodeBlock data={REAL_CODE[extraKey]} weekColor={currentWeek.color} />}

                    {/* Step-by-Step Calculation */}
                    {extras.stepByStep && <StepByStepCalc title={tx(extras.stepByStep.title, lang)} steps={extras.stepByStep.steps.map(s => ({...s, label: tx(s.label, lang), calc: tx(s.calc, lang), note: tx(s.note, lang)}))} color={currentWeek.color} />}

                    {/* Try It Yourself Widgets */}
                    {extras.tryIt === "tokenizer" && <TryItTokenizer />}
                    {extras.tryIt === "embedding" && <TryItEmbedding />}
                    {extras.tryIt === "softmax" && <TryItSoftmax />}
                    {extras.tryIt === "dotProduct" && <TryItDotProduct />}
                    {extras.tryIt === "gradient" && <TryItGradient />}
                    {extras.tryIt === "params" && <TryItParams />}

                    {/* Comparison Tables (shown for specific sections) */}
                    {weekIdx === 0 && sectionIdx === (currentWeek.sections.length - 1) && <ComparisonTableWidget data={getComparisons(lang)["model_scale"]} />}
                    {weekIdx === 3 && sectionIdx === 0 && <ConceptMapViz />}
                    {weekIdx === 4 && sectionIdx === 2 && <ComparisonTableWidget data={getComparisons(lang)["norm_compare"]} />}
                    {weekIdx === 4 && sectionIdx === 3 && <ComparisonTableWidget data={getComparisons(lang)["activation_compare"]} />}
                    {weekIdx === 5 && sectionIdx === 4 && <ComparisonTableWidget data={getComparisons(lang)["optimizer_compare"]} />}

                    {/* Common Mistakes (at last section of each week) */}
                    {COMMON_MISTAKES[currentWeek.week] && sectionIdx === currentWeek.sections.length - 1 && (
                      <MistakesList mistakes={COMMON_MISTAKES[currentWeek.week]} weekColor={currentWeek.color} />
                    )}

                    {/* Resources (at last section of each week) */}
                    {RESOURCES[currentWeek.week] && sectionIdx === currentWeek.sections.length - 1 && (
                      <ResourceLinks resources={RESOURCES[currentWeek.week]} />
                    )}
                  </div>

                  {/* Quiz toggle (shown at bottom after all sections) */}
                  {sectionIdx === currentWeek.sections.length - 1 && QUIZZES[currentWeek.week] && (
                    <div>
                      {!showQuiz ? (
                        <button onClick={() => setShowQuiz(true)} style={{
                          width: "100%", padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)",
                          background: "rgba(99,102,241,0.06)", color: "#6366F1", fontSize: 17, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                        }}>
                          🧪 {lang === "tr" ? "Hafta" : "Week"} {currentWeek.week} {lang === "tr" ? "Quiz'ini Çöz" : "Take Quiz"} ({QUIZZES[currentWeek.week].length} {lang === "tr" ? "soru" : "questions"})
                        </button>
                      ) : (
                        <QuizWidget questions={QUIZZES[currentWeek.week]} weekColor={currentWeek.color} />
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      onClick={() => {
                        if (sectionIdx > 0) { setSectionIdx(sectionIdx - 1); setShowQuiz(false); }
                        else if (weekIdx > 0) { setWeekIdx(weekIdx - 1); setSectionIdx(WEEKS[weekIdx - 1].sections.length - 1); setShowQuiz(false); }
                      }}
                      disabled={weekIdx === 0 && sectionIdx === 0}
                      style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: (weekIdx === 0 && sectionIdx === 0) ? "#1E293B" : "#94A3B8", fontSize: 15, fontWeight: 600, cursor: (weekIdx === 0 && sectionIdx === 0) ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                    >
                      ← Önceki
                    </button>
                    <span style={{ fontSize: 13, color: "#475569" }}>
                      {lang === "tr" ? "Hafta" : "Week"} {currentWeek.week} • {lang === "tr" ? "Bölüm" : "Section"} {sectionIdx + 1}/{currentWeek.sections.length}
                    </span>
                    <button
                      onClick={() => {
                        if (sectionIdx < currentWeek.sections.length - 1) { setSectionIdx(sectionIdx + 1); setShowQuiz(false); }
                        else if (weekIdx < WEEKS.length - 1) { setWeekIdx(weekIdx + 1); setSectionIdx(0); setShowQuiz(false); }
                      }}
                      disabled={weekIdx === WEEKS.length - 1 && sectionIdx === currentWeek.sections.length - 1}
                      style={{
                        padding: "8px 18px", borderRadius: 10, border: "none", fontSize: 15, fontWeight: 600, fontFamily: "inherit",
                        background: (weekIdx === WEEKS.length - 1 && sectionIdx === currentWeek.sections.length - 1) ? "#1E293B" : currentWeek.color,
                        color: "#fff", cursor: (weekIdx === WEEKS.length - 1 && sectionIdx === currentWeek.sections.length - 1) ? "not-allowed" : "pointer"
                      }}
                    >
                      Sonraki →
                    </button>
                  </div>
                </div>
              );
              })()}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* GENERATE TAB                                               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {tab === "generate" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Explainer banner */}
            <div style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 25 }}>💡</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#0EA5E9" }}>{lang === "tr" ? "Üretim Laboratuvarı" : "Generation Laboratory"}</div>
                <div style={{ fontSize: 14, color: "#94A3B8" }}>{lang === "tr" ? "Model BOS token ile başlar, her adımda sonraki karakteri tahmin eder. Altta detaylı görselleştirmeleri inceleyin." : "Model starts with BOS token, predicting the next character at each step. Explore detailed visualizations below."}</div>
              </div>
            </div>

            {/* Pipeline + Controls */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <Pipeline steps={ARCH_STEPS.map(s => ({ color: s.color, icon: s.icon }))} active={pStage} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "#475569" }}>T</span>
                  <input type="range" min="0.1" max="2.0" step="0.05" value={temp} onChange={e => setTemp(+e.target.value)} style={{ width: 70, accentColor: "#0EA5E9" }} />
                  <span style={{ fontSize: 15, color: "#0EA5E9", fontFamily: "'Fira Code', monospace", width: 32 }}>{temp.toFixed(1)}</span>
                </div>
                <button onClick={() => { resetGen(); setAutoG(true); }} style={{ padding: "7px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{lang === "tr" ? "▶ Otomatik" : "▶ Auto"}</button>
                <button onClick={doStep} disabled={autoG} style={{ padding: "7px 18px", borderRadius: 10, border: "1px solid rgba(14,165,233,.3)", background: "rgba(14,165,233,.08)", color: "#0EA5E9", fontSize: 15, fontWeight: 600, cursor: autoG ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{lang === "tr" ? "→ Adım" : "→ Step"}</button>
                <button onClick={resetGen} style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,.2)", background: "transparent", color: "#EF4444", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>↻</button>
              </div>
            </div>

            {/* Main content grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Generated tokens */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: 18 }}>
                  <div style={{ fontSize: 14, color: "#475569", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>{lang === "tr" ? "Üretilen Tokenlar" : "Generated Tokens"}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, minHeight: 48 }}>
                    {gHist.length === 0 && <span style={{ color: "#1E293B", fontSize: 16, fontStyle: "italic" }}>{lang === "tr" ? "▶ veya → ile üretimi başlatın" : "Press ▶ or → to start generating"}</span>}
                    {gHist.map((h, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, animation: "popIn .35s cubic-bezier(.34,1.56,.64,1)" }}>
                        <div style={{
                          padding: "8px 12px", borderRadius: 10, fontSize: 23, fontWeight: 700, fontFamily: "'Fira Code', monospace",
                          background: h.tok === "<EOS>" ? "rgba(239,68,68,.12)" : "rgba(14,165,233,.1)",
                          color: h.tok === "<EOS>" ? "#EF4444" : "#E2E8F0",
                          border: `1.5px solid ${h.tok === "<EOS>" ? "rgba(239,68,68,.25)" : "rgba(14,165,233,.2)"}`
                        }}>
                          {h.tok === "<BOS>" ? "◆" : h.tok === "<EOS>" ? "■" : h.tok}
                        </div>
                        <span style={{ fontSize: 11, color: "#475569", fontFamily: "'Fira Code', monospace" }}>{(h.prob * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                  {genWord && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(14,165,233,.06)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, color: "#64748B" }}>{lang === "tr" ? "Sonuç:" : "Result:"}</span>
                      <span style={{ fontSize: 27, fontWeight: 700, fontFamily: "'Fira Code', monospace", color: "#0EA5E9" }}>{genWord}</span>
                    </div>
                  )}
                </div>

                {/* Detail panels */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {[
                      { id: "probs", l: lang === "tr" ? "Olasılıklar" : "Probabilities", i: "📊", tip: lang === "tr" ? "Hangi token seçilecek?" : "Which token will be selected?" },
                      { id: "attn", l: "Attention", i: "🔍", tip: lang === "tr" ? "Kim kime bakıyor?" : "Who looks at whom?" },
                      { id: "mlp", l: "MLP Nöron", i: "🧬", tip: lang === "tr" ? "Hangi nöronlar aktif?" : "Which neurons are active?" },
                      { id: "embed", l: "Embedding", i: "📐", tip: lang === "tr" ? "Vektör değerleri" : "Vector values" }
                    ].map(d => (
                      <button key={d.id} onClick={() => setDetail(d.id)} style={{
                        flex: 1, padding: "10px 6px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                        background: detail === d.id ? "rgba(14,165,233,.08)" : "transparent",
                        color: detail === d.id ? "#0EA5E9" : "#475569",
                        borderBottom: detail === d.id ? "2px solid #0EA5E9" : "2px solid transparent"
                      }}>
                        {d.i} {d.l}
                      </button>
                    ))}
                  </div>
                  <div style={{ padding: 20, minHeight: 200 }}>
                    {!gDbg && <div style={{ color: "#1E293B", fontSize: 16, textAlign: "center", paddingTop: 40 }}>{lang === "tr" ? "Bir adım üretin..." : "Generate a step..."}</div>}
                    {gDbg && detail === "probs" && <ProbDist probs={gDbg.probs} tgt={gToks[gToks.length - 1]} />}
                    {gDbg && detail === "attn" && <AttnMat weights={gDbg.AW} tokens={gToks.map(t => itos[t])} head={head} setHead={setHead} />}
                    {gDbg && detail === "mlp" && <MLPViz hidden={gDbg.mlpH} activated={gDbg.mlpAct} />}
                    {gDbg && detail === "embed" && <EmbedViz dbg={gDbg} />}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <InfoCard value={gHist.length} label={lang === "tr" ? "Adım" : "Step"} color="#0EA5E9" icon="⚡" sub={`/ ${model.bs}`} />
                <InfoCard value={genWord || "—"} label={lang === "tr" ? "Üretilen" : "Generated"} color="#10B981" icon="✦" />
                <InfoCard value={gDbg ? (Math.max(...gDbg.probs) * 100).toFixed(1) + "%" : "—"} label={lang === "tr" ? "Top-1 Olasılık" : "Top-1 Probability"} color="#F59E0B" icon="📊" />
                <InfoCard value={temp.toFixed(2)} label="Temperature" color="#8B5CF6" icon="🌡" />
                <InfoCard value="3,648" label="Parametre" color="#EC4899" icon="🧮" sub="1 layer × 4 heads" />
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 12 }}>
                  <div style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>{lang === "tr" ? "📜 Geçmiş" : "📜 History"}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 160, overflowY: "auto" }}>
                    {gHist.map((h, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 6px", borderRadius: 5, background: "rgba(0,0,0,.2)", fontSize: 13 }}>
                        <span style={{ color: "#475569", fontFamily: "'Fira Code', monospace" }}>#{i}</span>
                        <span style={{ fontWeight: 700, fontFamily: "'Fira Code', monospace", color: "#E2E8F0" }}>{h.tok === "<BOS>" ? "◆" : h.tok === "<EOS>" ? "■" : h.tok}</span>
                        <Spark data={h.probs.slice(2, 28)} w={50} h={14} />
                        <span style={{ color: "#475569", fontFamily: "'Fira Code', monospace", fontSize: 11 }}>{(h.prob * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TRAIN TAB                                                  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {tab === "train" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Explainer */}
            <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 25 }}>🎓</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#10B981" }}>{lang === "tr" ? "Eğitim Laboratuvarı" : "Training Laboratory"}</div>
                <div style={{ fontSize: 14, color: "#94A3B8" }}>{lang === "tr" ? "Model 300 adımda isim kalıplarını öğrenir. Loss düştükçe tahminler iyileşir. Her 40 adımda üretilen örnekleri gözlemleyin." : "Model learns name patterns in 300 steps. Predictions improve as loss decreases. Observe generated samples every 40 steps."}</div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
              <InfoCard value={tStep} label={lang === "tr" ? "Adım" : "Step"} color="#0EA5E9" icon="⏱" sub="/300" />
              <InfoCard value={tLoss.length ? tLoss[tLoss.length - 1].toFixed(3) : "—"} label="Loss" color="#F59E0B" icon="📉" />
              <InfoCard value={(0.01 * (1 - tStep / 300)).toFixed(4)} label="Learning Rate" color="#8B5CF6" icon="🎯" />
              <InfoCard value={tLoss.length >= 2 ? (tLoss[tLoss.length - 1] < tLoss[tLoss.length - 2] ? lang === "tr" ? "↓ Düşüyor" : "↓ Decreasing" : lang === "tr" ? "↑ Artıyor" : "↑ Increasing") : "—"} label="Trend" color={tLoss.length >= 2 && tLoss[tLoss.length - 1] < tLoss[tLoss.length - 2] ? "#10B981" : "#EF4444"} icon="📈" />
              <InfoCard value={tSamp.length} label={lang === "tr" ? "Üretilen" : "Generated"} color="#EC4899" icon="✦" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "5fr 2fr", gap: 16 }}>
              {/* Loss curve */}
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>{lang === "tr" ? "Loss Eğrisi" : "Loss Curve"}</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>Düşen loss = model öğreniyor. Salınım normaldir (mini-batch).</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {!training ? (
                      <button onClick={startTrain} style={{ padding: "7px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{lang === "tr" ? "▶ Başlat" : "▶ Start"}</button>
                    ) : (
                      <button onClick={() => { tRef.current = false; setTraining(false); }} style={{ padding: "7px 18px", borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{lang === "tr" ? "⏹ Dur" : "⏹ Stop"}</button>
                    )}
                    <select value={tSpeed} onChange={e => setTSpeed(+e.target.value)} style={{ padding: "5px 8px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: 13, fontFamily: "inherit" }}>
                      <option value={0}>{lang === "tr" ? "🐢 Yavaş" : "🐢 Slow"}</option>
                      <option value={1}>{lang === "tr" ? "🏃 Normal" : "🏃 Normal"}</option>
                      <option value={2}>{lang === "tr" ? "🚀 Hızlı" : "🚀 Fast"}</option>
                    </select>
                  </div>
                </div>
                <div style={{ height: 220, background: "rgba(0,0,0,.2)", borderRadius: 12, overflow: "hidden", position: "relative" }}>
                  {tLoss.length > 1 ? (
                    <svg width="100%" height="100%" viewBox={`0 0 ${tLoss.length} 100`} preserveAspectRatio="none">
                      <defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA5E9" stopOpacity=".25" /><stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" /></linearGradient></defs>
                      <polygon points={`0,100 ${tLoss.map((l, i) => `${i},${Math.max(0, Math.min(100, (l - 1.5) * 30))}`).join(" ")} ${tLoss.length - 1},100`} fill="url(#lg1)" />
                      <polyline points={tLoss.map((l, i) => `${i},${Math.max(0, Math.min(100, (l - 1.5) * 30))}`).join(" ")} fill="none" stroke="#0EA5E9" strokeWidth="1.5" />
                      <line x1="0" y1={(3.33 - 1.5) * 30} x2={tLoss.length} y2={(3.33 - 1.5) * 30} stroke="#EF4444" strokeWidth=".5" strokeDasharray="4,4" opacity=".4" />
                    </svg>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#1E293B", fontSize: 17 }}>{lang === "tr" ? "▶ Başlat" : "▶ Start"}</div>
                  )}
                  {tLoss.length > 1 && (
                    <div style={{ position: "absolute", top: 8, right: 12, fontSize: 12, color: "#475569" }}>
                      <span style={{ color: "#EF4444" }}>{lang==="tr"?"--- rastgele tahmin (3.33)":"--- random guess (3.33)"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Generated names */}
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: 16 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>{lang === "tr" ? "Üretilen İsimler" : "Generated Names"}</h3>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748B" }}>{lang==="tr"?"İlk örnekler rastgele, adım arttıkça gerçekçi isimler oluşur.":"First samples are random, names become realistic as steps increase."}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 280, overflowY: "auto" }}>
                  {tSamp.length === 0 && <p style={{ color: "#1E293B", fontSize: 14, textAlign: "center", marginTop: 30 }}>{lang==="tr"?"Her 40 adımda örnekler görünecek":"Samples will appear every 40 steps"}</p>}
                  {tSamp.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "rgba(0,0,0,.2)", borderRadius: 7 }}>
                      <div style={{ width: 34, height: 18, borderRadius: 4, background: `rgba(14,165,233,${Math.min(1, s.step / 300)})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontFamily: "'Fira Code', monospace", flexShrink: 0 }}>{s.step}</div>
                      <span style={{ fontSize: 17, fontWeight: 600, color: "#E2E8F0", fontFamily: "'Fira Code', monospace" }}>{s.name || "∅"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ARCHITECTURE TAB                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {tab === "arch" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Explainer */}
            <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 25 }}>🧠</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#8B5CF6" }}>{lang === "tr" ? "Mimari Keşfedici" : "Architecture Explorer"}</div>
                <div style={{ fontSize: 14, color: "#94A3B8" }}>{lang === "tr" ? "GPT'nin 6 temel bileşenini adım adım keşfedin. Her bileşen hem kavramsal açıklama hem de gerçek Python kodu ile sunulmuştur." : "Explore GPT's 6 core components step by step. Each component is presented with both conceptual explanation and real Python code."}</div>
              </div>
            </div>

            {/* Step tabs */}
            <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              {ARCH_STEPS.map((a, i) => (
                <button key={i} onClick={() => setArchIdx(i)} style={{ flex: 1, padding: "16px 6px 12px", border: "none", cursor: "pointer", fontFamily: "inherit", background: archIdx === i ? `${a.color}0D` : "transparent", position: "relative", transition: "all .2s" }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, margin: "0 auto 5px", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, background: archIdx === i ? a.color : "rgba(255,255,255,0.04)",
                    color: archIdx === i ? "#fff" : "#475569", transform: archIdx === i ? "scale(1.15)" : "scale(1)",
                    boxShadow: archIdx === i ? `0 4px 16px ${a.color}40` : "none", transition: "all .3s"
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: archIdx === i ? a.color : "#475569" }}>{a.title.split(" ")[0]}</div>
                  {archIdx === i && <div style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: 3, borderRadius: "3px 3px 0 0", background: a.color }} />}
                </button>
              ))}
            </div>

            {/* Content grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Explanation */}
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: `1px solid ${ARCH_STEPS[archIdx].color}20`, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: ARCH_STEPS[archIdx].color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 27, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: `0 4px 20px ${ARCH_STEPS[archIdx].color}40` }}>
                    {ARCH_STEPS[archIdx].icon}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 25, fontWeight: 800, color: ARCH_STEPS[archIdx].color }}>{ARCH_STEPS[archIdx].title}</h2>
                    <p style={{ margin: "2px 0 0", fontSize: 15, color: "#94A3B8" }}>{tx(ARCH_STEPS[archIdx].sub, lang)}</p>
                  </div>
                </div>
                <p style={{ fontSize: 17, lineHeight: 1.8, color: "#CBD5E1", margin: "0 0 16px" }}>{tx(ARCH_STEPS[archIdx].desc, lang)}</p>
                <div style={{ background: "rgba(0,0,0,.2)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: ARCH_STEPS[archIdx].color, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>{lang==="tr"?"Detay":"Detail"}</div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "#94A3B8", margin: 0 }}>{tx(ARCH_STEPS[archIdx].detail, lang)}</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setArchIdx(Math.max(0, archIdx - 1))} disabled={archIdx === 0} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: archIdx > 0 ? "#94A3B8" : "#1E293B", fontSize: 14, fontWeight: 600, cursor: archIdx > 0 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>←</button>
                  <button onClick={() => setArchIdx(Math.min(5, archIdx + 1))} disabled={archIdx >= 5} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: archIdx < 5 ? ARCH_STEPS[Math.min(5, archIdx + 1)].color : "#1E293B", color: "#fff", fontSize: 14, fontWeight: 600, cursor: archIdx < 5 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>→</button>
                </div>
              </div>

              {/* Code + dim flow */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <CodeBlock code={ARCH_STEPS[archIdx].code} />
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: 14 }}>
                  <div style={{ fontSize: 13, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600 }}>{lang==="tr"?"Boyut Akışı — Verinin Yolculuğu":"Dimension Flow — Data's Journey"}</div>
                  <DimFlow activeIdx={archIdx} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 28, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#1E293B" }}>{lang === 'tr' ? 'microGPT Akademi v21 — İki Dilli Sürüm' : 'microGPT Academy v21 — Bilingual Edition'}</p>
        </div>
      </div>

      <style>{`
        @keyframes popIn { from { opacity:0; transform:scale(.8) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
        input[type="range"] { -webkit-appearance:none; height:4px; border-radius:2px; background:rgba(255,255,255,.08); outline:none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#0EA5E9; cursor:pointer; }
        select { cursor:pointer; }
        select option { background:#1E293B; color:#E2E8F0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.08); border-radius:2px; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
    </LangContext.Provider>
  );
}
