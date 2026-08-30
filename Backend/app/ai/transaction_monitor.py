from datetime import datetime, timedelta
from decimal import Decimal

from app.extensions import db
from app.models.transaction import (
    Transaction,
    TransactionStatus,
    TransactionType
)


class TransactionMonitor:
    """
    Transaction Monitoring Agent

    Responsibilities:
    - Analyze the incoming transaction in context of customer history
    - Build a rich monitoring context dict for the Fraud Detection Agent
    - Assign an initial risk score based on rule triggers
    """

    MERCHANT_KEYWORDS = {
        "Groceries":    ["grocery", "supermarket", "mart", "vegetables", "fresh"],
        "Electronics":  ["electronics", "mobile", "laptop", "gadget", "tech"],
        "Fuel":         ["petrol", "diesel", "fuel", "gas station", "hp", "bpcl", "iocl"],
        "Food":         ["restaurant", "hotel", "food", "swiggy", "zomato", "cafe", "bistro"],
        "Clothing":     ["fashion", "clothing", "garments", "wear", "store", "boutique"],
        "Healthcare":   ["hospital", "clinic", "pharmacy", "medical", "health", "labs"],
        "Education":    ["school", "college", "university", "institute", "tuition"],
        "Travel":       ["airline", "flight", "hotel", "travel", "booking", "irctc"],
        "Entertainment":["cinema", "ott", "netflix", "amazon", "hotstar", "spotify"],
        "Finance":      ["bank", "insurance", "mutual fund", "investment", "sip", "lic"],
        "Utilities":    ["electricity", "water", "gas", "broadband", "internet", "wifi"],
        "Rent":         ["rent", "landlord", "housing", "pg", "hostel"],
        "Online":       ["amazon", "flipkart", "myntra", "meesho", "ajio", "nykaa"],
    }

    @staticmethod
    def infer_merchant_category(receiver_name: str) -> str:
        """Infer merchant category from receiver name using keyword matching."""
        name_lower = receiver_name.lower() if receiver_name else ""
        for category, keywords in TransactionMonitor.MERCHANT_KEYWORDS.items():
            if any(kw in name_lower for kw in keywords):
                return category
        return "Others"

    @staticmethod
    def _load_history(account):
        """Load last 90 days of transactions for the sender account."""
        cutoff = datetime.utcnow() - timedelta(days=90)
        return (
            Transaction.query
            .filter(
                Transaction.sender_account_id == account.id,
                Transaction.created_at >= cutoff
            )
            .order_by(Transaction.created_at.desc())
            .all()
        )

    @staticmethod
    def _monthly_income(history):
        """Sum of CREDIT transactions in the last 30 days."""
        cutoff = datetime.utcnow() - timedelta(days=30)
        return float(sum(
            Decimal(str(tx.amount))
            for tx in history
            if tx.transaction_type == TransactionType.CREDIT
            and tx.created_at >= cutoff
        ) or 0)

    @staticmethod
    def _average_transaction_amount(history):
        """Average DEBIT transaction amount over last 90 days."""
        debits = [
            float(tx.amount)
            for tx in history
            if tx.transaction_type == TransactionType.DEBIT
        ]
        return sum(debits) / len(debits) if debits else 0.0

    @staticmethod
    def _transaction_frequency(history):
        """Count of transactions in the last 30 days."""
        cutoff = datetime.utcnow() - timedelta(days=30)
        return sum(1 for tx in history if tx.created_at >= cutoff)

    @staticmethod
    def _failed_transactions(history):
        """Count of FAILED transactions in the last 30 days."""
        cutoff = datetime.utcnow() - timedelta(days=30)
        return sum(
            1 for tx in history
            if tx.transaction_status == TransactionStatus.FAILED
            and tx.created_at >= cutoff
        )

    @staticmethod
    def _credit_utilization(monthly_income, account):
        """Rough credit utilization ratio."""
        if monthly_income <= 0:
            return 0.0
        return round(float(account.current_balance) / monthly_income, 4)

    @staticmethod
    def _outstanding_debt(history):
        """Approximate outstanding debt = total debits - total credits over 90 days."""
        debits = sum(float(tx.amount) for tx in history if tx.transaction_type == TransactionType.DEBIT)
        credits = sum(float(tx.amount) for tx in history if tx.transaction_type == TransactionType.CREDIT)
        return max(0.0, debits - credits)

    @staticmethod
    def analyze(transaction, account) -> dict:
        """
        Analyze the transaction and return a rich monitoring context dict.
        This feeds directly into the FraudDetector.
        """

        history = TransactionMonitor._load_history(account)

        # ─── Computed Features ────────────────────────────────────────
        monthly_income          = TransactionMonitor._monthly_income(history)
        avg_tx_amount           = TransactionMonitor._average_transaction_amount(history)
        tx_frequency            = TransactionMonitor._transaction_frequency(history)
        failed_txns             = TransactionMonitor._failed_transactions(history)
        credit_utilization      = TransactionMonitor._credit_utilization(monthly_income, account)
        outstanding_debt        = TransactionMonitor._outstanding_debt(history)
        merchant_category       = TransactionMonitor.infer_merchant_category(transaction.receiver_name)

        # ─── Location and Device (from account profile) ───────────────
        location    = getattr(account.user, "address", "Unknown") if account.user else "Unknown"
        device_type = "Mobile"  # Default; can be enhanced with request headers later

        # ─── Initial Rule-Based Risk Score ────────────────────────────
        risk_score = 0
        reasons    = []

        amt = Decimal(str(transaction.amount))
        bal_before = Decimal(str(transaction.available_balance_before))
        bal_after = Decimal(str(transaction.available_balance_after))

        # Rule 1: High amount
        if amt > Decimal("50000"):
            risk_score += 25
            reasons.append("Transaction amount exceeds ₹50,000.")

        # Rule 2: Low remaining balance
        if bal_after < Decimal("1000"):
            risk_score += 20
            reasons.append("Remaining balance drops below ₹1,000 after transaction.")

        # Rule 3: Large % of balance used
        if bal_before > 0:
            pct = amt / bal_before
            if pct >= Decimal("0.80"):
                risk_score += 35
                reasons.append(f"Transaction uses {float(pct)*100:.1f}% of available balance.")

        # Rule 4: Unusual amount compared to average
        if avg_tx_amount > 0 and float(transaction.amount) >= avg_tx_amount * 2.5:
            risk_score += 15
            reasons.append("Amount is 2.5x higher than customer's 90-day average.")

        # Rule 5: High transaction frequency
        if tx_frequency >= 10:
            risk_score += 10
            reasons.append(f"High transaction frequency: {tx_frequency} transactions in 30 days.")

        # Rule 6: Multiple failed transactions recently
        if failed_txns >= 2:
            risk_score += 15
            reasons.append(f"{failed_txns} failed transactions detected in the last 30 days.")

        # ─── Risk Classification ─────────────────────────────────────
        if risk_score >= 60:
            status = "High Risk"
        elif risk_score >= 30:
            status = "Medium Risk"
        else:
            status = "Low Risk"

        return {
            # Core risk output
            "risk_score":                risk_score,
            "status":                    status,
            "reasons":                   reasons,

            # Rich features for ML model
            "monthly_income":            monthly_income,
            "average_transaction_amount": avg_tx_amount,
            "transaction_frequency":     tx_frequency,
            "failed_transactions":       failed_txns,
            "credit_utilization":        credit_utilization,
            "outstanding_debt":          outstanding_debt,
            "merchant_category":         merchant_category,
            "location":                  location,
            "device_type":               device_type,
        }