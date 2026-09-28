import { Character } from './utils/tracker';

export type { Character };

export type OwnershipTab = 'all' | 'owned' | 'unowned' | 'split';

export type SortKey =
  | 'eleph-method' // 神名文字の入手方法順 (Hard ➔ 各種ショップ ➔ 配布 ➔ 募集)
  | 'default'
  | 'rarity-desc'
  | 'rarity-asc'
  | 'name-asc'
  | 'attack'
  | 'school';

export type ElephFilter =
  | 'all'
  | 'hard' // 任務（Hard）
  | 'shops' // 全ショップ (総力戦・大決戦・対抗戦・演習)
  | 'raid_total' // 総力戦ショップ
  | 'raid_grand' // 大決戦ショップ
  | 'shop_pvp' // 戦術対抗戦ショップ
  | 'shop_joint' // 合同火力演習ショップ
  | 'event' // イベント配布 / 常設化
  | 'gacha' // 募集限定（全体）
  | 'gacha_regular' // 通常募集
  | 'gacha_anniv' // フェス限定
  | 'gacha_limited' // 期間限定
  | 'gacha_collab'; // コラボ限定

export interface FilterState {
  tab: OwnershipTab;
  search: string;
  rarity: string; // 'all' | '★3' | '★2' | '★1'
  role: string; // 'all' | 'STRIKER' | 'SPECIAL'
  attackType: string; // 'all' | '爆発' | '貫通' | '神秘' | '振動'
  defenseType: string; // 'all' | '軽装備' | '重装甲' | '特殊装甲' | '弾力装甲'
  school: string; // 'all' | specific school
  classType: string; // 'all' | 'アタッカー' | etc.
  elephFilter: ElephFilter;
  sortBy: SortKey;
  groupByEleph: boolean;
}
