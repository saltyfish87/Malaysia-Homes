/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, GitCompare, HelpCircle, FileText, Settings, Sparkles, Heart, Building, Map, Globe, ChevronDown, Check } from 'lucide-react';
import { CurrencyCode, CurrencyConfig } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { CURRENCIES } from '../constants/mockData';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  lang: 'en' | 'zh';
  setLang: (lang: 'en' | 'zh') => void;
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  favoritesCount: number;
  openQuestionnaire: () => void;
  syncStatus?: 'syncing' | 'synced' | 'fallback' | 'error';
}

export default function Header({
  currentTab,
  setTab,
  lang,
  setLang,
  currency,
  setCurrency,
  favoritesCount,
  openQuestionnaire,
  syncStatus = 'fallback'
}: HeaderProps) {
  const t = TRANSLATIONS[lang];
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ebdcb9]/40 bg-[#FDFBF7]/80 backdrop-blur-xl transition-all shadow-[0_2px_20px_-10px_rgba(139,115,85,0.06)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-2 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setTab('home')} 
          className="flex cursor-pointer items-center space-x-2 md:space-x-3.5 shrink-0 select-none"
          id="header-brand-logo"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 bg-stone-900 rounded-lg flex items-center justify-center transition-transform hover:scale-105 shrink-0">
            <div className="w-4.5 h-4.5 md:w-5 md:h-5 border-2 border-brand-gold rotate-45"></div>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm md:text-xl font-black tracking-tight text-stone-900 uppercase leading-none">
                <span className="inline md:hidden">M<span className="text-brand-gold">H</span></span>
                <span className="hidden md:inline">Malaysian<span className="text-brand-gold">Homes</span></span>
              </span>
              {syncStatus === 'synced' && (
                <span className="flex h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-500/50 animate-pulse" title="Google Sheet Live Connected"></span>
              )}
              {syncStatus === 'syncing' && (
                <span className="flex h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-amber-500 animate-pulse" title="Live Synced in Progress..."></span>
              )}
            </div>
            <div className="hidden text-[9px] font-black uppercase tracking-wider text-stone-500 md:block mt-1">
              Premium Property Portal
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 relative shrink-0" id="header-nav-menu">
          {[
            { id: 'home', label: t.navHome, icon: Compass },
            { id: 'residences', label: t.navProjects, icon: Building },
            { id: 'map', label: t.navMap, icon: Map },
            { id: 'compare', label: t.navCompare, icon: GitCompare },
            { id: 'guide', label: t.navGuide, icon: FileText },
            { id: 'favorites', label: t.favoritesTitle, icon: Heart, count: favoritesCount }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`relative flex items-center space-x-1.5 rounded-full px-4 py-2 font-display text-sm font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[#1c1917] rounded-full -z-10 shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`h-4 w-4 ${item.id === 'favorites' && favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{item.label}</span>
                {item.id === 'favorites' && favoritesCount > 0 && (
                  <span className="ml-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white animate-pulse">
                    {favoritesCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Toolbar */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0 z-50 flex-nowrap" id="header-tools-toolbar">
          
          {/* Smart Match AI Button */}
          <button
            onClick={openQuestionnaire}
            className="hidden md:flex items-center space-x-1.5 rounded-full bg-brand-gold px-4 py-1.5 font-display text-xs font-bold text-white shadow-xs hover:bg-brand-gold-hover transition-all hover:scale-[1.03] cursor-pointer shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.smartQuestionnaire}</span>
          </button>

          {/* Unified Settings Dropdown Menu */}
          <div className="relative shrink-0 z-50" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(!isSettingsOpen);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs select-none ${
                isSettingsOpen
                  ? 'border-brand-gold bg-amber-50/50 text-stone-900'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300'
              }`}
              id="header-settings-dropdown-trigger"
            >
              <Globe className="h-3.5 w-3.5 text-brand-gold" />
              <span>{lang === 'en' ? 'EN' : '中文'}</span>
              <span className="text-stone-300">•</span>
              <span>{currency}</span>
              <ChevronDown className={`h-3 w-3 text-stone-400 transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSettingsOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#ebdcb9] shadow-xl py-3 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                id="header-settings-dropdown-menu"
              >
                {/* Title */}
                <div className="px-2 pb-2 mb-2 border-b border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                    {lang === 'en' ? 'Investor Settings' : '投资偏好设置'}
                  </span>
                  <span className="text-[9px] font-black text-brand-gold bg-amber-50 px-1.5 py-0.5 rounded">
                    {lang === 'en' ? 'Active' : '已启用'}
                  </span>
                </div>

                {/* Section: Language */}
                <div className="mb-3">
                  <div className="px-2 mb-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    {lang === 'en' ? 'Language / 语言' : '语言切换'}
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLang('en');
                      }}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                        lang === 'en'
                          ? 'bg-amber-50/50 text-stone-900 font-extrabold'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>🇬🇧</span>
                        <span>English</span>
                      </span>
                      {lang === 'en' && <Check className="h-3.5 w-3.5 text-brand-gold shrink-0" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLang('zh');
                      }}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                        lang === 'zh'
                          ? 'bg-amber-50/50 text-stone-900 font-extrabold'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>🇨🇳</span>
                        <span>简体中文</span>
                      </span>
                      {lang === 'zh' && <Check className="h-3.5 w-3.5 text-brand-gold shrink-0" />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-stone-100 my-2"></div>

                {/* Section: Currency */}
                <div>
                  <div className="px-2 mb-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    {lang === 'en' ? 'Currency / 货币' : '显示货币'}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CURRENCIES.map((curr) => {
                      const isSelected = currency === curr.code;
                      let label = '';
                      if (curr.code === 'MYR') label = lang === 'en' ? 'Malaysian Ringgit' : '马来西亚林吉特';
                      else if (curr.code === 'USD') label = lang === 'en' ? 'US Dollar' : '美元';
                      else if (curr.code === 'SGD') label = lang === 'en' ? 'Singapore Dollar' : '新加坡元';
                      else if (curr.code === 'CNY') label = lang === 'en' ? 'Chinese Yuan' : '人民币';

                      return (
                        <button
                          key={curr.code}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrency(curr.code);
                          }}
                          className={`flex flex-col items-start justify-center rounded-lg p-2 text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50/50 border-brand-gold text-stone-900'
                              : 'border-stone-100 hover:bg-stone-50 text-stone-600'
                          }`}
                          title={label}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-black">{curr.code}</span>
                            <span className="text-[10px] text-stone-400 font-bold">{curr.symbol}</span>
                          </div>
                          <span className="text-[8px] text-stone-400 truncate w-full mt-0.5">
                            {curr.code === 'MYR' ? (lang === 'en' ? 'Base Rate' : '基准汇率') : `1 MYR = ${curr.rate} ${curr.code}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cloud Sync Database Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTab('admin');
            }}
            className={`hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer shrink-0 z-50 ${
              currentTab === 'admin'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
            title="Workspace live sync database"
          >
            <Settings className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          </button>

          {/* Phone Quick CTA */}
          <a
            href="tel:0195598932"
            className="hidden md:block text-xs font-extrabold text-stone-700 hover:text-brand-gold transition-colors"
          >
            📞 019-5598932
          </a>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex lg:hidden justify-around border-t border-stone-200 bg-[#FDFBF7]/95 px-2 py-2.5" id="header-mobile-menu">
        <button
          onClick={() => setTab('home')}
          className={`flex flex-col items-center text-[10px] font-bold transition-colors cursor-pointer ${
            currentTab === 'home' ? 'text-brand-gold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Compass className="h-4 w-4 mb-1" />
          <span>{t.navHome}</span>
        </button>
        <button
          onClick={() => setTab('residences')}
          className={`flex flex-col items-center text-[10px] font-bold transition-colors cursor-pointer ${
            currentTab === 'residences' ? 'text-brand-gold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Building className="h-4 w-4 mb-1" />
          <span>{t.navProjects}</span>
        </button>
        <button
          onClick={() => setTab('map')}
          className={`flex flex-col items-center text-[10px] font-bold transition-colors cursor-pointer ${
            currentTab === 'map' ? 'text-brand-gold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Map className="h-4 w-4 mb-1" />
          <span>{t.navMap}</span>
        </button>
        <button
          onClick={() => setTab('compare')}
          className={`relative flex flex-col items-center text-[10px] font-bold transition-colors cursor-pointer ${
            currentTab === 'compare' ? 'text-brand-gold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <GitCompare className="h-4 w-4 mb-1" />
          <span>{t.navCompare}</span>
        </button>
        <button
          onClick={() => setTab('guide')}
          className={`flex flex-col items-center text-[10px] font-bold transition-colors cursor-pointer ${
            currentTab === 'guide' ? 'text-brand-gold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <FileText className="h-4 w-4 mb-1" />
          <span>{t.navGuide}</span>
        </button>
        <button
          onClick={() => setTab('favorites')}
          className={`relative flex flex-col items-center text-[10px] font-bold transition-colors cursor-pointer ${
            currentTab === 'favorites' ? 'text-brand-gold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Heart className={`h-4 w-4 mb-1 ${favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{t.favoritesTitle}</span>
          {favoritesCount > 0 && (
            <span className="absolute top-0 right-3 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
              {favoritesCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
