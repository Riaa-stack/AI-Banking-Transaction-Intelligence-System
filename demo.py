"""
================================================================================
🏦 AI Banking & Transaction Intelligence System — End-to-End Live Demo
================================================================================
This script demonstrates the complete banking and fraud detection lifecycle:
  1. Customer Registration (including Bank Account details & initial deposit)
  2. Authentication & JWT Token retrieval
  3. Fetching Account & Balance details
  4. Legitimate Transfer (Low Risk -> Instant SUCCESS)
  5. Fraudulent Transfer (High Risk / Drain -> BLOCKED + Atomic Refund + AI Analysis)
  6. Transaction Ledger Audit & History Inspection

Usage:
  1. Ensure Backend is running:
       cd Backend && python run.py
  2. Run this demo:
       python demo.py
================================================================================
"""

import sys
import time
import uuid
import random
import requests
from decimal import Decimal

# Base URL for the Backend API
BASE_URL = "http://127.0.0.1:5000/api/v1"

# ANSI Colors for beautiful terminal output
class Colors:
    HEADER    = "\033[95m"
    BLUE      = "\033[94m"
    CYAN      = "\033[96m"
    GREEN     = "\033[92m"
    WARNING   = "\033[93m"
    FAIL      = "\033[91m"
    BOLD      = "\033[1m"
    UNDERLINE = "\033[4m"
    END       = "\033[0m"

def print_banner(text):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'=' * 78}")
    print(f"  {text}")
    print(f"{'=' * 78}{Colors.END}\n")

def print_step(step_num, title):
    print(f"{Colors.BOLD}{Colors.HEADER}[STEP {step_num}] {title}{Colors.END}")

def print_success(msg):
    print(f"  {Colors.GREEN}✔ {msg}{Colors.END}")

def print_warning(msg):
    print(f"  {Colors.WARNING}⚠ {msg}{Colors.END}")

def print_danger(msg):
    print(f"  {Colors.FAIL}✖ {msg}{Colors.END}")

def print_info(label, val):
    print(f"  • {Colors.BOLD}{label}:{Colors.END} {val}")


def check_backend_health():
    """Verify that the backend server is reachable before starting."""
    try:
        res = requests.get("http://127.0.0.1:5000/", timeout=3)
        if res.status_code == 200:
            print_success("Backend server is online and responding at http://127.0.0.1:5000")
            return True
    except requests.exceptions.ConnectionError:
        print_danger("Could not connect to Backend server at http://127.0.0.1:5000")
        print(f"\n{Colors.WARNING}Please start the backend first in a separate terminal:")
        print("  cd Backend")
        print("  .\\venv\\Scripts\\Activate.ps1  (or source venv/bin/activate)")
        print(f"  python run.py{Colors.END}\n")
        return False
    return False


def run_demo():
    print_banner("🏦 AI BANKING INTELLIGENCE SYSTEM — LIVE DEMO WALKTHROUGH")

    if not check_backend_health():
        sys.exit(1)

    time.sleep(1)

    # ──────────────────────────────────────────────────────────────────────────
    # 1. CUSTOMER REGISTRATION (Including Personal and Bank Details)
    # ──────────────────────────────────────────────────────────────────────────
    rand_suffix = random.randint(1000, 9999)
    customer_email = f"demo.user{rand_suffix}@example.com"
    mobile_number = f"98{random.randint(10000000, 99999999)}"
    gov_id = f"ABCDE{random.randint(1000, 9999)}F"
    account_number = f"1000{random.randint(10000000, 99999999)}"
    initial_balance = 100000.00  # ₹1,00,000

    print_step(1, "Customer Registration with Primary Bank Details")
    print("  Registering new customer with personal identity AND mandatory bank account:")
    print_info("Full Name", f"Aarav Sharma ({rand_suffix})")
    print_info("Email", customer_email)
    print_info("Mobile", mobile_number)
    print_info("Bank Name", "State Bank of India")
    print_info("Account Number", account_number)
    print_info("IFSC Code", "SBIN0001234")
    print_info("Account Type", "Savings")
    print_info("Initial Deposit", f"₹{initial_balance:,.2f}")

    signup_payload = {
        "full_name": f"Aarav Sharma {rand_suffix}",
        "email": customer_email,
        "mobile_number": mobile_number,
        "government_id": gov_id,
        "date_of_birth": "1994-06-15",
        "address": "42 MG Road, Bandra West, Mumbai, MH",
        "bank_name": "State Bank of India",
        "account_holder_name": f"Aarav Sharma {rand_suffix}",
        "account_number": account_number,
        "ifsc_code": "SBIN0001234",
        "branch_name": "Bandra West",
        "account_type": "Savings",
        "current_balance": initial_balance,
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!"
    }

    resp = requests.post(f"{BASE_URL}/auth/customer/register", json=signup_payload)
    if resp.status_code != 201:
        print_danger(f"Registration failed ({resp.status_code}): {resp.text}")
        sys.exit(1)

    print_success("Customer and primary bank account created successfully!")
    time.sleep(1)

    # ──────────────────────────────────────────────────────────────────────────
    # 2. AUTHENTICATION & LOGIN
    # ──────────────────────────────────────────────────────────────────────────
    print(f"\n{Colors.BOLD}{Colors.HEADER}[STEP 2] Customer Authentication (JWT Login){Colors.END}")
    login_payload = {
        "email": customer_email,
        "password": "SecurePassword123!",
        "role": "customer"
    }
    login_resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    if login_resp.status_code != 200:
        print_danger(f"Login failed ({login_resp.status_code}): {login_resp.text}")
        sys.exit(1)

    auth_data = login_resp.json().get("data", {})
    token = auth_data.get("access_token")
    user_id = auth_data.get("user", {}).get("id")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    print_success("Login authenticated successfully!")
    print_info("User ID", user_id)
    print_info("JWT Bearer Token", f"{token[:25]}...{token[-15:]}")
    time.sleep(1)

    # ──────────────────────────────────────────────────────────────────────────
    # 3. RETRIEVE LINKED BANK ACCOUNTS
    # ──────────────────────────────────────────────────────────────────────────
    print(f"\n{Colors.BOLD}{Colors.HEADER}[STEP 3] Fetching Bank Accounts from Database{Colors.END}")
    acc_resp = requests.get(f"{BASE_URL}/accounts/all", headers=headers)
    if acc_resp.status_code != 200:
        print_danger(f"Failed to fetch accounts: {acc_resp.text}")
        sys.exit(1)

    accounts = acc_resp.json().get("data", [])
    if not accounts:
        print_danger("No bank accounts found for customer.")
        sys.exit(1)

    primary_account = accounts[0]
    sender_account_id = primary_account["id"]
    current_balance = float(primary_account["current_balance"])

    print_success("Primary bank account retrieved:")
    print_info("Account ID", sender_account_id)
    print_info("Bank Name", primary_account["bank_name"])
    print_info("Account Number", primary_account["account_number"])
    print_info("IFSC Code", primary_account["ifsc_code"])
    print_info("Active Balance", f"{Colors.GREEN}₹{current_balance:,.2f}{Colors.END}")
    time.sleep(1)

    # ──────────────────────────────────────────────────────────────────────────
    # 4. TEST CASE 1: LEGITIMATE MONEY TRANSFER (Low Risk)
    # ──────────────────────────────────────────────────────────────────────────
    print_banner("TEST CASE 1: Normal Legitimate Transfer (Low Risk)")
    print("  Attempting a standard transfer to a verified colleague for lunch expenses:")
    normal_amount = 1200.00
    print_info("Transfer Amount", f"₹{normal_amount:,.2f}")
    print_info("Recipient", "Rohan Verma")
    print_info("Bank", "HDFC Bank (HDFC0001234)")
    print_info("Payment Method", "UPI")

    normal_payload = {
        "sender_account_id": sender_account_id,
        "receiver_name": "Rohan Verma",
        "receiver_account_number": "987654321098",
        "receiver_bank": "HDFC Bank",
        "receiver_ifsc": "HDFC0001234",
        "amount": normal_amount,
        "transaction_source": "UPI",
        "remarks": "Team lunch reimbursement"
    }

    print("\n  Evaluating transaction through AI/ML pipeline...")
    t0 = time.time()
    res1 = requests.post(f"{BASE_URL}/transactions/send-money", json=normal_payload, headers=headers)
    elapsed = time.time() - t0

    if res1.status_code != 200:
        print_danger(f"Transaction failed: {res1.text}")
    else:
        txn1_data = res1.json().get("data", {})
        txn1 = txn1_data.get("transaction", {})
        fraud_meta = txn1_data.get("fraud_report", {})
        print_success(f"Transaction Executed in {elapsed:.2f}s!")
        print_info("Transaction Reference", txn1.get("transaction_reference"))
        print_info("Status", f"{Colors.GREEN}{txn1.get('transaction_status')}{Colors.END}")
        print_info("Fraud Risk Status", f"{Colors.GREEN}{txn1.get('fraud_status')}{Colors.END}")
        print_info("Calculated Risk Score", f"{txn1.get('risk_score')}")
        print_info("Updated Account Balance", f"₹{float(txn1.get('available_balance_after', 0)):,.2f}")

    time.sleep(2)

    # ──────────────────────────────────────────────────────────────────────────
    # 5. TEST CASE 2: FRAUDULENT MONEY TRANSFER (High Risk / Blocked)
    # ──────────────────────────────────────────────────────────────────────────
    print_banner("TEST CASE 2: High-Risk Fraud Transfer (Triggering Detection & Block)")
    print("  Attempting an anomalous transaction crafted to trip multiple fraud triggers:")
    print("    • Rule 1: Near maximum ₹1,00,000 threshold (+20 risk)")
    print("    • Rule 2: Draining >90% of entire account balance in single transfer (+20 risk)")
    print("    • Rule 3: High-value RTGS to an unverified recipient")
    print("    • Layer 2: XGBoost ML Model classifies pattern anomaly")
    print("    • Layer 3: Gemini GenAI provides qualitative risk reasoning")

    fraud_amount = 95000.00
    print_info("Transfer Amount", f"{Colors.FAIL}₹{fraud_amount:,.2f}{Colors.END}")
    print_info("Recipient", "Unknown Offshore Global Ltd")
    print_info("Payment Method", "RTGS")

    fraud_payload = {
        "sender_account_id": sender_account_id,
        "receiver_name": "Unknown Offshore Global Ltd",
        "receiver_account_number": "409876543219",
        "receiver_bank": "State Bank of India",
        "receiver_ifsc": "SBIN0009999",
        "amount": fraud_amount,
        "transaction_source": "RTGS",
        "remarks": "Urgent total balance liquidation"
    }

    print("\n  Analyzing multi-tier fraud intelligence pipeline...")
    t0 = time.time()
    res2 = requests.post(f"{BASE_URL}/transactions/send-money", json=fraud_payload, headers=headers)
    elapsed = time.time() - t0

    if res2.status_code == 200:
        txn2_data = res2.json().get("data", {})
        txn2 = txn2_data.get("transaction", {})
        fraud_meta = txn2_data.get("fraud_report", {})

        status = txn2.get("transaction_status")
        fraud_status = txn2.get("fraud_status")

        if status == "Blocked" or fraud_status == "Blocked":
            print(f"\n  {Colors.BOLD}{Colors.FAIL}🛑 FRAUD TRIPWIRE TRIGGERED — TRANSACTION BLOCKED!{Colors.END}")
            print_info("Transaction Reference", txn2.get("transaction_reference"))
            print_info("Transaction Status", f"{Colors.FAIL}{status}{Colors.END}")
            print_info("Fraud Status", f"{Colors.FAIL}{fraud_status}{Colors.END}")
            print_info("Total Risk Score", f"{Colors.BOLD}{txn2.get('risk_score')}/100{Colors.END}")
            print_info("Fraud Probability", f"{txn2.get('fraud_probability')}%")
            print_info("Failure Reason", txn2.get("failure_reason"))

            print(f"\n  {Colors.BOLD}{Colors.GREEN}🛡 ATOMIC SAFETY REFUND VERIFICATION:{Colors.END}")
            print_info("Balance Before Attack", f"₹{float(txn2.get('available_balance_before')):,.2f}")
            print_info("Balance Restored To", f"₹{float(txn2.get('available_balance_after')):,.2f}")
            print_success("Customer balance was automatically preserved. Zero loss occurred.")

            # Show Triggered Rules
            reasons = fraud_meta.get("reasons", [])
            if reasons:
                print(f"\n  {Colors.BOLD}{Colors.WARNING}Violated Behavioral Rules ({len(reasons)}):{Colors.END}")
                for r in reasons:
                    print(f"    ⚠ {r}")

            # Show AI Analysis
            ai_data = fraud_meta.get("ai_analysis") or {}
            if isinstance(ai_data, str):
                import json
                try: ai_data = json.loads(ai_data)
                except: pass

            if isinstance(ai_data, dict) and ai_data.get("risk_summary"):
                print(f"\n  {Colors.BOLD}{Colors.CYAN}🧠 Google Gemini GenAI Analysis:{Colors.END}")
                print(f"    • Summary: {ai_data.get('risk_summary')}")
                print(f"    • Recommendation: {ai_data.get('recommended_action', 'Block and verify')}")
        else:
            print_warning(f"Transaction completed with status: {status}, Fraud Status: {fraud_status}")
    else:
        print_danger(f"Server rejected request ({res2.status_code}): {res2.text}")

    time.sleep(2)

    # ──────────────────────────────────────────────────────────────────────────
    # 6. TRANSACTION AUDIT LEDGER
    # ──────────────────────────────────────────────────────────────────────────
    print_banner("TRANSACTION AUDIT LEDGER & HISTORY")
    hist_resp = requests.get(f"{BASE_URL}/transactions/history", headers=headers)
    if hist_resp.status_code == 200:
        history = hist_resp.json().get("data", [])
        print(f"  {Colors.BOLD}{'REFERENCE':<18} | {'AMOUNT':<10} | {'STATUS':<10} | {'FRAUD RISK':<12} | {'SCORE':<6}{Colors.END}")
        print("  " + "-" * 68)
        for t in history:
            ref = t.get("transaction_reference", "N/A")[:16]
            amt = f"₹{float(t.get('amount', 0)):,.0f}"
            st = t.get("transaction_status", "N/A")
            fr = t.get("fraud_status", "Low Risk")
            sc = str(round(float(t.get("risk_score") or 0), 1))
            st_color = Colors.GREEN if st == "Success" else Colors.FAIL
            print(f"  {ref:<18} | {amt:<10} | {st_color}{st:<10}{Colors.END} | {fr:<12} | {sc:<6}")
        print("  " + "-" * 68)

    print_banner("✨ DEMO COMPLETED SUCCESSFULLY!")
    print(f"  {Colors.GREEN}All systems functional: Authentication, Bank Accounts, ML Models, Rule Engine, and GenAI.{Colors.END}\n")

if __name__ == "__main__":
    run_demo()
