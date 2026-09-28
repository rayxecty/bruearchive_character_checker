import React, { useState, useMemo } from 'react';
import { Character } from '../types';
import { CharacterCard } from './CharacterCard';
import { CheckCircle2, CircleDashed, Search, ArrowUpDown, Target, Sparkles } from 'lucide-react';

interface SplitComparisonViewProps {
  characters: Character[];
  onViewDetails: (character: Character) => void;
  isEditMode?: boolean;
  onToggleOwnership?: (character: Character) => void;
}

export const SplitComparisonView: React.FC<SplitComparisonViewProps> = ({
  characters,
  onViewDetails,
  isEditMode = false,
  onToggleOwnership,
}) => {
  const [ownedSearch, setOwnedSearch] = useState('');
  const [unownedSearch, setUnownedSearch] = useState('');
  const [unownedSort, setUnownedSort] = useState<'eleph' | 'rarity' | 'name'>('eleph');

  // Hard stage order helper
  const parseMinHardStage = (stages?: string[]): number => {
    if (!stages || stages.length === 0) return 9999;
    let min = 9999;
    for (const s of stages) {
      const match = s.match(/H(\d+)-(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10) * 10 + parseInt(match[2], 10);
        if (val < min) min = val;
      }
    }
    return min;
  };

  const ownedList = useMemo(() => {
    return characters.filter(
      (c) => c.isOwned && (!ownedSearch || c.name.toLowerCase().includes(ownedSearch.toLowerCase()))
    );
  }, [characters, ownedSearch]);

  const unownedList = useMemo(() => {
    const list = characters.filter(
      (c) => !c.isOwned && (!unownedSearch || c.name.toLowerCase().includes(unownedSearch.toLowerCase()))
    );

    if (unownedSort === 'eleph') {
      list.sort((a, b) => {
        const pA = a.elephMethodPriority ?? 99;
        const pB = b.elephMethodPriority ?? 99;
        if (pA !== pB) return pA - pB;

        // If both are Hard missions, sort by earliest stage
        if (a.elephCategory === 'hard' && b.elephCategory === 'hard') {
          return parseMinHardStage(a.hardStages) - parseMinHardStage(b.hardStages);
        }

        // Secondary by rarity
        if (a.rarity !== b.rarity) return b.rarity.localeCompare(a.rarity);
        return a.name.localeCompare(b.name, 'ja');
      });
    } else if (unownedSort === 'rarity') {
      list.sort((a, b) => b.rarity.localeCompare(a.rarity));
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    }

    return list;
  }, [characters, unownedSearch, unownedSort]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* LEFT COLUMN: 所持 (Owned) */}
      <div className="bg-slate-900/70 border border-cyan-900/50 rounded-2xl p-4 sm:p-5 flex flex-col h-[calc(100vh-280px)] min-h-[550px] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>所持生徒</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  {ownedList.length}名
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">クリックで生徒詳細を表示</p>
            </div>
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ownedSearch}
              onChange={(e) => setOwnedSearch(e.target.value)}
              placeholder="所持生徒を検索..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Owned Grid */}
        <div className="flex-1 overflow-y-auto pr-1 pt-3">
          {ownedList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-8">
              <p>所持している生徒がありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {ownedList.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onViewDetails={onViewDetails}
                  compact={false}
                  isEditMode={isEditMode}
                  onToggleOwnership={onToggleOwnership}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: 未所持 (Unowned - Sorted by Eleph Acquisition) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col h-[calc(100vh-280px)] min-h-[550px] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/60">
              <CircleDashed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>未所持生徒</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {unownedList.length}名
                </span>
              </h2>
              <p className="text-[11px] text-amber-300/80 font-medium">
                神名文字の入手方法順 (Hard ➔ 各種ショップ ➔ 募集)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort selector for unowned */}
            <select
              value={unownedSort}
              aria-label="未所持生徒の並び替え"
              onChange={(e) => setUnownedSort(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-[11px] font-medium text-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="eleph">入手方法別 (Hard優先)</option>
              <option value="rarity">レア度順</option>
              <option value="name">五十音順</option>
            </select>

            <div className="relative w-full sm:w-40">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={unownedSearch}
                onChange={(e) => setUnownedSearch(e.target.value)}
                placeholder="未所持を検索..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Unowned Grid */}
        <div className="flex-1 overflow-y-auto pr-1 pt-3">
          {unownedList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-8">
              <Sparkles className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="font-bold text-slate-300">すべての生徒を所持しています！</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {unownedList.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onViewDetails={onViewDetails}
                  compact={false}
                  isEditMode={isEditMode}
                  onToggleOwnership={onToggleOwnership}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
