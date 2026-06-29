/**
 * Utility for parsing and syncing Google Spreadsheet live data
 */

import { Project, PropertyType, MalaysianState } from '../types';
import { MOCK_PROJECTS } from '../constants/mockData';

/**
 * Normalizes direct Google Drive file viewer/sharing links into loadable web-renderable direct thumbnails.
 */
export function normalizeDriveUrl(url: string): string {
  if (!url) return url;
  url = url.trim();

  // If we have a list/array with split characters, split and map each
  if (url.includes(',') || url.includes('|')) {
    const delimiters = /[,|]+/;
    return url
      .split(delimiters)
      .map(part => normalizeDriveUrl(part.trim()))
      .join('|');
  }

  let fileId = '';
  
  // Pattern 1: https://drive.google.com/file/d/1_Sg_84z.../view?usp=sharing
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch) {
    fileId = fileDMatch[1];
  } else {
    // Pattern 2/3: id=1_Sg_84z... inside open?id= or uc?id=
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch) {
      fileId = idParamMatch[1];
    }
  }

  // If a valid Google Drive file ID was matched, convert to a direct thumbnail image URL
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  }

  return url;
}

// Custom lightweight state machine CSV parser to handle quotes, commas, and escapes
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip standard \n
      }
      row.push(currentVal);
      lines.push(row);
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || row.length > 0) {
    row.push(currentVal);
    lines.push(row);
  }

  return lines;
}

// Strip non-numeric artifacts to extract integer/float values
function coerceNumber(val: any, fallback: any): any {
  if (val === undefined || val === null || val === '') return fallback;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
}

// Convert column values to string list splits (commas, pipes, bullet points)
function coerceArray(val: any): string[] {
  if (!val) return [];
  return String(val)
    .split(/[,\n•;|]+/)
    .map(x => x.replace(/^[•\-\s]+/, '').trim())
    .filter(Boolean);
}

// Convert boolean equivalents
function coerceBoolean(val: any): boolean {
  if (!val) return false;
  const clean = String(val).toLowerCase().trim();
  return clean === 'true' || clean === 'yes' || clean === 'y' || clean === '1' || clean === 'featured' || clean === '是';
}

// Generate slugs safely as ID fallbacks
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const EXPLICIT_FOLDERS = {
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

/**
 * Fetches Google Drive subfolders crawled and returned by our backend proxy.
 */
export async function fetchGoogleDriveImages(): Promise<Record<string, { image: string; gallery: string[]; locationImage?: string; files?: { name: string; url: string }[]; flatFiles?: { id: string; name: string; url: string }[] }>> {
  try {
    const res = await fetch('/api/drive-images');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.driveMap) {
        return data.driveMap;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch Google Drive images from proxy API:', error);
  }
  return {};
}

/**
 * Fetches Google Sheet export CSV, maps headers using flexible synonyms,
 * and outputs fully compliant Project instances. Inherits missing coordinates
 * from MOCK_PROJECTS dynamically.
 */
export async function fetchSpreadsheetData(accessToken?: string): Promise<Project[]> {
  const res = await fetch('/api/sheets-listings');

  if (!res.ok) {
    throw new Error(`Google Sheet listings fetch returned status ${res.status}`);
  }

  const resJson = await res.json();
  if (!resJson.success) {
    throw new Error(`Google Sheet listings fetch returned error: ${resJson.error}`);
  }

  const csvText = resJson.csv;
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    throw new Error('Spreadsheet does not contain enough data rows.');
  }

  // Fetch Google Drive images dynamically
  let driveImagesMap: Record<string, { image: string; gallery: string[]; locationImage?: string; files?: { name: string; url: string }[]; flatFiles?: { id: string; name: string; url: string }[] }> | null = null;
  driveImagesMap = await fetchGoogleDriveImages();
  if (driveImagesMap && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('malaysianhomes-drive-images-cache', JSON.stringify(driveImagesMap));
    } catch (e) {
      console.warn('Failed to cache drive images in localStorage:', e);
    }
  }

  if (driveImagesMap) {
    console.log('Discovered Google Drive project mapping asset profiles:', Object.keys(driveImagesMap));
  }

  // Fetch Locations sheet for coordinate mapping overrides dynamically
  const locationsMap = new Map<string, { lat: number; lng: number }>();
  try {
    const locRes = await fetch('/api/sheets-locations');
    if (locRes.ok) {
      const locResJson = await locRes.json();
      if (locResJson.success) {
        const locCsv = locResJson.csv;
        const locRows = parseCSV(locCsv);
        if (locRows.length > 1) {
          const headerRow = locRows[0].map(cell => cell.replace(/^"|"$/g, '').trim().toLowerCase());
          const nameIdx = headerRow.indexOf('project name');
          const latIdx = headerRow.findIndex(cell => cell.includes('lat'));
          const lngIdx = headerRow.findIndex(cell => cell.includes('lng'));
          
          const activeNameIdx = nameIdx >= 0 ? nameIdx : 0;
          const activeLatIdx = latIdx >= 0 ? latIdx : 1;
          const activeLngIdx = lngIdx >= 0 ? lngIdx : 2;
          
          for (let i = 1; i < locRows.length; i++) {
            const row = locRows[i];
            if (row.length > Math.max(activeNameIdx, activeLatIdx, activeLngIdx)) {
              const rawPName = row[activeNameIdx].replace(/^"|"$/g, '').trim();
              const rawLat = row[activeLatIdx].replace(/^"|"$/g, '').trim();
              const rawLng = row[activeLngIdx].replace(/^"|"$/g, '').trim();
              const latitude = parseFloat(rawLat);
              const longitude = parseFloat(rawLng);
              if (rawPName && !isNaN(latitude) && !isNaN(longitude)) {
                locationsMap.set(rawPName.toLowerCase(), { lat: latitude, lng: longitude });
              }
            }
          }
          console.log('Successfully loaded location coordinates from Locations sheet mapping! Found count:', locationsMap.size);
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch Locations sheet coordinates:', error);
  }

  // Fetch Full Details sheet for additional specifications overrides dynamically
  const fullDetailsMap = new Map<string, any>();
  try {
    const fullRes = await fetch('/api/sheets-full-details');
    if (fullRes.ok) {
      const fullResJson = await fullRes.json();
      if (fullResJson.success) {
        const fullCsv = fullResJson.csv;
        const fullRows = parseCSV(fullCsv);
        if (fullRows.length > 1) {
          // Find header row in fullDetails
          let fullHeaderIdx = 0;
          for (let i = 0; i < Math.min(15, fullRows.length); i++) {
            if (fullRows[i]?.some(c => {
              const cl = c.toLowerCase().trim();
              return cl === 'project name' || cl === 'developer' || cl.includes('full address');
            })) {
              fullHeaderIdx = i;
              break;
            }
          }
          
          const fullHeaders = fullRows[fullHeaderIdx].map(h => h.trim().toLowerCase());
          
          // Helper synonym mapper for Full Details columns specifically
          const getFullColIdx = (syns: string[]): number => {
            const exactIdx = fullHeaders.findIndex(h => syns.some(syn => h === syn));
            if (exactIdx >= 0) return exactIdx;
            return fullHeaders.findIndex(h => syns.some(syn => h.includes(syn)));
          };
          
          const fMap = {
            name: getFullColIdx(['project name', 'name', 'title']),
            developer: getFullColIdx(['developer', 'dev']),
            address: getFullColIdx(['full address', 'address', 'location']),
            area: getFullColIdx(['area', 'district']),
            tenure: getFullColIdx(['tenure']),
            projectType: getFullColIdx(['project type', 'property type']),
            landTitle: getFullColIdx(['land title', 'title']),
            noOfBlocks: getFullColIdx(['no. of blocks', 'blocks']),
            totalUnits: getFullColIdx(['total units', 'units']),
            noOfFloors: getFullColIdx(['no. of floors', 'floors']),
            builtUpMin: getFullColIdx(['built-up min', 'builtupmin']),
            builtUpMax: getFullColIdx(['built-up max', 'builtupmax']),
            bedroomsMin: getFullColIdx(['bedrooms min', 'bedroom min']),
            bedroomsMax: getFullColIdx(['bedrooms max', 'bedroom max']),
            priceRange: getFullColIdx(['price range']),
            startingPrice: getFullColIdx(['starting price']),
            pricePsf: getFullColIdx(['price psf', 'psf']),
            maintenanceFee: getFullColIdx(['maintenance fee', 'maintenance']),
            carparkMin: getFullColIdx(['carpark min', 'car park min', 'carpark_min']),
            carparkMax: getFullColIdx(['carpark max', 'car park max', 'carpark_max']),
            completionStatus: getFullColIdx(['completion status', 'status']),
            completionYear: getFullColIdx(['completion year', 'completionyear']),
            estCompletionDate: getFullColIdx(['est. completion date', 'est completion', 'estimated completion']),
            launchDate: getFullColIdx(['launch date', 'launch']),
            readyToMove: getFullColIdx(['ready to move', 'ready']),
            underConstruction: getFullColIdx(['under construction']),
            newLaunch: getFullColIdx(['new launch']),
            dataUpdated: getFullColIdx(['data updated']),
            notes: getFullColIdx(['notes'])
          };
          
          for (let i = fullHeaderIdx + 1; i < fullRows.length; i++) {
            const row = fullRows[i];
            const getFVal = (colIdx: number) => {
              if (colIdx < 0 || colIdx >= row.length) return '';
              return row[colIdx].trim();
            };
            
            const pName = getFVal(fMap.name);
            if (pName) {
              const fullDetailsObj = {
                name: pName,
                developer: getFVal(fMap.developer),
                address: getFVal(fMap.address),
                area: getFVal(fMap.area),
                tenure: getFVal(fMap.tenure),
                projectType: getFVal(fMap.projectType),
                landTitle: getFVal(fMap.landTitle),
                noOfBlocks: coerceNumber(getFVal(fMap.noOfBlocks), undefined),
                totalUnits: coerceNumber(getFVal(fMap.totalUnits), undefined),
                noOfFloors: coerceNumber(getFVal(fMap.noOfFloors), undefined),
                builtUpMin: coerceNumber(getFVal(fMap.builtUpMin), undefined),
                builtUpMax: coerceNumber(getFVal(fMap.builtUpMax), undefined),
                bedroomsMin: coerceNumber(getFVal(fMap.bedroomsMin), undefined),
                bedroomsMax: coerceNumber(getFVal(fMap.bedroomsMax), undefined),
                priceRange: getFVal(fMap.priceRange),
                startingPrice: coerceNumber(getFVal(fMap.startingPrice), undefined),
                pricePsf: getFVal(fMap.pricePsf),
                maintenanceFee: getFVal(fMap.maintenanceFee),
                carparkMin: coerceNumber(getFVal(fMap.carparkMin), undefined),
                carparkMax: coerceNumber(getFVal(fMap.carparkMax), undefined),
                completionStatus: getFVal(fMap.completionStatus),
                completionYear: coerceNumber(getFVal(fMap.completionYear), undefined),
                estCompletionDate: getFVal(fMap.estCompletionDate),
                launchDate: getFVal(fMap.launchDate),
                readyToMove: coerceBoolean(getFVal(fMap.readyToMove)),
                underConstruction: coerceBoolean(getFVal(fMap.underConstruction)),
                newLaunch: coerceBoolean(getFVal(fMap.newLaunch)),
                dataUpdated: getFVal(fMap.dataUpdated),
                notes: getFVal(fMap.notes)
              };
              fullDetailsMap.set(pName.toLowerCase(), fullDetailsObj);
            }
          }
          console.log('Successfully loaded full details mapping! Found count:', fullDetailsMap.size);
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch Full Details sheet:', error);
  }

  // Find header row dynamically (usually row index 3, but can be anywhere in the first 15 rows)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(15, rows.length); i++) {
    const r = rows[i];
    if (r.some(cell => {
      const c = cell.toLowerCase().trim();
      return c === 'project name' || c === 'developer' || c.includes('starting price');
    })) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = rows[headerRowIndex].map(h => h.trim().toLowerCase());

  // Define synonym buckets for high-end automatic column mapping
  const mapping = {
    id: ['id', 'slug', 'projectid', 'project id'],
    name: ['project name', 'name', 'title', 'project_name', '名称', '项目'],
    developer: ['developer', 'dev', 'company', 'developer name', '开发商'],
    location: ['location', 'address', '周边', '地址'],
    area: ['area', 'district', 'suburb', '区域'],
    priceMin: ['starting price', 'pricemin', 'price min', 'min price', 'price_min', '最低价'],
    priceRange: ['price range', 'pricemax', 'price max', 'max price', 'price_max', '最高价'],
    builtUpMin: ['built-up min', 'builtupmin', 'built up min', 'min size', 'size min', '最小面积'],
    builtUpMax: ['built-up max', 'builtupmax', 'built up max', 'max size', 'size max', '最大面积'],
    bedroomsMin: ['bedrooms min', 'bedroom min', 'rooms min', 'room min'],
    bedroomsMax: ['bedrooms max', 'bedroom max', 'rooms max', 'room max'],
    tenure: ['tenure', 'leasehold', 'freehold', '产权'],
    propertyType: ['project type', 'property type', 'type', 'building type', '类型', '房产类型'],
    completionStatus: ['completion status', 'status', '状态'],
    completionYear: ['completion year', 'completionyear', 'completion', 'year', 'date', '竣工年份', '建成年份']
  };

  // Helper to resolve index from synonym list with strict exact match priority
  const getIndex = (synonyms: string[]): number => {
    // 1st pass: exact match
    const exactIdx = headers.findIndex(h => synonyms.some(syn => h === syn));
    if (exactIdx >= 0) return exactIdx;
    // 2nd pass: substring match
    return headers.findIndex(h => synonyms.some(syn => h.includes(syn)));
  };

  const indexMap = {
    id: getIndex(mapping.id),
    name: getIndex(mapping.name),
    developer: getIndex(mapping.developer),
    location: getIndex(mapping.location),
    area: getIndex(mapping.area),
    priceMin: getIndex(mapping.priceMin),
    priceRange: getIndex(mapping.priceRange),
    completionYear: getIndex(mapping.completionYear),
    propertyType: getIndex(mapping.propertyType),
    tenure: getIndex(mapping.tenure),
    builtUpMin: getIndex(mapping.builtUpMin),
    builtUpMax: getIndex(mapping.builtUpMax),
    bedroomsMin: getIndex(mapping.bedroomsMin),
    bedroomsMax: getIndex(mapping.bedroomsMax),
    completionStatus: getIndex(mapping.completionStatus),
    // other optional keys that may exist in some sheets
    carPark: getIndex(['car park', 'parking', 'carpark', 'car_park', '车位']),
    totalUnits: getIndex(['total units', 'units', 'total_units', '总户数']),
    totalFloors: getIndex(['total floors', 'floors', 'total_floors', '总楼层']),
    maintenanceFee: getIndex(['maintenance', 'maintenance fee', 'fee', 'psf', '管理费']),
    airbnbFriendly: getIndex(['airbnb', 'short term', 'airbnb friendly', 'airbnb_friendly', '民宿经营']),
    rentalYield: getIndex(['rental yield', 'yield', 'yield rate', 'rental_yield', '租金回报率']),
    investmentScore: getIndex(['investment score', 'investment', 'investment_score', '投资指数']),
    ownStayScore: getIndex(['own stay', 'ownstay', 'own stay score', 'own_stay_score', '自住指数']),
    keyHighlights: getIndex(['key highlights', 'highlights', 'features', 'highlights list', '亮点', '特点']),
    nearbyAmenities: getIndex(['nearby amenities', 'amenities', 'amenities list', '周边配套']),
    description: getIndex(['description', 'about', 'details', '项目详情', '简介']),
    image: getIndex(['image', 'hero', 'thumbnail', 'cover', 'hero image', '封面图']),
    gallery: getIndex(['gallery', 'images', 'photos', 'gallery_images', '轮播图']),
    lat: getIndex(['lat', 'latitude', '纬度']),
    lng: getIndex(['lng', 'longitude', 'long', '经度']),
    featured: getIndex(['featured', 'feature', 'highlighted', '热推']),
    furnishing: getIndex(['furnishing', 'furnish', 'furnished', '装修', '家具装修'])
  };

  console.log('Detected CSV Header Index Mapping:', indexMap);

  const syncedProjects: Project[] = [];
  const seenIds = new Set<string>();

  for (let idx = headerRowIndex + 1; idx < rows.length; idx++) {
    const row = rows[idx];
    if (row.length === 0 || row.every(cell => cell.trim() === '')) continue;

    // Retrieve raw values
    const getVal = (colIdx: number, fallback = '') => {
      if (colIdx < 0 || colIdx >= row.length) return fallback;
      return row[colIdx].trim();
    };

    const rawName = getVal(indexMap.name);
    if (!rawName) continue; // Skip invalid rows lacking names

    // Name Matching with Full Details Map
    let matchedFullDetail: any = null;
    const normalize = (n: string) => {
      return n.toLowerCase()
        .replace(/&/g, 'and')
        .replace(/\bpcd\b/g, '')
        .replace(/\bresidence\b|\bresidences\b|\bsuite\b|\bsuites\b|\bcondominium\b|\bcondo\b|\bserviced apartment\b|\bapartments\b|\bapartment\b/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
    };

    const normL = normalize(rawName);
    
    // 1. Try exact normalized match
    for (const [key, details] of fullDetailsMap.entries()) {
      if (normalize(key) === normL) {
        matchedFullDetail = details;
        break;
      }
    }
    
    // 2. Substring matching fallback
    if (!matchedFullDetail) {
      for (const [key, details] of fullDetailsMap.entries()) {
        const normF = normalize(key);
        if (normL.includes(normF) || normF.includes(normL)) {
          matchedFullDetail = details;
          break;
        }
      }
    }

    // 3. Special case override
    if (!matchedFullDetail) {
      if (rawName.toLowerCase().includes('zenia')) {
        for (const [key, details] of fullDetailsMap.entries()) {
          if (key.toLowerCase().includes('zenia')) {
            matchedFullDetail = details;
            break;
          }
        }
      }
    }

    const fallbackId = generateSlug(rawName);
    const baseId = getVal(indexMap.id, fallbackId).toLowerCase() || 'project';
    let id = baseId;
    let counter = 2;
    while (seenIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    seenIds.add(id);

    // Look up static mock template data for inheritance matching
    const mockRef = MOCK_PROJECTS.find(p => p.id === id) || 
                    MOCK_PROJECTS.find(p => id.includes(p.id) || p.id.includes(id));

    // Dynamic type castings
    const priceMin = matchedFullDetail?.startingPrice !== undefined 
      ? matchedFullDetail.startingPrice 
      : coerceNumber(getVal(indexMap.priceMin), mockRef?.priceMin || 0);

    const rawPriceRange = matchedFullDetail?.priceRange || getVal(indexMap.priceRange);
    let priceMax = mockRef?.priceMax || priceMin;
    if (rawPriceRange) {
      const parts = rawPriceRange.split(/[-–~to]/).map(x => x.trim()).filter(Boolean);
      if (parts.length > 1) {
        priceMax = coerceNumber(parts[parts.length - 1], priceMin);
      } else if (parts.length === 1) {
        priceMax = coerceNumber(parts[0], priceMin);
      }
    }
    if (priceMax < priceMin) {
      priceMax = priceMin;
    }

    const completionYear = matchedFullDetail?.completionYear !== undefined 
      ? matchedFullDetail.completionYear 
      : coerceNumber(getVal(indexMap.completionYear), mockRef?.completionYear || 2028);

    const builtUpMin = matchedFullDetail?.builtUpMin !== undefined 
      ? matchedFullDetail.builtUpMin 
      : coerceNumber(getVal(indexMap.builtUpMin), mockRef?.builtUpMin || 0);

    const builtUpMax = matchedFullDetail?.builtUpMax !== undefined 
      ? matchedFullDetail.builtUpMax 
      : coerceNumber(getVal(indexMap.builtUpMax), mockRef?.builtUpMax || 0);
    
    // Bedrooms min and max
    const bedrooms = matchedFullDetail?.bedroomsMin !== undefined 
      ? matchedFullDetail.bedroomsMin 
      : coerceNumber(getVal(indexMap.bedroomsMin), mockRef?.bedrooms || 3);

    const bathrooms = matchedFullDetail?.bedroomsMax !== undefined 
      ? matchedFullDetail.bedroomsMax 
      : coerceNumber(getVal(indexMap.bedroomsMax), mockRef?.bathrooms || Math.max(1, bedrooms - 1));

    const carPark = matchedFullDetail?.carparkMin !== undefined 
      ? matchedFullDetail.carparkMin 
      : (indexMap.carPark >= 0 
          ? coerceNumber(getVal(indexMap.carPark), mockRef?.carPark || (bedrooms > 2 ? 2 : 1))
          : (mockRef?.carPark || (bedrooms > 2 ? 2 : 1)));

    const totalUnits = matchedFullDetail?.totalUnits !== undefined 
      ? matchedFullDetail.totalUnits 
      : (indexMap.totalUnits >= 0 
          ? coerceNumber(getVal(indexMap.totalUnits), mockRef?.totalUnits || 450)
          : (mockRef?.totalUnits || 450));

    const totalFloors = matchedFullDetail?.noOfFloors !== undefined 
      ? matchedFullDetail.noOfFloors 
      : (indexMap.totalFloors >= 0 
          ? coerceNumber(getVal(indexMap.totalFloors), mockRef?.totalFloors || 35)
          : (mockRef?.totalFloors || 35));

    let maintenanceFee = mockRef?.maintenanceFee || 0.35;
    const rawFMaintenance = matchedFullDetail?.maintenanceFee;
    if (rawFMaintenance && rawFMaintenance.toLowerCase() !== 'n/a' && rawFMaintenance.trim() !== '') {
      maintenanceFee = coerceNumber(rawFMaintenance, mockRef?.maintenanceFee || 0.35);
    } else {
      maintenanceFee = indexMap.maintenanceFee >= 0 
        ? coerceNumber(getVal(indexMap.maintenanceFee), mockRef?.maintenanceFee || 0.35)
        : (mockRef?.maintenanceFee || 0.35);
    }

    const rentalYield = indexMap.rentalYield >= 0 
      ? coerceNumber(getVal(indexMap.rentalYield), mockRef?.rentalYield || 5.2)
      : (mockRef?.rentalYield || 5.2);

    const investmentScore = indexMap.investmentScore >= 0 
      ? coerceNumber(getVal(indexMap.investmentScore), mockRef?.investmentScore || 8.5)
      : (mockRef?.investmentScore || 8.5);

    const ownStayScore = indexMap.ownStayScore >= 0 
      ? coerceNumber(getVal(indexMap.ownStayScore), mockRef?.ownStayScore || 8.5)
      : (mockRef?.ownStayScore || 8.5);

    // Extract State
    const locText = ((matchedFullDetail?.address || getVal(indexMap.location)) + ' ' + (matchedFullDetail?.area || getVal(indexMap.area))).toLowerCase();
    let state: MalaysianState = 'Kuala Lumpur';
    if (locText.includes('selangor')) {
      state = 'Selangor';
    } else if (locText.includes('johor') || locText.includes('jb')) {
      state = 'Johor';
    } else if (locText.includes('penang') || locText.includes('island')) {
      state = 'Penang';
    } else if (mockRef?.state) {
      state = mockRef.state;
    } else {
      // Default guess based on areas
      if (locText.includes('puchong') || locText.includes('damansara') || locText.includes('petaling jaya') || locText.includes('subang') || locText.includes('shah alam') || locText.includes('cyberjaya') || locText.includes('putrajaya')) {
        state = 'Selangor';
      } else if (locText.includes('skudai') || locText.includes('nusa') || locText.includes('ciq') || locText.includes('causeway')) {
        state = 'Johor';
      } else if (locText.includes('bayan') || locText.includes('george')) {
        state = 'Penang';
      }
    }

    const area = matchedFullDetail?.area || getVal(indexMap.area) || (matchedFullDetail?.address || getVal(indexMap.location)).split(',')[0].trim() || mockRef?.area || 'Kuala Lumpur';

    // Property Type
    let rawType = getVal(indexMap.propertyType, mockRef?.propertyType || 'Condo');
    let propertyType: PropertyType = 'Condo';
    const lowerType = rawType.toLowerCase();
    if (lowerType.includes('serviced')) {
      propertyType = 'Serviced Apartment';
    } else if (lowerType.includes('condo')) {
      propertyType = 'Condo';
    } else if (lowerType.includes('landed') || lowerType.includes('terrace') || lowerType.includes('semi-d') || lowerType.includes('bungalow') || lowerType.includes('villa')) {
      propertyType = 'Landed';
    } else if (lowerType.includes('penthouse')) {
      propertyType = 'Penthouse';
    } else if (mockRef?.propertyType) {
      propertyType = mockRef.propertyType;
    }

    // Tenure
    let rawTenure = getVal(indexMap.tenure, mockRef?.tenure || 'Freehold');
    const tenure = (rawTenure.toLowerCase().includes('lease') ? 'Leasehold' : 'Freehold') as 'Freehold' | 'Leasehold';

    // Furnishing Coercion matching Types
    const rawFurnishing = getVal(indexMap.furnishing, mockRef?.furnishing || 'Partly Furnished');
    let furnishing: 'Partly Furnished' | 'Unfurnished' | 'Fully Furnished' = 'Partly Furnished';
    if (rawFurnishing.toLowerCase().includes('unf')) {
      furnishing = 'Unfurnished';
    } else if (rawFurnishing.toLowerCase().includes('fully') || rawFurnishing.toLowerCase().includes('full')) {
      furnishing = 'Fully Furnished';
    }

    // Booleans
    const airbnbFriendly = indexMap.airbnbFriendly >= 0 
      ? coerceBoolean(getVal(indexMap.airbnbFriendly)) 
      : (propertyType === 'Serviced Apartment');
    const featured = indexMap.featured >= 0 
      ? coerceBoolean(getVal(indexMap.featured)) 
      : (mockRef?.featured || false);

    // Geolocation from Locations Sheet lookup with clean alphanumeric spelling fallback matching
    let lat = coerceNumber(getVal(indexMap.lat), -999);
    let lng = coerceNumber(getVal(indexMap.lng), -999);
    
    if (lat === -999 || lng === -999 || lat === 0 || lng === 0) {
      const cleanProjName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
      let foundLoc = locationsMap.get(rawName.toLowerCase());
      if (!foundLoc) {
        for (const [k, coords] of locationsMap.entries()) {
          const cleanK = k.replace(/[^a-z0-9]/g, '');
          if (cleanProjName.includes(cleanK) || cleanK.includes(cleanProjName)) {
            foundLoc = coords;
            break;
          }
        }
      }
      
      if (foundLoc) {
        lat = foundLoc.lat;
        lng = foundLoc.lng;
      } else {
        lat = mockRef?.lat || 3.1478;
        lng = mockRef?.lng || 101.7132;
      }
    }

    // Formatted Highlights Lists
    const keyHighlights = indexMap.keyHighlights >= 0 
      ? coerceArray(getVal(indexMap.keyHighlights)) 
      : (mockRef?.keyHighlights || []);

    const nearbyAmenities = indexMap.nearbyAmenities >= 0 
      ? coerceArray(getVal(indexMap.nearbyAmenities)) 
      : (mockRef?.nearbyAmenities || []);

    // Text Description fallbacks
    const description = getVal(indexMap.description, mockRef?.description || `${rawName} represents an exclusive high-end premium development in ${area}, configured with state-of-the-art architecture and elite community amenities.`);

    // Image mappings
    let image = normalizeDriveUrl(getVal(indexMap.image, mockRef?.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'));

    // Gallery fallbacks
    let galleryArr = coerceArray(getVal(indexMap.gallery)).map(normalizeDriveUrl);
    if (galleryArr.length === 0) {
      galleryArr = (mockRef?.gallery || [image]).map(normalizeDriveUrl);
    }

    let locationImage = mockRef?.locationImage ? normalizeDriveUrl(mockRef.locationImage) : undefined;
    let layoutPlans: any[] = mockRef?.layoutPlans || [];
    let allProjectFiles: { name: string; url: string }[] = [];

    // Apply Google Drive folder matching dynamically
    if (driveImagesMap) {
      const matchKey = id; // Project ID is already slugified lowercase
      
      // Exclude special entries like '__flat_files__' from being selected as standard folder profiles
      const possibleProfiles = { ...driveImagesMap };
      delete possibleProfiles['__flat_files__'];

      let matchedDrive = possibleProfiles[matchKey];
      if (!matchedDrive) {
        // Find candidate matches with priority: prioritize earlier substring matches (e.g. 'axis' matching 'axis-causewayz-square')
        const mk = matchKey.toLowerCase();
        const candidates = Object.entries(possibleProfiles).filter(([key]) => {
          const k = key.toLowerCase();
          
          // Alphanumeric clean-matching (handles dashes, single quotes, spaces mismatch like d-tessera vs dtessera)
          const mkClean = mk.replace(/[^a-z0-9]/g, '');
          const kClean = k.replace(/[^a-z0-9]/g, '');
          if (mkClean.includes(kClean) || kClean.includes(mkClean)) return true;

          if (mk.includes(k) || k.includes(mk)) return true;
          if (mk.includes('causeway') && k.includes('causeway')) return true;
          if (mk.includes('zenia') && k.includes('zenia')) return true;
          if (mk.includes('tessera') && k.includes('tessera')) return true;
          if (mk.includes('atera') && k.includes('atera')) return true;
          return false;
        });

        if (candidates.length > 0) {
          candidates.sort((a, b) => {
            const keyA = a[0].toLowerCase();
            const keyB = b[0].toLowerCase();
            const idxA = mk.indexOf(keyA);
            const idxB = mk.indexOf(keyB);
            if (idxA !== idxB && idxA >= 0 && idxB >= 0) {
              return idxA - idxB;
            }
            return keyB.length - keyA.length;
          });
          matchedDrive = candidates[0][1];
        }
      }

      // Compiles all files belonging to this project from its subfolder and flat files
      if (matchedDrive && matchedDrive.files) {
        allProjectFiles = [...matchedDrive.files];
      }

      // Requirement Overrides:
      // Merge Causewayz Square files into Brixton and Dover for their facilities/gallery
      const lowerId = id.toLowerCase();
      if (lowerId.includes('brixton') || lowerId.includes('dover')) {
        const causewayProfile = driveImagesMap['causewayz-square'] || driveImagesMap['causeways-square-towers'] || driveImagesMap['johor-causeway'];
        if (causewayProfile && causewayProfile.files) {
          causewayProfile.files.forEach(f => {
            if (!allProjectFiles.some(ap => ap.url === f.url)) {
              allProjectFiles.push({ name: f.name, url: f.url });
            }
          });
        }
      }

      // Check flat files directly in the Parent/Root Folder
      const flatFiles = driveImagesMap['__flat_files__']?.flatFiles || [];
      if (flatFiles.length > 0) {
        const projSlug = id.toLowerCase();
        const projNameClean = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Filter files that belong to this project
        const projectFiles = flatFiles.filter((f: any) => {
          const lowerFileName = f.name.toLowerCase();
          return lowerFileName.includes(projSlug) || lowerFileName.includes(projNameClean);
        });

        projectFiles.forEach((f: any) => {
          if (!allProjectFiles.some(ap => ap.url === f.url)) {
            allProjectFiles.push({ name: f.name, url: f.url });
          }
        });
      }

      // 2. "location map all use axis"
      const mapProjectSlugs = ['axis', 'brixton', 'dover', 'causeways-square-towers', 'johor-causeway'];
      const useAxisMap = mapProjectSlugs.some(slug => lowerId.includes(slug) || slug.includes(lowerId));

      if (allProjectFiles.length > 0) {
        // A. FACADE IMAGE FOR LANDING PAGE OVERVIEW AND PROPERTY CARD
        // Search files containing 'facade', 'façade', 'exterior', 'external', 'overview', 'cover', 'front'
        // Prioritize facade files containing the project slug to make sure Axis/Brixton/Dover get their specific ones.
        const projSlug = id.toLowerCase();
        let facadeFile = allProjectFiles.find(f => {
          const lowerName = f.name.toLowerCase();
          const isFacade = lowerName.includes('facade') || lowerName.includes('façade') || lowerName.includes('exterior') || lowerName.includes('external') || lowerName.includes('overview') || lowerName.includes('cover') || lowerName.includes('front');
          return isFacade && lowerName.includes(projSlug);
        });

        if (!facadeFile) {
          facadeFile = allProjectFiles.find(f => {
            const lowerName = f.name.toLowerCase();
            return lowerName.includes('facade') || lowerName.includes('façade') || lowerName.includes('exterior') || lowerName.includes('external') || lowerName.includes('overview') || lowerName.includes('cover') || lowerName.includes('front');
          });
        }

        if (facadeFile) {
          image = normalizeDriveUrl(facadeFile.url);
        } else {
          // Fallback to first non-map, non-logo, non-layout image
          const fallbackMain = allProjectFiles.find(f => {
            const lowerName = f.name.toLowerCase();
            return !lowerName.includes('map') && !lowerName.includes('location') && !lowerName.includes('logo') && !lowerName.includes('pdf') && !lowerName.includes('layout') && !lowerName.includes('plan') && !lowerName.includes('type') && !lowerName.includes('floor');
          });
          if (fallbackMain) {
            image = normalizeDriveUrl(fallbackMain.url);
          } else if (allProjectFiles.length > 0) {
            image = normalizeDriveUrl(allProjectFiles[0].url);
          }
        }

        // B. LAYOUT SECTION IMAGE: USE IMAGE NAME TYPE X
        // Collect files where name has 'type', 'layout', 'plan', 'floor' (excluding map, location, logo, pdf)
        const layoutFiles = allProjectFiles.filter(f => {
          const lowerName = f.name.toLowerCase();
          const isLayout = lowerName.includes('type') || lowerName.includes('layout') || lowerName.includes('plan') || lowerName.includes('floor');
          const isMap = lowerName.includes('map') || lowerName.includes('location') || lowerName.includes('amenit');
          const isMisc = lowerName.includes('logo') || lowerName.includes('pdf') || lowerName.includes('brochure');
          return isLayout && !isMap && !isMisc;
        });

        // Sort layout plans alphabetically/numerically
        const sortedLayoutFiles = [...layoutFiles].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        
        if (sortedLayoutFiles.length > 0) {
          layoutPlans = sortedLayoutFiles.map(lf => {
            const cleanName = lf.name.replace(/\.[^/.]+$/, '').trim(); // strip extension
            return {
              name: cleanName,
              imageUrl: normalizeDriveUrl(lf.url),
              description: `Precision physical workspace layout for ${cleanName}. Showcases standard flow efficiency, high ceilings, and floor-to-ceiling visual glass.`
            };
          });
        }

        // C. VISUAL GALLERY: REMOVE LOGO, PDF, AND LAYOUT IMAGES
        const galleryFiles = allProjectFiles.filter(f => {
          const lowerName = f.name.toLowerCase();
          const hasLogo = lowerName.includes('logo');
          const hasPdf = lowerName.includes('pdf');
          const hasLayout = lowerName.includes('layout') || lowerName.includes('plan') || lowerName.includes('type') || lowerName.includes('floor');
          const hasMap = lowerName.includes('map') || lowerName.includes('location');
          return !hasLogo && !hasPdf && !hasLayout && !hasMap;
        });

        if (galleryFiles.length > 0) {
          galleryArr = galleryFiles.map(f => normalizeDriveUrl(f.url));
        } else {
          // Filter out of old galleryArr
          galleryArr = galleryArr.filter(url => {
            const lowerUrl = url.toLowerCase();
            return !lowerUrl.includes('logo') && !lowerUrl.includes('pdf') && !lowerUrl.includes('layout') && !lowerUrl.includes('plan') && !lowerUrl.includes('type') && !lowerUrl.includes('floor');
          });
        }

        // D. LOCATION IMAGE
        const locFile = allProjectFiles.find(f => {
          const lowerName = f.name.toLowerCase();
          return lowerName.includes('location') || lowerName.includes('map') || lowerName.includes('amenit');
        });
        if (locFile) {
          locationImage = normalizeDriveUrl(locFile.url);
        }
      }

      // 2. "location map all use axis"
      if (useAxisMap) {
        const axisProfile = driveImagesMap['axis'];
        if (axisProfile && axisProfile.locationImage) {
          locationImage = normalizeDriveUrl(axisProfile.locationImage);
        }
      }
    }

    const project: Project = {
      id,
      name: rawName,
      developer: (matchedFullDetail?.developer && matchedFullDetail.developer.toLowerCase() !== 'n/a' && matchedFullDetail.developer.trim() !== '') ? matchedFullDetail.developer : getVal(indexMap.developer, mockRef?.developer || 'Developer Portfolio'),
      state,
      area,
      priceMin,
      priceMax,
      completionYear,
      propertyType,
      tenure,
      furnishing,
      builtUpMin,
      builtUpMax,
      bedrooms,
      bathrooms,
      carPark,
      totalUnits,
      totalFloors,
      maintenanceFee,
      airbnbFriendly,
      investmentScore,
      ownStayScore,
      rentalYield,
      keyHighlights,
      nearbyAmenities,
      description,
      image,
      gallery: galleryArr,
      lat,
      lng,
      featured,
      vrTourLink: mockRef?.vrTourLink || '',
      droneViewLink: mockRef?.droneViewLink || '',
      locationImage,
      layoutPlans,
      allDriveFiles: driveImagesMap ? allProjectFiles : undefined,
      // Additional enriched details from Full Details tab
      location: matchedFullDetail?.address || getVal(indexMap.location, mockRef?.location || 'Kuala Lumpur'),
      landTitle: matchedFullDetail?.landTitle,
      noOfBlocks: matchedFullDetail?.noOfBlocks,
      pricePsf: matchedFullDetail?.pricePsf,
      carparkMin: matchedFullDetail?.carparkMin,
      carparkMax: matchedFullDetail?.carparkMax,
      estCompletionDate: matchedFullDetail?.estCompletionDate,
      launchDate: matchedFullDetail?.launchDate,
      readyToMove: matchedFullDetail?.readyToMove,
      underConstruction: matchedFullDetail?.underConstruction,
      newLaunch: matchedFullDetail?.newLaunch,
      dataUpdated: matchedFullDetail?.dataUpdated,
      notes: matchedFullDetail?.notes
    };

    syncedProjects.push(project);
  }

  return syncedProjects;
}
