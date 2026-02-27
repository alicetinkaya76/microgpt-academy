// ═══════════════════════════════════════════════════════════════
// TheoryView.jsx v4 — Universal Theory/Proof Challenge Viewer
// PL proofs · CFG · PDA · TM · RE · GNFA · RE_MEM · RE_NFA
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { C, F, CATS, DIF, Card, Tag, useI18n } from "../theme";

export default function TheoryView({ ch, onBack }) {
  const { t, lang } = useI18n();
  const [shown, setShown] = useState({});
  const cat = CATS[ch.tp] || CATS.pl;
  const col = cat.c;

  const plSteps = ch.s ? [
    { k:"s",    lb:t("strChoice"),  v:ch.s,     c:C.info },
    { k:"part", lb:t("partition"),  v:ch.part,  c:C.ch2 },
    { k:"pump", lb:t("pumping"),    v:ch.pump,  c:C.warn },
    { k:"contr",lb:t("contra"),     v:ch.contr, c:C.err },
  ].filter(s=>s.v) : null;

  const ordSteps = ch.steps ? ch.steps.map((s,i)=>({
    k:`st${i}`, lb:`${t("step")} ${i+1}`, v:s,
    c:[C.info,C.ch2,"#22d3ee",C.warn,C.ok,C.ch3][i%6]
  })) : null;

  const allSteps = plSteps || ordSteps || [];
  const tog = k => setShown(p=>({...p,[k]:!p[k]}));
  const showAllSteps = () => { const a={}; allSteps.forEach(s=>a[s.k]=true); setShown(a); };

  return (
    <div style={{maxWidth:800,animation:"fadeIn .25s ease-out"}}>
      <button onClick={onBack} style={{padding:"7px 14px",borderRadius:8,background:C.gl2,color:C.ts,
        fontSize:12,fontWeight:600,fontFamily:F.s,border:`1px solid ${C.bd}`,marginBottom:14}}>{t("back")}</button>

      {/* Header */}
      <Card color={col} pad={18} style={{marginBottom:16}}>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
          <Tag color={col}>{cat.l}</Tag>
          {ch.src && <Tag color={C.ts}>{ch.src}</Tag>}
          <Tag color={DIF[Math.min((ch.dif||1)-1,2)].c}>{lang==="en"?DIF[Math.min((ch.dif||1)-1,2)].en:DIF[Math.min((ch.dif||1)-1,2)].tr}</Tag>
        </div>
        <h2 style={{fontSize:18,fontWeight:800,color:C.wh,fontFamily:F.s,margin:"0 0 8px"}}>{ch.tit}</h2>
        <div style={{fontSize:12,color:C.tx,lineHeight:1.7,fontFamily:F.m,whiteSpace:"pre-line"}}>{ch.desc}</div>
      </Card>

      {/* Interactive Steps (PL proofs / ordered steps) */}
      {allSteps.length>0 && (
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:16}}>
          {allSteps.map(st=>(
            <div key={st.k} style={{borderRadius:11,overflow:"hidden",border:`1px solid ${st.c}18`}}>
              <button onClick={()=>tog(st.k)} style={{width:"100%",padding:"11px 16px",
                background:shown[st.k]?`${st.c}10`:`${st.c}06`,textAlign:"left",
                display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:F.s}}>
                <span style={{fontSize:13,fontWeight:700,color:st.c}}>{st.lb}</span>
                <span style={{color:C.tm,fontSize:11}}>{shown[st.k]?"▼":"▶"}</span>
              </button>
              {shown[st.k] && (
                <div style={{padding:"12px 16px",fontSize:13,fontFamily:F.m,color:C.tx,lineHeight:1.7,
                  whiteSpace:"pre-line",background:`${st.c}04`,borderTop:`1px solid ${st.c}10`,animation:"fadeUp .15s ease-out"}}>
                  {st.v}
                </div>
              )}
            </div>
          ))}
          <button onClick={showAllSteps} style={{padding:"7px 14px",borderRadius:7,background:C.gl2,
            border:`1px solid ${C.bd}`,color:C.ts,fontSize:11,fontWeight:600,fontFamily:F.s,alignSelf:"flex-start"}}>
            {t("showAll")}
          </button>
        </div>
      )}

      {/* Content Cards */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {/* RE Answer */}
        {ch.ans && (
          <Card color={col} pad={16}>
            <span style={{fontSize:11,color:col,fontWeight:700,fontFamily:F.s}}>{t("answer")}: </span>
            <span style={{fontFamily:F.m,fontSize:16,color:C.wh,fontWeight:700}}>{ch.ans}</span>
            {ch.expl && <div style={{fontSize:12,color:C.tx,lineHeight:1.6,marginTop:8,whiteSpace:"pre-line",fontFamily:F.s}}>{ch.expl}</div>}
          </Card>
        )}

        {/* Grammar */}
        {ch.gram && (
          <Card color={C.ok} pad={16}>
            <div style={{fontSize:11,color:C.ok,fontWeight:700,marginBottom:6,fontFamily:F.s}}>{t("grammar")}</div>
            <pre style={{fontFamily:F.m,fontSize:13,color:C.wh,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{ch.gram}</pre>
          </Card>
        )}

        {/* Derivation */}
        {ch.deriv && (
          <Card color={C.ch2} pad={16}>
            <div style={{fontSize:11,color:C.ch2,fontWeight:700,marginBottom:6,fontFamily:F.s}}>{t("derivation")}</div>
            <div style={{fontFamily:F.m,fontSize:13,color:C.tx,lineHeight:1.8}}>{ch.deriv}</div>
          </Card>
        )}

        {/* PDA Transitions */}
        {ch.transitions && (
          <Card color={CATS.pda.c} pad={16}>
            <div style={{fontSize:11,color:CATS.pda.c,fontWeight:700,marginBottom:8,fontFamily:F.s}}>PDA δ</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {ch.transitions.map((tr,i)=>(
                <div key={i} style={{padding:"7px 12px",borderRadius:7,background:`${CATS.pda.c}06`,border:`1px solid ${CATS.pda.c}10`,
                  fontFamily:F.m,fontSize:12,color:C.tx,lineHeight:1.5}}>{tr}</div>
              ))}
            </div>
          </Card>
        )}

        {/* RE Membership */}
        {ch.mem && (
          <Card color={col} pad={16}>
            <div style={{fontSize:13,fontFamily:F.m,color:C.ts,marginBottom:10}}>R = {ch.re}</div>
            <div style={{marginBottom:6}}>
              <span style={{fontSize:12,color:C.ok,fontWeight:700,fontFamily:F.s}}>✓ {t("members")}: </span>
              <span style={{fontFamily:F.m,color:C.tx}}>{ch.mem.map(s=>`"${s}"`).join(", ")}</span>
            </div>
            <div>
              <span style={{fontSize:12,color:C.err,fontWeight:700,fontFamily:F.s}}>✗ {t("nonMembers")}: </span>
              <span style={{fontFamily:F.m,color:C.tx}}>{ch.non.map(s=>`"${s}"`).join(", ")}</span>
            </div>
          </Card>
        )}

        {/* RE display (for re_nfa) */}
        {ch.re && !ch.mem && (
          <div style={{padding:12,borderRadius:10,background:`${"#22d3ee"}06`,border:`1px solid ${"#22d3ee"}12`,
            fontFamily:F.m,fontSize:14,color:"#22d3ee",fontWeight:600}}>R = {ch.re}</div>
        )}

        {/* General explanation */}
        {ch.expl && !ch.ans && (
          <Card color={C.bd} pad={16}>
            <div style={{fontSize:12,color:C.tx,lineHeight:1.7,whiteSpace:"pre-line",fontFamily:F.s}}>{ch.expl}</div>
          </Card>
        )}
      </div>
    </div>
  );
}
