/**
 * Helper to construct character icon URLs.
 * - On GitHub Pages / static hosting: uses direct Wikiru image URL with referrerpolicy="no-referrer"
 * - In local dev / server mode: uses backend proxy /api/proxy-image
 */
export function getCharacterIconUrl(iconPath?: string): string {
  if (!iconPath) return '';
  const cleanPath = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath;

  // On GitHub Pages or static environment where there is no Express server
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('github.io') ||
      window.location.protocol === 'file:')
  ) {
    return `https://bluearchive.wikiru.jp/${cleanPath}`;
  }

  // Local development / full-stack server
  return `/api/proxy-image?path=${encodeURIComponent(cleanPath)}`;
}

export function getDirectWikiruImageUrl(iconPath?: string): string {
  if (!iconPath) return '';
  const cleanPath = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath;
  return `https://bluearchive.wikiru.jp/${cleanPath}`;
}
