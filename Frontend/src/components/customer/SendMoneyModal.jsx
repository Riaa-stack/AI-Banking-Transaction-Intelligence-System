import React, { useState } from "react";
import Swal from "sweetalert2";
import { X, Send } from "lucide-react";

const SendMoneyModal = ({
  open,
  onClose,
  bankAccounts,
  sendMoney,
  loadData
}) => {

  const [form, setForm] = useState({
    senderAccountId: "",
    receiverName: "",
    receiverAccountNumber: "",
    receiverBank: "",
    receiverIfsc: "",
    amount: "",
    remarks: ""
  });

  const [loading, setLoading] = useState(false);
  const handleTransfer = async () => {

  if (!form.senderAccountId) {
    return Swal.fire(
      "Missing Sender Account",
      "Please select a sender account.",
      "warning"
    );
  }

  if (!form.receiverName) {
    return Swal.fire(
      "Missing Receiver Name",
      "Please enter receiver name.",
      "warning"
    );
  }

  if (!form.receiverAccountNumber) {
    return Swal.fire(
      "Missing Account Number",
      "Please enter receiver account number.",
      "warning"
    );
  }

  if (!form.receiverBank) {
    return Swal.fire(
      "Missing Bank",
      "Please enter receiver bank.",
      "warning"
    );
  }

  if (!form.receiverIfsc) {
    return Swal.fire(
      "Missing IFSC",
      "Please enter receiver IFSC.",
      "warning"
    );
  }

  if (!form.amount || Number(form.amount) <= 0) {
    return Swal.fire(
      "Invalid Amount",
      "Enter a valid amount.",
      "warning"
    );
  }

  try {

    setLoading(true);
    console.log("=========== SEND MONEY PAYLOAD ===========");

    console.log({

        sender_account_id: form.senderAccountId,

        receiver_name: form.receiverName,

        receiver_account_number: form.receiverAccountNumber,

        receiver_bank: form.receiverBank,

        receiver_ifsc: form.receiverIfsc,

        amount: Number(form.amount),

        remarks: form.remarks,

        transaction_source: "UPI"

    });

console.log("==========================================");

    const response = await sendMoney({

      sender_account_id: form.senderAccountId,

      receiver_name: form.receiverName,

      receiver_account_number: form.receiverAccountNumber,

      receiver_bank: form.receiverBank,

      receiver_ifsc: form.receiverIfsc,

      amount: Number(form.amount),

      remarks: form.remarks,

      transaction_source: "UPI"

    });

    Swal.fire({

      icon: "success",

      title: "Money Sent Successfully",

      html: `
        <b>Status:</b> ${response.data.transaction_status}<br/>
        <b>Risk Score:</b> ${response.data.risk_score}<br/>
        <b>Fraud Probability:</b> ${response.data.fraud_probability}<br/>
        <b>Fraud Status:</b> ${response.data.fraud_status}<br/><br/>
        ${response.data.ai_explanation}
      `

    });

    if (loadData) {
      await loadData();
    }

    onClose();

  } catch (err) {

    Swal.fire(
      "Transfer Failed",
      err.message,
      "error"
    );

  } finally {

    setLoading(false);

  }

};
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-xl">

        <div className="flex items-center justify-between border-b p-5">

          <div className="flex items-center gap-2">

            <Send className="text-indigo-600" />

            <h2 className="text-xl font-bold">
              Send Money
            </h2>

          </div>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  {/* Sender Account */}

  <div className="md:col-span-2">

    <label className="block text-sm font-semibold mb-2">
      Sender Account
    </label>

    <select
      value={form.senderAccountId}
      onChange={(e) =>
        setForm({
          ...form,
          senderAccountId: e.target.value
        })
      }
      className="w-full rounded-lg border p-3"
    >

      <option value="">
        Select Account
      </option>

      {bankAccounts.map((account) => (

        <option
          key={account.id}
          value={account.id}
        >
          {account.bank_name} ••••
          {account.account_number.slice(-4)}
        </option>

      ))}

    </select>

  </div>

  {/* Receiver Name */}

  <div>

    <label className="block text-sm font-semibold mb-2">
      Receiver Name
    </label>

    <input
      type="text"
      value={form.receiverName}
      onChange={(e) =>
        setForm({
          ...form,
          receiverName: e.target.value
        })
      }
      className="w-full rounded-lg border p-3"
    />

  </div>

  {/* Receiver Account */}

  <div>

    <label className="block text-sm font-semibold mb-2">
      Receiver Account Number
    </label>

    <input
      type="text"
      value={form.receiverAccountNumber}
      onChange={(e) =>
        setForm({
          ...form,
          receiverAccountNumber: e.target.value
        })
      }
      className="w-full rounded-lg border p-3"
    />

  </div>

  {/* Receiver Bank */}

  <div>

    <label className="block text-sm font-semibold mb-2">
      Receiver Bank
    </label>

    <input
      type="text"
      value={form.receiverBank}
      onChange={(e) =>
        setForm({
          ...form,
          receiverBank: e.target.value
        })
      }
      className="w-full rounded-lg border p-3"
    />

  </div>

  {/* IFSC */}

  <div>

    <label className="block text-sm font-semibold mb-2">
      Receiver IFSC
    </label>

    <input
      type="text"
      value={form.receiverIfsc}
      onChange={(e) =>
        setForm({
          ...form,
          receiverIfsc: e.target.value
        })
      }
      className="w-full rounded-lg border p-3"
    />

  </div>

  {/* Amount */}

  <div>

    <label className="block text-sm font-semibold mb-2">
      Amount
    </label>

    <input
      type="number"
      value={form.amount}
      onChange={(e) =>
        setForm({
          ...form,
          amount: e.target.value
        })
      }
      className="w-full rounded-lg border p-3"
    />

  </div>

  {/* Remarks */}

  <div>

    <label className="block text-sm font-semibold mb-2">
      Remarks
    </label>

    <input
      type="text"
      value={form.remarks}
      onChange={(e) =>
        setForm({
          ...form,
          remarks: e.target.value
        })
      }
      className="w-full rounded-lg border p-3"
    />

  </div>

</div>

<div className="flex justify-end gap-3 mt-6">

  <button
    onClick={onClose}
    className="px-5 py-2 rounded-lg border"
  >
    Cancel
  </button>
<button
  onClick={handleTransfer}
  disabled={loading}
  className="px-6 py-2 rounded-lg bg-indigo-600 text-white"
>
  {loading ? "Sending..." : "Transfer Money"}
</button>

</div>

        </div>

      </div>

    </div>
  );

};

export default SendMoneyModal;