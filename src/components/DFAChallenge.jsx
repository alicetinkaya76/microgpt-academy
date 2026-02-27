// ═══════════════════════════════════════════════════════════════
// DFAChallenge.jsx v4 — Pedagogical DFA/NFA Challenge
// Objective banner · Phased flow · Rich feedback · Bilingual
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { C, F, CATS, DIF, Card, Btn, Tag, useI18n } from "../theme";
import { simDFA, simNFA, grade } from "../engines";
import Canvas from "./Canvas";

function buildRef(ref) {
  if (!ref?.S) return { states: [], trans: [] };
  return {
    states: ref.S.map(([id,st,ac])=>({id,label:id,start:!!st,accept:!!ac,x:0,y:0})),
    trans: ref.T.map(([fr,sym,to])=>({fr,to,syms:[sym]}))
  };
}

export default function BuilderChallenge({ ch, onBack, isNFA=false }) {
  const { t, lang } = useI18n();
  const cat = CATS[ch.tp]; const col = cat?.c || C.info;
  const sim = isNFA ? simNFA : simDFA;
  const [sts,setSts] = useState([]);
  const [trs,setTrs] = useState([]);
  const [res,setRes] = useState(null);
  const [hIdx,setHIdx] = useState(-1);
  const [sIn,setSIn] = useState("");
  const [sRes,setSRes] = useState(null);
  const [sStep,setSStep] = useState(-1);
  const [showSol,setShowSol] = useState(false);

  const check = () => {
    const ref = buildRef(ch.ref);
    const r = grade(sts,trs,ref.states,ref.trans,ch.a,isNFA?"nfa":"dfa");
    const tcR = ch.tc.map(([inp,exp])=>{
      const got = sim(sts,trs,inp).ok;
      return { inp:inp||"ε", exp:!!exp, got, pass:got===!!exp };
    });
    setRes({...r, tcR, tcP:tcR.filter(t=>t.pass).length, tcT:tcR.length});
  };

  const runSim = () => { setSRes(sim(sts,trs,sIn)); setSStep(0); };
  const activeId = !isNFA && sRes && sStep>=0 ? sRes.path?.[sStep]?.st : null;
  const activeSet = isNFA && sRes && sStep>=0 ? sRes.steps?.[sStep]?.sts : null;

  return (
    <div style={{animation:"fadeIn .25s ease-out"}}>
      {/* Back */}
      <button onClick={onBack} style={{padding:"7px 14px",borderRadius:8,background:C.gl2,color:C.ts,fontSize:12,fontWeight:600,fontFamily:F.s,border:`1px solid ${C.bd}`,marginBottom:14}}>{t("back")}</button>

      {/* Objective Banner */}
      <Card color={col} pad={18} style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:12,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <Tag color={col}>{isNFA?"NFA":"DFA"}</Tag>
              {ch.src && <Tag color={C.ts}>{ch.src}</Tag>}
              <Tag color={DIF[Math.min((ch.dif||1)-1,2)].c}>{lang==="en"?DIF[Math.min((ch.dif||1)-1,2)].en:DIF[Math.min((ch.dif||1)-1,2)].tr}</Tag>
            </div>
            <h2 style={{fontSize:18,fontWeight:800,color:C.wh,fontFamily:F.s,margin:"0 0 6px",lineHeight:1.3}}>{ch.tit}</h2>
            <div style={{fontSize:12,color:C.tx,lineHeight:1.7,fontFamily:F.m,whiteSpace:"pre-line"}}>{ch.desc}</div>
          </div>
          <div style={{background:C.gl2,borderRadius:10,padding:"10px 14px",minWidth:180}}>
            <div style={{fontSize:10,color:C.ts,fontWeight:700,marginBottom:4,fontFamily:F.s}}>{t("objective")}</div>
            <div style={{fontSize:11,color:C.tx,fontFamily:F.s,lineHeight:1.5}}>
              Σ = {"{"}{ch.a.join(", ")}{"}"}
            </div>
            <div style={{fontSize:10,color:C.tm,marginTop:6,fontFamily:F.m}}>
              {ch.tc.slice(0,5).map(([s,a])=>`"${s||"ε"}"${a?"✓":"✗"}`).join("  ")}
            </div>
          </div>
        </div>
      </Card>

      {/* Main layout: canvas + sidebar */}
      <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"start"}}>
        {/* Canvas */}
        <div style={{flex:1,minWidth:480}}>
          <Canvas states={sts} setStates={setSts} trans={trs} setTrans={setTrs}
            color={col} mode={isNFA?"nfa":"dfa"} activeId={activeId} activeSet={activeSet} alphabet={ch.a}/>

          {/* Simulator */}
          <Card color={C.bd} pad={10} style={{marginTop:10}}>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:C.ts,fontFamily:F.s,fontWeight:600}}>{t("simTitle")}</span>
              <input value={sIn} onChange={e=>{setSIn(e.target.value);setSRes(null);setSStep(-1);}}
                placeholder="test..." style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${C.bd}`,
                  background:C.s1,color:C.wh,fontFamily:F.m,fontSize:12,width:100,outline:"none"}}/>
              <Btn color={col} onClick={runSim} style={{padding:"5px 14px",fontSize:11}}>{t("run")}</Btn>
              {sRes && <button onClick={()=>setSStep(s=>Math.min(s+1,(isNFA?sRes.steps:sRes.path).length-1))}
                style={{padding:"5px 10px",borderRadius:6,background:C.gl2,color:C.ts,fontSize:11,fontWeight:600,fontFamily:F.s}}>▶▶</button>}
              {sRes && sStep>=((isNFA?sRes.steps:sRes.path).length-1) &&
                <Tag color={sRes.ok?C.ok:C.err}>{sRes.ok?t("accepted"):sRes.stuck!==undefined?t("stuck"):t("rejected")}</Tag>}
              {sRes && sStep>=0 && <span style={{fontSize:10,color:C.tm,fontFamily:F.m}}>
                {t("step")} {sStep+1}/{(isNFA?sRes.steps:sRes.path).length}
                {isNFA && sRes.steps[sStep] && <span style={{marginLeft:6,color:col}}>{t("active")}: {"{"+[...sRes.steps[sStep].sts].join(",")+"}"}</span>}
              </span>}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{width:300,flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>
          {/* Check button */}
          <Btn color={C.ok} onClick={check} style={{width:"100%",padding:"13px 0",fontSize:14,fontWeight:800}}>
            🚀 {t("check")}
          </Btn>

          {/* Result */}
          {res && (
            <Card color={res.ok?C.ok:C.err} pad={14}>
              <div style={{fontSize:15,fontWeight:800,color:res.ok?C.ok:C.err,marginBottom:8,fontFamily:F.s}}>
                {res.ok ? t("correct") : t("tryAgain")}
              </div>
              {res.score!==undefined && (
                <div style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.ts}}><span>{t("score")}</span><span>{res.score}%</span></div>
                  <div style={{height:5,borderRadius:3,background:C.gl2,marginTop:3}}>
                    <div style={{height:"100%",borderRadius:3,width:`${res.score}%`,
                      background:res.score>=80?C.ok:res.score>=50?C.warn:C.err,transition:"width .4s"}}/>
                  </div>
                </div>
              )}
              {res.fb && <div style={{fontSize:12,color:C.tx,lineHeight:1.6,whiteSpace:"pre-line",fontFamily:F.m}}>{res.fb}</div>}
              {res.tcR && (
                <div style={{marginTop:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.ts,marginBottom:4,fontFamily:F.s}}>{t("testCases")} ({res.tcP}/{res.tcT})</div>
                  {res.tcR.map((tr,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 8px",borderRadius:5,marginBottom:2,
                      background:tr.pass?`${C.ok}0a`:`${C.err}0a`,fontFamily:F.m,fontSize:11}}>
                      <span style={{color:C.tx}}>"{tr.inp}"</span>
                      <span style={{fontWeight:700,color:tr.pass?C.ok:C.err}}>{tr.pass?"✓":"✗"}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Hints */}
          {ch.h?.length>0 && (
            <div>
              <button onClick={()=>setHIdx(h=>Math.min(h+1,ch.h.length-1))}
                style={{width:"100%",padding:"9px 0",borderRadius:9,border:`1px solid ${C.warn}25`,background:`${C.warn}08`,
                  color:C.warn,fontSize:12,fontWeight:700,fontFamily:F.s}}>
                💡 {t("hint")} ({Math.min(hIdx+2,ch.h.length)}/{ch.h.length})
              </button>
              {hIdx>=0 && ch.h.slice(0,hIdx+1).map((h,i)=>(
                <div key={i} style={{marginTop:5,padding:"8px 12px",borderRadius:8,background:`${C.warn}06`,border:`1px solid ${C.warn}12`,
                  fontSize:12,color:C.tx,lineHeight:1.5,fontFamily:F.s,animation:"fadeUp .2s ease-out"}}>{h}</div>
              ))}
            </div>
          )}

          {/* Solution */}
          {res&&!res.ok&&ch.ref?.T?.length>0 && (
            <div>
              {/* Faz 4: Theory backlink */}
              {ch.module&&<button onClick={()=>{/* navigate handled by parent */}}
                style={{width:"100%",padding:"8px 0",borderRadius:8,marginBottom:5,
                  background:`#f472b608`,border:`1px solid #f472b615`,color:"#f472b6",fontSize:11,fontWeight:700,fontFamily:F.s}}>
                📖 {lang==="en"?"Review Theory in Academy":"Akademi'de Teoriyi Tekrarla"} → {ch.module?.toUpperCase()}
              </button>}
              <button onClick={()=>setShowSol(!showSol)} style={{width:"100%",padding:"8px 0",borderRadius:8,
                background:C.gl2,border:`1px solid ${C.bd}`,color:C.ts,fontSize:12,fontWeight:700,fontFamily:F.s}}>
                📖 {t("solution")} {showSol?"▾":"▸"}
              </button>
              {showSol && (
                <Card color={C.bd} pad={12} style={{marginTop:5}}>
                  <div style={{fontSize:11,fontFamily:F.m,color:C.tx,lineHeight:1.8}}>
                    Q = {"{"}{ch.ref.S.map(s=>s[0]).join(", ")}{"}"}
                    <br/>q₀ = {ch.ref.S.find(s=>s[1])?.[0]}
                    <br/>F = {"{"}{ch.ref.S.filter(s=>s[2]).map(s=>s[0]).join(", ")}{"}"}
                    <br/><br/>{ch.ref.T.map((tr,i)=><div key={i} style={{color:C.ts}}>δ({tr[0]}, {tr[1]}) = {tr[2]}</div>)}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
