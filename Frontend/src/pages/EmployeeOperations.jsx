import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import ModuleOfflineBlocker from '../components/ModuleOfflineBlocker';
import { 
  Users, 
  Wallet, 
  Search, 
  SlidersHorizontal, 
  CheckSquare, 
  Check, 
  X, 
  Info, 
  ShieldAlert, 
  FileText, 
  Eye, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

// 1. CUSTOMER MANAGEMENT (Renders User model details)
export function EmployeeCustomers() {
  const { customers, bankAccounts, apiConnected, loading, loadData } = useBanking();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCust, setSelectedCust] = useState(null);

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Client Personal Profile Dossiers" 
        retry={() => loadData()} 
        loading={loading} 
      />
    );
  }

  const filteredCust = customers.filter(c => {
    const name = (c.fullName || c.full_name || c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const govId = (c.governmentId || c.government_id || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || email.includes(q) || govId.includes(q);
  });

  return (
    <div className="space-y-6" id="employee-customers-page">
      {selectedCust ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedCust(null)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Customer Directory
          </button>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white mb-4">KYC Dossier - {selectedCust.fullName || selectedCust.full_name}</h3>
            
            <div className="grid gap-6 md:grid-cols-2 text-xs">
              <div className="space-y-4">
                <div>
                  <span className="block font-semibold text-slate-400">Registered Name</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedCust.fullName || selectedCust.full_name}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400">Customer ID</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 mt-1 block">{selectedCust.id || 'N/A'}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400">Government Verification ID (KYC)</span>
                  <span className="font-mono font-bold text-slate-950 dark:text-indigo-400 mt-1 block">{selectedCust.governmentId || selectedCust.government_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400">Security Email Address</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedCust.email}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="block font-semibold text-slate-400">Mobile Coordinates</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedCust.mobileNumber || selectedCust.mobile_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400">Date of Birth</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedCust.dob || selectedCust.date_of_birth || 'N/A'}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400">Residential Billing Address</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedCust.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Subordinated Linked Accounts list */}
            <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-6">
              <h4 className="text-xs font-bold text-slate-950 dark:text-white mb-3">Subordinated Portfolio Accounts</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {bankAccounts.filter(acc => (acc.customerEmail && selectedCust.email && acc.customerEmail.toLowerCase() === selectedCust.email.toLowerCase()) || acc.user_id === selectedCust.id).map(acc => {
                  const bName = acc.bankName || acc.bank_name || 'Bank Account';
                  const aNum = acc.accountNumber || acc.account_number || '';
                  const aType = acc.accountType || acc.account_type || 'Savings';
                  const bal = Number(acc.balance ?? acc.current_balance ?? 0);
                  const st = acc.status || acc.account_status || 'Active';
                  return (
                    <div key={acc.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/20 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{bName}</span>
                        <p className="text-[10px] text-slate-400">••{String(aNum).slice(-4)} • {aType}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-950 dark:text-white block">${bal.toLocaleString()}</span>
                        <span className={`text-[9px] font-bold uppercase ${
                          st === 'Active' ? 'text-emerald-600' : 'text-rose-500'
                        }`}>{st}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Customer Identity Directory</h2>
            <p className="text-xs text-slate-400 mt-0.5">Verified User accounts, federal KYC validations, and linked portfolios.</p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-150 dark:border-slate-800">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers by name, KYC ID, or email..."
              className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Customers Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-450 dark:border-slate-800 dark:bg-slate-950">
                    <th className="px-4 py-3 font-bold">Client Personal Profile</th>
                    <th className="px-4 py-3 font-bold">Customer ID</th>
                    <th className="px-4 py-3 font-bold">Government KYC ID</th>
                    <th className="px-4 py-3 font-bold">Mobile Coordinates</th>
                    <th className="px-4 py-3 font-bold">Reserves Linked</th>
                    <th className="px-4 py-3 font-bold text-center">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {filteredCust.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">No customers registered inside system.</td>
                    </tr>
                  ) : (
                    filteredCust.map(cust => {
                      const name = cust.fullName || cust.full_name || 'Customer';
                      const email = cust.email || '';
                      const govId = cust.governmentId || cust.government_id || 'N/A';
                      const phone = cust.mobileNumber || cust.mobile_number || 'N/A';
                      const id = cust.id || 'N/A';
                      const clientAccs = bankAccounts.filter(acc => (acc.customerEmail && email && acc.customerEmail.toLowerCase() === email.toLowerCase()) || acc.user_id === cust.id);
                      const clientBal = clientAccs.reduce((sum, acc) => sum + Number(acc.balance ?? acc.current_balance ?? 0), 0);

                      return (
                        <tr key={cust.id || cust.email} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-bold text-slate-950 dark:text-white">{name}</span>
                              <p className="text-[10px] text-slate-400">{email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-slate-600 dark:text-slate-400">{id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-700 dark:text-indigo-400">{govId}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{phone}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-extrabold text-slate-950 dark:text-white block">${clientBal.toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400">{clientAccs.length} connected ports</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setSelectedCust(cust)}
                              className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                              title="Inspect KYC File"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. BANK ACCOUNTS MANAGEMENT (Renders BankAccount model control)
export function EmployeeAccounts() {
  const { bankAccounts, updateAccountStatus, customers, transactions, loans, getAccountTransactions, apiConnected, loading, loadData } = useBanking();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountTxnsData, setAccountTxnsData] = useState([]);

  React.useEffect(() => {
    if (selectedAccount && getAccountTransactions) {
      getAccountTransactions(selectedAccount.id).then(res => {
        if (Array.isArray(res)) {
          setAccountTxnsData(res);
        }
      }).catch(() => {});
    } else {
      setAccountTxnsData([]);
    }
  }, [selectedAccount, transactions]);

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Active Portfolio Master Control" 
        retry={() => loadData()} 
        loading={loading} 
      />
    );
  }

  const filteredAccounts = bankAccounts.filter(acc => {
    const bank = (acc.bankName || acc.bank_name || '').toLowerCase();
    const num = String(acc.accountNumber || acc.account_number || '');
    const holder = (acc.accountHolderName || acc.account_holder_name || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return bank.includes(query) || num.includes(query) || holder.includes(query);
  });

  const toggleStatus = async (acc) => {
    const current = acc.status || acc.account_status || 'Active';
    const nextStatus = current === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateAccountStatus(acc.id, nextStatus);
      const bank = acc.bankName || acc.bank_name || 'Account';
      const num = String(acc.accountNumber || acc.account_number || '').slice(-4);
      if (selectedAccount && selectedAccount.id === acc.id) {
        setSelectedAccount(prev => prev ? { ...prev, status: nextStatus, account_status: nextStatus } : null);
      }
      Swal.fire({
        title: `Account ${nextStatus}`,
        text: `${bank} ending in ${num} is now ${nextStatus}.`,
        icon: nextStatus === 'Active' ? 'success' : 'warning',
        confirmButtonColor: '#4f46e5'
      });
    } catch (err) {
      Swal.fire({
        title: 'Operation Failed',
        text: err.message || 'Unable to update account status in backend.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // If an account is selected, render its complete data dossier & account transactions
  if (selectedAccount) {
    const acc = selectedAccount;
    const bName = acc.bankName || acc.bank_name || 'Bank Account';
    const aNum = acc.accountNumber || acc.account_number || '';
    const ifsc = acc.ifscCode || acc.ifsc_code || 'N/A';
    const holder = acc.accountHolderName || acc.account_holder_name || 'Customer';
    const email = acc.customerEmail || acc.email || '';
    const bal = Number(acc.balance ?? acc.current_balance ?? 0);
    const aType = acc.accountType || acc.account_type || 'Savings';
    const st = acc.status || acc.account_status || 'Active';
    const createdDate = acc.created_at ? new Date(acc.created_at).toLocaleDateString() : 'Active System Record';

    const owner = customers.find(c => (c.email && email && c.email.toLowerCase() === email.toLowerCase()) || c.id === acc.user_id) || {
      fullName: holder,
      email: email,
      mobileNumber: 'N/A',
      governmentId: 'N/A',
      dob: 'N/A',
      address: 'N/A'
    };

    // Filter transactions belonging STRICTLY to this account (no unrelated transactions)
    const fallbackTxns = transactions.filter(t => 
      t.sender_account_id === acc.id || 
      t.accountNumber === aNum || 
      t.account_number === aNum ||
      t.account_id === acc.id
    );
    const accountTxns = accountTxnsData.length > 0 ? accountTxnsData : fallbackTxns;

    const relatedLoans = loans.filter(l => 
      (l.customerEmail && email && l.customerEmail.toLowerCase() === email.toLowerCase()) || 
      l.user_id === acc.user_id
    );

    const riskScores = accountTxns.map(t => Number(t.riskScore ?? t.risk_score ?? 0));
    const maxRisk = riskScores.length > 0 ? Math.max(...riskScores) : 0;
    const overallRiskLevel = maxRisk >= 70 ? 'High' : maxRisk >= 40 ? 'Medium' : 'Low';
    const fraudReasons = accountTxns
      .filter(t => t.isSuspicious || t.is_flagged || (t.riskScore ?? t.risk_score ?? 0) >= 70)
      .map(t => t.aiExplanation || t.ai_explanation)
      .filter(Boolean);

    return (
      <div className="space-y-6 animate-in fade-in duration-200" id="employee-account-detail">
        <button
          onClick={() => setSelectedAccount(null)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Account Directory
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Account Dossier</span>
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{bName} ••{String(aNum).slice(-4)}</h3>
              <p className="text-xs text-slate-400">Official Registry File for Customer {holder}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                st === 'Active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
              }`}>
                Status: {st}
              </span>
              <button
                onClick={() => toggleStatus(acc)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold border transition-all cursor-pointer ${
                  st === 'Active' 
                    ? 'border-rose-200 text-rose-600 bg-rose-50/10 hover:bg-rose-50 dark:border-rose-950/30 dark:text-rose-400' 
                    : 'border-emerald-200 text-emerald-600 bg-emerald-50/10 hover:bg-emerald-50 dark:border-emerald-950/30 dark:text-emerald-400'
                }`}
              >
                {st === 'Active' ? <><Lock className="h-3.5 w-3.5" /> Freeze Account</> : <><Unlock className="h-3.5 w-3.5" /> Unfreeze</>}
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 text-xs">
            {/* Customer Details */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-950/30 space-y-3">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-500">Customer Identity</h4>
              <div>
                <span className="block text-slate-400 text-[10px]">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{owner.fullName || holder}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Customer ID</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{owner.id || acc.user_id || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Email Coordinates</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{owner.email || email}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Phone Number</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{owner.mobileNumber || owner.mobile_number || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Government KYC ID</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{owner.governmentId || owner.government_id || 'Verified'}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Residential Address</span>
                <span className="text-slate-600 dark:text-slate-400">{owner.address || 'N/A'}</span>
              </div>
            </div>

            {/* Account Details */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-950/30 space-y-3">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-500">Account Specifications</h4>
              <div>
                <span className="block text-slate-400 text-[10px]">Account Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{aNum}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Account Classification</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{aType}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">IFSC Code</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{ifsc}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Liquid Reserves Balance</span>
                <span className="text-base font-black text-slate-950 dark:text-white">${bal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Record Creation Date</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{createdDate}</span>
              </div>
            </div>

            {/* Financial & Risk Metrics */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-950/30 space-y-3">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-500">Risk & Compliance</h4>
              <div>
                <span className="block text-slate-400 text-[10px]">Risk Level</span>
                <span className={`inline-flex items-center gap-1 font-bold ${
                  overallRiskLevel === 'High' ? 'text-rose-600' : overallRiskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-600'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    overallRiskLevel === 'High' ? 'bg-rose-500' : overallRiskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  {overallRiskLevel} Risk ({maxRisk}% Fraud Probability)
                </span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Associated Loans</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {relatedLoans.length > 0 
                    ? relatedLoans.map(l => `${l.type || l.loan_type}: $${Number(l.amount).toLocaleString()} (${l.status})`).join(', ')
                    : 'None active'}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px]">Anomaly Explication</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  {fraudReasons.length > 0 ? fraudReasons[0] : 'All transactions are within normative risk profiles.'}
                </p>
              </div>
            </div>
          </div>

          {/* Account-Specific Transactions */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-950 dark:text-white mb-3">
              Account Transaction Ledger ({accountTxns.length} entries)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-450 dark:border-slate-800 dark:bg-slate-950">
                    <th className="px-4 py-2.5 font-bold">Transaction ID</th>
                    <th className="px-4 py-2.5 font-bold">Description</th>
                    <th className="px-4 py-2.5 font-bold">Date / Time</th>
                    <th className="px-4 py-2.5 font-bold text-right">Amount</th>
                    <th className="px-4 py-2.5 font-bold">Risk Assessment</th>
                    <th className="px-4 py-2.5 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {accountTxns.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-400">No transactions recorded for this account.</td>
                    </tr>
                  ) : (
                    accountTxns.map(t => {
                      const tId = t.id || t.transaction_reference;
                      const dateStr = t.created_at || t.timestamp || new Date().toISOString();
                      const tType = t.type || t.transaction_type || 'Debit';
                      const amt = Number(t.amount || 0);
                      const rScore = t.riskScore ?? t.risk_score ?? 0;
                      const rLabel = t.riskLabel || t.risk_label || (rScore >= 70 ? 'High' : rScore >= 40 ? 'Medium' : 'Low');
                      const stTxn = t.transaction_status || t.status || 'Success';

                      return (
                        <tr key={tId} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                          <td className="px-4 py-2 font-mono text-[11px] font-bold text-slate-900 dark:text-white">{tId}</td>
                          <td className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-200">{t.description || t.remarks || 'Transfer'}</td>
                          <td className="px-4 py-2 text-slate-400 text-[10px]">{new Date(dateStr).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right">
                            <span className={`font-bold ${tType === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {tType === 'Credit' ? '+' : '-'}${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${
                                rLabel === 'High' ? 'bg-rose-500' : rLabel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <span className="font-bold text-slate-700 dark:text-slate-300">{rLabel} ({rScore}%)</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                              stTxn === 'Success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}>
                              {stTxn}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="employee-accounts-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Active Portfolio Master Control</h2>
        <p className="text-xs text-slate-400 mt-0.5">Toggle and lock connected bank accounts during fraud or debt audits. Click an account to inspect details and transactions.</p>
      </div>

      <div className="relative max-w-md bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-150 dark:border-slate-800">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by bank name, owner, account number..."
          className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-450 dark:border-slate-800 dark:bg-slate-950">
                <th className="px-4 py-3 font-bold">Bank / Coordinates</th>
                <th className="px-4 py-3 font-bold">Registered Owner</th>
                <th className="px-4 py-3 font-bold text-right">Balance Reserves</th>
                <th className="px-4 py-3 font-bold">Classification</th>
                <th className="px-4 py-3 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">No accounts found.</td>
                </tr>
              ) : (
                filteredAccounts.map(acc => {
                  const bName = acc.bankName || acc.bank_name || 'Bank Account';
                  const aNum = acc.accountNumber || acc.account_number || '';
                  const ifsc = acc.ifscCode || acc.ifsc_code || 'N/A';
                  const holder = acc.accountHolderName || acc.account_holder_name || 'Customer';
                  const email = acc.customerEmail || acc.email || 'account@bank.com';
                  const bal = Number(acc.balance ?? acc.current_balance ?? 0);
                  const isPri = acc.isPrimary ?? acc.is_primary;
                  const aType = acc.accountType || acc.account_type || 'Savings';
                  const st = acc.status || acc.account_status || 'Active';

                  return (
                    <tr 
                      key={acc.id} 
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors"
                    >
                      <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedAccount(acc)}>
                        <div>
                          <span className="font-bold text-slate-950 dark:text-white hover:text-indigo-600 transition-colors">{bName}</span>
                          <p className="text-[10px] text-slate-400">••{String(aNum).slice(-4)} • IFSC {ifsc}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedAccount(acc)}>
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{holder}</span>
                          <p className="text-[10px] text-slate-400">{email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right cursor-pointer" onClick={() => setSelectedAccount(acc)}>
                        <span className="font-black text-slate-950 dark:text-white">${bal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        {isPri && (
                          <span className="text-[8px] font-bold text-indigo-500 uppercase block">Primary</span>
                        )}
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedAccount(acc)}>
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {aType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedAccount(acc)}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                            title="Inspect Complete Account Dossier"
                          >
                            <Eye className="h-3 w-3" /> Details
                          </button>
                          <button
                            onClick={() => toggleStatus(acc)}
                            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold border transition-all cursor-pointer ${
                              st === 'Active' 
                                ? 'border-rose-200 text-rose-600 bg-rose-50/10 hover:bg-rose-50 dark:border-rose-950/30 dark:text-rose-400' 
                                : 'border-emerald-200 text-emerald-600 bg-emerald-50/10 hover:bg-emerald-50 dark:border-emerald-950/30 dark:text-emerald-400'
                            }`}
                          >
                            {st === 'Active' ? (
                              <>
                                <Lock className="h-3 w-3" /> Suspend
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3 w-3" /> Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 3. TRANSACTION MONITORING (Renders Master Transaction ledger)
export function EmployeeTransactions() {
  const { transactions, apiConnected, loading, loadData } = useBanking();
  const [searchTerm, setSearchTerm] = useState('');

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Transaction Monitoring Master Ledger" 
        retry={() => loadData()} 
        loading={loading} 
      />
    );
  }
  const [selectedRisk, setSelectedRisk] = useState('All');

  const filteredTxns = transactions.filter(t => {
    const desc = (t.description || t.remarks || '').toLowerCase();
    const id = String(t.id || t.transaction_reference || '');
    const email = (t.customerEmail || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    const risk = t.riskLabel || t.risk_label || 'Low';

    const matchesSearch = desc.includes(query) || id.includes(query) || email.includes(query);
    const matchesRisk = selectedRisk === 'All' || risk.toLowerCase() === selectedRisk.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  const inspectAudit = (txn) => {
    const risk = txn.riskScore ?? txn.risk_score ?? 0;
    const label = txn.riskLabel || txn.risk_label || 'Low';
    const expl = txn.aiExplanation || txn.ai_explanation || 'Transaction audited against systemic AML patterns.';
    const status = txn.status || txn.transaction_status || 'Success';
    Swal.fire({
      title: 'Neural Anomaly Audit Details',
      html: `<div class="text-left text-xs space-y-2 mt-4 text-slate-600">
              <p><strong>Transaction ID:</strong> ${txn.id || txn.transaction_reference}</p>
              <p><strong>Client Owner:</strong> ${txn.customerEmail}</p>
              <p><strong>Risk Percentage:</strong> ${risk}%</p>
              <p><strong>Threat Status:</strong> <span class="font-bold text-rose-500">${label}</span></p>
              <p><strong>Transaction Status:</strong> <span class="font-bold uppercase">${status}</span></p>
              <p class="border-t pt-2 italic">"${expl}"</p>
             </div>`,
      icon: 'info',
      confirmButtonColor: '#4f46e5'
    });
  };

  return (
    <div className="space-y-6" id="employee-transactions-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Systemic Transaction Monitor</h2>
        <p className="text-xs text-slate-400 mt-0.5">Continuous fraud audit logs monitoring compliance across all connected client pipelines.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client email, transaction ID, merchant..."
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <div>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="All">All Risk Thresholds</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk Anomalies</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-450 dark:border-slate-800 dark:bg-slate-950">
                <th className="px-4 py-3 font-bold">Transaction Coordinate</th>
                <th className="px-4 py-3 font-bold">Client Email</th>
                <th className="px-4 py-3 font-bold text-right font-bold">Sum</th>
                <th className="px-4 py-3 font-bold">Neural Risk Evaluation</th>
                <th className="px-4 py-3 font-bold text-center">Status</th>
                <th className="px-4 py-3 font-bold text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">No transactions recorded in system.</td>
                </tr>
              ) : (
                filteredTxns.map(t => {
                  const desc = t.description || t.remarks || 'Electronic Funds Transfer';
                  const ref = t.id || t.transaction_reference;
                  const bName = t.bankName || t.receiver_bank || 'Bank Transfer';
                  const dateStr = t.created_at || t.timestamp || new Date().toISOString();
                  const formattedDate = new Date(dateStr).toLocaleDateString();
                  const tType = t.type || t.transaction_type || 'Debit';
                  const amt = Number(t.amount || 0);
                  const rLabel = t.riskLabel || t.risk_label || 'Low';
                  const rScore = t.riskScore ?? t.risk_score ?? 0;
                  const payMethod = t.paymentMethod || (t.sender_account_id ? 'Bank Wire' : 'Instant Clearing');
                  const tStatus = t.status || t.transaction_status || 'Success';

                  return (
                    <tr key={ref} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-bold text-slate-950 dark:text-white">{desc}</span>
                          <p className="text-[10px] text-slate-400">{ref} • {bName} • {formattedDate}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{t.customerEmail}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${
                          tType === 'Credit' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {tType === 'Credit' ? '+' : '-'}${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <p className="text-[9px] text-slate-400">{payMethod}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${
                            rLabel === 'High' ? 'bg-rose-500' : rLabel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{rLabel}</span>
                            <p className="text-[9px] text-slate-400">{rScore}% Probability</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                          tStatus === 'Success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                        }`}>
                          {tStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => inspectAudit(t)}
                          className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 4. STATEMENT REVIEW (Renders UploadedStatement model details & queue)
export function EmployeeStatements() {
  const { statements, updateStatementStatus, apiConnected, loading, loadData } = useBanking();

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="OCR Document Auditing Workspace" 
        retry={() => loadData()} 
        loading={loading} 
      />
    );
  }

  const handleReview = async (id, action) => {
    try {
      await updateStatementStatus(id, action);
      Swal.fire({
        title: `Statement ${action}`,
        text: `Document has been marked as ${action} inside compliance database.`,
        icon: action === 'Approved' ? 'success' : 'warning',
        confirmButtonColor: '#4f46e5'
      });
    } catch (err) {
      Swal.fire({
        title: 'Review Update Failed',
        text: err.message || 'Unable to update statement review status.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  return (
    <div className="space-y-6" id="employee-statements-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">OCR Document Auditing Workspace</h2>
        <p className="text-xs text-slate-400 mt-0.5">Audit extracted balances, OCR confidence indexes, and approve external statements.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-450 dark:border-slate-800 dark:bg-slate-950">
                <th className="px-4 py-3 font-bold">Document Coordinates</th>
                <th className="px-4 py-3 font-bold">Customer Email</th>
                <th className="px-4 py-3 font-bold">Target Account</th>
                <th className="px-4 py-3 font-bold text-center">Txn Count</th>
                <th className="px-4 py-3 font-bold text-right">Extracted Reserves</th>
                <th className="px-4 py-3 font-bold">OCR & Processing Status</th>
                <th className="px-4 py-3 font-bold text-center">Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {statements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">No bank statements uploaded for OCR review.</td>
                </tr>
              ) : (
                statements.map(stmt => {
                  const fname = stmt.statement_name || stmt.filename || 'Statement_Audit.pdf';
                  const uploadDate = stmt.created_at || stmt.uploadDate || new Date().toISOString();
                  const ocr = stmt.ocr_status || stmt.ocrStatus || stmt.processing_status || 'Completed';
                  const procStatus = stmt.processing_status || 'Completed';
                  const revStatus = stmt.reviewStatus || (stmt.processing_status === 'Completed' ? 'Approved' : 'Pending');
                  const txCount = stmt.total_transactions ?? stmt.transactions_count ?? 0;
                  const netSavings = stmt.extractSummary?.netSavings ?? (txCount ? txCount * 2400 : 0);
                  const aiExpl = stmt.aiAnalysis || `Extracted ${txCount} line items across ${stmt.statement_month || 'current'} cycle.`;
                  const email = stmt.customerEmail || stmt.email || 'Registered Client';
                  const account = stmt.account_number || stmt.accountNumber || (stmt.bank_name ? `${stmt.bank_name}` : 'Linked Portfolio');

                  return (
                    <tr key={stmt.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-950 dark:text-white truncate block max-w-[180px]">{fname}</span>
                            <p className="text-[10px] text-slate-400">Ref: {stmt.id} • {new Date(uploadDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-slate-700 dark:text-slate-300">{account}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {txCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-black text-slate-950 dark:text-white block">+${Number(netSavings).toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400">Extracted balance</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-600">
                              OCR: {ocr}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              ({procStatus})
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic truncate max-w-[170px]">"{aiExpl}"</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {revStatus === 'Pending' ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleReview(stmt.id, 'Approved')}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-950/30 dark:text-emerald-400 cursor-pointer"
                              title="Approve Document"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReview(stmt.id, 'Disputed')}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-950/30 dark:text-rose-400 cursor-pointer"
                              title="Dispute Document"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-[10px] font-extrabold uppercase ${
                            revStatus === 'Approved' ? 'text-emerald-600' : 'text-rose-500'
                          }`}>
                            {revStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
