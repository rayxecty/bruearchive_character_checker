import { inflate, deflate } from 'pako';
import defaultCharactersData from '../data/characters.json';

export interface Character {
  id: string;
  name: string;
  imageKey: string;
  iconPath: string;
  rarity: '★3' | '★2' | '★1' | string;
  role: 'STRIKER' | 'SPECIAL' | string;
  classType: string;
  attackType: '爆発' | '貫通' | '神秘' | '振動' | string;
  defenseType: '軽装備' | '重装甲' | '特殊装甲' | '弾力装甲' | '複合装甲' | string;
  position: 'FRONT' | 'MIDDLE' | 'BACK' | string;
  school: string;
  weapon: string;
  equipment: string;
  acquisition: string;
  isOwned?: boolean;
  hardStages?: string[];
  elephCategory?:
    | 'hard'
    | 'raid_total'
    | 'raid_grand'
    | 'shop_pvp'
    | 'shop_joint'
    | 'event'
    | 'gacha_regular'
    | 'gacha_limited'
    | 'gacha_anniv'
    | 'gacha_collab';
  elephMethodLabel?: string;
  elephMethodPriority?: number;
  elephDetail?: string;
}

export const DEFAULT_SHARE_CODE = 'yBnZtw.eJzrYeH1EGBg4HCQcnLhNGB0cNrB09GgycKQxNDw____-n_b69kBjdgLLA';
export const DEFAULT_WIKIRU_URL =
  'https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E6%89%80%E6%8C%81%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC&ft=' +
  DEFAULT_SHARE_CODE;

export const INITIAL_CHARACTERS: Character[] = defaultCharactersData as Character[];

/**
 * Convert base64url string to Uint8Array bytes
 */
export function b64urlToBytes(s: string): Uint8Array {
  const normalized = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert Uint8Array bytes to base64url string
 */
export function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Computes Wikiru tracker fingerprint (FNV-1a 32-bit variant)
 */
export function computeFingerprint(ids: string[]): string {
  const s = ids.join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  const b = new Uint8Array([(h >>> 24) & 255, (h >>> 16) & 255, (h >>> 8) & 255, h & 255]);
  return bytesToB64url(b);
}

/**
 * Pack boolean array into compact bit bytes
 */
export function packBits(bits: boolean[]): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  for (let i = 0; i < bits.length; i++) {
    if (bits[i]) {
      bytes[i >> 3] |= 1 << (i & 7);
    }
  }
  return bytes;
}

/**
 * Unpack compact bit bytes into boolean array
 */
export function unpackBits(bytes: Uint8Array, n: number): boolean[] {
  const bits: boolean[] = [];
  for (let i = 0; i < n; i++) {
    bits.push(!!(bytes[i >> 3] & (1 << (i & 7))));
  }
  return bits;
}

/**
 * Extracts ft code from any input (full URL, query string, or direct code)
 */
export function extractFtCode(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // Check if it has ft= parameter
  try {
    if (trimmed.includes('ft=')) {
      const match = trimmed.match(/[?&]ft=([^&#\s]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]).trim();
      }
    }
  } catch {
    // fallback
  }

  // If input contains a fingerprint dot and payload like yBnZtw.eJz...
  const dotPattern = /([a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/;
  const match = trimmed.match(dotPattern);
  if (match && match[1]) {
    return match[1].trim();
  }

  return trimmed;
}

/**
 * Decodes ft code into an ownedSet mapping { [imageKey]: boolean }
 */
export function decodeFtShare(
  code: string,
  characterList: Character[] = INITIAL_CHARACTERS
): { status: 'ok' | 'stale' | 'broken'; ownedMap: Record<string, boolean>; ownedCount: number } {
  const cleanCode = extractFtCode(code);
  const dot = cleanCode.indexOf('.');
  if (dot < 0) {
    return { status: 'broken', ownedMap: {}, ownedCount: 0 };
  }

  const fp = cleanCode.slice(0, dot);
  const payload = cleanCode.slice(dot + 1);
  const ids = characterList.map((c) => c.imageKey);
  const currentFp = computeFingerprint(ids);

  let bits: boolean[] = [];
  try {
    const compressedBytes = b64urlToBytes(payload);
    const inflated = inflate(compressedBytes);
    bits = unpackBits(inflated, ids.length);
  } catch (err) {
    console.error('Failed to unpack ft payload', err);
    return { status: 'broken', ownedMap: {}, ownedCount: 0 };
  }

  const ownedMap: Record<string, boolean> = {};
  let count = 0;
  ids.forEach((id, i) => {
    if (bits[i]) {
      ownedMap[id] = true;
      count++;
    } else {
      ownedMap[id] = false;
    }
  });

  return {
    status: fp === currentFp ? 'ok' : 'stale',
    ownedMap,
    ownedCount: count,
  };
}

/**
 * Encodes owned characters map to Wikiru ft share code
 */
export function encodeFtShare(
  ownedMap: Record<string, boolean>,
  characterList: Character[] = INITIAL_CHARACTERS
): string {
  const ids = characterList.map((c) => c.imageKey);
  const fp = computeFingerprint(ids);
  const bits = ids.map((id) => !!ownedMap[id]);
  const packed = packBits(bits);
  const deflated = deflate(packed);
  return `${fp}.${bytesToB64url(deflated)}`;
}

/**
 * Generates full Wikiru tracker URL
 */
export function buildWikiruUrl(shareCode: string): string {
  return `https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E6%89%80%E6%8C%81%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC&ft=${encodeURIComponent(
    shareCode
  )}`;
}
