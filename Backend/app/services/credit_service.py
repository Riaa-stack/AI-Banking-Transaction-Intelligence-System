class CreditService:

    @staticmethod
    def predict_credit_score(user_id):

        # ==========================================
        # Get Accounts
        # ==========================================

        accounts = BankAccount.query.filter_by(
            user_id=user_id
        ).all()

        if not accounts:

            raise Exception(
                "No bank accounts found."
            )

        account_ids = [

            account.id

            for account in accounts

        ]

        # ==========================================
        # Get Transactions
        # ==========================================

        transactions = Transaction.query.filter(

            Transaction.sender_account_id.in_(account_ids)

        ).all()

        # ==========================================
        # Predict Score
        # ==========================================

        result = CreditScorePrediction.predict(

            accounts,

            transactions

        )

        # ==========================================
        # Remove Previous Latest Record
        # ==========================================

        CreditScore.query.filter_by(

            customer_id=user_id,

            is_latest=True

        ).update(

            {

                "is_latest": False

            }

        )

        # ==========================================
        # Save Prediction
        # ==========================================

        credit = CreditScore(

            customer_id=user_id,

            credit_score=result["credit_score"],

            risk_category=result["risk_category"],

            confidence_score=result["confidence_score"],

            financial_health=result["financial_health"],

            ai_explanation=result["ai_explanation"],

            recommendations="\n".join(

                result["recommendations"]

            ),

            is_latest=True

        )

        db.session.add(credit)

        db.session.commit()

        return result