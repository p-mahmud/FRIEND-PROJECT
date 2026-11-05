import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  AlertCircle, 
  FileText, 
  ArrowRightLeft, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Bell, 
  Check, 
  Lock, 
  User as UserIcon,
  Menu,
  X,
  Briefcase,
  Layers,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { apiRequest } from './utils/api.js';
import { 
  Member, 
  Collection, 
  Expense, 
  SystemSettings as TSystemSettings, 
  DashboardNotification, 
  ActivityLog, 
  Transaction,
  DatabaseState
} from './types.js';

// Import sub-components
import AdminDashboard from './components/AdminDashboard.jsx';
import MemberManagement from './components/MemberManagement.jsx';
import CollectionModule from './components/CollectionModule.jsx';
import ExpenseManagement from './components/ExpenseManagement.jsx';
import DueManagement from './components/DueManagement.jsx';
import DetailedReports from './components/DetailedReports.jsx';
import TransactionLedger from './components/TransactionLedger.jsx';
import SystemSettings from './components/SystemSettings.jsx';
import UserDashboard from './components/UserDashboard.jsx';

export default function App() {
  // Session States
  const [user, setUser] = useState<{ id?: string; username: string; name: string; role: 'admin' | 'user'; email?: string; phone?: string; address?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Core Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dueData, setDueData] = useState<{ summaries: any[]; breakdown: any[] }>({ summaries: [], breakdown: [] });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<TSystemSettings>({
    fundName: "Friends Monthly Fund",
    monthlyContributionAmount: 1000,
    currency: "৳",
    logo: "FMF",
    theme: 'light'
  });

  // Consolidated dashboard analytics
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // App layouts / Navigations
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Login form parameters
  const [loginRole, setLoginRole] = useState<'admin' | 'user'>('admin');
  const [loginUsername, setLoginUsername] = useState('pavel28'); // Pre-fill admin for convenience
  const [loginPassword, setLoginPassword] = useState('123456789'); // Pre-fill admin password
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Toast / System banners
  const [toastMsg, setToastMsg] = useState('');

  // 1. Check local session cache on start
  useEffect(() => {
    const cachedToken = localStorage.getItem('fmf_session_token');
    const cachedUser = localStorage.getItem('fmf_user');
    const cachedTheme = localStorage.getItem('fmf_theme') as 'light' | 'dark';

    if (cachedTheme) {
      setThemeMode(cachedTheme);
      document.documentElement.classList.toggle('dark', cachedTheme === 'dark');
    }

    if (cachedToken && cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        setToken(cachedToken);
        if (parsedUser.role === 'user') {
          setCurrentTab('my-portal');
        }
      } catch (e) {
        localStorage.removeItem('fmf_session_token');
        localStorage.removeItem('fmf_user');
      }
    }
  }, []);

  // 2. Fetch all database states when token matches
  const refreshDatabase = async () => {
    if (!token) return;
    try {
      const fetchedSettings = await apiRequest('/api/settings');
      setSettings(fetchedSettings);
      
      const fetchedMembers = await apiRequest('/api/members');
      setMembers(fetchedMembers);

      const fetchedCollections = await apiRequest('/api/collections');
      setCollections(fetchedCollections);

      const fetchedExpenses = await apiRequest('/api/expenses');
      setExpenses(fetchedExpenses);

      const fetchedDues = await apiRequest('/api/dues');
      setDueData(fetchedDues);

      const fetchedTxns = await apiRequest('/api/transactions');
      setTransactions(fetchedTxns);

      const fetchedNotifications = await apiRequest('/api/notifications');
      setNotifications(fetchedNotifications);

      const fetchedLogs = await apiRequest('/api/logs');
      setLogs(fetchedLogs);

      const fetchedDashboard = await apiRequest('/api/dashboard/stats');
      setDashboardStats(fetchedDashboard);
    } catch (e) {
      console.error('Failed to load system database records:', e);
    }
  };

  useEffect(() => {
    if (token) {
      refreshDatabase();
    }
  }, [token]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const data = await apiRequest('/api/auth/login', 'POST', {
        username: loginUsername,
        password: loginPassword
      });

      localStorage.setItem('fmf_session_token', data.token);
      localStorage.setItem('fmf_user', JSON.stringify(data.user));
      
      setUser(data.user);
      setToken(data.token);
      showToast(`Logged in successfully as ${data.user.name}`);

      if (data.user.role === 'admin') {
        setCurrentTab('dashboard');
      } else {
        setCurrentTab('my-portal');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials or connection failure.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fmf_session_token');
    localStorage.removeItem('fmf_user');
    setUser(null);
    setToken(null);
    setCurrentTab('dashboard');
    showToast('Logged out successfully.');
  };

  // Helper triggers
  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleThemeToggle = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
    localStorage.setItem('fmf_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    showToast(`Switched to ${nextTheme} visual theme.`);
  };

  // --- API TRIGGERING HANDLERS ---
  
  const handleAddMember = async (memberData: any) => {
    await apiRequest('/api/members', 'POST', memberData);
    await refreshDatabase();
    showToast('Member directory record added successfully!');
  };

  const handleUpdateMember = async (id: string, memberData: any) => {
    await apiRequest(`/api/members/${id}`, 'PUT', memberData);
    await refreshDatabase();
    showToast('Member profile details updated.');
  };

  const handleDeleteMember = async (id: string) => {
    await apiRequest(`/api/members/${id}`, 'DELETE');
    await refreshDatabase();
    showToast('Member removed from directory.');
  };

  const handleAddCollection = async (data: any) => {
    await apiRequest('/api/collections', 'POST', data);
    await refreshDatabase();
    showToast('Monthly payment contribution recorded!');
  };

  const handleDeleteCollection = async (id: string) => {
    await apiRequest(`/api/collections/${id}`, 'DELETE');
    await refreshDatabase();
    showToast('Collection payment record deleted.');
  };

  const handleAddExpense = async (data: any) => {
    await apiRequest('/api/expenses', 'POST', data);
    await refreshDatabase();
    showToast('Expenditure transaction recorded.');
  };

  const handleDeleteExpense = async (id: string) => {
    await apiRequest(`/api/expenses/${id}`, 'DELETE');
    await refreshDatabase();
    showToast('Expense record removed.');
  };

  const handleUpdateSettings = async (data: any) => {
    await apiRequest('/api/settings', 'PUT', data);
    await refreshDatabase();
    showToast('Institutional parameters saved.');
  };

  const handleResetDatabase = async () => {
    await apiRequest('/api/database/reset', 'POST');
    await refreshDatabase();
    showToast('System returned to factory seeds.');
  };

  const handleRestoreDatabase = async (backupData: any) => {
    await apiRequest('/api/database/restore', 'POST', { backupData });
    await refreshDatabase();
    showToast('Database archive restored.');
  };

  const handleUpdateUserProfile = async (id: string, data: any) => {
    await apiRequest(`/api/profile/${id}`, 'PUT', data);
    await refreshDatabase();
    showToast('Personal profile saved successfully.');
  };

  const handleMarkNotificationsRead = async () => {
    await apiRequest('/api/notifications/read', 'POST');
    await refreshDatabase();
  };

  // Menu Navigation Lists
  const adminMenuItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: Layers },
    { id: 'members', label: 'Members Directory', icon: Users },
    { id: 'collections', label: 'Collect Cash', icon: CreditCard },
    { id: 'expenses', label: 'Expense Tracker', icon: DollarSign },
    { id: 'dues', label: 'Due calculations', icon: AlertCircle },
    { id: 'reports', label: 'Reports Generator', icon: FileText },
    { id: 'transactions', label: 'Financial Ledgers', icon: ArrowRightLeft },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Render Login state if not logged in
  if (!token || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50/50 p-4 transition duration-300 ${themeMode === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
        
        {/* Core login card container */}
        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white border border-gray-150 shadow-2xl dark:bg-gray-900 dark:border-gray-800 transition duration-300">
          
          {/* Accent graphics */}
          <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 p-8 text-center text-white">
            <h2 className="text-2xl font-bold uppercase tracking-wider">Friends Monthly Fund</h2>
            <p className="mt-1 text-xs text-teal-100 font-medium">Group contributions, dues calculations and reports ledger</p>
          </div>

          <div className="p-6 md:p-8">
            {/* Tabs (Admin Login vs User Login) */}
            <div id="login_tabs" className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              <button 
                id="btn_login_tab_admin"
                onClick={() => {
                  setLoginRole('admin');
                  setLoginUsername('pavel28');
                  setLoginPassword('123456789');
                  setLoginError('');
                }}
                className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${loginRole === 'admin' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'}`}
              >
                <Lock className="h-3.5 w-3.5" /> Admin Portal
              </button>
              <button 
                id="btn_login_tab_user"
                onClick={() => {
                  setLoginRole('user');
                  setLoginUsername('pavelmahmud2020@gmail.com');
                  setLoginPassword('123456789');
                  setLoginError('');
                }}
                className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${loginRole === 'user' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'}`}
              >
                <UserIcon className="h-3.5 w-3.5" /> Member Portal
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              {loginError && (
                <div id="login_error" className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100 dark:bg-red-950/20 dark:border-red-900/20">
                  {loginError}
                </div>
              )}

              {/* Username / Email */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                  {loginRole === 'admin' ? 'Admin Username' : 'Registered Email Address or Member ID'}
                </label>
                <input 
                  id="input_username"
                  type="text" 
                  value={loginUsername} 
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={loginRole === 'admin' ? 'pavel28' : 'e.g. pavelmahmud2020@gmail.com or MEM-001'}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs outline-none focus:border-teal-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white font-medium"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Password</label>
                <input 
                  id="input_password"
                  type="password" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs outline-none focus:border-teal-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white font-semibold"
                />
              </div>

              {/* Submit */}
              <button 
                id="btn_login_submit"
                type="submit" 
                disabled={isLoggingIn}
                className="w-full rounded-xl bg-teal-600 py-3 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition disabled:opacity-50"
              >
                {isLoggingIn ? 'Verifying session...' : 'Secure Login'}
              </button>
            </form>

            <div className="mt-6 border-t border-gray-100 pt-4 text-center text-[11px] text-gray-450 dark:border-gray-850">
              <span className="font-semibold text-gray-500 dark:text-gray-400">Demo Logins:</span>
              <p className="mt-1">Admin: <code className="font-bold font-mono">pavel28</code> / <code className="font-bold font-mono">123456789</code></p>
              <p className="mt-0.5">User: <code className="font-bold font-mono">pavelmahmud2020@gmail.com</code> / <code className="font-bold font-mono">123456789</code></p>
            </div>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition duration-300 ${themeMode === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* ==========================================
          A. MOBILE HEADER BANNER
      ========================================== */}
      <div className="md:hidden flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-gray-850 dark:bg-gray-900 print:hidden">
        <div className="flex items-center gap-2">
          <div className="rounded bg-teal-600 px-2 py-1 font-bold font-mono text-white text-xs">
            {settings.logo}
          </div>
          <span className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wide">
            {settings.fundName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggler */}
          <button 
            onClick={handleThemeToggle}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400"
          >
            {themeMode === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          
          {/* Mobile menu trigger */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ==========================================
          B. PERSISTENT SIDEBAR NAVIGATION
      ========================================== */}
      <div 
        id="app_sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 bg-white shadow-xl transition-transform duration-300 md:translate-x-0 md:relative md:shadow-none dark:border-gray-850 dark:bg-gray-900 print:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Banner */}
        <div className="hidden md:flex items-center gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-850">
          <div className="rounded bg-teal-600 px-2 py-1 font-bold font-mono text-white text-xs">
            {settings.logo}
          </div>
          <span className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wide">
            {settings.fundName}
          </span>
        </div>

        {/* Dynamic Nav Lists based on Session Role */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {user.role === 'admin' ? (
            /* Admin Panels navigation */
            adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`btn_nav_${item.id}`}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    isActive 
                      ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-450 dark:hover:bg-gray-850 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </button>
              );
            })
          ) : (
            /* User Panel default navigation */
            <button
              onClick={() => setCurrentTab('my-portal')}
              className="flex w-full items-center gap-3 rounded-xl bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
            >
              <Layers className="h-4.5 w-4.5" />
              My Member Portal
            </button>
          )}
        </nav>

        {/* Footer profile details */}
        <div className="border-t border-gray-100 p-4 dark:border-gray-850">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 font-bold text-white text-xs">
                {user.role === 'admin' ? 'AD' : (user.username.substring(0, 2).toUpperCase())}
              </div>
              <div className="max-w-[120px]">
                <div className="truncate text-xs font-bold text-gray-900 dark:text-white">{user.name}</div>
                <span className="block text-[10px] text-gray-450 uppercase tracking-wide font-semibold">{user.role}</span>
              </div>
            </div>
            
            <button 
              id="btn_logout"
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-red-500 dark:hover:bg-gray-850"
              title="Secure Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ==========================================
          C. MAIN CONTENT WORKSPACE
      ========================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar Header (Desktop) */}
        <header className="hidden md:flex items-center justify-between border-b border-gray-100 bg-white px-8 py-4 shadow-sm dark:border-gray-850 dark:bg-gray-900 print:hidden">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {user.role === 'admin' ? 'Administrator Workspace' : 'Friends Club Ledger Portal'}
          </span>

          <div className="flex items-center gap-4">
            
            {/* Theme switcher */}
            <button 
              onClick={handleThemeToggle}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-850"
              title="Change UI Theme"
            >
              {themeMode === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>

            {/* Notifications Trigger */}
            {user.role === 'admin' && (
              <div className="relative">
                <button 
                  id="btn_toggle_notif_panel"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-850 relative"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </button>
                
                {/* Embedded Mini-Notif dropdown */}
                {isNotifOpen && (
                  <>
                    <div 
                      onClick={() => setIsNotifOpen(false)}
                      className="fixed inset-0 z-10" 
                    />
                    <div className="absolute right-0 mt-2 z-20 w-80 rounded-xl border border-gray-150 bg-white p-4 shadow-xl dark:border-gray-850 dark:bg-gray-900 text-xs">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-2.5 dark:border-gray-800">
                        <span className="font-bold text-gray-800 dark:text-white">Recent Updates ({unreadCount} new)</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => {
                              handleMarkNotificationsRead();
                              setIsNotifOpen(false);
                            }}
                            className="font-semibold text-teal-600 hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {notifications.slice(0, 4).map(n => (
                          <div key={n.id} className={`p-2 rounded border ${n.read ? 'bg-gray-50/50 border-gray-100 dark:bg-gray-950/40 dark:border-gray-800/40' : 'bg-teal-50/40 border-teal-100 dark:bg-teal-950/10'}`}>
                            <p className="font-medium text-gray-700 dark:text-gray-300">{n.message}</p>
                            <span className="block text-[9px] text-gray-400 mt-0.5">{n.date}</span>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <p className="text-center text-gray-400 py-4">No new notifications</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="h-5 w-px bg-gray-150 dark:bg-gray-800" />

            {/* Profile badge */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 font-bold text-white text-xs">
                {user.role === 'admin' ? 'A' : 'U'}
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-white">{user.name}</span>
            </div>

          </div>
        </header>

        {/* Global Toast Banner */}
        {toastMsg && (
          <div id="toast_notification" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-teal-900 px-4 py-3 text-xs font-semibold text-white shadow-xl border border-teal-800 animate-slide-in">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Primary Workspace Scroll Container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {dashboardStats ? (
            /* ==========================================
                ROUTED COMPONENTS PANEL VIEW
            ========================================== */
            user.role === 'admin' ? (
              /* ADMIN VIEWS */
              <>
                {currentTab === 'dashboard' && (
                  <AdminDashboard 
                    stats={dashboardStats} 
                    notifications={notifications}
                    logs={logs}
                    onMarkNotificationsRead={handleMarkNotificationsRead}
                    currencySymbol={settings.currency}
                    onNavigate={(tab) => setCurrentTab(tab)}
                  />
                )}
                {currentTab === 'members' && (
                  <MemberManagement 
                    members={members} 
                    onAddMember={handleAddMember}
                    onUpdateMember={handleUpdateMember}
                    onDeleteMember={handleDeleteMember}
                    currencySymbol={settings.currency}
                  />
                )}
                {currentTab === 'collections' && (
                  <CollectionModule 
                    members={members} 
                    collections={collections}
                    onAddCollection={handleAddCollection}
                    onDeleteCollection={handleDeleteCollection}
                    currencySymbol={settings.currency}
                  />
                )}
                {currentTab === 'expenses' && (
                  <ExpenseManagement 
                    expenses={expenses} 
                    onAddExpense={handleAddExpense}
                    onDeleteExpense={handleDeleteExpense}
                    currencySymbol={settings.currency}
                  />
                )}
                {currentTab === 'dues' && (
                  <DueManagement 
                    dueData={dueData} 
                    members={members} 
                    currencySymbol={settings.currency}
                  />
                )}
                {currentTab === 'reports' && (
                  <DetailedReports 
                    members={members} 
                    collections={collections}
                    expenses={expenses}
                    dueData={dueData}
                    currencySymbol={settings.currency}
                  />
                )}
                {currentTab === 'transactions' && (
                  <TransactionLedger 
                    transactions={transactions} 
                    onDeleteCollection={handleDeleteCollection}
                    onDeleteExpense={handleDeleteExpense}
                    currencySymbol={settings.currency}
                  />
                )}
                {currentTab === 'settings' && (
                  <SystemSettings 
                    settings={settings} 
                    onUpdateSettings={handleUpdateSettings}
                    onResetDatabase={handleResetDatabase}
                    onRestoreDatabase={handleRestoreDatabase}
                  />
                )}
              </>
            ) : (
              /* USER VIEWS (Securely mapped inside portal component) */
              currentTab === 'my-portal' && (
                <UserDashboard 
                  memberId={user.id!}
                  members={members}
                  collections={collections}
                  expenses={expenses}
                  dueData={dueData}
                  onUpdateProfile={handleUpdateUserProfile}
                  currencySymbol={settings.currency}
                  fundName={settings.fundName}
                />
              )
            )
          ) : (
            /* Loading Spinner (Fast) */
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Assembling fund balances...</p>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
