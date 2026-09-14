# 🚀 Comprehensive Backend Architecture & Teaching Guide
## AI Banking & Transaction Intelligence System

> **Target Audience:** Computer Science & Software Engineering Students  
> **Topic:** Full-Stack Enterprise Banking Backend Architecture, Modular Design Patterns, REST API Development, Database ORM, Security & Real-Time AI/ML Integration.

---

## 📋 Table of Contents
1. [Executive System Overview](#1-executive-system-overview)
2. [Architectural Pattern: Controller-Service-Repository](#2-architectural-pattern-controller-service-repository)
3. [Backend Directory Map](#3-backend-directory-map)
4. [Application Core & Entry Points](#4-application-core--entry-points)
5. [Database Models Layer (`app/models/`)](#5-database-models-layer-appmodels)
6. [Schema Validation Layer (`app/schemas/`)](#6-schema-validation-layer-appschemas)
7. [Routing & Presentation Layer (`app/routes/`)](#7-routing--presentation-layer-approutes)
8. [Controllers Layer (`app/controllers/`)](#8-controllers-layer-appcontrollers)
9. [Business Services Layer (`app/services/`)](#9-business-services-layer-appservices)
10. [AI & Machine Learning Engine (`app/ai/`)](#10-ai--machine-learning-engine-appai)
11. [Configuration, Utilities & Diagnostics](#11-configuration-utilities--diagnostics)
12. [End-to-End Request Walkthroughs](#12-end-to-end-request-walkthroughs)
13. [Key Student Takeaways & Design Principles](#13-key-student-takeaways--design-principles)

---

## 1. Executive System Overview

The **AI Banking & Transaction Intelligence System** is an enterprise-grade banking backend built with Python and Flask. Unlike conventional banking backends that only store records and move money, this system embeds **real-time Machine Learning and Artificial Intelligence** directly into the transaction workflow.

```
       +-----------------------------------------------------------------------+
       |                           Frontend (React.js)                         |
       +-----------------------------------------------------------------------+
                                           |  HTTP / REST (JSON)
                                           v
       +-----------------------------------------------------------------------+
       |                           Backend Entry (run.py)                      |
       |                   Flask Application Factory (app/__init__.py)        |
       +-----------------------------------------------------------------------+
                                           |
    +------------------+-------------------+-------------------+-------------------+
    |                  |                   |                   |                   |
    v                  v                   v                   v                   v
+--------+       +------------+     +--------------+    +--------------+    +---------------+
| Auth   |       | Accounts   |     | Transactions |    | AI Engine    |    | Security      |
| Routes |       | Routes     |     | Routes       |    | Routes       |    | & Alerts      |
+--------+       +------------+     +--------------+    +--------------+    +---------------+
    |                  |                   |                   |                   |
    v                  v                   v                   v                   v
+--------+       +------------+     +--------------+    +--------------+    +---------------+
| Auth   |       | Account    |     | Transaction  |    | AI & ML      |    | Security      |
| Service|       | Service    |     | Service      |    | Services     |    | Service       |
+--------+       +------------+     +--------------+    +--------------+    +---------------+
    |                  |                   |                   |                   |
    +------------------+---------+---------+-------------------+-------------------+
                                 |
                                 v
                 +-------------------------------+
                 |  PostgreSQL Database (ORM)    |
                 +-------------------------------+
```

### Key Technical Specifications
- **Core Framework:** Python 3.10+, Flask
- **Database & ORM:** PostgreSQL / SQLite via Flask-SQLAlchemy (SQLAlchemy ORM)
- **Database Version Control:** Flask-Migrate (Alembic)
- **Authentication & Security:** JWT (Flask-JWT-Extended), Password Hashing (Flask-Bcrypt)
- **Machine Learning Stack:** Scikit-Learn (Random Forest Classification), Joblib, Pandas, NumPy
- **Generative AI Stack:** Google Gemini API (`google-generativeai`)
- **Email Infrastructure:** SMTP (Gmail TLS/SSL)

---

## 2. Architectural Pattern: Controller-Service-Repository

To teach clean software architecture, this repository follows the **Layered Architecture (Separation of Concerns)** pattern:

```
[ HTTP Request ] ──> [ ROUTE ] ──> [ CONTROLLER ] ──> [ SERVICE ] ──> [ MODEL / DB ]
                                                             │
                                                             └──> [ AI ENGINE ]
```

1. **Routes (`app/routes/`)**: Define REST API endpoints and HTTP methods (GET, POST, PUT, DELETE). They do zero business logic.
2. **Controllers (`app/controllers/`)**: Parse HTTP payloads, validate headers/JWT tokens, pass clean data to services, and format HTTP responses (status code, JSON payload).
3. **Services (`app/services/`)**: Contain all business rules, database transaction commits/rollbacks, calculations, and calls to AI/ML engines.
4. **Models (`app/models/`)**: Define database table structures, relationships, indexes, and field data types using SQLAlchemy.
5. **AI Engine (`app/ai/`)**: Encapsulates ML model inference, feature engineering pipelines, credit scoring, and Gemini LLM prompt orchestration.

---

## 3. Backend Directory Map

```
Backend/
├── run.py                        # Main WSGI runner entry point
├── test_email.py                 # SMTP diagnostic & simulation tool
├── test_fraud.py                 # Fraud analyzer diagnostic script
├── requirements.txt              # Python dependencies manifest
├── credit_model/                 # ML Training Notebooks & Joblib Artifacts
│   ├── credit_score_dataset.csv
│   ├── credit_score_model.joblib
│   └── credit_score_prediction_colab.ipynb
├── migrations/                   # Database Migration Scripts (Alembic)
└── app/                          # Main Application Package
    ├── __init__.py               # Application Factory (create_app)
    ├── extensions.py             # Flask Extension Singletons
    ├── config/                   # Configuration Management
    │   └── config.py
    ├── models/                   # SQLAlchemy Database Entities (11 files)
    ├── schemas/                  # Marshmallow Request/Response Schemas (7 files)
    ├── routes/                   # Flask REST API Blueprints (15 files)
    ├── controllers/              # HTTP Request/Response Handlers (13 files)
    ├── services/                 # Core Business Logic Services (15 files)
    ├── ai/                       # AI/ML Detection & Copilot Engines (15 files)
    └── utils/                    # Utility Functions & File Handlers
```

---

## 4. Application Core & Entry Points

### 📄 `run.py`
- **Purpose:** Entry point executed to run the backend server (`python run.py`).
- **How it works:** Imports `create_app` from `app`, initializes `app`, and calls `app.run(host="0.0.0.0", port=5000)`.

### 📄 `app/__init__.py`
- **Purpose:** Implements the **Flask Application Factory Pattern** (`create_app()`).
- **Responsibilities:**
  1. Loads configuration from `Config` (`app/config/config.py`).
  2. Binds Flask extensions (`db`, `migrate`, `jwt`, `bcrypt`, `cors`) to the app.
  3. Registers JWT error handlers (`invalid_token_callback`, `unauthorized_callback`, `expired_callback`).
  4. Configures a global exception logger for server-side debugging.
  5. Registers all 11 API Blueprints with their URL prefixes (`/api/v1/auth`, `/api/v1/accounts`, `/api/v1/transactions`, `/api/v1/security`, etc.).
  6. Auto-creates database tables using `db.create_all()` inside app context.

### 📄 `app/extensions.py`
- **Purpose:** Centralized initialization of Flask extensions to avoid circular dependency imports.
- **Contents:**
  - `db = SQLAlchemy()`
  - `migrate = Migrate()`
  - `jwt = JWTManager()`
  - `bcrypt = Bcrypt()`
  - `cors = CORS()`

### 📄 `app/config/config.py`
- **Purpose:** Reads configuration variables from environment files (`.env`) via `python-dotenv`.
- **Key Settings:** `SECRET_KEY`, `SQLALCHEMY_DATABASE_URI`, `JWT_SECRET_KEY`, `GEMINI_API_KEY`, `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`.

---

## 5. Database Models Layer (`app/models/`)

The database model layer defines the relational schema using SQLAlchemy ORM.

| File | Entity / Table Name | Purpose & Primary Fields |
|---|---|---|
| `base_model.py` | `BaseModel` | Abstract base class with auto-generated UUID primary keys (`id`), `created_at`, and `updated_at` timestamps. |
| `user.py` | `users` | User credentials & profile (`full_name`, `email`, `mobile_number`, `government_id`, `password`, `role` [CUSTOMER/EMPLOYEE], `is_active`). |
| `bank_account.py` | `bank_accounts` | Financial accounts (`account_number`, `account_type`, `balance`, `currency`, `ifsc_code`, `status` [ACTIVE/FROZEN/LOCKED]). |
| `transaction.py` | `transactions` | Core financial ledger (`sender_account_id`, `receiver_account_id`, `amount`, `transaction_type` [DEPOSIT/WITHDRAWAL/TRANSFER], `risk_score`, `is_fraud`, `status`). |
| `security_incident.py` | `security_incidents` | Security threats & lockdown logs (`user_id`, `threat_level` [LOW/MEDIUM/HIGH/CRITICAL], `incident_type`, `description`, `ip_address`, `status`). |
| `fraud_report.py` | `fraud_reports` | Detailed AI fraud flags (`transaction_id`, `fraud_score`, `flag_reasons`, `risk_level`, `reviewed_by`). |
| `credit_score.py` | `credit_scores` | Customer credit profile (`user_id`, `credit_score` [300-850], `risk_bucket`, `payment_history_score`, `credit_utilization`). |
| `loan_recommendation.py` | `loan_recommendations` | Pre-approved loan offers (`user_id`, `loan_type`, `recommended_amount`, `interest_rate`, `tenure_months`, `eligibility_score`). |
| `notification.py` | `notifications` | In-app user notifications (`user_id`, `title`, `message`, `type` [SECURITY/TRANSACTION/ALERT], `is_read`). |
| `uploaded_statement.py` | `uploaded_statements` | Document uploads for AI OCR parsing (`user_id`, `filename`, `file_path`, `parsed_summary`, `status`). |
| `chat_history.py` | `chat_histories` | Conversation history for the Gemini AI Banking Assistant (`user_id`, `role` [user/model], `message`). |

---

## 6. Schema Validation Layer (`app/schemas/`)

The schema layer uses validation classes to ensure data sent by clients is clean before processing:
- **`auth_schema.py`**: Validates registration payloads (email format, strong password requirements, government ID format) and login input.
- **`transaction_schema.py`**: Validates transaction amounts (must be positive), account numbers, and currency types.
- **`account_schema.py`**: Validates new account creation parameters.
- **`notification_schema.py`**: Serializes notification instances into clean JSON.
- **`statement_schema.py`**: Validates uploaded file formats (PDF/PNG) and size limits.
- **`onboarding_schema.py`**: Validates customer KYC onboarding attributes.

---

## 7. Routing & Presentation Layer (`app/routes/`)

Flask Blueprints group endpoints logically by resource. Every route file maps URLs to specific controller functions.

```python
# Example from app/routes/transaction_routes.py
@transaction_bp.route("/transfer", methods=["POST"])
@jwt_required()
def transfer_funds():
    return TransactionController.transfer_funds()
```

| Blueprint Route File | Base URL Prefix | Key REST Endpoints |
|---|---|---|
| `auth_routes.py` | `/api/v1/auth` | `POST /register`, `POST /login`, `GET /me` |
| `account_routes.py` | `/api/v1/accounts` | `GET /`, `POST /create`, `GET /<id>/balance` |
| `transaction_routes.py` | `/api/v1/transactions` | `POST /transfer`, `POST /deposit`, `GET /history` |
| `security_routes.py` | `/api/v1/security` | `GET /incidents`, `POST /lockdown`, `POST /test-alert-email` |
| `credit_routes.py` | `/api/v1/credit` | `GET /score`, `POST /predict` |
| `loan_routes.py` | `/api/v1/loans` | `GET /recommendations`, `POST /apply` |
| `chatbot_routes.py` | `/api/v1/chatbot` | `POST /query`, `GET /history`, `DELETE /clear` |
| `statement_routes.py` | `/api/v1/statements` | `POST /upload`, `GET /history` |
| `dashboard_routes.py` | `/api/v1/dashboard` | `GET /customer`, `GET /employee` |
| `customer_routes.py` | `/api/v1/customers` | `GET /profile`, `PUT /update` |
| `onboarding_routes.py` | `/api/v1/onboarding` | `POST /submit-kyc` |

---

## 8. Controllers Layer (`app/controllers/`)

Controllers act as the HTTP boundary. They perform 4 steps:
1. Extract request JSON payload / URL parameters.
2. Retrieve current user identity from `@jwt_required()` (`get_jwt_identity()`).
3. Call the relevant business service.
4. Return a structured JSON response with standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `500 Server Error`).

---

## 9. Business Services Layer (`app/services/`)

The services layer is the heart of backend business logic.

```
                  +-----------------------------------+
                  |      TransactionService           |
                  +-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
          v                         v                         v
+------------------+      +------------------+      +-------------------+
|  Check Balances  |      | Run AI Fraud     |      |  SecurityService  |
|  & Deduct/Credit |      | Detection Model  |      |  (If Fraud: Alert |
+------------------+      +------------------+      |   & Email User)   |
                                                    +-------------------+
```

### Key Services Explained:
1. **`auth_service.py`**: Handles user registration, password verification with `bcrypt.check_password_hash()`, JWT token generation (`create_access_token()`), and user profile updates.
2. **`transaction_service.py`**: Executes fund transfers with strict database atomicity (`db.session.commit() / db.session.rollback()`). Before finalizing transfers, it invokes `AiFraudAnalyzer` to score the transaction.
3. **`security_service.py`**: Logs security incidents, locks compromised accounts automatically when critical threats occur, and dispatches rich HTML alert emails via SMTP (configured with Gmail).
4. **`credit_service.py`**: Calls the Credit ML prediction engine to calculate credit scores and store historical scores.
5. **`dashboard_service.py`**: Aggregates account metrics, total spending, recent transactions, and risk scores into unified dashboard payloads.
6. **`chatbot_service.py`**: Coordinates communication with Google Gemini API and stores user/assistant messages in `chat_histories`.

---

## 10. AI & Machine Learning Engine (`app/ai/`)

The backend includes a dedicated AI/ML module with pre-trained models and prompt engineering.

```
                             +-----------------------+
                             |      app/ai/          |
                             +-----------------------+
                                         |
     +-------------------+---------------+---------------+-------------------+
     |                   |                               |                   |
     v                   v                               v                   v
+------------------+   +-----------------------+   +------------------+   +-------------------+
| Fraud Detection  |   | Credit Score Predict  |   | Loan Recommender |   | Gemini AI Copilot |
| Random Forest    |   | Random Forest/XGBoost |   | ML Matchmaker    |   | Prompt Engine     |
+------------------+   +-----------------------+   +------------------+   +-------------------+
```

### 1. Fraud Detection Subsystem
- **`fraud_detection.py` & `ai_fraud_analyzer.py`**:
  - Uses a trained **Random Forest Classifier** (`fraud_detection_model.pkl`).
  - Evaluates features engineered by `ml_feature_builder.py` (e.g., transaction amount, time delta, location velocity, account age, transaction frequency).
  - Outputs a **Risk Score** (0.0 to 1.0) and **Risk Category** (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - Automatically triggers account freezing and security alerts when a transaction is flagged as `CRITICAL`.
- **`transaction_monitor.py`**: Performs real-time velocity monitoring to detect rapid sequential transfers.

### 2. Credit Score Prediction Subsystem
- **`credit_score_prediction.py`**:
  - Uses ML models located in `credit_model/credit_score_model.joblib`.
  - Analyzes attributes such as annual income, debt ratio, credit history length, payment delays, and total credit lines.
  - Returns calculated credit score (300 to 850) and categorizes risk into `POOR`, `FAIR`, `GOOD`, `EXCELLENT`.

### 3. Loan Recommendation Engine
- **`loan_recommender.py` & `loan_recommendation.py`**:
  - Evaluates user credit score, income, and existing debt to calculate maximum loan eligibility, interest rates, and recommended EMI options for Home, Auto, and Personal loans.

### 4. Conversational AI Copilot ("AI BankIQ Assistant")
- **`ai_banking_assistant.py`, `ai_service.py`, `ai_prompt.py`**:
  - Leverages Google Gemini LLM (`gemini-1.5-flash` / `gemini-pro`).
  - Injects dynamic user context (user name, total balance, recent transactions, credit score) into system prompts so the LLM responds accurately to user inquiries ("How much did I spend this week?").

---

## 11. Configuration, Utilities & Diagnostics

- **`app/utils/file_upload.py`**: Validates file types (PDF, PNG, JPG) and saves bank statement uploads securely.
- **`test_email.py`**: Standalone diagnostic CLI tool for testing SMTP connectivity and email template rendering. Run with:
  ```bash
  python test_email.py
  ```
- **`test_fraud.py`**: Standalone test script for validating the Random Forest fraud analyzer against sample transaction inputs.

---

## 12. End-to-End Request Walkthroughs

### 🔄 Walkthrough 1: Money Transfer with Real-Time Fraud Analysis

```
1. Customer clicks "Send Money" ($5,000 to Account #9876543210).
2. Frontend sends POST /api/v1/transactions/transfer with JWT Header.
3. transaction_routes.py receives request -> forwards to TransactionController.transfer_funds().
4. TransactionController validates JWT identity -> calls TransactionService.transfer_funds().
5. TransactionService verifies sender account has sufficient balance ($5,000+).
6. TransactionService passes payload to AiFraudAnalyzer.analyze_transaction().
7. AiFraudAnalyzer feeds transaction features to Random Forest model (fraud_detection_model.pkl).
8. Model evaluates risk:
   - If Risk Score < 0.70: Transaction marked SAFE -> Sender balance debited $5,000, Receiver credited -> DB Commit -> Return 200 OK.
   - If Risk Score >= 0.70 (HIGH/CRITICAL): 
     a. Transaction status set to BLOCKED.
     b. SecurityService.create_incident() logs HIGH threat incident.
     c. SecurityService.send_alert_email() dispatches immediate SMTP notification to user.
     d. DB Commit -> Return 400 Fraud Detected.
```

---

## 13. Key Student Takeaways & Design Principles

When explaining this architecture to students, highlight these key design principles:

1. **Separation of Concerns:** Never put SQL queries in route files; never put HTTP response formatting in service logic.
2. **Stateless Authentication:** JWT tokens allow the server to authenticate requests without storing session state in memory.
3. **Database Atomicity:** Financial transfers must wrap balance updates in `try...except` blocks with explicit `db.session.rollback()` on error.
4. **Defensive AI Integration:** AI model inference should guide decision-making, but fallback rules must exist if ML models or external APIs (like Gemini) fail.
5. **Environment Security:** API keys, database credentials, and secret keys must **never** be hardcoded — always use `.env` configuration files.

---
*Created for CS / Software Engineering Backend & AI Teaching Curriculum.*
