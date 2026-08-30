import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBanking } from '../context/BankingContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Brain, 
  LineChart, 
  Sparkles, 
  Zap, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  FileSearch,
  MessageSquare,
  BadgeAlert,
  ChevronDown,
  Sun,
  Moon,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Scan,
  Shield,
  Layers
} from 'lucide-react';
import Swal from 'sweetalert2';
import CentralNetworkGraphic from '../components/landing/CentralNetworkGraphic';
import InfiniteSpiral from '../components/common/InfiniteSpiral';
import { fetchBankingIntelFeed, FALLBACK_INTEL_ITEMS } from '../lib/intelFeedService';

export default function LandingPage() {
  const { theme, toggleTheme } = useBanking();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [emailInput, setEmailInput] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [spiralItems, setSpiralItems] = useState(FALLBACK_INTEL_ITEMS);
  const [isLoadingSpiral, setIsLoadingSpiral] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchBankingIntelFeed()
      .then((items) => {
        if (isMounted) {
          setSpiralItems(items);
          setIsLoadingSpiral(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load banking intel feed:', err);
        if (isMounted) setIsLoadingSpiral(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      Swal.fire({
        title: 'Please enter a valid email',
        text: 'Provide your business or personal email to receive demo access.',
        icon: 'warning',
        confirmButtonColor: '#8b5cf6'
      });
      return;
    }

    Swal.fire({
      title: 'Demo Access Queued',
      html: `<div class="text-xs text-slate-500 space-y-2 mt-2">
        <p>A demonstration invite has been dispatched to <strong>${emailInput}</strong>.</p>
        <p class="text-indigo-600 font-bold">You can also log in directly to explore the active banking platform.</p>
      </div>`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Launch Dashboard',
      cancelButtonText: 'Close',
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#64748b'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/login');
      }
    });
    setEmailInput('');
  };

  // 6 Core Features requested by user
  const coreFeatures = [
    {
      icon: ShieldCheck,
      badge: "Zero-Day Defense",
      title: "AI Fraud Detection",
      desc: "Real-time XGBoost ML models paired with Gemini AI to score anomaly probabilities, geofence violations, and sudden velocity spikes under 45ms.",
      color: "purple"
    },
    {
      icon: Activity,
      badge: "Autonomous Audit",
      title: "Transaction Monitoring",
      desc: "Continuous ledger stream auditing with multi-layered heuristics. Identifies suspicious deviations before settlement occurs.",
      color: "orange"
    },
    {
      icon: Brain,
      badge: "Ledger Intelligence",
      title: "Customer Analytics",
      desc: "Deep financial health diagnostics, spending categorization, cash-flow liquidity insights, and predictive expense forecasting.",
      color: "purple"
    },
    {
      icon: LineChart,
      badge: "Explainable AI (XAI)",
      title: "Credit Risk Prediction",
      desc: "Forecasting credit scores with granular positive and negative causal factor weights, remediation simulations, and scenario planning.",
      color: "orange"
    },
    {
      icon: Zap,
      badge: "Dynamic Underwriting",
      title: "Loan Recommendation",
      desc: "Rule-based pre-qualification engine computing exact mathematical EMIs, coupled with Gemini reasoning for ranked offers and pros/cons.",
      color: "purple"
    },
    {
      icon: MessageSquare,
      badge: "Conversational Copilot",
      title: "AI Banking Assistant",
      desc: "An enterprise multimodal financial advisor capable of answering personal ledger inquiries, what-if credit questions, and loan comparisons.",
      color: "orange"
    }
  ];

  const stats = [
    { value: "$14.2B+", label: "Transaction Volume Monitored" },
    { value: "99.98%", label: "Fraud Interception Accuracy" },
    { value: "<45ms", label: "Inference Latency Window" },
    { value: "0.001%", label: "False Positive Lockouts" }
  ];

  const architectureSteps = [
    {
      num: "01",
      title: "Vector Ingestion & Pre-Screening",
      desc: "Inbound transfers are analyzed against geolocation maps, IP anomalies, device tokens, and historical velocity bounds."
    },
    {
      num: "02",
      title: "Dual ML & LLM Cognitive Scoring",
      desc: "XGBoost classifier predicts mathematical fraud probability while Gemini 2.5 Flash evaluates behavioral nuance and semantic context."
    },
    {
      num: "03",
      title: "Automated Containment & SOC Alerting",
      desc: "High-risk transfers are blocked instantaneously, the affected account is placed under security lockdown, and customer alerts are triggered."
    }
  ];

  const faqItems = [
    {
      q: "How does the AI model catch fraudulent transactions so fast?",
      a: "Our architecture evaluates transactions through a lightweight, serialized XGBoost pipeline optimized for sub-45ms inference, while asynchronous Gemini reasoning processes contextual metadata in parallel without delaying critical banking rails."
    },
    {
      q: "How does the Credit Risk Prediction calculate factor weights?",
      a: "The Credit Score Engine uses explainable feature importance matrices across 23 demographic and financial variables (e.g. debt-to-income, credit utilization, payment history) to generate actionable remediation steps."
    },
    {
      q: "Can I simulate cyber incidents and account lockouts?",
      a: "Yes! AI BankIQ includes a fully controlled Security Lockdown & Breach Simulation console where administrators can test automated containment, transaction blocks, and multi-step customer recovery workflows."
    },
    {
      q: "Is personal customer banking data encrypted?",
      a: "Yes. All data at rest is encrypted with AES-256 and transit is secured via TLS 1.3 with JWT session verification and zero hardcoded credentials."
    }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#0a0b0e] text-white' : 'bg-[#fcfdfe] text-slate-900'
    }`}>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 1. TOP NAVBAR (Faithful to Reference Image Layout)               */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 pt-4 px-4 sm:px-6 md:px-8">
        <nav className={`mx-auto max-w-6xl rounded-2xl px-5 py-3.5 flex items-center justify-between border backdrop-blur-md transition-all ${
          isDark 
            ? 'bg-[#111319]/85 border-slate-800/80 shadow-lg shadow-black/40' 
            : 'bg-white/90 border-slate-200/90 shadow-sm shadow-slate-200/50'
        }`}>
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            {/* Twin Isometric Diamond Logo (Purple over Orange) */}
            <div className="relative w-6 h-6 flex items-center justify-center">
              {/* Bottom Orange Diamond */}
              <div className="absolute w-3.5 h-3.5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xs transform rotate-45 translate-x-1 translate-y-1 opacity-90 group-hover:translate-x-1.5 transition-transform" />
              {/* Top Purple Diamond */}
              <div className="absolute w-3.5 h-3.5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xs transform rotate-45 -translate-x-0.5 -translate-y-0.5 shadow-sm shadow-purple-500/50" />
            </div>
            
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              AI Bank<span className="text-purple-500">IQ</span>
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#intelligence" className="hover:text-slate-900 dark:hover:text-white transition-colors">Intelligence</a>
            <a href="#security" className="hover:text-slate-900 dark:hover:text-white transition-colors">Security</a>
            <a href="#metrics" className="hover:text-slate-900 dark:hover:text-white transition-colors">Metrics</a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">Docs</a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                isDark 
                  ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-purple-600" />}
            </button>

            {/* Login Link */}
            <Link
              to="/login"
              className={`text-xs font-semibold px-3 py-2 transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Login
            </Link>

            {/* Get Started Button */}
            <Link
              to="/signup"
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer ${
                isDark 
                  ? 'bg-white text-slate-950 hover:bg-slate-150' 
                  : 'bg-slate-950 text-white hover:bg-slate-800'
              }`}
            >
              Get started
            </Link>
          </div>

        </nav>
      </header>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 2. HERO SECTION WITH RIGHT-SIDE 3D INFINITE SPIRAL INTEL LOOP     */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 md:pt-16 pb-12 px-4 sm:px-6 overflow-hidden">
        
        {/* Subtle Background Glows */}
        <div className="absolute top-12 left-1/4 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-48 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Responsive Split Hero: Left = Headline & CTA; Right = Semi-transparent Glassmorphic InfiniteSpiral */}
        <div className="mx-auto max-w-7xl relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          
          {/* Left Column (Main Headline, Subtitle, Form & Badges) */}
          <div className="w-full lg:w-7/12 flex-1 text-left space-y-6 max-w-2xl">
            
            {/* Live Status Pill */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${
              isDark 
                ? 'bg-slate-900/60 border-purple-500/30 text-slate-200' 
                : 'bg-white/80 border-purple-200 text-slate-700 shadow-sm'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium tracking-wide">Live AI Banking & Fraud Intelligence</span>
              <span className="text-[10px] font-bold text-purple-400 dark:text-purple-300 ml-1 px-1.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/25">
                v3.4 Active
              </span>
            </div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]"
            >
              AI-Powered Banking.
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-orange-400 bg-clip-text text-transparent">
                Smarter Every Day.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
              className={`text-base sm:text-lg max-w-xl leading-relaxed font-normal ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Secure transactions, detect fraud and make smarter financial decisions with AI-powered banking intelligence.
            </motion.p>

            {/* Email CTA Input Form */}
            <motion.form 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.22, ease: "easeOut" }}
              onSubmit={handleDemoSubmit}
              className={`flex items-center max-w-md p-1.5 rounded-2xl border transition-all ${
                isDark 
                  ? 'bg-[#12141c]/80 backdrop-blur-md border-slate-800 shadow-xl shadow-black/40 focus-within:border-purple-500/50' 
                  : 'bg-white/90 backdrop-blur-md border-slate-200 shadow-md shadow-slate-200/60 focus-within:border-purple-500'
              }`}
            >
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Your business email"
                className={`w-full bg-transparent text-xs px-3.5 py-2.5 outline-none placeholder:text-slate-500 font-medium ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              />
              <button
                type="submit"
                className={`shrink-0 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm ${
                  isDark 
                    ? 'bg-white text-slate-950 hover:bg-slate-100' 
                    : 'bg-slate-950 text-white hover:bg-slate-850'
                }`}
              >
                Get a demo
              </button>
            </motion.form>

            {/* Micro Trust Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>&lt;45ms Latency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <span>99.98% Interception</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-amber-500" />
                <span>SOC 2 Type II</span>
              </div>
            </div>

          </div>

          {/* Right Column: Seamlessly Merged 3D Infinite Spiral Stream */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-5/12 shrink-0 flex justify-center lg:justify-end"
          >
            {/* Seamless, Borderless & Semi-Transparent Floating Container */}
            <div className="w-full max-w-[500px] h-[640px] sm:h-[700px] lg:h-[740px] relative overflow-hidden flex items-center justify-center pointer-events-auto">
              
              {/* Subtle Ambient Radial Lighting Blending into Landing Page */}
              <div className="absolute top-1/4 right-10 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* 3D Infinite Spiral Loop Component (Stretched vertically, borderless & merged) */}
              <div className="w-full h-full relative">
                <InfiniteSpiral
                  items={spiralItems}
                  animationMode="auto"
                  speed={0.55}
                  radius={165}
                  cardWidth={120}
                  cardHeight={115}
                  verticalSpacing={68}
                  perspective={1100}
                  cardRadius={14}
                  centerScale={1.2}
                  edgeBlur={4}
                  cardsPerTurn={7}
                  pauseOnHover
                  direction="up"
                  rotation={0}
                  cardTilt={0}
                  edgeFade={0.28}
                  imageFit="cover"
                  grayscale={0}
                  imageOpacity={0.88}
                />
              </div>

            </div>
          </motion.div>

        </div>

        {/* ── Central Visual: Exact Recreated Financial Network Graphic (Preserved intact below the split) ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
          className="mt-16 md:mt-22 max-w-6xl mx-auto"
        >
          <div className="text-center mb-5">
            <span className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              Autonomous Neural Transaction Ingestion & Remediation Highway
            </span>
          </div>
          <CentralNetworkGraphic isDark={isDark} />
        </motion.div>

      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 3. ANIMATED STATISTICS BANNER                                    */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section id="metrics" className={`py-14 border-y ${
        isDark ? 'border-slate-800/80 bg-[#0d0f15]/50' : 'border-slate-200/80 bg-slate-50/70'
      }`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {stats.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="space-y-1.5"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {item.value}
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 4. THE 6 CORE INTELLIGENCE FEATURES                              */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-purple-500 uppercase px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              End-to-End Banking Intelligence
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
              Every transfer, loan assessment, and customer query is routed through dedicated machine learning micro-models and generative reasoning agents.
            </p>
          </div>

          {/* Features 2x3 Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feat, idx) => {
              const IconComp = feat.icon;
              const isPurple = feat.color === 'purple';

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 ${
                    isDark 
                      ? 'bg-[#111319] border-slate-800/80 hover:border-slate-700 shadow-lg shadow-black/20 hover:shadow-purple-900/10' 
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm shadow-slate-200/40 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border ${
                        isPurple 
                          ? (isDark ? 'bg-purple-950/40 border-purple-800/40 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-600')
                          : (isDark ? 'bg-orange-950/40 border-orange-800/40 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-600')
                      }`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isPurple 
                          ? (isDark ? 'bg-purple-950/30 text-purple-400 border border-purple-900/30' : 'bg-purple-50 text-purple-700 border border-purple-200')
                          : (isDark ? 'bg-orange-950/30 text-orange-400 border border-orange-900/30' : 'bg-orange-50 text-orange-700 border border-orange-200')
                      }`}>
                        {feat.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {feat.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {feat.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 group-hover:text-purple-500 transition-colors flex items-center gap-1">
                      Explore Capability <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 5. HOW IT WORKS / SOC REMEDIATION PIPELINE                       */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section id="security" className={`py-20 px-4 sm:px-6 border-t ${
        isDark ? 'border-slate-800/80 bg-[#0c0e14]/60' : 'border-slate-200/80 bg-slate-50/50'
      }`}>
        <div className="mx-auto max-w-6xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-orange-500 uppercase px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
              Autonomous Remediation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              The Path from Threat to Containment
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
              How the central intelligence core evaluates legitimate transactions, remedies suspicious attempts, and contains breaches.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {architectureSteps.map((step, sIdx) => (
              <motion.div
                key={sIdx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: sIdx * 0.12 }}
                className={`rounded-3xl p-7 border relative overflow-hidden ${
                  isDark ? 'bg-[#111319] border-slate-800/80' : 'bg-white border-slate-200/90'
                }`}
              >
                <div className="text-3xl font-black text-slate-300 dark:text-slate-700 font-mono mb-4">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 6. SOC SIMULATION CALLOUT BANNER                                 */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section id="intelligence" className="py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className={`rounded-3xl p-8 sm:p-12 border relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 ${
            isDark 
              ? 'bg-gradient-to-r from-[#12141e] to-[#1a1329] border-purple-900/30' 
              : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
          }`}>
            
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Live Security Sandbox Active
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Experience the SOC Breach Simulation
              </h3>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                Trigger a simulated cyber incident directly inside your dashboard. Watch neural vectors classify threat confidence and activate emergency transaction locks.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                to="/customer/security-lockdown"
                className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all text-center"
              >
                Launch SOC Simulator
              </Link>
              <Link
                to="/signup"
                className={`px-6 py-3.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  isDark 
                    ? 'border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800' 
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                Open Banking Profile
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (Accordion)                       */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section id="faq" className={`py-20 px-4 sm:px-6 border-t ${
        isDark ? 'border-slate-800/80' : 'border-slate-200/80'
      }`}>
        <div className="mx-auto max-w-3xl">
          
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Everything you need to know about AI BankIQ's intelligence architecture.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`rounded-2xl border overflow-hidden transition-colors ${
                  isDark ? 'border-slate-800/80 bg-[#111319]' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white transition-colors hover:opacity-85 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                    activeFaq === idx ? 'rotate-180 text-purple-500' : ''
                  }`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className={`border-t p-4 sm:p-5 text-xs leading-relaxed ${
                        isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                      }`}>
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 8. FOOTER                                                        */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <footer className={`border-t py-12 px-4 sm:px-6 transition-colors ${
        isDark ? 'border-slate-900 bg-[#090a0d]' : 'border-slate-200 bg-white'
      }`}>
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2.5">
            <div className="relative w-5 h-5 flex items-center justify-center">
              <div className="absolute w-3 h-3 bg-orange-500 rounded-xs transform rotate-45 translate-x-0.5 translate-y-0.5" />
              <div className="absolute w-3 h-3 bg-purple-500 rounded-xs transform rotate-45 -translate-x-0.5 -translate-y-0.5" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              AI Bank<span className="text-purple-500">IQ</span>
            </span>
            <span className="text-xs text-slate-400 ml-2">
              &copy; {new Date().getFullYear()} AI BankIQ Systems. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              SOC2 Type II Certified
            </span>
            <span>256-Bit TLS</span>
            <span>RBI / PCI-DSS Ready</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
