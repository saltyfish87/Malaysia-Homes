/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, GitCompare, LayoutGrid, CheckSquare } from 'lucide-react';
import { Project } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface CompareDrawerProps {
  comparedProjects: Project[];
  onRemove: (project: Project) => void;
  onCompareNow: () => void;
  lang: 'en' | 'zh';
}

export default function CompareDrawer({
  comparedProjects,
  onRemove,
  onCompareNow,
  lang
}: CompareDrawerProps) {
  const t = TRANSLATIONS[lang];

  if (comparedProjects.length === 0) return null;

  return (
    <div 
      className="fixed bottom-0 right-0 left-0 z-40 bg-slate-900/95 text-white border-t border-slate-800 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom duration-300"
      id="floating-compare-drawer"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          
          {/* Status Label */}
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold text-white animate-pulse">
              <GitCompare className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold">
                {lang === 'en' ? 'Property Comparison Queue' : '房产对比栏'}
              </p>
              <p className="text-[10px] text-slate-400">
                {comparedProjects.length} {lang === 'en' ? 'of 3 active slots occupied.' : '/ 3 选定对比栏槽位。'}
              </p>
            </div>
          </div>

          {/* Active Thumbnails List */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {comparedProjects.map((proj) => (
              <div 
                key={proj.id}
                className="relative flex items-center space-x-2 rounded-lg bg-slate-800/80 border border-slate-700/50 p-2 pr-7.5"
                id={`drawer-item-${proj.id}`}
              >
                <img 
                  src={proj.image} 
                  alt={proj.name}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-md object-cover"
                />
                <div className="max-w-[120px] text-left">
                  <p className="truncate text-xs font-semibold text-slate-100">{proj.name}</p>
                  <p className="text-[9px] font-medium text-slate-400">{proj.area}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(proj)}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-700 hover:text-white"
                  title="Remove from comparison queue"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
              <div 
                key={idx}
                className="hidden sm:flex h-12 w-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/30 text-[10px] font-bold text-slate-600"
              >
                + Empty Slot
              </div>
            ))}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onCompareNow}
              disabled={comparedProjects.length < 2}
              className={`flex items-center space-x-1.5 rounded-xl px-5 py-2.5 font-display text-xs font-extrabold shadow-sm transition-all ${
                comparedProjects.length >= 2
                  ? 'bg-brand-gold text-white hover:bg-brand-gold-hover cursor-pointer hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckSquare className="h-4 w-4" />
              <span>{lang === 'en' ? 'Compare Now' : '立即对比'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
