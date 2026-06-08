/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
}

export default function Header({
  currentTab,
  setTab,
  lang,
  setLang,
  currency,
  setCurrency,
  favoritesCount,
  openQuestionnaire
}: HeaderProps) {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setTab('home')} 
          className="flex cursor-pointer items-center space-x-3.5"
          id="header-brand-logo"
        >
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center transition-transform hover:scale-105 shrink-0">
            <div className="w-5 h-5 border-2 border-brand-gold rotate-45"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 uppercase dark:text-white">
              Malaysian<span className="text-brand-gold">Homes</span>
            </span>
            <div className="hidden text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:block">
              Premium Property Portal
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="hidden lg:flex items-center space-x-1" id="header-nav-menu">
          <button
            onClick={() => setTab('home')}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 font-display text-sm font-medium transition-all ${
              currentTab === 'home'
                ? 'bg-slate-900 text-white dark:bg-brand-gold dark:text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>{t.navHome}</span>
          </button>

          <button
            onClick={() => setTab('residences')}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 font-display text-sm font-medium transition-all ${
              currentTab === 'residences'
                ? 'bg-slate-900 text-white dark:bg-brand-gold dark:text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>{t.navProjects}</span>
          </button>

          <button
            onClick={() => setTab('map')}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 font-display text-sm font-medium transition-all ${
              currentTab === 'map'
                ? 'bg-slate-900 text-white dark:bg-brand-gold dark:text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <Map className="h-4 w-4" />
            <span>{t.navMap}</span>
          </button>

          <button
            onClick={() => setTab('compare')}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 font-display text-sm font-medium transition-all ${
              currentTab === 'compare'
                ? 'bg-slate-900 text-white dark:bg-brand-gold dark:text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <GitCompare className="h-4 w-4" />
            <span>{t.navCompare}</span>
          </button>

          <button
            onClick={() => setTab('guide')}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 font-display text-sm font-medium transition-all ${
              currentTab === 'guide'
                ? 'bg-slate-900 text-white dark:bg-brand-gold dark:text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{t.navGuide}</span>
          </button>

          <button
            onClick={() => setTab('favorites')}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 font-display text-sm font-medium transition-all ${
              currentTab === 'favorites'
                ? 'bg-slate-900 text-white dark:bg-brand-gold dark:text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative flex items-center space-x-1">
              <Heart className={`h-4 w-4 ${favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{t.favoritesTitle}</span>
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-3.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white animate-pulse">
                  {favoritesCount}
                </span>
              )}
            </div>
          </button>
        </nav>

        {/* Global Toolbar */}
        <div className="flex items-center space-x-3" id="header-tools-toolbar">
          
          {/* Smart Match AI Button */}
          <button
            onClick={openQuestionnaire}
            className="hidden sm:flex items-center space-x-1.5 rounded-full bg-brand-gold px-4 py-1.5 font-display text-xs font-semibold text-white shadow-xs hover:bg-brand-gold-hover transition-all hover:scale-[1.03]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.smartQuestionnaire}</span>
          </button>

          {/* Currency Dropdown Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                onClick={() => setCurrency(curr.code)}
                className={`rounded px-2.5 py-1 text-xs font-bold transition-all ${
                  currency === curr.code
                    ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {curr.code}
              </button>
            ))}
          </div>

          {/* Language Switcher Buttons */}
          <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80"
            title="Switch Language"
          >
            {lang === 'en' ? 'ZH' : 'EN'}
          </button>

          {/* Phone Quick CTA */}
          <a
            href="tel:0195598932"
            className="hidden md:block text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-brand-gold transition-colors"
          >
            📞 019-5598932
          </a>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex lg:hidden justify-around border-t border-slate-100 bg-white/95 px-2 py-2.5 dark:border-slate-900 dark:bg-slate-950/95">
        <button
          onClick={() => setTab('home')}
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            currentTab === 'home' ? 'text-brand-gold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Compass className="h-4 w-4 mb-1" />
          <span>{t.navHome}</span>
        </button>
        <button
          onClick={() => setTab('residences')}
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            currentTab === 'residences' ? 'text-brand-gold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Building className="h-4 w-4 mb-1" />
          <span>{t.navProjects}</span>
        </button>
        <button
          onClick={() => setTab('map')}
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            currentTab === 'map' ? 'text-brand-gold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Map className="h-4 w-4 mb-1" />
          <span>{t.navMap}</span>
        </button>
        <button
          onClick={() => setTab('compare')}
          className={`relative flex flex-col items-center text-[10px] font-semibold transition-colors ${
            currentTab === 'compare' ? 'text-brand-gold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <GitCompare className="h-4 w-4 mb-1" />
          <span>{t.navCompare}</span>
        </button>
        <button
          onClick={() => setTab('guide')}
          className={`flex flex-col items-center text-[10px] font-semibold transition-colors ${
            currentTab === 'guide' ? 'text-brand-gold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="h-4 w-4 mb-1" />
          <span>{t.navGuide}</span>
        </button>
        <button
          onClick={() => setTab('favorites')}
          className={`relative flex flex-col items-center text-[10px] font-semibold transition-colors ${
            currentTab === 'favorites' ? 'text-brand-gold' : 'text-slate-400 hover:text-slate-600'
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
