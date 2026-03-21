'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BUSES = [
  'GJ-01-TX-5501',
  'GJ-01-TX-5502',
  'GJ-01-TX-5503',
  'GJ-01-TX-5504',
  'GJ-01-TX-5505',
  'GJ-01-TX-5507',
];

const EXPENSE_HEADS = ['Diesel', 'Repairs', 'Tyres', 'Insurance', 'Salary', 'Washing', 'Misc'];
const VENDORS = [
  'HP Petrol Pump',
  'Indian Oil',
  'Sharma Tyres',
  'New India Assurance',
  'In-house',
];
const PAYMENT_MODES = ['Cash', 'UPI', 'Cheque', 'Bank Transfer'];

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const [bus, setBus] = useState('');
  const [expenseHead, setExpenseHead] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [billNo, setBillNo] = useState('');
  const [notes, setNotes] = useState('');

  function handleSave() {
    // Will wire to API later
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Expense"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Expense
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Bus</label>
          <select className="form-select" value={bus} onChange={(e) => setBus(e.target.value)}>
            <option value="">Select Bus</option>
            {BUSES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Expense Head</label>
          <select className="form-select" value={expenseHead} onChange={(e) => setExpenseHead(e.target.value)}>
            <option value="">Select Head</option>
            {EXPENSE_HEADS.map((h) => (
              <option key={h}>{h}</option>
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
          <select className="form-select" value={vendor} onChange={(e) => setVendor(e.target.value)}>
            <option value="">Select Vendor</option>
            {VENDORS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
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
