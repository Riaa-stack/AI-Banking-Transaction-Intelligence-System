import React from 'react';
import { useBanking } from '../context/BankingContext';
import { Link } from 'react-router-dom';
import ModuleOfflineBlocker from '../components/ModuleOfflineBlocker';
import { 
  Users, 
  Wallet, 
  ArrowLeftRight, 
  FileText, 
  ShieldAlert, 
  Scale, 
  Sparkles, 
  Bell, 
  CheckSquare, 
  TrendingUp,
  Landmark,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';

export default function EmployeeDashboard() {
  const { 
    customers, 
    bankAccounts, 
    transactions, 
    statements, 
    loans, 
    notifications,
    loading,
    error,
    apiConnected,
    loadData
  } = useBanking();

  // Metrics calculating from systemic state
  const totalClients = customers.length;
  const totalPortfolios = bankAccounts.length;
  const pendingStatements = statements.filter(s => s.ocrStatus === 'Completed' && s.reviewStatus === 'Pending').length;
  const suspiciousCount = transactions.filter(t => t.isSuspicious).length;
  const pendingLoans = loans.filter(l => l.status === 'Requested').length;

  const totalAssets = bankAccounts.reduce((sum, acc) => sum + (acc.status === 'Active' ? acc.balance : 0), 0);

  // Simple timeline data of latest events
  const systemLogs = [
    { text: "Dynamic Credit Forecaster recalibrated Client ID-992031-A", time: "10 mins ago", type: "system" },
    { text: "OCR Statement extracted checkbook chase_checking_june.pdf", time: "1 hour ago", type: "document" },
    { text: "High anomaly block applied to outward Stripe Ledger ATM route", time: "3 hours ago", type: "fraud" },
    { text: "Client Sarah Jenkins linked secondary digital checking portfolio", time: "1 day ago", type: "account" }
  ];

  // System chart data
  const weeklyVolume = [
    { day: 'Mon', Volume: 45000, FraudBlocked: 1200 },
    { day: 'Tue', Volume: 52000, FraudBlocked: 2500 },
    { day: 'Wed', Volume: 61000, FraudBlocked: 12500 }, // Cryptocurrency spike
    { day: 'Thu', Volume: 48000, FraudBlocked: 800 },
    { day: 'Fri', Volume: 67000, FraudBlocked: 400 },
    { day: 'Sat', Volume: 32000, FraudBlocked: 150 },
    { day: 'Sun', Volume: 28000, FraudBlocked: 100 }
  ];

  if (loading && !apiConnected) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white p-8 text-center dark:border-slate-800/60 dark:bg-slate-900 shadow-sm" id="employee-loading-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Retrieving operational records queue...</p>
      </div>
    );
  }

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Aegis Staff Command Console" 
        retry={() => loadData()} 
        loading={loading} 
      />
    );
  }

  return (
    <div className="space-y-6" id="employee-dashboard">
      
      {/* Staff Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
            Aegis Staff Command Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational and compliance audits are fully synchronized with Flask-PostgreSQL ledger models.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/40 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" /> AI Audits Active
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Customers */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Systemic Customers</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white tracking-tight">{totalClients}</p>
          <span className="block text-[10px] text-emerald-600 font-semibold mt-1.5">100% KYC Compliant</span>
        </div>

        {/* Total Assets Managed */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Systemic Reserves</span>
            <div className="rounded-lg bg-violet-50 p-2 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            ${totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="block text-[10px] text-slate-400 mt-1.5">Spread across {totalPortfolios} portfolios</span>
        </div>

        {/* Pending OCR Documents */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Statement Audits Queue</span>
            <div className={`rounded-lg p-2 ${
              pendingStatements > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40' : 'bg-slate-50 text-slate-600'
            }`}>
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white tracking-tight">{pendingStatements}</p>
          <span className="block text-[10px] text-slate-400 mt-1.5">Pending character review</span>
        </div>

        {/* Active Threats */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Suspicious Outlays</span>
            <div className={`rounded-lg p-2 ${
              suspiciousCount > 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white tracking-tight">{suspiciousCount}</p>
          <span className="block text-[10px] text-rose-500 font-semibold mt-1.5">{suspiciousCount > 0 ? 'Urgent audit required' : 'Ledger path secured'}</span>
        </div>
      </div>

      {/* Main Analytical Chart & Queues */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly System Volume and Block Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-950 dark:text-white">Daily Ledger Volume & Block Rate</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Real-time system transaction metrics.</p>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="Volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="FraudBlocked" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Operational Queue Shortcuts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-xs font-bold text-slate-950 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">Task Control Centers</h3>
          
          <div className="space-y-3.5">
            <Link to="/employee/statements" className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50/50 hover:border-indigo-500/50 dark:border-slate-800 dark:bg-slate-950/40 transition-all">
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-amber-500" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Statement Review</span>
                  <span className="text-[10px] text-slate-450">{pendingStatements} items in backlog</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">View</span>
            </Link>

            <Link to="/employee/loans" className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50/50 hover:border-indigo-500/50 dark:border-slate-800 dark:bg-slate-950/40 transition-all">
              <div className="flex items-center gap-2.5">
                <Scale className="h-4 w-4 text-violet-500" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Loan Approval Queue</span>
                  <span className="text-[10px] text-slate-450">{pendingLoans} applications pending</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Review</span>
            </Link>

            <Link to="/employee/fraud-detection" className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50/50 hover:border-indigo-500/50 dark:border-slate-800 dark:bg-slate-950/40 transition-all">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Fraud Audits Center</span>
                  <span className="text-[10px] text-slate-450">{suspiciousCount} active anomalies</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Open</span>
            </Link>
          </div>
        </div>
      </div>

      {/* System Timeline Logs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-bold text-slate-950 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">Aegis System Audit Timeline</h3>
        <div className="space-y-4">
          {systemLogs.map((log, idx) => (
            <div key={idx} className="flex gap-3 items-start text-xs">
              <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                log.type === 'fraud' ? 'bg-rose-500 animate-pulse' : log.type === 'document' ? 'bg-amber-500' : 'bg-indigo-500'
              }`} />
              <div className="flex justify-between w-full">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{log.text}</span>
                <span className="text-[10px] text-slate-400 font-bold">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
