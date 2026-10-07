export type AudioSourceType = 'local' | 'sample' | 'extension';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url?: string;
  blob?: Blob;
  coverArt: string;
  source: AudioSourceType;
  extensionId?: string;
  format?: string;
  bitrate?: string;
  sampleRate?: string;
  year?: number;
  lyrics?: { time: number; text: string }[];
  fileSize?: string;
  dateAdded: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverArt?: string;
  trackIds: string[];
  createdAt: number;
}

export type ExtensionType = 
  | 'audio-source' 
  | 'lyrics-provider' 
  | 'metadata-enricher' 
  | 'cloud-storage' 
  | 'audio-dsp';

export interface ExtensionPermission {
  id: string;
  name: string;
  description: string;
  isSensitive: boolean;
}

export interface EchoExtension {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon: string;
  type: ExtensionType;
  enabled: boolean;
  isBuiltIn?: boolean;
  permissions: string[];
  config: Record<string, string>;
  configSchema?: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'number';
    placeholder?: string;
    defaultValue?: string;
  }[];
  sampleEndpoint?: string;
  codeSnippet?: string;
}

export interface EqualizerBand {
  frequency: number;
  label: string;
  gain: number; // -12 to 12 dB
}

export interface EqualizerPreset {
  id: string;
  name: string;
  gains: number[]; // 5 values for 60Hz, 250Hz, 1kHz, 4kHz, 16kHz
}

export type RepeatMode = 'off' | 'all' | 'one';
