// ─── Google Analytics & Event Tracking ─────────────────────────
const GA_ID = 'G-GDKEZ570W6'; // MicroGPT Academy GA4

export const initGA = (id = GA_ID) => {
  if (typeof window === 'undefined' || window.__GA_INIT) return;
  const s = document.createElement('script');
  s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });
  window.__GA_INIT = true;
};

const _log = (type, data) => {
  window.gtag?.('event', type, data);
  try {
    const st = JSON.parse(localStorage.getItem('_analytics') || '[]');
    st.push({ type, ts: Date.now(), ...data });
    if (st.length > 5000) st.splice(0, st.length - 5000);
    localStorage.setItem('_analytics', JSON.stringify(st));
  } catch(e) {}
};

export const trackNav     = (course, week, section) => _log('nav', { course, week, section });
export const trackTab     = (course, tab) => _log('tab', { course, tab });
export const trackLang    = (lang) => _log('lang', { lang });
export const trackComplete= (course, week, section) => _log('complete', { course, week, section });
export const trackQuiz    = (course, week, score) => _log('quiz', { course, week, score });
export const trackLab     = (course, lab, action) => _log('lab', { course, lab, action });

export const getAnalytics = () => {
  try { return JSON.parse(localStorage.getItem('_analytics') || '[]'); }
  catch { return []; }
};
export const clearAnalytics = () => { try { localStorage.removeItem('_analytics'); } catch{} };
export const getSummary = () => {
  const ev = getAnalytics(), now = Date.now(), day = 864e5;
  return {
    total: ev.length,
    last24h: ev.filter(e => now - e.ts < day).length,
    last7d: ev.filter(e => now - e.ts < 7*day).length,
    byType: ev.reduce((a,e) => { a[e.type]=(a[e.type]||0)+1; return a; }, {}),
    recent: ev.slice(-30).reverse(),
  };
};
