import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { Sun, Moon, Bell, Search, User, ShieldAlert, LogOut, CheckCheck, Landmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { theme, toggleTheme, currentUser, userRole, notifications, markAllNotificationsRead, dismissNotification, logoutUser, loading, apiConnected } = useBanking();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 dark:border-slate-800/80 dark:bg-slate-900/95 backdrop-blur-md transition-colors duration-200" id="global-navbar">
      {/* Brand & Left Info */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/10">
            <Landmark className="h-5 w-5" />
          </div>
          <span className="hidden font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-white md:block">
            Aegis<span className="text-indigo-600 dark:text-indigo-400">Fintech</span>
          </span>
        </Link>
        <span className="hidden h-5 w-px bg-slate-200 dark:bg-slate-800 md:block"></span>
        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/20">
          {userRole === 'employee' ? 'Enterprise Staff' : 'AI-Powered Client'}
        </span>
        <span className="hidden h-5 w-px bg-slate-200 dark:bg-slate-800 md:block"></span>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {apiConnected ? 'Live API Synchronized' : 'Offline Sandbox'}
          </span>
          {loading && (
            <span className="h-3 w-3 animate-spin rounded-full border border-indigo-500 border-t-transparent ml-1" />
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search Mock */}
        <div className="relative hidden max-w-xs md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            placeholder="Search transactions, AI logs..."
            className="h-9 w-60 rounded-lg border border-slate-200/80 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-indigo-400"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/60 text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Dropdown Container */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            id="notif-bell-btn"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/60 text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950" id="notif-dropdown-card">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-900">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Recent Security Logs ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <CheckCheck className="h-3 w-3" /> Mark read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No alerts on file.</div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`relative flex flex-col gap-0.5 rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 ${
                        !notif.read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${
                          notif.type === 'danger' ? 'text-rose-500' : notif.type === 'success' ? 'text-emerald-500' : 'text-indigo-500'
                        }`}>
                          {notif.title}
                        </span>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 text-xs font-semibold px-1"
                        >
                          &times;
                        </button>
                      </div>
                      <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-400">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 mt-1">{notif.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Controls */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              id="user-profile-menu-btn"
              className="flex items-center gap-2 rounded-lg border border-slate-200/40 p-1 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-[11px] font-bold text-white">
                {currentUser.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="hidden text-xs font-semibold text-slate-700 dark:text-slate-300 md:block">
                {currentUser.fullName}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-950" id="user-menu-dropdown">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-900">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to={userRole === 'employee' ? '/employee/settings' : '/customer/profile'}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-indigo-400"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-3.5 w-3.5" /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
