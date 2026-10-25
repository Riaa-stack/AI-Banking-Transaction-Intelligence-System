import json
from decimal import Decimal
from app.ai.llm_gateway import LLMGateway


class AIFraudAnalyzer:
    """
    LLM-powered Fraud Analysis Agent with Gemini + OpenRouter Fallback.
    Produces a structured JSON analysis combining:
    - ML model probability
    - Rule-based findings
    - Customer credit profile
    - Transaction context
    """

    @staticmethod
    def _build_smart_fallback(transaction, account, monitoring, fraud_result, credit=None) -> dict:
        """
        Guaranteed high-quality domain fallback if all external LLM APIs are exhausted/offline.
        Ensures the UI never sees raw error strings.
        """
        score = float(fraud_result.get("final_score", 0))
        reasons = fraud_result.get("reasons", [])
        reasons_text = "; ".join(reasons) if reasons else "No anomalous markers detected."
        amount = float(getattr(transaction, "amount", 0))

        if score >= 75:
            return {
                "risk_summary": (
                    f"High-risk transaction of ₹{amount:,.2f} flagged by automated intelligence engine. "
                    f"Account security protocols engaged."
                ),
                "fraud_reasoning": (
                    f"Transaction triggered critical risk rules: {reasons_text} "
                    f"Calculated risk index is {score:.1f}/100, which exceeds automated clearance thresholds."
                ),
                "fraud_indicators": reasons if reasons else ["Rapid account balance drain", "High transaction velocity"],
                "recommendation_bank": "Block the transaction immediately, hold settlement, and verify identity via two-factor channel.",
                "recommendation_customer": "If you did not authorize this transfer of ₹{:,.2f}, lock your account immediately from the security tab.".format(amount),
                "confidence_adjustment": 5
            }
        elif score >= 50:
            return {
                "risk_summary": (
                    f"Moderate risk observed on ₹{amount:,.2f} transfer. Additional monitoring recommended."
                ),
                "fraud_reasoning": (
                    f"Transaction exhibits moderate variance from historical averages ({reasons_text}). Risk score: {score:.1f}/100."
                ),
                "fraud_indicators": reasons if reasons else ["Moderate deviation from spending average"],
                "recommendation_bank": "Flag for asynchronous operations audit; verify destination IFSC routing.",
                "recommendation_customer": "Please ensure the receiver account details and bank branch match your intended destination.",
                "confidence_adjustment": 0
            }
        else:
            return {
                "risk_summary": "Transaction verified safe. Low fraud probability detected by intelligence models.",
                "fraud_reasoning": f"Transaction of ₹{amount:,.2f} aligns with typical financial profile and standard clearing thresholds.",
                "fraud_indicators": [],
                "recommendation_bank": "Approve transaction and proceed with standard instant settlement.",
                "recommendation_customer": "Transaction authorized and processed securely.",
                "confidence_adjustment": -2
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
        Calls Gemini -> OpenRouter -> Domain Fallback.
        Returns a valid structured dictionary.
        """
        smart_fallback = AIFraudAnalyzer._build_smart_fallback(
            transaction, account, monitoring, fraud_result, credit
        )

        reasons_text = "\n".join(
            f"- {r}" for r in (fraud_result.get("reasons") or [])
        ) or "- None detected"

        monitoring_summary = f"""
Monthly Income:              ₹{monitoring.get("monthly_income", 0):,.2f}
Total Spent (Last 30 Days):  ₹{monitoring.get("total_spent_30d", 0):,.2f}
Avg Transaction Amount:      ₹{monitoring.get("avg_transaction_amount", 0):,.2f}
Avg Daily Transactions:      {monitoring.get("avg_daily_transactions", 0):.1f}
Total Transactions (30d):    {monitoring.get("total_transactions_30d", 0)}
Failed Transactions (30d):   {monitoring.get("failed_transactions_30d", 0)}
Location:                    {monitoring.get("location", "Unknown")}
Device Type:                 {monitoring.get("device_type", "Mobile")}
Merchant Category:           {monitoring.get("merchant_category", "Others")}
"""

        credit_summary = f"""
Credit Score:   {credit.credit_score if credit else "Not Available"}
Tier:           {credit.score_tier if credit else "Unknown"}
Risk Category:  {credit.risk_category if credit else "Unknown"}
"""

        prompt = f"""
You are a Senior Financial Crime & Fraud Intelligence Analyst at an enterprise bank.
Analyze the following flagged transaction and provide an authoritative fraud assessment in valid JSON.

═══════════════════════════════════════════
TRANSACTION UNDER REVIEW
═══════════════════════════════════════════
Transaction ID:    {transaction.id}
Amount:            ₹{float(transaction.amount):,.2f}
Transaction Type:  {transaction.transaction_type.value}
Payment Channel:   {transaction.transaction_source.value}
Receiver Name:     {transaction.receiver_name or "Unknown"}
Receiver Bank:     {transaction.receiver_bank or "Unknown"}
Receiver IFSC:     {transaction.receiver_ifsc or "Unknown"}
Balance Before:    ₹{float(transaction.available_balance_before):,.2f}
Balance After:     ₹{float(transaction.available_balance_after):,.2f}
Remarks:           {transaction.remarks or "None"}
Timestamp:         {transaction.created_at.strftime("%d %b %Y, %I:%M %p")}

═══════════════════════════════════════════
SENDER ACCOUNT PROFILE
═══════════════════════════════════════════
Bank:              {account.bank_name}
Account Type:      {account.account_type.value}
Current Balance:   ₹{float(account.current_balance):,.2f}
Account Holder:    {account.user.full_name}
Customer Location: {account.user.address}

═══════════════════════════════════════════
BEHAVIORAL MONITORING (LAST 30 DAYS)
═══════════════════════════════════════════
{monitoring_summary}

═══════════════════════════════════════════
CREDIT PROFILE
═══════════════════════════════════════════
{credit_summary}

═══════════════════════════════════════════
AUTOMATED ENGINE FINDINGS
═══════════════════════════════════════════
ML Fraud Probability: {fraud_result.get("ml_probability", 0):.1f}%
Rule-Based Score:      {fraud_result.get("rule_score", 0)}/100
Final Hybrid Score:    {fraud_result.get("final_score", 0):.1f}/100
Status Assigned:       {fraud_result.get("fraud_status", "Unknown")}

Flagged Reasons:
{reasons_text}

═══════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════
Respond ONLY with valid JSON in this exact structure:
{{
  "risk_summary": "2-3 sentence executive summary of the fraud risk level and key concerns",
  "fraud_reasoning": "Detailed step-by-step explanation of why this transaction is or isn't suspicious.",
  "fraud_indicators": [
    "Specific indicator 1 observed",
    "Specific indicator 2 observed"
  ],
  "recommendation_bank": "Clear, actionable recommendation for the bank operations team",
  "recommendation_customer": "Friendly advice to the customer about this transaction and account security",
  "confidence_adjustment": 0
}}
"""
        return LLMGateway.generate_json(
            prompt=prompt,
            fallback_data=smart_fallback,
            system_prompt="You are a banking fraud detection system that only outputs JSON."
        )
