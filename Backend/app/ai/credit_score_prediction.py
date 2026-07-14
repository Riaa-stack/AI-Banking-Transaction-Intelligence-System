from decimal import Decimal


class CreditScorePrediction:

    MIN_SCORE = 300
    MAX_SCORE = 900

    @staticmethod
    def predict(account, transactions):

        score = 750
        reasons = []

        # ======================================
        # Account Balance
        # ======================================

        if account.current_balance >= Decimal("100000"):
            score += 40
            reasons.append(
                "Maintains a high account balance."
            )

        elif account.current_balance < Decimal("5000"):
            score -= 40
            reasons.append(
                "Low account balance."
            )

        # ======================================
        # Transaction Count
        # ======================================

        transaction_count = len(transactions)

        if transaction_count >= 50:
            score += 20
            reasons.append(
                "Healthy transaction activity."
            )

        elif transaction_count <= 5:
            score -= 20
            reasons.append(
                "Very few banking transactions."
            )

        # ======================================
        # Failed Transactions
        # ======================================

        failed_transactions = sum(
            1
            for transaction in transactions
            if transaction.transaction_status.value == "Failed"
        )

        if failed_transactions > 3:
            score -= 30
            reasons.append(
                "Multiple failed transactions."
            )

        # ======================================
        # Fraud Alerts
        # ======================================

        fraud_transactions = sum(
            1
            for transaction in transactions
            if transaction.fraud_status in [
                "High Risk",
                "Blocked"
            ]
        )

        if fraud_transactions > 0:
            score -= fraud_transactions * 15

            reasons.append(
                "Risky transactions detected."
            )

        # ======================================
        # Clamp Score
        # ======================================

        score = max(
            CreditScorePrediction.MIN_SCORE,
            min(score, CreditScorePrediction.MAX_SCORE)
        )

        # ======================================
        # Credit Category
        # ======================================

        if score >= 800:

            category = "Excellent"

        elif score >= 700:

            category = "Good"

        elif score >= 600:

            category = "Fair"

        else:

            category = "Poor"

        # ======================================
        # Recommendation
        # ======================================

        if category == "Excellent":

            recommendation = (
                "Eligible for premium loan offers."
            )

        elif category == "Good":

            recommendation = (
                "Eligible for most loan products."
            )

        elif category == "Fair":

            recommendation = (
                "Improve financial activity to increase credit score."
            )

        else:

            recommendation = (
                "Improve account balance and reduce risky transactions."
            )

        return {

            "credit_score": score,

            "credit_category": category,

            "recommendation": recommendation,

            "reasons": reasons

        }