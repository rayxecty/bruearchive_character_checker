import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for live scraped data and images
let cachedCharacters: any[] | null = null;
const imageMemoryCache = new Map<string, { buffer: Buffer; contentType: string }>();

// Read pre-extracted characters as fallback / instant response
try {
  const charactersFile = path.resolve(__dirname, 'src/data/characters.json');
  if (fs.existsSync(charactersFile)) {
    cachedCharacters = JSON.parse(fs.readFileSync(charactersFile, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not load characters.json initially', e);
}

// Scrape characters from Wikiru
async function scrapeWikiruPage(urlStr: string) {
  const targetUrl = urlStr || 'https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E6%89%80%E6%8C%81%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC';
  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Wikiru responded with status ${response.status}`);
  }

  const html = await response.text();
  const charRegex = /<div class="[^"]*character[^"]*"([^>]*)>([\s\S]*?)<\/div>/g;
  let match;
  const items: any[] = [];
  while ((match = charRegex.exec(html)) !== null) {
    const attrs = match[1];
    const inner = match[2];
    const getName = attrs.match(/data-ft-name="([^"]+)"/);
    const getImage = attrs.match(/data-ft-image="([^"]+)"/);
    const getRarity = attrs.match(/data-レア度="([^"]+)"/);
    const getRole = attrs.match(/data-役割="([^"]+)"/);
    const getClass = attrs.match(/data-クラス="([^"]+)"/);
    const getAtk = attrs.match(/data-攻撃タイプ="([^"]+)"/);
    const getDef = attrs.match(/data-防御タイプ="([^"]+)"/);
    const getPos = attrs.match(/data-ポジション="([^"]+)"/);
    const getSchool = attrs.match(/data-学園="([^"]+)"/);
    const getWeapon = attrs.match(/data-武器種="([^"]+)"/);
    const getEquip = attrs.match(/data-装備_and="([^"]+)"/);
    const getAcquisition = attrs.match(/data-入手機会="([^"]+)"/);
    const imgMatch = inner.match(/data-src="([^"]+)"/) || inner.match(/src="([^"]+)"/);

    const name = getName ? getName[1] : '';
    // Find preloaded eleph metadata if available
    const existing = (cachedCharacters || []).find((c: any) => c.name === name);

    items.push({
      id: getImage ? getImage[1] : (name ? name : `char_${items.length}`),
      name,
      imageKey: getImage ? getImage[1] : '',
      iconPath: imgMatch ? imgMatch[1] : (existing ? existing.iconPath : ''),
      rarity: getRarity ? getRarity[1] : '★3',
      role: getRole ? getRole[1] : 'STRIKER',
      classType: getClass ? getClass[1] : '',
      attackType: getAtk ? getAtk[1] : '',
      defenseType: getDef ? getDef[1] : '',
      position: getPos ? getPos[1] : '',
      school: getSchool ? getSchool[1] : '',
      weapon: getWeapon ? getWeapon[1] : '',
      equipment: getEquip ? getEquip[1] : '',
      acquisition: getAcquisition ? getAcquisition[1] : '',
      hardStages: existing?.hardStages || [],
      elephCategory: existing?.elephCategory || 'gacha_regular',
      elephMethodLabel: existing?.elephMethodLabel || '通常募集',
      elephMethodPriority: existing?.elephMethodPriority ?? 7,
      elephDetail: existing?.elephDetail || '',
    });
  }

  if (items.length > 0) {
    cachedCharacters = items;
  }
  return items;
}

// Decode ft code logic
function decodeSharePayload(code: string, characters: any[]) {
  const dot = code.indexOf('.');
  if (dot < 0) return { status: 'broken', ownedMap: {} };

  const payload = code.slice(dot + 1);
  let s = payload.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  
  try {
    const uncompressed = zlib.inflateSync(Buffer.from(s, 'base64'));
    const ownedMap: Record<string, boolean> = {};
    for (let i = 0; i < characters.length; i++) {
      const isOwned = !!(uncompressed[i >> 3] & (1 << (i & 7)));
      ownedMap[characters[i].imageKey] = isOwned;
    }
    return { status: 'ok', ownedMap };
  } catch (e) {
    return { status: 'broken', ownedMap: {} };
  }
}

// API: Proxy image from Wikiru with referer header
app.get('/api/proxy-image', async (req: Request, res: Response) => {
  try {
    const pathParam = req.query.path as string;
    const urlParam = req.query.url as string;
    let target = '';

    if (pathParam) {
      const cleanPath = pathParam.startsWith('/') ? pathParam.slice(1) : pathParam;
      target = `https://bluearchive.wikiru.jp/${cleanPath}`;
    } else if (urlParam) {
      if (urlParam.startsWith('https://bluearchive.wikiru.jp/')) {
        target = urlParam;
      } else {
        return res.status(400).send('Invalid image host');
      }
    } else {
      return res.status(400).send('Missing image path');
    }

    // Check memory cache
    if (imageMemoryCache.has(target)) {
      const cached = imageMemoryCache.get(target)!;
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      return res.send(cached.buffer);
    }

    const imgRes = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://bluearchive.wikiru.jp/',
      },
    });

    if (!imgRes.ok) {
      return res.status(imgRes.status).send('Image fetch failed');
    }

    const contentType = imgRes.headers.get('content-type') || 'image/png';
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cache in memory (up to 400 images is ~15-20MB, very safe)
    if (imageMemoryCache.size < 500) {
      imageMemoryCache.set(target, { buffer, contentType });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    return res.send(buffer);
  } catch (error) {
    console.error('Proxy image error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// API: Fetch tracker characters & status
app.get('/api/tracker', async (req: Request, res: Response) => {
  try {
    const rawUrl = (req.query.url as string) || '';
    const forceRefresh = req.query.refresh === 'true';

    let characters = cachedCharacters;
    if (!characters || forceRefresh || characters.length === 0) {
      characters = await scrapeWikiruPage(rawUrl);
    }

    // Extract ft code
    let ftCode = (req.query.ft as string) || '';
    if (!ftCode && rawUrl) {
      const match = rawUrl.match(/[?&]ft=([^&#\s]+)/);
      if (match) ftCode = decodeURIComponent(match[1]);
    }
    if (!ftCode && rawUrl.includes('.')) {
      const dotMatch = rawUrl.match(/([a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/);
      if (dotMatch) ftCode = dotMatch[1];
    }

    // Default to the user's provided test code if none passed
    if (!ftCode) {
      ftCode = 'yBnZtw.eJzrYeH1EGBg4HCQcnLhNGB0cNrB09GgycKQxNDw____-n_b69kBjdgLLA';
    }

    const { ownedMap } = decodeSharePayload(ftCode, characters);

    const charactersWithOwned = characters.map((c) => ({
      ...c,
      isOwned: !!ownedMap[c.imageKey],
    }));

    const ownedCount = charactersWithOwned.filter((c) => c.isOwned).length;
    const unownedCount = charactersWithOwned.length - ownedCount;

    return res.json({
      success: true,
      ftCode,
      totalCount: charactersWithOwned.length,
      ownedCount,
      unownedCount,
      completionRate: ((ownedCount / (charactersWithOwned.length || 1)) * 100).toFixed(1),
      characters: charactersWithOwned,
      ownedMap,
    });
  } catch (error: any) {
    console.error('Tracker API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process tracker request',
      fallbackCharacters: cachedCharacters || [],
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true' ? undefined : false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
