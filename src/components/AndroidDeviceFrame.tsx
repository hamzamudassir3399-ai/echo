import React, { useState, useEffect } from 'react';
import {
  Wifi,
  BatteryCharging,
  Music2,
  Puzzle,
  Sliders,
  Code2,
  Youtube,
  Wand2,
  Disc3,
  Search,
  FolderOpen
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { LibraryView } from './LibraryView';
import { NowPlayingSheet } from './NowPlayingSheet';
import { ExtensionManager } from './ExtensionManager';
import { EqualizerView } from './EqualizerView';
import { KotlinCodeExplorer } from './KotlinCodeExplorer';
import { YouTubeMusicView } from './YouTubeMusicView';
import { AiMusicStudioView } from './AiMusicStudioView';
import { MiniPlayer } from './MiniPlayer';

export const AndroidDeviceFrame: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isPhoneFrame,
    currentTrack,
    themeColor
  } = usePlayer();

  const [currentTimeStr, setCurrentTimeStr] = useState('10:48');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setCurrentTimeStr(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const accentPill =
    themeColor === 'violet' ? 'bg-purple-500/20 text-purple-300' :
    themeColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' :
    themeColor === 'amber' ? 'bg-amber-500/20 text-amber-300' :
    themeColor === 'mono' ? 'bg-slate-700 text-white' :
    'bg-cyan-500/20 text-cyan-300';

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'library':
        return <LibraryView />;
      case 'youtube-music':
        return <YouTubeMusicView />;
      case 'ai-studio':
        return <AiMusicStudioView />;
      case 'now-playing':
        return <NowPlayingSheet />;
      case 'extensions':
        return <ExtensionManager />;
      case 'equalizer':
        return <EqualizerView />;
      case 'kotlin':
        return <KotlinCodeExplorer />;
      default:
        return <LibraryView />;
    }
  };

  // If in Phone Frame Mode
  if (isPhoneFrame) {
    return (
      <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-slate-950/90">
        {/* Pixel 9 Pro Device Frame Container */}
        <div className="relative w-full max-w-[420px] h-[820px] max-h-[92vh] bg-slate-950 rounded-[44px] border-[7px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden ring-1 ring-slate-700/50">
          
          {/* Android Status Bar with Camera Punch-Hole */}
          <div className="h-10 bg-slate-950 px-6 flex items-center justify-between text-xs text-slate-300 shrink-0 select-none z-30">
            {/* Clock */}
            <span className="font-semibold text-[13px] tracking-tight">{currentTimeStr}</span>

            {/* Front Camera Hole Punch */}
            <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            {/* Android System Icons */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-[10px] font-mono tracking-tighter font-bold">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <BatteryCharging className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          {/* Active Screen View */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {renderActiveScreen()}
          </div>

          {/* Bottom Mini Player (shows if not already inside NowPlayingSheet) */}
          {activeTab !== 'now-playing' && currentTrack && (
            <div className="shrink-0 z-20">
              <MiniPlayer />
            </div>
          )}

          {/* Android Material 3 Navigation Bar (5 tabs) */}
          {activeTab !== 'now-playing' && (
            <div className="h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-900/80 px-2 grid grid-cols-5 items-center shrink-0 z-20">
              <button
                onClick={() => setActiveTab('library')}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'library' ? accentPill + ' rounded-2xl py-1' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Music Library"
              >
                <Music2 className="w-4 h-4" />
                <span className="text-[9px] font-medium">Library</span>
              </button>

              <button
                onClick={() => setActiveTab('youtube-music')}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'youtube-music' ? 'bg-red-500/20 text-red-300 rounded-2xl py-1' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="YouTube Music Source"
              >
                <Youtube className="w-4 h-4 text-red-500" />
                <span className="text-[9px] font-medium">YT Music</span>
              </button>

              <button
                onClick={() => setActiveTab('ai-studio')}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'ai-studio' ? 'bg-cyan-500/20 text-cyan-300 rounded-2xl py-1' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Lyria AI Music Studio"
              >
                <Wand2 className="w-4 h-4 text-cyan-400" />
                <span className="text-[9px] font-medium">AI Music</span>
              </button>

              <button
                onClick={() => setActiveTab('extensions')}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'extensions' ? accentPill + ' rounded-2xl py-1' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Extension Manager"
              >
                <Puzzle className="w-4 h-4" />
                <span className="text-[9px] font-medium">Plugins</span>
              </button>

              <button
                onClick={() => setActiveTab('equalizer')}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'equalizer' ? accentPill + ' rounded-2xl py-1' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Audio Equalizer"
              >
                <Sliders className="w-4 h-4" />
                <span className="text-[9px] font-medium">Equalizer</span>
              </button>
            </div>
          )}

          {/* Android Navigation Gesture Bar */}
          <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0 select-none">
            <div className="w-28 h-1 bg-slate-600/60 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Full-width Responsive Tablet & Desktop Mode
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-hidden relative">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {renderActiveScreen()}
      </div>

      {activeTab !== 'now-playing' && currentTrack && (
        <div className="shrink-0 z-20">
          <MiniPlayer />
        </div>
      )}
    </div>
  );
};
