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

  const filteredCust = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white mb-4">KYC Dossier - {selectedCust.fullName}</h3>
            
            <div className="grid gap-6 md:grid-cols-2 text-xs">
              <div className="space-y-4">
                <div>
                  <span className="block font-semibold text-slate-400">Registered Name</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedCust.fullName}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400">Government Verification ID</span>
                  <span className="font-mono font-bold text-slate-950 dark:text-indigo-400 mt-1 block">{selectedCust.governmentId}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400">Security Email Address</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedCust.email}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="block font-semibold text-slate-400">Mobile Coordinates</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedCust.mobileNumber}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400">Date of Birth</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedCust.dob}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400">Residential Billing Address</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedCust.address}</span>
                </div>
              </div>
            </div>

            {/* Subordinated Linked Accounts list */}
            <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-6">
              <h4 className="text-xs font-bold text-slate-950 dark:text-white mb-3">Subordinated Portfolio Accounts</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {bankAccounts.filter(acc => acc.customerEmail === selectedCust.email).map(acc => (
                  <div key={acc.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/20 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{acc.bankName}</span>
                      <p className="text-[10px] text-slate-400">••{acc.accountNumber.slice(-4)} • {acc.accountType}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-950 dark:text-white block">${acc.balance.toLocaleString()}</span>
                      <span className={`text-[9px] font-bold uppercase ${
                        acc.status === 'Active' ? 'text-emerald-600' : 'text-rose-500'
                      }`}>{acc.status}</span>
                    </div>
                  </div>
                ))}
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
                    <th className="px-4 py-3 font-bold">Government KYC ID</th>
                    <th className="px-4 py-3 font-bold">Mobile Coordinates</th>
                    <th className="px-4 py-3 font-bold">Reserves Linked</th>
                    <th className="px-4 py-3 font-bold text-center">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {filteredCust.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">No customers registered inside system.</td>
                    </tr>
                  ) : (
                    filteredCust.map(cust => {
                      const clientAccs = bankAccounts.filter(acc => acc.customerEmail === cust.email);
                      const clientBal = clientAccs.reduce((sum, acc) => sum + acc.balance, 0);

                      return (
                        <tr key={cust.email} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-bold text-slate-950 dark:text-white">{cust.fullName}</span>
                              <p className="text-[10px] text-slate-400">{cust.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-700 dark:text-indigo-400">{cust.governmentId}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{cust.mobileNumber}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-extrabold text-slate-950 dark:text-white block">${clientBal.toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400">{clientAccs.length} connected ports</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setSelectedCust(cust)}
                              className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
  const { bankAccounts, updateAccountStatus, apiConnected, loading, loadData } = useBanking();
  const [searchTerm, setSearchTerm] = useState('');

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Active Portfolio Master Control" 
        retry={() => loadData()} 
        loading={loading} 
      />
    );
  }

  const filteredAccounts = bankAccounts.filter(acc => 
    acc.bankName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.accountNumber.includes(searchTerm) || 
    acc.accountHolderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (acc) => {
    const nextStatus = acc.status === 'Active' ? 'Suspended' : 'Active';
    updateAccountStatus(acc.id, nextStatus);
    Swal.fire({
      title: `Account ${nextStatus}`,
      text: `${acc.bankName} ending in ${acc.accountNumber.slice(-4)} is now ${nextStatus}.`,
      icon: nextStatus === 'Active' ? 'success' : 'warning',
      confirmButtonColor: '#4f46e5'
    });
  };

  return (
    <div className="space-y-6" id="employee-accounts-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Active Portfolio Master Control</h2>
        <p className="text-xs text-slate-400 mt-0.5">Toggle and lock connected bank accounts during fraud or debt audits.</p>
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
                <th className="px-4 py-3 font-bold text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filteredAccounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-bold text-slate-950 dark:text-white">{acc.bankName}</span>
                      <p className="text-[10px] text-slate-400">••{acc.accountNumber} • IFSC {acc.ifscCode}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{acc.accountHolderName}</span>
                      <p className="text-[10px] text-slate-400">{acc.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-black text-slate-950 dark:text-white">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    {acc.isPrimary && (
                      <span className="text-[8px] font-bold text-indigo-500 uppercase">Primary</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {acc.accountType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(acc)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold border transition-all cursor-pointer ${
                        acc.status === 'Active' 
                          ? 'border-rose-200 text-rose-600 bg-rose-50/10 hover:bg-rose-50 dark:border-rose-950/30 dark:text-rose-400' 
                          : 'border-emerald-200 text-emerald-600 bg-emerald-50/10 hover:bg-emerald-50 dark:border-emerald-950/30 dark:text-emerald-400'
                      }`}
                    >
                      {acc.status === 'Active' ? (
                        <>
                          <Lock className="h-3 w-3" /> Suspend
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3 w-3" /> Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
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
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.includes(searchTerm) || t.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = selectedRisk === 'All' || t.riskLabel === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  const inspectAudit = (txn) => {
    Swal.fire({
      title: 'Neural Anomaly Audit Details',
      html: `<div class="text-left text-xs space-y-2 mt-4 text-slate-600">
              <p><strong>Transaction ID:</strong> ${txn.id}</p>
              <p><strong>Client Owner:</strong> ${txn.customerEmail}</p>
              <p><strong>Risk Percentage:</strong> ${txn.riskScore}%</p>
              <p><strong>Threat Status:</strong> <span class="font-bold text-rose-500">${txn.riskLabel}</span></p>
              <p class="border-t pt-2 italic">"${txn.aiExplanation}"</p>
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
                <th className="px-4 py-3 font-bold text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filteredTxns.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-bold text-slate-950 dark:text-white">{t.description}</span>
                      <p className="text-[10px] text-slate-400">{t.id} • {t.bankName} • {new Date(t.timestamp).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{t.customerEmail}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${
                      t.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {t.type === 'Credit' ? '+' : '-'}${t.amount.toFixed(2)}
                    </span>
                    <p className="text-[9px] text-slate-400">{t.paymentMethod}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        t.riskLabel === 'High' ? 'bg-rose-500' : t.riskLabel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{t.riskLabel}</span>
                        <p className="text-[9px] text-slate-400">{t.riskScore}% Probability</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => inspectAudit(t)}
                      className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
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

  const handleReview = (id, action) => {
    updateStatementStatus(id, action);
    Swal.fire({
      title: `Statement ${action}`,
      text: `Document has been marked as ${action} inside compliance database.`,
      icon: action === 'Approved' ? 'success' : 'warning',
      confirmButtonColor: '#4f46e5'
    });
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
                <th className="px-4 py-3 font-bold">PDF Filename Coordinates</th>
                <th className="px-4 py-3 font-bold">Client Email</th>
                <th className="px-4 py-3 font-bold text-right font-bold">Extracted Reserves</th>
                <th className="px-4 py-3 font-bold">Confidence & Summary</th>
                <th className="px-4 py-3 font-bold text-center">Actions Queue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {statements.map(stmt => (
                <tr key={stmt.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <div>
                        <span className="font-bold text-slate-950 dark:text-white truncate block max-w-[200px]">{stmt.filename}</span>
                        <p className="text-[10px] text-slate-450">ID: {stmt.id} • {new Date(stmt.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{stmt.customerEmail}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-black text-slate-950 dark:text-white block">+${stmt.extractSummary.netSavings.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400">Net extracted balance</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-600 mb-1">
                        OCR {stmt.ocrStatus} (98% Conf.)
                      </span>
                      <p className="text-[10px] text-slate-500 italic truncate max-w-[180px]">"{stmt.aiAnalysis}"</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stmt.reviewStatus === 'Pending' ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleReview(stmt.id, 'Approved')}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-950/30 dark:text-emerald-400"
                          title="Approve Document"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReview(stmt.id, 'Disputed')}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-950/30 dark:text-rose-400"
                          title="Dispute Document"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-extrabold uppercase ${
                        stmt.reviewStatus === 'Approved' ? 'text-emerald-600' : 'text-rose-500'
                      }`}>
                        {stmt.reviewStatus}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
