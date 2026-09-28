import React, { useState } from 'react';
import {
  Check,
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
  ExternalLink,
  Info,
  CircleDashed,
} from 'lucide-react';
import { Character } from '../types';
import { getCharacterIconUrl, getDirectWikiruImageUrl } from '../utils/imageUrl';

interface CharacterCardProps {
  character: Character;
  onViewDetails?: (character: Character) => void;
  compact?: boolean;
  isEditMode?: boolean;
  onToggleOwnership?: (character: Character) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onViewDetails,
  compact = false,
  isEditMode = false,
  onToggleOwnership,
}) => {
  const [imageError, setImageError] = useState(false);
  const isOwned = !!character.isOwned;

  // Attack type badge styles
  const getAttackBadge = (type: string) => {
    switch (type) {
      case '爆発':
        return 'bg-red-950/90 text-red-300 border-red-700/70';
      case '貫通':
        return 'bg-amber-950/90 text-amber-300 border-amber-700/70';
      case '神秘':
        return 'bg-blue-950/90 text-blue-300 border-blue-700/70';
      case '振動':
        return 'bg-purple-950/90 text-purple-300 border-purple-700/70';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Defense type badge styles
  const getDefenseBadge = (type: string) => {
    switch (type) {
      case '軽装備':
        return 'text-red-400';
      case '重装甲':
        return 'text-amber-400';
      case '特殊装甲':
        return 'text-blue-400';
      case '弾力装甲':
      case '複合装甲':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case '★3':
        return 'text-amber-400';
      case '★2':
        return 'text-sky-300';
      case '★1':
        return 'text-amber-600';
      default:
        return 'text-amber-400';
    }
  };

  // Eleph Acquisition Badge info
  const getElephBadge = () => {
    switch (character.elephCategory) {
      case 'hard': {
        const stageText =
          character.hardStages && character.hardStages.length > 0
            ? character.hardStages.join(', ')
            : 'Hard任務';
        return {
          icon: <Target className="w-3 h-3 text-amber-400" />,
          label: stageText,
          classes: 'bg-amber-950/80 text-amber-300 border-amber-700/70 ring-1 ring-amber-500/20',
        };
      }
      case 'raid_total':
        return {
          icon: <Trophy className="w-3 h-3 text-purple-400" />,
          label: '総力戦ショップ',
          classes: 'bg-purple-950/80 text-purple-300 border-purple-700/70',
        };
      case 'raid_grand':
        return {
          icon: <SwordsIcon className="w-3 h-3 text-cyan-400" />,
          label: '大決戦ショップ',
          classes: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/70',
        };
      case 'shop_pvp':
        return {
          icon: <Shield className="w-3 h-3 text-rose-400" />,
          label: '戦術対抗戦',
          classes: 'bg-rose-950/80 text-rose-300 border-rose-700/70',
        };
      case 'shop_joint':
        return {
          icon: <Flame className="w-3 h-3 text-orange-400" />,
          label: '合同火力演習',
          classes: 'bg-orange-950/80 text-orange-300 border-orange-700/70',
        };
      case 'event':
        return {
          icon: <Gift className="w-3 h-3 text-pink-400" />,
          label: 'イベント配布',
          classes: 'bg-pink-950/80 text-pink-300 border-pink-700/70',
        };
      case 'gacha_anniv':
        return {
          icon: <Crown className="w-3 h-3 text-amber-400" />,
          label: 'フェス限定',
          classes: 'bg-amber-950/80 text-amber-300 border-amber-600/70 ring-1 ring-amber-500/20',
        };
      case 'gacha_limited':
        return {
          icon: <Sparkles className="w-3 h-3 text-purple-300" />,
          label: '期間限定',
          classes: 'bg-purple-950/80 text-purple-300 border-purple-600/70',
        };
      case 'gacha_collab':
        return {
          icon: <Users className="w-3 h-3 text-emerald-300" />,
          label: 'コラボ限定',
          classes: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
        };
      case 'gacha_regular':
      default:
        return {
          icon: <Gem className="w-3 h-3 text-blue-400" />,
          label: '通常募集',
          classes: 'bg-blue-950/70 text-blue-300 border-blue-800/70',
        };
    }
  };

  const elephBadge = getElephBadge();

  const [currentImgSrc, setCurrentImgSrc] = useState<string>(() =>
    getCharacterIconUrl(character.iconPath)
  );

  const handleImageError = () => {
    const directUrl = getDirectWikiruImageUrl(character.iconPath);
    if (currentImgSrc !== directUrl && directUrl) {
      setCurrentImgSrc(directUrl);
    } else {
      setImageError(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      onToggleOwnership?.(character);
    } else {
      onViewDetails?.(character);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-2xl transition-all duration-200 cursor-pointer select-none overflow-hidden flex flex-col ${
        isEditMode
          ? isOwned
            ? 'bg-slate-900/95 border-2 border-cyan-400 shadow-lg shadow-cyan-950/40 ring-2 ring-cyan-500/30 hover:border-cyan-300 hover:scale-[1.02]'
            : 'bg-slate-950/80 border-2 border-slate-700/80 hover:border-cyan-500/70 hover:bg-slate-900/80 hover:scale-[1.02]'
          : isOwned
          ? 'bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 shadow-md shadow-cyan-950/20 ring-1 ring-cyan-500/20'
          : 'bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
      title={
        isEditMode
          ? `${character.name}: クリックして「${isOwned ? '未所持' : '所持'}」に切り替え`
          : `${character.name}の詳細を表示`
      }
    >
      {/* Top Banner Status Indicator */}
      <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
        {/* Rarity & Info button in edit mode */}
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-black tracking-widest ${getRarityBadge(character.rarity)}`}>
            {character.rarity}
          </span>
          {isEditMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(character);
              }}
              title="生徒の詳細と神名文字入手先を表示"
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <Info className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Owned Status Tag */}
        <div className="flex items-center gap-1">
          {isEditMode ? (
            isOwned ? (
              <span className="flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/40 group-hover:bg-cyan-300 transition-colors">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>所持</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-600 group-hover:border-cyan-400 group-hover:text-cyan-300 transition-colors">
                <CircleDashed className="w-3 h-3 text-slate-400 group-hover:text-cyan-400" />
                <span>未所持</span>
              </span>
            )
          ) : isOwned ? (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-400/40">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>所持</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-400 border border-slate-800">
              <span>未所持</span>
            </span>
          )}
        </div>
      </div>

      {/* Student Icon & Primary Info */}
      <div className="px-2.5 py-1.5 flex flex-col items-center">
        {/* Avatar Container */}
        <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-800/80 border border-slate-700/60 group-hover:scale-105 transition-transform duration-200">
          {!imageError && currentImgSrc ? (
            <img
              src={currentImgSrc}
              alt={character.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className={`w-full h-full object-cover transition-all ${
                isOwned ? 'filter-none' : 'grayscale-[30%] contrast-90 group-hover:grayscale-0'
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-300 text-xs font-bold text-center px-1">
              <Sparkles className="w-5 h-5 text-cyan-400 mb-1" />
              <span className="truncate w-full">{character.name.slice(0, 4)}</span>
            </div>
          )}

          {/* Role overlay icon */}
          <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] font-black tracking-tight uppercase bg-slate-950/85 backdrop-blur border border-slate-800 flex items-center gap-0.5">
            {character.role === 'STRIKER' ? (
              <Swords className="w-2.5 h-2.5 text-rose-400" />
            ) : (
              <Shield className="w-2.5 h-2.5 text-indigo-400" />
            )}
            <span className={character.role === 'STRIKER' ? 'text-rose-300' : 'text-indigo-300'}>
              {character.role === 'STRIKER' ? 'ST' : 'SP'}
            </span>
          </div>
        </div>

        {/* Student Name */}
        <div className="mt-2 text-center w-full px-0.5">
          <p
            className={`text-xs sm:text-[13px] font-bold line-clamp-1 leading-tight tracking-tight ${
              isOwned ? 'text-slate-100 group-hover:text-cyan-300' : 'text-slate-300 group-hover:text-slate-100'
            }`}
            title={character.name}
          >
            {character.name}
          </p>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
            {character.school || '所属不明'}
          </span>
        </div>
      </div>

      {/* Eleph Acquisition Badge (神名文字 入手方法) */}
      <div className="px-2 pt-1 pb-1.5 w-full">
        <div
          className={`flex items-center justify-center gap-1 text-[10.5px] font-medium py-1 px-1.5 rounded-lg border text-center truncate ${elephBadge.classes}`}
          title={`神名文字入手先: ${character.elephMethodLabel || ''} ${character.elephDetail || ''}`}
        >
          {elephBadge.icon}
          <span className="truncate font-mono">{elephBadge.label}</span>
        </div>
      </div>

      {/* Bottom Type & Defensive Badges */}
      {!compact && (
        <div className="mt-auto px-2 pb-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
          <span
            className={`px-1.5 py-0.5 rounded font-semibold border ${getAttackBadge(
              character.attackType
            )}`}
          >
            {character.attackType || '-'}
          </span>
          <span className={`font-medium ${getDefenseBadge(character.defenseType)}`}>
            {character.defenseType || '-'}
          </span>
        </div>
      )}
    </div>
  );
};
