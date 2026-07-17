import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { BankingProvider, useBanking } from './context/BankingContext';
import { ShieldAlert, RefreshCw, Loader2 } from 'lucide-react';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Pages
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import { 
  CustomerAccounts, 
  CustomerTransactions, 
  CustomerStatements 
} from './pages/CustomerOperations';
import { 
  CustomerCreditScore, 
  CustomerLoans, 
  CustomerMonitoring, 
  CustomerFraud 
} from './pages/CustomerIntelligence';
import AIBankingAssistant from './components/customer/AIBankingAssistant';
import { 
  CustomerAnalytics, 
  CustomerNotificationsPage, 
  CustomerProfile, 
  CustomerSettings 
} from './pages/CustomerSecondary';

// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import { 
  EmployeeCustomers, 
  EmployeeAccounts, 
  EmployeeTransactions, 
  EmployeeStatements 
} from './pages/EmployeeOperations';
import { 
  EmployeeFraud, 
  EmployeeLoans, 
  EmployeeAnalytics, 
  EmployeeNotificationsPage, 
  EmployeeSettings 
} from './pages/EmployeeIntelligence';

// Layout and guard for Customers
function CustomerLayout() {
  const { currentUser, userRole } = useBanking();

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'customer') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// Layout and guard for Employees
function EmployeeLayout() {
  const { currentUser, userRole } = useBanking();

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'employee') {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function MainAppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Auth initialMode="login" />} />
      <Route path="/signup" element={<Auth initialMode="signup" />} />

      {/* Customer Routes inside Shell */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="bank-accounts" element={<CustomerAccounts />} />
        <Route path="transactions" element={<CustomerTransactions />} />
        <Route path="statements" element={<CustomerStatements />} />
        <Route path="assistant" element={<AIBankingAssistant />} />
        <Route path="credit-score" element={<CustomerCreditScore />} />
        <Route path="loans" element={<CustomerLoans />} />
        <Route path="monitoring" element={<CustomerMonitoring />} />
        <Route path="fraud-detection" element={<CustomerFraud />} />
        <Route path="analytics" element={<CustomerAnalytics />} />
        <Route path="notifications" element={<CustomerNotificationsPage />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="settings" element={<CustomerSettings />} />
      </Route>

      {/* Employee Routes inside Shell */}
      <Route path="/employee" element={<EmployeeLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="customers" element={<EmployeeCustomers />} />
        <Route path="bank-accounts" element={<EmployeeAccounts />} />
        <Route path="monitoring" element={<EmployeeTransactions />} />
        <Route path="statements" element={<EmployeeStatements />} />
        <Route path="fraud-detection" element={<EmployeeFraud />} />
        <Route path="loans" element={<EmployeeLoans />} />
        <Route path="analytics" element={<EmployeeAnalytics />} />
        <Route path="notifications" element={<EmployeeNotificationsPage />} />
        <Route path="settings" element={<EmployeeSettings />} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BankingProvider>
        <MainAppRoutes />
      </BankingProvider>
    </BrowserRouter>
  );
}
