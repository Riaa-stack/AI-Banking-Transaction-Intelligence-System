import React from "react";
import { ShieldCheck, Bell } from "lucide-react";

const CustomerHeader = ({
  currentUser,
  notifications = [],
  theme,
  toggleTheme,
}) => {
  return (
    <div className="flex items-center justify-between mb-8">

      <div>

        <h1 className="text-3xl font-bold">
          Welcome,
          <span className="text-blue-600 ml-2">
            {currentUser?.full_name || currentUser?.name || "Customer"}
          </span>
        </h1>

        <p className="text-slate-500 mt-2">
          AI Banking & Transaction Intelligence System
        </p>

      </div>

      <div className="flex items-center gap-4">

        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <button className="relative">

          <Bell className="w-6 h-6" />

          {notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs">
              {notifications.length}
            </span>
          )}

        </button>

        <ShieldCheck
          className="text-green-500"
          size={34}
        />

      </div>

    </div>
  );
};

export default CustomerHeader;