import os
import json
from datetime import datetime

from dotenv import load_dotenv

from google import genai

from app.extensions import db

from app.models.user import User
from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.models.uploaded_statement import UploadedStatement

from app.ai.ai_prompt import SYSTEM_PROMPT

load_dotenv()

from app.ai.llm_gateway import LLMGateway


# ============================================================
# AI Banking Assistant
# ============================================================

class AIBankingAssistant:

    """
    ===========================================================

    Aegis AI Banking Copilot

    Responsibilities

    ✔ Customer Financial Assistant

    ✔ Banking Knowledge

    ✔ Expense Analyzer

    ✔ Budget Planner

    ✔ Loan Advisor

    ✔ Credit Score Advisor

    ✔ Fraud Advisor

    ✔ OCR Statement Interpreter

    ✔ Financial Health Analyzer

    ✔ Investment Guide

    ✔ Banking Education

    ===========================================================
    """

    # ==========================================================
    # Conversation Memory
    # ==========================================================

    conversation_memory = {}

    MEMORY_LIMIT = 20

    # ==========================================================
    # Get Conversation
    # ==========================================================

    @classmethod
    def get_conversation(cls, user_id):

        if user_id not in cls.conversation_memory:

            cls.conversation_memory[user_id] = []

        return cls.conversation_memory[user_id]

    # ==========================================================
    # Save Conversation
    # ==========================================================

    @classmethod
    def save_message(

        cls,

        user_id,

        role,

        message

    ):

        history = cls.get_conversation(user_id)

        history.append(

            {

                "role": role,

                "message": message,

                "timestamp": datetime.now().strftime(

                    "%d-%m-%Y %H:%M"

                )

            }

        )

        if len(history) > cls.MEMORY_LIMIT:

            cls.conversation_memory[user_id] = history[-cls.MEMORY_LIMIT:]

    # ==========================================================
    # Clear Memory
    # ==========================================================

    @classmethod
    def clear_memory(cls, user_id):

        cls.conversation_memory[user_id] = []

    # ==========================================================
    # Get Memory as Text
    # ==========================================================

    @classmethod
    def memory_to_text(

        cls,

        user_id

    ):

        history = cls.get_conversation(user_id)

        if not history:

            return "No previous conversation."

        text = ""

        for item in history:

            text += (

                f"{item['role']} : "

                f"{item['message']}\n"

            )

        return text
        # ==========================================================
    # Build Customer Banking Context
    # ==========================================================

    @staticmethod
    def build_customer_context(

        customer,

        accounts,

        transactions,

        statements=None,

        credit_result=None,

        loan_result=None,

        monitoring_result=None,

        fraud_result=None

    ):

        context = {}

        # ======================================================
        # Customer Information
        # ======================================================

        context["customer"] = {

            "name": customer.full_name,

            "email": customer.email,

            "customer_id": str(customer.id)

        }

        # ======================================================
        # Bank Accounts
        # ======================================================

        account_list = []

        total_balance = 0

        for account in accounts:

            balance = float(account.current_balance)

            total_balance += balance

            account_list.append(

                {

                    "bank_name": account.bank_name,

                    "account_number": account.account_number[-4:],

                    "account_type": account.account_type.value,

                    "balance": balance,

                    "primary": account.is_primary

                }

            )

        context["accounts"] = account_list

        context["total_balance"] = total_balance

        # ======================================================
        # Recent Transactions
        # ======================================================

        tx_list = []

        income = 0

        expenses = 0

        highest_transaction = 0

        for tx in transactions:

            amount = float(tx.amount)

            highest_transaction = max(

                highest_transaction,

                amount

            )

            if tx.transaction_type.value == "Credit":

                income += amount

            else:

                expenses += amount

            tx_list.append(

                {

                    "date": str(tx.created_at),

                    "amount": amount,

                    "type": tx.transaction_type.value,

                    "status": tx.transaction_status.value,

                    "receiver": tx.receiver_name,

                    "remarks": tx.remarks

                }

            )

        context["transactions"] = tx_list

        context["total_income"] = income

        context["total_expenses"] = expenses

        context["highest_transaction"] = highest_transaction

        # ======================================================
        # Statements
        # ======================================================

        statement_data = []

        if statements:

            for stmt in statements:

                statement_data.append(

                    {

                        "month": stmt.statement_month,

                        "year": stmt.statement_year,

                        "ocr_status": stmt.processing_status.value,

                        "summary": stmt.ai_summary or "No summary available."

                    }

                )

        context["statements"] = statement_data

        # ======================================================
        # Credit Score
        # ======================================================

        if credit_result:

            context["credit_score"] = credit_result

        # ======================================================
        # Loan Recommendation
        # ======================================================

        if loan_result:

            context["loan"] = loan_result

        # ======================================================
        # Transaction Monitoring
        # ======================================================

        if monitoring_result:

            context["transaction_monitor"] = monitoring_result

        # ======================================================
        # Fraud Detection
        # ======================================================

        if fraud_result:

            context["fraud_detection"] = fraud_result

        return context
        # ==========================================================
    # Convert Context into Prompt
    # ==========================================================

    @staticmethod
    def context_to_prompt(context):

        return json.dumps(

            context,

            indent=4,

            default=str

        )
            # ==========================================================
    # Ask Gemini
    # ==========================================================

    @classmethod
    def ask_ai(

        cls,

        user_id,

        customer,

        question,

        accounts,

        transactions,

        statements=None,

        credit_result=None,

        loan_result=None,

        monitoring_result=None,

        fraud_result=None

    ):

        # Save User Message

        cls.save_message(

            user_id,

            "User",

            question

        )

        # Build Context

        context = cls.build_customer_context(

            customer,

            accounts,

            transactions,

            statements,

            credit_result,

            loan_result,

            monitoring_result,

            fraud_result

        )

        context_text = cls.context_to_prompt(

            context

        )

        conversation = cls.memory_to_text(

            user_id

        )

        final_prompt = f"""

{SYSTEM_PROMPT}

===========================================================
CUSTOMER BANKING DATA
===========================================================

{context_text}

===========================================================
PREVIOUS CONVERSATION
===========================================================

{conversation}

===========================================================
CUSTOMER QUESTION
===========================================================

{question}

===========================================================
IMPORTANT

Answer only using customer banking data whenever available.

Never invent balances.

Never invent transactions.

If information is unavailable,
clearly mention that.

"""

        quick = cls.quick_response(

            question,

            accounts,

            transactions

        )

        if quick:

            response = quick

        else:

            response = cls.generate_response(

                user_id,

                final_prompt

            )

        cls.save_message(

            user_id,

            "Assistant",

            response

        )

        return response
    # ==========================================================
    # Generate Assistant Response (Gemini + OpenRouter Fallback)
    # ==========================================================

    @staticmethod
    def generate_response(
        user_id,
        prompt
    ):
        fallback_msg = (
            "I have analyzed your banking request. Your accounts and intelligence services are operating securely. "
            "You can review your transaction history, check loan options, or view detailed fraud monitoring cards "
            "using the navigation menu."
        )

        return LLMGateway.generate_text(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT,
            fallback_text=fallback_msg
        )

    # ==========================================================
    # Health Check
    # ==========================================================

    @classmethod
    def health(cls):

        return {
            "status": "ok",
            "model": "gemini-3.8-flash (with OpenRouter fallback)"
        }

    @classmethod
    def reset_chat(

        cls,

        user_id

    ):

        cls.clear_memory(

            user_id

        )

        return {

            "message":

            "Conversation cleared."

        }

    # ==========================================================
    # Get Total Balance
    # ==========================================================

    @staticmethod
    def get_total_balance(accounts):

        total = 0

        for account in accounts:

            total += float(account.current_balance)

        return total

    # ==========================================================
    # Calculate Expenses
    # ==========================================================

    @staticmethod
    def calculate_expenses(transactions):

        total = 0

        for tx in transactions:

            if tx.transaction_type == "Debit":

                total += float(tx.amount)

        return total

    # ==========================================================
    # Calculate Income
    # ==========================================================

    @staticmethod
    def calculate_income(transactions):

        total = 0

        for tx in transactions:

            if tx.transaction_type == "Credit":

                total += float(tx.amount)

        return total

    # ==========================================================
    # Financial Health
    # ==========================================================

    @staticmethod
    def financial_health(

        balance,

        income,

        expenses

    ):

        if income == 0:

            return "Insufficient data"

        savings = income - expenses

        ratio = savings / income

        if ratio >= 0.40:

            return "Excellent"

        elif ratio >= 0.25:

            return "Good"

        elif ratio >= 0.10:

            return "Average"

        return "Needs Improvement"

    # ==========================================================
    # Quick Banking Response
    # ==========================================================

    @classmethod
    def quick_response(

        cls,

        question,

        accounts,

        transactions

    ):

        q = question.lower()

        # ---------------- Balance ----------------

        if "balance" in q:

            balance = cls.get_total_balance(accounts)

            return f"""
Your total available balance is ₹{balance:,.2f}.

This amount is calculated across all your linked bank accounts.
"""

        # ---------------- Expense ----------------

        if "expense" in q or "spent" in q:

            expense = cls.calculate_expenses(transactions)

            return f"""
Your total expenses are ₹{expense:,.2f}.

You can ask me to analyse your spending in detail.
"""

        # ---------------- Income ----------------

        if "income" in q:

            income = cls.calculate_income(transactions)

            return f"""
Your total income is ₹{income:,.2f}.
"""

        return None

    # ==========================================================
    # Financial Report
    # ==========================================================

    @classmethod
    def financial_report(cls, accounts, transactions):

        income = cls.calculate_income(transactions)
        expense = cls.calculate_expenses(transactions)
        balance = cls.get_total_balance(accounts)

        return {
            "balance": balance,
            "income": income,
            "expenses": expense,
            "savings": income - expense
        }

    # ==========================================================
    # Loan Summary
    # ==========================================================

    @staticmethod
    def loan_summary(loan_result):

        return loan_result if loan_result else {}

    # ==========================================================
    # Credit Summary
    # ==========================================================

    @staticmethod
    def credit_summary(credit_result):

        return credit_result if credit_result else {}

    # ==========================================================
    # Fraud Summary
    # ==========================================================

    @staticmethod
    def fraud_summary(fraud_result):

        return fraud_result if fraud_result else {}

    # ==========================================================
    # OCR Summary
    # ==========================================================

    @staticmethod
    def statement_summary(statements):

        return [
            {
                "month": s.statement_month,
                "year": s.statement_year,
                "summary": s.ai_summary
            }
            for s in statements
        ] if statements else []
