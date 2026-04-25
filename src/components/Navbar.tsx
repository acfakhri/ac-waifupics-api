import React, { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/',      label: 'waifu.pics', emoji: '⚡', accent: '#ff2d78' },
  { to: '/nekos', label: 'nekos.best', emoji: '🐱', accent: '#9b5de5' },
  { to: '/anime', label: 'Anime DB',   emoji: '🎌', accent: '#00d4ff' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  useEffect(() => setIsOpen(false), [location.pathname]);

  const isActive = (to: string) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  const active = LINKS.find(l => isActive(l.to));

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(10,10,15,0.97)' : 'rgba(10,10,15,0.72)',
      backdropFilter: 'blur(20px)',
      borderBottom: scrolled
        ? `1px solid ${active?.accent ?? '#9b5de5'}33`
        : '1px solid rgba(255,255,255,0.05)',
      boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.5)' : 'none',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#ff2d78,#9b5de5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(255,45,120,0.4)', flexShrink: 0 }}>
              <Zap size={16} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 900, fontSize: 'clamp(12px,2.2vw,16px)', background: 'linear-gradient(135deg,#00d4ff,#9b5de5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.06em' }}>
              AC-WAIFUPICS
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {LINKS.map(link => {
              const active = isActive(link.to);
              return (
                <Link key={link.to} to={link.to} style={{
                  padding: '6px 15px', borderRadius: 8, textDecoration: 'none',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 5,
                  color: active ? 'white' : '#8888aa',
                  background: active ? `${link.accent}22` : 'transparent',
                  border: active ? `1px solid ${link.accent}44` : '1px solid transparent',
                }}>
                  <span style={{ fontSize: 13 }}>{link.emoji}</span>
                  <span>{link.label}</span>
                  {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: link.accent, display: 'inline-block', marginLeft: 2, boxShadow: `0 0 6px ${link.accent}` }} />}
                </Link>
              );
            })}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
            <a href="https://waifu.pics/docs" target="_blank" rel="noreferrer" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, color: '#555577', textDecoration: 'none', fontWeight: 600, border: '1px solid transparent', transition: 'all 0.2s', letterSpacing: '0.04em' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9b5de5'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(155,93,229,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#555577'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
              Docs ↗
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px', cursor: 'pointer', color: '#f0f0ff', display: 'flex' }}>
            {isOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 20px 14px', background: 'rgba(8,8,14,0.99)' }}>
          {LINKS.map(link => {
            const active = isActive(link.to);
            return (
              <Link key={link.to} to={link.to} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', borderRadius: 9, textDecoration: 'none', fontSize: 14, fontWeight: active ? 700 : 500, color: active ? 'white' : '#9999bb', background: active ? `${link.accent}18` : 'transparent', borderLeft: active ? `3px solid ${link.accent}` : '3px solid transparent', marginBottom: 4 }}>
                <span>{link.emoji}</span> {link.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 600px) { nav button[style*="display: flex"]:last-child { display: none !important; } }
        @media (max-width: 599px) { nav > div > div > div:not(:last-child):not(:first-child) { display: none !important; } }
      `}</style>
    </nav>
  );
};

export default Navbar;
