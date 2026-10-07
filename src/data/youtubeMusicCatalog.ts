import { Track } from '../types/music';

export interface YouTubeMusicTrack extends Track {
  youtubeVideoId: string;
  viewCount: string;
  isCachedOffline?: boolean;
}

export const YOUTUBE_MUSIC_INITIAL_CATALOG: YouTubeMusicTrack[] = [
  {
    id: 'ytm-blinding-lights',
    youtubeVideoId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    coverArt: '/src/assets/images/cover_neon_midnight_1791348582757.jpg',
    source: 'extension',
    extensionId: 'ext-youtube-music',
    format: 'Opus 256kbps (YouTube Music)',
    bitrate: '256 kbps',
    sampleRate: '48,000 Hz',
    year: 2020,
    viewCount: '2.8B views',
    fileSize: '4.2 MB',
    dateAdded: Date.now(),
    lyrics: [
      { time: 0, text: '• Synthwave intro pulse •' },
      { time: 14, text: "Yeah, I've been tryna call" },
      { time: 18, text: "I've been on my own for long enough" },
      { time: 24, text: "Maybe you can show me how to love, maybe" },
      { time: 32, text: "I'm going through withdrawals" },
      { time: 38, text: "You don't even have to do too much" },
      { time: 44, text: "You can turn me on with just a touch, baby" },
      { time: 51, text: "I look around and Sin City's cold and empty" },
      { time: 58, text: "No one's around to judge me" },
      { time: 64, text: "I can't see clearly when you're gone" },
      { time: 70, text: "I said, ooh, I'm blinded by the lights" }
    ]
  },
  {
    id: 'ytm-resonance-home',
    youtubeVideoId: '8GW6sLrK40k',
    title: 'Resonance',
    artist: 'HOME',
    album: 'Odyssey',
    duration: 212,
    coverArt: '/src/assets/images/cover_ambient_dawn_1791348598021.jpg',
    source: 'extension',
    extensionId: 'ext-youtube-music',
    format: 'Opus 256kbps (YouTube Music)',
    bitrate: '256 kbps',
    sampleRate: '48,000 Hz',
    year: 2014,
    viewCount: '185M views',
    fileSize: '4.5 MB',
    dateAdded: Date.now(),
    lyrics: [
      { time: 0, text: '• Nostalgic analog synth resonance •' },
      { time: 28, text: '• Warm tape saturation & 80s drums enter •' },
      { time: 60, text: '• Hypnotic bassline modulation •' },
      { time: 120, text: '• Atmospheric filter sweep •' }
    ]
  },
  {
    id: 'ytm-midnight-city',
    youtubeVideoId: 'dX3k_QDnzHE',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    duration: 243,
    coverArt: '/src/assets/images/cover_neon_midnight_1791348582757.jpg',
    source: 'extension',
    extensionId: 'ext-youtube-music',
    format: 'Opus 256kbps (YouTube Music)',
    bitrate: '256 kbps',
    sampleRate: '48,000 Hz',
    year: 2011,
    viewCount: '490M views',
    fileSize: '5.1 MB',
    dateAdded: Date.now(),
    lyrics: [
      { time: 0, text: '• Iconic vocal lead hook •' },
      { time: 20, text: 'Waiting in a car, waiting for a ride in the dark' },
      { time: 35, text: 'The night city grows, look and see her eyes, they glow' },
      { time: 52, text: 'Waiting in a car, waiting for a ride in the dark' },
      { time: 70, text: 'The city is my church, it wraps me in the blinding twilight' }
    ]
  },
  {
    id: 'ytm-sweater-weather',
    youtubeVideoId: 'GCdwKhTtNNw',
    title: 'Sweater Weather',
    artist: 'The Neighbourhood',
    album: 'I Love You.',
    duration: 240,
    coverArt: '/src/assets/images/cover_deep_focus_1791348611992.jpg',
    source: 'extension',
    extensionId: 'ext-youtube-music',
    format: 'Opus 256kbps (YouTube Music)',
    bitrate: '256 kbps',
    sampleRate: '48,000 Hz',
    year: 2013,
    viewCount: '1.2B views',
    fileSize: '4.9 MB',
    dateAdded: Date.now(),
    lyrics: [
      { time: 0, text: '• Gentle acoustic strumming & reverb •' },
      { time: 15, text: "All I am is a man, I want the world in my hands" },
      { time: 28, text: "I hate the beach, but I stand in California with my toes in the sand" },
      { time: 42, text: "'Cause it's too cold for you here and now" },
      { time: 54, text: "So let me hold both your hands in the holes of my sweater" }
    ]
  },
  {
    id: 'ytm-stay-kid-laroi',
    youtubeVideoId: 'kTJczUoc26U',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    album: 'F*CK LOVE 3+: OVER YOU',
    duration: 141,
    coverArt: '/src/assets/images/cover_ambient_dawn_1791348598021.jpg',
    source: 'extension',
    extensionId: 'ext-youtube-music',
    format: 'Opus 256kbps (YouTube Music)',
    bitrate: '256 kbps',
    sampleRate: '48,000 Hz',
    year: 2021,
    viewCount: '920M views',
    fileSize: '3.1 MB',
    dateAdded: Date.now(),
    lyrics: [
      { time: 0, text: "I do the same thing I told you that I never would" },
      { time: 8, text: "I told you I'd change, even when I knew I never could" },
      { time: 16, text: "Know that I can't find nobody else as good as you" },
      { time: 24, text: "I need you to stay, need you to stay, hey" }
    ]
  },
  {
    id: 'ytm-after-hours',
    youtubeVideoId: 'ygTZZpVHNmA',
    title: 'After Hours',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 361,
    coverArt: '/src/assets/images/cover_neon_midnight_1791348582757.jpg',
    source: 'extension',
    extensionId: 'ext-youtube-music',
    format: 'Opus 256kbps (YouTube Music)',
    bitrate: '256 kbps',
    sampleRate: '48,000 Hz',
    year: 2020,
    viewCount: '650M views',
    fileSize: '7.3 MB',
    dateAdded: Date.now(),
    lyrics: [
      { time: 0, text: '• Atmospheric cinematic intro •' },
      { time: 25, text: "Thought I almost died in my dream again" },
      { time: 45, text: "Fightin' for my life, I couldn't breathe again" },
      { time: 70, text: "Where are you now when I need you most?" }
    ]
  }
];
