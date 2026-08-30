import json
from decimal import Decimal
from google import genai
from app.config.config import Config

api_key = Config.GEMINI_API_KEY
if api_key:
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Warning: Failed to initialize genai.Client in AILoanRecommender: {e}")
        client = None
else:
    client = None

class AILoanRecommender:
    MODEL_NAME = "gemini-2.5-flash"

    @staticmethod
    def calculate_emi(principal, annual_rate, tenure_months):
        """Standard compound interest EMI formula helper"""
        if not annual_rate or annual_rate <= 0 or not tenure_months or tenure_months <= 0:
            return 0.0
        r = (annual_rate / 12.0) / 100.0
        n = float(tenure_months)
        try:
            emi = float(principal) * r * ((1 + r) ** n) / (((1 + r) ** n) - 1)
            return round(emi, 2)
        except Exception:
            return round(float(principal) / tenure_months, 2)

    @staticmethod
    def calculate_eligibility(credit_score, income, requested_amount):
        """Rule-based engine to determine loan constraints and interest tiers"""
        # Determine multiplier based on credit score
        if credit_score >= 800:
            tier = "Premium"
            rate_delta = -0.5
            multiplier = 15.0  # Eligible for up to 15x monthly income
            status = "Eligible"
        elif credit_score >= 740:
            tier = "Very Good"
            rate_delta = 0.0
            multiplier = 12.0
            status = "Eligible"
        elif credit_score >= 670:
            tier = "Good"
            rate_delta = 0.5
            multiplier = 8.0
            status = "Eligible"
        elif credit_score >= 580:
            tier = "Fair"
            rate_delta = 1.5
            multiplier = 4.0
            status = "Conditionally Eligible"
        else:
            tier = "Poor"
            rate_delta = 3.5
            multiplier = 1.0
            status = "Not Eligible"

        max_amount_limit = float(income) * multiplier
        is_amount_approved = float(requested_amount) <= max_amount_limit

        return {
            "tier": tier,
            "rate_delta": rate_delta,
            "max_eligible_amount": round(max_amount_limit, 2),
            "status": status if is_amount_approved else "Conditionally Eligible (Limit Exceeded)",
            "is_approved": is_amount_approved and status != "Not Eligible"
        }

    @staticmethod
    def recommend(user, accounts, transactions, credit_score_rec, payload):
        """
        Executes backend calculations for 5 loan products, sends to Gemini for 
        human-like reasoning and ranking, and returns the response.
        """
        purpose = payload.get("loan_purpose", "Personal")
        requested_amt = float(payload.get("requested_amount", 100000.0))
        tenure = int(payload.get("preferred_tenure", 36))

        # Core user financial summary
        credit_score = int(credit_score_rec.credit_score) if credit_score_rec else 650
        total_balance = float(sum(Decimal(acc.current_balance) for acc in accounts) if accounts else 0.0)

        income = 0.0
        expenses = 0.0
        for tx in transactions:
            amt = float(tx.amount)
            if getattr(tx.transaction_type, "value", str(tx.transaction_type)) == "Credit":
                income += amt
            else:
                expenses += amt

        monthly_income = float(income if income > 0 else 75000.0)
        monthly_expenses = float(expenses if expenses > 0 else 30000.0)
        monthly_savings = max(0.0, monthly_income - monthly_expenses)

        # Baseline definitions of 5 Loan Products
        # Base annual rates: Personal (11.5%), Home (8.5%), Education (8.0%), Vehicle (9.0%), Business (12.5%)
        base_products = {
            "Personal Loan": {"base_rate": 11.5, "max_limit": 1000000.0, "purpose_match": "Personal"},
            "Home Loan": {"base_rate": 8.5, "max_limit": 5000000.0, "purpose_match": "Home"},
            "Education Loan": {"base_rate": 8.0, "max_limit": 2000000.0, "purpose_match": "Education"},
            "Vehicle Loan": {"base_rate": 9.0, "max_limit": 1500000.0, "purpose_match": "Vehicle"},
            "Business Loan": {"base_rate": 12.5, "max_limit": 3000000.0, "purpose_match": "Business"}
        }

        # Calculate eligibility status and EMIs for all 5 products
        calculated_options = {}
        for name, prod in base_products.items():
            elig_details = AILoanRecommender.calculate_eligibility(credit_score, monthly_income, requested_amt)
            
            # Apply rate delta based on credit standing
            rate = max(6.0, prod["base_rate"] + elig_details["rate_delta"])
            
            # Bound requested principal by the maximum eligible amount or maximum product limit
            allowed_limit = min(elig_details["max_eligible_amount"], prod["max_limit"])
            is_eligible = elig_details["status"] != "Not Eligible" and allowed_limit >= 50000.0
            
            approved_principal = min(requested_amt, allowed_limit) if is_eligible else 0.0
            emi = AILoanRecommender.calculate_emi(approved_principal, rate, tenure) if is_eligible else 0.0

            calculated_options[name] = {
                "loan_type": name,
                "base_rate": prod["base_rate"],
                "interest_rate": round(rate, 2),
                "requested_amount": requested_amt,
                "approved_principal": round(approved_principal, 2),
                "max_allowed_limit": round(allowed_limit, 2),
                "eligibility_status": elig_details["status"] if is_eligible else "Not Eligible",
                "estimated_emi": emi,
                "preferred_tenure": tenure
            }

        # Format prompt to send data to Gemini
        prompt = f"""
You are a Senior Loan Advisor and Credit Analyst.
Evaluate the following loan request and backend-calculated eligibility figures to rank the best 2-4 loan products for this customer.

═══════════════════════════════════════════
CUSTOMER PROFILE
═══════════════════════════════════════════
- Credit Score: {credit_score}
- Account Balance: ₹{total_balance:,.2f}
- Monthly Income: ₹{monthly_income:,.2f}
- Monthly Savings: ₹{monthly_savings:,.2f}

═══════════════════════════════════════════
LOAN REQUEST CRITERIA
═══════════════════════════════════════════
- Purpose/Category: {purpose}
- Required Sum: ₹{requested_amt:,.2f}
- Preferred Repayment Tenure: {tenure} months

═══════════════════════════════════════════
BACKEND CALCULATED OPTIONS
═══════════════════════════════════════════
{json.dumps(calculated_options, indent=2)}

═══════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════
1. Analyze the customer's request vs eligibility status, rates, and EMIs calculated by our engine.
2. Select the top 2-4 options. If the user is 'Not Eligible' for all options, explain this clearly.
3. Determine a 'match_score' (integer 1-100) reflecting how well each option fits the requested purpose and financial capacity.
4. Highlight 2-3 key advantages (pros) and 1-2 disadvantages (cons) for each.
5. Provide a 2-sentence 'why_this_loan' explanation.

You MUST respond ONLY with valid JSON in exactly this format (no markdown, no text outside JSON):

{{
  "recommendations": [
    {{
      "loan_type": "Personal Loan",
      "match_score": 95,
      "eligibility_status": "Eligible",
      "calculated_emi": 3297.54,
      "interest_rate": 11.0,
      "approved_principal": 100000.0,
      "tenure_months": 36,
      "advantages": ["Easy approval with direct cash deposition", "Fixed interest rates throughout"],
      "disadvantages": ["Higher interest compared to collateralized loans"],
      "why_this_loan": "A perfect fit for instant personal expenses as it matches your requested purpose exactly."
    }}
  ]
}}
"""

        try:
            response = client.models.generate_content(
                model=AILoanRecommender.MODEL_NAME,
                contents=prompt
            )
            raw_text = response.text.strip()
            
            # Strip markdown if present
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
                raw_text = raw_text.strip()

            parsed = json.loads(raw_text)
            return parsed

        except Exception as e:
            print("Gemini Loan Recommender Error:", e)
            # Safe fallback returning the raw calculated parameters directly
            fallback_recs = []
            for name, opt in calculated_options.items():
                if opt["eligibility_status"] != "Not Eligible":
                    fallback_recs.append({
                        "loan_type": name,
                        "match_score": 85 if purpose.lower() in name.lower() else 50,
                        "eligibility_status": opt["eligibility_status"],
                        "calculated_emi": opt["estimated_emi"],
                        "interest_rate": opt["interest_rate"],
                        "approved_principal": opt["approved_principal"],
                        "tenure_months": opt["preferred_tenure"],
                        "advantages": ["Automated system pre-qualification"],
                        "disadvantages": ["General terms apply"],
                        "why_this_loan": f"Calculated based on standard borrowing metrics."
                    })
            return {"recommendations": sorted(fallback_recs, key=lambda x: x["match_score"], reverse=True)[:3]}

    @staticmethod
    def chat(message, context_data, chat_history=None):
        """Handles interactive conversational chatbot queries regarding loan options"""
        history_str = ""
        if chat_history:
            for h in chat_history[-6:]:
                role = "User" if h.get("sender") == "user" else "Assistant"
                history_str += f"{role}: {h.get('text')}\n"

        prompt = f"""
You are an expert AI Loan Assistant. Use the provided loan recommendation dataset to answer questions, explain trade-offs, compare plans, and analyze scenarios.

═══════════════════════════════════════════
LOAN RECOMMENDATIONS DATASET (CONTEXT)
═══════════════════════════════════════════
{json.dumps(context_data, indent=2)}

═══════════════════════════════════════════
CONVERSATION HISTORY
═══════════════════════════════════════════
{history_str}

User Question: "{message}"

═══════════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════════
1. Base all answers strictly on the numeric details, EMIs, interest rates, and loan types in the dataset.
2. If the user asks for comparisons (e.g. comparing total interest, pros/cons), compute the values:
   - Total Interest Paid = (EMI * tenure) - Approved Principal
3. Highlight trade-offs between higher monthly EMIs vs longer tenures.
4. Support what-if questions (e.g., "What if I increase tenure to 60 months?") by explaining how it lowers EMIs but increases total interest paid.
5. You can represent comparisons using simple text-based tables or bullet lists.
6. Keep your answers concise, informative, and mathematically consistent with the rules.
"""

        try:
            response = client.models.generate_content(
                model=AILoanRecommender.MODEL_NAME,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            return f"Loan Assistant Chat service temporarily unavailable: {str(e)}"
