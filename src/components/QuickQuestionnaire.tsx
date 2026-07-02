/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, Flame, ArrowRight, User, Phone, Mail, MapPin } from 'lucide-react';
import { Project, Lead } from '../types';
import { TRANSLATIONS, getTranslatedProject } from '../utils/translations';

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
  const translatedMatchedProjects = React.useMemo(() => {
    return matchedProjects.map((p) => getTranslatedProject(p, lang));
  }, [matchedProjects, lang]);
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
    const fallbackMatches = filtered.length > 0 ? filtered : projects.slice(0, 3);
    setMatchedProjects(fallbackMatches);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#ebdcb9] animate-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-850 cursor-pointer"
          id="questionnaire-close-btn"
        >
          <X className="h-5 w-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Title Block */}
            <div className="mb-6 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-lg font-black text-stone-900">
                  {t.smartQuestionnaire}
                </h3>
                <p className="text-xs text-stone-500 font-bold">
                  {t.questionnaireSub}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-[11px] font-bold text-stone-400 mb-1">
                <span>Step {step} of 4</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-stone-100">
                <div 
                  className="h-full rounded-full bg-teal-705 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Steps Container */}
            <div className="mb-8 min-h-[220px]">
              
              {/* STEP 1: Budget limit selection */}
              {step === 1 && (
                <div className="space-y-4 text-left">
                  <label className="block text-sm font-black text-stone-900">
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
                        className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
                          budget === opt.value
                            ? 'border-teal-700 bg-teal-500/10 text-stone-950 ring-2 ring-teal-700/20'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-sm font-bold">{opt.label}</span>
                        <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                          budget === opt.value ? 'border-teal-700 bg-teal-750' : 'border-stone-300'
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
                <div className="space-y-4 text-left">
                  <label className="block text-sm font-black text-stone-900">
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
                        className={`flex items-start space-x-4 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                          purpose === opt.value
                            ? 'border-teal-700 bg-teal-500/10 text-stone-950 ring-2 ring-teal-700/20'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          purpose === opt.value ? 'border-teal-700 bg-teal-750' : 'border-stone-300'
                        }`}>
                          {purpose === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-stone-900">{opt.title}</p>
                          <p className="text-xs text-stone-500 mt-1 font-bold">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Multi select states */}
              {step === 3 && (
                <div className="space-y-4 text-left">
                  <label className="block text-sm font-black text-stone-900">
                    {t.prefStates}
                  </label>
                  <p className="text-xs text-stone-500 font-bold">
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
                          className={`flex items-center space-x-3.5 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-teal-700 bg-teal-500/10 text-stone-950 ring-2 ring-teal-700/20'
                              : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                            isSelected ? 'border-teal-700 bg-teal-750 text-white' : 'border-stone-300'
                          }`}>
                            {isSelected && <CheckCircle className="h-4.5 w-4.5" />}
                          </div>
                          <span className="text-sm font-bold">{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: Client information details */}
              {step === 4 && (
                <form id="questionnaire-lead-form" onSubmit={handleSubmit} className="space-y-4 text-left">
                  <p className="text-xs text-stone-500 font-bold">
                    {lang === 'en' 
                      ? 'Secure your Smart Match Report by entering your contact channels. No spam guaranteed.' 
                      : '请输入联系通道，以便开发商专员为您发出完整的配套底价表和免佣置业看房报告。'}
                  </p>

                  <div className="space-y-3">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.formName}
                        className="block w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm font-bold text-stone-900 shadow-xs focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                      />
                    </div>

                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t.formPhone + ' (e.g. +6019...)'}
                        className="block w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm font-bold text-stone-900 shadow-xs focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                      />
                    </div>

                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.formEmail + ' (Optional)'}
                        className="block w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm font-bold text-stone-900 shadow-xs focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-stone-900 py-3.5 font-display text-sm font-black text-white shadow-lg hover:bg-stone-850 transition-all cursor-pointer"
                  >
                    <Flame className="h-4 w-4 text-amber-500" />
                    <span>{t.submit}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Stepper Buttons Control bar */}
            {step < 4 && (
              <div className="flex justify-between border-t border-stone-100 pt-5">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`rounded-lg px-4 py-2 text-sm font-black transition-all ${
                    step === 1
                      ? 'text-stone-300 cursor-not-allowed'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-850 cursor-pointer'
                  }`}
                >
                  {lang === 'en' ? 'Back' : '上一步'}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1 rounded-xl bg-stone-900 text-white hover:bg-stone-850 px-5.5 py-2.5 font-display text-xs font-black shadow-xs cursor-pointer"
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
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-black text-stone-900">
              {lang === 'en' ? 'Report Generated!' : '房产匹配报告生成成功！'}
            </h3>
            <p className="mt-2 text-sm text-stone-500 font-bold px-4 leading-relaxed">
              {t.congratsMatches}
            </p>

            {/* Matched recommendations list */}
            <div className="mt-6 space-y-3 max-h-[240px] overflow-y-auto px-1">
              {translatedMatchedProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    onViewProject(proj);
                    onClose();
                  }}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-3.5 text-left transition-all hover:bg-white hover:border-[#ebdcb9] hover:shadow-xs"
                  id={`match-card-${proj.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={proj.image || undefined} 
                      alt={proj.name}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-lg object-cover shadow-xs"
                    />
                    <div>
                      <h4 className="text-sm font-black text-stone-900 group-hover:text-teal-750 transition-colors">
                        {proj.name}
                      </h4>
                      <p className="flex items-center text-[11px] font-bold text-stone-500 mt-0.5">
                        <MapPin className="mr-0.5 h-3 w-3 text-teal-750" />
                        <span>{proj.area}, {proj.state}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-black text-teal-750">
                      RM {(proj.priceMin / 1000000).toFixed(2)}M +
                    </p>
                    <p className="text-[10px] text-teal-800 font-black bg-teal-500/10 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                      ★ {proj.investmentScore} Score
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center space-x-3 border-t border-stone-100 pt-5">
              <button
                onClick={onClose}
                className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                {lang === 'en' ? 'Close Window' : '关闭窗口'}
              </button>
              <a
                href={`https://wa.me/60195598932?text=${encodeURIComponent(
                  `Hey! I just completed the Smart Match test. My name is ${name} and I am interested in ${matchedProjects[0]?.name || 'TRX Residences'}. Please send the pricing catalog.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-650"
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
