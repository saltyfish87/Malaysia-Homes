/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, GitCompare, CheckSquare } from 'lucide-react';
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
      className="fixed bottom-0 right-0 left-0 z-40 bg-[#FDFBF7]/95 text-stone-900 border-t border-[#ebdcb9] shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom duration-300"
      id="floating-compare-drawer"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          
          {/* Status Label */}
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white animate-pulse">
              <GitCompare className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-sm font-black text-stone-900">
                {lang === 'en' ? 'Property Comparison Queue' : '房产对比栏'}
              </p>
              <p className="text-[10px] text-stone-500 font-bold">
                {comparedProjects.length} {lang === 'en' ? 'of 3 active slots occupied.' : '/ 3 选定对比栏槽位。'}
              </p>
            </div>
          </div>

          {/* Active Thumbnails List */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {comparedProjects.map((proj) => (
              <div 
                key={proj.id}
                className="relative flex items-center space-x-2 rounded-lg bg-white border border-[#ebdcb9] p-2 pr-7.5"
                id={`drawer-item-${proj.id}`}
              >
                <img 
                  src={proj.image || undefined} 
                  alt={proj.name}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-md object-cover"
                />
                <div className="max-w-[120px] text-left">
                  <p className="truncate text-xs font-bold text-stone-900">{proj.name}</p>
                  <p className="text-[9px] font-bold text-stone-500">{proj.area}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(proj)}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-850 cursor-pointer"
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
                className="hidden sm:flex h-12 w-32 items-center justify-center rounded-lg border-2 border-dashed border-stone-200 bg-stone-50/50 text-[10px] font-black text-stone-400"
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
              className={`flex items-center space-x-1.5 rounded-xl px-5 py-2.5 font-display text-xs font-black shadow-xs transition-all ${
                comparedProjects.length >= 2
                  ? 'bg-stone-900 text-white hover:bg-stone-800 cursor-pointer hover:scale-[1.02]'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
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
