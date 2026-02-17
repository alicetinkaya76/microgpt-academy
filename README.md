<div align="center">

# 🧠 microGPT Academy

**İnteraktif GPT/Transformer Eğitim Platformu**
*Interactive GPT/Transformer Learning Platform*

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/alicetinkaya76/microgpt-academy/pulls)
[![Based on](https://img.shields.io/badge/Based%20on-Karpathy%2Fmicrogpt-orange)](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95)

[🇹🇷 Türkçe](#-türkçe) · [🇬🇧 English](#-english) · [🚀 Demo](#-canlı-demo--live-demo)

---

<img src="docs/screenshot-main.png" alt="microGPT Academy Screenshot" width="800"/>

</div>

---

## 📌 Hakkında / About

> 🇹🇷 Bu proje, **Andrej Karpathy**'nin [microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95) adlı — sıfır bağımlılıkla saf Python'da yazılmış minimal GPT implementasyonu — üzerine inşa edilmiş **interaktif bir eğitim platformudur**. Karpathy'nin 243 satırlık kodunu satır satır, görselleştirmeler ve Türkçe açıklamalarla öğretmeyi amaçlar.
>
> 🇬🇧 This project is an **interactive educational platform** built on top of **Andrej Karpathy**'s [microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95) — a minimal GPT implementation in pure Python with zero dependencies. It aims to teach Karpathy's 243-line code line by line, with visualizations and bilingual explanations.

**Orijinal Kaynak / Original Source:** [karpathy/microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95) — *"This is the full algorithmic content of what is needed. Everything else is just for efficiency."* — Andrej Karpathy

---

## 🚀 Canlı Demo / Live Demo

👉 **[microgpt-academy.vercel.app](https://microgpt-academy.vercel.app)**

---

## 🇹🇷 Türkçe

### Ne Bu?

Andrej Karpathy'nin 243 satırlık saf Python GPT kodunu ([microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95)) **satır satır, interaktif olarak** öğreten bir web uygulaması. Harici kütüphane yok — sadece `os`, `math`, `random`. Her hafta bir kavram, her kavram canlı görselleştirmelerle.

### Özellikler

🎓 **10 Haftalık Müfredat** — Tokenization'dan Scaling Laws'a kadar yapılandırılmış dersler

🔬 **Canlı Keşif Paneli** — Olasılık dağılımları, attention ağırlıkları ve embedding vektörlerini gerçek zamanlı inceleyin

✨ **İsim Üreteci** — Temperature ayarıyla GPT'nin token token nasıl isim ürettiğini izleyin

🔄 **Tarayıcıda Eğitim** — Loss'un düştüğünü, isimlerin gerçekçileştiğini canlı görün

🏗️ **Mimari Gezgini** — Transformer'ın 6 temel bileşenini adım adım, Python koduyla keşfedin

📊 **30+ İnteraktif Görselleştirme** — Attention flow, computation graph, softmax, gradient descent ve daha fazlası

👨‍🏫 **Hoca Modu** — Ders planı, kopya kağıdı ve slayt referansları

📚 **Kapsamlı Sözlük** — 100+ terim, haftalara göre filtrelenebilir

🌐 **İki Dilli** — Türkçe (tam) | İngilizce (kısmi)

### Kurulum

```bash
git clone https://github.com/alicetinkaya76/microgpt-academy.git
cd microgpt-academy
npm install
npm start
```

Tarayıcıda `http://localhost:3000` açılır.

### Haftalık İçerik

| Hafta | Konu | Anahtar Kavramlar |
|-------|------|-------------------|
| 0 | 🎯 Giriş & Genel Bakış | Pipeline, neural net temelleri, dil modeli konsepti |
| 1 | 🔤 Tokenization & Embedding | Karakter tokenizer, embedding vektörleri, pozisyon kodlama |
| 2 | ⛓ Autograd (Otomatik Türev) | Value sınıfı, hesaplama grafı, chain rule, backpropagation |
| 3 | 🔍 Attention Mekanizması | Q/K/V, dot product, scaled attention, multi-head, causal mask |
| 4 | 🧱 Transformer Blok | RMSNorm, MLP, ReLU², residual connections |
| 5 | 🏋️ Eğitim Döngüsü | Cross-entropy loss, Adam optimizer, learning rate |
| 6 | ✨ Çıkarım & Örnekleme | Autoregressive üretim, temperature, top-k, KV cache |
| 7 | 🔬 İleri Konular | Scaling laws, donanım evrimi, tokenizer evrimi |
| 8 | 📄 "Attention Is All You Need" | Orijinal makale deep-dive, encoder-decoder, positional encoding |
| 9 | 🚀 Araştırma Sınırları | MoE, RLHF, LoRA, flash attention, açık kaynak ekosistemi |

---

## 🇬🇧 English

### What Is This?

An interactive web app that teaches Andrej Karpathy's 243-line pure Python GPT implementation ([microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95)) **line by line**. No external libraries — just `os`, `math`, `random`. Each week covers a concept with live visualizations.

### Features

🎓 **10-Week Curriculum** — Structured lessons from Tokenization to Scaling Laws

🔬 **Live Exploration Panel** — Inspect probability distributions, attention weights, and embeddings in real-time

✨ **Name Generator** — Watch GPT generate names token by token with adjustable temperature

🔄 **In-Browser Training** — See loss drop and names become realistic, live

🏗️ **Architecture Explorer** — Step through Transformer's 6 core components with Python code

📊 **30+ Interactive Visualizations** — Attention flow, computation graph, softmax, gradient descent and more

👨‍🏫 **Instructor Mode** — Lesson plans, cheat sheets, and slide references

📚 **Comprehensive Glossary** — 100+ terms, filterable by week

🌐 **Bilingual** — Turkish (complete) | English (partial)

### Getting Started

```bash
git clone https://github.com/alicetinkaya76/microgpt-academy.git
cd microgpt-academy
npm install
npm start
```

Opens `http://localhost:3000` in your browser.

### Weekly Content

| Week | Topic | Key Concepts |
|------|-------|--------------|
| 0 | 🎯 Intro & Overview | Pipeline, neural net basics, language model concept |
| 1 | 🔤 Tokenization & Embedding | Character tokenizer, embedding vectors, positional encoding |
| 2 | ⛓ Autograd | Value class, computation graph, chain rule, backpropagation |
| 3 | 🔍 Attention Mechanism | Q/K/V, dot product, scaled attention, multi-head, causal mask |
| 4 | 🧱 Transformer Block | RMSNorm, MLP, ReLU², residual connections |
| 5 | 🏋️ Training Loop | Cross-entropy loss, Adam optimizer, learning rate |
| 6 | ✨ Inference & Sampling | Autoregressive generation, temperature, top-k, KV cache |
| 7 | 🔬 Advanced Topics | Scaling laws, hardware evolution, tokenizer evolution |
| 8 | 📄 "Attention Is All You Need" | Original paper deep-dive, encoder-decoder, positional encoding |
| 9 | 🚀 Research Frontiers | MoE, RLHF, LoRA, flash attention, open source ecosystem |

---

## 📐 Mimari / Architecture

```
src/
└── App.js          ← Tüm uygulama tek dosyada / Entire app in one file (~7700 lines)
    ├── i18n System         — İki dilli destek / Bilingual support
    ├── Math Utils          — softmax, rmsnorm, matmul, sampling
    ├── createModel()       — 3,648 parametreli mini GPT oluşturma
    ├── fwd() / train()     — İleri geçiş ve eğitim döngüsü
    ├── 30+ Viz Components  — İnteraktif görselleştirmeler
    ├── Curriculum Data     — 10 haftalık ders içeriği
    ├── Glossary            — 100+ terim veritabanı
    └── App Component       — Ana uygulama ve tab yönetimi
```

> **Neden tek dosya?** Eğitim amaçlı — tüm kodu tek yerde görmek, bağımlılıkları anlamayı kolaylaştırır. Production için bölünmesi önerilir.
>
> **Why single file?** Educational purpose — seeing all code in one place makes understanding dependencies easier. Splitting recommended for production.

---

## 🔗 Orijinal Proje / Original Project

Bu platform aşağıdaki çalışma üzerine inşa edilmiştir / This platform is built on top of:

| | |
|---|---|
| **Proje / Project** | [microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95) |
| **Yazar / Author** | [Andrej Karpathy](https://karpathy.ai/) |
| **Açıklama / Description** | 🇹🇷 Saf Python'da, sıfır bağımlılıkla yazılmış en minimal GPT implementasyonu. 243 satır, harici kütüphane yok. |
| | 🇬🇧 The most minimal GPT implementation in pure Python with zero dependencies. 243 lines, no external libraries. |
| **Alıntı / Quote** | *"This is the full algorithmic content of what is needed. Everything else is just for efficiency. I cannot simplify this any further."* |

### İlgili Karpathy Projeleri / Related Karpathy Projects
- [micrograd](https://github.com/karpathy/micrograd) — Autograd motoru (Value sınıfı buradan esinlenmiştir)
- [makemore](https://github.com/karpathy/makemore) — Karakter seviyesi dil modeli
- [nanoGPT](https://github.com/karpathy/nanoGPT) — En basit, en hızlı orta ölçekli GPT eğitimi
- [Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ) — YouTube ders serisi

---

## 🤝 Katkıda Bulunma / Contributing

Katkılarınızı bekliyoruz! / Contributions are welcome!

- 🌐 İngilizce çevirileri tamamlama / Complete English translations
- 🐛 Bug düzeltmeleri / Bug fixes
- 📊 Yeni görselleştirmeler / New visualizations
- 📝 İçerik iyileştirmeleri / Content improvements

```bash
# Fork & clone
git checkout -b feature/amazing-feature
# Değişikliklerinizi yapın / Make your changes
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
# Pull Request açın / Open a Pull Request
```

---

## 📄 Lisans / License

MIT License — detaylar için [LICENSE](LICENSE) dosyasına bakın.

Orijinal [microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95) Andrej Karpathy tarafından oluşturulmuştur.

Original [microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95) created by Andrej Karpathy.

---

## 🙏 İlham & Referanslar / Inspiration & References

- [Andrej Karpathy — microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95) ⭐ *Bu projenin temel aldığı kaynak / The foundation of this project*
- [Andrej Karpathy — micrograd](https://github.com/karpathy/micrograd)
- [Andrej Karpathy — makemore](https://github.com/karpathy/makemore)
- [Vaswani et al. — "Attention Is All You Need" (2017)](https://arxiv.org/abs/1706.03762)

---

<div align="center">

**microGPT Academy** — *Karpathy'nin microgpt.py'sini anlamak için en iyi yol, onu satır satır keşfetmektir.*

*The best way to understand Karpathy's microgpt.py is to explore it line by line.*

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! / Star this repo if you find it useful!

</div>
