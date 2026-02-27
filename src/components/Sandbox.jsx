// ═══════════════════════════════════════════════════════════════
// Sandbox.jsx v8 — World-Class Animated Sandbox
//
// Animated token travels along edges via requestAnimationFrame
// 12 presets · InputVis · Formal def · TM tape · PDA stack
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { C, F, Pill, Btn, useI18n } from "../theme";
import { simDFA, simDFA_verbose, simNFA, simPDA, simTM } from "../engines";
import Canvas from "./Canvas";

// ── Animated Input Display ───────────────────────────────────
function InputVis({str,step,color,total,ok,failMsg}) {
  const ch=(str||"").length?str.split(""):[];
  const done=step>=total;
  return(<div style={{display:"flex",alignItems:"center",gap:2,padding:"4px 0",flexWrap:"wrap"}}>
    {ch.map((c,i)=>{const p=i<step,cur=i===step&&!done;
      return(<div key={i} style={{width:26,height:30,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:14,fontFamily:F.m,fontWeight:700,flexShrink:0,transition:"all .15s",position:"relative",
        background:cur?`${color}18`:p?`${C.ok}06`:C.gl,border:`1.5px solid ${cur?color:p?`${C.ok}25`:C.bd}`,
        color:cur?C.wh:p?C.ok:C.tm,transform:cur?"scale(1.08)":"none",
        boxShadow:cur?`0 0 12px ${color}20`:"none"}}>
        {c}{cur&&<div style={{position:"absolute",bottom:-5,width:0,height:0,
          borderLeft:"3px solid transparent",borderRight:"3px solid transparent",borderBottom:`4px solid ${color}`}}/>}
      </div>);
    })}
    {!ch.length&&step===0&&<span style={{fontSize:11,color:C.tm,fontFamily:F.m,padding:"6px 0"}}>ε</span>}
    {done&&ok!==undefined&&(
      <div style={{marginLeft:6,padding:"4px 12px",borderRadius:7,fontSize:12,fontWeight:900,fontFamily:F.s,
        background:ok?`${C.ok}10`:`${C.err}10`,color:ok?C.ok:C.err,
        border:`1.5px solid ${ok?C.ok:C.err}20`,animation:"fadeUp .15s ease-out"}}>
        {ok?"✓ ACCEPT":"✗ REJECT"}
      </div>
    )}
    {done&&ok===false&&failMsg&&(
      <div style={{marginLeft:0,marginTop:4,padding:"5px 10px",borderRadius:6,fontSize:10,
        background:`${C.err}08`,border:`1px solid ${C.err}12`,color:C.err,fontFamily:F.s,
        width:"100%",animation:"fadeUp .15s ease-out"}}>
        {failMsg}
      </div>
    )}
  </div>);
}

// ── Mini SVG ─────────────────────────────────────────────────
function Mini({S,T,c,w=190,h=48}) {
  if(!S?.length)return null;
  const R=6,pad=10;
  const xs=S.map(s=>s.x),ys=S.map(s=>s.y);
  const mx=Math.min(...xs),Mx=Math.max(...xs),my=Math.min(...ys),My=Math.max(...ys);
  const sx=Mx-mx||1,sy=My-my||1,sc=Math.min((w-pad*2)/sx,(h-pad*2)/sy,.7);
  const ox=(w-sx*sc)/2,oy=(h-sy*sc)/2,px=s=>ox+(s.x-mx)*sc,py=s=>oy+(s.y-my)*sc;
  const edges=new Set();T.forEach(t=>edges.add(t.fr+">"+t.to));
  return(<svg width={w} height={h} style={{display:"block",opacity:.6}}>
    {[...edges].map((k,i)=>{const[f,t]=k.split(">");const fs=S.find(s=>s.id===f),ts=S.find(s=>s.id===t);
      if(!fs||!ts)return null;
      if(f===t)return<ellipse key={i} cx={px(fs)} cy={py(fs)-R-4} rx={5} ry={3.5} fill="none" stroke={c} strokeWidth={.5} opacity={.3}/>;
      return<line key={i} x1={px(fs)} y1={py(fs)} x2={px(ts)} y2={py(ts)} stroke={c} strokeWidth={.6} opacity={.25}/>;
    })}
    {S.map((s,i)=><g key={i}><circle cx={px(s)} cy={py(s)} r={R} fill={s.accept?`${C.ok}15`:s.start?`${c}12`:`${c}06`}
      stroke={s.start?c:s.accept?C.ok:`${c}25`} strokeWidth={.7}/>
      {s.accept&&<circle cx={px(s)} cy={py(s)} r={R-2} fill="none" stroke={C.ok} strokeWidth={.4}/>}
      <text x={px(s)} y={py(s)+2} textAnchor="middle" fill={C.tx} fontSize={4.5} fontWeight={600} fontFamily={F.m}>{s.label}</text></g>
    )}
  </svg>);
}

// ── Preset Data ──────────────────────────────────────────────
const PX={
dfa:[
  {id:"d1",dif:1,nm:["Tek 'a'","Only 'a'"],
   ds:["Sadece 'a' kabul eder.","Accepts only 'a'."],
   pre:["Alfabe (Σ), string, dil kavramları","Alphabet (Σ), string, language concepts"],
   learn:["Her (q,σ)→1δ. Trap state ile tam DFA.","Each (q,σ)→1δ. Complete with trap."],
   chg:["🎯 'a' veya 'aa'","🎯 Accept 'a' or 'aa'"],a:["a","b"],
   s:[{id:"q0",x:90,y:110,label:"q0",start:true,accept:false},{id:"q1",x:260,y:110,label:"q1",accept:true},{id:"q2",x:175,y:220,label:"trap",accept:false}],
   t:[{fr:"q0",to:"q1",syms:["a"]},{fr:"q0",to:"q2",syms:["b"]},{fr:"q1",to:"q2",syms:["a"]},{fr:"q1",to:"q2",syms:["b"]},{fr:"q2",to:"q2",syms:["a"]},{fr:"q2",to:"q2",syms:["b"]}],test:"a\naa\nb\nab"},
  {id:"d2",dif:1,nm:["Çift a","Even a's"],
   ds:["Çift sayıda a.","Even a count."],
   pre:["DFA tanımı (Q, Σ, δ, q₀, F), kabul/ret kavramı","DFA definition (Q, Σ, δ, q₀, F), accept/reject concept"],
   learn:["2 durum = parite DFA.","2 states = parity DFA."],
   chg:["🎯 Çift a + çift b → 4Q","🎯 Even a's + b's → 4Q"],a:["a","b"],
   s:[{id:"q0",x:100,y:120,label:"even",start:true,accept:true},{id:"q1",x:300,y:120,label:"odd",accept:false}],
   t:[{fr:"q0",to:"q1",syms:["a"]},{fr:"q1",to:"q0",syms:["a"]},{fr:"q0",to:"q0",syms:["b"]},{fr:"q1",to:"q1",syms:["b"]}],test:"aa\nb\naba\na"},
  {id:"d3",dif:2,nm:["···ab","Ends 'ab'"],
   ds:["'ab' ile biten.","Ends with 'ab'."],
   pre:["DFA durum geçişleri, döngüler (self-loop), çok durumlu DFA","DFA state transitions, loops (self-loop), multi-state DFA"],
   learn:["Son sembolleri izle.","Track last symbols."],
   chg:["🎯 'ba'··'ab'","🎯 Start 'ba' end 'ab'"],a:["a","b"],
   s:[{id:"q0",x:80,y:120,label:"q0",start:true,accept:false},{id:"q1",x:230,y:120,label:"q1",accept:false},{id:"q2",x:380,y:120,label:"q2",accept:true}],
   t:[{fr:"q0",to:"q0",syms:["b"]},{fr:"q0",to:"q1",syms:["a"]},{fr:"q1",to:"q1",syms:["a"]},{fr:"q1",to:"q2",syms:["b"]},{fr:"q2",to:"q1",syms:["a"]},{fr:"q2",to:"q0",syms:["b"]}],test:"ab\naab\nba\nabb"},
  {id:"d4",dif:2,nm:["⊃010","Has 010"],
   ds:["'010' içeren.","Contains '010'."],
   pre:["Çok durumlu DFA, pattern takibi, trap state","Multi-state DFA, pattern tracking, trap state"],
   learn:["Pattern progress DFA.","Pattern progress DFA."],
   chg:["🎯 '0110' ara","🎯 Search '0110'"],a:["0","1"],
   s:[{id:"q0",x:60,y:120,label:"q0",start:true,accept:false},{id:"q1",x:180,y:120,label:"q1",accept:false},{id:"q2",x:300,y:120,label:"q2",accept:false},{id:"q3",x:420,y:120,label:"q3",accept:true}],
   t:[{fr:"q0",to:"q1",syms:["0"]},{fr:"q0",to:"q0",syms:["1"]},{fr:"q1",to:"q1",syms:["0"]},{fr:"q1",to:"q2",syms:["1"]},{fr:"q2",to:"q3",syms:["0"]},{fr:"q2",to:"q0",syms:["1"]},{fr:"q3",to:"q3",syms:["0"]},{fr:"q3",to:"q3",syms:["1"]}],test:"010\n0010\n110\n01"},
  {id:"d5",dif:3,nm:["mod 3","Div by 3"],
   ds:["3'e bölünebilir.","Divisible by 3."],
   pre:["Binary sayı sistemi, modüler aritmetik, çok durumlu DFA tasarımı","Binary number system, modular arithmetic, multi-state DFA design"],
   learn:["n Q = mod n aritmetik.","n Q = mod n arithmetic."],
   chg:["🎯 mod 4 DFA","🎯 mod 4 DFA"],a:["0","1"],
   s:[{id:"q0",x:80,y:130,label:"r0",start:true,accept:true},{id:"q1",x:280,y:60,label:"r1",accept:false},{id:"q2",x:280,y:200,label:"r2",accept:false}],
   t:[{fr:"q0",to:"q0",syms:["0"]},{fr:"q0",to:"q1",syms:["1"]},{fr:"q1",to:"q2",syms:["0"]},{fr:"q1",to:"q0",syms:["1"]},{fr:"q2",to:"q1",syms:["0"]},{fr:"q2",to:"q2",syms:["1"]}],test:"0\n11\n110\n111"},
  // JFLAP Tutorial: faex.jff — odd number of b's
  {id:"d6",dif:1,nm:["Tek b (JFLAP)","Odd b's (JFLAP)"],
   ds:["JFLAP tutorial: tek sayıda b.","JFLAP tutorial: odd number of b's."],
   pre:["DFA tanımı, kabul/ret durumları, parite izleme","DFA definition, accept/reject states, parity tracking"],
   learn:["Tek/çift takibi: 2 durum yeter. Eksik geçişlere dikkat!","Odd/even tracking: 2 states suffice. Watch for missing transitions!"],
   chg:["🎯 Tam DFA yap (trap ekle)","🎯 Make complete DFA (add trap)"],a:["a","b"],
   s:[{id:"q0",x:90,y:114,label:"q0",start:true,accept:false},{id:"q1",x:262,y:114,label:"q1",accept:true},{id:"q2",x:443,y:114,label:"q2",accept:false}],
   t:[{fr:"q2",to:"q1",syms:["b"]},{fr:"q1",to:"q2",syms:["b"]},{fr:"q0",to:"q0",syms:["a"]},{fr:"q0",to:"q1",syms:["b"]}],test:"b\nbb\nab\naab\nbab\nba"},
  // JFLAP Tutorial: dfaToMinDFA.jff — 7 state DFA for minimization study
  {id:"d7",dif:3,nm:["7Q→Min (JFLAP)","7Q→Min (JFLAP)"],
   ds:["JFLAP: 7 durumlu, minimizasyon egzersizi.","JFLAP: 7-state minimization exercise."],
   pre:["DFA tasarımı, eşdeğer durumlar, erişilemeyen durumlar kavramı","DFA design, equivalent states, unreachable states concept"],
   learn:["Eşdeğer durumları bul & birleştir. Minimal DFA kaç durum?","Find equivalent states & merge. How many states in minimal DFA?"],
   chg:["🎯 Aynı dili tanıyan min DFA bul","🎯 Find min DFA for same language"],a:["a","b"],
   s:[{id:"q0",x:83,y:139,label:"q0",start:true,accept:false},{id:"q1",x:235,y:61,label:"q1",accept:false},{id:"q2",x:410,y:136,label:"q2",accept:false},{id:"q3",x:300,y:200,label:"q3",accept:false},{id:"q4",x:200,y:260,label:"q4",accept:false},{id:"q5",x:370,y:310,label:"q5",accept:false},{id:"q6",x:110,y:300,label:"q6",accept:true}],
   t:[{fr:"q3",to:"q5",syms:["a"]},{fr:"q1",to:"q2",syms:["b"]},{fr:"q4",to:"q5",syms:["b"]},{fr:"q5",to:"q4",syms:["b"]},{fr:"q3",to:"q4",syms:["b"]},{fr:"q6",to:"q1",syms:["a"]},{fr:"q4",to:"q6",syms:["a"]},{fr:"q1",to:"q0",syms:["a"]},{fr:"q0",to:"q2",syms:["b"]},{fr:"q2",to:"q0",syms:["b"]},{fr:"q6",to:"q5",syms:["b"]},{fr:"q0",to:"q6",syms:["a"]},{fr:"q5",to:"q2",syms:["a"]},{fr:"q2",to:"q3",syms:["a"]}],test:"a\nab\naa\naab\naba\nbab"},
],
nfa:[
  {id:"n1",dif:1,nm:["···01","Ends 01"],
   ds:["'01' sonu.","Ends '01'."],
   pre:["DFA kavramı, belirlenimlilik, geçiş fonksiyonu δ","DFA concept, determinism, transition function δ"],
   learn:["NFA tahmin: döner+dallanır.","NFA guess: loop+branch."],
   chg:["🎯 '001' → +1Q","🎯 '001' → +1Q"],a:["0","1"],
   s:[{id:"q0",x:80,y:120,label:"q0",start:true,accept:false},{id:"q1",x:230,y:120,label:"q1",accept:false},{id:"q2",x:380,y:120,label:"q2",accept:true}],
   t:[{fr:"q0",to:"q0",syms:["0","1"]},{fr:"q0",to:"q1",syms:["0"]},{fr:"q1",to:"q2",syms:["1"]}],test:"01\n001\n10\n0101"},
  // JFLAP Tutorial: nfaToDfa.jff — ε-transition NFA for conversion practice
  {id:"n4",dif:2,nm:["ε-NFA (JFLAP)","ε-NFA (JFLAP)"],
   ds:["JFLAP: ε geçişli, NFA→DFA dönüşüm pratiği.","JFLAP: ε-transition NFA→DFA conversion practice."],
   pre:["NFA tanımı, ε-closure algoritması, alt küme yapımı","NFA definition, ε-closure algorithm, subset construction"],
   learn:["ε-closure(q0) hesapla, sonra her sembol için genişlet.","Compute ε-closure(q0), then expand for each symbol."],
   chg:["🎯 Eşdeğer DFA'yı elle yap","🎯 Build equivalent DFA by hand"],a:["a","b"],
   s:[{id:"q0",x:76,y:126,label:"q0",start:true,accept:false},{id:"q1",x:196,y:75,label:"q1",accept:false},{id:"q2",x:214,y:216,label:"q2",accept:false},{id:"q3",x:351,y:126,label:"q3",accept:true}],
   t:[{fr:"q3",to:"q2",syms:["b"]},{fr:"q3",to:"q1",syms:["a"]},{fr:"q1",to:"q3",syms:["a"]},{fr:"q1",to:"q1",syms:["a"]},{fr:"q0",to:"q2",syms:["a"]},{fr:"q0",to:"q1",syms:["b","a"]},{fr:"q2",to:"q0",syms:["ε"]},{fr:"q0",to:"q3",syms:["b"]}],test:"a\nb\naa\nab\nba\naab"},
  {id:"n2",dif:1,nm:["ε: a∪b","ε: a∪b"],
   ds:["ε union.","ε union."],
   pre:["NFA tanımı, nondeterminizm, ε (epsilon) kavramı","NFA definition, nondeterminism, ε (epsilon) concept"],
   learn:["ε-closure kavramı.","ε-closure concept."],
   chg:["🎯 +ab","🎯 +ab"],a:["a","b"],
   s:[{id:"q0",x:80,y:120,label:"q0",start:true,accept:false},{id:"q1",x:220,y:55,label:"q1",accept:false},{id:"q2",x:220,y:185,label:"q2",accept:false},{id:"q3",x:370,y:120,label:"q3",accept:true}],
   t:[{fr:"q0",to:"q1",syms:["ε"]},{fr:"q0",to:"q2",syms:["ε"]},{fr:"q1",to:"q3",syms:["a"]},{fr:"q2",to:"q3",syms:["b"]}],test:"a\nb\nab\naa"},
  {id:"n3",dif:2,nm:["[-3]=1","3rd-last"],
   ds:["3Q→8Q DFA patlama.","3Q→8Q DFA blowup."],
   pre:["NFA→DFA dönüşümü (alt küme yapımı), üssel durum artışı","NFA→DFA conversion (subset construction), exponential blowup"],
   learn:["Üssel NFA→DFA.","Exponential NFA→DFA."],
   chg:["🎯 DFA ile yap","🎯 Build as DFA"],a:["0","1"],
   s:[{id:"q0",x:60,y:120,label:"q0",start:true,accept:false},{id:"q1",x:180,y:120,label:"q1",accept:false},{id:"q2",x:300,y:120,label:"q2",accept:false},{id:"q3",x:420,y:120,label:"q3",accept:true}],
   t:[{fr:"q0",to:"q0",syms:["0","1"]},{fr:"q0",to:"q1",syms:["1"]},{fr:"q1",to:"q2",syms:["0","1"]},{fr:"q2",to:"q3",syms:["0","1"]}],test:"1000\n10011\n001\n0000"},
],
pda:[
  {id:"p1",dif:1,nm:["0ⁿ1ⁿ","0ⁿ1ⁿ"],
   ds:["Stack ile say.","Stack counts."],
   pre:["DFA ve NFA, düzenli dillerin sınırları, stack (yığın) veri yapısı","DFA and NFA, regular language limits, stack data structure"],
   learn:["DFA imkansız.","DFA impossible."],
   chg:["🎯 0ⁿ1²ⁿ","🎯 0ⁿ1²ⁿ"],a:["0","1"],
   s:[{id:"q0",x:80,y:120,label:"push",start:true,accept:false},{id:"q1",x:230,y:120,label:"pop",accept:false},{id:"qf",x:380,y:120,label:"acc",accept:true}],
   t:[{fr:"q0",to:"q0",syms:["0, ε → $"]},{fr:"q0",to:"q1",syms:["ε, ε → ε"]},{fr:"q1",to:"q1",syms:["1, $ → ε"]},{fr:"q1",to:"qf",syms:["ε, ε → ε"]}],test:"01\n0011\n000111\n001"},
  {id:"p2",dif:2,nm:["wwᴿ","Palindrome"],
   ds:["Palindrom.","Palindrome."],
   pre:["PDA tanımı, push/pop işlemleri, nondeterministik PDA, 0ⁿ1ⁿ örneği","PDA definition, push/pop operations, nondeterministic PDA, 0ⁿ1ⁿ example"],
   learn:["Ortayı tahmin eder.","Guesses middle."],
   chg:["🎯 Tek uzunluk","🎯 Odd length"],a:["0","1"],
   s:[{id:"q0",x:80,y:120,label:"push",start:true,accept:false},{id:"q1",x:250,y:120,label:"pop",accept:false},{id:"qf",x:400,y:120,label:"acc",accept:true}],
   t:[{fr:"q0",to:"q0",syms:["0, ε → 0"]},{fr:"q0",to:"q0",syms:["1, ε → 1"]},{fr:"q0",to:"q1",syms:["ε, ε → ε"]},{fr:"q1",to:"q1",syms:["0, 0 → ε"]},{fr:"q1",to:"q1",syms:["1, 1 → ε"]},{fr:"q1",to:"qf",syms:["ε, ε → ε"]}],test:"0110\n1001\n010\n0101"},
],
tm:[
  {id:"t1",dif:1,nm:["0→1","Flip"],
   ds:["0→1 çevir.","Flip 0→1."],
   pre:["DFA/NFA/PDA hiyerarşisi, bant (tape) kavramı, okuma/yazma kafası","DFA/NFA/PDA hierarchy, tape concept, read/write head"],
   learn:["TM yazma gücü.","TM write power."],
   chg:["🎯 0↔1 swap","🎯 0↔1 swap"],a:["0","1"],
   s:[{id:"q0",x:100,y:120,label:"scan",start:true,accept:false},{id:"qa",x:330,y:120,label:"acc",accept:true}],
   t:[{fr:"q0",to:"q0",syms:["0/1,R"],tmRead:"0",tmWrite:"1",tmDir:"R"},{fr:"q0",to:"q0",syms:["1/1,R"],tmRead:"1",tmWrite:"1",tmDir:"R"},{fr:"q0",to:"qa",syms:["␣/␣,R"],tmRead:"␣",tmWrite:"␣",tmDir:"R"}],test:"000\n010\n111"},
  {id:"t2",dif:2,nm:["1ⁿ+1ᵐ","Add"],
   ds:["Unary toplama.","Unary add."],
   pre:["TM tanımı (Q,Σ,Γ,δ,q₀), bant manipülasyonu, çok geçişli TM tasarımı","TM definition (Q,Σ,Γ,δ,q₀), tape manipulation, multi-pass TM design"],
   learn:["Aritmetik TM.","Arithmetic TM."],
   chg:["🎯 3'lü toplam","🎯 Triple add"],a:["0","1"],
   s:[{id:"q0",x:60,y:120,label:"scan",start:true,accept:false},{id:"q1",x:190,y:120,label:"right",accept:false},{id:"q2",x:330,y:120,label:"erase",accept:false},{id:"qa",x:460,y:120,label:"done",accept:true}],
   t:[{fr:"q0",to:"q0",syms:["1/1,R"],tmRead:"1",tmWrite:"1",tmDir:"R"},{fr:"q0",to:"q1",syms:["0/1,R"],tmRead:"0",tmWrite:"1",tmDir:"R"},{fr:"q1",to:"q1",syms:["1/1,R"],tmRead:"1",tmWrite:"1",tmDir:"R"},{fr:"q1",to:"q2",syms:["␣/␣,L"],tmRead:"␣",tmWrite:"␣",tmDir:"L"},{fr:"q2",to:"qa",syms:["1/␣,R"],tmRead:"1",tmWrite:"␣",tmDir:"R"}],test:"1011\n11011\n101"},
]};

const MODES=[{id:"dfa",c:C.info,g:"#3b82f6,#1d4ed8"},{id:"nfa",c:"#34d399",g:"#34d399,#059669"},{id:"pda",c:"#818cf8",g:"#818cf8,#6366f1"},{id:"tm",c:C.ch3,g:"#f59e0b,#d97706"}];
const MD={dfa:{tr:"Belirlenimli Sonlu Otomat",en:"Deterministic Finite Automaton",tip:{tr:"Tıkla durum ekle · Çift tık düzenle · Her (q,σ)→1δ",en:"Click=add · Dbl-click=edit · Each (q,σ)→1δ"}},
  nfa:{tr:"Belirlenimci Olmayan",en:"Nondeterministic FA",tip:{tr:"ε · Virgül=çoklu · Paralel yol",en:"ε · Comma=multi · Parallel"}},
  pda:{tr:"Yığınlı Otomat",en:"Pushdown Automaton",tip:{tr:"oku, pop→push · ε=boş",en:"read, pop→push · ε=empty"}},
  tm:{tr:"Turing Makinesi",en:"Turing Machine",tip:{tr:"Oku Yaz Yön · ␣=boş",en:"Read Write Dir · ␣=blank"}}};

// ═══ Main Component ══════════════════════════════════════════
export default function Sandbox() {
  const{t,lang}=useI18n(); const li=lang==="en"?1:0;
  const[mode,setMode]=useState("dfa");
  const[sts,setSts]=useState([]); const[trs,setTrs]=useState([]);
  const[inp,setInp]=useState(""); const[res,setRes]=useState(null); const[step,setStep]=useState(-1);
  const[batch,setBatch]=useState(""); const[batchR,setBatchR]=useState(null);
  const[selP,setSelP]=useState(null); const[showDef,setShowDef]=useState(false);
  const[playing,setPlaying]=useState(false);
  // Animation state
  const[anim,setAnim]=useState(null); // {from,to,sym,progress,offset}
  const rafRef=useRef(null); const startT=useRef(0);
  const ANIM_DUR=420; // ms per transition

  const mc=MODES.find(m=>m.id===mode); const col=mc.c;
  const presets=PX[mode]||[]; const alph=selP?.a||(mode<"n"?["a","b"]:["0","1"]);
  const sim={dfa:simDFA,nfa:simNFA,pda:simPDA,tm:simTM}[mode];

  const clearSim=()=>{setRes(null);setStep(-1);setBatchR(null);setPlaying(false);setAnim(null);cancelAnimationFrame(rafRef.current);};
  const load=useCallback(p=>{setSts(p.s.map(s=>({...s,reject:s.reject||false})));setTrs(p.t.map((t,i)=>({...t,id:`_${i}`})));
    setBatch(p.test||"");setSelP(p);clearSim();},[]);
  const clr=()=>{setSts([]);setTrs([]);clearSim();setSelP(null);setBatch("");};
  const sw=m=>{setMode(m);clr();};

  // ── JFF Import ──────────────────────────────────────────────
  const fileRef=useRef(null);
  const parseJFF=useCallback((xml)=>{
    const type=(xml.match(/<type>([^<]+)/)||[])[1]||'fa';
    // Parse states
    const sList=[];
    const sRe=/<state\s+id="(\d+)"[^>]*(?:\s+name="([^"]*)")?>([\s\S]*?)<\/state>/g;
    let m2;
    while(m2=sRe.exec(xml)){
      const id=m2[1],nm=m2[2]||'q'+m2[1],blk=m2[3];
      const x=parseFloat((blk.match(/<x>([^<]+)/)||[])[1]||100);
      const y=parseFloat((blk.match(/<y>([^<]+)/)||[])[1]||100);
      sList.push({id,nm,x,y,ini:/<initial/.test(blk),fin:/<final/.test(blk)});
    }
    // Parse transitions
    const tList=[];
    const tRe=/<transition>([\s\S]*?)<\/transition>/g;
    while(m2=tRe.exec(xml)){
      const b=m2[1];
      const fr=(b.match(/<from>(\d+)/)||[])[1];
      const to=(b.match(/<to>(\d+)/)||[])[1];
      const rd=(b.match(/<read>([^<]*)<\/read>/)||[])[1]||'';
      const wr=(b.match(/<write>([^<]*)<\/write>/)||[])[1];
      const mv=(b.match(/<move>([^<]*)<\/move>/)||[])[1];
      const pp=(b.match(/<pop>([^<]*)<\/pop>/)||[])[1];
      const ps=(b.match(/<push>([^<]*)<\/push>/)||[])[1];
      tList.push({fr,to,rd,wr,mv,pp,ps});
    }
    // Detect mode
    let jMode='dfa';
    if(type==='turing') jMode='tm';
    else if(type==='pda') jMode='pda';
    else { // fa: DFA or NFA?
      const seen=new Set();
      for(const t of tList){
        const k=t.fr+','+t.rd;
        if(!t.rd || seen.has(k)){jMode='nfa';break;}
        seen.add(k);
      }
    }
    // Map ids → labels
    const idMap={};
    sList.forEach((s,i)=>{idMap[s.id]='q'+i;});
    // Normalize positions
    const xs=sList.map(s=>s.x),ys=sList.map(s=>s.y);
    const mnx=Math.min(...xs),mny=Math.min(...ys);
    const Mx=Math.max(...xs)-mnx||1,My=Math.max(...ys)-mny||1;
    const sc=Math.min(400/Mx,250/My,.9);
    // Build states
    const states=sList.map((s,i)=>({id:idMap[s.id],x:30+(s.x-mnx)*sc,y:30+(s.y-mny)*sc,
      label:idMap[s.id],start:s.ini,accept:s.fin,reject:false}));
    // Build transitions
    const edgeMap={};
    tList.forEach(t=>{
      const fk=idMap[t.fr],tk=idMap[t.to];
      let sym;
      if(jMode==='tm'){
        const r=t.rd||'␣',w=t.wr||'␣',d=t.mv||'R';
        sym=r+'/'+w+','+d;
      } else if(jMode==='pda'){
        sym=(t.rd||'ε')+','+(t.pp||'ε')+'→'+(t.ps||'ε');
      } else {
        sym=t.rd||'ε';
      }
      const ek=fk+'>'+tk;
      if(!edgeMap[ek])edgeMap[ek]={fr:fk,to:tk,syms:[]};
      if(!edgeMap[ek].syms.includes(sym))edgeMap[ek].syms.push(sym);
      // TM extra fields
      if(jMode==='tm'){
        edgeMap[ek].tmRead=t.rd||'␣';
        edgeMap[ek].tmWrite=t.wr||'␣';
        edgeMap[ek].tmDir=t.mv||'R';
      }
    });
    const trans=Object.values(edgeMap).map((e,i)=>({...e,id:'_j'+i}));
    // Compute sigma
    const sigma=[...new Set(tList.map(t=>t.rd).filter(r=>r&&r!=='ε'))].sort();
    // Switch mode and load
    setMode(jMode);
    setSts(states);setTrs(trans);
    setBatch(sigma.slice(0,2).map(s=>s+s).join('\n')+'\n'+sigma[0]||'');
    setSelP({id:'_jff',nm:[li?'JFF Import':'JFF İçe Aktarma',li?'JFF Import':'JFF İçe Aktarma'],
      ds:['JFLAP .jff dosyasından yüklendi','Loaded from JFLAP .jff file'],
      pre:null,learn:null,chg:null,a:sigma.length?sigma:['a','b'],s:states,t:trans});
    clearSim();
  },[li]);

  const onJFFFile=useCallback(e=>{
    const f=e.target.files?.[0]; if(!f)return;
    const reader=new FileReader();
    reader.onload=ev=>parseJFF(ev.target.result);
    reader.readAsText(f);
    e.target.value=''; // allow re-import
  },[parseJFF]);

  const path=mode==="nfa"?res?.steps:mode==="tm"||mode==="pda"?res?.snaps||res?.hist:res?.path;
  const mx=path?path.length-1:0;

  // ── Animate a single transition ────────────────────────────
  const animateStep = useCallback((fromSt,toSt,sym,offset,onDone)=>{
    startT.current=performance.now();
    const tick=(now)=>{
      const p=Math.min((now-startT.current)/ANIM_DUR,1);
      // ease-in-out
      const e=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      setAnim({from:fromSt,to:toSt,sym,progress:e,offset});
      if(p<1) rafRef.current=requestAnimationFrame(tick);
      else{setAnim(null);onDone();}
    };
    rafRef.current=requestAnimationFrame(tick);
  },[]);

  // ── Get transition edge offset for a given from→to ────────
  const getOffset=useCallback((from,to)=>{
    const hasRev=trs.some(t=>t.fr===to&&t.to===from);
    if(!hasRev||from===to)return 0;
    return from<to?1:-1;
  },[trs]);

  // ── Run simulation ────────────────────────────────────────
  const run=()=>{
    if(!sts.length)return;
    const r=sim(sts,trs,inp); setRes(r); setStep(0); setPlaying(false); setAnim(null);
    // Faz 5: Get verbose diagnostics for DFA mode
    if(mode==="dfa"&&!r.ok) {
      const v=simDFA_verbose(sts,trs,inp);
      r._failMsg=v.failMessage?v.failMessage[lang==="en"?"en":"tr"]:null;
    }
    cancelAnimationFrame(rafRef.current);
  };

  // ── Play (auto-animate all steps) ──────────────────────────
  const play=useCallback(()=>{
    if(!res||!path||path.length<2)return;
    setPlaying(true);
    let i=0; setStep(0);
    const next=()=>{
      if(i>=path.length-1){setPlaying(false);setStep(path.length-1);return;}
      // Get from/to states for DFA
      if(mode==="dfa"&&res.path){
        const cur=res.path[i],nxt=res.path[i+1];
        if(cur&&nxt){
          animateStep(cur.st,nxt.st,inp[i],getOffset(cur.st,nxt.st),()=>{
            i++;setStep(i);next();
          });
        } else{i++;setStep(i);next();}
      } else {
        // Non-DFA: simple timed steps
        setTimeout(()=>{i++;setStep(i);next();},ANIM_DUR);
      }
    };
    next();
  },[res,path,mode,inp,animateStep,getOffset]);

  const stop=()=>{setPlaying(false);cancelAnimationFrame(rafRef.current);setAnim(null);};

  // Step forward with animation
  const stepFwd=useCallback(()=>{
    if(!res||step>=mx)return;
    if(mode==="dfa"&&res.path){
      const cur=res.path[step],nxt=res.path[step+1];
      if(cur&&nxt){
        animateStep(cur.st,nxt.st,inp[step],getOffset(cur.st,nxt.st),()=>setStep(s=>s+1));
        return;
      }
    }
    setStep(s=>s+1);
  },[res,step,mx,mode,inp,animateStep,getOffset]);

  // Active transition for edge glow (when NOT animating)
  const actTrans=useMemo(()=>{
    if(anim)return{from:anim.from,to:anim.to};
    if(!res||step<0||mode!=="dfa"||!res.path?.[step])return null;
    const cur=res.path[step],nxt=res.path[step+1];
    if(!nxt||step>=inp.length)return null;
    return{from:cur.st,to:nxt.st};
  },[anim,res,step,mode,inp]);

  const runB=()=>{if(!sts.length)return;setBatchR(batch.split("\n").map(s=>s.trim()).filter(Boolean).map(s=>{
    const r=sim(sts,trs,s);
    let diag=null;
    if(mode==="dfa"&&!r.ok){const v=simDFA_verbose(sts,trs,s);diag=v.failMessage?v.failMessage[lang==="en"?"en":"tr"]:null;}
    return{inp:s||"ε",ok:r.ok,diag};
  }));};

  const fD=useMemo(()=>!sts.length?null:{Q:sts.map(s=>s.label),q0:sts.find(s=>s.start)?.label||"?",F:sts.filter(s=>s.accept).map(s=>s.label)},[sts]);
  const dc=[C.ok,C.warn,C.err],dl=[["Temel","Basic"],["Orta","Medium"],["İleri","Advanced"]];

  // Cleanup on unmount
  useEffect(()=>()=>cancelAnimationFrame(rafRef.current),[]);

  return(<div style={{animation:"fadeIn .3s ease-out"}}>
    {/* Mode ribbon */}
    <div style={{display:"flex",gap:5,marginBottom:18}}>
      {MODES.map(m=>{const ac=mode===m.id;return(
        <button key={m.id} onClick={()=>sw(m.id)} style={{flex:1,padding:"13px 10px",borderRadius:14,position:"relative",overflow:"hidden",
          border:`1.5px solid ${ac?m.c:`${m.c}0c`}`,background:C.s1,transition:"all .25s",opacity:ac?1:.6}}
          onMouseEnter={e=>{if(!ac)e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{if(!ac)e.currentTarget.style.opacity=".6";}}>
          {ac&&<div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${m.g})`,opacity:.05}}/>}
          {ac&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${m.c},transparent)`}}/>}
          <div style={{position:"relative",textAlign:"center"}}>
            <div style={{fontSize:17,fontWeight:900,color:ac?m.c:C.ts,fontFamily:F.m,letterSpacing:".04em"}}>{m.id.toUpperCase()}</div>
            <div style={{fontSize:8,color:C.ts,fontFamily:F.s,marginTop:1}}>{MD[m.id][lang==="en"?"en":"tr"]}</div>
          </div>
        </button>);})}
    </div>

    {/* Split layout */}
    <div style={{display:"flex",gap:14,alignItems:"start"}}>
      {/* LEFT: Presets */}
      <div style={{width:240,flexShrink:0,position:"sticky",top:110}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:12,fontWeight:800,color:col,fontFamily:F.s}}>{li?"Examples":"Örnekler"}</span>
          <div style={{display:"flex",gap:4}}>
            <input ref={fileRef} type="file" accept=".jff,.xml" style={{display:"none"}} onChange={onJFFFile}/>
            <button onClick={()=>fileRef.current?.click()} style={{fontSize:9,fontWeight:700,color:"#22d3ee",fontFamily:F.s,padding:"2px 7px",borderRadius:4,background:"#22d3ee08",border:"1px solid #22d3ee18",cursor:"pointer"}}
              title={li?"Import JFLAP .jff file":"JFLAP .jff dosyası içe aktar"}>📂 JFF</button>
            <button onClick={clr} style={{fontSize:9,fontWeight:700,color:C.err,fontFamily:F.s,padding:"2px 7px",borderRadius:4,background:`${C.err}08`,border:`1px solid ${C.err}12`}}>{li?"Clear":"Temizle"}</button>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7,maxHeight:"calc(100vh - 220px)",overflowY:"auto",paddingRight:3}}>
          {presets.map(p=>{const ac=selP?.id===p.id,di=Math.min(p.dif-1,2);return(
            <button key={p.id} onClick={()=>load(p)} style={{padding:0,borderRadius:13,textAlign:"left",overflow:"hidden",
              border:`1.5px solid ${ac?col:C.bd}`,background:ac?C.s2:C.s1,transition:"all .2s",
              boxShadow:ac?`0 5px 20px ${col}10`:"none"}}
              onMouseEnter={e=>{if(!ac)e.currentTarget.style.borderColor=`${col}28`;}}
              onMouseLeave={e=>{if(!ac)e.currentTarget.style.borderColor=ac?col:C.bd;}}>
              <div style={{background:`${col}03`,borderBottom:`1px solid ${ac?`${col}10`:C.bd}`,padding:"2px 4px",position:"relative"}}>
                <Mini S={p.s} T={p.t} c={col}/>
                <div style={{position:"absolute",top:4,right:5,padding:"1px 5px",borderRadius:3,fontSize:7,fontWeight:800,background:`${dc[di]}12`,color:dc[di]}}>{dl[di][li]}</div>
              </div>
              <div style={{padding:"7px 9px 9px"}}>
                <div style={{fontSize:12,fontWeight:800,color:ac?col:C.wh,fontFamily:F.s,marginBottom:2}}>{p.nm[li]}</div>
                <div style={{fontSize:9,color:C.ts,lineHeight:1.4,fontFamily:F.s}}>{p.ds[li]}</div>
                {ac&&<div style={{marginTop:5,display:"flex",flexDirection:"column",gap:3,animation:"fadeUp .12s ease-out"}}>
                  {p.pre&&<div style={{padding:"4px 7px",borderRadius:6,fontSize:8.5,lineHeight:1.4,fontFamily:F.s,background:`${"#f472b6"}05`,border:`1px solid ${"#f472b6"}0c`,color:"#f472b6"}}>
                    ⚡ <span style={{fontWeight:700}}>{li?"Prereq":"Ön Koşul"}:</span> {p.pre[li]}
                  </div>}
                  <div style={{padding:"4px 7px",borderRadius:6,fontSize:8.5,lineHeight:1.4,fontFamily:F.s,background:"#22d3ee05",border:"1px solid #22d3ee0c",color:"#22d3ee"}}>📖 {p.learn[li]}</div>
                  <div style={{padding:"4px 7px",borderRadius:6,fontSize:8.5,lineHeight:1.4,fontFamily:F.s,background:`${C.warn}05`,border:`1px solid ${C.warn}0c`,color:C.warn}}>{p.chg[li]}</div>
                </div>}
              </div>
            </button>);})}
        </div>
        <div style={{marginTop:7,padding:"6px 9px",borderRadius:8,background:`${col}04`,border:`1px solid ${col}0c`}}>
          <div style={{fontSize:7.5,color:col,fontWeight:800,letterSpacing:".06em",fontFamily:F.s}}>TIPS</div>
          <div style={{fontSize:8.5,color:C.tm,lineHeight:1.5,fontFamily:F.s}}>{MD[mode].tip[lang==="en"?"en":"tr"]}</div>
        </div>
      </div>

      {/* CENTER: Workspace */}
      <div style={{flex:1,minWidth:0}}>
        {selP&&<div style={{marginBottom:8,padding:"8px 14px",borderRadius:11,border:`1px solid ${col}15`,background:C.s1,
          display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${mc.g})`,opacity:.03}}/>
          <div style={{position:"relative",display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:6,height:6,borderRadius:3,background:col,boxShadow:`0 0 8px ${col}40`,animation:"pulse 1.5s ease-in-out infinite"}}/>
            <span style={{fontSize:12,fontWeight:800,color:col,fontFamily:F.s}}>{selP.nm[li]}</span>
            <span style={{fontSize:9.5,color:C.ts,fontFamily:F.s}}>· {li?"modify":"düzenle"}</span>
          </div>
          <span style={{position:"relative",fontSize:10,fontFamily:F.m,color:C.ts}}>{sts.length}Q·{trs.length}δ</span>
        </div>}

        <Canvas states={sts} setStates={s=>{setSts(s);clearSim();}} trans={trs} setTrans={t=>{setTrs(t);clearSim();}}
          color={col} mode={mode} alphabet={alph}
          activeId={mode==="dfa"&&res&&step>=0?res.path?.[step]?.st:null}
          activeSet={mode==="nfa"&&res&&step>=0?res.steps?.[step]?.sts:null}
          activeTrans={actTrans} anim={anim} height={sts.length>5?400:340}/>

        {/* Formal def */}
        {sts.length>0&&<div style={{marginTop:7}}>
          <button onClick={()=>setShowDef(v=>!v)} style={{padding:"4px 12px",borderRadius:6,fontSize:10,fontWeight:700,fontFamily:F.s,color:col,background:`${col}06`,border:`1px solid ${col}10`}}>
            𝑀 {li?"Def":"Tanım"} {showDef?"▾":"▸"}</button>
          {showDef&&fD&&<div style={{marginTop:5,padding:"10px 14px",borderRadius:11,background:`${col}03`,border:`1px solid ${col}0c`,
            fontFamily:F.m,fontSize:12,color:C.tx,lineHeight:2,animation:"fadeUp .1s ease-out"}}>
            <span style={{color:col,fontWeight:800}}>M</span>=(Q,Σ,δ,q₀,F) Q={"{"}{fD.Q.join(",")}{"}"}  Σ={"{"}{alph.join(",")}{"}"}  q₀=<span style={{color:col,fontWeight:700}}>{fD.q0}</span>  F={"{"}<span style={{color:C.ok}}>{fD.F.join(",")}</span>{"}"} |δ|={trs.length}
          </div>}
        </div>}

        {/* ═══ SIMULATOR ═══ */}
        <div style={{marginTop:12,borderRadius:16,overflow:"hidden",border:`1px solid ${col}12`,background:C.s1}}>
          <div style={{padding:"9px 16px",borderBottom:`1px solid ${col}08`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${mc.g})`,opacity:.03}}/>
            <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13,fontWeight:900,color:col,fontFamily:F.s}}>▶ {li?"Simulator":"Simülatör"}</span>
              {res&&<div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:10,fontFamily:F.m,color:C.ts}}>{step+1}/{(path||[]).length}</span>
                <div style={{width:80,height:3,borderRadius:2,background:`${col}12`}}>
                  <div style={{height:"100%",borderRadius:2,transition:"width .2s",width:`${((step+1)/Math.max((path||[]).length,1))*100}%`,background:col}}/>
                </div>
              </div>}
            </div>
          </div>
          <div style={{padding:14}}>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
              <input value={inp} onChange={e=>{setInp(e.target.value);clearSim();}} placeholder={mode==="pda"?"0011":mode==="tm"?"010":"aab"}
                onKeyDown={e=>{if(e.key==="Enter")run();}}
                style={{flex:1,maxWidth:180,padding:"8px 13px",borderRadius:9,border:`1.5px solid ${col}18`,background:C.bg,color:C.wh,fontFamily:F.m,fontSize:14,outline:"none"}}/>
              <Btn color={col} onClick={run} style={{padding:"8px 20px",fontSize:13,fontWeight:900}}>▶</Btn>
              {res&&!playing&&<Btn color={col} variant="outline" onClick={play} style={{padding:"6px 12px",fontSize:10}}>⏵ {li?"Play":"Oynat"}</Btn>}
              {playing&&<Btn color={C.err} variant="outline" onClick={stop} style={{padding:"6px 12px",fontSize:10}}>⏸</Btn>}
              {res&&!playing&&step>0&&<Btn color={C.ts} variant="outline" onClick={()=>setStep(s=>Math.max(s-1,0))} style={{padding:"5px 9px",fontSize:10}}>◀</Btn>}
              {res&&!playing&&step<mx&&<Btn color={C.ts} variant="outline" onClick={stepFwd} style={{padding:"5px 9px",fontSize:10}}>▶</Btn>}
            </div>
            {res&&<InputVis str={inp} step={step} color={col} total={mx} ok={step>=mx?res.ok:undefined} failMsg={step>=mx&&!res.ok?res._failMsg:null}/>}

            {/* DFA trace */}
            {res&&step>=0&&mode==="dfa"&&res.path?.[step]&&(
              <div style={{padding:"7px 11px",borderRadius:9,background:`${col}04`,marginTop:6,fontFamily:F.m,fontSize:12,color:C.tx}}>
                <span style={{color:col,fontWeight:700}}>δ(</span>{sts.find(s=>s.id===res.path[step].st)?.label}
                <span style={{color:col}}>,</span> <span style={{color:C.warn}}>{step<inp.length?inp[step]:"∅"}</span>
                <span style={{color:col,fontWeight:700}}>{") → "}</span>
                {step+1<res.path.length?sts.find(s=>s.id===res.path[step+1].st)?.label:"—"}
              </div>)}
            {/* NFA active states */}
            {res&&step>=0&&mode==="nfa"&&res.steps?.[step]&&(
              <div style={{padding:"7px 11px",borderRadius:9,background:`${col}04`,marginTop:6,fontFamily:F.m,fontSize:12}}>
                <span style={{color:col,fontWeight:700}}>{li?"Active":"Aktif"}: </span>
                <span style={{color:C.tx}}>{"{"}{[...res.steps[step].sts].map(sid=>sts.find(s=>s.id===sid)?.label||sid).join(",")}{"}"}
                </span>
              </div>)}
            {/* TM tape */}
            {mode==="tm"&&res&&step>=0&&res.snaps?.[step]&&(
              <div style={{marginTop:8,padding:10,borderRadius:11,background:C.bg,border:`1px solid ${C.bd}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:9,color:C.ts,fontWeight:800,fontFamily:F.s}}>TAPE</span>
                  <span style={{fontSize:9,color:col,fontWeight:700,fontFamily:F.m}}>q={res.snaps[step].st}</span>
                </div>
                <div style={{display:"flex",gap:3,overflowX:"auto"}}>
                  {res.snaps[step].tape.map((c,i)=>{const hd=i===res.snaps[step].hd;return(
                    <div key={i} style={{position:"relative",flexShrink:0}}>
                      {hd&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",fontSize:8,color:col,fontWeight:900}}>▾</div>}
                      <div style={{width:34,height:34,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:15,fontFamily:F.m,fontWeight:800,background:hd?`${col}16`:C.s1,border:`2px solid ${hd?col:C.bd}`,
                        color:hd?C.wh:C.tx,boxShadow:hd?`0 0 14px ${col}18`:"none",transition:"all .15s"}}>{c}</div>
                    </div>);})}
                </div>
              </div>)}
            {/* PDA stack */}
            {mode==="pda"&&res&&step>=0&&res.hist?.[step]&&(
              <div style={{marginTop:8,padding:10,borderRadius:11,background:C.bg,border:`1px solid ${C.bd}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:9,color:C.ts,fontWeight:800,fontFamily:F.s}}>STACK</span>
                  <span style={{fontSize:9,color:col,fontWeight:700,fontFamily:F.m}}>q={res.hist[step].st||"?"}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column-reverse",gap:2,alignItems:"center",minHeight:36}}>
                  {(res.hist[step].stk||[]).map((c,i)=><div key={i} style={{width:42,height:28,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:14,fontFamily:F.m,fontWeight:800,background:`${col}0c`,border:`1.5px solid ${col}1a`,color:col}}>{c}</div>)}
                  {!(res.hist[step].stk?.length)&&<div style={{fontSize:10,color:C.tm,fontFamily:F.m,padding:8}}>∅</div>}
                </div>
              </div>)}
          </div>
        </div>

        {/* ═══ BATCH TEST ═══ */}
        <div style={{marginTop:10,borderRadius:16,overflow:"hidden",border:`1px solid ${C.bd}`,background:C.s1}}>
          <div style={{padding:"9px 16px",borderBottom:`1px solid ${C.bd}`,background:C.gl}}>
            <span style={{fontSize:12,fontWeight:800,color:C.ts,fontFamily:F.s}}>📋 {t("batchTest")}</span>
          </div>
          <div style={{padding:14}}>
            <div style={{display:"flex",gap:6}}>
              <textarea value={batch} onChange={e=>setBatch(e.target.value)} rows={3} placeholder={selP?.test||"ab\naab\nba"}
                style={{flex:1,padding:"8px 12px",borderRadius:9,border:`1px solid ${C.bd}`,background:C.bg,color:C.wh,fontFamily:F.m,fontSize:11,resize:"vertical",outline:"none"}}/>
              <Btn color={col} onClick={runB} style={{alignSelf:"flex-start",padding:"8px 18px",fontSize:11,fontWeight:800}}>{t("run")}</Btn>
            </div>
            {batchR&&<div style={{marginTop:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:900,color:C.ok,fontFamily:F.m}}>{batchR.filter(r=>r.ok).length}✓</span>
                <span style={{fontSize:13,fontWeight:900,color:C.err,fontFamily:F.m}}>{batchR.filter(r=>!r.ok).length}✗</span>
                <div style={{flex:1,height:5,borderRadius:3,background:C.gl2,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:3,width:`${(batchR.filter(r=>r.ok).length/Math.max(batchR.length,1))*100}%`,background:C.ok,transition:"width .3s"}}/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:3}}>
                {batchR.map((r,i)=><div key={i} title={r.diag||""} style={{display:"flex",justifyContent:"space-between",padding:"4px 7px",borderRadius:6,
                  background:r.ok?`${C.ok}05`:`${C.err}05`,border:`1px solid ${r.ok?C.ok:C.err}0c`,fontFamily:F.m,fontSize:10,cursor:r.diag?"help":"default"}}>
                  <span style={{color:C.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{r.inp}"</span>
                  <span style={{fontWeight:800,color:r.ok?C.ok:C.err,marginLeft:3}}>{r.ok?"✓":"✗"}</span>
                </div>)}
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  </div>);
}
