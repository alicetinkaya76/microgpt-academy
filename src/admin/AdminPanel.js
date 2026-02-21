import React, { useState, useEffect } from 'react';
import { useLang } from '../core/i18n';
import { getSummary, clearAnalytics } from '../core/analytics';

const AdminPanel = ({ onClose, courses = [], lang }) => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);

  useEffect(() => { setStats(getSummary()); }, []);

  const StatCard = ({ value, label, color }) => (
    <div style={{ padding: 16, borderRadius: 12, textAlign: 'center', background: `${color}08`, border: `1px solid ${color}20`, flex: 1 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'Fira Code', monospace" }}>{value}</div>
      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90%', maxWidth: 850, maxHeight: '85vh', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#EF4444,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚙️</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#E2E8F0' }}>{lang === 'tr' ? 'Yönetim Paneli' : 'Admin Panel'}</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>{lang === 'tr' ? 'Ders yönetimi ve analitik' : 'Course management & analytics'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: 14, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ id: 'overview', l: '📊 ' + (lang === 'tr' ? 'Genel' : 'Overview') }, { id: 'courses', l: '📚 ' + (lang === 'tr' ? 'Dersler' : 'Courses') }, { id: 'events', l: '🔔 ' + (lang === 'tr' ? 'Olaylar' : 'Events') }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '12px 18px', border: 'none', cursor: 'pointer', background: tab === t.id ? 'rgba(14,165,233,0.1)' : 'transparent', borderBottom: tab === t.id ? '2px solid #0EA5E9' : '2px solid transparent', color: tab === t.id ? '#0EA5E9' : '#64748B', fontSize: 14, fontWeight: 600 }}>{t.l}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {tab === 'overview' && stats && (
            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <StatCard value={stats.total} label={lang === 'tr' ? 'Toplam Olay' : 'Total Events'} color="#0EA5E9" />
                <StatCard value={stats.last24h} label={lang === 'tr' ? 'Son 24 Saat' : 'Last 24h'} color="#10B981" />
                <StatCard value={stats.last7d} label={lang === 'tr' ? 'Son 7 Gün' : 'Last 7d'} color="#8B5CF6" />
              </div>
              {Object.entries(stats.byType).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 120, fontSize: 13, color: '#94A3B8', fontFamily: "'Fira Code', monospace" }}>{type}</span>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / stats.total) * 100}%`, borderRadius: 4, background: '#0EA5E9' }} />
                  </div>
                  <span style={{ width: 40, fontSize: 12, color: '#64748B', textAlign: 'right' }}>{count}</span>
                </div>
              ))}
              <button onClick={() => { clearAnalytics(); setStats(getSummary()); }} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: '#EF4444', fontSize: 13, cursor: 'pointer' }}>🗑️ {lang === 'tr' ? 'Verileri Temizle' : 'Clear Data'}</button>
            </div>
          )}
          {tab === 'courses' && (
            <div>
              {courses.map((c, i) => (
                <div key={i} style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: '#64748B' }}>{c.weeks} {lang === 'tr' ? 'hafta' : 'weeks'} • {c.sections} {lang === 'tr' ? 'bölüm' : 'sections'} • {c.vizCount} viz</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: 18, borderRadius: 14, background: 'rgba(14,165,233,0.04)', border: '1px dashed rgba(14,165,233,0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>➕</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0EA5E9' }}>{lang === 'tr' ? 'Yeni Ders Ekle' : 'Add New Course'}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>{lang === 'tr' ? 'src/lectures/ klasörüne yeni modül ekleyin' : 'Add a new module to src/lectures/'}</div>
              </div>
            </div>
          )}
          {tab === 'events' && stats && (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {stats.recent.map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 12 }}>
                  <span style={{ width: 100, color: '#475569', fontFamily: "'Fira Code', monospace" }}>{new Date(ev.ts).toLocaleTimeString()}</span>
                  <span style={{ color: '#0EA5E9', fontWeight: 600 }}>{ev.type}</span>
                  {ev.course && <span style={{ color: '#64748B' }}>• {ev.course}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
