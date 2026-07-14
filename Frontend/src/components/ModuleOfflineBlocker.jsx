import React from 'react';
import { ShieldAlert, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ModuleOfflineBlocker({ moduleName, retry, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[450px] w-full flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm dark:border-rose-950/20 dark:bg-slate-900/60 backdrop-blur-xs"
      id={`offline-blocker-${moduleName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-md">
        <ShieldAlert className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
        {moduleName} Offline
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        The Aegis Core API connection is temporarily unavailable. Local data simulation is disabled to preserve ledger consistency and audit safety.
      </p>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-rose-50/50 border border-rose-100/80 px-3 py-1.5 text-[11px] font-mono text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-300 select-all">
        GET /api/... → Connection Refused (502)
      </div>

      <button
        onClick={retry}
        disabled={loading}
        className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-55 active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Reconnecting to Aegis API...
          </>
        ) : (
          <>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Connection
          </>
        )}
      </button>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
        Security Gateway Active
      </div>
    </motion.div>
  );
}
