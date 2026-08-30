import React, { useEffect, useState } from "react";
import { Shield, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * FraudAlertOverlay
 *
 * Full-screen gradient flash that appears for ~2.5 seconds after a transaction.
 * - fraud detected  → deep red/crimson gradient + animated pulse
 * - safe transaction → deep green gradient + checkmark
 *
 * Props:
 *   visible     {boolean}   - whether to show the overlay
 *   isFraud     {boolean}   - true = fraud/high-risk, false = safe
 *   fraudStatus {string}    - "Low Risk" | "Medium Risk" | "High Risk" | "Blocked"
 *   onDone      {function}  - callback when animation is complete
 */
const FraudAlertOverlay = ({ visible, isFraud, fraudStatus, onDone }) => {
  const [phase, setPhase] = useState("idle"); // idle | enter | show | exit

  useEffect(() => {
    if (!visible) {
      setPhase("idle");
      return;
    }

    setPhase("enter");

    const t1 = setTimeout(() => setPhase("show"), 50);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(() => {
      setPhase("idle");
      if (onDone) onDone();
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible]);

  if (phase === "idle") return null;

  const isBlocked  = fraudStatus === "Blocked";
  const isHighRisk = fraudStatus === "High Risk";
  const isMedRisk  = fraudStatus === "Medium Risk";

  // Gradient configs
  const gradientConfig = isFraud
    ? isBlocked
      ? "from-red-950 via-red-800 to-black"
      : isHighRisk
      ? "from-red-900 via-rose-700 to-red-950"
      : "from-orange-800 via-amber-700 to-orange-900"
    : "from-emerald-900 via-green-700 to-teal-900";

  const opacity =
    phase === "enter"
      ? "opacity-0 scale-105"
      : phase === "exit"
      ? "opacity-0 scale-95"
      : "opacity-100 scale-100";

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        bg-gradient-to-br ${gradientConfig}
        transition-all duration-500 ease-in-out
        ${opacity}
      `}
    >
      {/* Radial glow behind icon */}
      <div
        className={`
          absolute inset-0
          ${isFraud
            ? "bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.35)_0%,transparent_70%)]"
            : "bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.35)_0%,transparent_70%)]"
          }
        `}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">

        {/* Pulsing icon ring */}
        <div className="relative">
          <div
            className={`
              absolute inset-0 rounded-full animate-ping opacity-40
              ${isFraud ? "bg-red-500" : "bg-emerald-400"}
            `}
          />
          <div
            className={`
              relative flex h-28 w-28 items-center justify-center rounded-full
              border-4 shadow-2xl
              ${isFraud
                ? "bg-red-600/30 border-red-400"
                : "bg-emerald-600/30 border-emerald-400"
              }
            `}
          >
            {isFraud ? (
              isBlocked
                ? <Shield className="h-14 w-14 text-red-300" strokeWidth={1.5} />
                : <AlertTriangle className="h-14 w-14 text-orange-300" strokeWidth={1.5} />
            ) : (
              <CheckCircle2 className="h-14 w-14 text-emerald-300" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* Status text */}
        <div>
          <h1 className={`text-4xl font-black tracking-tight drop-shadow-lg ${isFraud ? "text-red-100" : "text-emerald-100"}`}>
            {isBlocked
              ? "Transaction Blocked"
              : isHighRisk
              ? "High Risk Detected"
              : isMedRisk
              ? "Caution: Medium Risk"
              : "Transaction Approved"}
          </h1>
          <p className={`mt-2 text-lg font-medium opacity-80 ${isFraud ? "text-red-200" : "text-emerald-200"}`}>
            {isBlocked
              ? "Fraud detected — your balance has been restored."
              : isHighRisk
              ? "Fraud detection flagged this transaction. Bank will review."
              : isMedRisk
              ? "Transaction processed with elevated monitoring."
              : "AI fraud check passed. Transaction is safe."}
          </p>
        </div>

        {/* Scan bar animation */}
        <div className="w-64 h-1 rounded-full overflow-hidden bg-white/10">
          <div
            className={`
              h-full rounded-full animate-[scan_1.8s_ease-in-out_forwards]
              ${isFraud ? "bg-red-400" : "bg-emerald-400"}
            `}
            style={{ width: "100%" }}
          />
        </div>

        <p className="text-sm text-white/40 font-mono">
          Aegis AI Fraud Detection • {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)"
        }}
      />
    </div>
  );
};

export default FraudAlertOverlay;
