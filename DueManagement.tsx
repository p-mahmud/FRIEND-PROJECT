import React, { useState } from 'react';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  CheckCircle, 
  PlusCircle, 
  TrendingUp, 
  Users, 
  Clock, 
  FileText,
  DollarSign
} from 'lucide-react';
import { MemberDueSummary, DueCalculation, Member } from '../types.js';

interface DueManagementProps {
  dueData: { summaries: MemberDueSummary[]; breakdown: DueCalculation[] };
  members: Member[];
  currencySymbol: string;
}

export default function DueManagement({
  dueData,
  members,
  currencySymbol
}: DueManagementProps) {
  const [memberFilter, setMemberFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [viewMode, setViewMode] = useState<'summary' | 'breakdown'>('summary');

  // List of months for filter selection
  const filterMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filterYears = ['2026', '2027'];

  // Apply filters to summary view
  const filteredSummaries = dueData.summaries.filter(summary => {
    const member = members.find(m => m.id === summary.memberId);
    const matchesMember = !memberFilter || summary.memberId === memberFilter;
    return matchesMember;
  });

  // Apply filters to breakdown view
  const filteredBreakdown = dueData.breakdown.filter(item => {
    const matchesMember = !memberFilter || item.memberId === memberFilter;
    const matchesMonth = !monthFilter || item.month === monthFilter;
    const matchesYear = !yearFilter || item.year === Number(yearFilter);
    return matchesMember && matchesMonth && matchesYear;
  });

  // Totals calculations
  const totalExpected = filteredSummaries.reduce((sum, s) => sum + s.totalExpected, 0);
  const totalPaid = filteredSummaries.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalDuesOutstanding = filteredSummaries.reduce((sum, s) => sum + s.remainingDue, 0);
  const totalOverpaidAmount = filteredSummaries.reduce((sum, s) => sum + s.overpayment, 0);

  return (
    <div className="space-y-6">
      
      {/* 1. Header and Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Dues & Overpayments</h1>
          <p className="text-xs text-gray-500">Auto-calculated outstanding balances, remaining dues, and advance overpayments since join dates.</p>
        </div>
        
        {/* Toggle buttons */}
        <div className="flex gap-2 rounded-xl bg-gray-100 p-1 w-fit dark:bg-gray-800">
          <button 
            id="btn_view_due_summary"
            onClick={() => setViewMode('summary')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${viewMode === 'summary' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'}`}
          >
            Cumulative Summary
          </button>
          <button 
            id="btn_view_due_breakdown"
            onClick={() => setViewMode('breakdown')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${viewMode === 'breakdown' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'}`}
          >
            Monthly Period Breakdown
          </button>
        </div>
      </div>

      {/* 2. Cumulative Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-400">Aggregated Contribution Targets</span>
          <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">
            {currencySymbol}{totalExpected.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-gray-150 bg-amber-50/20 p-4 shadow-sm dark:border-amber-950/20">
          <span className="text-xs font-medium text-amber-600">Total Group Dues Outstanding</span>
          <p className="text-lg font-bold text-amber-600 mt-1">
            {currencySymbol}{totalDuesOutstanding.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/10 p-4 shadow-sm dark:border-emerald-950/20">
          <span className="text-xs font-medium text-emerald-600">Total Overpayments (Advance Accounts)</span>
          <p className="text-lg font-bold text-emerald-600 mt-1">
            {currencySymbol}{totalOverpaidAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 3. Filtering Panel */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap gap-3 items-center w-full">
          {/* Member selector */}
          <div className="flex-1 min-w-[150px]">
            <select
              id="select_due_member"
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-100 bg-gray-50/50 p-2 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            >
              <option value="">-- All Members --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
              ))}
            </select>
          </div>

          {/* Month selector (breakdown only) */}
          {viewMode === 'breakdown' && (
            <>
              <div className="min-w-[130px]">
                <select
                  id="select_due_month"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-100 bg-gray-50/50 p-2 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                >
                  <option value="">-- All Months --</option>
                  {filterMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year selector (breakdown only) */}
              <div className="min-w-[100px]">
                <select
                  id="select_due_year"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-100 bg-gray-50/50 p-2 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                >
                  <option value="">-- All Years --</option>
                  {filterYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Reset Filters */}
          {(memberFilter || monthFilter || yearFilter) && (
            <button 
              id="btn_reset_due_filters"
              onClick={() => {
                setMemberFilter('');
                setMonthFilter('');
                setYearFilter('');
              }}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Main Tables */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        
        {viewMode === 'summary' ? (
          /* ==========================================
              CUMULATIVE SUMMARY TABLE
          ========================================== */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 dark:border-gray-800">
                  <th className="p-4 font-bold">Member Name</th>
                  <th className="p-4 font-bold">Expected Contributions</th>
                  <th className="p-4 font-bold">Paid To Date</th>
                  <th className="p-4 font-bold">Status Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">No member accounts registered yet</td>
                  </tr>
                ) : (
                  filteredSummaries.map((s) => {
                    const progress = s.totalExpected > 0 ? (s.totalPaid / s.totalExpected) * 100 : 0;
                    return (
                      <tr key={s.memberId} className="hover:bg-gray-50/30">
                        <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-white">{s.memberName}</div>
                          <span className="font-mono text-[9px] font-bold text-gray-400">ID: {s.memberId}</span>
                        </td>
                        <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                          {currencySymbol}{s.totalExpected.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-gray-900 dark:text-white">{currencySymbol}{s.totalPaid.toLocaleString()}</span>
                          <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div 
                              className={`h-full rounded-full ${s.remainingDue > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          {s.remainingDue > 0 ? (
                            <div className="flex w-fit items-center gap-1 rounded bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                              <AlertCircle className="h-3 w-3" />
                              <span>DUE: {currencySymbol}{s.remainingDue.toLocaleString()}</span>
                            </div>
                          ) : s.overpayment > 0 ? (
                            <div className="flex w-fit items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                              <PlusCircle className="h-3 w-3" />
                              <span>ADVANCE: {currencySymbol}{s.overpayment.toLocaleString()}</span>
                            </div>
                          ) : (
                            <div className="flex w-fit items-center gap-1 rounded bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700 dark:bg-teal-950/20 dark:text-teal-400">
                              <CheckCircle className="h-3 w-3" />
                              <span>FULLY PAID</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ==========================================
              MONTHLY BREAKDOWN TABLE
          ========================================== */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 dark:border-gray-800">
                  <th className="p-4 font-bold">Member Name</th>
                  <th className="p-4 font-bold">Period Month/Year</th>
                  <th className="p-4 font-bold">Target Contribution</th>
                  <th className="p-4 font-bold">Paid Allocated</th>
                  <th className="p-4 font-bold">Remaining Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">No periods match selected filter guidelines</td>
                  </tr>
                ) : (
                  filteredBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/30">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{item.memberName}</div>
                        <span className="font-mono text-[9px] font-bold text-gray-400">{item.memberId}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-800 dark:text-white">{item.month}</span>
                        <span className="ml-1 text-gray-400">{item.year}</span>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {currencySymbol}{item.expectedAmount.toLocaleString()}
                      </td>
                      <td className={`p-4 font-semibold ${item.paidAmount >= item.expectedAmount ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                        {currencySymbol}{item.paidAmount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        {item.remainingDue > 0 ? (
                          <span className="font-bold text-red-500 font-sans">
                            {currencySymbol}{item.remainingDue.toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                            Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
