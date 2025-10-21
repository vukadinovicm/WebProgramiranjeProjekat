"""tx reshape: title nullable, amount numeric, date datetime

Revision ID: a2bc6b6081e0
Revises: 3ee54d5d6a2c
Create Date: 2025-10-19 01:56:49.980432
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a2bc6b6081e0"
down_revision = "3ee54d5d6a2c"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()

    # 1) Kreiraj privremenu tabelu sa NOVOM šemom (title nullable, amount Numeric, date DateTime)
    op.create_table(
        "transaction_tmp",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("category.id"), nullable=False),
        sa.Column("type", sa.String(length=10), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=True),         # <- nullable
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),           # <- Numeric(14,2)
        sa.Column("date", sa.DateTime(), nullable=False),                 # <- DateTime
        sa.Column("note", sa.String(length=255), nullable=True),
    )

    # 2) Prespi postojeće podatke u novu tabelu
    # Napomena: SQLite može čuvati 'date' kao TEXT/INTEGER; obradimo obe varijante.
    bind.execute(
        sa.text(
            """
            INSERT INTO transaction_tmp (id, user_id, category_id, type, title, amount, date, note)
            SELECT
                id,
                user_id,
                category_id,
                type,
                title,
                CAST(amount AS NUMERIC),                                  -- Float -> Numeric
                CASE
                    WHEN typeof(date) = 'integer' THEN datetime(date, 'unixepoch')  -- epoch -> datetime
                    ELSE date
                END,
                note
            FROM "transaction"
            """
        )
    )

    # 3) Zameni staru tabelu novom
    op.drop_table("transaction")
    op.rename_table("transaction_tmp", "transaction")

    # 4) Ponovo napravi korisne indekse (pošto se pri rekreaciji gube)
    op.create_index("ix_transaction_user_id", "transaction", ["user_id"], unique=False)
    op.create_index("ix_transaction_category_id", "transaction", ["category_id"], unique=False)
    op.create_index("ix_transaction_date", "transaction", ["date"], unique=False)


def downgrade():
    bind = op.get_bind()

    # 1) Napravi tabelu sa STAROM šemom (title NOT NULL, amount Float, date Date)
    op.create_table(
        "transaction_old",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("category.id"), nullable=False),
        sa.Column("type", sa.String(length=10), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),        # <- NOT NULL
        sa.Column("amount", sa.Float(), nullable=False),                  # <- Float
        sa.Column("date", sa.Date(), nullable=False),                     # <- Date
        sa.Column("note", sa.String(length=255), nullable=True),
    )

    # 2) Prespi podatke nazad (DateTime -> Date; Numeric -> Float; title mora biti NOT NULL)
    bind.execute(
        sa.text(
            """
            INSERT INTO transaction_old (id, user_id, category_id, type, title, amount, date, note)
            SELECT
                id,
                user_id,
                category_id,
                type,
                COALESCE(title, ''),                -- jer u staroj šemi title je NOT NULL
                CAST(amount AS FLOAT),              -- Numeric -> Float
                DATE(date),                         -- DateTime -> Date
                note
            FROM "transaction"
            """
        )
    )

    # 3) Zameni novu tabelu starom
    op.drop_table("transaction")
    op.rename_table("transaction_old", "transaction")

    # 4) Vrati indekse
    op.create_index("ix_transaction_user_id", "transaction", ["user_id"], unique=False)
    op.create_index("ix_transaction_category_id", "transaction", ["category_id"], unique=False)
    op.create_index("ix_transaction_date", "transaction", ["date"], unique=False)
