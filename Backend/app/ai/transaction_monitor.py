from decimal import Decimal


class TransactionMonitor:

    @staticmethod
    def analyze(transaction, account):

        risk_score = 0
        reasons = []

        if transaction.amount > Decimal("50000"):
            risk_score += 30
            reasons.append("High transaction amount.")

        if transaction.available_balance_after < Decimal("1000"):
            risk_score += 20
            reasons.append("Low remaining balance.")

        if (
            transaction.amount /
            transaction.available_balance_before
        ) > Decimal("0.80"):
            risk_score += 40
            reasons.append("More than 80% balance used.")

        if risk_score >= 60:
            status = "High Risk"
        elif risk_score >= 30:
            status = "Medium Risk"
        else:
            status = "Low Risk"

        return {
            "risk_score": risk_score,
            "status": status,
            "reasons": reasons
        }       