'use client';

import { useState } from 'react';

/* ──────────────── Demo Data ──────────────── */
const EXPENSE_HEADS = [
  { icon: '\u26FD', label: 'Diesel' },
  { icon: '\uD83D\uDD27', label: 'Repairs' },
  { icon: '\u2B24', label: 'Tyres' },
  { icon: '\uD83D\uDCC4', label: 'Insurance' },
  { icon: '\uD83D\uDCB0', label: 'Salary' },
  { icon: '\uD83D\uDCA7', label: 'Washing' },
  { icon: '\uD83D\uDCE6', label: 'Misc' },
];

interface Expense {
  id: number;
  date: string;
  bus: string;
  head: string;
  headBadge: string;
  amount: string;
  vendor: string;
  billNo: string;
  payment: string;
  remarks: string;
}

const DEMO_EXPENSES: Expense[] = [
  { id: 1, date: '12 Mar 2026', bus: 'GJ-01-TX-5501', head: 'Diesel', headBadge: 'badge-warning', amount: '\u20B94,200', vendor: 'HP Petrol Pump', billNo: 'HP-38201', payment: 'Cash', remarks: '65 litres @ \u20B964.6' },
  { id: 2, date: '10 Mar 2026', bus: 'GJ-01-TX-5503', head: 'Tyres', headBadge: 'badge-error', amount: '\u20B912,500', vendor: 'Sharma Tyres', billNo: 'ST-0089', payment: 'UPI', remarks: '2 rear tyres replaced' },
  { id: 3, date: '9 Mar 2026', bus: 'GJ-01-TX-5506', head: 'Repairs', headBadge: 'badge-info', amount: '\u20B93,800', vendor: 'HP Petrol Pump', billNo: 'HP-38195', payment: 'Cash', remarks: 'Engine oil + filter change' },
  { id: 4, date: '8 Mar 2026', bus: 'GJ-01-TX-5502', head: 'Washing', headBadge: 'badge-primary', amount: '\u20B9600', vendor: 'In-house', billNo: '\u2014', payment: 'Cash', remarks: 'Full wash + interior' },
  { id: 5, date: '7 Mar 2026', bus: 'GJ-01-TX-5505', head: 'Diesel', headBadge: 'badge-warning', amount: '\u20B93,950', vendor: 'Indian Oil', billNo: 'IO-9921', payment: 'UPI', remarks: '60 litres @ \u20B965.8' },
  { id: 6, date: '5 Mar 2026', bus: 'GJ-01-TX-5504', head: 'Insurance', headBadge: 'badge-success', amount: '\u20B918,200', vendor: 'New India Assurance', billNo: 'NIA-2026-441', payment: 'Cheque', remarks: 'Annual premium renewal' },
  { id: 7, date: '3 Mar 2026', bus: 'GJ-01-TX-5507', head: 'Diesel', headBadge: 'badge-warning', amount: '\u20B94,550', vendor: 'HP Petrol Pump', billNo: 'HP-38180', payment: 'Cash', remarks: '70 litres @ \u20B965' },
];

const BUSES = ['GJ-01-TX-5501', 'GJ-01-TX-5502', 'GJ-01-TX-5503', 'GJ-01-TX-5504', 'GJ-01-TX-5505', 'GJ-01-TX-5507'];
const HEADS = ['Diesel', 'Repairs', 'Tyres', 'Insurance', 'Salary', 'Washing', 'Misc'];
const MONTHS = ['March 2026', 'February 2026', 'January 2026'];

export default function ExpensesPage() {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [busFilter, setBusFilter] = useState('');
  const [headFilter, setHeadFilter] = useState('');

  const filtered = DEMO_EXPENSES.filter((e) => {
    if (busFilter && e.bus !== busFilter) return false;
    if (headFilter && e.head !== headFilter) return false;
    return true;
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3>Expense Tracker</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm">+ Expense Heads</button>
          <button className="btn btn-primary btn-sm">+ Add Expense</button>
        </div>
      </div>
      <div className="card-body">
        {/* Expense Head Chips */}
        <div className="chip-row">
          {EXPENSE_HEADS.map((h) => (
            <button key={h.label} className="chip">
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
              {BUSES.map((b) => (
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
              {HEADS.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Month</label>
            <select className="form-select" style={{ width: 150 }}>
              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-outline btn-sm">{'\uD83D\uDCE5'} Export</button>
          </div>
        </div>

        {/* Expense Table */}
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
              {filtered.map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.id}</td>
                  <td>{exp.date}</td>
                  <td>
                    <a className="clickable-link">{exp.bus}</a>
                  </td>
                  <td>
                    <span className={`badge ${exp.headBadge}`}>{exp.head}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{exp.amount}</td>
                  <td>{exp.vendor}</td>
                  <td>{exp.billNo}</td>
                  <td>{exp.payment}</td>
                  <td>{exp.remarks}</td>
                  <td>
                    <div className="action-wrap">
                      <button
                        className="btn-icon"
                        onClick={() => setOpenMenu(openMenu === exp.id ? null : exp.id)}
                      >
                        &#8942;
                      </button>
                      <div className={`action-menu${openMenu === exp.id ? ' show' : ''}`}>
                        <button onClick={() => setOpenMenu(null)}>&#9998; Edit</button>
                        <button className="danger" onClick={() => setOpenMenu(null)}>
                          {'\uD83D\uDDD1'} Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Total: {'\u20B9'}47,800</div>
      </div>
    </div>
  );
}
