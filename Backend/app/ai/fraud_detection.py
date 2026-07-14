from decimal import Decimal


class FraudDetector:

    # ==========================================
    # Fraud Detection
    # ==========================================

    @staticmethod
    def analyze(transaction, account, monitoring):

        fraud_score = monitoring["risk_score"]
        reasons = []

        # ======================================
        # High Transaction Amount
        # ======================================

        if transaction.amount >= Decimal("100000"):
            fraud_score += 20
            reasons.append(
                "Very high transaction amount."
            )

        # ======================================
        # Large Percentage of Balance Used
        # ======================================

        if (
            transaction.available_balance_before > 0
            and (
                transaction.amount /
                transaction.available_balance_before
            ) >= Decimal("0.90")
        ):
            fraud_score += 20
            reasons.append(
                "More than 90% of account balance transferred."
            )

        # ======================================
        # Low Remaining Balance
        # ======================================

        if transaction.available_balance_after < Decimal("500"):

            fraud_score += 10

            reasons.append(
                "Very low remaining balance."
            )

        # ======================================
        # Fraud Probability
        # ======================================

        if fraud_score >= 80:

            probability = 0.95
            status = "Blocked"

        elif fraud_score >= 60:

            probability = 0.80
            status = "High Risk"

        elif fraud_score >= 40:

            probability = 0.50
            status = "Medium Risk"

        else:

            probability = 0.10
            status = "Low Risk"

        # ======================================
        # AI Recommendation
        # ======================================

        if status == "Blocked":

            recommendation = (
                "Block the transaction and perform manual verification."
            )

        elif status == "High Risk":

            recommendation = (
                "Manual review is recommended."
            )

        elif status == "Medium Risk":

            recommendation = (
                "Monitor this transaction closely."
            )

        else:

            recommendation = (
                "Transaction appears to be safe."
            )

        return {

            "fraud_probability": probability,

            "fraud_status": status,

            "fraud_score": fraud_score,

            "recommendation": recommendation,

            "reasons": reasons

        }