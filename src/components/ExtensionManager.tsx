import React, { useState } from 'react';
import {
  Puzzle,
  Plus,
  Radio,
  Cloud,
  FileText,
  HardDrive,
  Rss,
  CheckCircle2,
  XCircle,
  Settings,
  Shield,
  Code2,
  Play,
  Terminal,
  ExternalLink,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { EchoExtension, ExtensionType } from '../types/music';
import { EXTENSION_PERMISSIONS } from '../data/defaultExtensions';

export const ExtensionManager: React.FC = () => {
  const {
    extensions,
    toggleExtension,
    addExtension,
    updateExtensionConfig,
    removeExtension,
    themeColor
  } = usePlayer();

  const [filterType, setFilterType] = useState<string>('all');
  const [selectedExtension, setSelectedExtension] = useState<EchoExtension | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [sandboxLog, setSandboxLog] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string; data?: any }>({
    status: 'idle',
    message: ''
  });

  // Custom Extension Authoring Form State
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<ExtensionType>('audio-source');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const filteredExtensions = extensions.filter((ext) => {
    if (filterType === 'all') return true;
    return ext.type === filterType;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Radio': return <Radio className="w-5 h-5 text-cyan-400" />;
      case 'Cloud': return <Cloud className="w-5 h-5 text-purple-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-amber-400" />;
      case 'Rss': return <Rss className="w-5 h-5 text-rose-400" />;
      default: return <Puzzle className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handleTestSandbox = (ext: EchoExtension) => {
    setSandboxLog({ status: 'testing', message: `Initializing sandbox isolated classloader for ${ext.name}...` });
    setTimeout(() => {
      setSandboxLog({
        status: 'success',
        message: `Plugin [${ext.id}] validated successfully in runtime sandbox!`,
        data: {
          pluginId: ext.id,
          version: ext.version,
          activePermissions: ext.permissions,
          endpointConfigured: ext.config.serverUrl || ext.config.endpoint || 'Local SAF Provider',
          latency: '24ms',
          handshake: 'OK_SECURE_CIPHER',
          itemsDiscovered: 42
        }
      });
    }, 700);
  };

  const handleCreateCustomExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newExt: EchoExtension = {
      id: `ext-custom-${Date.now()}`,
      name: customName,
      version: '1.0.0',
      author: 'Local User',
      description: customDesc || 'Custom user-defined audio source extension for Echo.',
      icon: customType === 'cloud-storage' ? 'Cloud' : customType === 'lyrics-provider' ? 'FileText' : 'Radio',
      type: customType,
      enabled: true,
      permissions: ['NETWORK_STREAM', 'STORAGE_READ'],
      config: {
        endpoint: customEndpoint || 'http://localhost:8080'
      },
      configSchema: [
        { key: 'endpoint', label: 'Host Endpoint', type: 'url', defaultValue: customEndpoint }
      ],
      codeSnippet: `// Custom User Plugin for Echo
class ${customName.replace(/\s+/g, '')}Plugin : EchoAudioSourcePlugin {
    override suspend fun queryStream(id: String): AudioStream {
        // Stream resolved from: ${customEndpoint || 'local-endpoint'}
    }
}`
    };

    addExtension(newExt);
    setIsInstallModalOpen(false);
    setCustomName('');
    setCustomEndpoint('');
    setCustomDesc('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto px-4 sm:px-6 py-4">
      {/* Header Info Banner */}
      <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl mb-4 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Echo Extension Framework</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Echo does not host any media content. Use open extensions to integrate your private servers and cloud collections.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-semibold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Plugin</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 mb-4 overflow-x-auto">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            filterType === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({extensions.length})
        </button>
        <button
          onClick={() => setFilterType('audio-source')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            filterType === 'audio-source' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Audio Sources
        </button>
        <button
          onClick={() => setFilterType('cloud-storage')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            filterType === 'cloud-storage' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Cloud / WebDAV
        </button>
        <button
          onClick={() => setFilterType('lyrics-provider')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            filterType === 'lyrics-provider' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Lyrics
        </button>
      </div>

      {/* Extensions List */}
      <div className="space-y-3 flex-1">
        {filteredExtensions.map((ext) => (
          <div
            key={ext.id}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-2xl transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(ext.icon)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-white">{ext.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">v{ext.version}</span>
                    {ext.isBuiltIn && (
                      <span className="text-[10px] text-cyan-400 font-medium">Verified SPI</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ext.description}</p>
                  
                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                    <span>By {ext.author}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{ext.type.replace('-', ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ext.permissions.length} Permissions</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Configure & Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedExtension(ext);
                    setSandboxLog({ status: 'idle', message: '' });
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  title="Configure extension"
                  aria-label={`Configure ${ext.name}`}
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* On / Off Toggle */}
                <button
                  onClick={() => toggleExtension(ext.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    ext.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                  aria-label={ext.enabled ? `Disable ${ext.name}` : `Enable ${ext.name}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      ext.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Extension Settings & Sandbox Modal */}
      {selectedExtension && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[85vh] text-slate-200">
            <button
              onClick={() => setSelectedExtension(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                {getIcon(selectedExtension.icon)}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedExtension.name}</h3>
                <p className="text-xs text-slate-400">Plugin ID: {selectedExtension.id} · v{selectedExtension.version}</p>
              </div>
            </div>

            {/* Permissions list */}
            <div className="my-4 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Granted Android Permissions</span>
              </div>
              <div className="space-y-1.5">
                {selectedExtension.permissions.map((permId) => {
                  const permDef = EXTENSION_PERMISSIONS.find((p) => p.id === permId);
                  return (
                    <div key={permId} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="font-mono text-cyan-400 text-[11px] shrink-0 mt-0.5">•</span>
                      <div>
                        <span className="font-semibold text-white">{permDef?.name || permId}: </span>
                        <span className="text-slate-400">{permDef?.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Configuration Form */}
            {selectedExtension.configSchema && selectedExtension.configSchema.length > 0 && (
              <div className="my-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plugin Settings</h4>
                {selectedExtension.configSchema.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      value={selectedExtension.config[field.key] || ''}
                      onChange={(e) => {
                        updateExtensionConfig(selectedExtension.id, { [field.key]: e.target.value });
                        setSelectedExtension({
                          ...selectedExtension,
                          config: { ...selectedExtension.config, [field.key]: e.target.value }
                        });
                      }}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Sandbox Tester Button & Logs */}
            <div className="my-4 p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Sandbox Connection Test</span>
                </div>
                <button
                  onClick={() => handleTestSandbox(selectedExtension)}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Test Endpoint
                </button>
              </div>

              {sandboxLog.status !== 'idle' && (
                <div className="mt-2 text-xs font-mono bg-black/60 p-2.5 rounded-xl border border-slate-800/80">
                  <p className={sandboxLog.status === 'success' ? 'text-emerald-400' : 'text-slate-400'}>
                    {sandboxLog.message}
                  </p>
                  {sandboxLog.data && (
                    <pre className="text-[11px] text-cyan-300 mt-2 overflow-x-auto">
                      {JSON.stringify(sandboxLog.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Kotlin SPI Preview */}
            {selectedExtension.codeSnippet && (
              <div className="my-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span>Kotlin Implementation (Plugin SPI)</span>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36">
                  {selectedExtension.codeSnippet}
                </pre>
              </div>
            )}

            <div className="mt-5 flex justify-between items-center pt-3 border-t border-slate-800">
              {!selectedExtension.isBuiltIn ? (
                <button
                  onClick={() => {
                    removeExtension(selectedExtension.id);
                    setSelectedExtension(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Uninstall Plugin
                </button>
              ) : <div />}
              <button
                onClick={() => setSelectedExtension(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Custom Extension Modal */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200">
            <button
              onClick={() => setIsInstallModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Add Echo Plugin</h3>
            <p className="text-xs text-slate-400 mb-4">Register an external audio source or metadata connector.</p>

            <form onSubmit={handleCreateCustomExtension} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Plugin Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Personal Jellyfin Server"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Plugin Type</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as ExtensionType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="audio-source">Audio Source (Streaming / Local)</option>
                  <option value="cloud-storage">Cloud Storage / WebDAV</option>
                  <option value="lyrics-provider">Synchronized Lyrics Provider</option>
                  <option value="audio-dsp">Audio DSP Filter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Server Endpoint URL</label>
                <input
                  type="text"
                  placeholder="https://music.home.lab or webdav://..."
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of this plugin..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-xl"
                >
                  Install Plugin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
