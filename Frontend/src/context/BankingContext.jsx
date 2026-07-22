import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../lib/api';

const BankingContext = createContext(null);

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};

export const BankingProvider = ({ children }) => {
  // Theme state: defaults to light mode or localstorage selection
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  // Auth states
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user-session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('user-role') || null;
  });

  // API connectivity & global states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiAttempted, setApiAttempted] = useState(false);

  // Core business datasets
  const [customers, setCustomers] = useState({});
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [statements, setStatements] = useState([]);
  const [loans, setLoans] = useState([]);

  // Local notifications & chat history
  const [notifications, setNotifications] = useState([]);

  const [chatHistory, setChatHistory] = useState([]);

  // Theme synchronization with Document Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Load all operational data from API
  const loadData = async () => {

      if (!currentUser || !currentUser.token) {
          return;
      }

      setLoading(true);
      setError(null);

      try {

          const accountsRes = await apiService.getBankAccounts();
          console.log("Accounts:", accountsRes);

          const transactionsRes = await apiService.getTransactions();
          console.log("Transactions:", transactionsRes);

          const dashboardRes = await apiService.getCustomerDashboard();
          console.log("Dashboard:", dashboardRes);

          const statementsRes = await apiService.getStatements();
          console.log("============== STATEMENTS ==============");
          console.log(statementsRes);
          console.log(statementsRes.data);
          console.log("========================================");

          setBankAccounts(accountsRes?.data || []);

          setTransactions(transactionsRes?.data || []);

          setCustomers(dashboardRes?.data);

          setStatements(statementsRes?.data || []);

          setLoans([]);

          setNotifications([]);

          setApiConnected(true);

      } catch (err) {

          console.error("Aegis Secure API unavailable:", err);

          if (err.response?.status === 401) {

              localStorage.removeItem("user-session");
              localStorage.removeItem("user-role");

              setCurrentUser(null);

              setUserRole(null);

          }

          setApiConnected(false);

          setError(
              err.response?.data?.message ||
              "Failed to retrieve banking data."
          );

          setBankAccounts([]);

          setTransactions([]);

          setCustomers({});

          setStatements([]);

          setLoans([]);

      }

      finally {

          setLoading(false);

          setApiAttempted(true);

      }

  };

  // Reload data whenever currentUser session's email changes
  useEffect(() => {

    if (!currentUser?.token) {
        return;
    }

    loadData();

  }, [currentUser?.token]);
  // Auth Operations
  const loginUser = async (email, password, role) => {

      setLoading(true);
      setError(null);

      try {

          const res = await apiService.login(
              email,
              password,
              role
          );

          if (!res.success) {

              return {
                  success: false,
                  message: res.message
              };

          }

          const user = {

              id: res.data.user.id,

              fullName: res.data.user.full_name,

              email: res.data.user.email,

              role: String(res.data.user.role).toLowerCase(),

              token: res.data.access_token

          };

          localStorage.setItem(
              "user-session",
              JSON.stringify(user)
          );

          localStorage.setItem(
              "user-role",
              user.role
          );

          setCurrentUser(user);

          setUserRole(user.role);

          return {

              success: true,

              user

          };

      }

      catch (error) {

          const message =
              error.response?.data?.message ||
              error.message ||
              "Login failed.";

          setError(message);

          return {

              success: false,

              message

          };

      }

      finally {

          setLoading(false);

      }

  };

  const logoutUser = () => {
    setCurrentUser(null);
    setUserRole(null);
    setApiConnected(false);
    setApiAttempted(false);
    localStorage.removeItem('user-session');
    localStorage.removeItem('user-role');
    setBankAccounts([]);
    setTransactions([]);
    setStatements([]);
    setLoans([]);
    setCustomers({});
  };

  const signupCustomer = async (signupData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.signupCustomer(
          signupData
      );
      if (res && res.success) {
        
        return { success: true };
      }
      return { success: false, message: res?.message || "Registration failed." };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to process registration.";
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };
  const signupEmployee = async (signupData) => {

    setLoading(true);
    setError(null);

    try {

        const res = await apiService.signupEmployee(
            signupData
        );

        if (res && res.success) {

            return {
                success: true
            };

        }

        return {
            success: false,
            message: res?.message || "Registration failed."
        };

    }

    catch (err) {

        const errMsg =
            err.response?.data?.message ||
            err.message ||
            "Failed to process employee registration.";

        setError(errMsg);

        return {
            success: false,
            message: errMsg
        };

    }

    finally {

        setLoading(false);

    }

};
  // Add Bank Account
  const addAccount = async (accountData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.addAccount(accountData);      await loadData();
      return res;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to link bank account.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update Account Status
  const updateAccountStatus = async (id, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.updateAccountStatus(id, newStatus);
      await loadData();
      return res;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to update account status.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Outbound transfer
  const sendMoney = async (transactionData) => {

    setLoading(true);

    setError(null);

    try {

        const response = await apiService.sendMoney(
            transactionData
        );

        await loadData();

        return response;

    } catch (err) {

        const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Money transfer failed.";

        setError(errorMessage);

        throw new Error(errorMessage);

    } finally {

        setLoading(false);

    }

};

  // Upload bank statements (OCR)
  const uploadStatement = async (formData) => {

      setLoading(true);
      setError(null);

      try {

          const res = await apiService.uploadStatement(formData);

          await loadData();

          return res;

      } catch (err) {

          const errMsg =
              err.response?.data?.message ||
              err.message ||
              "Failed to upload bank statement.";

          setError(errMsg);

          throw new Error(errMsg);

      } finally {

          setLoading(false);

      }

  };

  // const updateStatementStatus = async (id, status) => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const res = await apiService.updateStatementStatus(id, status);
  //     await loadData();
  //     return res;
  //   } catch (err) {
  //     const errMsg = err.response?.data?.message || err.message || "Failed to update statement status.";
  //     setError(errMsg);
  //     throw new Error(errMsg);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Chat
  const sendChatMessage = async (messageText) => {
    const userMsg = { sender: "user", text: messageText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.chatWithAI(messageText);
      const aiText = response?.data?.response || response?.response || response?.message || "AI response unavailable.";
      const aiMsg = { sender: "assistant", text: aiText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "AI response unavailable.";
      const errorMsg = {
        sender: "assistant",
        text: `Error: ${errMsg}. Please verify secure API connectivity.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Request loans
  // const requestLoanApplication = async (loanType, amount, tenure) => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const res = await apiService.requestLoan({
  //       type: loanType,
  //       amount: parseFloat(amount),
  //       tenure: parseInt(tenure),
  //       email: currentUser?.email
  //     });
  //     await loadData();
  //     return res;
  //   } catch (err) {
  //     const errMsg = err.response?.data?.message || err.message || "Failed to submit loan request.";
  //     setError(errMsg);
  //     throw new Error(errMsg);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const updateLoanStatus = async (id, newStatus) => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const res = await apiService.updateLoanStatus(id, newStatus);
  //     await loadData();
  //     return res;
  //   } catch (err) {
  //     const errMsg = err.response?.data?.message || err.message || "Failed to update loan status.";
  //     setError(errMsg);
  //     throw new Error(errMsg);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const triggerCreditForecasting = async () => {
  //   if (!currentUser) return;
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const res = await apiService.forecastCreditScore(currentUser.email);
  //     await loadData();
  //     return { success: true };
  //   } catch (err) {
  //     const errMsg = err.response?.data?.message || err.message || "Failed to forecast credit score.";
  //     setError(errMsg);
  //     return { success: false, message: errMsg };
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <BankingContext.Provider value={{
      theme,
      toggleTheme,
      currentUser,
      userRole,
      customers,
      bankAccounts,
      transactions,
      statements,
      loans,
      notifications,
      // chatHistory,
      loading,
      error,
      apiConnected,
      apiAttempted,
      loadData,
      loginUser,
      logoutUser,
      signupCustomer,
      signupEmployee,
      addAccount,
      updateAccountStatus,
      sendMoney,
      uploadStatement,
      // updateStatementStatus,
      chatHistory,
      sendChatMessage,
      // requestLoanApplication,
      // updateLoanStatus,
      // triggerCreditForecasting,
      dismissNotification,
      markAllNotificationsRead
    }}>
      {children}
    </BankingContext.Provider>
  );
};
