# 🏦 AI Banking System - Backend Service

This directory contains the Flask REST API backend, SQLAlchemy ORM models, Marshmallow schemas, and hybrid AI/ML fraud detection services.

---

## 🚀 Quick Start

1. **Virtual Environment**:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\Activate.ps1
   # Linux/macOS:
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env` and set your `DATABASE_URL` and `GEMINI_API_KEY`:
   ```bash
   copy .env.example .env
   ```

4. **Start the Server**:
   ```bash
   python run.py
   ```
   Server will start on `http://127.0.0.1:5000`.

---

## 📚 Documentation
- For full system setup and end-to-end testing instructions, see the [Root README.md](../README.md).
- For an in-depth breakdown of the backend architecture, design patterns, and AI pipeline, see [BACKEND_TEACHING_GUIDE.md](BACKEND_TEACHING_GUIDE.md).
