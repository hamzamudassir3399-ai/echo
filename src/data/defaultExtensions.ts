import { EchoExtension, ExtensionPermission } from '../types/music';

export const EXTENSION_PERMISSIONS: ExtensionPermission[] = [
  {
    id: 'STORAGE_READ',
    name: 'Read Storage',
    description: 'Allows plugin to index and read audio files from local or external folders.',
    isSensitive: false
  },
  {
    id: 'NETWORK_STREAM',
    name: 'Network Streaming',
    description: 'Allows plugin to establish TLS connections to user-specified private media servers.',
    isSensitive: true
  },
  {
    id: 'METADATA_QUERY',
    name: 'Metadata & Lyrics Query',
    description: 'Allows plugin to query track metadata, artist bios, and synchronized lyrics.',
    isSensitive: false
  },
  {
    id: 'AUDIO_DSP_FILTER',
    name: 'Audio Signal Processing',
    description: 'Grants access to WebAudio / Media3 audio pipeline nodes for custom real-time effects.',
    isSensitive: false
  }
];

export const INITIAL_EXTENSIONS: EchoExtension[] = [
  {
    id: 'ext-youtube-music',
    name: 'YouTube Music Extension',
    version: '2.1.0',
    author: 'Echo Open Media Community',
    description: 'Explore, search, stream, and cache music from YouTube Music into your offline library using open stream extractors.',
    icon: 'Youtube',
    type: 'audio-source',
    enabled: true,
    isBuiltIn: true,
    permissions: ['NETWORK_STREAM', 'METADATA_QUERY', 'STORAGE_READ'],
    config: {
      preferredAudioQuality: '256kbps Opus',
      streamExtractor: 'NewPipeExtractor / Invidious API',
      cacheForOffline: 'true',
      filterExplicit: 'false'
    },
    configSchema: [
      { key: 'preferredAudioQuality', label: 'Audio Stream Bitrate', type: 'text', defaultValue: '256kbps Opus' },
      { key: 'streamExtractor', label: 'Extractor Provider', type: 'text', defaultValue: 'NewPipeExtractor / Invidious API' },
      { key: 'cacheForOffline', label: 'Auto-cache played tracks for offline', type: 'text', defaultValue: 'true' }
    ],
    sampleEndpoint: 'https://music.youtube.com/youtubei/v1/search',
    codeSnippet: `// Echo Android Kotlin SPI for YouTube Music
class YouTubeMusicExtension : EchoAudioSourcePlugin {
    override val manifest = ExtensionManifest(
        id = "ext-youtube-music",
        name = "YouTube Music Extension",
        version = "2.1.0",
        type = ExtensionType.REMOTE_AUDIO_SOURCE,
        requiredPermissions = setOf(ExtensionPermission.NETWORK_STREAM, ExtensionPermission.METADATA_QUERY)
    )

    override suspend fun search(query: String): List<ExtensionMediaItem> = withContext(Dispatchers.IO) {
        // Query InnerTube / NewPipeExtractor search engine
        val searchResults = YouTubeClient.search(query, filter = SearchFilter.MUSIC_TRACKS)
        searchResults.map { item ->
            ExtensionMediaItem(
                id = item.videoId,
                title = item.name,
                artist = item.uploaderName,
                album = item.albumName ?: "Single",
                durationMs = item.duration * 1000L,
                streamUri = Uri.parse("https://stream.echo.internal/\${item.videoId}"),
                artworkUri = Uri.parse(item.thumbnailUrl)
            )
        }
    }
}`
  },
  {
    id: 'ext-subsonic',
    name: 'Navidrome & Subsonic Bridge',
    version: '2.4.0',
    author: 'Open Source Media Guild',
    description: 'Connects to your private, self-hosted Navidrome, Subsonic, or LMS server with offline caching & token auth.',
    icon: 'Radio',
    type: 'audio-source',
    enabled: true,
    isBuiltIn: true,
    permissions: ['NETWORK_STREAM', 'METADATA_QUERY'],
    config: {
      serverUrl: 'https://music.home.lab',
      username: 'audiophile',
      cacheOffline: 'true'
    },
    configSchema: [
      { key: 'serverUrl', label: 'Server REST URL', type: 'url', placeholder: 'https://navidrome.example.com' },
      { key: 'username', label: 'Username', type: 'text', placeholder: 'your_username' },
      { key: 'cacheOffline', label: 'Cache for Offline (GB)', type: 'number', defaultValue: '5' }
    ],
    sampleEndpoint: 'https://music.home.lab/rest/getMusicDirectory.view',
    codeSnippet: `// Echo Kotlin Plugin SPI implementation
class SubsonicPlugin : EchoAudioSourceExtension {
    override val id = "ext-subsonic"
    override val manifestVersion = 2
    
    override suspend fun queryStream(trackId: String, auth: AuthToken): AudioStream {
        val client = OkHttpClient.Builder().cache(offlineMediaCache).build()
        val request = Request.Builder()
            .url("\${config.serverUrl}/rest/stream.view?id=$trackId&u=\${config.username}&t=\${auth.token}&s=\${auth.salt}&v=1.16.1&c=EchoPlayer")
            .build()
        return client.newCall(request).execute().body?.byteStream() ?: throw IOException("Stream failed")
    }
}`
  },
  {
    id: 'ext-webdav',
    name: 'Nextcloud / WebDAV Storage',
    version: '1.8.2',
    author: 'SelfHost Hub',
    description: 'Directly mount and stream music collections stored on your own Nextcloud, ownCloud, or generic WebDAV server.',
    icon: 'Cloud',
    type: 'cloud-storage',
    enabled: false,
    isBuiltIn: true,
    permissions: ['NETWORK_STREAM', 'STORAGE_READ'],
    config: {
      endpoint: 'https://cloud.personal.me/remote.php/dav/files/user/Music',
      bufferChunkSize: '512kb'
    },
    configSchema: [
      { key: 'endpoint', label: 'WebDAV Music Directory URL', type: 'url', placeholder: 'https://cloud.example.org/remote.php/webdav/Music' },
      { key: 'bufferChunkSize', label: 'Buffer Chunk Size', type: 'text', defaultValue: '512kb' }
    ],
    codeSnippet: `class WebDavMediaProvider : EchoStorageExtension {
    override suspend fun scanDirectory(path: String): List<EchoMediaItem> {
        val propfindRequest = buildPropFindXml()
        // Parses WebDAV XML responses to extract file names, sizes and durations
        return davClient.propfind(path, propfindRequest).map { it.toMediaItem() }
    }
}`
  },
  {
    id: 'ext-lrc-lyrics',
    name: 'Open Timed LRC Lyrics',
    version: '3.1.0',
    author: 'Community Lyrics Archive',
    description: 'Automatically retrieves accurate synchronized word-by-word .lrc lyrics from open community mirrors.',
    icon: 'FileText',
    type: 'lyrics-provider',
    enabled: true,
    isBuiltIn: true,
    permissions: ['METADATA_QUERY'],
    config: {
      fallbackToPlain: 'true',
      cacheLyricsLocally: 'true'
    },
    configSchema: [
      { key: 'fallbackToPlain', label: 'Fallback to unsynced lyrics', type: 'text', defaultValue: 'true' },
      { key: 'cacheLyricsLocally', label: 'Save .lrc alongside audio file', type: 'text', defaultValue: 'true' }
    ],
    codeSnippet: `class LrcLyricsProvider : EchoLyricsExtension {
    override suspend fun fetchLyrics(artist: String, title: String): List<LyricLine> {
        // Looks up local .lrc sidecar file first, then open community mirror
        val localLrc = File(trackPath.replaceAfterLast('.', "lrc"))
        if (localLrc.exists()) return parseLrc(localLrc.readText())
        return emptyList()
    }
}`
  },
  {
    id: 'ext-smb-nas',
    name: 'Local LAN / SMB NAS Discovery',
    version: '1.2.0',
    author: 'HomeLab Net',
    description: 'Scans your local WiFi network for Samba / Windows Share / Synology / TrueNAS audio shares.',
    icon: 'HardDrive',
    type: 'audio-source',
    enabled: false,
    isBuiltIn: false,
    permissions: ['STORAGE_READ'],
    config: {
      workgroup: 'WORKGROUP',
      nasIp: '192.168.1.150'
    },
    configSchema: [
      { key: 'nasIp', label: 'NAS Host IP / Hostname', type: 'text', placeholder: '192.168.1.100' },
      { key: 'workgroup', label: 'Workgroup / Domain', type: 'text', defaultValue: 'WORKGROUP' }
    ]
  },
  {
    id: 'ext-rss-podcasts',
    name: 'Open Podcast & RSS Feeds',
    version: '2.0.1',
    author: 'Audio Syndicate',
    description: 'Enables adding custom RSS 2.0 podcast XML feeds to your Echo library for offline downloading.',
    icon: 'Rss',
    type: 'audio-source',
    enabled: true,
    isBuiltIn: false,
    permissions: ['NETWORK_STREAM', 'METADATA_QUERY'],
    config: {
      autoDownloadWifi: 'true',
      retentionCount: '3'
    }
  }
];
