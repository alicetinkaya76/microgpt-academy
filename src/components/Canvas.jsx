// ═══════════════════════════════════════════════════════════════
// Canvas.jsx v8 — Animated Automata Canvas
//
// Animated token travels along edges during simulation
// Glow filters · Bezier edges · State pulse · Dot grid
// ═══════════════════════════════════════════════════════════════
import { useState, useCallback, useRef, useMemo } from "react";
import { C, F, nid, Pill, useI18n } from "../theme";

const R=26, SNAP=10, snap=v=>Math.round(v/SNAP)*SNAP;

// ── Bezier math helpers ──────────────────────────────────────
function edgeGeom(fr,to,off=0) {
  const dx=to.x-fr.x, dy=to.y-fr.y, d=Math.sqrt(dx*dx+dy*dy)||1;
  const nx=dx/d, ny=dy/d, px=-ny, py=nx;
  const o=off*15;
  const sx=fr.x+nx*R+px*o, sy=fr.y+ny*R+py*o;
  const ex=to.x-nx*(R+4)+px*o, ey=to.y-ny*(R+4)+py*o;
  const cx=(sx+ex)/2+px*(22+Math.abs(o)*.6), cy=(sy+ey)/2+py*(22+Math.abs(o)*.6);
  return {sx,sy,ex,ey,cx,cy};
}
function bezierAt(t,sx,sy,cx,cy,ex,ey) {
  const u=1-t;
  return { x:u*u*sx+2*u*t*cx+t*t*ex, y:u*u*sy+2*u*t*cy+t*t*ey };
}
function selfLoopAt(t,x,y) {
  // self-loop: cubic bezier above state
  const x0=x-14,y0=y-R+2,x1=x-40,y1=y-R-46,x2=x+40,y2=y-R-46,x3=x+14,y3=y-R+2;
  const u=1-t;
  return{x:u*u*u*x0+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3, y:u*u*u*y0+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3};
}

// ── Symbol Picker ────────────────────────────────────────────
function SymPicker({pos,alphabet,mode,onPick,onCancel,color}) {
  const [val,setVal]=useState("");
  const isNFA=mode==="nfa",isPDA=mode==="pda",isTM=mode==="tm";
  const quick=isNFA?[...alphabet,"ε"]:isPDA?[`${alphabet[0]}, ε → $`,`ε, ε → ε`,`${alphabet[1]||alphabet[0]}, $ → ε`]:isTM?["0 1 R","1 0 L","␣ ␣ R","0 0 R","1 1 R"]:alphabet;
  const submit=v=>{const s=(v||val).trim();if(s)onPick(s);};
  return(
    <div style={{position:"absolute",left:Math.max(4,pos.x-120),top:Math.max(4,pos.y-70),zIndex:50,
      background:C.s2,border:`1px solid ${color}30`,borderRadius:14,padding:14,width:250,
      boxShadow:`0 12px 40px rgba(0,0,0,.7),0 0 20px ${color}08`,animation:"fadeUp .12s ease-out"}}>
      <div style={{fontSize:9,color,fontWeight:700,fontFamily:F.s,marginBottom:6,letterSpacing:".06em"}}>
        {isPDA?"READ, POP → PUSH":isTM?"READ WRITE DIR":isNFA?"SYMBOL (ε OK)":"SYMBOL"}</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
        {quick.map(s=><button key={s} onClick={()=>submit(s)} style={{padding:"6px 11px",borderRadius:7,
          border:`1px solid ${C.bd}`,background:C.gl2,color:C.wh,fontSize:12,fontFamily:F.m,fontWeight:600,transition:"all .12s"}}
          onMouseEnter={e=>{e.target.style.background=`${color}18`;e.target.style.borderColor=color;}}
          onMouseLeave={e=>{e.target.style.background=C.gl2;e.target.style.borderColor=C.bd;}}>{s}</button>)}
      </div>
      <div style={{display:"flex",gap:4}}>
        <input value={val} onChange={e=>setVal(e.target.value)} autoFocus
          onKeyDown={e=>{if(e.key==="Enter")submit();if(e.key==="Escape")onCancel();}}
          placeholder={isPDA?"a, X → Y":isTM?"0 1 R":"symbol"}
          style={{flex:1,padding:"7px 11px",borderRadius:8,border:`1px solid ${color}25`,background:C.bg,color:C.wh,fontFamily:F.m,fontSize:13,outline:"none"}}/>
        <button onClick={()=>submit()} style={{padding:"7px 14px",borderRadius:8,background:color,color:"#fff",fontSize:12,fontWeight:800,fontFamily:F.s}}>↵</button>
      </div>
      <button onClick={onCancel} style={{position:"absolute",top:8,right:10,color:C.tm,fontSize:15,fontWeight:700}}>×</button>
    </div>
  );
}

// ── SVG Node ─────────────────────────────────────────────────
function SNode({s,act,col,sel,onMD,onDC}) {
  return(
    <g onMouseDown={e=>onMD(e,s.id)} onDoubleClick={e=>onDC(e,s.id)} style={{cursor:"grab",userSelect:"none"}}>
      {/* Active: rotating dashed ring */}
      {act&&<circle cx={s.x} cy={s.y} r={R+10} fill="none" stroke={col} strokeWidth={1.2} opacity={.2} strokeDasharray="3,4">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${s.x} ${s.y}`} to={`360 ${s.x} ${s.y}`} dur="3s" repeatCount="indefinite"/>
      </circle>}
      {/* Active: pulse halo */}
      {act&&<circle cx={s.x} cy={s.y} r={R+4} fill="none" stroke={col} strokeWidth={2} opacity={.15}>
        <animate attributeName="r" values={`${R+4};${R+14};${R+4}`} dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".2;0;.2" dur="1.5s" repeatCount="indefinite"/>
      </circle>}
      {/* Start arrow */}
      {s.start&&<path d={`M${s.x-R-30},${s.y}L${s.x-R-3},${s.y}`} stroke={act?col:C.ts} strokeWidth={2} markerEnd="url(#ah)" opacity={act?1:.5}/>}
      {/* Main circle */}
      <circle cx={s.x} cy={s.y} r={R} filter={act?"url(#glowN)":""}
        fill={act?`${col}18`:sel?`${C.wh}06`:C.s1}
        stroke={act?col:sel?C.ts:`rgba(255,255,255,.07)`} strokeWidth={act?2.5:1.5}/>
      {/* Accept inner ring */}
      {s.accept&&<circle cx={s.x} cy={s.y} r={R-5} fill="none" stroke={act?col:C.ok} strokeWidth={1.5} opacity={act?.9:.4}/>}
      {/* Reject X */}
      {s.reject&&<g opacity={.6}><line x1={s.x-7} y1={s.y-7} x2={s.x+7} y2={s.y+7} stroke={C.err} strokeWidth={2}/>
        <line x1={s.x+7} y1={s.y-7} x2={s.x-7} y2={s.y+7} stroke={C.err} strokeWidth={2}/></g>}
      {/* Label */}
      <text x={s.x} y={s.y+4.5} textAnchor="middle" fill={act?C.wh:C.tx} fontSize={12} fontWeight={700} fontFamily={F.m}>{s.label}</text>
    </g>
  );
}

// ── SVG Edge (Bezier) ────────────────────────────────────────
function SEdge({fr,to,lbl,act,col,self,offset=0}) {
  if(!fr||!to)return null;
  const oc=act?col:C.ts, ow=act?2.8:1.2, op=act?1:.4;
  if(self) return(<g>
    <path d={`M${fr.x-14},${fr.y-R+2} C${fr.x-40},${fr.y-R-46} ${fr.x+40},${fr.y-R-46} ${fr.x+14},${fr.y-R+2}`}
      fill="none" stroke={oc} strokeWidth={ow} markerEnd="url(#ah)" filter={act?"url(#glowE)":""} opacity={op}/>
    <text x={fr.x} y={fr.y-R-38} textAnchor="middle" fill={act?col:C.ts} fontSize={10} fontWeight={700} fontFamily={F.m}>{lbl}</text>
  </g>);
  const{sx,sy,ex,ey,cx:cx_,cy:cy_}=edgeGeom(fr,to,offset);
  const mx=(sx+ex)/2+(-((to.y-fr.y)/Math.sqrt((to.x-fr.x)**2+(to.y-fr.y)**2||1)))*(14+Math.abs(offset)*7);
  const my=(sy+ey)/2+((to.x-fr.x)/Math.sqrt((to.x-fr.x)**2+(to.y-fr.y)**2||1))*(14+Math.abs(offset)*7);
  const bw=Math.max(lbl.length*6.5+8,18);
  return(<g>
    <path d={`M${sx},${sy} Q${cx_},${cy_} ${ex},${ey}`}
      fill="none" stroke={oc} strokeWidth={ow} markerEnd="url(#ah)" filter={act?"url(#glowE)":""} opacity={op}/>
    {act&&<path d={`M${sx},${sy} Q${cx_},${cy_} ${ex},${ey}`}
      fill="none" stroke={col} strokeWidth={1} opacity={.3} strokeDasharray="6,4">
      <animate attributeName="stroke-dashoffset" values="0;-20" dur=".6s" repeatCount="indefinite"/>
    </path>}
    <rect x={mx-bw/2} y={my-9} width={bw} height={18} rx={5} fill={C.bg} opacity={.88}/>
    <text x={mx} y={my+3.5} textAnchor="middle" fill={act?col:C.ts} fontSize={10} fontWeight={700} fontFamily={F.m}>{lbl}</text>
  </g>);
}

// ── Animated Token ───────────────────────────────────────────
function Token({states,anim,color}) {
  if(!anim||anim.progress==null)return null;
  const fr=states.find(s=>s.id===anim.from);
  const to=states.find(s=>s.id===anim.to);
  if(!fr||!to)return null;
  const t=anim.progress;
  let pos;
  if(anim.from===anim.to){
    pos=selfLoopAt(t,fr.x,fr.y);
  } else {
    const{sx,sy,ex,ey,cx,cy}=edgeGeom(fr,to,anim.offset||0);
    pos=bezierAt(t,sx,sy,cx,cy,ex,ey);
  }
  return(<g>
    <circle cx={pos.x} cy={pos.y} r={6} fill={color} opacity={.85} filter="url(#glowT)"/>
    <circle cx={pos.x} cy={pos.y} r={3.5} fill="#fff" opacity={.9}/>
    {/* trail */}
    <circle cx={pos.x} cy={pos.y} r={12} fill={color} opacity={.08}>
      <animate attributeName="r" values="8;18;8" dur=".8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values=".12;0;.12" dur=".8s" repeatCount="indefinite"/>
    </circle>
  </g>);
}

// ── State Editor ─────────────────────────────────────────────
function StateEditor({state,setStates,onClose,color,mode}) {
  const{t}=useI18n();
  const upd=(k,v)=>setStates(ss=>ss.map(s=>{
    if(s.id!==state.id){if(k==="start"&&v)return{...s,start:false};return s;}
    return{...s,[k]:v};
  }));
  return(
    <div style={{padding:14,borderRadius:14,background:C.s2,border:`1px solid ${color}25`,
      animation:"fadeUp .12s ease-out",boxShadow:`0 8px 30px rgba(0,0,0,.4)`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:12,fontWeight:800,color,fontFamily:F.s}}>{t("editState")}</span>
        <button onClick={onClose} style={{color:C.tm,fontSize:16,fontWeight:700}}>×</button>
      </div>
      <input value={state.label} onChange={e=>upd("label",e.target.value)} autoFocus
        style={{width:"100%",padding:"9px 13px",borderRadius:9,border:`1.5px solid ${color}25`,
          background:C.bg,color:C.wh,fontFamily:F.m,fontSize:14,marginBottom:10,outline:"none",boxSizing:"border-box"}}/>
      <div style={{display:"flex",gap:6}}>
        {[["start",t("startSt"),"→",color],["accept",t("acceptSt"),"◎",C.ok],
          ...(mode==="tm"?[["reject",t("rejectSt"),"✗",C.err]]:[])
        ].map(([k,l,ic,c])=>(
          <button key={k} onClick={()=>upd(k,!state[k])}
            style={{flex:1,padding:"9px 0",borderRadius:9,border:`1.5px solid ${state[k]?c:C.bd}`,
              background:state[k]?`${c}12`:"transparent",color:state[k]?c:C.ts,
              fontSize:11,fontWeight:700,fontFamily:F.s,transition:"all .15s"}}>
            {ic} {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══ Canvas ══════════════════════════════════════════════════
export default function Canvas({states,setStates,trans,setTrans,color=C.info,mode="dfa",
  activeId=null,activeSet=null,activeTrans=null,anim=null,height=360,alphabet=["a","b"]}) {
  const{t}=useI18n();
  const[tool,setTool]=useState("state");
  const[trFrom,setTrFrom]=useState(null);
  const[sel,setSel]=useState(null);
  const[drg,setDrg]=useState(null);
  const[dOff,setDOff]=useState({x:0,y:0});
  const[editId,setEditId]=useState(null);
  const[symP,setSymP]=useState(null);
  const[hist,setHist]=useState([]);
  const svgRef=useRef(null);

  const save=useCallback(()=>{
    setHist(h=>[...h.slice(-20),{s:JSON.parse(JSON.stringify(states)),t:JSON.parse(JSON.stringify(trans))}]);
  },[states,trans]);
  const undo=()=>{if(!hist.length)return;const p=hist[hist.length-1];setStates(p.s);setTrans(p.t);setHist(h=>h.slice(0,-1));};

  const pt=useCallback(e=>{
    if(!svgRef.current)return{x:0,y:0};
    const r=svgRef.current.getBoundingClientRect();
    return{x:e.clientX-r.left,y:e.clientY-r.top};
  },[]);

  const onCanvas=useCallback(e=>{
    if(e.target!==svgRef.current&&!e.target.closest('.cbg'))return;
    if(symP){setSymP(null);return;}
    const p=pt(e);
    if(tool==="state"){save();const n=states.length;
      setStates(v=>[...v,{id:nid(),x:snap(p.x),y:snap(p.y),label:`q${n}`,start:n===0,accept:false,reject:false}]);}
    if(tool==="select"){setSel(null);setEditId(null);}
  },[tool,states,pt,setStates,symP,save]);

  const onStateMD=useCallback((e,sid)=>{
    e.stopPropagation();if(symP)return;
    if(tool==="delete"){save();setStates(v=>v.filter(s=>s.id!==sid));setTrans(v=>v.filter(t=>t.fr!==sid&&t.to!==sid));return;}
    if(tool==="trans"){
      if(!trFrom)setTrFrom(sid);
      else{const fr=states.find(s=>s.id===trFrom),to=states.find(s=>s.id===sid);
        if(fr&&to)setSymP({fromId:trFrom,toId:sid,pos:{x:(fr.x+to.x)/2,y:Math.min(fr.y,to.y)-20}});
        setTrFrom(null);}
      return;}
    if(tool==="select"){setSel(sid);const st=states.find(s=>s.id===sid);const p=pt(e);setDrg(sid);setDOff({x:p.x-st.x,y:p.y-st.y});}
  },[tool,trFrom,states,pt,setStates,setTrans,symP,save]);

  const onSymPick=useCallback(s=>{
    save();const{fromId,toId}=symP;
    if(mode==="tm"){const p=s.split(/[\s,/]+/);
      setTrans(v=>[...v,{id:nid(),fr:fromId,to:toId,syms:[`${p[0]}/${p[1]||p[0]},${p[2]||"R"}`],tmRead:p[0],tmWrite:p[1]||p[0],tmDir:p[2]||"R"}]);
    } else {
      s.replace(/\be\b/g,"ε").split(",").map(x=>x.trim()).filter(Boolean).forEach(sym=>
        setTrans(v=>[...v,{id:nid(),fr:fromId,to:toId,syms:[sym]}]));
    }
    setSymP(null);
  },[symP,mode,setTrans,save]);

  const onMM=useCallback(e=>{if(drg){const p=pt(e);setStates(v=>v.map(s=>s.id===drg?{...s,x:snap(p.x-dOff.x),y:snap(p.y-dOff.y)}:s));}},[drg,dOff,pt,setStates]);
  const onMU=useCallback(()=>setDrg(null),[]);

  // Group transitions + detect bidirectional
  const grouped=useMemo(()=>{
    const m=new Map();
    trans.forEach(t=>{const k=`${t.fr}→${t.to}`;if(!m.has(k))m.set(k,{fr:t.fr,to:t.to,ss:[]});m.get(k).ss.push(...t.syms);});
    const arr=[...m.values()];
    arr.forEach(g=>{
      const rev=arr.find(g2=>g2.fr===g.to&&g2.to===g.fr&&g2!==g);
      g.off=rev?(g.fr<g.to?1:g.fr>g.to?-1:0):0;
    });
    return arr;
  },[trans]);

  const editState=editId?states.find(s=>s.id===editId):null;
  const tools=[{id:"state",ic:"○",l:t("addState")},{id:"trans",ic:"→",l:t("addTrans")},{id:"select",ic:"◇",l:t("move")},{id:"delete",ic:"×",l:t("del")}];

  return(
    <div style={{position:"relative"}}>
      {/* Toolbar */}
      <div style={{display:"flex",gap:3,marginBottom:8,alignItems:"center",flexWrap:"wrap"}}>
        {tools.map(tl=><Pill key={tl.id} color={color} active={tool===tl.id}
          onClick={()=>{setTool(tl.id);setTrFrom(null);setSymP(null);}}>
          <span style={{fontFamily:F.m,fontWeight:800,marginRight:4}}>{tl.ic}</span>{tl.l}
        </Pill>)}
        <div style={{flex:1}}/>
        <Pill color={C.ts} onClick={undo} style={{opacity:hist.length?1:.3}}>{t("undo")}</Pill>
        <Pill color={C.err} onClick={()=>{save();setStates([]);setTrans([]);}} style={{opacity:states.length?1:.3}}>{t("clear")}</Pill>
      </div>

      {/* SVG */}
      <div style={{borderRadius:16,border:`1px solid rgba(255,255,255,.05)`,background:C.s1,overflow:"hidden",position:"relative",
        boxShadow:"inset 0 1px 0 rgba(255,255,255,.03)"}}>
        {!states.length&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,zIndex:2,pointerEvents:"none"}}>
            <div style={{width:56,height:56,borderRadius:14,background:`${color}06`,border:`1.5px dashed ${color}20`,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke={`${color}40`} strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="4" stroke={`${color}25`} strokeWidth="1" strokeDasharray="2,2"/></svg>
            </div>
            <div style={{fontSize:12,color:C.tm,fontFamily:F.s}}>{t("clickAdd")}</div>
            <div style={{fontSize:10,color:C.tm,fontFamily:F.s,opacity:.5}}>{t("firstAuto")}</div>
          </div>
        )}
        <svg ref={svgRef} width="100%" height={height}
          style={{display:"block",cursor:tool==="state"?"crosshair":tool==="delete"?"no-drop":"default"}}
          onClick={onCanvas} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
          <defs>
            <marker id="ah" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0 0,10 4,0 8" fill={C.ts}/></marker>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r=".6" fill="rgba(255,255,255,.04)"/></pattern>
            <filter id="glowN" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="glowE" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="glowT" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <rect className="cbg" width="100%" height="100%" fill="url(#dots)"/>
          {grouped.map((g,i)=>{
            const f=states.find(s=>s.id===g.fr),tt=states.find(s=>s.id===g.to);
            const isAct=activeTrans?activeTrans.from===g.fr&&activeTrans.to===g.to:false;
            return<SEdge key={i} fr={f} to={tt} lbl={g.ss.join(",")} self={g.fr===g.to}
              act={isAct} col={color} offset={g.off}/>;
          })}
          {states.map(s=><SNode key={s.id} s={s}
            act={activeId===s.id||activeSet?.has(s.id)} col={color} sel={sel===s.id}
            onMD={onStateMD} onDC={(e,id)=>{e.stopPropagation();setEditId(id);}}/>)}
          {/* Animated Token */}
          <Token states={states} anim={anim} color={color}/>
          {trFrom&&(()=>{const st=states.find(s=>s.id===trFrom);if(!st)return null;
            return<circle cx={st.x} cy={st.y} r={R+9} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="5,4" opacity={.4}>
              <animate attributeName="stroke-dashoffset" values="0;18" dur=".5s" repeatCount="indefinite"/></circle>;})()}
        </svg>
        {symP&&<SymPicker pos={symP.pos} alphabet={alphabet} mode={mode} onPick={onSymPick} onCancel={()=>setSymP(null)} color={color}/>}
      </div>

      {editState&&<div style={{marginTop:8}}><StateEditor state={editState} setStates={setStates} onClose={()=>setEditId(null)} color={color} mode={mode}/></div>}

      {/* Status */}
      <div style={{marginTop:8,padding:"7px 14px",borderRadius:10,background:C.gl,border:`1px solid rgba(255,255,255,.04)`,
        fontSize:11,color:C.tm,display:"flex",gap:12,alignItems:"center",fontFamily:F.s}}>
        <span style={{fontFamily:F.m,fontWeight:700,color:C.ts}}>{states.length}Q · {trans.length}δ</span>
        {states.length>0&&!states.some(s=>s.start)&&<span style={{color:C.err,fontWeight:700}}>{t("noStart")}</span>}
        {states.length>0&&!states.some(s=>s.accept)&&<span style={{color:C.warn,fontWeight:700}}>{t("noAccept")}</span>}
        {trFrom&&<span style={{color,fontWeight:700}}>{t("selTarget")}</span>}
      </div>
    </div>
  );
}
