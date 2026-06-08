/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, ChevronRight, X, ArrowUpRight, Search } from 'lucide-react';
import { Article } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { MOCK_ARTICLES } from '../constants/mockData';

interface BuyingGuideProps {
  lang: 'en' | 'zh';
  articles?: Article[];
}

export default function BuyingGuide({ lang, articles = MOCK_ARTICLES }: BuyingGuideProps) {
  const t = TRANSLATIONS[lang];
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Investment', 'Loan Tips', 'Foreign Buyer'];

  const filteredArticles = articles.filter((art) => {
    return selectedCategory === 'All' || art.category === selectedCategory;
  });

  // Timeline process steps helper mapped to language
  const timelineSteps = [
    {
      step: '01',
      title: lang === 'en' ? 'Search Projects' : '智选核心房源',
      desc: lang === 'en' ? 'Browse curated development directories with accurate developer price sheets.' : '浏览全马甄选精品豪宅，比对由开发商直接提供的一手底价指标。'
    },
    {
      step: '02',
      title: lang === 'en' ? 'Online Inquiry' : '在线提交咨询',
      desc: lang === 'en' ? 'Submit an online request to match high-frequency specifications or request PDF details.' : '勾选在线咨询或极速下载 PDF 项目白皮书，即刻自动接入CRM专线。'
    },
    {
      step: '03',
      title: lang === 'en' ? 'Professional Assignment' : '看房顾问对接',
      desc: lang === 'en' ? 'Get matched with a specialist real estate advisor with direct developer access.' : '专属中英双语金牌置业客服即时呼出，为您规划最优配置。'
    },
    {
      step: '04',
      title: lang === 'en' ? 'Showroom Viewing' : '线下/VR 深度看房',
      desc: lang === 'en' ? 'Book physical concierge showroom appointments or complete VR video walkthroughs.' : '提供机场接送及高端看房展厅专属接待服务，或支持视频连线看房。'
    },
    {
      step: '05',
      title: lang === 'en' ? 'Reservation Booking' : '房源特惠锁房',
      desc: lang === 'en' ? 'Place an official booking utility deposit to reserve preferred units and lock early discounts.' : '支付小额诚意订金，锁定高意向的优惠楼层门号及特殊内部早鸟折扣。'
    },
    {
      step: '06',
      title: lang === 'en' ? 'SPA Sign-off' : '完成网签/签署合同',
      desc: lang === 'en' ? 'Execute the Sales and Purchase Agreement (SPA) with legal counsel guidance.' : '在买卖合同纠察律师的合规见证指引下，签署全套买卖合同及贷款契约。'
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-left" id="buying-guide-timeline-section">
      
      {/* TIMELINE BUYING PROCESS SECTION */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-1 uppercase tracking-widest dark:bg-amber-950/30 dark:text-amber-400">
            Frictionless path
          </span>
          <h2 className="font-display text-2.5xl font-black text-slate-900 mt-2 tracking-tight dark:text-white">
            {t.buyingTitle}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 dark:text-slate-400">
            {t.buyingSub}
          </p>
        </div>

        {/* Horizontal scroll/flex timeline grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative" id="buying-process-timeline-track">
          {timelineSteps.map((item, idx) => (
            <div 
              key={idx}
              className="relative rounded-2xl border border-slate-150 bg-white p-5 hover:border-amber-400/40 hover:shadow-lg transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/40"
              id={`timeline-step-card-${item.step}`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-mono text-xs font-black text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full dark:bg-amber-950/20">
                  Step {item.step}
                </span>
                {idx < 5 && (
                  <ChevronRight className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-700 z-10" />
                )}
              </div>
              <h4 className="font-display text-sm font-black text-slate-900 group-hover:text-amber-500 dark:text-white leading-tight">
                {item.title}
              </h4>
              <p className="text-[11px] font-semibold text-slate-450 mt-2.5 leading-relaxed text-slate-500 dark:text-slate-450">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ARTICLES RESOURCES BLOGS SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Essential Malaysia Buying Library' : '吉隆坡房产品质置业书单'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Read vetted advice from top market researchers and legal specialists.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-md px-3 py-1.5 text-[10px] font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => setActiveArticle(art)}
              className="group cursor-pointer overflow-hidden rounded-2xl bg-white border border-slate-200/50 shadow-xs hover:shadow-md hover:border-amber-400/40 transition-all dark:bg-slate-900 dark:border-slate-850"
              id={`article-card-${art.id}`}
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img 
                  src={art.image} 
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                />
                <span className="absolute bottom-3 left-3 rounded-md bg-slate-900/80 px-2.5 py-1 text-[9px] font-extrabold uppercase text-white tracking-widest backdrop-blur-xs">
                  ★ {art.category}
                </span>
              </div>
              <div className="p-4.5 text-left">
                <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400 mb-1.5">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3.5 w-3.5 text-amber-500/80" />
                    {art.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3.5 w-3.5 text-amber-500/80" />
                    {art.readTime}
                  </span>
                </div>
                <h4 className="font-display font-black text-sm text-slate-900 group-hover:text-amber-500 dark:text-white leading-snug transition-colors line-clamp-2">
                  {art.title}
                </h4>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {art.summary}
                </p>
                <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ARTICLE FULL READ MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-left border border-slate-250 dark:border-slate-800 animate-in zoom-in duration-150">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="rounded bg-amber-100 px-3 py-1 text-[10px] font-extrabold text-amber-800 uppercase tracking-widest dark:bg-amber-950/30 dark:text-amber-400 inline-block mb-3">
              ★ {activeArticle.category}
            </span>
            <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 mb-3.5 dark:text-white leading-snug">
              {activeArticle.title}
            </h3>

            <div className="flex items-center space-x-4 text-[10px] font-extrabold text-slate-400 mb-5 border-b border-slate-100 pb-3 dark:border-slate-800">
              <span>Date: {activeArticle.date}</span>
              <span>Read Time: {activeArticle.readTime}</span>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed pr-2">
              <p className="font-bold border-l-4 border-amber-500 pl-3 py-0.5 text-slate-850 dark:text-white">
                {activeArticle.summary}
              </p>
              <p>{activeArticle.content}</p>
              <p>For fully integrated assistance and direct developer discount assignments, click on the **WhatsApp Now** button on the bottom menu bar of the main screen to consult with our specialized concierge panel.</p>
            </div>

            <div className="mt-8 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setActiveArticle(null)}
                className="rounded-xl bg-slate-900 text-white font-bold px-5 py-2.5 text-xs hover:bg-slate-800"
              >
                Finished Reading
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
