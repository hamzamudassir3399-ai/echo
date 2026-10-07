import React from 'react';
import { ShieldCheck, HardDrive, AlertTriangle, Layers, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const LegalDisclaimerModal: React.FC = () => {
  const { isDisclaimerAccepted, acceptDisclaimer, showDisclaimerModal, setShowDisclaimerModal } = usePlayer();

  if (isDisclaimerAccepted && !showDisclaimerModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-200">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {isDisclaimerAccepted && (
          <button
            onClick={() => setShowDisclaimerModal(false)}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Close disclaimer modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Echo Legal & Usage Notice</h2>
            <p className="text-xs text-slate-400">Open-source extension architecture & compliance</p>
          </div>
        </div>

        <div className="space-y-3.5 my-5 text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex gap-3">
            <HardDrive className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-xs mb-1">Local Files by Default</p>
              <p className="text-xs text-slate-300">
                Echo is built strictly as an offline audio player for playback of local audio files stored on your own device.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex gap-3">
            <Layers className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-xs mb-1">Extension-Based Architecture</p>
              <p className="text-xs text-slate-300">
                Echo does not host, curate, license, or distribute any audio or video content. The core application provides only an open plugin interface (SPI) allowing users to connect their own self-hosted servers (Subsonic, WebDAV, NAS) or community add-ons.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300 text-xs mb-1">Anti-Piracy & Non-Affiliation Statement</p>
              <p className="text-xs text-slate-300">
                Echo explicitly does not condone copyright infringement or digital piracy. Echo is completely independent and is not affiliated, endorsed, or associated with any commercial streaming services, record labels, or content providers. Users assume sole responsibility for any 3rd-party plugins they install or media they access.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={acceptDisclaimer}
            className="w-full py-3 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 text-center"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
