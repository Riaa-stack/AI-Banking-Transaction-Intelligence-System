from datetime import datetime, timedelta
from decimal import Decimal

from app.extensions import db
from app.models.transaction import (
    Transaction,
    TransactionStatus,
    TransactionType
)


class MLFeatureBuilder:

    @staticmethod
    def build_features(transaction, account, monitoring=None, history=None):

        monitoring = monitoring or {}

        history = list(
            history if history is not None else MLFeatureBuilder._load_history(
                transaction,
                account
            )
        )

        monthly_income = MLFeatureBuilder._coerce_decimal(
            monitoring.get("monthly_income")
        )

        if monthly_income is None:
            monthly_income = MLFeatureBuilder._calculate_monthly_income(
                history,
                transaction
            )

        average_transaction_amount = MLFeatureBuilder._coerce_decimal(
            monitoring.get("average_transaction_amount")
        )

        if average_transaction_amount is None:
            average_transaction_amount = (
                MLFeatureBuilder._calculate_average_amount(history)
            )

        transaction_frequency = monitoring.get("transaction_frequency")

        if transaction_frequency is None:
            transaction_frequency = (
                MLFeatureBuilder._calculate_transaction_frequency(
                    history,
                    transaction
                )
            )

        failed_transactions = monitoring.get("failed_transactions")

        if failed_transactions is None:
            failed_transactions = (
                MLFeatureBuilder._calculate_failed_transactions(history)
            )

        credit_utilization = MLFeatureBuilder._coerce_decimal(
            monitoring.get("credit_utilization")
        )

        if credit_utilization is None:
            credit_utilization = (
                MLFeatureBuilder._calculate_credit_utilization(
                    monthly_income,
                    account,
                    transaction
                )
            )

        outstanding_debt = MLFeatureBuilder._coerce_decimal(
            monitoring.get("outstanding_debt")
        )

        if outstanding_debt is None:
            outstanding_debt = MLFeatureBuilder._calculate_outstanding_debt(
                history
            )

        return {
            "Transaction_Date": transaction.created_at.strftime("%Y-%m-%d"),
            "Transaction_Time": transaction.created_at.strftime("%H:%M:%S"),
            "Transaction_Amount": float(transaction.amount),
            "Transaction_Type": MLFeatureBuilder._normalize_value(
                getattr(transaction, "transaction_type", None)
            ),
            "Payment_Method": MLFeatureBuilder._normalize_value(
                getattr(transaction, "payment_method", None)
            ),
            "Merchant_Category": MLFeatureBuilder._normalize_value(
                getattr(transaction, "merchant_category", None)
            ),
            "Merchant_Name": MLFeatureBuilder._normalize_value(
                getattr(transaction, "merchant_name", None)
            ),
            "Location": MLFeatureBuilder._normalize_value(
                getattr(transaction, "location", None)
            ),
            "Device_Type": MLFeatureBuilder._normalize_value(
                getattr(transaction, "device_type", None)
            ),
            "Current_Balance": float(
                transaction.available_balance_before
            ),
            "Monthly_Income": float(monthly_income),
            "Average_Transaction_Amount": float(average_transaction_amount),
            "Transaction_Frequency": float(transaction_frequency),
            "Failed_Transactions": int(failed_transactions),
            "Credit_Utilization": float(credit_utilization),
            "Outstanding_Debt": float(outstanding_debt)
        }

    @staticmethod
    def _load_history(transaction, account):

        query = Transaction.query

        if account is not None and getattr(account, "id", None):
            query = query.filter(
                Transaction.sender_account_id == account.id
            )

        if transaction is not None and getattr(transaction, "id", None):
            query = query.filter(Transaction.id != transaction.id)

        if transaction is not None and getattr(transaction, "created_at", None):
            start_date = transaction.created_at - timedelta(days=90)
            query = query.filter(Transaction.created_at >= start_date)

        return query.order_by(Transaction.created_at.desc()).all()

    @staticmethod
    def _calculate_monthly_income(history, transaction=None):

        if not history:
            return Decimal("0")

        reference_time = (
            transaction.created_at if transaction is not None and getattr(transaction, "created_at", None) else None
        )

        if reference_time is None:
            reference_time = max((tx.created_at for tx in history if tx.created_at), default=None)

        if reference_time is None:
            return Decimal("0")

        recent_history = [
            tx for tx in history
            if tx.created_at and tx.created_at >= reference_time - timedelta(days=30)
        ]

        credits = [
            Decimal(str(tx.amount)) for tx in recent_history
            if getattr(tx, "transaction_type", None) == TransactionType.CREDIT
        ]

        if not credits:
            return Decimal("0")

        total_credit = sum(credits, Decimal("0"))

        return total_credit

    @staticmethod
    def _calculate_average_amount(history):

        if not history:
            return Decimal("0")

        amounts = [
            Decimal(str(tx.amount)) for tx in history
            if getattr(tx, "amount", None) is not None
        ]

        if not amounts:
            return Decimal("0")

        return sum(amounts, Decimal("0")) / Decimal(len(amounts))

    @staticmethod
    def _calculate_transaction_frequency(history, transaction=None):

        if not history:
            return 0

        reference_time = (
            transaction.created_at if transaction is not None and getattr(transaction, "created_at", None) else None
        )

        if reference_time is None:
            reference_time = max((tx.created_at for tx in history if tx.created_at), default=None)

        if reference_time is None:
            return 0

        recent_history = [
            tx for tx in history
            if tx.created_at and tx.created_at >= reference_time - timedelta(days=30)
        ]

        return float(len(recent_history))

    @staticmethod
    def _calculate_failed_transactions(history):

        return sum(
            1 for tx in history
            if getattr(tx, "transaction_status", None) == TransactionStatus.FAILED
        )

    @staticmethod
    def _calculate_credit_utilization(monthly_income, account, transaction):

        if monthly_income <= 0:
            return Decimal("0")

        balance = Decimal("0")

        if account is not None and getattr(account, "current_balance", None) is not None:
            balance = Decimal(str(account.current_balance))

        elif transaction is not None and getattr(transaction, "available_balance_before", None) is not None:
            balance = Decimal(str(transaction.available_balance_before))

        return balance / monthly_income

    @staticmethod
    def _calculate_outstanding_debt(history):

        if not history:
            return Decimal("0")

        debit_total = sum(
            (Decimal(str(tx.amount)) for tx in history if getattr(tx, "transaction_type", None) == TransactionType.DEBIT),
            Decimal("0")
        )

        credit_total = sum(
            (Decimal(str(tx.amount)) for tx in history if getattr(tx, "transaction_type", None) == TransactionType.CREDIT),
            Decimal("0")
        )

        return max(Decimal("0"), debit_total - credit_total)

    @staticmethod
    def _normalize_value(value):

        if value is None:
            return "Unknown"

        if hasattr(value, "value"):
            return value.value

        return str(value)

    @staticmethod
    def _coerce_decimal(value):

        if value is None:
            return None

        if isinstance(value, Decimal):
            return value

        try:
            return Decimal(str(value))
        except Exception:
            return None
