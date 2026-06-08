/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Project, CurrencyCode } from '../types';
import { MapPin, Search, Navigation2, ExternalLink, X, RefreshCw, ZoomIn, ZoomOut, ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
import { TRANSLATIONS } from '../utils/translations';
import { CURRENCIES } from '../constants/mockData';
import ProjectCard from './ProjectCard';

interface InteractiveMapProps {
  projects: Project[];
  currency: CurrencyCode;
  lang: 'en' | 'zh';
  onViewProject: (project: Project) => void;
  setTab: (tab: string) => void;
  favorites: string[];
  comparedProjects: Project[];
  onToggleFavorite: (pId: string) => void;
  onToggleCompare: (proj: Project) => void;
}

// Beautiful open-access map layers that render perfectly on Leaflet with ZERO tokens required
const MAP_THEMES = [
  {
    id: 'google-standard',
    name: 'Google Map Style',
    nameZh: '谷歌色彩街区',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  {
    id: 'carto-voyager',
    name: 'Classic Full Street',
    nameZh: '经典全景街区',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors © CARTO'
  },
  {
    id: 'carto-light',
    name: 'Warm Minimalist Light',
    nameZh: '高雅极简浅白',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors © CARTO'
  },
  {
    id: 'carto-dark',
    name: 'Branded Luxury Dark',
    nameZh: '奢华极黑风格',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors © CARTO'
  }
];

export default function InteractiveMap({
  projects,
  currency,
  lang,
  onViewProject,
  setTab,
  favorites,
  comparedProjects,
  onToggleFavorite,
  onToggleCompare
}: InteractiveMapProps) {
  const t = TRANSLATIONS[lang];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // State managers
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);

  // Lock body scroll when in full screen map mode
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isFullscreen]);

  // Support Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);
  
  // Custom Map styling (defaulting to Classic Full Street with standard elegant colors)
  const [mapTheme, setMapTheme] = useState<string>('carto-voyager');

  // Default coordinate center (Kuala Lumpur City Center / Bukit Bintang)
  const defaultCenter: [number, number] = [3.1478, 101.7132]; // [lat, lng] format for Leaflet
  const defaultZoom = 13;

  // Filter projects with coordinates
  const projectsWithCoords = React.useMemo(() => {
    return projects.filter(p => p.lat !== undefined && p.lng !== undefined);
  }, [projects]);

  // Compute areas with listed projects
  const uniqueAreas = React.useMemo(() => {
    const areas = new Set<string>();
    projectsWithCoords.forEach(p => {
      if (p.area) areas.add(p.area);
    });
    return Array.from(areas).sort();
  }, [projectsWithCoords]);

  // Filter project list based on search and selected area
  const filteredMapProjects = React.useMemo(() => {
    return projectsWithCoords.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchText.toLowerCase()) || 
                            p.developer.toLowerCase().includes(searchText.toLowerCase());
      const matchesArea = selectedArea === 'All' || p.area === selectedArea;
      return matchesSearch && matchesArea;
    });
  }, [projectsWithCoords, searchText, selectedArea]);

  // Convert and format price options
  const formatProjectPrice = (price: number) => {
    const config = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
    const converted = price * config.rate;
    if (converted >= 1000000) {
      return `${config.symbol}${(converted / 1000000).toFixed(2)}M`;
    }
    return `${config.symbol}${Math.round(converted / 1000).toLocaleString()}K`;
  };

  // Securely monitor Leaflet preloaded readiness from index.html
  useEffect(() => {
    const win = window as any;
    if (win.L) {
      setIsLoaded(true);
      return;
    }

    // Safety fallback interval in case of slower connection times
    const interval = setInterval(() => {
      if (win.L) {
        setIsLoaded(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Initialize Map canvas container
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;
    const win = window as any;
    if (!win.L) return;

    // Remove any stale leaflet containers
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    try {
      // 1. Setup the Map container
      const mapInstance = win.L.map(mapContainerRef.current, {
        zoomControl: false, // We use custom styled controls to blend with our UI
        attributionControl: false
      }).setView(defaultCenter, defaultZoom);

      // 2. Load Active Premium tile layer source
      const activeTheme = MAP_THEMES.find(t => t.id === mapTheme) || MAP_THEMES[0];
      win.L.tileLayer(activeTheme.url, {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: activeTheme.attribution
      }).addTo(mapInstance);

      mapRef.current = mapInstance;

      // Render pins and fix container sizes
      renderPropertiesOnMap();

      // Trigger map layout updates after mount to prevent clipping
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 150);

    } catch (err: any) {
      console.error('Leaflet Init Error: ', err);
      setLoadError('Could not render map elements.');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isLoaded, mapTheme]);

  // Dynamic high-precision ResizeObserver to eliminate grey rectangles on Leaflet container updates
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !mapRef.current) return;
    const win = window as any;
    if (!win.L) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    // Initial warm trigger & debounced layout updates to capture CSS ready states
    mapRef.current.invalidateSize();
    const interval = setInterval(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 500);

    return () => {
      resizeObserver.disconnect();
      clearInterval(interval);
    };
  }, [isLoaded, mapTheme]);

  // Warm trigger map resizing calculations on focus state changes too
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 200);
    }
  }, [selectedProject, selectedArea, isFullscreen]);

  // Update map coordinates state when filters or currency converts
  useEffect(() => {
    if (mapRef.current) {
      renderPropertiesOnMap();
    }
  }, [filteredMapProjects, currency]);

  // Render customizable fully interactive pins
  const renderPropertiesOnMap = () => {
    const win = window as any;
    if (!win.L || !mapRef.current) return;

    // Wipe previous landmarks
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filteredMapProjects.forEach((proj) => {
      if (proj.lng === undefined || proj.lat === undefined) return;

      const isSelected = selectedProject?.id === proj.id;

      // Bespoke premium Drop Pin Markup with map-pulse and rich name tags
      const customHtml = `
        <div class="relative flex flex-col items-center group pointer-events-auto transition-all ${
          isSelected ? 'z-50 scale-125' : 'z-10'
        }">
          <!-- Pulse glow ring under the pinpoint shape -->
          ${isSelected ? '<span class="absolute top-[2px] w-10 h-10 rounded-full bg-[#C5A059]/40 animate-ping"></span>' : ''}
          
          <!-- Elegant map pinpoint teardrop/circular marker container -->
          <div class="flex items-center justify-center w-9 h-9 rounded-full shadow-lg border-2 transition-all ${
            isSelected 
              ? 'bg-[#C5A059] border-white text-white' 
              : 'bg-white border-[#C5A059] text-[#C5A059] hover:bg-slate-50 hover:scale-110 dark:bg-slate-900'
          }">
            <!-- Luxury Building / Pin landmark icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 3.547 6.047.25 10.75.25c4.703 0 8.5 3.297 8.5 8 0 3.924-2.438 7.11-4.766 9.27-2.073 1.928-3.79 2.87-4.244 3.17a1.52 1.52 0 01-1.6.02h.005zm0-12.66a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
            </svg>
          </div>
          
          <!-- Drop Pin tip arrow alignment -->
          <div class="w-2.5 h-2.5 rotate-45 -mt-1.5 border-r-2 border-b-2 shadow-xs transition-colors ${
            isSelected 
              ? 'bg-[#C5A059] border-white' 
              : 'bg-white border-[#C5A059] dark:bg-slate-900'
          }"></div>
          
          <!-- Tooltip on hover specifying exact building name and formatted starting price -->
          <div class="absolute bottom-11 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/95 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl pointer-events-none whitespace-nowrap shadow-2xl z-50 transition-all border border-slate-800">
            <p class="font-black text-center text-[#C5A059]">${proj.name}</p>
            <p class="text-[9.5px] text-slate-300 text-center mt-0.5 font-mono">From ${formatProjectPrice(proj.priceMin)} • ${proj.area}</p>
          </div>
        </div>
      `;

      // Set custom leaflet wrapper icon properties using exact center anchoring for classic drop pin tips
      const customIcon = win.L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-marker-wrapper',
        iconSize: [36, 48],
        iconAnchor: [18, 44]
      });

      // Construct and position the final map pin
      const marker = win.L.marker([proj.lat, proj.lng], { icon: customIcon })
        .addTo(mapRef.current)
        .on('click', () => {
          focusOnProject(proj);
        });

      markersRef.current.push(marker);
    });

    // Auto fit visual boundaries if multi assets exist
    if (filteredMapProjects.length > 1 && mapRef.current) {
      const latLngs = filteredMapProjects.map(p => [p.lat!, p.lng!]);
      mapRef.current.fitBounds(latLngs, {
        padding: [40, 40],
        maxZoom: 15
      });
    }
  };

  // Center focus zoom coordinates
  const focusOnProject = (proj: Project) => {
    setSelectedProject(proj);
    if (mapRef.current && proj.lng !== undefined && proj.lat !== undefined) {
      mapRef.current.flyTo([proj.lat, proj.lng], 15, {
        animate: true,
        duration: 1
      });
    }
    // Scroll corresponding list element into view automatically with smooth animation alignment
    setTimeout(() => {
      const element = document.getElementById(`sidebar-project-card-${proj.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Zoom factor slider
  const handleZoom = (type: 'in' | 'out') => {
    if (!mapRef.current) return;
    if (type === 'in') {
      mapRef.current.zoomIn();
    } else {
      mapRef.current.zoomOut();
    }
  };

  return (
    <div 
      className={`flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-slate-900 animate-fade-in ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none border-none shadow-none' 
          : 'h-[calc(100vh-6rem)] rounded-3xl border border-slate-200/80 shadow-xl'
      }`} 
      id="map-page-wrapper"
    >
      
      {/* LEFT DRAWER PANEL: SEARCH, LISTING MATRIX & DETAIL BANNER */}
      <div className="w-full lg:w-[410px] flex flex-col border-r border-slate-100 dark:border-slate-850 shrink-0 h-1/2 lg:h-full bg-slate-50/50 dark:bg-slate-950/20 transition-all duration-300" id="map-sidebar-control">
        
        {/* Search header & selection */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-brand-gold" />
                {lang === 'en' ? 'Interactive Smart Map' : '互动房源全景定位'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">
                {lang === 'en' ? `Showing ${filteredMapProjects.length} properties with coordinates` : `已完成定位 ${filteredMapProjects.length} 处特选豪宅地标`}
              </p>
            </div>
          </div>

          {/* Theme selections */}
          <div className="flex items-center gap-1.5 mb-3 bg-slate-150/60 dark:bg-slate-950 p-1 rounded-xl">
            {MAP_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setMapTheme(theme.id)}
                className={`flex-1 rounded-lg py-1 px-1.5 text-[10px] font-extrabold text-center tracking-tight transition-all uppercase ${
                  mapTheme === theme.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {lang === 'en' ? theme.name : theme.nameZh}
              </button>
            ))}
          </div>

          {/* Quick Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Quick filter on map...' : '在地图房源中快速检索...'}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-201 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-hidden text-slate-700 dark:text-slate-350"
            />
          </div>

          {/* Area selections tab slider */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pt-2.5">
            <button
              onClick={() => setSelectedArea('All')}
              className={`rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase whitespace-nowrap transition-all border ${
                selectedArea === 'All'
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
              }`}
            >
              {lang === 'en' ? 'All Areas' : '全部地段'}
            </button>
            {uniqueAreas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase whitespace-nowrap transition-all border ${
                  selectedArea === area
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list of properties on current viewport list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <div className="space-y-3.5">
            <span className="block text-[10.5px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2">
              {lang === 'en' ? 'Select property to map-focus' : '点击房源快速地图对焦'}
            </span>
            {filteredMapProjects.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
                <p className="text-xs font-extrabold text-slate-400 uppercase">
                  {lang === 'en' ? 'No matching layout found' : '未检索到符合条件的对焦项目'}
                </p>
              </div>
            ) : (
              filteredMapProjects.map((proj) => {
                const isSelected = selectedProject?.id === proj.id;
                
                return isSelected ? (
                  <div
                    key={proj.id}
                    id={`sidebar-project-card-${proj.id}`}
                    className="relative bg-white dark:bg-slate-900 border-2 border-[#C5A059] rounded-2xl overflow-hidden shadow-xl transition-all duration-300"
                  >
                    {/* Close / contract button located perfectly beside the heart circle in top-right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(null);
                      }}
                      className="absolute top-3.5 right-[54px] z-50 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md backdrop-blur-xs hover:scale-110 active:scale-95 dark:bg-slate-900/95 dark:text-slate-350 dark:hover:text-white border border-slate-150 dark:border-slate-800"
                      title="Minimize Card"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>

                    <ProjectCard
                      project={proj}
                      currency={currency}
                      lang={lang}
                      isFavorite={favorites.includes(proj.id)}
                      isCompared={comparedProjects.some(cp => cp.id === proj.id)}
                      onToggleFavorite={() => onToggleFavorite(proj.id)}
                      onToggleCompare={() => onToggleCompare(proj)}
                      onViewDetails={() => onViewProject(proj)}
                    />
                  </div>
                ) : (
                  <div
                    key={proj.id}
                    id={`sidebar-project-card-${proj.id}`}
                    onClick={() => focusOnProject(proj)}
                    className="transition-all duration-300 rounded-2xl border cursor-pointer border-slate-100 hover:border-[#C5A059]/30 hover:bg-slate-50/50 dark:border-slate-850 dark:hover:bg-slate-850/45 bg-white dark:bg-slate-900 shadow-2xs hover:-translate-y-0.5"
                  >
                    {/* SLEEK UNIFORM COMPACT CARD FOR INTUITIVE SIDEBAR NAVIGATION */}
                    <div className="flex items-center gap-3 p-3">
                      <img 
                        src={proj.image} 
                        alt={proj.name} 
                        className="w-14 h-14 rounded-xl object-cover shrink-0" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[8.5px] font-black tracking-widest text-[#C5A059] uppercase block truncate">{proj.developer}</span>
                        <h4 className="text-xs.1 font-bold text-slate-800 dark:text-white truncate leading-snug">{proj.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{proj.area}, {proj.state}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span className="text-xs font-black font-mono text-slate-850 dark:text-slate-200">{formatProjectPrice(proj.priceMin)}</span>
                        <span className="text-[9px] text-[#C5A059] font-black mt-1">★ {proj.investmentScore}/10</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: HIGH PERFORMANCE MAP CANVAS */}
      <div className="flex-1 relative h-1/2 lg:h-full bg-slate-100 dark:bg-slate-950" id="map-canvas-container">
        {/* FULLSCREEN VIEW TOGGLE BUTTON */}
        {isLoaded && !loadError && (
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-6 left-6 z-[1000] flex h-10 w-10 items-center justify-center rounded-2xl bg-white/95 backdrop-blur-md border border-slate-205 hover:bg-white text-slate-800 dark:bg-slate-900/95 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800 shadow-lg transition-transform active:scale-95 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            id="map-fullscreen-toggle-btn"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        )}

        {!isLoaded ? (
          /* EMBEDDED MAP LOADER SKELETON DISPLAY */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-slate-500 gap-3">
            <RefreshCw className="h-10 w-10 text-[#C5A059] animate-spin" />
            <p className="text-xs font-black tracking-widest uppercase text-slate-400">Loading Map Layers...</p>
            <p className="text-[10px] text-slate-400/80 max-w-xs">{lang === 'en' ? 'Fetching coordinates and injecting style layers.' : '正在校验位置点标记信息，精细化加载互动底图。'}</p>
          </div>
        ) : loadError ? (
          /* EXCEPTION HANDLING */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-slate-500 gap-3">
            <MapPin className="h-10 w-10 text-red-500 animate-pulse" />
            <p className="text-xs font-black tracking-widest uppercase text-red-500">Map Rendering Failed</p>
            <p className="text-[10px] text-slate-400 max-w-sm">{loadError}</p>
          </div>
        ) : (
          /* RENDER CANVAS container style */
          <div ref={mapContainerRef} className="w-full h-full z-0" id="leaflet-render-canvas" />
        )}

        {/* CUSTOM SPEED OVERLAY MAP ZOOM BUTTONS */}
        {isLoaded && !loadError && (
          <div className="absolute bottom-6 right-6 flex flex-col gap-1.5 z-[1000]">
            <button
              onClick={() => handleZoom('in')}
              className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-205 hover:bg-white text-slate-800 dark:bg-slate-900/95 dark:border-slate-800 dark:text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-205 hover:bg-white text-slate-800 dark:bg-slate-900/95 dark:border-slate-800 dark:text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
          </div>
        )}


      </div>
    </div>
  );
}
