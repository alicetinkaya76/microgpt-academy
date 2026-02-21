import { useState } from "react";
import { useLang } from "../../../core/i18n";

const P = {
  bg:"#06070b",surface:"#0c0e14",card:"#10131a",border:"#1c2030",
  indigo:"#818cf8",teal:"#2dd4bf",pink:"#f472b6",amber:"#fbbf24",
  violet:"#a78bfa",blue:"#60a5fa",emerald:"#34d399",rose:"#fb7185",
  text:"#e2e8f0",muted:"#64748b",dim:"#374151",white:"#ffffff",
};
const L=(tr,en,lang)=>lang==="tr"?tr:en;

export const PR_CHAPTERS_TR=[
  {icon:"📖",label:"Hikâye",color:P.indigo},{icon:"🎲",label:"Olasılık",color:P.teal},
  {icon:"📊",label:"Dağılım",color:P.violet},{icon:"🔀",label:"Softmax",color:P.blue},
  {icon:"📏",label:"Entropi",color:P.pink},{icon:"🎯",label:"Cross-Entropy",color:P.amber},
  {icon:"🧪",label:"Laboratuvar",color:P.emerald},{icon:"🏆",label:"Quiz",color:P.rose},
];
export const PR_CHAPTERS_EN=[
  {icon:"📖",label:"Story",color:P.indigo},{icon:"🎲",label:"Probability",color:P.teal},
  {icon:"📊",label:"Distribution",color:P.violet},{icon:"🔀",label:"Softmax",color:P.blue},
  {icon:"📏",label:"Entropy",color:P.pink},{icon:"🎯",label:"Cross-Entropy",color:P.amber},
  {icon:"🧪",label:"Lab",color:P.emerald},{icon:"🏆",label:"Quiz",color:P.rose},
];

function S({emoji,text,color,delay=0}){
  return <div style={{display:"flex",gap:12,padding:"11px 13px",background:`linear-gradient(135deg,${color}06,transparent)`,borderLeft:`2px solid ${color}30`,borderRadius:"0 10px 10px 0",marginBottom:7,animation:`fadeSlideIn 0.5s ${delay}s both cubic-bezier(0.16,1,0.3,1)`}}>
    <span style={{fontSize: 22,lineHeight:1,flexShrink:0}}>{emoji}</span>
    <p style={{margin:0,color:P.text,fontSize: 16,lineHeight:1.75}}>{text}</p>
  </div>;
}

/* ═══ Dice ═══ */
function DiceExplorer({lang}){
  const[rolls,setRolls]=useState([]);
  const[rolling,setRolling]=useState(false);
  const roll=()=>{setRolling(true);const r=Math.floor(Math.random()*6)+1;setTimeout(()=>{setRolls(p=>[...p.slice(-49),r]);setRolling(false);},200);};
  const rollMany=()=>{setRolls(p=>[...p,...Array.from({length:50},()=>Math.floor(Math.random()*6)+1)].slice(-200));};
  const counts=[0,0,0,0,0,0];rolls.forEach(r=>counts[r-1]++);
  const total=rolls.length||1;const maxC=Math.max(...counts,1);
  const faces=["⚀","⚁","⚂","⚃","⚄","⚅"];
  return <div>
    <div style={{fontSize: 16,color:P.text,marginBottom:10,lineHeight:1.7}}>
      <strong style={{color:P.teal}}>{L("Olasılık","Probability",lang)}</strong> = {L("bir olayın gerçekleşme şansı. Zar at ve dağılımı gör!","the chance of an event. Roll the dice and see!",lang)}
    </div>
    <div style={{textAlign:"center",marginBottom:10}}>
      <div style={{fontSize: 60,lineHeight:1,marginBottom:8,transition:"transform 0.2s",transform:rolling?"rotate(180deg)":"rotate(0)"}}>
        {rolls.length>0?faces[rolls[rolls.length-1]-1]:"🎲"}
      </div>
      <div style={{display:"flex",gap:6,justifyContent:"center"}}>
        <button onClick={roll} style={{padding:"8px 16px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${P.teal},${P.emerald})`,color:"#fff",fontSize: 15,fontWeight:700,cursor:"pointer"}}>{L("🎲 Zar At","🎲 Roll",lang)}</button>
        <button onClick={rollMany} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${P.border}`,background:"transparent",color:P.text,fontSize: 15,fontWeight:600,cursor:"pointer"}}>{L("×50","×50",lang)}</button>
        <button onClick={()=>{setRolls(p=>[...p,...Array.from({length:200},()=>Math.floor(Math.random()*6)+1)].slice(-500));}} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${P.border}`,background:"transparent",color:P.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>{L("×200","×200",lang)}</button>
        <button onClick={()=>setRolls([])} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${P.border}`,background:"transparent",color:P.muted,fontSize: 14,cursor:"pointer"}}>↺</button>
      </div>
    </div>
    {/* Reference line */}
    {rolls.length>10 && <div style={{fontSize:12,color:P.amber,textAlign:"center",marginBottom:2}}>
      {L("Beklenen: her yüz ≈ ","Expected: each face ≈ ",lang)}<strong>16.7%</strong>
    </div>}
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80,padding:"0 8px",position:"relative"}}>
      {rolls.length>10 && <div style={{position:"absolute",left:0,right:0,bottom:`${(16.7/Math.max(...counts.map(c=>c/total*100),16.7))*50}px`,height:1,background:P.amber+"60",borderRadius:1,zIndex:1}}/>}
      {counts.map((c,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <span style={{color:P.teal,fontSize: 11,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{rolls.length>0?`${((c/total)*100).toFixed(0)}%`:"—"}</span>
        <div style={{width:"100%",borderRadius:"4px 4px 0 0",height:`${(c/maxC)*50}px`,minHeight:2,background:`linear-gradient(180deg,${P.teal},${P.teal}60)`,transition:"height 0.3s"}}/>
        <span style={{fontSize: 19}}>{faces[i]}</span>
      </div>)}
    </div>
    <div style={{textAlign:"center",marginTop:6,fontSize: 14,color:P.muted}}>
      {L("Toplam","Total",lang)}: {rolls.length} {L("atış","rolls",lang)}
      {rolls.length>20&&<span style={{color:P.amber}}> — {L("Her yüz ≈%16.7'ye yaklaşıyor!","Each face → ≈16.7%!",lang)}</span>}
    </div>
    <div style={{marginTop:8,padding:"8px 10px",borderRadius:8,background:P.teal+"08",border:`1px solid ${P.teal}15`,fontSize: 14,color:P.muted,lineHeight:1.6}}>
      💡 {L("Adil zar: P(her yüz)=1/6≈0.167. GPT de aynısını yapar — 27 tokena olasılık atar!","Fair die: P(each face)=1/6≈0.167. GPT does the same — assigns probability to 27 tokens!",lang)}
    </div>
  </div>;
}

/* ═══ Distribution ═══ */
function DistributionViz({lang}){
  const toks=["a","b","c","d","e"];
  const[probs,setProbs]=useState([0.05,0.1,0.15,0.3,0.4]);
  const cols=[P.indigo,P.teal,P.violet,P.blue,P.pink];
  const adj=(idx,val)=>{const n=[...probs];n[idx]=val;const s=n.reduce((a,b)=>a+b,0);if(s>0)setProbs(n.map(p=>p/s));};
  return <div>
    <div style={{fontSize: 16,color:P.text,marginBottom:10,lineHeight:1.7}}>
      <strong style={{color:P.violet}}>{L("Olasılık dağılımı","Probability distribution",lang)}</strong>: {L("toplamı=1. Kaydırıcılarla şekillendir!","sum=1. Shape it with sliders!",lang)}
    </div>
    {toks.map((tok,i)=><div key={tok} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
      <span style={{color:cols[i],fontSize: 17,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",minWidth:16}}>{tok}</span>
      <div style={{width:160,height:18,borderRadius:6,background:P.card,overflow:"hidden",border:`1px solid ${P.border}`}}>
        <div style={{height:"100%",width:`${probs[i]*100}%`,background:`linear-gradient(90deg,${cols[i]}60,${cols[i]})`,borderRadius:4,transition:"width 0.3s"}}/>
      </div>
      <input type="range" min="0.01" max="1" step="0.01" value={probs[i]} onChange={e=>adj(i,+e.target.value)} style={{flex:1}}/>
      <span style={{color:cols[i],fontSize: 14,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",minWidth:38,textAlign:"right"}}>{(probs[i]*100).toFixed(1)}%</span>
    </div>)}
    <div style={{display:"flex",justifyContent:"space-between",marginTop:8,padding:"6px 10px",borderRadius:8,background:P.card,border:`1px solid ${P.border}`}}>
      <span style={{color:P.muted,fontSize: 14}}>Σ P(x)</span>
      <span style={{color:Math.abs(probs.reduce((a,b)=>a+b,0)-1)<0.01?P.emerald:P.amber,fontSize: 15,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>
        {probs.reduce((a,b)=>a+b,0).toFixed(3)} {Math.abs(probs.reduce((a,b)=>a+b,0)-1)<0.01?"✓":""}
      </span>
    </div>
    <div style={{marginTop:8,padding:"8px 10px",borderRadius:8,background:P.violet+"08",border:`1px solid ${P.violet}15`,fontSize: 14,color:P.muted,lineHeight:1.6}}>
      💡 {L("GPT çıktısı tam olarak budur — 27 token üzerinde olasılık dağılımı.","GPT output is exactly this — probability distribution over 27 tokens.",lang)}
    </div>
  </div>;
}

/* ═══ Softmax ═══ */
function SoftmaxExplorer({lang}){
  const[logits,setLogits]=useState([2.0,1.0,0.5,-0.5,-1.0]);
  const[temp,setTemp]=useState(1.0);
  const[samples,setSamples]=useState([]);
  const toks=["a","b","c","d","e"];
  const cols=[P.indigo,P.teal,P.violet,P.blue,P.pink];
  const sc=logits.map(l=>l/temp);const mx=Math.max(...sc);
  const ex=sc.map(l=>Math.exp(l-mx));const sm=ex.reduce((a,b)=>a+b,0);
  const pr=ex.map(e=>e/sm);
  return <div>
    <div style={{fontSize: 16,color:P.text,marginBottom:10,lineHeight:1.7}}>
      <strong style={{color:P.blue}}>Softmax</strong>: {L("ham skorları olasılığa çevirir. Temperature ile keskinliği ayarla!","converts raw scores to probabilities. Adjust sharpness with temperature!",lang)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,alignItems:"center"}}>
      <div style={{background:P.card,borderRadius:10,border:`1px solid ${P.border}`,padding:8}}>
        <div style={{color:P.dim,fontSize: 10,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>LOGITS</div>
        {toks.map((tok,i)=><div key={tok} style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
          <span style={{color:cols[i],fontSize: 13,fontWeight:700,minWidth:10}}>{tok}</span>
          <input type="range" min="-3" max="5" step="0.1" value={logits[i]} onChange={e=>{const n=[...logits];n[i]=+e.target.value;setLogits(n);}} style={{flex:1}}/>
          <span style={{color:P.text,fontSize: 13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",minWidth:28,textAlign:"right"}}>{logits[i].toFixed(1)}</span>
        </div>)}
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{color:P.blue,fontSize: 10,fontWeight:700}}>softmax</div>
        <div style={{color:P.blue,fontSize: 22}}>→</div>
        <div style={{color:P.amber,fontSize: 10,fontWeight:600,marginTop:2}}>T={temp.toFixed(1)}</div>
      </div>
      <div style={{background:P.card,borderRadius:10,border:`1px solid ${P.border}`,padding:8}}>
        <div style={{color:P.dim,fontSize: 10,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>{L("OLASILIKLAR","PROBS",lang)}</div>
        {toks.map((tok,i)=><div key={tok} style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
          <span style={{color:cols[i],fontSize: 13,fontWeight:700,minWidth:10}}>{tok}</span>
          <div style={{flex:1,height:14,borderRadius:4,background:P.border,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pr[i]*100}%`,background:cols[i],borderRadius:4,transition:"width 0.3s"}}/>
          </div>
          <span style={{color:cols[i],fontSize: 13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",minWidth:36,textAlign:"right"}}>{(pr[i]*100).toFixed(1)}%</span>
        </div>)}
      </div>
    </div>
    <div style={{marginTop:8,background:P.card,borderRadius:10,border:`1px solid ${P.border}`,padding:"8px 12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{color:P.amber,fontSize: 13,fontWeight:700}}>🌡 Temperature</span>
        <span style={{color:P.amber,fontSize: 15,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{temp.toFixed(1)}</span>
      </div>
      <input type="range" min="0.1" max="3" step="0.1" value={temp} onChange={e=>setTemp(+e.target.value)} style={{width:"100%"}}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize: 11,color:P.dim,marginTop:2}}>
        <span>{L("Keskin","Sharp",lang)}</span><span>{L("Düz","Flat",lang)}</span>
      </div>
    </div>
    <div style={{marginTop:8,padding:"8px 10px",borderRadius:8,background:P.blue+"08",border:`1px solid ${P.blue}15`,fontSize: 14,color:P.muted,lineHeight:1.6}}>
      💡 {L("T→0: greedy. T=1: standart. T→∞: uniform. GPT inference'da temperature budur!","T→0: greedy. T=1: standard. T→∞: uniform. This is temperature in GPT inference!",lang)}
      </div>
      {/* Token Sampling Simulator */}
      <div style={{marginTop:8,background:P.card,borderRadius:10,border:`1px solid ${P.border}`,padding:"10px 12px"}}>
        <div style={{color:P.dim,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>{L("TOKEN ÖRNEKLEME","TOKEN SAMPLING",lang)}</div>
        <div style={{fontSize:13,color:P.muted,marginBottom:6,lineHeight:1.6}}>
          {L("Butona bas ve bu dağılımdan 20 token örnekle!","Press the button to sample 20 tokens from this distribution!",lang)}
        </div>
        <button onClick={()=>setSamples(Array.from({length:20},()=>{
          const r=Math.random();let cum=0;
          for(let i=0;i<pr.length;i++){cum+=pr[i];if(r<cum)return toks[i];}
          return toks[toks.length-1];
        }))} style={{
          width:"100%",padding:"7px",borderRadius:8,border:"none",marginBottom:6,
          background:`linear-gradient(135deg,${P.blue}80,${P.blue})`,
          color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"
        }}>{L("🎲 Örnekle!","🎲 Sample!",lang)}</button>
        {samples.length>0 && <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
          {samples.map((s,i)=>{
            const idx=toks.indexOf(s);
            return <span key={i} style={{
              padding:"3px 8px",borderRadius:6,fontSize:13,fontWeight:700,
              background:cols[idx]+"15",color:cols[idx],border:`1px solid ${cols[idx]}25`,
              fontFamily:"'JetBrains Mono',monospace",animation:`fadeSlideIn 0.2s ${i*0.03}s both`
            }}>{s}</span>;
          })}
        </div>}
    </div>
  </div>;
}

/* ═══ Entropy ═══ */
function EntropyViz({lang}){
  const[mode,setMode]=useState("uniform");
  const presets={uniform:[0.2,0.2,0.2,0.2,0.2],peaked:[0.01,0.01,0.01,0.01,0.96],medium:[0.05,0.1,0.15,0.3,0.4]};
  const[probs,setProbs]=useState(presets.uniform);
  const[customMode,setCustomMode]=useState(false);
  const adjEnt=(idx,val)=>{const n=[...probs];n[idx]=val;const s=n.reduce((a,b)=>a+b,0);if(s>0)setProbs(n.map(p=>p/s));};
  const toks=["a","b","c","d","e"];const cols=[P.indigo,P.teal,P.violet,P.blue,P.pink];
  const H=-probs.reduce((s,p)=>s+(p>0.001?p*Math.log2(p):0),0);const maxH=Math.log2(5);
  return <div>
    <div style={{fontSize: 16,color:P.text,marginBottom:10,lineHeight:1.7}}>
      <strong style={{color:P.pink}}>{L("Entropi","Entropy",lang)}</strong> = {L("belirsizlik ölçüsü. Yüksek=belirsiz. Düşük=emin.","uncertainty measure. High=uncertain. Low=confident.",lang)}
    </div>
    <div style={{display:"flex",gap:4,marginBottom:8}}>
      {[["uniform",L("🎲 Eşit","🎲 Uniform",lang)],["peaked",L("🎯 Emin","🎯 Confident",lang)],["medium",L("🤔 Orta","🤔 Medium",lang)]].map(([k,l])=>
        <button key={k} onClick={()=>{setMode(k);setProbs(presets[k]);}} style={{flex:1,padding:"6px 8px",borderRadius:8,fontSize: 13,fontWeight:700,border:`1px solid ${mode===k?P.pink+"50":P.border}`,background:mode===k?P.pink+"12":P.card,color:mode===k?P.pink:P.muted,cursor:"pointer"}}>{l}</button>
      )}
    </div>
    <button onClick={()=>setCustomMode(!customMode)} style={{
      width:"100%",padding:"5px",borderRadius:6,border:`1px solid ${customMode?P.pink+"40":P.border}`,
      background:customMode?P.pink+"08":"transparent",color:customMode?P.pink:P.muted,
      fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:6
    }}>{customMode?L("✓ Özel Mod Aktif — kaydırıcılarla ayarla","✓ Custom Mode — drag sliders",lang):L("+ Özel Dağılım Oluştur","+ Create Custom Distribution",lang)}</button>
    {customMode && <div style={{display:"flex",gap:4,marginBottom:6}}>
      {probs.map((p,i)=><div key={i} style={{flex:1,textAlign:"center"}}>
        <div style={{color:cols[i],fontSize:13,fontWeight:700}}>{toks[i]}</div>
        <input type="range" min="0.01" max="1" step="0.01" value={p} onChange={e=>adjEnt(i,+e.target.value)} style={{width:"90%"}}/>
      </div>)}
    </div>}
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:90,padding:"0 10px"}}>
      {probs.map((p,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <span style={{color:cols[i],fontSize: 11,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{(p*100).toFixed(0)}%</span>
        <div style={{width:"100%",borderRadius:"4px 4px 0 0",height:`${p*80}px`,minHeight:2,background:`linear-gradient(180deg,${cols[i]},${cols[i]}60)`,transition:"height 0.3s"}}/>
        <span style={{fontSize: 16,fontWeight:700,color:cols[i]}}>{toks[i]}</span>
      </div>)}
    </div>
    <div style={{marginTop:10,background:P.card,borderRadius:10,border:`1px solid ${P.border}`,padding:12,textAlign:"center"}}>
      <div style={{color:P.dim,fontSize: 10,fontWeight:700,letterSpacing:2}}>{L("ENTROPİ","ENTROPY",lang)}</div>
      <div style={{fontSize: 34,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:H>1.8?P.pink:H>1?P.amber:P.emerald,marginTop:4}}>H = {H.toFixed(3)}</div>
      <div style={{marginTop:6,height:6,borderRadius:3,background:P.border,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(H/maxH)*100}%`,background:`linear-gradient(90deg,${P.emerald},${P.amber},${P.pink})`,borderRadius:3,transition:"width 0.3s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize: 11,color:P.dim,marginTop:4}}>
        <span>H=0</span><span>H={maxH.toFixed(1)}</span>
      </div>
    </div>
    <div style={{marginTop:8,padding:"8px 10px",borderRadius:8,background:P.pink+"08",border:`1px solid ${P.pink}15`,fontSize: 14,color:P.muted,lineHeight:1.6}}>
      💡 H = -Σ p(x)log₂p(x). {L("Rastgele model: H≈4.75. İyi model: H≈1.7.","Random model: H≈4.75. Good model: H≈1.7.",lang)}
      </div>
      {/* Per-token surprise */}
      <div style={{marginTop:8,background:P.card,borderRadius:10,border:`1px solid ${P.border}`,padding:"10px 12px"}}>
        <div style={{color:P.dim,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>{L("TOKEN BAŞINA SÜRPRİZ","PER-TOKEN SURPRISE",lang)}</div>
        <div style={{display:"flex",gap:4}}>
          {probs.map((p,i)=>{
            const surprise=p>0.001?-Math.log2(p):10;
            const maxSurp=Math.log2(5);
            return <div key={i} style={{flex:1,textAlign:"center"}}>
              <div style={{color:cols[i],fontSize:14,fontWeight:800}}>{toks[i]}</div>
              <div style={{height:50,display:"flex",alignItems:"flex-end",justifyContent:"center",marginTop:4}}>
                <div style={{width:"70%",borderRadius:"4px 4px 0 0",height:`${(surprise/maxSurp)*45}px`,
                  background:`linear-gradient(180deg,${cols[i]},${cols[i]}40)`,transition:"height 0.3s"}}/>
              </div>
              <div style={{color:P.muted,fontSize:10,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{surprise.toFixed(1)}</div>
              <div style={{color:P.dim,fontSize:9}}>bits</div>
            </div>;
          })}
        </div>
        <div style={{fontSize:13,color:P.muted,marginTop:6,lineHeight:1.6}}>
          {L("Düşük olasılık = yüksek sürpriz (çok bit). -log₂(p) formülü her token'ın bilgi içeriğini ölçer.","Low probability = high surprise (more bits). -log₂(p) measures each token's information content.",lang)}
        </div>
    </div>
  </div>;
}

/* ═══ Cross-Entropy ═══ */
function CrossEntropyLab({lang}){
  const[mp,setMp]=useState(0.5);
  const loss=-Math.log(Math.max(0.001,mp));
  const toks=["a","b","c","d","e"];const ci=2;
  const[ceProbs,setCeProbs]=useState([0.1,0.1,0.5,0.2,0.1]);
  const pr=ceProbs;const cols=[P.indigo,P.teal,P.violet,P.blue,P.pink];
  const adjCe=(idx,val)=>{const n=[...ceProbs];n[idx]=val;const s=n.reduce((a,b)=>a+b,0);if(s>0)setCeProbs(n.map(p=>p/s));};
  const ce=-Math.log(Math.max(0.001,pr[ci]));
  return <div>
    <div style={{fontSize: 16,color:P.text,marginBottom:10,lineHeight:1.7}}>
      <strong style={{color:P.amber}}>Cross-Entropy Loss</strong> = {L("-log(P(doğru token)). Olasılık yüksek → loss düşük!","-log(P(correct)). Higher prob → lower loss!",lang)}
    </div>
    <div style={{background:P.card,borderRadius:10,border:`1px solid ${P.border}`,padding:12,marginBottom:10}}>
      <div style={{color:P.dim,fontSize: 10,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>-log(P) {L("EĞRİSİ","CURVE",lang)}</div>
      <svg viewBox="0 0 260 100" style={{width:"100%",maxWidth:260,display:"block"}}>
        <path d={Array.from({length:100},(_,i)=>{const p=0.01+(i/99)*0.99;const y=-Math.log(p);const x=10+(i/99)*240;const sy=10+(1-y/5)*80;return `${i===0?"M":"L"}${x},${sy}`;}).join(" ")} fill="none" stroke={P.amber} strokeWidth="2" strokeLinecap="round"/>
        {(()=>{const x=10+mp*240;const y=10+(1-loss/5)*80;return <g>
          <circle cx={x} cy={y} r={14} fill={P.amber} opacity={0.08}/>
          <circle cx={x} cy={y} r={5} fill={P.amber} stroke={P.bg} strokeWidth={2}/>
          <rect x={x-28} y={y-22} width={56} height={16} rx={8} fill={P.amber}/>
          <text x={x} y={y-11.5} textAnchor="middle" fill="#000" fontSize="8" fontWeight="700" fontFamily="'JetBrains Mono',monospace">L={loss.toFixed(2)}</text>
        </g>;})()}
      </svg>
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
        <span style={{color:P.muted,fontSize: 13}}>P={mp.toFixed(2)}</span>
        <input type="range" min="0.01" max="0.99" step="0.01" value={mp} onChange={e=>setMp(+e.target.value)} style={{flex:1}}/>
        <span style={{color:loss>2?P.pink:loss>0.7?P.amber:P.emerald,fontSize: 15,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>L={loss.toFixed(2)}</span>
      </div>
    </div>
    <div style={{background:P.card,borderRadius:10,border:`1px solid ${P.border}`,padding:12}}>
      <div style={{color:P.dim,fontSize: 10,fontWeight:700,marginBottom:6}}>
        {L("Doğru token","Correct token",lang)} = <span style={{color:P.violet}}>"{toks[ci]}"</span>
      </div>
      <div style={{display:"flex",gap:4}}>
        {toks.map((tok,i)=><div key={tok} style={{flex:1,textAlign:"center",padding:"6px 2px",borderRadius:8,background:i===ci?P.emerald+"12":P.card,border:`1px solid ${i===ci?P.emerald+"40":P.border}`}}>
          <div style={{color:i===ci?P.emerald:cols[i],fontSize: 15,fontWeight:800}}>{tok}</div>
          <input type="range" min="0.01" max="1" step="0.01" value={pr[i]} onChange={e=>adjCe(i,+e.target.value)} style={{width:"90%",margin:"2px 0"}}/>
          <div style={{color:P.muted,fontSize: 11,fontFamily:"'JetBrains Mono',monospace"}}>{(pr[i]*100).toFixed(0)}%</div>
        </div>)}
      </div>
      <div style={{textAlign:"center",marginTop:8,color:P.amber,fontSize: 14,fontWeight:700}}>
        CE = -log({pr[ci].toFixed(2)}) = <strong style={{fontSize: 17}}>{ce.toFixed(3)}</strong>
      </div>
    </div>
    <div style={{marginTop:8,padding:"8px 10px",borderRadius:8,background:P.amber+"08",border:`1px solid ${P.amber}15`,fontSize: 14,color:P.muted,lineHeight:1.6}}>
      💡 {L("P=1→loss=0. P=1/27→loss=3.30. Eğitimin amacı bu sayıyı düşürmek!","P=1→loss=0. P=1/27→loss=3.30. Training aims to minimize this!",lang)}
    </div>
  </div>;
}

/* ═══ Full Lab ═══ */
function FullLab({lang}){
  const[logits,setLogits]=useState([2.5,1.0,0.3,-0.5,-1.5]);
  const[temp,setTemp]=useState(1.0);
  const[trainSteps,setTrainSteps]=useState(0);const ci=0;
  const toks=["a","b","c","d","e"];const cols=[P.indigo,P.teal,P.violet,P.blue,P.pink];
  const sc=logits.map(l=>l/temp);const mx=Math.max(...sc);
  const ex=sc.map(l=>Math.exp(l-mx));const sm=ex.reduce((a,b)=>a+b,0);
  const pr=ex.map(e=>e/sm);
  const H=-pr.reduce((s,p)=>s+(p>0.001?p*Math.log(p):0),0);
  const ce=-Math.log(Math.max(0.001,pr[ci]));
  return <div>
    <div style={{fontSize: 16,color:P.text,marginBottom:10,lineHeight:1.7}}>
      🧪 <strong style={{color:P.emerald}}>{L("Tam pipeline!","Full pipeline!",lang)}</strong> {L("Logits→Softmax→Olasılık→Loss. Hepsini birleştir!","Logits→Softmax→Probability→Loss. Put it all together!",lang)}
    </div>
    <div style={{background:P.card,borderRadius:10,border:`1px solid ${P.border}`,padding:10,marginBottom:6}}>
      <div style={{color:P.dim,fontSize: 10,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>LOGITS</div>
      {toks.map((tok,i)=><div key={tok} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
        <span style={{color:cols[i],fontSize: 13,fontWeight:700,minWidth:10}}>{tok}</span>
        <input type="range" min="-3" max="5" step="0.1" value={logits[i]} onChange={e=>{const n=[...logits];n[i]=+e.target.value;setLogits(n);}} style={{flex:1}}/>
        <span style={{color:P.text,fontSize: 13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",minWidth:28,textAlign:"right"}}>{logits[i].toFixed(1)}</span>
      </div>)}
      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4,paddingTop:4,borderTop:`1px solid ${P.border}`}}>
        <span style={{color:P.amber,fontSize: 13,fontWeight:700}}>T</span>
        <input type="range" min="0.1" max="3" step="0.1" value={temp} onChange={e=>setTemp(+e.target.value)} style={{flex:1}}/>
        <span style={{color:P.amber,fontSize: 13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",minWidth:28,textAlign:"right"}}>{temp.toFixed(1)}</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
      {[[L("OLASILIK","PROB",lang),`${(pr[ci]*100).toFixed(1)}%`,pr[ci]>0.5?P.emerald:P.amber],[L("ENTROPİ","ENTROPY",lang),H.toFixed(3),H>1.5?P.pink:P.emerald],["CE LOSS",ce.toFixed(3),ce>1.5?P.pink:ce>0.7?P.amber:P.emerald]].map(([label,val,color])=>
        <div key={label} style={{background:color+"08",border:`1px solid ${color}20`,borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
          <div style={{color:P.dim,fontSize: 9,fontWeight:700,letterSpacing:1}}>{label}</div>
          <div style={{color,fontSize: 17,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{val}</div>
        </div>
      )}
    </div>
    <div style={{display:"flex",gap:3,marginTop:6}}>
      {toks.map((tok,i)=><div key={tok} style={{flex:1,textAlign:"center",padding:"4px 0",borderRadius:6,background:i===ci?P.emerald+"15":"transparent",border:`1px solid ${i===ci?P.emerald+"40":P.border}`}}>
        <div style={{color:cols[i],fontSize: 14,fontWeight:800}}>{tok}</div>
        <div style={{color:P.muted,fontSize: 10,fontFamily:"'JetBrains Mono',monospace"}}>{(pr[i]*100).toFixed(1)}%</div>
      </div>)}
    </div>
    <div style={{marginTop:8,padding:"8px 10px",borderRadius:8,background:P.emerald+"08",border:`1px solid ${P.emerald}15`,fontSize: 14,color:P.muted,lineHeight:1.6}}>
      💡 {L("Doğru token='a'. Logit↑→olasılık↑→loss↓. Temperature↓→daha emin. GPT eğitiminin ÖZÜ!","Correct='a'. Logit↑→prob↑→loss↓. Temperature↓→more confident. ESSENCE of GPT training!",lang)}
      </div>
      {/* Auto-train button */}
      <div style={{marginTop:8,background:P.card,borderRadius:10,border:`1px solid ${P.border}`,padding:"10px 12px",textAlign:"center"}}>
        <div style={{display:"flex",gap:6}}>
        <button onClick={()=>{
          const n=[...logits];
          n[ci]+=0.3;
          for(let i=0;i<n.length;i++){if(i!==ci)n[i]-=0.1;}
          setLogits(n);setTrainSteps(t=>t+1);
        }} style={{
          padding:"8px 20px",borderRadius:8,border:"none",
          background:`linear-gradient(135deg,${P.emerald}90,${P.emerald})`,
          color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"
        }}>{L("🧠 1 Adım","🧠 1 Step",lang)}</button>
          <button onClick={()=>{
            let lg=[...logits];
            for(let s=0;s<10;s++){lg[ci]+=0.3;for(let i=0;i<lg.length;i++){if(i!==ci)lg[i]-=0.1;}}
            setLogits(lg);setTrainSteps(t=>t+10);
          }} style={{
            padding:"8px 16px",borderRadius:8,border:"none",
            background:`linear-gradient(135deg,${P.teal}90,${P.teal})`,
            color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"
          }}>{L("🚀 ×10 Adım","🚀 ×10 Steps",lang)}</button>
        </div>
        {trainSteps>0 && <div style={{fontSize:13,color:P.amber,fontWeight:700,textAlign:"center",marginTop:4}}>
          {L("Toplam adım","Total steps",lang)}: {trainSteps} — Loss: {(-Math.log(Math.max(0.001,pr[ci]))).toFixed(3)}
        </div>}
        <div style={{fontSize:12,color:P.muted,marginTop:4}}>
          {L("Her adımda: doğru token logit'i ↑, diğerleri ↓","Each step: correct token logit ↑, others ↓",lang)}
        </div>
    </div>
  </div>;
}

/* ═══ Quiz ═══ */
const QS_TR=[
  {q:"P(A)+P(B)+... toplamı kaçtır?",o:["0","1","100","Değişir"],a:1,e:"Tam olasılık dağılımında toplam her zaman 1'dir."},
  {q:"Softmax ne yapar?",o:["Sıralar","Ham skorları olasılığa çevirir (toplam=1)","Matris çarpar","Gradient hesaplar"],a:1,e:"softmax(x_i)=exp(x_i)/Σexp(x_j). Çıktı: toplam=1."},
  {q:"Temperature=0.1 ile softmax?",o:["Düzleşir","Çok sivri (%100'e yakın)","Değişmez","Rastgele"],a:1,e:"Düşük T → logitler büyük sayılara bölünür → çok keskin."},
  {q:"Entropi H=0 ne anlama gelir?",o:["Tam belirsizlik","Hiçbir şey bilmiyor","Sıfır hata","Tamamen emin (%100 tek sonuç)"],a:3,e:"H=0 = tek olayın olasılığı 1, diğerleri 0."},
  {q:"-log(0.5) kaçtır?",o:["0.5","0.69","1.0","2.0"],a:1,e:"-log(0.5)=0.693. Doğal logaritma (ln) kullanılır."},
  {q:"Rastgele model (27 token) loss kaç?",o:["0","1.0","3.30","27"],a:2,e:"-log(1/27)=log(27)≈3.30."},
  {q:"Temperature=0.1 ile T=2.0 arasındaki fark ne?",o:["Aynı dağılım","Düşük T daha düz","Düşük T daha sivri","Yüksek T daha sivri"],a:2,e:"Düşük temperature = daha sivri dağılım (greedy'ye yakın). Yüksek T = daha düz (rastgeleye yakın)."},
];
const QS_EN=[
  {q:"P(A)+P(B)+... sums to?",o:["0","1","100","Varies"],a:1,e:"In a complete distribution, all probabilities sum to 1."},
  {q:"What does softmax do?",o:["Sorts","Converts scores to probabilities (sum=1)","Multiplies matrices","Computes gradients"],a:1,e:"softmax(x_i)=exp(x_i)/Σexp(x_j). Output: sum=1."},
  {q:"Softmax with temperature=0.1?",o:["Flattens","Very sharp (≈100%)","No change","Random"],a:1,e:"Low T → logits divided by small number → very sharp."},
  {q:"Entropy H=0 means?",o:["Total uncertainty","Knows nothing","Zero error","Completely certain (100% one outcome)"],a:3,e:"H=0 = one event probability 1, others 0."},
  {q:"-log(0.5) equals?",o:["0.5","0.69","1.0","2.0"],a:1,e:"-log(0.5)=0.693. Natural log (ln)."},
  {q:"Loss for random model (27 tokens)?",o:["0","1.0","3.30","27"],a:2,e:"-log(1/27)=log(27)≈3.30."},
  {q:"What is the difference between T=0.1 and T=2.0?",o:["Same distribution","Low T is flatter","Low T is sharper","High T is sharper"],a:2,e:"Low temperature = sharper distribution (near greedy). High T = flatter (near random)."},
];

function Quiz({lang,onComplete}){
  const QS=lang==="tr"?QS_TR:QS_EN;
  const[cur,setCur]=useState(0);const[sel,setSel]=useState(null);
  const[score,setScore]=useState(0);const[done,setDone]=useState(false);
  const q=QS[cur];const correct=sel===q.a;
  const pick=(i)=>{if(sel!==null)return;setSel(i);if(i===q.a)setScore(s=>s+1);};
  const next=()=>{if(cur+1>=QS.length){setDone(true);if(score>=QS.length-1)onComplete?.();return;}setCur(c=>c+1);setSel(null);};
  if(done){const pct=Math.round((score/QS.length)*100);return <div style={{textAlign:"center",padding:"20px 0"}}>
    <div style={{fontSize: 48,marginBottom:8}}>{pct>=80?"🏆":pct>=50?"👍":"📚"}</div>
    <div style={{fontSize: 22,fontWeight:900,color:pct>=80?P.emerald:P.amber}}>{score}/{QS.length}</div>
    <div style={{fontSize: 16,color:P.muted,marginTop:4}}>{pct>=80?L("Harika!","Excellent!",lang):L("Tekrar dene!","Try again!",lang)}</div>
    <button onClick={()=>{setCur(0);setSel(null);setScore(0);setDone(false);}} style={{marginTop:12,padding:"8px 20px",borderRadius:8,border:`1px solid ${P.border}`,background:"transparent",color:P.text,fontSize: 15,fontWeight:600,cursor:"pointer"}}>{L("Tekrar Dene","Try Again",lang)}</button>
  </div>;}
  return <div>
    <div style={{fontSize: 14,color:P.muted,marginBottom:8}}>{cur+1}/{QS.length} • {L("Skor","Score",lang)}: {score}</div>
    <div style={{fontSize: 17,fontWeight:700,color:P.text,marginBottom:10,lineHeight:1.6}}>{q.q}</div>
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {q.o.map((opt,i)=>{const isA=i===q.a;const ch=i===sel;
        let bg=P.card,bc=P.border,tc=P.text;
        if(sel!==null){if(isA){bg=P.emerald+"12";bc=P.emerald+"40";tc=P.emerald;}else if(ch){bg=P.pink+"12";bc=P.pink+"40";tc=P.pink;}else tc=P.dim;}
        return <button key={i} onClick={()=>pick(i)} style={{padding:"9px 12px",borderRadius:8,border:`1.5px solid ${bc}`,background:bg,color:tc,fontSize: 15,fontWeight:600,cursor:sel!==null?"default":"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,transition:"all 0.2s"}}>
          <span style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize: 13,fontWeight:800,background:sel!==null&&isA?P.emerald+"20":sel!==null&&ch?P.pink+"20":P.border+"50",color:sel!==null&&isA?P.emerald:sel!==null&&ch?P.pink:P.muted,flexShrink:0}}>
            {sel!==null&&isA?"✓":sel!==null&&ch&&!isA?"✕":String.fromCharCode(65+i)}
          </span>{opt}
        </button>;})}
    </div>
    {sel!==null&&<>
      <div style={{marginTop:8,padding:"8px 10px",borderRadius:8,background:correct?P.emerald+"08":P.pink+"08",border:`1px solid ${correct?P.emerald:P.pink}18`,fontSize: 15,lineHeight:1.6,animation:"fadeSlideIn 0.3s both"}}>
        <strong style={{color:correct?P.emerald:P.pink}}>{correct?"✓ ":"✕ "}{correct?L("Doğru!","Correct!",lang):L("Yanlış!","Wrong!",lang)} </strong>{q.e}
      </div>
      <button onClick={next} style={{marginTop:8,width:"100%",padding:"9px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${P.indigo},${P.violet})`,color:"#fff",fontSize: 15,fontWeight:700,cursor:"pointer"}}>{cur+1>=QS.length?L("Sonuçlar","Results",lang):L("Sonraki →","Next →",lang)}</button>
    </>}
  </div>;
}

/* ═══ Body ═══ */
function Body({step,lang}){
  switch(step){
    case 0:return <>
      <S emoji="🌧️" color={P.indigo} text={L("Hava durumu tahminini düşün: 'Yarın yağmur yağma olasılığı %70.' Bu bir olasılık — tam emin değiliz ama bilgiye dayalı bir tahmin.","Think about weather forecasts: '70% chance of rain tomorrow.' This is a probability — not certain, but an informed prediction.",lang)}/>
      <S emoji="🤖" color={P.teal} delay={0.1} text={L("GPT de aynısını yapar: 'Sonraki token e olma olasılığı %40, m olma olasılığı %25...' Model her zaman bir olasılık dağılımı üretir.","GPT does the same: 'Next token e probability 40%, m probability 25%...' The model always produces a probability distribution.",lang)}/>
      <S emoji="📏" color={P.pink} delay={0.2} text={L("Peki modelin ne kadar 'iyi' olduğunu nasıl ölçeriz? Entropi ve cross-entropy ile! Bu ders, W5 Eğitim Döngüsü'nün temelini atıyor.","How do we measure how 'good' the model is? With entropy and cross-entropy! This lesson lays the foundation for W5 Training Loop.",lang)}/>
      {/* microGPT Connection + Roadmap */}
      <div style={{marginTop:10,padding:"12px",borderRadius:10,background:P.surface,border:`1px solid ${P.border}`}}>
        <div style={{color:P.amber,fontSize:13,fontWeight:700,marginBottom:8}}>🔗 {L("microGPT'de Nerede Kullanılır?","Where Is This Used in microGPT?",lang)}</div>
        {[
          ["🎲",L("Olasılık","Probability",lang),L("Model çıktısı: 27 token üzerinde olasılık dağılımı","Model output: probability distribution over 27 tokens",lang),P.teal],
          ["🔀","Softmax",L("Logitler → olasılıklar (F.softmax)","Logits → probabilities (F.softmax)",lang),P.blue],
          ["📏",L("Entropi","Entropy",lang),L("Modelin belirsizliği — düşük = iyi","Model uncertainty — low = good",lang),P.pink],
          ["🎯","Cross-Entropy",L("Eğitim loss fonksiyonu (F.cross_entropy)","Training loss function (F.cross_entropy)",lang),P.amber],
        ].map(([icon,label,desc,color],i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0",borderBottom:i<3?`1px solid ${P.border}`:"none"}}>
            <span style={{fontSize:15,width:24,textAlign:"center",flexShrink:0}}>{icon}</span>
            <div>
              <span style={{fontSize:13,color,fontWeight:700}}>{label}</span>
              <div style={{fontSize:12,color:P.muted,marginTop:1}}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </>;
    case 1:return <DiceExplorer lang={lang}/>;
    case 2:return <DistributionViz lang={lang}/>;
    case 3:return <SoftmaxExplorer lang={lang}/>;
    case 4:return <EntropyViz lang={lang}/>;
    case 5:return <CrossEntropyLab lang={lang}/>;
    case 6:return <FullLab lang={lang}/>;
    case 7:return <Quiz lang={lang}/>;
    default:return null;
  }
}

/* ═══ Main ═══ */
const ProbabilityLesson=({ embedded, externalStep, onStepChange })=>{
  const lang=useLang();
  const[internalStep,setInternalStep]=useState(0);
  const step=embedded?(externalStep||0):internalStep;
  const setStep=embedded?(s=>{const v=typeof s==="function"?s(step):s;onStepChange?.(v);}):setInternalStep;
  const CH=lang==="tr"?PR_CHAPTERS_TR:PR_CHAPTERS_EN;const ch=CH[step];
  return <div style={{minHeight:embedded?"auto":"100vh",background:P.bg,color:P.text,fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column"}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    {!embedded && <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>}
    {!embedded && <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box} input[type=range]{-webkit-appearance:none;background:transparent;width:100%} input[type=range]::-webkit-slider-track{height:3px;background:${P.border};border-radius:2px} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${P.amber};margin-top:-5.5px;cursor:pointer;border:2px solid ${P.bg}}`}</style>}
    {!embedded && <header style={{padding:"14px 16px 10px",borderBottom:`1px solid ${P.border}`}}>
      <div style={{fontSize: 10,fontWeight:700,letterSpacing:3,color:P.dim,textTransform:"uppercase"}}>{L("İnteraktif Ders","Interactive Lesson",lang)}</div>
      <h1 style={{margin:"3px 0 0",fontSize: 26,fontWeight:900,letterSpacing:-0.5,background:`linear-gradient(135deg,${P.amber},${P.pink},${P.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{L("Olasılık & Bilgi Teorisi","Probability & Information Theory",lang)}</h1>
    </header>}
    {!embedded && <nav style={{display:"flex",gap:2,padding:"8px 12px",overflowX:"auto",scrollbarWidth:"none"}}>
      {CH.map((c,i)=><button key={i} onClick={()=>setStep(i)} style={{flex:"0 0 auto",display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:14,border:i===step?`1px solid ${c.color}35`:"1px solid transparent",background:i===step?c.color+"10":"transparent",color:i===step?c.color:i<step?P.text:P.dim,fontSize: 13,fontWeight:i===step?700:500,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.25s"}}>
        <span style={{fontSize: 14}}>{c.icon}</span><span>{c.label}</span>
      </button>)}
    </nav>}
    {!embedded && <div style={{padding:"8px 16px 2px"}}>
      <h2 style={{margin:0,fontSize: 18,fontWeight:800,color:ch.color,display:"flex",alignItems:"center",gap:6}}>
        <span>{ch.icon}</span>{ch.label}
      </h2>
    </div>}
    <section style={{flex:1,padding:"6px 16px 10px",overflowY:"auto",minHeight:0}}>
      <Body step={step} lang={lang}/>
    </section>
    {!embedded && <footer style={{padding:"6px 16px 12px",borderTop:`1px solid ${P.border}`,background:P.bg}}>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${P.border}`,background:"transparent",color:step===0?P.dim:P.text,fontSize: 15,fontWeight:600,cursor:step===0?"default":"pointer"}}>
          ‹ {L("Geri","Back",lang)}
        </button>
        <button onClick={()=>setStep(s=>Math.min(CH.length-1,s+1))} disabled={step===CH.length-1} style={{flex:1.3,padding:"10px",borderRadius:8,border:"none",background:step===CH.length-1?P.card:`linear-gradient(135deg,${CH[Math.min(7,step+1)]?.color}90,${CH[Math.min(7,step+1)]?.color})`,color:step===CH.length-1?P.dim:P.white,fontSize: 15,fontWeight:700,cursor:step===CH.length-1?"default":"pointer"}}>
          {L("İleri","Next",lang)} ›
        </button>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:3,marginTop:8}}>
        {CH.map((_,i)=><div key={i} onClick={()=>setStep(i)} style={{width:i===step?18:5,height:3.5,borderRadius:2,background:i===step?CH[i].color:i<step?CH[i].color+"35":P.border,transition:"all 0.3s",cursor:"pointer"}}/>)}
      </div>
    </footer>}
  </div>;
};

export default ProbabilityLesson;
