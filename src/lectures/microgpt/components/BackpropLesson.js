import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLang } from "../../../core/i18n";

/* ═══════════════════════════════════════════
   UTILS
   ═══════════════════════════════════════════ */
const sigmoid = (x) => 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));

const P = {
  bg: "#06070b",
  surface: "#0c0e14",
  card: "#10131a",
  border: "#1c2030",
  indigo: "#818cf8",
  teal: "#2dd4bf",
  pink: "#f472b6",
  amber: "#fbbf24",
  violet: "#a78bfa",
  blue: "#60a5fa",
  emerald: "#34d399",
  rose: "#fb7185",
  text: "#e2e8f0",
  muted: "#64748b",
  dim: "#374151",
  white: "#ffffff",
};

const L = (tr, en, lang) => lang === "tr" ? tr : en;

/* ═══════════════════════════════════════════
   CHAPTERS
   ═══════════════════════════════════════════ */
export const BP_CHAPTERS_TR = [
  { icon: "📖", label: "Hikâye", color: P.indigo },
  { icon: "🎲", label: "Başlat", color: P.teal },
  { icon: "🔮", label: "Sigmoid", color: P.violet },
  { icon: "➜", label: "İleri", color: P.blue },
  { icon: "🎯", label: "Hata", color: P.pink },
  { icon: "⬅", label: "Geri Yay", color: P.violet },
  { icon: "🔧", label: "Güncelle", color: P.amber },
  { icon: "🧪", label: "Laboratuvar", color: P.emerald },
  { icon: "🏆", label: "Quiz", color: P.rose },
];
export const BP_CHAPTERS_EN = [
  { icon: "📖", label: "Story", color: P.indigo },
  { icon: "🎲", label: "Init", color: P.teal },
  { icon: "🔮", label: "Sigmoid", color: P.violet },
  { icon: "➤", label: "Forward", color: P.blue },
  { icon: "🎯", label: "Error", color: P.pink },
  { icon: "⬅", label: "Backprop", color: P.violet },
  { icon: "🔧", label: "Update", color: P.amber },
  { icon: "🧪", label: "Lab", color: P.emerald },
  { icon: "🏆", label: "Quiz", color: P.rose },
];

/* ═══════════════════════════════════════════
   NETWORK LOGIC
   ═══════════════════════════════════════════ */
function initNet() {
  const r = () => +(Math.random() * 1.2 - 0.6).toFixed(3);
  return { w1: r(), w2: r(), w3: r(), w4: r(), wh1: r(), wh2: r() };
}

function fwdPass(net, x1, x2) {
  const h1 = sigmoid(x1 * net.w1 + x2 * net.w2);
  const h2 = sigmoid(x1 * net.w3 + x2 * net.w4);
  const o = sigmoid(h1 * net.wh1 + h2 * net.wh2);
  return { h1, h2, o };
}

function trainStep(net, x1, x2, t, lr) {
  const r = fwdPass(net, x1, x2);
  const dk = r.o * (1 - r.o) * (t - r.o);
  const dh1 = r.h1 * (1 - r.h1) * net.wh1 * dk;
  const dh2 = r.h2 * (1 - r.h2) * net.wh2 * dk;
  return {
    w1: +(net.w1 + lr * dh1 * x1).toFixed(6),
    w2: +(net.w2 + lr * dh1 * x2).toFixed(6),
    w3: +(net.w3 + lr * dh2 * x1).toFixed(6),
    w4: +(net.w4 + lr * dh2 * x2).toFixed(6),
    wh1: +(net.wh1 + lr * dk * r.h1).toFixed(6),
    wh2: +(net.wh2 + lr * dk * r.h2).toFixed(6),
  };
}

/* ═══════════════════════════════════════════
   CONFETTI
   ═══════════════════════════════════════════ */
function Confetti({ active }) {
  const ref = useRef(null);
  const anim = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    cv.width = cv.offsetWidth * 2;
    cv.height = cv.offsetHeight * 2;
    ctx.scale(2, 2);
    const W = cv.offsetWidth, H = cv.offsetHeight;
    const cols = [P.indigo, P.teal, P.pink, P.amber, P.violet, P.blue, P.emerald, P.rose];
    const ps = Array.from({ length: 90 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 120,
      y: H * 0.4,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 16 - 3,
      s: Math.random() * 5 + 2,
      c: cols[Math.floor(Math.random() * cols.length)],
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 18,
      life: 1,
    }));
    const go = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      ps.forEach(p => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.vx *= 0.99;
        p.rot += p.vr; p.life -= 0.01;
        ctx.save(); ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s, -p.s / 2, p.s * 2, p.s);
        ctx.restore();
      });
      if (alive) anim.current = requestAnimationFrame(go);
    };
    go();
    return () => cancelAnimationFrame(anim.current);
  }, [active]);
  if (!active) return null;
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999 }} />;
}

/* ═══════════════════════════════════════════
   SIGMOID PLAYGROUND
   ═══════════════════════════════════════════ */
function SigmoidPlayground({ lang }) {
  const [val, setVal] = useState(0);
  const pts = useMemo(() => {
    const a = [];
    for (let x = -6; x <= 6; x += 0.2) a.push({ x, y: sigmoid(x) });
    return a;
  }, []);
  const W = 280, H = 150, pad = 22;
  const toS = (x, y) => [pad + ((x + 6) / 12) * (W - 2 * pad), pad + (1 - y) * (H - 2 * pad)];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${toS(p.x, p.y).join(",")}`).join(" ");
  const [cx, cy] = toS(val, sigmoid(val));

  return (
    <div>
      <div style={{ fontSize: 16, color: P.text, marginBottom: 10, lineHeight: 1.8 }}>
        {L("Sigmoid her sayıyı 0 ile 1 arasına sıkıştırır. Kaydırıcıyla dene!","Sigmoid squeezes any number between 0 and 1. Try the slider!",lang)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block" }}>
        {[0, 0.5, 1].map(y => {
          const [, sy] = toS(0, y);
          return <g key={y}><line x1={pad} y1={sy} x2={W - pad} y2={sy} stroke={P.border} strokeWidth="0.5" /><text x={pad - 4} y={sy + 3} textAnchor="end" fill={P.dim} fontSize="7" fontFamily="'JetBrains Mono', monospace">{y}</text></g>;
        })}
        <path d={d} fill="none" stroke={P.violet} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="16" fill={P.violet} opacity="0.08" />
        <circle cx={cx} cy={cy} r="5" fill={P.violet} stroke={P.bg} strokeWidth="2" />
        <rect x={cx - 26} y={cy - 24} width="52" height="16" rx="8" fill={P.violet} />
        <text x={cx} y={cy - 13.5} textAnchor="middle" fill="white" fontSize="8.5" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
          σ = {sigmoid(val).toFixed(3)}
        </text>
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        <span style={{ color: P.muted, fontSize: 14, fontWeight: 600, minWidth: 42 }}>x = {val.toFixed(1)}</span>
        <input type="range" min="-6" max="6" step="0.1" value={val} onChange={e => setVal(+e.target.value)} style={{ flex: 1 }} />
      </div>
      <div style={{
        marginTop: 10, padding: "10px 12px", borderRadius: 8,
        background: P.violet + "08", border: `1px solid ${P.violet}15`,
        fontSize: 15, color: P.muted, lineHeight: 1.6,
      }}>
        {L("💡 Ortada (0 civarı) eğri en dik — ağ burada en çok öğreniyor. Uçlarda neredeyse düz — öğrenme duruyor.","💡 Near 0 the curve is steepest — the network learns most here. At the extremes it is nearly flat — learning stalls.",lang)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   WEIGHT LABORATORY
   ═══════════════════════════════════════════ */
function WeightLab({ lang, onConverge }) {
  const [net, setNet] = useState(initNet);
  const [x1, setX1] = useState(1);
  const [x2, setX2] = useState(0);
  const target = 1;
  const result = fwdPass(net, x1, x2);
  const error = Math.abs(target - result.o);
  const [epochs, setEpochs] = useState(0);
  const [errors, setErrors] = useState([]);
  const [running, setRunning] = useState(false);
  const [lr, setLr] = useState(1.0);
  const [showConf, setShowConf] = useState(false);
  const timer = useRef(null);

  const tick = useCallback(() => {
    setNet(prev => {
      const next = trainStep(prev, x1, x2, target, lr);
      const r = fwdPass(next, x1, x2);
      const err = Math.abs(target - r.o);
      setErrors(e => [...e.slice(-100), err]);
      setEpochs(n => n + 1);
      if (err < 0.01) {
        clearInterval(timer.current);
        setRunning(false);
        setShowConf(true);
        onConverge?.();
        setTimeout(() => setShowConf(false), 3000);
      }
      return next;
    });
  }, [x1, x2, lr, onConverge]);

  const toggle = () => {
    if (running) { clearInterval(timer.current); setRunning(false); }
    else { setRunning(true); timer.current = setInterval(tick, 120); }
  };

  const reset = () => {
    clearInterval(timer.current); setRunning(false);
    setNet(initNet()); setEpochs(0); setErrors([]); setShowConf(false);
  };

  useEffect(() => () => clearInterval(timer.current), []);

  const WSlider = ({ label, value, onChange, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
      <span style={{ color: P.muted, fontSize: 13, fontWeight: 700, minWidth: 24, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
      <input type="range" min="-3" max="3" step="0.01" value={value} onChange={e => onChange(+e.target.value)} style={{ flex: 1 }} />
      <span style={{ color, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 38, textAlign: "right" }}>{value.toFixed(2)}</span>
    </div>
  );

  const Spark = () => {
    if (errors.length < 2) return null;
    const max = Math.max(...errors, 0.01);
    const w = 200, h = 32;
    const pts = errors.map((v, i) => `${(i / (errors.length - 1)) * w},${3 + (1 - v / max) * (h - 6)}`).join(" ");
    return <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: w, display: "block", marginTop: 4 }}>
      <polyline points={pts} fill="none" stroke={P.pink} strokeWidth="1.5" strokeLinecap="round" />
    </svg>;
  };

  return (
    <div>
      <Confetti active={showConf} />
      <div style={{ fontSize: 16, color: P.text, marginBottom: 12, lineHeight: 1.8 }}>
        {L("🧪 Deney zamanı! Ağırlıkları kaydırarak tahmini hedefe yaklaştır. Ya da otomatik eğitimi başlat!","🧪 Experiment time! Drag weights to bring prediction closer to target. Or start auto-training!",lang)}
      </div>

      {/* Input + Output */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 10, padding: 10 }}>
          <div style={{ color: P.dim, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>{L("GİRİŞLER","INPUTS",lang)}</div>
          {[["x₁", x1, setX1], ["x₂", x2, setX2]].map(([l, v, set]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
              <span style={{ color: P.indigo, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{l}</span>
              <input type="range" min="0" max="1" step="0.1" value={v} onChange={e => set(+e.target.value)} style={{ flex: 1 }} />
              <span style={{ color: P.text, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 20 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 10, padding: 10, textAlign: "center" }}>
          <div style={{ color: P.dim, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 3 }}>{L("TAHMİN","PREDICTION",lang)}</div>
          <div style={{
            fontSize: 28, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
            color: error < 0.05 ? P.emerald : error < 0.2 ? P.amber : P.pink,
            transition: "color 0.3s",
          }}>{result.o.toFixed(3)}</div>
          <div style={{ fontSize: 11, color: P.muted }}>{L("hedef: 1.000","target: 1.000",lang)}</div>
          <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: P.border, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${(1 - error) * 100}%`,
              background: error < 0.05 ? P.emerald : error < 0.2 ? P.amber : P.pink,
              borderRadius: 2, transition: "all 0.3s",
            }} />
          </div>
        </div>
      </div>

      {/* Weights */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
        <div style={{ color: P.dim, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>{L("AĞIRLIKLAR","WEIGHTS",lang)}</div>
        {[["w₁", "w1", P.teal], ["w₂", "w2", P.teal], ["w₃", "w3", P.teal], ["w₄", "w4", P.teal], ["wh₁", "wh1", P.blue], ["wh₂", "wh2", P.blue]].map(([l, k, c]) => (
          <WSlider key={k} label={l} value={net[k]} onChange={v => setNet(n => ({ ...n, [k]: v }))} color={c} />
        ))}
      </div>

      {/* Auto train */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 10, padding: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: P.dim, fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>{L("OTOMATİK EĞİTİM","AUTO TRAINING",lang)}</span>
          {epochs > 0 && <span style={{ color: P.amber, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>Epoch {epochs}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ color: P.muted, fontSize: 13, fontWeight: 600 }}>η</span>
          <input type="range" min="0.1" max="3" step="0.1" value={lr} onChange={e => setLr(+e.target.value)} style={{ flex: 1 }} />
          <span style={{ color: P.teal, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 24 }}>{lr.toFixed(1)}</span>
        </div>
        <Spark />
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button onClick={toggle} style={{
            flex: 1, padding: "9px", borderRadius: 8, border: "none",
            background: running ? `linear-gradient(135deg, ${P.pink}, ${P.rose})` : `linear-gradient(135deg, ${P.indigo}, ${P.teal})`,
            color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
          }}>{running ? L("■ Durdur","■ Stop",lang) : L("▶ Eğit","▶ Train",lang)}</button>
          <button onClick={reset} style={{
            padding: "9px 14px", borderRadius: 8, border: `1px solid ${P.border}`,
            background: "transparent", color: P.muted, fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>↺</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   QUIZ
   ═══════════════════════════════════════════ */
const QS_TR = [
  { q: "Backpropagation'da hata hangi yöne gider?", o: ["Girişten çıkışa", "Çıkıştan girişe", "Rastgele", "Hiçbir yere"], a: 1, e: "Hata çıkıştan geriye yayılır — adı 'geri yayılım'!" },
  { q: "Sigmoid ne yapar?", o: ["Sayıyı 2'ye böler", "0-1 arasına sıkıştırır", "Negatif yapar", "Yuvarlar"], a: 1, e: "Sigmoid her sayıyı 0 ile 1 arasına çevirir." },
  { q: "Öğrenme oranı (η) çok büyükse?", o: ["Daha iyi öğrenir", "Hedefi atlar, sallanır", "Değişmez", "Ağ sıfırlanır"], a: 1, e: "Çok büyük adım = hedefi atlarsın!" },
  { q: "Ağırlıklar neden rastgele başlar?", o: ["Hız için", "Farklılaşma için", "Gelenek", "Fark etmez"], a: 1, e: "Hepsi aynı başlarsa hiçbir zaman farklılaşamaz!" },
  { q: "Yakınsama ne demek?", o: ["1 epoch bitmiş", "Hata yeterince küçülmüş", "Ağırlıklar sıfır", "Süre dolmuş"], a: 1, e: "Hata artık anlamlı şekilde düşmüyor = öğrenme tamamlandı!" },
];
const QS_EN = [
  { q: "In backpropagation, which direction does the error flow?", o: ["Input to output", "Output to input", "Random", "Nowhere"], a: 1, e: "Error propagates backward from output \u2014 hence 'backpropagation'!" },
  { q: "What does sigmoid do?", o: ["Divides by 2", "Squeezes to 0-1 range", "Makes negative", "Rounds"], a: 1, e: "Sigmoid converts any number to a value between 0 and 1." },
  { q: "What if learning rate (\u03b7) is too large?", o: ["Learns better", "Overshoots, oscillates", "No change", "Network resets"], a: 1, e: "Too large step = you overshoot the target!" },
  { q: "Why do weights start random?", o: ["Speed", "Differentiation", "Tradition", "Doesn't matter"], a: 1, e: "If all start the same, they never learn different things!" },
  { q: "What does convergence mean?", o: ["1 epoch done", "Error small enough", "Weights are zero", "Time's up"], a: 1, e: "Error no longer decreasing significantly = learning complete!" },
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
    if (cur + 1 >= QS.length) { setDone(true); if (score + (correct ? 0 : 0) >= 3) onComplete?.(); }
    else { setCur(c => c + 1); setSel(null); }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>{score >= 4 ? "🏆" : score >= 3 ? "🎉" : "📚"}</div>
        <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{score} / {QS.length}</div>
        <div style={{ color: P.muted, fontSize: 16, marginTop: 6 }}>
          {score >= 4 ? L("Mükemmel! Backpropagation ustası!","Excellent! Backpropagation master!",lang) : score >= 3 ? L("Harika! Neredeyse tam!","Great! Almost perfect!",lang) : L("Tekrar dene, yaparsın!","Try again, you can do it!",lang)}
        </div>
        <button onClick={() => { setCur(0); setSel(null); setScore(0); setDone(false); }} style={{
          marginTop: 14, padding: "9px 20px", borderRadius: 8,
          border: `1px solid ${P.border}`, background: P.card,
          color: P.text, fontSize: 15, fontWeight: 600, cursor: "pointer",
        }}>{L("Tekrar Dene","Try Again",lang)}</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ color: P.dim, fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>SORU {cur + 1}/{QS.length}</span>
        <span style={{ color: P.emerald, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{score} puan</span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, lineHeight: 1.6 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {q.o.map((opt, i) => {
          const chosen = sel === i;
          const isAns = i === q.a;
          let bg = P.card, bc = P.border, tc = P.text;
          if (sel !== null) {
            if (isAns) { bg = P.emerald + "12"; bc = P.emerald + "40"; tc = P.emerald; }
            else if (chosen) { bg = P.pink + "12"; bc = P.pink + "40"; tc = P.pink; }
            else tc = P.dim;
          }
          return (
            <button key={i} onClick={() => pick(i)} style={{
              padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${bc}`,
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
            marginTop: 10, padding: "10px 12px", borderRadius: 8,
            background: correct ? P.emerald + "08" : P.pink + "08",
            border: `1px solid ${correct ? P.emerald : P.pink}18`,
            fontSize: 15, lineHeight: 1.6, animation: "fadeSlideIn 0.3s both",
          }}>
            <strong style={{ color: correct ? P.emerald : P.pink }}>{correct ? L("✓ Doğru! ","✓ Correct! ",lang) : L("✕ Yanlış! ","✕ Wrong! ",lang)}</strong>{q.e}
          </div>
          <button onClick={next} style={{
            marginTop: 10, width: "100%", padding: "9px", borderRadius: 8, border: "none",
            background: `linear-gradient(135deg, ${P.indigo}, ${P.violet})`,
            color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>{cur + 1 >= QS.length ? L("Sonuçlar","Results",lang) : L("Sonraki →","Next →",lang)}</button>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MINI NETWORK VIZ
   ═══════════════════════════════════════════ */
function MiniNet({ net, result, step, lang }) {
  const N = { x1: [50, 65], x2: [50, 175], h1: [190, 50], h2: [190, 190], out: [330, 120] };
  const edges = [
    { f: "x1", t: "h1", w: net.w1 }, { f: "x1", t: "h2", w: net.w3 },
    { f: "x2", t: "h1", w: net.w2 }, { f: "x2", t: "h2", w: net.w4 },
    { f: "h1", t: "out", w: net.wh1 }, { f: "h2", t: "out", w: net.wh2 },
  ];
  const nodes = [
    { id: "x1", l: "x₁", v: 1, c: P.indigo },
    { id: "x2", l: "x₂", v: 0, c: P.indigo },
    { id: "h1", l: "h₁", v: result?.h1, c: P.teal },
    { id: "h2", l: "h₂", v: result?.h2, c: P.teal },
    { id: "out", l: "ŷ", v: result?.o, c: P.blue },
  ];
  const isFwd = step === 3;
  const isBack = step === 5;
  const isUpd = step === 6;

  return (
    <svg viewBox="0 0 390 240" style={{ width: "100%", display: "block" }}>
      <defs>
        <filter id="gl"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {[["50",L("GİRİŞ","INPUT",lang)],["190",L("GİZLİ","HIDDEN",lang)],["330",L("ÇIKIŞ","OUTPUT",lang)]].map(([x,t]) =>
        <text key={t} x={x} y="232" textAnchor="middle" fill={P.dim} fontSize="7" fontWeight="700" letterSpacing="1.5">{t}</text>
      )}
      {edges.map((e, i) => {
        const [x1, y1] = N[e.f], [x2, y2] = N[e.t];
        const act = step >= 3;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isUpd ? P.amber + "50" : isBack ? P.violet + "40" : act ? "#ffffff0d" : "#ffffff06"}
              strokeWidth={act ? 1.2 : 0.5} style={{ transition: "all 0.6s" }} />
            {(isFwd || isBack) && (
              <circle r="2" fill={isBack ? P.violet : P.blue} filter="url(#gl)">
                <animateMotion dur={`${1 + i * 0.12}s`} repeatCount="indefinite"
                  path={isBack ? `M${x2},${y2} L${x1},${y1}` : `M${x1},${y1} L${x2},${y2}`} />
                <animate attributeName="opacity" values="0;1;1;0" dur={`${1 + i * 0.12}s`} repeatCount="indefinite" />
              </circle>
            )}
            {step >= 1 && (
              <g>
                <rect x={(x1+x2)/2-14} y={(y1+y2)/2-7} width="28" height="14" rx="7"
                  fill={P.bg} stroke={isUpd ? P.amber+"35" : P.border} strokeWidth="0.6" />
                <text x={(x1+x2)/2} y={(y1+y2)/2+1} textAnchor="middle" dominantBaseline="central"
                  fill={isUpd ? P.amber : P.muted} fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="600">{e.w.toFixed(2)}</text>
              </g>
            )}
          </g>
        );
      })}
      {nodes.map(n => {
        const [cx, cy] = N[n.id];
        const show = step >= (n.id.startsWith("x") ? 0 : 3);
        return (
          <g key={n.id}>
            {show && <circle cx={cx} cy={cy} r="26" fill={n.c} opacity="0.05" />}
            <circle cx={cx} cy={cy} r="20" fill={show ? n.c+"12" : P.surface}
              stroke={show ? n.c+"45" : P.border} strokeWidth={show ? 1.2 : 0.5}
              style={{ transition: "all 0.5s" }} />
            <text x={cx} y={cy - (show && n.v != null ? 4 : 0)} textAnchor="middle" dominantBaseline="central"
              fill={show ? P.white : P.dim} fontSize="10" fontWeight="800">{n.l}</text>
            {show && n.v != null && (
              <text x={cx} y={cy+9} textAnchor="middle" dominantBaseline="central"
                fill={n.c} fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="600">{n.v.toFixed(3)}</text>
            )}
          </g>
        );
      })}
      {step >= 4 && (
        <g>
          <text x="375" y="115" textAnchor="middle" fill={P.pink} fontSize="7" fontWeight="700">{L("hedef","target",lang)}</text>
          <text x="375" y="130" textAnchor="middle" fill={P.pink} fontSize="10" fontWeight="800" fontFamily="'JetBrains Mono', monospace">1.0</text>
        </g>
      )}
    </svg>
  );
}

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
   CHAPTER BODY
   ═══════════════════════════════════════════ */
function Body({ step, net, result, onConverge, lang }) {
  const r = result;
  switch (step) {
    case 0: return <>
      <S emoji="🏀" color={P.indigo} text={L("Basketbol oynamayı düşün. İlk atışta potayı tutturmak zor. Ama her seferinde topu nereye attığına bakıp kolunu düzeltirsin. 10. atışta çok daha iyisin!","Think about shooting hoops. Hard to score on your first try. But each time you adjust your aim. By the 10th shot, you are much better!",lang)} />
      <S emoji="🤖" color={P.teal} delay={0.1} text={L("Yapay zekâ da böyle öğreniyor: tahmin yap → hatana bak → kendini düzelt → tekrarla. Bu döngüye Backpropagation (geri yayılım) diyoruz.","AI learns the same way: predict → check error → correct → repeat. This cycle is called Backpropagation.",lang)} />
      <S emoji="🕸️" color={P.violet} delay={0.2} text={L("Yukarıdaki şekil bir yapay sinir ağı. Daireler 'nöron', çizgiler 'bağlantı'. Her bağlantının bir ağırlığı var — bilginin ne kadar güçlü geçeceğini belirliyor.","The diagram above is a neural network. Circles are neurons, lines are connections. Each connection has a weight — determining how strongly info flows.",lang)} />
    </>;
    case 1: return <>
      <S emoji="🎲" color={P.teal} text={L("İlk gün yeni bir okula gittin — hiçbir şey bilmiyorsun! Ağırlıkları rastgele küçük sayılarla başlatıyoruz.","First day at a new school — you know nothing! We initialize weights with small random numbers.",lang)} />
      <S emoji="💡" color={P.amber} delay={0.1} text={L("Neden rastgele? Hepsi aynı olursa, hepsi aynı şeyi öğrenir! Rastgelelik her nöronun farklı şeyler keşfetmesini sağlıyor.","Why random? If all identical, all learn the same thing! Randomness lets each neuron discover different features.",lang)} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginTop: 6 }}>
        {[["w₁",net.w1],["w₂",net.w2],["w₃",net.w3],["w₄",net.w4],["wh₁",net.wh1],["wh₂",net.wh2]].map(([l,v],i) => (
          <div key={i} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 8, padding: "5px 4px", textAlign: "center" }}>
            <div style={{ color: P.dim, fontSize: 10, fontWeight: 700 }}>{l}</div>
            <div style={{ color: P.teal, fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{v.toFixed(3)}</div>
          </div>
        ))}
      </div>
    </>;
    case 2: return <SigmoidPlayground lang={lang} />;
    case 3: return <>
      <S emoji="🏭" color={P.blue} text={L("Veri giriş kapısından giriyor, her bağlantıdan geçerek ilerliyor. Her nöron sinyalleri toplar ve sigmoid'den geçirir.","Data enters through input, flowing through each connection. Each neuron sums signals and passes through sigmoid.",lang)} />
      {r && <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {[["h₁",r.h1,P.teal],["h₂",r.h2,P.teal],["ŷ",r.o,P.blue]].map(([l,v,c],i) => (
          <div key={i} style={{ flex: 1, background: c+"0d", border: `1px solid ${c}20`, borderRadius: 10, padding: "8px 4px", textAlign: "center" }}>
            <div style={{ color: c, fontSize: 11, fontWeight: 700 }}>{l}</div>
            <div style={{ color: P.white, fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{v.toFixed(3)}</div>
          </div>
        ))}
      </div>}
      <S emoji="🎯" color={P.pink} delay={0.1} text={L(`Ağ ${r?r.o.toFixed(3):"?"} tahmin etti ama doğru cevap 1. Farkı düzeltmemiz lazım!`,`Network predicted ${r?r.o.toFixed(3):"?"} but correct answer is 1. We need to fix this gap!`,lang)} />
    </>;
    case 4: return <>
      <S emoji="🎯" color={P.pink} text={L(`Hata = Hedef − Tahmin = ${r?(1-r.o).toFixed(4):"?"}. Bu fark ne kadar büyükse, o kadar çok düzeltme yapacağız.`,`Error = Target − Prediction = ${r?(1-r.o).toFixed(4):"?"}. The larger the gap, the more correction we apply.`,lang)} />
      {r && <div style={{ background: P.pink+"08", border: `1px solid ${P.pink}18`, borderRadius: 10, padding: 14, textAlign: "center", margin: "6px 0 8px" }}>
        <div style={{ color: P.pink, fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>{L("HATA","ERROR",lang)}</div>
        <div style={{ color: P.white, fontSize: 34, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", marginTop: 3 }}>{Math.abs(1-r.o).toFixed(4)}</div>
        <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: P.border, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.abs(1-r.o)*100}%`, background: `linear-gradient(90deg, ${P.pink}, ${P.amber})`, borderRadius: 2 }} />
        </div>
      </div>}
      <S emoji="📊" color={P.amber} delay={0.1} text={L("Hata sinyali = çıktı × (1−çıktı) × hata. Sigmoid'in eğimini kullanıyoruz.","Error signal = output × (1−output) × error. We use sigmoid's slope — remember the Sigmoid chapter?",lang)} />
    </>;
    case 5: return <>
      <S emoji="🕵️" color={P.violet} text={L("Dedektiflik zamanı! Hatayı çıkıştan geriye gönderiyoruz. Her bağlantıya 'Bu hatada senin payın ne kadar?' diye soruyoruz.","Detective time! We send error backward from output. We ask each connection: How much did you contribute to this error?",lang)} />
      <S emoji="⛓️" color={P.violet} delay={0.1} text={L("Çok katkı yapan bağlantılar daha çok düzeltilecek. Buna 'zincir kuralı' deniyor — hatayı parçalara ayırıp geriye yolluyoruz.","Connections that contributed more get corrected more. This is the chain rule — breaking error into parts and sending backward.",lang)} />
    </>;
    case 6: return <>
      <S emoji="🔧" color={P.amber} text={L("Her ağırlığı biraz düzeltiyoruz: yeni = eski + öğrenme oranı × hata × girdi. Bu kadar!","We adjust each weight: new = old + learning_rate × error × input. That is it!",lang)} />
      <S emoji="🔁" color={P.emerald} delay={0.1} text={L("Bunu yüzlerce kez tekrarlıyoruz. Her seferinde hata küçülür. Sonunda ağ öğrenir — buna 'yakınsama' diyoruz.","We repeat this hundreds of times. Error shrinks each time. Eventually the network learns — we call this convergence.",lang)} />
    </>;
    case 7: return <WeightLab lang={lang} onConverge={onConverge} />;
    case 8: return <Quiz lang={lang} onComplete={onConverge} />;
    default: return null;
  }
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
const BackpropLesson = ({ embedded, externalStep, onStepChange }) => {
  const lang = useLang();
  const [internalStep, setInternalStep] = useState(0);
  const step = embedded ? (externalStep || 0) : internalStep;
  const setStep = embedded ? (s => { const v = typeof s === "function" ? s(step) : s; onStepChange?.(v); }) : setInternalStep;
  const [net] = useState(initNet);
  const result = useMemo(() => fwdPass(net, 1, 0), [net]);
  const [confetti, setConfetti] = useState(false);
  const CHAPTERS = lang === "tr" ? BP_CHAPTERS_TR : BP_CHAPTERS_EN;
  const ch = CHAPTERS[step];

  const onConverge = () => { setConfetti(true); setTimeout(() => setConfetti(false), 3000); };

  return (
    <div style={{ minHeight: embedded ? "auto" : "100vh", background: P.bg, color: P.text, fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:${P.dim};border-radius:3px}
        input[type=range]{-webkit-appearance:none;background:transparent;width:100%}
        input[type=range]::-webkit-slider-track{height:3px;background:${P.border};border-radius:2px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${P.teal};margin-top:-5.5px;cursor:pointer;border:2px solid ${P.bg}}
      `}</style>
      <Confetti active={confetti} />

      {/* Header */}
      {!embedded && <header style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${P.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: P.dim, textTransform: "uppercase" }}>{L("İnteraktif Ders","Interactive Lesson",lang)}</div>
        <h1 style={{
          margin: "3px 0 0", fontSize: 26, fontWeight: 900, letterSpacing: -0.5,
          background: `linear-gradient(135deg, ${P.indigo}, ${P.teal}, ${P.violet})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>Backpropagation</h1>
      </header>}

      {/* Nav */}
      {!embedded && <nav style={{ display: "flex", gap: 2, padding: "8px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
        {CHAPTERS.map((c, i) => {
          const act = i === step;
          return (
            <button key={i} onClick={() => setStep(i)} style={{
              flex: "0 0 auto", display: "flex", alignItems: "center", gap: 4,
              padding: "4px 9px", borderRadius: 14,
              border: act ? `1px solid ${c.color}35` : "1px solid transparent",
              background: act ? c.color + "10" : "transparent",
              color: act ? c.color : i < step ? P.text : P.dim,
              fontSize: 13, fontWeight: act ? 700 : 500, cursor: "pointer",
              whiteSpace: "nowrap", transition: "all 0.25s",
            }}>
              <span style={{ fontSize: 14 }}>{c.icon}</span><span>{c.label}</span>
            </button>
          );
        })}
      </nav>}

      {/* Network */}
      {step <= 6 && (
        <section style={{ margin: "0 12px", background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden", padding: "4px 4px 0" }}>
          <MiniNet net={net} result={result} step={step} lang={lang} />
        </section>
      )}

      {/* Title */}
      <div style={{ padding: "8px 16px 2px" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: ch.color, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{ch.icon}</span>{ch.label}
        </h2>
      </div>

      {/* Content */}
      <section style={{ flex: 1, padding: "6px 16px 10px", overflowY: "auto", minHeight: 0 }}>
        <Body step={step} net={net} result={result} onConverge={onConverge} lang={lang} />
      </section>

      {/* Footer */}
      {!embedded && <footer style={{ padding: "6px 16px 12px", borderTop: `1px solid ${P.border}`, background: P.bg }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${P.border}`, background: "transparent", color: step === 0 ? P.dim : P.text, fontSize: 15, fontWeight: 600, cursor: step === 0 ? "default" : "pointer" }}>
            ‹ {L("Geri","Back",lang)}
          </button>
          <button onClick={() => setStep(s => Math.min(CHAPTERS.length - 1, s + 1))} disabled={step === CHAPTERS.length - 1}
            style={{
              flex: 1.3, padding: "10px", borderRadius: 8, border: "none",
              background: step === CHAPTERS.length - 1 ? P.card : `linear-gradient(135deg, ${CHAPTERS[Math.min(8, step + 1)]?.color}90, ${CHAPTERS[Math.min(8, step + 1)]?.color})`,
              color: step === CHAPTERS.length - 1 ? P.dim : P.white,
              fontSize: 15, fontWeight: 700, cursor: step === CHAPTERS.length - 1 ? "default" : "pointer",
              boxShadow: step < CHAPTERS.length - 1 ? `0 3px 12px ${CHAPTERS[step + 1]?.color}20` : "none",
            }}>
            {L("İleri","Next",lang)} ›
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
}

export default BackpropLesson;
