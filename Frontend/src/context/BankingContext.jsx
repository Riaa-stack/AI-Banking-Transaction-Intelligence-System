import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const [customers, setCustomers] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [statements, setStatements] = useState([]);
  const [loans, setLoans] = useState([]);

  // Local notifications & chat history
  const [notifications, setNotifications] = useState([]);

  const [chatHistory, setChatHistory] = useState([]);

  // Prevent overlapping background refresh requests.
  const loadInFlightRef = useRef(false);

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

      // Avoid overlapping refresh calls, especially while employee polling is active.
      if (loadInFlightRef.current) {
          return;
      }

      loadInFlightRef.current = true;
      setLoading(true);
      setError(null);

      try {

          const accountsRes = await apiService.getBankAccounts();
          const transactionsRes = await apiService.getTransactions();
          const dashboardRes = await apiService.getCustomerDashboard();
          const statementsRes = await apiService.getStatements();
          let loansRes = { data: [] };
          try {
            loansRes = await apiService.getLoans();
          } catch {
            // fallback
          }
          let notifsRes = { data: [] };
          try {
            notifsRes = await apiService.getNotifications();
          } catch {
            // fallback
          }

          setBankAccounts(accountsRes?.data || []);
          setTransactions(transactionsRes?.data || []);

          let custList = Array.isArray(dashboardRes?.data)
            ? dashboardRes.data
            : (dashboardRes?.data?.customers || (dashboardRes?.data?.customer ? [dashboardRes.data.customer] : []));
          
          // Employee sessions should receive the employee-visible customer list.
          // Customer sessions may be restricted by the backend, so failure is ignored.
          try {
            const allCustRes = await apiService.getAllCustomers();
            if (allCustRes?.data && Array.isArray(allCustRes.data) && allCustRes.data.length > 0) {
              custList = allCustRes.data;
            }
          } catch {
            // ignore if restricted
          }
          setCustomers(custList);

          setStatements(statementsRes?.data || []);
          setLoans(loansRes?.data || []);
          setNotifications(notifsRes?.data || dashboardRes?.data?.notifications || []);
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
          setCustomers([]);
          setStatements([]);
          setLoans([]);
          setNotifications([]);
      }

      finally {

          setLoading(false);
          setApiAttempted(true);
          loadInFlightRef.current = false;

      }

  };

  // Load data when the session starts or changes.
  useEffect(() => {
    if (!currentUser?.token) {
        return;
    }

    loadData();
  }, [currentUser?.token]);

  // Keep the Employee Command Console synchronized with changes made by
  // customers in another browser/session. This re-reads the existing
  // backend endpoints and does not create mock data or new routes.
  useEffect(() => {
    const role = String(userRole || currentUser?.role || '').toLowerCase();

    if (!currentUser?.token || role !== 'employee') {
        return;
    }

    const refreshEmployeeData = () => {
        loadData();
    };

    // Refresh when the employee returns to this browser tab.
    window.addEventListener('focus', refreshEmployeeData);

    // Lightweight background refresh every 5 seconds.
    const intervalId = window.setInterval(refreshEmployeeData, 5000);

    return () => {
        window.removeEventListener('focus', refreshEmployeeData);
        window.clearInterval(intervalId);
    };
  }, [currentUser?.token, currentUser?.role, userRole]);
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
    setCustomers([]);
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

  // Get single account details from backend
  const getAccountDetails = async (id) => {
    try {
      const res = await apiService.getAccountDetails(id);
      return res?.data || res;
    } catch (err) {
      return bankAccounts.find(a => a.id === id || a.account_number === id || a.accountNumber === id) || null;
    }
  };

  // Get account specific transactions from backend
  const getAccountTransactions = async (id) => {
    try {
      const res = await apiService.getAccountTransactions(id);
      return res?.data || [];
    } catch (err) {
      const acc = bankAccounts.find(a => a.id === id || a.account_number === id || a.accountNumber === id);
      const accNum = acc?.account_number || acc?.accountNumber;
      return transactions.filter(t => t.sender_account_id === id || t.accountNumber === accNum || t.account_number === accNum || t.account_id === id);
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

        const rawMessage = err.response?.data?.message || err.message || "Money transfer failed.";

        // If message is a dict (Marshmallow validation errors), serialize it so
        // the caller can parse and display the field-level error messages
        const errorMessage = (rawMessage && typeof rawMessage === "object")
            ? JSON.stringify(rawMessage)
            : rawMessage;

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

  // Update statement review status
  const updateStatementStatus = async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.updateStatementStatus(id, status);
      await loadData();
      return res;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to update statement status.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update loan review status
  const updateLoanStatus = async (id, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.updateLoanStatus(id, newStatus);
      await loadData();
      return res;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to update loan status.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update transaction fraud action
  const updateTransactionStatus = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.updateTransactionStatus(id, payload);
      await loadData();
      return res;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to update transaction status.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Chat
  const sendChatMessage = async (messageText) => {
    const userMsg = { sender: "user", text: messageText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.chatWithAI(messageText);
      // Backend returns: { success: true, message: "...", data: "AI response text" }
      const aiText = (
        typeof response?.data === 'string'
          ? response.data
          : response?.data?.response || response?.message || "AI response unavailable."
      );
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
      getAccountDetails,
      getAccountTransactions,
      sendMoney,
      uploadStatement,
      updateStatementStatus,
      updateLoanStatus,
      updateTransactionStatus,
      chatHistory,
      sendChatMessage,
      // triggerCreditForecasting,
      dismissNotification,
      markAllNotificationsRead
    }}>
      {children}
    </BankingContext.Provider>
  );
};
