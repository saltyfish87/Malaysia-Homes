/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { FAQItem } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { MOCK_FAQS } from '../constants/mockData';

interface FAQSectionProps {
  lang: 'en' | 'zh';
  faqs?: FAQItem[];
}

export default function FAQSection({ lang, faqs = MOCK_FAQS }: FAQSectionProps) {
  const t = TRANSLATIONS[lang];
  const [openId, setOpenId] = useState<string | null>('faq-foreigner');
  const [searchText, setSearchText] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const raw = faqs.map((f) => f.category);
    return ['All', ...Array.from(new Set(raw))];
  }, [faqs]);

  // Filters FAQ matching Category and Text
  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const catMatch = activeCategory === 'All' || f.category === activeCategory;
      const textMatch = 
        f.question.toLowerCase().includes(searchText.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchText.toLowerCase());
      return catMatch && textMatch;
    });
  }, [faqs, activeCategory, searchText]);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-left" id="faq-accordions-deck">
      
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="font-display text-2.5xl font-black text-slate-900 tracking-tight dark:text-white">
          {t.faqTitle}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 dark:text-slate-400">
          {t.faqSub}
        </p>
      </div>

      {/* Accordion toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={lang === 'en' ? 'Search 置业 FAQ...' : '搜索常见置业百科...'}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-semibold focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Categories Tab list */}
        <div className="flex flex-wrap gap-1 w-full sm:w-auto justify-start sm:justify-end">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion item rendering */}
      {filteredFaqs.length === 0 ? (
        <p className="text-center text-xs font-bold text-slate-400 py-10">
          {lang === 'en' ? 'No answering Accordion matched.' : '未搜索到匹配的解答条目。'}
        </p>
      ) : (
        <div className="space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-slate-200 bg-white/50 shadow-xs transition-colors dark:border-slate-850 dark:bg-slate-900/60"
                id={`faq-item-collapsible-${faq.id}`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
                >
                  <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-amber-500 transition-colors">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-amber-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 p-4 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                      {faq.answer}
                    </p>
                    <span className="mt-2 text-[9px] font-extrabold uppercase tracking-widest text-slate-350 dark:text-slate-500 bg-slate-100 dark:bg-slate-950 px-2.5 py-0.5 rounded-full inline-block">
                      ★ {faq.category}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
