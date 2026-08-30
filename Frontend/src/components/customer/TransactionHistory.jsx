import React, { useState } from "react";
import { useBanking } from "../../context/BankingContext";
import { ArrowUpRight, ArrowDownLeft, Shield, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Returns color config for the fraud probability badge.
 * 0-25%   → green
 * 26-50%  → yellow
 * 51-75%  → orange
 * 76-100% → red
 */
function getFraudBadgeConfig(pct) {
  if (pct === null || pct === undefined || pct === 0) {
    return { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-400 dark:text-slate-500", label: "N/A" };
  }
  if (pct <= 25) {
    return { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", label: `${pct.toFixed(1)}%` };
  }
  if (pct <= 50) {
    return { bg: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-700 dark:text-yellow-300", label: `${pct.toFixed(1)}%` };
  }
  if (pct <= 75) {
    return { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300", label: `${pct.toFixed(1)}%` };
  }
  return { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300", label: `${pct.toFixed(1)}%` };
}

function getStatusBadge(status) {
  switch ((status || "").toLowerCase()) {
    case "success":  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "blocked":  return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    case "failed":   return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    case "pending":  return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
    default:         return "bg-slate-100 text-slate-500";
  }
}

function getFraudStatusDot(fraudStatus) {
  switch ((fraudStatus || "").toLowerCase()) {
    case "low risk":    return "bg-emerald-500";
    case "medium risk": return "bg-yellow-500";
    case "high risk":   return "bg-orange-500";
    case "blocked":     return "bg-red-500";
    default:            return "bg-slate-400";
  }
}

const TransactionRow = ({ tx }) => {
  const [expanded, setExpanded] = useState(false);

  const fraudPct    = tx.fraud_probability ?? null;
  const fraudStatus = tx.fraud_status || null;
  const badge       = getFraudBadgeConfig(fraudPct);
  const isDebit     = (tx.transaction_type || "").toLowerCase().includes("debit");

  return (
    <>
      <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">

        {/* Type icon + receiver */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0
              ${isDebit
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-emerald-100 dark:bg-emerald-900/30"
              }`}
            >
              {isDebit
                ? <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                : <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              }
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-white truncate max-w-[140px]">
                {isDebit ? `↑ ${tx.receiver_name}` : `↓ ${tx.receiver_name || "Incoming"}`}
              </p>
              <p className="text-xs text-slate-400 truncate max-w-[140px]">{tx.receiver_bank || tx.source}</p>
            </div>
          </div>
        </td>

        {/* Amount */}
        <td className="py-3 px-4 text-right">
          <p className={`font-bold text-sm ${isDebit ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {isDebit ? "−" : "+"} ₹{Number(tx.amount).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-400">{tx.source || ""}</p>
        </td>

        {/* Transaction Status */}
        <td className="py-3 px-4 text-center">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(tx.status)}`}>
            {tx.status}
          </span>
        </td>

        {/* Fraud % column */}
        <td className="py-3 px-4 text-center">
          <div className="flex flex-col items-center gap-0.5">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
              <Shield className="h-3 w-3" />
              {badge.label}
            </span>
            {fraudStatus && (
              <div className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${getFraudStatusDot(fraudStatus)}`} />
                <span className="text-[10px] text-slate-400">{fraudStatus}</span>
              </div>
            )}
          </div>
        </td>

        {/* Date */}
        <td className="py-3 px-4 text-right">
          <p className="text-xs text-slate-400">
            {tx.created_at
              ? new Date(tx.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : "—"}
          </p>
          <p className="text-[10px] text-slate-300 dark:text-slate-600">
            {tx.created_at
              ? new Date(tx.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
              : ""}
          </p>
        </td>

        {/* Expand toggle */}
        <td className="py-3 px-2 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>
      </tr>

      {/* Expanded Row: Risk details */}
      {expanded && (
        <tr className="border-b border-slate-100 dark:border-slate-800">
          <td colSpan={6} className="px-4 pb-4 pt-0">
            <div className={`rounded-xl border p-4 text-sm space-y-3
              ${tx.fraud_status === "Blocked" || tx.fraud_status === "High Risk"
                ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
                : tx.fraud_status === "Medium Risk"
                ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20"
                : "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20"
              }`}
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-slate-400">Fraud Probability</p>
                  <p className={`font-bold ${badge.text}`}>
                    {tx.fraud_probability != null ? `${Number(tx.fraud_probability).toFixed(1)}%` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Risk Score</p>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {tx.risk_score != null ? Number(tx.risk_score).toFixed(1) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">AI Verdict</p>
                  <p className="font-bold text-slate-800 dark:text-white text-xs">
                    {tx.fraud_status || "N/A"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-mono">
                Ref: {tx.reference || "—"}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const TransactionHistory = () => {
  const { transactions } = useBanking();

  if (!transactions || transactions.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Transaction History</h2>
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-slate-400">
          No transactions found.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Transaction History</h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Fraud probabilities powered by Aegis AI</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" />
                  Fraud %
                </div>
              </th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="py-3 px-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;