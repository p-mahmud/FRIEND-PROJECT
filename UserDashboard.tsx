import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRightLeft, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Save,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { Member, Collection, Expense, MemberDueSummary, DueCalculation } from '../types.js';

interface UserDashboardProps {
  memberId: string;
  members: Member[];
  collections: Collection[];
  expenses: Expense[];
  dueData: { summaries: MemberDueSummary[]; breakdown: DueCalculation[] };
  onUpdateProfile: (id: string, data: { phone: string; email: string; address: string }) => Promise<void>;
  currencySymbol: string;
  fundName: string;
}

export default function UserDashboard({
  memberId,
  members,
  collections,
  expenses,
  dueData,
  onUpdateProfile,
  currencySymbol,
  fundName
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'statement' | 'reports' | 'profile'>('statement');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: 'success' as 'success' | 'error' });
  const [isSaving, setIsSaving] = useState(false);

  const currentMember = members.find(m => m.id === memberId);
  
  // Profile Form States
  const [phone, setPhone] = useState(currentMember?.phone || '');
  const [email, setEmail] = useState(currentMember?.email || '');
  const [address, setAddress] = useState(currentMember?.address || '');

  if (!currentMember) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-700">
        Fatal error: Logged member profile not found in system database. Please contact the administrator.
      </div>
    );
  }

  // Gather payment collections for this specific member
  const myCollections = collections.filter(c => c.memberId === memberId);
  const myTotalPaid = myCollections.reduce((sum, c) => sum + c.amount, 0);

  // Gather dues for this specific member
  const myDueSummary = dueData.summaries.find(s => s.memberId === memberId);
  const myDuesBreakdown = dueData.breakdown.filter(b => b.memberId === memberId);

  // General aggregates for reports
  const totalCollectionsAll = collections.reduce((sum, c) => sum + c.amount, 0);
  const totalExpensesAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalNetBalanceAll = totalCollectionsAll - totalExpensesAll;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: 'success' });

    if (!phone.trim() || !email.trim() || !address.trim()) {
      setProfileMsg({ text: 'All profile fields are required.', type: 'error' });
      return;
    }

    if (!email.includes('@')) {
      setProfileMsg({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateProfile(memberId, { phone, email, address });
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setProfileMsg({ text: '', type: 'success' }), 3000);
    } catch (e: any) {
      setProfileMsg({ text: e.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome Member Card */}
      <div id="user_welcome_card" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
            MEMBER PORTAL
          </span>
          <h1 className="text-xl font-bold md:text-2xl">Assalamu Alaikum, {currentMember.name}!</h1>
          <p className="mt-1.5 text-xs text-teal-50/95 max-w-xl">
            Welcome to the <strong>{fundName}</strong> console. View your payment histories, audit fund summaries, and track your active outstanding dues.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* 2. Personalized Metrics */}
      <div id="user_personal_metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Contribution */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">My Total Contribution</span>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {currencySymbol}{myTotalPaid.toLocaleString()}
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">Sum of all deposited monthly cash</p>
        </div>

        {/* Current Due */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">My Outstanding Due</span>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold mt-2 text-amber-600">
            {currencySymbol}{(myDueSummary?.remainingDue || 0).toLocaleString()}
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">Pending payments since join date</p>
        </div>

        {/* Advance Overpayments */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">My Advance Balance</span>
            <DollarSign className="h-5 w-5 text-teal-600" />
          </div>
          <h3 className="text-2xl font-bold mt-2 text-teal-600">
            {currencySymbol}{(myDueSummary?.overpayment || 0).toLocaleString()}
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">Overpaid cash reserves</p>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-4 text-xs font-bold dark:border-gray-800">
        <button
          id="btn_user_tab_statement"
          onClick={() => setActiveTab('statement')}
          className={`pb-2.5 border-b-2 transition uppercase tracking-wide px-1 cursor-pointer ${
            activeTab === 'statement' 
              ? 'border-teal-600 text-teal-800 dark:border-teal-500 dark:text-teal-400' 
              : 'border-transparent text-gray-450 hover:text-gray-700'
          }`}
        >
          My Statement
        </button>
        <button
          id="btn_user_tab_reports"
          onClick={() => setActiveTab('reports')}
          className={`pb-2.5 border-b-2 transition uppercase tracking-wide px-1 cursor-pointer ${
            activeTab === 'reports' 
              ? 'border-teal-600 text-teal-800 dark:border-teal-500 dark:text-teal-400' 
              : 'border-transparent text-gray-450 hover:text-gray-700'
          }`}
        >
          Fund Reports (Read-Only)
        </button>
        <button
          id="btn_user_tab_profile"
          onClick={() => setActiveTab('profile')}
          className={`pb-2.5 border-b-2 transition uppercase tracking-wide px-1 cursor-pointer ${
            activeTab === 'profile' 
              ? 'border-teal-600 text-teal-800 dark:border-teal-500 dark:text-teal-400' 
              : 'border-transparent text-gray-450 hover:text-gray-700'
          }`}
        >
          Update My Profile
        </button>
      </div>

      {/* 4. Tab Contents */}
      <div className="mt-4">
        
        {/* ==========================================
            TAB A: MY STATEMENT & PAYMENTS HISTORIES
        ========================================== */}
        {activeTab === 'statement' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Payment Ledger Tables */}
            <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white">My Payment Receipt Ledgers</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 dark:border-gray-800 bg-gray-50/20">
                      <th className="p-3 font-bold">Payment ID</th>
                      <th className="p-3 font-bold">Period</th>
                      <th className="p-3 font-bold">Amount</th>
                      <th className="p-3 font-bold">Channel</th>
                      <th className="p-3 font-bold">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {myCollections.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-400">
                          <ArrowRightLeft className="h-8 w-8 mx-auto text-gray-200 mb-2" />
                          No deposits recorded under your account yet.
                        </td>
                      </tr>
                    ) : (
                      myCollections.slice().reverse().map(c => (
                        <tr key={c.id} className="hover:bg-gray-50/10">
                          <td className="p-3 font-mono font-bold text-gray-700 dark:text-gray-300">{c.id}</td>
                          <td className="p-3 font-bold text-gray-800 dark:text-white">{c.month} {c.year}</td>
                          <td className="p-3 font-bold text-emerald-600">+{currencySymbol}{c.amount}</td>
                          <td className="p-3 font-semibold text-gray-600 dark:text-gray-400">{c.paymentMethod}</td>
                          <td className="p-3 text-gray-400">{c.date} &bull; {c.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Dues allocations breakdown */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white border-b border-gray-100 pb-3 dark:border-gray-800 flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-teal-600" /> Month-by-Month Dues
              </h2>

              <div id="user_due_list" className="mt-4 space-y-2 max-h-[350px] overflow-y-auto">
                {myDuesBreakdown.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between border-b border-gray-50 pb-2 text-xs last:border-b-0 dark:border-gray-800"
                  >
                    <div>
                      <span className="font-bold text-gray-800 dark:text-white">{item.month} {item.year}</span>
                      <div className="text-[10px] text-gray-400">Allocation Target: {currencySymbol}{item.expectedAmount}</div>
                    </div>
                    <div>
                      {item.remainingDue > 0 ? (
                        <span className="font-bold text-red-500">
                          Due: {currencySymbol}{item.remainingDue}
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                          Paid
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB B: READ-ONLY GROUP REPORTS
        ========================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Aggregate Header */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
              <div className="rounded-lg border border-gray-100 bg-gray-50/20 p-4 dark:border-gray-850">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Fund Income</span>
                <p className="text-lg font-bold text-emerald-600 mt-1">+{currencySymbol}{totalCollectionsAll.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50/20 p-4 dark:border-gray-850">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Fund Expenditures</span>
                <p className="text-lg font-bold text-red-500 mt-1">-{currencySymbol}{totalExpensesAll.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-teal-100 bg-teal-50/10 p-4 dark:border-teal-950/20">
                <span className="text-[10px] text-teal-600 uppercase font-bold tracking-wider">Net Reserve Balance</span>
                <p className="text-lg font-bold text-teal-700 mt-1">{currencySymbol}{totalNetBalanceAll.toLocaleString()}</p>
              </div>
            </div>

            {/* Itemized Outflows lists */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white border-b border-gray-100 pb-3 dark:border-gray-800 flex items-center gap-1.5">
                <FolderOpen className="h-4.5 w-4.5 text-teal-600" /> Global Group Expenditures ({expenses.length})
              </h2>

              <div id="user_view_expenses" className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
                {expenses.length === 0 ? (
                  <p className="py-8 text-center text-xs text-gray-400">No group expenses recorded yet.</p>
                ) : (
                  expenses.slice().reverse().map(e => (
                    <div key={e.id} className="py-3.5 flex items-start justify-between text-xs hover:bg-gray-50/10 transition px-1">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 dark:text-white">{e.title}</span>
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[8px] font-bold text-gray-400 uppercase dark:bg-gray-800">
                            {e.category}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-500 text-[11px] leading-relaxed">{e.description}</p>
                        <span className="mt-1 block text-[9px] text-gray-400 font-mono">{e.date} &bull; {e.time}</span>
                      </div>
                      <span className="font-bold text-red-500 font-sans">
                        -{currencySymbol}{e.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB C: PROFILE MODIFICATION PORTAL
        ========================================== */}
        {activeTab === 'profile' && (
          <div className="max-w-xl rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 pb-3 dark:border-gray-800 flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-teal-600" /> Personal Account Profile
            </h2>

            <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
              {profileMsg.text && (
                <div className={`rounded-lg p-3 text-xs font-semibold border ${
                  profileMsg.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                    : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20'
                }`}>
                  {profileMsg.text}
                </div>
              )}

              {/* Full Name & ID (Read-only) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name (Contact Admin to Change)</label>
                  <input 
                    type="text" 
                    value={currentMember.name} 
                    disabled 
                    className="w-full rounded-lg border border-gray-100 bg-gray-100/50 p-2.5 text-gray-500 dark:border-gray-800 dark:bg-gray-950/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">My Member ID</label>
                  <input 
                    type="text" 
                    value={currentMember.id} 
                    disabled 
                    className="w-full rounded-lg border border-gray-100 bg-gray-100/50 p-2.5 text-gray-500 dark:border-gray-800 dark:bg-gray-950/30 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute top-2.5 left-3 h-4.5 w-4.5 text-gray-450" />
                  <input 
                    id="input_profile_phone"
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute top-2.5 left-3 h-4.5 w-4.5 text-gray-450" />
                  <input 
                    id="input_profile_email"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute top-2.5 left-3 h-4.5 w-4.5 text-gray-450" />
                  <textarea 
                    id="input_profile_address"
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 dark:border-gray-800 flex justify-end">
                <button 
                  id="btn_submit_profile"
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5" />} Save Profile
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
