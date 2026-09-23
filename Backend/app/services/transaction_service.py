import uuid
from decimal import Decimal

from app.extensions import db
from app.ai.ai_service import AIService

from app.models.user import User, UserRole

from app.models.bank_account import (
    BankAccount,
    AccountStatus
)

from app.models.transaction import (
    Transaction,
    TransactionStatus,
    TransactionSource,
    TransactionType
)


class TransactionService:

    MAX_TRANSACTION_LIMIT = Decimal("100000")

    # ==================================================
    # Send Money
    # ==================================================

    @staticmethod
    def send_money(user_id, data):

        try:

            # ==========================================
            # Fetch Sender Account
            # ==========================================

            sender_account = BankAccount.query.filter_by(
                id=data["sender_account_id"],
                user_id=user_id
            ).first()

            if not sender_account:

                return False, "Sender account not found."

            if getattr(
                sender_account,
                "is_security_locked",
                False
            ):

                return (
                    False,
                    "ACCOUNT_SECURITY_LOCKED: "
                    "This demo account is temporarily locked "
                    "because of a simulated security incident."
                )

            if sender_account.account_status != AccountStatus.ACTIVE:

                return (
                    False,
                    "Your account is not active."
                )

            # ==========================================
            # Amount Validation
            # ==========================================

            amount = Decimal(
                str(data["amount"])
            )

            if amount <= 0:

                return (
                    False,
                    "Transaction amount must be greater than zero."
                )

            if amount > TransactionService.MAX_TRANSACTION_LIMIT:

                return (
                    False,
                    f"Maximum transaction limit is "
                    f"₹{TransactionService.MAX_TRANSACTION_LIMIT}."
                )

            # ==========================================
            # Self Transfer Check
            # ==========================================

            if (
                sender_account.account_number
                ==
                data["receiver_account_number"]
            ):

                return (
                    False,
                    "You cannot transfer money to your own account."
                )

            # ==========================================
            # Balance Check
            # ==========================================

            if sender_account.current_balance < amount:

                return (
                    False,
                    "Insufficient account balance."
                )

            balance_before = (
                sender_account.current_balance
            )

            balance_after = (
                balance_before - amount
            )

            # ==========================================
            # Deduct Balance
            # ==========================================

            sender_account.current_balance = (
                balance_after
            )

            # ==========================================
            # Generate Transaction Reference
            # ==========================================

            transaction_reference = (
                "TXN-"
                +
                uuid.uuid4().hex[:12].upper()
            )

            # ==========================================
            # Create Transaction
            # ==========================================

            transaction = Transaction(

                transaction_reference=
                    transaction_reference,

                sender_account_id=
                    sender_account.id,

                receiver_name=
                    data["receiver_name"],

                receiver_account_number=
                    data["receiver_account_number"],

                receiver_bank=
                    data["receiver_bank"],

                receiver_ifsc=
                    data["receiver_ifsc"],

                amount=
                    amount,

                remarks=
                    data.get("remarks", ""),

                transaction_type=
                    TransactionType.DEBIT,

                available_balance_before=
                    balance_before,

                available_balance_after=
                    balance_after,

                transaction_source=
                    TransactionSource(
                        data["transaction_source"]
                    ),

                transaction_status=
                    TransactionStatus.PENDING
            )

            db.session.add(transaction)

            # ==========================================
            # AI Analysis
            #
            # AI fields are staged on the transaction.
            # The commit happens only once below.
            # ==========================================

            fraud_report = {}

            try:

                ai_result = (
                    AIService.analyze_transaction(
                        transaction,
                        sender_account
                    )
                )

                fraud_report = (
                    ai_result.get(
                        "fraud",
                        {}
                    )
                )

                fraud_status = (
                    transaction.fraud_status
                    or
                    "Low Risk"
                )

                # ======================================
                # Fraud Block
                # ======================================

                if fraud_status.lower() == "blocked":

                    # Refund deducted amount

                    sender_account.current_balance = (
                        balance_before
                    )

                    transaction.available_balance_after = (
                        balance_before
                    )

                    transaction.transaction_status = (
                        TransactionStatus.BLOCKED
                    )

                    transaction.failure_reason = (
                        "Transaction blocked by "
                        "AI fraud detection."
                    )

                else:

                    transaction.transaction_status = (
                        TransactionStatus.SUCCESS
                    )

            except Exception as ai_err:

                # ======================================
                # AI Failure
                #
                # AI failure must not block a legitimate
                # transaction.
                # ======================================

                transaction.ai_reviewed = False

                transaction.fraud_status = (
                    "Low Risk"
                )

                transaction.risk_score = 0.0

                transaction.fraud_probability = 0.0

                transaction.transaction_status = (
                    TransactionStatus.SUCCESS
                )

            # ==========================================
            # Atomic Commit
            # ==========================================

            db.session.commit()

            # ==========================================
            # Return Transaction Result
            # ==========================================

            return True, {

                "transaction_id":
                    str(transaction.id),

                "transaction_reference":
                    transaction.transaction_reference,

                "amount":
                    float(transaction.amount),

                "available_balance":
                    float(
                        sender_account.current_balance
                    ),

                "transaction_status":
                    transaction.transaction_status.value,

                "fraud_report": {

                    "ml_probability":
                        round(
                            float(
                                fraud_report.get(
                                    "ml_probability",
                                    0
                                )
                            ),
                            2
                        ),

                    "rule_score":
                        round(
                            float(
                                fraud_report.get(
                                    "rule_score",
                                    0
                                )
                            ),
                            2
                        ),

                    "final_score":
                        round(
                            float(
                                fraud_report.get(
                                    "final_score",
                                    0
                                )
                            ),
                            2
                        ),

                    "fraud_probability":
                        round(
                            float(
                                fraud_report.get(
                                    "fraud_probability",
                                    0
                                )
                            ),
                            2
                        ),

                    "fraud_status":
                        fraud_report.get(
                            "fraud_status",
                            "Low Risk"
                        ),

                    "is_flagged":
                        fraud_report.get(
                            "is_flagged",
                            False
                        ),

                    "recommendation":
                        fraud_report.get(
                            "recommendation",
                            ""
                        ),

                    "reasons":
                        fraud_report.get(
                            "reasons",
                            []
                        ),

                    "model_used":
                        fraud_report.get(
                            "model_used",
                            False
                        ),

                    "ai_analysis":
                        fraud_report.get(
                            "ai_analysis",
                            {}
                        ),
                }
            }

        except Exception as e:

            db.session.rollback()

            return False, str(e)

    # ==================================================
    # Transaction History
    #
    # CUSTOMER:
    #     Own transactions only.
    #
    # EMPLOYEE:
    #     ALL customer transactions.
    # ==================================================

    @staticmethod
    def get_transaction_history(user_id):

        try:

            # ==========================================
            # Find Logged-In User
            # ==========================================

            user = User.query.filter_by(
                id=user_id
            ).first()

            if not user:

                return False, "User not found."

            # ==========================================
            # EMPLOYEE
            #
            # Employee Command Console gets the complete
            # transaction ledger.
            # ==========================================

            if user.role == UserRole.EMPLOYEE:

                transactions = (
                    Transaction.query
                    .join(BankAccount)
                    .order_by(
                        Transaction.created_at.desc()
                    )
                    .all()
                )

            # ==========================================
            # CUSTOMER
            #
            # Customer gets only transactions belonging
            # to their own bank account.
            # ==========================================

            else:

                transactions = (
                    Transaction.query
                    .join(BankAccount)
                    .filter(
                        BankAccount.user_id == user.id
                    )
                    .order_by(
                        Transaction.created_at.desc()
                    )
                    .all()
                )

            # ==========================================
            # Build Response
            # ==========================================

            history = []

            for transaction in transactions:

                history.append({

                    "id":
                        str(transaction.id),

                    "reference":
                        transaction.transaction_reference,

                    "receiver_name":
                        transaction.receiver_name,

                    "receiver_bank":
                        transaction.receiver_bank,

                    "amount":
                        float(transaction.amount),

                    "status":
                        transaction.transaction_status.value,

                    "transaction_type":
                        transaction.transaction_type.value,

                    "source":
                        transaction.transaction_source.value,

                    "risk_score":
                        transaction.risk_score,

                    "fraud_probability":
                        transaction.fraud_probability,

                    "fraud_status":
                        transaction.fraud_status,

                    "created_at":
                        transaction.created_at.isoformat()
                })

            return True, history

        except Exception as e:

            return False, str(e)

    # ==================================================
    # Transaction Details
    #
    # CUSTOMER:
    #     Own transaction only.
    #
    # EMPLOYEE:
    #     Can inspect any transaction.
    # ==================================================

    @staticmethod
    def get_transaction(
        user_id,
        transaction_id
    ):

        try:

            # ==========================================
            # Find Logged-In User
            # ==========================================

            user = User.query.filter_by(
                id=user_id
            ).first()

            if not user:

                return False, "User not found."

            # ==========================================
            # Base Query
            # ==========================================

            query = (
                Transaction.query
                .join(BankAccount)
                .filter(
                    Transaction.id == transaction_id
                )
            )

            # ==========================================
            # CUSTOMER
            #
            # Restrict to customer's own account.
            # ==========================================

            if user.role != UserRole.EMPLOYEE:

                query = query.filter(
                    BankAccount.user_id == user.id
                )

            # ==========================================
            # Fetch Transaction
            # ==========================================

            transaction = query.first()

            if not transaction:

                return (
                    False,
                    "Transaction not found."
                )

            # ==========================================
            # Return Transaction Details
            # ==========================================

            return True, {

                "id":
                    str(transaction.id),

                "reference":
                    transaction.transaction_reference,

                "receiver_name":
                    transaction.receiver_name,

                "receiver_account_number":
                    transaction.receiver_account_number,

                "receiver_bank":
                    transaction.receiver_bank,

                "receiver_ifsc":
                    transaction.receiver_ifsc,

                "amount":
                    float(transaction.amount),

                "remarks":
                    transaction.remarks,

                "balance_before":
                    float(
                        transaction.available_balance_before
                    ),

                "balance_after":
                    float(
                        transaction.available_balance_after
                    ),

                "status":
                    transaction.transaction_status.value,

                "transaction_type":
                    transaction.transaction_type.value,

                "source":
                    transaction.transaction_source.value,

                "ai_reviewed":
                    transaction.ai_reviewed,

                "risk_score":
                    transaction.risk_score,

                "fraud_probability":
                    transaction.fraud_probability,

                "fraud_status":
                    transaction.fraud_status,

                "ai_explanation":
                    transaction.ai_explanation,

                "created_at":
                    transaction.created_at.isoformat()
            }

        except Exception as e:

            return False, str(e)