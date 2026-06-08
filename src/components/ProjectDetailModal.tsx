/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, MapPin, Calculator, TrendingUp, Building, Clock, Map, Phone, Briefcase, 
  Layers, Hammer, ChevronLeft, ChevronRight, HelpCircle, ArrowRight, Share2, Download, Check, Sparkles, Building2, Eye, Compass
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Project, CurrencyCode, Lead } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { formatPrice } from './ProjectCard';

interface ProjectDetailModalProps {
  project: Project;
  currency: CurrencyCode;
  lang: 'en' | 'zh';
  onClose: () => void;
  onLeadCaptured: (lead: Lead) => void;
}

interface LayoutPlan {
  name: string;
  sizeSqft: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  description: string;
}

export default function ProjectDetailModal({
  project,
  currency,
  lang,
  onClose,
  onLeadCaptured
}: ProjectDetailModalProps) {
  const t = TRANSLATIONS[lang];
  
  // Active Section Navigation Tab State (within the landing page)
  const [activeSection, setActiveSection] = useState<'overview' | 'location' | 'layouts' | 'gallery' | 'calculator'>('overview');

  // Interactive Gallery Slider Index State
  const [activeImgIdx, setActiveImgIdx] = useState<number>(0);

  // Layout switcher state
  const [selectedLayoutIdx, setSelectedLayoutIdx] = useState<number>(0);

  // Mortgage Calculator States
  const [downpaymentPct, setDownpaymentPct] = useState<number>(10); // in percent
  const [interestPct, setInterestPct] = useState<number>(4.0); // Annual interest rate
  const [loanYears, setLoanYears] = useState<number>(30); // years

  // Brochure download tracking feedback
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [showDownloadForm, setShowDownloadForm] = useState<boolean>(false);

  // Booking details Form state
  const [bookName, setBookName] = useState<string>('');
  const [bookPhone, setBookPhone] = useState<string>('');
  const [bookEmail, setBookEmail] = useState<string>('');
  const [bookSuccess, setBookSuccess] = useState<boolean>(false);

  // Mapped Interactive Layout Plans for this developer showcase
  const LAYOUT_PLANS: LayoutPlan[] = useMemo(() => {
    return [
      {
        name: lang === 'en' ? 'Type Alpha - Boutique Standard' : '户型甲-极简雅致标房',
        sizeSqft: project.builtUpMin,
        bedrooms: project.bedrooms,
        bathrooms: Math.max(1, project.bathrooms - 1),
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        description: lang === 'en' 
          ? 'Optimized layout designed for active professionals. Features double-insulated panoramic windows, a spacious living parlour, and premium fitted dry-kitchen cabinetry.'
          : '高透光落地推拉窗，功能性干湿分离厨房，为都市精英量身打造。高坪效、低维护，兼具奢华气度。'
      },
      {
        name: lang === 'en' ? 'Type Beta - Premium Executive Suite' : '户型乙-行政经典阔邸',
        sizeSqft: Math.round((project.builtUpMin + project.builtUpMax) / 1.5),
        bedrooms: project.bedrooms,
        bathrooms: project.bathrooms,
        imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
        description: lang === 'en' 
          ? 'A seamless marriage of privacy and connection, featuring generous family seating areas, built-in wardrobe modules, and scenic structural view balconies.'
          : '阔绰双套房设计，配有独立景观露台，尊享大尺度采光与通风，让您在大都市的脉动中体验宁谧雅致。'
      },
      {
        name: lang === 'en' ? 'Type Crown - Grand Presidential Loft' : '户型丙-云端至尊复式',
        sizeSqft: project.builtUpMax,
        bedrooms: Math.min(5, project.bedrooms + 1),
        bathrooms: Math.min(5, project.bathrooms + 1),
        imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        description: lang === 'en' 
          ? 'An outstanding triplex or penthouse unit with customized marble flooring, premium luxury smart appliances, private storage foyer, and dual elevators operational setup.'
          : '云端超高层复式挑空客厅，配设专属私人电梯大堂，顶级大理石地面配合全屋高配集成智能家居。'
      }
    ];
  }, [project, lang]);

  // Computed Loan metrics
  const principalAmount = useMemo(() => {
    const downpaymentVal = (project.priceMin * downpaymentPct) / 100;
    return Math.max(0, project.priceMin - downpaymentVal);
  }, [project.priceMin, downpaymentPct]);

  const mortgageDetails = useMemo(() => {
    const r = interestPct / 100 / 12;
    const n = loanYears * 12;
    
    if (r === 0) {
      const mnInst = principalAmount / n;
      return {
        monthly: mnInst,
        totalInterest: 0,
        totalCost: principalAmount
      };
    }

    const monthlyInst = principalAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalCost = monthlyInst * n;
    const totalInterest = totalCost - principalAmount;

    return {
      monthly: monthlyInst,
      totalInterest,
      totalCost
    };
  }, [principalAmount, interestPct, loanYears]);

  // Chart data for mortgage breakdown
  const chartData = useMemo(() => {
    return [
      { name: lang === 'en' ? 'Principal' : '贷款本金', value: principalAmount, color: '#C5A059' },
      { name: lang === 'en' ? 'Interest' : '总利息', value: mortgageDetails.totalInterest, color: '#475569' }
    ];
  }, [principalAmount, mortgageDetails.totalInterest, lang]);

  // Computed Rental Yield ROI metrics
  const monthlyMaintenanceFee = useMemo(() => {
    const midSizeSqft = (project.builtUpMin + project.builtUpMax) / 2;
    return midSizeSqft * project.maintenanceFee;
  }, [project.builtUpMin, project.builtUpMax, project.maintenanceFee]);

  const rentalYieldMetrics = useMemo(() => {
    const grossAnnualRevenue = (project.priceMin * project.rentalYield) / 100;
    const grossMonthlyRevenue = grossAnnualRevenue / 12;
    
    const netMonthlyRevenue = Math.max(0, grossMonthlyRevenue - monthlyMaintenanceFee);
    const netAnnualRevenue = netMonthlyRevenue * 12;
    const netYield = (netAnnualRevenue / project.priceMin) * 100;

    return {
      grossMonthly: grossMonthlyRevenue,
      netMonthly: netMonthlyRevenue,
      netYield
    };
  }, [project.priceMin, project.rentalYield, monthlyMaintenanceFee]);

  // Next image helper
  const nextImg = () => {
    if (project.gallery && project.gallery.length > 0) {
      setActiveImgIdx((activeImgIdx + 1) % project.gallery.length);
    }
  };

  const prevImg = () => {
    if (project.gallery && project.gallery.length > 0) {
      setActiveImgIdx((activeImgIdx - 1 + project.gallery.length) % project.gallery.length);
    }
  };

  // Submit direct viewing request
  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName || !bookPhone) return;

    const newLead: Lead = {
      id: `lead-booking-${Date.now()}`,
      name: bookName,
      phone: bookPhone,
      email: bookEmail || 'N/A',
      projectInterested: project.name,
      budgetRange: `From Price: RM ${project.priceMin.toLocaleString()}`,
      purpose: 'Direct Developer Inquiry',
      timestamp: new Date().toISOString(),
      status: 'New'
    };

    onLeadCaptured(newLead);
    setBookSuccess(true);
  };

  // Process Brochure download capture
  const handleBrochureDownload = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: `lead-brochure-${Date.now()}`,
      name: bookName || 'Brochure Requester',
      phone: bookPhone || 'Downloaded via spec catalog',
      email: bookEmail || 'N/A',
      projectInterested: `Brochure: ${project.name}`,
      timestamp: new Date().toISOString(),
      status: 'New'
    };
    onLeadCaptured(newLead);
    setDownloadSuccess(true);
    setTimeout(() => {
      setShowDownloadForm(false);
      setDownloadSuccess(false);
    }, 2500);
  };

  const currentActiveImg = project.gallery?.[activeImgIdx] || project.image;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 overflow-y-auto flex flex-col w-full h-full text-slate-800 dark:text-slate-100" id={`project-developer-landing-${project.id}`}>
      
      {/* 1. STICKY TOP NAVIGATION BAR FOR LANDING PAGE */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 px-4 py-3 sm:px-6 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95 flex justify-between items-center transition-colors">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onClose}
            className="flex items-center space-x-1.5 rounded-full border border-slate-200/90 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-900 transition-all hover:bg-slate-150 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            <span>←</span>
            <span>{lang === 'en' ? 'Back to Residences' : '返回项目列表'}</span>
          </button>
          <div className="hidden h-5 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
          <div className="hidden flex-col items-start leading-none sm:flex text-left">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">{project.name}</span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">{project.area}, {project.state} • Official Release</span>
          </div>
        </div>

        {/* Section anchor tab bar */}
        <div className="hidden md:flex space-x-1">
          {[
            { id: 'overview', label: lang === 'en' ? 'Overview' : '开发概览' },
            { id: 'location', label: lang === 'en' ? 'Location Map' : '区位配套' },
            { id: 'layouts', label: lang === 'en' ? 'Layout Plans' : '户型选择' },
            { id: 'gallery', label: lang === 'en' ? 'High-Def Gallery' : '臻美实景' },
            { id: 'calculator', label: lang === 'en' ? 'Loan / Yield Calc' : '房贷及收益' }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id as any);
                document.getElementById(`sec-${sec.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`rounded-lg px-3.5 py-2 text-xs font-extrabold transition-all ${
                activeSection === sec.id
                  ? 'bg-slate-900 text-white dark:bg-brand-gold dark:text-slate-950'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div>
          <a
            href={`https://wa.me/60195598932?text=${encodeURIComponent(t.whatsappChatHelp + ' ' + project.name)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-xs hover:bg-emerald-650 transition-all flex items-center space-x-1"
          >
            <span>WhatsApp Release</span>
          </a>
        </div>
      </nav>

      {/* 2. HERO SPLASH HEADER BLOCK */}
      <header className="relative w-full h-[55vh] bg-slate-900 text-white flex items-end">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={project.image} 
            alt={project.name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-[0.55] transform scale-105 transition-transform duration-1000"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pb-10 text-left">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-full bg-[#C5A059] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
              👑 {project.propertyType}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
              📅 Completion: {project.completionYear}
            </span>
            <span className="rounded-full bg-emerald-500/25 border border-emerald-400/40 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 backdrop-blur-md">
              {project.tenure} Title
            </span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-5.5xl font-black tracking-tight leading-tight uppercase">
            {project.name}
          </h1>
          <p className="mt-2 flex items-center text-sm sm:text-base font-semibold text-slate-300">
            <MapPin className="mr-1.5 h-4 w-4 text-brand-gold shrink-0" />
            <span>{project.area}, {project.state} • Masterpiece Developed by {project.developer}</span>
          </p>
        </div>
      </header>

      {/* 3. MAIN CONTENTS GRID LAYOUT */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT 2 COLS: SPECIFICATIONS, MAPS, LAYOUT PLANS, GALLERY, CALCULATORS */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* OVERVIEW SECTION */}
            <section id="sec-overview" className="scroll-mt-24 space-y-4">
              <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">{lang === 'en' ? 'Official Profile' : '建筑开发概念'}</span>
                <h2 className="font-display text-xl sm:text-2xl font-black mt-0.5 text-slate-900 dark:text-white uppercase">
                  {lang === 'en' ? 'Project Overview' : '项目尊享白皮书'}
                </h2>
              </div>
              
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {project.description}
              </p>

              {/* Specs Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4.5 pt-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Developer Architect</span>
                  <p className="text-sm font-black text-slate-900 dark:text-gray-200 mt-1.5">{project.developer}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tenure Classification</span>
                  <p className="text-sm font-black text-slate-900 dark:text-gray-200 mt-1.5">{project.tenure}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Elite Interior Furnish</span>
                  <p className="text-sm font-black text-slate-900 dark:text-gray-200 mt-1.5">{project.furnishing}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Size Floor Area</span>
                  <p className="text-sm font-black text-slate-900 dark:text-gray-200 mt-1.5">{project.builtUpMin} - {project.builtUpMax} SQFT</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bedrooms Structure</span>
                  <p className="text-sm font-black text-slate-900 dark:text-gray-200 mt-1.5">{project.bedrooms} Bedroom / {project.bathrooms} Bath</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Monthly Maintenance</span>
                  <p className="text-sm font-black text-slate-900 dark:text-gray-200 mt-1.5">RM {project.maintenanceFee.toFixed(2)} / SQFT</p>
                </div>
                {project.carPark !== undefined && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Car Park Allocation</span>
                    <p className="text-sm font-black text-slate-900 dark:text-gray-200 mt-1.5 font-mono">{project.carPark} Parking Bays</p>
                  </div>
                )}
                {project.totalUnits !== undefined && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Project Total Units</span>
                    <p className="text-sm font-black text-slate-900 dark:text-gray-200 mt-1.5 font-mono">{project.totalUnits} Units</p>
                  </div>
                )}
                {project.totalFloors !== undefined && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tower Floor Height</span>
                    <p className="text-sm font-black text-slate-900 dark:text-gray-200 mt-1.5 font-mono">{project.totalFloors} Stories</p>
                  </div>
                )}
              </div>

              {/* Premium Highlights Checklist */}
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#C5A059]">{lang === 'en' ? 'Core Master Highlights' : '尊崇物业特色'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {project.keyHighlights.map((hl, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 rounded-xl border border-slate-150 p-3.5 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold flex-shrink-0 dark:bg-brand-gold/15">
                        ✓
                      </div>
                      <span className="leading-snug">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* LOCATION IMAGE SECTION */}
            <section id="sec-location" className="scroll-mt-24 space-y-4">
              <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">{lang === 'en' ? 'Golden District Infrastructure' : '交通网络与周边配套'}</span>
                <h2 className="font-display text-xl sm:text-2xl font-black mt-0.5 text-slate-900 dark:text-white uppercase">
                  {lang === 'en' ? 'Location Infrastructure' : '区位生活圈地图'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                    {lang === 'en'
                      ? `Positioned strategically in ${project.area}, ${project.state}, this property is located directly inside Malaysia's most valuable golden triangle orbit. Enjoy rapid walkability routes and premium transport arteries.`
                      : `坐落于 ${project.area} 黄金商业圈核心。紧邻一线地铁枢纽及主要高速公路交汇点，坐拥极其便捷的城际交通网络，周边顶级国际名校、医疗资源密布。`}
                  </p>
                  
                  {/* Transport & Landmark nodes */}
                  <div className="space-y-2.5">
                    {project.nearbyAmenities.map((am, i) => (
                      <div key={i} className="flex items-center space-x-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-[#C5A059] shrink-0" />
                        <span>{am}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highly Vetted Location Mockup Image */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-850 h-64 shadow-md group">
                  <div className="absolute inset-0 bg-slate-900/10 z-10 transition-colors group-hover:bg-slate-900/0" />
                  <img 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
                    alt="District Area Map Grid" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 z-20 rounded-md bg-slate-950/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-brand-gold backdrop-blur-md flex items-center space-x-1">
                    <Compass className="h-3 w-3 animate-spin-slow" />
                    <span>{project.area} District Infrastructure</span>
                  </div>
                </div>
              </div>
            </section>

            {/* INTERACTIVE LAYOUTS SECTION */}
            <section id="sec-layouts" className="scroll-mt-24 space-y-4">
              <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">{lang === 'en' ? 'Precision Engineering' : '精选户型空间规划'}</span>
                <h2 className="font-display text-xl sm:text-2xl font-black mt-0.5 text-slate-900 dark:text-white uppercase">
                  {lang === 'en' ? 'Interactive Layout Plans' : '一房一绘 · 精密户型图'}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                {lang === 'en'
                  ? 'Switch between certified high-end layout masterplans. Each option represents developer optimized structures mapped with luxurious ceiling drops.'
                  : '点击切换精品开发商规划户型。提供不同面积、房型规划，契合单身贵族、外籍管理层或多代同堂大家族的个性化人居需求。'}
              </p>

              {/* Layout plan switcher tabs */}
              <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl flex">
                {LAYOUT_PLANS.map((plan, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedLayoutIdx(i)}
                    className={`flex-1 text-center py-2.5 rounded-lg text-xs font-black uppercase transition-all truncate px-1 ${
                      selectedLayoutIdx === i
                        ? 'bg-white text-slate-950 dark:bg-slate-800 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    {plan.name.split('-')[0]}
                  </button>
                ))}
              </div>

              {/* Dynamic Active Layout Info card with Floor Image */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/20 p-5 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center">
                
                {/* Specific Layout text metrics */}
                <div className="flex-1 space-y-4 text-left">
                  <h4 className="font-display text-base font-black text-slate-900 dark:text-white">
                    {LAYOUT_PLANS[selectedLayoutIdx].name}
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="rounded-md bg-brand-gold/10 border border-brand-gold/30 px-2.5 py-1 text-[10px] font-bold text-brand-gold">
                      📐 Area Size: {LAYOUT_PLANS[selectedLayoutIdx].sizeSqft} SQFT
                    </span>
                    <span className="rounded-md bg-slate-200 text-slate-800 px-2.5 py-1 text-[10px] font-bold dark:bg-slate-800 dark:text-slate-200">
                      🛏 {LAYOUT_PLANS[selectedLayoutIdx].bedrooms} Bedrooms
                    </span>
                    <span className="rounded-md bg-slate-200 text-slate-800 px-2.5 py-1 text-[10px] font-bold dark:bg-slate-800 dark:text-slate-200">
                      🚿 {LAYOUT_PLANS[selectedLayoutIdx].bathrooms} Bathrooms
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    {LAYOUT_PLANS[selectedLayoutIdx].description}
                  </p>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        const targetInput = document.getElementById('book-name');
                        targetInput?.focus();
                        targetInput?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="rounded-lg bg-slate-900 text-white px-4 py-2 text-[11px] font-extrabold hover:bg-slate-800 cursor-pointer dark:bg-brand-gold dark:text-slate-950 dark:hover:bg-brand-gold-hover"
                    >
                      Inquire About {LAYOUT_PLANS[selectedLayoutIdx].name.split('-')[0]} Pricing
                    </button>
                  </div>
                </div>

                {/* Vetted Floor Layout Mockup Image */}
                <div className="w-full md:w-64 h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white relative group">
                  <div className="absolute top-2 right-2 z-10 rounded-full bg-slate-950/70 p-1.5 text-white backdrop-blur-md">
                    <Eye className="h-3.5 w-3.5" />
                  </div>
                  <img 
                    src={LAYOUT_PLANS[selectedLayoutIdx].imageUrl} 
                    alt="Floor Layout Vector Masterplan" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                </div>

              </div>
            </section>

            {/* HIGH-DEF GALLERY SECTION */}
            <section id="sec-gallery" className="scroll-mt-24 space-y-4">
              <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">{lang === 'en' ? 'Visual Showcase' : '项目艺术图册'}</span>
                <h2 className="font-display text-xl sm:text-2xl font-black mt-0.5 text-slate-900 dark:text-white uppercase">
                  {lang === 'en' ? 'Property Gallery' : '臻选实景与效果图'}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                {lang === 'en'
                  ? 'Scroll through the official, verified photo gallery. Vetted real estate captures of interior, lobbies, club houses, and skylines.'
                  : '查看大马好房管家实地验证过的大楼大堂、高空无边会所池及名家样板房写真。'}
              </p>

              {/* Expanded interactive main photo gallery with slick grid */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 h-80 sm:h-[45vh]">
                <img 
                  src={currentActiveImg} 
                  alt={project.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Carousel directional button icons */}
                {project.gallery && project.gallery.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/50 text-white hover:bg-slate-950/80 transition-all border border-white/10"
                    >
                      <ChevronLeft className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/50 text-white hover:bg-slate-950/80 transition-all border border-white/10"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </>
                )}

                {/* Frame Counter indicators */}
                <div className="absolute bottom-4 right-4 rounded-md bg-slate-950/85 border border-white/10 px-3 py-1 font-mono text-2xs font-extrabold text-brand-gold backdrop-blur-md">
                  {activeImgIdx + 1} / {project.gallery?.length || 1}
                </div>
              </div>

              {/* Thumbnails list row selection */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="flex gap-2 w-full overflow-x-auto pb-2 select-none">
                  {project.gallery.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImgIdx(index)}
                      className={`h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImgIdx === index ? 'border-brand-gold ring-2 ring-brand-gold/25' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <img src={img} alt="Thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* MORTGAGE AND ESTIMATED YIELD CALCULATOR */}
            <section id="sec-calculator" className="scroll-mt-24 space-y-4">
              <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">{lang === 'en' ? 'Acoustic Financing Analysis' : '项目投资性价比精算'}</span>
                <h2 className="font-display text-xl sm:text-2xl font-black mt-0.5 text-slate-900 dark:text-white uppercase">
                  {lang === 'en' ? 'Premium Mortgage & ROI Calculator' : '房贷月供及租金收益评估'}
                </h2>
              </div>

              {/* MORTGAGE CALCULATOR COMPONENT RENDER */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/30 p-5 sm:p-6 dark:border-slate-850 dark:bg-slate-900/10">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-3.5 mb-5 dark:border-slate-800">
                  <Calculator className="h-5 w-5 text-brand-gold animate-bounce-slow" />
                  <h3 className="font-display text-sm font-black text-slate-900 dark:text-white uppercase">
                    {t.loanCalcTitle}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Slider controllers */}
                  <div className="space-y-4 text-left">
                    <div>
                      <div className="flex justify-between text-[11px] font-extrabold text-slate-500 mb-1">
                        <span>DOWNPAYMENT BUDGET</span>
                        <span className="text-slate-850 dark:text-white font-mono">{downpaymentPct}% ({formatPrice((project.priceMin * downpaymentPct) / 100, currency)})</span>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max="50"
                        step="5"
                        value={downpaymentPct}
                        onChange={(e) => setDownpaymentPct(parseFloat(e.target.value))}
                        className="w-full h-1.5 rounded-lg bg-slate-200 cursor-pointer accent-[#C5A059] dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-extrabold text-slate-500 mb-1">
                        <span>{t.interestRate.toUpperCase()}</span>
                        <span className="text-slate-850 dark:text-white font-mono">{interestPct.toFixed(1)}% p.a.</span>
                      </div>
                      <input 
                        type="range"
                        min="3.0"
                        max="6.0"
                        step="0.1"
                        value={interestPct}
                        onChange={(e) => setInterestPct(parseFloat(e.target.value))}
                        className="w-full h-1.5 rounded-lg bg-slate-200 cursor-pointer accent-[#C5A059] dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-extrabold text-slate-500 mb-1">
                        <span>{t.loanPeriod.toUpperCase()}</span>
                        <span className="text-slate-850 dark:text-white font-mono">{loanYears} Years Tenure</span>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max="35"
                        step="5"
                        value={loanYears}
                        onChange={(e) => setLoanYears(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-lg bg-slate-200 cursor-pointer accent-[#C5A059] dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  {/* Calculated outputs with Recharts Donut Pie */}
                  <div className="bg-white rounded-xl p-4 border border-slate-150 shadow-xs dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t.monthlyInstalment}
                      </span>
                      <div className="font-mono text-xl sm:text-2xl font-black text-brand-gold mt-0.5">
                        {formatPrice(mortgageDetails.monthly, currency)} / mo
                      </div>
                    </div>

                    {/* Donut Chart visualizer */}
                    <div className="my-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="h-28 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={28}
                              outerRadius={40}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {chartData.map((e, i) => (
                                <Cell key={i} fill={e.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(val: any) => formatPrice(Number(val), currency)} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                          <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">Ratio</span>
                          <span className="text-[10px] font-black text-slate-800 dark:text-white leading-none mt-0.5">
                            {Math.round((principalAmount / (mortgageDetails.totalCost || 1)) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cost ledger list */}
                    <div className="space-y-1.5 text-xs font-bold text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between">
                        <span>{t.loanPrincipal}</span>
                        <span className="text-slate-800 dark:text-white">{formatPrice(principalAmount, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.totalInterests}</span>
                        <span className="text-slate-800 dark:text-white">{formatPrice(mortgageDetails.totalInterest, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.totalRepayment}</span>
                        <span className="text-slate-850 dark:text-white">{formatPrice(mortgageDetails.totalCost, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RENTAL ROI METRICS */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/30 p-5 sm:p-6 dark:border-slate-850 dark:bg-slate-900/10">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-3.5 mb-5 dark:border-slate-800">
                  <TrendingUp className="h-5 w-5 text-brand-gold" />
                  <h3 className="font-display text-sm font-black text-slate-900 dark:text-white uppercase">
                    {t.roiEstimator}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-white rounded-xl p-3 border border-slate-150 shadow-2xs dark:bg-slate-900 dark:border-slate-805">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{t.investmentAdvantage}</span>
                    <p className="text-lg font-mono font-black text-emerald-500 mt-1">★ {project.investmentScore}/10</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-150 shadow-2xs dark:bg-slate-900 dark:border-slate-805">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{t.ownStayComfort}</span>
                    <p className="text-lg font-mono font-black text-indigo-500 mt-1">★ {project.ownStayScore}/10</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-150 shadow-2xs dark:bg-slate-900 dark:border-slate-805">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Gross Yield</span>
                    <p className="text-lg font-mono font-black text-[#C5A059] mt-1">{project.rentalYield.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-150 shadow-2xs dark:bg-slate-900 dark:border-slate-805">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Net Yield (Adjusted)</span>
                    <p className="text-lg font-mono font-black text-teal-500 mt-1">{rentalYieldMetrics.netYield.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-800 text-xs font-semibold text-slate-400 flex flex-col sm:flex-row justify-between gap-2.5">
                  <span>Gross Monthly Estimate: <strong className="text-slate-800 dark:text-white font-mono">{formatPrice(rentalYieldMetrics.grossMonthly, currency)}/mo</strong></span>
                  <span>Maintenance Levy Subtraction: <strong className="text-slate-800 dark:text-white font-mono">{formatPrice(monthlyMaintenanceFee, currency)}/mo</strong></span>
                  <span>Net Annual Adjusted Income: <strong className="text-slate-800 dark:text-white font-mono">{formatPrice(rentalYieldMetrics.netMonthly * 12, currency)}/yr</strong></span>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT 1 COL: INQUIRY FORM CTA + ADVISORY CARD */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* INQUIRY LEAD CAPTURE CARD */}
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5.5 shadow-xl dark:border-slate-800 dark:bg-slate-950 text-left">
              <div className="text-center pb-3.5 border-b border-slate-100 mb-5 dark:border-slate-850">
                <span className="rounded-full bg-brand-gold/15 px-3 py-1 text-[9px] font-black text-brand-gold uppercase tracking-widest">
                  ★ {t.getPriceList.split(' ')[0]} ALLOCATIONS
                </span>
                <div className="font-mono text-3xl font-black text-slate-900 mt-2 dark:text-white">
                  {formatPrice(project.priceMin, currency)} <span className="text-xs font-bold text-slate-400 font-sans">onwards</span>
                </div>
                <p className="text-[10px] text-slate-405 mt-0.5">{lang === 'en' ? 'Direct secure structural developer pricing rates.' : '直接获得大马一手开发商专属内部底价。'}</p>
              </div>

              {!bookSuccess ? (
                <form onSubmit={submitBooking} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                      {t.formName}
                    </label>
                    <input 
                      type="text"
                      id="book-name"
                      required
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      placeholder="e.g. Rachel Tan"
                      className="block w-full rounded-lg border border-slate-250 bg-slate-50 py-2.5 px-3.5 text-xs font-bold focus:border-brand-gold focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                      {t.formPhone}
                    </label>
                    <input 
                      type="text"
                      required
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      placeholder="e.g. 019-559 8932"
                      className="block w-full rounded-lg border border-slate-250 bg-slate-50 py-2.5 px-3.5 text-xs font-bold focus:border-brand-gold focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                      {t.formEmail}
                    </label>
                    <input 
                      type="email"
                      value={bookEmail}
                      onChange={(e) => setBookEmail(e.target.value)}
                      placeholder="e.g. rachel@mail.com"
                      className="block w-full rounded-lg border border-slate-250 bg-slate-50 py-2.5 px-3.5 text-xs font-bold focus:border-brand-gold focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-brand-gold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-950 py-3 text-xs font-black text-white hover:bg-slate-850 cursor-pointer dark:bg-brand-gold dark:text-slate-950 dark:hover:bg-brand-gold-hover shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span>{t.bookViewing.toUpperCase()}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Traction Completed!' : '看房预约及底价索取已登记！'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    {lang === 'en' 
                      ? 'Our regional bi-lingual senior advisor will reach out to you via WhatsApp / Wechat within 10 minutes.' 
                      : '大马资深金牌顾问将在 10 分钟内通过微信/WhatsApp与您建立直连，为您呈递完整一房一价PDF手册。'}
                  </p>
                </div>
              )}

              {/* DOWNLOAD BROCHURE TEASER */}
              <div className="mt-4.5 pt-4 border-t border-slate-100 dark:border-slate-850">
                {!showDownloadForm ? (
                  <button
                    onClick={() => setShowDownloadForm(true)}
                    className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold py-2.5 text-xs font-extrabold hover:bg-brand-gold/20 transition-colors cursor-pointer"
                  >
                     <span>{t.downloadBrochure.toUpperCase()}</span>
                  </button>
                ) : (
                  <form onSubmit={handleBrochureDownload} className="space-y-2 mt-2 bg-slate-50 p-3 rounded-lg dark:bg-slate-900/50">
                    <p className="text-[9px] text-slate-400 font-bold leading-normal mb-1 bg-white/50 dark:bg-slate-900 p-1 px-2 rounded-md uppercase">
                      Confirm number to retrieve Secure PDF eBook
                    </p>
                    <input 
                      type="text"
                      required
                      placeholder="Enter WhatsApp / Phone Number"
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      className="block w-full rounded-md border border-slate-205 bg-white p-2 text-[10px] font-bold focus:outline-hidden dark:border-slate-800 dark:bg-slate-950"
                    />
                    <button
                      type="submit"
                      className="w-full text-xs font-bold py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      {downloadSuccess ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Generating PDF Brochure...</span>
                        </>
                      ) : (
                        <span>Verify & Download PDF</span>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* HELPFUL CONTACT QUICK CALL */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-black">
                <a
                  href={`https://wa.me/60195598932?text=${encodeURIComponent(
                    `Hi! I am looking for the e-brochure & layout details of ${project.name} (from MalaysianHomes). Please share details.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-green-500 hover:bg-green-600 text-white py-2 flex items-center justify-center space-x-1 shadow-md cursor-pointer text-[10px] tracking-wide"
                >
                  <span>WhatsApp direct</span>
                </a>
                <a
                  href="tel:0195598932"
                  className="rounded-lg bg-slate-100 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-gray-100 hover:bg-slate-200 border border-slate-200 py-2 flex items-center justify-center space-x-1 cursor-pointer text-[10px] tracking-wide"
                >
                  <span>📞 019-5598932</span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
