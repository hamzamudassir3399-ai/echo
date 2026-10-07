import React, { useRef, useState } from 'react';
import {
  FolderSearch,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
  Disc3,
  FolderOpen,
  Music2,
  FileAudio,
  Check,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const StorageDiscoveryModal: React.FC = () => {
  const {
    showScannerModal,
    setShowScannerModal,
    storagePermission,
    isScanning,
    scanProgress,
    triggerStorageDiscovery,
    scanDiscoveredFiles,
    tracks,
    themeColor
  } = usePlayer();

  const [discoveredCount, setDiscoveredCount] = useState<number | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!showScannerModal) return null;

  const handleStartDirectoryScan = async () => {
    setDiscoveredCount(null);
    try {
      const count = await triggerStorageDiscovery();
      setDiscoveredCount(count);
    } catch (err: any) {
      console.warn('Storage discovery aborted or failed:', err);
    }
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDiscoveredCount(null);
      const count = await scanDiscoveredFiles(e.target.files);
      setDiscoveredCount(count);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setShowScannerModal(false)}
          disabled={isScanning}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors disabled:opacity-40"
          aria-label="Close scanner dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Android Storage icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <FolderSearch className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Local Audio Discovery
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                SAF · MediaStore
              </span>
            </h3>
            <p className="text-xs text-slate-400">Scan device storage & populate offline library</p>
          </div>
        </div>

        {/* Permissions Rationale Card */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Permission Rationale</span>
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                storagePermission === 'granted'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : storagePermission === 'denied'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {storagePermission === 'granted' ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Access Granted</span>
                </>
              ) : storagePermission === 'denied' ? (
                <>
                  <ShieldAlert className="w-3 h-3" />
                  <span>Permission Denied</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3" />
                  <span>Prompt on Demand</span>
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            In accordance with Android 14/15 permission best practices, Echo asks for storage access only when you scan. Audio files remain 100% private on your device.
          </p>
        </div>

        {/* Active Scanning Status View */}
        {isScanning ? (
          <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-2">
                <Disc3 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Scanning Device Storage...</span>
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {scanProgress.audioFound} tracks found
              </span>
            </div>

            {/* Progress indicators */}
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span className="truncate max-w-[280px]">Folder: {scanProgress.currentFolder || 'Root'}</span>
                <span>Scanned: {scanProgress.filesScanned}</span>
              </div>
              {scanProgress.currentFile && (
                <p className="text-[11px] text-cyan-400 truncate font-mono">
                  Current: {scanProgress.currentFile}
                </p>
              )}
            </div>

            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        ) : discoveredCount !== null ? (
          /* Discovered Result Notification */
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs text-slate-200">
              <p className="font-semibold text-emerald-300 text-sm">Scan Completed</p>
              <p className="text-slate-300 mt-0.5">
                Indexed <strong className="text-white">{discoveredCount}</strong> audio tracks from your device into Echo Library. Total library: {tracks.length} tracks.
              </p>
            </div>
          </div>
        ) : null}

        {/* Scan Actions */}
        <div className="space-y-2.5">
          {/* Primary Action: Storage Access Framework / FSA Directory Picker */}
          <button
            onClick={handleStartDirectoryScan}
            disabled={isScanning}
            className="w-full p-3.5 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-slate-950 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-between shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-4 h-4" />
              <span>Select Music Folder (Storage Access Framework)</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Action: Fallback HTML5 Directory Upload */}
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderUpload}
            // @ts-ignore
            webkitdirectory="true"
            directory="true"
            multiple
            className="hidden"
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFolderUpload}
            multiple
            accept="audio/*,.mp3,.flac,.wav,.ogg,.m4a,.aac"
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => folderInputRef.current?.click()}
              disabled={isScanning}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload Folder Tree</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <FileAudio className="w-3.5 h-3.5 text-purple-400" />
              <span>Select Audio Files</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
          <span>Supported: MP3, FLAC, WAV, OGG, M4A, AAC, OPUS</span>
          <button
            onClick={() => setShowScannerModal(false)}
            className="text-slate-400 hover:text-white font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
