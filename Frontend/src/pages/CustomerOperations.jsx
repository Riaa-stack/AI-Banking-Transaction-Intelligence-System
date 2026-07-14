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

// 1. BANK ACCOUNTS VIEW
export function CustomerAccounts() {
  const { currentUser, bankAccounts, addNewBankAccount, updateAccountStatus, apiConnected, loading, loadData } = useBanking();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    accountType: 'Savings',
    isPrimary: false,
    balance: '5000.00'
  });

  const clientAccounts = bankAccounts.filter(acc => acc.customerEmail === currentUser?.email);

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Connected Banking Portfolios" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.bankName || !form.accountNumber || !form.ifscCode) {
      Swal.fire('Validation Error', 'Please complete the banking coords.', 'warning');
      return;
    }
    addNewBankAccount(form);
    Swal.fire('Portfolio Added', `${form.bankName} integrated successfully!`, 'success');
    setShowAddModal(false);
    setForm({
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      accountType: 'Savings',
      isPrimary: false,
      balance: '5000.00'
    });
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
              acc.status === 'Suspended' 
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
                  <h3 className="text-xs font-extrabold text-slate-950 dark:text-white">{acc.bankName}</h3>
                  <span className="text-[9px] font-mono text-slate-400">••{acc.accountNumber.slice(-4)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                  acc.status === 'Active' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' 
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'
                }`}>
                  {acc.status}
                </span>
                {acc.isPrimary && (
                  <span className="text-[9px] font-bold text-indigo-500 uppercase">Primary</span>
                )}
              </div>
            </div>

            <div className="mt-6">
              <span className="text-[10px] font-semibold text-slate-400">Available Reserves</span>
              <p className="text-xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
                ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-t border-slate-50 dark:border-slate-800/60 mt-4 pt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
              <div>
                <span className="block font-semibold text-slate-400">IFSC Routing Code</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{acc.ifscCode}</span>
              </div>
              <div>
                <span className="block font-semibold text-slate-400">Branch Name</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">{acc.branchName}</span>
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
                    <option value="Checking">Checking</option>
                    <option value="Business">Business</option>
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
  const { currentUser, transactions, apiConnected, loading, loadData } = useBanking();
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
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Transaction Intelligence Ledger</h2>
        <p className="text-xs text-slate-400 mt-0.5">Browse and audit security risk compliance marks assigned to transactions.</p>
      </div>

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
    </div>
  );
}

// 3. BANK STATEMENT UPLOAD & OCR VIEW
export function CustomerStatements() {
  const { currentUser, statements, uploadBankStatement, apiConnected, loading, loadData } = useBanking();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file) => {
    if (!file.name.endsWith('.pdf')) {
      Swal.fire('File format error', 'OCR algorithm expects standard .pdf statement documents.', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const triggerUpload = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
      await uploadBankStatement(selectedFile);
      setSelectedFile(null);
      Swal.fire({
        title: 'OCR Extraction Complete',
        text: 'PDF ledger data extracted. Check your AI dashboards for updated credit score forecast and insights.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });
    } catch (err) {
      Swal.fire({
        title: 'Upload Failed',
        text: err.message || 'Failed to process statement OCR.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6" id="customer-statements-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">OCR Bank Statement Processor</h2>
        <p className="text-xs text-slate-400 mt-0.5">Upload external statement PDFs. Our neural OCR scanner extracts ledger data and populates AI dashboards.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Drag Drop Area */}
        <div className="md:col-span-2 space-y-4">
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
              dragActive 
                ? 'border-indigo-600 bg-indigo-50/20' 
                : 'border-slate-200/80 bg-white hover:border-indigo-500/50 dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            {isProcessing ? (
              <div className="space-y-4 py-6">
                <div className="h-10 w-10 mx-auto rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                <div>
                  <h4 className="text-xs font-bold text-slate-950 dark:text-white">Active OCR Scanning Engine...</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Reading PDF vectors and cataloguing ledger entries.</p>
                </div>
              </div>
            ) : selectedFile ? (
              <div className="space-y-4 py-4">
                <FileText className="h-12 w-12 text-indigo-600 mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-slate-950 dark:text-white">{selectedFile.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for OCR Parsing</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Discard
                  </button>
                  <button
                    onClick={triggerUpload}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10"
                  >
                    Run OCR Analysis
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mx-auto">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <label className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                    Click to select file
                    <input type="file" onChange={handleChange} accept=".pdf" className="hidden" />
                  </label>
                  <span className="text-xs text-slate-400"> or drag and drop bank statement</span>
                  <p className="text-[10px] text-slate-450 mt-1">Format restricted to system PDF documents only.</p>
                </div>
              </div>
            )}
          </div>

          {/* Statement Upload History */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="border-b border-slate-100 p-4 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-950 dark:text-white">Parsed Statements Register</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800/60 max-h-60 overflow-y-auto">
              {clientStatements.map(stmt => (
                <div key={stmt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950 dark:text-white">{stmt.filename}</h4>
                      <p className="text-[10px] text-slate-400">Uploaded on {new Date(stmt.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-[10px] font-semibold text-slate-400">OCR Extracted Savings</span>
                      <span className="text-xs font-bold text-emerald-600">+${stmt.extractSummary.netSavings.toLocaleString()}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-600 dark:bg-emerald-950/40">
                        {stmt.ocrStatus}
                      </span>
                      <span className="text-[9px] font-bold text-indigo-500 uppercase">Review: {stmt.reviewStatus}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI OCR Narrative Insight */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Info className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-950 dark:text-white">Active Statement Insights</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Uploading statements creates a shadow ledger database. Our AI models parsing these records identify:
          </p>
          <div className="space-y-3.5 text-xs">
            <div className="rounded-lg bg-indigo-50/50 p-3 border border-indigo-100/60 dark:bg-indigo-950/10 dark:border-indigo-900/20">
              <span className="font-bold text-indigo-950 dark:text-indigo-300 block mb-1">Debt-to-Income Audit</span>
              Extracted credits are compared with debt outlays, validating eligibility for major business lines.
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Dynamic Score Adjustment</span>
              A successful OCR upload documenting healthy capital margins increases Credit Forecaster indexes immediately.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
