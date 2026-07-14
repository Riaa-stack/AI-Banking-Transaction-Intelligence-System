import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBanking } from '../context/BankingContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Brain, 
  LineChart, 
  Sparkles, 
  Smartphone, 
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
  Coins,
  TrendingUp,
  Fingerprint
} from 'lucide-react';

export default function LandingPage() {
  const { theme, toggleTheme } = useBanking();
  const [activeFaq, setActiveFaq] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 2; // range -1 to 1
      const y = (clientY / innerHeight - 0.5) * 2; // range -1 to 1
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stats = [
    { value: "$14.2B+", label: "Transaction Volume Monitored" },
    { value: "0.002%", label: "Fraud Incidence Rate" },
    { value: "99.8%", label: "OCR Data Accuracy" },
    { value: "780+", label: "Average Client Credit Score" }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: "Conversational Financial Assistant",
      desc: "An advanced LLM chat assistant trained on personal ledger balances, providing predictive budgeting advice and financial summaries."
    },
    {
      icon: LineChart,
      title: "Credit Score Forecasting",
      desc: "Simulate and predict your future credit eligibility score with granular positive/negative factor analysis."
    },
    {
      icon: Zap,
      title: "Smart Loan Recommendation",
      desc: "Custom interest rates, EMI structures, and capital plans suggested instantly by AI models based on cash liquidity."
    },
    {
      icon: FileSearch,
      title: "OCR Statement Processing",
      desc: "Upload standard PDF statements and watch the optical OCR engine extract balance ledgers and feed AI analytical workflows."
    },
    {
      icon: BadgeAlert,
      title: "Autonomous Fraud Monitoring",
      desc: "Continuous transaction monitoring with anomaly detection. Flagging geofence violations and unusual volume deviations."
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Staff Oversight",
      desc: "Fully integrated Bank Employee platform to review risk indicators, approve micro-credit lines, and audit statement queues."
    }
  ];

  const faqItems = [
    {
      q: "How does the AI predict credit score changes?",
      a: "Our machine learning models analyze your active payment history, dynamic utilization rates, average account age, and statement-extracted cash flow records to forecast adjustments before credit reporting bureaus."
    },
    {
      q: "Is my personal financial data secure?",
      a: "Yes. AegisFintech uses bank-grade 256-bit encryption with JWT token session verification, zero-knowledge credentials storage, and automated fraud-risk modeling."
    },
    {
      q: "What is OCR statement review?",
      a: "Optical Character Recognition (OCR) converts standard PDF banking statement sheets into structured JSON database entries, allowing our financial assistants to analyze external records instantly."
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* Premium Floating Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80"
      >
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold"
            >
              A
            </motion.div>
            <span className="font-sans text-sm font-extrabold tracking-tight dark:text-white">
              Aegis<span className="text-indigo-600">Fintech</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500 animate-spin-slow" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <Link
              to="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-all hover:scale-[1.05]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with Interactive Parallax */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-28 md:pb-32" id="hero-landing">
        {/* Background ambient radial glows (interactive parallax) */}
        <div 
          style={{ 
            transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)`,
            filter: 'blur(100px)'
          }}
          className="absolute top-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 transition-transform duration-300 ease-out" 
        />
        <div 
          style={{ 
            transform: `translate(${mousePos.x * -35}px, ${mousePos.y * -35}px)`,
            filter: 'blur(120px)'
          }}
          className="absolute bottom-1/4 right-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-purple-500/10 dark:bg-purple-500/5 transition-transform duration-300 ease-out" 
        />
        
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 text-left"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/40 dark:text-indigo-400 dark:ring-indigo-400/20 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Next-Gen AI Fintech Platform
            </motion.div>
            
            <h1 className="font-sans text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-950 dark:text-white leading-[1.15] mb-6">
              Autonomous Banking & <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Transaction Intelligence
              </span>
            </h1>
            
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400 md:text-base mb-10 leading-relaxed">
              A state-of-the-art enterprise financial system. Harnessing conversational ledger assistants, advanced OCR character modeling, automatic risk indexing, and real-time fraud forecasting.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link 
                to="/signup" 
                className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:-translate-y-0.5"
                id="cta-get-started"
              >
                Get Started Free 
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                id="cta-login"
              >
                Access Portal
              </Link>
            </div>
          </motion.div>

          {/* Hero Right Visuals: Interactive 3D Parallax Card Stack */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5 relative flex justify-center items-center h-[400px] select-none"
          >
            {/* Perspective wrapper */}
            <div 
              style={{ perspective: 1000 }}
              className="relative w-full max-w-[360px]"
            >
              {/* Main Card */}
              <motion.div
                style={{
                  transform: `rotateX(${mousePos.y * -8}deg) rotateY(${mousePos.x * 8}deg)`,
                  transformStyle: "preserve-3d"
                }}
                className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-900/90 to-slate-950/95 p-6 text-white shadow-2xl backdrop-blur-md transition-transform duration-200 ease-out"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">Premium Platinum Ledger</p>
                    <p className="text-sm font-mono tracking-wider font-semibold">AEGIS DIRECT CONNECT</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <Fingerprint className="h-5 w-5 text-indigo-400" />
                  </div>
                </div>

                <div className="space-y-1 mb-8">
                  <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold">Available Reserves</p>
                  <p className="text-3xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    $184,520.45
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] text-indigo-300 uppercase tracking-wider">Account holder</p>
                    <p className="text-xs font-bold tracking-wide">UMER K. INTEGRATED</p>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-indigo-500/80" />
                    <div className="h-5 w-5 rounded-full bg-purple-500/80 -ml-2.5" />
                  </div>
                </div>
              </motion.div>

              {/* Floating Widget 1: Real-time Credit Tracker */}
              <motion.div
                style={{
                  transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * -20}px, 50px)`
                }}
                className="absolute -top-6 -right-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-sm transition-transform duration-200 ease-out"
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-1.5 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Credit Score</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">815 <span className="text-[10px] text-emerald-500 font-medium">+12 pts</span></p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Widget 2: Security Indicator */}
              <motion.div
                style={{
                  transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * 28}px, 30px)`
                }}
                className="absolute -bottom-8 -left-6 rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-sm transition-transform duration-200 ease-out"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-800 dark:text-white">AI Guard Secure</p>
                    <p className="text-[8px] text-slate-400">Zero active threats detected</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Widget 3: Live Liquid Asset Pulse */}
              <motion.div
                style={{
                  transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 15}px, -20px)`
                }}
                className="absolute -right-8 -bottom-4 rounded-xl border border-indigo-100 bg-indigo-50/90 dark:border-indigo-950 dark:bg-indigo-950/80 px-3 py-2 shadow-lg backdrop-blur-sm transition-transform duration-200 ease-out text-left"
              >
                <div className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-bounce" />
                  <span className="text-[9px] font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">KYC Level 5</span>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* Stats Board with Scroll Animations */}
      <section className="border-y border-slate-200/60 bg-white/40 py-12 dark:border-slate-800/60 dark:bg-slate-950/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
                }}
                whileHover={{ scale: 1.05 }}
                className="text-center cursor-default p-4 rounded-xl transition-all hover:bg-slate-100/30 dark:hover:bg-slate-900/30"
              >
                <p className="font-sans text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Capabilities / Core Features Grid */}
      <section className="px-6 py-20 md:py-28 animate-fade-in" id="capabilities-landing">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Engineered for Enterprise Intelligence
            </h2>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Every banking layer is augmented with deep semantic capabilities, giving both clients and risk managers an unparalleled operational advantage.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div 
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                  }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.01,
                    boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.08), 0 8px 10px -6px rgba(99, 102, 241, 0.08)"
                  }}
                  className="group relative rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-350 cursor-pointer"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-sans text-base font-bold text-slate-950 dark:text-white">{feat.title}</h3>
                  <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us & AI Banking Intro with 3D Mock Audits */}
      <section className="bg-slate-100/50 px-6 py-20 dark:bg-slate-900/30">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Autonomous Ledger Engine</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white mt-2">
                Decide on credit risks in real-time.
              </h2>
              <p className="mt-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                By processing multiple bank statement sheets through our specialized OCR systems, AegisFintech evaluates liquid reserves, average spending rates, and suspicious outbound transfers inside a centralized model.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-300"><strong>Dynamic Credit Forecasting</strong> matches user profiles instantly.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-300"><strong>Autonomous Fraud Mitigation</strong> flags compliance problems.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-300"><strong>Full Operational Control Console</strong> for risk agents.</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ rotateY: 5, rotateX: -5 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 shadow-xl transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-900">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Live AI Risk Audit</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-500">Node-A918</span>
              </div>
              <div className="mt-4 space-y-3.5">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                  <span className="text-[10px] font-bold text-slate-400">Flagged Transaction</span>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">Outbound crypto broker ATM</span>
                    <span className="font-bold text-slate-950 dark:text-white">$12,500.00</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg p-3">
                  <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold">Anomaly Index:</span>
                  <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">84.2% (CRITICAL)</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  "Transaction flagged due to cryptocurrency routing outside normal geofence coordinate limits. Suspended outbound processing pending agent override review."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials with hover expand */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">What Fintech Leaders Say</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/30 shadow-sm"
            >
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                "Implementing this platform for our credit forecasting reduced statement processing time from 4 days to 3 seconds. The OCR extraction works flawlessly with complex multi-bank checkbooks."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-600">
                  MC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-950 dark:text-white">Marcus Vance</h4>
                  <p className="text-[10px] text-slate-400">Risk Manager, Capital Trust</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/30 shadow-sm"
            >
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                "The user experience resembles a high-end consumer app rather than standard clunky banking terminals. The conversational chatbot provides genuine analytical answers instead of basic generic FAQs."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-xs text-purple-600">
                  AL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-950 dark:text-white">Aria Lindqvist</h4>
                  <p className="text-[10px] text-slate-400">Head of UX, North Horizon</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion with buttery-smooth height animation */}
      <section className="px-6 py-16 bg-slate-100/50 dark:bg-slate-900/10">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-center text-slate-950 dark:text-white mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div 
                key={idx} 
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-slate-900 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-slate-950/40"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
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
                      <div className="border-t border-slate-100 dark:border-slate-800 p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
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

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-900 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                A
              </div>
              <span className="font-sans text-sm font-extrabold tracking-tight dark:text-white">
                Aegis<span className="text-indigo-600">Fintech</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">&copy; 2026 AegisFintech Enterprise. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
