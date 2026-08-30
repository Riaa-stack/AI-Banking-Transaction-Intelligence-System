import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from app.extensions import db
from app.models.bank_account import BankAccount, AccountStatus
from app.models.security_incident import SecurityIncident
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.config.config import Config


class SecurityService:

    @staticmethod
    def send_incident_email(
        account_number,
        incident_id,
        risk_score,
        recipient="aniruddhaakhare2004@gmail.com",
        customer_name="Valued Customer"
    ):
        """Sends a high-grade professional security lockdown alert email using configured SMTP"""
        recipient = recipient or "aniruddhaakhare2004@gmail.com"
        customer_name = customer_name or "Aniruddha Akhare"

        # Mask account number: e.g. XXXX XXXX 4521
        masked_acc = (
            f"XXXX XXXX {account_number[-4:]}"
            if len(account_number) >= 4
            else "XXXX XXXX 4521"
        )
        detection_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        subject = f"🚨 URGENT: Security Lockdown Activated for Account ending in {masked_acc[-4:]} [Ref: {incident_id}]"

        plain_body = f"""============================================================
AI BANKIQ — CRITICAL SECURITY LOCKDOWN NOTICE
Reference Incident: {incident_id}
============================================================

Dear {customer_name},

Our automated AI Neural Threat Defense System has detected anomalous 
and potentially unauthorized activity associated with your account. 
To safeguard your funds and protect your identity, an immediate protective 
SECURITY LOCKDOWN has been enforced.

INCIDENT DETAILS:
------------------------------------------------------------
• Incident Reference:  {incident_id}
• Target Account:      {masked_acc}
• Threat Severity:     CRITICAL
• Neural Risk Score:   {risk_score} / 100
• Status:              CONTAINED (Security Lockdown Active)
• Threat Vector:       Anomalous Geolocation IP & Session Pattern
• Detection Timestamp: {detection_time} UTC

AUTOMATED DEFENSIVE ACTIONS EXECUTED:
------------------------------------------------------------
[✔] Real-Time Payment Channels Frozen (UPI, IMPS, RTGS, Cards)
[✔] Active User Authentication Sessions & JWT Tokens Revoked
[✔] High-Risk Heuristic Ledger Monitoring Activated
[✔] Incident Telemetry Recorded in Bank SOC SIEM Ledger

HOW TO RESTORE YOUR ACCOUNT:
------------------------------------------------------------
1. Log in to your AI BankIQ dashboard.
2. Navigate to the Security Lockdown console.
3. Complete the 3-step identity verification & credential reset.

24/7 FRAUD & CYBER DEFENSE HOTLINE:
------------------------------------------------------------
Toll-Free Security Desk: 1800-AI-BANK (1-800-242-265)
Cyber Emergency Desk: security-desk@aibanking.demo

Confidentiality Notice: This message contains privileged security information.
If you did not authorize this action, contact our security desk immediately.
============================================================
"""

        html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b1120; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); border: 1px solid #1e293b;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 32px; border-bottom: 3px solid #dc2626;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #818cf8; margin-bottom: 4px;">
                      🛡️ AI BankIQ Cyber Threat Defense
                    </div>
                    <div style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                      Security Operations Center
                    </div>
                  </td>
                  <td align="right">
                    <span style="background: rgba(220, 38, 38, 0.2); border: 1px solid #dc2626; color: #f87171; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 5px 10px; border-radius: 9999px;">
                      Priority 1 Alert
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Emergency Alert Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 14px 32px; color: #ffffff; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px;">
              ⚠️ Critical Incident Detected &bull; Containment Active
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                Dear {customer_name},
              </h2>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #475569;">
                Our automated <strong>AI Neural Threat Defense Auditor</strong> detected anomalous activity (unauthorized geolocation vector &amp; irregular transaction attempt) linked to your account. To safeguard your financial assets and sensitive personal data, protective controls have been <span style="color: #dc2626; font-weight: 700;">activated immediately</span>.
              </p>

              <!-- Incident Details Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 24px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
                    <strong style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #475569;">
                      Security Incident Telemetry
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" border="0" cellpadding="6" cellspacing="0" width="100%" style="font-size: 13px;">
                      <tr>
                        <td width="40%" style="color: #64748b; font-weight: 500;">Incident Reference:</td>
                        <td style="color: #4f46e5; font-family: monospace; font-weight: 700; font-size: 13px;">
                          {incident_id}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 500;">Affected Account:</td>
                        <td style="color: #0f172a; font-weight: 700;">{masked_acc}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 500;">Threat Severity:</td>
                        <td>
                          <span style="background-color: #fee2e2; color: #991b1b; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">
                            🔴 CRITICAL
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 500;">Neural Risk Score:</td>
                        <td style="color: #dc2626; font-weight: 800; font-size: 14px;">
                          {risk_score} / 100
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 500;">Account Status:</td>
                        <td>
                          <span style="background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 6px;">
                            🔒 SECURITY LOCKED
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 500;">Timestamp:</td>
                        <td style="color: #334155; font-weight: 500;">{detection_time} UTC</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Protective Actions Checklist -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; margin-bottom: 12px;">
                  Automated Defensive Measures Engaged:
                </div>
                
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #334155; line-height: 1.5;">
                  <tr>
                    <td style="padding: 6px 0; vertical-align: top; width: 24px; color: #10b981; font-weight: 900;">✓</td>
                    <td style="padding: 6px 0;"><strong>Transactions Frozen:</strong> Outbound and inbound payment rails (UPI, IMPS, RTGS, Cards) suspended.</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; vertical-align: top; width: 24px; color: #10b981; font-weight: 900;">✓</td>
                    <td style="padding: 6px 0;"><strong>Active Sessions Revoked:</strong> All active mobile and web JWT tokens invalidated immediately.</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; vertical-align: top; width: 24px; color: #10b981; font-weight: 900;">✓</td>
                    <td style="padding: 6px 0;"><strong>Anomalous Vector Isolated:</strong> Suspect IP routing blocked from customer profile ledger.</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; vertical-align: top; width: 24px; color: #10b981; font-weight: 900;">✓</td>
                    <td style="padding: 6px 0;"><strong>Incident Audited:</strong> Cryptographic incident fingerprint registered in SOC compliance audit trail.</td>
                  </tr>
                </table>
              </div>

              <!-- How to Recover Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 13px; font-weight: 800; color: #166534; margin-bottom: 8px;">
                      🟢 Next Steps to Restore Your Account
                    </div>
                    <ol style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: #14532d;">
                      <li>Navigate to the <strong>Security Lockdown &amp; Recovery</strong> console on your portal.</li>
                      <li>Verify your identity using your government credential and security challenge questions.</li>
                      <li>Review recent pending transactions and reset your security passcode to restore ACTIVE status.</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:5173/customer/security-lockdown" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                      Open Security Recovery Console &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Disclaimer -->
              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                <strong>Security Reassurance:</strong> AI BankIQ will <em>never</em> ask you for your account password, MPIN, or full debit card number via email or SMS. If you did not trigger this drill, contact our 24/7 fraud desk immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <strong>AI BankIQ Banking Intelligence Systems</strong><br>
                    24/7 Security Operations Center Hotline: 1800-AI-BANK (1-800-242-265)<br>
                    Direct Fraud Desk: <a href="mailto:security-desk@aibanking.demo" style="color: #4f46e5; text-decoration: none;">security-desk@aibanking.demo</a>
                  </td>
                  <td align="right" style="vertical-align: bottom;">
                    <span style="color: #94a3b8; font-size: 10px;">Ref: {incident_id}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

        smtp_server = getattr(Config, "MAIL_SERVER", "smtp.gmail.com") or "smtp.gmail.com"
        smtp_port = int(getattr(Config, "MAIL_PORT", 587))
        smtp_user = getattr(Config, "MAIL_USERNAME", None)
        smtp_pass = getattr(Config, "MAIL_PASSWORD", None)
        smtp_use_tls = getattr(Config, "MAIL_USE_TLS", True)
        smtp_use_ssl = getattr(Config, "MAIL_USE_SSL", False)
        smtp_sender = (
            getattr(Config, "MAIL_DEFAULT_SENDER", None)
            or smtp_user
            or "security@aibanking.demo"
        )

        is_placeholder = (
            not smtp_user
            or not smtp_pass
            or "your_email" in smtp_user
            or "your_email_password" in smtp_pass
            or smtp_pass.strip() == ""
        )

        msg = MIMEMultipart("alternative")
        msg["From"] = f"AI BankIQ Security Alert <{smtp_sender}>"
        msg["To"] = recipient
        msg["Subject"] = subject
        msg.attach(MIMEText(plain_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        if is_placeholder:
            print("=" * 60)
            print("[SECURITY LOCKDOWN] ALERT EMAIL QUEUED (SIMULATION MODE)")
            print(f"To:        {recipient}")
            print(f"Customer:  {customer_name}")
            print(f"Subject:   {subject}")
            print("Notice:    MAIL_USERNAME and MAIL_PASSWORD in Backend/.env are set to placeholders.")
            print("           To receive real emails on Gmail, set your 16-character Google App Password in .env")
            print("=" * 60)
            return {
                "success": False,
                "simulated": True,
                "recipient": recipient,
                "message": (
                    "Email preview generated, but real SMTP dispatch requires valid Gmail credentials. "
                    "Please set MAIL_USERNAME and MAIL_PASSWORD (16-char Google App Password) in Backend/.env."
                )
            }

        try:
            if smtp_port == 465 or smtp_use_ssl:
                server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=15)
            else:
                server = smtplib.SMTP(smtp_server, smtp_port, timeout=15)
                if smtp_use_tls:
                    server.starttls()

            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_sender, [recipient], msg.as_string())
            server.quit()
            print(f"[OK] Security alert email dispatched successfully to {recipient}")
            return {
                "success": True,
                "simulated": False,
                "recipient": recipient,
                "message": f"Security alert email successfully delivered to {recipient}."
            }
        except Exception as e:
            err_msg = str(e)
            print(f"[ERROR] Failed to dispatch security alert email to {recipient}: {err_msg}")
            return {
                "success": False,
                "simulated": False,
                "recipient": recipient,
                "message": f"SMTP dispatch failed: {err_msg}"
            }


    @staticmethod
    def test_incident_email(user_id=None, recipient=None):
        customer_name = "Aniruddha Akhare"
        target_email = recipient or "aniruddhaakhare2004@gmail.com"
        acc_number = "1000200030004521"

        if user_id:
            user = User.query.get(user_id)
            if user:
                customer_name = user.full_name or customer_name
                if not recipient and user.email:
                    target_email = user.email

            account = BankAccount.query.filter_by(user_id=user_id).first()
            if account:
                acc_number = account.account_number

        incident_id = f"INC-2026-TEST-{random.randint(1000, 9999)}"
        return SecurityService.send_incident_email(
            account_number=acc_number,
            incident_id=incident_id,
            risk_score=96,
            recipient=target_email,
            customer_name=customer_name
        )

    @staticmethod
    def simulate_breach(user_id):
        try:
            # Check if there is an active account
            accounts = BankAccount.query.filter_by(user_id=user_id).all()
            if not accounts:
                return False, "No active accounts to breach."

            # Fetch user details for personalized security notice
            user = User.query.get(user_id)
            customer_name = user.full_name if user else "Valued Customer"
            customer_email = (
                user.email
                if (user and user.email and "@" in user.email)
                else "aniruddhaakhare2004@gmail.com"
            )

            # Lock all accounts for this user for security lockdown
            for acc in accounts:
                acc.is_security_locked = True
                acc.account_status = AccountStatus.FROZEN
            
            primary_account = next((a for a in accounts if a.is_primary), accounts[0])
            incident_number = f"INC-2026-{random.randint(10000, 99999)}"

            # Create Security Incident Record
            incident = SecurityIncident(
                incident_id=incident_number,
                account_id=primary_account.id,
                incident_type="ACCOUNT_BREACH_SIMULATION",
                risk_score=96,
                threat_level="CRITICAL",
                status="CONTAINED",
                detected_at=datetime.utcnow(),
                contained_at=datetime.utcnow(),
                actions_taken="Account locked, Transactions blocked, Active sessions revoked, Customer notified, Incident logged",
                simulation=True
            )
            db.session.add(incident)

            # Create Notification Record
            notif = Notification(
                customer_id=user_id,
                title="🚨 Critical Security Incident Detected",
                message=f"Account XXXX {primary_account.account_number[-4:] if len(primary_account.account_number) >= 4 else '4521'} has been temporarily locked due to a simulated breach.",
                notification_type=NotificationType.SYSTEM,
                is_read=False
            )
            db.session.add(notif)
            db.session.commit()

            # Trigger email notification
            email_result = SecurityService.send_incident_email(
                account_number=primary_account.account_number,
                incident_id=incident_number,
                risk_score=96,
                recipient=customer_email,
                customer_name=customer_name
            )

            # Return details of the incident with email telemetry
            return True, {
                "incident_id": incident.incident_id,
                "account_id": str(primary_account.id),
                "account_number": primary_account.account_number,
                "risk_score": incident.risk_score,
                "threat_level": incident.threat_level,
                "status": incident.status,
                "detected_at": incident.detected_at.isoformat(),
                "actions_taken": incident.actions_taken,
                "email_dispatched": email_result.get("success", False),
                "email_recipient": customer_email,
                "email_status_message": email_result.get("message", "")
            }


        except Exception as e:
            db.session.rollback()
            return False, str(e)

    @staticmethod
    def get_incidents(user_id):
        try:
            accounts = BankAccount.query.filter_by(user_id=user_id).all()
            account_ids = [acc.id for acc in accounts]
            incidents = SecurityIncident.query.filter(SecurityIncident.account_id.in_(account_ids)).order_by(SecurityIncident.created_at.desc()).all()
            
            result = []
            for inc in incidents:
                result.append({
                    "id": str(inc.id),
                    "incident_id": inc.incident_id,
                    "account_id": str(inc.account_id),
                    "incident_type": inc.incident_type,
                    "risk_score": inc.risk_score,
                    "threat_level": inc.threat_level,
                    "status": inc.status,
                    "actions_taken": inc.actions_taken,
                    "simulation": inc.simulation,
                    "detected_at": inc.detected_at.isoformat()
                })
            return True, result
        except Exception as e:
            return False, str(e)

    @staticmethod
    def recover_account(user_id, incident_id):
        try:
            incident = SecurityIncident.query.filter_by(incident_id=incident_id).first()
            if not incident:
                return False, "Incident not found."

            incident.status = "RESOLVED"
            
            # Unlock accounts
            accounts = BankAccount.query.filter_by(user_id=user_id).all()
            for acc in accounts:
                acc.is_security_locked = False
                acc.account_status = AccountStatus.ACTIVE

            db.session.commit()
            return True, "Account recovered successfully. Status restored to ACTIVE."
        except Exception as e:
            db.session.rollback()
            return False, str(e)

    @staticmethod
    def reset_simulation(user_id):
        try:
            # Delete simulation incidents
            accounts = BankAccount.query.filter_by(user_id=user_id).all()
            account_ids = [acc.id for acc in accounts]
            
            SecurityIncident.query.filter(SecurityIncident.account_id.in_(account_ids)).delete(synchronize_session=False)

            for acc in accounts:
                acc.is_security_locked = False
                acc.account_status = AccountStatus.ACTIVE

            db.session.commit()
            return True, "Simulation state has been reset successfully."
        except Exception as e:
            db.session.rollback()
            return False, str(e)
