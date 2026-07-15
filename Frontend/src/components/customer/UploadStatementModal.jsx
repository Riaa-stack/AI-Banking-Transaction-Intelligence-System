import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  UploadCloud,
  FileText,
  X
} from "lucide-react";

const UploadStatementModal = ({
  open,
  onClose,
  bankAccounts,
  uploadStatement,
  loadData
}) => {

  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedAccount, setSelectedAccount] = useState("");

  const [statementMonth, setStatementMonth] = useState("");

  const [statementYear, setStatementYear] = useState(
    new Date().getFullYear()
  );

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [uploading, setUploading] = useState(false);


  const handleUpload = async () => {

  if (!selectedAccount) {
    Swal.fire(
      "Missing Account",
      "Please select a bank account.",
      "warning"
    );
    return;
  }

  if (!statementMonth) {
    Swal.fire(
      "Missing Month",
      "Please select the statement month.",
      "warning"
    );
    return;
  }

  if (!selectedFile) {
    Swal.fire(
      "Missing File",
      "Please choose a bank statement PDF.",
      "warning"
    );
    return;
  }

  if (!startDate || !endDate) {

    Swal.fire(
        "Missing Dates",
        "Please select the statement start and end dates.",
        "warning"
    );

    return;

    }

  try {

    setUploading(true);

    const formData = new FormData();

    formData.append("statement", selectedFile);

    formData.append("account_id", selectedAccount);

    formData.append("statement_month", statementMonth);

    formData.append("statement_year", statementYear);

    formData.append("statement_start_date", startDate);

    formData.append("statement_end_date", endDate);

    await uploadStatement(formData);

    Swal.fire(
      "Success",
      "Statement uploaded successfully.",
      "success"
    );

    setSelectedFile(null);
    setSelectedAccount("");
    setStatementMonth("");
    setStatementYear(new Date().getFullYear());
    setStartDate("");
    setEndDate("");

    if (loadData) {
      await loadData();
    }

    onClose();

  } catch (err) {

    Swal.fire(
      "Upload Failed",
      err?.message || "Unable to upload statement.",
      "error"
    );

  } finally {

    setUploading(false);

  }

};
  if (!open) return null;

return (

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl p-6">

    {/* Header */}

    <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

            <UploadCloud
                className="text-blue-600"
                size={28}
            />

            <div>

                <h2 className="text-2xl font-bold">
                    Upload Bank Statement
                </h2>

                <p className="text-slate-500 text-sm">
                    Upload a PDF statement for AI analysis.
                </p>

            </div>

        </div>

        <button
            onClick={onClose}
        >
            <X size={24}/>
        </button>

    </div>

    {/* Select Account */}

    <div className="mb-4">

        <label className="font-semibold">
            Bank Account
        </label>

        <select
            className="w-full mt-2 border rounded-lg p-3"
            value={selectedAccount}
            onChange={(e)=>setSelectedAccount(e.target.value)}
        >

            <option value="">
                Select Account
            </option>

            {bankAccounts?.map((account) => (

                <option
                    key={account.id}
                    value={account.id}
                >

                    {account.bank_name}
                    {" •••• "}
                    {account.account_number?.slice(-4)}

                </option>

            ))}

        </select>

    </div>

    {/* Month */}

    <div className="mb-4">

        <label className="font-semibold">
            Statement Month
        </label>

        <select
            className="w-full mt-2 border rounded-lg p-3"
            value={statementMonth}
            onChange={(e)=>setStatementMonth(e.target.value)}
        >

            <option value="">Select Month</option>

            {[
                "January","February","March","April",
                "May","June","July","August",
                "September","October","November","December"
            ].map(month=>

                <option
                    key={month}
                    value={month}
                >
                    {month}
                </option>

            )}

        </select>

    </div>

    {/* Year */}

    <div className="mb-4">

        <label className="font-semibold">
            Statement Year
        </label>

        <input

            type="number"

            className="w-full mt-2 border rounded-lg p-3"

            value={statementYear}

            onChange={(e)=>setStatementYear(e.target.value)}

        />

    </div>

    {/* Dates */}

    <div className="grid grid-cols-2 gap-4 mb-4">

        <div>

            <label className="font-semibold">
                Start Date
            </label>

            <input

                type="date"

                className="w-full mt-2 border rounded-lg p-3"

                value={startDate}

                onChange={(e)=>setStartDate(e.target.value)}

            />

        </div>

        <div>

            <label className="font-semibold">
                End Date
            </label>

            <input

                type="date"

                className="w-full mt-2 border rounded-lg p-3"

                value={endDate}

                onChange={(e)=>setEndDate(e.target.value)}

            />

        </div>

    </div>

    {/* File */}

    <div className="mb-6">

        <label className="font-semibold">
            Statement PDF
        </label>

        <input

            type="file"

            accept=".pdf"

            className="w-full mt-2"

            onChange={(e)=>setSelectedFile(e.target.files[0])}

        />

        {selectedFile && (

            <div className="mt-3 flex items-center gap-2">

                <FileText
                    className="text-red-500"
                />

                <span>

                    {selectedFile.name}

                </span>

            </div>

        )}

    </div>

    {/* Footer */}

    <div className="flex justify-end gap-3">

        <button

            onClick={onClose}

            className="px-5 py-2 rounded-lg border"

        >

            Cancel

        </button>

        <button

            onClick={handleUpload}

            disabled={uploading}

            className="px-6 py-2 rounded-lg bg-blue-600 text-white"

        >

            {uploading
                ? "Uploading..."
                : "Upload Statement"}

        </button>

    </div>

</div>

</div>

);

};

export default UploadStatementModal;
