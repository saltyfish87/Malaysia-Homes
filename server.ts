import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getProjectSEOData } from './src/constants/allProjectsSeo';
import { MOCK_PROJECTS } from './src/constants/mockData';

// In-Memory Caches for smooth fast performance
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

  // Explicitly add any missed custom override folders (Axis, Brixton, Dover, etc.)
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Express JSON Parsing
  app.use(express.json());

  // Canonical Domain (www -> non-www) & URL Normalization Middleware (Fixes Google Search Console "Page with redirect")
  app.use((req, res, next) => {
    const host = (req.headers.host || '').toLowerCase();
    
    // 1. Force naked domain (propertyportal.my) if accessed via www
    if (host.startsWith('www.propertyportal.my')) {
      const canonicalHost = host.replace(/^www\./, '');
      const fullUrl = `https://${canonicalHost}${req.originalUrl || req.url}`;
      return res.redirect(301, fullUrl);
    }

    // 2. Safely handle literal Google/Bing crawler bot search template hits ({search_term_string})
    if (req.url.includes('{search_term_string}') || req.url.includes('%7Bsearch_term_string%7D')) {
      if (process.env.NODE_ENV === 'production') {
        const distPath = path.join(process.cwd(), 'dist');
        return res.sendFile(path.join(distPath, 'index.html'));
      }
      req.url = '/residences';
      return next();
    }

    // 3. HTTP 301 Permanent Redirects for legacy query parameters to elevate to canonical clean URLs
    const rawUrl = req.url || '';
    if (rawUrl.includes('project=') || rawUrl.includes('tab=')) {
      try {
        const parsed = new URL(rawUrl, `http://${host || 'localhost'}`);
        const projectParam = parsed.searchParams.get('project');
        const tabParam = parsed.searchParams.get('tab');

        if (projectParam) {
          const cleanSlug = projectParam.toLowerCase().trim();
          // Aliases check
          const slugAliases: Record<string, string> = {
            'alora-residence': 'alora-subang',
            'alora': 'alora-subang',
            'forest-hill': 'foresthill',
            'forest-hill-residence': 'foresthill',
            'centrix': 'core-trx',
            'trx': 'core-trx',
            'causeway': 'johor-causeway',
            'causeways': 'johor-causeway',
            'causewayz': 'johor-causeway',
            'ciq': 'johor-causeway',
            'bangsar-hill': 'bangsar-hill-bc',
            'kl-wellness-city': 'wellness-city',
            'wellnesscity': 'wellness-city',
            'tria': 'tria-seputeh',
            'zenia': 'zenia-damansara',
            'aricia-residence': 'aricia',
            'aricia-residences': 'aricia',
            'aricia-chan-sow-lin': 'aricia',
            'aricia-chansowlin': 'aricia',
            'aricia-fiamma': 'aricia',
            'amika-residence': 'amika',
            'amika-subang': 'amika',
            'anya-puchong': 'anya',
            'anya-shorea-park': 'anya',
            'aster-hill-sri-petaling': 'aster-hill',
            'asterhill': 'aster-hill',
            'kingswoodz-bukit-jalil': 'kingswoodz',
            'queenswoodz-bukit-jalil': 'queenswoodz',
            'rf-princess-cove': 'rf-casa',
            'princess-cove': 'rf-casa'
          };
          const targetSlug = slugAliases[cleanSlug] || cleanSlug;
          return res.redirect(301, `/project/${targetSlug}`);
        }

        if (tabParam && ['residences', 'compare', 'guide', 'calculators', 'map', 'favorites'].includes(tabParam)) {
          return res.redirect(301, `/${tabParam}`);
        }
      } catch (e) {
        // Fall through
      }
    }

    next();
  });

  // Vercel Serverless Rewrite helper: ensures that when Vercel rewrites /sitemap.xml or /robots.txt to the function,
  // the original request path is matched back so Express routes match correctly.
  app.use((req, res, next) => {
    const url = req.url || '';
    const path = req.path || '';
    const originalUrl = req.originalUrl || '';
    const matchedPath = (req.headers['x-matched-path'] as string) || '';
    const forwardedUri = (req.headers['x-forwarded-uri'] as string) || '';
    const originalUrlHeader = (req.headers['x-original-url'] as string) || '';
    
    const isSitemap = 
      url.toLowerCase().includes('sitemap') || 
      path.toLowerCase().includes('sitemap') ||
      originalUrl.toLowerCase().includes('sitemap') || 
      matchedPath.toLowerCase().includes('sitemap') ||
      forwardedUri.toLowerCase().includes('sitemap') ||
      originalUrlHeader.toLowerCase().includes('sitemap');

    const isRobots = 
      url.toLowerCase().includes('robots') || 
      path.toLowerCase().includes('robots') ||
      originalUrl.toLowerCase().includes('robots') || 
      matchedPath.toLowerCase().includes('robots') ||
      forwardedUri.toLowerCase().includes('robots') ||
      originalUrlHeader.toLowerCase().includes('robots');

    if (isSitemap) {
      req.url = '/sitemap.xml';
    } else if (isRobots) {
      req.url = '/robots.txt';
    }
    next();
  });

  // API Route: Google Drive Scraper
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
      // Serve a beautiful, highly polished, premium placeholder image so the frontend never has broken links!
      res.redirect('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80');
    }
  });

  // Dynamic sitemap.xml for SEO, AISEO, and GEO indexing of all projects
  app.get(['/sitemap.xml', '/sitemap'], async (req, res) => {
    res.header('Content-Type', 'application/xml');
    
    // Set up default/fallback project IDs and names
    const projectSlugs = new Set([
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
    ]);

    try {
      // Try fetching live spreadsheet to append any new projects dynamically
      const SPREADSHEET_ID = '1__k-dTt9oxBZSKKp9wI2O42l8QiBpqy0O9dwZK1jyqQ';
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=2052526095&cb=${Date.now()}`;
      const response = await fetch(spreadsheetUrl);
      if (response.ok) {
        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/);
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
          const nameIdx = headers.indexOf('project name') !== -1 ? headers.indexOf('project name') : headers.findIndex(h => h.includes('name'));
          const idIdx = headers.indexOf('id') !== -1 ? headers.indexOf('id') : headers.indexOf('slug');
          
          if (nameIdx >= 0) {
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i];
              if (!line.trim()) continue;
              const matches = line.split(',');
              if (matches && matches.length > nameIdx) {
                const rawName = matches[nameIdx].replace(/^"|"$/g, '').trim();
                if (rawName && rawName !== 'Project Name') {
                  const fallbackId = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  let finalId = fallbackId;
                  if (idIdx >= 0 && matches.length > idIdx) {
                    const customId = matches[idIdx].replace(/^"|"$/g, '').trim().toLowerCase();
                    if (customId) finalId = customId;
                  }
                  if (finalId) {
                    projectSlugs.add(finalId);
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Sitemap generator could not load live spreadsheet rows, falling back to static project IDs:', e);
    }

    const domain = 'https://propertyportal.my';
    const currentDate = new Date().toISOString().split('T')[0];

    // Build XML string with Google Image Search namespace support
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Core static page URLs
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/residences</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/map</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/compare</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/guide</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/calculators</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;

    // Dynamic project URLs with Google Image metadata
    projectSlugs.forEach(slug => {
      const formattedTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      xml += `  <url>\n`;
      xml += `    <loc>${domain}/project/${slug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&amp;fit=crop&amp;w=1200&amp;q=80</image:loc>\n`;
      xml += `      <image:title>${formattedTitle} Condominium Floor Plan &amp; Gallery</image:title>\n`;
      xml += `    </image:image>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    res.send(xml);
  });

  // Serve AI & Bot Friendly robots.txt
  app.get(['/robots.txt', '/robots'], (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send(
`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /?tab=admin

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://propertyportal.my/sitemap.xml
`
    );
  });

  // SSR Project Dynamic SEO HTML Renderer
  const renderProjectPageSEO = (rawHtml: string, slug: string): string => {
    const cleanSlug = slug.toLowerCase().trim();
    const strippedSlug = cleanSlug.replace(/[^a-z0-9]/g, '');

    // 1. Find matched project in MOCK_PROJECTS
    const foundProject = MOCK_PROJECTS.find(p => 
      p.id.toLowerCase().trim() === cleanSlug ||
      p.id.toLowerCase().replace(/[^a-z0-9]/g, '') === strippedSlug
    );

    // 2. Get rich, tailored SEO data
    const projectInfo = getProjectSEOData(cleanSlug, foundProject);

    const canonicalUrl = `https://propertyportal.my/project/${cleanSlug}`;
    const pageTitle = `${projectInfo.name} ${projectInfo.area} | Developer Price, Layout Floor Plan, Brochure & Review | propertyportal.my`;
    const pageDescription = `${projectInfo.name} by ${projectInfo.developer} in ${projectInfo.area}, ${projectInfo.state}. Official developer price from RM ${projectInfo.priceMin.toLocaleString()} to RM ${projectInfo.priceMax.toLocaleString()}, ${projectInfo.tenure} ${projectInfo.propertyType} with ${projectInfo.sizeMin}-${projectInfo.sizeMax} sqft layouts (${projectInfo.bedrooms}+ beds). View floor plans, MRT connectivity, and schedule a showroom appointment.`;
    const pageKeywords = `${projectInfo.name}, ${projectInfo.name} price, ${projectInfo.name} floor plan, ${projectInfo.name} layout, ${projectInfo.name} developer, ${projectInfo.name} brochure, ${projectInfo.name} review, ${projectInfo.name} ${projectInfo.area}, ${projectInfo.developer} ${projectInfo.name}, buy ${projectInfo.name}, ${projectInfo.area} property, ${projectInfo.name} show gallery, ${projectInfo.name} showroom, foreigner buy ${projectInfo.name}, propertyportal.my`;

    // JSON-LD Schema graph
    const schemaGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://propertyportal.my/#website',
          'url': 'https://propertyportal.my',
          'name': 'Malaysia Homes',
          'alternateName': 'propertyportal.my',
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': 'https://propertyportal.my/residences?search={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'RealEstateAgent',
          '@id': 'https://propertyportal.my/#agency',
          'name': 'Malaysia Homes',
          'url': 'https://propertyportal.my',
          'telephone': '+60108278932',
          'priceRange': 'MYR 300,000 - MYR 5,000,000'
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonicalUrl}#breadcrumb`,
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://propertyportal.my/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Properties', 'item': 'https://propertyportal.my/residences' },
            { '@type': 'ListItem', 'position': 3, 'name': projectInfo.name, 'item': canonicalUrl }
          ]
        },
        {
          '@type': projectInfo.propertyType === 'Landed' ? ['SingleFamilyResidence', 'Product'] : ['ApartmentComplex', 'Product'],
          '@id': `${canonicalUrl}#project`,
          'name': `${projectInfo.name} ${projectInfo.area}`,
          'alternateName': `${projectInfo.name} by ${projectInfo.developer}`,
          'description': projectInfo.description,
          'url': canonicalUrl,
          'image': [projectInfo.image],
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': `${projectInfo.area}, ${projectInfo.state}`,
            'addressLocality': projectInfo.area,
            'addressRegion': projectInfo.state,
            'addressCountry': 'MY'
          },
          'offers': {
            '@type': 'AggregateOffer',
            'priceCurrency': 'MYR',
            'lowPrice': projectInfo.priceMin,
            'highPrice': projectInfo.priceMax,
            'offerCount': '1',
            'priceValuedAs': 'MYR',
            'availability': 'https://schema.org/InStock',
            'url': canonicalUrl,
            'seller': {
              '@type': 'RealEstateAgent',
              'name': 'Malaysia Homes',
              'telephone': '+60108278932'
            }
          },
          'numberOfRooms': projectInfo.bedrooms,
          'priceRange': `MYR ${projectInfo.priceMin.toLocaleString()} - MYR ${projectInfo.priceMax.toLocaleString()}`,
          'amenityFeature': [
            { '@type': 'LocationFeatureSpecification', 'name': 'Tenure', 'value': projectInfo.tenure },
            { '@type': 'LocationFeatureSpecification', 'name': 'Developer', 'value': projectInfo.developer },
            { '@type': 'LocationFeatureSpecification', 'name': 'Area', 'value': projectInfo.area },
            { '@type': 'LocationFeatureSpecification', 'name': 'Completion Year', 'value': String(projectInfo.completionYear) },
            { '@type': 'LocationFeatureSpecification', 'name': 'Built-Up Range', 'value': `${projectInfo.sizeMin} sqft - ${projectInfo.sizeMax} sqft` }
          ]
        },
        {
          '@type': 'FAQPage',
          '@id': `${canonicalUrl}#faq`,
          'mainEntity': projectInfo.faqs.map(f => ({
            '@type': 'Question',
            'name': f.q,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': f.a
            }
          }))
        }
      ]
    };

    let modified = rawHtml;

    // Replace Title
    modified = modified.replace(/<title>[\s\S]*?<\/title>/i, `<title>${pageTitle}</title>`);

    // Replace Description
    modified = modified.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${pageDescription}" />`);

    // Replace Keywords
    modified = modified.replace(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i, `<meta name="keywords" content="${pageKeywords}" />`);

    // Replace Canonical link
    modified = modified.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);

    // Replace or add OpenGraph / Twitter tags
    const ogBlock = `
    <!-- Dynamic Project OpenGraph / Twitter SEO Meta -->
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDescription}" />
    <meta property="og:image" content="${projectInfo.image}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDescription}" />
    <meta name="twitter:image" content="${projectInfo.image}" />
    <script id="seo-jsonld-schema" type="application/ld+json">${JSON.stringify(schemaGraph, null, 2)}</script>
    `;

    modified = modified.replace('</head>', `${ogBlock}\n</head>`);

    // Semantic Pre-rendered Crawler Body Block
    const semanticCrawlerBlock = `
      <div id="seo-prerender-root" style="display:none;" class="seo-crawler-content">
        <h1>${projectInfo.name} – ${projectInfo.area}, ${projectInfo.state}</h1>
        <p><strong>${projectInfo.name}</strong> is a premier <strong>${projectInfo.tenure} ${projectInfo.propertyType}</strong> developed by <strong>${projectInfo.developer}</strong> located in <strong>${projectInfo.area}, ${projectInfo.state}</strong>.</p>
        <p>Official developer price range: <strong>RM ${projectInfo.priceMin.toLocaleString()} – RM ${projectInfo.priceMax.toLocaleString()}</strong>. Built-up sizes range from <strong>${projectInfo.sizeMin} to ${projectInfo.sizeMax} sqft</strong> (${projectInfo.bedrooms}+ bedrooms). Estimated completion: <strong>${projectInfo.completionYear}</strong>.</p>
        <h2>Key Highlights & Features</h2>
        <ul>
          ${projectInfo.highlights.map(h => `<li>${h}</li>`).join('\n          ')}
        </ul>
        <h2>Nearby Amenities & Transit Access</h2>
        <ul>
          ${projectInfo.amenities.map(a => `<li>${a}</li>`).join('\n          ')}
        </ul>
        <h2>Frequently Asked Questions (FAQs)</h2>
        ${projectInfo.faqs.map(f => `<article><h3>${f.q}</h3><p>${f.a}</p></article>`).join('\n        ')}
        <p>For VIP showroom viewings and official PDF brochures, contact MalaysianHomes WhatsApp Hotline: <a href="https://wa.me/60108278932">+6010-8278932</a>.</p>
      </div>
    `;

    if (modified.includes('<div id="root"></div>')) {
      modified = modified.replace('<div id="root"></div>', `<div id="root"></div>\n${semanticCrawlerBlock}`);
    }

    return modified;
  };

  // Vite integration / Static files serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Handle /project/:slug with SSR SEO injection in dev mode
    app.get(['/project/:slug', '/project/:slug/'], async (req, res, next) => {
      try {
        const slug = req.params.slug;
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(req.originalUrl, template);
          const seoHtml = renderProjectPageSEO(template, slug);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(seoHtml);
        }
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Handle /project/:slug with SSR SEO injection in production mode
    app.get(['/project/:slug', '/project/:slug/'], (req, res) => {
      const slug = req.params.slug;
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        const template = fs.readFileSync(indexPath, 'utf-8');
        const seoHtml = renderProjectPageSEO(template, slug);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(seoHtml);
      }
      res.sendFile(indexPath);
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
