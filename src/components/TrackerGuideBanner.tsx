import React from 'react';
import { ExternalLink, Sparkles, CheckCircle2, ArrowRight, Target } from 'lucide-react';

const TRACKER_BASE_URL =
  'https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E6%89%80%E6%8C%81%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC';

export const TrackerGuideBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-cyan-950/70 via-slate-900 to-sky-950/60 border border-cyan-800/60 rounded-3xl p-5 sm:p-6 shadow-lg shadow-cyan-950/20 backdrop-blur-sm">
      {/* Background glowing ambient light */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>はじめにお読みください</span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            所持状況を反映するには、まずWikiで共有URLを作成してください
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            はじめに、ブルーアーカイブ攻略Wikiの「
            <a
              href={TRACKER_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:text-cyan-200 underline font-bold inline-flex items-center gap-0.5 group"
            >
              <span>キャラクター所持トラッカー</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
            」にてご自身の所持生徒を選択し、生成された共有URL（
            <code className="text-cyan-200 font-mono text-[11px] bg-slate-900/80 px-1 py-0.5 rounded border border-slate-800">
              &amp;ft=...
            </code>
            ）を下部の入力欄に貼り付けて「読み込み・反映」してください。
          </p>

          {/* 3 Step Visual Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs font-black shrink-0">
                1
              </span>
              <div className="text-[11px]">
                <p className="font-bold text-slate-200">Wikiで所持生徒を選択</p>
                <p className="text-slate-400 mt-0.5">
                  <a
                    href={TRACKER_BASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    キャラクター所持トラッカー
                  </a>
                  を開く
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs font-black shrink-0">
                2
              </span>
              <div className="text-[11px]">
                <p className="font-bold text-slate-200">共有URLをコピー</p>
                <p className="text-slate-400 mt-0.5">Wiki下部で「共有URL作成」を押す</p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs font-black shrink-0">
                3
              </span>
              <div className="text-[11px]">
                <p className="font-bold text-slate-200">神名文字入手先を確認</p>
                <p className="text-slate-400 mt-0.5">未所持生徒を入手手段別にチェック</p>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Action Button */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2 justify-center">
          <a
            href={TRACKER_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all text-center group cursor-pointer whitespace-nowrap"
          >
            <span>キャラクター所持トラッカー</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <span className="text-[11px] text-slate-400 text-center lg:text-right">
            ※ 別タブで公式Wikiが開きます
          </span>
        </div>
      </div>
    </div>
  );
};
