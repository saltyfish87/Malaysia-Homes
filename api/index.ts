import express from 'express';
// @ts-ignore — no types shipped
import * as OpenCC from 'opencc-js';
import path from 'path';
import fs from 'fs';

// In-Memory Caches for smooth fast performance (stored per serverless function instance container)
let driveCache: any = null;
let driveCacheTime = 0;
const DRIVE_CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache

async function scrapePublicDriveImages() {
  const parentFolderId = '1QCR6qJqsadN2y_PesOBr2uFZfZRZrvDd';
  const url = `https://drive.google.com/embeddedfolderview?id=${parentFolderId}`;
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch main google drive folder page: ${res.status}`);
  }

  const html = await res.text();
  const folders: { id: string; name: string }[] = [];
  const flatFilesList: { id: string; name: string; url: string }[] = [];

  const linkRegex = /<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const innerHtml = match[2];
    
    const titleMatch = innerHtml.match(/<div class="flip-entry-title">([^<]+)<\/div>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown';

    if (href.includes('/drive/folders/')) {
      const folderId = href.split('/drive/folders/')[1].split(/[?#]/)[0];
      folders.push({ id: folderId, name: title });
    } else if (href.includes('/file/d/')) {
      const fileId = href.split('/file/d/')[1].split('/')[0].split(/[?#]/)[0];
      flatFilesList.push({
        id: fileId,
        name: title,
        url: `/api/image-proxy?id=${fileId}`
      });
    }
  }

  // Explicitly add any missed custom override folders
  const EXPLICIT_FOLDERS = {
    'axis': '1sySWvaUlkW47FQt_IWIgMgORz6Xx0Vvd',
    'brixton': '1m6_-BrNSRoUCf-bUnqBYzp1CTQD3NRP0',
    'dover': '1mIoLY0UMPFgoSFgRtEBUWv8OPvsA7Sqp',
    'causewayz-square': '1XboN_O-NebDuhvVk0MQXoekLoOQeDlk1',
    'causeways-square-towers': '1XboN_O-NebDuhvVk0MQXoekLoOQeDlk1',
    'johor-causeway': '1XboN_O-NebDuhvVk0MQXoekLoOQeDlk1',
    'johor-ciq-causewayz': '1XboN_O-NebDuhvVk0MQXoekLoOQeDlk1',
    'causewayz': '1XboN_O-NebDuhvVk0MQXoekLoOQeDlk1',
    'johor-ciq-causeway': '1XboN_O-NebDuhvVk0MQXoekLoOQeDlk1',
    'causeway': '1XboN_O-NebDuhvVk0MQXoekLoOQeDlk1'
  };

  for (const [name, id] of Object.entries(EXPLICIT_FOLDERS)) {
    if (!folders.some(f => f.id === id)) {
      folders.push({ id, name });
    }
  }

  const driveMap: Record<string, { image: string; gallery: string[]; locationImage?: string; files?: { name: string; url: string }[]; flatFiles?: any[] }> = {};
  
  // Set up __flat_files__ key
  driveMap['__flat_files__'] = {
    image: '',
    gallery: [],
    flatFiles: flatFilesList
  };

  // Crawl subfolders' image galleries in parallel
  await Promise.all(folders.map(async (folder) => {
    try {
      const subUrl = `https://drive.google.com/embeddedfolderview?id=${folder.id}`;
      const subRes = await fetch(subUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
        }
      });
      if (subRes.ok) {
        const subHtml = await subRes.text();
        const galleryUrls: string[] = [];
        const nonMapUrls: string[] = [];
        const files: { name: string; url: string }[] = [];
        let locUrl = '';

        let subMatch;
        const subLinkRegex = /<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        while ((subMatch = subLinkRegex.exec(subHtml)) !== null) {
          const sHref = subMatch[1];
          const sInner = subMatch[2];
          
          if (sHref.includes('/file/d/')) {
            const fileId = sHref.split('/file/d/')[1].split('/')[0].split(/[?#]/)[0];
            const sTitleMatch = sInner.match(/<div class="flip-entry-title">([^<]+)<\/div>/);
            const sTitle = sTitleMatch ? sTitleMatch[1].trim() : '';
            const fileUrl = `/api/image-proxy?id=${fileId}`;
            const lowerName = sTitle.toLowerCase();
            
            files.push({ name: sTitle, url: fileUrl });

            if (lowerName.includes('location') || lowerName.includes('map')) {
              locUrl = fileUrl;
            } else {
              nonMapUrls.push(fileUrl);
            }
            galleryUrls.push(fileUrl);
          }
        }

        const primaryImage = nonMapUrls.length > 0 ? nonMapUrls[0] : (galleryUrls[0] || '');
        const primaryGallery = nonMapUrls.length > 0 ? nonMapUrls : galleryUrls;
        
        // Generate both a clean slugified version (with stripped leading numbers) and the full raw slug name
        const rawNameClean = folder.name.toLowerCase().replace(/^[0-9.]+\s*/, '').trim();
        const slugName = rawNameClean.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        driveMap[slugName] = {
          image: primaryImage,
          gallery: primaryGallery,
          files: files,
          ...(locUrl ? { locationImage: locUrl } : {})
        };

        // Also fallback to exact match with numbers just in case
        const exactSlug = folder.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (exactSlug !== slugName) {
          driveMap[exactSlug] = driveMap[slugName];
        }
      }
    } catch (subErr) {
      console.warn(`Failed to scrape public subfolder ${folder.name}:`, subErr);
    }
  }));

  return driveMap;
}

// =====================================================================
// Server-side SEO layer (added 2026-09-18)
// Gives every /project/<slug> page its own <title>, description, canonical,
// Open Graph tags and JSON-LD, and generates sitemap.xml + llms.txt live from
// the same Google Sheet the site already reads. Page design is untouched.
// =====================================================================
const SITE_URL = 'https://www.propertyportal.my';
const SEO_SPREADSHEET_ID = '1__k-dTt9oxBZSKKp9wI2O42l8QiBpqy0O9dwZK1jyqQ';
const SEO_LIST_GID = '2052526095';
const SEO_DETAILS_GID = '1727767414';
const SEO_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const AGENT = {
  name: 'Yee Woei Shyan',
  ren: 'REN 46305',
  company: 'IQI Realty Sdn Bhd',
  telephone: '+60108278932',
  telephoneDisplay: '+60 10-827 8932',
  email: 'shyanyeews@gmail.com'
};

interface SeoProject {
  slug: string; name: string; developer: string; location: string; address: string; area: string; state: string;
  tenure: string; propertyType: string; priceMin: number; priceMax: number; priceRange: string;
  builtUpMin: number; builtUpMax: number; bedroomsMin: number; bedroomsMax: number;
  completionStatus: string; completionYear: string; totalUnits: string; maintenanceFee: string;
  landTitle: string; blocks: string; floors: string; pricePsf: string; carparkMin: string; carparkMax: string;
  estCompletionDate: string; launchDate: string; dataUpdated: string; notes: string;
}

// RFC-4180 style CSV parser (handles quoted commas and line breaks)
function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// The sheet tabs have a banner above the real header row; find the row that says "Project Name".
function csvToRecords(text: string): Record<string, string>[] {
  const rows = parseCsvText(text);
  const headerIdx = rows.findIndex(r => r.some(c => c.trim().toLowerCase() === 'project name'));
  if (headerIdx < 0) return [];
  const headers = rows[headerIdx].map(h => h.trim().toLowerCase());
  const records: Record<string, string>[] = [];
  for (const r of rows.slice(headerIdx + 1)) {
    const rec: Record<string, string> = {};
    headers.forEach((h, i) => { if (h) rec[h] = (r[i] || '').trim(); });
    if (rec['project name']) records.push(rec);
  }
  return records;
}

// Same slug rule as the front-end (src/utils/googleSheets.ts generateSlug) so URLs match.
const seoSlugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const seoAlnum = (s: string) => s.toLowerCase().replace(/&|\band\b/g, '').replace(/[^a-z0-9]/g, '');
const seoNumber = (s: string | undefined) => { const n = parseFloat((s || '').replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };
const seoInt = (s: string | undefined) => { const m = (s || '').replace(/,/g, '').match(/\d+/); return m ? parseInt(m[0], 10) : 0; };
const fmtNum = (n: number) => n.toLocaleString('en-MY');

function seoPriceBounds(range: string, starting: string): { min: number; max: number } {
  const nums = (range.match(/\d[\d,]{4,}/g) || []).map(n => seoNumber(n)).filter(n => n > 0);
  const start = seoNumber(starting);
  const min = start || (nums.length ? Math.min(...nums) : 0);
  const max = nums.length ? Math.max(...nums) : min;
  return { min, max: Math.max(min, max) };
}

function seoDetectState(...texts: string[]): string {
  const t = texts.join(' ').toLowerCase();
  if (/kuala lumpur/.test(t)) return 'Kuala Lumpur';
  if (/selangor/.test(t)) return 'Selangor';
  if (/johor/.test(t)) return 'Johor';
  if (/penang|pulau pinang/.test(t)) return 'Penang';
  if (/petaling jaya|damansara|subang|usj|puchong|kwasa|shah alam|kelana|cyberjaya|klang|kajang|semenyih|\bpj\b|\bpjs\b/.test(t)) return 'Selangor';
  if (/klcc|bangsar|bukit jalil|trx|bukit bintang|cheras|sentul|seputeh|oug|sri petaling|kepong|mont kiara|chan sow lin|sungai besi|old klang road|menerung/.test(t)) return 'Kuala Lumpur';
  return 'Malaysia';
}

let seoProjectsCache: { projects: SeoProject[]; time: number } | null = null;

// Project ids the app has always used (from src/constants/mockData.ts, keyed by the project name with
// everything but letters and digits removed). Kept inline: the serverless function must not import app files.
// Agent reviews on shyanyee.com, keyed by project slug. Only projects with a published review get
// the "Agent insights" card (no site-wide cross links). Kept inline: the function cannot import from src/.
/**
 * The agent's own walkthrough video for a project, by project slug.
 *
 * A viewing video is the one thing on a project page that cannot be copied from a brochure, so where
 * one exists it goes on the page with VideoObject schema. Add a line here when a new video is filmed.
 */
const PROJECT_VIDEOS: Record<string, { id: string; name: string; date: string }> = {
  'khaya-bangsar': { id: 'QHD2awCy3a4', name: 'Khaya Residences Bangsar: full walkthrough, layouts and investment view', date: '2026-09-01' },
  'parkside-residence': { id: 'fZzT_sV0VKU', name: 'Parkside Residences Bangsar: the 5-acre park downstairs', date: '2026-08-01' },
  'park-green': { id: '_EelMcIcXaI', name: 'Park Green Bukit Jalil by Malton: link bridge to the mall and the park view', date: '2026-07-01' },
  'centrix': { id: 'KyYFl2cz4Vw', name: 'Centrix The Station: a TOD tower straight onto the LRT', date: '2026-06-01' },
  'orion-bid': { id: 'US1SR88AwhQ', name: 'Orion Residence: show units, services and the Bukit Bintang walk', date: '2026-03-01' },
  'clouthaus-res': { id: 'Xya5mG87R-Q', name: 'CloutHaus: facing the Petronas Twin Towers, dual-key show unit', date: '2026-02-01' },
  'pavilion-square-residences': { id: 'Ip9wDev_pF4', name: 'Pavilion Square: the private bridge into Pavilion Kuala Lumpur', date: '2026-02-01' },
  'conlay': { id: 'C0EZN_aLaKQ', name: 'The Conlay Residence by E&O and Mitsui Fudosan', date: '2026-01-01' }
};

/** Thumbnail, watch link and VideoObject: crawlers get the markup, readers get a real link. */
function projectVideoHtml(slug: string, projectName: string): string {
  const v = PROJECT_VIDEOS[slug];
  if (!v) return '';
  return `<h2>Video walkthrough of ${escHtml(projectName)}</h2>` +
    `<p><a href="https://www.youtube.com/watch?v=${escHtml(v.id)}" rel="noopener">` +
    `<img src="https://i.ytimg.com/vi/${escHtml(v.id)}/hqdefault.jpg" alt="${escHtml(v.name)}" width="480" height="360" loading="lazy" /></a></p>` +
    `<p><a href="https://www.youtube.com/watch?v=${escHtml(v.id)}" rel="noopener">Watch: ${escHtml(v.name)}</a> — filmed on site by ${escHtml(AGENT.name)} (${escHtml(AGENT.ren)}).</p>`;
}

function projectVideoSchema(slug: string, projectName: string) {
  const v = PROJECT_VIDEOS[slug];
  if (!v) return null;
  return {
    '@type': 'VideoObject',
    'name': v.name,
    'description': `On-site walkthrough of ${projectName} by ${AGENT.name}, ${AGENT.ren}, ${AGENT.company}.`,
    'thumbnailUrl': `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    'uploadDate': v.date,
    'contentUrl': `https://www.youtube.com/watch?v=${v.id}`,
    'embedUrl': `https://www.youtube-nocookie.com/embed/${v.id}`,
    'publisher': { '@type': 'Organization', 'name': AGENT.company }
  };
}

const AGENT_REVIEWS: Record<string, { url: string; zhUrl: string; video: boolean }> = {
  'clouthaus-res': { url: 'https://shyanyee.com/blog/clouthaus-kl-city-centre-review', zhUrl: 'https://shyanyee.com/zh/blog/clouthaus-kl-city-centre-review', video: true },
  'orion-bid': { url: 'https://shyanyee.com/blog/orion-residence-bukit-bintang-review', zhUrl: 'https://shyanyee.com/zh/blog/orion-residence-bukit-bintang-review', video: true },
  'pavilion-square-residences': { url: 'https://shyanyee.com/blog/pavilion-square-kl-review', zhUrl: 'https://shyanyee.com/zh/blog/pavilion-square-kl-review', video: true },
  'khaya-bangsar': { url: 'https://shyanyee.com/blog/khaya-residence-bangsar-review', zhUrl: 'https://shyanyee.com/zh/blog/khaya-residence-bangsar-review', video: true },
  'ren-bukit-jalil': { url: 'https://shyanyee.com/blog/ren-residence-bukit-jalil-review', zhUrl: 'https://shyanyee.com/zh/blog/ren-residence-bukit-jalil-review', video: false },
  'centrix': { url: 'https://shyanyee.com/blog/centrix-the-station-kl-city-centre-review', zhUrl: 'https://shyanyee.com/zh/blog/centrix-the-station-kl-city-centre-review', video: true },
  'golden-crown': { url: 'https://shyanyee.com/blog/golden-crown-trx-review', zhUrl: 'https://shyanyee.com/zh/blog/golden-crown-trx-review', video: false },
  'core-trx': { url: 'https://shyanyee.com/blog/core-residence-trx-review', zhUrl: 'https://shyanyee.com/zh/blog/core-residence-trx-review', video: false },
  'phoeniz-suites': { url: 'https://shyanyee.com/blog/phoeniz-suites-kl-city-centre-review', zhUrl: 'https://shyanyee.com/zh/blog/phoeniz-suites-kl-city-centre-review', video: false },
  'branniganz-exsim': { url: 'https://shyanyee.com/blog/branniganz-kl-city-centre-review', zhUrl: 'https://shyanyee.com/zh/blog/branniganz-kl-city-centre-review', video: false },
  'park-green': { url: 'https://shyanyee.com/blog/park-green-bukit-jalil-review', zhUrl: 'https://shyanyee.com/zh/blog/park-green-bukit-jalil-review', video: true },
  'oaka-res': { url: 'https://shyanyee.com/blog/oaka-residences-bukit-jalil-review', zhUrl: 'https://shyanyee.com/zh/blog/oaka-residences-bukit-jalil-review', video: false },
  'ayanna-res': { url: 'https://shyanyee.com/blog/ayanna-bukit-jalil-review', zhUrl: 'https://shyanyee.com/zh/blog/ayanna-bukit-jalil-review', video: false },
  'queenswoodz': { url: 'https://shyanyee.com/blog/queenswoodz-bukit-jalil-review', zhUrl: 'https://shyanyee.com/zh/blog/queenswoodz-bukit-jalil-review', video: false },
  'kingswoodz': { url: 'https://shyanyee.com/blog/kingswoodz-bukit-jalil-review', zhUrl: 'https://shyanyee.com/zh/blog/kingswoodz-bukit-jalil-review', video: false }
};

const APP_PROJECT_IDS: Record<string, string> = {
  "amika": "amika",
  "anya": "anya",
  "aricia": "aricia",
  "asterhillsripetaling": "aster-hill",
  "ateraphase2": "atera-phase2",
  "aurumbusinesscentresuites": "aurum-business",
  "avantroresidences": "avantro",
  "ayanna": "ayanna-res",
  "bangsarhillparktowerbc": "bangsar-hill-bc",
  "bangsarhillparkverduratowerde": "bangsar-hill-verdura",
  "clouthaus": "clouthaus-res",
  "coreresidencetrx": "core-trx",
  "genstarz": "genstarz-res",
  "luminarresidencefederalavenue": "luminar-subang",
  "maspira": "m-aspira",
  "themapleresidences": "maple-oug",
  "oakaresidences": "oaka-res",
  "oneseputeh": "one-seputeh",
  "orionresidence": "orion-bid",
  "parkgreenpavilionbukitjalil": "park-green",
  "quaverresidence": "quaver-kl",
  "radiumarena": "radium-arena",
  "rivervilleresidences2": "riverville2",
  "triaseputeh": "tria-seputeh",
  "tujuhresidences": "tujuh-kwasa",
  "vox": "vox-sentul",
  "wyn": "wyn-puchong",
  "zeniadamansara": "zenia-damansara",
  "renresidence": "ren-bukit-jalil",
  "araswcityoug": "aras-wcity",
  "thevividz": "vividz-res",
  "khayaresidence": "khaya-bangsar",
  "phoenizsuitesklcitycentre": "phoeniz-suites",
  "branniganz": "branniganz-exsim",
  "aloraresidence": "alora-subang",
  "loopcitypuchong": "loop-city",
  "thealdenz": "aldenz",
  "parkside": "parkside",
  "foresthillresidence": "foresthill",
  "amayaresidence": "amaya",
  "granddamansara": "grand-damansara",
  "stellardamansara": "stellar-damansara",
  "seresta": "seresta",
  "livista": "livista",
  "thelines": "the-lines",
  "pinnacleara": "pinnacle-ara",
  "hamptondamansara": "hampton",
  "amararesidence": "amara-res",
  "linarikwasadamansara": "linari-kwasa",
  "mahoganyresidences": "mahogany",
  "panoramaresidenceskelanajaya": "panorama-kelana",
  "arra": "arra-res",
  "paradigmmall": "paradigm-mall",
  "kwasadamansaracitycenter": "kwasa-cc",
  "thekingswoodzbukitjalil": "kingswoodz",
  "queenswoodz": "queenswoodz",
  "klwellnesscity": "wellness-city",
  "veladaz": "veladaz",
  "johorciqcausewayz": "johor-causeway",
  "rfnewcasasuites": "rf-casa",
  "gensphere": "gen-sphere",
  "genrise": "gen-rise",
  "ciq": "ciq-johor",
  "caliaresidencesbypgb": "calia-pgb",
  "bukitchagarrtsstation": "bukit-chagar",
  "mgrandminori": "m-grand-minori",
  "theaddressbymaxim": "address-maxim",
  "thearden": "arden-johor",
  "skylineonesentosabytslaw": "skyline-tslaw",
  "paragonsignaturessuite": "paragon-signatures",
  "theasteriazbyexsim": "asteriaz-exsim",
  "nadiresidencesbysouthkeycity": "nadi-southkey",
  "mbworldbay": "mb-world-bay",
  "paragongateway": "paragon-gateway"
};

async function fetchSeoProjects(): Promise<SeoProject[]> {
  if (seoProjectsCache && Date.now() - seoProjectsCache.time < SEO_CACHE_TTL) return seoProjectsCache.projects;
  const base = `https://docs.google.com/spreadsheets/d/${SEO_SPREADSHEET_ID}/export?format=csv`;
  const [listRes, detailsRes] = await Promise.all([
    fetch(`${base}&gid=${SEO_LIST_GID}&cb=${Date.now()}`),
    fetch(`${base}&gid=${SEO_DETAILS_GID}&cb=${Date.now()}`).catch(() => null)
  ]);
  if (!listRes.ok) throw new Error(`Google Sheet list tab returned ${listRes.status}`);
  const list = csvToRecords(await listRes.text());
  const details = detailsRes && detailsRes.ok ? csvToRecords(await detailsRes.text()) : [];

  const findDetail = (name: string): Record<string, string> => {
    const k = seoAlnum(name);
    return details.find(d => seoAlnum(d['project name']) === k)
      || details.find(d => { const dk = seoAlnum(d['project name']); return dk.length > 3 && (k.startsWith(dk) || dk.startsWith(k)); })
      || details.find(d => { const dk = seoAlnum(d['project name']); return dk.length > 3 && (k.includes(dk) || dk.includes(k)); })
      || {};
  };

  const seen = new Set<string>();
  const projects: SeoProject[] = list.map(row => {
    const name = row['project name'];
    const d = findDetail(name);
    // Prefer the "Full Project Details" tab, fall back to the listing tab; ignore N/A.
    const pick = (...keys: string[]) => {
      for (const k of keys) {
        const v = d[k] || row[k];
        if (v && v.toLowerCase() !== 'n/a') return v;
      }
      return '';
    };
    // Use the same id the app uses for this project (from the built-in project list, matched by name),
    // so the address in the browser, the canonical tag and the sitemap are one and the same.
    const baseSlug = APP_PROJECT_IDS[seoAlnum(name)] || seoSlugify(name) || 'project';
    let slug = baseSlug;
    let n = 2;
    while (seen.has(slug)) slug = `${baseSlug}-${n++}`;
    seen.add(slug);

    const priceRange = pick('price range');
    const { min, max } = seoPriceBounds(priceRange, pick('starting price (rm)'));
    const location = row['location'] || '';
    const address = d['full address'] || location;
    const yearA = pick('completion year');
    const yearB = row['or'] || '';
    const completionYear = /^\d{4}$/.test(yearA) ? yearA : (/^\d{4}$/.test(yearB) ? yearB : (yearA.match(/\d{4}/) || [''])[0]);

    return {
      slug, name,
      developer: pick('developer'),
      location, address,
      area: pick('area'),
      state: seoDetectState(address, location, pick('area')),
      tenure: pick('tenure'),
      propertyType: pick('project type', 'property type'),
      priceMin: min, priceMax: max, priceRange,
      builtUpMin: seoNumber(pick('built-up min (sqft)')),
      builtUpMax: seoNumber(pick('built-up max (sqft)')),
      bedroomsMin: seoNumber(pick('bedrooms min')),
      bedroomsMax: seoNumber(pick('bedrooms max')),
      completionStatus: pick('completion status'),
      completionYear,
      totalUnits: pick('total units'),
      maintenanceFee: pick('maintenance fee'),
      landTitle: pick('land title'),
      blocks: pick('no. of blocks'),
      floors: pick('no. of floors'),
      pricePsf: pick('price psf (rm)'),
      carparkMin: pick('carpark min'),
      carparkMax: pick('carpark max'),
      estCompletionDate: pick('est. completion date'),
      launchDate: pick('launch date'),
      dataUpdated: pick('data updated'),
      notes: pick('notes')
    };
  });

  seoProjectsCache = { projects, time: Date.now() };
  return projects;
}

// Mirrors the front-end findProjectBySlug: exact id, alphanumeric id, name, then prefix match.
function findSeoProject(rawSlug: string, projects: SeoProject[]): SeoProject | undefined {
  let s = rawSlug;
  try { s = decodeURIComponent(rawSlug); } catch { /* keep raw */ }
  s = s.toLowerCase().trim();
  const k = s.replace(/[^a-z0-9]/g, '');
  if (!k) return undefined;
  return projects.find(p => p.slug === s)
    || projects.find(p => p.slug.replace(/[^a-z0-9]/g, '') === k)
    || projects.find(p => seoAlnum(p.name) === k)
    || projects.find(p => k.length > 3 && (p.slug.replace(/[^a-z0-9]/g, '').startsWith(k) || k.startsWith(seoAlnum(p.name))))
    || findByTokens(s, projects);
}

// Last resort for old short ids such as "core-trx" or "tujuh-kwasa": every word of the slug must appear in the
// project name, area or location, and the first word must be in the name itself. Shortest matching name wins.
function findByTokens(slug: string, projects: SeoProject[]): SeoProject | undefined {
  const tokens = slug.split(/[^a-z0-9]+/).filter(t => t.length >= 2);
  if (!tokens.length) return undefined;
  const hits = projects.filter(p => {
    const nameKey = seoAlnum(p.name);
    const allKey = seoAlnum(`${p.name} ${p.area} ${p.location}`);
    return nameKey.includes(tokens[0]) && tokens.every(t => allKey.includes(t));
  });
  hits.sort((a, b) => a.name.length - b.name.length);
  if (hits[0]) return hits[0];
  // Old internal ids like "orion-bid": if the first word is distinctive and exactly one project name starts with it, use that.
  if (tokens[0].length >= 5) {
    const starts = projects.filter(p => seoAlnum(p.name).startsWith(tokens[0]));
    if (starts.length === 1) return starts[0];
  }
  return undefined;
}

// The built index.html (Vite adds hashed asset names, so it must be the built copy, not the source).
let indexHtmlCache: { html: string; time: number } | null = null;

async function loadIndexHtml(req: express.Request): Promise<string> {
  if (indexHtmlCache && Date.now() - indexHtmlCache.time < SEO_CACHE_TTL) return indexHtmlCache.html;
  const candidates = [path.join(process.cwd(), 'dist', 'app-shell.html'), path.join(process.cwd(), 'dist', 'index.html')];
  for (const p of candidates) {
    try {
      const html = fs.readFileSync(p, 'utf8');
      if (html.includes('/assets/') && !html.includes('id="seo-prerender"')) {
        indexHtmlCache = { html, time: Date.now() };
        return html;
      }
    } catch { /* not on disk here (Vercel); fall through to HTTP */ }
  }
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'www.propertyportal.my';
  const proto = (req.headers['x-forwarded-proto'] as string) || (host.startsWith('localhost') ? 'http' : 'https');
  const res = await fetch(`${proto}://${host}/app-shell.html`, { headers: { 'User-Agent': 'propertyportal-seo-prerender' } });
  if (!res.ok) throw new Error(`index.html fetch returned ${res.status}`);
  const html = await res.text();
  if (!html.includes('id="root"')) throw new Error('index.html fetch returned unexpected content');
  indexHtmlCache = { html, time: Date.now() };
  return html;
}

const escHtml = (s: string) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function projectSummary(p: SeoProject) {
  const price = p.priceMin ? `RM ${fmtNum(p.priceMin)}` : '';
  const sizes = p.builtUpMin && p.builtUpMax ? `${fmtNum(p.builtUpMin)}-${fmtNum(p.builtUpMax)} sqft` : '';
  const beds = p.bedroomsMin
    ? (p.bedroomsMax > p.bedroomsMin ? `${p.bedroomsMin}-${p.bedroomsMax} bedrooms` : `${p.bedroomsMin} bedrooms`)
    : '';
  const typeWords = [p.tenure, p.propertyType].filter(Boolean).join(' ');
  // Same wording pattern as the front-end SEOMeta so the title does not change once the app loads.
  const title = `${p.name} ${p.area} | Developer Price, Layout Floor Plan, Brochure & Review | propertyportal.my`;
  const description = `${p.name} by ${p.developer || 'the developer'} in ${p.area}, ${p.state}. Official developer price list${price ? ` from ${price}` : ''}, ${typeWords}${sizes ? ` with ${sizes} layouts` : ''}${beds ? ` (${beds})` : ''}. View floor plans, MRT connectivity, and schedule a sales gallery appointment on propertyportal.my.`;
  return { title, description, price, sizes, beds };
}


// ---------------------------------------------------------------------------
// Per-project detail (unit types, facilities, nearby places, key features, FAQs) from
// public/data/projectSeo.json, generated by scripts/gen-project-seo.ts from the developer
// sales kits. Loaded from disk when available, otherwise fetched as a static file.
// ---------------------------------------------------------------------------
interface ProjectSeoRecord {
  name: string; aliases: string[]; source: string;
  developer?: string; tenure?: string; landTitle?: string; landSize?: string; projectType?: string;
  totalUnits?: string; totalFloors?: string; unitsPerFloor?: string; lifts?: string;
  maintenanceFee?: string; completionYear?: string; completionStatus?: string; constructionPeriod?: string;
  address?: string; lat?: number; lng?: number; priceMin?: number; priceMax?: number; pricePsf?: string;
  builtUpMin?: number; builtUpMax?: number; bedrooms?: string; bathrooms?: string; coverImage?: string; description?: string;
  gallery?: { url: string; alt: string }[];
  keyFeatures: string[]; facilities: string[]; amenities: { category: string; name: string; distance?: string }[];
  /** Nearest named rail stations, straight-line km, measured from the project's own coordinates. */
  stations?: { name: string; km: number }[];
  layouts: { type: string; sqft?: number; beds?: string; baths?: string }[]; faqs: { q: string; a: string }[];
}
let projectSeoCache: { data: ProjectSeoRecord[]; time: number } | null = null;
async function loadProjectSeo(req: express.Request): Promise<ProjectSeoRecord[]> {
  if (projectSeoCache && Date.now() - projectSeoCache.time < SEO_CACHE_TTL) return projectSeoCache.data;
  const parse = (txt: string) => { const j = JSON.parse(txt); return Array.isArray(j.projects) ? j.projects as ProjectSeoRecord[] : []; };
  for (const p of [path.join(process.cwd(), 'dist', 'data', 'projectSeo.json'), path.join(process.cwd(), 'public', 'data', 'projectSeo.json')]) {
    try { const data = parse(fs.readFileSync(p, 'utf8')); projectSeoCache = { data, time: Date.now() }; return data; } catch { /* not here */ }
  }
  try {
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'www.propertyportal.my';
    const proto = (req.headers['x-forwarded-proto'] as string) || (host.startsWith('localhost') ? 'http' : 'https');
    const res = await fetch(`${proto}://${host}/data/projectSeo.json`, { headers: { 'User-Agent': 'propertyportal-seo-prerender' } });
    if (res.ok) { const data = parse(await res.text()); projectSeoCache = { data, time: Date.now() }; return data; }
  } catch (e) { console.warn('projectSeo.json unavailable:', e); }
  return [];
}
function findProjectSeo(p: SeoProject, records: ProjectSeoRecord[]): ProjectSeoRecord | undefined {
  const k = seoAlnum(p.name);
  if (!k) return undefined;
  return records.find(r => r.aliases.includes(k))
    || records.find(r => r.aliases.some(a => a.length >= 5 && k.length >= 5 && (a.includes(k) || k.includes(a))));
}

/** FAQs for a project page: hand-written ones when present, otherwise built from the facts we have (never invented). */
function projectFaqs(p: SeoProject, rec?: ProjectSeoRecord): { q: string; a: string }[] {
  if (rec && rec.faqs && rec.faqs.length) return rec.faqs;
  const out: { q: string; a: string }[] = [];
  const price = p.priceMin ? `RM ${fmtNum(p.priceMin)}` : (rec?.priceMin ? `RM ${fmtNum(rec.priceMin)}` : '');
  const priceMax = p.priceMax > p.priceMin ? p.priceMax : (rec?.priceMax || 0);
  const tenure = p.tenure || rec?.tenure || '';
  const title = p.landTitle || rec?.landTitle || '';
  const units = p.totalUnits || rec?.totalUnits || '';
  const floors = p.floors || rec?.totalFloors || '';
  const completion = p.estCompletionDate || p.completionYear || rec?.completionYear || '';
  const fee = p.maintenanceFee || rec?.maintenanceFee || '';
  const transit = (rec?.amenities || []).filter(a => /transport|transit|lrt|mrt|station/i.test(`${a.category} ${a.name}`)).slice(0, 3);
  if (price) out.push({ q: `What is the starting price of ${p.name}?`, a: `Developer list prices for ${p.name} start from ${price}${priceMax ? ` and go up to RM ${fmtNum(priceMax)}` : ''}${p.pricePsf ? ` (about RM ${p.pricePsf} per sq ft)` : ''}. Prices change with each release; ask for the current price list.` });
  if (tenure || title) out.push({ q: `Is ${p.name} freehold or leasehold?`, a: `${p.name} is ${tenure || 'sold'}${title ? ` under a ${title.toLowerCase()} title` : ''}${p.developer ? `, developed by ${p.developer}` : ''}.` });
  if (p.builtUpMin || (rec && rec.layouts.length)) {
    const lay = (rec?.layouts || []).filter(l => l.sqft).slice(0, 8).map(l => `Type ${l.type} ${fmtNum(l.sqft!)} sq ft${l.beds ? ` (${l.beds} bedrooms)` : ''}`).join(', ');
    out.push({ q: `What unit sizes and layouts are available at ${p.name}?`, a: `${p.builtUpMin ? `Built-up sizes range from ${fmtNum(p.builtUpMin)} to ${fmtNum(p.builtUpMax || p.builtUpMin)} sq ft${p.bedroomsMin ? ` with ${p.bedroomsMin}${p.bedroomsMax > p.bedroomsMin ? ` to ${p.bedroomsMax}` : ''} bedrooms` : ''}.` : ''}${lay ? ` Layouts: ${lay}.` : ''}`.trim() });
  }
  if (units || floors) out.push({ q: `How many units and floors does ${p.name} have?`, a: `${units ? `${units} units` : ''}${units && floors ? ' across ' : ''}${floors ? `${floors} floors` : ''}${rec?.unitsPerFloor ? `, ${rec.unitsPerFloor} units per floor` : ''}${rec?.lifts ? `, ${rec.lifts} lifts` : ''}.` });
  if (completion) out.push({ q: `When will ${p.name} be completed?`, a: `${p.completionStatus ? `${p.completionStatus}; ` : ''}estimated completion ${completion}${rec?.constructionPeriod && /month/i.test(rec.constructionPeriod) ? ` (${rec.constructionPeriod})` : ''}.` });
  if (fee) out.push({ q: `What is the maintenance fee at ${p.name}?`, a: `${fee}${/psf|sq/i.test(fee) ? '' : ' per sq ft'}, as quoted by the developer.` });
  if (transit.length) out.push({ q: `Is ${p.name} near public transport?`, a: `Nearby: ${transit.map(t => t.name + (t.distance ? ` (${t.distance})` : '')).join(', ')}.` });
  out.push({ q: `How do I view ${p.name} or get the floor plans?`, a: `WhatsApp ${AGENT.name} (${AGENT.ren}, ${AGENT.company}) at ${AGENT.telephoneDisplay}, or use the enquiry form on this page for the price list, floor plans and a sales gallery appointment.` });
  return out;
}

let ALL_PROJECTS_FOR_LINKS: SeoProject[] = [];
let PROJECT_SEO_RECORDS: ProjectSeoRecord[] = [];

/**
 * Chinese twins. None of the six sites competing for these searches serves a Chinese page, and a
 * large share of the buyers for these projects read Chinese first. The data is the same; only the
 * labels and the sentence around them change, so the two languages cannot drift apart.
 */
type Lang = 'en' | 'zh';
const ZH_FACT_LABELS: Record<string, string> = {
  'Developer': '发展商', 'Location': '地址', 'Property type': '产业类型', 'Tenure': '地契',
  'Land title': '土地用途', 'Starting price': '起价', 'Price range': '价格范围',
  'Price per sq ft': '每平方尺', 'Built-up': '建筑面积', 'Bedrooms': '房间',
  'Total units': '总单位', 'Blocks / floors': '栋数 / 楼层', 'Car park': '车位',
  'Maintenance fee': '管理费', 'Completion': '完工', 'Launch date': '推介日期',
  'Land size': '地段面积', 'Units per floor': '每层单位', 'Lifts': '电梯',
  'Construction period': '建筑期'
};
const zhTenureLabel = (t: string) => /freehold/i.test(t) ? '永久地契' : /leasehold/i.test(t) ? '租赁地契' : (t || '');
const langPrefix = (lang: Lang) => (lang === 'zh' ? '/zh' : '');
const hreflangTags = (pathAfterPrefix: string) =>
  `<link rel="alternate" hreflang="en" href="${SITE_URL}${pathAfterPrefix}" />\n    ` +
  `<link rel="alternate" hreflang="zh-Hans" href="${SITE_URL}/zh${pathAfterPrefix}" />\n    ` +
  `<link rel="alternate" hreflang="zh-Hant" href="${SITE_URL}/zh-hant${pathAfterPrefix}" />\n    ` +
  `<link rel="alternate" hreflang="x-default" href="${SITE_URL}${pathAfterPrefix}" />`;

/**
 * The matching page on shyanyee.com.
 *
 * Both sites read the same project sheet, but each makes its own slug, so the link needs a map.
 * Only fifteen projects were cross-linked before, through the review table; the rest of the
 * catalogue sat on two domains that never pointed at each other. One contextual link each way is
 * what a reader wants anyway: the portal holds the spec sheet, shyanyee holds the opinion.
 */
let shyanyeeSlugCache: Record<string, string> | null = null;
function shyanyeeSlug(name: string): string | null {
  if (!shyanyeeSlugCache) {
    try {
      const f = path.join(process.cwd(), 'public', 'data', 'shyanyee-slugs.json');
      shyanyeeSlugCache = JSON.parse(fs.readFileSync(f, 'utf8')).projects || {};
    } catch { shyanyeeSlugCache = {}; }
  }
  return shyanyeeSlugCache![seoAlnum(name)] || null;
}

function renderProjectHtml(indexHtml: string, p: SeoProject, lang: Lang = 'en'): string {
  const zh = lang === 'zh';
  const canonical = `${SITE_URL}${langPrefix(lang)}/project/${p.slug}`;
  const rec = findProjectSeo(p, PROJECT_SEO_RECORDS);
  const faqs = projectFaqs(p, rec);
  const summary = projectSummary(p);
  const { price, sizes, beds } = summary;
  const title = zh
    ? `${p.name} ${p.area} | 价格、户型图、地契与发展商资料 | propertyportal.my`
    : summary.title;
  const description = zh
    ? `${p.name}位于${p.area}${p.state ? `，${p.state}` : ''}，${zhTenureLabel(p.tenure)}${p.propertyType ? `${p.propertyType}` : ''}。${price ? `起价 ${price}。` : ''}${sizes ? `建筑面积 ${sizes}。` : ''}${beds ? `${beds} 房。` : ''}户型、设施、周边配套与完工年份，资料来自发展商。`
    : summary.description;
  const isLanded = /landed|terrace|bungalow|semi-d|semi d|villa|parkhome|townhouse/i.test(p.propertyType);
  const units = seoInt(p.totalUnits);
  const facts: [string, string][] = [
    ['Developer', p.developer],
    ['Location', p.address],
    ['Property type', p.propertyType],
    ['Tenure', p.tenure],
    ['Land title', p.landTitle],
    ['Starting price', price],
    ['Price range', p.priceRange],
    ['Price per sq ft', p.pricePsf],
    ['Built-up', sizes],
    ['Bedrooms', beds],
    ['Total units', p.totalUnits],
    ['Blocks / floors', [p.blocks && `${p.blocks} block(s)`, p.floors && `${p.floors} floors`].filter(Boolean).join(', ')],
    ['Car park', p.carparkMin ? (p.carparkMax && p.carparkMax !== p.carparkMin ? `${p.carparkMin}-${p.carparkMax} bays` : `${p.carparkMin} bay(s)`) : ''],
    ['Maintenance fee', p.maintenanceFee],
    ['Completion', [p.completionStatus, p.estCompletionDate || p.completionYear].filter(Boolean).join(', ')],
    ['Launch date', p.launchDate],
    ['Land size', rec?.landSize || ''],
    ['Units per floor', rec?.unitsPerFloor || ''],
    ['Lifts', rec?.lifts || ''],
    ['Construction period', rec?.constructionPeriod || '']
  ];
  const factRows = facts.filter(([, v]) => v);

  const graph: any[] = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      'name': 'Malaysia Homes',
      'alternateName': 'propertyportal.my',
      'url': `${SITE_URL}/`
    },
    {
      '@type': 'RealEstateAgent',
      '@id': `${SITE_URL}/#agent`,
      'name': AGENT.name,
      'alternateName': 'Malaysia Homes | propertyportal.my',
      'identifier': AGENT.ren,
      'telephone': AGENT.telephone,
      'email': AGENT.email,
      'url': `${SITE_URL}/`,
      'areaServed': ['Kuala Lumpur', 'Selangor', 'Johor', 'Penang'],
      'sameAs': ['https://maps.google.com/?cid=3195643739952877602', 'https://www.youtube.com/@shyanyee', 'https://www.instagram.com/shyanyee/', 'https://www.facebook.com/shyanyeeconsultant/', 'https://wa.me/60108278932'],
      'parentOrganization': { '@type': 'Organization', 'name': AGENT.company },
      'address': { '@type': 'PostalAddress', 'addressLocality': 'Kuala Lumpur', 'addressCountry': 'MY' }
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
        { '@type': 'ListItem', 'position': 2, 'name': primaryArea(p) ? `New launches in ${primaryArea(p)}` : 'Residences', 'item': primaryArea(p) ? `${SITE_URL}/area/${seoSlugify(primaryArea(p))}` : `${SITE_URL}/residences` },
        { '@type': 'ListItem', 'position': 3, 'name': p.name, 'item': canonical }
      ]
    },
    {
      '@type': [isLanded ? 'SingleFamilyResidence' : 'ApartmentComplex', 'Product'],
      '@id': `${canonical}#project`,
      'name': `${p.name} ${p.area}`,
      'alternateName': `${p.name} by ${p.developer}`,
      'description': description,
      'url': canonical,
      'image': (() => { const imgs = [rec?.coverImage, ...(rec?.gallery || []).map(g => g.url)].filter(Boolean); return imgs.length ? imgs : `${SITE_URL}/og_preview.jpg`; })(),
      ...(rec && rec.facilities.length ? { 'amenityFeature': rec.facilities.slice(0, 25).map(f => ({ '@type': 'LocationFeatureSpecification', 'name': f, 'value': true })) } : {}),
      ...(rec && rec.lat && rec.lng ? { 'geo': { '@type': 'GeoCoordinates', 'latitude': rec.lat, 'longitude': rec.lng } } : {}),
      'brand': p.developer ? { '@type': 'Organization', 'name': p.developer } : undefined,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': p.address,
        'addressLocality': p.area,
        'addressRegion': p.state,
        'addressCountry': 'MY'
      },
      ...(units ? { 'numberOfAccommodationUnits': units } : {}),
      ...(p.bedroomsMin ? { 'numberOfBedrooms': p.bedroomsMax > p.bedroomsMin ? `${p.bedroomsMin}-${p.bedroomsMax}` : p.bedroomsMin } : {}),
      ...(p.builtUpMin ? { 'floorSize': { '@type': 'QuantitativeValue', 'minValue': p.builtUpMin, 'maxValue': p.builtUpMax || p.builtUpMin, 'unitCode': 'FTK' } } : {}),
      ...(p.priceMin ? {
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'MYR',
          'lowPrice': p.priceMin,
          'highPrice': p.priceMax || p.priceMin,
          'offerCount': units || 1,
          'availability': 'https://schema.org/InStock',
          'url': canonical,
          'seller': { '@id': `${SITE_URL}/#agent` }
        }
      } : {}),
      'additionalProperty': factRows.map(([name, value]) => ({ '@type': 'PropertyValue', 'name': name, 'value': value }))
    }
  ];
  const vid = projectVideoSchema(p.slug, p.name);
  if (vid) graph.push(vid);
  if (faqs.length) graph.push({ '@type': 'FAQPage', '@id': `${canonical}#faq`, 'mainEntity': faqs.map(f => ({ '@type': 'Question', 'name': f.q, 'acceptedAnswer': { '@type': 'Answer', 'text': f.a } })) });
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/<\//g, '<\\/');

  const headExtra = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${escHtml(canonical)}" />`,
    `<meta property="og:title" content="${escHtml(title)}" />`,
    `<meta property="og:description" content="${escHtml(description)}" />`,
    `<meta property="og:site_name" content="Malaysia Homes | propertyportal.my" />`,
    `<meta name="twitter:title" content="${escHtml(title)}" />`,
    `<meta name="twitter:description" content="${escHtml(description)}" />`,

    `<script id="seo-jsonld-schema" type="application/ld+json">${jsonLd}</script>`
  ].join('\n    ');

  const pArea = primaryArea(p);
  const others = ALL_PROJECTS_FOR_LINKS.filter(o => o.slug !== p.slug && pArea && areaTokens(o.area).includes(pArea)).slice(0, 8);
  const table = `<table style="border-collapse:collapse;width:100%;margin:16px 0"><tbody>` +
    factRows.map(([k, v]) => `<tr><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #e7e5e4;width:40%">${escHtml(zh ? (ZH_FACT_LABELS[k] || k) : k)}</th><td style="padding:6px 8px;border-bottom:1px solid #e7e5e4">${escHtml(v)}</td></tr>`).join('') +
    `</tbody></table>`;
  const body = `<div id="seo-prerender" style="${SEO_BODY_STYLE}">` +
    `<nav aria-label="Breadcrumb"><a href="${langPrefix(lang)}/">${zh ? '首页' : 'Home'}</a> › ${pArea ? `<a href="${langPrefix(lang)}/area/${escHtml(seoSlugify(pArea))}">${escHtml(pArea)}</a>` : `<a href="/residences">${zh ? '全部楼盘' : 'Residences'}</a>`} › ${escHtml(p.name)}</nav>` +
    `<article><h1>${escHtml(p.name)} ${escHtml(p.area)}</h1><p>${escHtml(description)}</p>` +
    // The served HTML carried no <img> at all: every photo arrived through JavaScript, so image
    // search had nothing to index and the page looked empty to a crawler that does not run JS.
    (rec && rec.coverImage
      ? `<figure style="margin:16px 0"><img src="${escHtml(rec.coverImage)}" alt="${escHtml(`${p.name} — ${p.propertyType || 'residence'} in ${p.area}, ${p.state} by ${p.developer}`)}" width="1000" loading="lazy" referrerpolicy="no-referrer" style="max-width:100%;height:auto;border-radius:10px" /><figcaption style="font-size:13px;color:#78716c">${escHtml(`${p.name}, ${p.area}`)}</figcaption></figure>`
      : '') +
    // Every competitor page carries dozens of photos with alt text; this page carried one. The photos
    // come from the project's own Drive folder, read at generation time into projectSeo.json.
    (rec && rec.gallery && rec.gallery.length
      ? `<h2>${zh ? `${escHtml(p.name)} 图集` : `${escHtml(p.name)} gallery`}</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin:12px 0">${rec.gallery.filter(g => g.url !== rec.coverImage).map(g => `<img src="${escHtml(g.url)}" alt="${escHtml(g.alt)}" width="600" height="400" loading="lazy" referrerpolicy="no-referrer" style="width:100%;height:auto;border-radius:8px;object-fit:cover" />`).join('')}</div>`
      : '') +
    (rec && rec.description ? `<p>${escHtml(rec.description)}</p>` : '') +
    projectVideoHtml(p.slug, p.name) +
    `<h2>${zh ? `${escHtml(p.name)} 项目资料` : `${escHtml(p.name)} project information`}</h2>${table}` +
    (p.notes ? `<p>${escHtml(p.notes)}</p>` : '') +
    (rec && rec.layouts.length ? `<h2>${zh ? '户型与平面图' : 'Unit types and floor plans'}</h2><table style="border-collapse:collapse;width:100%;margin:12px 0"><thead><tr><th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e7e5e4">${zh ? '户型' : 'Type'}</th><th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e7e5e4">${zh ? '建筑面积' : 'Built-up'}</th><th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e7e5e4">${zh ? '房间' : 'Bedrooms'}</th><th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e7e5e4">${zh ? '浴室' : 'Bathrooms'}</th></tr></thead><tbody>${rec.layouts.map(l => `<tr><td style="padding:6px 8px;border-bottom:1px solid #e7e5e4">${escHtml(l.type)}</td><td style="padding:6px 8px;border-bottom:1px solid #e7e5e4">${l.sqft ? `${fmtNum(l.sqft)} sq ft` : '–'}</td><td style="padding:6px 8px;border-bottom:1px solid #e7e5e4">${escHtml(l.beds || '–')}</td><td style="padding:6px 8px;border-bottom:1px solid #e7e5e4">${escHtml(l.baths || '–')}</td></tr>`).join('')}</tbody></table>` : '') +
    (rec && rec.keyFeatures.length ? `<h2>${zh ? `为什么选 ${escHtml(p.name)}` : `Why choose ${escHtml(p.name)}`}</h2><ul>${rec.keyFeatures.map(f => `<li>${escHtml(f)}</li>`).join('')}</ul>` : '') +
    (rec && rec.facilities.length ? `<h2>${zh ? '项目设施' : 'Facilities'}</h2><p>${rec.facilities.map(escHtml).join(' · ')}</p>` : '') +
    (rec && rec.stations && rec.stations.length
      ? `<h2>${zh ? '最近的车站（量出来的）' : 'Nearest train stations, measured'}</h2><ul>${rec.stations.map(st => `<li><a href="${langPrefix(lang)}/near/${seoSlugify(st.name)}">${escHtml(st.name)}</a> — ${st.km < 1 ? `${Math.round(st.km * 1000)} ${zh ? '米' : 'm'}` : `${st.km.toFixed(1)} ${zh ? '公里' : 'km'}`}</li>`).join('')}</ul><p style="font-size:13px;color:#78716c">${zh ? '以上为 OpenStreetMap 直线距离，实际步行或车程会更远。' : 'Straight-line distance on OpenStreetMap. Walking or driving is always further.'}</p>`
      : '') +
    (rec && rec.amenities.length ? `<h2>${zh ? '位置与周边' : 'Location and nearby'}</h2><ul>${rec.amenities.map(a => `<li><strong>${escHtml(a.category)}:</strong> ${escHtml(a.name)}${a.distance ? ` (${escHtml(a.distance)})` : ''}</li>`).join('')}</ul>` : '') +
    (faqs.length ? `<h2>${zh ? `关于 ${escHtml(p.name)} 的常见问题` : `Frequently asked questions about ${escHtml(p.name)}`}</h2>${faqs.map(f => `<h3>${escHtml(f.q)}</h3><p>${escHtml(f.a)}</p>`).join('')}` : '') +
    // Every project links to its page on shyanyee.com, not only the fifteen with a written review.
    ((): string => {
      const sy = shyanyeeSlug(p.name);
      if (!sy || AGENT_REVIEWS[p.slug]) return '';
      return `<h2>${zh ? '我对这个楼盘的内容' : 'My coverage of this project'}</h2><p><a href="https://shyanyee.com${zh ? '/zh' : ''}/projects/${sy}">${escHtml(p.name)}${zh ? ' 在 shyanyee.com 的页面' : ' on shyanyee.com'}</a> — ${zh ? '量出来的车站距离、我走过哪些、以及同区楼盘的对比。' : 'measured distance to the nearest station, the projects I have walked, and how it compares with its neighbours.'}</p>`;
    })() +
    (AGENT_REVIEWS[p.slug] ? `<h2>Agent insights: ${escHtml(p.name)} review</h2><p><a href="${AGENT_REVIEWS[p.slug].url}">Read the ${escHtml(p.name)} review by ${escHtml(AGENT.name)} (${escHtml(AGENT.ren)})${AGENT_REVIEWS[p.slug].video ? ': video walkthrough, pros and cons' : ': pros and cons and recommended layouts'}</a> on shyanyee.com. <a href="${AGENT_REVIEWS[p.slug].zhUrl}" hreflang="zh">中文评测</a></p>` : '') +
    `<p>${zh ? '咨询与看房预约' : 'Enquiries and sales gallery appointments'}: ${escHtml(AGENT.name)}, ${escHtml(AGENT.ren)}, ${escHtml(AGENT.company)}. WhatsApp <a href="https://wa.me/60108278932">${escHtml(AGENT.telephoneDisplay)}</a>.</p>` +
    (others.length ? `<h2>${zh ? `${escHtml(pArea)} 的其他楼盘` : `Other projects in ${escHtml(pArea)}`}</h2><ul>${others.map(projectLine).join('')}</ul><p><a href="/area/${escHtml(seoSlugify(pArea))}">All new launches in ${escHtml(pArea)}</a></p>` : '') +
    `<p><a href="${langPrefix(lang)}/residences">${zh ? '全部楼盘' : 'All residences'}</a> · <a href="/compare">${zh ? '楼盘对比' : 'Compare projects'}</a> · <a href="/guide">${zh ? '买房指南' : 'Buying guide'}</a> · <a href="/calculators">${zh ? '贷款计算' : 'Loan calculator'}</a></p>` +
    `</article></div>`;

  let html = indexHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escHtml(title)}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escHtml(description)}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escHtml(canonical)}" />`);
  // The shell already carries a generic og:image. Appending the project's photo left two of each
  // tag with the generic one first, which is the one crawlers and chat previews read, so replace.
  if (rec && rec.coverImage) {
    html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escHtml(rec.coverImage)}" />`);
    html = html.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${escHtml(rec.coverImage)}" />`);
  }
  html = html.replace(/<\/head>/i, `    ${headExtra}\n    ${hreflangTags(`/project/${p.slug}`)}\n  </head>`);
  if (zh) html = html.replace(/<html([^>]*)\slang="[^"]*"/i, '<html$1 lang="zh-Hans"');
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${body}</div>`);
  return html;
}


// ---------------------------------------------------------------------------
// Static app routes (home, residences, compare, guide, calculators, map): the same
// app shell, but each with its own title, description, canonical, JSON-LD and a
// crawlable body (real links) so search engines and AI crawlers that do not run
// JavaScript still see content. React replaces the body on mount.
// ---------------------------------------------------------------------------
const STATIC_ROUTES: Record<string, { title: string; description: string; crumb: string; h1: string; index: boolean }> = {
  '/': {
    title: 'Malaysia Homes | New Condo & Landed Property Portal | propertyportal.my',
    description: 'Discover and compare top premium property developments, landed parkhomes, and luxury low-density condos in Kuala Lumpur, Selangor, and Johor on propertyportal.my. Real-time developer pricing, layouts, and expert insights.',
    crumb: 'Home', h1: 'Malaysia Homes | Premium Property Developments, Landed Parkhomes, and Luxury Condos', index: true
  },
  '/residences': {
    title: 'All Residences & New Property Launches in Malaysia | propertyportal.my',
    description: 'Explore our complete directory of luxury condominiums, serviced apartments, and landed parkhomes across Selangor, Kuala Lumpur, and Johor.',
    crumb: 'Residences', h1: 'All Residences & New Property Launches in Malaysia', index: true
  },
  '/compare': {
    title: 'Compare Properties & New Launch Condominiums | Malaysia Homes',
    description: 'Use our advanced multi-property comparison tool to compare pricing, layouts, developer track records, tenure, and location scores for top properties in Kuala Lumpur, Selangor, and Johor.',
    crumb: 'Compare', h1: 'Compare New Launch Properties in Malaysia', index: true
  },
  '/guide': {
    title: 'Malaysia Real Estate Buying Guide & Investment Insights',
    description: 'The ultimate guide to buying residential property in Malaysia. Learn about RPGT, progressive billing, stamp duty exemptions, and critical investment strategies.',
    crumb: 'Guide', h1: 'Malaysia Real Estate Buying Guide', index: true
  },
  '/calculators': {
    title: 'Malaysia Home Loan & Mortgage Calculator | Stamp Duty & RPGT',
    description: 'Calculate monthly mortgage repayments, progressive billing interest, legal fees, stamp duty, and RPGT for buying property in Malaysia.',
    crumb: 'Calculators', h1: 'Malaysia Home Loan, Stamp Duty & RPGT Calculators', index: true
  },
  '/map': {
    title: 'Interactive Property Map Directory | Kuala Lumpur & Selangor Real Estate',
    description: 'Explore properties on an interactive geographic map across Kwasa Damansara, Petaling Jaya, Subang Jaya, Puchong, Bukit Jalil, KL City Centre, and Johor.',
    crumb: 'Map', h1: 'New Launch Property Map: Kuala Lumpur, Selangor & Johor', index: true
  },
  '/favorites': { title: 'Saved Properties | propertyportal.my', description: 'Your shortlisted projects on propertyportal.my.', crumb: 'Favorites', h1: 'Saved Properties', index: false },
  '/admin': { title: 'Property CRM & Admin Sync Dashboard | Malaysia Homes', description: 'Secure administrator interface.', crumb: 'Admin', h1: 'Admin', index: false }
};
const ROUTE_ALIASES: Record<string, string> = { '/properties': '/residences', '/calculator': '/calculators', '/index.html': '/' };

function normalizeRoute(pathname: string): string {
  let p = (pathname || '/').split('?')[0].split('#')[0];
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return ROUTE_ALIASES[p] || p || '/';
}

function baseGraph(): any[] {
  return [
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, 'name': 'Malaysia Homes', 'alternateName': 'propertyportal.my', 'url': `${SITE_URL}/`, 'publisher': { '@id': `${SITE_URL}/#agent` } },
    {
      '@type': 'RealEstateAgent', '@id': `${SITE_URL}/#agent`, 'name': AGENT.name, 'alternateName': 'Malaysia Homes | propertyportal.my',
      'identifier': AGENT.ren, 'telephone': AGENT.telephone, 'email': AGENT.email, 'url': `${SITE_URL}/`,
      'areaServed': ['Kuala Lumpur', 'Selangor', 'Johor', 'Penang'],
      'sameAs': ['https://maps.google.com/?cid=3195643739952877602', 'https://www.youtube.com/@shyanyee', 'https://www.instagram.com/shyanyee/', 'https://www.facebook.com/shyanyeeconsultant/', 'https://wa.me/60108278932'],
      'parentOrganization': { '@type': 'Organization', 'name': AGENT.company },
      'address': { '@type': 'PostalAddress', 'addressLocality': 'Kuala Lumpur', 'addressCountry': 'MY' }
    }
  ];
}

/** A small cover photo for list pages, from the project's record; nothing if it has none. */
function thumbHtml(p: SeoProject, size = 96): string {
  // The build-time home prerender and the first request of a cold function reach here before any
  // route has loaded the records, so read the committed file once if the cache is still empty.
  if (!PROJECT_SEO_RECORDS.length) {
    for (const f of [path.join(process.cwd(), 'dist', 'data', 'projectSeo.json'), path.join(process.cwd(), 'public', 'data', 'projectSeo.json')]) {
      try { const j = JSON.parse(fs.readFileSync(f, 'utf8')); if (Array.isArray(j.projects)) { PROJECT_SEO_RECORDS = j.projects; break; } } catch { /* try the next */ }
    }
  }
  const rec = findProjectSeo(p, PROJECT_SEO_RECORDS);
  const url = rec?.coverImage || rec?.gallery?.[0]?.url;
  if (!url) return '';
  return `<img src="${escHtml(url)}" alt="${escHtml(`${p.name}, ${p.area}`)}" width="${size}" height="${Math.round(size * 2 / 3)}" loading="lazy" referrerpolicy="no-referrer" style="width:${size}px;height:${Math.round(size * 2 / 3)}px;object-fit:cover;border-radius:6px;vertical-align:middle;margin-right:10px" />`;
}

function projectLine(p: SeoProject): string {
  const price = p.priceMin ? `from RM ${p.priceMin.toLocaleString('en-MY')}` : '';
  const bits = [p.area && p.state ? `${p.area}, ${p.state}` : (p.area || p.state), p.tenure, p.propertyType, price].filter(Boolean);
  return `<li style="margin:0 0 10px">${thumbHtml(p)}<a href="/project/${escHtml(p.slug)}">${escHtml(p.name)}</a>${bits.length ? ` — ${escHtml(bits.join(' · '))}` : ''}</li>`;
}

function applyHead(html: string, title: string, description: string, canonical: string, graph: any[], index: boolean): string {
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/<\//g, '<\\/');
  const headExtra = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${escHtml(canonical)}" />`,
    `<meta property="og:title" content="${escHtml(title)}" />`,
    `<meta property="og:description" content="${escHtml(description)}" />`,
    `<meta property="og:site_name" content="Malaysia Homes | propertyportal.my" />`,
    `<meta name="twitter:title" content="${escHtml(title)}" />`,
    `<meta name="twitter:description" content="${escHtml(description)}" />`,
    `<script id="seo-jsonld-schema" type="application/ld+json">${jsonLd}</script>`
  ].join('\n    ');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escHtml(title)}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escHtml(description)}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escHtml(canonical)}" />`);
  if (!index) html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, `<meta name="robots" content="noindex, follow" />`);
  html = html.replace(/<\/head>/i, `    ${headExtra}\n  </head>`);
  return html;
}

const SEO_BODY_STYLE = 'padding:24px 20px;font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;color:#1c1917;line-height:1.6';

/** Chinese metadata for the static routes. Same pages, written for a Chinese reader. */
const ZH_STATIC_ROUTES: Record<string, { title: string; description: string; crumb: string; h1: string }> = {
  '/': {
    title: '马来西亚新楼盘门户 | 公寓、有地房产、地图查询 | propertyportal.my',
    description: '吉隆坡、雪兰莪、槟城、新山的新楼盘一站查询：发展商价格、户型图、地契、完工年份、周边交通，还有互动地图和对比工具。',
    crumb: '首页', h1: '马来西亚新楼盘 | 公寓、服务式公寓与有地房产'
  },
  '/residences': {
    title: '全部楼盘与新推介 | propertyportal.my',
    description: '吉隆坡、雪兰莪、槟城、新山的豪华公寓、服务式公寓与有地房产完整目录。',
    crumb: '全部楼盘', h1: '马来西亚全部楼盘与新推介'
  },
  '/compare': {
    title: '楼盘对比工具 | 价格、户型、地契一次看清 | propertyportal.my',
    description: '把几个楼盘并排比较：价格、尺价、户型面积、地契、发展商、完工年份与车位。',
    crumb: '楼盘对比', h1: '马来西亚新楼盘对比'
  },
  '/guide': {
    title: '马来西亚买房指南 | 印花税、产业盈利税、进度付款 | propertyportal.my',
    description: '买房前要弄清楚的事：印花税、律师费、产业盈利税（RPGT）、进度付款、外国人购房门槛与州政府批准。',
    crumb: '买房指南', h1: '马来西亚买房指南'
  },
  '/calculators': {
    title: '房贷计算器 | 月供、印花税、产业盈利税 | propertyportal.my',
    description: '计算月供、首付、进度付款利息、律师费、印花税与产业盈利税。',
    crumb: '计算器', h1: '马来西亚房贷、印花税与产业盈利税计算器'
  },
  '/map': {
    title: '楼盘地图 | 看清每个项目实际位置 | propertyportal.my',
    description: '在地图上看吉隆坡、雪兰莪、槟城、新山每个新楼盘的实际位置、价格与户型。',
    crumb: '地图', h1: '马来西亚新楼盘地图'
  }
};

function renderRouteHtml(indexHtml: string, route: string, projects: SeoProject[], lang: Lang = 'en'): string {
  const zh = lang === 'zh';
  const en = STATIC_ROUTES[route];
  const zhMeta = ZH_STATIC_ROUTES[route];
  const meta = zh && zhMeta ? { ...en, ...zhMeta } : en;
  const canonical = route === '/' ? `${SITE_URL}${langPrefix(lang)}/` : `${SITE_URL}${langPrefix(lang)}${route}`;
  const graph = baseGraph();
  if (route !== '/') {
    graph.push({ '@type': 'BreadcrumbList', 'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': zh ? '首页' : 'Home', 'item': `${SITE_URL}${langPrefix(lang)}/` },
      { '@type': 'ListItem', 'position': 2, 'name': meta.crumb, 'item': canonical }
    ] });
  }
  let body = '';
  if (meta.index) {
    const byState: Record<string, SeoProject[]> = {};
    for (const p of projects) (byState[p.state || 'Malaysia'] ||= []).push(p);
    if (route === '/' || route === '/residences') {
      graph.push({ '@type': 'ItemList', '@id': `${canonical}#projects`, 'name': 'New launch projects on propertyportal.my', 'numberOfItems': projects.length,
        'itemListElement': projects.map((p, i) => ({ '@type': 'ListItem', 'position': i + 1, 'name': p.name, 'url': `${SITE_URL}/project/${p.slug}` })) });
    }
    const lp = langPrefix(lang);
    const nav = zh
      ? `<nav aria-label="Site sections"><a href="${lp}/residences">全部楼盘</a> · <a href="${lp}/compare">楼盘对比</a> · <a href="${lp}/guide">买房指南</a> · <a href="${lp}/calculators">计算器</a> · <a href="${lp}/map">地图</a></nav>`
      : `<nav aria-label="Site sections"><a href="/residences">All residences</a> · <a href="/compare">Compare</a> · <a href="/guide">Buying guide</a> · <a href="/calculators">Calculators</a> · <a href="/map">Map</a></nav>`;
    const lists = Object.keys(byState).sort().map(state => `<h2>${escHtml(state)} (${byState[state].length})</h2><ul>${byState[state].map(projectLine).join('')}</ul>`).join('');
    const intro = zh
      ? `<p>${escHtml(meta.description)}</p>`
      : route === '/'
      ? `<p>Welcome to <strong>propertyportal.my</strong>, a comparison portal and interactive map directory for new launch projects, luxury condominiums, serviced apartments and landed parkhomes across Kuala Lumpur, Selangor, Johor and Penang. Each project page lists the developer price, tenure, built-up sizes, bedrooms, completion date and how to book a sales gallery visit.</p>`
      : `<p>${escHtml(meta.description)}</p>`;
    const areaLinks = (route === '/' || route === '/residences') ? areaLinksHtml(buildAreas(projects)) : '';
    body = `<div id="seo-prerender" style="${SEO_BODY_STYLE}">${nav}<h1>${escHtml(meta.h1)}</h1>${intro}` +
      (projects.length ? (zh
        ? `<p>目前收录 ${projects.length} 个楼盘。咨询：${escHtml(AGENT.name)}，${escHtml(AGENT.ren)}，${escHtml(AGENT.company)}，WhatsApp <a href="https://wa.me/60108278932">${escHtml(AGENT.telephoneDisplay)}</a>。</p>${areaLinks}${lists}`
        : `<p>${projects.length} projects listed. Enquiries: ${escHtml(AGENT.name)}, ${escHtml(AGENT.ren)}, ${escHtml(AGENT.company)}, WhatsApp <a href="https://wa.me/60108278932">${escHtml(AGENT.telephoneDisplay)}</a>.</p>${areaLinks}${lists}`) : '') +
      `</div>`;
  }
  let html = applyHead(indexHtml, meta.title, meta.description, canonical, graph, meta.index);
  html = html.replace(/<\/head>/i, `    ${hreflangTags(route === '/' ? '/' : route)}\n  </head>`);
  if (zh) html = html.replace(/<html([^>]*)\slang="[^"]*"/i, '<html$1 lang="zh-Hans"');
  if (body) html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${body}</div>`);
  return html;
}

function renderNotFoundHtml(indexHtml: string): string {
  const graph = baseGraph();
  let html = applyHead(indexHtml, 'Page not found | propertyportal.my', 'This page does not exist on propertyportal.my.', `${SITE_URL}/`, graph, false);
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root"><div id="seo-prerender" style="${SEO_BODY_STYLE}"><h1>Page not found</h1><p>The page you asked for does not exist. <a href="/">Go to the home page</a> or <a href="/residences">browse all residences</a>.</p></div></div>`);
  return html;
}


// ---------------------------------------------------------------------------
// Area pages (/area/<slug>): one page per area that has at least one project, built
// entirely from the live sheet (counts, prices, tenure mix, developers, completion).
// ---------------------------------------------------------------------------
interface SeoArea { slug: string; name: string; state: string; projects: SeoProject[] }

// Canonical area names (same list as the app's area filter). A sheet value like
// "KL City Centre / Bukit Bintang" belongs to both KL City Centre and Bukit Bintang; a bare state name is not an area.
const CANONICAL_AREAS = ['Bangsar', 'Bukit Bintang', 'Bukit Jalil', 'Chan Sow Lin', 'Cheras', 'KL City Centre', 'Kuchai Lama', 'Old Klang Road', 'OUG', 'Sentul', 'Seputeh', 'Sri Petaling', 'Sungai Besi', 'Taman Desa', 'TRX',
  'Damansara', 'Kwasa Damansara', 'Petaling Jaya', 'Puchong', 'Shah Alam', 'Subang Jaya', 'USJ',
  'Johor Bahru', 'Iskandar Puteri', 'Mount Austin', 'Puteri Harbour', 'Tebrau',
  'Bayan Lepas', 'Batu Ferringhi', 'Georgetown', 'Gurney Drive', 'Tanjung Tokong'];
const STATE_NAMES = ['kuala lumpur', 'selangor', 'johor', 'penang', 'malaysia', 'kl'];
function areaTokens(areaStr: string): string[] {
  const out: string[] = [];
  for (const raw of (areaStr || '').split(/\s*(?:\/|,|&|\band\b)\s*/i)) {
    const t = raw.trim();
    if (!t || STATE_NAMES.includes(t.toLowerCase())) continue;
    const canon = CANONICAL_AREAS.find(c => c.toLowerCase() === t.toLowerCase() || seoAlnum(c) === seoAlnum(t));
    const name = canon || t;
    if (!out.includes(name)) out.push(name);
  }
  return out;
}
const primaryArea = (p: SeoProject) => areaTokens(p.area)[0] || '';

function buildAreas(projects: SeoProject[]): SeoArea[] {
  const map = new Map<string, SeoArea>();
  for (const p of projects) {
    for (const name of areaTokens(p.area)) {
      const slug = seoSlugify(name);
      if (!slug) continue;
      let a = map.get(slug);
      if (!a) { a = { slug, name, state: '', projects: [] }; map.set(slug, a); }
      if (!a.projects.includes(p)) a.projects.push(p);
    }
  }
  for (const a of map.values()) {
    const counts: Record<string, number> = {};
    for (const p of a.projects) if (p.state && p.state !== 'Malaysia') counts[p.state] = (counts[p.state] || 0) + 1;
    a.state = Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0] || 'Malaysia';
  }
  return [...map.values()].sort((x, y) => x.state.localeCompare(y.state) || x.name.localeCompare(y.name));
}

const fmtRM = (n: number) => `RM ${fmtNum(n)}`;
const joinNames = (xs: string[]) => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;

function areaFacts(a: SeoArea) {
  const ps = a.projects;
  const priced = ps.filter(p => p.priceMin >= 50000).sort((x, y) => x.priceMin - y.priceMin);
  const tenures: Record<string, number> = {};
  for (const p of ps) { const t = (p.tenure || '').trim(); if (t) tenures[t] = (tenures[t] || 0) + 1; }
  const types: Record<string, number> = {};
  for (const p of ps) { const t = (p.propertyType || '').trim(); if (t) types[t] = (types[t] || 0) + 1; }
  const developers = [...new Set(ps.map(p => p.developer).filter(Boolean))];
  const years = ps.map(p => parseInt(p.completionYear, 10)).filter(y => y > 2000);
  const psf = ps.map(p => seoInt(p.pricePsf)).filter(v => v > 100);
  return {
    count: ps.length,
    cheapest: priced[0], priciest: priced[priced.length - 1],
    tenureText: Object.keys(tenures).map(k => `${tenures[k]} ${k.toLowerCase()}`).join(', '),
    typeText: Object.keys(types).sort((x, y) => types[y] - types[x]).map(k => `${types[k]} ${k.toLowerCase()}`).join(', '),
    developers,
    yearMin: years.length ? Math.min(...years) : 0, yearMax: years.length ? Math.max(...years) : 0,
    psfMin: psf.length ? Math.min(...psf) : 0, psfMax: psf.length ? Math.max(...psf) : 0
  };
}

function areaFaqs(a: SeoArea): { q: string; a: string }[] {
  const f = areaFacts(a);
  const out: { q: string; a: string }[] = [];
  out.push({ q: `How many new launch projects are there in ${a.name}?`,
    a: `propertyportal.my currently lists ${f.count} new launch project${f.count === 1 ? '' : 's'} in ${a.name}, ${a.state}: ${joinNames(a.projects.map(p => p.name))}.` });
  if (f.cheapest) out.push({ q: `What is the starting price for a new launch in ${a.name}?`,
    a: `Developer list prices in ${a.name} start from ${fmtRM(f.cheapest.priceMin)} at ${f.cheapest.name}${f.priciest && f.priciest !== f.cheapest ? `, and go up to ${fmtRM(f.priciest.priceMax || f.priciest.priceMin)} at ${f.priciest.name}` : ''}.${f.psfMin ? ` Per square foot prices range from about RM ${fmtNum(f.psfMin)} to RM ${fmtNum(f.psfMax)}.` : ''} Prices change with each developer release; ask for the current price list.` });
  if (f.tenureText) out.push({ q: `Are the new projects in ${a.name} freehold or leasehold?`,
    a: `Of the ${f.count} listed project${f.count === 1 ? '' : 's'}, ${f.tenureText}.${f.typeText ? ` By type: ${f.typeText}.` : ''}` });
  if (f.developers.length) out.push({ q: `Which developers are launching in ${a.name}?`,
    a: `${joinNames(f.developers)}.` });
  if (f.yearMin) out.push({ q: `When will the ${a.name} projects be completed?`,
    a: f.yearMin === f.yearMax ? `The listed projects are scheduled for completion in ${f.yearMin}.` : `Scheduled completion ranges from ${f.yearMin} to ${f.yearMax}, depending on the project.` });
  out.push({ q: `How do I book a sales gallery visit in ${a.name}?`,
    a: `WhatsApp ${AGENT.name} (${AGENT.ren}, ${AGENT.company}) at ${AGENT.telephoneDisplay} with the project name, or use the enquiry form on the project page.` });
  return out;
}

function renderAreaHtml(indexHtml: string, a: SeoArea, allAreas: SeoArea[], lang: Lang = 'en'): string {
  const zh = lang === 'zh';
  const canonical = `${SITE_URL}${langPrefix(lang)}/area/${a.slug}`;
  const f = areaFacts(a);
  const title = zh
    ? `${a.name}新楼盘 | 发展商价格、户型图、完工年份 | propertyportal.my`
    : `New Launch Projects in ${a.name}, ${a.state} | Developer Price, Floor Plans | propertyportal.my`;
  const description = zh
    ? `${a.name}（${a.state}）共 ${f.count} 个新楼盘${f.cheapest ? `，起价 ${fmtRM(f.cheapest.priceMin)}` : ''}。发展商价格、户型、地契与完工年份，看房预约。`
    : `${f.count} new launch project${f.count === 1 ? '' : 's'} in ${a.name}, ${a.state}${f.cheapest ? `, from ${fmtRM(f.cheapest.priceMin)}` : ''}${f.tenureText ? ` (${f.tenureText})` : ''}. Developer prices, layouts, completion dates and sales gallery appointments on propertyportal.my.`;
  const faqs = areaFaqs(a);
  const graph = baseGraph();
  graph.push({ '@type': 'BreadcrumbList', 'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
    { '@type': 'ListItem', 'position': 2, 'name': 'Residences', 'item': `${SITE_URL}/residences` },
    { '@type': 'ListItem', 'position': 3, 'name': a.name, 'item': canonical }
  ] });
  graph.push({ '@type': 'CollectionPage', '@id': `${canonical}#page`, 'url': canonical, 'name': title, 'description': description, 'isPartOf': { '@id': `${SITE_URL}/#website` },
    'about': { '@type': 'Place', 'name': `${a.name}, ${a.state}, Malaysia` },
    'mainEntity': { '@type': 'ItemList', 'numberOfItems': f.count, 'itemListElement': a.projects.map((p, i) => ({ '@type': 'ListItem', 'position': i + 1, 'name': p.name, 'url': `${SITE_URL}/project/${p.slug}` })) } });
  graph.push({ '@type': 'FAQPage', '@id': `${canonical}#faq`, 'mainEntity': faqs.map(x => ({ '@type': 'Question', 'name': x.q, 'acceptedAnswer': { '@type': 'Answer', 'text': x.a } })) });

  const neighbours = allAreas.filter(o => o.slug !== a.slug && o.state === a.state);
  const intro = [
    `${a.name} is in ${a.state}, Malaysia. propertyportal.my lists ${f.count} new launch project${f.count === 1 ? '' : 's'} here${f.typeText ? ` (${f.typeText})` : ''}${f.tenureText ? `; tenure: ${f.tenureText}` : ''}.`,
    f.cheapest ? `Developer list prices start from ${fmtRM(f.cheapest.priceMin)} at ${f.cheapest.name}${f.priciest && f.priciest !== f.cheapest ? ` and reach ${fmtRM(f.priciest.priceMax || f.priciest.priceMin)} at ${f.priciest.name}` : ''}.${f.psfMin ? ` Quoted prices per square foot run from about RM ${fmtNum(f.psfMin)} to RM ${fmtNum(f.psfMax)}.` : ''}` : '',
    f.developers.length ? `Developers active in ${a.name}: ${joinNames(f.developers)}.` : '',
    f.yearMin ? (f.yearMin === f.yearMax ? `Scheduled completion: ${f.yearMin}.` : `Scheduled completion runs from ${f.yearMin} to ${f.yearMax}.`) : ''
  ].filter(Boolean).map(t => `<p>${escHtml(t)}</p>`).join('');

  const cards = a.projects.map(p => {
    const bits = [p.developer, [p.tenure, p.propertyType].filter(Boolean).join(' '), p.builtUpMin ? `${fmtNum(p.builtUpMin)}-${fmtNum(p.builtUpMax || p.builtUpMin)} sq ft` : '', p.bedroomsMin ? `${p.bedroomsMin}${p.bedroomsMax > p.bedroomsMin ? `-${p.bedroomsMax}` : ''} bedrooms` : '', p.priceMin ? `from ${fmtRM(p.priceMin)}` : '', p.completionYear ? `completion ${p.estCompletionDate || p.completionYear}` : ''].filter(Boolean);
    return `<li style="margin:0 0 10px">${thumbHtml(p)}<a href="${langPrefix(lang)}/project/${escHtml(p.slug)}"><strong>${escHtml(p.name)}</strong></a> — ${escHtml(bits.join(' · '))}</li>`;
  }).join('');

  const body = `<div id="seo-prerender" style="${SEO_BODY_STYLE}">` +
    `<nav aria-label="Breadcrumb"><a href="${langPrefix(lang)}/">${zh ? '首页' : 'Home'}</a> › <a href="${langPrefix(lang)}/residences">${zh ? '全部楼盘' : 'Residences'}</a> › ${escHtml(a.name)}</nav>` +
    (zh
      ? `<h1>${escHtml(a.name)}新楼盘（${escHtml(a.state)}）</h1>${intro}`
      : `<h1>New Launch Projects in ${escHtml(a.name)}, ${escHtml(a.state)}</h1>${intro}`) +
    `<h2>${zh ? `${escHtml(a.name)} 共 ${f.count} 个新楼盘` : `${f.count} new launch project${f.count === 1 ? '' : 's'} in ${escHtml(a.name)}`}</h2><ul>${cards}</ul>` +
    `<h2>${zh ? `在 ${escHtml(a.name)} 买房的常见问题` : `Frequently asked questions about buying in ${escHtml(a.name)}`}</h2>` + faqs.map(x => `<h3>${escHtml(x.q)}</h3><p>${escHtml(x.a)}</p>`).join('') +
    (neighbours.length ? `<h2>${zh ? `${escHtml(a.state)} 的其他地区` : `Other areas in ${escHtml(a.state)}`}</h2><ul>${neighbours.map(o => `<li><a href="${langPrefix(lang)}/area/${escHtml(o.slug)}">${zh ? `${escHtml(o.name)}新楼盘` : `New launches in ${escHtml(o.name)}`}</a> (${o.projects.length})</li>`).join('')}</ul>` : '') +
    `<p>${zh ? '咨询' : 'Enquiries'}: ${escHtml(AGENT.name)}, ${escHtml(AGENT.ren)}, ${escHtml(AGENT.company)}. WhatsApp <a href="https://wa.me/60108278932">${escHtml(AGENT.telephoneDisplay)}</a>.</p>` +
    `<p><a href="${langPrefix(lang)}/residences">${zh ? '全部楼盘' : 'All residences'}</a> · <a href="/compare">${zh ? '楼盘对比' : 'Compare projects'}</a> · <a href="/guide">${zh ? '买房指南' : 'Buying guide'}</a> · <a href="/calculators">${zh ? '贷款计算' : 'Loan calculator'}</a></p>` +
    `</div>`;
  let html = applyHead(indexHtml, title, description, canonical, graph, true);
  html = html.replace(/<\/head>/i, `    ${hreflangTags(`/area/${a.slug}`)}\n  </head>`);
  if (zh) html = html.replace(/<html([^>]*)\slang="[^"]*"/i, '<html$1 lang="zh-Hans"');
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${body}</div>`);
  return html;
}

/**
 * Comparison pages: /compare/<a>-vs-<b>.
 *
 * Buyers at the end of their search are choosing between two named projects, and that is what they
 * type. Pairs are built from the live sheet — same area, and close enough in price that the choice is
 * real — so the set grows by itself as projects are added. Every figure on the page comes from the
 * same rows the project pages use; nothing is written by hand.
 */
interface ComparePair { slug: string; a: SeoProject; b: SeoProject; area: string }

/** Same area, overlapping budget, both priced: the pairs a buyer would actually weigh against each other. */
function buildComparePairs(projects: SeoProject[]): ComparePair[] {
  // Group by EVERY area a project sits in, not just the first one: "Bukit Bintang / KL City Centre"
  // and "KL City Centre" are the same neighbourhood to a buyer, and taking only the first token put
  // them in different buckets.
  const byArea: Record<string, SeoProject[]> = {};
  for (const p of projects) {
    if (!p.priceMin || !p.area) continue;
    for (const name of areaTokens(p.area)) (byArea[name] ||= []).push(p);
  }
  const pairs: ComparePair[] = [];
  const seen = new Set<string>();
  for (const [area, list] of Object.entries(byArea)) {
    const sorted = [...list].sort((x, y) => x.priceMin - y.priceMin);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i], b = sorted[j];
        // Within 60% of each other: past that the buyer is not really choosing between them.
        if (b.priceMin > a.priceMin * 1.6) break;
        const slug = `${a.slug}-vs-${b.slug}`;
        const flipped = `${b.slug}-vs-${a.slug}`;
        if (seen.has(slug) || seen.has(flipped)) continue;
        seen.add(slug);
        pairs.push({ slug, a, b, area });
      }
    }
  }
  return pairs;
}

function findComparePair(slug: string, projects: SeoProject[]): ComparePair | null {
  const want = String(slug || '').toLowerCase().replace(/\/$/, '');
  const pairs = buildComparePairs(projects);
  const hit = pairs.find(p => p.slug === want);
  if (hit) return hit;
  // Also answer the reversed order rather than 404 on it.
  const flipped = pairs.find(p => `${p.b.slug}-vs-${p.a.slug}` === want);
  return flipped ? { slug: want, a: flipped.b, b: flipped.a, area: flipped.area } : null;
}

/** The rows a buyer actually weighs, in the order they ask about them. */
function compareRows(a: SeoProject, b: SeoProject, lang: Lang = 'en'): { label: string; a: string; b: string }[] {
  const zh = lang === 'zh';
  const price = (p: SeoProject) => p.priceMin ? (zh ? `${fmtRM(p.priceMin)} 起${p.priceMax > p.priceMin ? `，最高 ${fmtRM(p.priceMax)}` : ''}` : `from ${fmtRM(p.priceMin)}${p.priceMax > p.priceMin ? ` to ${fmtRM(p.priceMax)}` : ''}`) : '';
  const size = (p: SeoProject) => p.builtUpMin ? `${fmtNum(p.builtUpMin)}-${fmtNum(p.builtUpMax || p.builtUpMin)} ${zh ? '平方尺' : 'sq ft'}` : '';
  const beds = (p: SeoProject) => p.bedroomsMin ? `${p.bedroomsMin}${p.bedroomsMax > p.bedroomsMin ? `-${p.bedroomsMax}` : ''}` : '';
  const done = (p: SeoProject) => [p.completionStatus, p.estCompletionDate || p.completionYear].filter(Boolean).join(' ');
  return [
    { label: zh ? '发展商' : 'Developer', a: a.developer, b: b.developer },
    { label: zh ? '地址' : 'Address', a: a.address || a.location, b: b.address || b.location },
    { label: zh ? '地契' : 'Tenure', a: a.tenure, b: b.tenure },
    { label: zh ? '土地用途' : 'Land title', a: a.landTitle, b: b.landTitle },
    { label: zh ? '产业类型' : 'Property type', a: a.propertyType, b: b.propertyType },
    { label: zh ? '价格' : 'Price', a: price(a), b: price(b) },
    { label: zh ? '每平方尺' : 'Price psf', a: a.pricePsf, b: b.pricePsf },
    { label: zh ? '建筑面积' : 'Built-up', a: size(a), b: size(b) },
    { label: zh ? '房间' : 'Bedrooms', a: beds(a), b: beds(b) },
    { label: zh ? '总单位' : 'Total units', a: a.totalUnits, b: b.totalUnits },
    { label: zh ? '栋数 / 楼层' : 'Blocks / floors', a: [a.blocks, a.floors].filter(Boolean).join(' / '), b: [b.blocks, b.floors].filter(Boolean).join(' / ') },
    { label: zh ? '车位' : 'Car parks', a: [a.carparkMin, a.carparkMax].filter(Boolean).join('-'), b: [b.carparkMin, b.carparkMax].filter(Boolean).join('-') },
    { label: zh ? '管理费' : 'Maintenance fee', a: a.maintenanceFee, b: b.maintenanceFee },
    { label: zh ? '完工' : 'Completion', a: done(a), b: done(b) }
  ].filter(r => r.a || r.b);
}

/** Differences worth a sentence, stated as facts only — the reader decides which matters to them. */
function compareVerdict(a: SeoProject, b: SeoProject): string[] {
  const out: string[] = [];
  if (a.priceMin && b.priceMin && a.priceMin !== b.priceMin) {
    const lo = a.priceMin < b.priceMin ? a : b, hi = lo === a ? b : a;
    out.push(`${lo.name} starts lower, at ${fmtRM(lo.priceMin)} against ${fmtRM(hi.priceMin)}.`);
  }
  if (a.tenure && b.tenure && a.tenure !== b.tenure) out.push(`${a.name} is ${a.tenure.toLowerCase()}; ${b.name} is ${b.tenure.toLowerCase()}.`);
  if (a.landTitle && b.landTitle && a.landTitle !== b.landTitle) out.push(`Land title differs: ${a.name} is ${a.landTitle.toLowerCase()}, ${b.name} is ${b.landTitle.toLowerCase()}. Residential title is billed at domestic utility rates.`);
  const fa = parseFloat(String(a.maintenanceFee).replace(/[^0-9.]/g, '')), fb = parseFloat(String(b.maintenanceFee).replace(/[^0-9.]/g, ''));
  if (isFinite(fa) && isFinite(fb) && fa !== fb) {
    const lo = fa < fb ? a : b;
    out.push(`${lo.name} has the lower monthly charge, at ${lo.maintenanceFee}.`);
  }
  if (a.builtUpMax && b.builtUpMax && a.builtUpMax !== b.builtUpMax) {
    const big = a.builtUpMax > b.builtUpMax ? a : b;
    out.push(`${big.name} goes larger, up to ${fmtNum(big.builtUpMax)} sq ft.`);
  }
  const firstNum = (v: string) => { const m = String(v || '').match(/[\d,]+/); return m ? parseInt(m[0].replace(/,/g, ''), 10) : NaN; };
  const ua = firstNum(a.totalUnits), ub = firstNum(b.totalUnits);
  if (isFinite(ua) && isFinite(ub) && ua !== ub) {
    const small = ua < ub ? a : b;
    out.push(`${small.name} is the smaller community, at ${fmtNum(small === a ? ua : ub)} units.`);
  }
  const ya = parseInt(String(a.completionYear).replace(/[^0-9]/g, '').slice(0, 4), 10), yb = parseInt(String(b.completionYear).replace(/[^0-9]/g, '').slice(0, 4), 10);
  if (isFinite(ya) && isFinite(yb) && ya !== yb) {
    const early = ya < yb ? a : b;
    out.push(`${early.name} completes earlier, in ${early.completionYear}.`);
  }
  return out;
}

/**
 * The agent's verdict in the first person: who each one suits and who it does not.
 *
 * The shape follows a draft Gemini wrote from one real pair, rewritten here as rules so all pairs get
 * it: lead with the one that is ready or cheaper to hold, name its cost, then the other and its cost.
 * Every clause is driven by a figure already in the table — nothing is asserted that the data does
 * not support, and no claim is made about future prices.
 */
function compareOpinion(a: SeoProject, b: SeoProject): string {
  const fee = (p: SeoProject) => parseFloat(String(p.maintenanceFee).replace(/[^0-9.]/g, ''));
  // "1,260 (630 per tower)" must read as 1260, not 1260630 — take the first number only.
  const units = (p: SeoProject) => {
    const m = String(p.totalUnits || '').match(/[\d,]+/);
    return m ? parseInt(m[0].replace(/,/g, ''), 10) : NaN;
  };
  const ready = (p: SeoProject) => /ready|completed/i.test(p.completionStatus);
  const parts: string[] = [];

  // Waiting versus moving in is the first question a buyer asks when one of the two is finished.
  if (ready(a) !== ready(b)) {
    const done = ready(a) ? a : b, waiting = done === a ? b : a;
    const when = waiting.estCompletionDate || waiting.completionYear;
    parts.push(`If you want to move in now, ${done.name} is the one to see: it is finished, so you can walk the actual unit rather than judge it from a plan.`);
    parts.push(`${waiting.name} is still under construction${when ? `, completing ${when}` : ''}, which only suits you if the wait is not a problem.`);
  }

  // Monthly cost separates two otherwise similar buildings more than the purchase price does.
  const fa = fee(a), fb = fee(b);
  if (isFinite(fa) && isFinite(fb) && fa !== fb) {
    const cheap = fa < fb ? a : b, dear = cheap === a ? b : a;
    parts.push(`On holding cost, ${cheap.name} is the lighter one at ${cheap.maintenanceFee} against ${dear.maintenanceFee}; on a 1,000 sq ft unit that difference runs to a few hundred ringgit a month, every month.`);
  }

  const ua = units(a), ub = units(b);
  if (isFinite(ua) && isFinite(ub) && Math.abs(ua - ub) > 100) {
    const small = ua < ub ? a : b, big = small === a ? b : a;
    parts.push(`${small.name} is the quieter building at ${fmtNum(small === a ? ua : ub)} units against ${fmtNum(big === a ? ua : ub)}, which shows up in lift waits and how busy the facilities feel.`);
  }

  if (a.priceMin && b.priceMin && a.priceMin !== b.priceMin) {
    const lo = a.priceMin < b.priceMin ? a : b;
    parts.push(`${lo.name} has the lower entry price at ${fmtRM(lo.priceMin)}, though the layout you end up choosing matters more than the headline figure.`);
  }

  if (a.tenure && b.tenure && a.tenure !== b.tenure) {
    const fh = /freehold/i.test(a.tenure) ? a : b;
    parts.push(`${fh.name} is freehold, so there is no lease to renew and no state consent to wait for on a later sale.`);
  }

  if (!parts.length) return '';
  return parts.slice(0, 4).join(' ') + ` Either way, ask for the current price list and walk both before you decide — I can arrange that.`;
}

function compareFaqs(a: SeoProject, b: SeoProject): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  if (a.priceMin && b.priceMin) faqs.push({ q: `Which is cheaper, ${a.name} or ${b.name}?`, a: `${a.priceMin <= b.priceMin ? a.name : b.name} has the lower developer list price, from ${fmtRM(Math.min(a.priceMin, b.priceMin))}. ${a.priceMin <= b.priceMin ? b.name : a.name} starts from ${fmtRM(Math.max(a.priceMin, b.priceMin))}. Price lists change with each release, so confirm the current one.` });
  if (a.tenure || b.tenure) faqs.push({ q: `Is ${a.name} or ${b.name} freehold?`, a: `${a.name} is ${a.tenure || 'not stated'}; ${b.name} is ${b.tenure || 'not stated'}.` });
  if (a.maintenanceFee || b.maintenanceFee) faqs.push({ q: `How do the maintenance fees compare?`, a: `${a.name}: ${a.maintenanceFee || 'not stated'}. ${b.name}: ${b.maintenanceFee || 'not stated'}. The sale and purchase agreement governs the final rate.` });
  if (a.completionYear || b.completionYear) faqs.push({ q: `Which one is ready first?`, a: `${a.name}: ${[a.completionStatus, a.estCompletionDate || a.completionYear].filter(Boolean).join(' ') || 'not stated'}. ${b.name}: ${[b.completionStatus, b.estCompletionDate || b.completionYear].filter(Boolean).join(' ') || 'not stated'}.` });
  faqs.push({ q: `Can I view both ${a.name} and ${b.name} on the same day?`, a: `Yes. Both are in the same area. WhatsApp ${AGENT.name} (${AGENT.ren}, ${AGENT.company}) on ${AGENT.telephoneDisplay} to arrange back-to-back viewings.` });
  return faqs;
}

/** The Chinese half of the head-to-head page. Same rules, written for a Chinese reader. */
function compareVerdictZh(a: SeoProject, b: SeoProject): string[] {
  const out: string[] = [];
  if (a.priceMin && b.priceMin && a.priceMin !== b.priceMin) {
    const lo = a.priceMin < b.priceMin ? a : b, hi = lo === a ? b : a;
    out.push(`${lo.name} 起价较低，${fmtRM(lo.priceMin)} 对 ${fmtRM(hi.priceMin)}。`);
  }
  if (a.tenure && b.tenure && a.tenure !== b.tenure) out.push(`${a.name} 是${zhTenureLabel(a.tenure)}，${b.name} 是${zhTenureLabel(b.tenure)}。`);
  if (a.landTitle && b.landTitle && a.landTitle !== b.landTitle) out.push(`土地用途不同：${a.name} 是 ${a.landTitle}，${b.name} 是 ${b.landTitle}。住宅地契的水电费按住宅价计算。`);
  const fa = parseFloat(String(a.maintenanceFee).replace(/[^0-9.]/g, '')), fb = parseFloat(String(b.maintenanceFee).replace(/[^0-9.]/g, ''));
  if (isFinite(fa) && isFinite(fb) && fa !== fb) {
    const lo = fa < fb ? a : b;
    out.push(`${lo.name} 的月费比较低，${lo.maintenanceFee}。`);
  }
  if (a.builtUpMax && b.builtUpMax && a.builtUpMax !== b.builtUpMax) {
    const big = a.builtUpMax > b.builtUpMax ? a : b;
    out.push(`${big.name} 有更大的户型，最大 ${fmtNum(big.builtUpMax)} 平方尺。`);
  }
  return out;
}

function compareOpinionZh(a: SeoProject, b: SeoProject): string {
  const fee = (p: SeoProject) => parseFloat(String(p.maintenanceFee).replace(/[^0-9.]/g, ''));
  const units = (p: SeoProject) => { const m = String(p.totalUnits || '').match(/[\d,]+/); return m ? parseInt(m[0].replace(/,/g, ''), 10) : NaN; };
  const ready = (p: SeoProject) => /ready|completed/i.test(p.completionStatus);
  const parts: string[] = [];
  if (ready(a) !== ready(b)) {
    const done = ready(a) ? a : b, waiting = done === a ? b : a;
    const when = waiting.estCompletionDate || waiting.completionYear;
    parts.push(`想现在就搬进去，看 ${done.name}：它已经完工，你走进去看到的就是实体单位，不是图纸。`);
    parts.push(`${waiting.name} 还在建${when ? `，预计 ${when} 完工` : ''}，等得起才适合。`);
  }
  const fa = fee(a), fb = fee(b);
  if (isFinite(fa) && isFinite(fb) && fa !== fb) {
    const cheap = fa < fb ? a : b, dear = cheap === a ? b : a;
    parts.push(`持有成本上 ${cheap.name} 比较轻，${cheap.maintenanceFee} 对 ${dear.maintenanceFee}；一间 1,000 平方尺的单位，每个月差几百令吉，月月都差。`);
  }
  const ua = units(a), ub = units(b);
  if (isFinite(ua) && isFinite(ub) && Math.abs(ua - ub) > 100) {
    const small = ua < ub ? a : b, big = small === a ? b : a;
    parts.push(`${small.name} 比较安静，${fmtNum(small === a ? ua : ub)} 个单位对 ${fmtNum(big === a ? ua : ub)} 个，等电梯和设施挤不挤，差别就在这里。`);
  }
  if (a.priceMin && b.priceMin && a.priceMin !== b.priceMin) {
    const lo = a.priceMin < b.priceMin ? a : b;
    parts.push(`${lo.name} 入场价较低，${fmtRM(lo.priceMin)}，不过最后选哪个户型，比这个数字更重要。`);
  }
  if (a.tenure && b.tenure && a.tenure !== b.tenure) {
    const fh = /freehold/i.test(a.tenure) ? a : b;
    parts.push(`${fh.name} 是永久地契，没有地契年限要续，日后转售也不用等州政府批准。`);
  }
  if (!parts.length) return '';
  return parts.slice(0, 4).join('') + `无论选哪一个，先拿最新价目表、两个都走一趟再决定 —— 我可以安排。`;
}

function compareFaqsZh(a: SeoProject, b: SeoProject): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  if (a.priceMin && b.priceMin) out.push({ q: `${a.name} 和 ${b.name} 哪个比较便宜？`, a: `${a.priceMin <= b.priceMin ? a.name : b.name} 的发展商开价较低，${fmtRM(Math.min(a.priceMin, b.priceMin))} 起；${a.priceMin <= b.priceMin ? b.name : a.name} 是 ${fmtRM(Math.max(a.priceMin, b.priceMin))} 起。价目表每一期都会变，请以最新的为准。` });
  if (a.tenure || b.tenure) out.push({ q: `${a.name} 和 ${b.name} 是永久地契吗？`, a: `${a.name}：${zhTenureLabel(a.tenure) || '资料未列明'}。${b.name}：${zhTenureLabel(b.tenure) || '资料未列明'}。` });
  if (a.maintenanceFee || b.maintenanceFee) out.push({ q: `两个的管理费差多少？`, a: `${a.name}：${a.maintenanceFee || '资料未列明'}。${b.name}：${b.maintenanceFee || '资料未列明'}。最终收费以买卖合约为准。` });
  if (a.completionYear || b.completionYear) out.push({ q: `哪一个先完工？`, a: `${a.name}：${[a.completionStatus, a.estCompletionDate || a.completionYear].filter(Boolean).join(' ') || '资料未列明'}。${b.name}：${[b.completionStatus, b.estCompletionDate || b.completionYear].filter(Boolean).join(' ') || '资料未列明'}。` });
  out.push({ q: `可以同一天看 ${a.name} 和 ${b.name} 吗？`, a: `可以，两个在同一区。WhatsApp ${AGENT.name}（${AGENT.ren}，${AGENT.company}）${AGENT.telephoneDisplay}，我帮你排在一起。` });
  return out;
}

function renderCompareHtml(indexHtml: string, pair: ComparePair, projects: SeoProject[], lang: Lang = 'en'): string {
  const zh = lang === 'zh';
  const { a, b } = pair;
  const pathAfter = `/compare/${a.slug}-vs-${b.slug}`;
  const canonical = `${SITE_URL}${langPrefix(lang)}${pathAfter}`;
  const area = pair.area || primaryArea(a);
  const title = zh
    ? `${a.name} 对比 ${b.name} | 价格、面积、地契一次看清 | propertyportal.my`
    : `${a.name} vs ${b.name} | Price, Size, Tenure Compared | propertyportal.my`;
  const description = zh
    ? `${a.name} 与 ${b.name} 同在${area}，并排比较发展商开价、建筑面积、地契、总单位、管理费与完工年份，资料取自发展商。`
    : `Side-by-side comparison of ${a.name} and ${b.name} in ${area}: developer list price, built-up, tenure, total units, maintenance fee and completion, from the developer data.`;
  const rows = compareRows(a, b, lang);
  const verdict = zh ? compareVerdictZh(a, b) : compareVerdict(a, b);
  const faqs = zh ? compareFaqsZh(a, b) : compareFaqs(a, b);

  const graph = baseGraph();
  graph.push({ '@type': 'BreadcrumbList', 'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': zh ? '首页' : 'Home', 'item': `${SITE_URL}${langPrefix(lang)}/` },
    { '@type': 'ListItem', 'position': 2, 'name': zh ? '楼盘对比' : 'Compare', 'item': `${SITE_URL}${langPrefix(lang)}/compare` },
    { '@type': 'ListItem', 'position': 3, 'name': `${a.name} vs ${b.name}`, 'item': canonical }
  ] });
  graph.push({ '@type': 'WebPage', '@id': `${canonical}#page`, 'url': canonical, 'name': title, 'description': description, 'isPartOf': { '@id': `${SITE_URL}/#website` },
    'mainEntity': { '@type': 'ItemList', 'numberOfItems': 2, 'itemListElement': [a, b].map((p, i) => ({ '@type': 'ListItem', 'position': i + 1, 'name': p.name, 'url': `${SITE_URL}/project/${p.slug}` })) } });
  graph.push({ '@type': 'FAQPage', '@id': `${canonical}#faq`, 'mainEntity': faqs.map(x => ({ '@type': 'Question', 'name': x.q, 'acceptedAnswer': { '@type': 'Answer', 'text': x.a } })) });

  const table = `<table style="border-collapse:collapse;width:100%;margin:12px 0">` +
    `<thead><tr><th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e7e5e4"></th>` +
    `<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e7e5e4">${escHtml(a.name)}</th>` +
    `<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e7e5e4">${escHtml(b.name)}</th></tr></thead><tbody>` +
    rows.map(r => `<tr><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #f5f5f4">${escHtml(r.label)}</th>` +
      `<td style="padding:6px 8px;border-bottom:1px solid #f5f5f4">${escHtml(r.a || '—')}</td>` +
      `<td style="padding:6px 8px;border-bottom:1px solid #f5f5f4">${escHtml(r.b || '—')}</td></tr>`).join('') +
    `</tbody></table>`;

  const others = buildComparePairs(projects).filter(p => p.slug !== pair.slug && p.area === area).slice(0, 8);

  const body = `<div id="seo-prerender" style="${SEO_BODY_STYLE}">` +
    `<nav aria-label="Breadcrumb"><a href="${langPrefix(lang)}/">${zh ? '首页' : 'Home'}</a> › <a href="${langPrefix(lang)}/compare">${zh ? '楼盘对比' : 'Compare'}</a> › ${escHtml(a.name)} vs ${escHtml(b.name)}</nav>` +
    `<h1>${escHtml(a.name)} ${zh ? '对比' : 'vs'} ${escHtml(b.name)}</h1>` +
    `<p>${zh ? `两个都在${escHtml(area)}。下面这张表是两边的发展商资料，并排放。` : `Both are in ${escHtml(area)}. The table below is the developer data for each, side by side.`}</p>` +
    `<h2>${zh ? '并排比较' : 'Side-by-side comparison'}</h2>${table}` +
    (verdict.length ? `<h2>${zh ? '实际差在哪里' : 'What actually differs'}</h2><ul>${verdict.map(v => `<li>${escHtml(v)}</li>`).join('')}</ul>` : '') +
    ((): string => { const op = zh ? compareOpinionZh(a, b) : compareOpinion(a, b); return op ? `<h2>${zh ? '我会推荐哪一个' : 'Which one I would point you to'}</h2><p>${escHtml(op)}</p><p><em>${escHtml(AGENT.name)}, ${escHtml(AGENT.ren)}, ${escHtml(AGENT.company)}</em></p>` : ''; })() +
    `<h2>${zh ? '完整资料' : 'Full details'}</h2><p><a href="${langPrefix(lang)}/project/${escHtml(a.slug)}">${escHtml(a.name)}${zh ? ' 户型、设施与周边' : ' floor plans, facilities and nearby places'}</a> · <a href="${langPrefix(lang)}/project/${escHtml(b.slug)}">${escHtml(b.name)}${zh ? ' 户型、设施与周边' : ' floor plans, facilities and nearby places'}</a></p>` +
    `<h2>${zh ? '常见问题' : 'Frequently asked questions'}</h2>` + faqs.map(x => `<h3>${escHtml(x.q)}</h3><p>${escHtml(x.a)}</p>`).join('') +
    (others.length ? `<h2>${zh ? `${escHtml(area)} 的其他对比` : `Other comparisons in ${escHtml(area)}`}</h2><ul>${others.map(o => `<li><a href="${langPrefix(lang)}/compare/${escHtml(o.slug)}">${escHtml(o.a.name)} vs ${escHtml(o.b.name)}</a></li>`).join('')}</ul>` : '') +
    `<p>${zh ? '咨询与看房' : 'Enquiries and viewings'}: ${escHtml(AGENT.name)}, ${escHtml(AGENT.ren)}, ${escHtml(AGENT.company)}. WhatsApp <a href="https://wa.me/60108278932">${escHtml(AGENT.telephoneDisplay)}</a>.</p>` +
    `<p><a href="${langPrefix(lang)}/residences">${zh ? '全部楼盘' : 'All residences'}</a> · <a href="${langPrefix(lang)}/area/${escHtml(seoSlugify(area))}">${zh ? `${escHtml(area)}新楼盘` : `New launches in ${escHtml(area)}`}</a> · <a href="${langPrefix(lang)}/compare">${zh ? '楼盘对比' : 'Compare projects'}</a></p>` +
    `</div>`;
  let html = applyHead(indexHtml, title, description, canonical, graph, true);
  html = html.replace(/<\/head>/i, `    ${hreflangTags(pathAfter)}\n  </head>`);
  if (zh) html = html.replace(/<html([^>]*)\slang="[^"]*"/i, '<html$1 lang="zh-Hans"');
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${body}</div>`);
  return html;
}

/**
 * Budget and purpose shortlists: /best/<slug>.
 *
 * "Condo under RM500k KL", "condo near MRT", "best for own stay" — buyers search by what they can
 * spend and why they are buying, not by project name. Each list is a filter over the live sheet, so
 * it re-sorts itself as prices and projects change; nothing here is a hand-written list.
 */
interface Shortlist {
  slug: string; h1: string; title: string; blurb: string;
  pick: (p: SeoProject) => boolean;
  sort?: (a: SeoProject, b: SeoProject) => number;
}

const SHORTLISTS: Shortlist[] = [
  { slug: 'condo-under-500k-kuala-lumpur', h1: 'New Launch Condominiums Under RM 500,000 in Kuala Lumpur and Selangor',
    title: 'Condo Under RM 500,000 | New Launch Shortlist',
    blurb: 'Every project on propertyportal.my with a developer list price starting under RM 500,000.',
    pick: p => p.priceMin > 0 && p.priceMin < 500000 },
  { slug: 'condo-under-700k-kuala-lumpur', h1: 'New Launch Condominiums Under RM 700,000 in Kuala Lumpur and Selangor',
    title: 'Condo Under RM 700,000 | New Launch Shortlist',
    blurb: 'Projects starting under RM 700,000, the band most first-time upgraders shop in.',
    pick: p => p.priceMin > 0 && p.priceMin < 700000 },
  { slug: 'condo-under-1-million-kuala-lumpur', h1: 'New Launch Condominiums Under RM 1 Million in Kuala Lumpur and Selangor',
    title: 'Condo Under RM 1 Million | New Launch Shortlist',
    blurb: 'Projects starting under RM 1,000,000. Foreign buyers should note the state minimum purchase price is RM 1,000,000 in Kuala Lumpur and most of Selangor.',
    pick: p => p.priceMin > 0 && p.priceMin < 1000000 },
  { slug: 'freehold-new-launch', h1: 'Freehold New Launch Projects in Kuala Lumpur, Selangor and Johor',
    title: 'Freehold New Launch Projects | Shortlist',
    blurb: 'Freehold title only. The land is held without an expiry date, so there is no lease to renew and no state consent needed on a later sale.',
    pick: p => /freehold/i.test(p.tenure) },
  { slug: 'residential-title-projects', h1: 'New Launch Projects with a Residential Title',
    title: 'Residential Title New Launches | Shortlist',
    blurb: 'Residential title means utilities and assessment are billed at domestic rates rather than commercial ones, which lowers the monthly cost of living there.',
    pick: p => /residential/i.test(p.landTitle) },
  { slug: 'family-size-3-bedroom-new-launch', h1: 'Three-Bedroom and Larger New Launch Projects',
    title: '3-Bedroom New Launch Projects | Family Shortlist',
    blurb: 'Projects where the layouts start at three bedrooms, for households that need the rooms rather than the address.',
    pick: p => p.bedroomsMin >= 3 },
  { slug: 'low-density-new-launch', h1: 'Low-Density New Launch Projects Under 500 Units',
    title: 'Low-Density New Launch Projects | Shortlist',
    blurb: 'Fewer homes sharing the lifts, the pool and the car park. Under 500 units in total.',
    pick: p => { const n = parseInt(String(p.totalUnits).replace(/[^0-9]/g, ''), 10); return isFinite(n) && n > 0 && n < 500; } },
  { slug: 'ready-to-move-in', h1: 'Completed and Ready-to-Move-In Projects',
    title: 'Ready to Move In | Completed Project Shortlist',
    blurb: 'Buildings you can walk through and move into, rather than buy off a plan.',
    pick: p => /ready|completed/i.test(p.completionStatus) }
];

/** Cheapest first for the budget lists; everything else by starting price too, so the table reads consistently. */
function shortlistProjects(sl: Shortlist, projects: SeoProject[]): SeoProject[] {
  return projects.filter(sl.pick).sort(sl.sort || ((a, b) => (a.priceMin || Infinity) - (b.priceMin || Infinity)));
}

function shortlistFaqs(sl: Shortlist, picks: SeoProject[]): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  const cheapest = picks.find(p => p.priceMin);
  if (cheapest) out.push({ q: `What is the cheapest project on this list?`, a: `${cheapest.name} in ${primaryArea(cheapest)}, from ${fmtRM(cheapest.priceMin)}. Developer price lists change with each release, so confirm the current one before deciding.` });
  const areas = [...new Set(picks.map(primaryArea).filter(Boolean))];
  if (areas.length) out.push({ q: `Which areas are covered?`, a: `${joinNames(areas)}.` });
  const fh = picks.filter(p => /freehold/i.test(p.tenure)).length;
  if (picks.length) out.push({ q: `How many of these are freehold?`, a: `${fh} of ${picks.length}. The rest are leasehold. Tenure is listed on each project page.` });
  out.push({ q: `How often is this list updated?`, a: `It is generated from the project database each time the page is served, so a price change or a new project appears here straight away.` });
  out.push({ q: `Can I view several of these on one day?`, a: `Yes, where they are in the same area. WhatsApp ${AGENT.name} (${AGENT.ren}, ${AGENT.company}) on ${AGENT.telephoneDisplay} with your budget and preferred area.` });
  return out;
}

/** Chinese titles and one-liners for the eight shortlists; the rows come from the same data. */
const ZH_SHORTLISTS: Record<string, { h1: string; title: string; blurb: string }> = {
  'condo-under-500k-kuala-lumpur': { h1: '吉隆坡与雪兰莪 50 万以下新楼盘', title: '50 万以下公寓 | 新楼盘清单', blurb: '发展商开价 50 万令吉以下的全部楼盘。' },
  'condo-under-700k-kuala-lumpur': { h1: '吉隆坡与雪兰莪 70 万以下新楼盘', title: '70 万以下公寓 | 新楼盘清单', blurb: '发展商开价 70 万令吉以下的全部楼盘。' },
  'condo-under-1-million-kuala-lumpur': { h1: '吉隆坡与雪兰莪 100 万以下新楼盘', title: '100 万以下公寓 | 新楼盘清单', blurb: '发展商开价 100 万令吉以下的全部楼盘。外国人在吉隆坡与雪兰莪大部分地区的最低购房门槛是 100 万令吉。' },
  'freehold-new-launch': { h1: '永久地契新楼盘', title: '永久地契楼盘清单', blurb: '只列永久地契：土地没有年限，日后转售也不需要州政府批准续期。' },
  'residential-title-projects': { h1: '住宅地契楼盘（非商业地契）', title: '住宅地契楼盘清单', blurb: '住宅地契的水电费与门牌税按住宅计算，通常比商业地契便宜。' },
  'family-size-3-bedroom-new-launch': { h1: '三房或以上楼盘', title: '三房以上楼盘清单', blurb: '给需要房间数而不是地址的家庭。' },
  'low-density-new-launch': { h1: '低密度楼盘', title: '低密度楼盘清单', blurb: '单位数少，电梯与设施不用抢。' },
  'ready-to-move-in': { h1: '现楼 / 可即刻入住', title: '现楼清单', blurb: '已经完工、可以走进去看实体的楼盘，不是看图纸买。' }
};

function renderShortlistHtml(indexHtml: string, sl: Shortlist, projects: SeoProject[], lang: Lang = 'en'): string {
  const zh = lang === 'zh';
  const z = ZH_SHORTLISTS[sl.slug];
  const canonical = `${SITE_URL}${langPrefix(lang)}/best/${sl.slug}`;
  const picks = shortlistProjects(sl, projects);
  const h1 = zh && z ? z.h1 : sl.h1;
  const blurb = zh && z ? z.blurb : sl.blurb;
  const title = zh && z ? `${z.title} | propertyportal.my` : `${sl.title} | propertyportal.my`;
  const description = zh
    ? `共 ${picks.length} 个楼盘：${blurb}`.slice(0, 300)
    : `${picks.length} project${picks.length === 1 ? '' : 's'}: ${sl.blurb}`.slice(0, 300);
  const faqs = shortlistFaqs(sl, picks);

  const graph = baseGraph();
  graph.push({ '@type': 'BreadcrumbList', 'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
    { '@type': 'ListItem', 'position': 2, 'name': 'Residences', 'item': `${SITE_URL}/residences` },
    { '@type': 'ListItem', 'position': 3, 'name': sl.title, 'item': canonical }
  ] });
  graph.push({ '@type': 'CollectionPage', '@id': `${canonical}#page`, 'url': canonical, 'name': title, 'description': description, 'isPartOf': { '@id': `${SITE_URL}/#website` },
    'mainEntity': { '@type': 'ItemList', 'numberOfItems': picks.length, 'itemListElement': picks.map((p, i) => ({ '@type': 'ListItem', 'position': i + 1, 'name': p.name, 'url': `${SITE_URL}/project/${p.slug}` })) } });
  graph.push({ '@type': 'FAQPage', '@id': `${canonical}#faq`, 'mainEntity': faqs.map(x => ({ '@type': 'Question', 'name': x.q, 'acceptedAnswer': { '@type': 'Answer', 'text': x.a } })) });

  const th = (t: string) => `<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e7e5e4">${t}</th>`;
  const td = (t: string) => `<td style="padding:6px 8px;border-bottom:1px solid #f5f5f4">${escHtml(t || '—')}</td>`;
  const table = picks.length ? `<table style="border-collapse:collapse;width:100%;margin:12px 0"><thead><tr>` +
    (zh ? [th(''), th('楼盘'), th('地区'), th('地契'), th('起价'), th('建筑面积'), th('房间'), th('完工')] : [th(''), th('Project'), th('Area'), th('Tenure'), th('From'), th('Built-up'), th('Beds'), th('Completion')]).join('') +
    `</tr></thead><tbody>` + picks.map(p => `<tr>` +
      `<td style="padding:6px 8px;border-bottom:1px solid #f5f5f4">${thumbHtml(p, 72)}</td>` +
      `<td style="padding:6px 8px;border-bottom:1px solid #f5f5f4"><a href="${langPrefix(lang)}/project/${escHtml(p.slug)}">${escHtml(p.name)}</a></td>` +
      td(primaryArea(p)) + td(p.tenure) + td(p.priceMin ? fmtRM(p.priceMin) : '') +
      td(p.builtUpMin ? `${fmtNum(p.builtUpMin)}-${fmtNum(p.builtUpMax || p.builtUpMin)} sq ft` : '') +
      td(p.bedroomsMin ? `${p.bedroomsMin}${p.bedroomsMax > p.bedroomsMin ? `-${p.bedroomsMax}` : ''}` : '') +
      td([p.completionStatus, p.estCompletionDate || p.completionYear].filter(Boolean).join(' ')) +
    `</tr>`).join('') + `</tbody></table>` : (zh ? '<p>目前没有符合的楼盘，向我索取最新清单。</p>' : '<p>No project currently matches. Ask for the latest list.</p>');

  const others = SHORTLISTS.filter(o => o.slug !== sl.slug);
  const body = `<div id="seo-prerender" style="${SEO_BODY_STYLE}">` +
    `<nav aria-label="Breadcrumb"><a href="${langPrefix(lang)}/">${zh ? '首页' : 'Home'}</a> › <a href="${langPrefix(lang)}/residences">${zh ? '全部楼盘' : 'Residences'}</a> › ${escHtml(zh && z ? z.title : sl.title)}</nav>` +
    `<h1>${escHtml(h1)}</h1><p>${escHtml(blurb)}</p>` +
    `<h2>${zh ? `共 ${picks.length} 个楼盘，由低价排起` : `${picks.length} project${picks.length === 1 ? '' : 's'}, cheapest first`}</h2>${table}` +
    `<p>${zh ? '价格为发展商开价，每一期都会变动，决定前请索取最新价目表。' : 'Prices are developer list prices from the project database and change with each release. Confirm the current price list before deciding.'}</p>` +
    `<h2>${zh ? '常见问题' : 'Frequently asked questions'}</h2>` + faqs.map(x => `<h3>${escHtml(x.q)}</h3><p>${escHtml(x.a)}</p>`).join('') +
    `<h2>${zh ? '其他清单' : 'Other shortlists'}</h2><ul>${others.map(o => `<li><a href="${langPrefix(lang)}/best/${escHtml(o.slug)}">${escHtml(zh && ZH_SHORTLISTS[o.slug] ? ZH_SHORTLISTS[o.slug].title : o.title)}</a></li>`).join('')}</ul>` +
    `<p>${zh ? '咨询与看房' : 'Enquiries and viewings'}: ${escHtml(AGENT.name)}, ${escHtml(AGENT.ren)}, ${escHtml(AGENT.company)}. WhatsApp <a href="https://wa.me/60108278932">${escHtml(AGENT.telephoneDisplay)}</a>.</p>` +
    `<p><a href="${langPrefix(lang)}/residences">${zh ? '全部楼盘' : 'All residences'}</a> · <a href="${langPrefix(lang)}/compare">${zh ? '楼盘对比' : 'Compare projects'}</a> · <a href="${langPrefix(lang)}/calculators">${zh ? '贷款计算' : 'Loan calculator'}</a></p>` +
    `</div>`;
  let html = applyHead(indexHtml, title, description, canonical, graph, true);
  html = html.replace(/<\/head>/i, `    ${hreflangTags(`/best/${sl.slug}`)}\n  </head>`);
  if (zh) html = html.replace(/<html([^>]*)\slang="[^"]*"/i, '<html$1 lang="zh-Hans"');
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${body}</div>`);
  return html;
}

/**
 * Station, developer and completion-year index pages.
 *
 * All three are the same shape — a heading, a sentence of real numbers, a table of projects, links
 * outwards — so they share one renderer. Stations come from the measurement in projectSeo.json;
 * developers are folded up to the parent group, because a buyer is choosing a group and the sales
 * kit names the project's own company.
 */
const DEV_BRANDS: [string, string][] = [
  ['Eastern & Oriental', 'Eastern & Oriental'], ['Chin Hin', 'Chin Hin Group'],
  ['Mah Sing', 'Mah Sing Group'], ['Paramount Property', 'Paramount Property'],
  ['Pavilion Group', 'Pavilion Group'], ['Kerjaya', 'Kerjaya Prospek'],
  ['Crest Builder', 'Crest Builder'], ['Welton', 'Welton Group'], ['OSK Property', 'OSK Property'],
  ['Berjaya', 'Berjaya'], ['Ayala Land', 'Ayala Land'], ['Land and General', 'Land and General'],
  ['Sun Suria', 'Sun Suria'], ['SP Setia', 'SP Setia'], ['Radium', 'Radium'], ['Glomac', 'Glomac'],
  ['Avaland', 'Avaland'], ['Exsim', 'Exsim'], ['Malton', 'Malton'], ['MRCB', 'MRCB'],
  ['BRDB', 'BRDB'], ['WCT', 'WCT'], ['UOA', 'UOA'], ['IJM', 'IJM'], ['TA Global', 'TA Global'],
  ['GSH', 'GSH'], ['Park City', 'Park City'], ['Masteron', 'Masteron'], ['Asiapac', 'Asiapac'],
  ['Puncak Dana', 'Puncak Dana'], ['Majestic Gen', 'Majestic Gen'], ['R&F Development', 'R&F Development'],
  ['Golden Eagle', 'Golden Eagle'], ['Ehsan Bina', 'Ehsan Bina'], ['OCR', 'OCR'], ['SCP', 'SCP'], ['TSR', 'TSR']
];
function devGroupName(p: SeoProject, rec?: ProjectSeoRecord): string {
  const a = String(rec?.developer || '').trim();
  const b = String(p.developer || '').trim();
  for (const [needle, brand] of DEV_BRANDS) {
    const re = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(a) || re.test(b)) return brand;
  }
  return (b || a).replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s+Sdn\.?\s*Bhd\.?$/i, '').replace(/\s+Berhad$/i, '').replace(/\s+Bhd\.?$/i, '').trim();
}

interface IndexGroup { kind: 'near' | 'developer' | 'completion'; slug: string; name: string; items: { p: SeoProject; km?: number }[] }

function buildIndexGroups(projects: SeoProject[], records: ProjectSeoRecord[]): IndexGroup[] {
  const out: IndexGroup[] = [];

  const byStation = new Map<string, { p: SeoProject; km: number }[]>();
  for (const p of projects) {
    const rec = findProjectSeo(p, records);
    for (const st of rec?.stations || []) {
      const k = st.name;
      (byStation.get(k) || byStation.set(k, []).get(k)!).push({ p, km: st.km });
    }
  }
  for (const [name, items] of byStation) {
    if (items.length < 2) continue;
    out.push({ kind: 'near', slug: seoSlugify(name), name, items: items.sort((a, b) => a.km - b.km) });
  }

  const byDev = new Map<string, SeoProject[]>();
  for (const p of projects) {
    const n = devGroupName(p, findProjectSeo(p, records));
    if (!n) continue;
    (byDev.get(n) || byDev.set(n, []).get(n)!).push(p);
  }
  for (const [name, items] of byDev) {
    if (items.length < 2) continue;
    out.push({ kind: 'developer', slug: seoSlugify(name), name, items: items.map(p => ({ p })) });
  }

  const byYear = new Map<string, SeoProject[]>();
  for (const p of projects) {
    const y = String(p.completionYear || '').trim();
    if (!/^20\d{2}$/.test(y)) continue;
    (byYear.get(y) || byYear.set(y, []).get(y)!).push(p);
  }
  for (const [year, items] of byYear) {
    if (items.length < 3) continue;
    out.push({ kind: 'completion', slug: year, name: year, items: items.map(p => ({ p })) });
  }

  return out.sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));
}

function renderIndexHtml(indexHtml: string, g: IndexGroup, all: IndexGroup[], lang: Lang = 'en'): string {
  const zh = lang === 'zh';
  const pathAfter = `/${g.kind}/${g.slug}`;
  const canonical = `${SITE_URL}${langPrefix(lang)}${pathAfter}`;
  const prices = g.items.map(x => x.p.priceMin || 0).filter(n => n > 0);
  const lo = prices.length ? Math.min(...prices) : 0;
  const hi = prices.length ? Math.max(...prices) : 0;
  const freehold = g.items.filter(x => /freehold/i.test(x.p.tenure || '')).length;
  const areas = [...new Set(g.items.map(x => primaryArea(x.p)).filter(Boolean))];
  const heading = g.kind === 'near'
    ? (zh ? `${g.name}站附近的新楼盘` : `New Launch Projects Near ${g.name} Station`)
    : g.kind === 'developer'
    ? (zh ? `${g.name} 的楼盘` : `${g.name} Projects in Malaysia`)
    : (zh ? `${g.name} 年完工的新楼盘` : `New Launch Projects Completing in ${g.name}`);
  const title = `${heading} | propertyportal.my`;
  const nearest = g.items[0];
  const description = g.kind === 'near'
    ? (zh
      ? `${g.name}站附近共 ${g.items.length} 个新楼盘，最近的是${nearest.p.name}，直线 ${nearest.km! < 1 ? `${Math.round(nearest.km! * 1000)} 米` : `${nearest.km!.toFixed(1)} 公里`}。距离是量出来的，不是发展商写的。`
      : `${g.items.length} new launch projects near ${g.name} station. The closest is ${nearest.p.name} at ${nearest.km! < 1 ? `${Math.round(nearest.km! * 1000)} m` : `${nearest.km!.toFixed(1)} km`}, measured on OpenStreetMap rather than claimed by the developer.`)
    : (zh
      ? `${heading}：共 ${g.items.length} 个${lo ? `，起价 ${fmtRM(lo)}` : ''}。地契、面积、完工年份与最近车站距离。`
      : `${g.items.length} projects${lo ? `, from ${fmtRM(lo)}` : ''}. Tenure, built-up sizes, completion year and the measured distance to the nearest station.`);

  const graph = baseGraph();
  graph.push({ '@type': 'BreadcrumbList', 'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': zh ? '首页' : 'Home', 'item': `${SITE_URL}${langPrefix(lang)}/` },
    { '@type': 'ListItem', 'position': 2, 'name': zh ? '全部楼盘' : 'Residences', 'item': `${SITE_URL}${langPrefix(lang)}/residences` },
    { '@type': 'ListItem', 'position': 3, 'name': heading, 'item': canonical }
  ] });
  graph.push({ '@type': 'CollectionPage', '@id': `${canonical}#page`, 'url': canonical, 'name': title, 'description': description,
    'isPartOf': { '@id': `${SITE_URL}/#website` },
    ...(g.kind === 'near' ? { 'about': { '@type': 'TrainStation', 'name': `${g.name} station` } } : {}),
    ...(g.kind === 'developer' ? { 'about': { '@type': 'Organization', 'name': g.name } } : {}),
    'mainEntity': { '@type': 'ItemList', 'numberOfItems': g.items.length,
      'itemListElement': g.items.map((x, i) => ({ '@type': 'ListItem', 'position': i + 1, 'name': x.p.name, 'url': `${SITE_URL}${langPrefix(lang)}/project/${x.p.slug}` })) } });

  const th = (t: string) => `<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e7e5e4">${t}</th>`;
  const td = (t: string) => `<td style="padding:6px 8px;border-bottom:1px solid #f5f5f4">${escHtml(t || '—')}</td>`;
  const heads = g.kind === 'near'
    ? (zh ? ['距离', '', '楼盘', '地区', '地契', '起价', '面积', '完工'] : ['Distance', '', 'Project', 'Area', 'Tenure', 'From', 'Built-up', 'Completion'])
    : (zh ? ['', '楼盘', '地区', '地契', '起价', '面积', '完工'] : ['', 'Project', 'Area', 'Tenure', 'From', 'Built-up', 'Completion']);
  const rows = g.items
    .slice()
    .sort((a, b) => g.kind === 'near' ? (a.km! - b.km!) : ((a.p.priceMin || Infinity) - (b.p.priceMin || Infinity)))
    .map(({ p, km }) => `<tr>`
      + (g.kind === 'near' ? `<td style="padding:6px 8px;border-bottom:1px solid #f5f5f4"><strong>${km! < 1 ? `${Math.round(km! * 1000)} ${zh ? '米' : 'm'}` : `${km!.toFixed(1)} ${zh ? '公里' : 'km'}`}</strong></td>` : '')
      + `<td style="padding:6px 8px;border-bottom:1px solid #f5f5f4">${thumbHtml(p, 72)}</td>`
      + `<td style="padding:6px 8px;border-bottom:1px solid #f5f5f4"><a href="${langPrefix(lang)}/project/${escHtml(p.slug)}">${escHtml(p.name)}</a></td>`
      + td(primaryArea(p)) + td(zh ? zhTenureLabel(p.tenure) : p.tenure) + td(p.priceMin ? fmtRM(p.priceMin) : '')
      + td(p.builtUpMin ? `${fmtNum(p.builtUpMin)}-${fmtNum(p.builtUpMax || p.builtUpMin)} ${zh ? '平方尺' : 'sq ft'}` : '')
      + td([p.completionStatus, p.estCompletionDate || p.completionYear].filter(Boolean).join(' '))
      + `</tr>`).join('');

  const siblings = all.filter(o => o.kind === g.kind && o.slug !== g.slug).slice(0, 12);
  const siblingLabel = g.kind === 'near' ? (zh ? '其他车站' : 'Other stations') : g.kind === 'developer' ? (zh ? '其他发展商' : 'Other developers') : (zh ? '其他年份' : 'Other years');
  const body = `<div id="seo-prerender" style="${SEO_BODY_STYLE}">` +
    `<nav aria-label="Breadcrumb"><a href="${langPrefix(lang)}/">${zh ? '首页' : 'Home'}</a> › <a href="${langPrefix(lang)}/residences">${zh ? '全部楼盘' : 'Residences'}</a> › ${escHtml(heading)}</nav>` +
    `<h1>${escHtml(heading)}</h1><p>${escHtml(description)}</p>` +
    `<p>${zh ? `这一页收录 ${g.items.length} 个楼盘。` : `${g.items.length} projects on this page.`}${lo && hi ? (zh ? `发展商开价由 ${fmtRM(lo)} 到 ${fmtRM(hi)}。` : ` Developer list prices run from ${fmtRM(lo)} to ${fmtRM(hi)}.`) : ''}${freehold ? (zh ? `其中 ${freehold} 个是永久地契。` : ` ${freehold} of them ${freehold === 1 ? 'is' : 'are'} freehold.`) : ''}</p>` +
    `<table style="border-collapse:collapse;width:100%;margin:12px 0"><thead><tr>${heads.map(th).join('')}</tr></thead><tbody>${rows}</tbody></table>` +
    `<p style="font-size:13px;color:#78716c">${zh ? '车站距离为 OpenStreetMap 直线距离，实际步行更远。价格为发展商开价，每一期都会变动。' : 'Station distances are straight-line measurements on OpenStreetMap; the walk is longer. Prices are developer list prices and change with each release.'}</p>` +
    (areas.length ? `<h2>${zh ? '相关地区' : 'Areas'}</h2><ul>${areas.map(a => `<li><a href="${langPrefix(lang)}/area/${escHtml(seoSlugify(a))}">${escHtml(a)}</a></li>`).join('')}</ul>` : '') +
    (siblings.length ? `<h2>${escHtml(siblingLabel)}</h2><ul>${siblings.map(o => `<li><a href="${langPrefix(lang)}/${o.kind}/${escHtml(o.slug)}">${escHtml(o.name)}</a> (${o.items.length})</li>`).join('')}</ul>` : '') +
    `<p>${zh ? '咨询与看房' : 'Enquiries and viewings'}: ${escHtml(AGENT.name)}, ${escHtml(AGENT.ren)}, ${escHtml(AGENT.company)}. WhatsApp <a href="https://wa.me/60108278932">${escHtml(AGENT.telephoneDisplay)}</a>.</p>` +
    `<p><a href="${langPrefix(lang)}/residences">${zh ? '全部楼盘' : 'All residences'}</a> · <a href="${langPrefix(lang)}/compare">${zh ? '楼盘对比' : 'Compare'}</a> · <a href="${langPrefix(lang)}/calculators">${zh ? '贷款计算' : 'Calculators'}</a></p>` +
    `</div>`;
  let html = applyHead(indexHtml, title, description, canonical, graph, true);
  html = html.replace(/<\/head>/i, `    ${hreflangTags(pathAfter)}\n  </head>`);
  if (zh) html = html.replace(/<html([^>]*)\slang="[^"]*"/i, '<html$1 lang="zh-Hans"');
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${body}</div>`);
  return html;
}

function areaLinksHtml(areas: SeoArea[]): string {
  if (!areas.length) return '';
  const byState: Record<string, SeoArea[]> = {};
  for (const a of areas) (byState[a.state] ||= []).push(a);
  return `<h2>Browse by area</h2>` + Object.keys(byState).sort().map(st => `<h3>${escHtml(st)}</h3><ul>${byState[st].map(a => `<li><a href="/area/${escHtml(a.slug)}">New launches in ${escHtml(a.name)}</a> (${a.projects.length})</li>`).join('')}</ul>`).join('');
}

function buildLlmsTxt(projects: SeoProject[]): string {
  const today = new Date().toISOString().split('T')[0];
  const lines: string[] = [];
  lines.push('# propertyportal.my (Malaysia Homes)');
  lines.push('');
  lines.push('> Directory and comparison tool for new-launch condominiums, serviced apartments and landed homes in Kuala Lumpur, Selangor, Johor and Penang, Malaysia. Run by licensed real estate negotiator Yee Woei Shyan (REN 46305) of IQI Realty Sdn Bhd. Prices are developer list prices and may change; confirm the latest price list before deciding.');
  lines.push('');
  lines.push('## Contact');
  lines.push(`- Agent: ${AGENT.name}, ${AGENT.ren}, ${AGENT.company}`);
  lines.push(`- WhatsApp / phone: ${AGENT.telephoneDisplay}`);
  lines.push(`- Email: ${AGENT.email}`);
  lines.push(`- Website: ${SITE_URL}/`);
  lines.push(`- Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push('');
  lines.push('## Pages');
  lines.push(`- [All residences](${SITE_URL}/residences): every project with filters by area, price, tenure and type`);
  lines.push(`- [Compare](${SITE_URL}/compare): side-by-side comparison of shortlisted projects`);
  lines.push(`- [Buying guide](${SITE_URL}/guide): how buying a new launch in Malaysia works`);
  lines.push(`- [Calculators](${SITE_URL}/calculators): loan instalment, stamp duty and legal fee estimates`);
  lines.push(`- [Map](${SITE_URL}/map): all projects on a map`);
  lines.push('');
  const areas = buildAreas(projects);
  if (areas.length) {
    lines.push(`## Areas (${areas.length})`);
    for (const a of areas) {
      const f = areaFacts(a);
      lines.push(`- [${a.name}, ${a.state}](${SITE_URL}/area/${a.slug}): ${f.count} project${f.count === 1 ? '' : 's'}${f.cheapest ? `, from RM ${fmtNum(f.cheapest.priceMin)}` : ''}${f.tenureText ? `; ${f.tenureText}` : ''}`);
    }
    lines.push('');
  }
  lines.push(`## Projects (${projects.length}, generated from the live database on ${today})`);
  for (const p of projects) {
    const bits: string[] = [];
    if (p.developer) bits.push(`developer ${p.developer}`);
    if (p.address) bits.push(p.address);
    const typeWords = [p.tenure, p.propertyType].filter(Boolean).join(' ');
    if (typeWords) bits.push(typeWords);
    if (p.priceMin) bits.push(`from RM ${fmtNum(p.priceMin)}${p.priceMax > p.priceMin ? ` to RM ${fmtNum(p.priceMax)}` : ''}`);
    if (p.builtUpMin) bits.push(`${fmtNum(p.builtUpMin)}-${fmtNum(p.builtUpMax || p.builtUpMin)} sq ft`);
    if (p.bedroomsMin) bits.push(`${p.bedroomsMin}${p.bedroomsMax > p.bedroomsMin ? `-${p.bedroomsMax}` : ''} bedrooms`);
    if (p.totalUnits) bits.push(`${p.totalUnits} units`);
    const completion = [p.completionStatus, p.estCompletionDate || p.completionYear].filter(Boolean).join(' ');
    if (completion) bits.push(completion);
    if (p.maintenanceFee) bits.push(`maintenance ${p.maintenanceFee}`);
    lines.push(`- [${p.name}](${SITE_URL}/project/${p.slug}): ${bits.join('; ')}`);
  }
  lines.push('');
  lines.push(`## Shortlists (${SHORTLISTS.length})`);
  for (const sl of SHORTLISTS) lines.push(`- [${sl.title}](${SITE_URL}/best/${sl.slug}): ${shortlistProjects(sl, projects).length} projects — ${sl.blurb}`);
  lines.push('');
  const pairs = buildComparePairs(projects);
  if (pairs.length) {
    lines.push(`## Project comparisons (${pairs.length})`);
    lines.push('Each page puts two projects in the same area side by side: price, built-up, tenure, units, maintenance fee and completion.');
    for (const c of pairs) lines.push(`- [${c.a.name} vs ${c.b.name}](${SITE_URL}/compare/${c.slug}): ${c.area}`);
    lines.push('');
  }
  lines.push('## Notes for AI assistants');
  lines.push('- Every project page lists developer, address, tenure, price range, built-up sizes, bedrooms, total units, maintenance fee and completion status from the developer price list.');
  lines.push('- Foreign buyers must meet the minimum purchase price set by each state (RM 1,000,000 in Kuala Lumpur and most of Selangor).');
  lines.push('- New launches sold under the Housing Development Act use the standard Schedule H (strata) or Schedule G (landed) sale and purchase agreement, with delivery within 36 or 24 months respectively.');
  lines.push(`- For viewing appointments, price lists and floor plans contact ${AGENT.name} on WhatsApp ${AGENT.telephoneDisplay}.`);
  lines.push('');
  return lines.join('\n');
}

function buildSitemapXml(projects: SeoProject[], fallbackSlugs: string[], covers: Record<string, { image: string; title: string }> = {}, indexGroups: IndexGroup[] = []): string {
  const today = new Date().toISOString().split('T')[0];
  const toIso = (dmy: string) => {
    const m = dmy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return today;
    const iso = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return isNaN(Date.parse(iso)) ? today : iso;
  };
  const url = (loc: string, lastmod: string, changefreq: string, priority: string) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  // Image entries let Google Images find the project photos, which only exist inside the page.
  const imageUrl = (loc: string, lastmod: string, changefreq: string, priority: string, img?: { image: string; title: string }) =>
    img
      ? `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n    <image:image>\n      <image:loc>${escHtml(img.image)}</image:loc>\n      <image:title>${escHtml(img.title)}</image:title>\n    </image:image>\n  </url>\n`
      : url(loc, lastmod, changefreq, priority);
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  xml += url(`${SITE_URL}/`, today, 'daily', '1.0');
  xml += url(`${SITE_URL}/residences`, today, 'daily', '0.9');
  xml += url(`${SITE_URL}/compare`, today, 'weekly', '0.7');
  xml += url(`${SITE_URL}/guide`, today, 'weekly', '0.7');
  xml += url(`${SITE_URL}/calculators`, today, 'monthly', '0.6');
  xml += url(`${SITE_URL}/map`, today, 'weekly', '0.6');
  if (projects.length) {
    for (const a of buildAreas(projects)) xml += url(`${SITE_URL}/area/${a.slug}`, today, 'weekly', '0.8');
    for (const p of projects) xml += imageUrl(`${SITE_URL}/project/${p.slug}`, toIso(p.dataUpdated), 'weekly', '0.8', covers[p.slug]);
    for (const c of buildComparePairs(projects)) {
      xml += url(`${SITE_URL}/compare/${c.slug}`, today, 'weekly', '0.7');
      xml += url(`${SITE_URL}/zh/compare/${c.slug}`, today, 'weekly', '0.65');
    }
    for (const sl of SHORTLISTS) xml += url(`${SITE_URL}/best/${sl.slug}`, today, 'weekly', '0.8');
    for (const g of indexGroups) {
      xml += url(`${SITE_URL}/${g.kind}/${g.slug}`, today, 'weekly', '0.75');
      xml += url(`${SITE_URL}/zh/${g.kind}/${g.slug}`, today, 'weekly', '0.70');
    }
    // Chinese twins of the two page types that carry the project data.
    for (const a of buildAreas(projects)) xml += url(`${SITE_URL}/zh/area/${a.slug}`, today, 'weekly', '0.7');
    for (const p of projects) xml += url(`${SITE_URL}/zh/project/${p.slug}`, toIso(p.dataUpdated), 'weekly', '0.7');
    xml += url(`${SITE_URL}/zh/`, today, 'daily', '0.9');
    for (const r of ['/residences', '/compare', '/guide', '/calculators', '/map']) xml += url(`${SITE_URL}/zh${r}`, today, 'weekly', '0.6');
    for (const sl of SHORTLISTS) xml += url(`${SITE_URL}/zh/best/${sl.slug}`, today, 'weekly', '0.7');
  } else {
    for (const slug of fallbackSlugs) xml += url(`${SITE_URL}/project/${slug}`, today, 'weekly', '0.8');
  }
  xml += `</urlset>`;
  return xml;
}

const app = express();

// Express JSON Parsing
app.use(express.json());

// Traditional Chinese: /zh-hant/... is the Simplified page converted on the way out. The request is
// rewritten to /zh/... so every Chinese route runs unchanged; the response is then converted with
// OpenCC's "twp" profile (characters and everyday vocabulary), retagged zh-Hant, and its canonical,
// og:url and internal links pointed at /zh-hant. The zh-Hans alternate keeps pointing at /zh.
const toHant: (t: string) => string = (OpenCC as any).Converter({ from: 'cn', to: 'twp' });
const hantify = (html: string) => toHant(html)
  .replace(/<html([^>]*)\slang="zh-Hans"/i, '<html$1 lang="zh-Hant"')
  .replace(/(<link rel="canonical" href="https?:\/\/[^/]+)\/zh(\/|")/i, '$1/zh-hant$2')
  .replace(/(<meta property="og:url" content="https?:\/\/[^/]+)\/zh(\/|")/i, '$1/zh-hant$2')
  .replace(/(hreflang="zh-Hant" href="https?:\/\/[^/]+)\/zh(\/|")/g, '$1/zh-hant$2')
  .replace(/href="\/zh(\/|")/g, 'href="/zh-hant$1')
  .replace(/(href="https?:\/\/(?:www\.)?propertyportal\.my)\/zh(\/|")/g, (m, a, tail) => /hreflang="zh-Hans"/.test(m) ? m : `${a}/zh-hant${tail}`)
  .replace(/(hreflang="zh-Hans" href="https?:\/\/[^/]+)\/zh-hant(\/|")/g, '$1/zh$2');
app.use((req, res, next) => {
  const m = /^\/zh-hant(\/.*)?$/i.exec(req.url.split('?')[0]);
  if (!m) return next();
  req.url = `/zh${m[1] || ''}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;
  (req as any).hant = true;
  const send = res.send.bind(res);
  res.send = ((body: any) => send(typeof body === 'string' && /<html/i.test(body) ? hantify(body) : body)) as any;
  next();
});
// Local testing only (Vercel serves /assets itself): let `npx tsx` runs load the built JS/CSS.
if (!process.env.VERCEL) app.use(express.static(path.join(process.cwd(), 'dist'), { index: false }));

// Vercel Serverless Rewrite helper: when Vercel rewrites /sitemap.xml, /robots.txt, /llms.txt or
// /project/<slug> to this function, recover the original path so the Express routes below match.
app.use((req, res, next) => {
  const candidates = [
    req.url || '',
    req.path || '',
    req.originalUrl || '',
    (req.headers['x-matched-path'] as string) || '',
    (req.headers['x-forwarded-uri'] as string) || '',
    (req.headers['x-original-url'] as string) || '',
    (req.headers['x-vercel-original-pathname'] as string) || ''
  ];
  const has = (re: RegExp) => candidates.some(c => re.test(c));
  let projectMatch: RegExpMatchArray | null = null;
  for (const c of candidates) {
    const m = c.match(/\/(?:project|projects|property|properties)\/([^/?#]+)/i);
    if (m) { projectMatch = m; break; }
  }

  let compareMatch: RegExpMatchArray | null = null;
  for (const c of candidates) { const m = String(c || '').match(/\/compare\/([^/?#]+)/i); if (m) { compareMatch = m; break; } }
  let indexMatch: RegExpMatchArray | null = null;
  for (const c of candidates) { const m = String(c || '').match(/\/(near|developer|completion)\/([^/?#]+)/i); if (m) { indexMatch = m; break; } }
  let bestMatch: RegExpMatchArray | null = null;
  for (const c of candidates) { const m = String(c || '').match(/\/best\/([^/?#]+)/i); if (m) { bestMatch = m; break; } }
  let areaMatch: RegExpMatchArray | null = null;
  for (const c of candidates) { const m = String(c || '').match(/\/area\/([^/?#]+)/i); if (m) { areaMatch = m; break; } }
  let routeMatch = '';
  for (const c of candidates) {
    const pth = normalizeRoute(String(c || '').replace(/^https?:\/\/[^/]+/, ''));
    if (STATIC_ROUTES[pth] && pth !== '/') { routeMatch = pth; break; }
  }
  if (!routeMatch) {
    // A bare "/" only counts when no candidate names a different path.
    // Only the rewrite target itself (/api/index) is ignored; real API paths must never be mistaken for the home page.
    const named = candidates.map(c => normalizeRoute(String(c || '').replace(/^https?:\/\/[^/]+/, ''))).filter(c => c && c !== '/' && !/^\/api\/index\b/.test(c));
    if (named.length === 0) routeMatch = '/';
  }

  // Rebuilding the path here dropped the /zh prefix, so every Chinese URL was served in English.
  // Traditional Chinese lives under /zh-hant; the middleware above has already turned it into /zh
  // for the routes, so here it only needs to be recognised as Chinese.
  const zhPrefix = has(/(^|https?:\/\/[^/]+)?\/zh(-hant)?(\/|$)/i) ? '/zh' : '';

  if (has(/sitemap/i)) {
    req.url = '/sitemap.xml';
  } else if (has(/robots/i)) {
    req.url = '/robots.txt';
  } else if (has(/llms\.txt/i)) {
    req.url = '/llms.txt';
  } else if (projectMatch && !has(/\/api\/(drive-images|sheets-|image-proxy|project-seo)/i)) {
    req.url = `${zhPrefix}/project/${projectMatch[1]}`;
  } else if (compareMatch && !has(/\/api\/(drive-images|sheets-|image-proxy|project-seo)/i)) {
    req.url = `${zhPrefix}/compare/${compareMatch[1]}`;
  } else if (indexMatch && !has(/\/api\/(drive-images|sheets-|image-proxy|project-seo)/i)) {
    req.url = `${zhPrefix}/${indexMatch[1].toLowerCase()}/${indexMatch[2]}`;
  } else if (bestMatch && !has(/\/api\/(drive-images|sheets-|image-proxy|project-seo)/i)) {
    req.url = `${zhPrefix}/best/${bestMatch[1]}`;
  } else if (areaMatch && !has(/\/api\/(drive-images|sheets-|image-proxy|project-seo)/i)) {
    req.url = `${zhPrefix}/area/${areaMatch[1]}`;
  } else if (routeMatch && !has(/\/api\/(drive-images|sheets-|image-proxy|project-seo)/i)) {
    if (zhPrefix) { req.url = `${zhPrefix}${routeMatch}`; return next(); }
    req.url = routeMatch;
  }
  next();
});

// API Route: Google Drive Scraper (Matches both prefixed and rewritten Vercel paths)
app.get(['/api/drive-images', '/drive-images'], async (req, res) => {
  const isForceRefresh = req.query.refresh === 'true';
  if (driveCache && (Date.now() - driveCacheTime < DRIVE_CACHE_TTL) && !isForceRefresh) {
    return res.json({ success: true, cached: true, driveMap: driveCache });
  }

  try {
    const driveMap = await scrapePublicDriveImages();
    driveCache = driveMap;
    driveCacheTime = Date.now();
    res.json({ success: true, cached: false, driveMap });
  } catch (error: any) {
    console.error('Error fetching drive images:', error);
    res.status(500).json({ success: false, error: error.message, driveMap: driveCache || {} });
  }
});

// API Route: Google Sheets Listings Data
app.get(['/api/sheets-listings', '/sheets-listings'], async (req, res) => {
  try {
    const SPREADSHEET_ID = '1__k-dTt9oxBZSKKp9wI2O42l8QiBpqy0O9dwZK1jyqQ';
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=2052526095&cb=${Date.now()}`;
    const response = await fetch(spreadsheetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from google sheets main tab: ${response.status}`);
    }
    const csvText = await response.text();
    res.json({ success: true, csv: csvText });
  } catch (error: any) {
    console.error('Error exporting sheet listings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Route: Google Sheets Coordinates/Locations Data
app.get(['/api/sheets-locations', '/sheets-locations'], async (req, res) => {
  try {
    const SPREADSHEET_ID = '1__k-dTt9oxBZSKKp9wI2O42l8QiBpqy0O9dwZK1jyqQ';
    const locUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Locations&cb=${Date.now()}`;
    const response = await fetch(locUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from google sheets locations: ${response.status}`);
    }
    const csvText = await response.text();
    res.json({ success: true, csv: csvText });
  } catch (error: any) {
    console.error('Error exporting sheet locations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Route: Google Sheets Full Project Details Data
app.get(['/api/sheets-full-details', '/sheets-full-details'], async (req, res) => {
  try {
    const SPREADSHEET_ID = '1__k-dTt9oxBZSKKp9wI2O42l8QiBpqy0O9dwZK1jyqQ';
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=1727767414&cb=${Date.now()}`;
    const response = await fetch(spreadsheetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from google sheets full details tab: ${response.status}`);
    }
    const csvText = await response.text();
    res.json({ success: true, csv: csvText });
  } catch (error: any) {
    console.error('Error exporting sheet full details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Route: Secure Backend Image Proxy to solve public view Google Drive 403 / Cookie blocks
app.get(['/api/image-proxy', '/image-proxy'], async (req, res) => {
  const fileId = req.query.id as string;
  if (!fileId || typeof fileId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return res.status(400).send('Invalid or missing Google Drive file ID');
  }

  const tryFetch = async (url: string) => {
    return fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
      }
    });
  };

  try {
    // 1. Try fetching from the high-speed cookieless CDN first
    let driveRes = await tryFetch(`https://lh3.googleusercontent.com/d/${fileId}`);
    
    // 2. Fallback to thumbnail generator if CDN fails or returns non-ok status
    if (!driveRes.ok) {
      console.warn(`Direct CDN fetch failed for ${fileId} (Status: ${driveRes.status}). Trying thumbnail endpoint...`);
      driveRes = await tryFetch(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`);
    }

    // 3. Fallback to direct uc download link
    if (!driveRes.ok) {
      console.warn(`Thumbnail fetch failed for ${fileId}. Trying direct download link...`);
      driveRes = await tryFetch(`https://drive.google.com/uc?export=download&id=${fileId}`);
    }

    if (driveRes.ok) {
      const contentType = driveRes.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      // Instruct browsers and edge proxies/CDNs to cache this for 30 days (extremely efficient)
      res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
      
      const buffer = await driveRes.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    throw new Error(`All Google Drive fetch attempts failed (Status: ${driveRes.status})`);
  } catch (err: any) {
    console.error(`Proxy error for file ${fileId}:`, err.message);
    // Serve a beautiful placeholder image so the frontend never has broken links
    res.redirect('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80');
  }
});

// Dynamic sitemap.xml: one clean /project/<slug> URL per project, read live from the Google Sheet.
// The static list below is only used if the sheet cannot be reached.
const FALLBACK_PROJECT_SLUGS = [
    'amika', 'anya', 'aricia', 'aster-hill', 'atera-phase2', 'aurum-business', 
    'avantro', 'ayanna-res', 'bangsar-hill-bc', 'bangsar-hill-verdura', 'clouthaus-res', 
    'core-trx', 'genstarz-res', 'luminar-subang', 'm-aspira', 'maple-oug', 'oaka-res', 
    'one-seputeh', 'orion-bid', 'park-green', 'quaver-kl', 'radium-arena', 'riverville2', 
    'tria-seputeh', 'tujuh-kwasa', 'vox-sentul', 'wyn-puchong', 'zenia-damansara', 
    'ren-bukit-jalil', 'aras-wcity', 'vividz-res', 'khaya-bangsar', 'phoeniz-suites', 
    'branniganz-exsim', 'alora-subang', 'loop-city', 'aldenz', 'parkside', 'foresthill', 
    'amaya', 'grand-damansara', 'stellar-damansara', 'seresta', 'livista', 'the-lines', 
    'pinnacle-ara', 'hampton', 'd-tessera', 'amara-res', 'linari-kwasa', 'mahogany', 
    'panorama-kelana', 'sunway-dhill', 'd-evia-kwasa', 'arra-res', 'paradigm-mall',
    'kwasa-cc', 'kingswoodz', 'queenswoodz', 'wellness-city', 'veladaz', 'johor-causeway',
    'rf-casa', 'gen-sphere', 'gen-rise', 'ciq-johor', 'calia-pgb', 'bukit-chagar',
    'm-grand-minori', 'address-maxim', 'arden-johor', 'skyline-tslaw', 'paragon-signatures',
    'asteriaz-exsim', 'nadi-southkey', 'mb-world-bay', 'paragon-gateway'
  ];

app.get(['/sitemap.xml', '/sitemap'], async (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.header('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
  let projects: SeoProject[] = [];
  try {
    projects = await fetchSeoProjects();
  } catch (e) {
    console.warn('Sitemap generator could not load live spreadsheet rows, falling back to static project IDs:', e);
  }
  let covers: Record<string, { image: string; title: string }> = {};
  try {
    const records = await loadProjectSeo(req);
    for (const p of projects) {
      const rec = findProjectSeo(p, records);
      if (rec?.coverImage) covers[p.slug] = { image: rec.coverImage, title: `${p.name}, ${p.area}` };
    }
  } catch (e) {
    console.warn('Sitemap: no cover images this time:', e);
  }
  let indexGroups: IndexGroup[] = [];
  try { indexGroups = buildIndexGroups(projects, await loadProjectSeo(req)); } catch { /* keep the rest of the sitemap */ }
  const xml = buildSitemapXml(projects, FALLBACK_PROJECT_SLUGS, covers, indexGroups);
  // Traditional Chinese URLs mirror the Simplified ones.
  res.send(xml.replace(/<url>\s*<loc>(https?:\/\/[^/]+)\/zh(\/[^<]*)?<\/loc>[\s\S]*?<\/url>\s*/g, blk => blk + blk.replace(/\/zh(\/|<)/, '/zh-hant$1')));
});

// llms.txt for AI assistants, generated from the same live data (new projects appear automatically)
app.get(['/llms.txt', '/llms'], async (req, res) => {
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
  try {
    res.send(buildLlmsTxt(await fetchSeoProjects()));
  } catch (e: any) {
    console.error('llms.txt generation failed:', e);
    res.status(503).send(`# propertyportal.my\n\nProject list temporarily unavailable. Contact ${AGENT.name}, ${AGENT.ren}, ${AGENT.company}, WhatsApp ${AGENT.telephoneDisplay}.\n`);
  }
});

// Project detail JSON for the app's detail view (same facts + FAQs the crawler sees on the project page)
app.get(['/api/project-seo/:slug', '/project-seo/:slug'], async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
  try {
    const [projects, records] = await Promise.all([fetchSeoProjects().catch(() => [] as SeoProject[]), loadProjectSeo(req)]);
    const project = findSeoProject(String(req.params.slug || ''), projects);
    if (!project) { res.status(404).json({ error: 'unknown project' }); return; }
    const rec = findProjectSeo(project, records);
    res.json({ slug: project.slug, name: project.name, record: rec || null, faqs: projectFaqs(project, rec), review: AGENT_REVIEWS[project.slug] || null });
  } catch (e) {
    res.status(503).json({ error: 'unavailable' });
  }
});

// Project pages: same app, but with this project's own title, description, canonical, Open Graph and JSON-LD
app.get(['/project/:slug', '/projects/:slug', '/property/:slug', '/properties/:slug',
         '/zh/project/:slug', '/zh/projects/:slug'], async (req, res) => {
  const slug = String(req.params.slug || '');
  const lang: Lang = req.path.startsWith('/zh/') ? 'zh' : 'en';
  try {
    const [projects, indexHtml] = await Promise.all([
      fetchSeoProjects().catch((e) => { console.warn('Project prerender: sheet unavailable', e); return [] as SeoProject[]; }),
      loadIndexHtml(req)
    ]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
    ALL_PROJECTS_FOR_LINKS = projects;
    PROJECT_SEO_RECORDS = await loadProjectSeo(req);
    const project = findSeoProject(slug, projects);
    if (!project) {
      // Unknown slug: still serve the app (it shows the home page), but tell search engines it is not a real page.
      res.status(projects.length ? 404 : 200).send(projects.length ? renderNotFoundHtml(indexHtml) : indexHtml);
      return;
    }
    res.send(renderProjectHtml(indexHtml, project, lang));
  } catch (err) {
    console.error('Project prerender failed, falling back to client-side routing:', err);
    res.redirect(302, `/?project=${encodeURIComponent(slug)}`);
  }
});

// Serve robots.txt pointing to the dynamic sitemap
app.get(['/robots.txt', '/robots'], (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: https://www.propertyportal.my/sitemap.xml\n`);
});

// Area pages: one per area with projects
// Budget and purpose shortlists: /best/<slug>. Buyers search by what they can spend, not by name.
app.get(['/best/:slug', '/zh/best/:slug'], async (req, res) => {
  const lang: Lang = req.path.startsWith('/zh/') ? 'zh' : 'en';
  res.header('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
  try {
    const [projects, indexHtml] = await Promise.all([
      fetchSeoProjects().catch((e) => { console.warn('Shortlist prerender: sheet unavailable', e); return [] as SeoProject[]; }),
      loadIndexHtml(req)
    ]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const sl = SHORTLISTS.find(x => x.slug === String(req.params.slug || '').toLowerCase());
    if (!sl) { res.status(projects.length ? 404 : 200).send(projects.length ? renderNotFoundHtml(indexHtml) : indexHtml); return; }
    res.send(renderShortlistHtml(indexHtml, sl, projects, lang));
  } catch (err) {
    console.error('Shortlist prerender failed:', err);
    res.redirect(302, '/residences');
  }
});

// Comparison pages: /compare/<a>-vs-<b>. Buyers at the end of their search type two project names.
app.get(['/compare/:pair', '/zh/compare/:pair'], async (req, res) => {
  const lang: Lang = req.path.startsWith('/zh/') ? 'zh' : 'en';
  res.header('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
  try {
    const [projects, indexHtml] = await Promise.all([
      fetchSeoProjects().catch((e) => { console.warn('Compare prerender: sheet unavailable', e); return [] as SeoProject[]; }),
      loadIndexHtml(req)
    ]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const pair = findComparePair(String(req.params.pair || ''), projects);
    if (!pair) { res.status(projects.length ? 404 : 200).send(projects.length ? renderNotFoundHtml(indexHtml) : indexHtml); return; }
    res.send(renderCompareHtml(indexHtml, pair, projects, lang));
  } catch (err) {
    console.error('Compare prerender failed:', err);
    res.redirect(302, '/compare');
  }
});

// Station, developer and completion-year index pages, in both languages.
app.get(['/near/:slug', '/developer/:slug', '/completion/:slug',
         '/zh/near/:slug', '/zh/developer/:slug', '/zh/completion/:slug'], async (req, res) => {
  const lang: Lang = req.path.startsWith('/zh/') ? 'zh' : 'en';
  const kind = (req.path.replace(/^\/zh/, '').split('/')[1] || '') as IndexGroup['kind'];
  const slug = seoSlugify(String(req.params.slug || ''));
  try {
    const [projects, indexHtml] = await Promise.all([
      fetchSeoProjects().catch((e) => { console.warn('Index prerender: sheet unavailable', e); return [] as SeoProject[]; }),
      loadIndexHtml(req)
    ]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
    const records = await loadProjectSeo(req);
    const groups = buildIndexGroups(projects, records);
    const g = groups.find(x => x.kind === kind && x.slug === slug);
    if (!g) { res.status(projects.length ? 404 : 200).send(projects.length ? renderNotFoundHtml(indexHtml) : indexHtml); return; }
    res.send(renderIndexHtml(indexHtml, g, groups, lang));
  } catch (err) {
    console.error('Index prerender failed:', err);
    res.redirect(302, '/residences');
  }
});

app.get(['/area/:slug', '/zh/area/:slug'], async (req, res) => {
  const slug = seoSlugify(String(req.params.slug || ''));
  const lang: Lang = req.path.startsWith('/zh/') ? 'zh' : 'en';
  try {
    const [projects, indexHtml] = await Promise.all([
      fetchSeoProjects().catch((e) => { console.warn('Area prerender: sheet unavailable', e); return [] as SeoProject[]; }),
      loadIndexHtml(req)
    ]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
    const areas = buildAreas(projects);
    const area = areas.find(a => a.slug === slug);
    if (!area) { res.status(projects.length ? 404 : 200).send(projects.length ? renderNotFoundHtml(indexHtml) : indexHtml); return; }
    res.send(renderAreaHtml(indexHtml, area, areas, lang));
  } catch (err) {
    console.error('Area prerender failed:', err);
    res.redirect(302, '/residences');
  }
});

// Home and the app's section pages: the shell with that page's own head tags and a crawlable body.
app.get(['/', ...Object.keys(STATIC_ROUTES).filter(r => r !== '/'), ...Object.keys(ROUTE_ALIASES),
         '/zh', '/zh/', ...Object.keys(STATIC_ROUTES).filter(r => r !== '/').map(r => `/zh${r}`)], async (req, res) => {
  const lang: Lang = /^\/zh(\/|$)/.test(req.path) ? 'zh' : 'en';
  const route = normalizeRoute(req.path.replace(/^\/zh(?=\/|$)/, '') || '/');
  try {
    const [projects, indexHtml] = await Promise.all([
      fetchSeoProjects().catch((e) => { console.warn('Route prerender: sheet unavailable', e); return [] as SeoProject[]; }),
      loadIndexHtml(req)
    ]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
    res.send(STATIC_ROUTES[route] ? renderRouteHtml(indexHtml, route, projects, lang) : indexHtml);
  } catch (err) {
    console.error('Route prerender failed, serving plain shell:', err);
    try { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.send(await loadIndexHtml(req)); } catch { res.redirect(302, '/?seo-prerender=1'); }
  }
});

// Anything else that reaches this function is not a real page: serve the shell with a 404 status
app.use(async (req, res) => {
  try {
    res.status(404);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600');
    res.send(renderNotFoundHtml(await loadIndexHtml(req)));
  } catch {
    res.redirect(302, '/');
  }
});

// Used by scripts/prerender-home.ts at build time (home is a static file on Vercel).
export async function renderHomeForBuild(shellHtml: string): Promise<string> {
  const projects = await fetchSeoProjects();
  return renderRouteHtml(shellHtml, '/', projects);
}

export default app;
