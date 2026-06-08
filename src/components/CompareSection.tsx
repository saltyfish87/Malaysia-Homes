/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GitCompare, Trash2, ShieldAlert, Sparkles, MapPin, Building, Ruler, Percent, DollarSign, Calendar } from 'lucide-react';
import { Project, CurrencyCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { formatPrice } from './ProjectCard';

interface CompareSectionProps {
  comparedProjects: Project[];
  currency: CurrencyCode;
  lang: 'en' | 'zh';
  onRemoveProject: (proj: Project) => void;
  onClearAll: () => void;
  onSelectProject: (proj: Project) => void;
}

export default function CompareSection({
  comparedProjects,
  currency,
  lang,
  onRemoveProject,
  onClearAll,
  onSelectProject
}: CompareSectionProps) {
  const t = TRANSLATIONS[lang];

  if (comparedProjects.length === 0) {
    return (
      <div className="mx-auto max-w-2xl text-center py-16 px-4" id="empty-comparison-placeholder">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900/80">
          <GitCompare className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-slate-800 dark:text-white">
          {lang === 'en' ? 'Your Comparison Deck' : '对比空置'}
        </h3>
        <p className="mt-2 text-xs text-slate-500 leading-normal">
          {lang === 'en' 
            ? 'Select up to 3 projects from the home catalog by clicking the "Compare" checkbox on project cards to trigger deep spec analytics.' 
            : '在项目列表上勾选“对比”复选框，即可将该核心资产参数加入此看板，实时深度剖析核心硬件规格与租金流对比。'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left" id="comparison-deck-main">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">
            {t.compareTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.compareSub}
          </p>
        </div>

        {comparedProjects.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-red-500 hover:text-red-650 bg-red-50 dark:bg-red-950/20 px-3.5 py-1.5 rounded-lg active:scale-95 transition-all"
          >
            {lang === 'en' ? 'Clear Comparison Slate' : '清空一览表'}
          </button>
        )}
      </div>

      {comparedProjects.length < 2 && (
        <div className="mb-6 flex items-center space-x-2.5 rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4 text-xs font-bold text-brand-gold dark:border-brand-gold/20 dark:bg-brand-gold/10 dark:text-brand-gold">
          <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
          <span>{lang === 'en' ? 'Please add at least 1 more property project to calculate full side-by-side matrices.' : '请至少添加 2 个物业项目以实现完整的对比指标对照表。'}</span>
        </div>
      )}

      {/* MATRIX TABLE OF MULTIPLE PARAMS HEADER ROW */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            {/* Properties Hero Cards row header */}
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="w-1/4 p-5 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/20">
                Project Spec Key
              </th>
              {comparedProjects.map((proj) => (
                <th key={proj.id} className="w-1/4 p-5 text-left border-l border-slate-100 dark:border-slate-800 relative group">
                  <div className="space-y-2">
                    <img 
                      src={proj.image} 
                      alt={proj.name}
                      referrerPolicy="no-referrer"
                      className="h-28 w-full rounded-xl object-cover"
                    />
                    <h4 
                      onClick={() => onSelectProject(proj)}
                      className="font-display text-sm font-black text-slate-900 group-hover:text-brand-gold transition-colors cursor-pointer dark:text-white"
                    >
                      {proj.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{proj.developer}</p>
                    <button
                      onClick={() => onRemoveProject(proj)}
                      className="absolute top-2 right-2 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                      title="Eject listing from dashboard comparison"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
              ))}
              {/* Padding empty block if under 3 projects */}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <th key={idx} className="w-1/4 p-5 border-l border-slate-100 dark:border-slate-800 text-center text-xs font-bold text-slate-300">
                  + Add more
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-650 dark:divide-slate-800 dark:text-slate-350">
            
            {/* Start Price */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                {lang === 'en' ? 'Starting Dynamic Price' : '臻发起价 (约值)'}
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 font-mono text-sm font-black text-brand-gold dark:border-slate-800">
                  {formatPrice(proj.priceMin, currency)}
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Price Max */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                {lang === 'en' ? 'Ceiling Upper Cap' : '最高配置价 (顶配)'}
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 font-mono text-slate-700 dark:border-slate-800 dark:text-slate-300">
                  {formatPrice(proj.priceMax, currency)}
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Geographical Coordinates State */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                {lang === 'en' ? 'State Region' : '行政区域(州)'}
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800 flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                  <span>{proj.state}</span>
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Micro Area Name */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                {lang === 'en' ? 'Micro district Area' : '核心地段板块'}
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white font-extrabold">
                  {proj.area}
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Property Category Badge */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                {lang === 'en' ? 'Property Type' : '物业大类'}
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800">
                  <span className="bg-brand-gold/10 text-brand-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold dark:bg-brand-gold/15 dark:text-brand-gold">
                    {proj.propertyType}
                  </span>
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Investment Strength Score */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                {t.investmentAdvantage}
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1 font-mono text-sm font-black text-emerald-500">
                    <Sparkles className="h-4 w-4" />
                    <span>★ {proj.investmentScore} / 10</span>
                  </div>
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Own Stay score */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                {t.ownStayComfort}
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1 font-mono text-sm font-bold text-indigo-500">
                    <span>★ {proj.ownStayScore} / 10</span>
                  </div>
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Projected Rental Yields */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                {t.rentalYieldEst}
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-teal-600 font-extrabold font-mono text-sm">
                  {proj.rentalYield.toFixed(1)}% p.a.
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Land tenure specs */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                {t.tenureTitle}
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800 font-semibold text-slate-800 dark:text-white">
                  {proj.tenure}
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Airbnb Friendly status */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                Airbnb Friendly
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    proj.airbnbFriendly 
                      ? 'bg-green-150 text-green-700 dark:bg-green-950/30 dark:text-green-400' 
                      : 'bg-red-150 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                  }`}>
                    {proj.airbnbFriendly ? '✅ Allowed' : '⛔ Restricted'}
                  </span>
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Built-up Square feet sizing range */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                Built-Up Size
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-slate-705">
                  {proj.builtUpMin} - {proj.builtUpMax} sqft
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Furnishing condition */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                Furnishing Package
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800">
                  {proj.furnishing}
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Completion Year */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                Estimated Delivery
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800 font-mono">
                  {proj.completionYear} (Target)
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Estimated monthly maintenance levy */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                Maintenance rate
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800">
                  RM {proj.maintenanceFee.toFixed(2)}/sqft
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* First highlights check specs */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10">
                Key Premium Feature
              </td>
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-550 leading-relaxed text-slate-600 dark:text-slate-400">
                  {proj.keyHighlights[1] || proj.keyHighlights[0]}
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

            {/* Primary Action Button footer */}
            <tr>
              <td className="p-4 bg-slate-50/30 font-bold dark:bg-slate-950/10" />
              {comparedProjects.map((proj) => (
                <td key={proj.id} className="p-4 border-l border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onSelectProject(proj)}
                    className="w-full text-center text-xs font-bold bg-slate-900 border border-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors dark:bg-brand-gold dark:text-slate-950 dark:border-brand-gold/40 hover:dark:bg-brand-gold-hover"
                  >
                    {t.bookViewing}
                  </button>
                </td>
              ))}
              {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800" />
              ))}
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
}
