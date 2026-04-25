import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Eye, Download, RefreshCw, X, ChevronDown, AlertTriangle, Grid, List, Search } from 'react-feather';

interface NekosItem { id: number; url: string; anime_name?: string; artist_name?: string; source?: string; }
type ViewMode = 'grid' | 'list';

const NEKOS_ENDPOINTS = [
  'husbando','kitsune','neko','waifu',
  'baka','bite','blush','bored','cry','cuddle','dance','facepalm','feed','gloat',
  'handhold','happy','highfive','hug','kick','kiss','laugh','lurk','nod','nom',
  'nope','pat','peck','poke','pout','punch','run','shrug','slap','sleep',
  'smile','smug','stare','think','thumbsup','tickle','wave','wink','yawn','yeet',
];

const BATCH = 12;
const Skeletons = ({ n = BATCH }) => <>{Array.from({ length: n }).map((_, i) => <div key={i} className="skeleton" style={{ height: 250, borderRadius: 14 }} />)}</>;

const NekosBest: React.FC = () => {
  const [images, setImages] = useState<NekosItem[]>([]);
  const [cat, setCat] = useState('neko');
  const [view, setView] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<NekosItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState('');
  const counter = useRef(0);

  const filtered = NEKOS_ENDPOINTS.filter(e => e.includes(q.toLowerCase()));

  const fetchBatch = useCallback(async (c: string, more = false) => {
    try {
      more ? setLoadingMore(true) : setLoading(true);
      setError(null);
      const res = await fetch(`https://nekos.best/api/v2/${c}?amount=${BATCH}`);
      if (!res.ok) throw new Error(`nekos.best error ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.results)) throw new Error('Invalid response');
      const imgs: NekosItem[] = data.results.map((r: { url: string; anime_name?: string; artist_name?: string; source?: string }) => ({
        id: counter.current++, url: r.url,
        anime_name: r.anime_name, artist_name: r.artist_name, source: r.source,
      }));
      if (more) setImages(p => [...p, ...imgs]);
      else { setImages(imgs); setLoaded(true); }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally { setLoading(false); setLoadingMore(false); }
  }, []);

  const pick = (c: string) => { setCat(c); setImages([]); setLoaded(false); fetchBatch(c); };
  const dl = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { const r = await fetch(url); const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `nekos-${Date.now()}.${url.endsWith('.gif') ? 'gif' : 'jpg'}`; a.click(); URL.revokeObjectURL(a.href); }
    catch { window.open(url, '_blank'); }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,40px)' }} className="fade-up">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(155,93,229,0.1)', border: '1px solid rgba(155,93,229,0.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 12 }}>
          <span style={{ fontSize: 13 }}>🐱</span>
          <span style={{ fontSize: 11, color: '#9b5de5', fontWeight: 700, letterSpacing: '0.05em' }}>nekos.best API</span>
        </div>
        <h1 className="page-title" style={{ fontSize: 'clamp(26px,6vw,50px)', marginBottom: 8, lineHeight: 1.1, background: 'linear-gradient(135deg,#9b5de5,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nekos Gallery</h1>
        <p style={{ color: '#8888aa', fontSize: 14 }}>{NEKOS_ENDPOINTS.length} SFW endpoints · Includes anime &amp; artist metadata</p>
      </div>

      {/* Controls */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 'clamp(14px,3vw,22px)', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', background: 'rgba(155,93,229,0.08)', border: '1px solid rgba(155,93,229,0.2)', borderRadius: 9 }}>
            <span style={{ fontSize: 11, color: '#9b5de5', fontWeight: 700 }}>✓ SFW Only</span>
            <span style={{ fontSize: 11, color: '#555577' }}>· All endpoints safe</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 10, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>View</span>
              <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 3, gap: 3 }}>
                {(['grid','list'] as ViewMode[]).map(m => (
                  <button key={m} onClick={() => setView(m)} style={{ padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: view === m ? 'rgba(155,93,229,0.35)' : 'transparent', color: view === m ? 'white' : '#8888aa', display: 'flex', alignItems: 'center' }}>
                    {m === 'grid' ? <Grid size={14} /> : <List size={14} />}
                  </button>
                ))}
              </div>
            </div>
            {loaded && <button className="btn-ghost" onClick={() => { setImages([]); fetchBatch(cat); }} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', height: 36, fontSize: 12 }}><RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh</button>}
          </div>
        </div>

        {/* Categories */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
            <span style={{ fontSize: 10, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Endpoint <span style={{ color: '#333355', fontWeight: 400 }}>({filtered.length})</span></span>
            <div style={{ position: 'relative' }}>
              <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#555577' }} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter..." style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '5px 9px 5px 25px', color: '#f0f0ff', fontSize: 12, fontFamily: 'Nunito', outline: 'none', width: 110 }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxHeight: 110, overflowY: 'auto' }}>
            {filtered.map(c => (
              <button key={c} onClick={() => pick(c)} style={{ padding: '4px 11px', borderRadius: 20, border: cat === c ? 'none' : '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Nunito', transition: 'all 0.15s', background: cat === c ? 'linear-gradient(135deg,#9b5de5,#00d4ff)' : 'rgba(255,255,255,0.04)', color: cat === c ? 'white' : '#9999bb', boxShadow: cat === c ? '0 2px 8px rgba(155,93,229,0.35)' : 'none', transform: cat === c ? 'translateY(-1px)' : 'none' }}>{c}</button>
            ))}
          </div>
        </div>

        {!loaded && !loading && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button className="btn-primary" onClick={() => fetchBatch(cat)} style={{ background: 'linear-gradient(135deg,#9b5de5,#00d4ff)', padding: '11px 30px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 15px rgba(155,93,229,0.35)' }}>
              Load Gallery
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {loaded && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16, padding: '7px 13px', background: 'rgba(255,255,255,0.02)', borderRadius: 9, border: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 12, color: '#666688' }}><span style={{ color: '#9b5de5', fontWeight: 700 }}>{images.length}</span> images</span>
          <span style={{ color: '#222244' }}>·</span>
          <span style={{ fontSize: 12, color: '#666688', fontFamily: 'monospace' }}>GET /api/v2/<span style={{ color: '#9b5de5' }}>{cat}</span></span>
        </div>
      )}

      {/* Error */}
      {error && <div style={{ background: 'rgba(255,45,120,0.07)', border: '1px solid rgba(255,45,120,0.22)', borderRadius: 12, padding: '11px 15px', marginBottom: 18, color: '#ff6b9d', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={14} /><span style={{ fontSize: 13, flex: 1 }}>{error}</span><button onClick={() => fetchBatch(cat)} style={{ background: 'rgba(255,45,120,0.2)', border: '1px solid rgba(255,45,120,0.4)', color: '#ff2d78', borderRadius: 7, padding: '3px 11px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Nunito', fontSize: 12 }}>Retry</button></div>}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(clamp(150px,18vw,220px),1fr))' : '1fr', gap: 12 }}>
        {loading ? <Skeletons /> : view === 'grid' ? images.map((img, i) => (
          <div key={img.id} className="img-card glass-card" style={{ height: 'clamp(190px,20vw,255px)', animationDelay: `${(i%BATCH)*0.04}s`, animation: 'fadeUp 0.4s ease forwards', opacity: 0 }} onClick={() => setSelected(img)}>
            <img src={img.url} alt="" loading="lazy" style={{ height: '100%' }} onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/220x255/0f0f1a/9b5de5?text=Error'; }} />
            <div className="overlay">
              <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                <button style={{ flex: 1, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 7, padding: '7px 0', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Nunito', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onClick={e => { e.stopPropagation(); setSelected(img); }}><Eye size={11} /> View</button>
                <button style={{ flex: 1, background: 'linear-gradient(135deg,#9b5de5,#00d4ff)', border: 'none', color: 'white', borderRadius: 7, padding: '7px 0', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Nunito', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onClick={e => dl(img.url, e)}><Download size={11} /> Save</button>
              </div>
            </div>
          </div>
        )) : images.map((img, i) => (
          <div key={img.id} className="glass-card" style={{ display: 'flex', gap: 13, padding: 10, cursor: 'pointer', alignItems: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.4s ease forwards', animationDelay: `${(i%BATCH)*0.03}s`, opacity: 0 }} onClick={() => setSelected(img)}>
            <img src={img.url} alt="" loading="lazy" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 9, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/70x70/0f0f1a/9b5de5?text=Err'; }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#9999bb', fontSize: 12, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.url.split('/').pop()}</p>
              {img.anime_name && <p style={{ color: '#9b5de5', fontSize: 11, marginTop: 2 }}>🎌 {img.anime_name}</p>}
              {img.artist_name && <p style={{ color: '#666688', fontSize: 11 }}>✏️ {img.artist_name}</p>}
              {!img.anime_name && <p style={{ color: '#444466', fontSize: 11, marginTop: 2 }}>nekos.best · {cat}</p>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-ghost" style={{ padding: '5px 11px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => { e.stopPropagation(); setSelected(img); }}><Eye size={11} /></button>
              <button className="btn-primary" style={{ padding: '5px 11px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg,#9b5de5,#00d4ff)', boxShadow: '0 3px 10px rgba(155,93,229,0.3)' }} onClick={e => dl(img.url, e)}><Download size={11} /></button>
            </div>
          </div>
        ))}
      </div>

      {loadingMore && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(150px,18vw,220px),1fr))', gap: 12, marginTop: 12 }}><Skeletons /></div>}

      {images.length > 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn-primary" onClick={() => fetchBatch(cat, true)} disabled={loadingMore} style={{ background: 'linear-gradient(135deg,#9b5de5,#00d4ff)', boxShadow: '0 4px 15px rgba(155,93,229,0.35)', display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 30px', fontSize: 14 }}>
            {loadingMore ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : <><ChevronDown size={14} /> Load More</>}
          </button>
        </div>
      )}

      {/* MODAL */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ fontFamily: 'Orbitron', fontSize: 12, color: '#9b5de5', fontWeight: 700, flexShrink: 0 }}>Preview</span>
                {selected.anime_name && <span style={{ fontSize: 11, color: '#9b5de5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· 🎌 {selected.anime_name}</span>}
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#f0f0ff', display: 'flex', flexShrink: 0, marginLeft: 8 }}><X size={16} /></button>
            </div>
            <div className="modal-img-wrap">
              <img src={selected.url} alt="Preview" />
            </div>
            {(selected.anime_name || selected.artist_name || selected.source) && (
              <div className="modal-meta">
                {selected.anime_name && <p style={{ color: '#8888aa', fontSize: 11, margin: '2px 0' }}>Anime: <span style={{ color: '#9b5de5' }}>{selected.anime_name}</span></p>}
                {selected.artist_name && <p style={{ color: '#8888aa', fontSize: 11, margin: '2px 0' }}>Artist: <span style={{ color: '#00d4ff' }}>{selected.artist_name}</span></p>}
                {selected.source && <p style={{ color: '#8888aa', fontSize: 11, margin: '2px 0' }}>Source: <a href={selected.source} target="_blank" rel="noreferrer" style={{ color: '#ff2d78', textDecoration: 'none' }}>{selected.source.slice(0,50)}{selected.source.length>50?'…':''}</a></p>}
              </div>
            )}
            <div className="modal-footer">
              <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: 'linear-gradient(135deg,#9b5de5,#00d4ff)', boxShadow: '0 4px 15px rgba(155,93,229,0.3)' }} onClick={e => dl(selected.url, e)}><Download size={13} /> Download</button>
              <button className="btn-ghost" style={{ flex: 1, padding: '9px' }} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NekosBest;
