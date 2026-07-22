from datetime import datetime, timedelta
from decimal import Decimal

from app.ai.ml_feature_builder import MLFeatureBuilder
from app.models.transaction import TransactionStatus, TransactionType


class DummyTransaction:

    def __init__(self, amount, transaction_type, transaction_status, created_at):
        self.amount = amount
        self.transaction_type = transaction_type
        self.transaction_status = transaction_status
        self.created_at = created_at
        self.available_balance_before = Decimal("10000")


def test_build_features_uses_database_history_values():

    current_time = datetime.utcnow()

    history = [
        DummyTransaction(
            Decimal("1000"),
            TransactionType.CREDIT,
            TransactionStatus.SUCCESS,
            current_time
        ),
        DummyTransaction(
            Decimal("500"),
            TransactionType.DEBIT,
            TransactionStatus.SUCCESS,
            current_time - timedelta(days=10)
        ),
        DummyTransaction(
            Decimal("300"),
            TransactionType.DEBIT,
            TransactionStatus.FAILED,
            current_time - timedelta(days=20)
        )
    ]

    transaction = DummyTransaction(
        Decimal("250"),
        TransactionType.DEBIT,
        TransactionStatus.PENDING,
        current_time
    )

    features = MLFeatureBuilder.build_features(
        transaction,
        None,
        history=history
    )

    assert features["Monthly_Income"] == 1000.0
    assert features["Average_Transaction_Amount"] == 600.0
    assert features["Transaction_Frequency"] == 3.0
    assert features["Failed_Transactions"] == 1
