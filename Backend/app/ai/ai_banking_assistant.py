class AIBankingAssistant:

    @staticmethod
    def generate_summary(
        account,
        credit_result,
        loan_result,
        monitoring_result=None,
        fraud_result=None
    ):

        summary = []

        # ==========================================
        # Account Information
        # ==========================================

        summary.append(
            f"Current account balance: ₹{float(account.current_balance):,.2f}"
        )

        # ==========================================
        # Credit Score
        # ==========================================

        summary.append(
            f"Credit Score: {credit_result['credit_score']} "
            f"({credit_result['credit_category']})"
        )

        summary.append(
            credit_result["recommendation"]
        )

        # ==========================================
        # Loan Recommendation
        # ==========================================

        summary.append(
            f"Loan Eligibility: {loan_result['eligibility']}"
        )

        if loan_result["eligibility"] != "Not Eligible":

            summary.append(
                f"Recommended Loan Amount: ₹{loan_result['maximum_loan_amount']:,.2f}"
            )

            summary.append(
                f"Estimated EMI: ₹{loan_result['estimated_monthly_emi']:,.2f}"
            )

            summary.append(
                f"Interest Rate: {loan_result['interest_rate']}%"
            )

        summary.append(
            loan_result["recommendation"]
        )

        # ==========================================
        # Transaction Monitoring
        # ==========================================

        if monitoring_result:

            summary.append(
                f"Transaction Risk Level: {monitoring_result['status']}"
            )

        # ==========================================
        # Fraud Detection
        # ==========================================

        if fraud_result:

            summary.append(
                f"Fraud Status: {fraud_result['fraud_status']}"
            )

            summary.append(
                f"Fraud Probability: "
                f"{fraud_result['fraud_probability'] * 100:.1f}%"
            )

        # ==========================================
        # Overall Financial Health
        # ==========================================

        if (
            credit_result["credit_score"] >= 750
            and loan_result["eligibility"] == "Eligible"
        ):

            health = "Excellent"

        elif credit_result["credit_score"] >= 650:

            health = "Good"

        else:

            health = "Needs Improvement"

        summary.append(
            f"Overall Financial Health: {health}"
        )

        return {

            "financial_health": health,

            "summary": summary

        }