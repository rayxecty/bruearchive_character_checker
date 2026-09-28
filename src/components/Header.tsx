import React from 'react';
import { Sparkles, PieChart, Share2, ExternalLink, ShieldCheck, UserX } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  ownedCount: number;
  unownedCount: number;
  currentWikiruUrl: string;
  onOpenStats: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  ownedCount,
  unownedCount,
  currentWikiruUrl,
  onOpenStats,
  onOpenExport,
}) => {
  const percentage = totalCount > 0 ? ((ownedCount / totalCount) * 100).toFixed(1) : '0.0';

  return (
    <header className="border-b border-cyan-900/40 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-300/30">
              <Sparkles className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-wider font-semibold uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  SCHALE TRACKER
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">Blue Archive</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                生徒所持トラッカー
              </h1>
            </div>
          </div>

          {/* Ownership Stats & Actions */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between md:justify-end">
            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>所持:</span>
                <span className="font-bold text-cyan-300 font-mono text-sm">{ownedCount}</span>
              </div>
              <span className="text-slate-700">/</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <UserX className="w-4 h-4 text-slate-500" />
                <span>未所持:</span>
                <span className="font-bold text-slate-300 font-mono text-sm">{unownedCount}</span>
              </div>
              <span className="text-slate-700">/</span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">率:</span>
                <span className="font-bold font-mono text-sm bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenStats}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 rounded-lg transition-all hover:border-cyan-500/40 cursor-pointer"
                title="詳細統計グラフ"
              >
                <PieChart className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">統計</span>
              </button>

              <button
                type="button"
                onClick={onOpenExport}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 border border-cyan-400/30 rounded-lg shadow-sm shadow-cyan-900/30 transition-all cursor-pointer"
                title="共有・エクスポート"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>共有 / 出力</span>
              </button>

              <a
                href={
                  currentWikiruUrl ||
                  'https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E6%89%80%E6%8C%81%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC'
                }
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
                title="Wikiruで開く"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Wiki</span>
              </a>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-2.5 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(56,189,248,0.7)]"
            style={{ width: `${Math.min(100, parseFloat(percentage))}%` }}
          />
        </div>
      </div>
    </header>
  );
};
