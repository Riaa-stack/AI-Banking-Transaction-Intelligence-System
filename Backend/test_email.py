"""
Diagnostic and Test Script for Security Lockdown Alert Email.
Run with:
    venv\Scripts\python test_email.py
"""

import os
import sys
from dotenv import load_dotenv

# Reconfigure stdout for utf-8 if supported
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure Backend directory is in path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

load_dotenv(os.path.join(BASE_DIR, ".env"))

from app.config.config import Config
from app.services.security_service import SecurityService

def main():
    print("=" * 65)
    print("AI BankIQ -- Security Lockdown Alert Email Diagnostic Tool")
    print("=" * 65)

    recipient = "aniruddhaakhare2004@gmail.com"
    server = getattr(Config, "MAIL_SERVER", "smtp.gmail.com")
    port = int(getattr(Config, "MAIL_PORT", 587))
    user = getattr(Config, "MAIL_USERNAME", None)
    pwd = getattr(Config, "MAIL_PASSWORD", None)

    print(f"SMTP Server:   {server}:{port}")
    print(f"Recipient:     {recipient}")
    print(f"MAIL_USERNAME: {user or '(not set)'}")
    print(f"MAIL_PASSWORD: {'*' * len(pwd) if pwd else '(not set)'}")
    print("-" * 65)

    is_placeholder = (
        not user
        or not pwd
        or "your_email" in user
        or "your_email_password" in pwd
        or pwd.strip() == ""
    )

    if is_placeholder:
        print("[!] ACTION REQUIRED: Real SMTP credentials are not configured in Backend/.env.")
        print()
        print("To send real emails to aniruddhaakhare2004@gmail.com via Gmail SMTP:")
        print("1. Open your Google Account: https://myaccount.google.com/security")
        print("2. Make sure 2-Step Verification is ON.")
        print("3. In the search bar at the top, search for 'App Passwords'.")
        print("4. Create an App Name (e.g. 'AI Banking System') and click Create.")
        print("5. Copy the 16-character password generated (e.g. 'xxxx yyyy zzzz wwww').")
        print("6. Open Backend/.env and update:")
        print("     MAIL_SERVER=smtp.gmail.com")
        print("     MAIL_PORT=587")
        print(f"     MAIL_USERNAME={recipient}")
        print("     MAIL_PASSWORD=your_16_character_app_password_without_spaces")
        print("     MAIL_DEFAULT_SENDER=" + recipient)
        print("=" * 65)
        print()
        print("Testing template generation in Simulation Mode now...")
        res = SecurityService.test_incident_email(recipient=recipient)
        print("Simulation Status:", res)
        return

    print("Attempting live SMTP transmission to", recipient, "...")
    res = SecurityService.test_incident_email(recipient=recipient)
    print("-" * 65)
    if res.get("success"):
        print("[SUCCESS] Security Alert Email has been delivered to", recipient)
        print(res.get("message"))
    else:
        print("[FAILED] SMTP Server returned an error:")
        print(res.get("message"))
    print("=" * 65)

if __name__ == "__main__":
    main()
