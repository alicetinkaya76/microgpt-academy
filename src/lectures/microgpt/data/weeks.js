// ─── Lecture Content — All Weeks ─────────────────────────────────
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
        content: "Tek gereksinim: Python 3.6+. pip install gerekmez — sadece os, math, random kullanılır. Kurulum istemiyorsanız Google Colab'da tarayıcıdan çalıştırabilirsiniz!",
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
        content: "GitHub Gist'ten tek dosya indirin ve çalıştırın. Ya da Google Colab'da sıfır kurulumla başlayın → Kaynaklar bölümündeki 🟠 Colab linkine tıklayın! Loss düşüyorsa her şey doğru!",
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
    id: "advanced", week: 8, title: { tr: "İleri Düzey Teknikler & Araştırma Yöntemleri", en: "Advanced Techniques & Research Methods" }, icon: "🔬", color: "#E11D48",
    subtitle: { tr: "BPE bilgi teorisi, Hessian, pruning, isotropy, numerik stabilite, akademik yazım", en: "BPE information theory, Hessian, pruning, isotropy, numerical stability, academic writing" },
    sections: [
      {
        title: { tr: "BPE'nin Bilgi-Teorik Temeli", en: "Information-Theoretic Foundation of BPE" },
        viz: "bpeInfoTheory",
        content: "BPE neden 'en sık komşu çifti' birleştirir? Çünkü sık çiftler → düşük entropi → minimum description length (MDL). Bu, Huffman kodlama ile aynı sezgidir: sık olanı kısa tut.",
        highlight: "BPE = greedy MDL sıkıştırma. Her birleştirme toplam entropi'yi düşürür: H(corpus) ↓ = daha verimli kodlama.",
        code: "# BPE Merge = Entropi Düşüşü:\n# merge('e','s') → 'es' (freq=1847)\n# H_before = -Σ p_i log p_i = 4.23 bits\n# H_after  = -Σ p_i log p_i = 4.18 bits\n# ΔH = -0.05 bits → daha verimli!\n\n# Optimal vocab büyüklüğü:\n# Too small: H↑ (uzun diziler)\n# Too large: H↑ (sparse embedding)\n# Sweet spot: 32K-100K token"
      },
      {
        title: { tr: "Hessian Matrisi — İkinci Türev Bilgisi", en: "Hessian Matrix — Second-Order Information" },
        viz: "hessianLandscape",
        content: "Gradient (1. türev) = 'hangi yöne git'. Hessian (2. türev) = 'yüzey ne kadar eğri/düz'. Düz minimum → daha iyi genelleme. Keskin minimum → overfit riski.",
        highlight: "Newton metodu: w ← w - H⁻¹g. Hessian'ı hesaplamak O(n²) — GPT'de imkansız! Yaklaşımlar: Fisher, K-FAC, Gauss-Newton.",
        code: "# Hessian hesaplama (küçük model):\nimport torch.autograd.functional as F\nH = F.hessian(loss_fn, params)\n\n# Eigenvalue analizi:\nevals = torch.linalg.eigvalsh(H)\nsharpness = evals.max()  # keskinlik\nflatness = 1.0 / sharpness\n\n# microGPT: 3648 parametre\n# H boyutu: 3648 × 3648 = 13.3M eleman"
      },
      {
        title: { tr: "🔬 Attention Head Pruning — Taylor Expansion", en: "🔬 Attention Head Pruning — Taylor Expansion" },
        viz: "headPruning",
        content: "Tüm attention headlar eşit değil! Taylor expansion ile her head'in loss'a katkısını ölçüp gereksiz olanları çıkarabiliriz. |∂L/∂h × h| = head'in önemi.",
        highlight: "GPT-2: 12 head × 12 katman = 144 head. Tipik olarak %30-40'ı prune edilebilir — hız artışı, minimal kayıp.",
        code: "# Head importance skoru (Taylor 1st order):\ndef head_importance(model, data):\n    scores = []\n    for layer in model.transformer.h:\n        attn_out = layer.attn(x)  # [B,T,D]\n        grad = torch.autograd.grad(loss, attn_out)\n        importance = (grad * attn_out).abs().sum()\n        scores.append(importance)\n    return scores\n\n# Prune en düşük %30:\nthreshold = sorted(scores)[int(0.3 * len(scores))]\nmask = [s > threshold for s in scores]"
      },
      {
        title: { tr: "Embedding İzotropi — Neden Önemli?", en: "Embedding Isotropy — Why Does It Matter?" },
        viz: "isotropyViz",
        content: "İzotrop = vektörler uzayda eşit dağılmış. Anizotrop = dar bir konide toplanmış. Çoğu LLM embedding'i anizotrop → benzerlik ölçümü bozulur.",
        highlight: "Cosine similarity hepsi ~0.95 ise 'her şey birbirine benzer' = işe yaramaz. Düzeltme: whitening, normalization.",
        code: "# İzotropi ölçümü:\ndef isotropy(embeddings):\n    # Tüm çift cosine similarity\n    norms = embeddings / embeddings.norm(dim=-1, keepdim=True)\n    sim_matrix = norms @ norms.T\n    # Ortalama off-diagonal similarity\n    mask = ~torch.eye(len(embeddings), dtype=bool)\n    avg_sim = sim_matrix[mask].mean()\n    # İzotrop → avg_sim ≈ 0, Anizotrop → avg_sim → 1\n    return 1.0 - avg_sim.item()  # 1=tam izotrop"
      },
      {
        title: { tr: "Float16 Numerik Stabilite — Softmax Overflow", en: "Float16 Numerical Stability — Softmax Overflow" },
        viz: "numericalStability",
        content: "Float16 max: 65,504. Softmax'ta exp(x) hızla patlar! Çözüm: exp(x - max(x)). Bu değer değiştirmez çünkü exp(a-c)/Σexp(b-c) = exp(a)/Σexp(b).",
        highlight: "Flash Attention'ın numerik stabilitesi bu trick'e dayanır. microGPT'de de math.exp(x - max_x) kullanılır!",
        code: "# YANLIŞ — overflow riski:\ndef naive_softmax(x):\n    return [math.exp(xi) / sum(math.exp(xj) for xj in x) for xi in x]\n\n# DOĞRU — numerik stabil:\ndef safe_softmax(x):\n    max_x = max(x)  # max çıkar\n    exps = [math.exp(xi - max_x) for xi in x]\n    total = sum(exps)\n    return [e / total for e in exps]\n\n# microGPT satır 142 — tam olarak bunu yapar!"
      },
      {
        title: { tr: "Kontrollü Deney Tasarımı — Ablation Study", en: "Controlled Experiment Design — Ablation Study" },
        viz: "ablationDesign",
        content: "Ablation = bir bileşeni çıkarıp etkisini ölç. Kontrol değişkeni: her seferinde SADECE 1 şey değişir. Seed sabitle, 3+ tekrar yap, standart sapma raporla.",
        highlight: "Kötü deney: 'n_embd=32 ve n_layer=2 denedik, iyi oldu.' İyi deney: 'n_embd=16→32 (diğerleri sabit): loss 2.31→2.18 (±0.04, n=5)'",
        code: "# Sistematik ablation framework:\nimport json, statistics\n\ndef run_ablation(base_config, param, values, seeds=[42,123,456]):\n    results = {}\n    for val in values:\n        config = {**base_config, param: val}\n        losses = [train_and_eval(config, seed=s) for s in seeds]\n        results[val] = {\n            'mean': statistics.mean(losses),\n            'std': statistics.stdev(losses),\n            'n': len(seeds)\n        }\n    return results  # → tablo ve grafik için"
      },
      {
        title: { tr: "Akademik Rapor Yapısı — Related Work", en: "Academic Report Structure — Related Work" },
        content: "Araştırma makalesi yapısı: Abstract → Introduction → Related Work → Method → Experiments → Results → Discussion → Conclusion. Related Work: alanı tanı, boşluğu göster, katkını konumla.",
        highlight: "Related Work = 'başkaları X yaptı, biz Y'yi farklı yapıyoruz çünkü Z'. Her iddia citation ile desteklenmeli.",
        code: "# Makale yapısı kontrol listesi:\npaper_structure = {\n    'abstract': '100-300 kelime, bağımsız özet',\n    'introduction': 'Motivasyon → Problem → Katkı → Yol haritası',\n    'related_work': 'Alanı tara → Boşluğu göster → Konumlan',\n    'method': 'Tekrarlanabilir detay + formüller',\n    'experiments': 'Veri + Metrik + Baseline + Ablation',\n    'results': 'Tablo + Grafik + İstatistik',\n    'discussion': 'Limitasyon + Gelecek iş',\n    'references': 'BibTeX, tutarlı format'\n}"
      },
      {
        title: { tr: "🧪 İleri Lab — microGPT Ablation Deneyi", en: "🧪 Advanced Lab — microGPT Ablation Experiment" },
        content: "Gerçek bir ablation deneyi tasarlayın: n_embd ∈ {8, 16, 32, 64} için loss karşılaştırması. 3 seed ile tekrar, std raporla. Sonuçları tablo ve grafikle sunun.",
        highlight: "Bu lab bir YL tezinin deney bölümünü simüle eder. Sonuçlarınızı academic format'ta raporlayın.",
        code: "# microGPT ablation komutu:\nfor embd in 8 16 32 64; do\n  for seed in 42 123 456; do\n    python3 microgpt.py --n_embd $embd --seed $seed \\\n      --num_steps 1000 > results/embd${embd}_s${seed}.log\n  done\ndone\n\n# Sonuçları parse et:\nimport glob, re\nfor f in sorted(glob.glob('results/*.log')):\n    final_loss = float(re.findall(r'loss ([\d.]+)', open(f).read())[-1])\n    print(f'{f}: {final_loss:.4f}')"
      }
    ]
  },

  {
    id: "frontiers", week: 9, title: { tr: "Araştırma Sınırları & YL Proje Rehberi", en: "Research Frontiers & Graduate Project Guide" }, icon: "🎓", color: "#7C3AED",
    subtitle: { tr: "NAS, distillation, RoPE, sparse attention, grokking, flat minima, proje planlama", en: "NAS, distillation, RoPE, sparse attention, grokking, flat minima, project planning" },
    sections: [
      {
        title: { tr: "Neural Architecture Search (NAS) — Pareto Frontı", en: "Neural Architecture Search (NAS) — Pareto Front" },
        viz: "nasPareto",
        content: "NAS = mimariyi de öğren! Arama uzayı: katman sayısı, head sayısı, n_embd, MLP boyutu. Pareto frontı: performans vs maliyet trade-off'unda optimal noktalar kümesi.",
        highlight: "Pareto-optimal: A'dan daha iyi B yoktur hem performans HEM maliyet açısından. Karar vericiye bırakılır: hız mı kalite mi?",
        code: "# NAS arama uzayı (microGPT):\nsearch_space = {\n    'n_embd': [8, 16, 32, 64, 128],\n    'n_layer': [1, 2, 4, 6],\n    'n_head': [1, 2, 4],\n    'lr': [1e-2, 3e-3, 1e-3],\n}\n\n# Grid search → Pareto frontı bul:\nresults = []\nfor config in product(*search_space.values()):\n    loss = train_eval(config)\n    params = count_params(config)\n    results.append((params, loss, config))\n\n# Pareto filter:\npareto = [r for r in results\n    if not any(r2[0]<=r[0] and r2[1]<r[1] for r2 in results)]"
      },
      {
        title: { tr: "Knowledge Distillation — Büyükten Küçüğe Transfer", en: "Knowledge Distillation — Large to Small Transfer" },
        viz: "distillationFlow",
        content: "Teacher (büyük model) soft probability dağılımını student'a öğretir. Yüksek T: dağılım yumuşak → 'yanlış' cevaplardan bile bilgi akışı. Loss = α·CE_hard + (1-α)·KL_soft.",
        highlight: "T=1'de student sadece doğru cevabı öğrenir. T=5'te 'neredeyse doğru' alternatifleri de öğrenir → daha zengin bilgi.",
        code: "# Distillation loss:\ndef distill_loss(student_logits, teacher_logits, labels, T=4, alpha=0.7):\n    # Hard loss (normal cross-entropy)\n    hard = F.cross_entropy(student_logits, labels)\n    \n    # Soft loss (teacher'dan öğren)\n    soft_student = F.log_softmax(student_logits / T, dim=-1)\n    soft_teacher = F.softmax(teacher_logits / T, dim=-1)\n    soft = F.kl_div(soft_student, soft_teacher, reduction='batchmean') * (T**2)\n    \n    return alpha * soft + (1 - alpha) * hard"
      },
      {
        title: { tr: "RoPE — Rotary Position Embedding", en: "RoPE — Rotary Position Embedding" },
        viz: "ropeViz",
        content: "Learned PE: her pozisyon sabit vektör (context dışına genellemez). RoPE: vektörü pozisyona göre DÖNDÜR → göreceli mesafe doğal olarak kodlanır. cos/sin rotasyon matrisi.",
        highlight: "RoPE'un büyüsü: q_m · k_n sadece (m-n) farkına bağlı → mesafe bilgisi çarpma içinde gömülü. Extrapolation bedava!",
        code: "# RoPE implementasyonu:\ndef apply_rope(x, pos):\n    d = x.shape[-1]\n    freqs = 1.0 / (10000 ** (torch.arange(0, d, 2) / d))\n    angles = pos.unsqueeze(-1) * freqs  # [T, d/2]\n    cos_a, sin_a = angles.cos(), angles.sin()\n    \n    x1, x2 = x[..., ::2], x[..., 1::2]  # çift/tek\n    # 2D rotasyon: [cos -sin; sin cos] × [x1; x2]\n    return torch.cat([\n        x1 * cos_a - x2 * sin_a,\n        x1 * sin_a + x2 * cos_a\n    ], dim=-1)\n\n# microGPT: learned PE → RoPE upgrade\n# wpe(pos) yerine apply_rope(q, pos), apply_rope(k, pos)"
      },
      {
        title: { tr: "Sparse Attention — O(n²) → O(n√n)", en: "Sparse Attention — O(n²) → O(n√n)" },
        viz: "sparseAttention",
        content: "Full attention: her token herkese bakar → O(n²). Sparse: sadece lokal pencere + global tokenlar → O(n√n). %50 sparsity ≈ %50 FLOPs tasarrufu ama kalite kaybı minimal.",
        highlight: "Longformer: lokal + global. BigBird: lokal + global + random. Mistral: sliding window. Flash Attention: sparse değil ama IO-optimal.",
        code: "# Sparse attention mask patterns:\ndef local_mask(seq_len, window=256):\n    mask = torch.zeros(seq_len, seq_len, dtype=torch.bool)\n    for i in range(seq_len):\n        start = max(0, i - window)\n        mask[i, start:i+1] = True\n    return mask\n\ndef global_local_mask(seq_len, window=256, n_global=4):\n    mask = local_mask(seq_len, window)\n    mask[:, :n_global] = True   # ilk n token global\n    mask[:n_global, :] = True\n    return mask\n\n# FLOPs karşılaştırma:\n# Full: 2 × n² × d = 2 × 1024² × 64 = 134M\n# Sparse (w=256): ≈ 2 × n × w × d = 33M (75% ↓)"
      },
      {
        title: { tr: "Grokking Fenomeni — Geç Genelleme", en: "Grokking Phenomenon — Delayed Generalization" },
        viz: "grokkingViz",
        content: "Garip olay: eğitim loss'u çoktan 0 olmuşken, test loss'u BİNLERCE epoch sonra aniden düşer! Memorize → generalize geçişi. Weight decay ve regularization tetikleyici.",
        highlight: "Grokking = 'aha anı'. Model önce ezberleri, sonra yapıyı keşfeder. Erken durdurma (early stopping) grokking'i kaçırabilir!",
        code: "# Grokking deneyi (modular arithmetic):\n# Veri: (a + b) mod 97 = c\nimport random\nN = 97\ndata = [(a, b, (a+b) % N) for a in range(N) for b in range(N)]\nrandom.shuffle(data)\ntrain = data[:len(data)//2]\ntest  = data[len(data)//2:]\n\n# Eğitim: ~300 epoch'ta train_loss → 0\n#         ~3000 epoch'ta test_loss → 0 (GROKKING!)\n# Anahtar: weight_decay=0.01 olmadan grokking yok"
      },
      {
        title: { tr: "Loss Landscape — Flat vs Sharp Minima", en: "Loss Landscape — Flat vs Sharp Minima" },
        viz: "lossLandscape",
        content: "Flat minimum = geniş vadi, küçük perturbasyonlara dayanıklı → iyi genelleme. Sharp minimum = dar çukur, hafif kayma = büyük loss artışı → kötü genelleme.",
        highlight: "SAM optimizer: 'en kötü komşuda bile iyi ol' → flat minima arar. Large batch = sharp, small batch = flat.",
        code: "# Sharpness-Aware Minimization (SAM):\ndef sam_step(model, loss_fn, data, rho=0.05):\n    # 1. Normal gradient hesapla\n    loss = loss_fn(model(data))\n    loss.backward()\n    \n    # 2. En kötü komşuya git (perturbation)\n    with torch.no_grad():\n        for p in model.parameters():\n            e = rho * p.grad / p.grad.norm()\n            p.add_(e)  # worst-case neighbor\n    \n    # 3. O noktada gradient hesapla\n    loss2 = loss_fn(model(data))\n    loss2.backward()\n    \n    # 4. Geri dön ve SAM gradient ile güncelle\n    with torch.no_grad():\n        for p in model.parameters():\n            p.sub_(e)  # geri dön\n    optimizer.step()  # SAM gradient"
      },
      {
        title: { tr: "Ablation Study — Sistematik Deney Rehberi", en: "Ablation Study — Systematic Experiment Guide" },
        content: "Her YL projesinde ablation zorunlu. Amaç: her bileşenin katkısını kanıtla. Template: Full model → -component A → -component B → ... En az 3 seed, p-value raporla.",
        highlight: "İyi ablation: 'Attention head sayısı 4→2'ye düşünce loss %3.2±0.4 arttı (p<0.05).' Kötü ablation: 'Attention iyi çalışıyor.'",
        code: "# Ablation tablo template:\n# ┌──────────────────┬────────┬────────┬─────────┐\n# │ Konfigürasyon     │ Loss   │ Params │ p-value │\n# ├──────────────────┼────────┼────────┼─────────┤\n# │ Full model       │ 2.18   │ 3,648  │ —       │\n# │ − Multi-head     │ 2.31   │ 3,520  │ 0.003   │\n# │ − Layer norm     │ 2.42   │ 3,616  │ 0.001   │\n# │ − Residual       │ 2.67   │ 3,648  │ <0.001  │\n# │ − Embedding dim/2│ 2.45   │ 1,024  │ 0.008   │\n# └──────────────────┴────────┴────────┴─────────┘\n\n# p-value hesaplama:\nfrom scipy import stats\nt_stat, p_val = stats.ttest_ind(full_losses, ablated_losses)"
      },
      {
        title: { tr: "🎓 YL Proje Yol Haritası — Başlangıçtan Savunmaya", en: "🎓 Graduate Project Roadmap — From Start to Defense" },
        content: "12 haftalık plan: H1-2: Literatür taraması + araştırma sorusu. H3-4: Baseline implementasyon. H5-8: Deneyler + ablation. H9-10: Yazım. H11: Review. H12: Savunma hazırlık.",
        highlight: "Altın kural: Her hafta 1 tablo/grafik üret. 12 hafta = 12 sonuç. Tez kendiliğinden yazılır.",
        code: "# YL Proje kontrol listesi:\nproject_plan = {\n    'week_1_2': 'Literatür: 20+ makale oku, RW yaz',\n    'week_3_4': 'Baseline: microGPT çalıştır, metrik belirle',\n    'week_5_6': 'Deney 1: Ana hipotezi test et',\n    'week_7_8': 'Deney 2: Ablation + karşılaştırma',\n    'week_9': 'Grafik ve tablo hazırla',\n    'week_10': 'Yazım: Method + Experiments',\n    'week_11': 'Peer review + revizyon',\n    'week_12': 'Sunum hazırla + prova'\n}\n\n# Her deney için kayıt:\nexperiment_log = {\n    'date': '2025-01-15',\n    'config': {'n_embd': 32, 'n_layer': 2},\n    'seed': [42, 123, 456],\n    'result': {'mean_loss': 2.18, 'std': 0.04},\n    'notes': 'Residual bağlantı kritik'\n}"
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

export { WEEKS };
