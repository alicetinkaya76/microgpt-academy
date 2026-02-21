// ─── Math Utilities ─────────────────────────────────────────────
function gauss(s = 0.02) { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function softmax(x) { const m = Math.max(...x); const e = x.map(v => Math.exp(v - m)); const s = e.reduce((a, b) => a + b); return e.map(v => v / s); }
function softmaxArr(x) { const m = Math.max(...x); const e = x.map(v => Math.exp(v - m)); const s = e.reduce((a, b) => a + b); return e.map(v => v / s); }
function rmsnorm(x) { const ms = x.reduce((a, v) => a + v * v, 0) / x.length; return x.map(v => v / Math.sqrt(ms + 1e-5)); }
function matmul(x, w) { return w.map(r => r.reduce((s, v, i) => s + v * x[i], 0)); }
function relu2(x) { return x.map(v => v > 0 ? v * v : 0); }
function smpl(p) { const r = Math.random(); let c = 0; for (let i = 0; i < p.length; i++) { c += p[i]; if (r < c) return i; } return p.length - 1; }

export { gauss, softmax, softmaxArr, rmsnorm, matmul, relu2, smpl };
