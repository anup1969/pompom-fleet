'use client';

import { useState } from 'react';

/* ──────────────── Demo Data ──────────────── */
interface FuelEntry {
  id: number;
  date: string;
  dateISO: string;
  bus: string;
  station: string;
  litres: number;
  rate: string;
  amount: string;
  odo: string;
  mileage: string;
  mileageColor: string;
  remarks: string;
}

const DEMO_FUEL: FuelEntry[] = [
  { id: 1, date: '12 Mar 2026', dateISO: '2026-03-12', bus: 'GJ-01-TX-5501', station: 'HP Isanpur, Ahmedabad', litres: 65, rate: '\u20B989.5', amount: '\u20B95,818', odo: '38,520 km', mileage: '4.6 km/L', mileageColor: 'var(--success)', remarks: 'Full tank' },
  { id: 2, date: '11 Mar 2026', dateISO: '2026-03-11', bus: 'GJ-01-TX-5503', station: 'Indian Oil Narol, Ahmedabad', litres: 70, rate: '\u20B988.2', amount: '\u20B96,174', odo: '56,100 km', mileage: '4.3 km/L', mileageColor: 'var(--success)', remarks: '\u2014' },
  { id: 3, date: '9 Mar 2026', dateISO: '2026-03-09', bus: 'GJ-01-TX-5507', station: 'Reliance Bopal, Ahmedabad', litres: 55, rate: '\u20B987.9', amount: '\u20B94,835', odo: '44,480 km', mileage: '3.8 km/L', mileageColor: 'var(--warning)', remarks: 'City traffic heavy' },
  { id: 4, date: '7 Mar 2026', dateISO: '2026-03-07', bus: 'GJ-01-TX-5502', station: 'HP Satellite, Ahmedabad', litres: 60, rate: '\u20B989.5', amount: '\u20B95,370', odo: '42,400 km', mileage: '3.2 km/L', mileageColor: 'var(--error)', remarks: 'Engine check needed' },
  { id: 5, date: '5 Mar 2026', dateISO: '2026-03-05', bus: 'GJ-01-TX-5505', station: 'Essar Chandkheda, Ahmedabad', litres: 72, rate: '\u20B986.8', amount: '\u20B96,250', odo: '61,550 km', mileage: '4.5 km/L', mileageColor: 'var(--success)', remarks: 'Full tank, highway run' },
];

const BUSES = ['GJ-01-TX-5501', 'GJ-01-TX-5502', 'GJ-01-TX-5503', 'GJ-01-TX-5504', 'GJ-01-TX-5505', 'GJ-01-TX-5507'];

export default function FuelPage() {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [busFilter, setBusFilter] = useState('');

  const periodTabs = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  const filtered = DEMO_FUEL.filter((f) => {
    if (busFilter && f.bus !== busFilter) return false;
    return true;
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3>Fuel Log</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 180, height: 38 }}
            value={busFilter}
            onChange={(e) => setBusFilter(e.target.value)}
          >
            <option value="">All Buses</option>
            {BUSES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <button className="btn btn-outline btn-sm">{'\uD83D\uDCE5'} Export</button>
          <button className="btn btn-primary btn-sm">+ Add Fuel Entry</button>
        </div>
      </div>
      <div className="card-body">
        {/* Tab Pill Filters */}
        <div className="tab-pills">
          {periodTabs.map((t) => (
            <button
              key={t.key}
              className={`tab-pill${periodFilter === t.key ? ' active' : ''}`}
              onClick={() => setPeriodFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Summary Boxes */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
          <div className="stat-card bg-primary">
            <div className="stat-icon">{'\u26FD'}</div>
            <div className="stat-value">2,450 L</div>
            <div className="stat-label">Total Fuel</div>
          </div>
          <div className="stat-card bg-error">
            <div className="stat-icon">{'\u20B9'}</div>
            <div className="stat-value">{'\u20B9'}2,15,600</div>
            <div className="stat-label">Total Cost</div>
          </div>
          <div className="stat-card bg-success">
            <div className="stat-icon">{'\uD83D\uDE97'}</div>
            <div className="stat-value">4.2 km/L</div>
            <div className="stat-label">Avg Mileage</div>
          </div>
          <div className="stat-card bg-accent">
            <div className="stat-icon">{'\uD83D\uDCC8'}</div>
            <div className="stat-value">{'\u20B9'}88.0/L</div>
            <div className="stat-label">Avg Rate</div>
          </div>
        </div>

        {/* Fuel Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bus No</th>
                <th>Fuel Station</th>
                <th>Litres</th>
                <th>Rate/L</th>
                <th>Amount ({'\u20B9'})</th>
                <th>Odo Reading</th>
                <th>Mileage (km/L)</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td>{f.date}</td>
                  <td>
                    <a className="clickable-link">{f.bus}</a>
                  </td>
                  <td>{f.station}</td>
                  <td>{f.litres}</td>
                  <td>{f.rate}</td>
                  <td style={{ fontWeight: 600 }}>{f.amount}</td>
                  <td>{f.odo}</td>
                  <td>
                    <span style={{ color: f.mileageColor, fontWeight: 600 }}>{f.mileage}</span>
                  </td>
                  <td>{f.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Total: 322 Litres &middot; {'\u20B9'}28,447
        </div>
      </div>
    </div>
  );
}
