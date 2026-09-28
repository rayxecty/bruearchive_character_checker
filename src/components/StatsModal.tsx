import React from 'react';
import {
  X,
  Trophy,
  PieChart,
  Target,
  ShoppingBag,
  Gift,
  Gem,
  Swords as SwordsIcon,
  Shield,
  Flame,
  Crown,
  Sparkles,
  Users,
} from 'lucide-react';
import { Character } from '../types';

interface StatsModalProps {
  characters: Character[];
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ characters, isOpen, onClose }) => {
  if (!isOpen) return null;

  const total = characters.length;
  const ownedTotal = characters.filter((c) => c.isOwned).length;
  const overallRate = total > 0 ? ((ownedTotal / total) * 100).toFixed(1) : '0.0';

  // Eleph Method Stats
  const elephCategories = [
    {
      key: 'hard',
      label: '任務（Hard）ドロップ',
      icon: <Target className="w-3.5 h-3.5 text-amber-400" />,
      color: 'bg-amber-500',
    },
    {
      key: 'raid_total',
      label: '総力戦ショップ',
      icon: <Trophy className="w-3.5 h-3.5 text-purple-400" />,
      color: 'bg-purple-500',
    },
    {
      key: 'raid_grand',
      label: '大決戦ショップ',
      icon: <SwordsIcon className="w-3.5 h-3.5 text-cyan-400" />,
      color: 'bg-cyan-500',
    },
    {
      key: 'shop_pvp',
      label: '戦術対抗戦ショップ',
      icon: <Shield className="w-3.5 h-3.5 text-rose-400" />,
      color: 'bg-rose-500',
    },
    {
      key: 'shop_joint',
      label: '合同火力演習ショップ',
      icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
      color: 'bg-orange-500',
    },
    {
      key: 'event',
      label: 'イベント配布 / 常設化',
      icon: <Gift className="w-3.5 h-3.5 text-pink-400" />,
      color: 'bg-pink-500',
    },
    {
      key: 'gacha_regular',
      label: '通常募集（恒常ガチャ）',
      icon: <Gem className="w-3.5 h-3.5 text-blue-400" />,
      color: 'bg-blue-500',
    },
    {
      key: 'gacha_anniv',
      label: 'フェス限定（周年・ハニバ）',
      icon: <Crown className="w-3.5 h-3.5 text-amber-400" />,
      color: 'bg-amber-500',
    },
    {
      key: 'gacha_recollect',
      label: 'リコレクト募集（過去フェス限定）',
      icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
      color: 'bg-rose-500',
    },
    {
      key: 'gacha_limited',
      label: '期間限定募集',
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
      color: 'bg-purple-500',
    },
    {
      key: 'gacha_collab',
      label: 'コラボ限定募集',
      icon: <Users className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'bg-emerald-500',
    },
  ];

  const elephStats = elephCategories.map((cat) => {
    let list: Character[] = [];
    if (cat.key === 'gacha') {
      list = characters.filter((c) => c.elephCategory?.startsWith('gacha'));
    } else {
      list = characters.filter((c) => c.elephCategory === cat.key);
    }
    const owned = list.filter((c) => c.isOwned).length;
    const unowned = list.length - owned;
    const rate = list.length > 0 ? ((owned / list.length) * 100).toFixed(1) : '0.0';
    return { ...cat, total: list.length, owned, unowned, rate };
  });

  // Rarity Stats
  const rarities = ['★3', '★2', '★1'];
  const rarityStats = rarities.map((r) => {
    const list = characters.filter((c) => c.rarity === r);
    const owned = list.filter((c) => c.isOwned).length;
    const rate = list.length > 0 ? ((owned / list.length) * 100).toFixed(1) : '0.0';
    return { rarity: r, total: list.length, owned, rate };
  });

  // Attack Type Stats
  const attackTypes = ['爆発', '貫通', '神秘', '振動'];
  const attackStats = attackTypes.map((atk) => {
    const list = characters.filter((c) => c.attackType === atk);
    const owned = list.filter((c) => c.isOwned).length;
    const rate = list.length > 0 ? ((owned / list.length) * 100).toFixed(1) : '0.0';
    return { type: atk, total: list.length, owned, rate };
  });

  // Role Stats
  const roles = ['STRIKER', 'SPECIAL'];
  const roleStats = roles.map((role) => {
    const list = characters.filter((c) => c.role === role);
    const owned = list.filter((c) => c.isOwned).length;
    const rate = list.length > 0 ? ((owned / list.length) * 100).toFixed(1) : '0.0';
    return { role, total: list.length, owned, rate };
  });

  // School Stats (sorted by total descending)
  const schoolMap: Record<string, { total: number; owned: number }> = {};
  characters.forEach((c) => {
    const s = c.school || 'その他';
    if (!schoolMap[s]) schoolMap[s] = { total: 0, owned: 0 };
    schoolMap[s].total++;
    if (c.isOwned) schoolMap[s].owned++;
  });
  const schoolStats = Object.entries(schoolMap)
    .map(([school, val]) => ({
      school,
      total: val.total,
      owned: val.owned,
      rate: ((val.owned / val.total) * 100).toFixed(1),
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">所持率・データ統計分析</h3>
              <p className="text-xs text-slate-400">
                神名文字入手先別、レア度別、タイプ別の詳細分析
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main completion card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-900/60 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  総合所持率
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                    {overallRate}%
                  </span>
                  <span className="text-sm text-slate-400 font-mono">
                    ({ownedTotal} / {total} 名)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                <div className="text-xs text-slate-300">
                  <p className="font-bold">目標コンプリート</p>
                  <p className="text-slate-400">あと {total - ownedTotal} 名で完全制覇</p>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-slate-800/80 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 rounded-full"
                style={{ width: `${overallRate}%` }}
              />
            </div>
          </div>

          {/* Eleph Acquisition Breakdown (NEW) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>神名文字入手方法別の所持状況</span>
            </h4>
            <div className="space-y-3">
              {elephStats.map((item) => (
                <div key={item.key} className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400 text-[11px]">
                        所持 {item.owned}/{item.total}名
                        {item.unowned > 0 && (
                          <span className="text-amber-400 font-bold ml-1.5">
                            (未所持 {item.unowned}名)
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-cyan-300 text-xs w-12 text-right">
                        {item.rate}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rarity & Role Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rarity breakdown */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                レア度別所持率
              </h4>
              <div className="space-y-3">
                {rarityStats.map((item) => (
                  <div key={item.rarity}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="font-bold text-amber-400">{item.rarity}</span>
                      <span className="text-slate-300">
                        {item.owned}/{item.total} ({item.rate}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role breakdown */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                部隊別所持率
              </h4>
              <div className="space-y-3">
                {roleStats.map((item) => (
                  <div key={item.role}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="font-bold text-sky-400">{item.role}</span>
                      <span className="text-slate-300">
                        {item.owned}/{item.total} ({item.rate}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 rounded-full"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attack Type Breakdown */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              攻撃タイプ別所持率
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {attackStats.map((item) => {
                let barColor = 'bg-cyan-500';
                if (item.type === '爆発') barColor = 'bg-red-500';
                if (item.type === '貫通') barColor = 'bg-amber-500';
                if (item.type === '神秘') barColor = 'bg-blue-500';
                if (item.type === '振動') barColor = 'bg-purple-500';

                return (
                  <div key={item.type} className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <span className="text-xs font-bold text-slate-200 block">{item.type}</span>
                    <div className="mt-1 flex items-baseline justify-between text-xs font-mono">
                      <span className="text-sm font-bold text-white">{item.rate}%</span>
                      <span className="text-[11px] text-slate-400">
                        {item.owned}/{item.total}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${item.rate}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* School Breakdown */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              学園別所持率
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {schoolStats.map((item) => (
                <div
                  key={item.school}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80"
                >
                  <span className="font-semibold text-slate-300 truncate max-w-[140px]">
                    {item.school}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 text-[11px]">
                      {item.owned}/{item.total}
                    </span>
                    <span className="font-bold text-cyan-300 text-xs w-12 text-right">
                      {item.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
