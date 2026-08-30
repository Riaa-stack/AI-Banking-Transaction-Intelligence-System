import React, { useState, useEffect, useRef } from 'react';
import { useBanking } from '../../context/BankingContext';
import ModuleOfflineBlocker from '../ModuleOfflineBlocker';
import { apiService } from '../../lib/api';
import { 
  Sparkles, 
  RefreshCw, 
  Calculator, 
  ArrowRight, 
  Brain, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Send, 
  HelpCircle,
  TrendingDown,
  Info,
  DollarSign,
  Briefcase
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function LoanRecommenderDashboard() {
  const { currentUser, bankAccounts, transactions, customers, apiConnected, loading, loadData } = useBanking();

  const [forecasting, setForecasting] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  // Form parameters
  const [form, setForm] = useState({
    loan_purpose: 'Personal Loan',
    requested_amount: 500000,
    preferred_tenure: 36
  });

  // Chat parameters
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'assistant', text: 'Hi! I am your AI Loan Assistant. Once you run a loan evaluation, I can help you compare interest rates, pros/cons, trade-offs, and simulate custom tenure scenarios.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-filled stats from client banking context
  const [userProfile, setUserProfile] = useState({
    income: 75000,
    creditScore: 650,
    balance: 100000
  });

  // Extract financial profiles
  useEffect(() => {
    if (apiConnected) {
      // Balance
      const totalBal = bankAccounts.reduce((sum, acc) => sum + (parseFloat(acc.current_balance || acc.balance) || 0), 0);
      
      // Income
      let totalInc = 0;
      (transactions || []).forEach(tx => {
        const amt = parseFloat(tx.amount) || 0;
        const type = getattrStr(tx.transaction_type) || getattrStr(tx.type);
        if (type === 'Credit') totalInc += amt;
      });

      // Credit Score
      const currentCustomer = customers?.find?.(c => c.email === currentUser?.email);
      const scoreVal = currentCustomer?.creditScore || currentUser?.creditScore || 680;

      setUserProfile({
        income: totalInc > 0 ? Math.round(totalInc) : 75000,
        creditScore: scoreVal,
        balance: Math.round(totalBal)
      });
    }
  }, [bankAccounts, transactions, customers, apiConnected]);

  // Helper for attributes
  function getattrStr(val) {
    if (!val) return '';
    if (typeof val === 'object' && val.value) return String(val.value);
    return String(val);
  }

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFetchRecommendations = async (e) => {
    if (e) e.preventDefault();
    setForecasting(true);
    try {
      const res = await apiService.recommendLoans({
        loan_purpose: form.loan_purpose,
        requested_amount: Number(form.requested_amount),
        preferred_tenure: Number(form.preferred_tenure)
      });

      if (res?.success && res?.data) {
        setRecommendations(res.data.recommendations);
        // Clear chat context except greetings when new recommendation is generated
        setChatHistory([
          { sender: 'assistant', text: `Evaluated ${res.data.recommendations.length} recommended loan products matching your request. Ask me to compare them!` }
        ]);
        Swal.fire({
          title: 'Recommendations Evaluated',
          text: `Retrieved ${res.data.recommendations.length} personalized loan matches.`,
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
      } else {
        throw new Error(res?.message || 'Failed to retrieve recommendations.');
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Evaluation Failed',
        text: err.message || 'Server error recommending loan.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setForecasting(false);
    }
  };

  const handleSendChat = async (e, customMsg = null) => {
    if (e) e.preventDefault();
    const queryText = customMsg || chatMessage;
    if (!queryText.trim() || chatLoading) return;

    if (!recommendations) {
      Swal.fire({
        title: 'No Active Recommendations',
        text: 'Please run the Loan Evaluation first so I can analyze the options for you.',
        icon: 'warning',
        confirmButtonColor: '#eab308'
      });
      return;
    }

    const newHistory = [...chatHistory, { sender: 'user', text: queryText }];
    setChatHistory(newHistory);
    setChatMessage('');
    setChatLoading(true);

    try {
      const res = await apiService.chatLoans(queryText, recommendations, chatHistory);
      if (res?.success && res?.data?.answer) {
        setChatHistory([...newHistory, { sender: 'assistant', text: res.data.answer }]);
      } else {
        throw new Error(res?.message || 'Chat assistance failed.');
      }
    } catch (err) {
      console.error(err);
      setChatHistory([...newHistory, { sender: 'assistant', text: 'Chat connection timed out. Please try again.', isError: true }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="AI Loan Recommendation Engine" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  return (
    <div className="space-y-8" id="customer-loans-page">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Loan Recommendation Engine
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
              Gemini Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated eligibility constraints with cognitive ranking analysis by Gemini.
          </p>
        </div>
      </div>

      {/* ── Top Panel: Auto-Populated Core Profile Stats ── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-md border border-indigo-900/30">
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-250 block">Monthly Income</span>
          <span className="text-lg font-black block mt-0.5">₹{userProfile.income.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Verified from transfers</span>
        </div>
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-250 block">Credit Standing</span>
          <span className="text-lg font-black block mt-0.5 text-indigo-300">{userProfile.creditScore} pts</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Latest prediction value</span>
        </div>
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-250 block">Current Balance</span>
          <span className="text-lg font-black block mt-0.5">₹{userProfile.balance.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Across all linked accounts</span>
        </div>
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-250 block">Maximum Limit Est.</span>
          <span className="text-lg font-black block mt-0.5 text-emerald-400">
            ₹{(userProfile.income * (userProfile.creditScore >= 740 ? 12 : 8)).toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Rule-based credit limit multiplier</span>
        </div>
      </div>

      {/* ── Main Layout: Forms & Recommendations ── */}
      <div className="grid gap-6 md:grid-cols-12">
        
        {/* Left side: Search Form */}
        <div className="md:col-span-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm self-start space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Calculator className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Loan Parameters</h3>
          </div>

          <form onSubmit={handleFetchRecommendations} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Loan Purpose</label>
              <select
                value={form.loan_purpose}
                onChange={(e) => setForm({ ...form, loan_purpose: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500"
              >
                <option value="Personal Loan">Personal Expenses</option>
                <option value="Home Loan">Real Estate / Home Purchase</option>
                <option value="Education Loan">Higher Studies / University Tuition</option>
                <option value="Vehicle Loan">Automobile Purchase</option>
                <option value="Business Loan">Capital expansion / Firm Funding</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Requested Amount (₹)</label>
              <input
                type="number"
                min="50000"
                max="5000000"
                step="25000"
                value={form.requested_amount}
                onChange={(e) => setForm({ ...form, requested_amount: Number(e.target.value) || 50000 })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Preferred Tenure:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{form.preferred_tenure} Months</span>
              </div>
              <input
                type="range"
                min="12"
                max="120"
                step="6"
                value={form.preferred_tenure}
                onChange={(e) => setForm({ ...form, preferred_tenure: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={forecasting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {forecasting ? 'Running AI Engine...' : 'Evaluate Custom Offers'}
            </button>
          </form>
        </div>

        {/* Right side: Recommendation Results */}
        <div className="md:col-span-8 space-y-6">
          
          {!recommendations ? (
            <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-400">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200">No Recommendations Loaded</h4>
                <p className="text-slate-400 mt-1 max-w-sm mx-auto">Input your required capital sum and tenure, then click "Evaluate Custom Offers" to run our Gemini recommendation model.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <h3 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">
                Ranked AI Loan Recommendations
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                {recommendations.map((rec, index) => {
                  const status = (rec.eligibility_status || '').toLowerCase();
                  const isEligible = status.includes('eligible') && !status.includes('not');
                  const match = rec.match_score || 80;

                  return (
                    <div 
                      key={index} 
                      className={`relative rounded-3xl border bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between overflow-hidden ${
                        index === 0 
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-600' 
                          : 'border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      {/* Top Rank Badge */}
                      {index === 0 && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 text-[8px] font-black uppercase rounded-bl-2xl">
                          Best Match
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{rec.loan_type}</h4>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-black uppercase mt-1 ${
                              isEligible 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' 
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'
                            }`}>
                              {rec.eligibility_status}
                            </span>
                          </div>

                          {/* Match Score Radial Indicator */}
                          <div className="text-right">
                            <span className="block text-[8px] font-black text-slate-400 uppercase">Match Score</span>
                            <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{match}%</span>
                          </div>
                        </div>

                        {/* Financial figures */}
                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-center">
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 block uppercase">EMI / Mo</span>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              ₹{rec.calculated_emi ? Number(rec.calculated_emi).toLocaleString() : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 block uppercase">APR Rate</span>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {rec.interest_rate}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 block uppercase">Tenure</span>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {rec.tenure_months}m
                            </span>
                          </div>
                        </div>

                        {/* Pros and cons lists */}
                        <div className="space-y-2 text-[11px]">
                          <div>
                            <span className="font-bold text-slate-650 block text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Advantages</span>
                            <ul className="list-disc list-inside text-slate-500 mt-1 pl-1 space-y-0.5">
                              {rec.advantages?.map((adv, aIdx) => <li key={aIdx} className="truncate">{adv}</li>)}
                            </ul>
                          </div>
                          <div>
                            <span className="font-bold text-slate-650 block text-[9px] uppercase tracking-wider text-rose-500">Disadvantages</span>
                            <ul className="list-disc list-inside text-slate-500 mt-1 pl-1 space-y-0.5">
                              {rec.disadvantages?.map((dis, dIdx) => <li key={dIdx} className="truncate">{dis}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Explanation box */}
                      <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        "{rec.why_this_loan}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ── Bottom Section: AI Loan Chatbot Assistant ── */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Interactive AI Loan Assistant
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Compare trade-offs, interest rates, or query hypothetical options.</p>
            </div>
          </div>
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
        </div>

        {/* Chat History Panel */}
        <div className="h-64 overflow-y-auto bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 space-y-3.5 flex flex-col">
          {chatHistory.map((msg, idx) => (
            <div 
              key={idx} 
              className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white self-end rounded-tr-none'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-250 self-start rounded-tl-none border border-slate-200/60 dark:border-slate-850'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {chatLoading && (
            <div className="bg-white dark:bg-slate-900 text-slate-400 border border-slate-200/60 dark:border-slate-850 max-w-[80%] rounded-2xl p-3 text-xs self-start rounded-tl-none animate-pulse">
              AI assistant analyzing rates and terms...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Quick Chips */}
        <div className="flex gap-2 flex-wrap text-[11px] font-bold text-slate-600 dark:text-slate-400">
          <button 
            onClick={(e) => handleSendChat(e, 'Compare Loan A and B')}
            disabled={!recommendations || chatLoading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 transition-colors cursor-pointer disabled:opacity-50"
          >
            📊 Compare top choices
          </button>
          <button 
            onClick={(e) => handleSendChat(e, 'Which option has lower total interest?')}
            disabled={!recommendations || chatLoading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 transition-colors cursor-pointer disabled:opacity-50"
          >
            📉 Which has lowest interest?
          </button>
          <button 
            onClick={(e) => handleSendChat(e, 'What happens to the EMI if I double the tenure?')}
            disabled={!recommendations || chatLoading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 transition-colors cursor-pointer disabled:opacity-50"
          >
            📅 What if tenure is doubled?
          </button>
        </div>

        {/* Input Control Box */}
        <form onSubmit={handleSendChat} className="flex gap-2 pt-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder={recommendations ? "Ask about total interest, trade-offs, or comparisons..." : "Run loan evaluation above to activate assistant..."}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-xs outline-none focus:border-indigo-500"
            disabled={!recommendations || chatLoading}
          />
          <button
            type="submit"
            disabled={!recommendations || chatLoading || !chatMessage.trim()}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-500 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
