# 🏦 AI-Powered Banking & Transaction Intelligence System

An enterprise-grade, intelligent banking platform featuring **real-time AI/ML fraud detection**, dynamic credit scoring, loan recommendations, automated KYC onboarding, and an interactive GenAI banking assistant.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Local Development Setup](#-local-development-setup)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Database Setup (PostgreSQL)](#2-database-setup-postgresql)
  - [3. Backend Setup (Flask & AI/ML)](#3-backend-setup-flask--aiml)
  - [4. Frontend Setup (React + Vite)](#4-frontend-setup-react--vite)
- [How to Test the System](#-how-to-test-the-system)
  - [Test 1: User Registration & Login](#test-1-user-registration--login)
  - [Test 2: Normal Transfer (Low Risk)](#test-2-normal-transfer-low-risk)
  - [Test 3: Transfer to Trigger Fraud Detection](#test-3-transfer-to-trigger-fraud-detection)
  - [Test 4: Inspect Fraud in Employee / Security Dashboard](#test-4-inspect-fraud-in-employee--security-dashboard)
- [Fraud Detection Engine Architecture](#-fraud-detection-engine-architecture)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🌟 Overview

Traditional banking platforms only process transactions and store records. This system incorporates **intelligent transaction monitoring** where every transaction is evaluated in milliseconds across three defense layers:
1. **Rule-Based Engine**: Real-time behavioral and threshold anomaly checks.
2. **Machine Learning Model**: XGBoost model trained on transactional fraud datasets.
3. **Google Gemini GenAI**: Generates contextual explanations, risk factor analysis, and executive recommendations.

---

## 🏗 System Architecture

```
                    +--------------------------------------------+
                    |           React.js + Vite Frontend         |
                    |   (Customer Dashboard, Operations, Admin)  |
                    +--------------------------------------------+
                                          |
                                    REST APIs (JSON)
                                          |
                                          v
                    +--------------------------------------------+
                    |          Flask Application Factory         |
                    |         (JWT Auth, Marshmallow ORM)        |
                    +--------------------------------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                 |                                 |
        v                                 v                                 v
+----------------+              +-------------------+              +----------------+
| PostgreSQL     |              | AI / ML Engine    |              | Google Gemini  |
| Database       |              | (XGBoost + Rules) |              | GenAI (Flash)  |
+----------------+              +-------------------+              +----------------+
```

---

## 💻 Tech Stack

- **Backend**: Python 3.10+, Flask, SQLAlchemy, Marshmallow, Flask-JWT-Extended, Flask-CORS
- **AI & ML**: XGBoost, Scikit-learn, Pandas, NumPy, RapidFuzz, Google GenAI SDK (Gemini 2.5 Flash)
- **Frontend**: React 18, Vite, Tailwind CSS / Vanilla CSS, Lucide React, Axios
- **Database**: PostgreSQL 14+ (or MySQL / SQLite if configured)

---

## ⚙ Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Git**: [Download Git](https://git-scm.com/)
- **Python 3.10 or 3.11**: [Download Python](https://www.python.org/downloads/)
- **Node.js (v18+) & npm**: [Download Node.js](https://nodejs.org/)
- **PostgreSQL (v14+)**: [Download PostgreSQL](https://www.postgresql.org/download/)
- **Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

---

## 🛠 Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/Riaa-stack/AI-Banking-Transaction-Intelligence-System.git
cd AI-Banking-Transaction-Intelligence-System
```

---

### 2. Database Setup (PostgreSQL)

1. Open your PostgreSQL terminal (`psql`) or pgAdmin.
2. Create a new database named `ai_banking_db`:

```sql
CREATE DATABASE ai_banking_db;
```

---

### 3. Backend Setup (Flask & AI/ML)

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`:
     - **Windows**: `copy .env.example .env`
     - **Linux/macOS**: `cp .env.example .env`
   - Open `.env` and set your credentials:
     ```ini
     DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/ai_banking_db
     SECRET_KEY=your_super_secret_flask_key
     JWT_SECRET_KEY=your_super_secret_jwt_key_at_least_32_chars
     GEMINI_API_KEY=your_google_gemini_api_key
     UPLOAD_FOLDER=uploads
     MAX_CONTENT_LENGTH=52428800
     ```

5. Run the Backend server:
   ```bash
   python run.py
   ```
   > ℹ️ *The backend will automatically initialize all database tables upon startup (`db.create_all()`).*  
   > *Server runs at:* **`http://127.0.0.1:5000`**

---

### 4. Frontend Setup (React + Vite)

1. Open a new terminal window and navigate to `Frontend`:
   ```bash
   cd Frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment:
   - Verify `.env.example` or create `.env.local` if needed:
     ```ini
     VITE_API_BASE_URL=http://127.0.0.1:5000/api/v1
     ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   > *Frontend runs at:* **`http://localhost:5173`**

---

## 🧪 How to Test the System

Follow this step-by-step walkthrough to test the complete user lifecycle and fraud detection mechanisms.

### Test 1: User Registration & Login

1. Open your browser and navigate to **`http://localhost:5173`**.
2. Click **Get Started** or navigate to the Auth page.
3. Switch to the **Register** tab:
   - **Full Name**: `Aarav Sharma`
   - **Email**: `aarav@example.com`
   - **Phone**: `9876543210`
   - **Password**: `SecurePass123!`
   - **Account Type**: `SAVINGS`
4. Click **Create Account**.
5. Once registered, log in with your email and password.
6. Upon first login, complete your profile / account details. Your account will be assigned an account number and an initial balance (or deposit funds via operations).

---

### Test 2: Normal Transfer (Low Risk)

1. In the customer dashboard, navigate to **Transfer Money / Send Money**.
2. Enter legitimate transfer details:
   - **Recipient Name**: `Rohan Verma`
   - **Recipient Account Number**: `987654321098`
   - **Bank Name**: `HDFC Bank`
   - **IFSC Code**: `HDFC0001234`
   - **Transfer Method**: `UPI` or `IMPS`
   - **Amount**: `₹500`
   - **Remarks**: `Lunch payment`
3. Click **Transfer Now**.
4. **Expected Result**:
   - Transaction status: `SUCCESS`
   - Fraud Risk Score: `Low Risk (< 35)`
   - Balance is updated immediately.
   - Transaction shows up in **Transaction History**.

---

### Test 3: Transfer to Trigger Fraud Detection

The system uses a hybrid detection engine. You can trigger fraud flags and blocks through specific behavioral anomalies:

#### 🚨 Scenario A: Trigger "Blocked" Fraud Status (Score ≥ 80)
1. Ensure your account balance is e.g. `₹100,000`.
2. Initiate a transfer with the following attributes:
   - **Amount**: `₹99,000` *(Triggers near-maximum limit `+20` and >90% balance depletion `+20`)*
   - **Recipient Name**: `Unknown Traders Inc`
   - **Bank Name**: `State Bank of India`
   - **IFSC Code**: `SBIN0001234`
   - **Transfer Method**: `RTGS` or `UPI`
3. Click **Send Money**.
4. **Expected Result**:
   - The transaction is evaluated by both XGBoost and the Rule Engine.
   - Combined risk score hits `≥ 80`.
   - Transaction status is marked as **`BLOCKED`**.
   - The funds are **refunded back** to the sender account atomically.
   - The user receives an immediate alert detailing that the transaction was blocked for security reasons.

#### ⚠️ Scenario B: Trigger "High Risk" Flag (Score 60 - 79)
1. Transfer an amount that is **3× higher** than your historical average or depletes your remaining balance to **under ₹500**.
2. **Expected Result**:
   - The transaction is flagged (`is_flagged = true`, status `High Risk`).
   - Generates an automated fraud report with Gemini AI explanation.

---

### Test 4: Inspect Fraud in Employee / Security Dashboard

1. Log in with an employee or administrative account (or view the Security tab in navigation).
2. Open **Security & Intelligence / Fraud Monitoring**:
   - View the flagged / blocked transactions in real time.
   - Click on the blocked transaction to view:
     - **ML Fraud Probability** (percentage from XGBoost)
     - **Rule-based penalties** (e.g. `More than 90% balance transferred`, `Amount near limit`)
     - **Gemini GenAI Analysis** (executive summary, risk breakdown, and recommendations).

---

## 🧠 Fraud Detection Engine Architecture

The hybrid fraud detection pipeline evaluates every transaction via `FraudDetector.analyze()`:

| Layer | Component | Weight | Responsibility |
| :--- | :--- | :--- | :--- |
| **Layer 1** | **Deterministic Rules Engine** | 55% | Evaluates velocity, balance ratio (>90%), high absolute limit, low remaining balance (<₹500), and credit scores. |
| **Layer 2** | **XGBoost ML Classifier** | 45% | Pretrained on historical banking fraud dataset (`fraud_detection_dataset.csv`), evaluating 12+ feature dimensions. |
| **Layer 3** | **Google Gemini 2.5 Flash** | Qualitative | Explains the statistical decision in plain English, citing specific transaction indicators and recommending action. |

### Classification Tiers:
- **Score ≥ 80**: `Blocked` — Immediate transaction reversal and balance restoration.
- **Score 60 - 79**: `High Risk` — Transaction flagged for manual fraud officer review.
- **Score 35 - 59**: `Medium Risk` — Monitored transaction; customer confirmation prompted.
- **Score < 35**: `Low Risk` — Legitimate transaction executed seamlessly.

---

## 📁 Project Structure

```
AI_FRAUD_BANKING_SYSTEM/
├── .gitignore                      # Git ignore file for secrets, venv, and build output
├── README.md                       # Main project setup & testing documentation
├── Backend/
│   ├── .env.example                # Template for backend environment variables
│   ├── BACKEND_TEACHING_GUIDE.md   # Deep architectural guide for students & developers
│   ├── requirements.txt            # Python dependencies
│   ├── run.py                      # Flask entry point
│   ├── app/
│   │   ├── ai/                     # Fraud ML model, Gemini assistant, loan recommender
│   │   ├── config/                 # Flask and database configuration
│   │   ├── controllers/            # Route controllers
│   │   ├── models/                 # SQLAlchemy database models
│   │   ├── routes/                 # API endpoint Blueprints
│   │   ├── schemas/                # Marshmallow validation schemas
│   │   └── services/               # Business logic & atomic transaction execution
│   └── migrations/                 # Alembic database migrations
├── Dataset/                        # Datasets & synthetic data generator
└── Frontend/
    ├── .env.example                # Frontend environment template
    ├── package.json                # Node dependencies
    ├── vite.config.ts              # Vite configuration
    └── src/
        ├── components/             # Reusable UI components & modals
        ├── context/                # BankingContext state management
        ├── lib/                    # API client (Axios)
        └── pages/                  # Customer & Employee views
```

---

## 🤝 Support & Contribution

If you encounter any issues:
1. Ensure PostgreSQL is running on `localhost:5432`.
2. Check that your `DATABASE_URL` in `Backend/.env` matches your local PostgreSQL credentials.
3. Make sure your `GEMINI_API_KEY` is valid.
4. Check backend terminal logs for detailed stack traces.
