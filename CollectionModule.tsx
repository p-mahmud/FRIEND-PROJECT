import React, { useState } from 'react';
import { 
  CreditCard, 
  User, 
  DollarSign, 
  Send, 
  Activity, 
  CheckCircle, 
  Clock,
  ArrowRightLeft,
  Coins,
  Calendar,
  Trash2,
  Loader2
} from 'lucide-react';
import { Member, Collection } from '../types.js';

const MONTHS_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface CollectionModuleProps {
  members: Member[];
  collections: Collection[];
  onAddCollection: (data: { memberId: string; amount: number; paymentMethod: Collection['paymentMethod']; month?: string; year?: number }) => Promise<void>;
  onDeleteCollection?: (id: string) => Promise<void>;
  currencySymbol: string;
}

export default function CollectionModule({
  members,
  collections,
  onAddCollection,
  onDeleteCollection,
  currencySymbol
}: CollectionModuleProps) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('July');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [amount, setAmount] = useState('00');
  const [paymentMethod, setPaymentMethod] = useState<Collection['paymentMethod']>('bKash');
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' });

  const activeMembers = members.filter(m => m.status === 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', type: 'success' });

    if (!selectedMemberId) {
      setMsg({ text: 'Please select a member.', type: 'error' });
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setMsg({ text: 'Please enter a valid contribution amount greater than 0.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await onAddCollection({
        memberId: selectedMemberId,
        amount: numericAmount,
        paymentMethod,
        month: selectedMonth,
        year: Number(selectedYear)
      });
      setMsg({ text: `Success! Collection of ${currencySymbol}${numericAmount} recorded for ${selectedMonth} ${selectedYear}.`, type: 'success' });
      setAmount('00');
      setSelectedMemberId('');
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to record contribution.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodColor = (method: Collection['paymentMethod']) => {
    switch (method) {
      case 'bKash': return 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-900/40';
      case 'Nagad': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40';
      case 'Rocket': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40';
      case 'Bank Transfer': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      
      {/* Recording Form (Left 2/3) */}
      <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Record Fund Collection</h1>
          <p className="text-xs text-gray-500">Record a monthly deposit manually. Ledger calculations, transaction ID, date, time and status are compiled automatically.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {msg.text && (
            <div className={`rounded-xl p-4 text-xs font-semibold border ${
              msg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400' 
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400'
            }`}>
              {msg.text}
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2 flex items-center gap-1.5">
              <User className="h-4 w-4 text-teal-600" /> Select Contributing Member
            </label>
            <select
              id="select_collection_member"
              value={selectedMemberId}
              onChange={(e) => {
                setSelectedMemberId(e.target.value);
                const mem = members.find(m => m.id === e.target.value);
                if (mem) {
                  setAmount(String(mem.monthlyContribution || '00'));
                } else {
                  setAmount('00');
                }
              }}
              className="w-full rounded-xl border border-gray-150 bg-gray-50/50 p-3 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            >
              <option value="">-- Choose Member --</option>
              {activeMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id}) &bull; Pref. Contribution: {currencySymbol}{m.monthlyContribution}
                </option>
              ))}
            </select>
            {activeMembers.length === 0 && (
              <p className="mt-1 text-[11px] text-red-500">No active members found. Please add or activate members first.</p>
            )}
          </div>

          {/* Collection Month & Year Selection */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-teal-600" /> Select Month
              </label>
              <select
                id="select_collection_month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full rounded-xl border border-gray-150 bg-gray-50/50 p-3 text-xs font-semibold outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              >
                {MONTHS_LIST.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-teal-600" /> Select Year
              </label>
              <select
                id="select_collection_year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-xl border border-gray-150 bg-gray-50/50 p-3 text-xs font-semibold outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              >
                {['2025', '2026', '2027', '2028'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-teal-600" /> Paid Amount ({currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs text-gray-400 font-bold">
                {currencySymbol}
              </span>
              <input 
                id="input_collection_amount"
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="00"
                min={0}
                className="w-full rounded-xl border border-gray-150 bg-gray-50/50 py-3 pl-8 pr-4 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white font-semibold"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-teal-600" /> Select Payment Method Channel
            </label>
            <div id="payment_channels" className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {(['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank Transfer'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 text-center transition ${
                    paymentMethod === method 
                      ? 'border-teal-600 bg-teal-50/50 text-teal-800 dark:border-teal-500 dark:bg-teal-950/20 dark:text-teal-400 font-bold' 
                      : 'border-gray-100 bg-gray-50/30 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900/40'
                  }`}
                >
                  <Coins className="h-4 w-4" />
                  <span className="text-[10px] tracking-wide uppercase font-semibold">{method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
            <button
              id="btn_submit_collection"
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-teal-700 disabled:opacity-50 w-full sm:w-auto"
            >
              <Send className="h-4 w-4" /> {isLoading ? 'Processing...' : 'Confirm Payment Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Collections Feed (Right 1/3) */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 pb-3 dark:border-gray-800">
          <Activity className="h-4.5 w-4.5 text-teal-600" /> Recent Collection Feed
        </h2>

        <div id="collections_feed" className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {collections.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-400">No collection deposits completed yet.</p>
          ) : (
            collections.slice().reverse().map((c) => (
              <div 
                key={c.id} 
                className="flex items-start justify-between rounded-xl border border-gray-50 bg-gray-50/20 p-3 text-xs dark:border-gray-800/60 dark:bg-gray-950/10"
              >
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{c.memberName}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`inline-block rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider font-mono ${getMethodColor(c.paymentMethod)}`}>
                      {c.paymentMethod}
                    </span>
                    <span className="rounded bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 px-1.5 py-0.5 text-[9px] font-bold">
                      {c.month} {c.year}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {c.date} &bull; {c.time}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 font-sans text-sm">+{currencySymbol}{c.amount}</span>
                    <div className="text-[9px] font-bold font-mono text-gray-400">{c.id}</div>
                  </div>
                  {onDeleteCollection && (
                    <button 
                      onClick={() => setCollectionToDelete(c)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-800 transition"
                      title="Delete Collection Record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ==========================================
          DELETE COLLECTION CONFIRMATION MODAL
      ========================================== */}
      {collectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-950/50">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Collection Record</h3>
                <p className="text-xs text-gray-500">Confirm payment contribution removal</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete payment record <span className="font-mono font-bold text-teal-600">{collectionToDelete.id}</span> of <span className="font-bold text-emerald-600">{currencySymbol}{collectionToDelete.amount}</span> for <span className="font-bold text-gray-900 dark:text-white">{collectionToDelete.memberName}</span> ({collectionToDelete.month} {collectionToDelete.year})?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCollectionToDelete(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    if (onDeleteCollection) {
                      await onDeleteCollection(collectionToDelete.id);
                    }
                    setCollectionToDelete(null);
                  } catch (e: any) {
                    alert(e.message || 'Failed to delete collection.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
