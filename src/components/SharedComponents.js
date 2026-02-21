import React, { useState, useMemo } from 'react';
import { useLang, tx } from '../core/i18n';
import { itos } from '../utils/model';

const Spark = ({ data, w = 100, h = 24, color = "#0EA5E9" }) => {
  if (data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rg) * h * 0.85 - h * 0.05}`).join(" ");
  return <svg width={w} height={h}><polygon points={`0,${h} ${pts} ${w},${h}`} fill={`${color}15`}/><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
};

const InfoCard = ({ value, label, color = "#0EA5E9", icon, sub }) => (
  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px 14px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: -10, right: -10, width: 44, height: 44, borderRadius: "50%", background: `${color}08` }} />
    <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
      {icon && <span>{icon}</span>}{label}
    </div>
    <div style={{ fontSize: 21, fontWeight: 700, color, fontFamily: "'Fira Code', monospace" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{sub}</div>}
  </div>
);

const ProbDist = ({ probs, tgt, topK = 14 }) => {
  if (!probs) return null;
  const items = probs.map((p, i) => ({ ch: itos[i], p, i })).sort((a, b) => b.p - a.p).slice(0, topK);
  const mx = items[0]?.p || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>
        Her çubuk bir token olasılığı. <span style={{ color: "#10B981" }}>Yeşil</span> = seçilen token.
      </div>
      {items.map((it, rk) => {
        const isT = it.i === tgt;
        const w = Math.max(3, (it.p / mx) * 100);
        return (
          <div key={it.i} style={{ display: "flex", alignItems: "center", gap: 7, height: 22 }}>
            <span style={{ width: 20, textAlign: "center", fontFamily: "'Fira Code', monospace", fontSize: 17, fontWeight: 700, color: isT ? "#10B981" : "#94A3B8" }}>
              {it.ch === "<BOS>" ? "◆" : it.ch === "<EOS>" ? "■" : it.ch}
            </span>
            <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,0.04)", borderRadius: 7, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${w}%`, borderRadius: 7, background: isT ? "linear-gradient(90deg,#10B981,#34D399)" : rk === 0 ? "linear-gradient(90deg,#0EA5E9,#38BDF8)" : "linear-gradient(90deg,#334155,#475569)", transition: "width .6s cubic-bezier(.34,1.56,.64,1)" }} />
            </div>
            <span style={{ width: 48, textAlign: "right", fontFamily: "'Fira Code', monospace", fontSize: 13, color: isT ? "#10B981" : rk < 3 ? "#94A3B8" : "#475569" }}>
              {(it.p * 100).toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

const AttnMat = ({ weights, tokens, head, setHead }) => {
  if (!weights?.length) return null;
  const nH = weights.length;
  const hColors = ["#0EA5E9", "#8B5CF6", "#10B981", "#F59E0B"];
  return (
    <div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>
        Her hücre, satırdaki token'ın sütundaki token'a ne kadar dikkat ettiğini gösterir. Koyu = yüksek dikkat.
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {Array.from({ length: nH }, (_, h) => (
          <button key={h} onClick={() => setHead(h)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Fira Code', monospace", fontSize: 14, fontWeight: 700, background: head === h ? hColors[h] : "rgba(255,255,255,0.04)", color: head === h ? "#fff" : "#64748B", transition: "all .25s" }}>
            Head {h}
          </button>
        ))}
      </div>
      <div style={{ display: "inline-flex" }}>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
          {tokens.map((t, r) => (
            <div key={r} style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
              <span style={{ fontSize: 14, color: "#94A3B8", fontFamily: "'Fira Code', monospace", fontWeight: 600 }}>
                {t === "<BOS>" ? "◆" : t === "<EOS>" ? "■" : t}
              </span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: "flex" }}>
            {tokens.map((t, c) => (
              <div key={c} style={{ width: 32, height: 22, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <span style={{ fontSize: 12, color: "#64748B", fontFamily: "'Fira Code', monospace" }}>
                  {t === "<BOS>" ? "◆" : t === "<EOS>" ? "■" : t}
                </span>
              </div>
            ))}
          </div>
          {tokens.map((t, r) => {
            const isL = r === tokens.length - 1;
            return (
              <div key={r} style={{ display: "flex" }}>
                {tokens.map((t2, c) => {
                  const msk = c > r;
                  const w = isL && weights[head]?.w[c] || 0;
                  return (
                    <div key={c} style={{
                      width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: 0.5,
                      borderRadius: 4, background: msk ? "rgba(255,255,255,0.01)" : isL ? `rgba(14,165,233,${w})` : `rgba(14,165,233,${c <= r ? 0.06 : 0})`,
                      fontSize: 13, fontFamily: "'Fira Code', monospace", color: isL && w > 0.4 ? "#fff" : isL ? "rgba(14,165,233,.7)" : "#1E293B", transition: "all .4s"
                    }}>
                      {isL ? w.toFixed(1) : msk ? "×" : "·"}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 13, color: "#64748B" }}>
        <span>■ koyu = yüksek dikkat</span>
        <span>× = causal mask (gelecek gizli)</span>
        <span>Son satır = aktif token</span>
      </div>
    </div>
  );
};

const MLPViz = ({ hidden, activated }) => {
  const lang = useLang();
  if (!hidden) return null;
  const n = 64, cols = 16;
  const mx = Math.max(...hidden.map(Math.abs), 0.01);
  const mxA = Math.max(...activated.map(Math.abs), 0.01);
  const aliveCount = activated.filter(v => v > 0).length;
  const deadCount = activated.filter(v => v === 0).length;
  return (
    <div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>
        Her kare bir nöron. <span style={{ color: "#0EA5E9" }}>Mavi</span> = pozitif, <span style={{ color: "#EF4444" }}>Kırmızı</span> = negatif. ReLU² sonrası negatifler sıfıra düşer (ölü nöronlar).
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 6, fontWeight: 600 }}>Linear → 64 nöron</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 1.5, width: cols * 18 }}>
            {hidden.slice(0, n).map((v, i) => {
              const int = Math.abs(v) / mx;
              return <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: v > 0 ? `rgba(14,165,233,${int})` : `rgba(239,68,68,${int})`, transition: "all .3s" }} title={`n${i}: ${v.toFixed(3)}`} />;
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 21, color: "#64748B", fontWeight: 700, padding: "30px 0" }}>→ ReLU² →</div>
        <div>
          <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 6, fontWeight: 600 }}>Aktivasyon sonrası</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 1.5, width: cols * 18 }}>
            {activated.slice(0, n).map((v, i) => {
              const dead = v === 0;
              const int = Math.min(1, v / mxA);
              return <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: dead ? "rgba(255,255,255,0.02)" : `rgba(16,185,129,${int})`, border: dead ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "all .3s" }} title={`n${i}: ${v.toFixed(3)}${dead ? (lang==="tr"?" ÖLÜ":" DEAD") : ""}`} />;
            })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 16, fontSize: 14, color: "#64748B" }}>
        <span>{lang === "tr" ? "Aktif:" : "Active:"} <strong style={{ color: "#10B981" }}>{aliveCount}</strong>/64</span>
        <span>{lang === "tr" ? "Ölü:" : "Dead:"} <strong style={{ color: "#EF4444" }}>{deadCount}</strong>/64</span>
        <span>Sparsity: <strong style={{ color: "#F59E0B" }}>{((deadCount / 64) * 100).toFixed(0)}%</strong></span>
      </div>
    </div>
  );
};

const EmbedViz = ({ dbg }) => {
  const lang = useLang();
  if (!dbg) return null;
  const sections = [
    { label: "Token Embedding", data: dbg.te, desc: lang === "tr" ? "wte[token_id] — karakter vektörü" : "wte[token_id] — character vector" },
    { label: "+ Position Emb", data: dbg.pe, desc: lang === "tr" ? "wpe[pos_id] — konum vektörü" : "wpe[pos_id] — position vector" },
    { label: lang === "tr" ? "= Birleşik" : "= Combined", data: dbg.x0, desc: lang === "tr" ? "tok_emb + pos_emb — nihai girdi" : "tok_emb + pos_emb — final input" }
  ];
  return (
    <div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 10 }}>
        Her çubuk vektörün bir boyutu. <span style={{ color: "#0EA5E9" }}>Mavi</span> = pozitif, <span style={{ color: "#EF4444" }}>Kırmızı</span> = negatif. Yoğunluk = büyüklük.
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {sections.map((sec, si) => (
          <div key={si}>
            <div style={{ fontSize: 15, color: "#E2E8F0", marginBottom: 2, fontWeight: 600 }}>{sec.label}</div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>{sec.desc}</div>
            <div style={{ display: "flex", gap: 2 }}>
              {sec.data.map((v, i) => {
                const mx = Math.max(...sec.data.map(Math.abs));
                return <div key={i} style={{ width: 14, height: 32, borderRadius: 3, background: v > 0 ? `rgba(14,165,233,${Math.abs(v) / mx})` : `rgba(239,68,68,${Math.abs(v) / mx})` }} title={`dim${i}: ${v.toFixed(4)}`} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Pipeline = ({ steps, active }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    {steps.map((s, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: i <= active ? "#fff" : "#475569", transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
          transform: i === active ? "scale(1.2)" : "scale(1)", background: i <= active ? s.color : "rgba(255,255,255,0.03)",
          boxShadow: i === active ? `0 0 16px ${s.color}50` : "none", opacity: i <= active ? 1 : 0.35
        }}>
          {s.icon}
        </div>
        {i < steps.length - 1 && <div style={{ width: 18, height: 2, background: i < active ? s.color : "rgba(255,255,255,0.05)", borderRadius: 1, transition: "all .3s" }} />}
      </div>
    ))}
  </div>
);

const CodeBlock = ({ code, title }) => (
  <div style={{ background: "#0A0F1A", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
    <div style={{ padding: "6px 14px", background: "rgba(255,255,255,.03)", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444" }} />
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B" }} />
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981" }} />
      <span style={{ marginLeft: 6, fontSize: 13, color: "#475569" }}>{title || "microgpt.py"}</span>
    </div>
    <pre style={{ margin: 0, padding: 16, fontSize: 14.5, lineHeight: 1.7, fontFamily: "'Fira Code', monospace", color: "#94A3B8", whiteSpace: "pre-wrap", overflowX: "auto" }}>{code}</pre>
  </div>
);

const DimFlow = ({ activeIdx = -1 }) => {
  const dims = [
    { l: "ID", d: "1", c: "#64748B" }, { l: "Emb", d: "[16]", c: "#0EA5E9" },
    { l: "+Pos", d: "[16]", c: "#8B5CF6" }, { l: "Norm", d: "[16]", c: "#F59E0B" },
    { l: "QKV", d: "4×[4]", c: "#10B981" }, { l: "MLP↑", d: "[64]", c: "#EC4899" },
    { l: "MLP↓", d: "[16]", c: "#EC4899" }, { l: "Out", d: "[28]", c: "#EF4444" }
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
      {dims.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{
            padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: i <= activeIdx ? `${d.c}20` : "rgba(255,255,255,0.02)",
            color: i <= activeIdx ? d.c : "#1E293B",
            border: `1px solid ${i <= activeIdx ? `${d.c}40` : "transparent"}`,
            transition: "all .3s"
          }}>
            {d.l} <span style={{ fontFamily: "'Fira Code', monospace" }}>{d.d}</span>
          </div>
          {i < 7 && <span style={{ color: "#1E293B", fontSize: 13 }}>→</span>}
        </div>
      ))}
    </div>
  );
};

// ─── LECTURE VISUALIZATION COMPONENTS ────────────────────────────────
const VB = { bg: "#0A0F1A", card: "#111827", border: "rgba(255,255,255,0.06)", muted: "#64748B", dim: "#475569", txt: "#94A3B8" };
const VizBox = ({ children, title, color = "#0EA5E9" }) => (<div style={{ margin: "16px 0", background: VB.bg, border: `1px solid ${VB.border}`, borderRadius: 14, overflow: "hidden" }}>{title && <div style={{ padding: "8px 16px", borderBottom: `1px solid ${VB.border}`, display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} /><span style={{ fontSize: 14, fontWeight: 600, color }}>{title}</span></div>}<div style={{ padding: 16 }}>{children}</div></div>);
const FlowArrow = ({ color = "#475569" }) => (<div style={{ display: "flex", alignItems: "center", padding: "0 2px", color, fontSize: 17, fontWeight: 700 }}>→</div>);
const FlowBox = ({ label, sub, color, small, active }) => (<div style={{ padding: small ? "5px 10px" : "8px 14px", borderRadius: 8, minWidth: small ? 50 : 70, background: active ? `${color}20` : `${color}0A`, border: `1.5px solid ${color}30`, textAlign: "center", transition: "all .3s", transform: active ? "scale(1.05)" : "scale(1)", boxShadow: active ? `0 0 12px ${color}25` : "none" }}><div style={{ fontSize: small ? 10 : 12, fontWeight: 700, color, fontFamily: "'Fira Code', monospace" }}>{label}</div>{sub && <div style={{ fontSize: 11, color: VB.muted, marginTop: 2 }}>{sub}</div>}</div>);
const StatBox = ({ value, label, color }) => (<div style={{ textAlign: "center", padding: "6px 10px", background: `${color}08`, borderRadius: 8, border: `1px solid ${color}15`, minWidth: 60 }}><div style={{ fontSize: 19, fontWeight: 800, color, fontFamily: "'Fira Code', monospace" }}>{value}</div><div style={{ fontSize: 11, color: VB.muted }}>{label}</div></div>);

export { Spark, InfoCard, ProbDist, AttnMat, MLPViz, EmbedViz, Pipeline, CodeBlock, DimFlow, VB, VizBox, FlowArrow, FlowBox, StatBox };
