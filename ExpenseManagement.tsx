import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  FileText, 
  Camera, 
  Grid, 
  Folder, 
  Clock, 
  Eye, 
  X, 
  Check, 
  Loader2,
  Calendar
} from 'lucide-react';
import { Expense } from '../types.js';

interface ExpenseManagementProps {
  expenses: Expense[];
  onAddExpense: (expenseData: Omit<Expense, 'id' | 'date' | 'time'>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  currencySymbol: string;
}

export default function ExpenseManagement({
  expenses,
  onAddExpense,
  onDeleteExpense,
  currencySymbol
}: ExpenseManagementProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Meetings');
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null); // For lightbox
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Expense Title is required.');
      return;
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter a brief description.');
      return;
    }

    setIsLoading(true);
    try {
      await onAddExpense({
        title,
        description,
        amount: numAmount,
        category,
        receipt: receiptBase64
      });
      setTitle('');
      setDescription('');
      setAmount('');
      setReceiptBase64(null);
      setIsAddOpen(false);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error occurred while saving expense.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
  };

  // Predefined Categories
  const categories = ['Meetings', 'Charity', 'Utility', 'Welfare', 'Others'];

  // Sum total spent
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Expense Tracker</h1>
          <p className="text-xs text-gray-500">Record fund outflows, manage categorical budgets, and archive digital receipts.</p>
        </div>
        <button
          id="btn_open_expense_modal"
          onClick={() => {
            setErrorMsg('');
            setIsAddOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 w-fit"
        >
          <Plus className="h-4 w-4" /> Record Expense
        </button>
      </div>

      {/* 2. Total Expenditure Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950/40">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400">Total Group Expenditures</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {currencySymbol}{totalExpense.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Expenses List */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Expense Ledger Sheets</h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
          {expenses.length === 0 ? (
            <p className="py-16 text-center text-xs text-gray-400">No expenses recorded yet.</p>
          ) : (
            expenses.slice().reverse().map((exp) => (
              <div 
                key={exp.id} 
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50/30 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded bg-amber-50 p-2 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    <Folder className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">{exp.title}</h3>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-500 uppercase dark:bg-gray-800">
                        {exp.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{exp.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {exp.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {exp.time}</span>
                      <span className="font-semibold font-mono">{exp.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-gray-50 pt-3 sm:border-0 sm:pt-0">
                  <span className="text-base font-bold text-red-600 dark:text-red-400">
                    -{currencySymbol}{exp.amount.toLocaleString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* View Receipt */}
                    {exp.receipt ? (
                      <button 
                        onClick={() => setSelectedReceipt(exp.receipt)}
                        className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-[11px] font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-400"
                        title="View Digital Receipt"
                      >
                        <Eye className="h-3.5 w-3.5" /> Receipt
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic px-2.5">No receipt</span>
                    )}

                    {/* Delete Expense */}
                    <button 
                      onClick={() => handleDeleteClick(exp)}
                      className="rounded-lg bg-gray-50 p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800"
                      title="Delete Record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ==========================================
          ADD EXPENSE MODAL
      ========================================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">Record Fund Outflow</h2>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200 dark:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/30">
                  {errorMsg}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Expense Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Snack for January Meeting"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                />
              </div>

              {/* Amount and Category Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Amount ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0.00"
                    min={1}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Description / Purpose</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={2}
                  placeholder="Detail the expenditure rationale..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white resize-none"
                />
              </div>

              {/* Optional Receipt Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1 flex items-center gap-1">
                  <Camera className="h-4 w-4 text-teal-600" /> Digital Receipt (Optional)
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-300">
                    <Camera className="h-4 w-4" /> Choose File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleReceiptUpload} 
                      className="hidden" 
                    />
                  </label>
                  {receiptBase64 ? (
                    <div className="flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Ready!
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">No receipt chosen</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  id="btn_submit_expense"
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin" />} Save Outflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          RECEIPT LIGHTBOX MODAL
      ========================================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-2xl w-full">
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute -top-10 right-0 flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white hover:bg-white/30"
            >
              <X className="h-4 w-4" /> Close
            </button>
            <div className="rounded-lg bg-white p-2 dark:bg-gray-950 overflow-hidden shadow-2xl">
              <img 
                src={selectedReceipt} 
                alt="Digital Expense Receipt" 
                className="max-h-[80vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE EXPENSE CONFIRMATION MODAL
      ========================================== */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-950/50">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Expense Record</h3>
                <p className="text-xs text-gray-500 font-medium">Confirm expense transaction removal</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete expense <span className="font-bold text-gray-900 dark:text-white">"{expenseToDelete.title}"</span> (<span className="font-mono font-bold text-teal-600">{expenseToDelete.id}</span>) of <span className="font-bold text-red-600">{currencySymbol}{expenseToDelete.amount}</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setExpenseToDelete(null)}
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
                    await onDeleteExpense(expenseToDelete.id);
                    setExpenseToDelete(null);
                  } catch (e: any) {
                    alert(e.message || 'Failed to delete expense.');
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
