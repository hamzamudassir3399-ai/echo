import React from 'react';
import { Smartphone, Monitor, Shield, Code, Sliders, Puzzle, Wand2, LogIn, LogOut, User } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const {
    isPhoneFrame,
    setIsPhoneFrame,
    activeTab,
    setActiveTab,
    setShowDisclaimerModal,
    themeColor,
    setThemeColor
  } = usePlayer();

  const { user, signInWithGoogle, signOutUser } = useAuth();

  const themes = [
    { id: 'cyan', label: 'Cyan', color: 'bg-cyan-500' },
    { id: 'violet', label: 'Violet', color: 'bg-purple-500' },
    { id: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
    { id: 'amber', label: 'Amber', color: 'bg-amber-500' },
  ] as const;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-3 shrink-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400 font-bold text-sm">
              E
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Echo
              <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">Offline Audio & Plugin Engine</span>
            </h1>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'library'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('youtube-music')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'youtube-music'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            YouTube Music
          </button>
          <button
            onClick={() => setActiveTab('ai-studio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai-studio'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Music</span>
          </button>
          <button
            onClick={() => setActiveTab('extensions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'extensions'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            Extensions
          </button>
          <button
            onClick={() => setActiveTab('equalizer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'equalizer'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Equalizer
          </button>
          <button
            onClick={() => setActiveTab('kotlin')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'kotlin'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Kotlin Architecture
          </button>
        </nav>

        {/* Zone 3: Actions (Theme, View mode, Disclaimer) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Material You Dynamic Colors */}
          <div className="flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800/60">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeColor(t.id)}
                title={`Theme: ${t.label}`}
                className={`w-5 h-5 rounded-full ${t.color} transition-transform ${
                  themeColor === t.id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                aria-label={`Select ${t.label} theme`}
              />
            ))}
          </div>

          {/* Toggle Device Frame View (Pixel 9 Pro vs Adaptive Desktop) */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
            title={isPhoneFrame ? 'Switch to Fullscreen layout' : 'Switch to Android Pixel frame'}
          >
            {isPhoneFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Desktop View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Pixel 9 Frame</span>
              </>
            )}
          </button>

          {/* Google Sign In / Profile Action */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 rounded-full" />
              ) : (
                <User className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="text-xs text-white max-w-[80px] truncate hidden sm:inline">
                {user.displayName || 'User'}
              </span>
              <button
                onClick={signOutUser}
                className="p-1 text-slate-400 hover:text-white"
                title="Sign out of Firebase"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-950 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
              title="Sign in with Google to sync Firestore library"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-900" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Legal Disclaimer Trigger */}
          <button
            onClick={() => setShowDisclaimerModal(true)}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
            title="Legal & Anti-Piracy Disclaimer"
            aria-label="View legal disclaimer"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
