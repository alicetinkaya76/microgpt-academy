import React, { useState } from 'react';
import { useLang, tx } from '../../../core/i18n';
import { VB } from '../../../components/SharedComponents';
import { GLOSSARY } from '../data/glossary';
import { WEEKS } from '../data/weeks';

const QuizWidget = ({ questions, weekColor }) => {
  const lang = useLang();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = questions[current];

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.ans) setScore(s => s + 1);
  };
  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(-1);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };
  const handleReset = () => { setCurrent(0); setSelected(-1); setShowResult(false); setScore(0); setFinished(false); };

  if (finished) return (
    <div style={{ margin: "18px 0", padding: 24, borderRadius: 16, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", textAlign: "center" }}>
      <div style={{ fontSize: 38, marginBottom: 8 }}>🎉</div>
      <div style={{ fontSize: 21, fontWeight: 800, color: "#10B981", marginBottom: 4 }}>{score}/{questions.length} Doğru!</div>
      <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 12 }}>
        {score === questions.length ? "Mükemmel! Tam puan!" : score >= questions.length * 0.7 ? "Harika! İyi anlamışsın." : "Tekrar gözden geçirmeni öneririm."}
      </div>
      <button onClick={handleReset} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: weekColor, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Tekrar Dene</button>
    </div>
  );

  return (
    <div style={{ margin: "18px 0", padding: 20, borderRadius: 16, background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.15)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 19 }}>🧪</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: ".06em" }}>Mini Quiz</span>
        </div>
        <span style={{ fontSize: 13, color: "#64748B" }}>{current + 1}/{questions.length} • {lang === "tr" ? "Skor" : "Score"}: {score}</span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, color: "#E2E8F0", marginBottom: 14, lineHeight: 1.6 }}>{tx(q.q, lang)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        {q.opts.map((opt, i) => {
          const isCorrect = i === q.ans;
          const isSelected = i === selected;
          let bg = "rgba(255,255,255,0.03)";
          let border = "1px solid rgba(255,255,255,0.06)";
          let color = "#CBD5E1";
          if (showResult && isCorrect) { bg = "rgba(16,185,129,0.15)"; border = "1px solid rgba(16,185,129,0.4)"; color = "#10B981"; }
          if (showResult && isSelected && !isCorrect) { bg = "rgba(239,68,68,0.1)"; border = "1px solid rgba(239,68,68,0.3)"; color = "#EF4444"; }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              padding: "10px 14px", borderRadius: 10, border, background: bg, color, fontSize: 15,
              textAlign: "left", cursor: showResult ? "default" : "pointer", fontFamily: "inherit", transition: "all .2s",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: showResult && isCorrect ? "#10B981" : showResult && isSelected ? "#EF4444" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: showResult ? "#fff" : "#64748B", flexShrink: 0 }}>
                {showResult && isCorrect ? "✓" : showResult && isSelected ? "✗" : String.fromCharCode(65 + i)}
              </div>
              {tx(opt, lang)}
            </button>
          );
        })}
      </div>
      {showResult && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: selected === q.ans ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.06)", marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: selected === q.ans ? "#10B981" : "#EF4444", marginBottom: 4 }}>{selected === q.ans ? (lang === "tr" ? "✓ Doğru!" : "✓ Correct!") : (lang === "tr" ? "✗ Yanlış" : "✗ Wrong")}</div>
          <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.5 }}>{tx(q.explain, lang)}</div>
        </div>
      )}
      {showResult && (
        <button onClick={handleNext} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: weekColor, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {current < questions.length - 1 ? (lang === "tr" ? "Sonraki Soru →" : "Next Question →") : (lang === "tr" ? "Sonuçları Gör" : "See Results")}
        </button>
      )}
    </div>
  );
};

const MistakesList = ({ mistakes, weekColor }) => { const lang = useLang(); return (
  <div style={{ margin: "18px 0", padding: 18, borderRadius: 14, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 19 }}>⚠️</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", letterSpacing: ".06em" }}>{lang === "tr" ? "Yaygın Yanlışlar" : "Common Misconceptions"}</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {mistakes.map((m, i) => (
        <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(0,0,0,0.15)" }}>
          <div style={{ fontSize: 15, color: "#EF4444", fontWeight: 600, marginBottom: 4, textDecoration: "line-through", textDecorationColor: "rgba(239,68,68,0.4)" }}>{tx(m.mistake, lang)}</div>
          <div style={{ fontSize: 15, color: "#10B981", lineHeight: 1.5 }}>✓ {tx(m.truth, lang)}</div>
        </div>
      ))}
    </div>
  </div>
);
};

const ComparisonTableWidget = ({ data }) => { const lang = useLang(); return (
  <div style={{ margin: "14px 0", padding: 16, borderRadius: 14, background: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.12)", overflowX: "auto" }}>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#0EA5E9", marginBottom: 10 }}>📊 {tx(data.title, lang)}</div>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr>{data.headers.map((h, i) => (
          <th key={i} style={{ padding: "6px 10px", textAlign: i === 0 ? "left" : "center", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13, whiteSpace: "nowrap" }}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {data.rows.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => (
              <td key={c} style={{ padding: "6px 10px", textAlign: c === 0 ? "left" : "center", color: c === 0 ? "#94A3B8" : "#E2E8F0", fontFamily: c > 0 ? "'Fira Code', monospace" : "inherit", borderBottom: "1px solid rgba(255,255,255,0.03)", fontWeight: c === 0 ? 600 : 400, fontSize: 13 }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {data.note && <div style={{ marginTop: 8, fontSize: 13, color: "#64748B", fontStyle: "italic" }}>{tx(data.note, lang)}</div>}
  </div>
); };

const ResourceLinks = ({ resources }) => {
  const typeIcons = { video: "🎬", blog: "📝", kod: "💻", docs: "📖", paper: "📄" };
  const typeColors = { video: "#EF4444", blog: "#0EA5E9", kod: "#10B981", docs: "#8B5CF6", paper: "#F59E0B" };
  return (
    <div style={{ margin: "14px 0", padding: 16, borderRadius: 14, background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 17 }}>🔗</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: ".06em" }}>Daha Fazla Öğren</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {resources.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.15)", textDecoration: "none", transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}>
            <span style={{ fontSize: 17 }}>{typeIcons[r.type]}</span>
            <span style={{ fontSize: 14, color: "#E2E8F0", fontWeight: 500, flex: 1 }}>{r.title}</span>
            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: `${typeColors[r.type]}15`, color: typeColors[r.type], fontWeight: 600, textTransform: "uppercase" }}>{r.type}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

const GlossaryPanel = ({ searchTerm, setSearchTerm, onClose }) => {
  const lang = useLang();
  const filtered = GLOSSARY.filter(g =>
    g.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx(g.def, lang).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const catColors = { temel: "#F59E0B", mimari: "#10B981", eğitim: "#EF4444", model: "#0EA5E9", veri: "#8B5CF6" };
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 380, height: "100vh", background: "#0D1117", borderLeft: "1px solid rgba(255,255,255,0.08)", zIndex: 100, display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,0.4)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 21 }}>📖</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#E2E8F0" }}>{lang==="tr"?"Kavram Sözlüğü":"Concept Glossary"}</span>
          <span style={{ fontSize: 13, color: "#64748B" }}>{lang==="tr"?`(${GLOSSARY.length} terim)`:`(${GLOSSARY.length} terms)`}</span>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.06)", color: "#94A3B8", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ padding: "10px 20px" }}>
        <input
          type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          placeholder={lang === "tr" ? "Kavram ara... (ör: embedding, gradient)" : "Search concepts... (e.g. embedding, gradient)"}
          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "#E2E8F0", fontSize: 15, outline: "none", fontFamily: "inherit" }}
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        {filtered.length === 0 && <div style={{ textAlign: "center", color: "#475569", fontSize: 15, marginTop: 30 }}>{lang==="tr"?"Sonuç bulunamadı.":"No results found."}</div>}
        {filtered.map((g, i) => (
          <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0" }}>{g.term}</span>
              <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: `${catColors[g.cat]}15`, color: catColors[g.cat], fontWeight: 600, textTransform: "uppercase" }}>{g.cat}</span>
              <span style={{ fontSize: 11, color: "#475569" }}>{lang==="tr"?"Hafta":"Week"} {g.week}</span>
            </div>
            <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.5 }}>{tx(g.def, lang)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgressSidebar = ({ weekIdx, completedSections }) => {
  return WEEKS.map((w, wi) => {
    const total = w.sections.length;
    const done = (completedSections[wi] || []).length;
    const pct = total > 0 ? (done / total) * 100 : 0;
    return (
      <div key={wi} style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: w.color, borderRadius: 2, transition: "width .5s" }} />
      </div>
    );
  });
};


export { QuizWidget, MistakesList, ComparisonTableWidget, ResourceLinks, GlossaryPanel, ProgressSidebar };
