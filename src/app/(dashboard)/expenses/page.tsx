'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from '@/lib/session-context';
import { useRouter } from 'next/navigation';
import AddExpenseModal from '@/components/modals/AddExpenseModal';

/* ──────────────── Types ──────────────── */
interface ExpenseHead {
  id: string;
  name: string;
  icon?: string;
}

interface Expense {
  id: string;
  expense_date: string;
  vehicle_no: string | null;
  head_name: string | null;
  expense_head_id: string | null;
  bus_id: string | null;
  amount: number;
  vendor: string | null;
  bill_no: string | null;
  payment_mode: string | null;
  remarks: string | null;
}

const HEAD_BADGE_MAP: Record<string, string> = {
  Diesel: 'badge-warning',
  Repairs: 'badge-info',
  Tyres: 'badge-error',
  Insurance: 'badge-success',
  Salary: 'badge-primary',
  Washing: 'badge-primary',
  Misc: 'badge-secondary',
};

const HEAD_ICON_MAP: Record<string, string> = {
  Diesel: '\u26FD',
  Repairs: '\uD83D\uDD27',
  Tyres: '\u2B24',
  Insurance: '\uD83D\uDCC4',
  Salary: '\uD83D\uDCB0',
  Washing: '\uD83D\uDCA7',
  Misc: '\uD83D\uDCE6',
};

function formatCurrency(n: number) {
  return '\u20B9' + n.toLocaleString('en-IN');
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ─── Action Menu ─── */
function ActionMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="action-wrap" ref={ref}>
      <button className="btn-icon" onClick={() => setOpen(!open)}>
        &#8942;
      </button>
      <div className={`action-menu${open ? ' show' : ''}`}>
        <button
          onClick={() => {
            onEdit();
            setOpen(false);
          }}
        >
          &#9998; Edit
        </button>
        <button
          className="danger"
          onClick={() => {
            onDelete();
            setOpen(false);
          }}
        >
          {'\uD83D\uDDD1'} Delete
        </button>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const { tenant } = useSession();
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<ExpenseHead[]>([]);
  const [loading, setLoading] = useState(true);

  const [busFilter, setBusFilter] = useState('');
  const [headFilter, setHeadFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  /* ── Fetch expenses ── */
  const fetchExpenses = useCallback(async () => {
    if (!tenant?.id) return;
    try {
      const res = await fetch(`/api/expenses?tenant_id=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch {
      // silent
    }
  }, [tenant?.id]);

  /* ── Fetch expense heads ── */
  const fetchHeads = useCallback(async () => {
    if (!tenant?.id) return;
    try {
      const res = await fetch(`/api/expense-heads?tenant_id=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setExpenseHeads(data);
      }
    } catch {
      // silent
    }
  }, [tenant?.id]);

  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    Promise.all([fetchExpenses(), fetchHeads()]).finally(() => setLoading(false));
  }, [tenant?.id, fetchExpenses, fetchHeads]);

  /* ── Derived ── */
  const uniqueBuses = Array.from(new Set(expenses.map((e) => e.vehicle_no).filter(Boolean))) as string[];
  const uniqueHeads = Array.from(new Set(expenses.map((e) => e.head_name).filter(Boolean))) as string[];

  const filtered = expenses.filter((e) => {
    if (busFilter && e.vehicle_no !== busFilter) return false;
    if (headFilter && e.head_name !== headFilter) return false;
    return true;
  });

  const total = filtered.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  /* ── Delete ── */
  async function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return;
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  }

  /* ── After modal save ── */
  function handleModalSaved() {
    setModalOpen(false);
    setEditingExpense(null);
    fetchExpenses();
  }

  /* ── Chip row data ── */
  const chipHeads =
    expenseHeads.length > 0
      ? expenseHeads.map((h) => ({ icon: HEAD_ICON_MAP[h.name] ?? '\uD83D\uDCE6', label: h.name }))
      : Object.entries(HEAD_ICON_MAP).map(([label, icon]) => ({ icon, label }));

  if (loading) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: 60, color: 'var(--bodytext)' }}>
          Loading expenses...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Expense Tracker</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline btn-sm" onClick={() => router.push('/masters')}>
              + Expense Heads
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingExpense(null);
                setModalOpen(true);
              }}
            >
              + Add Expense
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Expense Head Chips */}
          <div className="chip-row">
            {chipHeads.map((h) => (
              <button
                key={h.label}
                className="chip"
                onClick={() => setHeadFilter(headFilter === h.label ? '' : h.label)}
                style={headFilter === h.label ? { outline: '2px solid var(--primary)' } : undefined}
              >
                {h.icon} {h.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="filter-row">
            <div>
              <label className="form-label">Bus</label>
              <select
                className="form-select"
                style={{ width: 180 }}
                value={busFilter}
                onChange={(e) => setBusFilter(e.target.value)}
              >
                <option value="">All Buses</option>
                {uniqueBuses.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Head</label>
              <select
                className="form-select"
                style={{ width: 160 }}
                value={headFilter}
                onChange={(e) => setHeadFilter(e.target.value)}
              >
                <option value="">All Heads</option>
                {uniqueHeads.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-outline btn-sm">{'\uD83D\uDCE5'} Export</button>
            </div>
          </div>

          {/* Expense Table */}
          {expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--bodytext)' }}>
              No expenses recorded yet. Click &quot;+ Add Expense&quot; to get started.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Bus</th>
                    <th>Head</th>
                    <th>Amount ({'\u20B9'})</th>
                    <th>Vendor</th>
                    <th>Bill No</th>
                    <th>Payment</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((exp, idx) => (
                    <tr key={exp.id}>
                      <td>{idx + 1}</td>
                      <td>{formatDate(exp.expense_date)}</td>
                      <td>
                        <a className="clickable-link">{exp.vehicle_no ?? '\u2014'}</a>
                      </td>
                      <td>
                        <span className={`badge ${HEAD_BADGE_MAP[exp.head_name ?? ''] ?? 'badge-secondary'}`}>
                          {exp.head_name ?? '\u2014'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(exp.amount)}</td>
                      <td>{exp.vendor ?? '\u2014'}</td>
                      <td>{exp.bill_no ?? '\u2014'}</td>
                      <td>{exp.payment_mode ?? '\u2014'}</td>
                      <td>{exp.remarks ?? '\u2014'}</td>
                      <td>
                        <ActionMenu
                          onEdit={() => {
                            setEditingExpense(exp);
                            setModalOpen(true);
                          }}
                          onDelete={() => handleDelete(exp.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 0 && <div className="table-footer">Total: {formatCurrency(total)}</div>}
        </div>
      </div>

      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(null);
        }}
        onSaved={handleModalSaved}
        editExpense={editingExpense}
      />
    </>
  );
}
