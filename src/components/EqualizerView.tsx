import React from 'react';
import { Sliders, RotateCcw, Zap, Volume2 } from 'lucide-react';
import { usePlayer, EQ_PRESETS } from '../context/PlayerContext';

export const EqualizerView: React.FC = () => {
  const {
    bands,
    setBandGain,
    activePreset,
    applyPreset,
    bassBoost,
    setBassBoost,
    themeColor
  } = usePlayer();

  const accentColor =
    themeColor === 'violet' ? 'text-purple-400' :
    themeColor === 'emerald' ? 'text-emerald-400' :
    themeColor === 'amber' ? 'text-amber-400' :
    themeColor === 'mono' ? 'text-slate-200' :
    'text-cyan-400';

  // Calculate an SVG curve representing the EQ shape
  const points = bands.map((band, idx) => {
    const x = (idx / (bands.length - 1)) * 320 + 20;
    // Map -12dB..+12dB to y: 110..10 (middle is 60)
    const y = 60 - (band.gain / 12) * 45;
    return `${x},${y}`;
  });

  const pathD = `M 20,${60 - (bands[0].gain / 12) * 45} ` + points.map(p => `L ${p}`).join(' ');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto px-4 sm:px-6 py-4">
      {/* Title Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Equalizer & DSP</h2>
            <p className="text-xs text-slate-400">Hardware biquad audio filter chain</p>
          </div>
        </div>

        <button
          onClick={() => applyPreset('flat')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors"
          title="Reset to flat response"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Frequency Response Visual Curve */}
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-5 relative overflow-hidden">
        <div className="h-28 w-full flex items-center justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 360 120" preserveAspectRatio="none">
            {/* 0dB centerline */}
            <line x1="10" y1="60" x2="350" y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
            <text x="14" y="56" fill="#64748b" fontSize="9" fontFamily="monospace">0 dB</text>
            <text x="14" y="22" fill="#64748b" fontSize="9" fontFamily="monospace">+12 dB</text>
            <text x="14" y="105" fill="#64748b" fontSize="9" fontFamily="monospace">-12 dB</text>

            {/* Response line */}
            <path
              d={pathD}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Control points */}
            {bands.map((band, idx) => {
              const x = (idx / (bands.length - 1)) * 320 + 20;
              const y = 60 - (band.gain / 12) * 45;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#06b6d4"
                  className="shadow-sm"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Sound Profiles</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EQ_PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all text-left flex items-center justify-between border ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : 'bg-slate-900/50 text-slate-300 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <span>{preset.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5-Band Vertical Slider Racks */}
      <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-6 mb-5">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end justify-items-center">
          {bands.map((band) => (
            <div key={band.frequency} className="flex flex-col items-center gap-3 w-full max-w-[50px]">
              {/* Gain Indicator */}
              <span className="text-[11px] font-mono text-cyan-400 tabular-nums">
                {band.gain > 0 ? `+${band.gain}` : band.gain}
              </span>

              {/* Slider */}
              <div className="h-44 sm:h-48 flex items-center justify-center relative py-2">
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={0.5}
                  value={band.gain}
                  onChange={(e) => setBandGain(band.frequency, parseFloat(e.target.value))}
                  className="h-36 sm:h-40 w-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 rotate-[-90deg]"
                  aria-label={`Gain for ${band.label}`}
                />
              </div>

              {/* Band Label */}
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                {band.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bass Boost & Dynamic Enhancer */}
      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-white">Dynamic Sub-Bass Boost</h4>
            <p className="text-[11px] text-slate-400">80Hz lowshelf harmonic saturation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={bassBoost}
            onChange={(e) => setBassBoost(parseFloat(e.target.value))}
            className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            aria-label="Bass boost gain"
          />
          <span className="text-xs font-mono text-amber-400 w-10 text-right tabular-nums">
            +{bassBoost}dB
          </span>
        </div>
      </div>
    </div>
  );
};
