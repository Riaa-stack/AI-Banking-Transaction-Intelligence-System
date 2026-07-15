import React from "react";
import { useBanking } from "../../context/BankingContext";
import { ArrowUpRight } from "lucide-react";

const TransactionHistory = () => {

    const { transactions } = useBanking();

    return (
        <div className="mt-8">

            <h2 className="text-xl font-bold mb-4">
                Transaction History
            </h2>

            <div className="space-y-4">

                {transactions.length === 0 ? (

                    <div className="rounded-xl border p-6 text-center text-slate-500">
                        No transactions found.
                    </div>

                ) : (

                    transactions.map((tx) => (

                        <div
                            key={tx.id}
                            className="rounded-xl border bg-white dark:bg-slate-900 p-4 flex justify-between items-center shadow-sm"
                        >

                            <div>

                                <p className="font-semibold">

                                    ↑ Sent to {tx.receiver_name}

                                </p>

                                <p className="text-sm text-slate-500">

                                    {tx.receiver_bank}

                                </p>

                            </div>

                            <div className="text-right">

                                <p className="font-bold text-red-600">

                                    ₹{tx.amount}

                                </p>

                                <p className="text-xs text-green-600">

                                    {tx.transaction_status}

                                </p>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>
    );
};

export default TransactionHistory;