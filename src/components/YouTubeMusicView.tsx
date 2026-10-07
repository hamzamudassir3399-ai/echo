import React, { useState, useMemo } from 'react';
import {
  Search,
  Play,
  Plus,
  Download,
  Check,
  Youtube,
  Radio,
  Flame,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  Music2
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { YOUTUBE_MUSIC_INITIAL_CATALOG, YouTubeMusicTrack } from '../data/youtubeMusicCatalog';
import { Track } from '../types/music';

export const YouTubeMusicView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    addToQueue,
    cacheYouTubeTrackOffline,
    tracks,
    themeColor,
    setActiveTab
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [cachedIds, setCachedIds] = useState<Set<string>>(() => {
    // Check which YouTube tracks are already in local tracks
    const ids = new Set<string>();
    tracks.forEach((t) => {
      if (t.id.includes('ytm-') || t.extensionId === 'ext-youtube-music') {
        ids.add(t.id.replace('cached-', ''));
      }
    });
    return ids;
  });

  const [activeCategory, setActiveCategory] = useState<'all' | 'trending' | 'synthwave' | 'chill'>('all');

  const filteredCatalog = useMemo(() => {
    let list = YOUTUBE_MUSIC_INITIAL_CATALOG;
    if (activeCategory === 'synthwave') {
      list = list.filter((t) => t.artist === 'HOME' || t.title === 'Blinding Lights' || t.title === 'After Hours');
    } else if (activeCategory === 'chill') {
      list = list.filter((t) => t.title.includes('Weather') || t.title.includes('Resonance') || t.artist.includes('LAROI'));
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    const matches = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );

    // If query isn't in mock catalog, dynamically generate matching YouTube Music result
    if (matches.length === 0) {
      return [
        {
          id: `ytm-dyn-${Date.now()}`,
          youtubeVideoId: 'dyn_sample',
          title: searchQuery.split(' - ')[1] || searchQuery,
          artist: searchQuery.split(' - ')[0] || 'YouTube Music Artist',
          album: 'YouTube Music Search',
          duration: 210,
          coverArt: '/src/assets/images/cover_neon_midnight_1791348582757.jpg',
          source: 'extension' as const,
          extensionId: 'ext-youtube-music',
          format: 'Opus 256kbps (YouTube Music Stream)',
          bitrate: '256 kbps',
          sampleRate: '48,000 Hz',
          year: 2026,
          viewCount: '1.4M views',
          dateAdded: Date.now(),
        }
      ];
    }
    return matches;
  }, [activeCategory, searchQuery]);

  const handleCacheOffline = (track: YouTubeMusicTrack) => {
    cacheYouTubeTrackOffline(track);
    setCachedIds((prev) => new Set([...prev, track.id]));
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const accentText =
    themeColor === 'violet' ? 'text-purple-400' :
    themeColor === 'emerald' ? 'text-emerald-400' :
    themeColor === 'amber' ? 'text-amber-400' :
    themeColor === 'mono' ? 'text-slate-200' :
    'text-red-400';

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto px-4 sm:px-6 py-4">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-red-950/40 to-slate-900/60 border border-red-900/30 rounded-2xl mb-4 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Youtube className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">YouTube Music Plugin</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  Extension v2.1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Stream 256kbps Opus audio or cache directly to local storage for offline playback.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('kotlin')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl bg-slate-900/80 border border-slate-800 transition-colors shrink-0"
          >
            <span>Kotlin SPI</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search YouTube Music for songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeCategory === 'all' && !searchQuery ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => { setActiveCategory('synthwave'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeCategory === 'synthwave' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Synthwave & Electronic
          </button>
          <button
            onClick={() => { setActiveCategory('chill'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeCategory === 'chill' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Chill & Acoustic
          </button>
          <button
            onClick={() => setSearchQuery('The Weeknd')}
            className="px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap bg-slate-900/60 text-slate-400 hover:text-white"
          >
            The Weeknd
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 space-y-1.5">
        <div className="px-1 py-1 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            {searchQuery ? `Search Results (${filteredCatalog.length})` : 'Popular on YouTube Music'}
          </span>
          <span className="font-mono text-[10px]">256kbps Opus Stream</span>
        </div>

        {filteredCatalog.map((track) => {
          const isSelected = currentTrack?.id === track.id || currentTrack?.title === track.title;
          const isCached = cachedIds.has(track.id);

          return (
            <div
              key={track.id}
              onClick={() => {
                if (isSelected) {
                  togglePlayPause();
                } else {
                  playTrack(track);
                }
              }}
              className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border border-slate-700/60'
                  : 'hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Thumbnail with YouTube Red Play */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-800">
                  <img
                    src={track.coverArt}
                    alt={track.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isSelected && isPlaying ? (
                      <div className="w-3 h-3 rounded-sm bg-red-500 animate-pulse" />
                    ) : (
                      <Play className="w-4 h-4 text-white fill-current" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      isSelected ? 'text-red-400' : 'text-slate-100'
                    }`}
                  >
                    {track.title}
                  </h3>
                  {/* Clean Unboxed Metadata */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mt-0.5">
                    <span className="truncate">{track.artist}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate text-slate-500">{track.album}</span>
                    <span aria-hidden="true" className="hidden sm:inline">·</span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">{track.viewCount}</span>
                  </div>
                </div>
              </div>

              {/* Actions: Duration, Add to Queue, Cache Offline */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline mr-1">
                  {formatDuration(track.duration)}
                </span>

                {/* Cache to Offline Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCacheOffline(track);
                  }}
                  className={`p-2 rounded-xl text-xs transition-all flex items-center gap-1 ${
                    isCached
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={isCached ? 'Cached in Offline Storage' : 'Cache for Offline Listening'}
                  aria-label={isCached ? 'Cached' : 'Cache track offline'}
                >
                  {isCached ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden md:inline text-[10px]">Cached</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden md:inline text-[10px]">Save Offline</span>
                    </>
                  )}
                </button>

                {/* Add to Queue */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(track);
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  title="Add to queue"
                  aria-label="Add to queue"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Notice on YouTube Music Extension Architecture */}
      <div className="mt-6 p-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
        <p>
          <strong className="text-slate-400">Notice:</strong> YouTube Music integration in Echo operates via the open Extension SPI contract. Audio is streamed through standard open audio extractors and can be cached locally into device storage for offline playback. YouTube is a trademark of Google LLC; Echo is an independent open player.
        </p>
      </div>
    </div>
  );
};
