import React from 'react';
import { useBanking } from '../context/BankingContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  FileText, 
  MessageSquareCode, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Users,
  CheckSquare,
  Search,
  Scale
} from 'lucide-react';

export default function Sidebar() {
  const { userRole, logoutUser } = useBanking();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  // Menu lists based on the two distinct roles requested
  const customerMenu = [
    { name: "Dashboard", path: "/customer/dashboard", icon: LayoutDashboard },
    { name: "Bank Accounts", path: "/customer/bank-accounts", icon: Wallet },
    { name: "Transactions", path: "/customer/transactions", icon: ArrowLeftRight },
    { name: "Bank Statements", path: "/customer/statements", icon: FileText },
    { name: "AI Assistant", path: "/customer/assistant", icon: MessageSquareCode },
    { name: "Credit Predictor", path: "/customer/credit-score", icon: TrendingUp },
    { name: "Loan Rec Engine", path: "/customer/loans", icon: Scale },
    { name: "Txn Monitoring", path: "/customer/monitoring", icon: Search },
    { name: "Fraud Detection", path: "/customer/fraud-detection", icon: ShieldAlert },
    { name: "Analytics", path: "/customer/analytics", icon: Activity },
    { name: "Notifications", path: "/customer/notifications", icon: Bell },
    { name: "Profile", path: "/customer/profile", icon: User },
    { name: "Settings", path: "/customer/settings", icon: Settings },
  ];

  const employeeMenu = [
    { name: "Staff Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
    { name: "Customer Ledger", path: "/employee/customers", icon: Users },
    { name: "Bank Accounts", path: "/employee/bank-accounts", icon: Wallet },
    { name: "Txn Monitoring", path: "/employee/monitoring", icon: Search },
    { name: "Statement Review", path: "/employee/statements", icon: CheckSquare },
    { name: "Fraud Audit", path: "/employee/fraud-detection", icon: ShieldAlert },
    { name: "Loan Review", path: "/employee/loans", icon: Scale },
    { name: "System Analytics", path: "/employee/analytics", icon: Activity },
    { name: "System Alerts", path: "/employee/notifications", icon: Bell },
    { name: "Settings", path: "/employee/settings", icon: Settings },
  ];

  const currentMenu = userRole === 'employee' ? employeeMenu : customerMenu;

  return (
    <aside className="flex h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-slate-200/80 bg-white px-4 py-6 dark:border-slate-800/80 dark:bg-slate-900 transition-colors duration-200" id="global-sidebar">
      {/* Navigation list */}
      <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
        <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500 mb-2">
          {userRole === 'employee' ? 'Operational Control' : 'Personal Banking'}
        </span>
        
        {currentMenu.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold tracking-tight transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10 dark:bg-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`
              }
            >
              <IconComponent className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Logout button */}
      <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold tracking-tight text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
}
