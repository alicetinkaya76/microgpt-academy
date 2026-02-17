import React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";


// ─── i18n SYSTEM ────────────────────────────────────────────────────
const LangContext = React.createContext('tr');
const useLang = () => React.useContext(LangContext);

// Helper: if value is {tr,en} object, pick by lang. Otherwise return as-is.
const tx = (val, lang) => {
  if (val && typeof val === 'object' && !React.isValidElement(val) && !Array.isArray(val) && (val.tr || val.en)) {
    return val[lang] || val.tr || val.en || '';
  }
  return val;
};

// UI string translations
const UI = {
  // Navigation
  weekLabel: { tr: "Hafta", en: "Week" },
  nextSection: { tr: "Sonraki →", en: "Next →" },
  prevSection: { tr: "← Önceki", en: "← Previous" },
  sections: { tr: "Bölümler", en: "Sections" },
  completed: { tr: "tamamlandı", en: "completed" },
  
  // Tabs
  tabLecture: { tr: "📖 Ders", en: "📖 Lecture" },
  tabExplore: { tr: "🔬 Keşfet", en: "🔬 Explore" },
  tabGenerate: { tr: "✨ Üret", en: "✨ Generate" },
  tabTrain: { tr: "🔄 Eğit", en: "🔄 Train" },
  tabArch: { tr: "🏗️ Mimari", en: "🏗️ Architecture" },
  
  // Generation tab
  generateName: { tr: "İsim Üret", en: "Generate Name" },
  autoGenerate: { tr: "Otomatik Üret", en: "Auto Generate" },
  stopGen: { tr: "Durdur", en: "Stop" },
  reset: { tr: "Sıfırla", en: "Reset" },
  temperature: { tr: "Sıcaklık", en: "Temperature" },
  step: { tr: "Adım", en: "Step" },
  token: { tr: "Token", en: "Token" },
  probability: { tr: "Olasılık", en: "Probability" },
  generated: { tr: "Üretilen", en: "Generated" },
  history: { tr: "Geçmiş", en: "History" },
  
  // Training tab
  startTraining: { tr: "Eğitimi Başlat", en: "Start Training" },
  stopTraining: { tr: "Durdur", en: "Stop" },
  trainingStep: { tr: "Eğitim Adımı", en: "Training Step" },
  loss: { tr: "Kayıp", en: "Loss" },
  samples: { tr: "Örnekler", en: "Samples" },
  speed: { tr: "Hız", en: "Speed" },
  
  // Architecture tab
  archTitle: { tr: "Transformer Mimarisi", en: "Transformer Architecture" },
  parameters: { tr: "Parametreler", en: "Parameters" },
  totalParams: { tr: "TOPLAM PARAMETRE", en: "TOTAL PARAMETERS" },
  
  // Explore tab
  details: { tr: "Detaylar", en: "Details" },
  probDist: { tr: "Olasılık Dağılımı", en: "Probability Distribution" },
  attentionWeights: { tr: "Dikkat Ağırlıkları", en: "Attention Weights" },
  embeddings: { tr: "Gömme Vektörleri", en: "Embeddings" },
  head: { tr: "Kafa", en: "Head" },
  
  // Instructor mode
  instructorMode: { tr: "👨‍🏫 Hoca Modu", en: "👨‍🏫 Instructor Mode" },
  lessonPlan: { tr: "📋 Ders Planı", en: "📋 Lesson Plan" },
  cheatSheet: { tr: "📝 Kopya Kağıdı", en: "📝 Cheat Sheet" },
  
  // Tools
  glossary: { tr: "📚 Sözlük", en: "📚 Glossary" },
  quiz: { tr: "🧪 Quiz", en: "🧪 Quiz" },
  codeMap: { tr: "💻 Kod Haritası", en: "💻 Code Map" },
  resources: { tr: "📎 Kaynaklar", en: "📎 Resources" },
  
  // Common
  clickToExplore: { tr: "Tıklayarak keşfedin", en: "Click to explore" },
  showMore: { tr: "Daha fazla göster", en: "Show more" },
  close: { tr: "Kapat", en: "Close" },
  search: { tr: "Ara...", en: "Search..." },
  code: { tr: "Kod", en: "Code" },
  example: { tr: "Örnek", en: "Example" },
  input: { tr: "Girdi", en: "Input" },
  output: { tr: "Çıktı", en: "Output" },
  
  // Viz
  vizBoxStages: { tr: "Aşamalı Pipeline", en: "Stage Pipeline" },
  forward: { tr: "İleri", en: "Forward" },
  backward: { tr: "Geri", en: "Backward" },
  
  // Language toggle
  langTR: { tr: "🇹🇷 Türkçe", en: "🇹🇷 Türkçe" },
  langEN: { tr: "🇬🇧 English", en: "🇬🇧 English" },
};

const u = (key, lang) => UI[key]?.[lang] || UI[key]?.tr || key;


// ─── DATA & CONSTANTS ───────────────────────────────────────────────
const NAMES = ["emma","olivia","sophia","mia","charlotte","amelia","harper","evelyn","abigail","emily","ella","madison","scarlett","aria","grace","chloe","penelope","riley","layla","nora","zoey","mila","aubrey","hannah","lily","addison","luna","brooklyn","leah","stella","hazel","violet","aurora","lucy","anna","samantha","caroline","maya","sarah","eva","emilia","autumn","quinn","ruby","willow","cora","lydia","clara","vivian","nova","liam","noah","oliver","elijah","james","william","benjamin","lucas","henry","alexander","mason","michael","ethan","daniel","jacob","logan","jackson","levi","sebastian","jack","owen","theodore","aiden","samuel","joseph","john","david","wyatt","matthew","luke","asher","carter","julian","leo","jayden","gabriel","isaac","lincoln","anthony","hudson","dylan","ezra","thomas","caleb"];
const CHARS = ["<BOS>","<EOS>",..."abcdefghijklmnopqrstuvwxyz".split("")];
const VOCAB = CHARS.length;
const stoi = Object.fromEntries(CHARS.map((c, i) => [c, i]));
const itos = Object.fromEntries(CHARS.map((c, i) => [i, c]));
const BOS = 0, EOS = 1;

// ─── MATH UTILS ─────────────────────────────────────────────────────
function gauss(s = 0.02) { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function softmax(x) { const m = Math.max(...x); const e = x.map(v => Math.exp(v - m)); const s = e.reduce((a, b) => a + b); return e.map(v => v / s); }
function softmaxArr(x) { const m = Math.max(...x); const e = x.map(v => Math.exp(v - m)); const s = e.reduce((a, b) => a + b); return e.map(v => v / s); }
function rmsnorm(x) { const ms = x.reduce((a, v) => a + v * v, 0) / x.length; return x.map(v => v / Math.sqrt(ms + 1e-5)); }
function matmul(x, w) { return w.map(r => r.reduce((s, v, i) => s + v * x[i], 0)); }
function relu2(x) { return x.map(v => v > 0 ? v * v : 0); }
function smpl(p) { const r = Math.random(); let c = 0; for (let i = 0; i < p.length; i++) { c += p[i]; if (r < c) return i; } return p.length - 1; }

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

// ─── LECTURE CONTENT ────────────────────────────────────────────────
// ─── EXPANDED LECTURE CONTENT — FULL SEMESTER ──────────────────────
const WEEKS = [
  {
    id: "intro", week: 0, title: { tr: "Giriş & Canlı Demo", en: "Introduction & Live Demo" }, icon: "🚀", color: "#0EA5E9",
    subtitle: { tr: "microGPT nedir, neden sıfırdan, kurulum, çalıştırma, sonuçları gözlemleme", en: "What is microGPT, why from scratch, setup, running, observing results" },
    sections: [
      {
        title: { tr: "Derse Hoş Geldiniz — Ne Öğreneceksiniz?", en: "Welcome — What You Will Learn" },
        viz: "coursePipeline",
        content: "243 satır saf Python ile tam bir GPT — satır satır anlayacaksınız. Hiçbir dış kütüphane yok. Yukarıdaki pipeline'ın her aşamasını ayrı bir hafta işleyeceğiz.",
        highlight: "\"This file is the complete algorithm. Everything else is just efficiency.\" — Andrej Karpathy"
      },
      {
        title: { tr: "Ön Bilgi: Yapay Sinir Ağı Nedir?", en: "Background: What is a Neural Network?" },
        viz: "neuralNetBasics",
        content: "Sinir ağı = öğrenilebilir parametreli bir fonksiyon. 3 sekmeyi keşfedin: 🔬 Nöron'da kaydırıcılarla ağırlıkları değiştirip çıktıyı canlı görün. 🌊 Veri Akışı'nda verinin nörondan nasıl geçtiğini adım adım izleyin. 🎯 Mini Eğitim'de modelin ev fiyatını tahmin etmeyi nasıl öğrendiğini simüle edin.",
        highlight: "Eğitim = bu kaydırıcıları (w₁, w₂, b) veriye göre OTOMATİK ayarlama. GPT'de 3,648 tane var!"
      },
      {
        title: { tr: "Ön Bilgi: Dil Modeli Nedir?", en: "Background: What is a Language Model?" },
        viz: "langModelConcept",
        content: "Dil modeli = 'sonraki token ne olabilir?' sorusuna cevap veren olasılık makinesi. 3 sekmeyi keşfedin: 🎲 Autoregressive Üretim'de 'emma' isminin harf harf nasıl üretildiğini izleyin. 📱 Telefon Analojisi'nde harf yazarak autocomplete'in GPT ile aynı mantıkta çalıştığını görün. 📚 'emma' Eğitimi'nde her harf çiftinin olasılığını eğitim öncesi/sonrası karşılaştırın.",
        highlight: "GPT = telefon autocompletenin çok büyük ölçekli hali. Aynı mantık: önceki tokenlara bakarak sonrakini tahmin et."
      },
      {
        title: { tr: "Ne Yapıyor Bu Kod? — Canlı Pipeline", en: "What Does This Code Do? — Live Pipeline" },
        viz: "livePipeline",
        content: "Yukarıdaki animasyonda ▶ butonuna basın — 'emma' isminin 9 aşamalı yolculuğunu adım adım izleyin. Her kutuya tıklayarak o aşamanın detayını görebilirsiniz.",
        code: `# Tek komutla çalıştırın:
$ python3 microgpt.py
# vocab size: 28, num params: 3648
# step 1/1000 | loss 3.33 ← rastgele
# step 1000   | loss 2.00 ← öğrendi!
# sample 0: kamrin ← yeni, gerçekçi isim!`,
        highlight: "Her kutuya tıklayarak o aşamanın detayını görebilirsiniz"
      },
      {
        title: { tr: "Neden Sıfırdan? Framework Karşılaştırma", en: "Why From Scratch? Framework Comparison" },
        viz: "frameworkCompare",
        content: "Yukarıdaki panelde 'Arkasında ne var?' butonuna tıklayın — PyTorch'un 3 satırının arkasında neler gizlendiğini görün. microgpt.py'de aynı işlem açıkça yazılmış.",
        highlight: "Framework = verimlilik aracı, algoritma değil. Önce algoritmayı anlayın, sonra framework hızlandırsın."
      },
      {
        title: { tr: "Ön Koşullar & Kurulum", en: "Prerequisites & Setup" },
        content: "Tek gereksinim: Python 3.6+. pip install gerekmez — sadece os, math, random kullanılır.",
        code: `# Python kontrol:
$ python3 --version  # 3.6+ yeterli

# pip install GEREKMİYOR!
import os      # dosya kontrolü
import math    # log, exp
import random  # rastgele sayılar`,
        highlight: "pip install gerekmez — sadece os, math, random kullanılır"
      },
      {
        title: { tr: "Kodu İndirme & İlk Çalıştırma", en: "Download & First Run" },
        content: "GitHub Gist'ten tek dosya indirin ve çalıştırın. Loss düşüyorsa her şey doğru!",
        code: `# İndir:
$ curl -o microgpt.py https://gist.githubusercontent.com/karpathy/.../microgpt.py

# Çalıştır (hızlı test):
$ python3 microgpt.py --num_steps 200

# Loss düşüyorsa → model öğreniyor ✓`,
        highlight: "Loss düşüyorsa her şey doğru!"
      },
      {
        title: { tr: "7 Temel Parametre — İnteraktif Lab", en: "7 Core Parameters — Interactive Lab" },
        viz: "paramDist",
        content: "Aşağıdaki kaydırıcılarla parametreleri değiştirin — parametre sayısı, bellek ve komut satırı komutu canlı güncellenir. n_embd artınca parametreler KARESEL büyür!",
        code: `# Varsayılan:
$ python3 microgpt.py  # 3,648 param

# Büyük model:
$ python3 microgpt.py --n_embd 32 --n_layer 2
# → ~14K param (4× artış!)`,
        highlight: "n_embd artınca parametreler KARESEL büyür!"
      },
      {
        title: { tr: "Kendi Verinizi Kullanma", en: "Using Your Own Data" },
        content: "input.txt'i değiştirerek Türkçe isimler, şehir adları veya hayvan isimleri öğretebilirsiniz. Vocab otomatik hesaplanır.",
        code: `# Türkçe isim verisi:
$ cat > input.txt << EOF
ahmet
mehmet
ayse
fatma
zeynep
EOF
$ python3 microgpt.py --num_steps 500
# Sonuç: mehet, aysun, fatem...`,
        highlight: "Vocab otomatik hesaplanır"
      },
      {
        title: { tr: "Üretim Evrimi — Canlı Simülasyon", en: "Generation Evolution — Live Simulation" },
        viz: "trainingEvolution",
        content: "▶ Başlat'a basın — eğitim boyunca loss'un düşüşünü ve üretilen isimlerin kalite artışını canlı izleyin. Kaydırıcı ile istediğiniz aşamaya zıplayabilirsiniz.",
        highlight: "Adım 1: 'xqwpzml' (rastgele) → Adım 1000: 'ellora' (gerçekçi). Aynı 3,648 parametre — sadece eğitim!"
      },
      {
        title: { tr: "GPT Ailesi — Ölçek Kulesi", en: "GPT Family — Scale Tower" },
        viz: "gptScaleTower",
        content: "Kulelerin üzerine gelin — her modelin detaylarını görün. microGPT bir bisiklet, GPT-4 bir uzay mekiği — ama aynı fizik kuralları geçerli.",
        highlight: "Bu kodu anlarsanız GPT-4'ün %90'ını anlarsınız. Kalan %10: RoPE, GQA, SwiGLU, MoE."
      }
    ]
  },

  {
    id: "tokenization", week: 1, title: { tr: "Tokenization & Embedding", en: "Tokenization & Embedding" }, icon: "🔤", color: "#8B5CF6",
    subtitle: { tr: "Metni sayılara, sayıları vektörlere çevirme — modelin dünyayı görme biçimi", en: "Converting text to numbers, numbers to vectors — how the model sees the world" },
    sections: [
      {
        title: { tr: "Ön Bilgi: Bilgisayarlar Metni Nasıl İşler?", en: "Background: How Do Computers Process Text?" },
        viz: "tokenFlow",
        content: "Bilgisayarlar metin işleyemez — her şey sayısal olmalıdır. Tokenization = metni modelin anlayacağı ID dizisine çevirme. Bu kodda her karakter = bir token.",
        highlight: "Tokenization = modelin 'gözlüğü'. Farklı tokenizer = farklı dünya görüşü."
      },
      {
        title: { tr: "Temel Tanımlar — Token, Vocab, Logit", en: "Key Definitions — Token, Vocab, Logit" },
        viz: "neuralNetBasics",
        content: "Token = modelin işlediği en küçük birim (bu kodda karakter). Vocabulary = tüm token kümesi (a-z + BOS = 27). Logit = modelin ham çıktı skorları (softmax öncesi).",
        highlight: "Metin → sayı → vektör dönüşümü olmadan model hiçbir şey yapamaz."
      },
      {
        title: { tr: "🎮 Tokenizer Oyun Alanı — Canlı Simülasyon", en: "🎮 Tokenizer Playground — Live Simulation" },
        viz: "tokenizerPlayground",
        content: "Yukarıya bir isim yazın ve ▶ butonuna basın — tokenization'ın 4 adımını canlı izleyin: karakterlere ayrılma → ID'lere çevrilme → BOS eklenmesi → eğitim çiftlerinin oluşması.",
        code: `# Vocabulary oluşturma:
uchars = sorted(set(''.join(docs)))  # ['a'...'z']
BOS = len(uchars)  # = 26 (özel token)

# Tokenize etme:
tokens = [BOS] + [uchars.index(ch) for ch in doc] + [BOS]
# "emma" → [26, 4, 12, 12, 0, 26]`,
        highlight: "Yukarıya bir isim yazın ve ▶ butonuna basın — tokenization'ın 4 adımını canlı iz"
      },
      {
        title: { tr: "Ön Bilgi: Vektör Nedir? Neden Kullanırız?", en: "Background: What is a Vector? Why Use Them?" },
        viz: "vectorConcept",
        content: "Vektör = sıralı sayılar listesi. Benzer şeyler → yakın vektörler. Bu kodda her token 16 boyutlu bir vektörle temsil edilir.",
        highlight: "Embedding = token'ı vektöre çevirme. Eğitim sonunda benzer tokenlar yakın vektörlere sahip olur."
      },
      {
        title: { tr: "Token Embedding: ID → Vektör Dönüşümü", en: "Token Embedding: ID → Vector Transform" },
        viz: "embeddingFlow",
        content: "Embedding tablosu [27×16]. İşlem basit tablo arama: wte[token_id] → 16-boyutlu vektör. Başlangıçta rastgele, eğitimle anlam kazanır.",
        code: `tok_emb = state_dict['wte'][token_id]
# 'a' → ID=0 → wte[0] = [0.02, -0.01, ...]
# Eğitim sonrası: sesli harfler yakın vektörlerde`,
        highlight: "Başlangıçta rastgele, eğitimle anlam kazanır"
      },
      {
        title: { tr: "Position Embedding: Sıra Bilgisi Ekleme", en: "Position Embedding: Adding Order Information" },
        viz: "embeddingFlow",
        content: "Transformer sıra bilgisi İÇERMEZ! Position embedding ile her konuma (0-7) özgü vektör eklenir: x = tok_emb + pos_emb.",
        code: `pos_emb = state_dict['wpe'][pos_id]
x = [t + p for t, p in zip(tok_emb, pos_emb)]
# Aynı 'a' → pos 0 ve pos 3'te FARKLI temsil`,
        highlight: "Transformer sıra bilgisi İÇERMEZ! Position embedding ile her konuma (0-7) özgü v"
      },
      {
        title: { tr: "Ön Bilgi: Matris Çarpımı (Linear Transform)", en: "Background: Matrix Multiplication (Linear Transform)" },
        viz: "matrixMul",
        content: "Her çıktı = girdi vektörü ile ağırlık satırının dot product'ı. Transformer'da HER projeksiyon (Wq, Wk, Wv, fc1, fc2) bir matris çarpımı.",
        code: `def linear(x, weight):
    return [sum(wi*xi for wi,xi in zip(wo,x))
            for wo in weight]
# Wq [16×16] × x [16] = q [16]  (256 çarpma)`,
        highlight: "Transformer'da HER projeksiyon (Wq, Wk, Wv, fc1, fc2) bir matris çarpımı"
      },
      {
        title: { tr: "Weight Tying & Parametre Dağılımı", en: "Weight Tying & Parameter Distribution" },
        viz: "paramDist",
        content: "Aynı wte matrisi hem giriş (lookup) hem çıkış (matris çarpımı) için kullanılır — weight tying. 3,648 parametrenin %56'sı MLP'de!",
        code: `# GİRİŞ: tok_emb = wte[token_id]     # lookup
# ÇIKIŞ: logits = linear(x, wte)      # matris çarpımı
# Aynı matris! → 432 param tasarrufu`,
        highlight: "3,648 parametrenin %56'sı MLP'de!"
      },
      {
        title: { tr: "Softmax — Skorlardan Olasılıklara", en: "Softmax — From Scores to Probabilities" },
        viz: "softmaxViz",
        content: "Softmax ham skorları olasılık dağılımına çevirir: P(i) = exp(xi)/Σexp(xj). Numerik trick: exp(xi-max) ile overflow önlenir.",
        code: `def softmax(logits):
    max_val = max(val.data for val in logits)
    exps = [(val - max_val).exp() for val in logits]
    return [e / sum(exps) for e in exps]
# [2.0, 1.0, 0.1] → [0.659, 0.242, 0.099]`,
        highlight: "Numerik trick: exp(xi-max) ile overflow önlenir"
      }
    ]
  },

  {
    id: "autograd", week: 2, title: { tr: "Autograd & Backpropagation", en: "Autograd & Backpropagation" }, icon: "⛓️", color: "#F59E0B",
    subtitle: { tr: "Otomatik türev alma, hesaplama grafı, chain rule — derin öğrenmenin temeli", en: "Automatic differentiation, computation graph, chain rule — the foundation of deep learning" },
    sections: [
      {
        title: { tr: "Ön Bilgi: Türev Nedir? Neden Lazım?", en: "Background: What is a Derivative? Why Do We Need It?" },
        viz: "derivative",
        content: "Türev = değişim hızı. f(x) = x² ise f'(3) = 6. Derin öğrenmede: ∂L/∂w = 'w'yi değiştirirsem loss ne olur?' Negatif yönde güncelle → loss azalır.",
        highlight: "Türev = 'bu parametreyi hangi yönde değiştirmeliyim ki loss azalsın?' sorusunun cevabı."
      },
      {
        title: { tr: "Ön Bilgi: Kısmi Türev ve Gradient", en: "Background: Partial Derivatives and Gradients" },
        viz: "derivative",
        content: "f(a,b) = a×b ise ∂f/∂a = b, ∂f/∂b = a (diğerini sabit tut). Gradient = tüm kısmi türevlerin vektörü. Gradient descent = gradient'in ters yönünde adım at.",
        code: `# f(a,b) = a×b + a²  (a=2, b=3 → f=10)
# ∂f/∂a = b + 2a = 7  (a'yı 1↑ → f≈7↑)
# ∂f/∂b = a = 2        (b'yi 1↑ → f≈2↑)
# Gradient: ∇f = [7, 2]
# Minimum: a -= lr×7, b -= lr×2`,
        highlight: "Gradient descent = gradient'in ters yönünde adım at"
      },
      {
        title: { tr: "🎮 Autograd Oyun Alanı — Canlı Backward Pass", en: "🎮 Autograd Playground — Live Backward Pass" },
        viz: "autogradPlayground",
        content: "Yukarıda a, b, c değerlerini kaydırıcılarla değiştirin ve ▶ Backward butonuna basın — chain rule adımlarının hesaplama grafı üzerinde nasıl ilerlediğini canlı izleyin!",
        highlight: "Autograd = derin öğrenmeyi mümkün kılan teknoloji. Bu kodda ~30 satırla sıfırdan yazılmıştır."
      },
      {
        title: { tr: "Value Sınıfı — 4 Temel Bileşen", en: "Value Class — 4 Core Components" },
        viz: "opGradTable",
        content: "Her sayı Value nesnesi olarak sarmalanır: data (değer), grad (türev, başta 0), _children (girdi düğümleri), _local_grads (yerel türevler).",
        code: `class Value:
    __slots__ = ('data','grad','_children','_local_grads')
    def __init__(self, data, children=(), local_grads=()):
        self.data = data; self.grad = 0
        self._children = children
        self._local_grads = local_grads`,
        highlight: "Her sayı Value nesnesi olarak sarmalanır: data (değer), grad (türev, başta 0), _"
      },
      {
        title: { tr: "Operatör Overloading — Otomatik Graf Oluşturma", en: "Operator Overloading — Automatic Graph Building" },
        viz: "opGradTable",
        content: "a+b, a*b gibi işlemler otomatik graf oluşturur. Her operasyon yerel gradient'ini bilir: toplama→(1,1), çarpma→(b,a), ReLU→(a>0?1:0).",
        code: `def __mul__(self, other):
    other = other if isinstance(other, Value) else Value(other)
    return Value(self.data * other.data,
        (self, other), (other.data, self.data))
# ∂(a×b)/∂a = b, ∂(a×b)/∂b = a`,
        highlight: "Her operasyon yerel gradient'ini bilir: toplama→(1,1), çarpma→(b,a), ReLU→(a>0?1:0)"
      },
      {
        title: { tr: "Chain Rule & Backward Pass", en: "Chain Rule & Backward Pass" },
        viz: "compGraph",
        content: "Chain rule: f(g(x)) türevi = f'(g(x)) × g'(x). Türevler geri doğru ÇARPILIR. Topological sort ile doğru sırada, self.grad=1'den başlayarak hesaplanır.",
        code: `def backward(self):
    topo = [];

// ─── ENGLISH CONTENT OVERLAY ────────────────────────────────────────
const EN_CONTENT = {
  intro: [
    { content: "A complete GPT in 243 lines of pure Python — you will understand every single line. No external libraries. We will cover each stage of the pipeline above in separate weeks.", highlight: "\"This file is the complete algorithm. Everything else is just efficiency.\" — Andrej Karpathy" },
    { content: "A neural network = a function with learnable parameters. Explore 3 tabs: 🔬 Neuron — adjust weights with sliders and see the output live. 🌊 Data Flow — follow data through a neuron step by step. 🎯 Mini Training — simulate how a model learns to predict house prices.", highlight: "Training = automatically adjusting these sliders (w₁, w₂, b) based on data. GPT has 3,648 of them!" },
    { content: "A language model = a probability machine that answers 'what could the next token be?' Explore 3 tabs: 🎲 Autoregressive Generation — watch how 'emma' is generated letter by letter. 📱 Phone Analogy — see how phone autocomplete works on the same principle as GPT. 📚 'emma' Training — compare pre/post training probabilities for each letter pair.", highlight: "GPT = a massively scaled-up version of phone autocomplete. Same logic: predict the next token based on previous ones." },
    { content: "Press ▶ in the animation above — follow the 9-step journey of generating 'emma' step by step. Click each box to see details of that stage.", highlight: "Click each box to see the details of that stage" },
    { content: "Click 'What\'s behind it?' in the panel above — see what\'s hidden behind PyTorch\'s 3 lines. In microgpt.py, the same operation is written explicitly.", highlight: "Framework = efficiency tool, not the algorithm. Understand the algorithm first, then let the framework speed things up." },
    { content: "Only requirement: Python 3.6+. No pip install needed — only os, math, random are used.", highlight: "No pip install needed — only os, math, random are used" },
    { content: "Download a single file from GitHub Gist and run it. If loss is decreasing, everything is working!", highlight: "If loss is decreasing, everything is working!" },
    { content: "Change the parameters with sliders below — parameter count, memory, and command line command update live. When n_embd increases, parameters grow QUADRATICALLY!", highlight: "When n_embd increases, parameters grow QUADRATICALLY!" },
    { content: "You can teach Turkish names, city names, or animal names by changing input.txt. Vocabulary is computed automatically.", highlight: "Vocabulary is computed automatically" },
    { content: "Loss start ~3.33 (random guessing among 27 tokens = -log(1/27)). If it drops below 2.0, the model has learned significant patterns. Generated names look realistic even if they\'re not in the training set.", highlight: "Loss < 2.0 means the model has learned! The generated names are new — not memorized." },
  ],
  tokenization: [
    { content: "Computers only understand numbers. Tokenization = splitting text into pieces (tokens) and converting each to a number. microGPT uses character-level: each letter = one token. GPT-4 uses BPE: frequent word pieces become single tokens.", highlight: "microGPT: 'emma' → ['e','m','m','a'] → [4,12,12,0]. Character-level = simplest possible tokenizer." },
    { content: "Token, Vocab, BOS, EOS — key concepts explained one by one. Token = smallest unit. Vocab = complete set of tokens. microGPT vocab = 27 (a-z + space).", highlight: "Vocab size directly affects model size. More tokens = more parameters = more expressive but harder to train." },
    { content: "Type characters below and watch how they get tokenized in real-time. Compare character-level tokenization with BPE. See how different tokenizers handle the same text differently.", highlight: "BPE learns frequent patterns: 'the' becomes one token instead of three." },
    { content: "A vector = a list of numbers describing something. One number isn\'t enough to describe a letter — we need multiple dimensions. Like GPS: latitude alone isn\'t enough, you need longitude too.", highlight: "Embedding dimension (d=16 in microGPT) = how many numbers describe each token. More dimensions = richer description." },
    { content: "Embedding table [27×16]. Operation is simple table lookup: wte[token_id] → 16-dimensional vector. Initially random, gains meaning through training.", highlight: "Initially random, gains meaning through training" },
    { content: "Transformer has no notion of order. Position embedding adds a unique 16-dimensional vector to each position. Without it, 'ab' and 'ba' would look identical.", highlight: "Without position embedding, the model cannot distinguish 'ab' from 'ba'!" },
    { content: "Matrix multiplication = the fundamental operation of neural networks. It transforms vectors from one space to another. Every layer in GPT is essentially a matrix multiplication.", highlight: "Matrix multiplication: the single most important operation in deep learning." },
    { content: "The same embedding matrix is used for both input and output. Input: token_id → vector. Output: vector → logits over vocabulary. This reduces parameters by half!", highlight: "Weight tying: same matrix for input and output = 50% fewer parameters in the embedding layer!" },
    { content: "Softmax converts raw scores (logits) to probabilities. Three properties: all values between 0-1, sum to 1, preserves order. Temperature parameter controls the sharpness of the distribution.", highlight: "Softmax = the bridge between raw model outputs and probabilities." },
  ],
  autograd: [
    { content: "Derivative = how fast does the output change when you slightly change the input? If f(x) = x², then f\'(x) = 2x. At x=3: rate of change = 6. This is the foundation of learning.", highlight: "Derivative is the compass of optimization: it tells us which direction to go and how big of a step to take." },
    { content: "With multiple inputs, we take the derivative with respect to each one separately. Gradient = collection of all partial derivatives. It points in the steepest ascent direction.", highlight: "Gradient = the steepest direction. Go opposite to minimize loss." },
    { content: "Build computation graphs, set values, and watch gradients flow backward in real-time. This is exactly what happens inside GPT during training.", highlight: "Every forward pass builds a graph. Backward pass computes gradients through this graph." },
    { content: "4 components: data (the number), grad (gradient, starts at 0), _backward (gradient computation function), _children (input nodes). Together they enable automatic differentiation.", highlight: "Value class = the atom of autograd. Everything builds on these 4 components." },
    { content: "When you write c = a + b, Python calls __add__. We override this to also build the computation graph. Result: math works normally AND the graph is built automatically.", highlight: "Operator overloading = the magic trick that makes autograd feel like normal math." },
    { content: "Chain rule: derivative of a composition = product of derivatives. f(g(x))\' = f\'(g(x)) × g\'(x). Backward pass applies this rule from output to input, through the entire graph.", highlight: "Chain rule is the mathematical foundation of backpropagation." },
    { content: "Topological sort ensures we process nodes in the right order. Gradient accumulation (+=, not =): when a variable is used multiple times, gradients ADD UP.", highlight: "Critical: grad += (not =!) — Gradients ACCUMULATE." },
    { content: "Our Value class: Python, CPU, educational, ~50 lines. PyTorch Tensor: C++/CUDA, GPU, production, millions of lines. Same algorithm, vastly different scale.", highlight: "Same algorithm, vastly different scale. Understanding Value = understanding PyTorch internals." },
  ],
  attention: [
    { content: "RNN processes sequentially → can\'t parallelize → slow. Information from early words fades in long sentences. Attention: every word can directly look at every other word.", highlight: "RNN: O(n) steps, Transformer: O(1) steps. Everyone sees everyone!" },
    { content: "Dot product measures how similar two vectors are. Large positive = very similar, near zero = unrelated, large negative = opposite. This is how attention decides which tokens to focus on.", highlight: "Dot product = the similarity engine of attention." },
    { content: "Each token creates 3 vectors: Q (what am I looking for?), K (what do I contain?), V (here is my information). High Q·K score → take more of that token\'s V.", highlight: "Library analogy: Q = topic you\'re searching for, K = book label, V = book content." },
    { content: "Attention(Q,K,V) = softmax(QKᵀ/√d)V. The √d scaling prevents dot products from getting too large, which would make softmax too sharp (one-hot).", highlight: "Scaling by √d is crucial: without it, gradients vanish in softmax\'s flat regions." },
    { content: "Instead of one attention with d dimensions, use h heads each with d/h dimensions. Different heads learn different patterns: one might focus on position, another on phonetics.", highlight: "Multi-head = ensemble of specialists. Each head captures different relationships." },
    { content: "In generation, future tokens don\'t exist yet. Causal mask sets future attention scores to -∞ → softmax makes them 0. The model can only look backward.", highlight: "Causal mask: the fundamental constraint that makes autoregressive generation possible." },
  ],
  transformer: [
    { content: "RMSNorm normalizes the vector. ~30% faster than LayerNorm: no mean subtraction. Prevents gradient explosion by keeping values in a reasonable range.", highlight: "RMSNorm = LayerNorm minus the mean subtraction. Simpler and faster." },
    { content: "2-layer network: expand 4× then compress back. fc1: d→4d (expand information), ReGLU activation (filter), fc2: 4d→d (compress back). This is where the model stores knowledge.", highlight: "MLP = the model\'s knowledge store. Attention routes information, MLP processes it." },
    { content: "x = x + sublayer(x). Without residuals, gradients vanish in deep networks. Residual connections create a direct path for gradients to flow through.", highlight: "Residual connections = the information highway. They are what make deep networks trainable." },
    { content: "Input → RMSNorm → Self-Attention → Residual → RMSNorm → MLP → Residual → Output. This is the complete transformer block. microGPT has exactly 1 such block.", highlight: "One block = Norm + Attention + Residual + Norm + MLP + Residual. Stack N of these = GPT." },
    { content: "Follow dimension changes through the entire model: token_id (scalar) → embedding (d) → attention Q,K,V (d) → head split (d/h per head) → merge (d) → MLP (4d→d) → logits (vocab).", highlight: "Understanding dimension flow = understanding the architecture." },
  ],
  training: [
    { content: "Cross-entropy measures surprise: if the model assigns high probability to the correct answer, loss is low. L = -log(P(target)). Starting loss ≈ 3.33 = random guessing among 27 tokens.", highlight: "Low probability → high surprise → high loss. Training = reducing surprise." },
    { content: "Imagine a hilly landscape where height = loss. Gradient descent = always walk downhill. The gradient tells you the steepest direction. Step size = learning rate.", highlight: "Gradient descent: the optimization algorithm behind virtually all of deep learning." },
    { content: "Too large → oscillate and diverge. Too small → painfully slow. The sweet spot depends on the problem. Common trick: start large, decay over time (learning rate schedule).", highlight: "Learning rate is the single most important hyperparameter in training." },
    { content: "Adam = SGD + momentum + adaptive learning rate. Momentum: use past gradients for smoother updates. Adaptive: each parameter gets its own learning rate. This is what microGPT uses.", highlight: "Adam: the default optimizer for transformers. Combines the best ideas in optimization." },
    { content: "Complete loop: forward pass → compute loss → backward pass → update parameters → zero gradients → repeat. 500+ iterations. Loss goes from 3.33 to ~2.0.", highlight: "Training loop = the heartbeat of machine learning. Forward → Loss → Backward → Update → Repeat." },
  ],
  inference: [
    { content: "Training: forward + backward + update (parallel, gradients needed). Inference: forward only (sequential, no gradients → fast, low memory). Training = studying for an exam, Inference = taking the exam.", highlight: "Training = learning, Inference = applying what was learned. Very different computational profiles." },
    { content: "Generate one token at a time: feed current sequence → get probability distribution → sample next token → append → repeat until EOS. Each step requires a full forward pass.", highlight: "Autoregressive = each new token depends on ALL previous tokens." },
    { content: "Temperature < 1: sharper distribution → more predictable. Temperature > 1: flatter → more creative/random. Top-k: only consider the k most likely tokens, ignore the rest.", highlight: "Temperature controls the creativity-coherence tradeoff." },
    { content: "Without cache: re-compute attention for ALL previous tokens at each step. With KV cache: store K,V from previous steps, only compute for the new token. Huge speedup!", highlight: "KV cache: the key optimization that makes autoregressive generation practical." },
    { content: "Explore all 3,648 parameters: where are they, what do they do? Weight initialization: small random values (Gaussian, σ=0.02). Too large → explosion, too small → vanishing signals.", highlight: "Initialization matters: the right starting point makes training much easier." },
  ],
  evolution: [
    { content: "More parameters = lower loss, but with diminishing returns. Chinchilla scaling: optimal compute allocation between model size and data. Key insight: most models are undertrained!", highlight: "Scaling laws: the empirical foundation of modern AI. Predictable performance from compute budget." },
    { content: "From CPUs to GPUs to TPUs to custom AI chips. GPU parallelism is what makes transformer training feasible. Memory bandwidth is often the bottleneck.", highlight: "Hardware evolution drives AI capability. Each generation enables 10× larger models." },
    { content: "Data collection → cleaning → tokenization → training → evaluation. Modern models train on trillions of tokens. Data quality matters as much as quantity.", highlight: "Data pipeline: garbage in, garbage out. The most important and least glamorous part of AI." },
    { content: "BPE → WordPiece → Unigram → SentencePiece. Evolution towards: language-agnostic, efficient, robust tokenization. Modern tokenizers handle 100K+ vocabulary.", highlight: "Tokenization has evolved from simple character splits to sophisticated subword algorithms." },
    { content: "Full attention is O(n²). Solutions: sparse attention, linear attention, flash attention. FlashAttention: same result, 2-4× faster through memory-aware computation.", highlight: "FlashAttention: the breakthrough that made long-context models practical." },
    { content: "LLaMA, Mistral, Phi, Gemma, Qwen — the open source ecosystem is thriving. Open weights enable research, fine-tuning, and deployment without API dependencies.", highlight: "Open source AI: democratizing access to state-of-the-art models." },
    { content: "MoE (Mixture of Experts), multimodal models, agents, reasoning chains, RLHF/DPO alignment. The field is evolving at unprecedented speed.", highlight: "The pace of AI innovation continues to accelerate. Today\'s cutting edge is tomorrow\'s baseline." },
  ],
  paper: [
    { content: "In 2017, Google researchers discarded RNNs and CNNs entirely and built the Transformer model using only attention. Better results AND much faster.", highlight: "Old approach (RNN): processes each word SEQUENTIALLY. Transformer looks at ALL words simultaneously." },
    { content: "RNN is sequential → can\'t parallelize → slow. Information from early words is lost in long sentences. Gradient explosion/vanishing occurs.", highlight: "RNN: O(n) steps, Transformer: O(1) steps. Everyone sees everyone!" },
    { content: "Query: What am I looking for? Key: What do I have? Value: Here\'s my information. High Q·K → take more information from that word\'s Value!", highlight: "Library analogy: Query = topic you\'re searching for, Key = book label, Value = book content." },
    { content: "3 key formulas: ① Dot Product ② Softmax ③ Scaled Dot-Product Attention. Explore each with sliders.", highlight: "Attention(Q,K,V) = softmax(QKᵀ/√d)V — the paper\'s most famous formula." },
    { content: "Encoder understands the input sentence (6 layers). Decoder generates the output sentence (6 layers). Each layer: Attention + FFN + Residual + LayerNorm.", highlight: "Decoder has causal mask: cannot see future words!" },
    { content: "Transformer has no notion of order! Sin/cos waves add a unique \'fingerprint\' to each position. Different frequencies capture patterns at different scales.", highlight: "Low dimensions change fast (treble), high dimensions change slow (bass) — like a piano!" },
    { content: "4.5M sentence pairs, 8× P100 GPU, 3.5 days. EN→DE: 28.4 BLEU (record!). EN→FR: 41.8 BLEU. Warmup + label smoothing + dropout.", highlight: "Base model: 65M parameters. Big model: 213M parameters. Today\'s GPT-4: ~1T+ parameters!" },
    { content: "90K+ citations! GPT, BERT, ViT, DALL-E, AlphaFold, Copilot — all Transformer-based. A 15-page paper changed all of AI.", highlight: "Not just language: vision (ViT), protein (AlphaFold), music (MusicGen), code (Copilot)." },
  ],
};
 visited = set()
    def build_topo(v):
        if v not in visited:
            visited.add(v)
            for child in v._children: build_topo(child)
            topo.append(v)
    build_topo(self)
    self.grad = 1  # ∂L/∂L = 1
    for v in reversed(topo):
        for child, lg in zip(v._children, v._local_grads):
            child.grad += lg * v.grad  # chain rule!`,
        highlight: "Topological sort ile doğru sırada, self.grad=1'den başlayarak hesaplanır"
      },
      {
        title: "Somut Örnek: L = (a × b) + c",
        viz: "compGraph",
        content: "a=2, b=3, c=1 → d=6, L=7. Backward: ∂L/∂L=1, ∂L/∂d=1, ∂L/∂c=1, ∂L/∂a=b=3, ∂L/∂b=a=2. Autograd oyun alanında bizzat deneyin!",
        highlight: "a.grad=3 → a'yı 1 birim artırırsak loss 3 birim artar. Optimizer bu bilgiyi kullanır."
      },
      {
        title: "Gradient Toplanması (+=) Neden Kritik?",
        viz: "compGraph",
        content: "L = a×a ise ∂L/∂a = 2a. += ile iki yoldan gelen gradient toplanır → doğru. = ile sadece son yol kalır → yanlış! Weight tying, residual'da bu durum sürekli olur.",
        code: `a = Value(3); L = a * a  # a İKİ KEZ kullanılır
# += ile: a.grad = 3 + 3 = 6 = 2a  ✓
# =  ile: a.grad = 3  ← YANLIŞ! (2a=6 olmalı)`,
        highlight: "= ile sadece son yol kalır → yanlış! Weight tying, residual'da bu durum sürekli olur"
      },
      {
        title: "Bu Kod vs. PyTorch Karşılaştırma",
        viz: "opGradTable",
        content: "Birebir aynı gradient değerleri! Fark: Value=skaler (~30 satır Python), Tensor=N-boyutlu (~100K+ satır C++/CUDA, GPU ile milyonlarca kat hızlı).",
        highlight: "Her eğitim adımında p.grad = 0 yapılmazsa gradient birikir → model patlar!"
      }
    ]
  },

  {
    id: "attention", week: 3, title: { tr: "Self-Attention Mekanizması", en: "Self-Attention Mechanism" }, icon: "🔍", color: "#10B981",
    subtitle: { tr: "Q·Kᵀ/√d → Softmax → V — Transformer'ın kalbi", en: "Q·Kᵀ/√d → Softmax → V — The heart of the Transformer" },
    sections: [
      {
        title: "Ön Bilgi: RNN'den Attention'a",
        viz: "rnnToAttn",
        content: "2017 öncesi RNN/LSTM standardı: sıralı, yavaş, uzun mesafe bağımlılıklarını unutur. 'Attention Is All You Need' → RNN'yi kaldır, SADECE attention kullan = Transformer.",
        highlight: "Transformer = Attention + Feed-Forward, RNN yok. Bu basit fikir tüm modern AI'ı mümkün kıldı."
      },
      {
        title: "Self-Attention — Sezgisel Anlama",
        viz: "attentionFlow",
        content: "Her token önceki tokenlara bakarak bilgi toplar. Bazılarına çok dikkat eder (yüksek ağırlık), bazılarını yok sayar. Bu ağırlıklar dinamik — her girdi için yeniden hesaplanır.",
        highlight: "Attention = dinamik, veri-bağımlı ağırlıklama. Statik değil — her girdi için farklı."
      },
      {
        title: "Query, Key, Value — 3 Farklı Rol",
        viz: "attentionFlow",
        content: "Q = 'ne arıyorum?', K = 'bende ne var?', V = 'bilgim nedir'. Q·K dot product = uyum skoru. Yüksek skor → V'den daha çok bilgi al.",
        code: `q = linear(x, state_dict['attn_wq'])  # [16]→[16]
k = linear(x, state_dict['attn_wk'])
v = linear(x, state_dict['attn_wv'])
# Q·K yüksek → o token'a çok dikkat et`,
        highlight: "Yüksek skor → V'den daha çok bilgi al"
      },
      {
        title: "🎮 Attention Oyun Alanı — Head Kalıplarını Keşfet",
        viz: "attentionPlayground",
        content: "Yukarıda 4 farklı head seçip 'Banana' kelimesinde her token'ın nelere dikkat ettiğini görün. Satırlara tıklayarak dikkat dağılımını inceleyin — her head farklı kalıp öğrenir!",
        highlight: "Her head bağımsız attention hesabı yapar. Biri sesli-sessiz uyumunu, diğeri pozisyon yakınlığını öğrenebilir."
      },
      {
        title: "Scaled Dot-Product — Tam Hesaplama",
        viz: "attentionFlow",
        content: "4 adım: Q·K (skor) → ÷√d (scaling) → softmax (olasılık) → ×V (bilgi toplama). √d bölme kritik: boyut büyüyünce softmax spike yapar, gradient kaybolur.",
        code: `for t in range(len(keys)):
    score[t] = dot(q, keys[t]) / sqrt(head_dim)
weights = softmax(scores)
out = weighted_sum(weights, values)
# Attention(Q,K,V) = softmax(Q·Kᵀ/√d)·V`,
        highlight: "√d bölme kritik: boyut büyüyünce softmax spike yapar, gradient kaybolur"
      },
      {
        title: "Ön Bilgi: Dot Product — Benzerlik Ölçümü",
        viz: "dotProduct",
        content: "a·b = Σ aᵢ×bᵢ. Aynı yön → pozitif (benzer), dik → 0 (ilgisiz), ters → negatif (zıt). Q·K = sorgu ile anahtar ne kadar uyumlu?",
        code: `# q·k1 = 0.2+0.06+0.02+0.03 = 0.31 (benzer!)
# q·k2 = -0.25-0.09-0.04-0.01 = -0.39 (zıt)
# → q, k1'e daha çok dikkat edecek`,
        highlight: "Q·K = sorgu ile anahtar ne kadar uyumlu?"
      },
      {
        title: "Multi-Head & Causal Masking",
        viz: "causalMask",
        content: "16 boyut → 4 head × 4 dim. Her head bağımsız attention yapar, sonra birleştirilip Wo ile projekte edilir. Causal mask: her token sadece ÖNCEKİLERİ görür.",
        code: `# Multi-head: her head 4 boyutluk dilim
for h in range(4):
    q_h = q[h*4:(h+1)*4]
    # bağımsız attention → concatenate → Wo
# Causal: KV cache = doğal mask`,
        highlight: "Causal mask: her token sadece ÖNCEKİLERİ görür"
      },
      {
        title: "Attention Çıktısı & Linear Projeksiyon",
        viz: "residualViz",
        content: "4 head birleştirilir (4×4=16), Wo matrisi ile projekte edilir, residual eklenir: x = Wo×heads + x_residual. Wo sıfırda başlar → başta identity.",
        code: `# 6 linear projeksiyon: Wq, Wk, Wv, Wo, fc1, fc2
# Hepsi aynı: x × W (bias yok, modern trend)`,
        highlight: "Wo sıfırda başlar → başta identity"
      }
    ]
  },

  {
    id: "transformer", week: 4, title: { tr: "Transformer Blokları", en: "Transformer Blocks" }, icon: "🧱", color: "#EC4899",
    subtitle: { tr: "RMSNorm, MLP, Residual — tam mimari, katman katman", en: "RMSNorm, MLP, Residual — full architecture, layer by layer" },
    sections: [
      {
        title: "Genel Mimari — Büyük Resim",
        viz: "archPipeline",
        content: "Bir Transformer katmanı = Attention + MLP. Her blok öncesi RMSNorm, sonrası residual. Akış: x → norm → attn → +x → norm → MLP → +x → çıktı.",
        highlight: "Pre-norm: norm → block → +residual. Modern modellerin standardı — daha kararlı eğitim."
      },
      {
        title: "🎮 Transformer Bloğu — Adım Adım Simülasyon",
        viz: "transformerBlockFlow",
        content: "▶ Akış butonuna basın ve 8 aşamayı sırayla izleyin: girdi → RMSNorm → Attention → +Residual → RMSNorm → MLP → +Residual → çıktı. Kutulara tıklayarak adım atlayın.",
        highlight: "Her aşama bir işlev: Norm=kararlılık, Attn=bilgi toplama, MLP=bilgi işleme, Residual=gradient highway."
      },
      {
        title: "RMSNorm — Nasıl Çalışır?",
        viz: "normCompare",
        content: "RMS = √mean(x²). Her elemanı RMS'e böl → normalize. LayerNorm'dan farkı: ortalama çıkarmaz → %30 daha hızlı, eşdeğer kalite.",
        code: `def rmsnorm(x):
    ms = sum(xi*xi for xi in x) / len(x)
    scale = (ms + 1e-5) ** -0.5
    return [xi * scale for xi in x]`,
        highlight: "LayerNorm'dan farkı: ortalama çıkarmaz → %30 daha hızlı, eşdeğer kalite"
      },
      {
        title: "MLP Bloku — Feed-Forward Network",
        viz: "mlpFlow",
        content: "Her token'ı bağımsız işler: genişlet (16→64) → ReLU² aktive → daralt (64→16). ~%40 nöron 'ölü' kalır (sparse = iyi!).",
        code: `h = linear(x, state_dict['mlp_fc1'])  # 16→64
h = [xi.relu()**2 for xi in h]        # ReLU²
x = linear(h, state_dict['mlp_fc2'])  # 64→16
x = [a+b for a,b in zip(x, x_res)]   # +residual`,
        highlight: "~%40 nöron 'ölü' kalır (sparse = iyi!)"
      },
      {
        title: "Ön Bilgi: Aktivasyon Fonksiyonu Neden Gerekli?",
        viz: "activation",
        content: "Aktivasyon olmadan derin ağ = tek matris çarpımı (W₃×W₂×W₁×x = W×x). Non-linearity her katmana farklı karar sınırı öğretir.",
        highlight: "Aktivasyon = non-linearity. Onsuz derin ağ = basit matris çarpımı. Tüm güç buradan gelir."
      },
      {
        title: "Residual Bağlantılar — Gradient Highway",
        viz: "residualViz",
        content: "x = f(x) + x. Gradient doğrudan girişe akar: ∂L/∂x = ∂L/∂out × (∂f/∂x + 1). +1 terimi = kestirme yol. Wo ve fc2 sıfırda başlar → başta identity.",
        code: `# Attention: x = attention(norm(x)) + x_res
# MLP:       x = mlp(norm(x)) + x_res
# Gradient: +1 terimi gradient'in kaybolmasını önler`,
        highlight: "Wo ve fc2 sıfırda başlar → başta identity"
      },
      {
        title: "Weight Initialization — Kritik Başlatma",
        viz: "weightInit",
        content: "Genel parametreler: std=0.08 ≈ 1/√n_embd. Wo ve fc2: std=0 → başta residual = identity. Çok büyük → patlama, çok küçük → kaybolma.",
        code: `# Genel: random.gauss(0, 0.08)
# Wo, fc2: random.gauss(0, 0.0)  ← sıfıra yakın
# → Başta: x ≈ x + 0 = x (identity)`,
        highlight: "Çok büyük → patlama, çok küçük → kaybolma"
      },
      {
        title: "RMSNorm vs LayerNorm — Karşılaştırma",
        viz: "normCompare",
        content: "LayerNorm: μ çıkar, σ'ya böl, γ ve β uygula (4 işlem). RMSNorm: sadece RMS'e böl, γ uygula (2 işlem). LLaMA, Mistral, Gemma hep RMSNorm.",
        highlight: "Ortalama çıkarmak gereksiz bulundu — %30 hız kazancı, sıfır kalite kaybı."
      }
    ]
  },

  {
    id: "training", week: 5, title: { tr: "Eğitim Döngüsü", en: "Training Loop" }, icon: "🔄", color: "#EF4444",
    subtitle: { tr: "Loss, optimizer, learning rate — modeli öğretme sanatı", en: "Loss, optimizer, learning rate — the art of teaching a model" },
    sections: [
      {
        title: "Ön Bilgi: Optimizasyon Nedir?",
        viz: "gradDescent",
        content: "Optimizasyon = loss fonksiyonunun minimumunu bulma. 3,648 boyutlu uzayda en alçak noktayı arıyoruz. Gradient descent = her adımda gradient'in ters yönünde küçük adım.",
        highlight: "Derin öğrenme = fonksiyon optimizasyonu. Loss'u minimize eden parametreleri bulmak = tüm iş."
      },
      {
        title: "Gradient Descent — Sezgisel Anlama",
        viz: "gradDescent",
        content: "Gözleri kapalı dağda: en dik yokuşu hissedip (gradient) tersine adım at (güncelleme). Adım boyutu = learning rate. Çok büyük → patlama, çok küçük → yavaş.",
        code: `p.data -= learning_rate * p.grad
# grad>0 → p azalt, grad<0 → p artır, grad=0 → minimum`,
        highlight: "Çok büyük → patlama, çok küçük → yavaş"
      },
      {
        title: "🎮 Eğitim Simülasyonu — LR Etkisini Dene",
        viz: "trainingSim",
        content: "Yukarıda learning rate kaydırıcısını ayarlayıp ▶ Eğit butonuna basın. Loss eğrisinin nasıl değiştiğini gözlemleyin: çok yüksek LR → patlama, çok düşük → yavaş öğrenme, doğru LR → güzel düşüş!",
        highlight: "LR çok büyük → diverge, çok küçük → çok yavaş. İyi bölge: 0.005-0.05 arası."
      },
      {
        title: "Cross-Entropy Loss",
        viz: "lossTable",
        content: "L = -log(P(doğru_token)). P=1→L=0, P=1/27→L≈3.33 (rastgele). Eğitimle loss düşer: 3.33 → 2.8 → 2.0 → 1.5.",
        code: `loss_t = -probs[target_id].log()
loss = (1/n) * sum(losses)  # ortalama
# Başlangıç ≈ 3.33, hedef < 2.0`,
        highlight: "Eğitimle loss düşer: 3.33 → 2.8 → 2.0 → 1.5"
      },
      {
        title: "Ön Bilgi: Log Fonksiyonu — Neden?",
        viz: "crossEntropyGraph",
        content: "-log(p): p=1→0, p→0→∞. Düşük olasılığa ağır ceza. Çarpımları toplama çevirir (numerik kararlılık). Bilgi teorisi: sürpriz ölçüsü.",
        highlight: "-log(p) = sürpriz. Beklenmeyen olay → yüksek sürpriz → yüksek loss. Model sürprizi minimize eder."
      },
      {
        title: "Adam Optimizer — SGD'nin Evrimi",
        viz: "adamEvolution",
        content: "SGD sorunları: tek lr, gürültüye duyarlı. Adam = Momentum (yön) + RMSprop (ölçek). Her parametre kendi adaptif lr'ını alır. NLP standardı.",
        code: `m[i] = 0.85*m[i] + 0.15*p.grad      # momentum
v[i] = 0.99*v[i] + 0.01*p.grad**2   # adaptif ölçek
p.data -= lr * m_hat / (v_hat**0.5 + 1e-8)
p.grad = 0  # ← KRİTİK sıfırlama!`,
        highlight: "SGD sorunları: tek lr, gürültüye duyarlı"
      },
      {
        title: "Learning Rate Decay & Eğitim Döngüsü",
        viz: "lrDecay",
        content: "Linear decay: lr_t = lr × (1 - step/num_steps). Modern: warmup + cosine decay. Tam döngü: forward → loss → backward → adam güncelle → grad sıfırla → tekrarla.",
        code: `lr_t = learning_rate * (1 - step / num_steps)
# step=0: lr=0.01, step=500: 0.005, step=1000: 0.0`,
        highlight: "Tam döngü: forward → loss → backward → adam güncelle → grad sıfırla → tekrarla"
      },
      {
        title: "Gradient Sıfırlama — Neden Şart?",
        viz: "trainingCycle",
        content: "Backward += ile gradient biriktirir. Sıfırlanmazsa: 0.5 → 0.8 → 1.5 → ∞ → model patlar! Her adımda p.grad = 0 yapılmalı.",
        code: `for i, p in enumerate(params):
    p.data -= lr_t * m_hat / (v_hat**0.5 + 1e-8)
    p.grad = 0  # ← BU SATIR OLMADAN MODEL PATLAR`,
        highlight: "Sıfırlanmazsa: 0.5 → 0.8 → 1.5 → ∞ → model patlar! Her adımda p.grad = 0 yapılmalı"
      }
    ]
  },

  {
    id: "inference", week: 6, title: "Inference & Text Generation", icon: "✨", color: "#6366F1",
    subtitle: { tr: "Autoregressive sampling, temperature, KV cache — modelin konuşma zamanı", en: "Autoregressive sampling, temperature, KV cache — when the model speaks" },
    sections: [
      {
        title: "Eğitim vs Inference — Fark Nedir?",
        viz: "inferenceTimeline",
        content: "Eğitim: forward + backward + güncelle (paralel, gradient gerekli). Inference: sadece forward (sıralı, gradient yok → hızlı, az bellek). Eğitim = sınav çalışmak, Inference = sınav vermek.",
        highlight: "Inference'da backward pass YOK → daha az bellek, daha hızlı. Ama autoregressive olduğu için sıralı."
      },
      {
        title: "Autoregressive Generation — Adım Adım",
        viz: "inferenceTimeline",
        content: "BOS ile başla → model çalıştır → 27 olasılık → temperature ölçekle → softmax → örnekle → BOS/EOS ise DUR, değilse tekrarla. Sonuç: 'kamrin' gibi yeni isimler!",
        code: `token_id = BOS; sample = []
for pos_id in range(block_size):
    logits = gpt(token_id, pos_id, keys, values)
    probs = softmax([l/temperature for l in logits])
    token_id = random.choices(range(27), weights=probs)[0]
    if token_id == BOS: break
    sample.append(uchars[token_id])`,
        highlight: "Sonuç: 'kamrin' gibi yeni isimler!"
      },
      {
        title: "🎮 Üretim Oyun Alanı — Temperature Etkisini Dene",
        viz: "generationPlayground",
        content: "Yukarıda temperature kaydırıcısını ayarlayıp ▶ Üret butonuna basın. Düşük T → her zaman aynı isim, yüksek T → kaotik harfler. Softmax dağılım şeklinin nasıl değiştiğini gözlemleyin!",
        highlight: "Düşük T → deterministik (tekrar), T≈0.8 → dengeli (yaratıcı ama gerçekçi), yüksek T → kaotik."
      },
      {
        title: "Temperature Scaling — Yaratıcılık Kontrolü",
        viz: "temperatureViz",
        content: "probs = softmax(logits/T). T→0: greedy (deterministik). T=0.8: dengeli. T=1: orijinal dağılım. T>1: düz (rastgele). Fizik analojisi: düşük T → düzenli, yüksek T → kaotik.",
        code: `# T=0.5: [0.876, 0.117, 0.007] ← sivri
# T=1.0: [0.659, 0.242, 0.099] ← dengeli
# T=2.0: [0.387, 0.337, 0.276] ← düz`,
        highlight: "Fizik analojisi: düşük T → düzenli, yüksek T → kaotik"
      },
      {
        title: "Sampling Stratejileri",
        viz: "samplingViz2",
        content: "Bu kodda: random sampling (tam dağılımdan). Alternatifler: Greedy (argmax), Top-k (en yüksek k token), Top-p/Nucleus (kümülatif olasılık eşiği). Production: genelde top-p + temperature.",
        highlight: "Bu kod en basit stratejiyi kullanır. Production modeller genelde top-p (nucleus) tercih eder."
      },
      {
        title: "KV Cache — O(n²) → O(n)",
        viz: "kvCache",
        content: "Önceki pozisyonların K,V vektörlerini sakla. Her yeni token için sadece 1 K,V hesapla, öncekiler cache'ten oku. Bu kodda Python listesi, production'da Paged Attention.",
        code: `keys[layer_idx].append(k)    # cache'e ekle
values[layer_idx].append(v)
# pos=5: keys = [k₀,...,k₅] ← öncekiler hazır!`,
        highlight: "Bu kodda Python listesi, production'da Paged Attention"
      },
      {
        title: "Inference Pipeline — Uçtan Uca Örnek",
        viz: "inferenceTimeline",
        content: "'kamrin': BOS→'k'(P=.08)→'a'(.15)→'m'(.11)→'r'(.09)→'i'(.22)→'n'(.18)→BOS(.31)→DUR. Veri setinde yok ama İngilizce yapısına uygun!",
        highlight: "Model olasılık üretir, sampling seçer. Farklı temperature/seed → farklı isimler."
      },
      {
        title: "Bu Kod vs Production GPT — Kapanış",
        viz: "whatsMissing",
        content: "Birebir aynı algoritma! Fark sadece ölçek: 3,648 vs 1T+ parametre, 8 vs 128K+ context, dakikalar vs aylar eğitim, $0 vs $100M+ maliyet. TEMELDEKİ MATEMATİK AYNI. Tebrikler!",
        highlight: "243 satır Python ile GPT'nin tüm temellerini öğrendiniz. Artık 'sihir' değil, anlaşılır matematik!"
      }
    ]
  },

  {
    id: "evolution", week: 7, title: { tr: "Modern AI'a Evrim", en: "Evolution to Modern AI" }, icon: "🌍", color: "#14B8A6",
    subtitle: { tr: "243 satırdan ChatGPT'ye — ölçek, donanım, yazılım ve paradigma değişimleri", en: "From 243 lines to ChatGPT — scale, hardware, software, and paradigm shifts" },
    sections: [
      {
        title: "Scaling Laws — Daha Büyük = Daha İyi?",
        viz: "scalingLaws",
        content: "Kaplanick et al. (2020): loss ∝ 1/N^α. Parametre, veri ve hesaplama artınca loss düşer — güç yasası ilişkisi. Chinchilla (2022): optimal oran = 20 token/parametre.",
        code: `# Scaling Law (Kaplanick et al. 2020):
# L(N) = a / N^b  (N=parametre sayısı)
# microGPT:  N=3,648   → loss ≈ 2.0
# GPT-2:     N=1.5B    → loss ≈ 0.8
# GPT-3:     N=175B    → loss ≈ 0.5
# Chinchilla: optimal D/N ≈ 20 (token/param)`,
        highlight: "microGPT'den GPT-4'e geçiş 'yeni matematik' değil, AYNI matematiğin 1 milyon kat büyütülmesi."
      },
      {
        title: "🎮 Evrim Zaman Çizelgesi — GPT-1'den Bugüne",
        viz: "evolutionTimeline",
        content: "Aşağıdaki zaman çizelgesinde her modele tıklayıp parametre, veri, yenilik ve maliyet bilgilerini inceleyin. microGPT'den GPT-4'e 6 büyüklük mertebesi fark — ama temel aynı!",
        highlight: "2018'den 2024'e: 117M → 1.8T parametre, $10K → $100M+ maliyet. Ama Transformer temeli hiç değişmedi."
      },
      {
        title: "Donanım Evrimi — CPU → GPU → TPU",
        viz: "hardwareEvolution",
        content: "CPU: sıralı, genel amaçlı. GPU: binlerce küçük çekirdek, paralel matris çarpımı (NVIDIA A100: 312 TFLOPS). TPU: Google'ın özel AI çipi. Yeni: Groq LPU, Cerebras WSE.",
        highlight: "GPU olmadan modern AI yok. A100 tek çipte 80GB bellek, 312 TFLOPS — microGPT'yi saniyede milyonlarca kez çalıştırır."
      },
      {
        title: "Eğitim Pipeline'ı — Pre-training → RLHF",
        viz: "trainingPipeline",
        content: "3 aşama: (1) Pre-training: internet-ölçeğinde metin, next-token prediction — bu derste öğrendiğiniz! (2) SFT: insan yazımı soru-cevap ile fine-tune. (3) RLHF/DPO: insan tercihleri ile hizalama.",
        code: `# 3-Aşamalı Modern LLM Eğitimi:
# 1. Pre-training (bu ders!):
#    loss = -log(P(next_token | prev_tokens))
#    Veri: internet (~13T token)
#    Maliyet: ~%95 toplam bütçe

# 2. SFT (Supervised Fine-Tuning):
#    (soru, cevap) çiftleri ile fine-tune
#    ~100K örnek

# 3. RLHF (Human Alignment):
#    reward_model = train(human_preferences)
#    policy = PPO(model, reward_model)`,
        highlight: "Pre-training = ham güç, SFT = yetenek, RLHF = 'iyi davranış'. microGPT sadece adım 1'i yapıyor."
      },
      {
        title: "Tokenization Evrimi — Karakter → BPE → SentencePiece",
        viz: "tokenEvolution",
        content: "microGPT: karakter düzeyi (27 token). BPE (GPT-2): alt-kelime (~50K token, 'playing'→'play'+'ing'). SentencePiece (LLaMA): Unicode-aware. tiktoken (GPT-4): ~100K token.",
        highlight: "Daha iyi tokenizer = daha az token = daha uzun context = daha iyi anlama. Ama temel fikir aynı: metin→ID."
      },
      {
        title: "Attention Evrimi — Vanilla → Flash → Sliding Window",
        viz: "attentionEvolution",
        content: "Vanilla: O(n²) bellek ve hesaplama. Multi-Query (2019): K,V paylaşımı. Flash Attention (2022): IO-aware → 2-4× hızlı. Sliding Window (Mistral): sabit pencere → ∞ context.",
        highlight: "Flash Attention = aynı matematik, farklı bellek erişim düzeni. Sonuç değişmez, hız 4× artar."
      },
      {
        title: "Açık Kaynak Devrimi — LLaMA, Mistral, DeepSeek",
        viz: "opensourceMap",
        content: "2023 kırılma noktası: LLaMA → açık ağırlıklar, araştırma patlaması. Mistral 7B: küçük ama güçlü. DeepSeek-V3: MoE, ücretsiz API. Qwen, Gemma, Command-R: çeşitlilik.",
        highlight: "Açık kaynak modeller GPT-4 seviyesine yaklaşıyor. microGPT'nin prensipleri bunların HEPSİNDE aynı."
      },
      {
        title: "Güncel Trendler — MoE, RAG, Agent, Multimodal",
        viz: "trendsRadar",
        content: "MoE: 8 uzman, her token 2 uzmanı aktive eder → verimlilik. RAG: dış bilgi ile zenginleştirme. Agent: araç kullanımı (kod, arama). Multimodal: metin+görüntü+ses.",
        highlight: "Her trend, bu derste öğrendiğiniz Transformer temelinin üstüne inşa edilir. Temel sağlam = her şey mümkün."
      }
    ]
  },

  {
    id: "paper", week: "B",
    title: "Attention Is All You Need",
    subtitle: { tr: "Vaswani et al. 2017 — Transformer makalesinin interaktif keşfi", en: "Vaswani et al. 2017 — Interactive exploration of the Transformer paper" },
    color: "#6366F1",
    icon: "📄",
    sections: [
      { title: { tr: "Transformer Nedir?", en: "What is a Transformer?" }, content: "2017'de Google araştırmacıları RNN ve CNN'leri tamamen atıp sadece attention kullanan Transformer modelini yaptı. Hem daha iyi sonuç hem çok daha hızlı.", highlight: "Eski yöntemde (RNN) model her sözcüğü SIRAYLA işler. Transformer TÜM sözcüklere aynı anda bakar.", viz: "tePaperGiris" },
      { title: { tr: "Eski Modellerin Sorunları", en: "Problems with Old Models" }, content: "RNN sıralı çalışır → paralel olamaz → yavaş. Uzun cümlelerde erken sözcüklerin bilgisi kaybolur. Gradient patlaması/sönmesi yaşanır.", highlight: "RNN: O(n) adım, Transformer: O(1) adım. Herkes herkesi görür!", viz: "tePaperEskiMod" },
      { title: { tr: "Attention Mekanizması", en: "Attention Mechanism" }, content: "Query: Ne arıyorum? Key: Bende ne var? Value: İşte bilgim. Q·K yüksekse → o kelimenin Value'sundan çok bilgi al!", highlight: "Kütüphane analojisi: Query = aradığınız konu, Key = kitap etiketi, Value = kitabın içeriği.", viz: "tePaperAttention" },
      { title: { tr: "Matematik: Softmax, Dot Product, Multi-Head", en: "Math: Softmax, Dot Product, Multi-Head" }, content: "3 temel formül: ① Dot Product ② Softmax ③ Scaled Dot-Product Attention. Her birini kaydırıcılarla keşfedin.", highlight: "Attention(Q,K,V) = softmax(QKᵀ/√d)V — makalenin en ünlü formülü.", viz: "tePaperMat" },
      { title: { tr: "Mimari: Encoder-Decoder", en: "Architecture: Encoder-Decoder" }, content: "Encoder girdi cümlesini anlar (6 katman). Decoder çıktı cümlesini üretir (6 katman). Her katmanda: Attention + FFN + Residual + LayerNorm.", highlight: "Decoder'da causal mask: gelecek kelimeleri göremez!", viz: "tePaperMimari" },
      { title: { tr: "Pozisyon Kodlama", en: "Positional Encoding" }, content: "Transformer sıra bilmez! sin/cos dalgalarıyla her pozisyona benzersiz bir 'parmak izi' eklenir. Farklı frekanslar farklı ölçeklerde kalıp yakalar.", highlight: "Düşük boyutlar hızlı değişir (tiz), yüksek boyutlar yavaş değişir (bas) — piyano gibi!", viz: "tePaperPoz" },
      { title: { tr: "Eğitim ve Sonuçlar", en: "Training and Results" }, content: "4.5M cümle çifti, 8× P100 GPU, 3.5 gün. EN→DE: 28.4 BLEU (rekor!). EN→FR: 41.8 BLEU. Warmup + label smoothing + dropout.", highlight: "Base model: 65M parametre. Big model: 213M parametre. Bugünkü GPT-4: ~1T+ parametre!", viz: "tePaperEgitim" },
      { title: { tr: "Dünyayı Nasıl Değiştirdi?", en: "How Did It Change the World?" }, content: "90K+ atıf! GPT, BERT, ViT, DALL-E, AlphaFold, Copilot — hepsi Transformer tabanlı. 15 sayfalık makale tüm AI'ı değiştirdi.", highlight: "Sadece dil değil: görüntü (ViT), protein (AlphaFold), müzik (MusicGen), kod (Copilot).", viz: "tePaperEtki" },
    ]
  },
];

// ─── ARCHITECTURE STEPS (for interactive explorer) ──────────────────
const ARCH_STEPS = [
  { key: "embed", title: "Token Embedding", sub: { tr: "ID → Vektör", en: "ID → Vector" }, color: "#0EA5E9", icon: "T",
    desc: "Her karakter (28 token) → 16 boyutlu sürekli vektöre dönüştürülür. Embedding tablosu (28×16) eğitimle öğrenilir.",
    detail: "Basit lookup: 'a'→ID 2→wte[2]. Backpropagation ile anlam kazanır. Çıktıda da aynı matris kullanılır (weight tying).",
    code: `# wte: [28 x 16] öğrenilebilir matris
tok_emb = wte[token_id]
# 'a' (ID=2) -> [0.02, -0.01, 0.015, ...]
# İlk başta rastgele, eğitimle anlam kazanır` },
  { key: "pos", title: "Position Embedding", sub: { tr: "Sıra Bilgisi", en: "Order Info" }, color: "#8B5CF6", icon: "P",
    desc: "Transformer sıra bilmez. Pozisyon embedding her konuma özgü 16-boyutlu vektör ekler.",
    detail: "Öğrenilebilir pozisyon embedding (8×16 matris). x = tok_emb + pos_emb. 'ab' ≠ 'ba' olur.",
    code: `pos_emb = wpe[position_id]  # [8x16]
x = [t + p for t, p in zip(tok_emb, pos_emb)]
# Aynı 'a' pos=0 ve pos=3'te farklı vektör` },
  { key: "norm", title: "RMSNorm", sub: { tr: "Normalizasyon", en: "Normalization" }, color: "#F59E0B", icon: "N",
    desc: "Vektör normalize edilir. LayerNorm'dan ~%30 hızlı: ortalama çıkarma yok.",
    detail: "RMS = sqrt(mean(x²)), scale = 1/sqrt(RMS+ε). Gradient patlamasını engeller.",
    code: `def rmsnorm(x):
  ms = sum(xi*xi for xi in x) / len(x)
  scale = (ms + 1e-5) ** -0.5
  return [xi * scale for xi in x]` },
  { key: "attn", title: "Self-Attention", sub: "Q·Kᵀ/√d → Softmax → V", color: "#10B981", icon: "A",
    desc: "Her token 'kime dikkat etmeliyim?' sorar. 4 head × 4 boyut. Causal mask gelecek tokenları gizler.",
    detail: "Query-Key uyumu → attention ağırlıkları → Value bilgiyi taşır. Her head farklı kalıp öğrenir.",
    code: `q, k, v = linear(x, Wq/Wk/Wv)
for h in range(4):
  scores = Q·K^T / sqrt(4)
  weights = softmax(scores)
  out_h = Σ w[t] × V[t]
# Concat 4×4=16 → linear → 16` },
  { key: "mlp", title: "MLP Block", sub: "Expand → ReLU² → Compress", color: "#EC4899", icon: "M",
    desc: "16→64 genişlet, ReLU² aktive et, 64→16 daralt. ~%40 nöron 'ölü' (sparse).",
    detail: "ReLU² = max(0,x)². Normal ReLU'dan keskin. Residual connection ile girdi eklenir.",
    code: `h = linear(x, fc1)        # 16 → 64
h = [max(0,hi)**2 for hi in h]
out = linear(h, fc2)      # 64 → 16
x = out + x_residual` },
  { key: "output", title: "Output Head", sub: "Logits → Sampling", color: "#EF4444", icon: "O",
    desc: "Embedding matrisinin transpozu ile çarpılarak 28 logit üretilir. Temperature ölçekler, softmax olasılığa çevirir.",
    detail: "Weight tying: çıktı = embedding matrisi. T<1 deterministik, T>1 yaratıcı.",
    code: `logits = linear(x, wte)    # [16]->[28]
logits = [l/T for l in logits]
probs = softmax(logits)
next = random.choices(range(28), weights=probs)` }
];

// ─── REUSABLE UI COMPONENTS ─────────────────────────────────────────

const Spark = ({ data, w = 100, h = 24, color = "#0EA5E9" }) => {
  if (data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rg) * h * 0.85 - h * 0.05}`).join(" ");
  return <svg width={w} height={h}><polygon points={`0,${h} ${pts} ${w},${h}`} fill={`${color}15`}/><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
};

const InfoCard = ({ value, label, color = "#0EA5E9", icon, sub }) => (
  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px 14px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: -10, right: -10, width: 44, height: 44, borderRadius: "50%", background: `${color}08` }} />
    <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
      {icon && <span>{icon}</span>}{label}
    </div>
    <div style={{ fontSize: 21, fontWeight: 700, color, fontFamily: "'Fira Code', monospace" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{sub}</div>}
  </div>
);

const ProbDist = ({ probs, tgt, topK = 14 }) => {
  if (!probs) return null;
  const items = probs.map((p, i) => ({ ch: itos[i], p, i })).sort((a, b) => b.p - a.p).slice(0, topK);
  const mx = items[0]?.p || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>
        Her çubuk bir token olasılığı. <span style={{ color: "#10B981" }}>Yeşil</span> = seçilen token.
      </div>
      {items.map((it, rk) => {
        const isT = it.i === tgt;
        const w = Math.max(3, (it.p / mx) * 100);
        return (
          <div key={it.i} style={{ display: "flex", alignItems: "center", gap: 7, height: 22 }}>
            <span style={{ width: 20, textAlign: "center", fontFamily: "'Fira Code', monospace", fontSize: 17, fontWeight: 700, color: isT ? "#10B981" : "#94A3B8" }}>
              {it.ch === "<BOS>" ? "◆" : it.ch === "<EOS>" ? "■" : it.ch}
            </span>
            <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,0.04)", borderRadius: 7, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${w}%`, borderRadius: 7, background: isT ? "linear-gradient(90deg,#10B981,#34D399)" : rk === 0 ? "linear-gradient(90deg,#0EA5E9,#38BDF8)" : "linear-gradient(90deg,#334155,#475569)", transition: "width .6s cubic-bezier(.34,1.56,.64,1)" }} />
            </div>
            <span style={{ width: 48, textAlign: "right", fontFamily: "'Fira Code', monospace", fontSize: 13, color: isT ? "#10B981" : rk < 3 ? "#94A3B8" : "#475569" }}>
              {(it.p * 100).toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

const AttnMat = ({ weights, tokens, head, setHead }) => {
  if (!weights?.length) return null;
  const nH = weights.length;
  const hColors = ["#0EA5E9", "#8B5CF6", "#10B981", "#F59E0B"];
  return (
    <div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>
        Her hücre, satırdaki token'ın sütundaki token'a ne kadar dikkat ettiğini gösterir. Koyu = yüksek dikkat.
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {Array.from({ length: nH }, (_, h) => (
          <button key={h} onClick={() => setHead(h)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Fira Code', monospace", fontSize: 14, fontWeight: 700, background: head === h ? hColors[h] : "rgba(255,255,255,0.04)", color: head === h ? "#fff" : "#64748B", transition: "all .25s" }}>
            Head {h}
          </button>
        ))}
      </div>
      <div style={{ display: "inline-flex" }}>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
          {tokens.map((t, r) => (
            <div key={r} style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
              <span style={{ fontSize: 14, color: "#94A3B8", fontFamily: "'Fira Code', monospace", fontWeight: 600 }}>
                {t === "<BOS>" ? "◆" : t === "<EOS>" ? "■" : t}
              </span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: "flex" }}>
            {tokens.map((t, c) => (
              <div key={c} style={{ width: 32, height: 22, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <span style={{ fontSize: 12, color: "#64748B", fontFamily: "'Fira Code', monospace" }}>
                  {t === "<BOS>" ? "◆" : t === "<EOS>" ? "■" : t}
                </span>
              </div>
            ))}
          </div>
          {tokens.map((t, r) => {
            const isL = r === tokens.length - 1;
            return (
              <div key={r} style={{ display: "flex" }}>
                {tokens.map((t2, c) => {
                  const msk = c > r;
                  const w = isL && weights[head]?.w[c] || 0;
                  return (
                    <div key={c} style={{
                      width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: 0.5,
                      borderRadius: 4, background: msk ? "rgba(255,255,255,0.01)" : isL ? `rgba(14,165,233,${w})` : `rgba(14,165,233,${c <= r ? 0.06 : 0})`,
                      fontSize: 13, fontFamily: "'Fira Code', monospace", color: isL && w > 0.4 ? "#fff" : isL ? "rgba(14,165,233,.7)" : "#1E293B", transition: "all .4s"
                    }}>
                      {isL ? w.toFixed(1) : msk ? "×" : "·"}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 13, color: "#64748B" }}>
        <span>■ koyu = yüksek dikkat</span>
        <span>× = causal mask (gelecek gizli)</span>
        <span>Son satır = aktif token</span>
      </div>
    </div>
  );
};

const MLPViz = ({ hidden, activated }) => {
  if (!hidden) return null;
  const n = 64, cols = 16;
  const mx = Math.max(...hidden.map(Math.abs), 0.01);
  const mxA = Math.max(...activated.map(Math.abs), 0.01);
  const aliveCount = activated.filter(v => v > 0).length;
  const deadCount = activated.filter(v => v === 0).length;
  return (
    <div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>
        Her kare bir nöron. <span style={{ color: "#0EA5E9" }}>Mavi</span> = pozitif, <span style={{ color: "#EF4444" }}>Kırmızı</span> = negatif. ReLU² sonrası negatifler sıfıra düşer (ölü nöronlar).
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 6, fontWeight: 600 }}>Linear → 64 nöron</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 1.5, width: cols * 18 }}>
            {hidden.slice(0, n).map((v, i) => {
              const int = Math.abs(v) / mx;
              return <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: v > 0 ? `rgba(14,165,233,${int})` : `rgba(239,68,68,${int})`, transition: "all .3s" }} title={`n${i}: ${v.toFixed(3)}`} />;
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 21, color: "#64748B", fontWeight: 700, padding: "30px 0" }}>→ ReLU² →</div>
        <div>
          <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 6, fontWeight: 600 }}>Aktivasyon sonrası</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 1.5, width: cols * 18 }}>
            {activated.slice(0, n).map((v, i) => {
              const dead = v === 0;
              const int = Math.min(1, v / mxA);
              return <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: dead ? "rgba(255,255,255,0.02)" : `rgba(16,185,129,${int})`, border: dead ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "all .3s" }} title={`n${i}: ${v.toFixed(3)}${dead ? (lang==="tr"?" ÖLÜ":" DEAD") : ""}`} />;
            })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 16, fontSize: 14, color: "#64748B" }}>
        <span>{lang === "tr" ? "Aktif:" : "Active:"} <strong style={{ color: "#10B981" }}>{aliveCount}</strong>/64</span>
        <span>{lang === "tr" ? "Ölü:" : "Dead:"} <strong style={{ color: "#EF4444" }}>{deadCount}</strong>/64</span>
        <span>Sparsity: <strong style={{ color: "#F59E0B" }}>{((deadCount / 64) * 100).toFixed(0)}%</strong></span>
      </div>
    </div>
  );
};

const EmbedViz = ({ dbg }) => {
  if (!dbg) return null;
  const sections = [
    { label: "Token Embedding", data: dbg.te, desc: lang === "tr" ? "wte[token_id] — karakter vektörü" : "wte[token_id] — character vector" },
    { label: "+ Position Emb", data: dbg.pe, desc: lang === "tr" ? "wpe[pos_id] — konum vektörü" : "wpe[pos_id] — position vector" },
    { label: lang === "tr" ? "= Birleşik" : "= Combined", data: dbg.x0, desc: lang === "tr" ? "tok_emb + pos_emb — nihai girdi" : "tok_emb + pos_emb — final input" }
  ];
  return (
    <div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 10 }}>
        Her çubuk vektörün bir boyutu. <span style={{ color: "#0EA5E9" }}>Mavi</span> = pozitif, <span style={{ color: "#EF4444" }}>Kırmızı</span> = negatif. Yoğunluk = büyüklük.
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {sections.map((sec, si) => (
          <div key={si}>
            <div style={{ fontSize: 15, color: "#E2E8F0", marginBottom: 2, fontWeight: 600 }}>{sec.label}</div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>{sec.desc}</div>
            <div style={{ display: "flex", gap: 2 }}>
              {sec.data.map((v, i) => {
                const mx = Math.max(...sec.data.map(Math.abs));
                return <div key={i} style={{ width: 14, height: 32, borderRadius: 3, background: v > 0 ? `rgba(14,165,233,${Math.abs(v) / mx})` : `rgba(239,68,68,${Math.abs(v) / mx})` }} title={`dim${i}: ${v.toFixed(4)}`} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Pipeline = ({ steps, active }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    {steps.map((s, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: i <= active ? "#fff" : "#475569", transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
          transform: i === active ? "scale(1.2)" : "scale(1)", background: i <= active ? s.color : "rgba(255,255,255,0.03)",
          boxShadow: i === active ? `0 0 16px ${s.color}50` : "none", opacity: i <= active ? 1 : 0.35
        }}>
          {s.icon}
        </div>
        {i < steps.length - 1 && <div style={{ width: 18, height: 2, background: i < active ? s.color : "rgba(255,255,255,0.05)", borderRadius: 1, transition: "all .3s" }} />}
      </div>
    ))}
  </div>
);

const CodeBlock = ({ code, title }) => (
  <div style={{ background: "#0A0F1A", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
    <div style={{ padding: "6px 14px", background: "rgba(255,255,255,.03)", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444" }} />
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B" }} />
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981" }} />
      <span style={{ marginLeft: 6, fontSize: 13, color: "#475569" }}>{title || "microgpt.py"}</span>
    </div>
    <pre style={{ margin: 0, padding: 16, fontSize: 14.5, lineHeight: 1.7, fontFamily: "'Fira Code', monospace", color: "#94A3B8", whiteSpace: "pre-wrap", overflowX: "auto" }}>{code}</pre>
  </div>
);

const DimFlow = ({ activeIdx = -1 }) => {
  const dims = [
    { l: "ID", d: "1", c: "#64748B" }, { l: "Emb", d: "[16]", c: "#0EA5E9" },
    { l: "+Pos", d: "[16]", c: "#8B5CF6" }, { l: "Norm", d: "[16]", c: "#F59E0B" },
    { l: "QKV", d: "4×[4]", c: "#10B981" }, { l: "MLP↑", d: "[64]", c: "#EC4899" },
    { l: "MLP↓", d: "[16]", c: "#EC4899" }, { l: "Out", d: "[28]", c: "#EF4444" }
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
      {dims.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{
            padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: i <= activeIdx ? `${d.c}20` : "rgba(255,255,255,0.02)",
            color: i <= activeIdx ? d.c : "#1E293B",
            border: `1px solid ${i <= activeIdx ? `${d.c}40` : "transparent"}`,
            transition: "all .3s"
          }}>
            {d.l} <span style={{ fontFamily: "'Fira Code', monospace" }}>{d.d}</span>
          </div>
          {i < 7 && <span style={{ color: "#1E293B", fontSize: 13 }}>→</span>}
        </div>
      ))}
    </div>
  );
};

// ─── LECTURE VISUALIZATION COMPONENTS ────────────────────────────────
const VB = { bg: "#0A0F1A", card: "#111827", border: "rgba(255,255,255,0.06)", muted: "#64748B", dim: "#475569", txt: "#94A3B8" };
const VizBox = ({ children, title, color = "#0EA5E9" }) => (<div style={{ margin: "16px 0", background: VB.bg, border: `1px solid ${VB.border}`, borderRadius: 14, overflow: "hidden" }}>{title && <div style={{ padding: "8px 16px", borderBottom: `1px solid ${VB.border}`, display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} /><span style={{ fontSize: 14, fontWeight: 600, color }}>{title}</span></div>}<div style={{ padding: 16 }}>{children}</div></div>);
const FlowArrow = ({ color = "#475569" }) => (<div style={{ display: "flex", alignItems: "center", padding: "0 2px", color, fontSize: 17, fontWeight: 700 }}>→</div>);
const FlowBox = ({ label, sub, color, small, active }) => (<div style={{ padding: small ? "5px 10px" : "8px 14px", borderRadius: 8, minWidth: small ? 50 : 70, background: active ? `${color}20` : `${color}0A`, border: `1.5px solid ${color}30`, textAlign: "center", transition: "all .3s", transform: active ? "scale(1.05)" : "scale(1)", boxShadow: active ? `0 0 12px ${color}25` : "none" }}><div style={{ fontSize: small ? 10 : 12, fontWeight: 700, color, fontFamily: "'Fira Code', monospace" }}>{label}</div>{sub && <div style={{ fontSize: 11, color: VB.muted, marginTop: 2 }}>{sub}</div>}</div>);
const StatBox = ({ value, label, color }) => (<div style={{ textAlign: "center", padding: "6px 10px", background: `${color}08`, borderRadius: 8, border: `1px solid ${color}15`, minWidth: 60 }}><div style={{ fontSize: 19, fontWeight: 800, color, fontFamily: "'Fira Code', monospace" }}>{value}</div><div style={{ fontSize: 11, color: VB.muted }}>{label}</div></div>);

const CoursePipelineViz = () => { const [active, setActive] = useState(0); const [autoPlay, setAutoPlay] = useState(true); useEffect(() => { if (!autoPlay) return; const t = setInterval(() => setActive(a => (a+1)%7), 2500); return () => clearInterval(t); }, [autoPlay]); const stages = [{l:lang==="tr"?"Veri":"Data",s:"input.txt",c:"#0EA5E9",i:"📄",week:lang==="tr"?"Hafta 1":"Week 1",desc:lang==="tr"?"Metin dosyası okunur. microGPT'de Türk isimleri (32K satır). Her karakter bir token olur — vocab: a-z + boşluk = 27 sembol.":"Text file is read. In microGPT, English names (32K lines). Each character becomes a token — vocab: a-z + space = 27 symbols."},{l:"Tokenizer",s:"chars→ids",c:"#8B5CF6",i:"🔤",week:lang==="tr"?"Hafta 1":"Week 1",desc:lang==="tr"?"Karakterler sayılara dönüşür: 'emma' → [BOS, 4, 12, 12, 0, BOS]. BOS başlangıç/bitiş işareti. Her ID embedding tablosunda bir satır seçer.":"Characters become numbers: 'emma' → [BOS, 4, 12, 12, 0, BOS]. BOS marks start/end. Each ID selects a row in the embedding table."},{l:"Model",s:"Emb+Attn+MLP",c:"#10B981",i:"🧠",week:lang==="tr"?"Hafta 3-4":"Week 3-4",desc:lang==="tr"?"Token ID'ler 16 boyutlu vektörlere dönüşür (embedding). Attention her tokenin diğerlerinden bilgi almasını sağlar. MLP bu bilgiyi işler.":"Token IDs become 16-dimensional vectors (embedding). Attention lets each token gather info from others. MLP processes this info."},{l:"Loss",s:"Cross-Entropy",c:"#EF4444",i:"📉",week:lang==="tr"?"Hafta 5":"Week 5",desc:lang==="tr"?"Model 'e' dediyse ama doğru cevap 'm' ise, kayıp yüksek olur. Kayıp = -log(doğru tokene verilen olasılık). Düşük loss = iyi model.":"If model said 'e' but correct answer is 'm', loss is high. Loss = -log(probability given to correct token). Low loss = good model."},{l:"Backprop",s:"Autograd",c:"#F59E0B",i:"⛓",week:lang==="tr"?"Hafta 2":"Week 2",desc:lang==="tr"?"Kayıp geriye doğru yayılır. Her parametreye 'bu kaybı azaltmak için seni ne kadar değiştirmeliyim?' sorusunun cevabı hesaplanır (gradient).":"Loss propagates backward. For each parameter: 'how much should I change you to reduce this loss?' is computed (gradient)."},{l:"Update",s:"Adam",c:"#EC4899",i:"🔧",week:lang==="tr"?"Hafta 5":"Week 5",desc:lang==="tr"?"Gradient yönünde küçük bir adım at: w = w - lr × grad. Adam optimizer momentum ve adaptif lr ile bunu akıllıca yapar. Sonra grad sıfırlanır.":"Take a small step in gradient direction: w = w - lr × grad. Adam optimizer does this smartly with momentum and adaptive lr. Then grad is zeroed."},{l:"Inference",s:"Sampling",c:"#6366F1",i:"✨",week:lang==="tr"?"Hafta 6":"Week 6",desc:lang==="tr"?"Eğitilmiş model yeni isimler üretir: 'A' ver → 'Ahmet' çıkar. Her adımda olasılık dağılımından bir token örneklenir. Temperature yaratıcılığı kontrol eder.":"Trained model generates new names: give 'A' → get 'Ahmet'. Each step samples a token from the probability distribution. Temperature controls creativity."}]; return (<VizBox title={lang === "tr" ? "7 Aşamalı Pipeline — Tüm Ders Haritası" : "7-Stage Pipeline — Full Course Map"} color="#0EA5E9"><div style={{fontSize:13,color:"#94A3B8",marginBottom:10,lineHeight:1.6}}>{lang === "tr" ? (<>Aşağıdaki kutuların her biri microGPT'nin bir adımını temsil eder. <strong style={{color:"#F59E0B"}}>Tıklayarak</strong> detayları görün.</>) : (<>Each box represents a step of microGPT. <strong style={{color:"#F59E0B"}}>Click</strong> to see details.</>)</div><div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"center"}}>{stages.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div onClick={()=>{setAutoPlay(false);setActive(i);}} style={{padding:"10px 12px",borderRadius:10,textAlign:"center",minWidth:80,cursor:"pointer",background:i===active?`${s.c}20`:`${s.c}08`,border:`1.5px solid ${i===active?s.c:`${s.c}20`}`,transform:i===active?"scale(1.08)":"scale(1)",transition:"all .4s cubic-bezier(.34,1.56,.64,1)"}}><div style={{fontSize:21,marginBottom:2}}>{s.i}</div><div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.l}</div><div style={{fontSize:11,color:VB.muted}}>{s.s}</div></div>{i<6&&<FlowArrow color={i===active?s.c:VB.dim}/>}</div>))}</div><div style={{marginTop:12,padding:"14px 16px",borderRadius:12,background:`${stages[active].c}08`,border:`1.5px solid ${stages[active].c}25`,transition:"all .4s"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:16,fontWeight:800,color:stages[active].c}}>{stages[active].i} {stages[active].l}</span><span style={{fontSize:12,padding:"2px 8px",borderRadius:6,background:`${stages[active].c}15`,color:stages[active].c,fontWeight:600}}>{stages[active].week}</span></div><div style={{fontSize:14,color:"#CBD5E1",lineHeight:1.7}}>{stages[active].desc}</div></div><div style={{marginTop:8,padding:"6px 12px",background:"rgba(245,158,11,.06)",borderRadius:8,textAlign:"center"}}><span style={{fontSize:13,color:"#F59E0B"}}>{lang === "tr" ? "← Eğitim Döngüsü: forward → loss → backward → update → tekrarla (500+ adım) →" : "← Training Loop: forward → loss → backward → update → repeat (500+ steps) →"}</span></div></VizBox>); };

const TokenFlowViz = () => { const steps = [{l:'"anna"',s:lang==="tr"?"Girdi":"Input",c:"#0EA5E9"},{l:"a n n a",s:lang==="tr"?"Karakter Ayır":"Split Chars",c:"#8B5CF6"},{l:"2 15 15 2",s:lang==="tr"?"ID Çevir":"To IDs",c:"#10B981"},{l:"0 2 15 15 2 0",s:"+BOS",c:"#F59E0B"}]; return (<VizBox title={lang === "tr" ? "Tokenization Akışı" : "Tokenization Flow"} color="#8B5CF6"><div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center",flexWrap:"wrap"}}>{steps.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6}}><FlowBox label={s.l} sub={s.s} color={s.c}/>{i<3&&<FlowArrow color={s.c}/>}</div>))}</div><div style={{display:"flex",gap:16,marginTop:14,justifyContent:"center",flexWrap:"wrap"}}><div style={{background:VB.card,padding:"8px 14px",borderRadius:8}}><span style={{fontSize: 12,color:VB.muted}}>Eğitim çiftleri: </span><span style={{fontSize: 13,fontFamily:"'Fira Code',monospace",color:"#10B981"}}>(BOS→a),(a→n),(n→n),(n→a),(a→BOS)</span></div></div></VizBox>); };

const EmbeddingFlowViz = () => { const bars = useMemo(()=>Array.from({length:16},()=>-0.3+Math.random()*0.6),[]); const posBars = useMemo(()=>Array.from({length:16},()=>-0.1+Math.random()*0.2),[]); const sumBars = useMemo(()=>bars.map((b,i)=>b+posBars[i]),[bars,posBars]); const mx = Math.max(...bars.map(Math.abs),...posBars.map(Math.abs),...sumBars.map(Math.abs),0.01); const BarRow = ({data,label,color})=>(<div><div style={{fontSize: 13,color,fontWeight:600,marginBottom:4}}>{label}</div><div style={{display:"flex",gap:2}}>{data.map((v,i)=>(<div key={i} style={{width:16,height:28,borderRadius:3,background:v>0?`rgba(14,165,233,${Math.abs(v)/mx})`:`rgba(239,68,68,${Math.abs(v)/mx})`}} title={`dim${i}: ${v.toFixed(3)}`}/>))}</div></div>); return (<VizBox title={lang === "tr" ? "Embedding → Position → Birleşim" : "Embedding → Position → Combination"} color="#0EA5E9"><div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}><BarRow data={bars} label="Token Emb (wte['a'])" color="#0EA5E9"/><div style={{display:"flex",alignItems:"center",height:42,fontSize: 19,color:VB.muted,fontWeight:700}}>+</div><BarRow data={posBars} label="Pos Emb (wpe[0])" color="#8B5CF6"/><div style={{display:"flex",alignItems:"center",height:42,fontSize: 19,color:VB.muted,fontWeight:700}}>=</div><BarRow data={sumBars} label="x = tok + pos" color="#10B981"/></div><div style={{marginTop:8,fontSize: 12,color:VB.dim}}>Her çubuk = 1 boyut. Mavi=pozitif, Kırmızı=negatif. 16-boyutlu vektör.</div></VizBox>); };

const CompGraphViz = () => { const nodes = [{l:"a",v:"2",g:"3",cx:13,cy:20,c:"#0EA5E9"},{l:"b",v:"3",g:"2",cx:13,cy:65,c:"#0EA5E9"},{l:"d=a×b",v:"6",g:"1",cx:53,cy:37,c:"#F59E0B"},{l:"c",v:"1",g:"1",cx:53,cy:78,c:"#0EA5E9"},{l:"L=d+c",v:"7",g:"1",cx:90,cy:55,c:"#EF4444"}]; return (<VizBox title={lang === "tr" ? "Hesaplama Grafı — L = (a × b) + c" : "Computation Graph — L = (a × b) + c"} color="#F59E0B"><div style={{display:"flex",gap:20,flexWrap:"wrap"}}><svg viewBox="0 0 120 95" style={{width:320,height:250}}><line x1="22" y1="24" x2="42" y2="37" stroke="#0EA5E9" strokeWidth="0.7" strokeDasharray="2,2"/><line x1="22" y1="68" x2="42" y2="42" stroke="#0EA5E9" strokeWidth="0.7" strokeDasharray="2,2"/><line x1="64" y1="40" x2="80" y2="55" stroke="#F59E0B" strokeWidth="0.7" strokeDasharray="2,2"/><line x1="62" y1="80" x2="80" y2="60" stroke="#0EA5E9" strokeWidth="0.7" strokeDasharray="2,2"/><text x="2" y="8" fill="#0EA5E9" fontSize="4" fontWeight="600">FORWARD →</text><text x="82" y="8" fill="#EF4444" fontSize="4" fontWeight="600">← BACKWARD</text>{nodes.map((n,i)=>(<g key={i}><ellipse cx={n.cx} cy={n.cy} rx="13" ry="8" fill="#111827" stroke={n.c} strokeWidth="0.7"/><text x={n.cx} y={n.cy-1} fill={n.c} fontSize="4" fontWeight="700" textAnchor="middle">{n.l}</text><text x={n.cx} y={n.cy+5} fill="#64748B" fontSize="2.5" textAnchor="middle">data={n.v} grad={n.g}</text></g>))}</svg><div style={{flex:1,minWidth:200}}><div style={{fontSize: 14,fontWeight:600,color:"#F59E0B",marginBottom:6}}>{lang === "tr" ? "Chain Rule Adımları" : "Chain Rule Steps"}</div>{[{eq:"∂L/∂L = 1",c:"#EF4444",n:lang==="tr"?"başlangıç":"start"},{eq:"∂L/∂d = 1×1 = 1",c:"#F59E0B",n:"∂(d+c)/∂d"},{eq:"∂L/∂c = 1×1 = 1",c:"#0EA5E9",n:"∂(d+c)/∂c"},{eq:"∂L/∂a = 1×b = 3",c:"#0EA5E9",n:"∂(a×b)/∂a=b"},{eq:"∂L/∂b = 1×a = 2",c:"#0EA5E9",n:"∂(a×b)/∂b=a"}].map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 8px",borderRadius:6,marginBottom:3,background:`${s.c}08`}}><span style={{fontSize: 14,fontFamily:"'Fira Code',monospace",fontWeight:600,color:s.c}}>{s.eq}</span><span style={{fontSize: 12,color:VB.dim}}>{s.n}</span></div>))}<div style={{marginTop:8,padding:"6px 10px",borderRadius:6,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.15)"}}><span style={{fontSize: 12,color:"#EF4444",fontWeight:600}}>{lang === "tr" ? "Kritik: grad += (= değil!) — Gradientler TOPLANIR." : "Critical: grad += (not =!) — Gradients ACCUMULATE."}</span></div></div></div></VizBox>); };

const OpGradTableViz = () => { const ops = [{op:"z = a + b",g:"∂z/∂a=1, ∂z/∂b=1",c:"#0EA5E9"},{op:"z = a × b",g:"∂z/∂a=b, ∂z/∂b=a",c:"#10B981"},{op:"z = log(a)",g:"∂z/∂a = 1/a",c:"#8B5CF6"},{op:"z = exp(a)",g:"∂z/∂a = exp(a)",c:"#F59E0B"},{op:"z = relu(a)",g:"∂z/∂a = (a>0?1:0)",c:"#EC4899"},{op:"z = aⁿ",g:"∂z/∂a = n·aⁿ⁻¹",c:"#EF4444"}]; return (<VizBox title={lang === "tr" ? "Operatör → Yerel Gradient Tablosu" : "Operator → Local Gradient Table"} color="#10B981"><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>{ops.map((o,i)=>(<div key={i} style={{padding:"10px 12px",borderRadius:8,background:`${o.c}08`,borderLeft:`3px solid ${o.c}`}}><div style={{fontSize: 15,fontWeight:700,fontFamily:"'Fira Code',monospace",color:o.c}}>{o.op}</div><div style={{fontSize: 13,fontFamily:"'Fira Code',monospace",color:VB.txt,marginTop:3}}>{o.g}</div></div>))}</div></VizBox>); };

const ArchPipelineViz = () => { const [hov,setHov]=useState(-1); const pipe=[{l:"Token\nEmbed",s:"wte[id]→[16]",c:"#0EA5E9"},{l:"Pos\nEmbed",s:"+wpe[pos]",c:"#8B5CF6"},{l:"RMS\nNorm",s:"x/√(rms+ε)",c:"#F59E0B"},{l:"Self\nAttn",s:"Q·Kᵀ/√d→V",c:"#10B981"},{l:"MLP",s:"fc1→ReLU²→fc2",c:"#EC4899"},{l:"LM\nHead",s:"→logits[28]",c:"#EF4444"}]; return (<VizBox title="GPT Forward Pass — Tam Mimari" color="#10B981"><div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center",flexWrap:"wrap"}}>{pipe.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4}} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(-1)}><div style={{padding:"12px 14px",borderRadius:10,textAlign:"center",minWidth:85,background:hov===i?`${p.c}20`:`${p.c}0A`,border:`1.5px solid ${hov===i?p.c:`${p.c}30`}`,transform:hov===i?"scale(1.08)":"scale(1)",transition:"all .3s cubic-bezier(.34,1.56,.64,1)",boxShadow:hov===i?`0 0 16px ${p.c}20`:"none"}}><div style={{fontSize: 15,fontWeight:700,color:p.c,whiteSpace:"pre-line",lineHeight:1.3}}>{p.l}</div><div style={{fontSize: 11,color:VB.muted,marginTop:3,fontFamily:"'Fira Code',monospace"}}>{p.s}</div></div>{i<5&&<FlowArrow color={p.c}/>}</div>))}</div><div style={{display:"flex",gap:6,marginTop:12,justifyContent:"center",flexWrap:"wrap"}}><div style={{padding:"4px 10px",borderRadius:6,background:"rgba(16,185,129,.08)",fontSize: 12,color:"#10B981",fontFamily:"'Fira Code',monospace"}}>↰ Residual: x = attn(norm(x)) + x</div><div style={{padding:"4px 10px",borderRadius:6,background:"rgba(236,72,153,.08)",fontSize: 12,color:"#EC4899",fontFamily:"'Fira Code',monospace"}}>↰ Residual: x = mlp(norm(x)) + x</div></div></VizBox>); };

const AttentionFlowViz = () => { const hc=["#0EA5E9","#10B981","#F59E0B","#EC4899"]; return (<VizBox title={lang === "tr" ? "Self-Attention — Detaylı Akış" : "Self-Attention — Detailed Flow"} color="#10B981"><div style={{display:"flex",gap:24,flexWrap:"wrap"}}><div><div style={{fontSize: 14,fontWeight:600,color:"#0EA5E9",marginBottom:8}}>{lang === "tr" ? "1. Q, K, V Üretimi" : "1. Q, K, V Generation"}</div><div style={{display:"flex",alignItems:"center",gap:6}}><FlowBox label="x [16]" color="#94A3B8" small/><div style={{display:"flex",flexDirection:"column",gap:4}}>{[{l:"Q",c:"#10B981"},{l:"K",c:"#F59E0B"},{l:"V",c:"#EC4899"}].map(p=>(<div key={p.l} style={{display:"flex",alignItems:"center",gap:4}}><FlowArrow color={VB.dim}/><FlowBox label={`W${p.l.toLowerCase()}·x`} color={p.c} small/><FlowArrow color={VB.dim}/><FlowBox label={`${p.l} [16]`} color={p.c} small/></div>))}</div></div></div><div><div style={{fontSize: 14,fontWeight:600,color:"#10B981",marginBottom:8}}>{lang === "tr" ? "2. Scaled Dot-Product" : "2. Scaled Dot-Product"}</div><div style={{display:"flex",alignItems:"center",gap:4}}>{[{l:"Q·Kᵀ",c:"#10B981"},{l:"÷√d",c:"#F59E0B"},{l:"Softmax",c:"#8B5CF6"},{l:"×V",c:"#EC4899"}].map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4}}><FlowBox label={s.l} color={s.c} small active/>{i<3&&<FlowArrow color={VB.dim}/>}</div>))}</div><div style={{fontSize: 14,fontWeight:600,color:"#8B5CF6",marginTop:12,marginBottom:6}}>{lang === "tr" ? "3. Multi-Head (4 × 4 dim)" : "3. Multi-Head (4 × 4 dim)"}</div><div style={{display:"flex",gap:4}}>{[0,1,2,3].map(h=>(<div key={h} style={{flex:1,padding:"8px 6px",borderRadius:8,textAlign:"center",background:`${hc[h]}10`,border:`1.5px solid ${hc[h]}30`}}><div style={{fontSize: 13,fontWeight:700,color:hc[h]}}>Head {h}</div><div style={{fontSize: 11,color:VB.muted,fontFamily:"'Fira Code',monospace"}}>q[{h*4}:{h*4+4}]</div></div>))}</div></div></div></VizBox>); };

const CausalMaskViz = () => { const toks=["B","a","n","n","a"]; const wts=[[1.0],[.4,.6],[.2,.3,.5],[.1,.2,.3,.4],[.05,.15,.2,.25,.35]]; return (<VizBox title="Causal Attention Matrix" color="#F59E0B"><div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}><div><div style={{display:"flex",marginLeft:28}}>{toks.map((t,i)=>(<div key={i} style={{width:36,textAlign:"center",fontSize: 13,color:VB.muted,fontFamily:"'Fira Code',monospace"}}>{t}</div>))}</div>{toks.map((t,r)=>(<div key={r} style={{display:"flex",alignItems:"center"}}><div style={{width:24,fontSize: 13,color:VB.muted,fontFamily:"'Fira Code',monospace",textAlign:"right",paddingRight:4}}>{t}</div>{toks.map((_,c)=>{const masked=c>r;const w=!masked&&wts[r]?(wts[r][c]||0):0;return(<div key={c} style={{width:34,height:34,margin:1,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 11,fontFamily:"'Fira Code',monospace",background:masked?"rgba(255,255,255,0.02)":`rgba(16,185,129,${w*0.9})`,color:masked?"#1E293B":w>0.3?"#fff":"rgba(16,185,129,.6)"}}>{masked?"✗":w.toFixed(1)}</div>);})}</div>))}<div style={{marginTop:6,fontSize: 12,color:VB.dim}}><span style={{color:"#10B981"}}>■</span> koyu=yüksek dikkat <span style={{color:"#1E293B"}}>✗</span>=mask</div></div><div style={{flex:1,minWidth:180}}><div style={{fontSize: 13,color:VB.txt,lineHeight:1.6}}><strong style={{color:"#F59E0B"}}>Causal masking:</strong> Her token sadece kendisi ve önceki token'lara bakabilir.<br/><br/><strong style={{color:"#10B981"}}>Bu kodda mask yok!</strong> KV cache doğal masking sağlar — gelecek tokenlar cache'te yok.</div></div></div></VizBox>); };

const MLPFlowViz = () => { const neurons=useMemo(()=>Array.from({length:64},()=>Math.random()>0.38),[]); return (<VizBox title={lang === "tr" ? "MLP Block — Genişlet → Aktive Et → Daralt" : "MLP Block — Expand → Activate → Compress"} color="#EC4899"><div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center",flexWrap:"wrap",marginBottom:12}}>{[{l:"x [16]",c:"#94A3B8"},{l:"RMSNorm",c:"#F59E0B"},{l:"fc1: 16→64",c:"#8B5CF6"},{l:"ReLU²",c:"#EC4899"},{l:"fc2: 64→16",c:"#10B981"},{l:"+residual",c:"#EF4444"}].map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4}}><FlowBox label={s.l} color={s.c} small/>{i<5&&<FlowArrow color={VB.dim}/>}</div>))}</div><div><div style={{fontSize: 13,color:VB.muted,marginBottom:6}}>64 Nöron (ReLU² sonrası): <span style={{color:"#EC4899"}}>■</span> {lang === "tr" ? "aktif" : "active"} <span style={{color:"#1E293B"}}>□</span> {lang === "tr" ? "ölü" : "dead"}</div><div style={{display:"flex",flexWrap:"wrap",gap:2,maxWidth:340}}>{neurons.map((a,i)=>(<div key={i} style={{width:16,height:16,borderRadius:3,background:a?"rgba(236,72,153,0.5)":"rgba(255,255,255,0.03)",border:a?"none":"1px solid rgba(255,255,255,0.04)"}}/>))}</div><div style={{marginTop:6,display:"flex",gap:16,fontSize: 13,color:VB.muted}}><span>{lang === "tr" ? "Aktif:" : "Active:"} <strong style={{color:"#10B981"}}>{neurons.filter(Boolean).length}</strong>/64</span><span>{lang === "tr" ? "Ölü:" : "Dead:"} <strong style={{color:"#EF4444"}}>{neurons.filter(n=>!n).length}</strong>/64</span><span>Sparsity: <strong style={{color:"#F59E0B"}}>{((neurons.filter(n=>!n).length/64)*100).toFixed(0)}%</strong></span></div></div></VizBox>); };

const ParamDistViz = () => { const params=[{l:"wte (Token Emb)",v:432,c:"#0EA5E9",d:"27×16"},{l:"wpe (Pos Emb)",v:128,c:"#8B5CF6",d:"8×16"},{l:"Q,K,V,O (Attn)",v:1024,c:"#10B981",d:"4×[16×16]"},{l:"fc1+fc2 (MLP)",v:2048,c:"#EC4899",d:"64×16+16×64"}]; const total=params.reduce((s,p)=>s+p.v,0); const mx=Math.max(...params.map(p=>p.v)); return (<VizBox title={lang === "tr" ? "Parametre Dağılımı — 3,648 Değer" : "Parameter Distribution — 3,648 Values"} color="#EC4899"><div style={{display:"flex",gap:20,flexWrap:"wrap"}}><div style={{flex:1,minWidth:260}}>{params.map((p,i)=>(<div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize: 13,color:p.c,fontWeight:600}}>{p.l}</span><span style={{fontSize: 13,fontFamily:"'Fira Code',monospace",color:VB.muted}}>{p.v} ({((p.v/total)*100).toFixed(0)}%)</span></div><div style={{height:14,background:"rgba(255,255,255,0.03)",borderRadius:7,overflow:"hidden"}}><div style={{height:"100%",width:`${(p.v/mx)*100}%`,borderRadius:7,background:p.c,transition:"width .6s"}}/></div><div style={{fontSize: 11,color:VB.dim,marginTop:2}}>{p.d}</div></div>))}</div><div style={{display:"flex",flexDirection:"column",gap:6}}><StatBox value="3,648" label=lang === "tr" ? "Toplam" : "Total" color="#0EA5E9"/><StatBox value="56%" label=lang === "tr" ? "MLP Payı" : "MLP Share" color="#EC4899"/><StatBox value="28%" label=lang === "tr" ? "Attn Payı" : "Attn Share" color="#10B981"/></div></div></VizBox>); };

const TrainingCycleViz = () => { const [phase,setPhase]=useState(0); useEffect(()=>{const t=setInterval(()=>setPhase(p=>(p+1)%4),1200);return()=>clearInterval(t);},[]);const phases=[{l:"FORWARD",s:"gpt(tok,pos)→logits",c:"#0EA5E9",i:"→"},{l:"LOSS",s:"CE=-log(P_target)",c:"#EF4444",i:"📉"},{l:"BACKWARD",s:"loss.backward()→grads",c:"#F59E0B",i:"←"},{l:"UPDATE",s:"p-=lr×m̂/(√v̂+ε)",c:"#10B981",i:"🔧"}]; return (<VizBox title={lang === "tr" ? "Eğitim Döngüsü — Cycle" : "Training Loop — Cycle"} color="#F59E0B"><div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>{phases.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10}}><div style={{padding:"14px 18px",borderRadius:12,textAlign:"center",minWidth:110,background:i===phase?`${p.c}20`:`${p.c}08`,border:`2px solid ${i===phase?p.c:`${p.c}20`}`,transform:i===phase?"scale(1.1)":"scale(1)",transition:"all .4s cubic-bezier(.34,1.56,.64,1)",boxShadow:i===phase?`0 0 20px ${p.c}30`:"none"}}><div style={{fontSize: 19,marginBottom:2}}>{p.i}</div><div style={{fontSize: 16,fontWeight:700,color:p.c}}>{p.l}</div><div style={{fontSize: 11,fontFamily:"'Fira Code',monospace",color:VB.muted,marginTop:2}}>{p.s}</div></div>{i<3&&<div style={{fontSize: 19,color:i===phase?p.c:VB.dim,transition:"color .3s"}}>→</div>}</div>))}</div><div style={{marginTop:10,textAlign:"center",fontSize: 13,color:VB.muted}}>{lang === "tr" ? "Her step tekrarlanır" : "Each step repeats"} • <span style={{color:"#EF4444"}}>Kritik: p.grad = 0</span></div></VizBox>); };

const LossTableViz = () => { const rows=[{p:"1.0",l:"0.00",n:lang === "tr" ? "Mükemmel" : "Perfect",c:"#10B981"},{p:"0.5",l:"0.69",n:lang === "tr" ? "Yarı yarıya" : "Half & half",c:"#F59E0B"},{p:"0.1",l:"2.30",n:lang === "tr" ? "Kötü" : "Bad",c:"#EF4444"},{p:"1/27",l:"3.33",n:lang === "tr" ? "Rastgele(başlangıç)" : "Random(start)",c:"#EF4444"}]; return (<VizBox title="Cross-Entropy: P(target) vs Loss" color="#EF4444"><div style={{display:"flex",gap:20,flexWrap:"wrap"}}><div>{rows.map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:6,marginBottom:4,background:`${r.c}08`}}><span style={{width:60,fontSize: 14,fontFamily:"'Fira Code',monospace",color:VB.txt}}>P={r.p}</span><span style={{width:50,fontSize: 14,fontFamily:"'Fira Code',monospace",fontWeight:700,color:r.c}}>L={r.l}</span><span style={{fontSize: 13,color:VB.muted}}>{r.n}</span></div>))}</div><div style={{padding:"10px 14px",background:VB.card,borderRadius:8}}><div style={{fontSize: 16,fontFamily:"'Fira Code',monospace",color:"#EF4444",fontWeight:700}}>L = -(1/n) Σ log P(target_i)</div><div style={{fontSize: 13,color:VB.muted,marginTop:6,lineHeight:1.5}}>Düşük P → yüksek sürpriz → yüksek loss<br/>Başlangıç: L ≈ 3.33 = -log(1/27)</div></div></div></VizBox>); };

const AdamEvolutionViz = () => { const opts=[{l:"SGD",eq:"p-=lr×g",d:lang==="tr"?"Basit":"Simple",c:"#64748B"},{l:"Momentum",eq:"m=β₁m+g",d:lang==="tr"?"Yön bilgisi":"Direction info",c:"#F59E0B"},{l:"RMSprop",eq:"v=β₂v+g²",d:lang==="tr"?"Adaptif":"Adaptive",c:"#8B5CF6"},{l:"Adam ★",eq:"m̂/(√v̂+ε)",d:lang==="tr"?"Birleşik":"Combined",c:"#10B981"}]; return (<VizBox title="SGD → Momentum → RMSprop → Adam" color="#10B981"><div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center",flexWrap:"wrap"}}>{opts.map((o,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6}}><div style={{padding:"10px 14px",borderRadius:10,textAlign:"center",minWidth:100,background:`${o.c}0A`,border:`1.5px solid ${o.c}30`}}><div style={{fontSize: 15,fontWeight:700,color:o.c}}>{o.l}</div><div style={{fontSize: 12,fontFamily:"'Fira Code',monospace",color:VB.muted,marginTop:2}}>{o.eq}</div><div style={{fontSize: 11,color:VB.dim,marginTop:2}}>{o.d}</div></div>{i<3&&<FlowArrow color={VB.dim}/>}</div>))}</div></VizBox>); };

const InferenceTimelineViz = () => { const [step,setStep]=useState(0); const steps=[{inp:"BOS",out:"k",p:".08"},{inp:"k",out:"a",p:".15"},{inp:"a",out:"m",p:".11"},{inp:"m",out:"r",p:".09"},{inp:"r",out:"i",p:".22"},{inp:"i",out:"n",p:".18"},{inp:"n",out:"BOS",p:".31"}]; useEffect(()=>{const t=setInterval(()=>setStep(s=>(s+1)%8),1000);return()=>clearInterval(t);},[]);return (<VizBox title="Autoregressive Generation — 'kamrin'" color="#6366F1"><div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap"}}>{steps.map((s,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,opacity:i<step?1:0.3,transition:"opacity .4s"}}><div style={{padding:"4px 10px",borderRadius:6,fontSize: 15,fontFamily:"'Fira Code',monospace",fontWeight:700,color:"#0EA5E9",background:"rgba(14,165,233,.1)"}}>{s.inp}</div><div style={{fontSize: 13,color:VB.dim}}>↓GPT</div><div style={{padding:"4px 10px",borderRadius:6,fontSize: 15,fontFamily:"'Fira Code',monospace",fontWeight:700,color:s.out==="BOS"?"#EF4444":"#10B981",background:s.out==="BOS"?"rgba(239,68,68,.1)":"rgba(16,185,129,.1)"}}>{s.out}</div><div style={{fontSize: 11,fontFamily:"'Fira Code',monospace",color:VB.dim}}>P={s.p}</div></div>))}</div><div style={{marginTop:10,textAlign:"center",padding:"6px 14px",background:"rgba(16,185,129,.06)",borderRadius:8}}><span style={{fontSize: 15,color:VB.muted}}>Sonuç: </span><span style={{fontSize: 19,fontFamily:"'Fira Code',monospace",fontWeight:800,color:"#10B981"}}>"kamrin"</span><span style={{fontSize: 13,color:VB.dim}}> — veri setinde yok ama yapıya uygun!</span></div></VizBox>); };

const TemperatureViz = () => { const logits=[2.4,1.8,0.5,-0.3,-1.0]; const labels=["a","n","e","i","t"]; const calcP=(t)=>{const s=logits.map(l=>l/t);const mx=Math.max(...s);const e=s.map(l=>Math.exp(l-mx));const sm=e.reduce((a,b)=>a+b);return e.map(v=>v/sm);}; const temps=[{t:0.2,label:"T=0.2 (sivri)",c:"#0EA5E9"},{t:0.8,label:"T=0.8 (dengeli)",c:"#10B981"},{t:1.5,label:"T=1.5 (düz)",c:"#EF4444"}]; return (<VizBox title="Temperature Etkisi" color="#F59E0B"><div style={{display:"flex",gap:14,flexWrap:"wrap"}}>{temps.map((tmp,ti)=>{const probs=calcP(tmp.t);const mx=Math.max(...probs);return(<div key={ti} style={{flex:1,minWidth:140}}><div style={{fontSize: 14,fontWeight:600,color:tmp.c,marginBottom:6}}>{tmp.label}</div>{probs.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}><span style={{width:14,fontSize: 13,fontFamily:"'Fira Code',monospace",color:VB.muted}}>{labels[i]}</span><div style={{flex:1,height:12,background:"rgba(255,255,255,0.03)",borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:`${(p/mx)*100}%`,borderRadius:6,background:tmp.c}}/></div><span style={{width:35,fontSize: 11,fontFamily:"'Fira Code',monospace",color:VB.dim,textAlign:"right"}}>{(p*100).toFixed(0)}%</span></div>))}</div>);})}</div><div style={{marginTop:8,fontSize: 12,color:VB.dim}}>T↓: sivri(deterministik) • T=1: orijinal • T↑: düz(rastgele)</div></VizBox>); };

const KVCacheViz = () => (<VizBox title="KV Cache — O(n²) → O(n)" color="#10B981"><div style={{display:"flex",gap:20,flexWrap:"wrap"}}><div><div style={{fontSize: 13,color:VB.muted,marginBottom:6}}>Cache Büyüme</div>{[0,1,2,3,4].map(pos=>(<div key={pos} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{width:44,fontSize: 12,fontFamily:"'Fira Code',monospace",color:VB.muted}}>pos={pos}</span>{Array.from({length:pos+1},(_,k)=>(<div key={k} style={{padding:"3px 8px",borderRadius:4,fontSize: 12,fontFamily:"'Fira Code',monospace",background:k===pos?"rgba(16,185,129,.2)":"rgba(14,165,233,.1)",color:k===pos?"#10B981":"#0EA5E9",fontWeight:k===pos?700:400}}>k{k}</div>))}{pos<4&&<span style={{fontSize: 11,color:"#10B981"}}>←yeni</span>}</div>))}</div><div style={{flex:1,minWidth:200,display:"flex",gap:10}}><div style={{flex:1,padding:"8px 12px",borderRadius:8,background:"rgba(239,68,68,.06)"}}><div style={{fontSize: 13,fontWeight:600,color:"#EF4444"}}>Cache Yok</div><div style={{fontSize: 12,color:VB.muted,marginTop:4}}>pos=5: 6 token hesapla</div><div style={{fontSize: 15,fontFamily:"'Fira Code',monospace",fontWeight:700,color:"#EF4444",marginTop:4}}>O(n²)</div></div><div style={{flex:1,padding:"8px 12px",borderRadius:8,background:"rgba(16,185,129,.06)"}}><div style={{fontSize: 13,fontWeight:600,color:"#10B981"}}>KV Cache</div><div style={{fontSize: 12,color:VB.muted,marginTop:4}}>pos=5: 1 yeni+5 cache</div><div style={{fontSize: 15,fontFamily:"'Fira Code',monospace",fontWeight:700,color:"#10B981",marginTop:4}}>O(n)</div></div></div></div></VizBox>);

const GPTFamilyViz = () => { const ms=[{n:"Bu Kod ★",p:"~5K",l:"1",e:"16",c:"8",y:"2024",cl:"#0EA5E9"},{n:"GPT-1",p:"117M",l:"12",e:"768",c:"512",y:"2018",cl:"#94A3B8"},{n:"GPT-2",p:"1.5B",l:"48",e:"1,600",c:"1K",y:"2019",cl:"#94A3B8"},{n:"GPT-3",p:"175B",l:"96",e:"12,288",c:"2K",y:"2020",cl:"#94A3B8"},{n:"GPT-4",p:"~1T+",l:"?",e:"?",c:"128K",y:"2023",cl:"#94A3B8"}]; return (<VizBox title={lang === "tr" ? "GPT Ailesi Karşılaştırma" : "GPT Family Comparison"} color="#6366F1"><div style={{overflowX:"auto"}}><div style={{display:"grid",gridTemplateColumns:"120px repeat(5,1fr)",gap:2,minWidth:450}}>{["Model","Param","Layer","n_embd","Context",lang === "tr" ? lang === "tr" ? "Yıl" : "Year" : "Year"].map((h,i)=>(<div key={i} style={{padding:"6px 8px",background:"rgba(255,255,255,0.04)",fontSize: 12,fontWeight:700,color:"#0EA5E9"}}>{h}</div>))}{ms.map((m,ri)=>[m.n,m.p,m.l,m.e,m.c,m.y].map((cell,ci)=>(<div key={`${ri}-${ci}`} style={{padding:"5px 8px",fontSize: 13,fontFamily:ci>0?"'Fira Code',monospace":"inherit",fontWeight:ci===0||ri===0?700:400,color:ri===0?m.cl:VB.txt,background:ri===0?`${m.cl}08`:"transparent"}}>{cell}</div>)))}</div></div><div style={{marginTop:10,padding:"6px 12px",background:"rgba(16,185,129,.06)",borderRadius:8,fontSize: 13,color:"#10B981"}}>Temel mekanizma hep aynı: attention + MLP + residual + norm + CE + backprop + Adam</div></VizBox>); };

const ResidualViz = () => (<VizBox title="Residual Connections — Gradient Highway" color="#10B981"><div style={{display:"flex",gap:24,flexWrap:"wrap"}}><div><div style={{fontSize: 14,fontWeight:600,color:"#EF4444",marginBottom:6}}>Residual OLMADAN</div><div style={{display:"flex",alignItems:"center",gap:4}}>{[1,.7,.4,.15,.05].map((op,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{padding:"6px 10px",borderRadius:6,background:`rgba(239,68,68,${op})`,fontSize: 13,fontFamily:"'Fira Code',monospace",color:op>0.3?"#fff":"#EF4444"}}>f{i+1}</div>{i<4&&<span style={{color:VB.dim,fontSize: 13}}>→</span>}</div>))}</div><div style={{fontSize: 12,color:"#EF4444",marginTop:4}}>Gradient küçülür → uzak katmanlar öğrenemez</div></div><div><div style={{fontSize: 14,fontWeight:600,color:"#10B981",marginBottom:6}}>Residual İLE</div><div style={{display:"flex",alignItems:"center",gap:4}}>{[1,1,1,1,1].map((_,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{padding:"6px 10px",borderRadius:6,background:"rgba(16,185,129,0.5)",fontSize: 13,fontFamily:"'Fira Code',monospace",color:"#fff"}}>f{i+1}+x</div>{i<4&&<span style={{color:VB.dim,fontSize: 13}}>→</span>}</div>))}</div><div style={{fontSize: 12,color:"#10B981",marginTop:4}}>∂y/∂x = ∂f/∂x + 1 ← +1 her zaman geçer!</div></div></div></VizBox>);

const SoftmaxViz = () => { const logits=[2.4,0.0,-1.5]; const labels=["A","B","C"]; const mx=Math.max(...logits); const exps=logits.map(l=>Math.exp(l-mx)); const sum=exps.reduce((a,b)=>a+b); const probs=exps.map(e=>e/sum); return (<VizBox title={lang === "tr" ? "Softmax: Logits → Olasılık" : "Softmax: Logits → Probability"} color="#8B5CF6"><div style={{display:"flex",gap:16,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}><div style={{textAlign:"center"}}><div style={{fontSize: 13,color:VB.muted,marginBottom:4}}>Logits</div>{logits.map((l,i)=>(<div key={i} style={{fontSize: 17,fontFamily:"'Fira Code',monospace",color:VB.txt,padding:"2px 0"}}>{labels[i]}: {l.toFixed(1)}</div>))}</div><div style={{fontSize: 21,color:VB.dim}}>→</div><div style={{textAlign:"center"}}><div style={{fontSize: 13,color:VB.muted,marginBottom:4}}>exp(x-max)</div>{exps.map((e,i)=>(<div key={i} style={{fontSize: 17,fontFamily:"'Fira Code',monospace",color:"#F59E0B",padding:"2px 0"}}>{e.toFixed(2)}</div>))}</div><div style={{fontSize: 21,color:VB.dim}}>→</div><div style={{textAlign:"center"}}><div style={{fontSize: 13,color:VB.muted,marginBottom:4}}>÷ toplam</div>{probs.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"2px 0"}}><span style={{fontSize: 17,fontFamily:"'Fira Code',monospace",color:"#10B981",fontWeight:700}}>{(p*100).toFixed(0)}%</span><div style={{width:80,height:12,background:"rgba(255,255,255,0.03)",borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:`${p*100}%`,borderRadius:6,background:"#10B981"}}/></div></div>))}</div></div><div style={{marginTop:8,textAlign:"center",fontSize: 12,color:VB.dim}}>max-subtraction trick: exp(1000)=∞ → exp(1000-1000)=1 ✓</div></VizBox>); };

// ═══════════════════════════════════════════════════════════════════════
// NEW VISUALIZATION COMPONENTS — Inspired by PPTX Enriched Visual Guide
// ═══════════════════════════════════════════════════════════════════════

const NeuralNetBasicsViz = () => {
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
const REAL_CODE = {
  // WEEK 0 — Giriş
  "week0_s0": {
    label: "microgpt.py • satır 1-6",
    lines: [1, 6],
    code: `"""
The most atomic way to train and inference
a GPT LLM in pure, dependency-free Python.
Differences from GPT-2 are minor: rmsnorm
instead of layer norm, no biases, square
ReLU instead of GeLU nonlinearity.
"""`,
    notes: [
      "Dosyanın en tepesi — projenin manifestosu",
      "Saf Python, bağımlılık yok (PyTorch/NumPy yok)",
      "GPT-2'den farklar: RMSNorm, bias yok, ReLU²",
    ]
  },
  "week0_s5": {
    label: "microgpt.py • satır 8-12",
    lines: [8, 12],
    code: `import os       # dosya kontrolü
import math     # math.log, math.exp
import random   # random.seed, random.choices
import argparse # komut satırı argümanları`,
    notes: [
      "Sadece 4 standart kütüphane — hiçbir pip install yok!",
      "os: input.txt var mı diye kontrol eder",
      "math: log (loss hesabı) ve exp (softmax) için",
      "random: parametre başlatma ve sampling için",
    ]
  },
  "week0_s7": {
    label: "microgpt.py • satır 14-27",
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
      "argparse: komut satırından parametre değiştirmeye izin verir",
      "Tüm varsayılanlar (16, 1, 8, 1000, 4, 0.01, 42) burada",
      "head_dim = n_embd // n_head = 16 // 4 = 4",
      "random.seed(42): tekrarlanabilirlik için sabit tohum",
    ]
  },
  "week0_s8": {
    label: "microgpt.py • satır 29-36",
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
      "Veri yoksa otomatik indirir (32K İngilizce isim)",
      "Her satır bir 'doküman' (isim)",
      "shuffle → eğitim sırasında rastgele sıra",
      "Kendi input.txt dosyanızla değiştirebilirsiniz!",
    ]
  },
  // WEEK 1 — Tokenizer
  "week1_s2": {
    label: "microgpt.py • satır 38-44",
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
    label: "microgpt.py • satır 107-119",
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
      "matrix(): her eleman bir Value nesnesi → autograd'a bağlı",
      "wte: token embedding [28×16] — her token 16-dim vektör",
      "wpe: pozisyon embedding [8×16] — her pozisyon 16-dim",
      "attn_wo ve mlp_fc2 sıfır std ile başlar (residual kararlılığı)",
      "params: tüm öğrenilebilir parametrelerin düz listesi → optimizer için",
    ]
  },
  // WEEK 1 — Softmax
  "week1_s8": {
    label: "microgpt.py • satır 124-128",
    lines: [124, 128],
    code: `def softmax(logits):
    max_val = max(v.data for v in logits)
    exps = [(v - max_val).exp()
            for v in logits]
    total = sum(exps)
    return [e / total for e in exps]`,
    notes: [
      "max_val çıkarma: sayısal kararlılık (exp overflow önleme)",
      "Her logit → exp(logit - max) → normalize",
      "Çıktı: toplamı 1 olan olasılık dağılımı",
      "Value nesneleri üzerinde → autograd backward çalışır",
    ]
  },
  // WEEK 2 — Autograd Value class
  "week2_s3": {
    label: "microgpt.py • satır 47-63",
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
      "data: sayısal değer, grad: gradient (başlangıçta 0)",
      "_backward: chain rule fonksiyonu (her operasyon kendini tanımlar)",
      "_prev: bu düğümü oluşturan çocuk düğümler (graf bağlantısı)",
      "grad += : kritik! = değil += çünkü birden fazla yol olabilir",
      "__add__: a + b → ∂L/∂a = ∂L/∂out, ∂L/∂b = ∂L/∂out",
    ]
  },
  "week2_s4": {
    label: "microgpt.py • satır 65-90",
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
      "mul: ∂(a×b)/∂a = b, ∂(a×b)/∂b = a → çapraz kuralı",
      "pow: ∂(x^n)/∂x = n·x^(n-1) → power rule",
      "log: ∂log(x)/∂x = 1/x → cross-entropy loss'ta kullanılır",
      "exp: ∂exp(x)/∂x = exp(x) → softmax'ta kullanılır",
      "relu: x>0 → gradient geçer, x<0 → gradient 0 (kapı gibi)",
    ]
  },
  // WEEK 2 — Backward
  "week2_s6": {
    label: "microgpt.py • satır 92-103",
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
      "build_topo: DFS ile hesaplama grafını topolojik sıraya dizer",
      "self.grad = 1: loss'un kendine göre gradientı = 1 (başlangıç)",
      "reversed(topo): çıktıdan girişe doğru geri yayılım",
      "v._backward(): her düğüm kendi chain rule'ını uygular",
    ]
  },
  // WEEK 3 — Attention in gpt()
  "week3_s2": {
    label: "microgpt.py • satır 136-157",
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
      "gpt(): TEK bir token adımı işler (autoregressive)",
      "tok_emb + pos_emb: token ve pozisyon bilgisi birleşir",
      "rmsnorm → Q,K,V projeksiyonu → KV cache'e ekle",
      "Her head kendi dilimini alır: q[hs:hs+head_dim]",
      "keys/values liste olarak birikir → KV Cache!",
    ]
  },
  "week3_s4": {
    label: "microgpt.py • satır 158-167",
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
      "Q·K dot product: her geçmiş tokena uyum skoru",
      "/ head_dim**0.5: scaling trick (√4 = 2)",
      "softmax: skorları olasılıklara çevirir",
      "V'nin ağırlıklı toplamı: dikkat edilen bilgi",
      "extend: tüm head'lerin çıktıları birleştirilir",
    ]
  },
  // WEEK 4 — MLP block & residual
  "week4_s2": {
    label: "microgpt.py • satır 130-134",
    lines: [130, 134],
    code: `def rmsnorm(x):
    ms = sum(xi * xi for xi in x) / len(x)
    scale = (ms + 1e-5) ** -0.5
    return [xi * scale for xi in x]`,
    notes: [
      "ms = ortalama kare (mean square) → vektörün 'enerjisi'",
      "1e-5: sıfıra bölünmeyi önleyen küçük sayı (epsilon)",
      "scale = 1/√ms: her elemanı bu ile çarp → norm ≈ 1",
      "LayerNorm'dan fark: mean çıkarma yok → daha hızlı",
    ]
  },
  "week4_s3": {
    label: "microgpt.py • satır 170-177",
    lines: [170, 177],
    code: `    # 2) MLP block
    x_residual = x
    x = rmsnorm(x)
    x = linear(x, state_dict[f'layer{li}.mlp_fc1'])
    x = [xi.relu() ** 2 for xi in x]  # ReLU²
    x = linear(x, state_dict[f'layer{li}.mlp_fc2'])
    x = [a + b for a, b in zip(x, x_residual)]`,
    notes: [
      "x_residual = x: skip connection için girdiyi sakla",
      "rmsnorm → linear (16→64) → ReLU² → linear (64→16)",
      "relu()**2: negatifler 0, pozitifler karesel büyür (sparse!)",
      "x + x_residual: residual connection — gradient highway",
    ]
  },
  "week4_s5": {
    label: "microgpt.py • satır 168-169, 179-180",
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
      "İki residual: biri attention sonrası, biri MLP sonrası",
      "weight tying: wte hem girişte hem çıkışta kullanılır",
      "logits = son vektörün vocab boyutuna projeksiyonu [28]",
    ]
  },
  // WEEK 4 — Linear function
  "week4_s0": {
    label: "microgpt.py • satır 122-123",
    lines: [122, 123],
    code: `def linear(x, w):
    return [sum(w[o][i] * x[i]
            for i in range(len(x)))
            for o in range(len(w))]`,
    notes: [
      "Matris-vektör çarpımı: y = W·x",
      "Her çıktı elemanı = ağırlık satırı · giriş vektörü (dot product)",
      "Attention, MLP, projeksiyon — HER YERDE kullanılır",
    ]
  },
  // WEEK 5 — Training loop
  "week5_s2": {
    label: "microgpt.py • satır 188-205",
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
      "Her adımda TEK doküman (isim) işlenir → SGD",
      "tokens: [BOS, 'e', 'm', 'm', 'a', EOS] → [:8] kırp",
      "Her pozisyonda: gpt() → softmax → loss → backward",
      "-log(P(doğru)): cross-entropy loss → ne kadar yanlış?",
      "backward(): hesaplama grafından tüm gradientler hesaplanır",
    ]
  },
  // WEEK 5 — Adam optimizer
  "week5_s5": {
    label: "microgpt.py • satır 183-186, 207-216",
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
      "m: momentum (gradient yönü ortalaması) → düzgün ilerleme",
      "v: variance (gradient büyüklüğü ortalaması) → adaptif LR",
      "bias correction: erken adımlarda m ve v küçük → düzelt",
      "lr_t: linear decay — eğitim ilerledikçe LR azalır",
      "p.grad = 0: HER adımda sıfırla yoksa gradientler birikir!",
    ]
  },
  // WEEK 6 — Inference
  "week6_s1": {
    label: "microgpt.py • satır 219-232",
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
      "Eğitimden farklı: backward() YOK — sadece forward",
      "BOS ile başla → her adımda bir token üret → EOS'ta dur",
      "random.choices: olasılıklara göre rastgele seçim (sampling)",
      "KV cache: keys/values birikir → önceki tokenlar tekrar hesaplanmaz",
      "p.data: Value nesnesinin ham sayısını al (grad gerekmez)",
    ]
  },
  // WEEK 6 — Temperature (conceptual — real code doesn't have T)
  "week6_s2": {
    label: "microgpt.py'ye temperature ekleme",
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
      "Orijinal microgpt.py'de temperature parametresi yok",
      "Logit'leri T'ye bölmek softmax dağılımını kontrol eder",
      "Bu ders aracında (Lab) temperature ayarlayabilirsiniz",
    ]
  }
};

// ─── FULL CODE MAP — tüm microgpt.py renk kodlu ─────────────────
const CODE_MAP_SECTIONS = [
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
];

const RealCodeBlock = ({ data, weekColor }) => {
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
          <span style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B", fontFamily: "'Fira Code', monospace" }}>{data.label}</span>
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
                  {note}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CodeMapPanel = ({ onClose }) => (
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
);

// ─── INSTRUCTOR NOTES — Hoca Modu Verileri ──────────────────────
// ─── SLIDE REFERENCES — Slayt↔Explorer Köprü Haritası ──────────
const EMBEDDED_SLIDES = {
  "week0_s0": [
    {
      title: "Dil Modeli Nedir?",
      desc: "Bir dil modeli, verilen bir sözcük dizisinden sonra hangi sözcüğün geleceğini tahmin eden bir sistemdir. Her olası sonraki sözcüğe bir olasılık atar ve bu olasılıkları kullanarak metin üretebilir.",
      formula: "P(wₙ | w₁, w₂, ..., wₙ₋₁)",
      example: { input: "Bugün hava çok ___", output: "güzel (%40)  sıcak (%25)  soğuk (%15)  kötü (%10)  ..." },
      code: "logits = self.head(x)        # her token için skor\nprobs = F.softmax(logits, dim=-1)  # olasılık dağılımı",
      keyPoint: "N-gram modeli sadece son 2-3 sözcüğe bakar. BDM (GPT, Claude) TÜM önceki sözcüklere bakar — bu yüzden çok daha güçlü.",
    },
    {
      title: "BDM'ler Nasıl Çalışır?",
      desc: "Büyük dil modelleri, muazzam miktarda metin üzerinde 'sonraki sözcüğü tahmin et' görevi ile eğitilir. Bu basit görevle dil yapısını, dünya bilgisini ve akıl yürütmeyi öğrenirler.",
      example: { input: "The water of Walden Pond is beautifully ___", output: "blue (%32)  clear (%28)  green (%18)  cold (%8)  ..." },
      keyPoint: "Eğitim = sonraki sözcüğü tahmin et. Bu kadar basit ama bu kadar güçlü.",
    },
  ],
  "week0_s1": [
    {
      title: "Sinir Ağı Birimi: Ağırlıklı Toplam + Aktivasyon",
      desc: "Yapay sinir ağının temel birimi çok basittir: girdilerin ağırlıklı toplamını al, bir yanlılık (bias) ekle, sonra doğrusal olmayan bir fonksiyondan geçir.",
      formula: "y = f(w₁x₁ + w₂x₂ + ... + wₙxₙ + b) = f(w·x + b)",
      example: { input: "Girdiler: x₁=0.5, x₂=0.8 | Ağırlıklar: w₁=0.3, w₂=0.7", output: "z = 0.3×0.5 + 0.7×0.8 + b = 0.71 + b → y = σ(z)" },
      code: "# PyTorch'ta bir sinir birimi:\ny = torch.sigmoid(w @ x + b)",
      keyPoint: "Ağırlıklar her girdinin ne kadar önemli olduğunu belirler. Eğitim = bu ağırlıkları ayarlamak.",
    },
  ],
  "week0_s2": [
    {
      title: "Dil Modeli: Olasılık Dağılımı",
      desc: "Dil modeli, önceki sözcükler verildiğinde sonraki sözcük üzerinde bir olasılık dağılımı verir. Bunu tekrarlayarak cümle, paragraf, hatta kitap üretebilir.",
      formula: "P(w₁w₂...wₙ) = P(w₁) × P(w₂|w₁) × P(w₃|w₁w₂) × ...",
      example: { input: "Ben okula ___", output: "gidiyorum (%45)  gittim (%20)  gitmek (%15)  ..." },
      code: "# microGPT üretim döngüsü:\nfor _ in range(max_new_tokens):\n    logits = model(context)\n    probs = F.softmax(logits[:,-1,:], dim=-1)\n    next_token = torch.multinomial(probs, 1)",
      keyPoint: "Dil modeli = koşullu olasılık makinesi. Kelime kelime tahmin ederek metin üretir.",
    },
  ],
  "week0_s3": [
    {
      title: "Canlı Pipeline: Girdi → Çıktı",
      desc: "microGPT tam bir dil modeli pipeline'ı uygular: metin girişi → tokenization → embedding → transformer → olasılık → örnekleme → çıktı metni.",
      example: { input: "microGPT girdi: 'Ah'", output: "Token ID: [15] → Embedding → Transformer → 'Ahmet' (%30), 'Ahmed' (%25)..." },
      code: "# 243 satırlık tam pipeline:\nencode → wte + wpe → attention → mlp → lm_head → softmax → decode",
      keyPoint: "GPT-4 ile microGPT aynı algoritmayı kullanır. Fark sadece ölçek: 3,648 vs ~1.8 trilyon parametre.",
    },
  ],
  "week0_s4": [
    {
      title: "XOR: Tek Katman Neden Yetmez?",
      desc: "Minsky ve Papert (1969) gösterdi ki tek katmanlı ağ (perceptron) XOR gibi basit problemleri bile çözemez. Doğrusal olarak ayrılamayan veriler için gizli katman gerekir.",
      formula: "XOR(0,0)=0  XOR(0,1)=1  XOR(1,0)=1  XOR(1,1)=0",
      example: { input: "AND: tek çizgiyle ayrılır ✅ | XOR: tek çizgiyle AYRILAMAZ ❌", output: "Çözüm: 2 katman → ilk katman ara özellikler üretir, ikinci katman bunları birleştirir" },
      keyPoint: "Gizli katman = temsil gücü. Bu yüzden 'derin' öğrenme diyoruz — derinlik karmaşık fonksiyonları mümkün kılar.",
    },
  ],
  "week0_s5": [
    {
      title: "Ön Koşullar: Python & PyTorch Temelleri",
      desc: "microGPT'yi anlamak için temel Python ve PyTorch bilgisi yeterli. Karmaşık matematik yerine, kodun her satırının ne yaptığını sezgisel olarak kavramak önemli.",
      example: { input: "Gereken: Python değişkenler, döngüler, fonksiyonlar", output: "PyTorch: tensor, matmul, nn.Module, backward()" },
      code: "import torch\nimport torch.nn as nn\n# Bu iki import ile microGPT yazılabilir",
      keyPoint: "Derin öğrenme korkutucu değil — microGPT'nin 243 satırı bunu kanıtlıyor.",
    },
  ],
  "week0_s6": [
    {
      title: "BDM Metin Üretim Döngüsü",
      desc: "Metin üretimi otoregresif bir döngüdür: her adımda model bir token üretir, bu token girdiye eklenir ve sonraki token için tekrar model çalıştırılır.",
      example: { input: "Başlangıç: [BOS] 'Merhaba'", output: "Adım 1: → 'ben' | Adım 2: → 'Ali' | Adım 3: → [EOS] | Sonuç: 'Merhaba ben Ali'" },
      code: "# microGPT generate() döngüsü:\ncontext = seed_tokens\nfor _ in range(max_tokens):\n    next_tok = model.predict(context)\n    context = torch.cat([context, next_tok])",
      keyPoint: "Üretim = tekrarlı tahmin. Her token önceki tüm tokenlara koşullu.",
    },
  ],
  "week0_s7": [
    {
      title: "7 Parametre: microGPT Kontrol Paneli",
      desc: "microGPT'nin davranışı 7 parametreyle kontrol edilir. Her birini değiştirmek modelin kapasitesini, hızını ve çıktı kalitesini doğrudan etkiler.",
      example: { input: "vocab=27, d=16, heads=4, layers=1, block=8", output: "Toplam: 3,648 parametre → CPU'da 30 saniyede eğitilir" },
      code: "n_embd = 16       # embedding boyutu (d)\nn_head = 4        # dikkat başlığı sayısı\nn_layer = 1       # transformer katman sayısı\nblock_size = 8    # bağlam penceresi\nvocab_size = 27   # a-z + boşluk",
      keyPoint: "GPT-4: d=12288, heads=128, layers=120+. microGPT ile AYNI yapı — sadece sayıları büyüt!",
    },
  ],
  "week0_s8": [
    {
      title: { tr: "Kendi Verinizi Kullanma", en: "Using Your Own Data" },
      desc: "microGPT herhangi bir metin verisiyle eğitilebilir. Varsayılan Türk isimleri yerine şiir, kod veya başka bir dil kullanılabilir.",
      example: { input: "Veri: 'ali\\nmehmet\\nayşe\\n...' (Türk isimleri)", output: "Model öğrenir: Türk isim kalıpları, yaygın hece yapıları, isim uzunlukları" },
      keyPoint: "Veri modelin 'dünyası'dır. Ne verirseniz onu öğrenir.",
    },
  ],
  "week0_s9": [
    {
      title: "Eğitim Evrimi: Rastgeleden Anlama",
      desc: "Eğitimin başında model tamamen rastgele tahmin yapar. Zaman içinde önce sık harfleri, sonra hece kalıplarını, sonunda gerçek isimlere benzeyen yapıları öğrenir.",
      example: { input: "Adım 0: 'xqzpwm' (rastgele) → Adım 100: 'aeiou' (sesli harfler)", output: "Adım 500: 'meher' (hece yapısı) → Adım 1000: 'mehmet' (gerçek isim!)" },
      keyPoint: "Loss eğrisi düşerken model öğreniyor. Loss platoya ulaşınca model artık iyileşmiyor.",
    },
  ],
  "week0_s10": [
    {
      title: "GPT Ailesi: microGPT → GPT-4",
      desc: "microGPT'den GPT-4'e giden yol, aynı algoritmanın ölçeklenmesidir. Daha fazla parametre + daha fazla veri + daha fazla hesaplama = daha iyi performans.",
      formula: "Loss ∝ N⁻⁰·⁰⁷⁶ × D⁻⁰·⁰⁹⁵ × C⁻⁰·⁰⁵⁰",
      example: { input: "microGPT: d=16, 1 katman → 3,648 param", output: "GPT-3: d=12288, 96 katman → 175,000,000,000 param (10⁸ kat!)" },
      keyPoint: "Aynı algoritma, 10⁸ kat parametre farkı. Ölçekleme yasaları bunu öngörülebilir kılıyor.",
    },
  ],
  "week1_s0": [
    {
      title: "Sözcük Sayma Problemi",
      desc: "Bir cümledeki sözcük sayısını belirlemek bile zordur. Noktalama sayılır mı? Kısaltmalar? Birleşik sözcükler? Her dil farklı kurallar gerektirir.",
      example: { input: "They picnicked by the pool, then lay back on the grass.", output: "16 sözcük (noktalama hariç) / 18 sözcük (noktalama dahil) — hangisi doğru?" },
      keyPoint: "Tür (type): benzersiz sözcük ('the' 1 kez sayılır). Örnek (token): her geçiş ('the' 3 kez sayılır).",
    },
    {
      title: "BPE: Alt Sözcük Tokenization",
      desc: "Byte Pair Encoding, sözcükleri daha küçük alt birimlere ayırır. En sık komşu karakter çiftlerini tekrar tekrar birleştirerek bir sözcük dağarcığı oluşturur.",
      formula: "Tekrarla: en sık (A,B) çiftini bul → 'AB' olarak birleştir → k kez",
      example: { input: "'newer' → BPE → ['new', 'er']", output: "'lowest' → ['low', 'est']   Sistem ek yapısını keşfetti!" },
      code: "# BPE öğrenici pseudocode:\nvocab = tüm_karakterler\nfor i in range(k):\n    pair = en_sık_komşu_çift(corpus)\n    vocab.add(merge(pair))\n    corpus = replace_all(corpus, pair)",
      keyPoint: "BPE, bilinmeyen sözcük sorununu çözer: her sözcük alt parçalara ayrılabilir.",
    },
  ],
  "week1_s1": [
    {
      title: "Token, Vocab, Logit — Temel Kavramlar",
      desc: "Token metnin en küçük birimidir. Vocab tüm olası tokenlerin listesidir. Logit modelin her token için ürettiği ham skordur.",
      formula: "metin → tokenizer → [id₁, id₂, ...] → model → logits [1×|V|] → softmax → olasılıklar",
      example: { input: "microGPT vocab: a-z + boşluk = 27 token", output: "GPT-4 vocab: ~100,000 token (tiktoken cl100k_base)" },
      code: "# microGPT encode/decode:\nstoi = {ch:i for i,ch in enumerate(chars)}  # 'a'→0, 'b'→1, ...\nencode = lambda s: [stoi[c] for c in s]\ndecode = lambda l: ''.join(itos[i] for i in l)",
      keyPoint: "Vocab büyüklüğü = modelin 'alfabe'si. Küçük vocab → uzun diziler. Büyük vocab → kısa diziler ama daha fazla parametre.",
    },
  ],
  "week1_s2": [
    {
      title: "Token Embedding: ID → Vektör",
      desc: "Her token ID'si, bir embedding matrisinden karşılık gelen satır vektörünü seçer. Bu vektör tokenin anlamını temsil eden sayısal bir koddur.",
      formula: "x = E[token_id]    E boyutu: [|V| × d]",
      example: { input: "token_id = 5 ('f'), d = 16", output: "x = E[5] = [0.12, -0.34, 0.78, ...] (16 boyutlu vektör)" },
      code: "# microGPT embedding:\nself.wte = nn.Embedding(vocab_size, n_embd)  # [27 × 16]\ntok_emb = self.wte(token_ids)  # [batch, seq_len, 16]",
      keyPoint: "Embedding = arama tablosu. Eğitimle bu vektörler anlamlı hale gelir: benzer tokenlar yakın vektörler alır.",
    },
  ],
  "week1_s3": [
    {
      title: "Vektör: Sayı Listesi ile Anlam Temsili",
      desc: "Bir vektör, sabit uzunlukta bir sayı listesidir. Sözcükleri vektörlerle temsil etmek, bilgisayarın anlam üzerinde matematik yapmasını sağlar.",
      formula: "king - man + woman ≈ queen",
      example: { input: "kedi = [0.2, 0.8, -0.1, 0.5]", output: "köpek = [0.3, 0.7, -0.2, 0.4]  → çok yakın! (ikisi de evcil hayvan)" },
      keyPoint: "Vektör uzayında yakın = anlamca benzer. Bu basit fikir tüm modern NLP'nin temelidir.",
    },
  ],
  "week1_s4": [
    {
      title: "Token Embedding: Tablodaki Satırı Seç",
      desc: "Embedding matrisi |V|×d boyutlu bir tablodur. Token ID bu tablodaki satır numarasıdır. İleri geçişte sadece bir satır seçilir — hesaplama çok hızlıdır.",
      formula: "E ∈ ℝ^{|V|×d}    x_i = E[token_i]",
      example: { input: "'merhaba' → BPE → [312, 4521, 89]", output: "x₁ = E[312], x₂ = E[4521], x₃ = E[89]  (her biri d boyutlu)" },
      code: "# Embedding lookup = matrix indexing:\ntok_emb = self.wte(idx)  # idx: [B, T] → tok_emb: [B, T, d]",
      keyPoint: "Embedding başlangıçta rastgele. Eğitimle anlamlı hale gelir — benzer tokenlar yakınlaşır.",
    },
  ],
  "week1_s5": [
    {
      title: "Position Embedding: Sıra Bilgisi",
      desc: "Dikkat mekanizması sıra-bağımsızdır — 'Ali Ayşe'yi sevdi' ile 'Ayşe Ali'yi sevdi' aynı görünür! Konum gömmeleri her pozisyona ayrı bir vektör ekleyerek sıra bilgisi verir.",
      formula: "x_i = wte[token_i] + wpe[pozisyon_i]",
      example: { input: "'kedi uyur' → token_emb: [E[kedi], E[uyur]]", output: "pos_emb: [P[0], P[1]] → final: [E[kedi]+P[0], E[uyur]+P[1]]" },
      code: "self.wpe = nn.Embedding(block_size, n_embd)  # [8 × 16]\npos_emb = self.wpe(torch.arange(T))  # pozisyon 0,1,2,...\nx = tok_emb + pos_emb  # toplam: token + pozisyon",
      keyPoint: "Embedding = token kimliği + pozisyon bilgisi. İkisinin TOPLAMI modelin girdisidir.",
    },
  ],
  "week1_s6": [
    {
      title: "Matris Çarpımı: Linear Transform",
      desc: "Sinir ağlarının temel işlemi matris çarpımıdır. Bir vektörü bir matrisle çarpmak, onu yeni bir uzaya yansıtır (projeksiyon/dönüşüm).",
      formula: "y = Wx + b    W: [çıktı_dim × girdi_dim]",
      example: { input: "x = [0.5, 0.3] (2D), W = [[0.1, 0.4], [0.7, 0.2], [0.3, 0.8]] (3×2)", output: "y = Wx = [0.17, 0.41, 0.39] → 2D'den 3D'ye dönüşüm!" },
      code: "# PyTorch'ta linear transform:\nself.linear = nn.Linear(n_embd, 4 * n_embd)  # d → 4d\nout = self.linear(x)  # matris çarpımı + bias",
      keyPoint: "Matris çarpımı = uzay dönüşümü. Transformer'daki her adım bir matris çarpımıdır.",
    },
  ],
  "week1_s7": [
    {
      title: "Weight Tying: Aynı Matrisi İki Kez Kullan",
      desc: "Gömme matrisi (E) tokeni vektöre çevirir. Çözme matrisi (Eᵀ) vektörü tekrar token skorlarına çevirir. Weight tying: ikisi için AYNI matrisi kullan!",
      formula: "Embedding: x = E[token_id]    Unembedding: logits = h × Eᵀ",
      example: { input: "Vocab=27, d=16 → E boyutu: [27×16]", output: "Tying olmadan: 27×16 + 27×16 = 864 param | Tying ile: 27×16 = 432 param (-%50!)" },
      code: "# microGPT weight tying:\nself.wte = nn.Embedding(V, d)      # gömme\nself.head = nn.Linear(d, V, bias=False)  # çözme\nself.head.weight = self.wte.weight  # AYNI ağırlık!",
      keyPoint: "Weight tying parametre sayısını azaltır VE performansı artırır — embedding ve unembedding tutarlı olur.",
    },
  ],
  "week1_s8": [
    {
      title: "Softmax: Skorlardan Olasılığa",
      desc: "Model her token için bir skor (logit) üretir. Softmax bu skorları olasılıklara çevirir: hepsi 0-1 arası, toplamı 1.",
      formula: "softmax(zᵢ) = exp(zᵢ) / Σⱼ exp(zⱼ)",
      example: { input: "Logits: [2.0, 1.0, 0.1] (3 token için ham skorlar)", output: "Softmax: [0.659, 0.242, 0.099] → toplamı 1.0 ✓" },
      code: "# microGPT'de softmax:\nlogits = self.head(x)           # [B, T, V] ham skorlar\nprobs = F.softmax(logits, dim=-1)  # [B, T, V] olasılıklar\nnext_tok = torch.multinomial(probs, 1)  # örnekle",
      keyPoint: "Softmax = sigmoidin çok sınıflı genellemesi. Büyük logit → yüksek olasılık, küçük logit → düşük olasılık.",
    },
  ],
  "week2_s0": [
    {
      title: "Türev Nedir? Değişimin Ölçüsü",
      desc: "Türev, bir fonksiyonun girdisi değiştiğinde çıktısının ne kadar değiştiğini söyler. Eğitimde türev bize 'ağırlığı hangi yöne değiştirmeliyim?' sorusunun cevabını verir.",
      formula: "f'(x) = lim[h→0] (f(x+h) - f(x)) / h",
      example: { input: "f(x) = x² → f'(x) = 2x", output: "x=3'te: f'(3) = 6 → 'x artarsa f(x) 6 kat hızla artar'" },
      keyPoint: "Türev = eğim = değişim oranı. Eğitimde kayıp fonksiyonunun türevini alarak ağırlıkları güncelleriz.",
    },
  ],
  "week2_s1": [
    {
      title: "Kısmi Türev ve Gradient",
      desc: "Birden fazla değişkenli fonksiyonlarda her değişkene göre ayrı türev alırız. Tüm kısmi türevleri bir araya koyunca gradient vektörü elde ederiz.",
      formula: "∇L = [∂L/∂w₁, ∂L/∂w₂, ..., ∂L/∂wₙ]",
      example: { input: "L(w₁,w₂) = w₁² + 3w₂", output: "∂L/∂w₁ = 2w₁, ∂L/∂w₂ = 3 → ∇L = [2w₁, 3]" },
      keyPoint: "Gradient = 'kaybın en hızlı arttığı yön'. Biz TERSİ yönde gideriz → kayıp azalır.",
    },
  ],
  "week2_s2": [
    {
      title: "Autograd: Otomatik Türev Hesaplama",
      desc: "microGPT'deki autograd sistemi her matematiksel işlemi bir hesaplama grafiği olarak kaydeder. Backward pass sırasında zincir kuralıyla tüm türevleri otomatik hesaplar.",
      formula: "İleri: x → z = Wx+b → h = σ(z) → L\nGeri: ∂L/∂W = (∂L/∂h)(∂h/∂z)(∂z/∂W)",
      example: { input: "a = Value(2), b = Value(3), c = a * b", output: "c.backward() → a.grad = 3 (∂c/∂a = b), b.grad = 2 (∂c/∂b = a)" },
      code: "# microGPT Value sınıfı:\nclass Value:\n    def __init__(self, data):\n        self.data = data\n        self.grad = 0\n        self._backward = lambda: None",
      keyPoint: "Autograd = elle türev almaya gerek yok. Kod otomatik yapıyor!",
    },
  ],
  "week2_s3": [
    {
      title: "Value Sınıfı: 4 Temel Bileşen",
      desc: "Value sınıfı autograd'ın kalbidir. Her Value bir sayı tutar, gradyanını biriktirir, hesaplama grafındaki yerini bilir ve geri yayılım fonksiyonu taşır.",
      example: { input: "a = Value(2), b = Value(3)", output: "c = a + b → c.data=5, c._children={a,b}, c._backward: a.grad+=1, b.grad+=1" },
      code: "class Value:\n    self.data = 2.0         # ileri geçiş değeri\n    self.grad = 0.0         # geri geçiş gradyanı\n    self._children = set()  # graf bağlantıları\n    self._backward = fn     # geri yayılım fonksiyonu",
      keyPoint: "Her işlem (+, ×, σ) grafa bir düğüm ekler. backward() bu grafı tersten yürür.",
    },
  ],
  "week2_s4": [
    {
      title: "Operatör Overloading: +, × Otomatik Graf",
      desc: "Python'un __add__, __mul__ gibi özel metotlarını değiştirerek, normal aritmetik işlemlerle otomatik hesaplama grafı oluştururuz.",
      example: { input: "a = Value(2); b = Value(3); c = a * b", output: "c.grad=1 → a.grad += 3×1 = 3, b.grad += 2×1 = 2 ✓" },
      code: "class Value:\n    def __mul__(self, other):\n        out = Value(self.data * other.data)\n        def _backward():\n            self.grad += other.data * out.grad\n            other.grad += self.data * out.grad\n        out._backward = _backward\n        return out",
      keyPoint: "Python sihri: 'a * b' yazdığınızda hem çarpma hem de türev hesaplama kaydediliyor.",
    },
  ],
  "week2_s5": [
    {
      title: "Chain Rule: İç İçe Fonksiyonların Türevi",
      desc: "Zincir kuralı, bileşik fonksiyonların türevini hesaplamanın yoludur. Backward pass tamamen zincir kuralına dayanır.",
      formula: "∂L/∂x = (∂L/∂y) × (∂y/∂x) — 'dıştan içe, çarparak ilerle'",
      example: { input: "L = (a×b + c)² → dış: u², iç: a×b+c", output: "∂L/∂a = 2(a×b+c) × b — dış türev × iç türev" },
      keyPoint: "Her düğüm sadece kendi lokal türevini bilir. Zincir kuralı bunları çarparak birleştirir.",
    },
  ],
  "week2_s6": [
    {
      title: "Somut Örnek: L = (a × b) + c",
      desc: "Basit bir hesaplama grafında ileri ve geri geçişi adım adım izleyelim.",
      formula: "∂L/∂a = ∂L/∂d × ∂d/∂a = 1 × b = 3",
      example: { input: "a=2, b=3, c=4 → d=a×b=6 → L=d+c=10", output: "Geri: ∂L/∂L=1 → ∂L/∂d=1, ∂L/∂c=1 → ∂L/∂a=b=3, ∂L/∂b=a=2" },
      keyPoint: "Geri yayılım = 'kayıptaki 1 birimlik değişim, her parametreyi ne kadar etkiler?'",
    },
  ],
  "week2_s7": [
    {
      title: "Gradient Toplanması: += Neden Kritik?",
      desc: "Bir değişken birden fazla yerde kullanılırsa, gradyanları TOPLANMALIDIR. Bu çok önemli bir detaydır — unutulursa gradyanlar kaybolur.",
      formula: "Eğer x, f(x) ve g(x)'te kullanılıyorsa: ∂L/∂x = ∂L/∂f × ∂f/∂x + ∂L/∂g × ∂g/∂x",
      example: { input: "a=2 → b=a+a=4 (a iki kez kullanıldı)", output: "∂b/∂a = 1 + 1 = 2 (toplama!) — a.grad += 1; a.grad += 1" },
      code: "# DOĞRU: gradyan biriktir\nself.grad += local_grad * out.grad\n# YANLIŞ: gradyan üzerine yaz\nself.grad = local_grad * out.grad  # ❌ önceki kaybolur!",
      keyPoint: "grad += (topla), grad = (üzerine yaz) DEĞİL. Bu tek karakter farkı her şeyi değiştirir.",
    },
  ],
  "week2_s8": [
    {
      title: "Bizim Autograd vs PyTorch",
      desc: "microGPT'deki autograd, PyTorch'un torch.autograd modülünün basitleştirilmiş versiyonudur. Aynı prensip: hesaplama grafı + zincir kuralı + backward pass.",
      example: { input: "Bizim Value: Python, CPU, eğitim amaçlı, ~50 satır", output: "PyTorch Tensor: C++/CUDA, GPU, üretim, milyonlarca satır" },
      code: "# PyTorch eşdeğeri:\nx = torch.tensor(2.0, requires_grad=True)\ny = x ** 2 + 3 * x\ny.backward()\nprint(x.grad)  # 7.0 (= 2*2 + 3)",
      keyPoint: "Mekanizma aynı, ölçek farklı. Anlamak için basitini yaz, kullanmak için PyTorch kullan.",
    },
  ],
  "week3_s0": [
    {
      title: "RNN'den Attention'a: Neden Yeni Mimari?",
      desc: "RNN sözcükleri sırayla işler ve bilgiyi bir gizli durumda taşır. Uzun cümlelerde erken sözcüklerin bilgisi kaybolur. Dikkat mekanizması her sözcüğün doğrudan her diğer sözcüğe bakmasını sağlar.",
      example: { input: "RNN: 'Ali okula gitti çünkü ___' → 'Ali' bilgisi 4 adım uzakta, zayıflamış", output: "Attention: her sözcük doğrudan 'Ali'ye bakabilir → bilgi kaybı yok" },
      keyPoint: "RNN = sıralı boru hattı (bilgi kaybolur). Attention = herkes herkesi görür (bilgi korunur).",
    },
  ],
  "week3_s1": [
    {
      title: "Self-Attention: Bağlamsal Anlam",
      desc: "Aynı sözcük farklı cümlelerde farklı anlam taşır. Self-attention, her sözcüğün temsilini bağlamdaki diğer sözcüklerin bilgisiyle zenginleştirir.",
      example: { input: "'bank' → 'river bank' (nehir kıyısı) vs 'bank account' (banka)", output: "Attention sonrası: 'bank' vektörü iki cümlede FARKLI olur" },
      code: "# Sezgi: her token komşularına sorar 'bana ne bilgi verebilirsin?'\n# ve cevapları ağırlıklı olarak toplar\nattention_output = weighted_sum(values, attention_weights)",
      keyPoint: "Statik embedding: 'bank' her yerde aynı. Attention sonrası: bağlama göre farklılaşır.",
    },
  ],
  "week3_s2": [
    {
      title: "Query, Key, Value: 3 Farklı Rol",
      desc: "Her token 3 farklı role bürünür: Query (ne arıyorum?), Key (bende ne var?), Value (işte bilgim). Bu kütüphanede kitap aramaya benzer.",
      formula: "Q = XWq    K = XWk    V = XWv",
      example: { input: "Siz (Q): 'Fizik kitabı arıyorum'", output: "Raf etiketleri (K): 'Fizik', 'Tarih', 'Roman' → Fizik uyuşur → O kitabın içeriği (V) verilir" },
      code: "# microGPT Q, K, V hesaplama:\nq = x @ self.Wq  # [B, T, d] → [B, T, head_dim]\nk = x @ self.Wk\nv = x @ self.Wv",
      keyPoint: "Q·K = 'ne kadar ilgili?' skoru. Bu skor V'lerin ağırlığını belirler.",
    },
  ],
  "week3_s3": [
    {
      title: "Dikkat Kalıpları: Her Head Ne Öğrenir?",
      desc: "Multi-head attention'da her başlık farklı ilişki türlerini öğrenir. Bir başlık sözdizimi, diğeri anlam, bir diğeri pozisyon ilişkilerini yakalayabilir.",
      example: { input: "Head 1: 'kedi → uyuyor' (özne-yüklem)", output: "Head 2: 'büyük → kedi' (sıfat-isim) | Head 3: her token → bir önceki token (pozisyon)" },
      code: "# microGPT: 4 head, her biri d/4 = 4 boyutlu\n# Her head ayrı bir 'bakış açısı'",
      keyPoint: "4 head = 4 farklı bakış açısı. GPT-3'te 96 head → çok zengin ilişki ağı.",
    },
  ],
  "week3_s4": [
    {
      title: "Scaled Dot-Product: Tam Hesaplama",
      desc: "Dikkat skoru, sorgu ile anahtarın nokta çarpımıdır. √d ile bölme, büyük boyutlarda gradyanları stabilize eder.",
      formula: "Attention(Q,K,V) = softmax(QKᵀ / √d) × V",
      example: { input: "Q=[1,0], K₁=[1,0], K₂=[0,1]", output: "Q·K₁=1 (yüksek benzerlik), Q·K₂=0 (düşük) → Token 1'e daha çok dikkat" },
      code: "# microGPT attention:\natt = (q @ k.transpose(-2,-1)) * (1.0 / math.sqrt(k.size(-1)))\natt = att.masked_fill(self.mask[:,:,:T,:T] == 0, float('-inf'))\natt = F.softmax(att, dim=-1)\nout = att @ v  # ağırlıklı toplam",
      keyPoint: "QKᵀ = benzerlik matrisi [T×T]. Softmax → olasılık. V ile çarp → ağırlıklı bilgi.",
    },
  ],
  "week3_s5": [
    {
      title: "Dot Product: Benzerlik Ölçümü",
      desc: "İki vektörün nokta çarpımı, onların ne kadar 'aynı yöne baktığını' ölçer. Dikkat mekanizmasının benzerlik hesaplamasının temelidir.",
      formula: "a·b = Σᵢ aᵢbᵢ = |a||b|cos(θ)",
      example: { input: "a=[1,0,0], b=[1,0,0] → a·b = 1 (aynı yön)", output: "a=[1,0,0], b=[0,1,0] → a·b = 0 (dik, ilişkisiz)" },
      keyPoint: "Dot product > 0: benzer yön. = 0: ilişkisiz. < 0: zıt yön.",
    },
  ],
  "week3_s6": [
    {
      title: "Multi-Head & Causal Masking",
      desc: "Çok başlıklı dikkat: aynı girdiyi farklı açılardan analiz et. Causal mask: otoregresif üretimde geleceği görmesini engelle.",
      formula: "MultiHead = Concat(head₁, ..., headₕ) × Wₒ\nher headᵢ = Attention(QWqᵢ, KWkᵢ, VWvᵢ)",
      example: { input: "'Ali okula gitti' — 'gitti' tokenı için mask:", output: "'Ali' ✓  'okula' ✓  'gitti' ✓  [gelecek tokenlar] ✗ (maskelenmiş)" },
      code: "# Causal mask: üst üçgen = -∞\nmask = torch.tril(torch.ones(T, T))  # alt üçgen\natt = att.masked_fill(mask == 0, float('-inf'))\n# softmax(-∞) = 0 → gelecek görünmez",
      keyPoint: "Multi-head = paralel bakış açıları. Causal mask = 'geleceği bilemezsin' kuralı.",
    },
  ],
  "week3_s7": [
    {
      title: "Attention Çıktısı & Projeksiyon",
      desc: "Dikkat mekanizmasının çıktısı, value vektörlerinin ağırlıklı toplamıdır. Son bir lineer projeksiyon tüm head'lerin çıktılarını birleştirir.",
      formula: "aᵢ = Σⱼ αᵢⱼ × vⱼ    (αᵢⱼ = softmax(qᵢ·kⱼ/√d))",
      example: { input: "α = [0.7, 0.2, 0.1] (3 tokena dikkat ağırlıkları)", output: "çıktı = 0.7×v₁ + 0.2×v₂ + 0.1×v₃ → bağlamsal temsil" },
      code: "# microGPT: head çıktıları birleştirilir\nout = att @ v          # [B, T, head_dim]\nout = self.proj(out)   # [B, T, d] → geri orijinal boyuta",
      keyPoint: "Dikkat = bilgi filtreleme. Her token sadece ilgili bilgiyi alır, gürültüyü görmezden gelir.",
    },
  ],
  "week4_s0": [
    {
      title: "Transformer Bloğu: Büyük Resim",
      desc: "Bir transformer bloğu 4 bileşenden oluşur ve bu blok N kez tekrarlanır. Her blok girdinin boyutunu değiştirmez — bu yüzden üst üste yığılabilir.",
      formula: "x → LayerNorm → Attention → +x (residual) → LayerNorm → MLP → +x (residual)",
      example: { input: "Girdi: [8 token × 16 boyut] matrisi", output: "Çıktı: [8 token × 16 boyut] — boyut aynı! Ama her token artık bağlam biliyor" },
      code: "# microGPT transformer blok:\nclass Block(nn.Module):\n    def forward(self, x):\n        x = x + self.attn(self.ln1(x))   # dikkat + residual\n        x = x + self.mlp(self.ln2(x))    # MLP + residual\n        return x",
      keyPoint: "1 blok = dikkat (tokenlar arası bilgi) + MLP (token içi dönüşüm) + residual (bilgi korunması).",
    },
  ],
  "week4_s1": [
    {
      title: "Transformer Adım Adım Simülasyonu",
      desc: "Tek bir token bir transformer bloğundan geçerken neler olur? Normalizasyon → dikkat → toplama → normalizasyon → MLP → toplama.",
      example: { input: "x = [0.5, -0.3, 0.8, ...] (normalize edilmemiş)", output: "→ LayerNorm → Attention (diğer tokenlardan bilgi) → +x → LayerNorm → MLP → +x → çıktı" },
      code: "# Adım adım:\nx_norm = self.ln1(x)           # 1. normalize et\nattn_out = self.attn(x_norm)   # 2. dikkat hesapla\nx = x + attn_out               # 3. residual ekle\nx_norm = self.ln2(x)           # 4. tekrar normalize\nmlp_out = self.mlp(x_norm)     # 5. MLP dönüşümü\nx = x + mlp_out                # 6. residual ekle",
      keyPoint: "Her adımın rolü: norm=stabilize, attn=diğerlerinden öğren, MLP=kendi bilgini güncelle, residual=eski bilgiyi koru.",
    },
  ],
  "week4_s2": [
    {
      title: "RMSNorm: Vektörü Normalize Et",
      desc: "Layer normalization, her vektörü ortalama=0, standart sapma=1 olacak şekilde normalize eder. Bu, eğitimi stabilize eder ve gradyan patlamasını önler.",
      formula: "RMSNorm(x) = x / RMS(x) × γ    RMS(x) = √(Σxᵢ²/d)",
      example: { input: "x = [10, -5, 3, 8] → RMS = √(100+25+9+64)/4 = √49.5 ≈ 7.0", output: "x_norm = [1.43, -0.71, 0.43, 1.14] → değerler makul aralıkta" },
      code: "# microGPT RMSNorm:\nclass RMSNorm(nn.Module):\n    def forward(self, x):\n        rms = torch.sqrt(torch.mean(x**2, dim=-1, keepdim=True))\n        return x / (rms + 1e-8) * self.weight",
      keyPoint: "Normalizasyon olmadan derin ağlar eğitilemez — değerler katman katman büyür veya küçülür.",
    },
  ],
  "week4_s3": [
    {
      title: "MLP Bloku: Token İçi Dönüşüm",
      desc: "Feed-forward ağ her token için bağımsız olarak çalışır. Boyutu genişletir (d→4d), aktivasyon uygular, tekrar daraltır (4d→d).",
      formula: "MLP(x) = W₂ · activation(W₁ · x + b₁) + b₂",
      example: { input: "x: [16 boyut] → W₁: [16→64] genişlet → GELU → W₂: [64→16] daralt", output: "Parametre: 16×64 + 64×16 = 2,048 (toplam parametrelerin büyük kısmı!)" },
      code: "# microGPT MLP:\nclass MLP(nn.Module):\n    def __init__(self, d):\n        self.fc1 = nn.Linear(d, 4*d)   # genişlet\n        self.fc2 = nn.Linear(4*d, d)   # daralt\n    def forward(self, x):\n        return self.fc2(F.gelu(self.fc1(x)))",
      keyPoint: "MLP = 'düşünme' katmanı. Dikkat bilgiyi toplar, MLP bu bilgiyi işler ve dönüştürür.",
    },
  ],
  "week4_s4": [
    {
      title: "Aktivasyon: Doğrusallık Tuzağı",
      desc: "Aktivasyon fonksiyonu olmadan, kaç katman eklersen ekle, sonuç tek bir matris çarpımına eşdeğerdir. Doğrusal olmayanlık ağa gerçek öğrenme gücü verir.",
      formula: "W₂(W₁x) = (W₂W₁)x = W'x → tek katman etkisi!",
      example: { input: "ReLU(z) = max(0, z) → negatifler 0 olur, pozitifler kalır", output: "GELU(z) = z × Φ(z) → düzgün ReLU, GPT/BERT tercih eder" },
      code: "# microGPT: ReGLU² kullanır\ndef relu2(x):\n    return F.relu(x) ** 2  # max(0,x)²",
      keyPoint: "Aktivasyon olmadan: 100 katman = 1 katman. Aktivasyon ile: her katman YENİ özellikler öğrenir.",
    },
  ],
  "week4_s5": [
    {
      title: "Residual Bağlantılar: Gradient Highway",
      desc: "Residual bağlantı, katmanın çıktısını girdisiyle toplar: x + f(x). Bu, gradyanın doğrudan akmasını sağlar ve derin ağları eğitilebilir kılar.",
      formula: "x_out = x + f(x)    (f = attention veya MLP)",
      example: { input: "Residual olmadan: x → f₁ → f₂ → f₃ (gradyan her katmanda küçülür)", output: "Residual ile: gradyan doğrudan akar: ∂x_out/∂x = 1 + ∂f/∂x → en az 1!" },
      code: "# microGPT residual connection:\nx = x + self.attn(self.ln1(x))  # dikkat + residual\nx = x + self.mlp(self.ln2(x))   # MLP + residual",
      keyPoint: "Residual = 'en kötü ihtimalle hiçbir şey yapma'. Gradient highway: 96 katmanda bile gradyan kaybolmaz.",
    },
  ],
  "week4_s6": [
    {
      title: "Weight Initialization: Kritik Başlatma",
      desc: "Ağırlıkların başlangıç değerleri eğitimin başarısını belirler. Çok büyük → gradyan patlaması. Çok küçük → gradyan sönmesi.",
      formula: "Xavier: W ~ N(0, 1/√n)    He: W ~ N(0, √(2/n))",
      example: { input: "n_embd=16 → std = 1/√16 = 0.25", output: "Ağırlıklar [-0.5, 0.5] civarında başlar — ne çok büyük ne çok küçük" },
      code: "# PyTorch varsayılan: Kaiming/He initialization\n# microGPT: nn.Linear zaten uygun init yapar\nnn.init.normal_(self.weight, std=0.02)",
      keyPoint: "İyi init = eğitim hızla başlar. Kötü init = eğitim hiç başlamaz veya patlar.",
    },
  ],
  "week4_s7": [
    {
      title: "RMSNorm vs LayerNorm Karşılaştırma",
      desc: "LayerNorm ortalamayı çıkarır ve standart sapmaya böler. RMSNorm sadece RMS'ye böler (ortalama çıkarmaz). RMSNorm daha hızlı ve modern modellerde tercih edilir.",
      formula: "LayerNorm: (x - μ) / σ × γ + β\nRMSNorm: x / RMS(x) × γ",
      example: { input: "x = [4, 2, 6]", output: "LayerNorm: μ=4, σ=1.63 → [-0, -1.22, 1.22]\nRMSNorm: RMS=4.32 → [0.93, 0.46, 1.39]" },
      keyPoint: "RMSNorm: daha az hesaplama, benzer performans. LLaMA, GPT-4 RMSNorm kullanır.",
    },
  ],
  "week5_s0": [
    {
      title: "Optimizasyon: Kaybı Minimize Et",
      desc: "Eğitim = kayıp fonksiyonunu minimize eden ağırlıkları bulmak. Gradient descent kaybın azaldığı yönde küçük adımlar atar.",
      formula: "w ← w - η × ∂L/∂w    (η = öğrenme oranı)",
      example: { input: "Dağda sisli bir gece: en dik iniş yönünü bul → küçük adım at → tekrarla", output: "Her adımda kayıp biraz azalır → sonunda 'vadi' (minimum) bulunur" },
      keyPoint: "Gradyan = 'hangi yönde tırmanırım?' bilgisi. Biz TERSİ yönde yürürüz → kayıp düşer.",
    },
  ],
  "week5_s1": [
    {
      title: "Gradient Descent: Adım Adım",
      desc: "Her eğitim adımında: ileri geçiş (tahmin yap) → kayıp hesapla → geri geçiş (gradyan bul) → ağırlıkları güncelle.",
      formula: "1. ŷ = model(x)        # ileri geçiş\n2. L = loss(ŷ, y)       # kayıp\n3. ∂L/∂w = backward()   # gradyanlar\n4. w = w - η × ∂L/∂w    # güncelleme",
      example: { input: "Doğru: 'e', Tahmin: P('e')=0.1 (düşük) → Loss yüksek", output: "Gradyan 'e' olasılığını artıracak yönü gösterir → güncelleme → P('e')=0.15" },
      code: "# microGPT eğitim döngüsü:\nfor step in range(max_steps):\n    logits, loss = model(x, targets)\n    optimizer.zero_grad()  # gradyanları sıfırla\n    loss.backward()        # gradyanları hesapla\n    optimizer.step()       # ağırlıkları güncelle",
      keyPoint: "Bu 4 satır TÜM sinir ağı eğitiminin özüdür. GPT-4 bile aynı döngüyü kullanır.",
    },
  ],
  "week5_s2": [
    {
      title: "Eğitim Simülasyonu: LR Etkisi",
      desc: "Öğrenme oranı (learning rate) en kritik hiperparametredir. Çok büyük → kayıp salınır/patlar. Çok küçük → çok yavaş öğrenir.",
      formula: "w_new = w_old - lr × gradient",
      example: { input: "lr=0.1: büyük adımlar → hızlı ama kararsız, salınır", output: "lr=0.0001: küçük adımlar → kararlı ama 10x yavaş öğrenir" },
      code: "# microGPT: Adam optimizer, lr=0.01\noptimizer = torch.optim.Adam(model.parameters(), lr=1e-2)",
      keyPoint: "İdeal LR aralığı: genelde 1e-4 ile 1e-2 arası. Adam optimizer LR'yi otomatik ayarlar.",
    },
  ],
  "week5_s3": [
    {
      title: "Cross-Entropy Loss: Bilgi Teorisi",
      desc: "Cross-entropy, modelin tahmin dağılımının gerçek dağılımdan ne kadar uzak olduğunu ölçer. Doğru tokena verilen olasılık ne kadar yüksekse kayıp o kadar düşük.",
      formula: "CE = -log P(doğru_token)",
      example: { input: "Doğru token: 'e'", output: "P('e')=0.9 → L=-log(0.9)=0.105 (düşük kayıp ✅)\nP('e')=0.01 → L=-log(0.01)=4.605 (yüksek kayıp ❌)" },
      code: "# PyTorch'ta cross-entropy:\nloss = F.cross_entropy(logits.view(-1, V), targets.view(-1))\n# İçerde: softmax + negative log likelihood",
      keyPoint: "Kayıp = modelin şaşkınlığının ölçüsü. Düşük kayıp = model doğru tahmin ediyor.",
    },
  ],
  "week5_s4": [
    {
      title: "Logaritma: Neden -log Kullanırız?",
      desc: "Olasılıklar çarpılır ve çok küçük sayılar oluşur (10⁻¹⁰⁰⁰). Log dönüşümü çarpmayı toplamaya çevirir ve sayıları yönetilebilir tutar.",
      formula: "log(a × b) = log(a) + log(b)    -log(1) = 0, -log(0.5) = 0.69, -log(0.01) = 4.6",
      example: { input: "P(cümle) = 0.1 × 0.2 × 0.3 = 0.006 (çok küçük!)", output: "-log: 1.0 + 0.7 + 0.5 = 2.2 (yönetilebilir sayı)" },
      keyPoint: "-log(p): p=1 → 0 (mükemmel tahmin), p→0 → ∞ (kötü tahmin). Bu doğal bir kayıp fonksiyonu.",
    },
  ],
  "week5_s5": [
    {
      title: "Adam Optimizer: SGD'nin Evrimi",
      desc: "Adam, SGD'nin iki sorunununu çözer: momentum ile salınımı azaltır, adaptif öğrenme oranı ile her parametre için ayrı hız kullanır.",
      formula: "Adam: m = β₁m + (1-β₁)g, v = β₂v + (1-β₂)g², w = w - η × m/√v",
      example: { input: "SGD: tüm parametreler aynı hızda → bazıları çok hızlı, bazıları çok yavaş", output: "Adam: sık güncellenen parametreleri yavaşlat, nadir güncellenenleri hızlandır" },
      code: "# SGD → Adam evrimi:\n# SGD:  w -= lr * grad\n# +Momentum: w -= lr * running_avg(grad)\n# +Adaptive: w -= lr * running_avg(grad) / sqrt(running_avg(grad²))\n# = Adam!",
      keyPoint: "Pratik: Adam (veya AdamW) neredeyse her zaman iyi çalışır. microGPT dahil.",
    },
  ],
  "week5_s6": [
    {
      title: "Learning Rate Schedule & Eğitim Döngüsü",
      desc: "Sabit öğrenme oranı yerine, eğitim boyunca LR'yi değiştirmek daha iyi sonuç verir. Warmup + cosine decay en yaygın stratejidir.",
      example: { input: "Warmup (ilk 100 adım): lr = 0 → 0.01 (yavaşça artır)", output: "Decay (geri kalan): lr = 0.01 → 0.001 (kosinüs eğrisiyle azalt)" },
      code: "# microGPT: basit sabit lr\n# GPT-3: warmup + cosine decay\nfor step in range(max_steps):\n    lr = get_lr(step)  # warmup + decay\n    for p in model.parameters():\n        p.data -= lr * p.grad",
      keyPoint: "Warmup: başta patlamamayı önler. Decay: sonda ince ayar yapar. İkisi birlikte en iyi.",
    },
  ],
  "week5_s7": [
    {
      title: "Gradient Sıfırlama: Neden zero_grad()?",
      desc: "PyTorch gradyanları biriktirir (toplar). Her eğitim adımından önce sıfırlamazsak, önceki adımların gradyanları karışır.",
      formula: "YANLIŞ: grad = grad_step1 + grad_step2 + ... (birikir!)\nDOĞRU: her adımda grad = 0 → sadece bu adımın gradyanı",
      example: { input: "Adım 1: grad=0.5, Adım 2: grad=0.3", output: "zero_grad yok → grad=0.8 (yanlış!) | zero_grad var → grad=0.3 (doğru)" },
      code: "# Her adımda 3 satır:\noptimizer.zero_grad()  # 1. sıfırla\nloss.backward()        # 2. hesapla\noptimizer.step()       # 3. güncelle",
      keyPoint: "zero_grad() unutulursa model yanlış yönde güncellenir. En sık yapılan hata!",
    },
  ],
  "week6_s0": [
    {
      title: "Eğitim vs Inference: İki Farklı Mod",
      desc: "Eğitimde model tüm tokenlara paralel bakar ve kayıp hesaplar. Inference'da tek tek token üretir — tamamen farklı bir süreç.",
      example: { input: "Eğitim: 'Ali okula gitti' → tüm tokenlar aynı anda, kayıp = -log P(her doğru token)", output: "Inference: 'Ali' → 'okula' → 'gitti' → ... tek tek, otoregresif" },
      code: "# Eğitim modu:\nmodel.train()\nlogits, loss = model(x, targets)  # paralel, kayıp var\n\n# Inference modu:\nmodel.eval()\nwith torch.no_grad():  # gradyan hesaplama kapalı\n    output = model.generate(prompt)  # tek tek üret",
      keyPoint: "Eğitim: paralel, hızlı, gradyan var. Inference: sıralı, yavaş, gradyan yok.",
    },
  ],
  "week6_s1": [
    {
      title: "Autoregressive Generation: Token Token",
      desc: "Otoregresif üretim: model bir token üretir, bu token girdiye eklenir, tekrar model çalıştırılır. EOS gelene kadar devam.",
      formula: "P(w₁...wₙ) = P(w₁) × P(w₂|w₁) × P(w₃|w₁w₂) × ...",
      example: { input: "Seed: 'A' → Model: 'l' (%30) → 'i' (%45) → ' ' (%50) → [EOS]", output: "Sonuç: 'Ali ' — model bir isim üretti!" },
      code: "# microGPT generate:\ndef generate(self, idx, max_new):\n    for _ in range(max_new):\n        logits = self(idx[:, -block_size:])\n        probs = F.softmax(logits[:, -1, :], dim=-1)\n        next_id = torch.multinomial(probs, 1)\n        idx = torch.cat([idx, next_id], dim=1)\n    return idx",
      keyPoint: "Her adımda sadece SON tokenin logitleri kullanılır. Önceki tokenlar bağlam olarak kalır.",
    },
  ],
  "week6_s2": [
    {
      title: "Temperature & Sampling Etkisi",
      desc: "Temperature olasılık dağılımını yeniden şekillendirir. Düşük temperature = güvenli/tekrarlayıcı. Yüksek temperature = yaratıcı/riskli.",
      formula: "P(i) = exp(zᵢ/τ) / Σⱼ exp(zⱼ/τ)    τ = temperature",
      example: { input: "Logits: [3.0, 1.5, 0.5] → τ=1.0: [0.73, 0.16, 0.11]", output: "τ=0.5: [0.91, 0.07, 0.02] (keskin) | τ=2.0: [0.49, 0.29, 0.22] (düz)" },
      code: "# microGPT temperature:\nlogits = logits / temperature\nprobs = F.softmax(logits, dim=-1)\nnext_tok = torch.multinomial(probs, 1)",
      keyPoint: "τ→0: greedy (hep aynı çıktı). τ=1: normal. τ→∞: rastgele (anlamsız çıktı).",
    },
  ],
  "week6_s3": [
    {
      title: "Temperature: Matematiksel Detay",
      desc: "Temperature logitleri bölmek, softmax'ın girdilerini ölçekler. Küçük τ farkları büyütür (keskin), büyük τ farkları küçültür (düz).",
      formula: "τ=0.5: logit/0.5 → farklar 2x büyür → softmax daha keskin\nτ=2.0: logit/2.0 → farklar yarılanır → softmax daha düz",
      example: { input: "Logits: [2, 1, 0]", output: "τ=0.5 → [4,2,0] → softmax: [0.84, 0.14, 0.02]\nτ=2.0 → [1,0.5,0] → softmax: [0.51, 0.31, 0.19]" },
      keyPoint: "Temperature kodu sadece 1 satır: logits = logits / τ — ama etkisi dramatik.",
    },
  ],
  "week6_s4": [
    {
      title: "Sampling Stratejileri: Greedy, Top-k, Top-p",
      desc: "Greedy her zaman en olası tokeni seçer. Top-k ve Top-p düşük olasılıklı tokenleri keserek hem yaratıcı hem de mantıklı çıktılar sağlar.",
      formula: "Top-k: en yüksek k tokeni tut, diğerlerini sıfırla\nTop-p: P kümülatif ≥ p olana kadar token ekle",
      example: { input: "Olasılıklar: a(%40) b(%25) c(%15) d(%10) e(%5) f(%3) g(%2)", output: "Greedy: hep 'a' | Top-3: {a,b,c} arası | Top-p(0.8): {a,b,c} (kümülatif=%80)" },
      keyPoint: "Pratikte: temperature=0.7 + top_p=0.9 kombinasyonu iyi çalışır.",
    },
  ],
  "week6_s5": [
    {
      title: "KV Cache: Hızlı Inference",
      desc: "Her yeni token üretiminde önceki tokenların K ve V vektörlerini yeniden hesaplamak israf. KV cache bunları bellekte saklar.",
      formula: "Naive: her adımda O(n²) hesaplama\nKV Cache: önceki K,V'leri sakla → sadece yeni tokenin Q'sunu hesapla → O(n)",
      example: { input: "100. token üretilirken: naive → 100 token × 100 token = 10,000 işlem", output: "KV cache → sadece yeni Q × 100 eski K = 100 işlem (100x hızlı!)" },
      code: "# KV cache pseudocode:\nif cache is not None:\n    k = torch.cat([cache_k, new_k], dim=1)  # eski K + yeni K\n    v = torch.cat([cache_v, new_v], dim=1)\n    cache = (k, v)  # güncelle",
      keyPoint: "KV cache olmadan LLM çıkarımı pratik olarak imkansız — çok yavaş olur.",
    },
  ],
  "week6_s6": [
    {
      title: "Inference Pipeline: Uçtan Uca",
      desc: "Tam inference pipeline'ı: metin girişinden çıktı metnine kadar olan tüm adımlar.",
      formula: "Metin → Tokenize → Embed → N×[Norm→Attn→+→Norm→MLP→+] → LM Head → Softmax → Sample → Decode → Metin",
      example: { input: "Girdi: 'Merhaba'", output: "→ [312,4521] → embed → transformer × N → logits → softmax → [89] → 'ben' → tekrarla" },
      code: "# microGPT full pipeline:\ntokens = encode('Ah')          # metin → sayılar\ntensor = torch.tensor([tokens]) # tensor'a çevir\noutput = model.generate(tensor, max_new_tokens=20)\nprint(decode(output[0].tolist()))  # 'Ahmet' gibi bir isim",
      keyPoint: "243 satır kodla tam pipeline: encode → model → decode. Her şey burada.",
    },
  ],
  "week6_s7": [
    {
      title: "microGPT vs Production GPT: Kapanış",
      desc: "microGPT ve GPT-4 aynı algoritmayı kullanır. Fark sadece ölçek, veri ve mühendislik detaylarındadır.",
      example: { input: "microGPT: 3,648 param, 27 vocab, CPU, 30 saniye eğitim", output: "GPT-4: ~1.8T param, 100K vocab, 10K GPU, aylar süren eğitim" },
      keyPoint: "Algoritmayı anladıysanız, GPT-4'ü de anladınız. Geri kalan mühendislik detayı.",
    },
  ],
  "week7_s0": [
    {
      title: "Scaling Laws: Daha Büyük = Daha İyi?",
      desc: "BDM performansı 3 faktörle üs yasası olarak ölçeklenir: parametre sayısı, veri miktarı ve hesaplama gücü. Bu ilişki öngörülebilir ve güvenilirdir.",
      formula: "L(N) ∝ N⁻⁰·⁰⁷⁶    L(D) ∝ D⁻⁰·⁰⁹⁵    L(C) ∝ C⁻⁰·⁰⁵⁰",
      example: { input: "10x parametre → kayıp %15 düşer", output: "10x veri → kayıp %18 düşer | 10x hesaplama → kayıp %11 düşer" },
      keyPoint: "Chinchilla: N parametre için ~20N token veri gerekir. Daha fazla parametre her zaman daha iyi DEĞİL — dengelemek lazım.",
    },
  ],
  "week7_s1": [
    {
      title: "GPT Zaman Çizelgesi: 2017 → Bugün",
      desc: "Transformer mimarisinden ChatGPT'ye uzanan yolculuk sadece 5 yıl sürdü. Her yıl ölçek 10x büyüdü.",
      example: { input: "2017: Attention Is All You Need (Vaswani) → Transformer doğdu", output: "2018: GPT-1 (117M) → 2019: GPT-2 (1.5B) → 2020: GPT-3 (175B) → 2022: ChatGPT → 2023: GPT-4" },
      keyPoint: "5 yılda 10,000x büyüme. Algoritma aynı kaldı, sadece ölçek değişti.",
    },
  ],
  "week7_s2": [
    {
      title: "Donanım: Neden GPU Gerekli?",
      desc: "Dikkat mekanizması büyük matris çarpımları gerektirir. GPU binlerce çekirdeğiyle bu işlemleri paralel yapabilir.",
      formula: "QKᵀ: [N×d] × [d×N] = N² çarpma → GPU'da paralel",
      example: { input: "CPU: 8-64 çekirdek, sıralı → microGPT: 30 sn", output: "GPU: 10,000+ çekirdek, paralel → GPT-3: 10,000 GPU × haftalarca" },
      keyPoint: "microGPT CPU'da çalışır (küçük ölçek). Gerçek LLM'ler GPU/TPU kümesi gerektirir.",
    },
  ],
  "week7_s3": [
    {
      title: "Eğitim Pipeline: Pre-training → SFT → RLHF",
      desc: "Modern BDM eğitimi 3 aşamalıdır: önce büyük veri üzerinde ön eğitim, sonra kaliteli örneklerle ince ayar, son olarak insan geri bildirimiyle hizalama.",
      example: { input: "Aşama 1: Web metni (terabyte'larca) → sonraki token tahmini", output: "Aşama 2: İnsan yazımı soru-cevap → SFT | Aşama 3: Hangisi daha iyi? → RLHF" },
      code: "# microGPT sadece Aşama 1'i yapar:\n# Pre-training: isimleri tahmin et\n# Aşama 2-3 büyük modeller için",
      keyPoint: "Pre-training = ham yetenek. SFT = 'nasıl konuşulur' öğretir. RLHF = zararlı olmamayı öğretir.",
    },
  ],
  "week7_s4": [
    {
      title: "Tokenization Evrimi",
      desc: "Karakter düzeyinden BPE'ye, oradan SentencePiece'e: tokenization yöntemleri dilin yapısına göre evrildi.",
      example: { input: "Karakter: 'merhaba' = 7 token (çok uzun)", output: "BPE: 'merhaba' = 2-3 token | Sözcük: 'merhaba' = 1 token (ama OOV sorunu)" },
      keyPoint: "BPE = altın denge. Bilinmeyen sözcük yok, diziler makul uzunlukta.",
    },
  ],
  "week7_s5": [
    {
      title: "Dikkat Evrimi: Vanilla → Flash → Sliding",
      desc: "Orijinal dikkat O(n²) bellek ve hesaplama gerektirir. Modern yöntemler bunu dramatik şekilde azaltır.",
      formula: "Vanilla: O(n²) bellek | Flash: O(n) bellek, 2-4x hız | Sliding: O(n×w) hesaplama",
      example: { input: "Vanilla Attention, n=4096: 4096² = 16M elemanlı matris!", output: "Flash: aynı sonuç, ama bellekte 16M yerine ~4K tutar" },
      keyPoint: "Flash Attention sayesinde bağlam penceresi 2K'dan 128K+'ya çıktı.",
    },
  ],
  "week7_s6": [
    {
      title: "Açık Kaynak LLM'ler: LLaMA → DeepSeek",
      desc: "2023'ten itibaren açık kaynak modeller kapalı kaynak modellerle rekabet etmeye başladı. Bu demokratikleşme araştırmayı hızlandırdı.",
      example: { input: "2023: LLaMA (Meta, 7-65B) → ilk güçlü açık model", output: "2024: LLaMA-3, Mistral (7B MoE), DeepSeek (671B MoE) → GPT-4 seviyesine yakın" },
      keyPoint: "Açık kaynak = herkes erişebilir, geliştirebilir, denetleyebilir. Araştırma hızı 10x arttı.",
    },
  ],
  "week7_s7": [
    {
      title: "Güncel Trendler: MoE, RAG, Agent",
      desc: "Modern AI 4 ana trendi takip ediyor: verimli mimariler (MoE), dış bilgi (RAG), araç kullanma (Agent) ve çoklu modal (Multimodal).",
      example: { input: "MoE: 671B parametre ama sadece 37B aktif → hızlı ama güçlü", output: "RAG: model bilmediğini sorar → halüsinasyon ↓ | Agent: model araç kullanır (web, kod, API)" },
      keyPoint: "Gelecek: daha büyük değil daha akıllı modeller. Araç kullanma + düşünme + dış bilgi.",
    },
  ],
  "weekB_s0": [
    {
      title: "Attention Is All You Need — Neden Devrim?",
      desc: "2017 öncesi NLP dünyasında RNN ve LSTM hakimdi. Google'dan 8 araştırmacı, RNN'yi tamamen kaldırıp sadece attention kullanan bir model önerdi. Sonuç: hem daha hızlı hem daha doğru.",
      formula: "Attention(Q,K,V) = softmax(QKᵀ/√dₖ)V",
      example: { input: "Bu TEK formül tüm makaleyi özetler", output: "Q·K = benzerlik skoru → softmax = olasılık → V ile çarp = bilgi al" },
      keyPoint: "İsim 'Attention Is All You Need' = sadece dikkat mekanizması yeterli, başka hiçbir şeye gerek yok."
    }
  ],
  "weekB_s1": [
    {
      title: "RNN'nin 3 Büyük Sorunu",
      desc: "RNN sözcükleri birer birer işler: t₁ → t₂ → t₃ → ... Bu sıralı yapı 3 kritik sorun yaratır.",
      formula: "RNN: hₜ = f(hₜ₋₁, xₜ) — her adım öncekine bağımlı → paralel yapılamaz",
      example: { input: "100 sözcüklük cümle → RNN: 100 sıralı adım (yavaş!)", output: "Transformer: 1 paralel adım → tüm sözcükler aynı anda (hızlı!)" },
      keyPoint: "1. Sıralı → yavaş 2. Uzak sözcükleri unutur 3. Gradient sönmesi. Transformer üçünü de çözer."
    }
  ],
  "weekB_s2": [
    {
      title: "Attention: Kütüphane Analojisi",
      desc: "Bir kütüphaneye girip 'yapay zeka kitabı' arıyorsunuz (Query). Her rafta etiket var (Key). Etiket sorunuzla ne kadar uyumluysa, o raftan o kadar bilgi (Value) alırsınız.",
      formula: "score(Q,K) = Q·K → yüksek benzerlik = daha fazla dikkat",
      example: { input: "Q: 'yapay zeka' | K₁: 'fizik', K₂: 'AI temelleri', K₃: 'yemek'", output: "score: 0.1, 0.85, 0.05 → K₂'nin Value'su en çok alınır" },
      code: "# Self-attention: her token hem Q hem K hem V rolünde\nQ = x @ Wq   # ne arıyorum?\nK = x @ Wk   # bende ne var?\nV = x @ Wv   # işte bilgim",
      keyPoint: "Self-attention'da her sözcük hem soru sorar hem cevap verir. Bu yüzden bağlam bilgisi çok zengin."
    }
  ],
  "weekB_s3": [
    {
      title: "3 Temel Formül",
      desc: "Makalenin tüm matematiği 3 formüle sığar. Her birini kaydırıcılarla keşfedebilirsiniz.",
      formula: "① Dot Product: Q·K = Σ qᵢ×kᵢ\n② Softmax: P(i) = eˣⁱ / Σ eˣʲ\n③ Attention: softmax(QKᵀ/√d) × V",
      example: { input: "Q=[1,0,1], K=[1,1,0] → Q·K = 1×1 + 0×1 + 1×0 = 1", output: "√d ölçekleme: d=64 ise → skor/8 (gradyanları stabilize eder)" },
      keyPoint: "Multi-head: aynı girdiyi 8 farklı perspektiften analiz et → concat → proje. Paralel çalışır!"
    }
  ],
  "weekB_s4": [
    {
      title: "Encoder-Decoder Mimarisi",
      desc: "Encoder girdi cümlesini anlar, Decoder çıktı cümlesini üretir. Her biri 6 katmandan oluşur. Her katmanda: Attention + FFN + Residual + LayerNorm.",
      formula: "Encoder katman: x → MultiHead(x,x,x) + x → FFN(.) + . → çıktı\nDecoder: masked self-attn → cross-attn(encoder) → FFN",
      example: { input: "Encoder: 'I love AI' → zenginleştirilmiş temsil", output: "Decoder: [BOS] → 'Yapay' → 'zekayı' → 'seviyorum' → [EOS]" },
      keyPoint: "microGPT sadece Decoder kullanır (GPT tarzı). BERT sadece Encoder kullanır. Orijinal Transformer ikisini birden kullanır."
    }
  ],
  "weekB_s5": [
    {
      title: "Pozisyon Kodlama: sin/cos Dalgaları",
      desc: "Attention sıra bilmez: 'Ali Ayşe'yi sevdi' ile 'Ayşe Ali'yi sevdi' aynı görünür. Sin/cos dalgaları her pozisyona benzersiz bir parmak izi ekler.",
      formula: "PE(pos, 2i) = sin(pos / 10000^(2i/d))\nPE(pos, 2i+1) = cos(pos / 10000^(2i/d))",
      example: { input: "Pozisyon 0: [sin(0), cos(0), sin(0), cos(0), ...]", output: "Pozisyon 5: [sin(5), cos(5), sin(5/100), cos(5/100), ...] — her biri benzersiz" },
      keyPoint: "Sin/cos avantajı: eğitimde 50 token gördü ama 500 token'da da çalışır (genelleme). Öğrenilebilir embedding bunu yapamaz."
    }
  ],
  "weekB_s6": [
    {
      title: "Eğitim: 8 GPU, 3.5 Gün",
      desc: "Base model (65M param): 12 saat eğitim. Big model (213M param): 3.5 gün. WMT 2014 İngilizce-Almanca ve İngilizce-Fransızca çeviri görevleri.",
      formula: "lr = d⁻⁰·⁵ × min(step⁻⁰·⁵, step × warmup⁻¹·⁵)",
      example: { input: "Warmup: 4000 adım boyunca lr artır", output: "Sonra: adım⁻⁰·⁵ ile azalt. Dropout=0.1, Label smoothing ε=0.1" },
      keyPoint: "EN→DE: 28.4 BLEU (yeni rekor!). EN→FR: 41.8 BLEU (tek modelle en iyi). Ve daha az eğitim süresi!"
    }
  ],
  "weekB_s7": [
    {
      title: "Bu Makale Dünyayı Nasıl Değiştirdi?",
      desc: "15 sayfa, 8 yazar, 90K+ atıf. GPT, BERT, ChatGPT, DALL-E, AlphaFold, Copilot — hepsi Transformer tabanlı. AI'ın her alanını dönüştürdü.",
      example: { input: "2017: Transformer (çeviri) → 2018: BERT + GPT-1", output: "2020: GPT-3 (175B) → 2022: ChatGPT → 2023: GPT-4 → 2024: Açık kaynak yarışı" },
      keyPoint: "Sadece NLP değil: görüntü (ViT), protein (AlphaFold), müzik (MusicGen), kod (Copilot), robotik..."
    }
  ],
};

const SlideRefPanel = ({ weekIdx, sectionIdx }) => {
  const key = `week${weekIdx}_s${sectionIdx}`;
  const cards = EMBEDDED_SLIDES[key];
  if (!cards || cards.length === 0) return null;
  return (
    <div style={{ marginTop: 10, marginBottom: 14 }}>
      {cards.map((card, i) => (
        <div key={i} style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: 14, padding: "18px 20px", marginBottom: i < cards.length - 1 ? 14 : 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#A78BFA", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 20, background: "#A78BFA", borderRadius: 2, flexShrink: 0 }}></span>
            {card.title}
          </div>

          <p style={{ fontSize: 15, lineHeight: 1.75, color: "#B0B8C4", margin: "0 0 12px 0" }}>{card.desc}</p>

          {card.formula && (
            <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Formül</div>
              <pre style={{ margin: 0, fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#C4B5FD", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{card.formula}</pre>
            </div>
          )}

          {card.example && (
            <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Örnek</div>
              <div style={{ fontSize: 13, color: "#6EE7B7", lineHeight: 1.6 }}>
                <span style={{ color: "#9CA3AF" }}>Girdi: </span>{card.example.input}
              </div>
              <div style={{ fontSize: 13, color: "#A7F3D0", lineHeight: 1.6, marginTop: 4 }}>
                <span style={{ color: "#9CA3AF" }}>Çıktı: </span>{card.example.output}
              </div>
            </div>
          )}

          {card.code && (
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>microGPT Kodu</div>
              <pre style={{ margin: 0, fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#E2E8F0", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{card.code}</pre>
            </div>
          )}

          {card.keyPoint && (
            <div style={{ background: "rgba(251,191,36,0.06)", borderLeft: "3px solid rgba(251,191,36,0.4)", borderRadius: "0 8px 8px 0", padding: "8px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FBBF24", marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>Anahtar Nokta</div>
              <div style={{ fontSize: 13, color: "#FDE68A", lineHeight: 1.6 }}>{card.keyPoint}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const INSTRUCTOR_NOTES = {
  // W0
  "week0_s0": { time: 10, difficulty: 1, prep: "microGPT'yi önceden çalıştırın, 2-3 isim üretin. Öğrencilere canlı gösterin.", emphasize: "243 satır = gerçek GPT. Aynı algoritma, sadece ölçek farkı.", studentQs: [
    { q: "Bu gerçek GPT mi?", a: "Evet! Aynı Transformer mimarisi. GPT-4 ile fark sadece parametre sayısı (3,648 vs ~1.8T) ve eğitim verisi." },
    { q: "Neden Python? Neden C++ değil?", a: "Okunabilirlik. Amaç öğrenmek, hız değil. Production'da PyTorch/C++ kullanılır." }
  ], cheatSheet: "microGPT: 243 satır, 3,648 param, 27 token vocab, 16-dim embedding, 4 head, 1 layer, block_size=8" },
  "week0_s1": { time: 5, difficulty: 1, prep: "Basit bir sinir ağı diyagramı tahtaya çizin (3 daire → 2 daire → 1 daire).", emphasize: "Sinir ağı = çarpma + toplama. Korkutucu değil.", studentQs: [
    { q: "Biyolojik nöronla ilgisi var mı?", a: "İsim oradan geliyor ama benzerlik yüzeysel. Matematiksel fonksiyon olarak düşünün." }
  ], cheatSheet: "Nöron: output = activation(w₁x₁ + w₂x₂ + ... + b)" },
  "week0_s2": { time: 5, difficulty: 1, emphasize: "Dil modeli = P(sonraki token | öncekiler). Tüm ders bu TEK cümle üzerine kurulu.", studentQs: [
    { q: "ChatGPT de aynı şeyi mi yapıyor?", a: "Evet! Her seferinde bir sonraki tokeni tahmin eder. 'Akıllılık' çok büyük ölçekten geliyor." }
  ], cheatSheet: "Dil modeli: P(xₜ | x₁, x₂, ..., xₜ₋₁) — koşullu olasılık" },
  "week0_s3": { time: 8, difficulty: 2, prep: "Pipeline diyagramını tahtaya çizin. Her kutuyu renklendirin.", emphasize: "Bu pipeline W1-W6'da detaylı işlenecek. Şimdi büyük resmi görsünler.", studentQs: [
    { q: "Her adım ne kadar sürer?", a: "microGPT'de mikrosaniyeler. GPT-4'te bir token ~50ms. Ama milyarlarca parametre çarpılıyor." }
  ], cheatSheet: "Pipeline: Token → Embed → Pos → Attention → MLP → Softmax → Sample" },
  "week0_s4": { time: 3, difficulty: 1, emphasize: "Framework'ler kara kutu, biz cam kutu yapıyoruz. Analoji: araba kullanmak vs motor anlamak." },
  "week0_s5": { time: 5, difficulty: 1, prep: "Python 3.10+ ve metin editörü hazır olsun. Canlı kurulum gösterin.", emphasize: "GPU gerekmez. Laptop yeterli. 3 dakikada eğitim biter." },
  "week0_s6": { time: 8, difficulty: 1, prep: "Terminalde python microgpt.py çalıştırın. Loss düşüşünü ve isim üretimini gösterin.", emphasize: "İlk çalıştırma anı öğrenciler için çok motivasyonel. Hep birlikte yapın.", studentQs: [
    { q: "Neden garip isimler üretiyor?", a: "Model İngilizce isim istatistiklerini öğreniyor. Gerçek olmayan ama 'İngilizce gibi duran' isimler üretiyor." }
  ] },
  "week0_s7": { time: 10, difficulty: 2, prep: "7 parametreyi değiştirerek 2-3 farklı sonuç hazırlayın.", emphasize: "n_embd ve n_layer'ı değiştirerek loss farkını gösterin. Öğrencilere de denetin.", studentQs: [
    { q: "En iyi parametreler ne?", a: "Harika soru — bunu sistematik olarak araştırabilirsinizacağız (NAS projesi)!" }
  ], cheatSheet: "7 param: n_embd=16, n_head=4, n_layer=1, block_size=8, batch=32, lr=0.01, steps=1000" },
  // W1
  "week1_s0": { time: 8, difficulty: 2, prep: "'emma' ismini tahtaya yazıp tokenize edin: → [BOS, e, m, m, a, BOS]", emphasize: "Token = modelin gördüğü en küçük birim. Karakter düzeyinde = her harf bir token.", studentQs: [
    { q: "GPT-4 de karakter karakter mı bakıyor?", a: "Hayır, BPE kullanıyor: 'playing' → ['play', 'ing']. Biz basitlik için karakter düzeyi kullanıyoruz." },
    { q: "Neden 27 token?", a: "a-z (26) + özel BOS/EOS tokeni (1) = 27. İsimler sadece küçük harften oluşuyor." }
  ], cheatSheet: "Vocab: a-z (26) + BOS (0) = 27 token. stoi: char→int, itos: int→char" },
  "week1_s1": { time: 5, difficulty: 2, emphasize: "Embedding = anlamsız ID'yi anlamlı vektöre çevirme. Tablo araması (lookup), eğitimle öğrenilir.", cheatSheet: "wte: [27 × 16] matris. embed('a') = wte[1] → 16-boyutlu vektör" },
  "week1_s2": { time: 5, difficulty: 2, emphasize: "Transformer sıra bilmez! Pozisyon embedding olmadan 'abc' = 'cba'. Bu çok şaşırtıcı.", cheatSheet: "wpe: [8 × 16] matris. Toplam girdi = wte[token_id] + wpe[position]" },
  "week1_s3": { time: 5, difficulty: 3, emphasize: "Softmax = ham skorları olasılığa çevirme. Toplam her zaman 1.", studentQs: [
    { q: "Neden exp kullanıyoruz?", a: "Negatif sayıları pozitif yapmak + büyük farkları daha belirgin yapmak. exp(10)/exp(1) ≈ 8100×" }
  ], cheatSheet: "softmax(xᵢ) = exp(xᵢ) / Σexp(xⱼ). Max-trick: softmax(x) = softmax(x - max(x))" },
  // W2
  "week2_s0": { time: 10, difficulty: 3, prep: "Basit örnek hazırlayın: f(x)=x², df/dx=2x. x=3 → f=9, df=6.", emphasize: "Autograd olmadan öğrenme yok. Bu haftanın konusu dersin TEMELİ.", studentQs: [
    { q: "Bunun GPT ile ne ilgisi var?", a: "GPT parametrelerini nasıl güncelliyor? Loss → gradient → güncelleme. Bu sürecin motoru autograd." }
  ], cheatSheet: "Autograd: forward(hesapla) → backward(türev al) → güncelle(w -= lr * grad)" },
  "week2_s1": { time: 8, difficulty: 3, emphasize: "Her Value: data + grad + backward fonksiyonu. 3 bileşen, hepsi bu.", cheatSheet: "Value(data=3.0, grad=0.0, _backward=lambda: None)" },
  "week2_s2": { time: 8, difficulty: 4, prep: "Chain rule örneği tahtada: f(g(x)) = (3x+1)². df/dx = 2(3x+1)·3", emphasize: "Chain rule = autograd'ın TEK sırrı. Bunu anladıklarında geri kalanı kolay.", studentQs: [
    { q: "Birden fazla girdi olunca ne olur?", a: "Partial derivative: her girdi için ayrı ayrı türev al, diğerlerini sabit tut." }
  ], cheatSheet: "Chain rule: ∂L/∂x = ∂L/∂y · ∂y/∂x. Multiply: ∂(a·b)/∂a = b, ∂(a·b)/∂b = a" },
  // W3
  "week3_s0": { time: 5, difficulty: 2, emphasize: "RNN → sıralı darboğaz. Attention → paralel + uzun mesafe. 2017 devrim.", cheatSheet: "RNN: O(n) sıralı. Attention: O(n²) paralel → GPU'da çok daha hızlı" },
  "week3_s1": { time: 10, difficulty: 4, prep: "3 token örneği hazırlayın: 'a','b','c'. Q,K,V matrislerini 2×2 yapın. Elle hesaplayın.", emphasize: "Attention = her token tüm önceki tokenlara bakıp 'hangisi bana lazım?' diyor. Kütüphane analojisi.", studentQs: [
    { q: "Neden Q, K, V ayrı?", a: "Q = 'ne arıyorum', K = 'bende ne var', V = 'bilgim ne'. Rol ayrımı → esneklik." },
    { q: "Bu O(n²) değil mi? Yavaş olmaz mı?", a: "Evet, ama GPU ile paralelize edilebilir. Ve Flash Attention gibi teknikler var (W7'de göreceğiz)." }
  ], cheatSheet: "Attention(Q,K,V) = softmax(QKᵀ/√d)·V. d=head_dim=n_embd/n_head=16/4=4" },
  "week3_s2": { time: 8, difficulty: 4, emphasize: "Scaled dot-product'ın 'scaled' kısmı kritik. √d olmadan gradientler çok büyük olur.", cheatSheet: "score = Q·Kᵀ / √d_k. d_k=4 → /2. Büyük d_k → küçük gradient → daha kararlı" },
  // W4
  "week4_s0": { time: 8, difficulty: 3, prep: "Transformer bloğu diyagramı çizin: Input → Norm → Attention → +Residual → Norm → MLP → +Residual", emphasize: "Transformer = Lego. Attention + MLP bloklarını üst üste koy.", cheatSheet: "x = x + Attention(Norm(x)). x = x + MLP(Norm(x)). Residual connection = toplama" },
  "week4_s1": { time: 5, difficulty: 3, emphasize: "RMSNorm: x/√(mean(x²)+ε). LayerNorm'dan %30 hızlı, modern standart.", cheatSheet: "RMSNorm(x) = x · γ / √(mean(x²) + ε). γ öğrenilebilir, ε=1e-5" },
  "week4_s2": { time: 8, difficulty: 3, emphasize: "MLP: genişlet → aktive et → daralt. 16→64→16. Token içi bilgi işleme.", cheatSheet: "MLP(x) = W₂ · activation(W₁ · x + b₁) + b₂. Hidden=4×n_embd=64" },
  // W5
  "week5_s0": { time: 5, difficulty: 2, emphasize: "Eğitim = loss'u minimize et. Loss düşüyorsa model öğreniyor.", cheatSheet: "Eğitim döngüsü: forward → loss → backward → step → zero_grad → tekrarla" },
  "week5_s1": { time: 8, difficulty: 3, emphasize: "Cross-entropy: -log(P(doğru)). P=1 → loss=0, P=0.01 → loss=4.6. Log çok sert cezalandırır.", studentQs: [
    { q: "Neden MSE değil de cross-entropy?", a: "Olasılık dağılımları için cross-entropy daha uygun. MSE gradient'i küçük olasılıklarda çok yavaş." }
  ], cheatSheet: "CE = -log(P(doğru)). Rastgele: -log(1/27)=3.33. İyi model: -log(0.3)≈1.2" },
  "week5_s2": { time: 10, difficulty: 4, prep: "2D loss landscape çizimi hazırlayın (vadi + top analojisi).", emphasize: "GD: gradient'in tersi yönünde adım at. LR çok büyük → patlama, çok küçük → yavaş.", cheatSheet: "w = w - lr × ∂L/∂w. lr=0.01. Adam: momentum + adaptive LR per parameter" },
  // W6
  "week6_s0": { time: 8, difficulty: 2, prep: "Canlı demo: temperature=0.1 vs 1.0 vs 2.0 ile isim üretin.", emphasize: "Üretim = eğitimin tersi. Forward pass + sample. Temperature ile çeşitlilik ayarı.", studentQs: [
    { q: "Temperature neden 'sıcaklık' deniyor?", a: "Fizikten geliyor: yüksek sıcaklık → daha kaotik parçacıklar → daha rastgele dağılım." }
  ], cheatSheet: "logits/T → softmax → sample. T=0.1: deterministik, T=1: normal, T=2: kaotik" },
  "week6_s1": { time: 5, difficulty: 3, emphasize: "KV cache: önceki pozisyonları tekrar hesaplama → O(n) yerine O(1) per token.", cheatSheet: "Cache K,V her pozisyonda. Yeni token: sadece 1 Q hesapla, cache'ten K,V al" },
  // W7
  "week7_s0": { time: 8, difficulty: 2, emphasize: "Scaling laws = AI'ın Moore Yasası. 10× param → belirli miktarda loss düşüşü.", cheatSheet: "L(N) = a/N^b. Chinchilla optimal: D ≈ 20N (20 token per parametre)" },
  "week7_s1": { time: 10, difficulty: 1, prep: "Timeline'ı ekranda gösterip her dönemi tek tek geçin.", emphasize: "2017→2024: 7 yılda dünya değişti. Transformer tek makale ile başladı." },
  "week7_s3": { time: 8, difficulty: 2, emphasize: "Pre-training (%95 maliyet) → SFT → RLHF. RLHF akıl vermez, davranış düzeltir.", studentQs: [
    { q: "ChatGPT neden bazen yanlış söylüyor?", a: "Pre-training'de yanlış bilgi de öğreniyor. RLHF sadece FORMAT'ı (kibarlık, yapı) düzeltir, BİLGİ'yi düzeltmez." }
  ] },
  // W8-W9
  // W0 remaining
  "week0_s8": { time: 5, difficulty: 1, prep: "Terminal açık olsun. python microgpt.py komutunu birlikte çalıştırın.", emphasize: "İlk çalıştırma öğrenciler için büyülü an. Hep birlikte yapın!", studentQs: [
    { q: "Hata aldım?", a: "Python versiyonunu kontrol edin (3.8+). Dosya yolunu kontrol edin. En yaygın hata: yanlış dizin." }
  ] },
  "week0_s9": { time: 10, difficulty: 2, prep: "n_embd=8 vs 32, steps=100 vs 1000 sonuçlarını önceden hazırlayın.", emphasize: "Parametreleri değiştirmek = deney yapmak. Bu bilimsel sürecin başlangıcı.", studentQs: [
    { q: "Hangi parametre en önemli?", a: "n_embd ve n_layer loss'a en çok etki eder. Bunu sistematik deneylerle araştırabilirsiniz." }
  ] },
  "week0_s10": { time: 5, difficulty: 1, emphasize: "Türkçe isimler, şehir adları, kelimeler... veri değiştirmek çok kolay.", studentQs: [
    { q: "Türkçe çalışır mı?", a: "Evet ama Türkçe harfler (ğ,ü,ş,ı,ö,ç) vocab'a eklenmeli. Vocab 27→33 olur." }
  ] },
  "week0_s11": { time: 5, difficulty: 1, emphasize: "Eğitim ilerledikçe isimler daha gerçekçi olur. Loss düşüşünü gösterin." },
  "week0_s12": { time: 5, difficulty: 1, emphasize: "microGPT → GPT-4: aynı algoritma, farklı ölçek. Bu ders o köprüyü kuruyor." },
  // W1 remaining
  "week1_s4": { time: 10, difficulty: 2, prep: "Tokenizer playground'u açın. 'emma', 'michael', 'x' yazarak farkları gösterin.", emphasize: "İnteraktif deney: öğrenciler kendi isimlerini tokenize etsin." },
  "week1_s5": { time: 5, difficulty: 2, emphasize: "Vektör = yönlü büyüklük. [0.3, -0.1, 0.8] = 3 boyutlu uzayda nokta.", cheatSheet: "Vektör: v ∈ ℝⁿ. microGPT: n=16. Benzerlik: cos(a,b) = a·b / (|a||b|)" },
  "week1_s6": { time: 5, difficulty: 2, emphasize: "Embedding tablosu = öğrenilebilir sözlük. wte[5] = 'e' harfinin vektörü.", cheatSheet: "wte: [27×16]. Lookup: embed(token_id) = wte[token_id]. Eğitimle güncellenir" },
  "week1_s7": { time: 5, difficulty: 2, emphasize: "'abc' ve 'cba' position embedding olmadan AYNI görünür. Bu çok şaşırtıcı.", cheatSheet: "wpe: [8×16]. x = wte[tok] + wpe[pos]. block_size=8 → max 8 pozisyon" },
  "week1_s8": { time: 5, difficulty: 3, emphasize: "Matris çarpımı = embedding'den sonraki HER adımın temeli. y = Wx + b", cheatSheet: "[M×K] · [K×N] = [M×N]. microGPT: [batch×16] · [16×64] = [batch×64]" },
  "week1_s9": { time: 5, difficulty: 2, emphasize: "Weight tying: aynı matris giriş+çıkışta → parametre tasarrufu + tutarlılık.", cheatSheet: "logits = x @ wte.T (transpoz). 3,648 parametrenin önemli kısmı wte'de" },
  "week1_s10": { time: 5, difficulty: 2, emphasize: "Softmax: ham skor → olasılık. Toplam=1. exp kullanarak negatifi pozitife çevirir.", cheatSheet: "softmax(xᵢ) = exp(xᵢ)/Σexp(xⱼ). Max-trick: overflow önleme. Σ=1 her zaman" },
  // W2 remaining
  "week2_s3": { time: 5, difficulty: 3, emphasize: "Kısmi türev: birden fazla değişken olunca her birini ayrı türevle.", cheatSheet: "∂f/∂x: x'e göre türev, y sabit. Gradient: ∇f = [∂f/∂x, ∂f/∂y, ...]" },
  "week2_s4": { time: 10, difficulty: 3, prep: "Autograd playground'u açın. Basit bir graf oluşturup backward çalıştırın.", emphasize: "Canlı deney: öğrenciler a=2, b=3, c=a*b+a grafını oluştursun." },
  "week2_s5": { time: 5, difficulty: 3, emphasize: "Value = autograd'ın atom'u. data, grad, _children, _backward.", cheatSheet: "Value(2.0).data=2.0, .grad=0.0. Backward sonrası .grad dolacak" },
  "week2_s6": { time: 5, difficulty: 3, emphasize: "__add__, __mul__ overload: a+b yazdığınızda Python otomatik graf oluşturur.", cheatSheet: "a + b → Value.__add__(a,b) → yeni node + backward fonksiyonu kaydeder" },
  "week2_s7": { time: 8, difficulty: 4, emphasize: "Chain rule: ∂L/∂x = ∂L/∂y · ∂y/∂x. Tüm backward pass bu TEK kurala dayanır.", cheatSheet: "Add backward: grad += 1 × out.grad. Mul backward: grad += other.data × out.grad" },
  "week2_s8": { time: 5, difficulty: 3, prep: "L = (a×b)+c örneğini tahtada çizin, elle backward yapın.", emphasize: "Somut örnek: a=2, b=-3, c=10. L=(2×-3)+10=4. ∂L/∂a=-3, ∂L/∂b=2, ∂L/∂c=1" },
  "week2_s9": { time: 5, difficulty: 3, emphasize: "grad += (topla), grad = (ata) DEĞİL! Aynı değişken birden fazla yerde kullanılırsa gradientler toplanır.", studentQs: [
    { q: "Neden += kullanıyoruz?", a: "y = x+x olsun. ∂y/∂x = 2, ama iki ayrı yoldan 1+1=2. Toplama yapmazsak 1 buluruz — yanlış!" }
  ] },
  "week2_s10": { time: 5, difficulty: 2, emphasize: "Bizim Value sınıfı = PyTorch'un autograd'ının mini versiyonu. Aynı mantık, farklı ölçek." },
  // W3 remaining
  "week3_s3": { time: 8, difficulty: 3, emphasize: "Her token 'soru soruyor': Ben kim olmalıyım? Cevap için tüm önceki tokenlara bakıyor.", cheatSheet: "Attention weight α[i][j] = token i'nin token j'ye ne kadar dikkat ettiği" },
  "week3_s4": { time: 8, difficulty: 3, prep: "Kütüphane analojisi: Q=soru, K=kitap etiketi, V=kitap içeriği. Tahtaya çizin.", emphasize: "Q·K = uyum skoru. Yüksek skor = 'bu kitap bana lazım'. V = o kitabın bilgisi." },
  "week3_s5": { time: 10, difficulty: 3, prep: "Attention playground'u açın. 'abc' yazıp head kalıplarını inceleyin.", emphasize: "Her head farklı kalıp öğrenir: biri önceki harfe bakar, biri sesli harflere." },
  "week3_s6": { time: 8, difficulty: 4, prep: "3 token, 2 boyutlu Q,K,V ile elle hesaplama hazırlayın.", emphasize: "Tam formül: softmax(QKᵀ/√d)·V. √d olmazsa gradient patlar.", cheatSheet: "Q,K,V: [seq×d_k]. QKᵀ: [seq×seq]. softmax: satır bazlı. ×V: [seq×d_k]" },
  "week3_s7": { time: 5, difficulty: 2, emphasize: "Dot product = benzerlik ölçüsü. a·b büyük → aynı yön, küçük → farklı yön.", cheatSheet: "a·b = Σaᵢbᵢ. Geometric: |a||b|cos(θ). cos(θ)=1: aynı yön, 0: dik, -1: ters" },
  "week3_s8": { time: 8, difficulty: 3, emphasize: "Multi-head: 4 farklı bakış açısı. Causal mask: gelecek tokenları -∞ yaparak gizle.", cheatSheet: "n_head=4, d_k=16/4=4. Mask: attn[i][j>i] = -∞ → softmax sonrası 0" },
  "week3_s9": { time: 5, difficulty: 3, emphasize: "Head çıktıları concat → Wo ile projeksiyon. 4×4=16 boyuta geri dön.", cheatSheet: "MultiHead = Concat(head1,...,head4) · Wo. Wo: [16×16]" },
  // W4 remaining
  "week4_s3": { time: 10, difficulty: 3, prep: "Transformer flow viz'i açın. Adım adım geçin.", emphasize: "Her adımda veri nasıl değişiyor? Giriş → Norm → Attention → +Residual → Norm → MLP → +Residual" },
  "week4_s4": { time: 5, difficulty: 3, emphasize: "RMSNorm: mean çıkarma yok, sadece ölçekleme. Daha hızlı, modern standart.", cheatSheet: "RMSNorm(x) = x·γ/√(mean(x²)+ε). vs LayerNorm: (x-μ)·γ/σ + β" },
  "week4_s5": { time: 5, difficulty: 3, emphasize: "MLP = token içi bilgi işleme. Attention token arası, MLP token içi.", cheatSheet: "MLP: 16→64(×4)→16. W1:[16×64], W2:[64×16]. ReLU²(x) = max(0,x)²" },
  "week4_s6": { time: 5, difficulty: 2, emphasize: "Aktivasyon olmadan derin ağ = sığ ağ. Non-linearity = öğrenme kapasitesi.", cheatSheet: "ReLU: max(0,x). ReLU²: max(0,x)². GELU: x·Φ(x). Tanh: (e²ˣ-1)/(e²ˣ+1)" },
  "week4_s7": { time: 5, difficulty: 3, emphasize: "Residual = x + f(x). Gradient highway: derin ağlarda gradient serbest akıyor.", studentQs: [
    { q: "Neden sadece topluyoruz?", a: "Skip connection gradientlerin katmanlar boyunca akmasını sağlar. Olmasa 10+ katmanda gradient kaybolur." }
  ] },
  "week4_s8": { time: 5, difficulty: 3, emphasize: "Başlatma kritik: sıfır = öğrenmeme, büyük = patlama, küçük = kaybolma.", cheatSheet: "Xavier: std=1/√n. Kaiming: std=√(2/n). microGPT: 0.02 std normal" },
  "week4_s9": { time: 5, difficulty: 2, emphasize: "RMSNorm vs LayerNorm: pratik fark küçük ama hız farkı %30.", cheatSheet: "LayerNorm: (x-μ)/σ·γ+β (4 op). RMSNorm: x/√(mean(x²)+ε)·γ (3 op)" },
  // W5 remaining
  "week5_s3": { time: 8, difficulty: 3, prep: "Vadi + top analojisi çizin. Top = model, vadi = minimum, eğim = gradient.", emphasize: "GD: gradient yokuş aşağıyı gösterir. Adım boyutu = learning rate.", cheatSheet: "w_new = w_old - lr × ∂L/∂w. lr=0.01. Büyük lr → salınım, küçük lr → yavaş" },
  "week5_s4": { time: 10, difficulty: 3, prep: "Training sim'i açın. LR slider'ı 0.001 → 0.1 arasında gezdirin.", emphasize: "Canlı deney: LR=0.001 çok yavaş, LR=0.1 patlıyor, LR=0.01 ideal." },
  "week5_s5": { time: 5, difficulty: 3, emphasize: "CE = -log(P). P yüksek → loss düşük. P düşük → loss çok yüksek.", cheatSheet: "P=1: loss=0. P=0.5: loss=0.69. P=0.1: loss=2.3. P=0.01: loss=4.6" },
  "week5_s6": { time: 5, difficulty: 2, emphasize: "Log neden kullanılıyor? Düşük olasılığa ÇOK ağır ceza verir.", cheatSheet: "-log(0.5)=0.69 ama -(1-0.5)=0.5. -log(0.01)=4.6 ama -(1-0.01)=0.99. Log daha sert" },
  "week5_s7": { time: 5, difficulty: 3, emphasize: "Adam: momentum (geçmiş gradientler) + adaptive (her parametre kendi lr'si).", cheatSheet: "Adam: m = β₁m + (1-β₁)g, v = β₂v + (1-β₂)g². w -= lr·m̂/√v̂+ε. β₁=0.9, β₂=0.999" },
  "week5_s8": { time: 5, difficulty: 2, emphasize: "Cosine decay: başta büyük adım (keşif), sonda küçük (hassas ayar).", cheatSheet: "lr_t = lr_min + 0.5(lr_max-lr_min)(1+cos(πt/T)). Warmup: ilk N adım lineer artış" },
  "week5_s9": { time: 3, difficulty: 2, emphasize: "p.grad = 0 her adımda ŞART. Yoksa önceki adımın gradienti birikir → felaket.", studentQs: [
    { q: "Neden otomatik sıfırlanmıyor?", a: "Bazen kasıtlı olarak biriktirmek istersiniz (gradient accumulation). PyTorch da aynı: optimizer.zero_grad()" }
  ] },
  // W6 remaining
  "week6_s2": { time: 5, difficulty: 2, emphasize: "Eğitim: forward+backward+update. Inference: sadece forward. Dropout OFF, BatchNorm fixed.", cheatSheet: "Eğitim: loss hesapla → backprop → güncelle. Inference: tahmin yap → bitir" },
  "week6_s3": { time: 8, difficulty: 2, emphasize: "Autoregressive: BOS → 'e' → 'em' → 'emm' → 'emma' → BOS. Her adım 1 token.", cheatSheet: "Loop: token = BOS. while token != BOS: logits = forward(tokens). token = sample(softmax(logits/T))" },
  "week6_s4": { time: 10, difficulty: 2, prep: "Generation playground'u açın. Temperature'ı değiştirerek farkı gösterin.", emphasize: "T=0.1: hep aynı isimler. T=1.0: çeşitli. T=2.0: saçma isimler. Canlı gösterin." },
  "week6_s5": { time: 5, difficulty: 2, emphasize: "Temperature = softmax'ı keskinleştirme/düzleştirme. Matematik basit: logits/T.", cheatSheet: "T<1: [0.1,0.8,0.1]→[0.01,0.98,0.01] (keskin). T>1: [0.1,0.8,0.1]→[0.2,0.6,0.2] (düz)" },
  "week6_s6": { time: 5, difficulty: 2, emphasize: "Greedy = her zaman en yüksek. Top-k = ilk k'dan sample. Nucleus = toplam %p'ye kadar.", cheatSheet: "Greedy: argmax. Top-k: en yüksek k seç, diğerleri 0. Top-p: kümülatif ≤ p olanlar" },
  "week6_s7": { time: 5, difficulty: 3, emphasize: "KV cache: tekrar hesaplama yok. Yeni token için sadece 1 Q hesapla.", cheatSheet: "Without cache: n token → O(n²). With cache: n token → O(n). Bellek: O(n×d×layers)" },
  "week6_s8": { time: 5, difficulty: 2, emphasize: "Uçtan uca: isim girin, her adımı takip edin: token → embed → attend → MLP → softmax → sample" },
  "week6_s9": { time: 5, difficulty: 1, emphasize: "microGPT vs production: aynı algoritma. Fark: veri ölçeği, donanım, optimizasyon, RLHF." },
  // W7 remaining
  "week7_s2": { time: 8, difficulty: 2, emphasize: "İnteraktif scatter plot'u gösterin. microGPT → GPT-4 noktalarını tıklayın.", cheatSheet: "microGPT: 3.6K param, loss≈2.0. GPT-3: 175B, loss≈0.5. GPT-4: ~1.8T, loss≈0.3" },
  "week7_s4": { time: 5, difficulty: 1, prep: "Hardware kartlarını tıklayarak specs'leri gösterin.", emphasize: "GPU 312 TFLOPS vs CPU 0.5 TFLOPS = 624× hız farkı. AI = paralel matris çarpımı.", cheatSheet: "A100: 6912 CUDA core, 312 TFLOPS, 80GB HBM3, ~$10K" },
  "week7_s5": { time: 8, difficulty: 2, emphasize: "3 aşama: pre-training (%95) → SFT (%3) → RLHF (%2). Asıl güç pre-training'den gelir.", studentQs: [
    { q: "RLHF olmadan ChatGPT olur mu?", a: "Model bilgili ama kaba, tutarsız, bazen tehlikeli olur. RLHF 'kibarlık + güvenlik' ekler, zeka eklemez." }
  ] },
  "week7_s6": { time: 5, difficulty: 2, emphasize: "Karakter→BPE→SentencePiece→tiktoken. Her adım daha verimli tokenization.", cheatSheet: "Karakter: 27 vocab. BPE(GPT-2): 50K. tiktoken(GPT-4): 100K. Daha büyük vocab = daha az token" },
  "week7_s7": { time: 5, difficulty: 3, emphasize: "Vanilla O(n²) bellek → Flash O(n) bellek. Aynı matematik, farklı hesaplama sırası.", cheatSheet: "Flash Attention: IO-aware tiling. HBM→SRAM blok blok. 2-4× hızlanma, sonuç identik" },
  "week7_s8": { time: 5, difficulty: 1, emphasize: "Open source devrim: LLaMA 3.1 405B, DeepSeek-V3 671B MoE. GPT-4'e yakın, ücretsiz.", cheatSheet: "LLaMA: Meta, 405B. Mistral: 7-22B+MoE. DeepSeek-V3: 671B (37B active). Qwen: Alibaba. Gemma: Google" },
  "week7_s9": { time: 8, difficulty: 2, emphasize: "5 trend: MoE (verimlilik), RAG (bilgi), Agent (araç), Multimodal (çok mod), Reasoning (düşünce zinciri).", studentQs: [
    { q: "Bunlardan hangisi en önemli?", a: "Hepsi birbirini tamamlıyor. GPT-4 = MoE + Multimodal. o1 = Reasoning. Perplexity = RAG. Claude = Agent." }
  ] },
};

// ─── LESSON PLAN — Haftalık Ders Planı ──────────────────────────
const LESSON_PLANS = {
  0: { title: { tr: "Giriş & Canlı Demo", en: "Introduction & Live Demo" }, totalMin: 75, plan: [
    { phase: "Açılış", min: 5, desc: "Ders tanıtımı, beklentiler, 'GPT nedir?' tartışması" },
    { phase: "Canlı Demo", min: 15, desc: "microGPT'yi çalıştırın, isim üretin, öğrencilerle birlikte deneyin" },
    { phase: "Ders Anlatımı", min: 30, desc: "S0-S7: Pipeline, parametreler, vocab. Her bölümde viz'i gösterin" },
    { phase: "Hands-on Lab", min: 15, desc: "Öğrenciler kendi bilgisayarlarında çalıştırsın, parametreleri değiştirsin" },
    { phase: "Kapanış & Quiz", min: 10, desc: "7 soruluk quiz + gelecek haftaya hazırlık" }
  ]},
  1: { title: "Tokenization & Embedding", totalMin: 75, plan: [
    { phase: "Tekrar", min: 5, desc: "Geçen haftanın pipeline'ını tekrar edin. 'Bugün ilk kutuyu açıyoruz'" },
    { phase: "Token Demo", min: 10, desc: "'emma' → [BOS,e,m,m,a,BOS] tahtada gösterin. Tokenizer playground" },
    { phase: "Embedding Ders", min: 20, desc: "ID → vektör dönüşümü, position embedding, weight tying" },
    { phase: "Hands-on", min: 15, desc: "Tokenizer Playground viz ile deney. Farklı isimler deneyin" },
    { phase: "Softmax + Quiz", min: 15, desc: "Softmax açıklaması + 7 soruluk quiz" },
    { phase: "Kapanış", min: 10, desc: "BPE vs karakter tartışması, gelecek hafta: autograd" }
  ]},
  2: { title: "Autograd Engine", totalMin: 75, plan: [
    { phase: "Motivasyon", min: 10, desc: "Neden türev lazım? Basit örnek: f(x)=x², x=3 → yokuş aşağı gitme" },
    { phase: "Value Sınıfı", min: 15, desc: "data + grad + backward. Tahtada elle hesaplama" },
    { phase: "Chain Rule", min: 20, desc: "EN KRİTİK BÖLÜM. Bileşik fonksiyon örneği. Yavaş gidin" },
    { phase: "Autograd Playground", min: 15, desc: "İnteraktif viz ile graf oluşturun, backward çalıştırın" },
    { phase: "Doğrulama + Quiz", min: 15, desc: "PyTorch ile gradient karşılaştırma + quiz" }
  ]},
  3: { title: "Attention Mechanism", totalMin: 75, plan: [
    { phase: "RNN → Attention", min: 10, desc: "RNN'in sıralı darboğazını açıklayın, attention neden icat edildi" },
    { phase: "Q, K, V Sezgisel", min: 15, desc: "Kütüphane analojisi: Q=soru, K=etiket, V=kitap. Tahtada 3 token örneği" },
    { phase: "Scaled Dot-Product", min: 15, desc: "Formül: softmax(QKᵀ/√d)·V. Elle hesaplama yaptırın" },
    { phase: "Multi-Head + Causal", min: 10, desc: "Neden birden fazla head? Causal mask neden gerekli?" },
    { phase: "Attention Playground", min: 15, desc: "İnteraktif viz ile attention ağırlıklarını inceleyin" },
    { phase: "Quiz", min: 10, desc: "7 soruluk quiz" }
  ]},
  4: { title: "Transformer Block", totalMin: 75, plan: [
    { phase: "Büyük Resim", min: 10, desc: "Transformer = Attention + MLP + Residual + Norm. Lego analojisi" },
    { phase: "RMSNorm & Residual", min: 15, desc: "Neden normalize? Neden residual connection?" },
    { phase: "MLP & Aktivasyon", min: 15, desc: "Genişlet → aktive et → daralt. ReLU² ve GELU karşılaştırma" },
    { phase: "Transformer Flow Viz", min: 15, desc: "İnteraktif bileşen ile veri akışını takip edin" },
    { phase: "Weight Init + Quiz", min: 20, desc: "Neden başlatma önemli? + quiz" }
  ]},
  5: { title: "Training Loop", totalMin: 75, plan: [
    { phase: "Giriş", min: 5, desc: "Öğrenme = loss'u minimize etme. Basit tepe/vadi analojisi" },
    { phase: "Cross-Entropy", min: 15, desc: "-log(P). Tahtada hesaplama: P=0.5 → loss=0.69, P=0.01 → loss=4.6" },
    { phase: "Gradient Descent", min: 15, desc: "w -= lr × grad. LR etkisi: büyük → patlama, küçük → yavaş" },
    { phase: "Adam + LR Decay", min: 10, desc: "Momentum + adaptive. Cosine decay" },
    { phase: "Training Sim", min: 15, desc: "İnteraktif eğitim simülasyonu: LR slider ile canlı deney" },
    { phase: "Quiz + Kapanış", min: 15, desc: "Quiz + gelecek hafta: inference" }
  ]},
  6: { title: "Inference & Generation", totalMin: 75, plan: [
    { phase: "Demo Önce", min: 10, desc: "Temperature 0.1 vs 2.0 canlı gösterin. Öğrenciler tahmin etsin" },
    { phase: "Sampling Stratejileri", min: 15, desc: "Greedy, random, top-k. Temperature etkisi" },
    { phase: "KV Cache", min: 15, desc: "Neden cache? O(n²) → O(n). Bellekte ne saklanıyor?" },
    { phase: "Generation Playground", min: 15, desc: "İnteraktif viz ile üretim deneyleri" },
    { phase: "Quiz + Yarı Dönem Özeti", min: 20, desc: "Quiz + W0-W6 özet. Genel özet" }
  ]},
  7: { title: "Modern AI Evrimi", totalMin: 75, plan: [
    { phase: "Scaling Laws", min: 10, desc: "microGPT → GPT-4 grafiği. Güç yasası. Chinchilla" },
    { phase: "Timeline", min: 15, desc: "2017-2024 interaktif timeline. Her döneme 2 dk" },
    { phase: "Donanım & Pipeline", min: 15, desc: "CPU→GPU→TPU. Pre-training→SFT→RLHF" },
    { phase: "Open Source & Trendler", min: 15, desc: "LLaMA, Mistral, DeepSeek. MoE, RAG, Agent" },
    { phase: "Tartışma + Quiz", min: 20, desc: "AI'ın geleceği tartışması + quiz" }
  ]},
};

// ─── INSTRUCTOR CHEAT SHEETS — Her Hafta İçin Kopya Kağıdı ─────
const WEEK_CHEAT_SHEETS = {
  0: { title: "W0: Giriş Kopya Kağıdı", formulas: ["Pipeline: Token→Embed→Pos→Attn→MLP→Softmax→Sample", "Vocab=27 (a-z + BOS), n_embd=16, n_head=4, n_layer=1", "Parametre: 3,648. Block_size=8 (context window)", "Autoregressive: P(xₜ | x₁...xₜ₋₁)"], keyPoints: ["microGPT = gerçek GPT, sadece küçük", "243 satır, 0 bağımlılık", "İsim üretir, karakter karakter"] },
  1: { title: "W1: Token Kopya Kağıdı", formulas: ["stoi: char→int, itos: int→char", "wte: [27×16] embed matris, wpe: [8×16] pos matris", "x = wte[token_id] + wpe[position]", "softmax(xᵢ) = exp(xᵢ) / Σexp(xⱼ)"], keyPoints: ["Token = modelin atom'u", "Embedding: ID→vektör (öğrenilebilir)", "Weight tying: wte giriş+çıkışta paylaşılır"] },
  2: { title: "W2: Autograd Kopya Kağıdı", formulas: ["Value: data + grad + _backward()", "Chain rule: ∂L/∂x = ∂L/∂y · ∂y/∂x", "Add: ∂(a+b)/∂a = 1", "Mul: ∂(a·b)/∂a = b", "Topological sort → backward sıra"], keyPoints: ["Autograd = otomatik türev hesaplama", "Forward: graf oluştur, Backward: gradient hesapla", "Her operasyon kendi türevini bilir"] },
  3: { title: "W3: Attention Kopya Kağıdı", formulas: ["Attention(Q,K,V) = softmax(QKᵀ/√d)·V", "Q = x·Wq, K = x·Wk, V = x·Wv", "head_dim = n_embd/n_head = 16/4 = 4", "Causal mask: score[i][j>i] = -∞"], keyPoints: ["Q=soru, K=etiket, V=bilgi", "Multi-head: 4 farklı bakış açısı", "Causal: gelecek tokenları görmez"] },
  4: { title: "W4: Transformer Kopya Kağıdı", formulas: ["x = x + Attention(Norm(x))", "x = x + MLP(Norm(x))", "RMSNorm(x) = x·γ / √(mean(x²)+ε)", "MLP: W₂·act(W₁·x+b₁)+b₂, hidden=4×16=64"], keyPoints: ["Residual: bilgi kaybını önler", "Pre-norm: modern standart", "MLP: token içi bilgi işleme"] },
  5: { title: "W5: Training Kopya Kağıdı", formulas: ["CE Loss = -log(P(doğru))", "Rastgele loss = -log(1/27) = 3.33", "GD: w = w - lr × ∂L/∂w", "Adam: momentum + adaptive per-param"], keyPoints: ["Loss düşüyorsa model öğreniyor", "LR çok kritik: 0.01 iyi başlangıç", "Her adımda grad sıfırla!"] },
  6: { title: "W6: Inference Kopya Kağıdı", formulas: ["logits/T → softmax → sample", "T<1: keskin, T=1: normal, T>1: düz", "KV Cache: O(n²) → O(n) per token", "Top-k: sadece en yüksek k olasılıktan seç"], keyPoints: ["Üretim = forward + sample döngüsü", "Temperature = çeşitlilik kontrolü", "BOS ile başla, BOS gelince dur"] },
  7: { title: "W7: Evrim Kopya Kağıdı", formulas: ["L(N) = a/N^b (scaling law)", "Chinchilla: D ≈ 20N", "Flash Attn: O(n²) compute, O(n) memory", "MoE: 8 expert, 2 active per token"], keyPoints: ["2017 Transformer → 2024 Frontier", "Pre-training→SFT→RLHF pipeline", "Open source: LLaMA, Mistral, DeepSeek"] },
};

// ─── INSTRUCTOR UI COMPONENTS ───────────────────────────────────
const InstructorPanel = ({ weekIdx, sectionIdx, weekColor }) => {
  const key = `week${weekIdx}_s${sectionIdx}`;
  const notes = INSTRUCTOR_NOTES[key];
  const [showQs, setShowQs] = useState(false);
  if (!notes) return null;
  return (
    <div style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 19 }}>🎓</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#FBBF24" }}>{lang==="tr"?"Hoca Notları":"Instructor Notes"}</span>
        {notes.time && <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "rgba(251,191,36,0.1)", color: "#FBBF24", marginLeft: "auto" }}>⏱️ {notes.time} dk</span>}
        {notes.difficulty && <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: notes.difficulty >= 4 ? "rgba(239,68,68,0.1)" : notes.difficulty >= 3 ? "rgba(251,191,36,0.1)" : "rgba(34,197,94,0.1)", color: notes.difficulty >= 4 ? "#EF4444" : notes.difficulty >= 3 ? "#FBBF24" : "#22C55E" }}>{"⭐".repeat(notes.difficulty)} {lang==="tr"?"zorluk":"difficulty"}</span>}
      </div>

      {notes.prep && (
        <div style={{ fontSize: 14, color: "#FDE68A", marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(251,191,36,0.06)" }}>
          📋 <strong>{lang==="tr"?"Hazırlık":"Prep"}:</strong> {notes.prep}
        </div>
      )}

      {notes.emphasize && (
        <div style={{ fontSize: 14, color: "#FCD34D", marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(251,191,36,0.04)" }}>
          🎯 <strong>{lang==="tr"?"Vurgula":"Emphasize"}:</strong> {notes.emphasize}
        </div>
      )}

      {notes.cheatSheet && (
        <div style={{ fontSize: 13, color: "#D1D5DB", marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", fontFamily: "'Fira Code', monospace" }}>
          📝 {notes.cheatSheet}
        </div>
      )}

      {notes.studentQs && notes.studentQs.length > 0 && (
        <div>
          <button onClick={() => setShowQs(!showQs)} style={{ fontSize: 13, color: "#F59E0B", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, fontWeight: 600 }}>
            {showQs ? "▾" : "▸"} {lang==="tr"?`🙋 Öğrenci bunu soracak (${notes.studentQs.length} soru)`:`🙋 Students will ask (${notes.studentQs.length} questions)`}
          </button>
          {showQs && notes.studentQs.map((sq, i) => (
            <div key={i} style={{ marginTop: 6, marginLeft: 12, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", borderLeft: "2px solid rgba(251,191,36,0.3)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#FBBF24", marginBottom: 2 }}>❓ {sq.q}</div>
              <div style={{ fontSize: 13, color: "#94A3B8" }}>💬 {sq.a}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LessonPlanPanel = ({ weekIdx }) => {
  const plan = LESSON_PLANS[weekIdx];
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  if (!plan) return null;
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  // Calculate cumulative time
  let cumulative = 0;
  const phases = plan.plan.map(p => { cumulative += p.min; return { ...p, cumEnd: cumulative }; });

  return (
    <div style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 19 }}>📋</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#818CF8" }}>{lang==="tr"?"Ders Planı":"Lesson Plan"} — {typeof plan.title === "object" ? tx(plan.title, lang) : plan.title}</span>
        <span style={{ fontSize: 13, color: "#6366F1", marginLeft: "auto" }}>{plan.totalMin} {lang==="tr"?"dk toplam":"min total"}</span>
      </div>

      {/* Timer */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(99,102,241,0.06)" }}>
        <button onClick={() => setRunning(!running)} style={{ fontSize: 19, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          {running ? "⏸️" : "▶️"}
        </button>
        <span style={{ fontSize: 23, fontWeight: 800, color: running ? "#818CF8" : "#475569", fontFamily: "'Fira Code', monospace" }}>
          {String(elapsedMin).padStart(2,"0")}:{String(elapsedSec).padStart(2,"0")}
        </span>
        <span style={{ fontSize: 13, color: "#475569" }}>/ {plan.totalMin}:00</span>
        <button onClick={() => { setElapsed(0); setRunning(false); setCurrentPhase(0); }} style={{ fontSize: 13, color: "#6366F1", background: "rgba(99,102,241,0.1)", border: "none", borderRadius: 6, padding: "2px 8px", cursor: "pointer", marginLeft: "auto", fontFamily: "inherit" }}>{lang === "tr" ? "Sıfırla" : "Reset"}</button>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 2, height: 6, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
        {phases.map((p, i) => (
          <div key={i} style={{ flex: p.min, background: i <= currentPhase ? "#6366F1" : "rgba(99,102,241,0.15)", transition: "background .3s", cursor: "pointer", borderRadius: 2 }} onClick={() => setCurrentPhase(i)} />
        ))}
      </div>

      {/* Phase list */}
      {phases.map((p, i) => (
        <div key={i} onClick={() => setCurrentPhase(i)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
          background: i === currentPhase ? "rgba(99,102,241,0.08)" : "transparent",
          borderLeft: i === currentPhase ? "3px solid #6366F1" : "3px solid transparent",
          opacity: i < currentPhase ? 0.5 : 1, transition: "all .2s" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: i === currentPhase ? "#818CF8" : "#475569", minWidth: 35 }}>{p.min} {lang==="tr"?"dk":"m"}</span>
          <span style={{ fontSize: 13, fontWeight: i === currentPhase ? 700 : 400, color: i === currentPhase ? "#E2E8F0" : "#94A3B8" }}>{p.phase}</span>
          <span style={{ fontSize: 12, color: "#475569", marginLeft: "auto" }}>{p.desc.substring(0, 50)}{p.desc.length > 50 ? "..." : ""}</span>
        </div>
      ))}
    </div>
  );
};

const CheatSheetPanel = ({ weekIdx }) => {
  const sheet = WEEK_CHEAT_SHEETS[weekIdx];
  if (!sheet) return null;
  return (
    <div style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 19 }}>📝</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#10B981" }}>{sheet.title}</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: "#6EE7B7", fontWeight: 600, marginBottom: 4 }}>{lang==="tr"?"Formüller & Sayılar":"Formulas & Numbers"}:</div>
        {sheet.formulas.map((f, i) => (
          <div key={i} style={{ fontSize: 13, color: "#D1D5DB", padding: "2px 0", fontFamily: "'Fira Code', monospace" }}>→ {f}</div>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 12, color: "#6EE7B7", fontWeight: 600, marginBottom: 4 }}>{lang==="tr"?"Kilit Noktalar":"Key Points"}:</div>
        {sheet.keyPoints.map((kp, i) => (
          <div key={i} style={{ fontSize: 13, color: "#94A3B8", padding: "2px 0" }}>✓ {kp}</div>
        ))}
      </div>
    </div>
  );
};

const SECTION_EXTRAS = {
  "week0_s0": {
    why: "Bu dersin amacı GPT'nin 'büyülü' görünen davranışlarının arkasındaki matematiği anlamanızdır. ChatGPT kullandığınızda 'nasıl yapıyor?' diye merak ettiyseniz, bu ders tam size göre."
  },
  "week0_s1": {
    why: "Yapay sinir ağlarını anlamak ZORUNLU çünkü GPT bir sinir ağıdır. Ama korkacak bir şey yok — çarpma ve toplama biliyorsanız sinir ağını anlayabilirsiniz.",
    analogy: { title: "Excel Formülü Benzetmesi", emoji: "📊", text: "Bir Excel sayfası düşünün: A1 hücresine girdi yazıyorsunuz, B1 hücresinde =A1*0.5+0.3 formülü var, C1'de sonucu görüyorsunuz. Sinir ağı tam olarak bu — ama binlerce hücre ve formül. 'Eğitim' = Excel'in 0.5 ve 0.3 gibi katsayıları otomatik bulması. Veriyi gösteriyorsunuz, formül kendini ayarlıyor." },
    concrete: { title: "Somut Ev Fiyatı Örneği", content: "Girdi: alan=120m², oda=3\nModel: fiyat = w₁×120 + w₂×3 + b\n\nBaşlangıç (rastgele): w₁=0.001, w₂=0.5, b=0\n→ fiyat = 0.12 + 1.5 + 0 = 1.62 TL (!)\n\n100 adım eğitim sonrası: w₁=5000, w₂=20000, b=50000\n→ fiyat = 600K + 60K + 50K = 710K TL ✓" }
  },
  "week0_s2": {
    analogy: { title: "Cümle Tamamlama Oyunu", emoji: "🎯", text: "Dil modeli, arkadaşlarınızla oynadığınız 'cümleyi tamamla' oyununa benzer. Biri 'dün okula gi...' deyince siz otomatik olarak 'ttim' veya 'deceğim' gibi devamlar düşünürsünüz. Beyniniz binlerce cümle duyduğu için 'olası devamları' tahmin edebilir. GPT aynı şeyi yapar — milyarlarca metin okumuş ve kalıpları öğrenmiştir." },
    why: "Dil modeli kavramı bu dersin TEMELİDİR. Tüm haftalarda öğreneceğiniz her şey — embedding, attention, training — 'sonraki tokeni tahmin et' görevine hizmet eder."
  },
  "week0_s3": {
    bridge: { from: "Sinir ağı ve dil modeli kavramlarını öğrendik", to: "Şimdi somut olarak bu kodun ne yaptığını görelim — 5 adımlık pipeline" },
    concrete: { title: "Loss = 3.33 ne anlama geliyor?", content: "28 token arasından rastgele seçim: P(doğru) = 1/28\nLoss = -log(1/28) = log(28) ≈ 3.33\n\nBu 'en kötü' durum. Eğitimle:\n→ P(doğru) = 1/7 olursa: loss = log(7) ≈ 1.95\n→ Yani model rastgeleden 4× daha iyi!" }
  },
  "week0_s4": {
    analogy: { title: "Araba Mekanik vs Sürücü", emoji: "🔧", text: "PyTorch kullanmak = araba kullanmak. microgpt.py okumak = motorun nasıl çalıştığını anlamak. İyi bir sürücü için motor bilgisi şart değil — ama İYİ BİR MÜHENDİS olmak istiyorsanız, motorun içini bilmelisiniz. Bu ders sizi mühendis yapıyor." },
    concrete: { title: "PyTorch vs microgpt.py", content: "PyTorch'ta 3 satır:\nloss = criterion(output, target)\nloss.backward()\noptimizer.step()\n\nmicrogpt.py'de aynı işlem 30+ satır.\nAma her satır OKUNABILIR ve ANLAŞILIR.\nPyTorch'un arkasında ~2M satır C++/CUDA var." }
  },
  "week0_s7": {
    tryIt: "params",
    why: "Bu 7 parametre modelin 'DNA'sıdır. Değiştirdiğinizde model tamamen farklı davranır. Deney yaparak öğrenin!",
    analogy: { title: "Araba Kontrol Paneli", emoji: "🎛️", text: "n_embd = motor hacmi (büyük = güçlü ama pahalı). n_layer = vites sayısı (çok = hassas kontrol). n_head = ayna sayısı (çok = daha geniş görüş). block_size = yakıt deposu (büyük = uzun yol). learning_rate = gaz pedalı hassasiyeti (çok = tehlikeli). num_steps = yol mesafesi. seed = başlangıç noktası." }
  },
  "week0_s10": {
    analogy: { title: "Bisikletten Uzay Mekiğine", emoji: "🚀", text: "microGPT bir bisiklet — pedal, direksiyon, fren hepsi var. GPT-4 bir uzay mekiği — aynı fizik kuralları (Newton) ama milyonlarca kat daha karmaşık mühendislik. Bu derste bisikleti parçalayıp anlayacaksınız. Sonra mekiğin %90'ını da anlamış olacaksınız." },
    concrete: { title: "Ölçek Karşılaştırması", content: "microGPT:  3,648 parametre (~15 KB bellek)\nGPT-2:     1.5 milyar parametre (~6 GB)\nGPT-3:     175 milyar parametre (~700 GB)\nGPT-4:     ~1+ trilyon parametre (~4 TB)\n\nOran: GPT-4 / microGPT ≈ 300,000,000×\nAma temel algoritma AYNI." }
  },
  "week1_s0": {
    why: "Bilgisayar sadece sayıları işleyebilir. 'Merhaba' yazdığınızda ekranda harf görürsünüz ama bilgisayar içinde hepsi sayıdır. Dil modelinin metni anlaması için önce onu sayılara çevirmeliyiz — tokenization tam olarak budur.",
    bridge: { from: "Geçen hafta GPT'nin ne yaptığını gördük: isim alır, yeni isim üretir.", to: "Şimdi 'ismi alır' kısmına odaklanıyoruz. Model bir ismi nasıl 'görüyor'? Cevap: tokenization." }
  },
  "week1_s2": {
    tryIt: "tokenizer"
  },
  "week1_s3": {
    why: "Token ID'leri (0, 1, 2...) modele 'a yakın mı b'ye?' gibi ilişkileri söyleyemez. ID=5 ile ID=6 yan yana ama 'e' ile 'f' birbirine yakın değil! Embedding her harfi çok boyutlu bir uzaya yerleştirerek bu sorunu çözer.",
    analogy: { title: "Rehber Kitap Adresi", emoji: "📍", text: "Düşünün ki her karakter bir şehir. Token ID = posta kodu (sadece numara). Embedding = GPS koordinatı (enlem, boylam + irtifa). Posta kodları sıralı ama coğrafi yakınlığı göstermez: İstanbul=34, Kırklareli=39 → yakın ama kodları uzak! GPS koordinatları ise gerçek mesafeyi verir. Embedding tıpkı GPS gibi, harflerin 'anlam uzayındaki' gerçek konumunu verir." },
    tryIt: "embedding"
  },
  "week1_s5": {
    tryIt: "softmax"
  },
  "week2_s0": {
    why: "5.000 parametrenin her birinin loss'a etkisini bilmemiz lazım. Tek tek deneyerek bulmak (x'i 0.001 artır, loss ne oldu?) 5.000 ayrı forward pass demek. Autograd bunu TEK backward pass ile yapıyor — hepsi bedava!",
    bridge: { from: "Geçen hafta modeli kurduk: embedding → attention → MLP → çıktı. Ama bu model henüz 'cahil' — rastgele ağırlıklarla saçma tahminler yapıyor.", to: "Şimdi 'nasıl öğrenir?' sorusuna geçiyoruz. Cevap: gradient hesaplama (bu hafta) + parametre güncelleme (gelecek hafta)." },
    analogy: { title: "Kör Dağcı", emoji: "🏔️", text: "Bir dağda gözünüz bağlı duruyorsunuz ve en alçak noktaya inmeniz gerekiyor. Elinizle zemini yokluyorsunuz: 'sağa mı eğimli, sola mı?' Türev tam olarak bu: 'bu yönde ilerlersem yokuş aşağı mı, yukarı mı giderim?' Gradient ise tüm yönlerdeki eğimleri birden söyler: 'kuzeybatıya doğru en dik iniş var.'" }
  },
  "week2_s3": {
    stepByStep: {
      title: "L = (a × b) + c Hesaplama Grafı",
      steps: [
        { label: "Değerleri kur", calc: "a = 2, b = 3, c = 1", note: "Bu değerler modelin parametreleri gibi düşünün" },
        { label: "İleri: d = a × b", calc: "d = 2 × 3 = 6", note: "Çarpma operatörü — local_grads = (b=3, a=2)" },
        { label: "İleri: L = d + c", calc: "L = 6 + 1 = 7", note: "Toplama operatörü — local_grads = (1, 1)" },
        { label: "Geri: ∂L/∂L = 1", calc: "L.grad = 1", note: "Başlangıç noktası: loss'un kendine göre türevi her zaman 1" },
        { label: "Geri: ∂L/∂d", calc: "d.grad += 1 × 1 = 1", note: "Toplama → local_grad=1, L.grad=1 → chain rule: 1×1" },
        { label: "Geri: ∂L/∂c", calc: "c.grad += 1 × 1 = 1", note: "Toplama → local_grad=1, L.grad=1 → chain rule: 1×1" },
        { label: "Geri: ∂L/∂a", calc: "a.grad += b × d.grad = 3 × 1 = 3", note: "Çarpma → local_grad=b=3, d.grad=1 → chain rule: 3×1" },
        { label: "Geri: ∂L/∂b", calc: "b.grad += a × d.grad = 2 × 1 = 2", note: "Çarpma → local_grad=a=2, d.grad=1 → chain rule: 2×1" },
        { label: "Doğrulama ✓", calc: "∂L/∂a = b = 3 ✓, ∂L/∂b = a = 2 ✓", note: "L = ab+c → ∂L/∂a = b, ∂L/∂b = a — eliyle aynı sonuç!" }
      ]
    }
  },
  "week3_s0": {
    bridge: { from: "Autograd ile gradient hesaplamayı öğrendik. Bu sayede modelin parametrelerini güncelleyebiliriz.", to: "Ama modelin içinde ne oluyor? Token'lar birbirleriyle nasıl 'konuşuyor'? İşte attention mekanizması — Transformer'ın kalbi!" }
  },
  "week3_s1": {
    analogy: { title: "Toplantıda Not Alma", emoji: "📋", text: "Bir toplantıdasınız ve not alıyorsunuz. 5 kişi konuştu. Son konuşmacı siz ve önceki konuşmacıların söylediklerini özetlemeniz gerekiyor. Herkesi eşit dinlemezsiniz: CEO'nun sözlerine %40, projenin lideri %30, diğerleri %10'ar dikkat edersiniz. Self-attention tam olarak bunu yapar: her token, önceki tokenlardan ne kadar 'bilgi alacağına' dinamik olarak karar verir." }
  },
  "week3_s2": {
    analogy: { title: "Kütüphane Arama", emoji: "📚", text: "Bir kütüphanedesiniz: Query = aradığınız konu ('yapay zeka tarihi'). Key = kitap kapağındaki başlıklar. Q·K = başlıkla aranızın uyumu (yüksek = ilgili kitap). Value = kitabın içeriği. Uyum yüksekse o kitaptan çok alıntı yaparsınız. Düşükse geçersiniz. Attention aynı şekilde çalışır!" },
    tryIt: "dotProduct"
  },
  "week4_s0": {
    bridge: { from: "Self-attention ile tokenlar arası iletişimi öğrendik. Ama tek attention yeterli mi?", to: "Hayır! Attention'dan sonra her token kendi başına bir 'düşünme' aşamasından geçer: MLP bloğu. Ayrıca normalizasyon ve residual bağlantılar eğitimi kararlı kılar. İşte tam Transformer mimarisi!" }
  },
  "week5_s0": {
    bridge: { from: "Model mimarisini tamamladık: Embedding → Attention → MLP → Çıktı.", to: "Şimdi en kritik soru: bu model nasıl öğrenir? Cevap: Forward → Loss → Backward → Update döngüsü. Bu hafta döngünün her aşamasını detaylıca göreceğiz." },
    tryIt: "gradient"
  },
  "week5_s2": {
    stepByStep: {
      title: "Cross-Entropy Loss Hesaplama",
      steps: [
        { label: "Girdi", calc: "tokens = [BOS, h, e, l, l, o]", note: "'hello' kelimesini tokenize ettik" },
        { label: "Pozisyon 0: BOS→h tahmin", calc: "P('h') = 0.04 (model henüz cahil)", note: "1/27 ≈ 0.037 rastgele tahmine yakın" },
        { label: "Loss hesapla", calc: "L₀ = -log(0.04) = 3.22", note: "Düşük olasılık → yüksek loss (ceza)" },
        { label: "Pozisyon 1: h→e tahmin", calc: "P('e') = 0.08", note: "Biraz daha iyi ama hala düşük" },
        { label: "Loss hesapla", calc: "L₁ = -log(0.08) = 2.53", note: "Daha iyi olasılık → daha düşük loss" },
        { label: "Ortalama al", calc: "Loss = (3.22 + 2.53 + ...) / 5", note: "Tüm pozisyonların ortalaması = modelin genel başarısı" },
        { label: "Karşılaştır", calc: "Rastgele: 3.33 | Eğitilmiş: ~2.0", note: "Loss düştü = model öğreniyor! 🎉" }
      ]
    }
  },
  "week6_s2": {
    tryIt: "softmax"
  },
  "week7_s0": {
    why: "Scaling laws'u anlamak 'ölçek artırma' kararlarının arkasındaki bilimi gösterir. Neden 1T parametre? Çünkü matematik öyle diyor.",
    analogy: { title: "Fabrika Üretim Hattı", emoji: "🏭", text: "Bir fabrikada üretim hattını 2× büyütünce üretim tam 2× artmaz — ama güç yasasıyla artar. AI'da da aynı: 10× parametre → ~3× iyileşme. Getiri azalan ama hala değerli." }
  },
  "week7_s1": {
    bridge: { from: "Scaling laws'u öğrendik", to: "Şimdi bu yasaların somut tarihçesini görelim — 2017'den bugüne" },
    concrete: { title: "Maliyet Evrimi", content: "2017 Transformer: ~$10K\n2018 GPT-1: ~$50K\n2020 GPT-3: ~$5M\n2023 GPT-4: ~$100M+\n2024 Frontier: ~$200M+\n\n7 yılda 20,000× maliyet artışı\nAma performans 100× iyileşme" }
  },
  "week7_s3": {
    analogy: { title: "Çırak → Kalfa → Usta", emoji: "🎓", text: "Pre-training = çıraklık (her şeyi gözlemle). SFT = kalfalık (ustadan soru-cevap öğren). RLHF = ustalık (müşteri memnuniyetine göre ince ayar). Her aşama bir öncekinin üstüne inşa edilir." }
  },
};

// ─── QUIZ DATA ───────────────────────────────────────────────────
const QUIZZES = {
  0: [
    { q: "microGPT kaç satır koddan oluşur?", opts: ["243", "24300", "2430", "43"], ans: 0, explain: "Karpathy'nin saf Python implementasyonu tam 243 satır — hiçbir dış kütüphane kullanmadan." },
    { q: "Bu model ne tür bir görev yapıyor?", opts: ["Çeviri", "Karakter düzeyinde isim üretme", "Ses tanıma", "Görüntü sınıflandırma"], ans: 1, explain: "32K İngilizce isim üzerinde eğitilmiş karakter düzeyinde dil modeli. Yeni, var olmayan isimler üretir." },
    { q: "GPT 'autoregressive' ne demek?", opts: ["Sadece önceki tokenlara bakarak sırayla tahmin yapar", "Tüm cümleyi bir kerede üretir", "Paralel tüm tokenlara bakar", "Rastgele tokenlar seçer"], ans: 0, explain: "Autoregressive = her adımda kendi ürettiği çıktıyı girdi olarak kullanarak sırayla ilerler. Geleceği görmez." },
    { q: "microGPT kaç parametre içerir?", opts: ["1 milyon", "1 milyar", "243", "3,648"], ans: 3, explain: "3,648 öğrenilebilir parametre. GPT-4'ün 1 trilyonun üzerinde parametresi var — aynı algoritma, farklı ölçek." },
    { q: "Forward pass ne yapar?", opts: ["Girdi → model → çıktı (tahmin) hesaplar", "Veri yükler", "Gradient hesaplar", "Parametreleri günceller"], ans: 0, explain: "Forward pass: girdi token'ı modelden geçirip 27 token üzerinde olasılık dağılımı (logits) üretir." },
    { q: "Bu kodda vocab (kelime dağarcığı) boyutu kaçtır?", opts: ["27", "16", "8", "256"], ans: 0, explain: "a-z (26 harf) + BOS/EOS (1 özel token) = 27 token. Karakter düzeyinde tokenization." },
    { q: "Neden PyTorch yerine sıfırdan yazılmış?", opts: ["Fark yok", "PyTorch pahalı", "PyTorch yavaş", "Her satırı ANLAYARAK öğrenmek — kara kutu olmasın"], ans: 3, explain: "PyTorch'ta 3 satırda yazılan şey burada 30+ satır. Ama her satır okunabilir ve anlaşılır — öğrenme amaçlı." },
  ],
  1: [
    { q: "Tokenization ne işe yarar?", opts: ["Yazım hatalarını düzeltir", "Metni sıkıştırır", "Metni sayısal ID dizisine çevirir", "Metni renklendirir"], ans: 2, explain: "Bilgisayar metin işleyemez. Tokenization metni modelin anlayacağı sayılara çevirir." },
    { q: "Embedding nedir?", opts: ["Dosya sıkıştırma", "Veri tabanı sorgusu", "Şifreleme yöntemi", "Token ID'yi çok boyutlu vektöre dönüştürme"], ans: 3, explain: "Embedding, bir ID'yi (ör: 5) anlamlı bir vektöre (ör: [0.2, -0.1, 0.5, ...]) dönüştürür. Benzer tokenlar yakın vektörlere sahip olur." },
    { q: "BOS token ne işe yarar?", opts: ["Boşluk karakteridir", "Dizinin başlangıcını/sonunu işaret eder", "En sık harfi temsil eder", "Hatayı gösterir"], ans: 1, explain: "BOS (Beginning of Sequence) modele 'yeni dizi başlıyor' ve 'dizi bitti' sinyali verir." },
    { q: "Weight tying ne demek?", opts: ["Giriş ve çıkış embedding matrisini paylaşma", "Eğitimi durdurma", "İki modeli birleştirme", "Ağırlıkları sıfırlama"], ans: 0, explain: "Aynı wte matrisi hem token→vektör (giriş) hem vektör→logit (çıkış) için kullanılır → parametre tasarrufu." },
    { q: "'emma' tokenize edilirse kaç eğitim çifti oluşur?", opts: ["5", "3", "6", "4"], ans: 0, explain: "BOS→e, e→m, m→m, m→a, a→BOS = 5 çift. Kural: harf sayısı + 1 (BOS→ilk harf) = eğitim çifti." },
    { q: "Position embedding olmadan 'abc' ve 'cba' farkı ne olur?", opts: ["Sadece son harf farklı", "Sadece ilk harf farklı", "Model ikisini AYNI görür", "Model farklı işler"], ans: 2, explain: "Transformer yapısal olarak sıra bilgisi içermez. Position embedding olmadan token sırası kaybolur!" },
    { q: "Softmax çıktılarının toplamı kaçtır?", opts: ["1", "Değişir", "0", "0.5"], ans: 0, explain: "Softmax her zaman toplam=1 olan olasılık dağılımı üretir. P(i) = exp(xi)/Σexp(xj), tüm P'ler toplamı 1." },
  ],
  2: [
    { q: "Türev (gradient) modele ne söyler?", opts: ["Kaç parametre var", "Modelin doğruluğu", "Her parametreyi hangi yönde değiştirince loss azalır", "Eğitim ne kadar sürer"], ans: 2, explain: "∂L/∂w = 'w'yi biraz artırırsam loss ne kadar değişir?' Negatif yönde güncelleme yaparak loss azaltılır." },
    { q: "grad += kullanmak neden kritik? (= yerine)", opts: ["Python kuralı", "Birden fazla yoldan gelen gradientler toplanmalı", "Daha hızlı", "Bellek tasarrufu"], ans: 1, explain: "Bir parametre birden fazla yoldan loss'u etkileyebilir (ör: weight tying). Tüm yolların gradientleri toplanmalıdır." },
    { q: "Topological sort backward pass'te neden gerekli?", opts: ["Düğümlerin doğru bağımlılık sırasında işlenmesi için", "Hız optimizasyonu", "Alfabetik sıralama için", "Bellek yönetimi"], ans: 0, explain: "Chain rule'ın doğru çalışması için bir düğümün gradientini hesaplamadan önce onu kullanan tüm düğümler hesaplanmış olmalı." },
    { q: "L = a×b ise ∂L/∂a kaçtır?", opts: ["a×b", "1", "b", "a"], ans: 2, explain: "Çarpmanın yerel türevi: ∂(a×b)/∂a = b (diğer girdiyi sabit tut, a katsayısı = b). Oyun alanında deneyin!" },
    { q: "Backward pass neden loss düğümünden (L) başlar?", opts: ["∂L/∂L = 1 olduğu için — chain rule'un başlangıç noktası", "Rastgele seçim", "Alfabetik sıra", "En büyük değer olduğu için"], ans: 0, explain: "∂L/∂L = 1 (bir şeyin kendisine göre türevi = 1). Bu '1' chain rule ile çarpılarak tüm düğümlere yayılır." },
    { q: "ReLU(x) fonksiyonunun x=-3'teki gradient'i kaçtır?", opts: ["3", "-3", "1", "0"], ans: 3, explain: "ReLU(x) = max(0,x). x<0 ise çıktı=0 ve gradient=0 (nöron 'ölü'). x>0 ise gradient=1 (geçir). -3<0 → 0." },
    { q: "Bu koddaki Value sınıfı ile PyTorch Tensor farkı nedir?", opts: ["Farklı algoritma", "Value skaler, Tensor N-boyutlu — ama aynı gradient değerleri", "Value daha hızlı", "PyTorch daha doğru"], ans: 1, explain: "İkisi de aynı autograd algoritmasını çalıştırır. Fark: Value tek sayıyla, Tensor milyonlarca sayıyla paralel (GPU) çalışır." },
  ],
  3: [
    { q: "Self-attention'da Q·K ne anlama gelir?", opts: ["Veri sıkıştırma", "İki token arasındaki uyum/benzerlik skoru", "Parametre sayısı", "Loss değeri"], ans: 1, explain: "Query (ne arıyorum?) ile Key (bende ne var?) arasındaki dot product = uyum skoru. Yüksek skor → daha çok dikkat." },
    { q: "Neden √d_head'e bölüyoruz?", opts: ["Boyut artınca dot product büyür → softmax çok sivri → gradient kaybolur", "Bellekte yer açmak için", "Hız için", "Estetik sebep"], ans: 0, explain: "Scaling trick: d büyüdükçe dot product büyür, softmax dağılımı sivri (spike) yapar, gradient kaybolur. √d ile normalleştirme bunu önler." },
    { q: "Multi-head attention neden kullanılır?", opts: ["Sadece gelenek", "Her head farklı ilişki kalıpları öğrenebilir", "Parametre azaltma", "Hız artışı"], ans: 1, explain: "Her head bağımsız attention hesabı yapar: biri sesli-sessiz uyumunu, diğeri pozisyon yakınlığını öğrenebilir. Zenginlik sağlar." },
    { q: "Causal masking ne sağlar?", opts: ["Daha iyi doğruluk", "Hız artışı", "Bellek tasarrufu", "Her token sadece ÖNCEKİ tokenlara bakabilir — geleceği göremez"], ans: 3, explain: "GPT causal modeldir: eğitimde 'kopya çekmeyi' önlemek için gelecek tokenlar maskelenir. Bu kodda KV cache doğal mask sağlar." },
    { q: "Bu kodda head_dim kaçtır?", opts: ["8", "16", "4", "1"], ans: 2, explain: "16 boyutlu embedding ÷ 4 head = 4 boyut/head. Her head 4-boyutlu Q,K,V vektörleri ile çalışır." },
    { q: "Q, K, V'nin rolleri nedir?", opts: ["Q=ne arıyorum, K=bende ne var, V=bilgi içeriği", "Hepsi aynı işi yapar", "Q=hız, K=yön, V=uzaklık", "Q=girdi, K=çıktı, V=hata"], ans: 0, explain: "Q·K = uyum skoru belirler, yüksek uyumlu token'ın V'si (bilgi içeriği) daha çok alınır." },
    { q: "Attention ağırlıklarının toplamı kaçtır?", opts: ["Değişir", "Head sayısı", "1", "0"], ans: 2, explain: "Softmax'ın çıktıları her zaman toplam=1 olur. Bu, bir olasılık dağılımı oluşturur — hangi token'a ne kadar dikkat?" },
  ],
  4: [
    { q: "RMSNorm, LayerNorm'dan farkı nedir?", opts: ["Sonuçlar farklı", "Daha fazla parametre", "Ortalama çıkarmaz, sadece RMS ile normalize eder → ~%30 hızlı", "Daha yavaş"], ans: 2, explain: "RMSNorm, mean çıkarma adımını atlar → daha az hesaplama, eşdeğer kalite. Modern LLM'lerin (LLaMA, Mistral) standardı." },
    { q: "Residual connection (x + f(x)) neden şart?", opts: ["Kod basitliği", "Parametre azaltır", "Sadece GPT'de var", "Gradient doğrudan girişe akabilir, derin ağları eğitilebilir kılar"], ans: 3, explain: "+x terimi gradient'e 'kestirme yol' açar: ∂L/∂x = ∂L/∂out × (∂f/∂x + 1). +1 = gradient highway." },
    { q: "MLP'de ReLU² neden ~%40 nöronu 'öldürür'?", opts: ["Bozuk başlatma", "Negatif değerler sıfıra düşer (sparse), bu verimlilik ve genelleme artırır", "Bug", "Rastgele olur"], ans: 1, explain: "ReLU²: max(0,x)². Negatifler=0 → sparse aktivasyon. Bu, modelin bilgiyi yoğunlaştırmasına ve genellemesine yardımcı olur." },
    { q: "Transformer bloğundaki 2 ana bileşen nedir?", opts: ["RNN + CNN", "Self-Attention + MLP (Feed-Forward)", "Encoder + Decoder", "Softmax + Loss"], ans: 1, explain: "Her Transformer katmanı: Attention (tokenlar arası bilgi akışı) + MLP (token içi dönüşüm). İkisi de residual ile sarmalanır." },
    { q: "Pre-norm ve post-norm farkı nedir?", opts: ["İkisi de aynı", "Post-norm daha modern", "Pre-norm daha yavaş", "Pre-norm: norm → block → +res (daha kararlı eğitim)"], ans: 3, explain: "Pre-norm (bu kod): norm ÖNCE uygulanır → gradient akışı daha iyi → kararlı eğitim. GPT-2 post-norm, modern modeller pre-norm." },
    { q: "Aktivasyon fonksiyonu olmadan derin ağ ne olur?", opts: ["Daha hızlı olur", "Daha az parametre olur", "Tek bir matris çarpımına eşdeğer olur — katmanlar anlamsız", "Normal çalışır"], ans: 2, explain: "W₃×W₂×W₁×x = W×x. Non-linearity olmadan kaç katman olursa olsun tek lineer dönüşüm — öğrenme kapasitesi çok sınırlı." },
    { q: "Wo ve fc2 neden sıfıra yakın başlatılır?", opts: ["Bellek tasarrufu", "Daha hızlı yakınsama", "Rastgele seçim", "Başta residual block ≈ identity → kararlı eğitim başlangıcı"], ans: 3, explain: "Wo≈0 → attention çıktısı≈0 → x + 0 = x (identity). Model yavaş yavaş block katkısını artırmayı öğrenir." },
  ],
  5: [
    { q: "Cross-entropy loss = -log(P(doğru)). P=1/27 ise loss kaç?", opts: ["~3.33", "1.0", "27", "0"], ans: 0, explain: "-log(1/27) = log(27) ≈ 3.30. Bu, rastgele tahmin eden modelin loss'udur. Eğitimle bu değer düşer." },
    { q: "Learning rate çok büyükse ne olur?", opts: ["Hiçbir etkisi yok", "Daha hızlı öğrenir", "Daha iyi geneller", "Minimum etrafında salınır veya patlar (diverge)"], ans: 3, explain: "Büyük LR → büyük adım → minimumu atlar → loss yükselir → model 'patlar'. Küçük LR güvenli ama yavaş." },
    { q: "Adam optimizer'da momentum ne işe yarar?", opts: ["Hız artışı", "Loss hesabı", "Bellek tasarrufu", "Önceki gradientleri hatırlayarak salınımı azaltır"], ans: 3, explain: "Momentum = gradient yönünün hareketli ortalaması. Gürültülü gradientleri düzleştirir, kararlı ilerlemedir." },
    { q: "Eğitim döngüsünün doğru sırası hangisidir?", opts: ["Loss → Backward → Forward", "Backward → Forward → Güncelle", "Forward → Loss → Backward → Güncelle → Grad sıfırla", "Güncelle → Forward → Loss"], ans: 2, explain: "Forward pass (tahmin) → loss hesapla → backward pass (gradient) → optimizer güncelle → gradient sıfırla → tekrarla." },
    { q: "Neden -log(p) kullanılır, neden sadece (1-p) değil?", opts: ["Düşük olasılığa ÇOK ağır ceza verir, bilgi teorisi ile uyumlu", "Geleneksel", "Daha hızlı hesaplanır", "Fark yok"], ans: 0, explain: "-log(0.01) = 4.6 ama 1-0.01 = 0.99. Log, düşük olasılıklara çok daha ağır ceza verir → model kesin yanlışlardan kaçınır." },
    { q: "Linear decay'de step=500 (toplam 1000) ise lr_t ne olur? (lr=0.01)", opts: ["0", "0.001", "0.005", "0.01"], ans: 2, explain: "lr_t = 0.01 × (1 - 500/1000) = 0.01 × 0.5 = 0.005. Yarıda yarı hız — minimum'a yaklaştıkça daha küçük adımlar." },
    { q: "Gradient sıfırlanmazsa ne olur?", opts: ["Daha iyi geneller", "Hiçbir etki yok", "Daha hızlı öğrenir", "Gradient birikir → sürekli büyür → model patlar"], ans: 3, explain: "+= ile gradient birikir: 0.5 → 0.8 → 1.5 → ... → ∞. Her adımda p.grad = 0 yapılmalı!" },
  ],
  6: [
    { q: "Inference'da backward pass yapılır mı?", opts: ["Hayır — sadece forward pass yeterli", "Evet, her zaman", "Sadece ilk adımda", "Opsiyonel"], ans: 0, explain: "Inference'da parametre güncellemesi yok → gradient gerekmez → backward pass yok → daha hızlı, daha az bellek." },
    { q: "Temperature=0.1 ile üretim nasıl olur?", opts: ["Tamamen rastgele", "Neredeyse deterministik — hep en olası token seçilir", "Çok yaratıcı", "Model çöker"], ans: 1, explain: "Düşük T → logitler/T büyür → softmax çok sivri → en yüksek olasılıklı token neredeyse %100 alır. Tekrarlara düşer." },
    { q: "KV Cache ne sağlar?", opts: ["Daha fazla parametre", "Daha iyi sonuç", "Önceki tokenları yeniden hesaplamadan saklar → O(n²)→O(n)", "Sıkıştırma"], ans: 2, explain: "Her yeni token için sadece 1 K,V hesaplanır, öncekiler cache'ten okunur. Zaman: O(n²) → O(n)." },
    { q: "Autoregressive üretim neden sıralı çalışır?", opts: ["Bellek yetersizliği", "Her token önceki token'a bağlıdır — paralel üretilemez", "GPU yetersizliği", "Tasarım hatası"], ans: 1, explain: "pos=3'ü üretmek için pos=2'nin çıktısı gerekir. Bu nedenle her token sırayla üretilmeli — paralellik mümkün değil." },
    { q: "Temperature=2.0 ile üretim nasıl olur?", opts: ["Çok yaratıcı — düşük olasılıklı tokenlar da seçilir", "Her zaman aynı isim", "Model çöker", "Sessiz kalır"], ans: 0, explain: "Yüksek T → logitler küçülür → softmax düzleşir → tüm tokenlar yakın olasılıkla → kaotik, anlamsız sonuçlar." },
    { q: "Üretim ne zaman durur?", opts: ["Loss sıfır olunca", "Kullanıcı durdurna kadar", "8 harf üretince", "BOS/EOS token üretilince veya max uzunluğa ulaşınca"], ans: 3, explain: "İki duruş koşulu: BOS token üretilirse DUR (model 'bitti' diyor) veya block_size=8'e ulaşılırsa DUR (max uzunluk)." },
    { q: "Bu kod ile GPT-4 arasındaki TEK fark nedir?", opts: ["Farklı matematik", "Farklı algoritma", "Sadece ölçek ve mühendislik — temel matematik aynı", "Farklı programlama dili"], ans: 2, explain: "Birebir aynı algoritma! Fark: 3,648 vs 1T+ parametre, CPU vs 10K+ GPU, dakikalar vs aylar. Matematik = aynı." },
  ],
  7: [
    { q: "Scaling laws ne der?", opts: ["Parametre/veri artınca loss güç yasasıyla düşer", "Küçük model her zaman yeterli", "Ölçek önemsiz", "Büyük model her zaman kötü"], ans: 0, explain: "Kaplanick et al.: loss ∝ 1/N^α. Daha fazla parametre VE veri → daha düşük loss. Güç yasası ilişkisi." },
    { q: "Pre-training → SFT → RLHF sıralamasının amacı nedir?", opts: ["Ham güç → yetenek → iyi davranış (hizalama)", "Hız artışı", "Maliyet azaltma", "Sadece gelenek"], ans: 0, explain: "Pre-training: genel bilgi öğren. SFT: assistant gibi davran. RLHF: zararsız ve yararlı ol. Her aşama bir katman ekler." },
    { q: "BPE tokenization'ın karakter düzeyine avantajı nedir?", opts: ["Aynı metin daha az token → daha uzun context", "Daha yavaş", "Daha basit", "Fark yok"], ans: 0, explain: "'playing' karakter: 7 token, BPE: 2 token. Aynı context window'a 3× daha fazla metin sığar → daha iyi anlama." },
    { q: "Flash Attention neyi değiştirir?", opts: ["Matematik formülünü", "Bellek erişim düzenini — sonuç aynı, 2-4× hızlı", "Attention'ı kaldırır", "Parametre sayısını"], ans: 1, explain: "Aynı softmax(QKᵀ/√d)V hesabı! Fark: GPU bellek hiyerarşisine uygun tiling → IO darboğazı çözülür → 2-4× hız." },
    { q: "MoE (Mixture of Experts) nasıl verimlilik sağlar?", opts: ["Tüm parametreleri kullanır", "Her token sadece 2/8 uzmanı aktive eder → az hesaplama", "Attention'ı kaldırır", "Parametre azaltır"], ans: 1, explain: "GPT-4 ~1.8T toplam parametre ama her token sadece ~280B aktif parametre kullanır. Büyük kapasite, verimli çalışma." },
    { q: "GPU neden AI eğitiminde CPU'dan çok daha iyi?", opts: ["Daha az enerji", "Binlerce paralel çekirdek matris çarpımını aynı anda yapar", "Daha ucuz", "Daha basit mimari"], ans: 1, explain: "LLM = devasa matris çarpımları. GPU 6,912 CUDA çekirdeği ile bunları paralel yapar. CPU 8-16 çekirdek ile sıralı." },
    { q: "microGPT ile GPT-4'ün ortak noktası nedir?", opts: ["Parametre sayısı", "Donanım", "Temel Transformer algoritması: embedding + attention + MLP + softmax", "Eğitim verisi"], ans: 2, explain: "İkisi de aynı matematik: token embed → multi-head attention → MLP → softmax → next-token prediction. Fark = ölçek." },
  ],
  8: [
    { q: "BPE'de en sık komşu çifti birleştirmenin bilgi-teorik gerekçesi nedir?", opts: ["Hız artışı", "Estetik sebep", "Bellek tasarrufu", "Entropy azaltma: sık çiftleri tek sembolle kodlamak toplam bit sayısını düşürür"], ans: 3, explain: "Shannon'ın kaynak kodlama teoremi: sık semboller kısa kod → ortalama uzunluk ≈ H(X). BPE buna yaklaşır." },
    { q: "Hessian matrisi eğitimde ne bilgi verir?", opts: ["Parametre uzayındaki eğrilik — minimum'un keskin mi düz mü olduğunu gösterir", "Gradient yönü", "Parametre sayısı", "Loss değeri"], ans: 0, explain: "Hessian eigenvalue'ları: büyük = keskin minimum (genelleme kötü), küçük = düz (iyi genelleme). Newton yöntemi Hessian kullanır." },
    { q: "Attention head pruning'de Taylor expansion skoru neyi ölçer?", opts: ["Head'in kaldırılmasının loss'a etkisini birinci derece yaklaşımla tahmin eder", "Head renkliliğini", "Head boyutunu", "Head hızını"], ans: 0, explain: "I(h) = |α_h · ∂L/∂α_h| ≈ ΔL (head kaldırıldığında loss değişimi). Düşük skor = gereksiz head." },
    { q: "Embedding isotropy neden önemlidir?", opts: ["Hız artışı", "Anisotropik uzayda tokenlar dar bir koniye sıkışır → benzerlik ölçümleri anlamsızlaşır", "Görsel güzellik", "Bellek tasarrufu"], ans: 1, explain: "Tüm vektörler aynı yöne bakıyorsa cosine similarity hep yüksek → ayırt edicilik kaybolur. İyi embedding isotropik." },
    { q: "Float16'da softmax overflow'u nasıl önlenir?", opts: ["max-trick: softmax(x) = softmax(x - max(x)) ile numerik kararlılık sağlanır", "Float64 kullanılır", "Softmax kullanılmaz", "Önlenemez"], ans: 0, explain: "exp(100) = overflow ama exp(100-100)=exp(0)=1. max çıkarma matematiği değiştirmez, numerik kararlılık sağlar." },
    { q: "Akademik raporda 'Related Work' bölümü neden zorunludur?", opts: ["Sayfa doldurmak", "Çalışmanızı mevcut literatüre konumlandırır ve katkınızın orijinalliğini gösterir", "Referans sayısını artırmak", "Gelenek"], ans: 1, explain: "Related work: 'daha önce ne yapıldı, benim farkım ne?' sorusuna cevap verir. Akademik katkının temeli." },
    { q: "Kontrollü deneyde 'kontrol değişkeni' ne demektir?", opts: ["En önemli parametre", "Deneyde sabit tutulan değişken — sadece bir şeyi değiştirerek etkisini ölç", "Rastgele seçilen değer", "Sonuç değişkeni"], ans: 1, explain: "Örnek: BPE vs Unigram karşılaştırmasında vocab boyutu, veri seti, model mimarisi SABİT. Sadece tokenizer DEĞİŞİR." },
  ],
  9: [
    { q: "Neural Architecture Search'te Pareto frontı ne gösterir?", opts: ["En kötü modeller", "Rastgele noktalar", "Loss vs parametre trade-off'unda optimal noktaları — birini iyileştirmeden diğeri kötüleşmez", "En iyi model"], ans: 2, explain: "Pareto-optimal: A noktasından B'ye geçince ya loss artar ya parametre. İkisi birden azalmaz. Tasarım kararı gerektirir." },
    { q: "Knowledge distillation'da temperature T_distill neden yüksek tutulur?", opts: ["Hız için", "Bellek tasarrufu", "Soft targets daha bilgi içerir: düşük olasılıklı sınıflar arasındaki ilişkileri de aktarır", "Rastgele seçim"], ans: 2, explain: "T=1: [0.9, 0.05, 0.05] → sadece 'doğru cevap'. T=5: [0.4, 0.35, 0.25] → 'yanlışlar arasındaki benzerlik' bilgisi de aktarılır." },
    { q: "RoPE neden context genellemede learned PE'den üstündür?", opts: ["Daha hızlı", "Göreceli pozisyon bilgisi: eğitim uzunluğu ötesinde de çalışır çünkü fark tabanlı", "Daha az parametre", "Daha basit"], ans: 1, explain: "Learned PE: pos=8'i hiç görmedi → bilinmeyen vektör. RoPE: pos(i)-pos(j) farkı önemli → uzun context'e geneller." },
    { q: "Sparse attention'da %50 sparsity ne kadar FLOPs tasarrufu sağlar?", opts: ["Tasarruf yok", "%90", "%10", "Teorik %50, pratikte %30-40 (overhead nedeniyle)"], ans: 3, explain: "%50 token atlanır → QK^T'nin yarısı hesaplanmaz. Ama maskeleme + indexing overhead'i tam %50'ye ulaşmayı engeller." },
    { q: "Grokking fenomeni nedir?", opts: ["Overfitting", "Underfitting", "Hızlı öğrenme", "Eğitim loss≈0 olduktan ÇOK sonra aniden test loss'un da düşmesi — gecikmeli genelleme"], ans: 3, explain: "Küçük veri + uzun eğitim: model önce ezberler (train↓, test→), sonra aniden geneller (test↓). Neden olduğu hala araştırılıyor." },
    { q: "Loss landscape'te 'flat minimum' neden tercih edilir?", opts: ["Küçük parametre pertürbasyon'a karşı dayanıklı → daha iyi genelleme", "Daha düşük loss", "Daha hızlı eğitim", "Daha az parametre"], ans: 0, explain: "Sharp minimum: küçük w değişimi → büyük loss artışı (kırılgan). Flat: w±ε → loss stabil. Test veri dağılım kaymasına dayanıklı." },
    { q: "Ablation study nedir ve neden YL projelerinde zorunludur?", opts: ["Hepsini ekle", "Kodu sil", "Her bileşeni tek tek çıkararak bireysel katkısını ölç — bilimsel yöntemin temelidir", "En iyi sonucu bul"], ans: 2, explain: "4 özellik eklediniz, toplam %15 iyileşme. Hangisi ne kadar katkı yaptı? Ablation olmadan bunu BİLEMEZSİNİZ." },
  ]
};
const COMMON_MISTAKES = {
  0: [
    { mistake: "\"GPT sadece büyük şirketler yapabilir\"", truth: "Bu 243 satırlık kod AYNI algoritmayı çalıştırır. Fark sadece ölçek ve donanımdır." },
    { mistake: "\"Derin öğrenme çok matematik gerektirir\"", truth: "Temel 4 işlem + türev yeterli. Bu derste göreceğiniz gibi her adım basit aritmetik." },
  ],
  1: [
    { mistake: "\"Embedding rastgele sayılardır, anlamsız\"", truth: "Başta rastgele ama eğitimle anlam kazanır. Benzer tokenlar yakın vektörlere sahip olur." },
    { mistake: "\"Token ID sırası önemli (a=0, b=1 → a ve b yakın)\"", truth: "ID sırası anlam taşımaz! Embedding zaten ilişkileri öğrenir. ID sadece indeks." },
    { mistake: "\"BOS ve EOS farklı tokenlar\"", truth: "Bu kodda ikisi de aynı token (ID=26). Bağlam farkını model öğrenir." },
  ],
  2: [
    { mistake: "\"grad = (eşittir) yeterli, += gerekmiyor\"", truth: "KRİTİK HATA! Bir parametre birden fazla yoldan loss'u etkiliyorsa (weight tying gibi) gradientler TOPLANMALI." },
    { mistake: "\"Her adımda gradient sıfırlamak gereksiz\"", truth: "Sıfırlanmazsa gradientler birikir → model patlar. p.grad = 0 her adımda ŞART." },
    { mistake: "\"Backward'da düğüm sırası önemli değil\"", truth: "Yanlış sırada gradient hesaplarsanız chain rule bozulur. Topological sort zorunlu." },
  ],
  3: [
    { mistake: "\"Q, K, V hep aynı — neden 3 ayrı matris?\"", truth: "Her biri farklı rol: Q=ne arıyorum, K=bende ne var, V=bilgi içeriği. Farklı projeksiyon farklı öğrenme." },
    { mistake: "\"Scaling (÷√d) sadece optimizasyon tricki\"", truth: "Hayır, kritik! Onsuz büyük boyutlarda softmax spike yapıp gradient kaybolur — model öğrenemez." },
  ],
  4: [
    { mistake: "\"Normalizasyon olmazsa da eğitilir\"", truth: "Derin ağlarda aktivasyonlar katman katman patlar veya kaybolur. Norm olmadan 2+ katmanlı model eğitilemez." },
    { mistake: "\"Residual sadece derin ağlar için lazım\"", truth: "Tek katmanlı bu kodda bile residual, kararlı eğitim ve identity başlatma sağlar." },
  ],
  5: [
    { mistake: "\"Loss her adımda düşmeli\"", truth: "Stochastic eğitimde (tek örnek/adım) loss salınır, bu NORMAL. Trend düşüyorsa model öğreniyor." },
    { mistake: "\"Learning rate yüksekse daha hızlı öğrenir\"", truth: "Belirli bir noktadan sonra LR artışı → patlama → loss NaN olur. İyi LR = denge." },
  ],
  6: [
    { mistake: "\"Temperature=0 en iyi sonuç verir\"", truth: "T≈0 deterministik → çeşitlilik yok, tekrarlara düşer. İyi üretim için T=0.7-1.0 dengeli." },
    { mistake: "\"Model her çalışmada aynı sonuç vermeli\"", truth: "Sampling stokastik → farklı rastgele tohum = farklı sonuç. Bu, özellik, hata değil." },
  ],
  7: [
    { mistake: "\"GPT-4 tamamen farklı bir teknoloji\"", truth: "Aynı Transformer temeli! Fark sadece ölçek (parametre, veri, donanım) ve mühendislik optimizasyonları." },
    { mistake: "\"Açık kaynak modeller zayıf\"", truth: "LLaMA 3.1 405B, DeepSeek-V3 birçok görevde GPT-4'e yakın veya eşit performans gösteriyor." },
    { mistake: "\"RLHF modeli akıllı yapar\"", truth: "RLHF hizalama (güvenlik, yararlılık) sağlar — temel yetenek pre-training'den gelir." },
  ],
  8: [
    { mistake: "\"Projeyi son güne bırakırım\"", truth: "Kod yazmak kolay, DEBUG etmek zor. İlk hafta çalışan bir şey olsun, ikinci hafta geliştirin." },
    { mistake: "\"ChatGPT ile tüm kodu yazarım, teslim ederim\"", truth: "Her satırı açıklayabilmelisiniz. Oral sınavda 'bunu AI yazdı' = sıfır puan." },
  ],
  9: [
    { mistake: "\"En karmaşık projeyi seçmeliyim\"", truth: "En ÇOK ÖĞRENECEĞİNİZ projeyi seçin. Basit ama iyi anlaşılmış > karmaşık ama yarım." },
    { mistake: "\"Rapor opsiyoneldir\"", truth: "Final'de analiz ve yorumlama %25 puan. Kod çalışsa bile raporsuz tam not alamazsınız." },
  ]
};

// ─── GLOSSARY (SÖZLÜK) ──────────────────────────────────────────
const GLOSSARY = [
  { term: "Autograd", def: {tr:"Hesaplama grafı üzerinde otomatik türev alma sistemi. Her operasyonun yerel türevini bilerek chain rule ile geri yayılım yapar.",en:"Automatic differentiation system on computation graphs. Performs backpropagation via chain rule knowing each operation's local derivative."}, cat: "temel", week: 2 },
  { term: "Autoregressive", def: {tr:"Her adımda kendi çıktısını girdi olarak kullanan üretim yöntemi. GPT autoregressive: önceki tokenlara bakarak sonraki tokeni tahmin eder.",en:"Generation method that uses its own output as input at each step. GPT is autoregressive: predicts next token by looking at previous tokens."}, cat: "model", week: 0 },
  { term: "Attention", def: {tr:"Her tokenın diğer tokenlara dinamik ağırlıklarla 'dikkat etme' mekanizması. Formül: softmax(Q·Kᵀ/√d)·V",en:"Mechanism for each token to 'attend' to others with dynamic weights. Formula: softmax(Q·Kᵀ/√d)·V"}, cat: "mimari", week: 3 },
  { term: "Backward Pass", def: {tr:"Loss'tan parametrelere doğru gradient hesaplama süreci. Chain rule ile her düğümün gradientini hesaplar.",en:"Process of computing gradients from loss to parameters. Computes each node's gradient via chain rule."}, cat: "temel", week: 2 },
  { term: "BOS/EOS", def: {tr:"Beginning/End of Sequence. Dizinin başını ve sonunu işaret eden özel token.",en:"Beginning/End of Sequence. Special token marking start and end of a sequence."}, cat: "veri", week: 1 },
  { term: "Causal Mask", def: {tr:"Her tokenın sadece önceki tokenlara bakabilmesini sağlayan maskeleme. GPT'nin 'kopya çekmesini' engeller.",en:"Masking that ensures each token can only look at previous tokens. Prevents GPT from 'cheating'."}, cat: "mimari", week: 3 },
  { term: "Chain Rule", def: {tr:"Bileşik fonksiyonların türev kuralı: f(g(x))' = f'(g(x)) × g'(x). Autograd'ın temelindeki matematik.",en:"Derivative rule for composite functions: f(g(x))' = f'(g(x)) × g'(x). The math behind autograd."}, cat: "temel", week: 2 },
  { term: "Cross-Entropy Loss", def: {tr:"L = -log(P(doğru_token)). Modelin tahmin kalitesini ölçen kayıp fonksiyonu. Düşük loss = iyi model.",en:"L = -log(P(correct_token)). Loss function measuring prediction quality. Low loss = good model."}, cat: "eğitim", week: 5 },
  { term: "Dot Product", def: {tr:"İki vektörün element-wise çarpımlarının toplamı: a·b = Σ aᵢbᵢ. Benzerlik ölçüsü olarak kullanılır.",en:"Sum of element-wise products of two vectors: a·b = Σ aᵢbᵢ. Used as a similarity measure."}, cat: "temel", week: 3 },
  { term: "Embedding", def: {tr:"Token ID'yi çok boyutlu sürekli vektöre dönüştüren öğrenilebilir tablo. Bu kodda 28×16 matris.",en:"Learnable lookup table converting token IDs to multi-dimensional continuous vectors. In this code: 28×16 matrix."}, cat: "mimari", week: 1 },
  { term: "Forward Pass", def: {tr:"Girdi → model katmanları → çıktı (logits) hesaplama süreci. İleri yönde data akışı.",en:"Process of computing input → model layers → output (logits). Forward data flow."}, cat: "temel", week: 0 },
  { term: "Loss", def: {tr:"Modelin tahmin kalitesini ölçen hata fonksiyonu. Düşük loss = iyi tahmin. microGPT başlangıç: 3.33, eğitim sonrası: ~2.0.",en:"Error function measuring prediction quality. Low loss = good prediction. microGPT start: 3.33, after training: ~2.0."}, cat: "temel", week: 0 },
  { term: "Parametre", def: {tr:"Modelin öğrenilebilir sayısal değerleri (ağırlıklar). microGPT: 3,648 parametre, GPT-4: ~1T+.",en:"Model's learnable numerical values (weights). microGPT: 3,648 parameters, GPT-4: ~1T+."}, cat: "temel", week: 0 },
  { term: "Hyperparametre", def: {tr:"Eğitim öncesi sabitlenen tasarım kararları: n_embd, n_layer, learning_rate vb. Eğitimle değişmez.",en:"Design decisions fixed before training: n_embd, n_layer, learning_rate etc. Not changed during training."}, cat: "temel", week: 0 },
  { term: "Pipeline", def: {tr:"Veriyi adım adım işleyen sıralı süreç. GPT: tokenize → embed → attend → MLP → predict.",en:"Sequential process that processes data step by step. GPT: tokenize → embed → attend → MLP → predict."}, cat: "temel", week: 0 },
  { term: "Gradient", def: {tr:"Tüm kısmi türevlerin vektörü: ∇f = [∂f/∂w₁, ∂f/∂w₂, ...]. Parametrelerin güncelleme yönünü gösterir.",en:"Vector of all partial derivatives: ∇f = [∂f/∂w₁, ∂f/∂w₂, ...]. Shows parameter update direction."}, cat: "temel", week: 2 },
  { term: "Gradient Descent", def: {tr:"Parametreleri gradient'in ters yönünde güncelleyerek loss'u minimize etme: w -= lr × ∂L/∂w",en:"Minimizing loss by updating parameters in the opposite direction of gradient: w -= lr × ∂L/∂w"}, cat: "eğitim", week: 5 },
  { term: "KV Cache", def: {tr:"Önceki pozisyonların Key ve Value vektörlerini saklayarak tekrar hesaplamayı önleyen optimizasyon.",en:"Optimization that stores previous positions' Key and Value vectors to avoid recomputation."}, cat: "mimari", week: 6 },
  { term: "Learning Rate", def: {tr:"Parametre güncelleme adım boyutu. Çok büyük → patlama, çok küçük → yavaş öğrenme.",en:"Parameter update step size. Too large → explosion, too small → slow learning."}, cat: "eğitim", week: 5 },
  { term: "Logits", def: {tr:"Modelin son katman ham çıktı skorları. Softmax'tan geçirilmeden önceki değerler.",en:"Model's raw output scores from the last layer. Values before softmax."}, cat: "model", week: 1 },
  { term: "MLP (Feed-Forward)", def: {tr:"Her tokena bağımsız uygulanan genişlet→aktive et→daralt ağı. Bu kodda: 16→64→16.",en:"Expand→activate→compress network applied independently to each token. In this code: 16→64→16."}, cat: "mimari", week: 4 },
  { term: "Multi-Head Attention", def: {tr:"Embedding'i birden fazla head'e bölüp her birinde bağımsız attention hesaplama. Farklı kalıplar öğrenir.",en:"Splitting embedding into multiple heads with independent attention computation. Learns different patterns."}, cat: "mimari", week: 3 },
  { term: "ReLU²", def: {tr:"Aktivasyon fonksiyonu: max(0,x)². Negatifler sıfır olur, pozitifler karesel büyür → sparse temsil.",en:"Activation function: max(0,x)². Negatives become zero, positives grow quadratically → sparse representation."}, cat: "mimari", week: 4 },
  { term: "Residual Connection", def: {tr:"x = f(x) + x_skip. Girdiyi çıktıya ekleyerek gradient akışına kestirme yol sağlar.",en:"x = f(x) + x_skip. Provides gradient shortcut by adding input to output."}, cat: "mimari", week: 4 },
  { term: "RMSNorm", def: {tr:"x / √(mean(x²) + ε). LayerNorm'un hızlı versiyonu — ortalama çıkarma adımı yok.",en:"x / √(mean(x²) + ε). Fast version of LayerNorm — no mean subtraction step."}, cat: "mimari", week: 4 },
  { term: "Sampling", def: {tr:"Olasılık dağılımından rastgele token seçme. Temperature ile kontrol edilir.",en:"Randomly selecting a token from probability distribution. Controlled by temperature."}, cat: "model", week: 6 },
  { term: "Softmax", def: {tr:"Ham skorları olasılık dağılımına çevirir: P(i) = exp(xᵢ)/Σexp(xⱼ). Toplam her zaman 1.",en:"Converts raw scores to probability distribution: P(i) = exp(xᵢ)/Σexp(xⱼ). Sum always equals 1."}, cat: "temel", week: 1 },
  { term: "Temperature", def: {tr:"Softmax'ın sivriliğini kontrol eden parametre. T<1 → deterministik, T>1 → rastgele.",en:"Parameter controlling softmax sharpness. T<1 → deterministic, T>1 → random."}, cat: "model", week: 6 },
  { term: "Token", def: {tr:"Modelin işlediği en küçük birim. Bu kodda her karakter (a-z + BOS) bir token.",en:"Smallest unit the model processes. In this code each character (a-z + BOS) is a token."}, cat: "veri", week: 1 },
  { term: "Topological Sort", def: {tr:"DAG'da düğümleri bağımlılık sırasına dizen algoritma. Backward pass'te doğru gradient sırasını sağlar.",en:"Algorithm that orders DAG nodes by dependency. Ensures correct gradient order in backward pass."}, cat: "temel", week: 2 },
  { term: "Transformer", def: {tr:"Attention + MLP + Norm + Residual'dan oluşan mimari. 2017'de tanıtıldı, tüm modern LLM'lerin temeli.",en:"Architecture composed of Attention + MLP + Norm + Residual. Introduced in 2017, foundation of all modern LLMs."}, cat: "mimari", week: 4 },
  { term: "Weight Tying", def: {tr:"Giriş embedding matrisi (wte) ile çıkış projeksiyon matrisinin paylaşılması. Parametre tasarrufu sağlar.",en:"Sharing input embedding matrix (wte) with output projection matrix. Saves parameters."}, cat: "mimari", week: 1 },
  { term: "Scaling Laws", def: {tr:"Model boyutu, veri ve hesaplama artınca loss'un güç yasasıyla düştüğünü gösteren ampirik yasalar (Kaplanick 2020).",en:"Empirical laws showing loss decreases as a power law with model size, data, and compute (Kaplan 2020)."}, cat: "evrim", week: 7 },
  { term: "BPE", def: {tr:"Byte Pair Encoding: En sık karakter çiftlerini birleştirerek alt-kelime token'ları oluşturan tokenization algoritması.",en:"Byte Pair Encoding: Tokenization algorithm creating subword tokens by merging the most frequent character pairs."}, cat: "evrim", week: 7 },
  { term: "RLHF", def: {tr:"Reinforcement Learning from Human Feedback: İnsan tercihleri ile modeli 'iyi davranışa' hizalama yöntemi.",en:"Reinforcement Learning from Human Feedback: Method for aligning the model to 'good behavior' using human preferences."}, cat: "evrim", week: 7 },
  { term: "SFT", def: {tr:"Supervised Fine-Tuning: İnsan yazımı soru-cevap çiftleri ile modeli assistant formatına dönüştürme.",en:"Supervised Fine-Tuning: Converting the model to assistant format using human-written Q&A pairs."}, cat: "evrim", week: 7 },
  { term: "MoE", def: {tr:"Mixture of Experts: Birden fazla uzman ağ, her token sadece birkaçını aktive eder → verimli büyük model.",en:"Mixture of Experts: Multiple expert networks, each token activates only a few → efficient large model."}, cat: "evrim", week: 7 },
  { term: "Flash Attention", def: {tr:"IO-aware tiling ile standart attention'ı 2-4× hızlandıran algoritma. Matematik aynı, bellek erişimi farklı.",en:"Algorithm that speeds up standard attention 2-4× via IO-aware tiling. Same math, different memory access."}, cat: "evrim", week: 7 },
  { term: "RAG", def: {tr:"Retrieval-Augmented Generation: Dış bilgi tabanından ilgili dokümanları çekip yanıta ekleyen yöntem.",en:"Retrieval-Augmented Generation: Method that retrieves relevant documents from external knowledge base and adds to response."}, cat: "evrim", week: 7 },
  { term: "Ablation Study", def: {tr:"Her bileşeni tek tek çıkararak bireysel katkısını ölçen deneysel yöntem. YL araştırmanın temel aracı.",en:"Experimental method measuring individual contribution by removing each component. A fundamental research tool."}, cat: "araştırma", week: 8 },
  { term: "Hessian", def: {tr:"İkinci türev matrisi. Loss landscape'ın eğriliğini gösterir. Newton yöntemi Hessian kullanır.",en:"Second derivative matrix. Shows the curvature of the loss landscape. Newton's method uses the Hessian."}, cat: "araştırma", week: 8 },
  { term: "Isotropy", def: {tr:"Embedding vektörlerinin uzayda eşit dağılımı. Anisotropik = dar koniye sıkışmış = kötü.",en:"Equal distribution of embedding vectors in space. Anisotropic = squeezed into narrow cone = bad."}, cat: "araştırma", week: 8 },
  { term: "Head Pruning", def: {tr:"Gereksiz attention head'lerini kaldırma. Taylor expansion ile importance skoru hesaplanır.",en:"Removing unnecessary attention heads. Importance score computed via Taylor expansion."}, cat: "araştırma", week: 8 },
  { term: "Entropy", def: {tr:"H(X) = -Σp(x)log(p(x)). Belirsizlik ölçüsü. Tokenizer değerlendirmede kullanılır.",en:"H(X) = -Σp(x)log(p(x)). Measure of uncertainty. Used in tokenizer evaluation."}, cat: "araştırma", week: 8 },
  { term: "Pareto Front", def: {tr:"Çok amaçlı optimizasyonda optimal noktalar kümesi. Birini iyileştirmeden diğeri kötüleşmez.",en:"Set of optimal points in multi-objective optimization. Can't improve one without worsening another."}, cat: "araştırma", week: 9 },
  { term: "Knowledge Distillation", def: {tr:"Büyük teacher modelin bilgisini küçük student modele aktarma. Soft targets ile sınıflar arası ilişki aktarılır.",en:"Transferring knowledge from large teacher model to small student model. Inter-class relationships transferred via soft targets."}, cat: "araştırma", week: 9 },
  { term: "Grokking", def: {tr:"Eğitim loss≈0 olduktan çok sonra test loss'un aniden düşmesi. Gecikmeli genelleme fenomeni.",en:"Test loss suddenly dropping long after training loss≈0. A delayed generalization phenomenon."}, cat: "araştırma", week: 9 },
  { term: "RoPE", def: {tr:"Rotary Position Embedding. Q,K vektörlerini pozisyona göre döndürerek göreceli pozisyon bilgisi sağlar.",en:"Rotary Position Embedding. Provides relative position info by rotating Q,K vectors based on position."}, cat: "araştırma", week: 9 },
  { term: "NAS", def: {tr:"Neural Architecture Search. Otomatik mimari arama: arama uzayı + strateji (random/Bayesian) + değerlendirme.",en:"Neural Architecture Search. Automatic architecture search: search space + strategy (random/Bayesian) + evaluation."}, cat: "araştırma", week: 9 },
];

// ─── COMPARISON TABLES ───────────────────────────────────────────
const COMPARISONS = {
  "model_scale": {
    title: {tr:"Model Ölçek Karşılaştırma",en:"Model Scale Comparison"},
    headers: ["", "microGPT", "GPT-1", "GPT-2", "GPT-3", "GPT-4"],
    rows: [
      ["Parametre", "3,648", "117M", "1.5B", "175B", "~1T+"],
      [lang==="tr"?"Katman":"Layers", "1", "12", "48", "96", "?"],
      ["Embedding", "16", "768", "1600", "12288", "?"],
      ["Context", "8", "512", "1024", "2048", "128K"],
      ["Vocab", "28", "~40K", "~50K", "~50K", "~100K"],
      [lang === "tr" ? lang === "tr" ? "Yıl" : "Year" : "Year", "2024", "2018", "2019", "2020", "2023"],
    ],
    note: {tr:"Algoritma aynı — fark sadece ölçek ve mühendislik.",en:"Same algorithm — difference is only scale and engineering."}
  },
  "norm_compare": {
    title: {tr:"Normalizasyon Yöntemleri",en:"Normalization Methods"},
    headers: ["", "BatchNorm", "LayerNorm", "RMSNorm ★"],
    rows: [
      ["Formül", "x-μ_batch/σ_batch", "(x-μ)/σ + γ,β", "x/√(mean(x²)+ε)"],
      [lang==="tr"?"İşlem sayısı":"Operations", "5", "4", "2"],
      [lang==="tr"?"Öğr. parametre":"Learn. params", "2 (γ,β)", "2 (γ,β)", "1 (γ)"],
      [lang==="tr"?"Batch bağımlı":"Batch dependent", "Evet", "Hayır", "Hayır"],
      [lang === "tr" ? "Hız" : "Speed", lang==="tr"?"Orta":"Medium", lang==="tr"?"Orta":"Medium", lang==="tr"?"~%30 hızlı":"~30% faster"],
      [lang==="tr"?"Kullanan":"Used by", "ResNet", "GPT-2", "LLaMA, Mistral"],
    ],
    note: {tr:"★ = bu kodda kullanılan. Modern LLM standardı.",en:"★ = used in this code. Modern LLM standard."}
  },
  "optimizer_compare": {
    title: {tr:"Optimizer Karşılaştırma",en:"Optimizer Comparison"},
    headers: ["", "SGD", "Momentum", "Adam ★"],
    rows: [
      [lang==="tr"?"Güncelleme":"Update", "w -= lr·g", "m = βm + g", "m + v adaptif"],
      ["Adaptif LR", "❌", "❌", "✅"],
      ["Momentum", "❌", "✅", "✅"],
      [lang==="tr"?"Bellek (param başı)":"Memory (per param)", "0", "+1 buffer", "+2 buffer"],
      [lang==="tr"?"Avantaj":"Advantage", lang==="tr"?"Basit":"Simple", lang==="tr"?"Düzgün ilerle":"Smooth progress", lang==="tr"?"Her param. kendi LR":"Per-param LR"],
      [lang==="tr"?"NLP'de tercih":"NLP preference", lang==="tr"?"Nadir":"Rare", lang==="tr"?"Nadir":"Rare", lang==="tr"?"Standart":"Standard"],
    ],
    note: {tr:"★ = bu kodda kullanılan. NLP'de Adam (veya AdamW) baskın.",en:"★ = used in this code. Adam (or AdamW) dominant in NLP."}
  },
  "activation_compare": {
    title: {tr:"Aktivasyon Fonksiyonları",en:"Activation Functions"},
    headers: ["", "ReLU", "ReLU² ★", "GELU", "SwiGLU"],
    rows: [
      ["Formül", "max(0,x)", "max(0,x)²", "x·Φ(x)", "gate·xW"],
      ["f(-1)", "0", "0", "-0.16", "-"],
      ["f(0.5)", "0.5", "0.25", "0.35", "-"],
      ["f(2)", "2", "4", "1.95", "-"],
      ["Sparsity", lang==="tr"?"Orta":"Medium", lang==="tr"?"Yüksek":"High", lang==="tr"?"Düşük":"Low", lang==="tr"?"Orta":"Medium"],
      [lang==="tr"?"Kullanan":"Used by", lang==="tr"?"Klasik":"Classic", "microGPT", "GPT-2", "LLaMA"],
    ],
    note: {tr:"★ = bu kodda. ReLU² küçükleri küçültür, büyükleri büyütür → seçici.",en:"★ = in this code. ReLU² shrinks small values, amplifies large ones → selective."}
  }
};

// ─── RESOURCES (KAYNAKLAR) ───────────────────────────────────────
const RESOURCES = {
  0: [
    { title: "Karpathy — microGPT Gist", url: "https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95", type: "kod" },
    { title: "Karpathy — Let's build GPT from scratch", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY", type: "video" },
    { title: "Karpathy — makemore serisi", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", type: "video" },
  ],
  1: [
    { title: "3Blue1Brown — Word Embeddings", url: "https://www.youtube.com/watch?v=wjZofJX0v4M", type: "video" },
    { title: "Jay Alammar — The Illustrated Word2Vec", url: "https://jalammar.github.io/illustrated-word2vec/", type: "blog" },
    { title: "HuggingFace — Tokenizer Docs", url: "https://huggingface.co/docs/tokenizers", type: "docs" },
  ],
  2: [
    { title: "Karpathy — micrograd (autograd sıfırdan)", url: "https://github.com/karpathy/micrograd", type: "kod" },
    { title: "3Blue1Brown — Backpropagation", url: "https://www.youtube.com/watch?v=Ilg3gGewQ5U", type: "video" },
    { title: "Calculus on Computational Graphs", url: "https://colah.github.io/posts/2015-08-Backprop/", type: "blog" },
  ],
  3: [
    { title: "Jay Alammar — The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", type: "blog" },
    { title: "3Blue1Brown — Attention in Transformers", url: "https://www.youtube.com/watch?v=eMlx5fFNoYc", type: "video" },
    { title: "Attention Is All You Need (orijinal paper)", url: "https://arxiv.org/abs/1706.03762", type: "paper" },
  ],
  4: [
    { title: "RMSNorm Paper", url: "https://arxiv.org/abs/1910.07467", type: "paper" },
    { title: "Deep Residual Learning (ResNet paper)", url: "https://arxiv.org/abs/1512.03385", type: "paper" },
  ],
  5: [
    { title: "Karpathy — A Recipe for Training NNs", url: "https://karpathy.github.io/2019/04/25/recipe/", type: "blog" },
    { title: "Adam Paper", url: "https://arxiv.org/abs/1412.6980", type: "paper" },
  ],
  6: [
    { title: "HuggingFace — Text Generation Strategies", url: "https://huggingface.co/blog/how-to-generate", type: "blog" },
    { title: "The Illustrated GPT-2", url: "https://jalammar.github.io/illustrated-gpt2/", type: "blog" },
  ]
};

// ─── NEW UI COMPONENTS ──────────────────────────────────────────

const QuizWidget = ({ questions, weekColor }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = questions[current];

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.ans) setScore(s => s + 1);
  };
  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(-1);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };
  const handleReset = () => { setCurrent(0); setSelected(-1); setShowResult(false); setScore(0); setFinished(false); };

  if (finished) return (
    <div style={{ margin: "18px 0", padding: 24, borderRadius: 16, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", textAlign: "center" }}>
      <div style={{ fontSize: 38, marginBottom: 8 }}>🎉</div>
      <div style={{ fontSize: 21, fontWeight: 800, color: "#10B981", marginBottom: 4 }}>{score}/{questions.length} Doğru!</div>
      <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 12 }}>
        {score === questions.length ? "Mükemmel! Tam puan!" : score >= questions.length * 0.7 ? "Harika! İyi anlamışsın." : "Tekrar gözden geçirmeni öneririm."}
      </div>
      <button onClick={handleReset} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: weekColor, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Tekrar Dene</button>
    </div>
  );

  return (
    <div style={{ margin: "18px 0", padding: 20, borderRadius: 16, background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.15)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 19 }}>🧪</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: ".06em" }}>Mini Quiz</span>
        </div>
        <span style={{ fontSize: 13, color: "#64748B" }}>{current + 1}/{questions.length} • Skor: {score}</span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, color: "#E2E8F0", marginBottom: 14, lineHeight: 1.6 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        {q.opts.map((opt, i) => {
          const isCorrect = i === q.ans;
          const isSelected = i === selected;
          let bg = "rgba(255,255,255,0.03)";
          let border = "1px solid rgba(255,255,255,0.06)";
          let color = "#CBD5E1";
          if (showResult && isCorrect) { bg = "rgba(16,185,129,0.15)"; border = "1px solid rgba(16,185,129,0.4)"; color = "#10B981"; }
          if (showResult && isSelected && !isCorrect) { bg = "rgba(239,68,68,0.1)"; border = "1px solid rgba(239,68,68,0.3)"; color = "#EF4444"; }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              padding: "10px 14px", borderRadius: 10, border, background: bg, color, fontSize: 15,
              textAlign: "left", cursor: showResult ? "default" : "pointer", fontFamily: "inherit", transition: "all .2s",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: showResult && isCorrect ? "#10B981" : showResult && isSelected ? "#EF4444" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: showResult ? "#fff" : "#64748B", flexShrink: 0 }}>
                {showResult && isCorrect ? "✓" : showResult && isSelected ? "✗" : String.fromCharCode(65 + i)}
              </div>
              {opt}
            </button>
          );
        })}
      </div>
      {showResult && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: selected === q.ans ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.06)", marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: selected === q.ans ? "#10B981" : "#EF4444", marginBottom: 4 }}>{selected === q.ans ? "✓ Doğru!" : "✗ Yanlış"}</div>
          <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.5 }}>{q.explain}</div>
        </div>
      )}
      {showResult && (
        <button onClick={handleNext} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: weekColor, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {current < questions.length - 1 ? (lang === "tr" ? "Sonraki Soru →" : "Next Question →") : (lang === "tr" ? "Sonuçları Gör" : "See Results")}
        </button>
      )}
    </div>
  );
};

const MistakesList = ({ mistakes, weekColor }) => (
  <div style={{ margin: "18px 0", padding: 18, borderRadius: 14, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 19 }}>⚠️</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", letterSpacing: ".06em" }}>Yaygın Yanlışlar</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {mistakes.map((m, i) => (
        <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(0,0,0,0.15)" }}>
          <div style={{ fontSize: 15, color: "#EF4444", fontWeight: 600, marginBottom: 4, textDecoration: "line-through", textDecorationColor: "rgba(239,68,68,0.4)" }}>{m.mistake}</div>
          <div style={{ fontSize: 15, color: "#10B981", lineHeight: 1.5 }}>✓ {m.truth}</div>
        </div>
      ))}
    </div>
  </div>
);

const ComparisonTableWidget = ({ data }) => (
  <div style={{ margin: "14px 0", padding: 16, borderRadius: 14, background: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.12)", overflowX: "auto" }}>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#0EA5E9", marginBottom: 10 }}>📊 {tx(data.title, lang)}</div>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr>{data.headers.map((h, i) => (
          <th key={i} style={{ padding: "6px 10px", textAlign: i === 0 ? "left" : "center", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13, whiteSpace: "nowrap" }}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {data.rows.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => (
              <td key={c} style={{ padding: "6px 10px", textAlign: c === 0 ? "left" : "center", color: c === 0 ? "#94A3B8" : "#E2E8F0", fontFamily: c > 0 ? "'Fira Code', monospace" : "inherit", borderBottom: "1px solid rgba(255,255,255,0.03)", fontWeight: c === 0 ? 600 : 400, fontSize: 13 }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {data.note && <div style={{ marginTop: 8, fontSize: 13, color: "#64748B", fontStyle: "italic" }}>{tx(data.note, lang)}</div>}
  </div>
);

const ResourceLinks = ({ resources }) => {
  const typeIcons = { video: "🎬", blog: "📝", kod: "💻", docs: "📖", paper: "📄" };
  const typeColors = { video: "#EF4444", blog: "#0EA5E9", kod: "#10B981", docs: "#8B5CF6", paper: "#F59E0B" };
  return (
    <div style={{ margin: "14px 0", padding: 16, borderRadius: 14, background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 17 }}>🔗</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: ".06em" }}>Daha Fazla Öğren</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {resources.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.15)", textDecoration: "none", transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}>
            <span style={{ fontSize: 17 }}>{typeIcons[r.type]}</span>
            <span style={{ fontSize: 14, color: "#E2E8F0", fontWeight: 500, flex: 1 }}>{r.title}</span>
            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: `${typeColors[r.type]}15`, color: typeColors[r.type], fontWeight: 600, textTransform: "uppercase" }}>{r.type}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

const GlossaryPanel = ({ searchTerm, setSearchTerm, onClose }) => {
  const filtered = GLOSSARY.filter(g =>
    g.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx(g.def, lang).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const catColors = { temel: "#F59E0B", mimari: "#10B981", eğitim: "#EF4444", model: "#0EA5E9", veri: "#8B5CF6" };
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 380, height: "100vh", background: "#0D1117", borderLeft: "1px solid rgba(255,255,255,0.08)", zIndex: 100, display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,0.4)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 21 }}>📖</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#E2E8F0" }}>{lang==="tr"?"Kavram Sözlüğü":"Concept Glossary"}</span>
          <span style={{ fontSize: 13, color: "#64748B" }}>{lang==="tr"?`(${GLOSSARY.length} terim)`:`(${GLOSSARY.length} terms)`}</span>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.06)", color: "#94A3B8", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ padding: "10px 20px" }}>
        <input
          type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          placeholder=lang === "tr" ? "Kavram ara... (ör: embedding, gradient)" : "Search concepts... (e.g. embedding, gradient)"
          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "#E2E8F0", fontSize: 15, outline: "none", fontFamily: "inherit" }}
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        {filtered.length === 0 && <div style={{ textAlign: "center", color: "#475569", fontSize: 15, marginTop: 30 }}>{lang==="tr"?"Sonuç bulunamadı.":"No results found."}</div>}
        {filtered.map((g, i) => (
          <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0" }}>{g.term}</span>
              <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: `${catColors[g.cat]}15`, color: catColors[g.cat], fontWeight: 600, textTransform: "uppercase" }}>{g.cat}</span>
              <span style={{ fontSize: 11, color: "#475569" }}>{lang==="tr"?"Hafta":"Week"} {g.week}</span>
            </div>
            <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.5 }}>{tx(g.def, lang)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgressSidebar = ({ weekIdx, completedSections }) => {
  return WEEKS.map((w, wi) => {
    const total = w.sections.length;
    const done = (completedSections[wi] || []).length;
    const pct = total > 0 ? (done / total) * 100 : 0;
    return (
      <div key={wi} style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: w.color, borderRadius: 2, transition: "width .5s" }} />
      </div>
    );
  });
};

// ─── NEW ANIMATED VIZ COMPONENTS FOR WEEK 0 ─────────────────────

const TrainingEvolutionViz = () => {
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

// ─── RICH INTERACTIVE VIZ: TOKENIZER PLAYGROUND ──────────────────
const TokenizerPlaygroundViz = () => {
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
        <div style={{fontSize: 12,color:"#64748B",marginBottom:4}}>{lang === "tr" ? "Head seçin — her head farklı kalıp öğrenir:</div>
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

// ─── WEEK 7 VIZ: SCALING LAWS ────────────────────────────────────
const ScalingLawsViz = () => {
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



// ═══ TRANSFORMER PAPER — RICH INTERACTIVE COMPONENTS (from transformer_explorer.jsx) ═══

// TE UI Primitives
const TEBox = ({ children, style }) => (
  <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 16, padding: 20, marginBottom: 16, ...style }}>{children}</div>
);
const TELabel = ({ color, children }) => (
  <div style={{ fontSize: 13, color, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>{children}</div>
);
const TEInfoBox = ({ color, icon, title, children }) => (
  <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 12 }}>
    <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{icon}</span>
    <div><div style={{ fontSize: 15, fontWeight: 700, color, marginBottom: 4 }}>{title}</div><div style={{ fontSize: 14, lineHeight: 1.7, color: "#CBD5E1" }}>{children}</div></div>
  </div>
);
const TEAnalojiBox = ({ emoji, title, children }) => (
  <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.08))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#A78BFA", marginBottom: 6 }}>{emoji} {title}</div>
    <div style={{ fontSize: 14, lineHeight: 1.7, color: "#CBD5E1" }}>{children}</div>
  </div>
);
const TESlider = ({ label, value, onChange, min, max, step, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
    <span style={{ fontSize: 13, color: "#94A3B8", minWidth: 55, whiteSpace: "nowrap" }}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} style={{ flex: 1 }} />
    <span style={{ fontSize: 15, fontWeight: 800, color, minWidth: 44, textAlign: "right", fontFamily: "'Fira Code', monospace" }}>
      {typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
    </span>
  </div>
);
const TENum = ({ v, color = "#E2E8F0", size = 16 }) => (
  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: size, fontWeight: 700, color }}>
    {typeof v === "number" ? (Math.abs(v) < 0.005 ? "0.00" : v.toFixed(2)) : v}
  </span>
);
const TEStepBadge = ({ n, active, color, onClick }) => (
  <button onClick={onClick} style={{
    width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 800, border: active ? `2px solid ${color}` : "2px solid rgba(255,255,255,0.06)",
    background: active ? `${color}20` : "transparent", color: active ? color : "#475569",
    cursor: "pointer", transition: "all .2s", fontFamily: "inherit"
  }}>{n}</button>
);

// ═══ STEP-BY-STEP SOFTMAX (Rich) ═══
const TESoftmax = () => {
  const [vals, setVals] = useState([2.0, 1.0, 0.5, -1.0]);
  const [step, setStep] = useState(0);
  const labels = [lang === "tr" ? "kedi" : "cat", lang === "tr" ? "köpek" : "dog", "kuş", "balık"];
  const emojis = ["🐱", "🐕", "🐦", "🐟"];
  const colors = ["#0EA5E9", "#10B981", "#F59E0B", "#EC4899"];

  const maxV = Math.max(...vals);
  const shifted = vals.map(v => v - maxV);
  const exps = shifted.map(v => Math.exp(v));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map(v => v / sumExp);

  const stepsData = [
    { title: "Ham Skorlar (Logits)", desc: "Model her kelime için bir skor üretir. Yüksek skor = model o kelimeden daha emin.", color: "#0EA5E9" },
    { title: "Güvenlik: max çıkar", desc: `En büyük değer: ${maxV.toFixed(1)}. Tüm değerlerden bunu çıkarıyoruz. Bu sayılar çok büyürse e^x PATLAYACAKTI! Bu trick bunu önler. Sonuç değişmez!`, color: "#8B5CF6" },
    { title: "e üzeri x (üstel)", desc: "Her değerin e^x'ini alıyoruz. Bu negatif sayıları pozitife çevirir ve büyük farkları DAHA büyük farklara dönüştürür.", color: "#F59E0B" },
    { title: "Toplam hesapla", desc: `Tüm e^x değerlerini topluyoruz: ${sumExp.toFixed(3)}. Bu bölen olacak. Böylece sonuçlar 0-1 arasına sıkışacak.`, color: "#EF4444" },
    { title: "Böl → Olasılık!", desc: "Her e^x değerini toplama bölüyoruz. Sonuç: 0-1 arası olasılıklar ve toplamları tam 1!", color: "#10B981" },
  ];

  return (
    <TEBox>
      <TELabel color="#8B5CF6">{"🧮 İnteraktif Softmax — Adım Adım Hesaplama"}</TELabel>

      <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>{"⬇️ Kaydırıcıları hareket ettir — tüm hesaplama canlı güncellenir!"}</div>
        {vals.map((v, i) => (
          <TESlider key={i} label={`${emojis[i]} ${labels[i]}:`} value={v} min={-3} max={5} step={0.1} color={colors[i]}
            onChange={nv => { const nvals = [...vals]; nvals[i] = nv; setVals(nvals); }} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, justifyContent: "center" }}>
        {stepsData.map((s, i) => (
          <TEStepBadge key={i} n={i + 1} active={step === i} color={s.color} onClick={() => setStep(i)} />
        ))}
      </div>

      <div style={{ padding: "14px 18px", borderRadius: 12, background: `${stepsData[step].color}0A`, border: `1px solid ${stepsData[step].color}25`, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: stepsData[step].color, marginBottom: 4 }}>
          Adım {step + 1}: {stepsData[step].title}
        </div>
        <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7 }}>{stepsData[step].desc}</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Kelime</th>
              <th style={{ padding: "8px 10px", textAlign: "center", color: step >= 0 ? "#0EA5E9" : "#1E293B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "color .3s" }}>{"① Skor"}</th>
              <th style={{ padding: "8px 10px", textAlign: "center", color: step >= 1 ? "#8B5CF6" : "#1E293B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "color .3s" }}>{"② -max"}</th>
              <th style={{ padding: "8px 10px", textAlign: "center", color: step >= 2 ? "#F59E0B" : "#1E293B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "color .3s" }}>{"③ e^x"}</th>
              <th style={{ padding: "8px 10px", textAlign: "center", color: step >= 3 ? "#EF4444" : "#1E293B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "color .3s" }}>{"④ /toplam"}</th>
              <th style={{ padding: "8px 10px", textAlign: "center", color: step >= 4 ? "#10B981" : "#1E293B", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "color .3s" }}>{"⑤ Olasılık"}</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((l, i) => (
              <tr key={i} style={{ background: step >= 4 && probs[i] === Math.max(...probs) ? "rgba(16,185,129,0.06)" : "transparent" }}>
                <td style={{ padding: "10px", fontWeight: 700, color: colors[i], borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {emojis[i]} {l}
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: step >= 0 ? 1 : 0.12, transition: "opacity .4s" }}>
                  <TENum v={vals[i]} color="#0EA5E9" />
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: step >= 1 ? 1 : 0.12, transition: "opacity .4s" }}>
                  <TENum v={shifted[i]} color="#8B5CF6" />
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: step >= 2 ? 1 : 0.12, transition: "opacity .4s" }}>
                  <TENum v={exps[i]} color="#F59E0B" />
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: step >= 3 ? 1 : 0.12, transition: "opacity .4s" }}>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#EF4444" }}>/{sumExp.toFixed(2)}</span>
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: step >= 4 ? 1 : 0.12, transition: "opacity .4s" }}>
                  <TENum v={probs[i]} color="#10B981" />
                  <span style={{ fontSize: 11, color: "#64748B", marginLeft: 4 }}>({(probs[i] * 100).toFixed(1)}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {step >= 4 && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", justifyContent: "center", height: 110, marginTop: 16, padding: "0 20px" }}>
          {labels.map((l, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>{(probs[i] * 100).toFixed(1)}%</div>
              <div style={{
                width: "100%", maxWidth: 60, height: Math.max(4, probs[i] * 90), borderRadius: 8,
                background: `linear-gradient(180deg, ${colors[i]}, ${colors[i]}80)`,
                transition: "height 0.5s cubic-bezier(.4,0,.2,1)"
              }} />
              <div style={{ fontSize: 12, color: "#94A3B8" }}>{emojis[i]} {l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>{"Formül"}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#E2E8F0", fontFamily: "'Georgia', serif" }}>
          {"softmax(x"}<sub>{"i"}</sub>{") = e"}<sup>{"(x"}<sub>{"i"}</sub>{" - max)"}</sup>{" / Σ e"}<sup>{"(x"}<sub>{"j"}</sub>{" - max)"}</sup>
        </div>
      </div>
    </TEBox>
  );
};

// ═══ DOT PRODUCT with sliders (Rich — 4D) ═══
const TEDotProduct = () => {
  const [q, setQ] = useState([0.5, 0.8, -0.3, 0.6]);
  const [k, setK] = useState([0.7, 0.5, 0.2, -0.4]);
  const colors = ["#0EA5E9", "#10B981", "#F59E0B", "#EC4899"];

  const products = q.map((v, i) => v * k[i]);
  const result = products.reduce((a, b) => a + b, 0);

  return (
    <TEBox>
      <TELabel color="#0EA5E9">{"🎮 İnteraktif Dot Product (Nokta Çarpımı)"}</TELabel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ padding: 14, borderRadius: 12, background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0EA5E9", marginBottom: 8 }}>{"🔍 Query (Q) — Ne arıyorum?"}</div>
          {q.map((v, i) => (
            <TESlider key={i} label={`q${i}:`} value={v} min={-2} max={2} step={0.1} color="#0EA5E9"
              onChange={nv => { const nq = [...q]; nq[i] = nv; setQ(nq); }} />
          ))}
        </div>
        <div style={{ padding: 14, borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981", marginBottom: 8 }}>{"🗝️ Key (K) — Bende ne var?"}</div>
          {k.map((v, i) => (
            <TESlider key={i} label={`k${i}:`} value={v} min={-2} max={2} step={0.1} color="#10B981"
              onChange={nv => { const nk = [...k]; nk[i] = nv; setK(nk); }} />
          ))}
        </div>
      </div>

      <div style={{ padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>{"Hesaplama: her elemanı çarp, sonra topla"}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", alignItems: "center" }}>
          {q.map((v, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ fontSize: 18, color: "#475569", fontWeight: 800 }}>+</span>}
              <div style={{ padding: "8px 12px", borderRadius: 10, background: `${colors[i]}10`, border: `1px solid ${colors[i]}25`, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <TENum v={v} color="#0EA5E9" size={14} />
                  <span style={{ color: "#475569", fontSize: 12 }}>{"×"}</span>
                  <TENum v={k[i]} color="#10B981" size={14} />
                </div>
                <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{"= "}<TENum v={products[i]} color={colors[i]} size={12} /></div>
              </div>
            </React.Fragment>
          ))}
          <span style={{ fontSize: 22, color: "#475569", fontWeight: 800, margin: "0 6px" }}>=</span>
          <div style={{
            padding: "12px 20px", borderRadius: 12, textAlign: "center",
            background: result > 0 ? "rgba(16,185,129,0.12)" : result < 0 ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.05)",
            border: `2px solid ${result > 0 ? "#10B981" : result < 0 ? "#EF4444" : "#475569"}40`,
            transition: "all .3s"
          }}>
            <TENum v={result} color={result > 0 ? "#10B981" : result < 0 ? "#EF4444" : "#94A3B8"} size={24} />
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              {result > 1 ? "🔥 Çok benzer!" : result > 0.3 ? "👍 Benzer" : result > -0.3 ? "😐 Nötr" : "👎 Farklı"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {[
          { range: [-4, -0.5], label: "Zıt yön", emoji: "🔴", desc: "Dikkat ETME" },
          { range: [-0.5, 0.5], label: "Nötr", emoji: "⚪", desc: "İlgisiz" },
          { range: [0.5, 4], label: "Aynı yön", emoji: "🟢", desc: "DİKKAT ET!" },
        ].map((r, i) => (
          <div key={i} style={{
            flex: 1, padding: "10px 8px", borderRadius: 10, textAlign: "center",
            background: result >= r.range[0] && result < r.range[1] ? "rgba(255,255,255,0.06)" : "transparent",
            border: result >= r.range[0] && result < r.range[1] ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
            transition: "all .3s"
          }}>
            <div style={{ fontSize: 20 }}>{r.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1" }}>{r.label}</div>
            <div style={{ fontSize: 10, color: "#64748B" }}>{r.desc}</div>
          </div>
        ))}
      </div>
    </TEBox>
  );
};

// ═══ FULL ATTENTION PIPELINE (New — didn't exist before) ═══
const TEScaledAttentionPipeline = () => {
  const [step, setStep] = useState(0);
  const [dk, setDk] = useState(64);

  const rawScores = [1.2, 3.8, 0.5];
  const tokens = ["Ben", "okula", "gittim"];
  const sqrtDk = Math.sqrt(dk);
  const scaled = rawScores.map(s => s / sqrtDk);
  const probs = softmaxArr(scaled);
  const values = [[0.3, 0.7], [0.9, 0.1], [0.5, 0.5]];
  const output = values[0].map((_, d) => probs.reduce((s, p, t) => s + p * values[t][d], 0));

  const stepsInfo = [
    { title: "Q·K Çarpımı", color: "#0EA5E9", desc: `"Ben" kelimesinin Query'si ile her kelimenin Key'i çarpılır.` },
    { title: "÷ √d Scaling", color: "#8B5CF6", desc: `d_k = ${dk} → √${dk} = ${sqrtDk.toFixed(1)}. Büyük boyutlarda dot product çok büyük olur → softmax patlar!` },
    { title: "Softmax", color: "#10B981", desc: "Skorlar 0-1 arası olasılığa dönüşür. Toplam = 1." },
    { title: "× Value", color: "#EC4899", desc: "Her kelimenin Value vektörü, kendi olasılığı ile çarpılıp toplanır." },
  ];

  return (
    <TEBox>
      <TELabel color="#EC4899">{"🔬 Tam Attention Pipeline — Adım adım hesapla"}</TELabel>

      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
        {stepsInfo.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "12px 8px", border: "none", cursor: "pointer",
            background: step === i ? `${s.color}12` : "transparent",
            borderBottom: step === i ? `3px solid ${s.color}` : "3px solid transparent",
            color: step === i ? s.color : "#475569", fontSize: 12, fontWeight: 700,
            transition: "all .2s", fontFamily: "inherit"
          }}>
            {s.title}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 18px", borderRadius: 14, background: `${stepsInfo[step].color}06`, border: `1px solid ${stepsInfo[step].color}20`, marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: stepsInfo[step].color, marginBottom: 6 }}>
          {"Adım "}{step + 1}{": "}{stepsInfo[step].title}
        </div>
        <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7, marginBottom: 14 }}>{stepsInfo[step].desc}</div>

        {step === 0 && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {tokens.map((t, i) => (
              <div key={i} style={{ padding: "14px 18px", borderRadius: 12, background: `rgba(14,165,233,${0.05 + rawScores[i] / 5 * 0.15})`, border: "1px solid rgba(14,165,233,0.2)", textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>{"Q·K(\""}{t}{"\")"}</div>
                <TENum v={rawScores[i]} color="#0EA5E9" size={24} />
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div>
            <TESlider label="d_k:" value={dk} min={4} max={512} step={4} color="#8B5CF6" onChange={setDk} />
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
              {tokens.map((t, i) => (
                <div key={i} style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", textAlign: "center", minWidth: 130 }}>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>{rawScores[i].toFixed(1)}{" ÷ "}{sqrtDk.toFixed(1)}</div>
                  <TENum v={scaled[i]} color="#8B5CF6" size={22} />
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{t}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(139,92,246,0.06)", fontSize: 13, color: "#A78BFA", textAlign: "center" }}>
              {"💡 d_k kaydırıcıyı değiştir — büyük d_k → daha küçük skorlar → softmax daha düzgün dağılır"}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", justifyContent: "center", height: 140 }}>
            {tokens.map((t, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 80 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>{(probs[i] * 100).toFixed(1)}%</div>
                <div style={{
                  width: 60, height: Math.max(6, probs[i] * 120), borderRadius: 8,
                  background: "linear-gradient(180deg, #10B981, #059669)",
                  transition: "height .5s ease"
                }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{t}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{"skor: "}{scaled[i].toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
              {tokens.map((t, i) => (
                <div key={i} style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.2)",
                  textAlign: "center", opacity: 0.4 + probs[i] * 1.5
                }}>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>{(probs[i] * 100).toFixed(0)}{"% × V(\""}{t}{"\")"}</div>
                  <div style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", color: "#EC4899", marginTop: 4 }}>
                    {probs[i].toFixed(2)}{" × ["}{values[i].join(", ")}{"]"}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", padding: "14px 18px", borderRadius: 12, background: "rgba(236,72,153,0.1)", border: "2px solid rgba(236,72,153,0.3)" }}>
              <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>{"Sonuç vektör:"}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#EC4899", fontFamily: "'Fira Code', monospace" }}>
                [{output.map(v => v.toFixed(3)).join(", ")}]
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "10px 14px", borderRadius: 10, background: "rgba(0,0,0,0.2)", fontSize: 16, fontWeight: 700, color: "#94A3B8", fontFamily: "'Georgia', serif" }}>
        {"Attention(Q,K,V) = "}<span style={{ color: "#10B981" }}>softmax</span>{"("}<span style={{ color: "#0EA5E9" }}>{"Q·K"}<sup>T</sup></span>{" / "}<span style={{ color: "#8B5CF6" }}>{"√d"}<sub>k</sub></span>{") · "}<span style={{ color: "#EC4899" }}>V</span>
      </div>
    </TEBox>
  );
};

// ═══ MULTI-HEAD ATTENTION (Rich — 8 heads) ═══
const TEMultiHead = () => {
  const [activeHead, setActiveHead] = useState(0);
  const [showMerge, setShowMerge] = useState(false);
  const headColors = ["#0EA5E9", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#EF4444", "#14B8A6", "#6366F1"];
  const headJobs = [
    { name: "Özne-fiil ilişkisi", emoji: "👤", example: "'Kedi' → 'kovaladı'ya dikkat" },
    { name: "Sıfat-isim bağı", emoji: "🎨", example: "'Büyük' → 'ev'e dikkat" },
    { name: "Zaman ifadeleri", emoji: "⏰", example: "'Yarın' → 'gidecek'e dikkat" },
    { name: "Yakınlık ilişkisi", emoji: "📏", example: "Yan yana kelimelere dikkat" },
    { name: "Zamir çözümleme", emoji: "🔗", example: "'O' → 'Ali'ye dikkat" },
    { name: "Cümle yapısı", emoji: "🏗️", example: "Noktalama ve bağlaç dikkat" },
    { name: "Edat bağlantıları", emoji: "📎", example: "'ile' → bağladığı kelimelere" },
    { name: lang === "tr" ? "Genel bağlam" : "General context", emoji: "🌐", example: "Uzak mesafe bağımlılıklar" },
  ];

  return (
    <TEBox>
      <TELabel color="#EC4899">{"🧩 Multi-Head Attention — 8 Paralel Dikkat"}</TELabel>

      <div style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8, textAlign: "center" }}>{"512 boyutlu vektör → 8 head × 64 boyut"}</div>
        <div style={{ display: "flex", gap: 2, borderRadius: 8, overflow: "hidden" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <button key={i} onClick={() => { setActiveHead(i); setShowMerge(false); }} style={{
              flex: 1, height: 40, border: "none", cursor: "pointer",
              background: activeHead === i ? headColors[i] : `${headColors[i]}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: activeHead === i ? "#fff" : headColors[i],
              transition: "all .2s", fontFamily: "inherit"
            }}>
              H{i + 1}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: "#475569" }}>
          <span>[0]</span><span>[63]</span><span>[127]</span><span>[191]</span><span>[255]</span><span>[319]</span><span>[383]</span><span>[447]</span><span>[511]</span>
        </div>
      </div>

      <div style={{ padding: 18, borderRadius: 14, marginBottom: 14, background: `${headColors[activeHead]}0A`, border: `1px solid ${headColors[activeHead]}25`, transition: "all .3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: headColors[activeHead], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            {headJobs[activeHead].emoji}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: headColors[activeHead] }}>{"Head "}{activeHead + 1}{": "}{headJobs[activeHead].name}</div>
            <div style={{ fontSize: 13, color: "#94A3B8" }}>{"Boyut dilimi: ["}{activeHead * 64}{":"}{(activeHead + 1) * 64}{"]"}</div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7 }}>{"Örnek: "}{headJobs[activeHead].example}</div>
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.2)", fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#94A3B8" }}>
          {"q_h = Q["}{activeHead * 64}{":"}{(activeHead + 1) * 64}{"] → 64 boyut"}<br />
          {"k_h = K["}{activeHead * 64}{":"}{(activeHead + 1) * 64}{"] → 64 boyut"}<br />
          {"head"}{activeHead + 1}{" = Attention(q_h, k_h, v_h)"}
        </div>
      </div>

      <button onClick={() => setShowMerge(!showMerge)} style={{
        width: "100%", padding: "12px 20px", borderRadius: 12, border: showMerge ? "none" : "1px solid rgba(255,255,255,0.08)",
        background: showMerge ? "linear-gradient(135deg, #EC4899, #8B5CF6)" : "rgba(255,255,255,0.04)",
        color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .3s"
      }}>
        {showMerge ? "✅ Birleştirme (Concat + W_O)" : "🔀 Birleştirme adımını göster →"}
      </button>
      {showMerge && (
        <div style={{ marginTop: 12, padding: 16, borderRadius: 14, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#A78BFA", marginBottom: 8 }}>{"8 head birleştirilir (concat) ve W_O matrisi ile projekte edilir:"}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0", fontFamily: "'Georgia', serif" }}>
            {"MultiHead = Concat(H"}<sub>1</sub>{",...,H"}<sub>8</sub>{") · W"}<sup>O</sup>
          </div>
          <div style={{ display: "flex", gap: 2, marginTop: 12, borderRadius: 8, overflow: "hidden" }}>
            {headColors.map((c, i) => (
              <div key={i} style={{ flex: 1, height: 24, background: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 800 }}>64</div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{"8 × 64 = 512 → W_O [512×512] → 512 boyut"}</div>
        </div>
      )}
    </TEBox>
  );
};

// ═══ POSITIONAL ENCODING WAVES (Rich — with heatmap) ═══
const TEPosEncoding = () => {
  const [pos, setPos] = useState(3);
  const [dim, setDim] = useState(0);
  const totalDims = 8;
  const maxPos = 20;

  const getVal = (p, d) => {
    const i = Math.floor(d / 2);
    const angle = p / Math.pow(10000, (2 * i) / 512);
    return d % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
  };

  const heatmap = useMemo(() => {
    return Array.from({ length: maxPos }, (_, p) =>
      Array.from({ length: totalDims }, (_, d) => getVal(p, d))
    );
  }, []);

  return (
    <TEBox>
      <TELabel color="#14B8A6">{"🌊 Positional Encoding — İnteraktif Dalga"}</TELabel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <TESlider label="Pozisyon:" value={pos} min={0} max={maxPos - 1} step={1} color="#14B8A6" onChange={setPos} />
        <TESlider label="Boyut:" value={dim} min={0} max={totalDims - 1} step={1} color="#EC4899" onChange={setDim} />
      </div>

      <div style={{ textAlign: "center", marginBottom: 16, padding: "14px 18px", borderRadius: 12, background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)" }}>
        <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>
          {"PE(pos="}{pos}{", dim="}{dim}{") = "}{dim % 2 === 0 ? "sin" : "cos"}{"("}{pos}{" / 10000^("}{2 * Math.floor(dim / 2)}{"/512))"}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#14B8A6", fontFamily: "'Fira Code', monospace" }}>
          {getVal(pos, dim).toFixed(4)}
        </div>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>{"Isı haritası: satır=pozisyon, sütun=boyut (seçili hücreye tıkla)"}</div>
        <div style={{ display: "flex", gap: 1, marginLeft: 30, marginBottom: 2 }}>
          {Array.from({ length: totalDims }, (_, d) => (
            <div key={d} style={{ width: 40, textAlign: "center", fontSize: 9, color: dim === d ? "#EC4899" : "#475569", fontWeight: dim === d ? 800 : 400 }}>d{d}</div>
          ))}
        </div>
        {Array.from({ length: Math.min(maxPos, 14) }, (_, p) => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 1 }}>
            <div style={{ width: 28, textAlign: "right", fontSize: 10, color: pos === p ? "#14B8A6" : "#475569", fontWeight: pos === p ? 800 : 400, paddingRight: 4 }}>{p}</div>
            {Array.from({ length: totalDims }, (_, d) => {
              const val = heatmap[p][d];
              const isSelected = p === pos && d === dim;
              const hue = val > 0 ? 160 : 0;
              const intensity = Math.abs(val);
              return (
                <div key={d} onClick={() => { setPos(p); setDim(d); }} style={{
                  width: 40, height: 24, borderRadius: 3, cursor: "pointer",
                  background: `hsla(${hue}, 70%, 45%, ${0.15 + intensity * 0.65})`,
                  border: isSelected ? "2px solid #fff" : "1px solid rgba(255,255,255,0.03)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: isSelected ? "#fff" : "transparent", fontWeight: 700,
                  transition: "all .15s"
                }}>
                  {isSelected ? val.toFixed(2) : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: 14, borderRadius: 12, background: "rgba(0,0,0,0.2)", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 8 }}>{"Boyut "}{dim}{" için dalga (seçili pozisyon: "}{pos}{")"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 1, height: 50 }}>
          {Array.from({ length: maxPos }, (_, p) => {
            const val = heatmap[p][dim];
            const h = Math.abs(val) * 22;
            return (
              <div key={p} onClick={() => setPos(p)} style={{
                flex: 1, height: 50, cursor: "pointer", position: "relative"
              }}>
                <div style={{
                  width: "100%", height: h, borderRadius: 2,
                  background: p === pos ? "#14B8A6" : val > 0 ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)",
                  position: "absolute", top: val > 0 ? 25 - h : 25,
                  transition: "all .15s"
                }} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#64748B", textAlign: "center" }}>
        {"🟢 pozitif | 🔴 negatif — düşük boyutlar hızlı, yüksek boyutlar yavaş değişir"}
      </div>
    </TEBox>
  );
};

// ═══ ATTENTION WORD INTERACTION (Rich — 6 words) ═══
const TEAttentionDemo = () => {
  const [selected, setSelected] = useState(0);
  const words = ["Kedi", "süt", "içti", "çünkü", "o", "açıkmıştı"];
  const weights = [
    [0.40, 0.15, 0.10, 0.05, 0.05, 0.25],
    [0.20, 0.35, 0.10, 0.05, 0.10, 0.20],
    [0.30, 0.25, 0.20, 0.05, 0.05, 0.15],
    [0.10, 0.05, 0.15, 0.40, 0.10, 0.20],
    [0.50, 0.05, 0.05, 0.10, 0.15, 0.15],
    [0.35, 0.10, 0.15, 0.10, 0.10, 0.20],
  ];
  const colors = ["#0EA5E9", "#10B981", "#F59E0B", "#94A3B8", "#EC4899", "#8B5CF6"];

  return (
    <TEBox>
      <TELabel color="#10B981">{"🎮 Kelimeye tıkla — hangi kelimelere dikkat ettiğini gör!"}</TELabel>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
        {words.map((w, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            padding: "10px 16px", borderRadius: 10,
            border: selected === i ? `2px solid ${colors[i]}` : "2px solid rgba(255,255,255,0.08)",
            background: selected === i ? `${colors[i]}15` : "rgba(255,255,255,0.02)",
            color: selected === i ? colors[i] : "#CBD5E1",
            fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all .2s",
            transform: selected === i ? "scale(1.1)" : "scale(1)", fontFamily: "inherit"
          }}>
            {w}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: "center", height: 130 }}>
        {words.map((w, i) => {
          const weight = weights[selected][i];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>{(weight * 100).toFixed(0)}%</div>
              <div style={{
                width: "80%", maxWidth: 50, height: Math.max(6, weight * 110), borderRadius: 8,
                background: i === selected ? `linear-gradient(180deg, ${colors[i]}, ${colors[i]}80)` : "linear-gradient(180deg, rgba(148,163,184,0.6), rgba(148,163,184,0.3))",
                transition: "height .5s ease"
              }} />
              <div style={{ fontSize: 12, fontWeight: i === selected ? 800 : 500, color: i === selected ? colors[i] : "#94A3B8" }}>{w}</div>
            </div>
          );
        })}
      </div>
      {selected === 4 && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 10, background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.15)", fontSize: 13, color: "#F472B6", textAlign: "center" }}>
          {"💡 \"o\" kelimesi \"Kedi\"ye %50 dikkat ediyor — zamir çözümleme! Bu, makalenin Figure 4'ündeki davranışla aynı."}
        </div>
      )}
    </TEBox>
  );
};

// ═══ CAUSAL MASK (Rich — with hover) ═══
const TECausalMask = () => {
  const tokens = ["Ben", "okula", "bugün", "gittim", "."];
  const [hoverCell, setHoverCell] = useState(null);

  return (
    <TEBox>
      <TELabel color="#F59E0B">{"🎭 Causal Mask — Hücrelere tıkla!"}</TELabel>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <div style={{ display: "flex", marginLeft: 70 }}>
            {tokens.map((t, i) => (
              <div key={i} style={{ width: 58, textAlign: "center", fontSize: 12, color: "#64748B", fontWeight: 600, padding: "4px 0" }}>{t}</div>
            ))}
          </div>
          {tokens.map((t, row) => (
            <div key={row} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 68, textAlign: "right", paddingRight: 6, fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>{t}</div>
              {tokens.map((_, col) => {
                const allowed = col <= row;
                const isHover = hoverCell && hoverCell[0] === row && hoverCell[1] === col;
                return (
                  <div key={col}
                    onMouseEnter={() => setHoverCell([row, col])}
                    onMouseLeave={() => setHoverCell(null)}
                    style={{
                      width: 54, height: 42, margin: 2, borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: allowed
                        ? isHover ? "rgba(16,185,129,0.35)" : "rgba(16,185,129,0.12)"
                        : isHover ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.06)",
                      border: `1px solid ${allowed ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.12)"}`,
                      cursor: "pointer", transition: "all .15s", fontSize: 18
                    }}>
                    {allowed ? "✓" : "✗"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {hoverCell && (
        <div style={{ textAlign: "center", marginTop: 12, padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", fontSize: 13, color: "#CBD5E1" }}>
          {"\""}{tokens[hoverCell[0]]}{"\" → \""}{tokens[hoverCell[1]]}{"\" : "}
          {hoverCell[1] <= hoverCell[0]
            ? <span style={{ color: "#10B981", fontWeight: 700 }}>{"✅ BAKABİLİR"}</span>
            : <span style={{ color: "#EF4444", fontWeight: 700 }}>{"❌ YASAK — gelecek kelimeye bakamaz!"}</span>}
        </div>
      )}
    </TEBox>
  );
};

// ═══ RESULTS TABLE (Rich — with more models & cost) ═══
const TEResultsTable = () => {
  const data = [
    { model: "ByteNet", de: 23.75, fr: null, cost: "—", isT: false },
    { model: "GNMT + RL", de: 24.6, fr: 39.92, cost: "2.3×10¹⁹", isT: false },
    { model: "ConvS2S", de: 25.16, fr: 40.46, cost: "9.6×10¹⁸", isT: false },
    { model: "Transformer (base)", de: 27.3, fr: 38.1, cost: "3.3×10¹⁸", isT: true },
    { model: "Transformer (big)", de: 28.4, fr: 41.8, cost: "2.3×10¹⁹", isT: true },
  ];
  return (
    <TEBox>
      <TELabel color="#EF4444">{"📊 BLEU Sonuçları — Yüksek = Daha iyi çeviri"}</TELabel>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{["Model", "EN→DE", "EN→FR", "Maliyet"].map((h, i) => (
            <th key={i} style={{ padding: "10px 12px", textAlign: i === 0 ? "left" : "center", fontSize: 11, color: "#64748B", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} style={{ background: r.isT ? "rgba(16,185,129,0.06)" : "transparent" }}>
              <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: r.isT ? 700 : 400, color: r.isT ? "#10B981" : "#CBD5E1", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {r.isT ? "⭐ " : ""}{r.model}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#E2E8F0", fontFamily: "'Fira Code', monospace", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{r.de}</td>
              <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#E2E8F0", fontFamily: "'Fira Code', monospace", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{r.fr ?? "—"}</td>
              <td style={{ padding: "10px 12px", textAlign: "center", fontSize: 12, color: "#94A3B8", fontFamily: "'Fira Code', monospace", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{r.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TEBox>
  );
};

// ═══ TIMELINE (Rich — clickable with details) ═══
const TETimeline = () => {
  const [active, setActive] = useState(0);
  const events = [
    { year: "2017", title: "Transformer", desc: "Bu makale yayınlandı!", color: "#0EA5E9", icon: "📄", detail: "8 GPU, 3.5 gün eğitim. BLEU rekorları kırdı." },
    { year: "2018", title: "BERT & GPT-1", desc: "Google BERT + OpenAI GPT-1", color: "#10B981", icon: "🧠", detail: "BERT: 340M param. GPT-1: 117M param. İkisi de Transformer tabanlı." },
    { year: "2020", title: "GPT-3 & ViT", desc: "175B parametre + görselde Transformer", color: "#8B5CF6", icon: "🚀", detail: "Few-shot learning. ViT: görüntüleri Transformer ile işle." },
    { year: "2022", title: "ChatGPT", desc: "AI herkesin eline ulaştı", color: "#EC4899", icon: "💬", detail: "GPT-3.5 + RLHF. Tarihin en hızlı büyüyen uygulaması." },
    { year: "2023+", title: "GPT-4, Claude, Gemini", desc: "Çok modlu dev modeller", color: "#6366F1", icon: "🌍", detail: "Metin + görüntü + ses. Trilyon parametreye yaklaşılıyor." },
  ];
  return (
    <TEBox>
      <TELabel color="#6366F1">{"🌍 Zaman Çizelgesi — Bir noktaya tıkla!"}</TELabel>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16, padding: "0 10px" }}>
        {events.map((e, i) => (
          <React.Fragment key={i}>
            <button onClick={() => setActive(i)} style={{
              width: 42, height: 42, borderRadius: 21, border: active === i ? `3px solid ${e.color}` : "2px solid rgba(255,255,255,0.1)",
              background: active === i ? `${e.color}20` : "rgba(255,255,255,0.02)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, cursor: "pointer", transition: "all .3s", flexShrink: 0, fontFamily: "inherit",
              transform: active === i ? "scale(1.2)" : "scale(1)"
            }}>{e.icon}</button>
            {i < events.length - 1 && (
              <div style={{ flex: 1, height: 3, background: i < active ? events[active].color : "rgba(255,255,255,0.06)", borderRadius: 2, transition: "background .3s" }} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ padding: 18, borderRadius: 14, background: `${events[active].color}0A`, border: `1px solid ${events[active].color}25` }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: events[active].color }}>{events[active].year}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#E2E8F0", marginBottom: 6 }}>{events[active].title}</div>
        <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7, marginBottom: 8 }}>{events[active].desc}</div>
        <div style={{ fontSize: 13, color: "#94A3B8", padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.15)" }}>{events[active].detail}</div>
      </div>
    </TEBox>
  );
};

// ═══ Section wrapper vizzes for Week B ═══
const TEPaperGirisViz = () => (<div>
  <TEAnalojiBox emoji="🎒" title={lang === "tr" ? "Okul Analojisi" : "School Analogy"}>{"Eski yöntemde (RNN) öğretmen her öğrenciye SIRAYLA anlatır — çok yavaş! Yeni yöntemde (Transformer) TÜM sınıfa aynı anda anlatır ve her öğrenci kendine lazım olan bilgiye DİKKAT eder."}</TEAnalojiBox>
  <TEInfoBox color="#0EA5E9" icon="📄" title={lang === "tr" ? "Bu makale ne diyor?" : "What does this paper say?"}>{"2017'de Google araştırmacıları, RNN ve CNN'leri atıp sadece \"attention\" kullanan Transformer modelini yaptılar. Hem daha iyi sonuç hem çok daha hızlı!"}</TEInfoBox>
  <TEInfoBox color="#10B981" icon="🏆" title={lang === "tr" ? "Sonuçlar" : "Results"}>{"İngilizce→Almanca: 28.4 BLEU (rekor!). İngilizce→Fransızca: 41.8 BLEU. Sadece 8 GPU'da 3.5 gün eğitim."}</TEInfoBox>
  <TEInfoBox color="#8B5CF6" icon="💡" title={lang === 'tr' ? 'Neden "Attention Is All You Need"?' : 'Why "Attention Is All You Need"?'}>{"Önceki modellerde attention yardımcıydı, asıl iş RNN yapıyordu. Bu makale RNN'yi tamamen kaldırıp SADECE attention ile model yaptı."}</TEInfoBox>
</div>);

const TEPaperEskiModViz = () => (<div>
  <TEAnalojiBox emoji="📖" title={lang === "tr" ? "Kitap Okuma Analojisi" : "Reading a Book Analogy"}>{"RNN: Her kelimeyi okuyup öncekini hatırlamaya çalışıyorsun. Sayfa 1'dekileri sayfa 100'de unutuyorsun! Transformer: Tüm sayfalar önünde açık, istediğin yere bakabiliyorsun."}</TEAnalojiBox>
  <TEInfoBox color="#F59E0B" icon="⏳" title={lang === "tr" ? "RNN Sorunları" : "RNN Problems"}>{"1. Sıralı: Paralel çalışamaz → yavaş! 2. Unutkan: 100 kelime öncesini hatırlayamaz. 3. Gradient kaybolması."}</TEInfoBox>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
    <div style={{padding:18,borderRadius:14,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",textAlign:"center"}}>
      <div style={{fontSize:40}}>🐢</div><div style={{fontSize:18,fontWeight:800,color:"#EF4444"}}>RNN</div>
      <div style={{fontSize:12,color:"#94A3B8",marginTop:4,whiteSpace:"pre-line"}}>{lang === "tr" ? "Sıralı → O(n) adım\nUzak kelimelere ulaşmak zor" : "Sequential → O(n) steps\nHard to reach distant words"}</div>
    </div>
    <div style={{padding:18,borderRadius:14,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.15)",textAlign:"center"}}>
      <div style={{fontSize:40}}>🚀</div><div style={{fontSize:18,fontWeight:800,color:"#10B981"}}>Transformer</div>
      <div style={{fontSize:12,color:"#94A3B8",marginTop:4,whiteSpace:"pre-line"}}>{lang === "tr" ? "Paralel → O(1) adım\nHerkes herkesi görür!" : "Parallel → O(1) steps\nEveryone sees everyone!"}</div>
    </div>
  </div>
</div>);

const TEPaperAttentionViz = () => (<div>
  <TEAnalojiBox emoji="🔍" title={lang === "tr" ? "Dikkat Analojisi" : "Attention Analogy"}>{"Sınıfta öğretmen konuşurken bazı kelimelere çok dikkat edersin. Attention mekanizması da tam bunu yapıyor!"}</TEAnalojiBox>
  <TEAttentionDemo />
  <TEInfoBox color="#10B981" icon="🔑" title="Query, Key, Value">{"🔍 Query: Ne arıyorum? 🗝️ Key: Bende ne var? 📦 Value: Bilgim bu. Q·K yüksekse → o kelimenin Value'sinden çok bilgi al!"}</TEInfoBox>
  <TEAnalojiBox emoji="📚" title={lang === "tr" ? "Kütüphane Analojisi" : "Library Analogy"}>{"Query: Dinozorlar hakkında kitap arıyorum. Key: Her kitabın etiketi. Value: Kitabın içeriği. Etiket sorunla ne kadar uyumluysa, o kitaptan o kadar çok bilgi alırsın!"}</TEAnalojiBox>
  <TEDotProduct />
</div>);

const TEPaperMatViz = () => (<div>
  <TEAnalojiBox emoji="📐" title={lang === "tr" ? "Matematik Zamanı!" : "Math Time!"}>{"Korkma! Her formülü adım adım, gerçek sayılarla açıklayacağız. Kaydırıcıları oyna!"}</TEAnalojiBox>
  <TESoftmax />
  <TEScaledAttentionPipeline />
  <TEMultiHead />
  <div style={{ padding: 18, borderRadius: 14, textAlign: "center", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
    <div style={{ fontSize: 15, fontWeight: 800, color: "#A78BFA", marginBottom: 8 }}>{lang === "tr" ? "🎯 Özet: 3 Temel Formül" : "🎯 Summary: 3 Key Formulas"}</div>
    <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 2.2, fontFamily: "'Georgia', serif" }}>
      <div>{"① Dot Product: Q·K = Σ q"}<sub>i</sub>{"×k"}<sub>i</sub></div>
      <div>{"② Softmax: P(i) = e"}<sup>{"x"}<sub>i</sub></sup>{" / Σ e"}<sup>{"x"}<sub>j</sub></sup></div>
      <div>{"③ Attention: softmax(Q·K"}<sup>T</sup>{"/√d) · V"}</div>
    </div>
  </div>
</div>);

const TEPaperMimariViz = () => (<div>
  <TEAnalojiBox emoji="🏗️" title={lang === "tr" ? "Fabrika Analojisi" : "Factory Analogy"}>{"Encoder: Girdi cümlesini anlayan bölüm. Decoder: Anlaşılandan yeni cümle üreten bölüm. Her biri 6 katlı!"}</TEAnalojiBox>
  <TEInfoBox color="#0EA5E9" icon="📥" title={lang === "tr" ? "Encoder (6 katman)" : "Encoder (6 layers)"}>{"Her katmanda: 1. Multi-Head Self-Attention + 2. Feed-Forward Network + Residual + LayerNorm"}</TEInfoBox>
  <TEInfoBox color="#EC4899" icon="📤" title={lang === "tr" ? "Decoder (6 katman)" : "Decoder (6 layers)"}>{"1. Masked Self-Attention + 2. Cross-Attention (encoder çıktısına dikkat) + 3. Feed-Forward"}</TEInfoBox>
  <TECausalMask />
  <TEInfoBox color="#8B5CF6" icon="🔄" title="Residual + LayerNorm">{"Her alt-katman: çıktı = LayerNorm(x + Sublayer(x)). Residual bağlantı (+x) gradient'in kaybolmasını önler!"}</TEInfoBox>
  <TEInfoBox color="#10B981" icon="🧮" title="Feed-Forward Network">{"FFN(x) = max(0, x·W1 + b1)·W2 + b2. Genişlet (512→2048) → ReLU → Daralt (2048→512)"}</TEInfoBox>
</div>);

const TEPaperPozViz = () => (<div>
  <TEAnalojiBox emoji="📍" title={lang === "tr" ? "Sıra Neden Önemli?" : "Why Does Order Matter?"}>{"\"Köpek kediyi kovaladı\" ≠ \"Kedi köpeği kovaladı\" — aynı kelimeler ama farklı anlam! Transformer sırayı bilmiyor, bu yüzden pozisyon bilgisi eklenmeli."}</TEAnalojiBox>
  <TEPosEncoding />
  <TEInfoBox color="#14B8A6" icon="🌊" title={lang === "tr" ? "Neden sin/cos?" : "Why sin/cos?"}>{"1. Benzersiz: Her pozisyon farklı dalga deseni alır. 2. Göreceli konum: PE(pos+k), PE(pos)'un lineer dönüşümü. 3. Genelleme: Eğitimde görmediği uzunluklara bile genellenebilir!"}</TEInfoBox>
  <TEAnalojiBox emoji="🎹" title={lang === "tr" ? "Piyano Analojisi" : "Piano Analogy"}>{"Her pozisyon bir akort gibi — farklı frekanslarda dalgaların bileşimi. Düşük boyutlar hızlı değişir (tiz), yüksek boyutlar yavaş (bas)."}</TEAnalojiBox>
</div>);

const TEPaperEgitimViz = () => (<div>
  <TEInfoBox color="#EF4444" icon="💪" title={lang === "tr" ? "Eğitim Detayları" : "Training Details"}>{"Veri: 4.5M cümle (EN-DE) + 36M cümle (EN-FR). Donanım: 8× NVIDIA P100 GPU. Süre: Base: 12 saat, Big: 3.5 gün."}</TEInfoBox>
  <TEAnalojiBox emoji="🏃" title={lang === "tr" ? "Warmup Analojisi" : "Warmup Analogy"}>{"Koşudan önce ısınma yaparsın. Model de önce yavaş öğrenir (warmup), sonra hızlanır, en sonunda yavaşlar."}</TEAnalojiBox>
  <TEInfoBox color="#F59E0B" icon="🎯" title={lang === "tr" ? "Düzenlileştirme" : "Regularization"}>{"Dropout (P=0.1): Rastgele nöronları kapat → ezberlemeyi önle. Label Smoothing (ε=0.1): %100 yerine %90 emin ol → genelleme artar."}</TEInfoBox>
  <TEResultsTable />
</div>);

const TEPaperEtkiViz = () => (<div>
  <TEAnalojiBox emoji="💥" title={lang === "tr" ? "Bir makale nasıl dünyayı değiştirir?" : "How does a paper change the world?"}>{"Bu 15 sayfalık makale, yapay zekanın tüm gidişatını değiştirdi. ChatGPT, Google Translate, görüntü AI'ları — hepsi Transformer tabanlı!"}</TEAnalojiBox>
  <TETimeline />
  <TEInfoBox color="#6366F1" icon="🌐" title={lang === "tr" ? "Sadece dil değil!" : "Not just language!"}>{"🖼️ Görüntü: ViT, DALL-E 🧬 Biyoloji: AlphaFold 🎵 Müzik: MusicGen 💻 Kod: Copilot"}</TEInfoBox>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:16}}>
    {[{n:"90K+",l:lang === "tr" ? "Atıf" : "Citations",c:"#6366F1"},{n:"8",l:lang === "tr" ? "Yazar" : "Authors",c:"#EC4899"},{n:"15",l:lang === "tr" ? "Sayfa" : "Pages",c:"#10B981"},{n:"2017",l:lang === "tr" ? lang === "tr" ? "Yıl" : "Year" : "Year",c:"#F59E0B"}].map((d,i) => (
      <div key={i} style={{padding:14,borderRadius:12,background:`${d.c}08`,border:`1px solid ${d.c}20`,textAlign:"center"}}>
        <div style={{fontSize:24,fontWeight:900,color:d.c}}>{d.n}</div><div style={{fontSize:11,color:"#94A3B8"}}>{d.l}</div>
      </div>
    ))}
  </div>
  <div style={{ padding: 20, borderRadius: 14, textAlign: "center", background: "linear-gradient(135deg, rgba(14,165,233,0.1), rgba(139,92,246,0.1), rgba(236,72,153,0.1))", border: "1px solid rgba(139,92,246,0.2)" }}>
    <div style={{ fontSize: 36, marginBottom: 10 }}>🎓</div>
    <div style={{ fontSize: 18, fontWeight: 800, color: "#E2E8F0", marginBottom: 6 }}>{"Tebrikler!"}</div>
    <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7 }}>{lang === "tr" ? "Attention, Multi-Head, Positional Encoding, Encoder-Decoder... Artık senin için sihir değil, anlaşılır matematik!" : "Attention, Multi-Head, Positional Encoding, Encoder-Decoder... No longer magic, but understandable math!"}</div>
  </div>
</div>);


const VIZ_MAP = { tePaperGiris:TEPaperGirisViz, tePaperEskiMod:TEPaperEskiModViz, tePaperAttention:TEPaperAttentionViz, tePaperMat:TEPaperMatViz, tePaperMimari:TEPaperMimariViz, tePaperPoz:TEPaperPozViz, tePaperEgitim:TEPaperEgitimViz, tePaperEtki:TEPaperEtkiViz, coursePipeline:CoursePipelineViz, tokenFlow:TokenFlowViz, embeddingFlow:EmbeddingFlowViz, compGraph:CompGraphViz, opGradTable:OpGradTableViz, archPipeline:ArchPipelineViz, attentionFlow:AttentionFlowViz, causalMask:CausalMaskViz, mlpFlow:MLPFlowViz, paramDist:ParamDistViz, trainingCycle:TrainingCycleViz, lossTable:LossTableViz, adamEvolution:AdamEvolutionViz, inferenceTimeline:InferenceTimelineViz, temperatureViz:TemperatureViz, kvCache:KVCacheViz, gptFamily:GPTFamilyViz, residualViz:ResidualViz, softmaxViz:SoftmaxViz, neuralNetBasics:NeuralNetBasicsViz, langModelConcept:LangModelConceptViz, vectorConcept:VectorConceptViz, matrixMul:MatrixMulViz, derivative:DerivativeViz, topoSort:TopoSortViz, rnnToAttn:RnnToAttnViz, dotProduct:DotProductViz, normCompare:NormCompareViz, activation:ActivationViz, dimensionFlow:DimensionFlowViz, gradDescent:GradDescentViz, lrDecay:LrDecayViz, crossEntropyGraph:CrossEntropyGraphViz, samplingViz2:SamplingViz, whatsMissing:WhatsMissingViz, weightInit:WeightInitViz, trainingEvolution:TrainingEvolutionViz, gptScaleTower:GPTScaleTowerViz, frameworkCompare:FrameworkCompareViz, livePipeline:LivePipelineViz, tokenizerPlayground:TokenizerPlaygroundViz, autogradPlayground:AutogradPlaygroundViz, attentionPlayground:AttentionPlaygroundViz, transformerBlockFlow:TransformerBlockFlowViz, trainingSim:TrainingSimViz, generationPlayground:GenerationPlaygroundViz, scalingLaws:ScalingLawsViz, evolutionTimeline:EvolutionTimelineViz, hardwareEvolution:HardwareEvolutionViz, trainingPipeline:TrainingPipelineViz, tokenEvolution:TokenEvolutionViz, attentionEvolution:AttentionEvolutionViz, opensourceMap:OpensourceMapViz, trendsRadar:TrendsRadarViz };
const VizRenderer = ({ vizKey }) => { if (!vizKey) return null; const keys = Array.isArray(vizKey) ? vizKey : [vizKey]; return keys.map((k,i) => { const C = VIZ_MAP[k]; return C ? <C key={i}/> : null; }); };

// ─── MAIN APP ───────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState('tr');
  const [tab, setTab] = useState("lecture");
  const [model] = useState(() => {
    const rng = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const orig = Math.random; Math.random = rng(42); const m = createModel(); Math.random = orig; return m;
  });

  // Generate state
  const [gToks, setGToks] = useState([]);
  const [gStep, setGStep] = useState(-1);
  const [gDbg, setGDbg] = useState(null);
  const [gHist, setGHist] = useState([]);
  const [autoG, setAutoG] = useState(false);
  const [head, setHead] = useState(0);
  const [temp, setTemp] = useState(0.8);
  const [pStage, setPStage] = useState(-1);
  const [detail, setDetail] = useState("probs");

  // Train state
  const [tStep, setTStep] = useState(0);
  const [tLoss, setTLoss] = useState([]);
  const [tSamp, setTSamp] = useState([]);
  const [training, setTraining] = useState(false);
  const tRef = useRef(false);
  const [tSpeed, setTSpeed] = useState(1);

  // Architecture state
  const [archIdx, setArchIdx] = useState(0);

  // Lecture state
  const [weekIdx, setWeekIdx] = useState(0);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [completedSections, setCompletedSections] = useState({});
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [codeMapOpen, setCodeMapOpen] = useState(false);
  const [instructorMode, setInstructorMode] = useState(false);
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Track section completion
  useEffect(() => {
    if (tab === "lecture") {
      setCompletedSections(prev => {
        const wk = prev[weekIdx] || [];
        if (!wk.includes(sectionIdx)) return { ...prev, [weekIdx]: [...wk, sectionIdx] };
        return prev;
      });
    }
  }, [weekIdx, sectionIdx, tab]);

  // Generation step
  const doStep = useCallback(() => {
    if (gStep >= model.bs - 2) return null;
    const step = gStep + 1;
    const toks = step === 0 ? [BOS] : [...gToks];
    const K = [], V = [];
    let dbg = null;
    [0, 1, 2, 3, 4, 5].forEach((s, i) => setTimeout(() => setPStage(s), i * 100));
    for (let p = 0; p < toks.length; p++) {
      const r = fwd(model, toks[p], p, K, V);
      dbg = r.D;
    }
    const sL = dbg.logits.map(l => l / temp);
    const pr = softmax(sL);
    dbg.probs = pr;
    const next = smpl(pr);
    const newT = [...toks, next];
    setGToks(newT); setGStep(step); setGDbg(dbg);
    setGHist(h => [...h, { step, tok: itos[next], prob: pr[next], probs: [...pr] }]);
    if (next === EOS) setAutoG(false);
    return next;
  }, [gStep, gToks, model, temp]);

  useEffect(() => {
    if (!autoG) return;
    const t = setTimeout(() => {
      const tok = doStep();
      if (tok === null || tok === EOS || gStep >= model.bs - 3) setAutoG(false);
    }, 900);
    return () => clearTimeout(t);
  }, [autoG, doStep, gStep, model.bs]);

  const resetGen = () => { setGToks([]); setGStep(-1); setGDbg(null); setGHist([]); setAutoG(false); setPStage(-1); };

  // Training
  const startTrain = () => {
    const m = createModel(); setTStep(0); setTLoss([]); setTSamp([]); setTraining(true); tRef.current = true;
    let step = 0; const losses = [], samps = []; const params = [], mo = [], ve = [];
    for (const k of Object.keys(m.sd)) for (let r = 0; r < m.sd[k].length; r++) for (let c = 0; c < m.sd[k][r].length; c++) { params.push({ k, r, c }); mo.push(0); ve.push(0); }
    const genS = (mod, st) => {
      for (let s = 0; s < 3; s++) {
        const K2 = [], V2 = []; let tid = BOS; const g = [];
        for (let p = 0; p < mod.bs; p++) { const r = fwd(mod, tid, p, K2, V2); tid = smpl(softmax(r.logits.map(l => l / 0.8))); if (tid === EOS) break; g.push(itos[tid]); }
        samps.push({ step: st, name: g.join("") });
      }
      setTSamp([...samps]);
    };
    const doS = () => {
      if (!tRef.current || step >= 300) { setTraining(false); tRef.current = false; genS(m, step); return; }
      const doc = NAMES[step % NAMES.length];
      const toks = [BOS, ...doc.split("").map(c => stoi[c] || 0), EOS].slice(0, m.bs);
      const K = [], V = []; let loss = 0;
      for (let p = 0; p < toks.length - 1; p++) { const r = fwd(m, toks[p], p, K, V); loss += -Math.log(Math.max(1e-10, r.probs[toks[p + 1]])) / (toks.length - 1); }
      const eps = 1e-4, n = Math.min(40, params.length), lr = 0.01 * (1 - step / 300);
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * params.length); const { k: pk, r: pr2, c: pc } = params[idx];
        const orig = m.sd[pk][pr2][pc]; m.sd[pk][pr2][pc] = orig + eps;
        const K2 = [], V2 = []; let l2 = 0;
        for (let p = 0; p < toks.length - 1; p++) { const r2 = fwd(m, toks[p], p, K2, V2); l2 += -Math.log(Math.max(1e-10, r2.probs[toks[p + 1]])) / (toks.length - 1); }
        const g = (l2 - loss) / eps; m.sd[pk][pr2][pc] = orig;
        mo[idx] = 0.9 * mo[idx] + 0.1 * g; ve[idx] = 0.95 * ve[idx] + 0.05 * g * g;
        const mh = mo[idx] / (1 - 0.9 ** (step + 1)), vh = ve[idx] / (1 - 0.95 ** (step + 1));
        m.sd[pk][pr2][pc] -= lr * mh / (Math.sqrt(vh) + 1e-8);
      }
      losses.push(loss); setTLoss([...losses]); setTStep(step + 1);
      if ((step + 1) % 40 === 0) genS(m, step + 1);
      step++; setTimeout(doS, tSpeed === 2 ? 2 : tSpeed === 0 ? 20 : 6);
    };
    doS();
  };

  const genWord = gHist.filter(h => h.tok !== "<BOS>" && h.tok !== "<EOS>").map(h => h.tok).join("");
  const currentWeek = WEEKS[weekIdx];
  const currentSection = currentWeek?.sections[sectionIdx];

  const TabBtn = ({ id, label, emoji }) => (
    <button onClick={() => setTab(id)} style={{
      padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontSize: 16, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif", transition: "all .35s",
      border: tab === id ? "none" : "1px solid rgba(255,255,255,0.08)",
      background: tab === id ? "linear-gradient(135deg,#0EA5E9,#6366F1)" : "rgba(255,255,255,0.03)",
      color: tab === id ? "#fff" : "#64748B",
      boxShadow: tab === id ? "0 4px 24px rgba(14,165,233,.3)" : "none",
      transform: tab === id ? "scale(1.04)" : "scale(1)"
    }}>
      {emoji} {label}
    </button>
  );

  return (
    <LangContext.Provider value={lang}>
    <div style={{ minHeight: "100vh", background: "#030712", color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Background effects */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", right: "-5%", width: "45%", height: "45%", background: "radial-gradient(circle,rgba(14,165,233,.06) 0%,transparent 70%)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: "40%", height: "40%", background: "radial-gradient(circle,rgba(99,102,241,.04) 0%,transparent 70%)", filter: "blur(120px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "20px 28px" }}>

        {/* ─── HEADER ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: 16, background: "linear-gradient(135deg,#0EA5E9,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 29, fontWeight: 800, boxShadow: "0 4px 28px rgba(14,165,233,.35)", color: "#fff" }}>μ</div>
            <div>
              <h1 style={{ fontSize: 27, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#F1F5F9,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{lang === 'tr' ? 'microGPT Akademi' : 'microGPT Academy'}</h1>
              <p style={{ margin: 0, fontSize: 15, color: "#64748B" }}>{lang === 'tr' ? 'Sıfırdan GPT — 243 satır saf Python • İnteraktif Ders Notu & Laboratuvar' : 'GPT from Scratch — 243 lines of pure Python • Interactive Lecture Notes & Lab'}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <TabBtn id="lecture" label={lang === 'tr' ? "Ders Notları" : "Lectures"} emoji="📖" />
            <TabBtn id="generate" label={lang === 'tr' ? "Üretim Lab" : "Generation Lab"} emoji="⚡" />
            <TabBtn id="train" label={lang === 'tr' ? "Eğitim Lab" : "Training Lab"} emoji="📈" />
            <TabBtn id="arch" label={lang === 'tr' ? "Mimari" : "Architecture"} emoji="🧠" />
            <button onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} style={{
              padding: "10px 16px", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", transition: "all .35s",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)",
              color: "#94A3B8",
            }}>
              {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
            </button>
            <button onClick={() => setGlossaryOpen(!glossaryOpen)} style={{
              padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontSize: 16, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", transition: "all .35s",
              border: glossaryOpen ? "none" : "1px solid rgba(255,255,255,0.08)",
              background: glossaryOpen ? "linear-gradient(135deg,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.03)",
              color: glossaryOpen ? "#fff" : "#64748B",
              boxShadow: glossaryOpen ? "0 4px 24px rgba(139,92,246,.3)" : "none",
              transform: glossaryOpen ? "scale(1.04)" : "scale(1)"
            }}>
              {lang === 'tr' ? '📖 Sözlük' : '📖 Glossary'}
            </button>
            <button onClick={() => setCodeMapOpen(true)} style={{
              padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontSize: 16, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", transition: "all .35s",
              border: "1px solid rgba(245,158,11,0.15)",
              background: "rgba(245,158,11,0.04)",
              color: "#F59E0B"
            }}>
              {lang === 'tr' ? '🗺️ Kod Haritası' : '🗺️ Code Map'}
            </button>
          </div>
        </div>

        {/* Glossary Panel Overlay */}
        {glossaryOpen && <GlossaryPanel searchTerm={glossarySearch} setSearchTerm={setGlossarySearch} onClose={() => setGlossaryOpen(false)} />}
        {/* Code Map Panel Overlay */}
        {codeMapOpen && <CodeMapPanel onClose={() => setCodeMapOpen(false)} />}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* LECTURE TAB                                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {tab === "lecture" && (
          <div style={{ display: "flex", gap: 20 }}>
            {/* Week sidebar */}
            <div style={{ width: 220, flexShrink: 0 }}>
              {/* Overall progress */}
              {(() => {
                const totalSections = WEEKS.reduce((s, w) => s + w.sections.length, 0);
                const totalDone = Object.values(completedSections).reduce((s, arr) => s + arr.length, 0);
                const pct = totalSections > 0 ? Math.round((totalDone / totalSections) * 100) : 0;
                return (
                  <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#10B981", fontWeight: 600 }}>{lang === "tr" ? "📊 İlerleme" : "📊 Progress"}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#10B981", fontFamily: "'Fira Code', monospace" }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#10B981,#0EA5E9)", borderRadius: 3, transition: "width .6s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{totalDone}/{totalSections} {lang === "tr" ? "bölüm görüldü" : "sections viewed"}</div>
                  </div>
                );
              })()}
              <div style={{ fontSize: 13, color: "#475569", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10, fontWeight: 600 }}>{lang === "tr" ? "Haftalık Program" : "Weekly Program"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {WEEKS.map((w, i) => {
                  const wDone = (completedSections[i] || []).length;
                  const wTotal = w.sections.length;
                  const wPct = wTotal > 0 ? (wDone / wTotal) * 100 : 0;
                  return (
                  <div key={w.id}>
                  <button onClick={() => { setWeekIdx(i); setSectionIdx(0); setShowQuiz(false); }} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: weekIdx === i ? `${w.color}15` : "transparent",
                    transition: "all .25s", textAlign: "left", fontFamily: "inherit", width: "100%"
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
                      background: weekIdx === i ? w.color : "rgba(255,255,255,0.04)", color: weekIdx === i ? "#fff" : "#475569",
                      transition: "all .3s", flexShrink: 0, position: "relative"
                    }}>
                      {w.icon}
                      {wPct === 100 && <div style={{ position: "absolute", top: -3, right: -3, width: 12, height: 12, borderRadius: "50%", background: "#10B981", border: "2px solid #030712", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>✓</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: ".1em" }}>Hafta {w.week}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: weekIdx === i ? w.color : "#94A3B8" }}>{tx(w.title, lang)}</div>
                    </div>
                  </button>
                  {/* Per-week progress bar */}
                  <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, margin: "2px 12px 0", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${wPct}%`, background: w.color, borderRadius: 2, transition: "width .5s" }} />
                  </div>
                  </div>
                  );
                })}
              </div>

              {/* Model summary card */}
              <div style={{ marginTop: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8, fontWeight: 600 }}>{lang === "tr" ? "Model Özeti" : "Model Summary"}</div>
                {[
                  { l: "Parametreler", v: "3,648", c: "#0EA5E9" },
                  { l: "Embedding", v: "16 boyut", c: "#8B5CF6" },
                  { l: "Attention", v: "4 head", c: "#10B981" },
                  { l: "Layer", v: "1 katman", c: "#F59E0B" },
                  { l: "Context", v: "8 token", c: "#EC4899" },
                  { l: "Vocabulary", v: "28 token", c: "#EF4444" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                    <span style={{ fontSize: 13, color: "#64748B" }}>{item.l}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: item.c, fontFamily: "'Fira Code', monospace" }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main lecture content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Week header */}
              <div style={{ background: `${currentWeek.color}08`, border: `1px solid ${currentWeek.color}20`, borderRadius: 18, padding: "20px 28px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: currentWeek.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 29, boxShadow: `0 4px 20px ${currentWeek.color}40`, flexShrink: 0 }}>
                    {currentWeek.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "#64748B", textTransform: "uppercase", letterSpacing: ".1em" }}>{lang === "tr" ? "Hafta" : "Week"} {currentWeek.week}</div>
                    <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, color: currentWeek.color }}>{tx(currentWeek.title, lang)}</h2>
                    <p style={{ margin: "2px 0 0", fontSize: 15, color: "#94A3B8" }}>{tx(currentWeek.subtitle, lang)}</p>
                  </div>
                </div>

                {/* Section tabs */}
                <div style={{ display: "flex", gap: 6, marginTop: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "thin" }}>
                  {currentWeek.sections.map((s, i) => {
                    const ek = `week${currentWeek.week}_s${i}`;
                    const hasExtras = SECTION_EXTRAS[ek];
                    const hasTryIt = hasExtras?.tryIt;
                    const hasSteps = hasExtras?.stepByStep;
                    const hasRealCode = !!REAL_CODE[ek];
                    return (
                    <button key={i} onClick={() => setSectionIdx(i)} style={{
                      padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                      background: sectionIdx === i ? currentWeek.color : "rgba(255,255,255,0.05)",
                      color: sectionIdx === i ? "#fff" : "#94A3B8", fontFamily: "inherit", transition: "all .25s",
                      whiteSpace: "nowrap", flexShrink: 0, position: "relative"
                    }}>
                      {i + 1}
                      {(hasTryIt || hasSteps) && <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", border: "2px solid #030712" }} title={lang === "tr" ? "İnteraktif içerik" : "Interactive content"} />}
                      {hasRealCode && !hasTryIt && !hasSteps && <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#10B981", border: "2px solid #030712" }} title={lang === "tr" ? "Gerçek microgpt.py kodu" : "Actual microgpt.py code"} />}
                      {hasExtras && !hasTryIt && !hasSteps && !hasRealCode && <span style={{ position: "absolute", top: -1, right: -1, width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", border: "1.5px solid #030712" }} title={lang === "tr" ? "Pedagojik içerik" : "Pedagogical content"} />}
                    </button>
                    );
                  })}
                </div>
                {/* Section title indicator */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, padding: "0 2px" }}>
                  <span style={{ fontSize: 14, color: currentWeek.color, fontWeight: 600 }}>{sectionIdx + 1}. {tx(currentSection?.title, lang)}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#F59E0B" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} /> kendin dene</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#10B981" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} /> {lang === "tr" ? "gerçek kod" : "real code"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#8B5CF6" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", display: "inline-block" }} /> {lang === "tr" ? "köprü/analoji" : "bridge/analogy"}</span>
                    <span style={{ fontSize: 12, color: "#475569" }}>{sectionIdx + 1}/{currentWeek.sections.length}</span>
                    <button onClick={() => setInstructorMode(!instructorMode)} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, border: `1px solid ${instructorMode ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`, background: instructorMode ? "rgba(251,191,36,0.1)" : "transparent", color: instructorMode ? "#FBBF24" : "#475569", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, marginLeft: 4 }}>
                      🎓 {instructorMode ? (lang === "tr" ? "Hoca Modu ✓" : "Instructor ✓") : (lang === "tr" ? "Hoca Modu" : "Instructor")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section content */}
              {currentSection && (() => {
                const extraKey = `week${currentWeek.week}_s${sectionIdx}`;
                const extras = SECTION_EXTRAS[extraKey] || {};
                return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28 }}>
                    <h3 style={{ margin: "0 0 12px", fontSize: 23, fontWeight: 700, color: "#E2E8F0" }}>{tx(currentSection.title, lang)}</h3>

                    <SlideRefPanel weekIdx={currentWeek.week} sectionIdx={sectionIdx} />

                    {/* Instructor Mode Panels */}
                    {instructorMode && (
                      <div style={{ marginBottom: 16 }}>
                        <InstructorPanel weekIdx={currentWeek.week} sectionIdx={sectionIdx} weekColor={currentWeek.color} />
                        {sectionIdx === 0 && (
                          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                            <button onClick={() => setShowLessonPlan(!showLessonPlan)} style={{ flex: 1, fontSize: 13, padding: "6px 10px", borderRadius: 8, border: `1px solid ${showLessonPlan ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"}`, background: showLessonPlan ? "rgba(99,102,241,0.06)" : "transparent", color: showLessonPlan ? "#818CF8" : "#64748B", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                              📋 {showLessonPlan ? lang === "tr" ? "Ders Planını Gizle" : "Hide Lesson Plan" : lang === "tr" ? "Ders Planını Göster" : "Show Lesson Plan"}
                            </button>
                            <button onClick={() => setShowCheatSheet(!showCheatSheet)} style={{ flex: 1, fontSize: 13, padding: "6px 10px", borderRadius: 8, border: `1px solid ${showCheatSheet ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)"}`, background: showCheatSheet ? "rgba(16,185,129,0.06)" : "transparent", color: showCheatSheet ? "#10B981" : "#64748B", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                              📝 {showCheatSheet ? lang === "tr" ? "Kopya Kağıdını Gizle" : "Hide Cheat Sheet" : lang === "tr" ? "Kopya Kağıdını Göster" : "Show Cheat Sheet"}
                            </button>
                          </div>
                        )}
                        {showLessonPlan && sectionIdx === 0 && <LessonPlanPanel weekIdx={currentWeek.week} />}
                        {showCheatSheet && sectionIdx === 0 && <CheatSheetPanel weekIdx={currentWeek.week} />}
                      </div>
                    )}

                    {/* Bridge Box — connection to previous content */}
                    {extras.bridge && <BridgeBox from={extras.bridge.from} to={extras.bridge.to} color={currentWeek.color} />}

                    {/* Why Box — motivation */}
                    {extras.why && <WhyBox color={currentWeek.color}>{extras.why}</WhyBox>}

                    {/* Analogy Box — real-world metaphor */}
                    {extras.analogy && <AnalogyBox title={extras.analogy.title} emoji={extras.analogy.emoji} color={currentWeek.color}>{extras.analogy.text}</AnalogyBox>}

                    {/* Concrete Box — abstract→concrete */}
                    {extras.concrete && <ConcreteBox title={extras.concrete.title} color={currentWeek.color}><pre style={{ margin: 0, fontFamily: "'Fira Code', monospace", fontSize: 14, lineHeight: 1.6, color: "#E2E8F0", whiteSpace: "pre-wrap" }}>{extras.concrete.content}</pre></ConcreteBox>}

                    {currentSection.viz && <VizRenderer vizKey={currentSection.viz} />}

                    <p style={{ fontSize: 17, lineHeight: 1.8, color: "#CBD5E1", margin: 0 }}>{lang === 'en' && EN_CONTENT[currentWeek.id]?.[sectionIdx]?.content ? EN_CONTENT[currentWeek.id][sectionIdx].content : currentSection.content}</p>

                    {currentSection.highlight && (
                      <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 12, background: `${currentWeek.color}08`, borderLeft: `3px solid ${currentWeek.color}` }}>
                        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: currentWeek.color, fontStyle: "italic" }}>{lang === 'en' && EN_CONTENT[currentWeek.id]?.[sectionIdx]?.highlight ? EN_CONTENT[currentWeek.id][sectionIdx].highlight : currentSection.highlight}</p>
                      </div>
                    )}

                    {currentSection.code && (
                      <div style={{ marginTop: 16 }}>
                        <CodeBlock code={currentSection.code} />
                      </div>
                    )}

                    {/* Real microgpt.py Code Block */}
                    {REAL_CODE[extraKey] && <RealCodeBlock data={REAL_CODE[extraKey]} weekColor={currentWeek.color} />}

                    {/* Step-by-Step Calculation */}
                    {extras.stepByStep && <StepByStepCalc title={extras.stepByStep.title} steps={extras.stepByStep.steps} color={currentWeek.color} />}

                    {/* Try It Yourself Widgets */}
                    {extras.tryIt === "tokenizer" && <TryItTokenizer />}
                    {extras.tryIt === "embedding" && <TryItEmbedding />}
                    {extras.tryIt === "softmax" && <TryItSoftmax />}
                    {extras.tryIt === "dotProduct" && <TryItDotProduct />}
                    {extras.tryIt === "gradient" && <TryItGradient />}
                    {extras.tryIt === "params" && <TryItParams />}

                    {/* Comparison Tables (shown for specific sections) */}
                    {weekIdx === 0 && sectionIdx === (currentWeek.sections.length - 1) && <ComparisonTableWidget data={COMPARISONS["model_scale"]} />}
                    {weekIdx === 3 && sectionIdx === 0 && <ConceptMapViz />}
                    {weekIdx === 4 && sectionIdx === 2 && <ComparisonTableWidget data={COMPARISONS["norm_compare"]} />}
                    {weekIdx === 4 && sectionIdx === 3 && <ComparisonTableWidget data={COMPARISONS["activation_compare"]} />}
                    {weekIdx === 5 && sectionIdx === 4 && <ComparisonTableWidget data={COMPARISONS["optimizer_compare"]} />}

                    {/* Common Mistakes (at last section of each week) */}
                    {COMMON_MISTAKES[currentWeek.week] && sectionIdx === currentWeek.sections.length - 1 && (
                      <MistakesList mistakes={COMMON_MISTAKES[currentWeek.week]} weekColor={currentWeek.color} />
                    )}

                    {/* Resources (at last section of each week) */}
                    {RESOURCES[currentWeek.week] && sectionIdx === currentWeek.sections.length - 1 && (
                      <ResourceLinks resources={RESOURCES[currentWeek.week]} />
                    )}
                  </div>

                  {/* Quiz toggle (shown at bottom after all sections) */}
                  {sectionIdx === currentWeek.sections.length - 1 && QUIZZES[currentWeek.week] && (
                    <div>
                      {!showQuiz ? (
                        <button onClick={() => setShowQuiz(true)} style={{
                          width: "100%", padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)",
                          background: "rgba(99,102,241,0.06)", color: "#6366F1", fontSize: 17, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                        }}>
                          🧪 {lang === "tr" ? "Hafta" : "Week"} {currentWeek.week} {lang === "tr" ? "Quiz'ini Çöz" : "Take Quiz"} ({QUIZZES[currentWeek.week].length} soru)
                        </button>
                      ) : (
                        <QuizWidget questions={QUIZZES[currentWeek.week]} weekColor={currentWeek.color} />
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      onClick={() => {
                        if (sectionIdx > 0) { setSectionIdx(sectionIdx - 1); setShowQuiz(false); }
                        else if (weekIdx > 0) { setWeekIdx(weekIdx - 1); setSectionIdx(WEEKS[weekIdx - 1].sections.length - 1); setShowQuiz(false); }
                      }}
                      disabled={weekIdx === 0 && sectionIdx === 0}
                      style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: (weekIdx === 0 && sectionIdx === 0) ? "#1E293B" : "#94A3B8", fontSize: 15, fontWeight: 600, cursor: (weekIdx === 0 && sectionIdx === 0) ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                    >
                      ← Önceki
                    </button>
                    <span style={{ fontSize: 13, color: "#475569" }}>
                      {lang === "tr" ? "Hafta" : "Week"} {currentWeek.week} • {lang === "tr" ? "Bölüm" : "Section"} {sectionIdx + 1}/{currentWeek.sections.length}
                    </span>
                    <button
                      onClick={() => {
                        if (sectionIdx < currentWeek.sections.length - 1) { setSectionIdx(sectionIdx + 1); setShowQuiz(false); }
                        else if (weekIdx < WEEKS.length - 1) { setWeekIdx(weekIdx + 1); setSectionIdx(0); setShowQuiz(false); }
                      }}
                      disabled={weekIdx === WEEKS.length - 1 && sectionIdx === currentWeek.sections.length - 1}
                      style={{
                        padding: "8px 18px", borderRadius: 10, border: "none", fontSize: 15, fontWeight: 600, fontFamily: "inherit",
                        background: (weekIdx === WEEKS.length - 1 && sectionIdx === currentWeek.sections.length - 1) ? "#1E293B" : currentWeek.color,
                        color: "#fff", cursor: (weekIdx === WEEKS.length - 1 && sectionIdx === currentWeek.sections.length - 1) ? "not-allowed" : "pointer"
                      }}
                    >
                      Sonraki →
                    </button>
                  </div>
                </div>
              );
              })()}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* GENERATE TAB                                               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {tab === "generate" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Explainer banner */}
            <div style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 25 }}>💡</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#0EA5E9" }}>{lang === "tr" ? "Üretim Laboratuvarı" : "Generation Laboratory"}</div>
                <div style={{ fontSize: 14, color: "#94A3B8" }}>{lang === "tr" ? "Model BOS token ile başlar, her adımda sonraki karakteri tahmin eder. Altta detaylı görselleştirmeleri inceleyin." : "Model starts with BOS token, predicting the next character at each step. Explore detailed visualizations below."}</div>
              </div>
            </div>

            {/* Pipeline + Controls */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <Pipeline steps={ARCH_STEPS.map(s => ({ color: s.color, icon: s.icon }))} active={pStage} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "#475569" }}>T</span>
                  <input type="range" min="0.1" max="2.0" step="0.05" value={temp} onChange={e => setTemp(+e.target.value)} style={{ width: 70, accentColor: "#0EA5E9" }} />
                  <span style={{ fontSize: 15, color: "#0EA5E9", fontFamily: "'Fira Code', monospace", width: 32 }}>{temp.toFixed(1)}</span>
                </div>
                <button onClick={() => { resetGen(); setAutoG(true); }} style={{ padding: "7px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{lang === "tr" ? "▶ Otomatik" : "▶ Auto"}</button>
                <button onClick={doStep} disabled={autoG} style={{ padding: "7px 18px", borderRadius: 10, border: "1px solid rgba(14,165,233,.3)", background: "rgba(14,165,233,.08)", color: "#0EA5E9", fontSize: 15, fontWeight: 600, cursor: autoG ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{lang === "tr" ? "→ Adım" : "→ Step"}</button>
                <button onClick={resetGen} style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,.2)", background: "transparent", color: "#EF4444", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>↻</button>
              </div>
            </div>

            {/* Main content grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Generated tokens */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: 18 }}>
                  <div style={{ fontSize: 14, color: "#475569", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>{lang === "tr" ? "Üretilen Tokenlar" : "Generated Tokens"}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, minHeight: 48 }}>
                    {gHist.length === 0 && <span style={{ color: "#1E293B", fontSize: 16, fontStyle: "italic" }}>{lang === "tr" ? "▶ veya → ile üretimi başlatın" : "Press ▶ or → to start generating"}</span>}
                    {gHist.map((h, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, animation: "popIn .35s cubic-bezier(.34,1.56,.64,1)" }}>
                        <div style={{
                          padding: "8px 12px", borderRadius: 10, fontSize: 23, fontWeight: 700, fontFamily: "'Fira Code', monospace",
                          background: h.tok === "<EOS>" ? "rgba(239,68,68,.12)" : "rgba(14,165,233,.1)",
                          color: h.tok === "<EOS>" ? "#EF4444" : "#E2E8F0",
                          border: `1.5px solid ${h.tok === "<EOS>" ? "rgba(239,68,68,.25)" : "rgba(14,165,233,.2)"}`
                        }}>
                          {h.tok === "<BOS>" ? "◆" : h.tok === "<EOS>" ? "■" : h.tok}
                        </div>
                        <span style={{ fontSize: 11, color: "#475569", fontFamily: "'Fira Code', monospace" }}>{(h.prob * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                  {genWord && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(14,165,233,.06)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, color: "#64748B" }}>{lang === "tr" ? "Sonuç:" : "Result:"}</span>
                      <span style={{ fontSize: 27, fontWeight: 700, fontFamily: "'Fira Code', monospace", color: "#0EA5E9" }}>{genWord}</span>
                    </div>
                  )}
                </div>

                {/* Detail panels */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {[
                      { id: "probs", l: lang === "tr" ? "Olasılıklar" : "Probabilities", i: "📊", tip: lang === "tr" ? "Hangi token seçilecek?" : "Which token will be selected?" },
                      { id: "attn", l: "Attention", i: "🔍", tip: lang === "tr" ? "Kim kime bakıyor?" : "Who looks at whom?" },
                      { id: "mlp", l: "MLP Nöron", i: "🧬", tip: lang === "tr" ? "Hangi nöronlar aktif?" : "Which neurons are active?" },
                      { id: "embed", l: "Embedding", i: "📐", tip: lang === "tr" ? "Vektör değerleri" : "Vector values" }
                    ].map(d => (
                      <button key={d.id} onClick={() => setDetail(d.id)} style={{
                        flex: 1, padding: "10px 6px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                        background: detail === d.id ? "rgba(14,165,233,.08)" : "transparent",
                        color: detail === d.id ? "#0EA5E9" : "#475569",
                        borderBottom: detail === d.id ? "2px solid #0EA5E9" : "2px solid transparent"
                      }}>
                        {d.i} {d.l}
                      </button>
                    ))}
                  </div>
                  <div style={{ padding: 20, minHeight: 200 }}>
                    {!gDbg && <div style={{ color: "#1E293B", fontSize: 16, textAlign: "center", paddingTop: 40 }}>{lang === "tr" ? "Bir adım üretin..." : "Generate a step..."}</div>}
                    {gDbg && detail === "probs" && <ProbDist probs={gDbg.probs} tgt={gToks[gToks.length - 1]} />}
                    {gDbg && detail === "attn" && <AttnMat weights={gDbg.AW} tokens={gToks.map(t => itos[t])} head={head} setHead={setHead} />}
                    {gDbg && detail === "mlp" && <MLPViz hidden={gDbg.mlpH} activated={gDbg.mlpAct} />}
                    {gDbg && detail === "embed" && <EmbedViz dbg={gDbg} />}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <InfoCard value={gHist.length} label={lang === "tr" ? "Adım" : "Step"} color="#0EA5E9" icon="⚡" sub={`/ ${model.bs}`} />
                <InfoCard value={genWord || "—"} label={lang === "tr" ? "Üretilen" : "Generated"} color="#10B981" icon="✦" />
                <InfoCard value={gDbg ? (Math.max(...gDbg.probs) * 100).toFixed(1) + "%" : "—"} label=lang === "tr" ? "Top-1 Olasılık" : "Top-1 Probability" color="#F59E0B" icon="📊" />
                <InfoCard value={temp.toFixed(2)} label="Temperature" color="#8B5CF6" icon="🌡" />
                <InfoCard value="3,648" label="Parametre" color="#EC4899" icon="🧮" sub="1 layer × 4 heads" />
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 12 }}>
                  <div style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>{lang === "tr" ? "📜 Geçmiş" : "📜 History"}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 160, overflowY: "auto" }}>
                    {gHist.map((h, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 6px", borderRadius: 5, background: "rgba(0,0,0,.2)", fontSize: 13 }}>
                        <span style={{ color: "#475569", fontFamily: "'Fira Code', monospace" }}>#{i}</span>
                        <span style={{ fontWeight: 700, fontFamily: "'Fira Code', monospace", color: "#E2E8F0" }}>{h.tok === "<BOS>" ? "◆" : h.tok === "<EOS>" ? "■" : h.tok}</span>
                        <Spark data={h.probs.slice(2, 28)} w={50} h={14} />
                        <span style={{ color: "#475569", fontFamily: "'Fira Code', monospace", fontSize: 11 }}>{(h.prob * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TRAIN TAB                                                  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {tab === "train" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Explainer */}
            <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 25 }}>🎓</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#10B981" }}>{lang === "tr" ? "Eğitim Laboratuvarı" : "Training Laboratory"}</div>
                <div style={{ fontSize: 14, color: "#94A3B8" }}>{lang === "tr" ? "Model 300 adımda isim kalıplarını öğrenir. Loss düştükçe tahminler iyileşir. Her 40 adımda üretilen örnekleri gözlemleyin." : "Model learns name patterns in 300 steps. Predictions improve as loss decreases. Observe generated samples every 40 steps."}</div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
              <InfoCard value={tStep} label={lang === "tr" ? "Adım" : "Step"} color="#0EA5E9" icon="⏱" sub="/300" />
              <InfoCard value={tLoss.length ? tLoss[tLoss.length - 1].toFixed(3) : "—"} label="Loss" color="#F59E0B" icon="📉" />
              <InfoCard value={(0.01 * (1 - tStep / 300)).toFixed(4)} label="Learning Rate" color="#8B5CF6" icon="🎯" />
              <InfoCard value={tLoss.length >= 2 ? (tLoss[tLoss.length - 1] < tLoss[tLoss.length - 2] ? lang === "tr" ? "↓ Düşüyor" : "↓ Decreasing" : lang === "tr" ? "↑ Artıyor" : "↑ Increasing") : "—"} label="Trend" color={tLoss.length >= 2 && tLoss[tLoss.length - 1] < tLoss[tLoss.length - 2] ? "#10B981" : "#EF4444"} icon="📈" />
              <InfoCard value={tSamp.length} label={lang === "tr" ? "Üretilen" : "Generated"} color="#EC4899" icon="✦" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "5fr 2fr", gap: 16 }}>
              {/* Loss curve */}
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>{lang === "tr" ? "Loss Eğrisi" : "Loss Curve"}</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>Düşen loss = model öğreniyor. Salınım normaldir (mini-batch).</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {!training ? (
                      <button onClick={startTrain} style={{ padding: "7px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{lang === "tr" ? "▶ Başlat" : "▶ Start"}</button>
                    ) : (
                      <button onClick={() => { tRef.current = false; setTraining(false); }} style={{ padding: "7px 18px", borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{lang === "tr" ? "⏹ Dur" : "⏹ Stop"}</button>
                    )}
                    <select value={tSpeed} onChange={e => setTSpeed(+e.target.value)} style={{ padding: "5px 8px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: 13, fontFamily: "inherit" }}>
                      <option value={0}>{lang === "tr" ? "🐢 Yavaş" : "🐢 Slow"}</option>
                      <option value={1}>{lang === "tr" ? "🏃 Normal" : "🏃 Normal"}</option>
                      <option value={2}>{lang === "tr" ? "🚀 Hızlı" : "🚀 Fast"}</option>
                    </select>
                  </div>
                </div>
                <div style={{ height: 220, background: "rgba(0,0,0,.2)", borderRadius: 12, overflow: "hidden", position: "relative" }}>
                  {tLoss.length > 1 ? (
                    <svg width="100%" height="100%" viewBox={`0 0 ${tLoss.length} 100`} preserveAspectRatio="none">
                      <defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA5E9" stopOpacity=".25" /><stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" /></linearGradient></defs>
                      <polygon points={`0,100 ${tLoss.map((l, i) => `${i},${Math.max(0, Math.min(100, (l - 1.5) * 30))}`).join(" ")} ${tLoss.length - 1},100`} fill="url(#lg1)" />
                      <polyline points={tLoss.map((l, i) => `${i},${Math.max(0, Math.min(100, (l - 1.5) * 30))}`).join(" ")} fill="none" stroke="#0EA5E9" strokeWidth="1.5" />
                      <line x1="0" y1={(3.33 - 1.5) * 30} x2={tLoss.length} y2={(3.33 - 1.5) * 30} stroke="#EF4444" strokeWidth=".5" strokeDasharray="4,4" opacity=".4" />
                    </svg>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#1E293B", fontSize: 17 }}>{lang === "tr" ? "▶ Başlat" : "▶ Start"}</div>
                  )}
                  {tLoss.length > 1 && (
                    <div style={{ position: "absolute", top: 8, right: 12, fontSize: 12, color: "#475569" }}>
                      <span style={{ color: "#EF4444" }}>{lang==="tr"?"--- rastgele tahmin (3.33)":"--- random guess (3.33)"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Generated names */}
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: 16 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>{lang === "tr" ? "Üretilen İsimler" : "Generated Names"}</h3>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748B" }}>{lang==="tr"?"İlk örnekler rastgele, adım arttıkça gerçekçi isimler oluşur.":"First samples are random, names become realistic as steps increase."}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 280, overflowY: "auto" }}>
                  {tSamp.length === 0 && <p style={{ color: "#1E293B", fontSize: 14, textAlign: "center", marginTop: 30 }}>{lang==="tr"?"Her 40 adımda örnekler görünecek":"Samples will appear every 40 steps"}</p>}
                  {tSamp.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "rgba(0,0,0,.2)", borderRadius: 7 }}>
                      <div style={{ width: 34, height: 18, borderRadius: 4, background: `rgba(14,165,233,${Math.min(1, s.step / 300)})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontFamily: "'Fira Code', monospace", flexShrink: 0 }}>{s.step}</div>
                      <span style={{ fontSize: 17, fontWeight: 600, color: "#E2E8F0", fontFamily: "'Fira Code', monospace" }}>{s.name || "∅"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ARCHITECTURE TAB                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {tab === "arch" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Explainer */}
            <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 25 }}>🧠</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#8B5CF6" }}>{lang === "tr" ? "Mimari Keşfedici" : "Architecture Explorer"}</div>
                <div style={{ fontSize: 14, color: "#94A3B8" }}>{lang === "tr" ? "GPT'nin 6 temel bileşenini adım adım keşfedin. Her bileşen hem kavramsal açıklama hem de gerçek Python kodu ile sunulmuştur." : "Explore GPT's 6 core components step by step. Each component is presented with both conceptual explanation and real Python code."}</div>
              </div>
            </div>

            {/* Step tabs */}
            <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              {ARCH_STEPS.map((a, i) => (
                <button key={i} onClick={() => setArchIdx(i)} style={{ flex: 1, padding: "16px 6px 12px", border: "none", cursor: "pointer", fontFamily: "inherit", background: archIdx === i ? `${a.color}0D` : "transparent", position: "relative", transition: "all .2s" }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, margin: "0 auto 5px", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, background: archIdx === i ? a.color : "rgba(255,255,255,0.04)",
                    color: archIdx === i ? "#fff" : "#475569", transform: archIdx === i ? "scale(1.15)" : "scale(1)",
                    boxShadow: archIdx === i ? `0 4px 16px ${a.color}40` : "none", transition: "all .3s"
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: archIdx === i ? a.color : "#475569" }}>{a.title.split(" ")[0]}</div>
                  {archIdx === i && <div style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: 3, borderRadius: "3px 3px 0 0", background: a.color }} />}
                </button>
              ))}
            </div>

            {/* Content grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Explanation */}
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: `1px solid ${ARCH_STEPS[archIdx].color}20`, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: ARCH_STEPS[archIdx].color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 27, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: `0 4px 20px ${ARCH_STEPS[archIdx].color}40` }}>
                    {ARCH_STEPS[archIdx].icon}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 25, fontWeight: 800, color: ARCH_STEPS[archIdx].color }}>{ARCH_STEPS[archIdx].title}</h2>
                    <p style={{ margin: "2px 0 0", fontSize: 15, color: "#94A3B8" }}>{tx(ARCH_STEPS[archIdx].sub, lang)}</p>
                  </div>
                </div>
                <p style={{ fontSize: 17, lineHeight: 1.8, color: "#CBD5E1", margin: "0 0 16px" }}>{ARCH_STEPS[archIdx].desc}</p>
                <div style={{ background: "rgba(0,0,0,.2)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: ARCH_STEPS[archIdx].color, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>{lang==="tr"?"Detay":"Detail"}</div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "#94A3B8", margin: 0 }}>{ARCH_STEPS[archIdx].detail}</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setArchIdx(Math.max(0, archIdx - 1))} disabled={archIdx === 0} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: archIdx > 0 ? "#94A3B8" : "#1E293B", fontSize: 14, fontWeight: 600, cursor: archIdx > 0 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>←</button>
                  <button onClick={() => setArchIdx(Math.min(5, archIdx + 1))} disabled={archIdx >= 5} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: archIdx < 5 ? ARCH_STEPS[Math.min(5, archIdx + 1)].color : "#1E293B", color: "#fff", fontSize: 14, fontWeight: 600, cursor: archIdx < 5 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>→</button>
                </div>
              </div>

              {/* Code + dim flow */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <CodeBlock code={ARCH_STEPS[archIdx].code} />
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: 14 }}>
                  <div style={{ fontSize: 13, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600 }}>{lang==="tr"?"Boyut Akışı — Verinin Yolculuğu":"Dimension Flow — Data's Journey"}</div>
                  <DimFlow activeIdx={archIdx} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 28, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#1E293B" }}>{lang === 'tr' ? 'microGPT Akademi v21 — İki Dilli Sürüm' : 'microGPT Academy v21 — Bilingual Edition'}</p>
        </div>
      </div>

      <style>{`
        @keyframes popIn { from { opacity:0; transform:scale(.8) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
        input[type="range"] { -webkit-appearance:none; height:4px; border-radius:2px; background:rgba(255,255,255,.08); outline:none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#0EA5E9; cursor:pointer; }
        select { cursor:pointer; }
        select option { background:#1E293B; color:#E2E8F0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.08); border-radius:2px; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
    </LangContext.Provider>
  );
}
