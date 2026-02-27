// ═══════════════════════════════════════════════════════════════
// NFAtoDFA.jsx v4.1 — Subset Construction with Pedagogy
// Sipser Theorem 1.39 · Preset examples · Theory panel
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { C, F, Card, Btn, Pill, Tag, useI18n } from "../theme";
import { subsetConstruction } from "../engines";

const PRESETS = [
  { name:["Sonu 01","Ends 01"], a:["0","1"],
    tr:{d:"En basit nondeterministik örnek: aynı durumdan 0 ile iki farklı yere gidilir."},
    en:{d:"Simplest nondeterministic example: state q0 has two transitions on 0."},
    states:[{id:"q0",start:true,accept:false},{id:"q1",accept:false},{id:"q2",accept:true}],
    trans:[{fr:"q0",to:"q0",syms:["0","1"]},{fr:"q0",to:"q1",syms:["0"]},{fr:"q1",to:"q2",syms:["1"]}] },
  { name:["ε-NFA: (a∪b)*a","ε-NFA: (a∪b)*a"], a:["a","b"],
    tr:{d:"ε-geçişli NFA. ε-closure hesabı gerektirir — DFA başlangıç durumu {q0,q1} olur."},
    en:{d:"NFA with ε-transitions. Requires ε-closure computation — DFA start becomes {q0,q1}."},
    states:[{id:"q0",start:true,accept:false},{id:"q1",accept:false},{id:"q2",accept:true}],
    trans:[{fr:"q0",to:"q1",syms:["ε"]},{fr:"q1",to:"q1",syms:["a","b"]},{fr:"q1",to:"q2",syms:["a"]}] },
  { name:["0-baş ∪ 1-son","Starts 0 ∪ Ends 1"], a:["0","1"],
    tr:{d:"Union NFA: ε-branching ile iki alt otomat. Subset construction birleşik durumlar üretir."},
    en:{d:"Union NFA: ε-branching to two sub-automata. Subset construction produces merged states."},
    states:[{id:"q0",start:true,accept:false},{id:"s1",accept:true},{id:"t1",accept:false},{id:"t2",accept:true}],
    trans:[{fr:"q0",to:"s1",syms:["0"]},{fr:"s1",to:"s1",syms:["0","1"]},{fr:"q0",to:"t1",syms:["ε"]},{fr:"t1",to:"t1",syms:["0","1"]},{fr:"t1",to:"t2",syms:["1"]}] },
  { name:["Çift uzunluk","Even length"], a:["a","b"],
    tr:{d:"Basit ε-yok NFA: determinizmik olmayan dallanma yok ama subset construction algoritmasını adım adım gösterir."},
    en:{d:"Simple NFA without ε: no nondeterministic branching but shows subset construction algorithm step by step."},
    states:[{id:"q0",start:true,accept:true},{id:"q1",accept:false}],
    trans:[{fr:"q0",to:"q1",syms:["a","b"]},{fr:"q1",to:"q0",syms:["a","b"]}] },
];

export default function NFAtoDFA({ onBack }) {
  const { t, lang } = useI18n();
  const li = lang==="en"?"en":"tr";
  const [preset,setPreset] = useState(0);
  const [step,setStep] = useState(-1);
  const [result,setResult] = useState(null);
  const [showTbl,setShowTbl] = useState(false);
  const [showTheory,setShowTheory] = useState(false);

  const run = () => {
    const p=PRESETS[preset];
    const res=subsetConstruction(p.states,p.trans,p.a);
    setResult({...res,nfa:p}); setStep(0);
  };
  const maxS = result?result.steps.length-1:0;

  const visible = useMemo(()=>{
    if(!result||step<0)return{states:[],trans:[],hl:null};
    const vis=new Set(), vt=[];
    const ss=result.dfaStates.find(s=>s.start); if(ss)vis.add(ss.id);
    for(let i=0;i<=Math.min(step,maxS);i++){
      const s=result.steps[i]; vis.add(`{${s.from}}`); vis.add(`{${s.to}}`);
      vt.push({fr:`{${s.from}}`,to:`{${s.to}}`,sym:s.sym});
    }
    return{states:result.dfaStates.filter(s=>vis.has(s.id)),trans:vt,hl:result.steps[Math.min(step,maxS)]};
  },[result,step,maxS]);

  const curPreset = PRESETS[preset];

  return(
    <div style={{maxWidth:860,animation:"fadeIn .25s ease-out"}}>
      {/* Pedagogical header */}
      <Card color={C.ch2} pad={16} style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",flexWrap:"wrap",gap:10}}>
          <div style={{flex:1,minWidth:280}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <Tag color={C.ch2}>Sipser 1.39</Tag>
              <Tag color={C.ts}>{lang==="tr"?"Teorem":"Theorem"}</Tag>
            </div>
            <h2 style={{fontSize:18,fontWeight:800,color:C.wh,fontFamily:F.s,margin:"0 0 6px"}}>{t("nfaToDfa")}</h2>
            <div style={{fontSize:12,color:C.tx,lineHeight:1.6,fontFamily:F.s}}>
              {lang==="tr"
                ? "Her NFA eşdeğer bir DFA'ya dönüştürülebilir. Subset (alt küme) yapısı, NFA'nın aynı anda bulunabileceği durum kümelerini DFA durumları olarak modeller."
                : "Every NFA can be converted to an equivalent DFA. Subset construction models sets of NFA states that can be simultaneously active as DFA states."}
            </div>
          </div>
          <button onClick={()=>setShowTheory(v=>!v)} style={{padding:"8px 14px",borderRadius:8,
            border:`1px solid ${C.ch2}30`,background:`${C.ch2}08`,color:C.ch2,
            fontSize:11,fontWeight:700,fontFamily:F.s}}>
            📐 {lang==="tr"?"Teori":"Theory"} {showTheory?"▾":"▸"}
          </button>
        </div>
        {showTheory && (
          <div style={{marginTop:12,padding:12,borderRadius:10,background:C.gl,border:`1px solid ${C.bd}`,
            fontSize:11,color:C.tx,lineHeight:1.8,fontFamily:F.m,animation:"fadeUp .15s ease-out"}}>
            <div style={{fontWeight:700,color:C.ch2,marginBottom:4}}>Subset Construction Algorithm:</div>
            <span style={{color:C.warn}}>1.</span> q'₀ = ε-closure(q₀) — NFA başlangıcının ε-kapanışı<br/>
            <span style={{color:C.warn}}>2.</span> ∀ DFA durumu S, ∀ sembol a:<br/>
            &nbsp;&nbsp;&nbsp;δ'(S,a) = ε-closure(∪<sub>q∈S</sub> δ(q,a))<br/>
            <span style={{color:C.warn}}>3.</span> F' = {"{S | S ∩ F ≠ ∅}"} — NFA kabul durumu içeren kümeler<br/>
            <span style={{color:C.warn}}>4.</span> Worst case: 2ⁿ DFA durumu (n = NFA durum sayısı)<br/>
            <br/>
            <span style={{color:C.ts}}>Pratikte çoğu DFA durumu erişilemez olduğundan sonuç çok daha küçüktür.</span>
          </div>
        )}
      </Card>

      {/* Preset selector */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:C.ts,fontWeight:700,fontFamily:F.s,marginBottom:6}}>
          {lang==="tr"?"Hazır NFA Örnekleri — tıklayarak seç:":"Preset NFA Examples — click to select:"}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:6}}>
          {PRESETS.map((p,i)=>(
            <button key={i} onClick={()=>{setPreset(i);setResult(null);setStep(-1);}}
              style={{padding:"10px 12px",borderRadius:9,border:`1px solid ${i===preset?C.ch2:C.bd}`,
                background:i===preset?`${C.ch2}08`:C.s1,textAlign:"left",transition:"all .15s"}}
              onMouseEnter={e=>{if(i!==preset)e.currentTarget.style.borderColor=`${C.ch2}35`;}}
              onMouseLeave={e=>{if(i!==preset)e.currentTarget.style.borderColor=C.bd;}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:i===preset?C.ch2:C.wh,fontFamily:F.m}}>{p.name[lang==="en"?1:0]}</span>
                <span style={{fontSize:9,color:C.tm,fontFamily:F.m}}>{p.states.length}Q</span>
              </div>
              <div style={{fontSize:10,color:C.ts,lineHeight:1.4,fontFamily:F.s}}>{p[li].d}</div>
            </button>
          ))}
        </div>
      </div>

      {/* NFA summary before running */}
      <Card color={C.bd} pad={10} style={{marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{fontSize:11,color:C.ts,fontFamily:F.m}}>
            NFA: Q={"{"+curPreset.states.map(s=>s.id).join(",")+"}"}, Σ={"{"+curPreset.a.join(",")+"}"}, q₀={curPreset.states.find(s=>s.start)?.id}, F={"{"+curPreset.states.filter(s=>s.accept).map(s=>s.id).join(",")+"}"}
          </div>
          <div style={{flex:1}}/>
          <Btn color={C.ch2} onClick={run} style={{padding:"8px 20px"}}>{t("convert")}</Btn>
        </div>
      </Card>

      {/* Stepper */}
      {result&&(<>
        <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
          <Btn color={C.ts} variant="outline" onClick={()=>setStep(s=>Math.max(0,s-1))} style={{padding:"6px 14px",fontSize:12}}>{t("prev")}</Btn>
          <div style={{flex:1,textAlign:"center"}}>
            <span style={{fontSize:12,color:C.ts,fontFamily:F.s}}>{t("step")} {Math.min(step+1,result.steps.length)} / {result.steps.length}</span>
            <input type="range" min={0} max={maxS} value={Math.min(step,maxS)} onChange={e=>setStep(+e.target.value)} style={{width:"100%",accentColor:C.ch2}}/>
          </div>
          <Btn color={C.ts} variant="outline" onClick={()=>setStep(s=>Math.min(maxS,s+1))} style={{padding:"6px 14px",fontSize:12}}>{t("next")}</Btn>
        </div>

        {visible.hl && <Card color={C.ch2} pad={10} style={{marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:C.ch2,fontFamily:F.m,marginBottom:3}}>{visible.hl.desc}</div>
          <div style={{fontSize:11,color:C.ts,fontFamily:F.m}}>
            <span style={{color:C.warn}}>move({`{${visible.hl.from}}`}, {visible.hl.sym}):</span>{" {"}{visible.hl.moved.join(", ")}{"}"} →
            <span style={{color:C.info}}> ε-closure:</span>{" {"}{visible.hl.closed.join(", ")}{"}"}
            {visible.hl.isNew && <Tag color={C.ok} style={{marginLeft:6}}>{lang==="tr"?"Yeni durum":"New state"}</Tag>}
          </div>
        </Card>}

        {/* Stats bar */}
        <div style={{display:"flex",gap:12,marginBottom:12,padding:"8px 12px",borderRadius:8,background:C.gl,border:`1px solid ${C.bd}`,fontSize:11,color:C.ts,fontFamily:F.s}}>
          <span>NFA: {result.nfa.states.length}Q</span><span style={{color:C.tm}}>|</span>
          <span>DFA: <span style={{color:C.ch2,fontWeight:700}}>{visible.states.length}</span>/{result.dfaStates.length}Q</span>
          <span style={{color:C.tm}}>|</span>
          <span>δ: {visible.trans.length}/{result.dfaTrans.length}</span>
          {result.dfaStates.length>result.nfa.states.length &&
            <span style={{color:C.warn,marginLeft:6}}>⚠ 2ⁿ={Math.pow(2,result.nfa.states.length)}, {lang==="tr"?"kullanılan":"used"}={result.dfaStates.length}</span>}
        </div>

        {/* Transition table toggle */}
        <Pill color={C.ch2} active={showTbl} onClick={()=>setShowTbl(v=>!v)} style={{marginBottom:10}}>{t("table")} {showTbl?"▾":"▸"}</Pill>

        {showTbl && <div style={{overflowX:"auto",marginBottom:12}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:F.m}}>
            <thead><tr style={{borderBottom:`1.5px solid ${C.bd}`}}>
              <th style={{padding:"6px 10px",textAlign:"left",color:C.ts,fontWeight:700}}>DFA Q</th>
              {result.nfa.a.map(a=><th key={a} style={{padding:"6px 10px",textAlign:"center",color:C.info,fontWeight:700}}>δ'(·,{a})</th>)}
              <th style={{padding:"6px 10px",textAlign:"center",color:C.ok,fontWeight:700}}>F?</th>
            </tr></thead>
            <tbody>{result.dfaStates.map((st,i)=>{
              const isVis=visible.states.find(s=>s.id===st.id);
              return(<tr key={i} style={{borderBottom:`1px solid ${C.bd}`,opacity:isVis?1:.3,transition:"opacity .2s"}}>
                <td style={{padding:"6px 10px",color:st.start?C.ch2:C.tx,fontWeight:st.start?700:400}}>{st.start?"→ ":""}{st.id}</td>
                {result.nfa.a.map(a=>{const tr=result.dfaTrans.find(t=>t.fr===st.id&&t.sym===a);
                  return<td key={a} style={{padding:"6px 10px",textAlign:"center",color:C.tx}}>{tr?.to||"∅"}</td>;})}
                <td style={{padding:"6px 10px",textAlign:"center",color:st.accept?C.ok:C.tm}}>{st.accept?"✓":"—"}</td>
              </tr>);
            })}</tbody>
          </table>
        </div>}

        {/* Step list */}
        <div style={{marginTop:10}}>
          <div style={{fontSize:12,fontWeight:700,color:C.ts,marginBottom:6,fontFamily:F.s}}>{t("stepsAll")}</div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {result.steps.map((s,i)=><button key={i} onClick={()=>setStep(i)} style={{padding:"6px 12px",borderRadius:6,
              border:i===step?`1.5px solid ${C.ch2}`:`1px solid ${C.bd}`,background:i===step?`${C.ch2}0c`:"transparent",
              textAlign:"left",fontFamily:F.s,fontSize:11,fontWeight:600,color:i===step?C.ch2:C.tx}}>
              <span style={{color:C.tm,marginRight:6}}>{i+1}.</span>{s.desc}
            </button>)}
          </div>
        </div>
      </>)}

      {!result && <div style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8,opacity:.3}}>⚡</div>
        <div style={{fontSize:13,color:C.tm,fontFamily:F.s}}>{t("pickNfa")}</div>
      </div>}
    </div>
  );
}
