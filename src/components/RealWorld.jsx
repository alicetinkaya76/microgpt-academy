import { C, F, Card, useI18n } from "../theme";

const EX = [
  {icon:"⚡",t:["Derleyici Lexer","Compiler Lexer"],d:["gcc/clang tokenizer → DFA ile keyword, identifier, sayı tanıma","gcc/clang tokenizer → DFA for keyword, identifier, number recognition"],code:"if|else|while → keyword\n[a-z]+ → identifier"},
  {icon:"📧",t:["E-posta Doğrulama","Email Validation"],d:["RFC 5322 regex: user@domain formatı kontrol","RFC 5322 regex: validate user@domain format"],code:"^[a-zA-Z0-9+]+@[a-zA-Z0-9]+\\.[a-z]+$"},
  {icon:"🚦",t:["Trafik Işıkları","Traffic Lights"],d:["FSM ile durum geçişi: Yeşil→Sarı→Kırmızı→Yeşil","FSM state transitions: Green→Yellow→Red→Green"],code:"Green --timer--> Yellow --timer--> Red"},
  {icon:"🎮",t:["Oyun AI (FSM)","Game AI (FSM)"],d:["Unity/Unreal: Idle→Patrol→Chase→Attack","Unity/Unreal: Idle→Patrol→Chase→Attack"],code:"Idle --seeEnemy--> Chase --inRange--> Attack"},
  {icon:"🌐",t:["TCP/IP Protokolü","TCP/IP Protocol"],d:["RFC 793: 11 durumlu bağlantı FSM'i","RFC 793: 11-state connection FSM"],code:"CLOSED→SYN_SENT→ESTABLISHED→FIN_WAIT"},
  {icon:"🧬",t:["DNA Dizi Eşleme","DNA Sequence Matching"],d:["BLAST: Aho-Corasick multi-pattern NFA","BLAST: Aho-Corasick multi-pattern NFA"],code:"ATCG pattern → NFA → match positions"},
  {icon:"🛡️",t:["Web Güvenliği (WAF)","Web Security (WAF)"],d:["SQL injection / XSS regex tespiti","SQL injection / XSS regex detection"],code:"/(SELECT|DROP|UNION).*FROM/i → block"},
  {icon:"📱",t:["UI State Yönetimi","UI State Management"],d:["React/XState: form durumları, modal geçişleri","React/XState: form states, modal transitions"],code:"idle→loading→success|error→idle"},
];

export default function RealWorld() {
  const { lang } = useI18n();
  const li = lang==="en"?1:0;
  return(
    <div style={{animation:"fadeIn .25s ease-out"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10}}>
        {EX.map((ex,i)=>(
          <Card key={i} color={C.bd} pad={14}>
            <div style={{display:"flex",gap:10,alignItems:"start"}}>
              <div style={{fontSize:22,lineHeight:1}}>{ex.icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.wh,fontFamily:F.s,marginBottom:4}}>{ex.t[li]}</div>
                <div style={{fontSize:11,color:C.ts,lineHeight:1.5,fontFamily:F.s,marginBottom:6}}>{ex.d[li]}</div>
                <pre style={{fontSize:10,color:C.info,fontFamily:F.m,lineHeight:1.5,margin:0,whiteSpace:"pre-wrap",
                  padding:"6px 8px",borderRadius:6,background:C.gl2}}>{ex.code}</pre>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
