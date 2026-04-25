import React from 'react';
import { Heart, Zap } from 'react-feather';
import { Link } from 'react-router-dom';

const PAGES = [
  { to: '/',      emoji: '⚡', label: 'waifu.pics Gallery', color: '#ff2d78' },
  { to: '/nekos', emoji: '🐱', label: 'nekos.best Gallery', color: '#9b5de5' },
  { to: '/anime', emoji: '🎌', label: 'Anime Database',     color: '#00d4ff' },
];

const APIS = [
  { name: 'waifu.pics', url: 'https://waifu.pics/docs', color: '#ff2d78' },
  { name: 'nekos.best', url: 'https://nekos.best/api', color: '#9b5de5' },
  { name: 'Jikan API v4 (MAL)', url: 'https://docs.api.jikan.moe', color: '#00d4ff' },
];

const Footer: React.FC = () => (
  <footer style={{ marginTop: 80, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,14,0.85)', backdropFilter: 'blur(12px)' }}>
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(24px,4vw,40px) clamp(16px,4vw,40px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'clamp(24px,4vw,48px)', marginBottom: 32 }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#ff2d78,#9b5de5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 900, fontSize: 14, color: '#f0f0ff' }}>NYANKO</span>
          </div>
          <p style={{ color: '#555577', fontSize: 12, lineHeight: 1.7 }}>Anime image gallery &amp; database. Three APIs, one place.</p>
        </div>

        {/* Pages */}
        <div>
          <p style={{ color: '#f0f0ff', fontWeight: 700, marginBottom: 11, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Pages</p>
          {PAGES.map(p => (
            <Link key={p.to} to={p.to} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#666688', textDecoration: 'none', fontSize: 13, marginBottom: 7, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = p.color)}
              onMouseLeave={e => (e.currentTarget.style.color = '#666688')}>
              <span>{p.emoji}</span> {p.label}
            </Link>
          ))}
        </div>

        {/* APIs */}
        <div>
          <p style={{ color: '#f0f0ff', fontWeight: 700, marginBottom: 11, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>APIs</p>
          {APIS.map(a => (
            <a key={a.name} href={a.url} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#666688', textDecoration: 'none', fontSize: 13, marginBottom: 7, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = a.color)}
              onMouseLeave={e => (e.currentTarget.style.color = '#666688')}>
              {a.name} ↗
            </a>
          ))}
        </div>

        {/* Stack */}
        <div>
          <p style={{ color: '#f0f0ff', fontWeight: 700, marginBottom: 11, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Built With</p>
          {['React 18 + TypeScript', 'Vite + Tailwind CSS', 'react-router-dom v6', 'react-feather icons'].map(s => (
            <p key={s} style={{ color: '#444466', fontSize: 12, marginBottom: 6 }}>{s}</p>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#333355', fontSize: 12 }}>
        <span>Made with</span><Heart size={11} color="#ff2d78" fill="#ff2d78" /><span>© {new Date().getFullYear()} Nyanko-Nyan</span>
      </div>
    </div>
  </footer>
);

export default Footer;
