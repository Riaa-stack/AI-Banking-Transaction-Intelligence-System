import React, { useState } from "react";
import {
  X,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  BookOpen,
  ShieldAlert,
  TrendingUp,
  User,
  Building2,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";

/**
 * FraudDetailModal
 *
 * A rich, premium modal that shows the complete fraud analysis
 * after every transaction.
 *
 * Props:
 *   open         {boolean}
 *   onClose      {function}
 *   transactionData {object}  - the full API response from send_money
 */

const FraudDetailModal = ({ open, onClose, transactionData }) => {
  const [expandedSection, setExpandedSection] = useState("summary");

  if (!open || !transactionData) return null;

  const { transaction_status, amount, transaction_reference, available_balance, fraud_report = {} } = transactionData;

  const {
    ml_probability = 0,
    rule_score = 0,
    final_score = 0,
    fraud_probability = 0,
    fraud_status = "Low Risk",
    recommendation = "",
    reasons = [],
    model_used = false,
    ai_analysis: raw_ai_analysis = {},
  } = fraud_report;

  // ai_analysis can arrive as a plain object (from live API response),
  // a valid JSON string (stored via json.dumps in fraud_detection.py),
  // or a legacy Python repr string (stored via str() — single-quoted keys).
  // This helper safely extracts it in all three cases.
  const safeParseAnalysis = (raw) => {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch (_) {
      // Attempt to repair Python repr → JSON (single quotes → double quotes)
      try {
        const repaired = raw
          .replace(/'/g, '"')           // single → double quotes
          .replace(/True/g, "true")     // Python True → JSON true
          .replace(/False/g, "false")   // Python False → JSON false
          .replace(/None/g, "null");    // Python None → JSON null
        return JSON.parse(repaired);
      } catch (__) {
        return { risk_summary: String(raw) };
      }
    }
  };

  const ai_analysis = safeParseAnalysis(raw_ai_analysis);

  const {
    risk_summary = "",
    fraud_reasoning = "",
    fraud_indicators = [],
    recommendation_bank = "",
    recommendation_customer = "",
    confidence_adjustment = 0,
  } = ai_analysis;

  const isBlocked  = transaction_status === "Blocked" || fraud_status === "Blocked";
  const isHighRisk = fraud_status === "High Risk";
  const isMedRisk  = fraud_status === "Medium Risk";
  const isSafe     = fraud_status === "Low Risk";

  // Color tokens based on fraud status
  const statusConfig = isBlocked
    ? { color: "red",    bg: "bg-red-50 dark:bg-red-950/30",    border: "border-red-300 dark:border-red-800", text: "text-red-700 dark:text-red-300",    badge: "bg-red-600 text-white",    gauge: "#ef4444" }
    : isHighRisk
    ? { color: "rose",   bg: "bg-rose-50 dark:bg-rose-950/30",  border: "border-rose-300 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300", badge: "bg-rose-600 text-white",    gauge: "#f43f5e" }
    : isMedRisk
    ? { color: "orange", bg: "bg-amber-50 dark:bg-amber-950/30",border: "border-amber-300 dark:border-amber-800",text: "text-amber-700 dark:text-amber-300",badge: "bg-amber-500 text-white",   gauge: "#f59e0b" }
    : { color: "green",  bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-300 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-600 text-white", gauge: "#10b981" };

  // Circular gauge math
  const RADIUS = 52;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE - (fraud_probability / 100) * CIRCUMFERENCE;

  const toggle = (sec) => setExpandedSection(expandedSection === sec ? null : sec);

  const Section = ({ id, icon: Icon, label, children }) => (
    <div className={`rounded-xl border ${statusConfig.border} overflow-hidden`}>
      <button
        onClick={() => toggle(id)}
        className={`w-full flex items-center justify-between p-4 ${statusConfig.bg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${statusConfig.text}`} />
          <span className={`font-semibold text-sm ${statusConfig.text}`}>{label}</span>
        </div>
        {expandedSection === id
          ? <ChevronUp className="h-4 w-4 text-slate-400" />
          : <ChevronDown className="h-4 w-4 text-slate-400" />
        }
      </button>
      {expandedSection === id && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
        style={{ scrollbarWidth: "thin" }}
      >

        {/* ── Header ────────────────────────────────── */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${statusConfig.border} ${statusConfig.bg}`}>
          <div className="flex items-center gap-3">
            {isBlocked
              ? <Shield className={`h-6 w-6 ${statusConfig.text}`} />
              : isSafe
              ? <CheckCircle2 className={`h-6 w-6 ${statusConfig.text}`} />
              : <AlertTriangle className={`h-6 w-6 ${statusConfig.text}`} />
            }
            <div>
              <h2 className={`text-lg font-bold ${statusConfig.text}`}>
                {isBlocked ? "Transaction Blocked — Fraud Detected"
                  : isHighRisk ? "High Risk Transaction Flagged"
                  : isMedRisk ? "Medium Risk — Transaction Processed"
                  : "Transaction Approved — AI Verified Safe"}
              </h2>
              <p className="text-xs text-slate-400 font-mono">{transaction_reference}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* ── Transaction Summary Row ──────────────── */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Amount</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">₹{Number(amount).toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Status</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${statusConfig.badge}`}>
                {transaction_status}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Balance After</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">₹{Number(available_balance).toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* ── Fraud Probability Gauge + Score Bars ─── */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row items-center gap-6">

            {/* Circular gauge */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fraud Probability</p>
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r={RADIUS}
                    fill="none"
                    stroke={statusConfig.gauge}
                    strokeWidth="10"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.2s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: statusConfig.gauge }}>
                    {fraud_probability.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{fraud_status}</span>
                </div>
              </div>
            </div>

            {/* Score breakdowns */}
            <div className="flex-1 space-y-3 w-full">
              <ScoreBar
                label="ML Model (XGBoost)"
                value={ml_probability}
                gauge={statusConfig.gauge}
                subtitle={model_used ? "Trained on fraud dataset" : "Rule-based fallback"}
                icon={<Cpu className="h-3.5 w-3.5 text-indigo-500" />}
              />
              <ScoreBar
                label="Rule-Based Engine"
                value={rule_score}
                gauge={statusConfig.gauge}
                subtitle="Deterministic fraud rules"
                icon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
              />
              <ScoreBar
                label="Combined Final Score"
                value={final_score}
                gauge={statusConfig.gauge}
                subtitle="Weighted hybrid (55% rule + 45% ML)"
                icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                isFinal
              />
            </div>
          </div>

          {/* ── Collapsible Sections ──────────────────── */}

          {/* Risk Summary */}
          {risk_summary && (
            <Section id="summary" icon={ShieldAlert} label="AI Risk Summary">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{risk_summary}</p>
            </Section>
          )}

          {/* Fraud Reasoning */}
          {fraud_reasoning && (
            <Section id="reasoning" icon={BookOpen} label="Detailed Fraud Reasoning">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{fraud_reasoning}</p>
            </Section>
          )}

          {/* Fraud Indicators */}
          {(fraud_indicators?.length > 0 || reasons?.length > 0) && (
            <Section id="indicators" icon={AlertTriangle} label="Fraud Indicators Detected">
              <ul className="space-y-2">
                {[...new Set([...reasons, ...fraud_indicators])].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusConfig.badge.split(" ")[0]}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Recommendation for Customer */}
          {recommendation_customer && (
            <Section id="customer_rec" icon={User} label="Recommendation For You">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{recommendation_customer}</p>
            </Section>
          )}

          {/* Recommendation for Bank */}
          {recommendation_bank && (
            <Section id="bank_rec" icon={Building2} label="Bank Action Recommendation">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{recommendation_bank}</p>
            </Section>
          )}

          {/* Confidence Adjustment */}
          {confidence_adjustment !== 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
              <CreditCard className="h-3.5 w-3.5" />
              <span>
                AI confidence adjustment applied:{" "}
                <strong className={confidence_adjustment > 0 ? "text-red-500" : "text-green-500"}>
                  {confidence_adjustment > 0 ? "+" : ""}{confidence_adjustment}
                </strong>
              </span>
            </div>
          )}

        </div>

        {/* ── Footer ────────────────────────────────── */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Powered by Aegis AI · Gemini 2.5 Flash + XGBoost</p>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg text-sm font-semibold ${statusConfig.badge} hover:opacity-90 transition`}
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};

// ── Sub-component: Score Bar ────────────────────
const ScoreBar = ({ label, value, gauge, subtitle, icon, isFinal }) => {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className={`text-xs font-semibold ${isFinal ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
            {label}
          </span>
        </div>
        <span className="text-xs font-bold" style={{ color: gauge }}>{pct.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: gauge }}
        />
      </div>
      <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
};

export default FraudDetailModal;
