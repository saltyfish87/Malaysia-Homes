/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GitCompare, Trash2, Sparkles, MapPin } from 'lucide-react';
import { Project, CurrencyCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { formatPrice } from './ProjectCard';

interface CompareSectionProps {
  comparedProjects: Project[];
  allProjects?: Project[];
  onAddProject?: (proj: Project) => void;
  currency: CurrencyCode;
  lang: 'en' | 'zh';
  onRemoveProject: (proj: Project) => void;
  onClearAll: () => void;
  onSelectProject: (proj: Project) => void;
}

export default function CompareSection({
  comparedProjects,
  allProjects = [],
  onAddProject,
  currency,
  lang,
  onRemoveProject,
  onClearAll,
  onSelectProject
}: CompareSectionProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left animate-in fade-in duration-300" id="comparison-deck-main">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-black text-stone-900">
            {t.compareTitle}
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-bold">
            {t.compareSub}
          </p>
        </div>

        {comparedProjects.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-black text-red-650 bg-red-50 px-3.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer hover:bg-red-100"
          >
            {lang === 'en' ? 'Clear Comparison Slate' : '清空一览表'}
          </button>
        )}
      </div>

      {/* Project Selector for comparison */}
      {allProjects && allProjects.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl border border-[#ebdcb9] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-0.5 text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-teal-750 flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-teal-700 animate-pulse"></span>
              <span>{lang === 'en' ? 'Quick Compare Selector' : '快捷对比选择'}</span>
            </h3>
            <p className="text-xs text-stone-500 font-bold">
              {lang === 'en'
                ? `Analyze specifications side-by-side. Choose up to 3 projects to compare.`
                : `并排对比楼盘数据。选择最多 3 个项目加入对比面板。`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <select
                className="w-full sm:w-80 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-900 shadow-xs focus:border-teal-700 focus:outline-hidden"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && onAddProject) {
                    const match = allProjects.find(p => p.id === val);
                    if (match) {
                      onAddProject(match);
                    }
                  }
                  e.target.value = ''; // Reset select state
                }}
                defaultValue=""
              >
                <option value="" disabled className="text-stone-400">
                  {lang === 'en' ? 'Select property to compare...' : '选择物业加入对比...'}
                </option>
                {allProjects.map((p) => {
                  const isCompared = comparedProjects.some((cp) => cp.id === p.id);
                  return (
                    <option 
                      key={p.id} 
                      value={p.id} 
                      disabled={isCompared || comparedProjects.length >= 3}
                    >
                      {p.name} {isCompared ? (lang === 'en' ? '(Already added)' : '(已添加)') : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            
            {comparedProjects.length >= 3 && (
              <span className="text-[11px] font-bold text-red-500 self-center leading-none">
                {lang === 'en' ? 'Limit of 3 projects reached' : '对比项已达 3 个上限'}
              </span>
            )}
          </div>
        </div>
      )}

      {comparedProjects.length === 0 ? (
        <div className="mx-auto max-w-2xl text-center py-16 px-4 rounded-3xl border border-dashed border-[#ebdcb9] bg-[#FAF8F5] mt-4" id="empty-comparison-placeholder">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <GitCompare className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-lg font-black text-stone-900">
            {lang === 'en' ? 'Your Comparison Deck is Empty' : '对比空置'}
          </h3>
          <p className="mt-2 text-xs text-stone-500 leading-normal max-w-md mx-auto font-bold">
            {lang === 'en' 
              ? 'Select up to 3 projects from the home catalog or choose from the dropdown selector above to trigger deep spec analytics.' 
              : '在上面的下拉选择器中挑选，或在楼盘卡片上勾选“对比”复选框，即可启动核心参数深度并排评估。'}
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-2xl border border-[#ebdcb9] bg-white shadow-xl">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              {/* Properties Hero Cards row header */}
              <tr className="border-b border-stone-100">
                <th className="w-1/4 p-5 text-xs font-black text-stone-500 uppercase tracking-widest bg-stone-50">
                  Project Spec Key
                </th>
              {comparedProjects.map((proj) => (
                <th key={proj.id} className="w-1/4 p-5 text-left border-l border-stone-200 relative group">
                  <div className="space-y-2">
                    <img 
                      src={proj.image || undefined} 
                      alt={proj.name}
                      referrerPolicy="no-referrer"
                      className="h-28 w-full rounded-xl object-cover"
                    />
                    <h4 
                      onClick={() => onSelectProject(proj)}
                      className="font-display text-sm font-black text-stone-900 hover:text-teal-750 transition-colors cursor-pointer"
                    >
                      {proj.name}
                    </h4>
                    <p className="text-[10px] text-stone-500 font-extrabold uppercase">{proj.developer}</p>
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
                <th key={idx} className="w-1/4 p-5 border-l border-stone-200 text-center text-xs font-bold text-stone-300">
                  + Add more
                </th>
              ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100 text-xs font-bold text-stone-700">
              
              {/* Start Price */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  {lang === 'en' ? 'Starting Dynamic Price' : '臻发起价 (约值)'}
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 font-mono text-sm font-black text-teal-750">
                    {formatPrice(proj.priceMin, currency)}
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Price Max */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  {lang === 'en' ? 'Ceiling Upper Cap' : '最高配置价 (顶配)'}
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 font-mono text-stone-700">
                    {formatPrice(proj.priceMax, currency)}
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Geographical Coordinates State */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  {lang === 'en' ? 'State Region' : '行政区域(州)'}
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-teal-750" />
                    <span>{proj.state}</span>
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Micro Area Name */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  {lang === 'en' ? 'Micro district Area' : '核心地段板块'}
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 text-stone-900 font-black">
                    {proj.area}
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Property Category Badge */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  {lang === 'en' ? 'Property Type' : '物业大类'}
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200">
                    <span className="bg-teal-700/10 text-teal-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {proj.propertyType}
                    </span>
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Investment Strength Score */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  {t.investmentAdvantage}
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200">
                    <div className="flex items-center space-x-1 font-mono text-sm font-black text-teal-750">
                      <Sparkles className="h-4 w-4" />
                      <span>★ {proj.investmentScore} / 10</span>
                    </div>
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Own Stay score */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  {t.ownStayComfort}
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200">
                    <div className="flex items-center space-x-1 font-mono text-sm font-bold text-stone-800">
                      <span>★ {proj.ownStayScore} / 10</span>
                    </div>
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Projected Rental Yields */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  {t.rentalYieldEst}
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 text-teal-750 font-black font-mono text-sm">
                    {proj.rentalYield.toFixed(1)}% p.a.
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Land tenure specs */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  {t.tenureTitle}
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 font-bold text-stone-800">
                    {proj.tenure}
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Airbnb Friendly status */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  Airbnb Friendly
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      proj.airbnbFriendly 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {proj.airbnbFriendly ? '✅ Allowed' : '限制'}
                    </span>
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Built-up Square feet sizing range */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  Built-Up Size
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 text-stone-700">
                    {proj.builtUpMin} - {proj.builtUpMax} sqft
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Furnishing condition */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  Furnishing Package
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 text-stone-700">
                    {proj.furnishing}
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Completion Year */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  Estimated Delivery
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 font-mono text-stone-700">
                    {proj.completionYear} (Target)
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Estimated monthly maintenance levy */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  Maintenance rate
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 text-stone-700">
                    RM {proj.maintenanceFee.toFixed(2)}/sqft
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* First highlights check specs */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900">
                  Key Premium Feature
                </td>
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200 text-[10px] font-bold text-stone-600 leading-relaxed">
                    {proj.keyHighlights[1] || proj.keyHighlights[0]}
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

              {/* Primary Action Button footer */}
              <tr>
                <td className="p-4 bg-stone-50 font-black text-stone-900" />
                {comparedProjects.map((proj) => (
                  <td key={proj.id} className="p-4 border-l border-stone-200">
                    <button
                      onClick={() => onSelectProject(proj)}
                      className="w-full text-center text-xs font-black bg-stone-900 border border-stone-850 text-white py-2.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      {t.bookViewing}
                    </button>
                  </td>
                ))}
                {Array.from({ length: 3 - comparedProjects.length }).map((_, idx) => (
                  <td key={idx} className="p-4 border-l border-stone-200" />
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
