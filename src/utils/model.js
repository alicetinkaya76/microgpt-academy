import { gauss, softmax, rmsnorm, matmul, relu2 } from './math';

const NAMES = ["emma","olivia","sophia","mia","charlotte","amelia","harper","evelyn","abigail","emily","ella","madison","scarlett","aria","grace","chloe","penelope","riley","layla","nora","zoey","mila","aubrey","hannah","lily","addison","luna","brooklyn","leah","stella","hazel","violet","aurora","lucy","anna","samantha","caroline","maya","sarah","eva","emilia","autumn","quinn","ruby","willow","cora","lydia","clara","vivian","nova","liam","noah","oliver","elijah","james","william","benjamin","lucas","henry","alexander","mason","michael","ethan","daniel","jacob","logan","jackson","levi","sebastian","jack","owen","theodore","aiden","samuel","joseph","john","david","wyatt","matthew","luke","asher","carter","julian","leo","jayden","gabriel","isaac","lincoln","anthony","hudson","dylan","ezra","thomas","caleb"];
const CHARS = ["<BOS>","<EOS>",..."abcdefghijklmnopqrstuvwxyz".split("")];
const VOCAB = CHARS.length;
const stoi = Object.fromEntries(CHARS.map((c, i) => [c, i]));
const itos = Object.fromEntries(CHARS.map((c, i) => [i, c]));
const BOS = 0, EOS = 1;

function createModel(nE = 16, nH = 4, bs = 8) {
  const M = (r, c, s = 0.02) => Array.from({ length: r }, () => Array.from({ length: c }, () => gauss(s)));
  return { sd: { wte: M(VOCAB, nE), wpe: M(bs, nE), wq: M(nE, nE), wk: M(nE, nE), wv: M(nE, nE), wo: M(nE, nE, 0), fc1: M(4 * nE, nE), fc2: M(nE, 4 * nE, 0) }, nE, nH, hd: nE / nH, bs };
}

function fwd(m, tid, pid, K, V) {
  const { sd, nE, nH, hd } = m;
  const te = sd.wte[tid], pe = sd.wpe[pid % m.bs];
  let x = te.map((t, i) => t + pe[i]);
  const D = { te: [...te], pe: [...pe], x0: [...x] };
  let xr = [...x]; x = rmsnorm(x); D.xn = [...x];
  const q = matmul(x, sd.wq), k = matmul(x, sd.wk), v = matmul(x, sd.wv);
  D.q = [...q]; D.k = [...k]; D.v = [...v];
  K.push(k); V.push(v);
  const AW = []; let xA = [];
  for (let h = 0; h < nH; h++) {
    const s = h * hd, qh = q.slice(s, s + hd);
    const sc = K.map(ki => { const kh = ki.slice(s, s + hd); return qh.reduce((a, v2, j) => a + v2 * kh[j], 0) / Math.sqrt(hd); });
    const w = softmax(sc);
    AW.push({ sc: [...sc], w: [...w] });
    const o = Array(hd).fill(0);
    V.forEach((vi, t) => { const vh = vi.slice(s, s + hd); vh.forEach((v2, j) => { o[j] += w[t] * v2; }); });
    xA.push(...o);
  }
  D.AW = AW;
  x = matmul(xA, sd.wo); x = x.map((a, i) => a + xr[i]);
  xr = [...x]; x = rmsnorm(x);
  const h1 = matmul(x, sd.fc1); D.mlpH = [...h1];
  const h2 = relu2(h1); D.mlpAct = [...h2];
  const h3 = matmul(h2, sd.fc2);
  x = h3.map((a, i) => a + xr[i]);
  const logits = matmul(x, sd.wte), probs = softmax(logits);
  D.logits = [...logits]; D.probs = [...probs];
  return { logits, probs, D };
}

export { NAMES, CHARS, VOCAB, stoi, itos, BOS, EOS, createModel, fwd };
