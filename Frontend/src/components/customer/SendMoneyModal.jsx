import React, { useState } from "react";
import { X, Send, Loader2, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import FraudAlertOverlay from "./FraudAlertOverlay";
import FraudDetailModal from "./FraudDetailModal";

const SendMoneyModal = ({
  open,
  onClose,
  bankAccounts,
  sendMoney,
  loadData
}) => {

  const [form, setForm] = useState({
    senderAccountId: bankAccounts?.[0]?.id || "",
    receiverName: "",
    receiverAccountNumber: "",
    receiverBank: "",
    receiverIfsc: "",
    amount: "",
    remarks: ""
  });

  React.useEffect(() => {
    if (open && bankAccounts?.length > 0 && !form.senderAccountId) {
      setForm(f => ({ ...f, senderAccountId: bankAccounts[0].id }));
    }
  }, [open, bankAccounts]);

  const resetForm = () => setForm({
    senderAccountId: "",
    receiverName: "",
    receiverAccountNumber: "",
    receiverBank: "",
    receiverIfsc: "",
    amount: "",
    remarks: ""
  });

  const [loading, setLoading]               = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [detailOpen, setDetailOpen]         = useState(false);
  const [txResult, setTxResult]             = useState(null);
  const [isFraud, setIsFraud]               = useState(false);
  const [fraudStatus, setFraudStatus]       = useState("Low Risk");

  const field = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    if (!form.senderAccountId)         return "Please select a sender account.";
    if (!form.receiverName)            return "Please enter receiver name.";
    if (!form.receiverAccountNumber)   return "Please enter receiver account number.";
    if (!form.receiverBank)            return "Please enter receiver bank.";
    if (!form.receiverIfsc)            return "Please enter receiver IFSC code.";
    if (!form.amount || Number(form.amount) <= 0) return "Please enter a valid amount.";
    return null;
  };

  const handleTransfer = async () => {
    const err = validate();
    if (err) {
      return alert(err); // simple validation — Swal would do but keep it light here
    }

    setLoading(true);

    try {
      const response = await sendMoney({
        sender_account_id:       form.senderAccountId,
        receiver_name:           form.receiverName,
        receiver_account_number: form.receiverAccountNumber,
        receiver_bank:           form.receiverBank,
        receiver_ifsc:           form.receiverIfsc,
        amount:                  Number(form.amount),
        remarks:                 form.remarks,
        transaction_source:      "UPI",
      });

      // ── Determine fraud level from response ──────
      const fraudReport  = response?.data?.fraud_report || {};
      const status       = fraudReport.fraud_status || "Low Risk";
      const isHighRisk   = ["Blocked", "High Risk"].includes(status);
      const isMedRisk    = status === "Medium Risk";

      setTxResult(response?.data || {});
      setIsFraud(isHighRisk || isMedRisk);
      setFraudStatus(status);

      // Reset the form for next use
      resetForm();

      // Close the send form
      onClose();

      // Flash the full-screen overlay
      setOverlayVisible(true);

      // NOTE: loadData() is called in handleOverlayDone (after overlay fades)
      // so it does not race with the overlay animation or destroy state mid-render.

    } catch (err) {
      if (err.response?.status === 403 || err.response?.data?.error_code === "ACCOUNT_SECURITY_LOCKED") {
        const backendMsg = err.response?.data?.message || "This account has been locked.";
        Swal.fire({
          icon: 'error',
          title: '🔒 TRANSACTION BLOCKED',
          html: `<div class="text-left text-xs space-y-2 mt-2">
            <p class="font-bold text-rose-600">${backendMsg}</p>
            <p class="text-slate-500 font-bold mt-1">Incident ID: INC-2026-LOCKDOWN</p>
          </div>`,
          confirmButtonText: 'Understood',
          confirmButtonColor: '#ef4444'
        });
        return;
      }
      // Marshmallow validation errors are formatted into strings by the api.js interceptor.
      // Other service errors are returned as strings in response.data.message.
      const backendMsg = err.response?.data?.message;
      let rawMsg = backendMsg || err.message || "Transfer failed.";
      
      let displayMsg = rawMsg;
      try {
        const parsed = JSON.parse(rawMsg);
        if (parsed && typeof parsed === "object") {
          displayMsg = Object.entries(parsed)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
            .join("\n");
        }
      } catch (_) {
        // rawMsg is already a plain string, use as-is
      }
      alert(`Transfer Failed:\n${displayMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayDone = async () => {
    setOverlayVisible(false);
    setDetailOpen(true);
    // Refresh data AFTER the overlay animation — safe to re-render now
    if (loadData) {
      await loadData();
    }
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setTxResult(null);
  };

  if (!open && !overlayVisible && !detailOpen) return null;

  const inputCls = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-400";
  const labelCls = "block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300";

  return (
    <>
      {/* ── Send Money Modal ──────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                  <Send className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Send Money</h2>
                  <p className="text-xs text-slate-400">AI fraud detection active on all transfers</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">

              {/* AI shield indicator */}
              <div className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  <strong>Aegis AI Fraud Detection</strong> will analyze this transaction using XGBoost ML + Gemini AI before processing.
                </p>
              </div>

              {/* Sender Account */}
              <div>
                <label className={labelCls}>Sender Account</label>
                <select
                  value={form.senderAccountId}
                  onChange={(e) => field("senderAccountId", e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Select Account —</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bank_name} •••• {acc.account_number?.slice(-4)} | ₹{Number(acc.current_balance).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className={labelCls}>Receiver Name</label>
                  <input type="text" value={form.receiverName} onChange={e => field("receiverName", e.target.value)} className={inputCls} placeholder="Full name" />
                </div>

                <div>
                  <label className={labelCls}>Receiver Account Number</label>
                  <input type="text" value={form.receiverAccountNumber} onChange={e => field("receiverAccountNumber", e.target.value)} className={inputCls} placeholder="Account number" />
                </div>

                <div>
                  <label className={labelCls}>Receiver Bank</label>
                  <input type="text" value={form.receiverBank} onChange={e => field("receiverBank", e.target.value)} className={inputCls} placeholder="Bank name" />
                </div>

                <div>
                  <label className={labelCls}>IFSC Code</label>
                  <input type="text" value={form.receiverIfsc} onChange={e => field("receiverIfsc", e.target.value)} className={inputCls} placeholder="IFSC code" />
                </div>

                <div>
                  <label className={labelCls}>Amount (₹)</label>
                  <input type="number" min="1" value={form.amount} onChange={e => field("amount", e.target.value)} className={inputCls} placeholder="0.00" />
                </div>

                <div>
                  <label className={labelCls}>Remarks (optional)</label>
                  <input type="text" value={form.remarks} onChange={e => field("remarks", e.target.value)} className={inputCls} placeholder="Payment note" />
                </div>

              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing transaction…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Transfer Money
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Fraud Alert Overlay ───────────────────── */}
      <FraudAlertOverlay
        visible={overlayVisible}
        isFraud={isFraud}
        fraudStatus={fraudStatus}
        onDone={handleOverlayDone}
      />

      {/* ── Fraud Detail Modal ────────────────────── */}
      <FraudDetailModal
        open={detailOpen}
        onClose={handleDetailClose}
        transactionData={txResult}
      />
    </>
  );
};

export default SendMoneyModal;