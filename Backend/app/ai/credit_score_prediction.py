from decimal import Decimal

from app.models.credit_score import RiskCategory


class CreditScorePrediction:

    MIN_SCORE = 300
    MAX_SCORE = 900
    BASE_SCORE = 650

    @staticmethod
    def predict(accounts, transactions):

        score = CreditScorePrediction.BASE_SCORE
        reasons = []
        recommendations = []

        # =====================================================
        # Total Account Balance
        # =====================================================

        total_balance = sum(
            Decimal(account.current_balance)
            for account in accounts
        )

        if total_balance >= Decimal("200000"):

            score += 80
            reasons.append(
                "Excellent account balance maintained."
            )

        elif total_balance >= Decimal("100000"):

            score += 50
            reasons.append(
                "Healthy account balance."
            )

        elif total_balance >= Decimal("50000"):

            score += 25
            reasons.append(
                "Good account balance."
            )

        else:

            score -= 20
            reasons.append(
                "Low account balance."
            )

        # =====================================================
        # Income / Expense Analysis
        # =====================================================

        income = Decimal("0")
        expenses = Decimal("0")

        for transaction in transactions:

            if transaction.transaction_type.value == "Credit":

                income += Decimal(transaction.amount)

            else:

                expenses += Decimal(transaction.amount)

        savings = income - expenses

        if savings >= Decimal("50000"):

            score += 60
            reasons.append(
                "Strong monthly savings."
            )

        elif savings >= Decimal("20000"):

            score += 40
            reasons.append(
                "Healthy savings pattern."
            )

        elif savings >= Decimal("5000"):

            score += 20
            reasons.append(
                "Positive savings."
            )

        else:

            score -= 20
            reasons.append(
                "Low monthly savings."
            )

        # =====================================================
        # Transaction Activity
        # =====================================================

        transaction_count = len(transactions)

        if transaction_count >= 100:

            score += 30

        elif transaction_count >= 50:

            score += 20

        elif transaction_count <= 5:

            score -= 20

        # =====================================================
        # Failed Transactions
        # =====================================================

        failed_transactions = sum(

            1

            for transaction in transactions

            if transaction.transaction_status.value == "Failed"

        )

        score -= failed_transactions * 10

        if failed_transactions:

            reasons.append(

                f"{failed_transactions} failed transactions detected."

            )

        # =====================================================
        # Fraud Detection
        # =====================================================

        risky_transactions = sum(

            1

            for transaction in transactions

            if transaction.is_flagged

        )

        score -= risky_transactions * 15

        if risky_transactions:

            reasons.append(

                "Suspicious transactions detected."

            )

        # =====================================================
        # Clamp Score
        # =====================================================

        score = max(

            CreditScorePrediction.MIN_SCORE,

            min(

                score,

                CreditScorePrediction.MAX_SCORE

            )

        )

        # =====================================================
        # Risk Category
        # =====================================================

        if score >= 800:

            category = RiskCategory.EXCELLENT

        elif score >= 740:

            category = RiskCategory.VERY_GOOD

        elif score >= 670:

            category = RiskCategory.GOOD

        elif score >= 580:

            category = RiskCategory.FAIR

        else:

            category = RiskCategory.POOR

        # =====================================================
        # Financial Health
        # =====================================================

        if score >= 780:

            health = "Excellent"

        elif score >= 700:

            health = "Good"

        elif score >= 620:

            health = "Average"

        else:

            health = "Needs Improvement"

        # =====================================================
        # Recommendations
        # =====================================================

        if savings < Decimal("10000"):

            recommendations.append(
                "Increase your monthly savings."
            )

        if failed_transactions:

            recommendations.append(
                "Avoid failed banking transactions."
            )

        if risky_transactions:

            recommendations.append(
                "Review suspicious transaction activity."
            )

        if total_balance < Decimal("50000"):

            recommendations.append(
                "Maintain a higher average account balance."
            )

        if not recommendations:

            recommendations.append(
                "Maintain your current financial habits."
            )

        # =====================================================
        # AI Explanation
        # =====================================================

        explanation = (

            f"Your predicted credit score is {score}. "

            f"The prediction is based on your account balance, "

            f"transaction behaviour, savings pattern, "

            f"failed transactions, and financial activity."

        )

        # =====================================================
        # Confidence Score
        # =====================================================

        confidence = 95.0

        # =====================================================
        # Return Result
        # =====================================================

        return {

            "credit_score": score,

            "risk_category": category,

            "financial_health": health,

            "confidence_score": confidence,

            "ai_explanation": explanation,

            "recommendations": recommendations,

            "reasons": reasons

        }