import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Sliders,
  ListMusic,
  FileText,
  ChevronDown,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { AudioVisualizer } from './AudioVisualizer';

export const NowPlayingSheet: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    isShuffle,
    repeatMode,
    themeColor,
    togglePlayPause,
    seekTo,
    playNext,
    playPrevious,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    playTrack,
    removeFromQueue,
    setActiveTab
  } = usePlayer();

  const [activeTabMode, setActiveTabMode] = useState<'cover' | 'lyrics' | 'queue'>('cover');
  const [showMetadata, setShowMetadata] = useState<boolean>(false);

  if (!currentTrack) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <p className="text-sm">No track currently selected.</p>
        <button
          onClick={() => setActiveTab('library')}
          className="mt-4 px-4 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 rounded-xl hover:bg-cyan-300 transition-colors"
        >
          Browse Library
        </button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentLyricIndex = useMemo(() => {
    if (!currentTrack.lyrics || currentTrack.lyrics.length === 0) return -1;
    let index = -1;
    for (let i = 0; i < currentTrack.lyrics.length; i++) {
      if (currentTime >= currentTrack.lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [currentTrack.lyrics, currentTime]);

  const accentColor =
    themeColor === 'violet' ? 'text-purple-400' :
    themeColor === 'emerald' ? 'text-emerald-400' :
    themeColor === 'amber' ? 'text-amber-400' :
    themeColor === 'mono' ? 'text-slate-200' :
    'text-cyan-400';

  const accentBg =
    themeColor === 'violet' ? 'bg-purple-500' :
    themeColor === 'emerald' ? 'bg-emerald-500' :
    themeColor === 'amber' ? 'bg-amber-500' :
    themeColor === 'mono' ? 'bg-slate-300' :
    'bg-cyan-500';

  const accentRing =
    themeColor === 'violet' ? 'ring-purple-500/30 shadow-purple-500/20' :
    themeColor === 'emerald' ? 'ring-emerald-500/30 shadow-emerald-500/20' :
    themeColor === 'amber' ? 'ring-amber-500/30 shadow-amber-500/20' :
    themeColor === 'mono' ? 'ring-slate-400/30 shadow-slate-400/20' :
    'ring-cyan-500/30 shadow-cyan-500/20';

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 relative">
      {/* Top Bar inside player */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <button
          onClick={() => setActiveTab('library')}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-2xl hover:bg-slate-900 transition-colors"
          aria-label="Back to library"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTabMode('cover')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors ${
              activeTabMode === 'cover' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Artwork
          </button>
          <button
            onClick={() => setActiveTabMode('lyrics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-1 ${
              activeTabMode === 'lyrics' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Lyrics
          </button>
          <button
            onClick={() => setActiveTabMode('queue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-1 ${
              activeTabMode === 'queue' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            Queue ({queue.length})
          </button>
        </div>

        <button
          onClick={() => setShowMetadata(!showMetadata)}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-colors ${
            showMetadata ? 'text-cyan-400 bg-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          aria-label="Track audio details"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Main Center Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-2 max-w-md mx-auto w-full">
        {activeTabMode === 'cover' && (
          <div className="w-full flex flex-col items-center">
            {/* Album Cover Art */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 mb-6 group">
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Subtle ambient light */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Audio Spectrum Analyzer */}
            <div className="w-full max-w-xs px-2 mb-2">
              <AudioVisualizer barCount={32} height={40} />
            </div>
          </div>
        )}

        {activeTabMode === 'lyrics' && (
          <div className="w-full h-72 sm:h-80 overflow-y-auto px-4 py-3 bg-slate-900/60 rounded-3xl border border-slate-800/80 mb-4 space-y-4 text-center">
            {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
              currentTrack.lyrics.map((line, idx) => {
                const isActive = idx === currentLyricIndex;
                return (
                  <p
                    key={idx}
                    onClick={() => seekTo(line.time)}
                    className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-xl ${
                      isActive
                        ? `${accentColor} font-semibold text-base sm:text-lg scale-105 bg-slate-800/50`
                        : 'text-slate-400 text-sm hover:text-slate-200'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <p>No synced lyrics found for this track.</p>
                <p className="text-xs text-slate-600 mt-1">Enable Open Timed LRC Lyrics extension in Extensions tab</p>
              </div>
            )}
          </div>
        )}

        {activeTabMode === 'queue' && (
          <div className="w-full h-72 sm:h-80 overflow-y-auto bg-slate-900/60 rounded-3xl border border-slate-800/80 p-2 mb-4 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Playing Next</span>
              <span className="font-normal lowercase">{queue.length} items</span>
            </div>
            {queue.map((t, idx) => {
              const isCurrent = t.id === currentTrack.id;
              return (
                <div
                  key={`${t.id}-${idx}`}
                  onClick={() => playTrack(t)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-colors ${
                    isCurrent ? 'bg-slate-800/90 border border-slate-700/60' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={t.coverArt}
                      alt={t.title}
                      className="w-9 h-9 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${isCurrent ? 'text-cyan-400 font-semibold' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{t.artist}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-2">
                    {formatTime(t.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Track Title & Artist */}
        <div className="w-full text-center px-4 mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
            {currentTrack.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5">
            {currentTrack.artist} · <span className="text-slate-500">{currentTrack.album}</span>
          </p>
        </div>

        {/* Audio Quality Spec Bar */}
        {showMetadata && (
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-4 text-xs text-slate-300 animate-fade-in grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Format</span>
              <span className="font-mono text-white">{currentTrack.format || 'PCM WAV'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Bitrate</span>
              <span className="font-mono text-white">{currentTrack.bitrate || '1411 kbps'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Sample Rate</span>
              <span className="font-mono text-white">{currentTrack.sampleRate || '48,000 Hz'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Storage Source</span>
              <span className="font-mono text-cyan-400 capitalize">{currentTrack.source} ({currentTrack.fileSize || 'Offline'})</span>
            </div>
          </div>
        )}

        {/* Scrub Bar Slider */}
        <div className="w-full px-2 mb-2">
          <div className="relative flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:h-2 transition-all"
              aria-label="Seek track position"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1.5 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="w-full flex items-center justify-between px-4 mt-2">
          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-colors ${
              isShuffle ? `${accentColor} bg-slate-900` : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Toggle shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous Button */}
          <button
            onClick={playPrevious}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-300 hover:text-white rounded-2xl hover:bg-slate-900 active:scale-95 transition-all"
            aria-label="Previous track"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          {/* Large Play / Pause button */}
          <button
            onClick={togglePlayPause}
            className={`w-16 h-16 rounded-3xl ${accentBg} text-slate-950 flex items-center justify-center shadow-xl ${accentRing} hover:scale-105 active:scale-95 transition-all`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={playNext}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-300 hover:text-white rounded-2xl hover:bg-slate-900 active:scale-95 transition-all"
            aria-label="Next track"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          {/* Repeat Mode Button */}
          <button
            onClick={cycleRepeatMode}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-colors ${
              repeatMode !== 'off' ? `${accentColor} bg-slate-900` : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Cycle repeat mode"
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Bottom Actions Bar (Volume & Equalizer shortcut) */}
        <div className="w-full flex items-center justify-between gap-4 px-4 mt-6 pt-4 border-t border-slate-900">
          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white"
              aria-label="Toggle mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              aria-label="Adjust volume"
            />
          </div>

          <button
            onClick={() => setActiveTab('equalizer')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>EQ Preset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
