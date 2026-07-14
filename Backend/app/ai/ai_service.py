from app.ai.transaction_monitor import TransactionMonitor
from app.ai.fraud_detection import FraudDetector
from app.ai.credit_score_prediction import CreditScorePrediction
from app.ai.loan_recommendation import LoanRecommendation
from app.ai.ai_banking_assistant import AIBankingAssistant


class AIService:

    # =====================================================
    # Analyze a Transaction
    # =====================================================

    @staticmethod
    def analyze_transaction(transaction, account):

        monitoring = TransactionMonitor.analyze(
            transaction,
            account
        )

        fraud = FraudDetector.analyze(
            transaction,
            account,
            monitoring
        )

        return {

            "monitoring": monitoring,

            "fraud": fraud,

            "explanation": (
                f"Risk Level: {monitoring['status']}, "
                f"Fraud Status: {fraud['fraud_status']}"
            )

        }

    # =====================================================
    # Predict Credit Score
    # =====================================================

    @staticmethod
    def predict_credit_score(account, transactions):

        return CreditScorePrediction.predict(
            account,
            transactions
        )

    # =====================================================
    # Recommend Loan
    # =====================================================

    @staticmethod
    def recommend_loan(account, credit_result):

        return LoanRecommendation.recommend(
            account,
            credit_result
        )

    # =====================================================
    # Generate AI Banking Summary
    # =====================================================

    @staticmethod
    def generate_banking_summary(

        account,

        transactions,

        latest_transaction=None

    ):

        credit_result = (

            CreditScorePrediction.predict(

                account,

                transactions

            )

        )

        loan_result = (

            LoanRecommendation.recommend(

                account,

                credit_result

            )

        )

        monitoring_result = None

        fraud_result = None

        if latest_transaction:

            monitoring_result = (

                TransactionMonitor.analyze(

                    latest_transaction,

                    account

                )

            )

            fraud_result = (

                FraudDetector.analyze(

                    latest_transaction,

                    account,

                    monitoring_result

                )

            )

        return (

            AIBankingAssistant.generate_summary(

                account,

                credit_result,

                loan_result,

                monitoring_result,

                fraud_result

            )

        )