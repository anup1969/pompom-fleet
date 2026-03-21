'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/Modal';
import { useSession } from '@/lib/session-context';

interface ExpenseHead {
  id: string;
  name: string;
}

interface Bus {
  id: string;
  vehicle_no: string;
}

interface EditExpense {
  id: string;
  expense_date: string;
  bus_id: string | null;
  expense_head_id: string | null;
  amount: number;
  vendor: string | null;
  payment_mode: string | null;
  bill_no: string | null;
  remarks: string | null;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  editExpense?: EditExpense | null;
}

const PAYMENT_MODES = ['Cash', 'UPI', 'Cheque', 'Bank Transfer'];

export default function AddExpenseModal({ isOpen, onClose, onSaved, editExpense }: AddExpenseModalProps) {
  const { tenant } = useSession();

  const [buses, setBuses] = useState<Bus[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<ExpenseHead[]>([]);

  const [busId, setBusId] = useState('');
  const [expenseHeadId, setExpenseHeadId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [billNo, setBillNo] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  /* ── Load buses and expense heads ── */
  const loadOptions = useCallback(async () => {
    if (!tenant?.id) return;
    const [busRes, headRes] = await Promise.all([
      fetch(`/api/buses?tenant_id=${tenant.id}`),
      fetch(`/api/expense-heads?tenant_id=${tenant.id}`),
    ]);
    if (busRes.ok) setBuses(await busRes.json());
    if (headRes.ok) setExpenseHeads(await headRes.json());
  }, [tenant?.id]);

  useEffect(() => {
    if (isOpen) loadOptions();
  }, [isOpen, loadOptions]);

  /* ── Prefill when editing ── */
  useEffect(() => {
    if (isOpen && editExpense) {
      setBusId(editExpense.bus_id ?? '');
      setExpenseHeadId(editExpense.expense_head_id ?? '');
      setAmount(String(editExpense.amount ?? ''));
      setDate(editExpense.expense_date ?? '');
      setVendor(editExpense.vendor ?? '');
      setPaymentMode(editExpense.payment_mode ?? '');
      setBillNo(editExpense.bill_no ?? '');
      setNotes(editExpense.remarks ?? '');
    } else if (isOpen) {
      setBusId('');
      setExpenseHeadId('');
      setAmount('');
      setDate('');
      setVendor('');
      setPaymentMode('');
      setBillNo('');
      setNotes('');
    }
  }, [isOpen, editExpense]);

  async function handleSave() {
    if (!tenant?.id || !amount || !date) return;
    setSaving(true);

    const payload = {
      tenant_id: tenant.id,
      bus_id: busId || null,
      expense_head_id: expenseHeadId || null,
      amount: parseFloat(amount),
      expense_date: date,
      vendor: vendor || null,
      payment_mode: paymentMode || null,
      bill_no: billNo || null,
      remarks: notes || null,
    };

    try {
      const url = editExpense ? `/api/expenses/${editExpense.id}` : '/api/expenses';
      const method = editExpense ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSaved?.();
      } else {
        const err = await res.json();
        alert(err.error ?? 'Failed to save');
      }
    } catch {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editExpense ? 'Edit Expense' : 'Add New Expense'}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editExpense ? 'Update Expense' : 'Save Expense'}
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Bus</label>
          <select className="form-select" value={busId} onChange={(e) => setBusId(e.target.value)}>
            <option value="">Select Bus</option>
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.vehicle_no}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Expense Head</label>
          <select className="form-select" value={expenseHeadId} onChange={(e) => setExpenseHeadId(e.target.value)}>
            <option value="">Select Head</option>
            {expenseHeads.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Amount (&#8377;)</label>
          <input
            className="form-input"
            type="number"
            placeholder="e.g. 4200"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Vendor</label>
          <input
            className="form-input"
            placeholder="e.g. HP Petrol Pump"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Mode</label>
          <select className="form-select" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
            <option value="">Select Mode</option>
            {PAYMENT_MODES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Bill Number</label>
        <input
          className="form-input"
          placeholder="e.g. HP-38201"
          value={billNo}
          onChange={(e) => setBillNo(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea
          className="form-input"
          placeholder="Additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
}
