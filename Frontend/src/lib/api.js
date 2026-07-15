import axios from 'axios';

// Get API base URL from env or default to Flask standard development port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach authorization token if present
api.interceptors.request.use((config) => {

    const session = localStorage.getItem("user-session");

    if (session) {

        try {

            const user = JSON.parse(session);

            if (user && user.token) {

                console.log("==================================");
                console.log("TOKEN SENT");
                console.log(user.token);
                console.log("Request URL:", config.url);
                console.log("==================================");

                config.headers.Authorization = `Bearer ${user.token}`;

            }

        } catch (e) {

            console.error("Error parsing token from session", e);

        }

    }

    return config;

}, (error) => {

    return Promise.reject(error);

});

export const apiService = {
  // Auth operations
  login: async (email, password, role) => {
    
    const response = await api.post(
        "/auth/login",
        {
            email,
            password,
            role
        }
    );

    return response.data;
  },

  signupCustomer: async (data) => {

    const response = await api.post(
        "/auth/customer/signup",
        data
    );

    return response.data;
  },

  signupEmployee: async (data) => {

    const response = await api.post(
        "/auth/employee/signup",
        data
    );

    return response.data;
  },

  // Customer & Employee operations
  getCustomerDashboard: async () => {

    const response = await api.get(
        "/customers/dashboard"
    );

    return response.data;

},

  getBankAccounts: async () => {

    const response = await api.get(
        "/accounts/all"
    );

    return response.data;

},
  addAccount: async (account) => {
    console.log("============= PAYLOAD =============");
    console.log(account);
    console.log({
        bank_name: account.bankName,
        account_holder_name: account.accountHolderName,
        account_number: account.accountNumber,
        ifsc_code: account.ifscCode,
        branch_name: account.branchName,
        account_type: account.accountType,
        current_balance: Number(account.balance),
        is_primary: account.isPrimary
    });
    console.log("===================================");

    const response = await api.post(

        "/accounts/add",

        {

            bank_name: account.bankName,

            account_holder_name: account.accountHolderName,

            account_number: account.accountNumber,

            ifsc_code: account.ifscCode,

            branch_name: account.branchName,

            account_type: account.accountType,

            current_balance: Number(account.balance),

            is_primary: account.isPrimary

        }

    );

    return response.data;

},

  updateAccountStatus: async (id, status) => {
    const response = await api.patch(`/bank-accounts/${id}`, { status });
    return response.data;
  },

  // Transactions operations
 getTransactions: async () => {

    const response = await api.get(
        "/transactions/history"
    );

    return response.data;

},

  sendMoney: async (data) => {

    const response = await api.post(

        "/transactions/send-money",

        {

            sender_account_id: data.sender_account_id,

            receiver_name: data.receiver_name,

            receiver_account_number: data.receiver_account_number,

            receiver_bank: data.receiver_bank,

            receiver_ifsc: data.receiver_ifsc,

            amount: Number(data.amount),

            remarks: data.remarks,

            transaction_source: data.transaction_source

        }

    );

    return response.data;

},

  // Bank Statements operations
 getStatements: async () => {

    const response = await api.get(
        "/statements/all"
    );

    return response.data;

},

 uploadStatement: async (formData) => {

    const response = await api.post(

        "/statements/upload",

        formData,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

    return response.data;

},

  updateStatementStatus: async (id, status) => {
    const response = await api.patch(`/statements/${id}`, { status });
    return response.data;
  },

  // Loans recommendations and requests
  getLoans: async (customerEmail) => {
    const response = await api.get('/loans', { params: { email: customerEmail } });
    return response.data;
  },

  requestLoan: async (loanData) => {
    const response = await api.post('/loans/request', loanData);
    return response.data;
  },

  updateLoanStatus: async (id, status) => {
    const response = await api.patch(`/loans/${id}`, { status });
    return response.data;
  },

  // Notifications operations
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // AI Conversational Chat
  sendChatMsg: async (messageText, contextData = {}) => {
    const response = await api.post('/ai/chat', { message: messageText, context: contextData });
    return response.data; // Expected { text: "AI response string" }
  },

  // Credit score forecast triggering
  forecastCreditScore: async (customerEmail) => {
    const response = await api.post('/credit/forecast', { email: customerEmail });
    return response.data;
  }
};

export default api;
