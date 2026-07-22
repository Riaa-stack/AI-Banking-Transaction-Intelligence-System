"""
================================================================================
 AI Banking & Transaction Intelligence System — Synthetic Dataset Generator
================================================================================
Generates a realistic, internally-consistent synthetic banking customer
population, then derives TWO downstream ML-ready datasets from that SAME
population:

    1. credit_score_dataset.csv    — one row per customer (Credit Score Prediction)
    2. fraud_detection_dataset.csv — ~10-20 transaction rows per customer (Fraud Detection)

Both datasets share the exact same Customer_ID values — no new customers are
generated for the transaction dataset; every transaction belongs to an
existing customer produced by the same underlying generation pipeline.

The script builds the base customer population in modular stages (customer ->
account -> financial -> transactions -> credit -> loan -> fraud -> AI
features), with each stage's values derived from realistic statistical
distributions and logical dependencies on previously generated columns
(income, employment, age, debt, payment history, etc.) rather than pure
randomness. The two output datasets are then projected/expanded from that
same population, preserving those relationships.

Usage:
    python dataset_generator.py [--n_records 30000] [--seed 42]
                                 [--credit_out credit_score_dataset.csv]
                                 [--fraud_out fraud_detection_dataset.csv]
                                 [--min_txn 10] [--max_txn 20]

Output:
    credit_score_dataset.csv    — one row per customer, credit-score features + target.
    fraud_detection_dataset.csv — multiple transactions per customer, fraud features + target.
================================================================================
"""

import argparse
import string
import numpy as np
import pandas as pd
from faker import Faker

# --------------------------------------------------------------------------- #
# CONFIGURATION / REFERENCE DATA
# --------------------------------------------------------------------------- #

INDIAN_BANKS = [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
    "Punjab National Bank", "Bank of Baroda", "Kotak Mahindra Bank",
    "Canara Bank", "Union Bank of India", "IDFC FIRST Bank",
    "Yes Bank", "IndusInd Bank", "Bank of India"
]

ACCOUNT_TYPES = ["Savings", "Current", "Salary", "NRI"]

EDUCATION_LEVELS = ["High School", "Diploma", "Bachelor's", "Master's", "PhD"]
EDUCATION_WEIGHTS = [0.15, 0.15, 0.42, 0.23, 0.05]

OCCUPATIONS_BY_EDU = {
    "High School": ["Shop Owner", "Driver", "Farmer", "Security Guard", "Electrician",
                     "Plumber", "Carpenter", "Delivery Executive"],
    "Diploma": ["Technician", "Machine Operator", "Junior Accountant", "Sales Executive",
                "Lab Assistant", "Office Clerk"],
    "Bachelor's": ["Software Engineer", "Accountant", "Marketing Executive", "Teacher",
                    "Bank Officer", "HR Executive", "Business Analyst", "Civil Engineer",
                    "Nurse", "Sales Manager"],
    "Master's": ["Senior Software Engineer", "Data Scientist", "Product Manager",
                 "Chartered Accountant", "Doctor", "Professor", "Investment Analyst",
                 "Consultant", "Architect"],
    "PhD": ["Research Scientist", "University Professor", "Senior Consultant",
            "Policy Advisor", "R&D Director"]
}

EMPLOYMENT_STATUSES = ["Salaried", "Self-Employed", "Unemployed", "Retired", "Student"]

MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"]

LOAN_PURPOSES = ["Home", "Car", "Personal", "Education", "Business", "Medical", "No Active Loan"]

INDIAN_STATES_CITIES = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "Telangana": ["Hyderabad", "Warangal"],
    "West Bengal": ["Kolkata", "Howrah"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur"],
    "Uttar Pradesh": ["Lucknow", "Noida", "Kanpur"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar"],
}

# ---- Transaction-dataset reference data (used by generate_fraud_detection_dataset) ----

TRANSACTION_TYPES = [
    "POS Purchase", "Online Purchase", "ATM Withdrawal",
    "Fund Transfer", "Bill Payment", "UPI Payment",
]
TRANSACTION_TYPE_WEIGHTS = [0.20, 0.20, 0.15, 0.15, 0.15, 0.15]

# Per transaction-type conditional distributions -> (options, weights)
PAYMENT_METHOD_MAP = {
    "POS Purchase":    (["Debit Card", "Credit Card"], [0.6, 0.4]),
    "Online Purchase": (["Credit Card", "Debit Card", "Net Banking", "UPI"], [0.35, 0.25, 0.15, 0.25]),
    "ATM Withdrawal":  (["Cash"], [1.0]),
    "Fund Transfer":   (["IMPS", "NEFT", "RTGS", "Net Banking"], [0.35, 0.25, 0.15, 0.25]),
    "Bill Payment":    (["UPI", "Net Banking", "Debit Card"], [0.5, 0.3, 0.2]),
    "UPI Payment":     (["UPI"], [1.0]),
}

DEVICE_MAP = {
    "POS Purchase":    (["POS Terminal"], [1.0]),
    "Online Purchase": (["Mobile App", "Web Browser", "Tablet"], [0.55, 0.35, 0.10]),
    "ATM Withdrawal":  (["ATM"], [1.0]),
    "Fund Transfer":   (["Mobile App", "Web Browser"], [0.6, 0.4]),
    "Bill Payment":    (["Mobile App", "Web Browser"], [0.65, 0.35]),
    "UPI Payment":     (["Mobile App"], [1.0]),
}

MERCHANT_CATEGORY_MAP = {
    "POS Purchase":    (["Grocery", "Fashion", "Dining", "Fuel", "Electronics", "Healthcare"],
                         [0.25, 0.20, 0.20, 0.15, 0.10, 0.10]),
    "Online Purchase": (["Electronics", "Fashion", "Entertainment", "Travel", "Grocery", "Jewellery"],
                         [0.25, 0.20, 0.20, 0.15, 0.10, 0.10]),
    "ATM Withdrawal":  (["Cash Withdrawal"], [1.0]),
    "Fund Transfer":   (["Peer Transfer", "Family Support", "Business Payment"], [0.5, 0.3, 0.2]),
    "Bill Payment":    (["Utilities", "Insurance", "Subscription", "Loan EMI"], [0.35, 0.25, 0.20, 0.20]),
    "UPI Payment":     (["Grocery", "Dining", "Utilities", "Peer Transfer", "Fuel"],
                         [0.25, 0.25, 0.20, 0.20, 0.10]),
}

DEVICE_TYPES_ALL = ["Mobile App", "Web Browser", "ATM", "POS Terminal", "Tablet"]

MERCHANT_NAME_SUFFIXES = [
    "Retail", "Mart", "Stores", "Enterprises", "Traders", "Services",
    "Solutions", "Hub", "Bazaar", "& Co.", "Ventures", "Outlet",
]


# --------------------------------------------------------------------------- #
# HELPER FUNCTIONS
# --------------------------------------------------------------------------- #

def clip(arr, lo, hi):
    """Clip an array (or scalar) between lo and hi."""
    return np.clip(arr, lo, hi)


def weighted_choice(rng, n, categories, weights):
    """Vectorized weighted categorical sampling."""
    return rng.choice(categories, size=n, p=weights)


# --------------------------------------------------------------------------- #
# STAGE 1 — CUSTOMER DETAILS
# --------------------------------------------------------------------------- #

def generate_customer_details(n, rng, fake):
    """Generate core demographic / identity columns."""
    print("  -> Generating customer demographic details...")

    customer_ids = [f"CUST{str(i).zfill(6)}" for i in range(1, n + 1)]

    # Age: realistic working-population skew (18-75), peak around 28-45
    age = rng.normal(loc=38, scale=12, size=n)
    age = clip(age, 18, 75).astype(int)

    # Gender distribution
    gender = weighted_choice(rng, n, ["Male", "Female", "Other"], [0.51, 0.47, 0.02])

    # Marital status correlated loosely with age
    marital_status = np.empty(n, dtype=object)
    for i in range(n):
        a = age[i]
        if a < 25:
            probs = [0.85, 0.13, 0.01, 0.01]
        elif a < 40:
            probs = [0.30, 0.62, 0.06, 0.02]
        elif a < 60:
            probs = [0.10, 0.75, 0.10, 0.05]
        else:
            probs = [0.05, 0.55, 0.10, 0.30]
        marital_status[i] = rng.choice(MARITAL_STATUSES, p=probs)

    # Education
    education = weighted_choice(rng, n, EDUCATION_LEVELS, EDUCATION_WEIGHTS)

    # Occupation depends on education
    occupation = np.array([rng.choice(OCCUPATIONS_BY_EDU[e]) for e in education], dtype=object)

    # Employment status: correlated with age & education
    employment_status = np.empty(n, dtype=object)
    for i in range(n):
        a = age[i]
        if a < 23:
            probs = [0.20, 0.10, 0.15, 0.00, 0.55]
        elif a < 55:
            probs = [0.62, 0.27, 0.09, 0.02, 0.00]
        elif a < 60:
            probs = [0.45, 0.30, 0.07, 0.18, 0.00]
        else:
            probs = [0.05, 0.15, 0.05, 0.75, 0.00]
        employment_status[i] = rng.choice(EMPLOYMENT_STATUSES, p=probs)

    # Location: pick state then city within state
    states = list(INDIAN_STATES_CITIES.keys())
    state_choices = rng.choice(states, size=n)
    city_choices = np.array(
        [rng.choice(INDIAN_STATES_CITIES[s]) for s in state_choices], dtype=object
    )

    full_names = [
        fake.name_male() if g == "Male" else (fake.name_female() if g == "Female" else fake.name())
        for g in gender
    ]

    df = pd.DataFrame({
        "Customer_ID": customer_ids,
        "Full_Name": full_names,
        "Age": age,
        "Gender": gender,
        "Marital_Status": marital_status,
        "Education": education,
        "Occupation": occupation,
        "Employment_Status": employment_status,
        "City": city_choices,
        "State": state_choices,
        "Country": "India",
    })
    return df


# --------------------------------------------------------------------------- #
# STAGE 2 — ACCOUNT DETAILS
# --------------------------------------------------------------------------- #

def generate_account_details(df, rng):
    """Generate bank/account-level columns, dependent on Age."""
    print("  -> Generating account details...")
    n = len(df)

    bank_name = rng.choice(INDIAN_BANKS, size=n)
    account_type = weighted_choice(rng, n, ACCOUNT_TYPES, [0.55, 0.15, 0.27, 0.03])

    # Account age cannot exceed (Age - 18), minimum 0
    max_possible_age = clip(df["Age"].values - 18, 0, None)
    account_age_years = rng.uniform(0, 1, size=n) * clip(max_possible_age, 1, None)
    account_age_years = clip(account_age_years, 0, 40).round(1)

    number_of_accounts = clip(
        rng.poisson(lam=1.6, size=n) + 1, 1, 6
    )

    primary_account = weighted_choice(rng, n, ["Yes", "No"], [0.7, 0.3])

    df["Bank_Name"] = bank_name
    df["Account_Type"] = account_type
    df["Account_Age_Years"] = account_age_years
    df["Number_of_Bank_Accounts"] = number_of_accounts
    df["Primary_Account"] = primary_account
    return df


# --------------------------------------------------------------------------- #
# STAGE 3 — FINANCIAL DETAILS
# --------------------------------------------------------------------------- #

EMPLOYMENT_INCOME_MULTIPLIER = {
    "Salaried": 1.15,
    "Self-Employed": 1.05,
    "Unemployed": 0.25,
    "Retired": 0.55,
    "Student": 0.20,
}

EDUCATION_INCOME_MULTIPLIER = {
    "High School": 0.65,
    "Diploma": 0.80,
    "Bachelor's": 1.00,
    "Master's": 1.35,
    "PhD": 1.55,
}


def generate_financial_details(df, rng):
    """Generate income/expense/savings/investment columns with realistic
    dependencies on education, employment status and age."""
    print("  -> Generating financial details...")
    n = len(df)

    base_income = rng.lognormal(mean=10.5, sigma=0.55, size=n)  # base in INR/month

    edu_mult = df["Education"].map(EDUCATION_INCOME_MULTIPLIER).values
    emp_mult = df["Employment_Status"].map(EMPLOYMENT_INCOME_MULTIPLIER).values

    # Age-experience curve: income rises till ~50 then plateaus/declines slightly
    age = df["Age"].values
    age_mult = 0.6 + 0.9 * (1 - np.exp(-(age - 18) / 15.0))
    age_mult = clip(age_mult, 0.5, 1.6)

    monthly_income = base_income * edu_mult * emp_mult * age_mult
    monthly_income = clip(monthly_income, 8000, 1_500_000).round(2)

    # Expense ratio: lower income households spend a larger fraction of income
    base_expense_ratio = clip(rng.normal(0.55, 0.12, size=n), 0.25, 0.95)
    # Adjust: very low incomes spend proportionally more (necessities)
    low_income_adj = clip((30000 - monthly_income) / 30000, 0, 0.2)
    expense_ratio = clip(base_expense_ratio + low_income_adj, 0.2, 0.98)

    monthly_expenses = (monthly_income * expense_ratio).round(2)
    monthly_savings = (monthly_income - monthly_expenses).round(2)
    # Guard against negative savings creeping to extreme values
    monthly_savings = clip(monthly_savings, -5000, None).round(2)

    annual_income = (monthly_income * 12).round(2)

    # Existing debt: correlated inversely with savings ratio, scaled to annual income
    savings_ratio_raw = clip(monthly_savings / clip(monthly_income, 1, None), -0.2, 0.8)
    debt_propensity = clip(0.35 - savings_ratio_raw * 0.4 + rng.normal(0, 0.1, size=n), 0.02, 0.9)
    existing_debt = (annual_income * debt_propensity * rng.uniform(0.2, 0.9, size=n)).round(2)

    # Investment value grows with savings and age (compounding effect)
    investment_value = (
        monthly_savings.clip(min=0) * rng.uniform(2, 30, size=n) *
        (1 + df["Account_Age_Years"].values / 20)
    ).round(2)
    investment_value = clip(investment_value, 0, None)

    # Insurance value: modest fraction related to income & age (older -> more insurance)
    insurance_value = (
        annual_income * rng.uniform(0.05, 0.4, size=n) * (0.5 + age / 100)
    ).round(2)

    df["Monthly_Income"] = monthly_income
    df["Monthly_Expenses"] = monthly_expenses
    df["Monthly_Savings"] = monthly_savings
    df["Annual_Income"] = annual_income
    df["Existing_Debt"] = existing_debt
    df["Investment_Value"] = investment_value
    df["Insurance_Value"] = insurance_value

    # Current balance depends on income, savings history and account age
    current_balance = (
        monthly_income * rng.uniform(0.5, 4.0, size=n) +
        monthly_savings.clip(min=0) * df["Account_Age_Years"].values * rng.uniform(0.5, 2.0, size=n)
    ).round(2)
    df["Current_Balance"] = clip(current_balance, 500, None)

    return df


# --------------------------------------------------------------------------- #
# STAGE 4 — TRANSACTION DETAILS
# --------------------------------------------------------------------------- #

def generate_transaction_details(df, rng):
    """Generate monthly transaction behaviour, scaled with income & account activity."""
    print("  -> Generating transaction details...")
    n = len(df)

    income = df["Monthly_Income"].values

    # Higher income / more active accounts -> more transactions
    income_scale = clip(income / 40000, 0.3, 6.0)
    monthly_txn_count = rng.poisson(lam=12 * income_scale) + 1
    monthly_txn_count = clip(monthly_txn_count, 1, 250)

    avg_txn_amount = clip(
        (income / clip(monthly_txn_count, 1, None)) * rng.uniform(0.3, 1.4, size=n),
        50, None
    ).round(2)

    highest_txn = (avg_txn_amount * rng.uniform(3, 15, size=n)).round(2)

    # Split monthly_txn_count across channels using Dirichlet for realistic proportions
    channel_props = rng.dirichlet(alpha=[2, 3, 4, 2, 1.5, 1], size=n)
    channels = (channel_props * monthly_txn_count[:, None])
    channels = np.floor(channels).astype(int)

    cash_withdrawals = channels[:, 0]
    online_txn = channels[:, 1]
    upi_txn = channels[:, 2]
    imps_txn = channels[:, 3]
    neft_txn = channels[:, 4]
    rtgs_txn = channels[:, 5]

    # Failed transactions: small proportion, slightly higher for low-activity/low-income accounts
    fail_rate = clip(0.02 + (1 - clip(income / 100000, 0, 1)) * 0.04, 0.01, 0.12)
    failed_txn = rng.binomial(clip(monthly_txn_count, 1, None), fail_rate)

    df["Monthly_Transaction_Count"] = monthly_txn_count
    df["Average_Transaction_Amount"] = avg_txn_amount
    df["Highest_Transaction"] = highest_txn
    df["Cash_Withdrawals"] = cash_withdrawals
    df["Online_Transactions"] = online_txn
    df["UPI_Transactions"] = upi_txn
    df["IMPS_Transactions"] = imps_txn
    df["NEFT_Transactions"] = neft_txn
    df["RTGS_Transactions"] = rtgs_txn
    df["Failed_Transactions"] = failed_txn

    return df


# --------------------------------------------------------------------------- #
# STAGE 5 — CREDIT FEATURES
# --------------------------------------------------------------------------- #

def generate_credit_features(df, rng):
    """Generate credit-bureau-style features, correlated with debt & payment behaviour."""
    print("  -> Generating credit features...")
    n = len(df)

    outstanding_debt = clip(
        df["Existing_Debt"].values * rng.uniform(0.5, 1.0, size=n), 0, None
    ).round(2)

    # Credit utilization: baseline realistic spread (Beta distribution, mean ~30%)
    # nudged upward for customers carrying relatively more debt vs. income.
    util_baseline = rng.beta(2, 4, size=n) * 100
    debt_income_ratio = clip(
        outstanding_debt / clip(df["Annual_Income"].values, 1, None), 0, 1
    )
    credit_utilization = clip(
        util_baseline * 0.55 + debt_income_ratio * 100 * 0.45 + rng.normal(0, 5, size=n),
        0.1, 100
    ).round(2)

    # Credit history bounded by account age
    credit_history_years = clip(
        df["Account_Age_Years"].values * rng.uniform(0.6, 1.0, size=n), 0, 40
    ).round(1)

    credit_cards = clip(rng.poisson(lam=1.8, size=n), 0, 8)
    credit_inquiries = clip(rng.poisson(lam=1.5, size=n), 0, 15)

    # Payment history quality: realistic base spread (most customers pay
    # reasonably well), nudged down by high utilization and failed transactions.
    payment_score_raw = (
        rng.normal(75, 20, size=n)
        - credit_utilization * 0.3
        - df["Failed_Transactions"].values * 3
    )
    payment_history = np.where(
        payment_score_raw > 65, "Good",
        np.where(payment_score_raw > 35, "Average", "Poor")
    )

    credit_mix_score = (
        clip(credit_cards, 0, 5) + (df["Existing_Debt"].values > 0).astype(int) +
        rng.normal(0, 1, size=n)
    )
    credit_mix = np.where(
        credit_mix_score > 4, "Good",
        np.where(credit_mix_score > 1.5, "Average", "Poor")
    )

    df["Credit_Utilization"] = credit_utilization
    df["Credit_History_Years"] = credit_history_years
    df["Outstanding_Debt"] = outstanding_debt
    df["Credit_Cards"] = credit_cards
    df["Credit_Inquiries"] = credit_inquiries
    df["Payment_History"] = payment_history
    df["Credit_Mix"] = credit_mix

    # ---- CREDIT SCORE (target) ----
    # Base score influenced positively by payment history & credit mix,
    # negatively by utilization, outstanding debt ratio, failed transactions & inquiries.
    payment_map = {"Good": 1.0, "Average": 0.5, "Poor": 0.0}
    mix_map = {"Good": 1.0, "Average": 0.5, "Poor": 0.0}
    payment_val = df["Payment_History"].map(payment_map).values
    mix_val = df["Credit_Mix"].map(mix_map).values

    debt_to_income = clip(
        outstanding_debt / clip(df["Annual_Income"].values, 1, None), 0, 3
    )

    score = (
        320
        + payment_val * 270
        + mix_val * 90
        + clip(credit_history_years / 20, 0, 1) * 110
        - clip(credit_utilization / 100, 0, 1) * 100
        - clip(debt_to_income, 0, 1) * 90
        - clip(df["Failed_Transactions"].values, 0, 10) * 3
        - clip(credit_inquiries, 0, 10) * 2
        + rng.normal(0, 25, size=n)
    )
    credit_score = clip(score, 300, 900).round(0).astype(int)
    df["Credit_Score"] = credit_score

    return df


# --------------------------------------------------------------------------- #
# STAGE 6 — LOAN FEATURES
# --------------------------------------------------------------------------- #

def generate_loan_features(df, rng):
    """Generate loan-related columns; eligibility & amounts depend on
    income, existing debt, credit score and employment status."""
    print("  -> Generating loan features...")
    n = len(df)

    has_loan_prob = clip(0.3 + (df["Credit_Utilization"].values / 200), 0.1, 0.7)
    existing_loan = np.array(
        [rng.choice(["Yes", "No"], p=[p, 1 - p]) for p in has_loan_prob]
    )

    loan_purpose = np.where(
        existing_loan == "Yes",
        rng.choice(LOAN_PURPOSES[:-1], size=n),
        "No Active Loan"
    )

    loan_amount = np.where(
        existing_loan == "Yes",
        (df["Annual_Income"].values * rng.uniform(0.3, 3.0, size=n)).round(2),
        0.0
    )

    interest_rate = clip(
        18 - (df["Credit_Score"].values - 300) / 600 * 12 + rng.normal(0, 1.0, size=n),
        6, 24
    ).round(2)

    # EMI approx via simple amortization estimate (assume avg 5 year tenure)
    tenure_months = 60
    monthly_rate = interest_rate / 1200
    loan_emi = np.where(
        existing_loan == "Yes",
        (loan_amount * monthly_rate * (1 + monthly_rate) ** tenure_months /
         clip((1 + monthly_rate) ** tenure_months - 1, 1e-6, None)).round(2),
        0.0
    )

    loan_status = np.where(
        existing_loan == "No", "No Active Loan",
        np.array([rng.choice(["Approved", "Rejected", "Pending"], p=[0.7, 0.2, 0.1]) for _ in range(n)])
    )

    # ---- Loan eligibility (rule-based target) ----
    employment_ok = df["Employment_Status"].isin(["Salaried", "Self-Employed", "Retired"]).values
    debt_to_income = clip(
        df["Outstanding_Debt"].values / clip(df["Annual_Income"].values, 1, None), 0, 5
    )
    eligible = (
        (df["Credit_Score"].values >= 580) &
        (debt_to_income < 0.6) &
        employment_ok &
        (df["Monthly_Income"].values >= 15000)
    )
    loan_eligibility = np.where(eligible, "Eligible", "Not Eligible")

    # ---- Maximum eligible loan amount ----
    credit_score_factor = clip((df["Credit_Score"].values - 300) / 600, 0.1, 1.0)
    max_eligible_loan = np.where(
        eligible,
        (df["Annual_Income"].values * (2 + 4 * credit_score_factor)).round(2),
        (df["Annual_Income"].values * 0.3 * credit_score_factor).round(2)
    )

    df["Existing_Loan"] = existing_loan
    df["Loan_Amount"] = loan_amount
    df["Loan_EMI"] = loan_emi
    df["Loan_Purpose"] = loan_purpose
    df["Loan_Status"] = loan_status
    df["Loan_Eligibility"] = loan_eligibility
    df["Maximum_Eligible_Loan"] = max_eligible_loan
    df["Interest_Rate"] = interest_rate

    return df


# --------------------------------------------------------------------------- #
# STAGE 7 — FRAUD FEATURES
# --------------------------------------------------------------------------- #

def generate_fraud_features(df, rng, fraud_rate=0.04):
    """Generate fraud-related columns. Fraud cases kept to ~3-5% of records,
    with fraud probability & suspicious transaction counts consistent with the flag."""
    print("  -> Generating fraud features...")
    n = len(df)

    fraud_flag = rng.choice([1, 0], size=n, p=[fraud_rate, 1 - fraud_rate])

    # Fraud probability: high & noisy for fraud cases, low & noisy for non-fraud
    fraud_probability = np.where(
        fraud_flag == 1,
        clip(rng.normal(0.85, 0.08, size=n), 0.55, 0.99),
        clip(rng.normal(0.14, 0.14, size=n), 0.0, 0.6)
    )
    # Nudge probability up slightly for accounts with many failed transactions / high inquiries
    anomaly_boost = clip(df["Failed_Transactions"].values / 20, 0, 0.15)
    fraud_probability = clip(fraud_probability + anomaly_boost * (fraud_flag == 0), 0, 0.99).round(4)

    suspicious_txn_count = np.where(
        fraud_flag == 1,
        rng.poisson(lam=5, size=n) + 1,
        rng.poisson(lam=0.3, size=n)
    )
    suspicious_txn_count = clip(suspicious_txn_count, 0, None)

    risk_level = np.where(
        fraud_probability >= 0.6, "High",
        np.where(fraud_probability >= 0.3, "Medium", "Low")
    )

    df["Fraud_Flag"] = fraud_flag
    df["Fraud_Probability"] = fraud_probability
    df["Risk_Level"] = risk_level
    df["Suspicious_Transaction_Count"] = suspicious_txn_count

    return df


# --------------------------------------------------------------------------- #
# STAGE 8 — AI / DERIVED FEATURES
# --------------------------------------------------------------------------- #

def generate_ai_features(df, rng):
    """Generate higher-level derived features used by downstream AI models."""
    print("  -> Generating AI-derived features...")

    income = clip(df["Monthly_Income"].values, 1, None)
    savings_ratio = clip(df["Monthly_Savings"].values / income, -1, 1).round(4)
    expense_ratio = clip(df["Monthly_Expenses"].values / income, 0, 2).round(4)

    stable_statuses = {"Salaried", "Retired"}
    income_stability = np.where(
        df["Employment_Status"].isin(stable_statuses).values, "Stable", "Unstable"
    )

    # Financial health score (0-100): combines savings ratio, debt ratio,
    # credit score and fraud probability.
    credit_component = (df["Credit_Score"].values - 300) / 600 * 40
    savings_component = clip(savings_ratio, -0.5, 0.6) * 50
    debt_ratio = clip(
        df["Outstanding_Debt"].values / clip(df["Annual_Income"].values, 1, None), 0, 2
    )
    debt_penalty = clip(debt_ratio, 0, 1) * 25
    fraud_penalty = df["Fraud_Probability"].values * 15

    financial_health_score = clip(
        20 + credit_component + savings_component - debt_penalty - fraud_penalty,
        0, 100
    ).round(2)

    customer_risk_profile = np.where(
        (df["Risk_Level"].values == "High") | (financial_health_score < 30), "High",
        np.where(
            (df["Risk_Level"].values == "Medium") | (financial_health_score < 55), "Medium",
            "Low"
        )
    )

    df["Savings_Ratio"] = savings_ratio
    df["Expense_Ratio"] = expense_ratio
    df["Income_Stability"] = income_stability
    df["Financial_Health_Score"] = financial_health_score
    df["Customer_Risk_Profile"] = customer_risk_profile

    return df


# --------------------------------------------------------------------------- #
# STAGE 9 — CREDIT SCORE DATASET (one row per customer)
# --------------------------------------------------------------------------- #

CREDIT_SCORE_COLUMNS = [
    "Customer_ID", "Age", "Gender", "Education", "Employment_Status", "Occupation",
    "Monthly_Income", "Monthly_Expenses", "Monthly_Savings", "Annual_Income",
    "Current_Balance", "Existing_Debt", "Investment_Value", "Insurance_Value",
    "Credit_Utilization", "Credit_History_Years", "Outstanding_Debt", "Credit_Cards",
    "Credit_Inquiries", "Payment_History", "Credit_Mix", "Failed_Transactions",
    "Savings_Ratio", "Expense_Ratio", "Income_Stability", "Financial_Health_Score",
    # Target
    "Credit_Score",
]


def generate_credit_score_dataset(customer_df):
    """Project the Credit Score Prediction dataset from the master customer
    population. Exactly one row per customer — no new values are generated
    here, this simply selects the relevant already-computed columns so the
    existing feature relationships (income -> savings -> debt -> credit
    score, etc.) are preserved exactly as built in Stages 1-8."""
    print("  -> Building credit score dataset (1 row per customer)...")
    df = customer_df[CREDIT_SCORE_COLUMNS].copy()
    return df


# --------------------------------------------------------------------------- #
# STAGE 10 — FRAUD DETECTION DATASET (multiple transactions per customer)
# --------------------------------------------------------------------------- #

FRAUD_DATASET_COLUMNS = [
    "Transaction_ID", "Customer_ID", "Transaction_Date", "Transaction_Time",
    "Transaction_Amount", "Transaction_Type", "Payment_Method", "Merchant_Category",
    "Merchant_Name", "Location", "Device_Type", "IPAddress",
    "Current_Balance", "Monthly_Income", "Average_Transaction_Amount",
    "Transaction_Frequency", "Failed_Transactions", "Credit_Utilization",
    "Outstanding_Debt", "Risk_Level", "Suspicious_Transaction_Count",
    "Fraud_Probability",
    # Target
    "Fraud_Flag",
]


def _build_merchant_name_pool(rng, fake, size=400):
    """Pre-generate a pool of realistic merchant names once (rather than
    calling Faker per-transaction, which would be extremely slow at
    hundreds of thousands of rows)."""
    base_names = [fake.company().split(" ")[0] for _ in range(size)]
    suffixes = rng.choice(MERCHANT_NAME_SUFFIXES, size=size)
    return np.array([f"{b} {s}" for b, s in zip(base_names, suffixes)], dtype=object)


def generate_fraud_detection_dataset(customer_df, rng, fake, min_txn=10, max_txn=20,
                                      target_fraud_rate_range=(0.03, 0.05)):
    """Generate ~min_txn-max_txn transactions per EXISTING customer (no new
    customers are created). Every transaction-level field is derived from
    that customer's already-generated profile (income, balance, failed
    transactions, credit utilization, outstanding debt, risk profile,
    baseline fraud probability), plus transaction-specific behaviour
    (amount, channel, location, device). Fraud transactions are selected as
    the highest-risk-scoring transactions so the overall fraud rate lands
    reliably within the target 3-5% band, and their fields are then
    realistically skewed (high amount, abnormal location, device change,
    extra failed attempts, unusual frequency, high fraud probability)."""
    print("  -> Building fraud detection dataset (multiple transactions per customer)...")
    n_customers = len(customer_df)

    txn_counts = rng.integers(min_txn, max_txn + 1, size=n_customers)
    cust_idx = np.repeat(np.arange(n_customers), txn_counts)
    n = cust_idx.size
    print(f"     Generating {n:,} transactions across {n_customers:,} customers "
          f"({min_txn}-{max_txn} per customer)...")

    # ---- Pull the relevant customer-level fields onto each transaction row ----
    customer_id = customer_df["Customer_ID"].values[cust_idx]
    monthly_income = customer_df["Monthly_Income"].values[cust_idx]
    current_balance = customer_df["Current_Balance"].values[cust_idx]
    avg_txn_amount_cust = customer_df["Average_Transaction_Amount"].values[cust_idx]
    monthly_txn_count_cust = customer_df["Monthly_Transaction_Count"].values[cust_idx]
    failed_txn_cust = customer_df["Failed_Transactions"].values[cust_idx].astype(float)
    credit_utilization = customer_df["Credit_Utilization"].values[cust_idx]
    outstanding_debt = customer_df["Outstanding_Debt"].values[cust_idx]
    existing_debt_cust = customer_df["Existing_Debt"].values[cust_idx]
    suspicious_txn_cust = customer_df["Suspicious_Transaction_Count"].values[cust_idx].astype(float)
    cust_fraud_flag = customer_df["Fraud_Flag"].values[cust_idx]
    cust_fraud_prob = customer_df["Fraud_Probability"].values[cust_idx]
    cust_risk_profile = customer_df["Customer_Risk_Profile"].values[cust_idx]
    cust_city = customer_df["City"].values[cust_idx]
    cust_state = customer_df["State"].values[cust_idx]

    # ---- Transaction identity & timing ----
    transaction_ids = np.array([f"TXN{str(i).zfill(8)}" for i in range(1, n + 1)], dtype=object)

    base_date = pd.Timestamp("2026-01-01")
    offset_days = rng.integers(0, 199, size=n)
    txn_dates = (base_date + pd.to_timedelta(offset_days, unit="D")).strftime("%Y-%m-%d").values

    offset_seconds = rng.integers(0, 86400, size=n)
    hh = (offset_seconds // 3600) % 24
    mm = (offset_seconds % 3600) // 60
    ss = offset_seconds % 60
    txn_times = np.array([f"{h:02d}:{m:02d}:{s:02d}" for h, m, s in zip(hh, mm, ss)], dtype=object)

    # ---- Transaction type -> conditional payment method / device / merchant category ----
    txn_type = weighted_choice(rng, n, TRANSACTION_TYPES, TRANSACTION_TYPE_WEIGHTS)
    payment_method = np.empty(n, dtype=object)
    device_type = np.empty(n, dtype=object)
    merchant_category = np.empty(n, dtype=object)
    for t in TRANSACTION_TYPES:
        mask = (txn_type == t)
        cnt = int(mask.sum())
        if cnt == 0:
            continue
        pm_opts, pm_w = PAYMENT_METHOD_MAP[t]
        dv_opts, dv_w = DEVICE_MAP[t]
        mc_opts, mc_w = MERCHANT_CATEGORY_MAP[t]
        payment_method[mask] = rng.choice(pm_opts, size=cnt, p=pm_w)
        device_type[mask] = rng.choice(dv_opts, size=cnt, p=dv_w)
        merchant_category[mask] = rng.choice(mc_opts, size=cnt, p=mc_w)

    merchant_pool = _build_merchant_name_pool(rng, fake)
    merchant_name = rng.choice(merchant_pool, size=n)

    # ---- Baseline (pre-fraud-adjustment) transaction amount ----
    # Scaled by the customer's own average transaction amount and income,
    # so higher-income / higher-activity customers transact larger sums.
    type_amount_multiplier = {
        "POS Purchase": 1.0, "Online Purchase": 1.2, "ATM Withdrawal": 1.5,
        "Fund Transfer": 2.0, "Bill Payment": 0.8, "UPI Payment": 0.6,
    }
    type_mult = np.array([type_amount_multiplier[t] for t in txn_type])
    base_amount = clip(
        avg_txn_amount_cust * type_mult * rng.uniform(0.3, 1.8, size=n), 20, None
    )
    base_amount = clip(base_amount, 20, current_balance * 0.9 + 5000)

    # ---- Location: normally the customer's home city; rare genuine travel ----
    all_city_state_pairs = [
        (city, state) for state, cities in INDIAN_STATES_CITIES.items() for city in cities
    ]
    home_location = np.array(
        [f"{c}, {s}" for c, s in zip(cust_city, cust_state)], dtype=object
    )
    location = home_location.copy()
    travel_mask = rng.random(n) < 0.05  # ~5% of genuine transactions occur while travelling
    if travel_mask.any():
        travel_pairs = [all_city_state_pairs[i] for i in rng.integers(0, len(all_city_state_pairs), travel_mask.sum())]
        location[travel_mask] = [f"{c}, {s}" for c, s in travel_pairs]

    # ---- IP address (per-transaction) ----
    octets = rng.integers(1, 255, size=(n, 4))
    ip_address = np.array([".".join(row) for row in octets.astype(str)], dtype=object)

    # ---- Transaction frequency: customer's typical daily transaction rate ----
    transaction_frequency = clip(
        (monthly_txn_count_cust / 30.0) * rng.uniform(0.5, 1.5, size=n), 0.1, None
    ).round(2)

    # ------------------------------------------------------------------- #
    # FRAUD RISK SCORE — combines the customer's existing risk signals
    # (risk profile, baseline fraud probability, failed transactions,
    # credit utilization, debt) with per-transaction randomness. The
    # top-scoring transactions (roughly 3-5% of all transactions) are then
    # selected as fraudulent, guaranteeing the target fraud rate exactly
    # while keeping the ranking driven by real customer risk features.
    # ------------------------------------------------------------------- #
    risk_profile_map = {"Low": 0.0, "Medium": 0.5, "High": 1.0}
    risk_profile_val = np.array([risk_profile_map[r] for r in cust_risk_profile])
    debt_to_income = clip(existing_debt_cust / clip(monthly_income * 12, 1, None), 0, 1)

    fraud_score = (
        0.18 * risk_profile_val
        + 0.15 * clip(transaction_frequency / 5, 0, 1)
        + 0.15 * clip(base_amount / 50000, 0, 1)
        + 0.12 * clip(failed_txn_cust / 10, 0, 1)
        + 0.12 * clip(credit_utilization / 100, 0, 1)
        + 0.10 * debt_to_income
        + 0.08 * (device_type != "Mobile App").astype(float)
        + 0.05 * (location != home_location).astype(float)
        + rng.normal(0, 0.25, size=n)
    )

    fraud_rate = rng.uniform(*target_fraud_rate_range)
    threshold = np.quantile(fraud_score, 1 - fraud_rate)
    fraud_flag = (fraud_score >= threshold).astype(int)
    fraud_mask = fraud_flag == 1
    n_fraud = int(fraud_mask.sum())

    # ---- Realistically skew fraud-flagged transactions ----
    transaction_amount = base_amount.copy()
    if n_fraud > 0:
        transaction_amount[fraud_mask] = clip(
            base_amount[fraud_mask] * rng.uniform(1.3, 3.5, size=n_fraud),
            avg_txn_amount_cust[fraud_mask] * 5 + 1000, None
        )
        # Device change: randomize device only for part of the fraud sample
        change_mask = rng.random(n_fraud) < 0.45
        device_type[fraud_mask] = np.where(
            change_mask,
            rng.choice(DEVICE_TYPES_ALL, size=n_fraud),
            device_type[fraud_mask]
        )

        # Abnormal location: sometimes move fraud transactions to another city
        travel = rng.random(n_fraud) < 0.40
        fraud_pairs = [
            all_city_state_pairs[i]
            for i in rng.integers(
                0,
                len(all_city_state_pairs),
                n_fraud
            )
        ]

        new_locations = np.array(
            [f"{c}, {s}" for c, s in fraud_pairs]
        )

        location[fraud_mask] = np.where(
            travel,
            new_locations,
            location[fraud_mask]
        )

        # Extra failed attempts leading up to / around the fraudulent transaction
        failed_txn_cust[fraud_mask] = (
            failed_txn_cust[fraud_mask]
            + rng.binomial(2, 0.35, size=n_fraud)
        )
        # Unusual burst-like transaction frequency
        transaction_frequency[fraud_mask] = (
            transaction_frequency[fraud_mask] *
            rng.uniform(1.5, 3.0, size=n_fraud)
        ).round(2)

        # Elevated suspicious-transaction count
        suspicious_txn_cust[fraud_mask] = suspicious_txn_cust[fraud_mask] + rng.binomial(2, 0.4, size=n_fraud)

    failed_transactions_col = failed_txn_cust.round().astype(int)
    suspicious_txn_col = suspicious_txn_cust.round().astype(int)

    # ---- Per-transaction fraud probability & risk level (derived, not raw copies) ----
    fraud_probability = np.where(
        fraud_mask,
        clip(rng.normal(0.72, 0.15, size=n), 0.40, 0.95),
        clip(fraud_score / max(threshold, 1e-6) * 0.4 + rng.normal(0, 0.05, size=n), 0.05, 0.65)
    ).round(4)

    risk_level = np.where(
        fraud_probability >= 0.6, "High",
        np.where(fraud_probability >= 0.3, "Medium", "Low")
    )

    transaction_amount *= rng.uniform(
        0.90,
        1.10,
        size=n
    )

    transaction_frequency *= rng.uniform(
        0.90,
        1.10,
        size=n
    )

    fraud_df = pd.DataFrame({
        "Transaction_ID": transaction_ids,
        "Customer_ID": customer_id,
        "Transaction_Date": txn_dates,
        "Transaction_Time": txn_times,
        "Transaction_Amount": transaction_amount.round(2),
        "Transaction_Type": txn_type,
        "Payment_Method": payment_method,
        "Merchant_Category": merchant_category,
        "Merchant_Name": merchant_name,
        "Location": location,
        "Device_Type": device_type,
        "IPAddress": ip_address,
        "Current_Balance": current_balance,
        "Monthly_Income": monthly_income,
        "Average_Transaction_Amount": avg_txn_amount_cust,
        "Transaction_Frequency": transaction_frequency,
        "Failed_Transactions": failed_transactions_col,
        "Credit_Utilization": credit_utilization,
        "Outstanding_Debt": outstanding_debt,
        "Risk_Level": risk_level,
        "Suspicious_Transaction_Count": suspicious_txn_col,
        "Fraud_Probability": fraud_probability,
        "Fraud_Flag": fraud_flag,
    })

    fraud_df = fraud_df[FRAUD_DATASET_COLUMNS]
    return fraud_df


# --------------------------------------------------------------------------- #
# MAIN PIPELINE
# --------------------------------------------------------------------------- #

FINAL_COLUMN_ORDER = [
    # Customer details
    "Customer_ID", "Full_Name", "Age", "Gender", "Marital_Status", "Education",
    "Occupation", "Employment_Status", "City", "State", "Country",
    # Account details
    "Bank_Name", "Account_Type", "Account_Age_Years", "Number_of_Bank_Accounts",
    "Primary_Account", "Current_Balance",
    # Financial details
    "Monthly_Income", "Monthly_Expenses", "Monthly_Savings", "Annual_Income",
    "Existing_Debt", "Investment_Value", "Insurance_Value",
    # Transaction details
    "Monthly_Transaction_Count", "Average_Transaction_Amount", "Highest_Transaction",
    "Cash_Withdrawals", "Online_Transactions", "UPI_Transactions", "IMPS_Transactions",
    "NEFT_Transactions", "RTGS_Transactions", "Failed_Transactions",
    # Credit features
    "Credit_Utilization", "Credit_History_Years", "Outstanding_Debt", "Credit_Cards",
    "Credit_Inquiries", "Payment_History", "Credit_Mix",
    # Loan features
    "Existing_Loan", "Loan_Amount", "Loan_EMI", "Loan_Purpose", "Loan_Status",
    "Loan_Eligibility", "Maximum_Eligible_Loan", "Interest_Rate",
    # Fraud features
    "Fraud_Flag", "Fraud_Probability", "Risk_Level", "Suspicious_Transaction_Count",
    # AI features
    "Savings_Ratio", "Expense_Ratio", "Income_Stability", "Financial_Health_Score",
    "Customer_Risk_Profile",
    # Targets (Credit_Score already included above with credit features)
    "Credit_Score",
]


def validate_dataset(df):
    """Run sanity checks on the master customer population before it is
    projected into the two output datasets."""
    print("  -> Validating master customer population...")
    assert df["Customer_ID"].is_unique, "Duplicate Customer_IDs found!"
    assert df.isnull().sum().sum() == 0, "Missing values found!"
    assert df["Credit_Score"].between(300, 900).all(), "Credit_Score out of range!"
    assert df["Financial_Health_Score"].between(0, 100).all(), "Financial_Health_Score out of range!"
    fraud_pct = df["Fraud_Flag"].mean() * 100
    assert 2.0 <= fraud_pct <= 7.0, f"Fraud rate out of expected bounds: {fraud_pct:.2f}%"
    print(f"     Customer-level fraud-prone rate: {fraud_pct:.2f}%  |  "
          f"Rows: {len(df):,}  |  Columns: {df.shape[1]}")
    print("     Master population validation passed.")


def validate_credit_score_dataset(df):
    """Validate the Credit Score Prediction dataset (one row per customer)."""
    print("  -> Validating credit score dataset...")
    assert df["Customer_ID"].is_unique, "Duplicate Customer_IDs found in credit score dataset!"
    assert df.isnull().sum().sum() == 0, "Missing values found in credit score dataset!"
    assert df["Credit_Score"].between(300, 900).all(), "Credit_Score out of range!"
    assert df["Financial_Health_Score"].between(0, 100).all(), "Financial_Health_Score out of range!"
    print(f"     Rows: {len(df):,}  |  Columns: {df.shape[1]}")
    print("     Credit score dataset validation passed.")


def validate_fraud_dataset(fraud_df, credit_df):
    """Validate the Fraud Detection dataset (multiple rows per customer) and
    cross-check consistency against the credit score dataset's customer base."""
    print("  -> Validating fraud detection dataset...")
    assert fraud_df["Transaction_ID"].is_unique, "Duplicate Transaction_IDs found!"
    assert fraud_df.isnull().sum().sum() == 0, "Missing values found in fraud detection dataset!"

    credit_ids = set(credit_df["Customer_ID"])
    fraud_ids = set(fraud_df["Customer_ID"])
    assert fraud_ids.issubset(credit_ids), (
        "Fraud dataset contains Customer_ID values not present in the credit score dataset!"
    )
    assert credit_ids.issubset(fraud_ids), (
        "Some customers in the credit score dataset have no transactions in the fraud dataset!"
    )

    fraud_pct = fraud_df["Fraud_Flag"].mean() * 100
    assert 3.0 <= fraud_pct <= 5.0, f"Transaction fraud rate out of expected bounds: {fraud_pct:.2f}%"

    txns_per_customer = fraud_df.groupby("Customer_ID").size()
    print(f"     Rows: {len(fraud_df):,}  |  Columns: {fraud_df.shape[1]}  |  "
          f"Customers: {fraud_df['Customer_ID'].nunique():,}")
    print(f"     Transactions per customer: min={txns_per_customer.min()}, "
          f"max={txns_per_customer.max()}, mean={txns_per_customer.mean():.1f}")
    print(f"     Transaction-level fraud rate: {fraud_pct:.2f}%")
    print("     Fraud detection dataset validation passed.")


def generate_dataset(n_records=30000, seed=42):
    """Run the full generation pipeline and return the master customer
    population DataFrame (Stages 1-8). Both output datasets are derived
    from this same population."""
    rng = np.random.default_rng(seed)
    fake = Faker("en_IN")
    Faker.seed(seed)

    print(f"Generating {n_records:,} synthetic banking customer records...")

    df = generate_customer_details(n_records, rng, fake)
    df = generate_account_details(df, rng)
    df = generate_financial_details(df, rng)
    df = generate_transaction_details(df, rng)
    df = generate_credit_features(df, rng)
    df = generate_loan_features(df, rng)
    df = generate_fraud_features(df, rng)
    df = generate_ai_features(df, rng)

    df = df[FINAL_COLUMN_ORDER]

    validate_dataset(df)
    return df, rng, fake


def _write_and_verify_csv(df, path, id_column):
    """Write a DataFrame to CSV, then re-read it exactly as an end-user
    would, to catch any values (e.g. the literal string "None") that
    pandas silently parses as NaN on the way back in."""
    df.to_csv(path, index=False)
    print(f"Dataset successfully saved to: {path}")
    print(f"Shape: {df.shape[0]:,} rows x {df.shape[1]} columns")

    reread = pd.read_csv(path)
    reread_nulls = int(reread.isnull().sum().sum())
    if reread_nulls > 0:
        bad_cols = reread.columns[reread.isnull().any()].tolist()
        raise ValueError(
            f"Post-write validation failed: {reread_nulls} missing values found "
            f"when re-reading {path} (columns: {bad_cols}). This usually means "
            f"a placeholder string (e.g. 'None', 'NA', 'NULL') is being misread as NaN."
        )
    assert reread[id_column].isnull().sum() == 0, f"{id_column} missing after re-read of {path}!"
    print(f"Post-write validation passed: {path} re-read contains zero missing values.\n")


def main():
    parser = argparse.ArgumentParser(
        description="Generate synthetic banking datasets (credit score + fraud detection)."
    )
    parser.add_argument("--n_records", type=int, default=30000,
                         help="Number of customer records to generate (20000-50000). Default: 30000")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility.")
    parser.add_argument("--credit_out", type=str, default="credit_score_dataset.csv",
                         help="Output CSV path for the credit score dataset.")
    parser.add_argument("--fraud_out", type=str, default="fraud_detection_dataset.csv",
                         help="Output CSV path for the fraud detection (transactions) dataset.")
    parser.add_argument("--min_txn", type=int, default=10,
                         help="Minimum transactions generated per customer. Default: 10")
    parser.add_argument("--max_txn", type=int, default=20,
                         help="Maximum transactions generated per customer. Default: 20")
    args = parser.parse_args()

    if not (20000 <= args.n_records <= 50000):
        raise ValueError("n_records must be between 20,000 and 50,000.")
    if not (1 <= args.min_txn <= args.max_txn):
        raise ValueError("min_txn must be >= 1 and <= max_txn.")

    # Build the single shared customer population (Stages 1-8).
    customer_df, rng, fake = generate_dataset(n_records=args.n_records, seed=args.seed)

    # Dataset 1: Credit Score Prediction (1 row per customer).
    credit_df = generate_credit_score_dataset(customer_df)
    validate_credit_score_dataset(credit_df)

    # Dataset 2: Fraud Detection (multiple transactions per customer, same customers).
    fraud_df = generate_fraud_detection_dataset(
        customer_df, rng, fake, min_txn=args.min_txn, max_txn=args.max_txn
    )
    validate_fraud_dataset(fraud_df, credit_df)

    print()
    _write_and_verify_csv(credit_df, args.credit_out, "Customer_ID")
    _write_and_verify_csv(fraud_df, args.fraud_out, "Transaction_ID")

    print("All datasets generated and validated successfully:")
    print(f"  - {args.credit_out}  ({len(credit_df):,} customers)")
    print(f"  - {args.fraud_out}  ({len(fraud_df):,} transactions, "
          f"{fraud_df['Customer_ID'].nunique():,} customers)")


if __name__ == "__main__":
    main()
