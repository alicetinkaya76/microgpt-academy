// ═══════════════════════════════════════════════════════════════
// theme.js v4 — Design System + Bilingual i18n
// ═══════════════════════════════════════════════════════════════
import { createContext, useContext, useState, useCallback } from "react";

// ── Design Tokens ────────────────────────────────────────────
export const C = {
  bg:"#090b11", s1:"#0e1119", s2:"#141821", s3:"#1b2030",
  gl:"rgba(255,255,255,.03)", gl2:"rgba(255,255,255,.06)",
  bd:"rgba(255,255,255,.06)", bh:"rgba(255,255,255,.13)",
  tx:"#c5cadb", ts:"#7f879e", tm:"#525a6f", wh:"#eef0f6",
  ch1:"#5b9cf5", ch2:"#9d7af5", ch3:"#f0923a",
  ok:"#34d399", err:"#f87171", warn:"#fbbf24", info:"#60a5fa",
};
export const F = { m:"'JetBrains Mono',monospace", s:"'DM Sans',system-ui,sans-serif" };
let _n=0; export const nid=()=>`_${++_n}`;

// ── Category Metadata ────────────────────────────────────────
export const CATS = {
  dfa:{c:C.ch1,ch:1,l:"DFA"}, nfa:{c:"#34d399",ch:1,l:"NFA"}, re:{c:C.ch2,ch:1,l:"RE"},
  re_mem:{c:"#d97af5",ch:1,l:"RE∈"}, re_nfa:{c:"#22d3ee",ch:1,l:"RE→NFA"}, gnfa:{c:C.ch3,ch:1,l:"GNFA"},
  pl:{c:C.warn,ch:1,l:"PL"}, cfg:{c:"#6ee7b7",ch:2,l:"CFG"}, pda:{c:"#818cf8",ch:2,l:"PDA"},
  cfl_pl:{c:C.err,ch:2,l:"CFL/PL"}, tm:{c:C.ch3,ch:3,l:"TM"},
};
export const DIF = [
  {c:C.ok,  tr:"Temel",  en:"Basic"},
  {c:C.warn,tr:"Orta",   en:"Medium"},
  {c:C.err, tr:"İleri",  en:"Advanced"},
];

// ── Bilingual Strings ────────────────────────────────────────
const strings = {
  title:       ["Otomata Lab","Automata Lab"],
  academy:     ["Akademi","Academy"],
  subtitle:    ["Biçimsel Diller ve Otomata Teorisi","Formal Languages & Automata Theory"],
  problems:    ["Problemler","Problems"],
  sandbox:     ["Sandbox","Sandbox"],
  tools:       ["Araçlar","Tools"],
  realWorld:   ["Gerçek Dünya","Real World"],
  back:        ["← Geri","← Back"],
  check:       ["Kontrol Et","Check"],
  hint:        ["İpucu","Hint"],
  solution:    ["Çözüm","Solution"],
  next:        ["Sonraki →","Next →"],
  prev:        ["← Önceki","← Previous"],
  run:         ["▶ Çalıştır","▶ Run"],
  build:       ["▶ İnşa Et","▶ Build"],
  convert:     ["▶ Dönüştür","▶ Convert"],
  clear:       ["Temizle","Clear"],
  undo:        ["↶ Geri Al","↶ Undo"],
  addState:    ["Durum","State"],
  addTrans:    ["Geçiş","Transition"],
  move:        ["Taşı","Move"],
  del:         ["Sil","Delete"],
  startSt:     ["Başlangıç","Start"],
  acceptSt:    ["Kabul","Accept"],
  rejectSt:    ["Red","Reject"],
  correct:     ["🎉 Mükemmel! Otomatınız doğru.","🎉 Perfect! Your automaton is correct."],
  tryAgain:    ["Henüz doğru değil","Not correct yet"],
  score:       ["Skor","Score"],
  testCases:   ["Test Durumları","Test Cases"],
  clickAdd:    ["Tuval'e tıklayarak durum ekleyin","Click canvas to add a state"],
  firstAuto:   ["İlk durum otomatik başlangıç olur","First state becomes start automatically"],
  selTarget:   ["Hedef durumu tıklayın…","Click target state…"],
  noStart:     ["⚠ Başlangıç yok","⚠ No start"],
  noAccept:    ["⚠ Kabul yok","⚠ No accept"],
  all:         ["Tümü","All"],
  search:      ["Ara…","Search…"],
  showAll:     ["Tümünü Göster","Show All"],
  reToNfa:     ["RE → NFA Dönüşümü","RE → NFA Conversion"],
  nfaToDfa:    ["NFA → DFA Dönüşümü","NFA → DFA Conversion"],
  thompson:    ["Thompson Yapısı","Thompson Construction"],
  subsetC:     ["Alt Küme Yapısı (Teorem 1.39)","Subset Construction (Theorem 1.39)"],
  presets:     ["Hazır Örnekler","Presets"],
  custom:      ["Özel Giriş","Custom Input"],
  table:       ["Geçiş Tablosu","Transition Table"],
  simTitle:    ["Simülatör","Simulator"],
  batchTest:   ["Toplu Test","Batch Test"],
  objective:   ["Öğrenme Hedefi","Learning Objective"],
  step:        ["Adım","Step"],
  strChoice:   ["① String Seçimi","① String Choice"],
  partition:   ["② Bölümleme","② Partition"],
  pumping:     ["③ Pompalama","③ Pumping"],
  contra:      ["④ Sonuç / Çelişki","④ Conclusion / Contradiction"],
  grammar:     ["Gramer","Grammar"],
  derivation:  ["Türetme","Derivation"],
  answer:      ["Cevap","Answer"],
  members:     ["Üyeler","Members"],
  nonMembers:  ["Üye Değil","Non-Members"],
  ch1:         ["Bölüm 1: Düzenli Diller","Chapter 1: Regular Languages"],
  ch2:         ["Bölüm 2: Bağlamdan Bağımsız","Chapter 2: Context-Free"],
  ch3:         ["Bölüm 3: Church-Turing","Chapter 3: Church-Turing"],
  footer:      ["Dr. Öğr. Üyesi Ali Çetinkaya · Selçuk Üniversitesi",
                "Asst. Prof. Ali Çetinkaya · Selçuk University"],
  symbolPick:  ["Sembol seçin","Pick symbol"],
  symNfa:      ["Sembol (virgülle ayır, ε için ε)","Symbol (comma-separate, ε for epsilon)"],
  symPda:      ["Geçiş: oku, pop → push","Transition: read, pop → push"],
  symTm:       ["Oku Yaz Yön (örn: 0 1 R)","Read Write Dir (e.g. 0 1 R)"],
  editState:   ["Durum Düzenle","Edit State"],
  enterRegex:  ["Regex girin ve İnşa Et'e basın","Enter regex and click Build"],
  pickNfa:     ["Bir NFA seçin ve Dönüştür'e basın","Pick an NFA and click Convert"],
  algExplain:  ["Algoritma","Algorithm"],
  rwTitle:     ["Otomat Teorisi Gerçek Dünyada","Automata in the Real World"],
  stepsAll:    ["Tüm Adımlar","All Steps"],
  accepted:    ["Kabul","Accepted"],
  rejected:    ["Red","Rejected"],
  stuck:       ["Sıkışma","Stuck"],
  epsClosure:  ["ε-closure","ε-closure"],
  moveSet:     ["move","move"],
  active:      ["Aktif","Active"],
};

// ── i18n Context ─────────────────────────────────────────────
const I18nCtx = createContext();
export function I18nProvider({children}) {
  const [lang, setLang] = useState("tr"); // 0=tr, 1=en
  const t = useCallback((key) => {
    const s = strings[key];
    return s ? s[lang === "en" ? 1 : 0] : key;
  }, [lang]);
  const toggle = () => setLang(l => l === "tr" ? "en" : "tr");
  return <I18nCtx.Provider value={{lang, t, toggle}}>{children}</I18nCtx.Provider>;
}
export const useI18n = () => useContext(I18nCtx);

// ── Global CSS ───────────────────────────────────────────────
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,400..800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.07);border-radius:9px;}
button{font-family:inherit;cursor:pointer;border:none;background:none;}
input,textarea{font-family:inherit;}
::selection{background:rgba(91,156,245,.22);}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
`;

// ── Shared UI primitives ─────────────────────────────────────
export const Pill = ({children,color,active,onClick,...p}) => (
  <button onClick={onClick} style={{
    padding:"5px 12px",borderRadius:7,fontSize:11,fontWeight:600,fontFamily:F.s,
    border:`1.5px solid ${active?color:"transparent"}`,
    background:active?`${color}14`:C.gl2, color:active?color:C.ts,
    transition:"all .15s",...p.style}} {...p}>{children}</button>
);

export const Card = ({children,color,pad=16,...p}) => (
  <div style={{padding:pad,borderRadius:14,background:C.s1,border:`1px solid ${color||C.bd}20`,
    animation:"fadeUp .2s ease-out",...p.style}}>{children}</div>
);

export const Btn = ({children,color=C.info,variant="solid",...p}) => (
  <button style={{
    padding:"9px 20px",borderRadius:9,fontSize:13,fontWeight:700,fontFamily:F.s,
    background:variant==="solid"?color:"transparent",
    color:variant==="solid"?"#fff":color,
    border:variant==="outline"?`1.5px solid ${color}`:"none",
    transition:"all .15s",boxShadow:variant==="solid"?`0 2px 12px ${color}30`:"none",
    ...p.style}} {...p}>{children}</button>
);

export const Tag = ({children,color}) => (
  <span style={{padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:700,
    background:`${color}16`,color,fontFamily:F.s,letterSpacing:".02em"}}>{children}</span>
);
