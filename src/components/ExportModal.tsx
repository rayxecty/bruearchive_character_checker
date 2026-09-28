import React, { useState, useMemo } from 'react';
import { X, Copy, Check, Download, Share2, FileText, ExternalLink } from 'lucide-react';
import { Character } from '../types';
import { encodeFtShare, buildWikiruUrl } from '../utils/tracker';

interface ExportModalProps {
  characters: Character[];
  shareUrl: string;
  shareCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  characters,
  shareUrl,
  shareCode,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const effectiveShareUrl = useMemo(() => {
    if (shareUrl) return shareUrl;
    const ownedMap: Record<string, boolean> = {};
    characters.forEach((c) => {
      if (c.isOwned) ownedMap[c.imageKey] = true;
    });
    const code = encodeFtShare(ownedMap, characters);
    return buildWikiruUrl(code);
  }, [shareUrl, characters]);

  const owned = characters.filter((c) => c.isOwned);
  const unowned = characters.filter((c) => !c.isOwned);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const getOwnedNamesText = () => {
    return `【ブルーアーカイブ 所持生徒一覧 (${owned.length}名)】\n` + owned.map((c) => `${c.name} (${c.rarity})`).join('\n');
  };

  const getUnownedNamesText = () => {
    return `【ブルーアーカイブ 未所持生徒一覧 (${unowned.length}名)】\n` + unowned.map((c) => `${c.name} (${c.rarity})`).join('\n');
  };

  const downloadCsv = () => {
    const headers = ['生徒名', 'レア度', '部隊', 'クラス', '攻撃タイプ', '防御タイプ', '所属学園', '所持状況'];
    const rows = characters.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.rarity}"`,
      `"${c.role}"`,
      `"${c.classType || ''}"`,
      `"${c.attackType || ''}"`,
      `"${c.defenseType || ''}"`,
      `"${c.school || ''}"`,
      c.isOwned ? '"所持"' : '"未所持"',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `blue_archive_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">共有 & エクスポート</h3>
              <p className="text-xs text-slate-400">
                所持 {owned.length}名 / 未所持 {unowned.length}名 のデータを書き出し
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="モーダルを閉じる"
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Section 1: Wikiru Link */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <label className="font-bold text-slate-200 block mb-1.5 text-sm">
              更新済み Wikiru 共有URL
            </label>
            <p className="text-slate-400 text-[11px] mb-2.5">
              現在の所持状態が反映された公式Wiki互換のURLです。クリックで直接Wikiを開くこともできます。
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={effectiveShareUrl}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono text-xs select-all outline-none"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(effectiveShareUrl, 'url')}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
              >
                {copiedKey === 'url' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'url' ? '済' : 'コピー'}</span>
              </button>
              <a
                href={effectiveShareUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all shrink-0"
                title="Wikiruで確認"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Section 2: Text Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Owned text copy */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>所持生徒テキスト一覧</span>
                </h4>
                <p className="text-slate-400 text-[11px] mt-1">
                  所持している {owned.length} 名の生徒名リストをコピーします
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(getOwnedNamesText(), 'owned-names')}
                className="mt-3.5 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedKey === 'owned-names' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">コピーしました</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>所持リストをコピー</span>
                  </>
                )}
              </button>
            </div>

            {/* Unowned text copy */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>未所持生徒テキスト一覧</span>
                </h4>
                <p className="text-slate-400 text-[11px] mt-1">
                  未所持の {unowned.length} 名の生徒名リストをコピーします
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(getUnownedNamesText(), 'unowned-names')}
                className="mt-3.5 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedKey === 'unowned-names' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">コピーしました</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>未所持リストをコピー</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 3: CSV Download */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                <Download className="w-4 h-4 text-sky-400" />
                <span>CSVデータ出力</span>
              </h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                全生徒の属性（レア度、属性、所属、所持状況）をCSVファイルとしてダウンロード
              </p>
            </div>
            <button
              type="button"
              onClick={downloadCsv}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>CSV保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
