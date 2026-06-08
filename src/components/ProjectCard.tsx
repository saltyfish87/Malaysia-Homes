/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Heart, Plus, Minus, ArrowRight, Sparkles, Building2, CheckSquare } from 'lucide-react';
import { Project, CurrencyCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { CURRENCIES } from '../constants/mockData';

interface ProjectCardProps {
  key?: React.Key;
  project: Project;
  currency: CurrencyCode;
  lang: 'en' | 'zh';
  isFavorite: boolean;
  isCompared: boolean;
  onToggleFavorite: () => void;
  onToggleCompare: () => void;
  onViewDetails: () => void;
}

export function formatPrice(value: number, currencyCode: CurrencyCode): string {
  const cfg = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const converted = value * cfg.rate;
  
  if (converted >= 1000000) {
    return `${cfg.symbol} ${(converted / 1000000).toFixed(2)}M`;
  }
  return `${cfg.symbol} ${Math.round(converted).toLocaleString()}`;
}

export default function ProjectCard({
  project,
  currency,
  lang,
  isFavorite,
  isCompared,
  onToggleFavorite,
  onToggleCompare,
  onViewDetails
}: ProjectCardProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-lg hover:border-brand-gold/40 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800/80 dark:hover:border-brand-gold/30"
      id={`project-card-${project.id}`}
    >
      {/* Property Image Overlay */}
      <div className="relative h-56 w-full overflow-hidden">
        <img 
          src={project.image} 
          alt={project.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 scale-100 group-hover:scale-[1.05]"
        />

        {/* Freehold / Leasehold Tag */}
        <span className="absolute top-3.5 left-3.5 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
          {project.tenure === 'Freehold' 
            ? (lang === 'en' ? 'Freehold' : '永久产权') 
            : (lang === 'en' ? 'Leasehold' : '99年产权')}
        </span>

        {/* Dynamic Badge highlighting high investment scoring properties */}
        {project.featured && (
          <span className="absolute top-3.5 left-[105px] flex items-center space-x-1 rounded-lg bg-brand-gold px-2.5 py-1 text-[10px] font-extrabold text-white uppercase tracking-widest shadow-sm">
            <Sparkles className="h-3 w-3" />
            <span>{t.featuredTag}</span>
          </span>
        )}

        {/* Favorite Heart Trigger */}
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute top-3.5 right-3.5 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 dark:bg-slate-900/90"
          id={`favorite-btn-${project.id}`}
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-500 dark:text-slate-500'
          }`} />
        </button>

        {/* Area tag pill overlay */}
        <div className="absolute bottom-3.5 left-3.5 rounded-lg bg-brand-gold/90 text-white text-[10px] font-extrabold px-2 py-0.5 shadow-sm uppercase tracking-wider backdrop-blur-xs">
          ★ {project.propertyType}
        </div>
      </div>

      {/* Main Metadata Section */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Developer Title */}
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center space-x-1">
          <Building2 className="h-3 w-3 inline text-brand-gold/80" />
          <span>{project.developer}</span>
        </span>

        {/* Project Name */}
        <h4 
          onClick={onViewDetails} 
          className="mt-1 flex-1 font-display text-base font-extrabold text-slate-900 hover:text-brand-gold dark:text-white transition-colors cursor-pointer"
        >
          {project.name}
        </h4>

        {/* Location Row */}
        <div className="mt-2.5 flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          <MapPin className="mr-1 h-3.5 w-3.5 text-brand-gold" />
          <span>{project.area}, {project.state}</span>
        </div>

        {/* Key highlight text snippet */}
        <p className="mt-3 text-xs text-slate-400 line-clamp-2 dark:text-slate-500">
          {project.keyHighlights[0]}
        </p>

        {/* Stats specifications summary rule */}
        <div className="mt-4 flex items-center justify-between border-t border-b border-slate-100 py-3 text-[11px] font-bold text-slate-400 dark:border-slate-800/80">
          <div>
            <span className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {project.bedrooms} / {project.bathrooms}
            </span>
            <span>Bed / Bath</span>
          </div>
          <div className="border-l border-slate-100 h-6 dark:border-slate-800" />
          <div>
            <span className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {project.builtUpMin} - {project.builtUpMax}
            </span>
            <span>sqft</span>
          </div>
          <div className="border-l border-slate-100 h-6 dark:border-slate-800" />
          <div>
            <span className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {project.completionYear}
            </span>
            <span>Completion</span>
          </div>
        </div>

        {/* CTA Buying trigger bar */}
        <div className="mt-4.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Starting Price' : '臻选起价'}
            </span>
            <div className="font-mono text-base font-extrabold text-brand-gold">
              {formatPrice(project.priceMin, currency)}
            </div>
          </div>

          {/* Compare Selector & Details CTA Column */}
          <div className="flex items-center space-x-2">
            
            {/* Compare Checkbox Trigger */}
            <button
              type="button"
              onClick={onToggleCompare}
              className={`flex h-8.5 items-center space-x-1 rounded-lg px-2.5 text-xs font-bold transition-all ${
                isCompared 
                  ? 'bg-brand-gold/10 border border-brand-gold/30 text-brand-gold dark:bg-brand-gold/15 dark:border-brand-gold/40 dark:text-brand-gold' 
                  : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <CheckSquare className={`h-3.5 w-3.5 ${isCompared ? 'fill-brand-gold text-brand-gold dark:fill-transparent' : ''}`} />
              <span>{t.compareButton}</span>
            </button>

            {/* View Project Details CTA */}
            <button
              onClick={onViewDetails}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-brand-gold dark:text-slate-950 dark:hover:bg-brand-gold-hover transition-colors"
              title="View Complete Project Landing Page"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
