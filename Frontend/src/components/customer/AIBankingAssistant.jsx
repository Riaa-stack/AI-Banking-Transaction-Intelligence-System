import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import ModuleOfflineBlocker from '../ModuleOfflineBlocker';
import { Send, Sparkles, Mic } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AIBankingAssistant() {
  const { chatHistory, sendChatMessage, apiConnected, loading, loadData, currentUser } = useBanking();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker
        moduleName="Aegis AI Banking Copilot"
        retry={() => loadData(currentUser?.email)}
        loading={loading}
      />
    );
  }

  const suggestionChips = [
    'What is my current total liquid balance?',
    'Am I eligible for a capital expansion loan?',
    'Why is transaction TXN-90185 marked high-risk?',
    'How can I boost my forecasted credit score?'
  ];

  const handleSend = (text) => {
    const msg = text || inputText;
    if (!msg.trim()) return;

    sendChatMessage(msg);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900 shadow-sm" id="customer-assistant-page">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-950 dark:text-white">Aegis AI Banking Copilot</h3>
            <span className="flex items-center gap-1 text-[9px] text-indigo-500 font-bold uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" /> Active Semantic Model
            </span>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">Context: Connected Ledger API</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              <div className="text-xs leading-relaxed whitespace-pre-line">{msg.text}</div>
              <span className="block text-[8px] mt-1.5 text-right opacity-60 font-medium">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai py-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
                <span>AI is compiling ledger response...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-slate-50/40 border-t border-slate-50 dark:bg-slate-950/20 dark:border-slate-800/60 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => Swal.fire('Voice Assistant', 'Speech Recognition token initialized. (Simulated Microphone)', 'info')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
            title="Voice Command"
          >
            <Mic className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI assistant about balances, loan models, or credit audits..."
            className="flex-1 rounded-xl border border-slate-200 px-4 text-xs outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
