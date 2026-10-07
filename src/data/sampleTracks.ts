import { Track } from '../types/music';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'sample-lofi-1',
    title: 'Rainy Night In Shibuya',
    artist: 'Echo Offline Collective',
    album: 'Midnight Resonance Vol. 1',
    duration: 45,
    coverArt: '/src/assets/images/cover_neon_midnight_1791348582757.jpg',
    source: 'sample',
    format: 'WAV 24-bit PCM',
    bitrate: '1411 kbps (Lossless)',
    sampleRate: '48,000 Hz',
    year: 2026,
    fileSize: '7.8 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 2,
    lyrics: [
      { time: 0, text: '• Ambient rain patters softly against the neon windowpane •' },
      { time: 6, text: 'Wandering through empty midnight pedestrian crossings' },
      { time: 13, text: 'Reflections shimmering in violet and cyan puddles' },
      { time: 20, text: 'The rhythmic pulse of distant electric transit' },
      { time: 28, text: 'Calm thoughts settling into quiet frequency resonance' },
      { time: 36, text: 'Echoes fading into the twilight dawn...' }
    ]
  },
  {
    id: 'sample-synthwave-2',
    title: 'Solar Wind Velocity',
    artist: 'Chrono Drift',
    album: 'Analog Horizons',
    duration: 45,
    coverArt: '/src/assets/images/cover_ambient_dawn_1791348598021.jpg',
    source: 'sample',
    format: 'FLAC Audio',
    bitrate: '980 kbps',
    sampleRate: '44,100 Hz',
    year: 2025,
    fileSize: '5.4 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 5,
    lyrics: [
      { time: 0, text: '• Golden light rising over misty alpine ridges •' },
      { time: 8, text: 'Breathe in the crystal morning air' },
      { time: 16, text: 'Warm harmonics drifting across the silent valley' },
      { time: 24, text: 'Echoing stillness without digital noise' },
      { time: 33, text: 'Offline clarity in pure acoustic balance' },
      { time: 40, text: 'Peace restored in the morning glow' }
    ]
  },
  {
    id: 'sample-ambient-3',
    title: 'Binaural Focus Alpha (432Hz)',
    artist: 'Deep State Acoustic Lab',
    album: 'Cognitive Architecture',
    duration: 50,
    coverArt: '/src/assets/images/cover_deep_focus_1791348611992.jpg',
    source: 'sample',
    format: 'ALAC Lossless',
    bitrate: '1120 kbps',
    sampleRate: '96,000 Hz Hi-Res',
    year: 2026,
    fileSize: '9.2 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 10,
    lyrics: [
      { time: 0, text: '• Deep meditation binaural harmonic field •' },
      { time: 10, text: 'Alpha wave synchronization active' },
      { time: 22, text: 'Sub-bass resonance aligning hemisphere focus' },
      { time: 35, text: 'Harmonic overtone progression stabilizing attention' },
      { time: 45, text: 'Pure offline acoustic sanctuary' }
    ]
  }
];
