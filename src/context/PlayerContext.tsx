import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Track, EchoExtension, EqualizerBand, EqualizerPreset, RepeatMode } from '../types/music';
import { INITIAL_TRACKS } from '../data/sampleTracks';
import { INITIAL_EXTENSIONS } from '../data/defaultExtensions';
import { createSynthesizedTrackBuffer, audioBufferToWavBlob } from '../utils/audioSynthesis';
import { localMusicScanner, ScanProgress, StoragePermissionState } from '../services/localMusicScanner';

export const EQ_PRESETS: EqualizerPreset[] = [
  { id: 'flat', name: 'Flat', gains: [0, 0, 0, 0, 0] },
  { id: 'bass-boost', name: 'Bass Punch', gains: [7, 4, 0, -1, -2] },
  { id: 'vocal', name: 'Vocal Clarity', gains: [-2, 1, 6, 3, 1] },
  { id: 'acoustic', name: 'Acoustic / Warm', gains: [4, 2, 0, 2, 5] },
  { id: 'treble', name: 'Hi-Res Sparkle', gains: [-3, -1, 1, 5, 8] },
  { id: 'electronic', name: 'Electronic / Club', gains: [6, 3, -1, 3, 5] },
];

export const INITIAL_BANDS: EqualizerBand[] = [
  { frequency: 60, label: '60 Hz', gain: 0 },
  { frequency: 250, label: '250 Hz', gain: 0 },
  { frequency: 1000, label: '1 kHz', gain: 0 },
  { frequency: 4000, label: '4 kHz', gain: 0 },
  { frequency: 16000, label: '16 kHz', gain: 0 },
];

interface PlayerContextType {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  queueIndex: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  bands: EqualizerBand[];
  activePreset: string;
  bassBoost: number;
  extensions: EchoExtension[];
  isDisclaimerAccepted: boolean;
  showDisclaimerModal: boolean;
  activeTab: 'library' | 'now-playing' | 'extensions' | 'equalizer' | 'kotlin' | 'settings' | 'youtube-music' | 'ai-studio';
  isPhoneFrame: boolean;
  themeColor: 'cyan' | 'violet' | 'emerald' | 'amber' | 'mono';
  
  // Local File Discovery & Permission Scanner
  isScanning: boolean;
  scanProgress: ScanProgress;
  storagePermission: StoragePermissionState;
  showScannerModal: boolean;
  setShowScannerModal: (show: boolean) => void;
  triggerStorageDiscovery: () => Promise<number>;
  scanDiscoveredFiles: (files: FileList | File[]) => Promise<number>;

  // Actions
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setBandGain: (frequency: number, gain: number) => void;
  applyPreset: (presetId: string) => void;
  setBassBoost: (val: number) => void;
  toggleExtension: (id: string) => void;
  addExtension: (ext: EchoExtension) => void;
  updateExtensionConfig: (id: string, config: Record<string, string>) => void;
  removeExtension: (id: string) => void;
  importLocalFiles: (files: FileList | File[]) => void;
  cacheYouTubeTrackOffline: (track: Track) => void;
  acceptDisclaimer: () => void;
  setShowDisclaimerModal: (show: boolean) => void;
  setActiveTab: (tab: 'library' | 'now-playing' | 'extensions' | 'equalizer' | 'kotlin' | 'settings' | 'youtube-music' | 'ai-studio') => void;
  setIsPhoneFrame: (val: boolean) => void;
  setThemeColor: (color: 'cyan' | 'violet' | 'emerald' | 'amber' | 'mono') => void;
  getAudioFrequencyData: () => Uint8Array | null;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>(() => {
    return INITIAL_TRACKS;
  });
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>(INITIAL_TRACKS);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [bands, setBands] = useState<EqualizerBand[]>(INITIAL_BANDS);
  const [activePreset, setActivePreset] = useState<string>('flat');
  const [bassBoost, setBassBoostState] = useState<number>(3);
  const [extensions, setExtensions] = useState<EchoExtension[]>(INITIAL_EXTENSIONS);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'library' | 'now-playing' | 'extensions' | 'equalizer' | 'kotlin' | 'settings' | 'youtube-music' | 'ai-studio'>('library');
  const [themeColor, setThemeColor] = useState<'cyan' | 'violet' | 'emerald' | 'amber' | 'mono'>('cyan');

  // Local File Discovery & Permission Scanner State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    status: 'idle',
    filesScanned: 0,
    audioFound: 0,
    currentFolder: '',
    currentFile: '',
    totalSizeBytes: 0,
  });
  const [storagePermission, setStoragePermission] = useState<StoragePermissionState>('prompt');
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);

  useEffect(() => {
    localMusicScanner.checkPermissionStatus().then(setStoragePermission);
  }, []);

  // Legal disclaimer state
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState<boolean>(() => {
    return localStorage.getItem('echo_disclaimer_accepted') === 'true';
  });
  const [showDisclaimerModal, setShowDisclaimerModal] = useState<boolean>(false);

  // Web Audio Graph References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodesRef = useRef<BiquadFilterNode[]>([]);
  const bassBoostNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const sampleBlobsCache = useRef<Map<string, string>>(new Map());

  // Setup HTML Audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      handleTrackEnded();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Initialize Web Audio Context graph
  const ensureAudioGraph = useCallback(() => {
    if (audioCtxRef.current || !audioRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      // Create 5 EQ bands
      const filters = INITIAL_BANDS.map((band) => {
        const filter = ctx.createBiquadFilter();
        if (band.frequency <= 60) {
          filter.type = 'lowshelf';
        } else if (band.frequency >= 16000) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = band.frequency;
        filter.gain.value = band.gain;
        return filter;
      });
      filterNodesRef.current = filters;

      // Bass boost filter (lowshelf at 80 Hz)
      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowshelf';
      bassFilter.frequency.value = 80;
      bassFilter.gain.value = bassBoost;
      bassBoostNodeRef.current = bassFilter;

      // Analyser for visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyserNodeRef.current = analyser;

      // Master Gain
      const gainNode = ctx.createGain();
      gainNode.gain.value = isMuted ? 0 : volume;
      gainNodeRef.current = gainNode;

      // Connect graph: source -> filter0 -> filter1 -> ... -> bassFilter -> analyser -> gainNode -> destination
      let lastNode: AudioNode = source;
      filters.forEach((f) => {
        lastNode.connect(f);
        lastNode = f;
      });
      lastNode.connect(bassFilter);
      bassFilter.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (err) {
      console.warn('AudioContext setup deferred or restricted:', err);
    }
  }, [bassBoost, isMuted, volume]);

  // Handle synthesized sample tracks or local track files
  const resolveTrackAudioUrl = useCallback(async (track: Track): Promise<string> => {
    if (track.url) return track.url;

    if (sampleBlobsCache.current.has(track.id)) {
      return sampleBlobsCache.current.get(track.id)!;
    }

    // Synthesize procedural offline audio for sample tracks
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const offlineCtx = new AudioCtx();
    const style = track.id.includes('lofi') ? 'lofi' : track.id.includes('synthwave') ? 'synthwave' : 'ambient';
    const buffer = createSynthesizedTrackBuffer(offlineCtx, style, track.duration || 45);
    const wavBlob = audioBufferToWavBlob(buffer);
    const blobUrl = URL.createObjectURL(wavBlob);
    sampleBlobsCache.current.set(track.id, blobUrl);
    offlineCtx.close();
    return blobUrl;
  }, []);

  const playTrack = useCallback(async (track: Track) => {
    ensureAudioGraph();
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    const audio = audioRef.current;
    if (!audio) return;

    try {
      const url = await resolveTrackAudioUrl(track);
      if (audio.src !== url) {
        audio.src = url;
      }
      audio.currentTime = 0;
      await audio.play();

      setCurrentTrack(track);
      setIsPlaying(true);

      // Keep queue in sync
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        setQueueIndex(idx);
      } else {
        setQueue(prev => [track, ...prev]);
        setQueueIndex(0);
      }
    } catch (err) {
      console.error('Failed to play track:', err);
    }
  }, [ensureAudioGraph, queue, resolveTrackAudioUrl]);

  const togglePlayPause = useCallback(async () => {
    ensureAudioGraph();
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack && queue.length > 0) {
      playTrack(queue[0]);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Playback resume failed:', err);
      }
    }
  }, [currentTrack, ensureAudioGraph, isPlaying, playTrack, queue]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(time, duration));
      setCurrentTime(audio.currentTime);
    }
  }, [duration]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentTrack) {
      seekTo(0);
      audioRef.current?.play();
      return;
    }

    let nextIndex = queueIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      setQueueIndex(nextIndex);
      playTrack(nextTrack);
    }
  }, [currentTrack, isShuffle, playTrack, queue, queueIndex, repeatMode, seekTo]);

  const playPrevious = useCallback(() => {
    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      setQueueIndex(prevIndex);
      playTrack(prevTrack);
    }
  }, [currentTime, playTrack, queue, queueIndex, seekTo]);

  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    } else {
      playNext();
    }
  }, [playNext, repeatMode]);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : clamped;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = next ? 0 : volume;
      }
      return next;
    });
  }, [volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    setQueue(prev => prev.filter(t => t.id !== trackId));
  }, []);

  const clearQueue = useCallback(() => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
  }, [currentTrack]);

  // Equalizer updates
  const setBandGain = useCallback((frequency: number, gain: number) => {
    setBands(prev =>
      prev.map(b => (b.frequency === frequency ? { ...b, gain } : b))
    );
    const filter = filterNodesRef.current.find(f => f.frequency.value === frequency);
    if (filter) {
      filter.gain.value = gain;
    }
    setActivePreset('custom');
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = EQ_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setActivePreset(presetId);
    setBands(prev =>
      prev.map((b, i) => {
        const newGain = preset.gains[i] ?? 0;
        const filter = filterNodesRef.current[i];
        if (filter) {
          filter.gain.value = newGain;
        }
        return { ...b, gain: newGain };
      })
    );
  }, []);

  const setBassBoost = useCallback((val: number) => {
    setBassBoostState(val);
    if (bassBoostNodeRef.current) {
      bassBoostNodeRef.current.gain.value = val;
    }
  }, []);

  // Extensions
  const toggleExtension = useCallback((id: string) => {
    setExtensions(prev =>
      prev.map(ext => (ext.id === id ? { ...ext, enabled: !ext.enabled } : ext))
    );
  }, []);

  const addExtension = useCallback((ext: EchoExtension) => {
    setExtensions(prev => [ext, ...prev]);
  }, []);

  const updateExtensionConfig = useCallback((id: string, config: Record<string, string>) => {
    setExtensions(prev =>
      prev.map(ext => (ext.id === id ? { ...ext, config: { ...ext.config, ...config } } : ext))
    );
  }, []);

  const removeExtension = useCallback((id: string) => {
    setExtensions(prev => prev.filter(ext => ext.id !== id));
  }, []);

  // Import local files directly from the user's Android phone / computer storage
  const importLocalFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newTracks: Track[] = fileArray
      .filter(file => file.type.startsWith('audio/') || /\.(mp3|flac|wav|ogg|m4a|aac)$/i.test(file.name))
      .map((file, index) => {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        const parts = cleanName.split(' - ');
        const artist = parts.length > 1 ? parts[0].trim() : 'Local Audio';
        const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : cleanName;
        const blobUrl = URL.createObjectURL(file);

        return {
          id: `local-${Date.now()}-${index}`,
          title,
          artist,
          album: 'Device Storage',
          duration: 180, // Default duration estimate until loaded
          url: blobUrl,
          coverArt: '/src/assets/images/echo_app_icon_1791348567719.jpg',
          source: 'local',
          format: file.type || 'Audio File',
          bitrate: '320 kbps (Direct)',
          sampleRate: '44,100 Hz',
          year: new Date().getFullYear(),
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          dateAdded: Date.now()
        };
      });

    if (newTracks.length > 0) {
      setTracks(prev => [...newTracks, ...prev]);
      setQueue(prev => [...newTracks, ...prev]);
      // Immediately play first uploaded track
      playTrack(newTracks[0]);
    }
  }, [playTrack]);

  const cacheYouTubeTrackOffline = useCallback((track: Track) => {
    const cachedTrack: Track = {
      ...track,
      id: `cached-${track.id.replace('cached-', '')}`,
      title: track.title,
      artist: track.artist,
      album: track.album.includes('Offline') ? track.album : `${track.album} (Offline Saved)`,
      source: 'local',
      format: 'Cached Opus 256kbps',
      dateAdded: Date.now(),
    };

    setTracks(prev => {
      if (prev.some(t => t.id === cachedTrack.id || (t.title === track.title && t.artist === track.artist && t.source === 'local'))) {
        return prev;
      }
      return [cachedTrack, ...prev];
    });
  }, []);

  const triggerStorageDiscovery = useCallback(async (): Promise<number> => {
    setIsScanning(true);
    setScanProgress({
      status: 'requesting_permission',
      filesScanned: 0,
      audioFound: 0,
      currentFolder: 'Device Storage',
      currentFile: 'Requesting permission...',
      totalSizeBytes: 0,
    });

    try {
      const discoveredTracks = await localMusicScanner.scanDirectoryWithFSA((progress) => {
        setScanProgress(progress);
      });

      setStoragePermission('granted');

      if (discoveredTracks.length > 0) {
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.title + t.artist));
          const fresh = discoveredTracks.filter(t => !existingIds.has(t.title + t.artist));
          return [...fresh, ...prev];
        });
        setQueue(prev => [...discoveredTracks, ...prev]);
        if (!currentTrack) {
          playTrack(discoveredTracks[0]);
        }
      }

      setIsScanning(false);
      return discoveredTracks.length;
    } catch (err: any) {
      setScanProgress(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err.message || 'Storage scanning failed'
      }));
      if (err.message?.includes('denied')) {
        setStoragePermission('denied');
      }
      setIsScanning(false);
      throw err;
    }
  }, [currentTrack, playTrack]);

  const scanDiscoveredFiles = useCallback(async (files: FileList | File[]): Promise<number> => {
    setIsScanning(true);
    try {
      const discoveredTracks = await localMusicScanner.scanFileList(files, (progress) => {
        setScanProgress(progress);
      });

      setStoragePermission('granted');

      if (discoveredTracks.length > 0) {
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.title + t.artist));
          const fresh = discoveredTracks.filter(t => !existingIds.has(t.title + t.artist));
          return [...fresh, ...prev];
        });
        setQueue(prev => [...discoveredTracks, ...prev]);
        if (!currentTrack) {
          playTrack(discoveredTracks[0]);
        }
      }

      setIsScanning(false);
      return discoveredTracks.length;
    } catch (err: any) {
      setScanProgress(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err.message || 'File list scanning failed'
      }));
      setIsScanning(false);
      throw err;
    }
  }, [currentTrack, playTrack]);

  const acceptDisclaimer = useCallback(() => {
    localStorage.setItem('echo_disclaimer_accepted', 'true');
    setIsDisclaimerAccepted(true);
    setShowDisclaimerModal(false);
  }, []);

  const getAudioFrequencyData = useCallback((): Uint8Array | null => {
    if (!analyserNodeRef.current || !isPlaying) return null;
    const bufferLength = analyserNodeRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNodeRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  }, [isPlaying]);

  return (
    <PlayerContext.Provider
      value={{
        tracks,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        queue,
        queueIndex,
        isShuffle,
        repeatMode,
        bands,
        activePreset,
        bassBoost,
        extensions,
        isDisclaimerAccepted,
        showDisclaimerModal,
        activeTab,
        isPhoneFrame,
        themeColor,

        // Scanner State & Actions
        isScanning,
        scanProgress,
        storagePermission,
        showScannerModal,
        setShowScannerModal,
        triggerStorageDiscovery,
        scanDiscoveredFiles,

        playTrack,
        togglePlayPause,
        seekTo,
        playNext,
        playPrevious,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeatMode,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setBandGain,
        applyPreset,
        setBassBoost,
        toggleExtension,
        addExtension,
        updateExtensionConfig,
        removeExtension,
        importLocalFiles,
        cacheYouTubeTrackOffline,
        acceptDisclaimer,
        setShowDisclaimerModal,
        setActiveTab,
        setIsPhoneFrame,
        setThemeColor,
        getAudioFrequencyData,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};
