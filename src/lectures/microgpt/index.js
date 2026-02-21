// ─── microGPT Academy — Course Manifest ──────────────────────────
// This describes the course module for the registry.
// To add a new course, create a similar structure under src/lectures/

import { WEEKS } from './data/weeks';
import { ARCH_STEPS } from './data/archSteps';
import { QUIZZES, COMMON_MISTAKES } from './data/quizzes';
import { GLOSSARY } from './data/glossary';
import { RESOURCES } from './data/resources';
import { VIZ_MAP } from './visualizations';

const microGPTCourse = {
  id: 'microgpt',
  title: { tr: 'microGPT Akademi', en: 'microGPT Academy' },
  subtitle: { tr: 'Sıfırdan GPT — 243 satır saf Python', en: 'GPT from Scratch — 243 lines pure Python' },
  icon: 'μ',
  color: '#0EA5E9',
  version: 'v22',
  weeks: WEEKS,
  archSteps: ARCH_STEPS,
  vizMap: VIZ_MAP,
  quizzes: QUIZZES,
  glossary: GLOSSARY,
  resources: RESOURCES,
  commonMistakes: COMMON_MISTAKES,
  totalWeeks: WEEKS.length,
  totalSections: WEEKS.reduce((s, w) => s + (w.sections?.length || 0), 0),
  totalViz: Object.keys(VIZ_MAP).length,
};

export default microGPTCourse;
