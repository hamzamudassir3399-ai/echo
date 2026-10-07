import { Track } from '../types/music';

export interface ScanProgress {
  status: 'idle' | 'requesting_permission' | 'scanning' | 'completed' | 'error';
  filesScanned: number;
  audioFound: number;
  currentFolder: string;
  currentFile: string;
  totalSizeBytes: number;
  errorMessage?: string;
}

export type StoragePermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

const AUDIO_EXTENSIONS = new Set(['mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac', 'opus', 'alac', 'aiff']);

/**
 * Permissions-conscious Local Music File Discovery Service
 * Supports File System Access API (Chromium / Android Chrome) with fallback
 * to HTML5 directory selection.
 */
class LocalMusicDiscoveryService {
  private lastDirectoryHandle: any = null;

  /**
   * Checks current permission state for storage access
   */
  async checkPermissionStatus(): Promise<StoragePermissionState> {
    if (!('showDirectoryPicker' in window)) {
      return 'unsupported';
    }

    if (this.lastDirectoryHandle) {
      try {
        const query = await (this.lastDirectoryHandle as any).queryPermission({ mode: 'read' });
        return query === 'granted' ? 'granted' : query === 'denied' ? 'denied' : 'prompt';
      } catch {
        return 'prompt';
      }
    }

    const saved = localStorage.getItem('echo_storage_permission');
    if (saved === 'granted') return 'granted';
    if (saved === 'denied') return 'denied';
    return 'prompt';
  }

  /**
   * Scans a directory handle recursively for audio files
   */
  async scanDirectoryWithFSA(
    onProgress?: (progress: ScanProgress) => void
  ): Promise<Track[]> {
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API is not supported on this browser. Use folder file picker fallback.');
    }

    onProgress?.({
      status: 'requesting_permission',
      filesScanned: 0,
      audioFound: 0,
      currentFolder: 'Device Storage',
      currentFile: 'Awaiting permission approval...',
      totalSizeBytes: 0,
    });

    let dirHandle: any;
    try {
      dirHandle = await (window as any).showDirectoryPicker({
        id: 'echo_music_library',
        mode: 'read',
        startIn: 'music',
      });
      this.lastDirectoryHandle = dirHandle;
      localStorage.setItem('echo_storage_permission', 'granted');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Storage access was cancelled by the user.');
      }
      localStorage.setItem('echo_storage_permission', 'denied');
      throw new Error(`Permission denied: ${err.message}`);
    }

    const discoveredTracks: Track[] = [];
    let filesScanned = 0;
    let audioFound = 0;
    let totalSizeBytes = 0;

    const traverse = async (handle: any, currentPath: string) => {
      for await (const entry of handle.values()) {
        filesScanned++;

        if (entry.kind === 'directory') {
          onProgress?.({
            status: 'scanning',
            filesScanned,
            audioFound,
            currentFolder: `${currentPath}/${entry.name}`,
            currentFile: '',
            totalSizeBytes,
          });
          await traverse(entry, `${currentPath}/${entry.name}`);
        } else if (entry.kind === 'file') {
          const extension = entry.name.split('.').pop()?.toLowerCase() || '';

          onProgress?.({
            status: 'scanning',
            filesScanned,
            audioFound,
            currentFolder: currentPath,
            currentFile: entry.name,
            totalSizeBytes,
          });

          if (AUDIO_EXTENSIONS.has(extension)) {
            try {
              const file: File = await entry.getFile();
              totalSizeBytes += file.size;
              audioFound++;

              const track = this.parseAudioFileToTrack(file, currentPath);
              discoveredTracks.push(track);

              onProgress?.({
                status: 'scanning',
                filesScanned,
                audioFound,
                currentFolder: currentPath,
                currentFile: entry.name,
                totalSizeBytes,
              });
            } catch (fileErr) {
              console.warn(`Could not read file ${entry.name}:`, fileErr);
            }
          }
        }
      }
    };

    onProgress?.({
      status: 'scanning',
      filesScanned,
      audioFound,
      currentFolder: dirHandle.name,
      currentFile: 'Indexing files...',
      totalSizeBytes,
    });

    await traverse(dirHandle, dirHandle.name);

    onProgress?.({
      status: 'completed',
      filesScanned,
      audioFound,
      currentFolder: dirHandle.name,
      currentFile: 'Scan complete',
      totalSizeBytes,
    });

    return discoveredTracks;
  }

  /**
   * Scans files provided via HTML5 input / drop event
   */
  async scanFileList(
    files: FileList | File[],
    onProgress?: (progress: ScanProgress) => void
  ): Promise<Track[]> {
    const fileArray = Array.from(files);
    const discoveredTracks: Track[] = [];
    let filesScanned = 0;
    let audioFound = 0;
    let totalSizeBytes = 0;

    onProgress?.({
      status: 'scanning',
      filesScanned: 0,
      audioFound: 0,
      currentFolder: 'Device Selection',
      currentFile: 'Indexing audio files...',
      totalSizeBytes: 0,
    });

    for (const file of fileArray) {
      filesScanned++;
      const extension = file.name.split('.').pop()?.toLowerCase() || '';

      if (AUDIO_EXTENSIONS.has(extension) || file.type.startsWith('audio/')) {
        audioFound++;
        totalSizeBytes += file.size;
        const relativeFolder = (file as any).webkitRelativePath
          ? (file as any).webkitRelativePath.split('/').slice(0, -1).join('/')
          : 'Local Storage';

        const track = this.parseAudioFileToTrack(file, relativeFolder);
        discoveredTracks.push(track);
      }

      onProgress?.({
        status: 'scanning',
        filesScanned,
        audioFound,
        currentFolder: 'Local Storage',
        currentFile: file.name,
        totalSizeBytes,
      });
    }

    onProgress?.({
      status: 'completed',
      filesScanned,
      audioFound,
      currentFolder: 'Local Storage',
      currentFile: 'Complete',
      totalSizeBytes,
    });

    localStorage.setItem('echo_storage_permission', 'granted');
    return discoveredTracks;
  }

  /**
   * Parses File attributes into an Echo Track model
   */
  private parseAudioFileToTrack(file: File, folderName: string): Track {
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    let artist = 'Local Artist';
    let title = cleanName;
    let album = folderName.replace(/^Device\//, '') || 'Local Music';

    // Standard pattern: "Artist - Title" or "01 - Artist - Title"
    if (cleanName.includes(' - ')) {
      const parts = cleanName.split(' - ');
      if (parts.length >= 2) {
        artist = parts[0].replace(/^\d+[\s.-]*/, '').trim() || 'Local Artist';
        title = parts.slice(1).join(' - ').trim();
      }
    }

    const blobUrl = URL.createObjectURL(file);
    const ext = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';
    const mb = (file.size / (1024 * 1024)).toFixed(1);

    return {
      id: `local-discovered-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      artist,
      album,
      duration: 180, // Approximate initial duration
      url: blobUrl,
      coverArt: '/src/assets/images/echo_app_icon_1791348567719.jpg',
      source: 'local',
      format: `${ext} Audio`,
      bitrate: '320 kbps (Direct)',
      sampleRate: '44,100 Hz',
      year: new Date(file.lastModified || Date.now()).getFullYear(),
      fileSize: `${mb} MB`,
      dateAdded: file.lastModified || Date.now(),
    };
  }
}

export const localMusicScanner = new LocalMusicDiscoveryService();
