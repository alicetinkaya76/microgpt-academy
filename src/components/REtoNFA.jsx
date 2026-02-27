// ═══════════════════════════════════════════════════════════════
// REtoNFA.jsx v4.1 — Thompson Construction with Pedagogy
// Sipser Theorem 1.54 · Preset examples · Theory panel
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { C, F, Card, Btn, Pill, Tag, useI18n } from "../theme";
import { thompsonConstruct } from "../engines";

const PRESETS = [
  { re:"(a∪b)*ab", cat:"classic",
    tr:{n:"Klasik: (a∪b)*ab",d:"'ab' ile biten tüm stringler. Union, Kleene star ve concatenation'ın üçünü birden gösterir."},
    en:{n:"Classic: (a∪b)*ab",d:"All strings ending with 'ab'. Demonstrates union, Kleene star, and concatenation together."}},
  { re:"a*b∪ba*", cat:"union",
    tr:{n:"Union: a*b ∪ ba*",d:"a'lardan sonra b VEYA b'den sonra a'lar. Thompson'ın ε-branching tekniğini gösterir."},
    en:{n:"Union: a*b ∪ ba*",d:"a's followed by b OR b followed by a's. Shows Thompson's ε-branching technique."}},
  { re:"(ab)*", cat:"star",
    tr:{n:"Yıldız: (ab)*",d:"'ab' çiftinin sıfır veya daha fazla tekrarı. Kleene star yapısını gösterir (Teorem 1.54.3)."},
    en:{n:"Star: (ab)*",d:"Zero or more repetitions of 'ab'. Shows Kleene star construction (Theorem 1.54.3)."}},
  { re:"(0∪1)*000(0∪1)*", cat:"pattern",
    tr:{n:"Pattern: ···000···",d:"İçinde ardışık üç 0 bulunan binary stringler. Gerçek dünyada pattern matching."},
    en:{n:"Pattern: ···000···",d:"Binary strings containing three consecutive 0s. Real-world pattern matching."}},
  { re:"a(a∪b)*b", cat:"concat",
    tr:{n:"Concat: a···b",d:"'a' ile başlayıp 'b' ile biten stringler. İç içe concatenation + closure."},
    en:{n:"Concat: a···b",d:"Strings starting with 'a' and ending with 'b'. Nested concatenation + closure."}},
  { re:"(aa∪bb)(a∪b)*", cat:"prefix",
    tr:{n:"Prefix: aa veya bb ile başla",d:"Çift harf prefix + herhangi bir devam. İç union yapısını gösterir."},
    en:{n:"Prefix: starts aa or bb",d:"Double letter prefix + any continuation. Shows nested union construction."}},
];

export default function REtoNFA({ onBack }) {
  const { t, lang } = useI18n();
  const li = lang==="en"?"en":"tr";
  const [regex,setRegex] = useState("(a∪b)*ab");
  const [step,setStep] = useState(-1);
  const [built,setBuilt] = useState(null);
  const [showTheory,setShowTheory] = useState(false);

  const build = () => { try{const r=thompsonConstruct(regex); setBuilt(r); setStep(0);}catch(e){setBuilt(null);} };
  const cur = built&&step>=0 ? built.steps[Math.min(step,built.steps.length-1)] : null;
  const maxS = built ? built.steps.length-1 : 0;

  const layout = useMemo(()=>{
    if(!cur?.nfa)return{nodes:[],edges:[]};
    const nfa=cur.nfa, n=nfa.states.length;
    const nodes=nfa.states.map((s,i)=>({id:s,x:70+i*(520/Math.max(n-1,1)),y:95+(i%2)*35,isStart:s===nfa.start,isEnd:s===nfa.end}));
    const edges=nfa.trans.map(t=>({fr:nodes.find(n=>n.id===t.fr),to:nodes.find(n=>n.id===t.to),sym:t.sym}));
    return{nodes,edges};
  },[cur]);

  return(
    <div style={{maxWidth:860,animation:"fadeIn .25s ease-out"}}>
      {/* Pedagogical header */}
      <Card color={"#22d3ee"} pad={16} style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",flexWrap:"wrap",gap:10}}>
          <div style={{flex:1,minWidth:280}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <Tag color={"#22d3ee"}>Sipser 1.54</Tag>
              <Tag color={C.ts}>{lang==="tr"?"Teorem":"Theorem"}</Tag>
            </div>
            <h2 style={{fontSize:18,fontWeight:800,color:C.wh,fontFamily:F.s,margin:"0 0 6px"}}>{t("reToNfa")}</h2>
            <div style={{fontSize:12,color:C.tx,lineHeight:1.6,fontFamily:F.s}}>
              {lang==="tr"
                ? "Her düzenli ifade (regex) eşdeğer bir NFA'ya dönüştürülebilir. Thompson yapısı bunu 3 temel kuralla yapar: birleşim (∪), birleştirme (concat), ve Kleene yıldızı (*)."
                : "Every regular expression can be converted to an equivalent NFA. Thompson's construction does this with 3 base rules: union (∪), concatenation, and Kleene star (*)."}
            </div>
          </div>
          <button onClick={()=>setShowTheory(v=>!v)} style={{padding:"8px 14px",borderRadius:8,
            border:`1px solid ${"#22d3ee"}30`,background:`${"#22d3ee"}08`,color:"#22d3ee",
            fontSize:11,fontWeight:700,fontFamily:F.s}}>
            📐 {lang==="tr"?"Teori":"Theory"} {showTheory?"▾":"▸"}
          </button>
        </div>
        {showTheory && (
          <div style={{marginTop:12,padding:12,borderRadius:10,background:C.gl,border:`1px solid ${C.bd}`,
            fontSize:11,color:C.tx,lineHeight:1.8,fontFamily:F.m,animation:"fadeUp .15s ease-out"}}>
            <div style={{fontWeight:700,color:"#22d3ee",marginBottom:4}}>Thompson's Construction Rules:</div>
            <span style={{color:C.warn}}>1. Base:</span> a → q₀ —a→ q₁ (2 durum, 1 geçiş)<br/>
            <span style={{color:C.warn}}>2. Union:</span> R₁∪R₂ → ε-branch → parallel NFAs → ε-merge<br/>
            <span style={{color:C.warn}}>3. Concat:</span> R₁R₂ → NFA₁.end = NFA₂.start (seri bağlantı)<br/>
            <span style={{color:C.warn}}>4. Star:</span> R* → ε-loop + ε-bypass (0+ tekrar)<br/>
            <br/>
            <span style={{color:C.ts}}>Karmaşıklık: O(n) durum, O(n) geçiş (n = regex uzunluğu)</span>
          </div>
        )}
      </Card>

      {/* Preset examples grid */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:C.ts,fontWeight:700,fontFamily:F.s,marginBottom:6}}>
          {lang==="tr"?"Hazır Örnekler — tıklayarak yükle:":"Presets — click to load:"}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:6}}>
          {PRESETS.map((p,i)=>(
            <button key={i} onClick={()=>{setRegex(p.re);setBuilt(null);setStep(-1);}}
              style={{padding:"10px 12px",borderRadius:9,border:`1px solid ${regex===p.re?"#22d3ee":C.bd}`,
                background:regex===p.re?`${"#22d3ee"}08`:C.s1,textAlign:"left",transition:"all .15s"}}
              onMouseEnter={e=>{if(regex!==p.re)e.currentTarget.style.borderColor=`${"#22d3ee"}35`;}}
              onMouseLeave={e=>{if(regex!==p.re)e.currentTarget.style.borderColor=C.bd;}}>
              <div style={{fontSize:12,fontWeight:700,color:regex===p.re?"#22d3ee":C.wh,fontFamily:F.m,marginBottom:3}}>{p.re}</div>
              <div style={{fontSize:10,color:C.ts,lineHeight:1.4,fontFamily:F.s}}>{p[li].d}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input + build */}
      <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
        <input value={regex} onChange={e=>{setRegex(e.target.value);setBuilt(null);setStep(-1);}}
          placeholder="(a∪b)*ab" style={{flex:1,padding:"10px 14px",borderRadius:10,border:`1px solid ${"#22d3ee"}30`,
            background:C.s1,color:C.wh,fontFamily:F.m,fontSize:15,outline:"none"}}/>
        <Btn color="#22d3ee" onClick={build}>{t("build")}</Btn>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>
        {["∪","*","+","ε","∅","(",")"].map(s=>(<Pill key={s} color={C.ts} onClick={()=>setRegex(r=>r+s)}>{s}</Pill>))}
      </div>

      {/* Stepper */}
      {built && (<>
        <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
          <Btn color={C.ts} variant="outline" onClick={()=>setStep(s=>Math.max(0,s-1))} style={{padding:"6px 14px",fontSize:12}}>{t("prev")}</Btn>
          <div style={{flex:1,textAlign:"center"}}>
            <span style={{fontSize:12,color:C.ts,fontFamily:F.s}}>{t("step")} {step+1} / {built.steps.length}</span>
            <input type="range" min={0} max={maxS} value={step} onChange={e=>setStep(+e.target.value)}
              style={{width:"100%",accentColor:"#22d3ee"}}/>
          </div>
          <Btn color={C.ts} variant="outline" onClick={()=>setStep(s=>Math.min(maxS,s+1))} style={{padding:"6px 14px",fontSize:12}}>{t("next")}</Btn>
        </div>

        {cur && <Card color={"#22d3ee"} pad={10} style={{marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700,color:"#22d3ee",fontFamily:F.m}}>{cur.op}: </span>
          <span style={{fontSize:12,color:C.tx,fontFamily:F.m}}>{cur.desc}</span>
        </Card>}

        <div style={{borderRadius:12,border:`1px solid ${C.bd}`,background:C.s1,overflow:"hidden",marginBottom:10}}>
          <svg width="100%" height={200} style={{display:"block"}}>
            <defs><marker id="ath" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#22d3ee"/></marker></defs>
            {layout.edges.map((e,i)=>{
              if(!e.fr||!e.to)return null;
              const self=e.fr.id===e.to.id;
              if(self)return(<g key={i}><path d={`M ${e.fr.x-12} ${e.fr.y-16} C ${e.fr.x-30} ${e.fr.y-48}, ${e.fr.x+30} ${e.fr.y-48}, ${e.fr.x+12} ${e.fr.y-16}`}
                fill="none" stroke="#22d3ee" strokeWidth={1.5} markerEnd="url(#ath)"/>
                <text x={e.fr.x} y={e.fr.y-42} textAnchor="middle" fill="#22d3ee" fontSize={10} fontWeight={600} fontFamily={F.m}>{e.sym}</text></g>);
              const a=Math.atan2(e.to.y-e.fr.y,e.to.x-e.fr.x),r=17;
              return(<g key={i}><line x1={e.fr.x+Math.cos(a)*r} y1={e.fr.y+Math.sin(a)*r}
                x2={e.to.x-Math.cos(a)*(r+2)} y2={e.to.y-Math.sin(a)*(r+2)}
                stroke={e.sym==="ε"?C.tm:"#22d3ee"} strokeWidth={1.5} strokeDasharray={e.sym==="ε"?"4,3":"none"} markerEnd="url(#ath)"/>
                <text x={(e.fr.x+e.to.x)/2} y={(e.fr.y+e.to.y)/2-8} textAnchor="middle" fill={e.sym==="ε"?C.tm:"#22d3ee"} fontSize={10} fontWeight={600} fontFamily={F.m}>{e.sym}</text></g>);
            })}
            {layout.nodes.map((n,i)=>(<g key={i}>
              {n.isStart&&<line x1={n.x-34} y1={n.y} x2={n.x-19} y2={n.y} stroke="#22d3ee" strokeWidth={2} markerEnd="url(#ath)"/>}
              <circle cx={n.x} cy={n.y} r={17} fill={n.isStart?`${"#22d3ee"}14`:n.isEnd?`${C.ok}14`:C.gl}
                stroke={n.isStart?"#22d3ee":n.isEnd?C.ok:C.bd} strokeWidth={1.5}/>
              {n.isEnd&&<circle cx={n.x} cy={n.y} r={13} fill="none" stroke={C.ok} strokeWidth={1.5}/>}
              <text x={n.x} y={n.y+4} textAnchor="middle" fill={C.tx} fontSize={9} fontWeight={600} fontFamily={F.m}>{n.id}</text>
            </g>))}
          </svg>
        </div>

        <div style={{fontSize:11,color:C.tm,fontFamily:F.m,display:"flex",gap:14,marginBottom:10}}>
          <span>{cur?.nfa?.states.length||0}Q</span>
          <span>{cur?.nfa?.trans.length||0}δ</span>
        </div>

        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.ts,marginBottom:6,fontFamily:F.s}}>{t("stepsAll")}</div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {built.steps.map((s,i)=>(<button key={i} onClick={()=>setStep(i)} style={{padding:"6px 12px",borderRadius:6,
              border:i===step?`1.5px solid ${"#22d3ee"}`:`1px solid ${C.bd}`,background:i===step?`${"#22d3ee"}0c`:"transparent",
              textAlign:"left",display:"flex",gap:8,alignItems:"center",fontFamily:F.s}}>
              <span style={{fontSize:10,color:C.tm,minWidth:16}}>{i+1}</span>
              <span style={{fontSize:11,fontWeight:600,color:i===step?"#22d3ee":C.tx}}>{s.op}</span>
              <span style={{fontSize:10,color:C.tm,fontFamily:F.m}}>{s.desc}</span>
            </button>))}
          </div>
        </div>
      </>)}

      {!built && <div style={{textAlign:"center",padding:30}}>
        <div style={{fontSize:32,marginBottom:8,opacity:.3}}>🔄</div>
        <div style={{fontSize:13,color:C.tm,fontFamily:F.s}}>{t("enterRegex")}</div>
      </div>}
    </div>
  );
}
