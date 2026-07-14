import React from 'react';
import { useBanking } from '../context/BankingContext';
import ModuleOfflineBlocker from '../components/ModuleOfflineBlocker';
import { 
  ShieldAlert, 
  Check, 
  X, 
  Scale, 
  Activity, 
  Bell, 
  Settings, 
  TrendingUp, 
  Zap, 
  Globe, 
  CheckCircle2, 
  Lock, 
  Unlock,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import Swal from 'sweetalert2';

// 1. FRAUD AUDIT CENTER
export function EmployeeFraud() {
  const { transactions, updateAccountStatus, apiConnected, loading, loadData } = useBanking();

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Neural Threat Center" 
        retry={() => loadData()} 
        loading={loading} 
      />
    );
  }

  const flagged = transactions.filter(t => t.isSuspicious);

  const handleAction = (id, action) => {
    Swal.fire({
      title: `${action} Threat Alert`,
      text: `Ledger entry ${id} marked as ${action === 'Freeze' ? 'FROZEN & LOCKED' : 'SECURE & RESOLVED'}.`,
      icon: action === 'Freeze' ? 'warning' : 'success',
      confirmButtonColor: '#4f46e5'
    });
  };

  return (
    <div className="space-y-6" id="employee-fraud-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Neural Threat Center</h2>
        <p className="text-xs text-slate-400 mt-0.5">Systemic transaction audits, proxy routing checks, and geofence anomaly investigations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Flagged logs */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-950 dark:text-white">Active Suspicious Outflows Queue</h3>
          {flagged.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
              No active fraud risks detected inside core ledgers.
            </div>
          ) : (
            <div className="space-y-4">
              {flagged.map(t => (
                <div key={t.id} className="rounded-2xl border border-rose-100 bg-rose-50/10 p-5 dark:border-rose-950/20">
                  <div className="flex gap-3 items-start">
                    <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="w-full">
                      <div className="flex justify-between items-center text-xs font-bold text-rose-950 dark:text-rose-400">
                        <span>{t.description} ({t.id})</span>
                        <span className="text-rose-600">-${t.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 italic">
                        "{t.aiExplanation}"
                      </p>
                      
                      <div className="border-t border-rose-100/40 mt-4 pt-4 flex justify-between items-center text-[10px]">
                        <div>
                          <span className="font-extrabold text-rose-600">THREAT PERCENTAGE: {t.riskScore}%</span>
                          <span className="block text-[9px] text-slate-400">Owner: {t.customerEmail}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(t.id, 'Freeze')}
                            className="bg-rose-600 text-white font-bold px-3 py-1.5 rounded hover:bg-rose-500 transition-all cursor-pointer"
                          >
                            Freeze Account
                          </button>
                          <button
                            onClick={() => handleAction(t.id, 'Resolve')}
                            className="bg-white text-slate-700 border border-slate-200 font-bold px-3 py-1.5 rounded hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            Mark Safe
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

        {/* Global Security Audit Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Globe className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-950 dark:text-white">Compliance Vectors</h3>
          </div>
          <div className="space-y-3.5 text-xs text-slate-500">
            <div className="p-3 bg-slate-50 rounded-xl dark:bg-slate-950">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Geofencing Validation</span>
              Compares browser checkout geofence coordinates against the user's home residential address on file.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl dark:bg-slate-950">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Velocity Caps</span>
              Detects high frequency transactions completed within short microsecond windows.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. LOAN UNDERWRITING AUDIT
export function EmployeeLoans() {
  const { loans, updateLoanStatus, apiConnected, loading, loadData } = useBanking();

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="AI Credit Underwriting Desk" 
        retry={() => loadData()} 
        loading={loading} 
      />
    );
  }

  const requestedLoans = loans.filter(l => l.status === 'Requested' || l.status === 'Approved' || l.status === 'Rejected');

  const handleUnderwriting = (id, decision) => {
    updateLoanStatus(id, decision);
    Swal.fire({
      title: `Loan ${decision}`,
      text: `Loan Application ${id} has been marked as ${decision}. Notification sent to the client.`,
      icon: decision === 'Approved' ? 'success' : 'error',
      confirmButtonColor: '#4f46e5'
    });
  };

  return (
    <div className="space-y-6" id="employee-loans-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">AI Credit Underwriting Desk</h2>
        <p className="text-xs text-slate-400 mt-0.5">Review AI-generated micro-eligibility indicators and sign off on requested credit files.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-450 dark:border-slate-800 dark:bg-slate-950">
                <th className="px-4 py-3 font-bold">Credit Line Category</th>
                <th className="px-4 py-3 font-bold">Client Email</th>
                <th className="px-4 py-3 font-bold text-right">Sum Request</th>
                <th className="px-4 py-3 font-bold text-right">Tenure / EMI</th>
                <th className="px-4 py-3 font-bold">AI Support Analysis</th>
                <th className="px-4 py-3 font-bold text-center">Underwrite Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {requestedLoans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">No loan applications pending inside system queue.</td>
                </tr>
              ) : (
                requestedLoans.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-slate-950 dark:text-white">{loan.type}</span>
                        <p className="text-[10px] text-slate-400">ID: {loan.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{loan.customerEmail}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-black text-slate-950 dark:text-white">${loan.recommendedAmount.toLocaleString()}</span>
                      <p className="text-[9px] text-slate-400">APR: {loan.interestRate}%</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-slate-900 dark:text-white block">{loan.tenureMonths} Months</span>
                      <p className="text-[9px] text-slate-400">${loan.estimatedEmi.toLocaleString()}/mo</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-600 mb-1">
                          {loan.eligibility}
                        </span>
                        <p className="text-[10px] text-slate-500 italic truncate max-w-[150px]">"{loan.aiReasoning}"</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {loan.status === 'Requested' ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleUnderwriting(loan.id, 'Approved')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-950/30 dark:text-emerald-400"
                            title="Approve Loan"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUnderwriting(loan.id, 'Rejected')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-950/30 dark:text-rose-400"
                            title="Reject Loan"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-extrabold uppercase ${
                          loan.status === 'Approved' ? 'text-emerald-600' : 'text-rose-500'
                        }`}>
                          {loan.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 3. MASTER ANALYTICS VIEW
export function EmployeeAnalytics() {
  const { bankAccounts, transactions, apiConnected, loading, loadData } = useBanking();

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Systemic Capital Analytics" 
        retry={() => loadData()} 
        loading={loading} 
      />
    );
  }

  const assetDistribution = [
    { name: 'Chase Bank Checking', value: 450000 },
    { name: 'Revolut Savings', value: 380000 },
    { name: 'Stripe Corporate', value: 890000 },
    { name: 'External Portfolios', value: 240000 }
  ];

  const transactionTrend = [
    { name: 'Mon', Inflow: 25000, Outflow: 18000 },
    { name: 'Tue', Inflow: 32000, Outflow: 29000 },
    { name: 'Wed', Inflow: 40000, Outflow: 38000 },
    { name: 'Thu', Inflow: 35000, Outflow: 22000 },
    { name: 'Fri', Inflow: 48000, Outflow: 41000 }
  ];

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'];

  return (
    <div className="space-y-6" id="employee-analytics-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Enterprise Asset Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">Consolidated portfolio trends, cash flows, and system block rates.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Assets distribution Donut Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-950 dark:text-white mb-4">Reserves Distribution across Portfolios</h3>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {assetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
            {assetDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="font-semibold text-slate-500 truncate max-w-[100px]">{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Volume Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="text-xs font-bold text-slate-950 dark:text-white mb-4">Inflow vs Outflow Ledger Rates</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Legend iconType="circle" fontSize={11} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Inflow" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Outflow" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. NOTIFICATIONS / SYSTEM ALERTS
export function EmployeeNotificationsPage() {
  const systemAlerts = [
    { id: "notif-emp-1", title: "API Authentication Warning", desc: "Outward connection block triggered by Node-B12. Security checks required.", time: "12 mins ago", severity: "high" },
    { id: "notif-emp-2", title: "PDF OCR Queue Backlog", desc: "OCR processing queue loaded with 3 statements. System resources nominal.", time: "1 hour ago", severity: "medium" },
    { id: "notif-emp-3", title: "Federal Audit Update complete", desc: "Updated KYC directories sync successfully with Flask database templates.", time: "1 day ago", severity: "low" }
  ];

  return (
    <div className="space-y-6" id="employee-notifications-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Staff Alert Logs</h2>
        <p className="text-xs text-slate-400 mt-0.5">Critical system errors, compliance logs, and API status alerts.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {systemAlerts.map(alert => (
            <div key={alert.id} className="p-4 flex justify-between items-start hover:bg-slate-50/20">
              <div className="flex gap-3">
                <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${
                  alert.severity === 'high' ? 'bg-rose-500 animate-pulse' : alert.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-500'
                }`} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{alert.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{alert.desc}</p>
                  <span className="text-[9px] text-slate-400 mt-1 block">{alert.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. SETTINGS
export function EmployeeSettings() {
  return (
    <div className="space-y-6" id="employee-settings-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Staff Security Privileges</h2>
        <p className="text-xs text-slate-400 mt-0.5">Configure operational thresholds and risk auditing limits.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Lock className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-950 dark:text-white">Systemic Risk Limits</h3>
          </div>
          
          <div className="space-y-4 text-xs">
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300">Minimum Automated Block Anomaly Score</span>
              <p className="text-[10px] text-slate-400 mb-2">Block transactions scoring above this index without human underwriting.</p>
              <div className="flex justify-between items-center gap-4">
                <input type="range" min="50" max="95" defaultValue="80" className="flex-1 accent-indigo-600 h-1.5 bg-slate-100 rounded" />
                <span className="font-extrabold text-indigo-600">80% Anomaly</span>
              </div>
            </div>

            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300">Statement OCR Autopilot Matching</span>
              <p className="text-[10px] text-slate-400 mb-2">Auto-approve OCR bank statements when matching credit history parameters.</p>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 rounded border-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
