const SECTION_EXTRAS = {
  "week0_s0": {
    why: {tr:"Bu dersin amacı GPT'nin 'büyülü' görünen davranışlarının arkasındaki matematiği anlamanızdır. ChatGPT kullandığınızda 'nasıl yapıyor?' diye merak ettiyseniz, bu ders tam size göre.", en:"The goal of this course is to understand the math behind GPT's seemingly 'magical' behavior. If you've ever wondered 'how does it do that?' while using ChatGPT, this course is for you."}
  },
  "week0_s1": {
    why: {tr:"Yapay sinir ağlarını anlamak ZORUNLU çünkü GPT bir sinir ağıdır. Ama korkacak bir şey yok — çarpma ve toplama biliyorsanız sinir ağını anlayabilirsiniz.", en:"Understanding neural networks is ESSENTIAL because GPT is a neural network. But there's nothing to fear — if you know multiplication and addition, you can understand a neural network."},
    analogy: { title: {tr:"Excel Formülü Benzetmesi", en:"Excel Formula Analogy"}, emoji: "📊", text: {tr:"Bir Excel sayfası düşünün: A1 hücresine girdi yazıyorsunuz, B1 hücresinde =A1*0.5+0.3 formülü var, C1'de sonucu görüyorsunuz. Sinir ağı tam olarak bu — ama binlerce hücre ve formül. 'Eğitim' = Excel'in 0.5 ve 0.3 gibi katsayıları otomatik bulması. Veriyi gösteriyorsunuz, formül kendini ayarlıyor.", en:"Imagine an Excel sheet: you type input in cell A1, cell B1 has the formula =A1*0.5+0.3, and you see the result in C1. A neural network is exactly this — but with thousands of cells and formulas. 'Training' = Excel automatically finding coefficients like 0.5 and 0.3. You show it data, and the formula adjusts itself."} },
    concrete: { title: {tr:"Somut Ev Fiyatı Örneği", en:"Concrete House Price Example"}, content: {tr:"Girdi: alan=120m², oda=3\nModel: fiyat = w₁×120 + w₂×3 + b\n\nBaşlangıç (rastgele): w₁=0.001, w₂=0.5, b=0\n→ fiyat = 0.12 + 1.5 + 0 = 1.62 TL (!)\n\n100 adım eğitim sonrası: w₁=5000, w₂=20000, b=50000\n→ fiyat = 600K + 60K + 50K = 710K TL ✓", en:"Input: area=120m², rooms=3\nModel: price = w₁×120 + w₂×3 + b\n\nInitial (random): w₁=0.001, w₂=0.5, b=0\n→ price = 0.12 + 1.5 + 0 = 1.62 TL (!)\n\nAfter 100 training steps: w₁=5000, w₂=20000, b=50000\n→ price = 600K + 60K + 50K = 710K TL ✓"} }
  },
  "week0_s2": {
    analogy: { title: {tr:"Cümle Tamamlama Oyunu", en:"Sentence Completion Game"}, emoji: "🎯", text: {tr:"Dil modeli, arkadaşlarınızla oynadığınız 'cümleyi tamamla' oyununa benzer. Biri 'dün okula gi...' deyince siz otomatik olarak 'ttim' veya 'deceğim' gibi devamlar düşünürsünüz. Beyniniz binlerce cümle duyduğu için 'olası devamları' tahmin edebilir. GPT aynı şeyi yapar — milyarlarca metin okumuş ve kalıpları öğrenmiştir.", en:"A language model is like playing 'complete the sentence' with friends. When someone says 'yesterday I went to sch...', you automatically think of continuations like 'ool'. Your brain can predict 'likely continuations' because it has heard thousands of sentences. GPT does the same — it has read billions of texts and learned the patterns."} },
    why: {tr:"Dil modeli kavramı bu dersin TEMELİDİR. Tüm haftalarda öğreneceğiniz her şey — embedding, attention, training — 'sonraki tokeni tahmin et' görevine hizmet eder.", en:"The language model concept is the FOUNDATION of this course. Everything you'll learn — embedding, attention, training — serves the task of 'predict the next token'."}
  },
  "week0_s3": {
    bridge: { from: {tr:"Sinir ağı ve dil modeli kavramlarını öğrendik", en:"We learned neural network and language model concepts"}, to: {tr:"Şimdi somut olarak bu kodun ne yaptığını görelim — 5 adımlık pipeline", en:"Now let's see concretely what this code does — the 5-step pipeline"} },
    concrete: { title: {tr:"Loss = 3.33 ne anlama geliyor?", en:"What does Loss = 3.33 mean?"}, content: {tr:"28 token arasından rastgele seçim: P(doğru) = 1/28\nLoss = -log(1/28) = log(28) ≈ 3.33\n\nBu 'en kötü' durum. Eğitimle:\n→ P(doğru) = 1/7 olursa: loss = log(7) ≈ 1.95\n→ Yani model rastgeleden 4× daha iyi!", en:"Random selection among 28 tokens: P(correct) = 1/28\nLoss = -log(1/28) = log(28) ≈ 3.33\n\nThis is the 'worst case'. With training:\n→ If P(correct) = 1/7: loss = log(7) ≈ 1.95\n→ The model is 4× better than random!"} }
  },
  "week0_s4": {
    analogy: { title: {tr:"Araba Mekanik vs Sürücü", en:"Car Mechanic vs Driver"}, emoji: "🔧", text: {tr:"PyTorch kullanmak = araba kullanmak. microgpt.py okumak = motorun nasıl çalıştığını anlamak. İyi bir sürücü için motor bilgisi şart değil — ama İYİ BİR MÜHENDİS olmak istiyorsanız, motorun içini bilmelisiniz. Bu ders sizi mühendis yapıyor.", en:"Using PyTorch = driving a car. Reading microgpt.py = understanding how the engine works. Motor knowledge isn't required to be a good driver — but if you want to be a GOOD ENGINEER, you need to know the engine internals. This course makes you an engineer."} },
    concrete: { title: {tr:"PyTorch vs microgpt.py", en:"PyTorch vs microgpt.py"}, content: {tr:"PyTorch'ta 3 satır:\nloss = criterion(output, target)\nloss.backward()\noptimizer.step()\n\nmicrogpt.py'de aynı işlem 30+ satır.\nAma her satır OKUNABILIR ve ANLAŞILIR.\nPyTorch'un arkasında ~2M satır C++/CUDA var.", en:"In PyTorch, 3 lines:\nloss = criterion(output, target)\nloss.backward()\noptimizer.step()\n\nIn microgpt.py the same operation is 30+ lines.\nBut every line is READABLE and UNDERSTANDABLE.\nBehind PyTorch there are ~2M lines of C++/CUDA."} }
  },
  "week0_s7": {
    tryIt: "params",
    why: {tr:"Bu 7 parametre modelin 'DNA'sıdır. Değiştirdiğinizde model tamamen farklı davranır. Deney yaparak öğrenin!", en:"These 7 parameters are the model's 'DNA'. When you change them, the model behaves completely differently. Learn by experimenting!"},
    analogy: { title: {tr:"Araba Kontrol Paneli", en:"Car Dashboard"}, emoji: "🎛️", text: {tr:"n_embd = motor hacmi (büyük = güçlü ama pahalı). n_layer = vites sayısı (çok = hassas kontrol). n_head = ayna sayısı (çok = daha geniş görüş). block_size = yakıt deposu (büyük = uzun yol). learning_rate = gaz pedalı hassasiyeti (çok = tehlikeli). num_steps = yol mesafesi. seed = başlangıç noktası.", en:"n_embd = engine size (bigger = powerful but expensive). n_layer = number of gears (more = finer control). n_head = number of mirrors (more = wider view). block_size = fuel tank (bigger = longer range). learning_rate = gas pedal sensitivity (too much = dangerous). num_steps = distance traveled. seed = starting point."} }
  },
  "week0_s10": {
    analogy: { title: {tr:"Bisikletten Uzay Mekiğine", en:"From Bicycle to Space Shuttle"}, emoji: "🚀", text: {tr:"microGPT bir bisiklet — pedal, direksiyon, fren hepsi var. GPT-4 bir uzay mekiği — aynı fizik kuralları (Newton) ama milyonlarca kat daha karmaşık mühendislik. Bu derste bisikleti parçalayıp anlayacaksınız. Sonra mekiğin %90'ını da anlamış olacaksınız.", en:"microGPT is a bicycle — pedals, handlebars, brakes are all there. GPT-4 is a space shuttle — same physics (Newton) but millions of times more complex engineering. In this course you'll take apart the bicycle. Then you'll understand 90% of the shuttle too."} },
    concrete: { title: {tr:"Ölçek Karşılaştırması", en:"Scale Comparison"}, content: {tr:"microGPT:  3,648 parametre (~15 KB bellek)\nGPT-2:     1.5 milyar parametre (~6 GB)\nGPT-3:     175 milyar parametre (~700 GB)\nGPT-4:     ~1+ trilyon parametre (~4 TB)\n\nOran: GPT-4 / microGPT ≈ 300,000,000×\nAma temel algoritma AYNI.", en:"microGPT:  3,648 parameters (~15 KB memory)\nGPT-2:     1.5 billion parameters (~6 GB)\nGPT-3:     175 billion parameters (~700 GB)\nGPT-4:     ~1+ trillion parameters (~4 TB)\n\nRatio: GPT-4 / microGPT ≈ 300,000,000×\nBut the core algorithm is THE SAME."} }
  },
  "week1_s0": {
    why: {tr:"Bilgisayar sadece sayıları işleyebilir. Dil modelinin metni anlaması için önce onu sayılara çevirmeliyiz — tokenization tam olarak budur.", en:"Computers can only process numbers. For a language model to understand text, we first need to convert it to numbers — that's exactly what tokenization is."},
    bridge: { from: {tr:"Geçen hafta GPT'nin ne yaptığını gördük: isim alır, yeni isim üretir.", en:"Last week we saw what GPT does: takes a name, generates a new name."}, to: {tr:"Şimdi 'ismi alır' kısmına odaklanıyoruz. Model bir ismi nasıl 'görüyor'? Cevap: tokenization.", en:"Now we focus on the 'takes a name' part. How does the model 'see' a name? Answer: tokenization."} }
  },
  "week1_s2": { tryIt: "tokenizer" },
  "week1_s3": {
    why: {tr:"Token ID'leri (0, 1, 2...) modele ilişkileri söyleyemez. Embedding her harfi çok boyutlu bir uzaya yerleştirerek bu sorunu çözer.", en:"Token IDs (0, 1, 2...) can't tell the model about relationships. Embedding solves this by placing each character in a multi-dimensional space."},
    analogy: { title: {tr:"Rehber Kitap Adresi", en:"Guidebook Address"}, emoji: "📍", text: {tr:"Düşünün ki her karakter bir şehir. Token ID = posta kodu (sadece numara). Embedding = GPS koordinatı. Posta kodları sıralı ama coğrafi yakınlığı göstermez. GPS koordinatları ise gerçek mesafeyi verir. Embedding tıpkı GPS gibi, harflerin 'anlam uzayındaki' gerçek konumunu verir.", en:"Think of each character as a city. Token ID = postal code (just a number). Embedding = GPS coordinates. Postal codes are sequential but don't show geographic proximity. GPS coordinates give real distance. Embedding works like GPS, giving the true position of characters in 'meaning space'."} },
    tryIt: "embedding"
  },
  "week1_s5": { tryIt: "softmax" },
  "week2_s0": {
    why: {tr:"5.000 parametrenin her birinin loss'a etkisini bilmemiz lazım. Autograd bunu TEK backward pass ile yapıyor — hepsi bedava!", en:"We need to know the effect of each of 5,000 parameters on loss. Autograd does this in a SINGLE backward pass — all for free!"},
    bridge: { from: {tr:"Geçen hafta modeli kurduk: embedding → attention → MLP → çıktı. Ama bu model henüz 'cahil'.", en:"Last week we built the model: embedding → attention → MLP → output. But this model is still 'ignorant'."}, to: {tr:"Şimdi 'nasıl öğrenir?' sorusuna geçiyoruz. Cevap: gradient hesaplama + parametre güncelleme.", en:"Now we ask 'how does it learn?' Answer: gradient computation + parameter update."} },
    analogy: { title: {tr:"Kör Dağcı", en:"Blind Mountain Climber"}, emoji: "🏔️", text: {tr:"Bir dağda gözünüz bağlı duruyorsunuz ve en alçak noktaya inmeniz gerekiyor. Türev tam olarak bu: 'bu yönde ilerlersem yokuş aşağı mı giderim?' Gradient ise tüm yönlerdeki eğimleri birden söyler.", en:"You're on a mountain blindfolded and need to reach the lowest point. The derivative is exactly this: 'if I go this way, will I go downhill?' The gradient tells you the slope in ALL directions at once."} }
  },
  "week2_s3": {
    stepByStep: {
      title: {tr:"L = (a × b) + c Hesaplama Grafı", en:"L = (a × b) + c Computation Graph"},
      steps: [
        { label: {tr:"Değerleri kur", en:"Set values"}, calc: "a = 2, b = 3, c = 1", note: {tr:"Bu değerler modelin parametreleri gibi düşünün", en:"Think of these as model parameters"} },
        { label: {tr:"İleri: d = a × b", en:"Forward: d = a × b"}, calc: "d = 2 × 3 = 6", note: {tr:"Çarpma — local_grads = (b=3, a=2)", en:"Multiplication — local_grads = (b=3, a=2)"} },
        { label: {tr:"İleri: L = d + c", en:"Forward: L = d + c"}, calc: "L = 6 + 1 = 7", note: {tr:"Toplama — local_grads = (1, 1)", en:"Addition — local_grads = (1, 1)"} },
        { label: {tr:"Geri: ∂L/∂L = 1", en:"Back: ∂L/∂L = 1"}, calc: "L.grad = 1", note: {tr:"Başlangıç: loss'un türevi her zaman 1", en:"Start: derivative of loss w.r.t. itself is always 1"} },
        { label: {tr:"Geri: ∂L/∂d", en:"Back: ∂L/∂d"}, calc: "d.grad += 1 × 1 = 1", note: {tr:"chain rule: 1×1", en:"chain rule: 1×1"} },
        { label: {tr:"Geri: ∂L/∂c", en:"Back: ∂L/∂c"}, calc: "c.grad += 1 × 1 = 1", note: {tr:"chain rule: 1×1", en:"chain rule: 1×1"} },
        { label: {tr:"Geri: ∂L/∂a", en:"Back: ∂L/∂a"}, calc: "a.grad += 3 × 1 = 3", note: {tr:"local_grad=b=3 × d.grad=1", en:"local_grad=b=3 × d.grad=1"} },
        { label: {tr:"Geri: ∂L/∂b", en:"Back: ∂L/∂b"}, calc: "b.grad += 2 × 1 = 2", note: {tr:"local_grad=a=2 × d.grad=1", en:"local_grad=a=2 × d.grad=1"} },
        { label: {tr:"Doğrulama ✓", en:"Verification ✓"}, calc: "∂L/∂a = b = 3 ✓, ∂L/∂b = a = 2 ✓", note: {tr:"Elle aynı sonuç!", en:"Same result as manual calculation!"} }
      ]
    }
  },
  "week3_s0": {
    bridge: { from: {tr:"Autograd ile gradient hesaplamayı öğrendik.", en:"We learned gradient computation with autograd."}, to: {tr:"Ama modelin içinde ne oluyor? Token'lar nasıl 'konuşuyor'? İşte attention — Transformer'ın kalbi!", en:"But what happens inside the model? How do tokens 'talk'? Enter attention — the heart of the Transformer!"} }
  },
  "week3_s1": {
    analogy: { title: {tr:"Toplantıda Not Alma", en:"Taking Notes in a Meeting"}, emoji: "📋", text: {tr:"Bir toplantıdasınız. 5 kişi konuştu. Herkesi eşit dinlemezsiniz: CEO'ya %40, proje liderine %30 dikkat edersiniz. Self-attention tam olarak bunu yapar: her token, öncekilerden ne kadar bilgi alacağına dinamik karar verir.", en:"You're in a meeting. 5 people spoke. You don't listen equally: 40% attention to the CEO, 30% to the project lead. Self-attention does exactly this: each token dynamically decides how much info to take from previous tokens."} }
  },
  "week3_s2": {
    analogy: { title: {tr:"Kütüphane Arama", en:"Library Search"}, emoji: "📚", text: {tr:"Query = aradığınız konu. Key = kitap başlıkları. Q·K = uyum skoru. Value = kitap içeriği. Uyum yüksekse çok alıntı yaparsınız. Attention aynı şekilde çalışır!", en:"Query = your search topic. Key = book titles. Q·K = relevance score. Value = book content. High match → quote a lot from that book. Attention works the same way!"} },
    tryIt: "dotProduct"
  },
  "week4_s0": {
    bridge: { from: {tr:"Self-attention ile tokenlar arası iletişimi öğrendik.", en:"We learned inter-token communication with self-attention."}, to: {tr:"Attention'dan sonra MLP bloğu, normalizasyon ve residual bağlantılar. İşte tam Transformer!", en:"After attention comes the MLP block, normalization, and residual connections. The full Transformer!"} }
  },
  "week5_s0": {
    bridge: { from: {tr:"Model mimarisini tamamladık: Embedding → Attention → MLP → Çıktı.", en:"We completed the architecture: Embedding → Attention → MLP → Output."}, to: {tr:"Şimdi en kritik soru: bu model nasıl öğrenir? Forward → Loss → Backward → Update döngüsü.", en:"Now the most critical question: how does this model learn? The Forward → Loss → Backward → Update loop."} },
    tryIt: "gradient"
  },
  "week5_s2": {
    stepByStep: {
      title: {tr:"Cross-Entropy Loss Hesaplama", en:"Cross-Entropy Loss Calculation"},
      steps: [
        { label: {tr:"Girdi", en:"Input"}, calc: "tokens = [BOS, h, e, l, l, o]", note: {tr:"'hello' tokenize edildi", en:"Tokenized 'hello'"} },
        { label: {tr:"Pozisyon 0: BOS→h", en:"Position 0: BOS→h"}, calc: "P('h') = 0.04", note: {tr:"Rastgele tahmine yakın", en:"Close to random guess"} },
        { label: {tr:"Loss hesapla", en:"Calculate loss"}, calc: "L₀ = -log(0.04) = 3.22", note: {tr:"Düşük P → yüksek loss", en:"Low P → high loss"} },
        { label: {tr:"Pozisyon 1: h→e", en:"Position 1: h→e"}, calc: "P('e') = 0.08", note: {tr:"Biraz daha iyi", en:"A bit better"} },
        { label: {tr:"Loss hesapla", en:"Calculate loss"}, calc: "L₁ = -log(0.08) = 2.53", note: {tr:"Daha iyi P → düşük loss", en:"Better P → lower loss"} },
        { label: {tr:"Ortalama al", en:"Average"}, calc: "Loss = (3.22 + 2.53 + ...) / 5", note: {tr:"Modelin genel başarısı", en:"Model's overall performance"} },
        { label: {tr:"Karşılaştır", en:"Compare"}, calc: {tr:"Rastgele: 3.33 | Eğitilmiş: ~2.0", en:"Random: 3.33 | Trained: ~2.0"}, note: {tr:"Loss düştü = öğreniyor! 🎉", en:"Loss dropped = learning! 🎉"} }
      ]
    }
  },
  "week6_s2": { tryIt: "softmax" },
  "week7_s0": {
    why: {tr:"Scaling laws'u anlamak 'ölçek artırma' kararlarının arkasındaki bilimi gösterir.", en:"Understanding scaling laws reveals the science behind 'scale up' decisions."},
    analogy: { title: {tr:"Fabrika Üretim Hattı", en:"Factory Production Line"}, emoji: "🏭", text: {tr:"Üretim hattını 2× büyütünce üretim tam 2× artmaz — güç yasasıyla artar. AI'da da aynı: 10× parametre → ~3× iyileşme.", en:"Doubling the production line doesn't double output — it increases by power law. Same in AI: 10× parameters → ~3× improvement."} }
  },
  "week7_s1": {
    bridge: { from: {tr:"Scaling laws'u öğrendik", en:"We learned scaling laws"}, to: {tr:"Şimdi somut tarihçeyi görelim — 2017'den bugüne", en:"Now let's see the concrete history — from 2017 to today"} },
    concrete: { title: {tr:"Maliyet Evrimi", en:"Cost Evolution"}, content: {tr:"2017 Transformer: ~$10K\n2018 GPT-1: ~$50K\n2020 GPT-3: ~$5M\n2023 GPT-4: ~$100M+\n2024 Frontier: ~$200M+\n\n7 yılda 20,000× maliyet artışı\nAma performans 100× iyileşme", en:"2017 Transformer: ~$10K\n2018 GPT-1: ~$50K\n2020 GPT-3: ~$5M\n2023 GPT-4: ~$100M+\n2024 Frontier: ~$200M+\n\n20,000× cost increase in 7 years\nBut 100× performance improvement"} }
  },
  "week7_s3": {
    analogy: { title: {tr:"Çırak → Kalfa → Usta", en:"Apprentice → Journeyman → Master"}, emoji: "🎓", text: {tr:"Pre-training = çıraklık. SFT = kalfalık. RLHF = ustalık. Her aşama bir öncekinin üstüne inşa edilir.", en:"Pre-training = apprenticeship. SFT = journeyman phase. RLHF = mastery. Each stage builds on the previous one."} }
  },
};

export { SECTION_EXTRAS };
