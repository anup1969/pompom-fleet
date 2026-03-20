'use client';

import { useState } from 'react';

/* ──────────────── Types ──────────────── */
interface ExpenseHead {
  id: string;
  name: string;
  color: string; // Tailwind bg class
}

interface Expense {
  id: string;
  date: string; // ISO
  bus: string;
  head: string;
  vendor: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  notes?: string;
}

interface SummaryCard {
  label: string;
  amount: string;
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
}

/* ──────────────── Demo Data ──────────────── */
const EXPENSE_HEADS: ExpenseHead[] = [
  { id: '1', name: 'Diesel', color: 'bg-primary/10 text-primary' },
  { id: '2', name: 'Repairs', color: 'bg-error/10 text-error' },
  { id: '3', name: 'Tyres', color: 'bg-dark/10 text-dark' },
  { id: '4', name: 'Insurance', color: 'bg-accent/10 text-accent' },
  { id: '5', name: 'Salary', color: 'bg-success/10 text-success' },
  { id: '6', name: 'Washing', color: 'bg-[#06b6d4]/10 text-[#06b6d4]' },
  { id: '7', name: 'Misc', color: 'bg-bodytext/10 text-bodytext' },
];

const DEMO_EXPENSES: Expense[] = [
  {
    id: '1',
    date: '2026-03-18',
    bus: 'GJ-01-AB-1234',
    head: 'Diesel',
    vendor: 'Indian Oil — Ring Road',
    amount: 12500,
    paymentMode: 'UPI',
  },
  {
    id: '2',
    date: '2026-03-17',
    bus: 'GJ-01-CD-5678',
    head: 'Repairs',
    vendor: 'Patel Auto Garage',
    amount: 8400,
    paymentMode: 'Cash',
    notes: 'Brake pad replacement',
  },
  {
    id: '3',
    date: '2026-03-16',
    bus: 'GJ-01-EF-9012',
    head: 'Tyres',
    vendor: 'JK Tyre Dealer',
    amount: 18600,
    paymentMode: 'Bank Transfer',
    notes: '2 rear tyres replaced',
  },
  {
    id: '4',
    date: '2026-03-15',
    bus: 'GJ-01-GH-3456',
    head: 'Insurance',
    vendor: 'New India Assurance',
    amount: 24000,
    paymentMode: 'Cheque',
  },
  {
    id: '5',
    date: '2026-03-14',
    bus: 'GJ-01-AB-1234',
    head: 'Diesel',
    vendor: 'HP Petrol Pump — SG Hwy',
    amount: 11200,
    paymentMode: 'UPI',
  },
  {
    id: '6',
    date: '2026-03-13',
    bus: 'GJ-01-IJ-7890',
    head: 'Washing',
    vendor: 'City Bus Wash',
    amount: 800,
    paymentMode: 'Cash',
  },
  {
    id: '7',
    date: '2026-03-12',
    bus: 'GJ-01-KL-2345',
    head: 'Repairs',
    vendor: 'Sharma Motors',
    amount: 15300,
    paymentMode: 'Bank Transfer',
    notes: 'Clutch plate + labour',
  },
  {
    id: '8',
    date: '2026-03-11',
    bus: 'GJ-01-CD-5678',
    head: 'Misc',
    vendor: 'Ambika Stores',
    amount: 2200,
    paymentMode: 'Cash',
    notes: 'First aid kit + fire extinguisher refill',
  },
];

/* ──────────────── Helpers ──────────────── */
function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return '\u20B9' + (amount / 100000).toFixed(2) + 'L';
  }
  if (amount >= 1000) {
    return '\u20B9' + (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'K';
  }
  return '\u20B9' + amount.toLocaleString('en-IN');
}

function formatAmount(amount: number): string {
  return '\u20B9' + amount.toLocaleString('en-IN');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getHeadColor(headName: string): string {
  return EXPENSE_HEADS.find((h) => h.name === headName)?.color ?? 'bg-bodytext/10 text-bodytext';
}

function getPaymentBadge(mode: Expense['paymentMode']): string {
  const map: Record<string, string> = {
    Cash: 'bg-success/10 text-success',
    UPI: 'bg-primary/10 text-primary',
    'Bank Transfer': 'bg-accent/10 text-accent',
    Cheque: 'bg-dark/10 text-dark',
  };
  return map[mode] ?? 'bg-bodytext/10 text-bodytext';
}

/* ──────────────── Summary Cards ──────────────── */
const SUMMARY_CARDS: SummaryCard[] = [
  {
    label: 'Total Expenses',
    amount: '\u20B91.48L',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Fuel',
    amount: '\u20B968K',
    bgClass: 'bg-accent/10',
    textClass: 'text-accent',
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16M3 10h12M17 22V10l4-3v11" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Maintenance',
    amount: '\u20B942K',
    bgClass: 'bg-error/10',
    textClass: 'text-error',
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Other',
    amount: '\u20B938K',
    bgClass: 'bg-success/10',
    textClass: 'text-success',
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
];

/* ──────────────── Page ──────────────── */
export default function ExpensesPage() {
  const [filterHead, setFilterHead] = useState<string>('All');

  const filteredExpenses = filterHead === 'All'
    ? DEMO_EXPENSES
    : DEMO_EXPENSES.filter((e) => e.head === filterHead);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Expense Tracker</h1>
          <p className="text-sm text-bodytext mt-1">
            Track and manage fleet expenses across all buses
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-[10px] hover:bg-primary/90 transition-colors shadow-sm">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {SUMMARY_CARDS.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-border p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0 ${card.bgClass} ${card.textClass}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[12px] text-bodytext font-medium uppercase tracking-wider">{card.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${card.textClass}`}>{card.amount}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Expense Heads Master */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-dark uppercase tracking-wider">Expense Heads</h2>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add Head
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterHead('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterHead === 'All'
                ? 'bg-dark text-white'
                : 'bg-lightgray text-bodytext hover:bg-dark/10 hover:text-dark'
            }`}
          >
            All
          </button>
          {EXPENSE_HEADS.map((head) => (
            <button
              key={head.id}
              onClick={() => setFilterHead(head.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterHead === head.name
                  ? 'bg-dark text-white'
                  : `${head.color} hover:opacity-80`
              }`}
            >
              {head.name}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-lightgray">
                <th className="text-left px-5 py-3 text-[11px] text-bodytext uppercase tracking-wider font-semibold">Date</th>
                <th className="text-left px-5 py-3 text-[11px] text-bodytext uppercase tracking-wider font-semibold">Bus</th>
                <th className="text-left px-5 py-3 text-[11px] text-bodytext uppercase tracking-wider font-semibold">Head</th>
                <th className="text-left px-5 py-3 text-[11px] text-bodytext uppercase tracking-wider font-semibold">Vendor</th>
                <th className="text-right px-5 py-3 text-[11px] text-bodytext uppercase tracking-wider font-semibold">Amount</th>
                <th className="text-left px-5 py-3 text-[11px] text-bodytext uppercase tracking-wider font-semibold">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense, idx) => (
                <tr
                  key={expense.id}
                  className={`border-b border-border last:border-b-0 hover:bg-lightgray/50 transition-colors ${
                    idx % 2 === 0 ? '' : 'bg-lightgray/30'
                  }`}
                >
                  <td className="px-5 py-3.5 text-sm text-dark whitespace-nowrap">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-sm font-medium text-dark hover:text-primary transition-colors cursor-pointer">
                      {expense.bus}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getHeadColor(expense.head)}`}>
                      {expense.head}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-dark">{expense.vendor}</p>
                    {expense.notes && (
                      <p className="text-[11px] text-bodytext mt-0.5">{expense.notes}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-semibold text-dark">{formatAmount(expense.amount)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getPaymentBadge(expense.paymentMode)}`}>
                      {expense.paymentMode}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-lightgray/50">
          <p className="text-xs text-bodytext">
            Showing {filteredExpenses.length} of {DEMO_EXPENSES.length} entries
          </p>
          <p className="text-sm font-bold text-dark">
            Total: {formatAmount(filteredExpenses.reduce((sum, e) => sum + e.amount, 0))}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {filteredExpenses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-lightgray flex items-center justify-center mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-bodytext">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm text-bodytext">No expenses found for this category.</p>
        </div>
      )}
    </div>
  );
}
