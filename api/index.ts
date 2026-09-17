import express from 'express';
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
    const baseSlug = seoSlugify(name) || 'project';
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
  const candidates = [path.join(process.cwd(), 'dist', 'index.html')];
  for (const p of candidates) {
    try {
      const html = fs.readFileSync(p, 'utf8');
      if (html.includes('/assets/')) {
        indexHtmlCache = { html, time: Date.now() };
        return html;
      }
    } catch { /* not on disk here (Vercel); fall through to HTTP */ }
  }
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'www.propertyportal.my';
  const proto = (req.headers['x-forwarded-proto'] as string) || (host.startsWith('localhost') ? 'http' : 'https');
  const res = await fetch(`${proto}://${host}/?seo-prerender=1`, { headers: { 'User-Agent': 'propertyportal-seo-prerender' } });
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

function renderProjectHtml(indexHtml: string, p: SeoProject): string {
  const canonical = `${SITE_URL}/project/${p.slug}`;
  const { title, description, price, sizes, beds } = projectSummary(p);
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
    ['Launch date', p.launchDate]
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
      'parentOrganization': { '@type': 'Organization', 'name': AGENT.company },
      'address': { '@type': 'PostalAddress', 'addressLocality': 'Kuala Lumpur', 'addressCountry': 'MY' }
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
        { '@type': 'ListItem', 'position': 2, 'name': 'Residences', 'item': `${SITE_URL}/residences` },
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
      'image': `${SITE_URL}/og_preview.jpg`,
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

  const noscript = `<noscript><article style="padding:20px;font-family:sans-serif;max-width:800px;margin:0 auto">` +
    `<h1>${escHtml(p.name)} ${escHtml(p.area)}</h1><p>${escHtml(description)}</p><ul>` +
    factRows.map(([k, v]) => `<li><strong>${escHtml(k)}:</strong> ${escHtml(v)}</li>`).join('') +
    `</ul><p>Enquiries: ${escHtml(AGENT.name)}, ${escHtml(AGENT.ren)}, ${escHtml(AGENT.company)}. WhatsApp ${escHtml(AGENT.telephoneDisplay)}.</p></article></noscript>`;

  let html = indexHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escHtml(title)}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escHtml(description)}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escHtml(canonical)}" />`);
  html = html.replace(/(<link\s+rel="alternate"\s+hreflang="en"\s+href=")[^"]*(")/i, `$1${escHtml(canonical)}?lang=en$2`);
  html = html.replace(/(<link\s+rel="alternate"\s+hreflang="zh-Hans"\s+href=")[^"]*(")/i, `$1${escHtml(canonical)}?lang=zh$2`);
  html = html.replace(/(<link\s+rel="alternate"\s+hreflang="x-default"\s+href=")[^"]*(")/i, `$1${escHtml(canonical)}$2`);
  html = html.replace(/<\/head>/i, `    ${headExtra}\n  </head>`);
  html = html.replace(/(<div id="root"><\/div>)/i, `$1\n    ${noscript}`);
  return html;
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
  lines.push('## Notes for AI assistants');
  lines.push('- Every project page lists developer, address, tenure, price range, built-up sizes, bedrooms, total units, maintenance fee and completion status from the developer price list.');
  lines.push('- Foreign buyers must meet the minimum purchase price set by each state (RM 1,000,000 in Kuala Lumpur and most of Selangor).');
  lines.push('- New launches sold under the Housing Development Act use the standard Schedule H (strata) or Schedule G (landed) sale and purchase agreement, with delivery within 36 or 24 months respectively.');
  lines.push(`- For viewing appointments, price lists and floor plans contact ${AGENT.name} on WhatsApp ${AGENT.telephoneDisplay}.`);
  lines.push('');
  return lines.join('\n');
}

function buildSitemapXml(projects: SeoProject[], fallbackSlugs: string[]): string {
  const today = new Date().toISOString().split('T')[0];
  const toIso = (dmy: string) => {
    const m = dmy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return today;
    const iso = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return isNaN(Date.parse(iso)) ? today : iso;
  };
  const url = (loc: string, lastmod: string, changefreq: string, priority: string) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  xml += url(`${SITE_URL}/`, today, 'daily', '1.0');
  xml += url(`${SITE_URL}/residences`, today, 'daily', '0.9');
  xml += url(`${SITE_URL}/compare`, today, 'weekly', '0.7');
  xml += url(`${SITE_URL}/guide`, today, 'weekly', '0.7');
  xml += url(`${SITE_URL}/calculators`, today, 'monthly', '0.6');
  xml += url(`${SITE_URL}/map`, today, 'weekly', '0.6');
  if (projects.length) {
    for (const p of projects) xml += url(`${SITE_URL}/project/${p.slug}`, toIso(p.dataUpdated), 'weekly', '0.8');
  } else {
    for (const slug of fallbackSlugs) xml += url(`${SITE_URL}/project/${slug}`, today, 'weekly', '0.8');
  }
  xml += `</urlset>`;
  return xml;
}

const app = express();

// Express JSON Parsing
app.use(express.json());

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

  if (has(/sitemap/i)) {
    req.url = '/sitemap.xml';
  } else if (has(/robots/i)) {
    req.url = '/robots.txt';
  } else if (has(/llms\.txt/i)) {
    req.url = '/llms.txt';
  } else if (projectMatch && !has(/\/api\/(drive-images|sheets-|image-proxy)/i)) {
    req.url = `/project/${projectMatch[1]}`;
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
  res.send(buildSitemapXml(projects, FALLBACK_PROJECT_SLUGS));
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

// Project pages: same app, but with this project's own title, description, canonical, Open Graph and JSON-LD
app.get(['/project/:slug', '/projects/:slug', '/property/:slug', '/properties/:slug'], async (req, res) => {
  const slug = String(req.params.slug || '');
  try {
    const [projects, indexHtml] = await Promise.all([
      fetchSeoProjects().catch((e) => { console.warn('Project prerender: sheet unavailable', e); return [] as SeoProject[]; }),
      loadIndexHtml(req)
    ]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
    const project = findSeoProject(slug, projects);
    if (!project) {
      // Unknown slug: still serve the app (it shows the home page), but tell search engines it is not a real page.
      res.status(projects.length ? 404 : 200).send(indexHtml);
      return;
    }
    res.send(renderProjectHtml(indexHtml, project));
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

// Anything else that reaches this function: serve the app shell instead of "Cannot GET"
app.use(async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(await loadIndexHtml(req));
  } catch {
    res.redirect(302, '/');
  }
});

export default app;
