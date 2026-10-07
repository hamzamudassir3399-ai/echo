import React, { useState, useRef } from 'react';
import {
  FolderUp,
  Search,
  Play,
  Shuffle,
  Music2,
  Disc,
  Folder,
  Plus,
  MoreVertical,
  Clock,
  Sparkles,
  HardDrive,
  Youtube,
  FolderSearch,
  ShieldCheck
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Track } from '../types/music';

export const LibraryView: React.FC = () => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    addToQueue,
    importLocalFiles,
    themeColor,
    setActiveTab,
    setShowScannerModal,
    isScanning,
    storagePermission
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [subTab, setSubTab] = useState<'songs' | 'albums' | 'folders'>('songs');
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredTracks = tracks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q)
    );
  });

  // Group by Album
  const albums = React.useMemo(() => {
    const map = new Map<string, { album: string; artist: string; coverArt: string; count: number; tracks: Track[] }>();
    tracks.forEach((t) => {
      const existing = map.get(t.album);
      if (existing) {
        existing.count++;
        existing.tracks.push(t);
      } else {
        map.set(t.album, {
          album: t.album,
          artist: t.artist,
          coverArt: t.coverArt,
          count: 1,
          tracks: [t]
        });
      }
    });
    return Array.from(map.values());
  }, [tracks]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importLocalFiles(e.target.files);
    }
  };

  const handleShuffleAll = () => {
    if (filteredTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredTracks.length);
      playTrack(filteredTracks[randomIndex]);
    }
  };

  const accentText =
    themeColor === 'violet' ? 'text-purple-400' :
    themeColor === 'emerald' ? 'text-emerald-400' :
    themeColor === 'amber' ? 'text-amber-400' :
    themeColor === 'mono' ? 'text-slate-200' :
    'text-cyan-400';

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto px-4 sm:px-6 py-4">
      {/* Top Search & Import Header */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search offline tracks, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Scan Storage Button (Discovery Service) */}
          <button
            onClick={() => setShowScannerModal(true)}
            className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 active:scale-95 text-cyan-400 font-semibold rounded-2xl text-xs transition-all whitespace-nowrap shrink-0"
            title="Scan device storage for audio files (SAF)"
          >
            <FolderSearch className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Device</span>
          </button>

          {/* Import Local Files Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="audio/*,.mp3,.flac,.wav,.ogg,.m4a,.aac"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-semibold rounded-2xl text-xs transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap shrink-0"
            title="Import audio files from device storage"
          >
            <FolderUp className="w-4 h-4" />
            <span className="hidden sm:inline">Add Files</span>
          </button>
        </div>

        {/* Sub-tabs: Songs, Albums, Folders */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl">
            <button
              onClick={() => setSubTab('songs')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                subTab === 'songs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tracks ({tracks.length})
            </button>
            <button
              onClick={() => setSubTab('albums')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                subTab === 'albums' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Albums ({albums.length})
            </button>
            <button
              onClick={() => setSubTab('folders')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                subTab === 'folders' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Folders
            </button>
          </div>

          {subTab === 'songs' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('youtube-music')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Explore and stream from YouTube Music"
              >
                <Youtube className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">YT Music</span>
              </button>
              <button
                onClick={handleShuffleAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                title="Shuffle all tracks"
              >
                <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Shuffle</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Rendering */}
      {subTab === 'songs' && (
        <div className="flex-1 space-y-1">
          {filteredTracks.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Music2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No audio tracks found</p>
              <p className="text-xs text-slate-600 mt-1">Tap "Add Files" above to import audio from your device</p>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isSelected = currentTrack?.id === track.id;
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
                  className={`group relative flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/80 border border-slate-700/60'
                      : 'hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Album Art with Hover Play Overlay */}
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-800">
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
                          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 animate-pulse" />
                        ) : (
                          <Play className="w-4 h-4 text-white fill-current" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isSelected ? accentText : 'text-slate-100'
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
                        <span className="text-[10px] text-slate-500 uppercase font-mono hidden sm:inline">
                          {track.format?.split(' ')[0] || 'AUDIO'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Track Duration & Menu */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDuration(track.duration)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
                      title="Add to queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {subTab === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {albums.map((item, idx) => (
            <div
              key={idx}
              onClick={() => playTrack(item.tracks[0])}
              className="group p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-2xl cursor-pointer transition-all"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 mb-2.5">
                <img
                  src={item.coverArt}
                  alt={item.album}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-8 h-8 text-white fill-current" />
                </div>
              </div>
              <h4 className="text-xs font-semibold text-white truncate">{item.album}</h4>
              <p className="text-[11px] text-slate-400 truncate">{item.artist}</p>
              <span className="text-[10px] text-slate-500 block mt-1">{item.count} tracks</span>
            </div>
          ))}
        </div>
      )}

      {subTab === 'folders' && (
        <div className="space-y-2.5">
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs font-semibold text-white">Device / Music</p>
                <p className="text-[11px] text-slate-400">
                  Storage Access Framework · {tracks.filter(t => t.source === 'local').length} local tracks indexed
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowScannerModal(true)}
              className="text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 font-semibold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
            >
              Scan Directory
            </button>
          </div>

          <div className="p-4 bg-slate-900/40 border border-slate-800/40 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Folder className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Storage Permissions</p>
                <p className="text-[11px] text-slate-400">
                  Status: <span className="font-mono text-cyan-400 capitalize">{storagePermission}</span> (Android READ_MEDIA_AUDIO)
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowScannerModal(true)}
              className="text-xs text-slate-400 hover:text-white border border-slate-700/60 font-medium px-3 py-1.5 rounded-xl transition-colors"
            >
              Permissions Rationale
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
