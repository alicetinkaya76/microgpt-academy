import React from 'react';
import { useLang, tx } from '../../../core/i18n';

const EMBEDDED_SLIDES = {
  "week0_s0": [
    {
      title: {tr:"Dil Modeli Nedir?", en:"What is a Language Model?"},
      desc: {tr:"Bir dil modeli, verilen bir sözcük dizisinden sonra hangi sözcüğün geleceğini tahmin eden bir sistemdir. Her olası sonraki sözcüğe bir olasılık atar ve bu olasılıkları kullanarak metin üretebilir.", en:"A language model is a system that predicts which word comes next given a sequence of words. It assigns a probability to each possible next word and can generate text using these probabilities."},
      formula: "P(wₙ | w₁, w₂, ..., wₙ₋₁)",
      example: { input: {tr:"Bugün hava çok ___", en:"Today the weather is very ___"}, output: {tr:"güzel (%40)  sıcak (%25)  soğuk (%15)  kötü (%10)  ...", en:"nice (40%)  hot (25%)  cold (15%)  bad (10%)  ..."} },
      code: "logits = self.head(x)        # her token için skor\nprobs = F.softmax(logits, dim=-1)  # olasılık dağılımı",
      keyPoint: {tr:"N-gram modeli sadece son 2-3 sözcüğe bakar. BDM (GPT, Claude) TÜM önceki sözcüklere bakar — bu yüzden çok daha güçlü.", en:"N-gram models only look at the last 2-3 words. LLMs (GPT, Claude) look at ALL previous words — that's why they're much more powerful."},
    },
    {
      title: {tr:"BDM'ler Nasıl Çalışır?", en:"How Do LLMs Work?"},
      desc: {tr:"Büyük dil modelleri, muazzam miktarda metin üzerinde 'sonraki sözcüğü tahmin et' görevi ile eğitilir. Bu basit görevle dil yapısını, dünya bilgisini ve akıl yürütmeyi öğrenirler.", en:"Large language models are trained on massive amounts of text with the task of 'predict the next word'. Through this simple task they learn language structure, world knowledge, and reasoning."},
      example: { input: {tr:"The water of Walden Pond is beautifully ___", en:"The water of Walden Pond is beautifully ___"}, output: {tr:"blue (%32)  clear (%28)  green (%18)  cold (%8)  ...", en:"blue (32%)  clear (28%)  green (18%)  cold (8%)  ..."} },
      keyPoint: {tr:"Eğitim = sonraki sözcüğü tahmin et. Bu kadar basit ama bu kadar güçlü.", en:"Training = predict the next word. That simple, yet that powerful."},
    },
  ],
  "week0_s1": [
    {
      title: {tr:"Sinir Ağı Birimi: Ağırlıklı Toplam + Aktivasyon", en:"Neural Network Unit: Weighted Sum + Activation"},
      desc: {tr:"Yapay sinir ağının temel birimi çok basittir: girdilerin ağırlıklı toplamını al, bir yanlılık (bias) ekle, sonra doğrusal olmayan bir fonksiyondan geçir.", en:"The basic unit of a neural network is very simple: take the weighted sum of inputs, add a bias, then pass through a nonlinear function."},
      formula: "y = f(w₁x₁ + w₂x₂ + ... + wₙxₙ + b) = f(w·x + b)",
      example: { input: {tr:"Girdiler: x₁=0.5, x₂=0.8 | Ağırlıklar: w₁=0.3, w₂=0.7", en:"Inputs: x₁=0.5, x₂=0.8 | Weights: w₁=0.3, w₂=0.7"}, output: {tr:"z = 0.3×0.5 + 0.7×0.8 + b = 0.71 + b → y = σ(z)", en:"z = 0.3×0.5 + 0.7×0.8 + b = 0.71 + b → y = σ(z)"} },
      code: "# PyTorch'ta bir sinir birimi:\ny = torch.sigmoid(w @ x + b)",
      keyPoint: {tr:"Ağırlıklar her girdinin ne kadar önemli olduğunu belirler. Eğitim = bu ağırlıkları ayarlamak.", en:"Weights determine how important each input is. Training = adjusting these weights."},
    },
  ],
  "week0_s2": [
    {
      title: {tr:"Dil Modeli: Olasılık Dağılımı", en:"Language Model: Probability Distribution"},
      desc: {tr:"Dil modeli, önceki sözcükler verildiğinde sonraki sözcük üzerinde bir olasılık dağılımı verir. Bunu tekrarlayarak cümle, paragraf, hatta kitap üretebilir.", en:"A language model defines a probability distribution over the next word given previous words. This distribution is the model's 'opinion' about what might come next."},
      formula: "P(w₁w₂...wₙ) = P(w₁) × P(w₂|w₁) × P(w₃|w₁w₂) × ...",
      example: { input: {tr:"Ben okula ___", en:"I went to school ___"}, output: {tr:"gidiyorum (%45)  gittim (%20)  gitmek (%15)  ...", en:"will go (45%)  went (20%)  want to go (15%)  ..."} },
      code: "# microGPT üretim döngüsü:\nfor _ in range(max_new_tokens):\n    logits = model(context)\n    probs = F.softmax(logits[:,-1,:], dim=-1)\n    next_token = torch.multinomial(probs, 1)",
      keyPoint: {tr:"Dil modeli = koşullu olasılık makinesi. Kelime kelime tahmin ederek metin üretir.", en:"Language model = conditional probability machine. It generates text by predicting word by word."},
    },
  ],
  "week0_s3": [
    {
      title: {tr:"Canlı Pipeline: Girdi → Çıktı", en:"Live Pipeline: Input → Output"},
      desc: {tr:"microGPT tam bir dil modeli pipeline'ı uygular: metin girişi → tokenization → embedding → transformer → olasılık → örnekleme → çıktı metni.", en:"microGPT implements a complete language model pipeline: text input → tokenization → embedding → attention → MLP → output probabilities → text output."},
      example: { input: {tr:"microGPT girdi: 'Ah'", en:"microGPT input: 'Ah'"}, output: {tr:"Token ID: [15] → Embedding → Transformer → 'Ahmet' (%30), 'Ahmed' (%25)...", en:"Token ID: [15] → Embedding → Transformer → 'Ahmet' (30%), 'Ahmed' (25%)..."} },
      code: "# 243 satırlık tam pipeline:\nencode → wte + wpe → attention → mlp → lm_head → softmax → decode",
      keyPoint: {tr:"GPT-4 ile microGPT aynı algoritmayı kullanır. Fark sadece ölçek: 3,648 vs ~1.8 trilyon parametre.", en:"GPT-4 and microGPT use the same algorithm. The only difference is scale: 3,648 vs ~1.8 trillion parameters."},
    },
  ],
  "week0_s4": [
    {
      title: {tr:"XOR: Tek Katman Neden Yetmez?", en:"XOR: Why One Layer Isn't Enough?"},
      desc: {tr:"Minsky ve Papert (1969) gösterdi ki tek katmanlı ağ (perceptron) XOR gibi basit problemleri bile çözemez. Doğrusal olarak ayrılamayan veriler için gizli katman gerekir.", en:"XOR is the simplest problem that a single-layer neural network cannot solve. Proving that depth (hidden layers) is essential."},
      formula: "XOR(0,0)=0  XOR(0,1)=1  XOR(1,0)=1  XOR(1,1)=0",
      example: { input: {tr:"AND: tek çizgiyle ayrılır ✅ | XOR: tek çizgiyle AYRILAMAZ ❌", en:"AND: separable by one line ✅ | XOR: NOT separable by one line ❌"}, output: {tr:"Çözüm: 2 katman → ilk katman ara özellikler üretir, ikinci katman bunları birleştirir", en:"Solution: 2 layers → first layer creates intermediate features, second combines them"} },
      keyPoint: {tr:"Gizli katman = temsil gücü. Bu yüzden 'derin' öğrenme diyoruz — derinlik karmaşık fonksiyonları mümkün kılar.", en:"Hidden layers = representational power. That's why we say 'deep' learning — depth makes complex functions possible."},
    },
  ],
  "week0_s5": [
    {
      title: {tr:"Ön Koşullar: Python & PyTorch Temelleri", en:"Prerequisites: Python & PyTorch Basics"},
      desc: {tr:"microGPT'yi anlamak için temel Python ve PyTorch bilgisi yeterli. Karmaşık matematik yerine, kodun her satırının ne yaptığını sezgisel olarak kavramak önemli.", en:"Core prerequisites for understanding this course: Python variables, loops, functions, and basic PyTorch concepts."},
      example: { input: {tr:"Gereken: Python değişkenler, döngüler, fonksiyonlar", en:"Required: Python variables, loops, functions"}, output: {tr:"PyTorch: tensor, matmul, nn.Module, backward()", en:"PyTorch: tensor, matmul, nn.Module, backward()"} },
      code: "import torch\nimport torch.nn as nn\n# Bu iki import ile microGPT yazılabilir",
      keyPoint: {tr:"Derin öğrenme korkutucu değil — microGPT'nin 243 satırı bunu kanıtlıyor.", en:"Deep learning isn't scary — microGPT's 243 lines prove it."},
    },
  ],
  "week0_s6": [
    {
      title: {tr:"BDM Metin Üretim Döngüsü", en:"LLM Text Generation Loop"},
      desc: {tr:"Metin üretimi otoregresif bir döngüdür: her adımda model bir token üretir, bu token girdiye eklenir ve sonraki token için tekrar model çalıştırılır.", en:"LLM text generation works step by step: predict the next token, sample from the distribution, add to context, repeat until a stop signal."},
      example: { input: {tr:"Başlangıç: [BOS] 'Merhaba'", en:"Start: [BOS] 'Hello'"}, output: {tr:"Adım 1: → 'ben' | Adım 2: → 'Ali' | Adım 3: → [EOS] | Sonuç: 'Merhaba ben Ali'", en:"Step 1: → 'I' | Step 2: → 'am' | Step 3: → [EOS] | Result: 'Hello I am'"} },
      code: "# microGPT generate() döngüsü:\ncontext = seed_tokens\nfor _ in range(max_tokens):\n    next_tok = model.predict(context)\n    context = torch.cat([context, next_tok])",
      keyPoint: {tr:"Üretim = tekrarlı tahmin. Her token önceki tüm tokenlara koşullu.", en:"Generation = repeated prediction. Each token is conditioned on all previous tokens."},
    },
  ],
  "week0_s7": [
    {
      title: {tr:"7 Parametre: microGPT Kontrol Paneli", en:"7 Parameters: microGPT Control Panel"},
      desc: {tr:"microGPT'nin davranışı 7 parametreyle kontrol edilir. Her birini değiştirmek modelin kapasitesini, hızını ve çıktı kalitesini doğrudan etkiler.", en:"These 7 parameters fully determine the model's architecture and training. Changing any one can dramatically affect the model's behavior."},
      example: { input: {tr:"vocab=27, d=16, heads=4, layers=1, block=8", en:"n_embd=16 → n_embd=32"}, output: {tr:"Toplam: 3,648 parametre → CPU'da 30 saniyede eğitilir", en:"Params: 3648 → 12544 (+244%). Memory: 15KB → 50KB. Growth is QUADRATIC!"} },
      code: "n_embd = 16       # embedding boyutu (d)\nn_head = 4        # dikkat başlığı sayısı\nn_layer = 1       # transformer katman sayısı\nblock_size = 8    # bağlam penceresi\nvocab_size = 27   # a-z + boşluk",
      keyPoint: {tr:"GPT-4: d=12288, heads=128, layers=120+. microGPT ile AYNI yapı — sadece sayıları büyüt!", en:"n_embd controls capacity, block_size controls memory, learning_rate controls training speed. Balance is everything."},
    },
  ],
  "week0_s8": [
    {
      title: { tr: "Kendi Verinizi Kullanma", en: "Using Your Own Data" },
      desc: {tr:"microGPT herhangi bir metin verisiyle eğitilebilir. Varsayılan Türk isimleri yerine şiir, kod veya başka bir dil kullanılabilir.", en:"You can train the model on any text file by changing `input.txt`. Turkish names, city names, animal names — the model adapts to any character distribution."},
      example: { input: {tr:"Veri: 'ali\\nmehmet\\nayşe\\n...' (Türk isimleri)", en:"input.txt: 'ali\nveli\nayse\n...'"}, output: {tr:"Model öğrenir: Türk isim kalıpları, yaygın hece yapıları, isim uzunlukları", en:"The model adapts to Turkish character distribution: ş, ç, ö, ü, ğ, ı"} },
      keyPoint: {tr:"Veri modelin 'dünyası'dır. Ne verirseniz onu öğrenir.", en:"The model discovers patterns on its own. You just provide the data — the learning is automatic."},
    },
  ],
  "week0_s9": [
    {
      title: {tr:"Eğitim Evrimi: Rastgeleden Anlama", en:"Training Evolution: From Random to Understanding"},
      desc: {tr:"Eğitimin başında model tamamen rastgele tahmin yapar. Zaman içinde önce sık harfleri, sonra hece kalıplarını, sonunda gerçek isimlere benzeyen yapıları öğrenir.", en:"Training starts from random guessing (loss ≈ 3.33) and gradually decreases. Each decrease means the model has learned another pattern from the data."},
      example: { input: {tr:"Adım 0: 'xqzpwm' (rastgele) → Adım 100: 'aeiou' (sesli harfler)", en:"Start loss: 3.33 (random)"}, output: {tr:"Adım 500: 'meher' (hece yapısı) → Adım 1000: 'mehmet' (gerçek isim!)", en:"Step 100: 2.8 | Step 300: 2.2 | Step 500: 2.0 → Model is learning!"} },
      keyPoint: {tr:"Loss eğrisi düşerken model öğreniyor. Loss platoya ulaşınca model artık iyileşmiyor.", en:"Loss decrease = the model is learning patterns. If it stalls, try adjusting learning rate or model size."},
    },
  ],
  "week0_s10": [
    {
      title: {tr:"GPT Ailesi: microGPT → GPT-4", en:"GPT Family: microGPT → GPT-4"},
      desc: {tr:"microGPT'den GPT-4'e giden yol, aynı algoritmanın ölçeklenmesidir. Daha fazla parametre + daha fazla veri + daha fazla hesaplama = daha iyi performans.", en:"microGPT and GPT-4 share the exact same core algorithm: embedding → attention → MLP → output. The only difference is scale."},
      formula: "Loss ∝ N⁻⁰·⁰⁷⁶ × D⁻⁰·⁰⁹⁵ × C⁻⁰·⁰⁵⁰",
      example: { input: {tr:"microGPT: d=16, 1 katman → 3,648 param", en:"microGPT: 243 lines, 3648 params"}, output: {tr:"GPT-3: d=12288, 96 katman → 175,000,000,000 param (10⁸ kat!)", en:"GPT-4: ~1T+ params, 128K context. Same DNA: attn+MLP+residual+norm"} },
      keyPoint: {tr:"Aynı algoritma, 10⁸ kat parametre farkı. Ölçekleme yasaları bunu öngörülebilir kılıyor.", en:"Core mechanism is always the same: attention + MLP + residual + norm + CE + backprop + Adam."},
    },
  ],
  "week1_s0": [
    {
      title: {tr:"Sözcük Sayma Problemi", en:"Word Counting Problem"},
      desc: {tr:"Bir cümledeki sözcük sayısını belirlemek bile zordur. Noktalama sayılır mı? Kısaltmalar? Birleşik sözcükler? Her dil farklı kurallar gerektirir.", en:"Tokenizer converts text into numbers: each character gets a unique ID. 'hello' → [BOS, h=8, e=5, l=12, l=12, o=15, BOS]. This is the first step of the pipeline."},
      example: { input: {tr:"They picnicked by the pool, then lay back on the grass.", en:"'anna' → characters"}, output: {tr:"16 sözcük (noktalama hariç) / 18 sözcük (noktalama dahil) — hangisi doğru?", en:"a n n a → [2, 15, 15, 2] → +BOS → [0, 2, 15, 15, 2, 0]"} },
      keyPoint: {tr:"Tür (type): benzersiz sözcük ('the' 1 kez sayılır). Örnek (token): her geçiş ('the' 3 kez sayılır).", en:"Tokenization is the bridge between human text and machine numbers. Every NLP system starts here."},
    },
    {
      title: {tr:"BPE: Alt Sözcük Tokenization", en:"BPE: Subword Tokenization"},
      desc: {tr:"Byte Pair Encoding, sözcükleri daha küçük alt birimlere ayırır. En sık komşu karakter çiftlerini tekrar tekrar birleştirerek bir sözcük dağarcığı oluşturur.", en:"Character-level tokenization treats each letter as a separate token. Simple and transparent. Modern models use subword tokenization (BPE) for efficiency."},
      formula: "Tekrarla: en sık (A,B) çiftini bul → 'AB' olarak birleştir → k kez",
      example: { input: {tr:"'newer' → BPE → ['new', 'er']", en:"'hello' → BPE tokens"}, output: {tr:"'lowest' → ['low', 'est']   Sistem ek yapısını keşfetti!", en:"hel·lo → [258, 30] (2 tokens instead of 5)"} },
      code: "# BPE öğrenici pseudocode:\nvocab = tüm_karakterler\nfor i in range(k):\n    pair = en_sık_komşu_çift(corpus)\n    vocab.add(merge(pair))\n    corpus = replace_all(corpus, pair)",
      keyPoint: {tr:"BPE, bilinmeyen sözcük sorununu çözer: her sözcük alt parçalara ayrılabilir.", en:"Character-level: simple, small vocab (27). BPE: efficient, large vocab (50K+). Each has trade-offs."},
    },
  ],
  "week1_s1": [
    {
      title: {tr:"Token, Vocab, Logit — Temel Kavramlar", en:"Token, Vocab, Logit — Core Concepts"},
      desc: {tr:"Token metnin en küçük birimidir. Vocab tüm olası tokenlerin listesidir. Logit modelin her token için ürettiği ham skordur.", en:"The stoi (string-to-integer) and itos (integer-to-string) dictionaries form the core of our tokenizer. Simple but complete."},
      formula: "metin → tokenizer → [id₁, id₂, ...] → model → logits [1×|V|] → softmax → olasılıklar",
      example: { input: {tr:"microGPT vocab: a-z + boşluk = 27 token", en:"stoi={'a':1, 'b':2, ...}"}, output: {tr:"GPT-4 vocab: ~100,000 token (tiktoken cl100k_base)", en:"encode('cat') → [3, 1, 20] | decode([3,1,20]) → 'cat'"} },
      code: "# microGPT encode/decode:\nstoi = {ch:i for i,ch in enumerate(chars)}  # 'a'→0, 'b'→1, ...\nencode = lambda s: [stoi[c] for c in s]\ndecode = lambda l: ''.join(itos[i] for i in l)",
      keyPoint: {tr:"Vocab büyüklüğü = modelin 'alfabe'si. Küçük vocab → uzun diziler. Büyük vocab → kısa diziler ama daha fazla parametre.", en:"With just 10 lines of code, we have a complete tokenizer. Simplicity is the point."},
    },
  ],
  "week1_s2": [
    {
      title: {tr:"Token Embedding: ID → Vektör", en:"Token Embedding: ID → Vector"},
      desc: {tr:"Her token ID'si, bir embedding matrisinden karşılık gelen satır vektörünü seçer. Bu vektör tokenin anlamını temsil eden sayısal bir koddur.", en:"A token ID is just a number — it says nothing about meaning. Embedding converts this ID into a high-dimensional vector that can encode semantic relationships."},
      formula: "x = E[token_id]    E boyutu: [|V| × d]",
      example: { input: {tr:"token_id = 5 ('f'), d = 16", en:"Token ID 5 ('e') → Embedding"}, output: {tr:"x = E[5] = [0.12, -0.34, 0.78, ...] (16 boyutlu vektör)", en:"[0.02, -0.01, 0.03, ...] (16-dimensional learned vector)"} },
      code: "# microGPT embedding:\nself.wte = nn.Embedding(vocab_size, n_embd)  # [27 × 16]\ntok_emb = self.wte(token_ids)  # [batch, seq_len, 16]",
      keyPoint: {tr:"Embedding = arama tablosu. Eğitimle bu vektörler anlamlı hale gelir: benzer tokenlar yakın vektörler alır.", en:"Embedding = learned representation. Similar tokens end up with similar vectors — this emerges from training."},
    },
  ],
  "week1_s3": [
    {
      title: {tr:"Vektör: Sayı Listesi ile Anlam Temsili", en:"Vector: Representing Meaning with Number Lists"},
      desc: {tr:"Bir vektör, sabit uzunlukta bir sayı listesidir. Sözcükleri vektörlerle temsil etmek, bilgisayarın anlam üzerinde matematik yapmasını sağlar.", en:"Position embedding tells the model WHERE each token is in the sequence. Without it, 'AB' and 'BA' would look identical to the model."},
      formula: "king - man + woman ≈ queen",
      example: { input: {tr:"kedi = [0.2, 0.8, -0.1, 0.5]", en:"Token 'h' at position 3"}, output: {tr:"köpek = [0.3, 0.7, -0.2, 0.4]  → çok yakın! (ikisi de evcil hayvan)", en:"tok_emb + pos_emb[3] = final vector with position info"} },
      keyPoint: {tr:"Vektör uzayında yakın = anlamca benzer. Bu basit fikir tüm modern NLP'nin temelidir.", en:"Without position info, the model sees a 'bag of tokens' — order matters in language!"},
    },
  ],
  "week1_s4": [
    {
      title: {tr:"Token Embedding: Tablodaki Satırı Seç", en:"Token Embedding: Select Row from Table"},
      desc: {tr:"Embedding matrisi |V|×d boyutlu bir tablodur. Token ID bu tablodaki satır numarasıdır. İleri geçişte sadece bir satır seçilir — hesaplama çok hızlıdır.", en:"Softmax converts raw scores (logits) into probabilities that sum to 1. The max-subtraction trick prevents numerical overflow."},
      formula: "E ∈ ℝ^{|V|×d}    x_i = E[token_i]",
      example: { input: {tr:"'merhaba' → BPE → [312, 4521, 89]", en:"Logits: [2.0, 1.0, 0.1]"}, output: {tr:"x₁ = E[312], x₂ = E[4521], x₃ = E[89]  (her biri d boyutlu)", en:"softmax → [0.71, 0.26, 0.03] (sums to 1.0)"} },
      code: "# Embedding lookup = matrix indexing:\ntok_emb = self.wte(idx)  # idx: [B, T] → tok_emb: [B, T, d]",
      keyPoint: {tr:"Embedding başlangıçta rastgele. Eğitimle anlamlı hale gelir — benzer tokenlar yakınlaşır.", en:"max-subtraction trick: exp(1000)=∞ → exp(1000-1000)=1 ✓. Numerical stability is critical."},
    },
  ],
  "week1_s5": [
    {
      title: {tr:"Position Embedding: Sıra Bilgisi", en:"Position Embedding: Order Information"},
      desc: {tr:"Dikkat mekanizması sıra-bağımsızdır — 'Ali Ayşe'yi sevdi' ile 'Ayşe Ali'yi sevdi' aynı görünür! Konum gömmeleri her pozisyona ayrı bir vektör ekleyerek sıra bilgisi verir.", en:"In embedding space, tokens with similar usage patterns end up close together. This emergent structure is learned entirely from data."},
      formula: "x_i = wte[token_i] + wpe[pozisyon_i]",
      example: { input: {tr:"'kedi uyur' → token_emb: [E[kedi], E[uyur]]", en:"'king'-'man'+'woman' = ?"}, output: {tr:"pos_emb: [P[0], P[1]] → final: [E[kedi]+P[0], E[uyur]+P[1]]", en:"'queen' ✓ (directions in embedding space encode relationships)"} },
      code: "self.wpe = nn.Embedding(block_size, n_embd)  # [8 × 16]\npos_emb = self.wpe(torch.arange(T))  # pozisyon 0,1,2,...\nx = tok_emb + pos_emb  # toplam: token + pozisyon",
      keyPoint: {tr:"Embedding = token kimliği + pozisyon bilgisi. İkisinin TOPLAMI modelin girdisidir.", en:"Embedding space structure is NOT designed — it EMERGES from training data. This is the beauty of learning."},
    },
  ],
  "week1_s6": [
    {
      title: {tr:"Matris Çarpımı: Linear Transform", en:"Matrix Multiplication: Linear Transform"},
      desc: {tr:"Sinir ağlarının temel işlemi matris çarpımıdır. Bir vektörü bir matrisle çarpmak, onu yeni bir uzaya yansıtır (projeksiyon/dönüşüm).", en:"Vocabulary size determines embedding table rows. Embedding dimension determines the representational capacity of each token."},
      formula: "y = Wx + b    W: [çıktı_dim × girdi_dim]",
      example: { input: {tr:"x = [0.5, 0.3] (2D), W = [[0.1, 0.4], [0.7, 0.2], [0.3, 0.8]] (3×2)", en:"Vocab=27, n_embd=16"}, output: {tr:"y = Wx = [0.17, 0.41, 0.39] → 2D'den 3D'ye dönüşüm!", en:"Embedding table: 27×16 = 432 parameters"} },
      code: "# PyTorch'ta linear transform:\nself.linear = nn.Linear(n_embd, 4 * n_embd)  # d → 4d\nout = self.linear(x)  # matris çarpımı + bias",
      keyPoint: {tr:"Matris çarpımı = uzay dönüşümü. Transformer'daki her adım bir matris çarpımıdır.", en:"Larger embedding = more expressive but more parameters. This quadratic growth is the main cost driver."},
    },
  ],
  "week1_s7": [
    {
      title: {tr:"Weight Tying: Aynı Matrisi İki Kez Kullan", en:"Weight Tying: Use the Same Matrix Twice"},
      desc: {tr:"Gömme matrisi (E) tokeni vektöre çevirir. Çözme matrisi (Eᵀ) vektörü tekrar token skorlarına çevirir. Weight tying: ikisi için AYNI matrisi kullan!", en:"The full pipeline from raw text to model-ready tensors: characters → token IDs → embedding vectors → position-added vectors."},
      formula: "Embedding: x = E[token_id]    Unembedding: logits = h × Eᵀ",
      example: { input: {tr:"Vocab=27, d=16 → E boyutu: [27×16]", en:"'anna' → token IDs → embeddings"}, output: {tr:"Tying olmadan: 27×16 + 27×16 = 864 param | Tying ile: 27×16 = 432 param (-%50!)", en:"[0, 2, 15, 15, 2, 0] → 6 vectors of [16] → model input ready"} },
      code: "# microGPT weight tying:\nself.wte = nn.Embedding(V, d)      # gömme\nself.head = nn.Linear(d, V, bias=False)  # çözme\nself.head.weight = self.wte.weight  # AYNI ağırlık!",
      keyPoint: {tr:"Weight tying parametre sayısını azaltır VE performansı artırır — embedding ve unembedding tutarlı olur.", en:"From text to tensor in 3 steps: tokenize → embed → add position. Now the model can process it."},
    },
  ],
  "week1_s8": [
    {
      title: {tr:"Softmax: Skorlardan Olasılığa", en:"Softmax: From Scores to Probability"},
      desc: {tr:"Model her token için bir skor (logit) üretir. Softmax bu skorları olasılıklara çevirir: hepsi 0-1 arası, toplamı 1.", en:"The derivative measures how much a function's output changes when its input changes slightly. It's the 'sensitivity' of the function."},
      formula: "softmax(zᵢ) = exp(zᵢ) / Σⱼ exp(zⱼ)",
      example: { input: {tr:"Logits: [2.0, 1.0, 0.1] (3 token için ham skorlar)", en:"f(x) = x² at x=3"}, output: {tr:"Softmax: [0.659, 0.242, 0.099] → toplamı 1.0 ✓", en:"f'(3) = 2×3 = 6 (slope at x=3)"} },
      code: "# microGPT'de softmax:\nlogits = self.head(x)           # [B, T, V] ham skorlar\nprobs = F.softmax(logits, dim=-1)  # [B, T, V] olasılıklar\nnext_tok = torch.multinomial(probs, 1)  # örnekle",
      keyPoint: {tr:"Softmax = sigmoidin çok sınıflı genellemesi. Büyük logit → yüksek olasılık, küçük logit → düşük olasılık.", en:"Derivative = local slope. Positive = increasing, negative = decreasing, zero = flat (extremum)."},
    },
  ],
  "week2_s0": [
    {
      title: {tr:"Türev Nedir? Değişimin Ölçüsü", en:"What is a Derivative? Measure of Change"},
      desc: {tr:"Türev, bir fonksiyonun girdisi değiştiğinde çıktısının ne kadar değiştiğini söyler. Eğitimde türev bize 'ağırlığı hangi yöne değiştirmeliyim?' sorusunun cevabını verir.", en:"The chain rule lets us compute derivatives of composite functions by multiplying local derivatives along the chain."},
      formula: "f'(x) = lim[h→0] (f(x+h) - f(x)) / h",
      example: { input: {tr:"f(x) = x² → f'(x) = 2x", en:"f(g(x)), g(x)=x², f(g)=sin(g)"}, output: {tr:"x=3'te: f'(3) = 6 → 'x artarsa f(x) 6 kat hızla artar'", en:"df/dx = cos(x²) × 2x (outer × inner)"} },
      keyPoint: {tr:"Türev = eğim = değişim oranı. Eğitimde kayıp fonksiyonunun türevini alarak ağırlıkları güncelleriz.", en:"Chain rule: df/dx = df/dg × dg/dx. Multiply local derivatives along the chain."},
    },
  ],
  "week2_s1": [
    {
      title: {tr:"Kısmi Türev ve Gradient", en:"Partial Derivative and Gradient"},
      desc: {tr:"Birden fazla değişkenli fonksiyonlarda her değişkene göre ayrı türev alırız. Tüm kısmi türevleri bir araya koyunca gradient vektörü elde ederiz.", en:"The computation graph traces every operation. Forward pass computes values; backward pass propagates gradients in reverse order."},
      formula: "∇L = [∂L/∂w₁, ∂L/∂w₂, ..., ∂L/∂wₙ]",
      example: { input: {tr:"L(w₁,w₂) = w₁² + 3w₂", en:"L = (a × b) + c, a=2, b=3, c=1"}, output: {tr:"∂L/∂w₁ = 2w₁, ∂L/∂w₂ = 3 → ∇L = [2w₁, 3]", en:"Forward: L=7 | Backward: ∂L/∂a=3, ∂L/∂b=2, ∂L/∂c=1"} },
      keyPoint: {tr:"Gradient = 'kaybın en hızlı arttığı yön'. Biz TERSİ yönde gideriz → kayıp azalır.", en:"Forward = compute values. Backward = compute gradients. Same graph, opposite directions."},
    },
  ],
  "week2_s2": [
    {
      title: {tr:"Autograd: Otomatik Türev Hesaplama", en:"Autograd: Automatic Differentiation"},
      desc: {tr:"microGPT'deki autograd sistemi her matematiksel işlemi bir hesaplama grafiği olarak kaydeder. Backward pass sırasında zincir kuralıyla tüm türevleri otomatik hesaplar.", en:"Autograd automatically tracks operations and computes gradients. Every Value object stores both its data and its gradient."},
      formula: "İleri: x → z = Wx+b → h = σ(z) → L\nGeri: ∂L/∂W = (∂L/∂h)(∂h/∂z)(∂z/∂W)",
      example: { input: {tr:"a = Value(2), b = Value(3), c = a * b", en:"a = Value(2); b = Value(3); c = a * b"}, output: {tr:"c.backward() → a.grad = 3 (∂c/∂a = b), b.grad = 2 (∂c/∂b = a)", en:"c.data=6, c.grad computed automatically via backward()"} },
      code: "# microGPT Value sınıfı:\nclass Value:\n    def __init__(self, data):\n        self.data = data\n        self.grad = 0\n        self._backward = lambda: None",
      keyPoint: {tr:"Autograd = elle türev almaya gerek yok. Kod otomatik yapıyor!", en:"Autograd = automatic bookkeeping. You write the math, gradients come for free."},
    },
  ],
  "week2_s3": [
    {
      title: {tr:"Value Sınıfı: 4 Temel Bileşen", en:"Value Class: 4 Core Components"},
      desc: {tr:"Value sınıfı autograd'ın kalbidir. Her Value bir sayı tutar, gradyanını biriktirir, hesaplama grafındaki yerini bilir ve geri yayılım fonksiyonu taşır.", en:"Topological sort ensures we process nodes in the correct order during backpropagation — children before parents."},
      example: { input: {tr:"a = Value(2), b = Value(3)", en:"A→B→C→D (DAG)"}, output: {tr:"c = a + b → c.data=5, c._children={a,b}, c._backward: a.grad+=1, b.grad+=1", en:"Sorted: D→C→B→A (process sinks first)"} },
      code: "class Value:\n    self.data = 2.0         # ileri geçiş değeri\n    self.grad = 0.0         # geri geçiş gradyanı\n    self._children = set()  # graf bağlantıları\n    self._backward = fn     # geri yayılım fonksiyonu",
      keyPoint: {tr:"Her işlem (+, ×, σ) grafa bir düğüm ekler. backward() bu grafı tersten yürür.", en:"Topological sort ensures correct order: a node's gradient is only computed after all its consumers."},
    },
  ],
  "week2_s4": [
    {
      title: {tr:"Operatör Overloading: +, × Otomatik Graf", en:"Operator Overloading: +, × Automatic Graph"},
      desc: {tr:"Python'un __add__, __mul__ gibi özel metotlarını değiştirerek, normal aritmetik işlemlerle otomatik hesaplama grafı oluştururuz.", en:"Each operator (add, multiply, exp, log) has a known local gradient. The chain rule combines these to get the full gradient."},
      example: { input: {tr:"a = Value(2); b = Value(3); c = a * b", en:"z = a + b → ∂z/∂a=? ∂z/∂b=?"}, output: {tr:"c.grad=1 → a.grad += 3×1 = 3, b.grad += 2×1 = 2 ✓", en:"∂z/∂a=1, ∂z/∂b=1 (addition passes gradient through unchanged)"} },
      code: "class Value:\n    def __mul__(self, other):\n        out = Value(self.data * other.data)\n        def _backward():\n            self.grad += other.data * out.grad\n            other.grad += self.data * out.grad\n        out._backward = _backward\n        return out",
      keyPoint: {tr:"Python sihri: 'a * b' yazdığınızda hem çarpma hem de türev hesaplama kaydediliyor.", en:"Memorize 4 local gradients: add→1, mul→other, exp→self, log→1/self. Everything else follows."},
    },
  ],
  "week2_s5": [
    {
      title: {tr:"Chain Rule: İç İçe Fonksiyonların Türevi", en:"Chain Rule: Derivatives of Nested Functions"},
      desc: {tr:"Zincir kuralı, bileşik fonksiyonların türevini hesaplamanın yoludur. Backward pass tamamen zincir kuralına dayanır.", en:"When a variable is used in multiple places, its gradient is the SUM of all paths. This is why we use += not = for gradients."},
      formula: "∂L/∂x = (∂L/∂y) × (∂y/∂x) — 'dıştan içe, çarparak ilerle'",
      example: { input: {tr:"L = (a×b + c)² → dış: u², iç: a×b+c", en:"L = a × b + a × c (a used twice)"}, output: {tr:"∂L/∂a = 2(a×b+c) × b — dış türev × iç türev", en:"∂L/∂a = b + c (gradients from BOTH paths sum up)"} },
      keyPoint: {tr:"Her düğüm sadece kendi lokal türevini bilir. Zincir kuralı bunları çarparak birleştirir.", en:"grad += is the most common bug source. If a variable is used twice, its gradient must be ACCUMULATED."},
    },
  ],
  "week2_s6": [
    {
      title: {tr:"Somut Örnek: L = (a × b) + c", en:"Concrete Example: L = (a × b) + c"},
      desc: {tr:"Basit bir hesaplama grafında ileri ve geri geçişi adım adım izleyelim.", en:"Gradient is the multi-dimensional generalization of the derivative. It points in the direction of steepest increase."},
      formula: "∂L/∂a = ∂L/∂d × ∂d/∂a = 1 × b = 3",
      example: { input: {tr:"a=2, b=3, c=4 → d=a×b=6 → L=d+c=10", en:"f(x,y) = x²y + y³"}, output: {tr:"Geri: ∂L/∂L=1 → ∂L/∂d=1, ∂L/∂c=1 → ∂L/∂a=b=3, ∂L/∂b=a=2", en:"∇f = [2xy, x²+3y²] = gradient vector (all partial derivatives)"} },
      keyPoint: {tr:"Geri yayılım = 'kayıptaki 1 birimlik değişim, her parametreyi ne kadar etkiler?'", en:"Gradient points uphill. We go OPPOSITE to gradient (gradient descent) to minimize loss."},
    },
  ],
  "week2_s7": [
    {
      title: {tr:"Gradient Toplanması: += Neden Kritik?", en:"Gradient Accumulation: Why += Is Critical?"},
      desc: {tr:"Bir değişken birden fazla yerde kullanılırsa, gradyanları TOPLANMALIDIR. Bu çok önemli bir detaydır — unutulursa gradyanlar kaybolur.", en:"Numerical gradient (finite differences) is slow but reliable. We use it to verify our autograd implementation is correct."},
      formula: "Eğer x, f(x) ve g(x)'te kullanılıyorsa: ∂L/∂x = ∂L/∂f × ∂f/∂x + ∂L/∂g × ∂g/∂x",
      example: { input: {tr:"a=2 → b=a+a=4 (a iki kez kullanıldı)", en:"f(x) = x³, numerical vs autograd"}, output: {tr:"∂b/∂a = 1 + 1 = 2 (toplama!) — a.grad += 1; a.grad += 1", en:"Numerical: (f(3.001)-f(2.999))/0.002=27.0 | Autograd: 27.0 ✓"} },
      code: "# DOĞRU: gradyan biriktir\nself.grad += local_grad * out.grad\n# YANLIŞ: gradyan üzerine yaz\nself.grad = local_grad * out.grad  # ❌ önceki kaybolur!",
      keyPoint: {tr:"grad += (topla), grad = (üzerine yaz) DEĞİL. Bu tek karakter farkı her şeyi değiştirir.", en:"If autograd gradient ≈ numerical gradient (within 1e-5), the implementation is correct."},
    },
  ],
  "week2_s8": [
    {
      title: {tr:"Bizim Autograd vs PyTorch", en:"Our Autograd vs PyTorch"},
      desc: {tr:"microGPT'deki autograd, PyTorch'un torch.autograd modülünün basitleştirilmiş versiyonudur. Aynı prensip: hesaplama grafı + zincir kuralı + backward pass.", en:"Dot product measures how similar two vectors are. High value = similar direction. This is the foundation of attention."},
      example: { input: {tr:"Bizim Value: Python, CPU, eğitim amaçlı, ~50 satır", en:"a=[1,2,3], b=[4,5,6]"}, output: {tr:"PyTorch Tensor: C++/CUDA, GPU, üretim, milyonlarca satır", en:"a·b = 1×4 + 2×5 + 3×6 = 32"} },
      code: "# PyTorch eşdeğeri:\nx = torch.tensor(2.0, requires_grad=True)\ny = x ** 2 + 3 * x\ny.backward()\nprint(x.grad)  # 7.0 (= 2*2 + 3)",
      keyPoint: {tr:"Mekanizma aynı, ölçek farklı. Anlamak için basitini yaz, kullanmak için PyTorch kullan.", en:"Dot product: positive = similar direction, zero = orthogonal, negative = opposite. This is how attention measures relevance."},
    },
  ],
  "week3_s0": [
    {
      title: {tr:"RNN'den Attention'a: Neden Yeni Mimari?", en:"From RNN to Attention: Why a New Architecture?"},
      desc: {tr:"RNN sözcükleri sırayla işler ve bilgiyi bir gizli durumda taşır. Uzun cümlelerde erken sözcüklerin bilgisi kaybolur. Dikkat mekanizması her sözcüğün doğrudan her diğer sözcüğe bakmasını sağlar.", en:"Self-attention allows each token to dynamically decide how much information to gather from every other token in the sequence."},
      example: { input: {tr:"RNN: 'Ali okula gitti çünkü ___' → 'Ali' bilgisi 4 adım uzakta, zayıflamış", en:"Token 'the': attends to all previous tokens"}, output: {tr:"Attention: her sözcük doğrudan 'Ali'ye bakabilir → bilgi kaybı yok", en:"Attention weights: [0.05, 0.15, 0.8] → mostly attends to most relevant token"} },
      keyPoint: {tr:"RNN = sıralı boru hattı (bilgi kaybolur). Attention = herkes herkesi görür (bilgi korunur).", en:"Self-attention is 'learned communication'. Each token learns WHO to listen to and HOW MUCH."},
    },
  ],
  "week3_s1": [
    {
      title: {tr:"Self-Attention: Bağlamsal Anlam", en:"Self-Attention: Contextual Meaning"},
      desc: {tr:"Aynı sözcük farklı cümlelerde farklı anlam taşır. Self-attention, her sözcüğün temsilini bağlamdaki diğer sözcüklerin bilgisiyle zenginleştirir.", en:"Query = what I'm looking for. Key = what I have to offer. Value = the actual information. Q·K determines relevance, V provides content."},
      example: { input: {tr:"'bank' → 'river bank' (nehir kıyısı) vs 'bank account' (banka)", en:"Q='history of AI', K₁='AI textbook', K₂='cooking recipes'"}, output: {tr:"Attention sonrası: 'bank' vektörü iki cümlede FARKLI olur", en:"Q·K₁=0.92 (high, relevant!) Q·K₂=0.11 (low, irrelevant)"} },
      code: "# Sezgi: her token komşularına sorar 'bana ne bilgi verebilirsin?'\n# ve cevapları ağırlıklı olarak toplar\nattention_output = weighted_sum(values, attention_weights)",
      keyPoint: {tr:"Statik embedding: 'bank' her yerde aynı. Attention sonrası: bağlama göre farklılaşır.", en:"Q·K = relevance score. High score → take more from that token's V. This is information routing."},
    },
  ],
  "week3_s2": [
    {
      title: {tr:"Query, Key, Value: 3 Farklı Rol", en:"Query, Key, Value: 3 Different Roles"},
      desc: {tr:"Her token 3 farklı role bürünür: Query (ne arıyorum?), Key (bende ne var?), Value (işte bilgim). Bu kütüphanede kitap aramaya benzer.", en:"Scaling by √d prevents attention scores from becoming too large, which would make softmax output nearly one-hot (too confident)."},
      formula: "Q = XWq    K = XWk    V = XWv",
      example: { input: {tr:"Siz (Q): 'Fizik kitabı arıyorum'", en:"d=16, Q·K=32 → 32/√16 = 8"}, output: {tr:"Raf etiketleri (K): 'Fizik', 'Tarih', 'Roman' → Fizik uyuşur → O kitabın içeriği (V) verilir", en:"Softmax(8) is sharper than softmax(32) → more focused attention"} },
      code: "# microGPT Q, K, V hesaplama:\nq = x @ self.Wq  # [B, T, d] → [B, T, head_dim]\nk = x @ self.Wk\nv = x @ self.Wv",
      keyPoint: {tr:"Q·K = 'ne kadar ilgili?' skoru. Bu skor V'lerin ağırlığını belirler.", en:"Without scaling by √d, large dimensions cause softmax to saturate → vanishing gradients."},
    },
  ],
  "week3_s3": [
    {
      title: {tr:"Dikkat Kalıpları: Her Head Ne Öğrenir?", en:"Attention Patterns: What Each Head Learns?"},
      desc: {tr:"Multi-head attention'da her başlık farklı ilişki türlerini öğrenir. Bir başlık sözdizimi, diğeri anlam, bir diğeri pozisyon ilişkilerini yakalayabilir.", en:"Multiple heads let the model attend to different aspects simultaneously: one head for syntax, another for semantics, etc."},
      example: { input: {tr:"Head 1: 'kedi → uyuyor' (özne-yüklem)", en:"4 heads, each 4-dim (total 16-dim)"}, output: {tr:"Head 2: 'büyük → kedi' (sıfat-isim) | Head 3: her token → bir önceki token (pozisyon)", en:"Head0: q[0:4], Head1: q[4:8], Head2: q[8:12], Head3: q[12:16]"} },
      code: "# microGPT: 4 head, her biri d/4 = 4 boyutlu\n# Her head ayrı bir 'bakış açısı'",
      keyPoint: {tr:"4 head = 4 farklı bakış açısı. GPT-3'te 96 head → çok zengin ilişki ağı.", en:"4 heads × 4 dims = 16 dims total. Each head specializes, then results are concatenated."},
    },
  ],
  "week3_s4": [
    {
      title: {tr:"Scaled Dot-Product: Tam Hesaplama", en:"Scaled Dot-Product: Full Computation"},
      desc: {tr:"Dikkat skoru, sorgu ile anahtarın nokta çarpımıdır. √d ile bölme, büyük boyutlarda gradyanları stabilize eder.", en:"The causal mask ensures token at position i can only attend to positions 0..i. This prevents information leakage from the future."},
      formula: "Attention(Q,K,V) = softmax(QKᵀ / √d) × V",
      example: { input: {tr:"Q=[1,0], K₁=[1,0], K₂=[0,1]", en:"Sequence: 'a b c d', token 'c' (pos 2)"}, output: {tr:"Q·K₁=1 (yüksek benzerlik), Q·K₂=0 (düşük) → Token 1'e daha çok dikkat", en:"Can see: 'a'(0), 'b'(1), 'c'(2) ✓ | Cannot see: 'd'(3) ✗"} },
      code: "# microGPT attention:\natt = (q @ k.transpose(-2,-1)) * (1.0 / math.sqrt(k.size(-1)))\natt = att.masked_fill(self.mask[:,:,:T,:T] == 0, float('-inf'))\natt = F.softmax(att, dim=-1)\nout = att @ v  # ağırlıklı toplam",
      keyPoint: {tr:"QKᵀ = benzerlik matrisi [T×T]. Softmax → olasılık. V ile çarp → ağırlıklı bilgi.", en:"Causal mask: during training, the model must learn to predict without seeing the answer."},
    },
  ],
  "week3_s5": [
    {
      title: {tr:"Dot Product: Benzerlik Ölçümü", en:"Dot Product: Similarity Measurement"},
      desc: {tr:"İki vektörün nokta çarpımı, onların ne kadar 'aynı yöne baktığını' ölçer. Dikkat mekanizmasının benzerlik hesaplamasının temelidir.", en:"Attention output is a weighted combination of Value vectors, where weights come from the Query-Key compatibility scores."},
      formula: "a·b = Σᵢ aᵢbᵢ = |a||b|cos(θ)",
      example: { input: {tr:"a=[1,0,0], b=[1,0,0] → a·b = 1 (aynı yön)", en:"Attention weights: [0.1, 0.3, 0.6] × Values"}, output: {tr:"a=[1,0,0], b=[0,1,0] → a·b = 0 (dik, ilişkisiz)", en:"Output = 0.1×V₁ + 0.3×V₂ + 0.6×V₃ (weighted combination)"} },
      keyPoint: {tr:"Dot product > 0: benzer yön. = 0: ilişkisiz. < 0: zıt yön.", en:"Attention = dynamic, learned, weighted averaging. Fixed rules can't compete with this flexibility."},
    },
  ],
  "week3_s6": [
    {
      title: {tr:"Multi-Head & Causal Masking", en:"Multi-Head & Causal Masking"},
      desc: {tr:"Çok başlıklı dikkat: aynı girdiyi farklı açılardan analiz et. Causal mask: otoregresif üretimde geleceği görmesini engelle.", en:"Attention replaces hard-coded rules with learned, dynamic, context-dependent information routing between tokens."},
      formula: "MultiHead = Concat(head₁, ..., headₕ) × Wₒ\nher headᵢ = Attention(QWqᵢ, KWkᵢ, VWvᵢ)",
      example: { input: {tr:"'Ali okula gitti' — 'gitti' tokenı için mask:", en:"From fixed rules → learned attention weights"}, output: {tr:"'Ali' ✓  'okula' ✓  'gitti' ✓  [gelecek tokenlar] ✗ (maskelenmiş)", en:"Model learns: 'after vowels, attend more to consonants' (discovered, not programmed)"} },
      code: "# Causal mask: üst üçgen = -∞\nmask = torch.tril(torch.ones(T, T))  # alt üçgen\natt = att.masked_fill(mask == 0, float('-inf'))\n# softmax(-∞) = 0 → gelecek görünmez",
      keyPoint: {tr:"Multi-head = paralel bakış açıları. Causal mask = 'geleceği bilemezsin' kuralı.", en:"Attention replaced hand-crafted features with learned representations. This is why Transformers won."},
    },
  ],
  "week3_s7": [
    {
      title: {tr:"Attention Çıktısı & Projeksiyon", en:"Attention Output & Projection"},
      desc: {tr:"Dikkat mekanizmasının çıktısı, value vektörlerinin ağırlıklı toplamıdır. Son bir lineer projeksiyon tüm head'lerin çıktılarını birleştirir.", en:"The complete attention mechanism in just 12 lines of code. Each line maps directly to a mathematical operation."},
      formula: "aᵢ = Σⱼ αᵢⱼ × vⱼ    (αᵢⱼ = softmax(qᵢ·kⱼ/√d))",
      example: { input: {tr:"α = [0.7, 0.2, 0.1] (3 tokena dikkat ağırlıkları)", en:"x[T,16] → Q,K,V → attention → output"}, output: {tr:"çıktı = 0.7×v₁ + 0.2×v₂ + 0.1×v₃ → bağlamsal temsil", en:"Q=Wq·x, K=Wk·x, V=Wv·x → attn=softmax(QK/√d)V → out=Wo·attn"} },
      code: "# microGPT: head çıktıları birleştirilir\nout = att @ v          # [B, T, head_dim]\nout = self.proj(out)   # [B, T, d] → geri orijinal boyuta",
      keyPoint: {tr:"Dikkat = bilgi filtreleme. Her token sadece ilgili bilgiyi alır, gürültüyü görmezden gelir.", en:"12 lines of attention code implement: Q/K/V projection → scaled dot-product → masking → softmax → weighted sum → output projection."},
    },
  ],
  "week4_s0": [
    {
      title: {tr:"Transformer Bloğu: Büyük Resim", en:"Transformer Block: The Big Picture"},
      desc: {tr:"Bir transformer bloğu 4 bileşenden oluşur ve bu blok N kez tekrarlanır. Her blok girdinin boyutunu değiştirmez — bu yüzden üst üste yığılabilir.", en:"RMSNorm normalizes vectors to unit length, stabilizing the training process. Simpler and faster than LayerNorm."},
      formula: "x → LayerNorm → Attention → +x (residual) → LayerNorm → MLP → +x (residual)",
      example: { input: {tr:"Girdi: [8 token × 16 boyut] matrisi", en:"x=[0.5, -0.3, 0.8, -0.1] → RMSNorm"}, output: {tr:"Çıktı: [8 token × 16 boyut] — boyut aynı! Ama her token artık bağlam biliyor", en:"RMS=0.52 → normalized: [0.96, -0.58, 1.54, -0.19]"} },
      code: "# microGPT transformer blok:\nclass Block(nn.Module):\n    def forward(self, x):\n        x = x + self.attn(self.ln1(x))   # dikkat + residual\n        x = x + self.mlp(self.ln2(x))    # MLP + residual\n        return x",
      keyPoint: {tr:"1 blok = dikkat (tokenlar arası bilgi) + MLP (token içi dönüşüm) + residual (bilgi korunması).", en:"RMSNorm: divide by root-mean-square, then scale. Faster than LayerNorm (no mean subtraction)."},
    },
  ],
  "week4_s1": [
    {
      title: {tr:"Transformer Adım Adım Simülasyonu", en:"Transformer Step-by-Step Simulation"},
      desc: {tr:"Tek bir token bir transformer bloğundan geçerken neler olur? Normalizasyon → dikkat → toplama → normalizasyon → MLP → toplama.", en:"Residual connections create a 'highway' for gradients, allowing them to flow directly through the network without vanishing."},
      example: { input: {tr:"x = [0.5, -0.3, 0.8, ...] (normalize edilmemiş)", en:"Layer 1 → Layer 2: x₂ = x₁ + f(x₁)"}, output: {tr:"→ LayerNorm → Attention (diğer tokenlardan bilgi) → +x → LayerNorm → MLP → +x → çıktı", en:"Even if f() fails, x₁ still passes through. Gradient always has a path."} },
      code: "# Adım adım:\nx_norm = self.ln1(x)           # 1. normalize et\nattn_out = self.attn(x_norm)   # 2. dikkat hesapla\nx = x + attn_out               # 3. residual ekle\nx_norm = self.ln2(x)           # 4. tekrar normalize\nmlp_out = self.mlp(x_norm)     # 5. MLP dönüşümü\nx = x + mlp_out                # 6. residual ekle",
      keyPoint: {tr:"Her adımın rolü: norm=stabilize, attn=diğerlerinden öğren, MLP=kendi bilgini güncelle, residual=eski bilgiyi koru.", en:"Without residuals, deep networks suffer from vanishing gradients. Residuals let gradients flow directly."},
    },
  ],
  "week4_s2": [
    {
      title: {tr:"RMSNorm: Vektörü Normalize Et", en:"RMSNorm: Normalize the Vector"},
      desc: {tr:"Layer normalization, her vektörü ortalama=0, standart sapma=1 olacak şekilde normalize eder. Bu, eğitimi stabilize eder ve gradyan patlamasını önler.", en:"The MLP block expands the representation (16→64), applies a nonlinear activation, then compresses back (64→16)."},
      formula: "RMSNorm(x) = x / RMS(x) × γ    RMS(x) = √(Σxᵢ²/d)",
      example: { input: {tr:"x = [10, -5, 3, 8] → RMS = √(100+25+9+64)/4 = √49.5 ≈ 7.0", en:"x[16] → fc1[16→64] → ReLU² → fc2[64→16]"}, output: {tr:"x_norm = [1.43, -0.71, 0.43, 1.14] → değerler makul aralıkta", en:"16→64 (expand for capacity) → ReLU² (nonlinear filter) → 64→16 (compress back)"} },
      code: "# microGPT RMSNorm:\nclass RMSNorm(nn.Module):\n    def forward(self, x):\n        rms = torch.sqrt(torch.mean(x**2, dim=-1, keepdim=True))\n        return x / (rms + 1e-8) * self.weight",
      keyPoint: {tr:"Normalizasyon olmadan derin ağlar eğitilemez — değerler katman katman büyür veya küçülür.", en:"MLP provides per-token nonlinear transformation. Attention communicates between tokens, MLP thinks within tokens."},
    },
  ],
  "week4_s3": [
    {
      title: {tr:"MLP Bloku: Token İçi Dönüşüm", en:"MLP Block: Intra-Token Transformation"},
      desc: {tr:"Feed-forward ağ her token için bağımsız olarak çalışır. Boyutu genişletir (d→4d), aktivasyon uygular, tekrar daraltır (4d→d).", en:"ReLU² (squared ReLU) is our activation function. It introduces nonlinearity and creates sparsity in the hidden layer."},
      formula: "MLP(x) = W₂ · activation(W₁ · x + b₁) + b₂",
      example: { input: {tr:"x: [16 boyut] → W₁: [16→64] genişlet → GELU → W₂: [64→16] daralt", en:"x = -2: ReLU²(-2)=? | x = 3: ReLU²(3)=?"}, output: {tr:"Parametre: 16×64 + 64×16 = 2,048 (toplam parametrelerin büyük kısmı!)", en:"ReLU²(-2)=0 (dead) | ReLU²(3)=9 (amplified)"} },
      code: "# microGPT MLP:\nclass MLP(nn.Module):\n    def __init__(self, d):\n        self.fc1 = nn.Linear(d, 4*d)   # genişlet\n        self.fc2 = nn.Linear(4*d, d)   # daralt\n    def forward(self, x):\n        return self.fc2(F.gelu(self.fc1(x)))",
      keyPoint: {tr:"MLP = 'düşünme' katmanı. Dikkat bilgiyi toplar, MLP bu bilgiyi işler ve dönüştürür.", en:"ReLU² = max(0,x)². Zero for negative inputs, quadratic growth for positive. Creates ~38% sparsity."},
    },
  ],
  "week4_s4": [
    {
      title: {tr:"Aktivasyon: Doğrusallık Tuzağı", en:"Activation: The Linearity Trap"},
      desc: {tr:"Aktivasyon fonksiyonu olmadan, kaç katman eklersen ekle, sonuç tek bir matris çarpımına eşdeğerdir. Doğrusal olmayanlık ağa gerçek öğrenme gücü verir.", en:"A Transformer block combines attention (inter-token communication) with MLP (intra-token processing), connected by residuals and norms."},
      formula: "W₂(W₁x) = (W₂W₁)x = W'x → tek katman etkisi!",
      example: { input: {tr:"ReLU(z) = max(0, z) → negatifler 0 olur, pozitifler kalır", en:"Input x → RMSNorm → Attn + residual → RMSNorm → MLP + residual"}, output: {tr:"GELU(z) = z × Φ(z) → düzgün ReLU, GPT/BERT tercih eder", en:"Two sub-blocks, each with norm→transform→residual. Order matters!"} },
      code: "# microGPT: ReGLU² kullanır\ndef relu2(x):\n    return F.relu(x) ** 2  # max(0,x)²",
      keyPoint: {tr:"Aktivasyon olmadan: 100 katman = 1 katman. Aktivasyon ile: her katman YENİ özellikler öğrenir.", en:"One Transformer block = Attention + MLP + 2× RMSNorm + 2× Residual. Stack N blocks for depth."},
    },
  ],
  "week4_s5": [
    {
      title: {tr:"Residual Bağlantılar: Gradient Highway", en:"Residual Connections: Gradient Highway"},
      desc: {tr:"Residual bağlantı, katmanın çıktısını girdisiyle toplar: x + f(x). Bu, gradyanın doğrudan akmasını sağlar ve derin ağları eğitilebilir kılar.", en:"Of 3,648 total parameters: MLP accounts for 56%, Attention for 28%, and Embeddings for 16%."},
      formula: "x_out = x + f(x)    (f = attention veya MLP)",
      example: { input: {tr:"Residual olmadan: x → f₁ → f₂ → f₃ (gradyan her katmanda küçülür)", en:"wte: 27×16=432 | Q,K,V,O: 4×16×16=1024"}, output: {tr:"Residual ile: gradyan doğrudan akar: ∂x_out/∂x = 1 + ∂f/∂x → en az 1!", en:"MLP: 2048 (56%) | Attn: 1024 (28%) | Emb: 560 (16%)"} },
      code: "# microGPT residual connection:\nx = x + self.attn(self.ln1(x))  # dikkat + residual\nx = x + self.mlp(self.ln2(x))   # MLP + residual",
      keyPoint: {tr:"Residual = 'en kötü ihtimalle hiçbir şey yapma'. Gradient highway: 96 katmanda bile gradyan kaybolmaz.", en:"MLP dominates parameters because of the 4× expansion factor (16→64→16). This is where 'knowledge' is stored."},
    },
  ],
  "week4_s6": [
    {
      title: {tr:"Weight Initialization: Kritik Başlatma", en:"Weight Initialization: Critical Start"},
      desc: {tr:"Ağırlıkların başlangıç değerleri eğitimin başarısını belirler. Çok büyük → gradyan patlaması. Çok küçük → gradyan sönmesi.", en:"Multiple layers allow the model to build increasingly abstract representations. Each layer refines the previous one's output."},
      formula: "Xavier: W ~ N(0, 1/√n)    He: W ~ N(0, √(2/n))",
      example: { input: {tr:"n_embd=16 → std = 1/√16 = 0.25", en:"Single block: character pairs. Two blocks: 3-char patterns"}, output: {tr:"Ağırlıklar [-0.5, 0.5] civarında başlar — ne çok büyük ne çok küçük", en:"Deeper = more abstract patterns. But diminishing returns after ~12 layers."} },
      code: "# PyTorch varsayılan: Kaiming/He initialization\n# microGPT: nn.Linear zaten uygun init yapar\nnn.init.normal_(self.weight, std=0.02)",
      keyPoint: {tr:"İyi init = eğitim hızla başlar. Kötü init = eğitim hiç başlamaz veya patlar.", en:"Each layer builds on the previous: Layer 1 learns character patterns, Layer 2 learns word patterns, etc."},
    },
  ],
  "week4_s7": [
    {
      title: {tr:"RMSNorm vs LayerNorm Karşılaştırma", en:"RMSNorm vs LayerNorm Comparison"},
      desc: {tr:"LayerNorm ortalamayı çıkarır ve standart sapmaya böler. RMSNorm sadece RMS'ye böler (ortalama çıkarmaz). RMSNorm daha hızlı ve modern modellerde tercih edilir.", en:"Cross-entropy loss measures how surprised the model is by the correct answer. Higher probability for the correct token = lower loss."},
      formula: "LayerNorm: (x - μ) / σ × γ + β\nRMSNorm: x / RMS(x) × γ",
      example: { input: {tr:"x = [4, 2, 6]", en:"Model output: logits[27] for 'hello'"}, output: {tr:"LayerNorm: μ=4, σ=1.63 → [-0, -1.22, 1.22]\nRMSNorm: RMS=4.32 → [0.93, 0.46, 1.39]", en:"P('h')=0.04 → loss=3.22 | P('h')=0.40 → loss=0.92 (much better!)"} },
      keyPoint: {tr:"RMSNorm: daha az hesaplama, benzer performans. LLaMA, GPT-4 RMSNorm kullanır.", en:"Cross-entropy: if model assigns P=1.0 to correct token → loss=0. P=1/27 (random) → loss=3.33. Lower is better."},
    },
  ],
  "week5_s0": [
    {
      title: {tr:"Optimizasyon: Kaybı Minimize Et", en:"Optimization: Minimize Loss"},
      desc: {tr:"Eğitim = kayıp fonksiyonunu minimize eden ağırlıkları bulmak. Gradient descent kaybın azaldığı yönde küçük adımlar atar.", en:"The -log function converts probabilities to loss values: P=1→loss=0 (perfect), P=0.01→loss=4.6 (terrible). It heavily penalizes low-confidence correct predictions."},
      formula: "w ← w - η × ∂L/∂w    (η = öğrenme oranı)",
      example: { input: {tr:"Dağda sisli bir gece: en dik iniş yönünü bul → küçük adım at → tekrarla", en:"P(correct)=0.5 → L=-log(0.5)=0.69"}, output: {tr:"Her adımda kayıp biraz azalır → sonunda 'vadi' (minimum) bulunur", en:"L=-log(0.5)=0.69 | L=-log(0.01)=4.61 (46× worse!)"} },
      keyPoint: {tr:"Gradyan = 'hangi yönde tırmanırım?' bilgisi. Biz TERSİ yönde yürürüz → kayıp düşer.", en:"-log amplifies small probabilities: -log(0.01)=4.6 but -log(0.5)=0.69. This forces the model to be confident."},
    },
  ],
  "week5_s1": [
    {
      title: {tr:"Gradient Descent: Adım Adım", en:"Gradient Descent: Step by Step"},
      desc: {tr:"Her eğitim adımında: ileri geçiş (tahmin yap) → kayıp hesapla → geri geçiş (gradyan bul) → ağırlıkları güncelle.", en:"Forward pass: tokens go through the model to produce predictions. Loss is computed by comparing predictions with actual next tokens."},
      formula: "1. ŷ = model(x)        # ileri geçiş\n2. L = loss(ŷ, y)       # kayıp\n3. ∂L/∂w = backward()   # gradyanlar\n4. w = w - η × ∂L/∂w    # güncelleme",
      example: { input: {tr:"Doğru: 'e', Tahmin: P('e')=0.1 (düşük) → Loss yüksek", en:"tokens=[BOS,h,e,l,l,o] → forward → logits → loss"}, output: {tr:"Gradyan 'e' olasılığını artıracak yönü gösterir → güncelleme → P('e')=0.15", en:"logits=[...] → softmax → P → loss = -mean(log(P[targets]))"} },
      code: "# microGPT eğitim döngüsü:\nfor step in range(max_steps):\n    logits, loss = model(x, targets)\n    optimizer.zero_grad()  # gradyanları sıfırla\n    loss.backward()        # gradyanları hesapla\n    optimizer.step()       # ağırlıkları güncelle",
      keyPoint: {tr:"Bu 4 satır TÜM sinir ağı eğitiminin özüdür. GPT-4 bile aynı döngüyü kullanır.", en:"Forward pass is pure computation: no learning happens. It's just evaluating the model's current 'guess'."},
    },
  ],
  "week5_s2": [
    {
      title: {tr:"Eğitim Simülasyonu: LR Etkisi", en:"Training Simulation: LR Effect"},
      desc: {tr:"Öğrenme oranı (learning rate) en kritik hiperparametredir. Çok büyük → kayıp salınır/patlar. Çok küçük → çok yavaş öğrenir.", en:"Backward pass: starting from the loss, gradients are computed for every parameter using the chain rule via autograd."},
      formula: "w_new = w_old - lr × gradient",
      example: { input: {tr:"lr=0.1: büyük adımlar → hızlı ama kararsız, salınır", en:"loss=2.5 → backward() → every param gets a gradient"}, output: {tr:"lr=0.0001: küçük adımlar → kararlı ama 10x yavaş öğrenir", en:"w.grad = ∂loss/∂w for each of 3,648 parameters"} },
      code: "# microGPT: Adam optimizer, lr=0.01\noptimizer = torch.optim.Adam(model.parameters(), lr=1e-2)",
      keyPoint: {tr:"İdeal LR aralığı: genelde 1e-4 ile 1e-2 arası. Adam optimizer LR'yi otomatik ayarlar.", en:"Backward pass computes ∂loss/∂param for every parameter. This is the 'learning signal'."},
    },
  ],
  "week5_s3": [
    {
      title: {tr:"Cross-Entropy Loss: Bilgi Teorisi", en:"Cross-Entropy Loss: Information Theory"},
      desc: {tr:"Cross-entropy, modelin tahmin dağılımının gerçek dağılımdan ne kadar uzak olduğunu ölçer. Doğru tokena verilen olasılık ne kadar yüksekse kayıp o kadar düşük.", en:"Adam optimizer combines momentum (direction history) with adaptive learning rates (per-parameter scaling) for smart updates."},
      formula: "CE = -log P(doğru_token)",
      example: { input: {tr:"Doğru token: 'e'", en:"SGD: w-=lr×g | Adam: w-=lr×m̂/(√v̂+ε)"}, output: {tr:"P('e')=0.9 → L=-log(0.9)=0.105 (düşük kayıp ✅)\nP('e')=0.01 → L=-log(0.01)=4.605 (yüksek kayıp ❌)", en:"SGD forgets. Adam remembers direction + adapts step size per-parameter."} },
      code: "# PyTorch'ta cross-entropy:\nloss = F.cross_entropy(logits.view(-1, V), targets.view(-1))\n# İçerde: softmax + negative log likelihood",
      keyPoint: {tr:"Kayıp = modelin şaşkınlığının ölçüsü. Düşük kayıp = model doğru tahmin ediyor.", en:"Adam = Momentum + RMSprop. It adapts learning rate per-parameter and remembers gradient direction."},
    },
  ],
  "week5_s4": [
    {
      title: {tr:"Logaritma: Neden -log Kullanırız?", en:"Logarithm: Why We Use -log?"},
      desc: {tr:"Olasılıklar çarpılır ve çok küçük sayılar oluşur (10⁻¹⁰⁰⁰). Log dönüşümü çarpmayı toplamaya çevirir ve sayıları yönetilebilir tutar.", en:"Learning rate controls the step size. Too large = oscillation/divergence. Too small = slow convergence. Scheduling helps."},
      formula: "log(a × b) = log(a) + log(b)    -log(1) = 0, -log(0.5) = 0.69, -log(0.01) = 4.6",
      example: { input: {tr:"P(cümle) = 0.1 × 0.2 × 0.3 = 0.006 (çok küçük!)", en:"lr=0.1: oscillates | lr=0.001: stable but slow"}, output: {tr:"-log: 1.0 + 0.7 + 0.5 = 2.2 (yönetilebilir sayı)", en:"lr=0.01 → loss decreases steadily. Start here, adjust as needed."} },
      keyPoint: {tr:"-log(p): p=1 → 0 (mükemmel tahmin), p→0 → ∞ (kötü tahmin). Bu doğal bir kayıp fonksiyonu.", en:"Learning rate is the single most important hyperparameter. Start with 0.01 and adjust from there."},
    },
  ],
  "week5_s5": [
    {
      title: {tr:"Adam Optimizer: SGD'nin Evrimi", en:"Adam Optimizer: Evolution of SGD"},
      desc: {tr:"Adam, SGD'nin iki sorunununu çözer: momentum ile salınımı azaltır, adaptif öğrenme oranı ile her parametre için ayrı hız kullanır.", en:"The complete training loop: forward → compute loss → backward → update parameters → zero gradients → repeat."},
      formula: "Adam: m = β₁m + (1-β₁)g, v = β₂v + (1-β₂)g², w = w - η × m/√v",
      example: { input: {tr:"SGD: tüm parametreler aynı hızda → bazıları çok hızlı, bazıları çok yavaş", en:"for step in range(500): forward→loss→backward→update→zero_grad"}, output: {tr:"Adam: sık güncellenen parametreleri yavaşlat, nadir güncellenenleri hızlandır", en:"Step 0: loss=3.33 → Step 100: 2.8 → Step 500: 2.0 → Model learned!"} },
      code: "# SGD → Adam evrimi:\n# SGD:  w -= lr * grad\n# +Momentum: w -= lr * running_avg(grad)\n# +Adaptive: w -= lr * running_avg(grad) / sqrt(running_avg(grad²))\n# = Adam!",
      keyPoint: {tr:"Pratik: Adam (veya AdamW) neredeyse her zaman iyi çalışır. microGPT dahil.", en:"CRITICAL: zero_grad() before each step! Without it, gradients accumulate across steps → wrong updates."},
    },
  ],
  "week5_s6": [
    {
      title: {tr:"Learning Rate Schedule & Eğitim Döngüsü", en:"Learning Rate Schedule & Training Loop"},
      desc: {tr:"Sabit öğrenme oranı yerine, eğitim boyunca LR'yi değiştirmek daha iyi sonuç verir. Warmup + cosine decay en yaygın stratejidir.", en:"Key hyperparameters: learning_rate (start 0.01-0.001), batch_size, num_steps, and the LR schedule (cosine, linear decay)."},
      example: { input: {tr:"Warmup (ilk 100 adım): lr = 0 → 0.01 (yavaşça artır)", en:"lr=0.01, batch=32, steps=500"}, output: {tr:"Decay (geri kalan): lr = 0.01 → 0.001 (kosinüs eğrisiyle azalt)", en:"If loss plateaus: try lr×0.1 | If loss oscillates: try lr×0.5"} },
      code: "# microGPT: basit sabit lr\n# GPT-3: warmup + cosine decay\nfor step in range(max_steps):\n    lr = get_lr(step)  # warmup + decay\n    for p in model.parameters():\n        p.data -= lr * p.grad",
      keyPoint: {tr:"Warmup: başta patlamamayı önler. Decay: sonda ince ayar yapar. İkisi birlikte en iyi.", en:"Start simple: lr=0.01, batch=32, 500 steps. If loss doesn't decrease, reduce lr. If too slow, increase it."},
    },
  ],
  "week5_s7": [
    {
      title: {tr:"Gradient Sıfırlama: Neden zero_grad()?", en:"Gradient Reset: Why zero_grad()?"},
      desc: {tr:"PyTorch gradyanları biriktirir (toplar). Her eğitim adımından önce sıfırlamazsak, önceki adımların gradyanları karışır.", en:"Token generation starts with a context (e.g. BOS), feeds it through the model, samples from the output distribution, and repeats."},
      formula: "YANLIŞ: grad = grad_step1 + grad_step2 + ... (birikir!)\nDOĞRU: her adımda grad = 0 → sadece bu adımın gradyanı",
      example: { input: {tr:"Adım 1: grad=0.5, Adım 2: grad=0.3", en:"Context: [BOS] → P(a)=0.12, P(e)=0.10, ..."}, output: {tr:"zero_grad yok → grad=0.8 (yanlış!) | zero_grad var → grad=0.3 (doğru)", en:"Sample: 'e' (P=0.12). New context: [BOS, 'e']. Repeat."} },
      code: "# Her adımda 3 satır:\noptimizer.zero_grad()  # 1. sıfırla\nloss.backward()        # 2. hesapla\noptimizer.step()       # 3. güncelle",
      keyPoint: {tr:"zero_grad() unutulursa model yanlış yönde güncellenir. En sık yapılan hata!", en:"Sampling adds controlled randomness. Same model can produce different outputs — this is a feature, not a bug."},
    },
  ],
  "week6_s0": [
    {
      title: {tr:"Eğitim vs Inference: İki Farklı Mod", en:"Training vs Inference: Two Different Modes"},
      desc: {tr:"Eğitimde model tüm tokenlara paralel bakar ve kayıp hesaplar. Inference'da tek tek token üretir — tamamen farklı bir süreç.", en:"Sampling from probabilities introduces randomness — the same input can produce different outputs each time."},
      example: { input: {tr:"Eğitim: 'Ali okula gitti' → tüm tokenlar aynı anda, kayıp = -log P(her doğru token)", en:"T=0.5 → sharper | T=1.0 → original | T=1.5 → flatter"}, output: {tr:"Inference: 'Ali' → 'okula' → 'gitti' → ... tek tek, otoregresif", en:"T=0.5: [0.82, 0.15, 0.03] | T=1.5: [0.43, 0.35, 0.22]"} },
      code: "# Eğitim modu:\nmodel.train()\nlogits, loss = model(x, targets)  # paralel, kayıp var\n\n# Inference modu:\nmodel.eval()\nwith torch.no_grad():  # gradyan hesaplama kapalı\n    output = model.generate(prompt)  # tek tek üret",
      keyPoint: {tr:"Eğitim: paralel, hızlı, gradyan var. Inference: sıralı, yavaş, gradyan yok.", en:"Higher temperature → flatter distribution → more surprising choices. Lower → sharper → more predictable."},
    },
  ],
  "week6_s1": [
    {
      title: {tr:"Autoregressive Generation: Token Token", en:"Autoregressive Generation: Token by Token"},
      desc: {tr:"Otoregresif üretim: model bir token üretir, bu token girdiye eklenir, tekrar model çalıştırılır. EOS gelene kadar devam.", en:"Temperature scales logits before softmax. T<1 = more confident (greedy), T>1 = more random (creative)."},
      formula: "P(w₁...wₙ) = P(w₁) × P(w₂|w₁) × P(w₃|w₁w₂) × ...",
      example: { input: {tr:"Seed: 'A' → Model: 'l' (%30) → 'i' (%45) → ' ' (%50) → [EOS]", en:"logits=[2.0, 1.0, 0.5] → temp=0.5"}, output: {tr:"Sonuç: 'Ali ' — model bir isim üretti!", en:"P: [0.90, 0.09, 0.01] → very confident, common names"} },
      code: "# microGPT generate:\ndef generate(self, idx, max_new):\n    for _ in range(max_new):\n        logits = self(idx[:, -block_size:])\n        probs = F.softmax(logits[:, -1, :], dim=-1)\n        next_id = torch.multinomial(probs, 1)\n        idx = torch.cat([idx, next_id], dim=1)\n    return idx",
      keyPoint: {tr:"Her adımda sadece SON tokenin logitleri kullanılır. Önceki tokenlar bağlam olarak kalır.", en:"T=0.5: conservative, common names. T=1.0: balanced. T=1.5: creative, unusual names. T=0.01 ≈ greedy."},
    },
  ],
  "week6_s2": [
    {
      title: {tr:"Temperature & Sampling Etkisi", en:"Temperature & Sampling Effect"},
      desc: {tr:"Temperature olasılık dağılımını yeniden şekillendirir. Düşük temperature = güvenli/tekrarlayıcı. Yüksek temperature = yaratıcı/riskli.", en:"Temperature mathematically divides logits by T before softmax: softmax(logits/T). This reshapes the probability distribution."},
      formula: "P(i) = exp(zᵢ/τ) / Σⱼ exp(zⱼ/τ)    τ = temperature",
      example: { input: {tr:"Logits: [3.0, 1.5, 0.5] → τ=1.0: [0.73, 0.16, 0.11]", en:"logits/T → softmax → different distribution"}, output: {tr:"τ=0.5: [0.91, 0.07, 0.02] (keskin) | τ=2.0: [0.49, 0.29, 0.22] (düz)", en:"Same logits, different T → completely different behavior"} },
      code: "# microGPT temperature:\nlogits = logits / temperature\nprobs = F.softmax(logits, dim=-1)\nnext_tok = torch.multinomial(probs, 1)",
      keyPoint: {tr:"τ→0: greedy (hep aynı çıktı). τ=1: normal. τ→∞: rastgele (anlamsız çıktı).", en:"Temperature is just division: logits/T. Simple math, dramatic effect on output diversity."},
    },
  ],
  "week6_s3": [
    {
      title: {tr:"Temperature: Matematiksel Detay", en:"Temperature: Mathematical Detail"},
      desc: {tr:"Temperature logitleri bölmek, softmax'ın girdilerini ölçekler. Küçük τ farkları büyütür (keskin), büyük τ farkları küçültür (düz).", en:"Top-k keeps only the k most likely tokens. Top-p (nucleus) keeps tokens until cumulative probability reaches p. Both reduce nonsense."},
      formula: "τ=0.5: logit/0.5 → farklar 2x büyür → softmax daha keskin\nτ=2.0: logit/2.0 → farklar yarılanır → softmax daha düz",
      example: { input: {tr:"Logits: [2, 1, 0]", en:"Top-k=5 from 27 tokens | Top-p=0.9"}, output: {tr:"τ=0.5 → [4,2,0] → softmax: [0.84, 0.14, 0.02]\nτ=2.0 → [1,0.5,0] → softmax: [0.51, 0.31, 0.19]", en:"After top-k=5: renormalize over 5 tokens only"} },
      keyPoint: {tr:"Temperature kodu sadece 1 satır: logits = logits / τ — ama etkisi dramatik.", en:"Top-k=5: only consider 5 most likely tokens. Top-p=0.9: keep tokens until 90% cumulative probability."},
    },
  ],
  "week6_s4": [
    {
      title: {tr:"Sampling Stratejileri: Greedy, Top-k, Top-p", en:"Sampling Strategies: Greedy, Top-k, Top-p"},
      desc: {tr:"Greedy her zaman en olası tokeni seçer. Top-k ve Top-p düşük olasılıklı tokenleri keserek hem yaratıcı hem de mantıklı çıktılar sağlar.", en:"Autoregressive generation: predict one token → add to context → predict next → repeat. Each step conditions on all previous tokens."},
      formula: "Top-k: en yüksek k tokeni tut, diğerlerini sıfırla\nTop-p: P kümülatif ≥ p olana kadar token ekle",
      example: { input: {tr:"Olasılıklar: a(%40) b(%25) c(%15) d(%10) e(%5) f(%3) g(%2)", en:"BOS → 'e' → 'm' → 'm' → 'a' → EOS"}, output: {tr:"Greedy: hep 'a' | Top-3: {a,b,c} arası | Top-p(0.8): {a,b,c} (kümülatif=%80)", en:"Result: 'emma' — model learned English name patterns!"} },
      keyPoint: {tr:"Pratikte: temperature=0.7 + top_p=0.9 kombinasyonu iyi çalışır.", en:"Each generated token becomes part of the next input. The model 'builds' its output one piece at a time."},
    },
  ],
  "week6_s5": [
    {
      title: {tr:"KV Cache: Hızlı Inference", en:"KV Cache: Fast Inference"},
      desc: {tr:"Her yeni token üretiminde önceki tokenların K ve V vektörlerini yeniden hesaplamak israf. KV cache bunları bellekte saklar.", en:"microGPT generates character-level names. Quality improves with training: from random characters to realistic-sounding names."},
      formula: "Naive: her adımda O(n²) hesaplama\nKV Cache: önceki K,V'leri sakla → sadece yeni tokenin Q'sunu hesapla → O(n)",
      example: { input: {tr:"100. token üretilirken: naive → 100 token × 100 token = 10,000 işlem", en:"500 steps: 'xqzb' | 2000 steps: 'emma'"}, output: {tr:"KV cache → sadece yeni Q × 100 eski K = 100 işlem (100x hızlı!)", en:"After 500 steps: random-ish | After 2000: realistic English names"} },
      code: "# KV cache pseudocode:\nif cache is not None:\n    k = torch.cat([cache_k, new_k], dim=1)  # eski K + yeni K\n    v = torch.cat([cache_v, new_v], dim=1)\n    cache = (k, v)  # güncelle",
      keyPoint: {tr:"KV cache olmadan LLM çıkarımı pratik olarak imkansız — çok yavaş olur.", en:"After 500 steps: loss ~2.0, generated names start sounding realistic. After 2000 steps: loss ~1.7, very convincing."},
    },
  ],
  "week6_s6": [
    {
      title: {tr:"Inference Pipeline: Uçtan Uca", en:"Inference Pipeline: End to End"},
      desc: {tr:"Tam inference pipeline'ı: metin girişinden çıktı metnine kadar olan tüm adımlar.", en:"The complete inference code in 15 lines: create context, loop (forward pass → sample → append), return generated text."},
      formula: "Metin → Tokenize → Embed → N×[Norm→Attn→+→Norm→MLP→+] → LM Head → Softmax → Sample → Decode → Metin",
      example: { input: {tr:"Girdi: 'Merhaba'", en:"Beam=3: keep 3 best paths | Sample: random choice"}, output: {tr:"→ [312,4521] → embed → transformer × N → logits → softmax → [89] → 'ben' → tekrarla", en:"Beam: 'emma'(best path) | Sample: 'aria'(creative choice)"} },
      code: "# microGPT full pipeline:\ntokens = encode('Ah')          # metin → sayılar\ntensor = torch.tensor([tokens]) # tensor'a çevir\noutput = model.generate(tensor, max_new_tokens=20)\nprint(decode(output[0].tolist()))  # 'Ahmet' gibi bir isim",
      keyPoint: {tr:"243 satır kodla tam pipeline: encode → model → decode. Her şey burada.", en:"Inference is simpler than training: no gradients, no loss, no updates. Just forward pass + sample + repeat."},
    },
  ],
  "week6_s7": [
    {
      title: {tr:"microGPT vs Production GPT: Kapanış", en:"microGPT vs Production GPT: Conclusion"},
      desc: {tr:"microGPT ve GPT-4 aynı algoritmayı kullanır. Fark sadece ölçek, veri ve mühendislik detaylarındadır.", en:"Scaling laws show that model performance improves predictably with more parameters, more data, and more compute — following power laws."},
      example: { input: {tr:"microGPT: 3,648 param, 27 vocab, CPU, 30 saniye eğitim", en:"Loss < 2.0 → 'stop, the model is good enough'"}, output: {tr:"GPT-4: ~1.8T param, 100K vocab, 10K GPU, aylar süren eğitim", en:"Loss approaches 1/entropy of the data. Can't go below data randomness."} },
      keyPoint: {tr:"Algoritmayı anladıysanız, GPT-4'ü de anladınız. Geri kalan mühendislik detayı.", en:"10× more parameters → ~3× better performance. Diminishing returns but still valuable at scale."},
    },
  ],
  "week7_s0": [
    {
      title: {tr:"Scaling Laws: Daha Büyük = Daha İyi?", en:"Scaling Laws: Bigger = Better?"},
      desc: {tr:"BDM performansı 3 faktörle üs yasası olarak ölçeklenir: parametre sayısı, veri miktarı ve hesaplama gücü. Bu ilişki öngörülebilir ve güvenilirdir.", en:"From the original Transformer (2017) to GPT-4 (2023): an exponential increase in scale, cost, and capability."},
      formula: "L(N) ∝ N⁻⁰·⁰⁷⁶    L(D) ∝ D⁻⁰·⁰⁹⁵    L(C) ∝ C⁻⁰·⁰⁵⁰",
      example: { input: {tr:"10x parametre → kayıp %15 düşer", en:"context = [BOS]; for i in range(max_len): next = sample(model(context))"}, output: {tr:"10x veri → kayıp %18 düşer | 10x hesaplama → kayıp %11 düşer", en:"15 lines: context loop + forward + sample + append. Simple!"} },
      keyPoint: {tr:"Chinchilla: N parametre için ~20N token veri gerekir. Daha fazla parametre her zaman daha iyi DEĞİL — dengelemek lazım.", en:"From $10K (Transformer, 2017) to $100M+ (GPT-4, 2023). Cost grows faster than performance."},
    },
  ],
  "week7_s1": [
    {
      title: {tr:"GPT Zaman Çizelgesi: 2017 → Bugün", en:"GPT Timeline: 2017 → Today"},
      desc: {tr:"Transformer mimarisinden ChatGPT'ye uzanan yolculuk sadece 5 yıl sürdü. Her yıl ölçek 10x büyüdü.", en:"The modern training pipeline has 3 stages: pre-training (predict next token), SFT (learn to follow instructions), RLHF (align with human preferences)."},
      example: { input: {tr:"2017: Attention Is All You Need (Vaswani) → Transformer doğdu", en:"10× params → loss drops by ~0.5"}, output: {tr:"2018: GPT-1 (117M) → 2019: GPT-2 (1.5B) → 2020: GPT-3 (175B) → 2022: ChatGPT → 2023: GPT-4", en:"Power law: L(N) ∝ N^(-0.076). Predictable, not magical."} },
      keyPoint: {tr:"5 yılda 10,000x büyüme. Algoritma aynı kaldı, sadece ölçek değişti.", en:"Pre-training gives knowledge. SFT gives format. RLHF gives alignment. All three are essential."},
    },
  ],
  "week7_s2": [
    {
      title: {tr:"Donanım: Neden GPU Gerekli?", en:"Hardware: Why GPUs Are Needed?"},
      desc: {tr:"Dikkat mekanizması büyük matris çarpımları gerektirir. GPU binlerce çekirdeğiyle bu işlemleri paralel yapabilir.", en:"RLHF trains a reward model from human comparisons, then uses it to fine-tune the LLM to produce outputs humans prefer."},
      formula: "QKᵀ: [N×d] × [d×N] = N² çarpma → GPU'da paralel",
      example: { input: {tr:"CPU: 8-64 çekirdek, sıralı → microGPT: 30 sn", en:"2017: Transformer $10K | 2023: GPT-4 $100M+"}, output: {tr:"GPU: 10,000+ çekirdek, paralel → GPT-3: 10,000 GPU × haftalarca", en:"Cost: 20,000× increase in 7 years. But performance: 100× improvement."} },
      keyPoint: {tr:"microGPT CPU'da çalışır (küçük ölçek). Gerçek LLM'ler GPU/TPU kümesi gerektirir.", en:"RLHF: 'which response is better?' × millions of comparisons = a model that knows what humans want."},
    },
  ],
  "week7_s3": [
    {
      title: {tr:"Eğitim Pipeline: Pre-training → SFT → RLHF", en:"Training Pipeline: Pre-training → SFT → RLHF"},
      desc: {tr:"Modern BDM eğitimi 3 aşamalıdır: önce büyük veri üzerinde ön eğitim, sonra kaliteli örneklerle ince ayar, son olarak insan geri bildirimiyle hizalama.", en:"GPU parallelism is essential because matrix multiplications (the core of neural networks) are embarrassingly parallel."},
      example: { input: {tr:"Aşama 1: Web metni (terabyte'larca) → sonraki token tahmini", en:"Pre-train: 1T tokens | SFT: 100K examples | RLHF: 50K comparisons"}, output: {tr:"Aşama 2: İnsan yazımı soru-cevap → SFT | Aşama 3: Hangisi daha iyi? → RLHF", en:"Each stage builds on the previous. Skip one → the model is broken."} },
      code: "# microGPT sadece Aşama 1'i yapar:\n# Pre-training: isimleri tahmin et\n# Aşama 2-3 büyük modeller için",
      keyPoint: {tr:"Pre-training = ham yetenek. SFT = 'nasıl konuşulur' öğretir. RLHF = zararlı olmamayı öğretir.", en:"A100 GPU: 312 TFLOPS. Training GPT-3: ~3.6×10²³ FLOPS. That's why we need thousands of GPUs."},
    },
  ],
  "week7_s4": [
    {
      title: {tr:"Tokenization Evrimi", en:"Tokenization Evolution"},
      desc: {tr:"Karakter düzeyinden BPE'ye, oradan SentencePiece'e: tokenization yöntemleri dilin yapısına göre evrildi.", en:"Open source models (LLaMA, Mistral, DeepSeek) have democratized access to powerful language models."},
      example: { input: {tr:"Karakter: 'merhaba' = 7 token (çok uzun)", en:"Human: 'Response A vs B?' × 50K → reward model"}, output: {tr:"BPE: 'merhaba' = 2-3 token | Sözcük: 'merhaba' = 1 token (ama OOV sorunu)", en:"Reward model generalizes from 50K to millions of responses."} },
      keyPoint: {tr:"BPE = altın denge. Bilinmeyen sözcük yok, diziler makul uzunlukta.", en:"Open source accelerates research: anyone can fine-tune LLaMA-3 on a single GPU for their specific task."},
    },
  ],
  "week7_s5": [
    {
      title: {tr:"Dikkat Evrimi: Vanilla → Flash → Sliding", en:"Attention Evolution: Vanilla → Flash → Sliding"},
      desc: {tr:"Orijinal dikkat O(n²) bellek ve hesaplama gerektirir. Modern yöntemler bunu dramatik şekilde azaltır.", en:"Current trends: Mixture of Experts (MoE), Retrieval-Augmented Generation (RAG), AI Agents, and multimodal models."},
      formula: "Vanilla: O(n²) bellek | Flash: O(n) bellek, 2-4x hız | Sliding: O(n×w) hesaplama",
      example: { input: {tr:"Vanilla Attention, n=4096: 4096² = 16M elemanlı matris!", en:"A100: 312 TFLOPS, 80GB HBM"}, output: {tr:"Flash: aynı sonuç, ama bellekte 16M yerine ~4K tutar", en:"GPU: parallel matrix ops. CPU: sequential logic. Neural nets need GPUs."} },
      keyPoint: {tr:"Flash Attention sayesinde bağlam penceresi 2K'dan 128K+'ya çıktı.", en:"MoE: only activate relevant experts per token → 8× fewer FLOPs. RAG: retrieve before generating → factual accuracy."},
    },
  ],
  "week7_s6": [
    {
      title: {tr:"Açık Kaynak LLM'ler: LLaMA → DeepSeek", en:"Open Source LLMs: LLaMA → DeepSeek"},
      desc: {tr:"2023'ten itibaren açık kaynak modeller kapalı kaynak modellerle rekabet etmeye başladı. Bu demokratikleşme araştırmayı hızlandırdı.", en:"AI alignment ensures models are helpful, harmless, and honest. This is one of the most important challenges in AI research."},
      example: { input: {tr:"2023: LLaMA (Meta, 7-65B) → ilk güçlü açık model", en:"LLaMA-3 70B: fine-tune on single A100"}, output: {tr:"2024: LLaMA-3, Mistral (7B MoE), DeepSeek (671B MoE) → GPT-4 seviyesine yakın", en:"Download → fine-tune → deploy. Open source made this possible."} },
      keyPoint: {tr:"Açık kaynak = herkes erişebilir, geliştirebilir, denetleyebilir. Araştırma hızı 10x arttı.", en:"The alignment problem: how to ensure AI systems do what we WANT, not just what we SAID. Still an open research question."},
    },
  ],
  "week7_s7": [
    {
      title: {tr:"Güncel Trendler: MoE, RAG, Agent", en:"Current Trends: MoE, RAG, Agent"},
      desc: {tr:"Modern AI 4 ana trendi takip ediyor: verimli mimariler (MoE), dış bilgi (RAG), araç kullanma (Agent) ve çoklu modal (Multimodal).", en:"The 2017 paper 'Attention Is All You Need' introduced the Transformer architecture, replacing RNNs with pure attention mechanisms."},
      example: { input: {tr:"MoE: 671B parametre ama sadece 37B aktif → hızlı ama güçlü", en:"MoE: 8 experts, 2 active per token"}, output: {tr:"RAG: model bilmediğini sorar → halüsinasyon ↓ | Agent: model araç kullanır (web, kod, API)", en:"MoE: activate 2/8 experts → 4× fewer FLOPs at same quality"} },
      keyPoint: {tr:"Gelecek: daha büyük değil daha akıllı modeller. Araç kullanma + düşünme + dış bilgi.", en:"'Attention Is All You Need' — 8 authors, 15 pages, changed the world. Key insight: attention alone is sufficient."},
    },
  ],
  "weekB_s0": [
    {
      title: {tr:"Attention Is All You Need — Neden Devrim?", en:"Attention Is All You Need — Why Revolutionary?"},
      desc: {tr:"2017 öncesi NLP dünyasında RNN ve LSTM hakimdi. Google'dan 8 araştırmacı, RNN'yi tamamen kaldırıp sadece attention kullanan bir model önerdi. Sonuç: hem daha hızlı hem daha doğru.", en:"The paper proposed: multi-head attention, positional encoding, encoder-decoder structure, and scaled dot-product attention."},
      formula: "Attention(Q,K,V) = softmax(QKᵀ/√dₖ)V",
      example: { input: {tr:"Bu TEK formül tüm makaleyi özetler", en:"Helpful + Harmless + Honest = Aligned AI"}, output: {tr:"Q·K = benzerlik skoru → softmax = olasılık → V ile çarp = bilgi al", en:"RLHF + Constitutional AI + Interpretability = safer models (work in progress)"} },
      keyPoint: {tr:"İsim 'Attention Is All You Need' = sadece dikkat mekanizması yeterli, başka hiçbir şeye gerek yok.", en:"Paper's 4 innovations: multi-head attention, sinusoidal positional encoding, layer normalization, scaled dot-product."}
    }
  ],
  "weekB_s1": [
    {
      title: {tr:"RNN'nin 3 Büyük Sorunu", en:"3 Big Problems of RNNs"},
      desc: {tr:"RNN sözcükleri birer birer işler: t₁ → t₂ → t₃ → ... Bu sıralı yapı 3 kritik sorun yaratır.", en:"The original Transformer used encoder-decoder. GPT uses decoder-only. BERT uses encoder-only. Each serves different purposes."},
      formula: "RNN: hₜ = f(hₜ₋₁, xₜ) — her adım öncekine bağımlı → paralel yapılamaz",
      example: { input: {tr:"100 sözcüklük cümle → RNN: 100 sıralı adım (yavaş!)", en:"2017: Vaswani et al., 'Attention Is All You Need'"}, output: {tr:"Transformer: 1 paralel adım → tüm sözcükler aynı anda (hızlı!)", en:"Self-attention replaced convolution + recurrence in one elegant mechanism"} },
      keyPoint: {tr:"1. Sıralı → yavaş 2. Uzak sözcükleri unutur 3. Gradient sönmesi. Transformer üçünü de çözer.", en:"Encoder: bidirectional (sees full input). Decoder: causal (sees only past). GPT = decoder-only."}
    }
  ],
  "weekB_s2": [
    {
      title: {tr:"Attention: Kütüphane Analojisi", en:"Attention: Library Analogy"},
      desc: {tr:"Bir kütüphaneye girip 'yapay zeka kitabı' arıyorsunuz (Query). Her rafta etiket var (Key). Etiket sorunuzla ne kadar uyumluysa, o raftan o kadar bilgi (Value) alırsınız.", en:"RNNs process tokens sequentially (slow, forgets). Attention processes all tokens in parallel (fast, remembers everything)."},
      formula: "score(Q,K) = Q·K → yüksek benzerlik = daha fazla dikkat",
      example: { input: {tr:"Q: 'yapay zeka' | K₁: 'fizik', K₂: 'AI temelleri', K₃: 'yemek'", en:"Abstract → Introduction → Model Architecture → Training → Results"}, output: {tr:"score: 0.1, 0.85, 0.05 → K₂'nin Value'su en çok alınır", en:"Section 3 (Architecture) is the most important — read it carefully"} },
      code: "# Self-attention: her token hem Q hem K hem V rolünde\nQ = x @ Wq   # ne arıyorum?\nK = x @ Wk   # bende ne var?\nV = x @ Wv   # işte bilgim",
      keyPoint: {tr:"Self-attention'da her sözcük hem soru sorar hem cevap verir. Bu yüzden bağlam bilgisi çok zengin.", en:"RNN: sequential, O(n) steps, forgets. Transformer: parallel, O(1) steps, remembers everything within context."}
    }
  ],
  "weekB_s3": [
    {
      title: {tr:"3 Temel Formül", en:"3 Core Formulas"},
      desc: {tr:"Makalenin tüm matematiği 3 formüle sığar. Her birini kaydırıcılarla keşfedebilirsiniz.", en:"The paper was trained on WMT English-German translation: 8 GPUs, 3.5 days, achieving state-of-the-art BLEU scores."},
      formula: "① Dot Product: Q·K = Σ qᵢ×kᵢ\n② Softmax: P(i) = eˣⁱ / Σ eˣʲ\n③ Attention: softmax(QKᵀ/√d) × V",
      example: { input: {tr:"Q=[1,0,1], K=[1,1,0] → Q·K = 1×1 + 0×1 + 1×0 = 1", en:"Encoder: BERT-style | Decoder: GPT-style | Full: T5-style"}, output: {tr:"√d ölçekleme: d=64 ise → skor/8 (gradyanları stabilize eder)", en:"GPT = Decoder stack. BERT = Encoder stack. T5 = Both."} },
      keyPoint: {tr:"Multi-head: aynı girdiyi 8 farklı perspektiften analiz et → concat → proje. Paralel çalışır!", en:"The original paper's model had 65M parameters — tiny by today's standards, but the architecture was everything."}
    }
  ],
  "weekB_s4": [
    {
      title: {tr:"Encoder-Decoder Mimarisi", en:"Encoder-Decoder Architecture"},
      desc: {tr:"Encoder girdi cümlesini anlar, Decoder çıktı cümlesini üretir. Her biri 6 katmandan oluşur. Her katmanda: Attention + FFN + Residual + LayerNorm.", en:"Attention patterns evolved: vanilla (O(n²)) → Flash Attention (memory-efficient) → Sliding Window → Linear Attention."},
      formula: "Encoder katman: x → MultiHead(x,x,x) + x → FFN(.) + . → çıktı\nDecoder: masked self-attn → cross-attn(encoder) → FFN",
      example: { input: {tr:"Encoder: 'I love AI' → zenginleştirilmiş temsil", en:"RNN: process 'a','b','c' one by one | Transformer: process all at once"}, output: {tr:"Decoder: [BOS] → 'Yapay' → 'zekayı' → 'seviyorum' → [EOS]", en:"Transformer: O(1) sequential, O(n²) memory. RNN: O(n) sequential, O(1) memory."} },
      keyPoint: {tr:"microGPT sadece Decoder kullanır (GPT tarzı). BERT sadece Encoder kullanır. Orijinal Transformer ikisini birden kullanır.", en:"Flash Attention: same math, 2-4× faster, 5-20× less memory. A pure engineering breakthrough."}
    }
  ],
  "weekB_s5": [
    {
      title: {tr:"Pozisyon Kodlama: sin/cos Dalgaları", en:"Position Encoding: sin/cos Waves"},
      desc: {tr:"Attention sıra bilmez: 'Ali Ayşe'yi sevdi' ile 'Ayşe Ali'yi sevdi' aynı görünür. Sin/cos dalgaları her pozisyona benzersiz bir parmak izi ekler.", en:"Different attention heads learn different patterns: one tracks syntax, another tracks entity references, another tracks position."},
      formula: "PE(pos, 2i) = sin(pos / 10000^(2i/d))\nPE(pos, 2i+1) = cos(pos / 10000^(2i/d))",
      example: { input: {tr:"Pozisyon 0: [sin(0), cos(0), sin(0), cos(0), ...]", en:"8× P100 GPU, 3.5 days, WMT EN-DE"}, output: {tr:"Pozisyon 5: [sin(5), cos(5), sin(5/100), cos(5/100), ...] — her biri benzersiz", en:"65M params, BLEU 28.4 EN→DE. Smaller than GPT-1 but the architecture mattered."} },
      keyPoint: {tr:"Sin/cos avantajı: eğitimde 50 token gördü ama 500 token'da da çalışır (genelleme). Öğrenilebilir embedding bunu yapamaz.", en:"Head specialization emerges from training — not designed. This is another example of learned structure."}
    }
  ],
  "weekB_s6": [
    {
      title: {tr:"Eğitim: 8 GPU, 3.5 Gün", en:"Training: 8 GPUs, 3.5 Days"},
      desc: {tr:"Base model (65M param): 12 saat eğitim. Big model (213M param): 3.5 gün. WMT 2014 İngilizce-Almanca ve İngilizce-Fransızca çeviri görevleri.", en:"The Transformer paper was cited 100,000+ times and spawned GPT, BERT, T5, LLaMA, and virtually all modern language models."},
      formula: "lr = d⁻⁰·⁵ × min(step⁻⁰·⁵, step × warmup⁻¹·⁵)",
      example: { input: {tr:"Warmup: 4000 adım boyunca lr artır", en:"Vanilla O(n²) → Flash O(n) memory → Sliding window O(n×w)"}, output: {tr:"Sonra: adım⁻⁰·⁵ ile azalt. Dropout=0.1, Label smoothing ε=0.1", en:"Flash: fuse QKV into one kernel, avoid materializing n×n matrix"} },
      keyPoint: {tr:"EN→DE: 28.4 BLEU (yeni rekor!). EN→FR: 41.8 BLEU (tek modelle en iyi). Ve daha az eğitim süresi!", en:"One paper, 100K+ citations, spawned GPT/BERT/T5/LLaMA. The most influential ML paper of the decade."}
    }
  ],
  "weekB_s7": [
    {
      title: {tr:"Bu Makale Dünyayı Nasıl Değiştirdi?", en:"How This Paper Changed the World?"},
      desc: {tr:"15 sayfa, 8 yazar, 90K+ atıf. GPT, BERT, ChatGPT, DALL-E, AlphaFold, Copilot — hepsi Transformer tabanlı. AI'ın her alanını dönüştürdü.", en:"15 pages, 8 authors, 90K+ citations. GPT, BERT, ChatGPT, DALL-E, AlphaFold, Copilot — all Transformer-based. It transformed every area of AI."},
      example: { input: {tr:"2017: Transformer (çeviri) → 2018: BERT + GPT-1", en:"Head 1: next word | Head 2: syntax | Head 3: position | Head 4: entity"}, output: {tr:"2020: GPT-3 (175B) → 2022: ChatGPT → 2023: GPT-4 → 2024: Açık kaynak yarışı", en:"Head specialization is NOT designed — it EMERGES from training. Remarkable!"} },
      keyPoint: {tr:"Sadece NLP değil: görüntü (ViT), protein (AlphaFold), müzik (MusicGen), kod (Copilot), robotik...", en:"Not just NLP: vision (ViT), protein (AlphaFold), music (MusicGen), code (Copilot), robotics..."}
    }
  ],

  "week8_s0": [
    {
      title: {tr:"BPE = Bilgi-Teorik Sıkıştırma", en:"BPE = Information-Theoretic Compression"},
      desc: {tr:"Byte Pair Encoding en sık komşu çifti birleştirir — bu, Minimum Description Length (MDL) prensibine göre optimal sıkıştırmadır. Her birleştirme corpus entropy'sini düşürür.", en:"Byte Pair Encoding merges the most frequent adjacent pair — this is optimal compression according to the Minimum Description Length (MDL) principle. Each merge reduces corpus entropy."},
      formula: "ΔH = H(corpus_before) - H(corpus_after) > 0",
      code: "# Her merge'ün entropi etkisi:\npair_freq = count_pairs(corpus)\nbest = max(pair_freq, key=pair_freq.get)\n# merge(best) → vocab_size++ , seq_length--\n# Net etki: toplam bit sayısı ↓",
      keyPoint: {tr:"microGPT karakter-düzeyi tokenizer kullanır (H≈3.3 bit). GPT-4'ün BPE tokenizer'ı H≈1.8 bit — %45 daha verimli kodlama!", en:"microGPT uses character-level tokenizer (H≈3.3 bits). GPT-4's BPE tokenizer achieves H≈1.8 bits — 45% more efficient encoding!"},
    },
  ],
  "week8_s1": [
    {
      title: {tr:"Hessian Matrisi — Yüzey Eğriliği", en:"Hessian Matrix — Surface Curvature"},
      desc: {tr:"Gradient hangi yöne gideceğini söyler. Hessian yüzeyin şeklini söyler: düz mü, keskin mi, eyer noktası mı? Eigenvalue'lar eğriliği verir.", en:"Gradient tells which direction to go. Hessian tells the shape of the surface: flat, sharp, saddle point? Eigenvalues give curvature."},
      formula: "H_{ij} = ∂²L / ∂w_i∂w_j",
      code: "# Eigenvalue spektrumu:\nλ_max → keskinlik (sharpness)\nλ_min → düzlük (flatness)\nλ < 0 → eyer noktası (saddle point)\n\n# microGPT: H ∈ ℝ^{3648×3648}",
      keyPoint: {tr:"Hesaplamak O(n²) — GPT-2 için H boyutu 117M × 117M! Yaklaşık yöntemler şart: Fisher bilgi matrisi, Hutchinson trace estimator.", en:"Computing is O(n²) — for GPT-2, H is 117M × 117M! Approximations are essential: Fisher information matrix, Hutchinson trace estimator."},
    },
  ],
  "week8_s2": [
    {
      title: {tr:"Attention Head Pruning", en:"Attention Head Pruning"},
      desc: {tr:"Taylor birinci mertebe yaklaşımı ile her head'in loss'a katkısı ölçülür: I(h) = |∂L/∂h · h|. Düşük skorlu headlar çıkarılır — model küçülür, hız artar.", en:"Taylor first-order approximation measures each head's contribution to loss: I(h) = |∂L/∂h · h|. Low-scoring heads are removed — model shrinks, speed increases."},
      formula: "I(h_i) = |∂L/∂h_i · h_i|",
      keyPoint: {tr:"GPT-2 Medium'da %35 head prune → %15 hızlanma, loss artışı sadece +0.02. Her head eşit önemli DEĞİL!", en:"Pruning 35% of heads in GPT-2 Medium → 15% speedup, loss increase only +0.02. Not all heads are equally important!"},
    },
  ],
  "week8_s3": [
    {
      title: {tr:"Embedding İzotropi Problemi", en:"The Embedding Isotropy Problem"},
      desc: {tr:"İdeal: embedding vektörleri uzayda eşit dağılmış (izotrop). Gerçek: çoğu LLM'de dar bir konide toplanmış (anizotrop). Bu, cosine similarity'yi anlamsızlaştırır.", en:"Ideal: embedding vectors uniformly distributed in space (isotropic). Reality: most LLMs have embeddings clustered in a narrow cone (anisotropic). This makes cosine similarity meaningless."},
      formula: "Isotropy = 1 - E[cos(e_i, e_j)] where i≠j",
      keyPoint: {tr:"Çözümler: (1) Whitening: kovaryans matrisini birim matrise dönüştür (2) All-but-the-top: ilk birkaç PCA bileşenini çıkar (3) Contrastive fine-tuning", en:"Solutions: (1) Whitening: transform covariance to identity (2) All-but-the-top: remove first few PCA components (3) Contrastive fine-tuning"},
    },
  ],
  "week8_s4": [
    {
      title: {tr:"Float16 Softmax Trick'i", en:"Float16 Softmax Trick"},
      desc: {tr:"Float16 max değer 65,504. exp(12) = 162,755 → OVERFLOW! Çözüm: x' = x - max(x) yapınca en büyük exp(0)=1 olur. Matematiksel olarak aynı sonuç.", en:"Float16 max value 65,504. exp(12) = 162,755 → OVERFLOW! Solution: x' = x - max(x) makes the largest value exp(0)=1. Mathematically identical result."},
      formula: "softmax(x)_i = exp(x_i - max(x)) / Σ exp(x_j - max(x))",
      code: "# microGPT satır 142:\nmax_x = max(x)\nexps = [math.exp(xi - max_x) for xi in x]\ntotal = sum(exps)\nreturn [e / total for e in exps]",
      keyPoint: {tr:"Bu 3 satır kod, milyar dolarlık GPU kümelerinde çalışan her LLM'nin temelinde var. Basit ama kritik!", en:"These 3 lines of code are at the foundation of every LLM running on billion-dollar GPU clusters. Simple but critical!"},
    },
  ],
  "week8_s5": [
    {
      title: {tr:"Ablation Study Tasarımı", en:"Ablation Study Design"},
      desc: {tr:"Bilimsel deney = kontrollü ortam. Her seferinde tek değişken değiştir. Tekrarla (n≥3). İstatistik raporla (ortalama ± std, p-value). Tablo ve grafikle sun.", en:"Scientific experiment = controlled environment. Change one variable at a time. Repeat (n≥3). Report statistics (mean ± std, p-value). Present with tables and graphs."},
      code: "# Ablation rapor formatı:\n# | Config | Loss (mean±std) | Params | vs Full p-val |\n# | Full   | 2.18 ± 0.04     | 3,648  | —             |\n# | −head  | 2.31 ± 0.06     | 3,520  | 0.003         |",
      keyPoint: {tr:"Ablation olmadan hiçbir iddia bilimsel değildir. 'X iyi çalışıyor' yetmez — 'X olmadan loss Y±Z artar (p<0.05)' gerekir.", en:"No claim is scientific without ablation. 'X works well' is insufficient — 'Without X, loss increases by Y±Z (p<0.05)' is required."},
    },
  ],
  "week8_s6": [
    {
      title: {tr:"Akademik Makale Yapısı", en:"Academic Paper Structure"},
      desc: {tr:"IMRaD: Introduction, Method, Results, Discussion. Related Work her alanı tara, boşluğu göster, katkını konumla. Her cümle arkasında referans olmalı.", en:"IMRaD: Introduction, Method, Results, Discussion. Related Work surveys the field, identifies gaps, positions your contribution. Every claim needs a citation."},
      keyPoint: {tr:"Related Work yazmak 'başkalarını övmek' değil — alandaki boşluğu göstermek ve kendi katkınızı o boşluğa yerleştirmektir.", en:"Writing Related Work is not 'praising others' — it's showing the gap in the field and positioning your contribution in that gap."},
    },
  ],
  "week8_s7": [
    {
      title: {tr:"Lab: microGPT Ablation Deneyi", en:"Lab: microGPT Ablation Experiment"},
      desc: {tr:"n_embd ∈ {8,16,32,64} × 3 seed → 12 deney. Sonuçları tablo ve grafikle raporlayın. p-value hesaplayın. YL tez deney bölümünün prototipi.", en:"n_embd ∈ {8,16,32,64} × 3 seeds → 12 experiments. Report results with tables and graphs. Calculate p-values. A prototype for your thesis experiment section."},
      code: "# Deney komutu:\nfor e in 8 16 32 64; do\n  for s in 42 123 456; do\n    python3 microgpt.py --n_embd $e --seed $s --steps 1000\n  done\ndone",
      keyPoint: {tr:"12 deney = 12 veri noktası = 1 güçlü tablo. Bu tablo tek başına bir poster sunumunu taşıyabilir.", en:"12 experiments = 12 data points = 1 strong table. This table alone can carry a poster presentation."},
    },
  ],
  "week9_s0": [
    {
      title: {tr:"Neural Architecture Search — Pareto Optimizasyon", en:"Neural Architecture Search — Pareto Optimization"},
      desc: {tr:"Mimari hiperparametreleri (katman, head, n_embd) sistematik arama ile optimize et. Pareto frontı: performans ↑ ve maliyet ↓ arasında optimal trade-off noktaları.", en:"Optimize architectural hyperparameters (layers, heads, n_embd) via systematic search. Pareto front: optimal trade-off points between performance ↑ and cost ↓."},
      formula: "Pareto-optimal: ∄ x' s.t. f₁(x') ≤ f₁(x) ∧ f₂(x') < f₂(x)",
      keyPoint: {tr:"Pareto frontında her nokta 'en iyidir' kendi trade-off seviyesinde. Seçim araştırmacıya kalır: 3K param ile loss 2.4 mü, 14K param ile 2.1 mi?", en:"Every point on the Pareto front is 'best' at its own trade-off level. The choice is yours: 3K params with loss 2.4, or 14K params with 2.1?"},
    },
  ],
  "week9_s1": [
    {
      title: {tr:"Knowledge Distillation — Soft Bilgi Transferi", en:"Knowledge Distillation — Soft Knowledge Transfer"},
      desc: {tr:"Teacher model'in soft probability çıktısı student'a zengin bilgi aktarır. Temperature T↑ → dağılım düzleşir → 'neredeyse doğru' alternatifler de öğrenilir.", en:"Teacher model's soft probability output transfers rich knowledge to student. Temperature T↑ → distribution flattens → 'almost correct' alternatives are also learned."},
      formula: "L = α·KL(σ(z_s/T) || σ(z_t/T))·T² + (1-α)·CE(z_s, y)",
      keyPoint: {tr:"T=1: sadece doğru cevap. T=5: 'a %40, e %30, i %20...' → student ilişkileri öğrenir, sadece cevabı değil.", en:"T=1: only correct answer. T=5: 'a 40%, e 30%, i 20%...' → student learns relationships, not just answers."},
    },
  ],
  "week9_s2": [
    {
      title: {tr:"RoPE — Rotary Position Embedding", en:"RoPE — Rotary Position Embedding"},
      desc: {tr:"Learned PE sabit vektör → context uzunluğu dışına çıkamaz. RoPE vektörü pozisyona göre döndürür → göreceli mesafe çarpma içinde gömülü, sonsuz extrapolation.", en:"Learned PE is a fixed vector → can't extrapolate beyond context length. RoPE rotates vectors by position → relative distance embedded in multiplication, infinite extrapolation."},
      formula: "RoPE(x, pos) = R(pos)·x where R = [[cos θ, -sin θ],[sin θ, cos θ]]",
      code: "# 2D rotasyon sezgisi:\n# pos=0: döndürme yok\n# pos=1: θ kadar döndür\n# pos=2: 2θ kadar döndür\n# q_m · k_n = f(m-n) → mesafe bilgisi otomatik",
      keyPoint: {tr:"LLaMA, Mistral, Qwen, DeepSeek — hepsi RoPE kullanır. microGPT'nin learned PE'si en basit ama en az esnek yöntemdir.", en:"LLaMA, Mistral, Qwen, DeepSeek — all use RoPE. microGPT's learned PE is the simplest but least flexible method."},
    },
  ],
  "week9_s3": [
    {
      title: {tr:"Sparse Attention — Verimli Dikkat", en:"Sparse Attention — Efficient Attention"},
      desc: {tr:"Full attention O(n²) — uzun metinler için ölçeklenmez. Sparse: lokal pencere + birkaç global token → O(n·w). %50 sparsity ≈ %50 FLOPs tasarrufu.", en:"Full attention is O(n²) — doesn't scale for long texts. Sparse: local window + few global tokens → O(n·w). 50% sparsity ≈ 50% FLOPs savings."},
      formula: "FLOPs_sparse ≈ 2 × n × w × d (w << n)",
      keyPoint: {tr:"Longformer: lokal+global. BigBird: lokal+global+random. Mistral: sliding window 4096. Flash Attention: sparse değil ama bellek-optimal.", en:"Longformer: local+global. BigBird: local+global+random. Mistral: sliding window 4096. Flash Attention: not sparse but memory-optimal."},
    },
  ],
  "week9_s4": [
    {
      title: {tr:"Grokking — Gecikmeli Genelleme", en:"Grokking — Delayed Generalization"},
      desc: {tr:"Eğitim loss'u 0 olduktan BİNLERCE epoch sonra test loss'u aniden düşer. Model önce ezberler, sonra yapıyı keşfeder. Weight decay tetikleyici.", en:"Test loss suddenly drops THOUSANDS of epochs after training loss reaches 0. Model first memorizes, then discovers structure. Weight decay is the trigger."},
      formula: "train_loss → 0 at epoch ~300, test_loss → 0 at epoch ~3000",
      keyPoint: {tr:"Grokking erken durdurma (early stopping) ile kaçırılır! Eğer sadece train loss'a bakarsanız 'model yakınsadı' dersiniz — ama daha çok epoch gerekebilir.", en:"Grokking is missed with early stopping! If you only watch train loss you'd say 'model converged' — but more epochs might be needed."},
    },
  ],
  "week9_s5": [
    {
      title: {tr:"Flat vs Sharp Minima", en:"Flat vs Sharp Minima"},
      desc: {tr:"Flat minimum: geniş vadi, ağırlıkları biraz oynatsanız da loss çok artmaz → iyi genelleme. Sharp minimum: dar çukur, küçük pertürbasyon büyük kayıp → overfit.", en:"Flat minimum: wide valley, perturbing weights slightly doesn't increase loss much → good generalization. Sharp minimum: narrow pit, small perturbation = big loss increase → overfit."},
      formula: "Sharpness = max_{||ε||≤ρ} L(w+ε) - L(w)",
      keyPoint: {tr:"SAM optimizer flat minima arar. Büyük batch → sharp, küçük batch → flat. Stochastic noise (SGD) doğal olarak düzleştirir.", en:"SAM optimizer seeks flat minima. Large batch → sharp, small batch → flat. Stochastic noise (SGD) naturally smooths."},
    },
  ],
  "week9_s6": [
    {
      title: {tr:"Ablation — Her Bileşeni Kanıtla", en:"Ablation — Prove Every Component"},
      desc: {tr:"Full model → bileşenleri teker teker çıkar → her birinin katkısını ölç. En az 3 seed, t-test ile p-value. Sonuçları tabloyla sun.", en:"Full model → remove components one by one → measure each one's contribution. At least 3 seeds, p-value via t-test. Present results in tables."},
      keyPoint: {tr:"Güçlü ablation = güçlü tez. 'Multi-head attention olmadan loss %5.9 artar (p<0.01)' bir tez cümlesidir.", en:"Strong ablation = strong thesis. 'Without multi-head attention loss increases by 5.9% (p<0.01)' is a thesis-worthy statement."},
    },
  ],
  "week9_s7": [
    {
      title: {tr:"YL Proje Yol Haritası", en:"Graduate Project Roadmap"},
      desc: {tr:"12 haftalık plan: literatür (2h), baseline (2h), deneyler (4h), yazım (2h), review (1h), savunma (1h). Her hafta 1 tablo/grafik üret → tez kendiliğinden yazılır.", en:"12-week plan: literature (2w), baseline (2w), experiments (4w), writing (2w), review (1w), defense (1w). Produce 1 table/graph per week → thesis writes itself."},
      keyPoint: {tr:"Altın kural: 'Veri olmadan fikir, fikir olmadan veri' — ikisi birlikte ilerlemeli. Her hafta somut çıktı üretin.", en:"Golden rule: 'Ideas without data, data without ideas' — both must progress together. Produce concrete output every week."},
    },
  ],
};

const SlideRefPanel = ({ weekIdx, sectionIdx }) => {
  const lang = useLang();
  const key = `week${weekIdx}_s${sectionIdx}`;
  const cards = EMBEDDED_SLIDES[key];
  if (!cards || cards.length === 0) return null;
  return (
    <div style={{ marginTop: 10, marginBottom: 14 }}>
      {cards.map((card, i) => (
        <div key={i} style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: 14, padding: "18px 20px", marginBottom: i < cards.length - 1 ? 14 : 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#A78BFA", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 20, background: "#A78BFA", borderRadius: 2, flexShrink: 0 }}></span>
            {tx(card.title, lang)}
          </div>

          <p style={{ fontSize: 15, lineHeight: 1.75, color: "#B0B8C4", margin: "0 0 12px 0" }}>{tx(card.desc, lang)}</p>

          {card.formula && (
            <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{lang === "tr" ? "Formül" : "Formula"}</div>
              <pre style={{ margin: 0, fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#C4B5FD", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{tx(card.formula, lang)}</pre>
            </div>
          )}

          {card.example && (
            <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{lang === "tr" ? "Örnek" : "Example"}</div>
              <div style={{ fontSize: 13, color: "#6EE7B7", lineHeight: 1.6 }}>
                <span style={{ color: "#9CA3AF" }}>{lang === "tr" ? "Girdi: " : "Input: "}</span>{tx(card.example.input, lang)}
              </div>
              <div style={{ fontSize: 13, color: "#A7F3D0", lineHeight: 1.6, marginTop: 4 }}>
                <span style={{ color: "#9CA3AF" }}>{lang === "tr" ? "Çıktı: " : "Output: "}</span>{tx(card.example.output, lang)}
              </div>
            </div>
          )}

          {card.code && (
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{lang === "tr" ? "microGPT Kodu" : "microGPT Code"}</div>
              <pre style={{ margin: 0, fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#E2E8F0", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{card.code}</pre>
            </div>
          )}

          {card.keyPoint && (
            <div style={{ background: "rgba(251,191,36,0.06)", borderLeft: "3px solid rgba(251,191,36,0.4)", borderRadius: "0 8px 8px 0", padding: "8px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FBBF24", marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>{lang === "tr" ? "Anahtar Nokta" : "Key Point"}</div>
              <div style={{ fontSize: 13, color: "#FDE68A", lineHeight: 1.6 }}>{tx(card.keyPoint, lang)}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


export { EMBEDDED_SLIDES, SlideRefPanel };
