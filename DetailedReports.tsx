import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  User, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Check, 
  Filter,
  DollarSign
} from 'lucide-react';
import { Member, Collection, Expense, MemberDueSummary, DueCalculation } from '../types.js';

interface DetailedReportsProps {
  members: Member[];
  collections: Collection[];
  expenses: Expense[];
  dueData: { summaries: MemberDueSummary[]; breakdown: DueCalculation[] };
  currencySymbol: string;
}

export default function DetailedReports({
  members,
  collections,
  expenses,
  dueData,
  currencySymbol
}: DetailedReportsProps) {
  const [reportType, setReportType] = useState<'monthly' | 'member' | 'expense'>('monthly');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('July');
  const [selectedYear, setSelectedYear] = useState('2026');

  const filterMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // --- REPORT GENERATION LOGIC ---

  // 1. Monthly Report Data
  const monthlyCollections = collections.filter(c => c.month === selectedMonth && c.year === Number(selectedYear));
  const totalMonthlyCollection = monthlyCollections.reduce((sum, c) => sum + c.amount, 0);

  // Expense matching month
  const monthlyExpenses = expenses.filter(e => {
    const parts = e.date.split('-');
    const monthIdx = parseInt(parts[1], 10) - 1;
    const mName = filterMonths[monthIdx];
    return mName === selectedMonth && parts[0] === selectedYear;
  });
  const totalMonthlyExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netMonthlyBalance = totalMonthlyCollection - totalMonthlyExpense;

  // Monthly due list (from breakdown for selected period - only members who have not made any payment)
  const monthlyDueList = dueData.breakdown.filter(d => d.month === selectedMonth && d.year === Number(selectedYear) && d.paidAmount === 0);

  // 2. Member Report Data
  const memberObj = members.find(m => m.id === selectedMemberId) || members[0];
  const memberSummary = dueData.summaries.find(s => s.memberId === (memberObj?.id || ''));
  const memberPayments = collections.filter(c => c.memberId === (memberObj?.id || ''));
  const memberDuesBreakdown = dueData.breakdown.filter(b => b.memberId === (memberObj?.id || '') && b.remainingDue > 0);

  // 3. Expense Report Data
  // Category aggregations
  const categorySummary: Record<string, number> = {};
  expenses.forEach(e => {
    categorySummary[e.category] = (categorySummary[e.category] || 0) + e.amount;
  });

  // --- EXPORT TO EXCEL (CSV) UTILITIES ---

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'monthly') {
      filename = `fmf_monthly_report_${selectedMonth}_${selectedYear}.csv`;
      csvContent = `Friends Monthly Fund - Monthly Financial Statement\n`;
      csvContent += `Period,${selectedMonth} ${selectedYear}\n\n`;
      csvContent += `FINANCIAL METRICS\n`;
      csvContent += `Metric,Amount (${currencySymbol})\n`;
      csvContent += `Total Collections,${totalMonthlyCollection}\n`;
      csvContent += `Total Expenses,${totalMonthlyExpense}\n`;
      csvContent += `Net Monthly Balance,${netMonthlyBalance}\n\n`;

      csvContent += `COLLECTIONS LEDGER\n`;
      csvContent += `Payment ID,Member Name,Amount,Date,Time,Method\n`;
      monthlyCollections.forEach(c => {
        csvContent += `"${c.id}","${c.memberName}","${c.amount}","${c.date}","${c.time}","${c.paymentMethod}"\n`;
      });
      csvContent += `\nOUTSTANDING PERIOD DUES\n`;
      csvContent += `Member ID,Member Name,Monthly Target,Paid,Remaining Due\n`;
      monthlyDueList.forEach(d => {
        csvContent += `"${d.memberId}","${d.memberName}","${d.expectedAmount}","${d.paidAmount}","${d.remainingDue}"\n`;
      });

    } else if (reportType === 'member') {
      if (!memberObj) return;
      filename = `fmf_member_statement_${memberObj.id}.csv`;
      csvContent = `Friends Monthly Fund - Member Audit Statement\n`;
      csvContent += `Member ID,${memberObj.id}\n`;
      csvContent += `Full Name,${memberObj.name}\n`;
      csvContent += `Phone,${memberObj.phone}\n`;
      csvContent += `Email,${memberObj.email}\n`;
      csvContent += `Preferred Contribution,${memberObj.monthlyContribution}\n`;
      csvContent += `Join Date,${memberObj.joinDate}\n\n`;

      csvContent += `ACCOUNT BALANCE OVERVIEW\n`;
      csvContent += `Total Expected Contributions,${memberSummary?.totalExpected || 0}\n`;
      csvContent += `Total Paid to Date,${memberSummary?.totalPaid || 0}\n`;
      csvContent += `Remaining Due,${memberSummary?.remainingDue || 0}\n`;
      csvContent += `Overpayments (Advance),${memberSummary?.overpayment || 0}\n\n`;

      csvContent += `HISTORIC TRANSACTION HISTORY\n`;
      csvContent += `Payment ID,Amount,Date,Time,Method,Status\n`;
      memberPayments.forEach(p => {
        csvContent += `"${p.id}","${p.amount}","${p.date}","${p.time}","${p.paymentMethod}","${p.status}"\n`;
      });

    } else if (reportType === 'expense') {
      filename = `fmf_expense_report.csv`;
      csvContent = `Friends Monthly Fund - Comprehensive Expense Summary\n\n`;
      csvContent += `EXPENDITURES BY CATEGORY\n`;
      csvContent += `Category,Total Spent (${currencySymbol})\n`;
      Object.entries(categorySummary).forEach(([cat, amt]) => {
        csvContent += `"${cat}","${amt}"\n`;
      });

      csvContent += `\nITEMIZED GROUP OUTFLOWS\n`;
      csvContent += `Expense ID,Title,Category,Amount,Date,Time,Description\n`;
      expenses.forEach(e => {
        csvContent += `"${e.id}","${e.title}","${e.category}","${e.amount}","${e.date}","${e.time}","${e.description}"\n`;
      });
    }

    downloadCSV(csvContent, filename);
  };

  // --- PRINT UTILITY ---
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Financial Reports Engine</h1>
          <p className="text-xs text-gray-500">Compile professional PDF, Excel spreadsheets, and print-ready group audit statements.</p>
        </div>
        
        {/* Export buttons */}
        <div className="flex gap-2">
          <button 
            id="btn_export_csv"
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-150 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <Download className="h-4 w-4 text-teal-600" /> Export CSV
          </button>
          <button 
            id="btn_print_report"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700"
          >
            <Printer className="h-4 w-4" /> Print Statement
          </button>
        </div>
      </div>

      {/* 2. Report Type Selector Tab Bar */}
      <div className="flex gap-1.5 rounded-xl bg-gray-100 p-1 w-fit dark:bg-gray-800 print:hidden">
        <button 
          id="btn_report_tab_monthly"
          onClick={() => setReportType('monthly')}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${reportType === 'monthly' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'}`}
        >
          Monthly Statement
        </button>
        <button 
          id="btn_report_tab_member"
          onClick={() => {
            setReportType('member');
            if (members.length > 0 && !selectedMemberId) {
              setSelectedMemberId(members[0].id);
            }
          }}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${reportType === 'member' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'}`}
        >
          Member Ledger Audit
        </button>
        <button 
          id="btn_report_tab_expense"
          onClick={() => setReportType('expense')}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${reportType === 'expense' ? 'bg-white text-teal-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'}`}
        >
          Expense Analysis
        </button>
      </div>

      {/* 3. Parameter Filters Panel */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 print:hidden">
        <div className="flex flex-wrap gap-4 items-center">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Report Parameters:</span>
          
          {reportType === 'monthly' && (
            <div className="flex gap-2">
              <select 
                id="select_report_month"
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              >
                {filterMonths.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select 
                id="select_report_year"
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          )}

          {reportType === 'member' && (
            <select 
              id="select_report_member"
              value={selectedMemberId} 
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            >
              <option value="">-- Choose Member --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
              ))}
            </select>
          )}

          {reportType === 'expense' && (
            <span className="text-xs text-gray-500">Itemized lists and category spending analysis generated globally.</span>
          )}
        </div>
      </div>

      {/* 4. Report Document Output */}
      <div id="printable_report" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 print:border-0 print:p-0 print:shadow-none">
        
        {/* Print Header (Visible ONLY during print layout) */}
        <div className="hidden print:block text-center border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase tracking-widest text-teal-800">Friends Monthly Fund</h1>
          <p className="text-xs text-gray-500 font-medium">Financial Statement Ledger Archive &bull; Confidential</p>
        </div>

        {/* ==========================================
            A. MONTHLY OVERVIEW REPORT VIEW
        ========================================== */}
        {reportType === 'monthly' && (
          <div className="space-y-6">
            <div className="border-b border-gray-50 pb-3 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Monthly Statement Overview</h2>
              <p className="text-xs text-gray-400">Statement compiled for the period of <strong>{selectedMonth} {selectedYear}</strong></p>
            </div>

            {/* Financial summary blocks */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50/50 p-4 border border-gray-100 dark:bg-gray-950/20 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Collections</span>
                <p className="text-lg font-bold text-emerald-600 mt-1">+{currencySymbol}{totalMonthlyCollection.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-gray-50/50 p-4 border border-gray-100 dark:bg-gray-950/20 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Expenses</span>
                <p className="text-lg font-bold text-red-600 mt-1">-{currencySymbol}{totalMonthlyExpense.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-gray-50/50 p-4 border border-gray-100 dark:bg-gray-950/20 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Net Month Balance</span>
                <p className={`text-lg font-bold mt-1 ${netMonthlyBalance >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                  {netMonthlyBalance >= 0 ? '+' : ''}{currencySymbol}{netMonthlyBalance.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Collections List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700">Collections Recorded ({monthlyCollections.length})</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 dark:border-gray-800">
                      <th className="p-3 font-bold">Member</th>
                      <th className="p-3 font-bold">Amount</th>
                      <th className="p-3 font-bold">Date & Time</th>
                      <th className="p-3 font-bold">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {monthlyCollections.length === 0 ? (
                      <tr><td colSpan={4} className="p-4 text-center text-gray-400">No collection records on file for this period</td></tr>
                    ) : (
                      monthlyCollections.map(c => (
                        <tr key={c.id}>
                          <td className="p-3 font-bold text-gray-800 dark:text-white">{c.memberName}</td>
                          <td className="p-3 text-emerald-600 font-bold">+{currencySymbol}{c.amount}</td>
                          <td className="p-3 text-gray-500">{c.date} &bull; {c.time}</td>
                          <td className="p-3 font-semibold text-gray-600 dark:text-gray-400">{c.paymentMethod}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Dues list */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">Outstanding Period Dues ({monthlyDueList.length})</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 dark:border-gray-800">
                      <th className="p-3 font-bold">Member Name</th>
                      <th className="p-3 font-bold">Monthly Target</th>
                      <th className="p-3 font-bold">Amount Paid</th>
                      <th className="p-3 font-bold">Outstanding Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {monthlyDueList.length === 0 ? (
                      <tr><td colSpan={4} className="p-4 text-center text-emerald-600 font-semibold">Great! All members have made their payments for {selectedMonth} {selectedYear}!</td></tr>
                    ) : (
                      monthlyDueList.map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-850">
                          <td className="p-3 font-bold text-gray-800 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span>{d.memberName}</span>
                              {d.overpayment > 0 && (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                  Advance: +{currencySymbol}{d.overpayment}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-gray-600 dark:text-gray-400">{currencySymbol}{d.expectedAmount}</td>
                          <td className={`p-3 font-bold ${d.paidAmount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {currencySymbol}{d.paidAmount}
                          </td>
                          <td className="p-3">
                            {d.remainingDue > 0 ? (
                              <span className="font-bold text-red-500">{currencySymbol}{d.remainingDue}</span>
                            ) : (
                              <span className="font-bold text-emerald-600">{currencySymbol}0 (Cleared)</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            B. MEMBER STATEMENT REPORT VIEW
        ========================================== */}
        {reportType === 'member' && (
          <div className="space-y-6">
            {!memberObj ? (
              <p className="text-center text-xs text-gray-400 py-12">Please select or register a member first to audit statements.</p>
            ) : (
              <>
                <div className="border-b border-gray-50 pb-4 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Individual Ledger Statement</h2>
                  <p className="text-xs text-gray-400">Statement compiled for: <strong>{memberObj.name} ({memberObj.id})</strong></p>
                </div>

                {/* Profile Meta Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs bg-gray-50/30 p-4 rounded-xl border border-gray-100 dark:bg-gray-950/20 dark:border-gray-800">
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div><span className="font-bold text-gray-800 dark:text-white">Phone:</span> {memberObj.phone}</div>
                    <div><span className="font-bold text-gray-800 dark:text-white">Email:</span> {memberObj.email}</div>
                    <div><span className="font-bold text-gray-800 dark:text-white">Address:</span> {memberObj.address}</div>
                  </div>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div><span className="font-bold text-gray-800 dark:text-white">Join Date:</span> {memberObj.joinDate}</div>
                    <div><span className="font-bold text-gray-800 dark:text-white">Preferred Monthly Target:</span> {currencySymbol}{memberObj.monthlyContribution}</div>
                    <div><span className="font-bold text-gray-800 dark:text-white">Current Status:</span> <span className="font-bold uppercase tracking-wider text-emerald-600">{memberObj.status}</span></div>
                  </div>
                </div>

                {/* Account Balances Grid */}
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/20 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total Expected</span>
                    <p className="text-base font-bold text-gray-850 dark:text-white mt-1">{currencySymbol}{(memberSummary?.totalExpected || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/20 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total Contributed</span>
                    <p className="text-base font-bold text-teal-600 mt-1">{currencySymbol}{(memberSummary?.totalPaid || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-amber-100 p-3 bg-amber-50/5 dark:border-amber-950/20">
                    <span className="text-[10px] text-amber-600 font-bold uppercase">Outstanding Due</span>
                    <p className="text-base font-bold text-amber-600 mt-1">{currencySymbol}{(memberSummary?.remainingDue || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 p-3 bg-emerald-50/5 dark:border-emerald-950/20">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Advance Account</span>
                    <p className="text-base font-bold text-emerald-600 mt-1">{currencySymbol}{(memberSummary?.overpayment || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Payment History */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700">Payment Contribution Log ({memberPayments.length})</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 dark:border-gray-800">
                          <th className="p-3 font-bold">Receipt ID</th>
                          <th className="p-3 font-bold">Amount Paid</th>
                          <th className="p-3 font-bold">Completed Period</th>
                          <th className="p-3 font-bold">Deposit Date</th>
                          <th className="p-3 font-bold">Channel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {memberPayments.length === 0 ? (
                          <tr><td colSpan={5} className="p-4 text-center text-gray-400">No payment deposits recorded under this member profile</td></tr>
                        ) : (
                          memberPayments.map(p => (
                            <tr key={p.id}>
                              <td className="p-3 font-mono font-bold text-gray-700 dark:text-gray-300">{p.id}</td>
                              <td className="p-3 font-bold text-teal-600">+{currencySymbol}{p.amount}</td>
                              <td className="p-3 font-semibold text-gray-800 dark:text-white">{p.month} {p.year}</td>
                              <td className="p-3 text-gray-500">{p.date} &bull; {p.time}</td>
                              <td className="p-3 text-gray-600 dark:text-gray-400">{p.paymentMethod}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==========================================
            C. EXPENSE REPORT VIEW
        ========================================== */}
        {reportType === 'expense' && (
          <div className="space-y-6">
            <div className="border-b border-gray-50 pb-3 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Group Expenditure Reports</h2>
              <p className="text-xs text-gray-400">Aggregate spending summaries and itemized list of fund outflows</p>
            </div>

            {/* Category breakdown boxes */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700">Category spending analysis</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Object.entries(categorySummary).map(([cat, amt]) => (
                  <div key={cat} className="rounded-xl border border-gray-100 p-4 bg-gray-50/25 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{cat}</span>
                    <p className="text-base font-bold text-gray-850 dark:text-white mt-1">{currencySymbol}{amt.toLocaleString()}</p>
                  </div>
                ))}
                {Object.keys(categorySummary).length === 0 && (
                  <p className="col-span-full py-4 text-center text-xs text-gray-400">No active categories listed yet.</p>
                )}
              </div>
            </div>

            {/* Itemized Outflows table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">Itemized Group Outflows ({expenses.length})</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 dark:border-gray-800">
                      <th className="p-3 font-bold">Outflow ID</th>
                      <th className="p-3 font-bold">Expense Title</th>
                      <th className="p-3 font-bold">Category</th>
                      <th className="p-3 font-bold">Date & Time</th>
                      <th className="p-3 font-bold">Spent Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {expenses.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-gray-400">No expenditure records on file</td></tr>
                    ) : (
                      expenses.map(e => (
                        <tr key={e.id}>
                          <td className="p-3 font-mono font-bold text-gray-700 dark:text-gray-300">{e.id}</td>
                          <td className="p-3">
                            <div className="font-bold text-gray-900 dark:text-white">{e.title}</div>
                            <span className="text-[10px] text-gray-400 line-clamp-1">{e.description}</span>
                          </td>
                          <td className="p-3">
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-500 uppercase dark:bg-gray-850 dark:text-gray-400">
                              {e.category}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500">{e.date} &bull; {e.time}</td>
                          <td className="p-3 font-bold text-red-500">-{currencySymbol}{e.amount.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
