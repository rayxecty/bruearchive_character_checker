import React, { useState, useMemo, useCallback } from 'react';
import {
  Character,
  FilterState,
  OwnershipTab,
  SortKey,
} from './types';
import {
  INITIAL_CHARACTERS,
  DEFAULT_SHARE_CODE,
  DEFAULT_WIKIRU_URL,
  decodeFtShare,
  encodeFtShare,
  buildWikiruUrl,
  extractFtCode,
} from './utils/tracker';
import { Header } from './components/Header';
import { TrackerGuideBanner } from './components/TrackerGuideBanner';
import { UrlInputBar } from './components/UrlInputBar';
import { FilterControls } from './components/FilterControls';
import { CharacterCard } from './components/CharacterCard';
import { SplitComparisonView } from './components/SplitComparisonView';
import { CharacterDetailModal } from './components/CharacterDetailModal';
import { StatsModal } from './components/StatsModal';
import { ExportModal } from './components/ExportModal';
import { ConfirmModal } from './components/ConfirmModal';
import {
  AlertCircle,
  Target,
  Trophy,
  Swords as SwordsIcon,
  Shield,
  Flame,
  Gift,
  Gem,
  Sparkles,
  Crown,
  Users,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
} from 'lucide-react';

export default function App() {
  const [characterList, setCharacterList] = useState<Character[]>(() => {
    return INITIAL_CHARACTERS.map((c) => ({
      ...c,
      isOwned: false,
    }));
  });

  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [currentShareCode, setCurrentShareCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isCustomized, setIsCustomized] = useState<boolean>(false);

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showMarkAllOwnedDialog, setShowMarkAllOwnedDialog] = useState<boolean>(false);
  const [showMarkAllUnownedDialog, setShowMarkAllUnownedDialog] = useState<boolean>(false);

  // Modals state
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    tab: 'unowned', // Focus on unowned by default to highlight Eleph acquisition sorting
    search: '',
    rarity: 'all',
    role: 'all',
    attackType: 'all',
    defenseType: 'all',
    school: 'all',
    classType: 'all',
    elephFilter: 'all',
    sortBy: 'eleph-method', // Sort by Eleph acquisition method by default
    groupByEleph: true, // Group by Eleph category by default
  });

  // Extract all distinct schools
  const availableSchools = useMemo(() => {
    const set = new Set<string>();
    characterList.forEach((c) => {
      if (c.school) set.add(c.school);
    });
    return Array.from(set).sort();
  }, [characterList]);

  // Total counts
  const totalCount = characterList.length;
  const ownedCount = useMemo(
    () => characterList.filter((c) => c.isOwned).length,
    [characterList]
  );
  const unownedCount = totalCount - ownedCount;

  // Apply new URL or ft code from Wiki
  const handleApplyUrl = async (inputStr: string) => {
    setIsLoading(true);
    setStatusMessage('');

    try {
      // First try calling backend API for live validation / extraction
      const ftParam = extractFtCode(inputStr);
      const res = await fetch(
        `/api/tracker?url=${encodeURIComponent(inputStr)}&ft=${encodeURIComponent(ftParam)}`
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.characters && data.characters.length > 0) {
          // Merge with enriched character data
          const serverOwnedMap: Record<string, boolean> = data.ownedMap || {};
          data.characters.forEach((c: any) => {
            if (c.imageKey) {
              serverOwnedMap[c.imageKey] = !!c.isOwned;
            }
          });

          const nextList = INITIAL_CHARACTERS.map((c) => ({
            ...c,
            isOwned: !!serverOwnedMap[c.imageKey],
          }));

          const actualOwned = nextList.filter((c) => c.isOwned).length;
          const actualUnowned = nextList.length - actualOwned;

          setCharacterList(nextList);
          const resolvedCode = data.ftCode || ftParam;
          setCurrentShareCode(resolvedCode);
          setCurrentUrl(
            inputStr.startsWith('http') ? inputStr : buildWikiruUrl(resolvedCode)
          );
          setIsCustomized(true);
          setStatusMessage(
            `Wikiから反映完了: 所持 ${actualOwned}名 / 未所持 ${actualUnowned}名`
          );
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Backend error fallback to local codec
    }

    // Client-side fallback codec
    const decoded = decodeFtShare(inputStr, INITIAL_CHARACTERS);
    if (decoded.status === 'broken') {
      setStatusMessage('共有コードの形式が不正です。Wikiの所持トラッカーURLをご確認ください。');
    } else {
      const nextList = INITIAL_CHARACTERS.map((c) => ({
        ...c,
        isOwned: !!decoded.ownedMap[c.imageKey],
      }));
      setCharacterList(nextList);
      const code = extractFtCode(inputStr);
      setCurrentShareCode(code);
      setCurrentUrl(inputStr.startsWith('http') ? inputStr : buildWikiruUrl(code));
      setIsCustomized(true);
      setStatusMessage(
        `読み込み完了: 所持 ${decoded.ownedCount}名 / 未所持 ${nextList.length - decoded.ownedCount}名`
      );
    }
    setIsLoading(false);
  };

  // Reset to default (all unowned and empty url)
  const handleResetToDefault = () => {
    const resetList = INITIAL_CHARACTERS.map((c) => ({
      ...c,
      isOwned: false,
    }));
    setCharacterList(resetList);
    setCurrentUrl('');
    setCurrentShareCode('');
    setIsCustomized(false);
    setStatusMessage('所持状況をリセットしました（全員未所持）');
  };

  // Helper to generate share code from character list
  const generateShareCodeForList = useCallback((list: Character[]): string => {
    const ownedMap: Record<string, boolean> = {};
    list.forEach((c) => {
      ownedMap[c.imageKey] = !!c.isOwned;
    });
    return encodeFtShare(ownedMap, list);
  }, []);

  // Toggle single character ownership
  const handleToggleOwnership = useCallback((char: Character) => {
    setCharacterList((prev) => {
      const updated = prev.map((c) =>
        c.id === char.id ? { ...c, isOwned: !c.isOwned } : c
      );
      const code = generateShareCodeForList(updated);
      setCurrentShareCode(code);
      setCurrentUrl(buildWikiruUrl(code));
      setIsCustomized(true);
      return updated;
    });

    setSelectedCharacter((prev) => {
      if (prev && prev.id === char.id) {
        return { ...prev, isOwned: !prev.isOwned };
      }
      return prev;
    });
  }, [generateShareCodeForList]);

  // Confirm Mark All Owned
  const handleConfirmMarkAllOwned = useCallback(() => {
    const updated = characterList.map((c) => ({ ...c, isOwned: true }));
    setCharacterList(updated);
    const code = generateShareCodeForList(updated);
    setCurrentShareCode(code);
    setCurrentUrl(buildWikiruUrl(code));
    setIsCustomized(true);
    setStatusMessage('全生徒を「所持」に設定しました');
    setShowMarkAllOwnedDialog(false);
  }, [characterList, generateShareCodeForList]);

  // Confirm Mark All Unowned
  const handleConfirmMarkAllUnowned = useCallback(() => {
    const updated = characterList.map((c) => ({ ...c, isOwned: false }));
    setCharacterList(updated);
    setCurrentShareCode('');
    setCurrentUrl('');
    setIsCustomized(false);
    setStatusMessage('全生徒を「未所持」にリセットしました');
    setShowMarkAllUnownedDialog(false);
  }, [characterList]);

  // Update filter helper
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Helper to parse lowest Hard stage number for stage-order sorting
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

  // Filtered and sorted character list
  const filteredCharacters = useMemo(() => {
    let list = characterList.slice();

    // Tab filter
    if (filters.tab === 'owned') {
      list = list.filter((c) => c.isOwned);
    } else if (filters.tab === 'unowned') {
      list = list.filter((c) => !c.isOwned);
    }

    // Eleph Method Filter
    if (filters.elephFilter !== 'all') {
      switch (filters.elephFilter) {
        case 'hard':
          list = list.filter((c) => c.elephCategory === 'hard');
          break;
        case 'shops':
          list = list.filter(
            (c) =>
              c.elephCategory === 'raid_total' ||
              c.elephCategory === 'raid_grand' ||
              c.elephCategory === 'shop_pvp' ||
              c.elephCategory === 'shop_joint'
          );
          break;
        case 'raid_total':
          list = list.filter((c) => c.elephCategory === 'raid_total');
          break;
        case 'raid_grand':
          list = list.filter((c) => c.elephCategory === 'raid_grand');
          break;
        case 'shop_pvp':
          list = list.filter((c) => c.elephCategory === 'shop_pvp');
          break;
        case 'shop_joint':
          list = list.filter((c) => c.elephCategory === 'shop_joint');
          break;
        case 'event':
          list = list.filter((c) => c.elephCategory === 'event');
          break;
        case 'gacha':
          list = list.filter((c) => c.elephCategory?.startsWith('gacha'));
          break;
        case 'gacha_regular':
          list = list.filter((c) => c.elephCategory === 'gacha_regular');
          break;
        case 'gacha_anniv':
          list = list.filter((c) => c.elephCategory === 'gacha_anniv');
          break;
        case 'gacha_limited':
          list = list.filter((c) => c.elephCategory === 'gacha_limited');
          break;
        case 'gacha_collab':
          list = list.filter((c) => c.elephCategory === 'gacha_collab');
          break;
      }
    }

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.school.toLowerCase().includes(q) ||
          (c.hardStages && c.hardStages.some((st) => st.toLowerCase().includes(q))) ||
          (c.elephMethodLabel && c.elephMethodLabel.toLowerCase().includes(q))
      );
    }

    // Rarity filter
    if (filters.rarity !== 'all') {
      list = list.filter((c) => c.rarity === filters.rarity);
    }

    // Role filter
    if (filters.role !== 'all') {
      list = list.filter((c) => c.role === filters.role);
    }

    // Attack Type
    if (filters.attackType !== 'all') {
      list = list.filter((c) => c.attackType === filters.attackType);
    }

    // Defense Type
    if (filters.defenseType !== 'all') {
      list = list.filter((c) => c.defenseType === filters.defenseType);
    }

    // School
    if (filters.school !== 'all') {
      list = list.filter((c) => c.school === filters.school);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'eleph-method':
        list.sort((a, b) => {
          const pA = a.elephMethodPriority ?? 99;
          const pB = b.elephMethodPriority ?? 99;
          if (pA !== pB) return pA - pB;

          // If both are Hard missions, sort by earliest stage (H1 -> H30)
          if (a.elephCategory === 'hard' && b.elephCategory === 'hard') {
            const diff = parseMinHardStage(a.hardStages) - parseMinHardStage(b.hardStages);
            if (diff !== 0) return diff;
          }

          // Secondary sort: rarity desc (★3 -> ★2 -> ★1)
          if (a.rarity !== b.rarity) return b.rarity.localeCompare(a.rarity);

          // Tertiary sort: name in Japanese
          return a.name.localeCompare(b.name, 'ja');
        });
        break;
      case 'rarity-desc':
        list.sort((a, b) => b.rarity.localeCompare(a.rarity));
        break;
      case 'rarity-asc':
        list.sort((a, b) => a.rarity.localeCompare(b.rarity));
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        break;
      case 'attack':
        list.sort((a, b) => a.attackType.localeCompare(b.attackType, 'ja'));
        break;
      case 'school':
        list.sort((a, b) => a.school.localeCompare(b.school, 'ja'));
        break;
      default:
        // default Wiki order preserved
        break;
    }

    return list;
  }, [characterList, filters]);

  // Grouped characters by Eleph Acquisition Method
  const groupedCharacters = useMemo(() => {
    if (!filters.groupByEleph || filters.sortBy !== 'eleph-method') {
      return null;
    }

    const groups: {
      category: string;
      title: string;
      badgeText: string;
      badgeClass: string;
      icon: React.ReactNode;
      description: string;
      characters: Character[];
    }[] = [
      {
        category: 'hard',
        title: '任務（Hard）ドロップ',
        badgeText: 'デイリー周回で受入可能',
        badgeClass: 'bg-amber-950 text-amber-300 border-amber-700/80',
        icon: <Target className="w-4 h-4 text-amber-400" />,
        description: '毎日Hardステージを周回して神名文字を集めることで、ガチャを引かずに無課金で受入・加入させることができます。',
        characters: [],
      },
      {
        category: 'raid_total',
        title: '総力戦ショップ',
        badgeText: '総力戦コイン交換',
        badgeClass: 'bg-purple-950 text-purple-300 border-purple-700/80',
        icon: <Trophy className="w-4 h-4 text-purple-400" />,
        description: '総力戦コイン・レアコインで毎月神名文字を交換して受入・加入させることができます。',
        characters: [],
      },
      {
        category: 'raid_grand',
        title: '大決戦ショップ',
        badgeText: '大決戦コイン交換',
        badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-700/80',
        icon: <SwordsIcon className="w-4 h-4 text-cyan-400" />,
        description: '大決戦コイン・レアコインで毎月神名文字を交換して受入・加入させることができます。',
        characters: [],
      },
      {
        category: 'shop_pvp',
        title: '戦術対抗戦ショップ',
        badgeText: '戦術コイン交換',
        badgeClass: 'bg-rose-950 text-rose-300 border-rose-700/80',
        icon: <Shield className="w-4 h-4 text-rose-400" />,
        description: '戦術対抗戦のコインで神名文字を交換して受入・加入させることができます。',
        characters: [],
      },
      {
        category: 'shop_joint',
        title: '合同火力演習ショップ',
        badgeText: '火力演習コイン交換',
        badgeClass: 'bg-orange-950 text-orange-300 border-orange-700/80',
        icon: <Flame className="w-4 h-4 text-orange-400" />,
        description: '合同火力演習コインで毎月神名文字を交換して受入・加入させることができます。',
        characters: [],
      },
      {
        category: 'event',
        title: 'イベント配布 / 常設化',
        badgeText: 'イベント報酬',
        badgeClass: 'bg-pink-950 text-pink-300 border-pink-700/80',
        icon: <Gift className="w-4 h-4 text-pink-400" />,
        description: 'イベントストーリーのクリア報酬やイベント常設化コンテンツで受入・加入可能です。',
        characters: [],
      },
      {
        category: 'gacha_regular',
        title: '通常募集（恒常ガチャ）',
        badgeText: '通常募集・すり抜け可能',
        badgeClass: 'bg-blue-950 text-blue-300 border-blue-700/80',
        icon: <Gem className="w-4 h-4 text-blue-400" />,
        description: '神名文字の恒常入手先はありませんが、ピックアップ募集のすり抜けや通常募集・各種チケットでいつでも受入チャンスがあります。',
        characters: [],
      },
      {
        category: 'gacha_anniv',
        title: 'フェス限定（周年・ハニバ）',
        badgeText: '★3確率2倍フェス限定',
        badgeClass: 'bg-amber-950 text-amber-300 border-amber-500/80',
        icon: <Crown className="w-4 h-4 text-amber-400" />,
        description: '0.5周年や周年記念の「フェス限定募集（★3排出率2倍）」でのみピックアップ・排出される強力な生徒たちです。',
        characters: [],
      },
      {
        category: 'gacha_limited',
        title: '期間限定募集（季節・イベント）',
        badgeText: '期間限定・復刻時のみ',
        badgeClass: 'bg-purple-950 text-purple-300 border-purple-600/80',
        icon: <Sparkles className="w-4 h-4 text-purple-400" />,
        description: '正月・バレンタイン・水着・ドレスなど、該当の期間限定イベント募集でのみ排出されます（復刻開催時に獲得可能）。',
        characters: [],
      },
      {
        category: 'gacha_collab',
        title: 'コラボ限定募集',
        badgeText: 'コラボ限定（復刻未定）',
        badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-600/80',
        icon: <Users className="w-4 h-4 text-emerald-400" />,
        description: '他作品（レールガン・初音ミクなど）とのコラボ募集限定生徒です。コラボ期間外は排出されず復刻も不定期です。',
        characters: [],
      },
    ];

    filteredCharacters.forEach((char) => {
      switch (char.elephCategory) {
        case 'hard':
          groups[0].characters.push(char);
          break;
        case 'raid_total':
          groups[1].characters.push(char);
          break;
        case 'raid_grand':
          groups[2].characters.push(char);
          break;
        case 'shop_pvp':
          groups[3].characters.push(char);
          break;
        case 'shop_joint':
          groups[4].characters.push(char);
          break;
        case 'event':
          groups[5].characters.push(char);
          break;
        case 'gacha_regular':
          groups[6].characters.push(char);
          break;
        case 'gacha_anniv':
          groups[7].characters.push(char);
          break;
        case 'gacha_limited':
          groups[8].characters.push(char);
          break;
        case 'gacha_collab':
          groups[9].characters.push(char);
          break;
        default:
          groups[6].characters.push(char);
          break;
      }
    });

    return groups.filter((g) => g.characters.length > 0);
  }, [filteredCharacters, filters.groupByEleph, filters.sortBy]);

  // Collapsed sections state for Eleph acquisition groups (all expanded by default)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = useCallback((category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const handleExpandAll = useCallback(() => {
    setCollapsedCategories({});
  }, []);

  const handleCollapseAll = useCallback(() => {
    if (!groupedCharacters) return;
    const next: Record<string, boolean> = {};
    groupedCharacters.forEach((g) => {
      next[g.category] = true;
    });
    setCollapsedCategories(next);
  }, [groupedCharacters]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Header */}
      <Header
        totalCount={totalCount}
        ownedCount={ownedCount}
        unownedCount={unownedCount}
        currentWikiruUrl={currentUrl}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Wiki Onboarding Guide Banner */}
        <TrackerGuideBanner />

        {/* Top Wikiru URL Input Bar */}
        <UrlInputBar
          currentUrl={currentUrl}
          onApplyUrl={handleApplyUrl}
          isLoading={isLoading}
          statusMessage={statusMessage}
          isCustomized={isCustomized}
          onResetToDefault={handleResetToDefault}
        />

        {/* Filters and Tab Navigation */}
        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          totalCount={totalCount}
          ownedCount={ownedCount}
          unownedCount={unownedCount}
          availableSchools={availableSchools}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode((prev) => !prev)}
          onRequestMarkAllOwned={() => setShowMarkAllOwnedDialog(true)}
          onRequestMarkAllUnowned={() => setShowMarkAllUnownedDialog(true)}
        />

        {/* Content View: Split View vs Standard Grid */}
        {filters.tab === 'split' ? (
          <SplitComparisonView
            characters={characterList}
            onViewDetails={(c) => setSelectedCharacter(c)}
            isEditMode={isEditMode}
            onToggleOwnership={handleToggleOwnership}
          />
        ) : (
          <div className="space-y-4">
            {/* View info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 px-1 gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span>表示生徒:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {filteredCharacters.length}
                </span>
                <span>/ {totalCount} 名</span>
                {filters.sortBy === 'eleph-method' && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold">
                    ✨ 神名文字の入手方法順
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {groupedCharacters && (
                  <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={handleExpandAll}
                      className="px-2.5 py-1 rounded-lg hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
                      title="すべての入手方法グループを展開"
                    >
                      <ChevronsDown className="w-3.5 h-3.5 text-cyan-400" />
                      <span>すべて展開</span>
                    </button>
                    <span className="text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={handleCollapseAll}
                      className="px-2.5 py-1 rounded-lg hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                      title="すべての入手方法グループを折りたたむ"
                    >
                      <ChevronsUp className="w-3.5 h-3.5 text-slate-400" />
                      <span>すべて折りたたむ</span>
                    </button>
                  </div>
                )}
                <span className="text-[11px] text-slate-400 hidden xl:inline">
                  カードをクリックすると生徒の詳細と神名文字の入手ステージを確認できます
                </span>
              </div>
            </div>

            {/* Zero State */}
            {filteredCharacters.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                <AlertCircle className="w-10 h-10 text-slate-500 mb-3" />
                <h3 className="text-base font-bold text-slate-200">
                  条件に一致する生徒が見つかりませんでした
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  検索ワードや絞り込み条件（神名文字入手先、レア度、タイプ、所属学園）を緩めてみてください。
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      tab: 'all',
                      search: '',
                      rarity: 'all',
                      role: 'all',
                      attackType: 'all',
                      defenseType: 'all',
                      school: 'all',
                      classType: 'all',
                      elephFilter: 'all',
                      sortBy: 'eleph-method',
                      groupByEleph: true,
                    })
                  }
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  絞り込みをリセットする
                </button>
              </div>
            ) : groupedCharacters ? (
              /* Grouped View by Eleph Acquisition Method */
              <div className="space-y-4">
                {groupedCharacters.map((group) => {
                  const isCollapsed = !!collapsedCategories[group.category];
                  return (
                    <section
                      key={group.category}
                      className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm transition-all duration-200"
                    >
                      {/* Group Header (Clickable to toggle collapse) */}
                      <button
                        type="button"
                        onClick={() => toggleCategoryCollapse(group.category)}
                        className="w-full text-left p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors cursor-pointer select-none group/header focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                        aria-expanded={!isCollapsed}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 shadow-sm shrink-0 group-hover/header:border-slate-600 transition-colors">
                            {group.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover/header:text-cyan-300 transition-colors">
                                {group.title}
                              </h2>
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-800/60">
                                {group.characters.length}名
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border hidden md:inline ${group.badgeClass}`}
                              >
                                {group.badgeText}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-1 sm:line-clamp-none">
                              {group.description}
                            </p>
                          </div>
                        </div>

                        {/* Toggle Collapse Indicator */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center ml-auto pl-2">
                          <span className="text-[11px] font-medium text-slate-400 group-hover/header:text-slate-200 hidden sm:inline">
                            {isCollapsed ? '展開する' : '折りたたむ'}
                          </span>
                          <div
                            className={`w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover/header:text-cyan-300 group-hover/header:border-cyan-700 transition-transform duration-200 ${
                              isCollapsed ? '' : 'rotate-180'
                            }`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </button>

                      {/* Group Grid (Shown only when expanded) */}
                      {!isCollapsed && (
                        <div className="p-3.5 sm:p-4.5 pt-1 border-t border-slate-800/70">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {group.characters.map((char) => (
                              <CharacterCard
                                key={char.id}
                                character={char}
                                onViewDetails={(c) => setSelectedCharacter(c)}
                                isEditMode={isEditMode}
                                onToggleOwnership={handleToggleOwnership}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            ) : (
              /* Flat Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredCharacters.map((char) => (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    onViewDetails={(c) => setSelectedCharacter(c)}
                    isEditMode={isEditMode}
                    onToggleOwnership={handleToggleOwnership}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Blue Archive Student Ownership &amp; Eleph Tracker</span>
          <span className="text-[11px] text-slate-600">
            データ出典:{' '}
            <a
              href="https://bluearchive.wikiru.jp/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-300 underline"
            >
              ブルーアーカイブ（ブルアカ）攻略 Wiki
            </a>
          </span>
        </div>
      </footer>

      {/* Modals */}
      <CharacterDetailModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        onToggleOwnership={handleToggleOwnership}
      />

      <StatsModal
        characters={characterList}
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <ExportModal
        characters={characterList}
        shareUrl={currentUrl}
        shareCode={currentShareCode}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Confirm All Owned Dialog */}
      <ConfirmModal
        isOpen={showMarkAllOwnedDialog}
        title="全員を「所持」にしますか？"
        description={`全生徒（${totalCount}名）の所持ステータスを一括で「所持」に更新します。現在の所持状況は上書きされます。よろしいですか？`}
        confirmText="全員所持にする"
        cancelText="キャンセル"
        variant="primary"
        onConfirm={handleConfirmMarkAllOwned}
        onCancel={() => setShowMarkAllOwnedDialog(false)}
      />

      {/* Confirm All Unowned Dialog */}
      <ConfirmModal
        isOpen={showMarkAllUnownedDialog}
        title="全員を「未所持」にしますか？"
        description={`全生徒（${totalCount}名）の所持ステータスを一括で「未所持」にリセットします。よろしいですか？`}
        confirmText="全員未所持にする"
        cancelText="キャンセル"
        variant="danger"
        onConfirm={handleConfirmMarkAllUnowned}
        onCancel={() => setShowMarkAllUnownedDialog(false)}
      />
    </div>
  );
}
