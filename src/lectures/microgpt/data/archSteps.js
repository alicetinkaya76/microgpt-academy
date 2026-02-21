// ─── ARCHITECTURE STEPS (for interactive explorer) ──────────────────
const ARCH_STEPS = [
  { key: "embed", title: "Token Embedding", sub: { tr: "ID → Vektör", en: "ID → Vector" }, color: "#0EA5E9", icon: "T",
    desc: {tr:"Her karakter (28 token) → 16 boyutlu sürekli vektöre dönüştürülür. Embedding tablosu (28×16) eğitimle öğrenilir.", en:"Each character (28 tokens) → converted to 16-dimensional continuous vector. Embedding table (28×16) is learned through training."},
    detail: {tr:"Basit lookup: 'a'→ID 2→wte[2]. Backpropagation ile anlam kazanır. Çıktıda da aynı matris kullanılır (weight tying).", en:"Simple lookup: 'a'→ID 2→wte[2]. Gains meaning through backpropagation. Same matrix used for output (weight tying)."},
    code: `# wte: [28 x 16] öğrenilebilir matris\ntok_emb = wte[token_id]\n# 'a' (ID=2) -> [0.02, -0.01, 0.015, ...]\n# İlk başta rastgele, eğitimle anlam kazanır` },
  { key: "pos", title: "Position Embedding", sub: { tr: "Sıra Bilgisi", en: "Order Info" }, color: "#8B5CF6", icon: "P",
    desc: {tr:"Transformer sıra bilmez. Pozisyon embedding her konuma özgü 16-boyutlu vektör ekler.", en:"Transformer has no notion of order. Position embedding adds a unique 16-dim vector per position."},
    detail: {tr:"Öğrenilebilir pozisyon embedding (8×16 matris). x = tok_emb + pos_emb. 'ab' ≠ 'ba' olur.", en:"Learnable position embedding (8×16 matrix). x = tok_emb + pos_emb. Makes 'ab' ≠ 'ba'."},
    code: `pos_emb = wpe[position_id]  # [8x16]\nx = [t + p for t, p in zip(tok_emb, pos_emb)]\n# Aynı 'a' pos=0 ve pos=3'te farklı vektör` },
  { key: "norm", title: "RMSNorm", sub: { tr: "Normalizasyon", en: "Normalization" }, color: "#F59E0B", icon: "N",
    desc: {tr:"Vektör normalize edilir. LayerNorm'dan ~%30 hızlı: ortalama çıkarma yok.", en:"Vector is normalized. ~30% faster than LayerNorm: no mean subtraction."},
    detail: {tr:"RMS = sqrt(mean(x²)), scale = 1/sqrt(RMS+ε). Gradient patlamasını engeller.", en:"RMS = sqrt(mean(x²)), scale = 1/sqrt(RMS+ε). Prevents gradient explosion."},
    code: `def rmsnorm(x):\n  ms = sum(xi*xi for xi in x) / len(x)\n  scale = (ms + 1e-5) ** -0.5\n  return [xi * scale for xi in x]` },
  { key: "attn", title: "Self-Attention", sub: "Q·Kᵀ/√d → Softmax → V", color: "#10B981", icon: "A",
    desc: {tr:"Her token 'kime dikkat etmeliyim?' sorar. 4 head × 4 boyut. Causal mask gelecek tokenları gizler.", en:"Each token asks 'who should I attend to?'. 4 heads × 4 dims. Causal mask hides future tokens."},
    detail: {tr:"Query-Key uyumu → attention ağırlıkları → Value bilgiyi taşır. Her head farklı kalıp öğrenir.", en:"Query-Key compatibility → attention weights → Value carries info. Each head learns different patterns."},
    code: `q, k, v = linear(x, Wq/Wk/Wv)\nfor h in range(4):\n  scores = Q·K^T / sqrt(4)\n  weights = softmax(scores)\n  out_h = Σ w[t] × V[t]\n# Concat 4×4=16 → linear → 16` },
  { key: "mlp", title: "MLP Block", sub: "Expand → ReLU² → Compress", color: "#EC4899", icon: "M",
    desc: {tr:"16→64 genişlet, ReLU² aktive et, 64→16 daralt. ~%40 nöron 'ölü' (sparse).", en:"Expand 16→64, apply ReLU², compress 64→16. ~40% neurons are 'dead' (sparse)."},
    detail: {tr:"ReLU² = max(0,x)². Normal ReLU'dan keskin. Residual connection ile girdi eklenir.", en:"ReLU² = max(0,x)². Sharper than standard ReLU. Input added via residual connection."},
    code: `h = linear(x, fc1)        # 16 → 64\nh = [max(0,hi)**2 for hi in h]\nout = linear(h, fc2)      # 64 → 16\nx = out + x_residual` },
  { key: "output", title: "Output Head", sub: "Logits → Sampling", color: "#EF4444", icon: "O",
    desc: {tr:"Embedding matrisinin transpozu ile çarpılarak 28 logit üretilir. Temperature ölçekler, softmax olasılığa çevirir.", en:"Multiplied by embedding matrix transpose to produce 28 logits. Temperature scales, softmax converts to probabilities."},
    detail: {tr:"Weight tying: çıktı = embedding matrisi. T<1 deterministik, T>1 yaratıcı.", en:"Weight tying: output = embedding matrix. T<1 deterministic, T>1 creative."},
    code: `logits = linear(x, wte)    # [16]->[28]\nlogits = [l/T for l in logits]\nprobs = softmax(logits)\nnext = random.choices(range(28), weights=probs)` }
];

export { ARCH_STEPS };
