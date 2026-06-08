/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Sparkles, Filter, ArrowUpRight, HelpCircle, Briefcase, Grid, 
  MapPin, Clock, ArrowRight, Star, Heart, CheckCircle, ChevronDown, Flame, Phone
} from 'lucide-react';

import { Project, Lead, MalaysianState, PropertyType, CurrencyCode } from './types';
import { TRANSLATIONS } from './utils/translations';
import { MOCK_PROJECTS, STATE_AREAS } from './constants/mockData';

// Sub components
import Header from './components/Header';
import ProjectCard, { formatPrice } from './components/ProjectCard';
import QuickQuestionnaire from './components/QuickQuestionnaire';
import CompareDrawer from './components/CompareDrawer';
import ProjectDetailModal from './components/ProjectDetailModal';
import CompareSection from './components/CompareSection';
import FAQSection from './components/FAQSection';
import BuyingGuide from './components/BuyingGuide';
import InteractiveMap from './components/InteractiveMap';

export default function App() {
  // Navigation Routing Tab State
  const [tab, setTab] = useState<string>('home'); // home, compare, guide, admin, favorites
  
  // Multilingual Configuration State
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const t = TRANSLATIONS[lang];

  // Currency Converter State
  const [currency, setCurrency] = useState<CurrencyCode>('MYR');

  // Master Lists loaded with Local Storage React persistence
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem('malaysianhomes-listings');
      if (stored) {
        const parsed = JSON.parse(stored) as Project[];
        // Verify we have exactly the new projects list by checking key IDs
        const requiredIds = [
          'pavilion-square', 'orion-residence', 'the-conlay', 'branniganz',
          'core-residence', 'golden-crown-residence', 'trx-residence', 'oxley-towers',
          'centrix-the-station', 'clouthaus-klcc', 'ascott-star', 'parkside-residence-bangsar',
          'bangsar-hill-park', 'khaya-tree-residence-bangsar'
        ];
        const hasAllNew = requiredIds.every(id => parsed.some(p => p.id === id));
        if (hasAllNew && parsed.length === requiredIds.length) {
          // Merge with static mock data to apply live corrections of project properties (tenure, developer, highlights, etc.)
          return parsed.map(p => {
            const mock = MOCK_PROJECTS.find(m => m.id === p.id);
            return mock ? { ...p, ...mock } : p;
          });
        }
      }
      return MOCK_PROJECTS;
    } catch {
      return MOCK_PROJECTS;
    }
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const stored = localStorage.getItem('malaysianhomes-crm-leads');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('malaysianhomes-favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Comparison Deck Queue
  const [comparedProjects, setComparedProjects] = useState<Project[]>([]);

  // Selected details modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Questionnaire trigger
  const [showQuestionnaire, setShowQuestionnaire] = useState<boolean>(false);

  // Dynamic filter state bounds (8+ filters total!)
  const [filterState, setFilterState] = useState<string>('All');
  const [filterArea, setFilterArea] = useState<string>('All');
  const [filterPriceRange, setFilterPriceRange] = useState<string>('All');
  const [filterPropType, setFilterPropType] = useState<string>('All'); // All, High-Rise, Landed
  const [filterTenure, setFilterTenure] = useState<string>('All'); // All, Freehold, Leasehold
  const [filterFurnishing, setFilterFurnishing] = useState<string>('All'); // All, Fully Furnished, Partly Furnished, Unfurnished
  const [filterBedrooms, setFilterBedrooms] = useState<string>('All'); // All, 1, 2, 3, 4+
  const [filterSizeRange, setFilterSizeRange] = useState<string>('All');
  const [filterCarPark, setFilterCarPark] = useState<string>('All');
  const [filterTotalUnits, setFilterTotalUnits] = useState<string>('All');
  const [filterDeveloper, setFilterDeveloper] = useState<string>('All');
  const [filterTotalFloors, setFilterTotalFloors] = useState<string>('All');
  const [searchText, setSearchText] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured'); // featured, price-asc, price-desc

  // Sync state back to local storage
  useEffect(() => {
    localStorage.setItem('malaysianhomes-listings', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('malaysianhomes-crm-leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('malaysianhomes-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Contextual Area choices mapping helper
  const areaOptions = useMemo(() => {
    if (filterState === 'All') return [];
    return STATE_AREAS[filterState] || [];
  }, [filterState]);

  // Dynamic list of developers extracted from projects
  const developerOptions = useMemo(() => {
    const devs = new Set<string>();
    projects.forEach((p) => {
      if (p.developer) devs.add(p.developer);
    });
    return Array.from(devs).sort();
  }, [projects]);

  // Handle reset area when state changes
  useEffect(() => {
    setFilterArea('All');
  }, [filterState]);

  // Master Filter matching function logic
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // 1. State Filter
      const stateMatch = filterState === 'All' || proj.state === filterState;

      // 2. Area Filter
      const areaMatch = filterArea === 'All' || proj.area === filterArea;

      // 3. Text/Search query match (matches Name, Developer, Area, or Highlights)
      const query = searchText.toLowerCase();
      const textMatch = !searchText || 
        proj.name.toLowerCase().includes(query) ||
        proj.developer.toLowerCase().includes(query) ||
        proj.area.toLowerCase().includes(query) ||
        proj.keyHighlights.some(hl => hl.toLowerCase().includes(query));

      // 4. Budget price bounds match
      let priceMatch = true;
      if (filterPriceRange === 'Below-RM500k') {
        priceMatch = proj.priceMin < 600000;
      } else if (filterPriceRange === 'RM500k-RM1m') {
        priceMatch = proj.priceMin >= 500000 && proj.priceMin <= 1100000;
      } else if (filterPriceRange === 'RM1m-RM2m') {
        priceMatch = proj.priceMin >= 1000050 && proj.priceMin <= 2050000;
      } else if (filterPriceRange === 'Above-RM2m') {
        priceMatch = proj.priceMax >= 1800000;
      }

      // 5. High-Rise vs Landed Property Badge Filter mapping
      let typeMatch = true;
      if (filterPropType === 'High-Rise') {
        typeMatch = proj.propertyType === 'Serviced Apartment' || proj.propertyType === 'Condo' || proj.propertyType === 'Penthouse';
      } else if (filterPropType === 'Landed') {
        typeMatch = proj.propertyType === 'Landed';
      }

      // 6. Tenure Filter
      const tenureMatch = filterTenure === 'All' || proj.tenure === filterTenure;

      // 7. Furnishing Filter
      const furnishingMatch = filterFurnishing === 'All' || proj.furnishing === filterFurnishing;

      // 8. Size Filter
      let sizeMatch = true;
      if (filterSizeRange === 'under-800') {
        sizeMatch = proj.builtUpMin < 800;
      } else if (filterSizeRange === '800-1200') {
        sizeMatch = (proj.builtUpMin >= 800 && proj.builtUpMin <= 1200) || (proj.builtUpMax >= 800 && proj.builtUpMax <= 1200);
      } else if (filterSizeRange === '1200-2000') {
        sizeMatch = (proj.builtUpMin >= 1200 && proj.builtUpMin <= 2000) || (proj.builtUpMax >= 1200 && proj.builtUpMax <= 2000);
      } else if (filterSizeRange === 'above-2000') {
        sizeMatch = proj.builtUpMax > 2000 || proj.builtUpMin > 2000;
      }

      // 9. Car Park Filter
      let carParkMatch = true;
      if (filterCarPark === '1') {
        carParkMatch = (proj.carPark || 1) === 1;
      } else if (filterCarPark === '2') {
        carParkMatch = (proj.carPark || 2) === 2;
      } else if (filterCarPark === '3+') {
        carParkMatch = (proj.carPark || 0) >= 3;
      }

      // 10. Total Units Filter
      let totalUnitsMatch = true;
      if (filterTotalUnits === 'low') {
        totalUnitsMatch = (proj.totalUnits || 0) < 300;
      } else if (filterTotalUnits === 'medium') {
        totalUnitsMatch = (proj.totalUnits || 0) >= 300 && (proj.totalUnits || 0) <= 600;
      } else if (filterTotalUnits === 'high') {
        totalUnitsMatch = (proj.totalUnits || 0) > 600;
      }

      // 11. Developer Filter
      const developerMatch = filterDeveloper === 'All' || proj.developer === filterDeveloper;

      // 12. Total Floors Filter
      let totalFloorsMatch = true;
      if (filterTotalFloors === 'low-rise') {
        totalFloorsMatch = (proj.totalFloors || 0) <= 15;
      } else if (filterTotalFloors === 'mid-rise') {
        totalFloorsMatch = (proj.totalFloors || 0) > 15 && (proj.totalFloors || 0) <= 40;
      } else if (filterTotalFloors === 'high-rise') {
        totalFloorsMatch = (proj.totalFloors || 0) > 40;
      }

      // 13. Bedrooms Filter
      let bedroomsMatch = true;
      if (filterBedrooms === '1') {
        bedroomsMatch = proj.bedrooms === 1;
      } else if (filterBedrooms === '2') {
        bedroomsMatch = proj.bedrooms === 2;
      } else if (filterBedrooms === '3') {
        bedroomsMatch = proj.bedrooms === 3;
      } else if (filterBedrooms === '4+') {
        bedroomsMatch = proj.bedrooms >= 4;
      }

      return stateMatch && areaMatch && textMatch && priceMatch && typeMatch && tenureMatch && furnishingMatch && bedroomsMatch && sizeMatch && carParkMatch && totalUnitsMatch && developerMatch && totalFloorsMatch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceMin - b.priceMin;
      if (sortBy === 'price-desc') return b.priceMin - a.priceMin;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); // Featured defaults first
    });
  }, [
    projects,
    filterState,
    filterArea,
    searchText,
    filterPriceRange,
    filterPropType,
    filterTenure,
    filterFurnishing,
    filterBedrooms,
    filterSizeRange,
    filterCarPark,
    filterTotalUnits,
    filterDeveloper,
    filterTotalFloors,
    sortBy
  ]);

  // First page featured projects (strictly limited to 3)
  const homeFeaturedProjects = useMemo(() => {
    return projects.filter((p) => p.featured).slice(0, 3);
  }, [projects]);

  // Saved Favorites calculated items list
  const favoritedProjectsList = useMemo(() => {
    return projects.filter((p) => favorites.includes(p.id));
  }, [projects, favorites]);

  // Trigger togglers
  const handleToggleFavorite = (pId: string) => {
    setFavorites((prev) => 
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  const handleToggleCompare = (proj: Project) => {
    setComparedProjects((prev) => {
      const exists = prev.some((p) => p.id === proj.id);
      if (exists) {
        return prev.filter((p) => p.id !== proj.id);
      } else {
        if (prev.length >= 3) {
          alert(t.compareLimitExceeded);
          return prev;
        }
        return [...prev, proj];
      }
    });
  };

  const handleRemoveFromCompare = (proj: Project) => {
    setComparedProjects((prev) => prev.filter((p) => p.id !== proj.id));
  };

  // Lead registration callbacks
  const handleLeadCaptured = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleUpdateLeadStatus = (leadId: string, status: any) => {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status } : l));
  };

  // Custom project CRUD operations synced directly with AdminPanel.tsx editing
  const handleAddProject = (newProj: Project) => {
    setProjects((prev) => [newProj, ...prev]);
  };

  const handleEditProject = (updatedProj: Project) => {
    setProjects((prev) => prev.map((p) => p.id === updatedProj.id ? updatedProj : p));
    if (selectedProject?.id === updatedProj.id) {
      setSelectedProject(updatedProj);
    }
  };

  const handleDeleteProject = (projId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projId));
    setComparedProjects((prev) => prev.filter((p) => p.id !== projId));
    setFavorites((prev) => prev.filter((id) => id !== projId));
    if (selectedProject?.id === projId) {
      setSelectedProject(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950 font-sans" id="malaysianhomes-landing-root">
      
      {/* 1. COMPREHENSIVE HEADER STICKY BAR */}
      <Header 
        currentTab={tab}
        setTab={setTab}
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        favoritesCount={favorites.length}
        openQuestionnaire={() => setShowQuestionnaire(true)}
      />

      {/* 2. DYNAMIC MAIN BODY VIEW (ROUTED BY TAB STATE) */}
      <main className="pb-24">
        
        {/* ================================= PAGE 1: HOMEPAGE VIEW ================================= */}
        {tab === 'home' && (
          <div>
            {/* HERO LUXURY WALLPAPER SECTION CAROUSEL BOX */}
            <div className="relative overflow-hidden bg-slate-900 py-16 sm:py-28 text-white text-center" id="homepage-hero-curtain">
              <div className="absolute inset-0 bg-cover bg-center brightness-[0.3]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1500&q=80')" }} />
              <div className="absolute inset-0 bg-linear-to-b from-slate-950/20 via-slate-950/70 to-slate-950" />

              <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
                
                {/* Branding gold accent snippet */}
                <div className="mx-auto mb-4 flex w-fit items-center space-x-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/40 px-4 py-1 text-xs font-bold text-brand-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{lang === 'en' ? 'Direct Developer Allocations' : '吉隆坡顶奢住宅首发'}</span>
                </div>

                <h1 className="font-display text-3xl sm:text-5.5xl font-black tracking-tight leading-tight uppercase">
                  {lang === 'en' ? 'Invest in Malaysia’s Premium Core Areas' : '大马优居 • 臻选核心优质地段'}
                </h1>
                <p className="mt-3.5 text-xs sm:text-base text-slate-300 max-w-2xl mx-auto font-medium">
                  {t.tagline}
                </p>

                {/* INTEGRATED MULTI-DROPDOWN SEARCH FILTER PANELS */}
                <div 
                  className="mx-auto mt-8 w-full max-w-3xl rounded-3xl bg-white/95 p-4 sm:p-5 text-slate-900 shadow-2xl dark:bg-slate-900/98 dark:text-white backdrop-blur-xs border border-white/20"
                  id="hero-integrated-search-box"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-left">
                    
                    {/* 1. STATE FILTER SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {t.stateLabel}
                      </label>
                      <select
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold focus:border-brand-gold focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{t.allStates}</option>
                        <option value="Kuala Lumpur">Kuala Lumpur</option>
                        <option value="Selangor">Selangor</option>
                        <option value="Johor">Johor</option>
                        <option value="Penang">Penang</option>
                      </select>
                    </div>

                    {/* 2. CONTEXTUAL AREA FILTER SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {t.areaLabel}
                      </label>
                      <select
                        disabled={filterState === 'All'}
                        value={filterArea}
                        onChange={(e) => setFilterArea(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{t.allAreas}</option>
                        {areaOptions.map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>

                    {/* 3. PRICE SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {t.budgetLabel}
                      </label>
                      <select
                        value={filterPriceRange}
                        onChange={(e) => setFilterPriceRange(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{lang === 'en' ? 'Any Budget Range' : '所有价格预算'}</option>
                        <option value="Below-RM500k">Under RM 600,000</option>
                        <option value="RM500k-RM1m">RM 500k - RM 1.1M</option>
                        <option value="RM1m-RM2m">RM 1.0M - RM 2.05M</option>
                        <option value="Above-RM2m">Above RM 1.8M</option>
                      </select>
                    </div>

                    {/* 4. CATEGORY SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        Category Type
                      </label>
                      <select
                        value={filterPropType}
                        onChange={(e) => setFilterPropType(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{lang === 'en' ? 'All Categories' : '所有物业类别'}</option>
                        <option value="High-Rise">High-Rise (高层公寓/公寓/大底)</option>
                        <option value="Landed">Landed (别墅/排屋/联排)</option>
                      </select>
                    </div>

                    {/* 5. TENURE SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {lang === 'en' ? 'Land Tenure' : '产权类别'}
                      </label>
                      <select
                        value={filterTenure}
                        onChange={(e) => setFilterTenure(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{lang === 'en' ? 'Any Land Tenure' : '所有产权类别'}</option>
                        <option value="Freehold">Freehold (永久产权)</option>
                        <option value="Leasehold">Leasehold (租赁产权)</option>
                      </select>
                    </div>

                    {/* 6. FURNISHING SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {lang === 'en' ? 'Furnishing' : '家私装潢'}
                      </label>
                      <select
                        value={filterFurnishing}
                        onChange={(e) => setFilterFurnishing(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{lang === 'en' ? 'Any Furnishing Status' : '所有装潢状态'}</option>
                        <option value="Fully Furnished">Fully Furnished (全家私精装)</option>
                        <option value="Partly Furnished">Partly Furnished (半家私精装)</option>
                        <option value="Unfurnished">Unfurnished (毛坯/无家私)</option>
                      </select>
                    </div>

                    {/* 7. ROOMS SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {lang === 'en' ? 'Rooms' : '房间卧室'}
                      </label>
                      <select
                        value={filterBedrooms}
                        onChange={(e) => setFilterBedrooms(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{lang === 'en' ? 'Any Rooms' : '不限户型'}</option>
                        <option value="1">1 Room (单身/一房)</option>
                        <option value="2">2 Rooms (两房户型)</option>
                        <option value="3">3 Rooms (三房奢邸)</option>
                        <option value="4+">4+ Rooms (豪奢大户)</option>
                      </select>
                    </div>

                    {/* 8. SIZE RANGE SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {lang === 'en' ? 'Size (Built-Up)' : '实用面积范围'}
                      </label>
                      <select
                        value={filterSizeRange}
                        onChange={(e) => setFilterSizeRange(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{lang === 'en' ? 'Any Size' : '不限实用面积'}</option>
                        <option value="under-800">Under 800 sqft (800呎以下)</option>
                        <option value="800-1200">800 - 1,200 sqft</option>
                        <option value="1200-2000">1,200 - 2,000 sqft</option>
                        <option value="above-2000">Above 2,000 sqft (2000呎以上)</option>
                      </select>
                    </div>

                    {/* 9. CAR PARK SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {lang === 'en' ? 'Car Park' : '车位配额'}
                      </label>
                      <select
                        value={filterCarPark}
                        onChange={(e) => setFilterCarPark(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{lang === 'en' ? 'Any Car Parks' : '不限车位'}</option>
                        <option value="1">1 Bay (单车位)</option>
                        <option value="2">2 Bays (双车位)</option>
                        <option value="3+">3+ Bays (多车位)</option>
                      </select>
                    </div>

                    {/* 10. TOTAL UNITS SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {lang === 'en' ? 'Total Units (Density)' : '总户数(居住密度)'}
                      </label>
                      <select
                        value={filterTotalUnits}
                        onChange={(e) => setFilterTotalUnits(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{lang === 'en' ? 'Any Density' : '不限社区密度'}</option>
                        <option value="low">Low Density (&lt;300 units)</option>
                        <option value="medium">Medium Density (300 - 600)</option>
                        <option value="high">High Density (&gt;600 units)</option>
                      </select>
                    </div>

                    {/* 11. DEVELOPER SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {lang === 'en' ? 'Developer' : '品牌开发商'}
                      </label>
                      <select
                        value={filterDeveloper}
                        onChange={(e) => setFilterDeveloper(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{lang === 'en' ? 'Any Developer' : '不限开发商'}</option>
                        {developerOptions.map((dev) => (
                          <option key={dev} value={dev}>{dev}</option>
                        ))}
                      </select>
                    </div>

                    {/* 12. TOTAL FLOORS SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {lang === 'en' ? 'Total Floor' : '大楼总楼层'}
                      </label>
                      <select
                        value={filterTotalFloors}
                        onChange={(e) => setFilterTotalFloors(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                      >
                        <option value="All">{lang === 'en' ? 'Any Floors' : '不限总楼层'}</option>
                        <option value="low-rise">Low Rise (&le;15 floors)</option>
                        <option value="mid-rise">Mid Rise (16-40 floors)</option>
                        <option value="high-rise">High Rise (&gt;40 floors)</option>
                      </select>
                    </div>

                  </div>

                  {/* BOTTOM SEARCH DEPUTY FILTER BLOCK */}
                  <div className="mt-4.5 pt-4 border-t border-slate-100 sm:flex sm:justify-between sm:items-center dark:border-slate-800/80 gap-4">
                    <div className="relative flex-1 max-w-lg mb-3 sm:mb-0">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Search className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex gap-2">
                      {/* Search trigger button */}
                      <button
                        onClick={() => {
                          // Jump to projects list tab immediately to see comprehensive grid outputs
                          setTab('home');
                          // Scroll down to project grid
                          document.getElementById('catalog-grid-explorer')?.scrollIntoView();
                        }}
                        className="flex items-center space-x-1.5 rounded-xl bg-slate-900 py-2.5 px-6 font-display text-xs font-extrabold text-white hover:bg-slate-800 cursor-pointer dark:bg-brand-gold dark:text-slate-950"
                      >
                        <Filter className="h-3.5 w-3.5" />
                        <span>Filter Results ({filteredProjects.length})</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* INTEGRATED INTELLIGENT AI MAPPING MATCH RECOMMENDATION TEASER */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 mb-16 text-left">
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
                <div className="absolute top-0 right-0 p-8 text-brand-gold/10 pointer-events-none">
                  <Sparkles className="h-48 w-48" />
                </div>
                <div className="relative z-10 max-w-xl">
                  <span className="rounded-full bg-brand-gold/15 border border-brand-gold/30 px-3.5 py-1 text-[10px] font-extrabold tracking-widest text-brand-gold uppercase">
                    AI Match Profiler
                  </span>
                  <h3 className="font-display text-xl sm:text-2.5xl font-black tracking-tight mt-2.5 leading-tight">
                    {lang === 'en' ? 'Get Smart Property Recommendations Instantly' : '极速匹配！为您智能遴选吉隆坡好房'}
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed font-semibold">
                    {lang === 'en' 
                      ? 'No more endless scrolling. Tell our smart engine your budget limit and interests to automatically generate matched layouts and direct developer price sheets.' 
                      : '拒绝无效看房，输入您心仪的地理圈及预算上限，让AI推荐大使为您极速网罗最吻合的大马特惠好房，附赠尊享看房PDF报告。'}
                  </p>
                  <button
                    onClick={() => setShowQuestionnaire(true)}
                    className="mt-6 flex items-center space-x-2 rounded-xl bg-brand-gold px-5.5 py-3 font-display text-xs font-extrabold text-white hover:bg-brand-gold-hover shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-white" />
                    <span>{t.startQuestionnaire}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FEATURED PROJECTS CATALOGUE CONTAINER SECTION */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left" id="catalog-grid-explorer">
              <div className="mb-8 border-b border-slate-200 pb-5 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {t.featuredTitle}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {t.featuredSub}
                  </p>
                </div>
              </div>

              {/* Grid Render of Strictly 3 Featured Projects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {homeFeaturedProjects.map((p) => (
                  <ProjectCard 
                    key={p.id}
                    project={p}
                    currency={currency}
                    lang={lang}
                    isFavorite={favorites.includes(p.id)}
                    isCompared={comparedProjects.some((cp) => cp.id === p.id)}
                    onToggleFavorite={() => handleToggleFavorite(p.id)}
                    onToggleCompare={() => handleToggleCompare(p)}
                    onViewDetails={() => setSelectedProject(p)}
                  />
                ))}
              </div>

              {/* SEE MORE RESIDENCES BUTTON */}
              <div className="mt-12 text-center">
                <button
                  onClick={() => {
                    setTab('residences');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center space-x-2 rounded-full bg-slate-900 px-8 py-4 font-display text-xs font-black text-white hover:bg-slate-800 transition-all hover:scale-[1.03] active:scale-95 shadow-lg group dark:bg-brand-gold dark:text-slate-950 dark:hover:bg-brand-gold-hover cursor-pointer"
                >
                  <span>{lang === 'en' ? 'SEE MORE RESIDENCES' : '查看更多房源地标'}</span>
                  <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            {/* BUYING PROCESS GUIDE TIMELINE */}
            <BuyingGuide lang={lang} />

            {/* WHY CHOOSE THIS PLATFORM GRID SEC */}
            <div className="bg-slate-900 text-white py-16 mt-8" id="why-choose-grid-block">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
                <div className="text-center mb-12">
                  <h2 className="font-display text-2.5xl font-black text-white tracking-tight uppercase">
                    {t.whyChooseTitle}
                  </h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2.5">
                    {t.whyChooseSub}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <span className="font-display font-black text-2xl text-brand-gold">100%</span>
                    <h4 className="text-sm font-bold mt-2 text-white">Verified Projects</h4>
                    <p className="text-[11px] font-semibold text-slate-400 leading-normal mt-1.5">Every spec, layout, and maintenance cost is directly cross-referenced and validated with developers.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <span className="font-display font-black text-2xl text-brand-gold">0%</span>
                    <h4 className="text-sm font-bold mt-2 text-white">Buyer Commissions</h4>
                    <p className="text-[11px] font-semibold text-slate-400 leading-normal mt-1.5">Our advisory channels are absolutely free. Connect directly to developers secure rates.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <span className="font-display font-black text-2xl text-brand-gold">10Min</span>
                    <h4 className="text-sm font-bold mt-2 text-white">Fast Response</h4>
                    <p className="text-[11px] font-semibold text-slate-400 leading-normal mt-1.5">Experienced bi-lingual concierges will immediately coordinate scheduling arrangements.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <span className="font-display font-black text-2xl text-brand-gold">6.5%</span>
                    <h4 className="text-sm font-bold mt-2 text-white">Avg Rental Yield</h4>
                    <p className="text-[11px] font-semibold text-slate-400 leading-normal mt-1.5">Maximize returns by viewing elite properties optimized for tourist Airbnb letouts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ HANDLERS */}
            <FAQSection lang={lang} />

            {/* TESTIMONIALS SECTION */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-left" id="testimonials-reviews-block">
              <div className="text-center mb-10">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059]">Client Success Stories</span>
                <h2 className="font-display text-2.5xl font-black mt-2 tracking-tight text-slate-900 dark:text-white">
                  Trusted by Over 500+ Buyers & Investors
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Dr. Li Wei (Singapore Investor)', text: 'I purchased a 2-bedroom suite in TRX Residences. The side-by-side comparison matrix and the integrated mortgage rate estimators made decision scaling incredibly straightforward. Best property tech portal I have seen in Southeast Asia!', rating: 5 },
                  { name: 'Michael & Sarah (Auckland Residents)', text: 'Excellent zero-commission services! We booked a virtual walkthrough showroom visit from Australia and received full PDF brochures and e-drawings within minutes. Fully recommended for expatriates.', rating: 5 },
                  { name: 'Yong Shen (Kuala Lumpur Buyer)', text: 'The ROI estimate calculator is extremely precise. I was able to model monthly maintenance fees against short let rental forecasts seamlessly before locking in our freehold Puchong township. 10/10.', rating: 5 }
                ].map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex text-brand-gold mb-3 space-x-0.5">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-brand-gold text-brand-gold" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold italic">"{item.text}"</p>
                    <p className="text-[10px] font-black text-slate-900 uppercase mt-4 dark:text-white">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================================= PAGE 1.5: ALL RESIDENCES MASTER CATALOG ================================= */}
        {tab === 'residences' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left" id="all-residences-master-catalog">
            
            {/* Master Catalog Header with minimal clean lines */}
            <div className="mb-10 text-left border-b border-slate-200 pb-5 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059]">{lang === 'en' ? 'Direct Developer Catalog' : '全国专属一手货源'}</span>
              <h1 className="font-display text-3xl font-black mt-2 tracking-tight text-slate-900 dark:text-white uppercase">
                {lang === 'en' ? 'Explore Premium Residences' : '甄选全国卓越华邸'}
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {lang === 'en' 
                  ? 'Browse through our curated premium residential landmarks across Kuala Lumpur, Selangor, Johor, and Penang.' 
                  : '实机测算大马顶层核心区地标名邸，价格区间、收益指标及一房一型全透明展示。'}
              </p>
            </div>

            {/* INTEGRATED MULTI-DROPDOWN SEARCH FILTER PANELS */}
            <div 
              className="mb-10 w-full rounded-2xl bg-white border border-slate-150 p-4 shadow-md dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-white"
              id="residences-search-filter-box"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-left">
                {/* 1. STATE FILTER SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {t.stateLabel}
                  </label>
                  <select
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold focus:border-brand-gold focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{t.allStates}</option>
                    <option value="Kuala Lumpur">Kuala Lumpur</option>
                    <option value="Selangor">Selangor</option>
                    <option value="Johor">Johor</option>
                    <option value="Penang">Penang</option>
                  </select>
                </div>

                {/* 2. CONTEXTUAL AREA FILTER SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {t.areaLabel}
                  </label>
                  <select
                    disabled={filterState === 'All'}
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold disabled:opacity-50 dark:border-slate-805 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{t.allAreas}</option>
                    {areaOptions.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {/* 3. PRICE SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {t.budgetLabel}
                  </label>
                  <select
                    value={filterPriceRange}
                    onChange={(e) => setFilterPriceRange(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{lang === 'en' ? 'Any Budget Range' : '所有价格预算'}</option>
                    <option value="Below-RM500k">Under RM 600,000</option>
                    <option value="RM500k-RM1m">RM 500k - RM 1.1M</option>
                    <option value="RM1m-RM2m">RM 1.0M - RM 2.05M</option>
                    <option value="Above-RM2m">Above RM 1.8M</option>
                  </select>
                </div>

                {/* 4. CATEGORY SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    Category Type
                  </label>
                  <select
                    value={filterPropType}
                    onChange={(e) => setFilterPropType(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{lang === 'en' ? 'All Categories' : '所有物业类别'}</option>
                    <option value="High-Rise">High-Rise (高层公寓/公寓/大底)</option>
                    <option value="Landed">Landed (别墅/排屋/联排)</option>
                  </select>
                </div>

                {/* 5. TENURE SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {lang === 'en' ? 'Land Tenure' : '产权类别'}
                  </label>
                  <select
                    value={filterTenure}
                    onChange={(e) => setFilterTenure(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{lang === 'en' ? 'Any Land Tenure' : '所有产权类别'}</option>
                    <option value="Freehold">Freehold (永久产权)</option>
                    <option value="Leasehold">Leasehold (租赁产权)</option>
                  </select>
                </div>

                {/* 6. FURNISHING SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {lang === 'en' ? 'Furnishing' : '家私装潢'}
                  </label>
                  <select
                    value={filterFurnishing}
                    onChange={(e) => setFilterFurnishing(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{lang === 'en' ? 'Any Furnishing Status' : '所有装潢状态'}</option>
                    <option value="Fully Furnished">Fully Furnished (全家私精装)</option>
                    <option value="Partly Furnished">Partly Furnished (半家私精装)</option>
                    <option value="Unfurnished">Unfurnished (毛坯/无家私)</option>
                  </select>
                </div>

                {/* 7. ROOMS SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {lang === 'en' ? 'Rooms' : '房间卧室'}
                  </label>
                  <select
                    value={filterBedrooms}
                    onChange={(e) => setFilterBedrooms(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{lang === 'en' ? 'Any Rooms' : '不限户型'}</option>
                    <option value="1">1 Room (单身/一房)</option>
                    <option value="2">2 Rooms (两房户型)</option>
                    <option value="3">3 Rooms (三房奢邸)</option>
                    <option value="4+">4+ Rooms (豪奢大户)</option>
                  </select>
                </div>

                {/* 8. SIZE RANGE SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {lang === 'en' ? 'Size (Built-Up)' : '实用面积范围'}
                  </label>
                  <select
                    value={filterSizeRange}
                    onChange={(e) => setFilterSizeRange(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{lang === 'en' ? 'Any Size' : '不限实用面积'}</option>
                    <option value="under-800">Under 800 sqft (800呎以下)</option>
                    <option value="800-1200">800 - 1,200 sqft</option>
                    <option value="1200-2000">1,200 - 2,000 sqft</option>
                    <option value="above-2000">Above 2,000 sqft (2000呎以上)</option>
                  </select>
                </div>

                {/* 9. CAR PARK SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {lang === 'en' ? 'Car Park' : '车位配额'}
                  </label>
                  <select
                    value={filterCarPark}
                    onChange={(e) => setFilterCarPark(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{lang === 'en' ? 'Any Car Parks' : '不限车位'}</option>
                    <option value="1">1 Bay (单车位)</option>
                    <option value="2">2 Bays (双车位)</option>
                    <option value="3+">3+ Bays (多车位)</option>
                  </select>
                </div>

                {/* 10. TOTAL UNITS SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {lang === 'en' ? 'Total Units (Density)' : '总户数(居住密度)'}
                  </label>
                  <select
                    value={filterTotalUnits}
                    onChange={(e) => setFilterTotalUnits(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{lang === 'en' ? 'Any Density' : '不限社区密度'}</option>
                    <option value="low">Low Density (&lt;300 units)</option>
                    <option value="medium">Medium Density (300 - 600)</option>
                    <option value="high">High Density (&gt;600 units)</option>
                  </select>
                </div>

                {/* 11. DEVELOPER SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {lang === 'en' ? 'Developer' : '品牌开发商'}
                  </label>
                  <select
                    value={filterDeveloper}
                    onChange={(e) => setFilterDeveloper(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{lang === 'en' ? 'Any Developer' : '不限开发商'}</option>
                    {developerOptions.map((dev) => (
                      <option key={dev} value={dev}>{dev}</option>
                    ))}
                  </select>
                </div>

                {/* 12. TOTAL FLOORS SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                    {lang === 'en' ? 'Total Floor' : '大楼总楼层'}
                  </label>
                  <select
                    value={filterTotalFloors}
                    onChange={(e) => setFilterTotalFloors(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{lang === 'en' ? 'Any Floors' : '不限总楼层'}</option>
                    <option value="low-rise">Low Rise (&le;15 floors)</option>
                    <option value="mid-rise">Mid Rise (16-40 floors)</option>
                    <option value="high-rise">High Rise (&gt;40 floors)</option>
                  </select>
                </div>
              </div>

              {/* Keyword & Sorting Row */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="block w-full rounded-xl border border-slate-205 bg-slate-50 py-2.5 pl-9 pr-4 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden focus:ring-1 focus:ring-brand-gold"
                  />
                </div>

                <div className="flex w-full md:w-auto justify-between md:justify-end items-center gap-3">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Order by</span>
                  <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-100 dark:border-slate-850">
                    {[
                      { id: 'featured', label: 'Featured' },
                      { id: 'price-asc', label: 'Price ↑' },
                      { id: 'price-desc', label: 'Price ↓' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={`rounded px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          sortBy === opt.id ? 'bg-[#C5A059] text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 font-bold'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Render of Filtered Property listings */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-405">{lang === 'en' ? 'No projects match your chosen filters. Please expand your budget or region areas.' : '当前筛选条件下未筛选到匹配的豪宅项目，请尝试放宽价格或地区。'}</p>
                <button
                  onClick={() => {
                    setFilterState('All');
                    setFilterArea('All');
                    setFilterPriceRange('All');
                    setFilterPropType('All');
                    setSearchText('');
                  }}
                  className="mt-4 text-xs font-bold text-brand-gold underline cursor-pointer"
                >
                  Reset Filter Parameters
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs font-extrabold text-slate-400 mb-4 tracking-wider uppercase">Showing {filteredProjects.length} Verified Properties</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProjects.map((p) => (
                    <ProjectCard 
                      key={p.id}
                      project={p}
                      currency={currency}
                      lang={lang}
                      isFavorite={favorites.includes(p.id)}
                      isCompared={comparedProjects.some((cp) => cp.id === p.id)}
                      onToggleFavorite={() => handleToggleFavorite(p.id)}
                      onToggleCompare={() => handleToggleCompare(p)}
                      onViewDetails={() => setSelectedProject(p)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================= PAGE 2: SAVED FAVORITES ================================= */}
        {tab === 'favorites' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left" id="favorites-listings-matrix">
            <div className="mb-8 border-b border-slate-200 pb-5 dark:border-slate-800">
              <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">
                {t.favoritesTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'en' ? 'Vetted units you have marked as high interested favorites.' : '您已勾选心意的高端住宅清单，可随时与置业顾问一键连线获取专属底价。'}
              </p>
            </div>

            {favoritedProjectsList.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs dark:bg-slate-900/60 dark:border-slate-800">
                <Heart className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400 mt-3">{t.noFavorites}</p>
                <button
                  onClick={() => setTab('home')}
                  className="mt-4 text-xs font-bold text-brand-gold underline"
                >
                  Return to Home Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoritedProjectsList.map((p) => (
                  <ProjectCard 
                    key={p.id}
                    project={p}
                    currency={currency}
                    lang={lang}
                    isFavorite={true}
                    isCompared={comparedProjects.some((cp) => cp.id === p.id)}
                    onToggleFavorite={() => handleToggleFavorite(p.id)}
                    onToggleCompare={() => handleToggleCompare(p)}
                    onViewDetails={() => setSelectedProject(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================= PAGE 3: SIDE-BY-SIDE COMPARE VIEW ================================= */}
        {tab === 'map' && (
          <InteractiveMap 
            projects={projects}
            currency={currency}
            lang={lang}
            onViewProject={(p) => setSelectedProject(p)}
            setTab={setTab}
            favorites={favorites}
            comparedProjects={comparedProjects}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
          />
        )}

        {/* ================================= PAGE 3: SIDE-BY-SIDE COMPARE VIEW ================================= */}
        {tab === 'compare' && (
          <CompareSection 
            comparedProjects={comparedProjects}
            currency={currency}
            lang={lang}
            onRemoveProject={handleRemoveFromCompare}
            onClearAll={() => setComparedProjects([])}
            onSelectProject={(p) => setSelectedProject(p)}
          />
        )}

        {/* ================================= PAGE 4: PORTAL PLAIN ARTICLE GUIDE ================================= */}
        {tab === 'guide' && (
          <BuyingGuide lang={lang} />
        )}

      </main>

      {/* 3. FLOATING CONCISE STATIC COMPARATIVE DRAWER DRAWER */}
      <CompareDrawer 
        comparedProjects={comparedProjects}
        onRemove={handleRemoveFromCompare}
        onCompareNow={() => setTab('compare')}
        lang={lang}
      />

      {/* 4. DETAILS POPUP MODAL SCREEN */}
      {selectedProject && (
        <ProjectDetailModal 
          project={selectedProject}
          currency={currency}
          lang={lang}
          onClose={() => setSelectedProject(null)}
          onLeadCaptured={handleLeadCaptured}
        />
      )}

      {/* 5. MULTI STEP SMART QUESTIONNAIRE POPUP */}
      {showQuestionnaire && (
        <QuickQuestionnaire 
          projects={projects}
          lang={lang}
          onClose={() => setShowQuestionnaire(false)}
          onLeadCaptured={handleLeadCaptured}
          onViewProject={(p) => setSelectedProject(p)}
        />
      )}

      {/* 6. RESPONSIVE PERISTENT STICKY CALL-TO-ACTIONS HOTLINES */}
      <div className="fixed bottom-3 right-3 z-30 flex flex-col space-y-2">
        <a 
          href={`https://wa.me/60195598932?text=${encodeURIComponent(t.whatsappChatHelp)}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center space-x-2 rounded-full bg-green-500 px-4.5 text-xs font-black text-white shadow-xl hover:bg-green-600 hover:scale-103 transition-all cursor-pointer"
          title="Direct developer whatsapp pipeline"
        >
          <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-ping" />
          <span>WhatsApp Hotline</span>
        </a>
      </div>

      {/* 7. PREMIUM STEREOSCOPIC FOOTER INFO */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs font-semibold text-slate-500 dark:border-slate-900 dark:bg-slate-950 dark:text-slate-400">
        <p className="px-4 leading-relaxed max-w-3xl mx-auto">
          {t.footerMessage}
        </p>
        <p className="mt-2 text-[10px] text-slate-350 dark:text-slate-650 font-mono tracking-widest uppercase">
          {t.currencyText}
        </p>
      </footer>

    </div>
  );
}
