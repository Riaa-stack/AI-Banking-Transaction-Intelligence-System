import json

from google import genai

from app.config.config import Config


api_key = Config.GEMINI_API_KEY
if api_key:
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Warning: Failed to initialize genai.Client in AIFraudAnalyzer: {e}")
        client = None
else:
    client = None


class AIFraudAnalyzer:
    """
    LLM-powered Fraud Analysis Agent (Gemini 2.5 Flash)

    Produces a structured JSON analysis combining:
    - ML model probability
    - Rule-based findings
    - Customer credit profile
    - Transaction context
    """

    MODEL_NAME = "gemini-2.5-flash"

    EMPTY_ANALYSIS = {
        "risk_summary": "AI analysis unavailable.",
        "fraud_reasoning": "Could not connect to AI analysis service.",
        "fraud_indicators": [],
        "recommendation_bank": "Perform manual review.",
        "recommendation_customer": "Contact your bank if you did not initiate this transaction.",
        "confidence_adjustment": 0
    }

    @staticmethod
    def analyze(
        transaction,
        account,
        monitoring,
        fraud_result,
        credit=None
    ) -> dict:
        """
        Calls Gemini to produce a detailed, structured fraud analysis.
        Returns a dict (parsed from JSON response).
        Falls back to EMPTY_ANALYSIS on error.
        """

        reasons_text = "\n".join(
            f"- {r}" for r in (fraud_result.get("reasons") or [])
        ) or "- None detected"

        monitoring_summary = f"""
Monthly Income:              ₹{monitoring.get("monthly_income", 0):,.2f}
Avg Transaction Amount:      ₹{monitoring.get("average_transaction_amount", 0):,.2f}
Transaction Frequency (30d): {monitoring.get("transaction_frequency", 0)}
Failed Transactions (30d):   {monitoring.get("failed_transactions", 0)}
Merchant Category:           {monitoring.get("merchant_category", "Unknown")}
Location:                    {monitoring.get("location", "Unknown")}
Credit Utilization:          {monitoring.get("credit_utilization", 0):.2%}
Outstanding Debt:            ₹{monitoring.get("outstanding_debt", 0):,.2f}
""".strip()

        credit_info = f"""
Credit Score:    {credit.credit_score if credit else "Not available"}
Risk Category:   {credit.risk_category.value if credit else "Not available"}
Financial Health:{credit.financial_health if credit else "Not available"}
""".strip() if credit else "Credit information not available."

        prompt = f"""
You are a Senior Fraud Detection AI Expert at an Indian bank.

Analyze this bank transaction carefully and provide a detailed fraud assessment.

═══════════════════════════════════════════
TRANSACTION DETAILS
═══════════════════════════════════════════
Amount:            ₹{transaction.amount}
Type:              {transaction.transaction_type.value}
Payment Method:    {transaction.transaction_source.value}
Receiver Name:     {transaction.receiver_name}
Receiver Bank:     {transaction.receiver_bank}
Receiver IFSC:     {transaction.receiver_ifsc}
Balance Before:    ₹{transaction.available_balance_before}
Balance After:     ₹{transaction.available_balance_after}
Remarks:           {transaction.remarks or "None"}

═══════════════════════════════════════════
FRAUD DETECTION ENGINE RESULTS
═══════════════════════════════════════════
ML Model Fraud Probability: {fraud_result.get("ml_probability", 0):.2f}%
Rule-Based Score:           {fraud_result.get("rule_score", 0):.2f} / 100
Combined Final Score:       {fraud_result.get("final_score", 0):.2f} / 100
Fraud Status:               {fraud_result.get("fraud_status", "Unknown")}

Rule Violations Detected:
{reasons_text}

═══════════════════════════════════════════
CUSTOMER MONITORING CONTEXT
═══════════════════════════════════════════
{monitoring_summary}

═══════════════════════════════════════════
CUSTOMER CREDIT PROFILE
═══════════════════════════════════════════
{credit_info}

═══════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════
Based on ALL the above data, provide a comprehensive fraud analysis.

You MUST respond ONLY with valid JSON in exactly this format (no markdown, no explanation outside JSON):

{{
  "risk_summary": "2-3 sentence executive summary of the fraud risk level and key concerns",
  "fraud_reasoning": "Detailed step-by-step explanation of why this transaction is or isn't suspicious. Reference specific numbers and patterns.",
  "fraud_indicators": [
    "Specific indicator 1 observed in this transaction",
    "Specific indicator 2 observed in this transaction"
  ],
  "recommendation_bank": "Clear, actionable recommendation for the bank operations team",
  "recommendation_customer": "Friendly advice to the customer about this transaction and their account security",
  "confidence_adjustment": 0
}}

Rules:
- fraud_indicators must be a JSON array of strings (can be empty array [] if none)
- confidence_adjustment must be an integer between -10 and +10
- risk_summary, fraud_reasoning, recommendation_bank, recommendation_customer must be non-empty strings
- Do NOT wrap the JSON in markdown code blocks
- Do NOT add any text before or after the JSON object
"""

        try:
            response = client.models.generate_content(
                model=AIFraudAnalyzer.MODEL_NAME,
                contents=prompt
            )

            raw_text = response.text.strip()

            # Strip markdown code blocks if present
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
                raw_text = raw_text.strip()

            parsed = json.loads(raw_text)

            # Ensure all required keys are present
            for key in AIFraudAnalyzer.EMPTY_ANALYSIS:
                if key not in parsed:
                    parsed[key] = AIFraudAnalyzer.EMPTY_ANALYSIS[key]

            # Ensure fraud_indicators is always a list
            if not isinstance(parsed.get("fraud_indicators"), list):
                parsed["fraud_indicators"] = []

            return parsed

        except json.JSONDecodeError:
            # Fallback: return raw text wrapped in structured format
            raw_text = getattr(response, "text", "AI analysis unavailable.")
            return {
                **AIFraudAnalyzer.EMPTY_ANALYSIS,
                "risk_summary": raw_text[:500] if raw_text else "AI analysis unavailable.",
                "fraud_reasoning": raw_text or "Could not parse AI response."
            }

        except Exception as e:
            fallback = dict(AIFraudAnalyzer.EMPTY_ANALYSIS)
            fallback["fraud_reasoning"] = f"AI service error: {str(e)}"
            return fallback
