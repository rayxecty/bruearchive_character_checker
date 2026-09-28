import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  CircleDashed,
  Columns2,
  ListFilter,
  Layers,
  Target,
  ShoppingBag,
  Gift,
  Gem,
  Crown,
  Sparkles,
  Users,
  Edit3,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import { FilterState, OwnershipTab, SortKey, ElephFilter } from '../types';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  totalCount: number;
  ownedCount: number;
  unownedCount: number;
  availableSchools: string[];
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onRequestMarkAllOwned: () => void;
  onRequestMarkAllUnowned: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  totalCount,
  ownedCount,
  unownedCount,
  availableSchools,
  isEditMode,
  onToggleEditMode,
  onRequestMarkAllOwned,
  onRequestMarkAllUnowned,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const tabs: { key: OwnershipTab; label: string; count?: number; icon: React.ReactNode }[] = [
    {
      key: 'all',
      label: '全生徒',
      count: totalCount,
      icon: <ListFilter className="w-4 h-4" />,
    },
    {
      key: 'owned',
      label: '所持',
      count: ownedCount,
      icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />,
    },
    {
      key: 'unowned',
      label: '未所持',
      count: unownedCount,
      icon: <CircleDashed className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'split',
      label: '左右比較',
      icon: <Columns2 className="w-4 h-4 text-sky-400" />,
    },
  ];

  const rarities = ['all', '★3', '★2', '★1'];
  const attackTypes = [
    { key: 'all', label: '全タイプ' },
    { key: '爆発', label: '爆発', color: 'bg-red-950/80 text-red-300 border-red-700/60' },
    { key: '貫通', label: '貫通', color: 'bg-amber-950/80 text-amber-300 border-amber-700/60' },
    { key: '神秘', label: '神秘', color: 'bg-blue-950/80 text-blue-300 border-blue-700/60' },
    { key: '振動', label: '振動', color: 'bg-purple-950/80 text-purple-300 border-purple-700/60' },
  ];

  const defenseTypes = [
    { key: 'all', label: '全装甲' },
    { key: '軽装備', label: '軽装備', color: 'bg-red-950/60 text-red-300' },
    { key: '重装甲', label: '重装甲', color: 'bg-amber-950/60 text-amber-300' },
    { key: '特殊装甲', label: '特殊装甲', color: 'bg-blue-950/60 text-blue-300' },
    { key: '弾力装甲', label: '弾力装甲', color: 'bg-purple-950/60 text-purple-300' },
  ];

  const elephFilterOptions: { key: ElephFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'すべて', icon: null },
    {
      key: 'hard',
      label: '🎯 任務（Hard）ドロップ',
      icon: <Target className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      key: 'shops',
      label: '🏪 全ショップ交換可能',
      icon: <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      key: 'raid_total',
      label: '🏆 総力戦ショップ',
      icon: null,
    },
    {
      key: 'raid_grand',
      label: '⚔️ 大決戦ショップ',
      icon: null,
    },
    {
      key: 'shop_pvp',
      label: '🥊 戦術対抗戦ショップ',
      icon: null,
    },
    {
      key: 'shop_joint',
      label: '🔥 合同火力演習ショップ',
      icon: null,
    },
    {
      key: 'event',
      label: '🎁 イベント配布 / 常設化',
      icon: <Gift className="w-3.5 h-3.5 text-pink-400" />,
    },
    {
      key: 'gacha',
      label: '💎 募集限定（全体）',
      icon: <Gem className="w-3.5 h-3.5 text-slate-400" />,
    },
    {
      key: 'gacha_regular',
      label: '🔹 通常募集（恒常ガチャ）',
      icon: <Gem className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      key: 'gacha_anniv',
      label: '👑 フェス限定（周年・ハニバ）',
      icon: <Crown className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      key: 'gacha_recollect',
      label: '✨ リコレクト募集（過去フェス限定）',
      icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
    },
    {
      key: 'gacha_limited',
      label: '⏳ 期間限定募集',
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      key: 'gacha_collab',
      label: '🤝 コラボ限定募集',
      icon: <Users className="w-3.5 h-3.5 text-emerald-400" />,
    },
  ];

  const activeFiltersCount =
    (filters.rarity !== 'all' ? 1 : 0) +
    (filters.role !== 'all' ? 1 : 0) +
    (filters.attackType !== 'all' ? 1 : 0) +
    (filters.defenseType !== 'all' ? 1 : 0) +
    (filters.school !== 'all' ? 1 : 0) +
    (filters.elephFilter !== 'all' ? 1 : 0) +
    (filters.search.trim() ? 1 : 0);

  const resetFilters = () => {
    onFilterChange({
      search: '',
      rarity: 'all',
      role: 'all',
      attackType: 'all',
      defenseType: 'all',
      school: 'all',
      elephFilter: 'all',
      sortBy: 'eleph-method',
    });
  };

  return (
    <div className="space-y-3">
      {/* Primary Tab Navigation & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Ownership Segmented Tabs and Quick Edit Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ownership Segmented Tabs */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-inner">
            {tabs.map((tab) => {
              const isActive = filters.tab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    onFilterChange({
                      tab: tab.key,
                      // If switching to unowned tab, automatically prioritize eleph-method sorting
                      sortBy: tab.key === 'unowned' ? 'eleph-method' : filters.sortBy,
                    });
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm ring-1 ring-cyan-500/40 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Edit Mode & All Owned Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleEditMode}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer shadow-sm ${
                isEditMode
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border-cyan-300 shadow-cyan-500/30 ring-2 ring-cyan-400/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
              }`}
              title="生徒カードをクリックして所持・未所持を切り替えられる編集モード"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditMode ? '編集モード: ON' : '編集モード'}</span>
            </button>

            <button
              type="button"
              onClick={onRequestMarkAllOwned}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-slate-800 hover:border-cyan-800/60 transition-all cursor-pointer shadow-sm"
              title="全生徒を「所持」に設定（確認ダイアログが表示されます）"
            >
              <CheckCheck className="w-4 h-4 text-cyan-400" />
              <span>全員所持</span>
            </button>
          </div>
        </div>

        {/* Search, Sort & Options Controls */}
        <div className="flex items-center gap-2 flex-1 max-w-2xl">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="生徒名検索 (例: アル, イオリ, 水着)..."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={filters.sortBy}
              aria-label="並び替え順"
              onChange={(e) => onFilterChange({ sortBy: e.target.value as SortKey })}
              className={`bg-slate-900 border text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer appearance-none pr-8 font-medium ${
                filters.sortBy === 'eleph-method'
                  ? 'border-amber-600/70 text-amber-300 bg-amber-950/20'
                  : 'border-slate-800 text-slate-300 focus:border-cyan-400'
              }`}
            >
              <option value="eleph-method">✨ 神名文字の入手方法順 (Hard→ショップ→募集)</option>
              <option value="default">Wiki順 (デフォルト)</option>
              <option value="rarity-desc">レア度順 (★3→★1)</option>
              <option value="rarity-asc">レア度順 (★1→★3)</option>
              <option value="name-asc">名前順 (あいうえお)</option>
              <option value="attack">攻撃タイプ別</option>
              <option value="school">学園別</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Group by Eleph Toggle Button */}
          <button
            type="button"
            onClick={() => onFilterChange({ groupByEleph: !filters.groupByEleph })}
            title="神名文字入手先ごとにグループ化して表示"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              filters.groupByEleph
                ? 'bg-amber-950/70 border-amber-600/80 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>グループ表示</span>
          </button>

          {/* Toggle Advanced Filters Button */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
              showAdvanced || activeFiltersCount > 0
                ? 'bg-cyan-950/80 border-cyan-700/70 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">絞り込み</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Edit Mode Notification Banner */}
      {isEditMode && (
        <div className="bg-gradient-to-r from-cyan-950/80 via-blue-950/70 to-slate-900/90 border border-cyan-500/40 rounded-2xl p-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-lg shadow-cyan-950/30">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-cyan-200">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="font-bold text-white flex items-center gap-1">
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <span>編集モード作動中:</span>
            </span>
            <span className="text-cyan-200/90 text-xs sm:text-[13px]">
              生徒カードをクリックすると<strong>「所持」⇔「未所持」</strong>が即座に切り替わります。
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRequestMarkAllOwned}
              className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-700/80 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>全員所持にする</span>
            </button>
            <button
              type="button"
              onClick={onRequestMarkAllUnowned}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>全員未所持にする</span>
            </button>
            <button
              type="button"
              onClick={onToggleEditMode}
              className="text-xs px-3 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold transition-colors cursor-pointer"
            >
              完了
            </button>
          </div>
        </div>
      )}

      {/* Quick Filter Bar for Eleph Acquisition (神名文字の入手方法別クイックバー) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>神名文字入手先:</span>
        </span>
        <button
          type="button"
          onClick={() => onFilterChange({ elephFilter: 'all' })}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filters.elephFilter === 'all'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          すべて
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ elephFilter: 'hard' })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filters.elephFilter === 'hard'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm ring-1 ring-amber-400'
              : 'bg-slate-900 text-amber-300/80 border border-amber-900/60 hover:border-amber-700'
          }`}
        >
          <Target className="w-3 h-3" />
          <span>任務（Hard）ドロップ</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ elephFilter: 'shops' })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filters.elephFilter === 'shops'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-900 text-sky-300/80 border border-sky-900/60 hover:border-sky-700'
          }`}
        >
          <ShoppingBag className="w-3 h-3" />
          <span>ショップ交換可能 (全コイン)</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ elephFilter: 'event' })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filters.elephFilter === 'event'
              ? 'bg-pink-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-900 text-pink-300/80 border border-pink-900/60 hover:border-pink-700'
          }`}
        >
          <Gift className="w-3 h-3" />
          <span>イベント配布 / 常設化</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ elephFilter: 'gacha' })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filters.elephFilter === 'gacha'
              ? 'bg-slate-700 text-white font-bold shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <Gem className="w-3 h-3 text-slate-400" />
          <span>全募集限定</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ elephFilter: 'gacha_regular' })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filters.elephFilter === 'gacha_regular'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-slate-900 text-blue-300/80 border border-blue-900/60 hover:border-blue-700'
          }`}
        >
          <Gem className="w-3 h-3 text-blue-400" />
          <span>通常募集</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ elephFilter: 'gacha_anniv' })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filters.elephFilter === 'gacha_anniv'
              ? 'bg-amber-600 text-white font-bold shadow-sm ring-1 ring-amber-400'
              : 'bg-slate-900 text-amber-300/80 border border-amber-900/60 hover:border-amber-700'
          }`}
        >
          <Crown className="w-3 h-3 text-amber-400" />
          <span>フェス限定</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ elephFilter: 'gacha_recollect' })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filters.elephFilter === 'gacha_recollect'
              ? 'bg-rose-600 text-white font-bold shadow-sm ring-1 ring-rose-400'
              : 'bg-slate-900 text-rose-300/80 border border-rose-900/60 hover:border-rose-700'
          }`}
        >
          <Sparkles className="w-3 h-3 text-rose-400" />
          <span>リコレクト募集</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ elephFilter: 'gacha_limited' })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filters.elephFilter === 'gacha_limited'
              ? 'bg-purple-600 text-white font-bold shadow-sm'
              : 'bg-slate-900 text-purple-300/80 border border-purple-900/60 hover:border-purple-700'
          }`}
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>期間限定</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ elephFilter: 'gacha_collab' })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filters.elephFilter === 'gacha_collab'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'bg-slate-900 text-emerald-300/80 border border-emerald-900/60 hover:border-emerald-700'
          }`}
        >
          <Users className="w-3 h-3 text-emerald-400" />
          <span>コラボ限定</span>
        </button>
      </div>

      {/* Advanced Filter Collapsible Area */}
      {showAdvanced && (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 space-y-3.5 backdrop-blur transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              詳細フィルター
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>絞り込みをリセット</span>
              </button>
            )}
          </div>

          {/* Row 1: Rarity, Role, Eleph Method Detailed Select */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Rarity */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                初期レア度
              </label>
              <div className="flex gap-1.5">
                {rarities.map((r) => {
                  const isActive = filters.rarity === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onFilterChange({ rarity: r })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 ring-1 ring-cyan-500/30'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {r === 'all' ? '全て' : r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                部隊タイプ (役割)
              </label>
              <div className="flex gap-1.5">
                {[
                  { key: 'all', label: '全て' },
                  { key: 'STRIKER', label: 'STRIKER' },
                  { key: 'SPECIAL', label: 'SPECIAL' },
                ].map((role) => {
                  const isActive = filters.role === role.key;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => onFilterChange({ role: role.key })}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 ring-1 ring-cyan-500/30'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {role.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Eleph Method Select */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                神名文字の入手方法詳細
              </label>
              <select
                value={filters.elephFilter}
                onChange={(e) => onFilterChange({ elephFilter: e.target.value as ElephFilter })}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-cyan-400 cursor-pointer"
              >
                {elephFilterOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Attack & Defense Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Attack Types */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                攻撃タイプ
              </label>
              <div className="flex flex-wrap gap-1.5">
                {attackTypes.map((atk) => {
                  const isActive = filters.attackType === atk.key;
                  return (
                    <button
                      key={atk.key}
                      type="button"
                      onClick={() => onFilterChange({ attackType: atk.key })}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 text-slate-950 border-white font-bold'
                          : `${atk.color || 'bg-slate-950/60 text-slate-400 border-slate-800'}`
                      }`}
                    >
                      {atk.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Defense Types */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                防御タイプ
              </label>
              <div className="flex flex-wrap gap-1.5">
                {defenseTypes.map((def) => {
                  const isActive = filters.defenseType === def.key;
                  return (
                    <button
                      key={def.key}
                      type="button"
                      onClick={() => onFilterChange({ defenseType: def.key })}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 text-slate-950 border-white font-bold'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {def.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: School Dropdown */}
          <div className="pt-1">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              所属学園
            </label>
            <select
              value={filters.school}
              onChange={(e) => onFilterChange({ school: e.target.value })}
              className="w-full sm:w-72 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">全学園を表示</option>
              {availableSchools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
