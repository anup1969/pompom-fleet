'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

interface BusProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Demo Data ─── */
const BUS = {
  vehicleNo: 'GJ-01-TX-5501',
  make: 'Tata Starbus',
  chassis: 'MAT449001',
  engine: 'ENG880101',
  seats: 52,
  odometer: '38,200 km',
  passingDue: '11 Apr 2026',
  pucDue: '15 Jun 2026',
  serviceDue: '40,000 km',
  status: 'Active',
  registeredOn: '14 Mar 2021',
  insuranceExpiry: '22 Sep 2026',
  insuranceProvider: 'New India Assurance',
  policyNo: 'NIA-2026-441',
};

const DOCUMENTS = [
  { name: 'RC Book', type: 'PDF', uploaded: '14 Mar 2021', size: '1.2 MB' },
  { name: 'Insurance', type: 'PDF', uploaded: '22 Sep 2025', size: '890 KB' },
];

const EXPENSES = [
  { id: 1, date: '12 Mar 2026', head: 'Diesel', amount: 4200, vendor: 'HP Petrol Pump', payment: 'Cash' },
  { id: 2, date: '5 Mar 2026', head: 'Washing', amount: 600, vendor: 'In-house', payment: 'Cash' },
  { id: 3, date: '28 Feb 2026', head: 'Diesel', amount: 3950, vendor: 'Indian Oil', payment: 'UPI' },
  { id: 4, date: '20 Feb 2026', head: 'Repairs', amount: 3800, vendor: 'Sharma Auto', payment: 'Cash' },
  { id: 5, date: '15 Feb 2026', head: 'Diesel', amount: 4100, vendor: 'HP Petrol Pump', payment: 'Cash' },
];

type TabKey = 'details' | 'documents' | 'expenses';
type PeriodKey = 'month' | 'year' | 'all';

export default function BusProfileModal({ isOpen, onClose }: BusProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const [period, setPeriod] = useState<PeriodKey>('month');

  const totalExpense = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const fuelTotal = EXPENSES.filter((e) => e.head === 'Diesel').reduce((s, e) => s + e.amount, 0);
  const maintTotal = totalExpense - fuelTotal;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'documents', label: 'Documents' },
    { key: 'expenses', label: 'Expenses' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bus Profile \u2014 ${BUS.vehicleNo}`}
      wide
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-outline">Renew Insurance</button>
          <button className="btn btn-primary">Edit Bus</button>
        </>
      }
    >
      {/* Tabs */}
      <div className="modal-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`modal-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="two-col">
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Vehicle Number</div>
              <div style={{ fontWeight: 600 }}>{BUS.vehicleNo}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Make / Model</div>
              <div style={{ fontWeight: 600 }}>{BUS.make}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Chassis No</div>
              <div>{BUS.chassis}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Engine No</div>
              <div>{BUS.engine}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Seats</div>
              <div>{BUS.seats}</div>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Odometer</div>
              <div style={{ fontWeight: 600 }}>{BUS.odometer}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Passing Due</div>
              <div>{BUS.passingDue}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>PUC Due</div>
              <div>{BUS.pucDue}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Next Service</div>
              <div>{BUS.serviceDue}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Status</div>
              <span className="badge badge-success">{BUS.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {DOCUMENTS.map((doc) => (
            <div
              key={doc.name}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>&#128196;</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{doc.name}</div>
              <div style={{ fontSize: 11, color: 'var(--bodytext)' }}>
                {doc.type} &middot; {doc.size}
              </div>
              <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 2 }}>
                Uploaded {doc.uploaded}
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }}>
                View
              </button>
            </div>
          ))}
          <div
            className="file-upload"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 140,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
            <div>Upload Document</div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <>
          {/* Period Filter */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content' }}>
            {([['month', 'This Month'], ['year', 'This Year'], ['all', 'All Time']] as [PeriodKey, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  className={`bus-exp-btn${period === key ? ' active' : ''}`}
                  onClick={() => setPeriod(key)}
                >
                  {label}
                </button>
              ),
            )}
          </div>

          {/* Summary Cards */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
            <div className="stat-card bg-primary">
              <div className="stat-icon">&#8377;</div>
              <div className="stat-value">&#8377;{totalExpense.toLocaleString('en-IN')}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card bg-accent">
              <div className="stat-icon">&#9981;</div>
              <div className="stat-value">&#8377;{fuelTotal.toLocaleString('en-IN')}</div>
              <div className="stat-label">Fuel</div>
            </div>
            <div className="stat-card bg-info">
              <div className="stat-icon">&#128295;</div>
              <div className="stat-value">&#8377;{maintTotal.toLocaleString('en-IN')}</div>
              <div className="stat-label">Maintenance</div>
            </div>
          </div>

          {/* Expense Table */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Head</th>
                  <th>Amount</th>
                  <th>Vendor</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {EXPENSES.map((exp, idx) => (
                  <tr key={exp.id}>
                    <td>{idx + 1}</td>
                    <td>{exp.date}</td>
                    <td>
                      <span className={`badge ${exp.head === 'Diesel' ? 'badge-warning' : exp.head === 'Repairs' ? 'badge-info' : 'badge-primary'}`}>
                        {exp.head}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>&#8377;{exp.amount.toLocaleString('en-IN')}</td>
                    <td>{exp.vendor}</td>
                    <td>{exp.payment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
}
