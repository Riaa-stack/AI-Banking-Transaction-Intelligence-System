from decimal import Decimal
from datetime import datetime

from app.ai.fraud_detection import FraudDetector


# -----------------------------
# Dummy Enum-like Classes
# -----------------------------

class DummyTransactionType:
    value = "Debit"


class DummyTransactionSource:
    value = "UPI"


# -----------------------------
# Dummy Transaction
# -----------------------------

class DummyTransaction:

    created_at = datetime.now()

    amount = Decimal("95000")

    transaction_type = DummyTransactionType()

    transaction_source = DummyTransactionSource()

    receiver_name = "ABC Traders"

    receiver_bank = "State Bank"

    available_balance_before = Decimal("100000")

    available_balance_after = Decimal("5000")


# -----------------------------
# Dummy User
# -----------------------------

class DummyUser:

    address = "Nagpur, Maharashtra"


# -----------------------------
# Dummy Account
# -----------------------------

class DummyAccount:

    user = DummyUser()

    user_id = 1


# -----------------------------
# Monitoring Data
# -----------------------------

monitoring = {

    "risk_score": 55,

    "average_transaction_amount": 12000,

    "transaction_frequency": 16,

    "failed_transactions": 4,

    "monthly_income": 60000,

    "credit_utilization": 45,

    "outstanding_debt": 150000,

    "merchant_category": "Electronics",

    "location": "Nagpur",

    "device_type": "Mobile"
}


transaction = DummyTransaction()

account = DummyAccount()


result = FraudDetector.analyze(

    transaction,

    account,

    monitoring

)

print("\n========== FRAUD RESULT ==========\n")

print(result)