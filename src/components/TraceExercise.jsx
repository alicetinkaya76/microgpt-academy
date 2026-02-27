// ═══════════════════════════════════════════════════════════════
// TraceExercise.jsx — v6: Real PDA Stack + TM Tape Trace
// Supports: dfa, nfa, pda (stack), tm (tape)
// ═══════════════════════════════════════════════════════════════
import { useState, useCallback } from "react";
import { C, F, Card, useI18n } from "../theme";

export const TRACE_EXERCISES = [
  // ─── M1: DFA Traces ───────────────────────────────────────
  {
    id:"t_m1_1", module:"m1", type:"dfa",
    title:["Tek/Çift 'a' Sayacı — 'abba' izle","Even/Odd 'a' Counter — trace 'abba'"],
    desc:["Bu DFA tek sayıda a içeren stringleri kabul eder. 'abba' stringini adım adım izleyin.",
          "This DFA accepts strings with an odd number of a's. Trace 'abba' step by step."],
    states:[{id:"q0",label:"q0",start:true,accept:false},{id:"q1",label:"q1",start:false,accept:true}],
    transitions:[{fr:"q0",to:"q1",sym:"a"},{fr:"q0",to:"q0",sym:"b"},{fr:"q1",to:"q0",sym:"a"},{fr:"q1",to:"q1",sym:"b"}],
    string:"abba", alphabet:["a","b"]
  },
  {
    id:"t_m1_2", module:"m1", type:"dfa",
    title:["'ab' ile Biten DFA — 'aab' izle","DFA Ending with 'ab' — trace 'aab'"],
    desc:["Bu DFA 'ab' ile biten stringleri kabul eder.","This DFA accepts strings ending with 'ab'."],
    states:[{id:"q0",label:"q0",start:true,accept:false},{id:"q1",label:"q1",start:false,accept:false},{id:"q2",label:"q2",start:false,accept:true}],
    transitions:[{fr:"q0",to:"q1",sym:"a"},{fr:"q0",to:"q0",sym:"b"},{fr:"q1",to:"q1",sym:"a"},{fr:"q1",to:"q2",sym:"b"},{fr:"q2",to:"q1",sym:"a"},{fr:"q2",to:"q0",sym:"b"}],
    string:"aab", alphabet:["a","b"]
  },
  {
    id:"t_m1_3", module:"m1", type:"dfa",
    title:["3'e Bölünebilir Binary — '110' izle","Binary Divisible by 3 — trace '110'"],
    desc:["Bu DFA binary sayının 3'e bölünebilir olup olmadığını kontrol eder. '110' (=6) izleyin.",
          "This DFA checks if a binary number is divisible by 3. Trace '110' (=6)."],
    states:[{id:"q0",label:"q0 (mod0)",start:true,accept:true},{id:"q1",label:"q1 (mod1)",start:false,accept:false},{id:"q2",label:"q2 (mod2)",start:false,accept:false}],
    transitions:[{fr:"q0",to:"q0",sym:"0"},{fr:"q0",to:"q1",sym:"1"},{fr:"q1",to:"q2",sym:"0"},{fr:"q1",to:"q0",sym:"1"},{fr:"q2",to:"q1",sym:"0"},{fr:"q2",to:"q2",sym:"1"}],
    string:"110", alphabet:["0","1"]
  },
  {
    id:"t_m1_4", module:"m1", type:"dfa",
    title:["Çift Uzunluk DFA — 'abab' izle","Even Length DFA — trace 'abab'"],
    desc:["Bu DFA çift uzunluklu stringleri kabul eder.","This DFA accepts strings of even length."],
    states:[{id:"q0",label:"q0 (çift)",start:true,accept:true},{id:"q1",label:"q1 (tek)",start:false,accept:false}],
    transitions:[{fr:"q0",to:"q1",sym:"a"},{fr:"q0",to:"q1",sym:"b"},{fr:"q1",to:"q0",sym:"a"},{fr:"q1",to:"q0",sym:"b"}],
    string:"abab", alphabet:["a","b"]
  },
  {
    id:"t_m1_5", module:"m1", type:"dfa",
    title:["'aba' İçermeyen DFA — 'abba' izle","DFA Not Containing 'aba' — trace 'abba'"],
    desc:["Bu DFA 'aba' alt stringi içermeyen stringleri kabul eder.","This DFA accepts strings not containing 'aba'."],
    states:[{id:"q0",label:"q0",start:true,accept:true},{id:"q1",label:"q1 (a gördü)",start:false,accept:true},{id:"q2",label:"q2 (ab gördü)",start:false,accept:true},{id:"trap",label:"trap",start:false,accept:false}],
    transitions:[{fr:"q0",to:"q1",sym:"a"},{fr:"q0",to:"q0",sym:"b"},{fr:"q1",to:"q1",sym:"a"},{fr:"q1",to:"q2",sym:"b"},{fr:"q2",to:"trap",sym:"a"},{fr:"q2",to:"q0",sym:"b"},{fr:"trap",to:"trap",sym:"a"},{fr:"trap",to:"trap",sym:"b"}],
    string:"abba", alphabet:["a","b"]
  },
  // ─── M2: NFA Traces ───────────────────────────────────────
  {
    id:"t_m2_1", module:"m2", type:"nfa",
    title:["NFA: 'a' ile Biter — 'ba' izle","NFA: Ends with 'a' — trace 'ba'"],
    desc:["Bu NFA son karakteri 'a' olan stringleri kabul eder.","This NFA accepts strings ending in 'a'."],
    states:[{id:"q0",label:"q0",start:true,accept:false},{id:"q1",label:"q1",start:false,accept:true}],
    transitions:[{fr:"q0",to:"q0",sym:"a"},{fr:"q0",to:"q0",sym:"b"},{fr:"q0",to:"q1",sym:"a"}],
    string:"ba", alphabet:["a","b"]
  },
  {
    id:"t_m2_2", module:"m2", type:"nfa",
    title:["NFA: 'ab' veya 'ba' İçerir — 'aba' izle","NFA: Contains 'ab' or 'ba' — trace 'aba'"],
    desc:["Bu NFA 'ab' veya 'ba' alt stringi içeren stringleri kabul eder.","This NFA accepts strings containing 'ab' or 'ba'."],
    states:[{id:"q0",label:"q0",start:true,accept:false},{id:"q1",label:"q1",start:false,accept:false},{id:"q2",label:"q2",start:false,accept:true}],
    transitions:[{fr:"q0",to:"q0",sym:"a"},{fr:"q0",to:"q0",sym:"b"},{fr:"q0",to:"q1",sym:"a"},{fr:"q1",to:"q2",sym:"b"},{fr:"q0",to:"q1",sym:"b"},{fr:"q1",to:"q2",sym:"a"},{fr:"q2",to:"q2",sym:"a"},{fr:"q2",to:"q2",sym:"b"}],
    string:"aba", alphabet:["a","b"]
  },
  {
    id:"t_m2_3", module:"m2", type:"nfa",
    title:["NFA: Sondan 2. Karakter 'a' — 'bab' izle","NFA: 2nd-to-last is 'a' — trace 'bab'"],
    desc:["Bu NFA sondan ikinci karakteri 'a' olan stringleri kabul eder.","This NFA accepts strings where 2nd-to-last char is 'a'."],
    states:[{id:"q0",label:"q0",start:true,accept:false},{id:"q1",label:"q1",start:false,accept:false},{id:"q2",label:"q2",start:false,accept:true}],
    transitions:[{fr:"q0",to:"q0",sym:"a"},{fr:"q0",to:"q0",sym:"b"},{fr:"q0",to:"q1",sym:"a"},{fr:"q1",to:"q2",sym:"a"},{fr:"q1",to:"q2",sym:"b"}],
    string:"bab", alphabet:["a","b"]
  },
  // ─── M4: PDA Traces (Real Stack) ─────────────────────────
  {
    id:"t_m4_pda1", module:"m4", type:"pda",
    title:["PDA: 0ⁿ1ⁿ — '0011' stack izle","PDA: 0ⁿ1ⁿ — trace '0011' with stack"],
    desc:["Bu PDA 0ⁿ1ⁿ dilini kabul eder. Her adımda durum, pop ve push seçin.",
          "This PDA accepts 0ⁿ1ⁿ. At each step choose state, pop and push."],
    states:[{id:"q0",label:"q0 (push)",start:true,accept:false},{id:"q1",label:"q1 (pop)",start:false,accept:false},{id:"qf",label:"qf",start:false,accept:true}],
    stackBottom:"$",
    pdaTransitions:[
      {fr:"q0",to:"q0",read:"0",pop:"\u03b5",push:"A"},
      {fr:"q0",to:"q1",read:"1",pop:"A",push:"\u03b5"},
      {fr:"q1",to:"q1",read:"1",pop:"A",push:"\u03b5"},
      {fr:"q1",to:"qf",read:"\u03b5",pop:"$",push:"\u03b5"}
    ],
    correctPath:[
      {state:"q0",stack:["$"]},
      {state:"q0",read:"0",pop:"\u03b5",push:"A",stack:["$","A"]},
      {state:"q0",read:"0",pop:"\u03b5",push:"A",stack:["$","A","A"]},
      {state:"q1",read:"1",pop:"A",push:"\u03b5",stack:["$","A"]},
      {state:"q1",read:"1",pop:"A",push:"\u03b5",stack:["$"]},
      {state:"qf",read:"\u03b5",pop:"$",push:"\u03b5",stack:[]}
    ],
    string:"0011", alphabet:["0","1"]
  },
  {
    id:"t_m4_pda2", module:"m4", type:"pda",
    title:["PDA: wwᴿ — 'abba' stack izle","PDA: wwᴿ — trace 'abba' with stack"],
    desc:["Bu PDA wwᴿ (palindrom) kabul eder. Ortada push\u2192pop ge\u00e7i\u015f yapar.",
          "This PDA accepts wwᴿ. It switches from push to pop at the midpoint."],
    states:[{id:"q0",label:"q0 (push)",start:true,accept:false},{id:"q1",label:"q1 (pop)",start:false,accept:false},{id:"qf",label:"qf",start:false,accept:true}],
    stackBottom:"$",
    pdaTransitions:[
      {fr:"q0",to:"q0",read:"a",pop:"\u03b5",push:"A"},{fr:"q0",to:"q0",read:"b",pop:"\u03b5",push:"B"},
      {fr:"q0",to:"q1",read:"\u03b5",pop:"\u03b5",push:"\u03b5"},
      {fr:"q1",to:"q1",read:"a",pop:"A",push:"\u03b5"},{fr:"q1",to:"q1",read:"b",pop:"B",push:"\u03b5"},
      {fr:"q1",to:"qf",read:"\u03b5",pop:"$",push:"\u03b5"}
    ],
    correctPath:[
      {state:"q0",stack:["$"]},
      {state:"q0",read:"a",pop:"\u03b5",push:"A",stack:["$","A"]},
      {state:"q0",read:"b",pop:"\u03b5",push:"B",stack:["$","A","B"]},
      {state:"q1",read:"\u03b5",pop:"\u03b5",push:"\u03b5",stack:["$","A","B"]},
      {state:"q1",read:"b",pop:"B",push:"\u03b5",stack:["$","A"]},
      {state:"q1",read:"a",pop:"A",push:"\u03b5",stack:["$"]},
      {state:"qf",read:"\u03b5",pop:"$",push:"\u03b5",stack:[]}
    ],
    string:"abba", alphabet:["a","b"]
  },
  {
    id:"t_m4_pda3", module:"m4", type:"pda",
    title:["PDA: Dengeli Parantez — '(())' izle","PDA: Balanced Parens — trace '(())'"],
    desc:["Bu PDA dengeli parantezleri kabul eder. '(' push, ')' pop yapar.",
          "This PDA accepts balanced parentheses. '(' pushes, ')' pops."],
    states:[{id:"q0",label:"q0",start:true,accept:false},{id:"qf",label:"qf",start:false,accept:true}],
    stackBottom:"$",
    pdaTransitions:[
      {fr:"q0",to:"q0",read:"(",pop:"\u03b5",push:"("},
      {fr:"q0",to:"q0",read:")",pop:"(",push:"\u03b5"},
      {fr:"q0",to:"qf",read:"\u03b5",pop:"$",push:"\u03b5"}
    ],
    correctPath:[
      {state:"q0",stack:["$"]},
      {state:"q0",read:"(",pop:"\u03b5",push:"(",stack:["$","("]},
      {state:"q0",read:"(",pop:"\u03b5",push:"(",stack:["$","(","("]},
      {state:"q0",read:")",pop:"(",push:"\u03b5",stack:["$","("]},
      {state:"q0",read:")",pop:"(",push:"\u03b5",stack:["$"]},
      {state:"qf",read:"\u03b5",pop:"$",push:"\u03b5",stack:[]}
    ],
    string:"(())", alphabet:["(",")"]
  },
  {
    id:"t_m4_pda4", module:"m4", type:"pda",
    title:["PDA: 0ⁿ1²ⁿ — '001111' izle","PDA: 0ⁿ1²ⁿ — trace '001111'"],
    desc:["Her 0 i\u00e7in stack'e 2 sembol push edilir.","For each 0, two symbols are pushed."],
    states:[{id:"q0",label:"q0 (push)",start:true,accept:false},{id:"q1",label:"q1 (pop)",start:false,accept:false},{id:"qf",label:"qf",start:false,accept:true}],
    stackBottom:"$",
    pdaTransitions:[
      {fr:"q0",to:"q0",read:"0",pop:"\u03b5",push:"AA"},
      {fr:"q0",to:"q1",read:"1",pop:"A",push:"\u03b5"},
      {fr:"q1",to:"q1",read:"1",pop:"A",push:"\u03b5"},
      {fr:"q1",to:"qf",read:"\u03b5",pop:"$",push:"\u03b5"}
    ],
    correctPath:[
      {state:"q0",stack:["$"]},
      {state:"q0",read:"0",pop:"\u03b5",push:"AA",stack:["$","A","A"]},
      {state:"q0",read:"0",pop:"\u03b5",push:"AA",stack:["$","A","A","A","A"]},
      {state:"q1",read:"1",pop:"A",push:"\u03b5",stack:["$","A","A","A"]},
      {state:"q1",read:"1",pop:"A",push:"\u03b5",stack:["$","A","A"]},
      {state:"q1",read:"1",pop:"A",push:"\u03b5",stack:["$","A"]},
      {state:"q1",read:"1",pop:"A",push:"\u03b5",stack:["$"]},
      {state:"qf",read:"\u03b5",pop:"$",push:"\u03b5",stack:[]}
    ],
    string:"001111", alphabet:["0","1"]
  },
  // ─── M5: TM Traces (Real Tape) ──────────────────────────
  {
    id:"t_m5_tm1", module:"m5", type:"tm",
    title:["TM: 0→1 Converter — '010' izle","TM: 0→1 Converter — trace '010'"],
    desc:["Bu TM tüm 0'ları 1'e çevirir. Her adımda yaz/yön/durum seçin.",
          "This TM converts all 0s to 1s. At each step choose write/direction/state."],
    states:[{id:"scan",label:"scan",start:true,accept:false},{id:"halt",label:"halt",start:false,accept:true}],
    tmTransitions:[
      {fr:"scan",to:"scan",read:"0",write:"1",dir:"R"},
      {fr:"scan",to:"scan",read:"1",write:"1",dir:"R"},
      {fr:"scan",to:"halt",read:"\u2423",write:"\u2423",dir:"S"}
    ],
    tape:["0","1","0","\u2423"], headStart:0
  },
  {
    id:"t_m5_tm2", module:"m5", type:"tm",
    title:["TM: Binary Artırıcı — '101'→'110'","TM: Binary Incrementer — '101'→'110'"],
    desc:["Bu TM binary sayıyı 1 artırır. Carry mantığını izleyin.",
          "This TM increments a binary number. Follow carry logic."],
    states:[{id:"right",label:"right",start:true,accept:false},{id:"carry",label:"carry",start:false,accept:false},{id:"done",label:"done",start:false,accept:true}],
    tmTransitions:[
      {fr:"right",to:"right",read:"0",write:"0",dir:"R"},
      {fr:"right",to:"right",read:"1",write:"1",dir:"R"},
      {fr:"right",to:"carry",read:"\u2423",write:"\u2423",dir:"L"},
      {fr:"carry",to:"carry",read:"1",write:"0",dir:"L"},
      {fr:"carry",to:"done",read:"0",write:"1",dir:"S"},
      {fr:"carry",to:"done",read:"\u2423",write:"1",dir:"S"}
    ],
    tape:["1","0","1","\u2423"], headStart:0
  },
  {
    id:"t_m5_tm3", module:"m5", type:"tm",
    title:["TM: a→b Dönüştürücü — 'aab' izle","TM: a→b Converter — trace 'aab'"],
    desc:["Bu TM tüm 'a' harflerini 'b'ye çevirir.","This TM converts all 'a' to 'b'."],
    states:[{id:"scan",label:"scan",start:true,accept:false},{id:"halt",label:"halt",start:false,accept:true}],
    tmTransitions:[
      {fr:"scan",to:"scan",read:"a",write:"b",dir:"R"},
      {fr:"scan",to:"scan",read:"b",write:"b",dir:"R"},
      {fr:"scan",to:"halt",read:"\u2423",write:"\u2423",dir:"S"}
    ],
    tape:["a","a","b","\u2423"], headStart:0
  },
  {
    id:"t_m5_tm4", module:"m5", type:"tm",
    title:["TM: Unary Toplama — '11+111'→'11111'","TM: Unary Add — '11+111'→'11111'"],
    desc:["Bu TM + işaretini 1 ile değiştirerek toplama yapar.",
          "This TM performs unary addition by replacing + with 1."],
    states:[{id:"seek",label:"seek",start:true,accept:false},{id:"halt",label:"halt",start:false,accept:true}],
    tmTransitions:[
      {fr:"seek",to:"seek",read:"1",write:"1",dir:"R"},
      {fr:"seek",to:"halt",read:"+",write:"1",dir:"S"}
    ],
    tape:["1","1","+","1","1","1"], headStart:0
  }
];

// ── Compute correct DFA trace ────────────────────────────────
function computeDFATrace(ex) {
  const steps = []; let cur = ex.states.find(s=>s.start).id;
  steps.push({state:cur,symbol:null});
  for(const ch of ex.string){const t=ex.transitions.find(t=>t.fr===cur&&t.sym===ch);cur=t?t.to:null;steps.push({state:cur,symbol:ch});}
  return {steps, accepted:cur?!!ex.states.find(s=>s.id===cur)?.accept:false, finalState:cur};
}

// ── Compute correct NFA trace ─────────────────────────────────
function computeNFATrace(ex) {
  const steps = []; let curSet=new Set([ex.states.find(s=>s.start).id]);
  steps.push({states:new Set(curSet),symbol:null});
  for(const ch of ex.string){const ns=new Set();curSet.forEach(s=>{ex.transitions.filter(t=>t.fr===s&&t.sym===ch).forEach(t=>ns.add(t.to));});curSet=ns;steps.push({states:new Set(curSet),symbol:ch});}
  return {steps, accepted:[...curSet].some(s=>ex.states.find(st=>st.id===s)?.accept)};
}

// ── Compute correct PDA trace (real stack) ────────────────────
function computePDATrace(ex) {
  if(ex.correctPath){
    const steps=ex.correctPath.map(p=>({state:p.state,stack:[...p.stack],read:p.read||null,pop:p.pop||null,push:p.push||null}));
    const last=steps[steps.length-1];
    return {steps, accepted:!!ex.states.find(s=>s.id===last.state)?.accept};
  }
  const steps=[]; let cur=ex.states.find(s=>s.start).id; let stack=[ex.stackBottom||"$"];
  steps.push({state:cur,stack:[...stack],read:null,pop:null,push:null});
  let pos=0;
  for(let iter=0;iter<50&&pos<ex.string.length;iter++){
    const ch=ex.string[pos]; let found=false;
    for(const t of ex.pdaTransitions){
      if(t.fr!==cur)continue; const top=stack.length?stack[stack.length-1]:null;
      if((t.read===ch||t.read==="\u03b5")&&(t.pop==="\u03b5"||t.pop===top)){
        if(t.pop!=="\u03b5")stack.pop();
        if(t.push!=="\u03b5")for(let i=t.push.length-1;i>=0;i--)stack.push(t.push[i]);
        if(t.read!=="\u03b5")pos++;
        cur=t.to;steps.push({state:cur,stack:[...stack],read:t.read==="\u03b5"?"\u03b5":ch,pop:t.pop,push:t.push});
        found=true;break;
      }
    }
    if(!found)break;
  }
  for(let i=0;i<5;i++){
    const top=stack.length?stack[stack.length-1]:null;
    const t=ex.pdaTransitions.find(tr=>tr.fr===cur&&tr.read==="\u03b5"&&(tr.pop==="\u03b5"||tr.pop===top));
    if(t&&!(t.to===cur&&t.pop==="\u03b5"&&t.push==="\u03b5")){
      if(t.pop!=="\u03b5")stack.pop();if(t.push!=="\u03b5")for(let j=t.push.length-1;j>=0;j--)stack.push(t.push[j]);
      cur=t.to;steps.push({state:cur,stack:[...stack],read:"\u03b5",pop:t.pop,push:t.push});
    }else break;
  }
  return {steps, accepted:!!ex.states.find(s=>s.id===cur)?.accept};
}

// ── Compute correct TM trace (real tape) ──────────────────────
function computeTMTrace(ex) {
  const steps=[]; let tape=[...ex.tape]; let head=ex.headStart||0;
  let cur=ex.states.find(s=>s.start).id;
  steps.push({state:cur,tape:[...tape],head,write:null,dir:null});
  for(let i=0;i<100;i++){
    const st=ex.states.find(s=>s.id===cur);if(st?.accept||st?.reject)break;
    const sym=tape[head]||"\u2423";
    const t=ex.tmTransitions.find(tr=>tr.fr===cur&&tr.read===sym);if(!t)break;
    tape[head]=t.write;
    if(t.dir==="R")head++;else if(t.dir==="L")head--;
    if(head<0){tape.unshift("\u2423");head=0;}while(head>=tape.length)tape.push("\u2423");
    cur=t.to;steps.push({state:cur,tape:[...tape],head,write:t.write,dir:t.dir});
  }
  return {steps,accepted:!!ex.states.find(s=>s.id===cur)?.accept,finalTape:[...tape]};
}

// ═══════════════════════════════════════════════════════════════
// Stack Visualization
// ═══════════════════════════════════════════════════════════════
function StackView({stack,mc}){
  const rev=[...stack].reverse();
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
    <div style={{fontSize:8,fontWeight:700,color:C.ts,fontFamily:F.s,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>STACK</div>
    <div style={{border:`2px solid ${mc}40`,borderRadius:8,overflow:"hidden",minWidth:44,background:C.s2}}>
      {rev.length===0?(<div style={{padding:"6px 10px",fontSize:9,color:C.ts,fontFamily:F.m,textAlign:"center"}}>(bo\u015f)</div>
      ):rev.map((item,i)=>(<div key={i} style={{padding:"3px 10px",fontSize:13,fontWeight:700,fontFamily:F.m,textAlign:"center",
        background:i===0?`${mc}18`:"transparent",borderBottom:i<rev.length-1?`1px solid ${mc}15`:"none",color:i===0?mc:C.tx}}>{item}</div>))}
    </div>
    {rev.length>0&&<div style={{fontSize:7,color:C.ts,fontFamily:F.s,marginTop:2}}>\u2190 top</div>}
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// Tape Visualization
// ═══════════════════════════════════════════════════════════════
function TapeView({tape,head,mc}){
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
    <div style={{fontSize:8,fontWeight:700,color:C.ts,fontFamily:F.s,textTransform:"uppercase",letterSpacing:".06em"}}>TAPE</div>
    <div style={{display:"flex",gap:0}}>
      {tape.map((cell,i)=>{const isH=i===head;return(
        <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          {isH?<div style={{fontSize:10,color:mc,fontWeight:900,marginBottom:1}}>\u25bc</div>:<div style={{height:15}}/>}
          <div style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:13,fontWeight:700,fontFamily:F.m,border:`2px solid ${isH?mc:C.bd}`,
            borderRight:i<tape.length-1?"none":undefined,background:isH?`${mc}14`:C.s2,color:isH?mc:C.tx}}>{cell}</div>
        </div>);})}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// TraceExercise Component
// ═══════════════════════════════════════════════════════════════
export default function TraceExercise({exercise,onComplete}){
  const{lang}=useI18n();const li=lang==="en"?1:0;const ex=exercise;const mode=ex.type;
  const correctTrace=mode==="pda"?computePDATrace(ex):mode==="tm"?computeTMTrace(ex):mode==="nfa"?computeNFATrace(ex):computeDFATrace(ex);
  const totalSteps=correctTrace.steps.length-1;
  const[step,setStep]=useState(0);const[answers,setAnswers]=useState([]);const[checked,setChecked]=useState([]);
  const[completed,setCompleted]=useState(false);const[correctCount,setCorrectCount]=useState(0);
  const[dfaSel,setDfaSel]=useState(null);const[nfaSel,setNfaSel]=useState(new Set());
  const[pdaSel,setPdaSel]=useState({state:null,pop:null,push:null});
  const[tmSel,setTmSel]=useState({write:null,dir:null,state:null});

  const cur=correctTrace.steps[step];const nxt=step<totalSteps?correctTrace.steps[step+1]:null;
  const mc=mode==="dfa"?C.ch1:mode==="nfa"?"#34d399":mode==="pda"?"#818cf8":C.ch3;

  const readSym=()=>{
    if(mode==="dfa"||mode==="nfa")return ex.string[step];
    if(mode==="pda"&&nxt)return nxt.read||"\u03b5";
    if(mode==="tm"&&cur)return cur.tape[cur.head]||"\u2423";
    return"?";
  };

  const canSubmit=mode==="dfa"?!!dfaSel:mode==="nfa"?nfaSel.size>0:
    mode==="pda"?!!(pdaSel.state&&pdaSel.pop&&pdaSel.push):
    mode==="tm"?!!(tmSel.write&&tmSel.dir&&tmSel.state):false;

  const checkStep=useCallback(()=>{
    if(!nxt)return;let ok=false;
    if(mode==="dfa")ok=dfaSel===nxt.state;
    else if(mode==="nfa")ok=nfaSel.size===nxt.states.size&&[...nxt.states].every(s=>nfaSel.has(s));
    else if(mode==="pda")ok=pdaSel.state===nxt.state&&pdaSel.pop===nxt.pop&&pdaSel.push===nxt.push;
    else if(mode==="tm")ok=tmSel.state===nxt.state&&tmSel.write===nxt.write&&tmSel.dir===nxt.dir;
    const na=[...answers];na[step]=nxt;setAnswers(na);
    const nc=[...checked];nc[step]=ok?"correct":"wrong";setChecked(nc);
    if(ok)setCorrectCount(c=>c+1);
    setDfaSel(null);setNfaSel(new Set());setPdaSel({state:null,pop:null,push:null});setTmSel({write:null,dir:null,state:null});
    setTimeout(()=>{
      if(step+1<totalSteps)setStep(step+1);
      else{setCompleted(true);if(onComplete)onComplete(correctCount+(ok?1:0),totalSteps);}
    },800);
  // eslint-disable-next-line
  },[mode,dfaSel,nfaSel,pdaSel,tmSel,step,totalSteps,answers,checked,correctCount,onComplete,nxt]);

  const reset=()=>{setStep(0);setAnswers([]);setChecked([]);setCompleted(false);setCorrectCount(0);
    setDfaSel(null);setNfaSel(new Set());setPdaSel({state:null,pop:null,push:null});setTmSel({write:null,dir:null,state:null});};

  // Selection button helper
  const SB=({label,sel,onClick})=>(<button onClick={onClick} style={{padding:"6px 14px",borderRadius:7,
    border:`2px solid ${sel?mc:C.bd}`,background:sel?`${mc}14`:C.s2,color:sel?mc:C.tx,
    fontSize:12,fontWeight:sel?800:500,fontFamily:F.m,transition:"all .15s"}}>{label}</button>);

  return(
    <Card color={mc} pad={0} style={{overflow:"hidden",marginBottom:10}}>
      {/* Header */}
      <div style={{padding:"14px 18px",background:`${mc}08`,borderBottom:`1px solid ${mc}14`,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:30,height:30,borderRadius:8,background:`${mc}18`,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:14,fontWeight:800,color:mc}}>{mode==="pda"?"\u2b07":mode==="tm"?"\ud83d\udcfc":"\u27dc"}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800,color:C.wh,fontFamily:F.s}}>{ex.title[li]}</div>
          <div style={{fontSize:10,color:C.ts,fontFamily:F.s,marginTop:2}}>{ex.desc[li]}</div>
        </div>
        <div style={{padding:"3px 10px",borderRadius:6,background:`${mc}14`,fontSize:9,fontWeight:700,color:mc,fontFamily:F.s,textTransform:"uppercase"}}>{mode.toUpperCase()}</div>
        {completed&&<button onClick={reset} style={{padding:"5px 12px",borderRadius:7,background:`${mc}14`,color:mc,fontSize:10,fontWeight:700,fontFamily:F.s,border:`1px solid ${mc}20`}}>
          \u21bb {li?"Retry":"Tekrar"}</button>}
      </div>

      <div style={{padding:"16px 18px"}}>
        {/* ── Transition Table ── */}
        <div style={{marginBottom:14,padding:"10px 14px",borderRadius:10,background:C.s2,border:`1px solid ${C.bd}`}}>
          <div style={{fontSize:9,fontWeight:700,color:C.ts,fontFamily:F.s,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>
            {mode==="pda"?(li?"PDA Transitions":"PDA Ge\u00e7i\u015fleri"):mode==="tm"?(li?"TM Transitions":"TM Ge\u00e7i\u015fleri"):(li?"Transition Table \u2014 \u03b4":"Ge\u00e7i\u015f Tablosu \u2014 \u03b4")}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {mode==="pda"&&ex.pdaTransitions.map((t,i)=>(
              <span key={i} style={{padding:"3px 8px",borderRadius:5,background:`${mc}08`,border:`1px solid ${mc}0c`,fontSize:10,fontFamily:F.m,color:C.tx,whiteSpace:"nowrap"}}>
                ({t.fr}, {t.read}, {t.pop}) \u2192 ({t.to}, {t.push})</span>))}
            {mode==="tm"&&ex.tmTransitions.map((t,i)=>(
              <span key={i} style={{padding:"3px 8px",borderRadius:5,background:`${mc}08`,border:`1px solid ${mc}0c`,fontSize:10,fontFamily:F.m,color:C.tx,whiteSpace:"nowrap"}}>
                \u03b4({t.fr},{t.read}) = ({t.write},{t.dir},{t.to})</span>))}
            {(mode==="dfa"||mode==="nfa")&&ex.transitions.map((t,i)=>(
              <span key={i} style={{padding:"3px 8px",borderRadius:5,background:`${mc}08`,border:`1px solid ${mc}0c`,fontSize:10,fontFamily:F.m,color:C.tx,whiteSpace:"nowrap"}}>
                \u03b4({t.fr},{t.sym})={t.to}</span>))}
          </div>
          <div style={{marginTop:6,fontSize:9,color:C.ts,fontFamily:F.s}}>
            {li?"Start":"Ba\u015flang\u0131\u00e7"}: {ex.states.find(s=>s.start)?.id} &nbsp;|&nbsp;
            {li?"Accept":"Kabul"}: {"{"+ex.states.filter(s=>s.accept).map(s=>s.id).join(",")+"}"}
            {mode==="pda"&&<>&nbsp;|&nbsp; Stack\u22a5: {ex.stackBottom||"$"}</>}
          </div>
        </div>

        {/* ── String display (DFA/NFA/PDA) ── */}
        {(mode==="dfa"||mode==="nfa"||mode==="pda")&&(
          <div style={{marginBottom:14,textAlign:"center"}}>
            <div style={{display:"inline-flex",gap:2,alignItems:"flex-end"}}>
              {ex.string.split("").map((ch,i)=>{
                const consumed=mode==="pda"?correctTrace.steps.slice(1,step+1).filter(s=>s.read&&s.read!=="\u03b5").length:step;
                const isCur=!completed&&i===consumed;const isDone=i<consumed||completed;
                return(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  {isCur&&<div style={{fontSize:8,color:mc,fontWeight:700}}>\u25bc</div>}
                  {!isCur&&<div style={{height:13}}/>}
                  <div style={{width:34,height:34,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:15,fontWeight:800,fontFamily:F.m,
                    background:isCur?`${mc}18`:isDone?`${C.ok}10`:C.s2,
                    border:`2px solid ${isCur?mc:isDone?C.ok:C.bd}`,
                    color:isCur?mc:isDone?C.ok:C.tm,transition:"all .2s"}}>{ch}</div>
                </div>);
              })}
            </div>
          </div>
        )}

        {/* ── TM Tape ── */}
        {mode==="tm"&&!completed&&cur&&(
          <div style={{marginBottom:14,display:"flex",justifyContent:"center"}}><TapeView tape={cur.tape} head={cur.head} mc={mc}/></div>
        )}

        {/* ── PDA State + Stack ── */}
        {mode==="pda"&&!completed&&cur&&(
          <div style={{marginBottom:14,display:"flex",justifyContent:"center",gap:20,alignItems:"flex-start"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:C.ts,fontFamily:F.s,marginBottom:3}}>
                {li?"State":"Durum"}: <span style={{fontWeight:700,color:mc,fontFamily:F.m}}>{cur.state}</span></div>
              {step>0&&cur.read&&<div style={{fontSize:10,color:C.ts,fontFamily:F.s}}>
                {li?"Last":"Son"}: {cur.read}, pop:{cur.pop}, push:{cur.push}</div>}
            </div>
            <StackView stack={cur.stack} mc={mc}/>
          </div>
        )}

        {/* ── DFA/NFA Current State ── */}
        {(mode==="dfa"||mode==="nfa")&&!completed&&(
          <div style={{marginBottom:12,textAlign:"center"}}>
            <span style={{fontSize:11,color:C.ts,fontFamily:F.s}}>{li?"Current state: ":"Durum: "}</span>
            {mode==="dfa"?(<span style={{padding:"3px 10px",borderRadius:6,background:`${mc}14`,color:mc,fontSize:12,fontWeight:800,fontFamily:F.m}}>{cur.state}</span>
            ):(<span style={{fontSize:12,fontFamily:F.m}}>{"{"}{[...cur.states].map((s,i)=>(
              <span key={s}>{i>0&&", "}<span style={{padding:"2px 6px",borderRadius:4,background:`${mc}14`,color:mc,fontWeight:700}}>{s}</span></span>
            ))}{"}"}</span>)}
            <span style={{fontSize:11,color:C.ts,fontFamily:F.s,marginLeft:8}}>{li?`reading '${readSym()}'`:`'${readSym()}' okunuyor`}</span>
          </div>
        )}

        {/* ── TM Current State ── */}
        {mode==="tm"&&!completed&&cur&&(
          <div style={{marginBottom:12,textAlign:"center"}}>
            <span style={{fontSize:11,color:C.ts,fontFamily:F.s}}>{li?"State":"Durum"}: </span>
            <span style={{padding:"3px 10px",borderRadius:6,background:`${mc}14`,color:mc,fontSize:12,fontWeight:800,fontFamily:F.m}}>{cur.state}</span>
            <span style={{fontSize:11,color:C.ts,fontFamily:F.s,marginLeft:8}}>{li?`reading '${readSym()}'`:`'${readSym()}' okunuyor`}</span>
          </div>
        )}

        {/* ═══════ QUESTION AREA ═══════ */}
        {!completed&&!checked[step]&&step<totalSteps&&(<div style={{marginBottom:12}}>
          {/* DFA question */}
          {mode==="dfa"&&(<>
            <div style={{fontSize:12,fontWeight:700,color:C.wh,fontFamily:F.s,marginBottom:8,textAlign:"center"}}>
              \u03b4({cur.state}, {readSym()}) = ?</div>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              {ex.states.map(s=>(<SB key={s.id} label={(s.label||s.id)+(s.accept?" \u25ce":"")} sel={dfaSel===s.id} onClick={()=>setDfaSel(s.id)}/>))}
            </div></>)}

          {/* NFA question */}
          {mode==="nfa"&&(<>
            <div style={{fontSize:12,fontWeight:700,color:C.wh,fontFamily:F.s,marginBottom:8,textAlign:"center"}}>
              {li?"Select ALL reachable states:":"Ula\u015f\u0131labilir T\u00dcM durumlar\u0131 se\u00e7in:"}</div>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              {ex.states.map(s=>(<SB key={s.id} label={(s.label||s.id)+(s.accept?" \u25ce":"")} sel={nfaSel.has(s.id)}
                onClick={()=>setNfaSel(p=>{const n=new Set(p);n.has(s.id)?n.delete(s.id):n.add(s.id);return n;})}/>))}
            </div></>)}

          {/* PDA question */}
          {mode==="pda"&&(<>
            <div style={{fontSize:12,fontWeight:700,color:C.wh,fontFamily:F.s,marginBottom:10,textAlign:"center"}}>
              {li?"Choose: next state, pop, push":"Se\u00e7in: durum, pop, push"}</div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,color:C.ts,fontFamily:F.s,marginBottom:4}}>{li?"Next State":"Sonraki Durum"}:</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {ex.states.map(s=>(<SB key={s.id} label={s.label||s.id} sel={pdaSel.state===s.id} onClick={()=>setPdaSel(p=>({...p,state:s.id}))}/>))}
              </div></div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,color:C.ts,fontFamily:F.s,marginBottom:4}}>Pop:</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["\u03b5",...new Set(ex.pdaTransitions.map(t=>t.pop).filter(p=>p!=="\u03b5"))].map(p=>(
                  <SB key={p} label={p} sel={pdaSel.pop===p} onClick={()=>setPdaSel(prev=>({...prev,pop:p}))}/>))}
              </div></div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,color:C.ts,fontFamily:F.s,marginBottom:4}}>Push:</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["\u03b5",...new Set(ex.pdaTransitions.map(t=>t.push).filter(p=>p!=="\u03b5"))].map(p=>(
                  <SB key={p} label={p} sel={pdaSel.push===p} onClick={()=>setPdaSel(prev=>({...prev,push:p}))}/>))}
              </div></div>
          </>)}

          {/* TM question */}
          {mode==="tm"&&(<>
            <div style={{fontSize:12,fontWeight:700,color:C.wh,fontFamily:F.s,marginBottom:10,textAlign:"center"}}>
              {li?"Choose: write, direction, next state":"Se\u00e7in: yaz, y\u00f6n, durum"}</div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,color:C.ts,fontFamily:F.s,marginBottom:4}}>{li?"Write":"Yaz"}:</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[...new Set(ex.tmTransitions.map(t=>t.write))].map(w=>(
                  <SB key={w} label={w} sel={tmSel.write===w} onClick={()=>setTmSel(p=>({...p,write:w}))}/>))}
              </div></div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,color:C.ts,fontFamily:F.s,marginBottom:4}}>{li?"Direction":"Y\u00f6n"}:</div>
              <div style={{display:"flex",gap:5}}>
                {["L","R","S"].filter(d=>ex.tmTransitions.some(t=>t.dir===d)).map(d=>(
                  <SB key={d} label={d==="L"?"\u2190 L":d==="R"?"R \u2192":"\u25cf S"} sel={tmSel.dir===d} onClick={()=>setTmSel(p=>({...p,dir:d}))}/>))}
              </div></div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,color:C.ts,fontFamily:F.s,marginBottom:4}}>{li?"Next State":"Sonraki Durum"}:</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {ex.states.map(s=>(<SB key={s.id} label={s.label||s.id} sel={tmSel.state===s.id} onClick={()=>setTmSel(p=>({...p,state:s.id}))}/>))}
              </div></div>
          </>)}

          {/* Submit */}
          <div style={{textAlign:"center",marginTop:10}}>
            <button onClick={checkStep} disabled={!canSubmit} style={{padding:"8px 24px",borderRadius:8,
              background:canSubmit?mc:`${mc}30`,color:"#fff",fontSize:12,fontWeight:700,fontFamily:F.s,
              opacity:canSubmit?1:.5,transition:"all .15s",boxShadow:`0 2px 10px ${mc}30`}}>
              {li?"Check":"Kontrol Et"}</button>
          </div>
        </div>)}

        {/* ── Step feedback ── */}
        {checked[step]&&!completed&&(
          <div style={{textAlign:"center",padding:"10px 0",animation:"fadeUp .15s ease-out"}}>
            {checked[step]==="correct"?(<div style={{fontSize:13,fontWeight:700,color:C.ok,fontFamily:F.s}}>{"\u2713"} {li?"Correct!":"Do\u011fru!"}</div>
            ):(<div style={{fontSize:13,fontWeight:700,color:C.err,fontFamily:F.s}}>
              {"\u2717"} {li?"Wrong!":"Yanl\u0131\u015f!"}
              {mode==="pda"&&nxt&&` \u2192 (${nxt.state}, pop:${nxt.pop}, push:${nxt.push})`}
              {mode==="tm"&&nxt&&` \u2192 (${nxt.write}, ${nxt.dir}, ${nxt.state})`}
              {mode==="dfa"&&nxt&&` \u2192 ${nxt.state}`}
            </div>)}
          </div>
        )}

        {/* ── Completion ── */}
        {completed&&(
          <div style={{textAlign:"center",padding:"12px 0",animation:"fadeUp .2s ease-out"}}>
            <div style={{fontSize:18,fontWeight:900,color:correctCount===totalSteps?C.ok:C.warn,fontFamily:F.s,marginBottom:4}}>
              {correctCount===totalSteps?(li?"\ud83c\udf89 Perfect Trace!":"\ud83c\udf89 M\u00fckemmel \u0130z!"):
                `${correctCount}/${totalSteps} ${li?"correct":"do\u011fru"}`}
            </div>
            <div style={{fontSize:11,color:C.ts,fontFamily:F.s,marginBottom:4}}>
              {li?"Final state: ":"Son durum: "}
              <span style={{fontWeight:700,fontFamily:F.m,color:correctTrace.accepted?C.ok:C.err}}>
                {correctTrace.steps[correctTrace.steps.length-1].state||
                 (correctTrace.steps[correctTrace.steps.length-1].states&&[...correctTrace.steps[correctTrace.steps.length-1].states].join(","))}
              </span>
              {correctTrace.accepted?<span style={{color:C.ok,fontWeight:700}}> \u2192 {li?"ACCEPT":"KABUL"}</span>
                :<span style={{color:C.err,fontWeight:700}}> \u2192 {li?"REJECT":"RET"}</span>}
            </div>

            {/* TM final tape */}
            {mode==="tm"&&correctTrace.finalTape&&(
              <div style={{marginTop:8}}>
                <div style={{fontSize:10,color:C.ts,fontFamily:F.s,marginBottom:4}}>{li?"Final tape:":"Son bant:"}</div>
                <div style={{display:"flex",justifyContent:"center"}}><TapeView tape={correctTrace.finalTape} head={correctTrace.steps[correctTrace.steps.length-1].head} mc={mc}/></div>
              </div>)}

            {/* PDA final stack */}
            {mode==="pda"&&(
              <div style={{marginTop:8}}>
                <div style={{fontSize:10,color:C.ts,fontFamily:F.s,marginBottom:4}}>{li?"Final stack:":"Son stack:"}</div>
                <div style={{display:"flex",justifyContent:"center"}}><StackView stack={correctTrace.steps[correctTrace.steps.length-1].stack} mc={mc}/></div>
              </div>)}

            {/* Full trace */}
            <div style={{marginTop:10,padding:"8px 14px",borderRadius:8,background:C.s2,border:`1px solid ${C.bd}`,textAlign:"left"}}>
              <div style={{fontSize:9,fontWeight:700,color:C.ts,fontFamily:F.s,marginBottom:6,textTransform:"uppercase"}}>{li?"Full Trace":"Tam \u0130z"}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3,alignItems:"center"}}>
                {correctTrace.steps.map((s,i)=>(
                  <span key={i} style={{display:"inline-flex",alignItems:"center",gap:3}}>
                    <span style={{padding:"2px 8px",borderRadius:5,
                      background:(s.state||"")&&ex.states.find(st=>st.id===s.state)?.accept?`${C.ok}14`:`${mc}10`,
                      color:(s.state||"")&&ex.states.find(st=>st.id===s.state)?.accept?C.ok:mc,
                      fontSize:10,fontWeight:700,fontFamily:F.m}}>
                      {s.state||(s.states?`{${[...s.states].join(",")}}`:"")}
                      {mode==="pda"&&s.stack&&<span style={{opacity:.6,marginLeft:3}}>[{s.stack.join("")}]</span>}
                    </span>
                    {i<correctTrace.steps.length-1&&(
                      <span style={{fontSize:8,color:C.ts,fontFamily:F.m}}>
                        {mode==="pda"?`\u2192${(correctTrace.steps[i+1].read)||"\u03b5"}\u2192`:
                         mode==="tm"?`\u2192${(correctTrace.steps[i+1].write)||""}${(correctTrace.steps[i+1].dir)||""}\u2192`:
                         `\u2192${ex.string[i]}\u2192`}
                      </span>)}
                  </span>))}
              </div>
            </div>
          </div>
        )}

      </div>
    </Card>
  );
}
