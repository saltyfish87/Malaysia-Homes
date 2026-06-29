/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Heart, ArrowRight, Sparkles, Building2, CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';
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
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-[#ebdcb9] shadow-xs hover:shadow-lg hover:border-teal-700/60 transition-all duration-500"
      id={`project-card-${project.id}`}
    >
      {/* Property Image Overlay */}
      <div className="relative h-56 w-full overflow-hidden">
        <img 
          src={project.image || undefined} 
          alt={project.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 scale-100 group-hover:scale-[1.06] brightness-95 group-hover:brightness-100"
        />

        {/* Freehold / Leasehold Tag */}
        <span className="absolute top-3.5 left-3.5 rounded-lg bg-stone-900/95 px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-xs border border-stone-850">
          {project.tenure === 'Freehold' 
            ? (lang === 'en' ? 'Freehold' : '永久产权') 
            : (lang === 'en' ? 'Leasehold' : '99年产权')}
        </span>

        {/* Dynamic Badge highlighting high investment scoring properties */}
        {project.featured && (
          <span className="absolute top-3.5 left-[105px] flex items-center space-x-1 rounded-lg bg-teal-800 px-2.5 py-1 text-[10px] font-extrabold text-white uppercase tracking-widest shadow-lg border border-teal-600/30">
            <Sparkles className="h-3 w-3 text-teal-200" />
            <span>{t.featuredTag}</span>
          </span>
        )}

        {/* Favorite Heart Trigger */}
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute top-3.5 right-3.5 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-white/95 border border-stone-200 shadow-md backdrop-blur-xs transition-transform hover:scale-110 active:scale-95"
          id={`favorite-btn-${project.id}`}
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${
            isFavorite ? 'fill-amber-500 text-amber-500' : 'text-stone-400 hover:text-amber-500'
          }`} />
        </button>

        {/* Area tag pill overlay */}
        <div className="absolute bottom-3.5 left-3.5 rounded-lg bg-amber-500/90 text-white text-[10px] font-extrabold px-2 py-0.5 shadow-sm uppercase tracking-wider backdrop-blur-xs border border-amber-400/20">
          ★ {project.propertyType}
        </div>
      </div>

      {/* Main Metadata Section */}
      <div className="flex flex-1 flex-col p-5 bg-[#FAF8F5]">
        
        {/* Developer Title */}
        <span className="text-[10px] font-black uppercase tracking-widest text-teal-800 flex items-center space-x-1">
          <Building2 className="h-3 w-3 inline text-teal-850" />
          <span>{project.developer}</span>
        </span>

        {/* Project Name */}
        <h4 
          onClick={onViewDetails} 
          className="mt-1 flex-1 font-display text-base font-black text-stone-900 hover:text-teal-700 transition-colors cursor-pointer tracking-tight"
        >
          {project.name}
        </h4>

        {/* Location Row */}
        <div className="mt-2.5 flex items-center text-xs font-bold text-stone-500">
          <MapPin className="mr-1 h-3.5 w-3.5 text-teal-700" />
          <span>{project.area}, {project.state}</span>
        </div>

        {/* Key highlight text snippet */}
        <p className="mt-3 text-xs text-stone-600 font-bold line-clamp-2">
          {project.keyHighlights[0]}
        </p>

        {/* Stats specifications summary rule */}
        <div className="mt-4 flex items-center justify-between border-t border-b border-stone-200 py-3 text-[11px] font-bold text-stone-500">
          <div>
            <span className="block text-xs font-mono font-black text-stone-900">
              {project.bedrooms} / {project.bathrooms}
            </span>
            <span>Bed / Bath</span>
          </div>
          <div className="border-l border-stone-200 h-6" />
          <div>
            <span className="block text-xs font-mono font-black text-stone-900">
              {project.builtUpMin} - {project.builtUpMax}
            </span>
            <span>sqft</span>
          </div>
          <div className="border-l border-stone-200 h-6" />
          <div>
            <span className="block text-xs font-mono font-black text-stone-900">
              {project.completionYear}
            </span>
            <span>Completion</span>
          </div>
        </div>

        {/* CTA Buying trigger bar */}
        <div className="mt-4.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
              {lang === 'en' ? 'Starting Price' : '臻选起价'}
            </span>
            <div className="font-mono text-base font-black text-teal-800">
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
                  ? 'bg-teal-50 border border-teal-300 text-teal-750' 
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <CheckSquare className={`h-3.5 w-3.5 ${isCompared ? 'text-teal-700' : ''}`} />
              <span>{t.compareButton}</span>
            </button>

            {/* View Project Details CTA */}
            <button
              onClick={onViewDetails}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors"
              title="View Complete Project Landing Page"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
