import React from "react";
import {
  FileText,
  Calendar,
  CheckCircle,
  Brain,
  BarChart3
} from "lucide-react";
import { useBanking } from "../../context/BankingContext";

const StatementHistory = () => {

  const { statements } = useBanking();

  if (!statements || statements.length === 0) {

    return (

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center">

        <FileText
          size={60}
          className="mx-auto text-slate-300 mb-4"
        />

        <h3 className="text-lg font-bold">
          No Statements Uploaded
        </h3>

        <p className="text-slate-500 mt-2">
          Upload your first bank statement to view OCR analysis.
        </p>

      </div>

    );

  }

  return (

    <div className="space-y-5">

      <h2 className="text-xl font-bold">
        Uploaded Statements
      </h2>

      {statements.map((statement) => (

        <div
          key={statement.id}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
        >

          <div className="flex justify-between items-start">

            <div>

              <h3 className="text-lg font-bold flex items-center gap-2">

                <FileText className="text-indigo-600"/>

                {statement.original_file_name}

              </h3>

              <p className="text-sm text-slate-500 mt-1">

                {statement.statement_month} {statement.statement_year}

              </p>

            </div>

            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">

              {statement.processing_status}

            </span>

          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-6">

            <div>

              <div className="flex items-center gap-2 mb-2">

                <CheckCircle
                  className="text-green-600"
                  size={18}
                />

                <span className="font-semibold">

                  OCR Status

                </span>

              </div>

              <p>{statement.ocr_status}</p>

            </div>

            <div>

              <div className="flex items-center gap-2 mb-2">

                <BarChart3
                  className="text-blue-600"
                  size={18}
                />

                <span className="font-semibold">

                  Transactions

                </span>

              </div>

              <p>

                {statement.total_transactions}

              </p>

            </div>

            <div>

              <div className="flex items-center gap-2 mb-2">

                <Calendar
                  className="text-orange-600"
                  size={18}
                />

                <span className="font-semibold">

                  Uploaded

                </span>

              </div>

              <p>

                {new Date(statement.created_at).toLocaleDateString()}

              </p>

            </div>

          </div>

          <div className="mt-6 rounded-xl bg-indigo-50 dark:bg-slate-800 p-4">

            <div className="flex items-center gap-2 mb-2">

              <Brain
                className="text-indigo-600"
                size={18}
              />

              <span className="font-bold">

                AI Summary

              </span>

            </div>

            <p className="text-sm leading-6">

              {statement.ai_summary}

            </p>

          </div>

        </div>

      ))}

    </div>

  );

};

export default StatementHistory;