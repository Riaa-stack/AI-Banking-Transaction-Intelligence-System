import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import ModuleOfflineBlocker from '../components/ModuleOfflineBlocker';
import { 
  Send, 
  Sparkles, 
  Mic, 
  HelpCircle, 
  TrendingUp, 
  Info, 
  Scale, 
  Calculator, 
  ShieldAlert, 
  CheckCircle2, 
  FileSearch, 
  Skull, 
  Lock,
  Compass,
  Zap,
  Globe
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import Swal from 'sweetalert2';

// 2. CREDIT SCORE PREDICTION VIEW
export function CustomerCreditScore() {
  const { currentUser, triggerCreditForecasting, apiConnected, loading, loadData, customers } = useBanking();
  const [forecasting, setForecasting] = useState(false);

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="AI Credit Score Predictor" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  const handlePredict = async () => {
    setForecasting(true);
    try {
      await triggerCreditForecasting();
      Swal.fire({
        title: 'Forecasting Completed',
        text: 'System parsed the updated statement parameters. Credit forecast has adjusted positively.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });
    } catch (err) {
      Swal.fire({
        title: 'Forecasting Failed',
        text: err.message || 'System failed to forecast credit score.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setForecasting(false);
    }
  };

  const currentCustomerDetails = customers?.find(c => c.email === currentUser?.email);

  const chartData = currentCustomerDetails?.creditHistory || currentUser?.creditHistory || [
    { month: 'Jan', score: 740 },
    { month: 'Feb', score: 750 },
    { month: 'Mar', score: 755 },
    { month: 'Apr', score: 770 },
    { month: 'May', score: 780 },
    { month: 'Jun', score: 785 }
  ];

  const factors = currentCustomerDetails?.creditFactors || currentUser?.creditFactors || [
    { name: 'On-Time Payments', impact: 'Positive', description: 'Excellent 100% payment history.', scoreImpact: '+45 pts' },
    { name: 'Credit Utilization', impact: 'Positive', description: 'Using below 10% limit.', scoreImpact: '+30 pts' }
  ];

  return (
    <div className="space-y-6" id="customer-credit-page">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">AI Credit Score Predictor</h2>
          <p className="text-xs text-slate-400 mt-0.5">Simulate payment schedules and forecast credit scores using predictive ML models.</p>
        </div>
        <button
          onClick={handlePredict}
          disabled={forecasting}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-all cursor-pointer"
        >
          {forecasting ? 'Recalculating...' : 'Forecast Score'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Metric gauge card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 text-center flex flex-col items-center justify-center">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Current Forecast Score</span>
          
          {/* Circular radial layout */}
          <div className="relative flex items-center justify-center mt-6 h-36 w-36 rounded-full border-[10px] border-slate-100 dark:border-slate-850">
            {/* Blue-violet gradient ring borders */}
            <div className="absolute inset-[-10px] rounded-full border-[10px] border-indigo-600 border-t-transparent border-r-transparent animate-in duration-300" />
            <div>
              <span className="text-4xl font-black text-slate-950 dark:text-white">{currentUser?.creditScore || 785}</span>
              <span className="block text-[9px] font-bold text-indigo-500 uppercase mt-1">Excellent</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-6 leading-relaxed">
            Excellent loan approval viability. You qualify for prime-bracket interest rates.
          </p>
        </div>

        {/* History Area Chart */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 md:col-span-2">
          <h3 className="text-xs font-extrabold text-slate-950 dark:text-white mb-4">Historical Score Progression</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis domain={[600, 850]} fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Factors */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 md:col-span-3">
          <h3 className="text-xs font-extrabold text-slate-950 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">Dynamic Score Drivers</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {factors.map((f, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 p-4 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-950/20 flex gap-3 items-start">
                <div className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                  f.impact === 'Positive' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' 
                    : f.impact === 'Negative' 
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'
                    : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30'
                }`}>
                  {f.impact === 'Positive' ? '+' : f.impact === 'Negative' ? '-' : '='}
                </div>
                <div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{f.name}</span>
                    <span className={`text-[10px] font-bold ${
                      f.impact === 'Positive' ? 'text-emerald-600' : f.impact === 'Negative' ? 'text-rose-500' : 'text-indigo-500'
                    }`}>{f.scoreImpact}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. LOAN RECOMMENDATION VIEW
export function CustomerLoans() {
  const { currentUser, loans, requestLoanApplication, apiConnected, loading, loadData } = useBanking();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [customEmiAmt, setCustomEmiAmt] = useState(20000);
  const [customEmiTenure, setCustomEmiTenure] = useState(12);

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="AI Loan Recommendation Engine" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  const clientLoans = loans.filter(l => l.customerEmail === currentUser?.email);

  const [form, setForm] = useState({
    type: 'Fintech Venture Expansion Loan',
    amount: '50000',
    tenure: '24'
  });

  const handleApply = (e) => {
    e.preventDefault();
    requestLoanApplication(form.type, form.amount, form.tenure);
    Swal.fire('Application Submitted', 'Your loan application is sent for employee review. Check active lists for status updates.', 'success');
    setShowApplyModal(false);
  };

  // Basic EMI Calculator
  const emiCalculated = parseFloat(((customEmiAmt * 1.072) / customEmiTenure).toFixed(2));

  return (
    <div className="space-y-6" id="customer-loans-page">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">AI Loan Recommendation Engine</h2>
          <p className="text-xs text-slate-400 mt-0.5">Custom capital options designed specifically to match your liquidity parameters.</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5" /> Submit Custom Application
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* EMI Estimator Card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
            <Calculator className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-950 dark:text-white">EMI Estimation Matrix</h3>
          </div>
          
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Principal Amount:</span>
                <span className="font-bold text-indigo-600">${customEmiAmt.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="150000"
                step="5000"
                value={customEmiAmt}
                onChange={(e) => setCustomEmiAmt(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer dark:bg-slate-800 accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Repayment Plan (Months):</span>
                <span className="font-bold text-indigo-600">{customEmiTenure} months</span>
              </div>
              <input
                type="range"
                min="6"
                max="60"
                step="6"
                value={customEmiTenure}
                onChange={(e) => setCustomEmiTenure(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer dark:bg-slate-800 accent-indigo-600"
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-950">
              <span className="text-[10px] font-semibold text-slate-400 block">Estimated Monthly Payment</span>
              <span className="text-2xl font-black text-slate-950 dark:text-white tracking-tight block mt-1">${emiCalculated.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400 block mt-1">Calculated at prime 7.2% APR indexing limits.</span>
            </div>
          </div>
        </div>

        {/* Personalized Active Loan Offers */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-extrabold text-slate-950 dark:text-white">Personalized Loan Portfolios</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {clientLoans.map(offer => (
              <div key={offer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-950 dark:text-white truncate max-w-[150px]">{offer.type}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase ${
                      offer.status === 'Approved' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' 
                        : offer.status === 'Requested' 
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40'
                    }`}>
                      {offer.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    \"{offer.aiReasoning}\"
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-semibold block">LENDING LIMIT</span>
                      <span className="font-extrabold text-slate-950 dark:text-white">${offer.recommendedAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-semibold block">ANNUAL APR</span>
                      <span className="font-extrabold text-slate-950 dark:text-white">{offer.interestRate}%</span>
                    </div>
                  </div>
                </div>

                {offer.status === 'Eligible' && (
                  <button
                    onClick={() => {
                      setForm({
                        type: offer.type,
                        amount: offer.recommendedAmount.toString(),
                        tenure: offer.tenureMonths.toString()
                      });
                      setShowApplyModal(true);
                    }}
                    className="w-full mt-5 rounded-lg bg-slate-50 py-2 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    Configure & Request Offer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Apply for Credit Asset Line</h3>
            
            <form onSubmit={handleApply} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Capital Profile Category</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="Fintech Venture Expansion Loan">Fintech Venture Expansion Loan</option>
                  <option value="Personal Lifestyle Upgrade Credit">Personal Lifestyle Upgrade Credit</option>
                  <option value="Custom Business Growth Line">Custom Business Growth Line</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Capital Sum Request ($)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="50000"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Repayment Tenure (Months)</label>
                <select
                  value={form.tenure}
                  onChange={(e) => setForm({ ...form, tenure: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="12">12 months</option>
                  <option value="18">18 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                  <option value="48">48 months</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 4. TRANSACTION MONITORING VIEW
export function CustomerMonitoring() {
  const { currentUser, transactions, apiConnected, loading, loadData } = useBanking();

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Transaction Risk Auditor" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  const clientTxns = transactions.filter(t => t.customerEmail === currentUser?.email);

  const averageRisk = clientTxns.reduce((sum, t) => sum + t.riskScore, 0) / (clientTxns.length || 1);

  return (
    <div className="space-y-6" id="customer-monitoring-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Transaction Risk Auditor</h2>
        <p className="text-xs text-slate-400 mt-0.5">Inspect real-time risk scores and anomaly tracking results applied to outbound ledgers.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Score tracker gauge */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-center flex flex-col justify-center items-center">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Average Portfolio Risk Score</span>
          <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-4">{averageRisk.toFixed(1)}%</span>
          <span className="block text-[9px] text-emerald-600 font-bold uppercase tracking-wider mt-1.5">Compliance Level: Stable</span>
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            Your transactions conform perfectly to historic geolocation limits and spending category volumes.
          </p>
        </div>

        {/* Compliance metrics panel */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-bold text-slate-950 dark:text-white border-b border-slate-100 pb-3 mb-4">Autonomous Risk Index</h3>
          <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
            {clientTxns.map(txn => (
              <div key={txn.id} className="flex justify-between items-center py-1 border-b border-slate-50 pb-2 dark:border-slate-850">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{txn.description}</h4>
                  <p className="text-[10px] text-slate-400">{txn.id} • {txn.bankName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-[9px] text-slate-400 font-semibold">ANOMALY WEIGHT</span>
                    <span className={`text-xs font-extrabold ${
                      txn.riskScore > 70 ? 'text-rose-500' : txn.riskScore > 30 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>{txn.riskScore}%</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase ${
                    txn.riskLabel === 'High' ? 'bg-rose-50 text-rose-600' : txn.riskLabel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {txn.riskLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. FRAUD DETECTION VIEW
export function CustomerFraud() {
  const { currentUser, transactions, dismissNotification, apiConnected, loading, loadData } = useBanking();

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Neural Threat & Fraud Audit Console" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  const clientTxns = transactions.filter(t => t.customerEmail === currentUser?.email);
  const fraudAlerts = clientTxns.filter(t => t.isSuspicious);

  const radarData = [
    { subject: 'Out-Of-Geo Routing', A: 85, B: 15, fullMark: 100 },
    { subject: 'Velocity Limit Mismatch', A: 70, B: 20, fullMark: 100 },
    { subject: 'Third Party Broker Proxy', A: 90, B: 10, fullMark: 100 },
    { subject: 'Hardware Token Deviation', A: 40, B: 5, fullMark: 100 },
    { subject: 'Hourly Active Overrides', A: 60, B: 12, fullMark: 100 }
  ];

  return (
    <div className="space-y-6" id="customer-fraud-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Neural Threat & Fraud Audit Console</h2>
        <p className="text-xs text-slate-400 mt-0.5">Real-time geofence validations and transaction safety audits.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Radar anomaly analysis chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-center flex flex-col justify-center items-center">
          <h3 className="text-xs font-bold text-slate-950 dark:text-white mb-2">Neural Vector Anomaly Rating</h3>
          
          <div className="h-48 mt-2 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" fontSize={8} tick={{ fill: '#64748b' }} />
                <Radar name="Active Transaction Vector" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.15} />
                <Radar name="Baseline Average Pattern" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-slate-500 mt-4 italic leading-relaxed">
            Neural vector compares active transfer geofences (A) with historic user baseline standards (B).
          </p>
        </div>

        {/* Dynamic Warning cards list */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-extrabold text-slate-950 dark:text-white">Active Threat Warnings</h3>
          
          {fraudAlerts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
              No anomalies found. All routing pathways fully compliant.
            </div>
          ) : (
            <div className="space-y-3.5">
              {fraudAlerts.map(t => (
                <div key={t.id} className="rounded-2xl border border-rose-100 bg-rose-50/20 p-5 dark:border-rose-950/30">
                  <div className="flex gap-2.5 items-start">
                    <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="w-full">
                      <div className="flex justify-between items-center text-xs font-bold text-rose-950 dark:text-rose-400">
                        <span>{t.description} ({t.id})</span>
                        <span className="text-rose-600">-${t.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 italic leading-relaxed">
                        \"{t.aiExplanation}\"
                      </p>
                      
                      <div className="border-t border-rose-100/40 mt-4 pt-4 flex justify-between items-center text-[10px]">
                        <span className="font-extrabold text-rose-500">PROBABILITY SCORE: {t.riskScore}%</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => Swal.fire('Disputed Transaction', 'Security team notified. Chargeback process opened.', 'success')}
                            className="bg-rose-600 text-white font-bold px-3 py-1 rounded hover:bg-rose-500"
                          >
                            Block & Dispute
                          </button>
                          <button
                            onClick={() => Swal.fire('Approved Transaction', 'Marked safe inside ledger database.', 'info')}
                            className="bg-white text-slate-700 border border-slate-200 font-bold px-3 py-1 rounded hover:bg-slate-50"
                          >
                            Approved Safe
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
