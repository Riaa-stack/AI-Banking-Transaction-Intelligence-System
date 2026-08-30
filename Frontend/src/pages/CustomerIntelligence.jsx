import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import ModuleOfflineBlocker from '../components/ModuleOfflineBlocker';
import CreditScorePredictor from '../components/customer/CreditScorePredictor';
import LoanRecommenderDashboard from '../components/customer/LoanRecommenderDashboard';
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
  return <CreditScorePredictor />;
}

// 3. LOAN RECOMMENDATION VIEW
export function CustomerLoans() {
  return <LoanRecommenderDashboard />;
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
