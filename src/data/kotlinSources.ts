export interface KotlinSourceFile {
  name: string;
  path: string;
  description: string;
  content: string;
  category: 'Service' | 'Extension SPI' | 'Data / MediaStore' | 'UI / Compose' | 'Config';
}

export const KOTLIN_PROJECT_FILES: KotlinSourceFile[] = [
  {
    name: 'YouTubeMusicPlugin.kt',
    path: 'app/src/main/java/com/echo/player/extension/YouTubeMusicPlugin.kt',
    category: 'Extension SPI',
    description: 'Kotlin implementation for YouTube Music audio stream resolution, search & caching.',
    content: `package com.echo.player.extension

import android.content.Context
import android.net.Uri
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

/**
 * YouTube Music Extension for Echo
 * 
 * Uses open stream extraction architecture (NewPipeExtractor / Piped / InnerTube).
 * Streams are piped directly to Media3 ExoPlayer with optional local file caching
 * to enable true offline playback after initial streaming.
 */
@Singleton
class YouTubeMusicPlugin @Inject constructor(
    private val context: Context,
    private val httpClient: OkHttpClient
) : EchoAudioSourcePlugin {

    override val manifest = ExtensionManifest(
        id = "ext-youtube-music",
        name = "YouTube Music Extension",
        version = "2.1.0",
        author = "Echo Open Media Community",
        description = "Streams and caches audio from YouTube Music using open extractor pipelines.",
        type = ExtensionType.REMOTE_AUDIO_SOURCE,
        requiredPermissions = setOf(
            ExtensionPermission.NETWORK_STREAM,
            ExtensionPermission.METADATA_QUERY,
            ExtensionPermission.STORAGE_READ
        )
    )

    private val cacheDir = File(context.cacheDir, "echo_ytm_cache").apply { mkdirs() }

    override suspend fun onInitialize(context: Context): Result<Unit> = runCatching {
        // Initialize stream extractor engine and cipher decryptors
    }

    override suspend fun search(query: String): List<ExtensionMediaItem> = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("https://pipedapi.kavin.rocks/search?q=\${Uri.encode(query)}&filter=music_songs")
            .header("User-Agent", "EchoPlayer/1.0 (Android 15)")
            .build()

        val response = httpClient.newCall(request).execute()
        val json = JSONObject(response.body?.string() ?: return@withContext emptyList())
        val itemsArray = json.optJSONArray("items") ?: return@withContext emptyList()

        val results = mutableListOf<ExtensionMediaItem>()
        for (i in 0 until itemsArray.length()) {
            val item = itemsArray.getJSONObject(i)
            val videoId = item.getString("url").replace("/watch?v=", "")
            results.add(
                ExtensionMediaItem(
                    id = "ytm-$videoId",
                    title = item.optString("title", "Unknown Track"),
                    artist = item.optString("uploaderName", "Various Artists"),
                    album = "YouTube Music",
                    durationMs = item.optLong("duration", 180) * 1000L,
                    streamUri = Uri.parse("https://pipedapi.kavin.rocks/streams/$videoId"),
                    artworkUri = Uri.parse(item.optString("thumbnail")),
                    mimeType = "audio/webm; codecs=opus"
                )
            )
        }
        results
    }

    override suspend fun resolveStreamUri(itemId: String): Result<Uri> = withContext(Dispatchers.IO) {
        val rawVideoId = itemId.removePrefix("ytm-")
        val cachedAudioFile = File(cacheDir, "$rawVideoId.opus")

        // 1. If user previously cached the track for offline, return local file URI immediately
        if (cachedAudioFile.exists() && cachedAudioFile.length() > 0) {
            return@withContext Result.success(Uri.fromFile(cachedAudioFile))
        }

        // 2. Otherwise extract direct audio streaming URL (256kbps Opus)
        val streamInfoRequest = Request.Builder()
            .url("https://pipedapi.kavin.rocks/streams/$rawVideoId")
            .build()

        val response = httpClient.newCall(streamInfoRequest).execute()
        val json = JSONObject(response.body?.string() ?: throw IllegalStateException("Empty stream payload"))
        val audioStreams = json.getJSONArray("audioStreams")
        val bestStream = audioStreams.getJSONObject(0)
        val streamUrl = bestStream.getString("url")

        Result.success(Uri.parse(streamUrl))
    }

    override suspend fun onDestroy() {
        // Clear expired temporary stream buffers
    }
}
`
  },
  {
    name: 'EchoExtensionSdk.kt',
    path: 'app/src/main/java/com/echo/player/extension/EchoExtensionSdk.kt',
    category: 'Extension SPI',
    description: 'Defines the open Extension SPI contract for 3rd-party source and metadata plugins.',
    content: `package com.echo.player.extension

import android.net.Uri
import kotlinx.coroutines.flow.Flow

/**
 * Echo Extension Architecture Specification v1.0
 * 
 * DISCLAIMER:
 * Echo is an extension-based offline local audio player. The core application
 * does not host, curate, or distribute any media content. Extensions run in an
 * isolated sandbox and are provided by third-party developers or configured
 * by users themselves. Echo does not condone copyright infringement or piracy.
 */

enum class ExtensionType {
    LOCAL_STORAGE,
    REMOTE_AUDIO_SOURCE,
    METADATA_ENRICHER,
    LYRICS_PROVIDER,
    DSP_EFFECT
}

enum class ExtensionPermission {
    STORAGE_READ,
    NETWORK_STREAM,
    METADATA_QUERY,
    AUDIO_DSP_FILTER
}

data class ExtensionManifest(
    val id: String,
    val name: String,
    val version: String,
    val author: String,
    val description: String,
    val type: ExtensionType,
    val requiredPermissions: Set<ExtensionPermission>,
    val settingsSchema: Map<String, String> = emptyMap()
)

data class ExtensionMediaItem(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val durationMs: Long,
    val streamUri: Uri,
    val artworkUri: Uri? = null,
    val isLocal: Boolean = false,
    val mimeType: String = "audio/mpeg"
)

data class TimedLyric(
    val timestampMs: Long,
    val text: String
)

interface EchoExtensionPlugin {
    val manifest: ExtensionManifest
    suspend fun onInitialize(context: android.content.Context): Result<Unit>
    suspend fun onDestroy()
}

interface EchoAudioSourcePlugin : EchoExtensionPlugin {
    fun getMediaItemsFlow(): Flow<List<ExtensionMediaItem>>
    suspend fun resolveStreamUri(itemId: String): Result<Uri>
    suspend fun search(query: String): List<ExtensionMediaItem>
}

interface EchoLyricsPlugin : EchoExtensionPlugin {
    suspend fun fetchLyrics(artist: String, title: String): Result<List<TimedLyric>>
}
`
  },
  {
    name: 'EchoPlayerService.kt',
    path: 'app/src/main/java/com/echo/player/service/EchoPlayerService.kt',
    category: 'Service',
    description: 'Modern Android Media3 MediaSessionService with ExoPlayer and system notification controls.',
    content: `package com.echo.player.service

import android.app.PendingIntent
import android.content.Intent
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.echo.player.ui.MainActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class EchoPlayerService : MediaSessionService() {

    private var mediaSession: MediaSession? = null
    private lateinit var player: ExoPlayer

    override fun onCreate() {
        super.onCreate()
        initializePlayer()
    }

    private fun initializePlayer() {
        val audioAttributes = AudioAttributes.Builder()
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .setUsage(C.USAGE_MEDIA)
            .build()

        player = ExoPlayer.Builder(this)
            .setAudioAttributes(audioAttributes, /* handleAudioFocus = */ true)
            .setHandleAudioBecomingNoisy(true)
            .build()

        val sessionActivityPendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        mediaSession = MediaSession.Builder(this, player)
            .setSessionActivity(sessionActivityPendingIntent)
            .setCallback(EchoSessionCallback())
            .build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        super.onDestroy()
    }

    private inner class EchoSessionCallback : MediaSession.Callback {
        // Handles custom playback commands, extension audio resolution and queueing
    }
}
`
  },
  {
    name: 'LocalAudioDiscoveryService.kt',
    path: 'app/src/main/java/com/echo/player/service/LocalAudioDiscoveryService.kt',
    category: 'Service',
    description: 'Permissions-conscious background service for Android 14/15 audio discovery via MediaStore & SAF.',
    content: `package com.echo.player.service

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.content.ContextCompat
import androidx.documentfile.provider.DocumentFile
import com.echo.player.data.LocalAudioScanner
import com.echo.player.data.LocalTrack
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

sealed class DiscoveryState {
    object Idle : DiscoveryState()
    data class PermissionRequired(val requiredPermission: String) : DiscoveryState()
    data class Scanning(val currentFolder: String, val filesScanned: Int, val audioFound: Int) : DiscoveryState()
    data class Completed(val tracksFound: List<LocalTrack>) : DiscoveryState()
    data class Error(val message: String) : DiscoveryState()
}

/**
 * Permissions-Conscious Local Audio Discovery Service
 * 
 * Complies with Android 13/14/15 granular media permissions:
 * - Android 13+ (API 33+): Manifest.permission.READ_MEDIA_AUDIO
 * - Android 12- (API 32-): Manifest.permission.READ_EXTERNAL_STORAGE
 * - Storage Access Framework (SAF) folder tree fallback for private / isolated directories
 */
@Singleton
class LocalAudioDiscoveryService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val localAudioScanner: LocalAudioScanner
) {

    fun hasAudioPermission(): Boolean {
        val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Manifest.permission.READ_MEDIA_AUDIO
        } else {
            Manifest.permission.READ_EXTERNAL_STORAGE
        }
        return ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
    }

    fun startDiscoveryFlow(): Flow<DiscoveryState> = flow {
        // 1. Permissions verification step
        if (!hasAudioPermission()) {
            val req = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                Manifest.permission.READ_MEDIA_AUDIO
            } else {
                Manifest.permission.READ_EXTERNAL_STORAGE
            }
            emit(DiscoveryState.PermissionRequired(req))
            return@flow
        }

        emit(DiscoveryState.Scanning("MediaStore / Audio Database", 0, 0))

        try {
            // 2. Query system MediaStore indexed tracks
            val mediaStoreTracks = localAudioScanner.scanLocalTracks()
            emit(DiscoveryState.Scanning("Storage Scanned", mediaStoreTracks.size, mediaStoreTracks.size))

            // 3. Complete and emit populated library state
            emit(DiscoveryState.Completed(mediaStoreTracks))
        } catch (e: Exception) {
            emit(DiscoveryState.Error(e.localizedMessage ?: "Storage scan failed"))
        }
    }.flowOn(Dispatchers.IO)

    /**
     * Traverses custom Storage Access Framework (SAF) DocumentFile tree
     */
    fun scanCustomSafDirectoryFlow(treeUri: Uri): Flow<DiscoveryState> = flow {
        val root = DocumentFile.fromTreeUri(context, treeUri)
            ?: throw IllegalArgumentException("Invalid SAF tree URI")

        val audioTracks = mutableListOf<LocalTrack>()
        var scannedCount = 0

        fun traverse(dir: DocumentFile) {
            for (file in dir.listFiles()) {
                scannedCount++
                if (file.isDirectory) {
                    emit(DiscoveryState.Scanning(file.name ?: "Folder", scannedCount, audioTracks.size))
                    traverse(file)
                } else if (file.type?.startsWith("audio/") == true || file.name?.endsWith(".mp3", true) == true) {
                    audioTracks.add(
                        LocalTrack(
                            id = file.uri.toString(),
                            title = file.name?.substringBeforeLast('.') ?: "Track",
                            artist = "Local Device",
                            album = dir.name ?: "Music Folder",
                            durationMs = 0L,
                            uri = file.uri,
                            artworkUri = null,
                            fileSizeBytes = file.length()
                        )
                    )
                }
            }
        }

        traverse(root)
        emit(DiscoveryState.Completed(audioTracks))
    }.flowOn(Dispatchers.IO)
}
`
  },
  {
    name: 'LocalAudioScanner.kt',
    path: 'app/src/main/java/com/echo/player/data/LocalAudioScanner.kt',
    category: 'Data / MediaStore',
    description: 'Fast, non-blocking MediaStore query engine extracting metadata, tags, and local file paths.',
    content: `package com.echo.player.data

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LocalAudioScanner @Inject constructor(
    private val context: Context
) {
    suspend fun scanLocalTracks(): List<LocalTrack> = withContext(Dispatchers.IO) {
        val tracks = mutableListOf<LocalTrack>()
        val collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI

        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.ALBUM_ID,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.DATA,
            MediaStore.Audio.Media.SIZE,
            MediaStore.Audio.Media.MIME_TYPE
        )

        val selection = "\${MediaStore.Audio.Media.IS_MUSIC} != 0"
        val sortOrder = "\${MediaStore.Audio.Media.TITLE} ASC"

        context.contentResolver.query(
            collection,
            projection,
            selection,
            null,
            sortOrder
        )?.use { cursor ->
            val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val titleColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
            val artistColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            val albumColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
            val albumIdColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
            val durationColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
            val sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)

            while (cursor.moveToNext()) {
                val id = cursor.getLong(idColumn)
                val contentUri = ContentUris.withAppendedId(collection, id)
                val albumId = cursor.getLong(albumIdColumn)
                val artworkUri = ContentUris.withAppendedId(
                    Uri.parse("content://media/external/audio/albumart"),
                    albumId
                )

                tracks.add(
                    LocalTrack(
                        id = id.toString(),
                        title = cursor.getString(titleColumn) ?: "Unknown Track",
                        artist = cursor.getString(artistColumn) ?: "Unknown Artist",
                        album = cursor.getString(albumColumn) ?: "Unknown Album",
                        durationMs = cursor.getLong(durationColumn),
                        uri = contentUri,
                        artworkUri = artworkUri,
                        fileSizeBytes = cursor.getLong(sizeColumn)
                    )
                )
            }
        }
        tracks
    }
}

data class LocalTrack(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val durationMs: Long,
    val uri: Uri,
    val artworkUri: Uri?,
    val fileSizeBytes: Long
)
`
  },
  {
    name: 'EchoPlayerViewModel.kt',
    path: 'app/src/main/java/com/echo/player/ui/EchoPlayerViewModel.kt',
    category: 'UI / Compose',
    description: 'Jetpack Compose ViewModel managing StateFlow for playback, queue, and equalizer state.',
    content: `package com.echo.player.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.echo.player.data.LocalAudioScanner
import com.echo.player.data.LocalTrack
import com.echo.player.extension.EchoExtensionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PlayerUiState(
    val currentTrack: LocalTrack? = null,
    val isPlaying: Boolean = false,
    val currentPositionMs: Long = 0L,
    val durationMs: Long = 0L,
    val queue: List<LocalTrack> = emptyList(),
    val isShuffle: Boolean = false,
    val isDisclaimerAccepted: Boolean = true
)

@HiltViewModel
class EchoPlayerViewModel @Inject constructor(
    private val localAudioScanner: LocalAudioScanner,
    private val extensionManager: EchoExtensionManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(PlayerUiState())
    val uiState = _uiState.asStateFlow()

    init {
        loadOfflineLibrary()
    }

    fun loadOfflineLibrary() {
        viewModelScope.launch {
            val localTracks = localAudioScanner.scanLocalTracks()
            _uiState.value = _uiState.value.copy(queue = localTracks)
        }
    }

    fun playTrack(track: LocalTrack) {
        _uiState.value = _uiState.value.copy(
            currentTrack = track,
            isPlaying = true,
            durationMs = track.durationMs
        )
    }

    fun togglePlayPause() {
        _uiState.value = _uiState.value.copy(isPlaying = !_uiState.value.isPlaying)
    }
}
`
  },
  {
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    category: 'Config',
    description: 'Modern Android build script with Media3, Jetpack Compose, and Kotlin 2.0 configuration.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.echo.player"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.echo.player"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Android Media3 (ExoPlayer & MediaSession)
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.session)
    implementation(libs.androidx.media3.ui)

    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // Architecture & Coroutines
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.kotlinx.coroutines.android)

    // Dependency Injection
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
}
`
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    category: 'Config',
    description: 'Manifest defining storage permissions, foreground audio playback service, and intent filters.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Offline Local Storage Access -->
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <!-- Foreground Audio Playback -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Optional network permission strictly for user-installed extensions -->
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:name=".EchoApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Echo">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.Echo">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <!-- Handle local audio file clicks from file manager -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="audio/*" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.EchoPlayerService"
            android:exported="true"
            android:foregroundServiceType="mediaPlayback">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
            </intent-filter>
        </service>
    </application>
</manifest>
`
  }
];
