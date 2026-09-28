import React, { useState } from 'react';
import { Link2, ArrowRight, RefreshCw, Copy, Check, RotateCcw } from 'lucide-react';

interface UrlInputBarProps {
  currentUrl: string;
  onApplyUrl: (url: string) => void;
  isLoading: boolean;
  statusMessage?: string;
  isCustomized: boolean;
  onResetToDefault: () => void;
}

export const UrlInputBar: React.FC<UrlInputBarProps> = ({
  currentUrl,
  onApplyUrl,
  isLoading,
  statusMessage,
  isCustomized,
  onResetToDefault,
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [copied, setCopied] = useState(false);

  // Sync internal state when external currentUrl updates
  React.useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      onResetToDefault();
      return;
    }
    onApplyUrl(inputValue.trim());
  };

  const handleCopy = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link2 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">
            Wikiru 所持トラッカー URL / ft共有コード
          </span>
          <a
            href="https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E6%89%80%E6%8C%81%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-1 ml-1"
          >
            <span>キャラクター所持トラッカーを開く</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          {(isCustomized || currentUrl || inputValue) && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                onResetToDefault();
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="入力をクリアして全員未所持に戻す"
            >
              <RotateCcw className="w-3 h-3" />
              <span>クリア（全員未所持に戻す）</span>
            </button>
          )}
          {currentUrl ? (
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">URLコピー完了</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>共有URLをコピー</span>
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://bluearchive.wikiru.jp/?キャラクター所持トラッカー&ft=... または ft共有コード"
            className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 font-mono tracking-tight outline-none transition-all pr-20"
          />
          {inputValue.trim() !== currentUrl.trim() && inputValue.trim().length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-amber-400 font-medium bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/60">
              未適用
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-cyan-900/40 transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>解析中...</span>
            </>
          ) : (
            <>
              <span>読み込み・反映</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {statusMessage && (
        <div className="mt-2.5 text-xs flex items-center gap-1.5 text-cyan-300/90 font-mono">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
