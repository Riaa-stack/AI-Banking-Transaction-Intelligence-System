import google.generativeai as genai

from app.config.config import Config


genai.configure(
    api_key=Config.GEMINI_API_KEY
)


class AIFraudAnalyzer:

    MODEL = genai.GenerativeModel(
        "gemini-2.5-flash"
    )

    @staticmethod
    def analyze(
        transaction,
        account,
        monitoring,
        fraud_result,
        credit=None
    ):

        prompt = f"""
You are an AI Fraud Detection Expert working for a bank.

Your task is to analyze the transaction based on the ML prediction,
rule-based analysis and customer financial profile.

Transaction Details

Amount:
₹{transaction.amount}

Transaction Type:
{transaction.transaction_type.value}

Payment Method:
{transaction.transaction_source.value}

Receiver:
{transaction.receiver_name}

Receiver Bank:
{transaction.receiver_bank}

Balance Before:
₹{transaction.available_balance_before}

Balance After:
₹{transaction.available_balance_after}

Rule Score:
{fraud_result["rule_score"]:.2f}

ML Fraud Probability:
{fraud_result["ml_probability"]:.2f}%

Combined Risk Score:
{fraud_result["final_score"]:.2f}

Fraud Status:
{fraud_result["fraud_status"]}

Reasons Detected:

{chr(10).join("- " + r for r in fraud_result["reasons"])}

Customer Credit Information

Credit Score:
{credit.credit_score if credit else "Unknown"}

Risk Category:
{credit.risk_category.value if credit else "Unknown"}

Financial Health:
{credit.financial_health if credit else "Unknown"}
"""

        prompt += """

Return your response in the following format.

Risk Summary:
...

Fraud Reasoning:
...

Fraud Indicators:
...

Recommendation For Bank:
...

Recommendation For Customer:
...

Confidence Adjustment:
(number between -10 and +10)

Only follow this format.
"""

        try:

            response = AIFraudAnalyzer.MODEL.generate_content(
                prompt
            )

            return response.text

        except Exception as e:

            return (
                "AI analysis unavailable.\n"
                f"Reason: {str(e)}"
            )
