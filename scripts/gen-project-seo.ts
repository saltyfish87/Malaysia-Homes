/**
 * Build the per-project detail file used by project pages (server HTML + app modal):
 * unit types, facilities, nearby places, key features, description, cover image and
 * hand-written FAQs. Sources, in order of preference:
 *   1. ~/ctg-agent/data/incoming/<Project>/result.json  (developer sales kits, extracted by ctg-agent;
 *      only records with processing_status "extracted" are used)
 *   2. src/constants/allProjectsSeo.ts                   (13 hand-written FAQ sets)
 * Output: public/data/projectSeo.json (committed; served as a static file on Vercel).
 *
 * Run:  npx tsx scripts/gen-project-seo.ts            (CTG_DIR env overrides the ctg-agent folder)
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ALL_PROJECTS_SEO } from '../src/constants/allProjectsSeo';
import { MOCK_PROJECTS } from '../src/constants/mockData';

const CTG_DIR = process.env.CTG_DIR || path.join(os.homedir(), 'ctg-agent', 'data', 'incoming');
const OUT = path.join(process.cwd(), 'public', 'data', 'projectSeo.json');

/**
 * The shared Drive folder that holds one sub-folder per project (Facade, Visual_Gallery, Layout_Type…).
 * Competitor pages carry dozens of photos; this site served one. Photos are read here at generation
 * time, by project name, and committed in projectSeo.json, so the server never touches Drive.
 */
const PHOTO_PARENT = process.env.PHOTO_PARENT || '1F7VXziU9LE8Kvz0FqEoMGI4_SiUU76FE';
const FILLER = new Set(['the', 'residence', 'residences', 'suites', 'suite', 'at', 'by', 'phase', 'tower', 'towers', 'block', 'and', 'kl', 'city', 'centre', 'center', 'kuala', 'lumpur', 'klcc']);
const unescapeHtml = (t: string) => t.replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
const nameWords = (n: string) => new Set(unescapeHtml(String(n || '')).toLowerCase().split(/[^a-z0-9]+/).filter(w => w && !FILLER.has(w)));
function sameProject(a: string, b: string) {
  const wa = nameWords(a), wb = nameWords(b);
  if (!wa.size || !wb.size) return false;
  const shared = [...wa].filter(x => wb.has(x)).length;
  return shared > 0 && (shared === wa.size || shared === wb.size || shared / Math.max(wa.size, wb.size) >= 0.6);
}
async function listFolder(folderId: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}#list`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const out: { id: string; name: string }[] = [];
  for (const block of html.split('<div class="flip-entry"').slice(1)) {
    const id = /id="entry-([A-Za-z0-9_-]+)"/.exec(block)?.[1];
    const name = /flip-entry-title[^>]*>([^<]+)</.exec(block)?.[1]?.trim();
    if (id && name) out.push({ id, name: unescapeHtml(name) });
  }
  return out;
}
const altFromFile = (project: string, file: string) =>
  `${project} — ${file.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()}`;
let masterCache: { id: string; name: string }[] | null = null;
async function galleryFor(project: string): Promise<{ url: string; alt: string }[]> {
  try {
    if (!masterCache) masterCache = await listFolder(PHOTO_PARENT);
    const hit = masterCache.find(f => sameProject(f.name, project));
    if (!hit) return [];
    const subs = await listFolder(hit.id);
    const pick = async (key: string) => {
      const sub = subs.find(x => x.name.toLowerCase().replace(/[^a-z]/g, '') === key);
      return sub ? (await listFolder(sub.id)).filter(f => /\.(jpe?g|png|webp)$/i.test(f.name)) : [];
    };
    const files = [...await pick('facade'), ...await pick('visualgallery')].slice(0, 12);
    return files.map(f => ({ url: `https://lh3.googleusercontent.com/d/${f.id}=w1200`, alt: altFromFile(project, f.name) }));
  } catch (e: any) { console.warn(`  ! ${project}: ${e.message}`); return []; }
}

export interface ProjectSeoRecord {
  name: string;
  aliases: string[];          // alphanumeric keys that identify this project (ctg name, folder name, app name)
  source: string;             // where the facts came from
  developer?: string; tenure?: string; landTitle?: string; landSize?: string; projectType?: string;
  totalUnits?: string; totalFloors?: string; unitsPerFloor?: string; lifts?: string;
  maintenanceFee?: string; completionYear?: string; completionStatus?: string; constructionPeriod?: string;
  address?: string; lat?: number; lng?: number;
  /** Nearest named rail stations, straight-line km, measured from the project's own coordinates. */
  stations?: { name: string; km: number }[];
  priceMin?: number; priceMax?: number; pricePsf?: string;
  builtUpMin?: number; builtUpMax?: number; bedrooms?: string; bathrooms?: string;
  coverImage?: string;
  /** Up to twelve photos from the project's folder in the shared Drive photo parent, alt text from the file name. */
  gallery?: { url: string; alt: string }[];
  description?: string;
  keyFeatures: string[];
  facilities: string[];
  amenities: { category: string; name: string; distance?: string }[];
  layouts: { type: string; sqft?: number; beds?: string; baths?: string }[];
  faqs: { q: string; a: string }[];
}

/**
 * Straight-line distance to the nearest rail stations.
 *
 * public/data/rail-stations.json is an OpenStreetMap extract of every named station in the three
 * regions these projects sit in. No competitor measures anything — "5 minutes to the MRT" is copied
 * from a brochure — so this is the one figure on the page that is checkable. Straight line, and the
 * page says so: a walk is always longer.
 */
interface RailStation { name: string; lat: number; lon: number }
function loadStations(): RailStation[] {
  try {
    const f = path.join(process.cwd(), 'public', 'data', 'rail-stations.json');
    return (JSON.parse(fs.readFileSync(f, 'utf8')).stations || []) as RailStation[];
  } catch { return []; }
}
function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371, rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat), dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
/** OSM labels a station with its line code; group by the name so one interchange is one entry. */
function nearestStations(lat: number, lng: number, all: RailStation[]): { name: string; km: number }[] {
  const strip = (n: string) => n.replace(/^[A-Z]{2}\d+[A-Z]?\s+/, '').replace(/\s+(LRT|MRT|Monorail|KTM)\s+Station$/i, '').trim();
  const best = new Map<string, number>();
  for (const st of all) {
    if (/bus\s*terminal|bus\s*station|bus\s*hub/i.test(st.name)) continue;
    const km = haversineKm(lat, lng, st.lat, st.lon);
    if (km > 4) continue;
    const key = strip(st.name) || st.name;
    const prev = best.get(key);
    if (prev === undefined || km < prev) best.set(key, km);
  }
  return [...best.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([name, km]) => ({ name, km: Math.round(km * 100) / 100 }));
}

const RAIL_STATIONS = loadStations();
const alnum = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const clean = (s: any) => (typeof s === 'string' ? s.trim() : s == null ? '' : String(s)).replace(/\s+/g, ' ');
const num = (v: any): number | undefined => { const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, '')); return isFinite(n) && n > 0 ? n : undefined; };
const driveToLh3 = (u: string) => { const m = (u || '').match(/[?&]id=([A-Za-z0-9_-]+)|\/d\/([A-Za-z0-9_-]+)/); return m ? `https://lh3.googleusercontent.com/d/${m[1] || m[2]}=w1600` : ''; };

function splitList(s: string): string[] {
  return (s || '').split(/\s*\|\s*|\n+/).map(x => x.trim()).filter(Boolean);
}

/** "Podium: Infinity Pool, Pool Deck | Level 8: Gym" or "Gym | Pool" → flat list of facility names. */
function parseFacilities(s: string): string[] {
  const out: string[] = [];
  for (const chunk of splitList(s)) {
    const m = chunk.match(/^([^:]{2,40}):\s*(.+)$/);
    const items = m ? m[2].split(/\s*,\s*/) : [chunk];
    for (const it of items) { const t = it.trim().replace(/\.$/, ''); if (t && !out.includes(t)) out.push(t); }
  }
  return out.slice(0, 60);
}

/** Two formats seen: "Category - Name (1.3km)" per pipe, or "category: X, amenities: ['a', 'b']" per pipe. */
function parseAmenities(s: string): { category: string; name: string; distance?: string }[] {
  const out: { category: string; name: string; distance?: string }[] = [];
  for (const chunk of splitList(s)) {
    const listForm = chunk.match(/^category:\s*([^,]+),\s*(?:amenities|items|places|list):\s*\[(.*)\]$/i);
    if (listForm) {
      const cat = listForm[1].trim();
      for (const raw of listForm[2].split(/',\s*'|",\s*"/)) {
        const name = raw.replace(/^['"\s]+|['"\s]+$/g, '');
        if (name) out.push(withDistance(cat, name));
      }
      continue;
    }
    const dash = chunk.match(/^([^-]{2,40})\s+-\s+(.+)$/);
    if (dash) out.push(withDistance(dash[1].trim(), dash[2].trim()));
    else out.push(withDistance('Nearby', chunk));
  }
  return out.slice(0, 40);
}
function withDistance(category: string, name: string) {
  const m = name.match(/^(.*?)\s*\(([^)]*(?:km|m|min|minute|walk)[^)]*)\)\s*$/i);
  return m ? { category, name: m[1].trim(), distance: m[2].trim() } : { category, name };
}

/** "Type A 920sqft 3R2B | Type B1 1050sqft 3+1R2B" → rows; falls back to layout_types_json. */
function parseLayouts(layoutsStr: string, layoutsJson: any): ProjectSeoRecord['layouts'] {
  const rows: ProjectSeoRecord['layouts'] = [];
  for (const chunk of splitList(layoutsStr)) {
    const m = chunk.match(/^(.*?)\s+(\d[\d,]*)\s*sq\.?\s*ft\.?\s*(?:([\d+]+)R(\d+)B)?/i) || chunk.match(/^(.*?)\s+(\d[\d,]*)\s*sqft/i);
    if (m) rows.push({ type: m[1].replace(/^type\s+/i, '').trim(), sqft: num(m[2]), beds: m[3], baths: m[4] });
  }
  if (rows.length) return rows;
  let arr: any[] = [];
  try { arr = typeof layoutsJson === 'string' ? JSON.parse(layoutsJson) : Array.isArray(layoutsJson) ? layoutsJson : []; } catch { arr = []; }
  for (const l of arr) rows.push({ type: clean(l.layout_type), sqft: num(l.built_up_sqft), beds: l.bedrooms != null ? String(l.bedrooms) : undefined, baths: l.bathrooms != null ? String(l.bathrooms) : undefined });
  return rows.filter(r => r.type);
}

function readCtg(): ProjectSeoRecord[] {
  const out: ProjectSeoRecord[] = [];
  if (!fs.existsSync(CTG_DIR)) { console.warn(`[gen-project-seo] ${CTG_DIR} not found; only hand-written FAQs will be used.`); return out; }
  for (const dir of fs.readdirSync(CTG_DIR)) {
    if (dir.startsWith('.') || /\.bak_/i.test(dir)) continue;
    const f = path.join(CTG_DIR, dir, 'result.json');
    if (!fs.existsSync(f)) continue;
    let r: any; try { r = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
    if ((r.processing_status || 'extracted') !== 'extracted') continue; // held_for_review = not yet checked
    const name = clean(r.project_name) || dir;
    const coord = clean(r.coordinate).split(/\s*,\s*/).map(parseFloat);
    const rec: ProjectSeoRecord = {
      name, aliases: [alnum(name), alnum(dir)].filter(Boolean), source: `ctg-agent ${clean(r.processing_date).slice(0, 10)}`,
      developer: clean(r.developer) || undefined, tenure: clean(r.tenure) || undefined, landTitle: clean(r.land_title) || undefined, landSize: clean(r.land_size) || undefined,
      projectType: clean(r.project_type) || undefined, totalUnits: clean(r.total_units) || undefined, totalFloors: clean(r.total_floors) || undefined,
      unitsPerFloor: clean(r.units_per_floor) || undefined, lifts: clean(r.lift_per_floor) || undefined, maintenanceFee: clean(r.maintenance_fee) || undefined,
      completionYear: clean(r.completion_year) || undefined, completionStatus: clean(r.completion_status) || undefined, constructionPeriod: clean(r.construction_period) || undefined,
      address: clean(r.address) || undefined,
      lat: coord.length === 2 && isFinite(coord[0]) ? coord[0] : undefined, lng: coord.length === 2 && isFinite(coord[1]) ? coord[1] : undefined,
      stations: coord.length === 2 && isFinite(coord[0]) && isFinite(coord[1]) ? nearestStations(coord[0], coord[1], RAIL_STATIONS) : undefined,
      priceMin: num(r.price_min), priceMax: num(r.price_max), pricePsf: clean(r.price_psf) || undefined,
      builtUpMin: num(r.built_up_min), builtUpMax: num(r.built_up_max), bedrooms: clean(r.bedrooms) || undefined, bathrooms: clean(r.bathrooms) || undefined,
      coverImage: driveToLh3(clean(r.cover_image_url)) || undefined,
      description: clean(r.description_en || r.project_description) || undefined,
      keyFeatures: splitList(String(r.key_features || '').replace(/\s*;\s*/g, '|')).map(x => x.replace(/\[COMPLIANCE:.*?\]/gi, '').replace(/\.$/, '').trim()).filter(Boolean).slice(0, 12),
      facilities: parseFacilities(String(r.facilities || '')),
      amenities: parseAmenities(String(r.amenities || '')),
      layouts: parseLayouts(String(r.layouts || ''), r.layout_types_json),
      faqs: []
    };
    if (rec.priceMin && rec.priceMin < 50000) rec.priceMin = undefined; // bad sheet-style values (e.g. psf typed as price)
    out.push(rec);
  }
  return out;
}

async function main() {
  const records = readCtg();
  const byAlias = new Map<string, ProjectSeoRecord>();
  for (const r of records) for (const a of r.aliases) if (!byAlias.has(a)) byAlias.set(a, r);

  // Hand-written FAQ sets: attach to the matching ctg record, or create a record from them.
  let handWritten = 0;
  for (const [appId, info] of Object.entries(ALL_PROJECTS_SEO)) {
    const mock = MOCK_PROJECTS.find(m => m.id === appId);
    const keys = [alnum(info.name), mock ? alnum(mock.name) : '', alnum(appId)].filter(Boolean);
    let rec = keys.map(k => byAlias.get(k)).find(Boolean)
      || records.find(r => keys.some(k => k.length >= 5 && (r.aliases.some(a => a.includes(k) || k.includes(a)))));
    if (!rec) {
      rec = { name: info.name, aliases: [], source: 'hand-written (allProjectsSeo.ts)', keyFeatures: info.highlights || [], facilities: info.amenities || [], amenities: [], layouts: [], faqs: [], description: info.description };
      records.push(rec);
    }
    for (const k of keys) if (!rec.aliases.includes(k)) { rec.aliases.push(k); byAlias.set(k, rec); }
    if (!rec.keyFeatures.length && info.highlights?.length) rec.keyFeatures = info.highlights;
    rec.faqs = (info.faqs || []).map(f => ({ q: f.q, a: f.a }));
    handWritten += rec.faqs.length;
  }
  // App names as aliases so the server can match sheet names the same way the app does.
  for (const m of MOCK_PROJECTS) {
    const k = alnum(m.name);
    const rec = byAlias.get(k) || records.find(r => r.aliases.some(a => a.length >= 5 && (a.includes(k) || k.includes(a))));
    if (rec && !rec.aliases.includes(k)) { rec.aliases.push(k); byAlias.set(k, rec); }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  // Photos, by name, from the shared Drive folder.
  let withPhotos = 0;
  for (const r of records) { r.gallery = await galleryFor(r.name); if (r.gallery.length) withPhotos++; }
  console.log(`[gen-project-seo] photos for ${withPhotos}/${records.length} projects from the shared Drive folder.`);
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), count: records.length, projects: records }, null, 1), 'utf8');
  const matchedApp = MOCK_PROJECTS.filter(m => byAlias.has(alnum(m.name)));
  console.log(`[gen-project-seo] ${records.length} records (${records.filter(r => r.source.startsWith('ctg')).length} from ctg-agent, ${handWritten} hand-written FAQs) → ${path.relative(process.cwd(), OUT)}`);
  console.log(`[gen-project-seo] app projects with a record: ${matchedApp.length}/${MOCK_PROJECTS.length}`);
  console.log(`[gen-project-seo] app projects WITHOUT a record: ${MOCK_PROJECTS.filter(m => !byAlias.has(alnum(m.name))).map(m => m.name).join(' | ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
