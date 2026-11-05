import React, { useState } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowDownLeft, 
  ArrowUpRight,
  Database,
  Trash2,
  Loader2
} from 'lucide-react';
import { Transaction } from '../types.js';

interface TransactionLedgerProps {
  transactions: Transaction[];
  currencySymbol: string;
  onDeleteCollection?: (id: string) => Promise<void>;
  onDeleteExpense?: (id: string) => Promise<void>;
}

export default function TransactionLedger({
  transactions,
  currencySymbol,
  onDeleteCollection,
  onDeleteExpense
}: TransactionLedgerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'collection' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 8;

  // 1. Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.memberOrTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || t.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // 2. Sort transactions
  const sortedTransactions = filteredTransactions.sort((a, b) => {
    let comp = 0;
    if (sortBy === 'date') {
      const dtA = new Date(`${a.date}T${a.time}`).getTime();
      const dtB = new Date(`${b.date}T${b.time}`).getTime();
      comp = dtA - dtB;
    } else if (sortBy === 'amount') {
      comp = a.amount - b.amount;
    }

    return sortOrder === 'asc' ? comp : -comp;
  });

  // 3. Pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Area */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Financial Ledgers</h1>
        <p className="text-xs text-gray-500 font-medium">Verify audits, filter transaction types, trace payments, and paginate historical financial transactions.</p>
      </div>

      {/* 2. Controls Row */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <input 
            id="input_ledger_search"
            type="text"
            placeholder="Search by ID, member, method..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-100 bg-gray-50/50 py-2 pl-9 pr-4 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'collection', 'expense'] as const).map(type => (
            <button 
              key={type}
              onClick={() => {
                setTypeFilter(type);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${typeFilter === type ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300' : 'bg-transparent text-gray-500 hover:bg-gray-50'}`}
            >
              {type === 'all' ? 'All' : type === 'collection' ? 'Deposits' : 'Outflows'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Central Ledger Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 dark:border-gray-800">
                <th className="p-4 font-bold">Transaction ID</th>
                <th className="p-4 font-bold">Ledger Details</th>
                <th 
                  className="p-4 font-bold cursor-pointer hover:text-gray-600 transition flex items-center gap-1 select-none"
                  onClick={() => toggleSort('amount')}
                >
                  Amount <ArrowUpDown className="h-3 w-3" />
                </th>
                <th className="p-4 font-bold">Channel</th>
                <th 
                  className="p-4 font-bold cursor-pointer hover:text-gray-600 transition select-none"
                  onClick={() => toggleSort('date')}
                >
                  <span className="flex items-center gap-1">Timestamp <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="p-4 font-bold">Ledger Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    <Database className="h-10 w-10 mx-auto text-gray-200 mb-2" />
                    No ledger records match search parameter details
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/20">
                    {/* Transaction ID */}
                    <td className="p-4 font-mono font-bold text-gray-800 dark:text-gray-300">
                      {t.id}
                    </td>

                    {/* Member or Title details */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-full p-1 w-fit ${t.type === 'collection' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-red-50 text-red-500 dark:bg-red-950/20'}`}>
                          {t.type === 'collection' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{t.memberOrTitle}</div>
                          <span className="font-mono text-[9px] text-gray-400">Ref: {t.referenceId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className={`p-4 font-bold text-sm ${t.type === 'collection' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.type === 'collection' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                    </td>

                    {/* Channel */}
                    <td className="p-4 font-semibold text-gray-600 dark:text-gray-400">
                      {t.paymentMethod}
                    </td>

                    {/* Timestamp */}
                    <td className="p-4">
                      <div className="font-bold text-gray-700 dark:text-gray-300">{t.date}</div>
                      <div className="text-[10px] text-gray-400">{t.time}</div>
                    </td>

                    {/* Ledger Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        t.status === 'Paid' || t.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setTxToDelete(t)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition dark:hover:bg-gray-800"
                        title="Delete Transaction Record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination block */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800">
            <span className="text-xs text-gray-500">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredTransactions.length} records)
            </span>
            <div className="flex gap-2">
              <button 
                id="btn_prev_page"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded border border-gray-100 bg-white p-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button 
                id="btn_next_page"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded border border-gray-100 bg-white p-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ==========================================
          DELETE TRANSACTION CONFIRMATION MODAL
      ========================================== */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-950/50">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Transaction Entry</h3>
                <p className="text-xs text-gray-500">Confirm transaction record removal from ledger</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete transaction <span className="font-mono font-bold text-teal-600">{txToDelete.id}</span> (<span className="font-bold text-gray-900 dark:text-white">{txToDelete.memberOrTitle}</span>) of <span className="font-bold text-teal-600">{currencySymbol}{txToDelete.amount}</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTxToDelete(null)}
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
                    if (txToDelete.type === 'collection' && onDeleteCollection) {
                      await onDeleteCollection(txToDelete.referenceId);
                    } else if (txToDelete.type === 'expense' && onDeleteExpense) {
                      await onDeleteExpense(txToDelete.referenceId);
                    }
                    setTxToDelete(null);
                  } catch (e: any) {
                    alert(e.message || 'Failed to delete transaction.');
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
