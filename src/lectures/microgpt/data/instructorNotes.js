import React, { useState, useEffect, useRef } from 'react';
import { useLang, tx } from '../../../core/i18n';
import { VB } from '../../../components/SharedComponents';

const INSTRUCTOR_NOTES = {
  // W0
  "week0_s0": { time: 10, difficulty: 1, prep: {tr:"microGPT'yi önceden çalıştırın, 2-3 isim üretin. Öğrencilere canlı gösterin.", en:"Run microGPT beforehand, generate 2-3 names. Show students live."}, emphasize: {tr:"243 satır = gerçek GPT. Aynı algoritma, sadece ölçek farkı.", en:"243 lines = real GPT. Same algorithm, only difference is scale."}, studentQs: [
    { q: "Bu gerçek GPT mi?", a: "Evet! Aynı Transformer mimarisi. GPT-4 ile fark sadece parametre sayısı (3,648 vs ~1.8T) ve eğitim verisi." },
    { q: "Neden Python? Neden C++ değil?", a: "Okunabilirlik. Amaç öğrenmek, hız değil. Production'da PyTorch/C++ kullanılır." }
  ], cheatSheet: "microGPT: 243 satır, 3,648 param, 27 token vocab, 16-dim embedding, 4 head, 1 layer, block_size=8" },
  "week0_s1": { time: 5, difficulty: 1, prep: {tr:"Basit bir sinir ağı diyagramı tahtaya çizin (3 daire → 2 daire → 1 daire).", en:"Draw a simple neural network diagram on the board (3 circles → 2 circles → 1 circle)."}, emphasize: {tr:"Sinir ağı = çarpma + toplama. Korkutucu değil.", en:"Neural network = multiplication + addition. Not scary."}, studentQs: [
    { q: "Biyolojik nöronla ilgisi var mı?", a: "İsim oradan geliyor ama benzerlik yüzeysel. Matematiksel fonksiyon olarak düşünün." }
  ], cheatSheet: "Nöron: output = activation(w₁x₁ + w₂x₂ + ... + b)" },
  "week0_s2": { time: 5, difficulty: 1, emphasize: {tr:"Dil modeli = P(sonraki token | öncekiler). Tüm ders bu TEK cümle üzerine kurulu.", en:"Language model = P(next token | previous). The entire course is built on this SINGLE sentence."}, studentQs: [
    { q: "ChatGPT de aynı şeyi mi yapıyor?", a: "Evet! Her seferinde bir sonraki tokeni tahmin eder. 'Akıllılık' çok büyük ölçekten geliyor." }
  ], cheatSheet: "Dil modeli: P(xₜ | x₁, x₂, ..., xₜ₋₁) — koşullu olasılık" },
  "week0_s3": { time: 8, difficulty: 2, prep: {tr:"Pipeline diyagramını tahtaya çizin. Her kutuyu renklendirin.", en:"Draw the pipeline diagram on the board. Color-code each box."}, emphasize: {tr:"Bu pipeline W1-W6'da detaylı işlenecek. Şimdi büyük resmi görsünler.", en:"This pipeline will be detailed in W1-W6. Let them see the big picture now."}, studentQs: [
    { q: "Her adım ne kadar sürer?", a: "microGPT'de mikrosaniyeler. GPT-4'te bir token ~50ms. Ama milyarlarca parametre çarpılıyor." }
  ], cheatSheet: "Pipeline: Token → Embed → Pos → Attention → MLP → Softmax → Sample" },
  "week0_s4": { time: 3, difficulty: 1, emphasize: {tr:"Framework'ler kara kutu, biz cam kutu yapıyoruz. Analoji: araba kullanmak vs motor anlamak.", en:"Frameworks are black boxes, we're making a glass box. Analogy: driving vs understanding the engine."} },
  "week0_s5": { time: 5, difficulty: 1, prep: {tr:"Python 3.10+ ve metin editörü hazır olsun. Canlı kurulum gösterin.", en:"Have Python 3.10+ and text editor ready. Show live setup."}, emphasize: {tr:"GPU gerekmez. Laptop yeterli. 3 dakikada eğitim biter.", en:"No GPU needed. Laptop is enough. Training finishes in 3 minutes."} },
  "week0_s6": { time: 8, difficulty: 1, prep: {tr:"Terminalde python microgpt.py çalıştırın. Loss düşüşünü ve isim üretimini gösterin.", en:"Run python microgpt.py in terminal. Show loss decrease and name generation."}, emphasize: {tr:"İlk çalıştırma anı öğrenciler için çok motivasyonel. Hep birlikte yapın.", en:"First run is very motivational for students. Do it together."}, studentQs: [
    { q: "Neden garip isimler üretiyor?", a: "Model İngilizce isim istatistiklerini öğreniyor. Gerçek olmayan ama 'İngilizce gibi duran' isimler üretiyor." }
  ] },
  "week0_s7": { time: 10, difficulty: 2, prep: {tr:"7 parametreyi değiştirerek 2-3 farklı sonuç hazırlayın.", en:"Prepare 2-3 different results by changing the 7 parameters."}, emphasize: {tr:"n_embd ve n_layer'ı değiştirerek loss farkını gösterin. Öğrencilere de denetin.", en:"Show loss difference by changing n_embd and n_layer. Let students experiment too."}, studentQs: [
    { q: "En iyi parametreler ne?", a: "Harika soru — bunu sistematik olarak araştırabilirsinizacağız (NAS projesi)!" }
  ], cheatSheet: "7 param: n_embd=16, n_head=4, n_layer=1, block_size=8, batch=32, lr=0.01, steps=1000" },
  // W1
  "week1_s0": { time: 8, difficulty: 2, prep: {tr:"'emma' ismini tahtaya yazıp tokenize edin: → [BOS, e, m, m, a, BOS]", en:"Write 'emma' on the board and tokenize it: → [BOS, e, m, m, a, BOS]"}, emphasize: {tr:"Token = modelin gördüğü en küçük birim. Karakter düzeyinde = her harf bir token.", en:"Token = smallest unit the model sees. Character-level = each letter is a token."}, studentQs: [
    { q: "GPT-4 de karakter karakter mı bakıyor?", a: "Hayır, BPE kullanıyor: 'playing' → ['play', 'ing']. Biz basitlik için karakter düzeyi kullanıyoruz." },
    { q: "Neden 27 token?", a: "a-z (26) + özel BOS/EOS tokeni (1) = 27. İsimler sadece küçük harften oluşuyor." }
  ], cheatSheet: "Vocab: a-z (26) + BOS (0) = 27 token. stoi: char→int, itos: int→char" },
  "week1_s1": { time: 5, difficulty: 2, emphasize: {tr:"Embedding = anlamsız ID'yi anlamlı vektöre çevirme. Tablo araması (lookup), eğitimle öğrenilir.", en:"Embedding = converting meaningless ID to meaningful vector. Table lookup, learned through training."}, cheatSheet: "wte: [27 × 16] matris. embed('a') = wte[1] → 16-boyutlu vektör" },
  "week1_s2": { time: 5, difficulty: 2, emphasize: {tr:"Transformer sıra bilmez! Pozisyon embedding olmadan 'abc' = 'cba'. Bu çok şaşırtıcı.", en:"Transformer doesn't know order! Without position embedding 'abc' = 'cba'. This is very surprising."}, cheatSheet: "wpe: [8 × 16] matris. Toplam girdi = wte[token_id] + wpe[position]" },
  "week1_s3": { time: 5, difficulty: 3, emphasize: {tr:"Softmax = ham skorları olasılığa çevirme. Toplam her zaman 1.", en:"Softmax = converting raw scores to probabilities. Sum is always 1."}, studentQs: [
    { q: "Neden exp kullanıyoruz?", a: "Negatif sayıları pozitif yapmak + büyük farkları daha belirgin yapmak. exp(10)/exp(1) ≈ 8100×" }
  ], cheatSheet: "softmax(xᵢ) = exp(xᵢ) / Σexp(xⱼ). Max-trick: softmax(x) = softmax(x - max(x))" },
  // W2
  "week2_s0": { time: 10, difficulty: 3, prep: {tr:"Basit örnek hazırlayın: f(x)=x², df/dx=2x. x=3 → f=9, df=6.", en:"Prepare simple example: f(x)=x², df/dx=2x. x=3 → f=9, df=6."}, emphasize: {tr:"Autograd olmadan öğrenme yok. Bu haftanın konusu dersin TEMELİ.", en:"No autograd, no learning. This week's topic is the FOUNDATION of the course."}, studentQs: [
    { q: "Bunun GPT ile ne ilgisi var?", a: "GPT parametrelerini nasıl güncelliyor? Loss → gradient → güncelleme. Bu sürecin motoru autograd." }
  ], cheatSheet: "Autograd: forward(hesapla) → backward(türev al) → güncelle(w -= lr * grad)" },
  "week2_s1": { time: 8, difficulty: 3, emphasize: {tr:"Her Value: data + grad + backward fonksiyonu. 3 bileşen, hepsi bu.", en:"Each Value: data + grad + backward function. 3 components, that's it."}, cheatSheet: "Value(data=3.0, grad=0.0, _backward=lambda: None)" },
  "week2_s2": { time: 8, difficulty: 4, prep: {tr:"Chain rule örneği tahtada: f(g(x)) = (3x+1)². df/dx = 2(3x+1)·3", en:"Chain rule example on board: f(g(x)) = (3x+1)². df/dx = 2(3x+1)·3"}, emphasize: {tr:"Chain rule = autograd'ın TEK sırrı. Bunu anladıklarında geri kalanı kolay.", en:"Chain rule = autograd's ONLY secret. Once they get this, the rest is easy."}, studentQs: [
    { q: "Birden fazla girdi olunca ne olur?", a: "Partial derivative: her girdi için ayrı ayrı türev al, diğerlerini sabit tut." }
  ], cheatSheet: "Chain rule: ∂L/∂x = ∂L/∂y · ∂y/∂x. Multiply: ∂(a·b)/∂a = b, ∂(a·b)/∂b = a" },
  // W3
  "week3_s0": { time: 5, difficulty: 2, emphasize: {tr:"RNN → sıralı darboğaz. Attention → paralel + uzun mesafe. 2017 devrim.", en:"RNN → sequential bottleneck. Attention → parallel + long range. 2017 revolution."}, cheatSheet: "RNN: O(n) sıralı. Attention: O(n²) paralel → GPU'da çok daha hızlı" },
  "week3_s1": { time: 10, difficulty: 4, prep: {tr:"3 token örneği hazırlayın: 'a','b','c'. Q,K,V matrislerini 2×2 yapın. Elle hesaplayın.", en:"Prepare 3-token example: 'a','b','c'. Make Q,K,V matrices 2×2. Compute by hand."}, emphasize: {tr:"Attention = her token tüm önceki tokenlara bakıp 'hangisi bana lazım?' diyor. Kütüphane analojisi.", en:"Attention = each token looks at all previous tokens and asks 'which one do I need?' Library analogy."}, studentQs: [
    { q: "Neden Q, K, V ayrı?", a: "Q = 'ne arıyorum', K = 'bende ne var', V = 'bilgim ne'. Rol ayrımı → esneklik." },
    { q: "Bu O(n²) değil mi? Yavaş olmaz mı?", a: "Evet, ama GPU ile paralelize edilebilir. Ve Flash Attention gibi teknikler var (W7'de göreceğiz)." }
  ], cheatSheet: "Attention(Q,K,V) = softmax(QKᵀ/√d)·V. d=head_dim=n_embd/n_head=16/4=4" },
  "week3_s2": { time: 8, difficulty: 4, emphasize: {tr:"Scaled dot-product'ın 'scaled' kısmı kritik. √d olmadan gradientler çok büyük olur.", en:"The 'scaled' part of scaled dot-product is critical. Without √d, gradients explode."}, cheatSheet: "score = Q·Kᵀ / √d_k. d_k=4 → /2. Büyük d_k → küçük gradient → daha kararlı" },
  // W4
  "week4_s0": { time: 8, difficulty: 3, prep: {tr:"Transformer bloğu diyagramı çizin: Input → Norm → Attention → +Residual → Norm → MLP → +Residual", en:"Draw Transformer block diagram: Input → Norm → Attention → +Residual → Norm → MLP → +Residual"}, emphasize: {tr:"Transformer = Lego. Attention + MLP bloklarını üst üste koy.", en:"Transformer = Lego. Stack attention + MLP blocks on top of each other."}, cheatSheet: "x = x + Attention(Norm(x)). x = x + MLP(Norm(x)). Residual connection = toplama" },
  "week4_s1": { time: 5, difficulty: 3, emphasize: {tr:"RMSNorm: x/√(mean(x²)+ε). LayerNorm'dan %30 hızlı, modern standart.", en:"RMSNorm: x/√(mean(x²)+ε). 30% faster than LayerNorm, modern standard."}, cheatSheet: "RMSNorm(x) = x · γ / √(mean(x²) + ε). γ öğrenilebilir, ε=1e-5" },
  "week4_s2": { time: 8, difficulty: 3, emphasize: {tr:"MLP: genişlet → aktive et → daralt. 16→64→16. Token içi bilgi işleme.", en:"MLP: expand → activate → compress. 16→64→16. Intra-token information processing."}, cheatSheet: "MLP(x) = W₂ · activation(W₁ · x + b₁) + b₂. Hidden=4×n_embd=64" },
  // W5
  "week5_s0": { time: 5, difficulty: 2, emphasize: {tr:"Eğitim = loss'u minimize et. Loss düşüyorsa model öğreniyor.", en:"Training = minimize loss. If loss is decreasing, model is learning."}, cheatSheet: "Eğitim döngüsü: forward → loss → backward → step → zero_grad → tekrarla" },
  "week5_s1": { time: 8, difficulty: 3, emphasize: {tr:"Cross-entropy: -log(P(doğru)). P=1 → loss=0, P=0.01 → loss=4.6. Log çok sert cezalandırır.", en:"Cross-entropy: -log(P(correct)). P=1 → loss=0, P=0.01 → loss=4.6. Log penalizes harshly."}, studentQs: [
    { q: "Neden MSE değil de cross-entropy?", a: "Olasılık dağılımları için cross-entropy daha uygun. MSE gradient'i küçük olasılıklarda çok yavaş." }
  ], cheatSheet: "CE = -log(P(doğru)). Rastgele: -log(1/27)=3.33. İyi model: -log(0.3)≈1.2" },
  "week5_s2": { time: 10, difficulty: 4, prep: {tr:"2D loss landscape çizimi hazırlayın (vadi + top analojisi).", en:"Prepare 2D loss landscape drawing (valley + ball analogy)."}, emphasize: {tr:"GD: gradient'in tersi yönünde adım at. LR çok büyük → patlama, çok küçük → yavaş.", en:"GD: step in opposite direction of gradient. LR too large → explosion, too small → slow."}, cheatSheet: "w = w - lr × ∂L/∂w. lr=0.01. Adam: momentum + adaptive LR per parameter" },
  // W6
  "week6_s0": { time: 8, difficulty: 2, prep: {tr:"Canlı demo: temperature=0.1 vs 1.0 vs 2.0 ile isim üretin.", en:"Live demo: generate names with temperature=0.1 vs 1.0 vs 2.0."}, emphasize: {tr:"Üretim = eğitimin tersi. Forward pass + sample. Temperature ile çeşitlilik ayarı.", en:"Generation = reverse of training. Forward pass + sample. Temperature adjusts diversity."}, studentQs: [
    { q: "Temperature neden 'sıcaklık' deniyor?", a: "Fizikten geliyor: yüksek sıcaklık → daha kaotik parçacıklar → daha rastgele dağılım." }
  ], cheatSheet: "logits/T → softmax → sample. T=0.1: deterministik, T=1: normal, T=2: kaotik" },
  "week6_s1": { time: 5, difficulty: 3, emphasize: {tr:"KV cache: önceki pozisyonları tekrar hesaplama → O(n) yerine O(1) per token.", en:"KV cache: don't recompute previous positions → O(1) per token instead of O(n)."}, cheatSheet: "Cache K,V her pozisyonda. Yeni token: sadece 1 Q hesapla, cache'ten K,V al" },
  // W7
  "week7_s0": { time: 8, difficulty: 2, emphasize: {tr:"Scaling laws = AI'ın Moore Yasası. 10× param → belirli miktarda loss düşüşü.", en:"Scaling laws = AI's Moore's Law. 10× params → specific amount of loss decrease."}, cheatSheet: "L(N) = a/N^b. Chinchilla optimal: D ≈ 20N (20 token per parametre)" },
  "week7_s1": { time: 10, difficulty: 1, prep: {tr:"Timeline'ı ekranda gösterip her dönemi tek tek geçin.", en:"Show the timeline on screen and walk through each era one by one."}, emphasize: {tr:"2017→2024: 7 yılda dünya değişti. Transformer tek makale ile başladı.", en:"2017→2024: world changed in 7 years. Transformer started from a single paper."} },
  "week7_s3": { time: 8, difficulty: 2, emphasize: {tr:"Pre-training (%95 maliyet) → SFT → RLHF. RLHF akıl vermez, davranış düzeltir.", en:"Pre-training (95% cost) → SFT → RLHF. RLHF doesn't add intelligence, it corrects behavior."}, studentQs: [
    { q: "ChatGPT neden bazen yanlış söylüyor?", a: "Pre-training'de yanlış bilgi de öğreniyor. RLHF sadece FORMAT'ı (kibarlık, yapı) düzeltir, BİLGİ'yi düzeltmez." }
  ] },
  // W8-W9
  // W0 remaining
  "week0_s8": { time: 5, difficulty: 1, prep: {tr:"Terminal açık olsun. python microgpt.py komutunu birlikte çalıştırın.", en:"Have terminal open. Run python microgpt.py together."}, emphasize: {tr:"İlk çalıştırma öğrenciler için büyülü an. Hep birlikte yapın!", en:"First run is a magical moment for students. Do it together!"}, studentQs: [
    { q: "Hata aldım?", a: "Python versiyonunu kontrol edin (3.8+). Dosya yolunu kontrol edin. En yaygın hata: yanlış dizin." }
  ] },
  "week0_s9": { time: 10, difficulty: 2, prep: {tr:"n_embd=8 vs 32, steps=100 vs 1000 sonuçlarını önceden hazırlayın.", en:"Prepare results for n_embd=8 vs 32, steps=100 vs 1000 beforehand."}, emphasize: {tr:"Parametreleri değiştirmek = deney yapmak. Bu bilimsel sürecin başlangıcı.", en:"Changing parameters = experimenting. This is the beginning of the scientific process."}, studentQs: [
    { q: "Hangi parametre en önemli?", a: "n_embd ve n_layer loss'a en çok etki eder. Bunu sistematik deneylerle araştırabilirsiniz." }
  ] },
  "week0_s10": { time: 5, difficulty: 1, emphasize: {tr:"Türkçe isimler, şehir adları, kelimeler... veri değiştirmek çok kolay.", en:"Turkish names, city names, words... changing data is very easy."}, studentQs: [
    { q: "Türkçe çalışır mı?", a: "Evet ama Türkçe harfler (ğ,ü,ş,ı,ö,ç) vocab'a eklenmeli. Vocab 27→33 olur." }
  ] },
  "week0_s11": { time: 5, difficulty: 1, emphasize: {tr:"Eğitim ilerledikçe isimler daha gerçekçi olur. Loss düşüşünü gösterin.", en:"Names become more realistic as training progresses. Show the loss decrease."} },
  "week0_s12": { time: 5, difficulty: 1, emphasize: {tr:"microGPT → GPT-4: aynı algoritma, farklı ölçek. Bu ders o köprüyü kuruyor.", en:"microGPT → GPT-4: same algorithm, different scale. This course builds that bridge."} },
  // W1 remaining
  "week1_s4": { time: 10, difficulty: 2, prep: {tr:"Tokenizer playground'u açın. 'emma', 'michael', 'x' yazarak farkları gösterin.", en:"Open tokenizer playground. Type 'emma', 'michael', 'x' to show differences."}, emphasize: {tr:"İnteraktif deney: öğrenciler kendi isimlerini tokenize etsin.", en:"Interactive experiment: have students tokenize their own names."} },
  "week1_s5": { time: 5, difficulty: 2, emphasize: {tr:"Vektör = yönlü büyüklük. [0.3, -0.1, 0.8] = 3 boyutlu uzayda nokta.", en:"Vector = directed magnitude. [0.3, -0.1, 0.8] = point in 3D space."}, cheatSheet: "Vektör: v ∈ ℝⁿ. microGPT: n=16. Benzerlik: cos(a,b) = a·b / (|a||b|)" },
  "week1_s6": { time: 5, difficulty: 2, emphasize: {tr:"Embedding tablosu = öğrenilebilir sözlük. wte[5] = 'e' harfinin vektörü.", en:"Embedding table = learnable dictionary. wte[5] = vector for letter 'e'."}, cheatSheet: "wte: [27×16]. Lookup: embed(token_id) = wte[token_id]. Eğitimle güncellenir" },
  "week1_s7": { time: 5, difficulty: 2, emphasize: {tr:"'abc' ve 'cba' position embedding olmadan AYNI görünür. Bu çok şaşırtıcı.", en:"'abc' and 'cba' look THE SAME without position embedding. This is very surprising."}, cheatSheet: "wpe: [8×16]. x = wte[tok] + wpe[pos]. block_size=8 → max 8 pozisyon" },
  "week1_s8": { time: 5, difficulty: 3, emphasize: {tr:"Matris çarpımı = embedding'den sonraki HER adımın temeli. y = Wx + b", en:"Matrix multiplication = foundation of EVERY step after embedding. y = Wx + b"}, cheatSheet: "[M×K] · [K×N] = [M×N]. microGPT: [batch×16] · [16×64] = [batch×64]" },
  "week1_s9": { time: 5, difficulty: 2, emphasize: {tr:"Weight tying: aynı matris giriş+çıkışta → parametre tasarrufu + tutarlılık.", en:"Weight tying: same matrix for input+output → parameter savings + consistency."}, cheatSheet: "logits = x @ wte.T (transpoz). 3,648 parametrenin önemli kısmı wte'de" },
  "week1_s10": { time: 5, difficulty: 2, emphasize: {tr:"Softmax: ham skor → olasılık. Toplam=1. exp kullanarak negatifi pozitife çevirir.", en:"Softmax: raw score → probability. Sum=1. Uses exp to convert negatives to positives."}, cheatSheet: "softmax(xᵢ) = exp(xᵢ)/Σexp(xⱼ). Max-trick: overflow önleme. Σ=1 her zaman" },
  // W2 remaining
  "week2_s3": { time: 5, difficulty: 3, emphasize: {tr:"Kısmi türev: birden fazla değişken olunca her birini ayrı türevle.", en:"Partial derivative: with multiple variables, take derivative w.r.t. each separately."}, cheatSheet: "∂f/∂x: x'e göre türev, y sabit. Gradient: ∇f = [∂f/∂x, ∂f/∂y, ...]" },
  "week2_s4": { time: 10, difficulty: 3, prep: {tr:"Autograd playground'u açın. Basit bir graf oluşturup backward çalıştırın.", en:"Open autograd playground. Create a simple graph and run backward."}, emphasize: {tr:"Canlı deney: öğrenciler a=2, b=3, c=a*b+a grafını oluştursun.", en:"Live experiment: students create a=2, b=3, c=a*b+a graph."} },
  "week2_s5": { time: 5, difficulty: 3, emphasize: {tr:"Value = autograd'ın atom'u. data, grad, _children, _backward.", en:"Value = autograd's atom. data, grad, _children, _backward."}, cheatSheet: "Value(2.0).data=2.0, .grad=0.0. Backward sonrası .grad dolacak" },
  "week2_s6": { time: 5, difficulty: 3, emphasize: {tr:"__add__, __mul__ overload: a+b yazdığınızda Python otomatik graf oluşturur.", en:"__add__, __mul__ overload: when you write a+b, Python automatically builds the graph."}, cheatSheet: "a + b → Value.__add__(a,b) → yeni node + backward fonksiyonu kaydeder" },
  "week2_s7": { time: 8, difficulty: 4, emphasize: {tr:"Chain rule: ∂L/∂x = ∂L/∂y · ∂y/∂x. Tüm backward pass bu TEK kurala dayanır.", en:"Chain rule: ∂L/∂x = ∂L/∂y · ∂y/∂x. The entire backward pass relies on this SINGLE rule."}, cheatSheet: "Add backward: grad += 1 × out.grad. Mul backward: grad += other.data × out.grad" },
  "week2_s8": { time: 5, difficulty: 3, prep: {tr:"L = (a×b)+c örneğini tahtada çizin, elle backward yapın.", en:"Draw L = (a×b)+c example on board, do backward by hand."}, emphasize: {tr:"Somut örnek: a=2, b=-3, c=10. L=(2×-3)+10=4. ∂L/∂a=-3, ∂L/∂b=2, ∂L/∂c=1", en:"Concrete example: a=2, b=-3, c=10. L=(2×-3)+10=4. ∂L/∂a=-3, ∂L/∂b=2, ∂L/∂c=1"} },
  "week2_s9": { time: 5, difficulty: 3, emphasize: {tr:"grad += (topla), grad = (ata) DEĞİL! Aynı değişken birden fazla yerde kullanılırsa gradientler toplanır.", en:"grad += (accumulate), NOT grad = (assign)! If same variable used multiple places, gradients must sum"}, studentQs: [
    { q: "Neden += kullanıyoruz?", a: "y = x+x olsun. ∂y/∂x = 2, ama iki ayrı yoldan 1+1=2. Toplama yapmazsak 1 buluruz — yanlış!" }
  ] },
  "week2_s10": { time: 5, difficulty: 2, emphasize: {tr:"Bizim Value sınıfı = PyTorch'un autograd'ının mini versiyonu. Aynı mantık, farklı ölçek.", en:"Our Value class = mini version of PyTorch's autograd. Same logic, different scale."} },
  // W3 remaining
  "week3_s3": { time: 8, difficulty: 3, emphasize: {tr:"Her token 'soru soruyor': Ben kim olmalıyım? Cevap için tüm önceki tokenlara bakıyor.", en:"Each token 'asks a question': Who should I be? It looks at all previous tokens for the answer."}, cheatSheet: "Attention weight α[i][j] = token i'nin token j'ye ne kadar dikkat ettiği" },
  "week3_s4": { time: 8, difficulty: 3, prep: {tr:"Kütüphane analojisi: Q=soru, K=kitap etiketi, V=kitap içeriği. Tahtaya çizin.", en:"Library analogy: Q=question, K=book label, V=book content. Draw on board."}, emphasize: {tr:"Q·K = uyum skoru. Yüksek skor = 'bu kitap bana lazım'. V = o kitabın bilgisi.", en:"Q·K = compatibility score. High score = 'I need this book'. V = that book's information."} },
  "week3_s5": { time: 10, difficulty: 3, prep: {tr:"Attention playground'u açın. 'abc' yazıp head kalıplarını inceleyin.", en:"Open attention playground. Type 'abc' and examine head patterns."}, emphasize: {tr:"Her head farklı kalıp öğrenir: biri önceki harfe bakar, biri sesli harflere.", en:"Each head learns different patterns: one looks at previous letter, another at vowels."} },
  "week3_s6": { time: 8, difficulty: 4, prep: {tr:"3 token, 2 boyutlu Q,K,V ile elle hesaplama hazırlayın.", en:"Prepare hand computation with 3 tokens, 2-dim Q,K,V."}, emphasize: {tr:"Tam formül: softmax(QKᵀ/√d)·V. √d olmazsa gradient patlar.", en:"Full formula: softmax(QKᵀ/√d)·V. Without √d, gradients explode."}, cheatSheet: "Q,K,V: [seq×d_k]. QKᵀ: [seq×seq]. softmax: satır bazlı. ×V: [seq×d_k]" },
  "week3_s7": { time: 5, difficulty: 2, emphasize: {tr:"Dot product = benzerlik ölçüsü. a·b büyük → aynı yön, küçük → farklı yön.", en:"Dot product = similarity measure. a·b large → same direction, small → different direction."}, cheatSheet: "a·b = Σaᵢbᵢ. Geometric: |a||b|cos(θ). cos(θ)=1: aynı yön, 0: dik, -1: ters" },
  "week3_s8": { time: 8, difficulty: 3, emphasize: {tr:"Multi-head: 4 farklı bakış açısı. Causal mask: gelecek tokenları -∞ yaparak gizle.", en:"Multi-head: 4 different perspectives. Causal mask: hide future tokens by setting to -∞."}, cheatSheet: "n_head=4, d_k=16/4=4. Mask: attn[i][j>i] = -∞ → softmax sonrası 0" },
  "week3_s9": { time: 5, difficulty: 3, emphasize: {tr:"Head çıktıları concat → Wo ile projeksiyon. 4×4=16 boyuta geri dön.", en:"Head outputs concat → Wo projection. Return to 16 dims from 4×4."}, cheatSheet: "MultiHead = Concat(head1,...,head4) · Wo. Wo: [16×16]" },
  // W4 remaining
  "week4_s3": { time: 10, difficulty: 3, prep: {tr:"Transformer flow viz'i açın. Adım adım geçin.", en:"Open Transformer flow viz. Walk through step by step."}, emphasize: {tr:"Her adımda veri nasıl değişiyor? Giriş → Norm → Attention → +Residual → Norm → MLP → +Residual", en:"How does data change at each step? Input → Norm → Attention → +Residual → Norm → MLP → +Residual"} },
  "week4_s4": { time: 5, difficulty: 3, emphasize: {tr:"RMSNorm: mean çıkarma yok, sadece ölçekleme. Daha hızlı, modern standart.", en:"RMSNorm: no mean subtraction, just scaling. Faster, modern standard."}, cheatSheet: "RMSNorm(x) = x·γ/√(mean(x²)+ε). vs LayerNorm: (x-μ)·γ/σ + β" },
  "week4_s5": { time: 5, difficulty: 3, emphasize: {tr:"MLP = token içi bilgi işleme. Attention token arası, MLP token içi.", en:"MLP = intra-token processing. Attention is inter-token, MLP is intra-token."}, cheatSheet: "MLP: 16→64(×4)→16. W1:[16×64], W2:[64×16]. ReLU²(x) = max(0,x)²" },
  "week4_s6": { time: 5, difficulty: 2, emphasize: {tr:"Aktivasyon olmadan derin ağ = sığ ağ. Non-linearity = öğrenme kapasitesi.", en:"Deep network without activation = shallow network. Non-linearity = learning capacity."}, cheatSheet: "ReLU: max(0,x). ReLU²: max(0,x)². GELU: x·Φ(x). Tanh: (e²ˣ-1)/(e²ˣ+1)" },
  "week4_s7": { time: 5, difficulty: 3, emphasize: {tr:"Residual = x + f(x). Gradient highway: derin ağlarda gradient serbest akıyor.", en:"Residual = x + f(x). Gradient highway: gradients flow freely in deep networks."}, studentQs: [
    { q: "Neden sadece topluyoruz?", a: "Skip connection gradientlerin katmanlar boyunca akmasını sağlar. Olmasa 10+ katmanda gradient kaybolur." }
  ] },
  "week4_s8": { time: 5, difficulty: 3, emphasize: {tr:"Başlatma kritik: sıfır = öğrenmeme, büyük = patlama, küçük = kaybolma.", en:"Initialization is critical: zero = no learning, large = explosion, small = vanishing."}, cheatSheet: "Xavier: std=1/√n. Kaiming: std=√(2/n). microGPT: 0.02 std normal" },
  "week4_s9": { time: 5, difficulty: 2, emphasize: {tr:"RMSNorm vs LayerNorm: pratik fark küçük ama hız farkı %30.", en:"RMSNorm vs LayerNorm: practical difference is small but speed difference is 30%."}, cheatSheet: "LayerNorm: (x-μ)/σ·γ+β (4 op). RMSNorm: x/√(mean(x²)+ε)·γ (3 op)" },
  // W5 remaining
  "week5_s3": { time: 8, difficulty: 3, prep: {tr:"Vadi + top analojisi çizin. Top = model, vadi = minimum, eğim = gradient.", en:"Draw valley + ball analogy. Ball = model, valley = minimum, slope = gradient."}, emphasize: {tr:"GD: gradient yokuş aşağıyı gösterir. Adım boyutu = learning rate.", en:"GD: gradient points downhill. Step size = learning rate."}, cheatSheet: "w_new = w_old - lr × ∂L/∂w. lr=0.01. Büyük lr → salınım, küçük lr → yavaş" },
  "week5_s4": { time: 10, difficulty: 3, prep: {tr:"Training sim'i açın. LR slider'ı 0.001 → 0.1 arasında gezdirin.", en:"Open training sim. Slide LR between 0.001 → 0.1."}, emphasize: {tr:"Canlı deney: LR=0.001 çok yavaş, LR=0.1 patlıyor, LR=0.01 ideal.", en:"Live experiment: LR=0.001 too slow, LR=0.1 explodes, LR=0.01 ideal."} },
  "week5_s5": { time: 5, difficulty: 3, emphasize: {tr:"CE = -log(P). P yüksek → loss düşük. P düşük → loss çok yüksek.", en:"CE = -log(P). P high → loss low. P low → loss very high."}, cheatSheet: "P=1: loss=0. P=0.5: loss=0.69. P=0.1: loss=2.3. P=0.01: loss=4.6" },
  "week5_s6": { time: 5, difficulty: 2, emphasize: {tr:"Log neden kullanılıyor? Düşük olasılığa ÇOK ağır ceza verir.", en:"Why use log? It penalizes low probabilities VERY heavily."}, cheatSheet: "-log(0.5)=0.69 ama -(1-0.5)=0.5. -log(0.01)=4.6 ama -(1-0.01)=0.99. Log daha sert" },
  "week5_s7": { time: 5, difficulty: 3, emphasize: {tr:"Adam: momentum (geçmiş gradientler) + adaptive (her parametre kendi lr'si).", en:"Adam: momentum (past gradients) + adaptive (each parameter gets its own lr)."}, cheatSheet: "Adam: m = β₁m + (1-β₁)g, v = β₂v + (1-β₂)g². w -= lr·m̂/√v̂+ε. β₁=0.9, β₂=0.999" },
  "week5_s8": { time: 5, difficulty: 2, emphasize: {tr:"Cosine decay: başta büyük adım (keşif), sonda küçük (hassas ayar).", en:"Cosine decay: large steps at start (exploration), small at end (fine-tuning)."}, cheatSheet: "lr_t = lr_min + 0.5(lr_max-lr_min)(1+cos(πt/T)). Warmup: ilk N adım lineer artış" },
  "week5_s9": { time: 3, difficulty: 2, emphasize: {tr:"p.grad = 0 her adımda ŞART. Yoksa önceki adımın gradienti birikir → felaket.", en:"p.grad = 0 every step is MANDATORY. Otherwise previous gradient accumulates → disaster."}, studentQs: [
    { q: "Neden otomatik sıfırlanmıyor?", a: "Bazen kasıtlı olarak biriktirmek istersiniz (gradient accumulation). PyTorch da aynı: optimizer.zero_grad()" }
  ] },
  // W6 remaining
  "week6_s2": { time: 5, difficulty: 2, emphasize: {tr:"Eğitim: forward+backward+update. Inference: sadece forward. Dropout OFF, BatchNorm fixed.", en:"Training: forward+backward+update. Inference: forward only. Dropout OFF, BatchNorm fixed."}, cheatSheet: "Eğitim: loss hesapla → backprop → güncelle. Inference: tahmin yap → bitir" },
  "week6_s3": { time: 8, difficulty: 2, emphasize: {tr:"Autoregressive: BOS → 'e' → 'em' → 'emm' → 'emma' → BOS. Her adım 1 token.", en:"Autoregressive: BOS → 'e' → 'em' → 'emm' → 'emma' → BOS. Each step adds 1 token."}, cheatSheet: "Loop: token = BOS. while token != BOS: logits = forward(tokens). token = sample(softmax(logits/T))" },
  "week6_s4": { time: 10, difficulty: 2, prep: {tr:"Generation playground'u açın. Temperature'ı değiştirerek farkı gösterin.", en:"Open generation playground. Change temperature to show the difference."}, emphasize: {tr:"T=0.1: hep aynı isimler. T=1.0: çeşitli. T=2.0: saçma isimler. Canlı gösterin.", en:"T=0.1: always same names. T=1.0: diverse. T=2.0: nonsense names. Show live."} },
  "week6_s5": { time: 5, difficulty: 2, emphasize: {tr:"Temperature = softmax'ı keskinleştirme/düzleştirme. Matematik basit: logits/T.", en:"Temperature = sharpening/flattening softmax. Math is simple: logits/T."}, cheatSheet: "T<1: [0.1,0.8,0.1]→[0.01,0.98,0.01] (keskin). T>1: [0.1,0.8,0.1]→[0.2,0.6,0.2] (düz)" },
  "week6_s6": { time: 5, difficulty: 2, emphasize: {tr:"Greedy = her zaman en yüksek. Top-k = ilk k'dan sample. Nucleus = toplam %p'ye kadar.", en:"Greedy = always highest. Top-k = sample from top k. Nucleus = cumulative up to p%."}, cheatSheet: "Greedy: argmax. Top-k: en yüksek k seç, diğerleri 0. Top-p: kümülatif ≤ p olanlar" },
  "week6_s7": { time: 5, difficulty: 3, emphasize: {tr:"KV cache: tekrar hesaplama yok. Yeni token için sadece 1 Q hesapla.", en:"KV cache: no recomputation. For new token, compute only 1 Q."}, cheatSheet: "Without cache: n token → O(n²). With cache: n token → O(n). Bellek: O(n×d×layers)" },
  "week6_s8": { time: 5, difficulty: 2, emphasize: {tr:"Uçtan uca: isim girin, her adımı takip edin: token → embed → attend → MLP → softmax → sample", en:"End-to-end: enter a name, follow each step: token → embed → attend → MLP → softmax → sample"} },
  "week6_s9": { time: 5, difficulty: 1, emphasize: {tr:"microGPT vs production: aynı algoritma. Fark: veri ölçeği, donanım, optimizasyon, RLHF.", en:"microGPT vs production: same algorithm. Difference: data scale, hardware, optimization, RLHF."} },
  // W7 remaining
  "week7_s2": { time: 8, difficulty: 2, emphasize: {tr:"İnteraktif scatter plot'u gösterin. microGPT → GPT-4 noktalarını tıklayın.", en:"Show the interactive scatter plot. Click microGPT → GPT-4 points."}, cheatSheet: "microGPT: 3.6K param, loss≈2.0. GPT-3: 175B, loss≈0.5. GPT-4: ~1.8T, loss≈0.3" },
  "week7_s4": { time: 5, difficulty: 1, prep: {tr:"Hardware kartlarını tıklayarak specs'leri gösterin.", en:"Click hardware cards to show specs."}, emphasize: {tr:"GPU 312 TFLOPS vs CPU 0.5 TFLOPS = 624× hız farkı. AI = paralel matris çarpımı.", en:"GPU 312 TFLOPS vs CPU 0.5 TFLOPS = 624× speed difference. AI = parallel matrix multiplication."}, cheatSheet: "A100: 6912 CUDA core, 312 TFLOPS, 80GB HBM3, ~$10K" },
  "week7_s5": { time: 8, difficulty: 2, emphasize: {tr:"3 aşama: pre-training (%95) → SFT (%3) → RLHF (%2). Asıl güç pre-training'den gelir.", en:"3 stages: pre-training (95%) → SFT (3%) → RLHF (2%). Real power comes from pre-training."}, studentQs: [
    { q: "RLHF olmadan ChatGPT olur mu?", a: "Model bilgili ama kaba, tutarsız, bazen tehlikeli olur. RLHF 'kibarlık + güvenlik' ekler, zeka eklemez." }
  ] },
  "week7_s6": { time: 5, difficulty: 2, emphasize: {tr:"Karakter→BPE→SentencePiece→tiktoken. Her adım daha verimli tokenization.", en:"Character→BPE→SentencePiece→tiktoken. Each step is more efficient tokenization."}, cheatSheet: "Karakter: 27 vocab. BPE(GPT-2): 50K. tiktoken(GPT-4): 100K. Daha büyük vocab = daha az token" },
  "week7_s7": { time: 5, difficulty: 3, emphasize: {tr:"Vanilla O(n²) bellek → Flash O(n) bellek. Aynı matematik, farklı hesaplama sırası.", en:"Vanilla O(n²) memory → Flash O(n) memory. Same math, different computation order."}, cheatSheet: "Flash Attention: IO-aware tiling. HBM→SRAM blok blok. 2-4× hızlanma, sonuç identik" },
  "week7_s8": { time: 5, difficulty: 1, emphasize: {tr:"Open source devrim: LLaMA 3.1 405B, DeepSeek-V3 671B MoE. GPT-4'e yakın, ücretsiz.", en:"Open source revolution: LLaMA 3.1 405B, DeepSeek-V3 671B MoE. Near GPT-4, free."}, cheatSheet: "LLaMA: Meta, 405B. Mistral: 7-22B+MoE. DeepSeek-V3: 671B (37B active). Qwen: Alibaba. Gemma: Google" },
  "week7_s9": { time: 8, difficulty: 2, emphasize: {tr:"5 trend: MoE (verimlilik), RAG (bilgi), Agent (araç), Multimodal (çok mod), Reasoning (düşünce zinciri).", en:"5 trends: MoE (efficiency), RAG (knowledge), Agent (tools), Multimodal (multi-mode), Reasoning (chain of thought)"}, studentQs: [
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
  const lang = useLang();
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
          📋 <strong>{lang==="tr"?"Hazırlık":"Prep"}:</strong> {tx(notes.prep, lang)}
        </div>
      )}

      {notes.emphasize && (
        <div style={{ fontSize: 14, color: "#FCD34D", marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(251,191,36,0.04)" }}>
          🎯 <strong>{lang==="tr"?"Vurgula":"Emphasize"}:</strong> {tx(notes.emphasize, lang)}
        </div>
      )}

      {notes.cheatSheet && (
        <div style={{ fontSize: 13, color: "#D1D5DB", marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", fontFamily: "'Fira Code', monospace" }}>
          📝 {tx(notes.cheatSheet, lang)}
        </div>
      )}

      {notes.studentQs && notes.studentQs.length > 0 && (
        <div>
          <button onClick={() => setShowQs(!showQs)} style={{ fontSize: 13, color: "#F59E0B", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, fontWeight: 600 }}>
            {showQs ? "▾" : "▸"} {lang==="tr"?`🙋 Öğrenci bunu soracak (${notes.studentQs.length} soru)`:`🙋 Students will ask (${notes.studentQs.length} questions)`}
          </button>
          {showQs && notes.studentQs.map((sq, i) => (
            <div key={i} style={{ marginTop: 6, marginLeft: 12, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", borderLeft: "2px solid rgba(251,191,36,0.3)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#FBBF24", marginBottom: 2 }}>❓ {tx(sq.q, lang)}</div>
              <div style={{ fontSize: 13, color: "#94A3B8" }}>💬 {tx(sq.a, lang)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LessonPlanPanel = ({ weekIdx }) => {
  const lang = useLang();
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
  const lang = useLang();
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


export { INSTRUCTOR_NOTES, LESSON_PLANS, WEEK_CHEAT_SHEETS, InstructorPanel, LessonPlanPanel, CheatSheetPanel };
