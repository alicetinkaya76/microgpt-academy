// ═══════════════════════════════════════════════════════════════
// PLGame.jsx — Pumping Lemma Adversarial Game
// Student proves a language is not regular by finding the right
// string w and pump value i to break the pumping lemma
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { C, F, Card, Btn, useI18n } from "../theme";

// ── PL Game Scenarios ────────────────────────────────────────
export const PL_GAMES = [
  {
    id: "pl_1", module: "m3", difficulty: 1,
    title: ["0\u207f1\u207f d\u00fczensiz de\u011fildir", "0\u207f1\u207f is not regular"],
    desc: ["L = {0\u207f1\u207f | n \u2265 0} dilinin d\u00fczensiz oldu\u011funu kan\u0131tlay\u0131n.",
           "Prove that L = {0\u207f1\u207f | n \u2265 0} is not regular."],
    language: "0\u207f1\u207f",
    checkMembership: (s) => {
      const m = s.match(/^(0*)(1*)$/);
      if (!m) return false;
      return m[1].length === m[2].length;
    },
    alphabet: "01",
    suggestedW: (p) => "0".repeat(p) + "1".repeat(p),
    // Given w and xyz decomposition, find i that breaks it
    checkPump: (w, x, y, z, i) => {
      const pumped = x + y.repeat(i) + z;
      const m = pumped.match(/^(0*)(1*)$/);
      if (!m) return true; // not in 0*1* form = not in L
      return m[1].length !== m[2].length; // true if NOT in L (proof works)
    }
  },
  {
    id: "pl_2", module: "m3", difficulty: 1,
    title: ["ww d\u00fczensiz de\u011fildir", "ww is not regular"],
    desc: ["L = {ww | w \u2208 {a,b}*} dilinin d\u00fczensiz oldu\u011funu kan\u0131tlay\u0131n.",
           "Prove that L = {ww | w \u2208 {a,b}*} is not regular."],
    language: "ww",
    checkMembership: (s) => {
      if (s.length % 2 !== 0) return false;
      const half = s.length / 2;
      return s.substring(0, half) === s.substring(half);
    },
    alphabet: "ab",
    suggestedW: (p) => "a".repeat(p) + "b".repeat(p) + "a".repeat(p) + "b".repeat(p),
    checkPump: (w, x, y, z, i) => {
      const pumped = x + y.repeat(i) + z;
      if (pumped.length % 2 !== 0) return true;
      const half = pumped.length / 2;
      return pumped.substring(0, half) !== pumped.substring(half);
    }
  },
  {
    id: "pl_3", module: "m3", difficulty: 2,
    title: ["a\u207fb\u207fc\u207f CFL de\u011fildir", "a\u207fb\u207fc\u207f is not a CFL"],
    desc: ["L = {a\u207fb\u207fc\u207f | n \u2265 0} dilinin ba\u011flamdan ba\u011f\u0131ms\u0131z olmad\u0131\u011f\u0131n\u0131 kan\u0131tlay\u0131n (CFL pumping lemma).",
           "Prove L = {a\u207fb\u207fc\u207f | n \u2265 0} is not context-free (CFL pumping lemma)."],
    language: "a\u207fb\u207fc\u207f",
    checkMembership: (s) => {
      const m = s.match(/^(a*)(b*)(c*)$/);
      if (!m) return false;
      return m[1].length === m[2].length && m[2].length === m[3].length;
    },
    alphabet: "abc",
    suggestedW: (p) => "a".repeat(p) + "b".repeat(p) + "c".repeat(p),
    checkPump: (w, x, y, z, i) => {
      const pumped = x + y.repeat(i) + z;
      const m = pumped.match(/^(a*)(b*)(c*)$/);
      if (!m) return true;
      return !(m[1].length === m[2].length && m[2].length === m[3].length);
    }
  },
  {
    id: "pl_4", module: "m3", difficulty: 2,
    title: ["1^(n\u00b2) d\u00fczensiz de\u011fildir", "1^(n\u00b2) is not regular"],
    desc: ["L = {1^(n\u00b2) | n \u2265 0} (kare say\u0131 uzunluklar) dilinin d\u00fczensiz oldu\u011funu kan\u0131tlay\u0131n.",
           "Prove L = {1^(n\u00b2) | n \u2265 0} (square-length strings) is not regular."],
    language: "1^(n\u00b2)",
    checkMembership: (s) => {
      if (!/^1*$/.test(s)) return false;
      const n = s.length;
      const sq = Math.round(Math.sqrt(n));
      return sq * sq === n;
    },
    alphabet: "1",
    suggestedW: (p) => "1".repeat(p * p),
    checkPump: (w, x, y, z, i) => {
      const pumped = x + y.repeat(i) + z;
      if (!/^1*$/.test(pumped)) return true;
      const n = pumped.length;
      const sq = Math.round(Math.sqrt(n));
      return sq * sq !== n;
    }
  }
];

// ═══════════════════════════════════════════════════════════════
// PLGame Component
// ═══════════════════════════════════════════════════════════════
export default function PLGame({ game }) {
  const { lang } = useI18n();
  const li = lang === "en" ? 1 : 0;
  const sc = game;

  // Game phases
  const [phase, setPhase] = useState(0);
  // 0: intro — system shows p
  // 1: student picks w
  // 2: system shows xyz decomposition, student picks i
  // 3: result

  const [p] = useState(3); // pumping length (fixed at 3 for simplicity)
  const [w, setW] = useState("");
  const [wInput, setWInput] = useState("");
  const [xyz, setXyz] = useState(null); // {x, y, z}
  const [iVal, setIVal] = useState(null);
  const [result, setResult] = useState(null);
  const [usedSuggestion, setUsedSuggestion] = useState(false);

  const mc = "#f59e0b"; // warm amber for PL

  // Phase 1: Student submits w
  const submitW = () => {
    const wStr = wInput.trim();
    if (wStr.length < p) {
      setResult({ ok: false, msg: li ? `|w| must be \u2265 p = ${p}` : `|w| \u2265 p = ${p} olmal\u0131` });
      return;
    }
    if (!sc.checkMembership(wStr)) {
      setResult({ ok: false, msg: li ? "w must be in L!" : "w \u2208 L olmal\u0131!" });
      return;
    }
    setW(wStr);
    setResult(null);

    // System picks xyz decomposition (adversary picks worst case for student)
    // Try all valid decompositions and pick one that makes it hardest
    let bestXyz = null;
    for (let xLen = 0; xLen <= Math.min(p, wStr.length); xLen++) {
      for (let yLen = 1; yLen <= p - xLen && xLen + yLen <= wStr.length; yLen++) {
        if (xLen + yLen > p) continue; // |xy| <= p
        const x = wStr.substring(0, xLen);
        const y = wStr.substring(xLen, xLen + yLen);
        const z = wStr.substring(xLen + yLen);
        // Check how many i values break it — adversary wants fewest breaks
        let breakCount = 0;
        for (let ii = 0; ii <= 5; ii++) {
          if (sc.checkPump(wStr, x, y, z, ii)) breakCount++;
        }
        if (!bestXyz || breakCount < bestXyz.breakCount) {
          bestXyz = { x, y, z, breakCount };
        }
      }
    }
    if (bestXyz) {
      setXyz({ x: bestXyz.x, y: bestXyz.y, z: bestXyz.z });
      setPhase(2);
    }
  };

  // Phase 2: Student picks i
  const submitI = (i) => {
    setIVal(i);
    const pumped = xyz.x + xyz.y.repeat(i) + xyz.z;
    const isBreak = sc.checkPump(w, xyz.x, xyz.y, xyz.z, i);
    const inL = sc.checkMembership(pumped);

    setResult({
      ok: isBreak,
      pumped,
      inL,
      msg: isBreak
        ? (li ? "\ud83c\udf89 Correct! xy\u2071z \u2209 L \u2014 pumping lemma violated!" : "\ud83c\udf89 Do\u011fru! xy\u2071z \u2209 L \u2014 pumping lemma ihlal edildi!")
        : (li ? "\u274c xy\u2071z \u2208 L \u2014 try a different i" : "\u274c xy\u2071z \u2208 L \u2014 ba\u015fka bir i dene")
    });
    if (isBreak) setPhase(3);
  };

  const reset = () => {
    setPhase(0); setW(""); setWInput(""); setXyz(null); setIVal(null); setResult(null); setUsedSuggestion(false);
  };

  const starIcons = "\u2b50".repeat(sc.difficulty);

  return (
    <Card color={mc} pad={0} style={{ overflow: "hidden", marginBottom: 10 }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", background: `${mc}08`, borderBottom: `1px solid ${mc}14`,
        display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${mc}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: mc }}>\ud83c\udfb2</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.wh, fontFamily: F.s }}>
            {sc.title[li]} <span style={{ fontSize: 10, opacity: .6 }}>{starIcons}</span></div>
          <div style={{ fontSize: 10, color: C.ts, fontFamily: F.s, marginTop: 2 }}>{sc.desc[li]}</div>
        </div>
        <div style={{ padding: "3px 10px", borderRadius: 6, background: `${mc}14`,
          fontSize: 9, fontWeight: 700, color: mc, fontFamily: F.s }}>PL GAME</div>
        {phase > 0 && <button onClick={reset} style={{ padding: "5px 12px", borderRadius: 7,
          background: `${mc}14`, color: mc, fontSize: 10, fontWeight: 700, fontFamily: F.s,
          border: `1px solid ${mc}20` }}>\u21bb {li ? "Reset" : "S\u0131f\u0131rla"}</button>}
      </div>

      <div style={{ padding: "16px 18px" }}>

        {/* Phase 0: Intro */}
        {phase === 0 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: C.tx, fontFamily: F.s, lineHeight: 1.7, marginBottom: 12 }}>
              {li ? "The system (adversary) has chosen pumping length:" : "Sistem (rakip) pumping uzunlu\u011funu se\u00e7ti:"}
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: mc, fontFamily: F.m, marginBottom: 12 }}>
              p = {p}
            </div>
            <div style={{ fontSize: 11, color: C.ts, fontFamily: F.s, lineHeight: 1.6, marginBottom: 16 }}>
              {li ? `Your job: pick a string w \u2208 L with |w| \u2265 ${p}, then find i such that xy\u2071z \u2209 L`
                  : `G\u00f6revin: |w| \u2265 ${p} olan bir w \u2208 L se\u00e7, sonra xy\u2071z \u2209 L yapan i bul`}
            </div>
            <Btn color={mc} onClick={() => setPhase(1)} style={{ padding: "10px 30px", fontSize: 13 }}>
              {li ? "Start Game" : "Oyunu Ba\u015flat"} \u25b8
            </Btn>
          </div>
        )}

        {/* Phase 1: Pick w */}
        {phase === 1 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.wh, fontFamily: F.s, marginBottom: 8 }}>
              {li ? `Step 1: Choose w \u2208 L = {${sc.language}} with |w| \u2265 ${p}`
                  : `Ad\u0131m 1: w \u2208 L = {${sc.language}} se\u00e7 (|w| \u2265 ${p})`}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input value={wInput} onChange={e => setWInput(e.target.value)}
                placeholder={li ? `Type w using {${sc.alphabet}}` : `{${sc.alphabet}} kullanarak w yaz`}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${mc}25`,
                  background: C.s1, color: C.wh, fontFamily: F.m, fontSize: 14, outline: "none" }}
                onKeyDown={e => { if (e.key === "Enter") submitW(); }} />
              <Btn color={mc} onClick={submitW}>
                {li ? "Submit" : "G\u00f6nder"}</Btn>
            </div>
            {!usedSuggestion && (
              <button onClick={() => { setWInput(sc.suggestedW(p)); setUsedSuggestion(true); }}
                style={{ fontSize: 10, color: C.ts, fontFamily: F.s, padding: "4px 10px", borderRadius: 6,
                  background: `${mc}06`, border: `1px solid ${mc}12` }}>
                \ud83d\udca1 {li ? "Suggest w" : "w \u00f6ner"}
              </button>
            )}
            {result && !result.ok && (
              <div style={{ marginTop: 6, fontSize: 11, color: C.err, fontWeight: 700, fontFamily: F.s }}>{result.msg}</div>
            )}
          </div>
        )}

        {/* Phase 2: System shows xyz, student picks i */}
        {phase === 2 && xyz && (
          <div>
            <div style={{ fontSize: 11, color: C.ts, fontFamily: F.s, marginBottom: 8 }}>
              {li ? "The adversary decomposed your w into xyz:" : "Rakip w'yi xyz olarak b\u00f6ld\u00fc:"}
            </div>

            {/* Visual xyz decomposition */}
            <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: C.s2,
              border: `1px solid ${C.bd}`, textAlign: "center" }}>
              <div style={{ display: "inline-flex", gap: 0, alignItems: "flex-end" }}>
                {/* x part */}
                {xyz.x && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: C.ts, marginBottom: 2 }}>x</div>
                    <div style={{ padding: "4px 8px", borderRadius: "6px 0 0 6px", background: `${C.info}14`,
                      border: `1px solid ${C.info}30`, fontFamily: F.m, fontSize: 13, fontWeight: 700, color: C.info }}>
                      {xyz.x}</div>
                  </div>
                )}
                {/* y part (highlighted — this gets pumped) */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: mc, marginBottom: 2 }}>y (pump!)</div>
                  <div style={{ padding: "4px 10px", borderRadius: xyz.x ? 0 : "6px 0 0 6px",
                    background: `${mc}20`, border: `2px solid ${mc}`,
                    fontFamily: F.m, fontSize: 14, fontWeight: 900, color: mc }}>
                    {xyz.y}</div>
                </div>
                {/* z part */}
                {xyz.z && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: C.ts, marginBottom: 2 }}>z</div>
                    <div style={{ padding: "4px 8px", borderRadius: "0 6px 6px 0", background: `${C.ch2}14`,
                      border: `1px solid ${C.ch2}30`, fontFamily: F.m, fontSize: 13, fontWeight: 700, color: C.ch2 }}>
                      {xyz.z}</div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8, fontSize: 9, color: C.ts, fontFamily: F.m }}>
                |xy| = {xyz.x.length + xyz.y.length} \u2264 p={p} &nbsp;\u2713 &nbsp;&nbsp;
                |y| = {xyz.y.length} &gt; 0 &nbsp;\u2713
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: C.wh, fontFamily: F.s, marginBottom: 10, textAlign: "center" }}>
              {li ? "Step 2: Choose i such that xy\u2071z \u2209 L" : "Ad\u0131m 2: xy\u2071z \u2209 L yapan i se\u00e7"}
            </div>

            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
              {[0, 1, 2, 3, 4, 5].map(i => {
                const pumped = xyz.x + xyz.y.repeat(i) + xyz.z;
                const tooLong = pumped.length > 30;
                return (
                  <button key={i} onClick={() => submitI(i)}
                    style={{ padding: "10px 16px", borderRadius: 9, border: `2px solid ${iVal === i ? mc : C.bd}`,
                      background: iVal === i ? `${mc}14` : C.s2, color: iVal === i ? mc : C.tx,
                      fontSize: 12, fontWeight: iVal === i ? 800 : 500, fontFamily: F.m, transition: "all .15s",
                      minWidth: 50, textAlign: "center" }}>
                    <div style={{ fontWeight: 800 }}>i={i}</div>
                    <div style={{ fontSize: 8, color: C.ts, marginTop: 2, fontFamily: F.m, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tooLong ? `${pumped.substring(0, 12)}...` : pumped || "\u03b5"}
                    </div>
                  </button>
                );
              })}
            </div>

            {result && (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: result.ok ? C.ok : C.err, fontFamily: F.s }}>
                  {result.msg}
                </div>
                {result.pumped !== undefined && (
                  <div style={{ fontSize: 10, color: C.ts, fontFamily: F.m, marginTop: 4 }}>
                    xy{iVal === null ? "\u2071" : <sup>{iVal}</sup>}z = "{result.pumped}"
                    {result.inL
                      ? <span style={{ color: C.err, fontWeight: 700 }}> \u2208 L</span>
                      : <span style={{ color: C.ok, fontWeight: 700 }}> \u2209 L \u2713</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Victory */}
        {phase === 3 && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.ok, fontFamily: F.s, marginBottom: 8 }}>
              \ud83c\udf89 {li ? "Proof Complete!" : "Kan\u0131t Tamamland\u0131!"}
            </div>
            <div style={{ fontSize: 12, color: C.tx, fontFamily: F.s, lineHeight: 1.7, marginBottom: 12 }}>
              {li ? `You proved ${sc.language} is not regular/CFL by showing:` : `${sc.language} dilinin d\u00fczensiz/CFL olmad\u0131\u011f\u0131n\u0131 g\u00f6sterdiniz:`}
            </div>
            <div style={{ padding: "10px 16px", borderRadius: 10, background: C.s2, border: `1px solid ${C.ok}20`,
              textAlign: "left", fontFamily: F.m, fontSize: 11, lineHeight: 1.8, color: C.tx }}>
              <div>\u2022 w = "{w}" \u2208 L, |w| = {w.length} \u2265 p = {p}</div>
              <div>\u2022 x = "{xyz.x}", y = "{xyz.y}", z = "{xyz.z}"</div>
              <div>\u2022 |xy| = {xyz.x.length + xyz.y.length} \u2264 p, |y| = {xyz.y.length} &gt; 0</div>
              <div>\u2022 i = {iVal} \u2192 xy<sup>{iVal}</sup>z = "{xyz.x + xyz.y.repeat(iVal) + xyz.z}" \u2209 L \u2714</div>
              <div style={{ marginTop: 6, fontWeight: 700, color: C.ok }}>
                \u2234 L = {"{"}{sc.language}{"}"} {li ? "is NOT regular" : "d\u00fczensiz DE\u011e\u0130LD\u0130R"} \u25a0
              </div>
            </div>
            <button onClick={reset} style={{ marginTop: 12, padding: "8px 24px", borderRadius: 8,
              background: mc, color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: F.s }}>
              {li ? "Play Again" : "Tekrar Oyna"}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
