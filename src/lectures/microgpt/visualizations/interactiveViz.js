import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLang, tx } from '../../../core/i18n';
import { VB, VizBox, FlowArrow, FlowBox, StatBox, CodeBlock, InfoCard, Spark } from '../../../components/SharedComponents';
import { softmax, softmaxArr, gauss, matmul, rmsnorm, relu2, smpl } from '../../../utils/math';
import { NAMES, CHARS, VOCAB, stoi, itos, BOS, EOS, createModel, fwd } from '../../../utils/model';

// ─── Interactive Viz: Core ─────────────────────────────────
const NeuralNetBasicsViz = () => {
  const lang = useLang();
  const [tab, setTab] = useState(0);
  // Tab 0: Interactive neuron
  const [w1, setW1] = useState(0.5);
  const [w2, setW2] = useState(-0.3);
  const [bias, setBias] = useState(0.1);
  const x1 = 2.0, x2 = 3.0;
  const raw = w1 * x1 + w2 * x2 + bias;
  const out = Math.max(0, raw);

  // Tab 1: data flow animation
  const [flowStep, setFlowStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setFlowStep(s => (s + 1) % 5), 1200); return () => clearInterval(t); }, []);

  // Tab 2: mini training sim
  const [trainStep, setTrainStep] = useState(0);
  const [training, setTraining] = useState(false);
  const stages = [
    { w: [0.1, 0.2], b: 0, loss: 12.5, label: lang === "tr" ? "Rastgele başlangıç" : "Random start" },
    { w: [0.8, 1.0], b: 0.5, loss: 5.2, label: lang === "tr" ? "Adım 10" : "Step 10" },
    { w: [2.0, 2.5], b: 0.8, loss: 1.8, label: lang === "tr" ? "Adım 50" : "Step 50" },
    { w: [3.0, 2.0], b: 1.0, loss: 0.1, label: lang === "tr" ? "Adım 100 — yakınsadı ✓" : "Step 100 — converged ✓" },
  ];
  const ts = stages[trainStep];
  const trainData = [{x:[1,2],t:5,l:lang==="tr"?"1 oda, 2m²":"1 room, 2m²"},{x:[3,4],t:19,l:lang==="tr"?"3 oda, 4m²":"3 rooms, 4m²"},{x:[2,3],t:11,l:lang==="tr"?"2 oda, 3m²":"2 rooms, 3m²"}];
  useEffect(() => {
    if (!training) return;
    const t = setInterval(() => setTrainStep(s => { if (s >= 3) { setTraining(false); return 3; } return s + 1; }), 1200);
    return () => clearInterval(t);
  }, [training]);

  const tabs = [{l:lang === "tr" ? "🔬 İnteraktif Nöron" : "🔬 Interactive Neuron",c:"#0EA5E9"},{l:lang === "tr" ? "🌊 Veri Akışı" : "🌊 Data Flow",c:"#8B5CF6"},{l:lang === "tr" ? "🎯 Mini Eğitim" : "🎯 Mini Training",c:"#10B981"}];

  return (<VizBox title={lang === "tr" ? "Yapay Sinir Ağı — İnteraktif Keşif" : "Neural Network — Interactive Exploration"} color="#0EA5E9">
    <div style={{display:"flex",gap:4,marginBottom:12}}>
      {tabs.map((t,i)=>(<button key={i} onClick={()=>setTab(i)} style={{flex:1,padding:"6px 8px",borderRadius:8,border:"none",cursor:"pointer",background:tab===i?`${t.c}20`:"rgba(255,255,255,0.03)",color:tab===i?t.c:"#64748B",fontSize: 13,fontWeight:700,fontFamily:"inherit",borderBottom:tab===i?`2px solid ${t.c}`:"2px solid transparent",transition:"all .3s"}}>{t.l}</button>))}
    </div>

    {/* TAB 0: Interactive Neuron */}
    {tab===0 && (<div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
      <svg viewBox="0 0 220 100" style={{width:340,height:160,flexShrink:0}}>
        <line x1="40" y1="25" x2="110" y2="50" stroke={w1>=0?"#0EA5E9":"#EF4444"} strokeWidth={Math.abs(w1)*2+0.5} opacity="0.6"/>
        <line x1="40" y1="75" x2="110" y2="50" stroke={w2>=0?"#0EA5E9":"#EF4444"} strokeWidth={Math.abs(w2)*2+0.5} opacity="0.6"/>
        <line x1="110" y1="50" x2="180" y2="50" stroke={out>0?"#10B981":"#64748B"} strokeWidth="1.5"/>
        <circle cx="40" cy="25" r="7" fill="#0EA5E920" stroke="#0EA5E9" strokeWidth="1"/>
        <text x="40" y="27" fill="#0EA5E9" fontSize="6" fontWeight="700" textAnchor="middle">x₁={x1}</text>
        <circle cx="40" cy="75" r="7" fill="#0EA5E920" stroke="#0EA5E9" strokeWidth="1"/>
        <text x="40" y="77" fill="#0EA5E9" fontSize="6" fontWeight="700" textAnchor="middle">x₂={x2}</text>
        <circle cx="110" cy="18" r="5" fill="#F59E0B20" stroke="#F59E0B" strokeWidth="0.8"/>
        <text x="110" y="20" fill="#F59E0B" fontSize="5" fontWeight="600" textAnchor="middle">b</text>
        <line x1="110" y1="23" x2="110" y2="43" stroke="#F59E0B" strokeWidth="0.5" strokeDasharray="2,2"/>
        <circle cx="110" cy="50" r="10" fill={raw>0?"#10B98120":"#EF444420"} stroke={raw>0?"#10B981":"#EF4444"} strokeWidth="1.2"/>
        <text x="110" y="48" fill="#E2E8F0" fontSize="4" fontWeight="600" textAnchor="middle">Σ+ReLU</text>
        <text x="110" y="55" fill="#94A3B8" fontSize="3.5" textAnchor="middle">{raw.toFixed(2)}</text>
        <circle cx="180" cy="50" r="7" fill={out>0?"#10B98130":"#64748B20"} stroke={out>0?"#10B981":"#64748B"} strokeWidth="1"/>
        <text x="180" y="52" fill={out>0?"#10B981":"#64748B"} fontSize="7" fontWeight="800" textAnchor="middle">{out.toFixed(2)}</text>
        <text x="68" y="32" fill={w1>=0?"#0EA5E9":"#EF4444"} fontSize="5" fontWeight="700" textAnchor="middle">w₁={w1.toFixed(1)}</text>
        <text x="68" y="70" fill={w2>=0?"#0EA5E9":"#EF4444"} fontSize="5" fontWeight="700" textAnchor="middle">w₂={w2.toFixed(1)}</text>
        <text x="110" y="92" fill="#94A3B8" fontSize="3.5" textAnchor="middle">y = ReLU({w1.toFixed(1)}×{x1} + ({w2.toFixed(1)})×{x2} + {bias.toFixed(1)}) = {out.toFixed(2)}</text>
      </svg>
      <div style={{flex:1,minWidth:180}}>
        <div style={{fontSize: 13,fontWeight:700,color:"#F59E0B",marginBottom:8}}>{lang === "tr" ? "🎛️ Ağırlıkları Değiştir:" : "🎛️ Adjust Weights:"}</div>
        {[{label:"w₁",val:w1,set:setW1,color:"#0EA5E9"},{label:"w₂",val:w2,set:setW2,color:"#8B5CF6"},{label:"bias",val:bias,set:setBias,color:"#F59E0B"}].map((s,i)=>(
          <div key={i} style={{marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize: 13}}>
              <span style={{color:s.color,fontWeight:600}}>{s.label}</span>
              <span style={{fontFamily:"'Fira Code',monospace",color:"#E2E8F0"}}>{s.val.toFixed(1)}</span>
            </div>
            <input type="range" min={-2} max={2} step="0.1" value={s.val} onChange={e=>s.set(+e.target.value)} style={{width:"100%",accentColor:s.color}}/>
          </div>
        ))}
        <div style={{padding:"6px 8px",borderRadius:8,background:raw<0?"rgba(239,68,68,.08)":"rgba(16,185,129,.08)",fontSize: 13,color:raw<0?"#EF4444":"#10B981",fontWeight:600}}>
          {raw<0?(lang==="tr"?`⛔ ReLU: ${raw.toFixed(2)} < 0 → çıktı 0 (nöron kapalı)`:`⛔ ReLU: ${raw.toFixed(2)} < 0 → output 0 (neuron off)`):(lang==="tr"?`✅ ReLU: ${raw.toFixed(2)} > 0 → çıktı ${out.toFixed(2)} (nöron açık)`:`✅ ReLU: ${raw.toFixed(2)} > 0 → output ${out.toFixed(2)} (neuron on)`)}
        </div>
        <div style={{marginTop:6,fontSize: 12,color:"#64748B"}}>{lang==="tr"?"💡 Deneyin: w₂'yi negatif yapın → bir girdinin etkisini TERSİNE çevirir!":"💡 Try it: make w₂ negative → reverses the effect of that input!"}</div>
      </div>
    </div>)}

    {/* TAB 1: Data Flow Animation */}
    {tab===1 && (<div>
      <div style={{display:"flex",gap:4,justifyContent:"center",alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
        {[{l:lang==="tr"?"Girdi":"Input",v:"x₁=2, x₂=3",c:"#0EA5E9"},{l:lang==="tr"?"× Ağırlık":"× Weight",v:"×w₁, ×w₂",c:"#F59E0B"},{l:lang==="tr"?"Σ Toplam":"Σ Sum",v:"1.0+(-0.9)+0.1",c:"#8B5CF6"},{l:"ReLU",v:"max(0, 0.2)",c:"#EC4899"},{l:lang==="tr"?"Çıktı":"Output",v:"0.2",c:"#10B981"}].map((n,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{padding:"8px 10px",borderRadius:10,textAlign:"center",minWidth:70,background:i<=flowStep?`${n.c}18`:"rgba(255,255,255,0.02)",border:`1.5px solid ${i===flowStep?n.c:i<flowStep?`${n.c}40`:"rgba(255,255,255,0.05)"}`,transform:i===flowStep?"scale(1.1)":"scale(1)",transition:"all .4s",boxShadow:i===flowStep?`0 0 14px ${n.c}25`:"none"}}>
              <div style={{fontSize: 13,fontWeight:700,color:n.c}}>{n.l}</div>
              <div style={{fontSize: 11,fontFamily:"'Fira Code',monospace",color:"#94A3B8",marginTop:2}}>{n.v}</div>
            </div>
            {i<4&&<div style={{fontSize: 15,color:i<flowStep?n.c:"#1E293B",transition:"color .4s"}}>→</div>}
          </div>
        ))}
      </div>
      <div style={{padding:10,borderRadius:10,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)"}}>
        {[
          {text:lang==="tr"?"① Girdi değerleri nörona gelir: x₁=2.0, x₂=3.0":"① Input values arrive at the neuron: x₁=2.0, x₂=3.0",c:"#0EA5E9"},
          {text:lang==="tr"?"② Her girdi kendi ağırlığıyla çarpılır: 2.0×0.5=1.0 ve 3.0×(-0.3)=-0.9":"② Each input is multiplied by its weight: 2.0×0.5=1.0 and 3.0×(-0.3)=-0.9",c:"#F59E0B"},
          {text:lang==="tr"?"③ Çarpımlar + bias toplanır: 1.0 + (-0.9) + 0.1 = 0.2":"③ Products + bias are summed: 1.0 + (-0.9) + 0.1 = 0.2",c:"#8B5CF6"},
          {text:lang==="tr"?"④ ReLU aktivasyonu: max(0, 0.2) = 0.2 → pozitif, geçir!":"④ ReLU activation: max(0, 0.2) = 0.2 → positive, pass!",c:"#EC4899"},
          {text:lang==="tr"?"⑤ Çıktı = 0.2 → sonraki katmana veya tahmin olarak gider":"⑤ Output = 0.2 → goes to next layer or becomes the prediction",c:"#10B981"},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"3px 0",opacity:i===flowStep?1:0.25,transition:"opacity .4s"}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:`${s.c}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize: 11,fontWeight:800,color:s.c}}>{i+1}</span>
            </div>
            <span style={{fontSize: 13,color:i===flowStep?"#E2E8F0":"#64748B"}}>{s.text}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:8,padding:"6px 10px",borderRadius:8,background:"rgba(14,165,233,.06)",fontSize: 12,color:"#0EA5E9"}}>
        {lang==="tr"?"GPT'de bu akış 3,648 parametre ve 243 satır boyunca gerçekleşir — aynı mantık, daha fazla nöron!":"In GPT this flow happens across 3,648 parameters and 243 lines — same logic, more neurons!"}
      </div>
    </div>)}

    {/* TAB 2: Mini Training Simulation */}
    {tab===2 && (<div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <div style={{flex:1,padding:12,borderRadius:12,background:`${ts.loss<1?"#10B981":ts.loss<5?"#F59E0B":"#EF4444"}10`,border:`1.5px solid ${ts.loss<1?"#10B981":ts.loss<5?"#F59E0B":"#EF4444"}30`,textAlign:"center",transition:"all .4s"}}>
          <div style={{fontSize: 12,color:"#64748B"}}>{lang==="tr"?"Loss (hata)":"Loss (error)"}</div>
          <div style={{fontSize: 31,fontWeight:800,color:ts.loss<1?"#10B981":ts.loss<5?"#F59E0B":"#EF4444",fontFamily:"'Fira Code',monospace"}}>{ts.loss.toFixed(1)}</div>
          <div style={{fontSize: 13,color:"#94A3B8",marginTop:2}}>{ts.label}</div>
        </div>
        <div style={{flex:1,padding:12,borderRadius:12,background:"rgba(255,255,255,0.02)"}}>
          <div style={{fontSize: 12,color:"#64748B",marginBottom:4}}>{lang === "tr" ? "Öğrenilen ağırlıklar" : "Learned weights"}</div>
          {[{l:lang==="tr"?"w₁ (oda)":"w₁ (rooms)",v:ts.w[0],c:"#0EA5E9"},{l:lang==="tr"?"w₂ (alan)":"w₂ (area)",v:ts.w[1],c:"#8B5CF6"},{l:"bias",v:ts.b,c:"#F59E0B"}].map((p,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize: 15,fontFamily:"'Fira Code',monospace",marginBottom:2}}>
              <span style={{color:p.c}}>{p.l}</span>
              <span style={{color:"#E2E8F0",fontWeight:700}}>{p.v.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{fontSize: 13,color:"#64748B",marginBottom:6}}>{lang==="tr"?"Tahminler: fiyat = w₁×oda + w₂×alan + b":"Predictions: price = w₁×rooms + w₂×area + b"}</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {trainData.map((d,i)=>{ const pred=ts.w[0]*d.x[0]+ts.w[1]*d.x[1]+ts.b; const err=Math.abs(pred-d.t); return (
          <div key={i} style={{flex:1,minWidth:110,padding:8,borderRadius:8,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{fontSize: 12,color:"#64748B"}}>{d.l}</div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              <span style={{fontSize: 14,fontFamily:"'Fira Code',monospace",color:err<1?"#10B981":"#EF4444"}}>→{pred.toFixed(1)}</span>
              <span style={{fontSize: 14,fontFamily:"'Fira Code',monospace",color:"#94A3B8"}}>{lang==="tr"?"hedef":"target"}:{d.t}</span>
            </div>
            <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.05)",marginTop:4}}>
              <div style={{height:"100%",borderRadius:2,width:`${Math.max(0,100-err*8)}%`,background:err<1?"#10B981":err<5?"#F59E0B":"#EF4444",transition:"all .5s"}}/>
            </div>
          </div>
        );})}
      </div>
      <div style={{display:"flex",gap:6,marginTop:10,justifyContent:"center"}}>
        <button onClick={()=>{setTrainStep(0);setTraining(true);}} style={{padding:"6px 16px",borderRadius:8,border:"none",background:"#10B981",color:"#fff",fontSize: 14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lang === "tr" ? "▶ Eğitimi Başlat" : "▶ Start Training"}</button>
        <button onClick={()=>setTraining(false)} style={{padding:"6px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>⏸</button>
        <input type="range" min={0} max={3} value={trainStep} onChange={e=>{setTraining(false);setTrainStep(+e.target.value);}} style={{flex:1,accentColor:"#10B981"}}/>
      </div>
      <div style={{marginTop:8,padding:"6px 10px",borderRadius:8,background:"rgba(16,185,129,.06)",fontSize: 12,color:"#10B981"}}>
        {lang==="tr"?"Loss 12.5 → 0.1 düştü! Model ev fiyatını doğru tahmin etmeyi ÖĞRENDİ. GPT'de aynı mantık — ama harf tahmin ediyor.":"Loss dropped 12.5 → 0.1! The model LEARNED to predict house prices correctly. Same logic in GPT — but predicting characters."}
      </div>
    </div>)}
  </VizBox>);
};

const LangModelConceptViz = () => {
  const lang = useLang();
  const [tab, setTab] = useState(0);

  // Tab 0: Autoregressive generation step-by-step
  const [genStep, setGenStep] = useState(0);
  const [genAuto, setGenAuto] = useState(false);
  const genSteps = [
    { ctx: "BOS", probs: [{ch:"e",p:8},{ch:"a",p:7},{ch:"m",p:5},{ch:"s",p:4}], pick: "e", reason: lang==="tr"?"BOS'tan sonra en olası başlangıç harfi":"Most likely starting letter after BOS" },
    { ctx: "BOS → e", probs: [{ch:"m",p:14},{ch:"l",p:12},{ch:"v",p:6},{ch:"d",p:5}], pick: "m", reason: lang==="tr"?"İngilizce isimlerde 'em' çok yaygın (emma, emily)":"'em' is very common in English names (emma, emily)" },
    { ctx: "... → e → m", probs: [{ch:"m",p:18},{ch:"i",p:10},{ch:"a",p:8},{ch:"e",p:5}], pick: "m", reason: lang==="tr"?"Çift 'mm' kalıbı (emma, emmy, summer)":"Double 'mm' pattern (emma, emmy, summer)" },
    { ctx: "... → m → m", probs: [{ch:"a",p:22},{ch:"y",p:12},{ch:"i",p:8},{ch:"e",p:6}], pick: "a", reason: lang==="tr"?"'mma' bitişi çok güçlü (emma, gemma)":"'mma' ending is very strong (emma, gemma)" },
    { ctx: "... → m → a", probs: [{ch:"EOS",p:30},{ch:"r",p:10},{ch:"n",p:8},{ch:"l",p:5}], pick: "EOS", reason: lang==="tr"?"4-harfli isim tamamlandı — model durmasını biliyor":"4-letter name complete — the model knows when to stop" },
  ];
  const gs = genSteps[genStep];
  const builtName = ["","e","em","emm","emma","emma✓"][genStep+1] || "";
  useEffect(() => {
    if (!genAuto) return;
    const t = setInterval(() => setGenStep(s => { if (s >= genSteps.length-1) { setGenAuto(false); return s; } return s+1; }), 1500);
    return () => clearInterval(t);
  }, [genAuto]);

  // Tab 1: Phone autocomplete interactive
  const [typed, setTyped] = useState("");
  const autocompleteDB = {
    "": [{w:"bugün",p:15},{w:"merhaba",p:12},{w:"nasıl",p:10},{w:"teşekkür",p:8}],
    "b": [{w:"bugün",p:30},{w:"ben",p:20},{w:"bir",p:18},{w:"bence",p:10}],
    "bu": [{w:"bugün",p:45},{w:"burası",p:15},{w:"bu",p:12},{w:"burada",p:8}],
    "bug": [{w:"bugün",p:65},{w:"buğday",p:10},{w:"bugüne",p:8},{w:"bug",p:5}],
    "bugü": [{w:"bugün",p:80},{w:"bugüne",p:10},{w:"bugünkü",p:5},{w:"bugünlük",p:3}],
    "bugün": [{w:"hava",p:25},{w:"çok",p:18},{w:"ne",p:15},{w:"güzel",p:12}],
  };
  const suggestions = autocompleteDB[typed.toLowerCase()] || [{w:"...",p:0},{w:"...",p:0},{w:"...",p:0},{w:"...",p:0}];

  // Tab 2: emma training walkthrough
  const [trainPair, setTrainPair] = useState(0);
  const pairs = [
    { input: "BOS", target: "e", pBefore: 3.6, pAfter: 8.2, color: "#0EA5E9" },
    { input: "e", target: "m", pBefore: 2.1, pAfter: 14.5, color: "#8B5CF6" },
    { input: "m", target: "m", pBefore: 5.0, pAfter: 18.0, color: "#10B981" },
    { input: "m", target: "a", pBefore: 7.2, pAfter: 22.3, color: "#F59E0B" },
    { input: "a", target: "EOS", pBefore: 4.0, pAfter: 30.1, color: "#EC4899" },
  ];
  const tp = pairs[trainPair];

  const tabs = [{l:lang === "tr" ? "🎲 Autoregressive Üretim" : "🎲 Autoregressive Generation",c:"#10B981"},{l:lang === "tr" ? "📱 Telefon Analojisi" : "📱 Phone Analogy",c:"#8B5CF6"},{l:lang === "tr" ? "📚 'emma' Eğitimi" : "📚 'emma' Training",c:"#F59E0B"}];

  return (<VizBox title={lang === "tr" ? "Dil Modeli — İnteraktif Keşif" : "Language Model — Interactive Exploration"} color="#8B5CF6">
    <div style={{display:"flex",gap:4,marginBottom:12}}>
      {tabs.map((t,i)=>(<button key={i} onClick={()=>setTab(i)} style={{flex:1,padding:"6px 6px",borderRadius:8,border:"none",cursor:"pointer",background:tab===i?`${t.c}20`:"rgba(255,255,255,0.03)",color:tab===i?t.c:"#64748B",fontSize: 12,fontWeight:700,fontFamily:"inherit",borderBottom:tab===i?`2px solid ${t.c}`:"2px solid transparent",transition:"all .3s"}}>{t.l}</button>))}
    </div>

    {/* TAB 0: Autoregressive Generation */}
    {tab===0 && (<div>
      {/* Built name display */}
      <div style={{textAlign:"center",marginBottom:12}}>
        <div style={{fontSize: 12,color:"#64748B",marginBottom:4}}>{lang === "tr" ? "Oluşan isim:" : "Generated name:"}</div>
        <div style={{display:"inline-flex",gap:2}}>
          {(builtName||" ").split("").map((ch,i)=>(
            <div key={i} style={{width:28,height:32,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 19,fontWeight:800,fontFamily:"'Fira Code',monospace",color:ch==="✓"?"#10B981":"#E2E8F0",background:ch==="✓"?"rgba(16,185,129,.15)":"rgba(14,165,233,.1)",border:`1.5px solid ${ch==="✓"?"#10B981":"#0EA5E930"}`}}>{ch}</div>
          ))}
        </div>
      </div>
      {/* Current step */}
      <div style={{padding:12,borderRadius:12,background:"rgba(16,185,129,.04)",border:"1px solid rgba(16,185,129,.15)",marginBottom:10}}>
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{minWidth:100}}>
            <div style={{fontSize: 11,color:"#64748B"}}>{lang === "tr" ? "Bağlam" : "Context"}</div>
            <div style={{fontSize: 15,fontFamily:"'Fira Code',monospace",fontWeight:700,color:"#0EA5E9",marginTop:2}}>{gs.ctx}</div>
          </div>
          <div style={{fontSize: 19,color:"#64748B"}}>→</div>
          <div style={{flex:1}}>
            <div style={{fontSize: 11,color:"#64748B",marginBottom:4}}>{lang==="tr"?"Olasılık dağılımı (28 token üzerinde, ilk 4):":"Probability distribution (over 28 tokens, top 4):"}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {gs.probs.map((pr,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,background:pr.ch===gs.pick?"rgba(16,185,129,.15)":"rgba(255,255,255,0.03)",border:pr.ch===gs.pick?"1.5px solid #10B981":"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontSize: 15,fontFamily:"'Fira Code',monospace",fontWeight:pr.ch===gs.pick?800:400,color:pr.ch===gs.pick?"#10B981":"#94A3B8"}}>{pr.ch}</span>
                  <div style={{width:40,height:8,background:"rgba(255,255,255,0.05)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pr.p*3}%`,borderRadius:4,background:pr.ch===gs.pick?"#10B981":"#64748B",transition:"width .5s"}}/>
                  </div>
                  <span style={{fontSize: 11,fontFamily:"'Fira Code',monospace",color:"#64748B"}}>{pr.p}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{marginTop:8,padding:"4px 8px",borderRadius:6,background:"rgba(16,185,129,.06)",fontSize: 12,color:"#10B981"}}>
          {lang==="tr"?"✓ Seçilen:":"✓ Selected:"} <strong>{gs.pick}</strong> — {gs.reason}
        </div>
      </div>
      <div style={{display:"flex",gap:6,justifyContent:"center"}}>
        <button onClick={()=>{setGenStep(0);setGenAuto(true);}} style={{padding:"5px 14px",borderRadius:8,border:"none",background:"#10B981",color:"#fff",fontSize: 14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lang === "tr" ? "▶ 'emma' Üret" : "▶ Generate 'emma'"}</button>
        <button onClick={()=>setGenStep(s=>Math.max(0,s-1))} style={{padding:"5px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>←</button>
        <button onClick={()=>setGenStep(s=>Math.min(genSteps.length-1,s+1))} style={{padding:"5px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>→</button>
        <button onClick={()=>setGenAuto(false)} style={{padding:"5px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>⏸</button>
      </div>
    </div>)}

    {/* TAB 1: Phone Autocomplete Analogy */}
    {tab===1 && (<div>
      <div style={{padding:14,borderRadius:12,background:"rgba(139,92,246,.04)",border:"1px solid rgba(139,92,246,.15)",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <span style={{fontSize: 21}}>📱</span>
          <span style={{fontSize: 14,color:"#8B5CF6",fontWeight:700}}>{lang==="tr"?"Telefon Klavyesi Simülasyonu":"Phone Keyboard Simulation"}</span>
          <span style={{fontSize: 12,color:"#64748B"}}>{lang==="tr"?"— harf harf yazın, önerileri izleyin":"— type letter by letter, watch suggestions"}</span>
        </div>
        {/* Input display */}
        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:10}}>
          <div style={{flex:1,padding:"8px 12px",borderRadius:8,background:"#0D1117",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'Fira Code',monospace",fontSize: 17,color:"#E2E8F0",minHeight:20}}>
            {typed || <span style={{color:"#475569"}}>{lang==="tr"?"yazmaya başlayın...":"start typing..."}</span>}
            <span style={{color:"#8B5CF6",animation:"blink 1s infinite"}}>|</span>
          </div>
          <button onClick={()=>setTyped("")} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 13,cursor:"pointer",fontFamily:"inherit"}}>{lang==="tr"?"Sil":"Clear"}</button>
        </div>
        {/* Letter buttons */}
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>
          {["b","u","g","ü","n"," ","h","a","v","c","o","k"].map((ch,i)=>(
            <button key={i} onClick={()=>{const nxt = typed+ch; if(autocompleteDB[nxt.toLowerCase()]) setTyped(nxt); else setTyped(nxt.slice(0,-1));}} style={{
              padding:"6px 10px",borderRadius:6,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,0.04)",
              color:"#E2E8F0",fontSize: 15,fontFamily:"'Fira Code',monospace",fontWeight:600,cursor:"pointer",minWidth:28,textAlign:"center"
            }}>{ch===" "?"⎵":ch}</button>
          ))}
        </div>
        {/* Suggestions */}
        <div style={{fontSize: 12,color:"#64748B",marginBottom:4}}>{lang === "tr" ? "📊 Öneriler (olasılık sırası):" : "📊 Suggestions (by probability):"}</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {suggestions.map((s,i)=>(
            <div key={i} onClick={()=>{ if(s.w!=="..." && autocompleteDB[s.w.toLowerCase()]) setTyped(s.w); }} style={{
              padding:"6px 10px",borderRadius:8,cursor:s.w==="..."?"default":"pointer",
              background:i===0?"rgba(139,92,246,.15)":"rgba(255,255,255,0.03)",
              border:`1px solid ${i===0?"#8B5CF6":"rgba(255,255,255,0.05)"}`,
              display:"flex",alignItems:"center",gap:6
            }}>
              <span style={{fontSize: 14,fontFamily:"'Fira Code',monospace",fontWeight:i===0?700:400,color:i===0?"#8B5CF6":"#94A3B8"}}>{s.w}</span>
              {s.p>0&&<span style={{fontSize: 11,color:"#64748B"}}>{s.p}%</span>}
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"8px 12px",borderRadius:8,background:"rgba(139,92,246,.06)",fontSize: 13,color:"#8B5CF6",lineHeight:1.5}}>
        {lang==="tr"?<><strong>Bağlantı:</strong> Telefonunuzun otomatik tamamlaması = dil modeli! Her ikisi de önceki harflere bakarak sonraki olası devamları sıralar. GPT aynı mantıkta çalışır — sadece 175 milyar parametreyle ve tüm internet verisiyle eğitilmiştir.</>:<><strong>Connection:</strong> Your phone's autocomplete = language model! Both rank possible continuations by looking at previous letters. GPT works the same way — just with 175 billion parameters and trained on all internet data.</>}
      </div>
    </div>)}

    {/* TAB 2: 'emma' Training Walkthrough */}
    {tab===2 && (<div>
      <div style={{fontSize: 13,color:"#94A3B8",marginBottom:8,textAlign:"center"}}>
        {lang==="tr"?<>Model <strong style={{color:"#F59E0B"}}>"emma"</strong> kelimesinden nasıl öğrenir? Her harf çifti bir eğitim örneği:</>:<>How does the model learn from <strong style={{color:"#F59E0B"}}>"emma"</strong>? Each letter pair is a training example:</>}
      </div>
      {/* Pair selector */}
      <div style={{display:"flex",gap:3,justifyContent:"center",marginBottom:10}}>
        {pairs.map((p,i)=>(
          <button key={i} onClick={()=>setTrainPair(i)} style={{
            padding:"6px 10px",borderRadius:8,border:`1.5px solid ${trainPair===i?p.color:`${p.color}30`}`,
            background:trainPair===i?`${p.color}18`:"transparent",
            color:trainPair===i?p.color:"#64748B",fontSize: 14,fontFamily:"'Fira Code',monospace",fontWeight:700,cursor:"pointer"
          }}>{p.input}→{p.target}</button>
        ))}
      </div>
      {/* Current pair detail */}
      <div style={{padding:14,borderRadius:12,background:`${tp.color}08`,border:`1.5px solid ${tp.color}20`,transition:"all .3s"}}>
        <div style={{display:"flex",gap:16,alignItems:"center",justifyContent:"center",flexWrap:"wrap",marginBottom:10}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize: 11,color:"#64748B"}}>{lang==="tr"?"Girdi":"Input"}</div>
            <div style={{fontSize: 23,fontWeight:800,fontFamily:"'Fira Code',monospace",color:tp.color}}>{tp.input}</div>
          </div>
          <div style={{fontSize: 23,color:"#64748B"}}>→ model →</div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize: 11,color:"#64748B"}}>{lang==="tr"?"Hedef":"Target"}</div>
            <div style={{fontSize: 23,fontWeight:800,fontFamily:"'Fira Code',monospace",color:"#10B981"}}>{tp.target}</div>
          </div>
        </div>
        {/* Before/After training comparison */}
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,padding:8,borderRadius:8,background:"rgba(239,68,68,.06)",textAlign:"center"}}>
            <div style={{fontSize: 11,color:"#EF4444",fontWeight:600}}>{lang === "tr" ? "EĞİTİM ÖNCESİ" : "BEFORE TRAINING"}</div>
            <div style={{fontSize: 12,color:"#64748B",marginTop:2}}>P('{tp.target}' | '{tp.input}')</div>
            <div style={{fontSize: 23,fontWeight:800,fontFamily:"'Fira Code',monospace",color:"#EF4444"}}>{tp.pBefore}%</div>
            <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.05)",marginTop:4}}>
              <div style={{height:"100%",borderRadius:3,width:`${tp.pBefore}%`,background:"#EF4444",transition:"width .5s"}}/>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",fontSize: 23,color:"#F59E0B"}}>→</div>
          <div style={{flex:1,padding:8,borderRadius:8,background:"rgba(16,185,129,.06)",textAlign:"center"}}>
            <div style={{fontSize: 11,color:"#10B981",fontWeight:600}}>{lang === "tr" ? "EĞİTİM SONRASI" : "AFTER TRAINING"}</div>
            <div style={{fontSize: 12,color:"#64748B",marginTop:2}}>P('{tp.target}' | '{tp.input}')</div>
            <div style={{fontSize: 23,fontWeight:800,fontFamily:"'Fira Code',monospace",color:"#10B981"}}>{tp.pAfter}%</div>
            <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.05)",marginTop:4}}>
              <div style={{height:"100%",borderRadius:3,width:`${tp.pAfter}%`,background:"#10B981",transition:"width .5s"}}/>
            </div>
          </div>
        </div>
        <div style={{marginTop:8,fontSize: 12,color:"#64748B",textAlign:"center"}}>
          Loss: -log({tp.pBefore/100}) = {(-Math.log(tp.pBefore/100)).toFixed(2)} → -log({tp.pAfter/100}) = {(-Math.log(tp.pAfter/100)).toFixed(2)}
          <span style={{color:"#10B981",fontWeight:700}}> ↓{((-Math.log(tp.pBefore/100))-(-Math.log(tp.pAfter/100))).toFixed(2)}</span>
        </div>
      </div>
      <div style={{marginTop:8,padding:"6px 10px",borderRadius:8,background:"rgba(245,158,11,.06)",fontSize: 12,color:"#F59E0B"}}>
        {lang==="tr"?'"emma" = 5 eğitim çifti. 32K isim × ~6 harf = ~192K çift. Model tüm bu çiftlerden İngilizce isim kalıplarını öğrenir!':'"emma" = 5 training pairs. 32K names × ~6 chars = ~192K pairs. The model learns English name patterns from all these pairs!'}
      </div>
    </div>)}
  </VizBox>);
};

const VectorConceptViz = () => {
  const lang = useLang();
  const v1=[3,4], v2=[1,5];
  const dot=v1[0]*v2[0]+v1[1]*v2[1];
  const mag1=Math.sqrt(v1[0]**2+v1[1]**2);
  const mag2=Math.sqrt(v2[0]**2+v2[1]**2);
  const cos=(dot/(mag1*mag2));
  return (<VizBox title={lang === "tr" ? "Vektör — Yön + Büyüklük" : "Vector — Direction + Magnitude"} color="#8B5CF6">
    <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
      <svg viewBox="-1 -1 8 8" style={{width:180,height:180,background:VB.card,borderRadius:10}}>
        {/* Grid */}
        {[0,1,2,3,4,5,6].map(i=>(<g key={i}><line x1={i} y1="0" x2={i} y2="7" stroke="#ffffff08" strokeWidth="0.05"/><line x1="0" y1={i} x2="7" y2={i} stroke="#ffffff08" strokeWidth="0.05"/></g>))}
        {/* Axes */}
        <line x1="0" y1="0" x2="7" y2="0" stroke="#ffffff15" strokeWidth="0.05"/>
        <line x1="0" y1="0" x2="0" y2="7" stroke="#ffffff15" strokeWidth="0.05"/>
        {/* Vectors */}
        <line x1="0" y1="0" x2={v1[0]} y2={v1[1]} stroke="#0EA5E9" strokeWidth="0.15"/>
        <circle cx={v1[0]} cy={v1[1]} r="0.2" fill="#0EA5E9"/>
        <text x={v1[0]+.3} y={v1[1]} fill="#0EA5E9" fontSize="0.7" fontWeight="600">a=[3,4]</text>
        <line x1="0" y1="0" x2={v2[0]} y2={v2[1]} stroke="#EC4899" strokeWidth="0.15"/>
        <circle cx={v2[0]} cy={v2[1]} r="0.2" fill="#EC4899"/>
        <text x={v2[0]+.3} y={v2[1]} fill="#EC4899" fontSize="0.7" fontWeight="600">b=[1,5]</text>
      </svg>
      <div style={{flex:1,minWidth:220}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          <StatBox value={`[${v1}]`} label={lang==="tr"?"Vektör a":"Vector a"} color="#0EA5E9"/>
          <StatBox value={`[${v2}]`} label={lang==="tr"?"Vektör b":"Vector b"} color="#EC4899"/>
          <StatBox value={dot.toString()} label="Dot Product a·b" color="#F59E0B"/>
          <StatBox value={cos.toFixed(2)} label={lang==="tr"?"Cosine Benzerlik":"Cosine Similarity"} color="#10B981"/>
        </div>
        <div style={{marginTop:8,fontSize: 13,color:VB.muted,lineHeight:1.5}}>
          <strong style={{color:"#F59E0B"}}>Dot product:</strong> a·b = 3×1 + 4×5 = {dot}<br/>
          <strong style={{color:"#10B981"}}>Cosine:</strong> a·b / (|a|×|b|) = {cos.toFixed(2)}<br/>
          <span style={{fontSize: 12,color:VB.dim}}>{lang==="tr"?"Embedding'de her token = yüksek boyutlu vektör. Benzer tokenler yakın yönlere işaret eder.":"In embeddings, each token = high-dimensional vector. Similar tokens point in similar directions."}</span>
        </div>
      </div>
    </div>
  </VizBox>);
};

const MatrixMulViz = () => {
  const lang = useLang();
  const W=[[1,2],[3,4],[5,6]], x=[10,20];
  const y=W.map(r=>r[0]*x[0]+r[1]*x[1]);
  const [hi,setHi]=useState(-1);
  return (<VizBox title={lang === "tr" ? "Matris Çarpımı — linear(x, W)" : "Matrix Multiplication — linear(x, W)"} color="#F59E0B">
    <div style={{display:"flex",gap:16,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize: 12,color:VB.muted,marginBottom:4}}>W [3×2]</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:2}}>
          {W.flat().map((v,i)=>{
            const r=Math.floor(i/2);
            return <div key={i} style={{width:36,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 15,fontFamily:"'Fira Code',monospace",borderRadius:4,background:hi===r?`#F59E0B20`:"rgba(255,255,255,0.03)",color:hi===r?"#F59E0B":VB.txt,fontWeight:hi===r?700:400,transition:"all .2s",cursor:"pointer"}} onMouseEnter={()=>setHi(r)} onMouseLeave={()=>setHi(-1)}>{v}</div>;
          })}
        </div>
      </div>
      <div style={{fontSize: 19,color:VB.dim}}>×</div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize: 12,color:VB.muted,marginBottom:4}}>x [2]</div>
        {x.map((v,i)=>(<div key={i} style={{width:36,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 15,fontFamily:"'Fira Code',monospace",borderRadius:4,background:"rgba(14,165,233,.1)",color:"#0EA5E9",marginBottom:2}}>{v}</div>))}
      </div>
      <div style={{fontSize: 19,color:VB.dim}}>=</div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize: 12,color:VB.muted,marginBottom:4}}>y [3]</div>
        {y.map((v,i)=>(<div key={i} style={{width:44,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 15,fontFamily:"'Fira Code',monospace",borderRadius:4,fontWeight:700,background:hi===i?"rgba(16,185,129,.2)":"rgba(16,185,129,.06)",color:hi===i?"#10B981":VB.txt,transition:"all .2s",cursor:"pointer"}} onMouseEnter={()=>setHi(i)} onMouseLeave={()=>setHi(-1)}>{v}</div>))}
      </div>
    </div>
    {hi>=0 && <div style={{marginTop:8,textAlign:"center",padding:"6px 12px",background:VB.card,borderRadius:8,fontSize: 14,fontFamily:"'Fira Code',monospace",color:"#F59E0B",transition:"all .3s"}}>
      y[{hi}] = {W[hi][0]}×{x[0]} + {W[hi][1]}×{x[1]} = {y[hi]}
    </div>}
    <div style={{marginTop:6,textAlign:"center",fontSize: 12,color:VB.dim}}>Her satır = bir dot product. Transformer'da Q,K,V,O,fc1,fc2 hep bu işlem.</div>
  </VizBox>);
};

const DerivativeViz = () => {
  const lang = useLang();
  const pts=[];
  for(let x=-3;x<=3;x+=0.2) pts.push({x,y:x*x});
  const xT=1.5, yT=xT*xT, slope=2*xT;
  return (<VizBox title={lang === "tr" ? "Türev — Eğim = Değişim Hızı" : "Derivative — Slope = Rate of Change"} color="#EC4899">
    <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
      <svg viewBox="-4 -1 8 11" style={{width:220,height:200,background:VB.card,borderRadius:10}}>
        <line x1="-4" y1="0" x2="4" y2="0" stroke="#ffffff10" strokeWidth="0.05"/>
        <line x1="0" y1="-1" x2="0" y2="10" stroke="#ffffff10" strokeWidth="0.05"/>
        <polyline points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke="#8B5CF6" strokeWidth="0.1"/>
        {/* Tangent line */}
        <line x1={xT-1.5} y1={yT-slope*1.5} x2={xT+1.5} y2={yT+slope*1.5} stroke="#EC4899" strokeWidth="0.08" strokeDasharray="0.2,0.1"/>
        <circle cx={xT} cy={yT} r="0.15" fill="#EC4899"/>
        <text x={xT+.3} y={yT-.3} fill="#EC4899" fontSize="0.6">x={xT}, eğim={slope}</text>
        <text x="1" y="9.5" fill="#8B5CF6" fontSize="0.5">f(x) = x²</text>
      </svg>
      <div style={{flex:1,minWidth:200}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[
            {eq:"f(x) = x²",res:"f'(x) = 2x",n:"Kare fonksiyon",c:"#8B5CF6"},
            {eq:"f(x) = log(x)",res:"f'(x) = 1/x",n:"Loss'ta kullanılır",c:"#10B981"},
            {eq:"f(x) = eˣ",res:"f'(x) = eˣ",n:"Softmax'ta kullanılır",c:"#F59E0B"},
            {eq:"f(x) = max(0,x)",res:"f'(x) = (x>0?1:0)",n:"ReLU",c:"#EC4899"},
          ].map((d,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderRadius:6,background:`${d.c}08`}}>
              <span style={{fontSize: 13,fontFamily:"'Fira Code',monospace",color:VB.txt,width:90}}>{d.eq}</span>
              <span style={{fontSize: 13,color:VB.dim}}>→</span>
              <span style={{fontSize: 13,fontFamily:"'Fira Code',monospace",color:d.c,fontWeight:600}}>{d.res}</span>
              <span style={{fontSize: 11,color:VB.dim}}>{d.n}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:8,fontSize: 12,color:VB.dim}}>Türev = "bu parametreyi birazcık değiştirirsem loss ne kadar değişir?"</div>
      </div>
    </div>
  </VizBox>);
};

const TopoSortViz = () => {
  const [step,setStep]=useState(0);
  const order=["a","b","c","d=a×b","e=d+c","L=f(e)"];
  const revOrder=[...order].reverse();
  useEffect(()=>{const t=setInterval(()=>setStep(s=>(s+1)%7),900);return()=>clearInterval(t);},[]);
  return (<VizBox title="Topological Sort → Reverse = Backward Pass" color="#F59E0B">
    <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
      <div>
        <div style={{fontSize: 13,fontWeight:600,color:"#0EA5E9",marginBottom:6}}>Forward (Topolojik Sıra)</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{order.map((n,i)=>(
          <div key={i} style={{padding:"6px 10px",borderRadius:6,fontSize: 13,fontFamily:"'Fira Code',monospace",background:i<step?`rgba(14,165,233,${0.15+i*0.1})`:"rgba(255,255,255,0.03)",color:i<step?"#0EA5E9":VB.dim,fontWeight:i===step-1?700:400,transition:"all .3s"}}>{n}</div>
        ))}</div>
      </div>
      <div>
        <div style={{fontSize: 13,fontWeight:600,color:"#EF4444",marginBottom:6}}>Backward (Ters Sıra)</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{revOrder.map((n,i)=>(
          <div key={i} style={{padding:"6px 10px",borderRadius:6,fontSize: 13,fontFamily:"'Fira Code',monospace",background:i<step?`rgba(239,68,68,${0.15+i*0.08})`:"rgba(255,255,255,0.03)",color:i<step?"#EF4444":VB.dim,fontWeight:i===step-1?700:400,transition:"all .3s"}}>{n}</div>
        ))}</div>
      </div>
    </div>
    <div style={{marginTop:8,fontSize: 12,color:VB.dim}}>Post-order DFS → topo sort → reversed → chain rule her düğümde uygulanır</div>
  </VizBox>);
};

const RnnToAttnViz = () => {
  const items=[
    {l:"RNN (2014)",d:"Sıralı işlem. Uzun mesafe = gradient vanishing",c:"#EF4444",icon:"🔗"},
    {l:"LSTM/GRU",d:"Gate mekanizması. Daha iyi ama hala sıralı",c:"#F59E0B",icon:"🚪"},
    {l:"Attention (2017)",d:"Her token herkese bakabilir! Paralel.",c:"#10B981",icon:"🔍"},
    {l:"GPT (2018+)",d:"Sadece attention + MLP. Ölçeklenebilir!",c:"#0EA5E9",icon:"🚀"},
  ];
  return (<VizBox title="RNN'den Attention'a — Tarihsel Evrim" color="#10B981">
    <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
      {items.map((it,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{padding:"10px 14px",borderRadius:10,textAlign:"center",minWidth:110,background:`${it.c}0A`,border:`1.5px solid ${it.c}25`}}>
            <div style={{fontSize: 19,marginBottom:2}}>{it.icon}</div>
            <div style={{fontSize: 14,fontWeight:700,color:it.c}}>{it.l}</div>
            <div style={{fontSize: 11,color:VB.muted,marginTop:2,maxWidth:130}}>{it.d}</div>
          </div>
          {i<3&&<FlowArrow color={VB.dim}/>}
        </div>
      ))}
    </div>
  </VizBox>);
};

const DotProductViz = () => {
  const lang = useLang();
  const pairs=[
    {a:lang === "tr" ? "kedi" : "cat",b:lang === "tr" ? "köpek" : "dog",sim:.85,c:"#10B981"},
    {a:lang === "tr" ? "kedi" : "cat",b:"araba",sim:.12,c:"#EF4444"},
    {a:lang === "tr" ? "kral" : "king",b:lang === "tr" ? "kraliçe" : "queen",sim:.78,c:"#10B981"},
    {a:lang === "tr" ? "kral" : "king",b:"masa",sim:.05,c:"#EF4444"},
  ];
  return (<VizBox title={lang === "tr" ? "Dot Product ≈ Benzerlik Ölçüsü" : "Dot Product ≈ Similarity Measure"} color="#F59E0B">
    <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
      {pairs.map((p,i)=>(
        <div key={i} style={{padding:"8px 12px",borderRadius:8,background:VB.card,minWidth:140,textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:6}}>
            <span style={{fontSize: 15,fontFamily:"'Fira Code',monospace",color:"#0EA5E9",fontWeight:600}}>{p.a}</span>
            <span style={{fontSize: 13,color:VB.dim}}>·</span>
            <span style={{fontSize: 15,fontFamily:"'Fira Code',monospace",color:"#8B5CF6",fontWeight:600}}>{p.b}</span>
          </div>
          <div style={{height:8,background:"rgba(255,255,255,0.03)",borderRadius:4,overflow:"hidden",marginBottom:4}}>
            <div style={{height:"100%",width:`${p.sim*100}%`,borderRadius:4,background:p.c}}/>
          </div>
          <div style={{fontSize: 13,fontFamily:"'Fira Code',monospace",color:p.c,fontWeight:700}}>{p.sim.toFixed(2)}</div>
        </div>
      ))}
    </div>
    <div style={{marginTop:8,textAlign:"center",fontSize: 12,color:VB.dim}}>Attention'da Q·K = "bu token o token'a ne kadar benzer?"</div>
  </VizBox>);
};

const NormCompareViz = () => {
  const lang = useLang();
  const x=[2,-1,3,0.5];
  const mean=x.reduce((a,b)=>a+b)/x.length;
  const ms=x.reduce((a,v)=>a+v*v,0)/x.length;
  const lnV=Math.sqrt(x.reduce((a,v)=>a+(v-mean)**2,0)/x.length+1e-5);
  const rmsV=Math.sqrt(ms+1e-5);
  const ln=x.map(v=>((v-mean)/lnV));
  const rms=x.map(v=>v/rmsV);
  return (<VizBox title={lang === "tr" ? "LayerNorm vs RMSNorm Karşılaştırma" : "LayerNorm vs RMSNorm Comparison"} color="#F59E0B">
    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:180,padding:"8px 12px",borderRadius:8,background:"rgba(99,102,241,.06)"}}>
        <div style={{fontSize: 14,fontWeight:600,color:"#6366F1",marginBottom:4}}>LayerNorm</div>
        <div style={{fontSize: 12,fontFamily:"'Fira Code',monospace",color:VB.muted}}>1. mean çıkar: x - μ</div>
        <div style={{fontSize: 12,fontFamily:"'Fira Code',monospace",color:VB.muted}}>2. variance ile böl: / σ</div>
        <div style={{fontSize: 12,color:VB.dim,marginTop:4}}>Sonuç: [{ln.map(v=>v.toFixed(2)).join(", ")}]</div>
      </div>
      <div style={{flex:1,minWidth:180,padding:"8px 12px",borderRadius:8,background:"rgba(245,158,11,.06)"}}>
        <div style={{fontSize: 14,fontWeight:600,color:"#F59E0B",marginBottom:4}}>RMSNorm ★</div>
        <div style={{fontSize: 12,fontFamily:"'Fira Code',monospace",color:VB.muted}}>1. RMS = √(mean(x²))</div>
        <div style={{fontSize: 12,fontFamily:"'Fira Code',monospace",color:VB.muted}}>2. x / RMS (mean çıkarmak yok!)</div>
        <div style={{fontSize: 12,color:VB.dim,marginTop:4}}>Sonuç: [{rms.map(v=>v.toFixed(2)).join(", ")}]</div>
      </div>
    </div>
    <div style={{marginTop:6,textAlign:"center",fontSize: 12,color:VB.dim}}>Girdi: [{x.join(", ")}] → RMSNorm ~%30 hızlı (1 op az)</div>
  </VizBox>);
};

const ActivationViz = () => {
  const lang = useLang();
  const fns=[
    {n:"ReLU",f:x=>Math.max(0,x),c:"#0EA5E9"},
    {n:"ReLU²",f:x=>Math.max(0,x)**2,c:"#EC4899"},
    {n:"GeLU",f:x=>0.5*x*(1+Math.tanh(Math.sqrt(2/Math.PI)*(x+0.044715*x**3))),c:"#10B981"},
  ];
  return (<VizBox title={lang === "tr" ? "Aktivasyon Fonksiyonları Karşılaştırma" : "Activation Functions Comparison"} color="#EC4899">
    <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
      {fns.map((fn,fi)=>(
        <div key={fi} style={{padding:"8px 12px",borderRadius:8,background:`${fn.c}08`,minWidth:140,textAlign:"center"}}>
          <div style={{fontSize: 14,fontWeight:700,color:fn.c,marginBottom:4}}>{fn.n}</div>
          <svg viewBox="-3 -1 6 5" style={{width:120,height:80}}>
            <line x1="-3" y1="0" x2="3" y2="0" stroke="#ffffff10" strokeWidth="0.05"/>
            <line x1="0" y1="-1" x2="0" y2="4" stroke="#ffffff10" strokeWidth="0.05"/>
            <polyline points={Array.from({length:60},(_, i)=>{const x=-3+i*0.1;return `${x},${-fn.f(x)}`;}).join(" ")} fill="none" stroke={fn.c} strokeWidth="0.08" transform="scale(1,-1) translate(0,0)"/>
          </svg>
          <div style={{display:"flex",gap:8,justifyContent:"center",fontSize: 11,color:VB.muted}}>
            <span>f(-1)={fn.f(-1).toFixed(1)}</span>
            <span>f(0.5)={fn.f(0.5).toFixed(2)}</span>
            <span>f(2)={fn.f(2).toFixed(1)}</span>
          </div>
        </div>
      ))}
    </div>
    <div style={{marginTop:6,textAlign:"center",fontSize: 12,color:VB.dim}}>ReLU² microGPT'de kullanılır: küçükler daha küçük, büyükler daha büyük → sparse</div>
  </VizBox>);
};

const DimensionFlowViz = () => {
  const lang = useLang();
  const dims=[
    {l:"ID",d:"1 int",w:15,c:"#94A3B8"},
    {l:"Emb",d:"[16]",w:40,c:"#0EA5E9"},
    {l:"+Pos",d:"[16]",w:40,c:"#8B5CF6"},
    {l:"Norm",d:"[16]",w:40,c:"#F59E0B"},
    {l:"Q,K,V",d:"[16]",w:40,c:"#10B981"},
    {l:"4×[4]",d:"heads",w:55,c:"#10B981"},
    {l:"[64]",d:"MLP↑",w:70,c:"#EC4899"},
    {l:"[16]",d:"MLP↓",w:40,c:"#EC4899"},
    {l:"[28]",d:"logits",w:50,c:"#EF4444"},
  ];
  return (<VizBox title={lang === "tr" ? "Boyut Akışı — Tensor Shape Değişimi" : "Dimension Flow — Tensor Shape Changes"} color="#0EA5E9">
    <div style={{display:"flex",alignItems:"flex-end",gap:2,justifyContent:"center",flexWrap:"wrap"}}>
      {dims.map((d,i)=>(
        <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div style={{width:Math.max(d.w*0.6,20),height:d.w,borderRadius:4,background:`${d.c}20`,border:`1px solid ${d.c}40`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s"}}>
            <span style={{fontSize: 11,fontFamily:"'Fira Code',monospace",color:d.c,fontWeight:600,writingMode:"vertical-rl",textOrientation:"mixed"}}>{d.d}</span>
          </div>
          <span style={{fontSize: 10,color:VB.muted,textAlign:"center"}}>{d.l}</span>
          {i<dims.length-1&&<span style={{position:"absolute"}}>→</span>}
        </div>
      ))}
    </div>
    <div style={{marginTop:8,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",fontSize: 11,color:VB.dim}}>
      <span>{lang==="tr"?"Genişleme":"Expansion"}: 1 → 16 → 64</span>
      <span>•</span>
      <span>{lang==="tr"?"Daralma":"Compression"}: 64 → 16 → 28</span>
      <span>•</span>
      <span>{lang==="tr"?"MLP = bottleneck mimarisi":"MLP = bottleneck architecture"}</span>
    </div>
  </VizBox>);
};

const GradDescentViz = () => {
  const lang = useLang();
  const [step,setStep]=useState(0);
  const path=Array.from({length:15},(_, i)=>{const x=3-i*0.22;return{x,y:x*x*0.5+0.3+Math.sin(x)*0.3};});
  useEffect(()=>{const t=setInterval(()=>setStep(s=>s<14?s+1:0),600);return()=>clearInterval(t);},[]);
  return (<VizBox title={lang === "tr" ? "Gradient Descent — Dağdan İnme Analojisi" : "Gradient Descent — Descending a Mountain"} color="#10B981">
    <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
      <svg viewBox="-1 -0.5 5 5" style={{width:220,height:180,background:VB.card,borderRadius:10}}>
        {/* Loss landscape */}
        <polyline points={path.map(p=>`${p.x+0.5},${p.y}`).join(" ")} fill="none" stroke="#8B5CF6" strokeWidth="0.06"/>
        {/* Current position */}
        {step<path.length&&<circle cx={path[step].x+0.5} cy={path[step].y} r="0.12" fill="#10B981"/>}
        {/* Arrow showing gradient direction */}
        {step<path.length-1&&step>0&&<line x1={path[step-1].x+0.5} y1={path[step-1].y} x2={path[step].x+0.5} y2={path[step].y} stroke="#10B981" strokeWidth="0.04" strokeDasharray="0.1,0.05"/>}
        <text x="0" y="4.3" fill="#8B5CF6" fontSize="0.35">{lang==="tr"?"param değeri →":"param value →"}</text>
        <text x="-0.8" y="2.5" fill="#EF4444" fontSize="0.35" transform="rotate(-90, -0.8, 2.5)">loss ↑</text>
      </svg>
      <div style={{flex:1,minWidth:200}}>
        {[
          {s:lang==="tr"?"1. Loss hesapla":"1. Compute loss",d:"Forward pass → cross-entropy",c:"#EF4444"},
          {s:lang==="tr"?"2. Gradient hesapla":"2. Compute gradient",d:lang==="tr"?"Backward → ∂L/∂w (eğim)":"Backward → ∂L/∂w (slope)",c:"#F59E0B"},
          {s:lang==="tr"?"3. Eğim yönünde adım at":"3. Step in slope direction",d:"w -= lr × gradient",c:"#10B981"},
          {s:lang==="tr"?"4. Tekrarla":"4. Repeat",d:lang==="tr"?"Loss yeterince düşene kadar":"Until loss is low enough",c:"#0EA5E9"},
        ].map((item,i)=>(
          <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"4px 8px",borderRadius:6,marginBottom:4,background:`${item.c}08`}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:item.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 12,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div>
            <div><div style={{fontSize: 13,fontWeight:600,color:item.c}}>{item.s}</div><div style={{fontSize: 11,color:VB.dim}}>{item.d}</div></div>
          </div>
        ))}
        <div style={{marginTop:4,fontSize: 12,color:VB.dim}}>Step: {step+1}/15 — {lang==="tr"?"LR büyükse atlar, küçükse yavaş iner":"Large LR = jumps, small LR = slow descent"}</div>
      </div>
    </div>
  </VizBox>);
};

const LrDecayViz = () => {
  const lang = useLang();
  const steps=20;
  const linear=Array.from({length:steps},(_, i)=>0.01*(1-i/(steps-1)));
  const cosine=Array.from({length:steps},(_, i)=>0.01*0.5*(1+Math.cos(Math.PI*i/(steps-1))));
  const mx=0.01;
  return (<VizBox title="Learning Rate Decay — Linear vs Cosine" color="#F59E0B">
    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
      <svg viewBox="0 0 200 80" style={{width:300,height:120,background:VB.card,borderRadius:10}}>
        {/* Grid */}
        {[0,1,2,3].map(i=><line key={i} x1="20" y1={10+i*18} x2="190" y2={10+i*18} stroke="#ffffff06" strokeWidth="0.5"/>)}
        {/* Lines */}
        <polyline points={linear.map((v,i)=>`${20+i*(170/(steps-1))},${10+(1-v/mx)*54}`).join(" ")} fill="none" stroke="#F59E0B" strokeWidth="1.5"/>
        <polyline points={cosine.map((v,i)=>`${20+i*(170/(steps-1))},${10+(1-v/mx)*54}`).join(" ")} fill="none" stroke="#8B5CF6" strokeWidth="1.5"/>
        <text x="25" y="75" fill="#F59E0B" fontSize="5">— Linear</text>
        <text x="80" y="75" fill="#8B5CF6" fontSize="5">— Cosine</text>
        <text x="100" y="8" fill={VB.dim} fontSize="4">lr = 0.01 → 0</text>
      </svg>
      <div style={{flex:1,minWidth:180}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <div style={{padding:"6px 10px",borderRadius:6,background:"rgba(245,158,11,.06)"}}>
            <div style={{fontSize: 13,fontWeight:600,color:"#F59E0B"}}>Linear Decay</div>
            <div style={{fontSize: 12,fontFamily:"'Fira Code',monospace",color:VB.muted}}>lr = lr₀ × (1 - step/N)</div>
            <div style={{fontSize: 11,color:VB.dim}}>{lang==="tr"?"Bu kodda kullanılan. Basit, etkili.":"Used in this code. Simple, effective."}</div>
          </div>
          <div style={{padding:"6px 10px",borderRadius:6,background:"rgba(139,92,246,.06)"}}>
            <div style={{fontSize: 13,fontWeight:600,color:"#8B5CF6"}}>Cosine Decay</div>
            <div style={{fontSize: 12,fontFamily:"'Fira Code',monospace",color:VB.muted}}>lr = lr₀ × ½(1+cos(πt/T))</div>
            <div style={{fontSize: 11,color:VB.dim}}>{lang==="tr"?"Production'da yaygın. Daha yumuşak azalma.":"Common in production. Smoother decay."}</div>
          </div>
        </div>
      </div>
    </div>
  </VizBox>);
};

const CrossEntropyGraphViz = () => {
  const lang = useLang();
  const pts=[];
  for(let p=0.01;p<=1;p+=0.02) pts.push({p,loss:-Math.log(p)});
  return (<VizBox title={lang === "tr" ? "Cross-Entropy: -log(p) Eğrisi" : "Cross-Entropy: -log(p) Curve"} color="#EF4444">
    <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
      <svg viewBox="-0.5 -0.5 6 5.5" style={{width:220,height:180,background:VB.card,borderRadius:10}}>
        <line x1="0" y1="0" x2="5.5" y2="0" stroke="#ffffff10" strokeWidth="0.03"/>
        <line x1="0" y1="0" x2="0" y2="5" stroke="#ffffff10" strokeWidth="0.03"/>
        <polyline points={pts.map(p=>`${p.p*5},${Math.min(5,p.loss)}`).join(" ")} fill="none" stroke="#EF4444" strokeWidth="0.06" transform="scale(1,-1) translate(0,-5)"/>
        <text x="2.5" y="-0.2" fill={VB.dim} fontSize="0.35" textAnchor="middle">P(target) →</text>
        <text x="5.2" y="4.8" fill="#10B981" fontSize="0.3">loss=0</text>
        <text x="0.1" y="0.3" fill="#EF4444" fontSize="0.3">loss=∞</text>
      </svg>
      <div style={{flex:1,minWidth:180}}>
        <div style={{fontSize: 13,color:VB.muted,lineHeight:1.6,marginBottom:8}}>
          <strong style={{color:"#EF4444"}}>{lang==="tr"?"Sezgi":"Intuition"}:</strong> {lang==="tr"?"P(doğru token) düşükse → model çok şaşırıyor → loss yüksek":"When P(correct token) is low → model is very surprised → high loss"}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {[{p:"1.0",l:"0.00",d:lang === "tr" ? "Mükemmel tahmin" : "Perfect prediction",c:"#10B981"},
            {p:"0.5",l:"0.69",d:lang === "tr" ? "Yarı yarıya" : "Half & half",c:"#F59E0B"},
            {p:"0.037",l:"3.33",d:lang==="tr"?"Rastgele (1/27)":"Random (1/27)",c:"#EF4444"}
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:4,background:`${r.c}08`}}>
              <span style={{fontSize: 13,fontFamily:"'Fira Code',monospace",color:VB.txt,width:48}}>P={r.p}</span>
              <span style={{fontSize: 13,fontFamily:"'Fira Code',monospace",fontWeight:700,color:r.c,width:44}}>L={r.l}</span>
              <span style={{fontSize: 12,color:VB.dim}}>{r.d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </VizBox>);
};

const SamplingViz = () => {
  const lang = useLang();
  const probs=[0.35,0.25,0.15,0.10,0.05,0.04,0.03,0.02,0.01];
  const labels=["a","n","i","e","o","r","s","l","t"];
  return (<VizBox title={lang === "tr" ? "Örnekleme Stratejileri — Greedy vs Top-K vs Top-P" : "Sampling Strategies — Greedy vs Top-K vs Top-P"} color="#6366F1">
    <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
      {[
        {n:"Greedy",d:lang==="tr"?"Her zaman en yüksek":"Always pick highest",k:1,c:"#0EA5E9"},
        {n:"Top-5",d:lang === 'tr' ? "En yüksek 5'ten seç" : "Pick from top 5",k:5,c:"#10B981"},
        {n:"Top-P (0.8)",d:lang === 'tr' ? "Kümülatif %80'e kadar" : "Up to cumulative 80%",k:6,c:"#F59E0B"},
        {n:lang === "tr" ? "Tam Dağılım" : "Full Distribution",d:lang === "tr" ? "Tüm tokenlardan" : "From all tokens",k:9,c:"#8B5CF6"},
      ].map((s,si)=>(
        <div key={si} style={{padding:"8px 10px",borderRadius:8,background:VB.card,minWidth:100}}>
          <div style={{fontSize: 13,fontWeight:700,color:s.c,marginBottom:4}}>{s.n}</div>
          {probs.map((p,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2,opacity:i<s.k?1:0.2}}>
              <span style={{fontSize: 11,fontFamily:"'Fira Code',monospace",color:VB.txt,width:10}}>{labels[i]}</span>
              <div style={{width:60,height:8,background:"rgba(255,255,255,0.03)",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${p*100/.35*60}%`,borderRadius:4,background:i<s.k?s.c:`${s.c}30`}}/>
              </div>
              <span style={{fontSize: 10,fontFamily:"'Fira Code',monospace",color:VB.dim}}>{(p*100).toFixed(0)}%</span>
            </div>
          ))}
          <div style={{fontSize: 10,color:VB.dim,marginTop:4}}>{s.d}</div>
        </div>
      ))}
    </div>
  </VizBox>);
};

const WhatsMissingViz = () => {
  const items=[
    {l:"Batching",from:"1 isim/step",to:"2048/step",c:"#0EA5E9"},
    {l:"GPU Tensors",from:"scalar Value",to:"CUDA tensor",c:"#8B5CF6"},
    {l:"BPE Tokenizer",from:"karakter",to:"subword",c:"#10B981"},
    {l:"Flash Attention",from:"O(n²) bellek",to:"O(n)",c:"#F59E0B"},
    {l:"Mixed Precision",from:"float64",to:"fp16/bf16",c:"#EC4899"},
    {l:"Gradient Clip",from:"yok",to:"max_norm=1",c:"#EF4444"},
  ];
  return (<VizBox title="Bu Kodda Yok → Production'da Var" color="#EF4444">
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:6}}>
      {items.map((it,i)=>(
        <div key={i} style={{padding:"6px 10px",borderRadius:6,borderLeft:`3px solid ${it.c}`,background:`${it.c}06`}}>
          <div style={{fontSize: 13,fontWeight:700,color:it.c}}>{it.l}</div>
          <div style={{fontSize: 11,fontFamily:"'Fira Code',monospace",color:VB.muted,marginTop:2}}>
            <span style={{color:VB.dim}}>{it.from}</span> → <span style={{color:it.c}}>{it.to}</span>
          </div>
        </div>
      ))}
    </div>
    <div style={{marginTop:6,textAlign:"center",fontSize: 12,color:"#10B981",fontWeight:600}}>Ama çekirdek aynı: attention + MLP + residual + norm + CE + Adam</div>
  </VizBox>);
};

const WeightInitViz = () => {
  const vals=useMemo(()=>Array.from({length:80},()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return 0.08*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}),[]);
  const mx=Math.max(...vals.map(Math.abs));
  return (<VizBox title="Gaussian Initialization — N(0, 0.08)" color="#8B5CF6">
    <div style={{display:"flex",gap:3,flexWrap:"wrap",justifyContent:"center"}}>
      {vals.map((v,i)=>(
        <div key={i} style={{width:12,height:24,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{width:10,height:`${(Math.abs(v)/mx)*24}px`,borderRadius:2,background:v>0?"rgba(14,165,233,.5)":"rgba(239,68,68,.5)"}}/>
        </div>
      ))}
    </div>
    <div style={{marginTop:6,display:"flex",gap:12,justifyContent:"center",fontSize: 12,color:VB.muted}}>
      <span><span style={{color:"#0EA5E9"}}>■</span> pozitif</span>
      <span><span style={{color:"#EF4444"}}>■</span> negatif</span>
      <span>std=0.08 → küçük → simetri kırma</span>
    </div>
  </VizBox>);
};


// ─── PEDAGOGICAL ENHANCEMENT COMPONENTS ──────────────────────────
// These components address 6 key gaps:
// 1. WhyBox - "Neden bunu yapıyoruz?" motivasyonu
// 2. BridgeBox - "Geçen hafta X öğrenmiştik" geçiş köprüleri 
// 3. AnalogyBox - Günlük hayat analojileri
// 4. StepByStep - Adım adım sayısal hesaplama
// 5. TryIt* - İnteraktif "kendin dene" widgetları
// 6. ConcreteBox - Soyut kavramları somutlaştırma


// ─── TryIt & Helper Widgets ─────────────────────────────────
const WhyBox = ({ children, color = "#F59E0B" }) => (
  <div style={{ margin: "14px 0", padding: "14px 18px", borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20`, display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>🤔</div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".08em" }}>Neden bunu yapıyoruz?</div>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#CBD5E1" }}>{children}</div>
    </div>
  </div>
);

const BridgeBox = ({ from, to, color = "#8B5CF6" }) => (
  <div style={{ margin: "14px 0", padding: "14px 18px", borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20`, display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>🌉</div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".08em" }}>Köprü — Bağlantıyı Kur</div>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#94A3B8" }}><strong style={{ color: "#0EA5E9" }}>Önceki:</strong> {from}</div>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#CBD5E1", marginTop: 4 }}><strong style={{ color: "#10B981" }}>Şimdi:</strong> {to}</div>
    </div>
  </div>
);

const AnalogyBox = ({ title, children, emoji = "💡", color = "#10B981" }) => (
  <div style={{ margin: "14px 0", padding: "14px 18px", borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20`, display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{emoji}</div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".08em" }}>Günlük Hayat Analojisi: {title}</div>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#CBD5E1" }}>{children}</div>
    </div>
  </div>
);

const ConcreteBox = ({ title, children, color = "#0EA5E9" }) => (
  <div style={{ margin: "14px 0", padding: "14px 18px", borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20` }}>
    <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".08em" }}>🔬 Somutlaştırma: {title}</div>
    <div style={{ fontSize: 15, lineHeight: 1.7, color: "#CBD5E1" }}>{children}</div>
  </div>
);

// ─── INTERACTIVE "TRY IT YOURSELF" WIDGETS ────────────────────────

const TryItTokenizer = () => {
  const [input, setInput] = useState("ali");
  const chars = input.toLowerCase().split("").filter(c => /[a-z]/.test(c));
  const ids = chars.map(c => c.charCodeAt(0) - 97 + 2);
  const withBos = [0, ...ids, 1];
  const pairs = withBos.slice(0, -1).map((id, i) => [id, withBos[i + 1]]);
  const tokName = (id) => id === 0 ? "BOS" : id === 1 ? "EOS" : String.fromCharCode(97 + id - 2);
  return (
    <div style={{ margin: "14px 0", padding: "18px", borderRadius: 14, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 19 }}>🎮</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: ".08em" }}>Kendin Dene: Tokenizer</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 14, color: "#94A3B8", display: "block", marginBottom: 4 }}>Bir isim yaz (İngilizce harfler):</label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 8))}
          maxLength={8}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(0,0,0,0.3)", color: "#E2E8F0", fontSize: 19, fontFamily: "'Fira Code', monospace", fontWeight: 700, width: 200, outline: "none" }}
          placeholder="bir isim yaz..."
        />
      </div>
      {chars.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#64748B", width: 80 }}>1. Karakterler:</span>
            {chars.map((c, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(14,165,233,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700, color: "#0EA5E9", fontFamily: "'Fira Code', monospace" }}>{c}</div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#64748B", width: 80 }}>2. Token ID:</span>
            {ids.map((id, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#10B981", fontFamily: "'Fira Code', monospace" }}>{id}</div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "#64748B", width: 80 }}>3. +BOS/EOS:</span>
            {withBos.map((id, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: (id === 0 || id === 1) ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: (id === 0 || id === 1) ? 10 : 13, fontWeight: 700, color: (id === 0 || id === 1) ? "#F59E0B" : "#10B981", fontFamily: "'Fira Code', monospace" }}>{id === 0 ? "BOS" : id === 1 ? "EOS" : id}</div>
            ))}
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 13, color: "#F59E0B", fontWeight: 600, marginBottom: 6 }}>4. Eğitim Çiftleri (model bunları öğrenir):</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {pairs.map(([a, b], i) => (
                <div key={i} style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(236,72,153,0.1)", fontSize: 14, fontFamily: "'Fira Code', monospace", color: "#EC4899" }}>
                  {tokName(a)}→{tokName(b)}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>Toplam {pairs.length} tahmin adımı. Model her ok için "sonraki ne?" sorusunu öğrenir.</div>
          </div>
        </>
      )}
    </div>
  );
};

const TryItSoftmax = () => {
  const [temp, setTemp] = useState(1.0);
  const [logits, setLogits] = useState([2.0, 1.0, 0.5, -0.5, -1.0]);
  const labels = ["a", "e", "i", "o", "u"];
  const scaled = logits.map(l => l / temp);
  const mx = Math.max(...scaled);
  const exps = scaled.map(v => Math.exp(v - mx));
  const total = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map(v => v / total);
  const maxP = Math.max(...probs);

  return (
    <div style={{ margin: "14px 0", padding: "18px", borderRadius: 14, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 19 }}>🎮</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: ".08em" }}>Kendin Dene: Softmax & Temperature</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 14, color: "#94A3B8", display: "block", marginBottom: 4 }}>Temperature: <strong style={{ color: "#F59E0B", fontFamily: "'Fira Code', monospace" }}>{temp.toFixed(1)}</strong> {temp < 0.5 ? "(çok sivri — neredeyse greedy)" : temp < 1.0 ? "(sivri — yüksek olasılıklılar baskın)" : temp === 1.0 ? "(orijinal dağılım)" : temp < 1.5 ? "(yumuşak — daha rastgele)" : "(çok düz — neredeyse rastgele)"}</label>
        <input type="range" min="0.1" max="3.0" step="0.1" value={temp} onChange={e => setTemp(+e.target.value)} style={{ width: "100%", maxWidth: 300 }} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ minWidth: 200 }}>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>Logits (ham skorlar) — kaydır:</div>
          {logits.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 16, fontSize: 17, fontWeight: 700, color: "#0EA5E9", fontFamily: "'Fira Code', monospace" }}>{labels[i]}</span>
              <input type="range" min="-3" max="5" step="0.1" value={l} onChange={e => { const n = [...logits]; n[i] = +e.target.value; setLogits(n); }} style={{ width: 100 }} />
              <span style={{ width: 36, fontSize: 14, fontFamily: "'Fira Code', monospace", color: "#94A3B8" }}>{l.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <div style={{ minWidth: 200 }}>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>Softmax olasılıkları:</div>
          {probs.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, height: 26 }}>
              <span style={{ width: 16, fontSize: 17, fontWeight: 700, color: p === maxP ? "#10B981" : "#94A3B8", fontFamily: "'Fira Code', monospace" }}>{labels[i]}</span>
              <div style={{ flex: 1, height: 16, background: "rgba(255,255,255,0.04)", borderRadius: 8, overflow: "hidden", maxWidth: 150 }}>
                <div style={{ height: "100%", width: `${p * 100}%`, borderRadius: 8, background: p === maxP ? "#10B981" : "#0EA5E9", transition: "width .3s" }} />
              </div>
              <span style={{ width: 48, fontSize: 14, fontFamily: "'Fira Code', monospace", color: p === maxP ? "#10B981" : "#94A3B8", fontWeight: p === maxP ? 700 : 400 }}>{(p * 100).toFixed(1)}%</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Toplam: {(probs.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%</div>
        </div>
      </div>
      <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.2)", fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
        <strong style={{ color: "#F59E0B" }}>Gözlem: </strong>
        {temp < 0.5 ? "Çok düşük T → en yüksek skorlu token neredeyse %100 olasılık alıyor. Model hep aynı şeyi üretir." :
         temp < 1.0 ? "Düşük T → farklar büyütülüyor. Yüksek skorlular daha baskın. Güvenli üretim." :
         temp === 1.0 ? "T=1 → orijinal model dağılımı. Eğitimde öğrenilen olasılıklar aynen korunuyor." :
         temp < 2.0 ? "Yüksek T → farklar küçülüyor. Düşük olasılıklı tokenlar da şans kazanıyor. Yaratıcı ama riskli." :
         "Çok yüksek T → neredeyse uniform dağılım. Üretim rastgeleye yakın. Genelde anlamsız çıktılar."}
      </div>
    </div>
  );
};

const TryItDotProduct = () => {
  const [q, setQ] = useState([0.5, 0.3, -0.2, 0.4]);
  const [k, setK] = useState([0.4, 0.2, -0.1, 0.3]);
  const products = q.map((v, i) => v * k[i]);
  const dot = products.reduce((a, b) => a + b, 0);
  const norm = Math.sqrt(4);
  const scaled = dot / norm;
  return (
    <div style={{ margin: "14px 0", padding: "18px", borderRadius: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 19 }}>🎮</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: ".08em" }}>Kendin Dene: Dot Product (Attention Skoru)</span>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: "#10B981", fontWeight: 600, marginBottom: 4 }}>Query (Q) — "ne arıyorum?"</div>
          {q.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
              <span style={{ fontSize: 12, color: "#64748B", width: 14 }}>q{i}</span>
              <input type="range" min="-1" max="1" step="0.1" value={v} onChange={e => { const n = [...q]; n[i] = +e.target.value; setQ(n); }} style={{ width: 80 }} />
              <span style={{ width: 30, fontSize: 13, fontFamily: "'Fira Code', monospace", color: "#10B981" }}>{v.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, color: "#F59E0B", fontWeight: 600, marginBottom: 4 }}>Key (K) — "bende ne var?"</div>
          {k.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
              <span style={{ fontSize: 12, color: "#64748B", width: 14 }}>k{i}</span>
              <input type="range" min="-1" max="1" step="0.1" value={v} onChange={e => { const n = [...k]; n[i] = +e.target.value; setK(n); }} style={{ width: 80 }} />
              <span style={{ width: 30, fontSize: 13, fontFamily: "'Fira Code', monospace", color: "#F59E0B" }}>{v.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>Adım adım hesaplama:</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6, alignItems: "center" }}>
          {products.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", color: "#10B981" }}>{q[i].toFixed(1)}</span>
              <span style={{ fontSize: 13, color: "#64748B" }}>×</span>
              <span style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", color: "#F59E0B" }}>{k[i].toFixed(1)}</span>
              <span style={{ fontSize: 13, color: "#64748B" }}>=</span>
              <span style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", color: "#EC4899", fontWeight: 700 }}>{p.toFixed(2)}</span>
              {i < products.length - 1 && <span style={{ fontSize: 13, color: "#64748B", marginLeft: 4 }}>+</span>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 15, fontFamily: "'Fira Code', monospace" }}>
            <span style={{ color: "#94A3B8" }}>Q · K = </span><span style={{ color: "#0EA5E9", fontWeight: 700 }}>{dot.toFixed(3)}</span>
          </div>
          <div style={{ fontSize: 15, fontFamily: "'Fira Code', monospace" }}>
            <span style={{ color: "#94A3B8" }}>÷ √d = ÷ {norm.toFixed(1)} = </span><span style={{ color: "#EF4444", fontWeight: 700 }}>{scaled.toFixed(3)}</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 8 }}>
          {scaled > 0.3 ? "🔥 Yüksek skor → bu token'a çok dikkat edilecek!" :
           scaled > 0 ? "👀 Orta skor → biraz dikkat edilecek." :
           scaled > -0.2 ? "😐 Düşük skor → az dikkat edilecek." :
           "❄️ Negatif skor → neredeyse hiç dikkat edilmeyecek."}
          <span style={{ color: "#475569" }}> Q ve K'yı kaydırarak skoru değiştir — aynı yönler yüksek, ters yönler düşük skor verir!</span>
        </div>
      </div>
    </div>
  );
};

const TryItGradient = () => {
  const lang = useLang();
  const [x, setX] = useState(3.0);
  const [lr, setLr] = useState(0.1);
  const [history, setHistory] = useState([3.0]);
  const f = v => v * v;
  const grad = v => 2 * v;
  const doStep = () => {
    const newX = x - lr * grad(x);
    setX(Math.round(newX * 1000) / 1000);
    setHistory(h => [...h.slice(-15), newX]);
  };
  const reset = () => { setX(3.0); setHistory([3.0]); };
  const pts = [];
  for (let v = -4; v <= 4; v += 0.15) pts.push({ x: v, y: f(v) });
  const svgW = 280, svgH = 140;
  const toSVG = (px, py) => ({ sx: ((px + 4) / 8) * svgW, sy: svgH - (py / 16) * svgH });
  return (
    <div style={{ margin: "14px 0", padding: "18px", borderRadius: 14, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 19 }}>🎮</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", letterSpacing: ".08em" }}>Kendin Dene: Gradient Descent</span>
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <svg width={svgW} height={svgH} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10 }}>
            <polyline points={pts.map(p => { const s = toSVG(p.x, p.y); return `${s.sx},${s.sy}`; }).join(" ")} fill="none" stroke="#8B5CF6" strokeWidth="2" />
            {history.map((hx, i) => { const s = toSVG(hx, f(hx)); return <circle key={i} cx={s.sx} cy={s.sy} r={i === history.length - 1 ? 6 : 3} fill={i === history.length - 1 ? "#EF4444" : "rgba(239,68,68,0.3)"} />; })}
            {history.length > 1 && history.slice(0, -1).map((hx, i) => { const s1 = toSVG(hx, f(hx)); const s2 = toSVG(history[i + 1], f(history[i + 1])); return <line key={i} x1={s1.sx} y1={s1.sy} x2={s2.sx} y2={s2.sy} stroke="rgba(239,68,68,0.4)" strokeWidth="1" strokeDasharray="3,2" />; })}
            <text x="4" y="14" fill="#8B5CF6" fontSize="10">f(x) = x²</text>
            <text x="4" y={svgH - 4} fill="#64748B" fontSize="9">min = 0</text>
          </svg>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button onClick={doStep} style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: "#EF4444", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Bir Adım At →</button>
            <button onClick={reset} style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94A3B8", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{lang === "tr" ? "Sıfırla" : "Reset"}</button>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 13, color: "#94A3B8" }}>Learning Rate: <strong style={{ color: "#F59E0B" }}>{lr.toFixed(2)}</strong></label>
            <input type="range" min="0.01" max="1.5" step="0.01" value={lr} onChange={e => setLr(+e.target.value)} style={{ width: "100%", maxWidth: 200, display: "block" }} />
            <span style={{ fontSize: 12, color: "#475569" }}>{lr > 1 ? (lang==="tr"?"⚠️ Çok büyük — patlayabilir!":"⚠️ Too large — may explode!") : lr > 0.3 ? (lang==="tr"?"Hızlı ama riskli":"Fast but risky") : lr > 0.05 ? (lang==="tr"?"İyi denge":"Good balance") : (lang==="tr"?"Çok yavaş ama güvenli":"Very slow but safe")}</span>
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(0,0,0,0.2)", fontSize: 14, fontFamily: "'Fira Code', monospace" }}>
            <div style={{ color: "#94A3B8" }}>x = <span style={{ color: "#0EA5E9", fontWeight: 700 }}>{x.toFixed(3)}</span></div>
            <div style={{ color: "#94A3B8" }}>f(x) = x² = <span style={{ color: "#8B5CF6", fontWeight: 700 }}>{f(x).toFixed(3)}</span></div>
            <div style={{ color: "#94A3B8" }}>gradient = 2x = <span style={{ color: "#F59E0B", fontWeight: 700 }}>{grad(x).toFixed(3)}</span></div>
            <div style={{ color: "#94A3B8", marginTop: 4 }}>x_yeni = {x.toFixed(3)} - {lr.toFixed(2)} × {grad(x).toFixed(3)}</div>
            <div style={{ color: "#10B981", fontWeight: 700 }}>= {(x - lr * grad(x)).toFixed(3)}</div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#64748B" }}>
            Adım sayısı: {history.length - 1} | Hedef: x = 0 (minimum)
          </div>
          <div style={{ marginTop: 4, fontSize: 13, color: "#94A3B8" }}>
            💡 LR'ı 1.0+ yapıp "patlama"yı gözlemle. Sonra 0.1'e düşürüp nasıl yakınsadığını izle.
          </div>
        </div>
      </div>
    </div>
  );
};

const TryItEmbedding = () => {
  const [tokId, setTokId] = useState(2);
  const [posId, setPosId] = useState(0);
  const rng = (s) => { let st = s; return () => { st = (st * 16807 + 13) % 2147483647; return ((st - 1) / 2147483646 - 0.5) * 0.16; }; };
  const tEmb = useMemo(() => { const r = rng(tokId * 997 + 42); return Array.from({ length: 16 }, () => Math.round(r() * 1000) / 1000); }, [tokId]);
  const pEmb = useMemo(() => { const r = rng(posId * 503 + 77); return Array.from({ length: 16 }, () => Math.round(r() * 500) / 1000); }, [posId]);
  const combined = tEmb.map((v, i) => Math.round((v + pEmb[i]) * 1000) / 1000);
  const chName = tokId === 0 ? "BOS" : tokId === 1 ? "EOS" : String.fromCharCode(95 + tokId);
  const mx = Math.max(...[...tEmb, ...pEmb, ...combined].map(Math.abs), 0.001);
  const Bar = ({ v, color }) => <div style={{ width: 14, height: 28, borderRadius: 3, background: v > 0 ? `rgba(${color},${Math.abs(v) / mx})` : `rgba(${color.split(",").map(c => Math.min(255, parseInt(c) + 80)).join(",")},${Math.abs(v) / mx})`, transition: "all .3s" }} title={v.toFixed(3)} />;

  return (
    <div style={{ margin: "14px 0", padding: "18px", borderRadius: 14, background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 19 }}>🎮</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: ".08em" }}>Kendin Dene: Embedding Lookup</span>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: 13, color: "#0EA5E9" }}>Token: <strong>{chName}</strong> (ID={tokId})</label>
          <input type="range" min="0" max="27" step="1" value={tokId} onChange={e => setTokId(+e.target.value)} style={{ width: 150, display: "block" }} />
        </div>
        <div>
          <label style={{ fontSize: 13, color: "#8B5CF6" }}>Pozisyon: <strong>{posId}</strong></label>
          <input type="range" min="0" max="7" step="1" value={posId} onChange={e => setPosId(+e.target.value)} style={{ width: 150, display: "block" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, color: "#0EA5E9", fontWeight: 600, marginBottom: 4 }}>wte[{tokId}] Token Emb</div>
          <div style={{ display: "flex", gap: 2 }}>{tEmb.map((v, i) => <Bar key={i} v={v} color="14,165,233" />)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", height: 42, fontSize: 21, color: "#64748B", fontWeight: 700 }}>+</div>
        <div>
          <div style={{ fontSize: 13, color: "#8B5CF6", fontWeight: 600, marginBottom: 4 }}>wpe[{posId}] Pos Emb</div>
          <div style={{ display: "flex", gap: 2 }}>{pEmb.map((v, i) => <Bar key={i} v={v} color="139,92,246" />)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", height: 42, fontSize: 21, color: "#64748B", fontWeight: 700 }}>=</div>
        <div>
          <div style={{ fontSize: 13, color: "#10B981", fontWeight: 600, marginBottom: 4 }}>x (girdi vektörü)</div>
          <div style={{ display: "flex", gap: 2 }}>{combined.map((v, i) => <Bar key={i} v={v} color="16,185,129" />)}</div>
        </div>
      </div>
      <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.2)", fontSize: 13, color: "#94A3B8" }}>
        💡 Token ve pozisyonu değiştirerek vektörlerin nasıl farklılaştığını gözlemle. Aynı harf farklı pozisyonlarda farklı vektör alır!
      </div>
    </div>
  );
};

const StepByStepCalc = ({ title, steps, color = "#F59E0B" }) => {
  const lang = useLang();
  const [step, setStep] = useState(0);
  return (
    <div style={{ margin: "14px 0", padding: "18px", borderRadius: 14, background: `${color}06`, border: `1px solid ${color}20` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 19 }}>🔢</span>
        <span style={{ fontSize: 15, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: ".08em" }}>Adım Adım: {title}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 10px", borderRadius: 8, background: i <= step ? `${color}10` : "transparent", opacity: i <= step ? 1 : 0.3, transition: "all .3s", cursor: "pointer" }} onClick={() => setStep(i)}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: i <= step ? color : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: i <= step ? "#fff" : "#475569", flexShrink: 0 }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: i <= step ? color : "#475569" }}>{s.label}</div>
              {i <= step && <div style={{ fontSize: 15, fontFamily: "'Fira Code', monospace", color: "#E2E8F0", marginTop: 2 }}>{s.calc}</div>}
              {i <= step && s.note && <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{s.note}</div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step <= 0} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: step > 0 ? "#94A3B8" : "#1E293B", fontSize: 13, fontWeight: 600, cursor: step > 0 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>{lang === "tr" ? "← Önceki" : "← Previous"}</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: step < steps.length - 1 ? color : "#1E293B", color: "#fff", fontSize: 13, fontWeight: 600, cursor: step < steps.length - 1 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>{lang === "tr" ? "Sonraki →" : "Next →"}</button>
        <button onClick={() => setStep(steps.length - 1)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#94A3B8", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Tümü</button>
      </div>
    </div>
  );
};

// ─── SECTION ENHANCEMENT DATA ────────────────────────────────────
// Maps sectionKey → extra pedagogical content

const TryItParams = () => {
  const [nEmbd, setNEmbd] = useState(16);
  const [nLayer, setNLayer] = useState(1);
  const [nHead, setNHead] = useState(4);
  const [blockSize, setBlockSize] = useState(8);
  const [lr, setLr] = useState(0.01);
  const vocabSize = 28;

  const headDim = nEmbd / nHead;
  const validHead = nEmbd % nHead === 0;

  // Calculate parameter count
  const wte = vocabSize * nEmbd;
  const wpe = blockSize * nEmbd;
  const perLayer = nEmbd * nEmbd * 4 + 4 * nEmbd * nEmbd; // attn(Wq,Wk,Wv,Wo) + mlp(fc1: n_embd*4*n_embd + fc2: 4*n_embd*n_embd)
  const attnParams = nEmbd * nEmbd * 4; // Wq, Wk, Wv, Wo each n_embd×n_embd
  const mlpParams = nEmbd * (4 * nEmbd) + (4 * nEmbd) * nEmbd;
  const layerParams = attnParams + mlpParams;
  const totalParams = wte + wpe + layerParams * nLayer;

  const memKB = (totalParams * 4 / 1024).toFixed(1);

  const lrFeedback = lr >= 0.1 ? "⚠️ Çok yüksek! Model patlayabilir" : lr <= 0.0001 ? "🐌 Çok düşük — eğitim çok yavaş olur" : lr <= 0.001 ? "🐢 Güvenli ama yavaş" : "✅ İyi denge";

  return (
    <div style={{ margin: "18px 0", padding: 20, borderRadius: 16, background: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.15)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 19 }}>🎛️</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: ".06em" }}>Parametre Laboratuvarı</span>
        <span style={{ fontSize: 13, color: "#64748B" }}>— kaydırıcıları değiştirin, etkiyi görün</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {/* n_embd */}
        <div style={{ padding: 12, borderRadius: 10, background: "rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0EA5E9" }}>n_embd</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#E2E8F0", fontFamily: "'Fira Code', monospace" }}>{nEmbd}</span>
          </div>
          <input type="range" min={4} max={128} step={4} value={nEmbd} onChange={e => { const v = +e.target.value; setNEmbd(v); if (v % nHead !== 0) setNHead(Math.max(1, Math.min(v, nHead))); }} style={{ width: "100%", accentColor: "#0EA5E9" }} />
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Embedding boyutu (4-128)</div>
        </div>

        {/* n_layer */}
        <div style={{ padding: 12, borderRadius: 10, background: "rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#8B5CF6" }}>n_layer</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#E2E8F0", fontFamily: "'Fira Code', monospace" }}>{nLayer}</span>
          </div>
          <input type="range" min={1} max={12} value={nLayer} onChange={e => setNLayer(+e.target.value)} style={{ width: "100%", accentColor: "#8B5CF6" }} />
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Katman sayısı (1-12)</div>
        </div>

        {/* n_head */}
        <div style={{ padding: 12, borderRadius: 10, background: "rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>n_head</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: validHead ? "#E2E8F0" : "#EF4444", fontFamily: "'Fira Code', monospace" }}>{nHead}</span>
          </div>
          <input type="range" min={1} max={16} value={nHead} onChange={e => setNHead(+e.target.value)} style={{ width: "100%", accentColor: "#10B981" }} />
          <div style={{ fontSize: 12, color: validHead ? "#64748B" : "#EF4444", marginTop: 2 }}>
            {validHead ? `Head sayısı → head_dim = ${nEmbd}/${nHead} = ${headDim}` : `⚠️ n_embd(${nEmbd}) % n_head(${nHead}) ≠ 0!`}
          </div>
        </div>

        {/* block_size */}
        <div style={{ padding: 12, borderRadius: 10, background: "rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#EC4899" }}>block_size</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#E2E8F0", fontFamily: "'Fira Code', monospace" }}>{blockSize}</span>
          </div>
          <input type="range" min={4} max={64} value={blockSize} onChange={e => setBlockSize(+e.target.value)} style={{ width: "100%", accentColor: "#EC4899" }} />
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Context window (4-64 token)</div>
        </div>

        {/* learning_rate */}
        <div style={{ padding: 12, borderRadius: 10, background: "rgba(0,0,0,0.15)", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>learning_rate</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#E2E8F0", fontFamily: "'Fira Code', monospace" }}>{lr}</span>
          </div>
          <input type="range" min={0.0001} max={0.2} step={0.0001} value={lr} onChange={e => setLr(+parseFloat(e.target.value).toFixed(4))} style={{ width: "100%", accentColor: "#F59E0B" }} />
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{lrFeedback}</div>
        </div>
      </div>

      {/* Results panel */}
      <div style={{ padding: 14, borderRadius: 12, background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0EA5E9", marginBottom: 8 }}>📊 Hesaplanan Model Boyutu</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div style={{ textAlign: "center", padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 21, fontWeight: 800, color: "#E2E8F0", fontFamily: "'Fira Code', monospace" }}>{totalParams.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>TOPLAM PARAMETRE</div>
          </div>
          <div style={{ textAlign: "center", padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 21, fontWeight: 800, color: "#8B5CF6", fontFamily: "'Fira Code', monospace" }}>{memKB} KB</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>BELLEK (float32)</div>
          </div>
          <div style={{ textAlign: "center", padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 21, fontWeight: 800, color: "#10B981", fontFamily: "'Fira Code', monospace" }}>{validHead ? headDim : "—"}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>HEAD DIM</div>
          </div>
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "#64748B" }}>wte (token emb)</span>
            <span style={{ color: "#94A3B8", fontFamily: "'Fira Code', monospace" }}>{vocabSize}×{nEmbd} = {wte.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "#64748B" }}>wpe (pos emb)</span>
            <span style={{ color: "#94A3B8", fontFamily: "'Fira Code', monospace" }}>{blockSize}×{nEmbd} = {wpe.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "#64748B" }}>attention (Wq+Wk+Wv+Wo)</span>
            <span style={{ color: "#94A3B8", fontFamily: "'Fira Code', monospace" }}>4×{nEmbd}×{nEmbd} = {attnParams.toLocaleString()} × {nLayer}L</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "#64748B" }}>mlp (fc1+fc2)</span>
            <span style={{ color: "#94A3B8", fontFamily: "'Fira Code', monospace" }}>{nEmbd}×{4 * nEmbd} + {4 * nEmbd}×{nEmbd} = {mlpParams.toLocaleString()} × {nLayer}L</span>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#64748B", fontStyle: "italic" }}>
          {totalParams <= 5000 ? "🟢 Çok küçük — saniyeler içinde eğitilir" :
           totalParams <= 50000 ? "🟡 Orta — birkaç dakika CPU'da" :
           totalParams <= 500000 ? "🟠 Büyükçe — 30+ dk CPU, GPU önerilir" :
           "🔴 Çok büyük — saf Python ile saatler sürer, PyTorch/GPU şart"}
        </div>
      </div>

      {/* Command line preview */}
      <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "#0D1117", fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#7EE787" }}>
        $ python3 microgpt.py --n_embd {nEmbd} --n_layer {nLayer} --n_head {nHead} --block_size {blockSize} --learning_rate {lr}
      </div>
    </div>
  );
};

// ─── REAL CODE MAPPING — microgpt.py gerçek kod parçaları ───────

// ─── Week 0 Animated Viz ─────────────────────────────────────
const TrainingEvolutionViz = () => {
  const lang = useLang();
  const [epoch, setEpoch] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stages = [
    { step: 1, loss: 3.33, names: ["xqwpzml","jivrty","bnkcfe"], label: lang === "tr" ? "Rastgele Başlangıç" : "Random Start", color: "#EF4444",
      learned: "Hiçbir şey — tüm ağırlıklar rastgele. 27 tokendan uniform örnekleme: P(her token) ≈ 1/27 = 3.7%",
      insight: "Başlangıç loss = -log(1/27) = 3.33 → model tamamen şaşkın, her token eşit olası" },
    { step: 10, loss: 3.10, names: ["llmyi","aeonnt","ukssde"], label: lang === "tr" ? "Harf Frekansları" : "Letter Frequencies", color: "#EF4444",
      learned: "Sık harfler keşfedildi: 'a', 'e', 'i' daha olası hale geldi. Nadir harfler ('q','x','z') azaldı.",
      insight: "Model henüz sıra bilmiyor ama İngilizce'de hangi harfler yaygın bilmeye başladı" },
    { step: 50, loss: 2.80, names: ["torena","gnaria","melon"], label: lang === "tr" ? "Sesli-Ünsüz Kalıbı" : "Vowel-Consonant Pattern", color: "#F59E0B",
      learned: "Ünsüz+sesli alternasyonu öğrenildi: 'to-re-na'. Çift ünsüz ('gn') hâlâ sorunlu.",
      insight: "Dikkat mekanizması çalışmaya başladı — bir önceki harfe bakarak sonraki türü tahmin ediyor" },
    { step: 100, loss: 2.50, names: ["toman","sariel","jenna"], label: lang === "tr" ? "İsim Yapısı" : "Name Structure", color: "#F59E0B",
      learned: "İsim uzunlukları doğallaştı (4-6 harf). '-el', '-an', '-na' gibi yaygın sonekler öğrenildi.",
      insight: "EOS tahmini iyileşti — model ne zaman durması gerektiğini biliyor" },
    { step: 200, loss: 2.30, names: ["marin","della","kiran"], label: lang === "tr" ? "Gerçekçi İsimler" : "Realistic Names", color: "#10B981",
      learned: "'della', 'kiran' gerçek isimlere çok benzer. Çift harf kalıpları ('ll','nn') doğru kullanılıyor.",
      insight: "Model İngilizce isim fonotaktiğini öğrendi — hangi harf kombinasyonları 'isim gibi' hissettiriyor" },
    { step: 500, loss: 2.10, names: ["kamrin","jede","quila"], label: lang === "tr" ? "Yaratıcı Üretim" : "Creative Generation", color: "#10B981",
      learned: "Veride olmayan AMA yapıya uyan isimler: 'kamrin', 'quila'. Model genelleme yapıyor!",
      insight: "Overfitting yok — model ezberlemiyor, KURAL öğreniyor. Bu generalization'ın özü" },
    { step: 1000, loss: 2.00, names: ["ellora","bryn","asha"], label: "Tam Model", color: "#0EA5E9",
      learned: "'asha' (Sanskritçe), 'bryn' (Galce), 'ellora' (İtalyan) — farklı kültürel kalıplar bile öğrenildi.",
      insight: "3,648 parametre ile bu kadar zengin kalıp öğrenmek → ölçeklemenin gücünü hayal edin (175B parametre!)" },
  ];
  const s = stages[epoch];
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setEpoch(e => { if (e >= stages.length - 1) { setPlaying(false); return e; } return e + 1; }), 2000);
    return () => clearInterval(t);
  }, [playing]);
  return (<VizBox title={lang === "tr" ? "Eğitim Evrimi — Model Nasıl Öğreniyor?" : "Training Evolution — How Does the Model Learn?"} color="#10B981">
    <div style={{fontSize:13,color:"#94A3B8",marginBottom:8}}>{lang === "tr" ? "▶ butonuna basın ve modelin adım adım öğrenme sürecini izleyin. Kaydırıcıyla istediğiniz aşamaya atlayın." : "Press ▶ and watch the model learn step by step. Use the slider to jump to any stage."}</div>
    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:220}}>
        <div style={{fontSize:13,color:"#94A3B8",marginBottom:6}}>{lang === "tr" ? "Loss Eğrisi" : "Loss Curve"}</div>
        <svg viewBox="0 0 200 80" style={{width:"100%",height:100}}>
          <line x1="20" y1="5" x2="20" y2="70" stroke="#1E293B" strokeWidth="0.5"/>
          <line x1="20" y1="70" x2="195" y2="70" stroke="#1E293B" strokeWidth="0.5"/>
          <text x="5" y="12" fill="#64748B" fontSize="5">3.3</text>
          <text x="5" y="70" fill="#64748B" fontSize="5">2.0</text>
          {stages.map((st, i) => {
            const x = 20 + (i / (stages.length - 1)) * 170;
            const y = ((3.33 - st.loss) / 1.33) * 60;
            return (<g key={i}>
              {i > 0 && <line x1={20+((i-1)/(stages.length-1))*170} y1={70-((3.33-stages[i-1].loss)/1.33)*60} x2={x} y2={70-y} stroke={i<=epoch?st.color:"#1E293B30"} strokeWidth={i<=epoch?1.5:0.5} style={{transition:"all .5s"}}/>}
              <circle cx={x} cy={70-y} r={i===epoch?4:2.5} fill={i<=epoch?st.color:"#1E293B"} stroke={st.color} strokeWidth={i===epoch?1.5:0.5} style={{transition:"all .5s"}}/>
            </g>);
          })}
        </svg>
      </div>
      <div style={{flex:1,minWidth:240}}>
        <div style={{padding:14,borderRadius:12,background:`${s.color}10`,border:`1.5px solid ${s.color}30`,transition:"all .4s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:13,color:"#64748B"}}>Adım {s.step}</span>
            <span style={{fontSize:23,fontWeight:800,color:s.color,fontFamily:"'Fira Code',monospace"}}>{s.loss.toFixed(2)}</span>
          </div>
          <div style={{fontSize:14,fontWeight:700,color:s.color,marginBottom:8}}>{s.label}</div>
          <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:10}}>
            {s.names.map((n,i) => (<div key={i} style={{padding:"4px 10px",borderRadius:6,background:"rgba(0,0,0,0.2)",fontSize:16,fontFamily:"'Fira Code',monospace",fontWeight:700,color:"#E2E8F0"}}>{n}</div>))}
          </div>
          <div style={{padding:"8px 10px",borderRadius:8,background:"rgba(139,92,246,.06)",marginBottom:6}}>
            <div style={{fontSize:11,color:"#A78BFA",fontWeight:700,marginBottom:2}}>{lang === "tr" ? "NE ÖĞRENDİ?" : "WHAT DID IT LEARN?"}</div>
            <div style={{fontSize:13,color:"#C4B5FD",lineHeight:1.5}}>{s.learned}</div>
          </div>
          <div style={{padding:"6px 10px",borderRadius:8,background:"rgba(251,191,36,.05)",borderLeft:"3px solid rgba(251,191,36,.3)"}}>
            <div style={{fontSize:12,color:"#FBBF24",lineHeight:1.5}}>{s.insight}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"center",alignItems:"center"}}>
          <button onClick={()=>{setEpoch(0);setPlaying(true);}} style={{padding:"6px 16px",borderRadius:8,border:"none",background:"#10B981",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lang === "tr" ? "▶ Başlat" : "▶ Start"}</button>
          <button onClick={()=>setPlaying(false)} style={{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>⏸</button>
          <input type="range" min={0} max={stages.length-1} value={epoch} onChange={e=>{setPlaying(false);setEpoch(+e.target.value);}} style={{flex:1,accentColor:"#10B981"}}/>
        </div>
      </div>
    </div>
  </VizBox>);
};

const GPTScaleTowerViz = () => {
  const lang = useLang();
  const [hov, setHov] = useState(0);
  const models = [
    {name:"microGPT",params:3648,layers:1,embd:16,ctx:8,year:"2024",color:"#0EA5E9",h:8,
     can:"Türk ismi üretebilir (5-6 harf). Fonotaktik kalıpları öğrenir.",
     cant:"Cümle kuramaz. Anlam bilmez. Sadece harf kalıpları."},
    {name:"GPT-1",params:117e6,layers:12,embd:768,ctx:512,year:"2018",color:"#8B5CF6",h:30,
     can:"Basit cümleler kurabilir. Metin sınıflandırma yapabilir.",
     cant:"Uzun mantık zincirleri kuramaz. Sıkça çelişir."},
    {name:"GPT-2",params:1.5e9,layers:48,embd:1600,ctx:1024,year:"2019",color:"#10B981",h:50,
     can:"Tutarlı paragraflar yazabilir. Basit soru-cevap yapabilir.",
     cant:"Matematiksel akıl yürütme zayıf. Halüsinasyon yaygın."},
    {name:"GPT-3",params:175e9,layers:96,embd:12288,ctx:2048,year:"2020",color:"#F59E0B",h:75,
     can:"Few-shot öğrenme: birkaç örnekle yeni görevler yapabilir. Kod yazabilir.",
     cant:"Güvenilir değil. Güncel bilgi yok. Uzun bağlam sınırlı."},
    {name:"GPT-4",params:1e12,layers:120,embd:16384,ctx:131072,year:"2023",color:"#EF4444",h:95,
     can:"Tıp sınavını geçer. Kod debug eder. 128K bağlam. Görüntü anlayabilir.",
     cant:"Tam güvenilir değil. Hesaplama pahalı. Eğitim maliyeti ~$100M+."},
  ];
  const fmtP = p => p<1e6?`${(p/1e3).toFixed(1)}K`:p<1e9?`${(p/1e6).toFixed(0)}M`:p<1e12?`${(p/1e9).toFixed(0)}B`:`~${(p/1e12).toFixed(0)}T+`;
  const m = models[hov];
  return (<VizBox title={lang === "tr" ? "GPT Ailesi — Ölçek Kulesi" : "GPT Family — Scale Tower"} color="#6366F1">
    <div style={{fontSize:13,color:"#94A3B8",marginBottom:10}}>Her sütunun üzerine gelin — o modelin yeteneklerini ve sınırlarını görün.</div>
    <div style={{display:"flex",gap:8,alignItems:"flex-end",justifyContent:"center",height:130,marginBottom:10}}>
      {models.map((md,i) => (
        <div key={i} onMouseEnter={()=>setHov(i)} onClick={()=>setHov(i)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",transform:hov===i?"scale(1.08)":"scale(1)",transition:"all .3s"}}>
          <div style={{fontSize:12,fontWeight:700,color:md.color,textAlign:"center"}}>{md.name}</div>
          <div style={{width:40+i*12,height:md.h+(hov===i?8:0),borderRadius:"8px 8px 0 0",background:`linear-gradient(180deg,${md.color}40,${md.color}15)`,border:`1.5px solid ${md.color}50`,borderBottom:"none",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .4s"}}>
            <span style={{fontSize:13,fontWeight:800,color:md.color,fontFamily:"'Fira Code',monospace"}}>{fmtP(md.params)}</span>
          </div>
        </div>
      ))}
    </div>
    <div style={{padding:12,borderRadius:12,background:`${m.color}08`,border:`1.5px solid ${m.color}20`,transition:"all .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:18,fontWeight:800,color:m.color}}>{m.name}</span>
        <span style={{fontSize:13,color:"#64748B"}}>{m.year}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
        {[{l:"Katman",v:m.layers},{l:"Embedding",v:m.embd.toLocaleString()},{l:"Context",v:m.ctx.toLocaleString()}].map((item,i)=>(
          <div key={i} style={{textAlign:"center",padding:"4px 0",borderRadius:6,background:"rgba(0,0,0,.2)"}}>
            <div style={{fontSize:17,fontWeight:800,color:m.color,fontFamily:"'Fira Code',monospace"}}>{item.v}</div>
            <div style={{fontSize:11,color:"#64748B"}}>{item.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:160,padding:"8px 10px",borderRadius:8,background:"rgba(16,185,129,.06)"}}>
          <div style={{fontSize:11,color:"#10B981",fontWeight:700,marginBottom:2}}>{lang === "tr" ? "✅ YAPABİLİR" : "✅ CAN DO"}</div>
          <div style={{fontSize:12,color:"#A7F3D0",lineHeight:1.5}}>{m.can}</div>
        </div>
        <div style={{flex:1,minWidth:160,padding:"8px 10px",borderRadius:8,background:"rgba(239,68,68,.06)"}}>
          <div style={{fontSize:11,color:"#EF4444",fontWeight:700,marginBottom:2}}>❌ YAPAMAZ</div>
          <div style={{fontSize:12,color:"#FCA5A5",lineHeight:1.5}}>{m.cant}</div>
        </div>
      </div>
    </div>
    <div style={{marginTop:8,padding:"6px 12px",borderRadius:8,background:"rgba(14,165,233,.06)",textAlign:"center"}}><span style={{fontSize:13,color:"#0EA5E9"}}>Algoritma aynı — fark sadece ölçek. Bu kodu anlarsanız GPT-4'ü de anlarsınız.</span></div>
  </VizBox>);
};

const FrameworkCompareViz = () => {
  const lang = useLang();
  const [showInner, setShowInner] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const mappings = [
    {fw:"loss = criterion(out, target)",mc:"CE = -log(P(target))",color:"#EF4444",desc:"Cross-entropy kaybı hesapla: model doğru tokene ne kadar olasılık verdi?"},
    {fw:"loss.backward()",mc:"topo sort → chain rule → grad +=",color:"#F59E0B",desc:"Hesaplama grafını tersten yürü, her parametre için gradyan hesapla (3,648 değer)"},
    {fw:"optimizer.step()",mc:"w -= lr × m̂/(√v̂+ε); grad=0",color:"#10B981",desc:"Adam: momentum + adaptif lr ile ağırlıkları güncelle, sonra gradyanları sıfırla"},
  ];
  return (<VizBox title={lang === "tr" ? "Sıfırdan vs Framework — Ne Gizleniyor?" : "From Scratch vs Framework — What\'s Hidden?"} color="#F59E0B">
    <div style={{fontSize:13,color:"#94A3B8",marginBottom:10,lineHeight:1.6}}>
      PyTorch bu 3 satırın arkasında <strong style={{color:"#F59E0B"}}>yüzlerce satır</strong> kod gizler. microGPT'de her satırı kendiniz yazıyorsunuz — böylece gerçekten anlıyorsunuz.
    </div>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:200}}>
        <div style={{fontSize:14,fontWeight:700,color:"#8B5CF6",marginBottom:6}}>🏭 PyTorch (3 satır)</div>
        <div style={{padding:10,borderRadius:10,background:"#0D1117"}}>
          {mappings.map((m,i)=>(<div key={i} onMouseEnter={()=>setHighlight(i)} onMouseLeave={()=>setHighlight(-1)} style={{padding:"6px 8px",borderRadius:6,marginBottom:2,cursor:"pointer",fontFamily:"'Fira Code',monospace",fontSize:14,lineHeight:1.8,color:m.color,background:highlight===i?`${m.color}15`:"transparent",transition:"background .2s"}}>{m.fw}</div>))}
        </div>
      </div>
      <div style={{flex:1,minWidth:200}}>
        <div style={{fontSize:14,fontWeight:700,color:"#10B981",marginBottom:6}}>🔬 microGPT (açık kod)</div>
        <div style={{padding:10,borderRadius:10,background:"#0D1117"}}>
          {mappings.map((m,i)=>(<div key={i} onMouseEnter={()=>setHighlight(i)} onMouseLeave={()=>setHighlight(-1)} style={{padding:"6px 8px",borderRadius:6,marginBottom:2,cursor:"pointer",fontFamily:"'Fira Code',monospace",fontSize:13,lineHeight:1.8,color:"#E2E8F0",background:highlight===i?`${m.color}15`:"transparent",transition:"background .2s"}}>{m.mc}</div>))}
        </div>
      </div>
    </div>
    {highlight >= 0 && (
      <div style={{marginTop:8,padding:"8px 14px",borderRadius:10,background:`${mappings[highlight].color}08`,border:`1.5px solid ${mappings[highlight].color}25`,transition:"all .3s"}}>
        <div style={{fontSize:13,color:mappings[highlight].color,lineHeight:1.6}}><strong>{mappings[highlight].fw}</strong> → {mappings[highlight].desc}</div>
      </div>
    )}
    <button onClick={()=>setShowInner(!showInner)} style={{marginTop:8,padding:"6px 14px",borderRadius:8,border:"1px solid rgba(245,158,11,.3)",background:"rgba(245,158,11,.06)",color:"#F59E0B",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",width:"100%"}}>
      {showInner?lang === "tr" ? "▲ Detayları gizle" : "▲ Hide details":lang === "tr" ? "▼ loss.backward() arkasında ne var? (tıkla)" : "▼ What is behind loss.backward()? (click)"}
    </button>
    {showInner && (
      <div style={{marginTop:6,padding:10,borderRadius:8,background:"rgba(239,68,68,.04)",border:"1px solid rgba(239,68,68,.1)",fontSize:12,color:"#94A3B8",lineHeight:1.6}}>
        <div style={{color:"#EF4444",fontWeight:700,marginBottom:4}}>loss.backward() — 5 adım:</div>
        <div style={{paddingLeft:12}}>① Hesaplama grafını topolojik sırala<br/>② Son düğümden başla (loss.grad = 1)<br/>③ Her düğümde lokal türev × yukarıdan gelen grad (chain rule)<br/>④ Birden fazla yol varsa: grad += (topla, üzerine yazma!)<br/>⑤ Tüm yapraklar (parametreler) artık gradyanlarına sahip</div><br/>
        <div style={{color:"#10B981",fontWeight:700,marginBottom:4}}>optimizer.step() — Adam (6 adım):</div>
        <div style={{paddingLeft:12}}>① m = β₁×m + (1-β₁)×grad (momentum güncelle)<br/>② v = β₂×v + (1-β₂)×grad² (variance güncelle)<br/>③ m̂ = m/(1-β₁ᵗ) (bias correction)<br/>④ v̂ = v/(1-β₂ᵗ) (bias correction)<br/>⑤ w -= lr × m̂/(√v̂ + ε) (parametre güncelle)<br/>⑥ grad = 0 (sıfırla — bir sonraki adım için)</div>
      </div>
    )}
  </VizBox>);
};

const LivePipelineViz = () => {
  const lang = useLang();
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(false);
  const pipe = [
    {icon:"📄",label:"emma",sub:lang==="tr"?"Doküman":"Document",color:"#0EA5E9",
     detail:lang==="tr"?"Eğitim verisinden bir isim seçildi":"A name was selected from training data",
     dataIn:"input.txt satır 42",dataOut:'"emma"',
     explain:lang==="tr"?"32K isimden oluşan dosyadan bir satır okunur. Her isim bir eğitim örneğidir.":"A line is read from a file of 32K names. Each name is a training example."},
    {icon:"🔤",label:"[26,4,12,12,0,26]",sub:"Tokenize",color:"#8B5CF6",
     detail:lang==="tr"?"Her karakter bir sayıya dönüşür":"Each character becomes a number",
     dataIn:'"emma"',dataOut:"[BOS=26, e=4, m=12, m=12, a=0, EOS=26]",
     explain:lang==="tr"?"Karakter tablosundan bakılır: a→0, b→1, ..., z→25, BOS/EOS→26. Başa ve sona BOS eklenir.":"Looked up from character table: a→0, b→1, ..., z→25, BOS/EOS→26. BOS added to start and end."},
    {icon:"📊",label:"[0.02, -0.1, 0.3, ...]",sub:"Embedding",color:"#0EA5E9",
     detail:lang==="tr"?"Her ID bir 16 boyutlu vektöre dönüşür":"Each ID becomes a 16-dimensional vector",
     dataIn:"token_id = 4 (e), pozisyon = 1",dataOut:"x = wte[4] + wpe[1] = 16 boyutlu vektör",
     explain:lang==="tr"?"Embedding tablosu: [27×16] matristen 4. satır seçilir. Pozisyon tablosu: [8×16]'dan 1. satır eklenir. Toplam = tokenin kimliği + konumu.":"Embedding table: row 4 selected from [27×16] matrix. Position table: row 1 from [8×16] added. Total = token identity + position."},
    {icon:"🔍",label:"Q·Kᵀ/√4 → softmax → V",sub:"Attention",color:"#10B981",
     detail:lang==="tr"?"Her token diğer tokenlara 'sorar': bana ne bilgi verebilirsin?":"Each token 'asks' other tokens: what info can you give me?",
     dataIn:"x₁, x₂, ..., x₆ (her biri 16d)",dataOut:"4 head × dikkat ağırlıkları → zenginleştirilmiş vektörler",
     explain:lang==="tr"?"Her token Q (sorgu), K (anahtar), V (değer) rollerini alır. Q·K benzerlik skoru verir. Yüksek benzerlik = daha fazla dikkat. V'lerin ağırlıklı toplamı çıktı olur.":"Each token takes Q (query), K (key), V (value) roles. Q·K gives similarity score. High similarity = more attention. Weighted sum of V's becomes output."},
    {icon:"🧮",label:"16 → 64 → 16",sub:"MLP",color:"#EC4899",
     detail:lang==="tr"?"Her token bağımsız olarak genişlet → aktive et → daralt":"Each token independently: expand → activate → compress",
     dataIn:"attention çıktısı [16d]",dataOut:"fc1: 16→64, ReLU², fc2: 64→16 → [16d]",
     explain:lang==="tr"?"Attention bilgiyi toplar, MLP bu bilgiyi işler. Genişletme (64d) daha zengin temsil sağlar. ReLU² aktivasyonu doğrusal olmayanlık ekler.":"Attention gathers info, MLP processes it. Expansion (64d) enables richer representation. ReLU² activation adds non-linearity."},
    {icon:"📈",label:"P(a)=0.30, P(e)=0.12, ...",sub:"Softmax",color:"#F59E0B",
     detail:lang==="tr"?"28 token üzerinde olasılık dağılımı":"Probability distribution over 28 tokens",
     dataIn:"logits = lm_head(x) → [28 skor]",dataOut:"softmax → P(a)=0.30, P(m)=0.12, P(e)=0.08, ...",
     explain:lang==="tr"?"Son vektör [16d] çözme matrisiyle [16×28] çarpılır → her token için bir skor. Softmax bu skorları olasılıklara çevirir (toplam=1).":"Final vector [16d] multiplied by decode matrix [16×28] → a score for each token. Softmax converts scores to probabilities (sum=1)."},
    {icon:"📉",label:"Loss = -log(0.12) = 2.12",sub:lang==="tr"?"Loss Hesaplama":"Loss Computation",color:"#EF4444",
     detail:lang==="tr"?"Model 'm' için düşük olasılık verdi → kayıp yüksek":"Model gave low probability for 'm' → high loss",
     dataIn:"Hedef: 'm', Model tahmini: P('m') = 0.12",dataOut:"CE = -log(0.12) = 2.12",
     explain:lang==="tr"?"Doğru cevaba verilen olasılık ne kadar düşükse kayıp o kadar yüksek. P=1.0 → loss=0 (mükemmel). P=0.01 → loss=4.6 (çok kötü). Amaç: bu kaybı minimize etmek.":"The lower the probability given to the correct answer, the higher the loss. P=1.0 → loss=0 (perfect). P=0.01 → loss=4.6 (very bad). Goal: minimize this loss."},
    {icon:"⛓️",label:"∂L/∂w için her parametre",sub:"Backward Pass",color:"#F59E0B",
     detail:lang==="tr"?"Zincir kuralıyla 3,648 gradyan hesaplanır":"3,648 gradients computed via chain rule",
     dataIn:"Loss = 2.12",dataOut:"grad(wte), grad(wpe), grad(Wq), grad(Wk), ... toplam 3,648 gradyan",
     explain:lang==="tr"?"Kayıp son katmandan geriye doğru yayılır. Her parametre için 'bu parametreyi değiştirmek kaybı ne kadar değiştirir?' sorusu cevaplanır. Bu = gradient.":"Loss propagates backwards from the last layer. For each parameter: 'how much does changing this parameter change the loss?' This answer = gradient."},
    {icon:"🔧",label:"w -= 0.01 × grad",sub:"Adam Update",color:"#10B981",
     detail:lang==="tr"?"Her parametre gradient yönünde küçük bir adım atar":"Each parameter takes a small step in the gradient direction",
     dataIn:"w_old, grad, momentum, variance",dataOut:"w_new = w_old - lr × m̂/(√v̂+ε)",
     explain:lang==="tr"?"Adam optimizer: momentum (yön) + adaptif lr (hız) birleştirir. Her parametre ayrı hızda güncellenir. Son adım: grad = 0 (bir sonraki adım için sıfırla).":"Adam optimizer: combines momentum (direction) + adaptive lr (speed). Each parameter updates at its own rate. Final step: grad = 0 (reset for next step)."},
  ];
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStage(s => { if (s >= pipe.length-1) { setAuto(false); return 0; } return s+1; }), 2200);
    return () => clearInterval(t);
  }, [auto]);
  const p = pipe[stage];
  return (<VizBox title={lang === "tr" ? "Canlı Pipeline — Bir Eğitim Adımı (emma)" : "Live Pipeline — One Training Step (emma)"} color="#0EA5E9">
    <div style={{fontSize:13,color:"#94A3B8",marginBottom:8,lineHeight:1.6}}>
      {lang==="tr"?<><strong style={{color:"#0EA5E9"}}>'emma'</strong> isminin model içindeki 9 aşamalı yolculuğu. Her kutuya tıklayarak o adımda verinin nasıl dönüştüğünü görün.</>:<>The 9-stage journey of <strong style={{color:"#0EA5E9"}}>'emma'</strong> through the model. Click each box to see how data transforms at each step.</>}
    </div>
    <div style={{display:"flex",gap:3,flexWrap:"wrap",justifyContent:"center",marginBottom:10}}>
      {pipe.map((s,i) => (
        <div key={i} onClick={()=>{setAuto(false);setStage(i);}} style={{
          display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 5px",borderRadius:8,minWidth:48,cursor:"pointer",
          background:i===stage?`${s.color}20`:i<stage?`${s.color}08`:"transparent",
          border:`1.5px solid ${i===stage?s.color:i<stage?`${s.color}30`:"rgba(255,255,255,0.04)"}`,
          transform:i===stage?"scale(1.1)":"scale(1)",transition:"all .3s",opacity:i<=stage?1:0.3
        }}>
          <span style={{fontSize:17}}>{s.icon}</span>
          <span style={{fontSize:10,fontWeight:700,color:i===stage?s.color:"#64748B",textAlign:"center"}}>{s.sub}</span>
        </div>
      ))}
    </div>
    <div style={{padding:14,borderRadius:12,background:`${p.color}08`,border:`1.5px solid ${p.color}25`,transition:"all .3s"}}>
      <div style={{fontSize:16,fontWeight:800,color:p.color,marginBottom:4}}>{p.icon} {stage+1}/9 — {p.sub}</div>
      <div style={{fontSize:14,color:"#94A3B8",marginBottom:10}}>{p.detail}</div>

      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:160,padding:"8px 12px",borderRadius:8,background:"rgba(14,165,233,.06)",border:"1px solid rgba(14,165,233,.15)"}}>
          <div style={{fontSize:11,color:"#0EA5E9",fontWeight:700,marginBottom:2}}>{lang === "tr" ? "GİRDİ" : "INPUT"}</div>
          <div style={{fontSize:13,fontFamily:"'Fira Code',monospace",color:"#E2E8F0",lineHeight:1.5}}>{p.dataIn}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",fontSize:17,color:"#64748B"}}>→</div>
        <div style={{flex:1,minWidth:160,padding:"8px 12px",borderRadius:8,background:"rgba(16,185,129,.06)",border:"1px solid rgba(16,185,129,.15)"}}>
          <div style={{fontSize:11,color:"#10B981",fontWeight:700,marginBottom:2}}>{lang === "tr" ? "ÇIKTI" : "OUTPUT"}</div>
          <div style={{fontSize:13,fontFamily:"'Fira Code',monospace",color:"#E2E8F0",lineHeight:1.5}}>{p.dataOut}</div>
        </div>
      </div>

      <div style={{padding:"8px 12px",borderRadius:8,background:"rgba(251,191,36,.05)",borderLeft:"3px solid rgba(251,191,36,.3)"}}>
        <div style={{fontSize:11,color:"#FBBF24",fontWeight:700,marginBottom:2}}>{lang==="tr"?"NE OLUYOR?":"WHAT'S HAPPENING?"}</div>
        <div style={{fontSize:13,color:"#FDE68A",lineHeight:1.6}}>{p.explain}</div>
      </div>
    </div>
    <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"center"}}>
      <button onClick={()=>{setStage(0);setAuto(true);}} style={{padding:"5px 14px",borderRadius:8,border:"none",background:"#0EA5E9",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lang === "tr" ? "▶ Animasyon" : "▶ Animate"}</button>
      <button onClick={()=>setStage(s=>Math.max(0,s-1))} style={{padding:"5px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>←</button>
      <button onClick={()=>setStage(s=>Math.min(pipe.length-1,s+1))} style={{padding:"5px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>→</button>
    </div>
  </VizBox>);
};


// ─── Interactive Playgrounds ──────────────────────────────────
const TokenizerPlaygroundViz = () => {
  const lang = useLang();
  const [input, setInput] = useState("emma");
  const [animStep, setAnimStep] = useState(-1);
  const [auto, setAuto] = useState(false);
  const vocab = {a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7,i:8,j:9,k:10,l:11,m:12,n:13,o:14,p:15,q:16,r:17,s:18,t:19,u:20,v:21,w:22,x:23,y:24,z:25};
  const BOS = 26;
  const chars = input.toLowerCase().split("").filter(c => vocab[c] !== undefined);
  const ids = [BOS, ...chars.map(c => vocab[c]), BOS];
  const labels = ["BOS", ...chars, "BOS"];
  const pairs = ids.slice(0, -1).map((id, i) => ({ input: labels[i], target: labels[i + 1], inId: id, outId: ids[i + 1] }));

  // Animation stages: 0=chars, 1=ids, 2=addBOS, 3=pairs
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setAnimStep(s => { if (s >= 3) { setAuto(false); return 3; } return s + 1; }), 900);
    return () => clearInterval(t);
  }, [auto]);

  const stageLabels = [lang === "tr" ? "① Karakterlere ayır" : "① Split into characters", lang === "tr" ? "② ID'lere çevir" : "② Convert to IDs", lang === "tr" ? "③ BOS ekle" : "③ Add BOS", lang === "tr" ? "④ Eğitim çiftleri oluştur" : "④ Create training pairs"];
  const stageColors = ["#8B5CF6", "#0EA5E9", "#F59E0B", "#10B981"];

  return (<VizBox title={lang === "tr" ? "Tokenizer Oyun Alanı — Kendi Kelimeni Dene" : "Tokenizer Playground — Try Your Own Words"} color="#8B5CF6">
    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
      <input type="text" value={input} onChange={e=>{setInput(e.target.value.slice(0,10));setAnimStep(-1);}} maxLength={10} placeholder={lang === "tr" ? "isim yazın..." : "type a name..."} style={{padding:"7px 14px",borderRadius:10,background:"#0D1117",border:"1.5px solid rgba(139,92,246,.3)",color:"#E2E8F0",fontFamily:"'Fira Code',monospace",fontSize: 18,width:130,outline:"none"}}/>
      <button onClick={()=>{setAnimStep(0);setAuto(true);}} style={{padding:"7px 16px",borderRadius:10,border:"none",background:"#8B5CF6",color:"#fff",fontSize: 14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lang === "tr" ? "▶ Tokenize Et" : "▶ Tokenize"}</button>
      <button onClick={()=>{setAnimStep(-1);setAuto(false);}} style={{padding:"7px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>↺</button>
    </div>

    {/* Pipeline stages */}
    <div style={{display:"flex",gap:4,marginBottom:12}}>
      {stageLabels.map((l,i) => (
        <div key={i} style={{flex:1,padding:"5px 6px",borderRadius:8,fontSize: 12,fontWeight:700,textAlign:"center",
          background:i<=animStep?`${stageColors[i]}15`:"transparent",color:i<=animStep?stageColors[i]:"#334155",
          border:`1.5px solid ${i===animStep?stageColors[i]:i<animStep?`${stageColors[i]}30`:"rgba(255,255,255,.04)"}`,
          transform:i===animStep?"scale(1.04)":"scale(1)",transition:"all .3s"}}>{l}</div>
      ))}
    </div>

    {/* Stage 0+: Character strip */}
    {animStep >= 0 && (<div style={{marginBottom:8,opacity:1,transition:"opacity .4s"}}>
      <div style={{fontSize: 12,color:"#8B5CF6",fontWeight:700,marginBottom:4}}>Karakterler:</div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
        {chars.map((c,i) => (
          <div key={i} style={{width:32,height:36,borderRadius:8,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            background:"rgba(139,92,246,.08)",border:"1.5px solid rgba(139,92,246,.25)",transition:"all .3s"}}>
            <span style={{fontSize: 19,fontWeight:800,fontFamily:"'Fira Code',monospace",color:"#8B5CF6"}}>{c}</span>
          </div>
        ))}
      </div>
    </div>)}

    {/* Stage 1+: ID mapping */}
    {animStep >= 1 && (<div style={{marginBottom:8}}>
      <div style={{fontSize: 12,color:"#0EA5E9",fontWeight:700,marginBottom:4}}>Token ID'ler:</div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
        {chars.map((c,i) => (
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
            <span style={{fontSize: 14,fontFamily:"'Fira Code',monospace",color:"#8B5CF6"}}>{c}</span>
            <span style={{fontSize: 11,color:"#64748B"}}>↓</span>
            <div style={{padding:"3px 8px",borderRadius:6,background:"rgba(14,165,233,.1)",border:"1px solid rgba(14,165,233,.2)",fontSize: 15,fontFamily:"'Fira Code',monospace",color:"#0EA5E9",fontWeight:700}}>{vocab[c]}</div>
          </div>
        ))}
      </div>
    </div>)}

    {/* Stage 2+: Full token sequence with BOS */}
    {animStep >= 2 && (<div style={{marginBottom:8}}>
      <div style={{fontSize: 12,color:"#F59E0B",fontWeight:700,marginBottom:4}}>Tam dizi (BOS dahil):</div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
        {labels.map((l,i) => {
          const isBos = l === "BOS";
          return (<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 8px",borderRadius:8,
            background:isBos?"rgba(245,158,11,.1)":"rgba(139,92,246,.05)",border:`1.5px solid ${isBos?"rgba(245,158,11,.3)":"rgba(139,92,246,.15)"}`,
            transition:"all .3s"}}>
            <span style={{fontSize: 16,fontWeight:800,fontFamily:"'Fira Code',monospace",color:isBos?"#F59E0B":"#8B5CF6"}}>{l}</span>
            <span style={{fontSize: 12,fontFamily:"'Fira Code',monospace",color:"#64748B"}}>{ids[i]}</span>
          </div>);
        })}
      </div>
      <div style={{fontSize: 12,fontFamily:"'Fira Code',monospace",color:"#64748B",marginTop:4}}>
        [{ids.join(", ")}]
      </div>
    </div>)}

    {/* Stage 3: Training pairs */}
    {animStep >= 3 && (<div>
      <div style={{fontSize: 12,color:"#10B981",fontWeight:700,marginBottom:4}}>{lang === "tr" ? `Eğitim çiftleri (${pairs.length} adet):` : `Training pairs (${pairs.length}):` }</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {pairs.map((p,i) => (
          <div key={i} style={{padding:"5px 10px",borderRadius:8,background:"rgba(16,185,129,.06)",border:"1px solid rgba(16,185,129,.15)",display:"flex",alignItems:"center",gap:4,transition:"all .3s"}}>
            <span style={{fontSize: 14,fontFamily:"'Fira Code',monospace",color:"#0EA5E9",fontWeight:700}}>{p.input}</span>
            <span style={{fontSize: 13,color:"#475569"}}>→</span>
            <span style={{fontSize: 14,fontFamily:"'Fira Code',monospace",color:"#10B981",fontWeight:700}}>{p.target}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:8,padding:"8px 12px",borderRadius:8,background:"rgba(245,158,11,.04)",border:"1px solid rgba(245,158,11,.12)",fontSize: 13,color:"#F59E0B"}}>
        💡 {chars.length} harf → {ids.length} token → {pairs.length} eğitim çifti. 32K isim × ~6 harf = ~192K çift!
      </div>
    </div>)}

    {animStep < 0 && (<div style={{padding:16,textAlign:"center",color:"#475569",fontSize: 14}}>
      {lang === "tr" ? "☝️ Bir isim yazıp ▶ Tokenize Et butonuna basın" : "☝️ Type a name and press ▶ Tokenize"}
    </div>)}
  </VizBox>);
};

// ─── RICH INTERACTIVE VIZ: AUTOGRAD PLAYGROUND ───────────────────
const AutogradPlaygroundViz = () => {
  const lang = useLang();
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [c, setC] = useState(1);
  const [step, setStep] = useState(-1);
  const [auto, setAuto] = useState(false);

  const d = a * b;
  const L = d + c;
  const grads = [
    { node: "L", val: L, grad: 1, explain: lang === "tr" ? "∂L/∂L = 1 (başlangıç)" : "∂L/∂L = 1 (start)", color: "#EF4444" },
    { node: "d", val: d, grad: 1, explain: lang === "tr" ? "∂L/∂d = 1 (toplama: geçir)" : "∂L/∂d = 1 (addition: pass through)", color: "#F59E0B" },
    { node: "c", val: c, grad: 1, explain: lang === "tr" ? "∂L/∂c = 1 (toplama: geçir)" : "∂L/∂c = 1 (addition: pass through)", color: "#10B981" },
    { node: "a", val: a, grad: b, explain: `∂L/∂a = b = ${b} ${lang === "tr" ? "(çarpma: diğer girdi)" : "(multiply: other input)"}`, color: "#0EA5E9" },
    { node: "b", val: b, grad: a, explain: `∂L/∂b = a = ${a} ${lang === "tr" ? "(çarpma: diğer girdi)" : "(multiply: other input)"}`, color: "#8B5CF6" },
  ];

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStep(s => { if (s >= 4) { setAuto(false); return 4; } return s + 1; }), 1000);
    return () => clearInterval(t);
  }, [auto]);

  const nodeGrad = (name) => {
    const idx = grads.findIndex(g => g.node === name);
    return idx !== -1 && idx <= step ? grads[idx].grad : null;
  };
  const nodeActive = (name) => {
    const idx = grads.findIndex(g => g.node === name);
    return idx !== -1 && idx <= step;
  };

  const nodes = [
    { l: "a", v: a, x: 20, y: 18, c: "#0EA5E9" },
    { l: "b", v: b, x: 20, y: 54, c: "#8B5CF6" },
    { l: "d=a×b", v: d, x: 100, y: 36, c: "#F59E0B" },
    { l: "c", v: c, x: 100, y: 66, c: "#10B981" },
    { l: "L=d+c", v: L, x: 180, y: 48, c: "#EF4444" },
  ];

  return (<VizBox title={lang === "tr" ? "Autograd Oyun Alanı — Değerleri Değiştir, Gradientleri İzle" : "Autograd Playground — Change Values, Watch Gradients"} color="#F59E0B">
    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:230}}>
        {/* Sliders */}
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          {[{l:"a",v:a,s:setA,c:"#0EA5E9"},{l:"b",v:b,s:setB,c:"#8B5CF6"},{l:"c",v:c,s:setC,c:"#10B981"}].map((p,i)=>(
            <div key={i} style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize: 13,marginBottom:2}}>
                <span style={{color:p.c,fontWeight:800}}>{p.l}</span>
                <span style={{fontFamily:"'Fira Code',monospace",color:"#E2E8F0",fontWeight:700}}>{p.v}</span>
              </div>
              <input type="range" min={-5} max={5} value={p.v} onChange={e=>{p.s(+e.target.value);setStep(-1);setAuto(false);}} style={{width:"100%",accentColor:p.c}}/>
            </div>
          ))}
        </div>

        {/* Computation Graph SVG */}
        <svg viewBox="0 0 210 82" style={{width:"100%",height:120,background:"rgba(0,0,0,.15)",borderRadius:10,padding:4}}>
          {/* Edges */}
          {[[20,18,100,36,"#0EA5E960"],[20,54,100,36,"#8B5CF660"],[100,36,180,48,"#F59E0B60"],[100,66,180,48,"#10B98160"]].map(([x1,y1,x2,y2,col],i)=>(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="1.5" strokeDasharray={step >= 0 ? "none" : "4,3"}/>
          ))}
          {/* Op labels */}
          <text x="58" y="30" fill="#F59E0B" fontSize="6" fontWeight="700" textAnchor="middle">×</text>
          <text x="142" y="48" fill="#EF4444" fontSize="6" fontWeight="700" textAnchor="middle">+</text>

          {/* Backward arrows (animated) */}
          {step >= 0 && <line x1="175" y1="52" x2="110" y2="40" stroke="#EF444480" strokeWidth="1" markerEnd="url(#arrowR)" strokeDasharray="3,2"/>}
          {step >= 1 && <line x1="175" y1="52" x2="110" y2="66" stroke="#EF444480" strokeWidth="1" strokeDasharray="3,2"/>}
          {step >= 3 && <line x1="95" y1="40" x2="28" y2="22" stroke="#EF444480" strokeWidth="1" strokeDasharray="3,2"/>}
          {step >= 4 && <line x1="95" y1="40" x2="28" y2="54" stroke="#EF444480" strokeWidth="1" strokeDasharray="3,2"/>}

          {/* Nodes */}
          {nodes.map((n,i)=>{
            const g = nodeGrad(n.l.split("=")[0]);
            const active = nodeActive(n.l.split("=")[0]);
            return (<g key={i}>
              <ellipse cx={n.x} cy={n.y} rx={n.l.length>2?20:14} ry="11" fill={active?`${n.c}25`:"#0D111780"} stroke={n.c} strokeWidth={active?2:1} style={{transition:"all .4s"}}/>
              <text x={n.x} y={n.y+1} fill={n.c} fontSize="5.5" fontWeight="800" textAnchor="middle">{n.l}={n.v}</text>
              {g !== null && (<>
                <rect x={n.x-14} y={n.y+11} width="28" height="12" rx="3" fill="#EF4444" opacity="0.9"/>
                <text x={n.x} y={n.y+19} fill="#fff" fontSize="5" fontWeight="700" textAnchor="middle">grad={g}</text>
              </>)}
            </g>);
          })}
        </svg>

        {/* Controls */}
        <div style={{display:"flex",gap:6,marginTop:8}}>
          <button onClick={()=>{setStep(0);setAuto(true);}} style={{flex:1,padding:"6px 14px",borderRadius:10,border:"none",background:"#F59E0B",color:"#fff",fontSize: 14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lang === "tr" ? "▶ Backward" : "▶ Backward"}</button>
          <button onClick={()=>setStep(s=>Math.max(-1,s-1))} style={{padding:"6px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>←</button>
          <button onClick={()=>setStep(s=>Math.min(4,s+1))} style={{padding:"6px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>→</button>
          <button onClick={()=>{setStep(-1);setAuto(false);}} style={{padding:"6px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>↺</button>
        </div>
      </div>

      {/* Backward steps panel */}
      <div style={{flex:1,minWidth:200}}>
        <div style={{fontSize: 13,fontWeight:700,color:"#EF4444",marginBottom:8,display:"flex",alignItems:"center",gap:4}}>
          <span>←</span> Backward adımları
        </div>
        {grads.map((g,i)=>(
          <div key={i} style={{padding:"7px 10px",borderRadius:8,marginBottom:4,
            background:i<=step?`${g.color}10`:"transparent",
            border:`1.5px solid ${i===step?g.color:i<step?`${g.color}25`:"rgba(255,255,255,.03)"}`,
            opacity:i<=step?1:0.25,transition:"all .4s",
            transform:i===step?"scale(1.02)":"scale(1)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize: 14,fontFamily:"'Fira Code',monospace",color:i===step?g.color:"#94A3B8",fontWeight:i===step?800:400}}>{g.explain}</span>
              {i<=step && <span style={{fontSize: 13,fontFamily:"'Fira Code',monospace",color:"#EF4444",fontWeight:700}}>={g.grad}</span>}
            </div>
          </div>
        ))}

        {step >= 4 && (<div style={{marginTop:8,padding:"8px 12px",borderRadius:8,background:"rgba(16,185,129,.06)",border:"1px solid rgba(16,185,129,.15)",fontSize: 13,color:"#10B981"}}>
          ✅ Doğrulama: ∂L/∂a = b = {b}, ∂L/∂b = a = {a}. Kaydırıcıları değiştirip tekrar deneyin!
        </div>)}

        {step < 0 && (<div style={{padding:"12px 8px",textAlign:"center",color:"#475569",fontSize: 13}}>
          ☝️ Kaydırıcılarla a, b, c değerlerini ayarlayın, sonra ▶ Backward'a basın
        </div>)}
      </div>
    </div>
  </VizBox>);
};

// ─── RICH INTERACTIVE VIZ: ATTENTION PLAYGROUND (W3) ─────────────
const AttentionPlaygroundViz = () => {
  const lang = useLang();
  const toks = ["B","a","n","a","n","a"];
  const [selRow, setSelRow] = useState(3);
  const [activeHead, setActiveHead] = useState(0);
  const headColors = ["#0EA5E9","#10B981","#F59E0B","#EC4899"];
  const headLabels = [lang === "tr" ? "Sesli-sessiz uyumu" : "Vowel-consonant harmony",lang === "tr" ? "Pozisyon yakınlığı" : "Position proximity",lang === "tr" ? "Tekrar kalıbı" : "Repetition pattern",lang === "tr" ? "Genel bağlam" : "General context"];
  // Simulated attention patterns per head
  const patterns = useMemo(() => [
    // Head 0: vowel-consonant
    toks.map((_,r) => toks.map((_,c) => c<=r ? (("aeiou".includes(toks[c].toLowerCase()) !== "aeiou".includes(toks[r].toLowerCase())) ? 0.35 : 0.08) + Math.random()*0.05 : 0)),
    // Head 1: positional proximity
    toks.map((_,r) => toks.map((_,c) => c<=r ? Math.max(0.02, 0.4 - Math.abs(r-c)*0.1) + Math.random()*0.03 : 0)),
    // Head 2: repeat pattern
    toks.map((_,r) => toks.map((_,c) => c<=r ? (toks[c]===toks[r] ? 0.45 : 0.05) + Math.random()*0.04 : 0)),
    // Head 3: uniform-ish
    toks.map((_,r) => toks.map((_,c) => c<=r ? 0.15 + Math.random()*0.1 : 0)),
  ], []);
  const norm = (row) => { const s=row.reduce((a,b)=>a+b,0)||1; return row.map(v=>v/s); };

  const weights = patterns[activeHead].map(norm);

  return (<VizBox title={lang === "tr" ? "Attention Oyun Alanı — Her Head Neye Bakıyor?" : "Attention Playground — What Does Each Head See?"} color="#10B981">
    <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
      <div style={{minWidth:220}}>
        <div style={{fontSize: 12,color:"#64748B",marginBottom:4}}>{lang === "tr" ? "Head seçin — her head farklı kalıp öğrenir:" : "Select a head — each head learns different patterns:"}</div>
        <div style={{display:"flex",gap:3,marginBottom:8}}>
          {[0,1,2,3].map(h=>(
            <button key={h} onClick={()=>setActiveHead(h)} style={{flex:1,padding:"5px 4px",borderRadius:8,border:`1.5px solid ${activeHead===h?headColors[h]:`${headColors[h]}30`}`,background:activeHead===h?`${headColors[h]}15`:"transparent",color:activeHead===h?headColors[h]:"#64748B",fontSize: 11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",lineHeight:1.3,textAlign:"center"}}>
              H{h}<br/><span style={{fontSize: 10,fontWeight:400}}>{headLabels[h]}</span>
            </button>
          ))}
        </div>
        {/* Attention matrix */}
        <div style={{display:"flex",marginLeft:20}}>{toks.map((t,i)=>(<div key={i} style={{width:28,textAlign:"center",fontSize: 13,color:"#64748B",fontFamily:"'Fira Code',monospace"}}>{t}</div>))}</div>
        {toks.map((t,r)=>(
          <div key={r} style={{display:"flex",alignItems:"center",cursor:"pointer"}} onClick={()=>setSelRow(r)}>
            <div style={{width:18,fontSize: 13,color:selRow===r?headColors[activeHead]:"#64748B",fontFamily:"'Fira Code',monospace",fontWeight:selRow===r?800:400}}>{t}</div>
            {toks.map((_,c)=>{const masked=c>r;const w=!masked?weights[r][c]:0;return(
              <div key={c} style={{width:26,height:24,margin:1,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 10,fontFamily:"'Fira Code',monospace",
                background:masked?"rgba(255,255,255,.01)":`${headColors[activeHead]}${Math.round(Math.min(200,w*250)).toString(16).padStart(2,"0")}`,
                color:masked?"#1E293B":w>0.2?"#fff":`${headColors[activeHead]}99`,
                border:selRow===r&&!masked?`1.5px solid ${headColors[activeHead]}`:"1px solid transparent",transition:"all .3s"
              }}>{masked?"✗":(w*100).toFixed(0)}</div>
            );})}
          </div>
        ))}
        <div style={{marginTop:4,fontSize: 11,color:"#475569"}}>{lang === "tr" ? "✗ = causal mask (geleceği göremez)" : "✗ = causal mask (cannot see future)"}</div>
      </div>
      <div style={{flex:1,minWidth:180}}>
        <div style={{padding:10,borderRadius:10,background:`${headColors[activeHead]}08`,border:`1px solid ${headColors[activeHead]}20`}}>
          <div style={{fontSize: 13,color:headColors[activeHead],fontWeight:700,marginBottom:6}}>'{toks[selRow]}' (pos {selRow}) → dikkat dağılımı:</div>
          {toks.slice(0,selRow+1).map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
              <span style={{width:12,fontSize: 14,fontFamily:"'Fira Code',monospace",color:"#94A3B8",fontWeight:700}}>{t}</span>
              <div style={{flex:1,height:10,background:"rgba(255,255,255,.03)",borderRadius:5,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${weights[selRow][i]*100}%`,borderRadius:5,background:headColors[activeHead],transition:"width .3s"}}/>
              </div>
              <span style={{width:28,fontSize: 12,fontFamily:"'Fira Code',monospace",color:"#E2E8F0",textAlign:"right"}}>{(weights[selRow][i]*100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:8,padding:"7px 10px",borderRadius:8,background:"rgba(245,158,11,.04)",border:"1px solid rgba(245,158,11,.12)",fontSize: 12,color:"#F59E0B"}}>
          💡 Satıra tıklayın → dikkat dağılımı değişir. Head değiştirin → farklı kalıplar!
        </div>
        <div style={{marginTop:6,fontSize: 12,color:"#64748B"}}>
          Formül: softmax(Q·Kᵀ / √{4}) × V
        </div>
      </div>
    </div>
  </VizBox>);
};

// ─── RICH INTERACTIVE VIZ: TRANSFORMER BLOCK FLOW (W4) ──────────
const TransformerBlockFlowViz = () => {
  const lang = useLang();
  const [step, setStep] = useState(-1);
  const [auto, setAuto] = useState(false);
  const stages = [
    {l:lang === "tr" ? "x girdi" : "x input",sub:"[16]",c:"#0EA5E9",icon:"📥",d:lang === "tr" ? "Embedding katmanından gelen 16-boyutlu vektör" : "16-dimensional vector from embedding layer"},
    {l:"RMSNorm₁",sub:"x/√rms",c:"#F59E0B",icon:"📏",d:lang === "tr" ? "Normalize et → kararlı eğitim" : "Normalize → stable training"},
    {l:"Self-Attn",sub:"Q·Kᵀ/√d·V",c:"#10B981",icon:"🔍",d:lang === "tr" ? "4 head × 4 dim → hangi tokenlara dikkat?" : "4 heads × 4 dim → which tokens to attend?"},
    {l:"+Residual₁",sub:"attn+x",c:"#EF4444",icon:"➕",d:lang === "tr" ? "Orijinal girdiyi geri ekle → gradient highway" : "Add original input back → gradient highway"},
    {l:"RMSNorm₂",sub:"x/√rms",c:"#F59E0B",icon:"📏",d:lang === "tr" ? "MLP öncesi tekrar normalize" : "Re-normalize before MLP"},
    {l:"MLP",sub:"16→64→16",c:"#EC4899",icon:"🧮",d:"fc1(genişlet) → ReLU²(aktive) → fc2(daralt)"},
    {l:"+Residual₂",sub:"mlp+x",c:"#EF4444",icon:"➕",d:lang === "tr" ? "Tekrar residual → bilgi kaybını önle" : "Residual again → prevent info loss"},
    {l:lang === "tr" ? "x çıktı" : "x output",sub:"[16]",c:"#6366F1",icon:"📤",d:lang === "tr" ? "Zenginleşmiş vektör → LM head veya sonraki katman" : "Enriched vector → LM head or next layer"},
  ];

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStep(s => { if (s >= stages.length-1) { setAuto(false); return s; } return s+1; }), 700);
    return () => clearInterval(t);
  }, [auto]);

  return (<VizBox title={lang === "tr" ? "Transformer Bloğu — Adım Adım Akış Simülasyonu" : "Transformer Block — Step-by-Step Flow Simulation"} color="#EC4899">
    {/* Stage boxes */}
    <div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center",marginBottom:10}}>
      {stages.map((st,i)=>{
        const active = i===step;
        const past = i<step;
        return (<div key={i} onClick={()=>{setAuto(false);setStep(i);}} style={{
          display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"5px 4px",borderRadius:8,minWidth:48,cursor:"pointer",
          background:active?`${st.c}20`:past?`${st.c}08`:"transparent",
          border:`1.5px solid ${active?st.c:past?`${st.c}30`:"rgba(255,255,255,.04)"}`,
          transform:active?"scale(1.08)":"scale(1)",transition:"all .3s",opacity:step<0?0.5:i<=step?1:0.25
        }}>
          <span style={{fontSize: 16}}>{st.icon}</span>
          <span style={{fontSize: 10,fontWeight:700,color:active?st.c:"#64748B",textAlign:"center",lineHeight:1.2}}>{st.l}</span>
        </div>);
      })}
    </div>

    {/* Flow arrows SVG */}
    <svg viewBox="0 0 320 16" style={{width:"100%",height:16,marginBottom:6}}>
      {stages.slice(0,-1).map((_,i) => {
        const x = 20 + i * (280/(stages.length-1));
        const x2 = 20 + (i+1) * (280/(stages.length-1));
        return <line key={i} x1={x+12} y1="8" x2={x2-8} y2="8" stroke={i<step?stages[i+1].c:"#1E293B"} strokeWidth="1.5" strokeDasharray={i<step?"":"3,3"} style={{transition:"stroke .3s"}}/>;
      })}
    </svg>

    {/* Detail panel */}
    {step >= 0 ? (
      <div style={{padding:14,borderRadius:12,background:`${stages[step].c}08`,border:`1.5px solid ${stages[step].c}25`,textAlign:"center",transition:"all .3s"}}>
        <div style={{fontSize: 12,color:"#64748B"}}>{lang === "tr" ? "Adım" : "Step"} {step+1}/{stages.length}</div>
        <div style={{fontSize: 21,fontWeight:800,fontFamily:"'Fira Code',monospace",color:stages[step].c,marginTop:2}}>{stages[step].l} → {stages[step].sub}</div>
        <div style={{fontSize: 14,color:"#94A3B8",marginTop:4}}>{stages[step].d}</div>
      </div>
    ) : (
      <div style={{padding:14,textAlign:"center",color:"#475569",fontSize: 14}}>{lang === "tr" ? "☝️ ▶ Akış butonuna basın veya kutulara tıklayın" : "☝️ Press ▶ Flow or click the boxes"}</div>
    )}

    <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"center"}}>
      <button onClick={()=>{setStep(0);setAuto(true);}} style={{padding:"6px 16px",borderRadius:10,border:"none",background:"#EC4899",color:"#fff",fontSize: 14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lang === "tr" ? "▶ Akış" : "▶ Flow"}</button>
      <button onClick={()=>setStep(s=>Math.max(-1,s-1))} style={{padding:"6px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>←</button>
      <button onClick={()=>setStep(s=>Math.min(stages.length-1,s+1))} style={{padding:"6px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>→</button>
      <button onClick={()=>{setStep(-1);setAuto(false);}} style={{padding:"6px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>↺</button>
    </div>
  </VizBox>);
};

// ─── RICH INTERACTIVE VIZ: TRAINING SIMULATOR (W5) ──────────────
const TrainingSimViz = () => {
  const lang = useLang();
  const [lr, setLr] = useState(0.01);
  const [epoch, setEpoch] = useState(0);
  const [running, setRunning] = useState(false);
  const [losses, setLosses] = useState([3.33]);
  const maxSteps = 40;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setEpoch(s => {
        if (s >= maxSteps) { setRunning(false); return maxSteps; }
        setLosses(prev => {
          const last = prev[prev.length - 1];
          const good = lr >= 0.005 && lr <= 0.05;
          const tooHigh = lr > 0.05;
          const noise = (Math.random()-0.5)*0.3;
          let delta;
          if (tooHigh) delta = noise + (Math.random()>0.4 ? 0.08 : -0.02);
          else if (good) delta = -0.035 - Math.random()*0.02 + noise*0.15;
          else delta = -0.008 - Math.random()*0.005 + noise*0.1;
          return [...prev, Math.max(1.6, Math.min(4.5, last + delta))];
        });
        return s + 1;
      });
    }, 150);
    return () => clearInterval(t);
  }, [running, lr]);

  const reset = () => { setEpoch(0); setLosses([3.33]); setRunning(false); };
  const lastLoss = losses[losses.length - 1];
  const lossColor = lastLoss > 3.0 ? "#EF4444" : lastLoss > 2.3 ? "#F59E0B" : "#10B981";
  const lrZone = lr > 0.05 ? (lang === "tr" ? "⚠️ Çok yüksek — patlama riski!" : "⚠️ Too high — explosion risk!") : lr < 0.005 ? (lang === "tr" ? "🐌 Çok düşük — yavaş öğrenme" : "🐌 Too low — slow learning") : (lang === "tr" ? "✅ İyi bölge" : "✅ Good range");

  return (<VizBox title={lang === "tr" ? "Eğitim Simülasyonu — Learning Rate Etkisini Dene" : "Training Simulator — Try Learning Rate Effects"} color="#EF4444">
    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:230}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{fontSize: 13,color:"#F59E0B",fontWeight:700}}>learning_rate</span>
          <span style={{fontSize: 16,fontFamily:"'Fira Code',monospace",color:"#E2E8F0",fontWeight:800}}>{lr.toFixed(3)}</span>
        </div>
        <input type="range" min={0.001} max={0.1} step={0.001} value={lr} onChange={e=>{setLr(+parseFloat(e.target.value).toFixed(3));reset();}} style={{width:"100%",accentColor:"#F59E0B",marginBottom:2}}/>
        <div style={{fontSize: 12,color:lr>0.05?"#EF4444":lr<0.005?"#64748B":"#10B981",marginBottom:8}}>{lrZone}</div>

        {/* Loss curve */}
        <div style={{position:"relative",background:"rgba(0,0,0,.2)",borderRadius:8,padding:"4px 4px 0 4px"}}>
          <svg viewBox="0 0 200 55" style={{width:"100%",height:75}}>
            <text x="2" y="8" fill="#64748B" fontSize="4">4.0</text>
            <text x="2" y="28" fill="#64748B" fontSize="4">3.0</text>
            <text x="2" y="50" fill="#64748B" fontSize="4">2.0</text>
            <line x1="14" y1="5" x2="14" y2="52" stroke="#ffffff08" strokeWidth=".5"/>
            {losses.map((l, i) => {
              if (i === 0) return null;
              const x1 = 14 + ((i-1)/maxSteps)*183;
              const x2 = 14 + (i/maxSteps)*183;
              const y1 = 52 - ((losses[i-1]-1.5)/3.0)*47;
              const y2 = 52 - ((l-1.5)/3.0)*47;
              return <line key={i} x1={x1} y1={Math.max(3,Math.min(52,y1))} x2={x2} y2={Math.max(3,Math.min(52,y2))} stroke={lossColor} strokeWidth="1.2"/>;
            })}
          </svg>
        </div>
      </div>

      <div style={{flex:1,minWidth:160}}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <div style={{flex:1,padding:10,borderRadius:10,background:`${lossColor}10`,textAlign:"center"}}>
            <div style={{fontSize: 11,color:"#64748B"}}>Loss</div>
            <div style={{fontSize: 23,fontWeight:800,fontFamily:"'Fira Code',monospace",color:lossColor}}>{lastLoss.toFixed(2)}</div>
          </div>
          <div style={{flex:1,padding:10,borderRadius:10,background:"rgba(255,255,255,.02)",textAlign:"center"}}>
            <div style={{fontSize: 11,color:"#64748B"}}>{lang === "tr" ? "Adım" : "Step"}</div>
            <div style={{fontSize: 23,fontWeight:800,fontFamily:"'Fira Code',monospace",color:"#0EA5E9"}}>{epoch}/{maxSteps}</div>
          </div>
        </div>

        {epoch >= maxSteps && (<div style={{padding:"8px 10px",borderRadius:8,fontSize: 13,marginBottom:8,
          background:lastLoss<2.5?"rgba(16,185,129,.08)":"rgba(239,68,68,.08)",
          color:lastLoss<2.5?"#10B981":"#EF4444",border:`1px solid ${lastLoss<2.5?"rgba(16,185,129,.2)":"rgba(239,68,68,.2)"}`}}>
          {lastLoss<2.5 ? `✅ İyi eğitim! Loss ${(3.33-lastLoss).toFixed(1)} düştü.` : `⚠️ Loss yeterince düşmedi. LR'ı ayarlayıp tekrar deneyin.`}
        </div>)}

        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>{reset();setTimeout(()=>setRunning(true),50);}} style={{flex:1,padding:"7px 14px",borderRadius:10,border:"none",background:"#EF4444",color:"#fff",fontSize: 14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lang === "tr" ? "▶ Eğit" : "▶ Train"}</button>
          <button onClick={()=>setRunning(false)} style={{padding:"7px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>⏸</button>
          <button onClick={reset} style={{padding:"7px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>↺</button>
        </div>
        <div style={{marginTop:8,fontSize: 12,color:"#64748B"}}>💡 LR'ı değiştirip tekrar eğitin — etkiyi gözlemleyin!</div>
      </div>
    </div>
  </VizBox>);
};

// ─── RICH INTERACTIVE VIZ: GENERATION PLAYGROUND (W6) ────────────
const GenerationPlaygroundViz = () => {
  const lang = useLang();
  const [temp, setTemp] = useState(0.8);
  const [step, setStep] = useState(-1);
  const [auto, setAuto] = useState(false);
  const nameMap = {
    0.2:{steps:["k","a","r","e","n"],label:lang === "tr" ? "Deterministik — her zaman aynı" : "Deterministic — always the same",color:"#0EA5E9"},
    0.5:{steps:["k","a","m","i","l"],label:lang === "tr" ? "Dengeli — gerçekçi ve çeşitli" : "Balanced — realistic and varied",color:"#10B981"},
    0.8:{steps:["k","e","l","a","n","i"],label:lang === "tr" ? "Yaratıcı — yeni kalıplar" : "Creative — new patterns",color:"#10B981"},
    1.2:{steps:["k","z","u","o","p"],label:lang === "tr" ? "Kaotik — çok rastgele" : "Chaotic — very random",color:"#EF4444"},
  };
  const tKey = temp<=0.3?0.2:temp<=0.6?0.5:temp<=1.0?0.8:1.2;
  const gen = nameMap[tKey];

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStep(s => { if (s >= gen.steps.length-1) { setAuto(false); return s; } return s+1; }), 500);
    return () => clearInterval(t);
  }, [auto, gen.steps.length]);

  // Simulated probability bars per step
  const probBars = gen.steps.map((ch, i) => {
    const others = "abcdefghijklmnopqrstuvwxyz".split("").filter(c => c !== ch).slice(0,3);
    const mainP = tKey <= 0.5 ? 0.45 + Math.random()*0.15 : tKey <= 1.0 ? 0.20+Math.random()*0.1 : 0.08+Math.random()*0.05;
    return [{ch,p:mainP,win:true}, ...others.map(c=>({ch:c,p:(1-mainP)/3+Math.random()*0.02,win:false}))];
  });

  return (<VizBox title={lang === "tr" ? "Üretim Oyun Alanı — Temperature ile İsim Üret" : "Generation Playground — Generate Names with Temperature"} color="#6366F1">
    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:220}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{fontSize: 13,color:"#6366F1",fontWeight:700}}>Temperature</span>
          <span style={{fontSize: 17,fontFamily:"'Fira Code',monospace",color:"#E2E8F0",fontWeight:800}}>{temp.toFixed(1)}</span>
        </div>
        <input type="range" min={0.1} max={1.5} step={0.1} value={temp} onChange={e=>{setTemp(+e.target.value);setStep(-1);setAuto(false);}} style={{width:"100%",accentColor:"#6366F1",marginBottom:2}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize: 10,color:"#64748B",marginBottom:8}}>
          <span>{lang === "tr" ? "0.1 (sivri)" : "0.1 (sharp)"}</span><span>{lang === "tr" ? "0.8 (dengeli)" : "0.8 (balanced)"}</span><span>{lang === "tr" ? "1.5 (düz)" : "1.5 (flat)"}</span>
        </div>

        {/* Distribution shape */}
        <div style={{padding:8,borderRadius:8,background:"rgba(255,255,255,.02)",marginBottom:8}}>
          <div style={{fontSize: 11,color:"#64748B",marginBottom:3}}>{lang === "tr" ? "Softmax dağılım şekli:" : "Softmax distribution shape:"}</div>
          <div style={{display:"flex",gap:1,alignItems:"flex-end",height:28}}>
            {Array.from({length:20},(_,i) => {
              const spread = temp * 3;
              const h = Math.exp(-((i-5)**2)/(2*spread*spread))*26;
              return <div key={i} style={{flex:1,height:Math.max(1,h),background:"#6366F1",borderRadius:"2px 2px 0 0",opacity:0.4+h/50,transition:"height .3s"}}/>;
            })}
          </div>
        </div>

        <div style={{padding:"6px 10px",borderRadius:8,background:`${gen.color}08`,border:`1px solid ${gen.color}20`,fontSize: 13,color:gen.color,marginBottom:6}}>
          {gen.label}
        </div>
      </div>

      <div style={{flex:1,minWidth:200}}>
        {/* Generated name display */}
        <div style={{fontSize: 12,color:"#64748B",marginBottom:4}}>{lang === "tr" ? "Üretilen isim (BOS ile başla):" : "Generated name (start with BOS):"}</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:8}}>
          <div style={{width:28,height:32,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 11,fontWeight:700,color:"#F59E0B",background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)"}}>BOS</div>
          {gen.steps.map((ch,i) => (
            <div key={i} style={{
              width:28,height:32,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize: 18,fontWeight:800,fontFamily:"'Fira Code',monospace",
              color:i<=step?"#E2E8F0":"#1E293B",
              background:i<=step?"rgba(99,102,241,.12)":"rgba(255,255,255,.02)",
              border:`1.5px solid ${i===step?"#6366F1":i<step?"rgba(99,102,241,.25)":"rgba(255,255,255,.04)"}`,
              transform:i===step?"scale(1.1)":"scale(1)",transition:"all .3s"
            }}>{i<=step?ch:"?"}</div>
          ))}
        </div>

        {/* Probability bars for current step */}
        {step >= 0 && step < probBars.length && (
          <div style={{marginBottom:8}}>
            <div style={{fontSize: 11,color:"#64748B",marginBottom:3}}>Adım {step+1} olasılıklar:</div>
            {probBars[step].map((b,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                <span style={{width:10,fontSize: 13,fontFamily:"'Fira Code',monospace",color:b.win?"#10B981":"#94A3B8",fontWeight:b.win?800:400}}>{b.ch}</span>
                <div style={{flex:1,height:8,background:"rgba(255,255,255,.03)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${b.p*100}%`,borderRadius:4,background:b.win?"#10B981":"#334155",transition:"width .3s"}}/>
                </div>
                <span style={{width:26,fontSize: 11,fontFamily:"'Fira Code',monospace",color:"#64748B",textAlign:"right"}}>{(b.p*100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>{setStep(0);setAuto(true);}} style={{flex:1,padding:"6px 14px",borderRadius:10,border:"none",background:"#6366F1",color:"#fff",fontSize: 14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lang === "tr" ? "▶ Üret" : "▶ Generate"}</button>
          <button onClick={()=>{setStep(-1);setAuto(false);}} style={{padding:"6px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#94A3B8",fontSize: 14,cursor:"pointer",fontFamily:"inherit"}}>↺</button>
        </div>
      </div>
    </div>
  </VizBox>);
};


// ─── Week 7 Viz ──────────────────────────────────────────────
const ScalingLawsViz = () => {
  const lang = useLang();
  const [hover, setHover] = useState(-1);
  const models = [
    {name:"microGPT",params:"3.6K",tokens:"192K",loss:2.0,year:2024,x:5,y:72,c:"#F59E0B",r:4},
    {name:"GPT-1",params:"117M",tokens:"4.6B",loss:1.1,year:2018,x:22,y:58,c:"#0EA5E9",r:5},
    {name:"GPT-2",params:"1.5B",tokens:"40B",loss:0.8,year:2019,x:38,y:47,c:"#8B5CF6",r:6},
    {name:"GPT-3",params:"175B",tokens:"300B",loss:0.5,year:2020,x:55,y:34,c:"#10B981",r:7},
    {name:"Chinchilla",params:"70B",tokens:"1.4T",loss:0.4,year:2022,x:62,y:28,c:"#EC4899",r:6},
    {name:"LLaMA-2",params:"70B",tokens:"2T",loss:0.35,year:2023,x:70,y:24,c:"#EF4444",r:6},
    {name:"GPT-4",params:"~1.8T",tokens:"~13T",loss:0.2,year:2023,x:85,y:14,c:"#6366F1",r:8},
  ];
  return (<VizBox title={lang === "tr" ? "Scaling Laws — Büyüklük vs Performans" : "Scaling Laws — Size vs Performance"} color="#14B8A6">
    <svg viewBox="0 0 100 85" style={{width:"100%",height:160,background:"rgba(0,0,0,.15)",borderRadius:10}}>
      <text x="50" y="82" fill="#64748B" fontSize="3" textAnchor="middle">{lang === "tr" ? "Parametre sayısı →" : "Parameter count →"}</text>
      <text x="2" y="45" fill="#64748B" fontSize="3" transform="rotate(-90,2,45)">{lang === "tr" ? "← Loss (düşük=iyi)" : "← Loss (lower=better)"}</text>
      {/* Trend line */}
      <polyline points={models.map(m=>`${m.x},${m.y}`).join(" ")} fill="none" stroke="#14B8A640" strokeWidth="1" strokeDasharray="3,2"/>
      {models.map((m,i)=>(
        <g key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(-1)} style={{cursor:"pointer"}}>
          <circle cx={m.x} cy={m.y} r={hover===i?m.r*1.4:m.r} fill={`${m.c}${hover===i?"":"90"}`} stroke={m.c} strokeWidth={hover===i?1.5:0.5} style={{transition:"all .2s"}}/>
          <text x={m.x} y={m.y-m.r-2} fill={m.c} fontSize="3" fontWeight="700" textAnchor="middle">{m.name}</text>
        </g>
      ))}
    </svg>
    {hover >= 0 && (
      <div style={{padding:"8px 12px",borderRadius:8,background:`${models[hover].c}10`,border:`1px solid ${models[hover].c}25`,fontSize: 13,color:"#E2E8F0",marginTop:4}}>
        <strong style={{color:models[hover].c}}>{models[hover].name}</strong> ({models[hover].year}): {models[hover].params} parametre, {models[hover].tokens} token ile eğitildi. Loss ≈ {models[hover].loss}
      </div>
    )}
    {hover < 0 && <div style={{fontSize: 12,color:"#475569",textAlign:"center",marginTop:4}}>💡 Modellerin üzerine gelin → detay görün</div>}
  </VizBox>);
};

// ─── WEEK 7 VIZ: EVOLUTION TIMELINE ─────────────────────────────
const EvolutionTimelineViz = () => {
  const lang = useLang();
  const [sel, setSel] = useState(0);
  const eras = [
    {year:"2017",name:"Transformer",icon:"📄",c:"#0EA5E9",desc:"'Attention Is All You Need' — RNN'yi öldüren paper",detail:"Vaswani et al. Encoder-decoder, 65M param. Çeviri görevi. Self-attention + feed-forward = yeter!",cost:"~$10K"},
    {year:"2018",name:"GPT-1",icon:"🌱",c:"#10B981",desc:"İlk decoder-only language model",detail:"117M param, BookCorpus (4.6B token). Tek yönlü attention. Fine-tuning ile çeşitli görevler.",cost:"~$50K"},
    {year:"2019",name:"GPT-2",icon:"📈",c:"#8B5CF6",desc:"'Too dangerous to release' — 1.5B parametre",detail:"WebText (40B token). Zero-shot yetenekler! Makale yazma, kod üretme başlangıcı.",cost:"~$250K"},
    {year:"2020",name:"GPT-3",icon:"🚀",c:"#F59E0B",desc:"175B parametre — few-shot learning devrimi",detail:"300B token, 96 katman, 96 head. In-context learning keşfi. API olarak sunuldu.",cost:"~$5M"},
    {year:"2022",name:"ChatGPT",icon:"💬",c:"#EF4444",desc:"RLHF ile hizalanmış GPT-3.5 — dünyayı değiştirdi",detail:"InstructGPT + RLHF + SFT. 2 ayda 100M kullanıcı! Dialog formatı, güvenlik filtreleri.",cost:"~$10M"},
    {year:"2023",name:"GPT-4 / LLaMA",icon:"🌍",c:"#6366F1",desc:"Multimodal + açık kaynak patlaması",detail:"GPT-4: ~1.8T MoE, görüntü girdi. LLaMA: açık ağırlıklar → araştırma devrimi. Mistral, Qwen.",cost:"$100M+"},
    {year:"2024+",name:"Frontier",icon:"⚡",c:"#14B8A6",desc:"Agent, MoE, uzun context, multimodal, reasoning",detail:"Claude 3.5, Gemini 1.5 (1M context), DeepSeek-V3 (MoE), o1 (reasoning). Açık kaynak = GPT-4 seviyesi.",cost:"$200M+"},
  ];

  return (<VizBox title={lang === "tr" ? "Evrim Zaman Çizelgesi — Transformer'dan Günümüze" : "Evolution Timeline — From Transformer to Today"} color="#14B8A6">
    <div style={{display:"flex",gap:2,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
      {eras.map((e,i)=>(
        <button key={i} onClick={()=>setSel(i)} style={{
          flex:"0 0 auto",padding:"5px 8px",borderRadius:8,border:`1.5px solid ${sel===i?e.c:`${e.c}30`}`,
          background:sel===i?`${e.c}15`:"transparent",cursor:"pointer",fontFamily:"inherit",
          display:"flex",flexDirection:"column",alignItems:"center",gap:1,minWidth:46,transition:"all .3s",
          transform:sel===i?"scale(1.05)":"scale(1)"
        }}>
          <span style={{fontSize: 17}}>{e.icon}</span>
          <span style={{fontSize: 10,fontWeight:700,color:sel===i?e.c:"#64748B"}}>{e.year}</span>
        </button>
      ))}
    </div>

    {/* Timeline bar */}
    <div style={{position:"relative",height:6,background:"rgba(255,255,255,.03)",borderRadius:3,marginBottom:10}}>
      <div style={{position:"absolute",left:0,top:0,height:6,borderRadius:3,width:`${(sel/(eras.length-1))*100}%`,background:eras[sel].c,transition:"all .4s"}}/>
      {eras.map((_,i)=>(
        <div key={i} style={{position:"absolute",left:`${(i/(eras.length-1))*100}%`,top:-1,width:8,height:8,borderRadius:4,
          background:i<=sel?eras[i].c:"#1E293B",border:`2px solid ${i===sel?eras[i].c:"#334155"}`,
          transform:"translateX(-4px)",transition:"all .3s",cursor:"pointer"}} onClick={()=>setSel(i)}/>
      ))}
    </div>

    {/* Detail card */}
    <div style={{padding:14,borderRadius:12,background:`${eras[sel].c}08`,border:`1.5px solid ${eras[sel].c}25`,transition:"all .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div>
          <span style={{fontSize: 21,marginRight:6}}>{eras[sel].icon}</span>
          <span style={{fontSize: 18,fontWeight:800,color:eras[sel].c}}>{eras[sel].name}</span>
          <span style={{fontSize: 13,color:"#64748B",marginLeft:6}}>({eras[sel].year})</span>
        </div>
        <span style={{fontSize: 12,padding:"3px 8px",borderRadius:6,background:`${eras[sel].c}15`,color:eras[sel].c,fontWeight:700}}>~{eras[sel].cost}</span>
      </div>
      <div style={{fontSize: 15,color:"#E2E8F0",fontWeight:600,marginBottom:4}}>{eras[sel].desc}</div>
      <div style={{fontSize: 13,color:"#94A3B8",lineHeight:1.5}}>{eras[sel].detail}</div>
    </div>
    <div style={{marginTop:6,fontSize: 11,color:"#475569",textAlign:"center"}}>{lang === "tr" ? "← → tıklayarak zaman çizelgesinde gezinin" : "← → click to navigate the timeline"}</div>
  </VizBox>);
};

// ─── WEEK 7 VIZ: HARDWARE EVOLUTION ─────────────────────────────
const HardwareEvolutionViz = () => {
  const lang = useLang();
  const [sel, setSel] = useState(1);
  const hw = [
    {name:"CPU",icon:"🖥️",c:"#64748B",cores:"8-16",speed:"~0.5 TFLOPS",mem:"64GB DDR5",cost:"$500",note:"Sıralı işlem, genel amaçlı. microGPT burada çalışır."},
    {name:"GPU (A100)",icon:"🎮",c:"#10B981",cores:"6,912 CUDA",speed:"312 TFLOPS",mem:"80GB HBM3",cost:"$10K",note:"Paralel matris çarpımı. LLM eğitiminin standardı."},
    {name:"TPU v5",icon:"🧠",c:"#0EA5E9",cores:lang === "tr" ? "Özel MXU" : "Custom MXU",speed:"459 TFLOPS",mem:"16GB HBM",cost:"Cloud only",note:"Google'ın özel AI çipi. Gemini burada eğitildi."},
    {name:"Groq LPU",icon:"⚡",c:"#F59E0B",cores:lang === "tr" ? "Özel TSP" : "Custom TSP",speed:"750 TFLOPS",mem:"230MB SRAM",cost:"Cloud only",note:"Ultra-düşük latency inference. Derleyici tabanlı — GPU'dan 10× hızlı inference."},
  ];
  return (<VizBox title={lang === "tr" ? "Donanım Evrimi — CPU'dan AI Çiplerine" : "Hardware Evolution — From CPUs to AI Chips"} color="#14B8A6">
    <div style={{display:"flex",gap:4,marginBottom:10}}>
      {hw.map((h,i)=>(
        <button key={i} onClick={()=>setSel(i)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:`1.5px solid ${sel===i?h.c:`${h.c}30`}`,
          background:sel===i?`${h.c}12`:"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .3s"}}>
          <div style={{fontSize: 23}}>{h.icon}</div>
          <div style={{fontSize: 11,fontWeight:700,color:sel===i?h.c:"#64748B"}}>{h.name}</div>
        </button>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
      {[[lang === "tr" ? "Çekirdek" : "Cores",hw[sel].cores],[lang === "tr" ? "Hız" : "Speed",hw[sel].speed],[lang === "tr" ? "Bellek" : "Memory",hw[sel].mem],[lang === "tr" ? "Fiyat" : "Price",hw[sel].cost]].map(([l,v],i)=>(
        <div key={i} style={{padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,.02)"}}>
          <div style={{fontSize: 11,color:"#64748B"}}>{l}</div>
          <div style={{fontSize: 15,fontWeight:700,fontFamily:"'Fira Code',monospace",color:hw[sel].c}}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{fontSize: 13,color:"#94A3B8",padding:"6px 10px",borderRadius:8,background:`${hw[sel].c}06`}}>{hw[sel].note}</div>
  </VizBox>);
};

// ─── WEEK 7 VIZ: TRAINING PIPELINE ─────────────────────────────
const TrainingPipelineViz = () => {
  const lang = useLang();
  const [step, setStep] = useState(0);
  const stages = [
    {name:"Pre-training",icon:"📚",c:"#0EA5E9",sub:"Next-token prediction",desc:"İnternet-ölçeğinde metin. microGPT'de öğrendiğiniz TEMELDEKİ adım — milyarlarca token, haftalarca GPU.",data:"Trilyon token",cost:"%95 bütçe"},
    {name:"SFT",icon:"👨‍🏫",c:"#10B981",sub:"Supervised Fine-tuning",desc:"İnsan yazımı soru-cevap çiftleri ile fine-tune. Model 'assistant' gibi davranmayı öğrenir.",data:"~100K örnek",cost:"%3 bütçe"},
    {name:"RLHF / DPO",icon:"👍",c:"#EC4899",sub:lang === "tr" ? "İnsan Hizalama" : "Human Alignment",desc:"İnsan tercihleri: 'A yanıtı mı B mi daha iyi?' Reward model eğitimi + PPO/DPO ile güncelleme.",data:"~50K tercih",cost:"%2 bütçe"},
  ];
  return (<VizBox title={lang === "tr" ? "Modern Eğitim Pipeline'ı — 3 Aşama" : "Modern Training Pipeline — 3 Stages"} color="#14B8A6">
    <div style={{display:"flex",gap:6,marginBottom:10}}>
      {stages.map((s,i)=>(
        <div key={i} onClick={()=>setStep(i)} style={{flex:1,padding:"10px 6px",borderRadius:10,cursor:"pointer",textAlign:"center",
          border:`1.5px solid ${step===i?s.c:`${s.c}25`}`,background:step===i?`${s.c}12`:"transparent",transition:"all .3s",
          transform:step===i?"scale(1.03)":"scale(1)"}}>
          <div style={{fontSize: 25}}>{s.icon}</div>
          <div style={{fontSize: 12,fontWeight:700,color:step===i?s.c:"#64748B"}}>{s.name}</div>
          <div style={{fontSize: 10,color:"#475569"}}>{s.sub}</div>
        </div>
      ))}
    </div>
    <div style={{display:"flex",gap:4,marginBottom:6}}>
      {stages.map((_,i)=>(<div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?stages[i].c:"#1E293B",transition:"all .3s"}}/>))}
    </div>
    <div style={{padding:10,borderRadius:10,background:`${stages[step].c}08`,border:`1px solid ${stages[step].c}20`}}>
      <div style={{fontSize: 14,color:"#E2E8F0",marginBottom:4}}>{stages[step].desc}</div>
      <div style={{display:"flex",gap:8,fontSize: 12}}>
        <span style={{color:stages[step].c}}>📊 {stages[step].data}</span>
        <span style={{color:"#64748B"}}>💰 {stages[step].cost}</span>
      </div>
    </div>
  </VizBox>);
};

// ─── WEEK 7 VIZ: TOKEN EVOLUTION ────────────────────────────────
const TokenEvolutionViz = () => {
  const [sel, setSel] = useState(0);
  const methods = [
    {name:"Karakter (microGPT)",c:"#F59E0B",vocab:"27",example:"'playing' → p,l,a,y,i,n,g (7 token)",pro:"Basit, hiç OOV yok",con:"Çok uzun diziler, anlam yok"},
    {name:"BPE (GPT-2/3)",c:"#8B5CF6",vocab:"50,257",example:"'playing' → play + ing (2 token)",pro:"Dengeli, alt-kelime semantiği",con:"Tokenizer eğitimi gerekli"},
    {name:"SentencePiece (LLaMA)",c:"#10B981",vocab:"32,000",example:"'playing' → ▁play + ing (2 token)",pro:"Unicode-aware, dil bağımsız",con:"Daha yavaş tokenization"},
    {name:"tiktoken (GPT-4)",c:"#6366F1",vocab:"100,277",example:"'playing' → playing (1 token!)",pro:"Çok verimli, büyük vocab",con:"Bellek kullanımı yüksek"},
  ];
  return (<VizBox title="Tokenization Evrimi — Karakterden BPE'ye" color="#14B8A6">
    <div style={{display:"flex",gap:3,marginBottom:8}}>
      {methods.map((m,i)=>(
        <button key={i} onClick={()=>setSel(i)} style={{flex:1,padding:"5px 4px",borderRadius:8,border:`1.5px solid ${sel===i?m.c:`${m.c}25`}`,
          background:sel===i?`${m.c}12`:"transparent",color:sel===i?m.c:"#64748B",fontSize: 10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .3s"}}>
          {m.name}
        </button>
      ))}
    </div>
    <div style={{padding:10,borderRadius:10,background:`${methods[sel].c}08`,border:`1px solid ${methods[sel].c}20`}}>
      <div style={{fontSize: 14,fontFamily:"'Fira Code',monospace",color:methods[sel].c,marginBottom:4}}>{methods[sel].example}</div>
      <div style={{fontSize: 13,color:"#94A3B8",marginBottom:2}}>Vocab: <strong style={{color:"#E2E8F0"}}>{methods[sel].vocab}</strong> token</div>
      <div style={{fontSize: 12,color:"#10B981"}}>✅ {methods[sel].pro}</div>
      <div style={{fontSize: 12,color:"#EF4444"}}>⚠️ {methods[sel].con}</div>
    </div>
  </VizBox>);
};

// ─── WEEK 7 VIZ: ATTENTION EVOLUTION ────────────────────────────
const AttentionEvolutionViz = () => {
  const [sel, setSel] = useState(0);
  const variants = [
    {name:"Vanilla (Bu kod)",c:"#F59E0B",complexity:"O(n²)",mem:"O(n²)",desc:"Her token tüm önceki tokenlara bakar. Basit ama n² bellek."},
    {name:"Multi-Query (2019)",c:"#0EA5E9",complexity:"O(n²)",mem:"O(n²/h)",desc:"K,V tek kopya, Q head başına. KV cache %4×↓. PaLM, Falcon."},
    {name:"Flash Attention (2022)",c:"#10B981",complexity:"O(n²)",mem:"O(n)",desc:"Aynı matematik, farklı bellek erişim düzeni. IO-aware tiling → 2-4× hızlı!"},
    {name:"Sliding Window (Mistral)",c:"#EC4899",complexity:"O(n×w)",mem:"O(w)",desc:"Sabit pencere (w=4096). Ötesini katman katman görebilir → ∞ teorik context."},
  ];
  return (<VizBox title="Attention Evrimi — Vanilla'dan Flash'a" color="#14B8A6">
    <div style={{display:"flex",gap:3,marginBottom:8}}>
      {variants.map((v,i)=>(
        <button key={i} onClick={()=>setSel(i)} style={{flex:1,padding:"5px 4px",borderRadius:8,border:`1.5px solid ${sel===i?v.c:`${v.c}25`}`,
          background:sel===i?`${v.c}12`:"transparent",color:sel===i?v.c:"#64748B",fontSize: 10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .3s"}}>
          {v.name}
        </button>
      ))}
    </div>
    <div style={{padding:10,borderRadius:10,background:`${variants[sel].c}08`,border:`1px solid ${variants[sel].c}20`}}>
      <div style={{display:"flex",gap:12,marginBottom:4}}>
        <span style={{fontSize: 13,color:"#64748B"}}>Hesaplama: <strong style={{color:variants[sel].c}}>{variants[sel].complexity}</strong></span>
        <span style={{fontSize: 13,color:"#64748B"}}>Bellek: <strong style={{color:variants[sel].c}}>{variants[sel].mem}</strong></span>
      </div>
      <div style={{fontSize: 13,color:"#94A3B8"}}>{variants[sel].desc}</div>
    </div>
  </VizBox>);
};

// ─── WEEK 7 VIZ: OPENSOURCE MAP ─────────────────────────────────
const OpensourceMapViz = () => {
  const lang = useLang();
  const [sel, setSel] = useState(-1);
  const models = [
    {name:"LLaMA 3.1",org:"Meta",params:"405B",c:"#0EA5E9",desc:"Açık ağırlık devrimi. 128K context. Araştırma patlamasını tetikledi."},
    {name:"Mistral",org:"Mistral AI",params:"7-22B",c:"#F59E0B",desc:"Küçük ama güçlü. Sliding window attention. MoE (Mixtral 8×22B)."},
    {name:"DeepSeek-V3",org:"DeepSeek",params:"671B MoE",c:"#10B981",desc:"Aktif: 37B. Ücretsiz API. Çin'den açık kaynak lider."},
    {name:"Qwen 2.5",org:"Alibaba",params:"72B",c:"#EC4899",desc:"Çok dilli. Kod, matematik, reasoning odaklı. Coder varyantı çok güçlü."},
    {name:"Gemma 2",org:"Google",params:"27B",c:"#8B5CF6",desc:"Küçük, verimli. Knowledge distillation ile eğitilmiş."},
  ];
  return (<VizBox title={lang === "tr" ? "Açık Kaynak Modeller — 2024 Haritası" : "Open Source Models — 2024 Map"} color="#14B8A6">
    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
      {models.map((m,i)=>(
        <button key={i} onClick={()=>setSel(sel===i?-1:i)} style={{padding:"6px 10px",borderRadius:10,border:`1.5px solid ${sel===i?m.c:`${m.c}25`}`,
          background:sel===i?`${m.c}12`:"transparent",cursor:"pointer",fontFamily:"inherit",transition:"all .3s"}}>
          <div style={{fontSize: 13,fontWeight:700,color:sel===i?m.c:"#94A3B8"}}>{m.name}</div>
          <div style={{fontSize: 10,color:"#475569"}}>{m.org} • {m.params}</div>
        </button>
      ))}
    </div>
    {sel >= 0 ? (
      <div style={{padding:10,borderRadius:10,background:`${models[sel].c}08`,border:`1px solid ${models[sel].c}20`,fontSize: 13,color:"#94A3B8"}}>{models[sel].desc}</div>
    ) : (
      <div style={{fontSize: 12,color:"#475569",textAlign:"center",padding:8}}>💡 Bir modele tıklayın → detay görün</div>
    )}
  </VizBox>);
};

// ─── WEEK 7 VIZ: TRENDS RADAR ───────────────────────────────────
const TrendsRadarViz = () => {
  const lang = useLang();
  const [sel, setSel] = useState(0);
  const trends = [
    {name:"MoE",icon:"🧩",c:"#F59E0B",desc:"Mixture of Experts: 8 uzman ağ, her token sadece 2'sini aktive eder. Toplam parametre çok ama aktif parametre az → verimli. GPT-4, Mixtral, DeepSeek-V3."},
    {name:"RAG",icon:"📚",c:"#0EA5E9",desc:"Retrieval-Augmented Generation: Model dış bilgi tabanından (dokümanlar, web) ilgili bilgiyi çekip yanıta ekler. Halüsinasyonu azaltır, güncel bilgi sağlar."},
    {name:"Agent",icon:"🤖",c:"#10B981",desc:"AI Agent: Model araç kullanır — kod çalıştırma, web arama, API çağrıları. ReAct, function calling, tool use. Claude, GPT-4 ile entegre."},
    {name:"Multimodal",icon:"🎨",c:"#EC4899",desc:"Metin + görüntü + ses + video. GPT-4V, Gemini, Claude 3: görüntü anlama. Sora: video üretimi. Whisper: ses→metin."},
    {name:"Reasoning",icon:"🧠",c:"#6366F1",desc:"Chain-of-thought, o1/o3: düşünme zinciri ile karmaşık problemleri adım adım çözme. Matematik, kod, mantık görevlerinde büyük sıçrama."},
  ];
  return (<VizBox title={lang === "tr" ? "Güncel Trendler — AI Nereye Gidiyor?" : "Current Trends — Where is AI Headed?"} color="#14B8A6">
    <div style={{display:"flex",gap:4,marginBottom:10}}>
      {trends.map((t,i)=>(
        <button key={i} onClick={()=>setSel(i)} style={{flex:1,padding:"8px 4px",borderRadius:10,
          border:`1.5px solid ${sel===i?t.c:`${t.c}25`}`,background:sel===i?`${t.c}12`:"transparent",
          cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .3s"}}>
          <div style={{fontSize: 21}}>{t.icon}</div>
          <div style={{fontSize: 11,fontWeight:700,color:sel===i?t.c:"#64748B"}}>{t.name}</div>
        </button>
      ))}
    </div>
    <div style={{padding:12,borderRadius:10,background:`${trends[sel].c}08`,border:`1px solid ${trends[sel].c}20`,transition:"all .3s"}}>
      <div style={{fontSize: 14,color:"#E2E8F0",lineHeight:1.6}}>{trends[sel].desc}</div>
    </div>
  </VizBox>);
};



// ─── Concept Map Viz ─────────────────────────────────────────────
const ConceptMapViz = () => {
  const nodes = [
    { id: "data", l: "Veri (names.txt)", x: 50, y: 20, c: "#0EA5E9", w: 0 },
    { id: "tok", l: "Tokenization", x: 50, y: 55, c: "#8B5CF6", w: 1 },
    { id: "emb", l: "Embedding", x: 20, y: 90, c: "#0EA5E9", w: 1 },
    { id: "pos", l: "Pos Embedding", x: 80, y: 90, c: "#8B5CF6", w: 1 },
    { id: "norm", l: "RMSNorm", x: 50, y: 125, c: "#F59E0B", w: 4 },
    { id: "attn", l: "Self-Attention", x: 25, y: 160, c: "#10B981", w: 3 },
    { id: "mlp", l: "MLP (FFN)", x: 75, y: 160, c: "#EC4899", w: 4 },
    { id: "res", l: "Residual", x: 50, y: 195, c: "#F59E0B", w: 4 },
    { id: "logit", l: "Logits → Softmax", x: 50, y: 230, c: "#EF4444", w: 6 },
    { id: "loss", l: "Cross-Entropy Loss", x: 20, y: 265, c: "#EF4444", w: 5 },
    { id: "grad", l: "Autograd (Backward)", x: 50, y: 300, c: "#F59E0B", w: 2 },
    { id: "adam", l: "Adam Optimizer", x: 80, y: 265, c: "#EC4899", w: 5 },
    { id: "samp", l: "Sampling", x: 80, y: 230, c: "#6366F1", w: 6 },
  ];
  const edges = [
    ["data", "tok"], ["tok", "emb"], ["tok", "pos"], ["emb", "norm"], ["pos", "norm"],
    ["norm", "attn"], ["norm", "mlp"], ["attn", "res"], ["mlp", "res"],
    ["res", "logit"], ["logit", "loss"], ["loss", "grad"], ["grad", "adam"],
    ["logit", "samp"],
  ];
  const nMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  return (
    <div style={{ margin: "14px 0", padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 19 }}>🗺️</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: ".06em" }}>Kavram Haritası — Tüm Bileşenler</span>
      </div>
      <svg viewBox="0 0 100 320" style={{ width: "100%", maxWidth: 500, margin: "0 auto", display: "block" }}>
        {edges.map(([a, b], i) => {
          const from = nMap[a], to = nMap[b];
          return <line key={i} x1={from.x} y1={from.y + 8} x2={to.x} y2={to.y - 8} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />;
        })}
        {nodes.map((n) => (
          <g key={n.id}>
            <rect x={n.x - 18} y={n.y - 8} width={36} height={16} rx="4" fill={`${n.c}15`} stroke={`${n.c}40`} strokeWidth="0.5" />
            <text x={n.x} y={n.y + 1} textAnchor="middle" fill={n.c} fontSize="3.5" fontWeight="600">{n.l}</text>
            <text x={n.x} y={n.y + 6} textAnchor="middle" fill="#475569" fontSize="2.2">H{n.w}</text>
          </g>
        ))}
      </svg>
      <div style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "#64748B" }}>Her kutu bir kavram, H# = öğrenilen hafta. Oklar veri akışını gösterir.</div>
    </div>
  );
};





// ═══ W8: ADVANCED TECHNIQUES ═══

const BpeInfoTheoryViz = () => {
  const lang = useLang();
  const [merges, setMerges] = useState(0);
  const corpus0 = "t h e _ c a t _ s a t _ o n _ t h e _ m a t".split(" ");
  const mergeSteps = [
    { pair: "t h", result: "th", freq: 3 },
    { pair: "th e", result: "the", freq: 2 },
    { pair: "a t", result: "at", freq: 2 },
    { pair: "_ the", result: "_the", freq: 2 },
  ];
  const getCorpus = (step) => {
    let tokens = [...corpus0];
    for (let i = 0; i < Math.min(step, mergeSteps.length); i++) {
      const [a, b] = mergeSteps[i].pair.split(" ");
      const merged = [];
      for (let j = 0; j < tokens.length; j++) {
        if (j < tokens.length - 1 && tokens[j] === a && tokens[j+1] === b) {
          merged.push(mergeSteps[i].result); j++;
        } else merged.push(tokens[j]);
      }
      tokens = merged;
    }
    return tokens;
  };
  const cur = getCorpus(merges);
  const vocabSize = new Set(cur).size;
  const entropy = -[...new Set(cur)].reduce((s, t) => {
    const p = cur.filter(x => x === t).length / cur.length;
    return s + p * Math.log2(p);
  }, 0);

  return (<VizBox title={lang === "tr" ? "BPE Bilgi-Teorik Sıkıştırma" : "BPE Information-Theoretic Compression"} color="#E11D48">
    <div style={{ fontSize: 13, color: VB.muted, marginBottom: 10 }}>{lang === "tr" ? "Her merge entropi'yi düşürür. Kaydırıcı ile BPE adımlarını takip edin:" : "Each merge reduces entropy. Track BPE steps with the slider:"}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ color: "#E11D48", fontSize: 13, fontWeight: 700, minWidth: 70 }}>Merge: {merges}/{mergeSteps.length}</span>
      <input type="range" min="0" max={mergeSteps.length} value={merges} onChange={e => setMerges(+e.target.value)} style={{ flex: 1 }} />
    </div>
    {merges > 0 && <div style={{ padding: "6px 10px", borderRadius: 8, background: "#E11D4808", border: "1px solid #E11D4820", marginBottom: 8, fontSize: 13 }}>
      <span style={{ color: "#E11D48", fontWeight: 700 }}>Merge {merges}:</span>
      <span style={{ color: VB.txt, marginLeft: 6 }}>"{mergeSteps[merges-1].pair}" → "{mergeSteps[merges-1].result}" (×{mergeSteps[merges-1].freq})</span>
    </div>}
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "10px", background: VB.card, borderRadius: 10, border: `1px solid ${VB.border}`, marginBottom: 10 }}>
      {cur.map((t, i) => <span key={i} style={{ padding: "3px 7px", borderRadius: 5, fontSize: 14, fontWeight: 700, fontFamily: "'Fira Code', monospace", background: t.length > 1 ? "#E11D4815" : "#1e293b", color: t.length > 1 ? "#E11D48" : VB.txt, border: `1px solid ${t.length > 1 ? "#E11D4830" : VB.border}` }}>{t}</span>)}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <StatBox value={cur.length} label={lang === "tr" ? "Token sayısı" : "Token count"} color="#0EA5E9" />
      <StatBox value={vocabSize} label="Vocab" color="#8B5CF6" />
      <StatBox value={entropy.toFixed(2)} label={lang === "tr" ? "Entropi (bit)" : "Entropy (bits)"} color="#E11D48" />
    </div>
  </VizBox>);
};

const HessianLandscapeViz = () => {
  const lang = useLang();
  const [sharpness, setSharpness] = useState(1.0);
  const W = 240, H = 120;
  const points = Array.from({length: 60}, (_, i) => {
    const x = (i - 30) / 10;
    const y = sharpness * x * x;
    return { x: W/2 + x * 8, y: H - 15 - Math.min(y * 8, H - 25) };
  });
  const pts = points.map(p => `${p.x},${p.y}`).join(" ");
  const eigenLabel = sharpness > 2 ? (lang === "tr" ? "⚠️ Keskin (overfit riski)" : "⚠️ Sharp (overfit risk)") 
    : sharpness > 0.5 ? (lang === "tr" ? "✓ Orta" : "✓ Medium")
    : (lang === "tr" ? "✅ Düz (iyi genelleme)" : "✅ Flat (good generalization)");
  const color = sharpness > 2 ? "#F43F5E" : sharpness > 0.5 ? "#FBBF24" : "#10B981";

  return (<VizBox title={lang === "tr" ? "Hessian — Loss Yüzeyi Eğriliği" : "Hessian — Loss Surface Curvature"} color="#F59E0B">
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ color: VB.muted, fontSize: 12, fontWeight: 700, minWidth: 90 }}>λ_max = {sharpness.toFixed(1)}</span>
      <input type="range" min="0.1" max="4" step="0.1" value={sharpness} onChange={e => setSharpness(+e.target.value)} style={{ flex: 1 }} />
    </div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: VB.card, borderRadius: 10 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={W/2} cy={H-15} r="5" fill={color} opacity="0.8" />
      <text x={W/2} y={H-3} textAnchor="middle" fill={VB.dim} fontSize="8">w*</text>
      <text x={W/2} y={12} textAnchor="middle" fill={color} fontSize="9" fontWeight="700">{eigenLabel}</text>
    </svg>
    <div style={{ fontSize: 12, color: VB.muted, marginTop: 6, textAlign: "center" }}>
      {lang === "tr" ? "λ_max küçük = düz minimum = iyi genelleme. λ_max büyük = keskin = overfit." : "Small λ_max = flat minimum = good generalization. Large λ_max = sharp = overfit."}
    </div>
  </VizBox>);
};

const HeadPruningViz = () => {
  const lang = useLang();
  const [pruneThresh, setPruneThresh] = useState(0.3);
  const heads = Array.from({length: 12}, (_, i) => ({
    id: i, importance: [0.92, 0.85, 0.12, 0.78, 0.05, 0.67, 0.15, 0.88, 0.03, 0.71, 0.45, 0.22][i],
    label: `H${i}`
  }));
  const pruned = heads.filter(h => h.importance < pruneThresh);
  const kept = heads.filter(h => h.importance >= pruneThresh);

  return (<VizBox title={lang === "tr" ? "Attention Head Pruning — Taylor Skoru" : "Attention Head Pruning — Taylor Score"} color="#EC4899">
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ color: VB.muted, fontSize: 12, fontWeight: 700, minWidth: 110 }}>{lang === "tr" ? "Eşik" : "Threshold"}: {pruneThresh.toFixed(2)}</span>
      <input type="range" min="0.05" max="0.9" step="0.05" value={pruneThresh} onChange={e => setPruneThresh(+e.target.value)} style={{ flex: 1 }} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginBottom: 10 }}>
      {heads.map(h => {
        const isPruned = h.importance < pruneThresh;
        return <div key={h.id} style={{
          padding: "6px 4px", borderRadius: 8, textAlign: "center",
          background: isPruned ? "#F43F5E08" : "#10B98108",
          border: `1.5px solid ${isPruned ? "#F43F5E30" : "#10B98130"}`,
          opacity: isPruned ? 0.5 : 1, transition: "all 0.3s",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: isPruned ? "#F43F5E" : "#10B981" }}>{h.label}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: isPruned ? "#F43F5E" : VB.txt, fontFamily: "'Fira Code', monospace" }}>{h.importance.toFixed(2)}</div>
          <div style={{ fontSize: 9, color: isPruned ? "#F43F5E" : "#10B981", fontWeight: 700 }}>{isPruned ? "✕ PRUNE" : "✓ KEEP"}</div>
        </div>;
      })}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <StatBox value={kept.length} label={lang === "tr" ? "Kalan" : "Kept"} color="#10B981" />
      <StatBox value={pruned.length} label={lang === "tr" ? "Çıkarılan" : "Pruned"} color="#F43F5E" />
      <StatBox value={`${Math.round(pruned.length/12*100)}%`} label={lang === "tr" ? "Hız kazancı" : "Speedup"} color="#FBBF24" />
    </div>
  </VizBox>);
};

const IsotropyViz = () => {
  const lang = useLang();
  const [mode, setMode] = useState(0);
  const modes = [
    { name: lang === "tr" ? "Anizotrop (kötü)" : "Anisotropic (bad)", avgSim: 0.92, spread: 15 },
    { name: lang === "tr" ? "Whitening sonrası" : "After whitening", avgSim: 0.31, spread: 60 },
    { name: lang === "tr" ? "İzotrop (ideal)" : "Isotropic (ideal)", avgSim: 0.05, spread: 90 },
  ];
  const m = modes[mode];
  const W = 200, H = 200, cx = W/2, cy = H/2;
  const vectors = Array.from({length: 20}, (_, i) => {
    const baseAngle = (i / 20) * 2 * Math.PI;
    const spread = (m.spread / 90) * Math.PI;
    const angle = (mode === 0 ? 0.3 : 0) + baseAngle * (spread / Math.PI);
    const r = 40 + Math.random() * 30;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  return (<VizBox title={lang === "tr" ? "Embedding İzotropi" : "Embedding Isotropy"} color="#8B5CF6">
    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
      {modes.map((md, i) => <button key={i} onClick={() => setMode(i)} style={{
        flex: 1, padding: "6px", borderRadius: 8, border: `1px solid ${mode === i ? "#8B5CF630" : VB.border}`,
        background: mode === i ? "#8B5CF610" : "transparent", color: mode === i ? "#8B5CF6" : VB.muted,
        fontSize: 11, fontWeight: 700, cursor: "pointer"
      }}>{md.name}</button>)}
    </div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", background: VB.card, borderRadius: 10, margin: "0 auto" }}>
      <circle cx={cx} cy={cy} r={2} fill={VB.dim} />
      {vectors.map((v, i) => <g key={i}>
        <line x1={cx} y1={cy} x2={v.x} y2={v.y} stroke="#8B5CF6" strokeWidth="1.5" opacity="0.5" />
        <circle cx={v.x} cy={v.y} r="3" fill="#8B5CF6" />
      </g>)}
    </svg>
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <StatBox value={m.avgSim.toFixed(2)} label={lang === "tr" ? "Ort. cos sim" : "Avg cos sim"} color={m.avgSim > 0.5 ? "#F43F5E" : "#10B981"} />
      <StatBox value={(1 - m.avgSim).toFixed(2)} label={lang === "tr" ? "İzotropi skoru" : "Isotropy score"} color="#8B5CF6" />
    </div>
  </VizBox>);
};

const NumericalStabilityViz = () => {
  const lang = useLang();
  const [logits, setLogits] = useState([3.0, 1.0, 0.5]);
  const [scale, setScale] = useState(1);
  const scaled = logits.map(l => l * scale);
  const maxVal = Math.max(...scaled);
  const naiveExps = scaled.map(x => Math.exp(Math.min(x, 80)));
  const naiveSum = naiveExps.reduce((a, b) => a + b, 0);
  const naiveProbs = naiveExps.map(e => e / naiveSum);
  const safeExps = scaled.map(x => Math.exp(x - maxVal));
  const safeSum = safeExps.reduce((a, b) => a + b, 0);
  const safeProbs = safeExps.map(e => e / safeSum);
  const overflow = scaled.some(x => x > 11);

  return (<VizBox title={lang === "tr" ? "Float16 Softmax — Numerik Stabilite" : "Float16 Softmax — Numerical Stability"} color="#F59E0B">
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ color: VB.muted, fontSize: 12, fontWeight: 700, minWidth: 80 }}>{lang === "tr" ? "Ölçek" : "Scale"}: ×{scale}</span>
      <input type="range" min="1" max="10" step="1" value={scale} onChange={e => setScale(+e.target.value)} style={{ flex: 1 }} />
    </div>
    {overflow && <div style={{ padding: "6px 10px", borderRadius: 8, background: "#F43F5E10", border: "1px solid #F43F5E30", marginBottom: 8, fontSize: 12, color: "#F43F5E", fontWeight: 700 }}>
      ⚠️ {lang === "tr" ? `exp(${scaled[0].toFixed(0)}) = ${Math.exp(Math.min(scaled[0], 80)).toExponential(1)} — Float16 OVERFLOW!` : `exp(${scaled[0].toFixed(0)}) = ${Math.exp(Math.min(scaled[0], 80)).toExponential(1)} — Float16 OVERFLOW!`}
    </div>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <div style={{ padding: 8, borderRadius: 8, background: overflow ? "#F43F5E08" : VB.card, border: `1px solid ${overflow ? "#F43F5E20" : VB.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: overflow ? "#F43F5E" : VB.dim, letterSpacing: 1, marginBottom: 6 }}>{lang === "tr" ? "NAİF YÖNTEM" : "NAIVE METHOD"}</div>
        {scaled.map((x, i) => <div key={i} style={{ fontSize: 12, fontFamily: "'Fira Code', monospace", color: overflow ? "#F43F5E" : VB.txt, marginBottom: 2 }}>
          exp({x.toFixed(1)}) = {naiveExps[i] > 1e10 ? "∞" : naiveExps[i].toFixed(1)} → {overflow ? "NaN" : (naiveProbs[i]*100).toFixed(1)+"%"}
        </div>)}
      </div>
      <div style={{ padding: 8, borderRadius: 8, background: "#10B98108", border: "1px solid #10B98120" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", letterSpacing: 1, marginBottom: 6 }}>{lang === "tr" ? "GÜVENLİ YÖNTEM" : "SAFE METHOD"}</div>
        {scaled.map((x, i) => <div key={i} style={{ fontSize: 12, fontFamily: "'Fira Code', monospace", color: VB.txt, marginBottom: 2 }}>
          exp({(x-maxVal).toFixed(1)}) = {safeExps[i].toFixed(2)} → {(safeProbs[i]*100).toFixed(1)}%
        </div>)}
      </div>
    </div>
  </VizBox>);
};

const AblationDesignViz = () => {
  const lang = useLang();
  const [selected, setSelected] = useState(new Set([0,1,2,3]));
  const components = [
    { name: "Multi-head Attn", loss: 0.00, color: "#0EA5E9" },
    { name: "Layer Norm", loss: 0.24, color: "#8B5CF6" },
    { name: "Residual", loss: 0.49, color: "#10B981" },
    { name: "n_embd=16", loss: 0.27, color: "#F59E0B" },
  ];
  const baseLoss = 2.18;
  const currentLoss = baseLoss + components.reduce((s, c, i) => s + (selected.has(i) ? 0 : c.loss), 0);

  return (<VizBox title={lang === "tr" ? "İnteraktif Ablation Deneyi" : "Interactive Ablation Experiment"} color="#10B981">
    <div style={{ fontSize: 12, color: VB.muted, marginBottom: 8 }}>{lang === "tr" ? "Bileşenleri tıklayarak çıkarın — loss'a etkisini görün:" : "Click to remove components — see the effect on loss:"}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
      {components.map((comp, i) => {
        const active = selected.has(i);
        return <button key={i} onClick={() => {
          const n = new Set(selected);
          if (n.has(i)) n.delete(i); else n.add(i);
          setSelected(n);
        }} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${active ? comp.color+"30" : "#F43F5E30"}`,
          background: active ? `${comp.color}08` : "#F43F5E08", cursor: "pointer",
          opacity: active ? 1 : 0.6, transition: "all 0.3s",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: active ? comp.color : "#F43F5E" }}>
            {active ? "✓ " : "✕ "}{comp.name}
          </span>
          {!active && <span style={{ fontSize: 12, color: "#F43F5E", fontFamily: "'Fira Code', monospace" }}>+{comp.loss.toFixed(2)} loss</span>}
        </button>;
      })}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <StatBox value={currentLoss.toFixed(2)} label="Loss" color={currentLoss > 2.5 ? "#F43F5E" : currentLoss > 2.3 ? "#FBBF24" : "#10B981"} />
      <StatBox value={`${selected.size}/4`} label={lang === "tr" ? "Aktif" : "Active"} color="#0EA5E9" />
      <StatBox value={`+${(currentLoss - baseLoss).toFixed(2)}`} label="ΔLoss" color={currentLoss > baseLoss ? "#F43F5E" : "#10B981"} />
    </div>
  </VizBox>);
};

// ═══ W9: RESEARCH FRONTIERS ═══

const NasParetoViz = () => {
  const lang = useLang();
  const configs = [
    { name: "tiny", params: 512, loss: 2.8, color: "#0EA5E9" },
    { name: "small", params: 1024, loss: 2.5, color: "#8B5CF6" },
    { name: "base", params: 3648, loss: 2.18, color: "#10B981" },
    { name: "wide", params: 7200, loss: 2.05, color: "#F59E0B" },
    { name: "deep", params: 14400, loss: 1.95, color: "#EC4899" },
    { name: "huge", params: 28000, loss: 1.90, color: "#E11D48" },
    { name: "bad1", params: 5000, loss: 2.6, color: "#475569" },
    { name: "bad2", params: 10000, loss: 2.4, color: "#475569" },
    { name: "bad3", params: 20000, loss: 2.1, color: "#475569" },
  ];
  const pareto = configs.filter(c => !configs.some(c2 => c2.params <= c.params && c2.loss < c.loss && c2 !== c));
  const W = 260, H = 180;
  const xScale = (p) => 15 + (Math.log2(p) - Math.log2(400)) / (Math.log2(30000) - Math.log2(400)) * (W - 30);
  const yScale = (l) => H - 15 - ((l - 1.8) / (3.0 - 1.8)) * (H - 30);
  const paretoSorted = [...pareto].sort((a, b) => a.params - b.params);

  return (<VizBox title={lang === "tr" ? "NAS — Pareto Front Optimizasyon" : "NAS — Pareto Front Optimization"} color="#7C3AED">
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: VB.card, borderRadius: 10 }}>
      <text x={W/2} y={H-2} textAnchor="middle" fill={VB.dim} fontSize="7">{lang === "tr" ? "Parametre sayısı (log) →" : "Parameter count (log) →"}</text>
      <text x={5} y={H/2} fill={VB.dim} fontSize="7" transform={`rotate(-90,5,${H/2})`}>Loss ↓</text>
      {paretoSorted.length > 1 && <polyline points={paretoSorted.map(c => `${xScale(c.params)},${yScale(c.loss)}`).join(" ")} fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />}
      <rect x={xScale(paretoSorted[0]?.params || 500)-2} y={yScale(paretoSorted[0]?.loss || 2.8)} width={xScale(paretoSorted[paretoSorted.length-1]?.params || 28000) - xScale(paretoSorted[0]?.params || 500)+4} height={yScale(paretoSorted[paretoSorted.length-1]?.loss || 1.9) - yScale(paretoSorted[0]?.loss || 2.8)} fill="#7C3AED" opacity="0.03" rx="4" />
      {configs.map((c, i) => {
        const isPareto = pareto.includes(c);
        return <g key={i}>
          <circle cx={xScale(c.params)} cy={yScale(c.loss)} r={isPareto ? 5 : 3.5} fill={isPareto ? c.color : "#47556940"} stroke={isPareto ? c.color : "none"} strokeWidth="1" />
          {isPareto && <text x={xScale(c.params)} y={yScale(c.loss)-8} textAnchor="middle" fill={c.color} fontSize="6" fontWeight="700">{c.name}</text>}
        </g>;
      })}
      <text x={W-8} y={15} textAnchor="end" fill="#7C3AED" fontSize="7" fontWeight="700">Pareto Front</text>
    </svg>
    <div style={{ fontSize: 12, color: VB.muted, marginTop: 6, textAlign: "center" }}>{lang === "tr" ? "Renkli noktalar = Pareto-optimal. Gri noktalar = daha iyi bir alternatif var." : "Colored = Pareto-optimal. Gray = a better alternative exists."}</div>
  </VizBox>);
};

const DistillationFlowViz = () => {
  const lang = useLang();
  const [temp, setTemp] = useState(1.0);
  const teacherLogits = [3.5, 1.2, 0.8, 0.3, -0.5];
  const toks = ["a", "e", "m", "r", "z"];
  const soften = (logits, t) => {
    const scaled = logits.map(l => l / t);
    const mx = Math.max(...scaled);
    const exps = scaled.map(x => Math.exp(x - mx));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  };
  const probs = soften(teacherLogits, temp);

  return (<VizBox title={lang === "tr" ? "Knowledge Distillation — Temperature Etkisi" : "Knowledge Distillation — Temperature Effect"} color="#F59E0B">
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span style={{ color: "#F59E0B", fontSize: 13, fontWeight: 700, minWidth: 55 }}>T = {temp.toFixed(1)}</span>
      <input type="range" min="0.5" max="10" step="0.5" value={temp} onChange={e => setTemp(+e.target.value)} style={{ flex: 1 }} />
    </div>
    <div style={{ fontSize: 11, color: VB.muted, marginBottom: 6, textAlign: "center" }}>
      {temp <= 1 ? (lang === "tr" ? "🎯 Keskin — sadece doğru cevabı öğren" : "🎯 Sharp — learn only the right answer") :
       temp <= 3 ? (lang === "tr" ? "📊 Dengeli — ilişkileri de öğren" : "📊 Balanced — learn relationships too") :
       (lang === "tr" ? "🌊 Yumuşak — tüm token ilişkilerini öğren" : "🌊 Soft — learn all token relationships")}
    </div>
    <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 100, padding: "0 8px" }}>
      {toks.map((t, i) => {
        const h = probs[i] * 90;
        const colors = ["#10B981", "#0EA5E9", "#8B5CF6", "#F59E0B", "#F43F5E"];
        return <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ height: 90, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ height: Math.max(h, 2), background: `${colors[i]}80`, borderRadius: "4px 4px 0 0", transition: "height 0.3s" }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: colors[i], marginTop: 2 }}>{t}</div>
          <div style={{ fontSize: 11, color: VB.muted, fontFamily: "'Fira Code', monospace" }}>{(probs[i]*100).toFixed(1)}%</div>
        </div>;
      })}
    </div>
  </VizBox>);
};

const RopeViz = () => {
  const lang = useLang();
  const [pos, setPos] = useState(0);
  const W = 220, H = 220, cx = W/2, cy = H/2, r = 70;
  const angle = pos * 0.5;
  const x1 = cx + r * Math.cos(angle), y1 = cy - r * Math.sin(angle);
  const x2 = cx + r * 0.6 * Math.cos(angle * 2), y2 = cy - r * 0.6 * Math.sin(angle * 2);

  return (<VizBox title={lang === "tr" ? "RoPE — Rotary Position Embedding" : "RoPE — Rotary Position Embedding"} color="#6366F1">
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ color: "#6366F1", fontSize: 13, fontWeight: 700, minWidth: 70 }}>pos = {pos}</span>
      <input type="range" min="0" max="20" step="1" value={pos} onChange={e => setPos(+e.target.value)} style={{ flex: 1 }} />
    </div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", background: VB.card, borderRadius: 10, margin: "0 auto" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={VB.border} strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r*0.6} fill="none" stroke={VB.border} strokeWidth="0.5" strokeDasharray="3 3" />
      <line x1={cx} y1={cy} x2={x1} y2={y1} stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={x1} cy={y1} r="5" fill="#6366F1" />
      <text x={x1 + 8} y={y1 - 5} fill="#6366F1" fontSize="8" fontWeight="700">{lang === "tr" ? "Düşük frek" : "Low freq"}</text>
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <circle cx={x2} cy={y2} r="4" fill="#F59E0B" />
      <text x={x2 + 8} y={y2 - 5} fill="#F59E0B" fontSize="8" fontWeight="700">{lang === "tr" ? "Yüksek frek" : "High freq"}</text>
      <circle cx={cx} cy={cy} r="2" fill={VB.dim} />
      <text x={cx} y={cy + r + 15} textAnchor="middle" fill={VB.muted} fontSize="7">θ = pos × freq_i</text>
    </svg>
    <div style={{ fontSize: 12, color: VB.muted, marginTop: 6, textAlign: "center" }}>{lang === "tr" ? "Her pozisyon vektörü farklı açıyla döndürür. Düşük frekans = yavaş rotasyon, yüksek frekans = hızlı." : "Each position rotates the vector by a different angle. Low freq = slow rotation, high freq = fast."}</div>
  </VizBox>);
};

const SparseAttentionViz = () => {
  const lang = useLang();
  const [pattern, setPattern] = useState(0);
  const n = 8;
  const patterns = [
    { name: "Full", mask: Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => j <= i)) },
    { name: "Local (w=3)", mask: Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => j <= i && i - j < 3)) },
    { name: "Local+Global", mask: Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => (j <= i && i - j < 3) || j === 0)) },
    { name: "Sliding Window", mask: Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => Math.abs(i - j) < 3)) },
  ];
  const m = patterns[pattern];
  const total = n * (n + 1) / 2;
  const active = m.mask.flat().filter(Boolean).length;

  return (<VizBox title={lang === "tr" ? "Sparse Attention Maskeleri" : "Sparse Attention Masks"} color="#14B8A6">
    <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
      {patterns.map((p, i) => <button key={i} onClick={() => setPattern(i)} style={{
        padding: "5px 10px", borderRadius: 7, border: `1px solid ${pattern === i ? "#14B8A630" : VB.border}`,
        background: pattern === i ? "#14B8A610" : "transparent", color: pattern === i ? "#14B8A6" : VB.muted,
        fontSize: 11, fontWeight: 700, cursor: "pointer"
      }}>{p.name}</button>)}
    </div>
    <div style={{ display: "inline-grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 2, margin: "0 auto" }}>
      {m.mask.map((row, i) => row.map((active, j) => (
        <div key={`${i}-${j}`} style={{
          width: 24, height: 24, borderRadius: 3,
          background: active ? "#14B8A640" : VB.card,
          border: `1px solid ${active ? "#14B8A620" : VB.border}`,
          transition: "all 0.2s",
        }} />
      )))}
    </div>
    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
      <StatBox value={active} label={lang === "tr" ? "Aktif hücre" : "Active cells"} color="#14B8A6" />
      <StatBox value={`${Math.round((1 - active/total) * 100)}%`} label={lang === "tr" ? "Tasarruf" : "Savings"} color="#F59E0B" />
      <StatBox value={`O(n${pattern === 0 ? "²" : "·w"})`} label="FLOPs" color="#8B5CF6" />
    </div>
  </VizBox>);
};

const GrokkingViz = () => {
  const lang = useLang();
  const [epoch, setEpoch] = useState(0);
  const maxEpoch = 50;
  const trainLoss = (e) => Math.max(0, 3.0 * Math.exp(-e * 0.5));
  const testLoss = (e) => e < 30 ? 3.0 - 0.5 * Math.min(e / 30, 1) + 0.3 * Math.sin(e * 0.2) : Math.max(0.1, 2.5 * Math.exp(-(e - 30) * 0.3));
  const W = 260, H = 120;

  return (<VizBox title={lang === "tr" ? "Grokking — Gecikmeli Genelleme" : "Grokking — Delayed Generalization"} color="#F43F5E">
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ color: VB.muted, fontSize: 12, fontWeight: 700, minWidth: 95 }}>Epoch: {epoch * 100}</span>
      <input type="range" min="0" max={maxEpoch} step="1" value={epoch} onChange={e => setEpoch(+e.target.value)} style={{ flex: 1 }} />
    </div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: VB.card, borderRadius: 10 }}>
      {/* Train loss curve */}
      <polyline points={Array.from({length: epoch+1}, (_, i) => `${10 + (i/maxEpoch)*(W-20)},${10 + (trainLoss(i)/3.5)*(H-25)}`).join(" ")} fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
      {/* Test loss curve */}
      <polyline points={Array.from({length: epoch+1}, (_, i) => `${10 + (i/maxEpoch)*(W-20)},${10 + (testLoss(i)/3.5)*(H-25)}`).join(" ")} fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
      {/* Grokking zone */}
      {epoch >= 28 && <rect x={10 + (28/maxEpoch)*(W-20)} y={5} width={(5/maxEpoch)*(W-20)} height={H-15} fill="#F43F5E" opacity="0.05" rx="3" />}
      {epoch >= 30 && <text x={10 + (30/maxEpoch)*(W-20)} y={15} fill="#F43F5E" fontSize="7" fontWeight="700">GROKKING!</text>}
      <text x={W-5} y={10 + (trainLoss(epoch)/3.5)*(H-25)} fill="#0EA5E9" fontSize="7" fontWeight="700">train</text>
      <text x={W-5} y={10 + (testLoss(epoch)/3.5)*(H-25)} fill="#F43F5E" fontSize="7" fontWeight="700">test</text>
    </svg>
    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
      <StatBox value={trainLoss(epoch).toFixed(2)} label="Train Loss" color="#0EA5E9" />
      <StatBox value={testLoss(epoch).toFixed(2)} label="Test Loss" color="#F43F5E" />
      <StatBox value={epoch < 30 ? (lang === "tr" ? "Ezberleme" : "Memorizing") : (lang === "tr" ? "Genelleme!" : "Generalizing!")} label={lang === "tr" ? "Durum" : "Phase"} color={epoch >= 30 ? "#10B981" : "#FBBF24"} />
    </div>
  </VizBox>);
};

const LossLandscapeViz = () => {
  const lang = useLang();
  const [optimizer, setOptimizer] = useState(0);
  const opts = [
    { name: "SGD", sharpness: 1.5, label: lang === "tr" ? "Orta keskinlik" : "Medium sharpness" },
    { name: "Adam", sharpness: 2.5, label: lang === "tr" ? "Keskin minimum" : "Sharp minimum" },
    { name: "SAM", sharpness: 0.5, label: lang === "tr" ? "Düz minimum ✓" : "Flat minimum ✓" },
    { name: lang === "tr" ? "Küçük Batch" : "Small Batch", sharpness: 0.8, label: lang === "tr" ? "Doğal düzleşme" : "Natural smoothing" },
  ];
  const opt = opts[optimizer];
  const W = 240, H = 100;
  const pts = Array.from({length: 60}, (_, i) => {
    const x = (i - 30) / 10;
    const y = opt.sharpness * x * x + 0.3 * Math.sin(x * 3) * (opt.sharpness > 1 ? 1 : 0.2);
    return `${W/2 + x * 8},${H - 10 - Math.min(y * 6, H - 20)}`;
  }).join(" ");

  return (<VizBox title={lang === "tr" ? "Loss Landscape — Flat vs Sharp" : "Loss Landscape — Flat vs Sharp"} color="#8B5CF6">
    <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
      {opts.map((o, i) => <button key={i} onClick={() => setOptimizer(i)} style={{
        padding: "5px 10px", borderRadius: 7, border: `1px solid ${optimizer === i ? "#8B5CF630" : VB.border}`,
        background: optimizer === i ? "#8B5CF610" : "transparent", color: optimizer === i ? "#8B5CF6" : VB.muted,
        fontSize: 11, fontWeight: 700, cursor: "pointer"
      }}>{o.name}</button>)}
    </div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: VB.card, borderRadius: 10 }}>
      <polyline points={pts} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={W/2} cy={H-10} r="4" fill={opt.sharpness < 1 ? "#10B981" : opt.sharpness < 2 ? "#FBBF24" : "#F43F5E"} />
      <text x={W/2} y={15} textAnchor="middle" fill={opt.sharpness < 1 ? "#10B981" : opt.sharpness < 2 ? "#FBBF24" : "#F43F5E"} fontSize="9" fontWeight="700">{opt.label}</text>
    </svg>
  </VizBox>);
};


// ═══ TRANSFORMER PAPER — RICH INTERACTIVE COMPONENTS (from transformer_explorer.jsx) ═══



export { BpeInfoTheoryViz, HessianLandscapeViz, HeadPruningViz, IsotropyViz, NumericalStabilityViz, AblationDesignViz, NasParetoViz, DistillationFlowViz, RopeViz, SparseAttentionViz, GrokkingViz, LossLandscapeViz, NeuralNetBasicsViz, LangModelConceptViz, VectorConceptViz, MatrixMulViz, DerivativeViz, TopoSortViz, RnnToAttnViz, DotProductViz, NormCompareViz, ActivationViz, DimensionFlowViz, GradDescentViz, LrDecayViz, CrossEntropyGraphViz, SamplingViz, WhatsMissingViz, WeightInitViz, WhyBox, BridgeBox, AnalogyBox, ConcreteBox, TryItTokenizer, TryItSoftmax, TryItDotProduct, TryItGradient, TryItEmbedding, StepByStepCalc, TryItParams, TrainingEvolutionViz, GPTScaleTowerViz, FrameworkCompareViz, LivePipelineViz, TokenizerPlaygroundViz, AutogradPlaygroundViz, AttentionPlaygroundViz, TransformerBlockFlowViz, TrainingSimViz, GenerationPlaygroundViz, ScalingLawsViz, EvolutionTimelineViz, HardwareEvolutionViz, TrainingPipelineViz, TokenEvolutionViz, AttentionEvolutionViz, OpensourceMapViz, TrendsRadarViz, ConceptMapViz };
