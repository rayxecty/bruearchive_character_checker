import { decodeFtShare, encodeFtShare, extractFtCode, buildWikiruUrl, INITIAL_CHARACTERS, Character } from './tracker';

const STORAGE_KEY = 'ba_character_ownership_data_v1';
const COOKIE_NAME = 'ba_ownership_share_code';

export interface SavedOwnershipState {
  ownedIds: string[]; // list of owned character imageKey
  shareCode: string;
  url: string;
  updatedAt: number;
  source: 'url' | 'localStorage' | 'cookie';
}

/**
 * Helper to get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Helper to set a cookie with long expiration (1 year)
 */
export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
  } catch (err) {
    console.warn('Failed to set cookie', err);
  }
}

/**
 * Helper to remove a cookie
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  } catch (err) {
    console.warn('Failed to delete cookie', err);
  }
}

/**
 * Saves ownership state to both localStorage and Cookie
 */
export function saveOwnershipData(data: {
  ownedIds: string[];
  shareCode?: string;
  url?: string;
}): void {
  if (typeof window === 'undefined') return;

  try {
    const shareCode = data.shareCode || '';
    const url = data.url || (shareCode ? buildWikiruUrl(shareCode) : '');

    const payload: SavedOwnershipState = {
      ownedIds: data.ownedIds,
      shareCode,
      url,
      updatedAt: Date.now(),
      source: 'localStorage',
    };

    // 1. Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('localStorage save failed', e);
    }

    // 2. Save compact shareCode to Cookie as backup & cross-tab sync
    if (shareCode) {
      setCookie(COOKIE_NAME, shareCode, 365);
    } else if (data.ownedIds.length === 0) {
      deleteCookie(COOKIE_NAME);
    }
  } catch (err) {
    console.error('Error in saveOwnershipData:', err);
  }
}

/**
 * Clears saved ownership data from both localStorage and Cookie
 */
export function clearOwnershipData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    deleteCookie(COOKIE_NAME);
  } catch (err) {
    console.warn('Failed to clear ownership data', err);
  }
}

/**
 * Loads saved ownership data on startup.
 * Checks URL parameter first, then localStorage, then Cookie.
 */
export function loadSavedOwnership(): SavedOwnershipState | null {
  if (typeof window === 'undefined') return null;

  // 1. Check URL parameters (?ft=... or #ft=...)
  try {
    const searchParams = new URLSearchParams(window.location.search);
    let ftParam = searchParams.get('ft');
    if (!ftParam && window.location.hash.includes('ft=')) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      ftParam = hashParams.get('ft');
    }

    if (ftParam) {
      const decoded = decodeFtShare(ftParam, INITIAL_CHARACTERS);
      if (decoded.status !== 'broken') {
        const ownedIds = Object.entries(decoded.ownedMap)
          .filter(([, owned]) => owned)
          .map(([key]) => key);

        return {
          ownedIds,
          shareCode: ftParam,
          url: window.location.href,
          updatedAt: Date.now(),
          source: 'url',
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse URL ft param', err);
  }

  // 2. Check localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.ownedIds)) {
        return {
          ownedIds: parsed.ownedIds,
          shareCode: parsed.shareCode || '',
          url: parsed.url || '',
          updatedAt: parsed.updatedAt || Date.now(),
          source: 'localStorage',
        };
      }
    }
  } catch (err) {
    console.warn('Failed to read from localStorage', err);
  }

  // 3. Check Cookie fallback
  try {
    const cookieShareCode = getCookie(COOKIE_NAME);
    if (cookieShareCode) {
      const decoded = decodeFtShare(cookieShareCode, INITIAL_CHARACTERS);
      if (decoded.status !== 'broken') {
        const ownedIds = Object.entries(decoded.ownedMap)
          .filter(([, owned]) => owned)
          .map(([key]) => key);

        return {
          ownedIds,
          shareCode: cookieShareCode,
          url: buildWikiruUrl(cookieShareCode),
          updatedAt: Date.now(),
          source: 'cookie',
        };
      }
    }
  } catch (err) {
    console.warn('Failed to read from cookie', err);
  }

  return null;
}
