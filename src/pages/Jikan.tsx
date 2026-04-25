import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, X, Star, BookOpen, Users, Award, ChevronDown,
  RefreshCw, AlertTriangle, ExternalLink, Calendar, Clock, Tv, TrendingUp
} from 'react-feather';

// ── Types ──────────────────────────────────────────────────────────────────
interface AnimeItem {
  mal_id: number;
  title: string;
  title_english?: string;
  images: { jpg: { image_url: string; large_image_url?: string } };
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  episodes?: number;
  duration?: string;
  status?: string;
  type?: string;
  aired?: { string?: string };
  synopsis?: string;
  genres?: { mal_id: number; name: string }[];
  studios?: { mal_id: number; name: string }[];
  year?: number;
  season?: string;
  members?: number;
}

interface MangaItem {
  mal_id: number;
  title: string;
  title_english?: string;
  images: { jpg: { image_url: string; large_image_url?: string } };
  score?: number;
  rank?: number;
  popularity?: number;
  chapters?: number;
  volumes?: number;
  status?: string;
  synopsis?: string;
  genres?: { mal_id: number; name: string }[];
  authors?: { mal_id: number; name: string }[];
  published?: { string?: string };
}

interface CharacterItem {
  mal_id: number;
  name: string;
  name_kanji?: string;
  images: { jpg: { image_url: string } };
  favorites?: number;
  about?: string;
  anime?: { mal_id: number; title: string; url: string }[];
}

interface SeasonItem {
  season: string;
  year: number;
}

type EndpointKey =
  | 'top-anime' | 'top-manga' | 'top-characters'
  | 'seasonal-now' | 'seasonal-upcoming'
  | 'search-anime' | 'search-manga' | 'search-characters'
  | 'schedule' | 'anime-genres' | 'manga-genres';

type ContentItem = AnimeItem | MangaItem | CharacterItem;

// ── Endpoint config ────────────────────────────────────────────────────────
const ENDPOINTS: { key: EndpointKey; label: string; icon: React.ReactNode; desc: string; group: string }[] = [
  { key: 'top-anime',         label: 'Top Anime',          icon: <Star size={14} />,      desc: 'Highest rated anime on MAL',          group: 'Rankings' },
  { key: 'top-manga',         label: 'Top Manga',          icon: <BookOpen size={14} />,  desc: 'Highest rated manga on MAL',          group: 'Rankings' },
  { key: 'top-characters',    label: 'Top Characters',     icon: <Users size={14} />,     desc: 'Most popular anime characters',       group: 'Rankings' },
  { key: 'seasonal-now',      label: 'Airing Now',         icon: <Tv size={14} />,        desc: 'Anime airing this season',            group: 'Seasonal' },
  { key: 'seasonal-upcoming', label: 'Upcoming',           icon: <Calendar size={14} />,  desc: 'Anime for next season',              group: 'Seasonal' },
  { key: 'schedule',          label: 'Today\'s Schedule',  icon: <Clock size={14} />,     desc: 'What\'s airing today',               group: 'Seasonal' },
  { key: 'search-anime',      label: 'Search Anime',       icon: <Search size={14} />,    desc: 'Search the anime database',           group: 'Search' },
  { key: 'search-manga',      label: 'Search Manga',       icon: <Search size={14} />,    desc: 'Search the manga database',           group: 'Search' },
  { key: 'search-characters', label: 'Search Characters',  icon: <Search size={14} />,    desc: 'Search anime characters',             group: 'Search' },
  { key: 'anime-genres',      label: 'Anime by Genre',     icon: <Award size={14} />,     desc: 'Browse anime by genre',              group: 'Browse' },
  { key: 'manga-genres',      label: 'Manga by Genre',     icon: <Award size={14} />,     desc: 'Browse manga by genre',              group: 'Browse' },
];

const ANIME_GENRES = [
  { id: 1, name: 'Action' }, { id: 2, name: 'Adventure' }, { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' }, { id: 10, name: 'Fantasy' }, { id: 14, name: 'Horror' },
  { id: 22, name: 'Romance' }, { id: 24, name: 'Sci-Fi' }, { id: 36, name: 'Slice of Life' },
  { id: 37, name: 'Supernatural' }, { id: 7, name: 'Mystery' }, { id: 27, name: 'Shounen' },
];

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

// ── Skeleton ──────────────────────────────────────────────────────────────
const SkeletonCards: React.FC<{ count?: number }> = ({ count = 12 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 320, borderRadius: 14 }} />
    ))}
  </>
);

// ── Score Badge ───────────────────────────────────────────────────────────
const ScoreBadge: React.FC<{ score?: number }> = ({ score }) => {
  if (!score) return null;
  const color = score >= 8 ? '#00d4ff' : score >= 7 ? '#9b5de5' : score >= 6 ? '#ffb347' : '#ff6b6b';
  return (
    <span style={{ background: `${color}22`, border: `1px solid ${color}55`, color, borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
      <Star size={10} fill={color} /> {score.toFixed(1)}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const Jikan: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointKey>('top-anime');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(ANIME_GENRES[0]);
  const [selectedDay, setSelectedDay] = useState('monday');

  const groups = [...new Set(ENDPOINTS.map(e => e.group))];

  const buildUrl = useCallback((ep: EndpointKey, pg: number, q?: string): string => {
    const base = 'https://api.jikan.moe/v4';
    const params = new URLSearchParams({ page: String(pg), limit: '24' });
    switch (ep) {
      case 'top-anime':        return `${base}/top/anime?${params}`;
      case 'top-manga':        return `${base}/top/manga?${params}`;
      case 'top-characters':   return `${base}/top/characters?${params}`;
      case 'seasonal-now':     return `${base}/seasons/now?${params}`;
      case 'seasonal-upcoming':return `${base}/seasons/upcoming?${params}`;
      case 'schedule':         return `${base}/schedules/${selectedDay}?${params}`;
      case 'search-anime':     return `${base}/anime?q=${encodeURIComponent(q||searchQuery)}&${params}`;
      case 'search-manga':     return `${base}/manga?q=${encodeURIComponent(q||searchQuery)}&${params}`;
      case 'search-characters':return `${base}/characters?q=${encodeURIComponent(q||searchQuery)}&${params}`;
      case 'anime-genres':     return `${base}/anime?genres=${selectedGenre.id}&${params}`;
      case 'manga-genres':     return `${base}/manga?genres=${selectedGenre.id}&${params}`;
      default:                 return `${base}/top/anime?${params}`;
    }
  }, [searchQuery, selectedDay, selectedGenre]);

  const fetchData = useCallback(async (ep: EndpointKey, pg: number, loadMore = false, q?: string) => {
    try {
      loadMore ? setIsLoadingMore(true) : setIsLoading(true);
      setError(null);

      // Jikan rate limit: 3 req/sec — small delay on loadMore
      if (loadMore) await new Promise(r => setTimeout(r, 400));

      const url = buildUrl(ep, pg, q);
      const res = await fetch(url);
      if (res.status === 429) throw new Error('Rate limited by Jikan API — please wait a moment');
      if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);
      const json = await res.json();

      const data = json.data || [];
      const pagination = json.pagination;

      if (loadMore) setItems(prev => [...prev, ...data]);
      else setItems(data);

      setHasNextPage(pagination?.has_next_page ?? false);
      setPage(pg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch from Jikan API');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [buildUrl]);

  // Auto-fetch on endpoint change (non-search)
  useEffect(() => {
    if (!activeEndpoint.startsWith('search')) {
      setItems([]); setPage(1); setHasNextPage(false);
      fetchData(activeEndpoint, 1);
    } else {
      setItems([]);
    }
  }, [activeEndpoint, selectedGenre, selectedDay]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setItems([]); setPage(1);
    fetchData(activeEndpoint, 1, false, searchQuery);
  };

  const handleLoadMore = () => fetchData(activeEndpoint, page + 1, true);

  // ESC modal
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const isAnime = (item: ContentItem): item is AnimeItem => 'episodes' in item || 'aired' in item || 'studios' in item;
  const isManga = (item: ContentItem): item is MangaItem => 'chapters' in item || 'volumes' in item;
  const isChar = (item: ContentItem): item is CharacterItem => 'name_kanji' in item || 'favorites' in item;

  const getImage = (item: ContentItem) => {
    const jpg = item.images?.jpg as any;
    return jpg?.large_image_url || jpg?.image_url || 'https://placehold.co/225x320/0f0f1a/9b5de5?text=No+Image';
  };
  const getTitle = (item: ContentItem) =>
    isChar(item) ? item.name : (item as AnimeItem).title_english || (item as AnimeItem).title;

  const getScore = (item: ContentItem) =>
    isChar(item) ? undefined : (item as AnimeItem).score;

  const getSubtitle = (item: ContentItem) => {
    if (isChar(item)) return item.name_kanji || '';
    if (isAnime(item)) return [item.type, item.episodes ? `${item.episodes} eps` : item.status].filter(Boolean).join(' · ');
    if (isManga(item)) return [(item as MangaItem).chapters ? `${(item as MangaItem).chapters} ch` : '', (item as MangaItem).status].filter(Boolean).join(' · ');
    return '';
  };

  const activeEp = ENDPOINTS.find(e => e.key === activeEndpoint)!;
  const isSearch = activeEndpoint.startsWith('search');
  const isGenre = activeEndpoint.includes('genres');
  const isSchedule = activeEndpoint === 'schedule';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px)' }} className="fade-up">

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 48px)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '6px 16px' }}>
          <TrendingUp size={14} style={{ color: '#00d4ff' }} />
          <span style={{ fontSize: 12, color: '#8888aa', fontWeight: 600 }}>Powered by Jikan API v4</span>
        </div>
        <h1 className="page-title gradient-text" style={{ fontSize: 'clamp(26px, 6vw, 52px)', marginBottom: 10, lineHeight: 1.1 }}>
          Anime Database
        </h1>
        <p style={{ color: '#8888aa', fontSize: 'clamp(13px, 2vw, 15px)' }}>
          Browse MAL data — Top lists, seasonals, genres & more
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Sidebar Endpoints ── */}
        <div style={{ width: 'clamp(180px, 22vw, 230px)', flexShrink: 0, position: 'sticky', top: 80 }}>
          {groups.map(group => (
            <div key={group} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: '#444466', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 8, paddingLeft: 4 }}>{group}</p>
              {ENDPOINTS.filter(e => e.group === group).map(ep => (
                <button key={ep.key} onClick={() => { setActiveEndpoint(ep.key); setSearchQuery(''); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
                    borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 3,
                    transition: 'all 0.18s ease', fontFamily: 'Nunito',
                    background: activeEndpoint === ep.key ? 'linear-gradient(135deg, rgba(155,93,229,0.25), rgba(0,212,255,0.1))' : 'transparent',
                    color: activeEndpoint === ep.key ? '#f0f0ff' : '#8888aa',
                    borderLeft: activeEndpoint === ep.key ? '2px solid #9b5de5' : '2px solid transparent',
                  }}>
                  <span style={{ color: activeEndpoint === ep.key ? '#9b5de5' : '#555577', flexShrink: 0 }}>{ep.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: activeEndpoint === ep.key ? 700 : 500 }}>{ep.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 800, color: '#f0f0ff', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#9b5de5' }}>{activeEp.icon}</span> {activeEp.label}
              </h2>
              <p style={{ fontSize: 12, color: '#555577' }}>{activeEp.desc}</p>
            </div>

            {/* Search bar */}
            {isSearch && (
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginLeft: 'auto', flex: '1 1 260px', maxWidth: 400 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555577' }} />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeEndpoint === 'search-anime' ? 'anime' : activeEndpoint === 'search-manga' ? 'manga' : 'characters'}...`}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px 9px 36px', color: '#f0f0ff', fontSize: 13, fontFamily: 'Nunito', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '9px 18px', fontSize: 13, flexShrink: 0 }}>Search</button>
              </form>
            )}

            {/* Genre selector */}
            {isGenre && (
              <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 500 }}>
                {ANIME_GENRES.map(g => (
                  <button key={g.id} onClick={() => setSelectedGenre(g)} style={{
                    padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, fontFamily: 'Nunito', transition: 'all 0.15s',
                    background: selectedGenre.id === g.id ? 'linear-gradient(135deg,#ff2d78,#9b5de5)' : 'rgba(255,255,255,0.05)',
                    color: selectedGenre.id === g.id ? 'white' : '#8888aa',
                    border: selectedGenre.id === g.id ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  }}>{g.name}</button>
                ))}
              </div>
            )}

            {/* Day selector for schedule */}
            {isSchedule && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
                {DAYS.map(day => (
                  <button key={day} onClick={() => setSelectedDay(day)} style={{
                    padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, fontFamily: 'Nunito', transition: 'all 0.15s',
                    background: selectedDay === day ? 'linear-gradient(135deg,#9b5de5,#00d4ff)' : 'rgba(255,255,255,0.04)',
                    color: selectedDay === day ? 'white' : '#8888aa',
                    textTransform: 'capitalize',
                  }}>{day.slice(0, 3)}</button>
                ))}
              </div>
            )}

            {/* Stats + Refresh */}
            {items.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: isSearch || isGenre || isSchedule ? 0 : 'auto' }}>
                <span style={{ fontSize: 12, color: '#555577' }}>{items.length} results</span>
                <button className="btn-ghost" onClick={() => { setItems([]); setPage(1); fetchData(activeEndpoint, 1); }}
                  disabled={isLoading} style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <RefreshCw size={12} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(255,45,120,0.07)', border: '1px solid rgba(255,45,120,0.22)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#ff6b9d', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={14} />
              <span style={{ fontSize: 13, flex: 1 }}>{error}</span>
              <button onClick={() => fetchData(activeEndpoint, 1)} style={{ background: 'rgba(255,45,120,0.2)', border: '1px solid rgba(255,45,120,0.4)', color: '#ff2d78', borderRadius: 7, padding: '3px 12px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Nunito', fontSize: 12 }}>Retry</button>
            </div>
          )}

          {/* Search empty state */}
          {isSearch && items.length === 0 && !isLoading && !error && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555577' }}>
              <Search size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
              <p style={{ fontSize: 15, fontWeight: 600 }}>Start searching</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Type a query above and press Search</p>
            </div>
          )}

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 16vw, 200px), 1fr))', gap: 14 }}>
            {isLoading ? <SkeletonCards count={12} /> : items.map((item, idx) => (
              <div key={item.mal_id} className="glass-card" style={{
                cursor: 'pointer', overflow: 'hidden',
                animation: 'fadeUp 0.4s ease forwards',
                animationDelay: `${(idx % 24) * 0.03}s`, opacity: 0,
                display: 'flex', flexDirection: 'column',
              }} onClick={() => setSelected(item)}>
                {/* Cover */}
                <div style={{ position: 'relative', height: 'clamp(180px, 20vw, 240px)', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={getImage(item)} alt={getTitle(item)} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x240/0f0f1a/9b5de5?text=No+Image'; }} />
                  {/* Rank badge */}
                  {(item as AnimeItem).rank && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 800, color: '#00d4ff', fontFamily: 'Orbitron' }}>
                      #{(item as AnimeItem).rank}
                    </div>
                  )}
                  {/* Score */}
                  {getScore(item) && (
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <ScoreBadge score={getScore(item)} />
                    </div>
                  )}
                  {/* Char favorites */}
                  {isChar(item) && (item as CharacterItem).favorites && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,45,120,0.2)', border: '1px solid rgba(255,45,120,0.4)', borderRadius: 6, padding: '2px 7px', fontSize: 10, color: '#ff6b9d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                      ♥ {((item as CharacterItem).favorites || 0).toLocaleString()}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: '10px 10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#f0f0ff', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{getTitle(item)}</p>
                  <p style={{ fontSize: 10, color: '#666688', lineHeight: 1.3 }}>{getSubtitle(item)}</p>
                  {isAnime(item) && item.genres && item.genres.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 2 }}>
                      {item.genres.slice(0, 2).map(g => (
                        <span key={g.mal_id} style={{ background: 'rgba(155,93,229,0.12)', border: '1px solid rgba(155,93,229,0.25)', color: '#9b5de5', borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>{g.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {items.length > 0 && !isLoading && hasNextPage && (
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <button className="btn-primary" onClick={handleLoadMore} disabled={isLoadingMore}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 30px', fontSize: 14 }}>
                {isLoadingMore ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : <><ChevronDown size={14} /> Load More</>}
              </button>
            </div>
          )}
          {isLoadingMore && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px,16vw,200px),1fr))', gap: 14, marginTop: 14 }}>
              <SkeletonCards count={6} />
            </div>
          )}
        </div>
      </div>

      {/* ── DETAIL MODAL (FIXED) ── */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" style={{ width: 'min(680px, 100%)' }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <span style={{ fontFamily: 'Orbitron', fontSize: 12, color: '#00d4ff', fontWeight: 700 }}>Detail</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {(selected as AnimeItem).mal_id && (
                  <a href={`https://myanimelist.net/${isChar(selected) ? 'character' : isAnime(selected) ? 'anime' : 'manga'}/${(selected as AnimeItem).mal_id}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9b5de5', textDecoration: 'none', background: 'rgba(155,93,229,0.1)', border: '1px solid rgba(155,93,229,0.25)', borderRadius: 7, padding: '5px 10px' }}>
                    <ExternalLink size={11} /> MAL
                  </a>
                )}
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#f0f0ff', display: 'flex' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body — scrollable */}
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, background: 'rgba(8,8,14,0.5)' }}>
              <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
                {/* Image panel */}
                <div style={{ width: 'clamp(140px, 30%, 200px)', flexShrink: 0, background: '#08080f' }}>
                  <img src={getImage(selected)} alt={getTitle(selected)}
                    style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 300 }}
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x300/0f0f1a/9b5de5?text=No+Image'; }} />
                </div>

                {/* Info panel */}
                <div style={{ flex: 1, minWidth: 0, padding: '18px 18px 18px 16px' }}>
                  <h3 style={{ fontSize: 'clamp(14px,2vw,18px)', fontWeight: 800, color: '#f0f0ff', marginBottom: 4, lineHeight: 1.3 }}>{getTitle(selected)}</h3>
                  {!isChar(selected) && (selected as AnimeItem).title_english && (selected as AnimeItem).title !== (selected as AnimeItem).title_english && (
                    <p style={{ fontSize: 12, color: '#8888aa', marginBottom: 8 }}>{(selected as AnimeItem).title}</p>
                  )}
                  {isChar(selected) && (selected as CharacterItem).name_kanji && (
                    <p style={{ fontSize: 13, color: '#8888aa', marginBottom: 8 }}>{(selected as CharacterItem).name_kanji}</p>
                  )}

                  {/* Stats row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {getScore(selected) && <ScoreBadge score={getScore(selected)} />}
                    {(selected as AnimeItem).rank && <span style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Rank #{(selected as AnimeItem).rank}</span>}
                    {(selected as AnimeItem).popularity && <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#8888aa', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>Pop #{(selected as AnimeItem).popularity}</span>}
                    {isChar(selected) && (selected as CharacterItem).favorites && <span style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', color: '#ff6b9d', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>♥ {((selected as CharacterItem).favorites || 0).toLocaleString()} fav</span>}
                  </div>

                  {/* Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginBottom: 14 }}>
                    {isAnime(selected) && [
                      ['Type', selected.type],
                      ['Episodes', selected.episodes ? `${selected.episodes} eps` : '—'],
                      ['Status', selected.status],
                      ['Aired', selected.aired?.string],
                      ['Studios', selected.studios?.map(s => s.name).join(', ')],
                      ['Season', selected.season ? `${selected.season} ${selected.year}` : selected.year],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={String(k)}>
                        <span style={{ fontSize: 10, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
                        <p style={{ fontSize: 12, color: '#ccccdd', marginTop: 1 }}>{String(v)}</p>
                      </div>
                    ))}
                    {isManga(selected) && [
                      ['Chapters', (selected as MangaItem).chapters ? `${(selected as MangaItem).chapters} ch` : '—'],
                      ['Volumes', (selected as MangaItem).volumes ? `${(selected as MangaItem).volumes} vol` : '—'],
                      ['Status', (selected as MangaItem).status],
                      ['Published', (selected as MangaItem).published?.string],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={String(k)}>
                        <span style={{ fontSize: 10, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
                        <p style={{ fontSize: 12, color: '#ccccdd', marginTop: 1 }}>{String(v)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Genres */}
                  {!isChar(selected) && (selected as AnimeItem).genres && (selected as AnimeItem).genres!.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                      {(selected as AnimeItem).genres!.map(g => (
                        <span key={g.mal_id} style={{ background: 'rgba(155,93,229,0.12)', border: '1px solid rgba(155,93,229,0.25)', color: '#9b5de5', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{g.name}</span>
                      ))}
                    </div>
                  )}

                  {/* Character anime list */}
                  {isChar(selected) && (selected as CharacterItem).anime && (selected as CharacterItem).anime!.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 10, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Appears in</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {(selected as CharacterItem).anime!.slice(0, 5).map(a => (
                          <span key={a.mal_id} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>{a.title}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Synopsis */}
              {!isChar(selected) && (selected as AnimeItem).synopsis && (
                <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: 10, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Synopsis</p>
                  <p style={{ fontSize: 13, color: '#aaaacc', lineHeight: 1.7 }}>
                    {(selected as AnimeItem).synopsis!.length > 600
                      ? (selected as AnimeItem).synopsis!.slice(0, 600) + '…'
                      : (selected as AnimeItem).synopsis}
                  </p>
                </div>
              )}

              {isChar(selected) && (selected as CharacterItem).about && (
                <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: 10, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>About</p>
                  <p style={{ fontSize: 13, color: '#aaaacc', lineHeight: 1.7 }}>
                    {((selected as CharacterItem).about || '').slice(0, 600)}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <a href={`https://myanimelist.net/${isChar(selected) ? 'character' : isAnime(selected) ? 'anime' : 'manga'}/${(selected as AnimeItem).mal_id}`}
                target="_blank" rel="noreferrer"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                className="btn-primary">
                <ExternalLink size={13} /> View on MAL
              </a>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input::placeholder { color: #444466; }
      `}</style>
    </div>
  );
};

export default Jikan;
