// ═══════════════════════════════════════════════════════════════
// DFAMinimize.jsx — Faz 6: Interactive DFA Minimization Tool
// Table-filling algorithm visualization + result display
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { C, F, Card, Btn, Pill, useI18n } from "../theme";
import { minimizeDFA } from "../engines";

// ── Preset DFAs for minimization ─────────────────────────────
const PRESETS = [
  {
    id: "min1",
    nm: ["5→3 Durum (ab ile biter)", "5→3 States (ends with ab)"],
    states: [
      { id: "q0", label: "q0", start: true, accept: false },
      { id: "q1", label: "q1", start: false, accept: false },
      { id: "q2", label: "q2", start: false, accept: true },
      { id: "q3", label: "q3", start: false, accept: false },
      { id: "q4", label: "q4", start: false, accept: true },
    ],
    trans: [
      { fr: "q0", to: "q1", syms: ["a"] }, { fr: "q0", to: "q0", syms: ["b"] },
      { fr: "q1", to: "q1", syms: ["a"] }, { fr: "q1", to: "q2", syms: ["b"] },
      { fr: "q2", to: "q1", syms: ["a"] }, { fr: "q2", to: "q0", syms: ["b"] },
      { fr: "q3", to: "q1", syms: ["a"] }, { fr: "q3", to: "q4", syms: ["b"] },
      { fr: "q4", to: "q1", syms: ["a"] }, { fr: "q4", to: "q0", syms: ["b"] },
    ],
    alpha: ["a", "b"]
  },
  {
    id: "min2",
    nm: ["4→2 Durum (çift a sayısı)", "4→2 States (even a count)"],
    states: [
      { id: "q0", label: "q0", start: true, accept: true },
      { id: "q1", label: "q1", start: false, accept: false },
      { id: "q2", label: "q2", start: false, accept: true },
      { id: "q3", label: "q3", start: false, accept: false },
    ],
    trans: [
      { fr: "q0", to: "q1", syms: ["a"] }, { fr: "q0", to: "q2", syms: ["b"] },
      { fr: "q1", to: "q0", syms: ["a"] }, { fr: "q1", to: "q3", syms: ["b"] },
      { fr: "q2", to: "q3", syms: ["a"] }, { fr: "q2", to: "q0", syms: ["b"] },
      { fr: "q3", to: "q2", syms: ["a"] }, { fr: "q3", to: "q1", syms: ["b"] },
    ],
    alpha: ["a", "b"]
  },
  {
    id: "min3",
    nm: ["6→3 Durum (01 içerir)", "6→3 States (contains 01)"],
    states: [
      { id: "A", label: "A", start: true, accept: false },
      { id: "B", label: "B", start: false, accept: false },
      { id: "C", label: "C", start: false, accept: true },
      { id: "D", label: "D", start: false, accept: false },
      { id: "E", label: "E", start: false, accept: true },
      { id: "F", label: "F", start: false, accept: true },
    ],
    trans: [
      { fr: "A", to: "B", syms: ["0"] }, { fr: "A", to: "A", syms: ["1"] },
      { fr: "B", to: "B", syms: ["0"] }, { fr: "B", to: "C", syms: ["1"] },
      { fr: "C", to: "C", syms: ["0"] }, { fr: "C", to: "C", syms: ["1"] },
      { fr: "D", to: "E", syms: ["0"] }, { fr: "D", to: "D", syms: ["1"] },
      { fr: "E", to: "E", syms: ["0"] }, { fr: "E", to: "F", syms: ["1"] },
      { fr: "F", to: "F", syms: ["0"] }, { fr: "F", to: "F", syms: ["1"] },
    ],
    alpha: ["0", "1"]
  },
];

const COL = "#22d3ee";

export default function DFAMinimize() {
  const { lang } = useI18n();
  const li = lang === "en" ? 1 : 0;

  const [preset, setPreset] = useState(null);
  const [result, setResult] = useState(null);
  const [stepIdx, setStepIdx] = useState(-1);
  const [showAll, setShowAll] = useState(false);

  const runMinimize = (p) => {
    setPreset(p);
    const r = minimizeDFA(p.states, p.trans, p.alpha);
    setResult(r);
    setStepIdx(-1);
    setShowAll(false);
  };

  const visibleSteps = result ? (showAll ? result.steps : result.steps.slice(0, stepIdx + 1)) : [];

  return (
    <div style={{ animation: "fadeIn .3s ease-out", maxWidth: 900 }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: COL, fontFamily: F.s, margin: "0 0 6px" }}>
        ⚡ {li ? "DFA Minimization" : "DFA Minimizasyonu"}
      </h2>
      <p style={{ fontSize: 12, color: C.ts, fontFamily: F.s, lineHeight: 1.6, margin: "0 0 16px" }}>
        {li ? "Table-filling algorithm: find and merge equivalent states to produce the minimum DFA."
          : "Tablo doldurma algoritması: eşdeğer durumları bul ve birleştirerek minimum DFA üret."}
      </p>

      {/* Preset Selection */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {PRESETS.map(p => (
          <button key={p.id} onClick={() => runMinimize(p)}
            style={{
              padding: "10px 16px", borderRadius: 10,
              border: `1.5px solid ${preset?.id === p.id ? COL : C.bd}`,
              background: preset?.id === p.id ? `${COL}10` : C.s1,
              color: preset?.id === p.id ? COL : C.tx,
              fontSize: 12, fontWeight: 700, fontFamily: F.s, transition: "all .15s"
            }}>
            {p.nm[li]}
          </button>
        ))}
      </div>

      {preset && result && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "start" }}>
          {/* Left: Original DFA + Table */}
          <div style={{ flex: 1, minWidth: 320 }}>
            {/* Original DFA info */}
            <Card color={C.err} pad={14} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.err, fontFamily: F.s, marginBottom: 6 }}>
                {li ? "Original DFA" : "Orijinal DFA"} — {preset.states.length} {li ? "states" : "durum"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                {preset.states.map(s => (
                  <span key={s.id} style={{
                    padding: "3px 8px", borderRadius: 5, fontSize: 10, fontFamily: F.m, fontWeight: 700,
                    background: s.accept ? `${C.ok}14` : s.start ? `${COL}14` : C.s2,
                    color: s.accept ? C.ok : s.start ? COL : C.tx,
                    border: `1px solid ${s.accept ? C.ok : s.start ? COL : C.bd}20`
                  }}>
                    {s.label}{s.start ? "⟵" : ""}{s.accept ? "◎" : ""}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {preset.trans.map((t, i) => (
                  <span key={i} style={{ fontSize: 9, fontFamily: F.m, color: C.ts }}>
                    δ({t.fr},{t.syms.join(",")})={t.to}
                  </span>
                ))}
              </div>
            </Card>

            {/* Distinguishability Table */}
            {result.table && (
              <Card color={COL} pad={14} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: COL, fontFamily: F.s, marginBottom: 8 }}>
                  {li ? "Distinguishability Table" : "Ayırt Edilebilirlik Tablosu"}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", fontFamily: F.m, fontSize: 10 }}>
                    <thead>
                      <tr>
                        <th style={{ padding: 4 }}></th>
                        {result.table.ids.slice(0, -1).map(id => (
                          <th key={id} style={{ padding: "4px 8px", color: COL, fontWeight: 700 }}>{id}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.table.ids.slice(1).map((rowId, ri) => (
                        <tr key={rowId}>
                          <td style={{ padding: "4px 8px", color: COL, fontWeight: 700 }}>{rowId}</td>
                          {result.table.ids.slice(0, ri + 1).map(colId => {
                            const k = colId < rowId ? `${colId}|${rowId}` : `${rowId}|${colId}`;
                            const isDist = result.table.dist[k];
                            const isVisible = showAll || visibleSteps.some(s => {
                              const pk = s.pair ? (s.pair[0] < s.pair[1] ? `${s.pair[0]}|${s.pair[1]}` : `${s.pair[1]}|${s.pair[0]}`) : "";
                              return pk === k;
                            });
                            return (
                              <td key={colId} style={{
                                padding: "4px 8px", textAlign: "center",
                                border: `1px solid ${C.bd}`,
                                background: isDist && isVisible ? `${C.err}14` : !isDist ? `${C.ok}08` : C.s2,
                                color: isDist && isVisible ? C.err : !isDist ? C.ok : C.tm,
                                fontWeight: 700
                              }}>
                                {isDist && isVisible ? "✗" : isDist ? "·" : "≡"}
                              </td>
                            );
                          })}
                          {ri + 1 < result.table.ids.length - 1 &&
                            Array.from({ length: result.table.ids.length - 2 - ri }).map((_, ci) => (
                              <td key={`e${ci}`} style={{ padding: 4 }}></td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 6, fontSize: 9, color: C.ts, fontFamily: F.s }}>
                  <span style={{ color: C.err }}>✗</span> = {li ? "distinguishable" : "ayırt edilebilir"} &nbsp;
                  <span style={{ color: C.ok }}>≡</span> = {li ? "equivalent" : "eşdeğer"}
                </div>
              </Card>
            )}

            {/* Step-through controls */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
              <Btn color={COL} variant="outline" onClick={() => setStepIdx(s => Math.max(s - 1, -1))}
                style={{ padding: "5px 12px", fontSize: 11 }}>◀ {li ? "Prev" : "Önceki"}</Btn>
              <Btn color={COL} onClick={() => setStepIdx(s => Math.min(s + 1, result.steps.length - 1))}
                style={{ padding: "5px 12px", fontSize: 11 }}>▶ {li ? "Next Step" : "Sonraki Adım"}</Btn>
              <Btn color={C.ok} variant="outline" onClick={() => { setShowAll(true); setStepIdx(result.steps.length - 1); }}
                style={{ padding: "5px 12px", fontSize: 11 }}>{li ? "Show All" : "Tümünü Göster"}</Btn>
              <span style={{ fontSize: 10, color: C.ts, fontFamily: F.m }}>
                {stepIdx + 1}/{result.steps.length}
              </span>
            </div>

            {/* Steps log */}
            {visibleSteps.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 200, overflowY: "auto" }}>
                {visibleSteps.map((s, i) => (
                  <div key={i} style={{
                    padding: "5px 10px", borderRadius: 7, fontSize: 10, fontFamily: F.s, lineHeight: 1.4,
                    background: s.type === "result" ? `${C.ok}08` : s.type === "init" ? `${C.warn}06` : `${COL}06`,
                    border: `1px solid ${s.type === "result" ? C.ok : s.type === "init" ? C.warn : COL}12`,
                    color: s.type === "result" ? C.ok : C.tx,
                    animation: i === visibleSteps.length - 1 ? "fadeUp .15s ease-out" : "none"
                  }}>
                    <span style={{ fontWeight: 700, color: s.type === "result" ? C.ok : s.type === "init" ? C.warn : COL }}>
                      {s.type === "init" ? "⓪" : s.type === "propagate" ? `⟲${s.round}` : "✓"}
                    </span>
                    {" "}{s.reason[li ? "en" : "tr"]}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Minimized DFA */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <Card color={C.ok} pad={14}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.ok, fontFamily: F.s, marginBottom: 8 }}>
                ✓ {li ? "Minimized DFA" : "Minimize Edilmiş DFA"} — {result.minStates.length} {li ? "states" : "durum"}
              </div>

              {/* Equivalence groups */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.ts, fontFamily: F.s, marginBottom: 4, textTransform: "uppercase" }}>
                  {li ? "Equivalence Groups" : "Eşdeğerlik Grupları"}
                </div>
                {result.equivalences.map((g, i) => (
                  <div key={i} style={{
                    padding: "5px 10px", borderRadius: 6, marginBottom: 3,
                    background: `${C.ok}08`, border: `1px solid ${C.ok}14`,
                    fontSize: 11, fontFamily: F.m, color: C.tx
                  }}>
                    {g.length > 1 ? `{${g.join(",")}}` : g[0]}
                    {result.minStates[i]?.start && <span style={{ color: COL, marginLeft: 4 }}>⟵start</span>}
                    {result.minStates[i]?.accept && <span style={{ color: C.ok, marginLeft: 4 }}>◎accept</span>}
                  </div>
                ))}
              </div>

              {/* New transitions */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.ts, fontFamily: F.s, marginBottom: 4, textTransform: "uppercase" }}>
                  {li ? "New Transitions" : "Yeni Geçişler"}
                </div>
                {result.minTrans.map((t, i) => (
                  <div key={i} style={{
                    fontSize: 10, fontFamily: F.m, color: C.tx, padding: "3px 0"
                  }}>
                    δ(<span style={{ color: COL, fontWeight: 700 }}>{t.fr}</span>,
                    {t.syms.join(",")}) = <span style={{ color: COL, fontWeight: 700 }}>{t.to}</span>
                  </div>
                ))}
              </div>

              {/* Savings */}
              <div style={{
                marginTop: 10, padding: "8px 12px", borderRadius: 8,
                background: `${C.ok}10`, border: `1px solid ${C.ok}20`,
                textAlign: "center"
              }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.ok, fontFamily: F.m }}>
                  {preset.states.length} → {result.minStates.length}
                </span>
                <div style={{ fontSize: 10, color: C.ts, fontFamily: F.s }}>
                  {li ? "states reduced" : "durum azaltıldı"}
                  {preset.states.length > result.minStates.length &&
                    ` (-${preset.states.length - result.minStates.length})`}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {!preset && (
        <Card color={C.bd} pad={20}>
          <div style={{ textAlign: "center", color: C.tm, fontSize: 12, fontFamily: F.s }}>
            {li ? "Select a preset above to start minimization" : "Minimizasyona başlamak için yukarıdan bir preset seçin"}
          </div>
        </Card>
      )}
    </div>
  );
}
