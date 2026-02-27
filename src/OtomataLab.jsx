// ═══════════════════════════════════════════════════════════════
// OtomataLab.jsx v4.1 — Sticky Header · Inline Tools · Bilingual
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { C, F, CATS, DIF, CSS, Pill, Card, useI18n } from "./theme";
import { CHALLENGES } from "./challenges";
import BuilderChallenge from "./components/DFAChallenge";
import TheoryView from "./components/TheoryView";
import REtoNFA from "./components/REtoNFA";
import NFAtoDFA from "./components/NFAtoDFA";
import Sandbox from "./components/Sandbox";
import RealWorld from "./components/RealWorld";
import Academy from "./components/Academy";
import DFAMinimize from "./components/DFAMinimize";

const CHAPTERS = [
  {id:1, types:["dfa","nfa","re","re_mem","re_nfa","gnfa","pl"], c:C.ch1},
  {id:2, types:["cfg","pda","cfl_pl"], c:C.ch2},
  {id:3, types:["tm"], c:C.ch3},
];

const TABS = [
  {id:"academy",  ic:"🎓"},
  {id:"problems", ic:"📋"},
  {id:"sandbox",  ic:"🧪"},
  {id:"renfa",    ic:"🔄"},
  {id:"nfadfa",   ic:"⚡"},
  {id:"minimize", ic:"✂️"},
  {id:"realworld",ic:"🌍"},
];

export default function OtomataLab() {
  const { t, lang, toggle } = useI18n();
  const [tab,setTab] = useState("problems");
  const [aCh,setACh] = useState(null);
  const [filt,setFilt] = useState("all");
  const [chFilt,setChFilt] = useState(0);
  const [q,setQ] = useState("");

  const counts = useMemo(()=>{const m={};CHALLENGES.forEach(c=>{m[c.tp]=(m[c.tp]||0)+1;});return m;},[]);
  const filtered = CHALLENGES.filter(c=>{
    if(chFilt>0){const ch=CHAPTERS.find(x=>x.id===chFilt);if(ch&&!ch.types.includes(c.tp))return false;}
    if(filt!=="all"&&c.tp!==filt)return false;
    if(q)return(c.tit+c.desc+(c.src||"")).toLowerCase().includes(q.toLowerCase());
    return true;
  });

  const tabLabel = id => ({academy:t("academy"),problems:t("problems"),sandbox:t("sandbox"),renfa:"RE → NFA",nfadfa:"NFA → DFA",minimize:lang==="tr"?"Minimize":"Minimize",realworld:t("realWorld")}[id]);
  const tabColor = id => ({academy:"#f472b6",problems:C.ch1,sandbox:C.ch3,renfa:"#22d3ee",nfadfa:C.ch2,minimize:"#22d3ee",realworld:C.ok}[id]);

  const start = ch=>{setACh(ch);};
  const home = ()=>{setACh(null);};

  return(
    <div style={{background:C.bg,color:C.tx,fontFamily:F.s,minHeight:"100vh"}}>
      <style>{CSS}</style>

      {/* ── STICKY HEADER ── */}
      <div style={{position:"sticky",top:0,zIndex:40,background:`${C.bg}ee`,backdropFilter:"blur(12px)",
        borderBottom:`1px solid ${C.bd}`,padding:0}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"12px 24px 0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>{setTab("problems");setACh(null);}}>
              <div style={{width:38,height:38,borderRadius:11,
                background:`linear-gradient(135deg,${C.ch1},${C.ch2})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:16,fontWeight:800,color:"#fff",
                boxShadow:`0 3px 14px ${C.ch1}20`}}>Σ*</div>
              <div>
                <h1 style={{fontSize:18,fontWeight:800,margin:0,color:C.wh,lineHeight:1.1}}>{t("title")}</h1>
                <p style={{margin:0,fontSize:10,color:C.ts}}>Sipser · {CHALLENGES.length} {t("problems")}</p>
              </div>
            </div>
            <button onClick={toggle} style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.bd}`,
              background:C.gl2,color:C.ts,fontSize:11,fontWeight:600,fontFamily:F.s}}>
              {lang==="tr"?"🇬🇧 EN":"🇹🇷 TR"}
            </button>
          </div>

          {/* Tab bar */}
          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
            {TABS.map(tb=>{const ac=tab===tb.id&&!aCh; const col=tabColor(tb.id);
              return(<button key={tb.id} onClick={()=>{setTab(tb.id);setACh(null);}}
                style={{padding:"8px 18px",borderRadius:"9px 9px 0 0",fontSize:12,fontWeight:ac?700:500,
                  fontFamily:F.s,background:ac?`${col}0c`:"transparent",color:ac?col:C.ts,
                  borderBottom:ac?`2.5px solid ${col}`:"2.5px solid transparent",transition:"all .15s"}}>
                {tb.ic} {tabLabel(tb.id)}</button>);
            })}
          </div>
        </div>
      </div>

      {/* Ambient bg */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"-10%",right:"-6%",width:"40%",height:"40%",
          background:`radial-gradient(circle,${C.ch1}04 0%,transparent 70%)`,filter:"blur(80px)"}}/>
      </div>

      {/* ── CONTENT ── */}
      <div style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"20px 24px"}}>

        {/* ═══ CHALLENGE DETAIL ═══ */}
        {aCh && (()=>{
          const isBuilder = aCh.tp==="dfa"||aCh.tp==="nfa";
          return isBuilder
            ? <BuilderChallenge ch={aCh} onBack={home} isNFA={aCh.tp==="nfa"}/>
            : <TheoryView ch={aCh} onBack={home}/>;
        })()}

        {/* ═══ PROBLEMS TAB ═══ */}
        {!aCh && tab==="problems" && (<>
          <div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>
            <Pill color={C.ts} active={chFilt===0} onClick={()=>{setChFilt(0);setFilt("all");}}>{t("all")}</Pill>
            {CHAPTERS.map(ch=>(
              <Pill key={ch.id} color={ch.c} active={chFilt===ch.id} onClick={()=>{setChFilt(ch.id);setFilt("all");}}>
                {t(`ch${ch.id}`)}
              </Pill>
            ))}
          </div>
          <div style={{display:"flex",gap:3,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <Pill color={C.ts} active={filt==="all"} onClick={()=>setFilt("all")}>{t("all")}</Pill>
            {Object.entries(CATS).filter(([k])=>chFilt===0||CHAPTERS.find(ch=>ch.id===chFilt)?.types.includes(k)).map(([k,v])=>(
              <Pill key={k} color={v.c} active={filt===k} onClick={()=>setFilt(k)}>
                {v.l} <span style={{opacity:.6,marginLeft:3}}>{counts[k]||0}</span>
              </Pill>
            ))}
            <div style={{flex:1}}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`🔍 ${t("search")}`}
              style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${C.bd}`,background:C.s1,
                color:C.tx,fontSize:11,width:170,outline:"none",fontFamily:F.s}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))",gap:6}}>
            {filtered.map(ch=>{
              const cat=CATS[ch.tp]; const d=Math.min((ch.dif||1)-1,2); const dc=DIF[d];
              return(
                <button key={ch.id} onClick={()=>start(ch)} style={{width:"100%",padding:"12px 14px",borderRadius:11,
                  border:`1px solid ${C.bd}`,background:C.s1,textAlign:"left",
                  display:"flex",alignItems:"center",gap:10,transition:"all .15s",fontFamily:F.s}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${cat.c}35`;e.currentTarget.style.background=C.s2;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.bd;e.currentTarget.style.background=C.s1;}}>
                  <div style={{width:6,height:36,borderRadius:3,background:cat.c,opacity:.5,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.wh,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ch.tit}</div>
                    <div style={{display:"flex",gap:5,alignItems:"center",fontSize:9,marginTop:3}}>
                      <span style={{padding:"2px 6px",borderRadius:4,background:`${dc.c}14`,color:dc.c,fontWeight:700}}>{lang==="en"?dc.en:dc.tr}</span>
                      <span style={{color:C.ts}}>{cat.l}</span>
                      {ch.src&&<span style={{color:C.tm}}>({ch.src})</span>}
                    </div>
                  </div>
                  <span style={{color:C.tm,fontSize:14}}>›</span>
                </button>
              );
            })}
          </div>
          {!filtered.length&&<div style={{textAlign:"center",padding:30,color:C.tm}}>{lang==="tr"?"Sonuç bulunamadı.":"No results found."}</div>}
        </>)}

        {/* ═══ TOOL TABS — rendered inline ═══ */}
        {!aCh && tab==="academy"   && <Academy onSandbox={(mode)=>{setTab("sandbox");}}/>}
        {!aCh && tab==="sandbox"  && <Sandbox/>}
        {!aCh && tab==="renfa"    && <REtoNFA onBack={()=>setTab("problems")}/>}
        {!aCh && tab==="nfadfa"   && <NFAtoDFA onBack={()=>setTab("problems")}/>}
        {!aCh && tab==="minimize" && <DFAMinimize/>}
        {!aCh && tab==="realworld"&& <RealWorld/>}

        {/* Footer */}
        <div style={{marginTop:28,padding:"14px 0",textAlign:"center",fontSize:10,color:C.tm,borderTop:`1px solid ${C.bd}`}}>
          Otomata Lab v4 — Sipser "Introduction to the Theory of Computation"
          <br/>{t("footer")}
        </div>
      </div>
    </div>
  );
}
