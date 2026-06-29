/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Search, Sparkles, Filter, ArrowUpRight, HelpCircle, Briefcase, Grid, 
  MapPin, Clock, ArrowRight, Heart, CheckCircle, ChevronDown, ChevronUp, SlidersHorizontal, Flame, Phone, Globe
} from 'lucide-react';

import { Project, Lead, MalaysianState, PropertyType, CurrencyCode } from './types';
import { TRANSLATIONS } from './utils/translations';
import { MOCK_PROJECTS, STATE_AREAS } from './constants/mockData';
import { fetchSpreadsheetData } from './utils/googleSheets';

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
import AdminPanel from './components/AdminPanel';

// @ts-expect-error - image import from assets without specific d.ts declaration
import klccHeroBg from './assets/images/klcc_hero_bg_1782501813196.jpg';

// Global cache variable to prevent backdrop flashing on tab switches
let klccImageCached = false;

export default function App() {
  // Navigation Routing Tab State
  const [tab, setTab] = useState<string>('home'); // home, compare, guide, admin, favorites
  
  // Parallax scroll hook for the hero city view
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  
  // Track if hero image is fully loaded to prevent sudden pops / flashes
  const [heroImageLoaded, setHeroImageLoaded] = useState<boolean>(klccImageCached);

  useEffect(() => {
    if (!klccImageCached) {
      const img = new Image();
      img.src = klccHeroBg;
      img.onload = () => {
        klccImageCached = true;
        setHeroImageLoaded(true);
      };
    }
  }, []);
  
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
        const requiredIds = ['amika', 'anya', 'aricia'];
        const hasAllNew = requiredIds.every(id => parsed.some(p => p.id === id)) && !parsed.some(p => p.id === 'pavilion-square');
        if (hasAllNew) {
          // Merge with static mock data to apply live corrections of project properties (tenure, developer, highlights, etc.)
          const merged = parsed.map(p => {
            const mock = MOCK_PROJECTS.find(m => m.id === p.id);
            return mock ? { ...mock, ...p } : p;
          });
          // Also append any new mock projects that are missing in the parsed storage list (e.g. newly added 'parkside')
          MOCK_PROJECTS.forEach(mock => {
            if (!merged.some(m => m.id === mock.id)) {
              merged.push(mock);
            }
          });
          return merged;
        }
      }
      return MOCK_PROJECTS;
    } catch {
      return MOCK_PROJECTS;
    }
  });

  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'fallback' | 'error'>('syncing');

  // Dynamically pull of direct sync without OAuth API keys
  const triggerWorkspaceSync = async () => {
    try {
      setSyncStatus('syncing');
      const liveListings = await fetchSpreadsheetData();
      if (liveListings && liveListings.length > 0) {
        setProjects(liveListings);
        setSyncStatus('synced');
        console.log(`Live workspace parsed sync completed. Items: ${liveListings.length}`);
      } else {
        setSyncStatus('fallback');
      }
    } catch (err: any) {
      console.warn('Workspace sync failed. Reverting to cached lists.', err?.message || err);
      setSyncStatus('fallback');
    }
  };

  useEffect(() => {
    triggerWorkspaceSync();
  }, []);

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
  const [showMoreHeroFilters, setShowMoreHeroFilters] = useState<boolean>(false);
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
    const list = projects.filter((p) => p.featured);
    const order = ['aldenz', 'queenswoodz', 'parkside'];
    return list.slice(0, 3).sort((a, b) => {
      const idxA = order.indexOf(a.id);
      const idxB = order.indexOf(b.id);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });
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
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 transition-colors duration-500 font-sans" id="malaysianhomes-landing-root">
      
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
        syncStatus={syncStatus}
      />

      {/* 2. DYNAMIC MAIN BODY VIEW (ROUTED BY TAB STATE) */}
      <main className="pb-24 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ================================= PAGE 1: HOMEPAGE VIEW ================================= */}
          {tab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden"
            >
            {/* AMBIENT BACKGROUND GLOW HALOS */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[150px] animate-pulse-slow pointer-events-none" />
            <div className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[130px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '3s' }} />

            {/* HERO LUXURY WALLPAPER SECTION CAROUSEL BOX */}
            <div className="relative isolate overflow-hidden min-h-[580px] sm:min-h-[720px] lg:min-h-[820px] flex flex-col justify-center py-24 sm:py-36 text-center border-b border-[#ebdcb9]/40" id="homepage-hero-curtain">
              
              {/* Background Image of KLCC with soft luxury ambient gradient overlay */}
              <div className="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#0c0d1c] via-[#2d1b32] to-[#7c502f]/40">
                <motion.img 
                  src={klccHeroBg} 
                  alt="KLCC Kuala Lumpur City View" 
                  onLoad={() => {
                    klccImageCached = true;
                    setHeroImageLoaded(true);
                  }}
                  initial={{ opacity: 0, scale: 1.12 }}
                  animate={heroImageLoaded ? { opacity: 1, scale: 1.08 } : { opacity: 0, scale: 1.12 }}
                  style={{ y: heroY }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -top-[10%] left-0 w-full h-[120%] object-cover object-center filter saturate-[0.85] contrast-[1.02] brightness-[0.98]"
                  referrerPolicy="no-referrer"
                />
                {/* Sunset Flash premium cinematic overlay */}
                <div className="absolute inset-0 animate-sunset-flash mix-blend-color-burn opacity-90" />
                
                {/* Luxe overlays to smoothly blend and ensure readable text */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/30 via-[#FDFBF7]/55 to-[#FDFBF7]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7]/10 via-[#FDFBF7]/35 to-[#FDFBF7]/10" />
                <div className="absolute inset-0 bg-[#FDFBF7]/10 backdrop-blur-[1px]" />
              </div>

              {/* Technical Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,115,85,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,115,85,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80" />
              
              <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
                
                {/* Branding teal glowing tag */}
                <div className="mx-auto mb-6 flex w-fit items-center space-x-2 rounded-full bg-teal-50 border border-[#b2dbd5] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-teal-800 shadow-xs animate-float">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span>{lang === 'en' ? 'Direct Developer Allocations' : '吉隆坡顶奢住宅首发'}</span>
                </div>

                <h1 className="font-display text-4xl sm:text-6xl lg:text-7.5xl font-black tracking-tight uppercase leading-[0.95] bg-clip-text text-transparent bg-gradient-to-r from-teal-950 via-stone-900 to-[#9E7A35]">
                  {lang === 'en' ? 'Invest in Malaysia’s Premium Core Areas' : '大马优居 • 臻选核心优质地段'}
                </h1>
                
                <p className="mt-6 text-sm sm:text-lg text-stone-600 max-w-2xl mx-auto font-bold tracking-wide">
                  {t.tagline}
                </p>

                {/* INTEGRATED MULTI-DROPDOWN SEARCH FILTER PANELS */}
                <div 
                  className="mx-auto mt-12 w-full max-w-4xl rounded-3xl glass-panel glow-border p-5 sm:p-7 text-stone-900 shadow-2xl backdrop-blur-md"
                  id="hero-integrated-search-box"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
                    
                    {/* 1. STATE FILTER SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-teal-800 mb-1.5">
                        {t.stateLabel}
                      </label>
                      <select
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:border-teal-700 focus:outline-hidden"
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
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-teal-800 mb-1.5">
                        {t.areaLabel}
                      </label>
                      <select
                        disabled={filterState === 'All'}
                        value={filterArea}
                        onChange={(e) => setFilterArea(e.target.value)}
                        className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900 disabled:opacity-40"
                      >
                        <option className="bg-white text-stone-900" value="All">{t.allAreas}</option>
                        {areaOptions.map((area) => (
                          <option className="bg-white text-stone-900" key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>

                    {/* 3. PRICE SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-teal-800 mb-1.5">
                        {t.budgetLabel}
                      </label>
                      <select
                        value={filterPriceRange}
                        onChange={(e) => setFilterPriceRange(e.target.value)}
                        className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900"
                      >
                        <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Budget Range' : '所有价格预算'}</option>
                        <option className="bg-white text-stone-900" value="Below-RM500k">Under RM 600,000</option>
                        <option className="bg-white text-stone-900" value="RM500k-RM1m">RM 500k - RM 1.1M</option>
                        <option className="bg-white text-stone-900" value="RM1m-RM2m">RM 1.0M - RM 2.05M</option>
                        <option className="bg-white text-stone-900" value="Above-RM2m">Above RM 1.8M</option>
                      </select>
                    </div>

                    {/* 4. CATEGORY SELECT */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-teal-800 mb-1.5">
                        Category Type
                      </label>
                      <select
                        value={filterPropType}
                        onChange={(e) => setFilterPropType(e.target.value)}
                        className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900"
                      >
                        <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'All Categories' : '所有物业类别'}</option>
                        <option className="bg-white text-stone-900" value="High-Rise">High-Rise (高层公寓/公寓/大底)</option>
                        <option className="bg-white text-stone-900" value="Landed">Landed (别墅/排屋/联排)</option>
                      </select>
                    </div>
                  </div>

                  {/* 5-12. ENHANCED COLLAPSIBLE EXTENDED FILTERS DROPDOWN */}
                  {showMoreHeroFilters && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left border-t border-stone-200 pt-6 mt-6 animate-fade-in">
                      {/* 5. TENURE SELECT */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                          {lang === 'en' ? 'Land Tenure' : '产权类别'}
                        </label>
                        <select
                          value={filterTenure}
                          onChange={(e) => setFilterTenure(e.target.value)}
                          className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900"
                        >
                          <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Land Tenure' : '所有产权类别'}</option>
                          <option className="bg-white text-stone-900" value="Freehold">Freehold (永久产权)</option>
                          <option className="bg-white text-stone-900" value="Leasehold">Leasehold (租赁产权)</option>
                        </select>
                      </div>

                      {/* 6. FURNISHING SELECT */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                          {lang === 'en' ? 'Furnishing' : '家私装潢'}
                        </label>
                        <select
                          value={filterFurnishing}
                          onChange={(e) => setFilterFurnishing(e.target.value)}
                          className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900"
                        >
                          <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Furnishing Status' : '所有装潢状态'}</option>
                          <option className="bg-white text-stone-900" value="Fully Furnished">Fully Furnished (全家私精装)</option>
                          <option className="bg-white text-stone-900" value="Partly Furnished">Partly Furnished (半家私精装)</option>
                          <option className="bg-white text-stone-900" value="Unfurnished">Unfurnished (毛坯/无家私)</option>
                        </select>
                      </div>

                      {/* 7. ROOMS SELECT */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                          {lang === 'en' ? 'Rooms' : '房间卧室'}
                        </label>
                        <select
                          value={filterBedrooms}
                          onChange={(e) => setFilterBedrooms(e.target.value)}
                          className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900"
                        >
                          <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Rooms' : '不限户型'}</option>
                          <option className="bg-white text-stone-900" value="1">1 Room (单身/一房)</option>
                          <option className="bg-white text-stone-900" value="2">2 Rooms (两房户型)</option>
                          <option className="bg-white text-stone-900" value="3">3 Rooms (三房奢邸)</option>
                          <option className="bg-white text-stone-900" value="4+">4+ Rooms (豪奢大户)</option>
                        </select>
                      </div>

                      {/* 8. SIZE RANGE SELECT */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                          {lang === 'en' ? 'Size (Built-Up)' : '实用面积范围'}
                        </label>
                        <select
                          value={filterSizeRange}
                          onChange={(e) => setFilterSizeRange(e.target.value)}
                          className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900"
                        >
                          <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Size' : '不限实用面积'}</option>
                          <option className="bg-white text-stone-900" value="under-800">Under 800 sqft (800呎以下)</option>
                          <option className="bg-white text-stone-900" value="800-1200">800 - 1,200 sqft</option>
                          <option className="bg-white text-stone-900" value="1200-2000">1,200 - 2,000 sqft</option>
                          <option className="bg-white text-stone-900" value="above-2000">Above 2,000 sqft (2000呎以上)</option>
                        </select>
                      </div>

                      {/* 9. CAR PARK SELECT */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                          {lang === 'en' ? 'Car Park' : '车位配额'}
                        </label>
                        <select
                          value={filterCarPark}
                          onChange={(e) => setFilterCarPark(e.target.value)}
                          className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900"
                        >
                          <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Car Parks' : '不限车位'}</option>
                          <option className="bg-white text-stone-900" value="1">1 Bay (单车位)</option>
                          <option className="bg-white text-stone-900" value="2">2 Bays (双车位)</option>
                          <option className="bg-white text-stone-900" value="3+">3+ Bays (多车位)</option>
                        </select>
                      </div>

                      {/* 10. TOTAL UNITS SELECT */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                          {lang === 'en' ? 'Total Units (Density)' : '总户数(居住密度)'}
                        </label>
                        <select
                          value={filterTotalUnits}
                          onChange={(e) => setFilterTotalUnits(e.target.value)}
                          className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900"
                        >
                          <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Density' : '不限社区密度'}</option>
                          <option className="bg-white text-stone-900" value="low">Low Density (&lt;300 units)</option>
                          <option className="bg-white text-stone-900" value="medium">Medium Density (300 - 600)</option>
                          <option className="bg-white text-stone-900" value="high">High Density (&gt;600 units)</option>
                        </select>
                      </div>

                      {/* 11. DEVELOPER SELECT */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                          {lang === 'en' ? 'Developer' : '品牌开发商'}
                        </label>
                        <select
                          value={filterDeveloper}
                          onChange={(e) => setFilterDeveloper(e.target.value)}
                          className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900"
                        >
                          <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Developer' : '不限开发商'}</option>
                          {developerOptions.map((dev) => (
                            <option className="bg-white text-stone-900" key={dev} value={dev}>{dev}</option>
                          ))}
                        </select>
                      </div>

                      {/* 12. TOTAL FLOORS SELECT */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                          {lang === 'en' ? 'Total Floor' : '大楼总楼层'}
                        </label>
                        <select
                          value={filterTotalFloors}
                          onChange={(e) => setFilterTotalFloors(e.target.value)}
                          className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black focus:outline-hidden text-stone-900"
                        >
                          <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Floors' : '不限总楼层'}</option>
                          <option className="bg-white text-stone-900" value="low-rise">Low Rise (&le;15 floors)</option>
                          <option className="bg-white text-stone-900" value="mid-rise">Mid Rise (16-40 floors)</option>
                          <option className="bg-white text-stone-900" value="high-rise">High Rise (&gt;40 floors)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* BOTTOM SEARCH DEPUTY FILTER BLOCK */}
                  <div className="mt-6 pt-6 border-t border-stone-200 sm:flex sm:justify-between sm:items-center gap-4">
                    <div className="relative flex-1 max-w-lg mb-3 sm:mb-0">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                        <Search className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="block w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-xs font-black text-stone-900 focus:outline-hidden focus:border-teal-700"
                      />
                    </div>

                    <div className="flex gap-2">
                      {/* More Filters Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setShowMoreHeroFilters(!showMoreHeroFilters)}
                        className="flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white py-3 px-5 font-display text-xs font-bold text-stone-700 hover:bg-stone-50 transition-all cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5 text-teal-700" />
                        <span>
                          {showMoreHeroFilters
                            ? (lang === 'en' ? 'Less Filters' : '收起筛选')
                            : (lang === 'en' ? 'More Filters' : '更多筛选')}
                        </span>
                        {showMoreHeroFilters ? <ChevronUp className="h-3.5 w-3.5 text-stone-500" /> : <ChevronDown className="h-3.5 w-3.5 text-stone-500" />}
                      </button>

                      {/* Search trigger button */}
                      <button
                        onClick={() => {
                          setTab('home');
                          document.getElementById('catalog-grid-explorer')?.scrollIntoView();
                        }}
                        className="flex items-center space-x-1.5 rounded-xl bg-button-teal py-3 px-6 font-display text-xs font-black text-white hover:opacity-90 transition-all hover:scale-[1.02] shadow-md cursor-pointer"
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 mb-20 text-left">
              <div className="relative overflow-hidden rounded-3xl glass-panel glow-border p-6 sm:p-8 text-stone-900 border border-teal-500/10 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 text-teal-500/5 pointer-events-none">
                  <Sparkles className="h-48 w-48" />
                </div>
                <div className="relative z-10 max-w-xl">
                  <span className="inline-block rounded-full bg-teal-50 border border-teal-100 px-3.5 py-1 text-[10px] font-black tracking-widest text-teal-800 uppercase shadow-xs">
                    AI Match Profiler
                  </span>
                  <h3 className="font-display text-xl sm:text-2.5xl font-black tracking-tight mt-3 leading-tight uppercase text-stone-900">
                    {lang === 'en' ? 'Get Smart Property Recommendations Instantly' : '极速匹配！为您智能遴选吉隆坡好房'}
                  </h3>
                  <p className="mt-3 text-xs text-stone-600 leading-relaxed font-bold">
                    {lang === 'en' 
                      ? 'No more endless scrolling. Tell our smart engine your budget limit and interests to automatically generate matched layouts and direct developer price sheets.' 
                      : '拒绝无效看房，输入您心仪的地理圈及预算上限，让AI推荐大使为您极速网罗最吻合的大马特惠好房，附赠尊享看房PDF报告。'}
                  </p>
                  <button
                    onClick={() => setShowQuestionnaire(true)}
                    className="mt-6 flex items-center space-x-2 rounded-xl bg-[#1c1917] px-6 py-3.5 font-display text-xs font-black text-white hover:bg-stone-800 shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-brand-gold" />
                    <span>{t.startQuestionnaire}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FEATURED PROJECTS CATALOGUE CONTAINER SECTION */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left" id="catalog-grid-explorer">
              <div className="mb-10 border-b border-[#ebdcb9] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-teal-700 mb-1.5">
                    <span className="h-1 w-6 bg-teal-600 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Selected Showcase</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3.5xl font-black text-stone-900 uppercase tracking-tight">
                    {t.featuredTitle}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1 font-bold">
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
              <div className="mt-14 text-center">
                <button
                  onClick={() => {
                    setTab('residences');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center space-x-2 rounded-full bg-[#1c1917] border border-stone-800 hover:bg-stone-800 px-8 py-4 font-display text-xs font-black text-white transition-all hover:scale-[1.03] active:scale-95 shadow-md group cursor-pointer"
                >
                  <span>{lang === 'en' ? 'EXPLORE ALL RESIDENCES' : '查看全部大马奢华地标'}</span>
                  <span className="transform transition-transform group-hover:translate-x-1 text-brand-gold font-black">→</span>
                </button>
              </div>
            </div>

            {/* BUYING PROCESS GUIDE TIMELINE */}
            <BuyingGuide 
              lang={lang} 
              limit={3}
              onSeeMore={() => {
                setTab('guide');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* WHY CHOOSE THIS PLATFORM GRID SEC */}
            <div className="bg-[#F5F2EB] border-t border-b border-[#ebdcb9] text-stone-900 py-16 mt-8" id="why-choose-grid-block">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
                <div className="text-center mb-12">
                  <h2 className="font-display text-2.5xl font-black text-stone-900 tracking-tight uppercase">
                    {t.whyChooseTitle}
                  </h2>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-2.5 font-bold">
                    {t.whyChooseSub}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="rounded-2xl border border-[#ebdcb9] bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
                    <span className="font-display font-black text-2xl text-brand-gold">100%</span>
                    <h4 className="text-sm font-bold mt-2 text-stone-900">Verified Projects</h4>
                    <p className="text-[11px] font-bold text-stone-600 leading-normal mt-1.5">Every spec, layout, and maintenance cost is directly cross-referenced and validated with developers.</p>
                  </div>
                  <div className="rounded-2xl border border-[#ebdcb9] bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
                    <span className="font-display font-black text-2xl text-brand-gold">0%</span>
                    <h4 className="text-sm font-bold mt-2 text-stone-900">Buyer Commissions</h4>
                    <p className="text-[11px] font-bold text-stone-600 leading-normal mt-1.5">Our advisory channels are absolutely free. Connect directly to developers secure rates.</p>
                  </div>
                  <div className="rounded-2xl border border-[#ebdcb9] bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
                    <span className="font-display font-black text-2xl text-brand-gold">10Min</span>
                    <h4 className="text-sm font-bold mt-2 text-stone-900">Fast Response</h4>
                    <p className="text-[11px] font-bold text-stone-600 leading-normal mt-1.5">Experienced bi-lingual concierges will immediately coordinate scheduling arrangements.</p>
                  </div>
                  <div className="rounded-2xl border border-[#ebdcb9] bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
                    <span className="font-display font-black text-2xl text-brand-gold">6.5%</span>
                    <h4 className="text-sm font-bold mt-2 text-stone-900">Avg Rental Yield</h4>
                    <p className="text-[11px] font-bold text-stone-600 leading-normal mt-1.5">Maximize returns by viewing elite properties optimized for tourist Airbnb letouts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ HANDLERS */}
            <FAQSection lang={lang} />

          </motion.div>
        )}

        {/* ================================= PAGE 1.5: ALL RESIDENCES MASTER CATALOG ================================= */}
        {tab === 'residences' && (
          <motion.div
            key="residences"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-left"
            id="all-residences-master-catalog"
          >
            
            {/* Master Catalog Header with minimal clean lines */}
            <div className="mb-10 text-left border-b border-[#ebdcb9] pb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">{lang === 'en' ? 'Direct Developer Catalog' : '全国专属一手货源'}</span>
              <h1 className="font-display text-3xl sm:text-4.5xl font-black mt-2 tracking-tight text-stone-900 uppercase">
                {lang === 'en' ? 'Explore Premium Residences' : '甄选大马卓越华邸'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-2 font-bold">
                {lang === 'en' 
                  ? 'Browse through our curated premium residential landmarks across Kuala Lumpur, Selangor, Johor, and Penang.' 
                  : '直通开发商系统，价格区间、收益指标及一房一型全透明展示。'}
              </p>
            </div>

            {/* INTEGRATED MULTI-DROPDOWN SEARCH FILTER PANELS */}
            <div 
              className="mb-12 w-full rounded-3xl glass-panel glow-border p-6 shadow-2xl"
              id="residences-search-filter-box"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
                {/* 1. STATE FILTER SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {t.stateLabel}
                  </label>
                  <select
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{t.allStates}</option>
                    <option className="bg-white text-stone-900" value="Kuala Lumpur">Kuala Lumpur</option>
                    <option className="bg-white text-stone-900" value="Selangor">Selangor</option>
                    <option className="bg-white text-stone-900" value="Johor">Johor</option>
                    <option className="bg-white text-stone-900" value="Penang">Penang</option>
                  </select>
                </div>

                {/* 2. CONTEXTUAL AREA FILTER SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {t.areaLabel}
                  </label>
                  <select
                    disabled={filterState === 'All'}
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden disabled:opacity-30"
                  >
                    <option className="bg-white text-stone-900" value="All">{t.allAreas}</option>
                    {areaOptions.map((area) => (
                      <option className="bg-white text-stone-900" key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {/* 3. PRICE SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {t.budgetLabel}
                  </label>
                  <select
                    value={filterPriceRange}
                    onChange={(e) => setFilterPriceRange(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Budget Range' : '所有价格预算'}</option>
                    <option className="bg-white text-stone-900" value="Below-RM500k">Under RM 600,000</option>
                    <option className="bg-white text-stone-900" value="RM500k-RM1m">RM 500k - RM 1.1M</option>
                    <option className="bg-white text-stone-900" value="RM1m-RM2m">RM 1.0M - RM 2.05M</option>
                    <option className="bg-white text-stone-900" value="Above-RM2m">Above RM 1.8M</option>
                  </select>
                </div>

                {/* 4. CATEGORY SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    Category Type
                  </label>
                  <select
                    value={filterPropType}
                    onChange={(e) => setFilterPropType(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'All Categories' : '所有物业类别'}</option>
                    <option className="bg-white text-stone-900" value="High-Rise">High-Rise (高层公寓/大平层/服务公寓)</option>
                    <option className="bg-white text-stone-900" value="Landed">Landed (独栋别墅/联排/排屋)</option>
                  </select>
                </div>

                {/* 5. TENURE SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {lang === 'en' ? 'Land Tenure' : '产权类别'}
                  </label>
                  <select
                    value={filterTenure}
                    onChange={(e) => setFilterTenure(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Land Tenure' : '所有产权类别'}</option>
                    <option className="bg-white text-stone-900" value="Freehold">Freehold (永久产权)</option>
                    <option className="bg-white text-stone-900" value="Leasehold">Leasehold (租赁产权)</option>
                  </select>
                </div>

                {/* 6. FURNISHING SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {lang === 'en' ? 'Furnishing' : '家私装潢'}
                  </label>
                  <select
                    value={filterFurnishing}
                    onChange={(e) => setFilterFurnishing(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Furnishing Status' : '所有装潢状态'}</option>
                    <option className="bg-white text-stone-900" value="Fully Furnished">Fully Furnished (全家私精装)</option>
                    <option className="bg-white text-stone-900" value="Partly Furnished">Partly Furnished (半家私精装)</option>
                    <option className="bg-white text-stone-900" value="Unfurnished">Unfurnished (毛坯/无家私)</option>
                  </select>
                </div>

                {/* 7. ROOMS SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {lang === 'en' ? 'Rooms' : '房间卧室'}
                  </label>
                  <select
                    value={filterBedrooms}
                    onChange={(e) => setFilterBedrooms(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Rooms' : '不限户型'}</option>
                    <option className="bg-white text-stone-900" value="1">1 Room (单身/一房)</option>
                    <option className="bg-white text-stone-900" value="2">2 Rooms (两房户型)</option>
                    <option className="bg-white text-stone-900" value="3">3 Rooms (三房奢邸)</option>
                    <option className="bg-white text-stone-900" value="4+">4+ Rooms (豪奢大户)</option>
                  </select>
                </div>

                {/* 8. SIZE RANGE SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {lang === 'en' ? 'Size (Built-Up)' : '实用面积范围'}
                  </label>
                  <select
                    value={filterSizeRange}
                    onChange={(e) => setFilterSizeRange(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Size' : '不限实用面积'}</option>
                    <option className="bg-white text-stone-900" value="under-800">Under 800 sqft (800呎以下)</option>
                    <option className="bg-white text-stone-900" value="800-1200">800 - 1,200 sqft</option>
                    <option className="bg-white text-stone-900" value="1200-2000">1,200 - 2,000 sqft</option>
                    <option className="bg-white text-stone-900" value="above-2000">Above 2,000 sqft (2000呎以上)</option>
                  </select>
                </div>

                {/* 9. CAR PARK SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {lang === 'en' ? 'Car Park' : '车位配额'}
                  </label>
                  <select
                    value={filterCarPark}
                    onChange={(e) => setFilterCarPark(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Car Parks' : '不限车位'}</option>
                    <option className="bg-white text-stone-900" value="1">1 Bay (单车位)</option>
                    <option className="bg-white text-stone-900" value="2">2 Bays (双车位)</option>
                    <option className="bg-white text-stone-900" value="3+">3+ Bays (多车位)</option>
                  </select>
                </div>

                {/* 10. TOTAL UNITS SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {lang === 'en' ? 'Total Units (Density)' : '总户数(居住密度)'}
                  </label>
                  <select
                    value={filterTotalUnits}
                    onChange={(e) => setFilterTotalUnits(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Density' : '不限社区密度'}</option>
                    <option className="bg-white text-stone-900" value="low">Low Density (&lt;300 units)</option>
                    <option className="bg-white text-stone-900" value="medium">Medium Density (300 - 600)</option>
                    <option className="bg-white text-stone-900" value="high">High Density (&gt;600 units)</option>
                  </select>
                </div>

                {/* 11. DEVELOPER SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {lang === 'en' ? 'Developer' : '品牌开发商'}
                  </label>
                  <select
                    value={filterDeveloper}
                    onChange={(e) => setFilterDeveloper(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Developer' : '不限开发商'}</option>
                    {developerOptions.map((dev) => (
                      <option className="bg-white text-stone-900" key={dev} value={dev}>{dev}</option>
                    ))}
                  </select>
                </div>

                {/* 12. TOTAL FLOORS SELECT */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                    {lang === 'en' ? 'Total Floor' : '大楼总楼层'}
                  </label>
                  <select
                    value={filterTotalFloors}
                    onChange={(e) => setFilterTotalFloors(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 px-3.5 text-xs font-black text-stone-900 focus:outline-hidden"
                  >
                    <option className="bg-white text-stone-900" value="All">{lang === 'en' ? 'Any Floors' : '不限总楼层'}</option>
                    <option className="bg-white text-stone-900" value="low-rise">Low Rise (&le;15 floors)</option>
                    <option className="bg-white text-stone-900" value="mid-rise">Mid Rise (16-40 floors)</option>
                    <option className="bg-white text-stone-900" value="high-rise">High Rise (&gt;40 floors)</option>
                  </select>
                </div>
              </div>

              {/* Keyword & Sorting Row */}
              <div className="mt-6 pt-6 border-t border-stone-200 flex flex-col md:flex-row md:justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="block w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-xs font-black text-stone-900 focus:outline-hidden focus:border-teal-700"
                  />
                </div>

                <div className="flex w-full md:w-auto justify-between md:justify-end items-center gap-3">
                  <span className="text-[10px] font-extrabold uppercase text-stone-500">Order by</span>
                  <div className="flex gap-1 bg-stone-100 border border-stone-200 p-1 rounded-xl">
                    {[
                      { id: 'featured', label: 'Featured' },
                      { id: 'price-asc', label: 'Price ↑' },
                      { id: 'price-desc', label: 'Price ↓' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={`rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          sortBy === opt.id 
                            ? 'bg-white text-stone-950 shadow-xs' 
                            : 'text-stone-500 hover:text-stone-800'
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
              <div className="text-center py-20 rounded-3xl glass-panel border border-[#ebdcb9] bg-[#FAF8F5] shadow-2xl">
                <p className="text-sm font-bold text-stone-500">{lang === 'en' ? 'No projects match your chosen filters. Please expand your budget or region areas.' : '当前筛选条件下未筛选到匹配的豪宅项目，请尝试放宽价格或地区。'}</p>
                <button
                  onClick={() => {
                    setFilterState('All');
                    setFilterArea('All');
                    setFilterPriceRange('All');
                    setFilterPropType('All');
                    setSearchText('');
                  }}
                  className="mt-4 text-xs font-bold text-teal-700 underline cursor-pointer hover:text-teal-800"
                >
                  Reset Filter Parameters
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs font-extrabold text-stone-500 mb-4 tracking-wider uppercase">Showing {filteredProjects.length} Verified Properties</p>
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
          </motion.div>
        )}

        {/* ================================= PAGE 2: SAVED FAVORITES ================================= */}
        {tab === 'favorites' && (
          <motion.div
            key="favorites"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-left"
            id="favorites-listings-matrix"
          >
            <div className="mb-10 border-b border-[#ebdcb9] pb-6">
              <div className="flex items-center space-x-2 text-teal-700 mb-1.5">
                <span className="h-1 w-6 bg-teal-600 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest">Saved Collection</span>
              </div>
              <h2 className="font-display text-2.5xl sm:text-3.5xl font-black text-stone-900 uppercase tracking-tight">
                {t.favoritesTitle}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-2 font-bold">
                {lang === 'en' ? 'Vetted units you have marked as high interested favorites.' : '您已勾选心意的高端住宅清单，可随时与置业顾问一键连线获取专属底价。'}
              </p>
            </div>

            {favoritedProjectsList.length === 0 ? (
              <div className="text-center py-20 rounded-3xl glass-panel border border-[#ebdcb9] bg-[#FAF8F5] shadow-2xl">
                <Heart className="h-12 w-12 text-stone-400 mx-auto animate-pulse" />
                <p className="text-sm font-bold text-stone-500 mt-4">{t.noFavorites}</p>
                <button
                  onClick={() => setTab('home')}
                  className="mt-4 text-xs font-bold text-teal-750 underline cursor-pointer hover:text-teal-800"
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
          </motion.div>
        )}

        {/* ================================= PAGE 3: SIDE-BY-SIDE COMPARE VIEW ================================= */}
        {tab === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
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
              syncStatus={syncStatus}
              onRefreshData={() => triggerWorkspaceSync()}
            />
          </motion.div>
        )}

        {/* ================================= PAGE 3: SIDE-BY-SIDE COMPARE VIEW ================================= */}
        {tab === 'compare' && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <CompareSection 
              comparedProjects={comparedProjects}
              allProjects={projects}
              onAddProject={handleToggleCompare}
              currency={currency}
              lang={lang}
              onRemoveProject={handleRemoveFromCompare}
              onClearAll={() => setComparedProjects([])}
              onSelectProject={(p) => setSelectedProject(p)}
            />
          </motion.div>
        )}

        {/* ================================= PAGE 4: PORTAL PLAIN ARTICLE GUIDE ================================= */}
        {tab === 'guide' && (
          <motion.div
            key="guide"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <BuyingGuide lang={lang} />
          </motion.div>
        )}

        {/* ================================= PAGE 5: ADMIN / SYNC SETTINGS PANEL ================================= */}
        {tab === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left"
          >
            {/* Google workspace sync status status card */}
            <div className="mb-8 rounded-3xl border border-[#ebdcb9] bg-[#FAF8F5] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-600 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
                    <h3 className="font-display text-lg font-black text-stone-900">
                      Google Workspace Sync Settings
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 font-bold leading-relaxed">
                    Your portal is directly synced with Google Workspace. It dynamically fetches live listings from Google Sheets and actual images from your Google Drive folder automatically without requiring any login or API limits.
                  </p>
                </div>
              </div>

              {/* Status details metadata links footer */}
              <div className="mt-5 border-t border-stone-200 pt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold">
                <div className="flex items-center space-x-1.5">
                  <span className="text-stone-400">Spreadsheet DB:</span>
                  <a href="https://docs.google.com/spreadsheets/d/1__k-dTt9oxBZSKKp9wI2O42l8QiBpqy0O9dwZK1jyqQ/edit" target="_blank" rel="noreferrer" className="text-teal-800 font-mono hover:underline">1__k-dTt9oxBZSK...</a>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-stone-400">Media Drive Folder:</span>
                  <a href="https://drive.google.com/drive/folders/1QCR6qJqsadN2y_PesOBr2uFZfZRZrvDd" target="_blank" rel="noreferrer" className="text-teal-800 font-mono hover:underline">1QCR6qJqsadN2y_...</a>
                </div>
                <div className="flex items-center space-x-1.5 sm:ml-auto">
                  <span className="text-stone-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] bg-emerald-100 text-emerald-800`}>
                    ACTIVE SYNC
                  </span>
                </div>
              </div>
            </div>

            <AdminPanel 
              projects={projects}
              leads={leads}
              lang={lang}
              onAddProject={handleAddProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onUpdateLeadStatus={handleUpdateLeadStatus}
            />
          </motion.div>
        )}

        </AnimatePresence>
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
      <footer className="border-t border-[#ebdcb9] bg-[#1c1917] py-12 text-center text-xs font-bold text-stone-300">
        <p className="px-4 leading-relaxed max-w-3xl mx-auto">
          {t.footerMessage}
        </p>
        <p className="mt-3.5 text-[10px] text-brand-gold font-mono tracking-widest uppercase">
          {t.currencyText}
        </p>
      </footer>

    </div>
  );
}
