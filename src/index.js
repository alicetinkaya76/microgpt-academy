import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ─── Analytics ──────────────────────────────────────────────────
// Vercel Analytics (automatic — just works on Vercel)
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Google Analytics 4 (optional — replace G-GDKEZ570W6 with your ID)
import ReactGA from 'react-ga4';

const GA_ID = 'G-GDKEZ570W6'; // ← Replace with your GA4 Measurement ID
if (GA_ID !== 'G-GDKEZ570W6') {
  ReactGA.initialize(GA_ID);
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
}

// ─── Render ─────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
);
