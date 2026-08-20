/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, Home, DollarSign, Percent, TrendingUp, ShieldCheck, FileText, PieChart, 
  BarChart3, RefreshCw, Clock, CreditCard, Building2, Sparkles, CheckCircle2, AlertCircle, 
  Info, ChevronRight, Copy, Check, RotateCcw, ArrowUpRight, Search, Sliders, Layers, Users,
  BedDouble, Wrench, Building, Scale, ShieldAlert, Award
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { CURRENCIES } from '../constants/mockData';

interface CalculatorsPageProps {
  lang: 'en' | 'zh';
  currency: CurrencyCode;
  onOpenConsultation?: (calculatorName: string) => void;
}

// Format numbers nicely in specified currency
function fmt(value: number, currencyCode: CurrencyCode, decimals = 0): string {
  const cfg = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const converted = value * cfg.rate;
  return `${cfg.symbol} ${converted.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

export default function CalculatorsPage({ lang, currency, onOpenConsultation }: CalculatorsPageProps) {
  const isZh = lang === 'zh';
  const currencyCfg = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  // Active Category & Active Calculator State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeCalcId, setActiveCalcId] = useState<string>('housing-loan');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Define the 19 Calculators organized by category
  const categories = useMemo(() => [
    { id: 'all', name: isZh ? '全部计算器 (19)' : 'All Calculators (19)', icon: Layers },
    { id: 'loan', name: isZh ? '按揭贷款工具' : 'Mortgage & Loan Suite', icon: Home },
    { id: 'affordability', name: isZh ? '额度与买房资格' : 'Affordability & Eligibility', icon: CreditCard },
    { id: 'upfront', name: isZh ? '购房首付与税费' : 'Upfront & Legal Costs', icon: FileText },
    { id: 'investment', name: isZh ? '投资与收益分析' : 'Investment & Yield', icon: TrendingUp },
    { id: 'tax-gain', name: isZh ? '利得税与净利润' : 'RPGT & Net Profit', icon: PieChart },
    { id: 'protection', name: isZh ? '房产保险与保障' : 'Insurance & Protection', icon: ShieldCheck }
  ], [isZh]);

  const calculatorsList = useMemo(() => [
    // Category 1: Mortgage & Loan
    { id: 'housing-loan', cat: 'loan', title: isZh ? '房屋按揭贷款计算器' : 'Housing Loan Calculator', desc: isZh ? '估算每月供款额、利息总额及还款计划' : 'Calculate monthly mortgage instalments, interest totals & tenure breakdowns', icon: Home },
    { id: 'amortization', cat: 'loan', title: isZh ? '还款本息摊销表' : 'Amortization Schedule', desc: isZh ? '查看逐年/逐月本金与利息递减趋势' : 'Year-by-year & month-by-month principal vs interest reduction schedule', icon: BarChart3 },
    { id: 'interest-savings', cat: 'loan', title: isZh ? '额外还款利息节省' : 'Interest Savings Calculator', desc: isZh ? '计算多还本金可节省的巨额利息与缩短的年限' : 'Calculate interest saved & months shaved by paying extra principal', icon: DollarSign },
    { id: 'flexi-vs-semi', cat: 'loan', title: isZh ? '全灵活 vs 半灵活贷款对比' : 'Full-Flexi vs Semi-Flexi', desc: isZh ? '评估存入闲置资金对利息的抵扣效果与手续费对比' : 'Compare interest offset with idle cash, monthly fees & withdrawal flexibility', icon: Scale },
    { id: 'refinance', cat: 'loan', title: isZh ? '再融资/转按揭节省计算' : 'Refinance Savings Calculator', desc: isZh ? '比较新旧贷款利率，计算扣除律师费后的净节省金额' : 'Compare interest rates & tenure to calculate net savings after fees', icon: RefreshCw },
    { id: 'early-settlement', cat: 'loan', title: isZh ? '提前还清贷款计算器' : 'Early Settlement Calculator', desc: isZh ? '计算一次性结清贷款所需金额及罚金违约期' : 'Calculate payoff amount, lock-in period penalty & interest saved', icon: Clock },

    // Category 2: Affordability & Eligibility
    { id: 'dsr', cat: 'affordability', title: isZh ? 'DSR 负债率与贷款通过率' : 'DSR (Debt Service Ratio)', desc: isZh ? '计算个人及家庭 DSR 比例，评估各大银行审批成功率' : 'Calculate your DSR % and evaluate Malaysian bank approval thresholds', icon: Percent },
    { id: 'affordability', cat: 'affordability', title: isZh ? '最高可买房价测算' : 'Loan Affordability Calculator', desc: isZh ? '根据净收入与现有负债，倒推最高可负担房价' : 'Determine maximum property price & loan amount based on net income', icon: CreditCard },

    // Category 3: Upfront & Legal Costs
    { id: 'stamp-duty-legal', cat: 'upfront', title: isZh ? '印花税与律师费计算器' : 'Stamp Duty & Legal Fee', desc: isZh ? '计算 MOT 地契过户印花税、买卖合约及贷款合约律师费' : 'Calculate MOT Stamp Duty, SPA Legal Fees & Loan Agreement fees', icon: FileText },
    { id: 'total-buying-cost', cat: 'upfront', title: isZh ? '购房首付与总筹备资金' : 'Total Buying Cost Calculator', desc: isZh ? '汇集首付款、印花税、律师费及估值费的全额现金开销' : 'Total upfront cash required including down payment, legal fees & valuation', icon: Building2 },
    { id: 'renovation-cost', cat: 'upfront', title: isZh ? '装修与软装预算评估' : 'Renovation Cost Estimator', desc: isZh ? '根据建筑面积与装修档次估算硬装、软装及家具预算' : 'Estimate interior design, wet works, furniture & electrical appliances', icon: Wrench },

    // Category 4: Investment & Yield
    { id: 'rent-vs-buy', cat: 'investment', title: isZh ? '买房 vs 租房终极对比' : 'Rent vs Buy Calculator', desc: isZh ? '比较10-20年积累的长期资产与投资理财复利回报' : 'Compare 10-20 year wealth accumulation of homeownership vs renting', icon: Scale },
    { id: 'rental-yield', cat: 'investment', title: isZh ? '长租收益率计算器' : 'Rental Yield Calculator', desc: isZh ? '精准计算毛租金收益率与扣除物业费/地税后的净收益率' : 'Calculate Gross & Net Rental Yield % after operational expenses', icon: TrendingUp },
    { id: 'airbnb-yield', cat: 'investment', title: isZh ? '民宿/Airbnb 短租收益' : 'Airbnb & Homestay Yield', desc: isZh ? '结合入住率、每晚房价、清洁与平台费评估每月净利润' : 'Calculate monthly occupancy, nightly rates, platform fees & net ROI', icon: BedDouble },
    { id: 'investment-risk', cat: 'investment', title: isZh ? '现金流与投资风险评估' : 'Investment Risk & Cash Flow', desc: isZh ? '评估每月净现金流、现金回报率(CoC)及盈亏平衡入住率' : 'Calculate monthly net cash flow, Cash-on-Cash Return & break-even rate', icon: AlertCircle },

    // Category 5: RPGT & Net Profit
    { id: 'rpgt', cat: 'tax-gain', title: isZh ? 'RPGT 产业盈利税计算器' : 'RPGT (Real Property Gains Tax)', desc: isZh ? '按持有年限、身份及豁免额计算出售房产需缴纳的盈利税' : 'Calculate Malaysian RPGT tax liability based on holding years & status', icon: PieChart },
    { id: 'property-gain', cat: 'tax-gain', title: isZh ? '卖房净利润与投资回报' : 'Property Gain (Net Profit)', desc: isZh ? '扣除买卖律师费、中介佣金、装修费及 RPGT 后的纯利润' : 'Calculate net capital gains after deducting renovation, legal & agent fees', icon: DollarSign },

    // Category 6: Insurance & Protection
    { id: 'fire-insurance', cat: 'protection', title: isZh ? '火险与建筑保险费估算' : 'Fire Insurance Calculator', desc: isZh ? '根据房屋重建价值与房屋类型估算每年火险保费' : 'Estimate annual fire & houseowner building insurance premiums', icon: ShieldAlert },
    { id: 'mrta-vs-mlta', cat: 'protection', title: isZh ? 'MRTA vs MLTA 递减/平准房贷险' : 'MRTA vs MLTA Comparison', desc: isZh ? '对比一次性缴费保障与可转让储蓄型房贷险的优劣' : 'Compare Mortgage Reducing vs Level Term Assurance coverage & benefits', icon: ShieldCheck }
  ], [isZh]);

  // Filtered list
  const filteredCalculators = useMemo(() => {
    return calculatorsList.filter(c => {
      const matchCat = activeCategory === 'all' || c.cat === activeCategory;
      const matchSearch = searchQuery.trim() === '' || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [calculatorsList, activeCategory, searchQuery]);

  // ==========================================
  // STATE & CALCULATIONS FOR INDIVIDUAL CALCULATORS
  // ==========================================

  // 1. Housing Loan
  const [hlPrice, setHlPrice] = useState<number>(750000);
  const [hlDownPct, setHlDownPct] = useState<number>(10);
  const [hlRate, setHlRate] = useState<number>(4.1);
  const [hlTenure, setHlTenure] = useState<number>(35);

  const hlLoanAmount = hlPrice * (1 - hlDownPct / 100);
  const hlMonthlyRate = hlRate / 100 / 12;
  const hlTotalMonths = hlTenure * 12;
  const hlMonthlyPayment = useMemo(() => {
    if (hlMonthlyRate === 0) return hlLoanAmount / hlTotalMonths;
    return (hlLoanAmount * hlMonthlyRate * Math.pow(1 + hlMonthlyRate, hlTotalMonths)) / 
           (Math.pow(1 + hlMonthlyRate, hlTotalMonths) - 1);
  }, [hlLoanAmount, hlMonthlyRate, hlTotalMonths]);
  const hlTotalPayment = hlMonthlyPayment * hlTotalMonths;
  const hlTotalInterest = hlTotalPayment - hlLoanAmount;

  // 2. Amortization Schedule
  const hlAmortizationSchedule = useMemo(() => {
    let balance = hlLoanAmount;
    const yearly = [];
    let cumInterest = 0;
    let cumPrincipal = 0;

    for (let yr = 1; yr <= hlTenure; yr++) {
      let yrInterest = 0;
      let yrPrincipal = 0;
      for (let m = 1; m <= 12; m++) {
        const interestM = balance * hlMonthlyRate;
        const principalM = hlMonthlyPayment - interestM;
        yrInterest += interestM;
        yrPrincipal += principalM;
        balance -= principalM;
      }
      if (balance < 0) balance = 0;
      cumInterest += yrInterest;
      cumPrincipal += yrPrincipal;
      yearly.push({
        year: yr,
        principalPaid: yrPrincipal,
        interestPaid: yrInterest,
        endingBalance: balance,
        cumInterest,
        cumPrincipal
      });
    }
    return yearly;
  }, [hlLoanAmount, hlTenure, hlMonthlyRate, hlMonthlyPayment]);

  // 3. Interest Savings
  const [isExtraMonthly, setIsExtraMonthly] = useState<number>(500);
  const [isLumpSum, setIsLumpSum] = useState<number>(30000);
  const [isLumpSumYear, setIsLumpSumYear] = useState<number>(3);

  const interestSavingsResult = useMemo(() => {
    let balanceNormal = hlLoanAmount;
    let balanceExtra = hlLoanAmount;
    let monthsNormal = 0;
    let monthsExtra = 0;
    let totalIntNormal = 0;
    let totalIntExtra = 0;

    // Normal calculation
    while (balanceNormal > 1 && monthsNormal < 600) {
      monthsNormal++;
      const int = balanceNormal * hlMonthlyRate;
      totalIntNormal += int;
      const prin = hlMonthlyPayment - int;
      balanceNormal -= prin;
    }

    // Extra calculation
    while (balanceExtra > 1 && monthsExtra < 600) {
      monthsExtra++;
      // Apply lump sum if year matches
      if (monthsExtra === isLumpSumYear * 12) {
        balanceExtra = Math.max(0, balanceExtra - isLumpSum);
      }
      const int = balanceExtra * hlMonthlyRate;
      totalIntExtra += int;
      let payment = hlMonthlyPayment + isExtraMonthly;
      if (payment > balanceExtra + int) payment = balanceExtra + int;
      const prin = Math.max(0, payment - int);
      balanceExtra -= prin;
    }

    const savedInterest = Math.max(0, totalIntNormal - totalIntExtra);
    const monthsSaved = Math.max(0, monthsNormal - monthsExtra);

    return { savedInterest, monthsSaved, yearsSaved: (monthsSaved / 12).toFixed(1) };
  }, [hlLoanAmount, hlMonthlyRate, hlMonthlyPayment, isExtraMonthly, isLumpSum, isLumpSumYear]);

  // 4. Full-Flexi vs Semi-Flexi
  const [flexiParkedCash, setFlexiParkedCash] = useState<number>(80000);
  const [flexiMonthlyFee, setFlexiMonthlyFee] = useState<number>(10);
  const [semiWithdrawalFee, setSemiWithdrawalFee] = useState<number>(50);
  const [semiWithdrawalsPerYr, setSemiWithdrawalsPerYr] = useState<number>(2);

  const flexiComparison = useMemo(() => {
    // Interest saved per year by offset
    const annualInterestSaved = flexiParkedCash * (hlRate / 100);
    const fullFlexiNetAnnualSavings = annualInterestSaved - (flexiMonthlyFee * 12);
    const semiFlexiNetAnnualSavings = annualInterestSaved - (semiWithdrawalFee * semiWithdrawalsPerYr);

    return {
      annualInterestSaved,
      fullFlexiNetAnnualSavings,
      semiFlexiNetAnnualSavings,
      fullFlexiLifetimeSavings: fullFlexiNetAnnualSavings * hlTenure,
      semiFlexiLifetimeSavings: semiFlexiNetAnnualSavings * hlTenure
    };
  }, [flexiParkedCash, hlRate, flexiMonthlyFee, semiWithdrawalFee, semiWithdrawalsPerYr, hlTenure]);

  // 5. Refinance Savings
  const [refinBalance, setRefinBalance] = useState<number>(500000);
  const [refinOldRate, setRefinOldRate] = useState<number>(4.8);
  const [refinNewRate, setRefinNewRate] = useState<number>(3.85);
  const [refinRemainingYears, setRefinRemainingYears] = useState<number>(25);
  const [refinLegalFee, setRefinLegalFee] = useState<number>(7500);

  const refinanceResult = useMemo(() => {
    const rOld = refinOldRate / 100 / 12;
    const rNew = refinNewRate / 100 / 12;
    const n = refinRemainingYears * 12;

    const oldMonthly = (refinBalance * rOld * Math.pow(1 + rOld, n)) / (Math.pow(1 + rOld, n) - 1);
    const newMonthly = (refinBalance * rNew * Math.pow(1 + rNew, n)) / (Math.pow(1 + rNew, n) - 1);

    const monthlySavings = oldMonthly - newMonthly;
    const grossLifetimeSavings = monthlySavings * n;
    const netLifetimeSavings = grossLifetimeSavings - refinLegalFee;
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(refinLegalFee / monthlySavings) : 0;

    return { oldMonthly, newMonthly, monthlySavings, grossLifetimeSavings, netLifetimeSavings, breakEvenMonths };
  }, [refinBalance, refinOldRate, refinNewRate, refinRemainingYears, refinLegalFee]);

  // 6. Early Settlement
  const [esBalance, setEsBalance] = useState<number>(420000);
  const [esRate, setEsRate] = useState<number>(4.1);
  const [esYearsLeft, setEsYearsLeft] = useState<number>(20);
  const [esInLockIn, setEsInLockIn] = useState<boolean>(true);
  const [esPenaltyPct, setEsPenaltyPct] = useState<number>(3.0);

  const earlySettlementResult = useMemo(() => {
    const penaltyAmount = esInLockIn ? esBalance * (esPenaltyPct / 100) : 0;
    const totalPayoff = esBalance + penaltyAmount;

    const r = esRate / 100 / 12;
    const n = esYearsLeft * 12;
    const monthly = (esBalance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const remainingTotalPayments = monthly * n;
    const interestSaved = remainingTotalPayments - esBalance - penaltyAmount;

    return { penaltyAmount, totalPayoff, interestSaved, monthly };
  }, [esBalance, esRate, esYearsLeft, esInLockIn, esPenaltyPct]);

  // 7. DSR (Debt Service Ratio)
  const [dsrBasicIncome, setDsrBasicIncome] = useState<number>(8500);
  const [dsrOtherIncome, setDsrOtherIncome] = useState<number>(1500);
  const [dsrEpfSocsoPct, setDsrEpfSocsoPct] = useState<number>(11);
  const [dsrCarLoan, setDsrCarLoan] = useState<number>(850);
  const [dsrPersonalLoan, setDsrPersonalLoan] = useState<number>(300);
  const [dsrCreditCard, setDsrCreditCard] = useState<number>(250);
  const [dsrPtptn, setDsrPtptn] = useState<number>(150);
  const [dsrExistingHouseLoan, setDsrExistingHouseLoan] = useState<number>(0);
  const [dsrNewMortgage, setDsrNewMortgage] = useState<number>(2800);

  const dsrResult = useMemo(() => {
    const grossIncome = dsrBasicIncome + (dsrOtherIncome * 0.8); // 80% weight for secondary
    const netIncome = grossIncome * (1 - dsrEpfSocsoPct / 100);
    const existingCommitments = dsrCarLoan + dsrPersonalLoan + dsrCreditCard + dsrPtptn + dsrExistingHouseLoan;
    const totalCommitments = existingCommitments + dsrNewMortgage;

    const dsrPct = netIncome > 0 ? (totalCommitments / netIncome) * 100 : 0;

    // Bank thresholds in Malaysia: Net Income <= RM5,000 -> Max DSR 60%; Net Income > RM5,000 -> Max DSR 70%
    const maxThreshold = netIncome > 5000 ? 70 : 60;
    let status = 'approved';
    if (dsrPct > maxThreshold) status = 'rejected';
    else if (dsrPct > maxThreshold - 5) status = 'borderline';

    return { grossIncome, netIncome, existingCommitments, totalCommitments, dsrPct, maxThreshold, status };
  }, [dsrBasicIncome, dsrOtherIncome, dsrEpfSocsoPct, dsrCarLoan, dsrPersonalLoan, dsrCreditCard, dsrPtptn, dsrExistingHouseLoan, dsrNewMortgage]);

  // 8. Loan Affordability
  const [affNetIncome, setAffNetIncome] = useState<number>(7500);
  const [affCommitments, setAffCommitments] = useState<number>(1200);
  const [affTargetDsr, setAffTargetDsr] = useState<number>(65);
  const [affRate, setAffRate] = useState<number>(4.1);
  const [affTenure, setAffTenure] = useState<number>(35);
  const [affDownPct, setAffDownPct] = useState<number>(10);

  const affordabilityResult = useMemo(() => {
    const maxMonthlyCapacity = (affNetIncome * (affTargetDsr / 100)) - affCommitments;
    const safeMonthly = Math.max(0, maxMonthlyCapacity);

    const r = affRate / 100 / 12;
    const n = affTenure * 12;
    const maxLoan = r > 0 ? (safeMonthly * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) : 0;
    const maxPropertyPrice = maxLoan / (1 - affDownPct / 100);

    return { safeMonthly, maxLoan, maxPropertyPrice, requiredDownpayment: maxPropertyPrice * (affDownPct / 100) };
  }, [affNetIncome, affCommitments, affTargetDsr, affRate, affTenure, affDownPct]);

  // 9. Stamp Duty & Legal Fee
  const [sdPrice, setSdPrice] = useState<number>(750000);
  const [sdLoanPct, setSdLoanPct] = useState<number>(90);
  const [sdFirstHomeExemption, setSdFirstHomeExemption] = useState<boolean>(false);

  const stampDutyResult = useMemo(() => {
    const loanAmount = sdPrice * (sdLoanPct / 100);

    // MOT Tiered Stamp Duty Calculation
    let motStampDuty = 0;
    if (sdPrice <= 100000) {
      motStampDuty = sdPrice * 0.01;
    } else if (sdPrice <= 500000) {
      motStampDuty = (100000 * 0.01) + ((sdPrice - 100000) * 0.02);
    } else if (sdPrice <= 1000000) {
      motStampDuty = (100000 * 0.01) + (400000 * 0.02) + ((sdPrice - 500000) * 0.03);
    } else {
      motStampDuty = (100000 * 0.01) + (400000 * 0.02) + (500000 * 0.03) + ((sdPrice - 1000000) * 0.04);
    }

    // Apply First-Home Buyer Exemption rules (Full exemption <= RM500,000)
    if (sdFirstHomeExemption) {
      if (sdPrice <= 500000) {
        motStampDuty = 0;
      } else if (sdPrice <= 1000000) {
        motStampDuty = motStampDuty * 0.25; // 75% discount
      }
    }

    // SPA Legal Fees Scale
    let spaLegalFee = 0;
    if (sdPrice <= 500000) {
      spaLegalFee = Math.max(500, sdPrice * 0.0125);
    } else if (sdPrice <= 1000000) {
      spaLegalFee = (500000 * 0.0125) + ((sdPrice - 500000) * 0.01);
    } else {
      spaLegalFee = (500000 * 0.0125) + (500000 * 0.01) + ((sdPrice - 1000000) * 0.009);
    }
    const spaSst = spaLegalFee * 0.08;

    // Loan Agreement Stamp Duty (0.5%)
    let loanStampDuty = loanAmount * 0.005;
    if (sdFirstHomeExemption && sdPrice <= 500000) {
      loanStampDuty = 0;
    }

    // Loan Agreement Legal Fee (Same scale)
    let loanLegalFee = 0;
    if (loanAmount <= 500000) {
      loanLegalFee = Math.max(500, loanAmount * 0.0125);
    } else if (loanAmount <= 1000000) {
      loanLegalFee = (500000 * 0.0125) + ((loanAmount - 500000) * 0.01);
    } else {
      loanLegalFee = (500000 * 0.0125) + (500000 * 0.01) + ((loanAmount - 1000000) * 0.009);
    }
    const loanSst = loanLegalFee * 0.08;

    const totalFees = motStampDuty + spaLegalFee + spaSst + loanStampDuty + loanLegalFee + loanSst;

    return {
      motStampDuty,
      spaLegalFee,
      spaSst,
      loanStampDuty,
      loanLegalFee,
      loanSst,
      totalFees
    };
  }, [sdPrice, sdLoanPct, sdFirstHomeExemption]);

  // 10. Total Buying Cost
  const [tbcPrice, setTbcPrice] = useState<number>(680000);
  const [tbcDownPct, setTbcDownPct] = useState<number>(10);
  const [tbcValuationFee, setTbcValuationFee] = useState<number>(1800);
  const [tbcDisbursement, setTbcDisbursement] = useState<number>(2000);

  const totalBuyingCostResult = useMemo(() => {
    const downPayment = tbcPrice * (tbcDownPct / 100);
    const loanAmount = tbcPrice - downPayment;

    // MOT Stamp Duty
    let motStampDuty = 0;
    if (tbcPrice <= 100000) motStampDuty = tbcPrice * 0.01;
    else if (tbcPrice <= 500000) motStampDuty = 1000 + (tbcPrice - 100000) * 0.02;
    else if (tbcPrice <= 1000000) motStampDuty = 9000 + (tbcPrice - 500000) * 0.03;
    else motStampDuty = 24000 + (tbcPrice - 1000000) * 0.04;

    // SPA Legal
    let spaFee = tbcPrice <= 500000 ? Math.max(500, tbcPrice * 0.0125) : 6250 + (tbcPrice - 500000) * 0.01;
    let loanFee = loanAmount <= 500000 ? Math.max(500, loanAmount * 0.0125) : 6250 + (loanAmount - 500000) * 0.01;
    let loanStamp = loanAmount * 0.005;

    const legalAndStamps = motStampDuty + (spaFee * 1.08) + (loanFee * 1.08) + loanStamp + tbcValuationFee + tbcDisbursement;
    const totalCashRequired = downPayment + legalAndStamps;

    return { downPayment, legalAndStamps, totalCashRequired, motStampDuty };
  }, [tbcPrice, tbcDownPct, tbcValuationFee, tbcDisbursement]);

  // 11. Renovation Cost
  const [renoSqft, setRenoSqft] = useState<number>(950);
  const [renoQuality, setRenoQuality] = useState<'basic' | 'medium' | 'luxury'>('medium');
  const [renoFurnishings, setRenoFurnishings] = useState<number>(25000);
  const [renoContingencyPct, setRenoContingencyPct] = useState<number>(10);

  const renoResult = useMemo(() => {
    let psf = 45; // basic
    if (renoQuality === 'medium') psf = 80;
    if (renoQuality === 'luxury') psf = 140;

    const baseRenovation = renoSqft * psf;
    const subtotal = baseRenovation + renoFurnishings;
    const contingency = subtotal * (renoContingencyPct / 100);
    const grandTotal = subtotal + contingency;

    return { baseRenovation, furnishings: renoFurnishings, contingency, grandTotal, psf };
  }, [renoSqft, renoQuality, renoFurnishings, renoContingencyPct]);

  // 12. Rent vs Buy
  const [rvbPropPrice, setRvbPropPrice] = useState<number>(650000);
  const [rvbMonthlyRent, setRvbMonthlyRent] = useState<number>(2200);
  const [rvbAppreciationRate, setRvbAppreciationRate] = useState<number>(3.5);
  const [rvbRentInflation, setRvbRentInflation] = useState<number>(2.5);
  const [rvbInvestmentReturn, setRvbInvestmentReturn] = useState<number>(6.0);

  const rentVsBuyResult = useMemo(() => {
    const downPayment = rvbPropPrice * 0.1;
    const r = 4.1 / 100 / 12;
    const n = 35 * 12;
    const monthlyMortgage = (rvbPropPrice * 0.9 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const maintenance = 300;
    const buyMonthlyOutflow = monthlyMortgage + maintenance;

    // 10-Year Projections
    const propValue10Yr = rvbPropPrice * Math.pow(1 + rvbAppreciationRate / 100, 10);
    const remainingLoan10Yr = rvbPropPrice * 0.9 * 0.81; // approx balance after 10 yrs
    const buyNetEquity10Yr = propValue10Yr - remainingLoan10Yr;

    // Rent Investment Portfolio 10-Year
    let renterPortfolio = downPayment * Math.pow(1 + rvbInvestmentReturn / 100, 10);
    let rentTemp = rvbMonthlyRent;
    for (let yr = 1; yr <= 10; yr++) {
      const diffMonthly = Math.max(0, buyMonthlyOutflow - rentTemp);
      renterPortfolio += diffMonthly * 12 * Math.pow(1 + rvbInvestmentReturn / 100, 10 - yr);
      rentTemp *= (1 + rvbRentInflation / 100);
    }

    return { buyNetEquity10Yr, renterPortfolio, propValue10Yr, buyMonthlyOutflow };
  }, [rvbPropPrice, rvbMonthlyRent, rvbAppreciationRate, rvbRentInflation, rvbInvestmentReturn]);

  // 13. Rental Yield
  const [ryPurchasePrice, setRyPurchasePrice] = useState<number>(550000);
  const [ryRenoFurnishing, setRyRenoFurnishing] = useState<number>(40000);
  const [ryMonthlyRent, setRyMonthlyRent] = useState<number>(2800);
  const [ryMonthlyMaint, setRyMonthlyMaint] = useState<number>(280);
  const [ryAnnualTaxes, setRyAnnualTaxes] = useState<number>(1200);

  const rentalYieldResult = useMemo(() => {
    const totalCost = ryPurchasePrice + ryRenoFurnishing;
    const annualGrossRent = ryMonthlyRent * 12;
    const annualExpenses = (ryMonthlyMaint * 12) + ryAnnualTaxes;
    const annualNetRent = annualGrossRent - annualExpenses;

    const grossYield = (annualGrossRent / totalCost) * 100;
    const netYield = (annualNetRent / totalCost) * 100;

    return { totalCost, annualGrossRent, annualExpenses, annualNetRent, grossYield, netYield };
  }, [ryPurchasePrice, ryRenoFurnishing, ryMonthlyRent, ryMonthlyMaint, ryAnnualTaxes]);

  // 14. Airbnb Yield
  const [abNightlyRate, setAbNightlyRate] = useState<number>(280);
  const [abOccupancyPct, setAbOccupancyPct] = useState<number>(65);
  const [abPlatformFeePct, setAbPlatformFeePct] = useState<number>(15);
  const [abMonthlyUtilities, setAbMonthlyUtilities] = useState<number>(450);
  const [abManagementFeePct, setAbManagementFeePct] = useState<number>(18);
  const [abTotalPropertyCost, setAbTotalPropertyCost] = useState<number>(600000);

  const airbnbYieldResult = useMemo(() => {
    const nightsBooked = Math.round(30 * (abOccupancyPct / 100));
    const grossMonthlyRevenue = nightsBooked * abNightlyRate;
    const platformFee = grossMonthlyRevenue * (abPlatformFeePct / 100);
    const managementFee = grossMonthlyRevenue * (abManagementFeePct / 100);
    const netMonthlyProfit = grossMonthlyRevenue - platformFee - managementFee - abMonthlyUtilities;
    const annualNetProfit = netMonthlyProfit * 12;
    const annualRoiPct = (annualNetProfit / abTotalPropertyCost) * 100;

    return { nightsBooked, grossMonthlyRevenue, platformFee, managementFee, netMonthlyProfit, annualNetProfit, annualRoiPct };
  }, [abNightlyRate, abOccupancyPct, abPlatformFeePct, abMonthlyUtilities, abManagementFeePct, abTotalPropertyCost]);

  // 15. Investment Risk & Cash Flow
  const [cfRentIncome, setCfRentIncome] = useState<number>(3200);
  const [cfMortgagePayment, setCfMortgagePayment] = useState<number>(2450);
  const [cfMaintenanceFee, setCfMaintenanceFee] = useState<number>(320);
  const [cfVacancyReservePct, setCfVacancyReservePct] = useState<number>(5);
  const [cfInitialCashOutlay, setCfInitialCashOutlay] = useState<number>(85000);

  const cashFlowResult = useMemo(() => {
    const vacancyReserve = cfRentIncome * (cfVacancyReservePct / 100);
    const netMonthlyCashFlow = cfRentIncome - cfMortgagePayment - cfMaintenanceFee - vacancyReserve;
    const annualCashFlow = netMonthlyCashFlow * 12;
    const cashOnCashReturn = (annualCashFlow / cfInitialCashOutlay) * 100;

    return { vacancyReserve, netMonthlyCashFlow, annualCashFlow, cashOnCashReturn };
  }, [cfRentIncome, cfMortgagePayment, cfMaintenanceFee, cfVacancyReservePct, cfInitialCashOutlay]);

  // 16. RPGT
  const [rpgtPurchasePrice, setRpgtPurchasePrice] = useState<number>(500000);
  const [rpgtSellingPrice, setRpgtSellingPrice] = useState<number>(850000);
  const [rpgtHoldingYears, setRpgtHoldingYears] = useState<number>(4);
  const [rpgtDeductions, setRpgtDeductions] = useState<number>(45000); // reno + legal + agent
  const [rpgtSellerType, setRpgtSellerType] = useState<'citizen' | 'foreigner' | 'company'>('citizen');

  const rpgtResult = useMemo(() => {
    const grossProfit = rpgtSellingPrice - rpgtPurchasePrice;
    const netGainBeforeExemption = Math.max(0, grossProfit - rpgtDeductions);

    // Individual Exemption: Higher of RM10,000 or 10% of net gain
    let exemption = 0;
    if (rpgtSellerType === 'citizen') {
      exemption = Math.max(10000, netGainBeforeExemption * 0.10);
    }
    const taxableGain = Math.max(0, netGainBeforeExemption - exemption);

    // Rate lookup based on holding year
    let taxRate = 0;
    if (rpgtSellerType === 'citizen') {
      if (rpgtHoldingYears <= 3) taxRate = 30;
      else if (rpgtHoldingYears === 4) taxRate = 20;
      else if (rpgtHoldingYears === 5) taxRate = 15;
      else taxRate = 0; // 0% after 5 years for Malaysian citizens/PR
    } else if (rpgtSellerType === 'foreigner') {
      if (rpgtHoldingYears <= 5) taxRate = 30;
      else taxRate = 10;
    } else { // Company
      if (rpgtHoldingYears <= 3) taxRate = 30;
      else if (rpgtHoldingYears === 4) taxRate = 20;
      else if (rpgtHoldingYears === 5) taxRate = 15;
      else taxRate = 10;
    }

    const rpgtPayable = taxableGain * (taxRate / 100);

    return { grossProfit, netGainBeforeExemption, exemption, taxableGain, taxRate, rpgtPayable };
  }, [rpgtPurchasePrice, rpgtSellingPrice, rpgtHoldingYears, rpgtDeductions, rpgtSellerType]);

  // 17. Property Gain (Net Profit)
  const [pgPurchasePrice, setPgPurchasePrice] = useState<number>(600000);
  const [pgSellingPrice, setPgSellingPrice] = useState<number>(920000);
  const [pgRenovationCost, setPgRenovationCost] = useState<number>(50000);
  const [pgAcquisitionLegal, setPgAcquisitionLegal] = useState<number>(12000);
  const [pgAgentCommissionPct, setPgAgentCommissionPct] = useState<number>(3.0);
  const [pgRpgtTax, setPgRpgtTax] = useState<number>(18000);

  const propertyGainResult = useMemo(() => {
    const grossGain = pgSellingPrice - pgPurchasePrice;
    const agentFee = pgSellingPrice * (pgAgentCommissionPct / 100) * 1.08; // 8% SST
    const totalExpenses = pgRenovationCost + pgAcquisitionLegal + agentFee + pgRpgtTax;
    const netProfit = grossGain - totalExpenses;
    const roiPct = (netProfit / (pgPurchasePrice * 0.1 + pgAcquisitionLegal + pgRenovationCost)) * 100;

    return { grossGain, agentFee, totalExpenses, netProfit, roiPct };
  }, [pgPurchasePrice, pgSellingPrice, pgRenovationCost, pgAcquisitionLegal, pgAgentCommissionPct, pgRpgtTax]);

  // 18. Fire Insurance
  const [fiSumInsured, setFiSumInsured] = useState<number>(450000);
  const [fiPropertyType, setFiPropertyType] = useState<'condo' | 'landed'>('condo');

  const fireInsuranceResult = useMemo(() => {
    // Tariff rate: Condo/Apartment 0.106%, Landed House 0.109%
    const rate = fiPropertyType === 'condo' ? 0.00106 : 0.00109;
    const basePremium = fiSumInsured * rate;
    const sst = basePremium * 0.08;
    const stampDuty = 10;
    const totalAnnualPremium = basePremium + sst + stampDuty;

    return { basePremium, sst, stampDuty, totalAnnualPremium };
  }, [fiSumInsured, fiPropertyType]);

  // Copy Summary Handler
  const handleCopySummary = (title: string, content: string) => {
    navigator.clipboard.writeText(`${title} - MalaysianHomes Summary:\n\n${content}`);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 pb-24 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Banner Header */}
        <div className="relative overflow-hidden rounded-3xl bg-stone-900 p-6 sm:p-10 text-white shadow-xl mb-8">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 rounded-full bg-stone-800/80 px-3.5 py-1 text-xs font-bold text-brand-gold border border-brand-gold/30 mb-4">
              <Calculator className="h-3.5 w-3.5" />
              <span>{isZh ? '全马最权威房产与按揭计算工具箱' : 'Malaysia Real Estate & Mortgage Financial Suite'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 font-display">
              {isZh ? '马来西亚全方位房产智能计算器' : 'Malaysia Comprehensive Property Calculators'}
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              {isZh 
                ? '支持Bank Negara最新基准利率算法，全面涵盖房贷供款、DSR负债率、印花税律师费、首付筹备、租金收益率、Airbnb民宿回报及RPGT产业盈利税等19个专业测算工具。'
                : 'Engineered with official BNM interest standards, IRB stamp duty tiers & SRO legal fee scales. Access 19 specialized financial tools for smart property decisions in Malaysia.'}
            </p>

            {/* Quick Search Input */}
            <div className="mt-6 flex items-center max-w-md bg-stone-800/90 rounded-xl px-3.5 py-2.5 border border-stone-700/80 focus-within:border-brand-gold">
              <Search className="h-4 w-4 text-stone-400 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder={isZh ? '搜索计算器 (如: 印花税, DSR, Airbnb, RPGT)...' : 'Search calculator (e.g., Stamp Duty, DSR, Refinance)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-stone-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-brand-gold' : 'text-stone-400'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Grid: Left Selector List, Right Interactive Calculator Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: List of Calculators (4 Cols) */}
          <div className="lg:col-span-4 space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
            <div className="text-xs font-black text-stone-400 uppercase tracking-wider px-1 mb-2">
              {isZh ? `找到 ${filteredCalculators.length} 个计算工具` : `Available Tools (${filteredCalculators.length})`}
            </div>

            {filteredCalculators.map((calc) => {
              const Icon = calc.icon;
              const isSelected = activeCalcId === calc.id;
              return (
                <button
                  key={calc.id}
                  onClick={() => setActiveCalcId(calc.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                    isSelected
                      ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/80 text-stone-800'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    isSelected ? 'bg-brand-gold text-stone-900' : 'bg-stone-100 text-stone-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold truncate">{calc.title}</h3>
                      <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-brand-gold' : 'text-stone-300'}`} />
                    </div>
                    <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                      {calc.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Calculator Interface (8 Cols) */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            
            {/* CALCULATOR 1: Housing Loan */}
            {activeCalcId === 'housing-loan' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">{isZh ? '房屋按揭贷款计算器' : 'Housing Loan Calculator'}</h2>
                    <p className="text-xs text-stone-500 mt-0.5">{isZh ? '标准等额本息月供算法与利息总额折算' : 'Standard amortized mortgage monthly instalment calculation'}</p>
                  </div>
                  <button 
                    onClick={() => handleCopySummary('Housing Loan', `Price: ${fmt(hlPrice, currency)}, Loan: ${fmt(hlLoanAmount, currency)}, Monthly Payment: ${fmt(hlMonthlyPayment, currency)}`)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold hover:bg-stone-50 text-stone-600"
                  >
                    {copiedSuccess ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSuccess ? (isZh ? '已复制结果' : 'Copied') : (isZh ? '复制结果' : 'Copy')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '房屋总价' : 'Property Purchase Price'}</label>
                    <input 
                      type="number" 
                      value={hlPrice} 
                      onChange={(e) => setHlPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-stone-400 font-medium">
                      <span>{fmt(hlPrice, currency)}</span>
                      <span>MYR {hlPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '首付款比例 (%)' : 'Down Payment (%)'}</label>
                    <input 
                      type="number" 
                      value={hlDownPct} 
                      onChange={(e) => setHlDownPct(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                    <div className="mt-1 flex justify-between text-[11px] text-stone-400">
                      <span>{isZh ? '首付金额:' : 'Downpayment:'} {fmt(hlPrice * (hlDownPct / 100), currency)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '年贷款利率 (%)' : 'Annual Interest Rate (%)'}</label>
                    <input 
                      type="number" 
                      step="0.05"
                      value={hlRate} 
                      onChange={(e) => setHlRate(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                    <span className="text-[10px] text-stone-400">{isZh ? '大马主流银行房贷利率: 3.85% - 4.25%' : 'Standard Malaysian Bank Rates: 3.85% - 4.25%'}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '贷款年限 (年)' : 'Loan Tenure (Years)'}</label>
                    <input 
                      type="number" 
                      value={hlTenure} 
                      onChange={(e) => setHlTenure(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                    <span className="text-[10px] text-stone-400">{isZh ? '银行最高年限为 35 年或至 70 岁' : 'Maximum 35 years or up to age 70'}</span>
                  </div>
                </div>

                {/* Calculation Output Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-brand-gold/30">
                    <span className="text-[11px] font-bold text-stone-500 uppercase">{isZh ? '估计每月供款' : 'Monthly Instalment'}</span>
                    <div className="text-xl font-extrabold text-stone-900 mt-1">{fmt(hlMonthlyPayment, currency)}</div>
                    <span className="text-[10px] text-stone-400 font-medium">{hlTenure} {isZh ? '年还款期' : 'Years Tenure'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="text-[11px] font-bold text-stone-500 uppercase">{isZh ? '实际贷款总额' : 'Loan Principal'}</span>
                    <div className="text-xl font-bold text-stone-800 mt-1">{fmt(hlLoanAmount, currency)}</div>
                    <span className="text-[10px] text-stone-400">{100 - hlDownPct}% {isZh ? '贷款比例' : 'Margin of Finance'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="text-[11px] font-bold text-stone-500 uppercase">{isZh ? '累计利息支出' : 'Total Interest'}</span>
                    <div className="text-xl font-bold text-red-600 mt-1">{fmt(hlTotalInterest, currency)}</div>
                    <span className="text-[10px] text-stone-400">{isZh ? '总还款额:' : 'Total Payable:'} {fmt(hlTotalPayment, currency)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 2: Amortization Schedule */}
            {activeCalcId === 'amortization' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '还款本息摊销表' : 'Amortization Schedule'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '查看贷款周期内，本金与利息递减的动态分布' : 'Yearly breakdown showing principal reduction & interest paid'}</p>
                </div>

                <div className="max-h-[400px] overflow-y-auto border border-stone-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-stone-100 text-stone-700 font-bold sticky top-0">
                      <tr>
                        <th className="p-3">{isZh ? '年份' : 'Year'}</th>
                        <th className="p-3">{isZh ? '年度本金' : 'Principal Paid'}</th>
                        <th className="p-3">{isZh ? '年度利息' : 'Interest Paid'}</th>
                        <th className="p-3">{isZh ? '剩余本金余额' : 'Ending Balance'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-800">
                      {hlAmortizationSchedule.map((row) => (
                        <tr key={row.year} className="hover:bg-amber-50/30">
                          <td className="p-3 font-bold">{isZh ? `第 ${row.year} 年` : `Year ${row.year}`}</td>
                          <td className="p-3 text-emerald-600 font-semibold">{fmt(row.principalPaid, currency)}</td>
                          <td className="p-3 text-red-500 font-semibold">{fmt(row.interestPaid, currency)}</td>
                          <td className="p-3 font-bold">{fmt(row.endingBalance, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CALCULATOR 3: Interest Savings */}
            {activeCalcId === 'interest-savings' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '额外还款利息节省计算器' : 'Interest Savings Calculator'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '计算每月多还月供或单笔大额预还对节省利息与缩短年限的效果' : 'Calculate interest saved by paying extra monthly or a lump sum'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '每月额外多还金额' : 'Extra Monthly Repayment'}</label>
                    <input 
                      type="number" 
                      value={isExtraMonthly} 
                      onChange={(e) => setIsExtraMonthly(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '单笔预还大额本金' : 'Lump Sum Prepayment'}</label>
                    <input 
                      type="number" 
                      value={isLumpSum} 
                      onChange={(e) => setIsLumpSum(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-stone-900">
                  <div className="text-xs font-bold text-emerald-800 uppercase">{isZh ? '预计总共可节省利息' : 'Total Estimated Interest Saved'}</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{fmt(interestSavingsResult.savedInterest, currency)}</div>
                  <div className="text-xs font-semibold text-stone-600 mt-2">
                    {isZh ? `还款期缩短了 ${interestSavingsResult.yearsSaved} 年 (${interestSavingsResult.monthsSaved} 个月)` : `Tenure shortened by ${interestSavingsResult.yearsSaved} Years (${interestSavingsResult.monthsSaved} Months)`}
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 4: Full-Flexi vs Semi-Flexi */}
            {activeCalcId === 'flexi-vs-semi' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '全灵活 (Full-Flexi) vs 半灵活 (Semi-Flexi) 贷款' : 'Full-Flexi vs Semi-Flexi Mortgage'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '评估存入闲置资金对利息的抵扣效果与手续费对比' : 'Compare interest offset with idle cash, monthly fees & withdrawal flexibility'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '常态存入灵活账户的闲置资金' : 'Average Parked Cash in Account'}</label>
                    <input 
                      type="number" 
                      value={flexiParkedCash} 
                      onChange={(e) => setFlexiParkedCash(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? 'Full-Flexi 月维护费 (RM)' : 'Full-Flexi Monthly Fee (RM)'}</label>
                    <input 
                      type="number" 
                      value={flexiMonthlyFee} 
                      onChange={(e) => setFlexiMonthlyFee(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-brand-gold/40">
                    <h4 className="font-bold text-sm text-stone-900">{isZh ? 'Full-Flexi (全灵活)' : 'Full-Flexi Loan'}</h4>
                    <div className="text-xs text-stone-600 mt-2 space-y-1">
                      <div>{isZh ? '每年可省利息:' : 'Annual Interest Saved:'} <span className="font-bold text-emerald-600">{fmt(flexiComparison.fullFlexiNetAnnualSavings, currency)}</span></div>
                      <div>{isZh ? '35年累计纯节省:' : '35-Yr Net Savings:'} <span className="font-bold text-stone-900">{fmt(flexiComparison.fullFlexiLifetimeSavings, currency)}</span></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <h4 className="font-bold text-sm text-stone-900">{isZh ? 'Semi-Flexi (半灵活)' : 'Semi-Flexi Loan'}</h4>
                    <div className="text-xs text-stone-600 mt-2 space-y-1">
                      <div>{isZh ? '每年可省利息:' : 'Annual Interest Saved:'} <span className="font-bold text-emerald-600">{fmt(flexiComparison.semiFlexiNetAnnualSavings, currency)}</span></div>
                      <div>{isZh ? '35年累计纯节省:' : '35-Yr Net Savings:'} <span className="font-bold text-stone-900">{fmt(flexiComparison.semiFlexiLifetimeSavings, currency)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 5: Refinance Savings */}
            {activeCalcId === 'refinance' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '再融资/转按揭节省计算器' : 'Refinance Savings Calculator'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '对比新旧贷款利率，扣除转按揭律师费与估值费后计算净节省' : 'Calculate net lifetime savings after refinancing fees'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '现有贷款剩余本金' : 'Current Outstanding Loan'}</label>
                    <input 
                      type="number" 
                      value={refinBalance} 
                      onChange={(e) => setRefinBalance(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '现有贷款旧利率 (%)' : 'Current Old Interest Rate (%)'}</label>
                    <input 
                      type="number" step="0.1"
                      value={refinOldRate} 
                      onChange={(e) => setRefinOldRate(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '重组后新贷款利率 (%)' : 'New Refinanced Rate (%)'}</label>
                    <input 
                      type="number" step="0.1"
                      value={refinNewRate} 
                      onChange={(e) => setRefinNewRate(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '转按揭总手续费 (律师+估值)' : 'Refinancing Fees (Legal + Valuation)'}</label>
                    <input 
                      type="number" 
                      value={refinLegalFee} 
                      onChange={(e) => setRefinLegalFee(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-900 text-white">
                  <div className="text-xs text-brand-gold font-bold uppercase">{isZh ? '每月还款节省' : 'Monthly Savings'}</div>
                  <div className="text-2xl font-extrabold text-white mt-1">{fmt(refinanceResult.monthlySavings, currency)} / {isZh ? '月' : 'month'}</div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-stone-800 text-xs text-stone-300">
                    <div>{isZh ? '扣除手续费后净节省:' : 'Net Lifetime Savings:'} <span className="font-bold text-emerald-400">{fmt(refinanceResult.netLifetimeSavings, currency)}</span></div>
                    <div>{isZh ? '回本周期:' : 'Break-Even Period:'} <span className="font-bold text-white">{refinanceResult.breakEvenMonths} {isZh ? '个月' : 'Months'}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 6: Early Settlement */}
            {activeCalcId === 'early-settlement' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '提前还清贷款计算器' : 'Early Settlement Calculator'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '计算一次性赎回房屋贷款所需的结清金额与锁定期违约金' : 'Calculate payoff amount & lock-in period penalty'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '当前剩余贷款本金' : 'Outstanding Loan Principal'}</label>
                    <input 
                      type="number" 
                      value={esBalance} 
                      onChange={(e) => setEsBalance(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '是否处于 3-5 年锁定期内' : 'Within Lock-in Period?'}</label>
                    <select 
                      value={esInLockIn ? 'yes' : 'no'} 
                      onChange={(e) => setEsInLockIn(e.target.value === 'yes')}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    >
                      <option value="yes">{isZh ? '处于锁定期内 (有违约金)' : 'Yes (In Lock-in Period)'}</option>
                      <option value="no">{isZh ? '已过锁定期 (无违约金)' : 'No (Passed Lock-in Period)'}</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-xs font-bold text-stone-500 uppercase">{isZh ? '一次性结清总金额' : 'Total Payoff Amount Required'}</div>
                  <div className="text-2xl font-bold text-stone-900 mt-1">{fmt(earlySettlementResult.totalPayoff, currency)}</div>
                  {esInLockIn && (
                    <div className="text-xs text-red-600 font-semibold mt-2">
                      {isZh ? `包含银行违约罚金 (3%): ${fmt(earlySettlementResult.penaltyAmount, currency)}` : `Includes lock-in penalty (3%): ${fmt(earlySettlementResult.penaltyAmount, currency)}`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CALCULATOR 7: DSR */}
            {activeCalcId === 'dsr' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? 'DSR 负债率与贷款通过率' : 'DSR (Debt Service Ratio) Eligibility'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '计算个人及家庭 DSR 负债率，测算全马各大银行的放贷审批成功率' : 'Calculate your DSR % and evaluate Malaysian bank approval thresholds'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '每月固定底薪 (Basic Salary)' : 'Monthly Basic Net Salary'}</label>
                    <input 
                      type="number" 
                      value={dsrBasicIncome} 
                      onChange={(e) => setDsrBasicIncome(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '拟申请的新房月供' : 'Proposed New Mortgage'}</label>
                    <input 
                      type="number" 
                      value={dsrNewMortgage} 
                      onChange={(e) => setDsrNewMortgage(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '汽车贷款 (Car Loan)' : 'Monthly Car Loan'}</label>
                    <input 
                      type="number" 
                      value={dsrCarLoan} 
                      onChange={(e) => setDsrCarLoan(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '信用卡最低还款/PTPTN' : 'Credit Card / PTPTN Commitments'}</label>
                    <input 
                      type="number" 
                      value={dsrCreditCard + dsrPtptn} 
                      onChange={(e) => setDsrCreditCard(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border ${
                  dsrResult.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase">{isZh ? '您的 DSR 负债比例' : 'Your Debt Service Ratio (DSR)'}</div>
                      <div className="text-3xl font-black mt-1">{dsrResult.dsrPct.toFixed(1)}%</div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-xs font-extrabold text-white ${
                      dsrResult.status === 'approved' ? 'bg-emerald-600' : 'bg-red-600'
                    }`}>
                      {dsrResult.status === 'approved' ? (isZh ? '强效审批 (通过率极高)' : 'High Approval Rate') : (isZh ? '负债偏高 (需增加担保人)' : 'DSR Exceeds Threshold')}
                    </div>
                  </div>
                  <div className="text-xs mt-3 pt-3 border-t border-emerald-200/60 font-medium">
                    {isZh 
                      ? `净收入 ${fmt(dsrResult.netIncome, currency)}，银行标准上限为 ${dsrResult.maxThreshold}%。`
                      : `Net income ${fmt(dsrResult.netIncome, currency)}, Malaysian bank threshold is ${dsrResult.maxThreshold}%.`}
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 8: Loan Affordability */}
            {activeCalcId === 'affordability' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '最高可买房价测算' : 'Loan Affordability Calculator'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '根据净收入与现有负债，反推您能贷款购买的最理想房价上限' : 'Determine max property price based on your income and debts'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '个人/家庭每月总净收入' : 'Net Monthly Income'}</label>
                    <input 
                      type="number" 
                      value={affNetIncome} 
                      onChange={(e) => setAffNetIncome(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '每月固定车贷/个人贷款总额' : 'Existing Commitments'}</label>
                    <input 
                      type="number" 
                      value={affCommitments} 
                      onChange={(e) => setAffCommitments(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/80 border border-brand-gold/40">
                  <div className="text-xs font-bold text-stone-600 uppercase">{isZh ? '估算最高可负担房屋售价' : 'Maximum Purchasable Property Price'}</div>
                  <div className="text-3xl font-extrabold text-stone-900 mt-1">{fmt(affordabilityResult.maxPropertyPrice, currency)}</div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-brand-gold/20 text-xs text-stone-700">
                    <div>{isZh ? '最高可获贷款额:' : 'Max Eligible Loan:'} <span className="font-bold">{fmt(affordabilityResult.maxLoan, currency)}</span></div>
                    <div>{isZh ? '所需10%首付款:' : '10% Downpayment:'} <span className="font-bold">{fmt(affordabilityResult.requiredDownpayment, currency)}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 9: Stamp Duty & Legal Fee */}
            {activeCalcId === 'stamp-duty-legal' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '印花税与律师费计算器' : 'Stamp Duty & Legal Fee Calculator'}</h2>
                  <p className="text-xs text-stone-500 mt-[2px]">{isZh ? '依据大马财政部地契过户(MOT)分级税率及律师公会SRO收费标准计算' : 'Calculated using official Malaysian MOT tax tiers & SPA legal scale'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '房屋买卖价格 (Property Price)' : 'Property Price'}</label>
                    <input 
                      type="number" 
                      value={sdPrice} 
                      onChange={(e) => setSdPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-5">
                    <input 
                      type="checkbox" 
                      id="fhExemption"
                      checked={sdFirstHomeExemption} 
                      onChange={(e) => setSdFirstHomeExemption(e.target.checked)}
                      className="h-4 w-4 rounded text-brand-gold focus:ring-brand-gold cursor-pointer"
                    />
                    <label htmlFor="fhExemption" className="text-xs font-bold text-stone-800 cursor-pointer">
                      {isZh ? '首套房买家豁免 (First-Home Buyer Exemption)' : 'First-Home Buyer Exemption (Below RM500k Free MOT)'}
                    </label>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex justify-between text-xs pb-2 border-b border-stone-200">
                    <span className="font-bold text-stone-700">{isZh ? 'MOT 地契过户印花税' : 'MOT Stamp Duty'}</span>
                    <span className="font-bold text-stone-900">{fmt(stampDutyResult.motStampDuty, currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs pb-2 border-b border-stone-200">
                    <span className="font-bold text-stone-700">{isZh ? 'SPA 买卖合约律师费 (+SST)' : 'SPA Legal Fee & SST'}</span>
                    <span className="font-bold text-stone-900">{fmt(stampDutyResult.spaLegalFee + stampDutyResult.spaSst, currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs pb-2 border-b border-stone-200">
                    <span className="font-bold text-stone-700">{isZh ? '贷款合约印花税 (0.5%)' : 'Loan Agreement Stamp Duty'}</span>
                    <span className="font-bold text-stone-900">{fmt(stampDutyResult.loanStampDuty, currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 text-emerald-600 font-extrabold">
                    <span>{isZh ? '法律与印花税总开销' : 'Total Legal & Stamp Duty Fees'}</span>
                    <span className="text-sm">{fmt(stampDutyResult.totalFees, currency)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 10: Total Buying Cost */}
            {activeCalcId === 'total-buying-cost' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '购房首付与总筹备资金' : 'Total Buying Cost Calculator'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '汇集首付款、过户费、律政费及银行估值费，计算下订签约所需的流动现金' : 'Calculate total upfront cash required at signing'}</p>
                </div>

                <div className="p-5 rounded-2xl bg-stone-900 text-white">
                  <div className="text-xs font-bold text-brand-gold uppercase">{isZh ? '签约所需准备的总现金' : 'Total Initial Cash Required'}</div>
                  <div className="text-3xl font-black text-white mt-1">{fmt(totalBuyingCostResult.totalCashRequired, currency)}</div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-stone-800 text-xs text-stone-300">
                    <div>{isZh ? '10% 房屋首付款:' : '10% Down Payment:'} <span className="font-bold text-white">{fmt(totalBuyingCostResult.downPayment, currency)}</span></div>
                    <div>{isZh ? '律政与杂费杂项:' : 'Legal Fees & Charges:'} <span className="font-bold text-white">{fmt(totalBuyingCostResult.legalAndStamps, currency)}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 11: Renovation Cost */}
            {activeCalcId === 'renovation-cost' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '装修与软装预算评估' : 'Renovation Cost Estimator'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '按建筑面积与装修质感估算泥水工程、定制橱柜及家电预算' : 'Estimate interior design, wet works & furnishings by sqft'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '房屋面积 (sqft)' : 'Built-up Area (sqft)'}</label>
                    <input 
                      type="number" 
                      value={renoSqft} 
                      onChange={(e) => setRenoSqft(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '装修标准档次' : 'Renovation Tier'}</label>
                    <select 
                      value={renoQuality} 
                      onChange={(e) => setRenoQuality(e.target.value as any)}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    >
                      <option value="basic">{isZh ? '基础精装 (Basic RM45/sqft)' : 'Basic Standard (RM45/sqft)'}</option>
                      <option value="medium">{isZh ? '中端舒适 (Medium RM80/sqft)' : 'Medium Quality (RM80/sqft)'}</option>
                      <option value="luxury">{isZh ? '奢华高级 (Luxury RM140/sqft)' : 'High Luxury (RM140/sqft)'}</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/70 border border-brand-gold/30">
                  <div className="text-xs font-bold text-stone-600 uppercase">{isZh ? '估计装修总预算 (含10%备用金)' : 'Estimated Total Renovation Budget'}</div>
                  <div className="text-2xl font-extrabold text-stone-900 mt-1">{fmt(renoResult.grandTotal, currency)}</div>
                  <div className="text-xs text-stone-500 mt-2">
                    {isZh ? `硬装工程: ${fmt(renoResult.baseRenovation, currency)} | 软装家电: ${fmt(renoResult.furnishings, currency)}` : `Wet Works: ${fmt(renoResult.baseRenovation, currency)} | Furnishings: ${fmt(renoResult.furnishings, currency)}`}
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 12: Rent vs Buy */}
            {activeCalcId === 'rent-vs-buy' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '买房 vs 租房终极对比' : 'Rent vs Buy Calculator'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '对比10年后买房积累的房产净资产与租房将首付拿去投资的复利净值' : 'Compare 10-year wealth building of buying vs renting'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '拟购房屋总价' : 'Property Purchase Price'}</label>
                    <input 
                      type="number" 
                      value={rvbPropPrice} 
                      onChange={(e) => setRvbPropPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '同等地段月租金' : 'Equivalent Monthly Rent'}</label>
                    <input 
                      type="number" 
                      value={rvbMonthlyRent} 
                      onChange={(e) => setRvbMonthlyRent(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-stone-900 text-white">
                    <h4 className="font-bold text-sm text-brand-gold">{isZh ? '10年后买房净资产' : '10-Yr Buy Net Equity'}</h4>
                    <div className="text-xl font-bold mt-2">{fmt(rentVsBuyResult.buyNetEquity10Yr, currency)}</div>
                    <div className="text-[11px] text-stone-400 mt-1">{isZh ? '升值后的房价减去剩余房贷' : 'Property value minus remaining loan'}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200">
                    <h4 className="font-bold text-sm text-stone-800">{isZh ? '10年后租房投资组合' : '10-Yr Renter Portfolio'}</h4>
                    <div className="text-xl font-bold text-stone-900 mt-2">{fmt(rentVsBuyResult.renterPortfolio, currency)}</div>
                    <div className="text-[11px] text-stone-500 mt-1">{isZh ? '首付款以 6% 年化复利滚存' : 'Downpayment invested at 6% p.a.'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 13: Rental Yield */}
            {activeCalcId === 'rental-yield' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '长租收益率计算器' : 'Rental Yield Calculator'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '精准计算毛租金收益率与扣除物业管理费、门牌税后的净收益率' : 'Calculate Gross & Net Rental Yield % after expenses'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '房屋购入价格' : 'Purchase Price'}</label>
                    <input 
                      type="number" 
                      value={ryPurchasePrice} 
                      onChange={(e) => setRyPurchasePrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '预计月租金 (Monthly Rent)' : 'Expected Monthly Rent'}</label>
                    <input 
                      type="number" 
                      value={ryMonthlyRent} 
                      onChange={(e) => setRyMonthlyRent(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-brand-gold/30">
                    <div className="text-xs font-bold text-stone-500 uppercase">{isZh ? '毛租金收益率 (Gross Yield)' : 'Gross Rental Yield'}</div>
                    <div className="text-2xl font-black text-stone-900 mt-1">{rentalYieldResult.grossYield.toFixed(2)}%</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="text-xs font-bold text-emerald-800 uppercase">{isZh ? '净租金收益率 (Net Yield)' : 'Net Rental Yield'}</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{rentalYieldResult.netYield.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 14: Airbnb Yield */}
            {activeCalcId === 'airbnb-yield' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '民宿/Airbnb 短租收益计算器' : 'Airbnb & Short-Term Rental Yield'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '结合平均房价、入住率、平台佣金及托管费估算月净回报' : 'Calculate monthly occupancy, platform fees & net ROI'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '平均每晚房价 (Nightly Rate)' : 'Average Nightly Rate'}</label>
                    <input 
                      type="number" 
                      value={abNightlyRate} 
                      onChange={(e) => setAbNightlyRate(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '预估入住率 (%)' : 'Occupancy Rate (%)'}</label>
                    <input 
                      type="number" 
                      value={abOccupancyPct} 
                      onChange={(e) => setAbOccupancyPct(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-900 text-white">
                  <div className="text-xs font-bold text-brand-gold uppercase">{isZh ? '民宿预估月纯利润' : 'Estimated Net Monthly Profit'}</div>
                  <div className="text-3xl font-extrabold text-white mt-1">{fmt(airbnbYieldResult.netMonthlyProfit, currency)}</div>
                  <div className="text-xs text-stone-300 mt-2">
                    {isZh ? `平均月出租天数: ${airbnbYieldResult.nightsBooked} 天 | 年化回报率: ${airbnbYieldResult.annualRoiPct.toFixed(2)}%` : `Booked ${airbnbYieldResult.nightsBooked} nights/mo | Annual ROI: ${airbnbYieldResult.annualRoiPct.toFixed(2)}%`}
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 15: Investment Risk */}
            {activeCalcId === 'investment-risk' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '现金流与投资风险评估' : 'Investment Risk & Cash Flow'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '计算扣除每月房贷供款后的每月净现金流与现金回报率 (CoC)' : 'Calculate monthly net cash flow & Cash-on-Cash Return'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '每月租金收入' : 'Monthly Rent Income'}</label>
                    <input 
                      type="number" 
                      value={cfRentIncome} 
                      onChange={(e) => setCfRentIncome(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '每月房贷按揭供款' : 'Monthly Mortgage Payment'}</label>
                    <input 
                      type="number" 
                      value={cfMortgagePayment} 
                      onChange={(e) => setCfMortgagePayment(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-xs font-bold text-stone-500 uppercase">{isZh ? '每月净现金流 (+盈余 / -贴钱)' : 'Net Monthly Cash Flow'}</div>
                  <div className={`text-2xl font-black mt-1 ${cashFlowResult.netMonthlyCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {fmt(cashFlowResult.netMonthlyCashFlow, currency)}
                  </div>
                  <div className="text-xs text-stone-600 mt-2 font-medium">
                    {isZh ? `现金回报率 (CoC Return): ${cashFlowResult.cashOnCashReturn.toFixed(2)}%` : `Cash-on-Cash Return: ${cashFlowResult.cashOnCashReturn.toFixed(2)}%`}
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 16: RPGT */}
            {activeCalcId === 'rpgt' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? 'RPGT 产业盈利税计算器' : 'RPGT (Real Property Gains Tax)'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '按大马税务局分级持有年限与公民身份算取出售房产应缴盈利税' : 'Calculate RPGT tax liability based on holding period & citizenship'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '当初购入价格' : 'Original Purchase Price'}</label>
                    <input 
                      type="number" 
                      value={rpgtPurchasePrice} 
                      onChange={(e) => setRpgtPurchasePrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '如今出售价格' : 'Disposal Selling Price'}</label>
                    <input 
                      type="number" 
                      value={rpgtSellingPrice} 
                      onChange={(e) => setRpgtSellingPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '买卖间隔持有年限 (年)' : 'Holding Years'}</label>
                    <input 
                      type="number" 
                      value={rpgtHoldingYears} 
                      onChange={(e) => setRpgtHoldingYears(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '卖家身份归属' : 'Seller Status'}</label>
                    <select 
                      value={rpgtSellerType} 
                      onChange={(e) => setRpgtSellerType(e.target.value as any)}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    >
                      <option value="citizen">{isZh ? '大马公民 / 永久居民 (Citizen/PR)' : 'Malaysian Citizen / PR'}</option>
                      <option value="foreigner">{isZh ? '外籍人士 / 预售外资 (Foreigner)' : 'Foreigner'}</option>
                      <option value="company">{isZh ? '公司名义持有 (Company)' : 'Company'}</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/80 border border-brand-gold/40">
                  <div className="text-xs font-bold text-stone-600 uppercase">{isZh ? '估算需缴纳的 RPGT 产业盈利税' : 'Estimated RPGT Tax Payable'}</div>
                  <div className="text-2xl font-black text-stone-900 mt-1">{fmt(rpgtResult.rpgtPayable, currency)}</div>
                  <div className="text-xs text-stone-600 mt-2">
                    {isZh ? `适用税率: ${rpgtResult.taxRate}% | 扣除每人RM10,000或10%基础豁免额` : `Tax Rate applied: ${rpgtResult.taxRate}% | Standard statutory exemption applied`}
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 17: Property Gain (Net Profit) */}
            {activeCalcId === 'property-gain' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '卖房净利润与投资回报' : 'Property Gain (Net Profit) Calculator'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '扣除买卖律师费、地产中介佣金、装修费及 RPGT 后的到手纯利润' : 'Calculate net capital gains after renovation, legal & agent fees'}</p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800 uppercase">{isZh ? '出售房产到手净利润 (Net Profit)' : 'Net Profit Earned'}</div>
                  <div className="text-3xl font-black text-emerald-600 mt-1">{fmt(propertyGainResult.netProfit, currency)}</div>
                  <div className="text-xs text-stone-600 mt-2 font-medium">
                    {isZh ? `毛资本利得: ${fmt(propertyGainResult.grossGain, currency)} | 中介佣金费: ${fmt(propertyGainResult.agentFee, currency)}` : `Gross Gain: ${fmt(propertyGainResult.grossGain, currency)} | Agent Fees: ${fmt(propertyGainResult.agentFee, currency)}`}
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 18: Fire Insurance */}
            {activeCalcId === 'fire-insurance' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? '火险与建筑保险费估算' : 'Fire Insurance Calculator'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '依据大马房屋重建保额与物业类型估算每年火险保费' : 'Estimate annual fire & houseowner building insurance premiums'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '房屋重置成本/投保金额' : 'Sum Insured (Reconstruction Cost)'}</label>
                    <input 
                      type="number" 
                      value={fiSumInsured} 
                      onChange={(e) => setFiSumInsured(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isZh ? '房屋建筑类型' : 'Property Building Type'}</label>
                    <select 
                      value={fiPropertyType} 
                      onChange={(e) => setFiPropertyType(e.target.value as any)}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-brand-gold"
                    >
                      <option value="condo">{isZh ? '高层公寓 / 服务式住宅 (Condo/Serviced Residence)' : 'Condominium / Serviced Apartment'}</option>
                      <option value="landed">{isZh ? '有地排屋 / 独栋别墅 (Landed House)' : 'Landed Terrace / Bungalow'}</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-xs font-bold text-stone-500 uppercase">{isZh ? '预估年度火险总保费' : 'Total Estimated Annual Premium'}</div>
                  <div className="text-2xl font-bold text-stone-900 mt-1">{fmt(fireInsuranceResult.totalAnnualPremium, currency)} / {isZh ? '年' : 'year'}</div>
                  <div className="text-xs text-stone-500 mt-2">
                    {isZh ? `基础保费: ${fmt(fireInsuranceResult.basePremium, currency)} | SST + 印花税: ${fmt(fireInsuranceResult.sst + fireInsuranceResult.stampDuty, currency)}` : `Base premium: ${fmt(fireInsuranceResult.basePremium, currency)} | SST & Stamp Duty included`}
                  </div>
                </div>
              </div>
            )}

            {/* CALCULATOR 19: MRTA vs MLTA */}
            {activeCalcId === 'mrta-vs-mlta' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-bold text-stone-900">{isZh ? 'MRTA vs MLTA 递减/平准房贷保险对比' : 'MRTA vs MLTA Comparison'}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{isZh ? '房屋人寿保险两大核心工具权威全方位解析与选型指南' : 'Comprehensive breakdown between Mortgage Reducing vs Level Term Assurance'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="p-5 rounded-2xl bg-amber-50/60 border border-brand-gold/30 space-y-3">
                    <h3 className="font-extrabold text-stone-900 text-sm">MRTA ({isZh ? '递减型房贷保费' : 'Reducing Term Assurance'})</h3>
                    <ul className="text-xs text-stone-700 space-y-2 list-disc pl-4">
                      <li>{isZh ? '保额随着房贷本金归零逐年递减' : 'Coverage decreases in tandem with remaining loan balance'}</li>
                      <li>{isZh ? '通常为单笔一次性付费，可打入房贷融资' : 'Usually one-off lump sum capitalized into mortgage'}</li>
                      <li>{isZh ? '理赔金直接支付给贷款银行' : 'Beneficiary is strictly the financing bank'}</li>
                      <li>{isZh ? '不可转让至下一套房产' : 'Non-portable to future properties'}</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <h3 className="font-extrabold text-stone-900 text-sm">MLTA ({isZh ? '平准储蓄型房贷保费' : 'Level Term Assurance'})</h3>
                    <ul className="text-xs text-stone-700 space-y-2 list-disc pl-4">
                      <li>{isZh ? '保额全程维持固定不变，多余理赔金归家人' : 'Constant level coverage throughout loan term'}</li>
                      <li>{isZh ? '按月或按年缴费，附带储蓄现金价值' : 'Paid monthly/annually with cash value savings element'}</li>
                      <li>{isZh ? '受益人可指定为配偶或子女' : 'Beneficiaries can be designated family members'}</li>
                      <li>{isZh ? '换房买新房时可灵活转移绑定' : 'Fully portable to future property purchases'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom CTA Banner for Property Consultation */}
            <div className="mt-8 p-5 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-brand-gold">{isZh ? '需要更精准的个性化财务建议？' : 'Need Personalized Financial Advice?'}</h4>
                <p className="text-xs text-stone-300 mt-1">{isZh ? '联系我们的官方房产理财专家，获取针对各大银行的专业做单评估' : 'Connect with our official property consultants for tailored bank loan submission strategies.'}</p>
              </div>
              <a
                href={`https://wa.me/60108278932?text=${encodeURIComponent(isZh ? `您好，我在计算器页面测算了 ${activeCalcId}，希望能预约资深顾问做精准银行做单评估。` : `Hi! I calculated ${activeCalcId} on MalaysianHomes portal and would like professional loan submission consultation.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-5 py-2.5 rounded-xl bg-brand-gold text-stone-900 text-xs font-black hover:bg-amber-400 transition-colors cursor-pointer"
              >
                {isZh ? '免费 WhatsApp 咨询' : 'WhatsApp Expert'}
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
