import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { motion, AnimatePresence } from 'motion/react';
import ModuleOfflineBlocker from '../components/ModuleOfflineBlocker';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  ShieldAlert, 
  Scale, 
  Sparkles, 
  FileText, 
  Clock, 
  Send, 
  Plus, 
  CheckCircle,
  HelpCircle,
  Landmark
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import Swal from 'sweetalert2';

export default function CustomerDashboard() {
  const { 
    currentUser, 
    bankAccounts, 
    transactions, 
    statements, 
    loans, 
    sendMoney, 
    addNewBankAccount,
    loading,
    error,
    apiConnected,
    loadData
  } = useBanking();

  // Dialog / Drawer states
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  // Form states for send money
  const [sendForm, setSendForm] = useState({
    fromAccountId: bankAccounts[0]?.id || '',
    toAccountName: '',
    toAccountNumber: '',
    category: 'Transfer',
    amount: '',
    paymentMethod: 'UPI',
    description: ''
  });

  // Form states for adding account
  const [accountForm, setAccountForm] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    accountType: 'Savings',
    isPrimary: false,
    balance: '5000.00'
  });

  // Filter out current customer-specific data (though seed is based on our main demo)
  const clientAccounts = bankAccounts || [];
  const clientTxns = transactions || [];
  const clientStatements = statements || [];
  const clientLoans = loans || [];

  // Math totals
  const totalBalance = clientAccounts.reduce(
      (sum, acc) =>
          sum +
          (acc.account_status === "ACTIVE"
              ? Number(acc.current_balance)
              : 0),
      0
);
const primaryAccount =
  clientAccounts.find(acc => acc.is_primary) ||
  clientAccounts[0];
  const suspiciousTxns = clientTxns.filter(t => t.isSuspicious);

  // Chart data 1: Income vs Expenses
  // Mock monthly balance analysis based on user transaction ledger
  const monthlyFlowData = [
    { name: 'Feb', Income: 3800, Expense: 2100 },
    { name: 'Mar', Income: 4200, Expense: 3100 },
    { name: 'Apr', Income: 4000, Expense: 2800 },
    { name: 'May', Income: 4500, Expense: 3400 },
    { name: 'Jun', Income: 5200, Expense: 2900 },
    { name: 'Jul', Income: 4200, Expense: 1980 }
  ];

  // Chart data 2: Category distribution spending
  const categoryTotals = clientTxns
    .filter(t => t.type === "DEBIT")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: parseFloat(categoryTotals[cat].toFixed(2))
  }));

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#3b82f6'];

  const handleSendChange = (e) => {
    setSendForm({ ...sendForm, [e.target.name]: e.target.value });
  };

  const submitSendMoney = async (e) => {
    e.preventDefault();
    if (!sendForm.fromAccountId || !sendForm.amount || !sendForm.toAccountNumber) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Transfer Details',
        text: 'Please specify the source account, transfer amount, and destination credentials.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    const res = await sendMoney(sendForm);
    if (res && res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Transfer Complete',
        text: `Successfully transferred $${sendForm.amount} to ${sendForm.toAccountName || 'Account Holder'}.`,
        confirmButtonColor: '#4f46e5'
      });
      setShowSendMoneyModal(false);
      // Reset form
      setSendForm({
        fromAccountId: bankAccounts[0]?.id || '',
        toAccountName: '',
        toAccountNumber: '',
        category: 'Transfer',
        amount: '',
        paymentMethod: 'UPI',
        description: ''
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Transfer Refused',
        text: res ? res.message : 'Unknown payment processing error.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleAddAccountChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAccountForm({ ...accountForm, [name]: type === 'checkbox' ? checked : value });
  };

  const submitAddAccount = (e) => {
    e.preventDefault();
    if (!accountForm.bankName || !accountForm.accountNumber || !accountForm.ifscCode || !accountForm.branchName) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all banking coordinates.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    addNewBankAccount(accountForm);
    Swal.fire({
      icon: 'success',
      title: 'Portfolio Connected',
      text: `${accountForm.bankName} account has been integrated securely.`,
      confirmButtonColor: '#4f46e5'
    });
    setShowAddAccountModal(false);
    setAccountForm({
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      accountType:"SAVINGS",
      isPrimary: false,
      balance: '5000.00'
    });
  };

  if (loading && !apiConnected) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white p-8 text-center dark:border-slate-800/60 dark:bg-slate-900 shadow-sm" id="dashboard-loading-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Retrieving secure ledger synchronization...</p>
      </div>
    );
  }

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Unified Portfolio Control" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6" 
      id="customer-dashboard"
    >
      
      {/* Welcome & KPI Banner */}
      <motion.div variants={itemVariants} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
            Unified Portfolio Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational overview for {currentUser?.fullName}. Security credentials validated.
          </p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              // Ensure fromAccountId matches whatever is available
              if (clientAccounts.length > 0) {
                setSendForm(prev => ({ ...prev, fromAccountId: clientAccounts[0].id }));
              }
              setShowSendMoneyModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-all hover:-translate-y-px"
          >
            <Send className="h-3.5 w-3.5" /> Outbound Transfer
          </button>
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all hover:-translate-y-px"
          >
            <Plus className="h-3.5 w-3.5 text-slate-400" /> Link New Bank
          </button>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Assets Balance */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 cursor-default transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Liquid Reserves</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="h-3 w-3" /> +14.2% <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </motion.div>

        {/* Predicted Credit Score */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 cursor-default transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">AI Credit Rating</span>
            <div className="rounded-lg bg-violet-50 p-2 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            {currentUser?.creditScore || 785} <span className="text-xs font-bold text-indigo-500 uppercase">Excellent</span>
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-indigo-600 font-semibold dark:text-indigo-400">
            <Sparkles className="h-3 w-3" /> Top 8% of applicants
          </div>
        </motion.div>

        {/* active Fraud monitoring status */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 cursor-default transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Fraud Protection Audits</span>
            <div className={`rounded-lg p-2 ${
              suspiciousTxns.length > 0 
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' 
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
            }`}>
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            {suspiciousTxns.length > 0 ? `${suspiciousTxns.length} Alerts` : "100% Safe"}
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-rose-500 font-semibold">
            {suspiciousTxns.length > 0 ? 'Action required inside fraud panel' : 'Operational nodes secured'}
          </div>
        </motion.div>

        {/* Loan eligibility overview */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 cursor-default transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Max Recommended Loan</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            $12,000
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-400 font-normal">
            At prime <span className="font-semibold text-indigo-600 dark:text-indigo-400">6.8% APR</span> rates
          </div>
        </motion.div>
      </div>

      {/* Main Analytical Section (Glows & Charts) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Income vs Expenses Chart */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold text-slate-950 dark:text-white">Income vs Spending Flows</h3>
              <p className="text-[10px] text-slate-400">Dynamic tracking of cash inflow and liabilities allocation.</p>
            </div>
            <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
              Live Balance Model
            </span>
          </div>
          
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff'
                  }} 
                />
                <Legend iconType="circle" fontSize={11} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Income" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Category Donut Chart */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold text-slate-950 dark:text-white">Spending Categories</h3>
              <p className="text-[10px] text-slate-400">Proportional classification of ledger debits.</p>
            </div>
          </div>
          
          <div className="h-48 mt-4 flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-400">No transactions recorded yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] max-h-20 overflow-y-auto">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[80px]">{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">${item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Security Logs & AI Highlights Panel */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Suspicious Fraud Warnings */}
        {suspiciousTxns.length > 0 && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5 dark:border-rose-950/30 dark:bg-rose-950/10">
            <div className="flex gap-2.5 items-start">
              <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-950 dark:text-rose-400">Critical AI Security Alerts ({suspiciousTxns.length})</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  Our neural anomaly detector identified suspicious activities requiring immediate response.
                </p>
                <div className="mt-4 space-y-3">
                  {suspiciousTxns.map(t => (
                    <div key={t.id} className="bg-white border border-rose-100 rounded-xl p-3.5 dark:bg-slate-900 dark:border-rose-900/20 shadow-sm">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-900 dark:text-white">{t.description}</span>
                        <span className="text-rose-600">-${t.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
                        \"{t.aiExplanation}\"
                      </p>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 mt-2 block">
                        Threat Level: {t.riskLabel} ({t.riskScore}% Probability)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Semantic Financial Health & AI Insights */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-950 dark:text-white">Active AI Financial Insights</h3>
          </div>
          <div className="space-y-4 mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <p>
              <strong>Liquidity Ratio:</strong> Your primary liquidity standing is stable at <strong>1.48</strong>. Available reserves inside <span className="font-semibold text-slate-800 dark:text-slate-200">Chase Bank</span> easily cover routine subscription liabilities and outbound transfers.
            </p>
            <p>
              <strong>Capital Allocation Optimization:</strong> Cash inside Stripe is currently earning 0% yield. To maximize balance growth, we recommend re-allocating $15,000 into a high-yield treasury note.
            </p>
            <div className="rounded-xl bg-indigo-50/50 p-3.5 border border-indigo-100/60 dark:bg-indigo-950/10 dark:border-indigo-900/20 text-[11px]">
              <span className="font-bold text-indigo-950 dark:text-indigo-300 block mb-1">AI Credit Tip:</span>
              Your next score update occurs in 12 days. Maintaining credit utilisation ratios below 10% on your RevolutChecking lines should increase your predicted rating by approximately <strong>+12 points</strong>.
            </div>
          </div>
        </div>

        {/* Linked Portfolios List */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
          <h3 className="text-xs font-bold text-slate-950 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">Linked Portfolios ({clientAccounts.length})</h3>
          <div className="mt-4 space-y-3 max-h-56 overflow-y-auto">
            {clientAccounts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500" id="portfolios-empty-state">
                <Landmark className="h-8 w-8 text-slate-300 mx-auto mb-2 dark:text-slate-700" />
                No linked portfolios. Click "Link New Bank" to get started.
              </div>
            ) : (
              clientAccounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center rounded-xl border border-slate-100 p-3 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <Landmark className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950 dark:text-white">{acc.bank_name}</h4>
                      <p className="text-[10px] text-slate-400">{acc.account_type} Account • ••{acc.account_number.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-950 dark:text-white">${acc.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    {acc.isPrimary && (
                      <span className="block text-[9px] font-bold text-indigo-500 uppercase mt-0.5">Primary</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions & Activity Logs */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-950 dark:text-white">Recent Transactions Ledger</h3>
          </div>
          <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
            {clientTxns.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500" id="transactions-empty-state">
                No transactions recorded. Create an Outbound Transfer to add.
              </div>
            ) : (
              clientTxns.slice(0, 4).map(txn => (
                <div key={txn.id} className="flex items-center justify-between py-1 border-b border-slate-50/50 pb-2 dark:border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold ${
                      txn.type === 'Credit' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' 
                        : txn.is_suspicious 
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30'
                    }`}>
                      {txn.type === 'Credit' ? '+' : '-'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950 dark:text-white leading-tight truncate max-w-[150px]">{txn.description}</h4>
                      <p className="text-[10px] text-slate-400">{txn.bank_name} • {new Date(txn.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${
                      txn.type === 'Credit' 
                        ? 'text-emerald-600' 
                        : txn.is_suspicious 
                        ? 'text-rose-600'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {txn.type === "CREDIT" ? '+' : '-'}${txn.amount.toFixed(2)}
                    </span>
                    <span className="block text-[8px] text-slate-400">{txn.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Outbound Transfer Drawer (Modal) */}
      <AnimatePresence>
        {showSendMoneyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4" 
            id="send-money-modal"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            >
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Outbound Capital Transfer</h3>
            <p className="text-[11px] text-slate-400 mt-1">Simulate real-time fund delivery. Flagged velocity risks are analyzed by active ML models.</p>

            <form onSubmit={submitSendMoney} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Debiting Account</label>
                <select
                  name="fromAccountId"
                  value={sendForm.fromAccountId}
                  onChange={handleSendChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  {clientAccounts.map(acc => (
                    <option key={acc.id} value={acc.id} disabled={acc.account_status !== "ACTIVE"}>
                      {acc.bank_name} • Account ending {acc.account_number.slice(-4)} (${acc.current_balance.toLocaleString()}) {acc.account_status !== "ACTIVE" ? '[SUSPENDED]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Receiver Name</label>
                <input
                  type="text"
                  name="toAccountName"
                  value={sendForm.toAccountName}
                  onChange={handleSendChange}
                  placeholder="e.g. John Doe"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Receiver Account / Routing Number</label>
                <input
                  type="text"
                  name="toAccountNumber"
                  value={sendForm.toAccountNumber}
                  onChange={handleSendChange}
                  placeholder="99203948512"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Transfer Amount ($)</label>
                  <input
                    type="number"
                    name="amount"
                    value={sendForm.amount}
                    onChange={handleSendChange}
                    placeholder="120"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Category</label>
                  <select
                    name="category"
                    value={sendForm.category}
                    onChange={handleSendChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="Food">Food & Dinings</option>
                    <option value="Utilities">Monthly Rent & Utility</option>
                    <option value="Investment">Cryptocurrency / Stocks</option>
                    <option value="Entertainment">Tech & Entertainment</option>
                    <option value="Transfer">Direct Capital Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Payment Channel</label>
                  <select
                    name="paymentMethod"
                    value={sendForm.paymentMethod}
                    onChange={handleSendChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="UPI">UPI instant rail</option>
                    <option value="Net Banking">Net Banking ACH</option>
                    <option value="Card">Visa Debit Token</option>
                    <option value="NEFT">NEFT swift transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Description / Memo</label>
                  <input
                    type="text"
                    name="description"
                    value={sendForm.description}
                    onChange={handleSendChange}
                    placeholder="Reference notes..."
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSendMoneyModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10"
                >
                  Disburse Funds
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Add Account Drawer (Modal) */}
      <AnimatePresence>
        {showAddAccountModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4" 
            id="add-account-modal"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            >
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Link External Banking Portfolio</h3>
            <p className="text-[11px] text-slate-400 mt-1">Connect your balances to leverage conversational credit modeling algorithms.</p>

            <form onSubmit={submitAddAccount} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Bank Corporate Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={accountForm.bankName}
                  onChange={handleAddAccountChange}
                  placeholder="e.g. Citibank / Wells Fargo"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={accountForm.accountNumber}
                  onChange={handleAddAccountChange}
                  placeholder="99102938472"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">IFSC / Routing Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={accountForm.ifscCode}
                    onChange={handleAddAccountChange}
                    placeholder="CITI0001892"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Branch Location</label>
                  <input
                    type="text"
                    name="branchName"
                    value={accountForm.branchName}
                    onChange={handleAddAccountChange}
                    placeholder="Silicon Valley Branch"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Asset Classification</label>
                  <select
                    name="accountType"
                    value={accountForm.accountType}
                    onChange={handleAddAccountChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="SAVINGS">Savings Ledger</option>
                    <option value="CHECKING">Checking Account</option>
                    <option value="BUSINESS">Business Treasury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Available Capital ($)</label>
                  <input
                    type="number"
                    name="balance"
                    value={accountForm.balance}
                    onChange={handleAddAccountChange}
                    placeholder="15000"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  name="isPrimary"
                  id="modal-isPrimary"
                  checked={accountForm.isPrimary}
                  onChange={handleAddAccountChange}
                  className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="modal-isPrimary" className="text-xs font-semibold text-slate-600 dark:text-slate-400">Set as Primary Account</label>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10"
                >
                  Integrate Portfolio
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </motion.div>
  );
}
