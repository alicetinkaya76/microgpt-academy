import React, { useState } from 'react';
import { useLang } from '../../../core/i18n';
import { VB } from '../../../components/SharedComponents';

const REAL_CODE = {
  // WEEK 0 — Giriş
  "week0_s0": {
    label: {tr:"microgpt.py • satır 1-6", en:"microgpt.py • lines 1-6"},
    lines: [1, 6],
    code: `"""
The most atomic way to train and inference
a GPT LLM in pure, dependency-free Python.
Differences from GPT-2 are minor: rmsnorm
instead of layer norm, no biases, square
ReLU instead of GeLU nonlinearity.
"""`,
    notes: [
      {tr:"Dosyanın en tepesi — projenin manifestosu", en:"Top of the file — the project's manifesto"},
      {tr:"Saf Python, bağımlılık yok (PyTorch/NumPy yok)", en:"Pure Python, no dependencies (no PyTorch/NumPy)"},
      {tr:"GPT-2'den farklar: RMSNorm, bias yok, ReLU²", en:"Differences from GPT-2: RMSNorm, no biases, ReLU²"},
    ]
  },
  "week0_s5": {
    label: {tr:"microgpt.py • satır 8-12", en:"microgpt.py • lines 8-12"},
    lines: [8, 12],
    code: `import os       # dosya kontrolü
import math     # math.log, math.exp
import random   # random.seed, random.choices
import argparse # komut satırı argümanları`,
    notes: [
      {tr:"Sadece 4 standart kütüphane — hiçbir pip install yok!", en:"Only 4 standard libraries — no pip install needed!"},
      {tr:"os: input.txt var mı diye kontrol eder", en:"os: checks if input.txt exists"},
      {tr:"math: log (loss hesabı) ve exp (softmax) için", en:"math: for log (loss computation) and exp (softmax)"},
      {tr:"random: parametre başlatma ve sampling için", en:"random: for parameter initialization and sampling"},
    ]
  },
  "week0_s7": {
    label: {tr:"microgpt.py • satır 14-27", en:"microgpt.py • lines 14-27"},
    lines: [14, 27],
    code: `# CLI arguments
parser = argparse.ArgumentParser()
parser.add_argument('--n_embd', type=int,
    default=16)
parser.add_argument('--n_layer', type=int,
    default=1)
parser.add_argument('--block_size', type=int,
    default=8)
parser.add_argument('--num_steps', type=int,
    default=1000)
parser.add_argument('--n_head', type=int,
    default=4)
parser.add_argument('--learning_rate', type=float,
    default=1e-2)
parser.add_argument('--seed', type=int,
    default=42)
args = parser.parse_args()
random.seed(args.seed)
n_embd, block_size, n_layer, n_head = \\
    args.n_embd, args.block_size, \\
    args.n_layer, args.n_head
head_dim = n_embd // n_head`,
    notes: [
      {tr:"argparse: komut satırından parametre değiştirmeye izin verir", en:"argparse: allows changing parameters from command line"},
      {tr:"Tüm varsayılanlar (16, 1, 8, 1000, 4, 0.01, 42) burada", en:"All defaults (16, 1, 8, 1000, 4, 0.01, 42) are here"},
      {tr:"head_dim = n_embd // n_head = 16 // 4 = 4", en:"head_dim = n_embd // n_head = 16 // 4 = 4"},
      {tr:"random.seed(42): tekrarlanabilirlik için sabit tohum", en:"random.seed(42): fixed seed for reproducibility"},
    ]
  },
  "week0_s8": {
    label: {tr:"microgpt.py • satır 29-36", en:"microgpt.py • lines 29-36"},
    lines: [29, 36],
    code: `# Dataset: names dataset (one name per line)
if not os.path.exists('input.txt'):
    import urllib.request
    urllib.request.urlretrieve(
      'https://raw.githubusercontent.com/'
      'karpathy/makemore/refs/heads/master/'
      'names.txt', 'input.txt')
with open('input.txt', 'r') as file:
    text = file.read()
docs = [line.strip()
    for line in text.strip().split('\\n')
    if line.strip()]
random.shuffle(docs)`,
    notes: [
      {tr:"Veri yoksa otomatik indirir (32K İngilizce isim)", en:"Auto-downloads data if not present (32K English names)"},
      {tr:"Her satır bir 'doküman' (isim)", en:"Each line is a 'document' (name)"},
      {tr:"shuffle → eğitim sırasında rastgele sıra", en:"shuffle → random order during training"},
      {tr:"Kendi input.txt dosyanızla değiştirebilirsiniz!", en:"You can replace with your own input.txt file!"},
    ]
  },
  // WEEK 1 — Tokenizer
  "week1_s2": {
    label: {tr:"microgpt.py • satır 38-44", en:"microgpt.py • lines 38-44"},
    lines: [38, 44],
    code: `# Tokenizer: character-level with BOS/EOS
chars = ['<BOS>', '<EOS>'] + \\
    sorted(list(set(''.join(docs))))
vocab_size = len(chars)
stoi = {ch:i for i,ch in enumerate(chars)}
itos = {i:ch for i,ch in enumerate(chars)}
BOS, EOS = stoi['<BOS>'], stoi['<EOS>']
print(f"vocab size: {vocab_size}")`,
    notes: [
      "chars: ['<BOS>','<EOS>','a','b',...,'z'] → 28 token",
      "stoi: string→integer sözlüğü (örn: 'a'→2)",
      "itos: integer→string sözlüğü (örn: 2→'a')",
      "BOS=0, EOS=1: özel başlangıç/bitiş tokenları",
    ]
  },
  // WEEK 1 — Embedding & Model Init
  "week1_s4": {
    label: {tr:"microgpt.py • satır 107-119", en:"microgpt.py • lines 107-119"},
    lines: [107, 119],
    code: `# Model parameter initialization
matrix = lambda nout, nin, std=0.02: \\
  [[Value(random.gauss(0, std))
    for _ in range(nin)]
   for _ in range(nout)]

state_dict = {
  'wte': matrix(vocab_size, n_embd),  # [28×16]
  'wpe': matrix(block_size, n_embd),  # [8×16]
}
for i in range(n_layer):
  state_dict[f'layer{i}.attn_wq'] = \\
      matrix(n_embd, n_embd)           # [16×16]
  state_dict[f'layer{i}.attn_wk'] = \\
      matrix(n_embd, n_embd)
  state_dict[f'layer{i}.attn_wv'] = \\
      matrix(n_embd, n_embd)
  state_dict[f'layer{i}.attn_wo'] = \\
      matrix(n_embd, n_embd, std=0)    # sıfır init!
  state_dict[f'layer{i}.mlp_fc1'] = \\
      matrix(4*n_embd, n_embd)         # [64×16]
  state_dict[f'layer{i}.mlp_fc2'] = \\
      matrix(n_embd, 4*n_embd, std=0)  # [16×64]

params = [p for mat in state_dict.values()
          for row in mat for p in row]`,
    notes: [
      {tr:"matrix(): her eleman bir Value nesnesi → autograd'a bağlı", en:"matrix(): each element is a Value object → connected to autograd"},
      "wte: token embedding [28×16] — her token 16-dim vektör",
      "wpe: pozisyon embedding [8×16] — her pozisyon 16-dim",
      "attn_wo ve mlp_fc2 sıfır std ile başlar (residual kararlılığı)",
      "params: tüm öğrenilebilir parametrelerin düz listesi → optimizer için",
    ]
  },
  // WEEK 1 — Softmax
  "week1_s8": {
    label: {tr:"microgpt.py • satır 124-128", en:"microgpt.py • lines 124-128"},
    lines: [124, 128],
    code: `def softmax(logits):
    max_val = max(v.data for v in logits)
    exps = [(v - max_val).exp()
            for v in logits]
    total = sum(exps)
    return [e / total for e in exps]`,
    notes: [
      {tr:"max_val çıkarma: sayısal kararlılık (exp overflow önleme)", en:"max_val subtraction: numerical stability (prevent exp overflow)"},
      {tr:"Her logit → exp(logit - max) → normalize", en:"Each logit → exp(logit - max) → normalize"},
      {tr:"Çıktı: toplamı 1 olan olasılık dağılımı", en:"Output: probability distribution summing to 1"},
      {tr:"Value nesneleri üzerinde → autograd backward çalışır", en:"Operates on Value objects → autograd backward works"},
    ]
  },
  // WEEK 2 — Autograd Value class
  "week2_s3": {
    label: {tr:"microgpt.py • satır 47-63", en:"microgpt.py • lines 47-63"},
    lines: [47, 63],
    code: `class Value:
  """stores a single scalar value
     and its gradient"""

  def __init__(self, data,
               _children=(), _op=''):
    self.data = data
    self.grad = 0
    self._backward = lambda: None
    self._prev = set(_children)
    self._op = _op

  def __add__(self, other):
    other = other if isinstance(other, Value)\\
            else Value(other)
    out = Value(self.data + other.data,
                (self, other), '+')
    def _backward():
      self.grad += out.grad   # ∂L/∂a += ∂L/∂out
      other.grad += out.grad  # ∂L/∂b += ∂L/∂out
    out._backward = _backward
    return out`,
    notes: [
      {tr:"data: sayısal değer, grad: gradient (başlangıçta 0)", en:"data: numeric value, grad: gradient (initially 0)"},
      {tr:"_backward: chain rule fonksiyonu (her operasyon kendini tanımlar)", en:"_backward: chain rule function (each operation defines itself)"},
      {tr:"_prev: bu düğümü oluşturan çocuk düğümler (graf bağlantısı)", en:"_prev: child nodes that created this node (graph connection)"},
      {tr:"grad += : kritik! = değil += çünkü birden fazla yol olabilir", en:"grad += : critical! += not = because multiple paths may exist"},
      {tr:"__add__: a + b → ∂L/∂a = ∂L/∂out, ∂L/∂b = ∂L/∂out", en:"__add__: a + b → ∂L/∂a = ∂L/∂out, ∂L/∂b = ∂L/∂out"},
    ]
  },
  "week2_s4": {
    label: {tr:"microgpt.py • satır 65-90", en:"microgpt.py • lines 65-90"},
    lines: [65, 90],
    code: `  def __mul__(self, other):
    other = other if isinstance(other, Value)\\
            else Value(other)
    out = Value(self.data * other.data,
                (self, other), '*')
    def _backward():
      self.grad += other.data * out.grad
      other.grad += self.data * out.grad
    out._backward = _backward
    return out

  def __pow__(self, other):
    out = Value(self.data**other, (self,),
                f'**{other}')
    def _backward():
      self.grad += (other * self.data**(other-1))\\
                   * out.grad
    out._backward = _backward
    return out

  def log(self):
    out = Value(math.log(self.data),
                (self,), 'log')
    def _backward():
      self.grad += (1/self.data) * out.grad
    out._backward = _backward
    return out

  def exp(self):
    out = Value(math.exp(self.data),
                (self,), 'exp')
    def _backward():
      self.grad += out.data * out.grad
    out._backward = _backward
    return out

  def relu(self):
    out = Value(0 if self.data < 0
                else self.data, (self,), 'ReLU')
    def _backward():
      self.grad += (out.data > 0) * out.grad
    out._backward = _backward
    return out`,
    notes: [
      {tr:"mul: ∂(a×b)/∂a = b, ∂(a×b)/∂b = a → çapraz kuralı", en:"mul: ∂(a×b)/∂a = b, ∂(a×b)/∂b = a → cross rule"},
      {tr:"pow: ∂(x^n)/∂x = n·x^(n-1) → power rule", en:"pow: ∂(x^n)/∂x = n·x^(n-1) → power rule"},
      {tr:"log: ∂log(x)/∂x = 1/x → cross-entropy loss'ta kullanılır", en:"log: ∂log(x)/∂x = 1/x → used in cross-entropy loss"},
      {tr:"exp: ∂exp(x)/∂x = exp(x) → softmax'ta kullanılır", en:"exp: ∂exp(x)/∂x = exp(x) → used in softmax"},
      {tr:"relu: x>0 → gradient geçer, x<0 → gradient 0 (kapı gibi)", en:"relu: x>0 → gradient passes, x<0 → gradient 0 (like a gate)"},
    ]
  },
  // WEEK 2 — Backward
  "week2_s6": {
    label: {tr:"microgpt.py • satır 92-103", en:"microgpt.py • lines 92-103"},
    lines: [92, 103],
    code: `  def backward(self):
    # topological order all children in graph
    topo = []
    visited = set()
    def build_topo(v):
      if v not in visited:
        visited.add(v)
        for child in v._prev:
          build_topo(child)
        topo.append(v)
    build_topo(self)
    # apply chain rule to get gradients
    self.grad = 1
    for v in reversed(topo):
      v._backward()`,
    notes: [
      {tr:"build_topo: DFS ile hesaplama grafını topolojik sıraya dizer", en:"build_topo: DFS to topologically sort the computation graph"},
      {tr:"self.grad = 1: loss'un kendine göre gradientı = 1 (başlangıç)", en:"self.grad = 1: gradient of loss w.r.t. itself = 1 (starting point)"},
      {tr:"reversed(topo): çıktıdan girişe doğru geri yayılım", en:"reversed(topo): backpropagation from output to input"},
      {tr:"v._backward(): her düğüm kendi chain rule'ını uygular", en:"v._backward(): each node applies its own chain rule"},
    ]
  },
  // WEEK 3 — Attention in gpt()
  "week3_s2": {
    label: {tr:"microgpt.py • satır 136-157", en:"microgpt.py • lines 136-157"},
    lines: [136, 157],
    code: `def gpt(token_id, pos_id, keys, values):
  tok_emb = state_dict['wte'][token_id]
  pos_emb = state_dict['wpe'][pos_id % block_size]
  x = [t + p for t, p in zip(tok_emb, pos_emb)]

  for li in range(n_layer):
    # 1) Multi-head attention block
    x_residual = x
    x = rmsnorm(x)
    q = linear(x, state_dict[f'layer{li}.attn_wq'])
    k = linear(x, state_dict[f'layer{li}.attn_wk'])
    val = linear(x, state_dict[f'layer{li}.attn_wv'])
    keys[li].append(k)
    values[li].append(val)
    x_attn = []
    for h in range(n_head):
      hs = h * head_dim
      q_h = q[hs:hs+head_dim]
      k_h = [ki[hs:hs+head_dim]
             for ki in keys[li]]
      v_h = [vi[hs:hs+head_dim]
             for vi in values[li]]`,
    notes: [
      {tr:"gpt(): TEK bir token adımı işler (autoregressive)", en:"gpt(): processes a SINGLE token step (autoregressive)"},
      {tr:"tok_emb + pos_emb: token ve pozisyon bilgisi birleşir", en:"tok_emb + pos_emb: token and position info combined"},
      {tr:"rmsnorm → Q,K,V projeksiyonu → KV cache'e ekle", en:"rmsnorm → Q,K,V projection → add to KV cache"},
      "Her head kendi dilimini alır: q[hs:hs+head_dim]",
      "keys/values liste olarak birikir → KV Cache!",
    ]
  },
  "week3_s4": {
    label: {tr:"microgpt.py • satır 158-167", en:"microgpt.py • lines 158-167"},
    lines: [158, 167],
    code: `      attn_logits = [
        sum(q_h[j] * k_h[t][j]
            for j in range(head_dim))
        / head_dim**0.5
        for t in range(len(k_h))
      ]
      attn_weights = softmax(attn_logits)
      head_out = [
        sum(attn_weights[t] * v_h[t][j]
            for t in range(len(v_h)))
        for j in range(head_dim)
      ]
      x_attn.extend(head_out)`,
    notes: [
      {tr:"Q·K dot product: her geçmiş tokena uyum skoru", en:"Q·K dot product: compatibility score with each past token"},
      {tr:"/ head_dim**0.5: scaling trick (√4 = 2)", en:"/ head_dim**0.5: scaling trick (√4 = 2)"},
      {tr:"softmax: skorları olasılıklara çevirir", en:"softmax: converts scores to probabilities"},
      {tr:"V'nin ağırlıklı toplamı: dikkat edilen bilgi", en:"Weighted sum of V: attended information"},
      {tr:"extend: tüm head'lerin çıktıları birleştirilir", en:"extend: outputs from all heads are concatenated"},
    ]
  },
  // WEEK 4 — MLP block & residual
  "week4_s2": {
    label: {tr:"microgpt.py • satır 130-134", en:"microgpt.py • lines 130-134"},
    lines: [130, 134],
    code: `def rmsnorm(x):
    ms = sum(xi * xi for xi in x) / len(x)
    scale = (ms + 1e-5) ** -0.5
    return [xi * scale for xi in x]`,
    notes: [
      {tr:"ms = ortalama kare (mean square) → vektörün 'enerjisi'", en:"ms = mean square → the 'energy' of the vector"},
      {tr:"1e-5: sıfıra bölünmeyi önleyen küçük sayı (epsilon)", en:"1e-5: small number to prevent division by zero (epsilon)"},
      {tr:"scale = 1/√ms: her elemanı bu ile çarp → norm ≈ 1", en:"scale = 1/√ms: multiply each element by this → norm ≈ 1"},
      {tr:"LayerNorm'dan fark: mean çıkarma yok → daha hızlı", en:"Difference from LayerNorm: no mean subtraction → faster"},
    ]
  },
  "week4_s3": {
    label: {tr:"microgpt.py • satır 170-177", en:"microgpt.py • lines 170-177"},
    lines: [170, 177],
    code: `    # 2) MLP block
    x_residual = x
    x = rmsnorm(x)
    x = linear(x, state_dict[f'layer{li}.mlp_fc1'])
    x = [xi.relu() ** 2 for xi in x]  # ReLU²
    x = linear(x, state_dict[f'layer{li}.mlp_fc2'])
    x = [a + b for a, b in zip(x, x_residual)]`,
    notes: [
      {tr:"x_residual = x: skip connection için girdiyi sakla", en:"x_residual = x: save input for skip connection"},
      {tr:"rmsnorm → linear (16→64) → ReLU² → linear (64→16)", en:"rmsnorm → linear (16→64) → ReLU² → linear (64→16)"},
      {tr:"relu()**2: negatifler 0, pozitifler karesel büyür (sparse!)", en:"relu()**2: negatives become 0, positives grow quadratically (sparse!)"},
      {tr:"x + x_residual: residual connection — gradient highway", en:"x + x_residual: residual connection — gradient highway"},
    ]
  },
  "week4_s5": {
    label: {tr:"microgpt.py • satır 168-169, 179-180", en:"microgpt.py • lines 168-169, 179-180"},
    lines: [168, 180],
    code: `    x = linear(x_attn,
      state_dict[f'layer{li}.attn_wo'])
    x = [a+b for a,b in zip(x, x_residual)]
    # ... (MLP block) ...
    x = [a+b for a,b in zip(x, x_residual)]

  # project to vocab (weight tying with wte)
  logits = linear(x, state_dict['wte'])
  return logits`,
    notes: [
      {tr:"İki residual: biri attention sonrası, biri MLP sonrası", en:"Two residuals: one after attention, one after MLP"},
      {tr:"weight tying: wte hem girişte hem çıkışta kullanılır", en:"weight tying: wte used for both input and output"},
      "logits = son vektörün vocab boyutuna projeksiyonu [28]",
    ]
  },
  // WEEK 4 — Linear function
  "week4_s0": {
    label: {tr:"microgpt.py • satır 122-123", en:"microgpt.py • lines 122-123"},
    lines: [122, 123],
    code: `def linear(x, w):
    return [sum(w[o][i] * x[i]
            for i in range(len(x)))
            for o in range(len(w))]`,
    notes: [
      {tr:"Matris-vektör çarpımı: y = W·x", en:"Matrix-vector multiplication: y = W·x"},
      {tr:"Her çıktı elemanı = ağırlık satırı · giriş vektörü (dot product)", en:"Each output element = weight row · input vector (dot product)"},
      {tr:"Attention, MLP, projeksiyon — HER YERDE kullanılır", en:"Used EVERYWHERE: attention, MLP, projection"},
    ]
  },
  // WEEK 5 — Training loop
  "week5_s2": {
    label: {tr:"microgpt.py • satır 188-205", en:"microgpt.py • lines 188-205"},
    lines: [188, 205],
    code: `for step in range(args.num_steps):

  # Tokenize a document, crop to block_size
  doc = docs[step % len(docs)]
  tokens = [BOS] + [stoi[ch] for ch in doc] \\
           + [EOS]
  tokens = tokens[:block_size]

  # Forward pass over time dimension
  keys, values = [[] for _ in range(n_layer)],\\
                 [[] for _ in range(n_layer)]
  lossf = 0.0
  for pos_id in range(len(tokens) - 1):
    logits = gpt(tokens[pos_id], pos_id,
                 keys, values)
    probs = softmax(logits)
    loss = -probs[tokens[pos_id + 1]].log()
    loss = (1/(len(tokens)-1)) * loss
    loss.backward()
    lossf += loss.data`,
    notes: [
      {tr:"Her adımda TEK doküman (isim) işlenir → SGD", en:"Each step processes ONE document (name) → SGD"},
      "tokens: [BOS, 'e', 'm', 'm', 'a', EOS] → [:8] kırp",
      "Her pozisyonda: gpt() → softmax → loss → backward",
      "-log(P(doğru)): cross-entropy loss → ne kadar yanlış?",
      "backward(): hesaplama grafından tüm gradientler hesaplanır",
    ]
  },
  // WEEK 5 — Adam optimizer
  "week5_s5": {
    label: {tr:"microgpt.py • satır 183-186, 207-216", en:"microgpt.py • lines 183-186, 207-216"},
    lines: [183, 216],
    code: `# Adam optimizer setup
learning_rate = args.learning_rate  # 0.01
beta1, beta2, eps_adam = 0.9, 0.95, 1e-8
m = [0.0] * len(params) # first moment
v = [0.0] * len(params) # second moment

  # Adam update (in training loop)
  lr_t = learning_rate * (1 - step/args.num_steps)
  for i, p in enumerate(params):
    m[i] = beta1*m[i] + (1-beta1)*p.grad
    v[i] = beta2*v[i] + (1-beta2)*p.grad**2
    m_hat = m[i] / (1 - beta1**(step+1))
    v_hat = v[i] / (1 - beta2**(step+1))
    p.data -= lr_t * m_hat / (v_hat**0.5 + eps_adam)
    p.grad = 0  # KRİTİK: gradient sıfırla`,
    notes: [
      {tr:"m: momentum (gradient yönü ortalaması) → düzgün ilerleme", en:"m: momentum (gradient direction average) → smooth progress"},
      {tr:"v: variance (gradient büyüklüğü ortalaması) → adaptif LR", en:"v: variance (gradient magnitude average) → adaptive LR"},
      {tr:"bias correction: erken adımlarda m ve v küçük → düzelt", en:"bias correction: early steps have small m and v → correct"},
      {tr:"lr_t: linear decay — eğitim ilerledikçe LR azalır", en:"lr_t: linear decay — LR decreases as training progresses"},
      {tr:"p.grad = 0: HER adımda sıfırla yoksa gradientler birikir!", en:"p.grad = 0: reset EVERY step or gradients accumulate!"},
    ]
  },
  // WEEK 6 — Inference
  "week6_s1": {
    label: {tr:"microgpt.py • satır 219-232", en:"microgpt.py • lines 219-232"},
    lines: [219, 232],
    code: `# Inference: generate 5 samples
print("\\n--- generation ---")
for sample_idx in range(5):
  keys, values = [[] for _ in range(n_layer)],\\
                 [[] for _ in range(n_layer)]
  token_id = BOS
  generated = []
  for pos_id in range(block_size):
    logits = gpt(token_id, pos_id,
                 keys, values)
    probs = softmax(logits)
    token_id = random.choices(
      range(vocab_size),
      weights=[p.data for p in probs])[0]
    if token_id == EOS:
      break
    generated.append(itos[token_id])
  print(f"sample {sample_idx}: "
        f"{''.join(generated)}")`,
    notes: [
      {tr:"Eğitimden farklı: backward() YOK — sadece forward", en:"Different from training: NO backward() — forward only"},
      {tr:"BOS ile başla → her adımda bir token üret → EOS'ta dur", en:"Start with BOS → generate one token per step → stop at EOS"},
      {tr:"random.choices: olasılıklara göre rastgele seçim (sampling)", en:"random.choices: random selection by probabilities (sampling)"},
      {tr:"KV cache: keys/values birikir → önceki tokenlar tekrar hesaplanmaz", en:"KV cache: keys/values accumulate → previous tokens not recomputed"},
      {tr:"p.data: Value nesnesinin ham sayısını al (grad gerekmez)", en:"p.data: get raw number from Value object (no grad needed)"},
    ]
  },
  // WEEK 6 — Temperature (conceptual — real code doesn't have T)
  "week6_s2": {
    label: {tr:"microgpt.py'ye temperature ekleme", en:"Adding temperature to microgpt.py"},
    lines: [0, 0],
    code: `# Orijinal kodda temperature YOK —
# Eklemek basit:
probs = softmax(logits)  # orijinal

# Temperature eklenmiş hali:
scaled = [l / temperature for l in logits]
probs = softmax(scaled)

# T=0.5 → sivri (deterministik)
# T=1.0 → normal (dengeli)
# T=2.0 → düz (yaratıcı/rastgele)`,
    notes: [
      {tr:"Orijinal microgpt.py'de temperature parametresi yok", en:"Original microgpt.py has no temperature parameter"},
      {tr:"Logit'leri T'ye bölmek softmax dağılımını kontrol eder", en:"Dividing logits by T controls softmax distribution"},
      {tr:"Bu ders aracında (Lab) temperature ayarlayabilirsiniz", en:"You can adjust temperature in this course's Lab tool"},
    ]
  }
};

// ─── FULL CODE MAP — tüm microgpt.py renk kodlu ─────────────────
const getCodeMapSections = (lang) => [
  { name: lang==="tr"?"Açıklama & İmportlar":"Description & Imports", lines: [1, 12], color: "#64748B", week: 0 },
  { name: lang==="tr"?"Hiperparametreler (CLI)":"Hyperparameters (CLI)", lines: [13, 27], color: "#0EA5E9", week: 0 },
  { name: lang==="tr"?"Dataset Yükleme":"Dataset Loading", lines: [29, 36], color: "#0EA5E9", week: 0 },
  { name: "Tokenizer", lines: [38, 44], color: "#8B5CF6", week: 1 },
  { name: lang==="tr"?"Value Sınıfı (Autograd)":"Value Class (Autograd)", lines: [47, 105], color: "#F59E0B", week: 2 },
  { name: lang==="tr"?"Parametre Başlatma":"Parameter Init", lines: [107, 119], color: "#8B5CF6", week: 1 },
  { name: "linear() & softmax()", lines: [122, 128], color: "#10B981", week: 3 },
  { name: "rmsnorm()", lines: [130, 134], color: "#EC4899", week: 4 },
  { name: "gpt() — Attention", lines: [136, 167], color: "#10B981", week: 3 },
  { name: "gpt() — MLP & Residual", lines: [168, 180], color: "#EC4899", week: 4 },
  { name: "Adam Optimizer Setup", lines: [183, 186], color: "#EF4444", week: 5 },
  { name: lang==="tr"?"Eğitim Döngüsü":"Training Loop", lines: [188, 216], color: "#EF4444", week: 5 },
  { name: "Inference & Sampling", lines: [219, 232], color: "#6366F1", week: 6 },

  // W8: Advanced Techniques
  { week: 8, id: "bpe_entropy", title: { tr: "BPE Entropi Hesaplama", en: "BPE Entropy Calculation" },
    code: `# BPE merge'ün entropi etkisi:\nimport math\nfrom collections import Counter\n\ndef corpus_entropy(tokens):\n    freq = Counter(tokens)\n    total = sum(freq.values())\n    return -sum((c/total) * math.log2(c/total) for c in freq.values())\n\n# Merge öncesi\ntokens = list("the cat sat on the mat")\nH_before = corpus_entropy(tokens)\nprint(f"Merge öncesi: {len(set(tokens))} unique, H={H_before:.3f} bits")\n\n# 'th' merge sonrası\nmerged = []\nfor i in range(len(tokens)):\n    if i < len(tokens)-1 and tokens[i]=='t' and tokens[i+1]=='h':\n        merged.append('th'); i += 1\n    else: merged.append(tokens[i])\nH_after = corpus_entropy(merged)\nprint(f"Merge sonrası: {len(set(merged))} unique, H={H_after:.3f} bits")\nprint(f"ΔH = {H_after - H_before:.4f} bits")`,
    language: "python" },
  { week: 8, id: "safe_softmax", title: { tr: "Numerik Stabil Softmax", en: "Numerically Stable Softmax" },
    code: `# microGPT satır 142 — Float16-safe softmax\nimport math\n\ndef naive_softmax(x):\n    """⚠️ OVERFLOW RİSKİ!"""\n    exps = [math.exp(xi) for xi in x]  # exp(100) = inf!\n    s = sum(exps)\n    return [e/s for e in exps]\n\ndef safe_softmax(x):\n    """✓ microGPT'nin kullandığı yöntem"""\n    max_x = max(x)\n    exps = [math.exp(xi - max_x) for xi in x]  # max exp = 1.0\n    s = sum(exps)\n    return [e/s for e in exps]\n\n# Test:\nlogits = [100.0, 99.0, 98.0]\ntry:\n    print("Naive:", naive_softmax(logits))\nexcept OverflowError:\n    print("Naive: OverflowError!")\nprint("Safe: ", safe_softmax(logits))\n# İkisi de aynı sonucu verir — ama safe version patlamaz!`,
    language: "python" },
  // W9: Research Frontiers
  { week: 9, id: "rope_impl", title: { tr: "RoPE İmplementasyonu", en: "RoPE Implementation" },
    code: `# RoPE: Rotary Position Embedding\nimport math\n\ndef apply_rope(x, pos, d_model):\n    """2D rotasyon ile pozisyon kodlama"""\n    result = list(x)  # kopyala\n    for i in range(0, d_model, 2):\n        freq = 1.0 / (10000 ** (i / d_model))\n        angle = pos * freq\n        cos_a = math.cos(angle)\n        sin_a = math.sin(angle)\n        # 2D rotasyon: [cos -sin; sin cos]\n        x_even = x[i]\n        x_odd = x[i+1] if i+1 < len(x) else 0\n        result[i] = x_even * cos_a - x_odd * sin_a\n        if i+1 < len(x):\n            result[i+1] = x_even * sin_a + x_odd * cos_a\n    return result\n\n# Test: aynı vektör, farklı pozisyonlar\nv = [1.0, 0.0, 0.5, 0.5]\nfor p in [0, 1, 5, 10]:\n    rotated = apply_rope(v, p, len(v))\n    print(f"pos={p:2d}: {[f'{x:.3f}' for x in rotated]}")`,
    language: "python" },
  { week: 9, id: "distillation", title: { tr: "Knowledge Distillation Loss", en: "Knowledge Distillation Loss" },
    code: `# Knowledge Distillation — Teacher → Student\nimport math\n\ndef softmax_t(logits, T=1.0):\n    """Temperature-scaled softmax"""\n    scaled = [l/T for l in logits]\n    mx = max(scaled)\n    exps = [math.exp(x - mx) for x in scaled]\n    s = sum(exps)\n    return [e/s for e in exps]\n\ndef kl_div(p, q):\n    """KL divergence: KL(p || q)"""\n    return sum(pi * math.log(pi / qi) for pi, qi in zip(p, q) if pi > 0)\n\n# Teacher çıktısı (büyük model)\nteacher_logits = [3.5, 1.2, 0.8, 0.3, -0.5]\n# Student çıktısı (küçük model)\nstudent_logits = [2.0, 1.5, 0.5, 0.2, -0.3]\n\nfor T in [1.0, 2.0, 5.0, 10.0]:\n    p_t = softmax_t(teacher_logits, T)\n    p_s = softmax_t(student_logits, T)\n    loss = kl_div(p_t, p_s) * T * T\n    print(f"T={T:4.1f}: KL={loss:.4f}  teacher_probs={[f'{p:.2f}' for p in p_t]}")`,
    language: "python" },
];

const RealCodeBlock = ({ data, weekColor }) => {
  const lang = useLang();
  const [expanded, setExpanded] = useState(false);
  if (!data) return null;
  return (
    <div style={{ margin: "14px 0", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.03)" }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px",
        background: "rgba(245,158,11,0.06)", border: "none", cursor: "pointer", fontFamily: "inherit"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 17 }}>📄</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B", fontFamily: "'Fira Code', monospace" }}>{typeof data.label === 'object' ? (lang === 'tr' ? data.label.tr : data.label.en) : data.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#64748B", padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)" }}>{lang==="tr"?"Gerçek Kod":"Real Code"}</span>
          <span style={{ fontSize: 15, color: "#94A3B8", transition: "transform .2s", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
        </div>
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 14px" }}>
          <pre style={{ margin: "8px 0", padding: 14, borderRadius: 10, background: "#0D1117", border: "1px solid rgba(255,255,255,0.06)", overflowX: "auto", fontFamily: "'Fira Code', monospace", fontSize: 14, lineHeight: 1.6, color: "#E6EDF3", whiteSpace: "pre-wrap" }}>{data.code}</pre>
          {data.notes && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
              {data.notes.map((note, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "#94A3B8", lineHeight: 1.4 }}>
                  <span style={{ color: "#F59E0B", fontSize: 13, marginTop: 2, flexShrink: 0 }}>▸</span>
                  {typeof note === 'object' ? (lang === 'tr' ? note.tr : note.en) : note}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CodeMapPanel = ({ onClose }) => { const lang = useLang(); const CODE_MAP_SECTIONS = getCodeMapSections(lang); return (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 700, maxHeight: "90vh", background: "#0D1117", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#E2E8F0" }}>🗺️ Kod Haritası — microgpt.py</div>
          <div style={{ fontSize: 14, color: "#64748B" }}>243 satır, haftalara göre renk kodlu</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.06)", color: "#94A3B8", fontSize: 19, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {CODE_MAP_SECTIONS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
              <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>H{s.week}</span>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>{s.name}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {CODE_MAP_SECTIONS.map((s, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${s.color}20` }}>
              <div style={{ padding: "6px 12px", background: `${s.color}10`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.name}</span>
                <span style={{ fontSize: 12, color: "#64748B", fontFamily: "'Fira Code', monospace" }}>satır {s.lines[0]}-{s.lines[1]} • Hafta {s.week}</span>
              </div>
              <div style={{ height: Math.max(4, (s.lines[1] - s.lines[0] + 1) * 0.8), background: `${s.color}08`, borderTop: `1px solid ${s.color}10` }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 6 }}>📊 Satır Dağılımı</div>
          <div style={{ display: "flex", height: 20, borderRadius: 6, overflow: "hidden", gap: 1 }}>
            {CODE_MAP_SECTIONS.map((s, i) => (
              <div key={i} style={{ flex: s.lines[1] - s.lines[0] + 1, background: s.color, minWidth: 2 }} title={`${s.name}: ${s.lines[1] - s.lines[0] + 1} satır`} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 12, color: "#64748B" }}>satır 1</span>
            <span style={{ fontSize: 12, color: "#64748B" }}>satır 243</span>
          </div>
        </div>
      </div>
    </div>
  </div>
); };

// ─── INSTRUCTOR NOTES — Hoca Modu Verileri ──────────────────────
// ─── SLIDE REFERENCES — Slayt↔Explorer Köprü Haritası ──────────

export { REAL_CODE, getCodeMapSections, RealCodeBlock, CodeMapPanel };
