/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Clock, ChevronRight, X, ArrowUpRight } from 'lucide-react';
import { Article } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { MOCK_ARTICLES } from '../constants/mockData';

interface BuyingGuideProps {
  lang: 'en' | 'zh';
  articles?: Article[];
  limit?: number;
  onSeeMore?: () => void;
}

export default function BuyingGuide({ lang, articles = MOCK_ARTICLES, limit, onSeeMore }: BuyingGuideProps) {
  const t = TRANSLATIONS[lang];
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Investment', 'Own Stay', 'Loan Tips', 'Foreign Buyer', 'Market Trends'];

  const categoryTranslations: Record<string, string> = {
    'All': lang === 'en' ? 'All' : '全部',
    'Investment': lang === 'en' ? 'Investment' : '投资推荐',
    'Own Stay': lang === 'en' ? 'Own Stay' : '自住精选',
    'Loan Tips': lang === 'en' ? 'Loan Tips' : '贷款指南',
    'Foreign Buyer': lang === 'en' ? 'Foreign Buyer' : '外籍买家',
    'Market Trends': lang === 'en' ? 'Market Trends' : '市场趋势'
  };

  const filteredArticles = articles.filter((art) => {
    return selectedCategory === 'All' || art.category === selectedCategory;
  });

  const displayedArticles = limit ? filteredArticles.slice(0, limit) : filteredArticles;

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
      desc: lang === 'en' ? 'Submit an online request to match high-frequency specifications or request PDF details.' : '勾选在线咨询 or 极速下载 PDF 项目白皮书，即刻自动接入CRM专线。'
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
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-left" id="buying-guide-timeline-section">
      
      {/* TIMELINE BUYING PROCESS SECTION */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <span className="rounded-full bg-teal-700/10 border border-teal-700/30 text-teal-800 text-[10px] font-black px-4.5 py-1.5 uppercase tracking-widest shadow-xs">
            Frictionless path
          </span>
          <h2 className="font-display text-2.5xl sm:text-3.5xl font-black text-stone-900 mt-4 tracking-tight uppercase leading-none">
            {t.buyingTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mt-2 font-bold">
            {t.buyingSub}
          </p>
        </div>

        {/* Horizontal scroll/flex timeline grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative" id="buying-process-timeline-track">
          {timelineSteps.map((item, idx) => (
            <div 
              key={idx}
              className="relative rounded-2xl border border-[#ebdcb9] bg-white p-5 hover:border-teal-700 hover:shadow-md transition-all duration-500"
              id={`timeline-step-card-${item.step}`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-mono text-xs font-black text-teal-800 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                  Step {item.step}
                </span>
                {idx < 5 && (
                  <ChevronRight className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 z-10" />
                )}
              </div>
              <h4 className="font-display text-sm font-black text-stone-900 leading-tight">
                {item.title}
              </h4>
              <p className="text-[11px] font-bold text-stone-600 mt-2.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ARTICLES RESOURCES BLOGS SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h3 className="font-display text-xl font-bold text-stone-900 uppercase tracking-tight">
              {lang === 'en' ? 'Essential Malaysia Buying Library' : '吉隆坡房产品质置业书单'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 font-bold">
              {lang === 'en' 
                ? 'Read vetted advice from top market researchers and legal specialists.' 
                : '阅读来自顶级市场研究人员和法律专家的权威置业建议。'}
            </p>
          </div>

          {!limit && (
            <div className="flex flex-wrap gap-1 bg-stone-100 border border-stone-200 p-1 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-stone-950 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {categoryTranslations[cat] || cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => setActiveArticle(art)}
              className="group cursor-pointer overflow-hidden rounded-2xl bg-white border border-[#ebdcb9] shadow-xs hover:shadow-md hover:border-teal-700/60 transition-all duration-500"
              id={`article-card-${art.id}`}
            >
              <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                <img 
                  src={art.image || undefined} 
                  alt={lang === 'en' ? art.title : (art.titleZh || art.title)}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-700 scale-100 group-hover:scale-[1.04] brightness-95 group-hover:brightness-100"
                />
                <span className="absolute bottom-3 left-3 rounded-md bg-stone-900/95 border border-stone-850 px-2.5 py-1 text-[9px] font-extrabold uppercase text-white tracking-widest backdrop-blur-xs">
                  ★ {categoryTranslations[art.category] || art.category}
                </span>
              </div>
              <div className="p-5 text-left bg-[#FAF8F5]">
                <div className="flex items-center space-x-3 text-[10px] font-bold text-stone-500 mb-2">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3.5 w-3.5 text-teal-700" />
                    {(lang === 'zh' && art.dateZh) ? art.dateZh : art.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3.5 w-3.5 text-teal-700" />
                    {(lang === 'zh' && art.readTimeZh) ? art.readTimeZh : art.readTime}
                  </span>
                </div>
                <h4 className="font-display font-black text-sm text-stone-900 group-hover:text-teal-750 leading-snug transition-colors line-clamp-2">
                  {lang === 'en' ? art.title : (art.titleZh || art.title)}
                </h4>
                <p className="text-[11px] font-bold text-stone-600 mt-2 line-clamp-2">
                  {lang === 'en' ? art.summary : (art.summaryZh || art.summary)}
                </p>
                <div className="mt-4 flex items-center space-x-1 text-xs font-black text-teal-700 group-hover:translate-x-1 transition-transform">
                  <span>{lang === 'en' ? 'Read Article' : '阅读全文'}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See More Articles Button */}
        {limit && onSeeMore && filteredArticles.length > limit && (
          <div className="mt-10 text-center">
            <button
              onClick={onSeeMore}
              className="inline-flex items-center space-x-2 rounded-full border border-teal-700/30 bg-teal-700/5 px-8 py-4 font-display text-xs font-black text-teal-700 hover:bg-teal-700 hover:text-white transition-all hover:scale-[1.03] active:scale-95 shadow-xs cursor-pointer"
            >
              <span>{lang === 'en' ? 'See More Articles' : '阅读更多置业指南'}</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ARTICLE FULL READ MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl text-left border border-[#ebdcb9] animate-in zoom-in duration-150">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-850"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="rounded bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-[10px] font-black text-teal-700 uppercase tracking-widest inline-block mb-3.5">
              ★ {categoryTranslations[activeArticle.category] || activeArticle.category}
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-black text-stone-900 mb-4 leading-snug">
              {lang === 'en' ? activeArticle.title : (activeArticle.titleZh || activeArticle.title)}
            </h3>

            <div className="flex items-center space-x-4 text-[10px] font-extrabold text-stone-500 mb-6 border-b border-stone-200 pb-3">
              <span>{lang === 'en' ? 'Date' : '日期'}: {(lang === 'zh' && activeArticle.dateZh) ? activeArticle.dateZh : activeArticle.date}</span>
              <span>{lang === 'en' ? 'Read Time' : '阅读时间'}: {(lang === 'zh' && activeArticle.readTimeZh) ? activeArticle.readTimeZh : activeArticle.readTime}</span>
            </div>

            <div className="space-y-4 max-h-[320px] overflow-y-auto text-xs sm:text-sm font-bold text-stone-700 leading-relaxed pr-2">
              <p className="font-black border-l-4 border-teal-700 pl-3 py-0.5 text-stone-900">
                {lang === 'en' ? activeArticle.summary : (activeArticle.summaryZh || activeArticle.summary)}
              </p>
              <p>{lang === 'en' ? activeArticle.content : (activeArticle.contentZh || activeArticle.content)}</p>
              <p>
                {lang === 'en' 
                  ? 'For fully integrated assistance and direct developer discount assignments, click on the **WhatsApp Now** button on the bottom menu bar of the main screen to consult with our specialized concierge panel.'
                  : '如需获取完整的一手房源支持及专享的开发商内部特惠折扣，请点击页面下方菜单栏的 **即刻联系（WhatsApp）** 按钮，直连我们的专业顾问团队。'}
              </p>
            </div>

            <div className="mt-8 flex justify-end border-t border-stone-200 pt-4">
              <button
                onClick={() => setActiveArticle(null)}
                className="rounded-xl bg-teal-700 text-white font-black px-6 py-3 text-xs hover:bg-teal-850"
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
