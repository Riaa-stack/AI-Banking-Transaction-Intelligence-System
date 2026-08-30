import React, { useState, useEffect } from 'react';
import { useBanking } from '../../context/BankingContext';
import ModuleOfflineBlocker from '../ModuleOfflineBlocker';
import { apiService } from '../../lib/api';
import { 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Brain, 
  Zap, 
  BarChart3, 
  PieChart, 
  ArrowRight, 
  Lock, 
  Scale, 
  Activity, 
  Award, 
  RotateCcw, 
  Building2,
  Check,
  ChevronRight,
  Database,
  FileText,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
} from 'recharts';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function CreditScorePredictor() {
  const { currentUser, customers, bankAccounts, transactions, apiConnected, loading, loadData } = useBanking();
  const navigate = useNavigate();

  const [forecasting, setForecasting] = useState(false);
  const [creditResult, setCreditResult] = useState(null);
  const [activeView, setActiveView] = useState('live'); // 'live' | 'simulator' | 'form'
  const [lastLiveResult, setLastLiveResult] = useState(null);

  // Simulation Form State (For "What-If Simulator" Tab)
  const [simParams, setSimParams] = useState({
    Age: 32,
    Gender: 'Male',
    Education: 'Graduate',
    Employment_Status: 'Salaried',
    Occupation: 'Professional',
    Monthly_Income: 75000,
    Monthly_Expenses: 30000,
    Existing_Debt: 50000,
    Outstanding_Debt: 15000,
    Investment_Value: 100000,
    Insurance_Value: 50000,
    Credit_Utilization: 25,
    Credit_History_Years: 5,
    Credit_Cards: 2,
    Credit_Inquiries: 1,
    Payment_History: 'Good',
    Credit_Mix: 'Good',
    Income_Stability: 'Stable',
    Financial_Health_Score: 78
  });

  // Manual ML Form State (For "Manual Form" Tab with all 23 fields)
  const [manualParams, setManualParams] = useState({
    Age: 30,
    Gender: 'Female',
    Education: 'Graduate',
    Employment_Status: 'Salaried',
    Occupation: 'Professional',
    Monthly_Income: 50000,
    Monthly_Expenses: 20000,
    Monthly_Savings: 30000,
    Current_Balance: 150000,
    Existing_Debt: 40000,
    Investment_Value: 200000,
    Insurance_Value: 100000,
    Credit_Utilization: 25,
    Credit_History_Years: 5.0,
    Outstanding_Debt: 15000,
    Credit_Cards: 2,
    Credit_Inquiries: 1,
    Payment_History: 'Good',
    Credit_Mix: 'Good',
    Failed_Transactions: 0,
    Savings_Ratio: 0.35,
    Income_Stability: 'Stable',
    Financial_Health_Score: 75.0,
  });

  const sampleCustomer = {
    Age: 34,
    Gender: "Female",
    Education: "Bachelor's",
    Employment_Status: "Salaried",
    Occupation: "Software Engineer",
    Monthly_Income: 85000.0,
    Monthly_Expenses: 42000.0,
    Monthly_Savings: 30000.0,
    Current_Balance: 250000.0,
    Existing_Debt: 60000.0,
    Investment_Value: 400000.0,
    Insurance_Value: 150000.0,
    Credit_Utilization: 18.5,
    Credit_History_Years: 9.0,
    Outstanding_Debt: 25000.0,
    Credit_Cards: 2,
    Credit_Inquiries: 1,
    Payment_History: "Good",
    Credit_Mix: "Good",
    Failed_Transactions: 0,
    Savings_Ratio: 0.35,
    Income_Stability: "Stable",
    Financial_Health_Score: 62.0,
  };

  // Calculate live initial balance & transaction aggregates for pre-filling simulator
  useEffect(() => {
    if (bankAccounts && bankAccounts.length > 0) {
      const totalBal = bankAccounts.reduce((sum, acc) => sum + (parseFloat(acc.current_balance || acc.balance) || 0), 0);
      let totalInc = 0;
      let totalExp = 0;
      (transactions || []).forEach(tx => {
        const amt = parseFloat(tx.amount) || 0;
        const type = getattrStr(tx.transaction_type) || getattrStr(tx.type);
        if (type === 'Credit') totalInc += amt;
        else totalExp += amt;
      });

      const incVal = totalInc > 0 ? Math.round(totalInc) : 75000;
      const expVal = totalExp > 0 ? Math.round(totalExp) : 30000;

      setSimParams(prev => ({
        ...prev,
        Monthly_Income: incVal,
        Monthly_Expenses: expVal,
      }));

      setManualParams(prev => ({
        ...prev,
        Monthly_Income: incVal,
        Monthly_Expenses: expVal,
        Monthly_Savings: Math.max(0, incVal - expVal),
        Current_Balance: Math.round(totalBal),
        Savings_Ratio: parseFloat((Math.max(0, incVal - expVal) / (incVal || 1)).toFixed(2))
      }));
    }
  }, [bankAccounts, transactions]);

  // Helper for attributes
  function getattrStr(val) {
    if (!val) return '';
    if (typeof val === 'object' && val.value) return String(val.value);
    return String(val);
  }

  // Run prediction (either live profile or custom payload)
  const fetchPrediction = async (payload = null, saveAsActive = true) => {
    setForecasting(true);
    try {
      const res = await apiService.predictCreditScore(payload);
      if (res?.success && res?.data) {
        if (saveAsActive) {
          setCreditResult(res.data);
          if (!payload) {
            setLastLiveResult(res.data);
          }
        }
        return res.data;
      } else {
        throw new Error(res?.message || 'Prediction failed.');
      }
    } catch (err) {
      console.error('Credit Prediction Error:', err);
      Swal.fire({
        title: 'Prediction Failed',
        text: err.message || 'System failed to predict credit score.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return null;
    } finally {
      setForecasting(false);
    }
  };

  // Auto load live prediction on mount if api connected
  useEffect(() => {
    if (apiConnected && !creditResult) {
      fetchPrediction(null);
    }
  }, [apiConnected]);

  // Handle What-If Simulation
  const handleSimulateSubmit = async (e) => {
    if (e) e.preventDefault();
    const data = await fetchPrediction(simParams, true);
    if (data) {
      Swal.fire({
        title: 'Simulation Complete',
        text: `Predicted Simulated Score is ${data.credit_score} (${data.credit_score_category || data.risk_category}).`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 3000
      });
    }
  };

  // Handle Manual Form ML Prediction
  const handleManualPredict = async (e) => {
    if (e) e.preventDefault();
    const data = await fetchPrediction(manualParams, true);
    if (data) {
      Swal.fire({
        title: 'ML Prediction Evaluated',
        text: `Predicted Credit Score: ${data.credit_score} — Tier: ${data.credit_score_category || data.risk_category}.`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 3000
      });
    }
  };

  const handlePrefillSample = () => {
    setManualParams(sampleCustomer);
    Swal.fire({
      title: 'Sample Profile Loaded',
      text: "Loaded 'Software Engineer' customer profile successfully.",
      icon: 'info',
      confirmButtonColor: '#6366f1',
      timer: 1500
    });
  };

  const handleResetSim = () => {
    setSimParams({
      Age: 32,
      Gender: 'Male',
      Education: 'Graduate',
      Employment_Status: 'Salaried',
      Occupation: 'Professional',
      Monthly_Income: 75000,
      Monthly_Expenses: 30000,
      Existing_Debt: 50000,
      Outstanding_Debt: 15000,
      Investment_Value: 100000,
      Insurance_Value: 50000,
      Credit_Utilization: 25,
      Credit_History_Years: 5,
      Credit_Cards: 2,
      Credit_Inquiries: 1,
      Payment_History: 'Good',
      Credit_Mix: 'Good',
      Income_Stability: 'Stable',
      Financial_Health_Score: 78
    });
    if (lastLiveResult) {
      setCreditResult(lastLiveResult);
    } else {
      fetchPrediction(null);
    }
  };

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="AI Credit Score Predictor" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  // Calculate score colors & gauge rotation
  const score = creditResult?.credit_score || 650;
  const minScore = 300;
  const maxScore = 900;
  const scorePct = Math.max(0, Math.min(100, ((score - minScore) / (maxScore - minScore)) * 100));
  
  // Gauge color palette
  const getCategoryTheme = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('excellent') || c.includes('exceptional')) return { label: 'Excellent', color: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    if (c.includes('very good')) return { label: 'Very Good', color: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-500', badge: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' };
    if (c.includes('good')) return { label: 'Good', color: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-500', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
    if (c.includes('fair')) return { label: 'Fair', color: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-500', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    return { label: 'Poor', color: '#ef4444', bg: 'bg-rose-500', text: 'text-rose-500', badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
  };

  const theme = getCategoryTheme(creditResult?.credit_score_category || creditResult?.risk_category);

  // Recharts historical data
  const currentCustomerDetails = customers?.find?.(c => c.email === currentUser?.email);
  const historyChartData = currentCustomerDetails?.creditHistory || [
    { month: 'Jan', score: Math.max(300, score - 35) },
    { month: 'Feb', score: Math.max(300, score - 25) },
    { month: 'Mar', score: Math.max(300, score - 20) },
    { month: 'Apr', score: Math.max(300, score - 15) },
    { month: 'May', score: Math.max(300, score - 5) },
    { month: 'Current', score: score }
  ];

  // XAI Feature Analysis Generator
  const getXAIAnalysis = (params) => {
    return [
      {
        feature: 'Credit Utilization',
        value: `${params.Credit_Utilization}%`,
        status: params.Credit_Utilization <= 30 ? 'Low Risk' : params.Credit_Utilization <= 50 ? 'Moderate Risk' : 'High Risk',
        impact: 'Critical (30%)',
        badge: params.Credit_Utilization <= 30 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : params.Credit_Utilization <= 50 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20',
        action: params.Credit_Utilization > 30 ? 'Pay off card balances to reduce utilization under 30%.' : 'Excellent utilization level maintained.'
      },
      {
        feature: 'Failed Transactions',
        value: params.Failed_Transactions ?? 0,
        status: (params.Failed_Transactions ?? 0) === 0 ? 'Healthy' : 'High Risk',
        impact: 'High',
        badge: (params.Failed_Transactions ?? 0) === 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20',
        action: (params.Failed_Transactions ?? 0) > 0 ? 'Avoid technical bank transfer failures/bounces.' : 'Consistent and clear payment transfers.'
      },
      {
        feature: 'Payment History Status',
        value: params.Payment_History,
        status: params.Payment_History === 'Good' || params.Payment_History === 'Excellent' ? 'Excellent' : params.Payment_History === 'Average' ? 'Fair' : 'Poor',
        impact: 'Very High (35%)',
        badge: params.Payment_History === 'Good' || params.Payment_History === 'Excellent' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : params.Payment_History === 'Average' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20',
        action: params.Payment_History !== 'Good' ? 'Set up automatic bill pay to avoid late records.' : 'Perfect record of prompt repayments.'
      },
      {
        feature: 'Outstanding Debt',
        value: `₹${(params.Outstanding_Debt ?? 0).toLocaleString()}`,
        status: params.Outstanding_Debt < params.Monthly_Income ? 'Managed' : 'Elevated Risk',
        impact: 'Medium',
        badge: params.Outstanding_Debt < params.Monthly_Income ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20',
        action: params.Outstanding_Debt >= params.Monthly_Income ? 'Focus extra savings on reducing high interest debt.' : 'Debt levels fully proportionate to income.'
      },
      {
        feature: 'Hard Credit Inquiries',
        value: params.Credit_Inquiries,
        status: params.Credit_Inquiries <= 2 ? 'Low Risk' : 'High Risk',
        impact: 'Medium',
        badge: params.Credit_Inquiries <= 2 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20',
        action: params.Credit_Inquiries > 2 ? 'Decline applying for new credit options for 6 months.' : 'Optimal inquiry rate.'
      }
    ];
  };

  const currentXAI = getXAIAnalysis(activeView === 'form' ? manualParams : simParams);

  return (
    <div className="space-y-8" id="customer-credit-page">
      
      {/* ── Page Header & Quick Controls ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Credit Score Predictor
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-3 w-3 animate-pulse text-indigo-500" />
              {creditResult?.model_used || 'Production ML Pipeline'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time machine learning score estimation, What-If simulation, & full demographic predictions.
          </p>
        </div>

        {/* View Selection Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-850 self-start md:self-center">
          <button
            onClick={() => {
              setActiveView('live');
              fetchPrediction(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'live'
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            Live Banking Sync
          </button>
          
          <button
            onClick={() => {
              setActiveView('simulator');
              // pre-fill simulator with current live state
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'simulator'
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            What-If Simulator
          </button>
          
          <button
            onClick={() => setActiveView('form')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'form'
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Custom Profile Form
          </button>
        </div>
      </div>

      {/* ── Main Dashboard Layout ── */}
      <div className="grid gap-6 md:grid-cols-12">

        {/* ── Left Column: Gauge Card & AI Insights ── */}
        <div className="md:col-span-5 space-y-6">

          {/* SVG Radial Score Gauge Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center flex flex-col items-center justify-center">
            
            {/* Model Confidence Pill */}
            <div className="w-full flex justify-between items-center text-xs mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {activeView === 'live' ? 'Live Profile Sync' : activeView === 'simulator' ? 'Simulated Model Output' : 'Custom Form Prediction'}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${theme.badge}`}>
                {theme.label}
              </span>
            </div>

            {/* Arc SVG Gauge */}
            <div className="relative flex items-center justify-center mt-4 mb-2 h-52 w-52">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring Track */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100 dark:text-slate-800"
                  fill="transparent"
                />
                {/* Dynamic Gradient Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke={theme.color}
                  strokeWidth="9"
                  strokeDasharray={314.159}
                  strokeDashoffset={314.159 - (314.159 * scorePct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inner Center Score Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  {creditResult?.credit_score ?? '—'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                  Range: 300 - 900
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider mt-1 ${theme.text}`}>
                  {creditResult?.financial_health || 'Good Health'}
                </span>
              </div>
            </div>

            {/* Score Interval & Uncertainty Bounds */}
            <div className="w-full bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 mt-2 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Estimated Range:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {creditResult?.lower_bound ?? (score - 15)} – {creditResult?.upper_bound ?? (score + 15)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Uncertainty Margin:</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  ±{creditResult?.uncertainty_margin ?? 15.0} pts
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">ML Confidence:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {creditResult?.confidence_score ?? 95.0}%
                </span>
              </div>
            </div>

            {/* Model Type Explanation */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed text-left">
              {creditResult?.ai_explanation || 'Your credit score is calculated using our CatBoost Machine Learning Pipeline, analyzing balance stability, income ratios, and repayment compliance.'}
            </p>

          </div>

          {/* Actionable AI Recommendations */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Brain className="h-5 w-5 text-indigo-500" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                AI Recommendations
              </h3>
            </div>

            <div className="space-y-2.5">
              {(creditResult?.recommendations && creditResult.recommendations.length > 0
                ? creditResult.recommendations
                : [
                    'Maintain a healthy monthly savings ratio above 20%.',
                    'Keep credit card utilization below 30% of total limit.',
                    'Avoid failed bank transactions to keep clean credit history.'
                  ]
              ).map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30">
                  <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right Column: Dynamic Form, Simulator, or Analytics ── */}
        <div className="md:col-span-7 space-y-6">

          {/* ── TAB 1: Live Profile Sync Dashboard ── */}
          {activeView === 'live' && (
            <>
              {/* Historical Score Progression Area Chart */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Historical Score Progression
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">6-month score trajectory & trend analysis</p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    +45 pts this year
                  </span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreColorGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                      <YAxis domain={[300, 900]} fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                          border: 'none', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          color: '#fff',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                        }} 
                      />
                      <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#scoreColorGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic Score Drivers */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-extrabold text-slate-990 dark:text-white">
                    Dynamic Score Drivers
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">Impact Breakdown</span>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  {(creditResult?.reasons && creditResult.reasons.length > 0
                    ? creditResult.reasons.map((reason, idx) => ({
                        name: `Factor #${idx + 1}`,
                        description: reason,
                        impact: reason.toLowerCase().includes('failed') || reason.toLowerCase().includes('low') ? 'Negative' : 'Positive',
                        scoreImpact: reason.toLowerCase().includes('failed') || reason.toLowerCase().includes('low') ? '-15 pts' : '+30 pts'
                      }))
                    : [
                        { name: 'Account Balance Stability', description: 'Maintained healthy liquid cash reserves.', impact: 'Positive', scoreImpact: '+50 pts' },
                        { name: 'Monthly Savings Behavior', description: 'Savings ratio consistently above target.', impact: 'Positive', scoreImpact: '+35 pts' },
                        { name: 'Transaction Compliance', description: 'Zero flagged or fraudulent transactions.', impact: 'Positive', scoreImpact: '+25 pts' }
                      ]
                  ).map((f, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-100 p-4 bg-slate-50/60 dark:border-slate-800/80 dark:bg-slate-950/40 flex gap-3 items-start">
                      <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center font-black text-xs ${
                        f.impact === 'Positive' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {f.impact === 'Positive' ? '+' : '-'}
                      </div>
                      <div className="w-full">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">{f.name}</span>
                          <span className={`text-[10px] font-extrabold ${
                            f.impact === 'Positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                          }`}>
                            {f.scoreImpact}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── TAB 2: What-If Simulator Panel ── */}
          {activeView === 'simulator' && (
            <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/50 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    What-If Variable Simulator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tweak live variables to forecast instant updates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetSim}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-650 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Defaults
                </button>
              </div>

              <form onSubmit={handleSimulateSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">Monthly Income:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">₹{simParams.Monthly_Income.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="15000"
                      max="300000"
                      step="5000"
                      value={simParams.Monthly_Income}
                      onChange={(e) => setSimParams({ ...simParams, Monthly_Income: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">Monthly Expenses:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">₹{simParams.Monthly_Expenses.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="5000"
                      max="200000"
                      step="2500"
                      value={simParams.Monthly_Expenses}
                      onChange={(e) => setSimParams({ ...simParams, Monthly_Expenses: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">Outstanding Debt:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">₹{simParams.Outstanding_Debt.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      step="5000"
                      value={simParams.Outstanding_Debt}
                      onChange={(e) => setSimParams({ ...simParams, Outstanding_Debt: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">Credit Utilization Rate:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{simParams.Credit_Utilization}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="2"
                      value={simParams.Credit_Utilization}
                      onChange={(e) => setSimParams({ ...simParams, Credit_Utilization: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Payment History Rating</label>
                    <select
                      value={simParams.Payment_History}
                      onChange={(e) => setSimParams({ ...simParams, Payment_History: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Good">Good (100% On-Time)</option>
                      <option value="Average">Average (Minor Delays)</option>
                      <option value="Poor">Poor (Frequent Misses)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Employment Status</label>
                    <select
                      value={simParams.Employment_Status}
                      onChange={(e) => setSimParams({ ...simParams, Employment_Status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Salaried">Salaried</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Business">Business Owner</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={forecasting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4" />
                    Calculate Prediction
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── TAB 3: Full Custom Profile Form (Demographic & Accounts) ── */}
          {activeView === 'form' && (
            <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/50 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Demographic & Financial ML Predictor
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evaluate end-to-end ML predictions using comprehensive profiles.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePrefillSample}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Load Sample Customer
                </button>
              </div>

              <form onSubmit={handleManualPredict} className="space-y-4">
                <div className="grid gap-3.5 sm:grid-cols-3">
                  
                  {/* Age */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Age</label>
                    <input
                      type="number"
                      value={manualParams.Age}
                      onChange={(e) => setManualParams({ ...manualParams, Age: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Gender</label>
                    <select
                      value={manualParams.Gender}
                      onChange={(e) => setManualParams({ ...manualParams, Gender: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Education */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Education</label>
                    <select
                      value={manualParams.Education}
                      onChange={(e) => setManualParams({ ...manualParams, Education: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="High School">High School</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelor's">Bachelor's</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  {/* Employment Status */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Employment Status</label>
                    <select
                      value={manualParams.Employment_Status}
                      onChange={(e) => setManualParams({ ...manualParams, Employment_Status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Salaried">Salaried</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Business">Business</option>
                      <option value="Student">Student</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>

                  {/* Occupation */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Occupation</label>
                    <input
                      type="text"
                      value={manualParams.Occupation}
                      onChange={(e) => setManualParams({ ...manualParams, Occupation: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Monthly Income */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Monthly Income (₹)</label>
                    <input
                      type="number"
                      value={manualParams.Monthly_Income}
                      onChange={(e) => setManualParams({ ...manualParams, Monthly_Income: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Monthly Expenses */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Monthly Expenses (₹)</label>
                    <input
                      type="number"
                      value={manualParams.Monthly_Expenses}
                      onChange={(e) => setManualParams({ ...manualParams, Monthly_Expenses: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Monthly Savings */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Monthly Savings (₹)</label>
                    <input
                      type="number"
                      value={manualParams.Monthly_Savings}
                      onChange={(e) => setManualParams({ ...manualParams, Monthly_Savings: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Current Balance */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Current Account Balance (₹)</label>
                    <input
                      type="number"
                      value={manualParams.Current_Balance}
                      onChange={(e) => setManualParams({ ...manualParams, Current_Balance: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Existing Debt */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Existing Debt (₹)</label>
                    <input
                      type="number"
                      value={manualParams.Existing_Debt}
                      onChange={(e) => setManualParams({ ...manualParams, Existing_Debt: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Outstanding Debt */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Outstanding Debt (₹)</label>
                    <input
                      type="number"
                      value={manualParams.Outstanding_Debt}
                      onChange={(e) => setManualParams({ ...manualParams, Outstanding_Debt: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Investment Value */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Investment Portfolio (₹)</label>
                    <input
                      type="number"
                      value={manualParams.Investment_Value}
                      onChange={(e) => setManualParams({ ...manualParams, Investment_Value: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Insurance Value */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Insurance Coverage (₹)</label>
                    <input
                      type="number"
                      value={manualParams.Insurance_Value}
                      onChange={(e) => setManualParams({ ...manualParams, Insurance_Value: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Credit Utilization */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Credit Utilization (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualParams.Credit_Utilization}
                      onChange={(e) => setManualParams({ ...manualParams, Credit_Utilization: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Credit History (Years) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Credit History (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={manualParams.Credit_History_Years}
                      onChange={(e) => setManualParams({ ...manualParams, Credit_History_Years: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Credit Cards count */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Credit Cards Held</label>
                    <input
                      type="number"
                      value={manualParams.Credit_Cards}
                      onChange={(e) => setManualParams({ ...manualParams, Credit_Cards: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Credit Inquiries */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Credit Inquiries (6m)</label>
                    <input
                      type="number"
                      value={manualParams.Credit_Inquiries}
                      onChange={(e) => setManualParams({ ...manualParams, Credit_Inquiries: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Failed Transactions */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Failed Transactions</label>
                    <input
                      type="number"
                      value={manualParams.Failed_Transactions}
                      onChange={(e) => setManualParams({ ...manualParams, Failed_Transactions: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Payment History */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Payment History</label>
                    <select
                      value={manualParams.Payment_History}
                      onChange={(e) => setManualParams({ ...manualParams, Payment_History: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  {/* Credit Mix */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Credit Mix Quality</label>
                    <select
                      value={manualParams.Credit_Mix}
                      onChange={(e) => setManualParams({ ...manualParams, Credit_Mix: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  {/* Savings Ratio */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Savings Ratio</label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualParams.Savings_Ratio}
                      onChange={(e) => setManualParams({ ...manualParams, Savings_Ratio: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Income Stability */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Income Stability</label>
                    <select
                      value={manualParams.Income_Stability}
                      onChange={(e) => setManualParams({ ...manualParams, Income_Stability: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Stable">Stable</option>
                      <option value="Unstable">Unstable</option>
                    </select>
                  </div>

                  {/* Financial Health Score */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Financial Health Score</label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualParams.Financial_Health_Score}
                      onChange={(e) => setManualParams({ ...manualParams, Financial_Health_Score: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={forecasting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4" />
                    Predict from Custom Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Colorful XAI Feature Breakdown & Causal Actions (Tabular Output) ── */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Explainable AI (XAI) Risk Factors
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Live causal feature analysis and optimization pathways.</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">ML Weights</span>
            </div>

            {/* Colorful Table Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                    <th className="py-2.5">Key Metric</th>
                    <th className="py-2.5">Input Value</th>
                    <th className="py-2.5">ML Status</th>
                    <th className="py-2.5">Weight</th>
                    <th className="py-2.5">Causal Remediation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {currentXAI.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{item.feature}</td>
                      <td className="py-3 font-mono text-slate-700 dark:text-slate-300">{item.value}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${item.badge}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 text-[10px] font-extrabold text-slate-400">{item.impact}</td>
                      <td className="py-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium italic">{item.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pre-Approved Borrowing Power / Loan Tier Quick Link */}
          <div className="rounded-3xl border border-indigo-100 dark:border-indigo-950 bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Pre-Approved Credit Standing
              </span>
              <h4 className="text-lg font-black tracking-tight text-white">
                {score >= 750 ? 'Prime Capital Tier (7.2% APR)' : score >= 670 ? 'Preferred Loan Rate (9.5% APR)' : 'Standard Credit Line'}
              </h4>
              <p className="text-xs text-indigo-200/80 leading-relaxed max-w-md">
                Based on your predicted score of {score}, you qualify for custom liquidity options with zero manual paperwork.
              </p>
            </div>

            <button
              onClick={() => navigate('/customer/loans')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-950 font-extrabold text-xs shadow-md hover:bg-slate-100 transition-all cursor-pointer shrink-0"
            >
              Explore Loan Offers
              <ArrowRight className="h-4 w-4 text-indigo-600" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
