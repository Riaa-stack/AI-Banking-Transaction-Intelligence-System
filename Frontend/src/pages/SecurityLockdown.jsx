import React, { useState, useEffect } from 'react';
import { useBanking } from '../context/BankingContext';
import { apiService } from '../lib/api';
import { 
  ShieldAlert, 
  Lock, 
  Unlock,
  AlertTriangle, 
  Activity, 
  Mail, 
  Ban, 
  UserX, 
  Fingerprint, 
  Clock, 
  Zap, 
  Shield, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function SecurityLockdown() {
  const { currentUser, bankAccounts, loadData } = useBanking();
  const [simulationState, setSimulationState] = useState('NORMAL'); // NORMAL, DETECTING, ALERT, LOCKED, RECOVERING
  const [riskScore, setRiskScore] = useState(12);
  const [animateProgress, setAnimateProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [incidentData, setIncidentData] = useState(null);
  const [recoveryStep, setRecoveryStep] = useState(0);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [shake, setShake] = useState(false);

  // Audio simulation
  const playAlertSound = () => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch siren
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);
      
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Autoplay blocked or audio context error:", e);
    }
  };

  // Timeline messages
  const logs = [
    { time: '21:55:03', msg: 'Suspicious activity detected (Anomaly IP 103.45.12.9)' },
    { time: '21:55:04', msg: 'Risk analysis initiated via Neural Threat Auditor' },
    { time: '21:55:05', msg: 'Threat classified as CRITICAL (Confidence Score: 96%)' },
    { time: '21:55:06', msg: 'Emergency Account Lockdown initiated' },
    { time: '21:55:06', msg: 'All transaction channels BLOCKED' },
    { time: '21:55:07', msg: 'Active user authentication tokens revoked' },
    { time: '21:55:08', msg: 'Customer security alert dispatched via SMTP' },
    { time: '21:55:09', msg: 'Threat contained successfully. Monitoring active.' }
  ];

  // Steps during automated defense deployment
  const steps = [
    "Threat detected in demo profile ledger",
    "Neural vector risk assessment completed",
    "Primary account set to SECURITY_LOCKED in DB",
    "All real-time transaction endpoints blocked",
    "Active authentication sessions revoked",
    "Continuous heuristic security monitoring enabled",
    "Incident recorded under SOC SIEM audit log",
    `Alert dispatched to ${currentUser?.email || 'aniruddhaakhare2004@gmail.com'}`
  ];

  // Animate the risk score and active steps during breach detection
  useEffect(() => {
    if (simulationState === 'DETECTING') {
      setShake(true);
      const shakeTimeout = setTimeout(() => setShake(false), 800);

      // Increment progress bar & Risk Score
      const interval = setInterval(() => {
        setAnimateProgress(prev => {
          if (prev >= 96) {
            clearInterval(interval);
            return 96;
          }
          return prev + 2;
        });

        setRiskScore(prev => {
          if (prev >= 96) return 96;
          return prev + 2;
        });

        playAlertSound();
      }, 50);

      return () => {
        clearInterval(interval);
        clearTimeout(shakeTimeout);
      };
    }
  }, [simulationState]);

  // Handle step completion in detection dashboard
  useEffect(() => {
    if (simulationState === 'DETECTING') {
      const stepInterval = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= steps.length - 1) {
            clearInterval(stepInterval);
            setTimeout(() => {
              setSimulationState('ALERT');
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 500);

      return () => clearInterval(stepInterval);
    }
  }, [simulationState]);

  const triggerBreachSimulation = async () => {
    setSimulationState('DETECTING');
    setRiskScore(12);
    setAnimateProgress(0);
    setActiveStep(0);

    try {
      const res = await apiService.simulateBreach();
      if (res?.success) {
        setIncidentData(res.data);
        if (res.data?.email_dispatched) {
          Swal.fire({
            title: 'Security Alert Email Dispatched! 📬',
            text: `High-priority incident alert sent to ${res.data.email_recipient}.`,
            icon: 'success',
            timer: 3500,
            showConfirmButton: false
          });
        }
      } else {
        throw new Error(res?.message || 'Simulation execution failed.');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Simulation Error', err.message || 'Error executing incident simulation.', 'error');
      setSimulationState('NORMAL');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      Swal.fire({
        title: 'Dispatching Security Email...',
        text: 'Generating official security notice and connecting to SMTP server...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const res = await apiService.testSecurityEmail();
      const payload = res?.data || {};

      if (payload.success) {
        Swal.fire({
          title: 'Alert Delivered! 📬',
          text: `Security lockdown alert successfully delivered to ${payload.recipient}. Please check your inbox (or Spam folder).`,
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
      } else if (payload.simulated) {
        Swal.fire({
          title: 'Simulation Mode Active ⚠️',
          html: `<div class="text-left text-xs space-y-2">
            <p><strong>Professional HTML email preview generated successfully!</strong></p>
            <p>To receive real emails on <strong>${payload.recipient}</strong>, configure your 16-character Google App Password in <code>Backend/.env</code>:</p>
            <pre class="bg-slate-100 dark:bg-slate-800 p-2 rounded text-[11px] font-mono text-slate-800 dark:text-slate-200">
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=${payload.recipient}
MAIL_PASSWORD=your_16_char_google_app_password
MAIL_DEFAULT_SENDER=${payload.recipient}</pre>
          </div>`,
          icon: 'info',
          confirmButtonColor: '#4f46e5'
        });
      } else {
        Swal.fire({
          title: 'SMTP Transmission Failed',
          text: payload.message || res?.message || 'Failed to dispatch email.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Dispatch Failed',
        text: err.response?.data?.message || err.message,
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const startIncidentRecovery = () => {
    setSimulationState('RECOVERING');
    setRecoveryStep(0);
  };


  const handleVerifyRecovery = async () => {
    if (recoveryStep === 0) {
      // Step 0: Identity Check
      setRecoveryStep(1);
    } else if (recoveryStep === 1) {
      // Step 1: Incident Review
      setRecoveryStep(2);
    } else if (recoveryStep === 2) {
      // Step 2: Confirmation
      try {
        const res = await apiService.recoverAccount(incidentData?.incident_id || 'INC-2026-SIMULATED');
        if (res?.success) {
          Swal.fire({
            title: 'Account Restored',
            text: 'Security status restored to ACTIVE. Transactions enabled.',
            icon: 'success',
            confirmButtonColor: '#10b981'
          });
          setSimulationState('NORMAL');
          setRiskScore(12);
          if (loadData) loadData();
        } else {
          throw new Error(res?.message);
        }
      } catch (err) {
        Swal.fire('Recovery Error', err.message || 'Error restoring account.', 'error');
      }
    }
  };

  const handleResetSimulation = async () => {
    try {
      const res = await apiService.resetSecuritySimulation();
      if (res?.success) {
        Swal.fire('Simulation Reset', 'Demo profile restored to clean ACTIVE state.', 'success');
        setSimulationState('NORMAL');
        setRiskScore(12);
        if (loadData) loadData();
      } else {
        throw new Error(res?.message);
      }
    } catch (err) {
      Swal.fire('Reset Failed', err.message || 'Error resetting simulation.', 'error');
    }
  };

  return (
    <div className={`space-y-6 min-h-screen pb-12 transition-all ${shake ? 'animate-bounce' : ''}`} id="security-simulation-page">
      
      {/* ── TOP EMERGENCY NOTIFICATION BANNER ── */}
      {simulationState === 'ALERT' && (
        <div className="bg-rose-600 text-white py-3 px-6 rounded-2xl flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3 text-xs font-bold">
            <ShieldAlert className="h-5 w-5 animate-spin" />
            <span>🚨 CRITICAL SECURITY INCIDENT: Demo Account Restricted. Status: SECURITY_LOCKED.</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold uppercase">Simulation Alert</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              SOC Security Lockdown Simulation
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Observe real-time threat detection overlays and automated credential containment safeguards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSendTestEmail} 
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 cursor-pointer transition-colors"
            title="Dispatch a test security lockdown notice email to your inbox"
          >
            <Mail className="h-3.5 w-3.5" /> Test Alert Email
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            {isMuted ? '🔇 Unmute' : '🔊 Mute'}
          </button>
          <button 
            onClick={handleResetSimulation} 
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

      </div>

      {/* ── STATE 1: NORMAL VIEW ── */}
      {simulationState === 'NORMAL' && (
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Simulation Trigger Card */}
          <div className="rounded-3xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm text-center flex flex-col justify-center items-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
              <ShieldAlert className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Controlled Incident Simulator</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs">
                Launch a simulated account compromise flow to demonstrate threat response, transaction locks, and identity verification logic.
              </p>
            </div>
            <button
              onClick={() => {
                Swal.fire({
                  title: '⚠️ SIMULATE SECURITY INCIDENT',
                  text: 'This will simulate a critical account compromise on a demo account.',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#ef4444',
                  cancelButtonColor: '#64748b',
                  confirmButtonText: '🔴 Start Simulation'
                }).then(result => {
                  if (result.isConfirmed) triggerBreachSimulation();
                });
              }}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wide shadow-md shadow-rose-600/25 cursor-pointer uppercase transition-colors"
            >
              🔴 Simulate Account Breach
            </button>
            <button
              onClick={handleSendTestEmail}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-indigo-500" /> Send Test Alert to Inbox
            </button>
          </div>



          {/* Core Status Summary */}
          <div className="md:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Monitoring Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Account Status</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">🟢 Active</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
                <Zap className="h-8 w-8 text-emerald-500" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Transaction Status</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">🟢 Enabled</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center gap-3">
                <Activity className="h-8 w-8 text-indigo-500" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Risk Level</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">LOW (12/100)</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center gap-3">
                <Shield className="h-8 w-8 text-indigo-500" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Security Status</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">NORMAL</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── STATE 2: DETECTING SCREEN OVERLAY ── */}
      {simulationState === 'DETECTING' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-white p-8 shadow-xl space-y-8 relative overflow-hidden">
          
          {/* Animated Matrix/Scans background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500 via-slate-900 to-black pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
            
            {/* Live progress indicators */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-rose-600 animate-ping" />
                <h3 className="text-lg font-black tracking-tight text-rose-500">
                  NEURAL THREAT MITIGATION ENGINE
                </h3>
              </div>

              {/* Progress items */}
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {idx < activeStep ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    ) : idx === activeStep ? (
                      <RefreshCw className="h-4.5 w-4.5 text-rose-500 animate-spin" />
                    ) : (
                      <div className="h-4.5 w-4.5 rounded-full border border-slate-700" />
                    )}
                    <span className={idx === activeStep ? 'text-rose-450 font-bold' : 'text-slate-400'}>
                      {step} {idx === activeStep ? '— PROCESSING...' : idx < activeStep ? '— COMPLETED' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Signals Panel */}
            <div className="w-full md:w-80 rounded-2xl bg-slate-900/80 p-6 border border-slate-800 space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest block">Threat Intelligence Index</span>
                <h4 className="text-sm font-black text-white mt-1">Detection Diagnostics</h4>
              </div>

              <div className="space-y-2.5 text-[10.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">✓ Login Anomaly</span>
                  <span className="text-rose-500 font-bold">DETECTED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">✓ Unusual Device Signature</span>
                  <span className="text-rose-500 font-bold">DETECTED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">✓ Suspicious Ledger Velocity</span>
                  <span className="text-rose-500 font-bold">DETECTED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">✓ Geographic IP Mismatch</span>
                  <span className="text-rose-500 font-bold">DETECTED</span>
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t border-slate-800">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Confidence Level</span>
                  <span className="text-rose-500">{riskScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-600 transition-all duration-300" style={{ width: `${animateProgress}%` }} />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-400">Threat Classification:</span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-500 border border-rose-800/30 text-[10px] font-black uppercase">
                  CRITICAL
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── STATE 3: ALERT CONFIRMATION / ACTION SHEET ── */}
      {(simulationState === 'ALERT' || simulationState === 'LOCKED' || simulationState === 'RECOVERING') && (
        <div className="space-y-6">

          {/* Large Flashing Alert Section */}
          {simulationState === 'ALERT' && (
            <div className="rounded-3xl border border-rose-500 bg-rose-950/20 p-8 text-center space-y-4 shadow-md border-t-8 border-t-rose-600 relative overflow-hidden">
              <div className="absolute top-2 left-2 text-[8px] bg-rose-800 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest">
                DEMONSTRATION / SIMULATION
              </div>

              <div className="flex justify-center text-rose-600">
                <AlertTriangle className="h-16 w-16 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                🚨 CRITICAL SECURITY ALERT 🚨
              </h2>
              <p className="text-sm font-bold text-rose-600 max-w-md mx-auto">
                Account breach simulation detected. Protective limits and transaction locks have been activated automatically on your demo account.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={startIncidentRecovery}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  🔓 Begin Account Recovery
                </button>
              </div>
            </div>
          )}

          {/* Incident Timeline & Security Incident Panel */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Threat Card Panel */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">🔒 Security Incident</h3>
                <span className="text-[10px] text-indigo-500 font-bold">{incidentData?.incident_id || 'INC-2026-LOCKDOWN'}</span>
              </div>


              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-500">
                  <div>Threat Level</div>
                  <div className="font-extrabold text-rose-600 text-right">CRITICAL</div>
                  <div>Risk Score</div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-right">96 / 100</div>
                  <div>Account</div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-right">
                    XXXX XXXX {bankAccounts?.[0]?.account_number?.slice(-4) || '4521'}
                  </div>
                  <div>Status</div>
                  <div className="font-extrabold text-emerald-600 text-right uppercase">CONTAINED</div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>REACTION TIME</span>
                    <span>1.2 SEC</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-650" style={{ width: '96%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Status Transition Panel */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Dashboard Transition Indicators</h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-850">
                  <span className="text-slate-500">Account Status</span>
                  <span className="font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-0.5 rounded text-[10px] uppercase">
                    🔴 SECURITY LOCKED
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-850">
                  <span className="text-slate-500">Transaction Limits</span>
                  <span className="font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-0.5 rounded text-[10px] uppercase">
                    🔴 BLOCKED
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-850">
                  <span className="text-slate-500">Active Threat Index</span>
                  <span className="font-extrabold text-rose-600 text-[10px] uppercase">
                    🔴 CRITICAL (96/100)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500">Incident Resolution</span>
                  <span className="font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded text-[10px] uppercase">
                    🚨 INCIDENT CONTAINED
                  </span>
                </div>
              </div>
            </div>

            {/* Heuristic Audit Timeline */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Incident Response Timeline</h3>
              <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                {logs.map((log, lIdx) => (
                  <div key={lIdx} className="flex gap-2.5 text-[10.5px] items-start">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">{log.time}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{log.msg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recovery Steps Panel */}
          {simulationState === 'RECOVERING' && (
            <div className="rounded-3xl border border-indigo-500 bg-indigo-50/10 p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-indigo-150/40 pb-3">
                <div className="flex items-center gap-2">
                  <Unlock className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Simulated Account Recovery Portal</h3>
                </div>
                <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2.5 py-0.5 rounded">
                  Step {recoveryStep + 1} of 3
                </span>
              </div>

              {recoveryStep === 0 && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-indigo-650 font-bold">
                    <Fingerprint className="h-5 w-5" />
                    <span>Identity Verification Check</span>
                  </div>
                  <p className="text-slate-500">We must verify your identity to proceed. A demo confirmation code has been generated.</p>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Demo Verification Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter verification code (e.g. 1234)" 
                      value={recoveryCode} 
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 outline-none"
                    />
                  </div>
                </div>
              )}

              {recoveryStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-indigo-650 font-bold">
                    <ShieldAlert className="h-5 w-5" />
                    <span>Review Incident Diagnostic Details</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    Reviewing threat signatures associated with {incidentData?.incident_id || 'INC-2026-LOCKDOWN'}. Anomalous location vectors from geolocation IP were blocked, and account limits were engaged. No funds were compromised.
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl">
                    <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Threat Containment Action</span>
                    <span className="font-bold text-slate-800 dark:text-slate-250 mt-1 block">Account restrictions applied successfully within 1.2s.</span>
                  </div>
                </div>
              )}

              {recoveryStep === 2 && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-indigo-650 font-bold">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span>Confirm Account Ownership Restorations</span>
                  </div>
                  <p className="text-slate-500">All security steps completed. Press the button below to restore the account and unlock transactions.</p>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-indigo-150/40">
                <button
                  onClick={() => setSimulationState('ALERT')}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyRecovery}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  {recoveryStep === 2 ? 'Restore Account' : 'Proceed Verification'}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
