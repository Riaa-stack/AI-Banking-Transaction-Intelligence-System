import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBanking } from '../context/BankingContext';
import { ShieldCheck, Plus, Trash2, Landmark, Info, Key, Eye, EyeOff, User, ArrowLeft, Sun, Moon, FileText, UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Auth({ initialMode = 'login' }) {
  const { theme, toggleTheme, loginUser, signupCustomer, signupEmployee } = useBanking();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('customer'); // 'customer' or 'employee'
  const [showPassword, setShowPassword] = useState(false);
  const [signupRole, setSignupRole] = useState("customer");

  // Signup states
  const [personalData, setPersonalData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    governmentId: '',
    dob: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  // Dynamic list of starting bank accounts
  const [linkedAccounts, setLinkedAccounts] = useState([
    {
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        accountType: 'Savings',
        isPrimary: true,
        balance: '',

        statementMonth: '',
        statementYear: '',
        statementStartDate: '',
        statementEndDate: '',

        inputMethod: 'manual',
        pdfFileName: '',
        isOcrParsing: false,
        transactions: []
    }
]);
  const [statementFiles, setStatementFiles] = useState([]);

  const handlePersonalChange = (e) => {
    setPersonalData({ ...personalData, [e.target.name]: e.target.value });
  };
  const handleStatementUpload = (index, e) => {

    const files = [...statementFiles];

    files[index] = e.target.files[0];

    setStatementFiles(files);

  };

  const handleAccountChange = (index, e) => {
    const updated = [...linkedAccounts];
    const { name, value, type, checked } = e.target;
    updated[index][name] = type === 'checkbox' ? checked : value;

    // If making primary, ensure others are false
    if (name === 'isPrimary' && checked) {
      updated.forEach((acc, i) => {
        if (i !== index) acc.isPrimary = false;
      });
    }
    setLinkedAccounts(updated);
  };

  const addAnotherAccount = () => {
    setLinkedAccounts([
      ...linkedAccounts,
      {
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        accountType: 'Current',
        isPrimary: false,
        statementMonth: '',
        statementYear: '',
        statementStartDate: '',
        statementEndDate: '',
        balance: '',
        inputMethod: 'manual', // 'manual' or 'pdf'
        pdfFileName: '',
        isOcrParsing: false,
        transactions: []
      }
    ]);
  };

  const addTransactionToAccount = (accountIndex) => {
    const updated = [...linkedAccounts];
    if (!updated[accountIndex].transactions) {
      updated[accountIndex].transactions = [];
    }
    updated[accountIndex].transactions.push({
      description: '',
      type: 'Debit',
      amount: '',
      category: 'General',
      timestamp: new Date().toISOString().split('T')[0],
      riskScore: 10
    });
    setLinkedAccounts(updated);
  };

  const removeTransactionFromAccount = (accountIndex, txnIndex) => {
    const updated = [...linkedAccounts];
    updated[accountIndex].transactions = updated[accountIndex].transactions.filter((_, i) => i !== txnIndex);
    setLinkedAccounts(updated);
  };

  const handleTxnChange = (accountIndex, txnIndex, field, value) => {
    const updated = [...linkedAccounts];
    updated[accountIndex].transactions[txnIndex][field] = value;
    setLinkedAccounts(updated);
  };

  const removeAccount = (index) => {
    if (linkedAccounts.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'At least one primary bank account must be added during registration.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }
    const updated = linkedAccounts.filter((_, i) => i !== index);
    // If we removed the primary account, set the first one as primary
    if (!updated.some(a => a.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setLinkedAccounts(updated);
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please input both your registered email address and security password.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }
    console.log("Email :", loginEmail);
    console.log("Password :", loginPassword);
    console.log("Role :", loginRole);

    const res = await loginUser(loginEmail, loginPassword, loginRole);
    if (res && res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Access Granted',
        text: `Welcome back, ${res.user.fullName}!`,
        timer: 1500,
        showConfirmButton: false
      });
     if (res.user.role === "employee") {

          navigate("/employee/dashboard");

      } else {

          navigate("/customer/dashboard");

      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Failed',
        text: res ? res.message : 'Invalid credentials.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    
    // Check fields
    const { fullName, email, mobileNumber, governmentId, dob, address, password, confirmPassword } = personalData;
    if (!fullName || !email || !mobileNumber || !governmentId || !dob || !address || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'All personal identity details are required to satisfy KYC parameters.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    if (fullName.trim().length < 3) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Name',
        text: 'Full name must be at least 3 characters long.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Mobile Number',
        text: 'Mobile number must be exactly 10 digits.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    if (password.length < 8) {
      Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters long.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords Mismatch',
        text: 'Your password and confirmation fields do not match.',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // Check account validation
    // ===============================
    // Validate Customer Bank Accounts
    // ===============================

    if (signupRole === "customer") {
      for (let i = 0; i < linkedAccounts.length; i++) {
        const acc = linkedAccounts[i];
        if (
          !acc.bankName ||
          !acc.accountHolderName ||
          !acc.accountNumber ||
          !acc.ifscCode ||
          !acc.branchName ||
          !acc.accountType ||
          acc.balance === ''
        ) {
          Swal.fire({
            icon: "warning",
            title: `Bank Account ${i + 1} Incomplete`,
            text: "Please complete all required bank account details.",
            confirmButtonColor: "#4f46e5"
          });
          return;
        }

        // Additional validation to match backend requirements for primary bank account
        if (i === 0) {
          if (acc.bankName.trim().length < 2) {
            Swal.fire({
              icon: 'warning',
              title: 'Invalid Bank Name',
              text: 'Bank name must be at least 2 characters long.',
              confirmButtonColor: '#4f46e5'
            });
            return;
          }
          if (acc.accountHolderName.trim().length < 3) {
            Swal.fire({
              icon: 'warning',
              title: 'Invalid Account Holder Name',
              text: 'Account holder name must be at least 3 characters long.',
              confirmButtonColor: '#4f46e5'
            });
            return;
          }
          if (acc.accountNumber.trim().length < 8 || acc.accountNumber.trim().length > 30) {
            Swal.fire({
              icon: 'warning',
              title: 'Invalid Account Number',
              text: 'Account number must be between 8 and 30 characters.',
              confirmButtonColor: '#4f46e5'
            });
            return;
          }
          if (acc.ifscCode.trim().length !== 11) {
            Swal.fire({
              icon: 'warning',
              title: 'Invalid IFSC Code',
              text: 'IFSC Code must be exactly 11 characters.',
              confirmButtonColor: '#4f46e5'
            });
            return;
          }
          if (acc.branchName.trim().length < 2) {
            Swal.fire({
              icon: 'warning',
              title: 'Invalid Branch Name',
              text: 'Branch name must be at least 2 characters long.',
              confirmButtonColor: '#4f46e5'
            });
            return;
          }
        }
      }
    }

    // Register
    const signupData = {
      full_name: personalData.fullName.trim(),
      email: personalData.email.trim(),
      mobile_number: personalData.mobileNumber.trim(),
      government_id: personalData.governmentId.trim(),
      date_of_birth: personalData.dob,
      address: personalData.address.trim(),
      password: personalData.password,
      confirm_password: personalData.confirmPassword
    };

    if (signupRole === "customer") {
      signupData.bank_name = linkedAccounts[0].bankName.trim();
      signupData.account_holder_name = linkedAccounts[0].accountHolderName.trim();
      signupData.account_number = linkedAccounts[0].accountNumber.trim();
      signupData.ifsc_code = linkedAccounts[0].ifscCode.trim();
      signupData.branch_name = linkedAccounts[0].branchName.trim();
      signupData.account_type = linkedAccounts[0].accountType;
      signupData.current_balance = Number(linkedAccounts[0].balance);
    }

    console.log("Signup Data:", signupData);

    let res;
    if (signupRole === "customer") {
      res = await signupCustomer(signupData);
    } else {
      res = await signupEmployee(signupData);
    }

    if (!res.success) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: res.message || "Unable to register."
      });
      return;
    }

    // ===============================
    // Auto Login
    // ===============================

    const loginRes = await loginUser(
      personalData.email,
      personalData.password,
      signupRole
    );

    if (!loginRes.success) {
      Swal.fire({
        icon: "warning",
        title: "Registration Successful",
        text: "Account created successfully, but automatic login failed. Please login manually."
      });

      setMode("login");
      setLoginEmail(personalData.email);
      setLoginRole(signupRole);
      return;
    }

    // ===============================
    // TODO (Next Step)
    // Create Bank Accounts
    // Upload Statements
    // ===============================

    Swal.fire({
      icon: "success",
      title: "Registration Successful",
      text: "Your account has been created successfully.",
      timer: 1800,
      showConfirmButton: false
    });

    if (signupRole === "employee") {
      navigate("/employee/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200" id="auth-page">
      
      {/* Left branding pane (Stripe styled visual) */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 p-12 text-white relative overflow-hidden">
        {/* Ambient abstract visual patterns */}
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl opacity-40" />
        
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold shadow-lg shadow-indigo-600/30">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-white">Aegis<span className="text-indigo-400">Fintech</span></span>
          </Link>
        </div>

        <div className="my-auto max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/20 mb-6">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Advanced Risk Auditing Suite
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl leading-tight">
            The next evolution in banking security and intelligence.
          </h2>
          <p className="mt-4 text-xs text-slate-300 leading-relaxed">
            Protect assets, predict financial trajectories, and streamline document reviews using our unified OCR and machine learning monitoring framework.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">1</div>
              <div>
                <p className="text-xs font-bold text-white">Dynamic Asset Ledger</p>
                <p className="text-[10px] text-slate-400">Aggregates liquidity records instantly across multi-bank architectures.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">2</div>
              <div>
                <p className="text-xs font-bold text-white">OCR Parsing Automation</p>
                <p className="text-[10px] text-slate-400">Instantly extracts micro-debts and savings patterns from PDF statements.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">3</div>
              <div>
                <p className="text-xs font-bold text-white">Conversational Guidance</p>
                <p className="text-[10px] text-slate-400">LLM-modeled chat assistance trained on client personal cash flows.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          AegisFintech Platform Security Version 3.02. All rights secured.
        </div>
      </div>

      {/* Right form container */}
      <div className="w-full lg:w-3/5 flex flex-col px-6 py-8 md:px-10 lg:px-12 overflow-y-auto h-screen">
        
        {/* Back Link & Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to Homepage
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </div>

        {mode === 'login' ? (
          <div className="w-full max-w-md mx-auto" id="login-form-container">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">Sign In to AegisFintech</h3>
            <p className="text-xs text-slate-500 mt-1">Select your access role and input security credentials.</p>

            {/* Role switchers */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mt-6">
              <button
                type="button"
                onClick={() => setLoginRole('customer')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  loginRole === 'customer' 
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Customer Portal
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('employee')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  loginRole === 'employee' 
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Bank Employee
              </button>
            </div>

            {/* Login form */}
            <form onSubmit={submitLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Security Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-3 pr-10 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/10 mt-6"
              >
                Proceed & Authenticate
              </button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-xs text-slate-500">New Client? </span>
              <button
                onClick={() => setMode('signup')}
                className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Register Customer Account & Bank Portfolio
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto" id="signup-form-container">

    <h3 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
        Create Your Account
    </h3>

    <p className="text-xs text-slate-500 mt-1">
        Register as a Customer or Bank Employee.
    </p>

    {/* Role Selector */}
    <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mt-6">

        <button
            type="button"
            onClick={() => setSignupRole("customer")}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
                signupRole === "customer"
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900"
            }`}
        >
            Customer
        </button>

        <button
            type="button"
            onClick={() => setSignupRole("employee")}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
                signupRole === "employee"
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900"
            }`}
        >
            Bank Employee
        </button>

    </div>

    <form onSubmit={submitSignup} className="mt-6 space-y-6">

        {/* Personal Details */}

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900">

            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-100 pb-2 dark:border-slate-800">

                1. Personal Details

            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                    <label className="block text-[11px] font-bold text-slate-500">
                        Full Name
                    </label>

                    <input
                        type="text"
                        name="fullName"
                        value={personalData.fullName}
                        onChange={handlePersonalChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500">
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={personalData.email}
                        onChange={handlePersonalChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500">
                        Mobile Number
                    </label>

                    <input
                        type="text"
                        name="mobileNumber"
                        value={personalData.mobileNumber}
                        onChange={handlePersonalChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500">
                        Government ID
                    </label>

                    <input
                        type="text"
                        name="governmentId"
                        value={personalData.governmentId}
                        onChange={handlePersonalChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500">
                        Date of Birth
                    </label>

                    <input
                        type="date"
                        name="dob"
                        value={personalData.dob}
                        onChange={handlePersonalChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500">
                        Address
                    </label>

                    <input
                        type="text"
                        name="address"
                        value={personalData.address}
                        onChange={handlePersonalChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500">
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={personalData.password}
                        onChange={handlePersonalChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500">
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={personalData.confirmPassword}
                        onChange={handlePersonalChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                    />
                </div>

            </div>

        </div>

        {signupRole === "customer" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">2. Bank Account Details</h4>
                  <button
                    type="button"
                    onClick={addAnotherAccount}
                    className="flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-all dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
                  >
                    <Plus className="h-3 w-3" /> Add Another Bank Account
                  </button>
                </div>

                <div className="space-y-4">
                  {linkedAccounts.map((acc, index) => (
                    <div key={index} className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 relative">
                      {linkedAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAccount(index)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Landmark className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Bank Account #{index + 1}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Bank Name</label>
                          <input
                            type="text"
                            name="bankName"
                            value={acc.bankName}
                            onChange={(e) => handleAccountChange(index, e)}
                            placeholder="Chase Bank / Bank of America"
                            required
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Account Holder Name</label>
                          <input
                            type="text"
                            name="accountHolderName"
                            required
                            value={acc.accountHolderName}
                            onChange={(e) => handleAccountChange(index, e)}
                            placeholder="Sarah Jenkins (or leave blank for Self)"
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Account Number</label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={acc.accountNumber}
                            onChange={(e) => handleAccountChange(index, e)}
                            placeholder="99102938472"
                            required
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">IFSC / Branch Code</label>
                          <input
                            type="text"
                            name="ifscCode"
                            value={acc.ifscCode}
                            onChange={(e) => handleAccountChange(index, e)}
                            placeholder="CHAS0001092"
                            required
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Branch Name</label>
                          <input
                            type="text"
                            name="branchName"
                            value={acc.branchName}
                            onChange={(e) => handleAccountChange(index, e)}
                            placeholder="Manhattan Plaza"
                            required
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Account Type</label>
                          <select
                            name="accountType"
                            value={acc.accountType}
                            onChange={(e) => handleAccountChange(index, e)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          >
                            <option value="Savings">Savings</option>
                            <option value="Current">Current</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Opening Balance ($)</label>
                          <input
                            type="number"
                            name="balance"
                            value={acc.balance}
                            onChange={(e) => handleAccountChange(index, e)}
                            placeholder="5000"
                            required
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-5 md:col-span-2">
                          <input
                            type="checkbox"
                            name="isPrimary"
                            id={`isPrimary-${index}`}
                            checked={acc.isPrimary}
                            onChange={(e) => handleAccountChange(index, e)}
                            className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                          <label htmlFor={`isPrimary-${index}`} className="text-xs font-semibold text-slate-600 dark:text-slate-400">Set as Primary Cash Account</label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500">
                                Statement Month
                            </label>

                            <select
                                name="statementMonth"
                                value={acc.statementMonth}
                                onChange={(e) => handleAccountChange(index, e)}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="">Select Month</option>
                                <option value="January">January</option>
                                <option value="February">February</option>
                                <option value="March">March</option>
                                <option value="April">April</option>
                                <option value="May">May</option>
                                <option value="June">June</option>
                                <option value="July">July</option>
                                <option value="August">August</option>
                                <option value="September">September</option>
                                <option value="October">October</option>
                                <option value="November">November</option>
                                <option value="December">December</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500">
                                Statement Year
                            </label>

                            <input
                                type="number"
                                name="statementYear"
                                value={acc.statementYear}
                                onChange={(e) => handleAccountChange(index, e)}
                                placeholder="2026"
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500">
                                Statement Start Date
                            </label>

                            <input
                                type="date"
                                name="statementStartDate"
                                value={acc.statementStartDate}
                                onChange={(e) => handleAccountChange(index, e)}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500">
                                Statement End Date
                            </label>

                            <input
                                type="date"
                                name="statementEndDate"
                                value={acc.statementEndDate}
                                onChange={(e) => handleAccountChange(index, e)}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                            />
                        </div>

                    </div>
                      <div className="md:col-span-3 mt-5">
                      
                        <label className="block text-[10px] font-bold text-slate-500 mb-2">
                            Bank Statement PDF
                        </label>

                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleStatementUpload(index, e)}
                            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        />

                        <p className="mt-2 text-[10px] text-slate-400">
                            Upload the statement for this account. The system will automatically extract the transaction history using OCR and AI.
                        </p>

                    </div>
                      
                    </div>
                  ))}
                </div>
              </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/10"
              >
                Create Account 
              </button>
            </form>

            <div className="mt-6 text-center border-t border-slate-150 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-500">Already registered? </span>
              <button
                onClick={() => setMode('login')}
                className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Access Portal (Sign In)
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
