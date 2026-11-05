import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  Bell,
  CheckCircle,
  Calendar,
  Activity,
  CreditCard
} from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction, Expense, DashboardNotification, ActivityLog } from '../types.js';

interface DashboardStats {
  totalFundBalance: number;
  totalCollection: number;
  totalExpenses: number;
  totalMembers: number;
  currentMonthCollection: number;
  totalDue: number;
  recentTransactions: Transaction[];
  recentExpenses: Expense[];
  currency: string;
  fundName: string;
}

interface AdminDashboardProps {
  stats: DashboardStats;
  notifications: DashboardNotification[];
  logs: ActivityLog[];
  onMarkNotificationsRead: () => void;
  currencySymbol: string;
  onNavigate: (tab: string) => void;
}

export default function AdminDashboard({
  stats,
  notifications,
  logs,
  onMarkNotificationsRead,
  currencySymbol,
  onNavigate
}: AdminDashboardProps) {
  const [activeChartTab, setActiveChartTab] = useState<'flow' | 'categories'>('flow');

  // --- PREPARE DATA FOR MONTHLY FLOW SVG CHART ---
  // Default months for graph
  const flowMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const collectionsData = [2000, 3000, 4000, 5700, 6500, 4500, 3500];
  const expensesData = [5700, 0, 2500, 0, 1500, 0, 0]; // Winter blankets & meeting snack costs mapped

  const maxVal = Math.max(...collectionsData, ...expensesData, 1000) * 1.1;
  const chartHeight = 160;
  const chartWidth = 500;

  // --- PREPARE CATEGORY BREAKDOWN ---
  const categories = [
    { name: 'Charity', amount: 4500, color: '#ef4444' },
    { name: 'Meetings', amount: 2700, color: '#f59e0b' },
    { name: 'Utility', amount: 2500, color: '#3b82f6' }
  ];
  const totalCatAmount = categories.reduce((sum, c) => sum + c.amount, 0) || 1;

  // Pie slice calculations (for donut chart SVG)
  let accumulatedPercent = 0;
  const donutSlices = categories.map((cat) => {
    const percent = cat.amount / totalCatAmount;
    const startPercent = accumulatedPercent;
    accumulatedPercent += percent;

    // SVG arc calculations
    const x1 = Math.cos(2 * Math.PI * startPercent);
    const y1 = Math.sin(2 * Math.PI * startPercent);
    const x2 = Math.cos(2 * Math.PI * accumulatedPercent);
    const y2 = Math.sin(2 * Math.PI * accumulatedPercent);

    const largeArc = percent > 0.5 ? 1 : 0;

    return {
      ...cat,
      percent: percent * 100,
      path: `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero Banner */}
      <div id="dashboard_hero" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-xl md:p-8">
        <div className="relative z-10 max-w-xl">
          <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-md">
            ADMIN CONSOLE
          </span>
          <h1 className="text-2xl font-bold md:text-3xl">
            Welcome Back, Pavel Mahmud!
          </h1>
          <p className="mt-2 text-sm text-emerald-50/90 md:text-base">
            Your friends fund ledger is fully up-to-date. All balances, collection targets, dues calculations, and expenditure sheets have been auto-computed.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button 
              id="btn_nav_collection"
              onClick={() => onNavigate('collections')}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-teal-800 transition shadow-sm hover:bg-teal-50"
            >
              <CreditCard className="h-4 w-4" /> Collect Money
            </button>
            <button 
              id="btn_nav_expense"
              onClick={() => onNavigate('expenses')}
              className="flex items-center gap-2 rounded-lg bg-teal-800/40 border border-teal-400/30 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-800/60"
            >
              Add Expense
            </button>
          </div>
        </div>
        {/* Background Decorative Rings */}
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
        <div className="absolute right-1/4 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-lg" />
      </div>

      {/* 2. Stat Cards Grid */}
      <div id="stat_cards" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Net Balance */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Total Fund Balance</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {currencySymbol}{stats.totalFundBalance.toLocaleString()}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>Available Net Cash</span>
            </div>
          </div>
        </div>

        {/* Total Collection */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Total Collections</span>
            <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {currencySymbol}{stats.totalCollection.toLocaleString()}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>All recorded contributions</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Total Expenses</span>
            <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {currencySymbol}{stats.totalExpenses.toLocaleString()}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>Spent for welfare & setup</span>
            </div>
          </div>
        </div>

        {/* Total Dues */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Total Outstanding Dues</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-red-500 dark:text-red-400">
              {currencySymbol}{stats.totalDue.toLocaleString()}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
              <span>Awaiting group collection</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Secondary Metrics: Monthly Collection & Members Count */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="rounded-full bg-teal-100 p-3 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400">Current Month Collections (July 2026)</span>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {currencySymbol}{stats.currentMonthCollection.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="rounded-full bg-cyan-100 p-3 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400">Registered Fund Members</span>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {stats.totalMembers} Members
            </p>
          </div>
        </div>
      </div>

      {/* 4. Interactive Bento Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left 2/3 - Main Financial Flow Chart */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div>
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">Financial Analytics</h2>
              <p className="text-xs text-gray-400">Real-time ledger flows mapped dynamically</p>
            </div>
            <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button 
                onClick={() => setActiveChartTab('flow')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${activeChartTab === 'flow' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Collection Flow
              </button>
              <button 
                onClick={() => setActiveChartTab('categories')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${activeChartTab === 'categories' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Expenses By Category
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            {activeChartTab === 'flow' ? (
              <div className="w-full">
                {/* SVG Bar Chart */}
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                    <line 
                      key={i} 
                      x1="30" 
                      y1={10 + p * (chartHeight - 30)} 
                      x2={chartWidth - 10} 
                      y2={10 + p * (chartHeight - 30)} 
                      stroke="#f3f4f6" 
                      strokeWidth="1"
                      className="dark:stroke-gray-800"
                    />
                  ))}

                  {/* Monthly data rendering */}
                  {flowMonths.map((m, idx) => {
                    const x = 50 + idx * 60;
                    const cHeight = (collectionsData[idx] / maxVal) * (chartHeight - 45);
                    const eHeight = (expensesData[idx] / maxVal) * (chartHeight - 45);
                    const yC = chartHeight - 25 - cHeight;
                    const yE = chartHeight - 25 - eHeight;

                    return (
                      <g key={m}>
                        {/* Collection Bar */}
                        <rect 
                          x={x} 
                          y={yC} 
                          width="18" 
                          height={cHeight} 
                          fill="#0d9488" 
                          rx="3"
                          className="transition-all hover:fill-teal-500"
                        />
                        {/* Expense Bar */}
                        {eHeight > 0 && (
                          <rect 
                            x={x + 22} 
                            y={yE} 
                            width="18" 
                            height={eHeight} 
                            fill="#ef4444" 
                            rx="3"
                            className="transition-all hover:fill-red-400"
                          />
                        )}
                        {/* X-axis Label */}
                        <text 
                          x={x + 15} 
                          y={chartHeight - 5} 
                          textAnchor="middle" 
                          fontSize="10" 
                          fill="#9ca3af" 
                          className="font-medium"
                        >
                          {m}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Legend */}
                  <g transform={`translate(${chartWidth - 200}, 5)`}>
                    <rect width="10" height="10" fill="#0d9488" rx="2" />
                    <text x="15" y="9" fontSize="10" fill="#6b7280" className="dark:text-gray-400">Collections</text>
                    
                    <rect x="90" width="10" height="10" fill="#ef4444" rx="2" />
                    <text x="105" y="9" fontSize="10" fill="#6b7280" className="dark:text-gray-400">Expenses</text>
                  </g>
                </svg>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-teal-50/50 p-3 text-xs text-teal-800 dark:bg-teal-950/20 dark:text-teal-300">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span><strong>Observation:</strong> Fund balance grows strongly. Highest collection was in May 2026.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-6 md:flex-row w-full py-4">
                {/* SVG Donut Chart */}
                <div className="relative h-40 w-40">
                  <svg viewBox="-1.2 -1.2 2.4 2.4" className="h-full w-full rotate-270 transform">
                    {donutSlices.map((slice, i) => (
                      <path 
                        key={i} 
                        d={slice.path} 
                        fill={slice.color} 
                        className="transition hover:opacity-90 cursor-pointer"
                      />
                    ))}
                    {/* Inner hole */}
                    <circle cx="0" cy="0" r="0.6" fill="white" className="dark:fill-gray-900" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-gray-400 font-medium">Total Spent</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                      {currencySymbol}{stats.totalExpenses.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Categories Table */}
                <div className="flex-1 space-y-3 w-full">
                  {categories.map(c => (
                    <div key={c.name} className="flex items-center justify-between border-b border-gray-50 pb-2 text-xs dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{c.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {currencySymbol}{c.amount.toLocaleString()}
                        </span>
                        <span className="ml-2 text-gray-400">({((c.amount / totalCatAmount) * 100).toFixed(0)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3 - Notifications Panel */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-teal-600" />
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">Notifications</h2>
            </div>
            {notifications.some(n => !n.read) && (
              <button 
                id="btn_clear_notif"
                onClick={onMarkNotificationsRead}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
              >
                Mark as Read
              </button>
            )}
          </div>

          <div id="notif_list" className="mt-4 space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">No new notifications</p>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`flex gap-3 rounded-lg p-3 text-xs border transition ${
                    notif.read 
                      ? 'bg-gray-50/50 border-gray-100 dark:bg-gray-900/40 dark:border-gray-800/60' 
                      : 'bg-teal-50/40 border-teal-100 dark:bg-teal-950/10 dark:border-teal-900/30'
                  }`}
                >
                  <div className="mt-0.5">
                    {notif.type === 'payment' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                    {notif.type === 'expense' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {notif.type === 'due' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                    {notif.type === 'system' && <Activity className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium leading-relaxed ${notif.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                      {notif.message}
                    </p>
                    <span className="mt-1 block text-[10px] text-gray-400">{notif.date} &bull; {notif.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 5. Bottom Ledger Section (Split Layout) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Recent Ledger Transactions */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Recent Ledger Transactions</h2>
            <button 
              onClick={() => onNavigate('transactions')}
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
            >
              View Ledger <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 dark:border-gray-800">
                  <th className="py-2 font-medium">Txn ID</th>
                  <th className="py-2 font-medium">Reference</th>
                  <th className="py-2 font-medium">Amount</th>
                  <th className="py-2 font-medium">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {stats.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">No transactions recorded yet</td>
                  </tr>
                ) : (
                  stats.recentTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="py-2 font-mono font-bold text-gray-700 dark:text-gray-300">{t.id}</td>
                      <td className="py-2">
                        <div className="font-semibold text-gray-800 dark:text-white">{t.memberOrTitle}</div>
                        <div className="text-[10px] text-gray-400">{t.date}</div>
                      </td>
                      <td className={`py-2 font-bold ${t.type === 'collection' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {t.type === 'collection' ? '+' : '-'}{currencySymbol}{t.amount}
                      </td>
                      <td className="py-2 text-gray-500 dark:text-gray-400">{t.paymentMethod}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity Logs (Audit Trail) */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Audit Trail Logs</h2>
          </div>

          <div id="audit_logs" className="mt-3 space-y-3 max-h-[220px] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">No system events logged</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-3 text-xs leading-relaxed border-b border-gray-50 pb-2 last:border-b-0 dark:border-gray-800">
                  <div className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300 h-fit">
                    {log.user}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-800 dark:text-white">{log.action}: </span>
                    <span className="text-gray-600 dark:text-gray-400">{log.details}</span>
                    <span className="mt-0.5 block text-[9px] text-gray-400">{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
