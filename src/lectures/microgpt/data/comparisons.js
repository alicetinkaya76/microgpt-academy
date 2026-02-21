const getComparisons = (lang) => ({
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
});


export { getComparisons };
