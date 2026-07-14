import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import ModuleOfflineBlocker from '../components/ModuleOfflineBlocker';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Activity, 
  Bell, 
  User, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  ShieldCheck, 
  Key, 
  Lock, 
  Eye, 
  Sparkles,
  Info
} from 'lucide-react';
import Swal from 'sweetalert2';

// 1. ANALYTICS VIEW
export function CustomerAnalytics() {
  const { currentUser, bankAccounts, apiConnected, loading, loadData } = useBanking();

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Portfolio Asset Analytics" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  const reservesHistory = [
    { name: 'Jan', Reserve: 12000, BusinessLine: 95000 },
    { name: 'Feb', Reserve: 14500, BusinessLine: 110000 },
    { name: 'Mar', Reserve: 13900, BusinessLine: 108000 },
    { name: 'Apr', Reserve: 15400, BusinessLine: 120000 },
    { name: 'May', Reserve: 16800, BusinessLine: 115000 },
    { name: 'Jun', Reserve: 18320, BusinessLine: 125000 }
  ];

  return (
    <div className="space-y-6" id="customer-analytics-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Portfolio Asset Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">Statistical tracking of cash asset trajectories across connected portals.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cash Reserve Area Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="text-xs font-bold text-slate-950 dark:text-white mb-4">Savings Liquidity Trends</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reservesHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="primaryColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Area type="monotone" dataKey="Reserve" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#primaryColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Balance Line Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="text-xs font-bold text-slate-950 dark:text-white mb-4">Enterprise Ledger Capital Growth</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reservesHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Line type="monotone" dataKey="BusinessLine" stroke="#a855f7" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. NOTIFICATIONS VIEW
export function CustomerNotificationsPage() {
  const { notifications, dismissNotification, markAllNotificationsRead, apiConnected, loading, loadData, currentUser } = useBanking();

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="Security Alert Console" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  return (
    <div className="space-y-6" id="customer-notifications-page">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Security Alert Console</h2>
          <p className="text-xs text-slate-400 mt-0.5">Audit history logs detailing fraud and transaction risk validations.</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">All pathways secure. No alert logs.</div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 flex items-start gap-3 justify-between hover:bg-slate-50/30 dark:hover:bg-slate-950/20 ${
                  !notif.read ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${
                    notif.type === 'danger' ? 'bg-rose-500 animate-pulse' : notif.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="text-xs text-slate-300 hover:text-slate-500 px-1 font-bold"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 3. PROFILE VIEW
export function CustomerProfile() {
  const { currentUser, apiConnected, loading, loadData } = useBanking();

  if (!apiConnected) {
    return (
      <ModuleOfflineBlocker 
        moduleName="KYC Client Profile" 
        retry={() => loadData(currentUser?.email)} 
        loading={loading} 
      />
    );
  }

  return (
    <div className="space-y-6" id="customer-profile-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">KYC Client Profile</h2>
        <p className="text-xs text-slate-400 mt-0.5">Verified identity records catalogued within federal routing directories.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-center flex flex-col justify-center items-center">
          <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-600/20">
            {currentUser?.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <h3 className="text-sm font-extrabold text-slate-950 dark:text-white mt-4">{currentUser?.fullName}</h3>
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-950/40 dark:text-emerald-400 mt-1.5">
            Identity Verified
          </span>
          <p className="text-[10px] text-slate-450 mt-4 leading-relaxed">
            Registered KYC parameters are fully synchronized across compliance frameworks.
          </p>
        </div>

        {/* Detailed KYC Profile List */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
            <ShieldCheck className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-950 dark:text-white">Active KYC Record Sheets</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <span className="block font-semibold text-slate-400">Registered Full Name</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{currentUser?.fullName}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-400">Security Email Address</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{currentUser?.email}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-400">Mobile Phone Coordinates</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{currentUser?.mobileNumber}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-400">Government Identity Number (KYC ID)</span>
              <span className="font-mono font-bold text-slate-950 dark:text-indigo-400 mt-0.5 block">{currentUser?.governmentId || 'ID-992031-A'}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-400">Date of Birth</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{currentUser?.dob || '1994-06-15'}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-400">Residential Billing Coordinates</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{currentUser?.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. SETTINGS VIEW
export function CustomerSettings() {
  const [apiKey, setApiKey] = useState('aegis_token_live_' + Math.random().toString(36).substr(2, 9));
  const [isCopied, setIsCopied] = useState(false);

  const generateNewToken = () => {
    setApiKey('aegis_token_live_' + Math.random().toString(36).substr(2, 9));
    Swal.fire('API Token Rotated', 'Secure portfolio API access token refreshed.', 'success');
  };

  return (
    <div className="space-y-6" id="customer-settings-page">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Portal Configurations</h2>
        <p className="text-xs text-slate-400 mt-0.5">Configure authentication profiles and interface access tokens.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Developer API integration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Key className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-950 dark:text-white">Developer Ledger API Integration</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Utilize this secure client token to connect external platforms (such as QuickBooks or personal accounting grids) to AegisFintech ledgers.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={apiKey}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-[10px] text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-indigo-400"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
                Swal.fire('Copied', 'API token copied to clipboard.', 'success');
              }}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-500"
            >
              Copy
            </button>
          </div>
          <button
            onClick={generateNewToken}
            className="text-[10px] font-semibold text-indigo-600 hover:underline"
          >
            Rotate Security Token
          </button>
        </div>

        {/* Interface Locks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Lock className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-950 dark:text-white">Privacy & Safety Settings</h3>
          </div>
          
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Continuous Biometric Validation</span>
                <p className="text-[10px] text-slate-400">Prompt security checks on large transactions.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
            </div>

            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">AI Real-Time Ledger Intercepts</span>
                <p className="text-[10px] text-slate-400">Pre-emptively evaluate and suspend suspicious payments.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
            </div>

            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Dynamic Geofence Radius Locks</span>
                <p className="text-[10px] text-slate-400">Block transactions from outside home coordinates.</p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
