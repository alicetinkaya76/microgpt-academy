import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLang } from "../../../core/i18n";

/* ═══════════════════════════════════════════
   PALETTE (shared with BackpropLesson)
   ═══════════════════════════════════════════ */
const P = {
  bg: "#06070b", surface: "#0c0e14", card: "#10131a", border: "#1c2030",
  indigo: "#818cf8", teal: "#2dd4bf", pink: "#f472b6", amber: "#fbbf24",
  violet: "#a78bfa", blue: "#60a5fa", emerald: "#34d399", rose: "#fb7185",
  text: "#e2e8f0", muted: "#64748b", dim: "#374151", white: "#ffffff",
};

const t = (tr, en, lang) => lang === "tr" ? tr : en;

/* ═══════════════════════════════════════════
   CHAPTERS
   ═══════════════════════════════════════════ */
export const LA_CHAPTERS_TR = [
  { icon: "📖", label: "Hikâye", color: P.indigo },
  { icon: "📍", label: "Vektör", color: P.teal },
  { icon: "📐", label: "Dot Product", color: P.violet },
  { icon: "🔢", label: "Matris", color: P.blue },
  { icon: "✖️", label: "Matris Çarpımı", color: P.pink },
  { icon: "🔄", label: "Transpoz", color: P.amber },
  { icon: "🧪", label: "Laboratuvar", color: P.emerald },
  { icon: "🏆", label: "Quiz", color: P.rose },
];
export const LA_CHAPTERS_EN = [
  { icon: "📖", label: "Story", color: P.indigo },
  { icon: "📍", label: "Vector", color: P.teal },
  { icon: "📐", label: "Dot Product", color: P.violet },
  { icon: "🔢", label: "Matrix", color: P.blue },
  { icon: "✖️", label: "Matrix Mul", color: P.pink },
  { icon: "🔄", label: "Transpose", color: P.amber },
  { icon: "🧪", label: "Lab", color: P.emerald },
  { icon: "🏆", label: "Quiz", color: P.rose },
];

/* ═══════════════════════════════════════════
   STORY CARD
   ═══════════════════════════════════════════ */
function S({ emoji, text, color, delay = 0 }) {
  return (
    <div style={{
      display: "flex", gap: 12, padding: "11px 13px",
      background: `linear-gradient(135deg, ${color}06, transparent)`,
      borderLeft: `2px solid ${color}30`, borderRadius: "0 10px 10px 0",
      marginBottom: 7, animation: `fadeSlideIn 0.5s ${delay}s both cubic-bezier(0.16,1,0.3,1)`,
    }}>
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
      <p style={{ margin: 0, color: P.text, fontSize: 16, lineHeight: 1.85 }}>{text}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   VECTOR PLAYGROUND
   ═══════════════════════════════════════════ */
function VectorPlayground({ lang }) {
  const [v, setV] = useState([3, 2]);
  const [v2, setV2] = useState([1, -2]);
  const [showAdd, setShowAdd] = useState(false);
  const vSum = [v[0] + v2[0], v[1] + v2[1]];
  const W = 260, H = 260, mid = W / 2;
  const scale = 20;
  const mag = Math.sqrt(v[0] * v[0] + v[1] * v[1]);

  return (
    <div>
      <div style={{ fontSize: 16, color: P.text, marginBottom: 10, lineHeight: 1.8 }}>
        <strong style={{ color: P.teal }}>{t("Vektör", "Vector", lang)}</strong> = {t("yön + büyüklük. Kaydırıcılarla vektörü değiştir!", "direction + magnitude. Drag the sliders to change!", lang)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", background: P.surface, borderRadius: 12, border: `1px solid ${P.border}` }}>
        {/* Grid */}
        {Array.from({ length: 13 }, (_, i) => i - 6).map(i => (
          <g key={i}>
            <line x1={mid + i * scale} y1={0} x2={mid + i * scale} y2={H} stroke={i === 0 ? P.dim : P.border} strokeWidth={i === 0 ? 1 : 0.5} />
            <line x1={0} y1={mid + i * scale} x2={W} y2={mid + i * scale} stroke={i === 0 ? P.dim : P.border} strokeWidth={i === 0 ? 1 : 0.5} />
          </g>
        ))}
        {/* Vector arrow */}
        <line x1={mid} y1={mid} x2={mid + v[0] * scale} y2={mid - v[1] * scale} stroke={P.teal} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={mid + v[0] * scale} cy={mid - v[1] * scale} r={5} fill={P.teal} />
        <circle cx={mid + v[0] * scale} cy={mid - v[1] * scale} r={14} fill={P.teal} opacity={0.1} />
        {/* Label */}
        <text x={mid + v[0] * scale + 10} y={mid - v[1] * scale - 8} fill={P.teal} fontSize="10" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
          [{v[0].toFixed(1)}, {v[1].toFixed(1)}]
        </text>
        {/* Magnitude arc */}
        <text x={W - 8} y={H - 8} textAnchor="end" fill={P.dim} fontSize="8" fontFamily="'JetBrains Mono', monospace">
          |v| = {mag.toFixed(2)}
        </text>
      </svg>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        {[["x", 0, P.teal], ["y", 1, P.blue]].map(([label, idx, color]) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ color: P.muted, fontSize: 13, fontWeight: 700 }}>{label}</span>
              <span style={{ color, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{v[idx].toFixed(1)}</span>
            </div>
            <input type="range" min="-5" max="5" step="0.1" value={v[idx]}
              onChange={e => { const n = [...v]; n[idx] = +e.target.value; setV(n); }}
              style={{ width: "100%" }} />
          </div>
        ))}
      </div>
      {/* Toggle vector addition */}
      <button onClick={() => setShowAdd(!showAdd)} style={{
        marginTop: 8, padding: "7px 14px", borderRadius: 8, border: `1px solid ${showAdd ? P.emerald + "40" : P.border}`,
        background: showAdd ? P.emerald + "10" : "transparent", color: showAdd ? P.emerald : P.muted,
        fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%",
      }}>{showAdd ? t("✓ Vektör Toplama Aktif","✓ Vector Addition Active",lang) : t("+ Vektör Toplama Göster","+ Show Vector Addition",lang)}</button>
      {showAdd && (
        <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 8, background: P.pink + "08", border: `1px solid ${P.pink}15` }}>
          <div style={{ fontSize: 13, color: P.pink, fontWeight: 700, marginBottom: 4 }}>b {t("vektörü","vector",lang)}</div>
          <div style={{ display: "flex", gap: 12 }}>
            {[["x", 0, P.pink], ["y", 1, P.violet]].map(([label, idx, color]) => (
              <div key={label} style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ color: P.muted, fontSize: 11, fontWeight: 700 }}>{label}</span>
                  <span style={{ color, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{v2[idx].toFixed(1)}</span>
                </div>
                <input type="range" min="-5" max="5" step="0.1" value={v2[idx]}
                  onChange={e => { const n = [...v2]; n[idx] = +e.target.value; setV2(n); }}
                  style={{ width: "100%" }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: P.emerald, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
            a + b = [{vSum[0].toFixed(1)}, {vSum[1].toFixed(1)}]
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   DOT PRODUCT VISUALIZER
   ═══════════════════════════════════════════ */
function DotProductViz({ lang }) {
  const [a, setA] = useState([3, 1]);
  const [b, setB] = useState([1, 3]);
  const dot = a[0] * b[0] + a[1] * b[1];
  const magA = Math.sqrt(a[0] ** 2 + a[1] ** 2);
  const magB = Math.sqrt(b[0] ** 2 + b[1] ** 2);
  const cosTheta = magA > 0 && magB > 0 ? dot / (magA * magB) : 0;
  const angle = Math.acos(Math.max(-1, Math.min(1, cosTheta))) * (180 / Math.PI);

  const W = 260, H = 200, mid = W / 2, midY = H / 2 + 20;
  const scale = 22;

  const sim = dot > 2 ? P.emerald : dot > 0 ? P.amber : dot > -2 ? P.pink : P.rose;
  const simLabel = dot > 2
    ? t("Çok benzer ↗", "Very similar ↗", lang)
    : dot > 0 ? t("Biraz benzer →", "Somewhat similar →", lang)
    : dot > -2 ? t("Farklı yön ↙", "Different direction ↙", lang)
    : t("Tam zıt ←", "Opposite ←", lang);

  return (
    <div>
      <div style={{ fontSize: 16, color: P.text, marginBottom: 10, lineHeight: 1.8 }}>
        <strong style={{ color: P.violet }}>Dot product</strong> = {t("iki vektörün ne kadar aynı yöne baktığını ölçer.", "measures how much two vectors point the same way.", lang)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", background: P.surface, borderRadius: 12, border: `1px solid ${P.border}` }}>
        <line x1={mid} y1={midY} x2={mid + a[0] * scale} y2={midY - a[1] * scale} stroke={P.teal} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={mid + a[0] * scale} cy={midY - a[1] * scale} r={4} fill={P.teal} />
        <text x={mid + a[0] * scale + 8} y={midY - a[1] * scale - 6} fill={P.teal} fontSize="9" fontWeight="700">a</text>

        <line x1={mid} y1={midY} x2={mid + b[0] * scale} y2={midY - b[1] * scale} stroke={P.violet} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={mid + b[0] * scale} cy={midY - b[1] * scale} r={4} fill={P.violet} />
        <text x={mid + b[0] * scale + 8} y={midY - b[1] * scale - 6} fill={P.violet} fontSize="9" fontWeight="700">b</text>

        {/* Result */}
        <rect x={W / 2 - 60} y={6} width={120} height={32} rx={10} fill={sim + "15"} stroke={sim + "40"} strokeWidth={1} />
        <text x={W / 2} y={18} textAnchor="middle" fill={sim} fontSize="8" fontWeight="700">{t("dot product", "dot product", lang)}</text>
        <text x={W / 2} y={31} textAnchor="middle" fill={P.white} fontSize="12" fontWeight="800" fontFamily="'JetBrains Mono', monospace">{dot.toFixed(1)}</text>
      </svg>

      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <div style={{ flex: 1, background: sim + "08", border: `1px solid ${sim}20`, borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
          <div style={{ color: P.dim, fontSize: 10, fontWeight: 700 }}>{t("AÇI", "ANGLE", lang)}</div>
          <div style={{ color: sim, fontSize: 17, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{angle.toFixed(0)}°</div>
        </div>
        <div style={{ flex: 2, background: sim + "08", border: `1px solid ${sim}20`, borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
          <div style={{ color: P.dim, fontSize: 10, fontWeight: 700 }}>{t("YORUM", "INTERPRETATION", lang)}</div>
          <div style={{ color: sim, fontSize: 15, fontWeight: 700 }}>{simLabel}</div>
        </div>
      </div>

      {/* Sliders for a and b */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        {[[a, setA, "a", P.teal], [b, setB, "b", P.violet]].map(([vec, setVec, label, color]) => (
          <div key={label} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 8, padding: 8 }}>
            <div style={{ color, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{label}</div>
            {[0, 1].map(idx => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                <span style={{ color: P.muted, fontSize: 11, minWidth: 10 }}>{idx === 0 ? "x" : "y"}</span>
                <input type="range" min="-4" max="4" step="0.5" value={vec[idx]}
                  onChange={e => { const n = [...vec]; n[idx] = +e.target.value; setVec(n); }}
                  style={{ flex: 1 }} />
                <span style={{ color, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 24, textAlign: "right" }}>{vec[idx].toFixed(1)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: P.violet + "08", border: `1px solid ${P.violet}15`, fontSize: 14, color: P.muted, lineHeight: 1.6 }}>
        💡 a·b = ({a[0]}×{b[0]}) + ({a[1]}×{b[1]}) = <strong style={{ color: P.white }}>{dot.toFixed(1)}</strong>
        {" "}{t("— Attention'da Q·K tam olarak bunu yapar!", "— This is exactly what Q·K does in Attention!", lang)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MATRIX MULTIPLY VISUALIZER
   ═══════════════════════════════════════════ */
function MatMulViz({ lang }) {
  const [A] = useState([[2, 0], [1, 3]]);
  const [x, setX] = useState([1, 1]);
  const result = [A[0][0] * x[0] + A[0][1] * x[1], A[1][0] * x[0] + A[1][1] * x[1]];
  const [highlightRow, setHighlightRow] = useState(-1);

  return (
    <div>
      <div style={{ fontSize: 16, color: P.text, marginBottom: 10, lineHeight: 1.8 }}>
        <strong style={{ color: P.pink }}>{t("Matris × vektör", "Matrix × vector", lang)}</strong> = {t("vektörü dönüştürme. Her satır bir dot product!", "transforming a vector. Each row is a dot product!", lang)}
      </div>

      {/* Visual matrix multiplication */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap", padding: "14px 0" }}>
        {/* Matrix A */}
        <div style={{ background: P.card, borderRadius: 10, border: `1px solid ${P.border}`, padding: "8px 6px" }}>
          <div style={{ color: P.dim, fontSize: 10, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>A</div>
          {A.map((row, i) => (
            <div key={i} style={{
              display: "flex", gap: 4, padding: "3px 6px", borderRadius: 6, marginBottom: 2,
              background: highlightRow === i ? P.pink + "15" : "transparent",
              transition: "background 0.3s",
            }}
              onMouseEnter={() => setHighlightRow(i)} onMouseLeave={() => setHighlightRow(-1)}
            >
              {row.map((val, j) => (
                <span key={j} style={{ color: highlightRow === i ? P.pink : P.text, fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 24, textAlign: "center" }}>{val}</span>
              ))}
            </div>
          ))}
        </div>

        <span style={{ color: P.dim, fontSize: 19, fontWeight: 700 }}>×</span>

        {/* Vector x */}
        <div style={{ background: P.card, borderRadius: 10, border: `1px solid ${P.border}`, padding: "8px 6px" }}>
          <div style={{ color: P.dim, fontSize: 10, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>x</div>
          {x.map((val, i) => (
            <div key={i} style={{ padding: "3px 6px", textAlign: "center", marginBottom: 2 }}>
              <span style={{ color: P.blue, fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{val.toFixed(1)}</span>
            </div>
          ))}
        </div>

        <span style={{ color: P.dim, fontSize: 19, fontWeight: 700 }}>=</span>

        {/* Result */}
        <div style={{ background: P.card, borderRadius: 10, border: `1px solid ${P.border}`, padding: "8px 6px" }}>
          <div style={{ color: P.dim, fontSize: 10, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>y</div>
          {result.map((val, i) => (
            <div key={i} style={{
              padding: "3px 6px", textAlign: "center", marginBottom: 2, borderRadius: 4,
              background: highlightRow === i ? P.emerald + "15" : "transparent",
            }}>
              <span style={{ color: P.emerald, fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{val.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calculation detail */}
      {highlightRow >= 0 && (
        <div style={{ padding: "8px 10px", borderRadius: 8, background: P.pink + "08", border: `1px solid ${P.pink}15`, fontSize: 15, color: P.text, textAlign: "center", animation: "fadeSlideIn 0.2s both" }}>
          y[{highlightRow}] = {A[highlightRow].map((a, j) => `${a}×${x[j].toFixed(1)}`).join(" + ")} = <strong style={{ color: P.emerald }}>{result[highlightRow].toFixed(1)}</strong>
        </div>
      )}

      {/* x sliders */}
      <div style={{ marginTop: 8 }}>
        {x.map((val, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ color: P.blue, fontSize: 13, fontWeight: 700, minWidth: 18 }}>x{i + 1}</span>
            <input type="range" min="-3" max="3" step="0.5" value={val}
              onChange={e => { const n = [...x]; n[i] = +e.target.value; setX(n); }}
              style={{ flex: 1 }} />
            <span style={{ color: P.blue, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 28, textAlign: "right" }}>{val.toFixed(1)}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: P.pink + "08", border: `1px solid ${P.pink}15`, fontSize: 14, color: P.muted, lineHeight: 1.6 }}>
        💡 {t("Embedding, Attention, MLP — hepsi matris çarpımıdır. y = Wx bu dersin en önemli formülü!", "Embedding, Attention, MLP — all are matrix multiplications. y = Wx is this course's most important formula!", lang)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TRANSPOSE VISUALIZER
   ═══════════════════════════════════════════ */
function TransposeViz({ lang }) {
  const [M, setM] = useState([[1, 2, 3], [4, 5, 6]]);
  const T = M[0].map((_, j) => M.map(row => row[j]));
  const [hovCell, setHovCell] = useState(null);

  const Cell = ({ val, r, c, isT, highlighted }) => (
    <div
      onMouseEnter={() => setHovCell(isT ? { r: c, c: r } : { r, c })}
      onMouseLeave={() => setHovCell(null)}
      style={{
        width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 6, fontSize: 17, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
        background: highlighted ? P.amber + "20" : P.card,
        border: `1px solid ${highlighted ? P.amber + "50" : P.border}`,
        color: highlighted ? P.amber : P.text,
        transition: "all 0.2s", cursor: "default",
      }}
    >{val}</div>
  );

  return (
    <div>
      <div style={{ fontSize: 16, color: P.text, marginBottom: 10, lineHeight: 1.8 }}>
        <strong style={{ color: P.amber }}>{t("Transpoz", "Transpose", lang)}</strong> (Aᵀ): {t("satır ↔ sütun değiştirir. Attention'da Kᵀ için kullanılır.", "swaps rows ↔ columns. Used for Kᵀ in Attention.", lang)}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        {/* Original */}
        <div>
          <div style={{ color: P.teal, fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>A <span style={{ color: P.dim }}>({M.length}×{M[0].length})</span></div>
          {M.map((row, r) => (
            <div key={r} style={{ display: "flex", gap: 3, marginBottom: 3 }}>
              {row.map((val, c) => (
                <Cell key={c} val={val} r={r} c={c} isT={false}
                  highlighted={hovCell && hovCell.r === r && hovCell.c === c} />
              ))}
            </div>
          ))}
        </div>

        <span style={{ color: P.amber, fontSize: 24, fontWeight: 800 }}>→ᵀ</span>

        {/* Transposed */}
        <div>
          <div style={{ color: P.amber, fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>Aᵀ <span style={{ color: P.dim }}>({T.length}×{T[0].length})</span></div>
          {T.map((row, r) => (
            <div key={r} style={{ display: "flex", gap: 3, marginBottom: 3 }}>
              {row.map((val, c) => (
                <Cell key={c} val={val} r={r} c={c} isT={true}
                  highlighted={hovCell && hovCell.r === c && hovCell.c === r} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 8, background: P.amber + "08", border: `1px solid ${P.amber}15`, fontSize: 14, color: P.muted, lineHeight: 1.6 }}>
        💡 {t("A[i][j] = Aᵀ[j][i]. Attention'da score = Q × Kᵀ — K'yı transpose edip Q ile çarpmak benzerlik hesaplar!", "A[i][j] = Aᵀ[j][i]. In Attention, score = Q × Kᵀ — transposing K and multiplying with Q computes similarity!", lang)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   INTERACTIVE LAB
   ═══════════════════════════════════════════ */
function LinAlgLab({ lang, onConverge }) {
  const [v, setV] = useState([1, 0]);
  const [matrix, setMatrix] = useState([[1, 0], [0, 1]]);
  const result = [matrix[0][0] * v[0] + matrix[0][1] * v[1], matrix[1][0] * v[0] + matrix[1][1] * v[1]];
  const presets = [
    { name: t("Birim", "Identity", lang), m: [[1, 0], [0, 1]] },
    { name: t("Ölçekleme", "Scale 2×", lang), m: [[2, 0], [0, 2]] },
    { name: t("90° Döndür", "Rotate 90°", lang), m: [[0, -1], [1, 0]] },
    { name: t("Yansıma", "Reflect", lang), m: [[1, 0], [0, -1]] },
    { name: t("Çarpıtma", "Shear", lang), m: [[1, 0.5], [0, 1]] },
  ];

  const W = 240, H = 240, mid = W / 2;
  const scale = 30;

  return (
    <div>
      <div style={{ fontSize: 16, color: P.text, marginBottom: 10, lineHeight: 1.8 }}>
        🧪 <strong style={{ color: P.emerald }}>{t("Dönüşüm laboratuvarı!", "Transformation lab!", lang)}</strong> {t("Matris seçip vektörün nasıl dönüştüğünü gör.", "Pick a matrix and see how the vector transforms.", lang)}
      </div>

      {/* Presets */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {presets.map((p, i) => (
          <button key={i} onClick={() => setMatrix(p.m)} style={{
            padding: "5px 10px", borderRadius: 8, fontSize: 13, fontWeight: 700,
            border: `1px solid ${JSON.stringify(matrix) === JSON.stringify(p.m) ? P.emerald + "50" : P.border}`,
            background: JSON.stringify(matrix) === JSON.stringify(p.m) ? P.emerald + "12" : P.card,
            color: JSON.stringify(matrix) === JSON.stringify(p.m) ? P.emerald : P.muted,
            cursor: "pointer",
          }}>{p.name}</button>
        ))}
      </div>

      {/* Canvas */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", background: P.surface, borderRadius: 12, border: `1px solid ${P.border}` }}>
        {/* Grid */}
        {Array.from({ length: 9 }, (_, i) => i - 4).map(i => (
          <g key={i}>
            <line x1={mid + i * scale} y1={0} x2={mid + i * scale} y2={H} stroke={i === 0 ? P.dim : P.border} strokeWidth={i === 0 ? 0.8 : 0.3} />
            <line x1={0} y1={mid + i * scale} x2={W} y2={mid + i * scale} stroke={i === 0 ? P.dim : P.border} strokeWidth={i === 0 ? 0.8 : 0.3} />
          </g>
        ))}
        {/* Input vector */}
        <line x1={mid} y1={mid} x2={mid + v[0] * scale} y2={mid - v[1] * scale} stroke={P.teal} strokeWidth={2} strokeLinecap="round" strokeDasharray="4 3" opacity={0.6} />
        <circle cx={mid + v[0] * scale} cy={mid - v[1] * scale} r={4} fill={P.teal} opacity={0.6} />
        {/* Result vector */}
        <line x1={mid} y1={mid} x2={mid + result[0] * scale} y2={mid - result[1] * scale} stroke={P.emerald} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={mid + result[0] * scale} cy={mid - result[1] * scale} r={5} fill={P.emerald} />
        {/* Labels */}
        <text x={mid + v[0] * scale + 8} y={mid - v[1] * scale - 6} fill={P.teal} fontSize="9" fontWeight="700" opacity={0.7}>x</text>
        <text x={mid + result[0] * scale + 8} y={mid - result[1] * scale - 6} fill={P.emerald} fontSize="9" fontWeight="700">Ax</text>
      </svg>

      {/* Input slider */}
      <div style={{ marginTop: 6 }}>
        {[["x", 0, P.teal], ["y", 1, P.blue]].map(([label, idx, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ color, fontSize: 13, fontWeight: 700, minWidth: 12 }}>{label}</span>
            <input type="range" min="-3" max="3" step="0.5" value={v[idx]}
              onChange={e => { const n = [...v]; n[idx] = +e.target.value; setV(n); }}
              style={{ flex: 1 }} />
            <span style={{ color, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 28, textAlign: "right" }}>{v[idx].toFixed(1)}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: P.emerald + "08", border: `1px solid ${P.emerald}15`, fontSize: 14, color: P.muted, lineHeight: 1.6 }}>
        💡 {t("Embedding = matris lookup. Attention = matris çarpımı. MLP = matris × aktivasyon × matris. HER ŞEY lineer cebirdir!", "Embedding = matrix lookup. Attention = matrix multiply. MLP = matrix × activation × matrix. EVERYTHING is linear algebra!", lang)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   QUIZ
   ═══════════════════════════════════════════ */
const QS_TR = [
  { q: "Vektör [3, 4]'ün büyüklüğü (magnitude) kaç?", o: ["7", "5", "12", "3.5"], a: 1, e: "√(3²+4²) = √(9+16) = √25 = 5. Pisagor teoremi!" },
  { q: "a=[1,2] ve b=[3,4] ise a·b kaçtır?", o: ["10", "5", "11", "7"], a: 2, e: "1×3 + 2×4 = 3 + 8 = 11" },
  { q: "Dot product negatifse ne anlama gelir?", o: ["Vektörler aynı yöne bakar", "Vektörler zıt yöne bakar", "Vektörler eşit", "Hesaplama hatası"], a: 1, e: "Negatif dot product = 90°'den büyük açı = farklı/zıt yönler." },
  { q: "2×3 matris ile 3×1 vektör çarpımının boyutu ne?", o: ["3×3", "2×1", "2×3", "3×1"], a: 1, e: "(2×3) × (3×1) = (2×1). İç boyutlar (3) eşleşmeli, dış boyutlar (2,1) sonuç." },
  { q: "Transpoz işlemi ne yapar?", o: ["Matrisi siler", "Satır↔sütun değiştirir", "Değerleri sıfırlar", "Matrisi büyütür"], a: 1, e: "Aᵀ[i][j] = A[j][i]. Satırlar sütun olur, sütunlar satır." },
  { q: "Attention'da Q·Kᵀ ne hesaplar?", o: ["Toplam parametre", "Token benzerlik skorları", "Loss değeri", "Gradient"], a: 1, e: "Q·Kᵀ her token çifti arasındaki benzerliği (uyum skoru) hesaplar." },
];
const QS_EN = [
  { q: "What is the magnitude of vector [3, 4]?", o: ["7", "5", "12", "3.5"], a: 1, e: "√(3²+4²) = √(9+16) = √25 = 5. Pythagorean theorem!" },
  { q: "If a=[1,2] and b=[3,4], what is a·b?", o: ["10", "5", "11", "7"], a: 2, e: "1×3 + 2×4 = 3 + 8 = 11" },
  { q: "What does a negative dot product mean?", o: ["Vectors point same way", "Vectors point opposite ways", "Vectors are equal", "Computation error"], a: 1, e: "Negative dot product = angle > 90° = different/opposite directions." },
  { q: "What's the size of a 2×3 matrix times a 3×1 vector?", o: ["3×3", "2×1", "2×3", "3×1"], a: 1, e: "(2×3) × (3×1) = (2×1). Inner dims (3) must match, outer dims (2,1) give result." },
  { q: "What does transpose do?", o: ["Deletes matrix", "Swaps rows↔columns", "Zeros values", "Enlarges matrix"], a: 1, e: "Aᵀ[i][j] = A[j][i]. Rows become columns, columns become rows." },
  { q: "What does Q·Kᵀ compute in Attention?", o: ["Total parameters", "Token similarity scores", "Loss value", "Gradient"], a: 1, e: "Q·Kᵀ computes similarity (compatibility score) between every token pair." },
];

function Quiz({ lang, onComplete }) {
  const QS = lang === "tr" ? QS_TR : QS_EN;
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QS[cur];
  const correct = sel === q.a;

  const pick = (i) => { if (sel !== null) return; setSel(i); if (i === q.a) setScore(s => s + 1); };
  const next = () => {
    if (cur + 1 >= QS.length) { setDone(true); if (score >= QS.length - 1) onComplete?.(); return; }
    setCur(c => c + 1); setSel(null);
  };

  if (done) {
    const pct = Math.round((score / QS.length) * 100);
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: pct >= 80 ? P.emerald : P.amber }}>{score}/{QS.length}</div>
        <div style={{ fontSize: 16, color: P.muted, marginTop: 4 }}>
          {pct >= 80 ? t("Harika! Lineer cebir hazır!", "Excellent! Linear algebra ready!", lang) : t("Tekrar denemelisin!", "Try again!", lang)}
        </div>
        <button onClick={() => { setCur(0); setSel(null); setScore(0); setDone(false); }} style={{
          marginTop: 12, padding: "8px 20px", borderRadius: 8, border: `1px solid ${P.border}`,
          background: "transparent", color: P.text, fontSize: 15, fontWeight: 600, cursor: "pointer",
        }}>{t("Tekrar Dene", "Try Again", lang)}</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 14, color: P.muted, marginBottom: 8 }}>{cur + 1}/{QS.length} • {t("Skor", "Score", lang)}: {score}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: P.text, marginBottom: 10, lineHeight: 1.6 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {q.o.map((opt, i) => {
          const isAns = i === q.a;
          const chosen = i === sel;
          let bg = P.card, bc = P.border, tc = P.text;
          if (sel !== null) {
            if (isAns) { bg = P.emerald + "12"; bc = P.emerald + "40"; tc = P.emerald; }
            else if (chosen) { bg = P.pink + "12"; bc = P.pink + "40"; tc = P.pink; }
            else tc = P.dim;
          }
          return (
            <button key={i} onClick={() => pick(i)} style={{
              padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${bc}`,
              background: bg, color: tc, fontSize: 15, fontWeight: 600,
              cursor: sel !== null ? "default" : "pointer", textAlign: "left",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800,
                background: sel !== null && isAns ? P.emerald + "20" : sel !== null && chosen ? P.pink + "20" : P.border + "50",
                color: sel !== null && isAns ? P.emerald : sel !== null && chosen ? P.pink : P.muted,
                flexShrink: 0,
              }}>
                {sel !== null && isAns ? "✓" : sel !== null && chosen && !isAns ? "✕" : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {sel !== null && (
        <>
          <div style={{
            marginTop: 8, padding: "8px 10px", borderRadius: 8,
            background: correct ? P.emerald + "08" : P.pink + "08",
            border: `1px solid ${correct ? P.emerald : P.pink}18`,
            fontSize: 15, lineHeight: 1.6, animation: "fadeSlideIn 0.3s both",
          }}>
            <strong style={{ color: correct ? P.emerald : P.pink }}>{correct ? "✓ " : "✕ "}{correct ? t("Doğru!", "Correct!", lang) : t("Yanlış!", "Wrong!", lang)} </strong>{q.e}
          </div>
          <button onClick={next} style={{
            marginTop: 8, width: "100%", padding: "9px", borderRadius: 8, border: "none",
            background: `linear-gradient(135deg, ${P.indigo}, ${P.violet})`,
            color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>{cur + 1 >= QS.length ? t("Sonuçlar", "Results", lang) : t("Sonraki →", "Next →", lang)}</button>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHAPTER BODY
   ═══════════════════════════════════════════ */
function Body({ step, lang, onConverge }) {
  switch (step) {
    case 0: return <>
      <S emoji="🗺️" color={P.indigo} text={t(
        "Bir şehirde kaybolduğunu düşün. Konumun bir vektör: [sokak, cadde]. Yönün bir ok. Haritadaki her yer bir koordinat — işte lineer cebir budur!",
        "Imagine being lost in a city. Your location is a vector: [street, avenue]. Your direction is an arrow. Every spot on the map is a coordinate — that's linear algebra!"
      , lang)} />
      <S emoji="🧠" color={P.teal} delay={0.1} text={t(
        "GPT'nin her kelimesi bir vektör (16 veya 4096 boyutlu). Attention, embedding, MLP — hepsi matris çarpımı. Bu ders olmadan GPT anlaşılmaz!",
        "Every word in GPT is a vector (16 or 4096 dimensions). Attention, embedding, MLP — all matrix multiplications. Can't understand GPT without this!"
      , lang)} />
      <S emoji="🎯" color={P.violet} delay={0.2} text={t(
        "Bu derste öğreneceklerin: vektör, dot product (benzerlik), matris çarpımı (dönüşüm), transpoz. Hepsi interaktif!",
        "What you'll learn: vectors, dot product (similarity), matrix multiplication (transformation), transpose. All interactive!"
      , lang)} />
    </>;
    case 1: return <VectorPlayground lang={lang} />;
    case 2: return <DotProductViz lang={lang} />;
    case 3: return <>
      <S emoji="🔢" color={P.blue} text={t(
        "Matris = sayı tablosu. 2×3 matris = 2 satır, 3 sütun. GPT'de embedding tablosu (27×16) bir matristir!",
        "Matrix = number table. 2×3 matrix = 2 rows, 3 columns. In GPT, embedding table (27×16) is a matrix!"
      , lang)} />
      <S emoji="🏗️" color={P.pink} delay={0.1} text={t(
        "Matris × vektör = dönüşüm. Her satır bir dot product yapar. Sonuç: yeni bir vektör. Bu, GPT'deki her katmanın yaptığı şey!",
        "Matrix × vector = transformation. Each row does a dot product. Result: a new vector. This is what every GPT layer does!"
      , lang)} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, margin: "8px 0" }}>
        {[
          [t("Embedding","Embedding",lang), "wte[id]", P.teal],
          [t("Attention Q/K/V","Attention Q/K/V",lang), "W_q × x", P.emerald],
          ["MLP", "W₁ × x", P.pink],
        ].map(([label, formula, color]) => (
          <div key={label} style={{ background: color + "08", border: `1px solid ${color}20`, borderRadius: 8, padding: "8px 4px", textAlign: "center" }}>
            <div style={{ color, fontSize: 11, fontWeight: 700 }}>{label}</div>
            <div style={{ color: P.text, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{formula}</div>
          </div>
        ))}
      </div>
    </>;
    case 4: return <MatMulViz lang={lang} />;
    case 5: return <TransposeViz lang={lang} />;
    case 6: return <LinAlgLab lang={lang} onConverge={onConverge} />;
    case 7: return <Quiz lang={lang} onComplete={onConverge} />;
    default: return null;
  }
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const LinearAlgebraLesson = ({ embedded, externalStep, onStepChange }) => {
  const lang = useLang();
  const [internalStep, setInternalStep] = useState(0);
  const step = embedded ? (externalStep || 0) : internalStep;
  const setStep = embedded ? (s => { const v = typeof s === "function" ? s(step) : s; onStepChange?.(v); }) : setInternalStep;
  const CHAPTERS = lang === "tr" ? LA_CHAPTERS_TR : LA_CHAPTERS_EN;
  const ch = CHAPTERS[step];

  return (
    <div style={{ minHeight: embedded ? "auto" : "100vh", background: P.bg, color: P.text, fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input[type=range]{-webkit-appearance:none;background:transparent;width:100%}
        input[type=range]::-webkit-slider-track{height:3px;background:${P.border};border-radius:2px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${P.teal};margin-top:-5.5px;cursor:pointer;border:2px solid ${P.bg}}
      `}</style>

      {/* Header */}
      {!embedded && <header style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${P.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: P.dim, textTransform: "uppercase" }}>{t("İnteraktif Ders", "Interactive Lesson", lang)}</div>
        <h1 style={{
          margin: "3px 0 0", fontSize: 26, fontWeight: 900, letterSpacing: -0.5,
          background: `linear-gradient(135deg, ${P.teal}, ${P.blue}, ${P.pink})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>{t("Lineer Cebir Temelleri", "Linear Algebra Basics", lang)}</h1>
      </header>}

      {/* Nav */}
      {!embedded &&
      <nav style={{ display: "flex", gap: 2, padding: "8px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
        {CHAPTERS.map((c, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: "0 0 auto", display: "flex", alignItems: "center", gap: 4,
            padding: "4px 9px", borderRadius: 14,
            border: i === step ? `1px solid ${c.color}35` : "1px solid transparent",
            background: i === step ? c.color + "10" : "transparent",
            color: i === step ? c.color : i < step ? P.text : P.dim,
            fontSize: 13, fontWeight: i === step ? 700 : 500, cursor: "pointer",
            whiteSpace: "nowrap", transition: "all 0.25s",
          }}>
            <span style={{ fontSize: 14 }}>{c.icon}</span><span>{c.label}</span>
          </button>
        ))}
      </nav>}

      {/* Title */}
      <div style={{ padding: "8px 16px 2px" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: ch.color, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{ch.icon}</span>{ch.label}
        </h2>
      </div>

      {/* Content */}
      <section style={{ flex: 1, padding: "6px 16px 10px", overflowY: "auto", minHeight: 0 }}>
        <Body step={step} lang={lang} />
      </section>

      {/* Footer */}
      {!embedded && <footer style={{ padding: "6px 16px 12px", borderTop: `1px solid ${P.border}`, background: P.bg }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${P.border}`, background: "transparent", color: step === 0 ? P.dim : P.text, fontSize: 15, fontWeight: 600, cursor: step === 0 ? "default" : "pointer" }}>
            ‹ {t("Geri", "Back", lang)}
          </button>
          <button onClick={() => setStep(s => Math.min(CHAPTERS.length - 1, s + 1))} disabled={step === CHAPTERS.length - 1}
            style={{
              flex: 1.3, padding: "10px", borderRadius: 8, border: "none",
              background: step === CHAPTERS.length - 1 ? P.card : `linear-gradient(135deg, ${CHAPTERS[Math.min(7, step + 1)]?.color}90, ${CHAPTERS[Math.min(7, step + 1)]?.color})`,
              color: step === CHAPTERS.length - 1 ? P.dim : P.white,
              fontSize: 15, fontWeight: 700, cursor: step === CHAPTERS.length - 1 ? "default" : "pointer",
            }}>
            {t("İleri", "Next", lang)} ›
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 3, marginTop: 8 }}>
          {CHAPTERS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              width: i === step ? 18 : 5, height: 3.5, borderRadius: 2,
              background: i === step ? CHAPTERS[i].color : i < step ? CHAPTERS[i].color + "35" : P.border,
              transition: "all 0.3s", cursor: "pointer",
            }} />
          ))}
        </div>
      </footer>}
    </div>
  );
};

export default LinearAlgebraLesson;
