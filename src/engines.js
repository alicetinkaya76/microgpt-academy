// ═══════════════════════════════════════════════════════════════
// engines.js — Simulation & Grading Engines
// Pure functions, no React. All accept (states[], trans[], input)
// ═══════════════════════════════════════════════════════════════

/* ─── DFA Simulate ────────────────────────────────────────────
   Returns { path:[{st, ch}], ok:bool, stuck?:int }            */
export function simDFA(states, trans, inp) {
  const s0 = states.find(s => s.start);
  if (!s0) return { path: [], ok: false };
  const path = [{ st: s0.id, ch: null }];
  let cur = s0.id;
  for (let i = 0; i < inp.length; i++) {
    const c = inp[i];
    const t = trans.find(t => t.fr === cur && t.syms.includes(c));
    if (!t) return { path, ok: false, stuck: i };
    cur = t.to;
    path.push({ st: cur, ch: c });
  }
  return { path, ok: !!states.find(s => s.id === cur)?.accept };
}

/* ─── Faz 5: DFA Simulate with Verbose Diagnostics ───────────
   Returns everything simDFA returns + failReason, failMessage  */
export function simDFA_verbose(states, trans, inp) {
  const s0 = states.find(s => s.start);
  if (!s0) return { path: [], ok: false, failReason: "no_start",
    failMessage: { tr: "Başlangıç durumu tanımlı değil.", en: "No start state defined." } };
  
  const path = [{ st: s0.id, ch: null }];
  let cur = s0.id;
  
  for (let i = 0; i < inp.length; i++) {
    const c = inp[i];
    const t = trans.find(t => t.fr === cur && t.syms.includes(c));
    if (!t) {
      const stLabel = states.find(s => s.id === cur)?.label || cur;
      return {
        path, ok: false, stuck: i, failReason: "no_transition", failStep: i,
        failMessage: {
          tr: `Adım ${i+1}: ${stLabel} durumunda '${c}' okundu ama geçiş yok → TRAP'e düştü.`,
          en: `Step ${i+1}: In state ${stLabel}, read '${c}' but no transition exists → fell into TRAP.`
        }
      };
    }
    cur = t.to;
    path.push({ st: cur, ch: c });
  }
  
  const acc = states.find(s => s.id === cur)?.accept;
  if (acc) return { path, ok: true, failReason: null, failMessage: null };
  
  const stLabel = states.find(s => s.id === cur)?.label || cur;
  const fStates = states.filter(s => s.accept).map(s => s.label || s.id).join(",");
  return {
    path, ok: false, failReason: "final_not_accept", failStep: inp.length,
    failMessage: {
      tr: `Son durum ${stLabel}, ama ${stLabel} ∉ F={${fStates}}. Kabul durumunu kontrol edin.`,
      en: `Final state ${stLabel}, but ${stLabel} ∉ F={${fStates}}. Check your accept states.`
    }
  };
}

/* ─── NFA Simulate (ε-closure BFS) ───────────────────────────
   Returns { steps:[{sts:Set, ch}], ok:bool }                  */
export function simNFA(states, trans, inp) {
  const s0 = states.find(s => s.start);
  if (!s0) return { steps: [], ok: false };

  const eCl = (ids) => {
    const cl = new Set(ids), stk = [...ids];
    while (stk.length) {
      const s = stk.pop();
      trans.filter(t => t.fr === s && t.syms.includes("ε"))
        .forEach(t => { if (!cl.has(t.to)) { cl.add(t.to); stk.push(t.to); } });
    }
    return cl;
  };

  let cur = eCl([s0.id]);
  const steps = [{ sts: new Set(cur), ch: null }];

  for (let i = 0; i < inp.length; i++) {
    const c = inp[i], nx = new Set();
    cur.forEach(s =>
      trans.filter(t => t.fr === s && t.syms.includes(c))
        .forEach(t => nx.add(t.to))
    );
    cur = eCl(nx);
    steps.push({ sts: new Set(cur), ch: c });
    if (!cur.size) return { steps, ok: false };
  }
  return { steps, ok: [...cur].some(id => states.find(s => s.id === id)?.accept) };
}

/* ─── PDA Simulate (Nondeterministic BFS) ────────────────────
   trans: { fr, to, syms:["a,ε→Z"] } — "read, pop → push"
   Returns { hist:[{st,stk,ch}], ok:bool }                     */
export function simPDA(states, trans, inp) {
  const s0 = states.find(s => s.start);
  if (!s0) return { hist: [], ok: false };

  const parse = (sym) => {
    // format: "a, X → YZ" or "a,X→YZ" or just "a"
    const m = sym.match(/^(.+?)\s*,\s*(.+?)\s*→\s*(.+)$/);
    if (m) return { rd: m[1].trim(), pop: m[2].trim(), push: m[3].trim() };
    return { rd: sym, pop: "ε", push: "ε" };
  };

  const q = [{ st: s0.id, stk: [], pos: 0, hist: [{ st: s0.id, stk: [], ch: null }] }];
  let iter = 0;

  while (q.length && iter++ < 1200) {
    const cf = q.shift();
    // Accept: consumed all input + in accept state
    if (cf.pos >= inp.length && states.find(s => s.id === cf.st)?.accept)
      return { hist: cf.hist, ok: true, stk: cf.stk };

    for (const t of trans.filter(x => x.fr === cf.st)) {
      for (const sym of t.syms) {
        const p = parse(sym);
        const canRd = p.rd === "ε" || (cf.pos < inp.length && inp[cf.pos] === p.rd);
        const top = cf.stk.length ? cf.stk[cf.stk.length - 1] : null;
        const canPop = p.pop === "ε" || top === p.pop;

        if (canRd && canPop) {
          const ns = [...cf.stk];
          if (p.pop !== "ε") ns.pop();
          if (p.push !== "ε") {
            // Push in reverse so first char ends on top
            for (let i = p.push.length - 1; i >= 0; i--) {
              if (p.push[i] !== "ε") ns.push(p.push[i]);
            }
          }
          const np = p.rd === "ε" ? cf.pos : cf.pos + 1;
          q.push({
            st: t.to, stk: ns, pos: np,
            hist: [...cf.hist, { st: t.to, stk: [...ns], ch: p.rd === "ε" ? "ε" : inp[cf.pos] }]
          });
        }
      }
    }
  }
  return { hist: [{ st: s0?.id, stk: [], ch: null }], ok: false };
}

/* ─── TM Simulate ────────────────────────────────────────────
   trans: { fr, to, tmRead, tmWrite, tmDir:"L"|"R"|"S" }
   Returns { snaps:[{st,tape,hd}], ok, rej, halt, loop }       */
export function simTM(states, trans, inp) {
  const s0 = states.find(s => s.start);
  if (!s0) return { snaps: [], ok: false };

  let tape = inp.length ? inp.split("") : ["␣"];
  let head = 0, cur = s0.id;
  const snaps = [{ st: cur, tape: [...tape], hd: head }];

  for (let i = 0; i < 3000; i++) {
    const st = states.find(s => s.id === cur);
    if (st?.accept) return { snaps, ok: true };
    if (st?.reject) return { snaps, ok: false, rej: true };

    const sym = tape[head] || "␣";
    const t = trans.find(x => x.fr === cur && x.tmRead === sym);
    if (!t) return { snaps, ok: false, halt: true };

    tape[head] = t.tmWrite;
    if (t.tmDir === "L") head--;
    else if (t.tmDir === "R") head++;
    // S = stay

    if (head < 0) { tape.unshift("␣"); head = 0; }
    while (head >= tape.length) tape.push("␣");

    cur = t.to;
    snaps.push({ st: cur, tape: [...tape], hd: head });
  }
  return { snaps, ok: false, loop: true };
}

/* ─── NFA→DFA Subset Construction ────────────────────────────
   Returns { dfaStates, dfaTrans, steps[] } for animation       */
export function subsetConstruction(states, trans, alpha) {
  const eCl = (ids) => {
    const cl = new Set(ids), stk = [...ids];
    while (stk.length) {
      const s = stk.pop();
      trans.filter(t => t.fr === s && t.syms.includes("ε"))
        .forEach(t => { if (!cl.has(t.to)) { cl.add(t.to); stk.push(t.to); } });
    }
    return [...cl].sort();
  };

  const s0 = states.find(s => s.start);
  if (!s0) return { dfaStates: [], dfaTrans: [], steps: [] };

  const startSet = eCl([s0.id]);
  const key = ss => ss.join(",");
  const queue = [startSet];
  const visited = new Map();
  visited.set(key(startSet), {
    id: `{${startSet.join(",")}}`,
    members: startSet,
    accept: startSet.some(id => states.find(s => s.id === id)?.accept),
    start: true
  });

  const dfaTrans = [];
  const steps = [];

  while (queue.length) {
    const cur = queue.shift();
    const curKey = key(cur);

    for (const a of alpha.filter(x => x !== "ε")) {
      const moved = new Set();
      cur.forEach(sid =>
        trans.filter(t => t.fr === sid && t.syms.includes(a))
          .forEach(t => moved.add(t.to))
      );
      const next = eCl([...moved]);
      const nKey = key(next);

      if (next.length === 0) continue;

      if (!visited.has(nKey)) {
        visited.set(nKey, {
          id: `{${next.join(",")}}`,
          members: next,
          accept: next.some(id => states.find(s => s.id === id)?.accept),
          start: false
        });
        queue.push(next);
      }

      dfaTrans.push({ fr: `{${cur.join(",")}}`, to: `{${next.join(",")}}`, sym: a });
      steps.push({
        from: curKey, sym: a, to: nKey,
        moved: [...moved], closed: next,
        desc: `δ({${cur.join(",")}}, ${a}) = {${next.join(",")}}`
      });
    }
  }

  return {
    dfaStates: [...visited.values()],
    dfaTrans,
    steps
  };
}

/* ─── RE→NFA Thompson Construction ───────────────────────────
   Tokenize + recursive descent parse → animated NFA build
   Returns { nfa:{states,trans}, steps:[] }                     */
export function thompsonConstruct(regex) {
  // Tokenizer
  const tokens = [];
  let i = 0;
  while (i < regex.length) {
    const c = regex[i];
    if (c === '(' || c === ')' || c === '*' || c === '∪' || c === '|' || c === '·' || c === '+') {
      tokens.push({ type: c === '∪' || c === '|' ? 'UNION' : c === '·' ? 'CONCAT' : c === '*' ? 'STAR' : c === '+' ? 'PLUS' : c, value: c });
    } else if (c === 'ε' || c === '∅') {
      tokens.push({ type: 'CHAR', value: c });
    } else if (/[a-zA-Z0-9]/.test(c)) {
      tokens.push({ type: 'CHAR', value: c });
    }
    i++;
  }

  let pos = 0;
  let stateCount = 0;
  const steps = [];
  const mkSt = () => `s${stateCount++}`;

  // Build NFA for single character
  const charNFA = (c) => {
    const s = mkSt(), e = mkSt();
    const nfa = { states: [s, e], trans: [{ fr: s, to: e, sym: c }], start: s, end: e };
    steps.push({ op: `NFA(${c})`, desc: `${s} --${c}--> ${e}`, nfa: { ...nfa } });
    return nfa;
  };

  // Concatenation
  const concatNFA = (a, b) => {
    const nfa = {
      states: [...a.states, ...b.states],
      trans: [...a.trans, ...b.trans, { fr: a.end, to: b.start, sym: "ε" }],
      start: a.start, end: b.end
    };
    steps.push({ op: "Concat", desc: `${a.end} --ε--> ${b.start}`, nfa: { ...nfa } });
    return nfa;
  };

  // Union
  const unionNFA = (a, b) => {
    const s = mkSt(), e = mkSt();
    const nfa = {
      states: [s, ...a.states, ...b.states, e],
      trans: [
        ...a.trans, ...b.trans,
        { fr: s, to: a.start, sym: "ε" }, { fr: s, to: b.start, sym: "ε" },
        { fr: a.end, to: e, sym: "ε" }, { fr: b.end, to: e, sym: "ε" }
      ],
      start: s, end: e
    };
    steps.push({ op: "Union", desc: `${s} --ε--> {${a.start}, ${b.start}} --> ${e}`, nfa: { ...nfa } });
    return nfa;
  };

  // Kleene star
  const starNFA = (a) => {
    const s = mkSt(), e = mkSt();
    const nfa = {
      states: [s, ...a.states, e],
      trans: [
        ...a.trans,
        { fr: s, to: a.start, sym: "ε" }, { fr: s, to: e, sym: "ε" },
        { fr: a.end, to: a.start, sym: "ε" }, { fr: a.end, to: e, sym: "ε" }
      ],
      start: s, end: e
    };
    steps.push({ op: "Kleene*", desc: `${s} --ε--> ${a.start}, ${a.end} --ε--> ${a.start} (loop)`, nfa: { ...nfa } });
    return nfa;
  };

  // Simple recursive descent for: E → T ('∪' T)* ; T → F F* ; F → ATOM ('*'|'+')? ; ATOM → '(' E ')' | char
  const parseExpr = () => {
    let node = parseTerm();
    while (pos < tokens.length && tokens[pos]?.type === 'UNION') {
      pos++;
      node = unionNFA(node, parseTerm());
    }
    return node;
  };

  const parseTerm = () => {
    let node = parseFactor();
    while (pos < tokens.length && tokens[pos]?.type !== 'UNION' && tokens[pos]?.type !== ')' && tokens[pos]) {
      node = concatNFA(node, parseFactor());
    }
    return node;
  };

  const parseFactor = () => {
    let node = parseAtom();
    while (pos < tokens.length && (tokens[pos]?.type === 'STAR' || tokens[pos]?.type === 'PLUS')) {
      if (tokens[pos].type === 'STAR') { pos++; node = starNFA(node); }
      else if (tokens[pos].type === 'PLUS') {
        pos++;
        // a+ = aa*
        const copy = charNFA(node.trans[0]?.sym || "?"); // simplified
        node = concatNFA(node, starNFA(copy));
      }
    }
    return node;
  };

  const parseAtom = () => {
    if (pos < tokens.length && tokens[pos]?.value === '(') {
      pos++; // skip (
      const node = parseExpr();
      if (pos < tokens.length && tokens[pos]?.value === ')') pos++; // skip )
      return node;
    }
    if (pos < tokens.length && tokens[pos]?.type === 'CHAR') {
      const c = tokens[pos].value;
      pos++;
      if (c === 'ε') {
        const s = mkSt(), e = mkSt();
        const nfa = { states: [s, e], trans: [{ fr: s, to: e, sym: "ε" }], start: s, end: e };
        steps.push({ op: "NFA(ε)", desc: `${s} --ε--> ${e}`, nfa: { ...nfa } });
        return nfa;
      }
      if (c === '∅') {
        const s = mkSt(), e = mkSt();
        const nfa = { states: [s, e], trans: [], start: s, end: e };
        steps.push({ op: "NFA(∅)", desc: `${s}, ${e} (no transition)`, nfa: { ...nfa } });
        return nfa;
      }
      return charNFA(c);
    }
    // fallback
    return charNFA("?");
  };

  try {
    const result = parseExpr();
    return { nfa: result, steps };
  } catch (e) {
    return { nfa: null, steps, error: e.message };
  }
}

/* ─── Grader: Language Equivalence by Sampling ───────────────
   Compare student's automaton vs reference by testing all
   strings up to length maxLen. Returns { ok, score, fb, mm }  */
export function grade(stuSt, stuTr, refSt, refTr, alpha, mode = "dfa", maxLen = 7) {
  const gen = (a, mx) => {
    const r = [""], q = [""];
    while (q.length) {
      const s = q.shift();
      if (s.length >= mx) continue;
      for (const c of a) { r.push(s + c); q.push(s + c); }
    }
    return r;
  };

  const sim = mode === "nfa" ? simNFA : simDFA;
  const strs = gen(alpha, maxLen);
  const mm = [];

  for (const s of strs) {
    const got = sim(stuSt, stuTr, s).ok;
    const want = sim(refSt, refTr, s).ok;
    if (got !== want) {
      mm.push({ s: s || "ε", got, want });
      if (mm.length >= 5) break;
    }
  }

  if (!mm.length) return { ok: true, score: 100, fb: "🎉 Mükemmel! Otomatınız doğru." };

  const fp = mm.filter(m => m.got && !m.want);
  const fn = mm.filter(m => !m.got && m.want);
  const fb = [];
  if (fp.length) fb.push(`❌ "${fp[0].s}" reddedilmeli ama kabul ediliyor.`);
  if (fn.length) fb.push(`❌ "${fn[0].s}" kabul edilmeli ama reddediliyor.`);

  return {
    ok: false,
    score: Math.max(0, Math.round((1 - mm.length / strs.length) * 100)),
    fb: fb.join("\n"),
    mm
  };
}

/* ─── Faz 6: DFA Minimization (Table-Filling Algorithm) ──────
   Returns { minStates, minTrans, equivalences, steps[] }      */
export function minimizeDFA(states, trans, alpha) {
  // Filter out only states reachable from start
  const s0 = states.find(s => s.start);
  if (!s0) return { minStates: [], minTrans: [], equivalences: [], steps: [] };

  // BFS to find reachable states
  const reachable = new Set();
  const queue = [s0.id];
  reachable.add(s0.id);
  while (queue.length) {
    const cur = queue.shift();
    for (const a of alpha) {
      const t = trans.find(t => t.fr === cur && t.syms.includes(a));
      if (t && !reachable.has(t.to)) {
        reachable.add(t.to);
        queue.push(t.to);
      }
    }
  }

  const rStates = states.filter(s => reachable.has(s.id));
  const ids = rStates.map(s => s.id);
  const n = ids.length;
  const steps = [];

  // Table: distinguishable[i][j] (i < j)
  const dist = {};
  const key = (a, b) => a < b ? `${a}|${b}` : `${b}|${a}`;

  // Step 1: Mark accept/non-accept pairs as distinguishable
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const si = rStates[i], sj = rStates[j];
      if (!!si.accept !== !!sj.accept) {
        dist[key(ids[i], ids[j])] = true;
        steps.push({
          type: "init",
          pair: [ids[i], ids[j]],
          reason: { tr: `${ids[i]}(${si.accept?"kabul":"ret"}) ≠ ${ids[j]}(${sj.accept?"kabul":"ret"})`,
                    en: `${ids[i]}(${si.accept?"accept":"reject"}) ≠ ${ids[j]}(${sj.accept?"accept":"reject"})` }
        });
      }
    }
  }

  // Step 2: Iterate until no change
  let changed = true;
  let round = 0;
  while (changed && round < 100) {
    changed = false;
    round++;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const k = key(ids[i], ids[j]);
        if (dist[k]) continue;
        for (const a of alpha) {
          const ti = trans.find(t => t.fr === ids[i] && t.syms.includes(a));
          const tj = trans.find(t => t.fr === ids[j] && t.syms.includes(a));
          const di = ti ? ti.to : null;
          const dj = tj ? tj.to : null;
          if (di && dj && di !== dj && dist[key(di, dj)]) {
            dist[k] = true;
            changed = true;
            steps.push({
              type: "propagate", round,
              pair: [ids[i], ids[j]], symbol: a,
              targets: [di, dj],
              reason: { tr: `δ(${ids[i]},${a})=${di}, δ(${ids[j]},${a})=${dj} ayırt edilebilir → (${ids[i]},${ids[j]}) de ayırt edilebilir`,
                        en: `δ(${ids[i]},${a})=${di}, δ(${ids[j]},${a})=${dj} distinguishable → (${ids[i]},${ids[j]}) also distinguishable` }
            });
            break;
          }
        }
      }
    }
  }

  // Step 3: Group equivalent states
  const groups = [];
  const assigned = new Set();
  for (let i = 0; i < n; i++) {
    if (assigned.has(ids[i])) continue;
    const group = [ids[i]];
    assigned.add(ids[i]);
    for (let j = i + 1; j < n; j++) {
      if (!assigned.has(ids[j]) && !dist[key(ids[i], ids[j])]) {
        group.push(ids[j]);
        assigned.add(ids[j]);
      }
    }
    groups.push(group);
  }

  // Build minimized DFA
  const groupLabel = g => g.length === 1 ? g[0] : `{${g.join(",")}}`;
  const findGroup = id => groups.find(g => g.includes(id));
  
  const minStates = groups.map(g => ({
    id: groupLabel(g),
    label: groupLabel(g),
    start: g.some(id => rStates.find(s => s.id === id)?.start),
    accept: g.some(id => rStates.find(s => s.id === id)?.accept),
    members: g
  }));

  const minTransSet = new Set();
  const minTrans = [];
  for (const g of groups) {
    const rep = g[0]; // use first member as representative
    for (const a of alpha) {
      const t = trans.find(t => t.fr === rep && t.syms.includes(a));
      if (t) {
        const tg = findGroup(t.to);
        const tk = `${groupLabel(g)}|${a}|${groupLabel(tg)}`;
        if (!minTransSet.has(tk)) {
          minTransSet.add(tk);
          minTrans.push({ fr: groupLabel(g), to: groupLabel(tg), syms: [a] });
        }
      }
    }
  }

  // Merge transitions with same fr/to into single entry
  const merged = {};
  minTrans.forEach(t => {
    const k = `${t.fr}>${t.to}`;
    if (merged[k]) merged[k].syms.push(...t.syms);
    else merged[k] = { ...t, syms: [...t.syms] };
  });

  steps.push({
    type: "result",
    groups,
    reason: { tr: `${n} durum → ${groups.length} durum. Eşdeğer gruplar: ${groups.map(g=>groupLabel(g)).join(", ")}`,
              en: `${n} states → ${groups.length} states. Equivalent groups: ${groups.map(g=>groupLabel(g)).join(", ")}` }
  });

  return {
    minStates,
    minTrans: Object.values(merged),
    equivalences: groups,
    steps,
    table: { ids, dist }
  };
}
