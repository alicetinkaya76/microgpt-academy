// ═══════════════════════════════════════════════════════════════
// BuildChallenge.jsx v6 — Mini DFA/NFA/PDA/TM builder
// Student builds automaton & checks against test cases
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { C, F, Card, Btn, useI18n } from "../theme";
import { simDFA, simNFA, simPDA, simTM } from "../engines";

export const BUILD_CHALLENGES = [
  // ─── M1: DFA builds ────────────────────────────────────────
  {
    id:"b_m1_1", module:"m1", mode:"dfa",
    title:["3-Durum DFA \u0130n\u015fa: 'ab' ile biten","Build 3-State DFA: ends with 'ab'"],
    desc:["'ab' ile biten stringleri kabul eden 3 durumlu DFA in\u015fa edin. \u03a3={a,b}",
          "Build a 3-state DFA accepting strings ending with 'ab'. \u03a3={a,b}"],
    alphabet:["a","b"],
    testCases:[["ab",true],["aab",true],["bab",true],["a",false],["ba",false],["",false],["abb",false]],
    hint:["3 durum: q0(ba\u015flang\u0131\u00e7), q1(son a), q2(son ab=kabul)",
          "3 states: q0(start), q1(last a), q2(last ab=accept)"],
    maxStates:3
  },
  {
    id:"b_m1_2", module:"m1", mode:"dfa",
    title:["2-Durum DFA: tek say\u0131da 'b'","Build 2-State DFA: odd number of 'b'"],
    desc:["Tek say\u0131da 'b' i\u00e7eren stringleri kabul eden 2 durumlu DFA. \u03a3={a,b}",
          "Build a 2-state DFA accepting strings with odd number of 'b'. \u03a3={a,b}"],
    alphabet:["a","b"],
    testCases:[["b",true],["ab",true],["bab",true],["",false],["bb",false],["aabb",false]],
    hint:["Parite DFA: 2 durum (\u00e7ift/tek). 'a' self-loop, 'b' toggle.",
          "Parity DFA: 2 states (even/odd). 'a' self-loop, 'b' toggle."],
    maxStates:2
  },
  {
    id:"b_m1_3", module:"m1", mode:"dfa",
    title:["4-Durum DFA: en az 1 a ve 1 b","Build 4-State DFA: at least 1 a and 1 b"],
    desc:["En az 1 'a' ve 1 'b' i\u00e7eren stringleri kabul eden DFA. \u03a3={a,b}",
          "Build a DFA accepting strings with at least 1 'a' and 1 'b'. \u03a3={a,b}"],
    alphabet:["a","b"],
    testCases:[["ab",true],["ba",true],["aab",true],["a",false],["bbb",false],["",false]],
    hint:["Kartezyen \u00e7arp\u0131m: {a g\u00f6rd\u00fc?}\u00d7{b g\u00f6rd\u00fc?} = 4 durum.",
          "Cartesian product: {seen a?}\u00d7{seen b?} = 4 states."],
    maxStates:4
  },
  // ─── M2: NFA build ─────────────────────────────────────────
  {
    id:"b_m2_1", module:"m2", mode:"nfa",
    title:["NFA \u0130n\u015fa: 'a' ile biten (2 durum)","Build NFA: ends with 'a' (2 states)"],
    desc:["'a' ile biten stringleri kabul eden 2 durumlu NFA. Eksik ge\u00e7i\u015f olabilir!",
          "Build a 2-state NFA accepting strings ending with 'a'. Missing transitions OK!"],
    alphabet:["a","b"],
    testCases:[["a",true],["ba",true],["aba",true],["b",false],["ab",false],["",false]],
    hint:["q0: self-loop a,b. q0'dan a ile q1'e (kabul).",
          "q0: self-loop a,b. From q0 on 'a' go to q1 (accept)."],
    maxStates:2
  },
  // ─── M4: PDA builds ────────────────────────────────────────
  {
    id:"b_m4_1", module:"m4", mode:"pda",
    title:["PDA \u0130n\u015fa: 0\u207f1\u207f kabul eden","Build PDA: accepts 0\u207f1\u207f"],
    desc:["0\u207f1\u207f dilini kabul eden PDA in\u015fa edin. Format: kaynak, oku pop\u2192push, hedef",
          "Build a PDA that accepts 0\u207f1\u207f. Format: from, read pop\u2192push, to"],
    alphabet:["0","1"],
    testCases:[["01",true],["0011",true],["000111",true],["",true],["10",false],["011",false],["001",false]],
    hint:["3 durum. q0: 0 okurken A push et. q1: 1 okurken A pop et. q2: stack bo\u015f = kabul.",
          "3 states. q0: push A on 0. q1: pop A on 1. q2: empty stack = accept."],
    maxStates:4,
    inputFormat:"pda"
  },
  {
    id:"b_m4_2", module:"m4", mode:"pda",
    title:["PDA \u0130n\u015fa: Dengeli parantez","Build PDA: balanced parentheses"],
    desc:["Dengeli parantezleri kabul eden PDA in\u015fa edin. \u00d6rn: (()) \u2713, (() \u2717",
          "Build a PDA accepting balanced parentheses. Ex: (()) \u2713, (() \u2717"],
    alphabet:["(",")"],
    testCases:[["()",true],["(())",true],["()()",true],["",true],["(",false],["())",false],[")(", false]],
    hint:["2 durum yeter. '(' gelince stack'e push, ')' gelince pop. Sonda stack bo\u015f = kabul.",
          "2 states enough. Push on '(', pop on ')'. Empty stack at end = accept."],
    maxStates:3,
    inputFormat:"pda"
  },
  // ─── M5: TM builds ─────────────────────────────────────────
  {
    id:"b_m5_1", module:"m5", mode:"tm",
    title:["TM \u0130n\u015fa: T\u00fcm 0'lar\u0131 1'e \u00e7evir","Build TM: convert all 0s to 1s"],
    desc:["Banttaki t\u00fcm 0'lar\u0131 1'e \u00e7eviren TM in\u015fa edin. Format: kaynak, oku/yaz/y\u00f6n, hedef",
          "Build a TM that converts all 0s to 1s. Format: from, read/write/dir, to"],
    alphabet:["0","1"],
    testCases:[["010",true],["000",true],["111",true],["",true]],
    expectedOutput:{
      "010":"111","000":"111","111":"111","":"",
    },
    hint:["2 durum: scan + halt. scan: 0\u21921/R, 1\u21921/R, \u2423\u2192\u2423/S\u2192halt.",
          "2 states: scan + halt. scan: 0\u21921/R, 1\u21921/R, \u2423\u2192\u2423/S\u2192halt."],
    maxStates:3,
    inputFormat:"tm"
  },
  {
    id:"b_m5_2", module:"m5", mode:"tm",
    title:["TM \u0130n\u015fa: String'i ters \u00e7evir (zor!)","Build TM: reverse string (hard!)"],
    desc:["Banttaki binary stringi ters \u00e7eviren TM in\u015fa edin. \u00d6rn: '01' \u2192 '10'. Bu zor bir g\u00f6rev!",
          "Build a TM that reverses a binary string. Ex: '01' \u2192 '10'. This is hard!"],
    alphabet:["0","1"],
    testCases:[["01",true],["10",true],["001",true]],
    expectedOutput:{
      "01":"10","10":"01","001":"100",
    },
    hint:["Strateji: Son karakteri oku\u2192i\u015faretle\u2192ba\u015fa git\u2192yaz. Tekrarla. \u00c7ok durum gerekir (6+).",
          "Strategy: Read last\u2192mark\u2192go to start\u2192write. Repeat. Needs 6+ states."],
    maxStates:12,
    inputFormat:"tm"
  }
];

// ── BuildChallenge Component ─────────────────────────────────
export default function BuildChallenge({ challenge }) {
  const { lang } = useI18n();
  const li = lang === "en" ? 1 : 0;
  const ch = challenge;
  const isPDA = ch.mode === "pda";
  const isTM = ch.mode === "tm";

  const [statesInput, setStatesInput] = useState("");
  const [startState, setStartState] = useState("");
  const [acceptStates, setAcceptStates] = useState("");
  const [transInput, setTransInput] = useState("");
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const check = () => {
    const stNames = statesInput.split(",").map(s => s.trim()).filter(Boolean);
    if (!stNames.length) { setResult({ ok: false, msg: li ? "Define states first" : "\u00d6nce durumlar\u0131 tan\u0131mla" }); return; }
    if (stNames.length > (ch.maxStates || 10)) {
      setResult({ ok: false, msg: li ? `Max ${ch.maxStates} states` : `En fazla ${ch.maxStates} durum` }); return;
    }

    const states = stNames.map(id => ({
      id, label: id,
      start: id === startState.trim(),
      accept: acceptStates.split(",").map(s => s.trim()).includes(id),
      reject: false
    }));

    if (!states.some(s => s.start)) {
      setResult({ ok: false, msg: li ? "Set a start state" : "Ba\u015flang\u0131\u00e7 durumu belirle" }); return;
    }

    // Parse transitions
    const trans = [];
    transInput.split("\n").forEach(line => {
      const l = line.trim();
      if (!l) return;

      if (isTM) {
        // TM format: from, read/write/dir, to   OR   from, read write dir, to
        const parts = l.split(",").map(s => s.trim());
        if (parts.length >= 3) {
          const rwdRaw = parts.slice(1, parts.length - 1).join(",");
          const rwd = rwdRaw.split(/[\s\/]+/);
          const toSt = parts[parts.length - 1];
          if (rwd.length >= 3) {
            trans.push({ id: `t${trans.length}`, fr: parts[0], to: toSt,
              syms: [`${rwd[0]}/${rwd[1]},${rwd[2]}`],
              tmRead: rwd[0], tmWrite: rwd[1], tmDir: rwd[2] });
          }
        }
      } else if (isPDA) {
        // PDA format: from, read pop→push, to   OR   from, read,pop,push, to
        const parts = l.split(",").map(s => s.trim());
        if (parts.length >= 3) {
          const mid = parts.slice(1, parts.length - 1).join(",");
          const toSt = parts[parts.length - 1];
          // Try "read pop→push" or "read, pop → push"
          const m = mid.match(/^(.+?)\s+(.+?)\s*[→>]\s*(.+)$/);
          if (m) {
            trans.push({ id: `t${trans.length}`, fr: parts[0], to: toSt,
              syms: [`${m[1].trim()}, ${m[2].trim()} \u2192 ${m[3].trim()}`] });
          } else {
            // fallback: from, read, pop, push, to (5 parts)
            if (parts.length >= 5) {
              trans.push({ id: `t${trans.length}`, fr: parts[0], to: parts[4],
                syms: [`${parts[1]}, ${parts[2]} \u2192 ${parts[3]}`] });
            }
          }
        }
      } else {
        // DFA/NFA format: from, symbol, to
        const parts = l.split(",").map(s => s.trim());
        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
          trans.push({ fr: parts[0], to: parts[2], syms: [parts[1]] });
        }
      }
    });

    // Run test cases
    let allOk = true;
    const results = ch.testCases.map(([inp, expected]) => {
      let r;
      if (isTM) {
        r = simTM(states, trans, inp);
        const got = r.ok;
        // Also check output if expectedOutput defined
        if (ch.expectedOutput && ch.expectedOutput[inp] !== undefined) {
          const outTape = r.snaps && r.snaps.length > 0
            ? r.snaps[r.snaps.length - 1].tape.join("").replace(/\u2423+$/, "")
            : "";
          const expOut = ch.expectedOutput[inp];
          const pass = outTape === expOut;
          if (!pass) allOk = false;
          return { inp: inp || "\u03b5", expected: expOut, got: outTape, pass, isTape: true };
        }
        const pass = got === expected;
        if (!pass) allOk = false;
        return { inp: inp || "\u03b5", expected, got, pass };
      } else if (isPDA) {
        r = simPDA(states, trans, inp);
        const pass = r.ok === expected;
        if (!pass) allOk = false;
        return { inp: inp || "\u03b5", expected, got: r.ok, pass };
      } else {
        const sim = ch.mode === "nfa" ? simNFA : simDFA;
        r = sim(states, trans, inp);
        const pass = r.ok === expected;
        if (!pass) allOk = false;
        return { inp: inp || "\u03b5", expected, got: r.ok, pass };
      }
    });

    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    setResult({ ok: allOk, passed, total, results,
      msg: allOk
        ? (li ? "\ud83c\udf89 Perfect! Your automaton is correct!" : "\ud83c\udf89 M\u00fckemmel! Otomat\u0131n\u0131z do\u011fru!")
        : `${passed}/${total} ${li ? "test cases passed" : "test ge\u00e7ti"}`
    });
  };

  // Format help text
  const formatHelp = isPDA
    ? (li ? "from, read pop\u2192push, to  (e.g.: q0, 0 \u03b5\u2192A, q0)" : "kaynak, oku pop\u2192push, hedef  (\u00f6rn: q0, 0 \u03b5\u2192A, q0)")
    : isTM
    ? (li ? "from, read/write/dir, to  (e.g.: scan, 0/1/R, scan)" : "kaynak, oku/yaz/y\u00f6n, hedef  (\u00f6rn: scan, 0/1/R, scan)")
    : (li ? "from, symbol, to  (e.g.: q0, a, q1)" : "kaynak, sembol, hedef  (\u00f6rn: q0, a, q1)");

  const placeholder = isPDA
    ? "q0, 0 \u03b5\u2192A, q0\nq0, 1 A\u2192\u03b5, q1\nq1, 1 A\u2192\u03b5, q1\nq1, \u03b5 $\u2192\u03b5, qf"
    : isTM
    ? "scan, 0/1/R, scan\nscan, 1/1/R, scan\nscan, \u2423/\u2423/S, halt"
    : "q0,a,q1\nq0,b,q0\nq1,a,q1\nq1,b,q2";

  const modeColor = isPDA ? "#818cf8" : isTM ? C.ch3 : ch.mode === "nfa" ? "#34d399" : C.info;
  const modeLabel = ch.mode.toUpperCase();

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)}
        style={{ width: "100%", padding: "10px 16px", borderRadius: 10, textAlign: "left",
          border: `1.5px solid ${modeColor}18`, background: `${modeColor}06`,
          fontSize: 12, fontWeight: 700, fontFamily: F.s, color: modeColor }}>
        \ud83d\udd28 {ch.title[li]} <span style={{fontSize:9,opacity:.6,marginLeft:4}}>{modeLabel}</span> \u25b8
      </button>
    );
  }

  return (
    <Card color={result?.ok ? C.ok : modeColor} pad={16} style={{ animation: "fadeUp .15s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: modeColor, fontFamily: F.s }}>\ud83d\udd28 {ch.title[li]}</div>
          <span style={{ padding: "2px 8px", borderRadius: 5, background: `${modeColor}14`,
            fontSize: 9, fontWeight: 700, color: modeColor, fontFamily: F.s }}>{modeLabel}</span>
        </div>
        <button onClick={() => setExpanded(false)}
          style={{ fontSize: 10, color: C.ts, fontFamily: F.s, padding: "2px 8px", borderRadius: 4, background: C.gl2 }}>
          {li ? "Collapse" : "Kapat"}
        </button>
      </div>
      <div style={{ fontSize: 11, color: C.tx, fontFamily: F.s, lineHeight: 1.6, marginBottom: 10 }}>{ch.desc[li]}</div>

      {/* Test cases preview */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {ch.testCases.slice(0, 6).map(([inp, exp], i) => (
          <span key={i} style={{ padding: "2px 8px", borderRadius: 5, fontSize: 9, fontFamily: F.m, fontWeight: 600,
            background: exp ? `${C.ok}0c` : `${C.err}0c`, color: exp ? C.ok : C.err,
            border: `1px solid ${exp ? C.ok : C.err}18` }}>
            "{inp || "\u03b5"}" {exp ? "\u2713" : "\u2717"}
            {ch.expectedOutput && ch.expectedOutput[inp] !== undefined && ` \u2192 "${ch.expectedOutput[inp]}"`}
          </span>
        ))}
      </div>

      {/* Input form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ fontSize: 9, fontWeight: 700, color: C.ts, fontFamily: F.s, textTransform: "uppercase" }}>
            {li ? "States (comma sep)" : "Durumlar (virg\u00fclle)"}</label>
          <input value={statesInput} onChange={e => setStatesInput(e.target.value)}
            placeholder={isPDA ? "q0,q1,qf" : isTM ? "scan,halt" : "q0,q1,q2"}
            style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.bd}`,
              background: C.s1, color: C.wh, fontFamily: F.m, fontSize: 11, outline: "none", marginTop: 2, boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ fontSize: 9, fontWeight: 700, color: C.ts, fontFamily: F.s, textTransform: "uppercase" }}>
            {li ? "Start state" : "Ba\u015flang\u0131\u00e7"}</label>
          <input value={startState} onChange={e => setStartState(e.target.value)}
            placeholder={isPDA ? "q0" : isTM ? "scan" : "q0"}
            style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.bd}`,
              background: C.s1, color: C.wh, fontFamily: F.m, fontSize: 11, outline: "none", marginTop: 2, boxSizing: "border-box" }} />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 9, fontWeight: 700, color: C.ts, fontFamily: F.s, textTransform: "uppercase" }}>
          {li ? "Accept states" : "Kabul durumlar\u0131"}</label>
        <input value={acceptStates} onChange={e => setAcceptStates(e.target.value)}
          placeholder={isPDA ? "qf" : isTM ? "halt" : "q2"}
          style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.bd}`,
            background: C.s1, color: C.wh, fontFamily: F.m, fontSize: 11, outline: "none", marginTop: 2, boxSizing: "border-box" }} />
      </div>
      <div style={{ marginBottom: 4 }}>
        <label style={{ fontSize: 9, fontWeight: 700, color: C.ts, fontFamily: F.s, textTransform: "uppercase" }}>
          {li ? "Transitions (one per line)" : "Ge\u00e7i\u015fler (her sat\u0131ra bir)"}</label>
        <div style={{ fontSize: 8, color: C.ts, fontFamily: F.m, marginTop: 1, marginBottom: 3 }}>{formatHelp}</div>
        <textarea value={transInput} onChange={e => setTransInput(e.target.value)} rows={isPDA || isTM ? 5 : 4}
          placeholder={placeholder}
          style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.bd}`,
            background: C.s1, color: C.wh, fontFamily: F.m, fontSize: 10, outline: "none", resize: "vertical", marginTop: 2, boxSizing: "border-box" }} />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
        <Btn color={C.ok} onClick={check} style={{ padding: "8px 20px", fontSize: 12, fontWeight: 800 }}>
          \ud83d\ude80 {li ? "Check" : "Kontrol Et"}</Btn>
        <button onClick={() => setShowHint(!showHint)}
          style={{ padding: "6px 14px", borderRadius: 7, fontSize: 10, fontWeight: 700, fontFamily: F.s,
            background: `${C.warn}08`, border: `1px solid ${C.warn}18`, color: C.warn }}>
          \ud83d\udca1 {li ? "Hint" : "\u0130pucu"} {showHint ? "\u25be" : "\u25b8"}</button>
      </div>

      {showHint && (
        <div style={{ marginTop: 6, padding: "6px 12px", borderRadius: 7, background: `${C.warn}06`,
          border: `1px solid ${C.warn}12`, fontSize: 10, color: C.tx, fontFamily: F.s, lineHeight: 1.5 }}>
          \ud83d\udca1 {ch.hint[li]}</div>)}

      {/* Results */}
      {result && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: result.ok ? C.ok : C.err, fontFamily: F.s, marginBottom: 4 }}>{result.msg}</div>
          {result.results && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 3 }}>
              {result.results.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 8px", borderRadius: 5,
                  background: r.pass ? `${C.ok}08` : `${C.err}08`, border: `1px solid ${r.pass ? C.ok : C.err}14`,
                  fontFamily: F.m, fontSize: 10 }}>
                  <span style={{ color: C.tx }}>"{r.inp}"</span>
                  <span style={{ fontWeight: 700, color: r.pass ? C.ok : C.err }}>
                    {r.pass ? "\u2713" : r.isTape ? `\u2717 "${r.got}"` : `\u2717 ${r.got ? "\u2713\u2192\u2717" : "\u2717\u2192\u2713"}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
