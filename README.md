# Σ* Otomata Lab

**İnteraktif Otomata Teorisi Eğitim Platformu**
*Interactive Automata Theory Learning Platform*

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/alicetinkaya76/otomata-lab/pulls)
[![Based on](https://img.shields.io/badge/Based%20on-Sipser%20Textbook-orange)](https://math.mit.edu/~sipser/book.html)

[🇹🇷 Türkçe](#-türkçe) · [🇬🇧 English](#-english) · [🚀 Demo](#-canlı-demo--live-demo)

---

## 📌 Hakkında / About

> 🇹🇷 Bu proje, Michael Sipser'ın *"Introduction to the Theory of Computation"* kitabı temel alınarak geliştirilmiş **interaktif bir otomata teorisi eğitim platformudur**. DFA'dan Turing makinelerine kadar 6 modül, 103 problem, interaktif trace egzersizleri, Pumping Lemma oyunu ve canlı otomat görselleştirmeleri içerir.
>
> 🇬🇧 This project is an **interactive automata theory learning platform** based on Michael Sipser's *"Introduction to the Theory of Computation"*. It includes 6 modules from DFA to Turing machines, 103 problems, interactive trace exercises, a Pumping Lemma game, and live automaton visualizations.

---

## 🚀 Canlı Demo / Live Demo

👉 **[otomata-lab.vercel.app](https://otomata-lab.vercel.app)**

---

## 🇹🇷 Türkçe

### Ne Bu?

Sipser'ın otomata teorisi müfredatını **interaktif olarak** öğreten bir web uygulaması. Teori oku, quiz çöz, otomat inşa et, string trace yap — hepsi tek platformda.

### Özellikler

🎓 **6 Modül, 24 Bölüm** — Temeller'den Turing makinelerine yapılandırılmış müfredat

📋 **103 Problem** — Modül etiketli, 3 zorluk seviyesi (Temel/Orta/İleri)

🧪 **Serbest Sandbox** — DFA/NFA/PDA/TM inşa et, verbose diagnostikle test et

📝 **50 Quiz (4 tip)** — Çoktan seçmeli, çoklu seçim, eşleştirme, sıralama + rastgele havuz

⟜ **16 İnteraktif Trace** — DFA/NFA adım-adım izleme + **gerçek PDA stack** + **gerçek TM tape** görselleştirme

🔨 **8 Build Challenge** — DFA/NFA/PDA/TM inşa görevi, otomatik test

🎲 **4 Pumping Lemma Oyunu** — Adversarial mod: 0ⁿ1ⁿ, ww, aⁿbⁿcⁿ, 1^(n²)

🔄 **RE→NFA** — Thompson's construction canlı dönüşümü

⚡ **NFA→DFA** — Subset construction adım adım

✂️ **DFA Minimization** — Table-filling algoritması interaktif

🌍 **Gerçek Dünya** — Regex, compiler, network protocol örnekleri

🌐 **İki Dilli** — Türkçe | İngilizce

📊 **İlerleme Takibi** — localStorage ile quiz ve modül ilerlemesi

### Kurulum

```bash
git clone https://github.com/alicetinkaya76/otomata-lab.git
cd otomata-lab
npm install
npm start
```

Tarayıcıda `http://localhost:3000` açılır.

### Akademi Modülleri

| # | Modül | İçerik | Quiz | Trace | Build |
|---|-------|--------|------|-------|-------|
| M0 | 🧱 Temeller | Alfabe, String, Dil, Kümeler | 8 | — | — |
| M1 | ⚙️ DFA | Belirlenimli Sonlu Otomat | 7 | 5 | 3 |
| M2 | 🔀 NFA | Belirlenimci Olmayan Sonlu Otomat | 5 | 3 | 1 |
| M3 | 📐 RE & PL | Düzenli İfadeler & Pompalama Lemması | 14 | — | — |
| M4 | 📝 CFG & PDA | Bağlamdan Bağımsız Gramerler | 9 | 4 (stack) | 2 |
| M5 | 🖥️ TM | Turing Makinesi & Church-Turing | 7 | 4 (tape) | 2 |
| | **Toplam** | | **50** | **16** | **8** |

---

## 🇬🇧 English

### What Is This?

An interactive web app that teaches Sipser's automata theory curriculum with live visualizations. Read theory, solve quizzes, build automata, trace strings — all in one platform.

### Features

🎓 **6 Modules, 24 Sections** — Structured curriculum from Foundations to Turing Machines

📋 **103 Problems** — Module-tagged, 3 difficulty levels

🧪 **Free Sandbox** — Build DFA/NFA/PDA/TM with verbose diagnostics

📝 **50 Quizzes (4 types)** — Multiple choice, multi-select, matching, ordering + random pool

⟜ **16 Interactive Traces** — DFA/NFA step-by-step + **real PDA stack** + **real TM tape** visualization

🔨 **8 Build Challenges** — DFA/NFA/PDA/TM construction tasks with auto-testing

🎲 **4 Pumping Lemma Games** — Adversarial mode: 0ⁿ1ⁿ, ww, aⁿbⁿcⁿ, 1^(n²)

🔄 **RE→NFA** — Thompson's construction live

⚡ **NFA→DFA** — Subset construction step-by-step

✂️ **DFA Minimization** — Interactive table-filling algorithm

🌐 **Bilingual** — Turkish | English

### Getting Started

```bash
git clone https://github.com/alicetinkaya76/otomata-lab.git
cd otomata-lab
npm install
npm start
```

Opens `http://localhost:3000` in your browser.

---

## 📐 Mimari / Architecture

```
src/
├── OtomataLab.jsx          ← Ana container, 7 tab
├── theme.js                ← Renkler, fontlar, i18n, ortak bileşenler
├── engines.js              ← simDFA, simNFA, simPDA, simTM, minimizeDFA
├── challenges.js           ← 103 problem (module etiketli)
├── progress.js             ← localStorage ilerleme sistemi
│
├── components/
│   ├── Academy.jsx         ← 6 modül, 50 quiz, müfredat
│   ├── TraceExercise.jsx   ← 16 trace (DFA/NFA/PDA stack/TM tape)
│   ├── BuildChallenge.jsx  ← 8 build görevi (DFA/NFA/PDA/TM)
│   ├── PLGame.jsx          ← 4 Pumping Lemma oyunu
│   ├── Sandbox.jsx         ← Serbest otomat inşası
│   ├── Canvas.jsx          ← SVG otomat görselleştirme
│   ├── DFAChallenge.jsx    ← Problem çözme + teori backlink
│   ├── DFAMinimize.jsx     ← Table-filling minimizasyon
│   ├── TheoryView.jsx      ← Problem bazlı teori kartları
│   ├── REtoNFA.jsx         ← Thompson's construction
│   ├── NFAtoDFA.jsx        ← Subset construction
│   └── RealWorld.jsx       ← Gerçek dünya örnekleri
```

**19 dosya · ~6400 satır · 125 kB (gzipped)**

---

## 📚 Referans / Reference

Bu platform aşağıdaki kaynak üzerine inşa edilmiştir / Based on:

| | |
|---|---|
| **Kitap / Textbook** | *Introduction to the Theory of Computation* |
| **Yazar / Author** | [Michael Sipser](https://math.mit.edu/~sipser/) (MIT) |
| **Kapsam / Coverage** | Regular Languages → Context-Free Languages → Church-Turing Thesis |

---

## 🤝 Katkıda Bulunma / Contributing

Katkılarınızı bekliyoruz! / Contributions are welcome!

```bash
git checkout -b feature/amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
# Pull Request açın / Open a Pull Request
```

---

## 📄 Lisans / License

MIT License — detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

**Otomata Lab** — *Sipser'ın otomata teorisini anlamanın en iyi yolu, onu interaktif olarak keşfetmektir.*

*The best way to understand Sipser's automata theory is to explore it interactively.*

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! / Star this repo if you find it useful!

---

**Dr. Öğr. Üyesi Ali Çetinkaya** · Selçuk Üniversitesi · Bilgisayar Mühendisliği Bölümü
