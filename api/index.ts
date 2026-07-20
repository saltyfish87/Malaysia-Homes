import express from 'express';

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

const app = express();

// Express JSON Parsing
app.use(express.json());

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

// Dynamic sitemap.xml for SEO, AISEO, and GEO indexing of all projects
app.get(['/sitemap.xml', '/sitemap'], async (req, res) => {
  res.header('Content-Type', 'application/xml');
  
  // Set up default/fallback project IDs (from mock data)
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
    'panorama-kelana', 'sunway-dhill', 'd-evia-kwasa'
  ]);

  try {
    // Try fetching live spreadsheet to append any new projects dynamically
    const SPREADSHEET_ID = '1__k-dTt9oxBZSKKp9wI2O42l8QiBpqy0O9dwZK1jyqQ';
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=2052526095&cb=${Date.now()}`;
    const response = await fetch(spreadsheetUrl);
    if (response.ok) {
      const csvText = await response.text();
      // Super simple lightweight CSV row parse
      const lines = csvText.split(/\r?\n/);
      if (lines.length > 1) {
        // Find "project name" column index
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

  // Build XML string
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static page URLs
  xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${domain}/?tab=compare</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${domain}/?tab=guide</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${domain}/?tab=favorites</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;

  // Dynamic project URLs
  projectSlugs.forEach(slug => {
    xml += `  <url>\n    <loc>${domain}/?project=${slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;
  res.send(xml);
});

// Serve robots.txt pointing to the dynamic sitemap
app.get(['/robots.txt', '/robots'], (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: https://propertyportal.my/sitemap.xml\n`);
});

export default app;
