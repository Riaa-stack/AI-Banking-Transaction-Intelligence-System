# AI Banking & Transaction Intelligence — Synthetic Dataset Generator

This project generates a realistic, internally-consistent **synthetic banking
dataset** (20,000–50,000 customers, 59 columns) suitable for training ML
models for credit scoring, loan recommendation, fraud detection, transaction
monitoring, financial health prediction, spending analysis, and an AI
banking assistant.

## Files

| File                  | Purpose                                              |
|------------------------|-------------------------------------------------------|
| `dataset_generator.py` | Main script — generates `banking_dataset.csv`         |
| `requirements.txt`     | Python dependencies                                   |
| `INSTRUCTIONS.md`      | This file                                              |

## 1. Setup

It's recommended to use a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## 2. Run the generator

Default run (30,000 records):

```bash
python dataset_generator.py
```

Custom record count (must be between 20,000 and 50,000), custom seed, and
custom output path:

```bash
python dataset_generator.py --n_records 45000 --seed 123 --out banking_dataset.csv
```

### Command-line arguments

| Argument       | Default               | Description                                  |
|-----------------|------------------------|-----------------------------------------------|
| `--n_records`   | 30000                  | Number of customer rows to generate (20k–50k) |
| `--seed`        | 42                     | Random seed, for reproducible output          |
| `--out`         | `banking_dataset.csv`  | Output CSV file path                          |

## 3. Output

Running the script produces `banking_dataset.csv` in the current directory,
containing one row per customer across 59 columns spanning:

- **Customer details** — demographics, occupation, employment, location
- **Account details** — bank, account type/age, balance
- **Financial details** — income, expenses, savings, debt, investments, insurance
- **Transaction details** — monthly transaction volume/mix across channels, failed transactions
- **Credit features** — utilization, credit history, payment history, credit mix
- **Loan features** — existing loans, eligibility, max eligible loan, interest rate
- **Fraud features** — fraud flag (~3–5% of records), fraud probability, risk level
- **AI-derived features** — savings/expense ratios, income stability, financial health score, risk profile
- **Targets** — `Credit_Score` (300–900), `Loan_Eligibility`, `Fraud_Flag`, `Risk_Level`

The script automatically validates the dataset before *and* after writing
the CSV (uniqueness of `Customer_ID`, zero missing values on re-read, valid
ranges for `Credit_Score` and `Financial_Health_Score`, and a fraud rate
between 2–7%). If any check fails, the script raises an error rather than
producing a bad file.

## 4. Notes on realism / data logic

- Income is driven by education, employment status and an age-experience
  curve; expenses and savings are derived from income with realistic noise.
- Existing debt, credit utilization and payment history jointly drive
  `Credit_Score` (clipped to 300–900).
- Loan eligibility depends on credit score, debt-to-income ratio,
  employment status and income; `Maximum_Eligible_Loan` scales with annual
  income and a credit-score factor.
- Fraud is rare (~3–5% of customers) and drives `Fraud_Probability`,
  `Risk_Level` and `Suspicious_Transaction_Count` consistently.
- `Financial_Health_Score` (0–100) blends credit score, savings ratio, debt
  ratio and fraud probability.

## 5. Regenerating with a different size/seed

Because generation is vectorized with NumPy, even 50,000 records generate
in a few seconds. Re-run with a different `--seed` to get a different (but
equally consistent) synthetic population, or increase `--n_records` up to
50,000.
