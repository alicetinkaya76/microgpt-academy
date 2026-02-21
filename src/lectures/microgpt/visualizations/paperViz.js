import React, { useState, useMemo } from 'react';
import { useLang } from '../../../core/i18n';
import { VB, VizBox, FlowArrow, FlowBox, StatBox } from '../../../components/SharedComponents';
import { softmaxArr } from '../../../utils/math';

const TEBox = ({ children, style }) => (
  <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 16, padding: 20, marginBottom: 16, ...style }}>{children}</div>
);
const TELabel = ({ color, children }) => (
  <div style={{ fontSize: 13, color, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>{children}</div>
);
const TEInfoBox = ({ color, icon, title, children }) => (
  <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 12 }}>
    <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{icon}</span>
    <div><div style={{ fontSize: 15, fontWeight: 700, color, marginBottom: 4 }}>{title}</div><div style={{ fontSize: 14, lineHeight: 1.7, color: "#CBD5E1" }}>{children}</div></div>
  </div>
);
const TEAnalojiBox = ({ emoji, title, children }) => (
  <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.08))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#A78BFA", marginBottom: 6 }}>{emoji} {title}</div>
    <div style={{ fontSize: 14, lineHeight: 1.7, color: "#CBD5E1" }}>{children}</div>
  </div>
);
const TESlider = ({ label, value, onChange, min, max, step, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
    <span style={{ fontSize: 13, color: "#94A3B8", minWidth: 55, whiteSpace: "nowrap" }}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} style={{ flex: 1 }} />
    <span style={{ fontSize: 15, fontWeight: 800, color, minWidth: 44, textAlign: "right", fontFamily: "'Fira Code', monospace" }}>
      {typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
    </span>
  </div>
);
const TENum = ({ v, color = "#E2E8F0", size = 16 }) => (
  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: size, fontWeight: 700, color }}>
    {typeof v === "number" ? (Math.abs(v) < 0.005 ? "0.00" : v.toFixed(2)) : v}
  </span>
);
const TEStepBadge = ({ n, active, color, onClick }) => (
  <button onClick={onClick} style={{
    width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 800, border: active ? `2px solid ${color}` : "2px solid rgba(255,255,255,0.06)",
    background: active ? `${color}20` : "transparent", color: active ? color : "#475569",
    cursor: "pointer", transition: "all .2s", fontFamily: "inherit"
  }}>{n}</button>
);

// ═══ STEP-BY-STEP SOFTMAX (Rich) ═══
const TESoftmax = () => {
  const lang = useLang();
  const [vals, setVals] = useState([2.0, 1.0, 0.5, -1.0]);
  const [step, setStep] = useState(0);
  const labels = [lang === "tr" ? "kedi" : "cat", lang === "tr" ? "köpek" : "dog", "kuş", "balık"];
  const emojis = ["🐱", "🐕", "🐦", "🐟"];
  const colors = ["#0EA5E9", "#10B981", "#F59E0B", "#EC4899"];

  const maxV = Math.max(...vals);
  const shifted = vals.map(v => v - maxV);
  const exps = shifted.map(v => Math.exp(v));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map(v => v / sumExp);

  const stepsData = [
    { title: "Ham Skorlar (Logits)", desc: "Model her kelime için bir skor üretir. Yüksek skor = model o kelimeden daha emin.", color: "#0EA5E9" },
    { title: "Güvenlik: max çıkar", desc: `En büyük değer: ${maxV.toFixed(1)}. Tüm değerlerden bunu çıkarıyoruz. Bu sayılar çok büyürse e^x PATLAYACAKTI! Bu trick bunu önler. Sonuç değişmez!`, color: "#8B5CF6" },
    { title: "e üzeri x (üstel)", desc: "Her değerin e^x'ini alıyoruz. Bu negatif sayıları pozitife çevirir ve büyük farkları DAHA büyük farklara dönüştürür.", color: "#F59E0B" },
    { title: "Toplam hesapla", desc: `Tüm e^x değerlerini topluyoruz: ${sumExp.toFixed(3)}. Bu bölen olacak. Böylece sonuçlar 0-1 arasına sıkışacak.`, color: "#EF4444" },
    { title: "Böl → Olasılık!", desc: "Her e^x değerini toplama bölüyoruz. Sonuç: 0-1 arası olasılıklar ve toplamları tam 1!", color: "#10B981" },
  ];

  return (
    <TEBox>
      <TELabel color="#8B5CF6">{"🧮 İnteraktif Softmax — Adım Adım Hesaplama"}</TELabel>

      <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>{"⬇️ Kaydırıcıları hareket ettir — tüm hesaplama canlı güncellenir!"}</div>
        {vals.map((v, i) => (
          <TESlider key={i} label={`${emojis[i]} ${labels[i]}:`} value={v} min={-3} max={5} step={0.1} color={colors[i]}
            onChange={nv => { const nvals = [...vals]; nvals[i] = nv; setVals(nvals); }} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, justifyContent: "center" }}>
        {stepsData.map((s, i) => (
          <TEStepBadge key={i} n={i + 1} active={step === i} color={s.color} onClick={() => setStep(i)} />
        ))}
      </div>

      <div style={{ padding: "14px 18px", borderRadius: 12, background: `${stepsData[step].color}0A`, border: `1px solid ${stepsData[step].color}25`, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: stepsData[step].color, marginBottom: 4 }}>
          Adım {step + 1}: {stepsData[step].title}
        </div>
        <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7 }}>{stepsData[step].desc}</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Kelime</th>
              <th style={{ padding: "8px 10px", textAlign: "center", color: step >= 0 ? "#0EA5E9" : "#1E293B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "color .3s" }}>{"① Skor"}</th>
              <th style={{ padding: "8px 10px", textAlign: "center", color: step >= 1 ? "#8B5CF6" : "#1E293B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "color .3s" }}>{"② -max"}</th>
              <th style={{ padding: "8px 10px", textAlign: "center", color: step >= 2 ? "#F59E0B" : "#1E293B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "color .3s" }}>{"③ e^x"}</th>
              <th style={{ padding: "8px 10px", textAlign: "center", color: step >= 3 ? "#EF4444" : "#1E293B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "color .3s" }}>{"④ /toplam"}</th>
              <th style={{ padding: "8px 10px", textAlign: "center", color: step >= 4 ? "#10B981" : "#1E293B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "color .3s" }}>{"⑤ Olasılık"}</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((l, i) => (
              <tr key={i} style={{ background: step >= 4 && probs[i] === Math.max(...probs) ? "rgba(16,185,129,0.06)" : "transparent" }}>
                <td style={{ padding: "10px", fontWeight: 700, color: colors[i], borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {emojis[i]} {l}
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: step >= 0 ? 1 : 0.12, transition: "opacity .4s" }}>
                  <TENum v={vals[i]} color="#0EA5E9" />
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: step >= 1 ? 1 : 0.12, transition: "opacity .4s" }}>
                  <TENum v={shifted[i]} color="#8B5CF6" />
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: step >= 2 ? 1 : 0.12, transition: "opacity .4s" }}>
                  <TENum v={exps[i]} color="#F59E0B" />
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: step >= 3 ? 1 : 0.12, transition: "opacity .4s" }}>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#EF4444" }}>/{sumExp.toFixed(2)}</span>
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: step >= 4 ? 1 : 0.12, transition: "opacity .4s" }}>
                  <TENum v={probs[i]} color="#10B981" />
                  <span style={{ fontSize: 11, color: "#64748B", marginLeft: 4 }}>({(probs[i] * 100).toFixed(1)}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {step >= 4 && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", justifyContent: "center", height: 110, marginTop: 16, padding: "0 20px" }}>
          {labels.map((l, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>{(probs[i] * 100).toFixed(1)}%</div>
              <div style={{
                width: "100%", maxWidth: 60, height: Math.max(4, probs[i] * 90), borderRadius: 8,
                background: `linear-gradient(180deg, ${colors[i]}, ${colors[i]}80)`,
                transition: "height 0.5s cubic-bezier(.4,0,.2,1)"
              }} />
              <div style={{ fontSize: 12, color: "#94A3B8" }}>{emojis[i]} {l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>{"Formül"}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#E2E8F0", fontFamily: "'Georgia', serif" }}>
          {"softmax(x"}<sub>{"i"}</sub>{") = e"}<sup>{"(x"}<sub>{"i"}</sub>{" - max)"}</sup>{" / Σ e"}<sup>{"(x"}<sub>{"j"}</sub>{" - max)"}</sup>
        </div>
      </div>
    </TEBox>
  );
};

// ═══ DOT PRODUCT with sliders (Rich — 4D) ═══
const TEDotProduct = () => {
  const [q, setQ] = useState([0.5, 0.8, -0.3, 0.6]);
  const [k, setK] = useState([0.7, 0.5, 0.2, -0.4]);
  const colors = ["#0EA5E9", "#10B981", "#F59E0B", "#EC4899"];

  const products = q.map((v, i) => v * k[i]);
  const result = products.reduce((a, b) => a + b, 0);

  return (
    <TEBox>
      <TELabel color="#0EA5E9">{"🎮 İnteraktif Dot Product (Nokta Çarpımı)"}</TELabel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ padding: 14, borderRadius: 12, background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0EA5E9", marginBottom: 8 }}>{"🔍 Query (Q) — Ne arıyorum?"}</div>
          {q.map((v, i) => (
            <TESlider key={i} label={`q${i}:`} value={v} min={-2} max={2} step={0.1} color="#0EA5E9"
              onChange={nv => { const nq = [...q]; nq[i] = nv; setQ(nq); }} />
          ))}
        </div>
        <div style={{ padding: 14, borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981", marginBottom: 8 }}>{"🗝️ Key (K) — Bende ne var?"}</div>
          {k.map((v, i) => (
            <TESlider key={i} label={`k${i}:`} value={v} min={-2} max={2} step={0.1} color="#10B981"
              onChange={nv => { const nk = [...k]; nk[i] = nv; setK(nk); }} />
          ))}
        </div>
      </div>

      <div style={{ padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>{"Hesaplama: her elemanı çarp, sonra topla"}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", alignItems: "center" }}>
          {q.map((v, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ fontSize: 18, color: "#475569", fontWeight: 800 }}>+</span>}
              <div style={{ padding: "8px 12px", borderRadius: 10, background: `${colors[i]}10`, border: `1px solid ${colors[i]}25`, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <TENum v={v} color="#0EA5E9" size={14} />
                  <span style={{ color: "#475569", fontSize: 12 }}>{"×"}</span>
                  <TENum v={k[i]} color="#10B981" size={14} />
                </div>
                <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{"= "}<TENum v={products[i]} color={colors[i]} size={12} /></div>
              </div>
            </React.Fragment>
          ))}
          <span style={{ fontSize: 22, color: "#475569", fontWeight: 800, margin: "0 6px" }}>=</span>
          <div style={{
            padding: "12px 20px", borderRadius: 12, textAlign: "center",
            background: result > 0 ? "rgba(16,185,129,0.12)" : result < 0 ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.05)",
            border: `2px solid ${result > 0 ? "#10B981" : result < 0 ? "#EF4444" : "#475569"}40`,
            transition: "all .3s"
          }}>
            <TENum v={result} color={result > 0 ? "#10B981" : result < 0 ? "#EF4444" : "#94A3B8"} size={24} />
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              {result > 1 ? "🔥 Çok benzer!" : result > 0.3 ? "👍 Benzer" : result > -0.3 ? "😐 Nötr" : "👎 Farklı"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {[
          { range: [-4, -0.5], label: "Zıt yön", emoji: "🔴", desc: "Dikkat ETME" },
          { range: [-0.5, 0.5], label: "Nötr", emoji: "⚪", desc: "İlgisiz" },
          { range: [0.5, 4], label: "Aynı yön", emoji: "🟢", desc: "DİKKAT ET!" },
        ].map((r, i) => (
          <div key={i} style={{
            flex: 1, padding: "10px 8px", borderRadius: 10, textAlign: "center",
            background: result >= r.range[0] && result < r.range[1] ? "rgba(255,255,255,0.06)" : "transparent",
            border: result >= r.range[0] && result < r.range[1] ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
            transition: "all .3s"
          }}>
            <div style={{ fontSize: 20 }}>{r.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1" }}>{r.label}</div>
            <div style={{ fontSize: 10, color: "#64748B" }}>{r.desc}</div>
          </div>
        ))}
      </div>
    </TEBox>
  );
};

// ═══ FULL ATTENTION PIPELINE (New — didn't exist before) ═══
const TEScaledAttentionPipeline = () => {
  const [step, setStep] = useState(0);
  const [dk, setDk] = useState(64);

  const rawScores = [1.2, 3.8, 0.5];
  const tokens = ["Ben", "okula", "gittim"];
  const sqrtDk = Math.sqrt(dk);
  const scaled = rawScores.map(s => s / sqrtDk);
  const probs = softmaxArr(scaled);
  const values = [[0.3, 0.7], [0.9, 0.1], [0.5, 0.5]];
  const output = values[0].map((_, d) => probs.reduce((s, p, t) => s + p * values[t][d], 0));

  const stepsInfo = [
    { title: "Q·K Çarpımı", color: "#0EA5E9", desc: `"Ben" kelimesinin Query'si ile her kelimenin Key'i çarpılır.` },
    { title: "÷ √d Scaling", color: "#8B5CF6", desc: `d_k = ${dk} → √${dk} = ${sqrtDk.toFixed(1)}. Büyük boyutlarda dot product çok büyük olur → softmax patlar!` },
    { title: "Softmax", color: "#10B981", desc: "Skorlar 0-1 arası olasılığa dönüşür. Toplam = 1." },
    { title: "× Value", color: "#EC4899", desc: "Her kelimenin Value vektörü, kendi olasılığı ile çarpılıp toplanır." },
  ];

  return (
    <TEBox>
      <TELabel color="#EC4899">{"🔬 Tam Attention Pipeline — Adım adım hesapla"}</TELabel>

      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
        {stepsInfo.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "12px 8px", border: "none", cursor: "pointer",
            background: step === i ? `${s.color}12` : "transparent",
            borderBottom: step === i ? `3px solid ${s.color}` : "3px solid transparent",
            color: step === i ? s.color : "#475569", fontSize: 12, fontWeight: 700,
            transition: "all .2s", fontFamily: "inherit"
          }}>
            {s.title}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 18px", borderRadius: 14, background: `${stepsInfo[step].color}06`, border: `1px solid ${stepsInfo[step].color}20`, marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: stepsInfo[step].color, marginBottom: 6 }}>
          {"Adım "}{step + 1}{": "}{stepsInfo[step].title}
        </div>
        <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7, marginBottom: 14 }}>{stepsInfo[step].desc}</div>

        {step === 0 && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {tokens.map((t, i) => (
              <div key={i} style={{ padding: "14px 18px", borderRadius: 12, background: `rgba(14,165,233,${0.05 + rawScores[i] / 5 * 0.15})`, border: "1px solid rgba(14,165,233,0.2)", textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>{"Q·K(\""}{t}{"\")"}</div>
                <TENum v={rawScores[i]} color="#0EA5E9" size={24} />
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div>
            <TESlider label="d_k:" value={dk} min={4} max={512} step={4} color="#8B5CF6" onChange={setDk} />
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
              {tokens.map((t, i) => (
                <div key={i} style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", textAlign: "center", minWidth: 130 }}>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>{rawScores[i].toFixed(1)}{" ÷ "}{sqrtDk.toFixed(1)}</div>
                  <TENum v={scaled[i]} color="#8B5CF6" size={22} />
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{t}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(139,92,246,0.06)", fontSize: 13, color: "#A78BFA", textAlign: "center" }}>
              {"💡 d_k kaydırıcıyı değiştir — büyük d_k → daha küçük skorlar → softmax daha düzgün dağılır"}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", justifyContent: "center", height: 140 }}>
            {tokens.map((t, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 80 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>{(probs[i] * 100).toFixed(1)}%</div>
                <div style={{
                  width: 60, height: Math.max(6, probs[i] * 120), borderRadius: 8,
                  background: "linear-gradient(180deg, #10B981, #059669)",
                  transition: "height .5s ease"
                }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{t}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{"skor: "}{scaled[i].toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
              {tokens.map((t, i) => (
                <div key={i} style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.2)",
                  textAlign: "center", opacity: 0.4 + probs[i] * 1.5
                }}>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>{(probs[i] * 100).toFixed(0)}{"% × V(\""}{t}{"\")"}</div>
                  <div style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", color: "#EC4899", marginTop: 4 }}>
                    {probs[i].toFixed(2)}{" × ["}{values[i].join(", ")}{"]"}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", padding: "14px 18px", borderRadius: 12, background: "rgba(236,72,153,0.1)", border: "2px solid rgba(236,72,153,0.3)" }}>
              <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>{"Sonuç vektör:"}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#EC4899", fontFamily: "'Fira Code', monospace" }}>
                [{output.map(v => v.toFixed(3)).join(", ")}]
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "10px 14px", borderRadius: 10, background: "rgba(0,0,0,0.2)", fontSize: 16, fontWeight: 700, color: "#94A3B8", fontFamily: "'Georgia', serif" }}>
        {"Attention(Q,K,V) = "}<span style={{ color: "#10B981" }}>softmax</span>{"("}<span style={{ color: "#0EA5E9" }}>{"Q·K"}<sup>T</sup></span>{" / "}<span style={{ color: "#8B5CF6" }}>{"√d"}<sub>k</sub></span>{") · "}<span style={{ color: "#EC4899" }}>V</span>
      </div>
    </TEBox>
  );
};

// ═══ MULTI-HEAD ATTENTION (Rich — 8 heads) ═══
const TEMultiHead = () => {
  const lang = useLang();
  const [activeHead, setActiveHead] = useState(0);
  const [showMerge, setShowMerge] = useState(false);
  const headColors = ["#0EA5E9", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#EF4444", "#14B8A6", "#6366F1"];
  const headJobs = [
    { name: "Özne-fiil ilişkisi", emoji: "👤", example: "'Kedi' → 'kovaladı'ya dikkat" },
    { name: "Sıfat-isim bağı", emoji: "🎨", example: "'Büyük' → 'ev'e dikkat" },
    { name: "Zaman ifadeleri", emoji: "⏰", example: "'Yarın' → 'gidecek'e dikkat" },
    { name: "Yakınlık ilişkisi", emoji: "📏", example: "Yan yana kelimelere dikkat" },
    { name: "Zamir çözümleme", emoji: "🔗", example: "'O' → 'Ali'ye dikkat" },
    { name: "Cümle yapısı", emoji: "🏗️", example: "Noktalama ve bağlaç dikkat" },
    { name: "Edat bağlantıları", emoji: "📎", example: "'ile' → bağladığı kelimelere" },
    { name: lang === "tr" ? "Genel bağlam" : "General context", emoji: "🌐", example: "Uzak mesafe bağımlılıklar" },
  ];

  return (
    <TEBox>
      <TELabel color="#EC4899">{"🧩 Multi-Head Attention — 8 Paralel Dikkat"}</TELabel>

      <div style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8, textAlign: "center" }}>{"512 boyutlu vektör → 8 head × 64 boyut"}</div>
        <div style={{ display: "flex", gap: 2, borderRadius: 8, overflow: "hidden" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <button key={i} onClick={() => { setActiveHead(i); setShowMerge(false); }} style={{
              flex: 1, height: 40, border: "none", cursor: "pointer",
              background: activeHead === i ? headColors[i] : `${headColors[i]}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: activeHead === i ? "#fff" : headColors[i],
              transition: "all .2s", fontFamily: "inherit"
            }}>
              H{i + 1}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: "#475569" }}>
          <span>[0]</span><span>[63]</span><span>[127]</span><span>[191]</span><span>[255]</span><span>[319]</span><span>[383]</span><span>[447]</span><span>[511]</span>
        </div>
      </div>

      <div style={{ padding: 18, borderRadius: 14, marginBottom: 14, background: `${headColors[activeHead]}0A`, border: `1px solid ${headColors[activeHead]}25`, transition: "all .3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: headColors[activeHead], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            {headJobs[activeHead].emoji}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: headColors[activeHead] }}>{"Head "}{activeHead + 1}{": "}{headJobs[activeHead].name}</div>
            <div style={{ fontSize: 13, color: "#94A3B8" }}>{"Boyut dilimi: ["}{activeHead * 64}{":"}{(activeHead + 1) * 64}{"]"}</div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7 }}>{"Örnek: "}{headJobs[activeHead].example}</div>
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.2)", fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#94A3B8" }}>
          {"q_h = Q["}{activeHead * 64}{":"}{(activeHead + 1) * 64}{"] → 64 boyut"}<br />
          {"k_h = K["}{activeHead * 64}{":"}{(activeHead + 1) * 64}{"] → 64 boyut"}<br />
          {"head"}{activeHead + 1}{" = Attention(q_h, k_h, v_h)"}
        </div>
      </div>

      <button onClick={() => setShowMerge(!showMerge)} style={{
        width: "100%", padding: "12px 20px", borderRadius: 12, border: showMerge ? "none" : "1px solid rgba(255,255,255,0.08)",
        background: showMerge ? "linear-gradient(135deg, #EC4899, #8B5CF6)" : "rgba(255,255,255,0.04)",
        color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .3s"
      }}>
        {showMerge ? "✅ Birleştirme (Concat + W_O)" : "🔀 Birleştirme adımını göster →"}
      </button>
      {showMerge && (
        <div style={{ marginTop: 12, padding: 16, borderRadius: 14, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#A78BFA", marginBottom: 8 }}>{"8 head birleştirilir (concat) ve W_O matrisi ile projekte edilir:"}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0", fontFamily: "'Georgia', serif" }}>
            {"MultiHead = Concat(H"}<sub>1</sub>{",...,H"}<sub>8</sub>{") · W"}<sup>O</sup>
          </div>
          <div style={{ display: "flex", gap: 2, marginTop: 12, borderRadius: 8, overflow: "hidden" }}>
            {headColors.map((c, i) => (
              <div key={i} style={{ flex: 1, height: 24, background: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 800 }}>64</div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{"8 × 64 = 512 → W_O [512×512] → 512 boyut"}</div>
        </div>
      )}
    </TEBox>
  );
};

// ═══ POSITIONAL ENCODING WAVES (Rich — with heatmap) ═══
const TEPosEncoding = () => {
  const [pos, setPos] = useState(3);
  const [dim, setDim] = useState(0);
  const totalDims = 8;
  const maxPos = 20;

  const getVal = (p, d) => {
    const i = Math.floor(d / 2);
    const angle = p / Math.pow(10000, (2 * i) / 512);
    return d % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
  };

  const heatmap = useMemo(() => {
    return Array.from({ length: maxPos }, (_, p) =>
      Array.from({ length: totalDims }, (_, d) => getVal(p, d))
    );
  }, []);

  return (
    <TEBox>
      <TELabel color="#14B8A6">{"🌊 Positional Encoding — İnteraktif Dalga"}</TELabel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <TESlider label="Pozisyon:" value={pos} min={0} max={maxPos - 1} step={1} color="#14B8A6" onChange={setPos} />
        <TESlider label="Boyut:" value={dim} min={0} max={totalDims - 1} step={1} color="#EC4899" onChange={setDim} />
      </div>

      <div style={{ textAlign: "center", marginBottom: 16, padding: "14px 18px", borderRadius: 12, background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)" }}>
        <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>
          {"PE(pos="}{pos}{", dim="}{dim}{") = "}{dim % 2 === 0 ? "sin" : "cos"}{"("}{pos}{" / 10000^("}{2 * Math.floor(dim / 2)}{"/512))"}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#14B8A6", fontFamily: "'Fira Code', monospace" }}>
          {getVal(pos, dim).toFixed(4)}
        </div>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>{"Isı haritası: satır=pozisyon, sütun=boyut (seçili hücreye tıkla)"}</div>
        <div style={{ display: "flex", gap: 1, marginLeft: 30, marginBottom: 2 }}>
          {Array.from({ length: totalDims }, (_, d) => (
            <div key={d} style={{ width: 40, textAlign: "center", fontSize: 9, color: dim === d ? "#EC4899" : "#475569", fontWeight: dim === d ? 800 : 400 }}>d{d}</div>
          ))}
        </div>
        {Array.from({ length: Math.min(maxPos, 14) }, (_, p) => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 1 }}>
            <div style={{ width: 28, textAlign: "right", fontSize: 10, color: pos === p ? "#14B8A6" : "#475569", fontWeight: pos === p ? 800 : 400, paddingRight: 4 }}>{p}</div>
            {Array.from({ length: totalDims }, (_, d) => {
              const val = heatmap[p][d];
              const isSelected = p === pos && d === dim;
              const hue = val > 0 ? 160 : 0;
              const intensity = Math.abs(val);
              return (
                <div key={d} onClick={() => { setPos(p); setDim(d); }} style={{
                  width: 40, height: 24, borderRadius: 3, cursor: "pointer",
                  background: `hsla(${hue}, 70%, 45%, ${0.15 + intensity * 0.65})`,
                  border: isSelected ? "2px solid #fff" : "1px solid rgba(255,255,255,0.03)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: isSelected ? "#fff" : "transparent", fontWeight: 700,
                  transition: "all .15s"
                }}>
                  {isSelected ? val.toFixed(2) : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: 14, borderRadius: 12, background: "rgba(0,0,0,0.2)", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 8 }}>{"Boyut "}{dim}{" için dalga (seçili pozisyon: "}{pos}{")"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 1, height: 50 }}>
          {Array.from({ length: maxPos }, (_, p) => {
            const val = heatmap[p][dim];
            const h = Math.abs(val) * 22;
            return (
              <div key={p} onClick={() => setPos(p)} style={{
                flex: 1, height: 50, cursor: "pointer", position: "relative"
              }}>
                <div style={{
                  width: "100%", height: h, borderRadius: 2,
                  background: p === pos ? "#14B8A6" : val > 0 ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)",
                  position: "absolute", top: val > 0 ? 25 - h : 25,
                  transition: "all .15s"
                }} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#64748B", textAlign: "center" }}>
        {"🟢 pozitif | 🔴 negatif — düşük boyutlar hızlı, yüksek boyutlar yavaş değişir"}
      </div>
    </TEBox>
  );
};

// ═══ ATTENTION WORD INTERACTION (Rich — 6 words) ═══
const TEAttentionDemo = () => {
  const [selected, setSelected] = useState(0);
  const words = ["Kedi", "süt", "içti", "çünkü", "o", "açıkmıştı"];
  const weights = [
    [0.40, 0.15, 0.10, 0.05, 0.05, 0.25],
    [0.20, 0.35, 0.10, 0.05, 0.10, 0.20],
    [0.30, 0.25, 0.20, 0.05, 0.05, 0.15],
    [0.10, 0.05, 0.15, 0.40, 0.10, 0.20],
    [0.50, 0.05, 0.05, 0.10, 0.15, 0.15],
    [0.35, 0.10, 0.15, 0.10, 0.10, 0.20],
  ];
  const colors = ["#0EA5E9", "#10B981", "#F59E0B", "#94A3B8", "#EC4899", "#8B5CF6"];

  return (
    <TEBox>
      <TELabel color="#10B981">{"🎮 Kelimeye tıkla — hangi kelimelere dikkat ettiğini gör!"}</TELabel>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
        {words.map((w, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            padding: "10px 16px", borderRadius: 10,
            border: selected === i ? `2px solid ${colors[i]}` : "2px solid rgba(255,255,255,0.08)",
            background: selected === i ? `${colors[i]}15` : "rgba(255,255,255,0.02)",
            color: selected === i ? colors[i] : "#CBD5E1",
            fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all .2s",
            transform: selected === i ? "scale(1.1)" : "scale(1)", fontFamily: "inherit"
          }}>
            {w}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: "center", height: 130 }}>
        {words.map((w, i) => {
          const weight = weights[selected][i];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>{(weight * 100).toFixed(0)}%</div>
              <div style={{
                width: "80%", maxWidth: 50, height: Math.max(6, weight * 110), borderRadius: 8,
                background: i === selected ? `linear-gradient(180deg, ${colors[i]}, ${colors[i]}80)` : "linear-gradient(180deg, rgba(148,163,184,0.6), rgba(148,163,184,0.3))",
                transition: "height .5s ease"
              }} />
              <div style={{ fontSize: 12, fontWeight: i === selected ? 800 : 500, color: i === selected ? colors[i] : "#94A3B8" }}>{w}</div>
            </div>
          );
        })}
      </div>
      {selected === 4 && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 10, background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.15)", fontSize: 13, color: "#F472B6", textAlign: "center" }}>
          {"💡 \"o\" kelimesi \"Kedi\"ye %50 dikkat ediyor — zamir çözümleme! Bu, makalenin Figure 4'ündeki davranışla aynı."}
        </div>
      )}
    </TEBox>
  );
};

// ═══ CAUSAL MASK (Rich — with hover) ═══
const TECausalMask = () => {
  const tokens = ["Ben", "okula", "bugün", "gittim", "."];
  const [hoverCell, setHoverCell] = useState(null);

  return (
    <TEBox>
      <TELabel color="#F59E0B">{"🎭 Causal Mask — Hücrelere tıkla!"}</TELabel>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <div style={{ display: "flex", marginLeft: 70 }}>
            {tokens.map((t, i) => (
              <div key={i} style={{ width: 58, textAlign: "center", fontSize: 12, color: "#64748B", fontWeight: 600, padding: "4px 0" }}>{t}</div>
            ))}
          </div>
          {tokens.map((t, row) => (
            <div key={row} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 68, textAlign: "right", paddingRight: 6, fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>{t}</div>
              {tokens.map((_, col) => {
                const allowed = col <= row;
                const isHover = hoverCell && hoverCell[0] === row && hoverCell[1] === col;
                return (
                  <div key={col}
                    onMouseEnter={() => setHoverCell([row, col])}
                    onMouseLeave={() => setHoverCell(null)}
                    style={{
                      width: 54, height: 42, margin: 2, borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: allowed
                        ? isHover ? "rgba(16,185,129,0.35)" : "rgba(16,185,129,0.12)"
                        : isHover ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.06)",
                      border: `1px solid ${allowed ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.12)"}`,
                      cursor: "pointer", transition: "all .15s", fontSize: 18
                    }}>
                    {allowed ? "✓" : "✗"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {hoverCell && (
        <div style={{ textAlign: "center", marginTop: 12, padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", fontSize: 13, color: "#CBD5E1" }}>
          {"\""}{tokens[hoverCell[0]]}{"\" → \""}{tokens[hoverCell[1]]}{"\" : "}
          {hoverCell[1] <= hoverCell[0]
            ? <span style={{ color: "#10B981", fontWeight: 700 }}>{"✅ BAKABİLİR"}</span>
            : <span style={{ color: "#EF4444", fontWeight: 700 }}>{"❌ YASAK — gelecek kelimeye bakamaz!"}</span>}
        </div>
      )}
    </TEBox>
  );
};

// ═══ RESULTS TABLE (Rich — with more models & cost) ═══
const TEResultsTable = () => {
  const data = [
    { model: "ByteNet", de: 23.75, fr: null, cost: "—", isT: false },
    { model: "GNMT + RL", de: 24.6, fr: 39.92, cost: "2.3×10¹⁹", isT: false },
    { model: "ConvS2S", de: 25.16, fr: 40.46, cost: "9.6×10¹⁸", isT: false },
    { model: "Transformer (base)", de: 27.3, fr: 38.1, cost: "3.3×10¹⁸", isT: true },
    { model: "Transformer (big)", de: 28.4, fr: 41.8, cost: "2.3×10¹⁹", isT: true },
  ];
  return (
    <TEBox>
      <TELabel color="#EF4444">{"📊 BLEU Sonuçları — Yüksek = Daha iyi çeviri"}</TELabel>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{["Model", "EN→DE", "EN→FR", "Maliyet"].map((h, i) => (
            <th key={i} style={{ padding: "10px 12px", textAlign: i === 0 ? "left" : "center", fontSize: 11, color: "#64748B", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} style={{ background: r.isT ? "rgba(16,185,129,0.06)" : "transparent" }}>
              <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: r.isT ? 700 : 400, color: r.isT ? "#10B981" : "#CBD5E1", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {r.isT ? "⭐ " : ""}{r.model}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#E2E8F0", fontFamily: "'Fira Code', monospace", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{r.de}</td>
              <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#E2E8F0", fontFamily: "'Fira Code', monospace", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{r.fr ?? "—"}</td>
              <td style={{ padding: "10px 12px", textAlign: "center", fontSize: 12, color: "#94A3B8", fontFamily: "'Fira Code', monospace", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{r.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TEBox>
  );
};

// ═══ TIMELINE (Rich — clickable with details) ═══
const TETimeline = () => {
  const [active, setActive] = useState(0);
  const events = [
    { year: "2017", title: "Transformer", desc: "Bu makale yayınlandı!", color: "#0EA5E9", icon: "📄", detail: "8 GPU, 3.5 gün eğitim. BLEU rekorları kırdı." },
    { year: "2018", title: "BERT & GPT-1", desc: "Google BERT + OpenAI GPT-1", color: "#10B981", icon: "🧠", detail: "BERT: 340M param. GPT-1: 117M param. İkisi de Transformer tabanlı." },
    { year: "2020", title: "GPT-3 & ViT", desc: "175B parametre + görselde Transformer", color: "#8B5CF6", icon: "🚀", detail: "Few-shot learning. ViT: görüntüleri Transformer ile işle." },
    { year: "2022", title: "ChatGPT", desc: "AI herkesin eline ulaştı", color: "#EC4899", icon: "💬", detail: "GPT-3.5 + RLHF. Tarihin en hızlı büyüyen uygulaması." },
    { year: "2023+", title: "GPT-4, Claude, Gemini", desc: "Çok modlu dev modeller", color: "#6366F1", icon: "🌍", detail: "Metin + görüntü + ses. Trilyon parametreye yaklaşılıyor." },
  ];
  return (
    <TEBox>
      <TELabel color="#6366F1">{"🌍 Zaman Çizelgesi — Bir noktaya tıkla!"}</TELabel>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16, padding: "0 10px" }}>
        {events.map((e, i) => (
          <React.Fragment key={i}>
            <button onClick={() => setActive(i)} style={{
              width: 42, height: 42, borderRadius: 21, border: active === i ? `3px solid ${e.color}` : "2px solid rgba(255,255,255,0.1)",
              background: active === i ? `${e.color}20` : "rgba(255,255,255,0.02)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, cursor: "pointer", transition: "all .3s", flexShrink: 0, fontFamily: "inherit",
              transform: active === i ? "scale(1.2)" : "scale(1)"
            }}>{e.icon}</button>
            {i < events.length - 1 && (
              <div style={{ flex: 1, height: 3, background: i < active ? events[active].color : "rgba(255,255,255,0.06)", borderRadius: 2, transition: "background .3s" }} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ padding: 18, borderRadius: 14, background: `${events[active].color}0A`, border: `1px solid ${events[active].color}25` }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: events[active].color }}>{events[active].year}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#E2E8F0", marginBottom: 6 }}>{events[active].title}</div>
        <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7, marginBottom: 8 }}>{events[active].desc}</div>
        <div style={{ fontSize: 13, color: "#94A3B8", padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.15)" }}>{events[active].detail}</div>
      </div>
    </TEBox>
  );
};

// ═══ Section wrapper vizzes for Week B ═══
const TEPaperGirisViz = () => { const lang = useLang(); return (<div>
  <TEAnalojiBox emoji="🎒" title={lang === "tr" ? "Okul Analojisi" : "School Analogy"}>{"Eski yöntemde (RNN) öğretmen her öğrenciye SIRAYLA anlatır — çok yavaş! Yeni yöntemde (Transformer) TÜM sınıfa aynı anda anlatır ve her öğrenci kendine lazım olan bilgiye DİKKAT eder."}</TEAnalojiBox>
  <TEInfoBox color="#0EA5E9" icon="📄" title={lang === "tr" ? "Bu makale ne diyor?" : "What does this paper say?"}>{"2017'de Google araştırmacıları, RNN ve CNN'leri atıp sadece \"attention\" kullanan Transformer modelini yaptılar. Hem daha iyi sonuç hem çok daha hızlı!"}</TEInfoBox>
  <TEInfoBox color="#10B981" icon="🏆" title={lang === "tr" ? "Sonuçlar" : "Results"}>{"İngilizce→Almanca: 28.4 BLEU (rekor!). İngilizce→Fransızca: 41.8 BLEU. Sadece 8 GPU'da 3.5 gün eğitim."}</TEInfoBox>
  <TEInfoBox color="#8B5CF6" icon="💡" title={lang === 'tr' ? 'Neden "Attention Is All You Need"?' : 'Why "Attention Is All You Need"?'}>{"Önceki modellerde attention yardımcıydı, asıl iş RNN yapıyordu. Bu makale RNN'yi tamamen kaldırıp SADECE attention ile model yaptı."}</TEInfoBox>
</div>); };

const TEPaperEskiModViz = () => { const lang = useLang(); return (<div>
  <TEAnalojiBox emoji="📖" title={lang === "tr" ? "Kitap Okuma Analojisi" : "Reading a Book Analogy"}>{"RNN: Her kelimeyi okuyup öncekini hatırlamaya çalışıyorsun. Sayfa 1'dekileri sayfa 100'de unutuyorsun! Transformer: Tüm sayfalar önünde açık, istediğin yere bakabiliyorsun."}</TEAnalojiBox>
  <TEInfoBox color="#F59E0B" icon="⏳" title={lang === "tr" ? "RNN Sorunları" : "RNN Problems"}>{"1. Sıralı: Paralel çalışamaz → yavaş! 2. Unutkan: 100 kelime öncesini hatırlayamaz. 3. Gradient kaybolması."}</TEInfoBox>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
    <div style={{padding:18,borderRadius:14,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",textAlign:"center"}}>
      <div style={{fontSize:40}}>🐢</div><div style={{fontSize:18,fontWeight:800,color:"#EF4444"}}>RNN</div>
      <div style={{fontSize:12,color:"#94A3B8",marginTop:4,whiteSpace:"pre-line"}}>{lang === "tr" ? "Sıralı → O(n) adım\nUzak kelimelere ulaşmak zor" : "Sequential → O(n) steps\nHard to reach distant words"}</div>
    </div>
    <div style={{padding:18,borderRadius:14,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.15)",textAlign:"center"}}>
      <div style={{fontSize:40}}>🚀</div><div style={{fontSize:18,fontWeight:800,color:"#10B981"}}>Transformer</div>
      <div style={{fontSize:12,color:"#94A3B8",marginTop:4,whiteSpace:"pre-line"}}>{lang === "tr" ? "Paralel → O(1) adım\nHerkes herkesi görür!" : "Parallel → O(1) steps\nEveryone sees everyone!"}</div>
    </div>
  </div>
</div>); };

const TEPaperAttentionViz = () => { const lang = useLang(); return (<div>
  <TEAnalojiBox emoji="🔍" title={lang === "tr" ? "Dikkat Analojisi" : "Attention Analogy"}>{"Sınıfta öğretmen konuşurken bazı kelimelere çok dikkat edersin. Attention mekanizması da tam bunu yapıyor!"}</TEAnalojiBox>
  <TEAttentionDemo />
  <TEInfoBox color="#10B981" icon="🔑" title="Query, Key, Value">{"🔍 Query: Ne arıyorum? 🗝️ Key: Bende ne var? 📦 Value: Bilgim bu. Q·K yüksekse → o kelimenin Value'sinden çok bilgi al!"}</TEInfoBox>
  <TEAnalojiBox emoji="📚" title={lang === "tr" ? "Kütüphane Analojisi" : "Library Analogy"}>{"Query: Dinozorlar hakkında kitap arıyorum. Key: Her kitabın etiketi. Value: Kitabın içeriği. Etiket sorunla ne kadar uyumluysa, o kitaptan o kadar çok bilgi alırsın!"}</TEAnalojiBox>
  <TEDotProduct />
</div>); };

const TEPaperMatViz = () => { const lang = useLang(); return (<div>
  <TEAnalojiBox emoji="📐" title={lang === "tr" ? "Matematik Zamanı!" : "Math Time!"}>{"Korkma! Her formülü adım adım, gerçek sayılarla açıklayacağız. Kaydırıcıları oyna!"}</TEAnalojiBox>
  <TESoftmax />
  <TEScaledAttentionPipeline />
  <TEMultiHead />
  <div style={{ padding: 18, borderRadius: 14, textAlign: "center", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
    <div style={{ fontSize: 15, fontWeight: 800, color: "#A78BFA", marginBottom: 8 }}>{lang === "tr" ? "🎯 Özet: 3 Temel Formül" : "🎯 Summary: 3 Key Formulas"}</div>
    <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 2.2, fontFamily: "'Georgia', serif" }}>
      <div>{"① Dot Product: Q·K = Σ q"}<sub>i</sub>{"×k"}<sub>i</sub></div>
      <div>{"② Softmax: P(i) = e"}<sup>{"x"}<sub>i</sub></sup>{" / Σ e"}<sup>{"x"}<sub>j</sub></sup></div>
      <div>{"③ Attention: softmax(Q·K"}<sup>T</sup>{"/√d) · V"}</div>
    </div>
  </div>
</div>); };

const TEPaperMimariViz = () => { const lang = useLang(); return (<div>
  <TEAnalojiBox emoji="🏗️" title={lang === "tr" ? "Fabrika Analojisi" : "Factory Analogy"}>{"Encoder: Girdi cümlesini anlayan bölüm. Decoder: Anlaşılandan yeni cümle üreten bölüm. Her biri 6 katlı!"}</TEAnalojiBox>
  <TEInfoBox color="#0EA5E9" icon="📥" title={lang === "tr" ? "Encoder (6 katman)" : "Encoder (6 layers)"}>{"Her katmanda: 1. Multi-Head Self-Attention + 2. Feed-Forward Network + Residual + LayerNorm"}</TEInfoBox>
  <TEInfoBox color="#EC4899" icon="📤" title={lang === "tr" ? "Decoder (6 katman)" : "Decoder (6 layers)"}>{"1. Masked Self-Attention + 2. Cross-Attention (encoder çıktısına dikkat) + 3. Feed-Forward"}</TEInfoBox>
  <TECausalMask />
  <TEInfoBox color="#8B5CF6" icon="🔄" title="Residual + LayerNorm">{"Her alt-katman: çıktı = LayerNorm(x + Sublayer(x)). Residual bağlantı (+x) gradient'in kaybolmasını önler!"}</TEInfoBox>
  <TEInfoBox color="#10B981" icon="🧮" title="Feed-Forward Network">{"FFN(x) = max(0, x·W1 + b1)·W2 + b2. Genişlet (512→2048) → ReLU → Daralt (2048→512)"}</TEInfoBox>
</div>); };

const TEPaperPozViz = () => { const lang = useLang(); return (<div>
  <TEAnalojiBox emoji="📍" title={lang === "tr" ? "Sıra Neden Önemli?" : "Why Does Order Matter?"}>{"\"Köpek kediyi kovaladı\" ≠ \"Kedi köpeği kovaladı\" — aynı kelimeler ama farklı anlam! Transformer sırayı bilmiyor, bu yüzden pozisyon bilgisi eklenmeli."}</TEAnalojiBox>
  <TEPosEncoding />
  <TEInfoBox color="#14B8A6" icon="🌊" title={lang === "tr" ? "Neden sin/cos?" : "Why sin/cos?"}>{"1. Benzersiz: Her pozisyon farklı dalga deseni alır. 2. Göreceli konum: PE(pos+k), PE(pos)'un lineer dönüşümü. 3. Genelleme: Eğitimde görmediği uzunluklara bile genellenebilir!"}</TEInfoBox>
  <TEAnalojiBox emoji="🎹" title={lang === "tr" ? "Piyano Analojisi" : "Piano Analogy"}>{"Her pozisyon bir akort gibi — farklı frekanslarda dalgaların bileşimi. Düşük boyutlar hızlı değişir (tiz), yüksek boyutlar yavaş (bas)."}</TEAnalojiBox>
</div>); };

const TEPaperEgitimViz = () => { const lang = useLang(); return (<div>
  <TEInfoBox color="#EF4444" icon="💪" title={lang === "tr" ? "Eğitim Detayları" : "Training Details"}>{"Veri: 4.5M cümle (EN-DE) + 36M cümle (EN-FR). Donanım: 8× NVIDIA P100 GPU. Süre: Base: 12 saat, Big: 3.5 gün."}</TEInfoBox>
  <TEAnalojiBox emoji="🏃" title={lang === "tr" ? "Warmup Analojisi" : "Warmup Analogy"}>{"Koşudan önce ısınma yaparsın. Model de önce yavaş öğrenir (warmup), sonra hızlanır, en sonunda yavaşlar."}</TEAnalojiBox>
  <TEInfoBox color="#F59E0B" icon="🎯" title={lang === "tr" ? "Düzenlileştirme" : "Regularization"}>{"Dropout (P=0.1): Rastgele nöronları kapat → ezberlemeyi önle. Label Smoothing (ε=0.1): %100 yerine %90 emin ol → genelleme artar."}</TEInfoBox>
  <TEResultsTable />
</div>); };

const TEPaperEtkiViz = () => { const lang = useLang(); return (<div>
  <TEAnalojiBox emoji="💥" title={lang === "tr" ? "Bir makale nasıl dünyayı değiştirir?" : "How does a paper change the world?"}>{"Bu 15 sayfalık makale, yapay zekanın tüm gidişatını değiştirdi. ChatGPT, Google Translate, görüntü AI'ları — hepsi Transformer tabanlı!"}</TEAnalojiBox>
  <TETimeline />
  <TEInfoBox color="#6366F1" icon="🌐" title={lang === "tr" ? "Sadece dil değil!" : "Not just language!"}>{"🖼️ Görüntü: ViT, DALL-E 🧬 Biyoloji: AlphaFold 🎵 Müzik: MusicGen 💻 Kod: Copilot"}</TEInfoBox>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:16}}>
    {[{n:"90K+",l:lang === "tr" ? "Atıf" : "Citations",c:"#6366F1"},{n:"8",l:lang === "tr" ? "Yazar" : "Authors",c:"#EC4899"},{n:"15",l:lang === "tr" ? "Sayfa" : "Pages",c:"#10B981"},{n:"2017",l:lang === "tr" ? lang === "tr" ? "Yıl" : "Year" : "Year",c:"#F59E0B"}].map((d,i) => (
      <div key={i} style={{padding:14,borderRadius:12,background:`${d.c}08`,border:`1px solid ${d.c}20`,textAlign:"center"}}>
        <div style={{fontSize:24,fontWeight:900,color:d.c}}>{d.n}</div><div style={{fontSize:11,color:"#94A3B8"}}>{d.l}</div>
      </div>
    ))}
  </div>
  <div style={{ padding: 20, borderRadius: 14, textAlign: "center", background: "linear-gradient(135deg, rgba(14,165,233,0.1), rgba(139,92,246,0.1), rgba(236,72,153,0.1))", border: "1px solid rgba(139,92,246,0.2)" }}>
    <div style={{ fontSize: 36, marginBottom: 10 }}>🎓</div>
    <div style={{ fontSize: 18, fontWeight: 800, color: "#E2E8F0", marginBottom: 6 }}>{"Tebrikler!"}</div>
    <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7 }}>{lang === "tr" ? "Attention, Multi-Head, Positional Encoding, Encoder-Decoder... Artık senin için sihir değil, anlaşılır matematik!" : "Attention, Multi-Head, Positional Encoding, Encoder-Decoder... No longer magic, but understandable math!"}</div>
  </div>
</div>); };



export { TEPaperGirisViz, TEPaperEskiModViz, TEPaperAttentionViz, TEPaperMatViz, TEPaperMimariViz, TEPaperPozViz, TEPaperEgitimViz, TEPaperEtkiViz, TESoftmax, TEDotProduct, TEScaledAttentionPipeline, TEMultiHead, TEPosEncoding, TEAttentionDemo, TECausalMask, TEResultsTable, TETimeline };
