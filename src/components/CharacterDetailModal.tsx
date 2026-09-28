import React from 'react';
import {
  X,
  ExternalLink,
  Check,
  CircleDashed,
  Shield,
  Swords,
  Sparkles,
  Target,
  Trophy,
  Swords as SwordsIcon,
  Flame,
  Gift,
  Gem,
  Crown,
  Users,
} from 'lucide-react';
import { Character } from '../types';
import { getCharacterIconUrl, getDirectWikiruImageUrl } from '../utils/imageUrl';

interface CharacterDetailModalProps {
  character: Character | null;
  onClose: () => void;
  onToggleOwnership?: (character: Character) => void;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  onClose,
  onToggleOwnership,
}) => {
  if (!character) return null;

  const isOwned = !!character.isOwned;
  const [imageError, setImageError] = React.useState(false);
  const [currentImgSrc, setCurrentImgSrc] = React.useState<string>(() =>
    getCharacterIconUrl(character.iconPath)
  );

  React.useEffect(() => {
    setImageError(false);
    setCurrentImgSrc(getCharacterIconUrl(character.iconPath));
  }, [character.iconPath]);

  const handleImageError = () => {
    const directUrl = getDirectWikiruImageUrl(character.iconPath);
    if (currentImgSrc !== directUrl && directUrl) {
      setCurrentImgSrc(directUrl);
    } else {
      setImageError(true);
    }
  };

  const wikiruStudentUrl = `https://bluearchive.wikiru.jp/?${encodeURIComponent(character.name)}`;

  // Attack type badge styles
  const getAttackBadge = (type: string) => {
    switch (type) {
      case '爆発':
        return 'bg-red-950 text-red-300 border-red-700/80';
      case '貫通':
        return 'bg-amber-950 text-amber-300 border-amber-700/80';
      case '神秘':
        return 'bg-blue-950 text-blue-300 border-blue-700/80';
      case '振動':
        return 'bg-purple-950 text-purple-300 border-purple-700/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500" />

        <div className="p-6 space-y-4">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="モーダルを閉じる"
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Student Header */}
          <div className="flex items-start gap-4">
            <div className="relative w-22 h-22 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-md shrink-0">
              {!imageError && currentImgSrc ? (
                <img
                  src={currentImgSrc}
                  alt={character.name}
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-sm font-black tracking-widest">
                  {character.rarity}
                </span>
                {onToggleOwnership ? (
                  <button
                    type="button"
                    onClick={() => onToggleOwnership(character)}
                    className="group cursor-pointer focus:outline-none"
                    title={`クリックして「${isOwned ? '未所持' : '所持'}」に切り替え`}
                  >
                    {isOwned ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-400/30 group-hover:bg-cyan-400 transition-colors">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>所持中 (クリックで切替)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 group-hover:border-cyan-500/60 group-hover:text-cyan-300 transition-colors">
                        <CircleDashed className="w-3 h-3 text-amber-400" />
                        <span>未所持 (クリックで切替)</span>
                      </span>
                    )}
                  </button>
                ) : isOwned ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-400/30">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>所持</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    <CircleDashed className="w-3 h-3 text-amber-400" />
                    <span>未所持</span>
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mt-1 truncate">{character.name}</h3>
              <p className="text-xs text-cyan-400 font-medium">{character.school}</p>
            </div>
          </div>

          {/* Dedicated Eleph Acquisition Section (神名文字の入手方法) */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>神名文字の入手方法</span>
              </span>
              <span className="text-[11px] text-slate-500">
                {isOwned ? '所持中（星上げ・固有武器）' : '未所持（神名文字集めで受入可能か）'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                {character.elephCategory === 'hard' && (
                  <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                    <Target className="w-4 h-4" />
                  </div>
                )}
                {character.elephCategory === 'raid_total' && (
                  <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
                    <Trophy className="w-4 h-4" />
                  </div>
                )}
                {character.elephCategory === 'raid_grand' && (
                  <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                    <SwordsIcon className="w-4 h-4" />
                  </div>
                )}
                {character.elephCategory === 'shop_pvp' && (
                  <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
                    <Shield className="w-4 h-4" />
                  </div>
                )}
                {character.elephCategory === 'shop_joint' && (
                  <div className="p-1.5 rounded-lg bg-orange-950 text-orange-400 border border-orange-800">
                    <Flame className="w-4 h-4" />
                  </div>
                )}
                {character.elephCategory === 'event' && (
                  <div className="p-1.5 rounded-lg bg-pink-950 text-pink-400 border border-pink-800">
                    <Gift className="w-4 h-4" />
                  </div>
                )}
                {character.elephCategory === 'gacha_anniv' && (
                  <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-600">
                    <Crown className="w-4 h-4" />
                  </div>
                )}
                {character.elephCategory === 'gacha_recollect' && (
                  <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                {character.elephCategory === 'gacha_limited' && (
                  <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                {character.elephCategory === 'gacha_collab' && (
                  <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-600">
                    <Users className="w-4 h-4" />
                  </div>
                )}
                {character.elephCategory === 'gacha_regular' && (
                  <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                    <Gem className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    {character.elephMethodLabel || '入手方法情報'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {character.elephDetail || character.acquisition}
                  </p>
                </div>
              </div>

              {/* Hard stage badges */}
              {character.hardStages && character.hardStages.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-semibold mr-1">ドロップステージ:</span>
                  {character.hardStages.map((stage) => (
                    <span
                      key={stage}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/80 shadow-sm"
                    >
                      {stage}
                    </span>
                  ))}
                  <span className="text-[11px] text-slate-500 ml-1">
                    (各ステージ1日3回挑戦可能)
                  </span>
                </div>
              )}

              {/* Guidance note */}
              <p className="text-[11px] text-slate-400 mt-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
                {character.elephCategory === 'hard' &&
                  '💡 Hardステージを毎日周回して神名文字を集めることで、ガチャを引かずに無課金で生徒を受入・加入させることができます。'}
                {character.elephCategory === 'raid_total' &&
                  '🏆 総力戦ショップにて毎月コインで神名文字を交換し、規定数集めることで生徒を受け入れることができます。'}
                {character.elephCategory === 'raid_grand' &&
                  '⚔️ 大決戦ショップにて毎月コインで神名文字を交換し、規定数集めることで生徒を受け入れることができます。'}
                {character.elephCategory === 'shop_pvp' &&
                  '🥊 戦術対抗戦ショップにて対抗戦コインで神名文字を交換し、規定数集めることで生徒を受け入れることができます。'}
                {character.elephCategory === 'shop_joint' &&
                  '🔥 合同火力演習ショップにて毎月演習コインで神名文字を交換し、規定数集めることで生徒を受け入れることができます。'}
                {character.elephCategory === 'event' &&
                  '🎁 イベントのストーリー報酬やイベント常設化コンテンツをプレイすることで加入可能です。'}
                {character.elephCategory?.startsWith('gacha') &&
                  '💎 募集（ガチャ）でのみ加入可能です。未所持の場合、神名のカケラや熟達証書での新規受入はできません。'}
              </p>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-slate-400 block text-[11px]">部隊 / クラス</span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-200">
                {character.role === 'STRIKER' ? (
                  <Swords className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>{character.role}</span>
                <span className="text-slate-500">/</span>
                <span>{character.classType || '通常'}</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-slate-400 block text-[11px]">攻撃 / 防御タイプ</span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold">
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] border font-bold ${getAttackBadge(
                    character.attackType
                  )}`}
                >
                  {character.attackType}
                </span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-200">{character.defenseType}</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-slate-400 block text-[11px]">ポジション / 武器種</span>
              <div className="mt-1 font-semibold text-slate-200">
                <span>{character.position || '-'}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span>{character.weapon || '-'}</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-slate-400 block text-[11px]">装備</span>
              <div className="mt-1 font-semibold text-slate-200 truncate">
                {character.equipment || '-'}
              </div>
            </div>
          </div>

          {/* Wiki Link */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 text-[11px]">
              所持状況の変更はWikiの所持トラッカーで行えます
            </span>
            <a
              href={wikiruStudentUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 hover:underline font-medium"
            >
              <span>Wikiru個別ページ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
