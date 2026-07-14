from decimal import Decimal


class LoanRecommendation:

    MIN_LOAN_AMOUNT = Decimal("50000")
    MAX_LOAN_AMOUNT = Decimal("5000000")

    @staticmethod
    def recommend(account, credit_result):

        credit_score = credit_result["credit_score"]

        current_balance = account.current_balance

        # ======================================
        # Loan Eligibility
        # ======================================

        if credit_score >= 800:

            eligibility = "Eligible"

            max_amount = Decimal("5000000")

            interest_rate = 8.5

            tenure = 84

            recommendation = (
                "Eligible for premium loan offers."
            )

        elif credit_score >= 700:

            eligibility = "Eligible"

            max_amount = Decimal("2500000")

            interest_rate = 9.5

            tenure = 72

            recommendation = (
                "Eligible for standard loan offers."
            )

        elif credit_score >= 600:

            eligibility = "Conditionally Eligible"

            max_amount = Decimal("1000000")

            interest_rate = 11.5

            tenure = 60

            recommendation = (
                "Improve credit score for better loan offers."
            )

        else:

            eligibility = "Not Eligible"

            max_amount = Decimal("0")

            interest_rate = None

            tenure = None

            recommendation = (
                "Loan cannot be recommended due to poor credit profile."
            )

        # ======================================
        # Balance Bonus
        # ======================================

        if (
            eligibility != "Not Eligible"
            and current_balance >= Decimal("500000")
        ):

            max_amount += Decimal("500000")

            recommendation += (
                " High account balance increases eligibility."
            )

        # ======================================
        # Monthly EMI
        # ======================================

        emi = None

        if (
            eligibility != "Not Eligible"
            and tenure
        ):

            emi = round(
                float(max_amount) / tenure,
                2
            )

        # ======================================
        # Return
        # ======================================

        return {

            "eligibility": eligibility,

            "credit_score": credit_score,

            "maximum_loan_amount": float(max_amount),

            "interest_rate": interest_rate,

            "loan_tenure_months": tenure,

            "estimated_monthly_emi": emi,

            "recommendation": recommendation

        }