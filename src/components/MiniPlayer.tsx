import React from 'react';
import { Play, Pause, SkipForward, Disc3, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    setActiveTab,
    themeColor
  } = usePlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const accentBg =
    themeColor === 'violet' ? 'bg-purple-500' :
    themeColor === 'emerald' ? 'bg-emerald-500' :
    themeColor === 'amber' ? 'bg-amber-500' :
    themeColor === 'mono' ? 'bg-slate-300' :
    'bg-cyan-500';

  return (
    <div className="relative w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl transition-all">
      {/* Top Hairline Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800/80 overflow-hidden">
        <div
          className={`h-full ${accentBg} transition-all duration-200`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="px-3 py-2.5 flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Track Info (Click to open full player) */}
        <div
          onClick={() => setActiveTab('now-playing')}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Open Now Playing"
        >
          {/* Cover Art */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 shadow-sm">
            <img
              src={currentTrack.coverArt}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : ''}`}
              referrerPolicy="no-referrer"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Disc3 className="w-5 h-5 text-white/90 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
              {currentTrack.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
              <span className="truncate">{currentTrack.artist}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[10px] text-slate-500 uppercase font-mono">{currentTrack.format?.split(' ')[0] || 'AUDIO'}</span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl ${accentBg} text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 active:scale-95 transition-all"
            aria-label="Next track"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
