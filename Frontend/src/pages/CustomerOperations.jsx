import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import ModuleOfflineBlocker from '../components/ModuleOfflineBlocker';
import { 
  Landmark, 
  Search, 
  SlidersHorizontal, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  UploadCloud, 
  TrendingUp, 
  CheckCircle2, 
  Download, 
  Plus, 
  Trash2, 
  DollarSign, 
  ShieldAlert,
  Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import UploadStatementModal from "../components/customer/UploadStatementModal";
import StatementHistory from "../components/customer/StatementHistory";
import TransactionHistory from "../components/customer/TransactionHistory";
import SendMoneyModal from "../components/customer/SendMoneyModal";

// 1. BANK ACCOUNTS VIEW
export function CustomerAccounts() {
  const { currentUser, bankAccounts, addAccount, updateAccountStatus, apiConnected, loading, loadData } = useBanking();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
      bankName: '',
      accountHolderName: currentUser?.fullName || '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      accountType: 'Savings',
      isPrimary: false,
      balance: '5000.00'
  });
  
  const clientAccounts = bankAccounts;

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Connected Banking Portfolios" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (!form.bankName || !form.accountNumber || !form.ifscCode) {
          Swal.fire(
              "Validation Error",
              "Please complete all fields.",
              "warning"
          );
          return;
      }

      try {
          console.log("============= FORM DATA =============");
          console.log(form);
          console.log("=====================================");
        
          await addAccount(form);

          Swal.fire(
              "Portfolio Added",
              `${form.bankName} integrated successfully!`,
              "success"
          );

          setShowAddModal(false);

          setForm({
              bankName: '',
              accountHolderName: currentUser?.fullName || '',
              accountNumber: '',
              ifscCode: '',
              branchName: '',
              accountType: 'Savings',
              isPrimary: false,
              balance: '5000.00'
          });

          loadData();

      } catch (error) {

          Swal.fire(
              "Failed",
              error.response?.data?.message || "Unable to add bank account.",
              "error"
          );

      }
  };

  return (
    <div className="space-y-6" id="customer-accounts-page">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Connected Banking Portfolios</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage and add secondary cash assets supporting AI modeling workflows.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Connect Another Bank
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clientAccounts.map(acc => (
          <div 
            key={acc.id} 
            className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900 transition-all ${
              acc.account_status === 'Suspended' 
                ? 'border-rose-200 dark:border-rose-950/40 opacity-80' 
                : 'border-slate-200/60 hover:border-indigo-500/30 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <Landmark className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-950 dark:text-white">{acc.bank_name}</h3>
                  <span className="text-[9px] font-mono text-slate-400">••{acc.account_number.slice(-4)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                  acc.account_status === 'Active' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' 
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'
                }`}>
                  {acc.account_status}
                </span>
                {acc.is_primary && (
                  <span className="text-[9px] font-bold text-indigo-500 uppercase">Primary</span>
                )}
              </div>
            </div>

            <div className="mt-6">
              <span className="text-[10px] font-semibold text-slate-400">Available Reserves</span>
              <p className="text-xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
                ${Number(acc.current_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-t border-slate-50 dark:border-slate-800/60 mt-4 pt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
              <div>
                <span className="block font-semibold text-slate-400">IFSC Routing Code</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{acc.ifsc_code}</span>
              </div>
              <div>
                <span className="block font-semibold text-slate-400">Branch Name</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">{acc.branch_name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Connect Banking Portfolio</h3>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Bank Name</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  placeholder="Chase Bank"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                  Account Holder Name
                </label>

                <input
                  type="text"
                  value={form.accountHolderName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      accountHolderName: e.target.value
                    })
                  }
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Account Number</label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  placeholder="99102938472"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">IFSC Code</label>
                  <input
                    type="text"
                    value={form.ifscCode}
                    onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                    placeholder="CHAS0001092"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Branch Name</label>
                  <input
                    type="text"
                    value={form.branchName}
                    onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                    placeholder="Silicon Valley Branch"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Account Type</label>
                  <select
                    value={form.accountType}
                    onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Balance ($)</label>
                  <input
                    type="number"
                    value={form.balance}
                    onChange={(e) => setForm({ ...form, balance: e.target.value })}
                    placeholder="5000"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  Integrate Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. TRANSACTIONS LEDGER VIEW
export function CustomerTransactions() {
const {
    currentUser,
    transactions,
    bankAccounts,
    sendMoney,
    apiConnected,
    loading,
    loadData
} = useBanking();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Transaction Intelligence Ledger" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const clientTxns = transactions.filter(t => t.customerEmail === currentUser?.email);

  // Filters
  const filteredTxns = clientTxns.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesType = selectedType === 'All' || t.type === selectedType;
    return matchesSearch && matchesCat && matchesType;
  });

  const downloadReceipt = (txn) => {
    Swal.fire({
      title: 'Generate Receipt PDF',
      text: `Receipt file for ${txn.id} downloaded successfully inside your browser downloads.`,
      icon: 'success',
      confirmButtonColor: '#4f46e5'
    });
  };

  return (
    <div className="space-y-6" id="customer-transactions-page">
      <div className="flex justify-between items-center">

    <div>

        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
            Transaction Intelligence Ledger
        </h2>

        <p className="text-xs text-slate-400 mt-0.5">
            Browse and audit security risk compliance marks assigned to transactions.
        </p>

    </div>

    <button

        onClick={() => setShowSendMoneyModal(true)}

        className="rounded-xl bg-indigo-600 px-5 py-2 text-white font-semibold"

    >

        Send Money

    </button>

</div>

      <TransactionHistory />

      {/* Sliders and Searches */}
      <div className="grid gap-3 md:grid-cols-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search merchants, description codes..."
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="All">All Categories</option>
            <option value="Food">Food & Dining</option>
            <option value="Utilities">Utilities & Rent</option>
            <option value="Salary">Salary Inflows</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Investment">Investment</option>
            <option value="Transfer">Direct Transfer</option>
          </select>
        </div>
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="All">All Types</option>
            <option value="Credit">Credits (+)</option>
            <option value="Debit">Debits (-)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-450 dark:border-slate-800 dark:bg-slate-950">
                <th className="px-4 py-3 font-bold">Transaction Reference</th>
                <th className="px-4 py-3 font-bold">Involved Bank</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Risk Assessment</th>
                <th className="px-4 py-3 font-bold text-right">Amount</th>
                <th className="px-4 py-3 font-bold text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">No matching financial entries found.</td>
                </tr>
              ) : (
                filteredTxns.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-slate-950 dark:text-white">{txn.description}</span>
                        <p className="text-[10px] text-slate-400">{txn.id} • {new Date(txn.timestamp).toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{txn.bankName}</span>
                        <p className="text-[9px] text-slate-400">••{txn.accountNumber.slice(-4)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {txn.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${
                          txn.riskLabel === 'High' ? 'bg-rose-500' : txn.riskLabel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{txn.riskLabel}</span>
                          <p className="text-[9px] text-slate-400">{txn.riskScore}% Anomaly index</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        txn.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {txn.type === 'Credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                      </span>
                      <p className="text-[9px] text-slate-400">{txn.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => downloadReceipt(txn)}
                        className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        title="Download Invoice"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <SendMoneyModal
        open={showSendMoneyModal}
        onClose={() => setShowSendMoneyModal(false)}
        bankAccounts={bankAccounts}
        sendMoney={sendMoney}
        loadData={loadData}
      />
    </div>
  );
}

// 3. BANK STATEMENT UPLOAD & OCR VIEW
export function CustomerStatements() {
  const { currentUser, statements, bankAccounts, uploadStatement, apiConnected, loading, loadData } = useBanking();

  const [showUploadModal, setShowUploadModal] = useState(false);

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="OCR Bank Statement Processor" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  const clientStatements = statements.filter(s => s.customerEmail === currentUser?.email);

 


  return (
  <>

    <div className="space-y-6" id="customer-statements-page">

      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
          OCR Bank Statement Processor
        </h2>

        <p className="text-xs text-slate-400 mt-0.5">
          Upload external statement PDFs. Our neural OCR scanner extracts
          ledger data and populates AI dashboards.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        {/* Upload Card */}

        <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center">

          <UploadCloud
            className="text-indigo-600"
            size={60}
          />

          <h3 className="mt-4 text-lg font-bold">
            Upload Bank Statement
          </h3>

          <p className="text-sm text-slate-500 mt-2 text-center">
            Upload a PDF statement for OCR and AI analysis.
          </p>

          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-500"
          >
            Upload Statement
          </button>

        </div>

        {/* AI Insight */}

        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 h-fit space-y-4">

          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">

            <Info className="h-4.5 w-4.5 text-indigo-500" />

            <h3 className="text-xs font-bold text-slate-950 dark:text-white">
              Active Statement Insights
            </h3>

          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Uploading statements creates a shadow ledger database. Our AI
            models parsing these records identify:
          </p>

          <div className="space-y-3.5 text-xs">

            <div className="rounded-lg bg-indigo-50/50 p-3 border border-indigo-100/60 dark:bg-indigo-950/10 dark:border-indigo-900/20">

              <span className="font-bold text-indigo-950 dark:text-indigo-300 block mb-1">
                Debt-to-Income Audit
              </span>

              Extracted credits are compared with debt outlays, validating
              eligibility for major business lines.

            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">

              <span className="font-bold text-slate-900 dark:text-white block mb-1">
                Dynamic Score Adjustment
              </span>

              A successful OCR upload documenting healthy capital margins
              increases Credit Forecaster indexes immediately.

            </div>

          </div>

        </div>

      </div>
      <div className="mt-8">

        <StatementHistory />

      </div>
     

    </div>

    <UploadStatementModal
      open={showUploadModal}
      onClose={() => setShowUploadModal(false)}
      bankAccounts={bankAccounts}
      uploadStatement={uploadStatement}
      loadData={loadData}
    />

  </>
  );
  
}