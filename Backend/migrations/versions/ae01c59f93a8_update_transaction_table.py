"""Update transaction table

Revision ID: ae01c59f93a8
Revises: 812d3d54c4be
Create Date: 2026-07-14 12:05:08.606940

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "ae01c59f93a8"
down_revision = "812d3d54c4be"
branch_labels = None
depends_on = None


def upgrade():

    # Create enum type first
    transaction_type_enum = postgresql.ENUM(
        "DEBIT",
        "CREDIT",
        name="transactiontype",
        create_type=True
    )

    transaction_type_enum.create(op.get_bind(), checkfirst=True)

    with op.batch_alter_table("transactions", schema=None) as batch_op:

        batch_op.add_column(
            sa.Column(
                "transaction_type",
                transaction_type_enum,
                nullable=False,
                server_default="DEBIT"
            )
        )

        batch_op.add_column(
            sa.Column(
                "receiver_ifsc",
                sa.String(length=20),
                nullable=True
            )
        )

        batch_op.add_column(
            sa.Column(
                "failure_reason",
                sa.String(length=255),
                nullable=True
            )
        )

        batch_op.add_column(
            sa.Column(
                "ai_reviewed",
                sa.Boolean(),
                nullable=True,
                server_default=sa.false()
            )
        )

        batch_op.add_column(
            sa.Column(
                "is_flagged",
                sa.Boolean(),
                nullable=True,
                server_default=sa.false()
            )
        )

        batch_op.add_column(
            sa.Column(
                "risk_score",
                sa.Float(),
                nullable=True,
                server_default="0"
            )
        )

        batch_op.add_column(
            sa.Column(
                "fraud_probability",
                sa.Float(),
                nullable=True,
                server_default="0"
            )
        )

        batch_op.add_column(
            sa.Column(
                "fraud_status",
                sa.String(length=30),
                nullable=True
            )
        )

        batch_op.add_column(
            sa.Column(
                "ai_explanation",
                sa.Text(),
                nullable=True
            )
        )

        batch_op.alter_column(
            "transaction_status",
            existing_type=postgresql.ENUM(
                "PENDING",
                "SUCCESS",
                "FAILED",
                "BLOCKED",
                name="transactionstatus"
            ),
            nullable=False
        )

        batch_op.create_index(
            "ix_transactions_receiver_account_number",
            ["receiver_account_number"],
            unique=False
        )

        batch_op.create_index(
            "ix_transactions_sender_account_id",
            ["sender_account_id"],
            unique=False
        )

        batch_op.create_index(
            "ix_transactions_transaction_status",
            ["transaction_status"],
            unique=False
        )


def downgrade():

    with op.batch_alter_table("transactions", schema=None) as batch_op:

        batch_op.drop_index("ix_transactions_transaction_status")

        batch_op.drop_index("ix_transactions_sender_account_id")

        batch_op.drop_index("ix_transactions_receiver_account_number")

        batch_op.drop_column("ai_explanation")

        batch_op.drop_column("fraud_status")

        batch_op.drop_column("fraud_probability")

        batch_op.drop_column("risk_score")

        batch_op.drop_column("is_flagged")

        batch_op.drop_column("ai_reviewed")

        batch_op.drop_column("failure_reason")

        batch_op.drop_column("receiver_ifsc")

        batch_op.drop_column("transaction_type")

    transaction_type_enum = postgresql.ENUM(
        "DEBIT",
        "CREDIT",
        name="transactiontype"
    )

    transaction_type_enum.drop(op.get_bind(), checkfirst=True)