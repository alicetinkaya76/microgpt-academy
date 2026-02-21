import React from 'react';

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

export { LangContext, useLang, tx, UI, u };
