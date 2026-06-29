/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, GitCompare, HelpCircle, FileText, Settings, Sparkles, Heart, Building, Map } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ebdcb9]/40 bg-[#FDFBF7]/80 backdrop-blur-xl transition-all shadow-[0_2px_20px_-10px_rgba(139,115,85,0.06)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setTab('home')} 
          className="flex cursor-pointer items-center space-x-3.5"
          id="header-brand-logo"
        >
          <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center transition-transform hover:scale-105 shrink-0">
            <div className="w-5 h-5 border-2 border-brand-gold rotate-45"></div>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-black tracking-tight text-stone-900 uppercase leading-none">
                Malaysian<span className="text-brand-gold">Homes</span>
              </span>
              {syncStatus === 'synced' && (
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-500/50 animate-pulse" title="Google Sheet Live Connected"></span>
              )}
              {syncStatus === 'syncing' && (
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" title="Live Synced in Progress..."></span>
              )}
            </div>
            <div className="hidden text-[9px] font-black uppercase tracking-wider text-stone-500 sm:block mt-1">
              Premium Property Portal
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 relative" id="header-nav-menu">
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
        <div className="flex items-center space-x-3" id="header-tools-toolbar">
          
          {/* Smart Match AI Button */}
          <button
            onClick={openQuestionnaire}
            className="hidden sm:flex items-center space-x-1.5 rounded-full bg-brand-gold px-4 py-1.5 font-display text-xs font-bold text-white shadow-xs hover:bg-brand-gold-hover transition-all hover:scale-[1.03] cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.smartQuestionnaire}</span>
          </button>

          {/* Currency Dropdown Selector */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-lg p-0.5">
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                onClick={() => setCurrency(curr.code)}
                className={`rounded-md px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                  currency === curr.code
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {curr.code}
              </button>
            ))}
          </div>

          {/* Language Switcher Buttons */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-lg p-0.5" id="header-language-toggle-segmented">
            <button
              onClick={() => setLang('en')}
              className={`rounded-md px-2.5 py-1 text-[11px] font-black transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('zh')}
              className={`rounded-md px-2.5 py-1 text-[11px] font-black transition-all cursor-pointer ${
                lang === 'zh'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              中文
            </button>
          </div>

          {/* Cloud Sync Database Settings Button */}
          <button
            onClick={() => setTab('admin')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
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
      <div className="flex lg:hidden justify-around border-t border-stone-200 bg-[#FDFBF7]/95 px-2 py-2.5">
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
