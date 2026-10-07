import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  FolderGit2,
  Layers,
  Cpu,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { KOTLIN_PROJECT_FILES, KotlinSourceFile } from '../data/kotlinSources';

export const KotlinCodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<KotlinSourceFile>(KOTLIN_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    // Generate an export text bundle containing all Kotlin source files
    const bundleText = KOTLIN_PROJECT_FILES.map(
      (f) => `// ==========================================\n// File: ${f.path}\n// Description: ${f.description}\n// ==========================================\n\n${f.content}\n\n`
    ).join('\n');

    const blob = new Blob([bundleText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Echo-Android-Kotlin-Architecture-Source.txt';
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice('Project Kotlin sources downloaded! Ready for Android Studio import.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden px-4 sm:px-6 py-4">
      {/* Title & Actions Bar */}
      <div className="flex items-start justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Android Kotlin 2.0 Architecture
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Jetpack Compose · Media3
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Modern native Android implementation with dynamic extension SPI & offline MediaStore scanner.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-purple-600/20 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Kotlin Bundle</span>
        </button>
      </div>

      {exportNotice && (
        <div className="mb-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 shrink-0 animate-fade-in">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Container: Left File Tree, Right Code Viewer */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 bg-slate-900/40 border border-slate-800 rounded-2xl p-3 sm:p-4 overflow-hidden">
        {/* Left: Files List */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 border-b md:border-b-0 md:border-r border-slate-800 pb-2 md:pb-0 md:pr-3">
          <div className="hidden md:block text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2 py-1 mb-1">
            Source Tree
          </div>
          {KOTLIN_PROJECT_FILES.map((file) => {
            const isSelected = selectedFile.name === file.name;
            return (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 shrink-0 md:shrink ${
                  isSelected
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode className="w-4 h-4 shrink-0 text-purple-400" />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="hidden md:inline text-[9px] font-mono text-slate-500 shrink-0">
                  {file.category.split('/')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Code Editor & Copy Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* File Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 shrink-0">
            <div>
              <p className="text-xs font-mono text-purple-400">{selectedFile.path}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="flex-1 overflow-auto bg-slate-950 rounded-xl p-3 sm:p-4 border border-slate-800/80 font-mono text-xs leading-relaxed text-slate-300">
            <pre className="whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
