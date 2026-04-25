import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Eye, Download, RefreshCw, X, ChevronDown, Shield, AlertTriangle, Grid, List, Search, Zap } from 'react-feather';

interface ImageItem { id: number; url: string; }
type ContentType = 'sfw' | 'nsfw';
type ViewMode = 'grid' | 'list';

const WAIFU_SFW = ['waifu','neko','shinobu','megumin','bully','cuddle','cry','hug','awoo','kiss',
  'lick','pat','smug','bonk','yeet','blush','smile','wave','highfive','handhold','nom','bite',
  'glomp','slap','kill','kick','happy','wink','poke','dance','cringe'];
const WAIFU_NSFW = ['waifu','neko','trap','blowjob'];
const BATCH = 12;

const Skeletons = ({ n = BATCH }) => <>{Array.from({ length: n }).map((_, i) => <div key={i} className="skeleton" style={{ height: 250, borderRadius: 14 }} />)}</>;

const WaifuPics: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [type, setType] = useState<ContentType>('sfw');
  const [cat, setCat] = useState('waifu');
  const [view, setView] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<ImageItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState('');
  const counter = useRef(0);

  const cats = type === 'sfw' ? WAIFU_SFW : WAIFU_NSFW;
  const filtered = cats.filter(c => c.includes(q.toLowerCase()));

  useEffect(() => {
    if (!cats.includes(cat)) setCat(cats[0]);
    setImages([]); setLoaded(false); setError(null);
  }, [type]);

  const fetchBatch = useCallback(async (t: ContentType, c: string, more = false) => {
    try {
      more ? setLoadingMore(true) : setLoading(true);
      setError(null);
      const res = await fetch(`https://api.waifu.pics/many/${t}/${c}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exclude: [] }),
      });
      if (!res.ok) throw new Error(`waifu.pics error ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.files)) throw new Error('Invalid response');
      const imgs = data.files.slice(0, BATCH).map((url: string) => ({ id: counter.current++, url }));
      if (more) setImages(p => [...p, ...imgs]);
      else { setImages(imgs); setLoaded(true); }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally { setLoading(false); setLoadingMore(false); }
  }, []);

  const pick = (c: string) => { setCat(c); setImages([]); setLoaded(false); fetchBatch(type, c); };
  const dl = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { const r = await fetch(url); const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `waifu-${Date.now()}.jpg`; a.click(); URL.revokeObjectURL(a.href); }
    catch { window.open(url, '_blank'); }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,40px)' }} className="fade-up">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 12 }}>
          <Zap size={12} color="#ff2d78" />
          <span style={{ fontSize: 11, color: '#ff2d78', fontWeight: 700, letterSpacing: '0.05em' }}>waifu.pics API</span>
        </div>
        <h1 className="page-title gradient-text" style={{ fontSize: 'clamp(26px,6vw,50px)', marginBottom: 8, lineHeight: 1.1 }}>Waifu Gallery</h1>
        <p style={{ color: '#8888aa', fontSize: 14 }}>
          {WAIFU_SFW.length} SFW · {WAIFU_NSFW.length} NSFW endpoints
        </p>
      </div>

      {/* Controls */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 'clamp(14px,3vw,22px)', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          {/* Type toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 10, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Content</span>
            <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 3, gap: 3 }}>
              {(['sfw','nsfw'] as ContentType[]).map(t => (
                <button key={t} onClick={() => setType(t)} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'Nunito', transition: 'all 0.2s', background: type === t ? (t === 'sfw' ? 'linear-gradient(135deg,#00d4ff,#00b4aa)' : 'linear-gradient(135deg,#ff2d78,#ff6650)') : 'transparent', color: type === t ? 'white' : '#8888aa', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {t === 'sfw' ? <Shield size={12} /> : <AlertTriangle size={12} />} {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {/* View + Refresh */}
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
            {loaded && <button className="btn-ghost" onClick={() => { setImages([]); fetchBatch(type, cat); }} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', height: 36, fontSize: 12 }}><RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh</button>}
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
              <button key={c} onClick={() => pick(c)} style={{ padding: '4px 11px', borderRadius: 20, border: cat === c ? 'none' : '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Nunito', transition: 'all 0.15s', background: cat === c ? 'linear-gradient(135deg,#ff2d78,#9b5de5)' : 'rgba(255,255,255,0.04)', color: cat === c ? 'white' : '#9999bb', boxShadow: cat === c ? '0 2px 8px rgba(255,45,120,0.35)' : 'none', transform: cat === c ? 'translateY(-1px)' : 'none' }}>{c}</button>
            ))}
          </div>
        </div>

        {!loaded && !loading && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button className="btn-primary" onClick={() => fetchBatch(type, cat)} style={{ padding: '11px 30px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              Load Gallery
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {loaded && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16, padding: '7px 13px', background: 'rgba(255,255,255,0.02)', borderRadius: 9, border: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 12, color: '#666688' }}><span style={{ color: '#ff2d78', fontWeight: 700 }}>{images.length}</span> images</span>
          <span style={{ color: '#222244' }}>·</span>
          <span style={{ fontSize: 12, color: '#666688', fontFamily: 'monospace' }}>POST /many/<span style={{ color: '#ff2d78' }}>{type}</span>/<span style={{ color: '#9b5de5' }}>{cat}</span></span>
        </div>
      )}

      {/* Error */}
      {error && <div style={{ background: 'rgba(255,45,120,0.07)', border: '1px solid rgba(255,45,120,0.22)', borderRadius: 12, padding: '11px 15px', marginBottom: 18, color: '#ff6b9d', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={14} /><span style={{ fontSize: 13, flex: 1 }}>{error}</span><button onClick={() => fetchBatch(type, cat)} style={{ background: 'rgba(255,45,120,0.2)', border: '1px solid rgba(255,45,120,0.4)', color: '#ff2d78', borderRadius: 7, padding: '3px 11px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Nunito', fontSize: 12 }}>Retry</button></div>}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(clamp(150px,18vw,220px),1fr))' : '1fr', gap: 12 }}>
        {loading ? <Skeletons /> : view === 'grid' ? images.map((img, i) => (
          <div key={img.id} className="img-card glass-card" style={{ height: 'clamp(190px,20vw,255px)', animationDelay: `${(i%BATCH)*0.04}s`, animation: 'fadeUp 0.4s ease forwards', opacity: 0 }} onClick={() => setSelected(img)}>
            <img src={img.url} alt="" loading="lazy" style={{ height: '100%' }} onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/220x255/0f0f1a/9b5de5?text=Error'; }} />
            <div className="overlay">
              <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                <button style={{ flex: 1, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 7, padding: '7px 0', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Nunito', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onClick={e => { e.stopPropagation(); setSelected(img); }}><Eye size={11} /> View</button>
                <button style={{ flex: 1, background: 'linear-gradient(135deg,#ff2d78,#9b5de5)', border: 'none', color: 'white', borderRadius: 7, padding: '7px 0', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Nunito', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onClick={e => dl(img.url, e)}><Download size={11} /> Save</button>
              </div>
            </div>
          </div>
        )) : images.map((img, i) => (
          <div key={img.id} className="glass-card" style={{ display: 'flex', gap: 13, padding: 10, cursor: 'pointer', alignItems: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.4s ease forwards', animationDelay: `${(i%BATCH)*0.03}s`, opacity: 0 }} onClick={() => setSelected(img)}>
            <img src={img.url} alt="" loading="lazy" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 9, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/70x70/0f0f1a/9b5de5?text=Err'; }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#9999bb', fontSize: 12, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.url.split('/').pop()}</p>
              <p style={{ color: '#444466', fontSize: 11, marginTop: 3 }}>waifu.pics · {type}/{cat}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-ghost" style={{ padding: '5px 11px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => { e.stopPropagation(); setSelected(img); }}><Eye size={11} /></button>
              <button className="btn-primary" style={{ padding: '5px 11px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => dl(img.url, e)}><Download size={11} /></button>
            </div>
          </div>
        ))}
      </div>

      {loadingMore && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(150px,18vw,220px),1fr))', gap: 12, marginTop: 12 }}><Skeletons /></div>}

      {images.length > 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn-primary" onClick={() => fetchBatch(type, cat, true)} disabled={loadingMore} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 30px', fontSize: 14 }}>
            {loadingMore ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : <><ChevronDown size={14} /> Load More</>}
          </button>
        </div>
      )}

      {/* MODAL */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontFamily: 'Orbitron', fontSize: 12, color: '#ff2d78', fontWeight: 700 }}>Preview</span>
              <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#f0f0ff', display: 'flex' }}><X size={16} /></button>
            </div>
            <div className="modal-img-wrap">
              <img src={selected.url} alt="Preview" />
            </div>
            <div className="modal-footer">
              <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px' }} onClick={e => dl(selected.url, e)}><Download size={13} /> Download</button>
              <button className="btn-ghost" style={{ flex: 1, padding: '9px' }} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaifuPics;
