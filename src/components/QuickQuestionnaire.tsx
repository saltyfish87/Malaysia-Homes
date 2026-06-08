/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, Flame, Building, ArrowRight, DollarSign, MapPin, User, Phone, Mail } from 'lucide-react';
import { Project, Lead } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface QuestionnaireProps {
  projects: Project[];
  lang: 'en' | 'zh';
  onClose: () => void;
  onLeadCaptured: (lead: Lead) => void;
  onViewProject: (project: Project) => void;
}

export default function QuickQuestionnaire({
  projects,
  lang,
  onClose,
  onLeadCaptured,
  onViewProject
}: QuestionnaireProps) {
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState<number>(1);
  const [budget, setBudget] = useState<string>('RM500k-RM1m');
  const [purpose, setPurpose] = useState<string>('Investment');
  const [selectedStates, setSelectedStates] = useState<string[]>(['Kuala Lumpur']);
  
  // Client Contact Details
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  
  // Matches state
  const [matchedProjects, setMatchedProjects] = useState<Project[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // States list helper
  const availableStates = ['Kuala Lumpur', 'Selangor', 'Johor', 'Penang'];

  const toggleState = (state: string) => {
    if (selectedStates.includes(state)) {
      if (selectedStates.length > 1) {
        setSelectedStates(selectedStates.filter((s) => s !== state));
      }
    } else {
      setSelectedStates([...selectedStates, state]);
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    // Filter projects based on selections to compute recommendations
    const filtered = projects.filter((proj) => {
      // State match
      const stateMatch = selectedStates.includes(proj.state);
      
      // Budget range match
      let priceMatch = false;
      if (budget === 'Below-RM500k') {
        priceMatch = proj.priceMin < 600000;
      } else if (budget === 'RM500k-RM1m') {
        priceMatch = (proj.priceMin >= 500000 && proj.priceMin <= 1100000) || proj.priceMin < 800000;
      } else if (budget === 'RM1m-RM2m') {
        priceMatch = (proj.priceMin >= 1000000 && proj.priceMin <= 2000000) || (proj.priceMax >= 1000000 && proj.priceMin < 1500000);
      } else {
        priceMatch = proj.priceMax >= 1500000;
      }

      // Purpose weighting
      let purposeMatch = true;
      if (purpose === 'Investment') {
        purposeMatch = proj.airbnbFriendly || proj.investmentScore >= 8.5;
      } else if (purpose === 'Own Stay') {
        purposeMatch = proj.ownStayScore >= 8.5;
      }

      return stateMatch && priceMatch && purposeMatch;
    });

    // Fallback if no projects perfectly match so user isn't shown empty list
    const fallbackMathes = filtered.length > 0 ? filtered : projects.slice(0, 3);
    setMatchedProjects(fallbackMathes);

    // Save lead
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name,
      phone,
      email: email || 'No email provided',
      budgetRange: budget,
      purpose: purpose,
      projectInterested: `Smart Match: ${selectedStates.join(', ')}`,
      timestamp: new Date().toISOString(),
      status: 'New'
    };

    onLeadCaptured(newLead);
    setIsSubmitted(true);
  };

  const progressPercentage = (step / 4) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 transition-colors animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          id="questionnaire-close-btn"
        >
          <X className="h-5 w-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Title Block */}
            <div className="mb-6 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold text-white">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {t.smartQuestionnaire}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.questionnaireSub}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                <span>Step {step} of 4</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div 
                  className="h-full rounded-full bg-brand-gold transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Steps Container */}
            <div className="mb-8 min-h-[220px]">
              
              {/* STEP 1: Budget limit selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.budgetRangePref}
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { value: 'Below-RM500k', label: lang === 'en' ? 'Under RM 500,000' : 'RM 50万以下' },
                      { value: 'RM500k-RM1m', label: lang === 'en' ? 'RM 500,000 - RM 1,000,000' : 'RM 50万 - 100万' },
                      { value: 'RM1m-RM2m', label: lang === 'en' ? 'RM 1,000,000 - RM 2,000,000' : 'RM 100万 - 200万' },
                      { value: 'Above-RM2m', label: lang === 'en' ? 'Above RM 2,000,000' : 'RM 200万以上' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBudget(opt.value)}
                        className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                          budget === opt.value
                            ? 'border-brand-gold bg-brand-gold/10 text-slate-950 ring-2 ring-brand-gold/20 dark:bg-brand-gold/15 dark:text-white'
                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-sm font-medium">{opt.label}</span>
                        <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                          budget === opt.value ? 'border-brand-gold bg-brand-gold' : 'border-slate-300'
                        }`}>
                          {budget === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Main purpose */}
              {step === 2 && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.purposeLabel}
                  </label>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { 
                        value: 'Own Stay', 
                        title: lang === 'en' ? 'Own Stay Home Comfort' : '温馨自住',
                        desc: lang === 'en' ? 'Highly prioritize school access, family comfort, safety parameters, and greenery amenities.' : '优先规划学区配套、绿化率及家庭居住舒适感。'
                      },
                      { 
                        value: 'Investment', 
                        title: lang === 'en' ? 'Investment Potential (Capital / Short Let)' : '高额资产理财与投资',
                        desc: lang === 'en' ? 'Focus on high rental yields, strategic financial zones, and tourism Airbnb capacity.' : '侧重金融商圈板块及 Airbnb 旅游旺地高额租金增幅。'
                      },
                      { 
                        value: 'Both', 
                        title: lang === 'en' ? 'Balanced Dual Intent' : '双向平衡意图',
                        desc: lang === 'en' ? 'Optimal blend of spacious layouts with robust historic appreciation rates.' : '均衡考虑未来增值潜能与首期入驻生活便利。'
                      }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPurpose(opt.value)}
                        className={`flex items-start space-x-4 rounded-xl border p-4 text-left transition-all ${
                          purpose === opt.value
                            ? 'border-brand-gold bg-brand-gold/10 text-slate-955 ring-2 ring-brand-gold/20 dark:bg-brand-gold/15 dark:text-white'
                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          purpose === opt.value ? 'border-brand-gold bg-brand-gold' : 'border-slate-300'
                        }`}>
                          {purpose === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{opt.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Multi select states */}
              {step === 3 && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.prefStates}
                  </label>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {lang === 'en' ? 'Select all states that matter to your checklist (Min 1 selected).' : '择优多选，为您网罗匹配的行政圈。'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {availableStates.map((st) => {
                      const isSelected = selectedStates.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleState(st)}
                          className={`flex items-center space-x-3.5 rounded-xl border p-4 text-left transition-all ${
                            isSelected
                              ? 'border-brand-gold bg-brand-gold/10 text-slate-955 ring-2 ring-brand-gold/20 dark:bg-brand-gold/15 dark:text-white'
                              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
                          }`}
                        >
                          <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                            isSelected ? 'border-brand-gold bg-brand-gold text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <CheckCircle className="h-4.5 w-4.5" />}
                          </div>
                          <span className="text-sm font-semibold">{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: Client information details */}
              {step === 4 && (
                <form id="questionnaire-lead-form" onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'en' 
                      ? 'Secure your Smart Match Report by entering your contact channels. No spam guaranteed.' 
                      : '请输入联系通道，以便开发商专员为您发出完整的配套底价表和免佣置业看房报告。'}
                  </p>

                  <div className="space-y-3">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.formName}
                        className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium shadow-xs focus:border-brand-gold focus:outline-hidden focus:ring-1 focus:ring-brand-gold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t.formPhone + ' (e.g. +6019...)'}
                        className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium shadow-xs focus:border-brand-gold focus:outline-hidden focus:ring-1 focus:ring-brand-gold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.formEmail + ' (Optional)'}
                        className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium shadow-xs focus:border-brand-gold focus:outline-hidden focus:ring-1 focus:ring-brand-gold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-900 py-3.5 font-display text-sm font-bold text-white shadow-lg hover:bg-slate-800 dark:bg-brand-gold dark:text-slate-950 dark:hover:bg-brand-gold-hover transition-all cursor-pointer"
                  >
                    <Flame className="h-4 w-4 text-brand-gold dark:text-slate-950" />
                    <span>{t.submit}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Stepper Buttons Control bar */}
            {step < 4 && (
              <div className="flex justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                    step === 1
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {lang === 'en' ? 'Back' : '上一步'}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1 rounded-xl bg-brand-gold px-5.5 py-2.5 font-display text-xs font-extrabold text-white shadow-sm hover:bg-brand-gold-hover transition-all"
                >
                  <span>{t.next}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* SUBMITTED SUCCESS REPORT PANEL */
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-950/30">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Report Generated!' : '房产匹配报告生成成功！'}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 px-4">
              {t.congratsMatches}
            </p>

            {/* Matched recommendations list */}
            <div className="mt-6 space-y-3 max-h-[240px] overflow-y-auto px-1">
              {matchedProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    onViewProject(proj);
                    onClose();
                  }}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-left transition-all hover:bg-slate-100/80 hover:shadow-xs dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900/60"
                  id={`match-card-${proj.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={proj.image} 
                      alt={proj.name}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-lg object-cover shadow-xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-gold dark:text-white transition-colors">
                        {proj.name}
                      </h4>
                      <p className="flex items-center text-[11px] font-semibold text-slate-400 mt-0.5">
                        <MapPin className="mr-0.5 h-3 w-3 text-brand-gold" />
                        <span>{proj.area}, {proj.state}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-extrabold text-brand-gold">
                      RM {(proj.priceMin / 1000000).toFixed(2)}M +
                    </p>
                    <p className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full mt-1 inline-block dark:bg-emerald-500/5">
                      ★ {proj.investmentScore} Investment Score
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center space-x-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {lang === 'en' ? 'Close Window' : '关闭窗口'}
              </button>
              <a
                href={`https://wa.me/60195598932?text=${encodeURIComponent(
                  `Hey! I just completed the Smart Match test. My name is ${name} and I am interested in ${matchedProjects[0]?.name || 'TRX Residences'}. Please send the pricing catalog.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 rounded-xl bg-green-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-green-600"
              >
                <span>{t.whatsAppNow}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
